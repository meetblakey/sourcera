# Phase 8 — Prompt 8.1 — §32 API Endpoint Coverage & Conventions (Scratch Log)

**Audit baseline.** Master Spec v7.1.0 (2026-04-28). Walk performed 2026-05-07.
**Prompt source.** `Audit_Prompts.md` lines 1916–1951.
**Mnemonic.** `D-V8.1-NNN`.
**Halt rule.** Zero unresolved P0; every P1 carries owner + recommendation.

This file is the per-prompt scratch log; confirmed findings promote into `DEFECT_LEDGER.md` at end of prompt. No edits to `Sourcera_Master_Spec.md` were made (Prompt 8.1 is non-destructive per `Audit_Prompts.md` §10).

---

## 1. Walk Summary

| §32 sub-section | Covered by | Notes |
|---|---|---|
| §32.1 Overview | line 26474 | 2 lines; states base URL + JSON + ISO 8601 |
| §32.2 Auth & Rate-Limit Headers | 26480 | Bearer token form + 4 headers + definitions |
| §32.3 Pagination Model | 26503 | Cursor-based, default 50, max 250, 24h cursor TTL |
| §32.4 Rate Limit Enforcement | 26533 | Per-Org burst + plan-tier monthly + per-user concurrency + `public_pricing_unauth` class |
| §32.5 Endpoints (index list) | 26566 | Method+path index for 14 endpoint families; **no per-endpoint contract detail** |
| §32.6 Error Handling | 26722 | Standard envelope; §32.6.1 Multi-Status (HTTP 207) authored extension |
| §32.7 Acceptance Criteria | 26802 | 7 thin criteria |
| §32.8 Billing Endpoint Detail | 26812 | §32.8.0 conventions + §32.8.1 through §32.8.22 detail blocks + §32.8.23 ACs |
| §32.9 Seller KB Export | 28372 | §32.9.1 / §32.9.2 + §32.9.3 invariants + §32.9.4 ACs (78–100) |

**Coverage observation.** Of the 14 endpoint families listed in §32.5, only **two** receive request/response/error/idempotency/example detail in §32: Billing (§32.8) and Seller KB Export (§32.9). The other 12 families — Workspaces, Requirements, Responses, Scores, Vendors / Target Accounts, Scenarios, Selection Reports, Traceability Matrices, Intelligence, Capability Declarations, Internal Comments, Audit Events, Users & Organization — appear in §32 only as a method+path index. ~49 endpoints carry **zero** authored contract.

---

## 2. Per-Endpoint Convention Walk (Checks 1–8)

### 2.1 Endpoints with full detail (PASS / partial pass)

The §32.8 billing surface (22 sub-sections) and §32.9 KB-export surface (2 sub-sections) carry per-endpoint detail. Per-endpoint pass/fail against the 8 audit checks:

