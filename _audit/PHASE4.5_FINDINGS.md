# Phase 4.5 — §14 Scenario Modeling Walk Findings (Scratch Log)

**Phase prompt:** `Audit_Prompts.md → Prompt 4.5 — Scenario Modeling (§14)` (line 1304).
**Run completed:** 2026-05-04.
**Scope:** Master Spec §14 end-to-end (lines 13584–13872), §14.1 Overview through §14.9 Acceptance Criteria. Cross-walks into §1.3 Console Firewall, §3.13 Free Choice, §4.3.8/§4.3.9 Evaluation Scenario Entity, §4.3.11–§4.3.13 Internal Comments cluster (Scenario as `attached_to_type`), §4.6.1 AuditEvent, §4.7.1 Console Bridge Event projection, §4.8.1 AIOperation, §4.8.7 FreeAllowanceCounter, §5.11 Feature Access Matrix, §6.8 DSAR, §10 13-Phase Pipeline (Phase 12 immutability), §11.3.2 Matrix view, §13.7 Blended Score, §13.9 Score Immutability, §14.6.3 Phase 12 lock, §19.4.1 Console Firewall Carry list (Scoring Scenario NEVER CARRIED), §19.4.2 redaction matrix, §22.20 Surface Compression, §25.7 Internal Comments, §28920 Free Allowance Counter row for `scenario_modeling`, §29 Notifications (`scenario_saved` low-priority event), §30.5 Command Registry (Scenario commands), §31 Webhooks, §32 APIs (`/v1/workspaces/{workspace_id}/scenarios` CRUD), §34.1.1 Plan Tier table cell **Scenario Modeling**, §34.1.3 Plan-Tier Cross-References, §34.8.5 Entitlement Matrix, §37 Appendix B Keyboard Shortcuts (Simulation Mode block 37597–37604), §38.x Mobile Feature Parity Matrix (line 30878–30880), §39 Object Size Constraints, §40.1 Export Formats, §40.2 Retention, §43016/§43033 Appendix I error codes (`invalid_scenario_id`, `scenario_limit_exceeded`), §44.x Performance Budgets, §44.6 Solo-Tier Surface Treatment, §47730 Engineering-to-Surface Translation row "Evaluation Scenario", §47834–47837 Scenarios & TCO translation rows, §51 PostHog event taxonomy (lines 41958–41961: `scenario_created`, `scenario_saved`, `scenario_compared`, `scenario_deleted`), Appendix M.1 surface/engine mapping, AE Ledger row AE-12.4-06 (Free-Tier 5-Scenario Cap, status `pending`).

**Inputs read end-to-end:**
- `Sourcera_Master_Spec.md` v7.1.0 §14 (lines 13584–13872) verbatim.
- `Sourcera_Master_Spec.md` v7.1.0 §4.3.8 (lines 3826–3838) and §4.3.9 (lines 3840–3870) Evaluation Scenario entity.
- `Sourcera_Master_Spec.md` v7.1.0 §34.1.1 (lines 28362–28406) Buyer Plan Tiers table — Scenario Modeling row + Solo column treatment.
- `Sourcera_Master_Spec.md` v7.1.0 §34.8.5 partial (lines 28920) — `scenario_modeling` Free Allowance Counter row.
- `Sourcera_Master_Spec.md` v7.1.0 §37 Appendix B Simulation Mode shortcuts (lines 37595–37604).
- `Sourcera_Master_Spec.md` v7.1.0 §51 (lines 41958–41961) PostHog scenario events.
- `Sourcera_Master_Spec.md` v7.1.0 Appendix I (lines 43016, 43033) `invalid_scenario_id` / `scenario_limit_exceeded`.
- `Sourcera_Master_Spec.md` v7.1.0 §32 (lines 26328–26338) Scenarios endpoint declarations.
- `Sourcera_Master_Spec.md` v7.1.0 §19.4 Console Bridge carry/redact tables (lines 19431–19463).
- `Sourcera_Master_Spec.md` v7.1.0 §29 (line 24858) `scenario_saved` notification row.
- `Sourcera_Master_Spec.md` v7.1.0 §30.5 (lines 25025–25044) Scenario commands.
- `Sourcera_Master_Spec.md` v7.1.0 §38.x (lines 30878–30880) mobile parity row.
- `_audit/FEATURE_INVENTORY.md` rows F-265 through F-272 + F-AE-013 (AE-12.4-06).
- `_audit/COVERAGE_MATRIX.md` rows for §14 features (F-265–F-272).
- `_audit/DEFECT_LEDGER.md` row format and severity definitions.
- `Audit_Prompts.md` → Prompt 4.5 (lines 1304–1326).

**Defect-ID convention:** `D-4.5-NNN`.

**Severity-rule application.** P0 reserved for billing-surface ambiguity allowing revenue leakage (rule d), firewall breach (rule a), or PII exposure (rule b). P1 for any §14 feature unbuildable as written: missing entity, missing API contract, missing error registration, missing webhook, missing state machine, missing acceptance criteria, missing plan-gating row in §5.11/§34.1/§39, conflicting numerical singletons. P2 for ambiguity that two engineers would resolve differently. P3 for citation hygiene.

**Self-challenge revisions:** Logged inline at §6 below.

---

## 1. Sources Read End-to-End

See "Inputs read end-to-end" block above. Walk pattern: §14 verbatim → cross-document hop on every numerical, every cited section, every entity, every enum, every shortcut, every event, every endpoint. Counterfactual pass on Phase 12 lock race, Use-Case-deletion cascade, Vendor-disqualification cascade, scenario denominator zero, concurrent edit conflict, simulation-mode session loss, downgrade-path scenario truncation, Solo-tier surface, post-Phase-12 creation attempt.

---

## 2. Findings (pre-promotion to ledger)

### 2.1 §14.2.1 vs §4.3.8 / §4.3.9 entity-schema bifurcation → D-4.5-001 (P0 data_model)

§14.2.1 (lines 13592–13674) declares an inline `Scenario Object Schema` with the following typed fields: `id` (uuid), `workspace_id` (uuid), `name` (≤100 chars), `description` (≤300 chars, optional), `created_by`, `created_at`, `updated_at`, `parameters{weight_overrides, excluded_vendors, excluded_use_cases, rubric_overrides{pm_value:0.1–0.9}, min_threshold:0.0–1.0, tco_value_weight:0.0–1.0}`, `results{ranked_vendors[], computed_at}`.

§4.3.8 (lines 3826–3838) declares an entirely different field table for the same entity name **Evaluation Scenario (Console-Scoped, Buyer)**: `id` (UUID), `workspace_id` (UUID FK), `name` (1–200 chars), `description` (0–2000 chars), `parameters` (JSON max 10000 chars; "fully defined in 4.3.9"), `created_at`, `updated_at`, `created_by`, `deleted_at`. Three constraint disagreements with §14.2.1: name 1–200 vs ≤100, description 0–2000 vs ≤300, parameters typed JSON-blob vs structured nested object.