| Endpoint | C1 method/path/scope/RL-class | C2 pagination | C3 request schema | C4 response schema | C5 errors→Appx-I | C6 idempotency | C7 examples | C8 scope→Appx-J |
|---|---|---|---|---|---|---|---|---|
| §32.8.1 GET /v1/pricing | ✅ (RL class `public_pricing_unauth`) | n/a (single-payload) | ✅ (4 query params) | ✅ | ⚠ (codes registered in App I) | n/a (read) | ✅ | n/a (no auth) |
| §32.8.2 GET /v1/orgs/{org_id}/wallet | ✅ | n/a (single resource) | ✅ (2 query params) | ✅ | ✅ | n/a (read) | ✅ | ✅ |
| §32.8.3 POST /v1/orgs/{org_id}/wallet/cap | ✅ | n/a | ✅ | ✅ | ✅ | ✅ REQUIRED | ✅ | ✅ |
| §32.8.4 POST /v1/orgs/{org_id}/wallet/auto-topup | ✅ | n/a | ✅ | ✅ | ✅ | ✅ REQUIRED | ✅ | ✅ |
| §32.8.5 GET /v1/orgs/{org_id}/ai-operations | ✅ | ✅ | ✅ (12 query params) | ✅ | ✅ | n/a (read) | ✅ | ✅ |
| §32.8.6 GET /v1/orgs/{org_id}/ai-operations/{op_id} | ✅ | n/a | ✅ | ✅ | ✅ | n/a (read) | ⚠ (truncated) | ✅ |
| §32.8.7 POST /…/contest | ✅ + per-Org write ceiling | n/a | ✅ | ✅ | ✅ | ✅ REQUIRED | ✅ | ✅ |
| §32.8.8 GET /v1/orgs/{org_id}/free-allowance | ✅ | ✅ | ✅ | ✅ | ⚠ (single line "Standard") | n/a | ✅ | ✅ |
| §32.8.9 GET /v1/orgs/{org_id}/committed-spend | ✅ | n/a (single contract; history capped 5) | ✅ | ✅ | ✅ | n/a | ✅ | ✅ |
| §32.8.10 POST /…/wallet/topup | ✅ (RL class `billing_mutation`) | n/a | ✅ | ✅ | ❌ codes 5/5 unregistered in Appx-I | ⚠ (header REQUIRED via §32.8.0) | ✅ | ✅ |
| §32.8.11 POST /…/ai-operations/export | ✅ (RL class `billing_export`) | n/a (poll endpoint listed but never authored as a §32.8 sub-section) | ✅ | ✅ | ❌ codes 5/5 unregistered in Appx-I | ❌ silent | ⚠ (no curl) | ✅ |
| §32.8.12 GET /…/contests/{contest_id} | ✅ | n/a | n/a (no body) | ✅ | ❌ `contest_record_not_found` unregistered; `contest_role_insufficient` unregistered | n/a | ⚠ (no curl) | ✅ |
| §32.8.13 POST /…/contests/{contest_id}/withdraw | ✅ | n/a | ✅ | ✅ | ❌ 5/5 codes unregistered | ❌ silent on header | ⚠ (no curl) | ✅ |
| §32.8.14 POST /…/committed-spend/{contract_id}/opt-out-renewal | ✅ | n/a | ✅ | ✅ | ❌ 5/5 codes unregistered | ❌ silent | ⚠ (no curl) | ✅ |
| §32.8.15 POST /…/plan-change | ✅ + 10/h ceiling | n/a | ✅ | ✅ | ❌ 6/6 codes unregistered | ❌ silent | ⚠ | ✅ |
| §32.8.16 POST /…/pro-trial-seats/{grant_id}/accept | ✅ | n/a | ✅ | ✅ | ❌ 6/6 codes unregistered | ❌ silent | ⚠ | ✅ |
| §32.8.17 POST /…/pro-trial-seats/{grant_id}/decline | ✅ | n/a | ✅ | ✅ | ❌ codes "mirror §32.8.16" — none registered | ❌ silent | ⚠ | ✅ |
| §32.8.18 GET /…/downgrade-buckets | ✅ | ⚠ (uses `page_size` not `limit`) | ✅ | ✅ | ⚠ thin (2 codes; `org_not_found` not in §32.8 catalog) | n/a | ⚠ | ✅ |
| §32.8.19 GET /…/seat-snapshots | ✅ | ✅ | ✅ | ✅ | ❌ `snapshot_window_exceeds_retention` referenced but unregistered | n/a | ⚠ | ✅ |
| §32.8.20 POST /…/pricing/pinned (+ DELETE) | ✅ | n/a | ✅ | ✅ | ❌ 4/4 codes unregistered | ❌ silent on Idempotency-Key | ⚠ | ✅ |
| §32.8.21 GET /…/pricing/history | ✅ | ✅ | ✅ | ✅ | ⚠ "Standard" (no enumeration) | n/a | ⚠ | ✅ |
| §32.8.22 GET /…/audit-events | ✅ | ✅ | ✅ (6 query params) | ✅ | ❌ `audit_view_namespace_out_of_scope` + `audit_log_full_view_requires_org_admin` unregistered | n/a | ⚠ | ✅ |
| §32.9.1 POST /…/kb/export | ✅ + RL class `kb_export_request` | n/a | ✅ (8 fields) | ✅ | ✅ (codes registered) | ✅ REQUIRED | ⚠ (no curl; JSON only) | ⚠ (`export:kb` registered, but RL class `kb_export_request` not in any registry) |
| §32.9.2 GET /…/kb/export/{export_id} | ✅ + RL class `kb_export_poll` | n/a | n/a | ✅ | ✅ (codes registered) | n/a | ⚠ | ⚠ same as 9.1 |

**Summary.** 24 endpoints carry detail; ~49 do not.

### 2.2 Endpoints listed in §32.5 with NO detail block

Each row = one or more endpoints listed in §32.5 (lines 26568–26720) with method+path only.

| §32.5 family | Endpoint count | Detail status |
|---|---|---|
| Workspaces (CRUD + advance) | 6 | ❌ none |
| Requirements (CRUD) | 5 | ❌ none |
| Responses (CRUD-minus-DELETE) | 4 | ❌ none |
| Scores (CRUD-minus-DELETE) | 4 | ❌ none |
| Vendors / Target Accounts (CRUD-minus-DELETE + disqualify + reverse + list disqualifications) | 7 | ❌ none — and reverse endpoint annotated **"detail authored in follow-on pass; Known Gap"** at line 26626 |
| Scenarios (CRUD) | 5 | ❌ none |
| Selection Reports (GET, POST, GET single) | 3 | ❌ none |
| Traceability Matrices (GET list, GET single) | 2 | ❌ none |
| Intelligence (cache, briefings list, briefing single) | 3 | ❌ none |
| Capability Declarations (GET, POST, PATCH, DELETE) | 4 | ❌ none |
| Internal Comments (GET, POST, PATCH, DELETE) | 4 | ❌ none |
| Audit Events (GET list, GET single) | 2 | ❌ none |
| Users & Organization (me, org/me, org/me/members) | 3 | ❌ none |

**Total ~52 endpoints with no per-endpoint contract.** Every one violates audit checks 3 (request schema), 4 (response schema), 5 (Appendix I error catalog binding), 6 (idempotency for POSTs), 7 (concrete examples), and 8 (scope registration consumer).

---

## 3. Reverse Pass — §4 Entities Implying API Surface

The audit prompt names a reverse-pass list; below is each entity walked against §32 catalog presence.

| §4 entity | Entity anchor | API surface in §32? | Coverage verdict |
|---|---|---|---|
| AIWallet (§4.8.3) | wallet | §32.8.2 read; §32.8.3 cap; §32.8.4 auto-topup; §32.8.10 manual top-up | ✅ |
| AIOperation ledger (§4.8.1) | ai-operation | §32.8.5 list; §32.8.6 single; §32.8.11 export | ✅ |
| ContestRecord (§4.8.5) | contest | §32.8.7 file; §32.8.12 read; §32.8.13 withdraw | ✅ |
| OutcomeContract introspection (§4.8.4) | outcome-contract | **No §32 endpoint.** Referenced inside `/v1/pricing` capability blocks only — embedded summary, not introspection. | ❌ api_gap |
| Capability Registry list (§4.8.2) | capabilities | Surfaced inside `/v1/pricing.capabilities[]`. No dedicated `GET /v1/capabilities` or `/v1/capability-registry`. | ⚠ (read-only via pricing) |
| Vendor Opt-Out submit (§4.4.8) | opt-out | Endpoints authored at **§27.10.6.1–.4 under `/api/v1/opt-outs`** — NOT enumerated in §32.5; path prefix differs from §32.1 base URL | ❌ api_gap + path drift |
| EOI accept (§4.5.8 / §4.5.2) | eoi | §4.5.2 references `/v1/eoi-drafts/{id}` (DELETE) and §6687 references `POST /v1/bid-success-shares`; no §32 detail block; EOI Acceptance entity has no listed endpoint | ❌ api_gap |
| Promoted Listing manage (§4.4.19) | promoted-listings | Endpoints authored at **§27.11.2 under `/v1/seller/marketplace/promoted-listings`** — NOT enumerated in §32.5 | ❌ api_gap |
| Verification Review submit (§26-series) | verification | `POST /v1/marketplace/verification/reviews` referenced from webhook payload (line 30210) but never authored anywhere in §32 | ❌ api_gap |
| KB MCP token issue (§22.8.3.1 MCPSessionTokenRecord) | kb/mcp/tokens | No public §32 endpoint. Tokens are minted internally by Anthropic vault per §22.8.3 — but the spec does not declare this is internal-only or document the absence | ⚠ documentation_gap (internal-only declaration missing) |

**Additional reverse-pass observations beyond the named list.**

- **Bid Workspace (§4.4)** — Seller-console primary entity. No §32 endpoints listed.
- **KB Entry, KB Document, KB Namespace (§4.4 / §22.4)** — Seller KB read/write API absent from §32. Only KB *export* is authored (§32.9).
- **Managed Agent invocation (§4.8.2 / §22.13)** — `POST /v1/agent/invoke` referenced inline at Appendix I `capability_requires_managed_agent` (line 43561) but never authored as a §32 detail block.
- **PolicyIngestion (§12)** — `invalid_policy_ingestion_id` registered in Appendix I but no §32 endpoint.
- **Cross-Console Bridge Events (§4.7.1, §25)** — Read API surface absent from §32.
- **WorkspaceMembership / OrganizationMembership (§4.2.2)** — Member admin endpoints not enumerated.
- **GuestInvite, ApiToken, MfaEnrollment (§4.2)** — Auth-adjacent entities missing from §32.

The pattern: **§32 is a Buyer-Console + Billing + KB-Export catalog. The full Seller console, Marketplace, and auth-administration API surfaces live elsewhere (§27, §22, scattered references) or are unauthored.**

---

## 4. Cross-Section Convention Drift

### 4.1 Path-prefix drift — `/v1/` vs `/api/v1/` vs `/v1/seller/marketplace/...`

- §32.1: "Base URL: `https://api.sourcera.io/v1`" → `/v1/...` is canonical.
- §27.10.6 introduces `/api/v1/opt-outs/...` and notes "This prompt's requirement of 'POST /v1/opt-outs' is treated as shorthand for `/api/v1/opt-outs`; the RECONCILIATION log notes this mapping."
- §27.11.2 uses `/v1/seller/marketplace/promoted-listings/...` — neither `/api/v1/` nor matching the §32 buyer pattern of `/v1/workspaces/...`.
- §22.18.4 / §32.9 use `/v1/orgs/{org_id}/kb/export`.

Three coexisting prefix conventions. Per `Audit_Prompts.md` Severity rule, this is a **conflicting numerical/path singleton** (junior eng would build the wrong route).

### 4.2 HTTP code drift — `kb_export_archive_integrity_failed`

- §22.18.7 AC #55 (line 19102): "MUST return HTTP **502** `kb_export_archive_integrity_failed`"
- §32.9.2 (line 28528): HTTP **410** in the error table
- §32.9.4 AC #89 (line 28555): HTTP **410** in the QA test
- Appendix I (line 43710): HTTP **410**

Three sources canonical at 410, one stale at 502.

### 4.3 `api_token_scope` enum count drift

- §47155 declares "the canonical **14-value** set."
- §47157 enumerates 17 values: `read:workspaces`, `write:workspaces`, `admin:workspaces`, `read:requirements`, `write:requirements`, `read:responses`, `write:responses`, `read:scores`, `write:scores`, `read:billing`, `write:billing`, `admin:billing`, `export:billing`, `export:kb`, `read:kb`, `write:kb`, `admin:integrations`.
- CI gate `appendix_j_api_token_scope_endpoint_consistency` (line 48711) asserts membership against the "14-value" set — runtime contract is ambiguous given the count mismatch.

### 4.4 Out-of-set scopes referenced by §27