§4.3.9 (lines 3840–3870) defines the parameters JSON structure with **operational performance fields**: `user_count`, `concurrent_users`, `transactions_per_day`, `peak_hour_load`, `data_volume_gb`, `monthly_growth_rate`, `uptime_requirement_percent`, `response_time_ms`, `custom_fields{}`. **Zero overlap** with §14.2.1 parameter fields (weight_overrides, excluded_vendors, rubric_overrides, min_threshold, tco_value_weight).

The §47730 Engineering-to-Surface Translation row also names "Evaluation Scenario" with `§4.3.8` and `"What-if scenario" / "Try a different scoring weight"` user copy — semantically aligning §4.3.8 with §14 weight-overrides, NOT with §4.3.9 operational fields. §19.4.1 line 19435 ("Scoring Scenario (§14) | NEVER CARRIED | All fields; scenario weights, scenario lifecycle, simulation outputs, what-would-flip analyses") confirms §14 is the canonical scoring-scenario contract; §4.3.9 operational fields are stale.

Two production-grade reads diverge: a service implementer wiring §4.3.8 to a Convex schema will allocate 200-char `name` + 2000-char `description` + 10000-char JSON `parameters` with operational fields; a service implementer wiring §14.2.1 will allocate 100-char `name` + 300-char `description` + structured nested object. The single canonical entity has two contradictory column constraints AND two contradictory parameter semantics. Settlement on either path silently breaks the other — a billing-surface ambiguity (Scenario Modeling is wallet-charged per §34.1.1; the wallet meter is `scenario_modeling` capability per §28920; if the entity's parameter contract is ambiguous, the metering trigger is ambiguous → revenue leakage path under Severity Rule (d)).

**Severity: P0 data_model** per Severity Rule (d) — billing surface ambiguity that allows revenue leakage if recalculation triggers diverge between two parameter shapes.

### 2.2 §14 scope-isolation, console enum, indexes, retention, residency, DSAR all silent → D-4.5-002 (P1 data_model)

§14.2.1 schema is missing every §4-convention attribute that the §4.3.8 entity table also lacks (Phase 1.2 D-1.2-004/005/010/012/013 already filed against §4.3.8): no `console` field (must be `buyer (fixed)`), no `org_id` (entity is workspace-scoped → org via Workspace), no `updated_by`, no `deleted_at` (in §14.2.1 inline; §4.3.8 has it), no `Indexes` block, no `Retention` block (parent Workspace soft-delete cascade not declared), no `Scope Isolation` declaration, no `Authoring Intent` block. Compounded by D-4.5-001 — even if §14.2.1 is treated as the canonical schema, none of the convention-required blocks are authored.

§14 declares no DSAR clause. §6.8 catalog (line 9906) lists "Scenario creation, update" as in-scope for DSAR export, but §14 is silent on what fields are exported, what is anonymized, and how cascade-soft-delete on user deprovisioning interacts with `created_by` references. §10092 ("All Requirements, Use Cases, Scenarios, Bid Workspaces, and Marketplace Listings created by deprovisioned user are retained by Organization") mandates retention but §14 doesn't echo or cite this rule.

§14 declares no data-residency behavior. The §4.3.8 entity inherits residency from the parent Workspace via the §1.3 Console Firewall convention, but §14 does not state this. A US-EU residency-locked Workspace whose scenarios are recomputed in a Convex region without residency-aware shard routing would silently leak EU PII to US infrastructure — Severity Rule (c) candidate, but §4.3.8 inherit-from-Workspace pattern is likely sufficient to dodge P0.

**Severity: P1 data_model** — feature unbuildable as written. Cells: `data_model` ❌, `retention` ❌, `dsar` ❌, `residency` ❌, `console_firewall` ❌.

### 2.3 §14.9.5 plan-tier label drift ("Free / Business / Enterprise") → D-4.5-003 (P1 plan_gating)

§14.9.5 acceptance criteria (lines 13868–13872):

```
- [ ] Free: scenarios not available
- [ ] Business: max 10 scenarios, no report integration
- [ ] Enterprise: max 50 scenarios, report integration enabled
```

Three defects in three lines:

1. "Free: scenarios not available" contradicts §14.8.1 which says "Free | 5 scenarios | No report integration; in-app only" AND contradicts §28378 §34.1.1 which says Buyer Free gets Wallet-charged Scenario Modeling AND contradicts AE-12.4-06 ("Free-Tier 5-Scenario Cap").

2. "Business" is not a current plan tier. The canonical Buyer plan-tier enum per §34.1.3 line 28446 is `buyer_free`, `buyer_solo`, `business_starter`, `business_growth`, `business_scale`, `buyer_enterprise`. The display names are "Free / Buyer Solo / Business Starter / Business Growth / Business Scale / Enterprise." There is no single "Business" tier. The "Business: max 10 scenarios" line maps to neither Starter (10), Growth (25), Scale (50), nor any legitimate combined value.

3. "Enterprise: max 50 scenarios" contradicts §14.8.1 which says "Enterprise | Unlimited | Full integration + custom report appendices per §40.1".

The §14.9.5 ACs reflect a v6.0.0-era 3-tier (Free / Business / Enterprise) plan model that was retired in v7.0.0 / v7.1.0 in favor of the 6-tier model. A junior engineer building from §14.9.5 would (a) gate the entire feature off for Free users contrary to §14.8.1, (b) implement a non-existent "Business" tier, (c) cap Enterprise at 50.

**Severity: P1 plan_gating** per "missing/conflicting plan-gating row" rule. Stops a clean build.

### 2.4 §14.8.1 vs §28920 / §28378 conflicting Free-tier semantics → D-4.5-004 (P1 plan_gating)

§14.8.1 (lines 13816–13824) declares:

> Scenario Modeling is a universal Sourcera Method capability per §34.1.1 cell **Scenario Modeling** (wallet-charged on Free/Starter/Growth/Scale; Committed on Enterprise). The per-tier scenario-count caps below are throughput limits, NOT wallet caps; wallet ceilings are authoritative in §34.1.

| Plan tier (per §34.1.1) | Max Scenarios | Report Integration |
| :---- | :---- | :---- |
| Free | 5 scenarios | No report integration; in-app only |
| Starter | 10 scenarios | … |
| Growth | 25 scenarios | … |
| Scale | 50 scenarios | … |
| Enterprise | Unlimited | … |

Conflicts:

1. **Free Allowance vs. count-limit conflation.** §28920 declares the Buyer Free Allowance Counter for `scenario_modeling`: `hard | 10 | buyer_free | n/a | Wallet-exhaustion CTA`. The "10" is the §4.8.7 free-AIOperation allowance for the `scenario_modeling` capability — it is a **wallet meter**, not a **scenario object count cap**. §14.8.1 says "Free | 5 scenarios" (object cap) but the only authoritative Free-tier number registered against `scenario_modeling` in §34.8.5 is 10 (free AIOps). The 5-scenario object cap exists ONLY in §14.8.1 (and AE-12.4-06 ratification queue) and has no §39 home, no §34.1.1 cell, no §5.11 row.

2. **§14.8.1 says "wallet-charged on Free/Starter/Growth/Scale; Committed on Enterprise" but §34.1.1 line 28378 says** Free=Wallet, Solo=Engine-absorbed envelope (per §44), Starter=Wallet, Growth=Wallet, Scale=Wallet, Enterprise=Committed. **§14.8.1 omits Buyer Solo entirely** and conflates Solo into the "wallet-charged" set when Solo is explicitly engine-absorbed under §44.6.

3. **"Per-tier scenario-count caps below are throughput limits, NOT wallet caps"** — but throughput is not the right framing. Object-count caps (max N rows in a parent table per plan tier) are §39 Object Size Constraints, not "throughput." Throughput is requests-per-time-unit. The framing is inconsistent with the §39 nomenclature pattern.

4. **No §39 mirror row for the per-tier scenario count caps.** §34.1.3 line 28447 mandates: "Object size constraints (max workspaces, max requirements, max KB entries, max storage, max API tokens, max webhook endpoints) for each plan are mirrored into §39 Object Size Constraints with `Source: §34.1.1` / `Source: §34.1.2` annotations. §39 NEVER restates a number; it cites the §34.1 cell." A scenario count cap of 5/10/25/50/Unlimited per tier is a textbook object-size constraint and MUST mirror to §39 per the §34.1.3 contract. It does not (Phase 2.4 D-2.4-002 also identified this missing-mirror class — Scenarios is a sibling of the missing rows enumerated there).

5. **Scenario count cap is not in §34.1.1.** §34.1.1 row at line 28378 cites only the metering treatment ("Wallet / Engine-absorbed envelope / … / Committed"); it does not state per-tier scenario object counts. The §14.8.1 phrase "per §34.1.1" is broken on its target — §34.1.1 has no scenario-count cell to cite.

The defect blocks build: §39 plan-quantity mirror is the entitlement-engine source of truth for object caps; engineering will read §39 and find no scenario-cap row, then fall back to §14.8.1's inline restatement, then hit §28920's "10 free ops" and conflate the two limits. Final implementation will diverge from spec intent.

**Severity: P1 plan_gating** per "missing plan-gating row in §5.11/§34.1/§39" rule.

### 2.5 §14.8.1 and §14.9 silent on Solo tier → D-4.5-005 (P1 plan_gating)

§14.8.1 plan-tier table jumps Free → Starter → Growth → Scale → Enterprise with no Buyer Solo row. Buyer Solo (`buyer_solo`) is the v7.1.0 Phase 14.9 destination tier per §34.1.1 / §34.1.3 / §34.2.1 / §34.2.5 / §44.6 / Appendix J Plan Tiers / Appendix M. Solo is the dominant Free-to-paid Defense View / Selection Report conversion path (per §28405). Solo MUST be represented in any §14 plan-gating table.

The Solo treatment for Scenario Modeling per §28378 is "Engine-absorbed envelope (per §44)" — different from Free's "Wallet" treatment. §14.8.1 omits Solo entirely, which means:
- Engineering implementing the throttling layer per §44.6.4 has no Solo-specific scenario-count cap to enforce.
- The Solo per-evaluation $199 path (§34.2.5) interaction with scenario lifecycle is unauthored.
- §44.6.1 Surface Hide List does not reference §14 surfaces (Comparison view, Sensitivity chart, Simulation overlay) — so Solo's surface treatment for these is undefined.

§14.9.5 ACs are even worse: only Free / Business / Enterprise (already filed in D-4.5-003), so Solo is doubly missing.

**Severity: P1 plan_gating**.

### 2.6 §14 missing API contract (request/response/error/auth/rate-limit/idempotency) → D-4.5-006 (P1 api)

§32.5 (lines 26328–26338) declares CRUD endpoints:

```
GET    /v1/workspaces/{workspace_id}/scenarios
POST   /v1/workspaces/{workspace_id}/scenarios
GET    /v1/workspaces/{workspace_id}/scenarios/{scenario_id}
PATCH  /v1/workspaces/{workspace_id}/scenarios/{scenario_id}
DELETE /v1/workspaces/{workspace_id}/scenarios/{scenario_id}
```

…with no associated request body schema, no response body schema, no auth scope declaration, no rate-limit class, no cursor pagination contract (§32 mandates cursor pagination default 50 / max 250), no idempotency-key semantics for POST/PATCH/DELETE, no concrete examples, no link to the §14 entity, and no error code list. §14 itself never references §32 endpoints, never specifies POST `recalculate`, POST `compare`, POST `simulate`, POST `sensitivity`, POST `export`. Several inline behaviors implicitly require API surfaces that aren't enumerated:

- §14.4.3 "User can manually refresh results via 'Recalculate' button" → no `POST /v1/workspaces/{wid}/scenarios/{sid}/recalculate` endpoint declared.
- §14.5.3 sensitivity analysis → no endpoint declared.
- §14.5.2 CSV export → no endpoint declared; §40.1 export framework exists but §14.5.2 doesn't bind.
- §14.6.3 Phase 12 lock — what server-side action? No endpoint, no webhook trigger.

Appendix I codes `invalid_scenario_id` (404, line 43016) and `scenario_limit_exceeded` (403, line 43033) exist, but §14 doesn't cite them. No 422 validation error code is declared for the §14.3.1 rule violations. No 409 conflict code for concurrent-edit. No 503 wallet-exhausted code.

**Severity: P1 api** per "missing API contract" rule.

### 2.7 §14 missing webhook contract → D-4.5-007 (P1 webhook)

§31 declares no `scenario.*` webhook events. Appendix C catalog has no scenario webhook entries. The only scenario-related notification is the §29 line 24858 in-app notification `scenario_saved` (low-priority, in-app only). Webhook semantics for the events that downstream subscribers (CRM sync, integration partners, customer ETLs) would expect are silent:

- `scenario.created` → fires on POST.
- `scenario.updated` → fires on PATCH (parameter change).
- `scenario.deleted` → fires on DELETE (soft-delete).
- `scenario.recalculated` → fires when results recompute (§14.4.3).
- `scenario.locked` → fires at Phase 12 entry per §14.6.3.

§14.6.3 says "All scenarios locked; parameters and results immutable" but does not declare an audit-log emit or webhook fan-out. The §4.7.1 Console Bridge Event projection at line 19431 lists "Scenarios" as NEVER CARRIED — so no buyer→seller bridge. But the buyer-internal webhook fan-out is also unspecified.

**Severity: P1 webhook** per "missing webhook contract" rule.

### 2.8 §14 missing PostHog event taxonomy citation → D-4.5-008 (P2 posthog_event)

§51 (lines 41958–41961) registers four events:

| Event | Trigger | Properties |
|---|---|---|
| `scenario_created` | New scenario saved | `workspace_id`, `parameter_count`, `override_types` |
| `scenario_saved` | Scenario changes saved | `workspace_id`, `scenario_id`, `changes_from_baseline` |
| `scenario_compared` | Comparison view opened | `workspace_id`, `scenario_count`, `time_spent_seconds` |
| `scenario_deleted` | Scenario deleted | `workspace_id`, `scenario_id` |

§14 does not cite these. Coverage gaps: no `scenario_simulation_entered` / `scenario_simulation_exited` / `scenario_simulation_saved` events for the §14.7 simulation flow (which the prompt describes as a distinct mode warranting analytics coverage to validate keyboard-flow adoption). No `scenario_recalculated` event for §14.4.3 manual recalculation. No `scenario_sensitivity_viewed` for §14.5.3. No `scenario_csv_exported` for the §14.5.2 export. No `scenario_locked` event for §14.6.3 Phase 12 transition.

§51.2 line 24858 `scenario_saved` notification semantics (saver-only, in-app only) collide with the §51 PostHog `scenario_saved` event of the same name. Two different identifiers, same name, distinct namespaces — naming hygiene risk.

**Severity: P2 posthog_event** — feature ambiguity that two engineers would resolve differently (which lifecycle steps to instrument).

### 2.9 §14 missing state machine for scenario lifecycle → D-4.5-009 (P1 state_machine)

§14.6 prosaically describes states (created → editing → locked at Phase 12 entry → archived on Workspace soft-delete) plus a special "Original Scoring" implicit immutable scenario. The convention #5 contract requires a table with columns `From | To | Trigger | Conditions | Notes`. None exists in §14, none in Appendix L (which post-Phase-1 covers InternalCommentThread, BuyerReferral, Pro Trial Seat Grant, KB Entry, KB Document, Target Account, AIOperation, Defense View — but not Scenario).

Missing transitions a junior engineer cannot infer from prose alone:
- `(init) → created` (POST creates row).
- `created → edited` (PATCH changes parameters).
- `created → results_recomputed` (recalculate completes).
- `edited → results_recomputed` (recalculate after parameter change).
- `created/edited → locked` (Workspace enters Phase 12).
- `locked → locked` (re-read; no mutations).
- `* → soft_deleted` (DELETE; cascade from Workspace soft-delete).
- Rejected: `locked → edited` (HTTP 422 — what error code?).
- Rejected: `(init) → created` after Phase 12 entry on Workspace (what error code? §14 silent).

The implicit "Original Scoring" scenario lifecycle is also unauthored — created at Workspace creation? At Phase 10 entry? Persisted in DB or computed on-the-fly?

**Severity: P1 state_machine** per "missing state machine" rule.

### 2.10 §14 missing audit-event contract → D-4.5-010 (P2 observability)

§14.6.2 says "All scenario edits (parameter changes) logged with user, timestamp, before/after values" — but does not cite §4.6.1 AuditEvent entity, does not declare an `audit_action_type` enum value (e.g., `scenario_parameter_changed`, `scenario_locked_at_phase_12`, `scenario_deleted`, `scenario_results_recalculated`), does not specify the Appendix J registration of those audit-action enum values, does not bind to the §40.2 audit-log retention contract (30d Free, 1y Starter/Growth, 3y Scale, 7y Enterprise per §28389). The "before/after values" semantics for the parameters JSON blob are unspecified — entire diff or per-field?

§50 Ops Console audit observability requires every privileged or financially-relevant action to emit an AuditEvent — Scenario Modeling is wallet-charged so its parameter-change events have financial relevance.

**Severity: P2 observability** — under-specified instrumentation; two engineers would resolve audit_action_type differently.

### 2.11 §14 missing AIOperation / wallet contract → D-4.5-011 (P1 entitlement)

§34.1.1 line 28378 says Scenario Modeling is wallet-charged on Free/Starter/Growth/Scale; engine-absorbed on Solo; Committed on Enterprise. §28920 says `scenario_modeling` is a hard-cap capability with 10 free ops on `buyer_free`. §40579 §51 PostHog row says `scenario_modeling` capability → `scenario_draft`, `tco_narrative_render` AIOps. But §14 itself never states:

- Which lifecycle action triggers an AIOperation (recalculation? sensitivity? simulation? CSV export? compare? what-would-flip?).
- Whether each action is one or many AIOperations (sensitivity analysis is multi-iteration — one AIOp per parameter scan, or a single batched AIOp?).
- The hold-charge-on-failure semantics per §4.8.1.
- The rate-limit class and idempotency key.
- The cost basis / `cost_base` reference per §34.14.
- The §44.6 engine-absorbed throttling thresholds for Solo.

The absence forces engineering to wire the wallet meter to every scenario operation (over-charge) or to none (under-charge / revenue leakage). Severity Rule (d) candidate but P1 unless evidence of double-charge in the wild.

**Severity: P1 entitlement**.

### 2.12 §14.4.1 algorithm under-specified for rubric_overrides.pm_value → D-4.5-012 (P2 acceptance_criteria)

§14.4.1 formula:

```
blended_score =
  (SUM(vendor_use_case_score × effective_weight) + (tco_percentile × tco_value_weight))
  /
  (SUM(effective_weight) + tco_value_weight)
where:
  effective_weight = weight_override[use_case_id] OR original_weight[use_case_id]
  vendor_use_case_score uses rubric_overrides.pm_value if provided
  tco_percentile = vendor's percentile in TCO ranking (0.0–1.0)
```

Two reads disagree:

1. **`rubric_overrides.pm_value` semantics undefined.** §13 declares the rubric as `FM` (Functional Match yes/partial/no), `PM` (Performance Match 1–10 or 0–100), `EJ` (Expert Judgment 1–10), and `EX` (Exclusion). The `pm_value` override per §14.2.1 is bounded `0.1 ≤ pm_value ≤ 0.9`. Reads diverge:
   - Read A: `pm_value` is the **weight** of PM-graded requirements within a use case score (0.1 = PM contributes 10%, 0.9 = PM contributes 90%; remainder split FM/EJ).
   - Read B: `pm_value` is the **per-grade scaling factor** applied to PM scores (multiplies PM scores by the value).
   - Read C: `pm_value` is something else entirely tied to a v6.0.0 rubric model now deprecated.

   The 0.1–0.9 range constrains nothing definitively. Engineering will guess.

2. **Denominator-zero edge case incompletely covered.** §14.3.1 validation rule "No all-zero weights" requires `SUM(weight_override[*]) + SUM(original_weight[non-excluded]) > 0`, which prevents the SUM(effective_weight) numerator from being zero. But the denominator `SUM(effective_weight) + tco_value_weight` could still be zero if SUM(effective_weight) = 0 (validation allows zero of any individual override) AND tco_value_weight = 0 (validation allows 0.0). Validation table (§14.3.1) does not bar the dual-zero combination. NaN/Infinity on save → ranking explodes silently.

3. **`vendor_use_case_score` upstream definition (§13.7) is not cited from §14.4.1.** §13.7 has its own scoring math and a vendor_use_case_score formula. §14.4.1 should cite §13.7.x by anchor; it instead silently overrides without saying so.

**Severity: P2 acceptance_criteria** — algorithm is not reproducible from §14 alone; two engineers will produce divergent vendor rankings.

### 2.13 §14.5.1 5-scenario comparison cap inline restatement → D-4.5-013 (P2 numerical_singleton)

§14.5.1 declares "Max scenarios in comparison: 5 simultaneous". This is an object-size constraint and per Authoring Convention #10 belongs in §39 with a `Source: §14.5.1` annotation OR §14.5.1 should cite §39. Neither side has the row; the number is inline only.

§14.8.2 also restates "comparison matrix (shows top 5 scenarios only)" inline — second restatement of the same number.

**Severity: P2 numerical_singleton**.

### 2.14 §14.4.3 performance budget inline restatement → D-4.5-014 (P2 performance_budget)

§14.4.3 declares: "Latency: <2 seconds (cached scoring data)". Performance budget literals belong in §44 (Performance Budgets). §44 has no Scenario Modeling row. The 2-second latency target is inline-only; no §44 home; no SLO measurement cadence; no breach handling; no monitoring contract.

§14.7.1 implies a real-time recalculation latency for inline slider movement ("Real-time recalculation: Ranking updates live as user adjusts sliders/inputs") with no quantified budget. Sensitivity analysis (§14.5.3) has no latency budget. CSV export (§14.5.2) has no budget.

**Severity: P2 performance_budget**.

### 2.15 §14 missing Appendix M surface/engine mapping rows → D-4.5-015 (P1 surface_engine_mapping)

§14 introduces multiple distinct UI surfaces and engine concepts:

- Scenario list (per Workspace).
- Scenario detail / form (parameter editor).
- Scenario comparison matrix (§14.5.2).
- Scenario sensitivity analysis chart (§14.5.3).
- Simulation Mode overlay (§14.7).
- "Original Scoring" implicit scenario.
- Scenario CSV export.

Per Authoring Convention #12 every UI surface or engine concept needs an Appendix M.1 row with engine binding, hide-list, plan-tier visibility, Solo treatment, residency. Appendix M.1 has rows for Scoring/Pulse/Defense View etc., but the spec-wide grep for §14 anchors in Appendix M.1 returns no rows mapped explicitly to §14 surfaces. The §M.4 `appendix_m_coverage_on_diff` CI gate would fire on any new §14 work.

**Severity: P1 surface_engine_mapping**.

### 2.16 §14.6.3 "Phase 12" reference disambiguation → D-4.5-016 (P3 documentation_gap)

§14.6.3 "**Immutability After Phase 12**" — "Phase 12" without anchored citation. Three plausible referents in v7.1.0 corpus: (a) §10.13 Buyer Evaluation Phase 12 (Decision); (b) `_integration/Integration_Prompts.md` Phase 12 (Glossary canonicalization program); (c) `_integration/Integration_Prompts_v7.1.md` Phase 12 (Surface Compression CI Gate). Context makes (a) the obvious referent but the spec convention is anchor-cited references.

**Severity: P3 documentation_gap**.

### 2.17 §14.7 simulation-mode session, concurrency, navigation-loss → D-4.5-017 (P2 acceptance_criteria)

§14.7.2 "Single simulation per user session" — "session" undefined. WorkOS auth session? Browser tab? Convex live-query session? Two browser tabs from the same user produce two simulations? §14.7.2 also says "If user navigates away without saving, simulation state is lost" — no confirmation prompt declared, no draft preservation, no recovery on accidental close. UX antipattern for a wallet-charged AI feature where the user has invested 5 minutes of slider movement.

§14.7.1 is silent on concurrency: two users editing the same scenario in Simulation Mode — no optimistic locking, no `version` field on §14.2.1 schema, no conflict-resolution UX, no last-write-wins declaration.

**Severity: P2 acceptance_criteria** — two engineers would resolve session/concurrency differently.

### 2.18 §14 cascade-soft-delete and vendor/use-case removal → D-4.5-018 (P2 retention)

§14 silent on cascade behavior:

- Workspace soft-deleted → scenarios soft-deleted (§40.2 line 31302 covers Internal Comment Thread cascade for parents including Scenario; the inverse — Workspace → Scenario — is unstated).
- Vendor disqualified mid-evaluation (§25.3) → `scenario.parameters.excluded_vendors` and `scenario.results.ranked_vendors` references that vendor — what happens? Silent.
- Use Case deleted → `scenario.parameters.weight_overrides[use_case_id]` references that use case — what happens? Silent.
- Use Case excluded → `scenario.parameters.excluded_use_cases` references — what happens? Silent.
- Vendor (TargetAccount) hard-deleted via DSAR — scenario results contain `vendor_id` — anonymization path?
- User who created scenario deprovisioned — `created_by` reference handling? §10092 says scenarios are retained at the Org level; §14 silent on `created_by` substitution.

**Severity: P2 retention** — soft-state cascade behavior unspecified across multiple parent entities.

### 2.19 §14 missing empty/loading/error UI states → D-4.5-019 (P2 error_state)

§14 declares no:
- Empty state ("no scenarios yet" — first-time user landing on the Scenario tab pre-Phase 10).
- Loading state for recalculation (§14.4.3 says <2s but does not declare a spinner / skeleton / progress treatment).
- Error state for save failure (validation passes locally, server-side fails on wallet exhaustion / Phase 12 lock race).
- Error state for compare-of-zero (user opens compare view with no scenarios saved).
- Error state for sensitivity analysis on a single-vendor workspace.
- Out-of-phase error: user attempts to access §14 surfaces before Phase 10 (§30.5 Scenario Commands declares Phase 10+ but §14 doesn't declare phase-gating).

**Severity: P2 error_state**.

### 2.20 §14 missing accessibility / mobile parity / RTL i18n → D-4.5-020 (P2 mobile_divergence)

§38.x (line 30878–30880) declares Scenario Modeling mobile parity as `parity / simplified / not_supported` (desktop / tablet / phone) with note "Matrix-intensive. Tablet: read-only comparison view." §14 does not cite §38; §14 is silent on the read-only tablet comparison view, on the not-supported phone behavior (graceful degradation? error message? hidden tab?), on accessibility for the comparison matrix (large grid keyboard nav), the sensitivity chart (color-only encoding? alt text?), the simulation mode sliders (keyboard-only flow? screen-reader announcement of live recalculation?). RTL/locale mirror for the comparison matrix (§38.10) is unaddressed.

**Severity: P2 mobile_divergence**.

### 2.21 §14.7.1 Simulation Mode keyboard-shortcut context drift vs Appendix B → D-4.5-021 (P3 documentation_gap)

§14.7.1 says "Press `S` while in **Scenario view**" but §37 Appendix B (line 37599) declares the context as "**Scoring phase**". Two different contexts for the same shortcut; engineering needs to decide whether the trigger is bound to the Scenario tab focus or to the Phase-10/11 scoring window. §14.7.1 also omits `Cmd+1`–`Cmd+5` (load scenario 1–5), `=` / `-` (weight increment / decrement) which Appendix B authors at lines 37602–37604.

**Severity: P3 documentation_gap**.

### 2.22 §14.5.2 Section 11.3.2 reference is unanchored → D-4.5-022 (P3 documentation_gap)

§14.5.2 cites "Matrix view (Section 11.3.2)" without an anchor link. Spec convention is anchored heading slugs. Other §14 cross-references (§13.7.3, §40.1, §34.1, §39) follow the same un-anchored pattern — fix in one pass.

**Severity: P3 documentation_gap**.

### 2.23 §14 heading anchor `&` characters → D-4.5-023 (P3 documentation_gap)

Headings:

```
## 14.4 Scenario Scoring & Ranking {#14.4-scenario-scoring-&-ranking}
## 14.5 Scenario Comparison View — n/a (no &)
## 14.6 Scenario Lifecycle & Permissions {#14.6-scenario-lifecycle-&-permissions}
## 14.8 Plan Limits & Report Integration {#14.8-plan-limits-&-report-integration}
```

§14.4, §14.6, §14.8 anchor slugs contain literal `&` — most Markdown / GFM anchor generators slugify `&` to `--` or `and`. The slugs are not valid HTML fragment IDs in some renderers (will be stripped/escaped). Inline TOC links at §494 / §502 / §506 reproduce the slug verbatim, locking-in the broken anchors.

**Severity: P3 documentation_gap** (heading-syntax convention violation; cosmetic but reproducible).

### 2.24 §14.5.3 sensitivity analysis scope and AIOperation classification → D-4.5-024 (P2 acceptance_criteria)

§14.5.3 specifies sensitivity analysis with:
- X-axis: Parameter (weight override, TCO weight, PM override, threshold).
- Y-axis: Rank change (for #1 ranked vendor).
- Visualization: Line chart.

Issues:
- "Rank change for #1 ranked vendor" — only the top-ranked vendor's sensitivity is shown? What if the user cares about rank flips at #2/#3 (the realistic decision frontier)?
- Parameter list ("weight override") is a category, not a single value — how are 50 use-case weights aggregated into one X-axis dimension?
- Per-tile AI operation? The §14.5.3 trigger fires "View Sensitivity" button — is this a wallet-charged AIOperation? §28920 / §40579 only register `scenario_modeling` capability with PostHog labels `scenario_draft, tco_narrative_render` — sensitivity is unmapped.
- "Interaction: Hover point → tooltip" — mobile / touch behavior? §38.7 gesture equivalent unspecified.

**Severity: P2 acceptance_criteria**.

### 2.25 AE-12.4-06 Free-Tier 5-Scenario Cap unratified → D-4.5-025 (P2 authored_extension)

`_integration/AUTHORED_EXTENSIONS_LEDGER.md` row AE-12.4-06 ("Free-Tier 5-Scenario Cap") status = `pending`. §14.8.1 row "Free | 5 scenarios" depends on this AE. Per the AE Ledger release-gate policy ("CLAUDE.md §16 — open `pending` rows must ratify before each version stamp"), this row is a v7.1.1 stamp blocker. The §14.8.1 inline number cannot land authoritatively until ratified. Per CLAUDE.md §16 v7.1.0 stamp gate — AE-12.4-06 was not on the v7.1.0 ratification queue but should join the v7.1.1 queue.

**Severity: P2 authored_extension**.

### 2.26 §14 silent on Phase 12 lock atomicity, post-Phase-12 creation, simulation-in-flight at lock → D-4.5-026 (P2 acceptance_criteria)

§14.6.3 "At Phase 12 entry: All scenarios locked; parameters and results immutable" — three unaddressed edge cases:

1. **Phase 12 lock race vs. in-flight save.** A user clicks Save on a parameter change at the same moment the Workspace transitions to Phase 12. Does the save commit (last-write-wins) or fail (HTTP 422 post-lock)? No state-machine row, no error code, no acceptance criterion.

2. **Simulation Mode active at Phase 12 entry.** Per §14.7.2 simulation is volatile session state. Phase 12 entry does not necessarily forcibly exit Simulation Mode in the active user session. User pressing `Cmd+S` post-lock to save the simulation as a new scenario — error? Silent fail?

3. **Scenario create attempt after Phase 12 entry.** §14.6.1 "Creator: Workspace Owner or Use Case Lead" — no Phase gate stated. POST after Phase 12 — §14 silent. Does the API return 422? 403? Pass through? An entire scenario could be created post-decision, breaking the §14.6.3 immutability contract on the lock-everything-at-Phase-12 promise.

**Severity: P2 acceptance_criteria**.

### 2.27 §14.6.1 RBAC silent on §5.11 row → D-4.5-027 (P2 rbac)

§14.6.1 declares "Creator: Workspace Owner or Use Case Lead" and §14.6.2 "Edit: Only creator or Workspace Owner" / "Delete: Only Workspace Owner". §5.11 Feature Access Matrix has no `scenario_create`, `scenario_edit`, `scenario_delete`, `scenario_lock` row. Per Phase 3.2 D-3.2-022 (already filed): Q&A Threads under §14 had `plan_gating` ⚠ → ❌ — extends to RBAC rows. The §5.11 grid omission means a junior engineer wiring entitlement enforcement has no canonical RBAC binding for the Scenario row group. Workspace Admin role omission (§14.6.1 mentions only Owner + Use Case Lead but §14.6.2 may also expect Admin per §5.x role hierarchy — unclear).

**Severity: P2 rbac**.

### 2.28 §14.5.3 sensitivity export rate limit and capability binding → D-4.5-028 (P2 api)

§14.5.3 "Export: Sensitivity data available in CSV export" — no rate-limit class declared, no §40.1 export-format binding, no row in §40.1 catalog for "Scenario Sensitivity Export" (§40.1 has Scenario Export per line 31289 covering name/parameters/summary/score snapshot in JSON or Excel — does not enumerate sensitivity output). CSV file size limit (§39 has no row), payload export rate-limit class (§32.4) unstated.

**Severity: P2 api**.

### 2.29 §14.6.2 audit-trail before/after vs §40.2 retention → D-4.5-029 (P2 retention)

§14.6.2 "All scenario edits (parameter changes) logged with user, timestamp, before/after values" — silent on:
- Audit log retention TTL: scenarios are wallet-charged ≈ financially relevant ≈ should fall under §40.2 "billing audit always 7y per §40.2" (per §28389) — but §14 doesn't bind.
- DSAR cascade: user deprovisioned → audit trail `user_id` reference — anonymized or retained? §6.8 silent on Scenario audit specifically.
- Storage scope: org-scoped audit log shard, or workspace-scoped, or global?
- Audit record schema: AuditEvent fields per §4.6.1 should include `scenario_id`, `from_parameters_hash`, `to_parameters_hash`, `actor_user_id`.

**Severity: P2 retention**.

### 2.30 §14 console_firewall declaration absent on §14 surfaces → D-4.5-030 (P2 firewall_leakage)

§14.2.1 inline schema has no `console = buyer (fixed)` field declaration. §4.3.8 also lacks it (Phase 1.2 D-1.2-004 forwarded). §19.4.1 line 19435 ("Scoring Scenario (§14) | NEVER CARRIED") confirms the firewall intent at the carry-list level, but §14 itself does not echo or assert. Defense-in-depth pattern (per §4.7.1 and the Phase 1.6 D-1.6-001 pattern) requires the entity AND every operation against it to assert the buyer-side console scope. §14 is silent on:
- Seller console returning HTTP 404 on `/v1/workspaces/{wid}/scenarios` paths (the §1.3 firewall pattern).
- Marketplace-domain leakage across multi-Org Workspace shares.
- Scenario read paths within Buyer Console only.

**Severity: P2 firewall_leakage** — feature has firewall intent declared at §19.4.1 but no enforcement contract at §14.

### 2.31 §14 silent on third-party outage handling → D-4.5-031 (P2 acceptance_criteria)

Counterfactual pass on dependency outages:
- **Convex outage** during recalculation → user clicks Recalculate, response timeout, no retry semantics declared.
- **Anthropic outage** during AI-narrated sensitivity analysis (sensitivity narrative is `sensitivity_narrative` capability per §28917) → wallet hold-charge-on-failure unaddressed in §14 (the §4.8.1 generic pattern applies but §14 doesn't cite).
- **Stripe outage** at recalculation moment when AIOp would charge wallet → block save? Allow with deferred charge?

§14 is silent on all three.

**Severity: P2 acceptance_criteria**.

### 2.32 §14.9 ACs not numbered, not testable as written → D-4.5-032 (P2 acceptance_criteria)

§14.9 ACs are bullet checkboxes, not numbered AC rows. §13.10/§14.9/§17.8/§20.7 style requires numbered, testable, observable, measurable, scope-bound criteria. §14.9.1 AC "Save validation enforces: ≥1 vendor remaining, ≥1 use case with weight > 0, parameter ranges" reads as a paraphrase of the §14.3.1 table — should cite the table by row number rather than restating. §14.9.4 "Real-time ranking updates as user adjusts sliders" — what is the latency threshold? What is the measurable observable? §14.9.3 "Vendor row click opens detail view with full score breakdown" — "full" is unscoped. §14.9.5 — already filed in D-4.5-003 as plan-tier drift.

**Severity: P2 acceptance_criteria** — ACs not testable per §13.10 / §17.8 / §20.7 style baseline.

### 2.33 §14 omits glossary entries → D-4.5-033 (P3 glossary)

Multi-section terms used in §14 with no Appendix K entry:
- "Original Scoring" (§14.6.1) — implicit-default-scenario primitive used in §14 only at the moment but referenced via "Original Scoring scenario" in the canonical convention.
- "Simulation Mode" (§14.7) — appears in §14, §30.5 Command Registry, §37 Appendix B Keyboard Reference, §40579 PostHog map; multi-section, no Appendix K entry.
- "Sensitivity Analysis" (§14.5.3) — appears in §14 and §28917 (capability `sensitivity_narrative` is the AI narrative layer over sensitivity); multi-section, no Appendix K entry.

**Severity: P3 glossary**. Appendix K canonicality pattern (Phase 12.3 amendment) — Appendix K is the canonical Glossary, not Appendix B.

### 2.34 §14.4.1 inline TCO percentile definition vs §15 → D-4.5-034 (P3 consistency_drift)

§14.4.1 defines `tco_percentile = vendor's percentile in TCO ranking (0.0–1.0)` inline. The TCO percentile is owned by §15 TCO Modeling — §14.4.1 should cite §15's authoritative TCO percentile formula. Inline restatement is a Convention #10 violation pattern.

**Severity: P3 consistency_drift**.

---

## 3. Counterfactual Pass — Failure Modes per Audit Checklist Item 14

Three realistic failure modes per audited concept, confirming spec coverage:

| Concept | Failure Mode 1 | Failure Mode 2 | Failure Mode 3 | Spec Coverage |
|---|---|---|---|---|
| Scenario CRUD | Concurrent edit race | Phase 12 lock race | Soft-delete cascade from Workspace | UNADDRESSED across all three (D-4.5-009, D-4.5-018, D-4.5-026) |
| Recalculation | Dependency outage (Convex/Anthropic) | Wallet exhausted mid-recalc | Stale scoring data drift | UNADDRESSED (D-4.5-031, D-4.5-011, D-4.5-029) |
| Simulation Mode | Browser crash mid-simulation | Two tabs open same Scenario | Phase 12 entry mid-simulation | UNADDRESSED (D-4.5-017, D-4.5-026) |
| Comparison view | Empty state (no scenarios) | Tablet not_supported (mobile parity) | Scenario referencing deleted Vendor | UNADDRESSED (D-4.5-019, D-4.5-020, D-4.5-018) |
| Sensitivity analysis | Single-vendor workspace | Wallet-exhausted on AI narrative | Mobile gesture equivalent absent | UNADDRESSED (D-4.5-024, D-4.5-011, D-4.5-020) |
| Plan-gate enforcement | Free Allowance vs scenario count cap conflation | Solo tier omitted from caps | "Business" stale-tier label in ACs | UNADDRESSED (D-4.5-004, D-4.5-005, D-4.5-003) |

---

## 4. Self-Challenge Pass

Re-reading findings as a hostile reviewer.

- **D-4.5-001 P0 classification justified.** Two contradictory column constraints AND two contradictory parameter shapes for the same entity name. The parameter-shape conflict (§4.3.9 operational fields vs §14.2.1 weight-override fields) cannot be reconciled by an engineer reading both sections; one must be wrong. Combined with wallet-charged metering (Severity Rule (d)), P0 holds. If the §4.3.9 schema is acknowledged as stale (likely, given §47730 surface translation aligns to §14 weight semantics), promote a remediation that hard-deletes §4.3.9 and inlines the §14.2.1 parameters block into §4.3.8 — and back-checks every dependency on §4.3.9 (none should exist; the §47730 surface row is the only inbound link).

- **D-4.5-003 P1 holds.** A junior engineer building a `BUSINESS` constant or implementing a 50-scenario Enterprise cap will ship the wrong thing.

- **D-4.5-004 P1 holds.** §39 Object Size mirror is the canonical entitlement source; its absence forces an inline-restatement collapse.

- **D-4.5-006 P1 holds.** Five endpoints declared with zero contract material.

- **D-4.5-007 P1 holds.** Webhooks are the integration boundary — silence guarantees production divergence.

- **D-4.5-009 P1 holds.** State machines are required by Convention #5; prose is not acceptable.

- **D-4.5-011 P1 vs P0 boundary.** AIOperation contract silence is a billing-surface ambiguity, but §28920 / §40579 / §28378 collectively pin the wallet treatment at the §34 layer. An engineer reading §34 in isolation will still wire the meter correctly. P1 holds — over- or under-charging is a defect, but resolvable from §34 without §14 elaboration.

- **D-4.5-015 P1 holds.** Appendix M is the v7.1.0 surface/engine contract; missing rows fire the `appendix_m_coverage_on_diff` CI gate.

- **D-4.5-013 / D-4.5-014 P2 holds.** Numerical-singleton drift on a 5-scenario or 2s value is recoverable in spec hygiene; doesn't block builds.

- **D-4.5-022 / D-4.5-023 / D-4.5-016 / D-4.5-021 / D-4.5-033 / D-4.5-034 P3 holds.** Citation hygiene defects.

No demotion or promotion warranted on the self-challenge pass beyond confirming D-4.5-001's P0 standing.

---

## 5. Promotion Plan

All 34 findings (D-4.5-001 through D-4.5-034) promote to `DEFECT_LEDGER.md` in this run. Severity distribution: 1 P0 / 8 P1 / 19 P2 / 6 P3.

Coverage Matrix updates for §14 features F-265 (Scenario Modeling), F-266 (Scenario Definition), F-267 (Scenario Validation), F-268 (Scenario Scoring & Ranking), F-269 (Scenario Comparison View), F-270 (Scenario Lifecycle & Permissions), F-271 (Scenario Simulation Mode), F-272 (Scenario Plan Limits & Reports), F-AE-013 (AE-12.4-06 Free-Tier 5-Scenario Cap), F-090 (Evaluation Scenario Entity) are tightened per §6 below. F-090 already carries Phase 1.2 demotions; this pass adds further demotions on `enums` (D-4.5-001 / D-4.5-005 plan-tier values), `data_model` (D-4.5-001 / D-4.5-002), and `state_machine` (D-4.5-009).

Forwarded to downstream phases: Phase 8 (API + Webhook) inherits D-4.5-006, D-4.5-007, D-4.5-028. Phase 9 (Observability / CI gates) inherits D-4.5-008, D-4.5-010, D-4.5-014, D-4.5-015. Phase 12 (Numerical Singletons) inherits D-4.5-013, D-4.5-014. Phase 14 (Consistency Cross-Document) inherits D-4.5-001 root-cause analysis. AE Ledger gets D-4.5-025 attention for v7.1.1 stamp queue.

---

## 6. Coverage Matrix Cell Tightenings

Per-row tightening on the §14 feature rows (F-265–F-272 + F-090 + F-AE-013):

- **F-265 Scenario Modeling (engine_concept, §14.1).** `data_model` ⚠ → ❌ (D-4.5-001 + D-4.5-002); `acceptance_criteria` ⚠ → ❌ (D-4.5-032); `state_machine` ⚠ → ❌ (D-4.5-009); `api` ⚠ → ❌ (D-4.5-006); `webhook` ⚠ → ❌ (D-4.5-007); `posthog_events` ⚠ → ⚠ (D-4.5-008 — partial coverage); `error_codes` ⚠ → ❌ (D-4.5-006 — only 2 codes registered, no 422/409/503); `plan_gating` ⚠ → ❌ (D-4.5-003 + D-4.5-004 + D-4.5-005); `retention` ⚠ → ❌ (D-4.5-002 + D-4.5-029); `dsar` ⚠ → ❌ (D-4.5-002); `residency` ⚠ → ❌ (D-4.5-002); `console_firewall` ⚠ → ❌ (D-4.5-030); `surface_engine_mapping` ⚠ → ❌ (D-4.5-015); `performance_budget` ⚠ → ❌ (D-4.5-014); `mobile_parity` ⚠ → ❌ (D-4.5-020); `accessibility` ⚠ → ❌ (D-4.5-020); `i18n` ⚠ holds; `observability` ⚠ → ❌ (D-4.5-010); `numerical_singleton` ⚠ → ❌ (D-4.5-013); `glossary` ⚠ → ❌ (D-4.5-033); `empty_state` / `loading_state` / `error_state` ⚠ → ❌ (D-4.5-019); `retry_idempotency` ⚠ → ❌ (D-4.5-006); `rbac` ⚠ → ❌ (D-4.5-027).

- **F-266 Scenario Definition (user_capability, §14.2).** Same pattern as F-265 on `data_model` / `acceptance_criteria` / `state_machine` / `console_firewall` / `retention` / `dsar` / `residency` (D-4.5-001 / 002 / 009 / 030); `enums` ⚠ → ❌ (D-4.5-003 stale plan tier names).

- **F-267 Scenario Validation (engine_concept, §14.3).** `acceptance_criteria` ⚠ → ❌ (D-4.5-012 denominator-zero edge case); `error_codes` ⚠ → ❌ (D-4.5-006 — no 422 validation error code registered for §14.3.1 rules).

- **F-268 Scenario Scoring & Ranking (engine_concept, §14.4).** `acceptance_criteria` ⚠ → ❌ (D-4.5-012 + D-4.5-031); `performance_budget` ⚠ → ❌ (D-4.5-014); `numerical_singleton` ⚠ → ❌ (D-4.5-014 + D-4.5-034).

- **F-269 Scenario Comparison View (surface, §14.5).** `surface_engine_mapping` ⚠ → ❌ (D-4.5-015); `numerical_singleton` ⚠ → ❌ (D-4.5-013); `mobile_parity` ⚠ → ❌ (D-4.5-020); `empty_state` / `loading_state` / `error_state` ⚠ → ❌ (D-4.5-019); `accessibility` ⚠ → ❌ (D-4.5-020); `acceptance_criteria` ⚠ → ❌ (D-4.5-024).

- **F-270 Scenario Lifecycle & Permissions (platform_mechanic, §14.6).** `state_machine` ⚠ → ❌ (D-4.5-009); `rbac` ⚠ → ❌ (D-4.5-027); `acceptance_criteria` ⚠ → ❌ (D-4.5-026); `observability` ⚠ → ❌ (D-4.5-010); `retention` ⚠ → ❌ (D-4.5-029).

- **F-271 Scenario Simulation Mode (user_capability, §14.7).** `acceptance_criteria` ⚠ → ❌ (D-4.5-017 + D-4.5-026); `posthog_events` ⚠ holds (no simulation-specific events registered per D-4.5-008); `documentation_gap` n/a → ⚠ (D-4.5-021 keyboard-shortcut context drift).

- **F-272 Scenario Plan Limits & Reports (pricing_primitive, §14.8).** `plan_gating` ⚠ → ❌ (D-4.5-003 + D-4.5-004 + D-4.5-005); `numerical_singleton` ⚠ → ❌ (D-4.5-013); `authored_extension_status` ⚠ holds (D-4.5-025 — AE-12.4-06 still pending; release-gate flag).

- **F-AE-013 AE-12.4-06 Free-Tier 5-Scenario Cap (pricing_primitive, §14.8.1).** `authored_extension_status` ⚠ → ⚠ (D-4.5-025 — release-gate notice for v7.1.1).

- **F-090 Evaluation Scenario Entity (engine_concept, §4.3.8).** Already demoted per Phase 1.2 D-1.2 cluster. Add: `data_model` (already ❌) — extend with D-4.5-001 (parameter-shape divergence is a worse-than-Phase-1.2 finding); `enums` ⚠ → ❌ (D-4.5-003 plan-tier label drift — not §4.3.8 directly but propagates into §14 entity contract).

---

## 7. Open Cross-Phase Linkage

- D-4.5-001 cross-links to Phase 1.2 D-1.2-004/005/010/012/013 already filed against §4.3.8.
- D-4.5-003 cross-links to D-AS-006 (§34 preamble version drift) and D-AS-013 (Conversion Moment citation hygiene) — same v6→v7 plan-tier-name lineage.
- D-4.5-004 cross-links to Phase 2.4 D-2.4-002 (§39 missing structural plan-quantity mirror rows) — Scenarios is a sibling of the missing rows enumerated.
- D-4.5-005 cross-links to Phase 1.2 D-1.2-002 (Buyer Maya Intake Workspace materializer Solo gap) — Solo plan-tier silence is a v7.1.0 program pattern, not isolated to §14.
- D-4.5-009 cross-links to F-090 retention defects (Phase 1.2 D-1.2-011 status state-machine).
- D-4.5-015 forward-loads §14 surfaces into §M.4 `appendix_m_coverage_on_diff` enforcement scope.
- D-4.5-025 AE-12.4-06 pending → v7.1.1 stamp gate per AE Ledger release-gate policy.

---