- §27.10.6 references `read:vendor_opt_outs`, `write:vendor_opt_outs`, `read:vendor_opt_out_authority`, `write:vendor_opt_out_authority` — not in the §47157 enumerated set and never registered in Appendix J `api_token_scope`.
- §27.11.2 references `marketplace_read`, `marketplace_write`, `marketplace_match_score_read` — appear to be rate-limit class names, not scopes, but the §27 tables put them in the "Auth Scope" column.

### 4.5 Rate-limit class registry absence

§32.4 names two classes (`public_pricing_unauth`, "Standard authenticated per-Org"). §32.8 sub-sections add `billing_mutation`, `billing_read`, `billing_export` without enumerating limits in §32.4. §32.9 adds `kb_export_request` (10/h, 2 concurrent), `kb_export_poll` (60/min). §27 adds `marketplace_match_score_read`, `marketplace_write`, `marketplace_read`. None of these classes appears in a centralized registry table — limits are inline-only; cross-class consistency cannot be reasoned about.

### 4.6 Unregistered error codes (Appendix I § Billing Endpoint Errors §32.8)

The §32.8 endpoints from §32.8.10 onward reference ~39 error codes that are **not present** in Appendix I's "Billing Endpoint Errors (§32.8)" subsection (lines 43607–43638). Spot-confirmed against Appendix I:

- §32.8.10 (manual top-up): `topup_amount_out_of_range`, `payment_method_declined`, `payment_method_not_registered`, `wallet_topup_disabled_for_enterprise_committed`, `topup_rate_limit_exceeded` — 5 codes, 0 registered.
- §32.8.11 (export): `export_window_exceeds_retention`, `export_cost_center_forbidden`, `export_rate_limit_exceeded`, `export_queue_saturated` — 4 codes, 0 registered.
- §32.8.12/13 (contest read/withdraw): `contest_record_not_found`, `contest_role_insufficient`, `contest_withdraw_role_insufficient`, `contest_withdraw_not_filer`, `contest_already_resolved`, `contest_withdraw_reason_required` — 6 codes, 0 registered.
- §32.8.14 (committed-spend opt-out): `committed_spend_role_insufficient`, `committed_spend_contract_not_found`, `committed_spend_already_opted_out`, `committed_spend_optout_window_closed`, `committed_spend_optout_reason_required` — 5 codes, 0 registered.
- §32.8.15 (plan change): `plan_change_role_insufficient`, `plan_change_confirm_token_required`, `plan_change_downgrade_preview_token_expired`, `committed_spend_migration_intent_required`, `enterprise_plan_change_requires_ops_signoff`, `plan_change_rate_limit_exceeded` — 6 codes, 0 registered.
- §32.8.16/17 (pro-trial seat): `pro_trial_seat_role_insufficient`, `pro_trial_seat_grant_not_found`, `pro_trial_seat_already_resolved`, `pro_trial_seat_grant_expired`, `pro_trial_seat_acknowledgement_token_invalid`, `pro_trial_seat_auto_downgrade_not_acknowledged` — 6 codes, 0 registered.
- §32.8.19 (seat snapshots): `snapshot_window_exceeds_retention` — 1 code, 0 registered.
- §32.8.20 (pricing pin): `pricing_pin_role_insufficient`, `pricing_version_not_published`, `pricing_pin_window_exceeds_plan_limit`, `pricing_version_already_pinned` — 4 codes, 0 registered.
- §32.8.22 (audit-events view): `audit_log_full_view_requires_org_admin`, `audit_view_namespace_out_of_scope` — 2 codes, 0 registered.

Total: **39 codes referenced but not catalogued** in Appendix I § Billing Endpoint Errors.

### 4.7 Idempotency contract gaps

§32.8.0 states "Every POST endpoint in §32.8 accepts an `Idempotency-Key` request header." Per-endpoint sub-sections from §32.8.13 onwards do **not** carry an "Idempotency." authoring block:

| Endpoint | Idempotency block in sub-section? |
|---|---|
| §32.8.3 wallet/cap | ✅ "REQUIRED in production" |
| §32.8.4 wallet/auto-topup | ✅ "REQUIRED" |
| §32.8.7 contest | ✅ "REQUIRED" |
| §32.8.10 wallet/topup | ✅ "Idempotency-Key required (§32.8.0); 24-hour replay window" |
| §32.8.11 export | ❌ silent |
| §32.8.13 contest withdraw | ❌ silent |
| §32.8.14 committed-spend opt-out | ❌ silent |
| §32.8.15 plan-change | ❌ silent |
| §32.8.16 pro-trial-seat accept | ❌ silent |
| §32.8.17 pro-trial-seat decline | ❌ silent |
| §32.8.20 pricing/pinned (POST + DELETE) | ❌ silent |

Junior engineer reading sub-section in isolation cannot tell whether the header is REQUIRED, RECOMMENDED, or absent. §32.8.0 declares the header is "RECOMMENDED in production" for non-Stripe-charge POSTs, but contest withdraw and plan-change reverse external state — they should be REQUIRED.

### 4.8 Pagination parameter naming drift

§32.3 establishes `cursor` + `limit`. §32.8.18 (GET downgrade-buckets) uses `cursor` + `page_size` instead. Inline parameter table reads `page_size` (§32.8.18 query parameters block, line 28127). Drift from §32.3 canonical singleton.

### 4.9 §32.5 "Known Gap" annotation

§32.5 line 26626: `POST /v1/workspaces/{workspace_id}/vendors/{vendor_id}/disqualify/{disqualification_id}/reverse (§4.7.2 Reversal; detail authored in follow-on pass; Known Gap)`. Multi-Status (HTTP 207) cascade reversal endpoint flagged as missing detail. §32.6.1 references this endpoint as an in-scope 207 emitter; the contract that the 207 schema asserts is unfulfilled.

### 4.10 §32.7 Acceptance Criteria thinness

§32.7 carries 7 criteria, several aspirational:

- "All endpoints documented with curl examples in API reference." (untestable — "API reference" is external)
- "API test coverage ≥ 95%." (no measurement protocol)
- "Pagination cursor-based, consistent across all list endpoints." (true for §32.8 except §32.8.18 `page_size`; AC silent on enforcement)

§32.8.23 carries 21 numbered, observable, testable ACs. §32.9.4 carries 23 (AC #78 through AC #100). The §32 global AC list is materially weaker than the per-section AC blocks it references.

### 4.11 Multi-Status (§32.6.1) coverage

§32.6.1 enumerates two canonical 207 emitters: `POST /…/disqualify` (§25.3.9) and `POST /…/disqualify/{id}/reverse` (§25.3.10a). The reverse endpoint is in §32.5 "Known Gap." So the Multi-Status pattern has 2 declared emitters, 1 unauthored. CI gate `api_multistatus_schema_registration` is asserted (line 26796) but the underlying schema for the reverse endpoint is missing.

---

## 5. Counterfactual / Failure-Mode Pass

For each major endpoint authored in §32.8 / §32.9, three realistic failure modes were considered. Spot examples:

- **§32.8.7 contest filing concurrent with DSAR redaction.** §32.8.7 lists `contest_locked_for_dsar` (HTTP 423). §4.8.5 Failure Mode #5 referenced. Resolved upstream by D-V7-003 / §34.11.2.A; no §32-side defect.
- **§32.8.10 manual top-up Stripe outage.** Returns HTTP 402 `payment_method_declined` (line 27755) but §32.8.10 does not address Stripe-side timeouts (vs declines). What returns when Stripe `payment_intent.create` itself returns 504? Spec silent. Files D-V8.1-NNN P2 documentation_gap inheriting from D-V7-002.
- **§32.8.11 export queue saturated mid-job.** §32.8.11 emits 503 `export_queue_saturated` on initiation; spec silent on a queued job that times out mid-run vs the §32.9 KB export which explicitly transitions to `failed`. Spec drift between two async export patterns.
- **§32.8.15 plan-change Ops co-signoff timeout.** Response declares `status=pending_ops_signoff` (line 28000) but no SLA, no `cancelled_due_to_ops_no_response` state, no webhook for time-bounded rejection.
- **§32.9.1 KB export vs DSAR hold timing.** AC #94 says HTTP 422 on initiation; spec silent on the case where DSAR hold engages mid-run. The §32.9.1 narrative says "in-flight jobs transition to `paused` (a terminal-until-resume state) per §22.18.2.6" — but §32.9.2 polling response schema does not list `paused` as a `status` value. Implicit enum gap.
- **§32.8.5 cross-console filter combination.** `?console=all&workspace_id=<seller-bid-workspace-uuid>` from a buyer-console token: spec silent. Should return 404 per §4.8.1 firewall — explicit AC missing.

These failure modes route to the defects below.

---

## 6. Self-Challenge Pass

After authoring §§ 1–5, re-read as hostile reviewer. Revisions:

- D-V8.1-007 (KB MCP token issue) was originally drafted P1 api_gap. On re-read, MCPSessionTokenRecord is genuinely internal-only — issued by the Anthropic vault flow per §22.8.3 and not customer-facing. Downgraded to **P2 documentation_gap** with the recommendation to add an explicit "internal-only — not exposed via §32 public API" declaration in §22.8.3.1.
- D-V8.1-002 (OutcomeContract introspection) was on the line between P1 api_gap and P2 documentation_gap. Per the audit prompt's explicit reverse-pass naming ("**OutcomeContract introspection**"), and the buildability test (a customer programmatically reproducing accept/reject signal rules at historical settlement times cannot do so without the endpoint), keeping at **P1 api_gap**.
- D-V8.1-014 (idempotency gaps) was originally drafted as "may inherit from §32.8.0." On re-read, the §32.8.0 inheritance is permissive ("RECOMMENDED in production") for non-Stripe-charge POSTs; multiple downstream POSTs (contest withdraw, plan-change) are state-mutating in ways where idempotency should be REQUIRED, not RECOMMENDED. Severity preserved at **P1**.
- D-V8.1-016 (39 unregistered error codes) — confirmed reproducible by direct grep of Appendix I § Billing Endpoint Errors (§32.8) subsection. Severity P1 confirmed (each code is missing field-level schema in the canonical registry).
- D-V8.1-001 (§32.5 list-only endpoints) — debated whether to file this as a single roll-up defect or one per family. Filed as roll-up because the structural fix is the same (author detail blocks); per-family scope is the recommendation, not the defect.

---

## 7. Promotions to DEFECT_LEDGER.md

The 19 defects below promote into `DEFECT_LEDGER.md` Phase 8 / Prompt 8.1 §32 cluster, mnemonic `D-V8.1-NNN`. See ledger for full row format.

| defect_id | severity | class | summary |
|---|---|---|---|
| D-V8.1-001 | P1 | documentation_gap | §32.5 lists ~52 buyer-side and admin endpoints with no per-endpoint contract detail |
| D-V8.1-002 | P1 | api | OutcomeContract introspection has no §32 endpoint |
| D-V8.1-003 | P1 | api | Vendor Opt-Out endpoints (§27.10) absent from §32.5 catalog |
| D-V8.1-004 | P1 | api | Promoted Listing endpoints (§27.11) absent from §32.5 catalog |
| D-V8.1-005 | P1 | api | Verification Review POST endpoint never authored |
| D-V8.1-006 | P1 | api | EOI lifecycle endpoints not enumerated in §32.5 |
| D-V8.1-007 | P2 | documentation_gap | KB MCP token issuance internal-only not declared |
| D-V8.1-008 | P1 | api | Seller-side Bid Workspace, KB Entry/Document/Namespace, Managed Agent invocation absent from §32.5 |
| D-V8.1-009 | P1 | consistency_drift | Three coexisting path prefixes (`/v1/`, `/api/v1/`, `/v1/seller/marketplace/`) |
| D-V8.1-010 | P1 | consistency_drift | `kb_export_archive_integrity_failed` HTTP 502 vs 410 |
| D-V8.1-011 | P1 | documentation_gap | Rate-limit class registry absent — 8+ classes referenced inline only |
| D-V8.1-012 | P1 | enum | `api_token_scope` "14-value" label vs 17 listed values |
| D-V8.1-013 | P1 | enum | §27.10/§27.11 reference scopes outside the canonical `api_token_scope` enum |
| D-V8.1-014 | P1 | api | 7 §32.8 POST sub-sections silent on Idempotency-Key contract |
| D-V8.1-015 | P1 | api | §32.5 disqualification reversal endpoint flagged "Known Gap" |
| D-V8.1-016 | P1 | error_code | ~39 §32.8 error codes referenced but unregistered in Appendix I |
| D-V8.1-017 | P2 | acceptance_criteria | §32.7 global ACs aspirational rather than testable |
| D-V8.1-018 | P2 | consistency_drift | §32.8.18 uses `page_size` instead of canonical `limit` |
| D-V8.1-019 | P2 | api | §32.5 implicit failure modes (Stripe timeout, plan-change SLA, export mid-run paused state, cross-console filter combination) silent |

**Halt-rule status.** Zero P0 defects filed. P1 count = 14. Halt rule **PASSES** for advancement to Prompt 8.2 (Webhooks).

---

## 8. COVERAGE_MATRIX.md `api` column tightening (Phase 8.1 prescription)

The Phase 8.1 walk produces these `api`-column transitions for feature-inventory rows whose entity surfaces touch §32. The mechanical update is queued to a v7.1.1 hygiene pass per the Phase 1.2 incremental-tightening pattern.

- **Buyer-side §32.5 entity rows** (Workspace, Use Case, Requirement, Response, Score, Target Account / Vendor, Scenario, Selection Report, Traceability Matrix, Intelligence Cache Entry, Intelligence Briefing, Capability Declaration, Internal Comment, Audit Event, User, Organization, Organization Membership): `api` → ⚠ **(D-V8.1-001 — endpoint listed; contract not authored)**.
- **AIWallet, AIOperation, ContestRecord**: `api` ✅ (full detail in §32.8). No transition.
- **OutcomeContract**: `api` ✅ → ❌ **(D-V8.1-002 — no introspection endpoint)**.
- **Capability Registry Entry (§4.8.2)**: `api` ⚠ (read-only via `/v1/pricing.capabilities[]`; no dedicated CRUD).
- **VendorOptOutRecord, VendorOptOutAuthorityAttestation**: `api` ✅ → ⚠ **(D-V8.1-003 — endpoints exist at §27.10 but path-prefix and §32.5 catalog drift)**.
- **PromotedListing**: `api` ✅ → ⚠ **(D-V8.1-004)**.
- **VerificationReviewRecord**: `api` ✅ → ❌ **(D-V8.1-005 — endpoint referenced in webhook, never authored)**.
- **EOI Record, EOI Acceptance Record**: `api` ✅ → ⚠ **(D-V8.1-006)**.
- **MCPSessionTokenRecord**: `api` n/a → ⚠ **(D-V8.1-007 — internal-only declaration missing)**.
- **Bid Workspace, KBEntry, KBDocument, KBNamespace, ManagedAgentSession**: `api` ✅ → ⚠ **(D-V8.1-008 — only KB Export authored)**.

Per `COVERAGE_MATRIX.md` § "Phase 1.2 Update" and § "V1.3 Spec-Side Remediation Pass" patterns, the cell-by-cell tightening is appended below the matrix's Phase 8.1 sub-header (mechanical pass). This file (PHASE8.1_FINDINGS.md) is the prescription; matrix file edits ride a v7.1.1 hygiene pass.

---

## 9. Sign-Off

- **Prompt-scope defects filed:** 19.
- **P0 / P1 / P2 / P3 split:** 0 / 14 / 5 / 0.
- **Reverse-pass coverage:** AIWallet ✅, AIOperation ✅, ContestRecord ✅, OutcomeContract ❌, Capability Registry ⚠, Vendor Opt-Out ❌, EOI ❌, Promoted Listing ❌, Verification Review ❌, KB MCP token ⚠.
- **Halt-rule:** PASS. Advancement to Prompt 8.2 (Webhooks) and Prompt 8.3 (Notifications) unblocked.
- **v7.1.1 stamp-gate inheritance:** 14 P1 defects route to v7.1.1 stamp gate (each requires owner + recommendation; ledger rows below carry both).
- **Authored Extension hooks needed if any defect promotes to remediation:** AE-V8.1-* prefix; flag at remediation time.

Cross-references: D-V7-002 / D-V7-003 / D-V7-008 already injected new error codes (`wallet_auto_topup_monthly_cap_exhausted`, `contest_rate_limit_exceeded`, `wallet_read_scope_violation`) into the v7.1.1 Appendix I queue. The Phase 8.1 §32.8 error-code-registration sweep (D-V8.1-016) should ride the same v7.1.1 stamp-gate pass.

---

## 10. Supplementary Sweep — Second Walk (2026-05-07)

A second adversarial walk of §32 — performed by an independent reviewer in the same session window — surfaces 13 additional defects the first walk did not file. These are appended as `D-V8.1-020` through `D-V8.1-032` in the Defect Ledger and below. The walk re-confirmed the existing 19 defects (no demotions, no severity revisions). Each supplementary defect was self-challenged before promotion.

| # | Severity | Class | Crux |
|---|---|---|---|
| D-V8.1-020 | P1 | error_code | `idempotency_key_body_mismatch` referenced by §32.9.1 / §32.9.4 AC #91 / §25.3.10a / §27.10.6.1 AC #25 / §22.18 — never registered in Appendix I; the canonical Appendix I entry is `idempotency_key_request_mismatch`. Two parallel codes for the same condition. |
| D-V8.1-021 | P1 | webhook | §32.8.23 AC #21 enumerates 17 webhook events emitted by §32.8 mutating endpoints. §31.8 Billing-Domain Webhook Catalog publishes 13 + 4 Phase-4c interim = 17 NAMES, but the actual §31.8.3–§31.8.7 detail blocks cover only 13 and the four Phase-4c interim events. The 13 §32.8 emissions (`billing.wallet.topup_requested`, `billing.wallet.topup_settled`, `billing.contest.withdrawn`, `billing.ledger.export_completed`, `billing.committed_spend.renewal_opt_out_filed`/`_reversed`, `billing.plan.change_requested`/`_applied`, `billing.pro_trial_seat.accepted`/`declined`, `billing.pricing.version_pinned`/`_unpinned`, `kb.export.failed`) lack §31.8-style payload schemas. CI gate `billing_webhook_catalog_completeness` cannot pass. |
| D-V8.1-022 | P1 | state_machine | §32.8.13 ContestRecord withdraw declares `AIOperation status` transition `contested → committed`. §4.8.1 AIOperation `settlement_state` enum has no `committed` value (canonical: `pending`/`accepted`/`auto_accepted`/`rejected`/`contested`/`reversed`). The transition target is a non-existent state. |
| D-V8.1-023 | P1 | api | §32.8.18 / §32.8.19 / §32.8.22 use response envelope `{"items": [...], "next_cursor": null}`; §32.3 canonical envelope is `{"data": [...], "pagination": {"has_more", "next_cursor", "limit"}}`. Two pagination shapes coexist in §32.8. Consumer SDK cannot generalize. |
| D-V8.1-024 | P1 | api | §10.16.1 mandates request header `X-Sourcera-Console: buyer`; §32.2 does not document the header. Tokens with `api_token_console_scope=both` (Appendix J line 47153) need the header to disambiguate the call site; absence is undefined behavior. |
| D-V8.1-025 | P1 | api | §10.16 phase-gate-failed response (line 12551) uses non-canonical envelope `{"error": "<code>", "error_code": "<code>", "current_phase", "target_phase", "failed_checks": [...]}` — parallel `error` + `error_code` keys, no `details`, no `request_id`. §32.6 canonical envelope is `{"error": {"code", "message", "details", "request_id"}}`. Consumer parsers built against §32.6 fail on §10.16 responses. |
| D-V8.1-026 | P1 | data_model | §32.5 lists Intelligence endpoints (`/v1/intelligence/cache`, `/v1/intelligence/briefings`, `/v1/intelligence/briefings/{briefing_id}`). Appendix I line 43518 registers `invalid_briefing_id` ("Intelligence Briefing not found or expired (30-day retention)"). Search across §4 finds NO entity definition for `IntelligenceBriefing`. Endpoint exposes a non-existent entity. |
| D-V8.1-027 | P2 | api | §32.2 declares response header `X-RateLimit-RetryAfter`. RFC 7231 §7.1.3 standardizes `Retry-After` (no `X-RateLimit-` prefix). §32.4 hard-limit response references `Retry-After`; §27.9 / §32.9.1 / §32.9.2 / Appendix I error rows reference `Retry-After`. Two header names emit on 429; consumer parsers break. |
| D-V8.1-028 | P2 | api | §32.6 Error Handling does not document HTTP-status conventions for 207 (Multi-Status), 304 (Not Modified), 410 (Gone), or 423 (Locked) — yet §32.6.1 (207), §32.8.1 (304), §32.8.7 (410 contest_window_expired), §32.8.7 / §32.8.10 / §32.8.15 (423) all use them. Junior engineer reading §32.6 in isolation lacks the status-code semantics. |
| D-V8.1-029 | P2 | enum | §32.6.1 Multi-Status registers `vendor_disqualification_cascade_action` enum in Appendix J. The parallel `vendor_disqualification_reversal_cascade_action` enum (used by §25.3.10a's reversal endpoint) is referenced inline at §32.6.1 but never registered. Both enums are required for the 207-cascade `cascade_actions[].action` schema validation. |
| D-V8.1-030 | P2 | ci_gate | §32.6.1 declares CI gate `api_multistatus_schema_registration` (line 26796) but the gate is absent from Appendix M.5 37-gate catalog per CLAUDE.md §16. Runtime wiring path is unspecified. |
| D-V8.1-031 | P2 | plan_gating | §32.4 per-plan monthly API-call quota table uses bare names (`Free`, `Starter`, `Growth`, `Scale`, `Enterprise`) without buyer/seller distinction. §34.1 canonicalizes plan tiers as `business_starter`/`seller_starter`, etc. The §32.4 table is ambiguous: which side does `Starter | 10,000 | 3,000` refer to? Both? |
| D-V8.1-032 | P2 | numerical_singleton | §32.4 declares burst limits inline: 5,000/h soft, 10,000/h hard, 100/min burst, 10 concurrent per-user, 60s queue timeout, plus per-IP `public_pricing_unauth` 600/h soft, 1,200/h hard, 60/min burst. None has a §39 / §44 row. Future change to any limit requires editing every endpoint that cites it. |

### 10.1 Self-Challenge on Supplementary Defects

- **D-V8.1-020 (`idempotency_key_body_mismatch` not registered).** Hostile-reviewer challenge: "Could be intentional — the existing `idempotency_key_request_mismatch` covers it semantically." → Response: §22.18.7 AC #91 invokes the test name `kb_export_idempotency_body_mismatch` which asserts HTTP 409 `idempotency_key_body_mismatch` literally. The QA test will fail at execution against an Appendix I that registers only the parallel name. P1 stands.
- **D-V8.1-021 (13 webhooks missing in §31.8).** Challenge: "§31.8 may catalog only the autonomous events; mutating-endpoint events live elsewhere." → Response: §32.8.23 AC #21 explicitly says "Webhook events emitted by §32.8 mutating endpoints MUST be registered in the §31.8 Billing & Pricing Webhook catalog." The named 17 events do not all have §31.8 detail blocks. P1 stands.
- **D-V8.1-022 (`committed` state).** Challenge: "Maybe this is a typo for `accepted`/`auto_accepted`." → Response: Yes, almost certainly — §32.8.13 atomicity AC says "AIOperation `status` transitions `contested → committed`" but §4.8.5 ContestRecord withdraw narrative restores the prior `accepted`/`auto_accepted` state. The non-existent `committed` token IS a typo, but it IS a P1 because a junior engineer will write a state machine to that token. P1 stands.
- **D-V8.1-023 (envelope drift).** Challenge: "`items` is a perfectly valid REST envelope." → Response: §32.3 canonical is one envelope; the spec must pick one. P1 stands.
- **D-V8.1-024 (`X-Sourcera-Console` header).** Challenge: "Could be inferred from the bearer token's `console_scope` claim." → Response: For tokens with `api_token_console_scope=both`, the claim does not disambiguate. §10.16 mandates the header. §32.2 must document it. P1 stands.
- **D-V8.1-025 (§10.16 envelope drift).** Challenge: "§10.16 may pre-date §32.6." → Response: Phase 7 V4 closure (D-4.2-002 / D-4.2-036) was 2026-04-29; §32.6 envelope is older. The two have not been reconciled. P1 stands.
- **D-V8.1-026 (Intelligence Briefing not in §4).** Challenge: "Could be defined under a different name." → Response: Verified by grep across §4 for `Intelligence`, `Briefing`, `briefing` — no entity-table form. P1 stands.
- **D-V8.1-027 (Retry-After header naming).** Challenge: "`X-RateLimit-RetryAfter` is descriptive." → Response: RFC 7231 names it `Retry-After`. CDN, load-balancer, and HTTP-client libraries auto-honor `Retry-After` only. P2 stands (not P1 because most clients tolerate vendor-prefixed headers).
- **D-V8.1-028 (HTTP status doc).** Challenge: "Standard HTTP statuses don't need spec-side documentation." → Response: 207 is non-RFC and product-specific behavior; 423 has Sourcera-specific semantic load (DSAR-locked); 410 with `Retry-After` is non-standard. P2 stands.
- **D-V8.1-029 / -030 / -031 / -032.** Self-challenges below the visibility threshold. All P2 stands.

### 10.2 Updated Halt-Rule Status

P0: 0 (unchanged). P1 count: 14 (existing) + 7 (new) = **21**. P2: 5 (existing) + 6 (new) = **11**. P3: 0 (unchanged). Total: 32 defects.

Halt rule (zero P0) **PASSES**. Advancement to Prompt 8.2 (Webhooks) remains unblocked. v7.1.1 stamp-gate inheritance updated to 21 P1 defects.
