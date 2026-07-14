# Phase 4.6 — §15 TCO Modeling Walk Findings (Scratch Log)

**Phase prompt:** `Audit_Prompts.md → Prompt 4.6 — TCO Modeling (§15)` (line 1328).
**Run completed:** 2026-05-04.
**Scope:** Master Spec §15 end-to-end (lines 13876–14110), §15.1 Overview through §15.7 Acceptance Criteria. Cross-walks into §1.3 Console Firewall, §3.7 State Catalog, §4 entity catalog (no §15-specific entity registered), §4.3.1 Workspace, §4.3.7 Score, §4.8.1 AIOperation `tco_analysis_narrative`, §4.8.7 FreeAllowanceCounter, §4.8 `billing_currency` enum, §5.11 Feature Access Matrix, §6.7 Audit Log, §6.8 DSAR, §13.7.3 Vendor Blended Score (TCO percentile / `tco_value_weight`), §13.8.2 Pricing Requirements (capability-scoring exclusion), §19.4.1 Console Bridge carry list (TCO computations NEVER CARRIED), §21.4 Capability Registry (`tco_modeling`, `tco_analysis_narrative`), §28916 / §28921 Free Allowance Counter rows, §32 API endpoints (none for TCO), §34.1.1 Plan Tiers cell **TCO Modeling** (universal/non-AI), §34.1.1 cell **Export Formats** (CSV / PDF universal; Excel paid-tier-gated), §34.2.5 Solo per-evaluation $199 charge fires on Selection Report PDF export with embedded TCO appendix, §34.8.5 Entitlement Matrix, §38 Mobile Feature Parity Matrix lines 30874–30877 (TCO Configuration / TCO Results / TCO Pricing Response Entry rows), §39 Object Size Constraints, §40.1 Export Formats (TCO appendix tag `tco_appendix` per §33586), §40.2 Retention (no TCO row), §44.1 Performance Targets (no TCO recalc row), Appendix C Notification Event Catalog (no TCO event), Appendix G PostHog Event Taxonomy lines 41967–41970 (4 TCO events registered), Appendix I (1 TCO error code: `tco_narrative_missing_source_calculation`), Appendix J `Pricing Structures` enum (line 43788), Appendix J `Response Types` (`pricing` registered line 43718), Appendix J `billing_currency` (line 43712 cluster), Appendix K Glossary (no TCO / Pricing Requirement / Estimate Range / Discount entries), Appendix M.1 surface/engine row "TCO Modeling (perpetual / subscription / consumption / custom)" (line 47838).

**Inputs read end-to-end:**
- `Sourcera_Master_Spec.md` v7.1.0 §15 (lines 13876–14110) verbatim.
- `Sourcera_Master_Spec.md` v7.1.0 §13.7.3 / §13.7.4 / §13.8.2 (lines 12998–13035) for TCO blending semantics.
- `Sourcera_Master_Spec.md` v7.1.0 §19.4.1 line 19449 (TCO computation firewall carry rule).
- `Sourcera_Master_Spec.md` v7.1.0 §28916 / §28921 (capability rows for `tco_analysis_narrative` / `tco_modeling`).
- `Sourcera_Master_Spec.md` v7.1.0 §32.5 endpoint enumeration (lines 26262–26416) — confirmed no `/v1/.../tco/*` or `/v1/.../pricing-requirements/*`.
- `Sourcera_Master_Spec.md` v7.1.0 §32.8 billing endpoint detail (lines 26508–28067) — no TCO billing endpoints.
- `Sourcera_Master_Spec.md` v7.1.0 §34.1.1 cell **TCO Modeling** (line 28379) and cell **Export Formats** (line 28395).
- `Sourcera_Master_Spec.md` v7.1.0 §38 mobile parity rows (lines 30874–30877).
- `Sourcera_Master_Spec.md` v7.1.0 §39 entire table (lines 31083–31272) — no Pricing Requirement / TCO Configuration / TCO Use Case rows.
- `Sourcera_Master_Spec.md` v7.1.0 §40.1 Export Formats (lines 31277–31291).
- `Sourcera_Master_Spec.md` v7.1.0 §40.2 Retention table (lines 31293–31332) — no TCO row.
- `Sourcera_Master_Spec.md` v7.1.0 §44.1 Performance Targets (lines 31727–31748) — no TCO row.
- `Sourcera_Master_Spec.md` v7.1.0 Appendix C (lines 41340 onward) — no TCO notification event.
- `Sourcera_Master_Spec.md` v7.1.0 Appendix G lines 41967–41970 (4 TCO PostHog events).
- `Sourcera_Master_Spec.md` v7.1.0 Appendix I (lines 42995 onward) — only `tco_narrative_missing_source_calculation` (43020) registered.
- `Sourcera_Master_Spec.md` v7.1.0 Appendix J `Pricing Structures` (line 43788), `Response Types` (line 43718).
- `Sourcera_Master_Spec.md` v7.1.0 Appendix K Glossary (lines 46704–47323) — no TCO / Pricing Requirement / Estimate Range / Discount entries.
- `Sourcera_Master_Spec.md` v7.1.0 Appendix M.1 line 47838 — surface row labels "(perpetual / subscription / consumption / custom)" not matching the canonical `pricing_structure` enum.
- `_audit/FEATURE_INVENTORY.md` rows F-273 through F-278 + F-AE-014 (AE-12.4-07).
- `_audit/COVERAGE_MATRIX.md` row format and severity definitions.
- `Audit_Prompts.md` → Prompt 4.6 (lines 1328–1340).
- `_audit/DEFECT_LEDGER.md` Phase 4.4 / Phase 4.5 row format precedent.

**Defect-ID convention:** `D-4.6-NNN`.

**Severity-rule application.** P0 reserved for billing-surface ambiguity allowing revenue leakage (rule d), firewall breach (rule a), or PII exposure (rule b). TCO is non-AI / non-metered per §28921 (`tco_modeling | n/a (non-AI) | n/a | buyer_free | n/a | n/a (non-AI; deterministic calculator)`); the only indirect billing-surface coupling is via the Solo $199 per-evaluation charge which fires on Selection Report PDF export (which embeds the TCO appendix per §33586 `tco_appendix`). A TCO algebra ambiguity that produces non-deterministic Selection Report content does NOT cross the revenue-leakage threshold for P0 — the charge trigger is the PDF export event, not the TCO total. P1 for any §15 feature unbuildable as written (missing entity, missing API contract, missing error code, missing webhook, missing acceptance criteria, missing plan-gating row in §5.11/§34.1/§39, conflicting numerical singletons, undefined currency / FX semantics on a multi-currency-eligible surface). P2 for ambiguity that two engineers would resolve differently. P3 for citation hygiene.

**Self-challenge revisions:** Logged inline at §6 below.

---

## 1. Sources Read End-to-End

See "Inputs read end-to-end" block above. Walk pattern: §15 verbatim → cross-document hop on every numerical, every cited section, every pricing-structure value, every plan-tier label, every export reference, every audit-event candidate, every capability invocation. Counterfactual pass on (a) vendor in EUR vs Workspace USD with no FX policy, (b) `percentage_of_license` circular reference, (c) `estimate_range` with `min > max`, (d) `tiered` overflow tier (projected_seats > max_qty of highest tier), (e) `discount.applied_to = "Years 2–3"` with `projection_years = 1`, (f) percentile divide-by-zero when N = 1 vendor, (g) ties in vendor TCO ranking, (h) vendor non-response on a required pricing requirement, (i) Workspace currency change mid-evaluation, (j) Convex outage during recalc, (k) DSAR on `created_by` of TCO config, (l) cross-residency vendor responses, (m) two Use Case Leads concurrent edits.

---

## 2. Findings (pre-promotion to ledger)

### 2.1 Currency / FX semantics undefined for multi-vendor TCO → D-4.6-001 (P1 data_model)

§15.3.1 declares the projection currency: `Currency: Workspace default (e.g., USD)`. §15.5.1 declares the configuration UI: `Currency (dropdown, workspace default)`. §15.2.3 vendor-input schemas explicitly accept a currency-bearing payload on every pricing structure: Flat (`amount, currency`), One-Time (`amount, currency`), Estimate Range (`min_amount, max_amount, currency`). The schema permits a vendor in Germany to submit `{amount: 50000, currency: 'EUR'}` against a Workspace whose default is USD. §15 specifies no FX-rate locking, no FX-rate source, no presentation-time vs persistence-time conversion contract, no rule for handling currency-mismatched vendor responses, no validator on `vendor_response.currency vs workspace.currency`, and no audit-trail entry for FX-rate refresh.

§4.8.1 AIOperation establishes the canonical FX pattern (`billing_currency` enum, `fx_rate_locked` Decimal(12,8), Treasury daily-rate locking per C.84, FX-parity preservation through reversals — line 8068 / 8129 / 8144). §4.8.16 / §4.4.19 PromotedListing repeats the pattern (`billing_currency` enum, `fx_rate_locked_to_usd`, immutability post-purchase — line 8826 / 8902). §15 invokes none of this machinery.

Workspace itself has no `currency` field declared in §4.3.1 (verified in Phase 1.2 / Phase 2 audit chains). `Workspace default` is therefore an undefined column reference; the §15.5.1 dropdown writes to a field that does not exist.

Two production reads diverge: a finance-aware engineer locks vendor-supplied currency at submit time and converts to Workspace currency on render via the Treasury daily rate; a naive engineer treats every `amount` as the Workspace currency regardless of the vendor-supplied `currency` value. Both reads pass §15 acceptance criteria as written; only the first produces correct cross-vendor comparison. Multi-currency TCO is unbuildable.

**Severity: P1 data_model** — feature unbuildable as written across the multi-currency dimension.

### 2.2 Pricing Requirement is an unregistered entity → D-4.6-002 (P1 data_model)

§15.2.2 declares a `Pricing Requirement Schema` as a prose JSON literal (lines 13895–13917): `{id, use_case_id, title (≤100 chars), description (≤300 chars), type=Pricing, pricing_structure (enum), weight=0, response_required (boolean), unit (string)}`. The schema is not authored against the §4 convention: no `Field | Type | Constraints | Notes` table, no `id (UUID)`, no `org_id (FK)`, no `workspace_id (FK)`, no `console=buyer (fixed)` enum, no `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at`, no scope isolation declaration, no required indexes, no retention rule, no DSAR cascade, no residency clause, no Authoring Intent block. The entity is not registered as a row in §4.3 alongside Requirement (§4.3.6) — pricing requirements appear to share the Requirement entity contract via `type='Pricing'` (§43718 Appendix J `Response Types: ... pricing`), but §15 does not state this explicitly, nor does §4.3.6 Requirement carry the §15.2.2 fields (`pricing_structure`, `response_required`, `unit`).

The dual-mode interpretation produces inconsistent reads: implementer A authors a separate `PricingRequirement` table with the §15.2.2 schema; implementer B extends the Requirement table with the §15.2.2-only fields. Both are buildable; only one persists correctly under DSAR / residency / retention rules established in §4.3.6.

**Severity: P1 data_model** — entity definition convention violated; feature unbuildable as written without a canonical §4 row.

### 2.3 TCOConfiguration is an unregistered entity → D-4.6-003 (P1 data_model)

§15.5.1 declares the TCO Configuration UI inputs (`projection_years`, `initial_seat_count`, `seat_growth_rate`, `currency`) but §4 has no `TCOConfiguration` entity row. The configuration is presumably stored on the Workspace, the TCO Use Case, or a dedicated entity. §15 is silent. No field table, no scope isolation, no indexes, no retention, no audit-event-on-amendment registration, no DSAR / residency cascade. The persistence target is undefined.

The §15.5.2 audit-trail-of-amendments requirement ("Editing & Recalculation: ... Notification: Toast confirms 'TCO projections updated.'") is silent on AuditEvent emission, on `created_by` / `updated_by` capture, on prior-version retention, and on the audit-event action type registered in Appendix J `audit_event_action_type`. The §6.7 audit catalog does not enumerate any TCO-related action.

**Severity: P1 data_model** — entity definition convention violated; audit-trail-of-amendments cannot be implemented as written.

### 2.4 §15.7.5 plan-tier label drift ("Free / Business / Enterprise") → D-4.6-004 (P1 plan_gating)

§15.7.5 (lines 14107–14110):

```
- [ ] Free: not available
- [ ] Business: max 20 pricing requirements
- [ ] Enterprise: unlimited pricing requirements
- [ ] Over-limit: error tooltip on create button (Business)
```

Three defects in four lines:

1. "Free: not available" contradicts §15.6.1 which declares the Free cap at 5 pricing requirements (line 14062) AND contradicts §28379 §34.1.1 cell **TCO Modeling** which is "Included (non-AI)" on every plan including Buyer Free.

2. "Business" is not a current plan tier. The canonical Buyer plan-tier enum per §34.1.3 is `buyer_free`, `buyer_solo`, `business_starter`, `business_growth`, `business_scale`, `buyer_enterprise`. There is no single "Business" tier. "Business: max 20" maps to §15.6.1 row Starter (20), but the v7.1.0 plan-tier registration (Phase 14.9) requires Solo (Buyer Solo per §34.1.1.1 / §34.1.3 / Appendix J `buyer_plan_tier`) to be enumerated explicitly in every plan-gating reference.

3. "Over-limit: error tooltip on create button (Business)" implies a single-tier behavior, but §15.6.1 declares the cap on all four non-Unlimited tiers (Free 5 / Starter 20 / Growth 100 / Scale Unlimited / Enterprise Unlimited). Solo is missing entirely.

**Severity: P1 plan_gating** — plan-tier labels drift from canonical v7.1.0 registry; AC checkboxes contradict §15.6.1.

### 2.5 §15.6.1 inline numerical caps not in §34.1.1 → D-4.6-005 (P1 numerical_singleton)

§15.6.1 (lines 14060–14066) inline-restates per-tier pricing-requirement caps:

| Plan tier | Max Pricing Requirements per Workspace |
| Free | 5 |
| Starter | 20 |
| Growth | 100 |
| Scale | Unlimited |
| Enterprise | Unlimited |

Convention #10 (Numerical Singletons) requires every dollar / character / count limit to have exactly one authoritative home. §34.1.1 has no cell **Pricing Requirements per Workspace** — the table is bypassed. §39 has no row citing §34.1.1 cell **Pricing Requirements per Workspace** (the §39 mirror pattern, e.g., line 31128 for Requirements per Workspace, is not applied). Buyer Solo is absent from the §15.6.1 table — Phase 14.9 plan-tier registration requires explicit Solo enumeration.

The §15.6.1 introductory sentence references "§34.1.1 cell **TCO Modeling** (Included, non-AI on every plan)" but the cap values themselves are inline.

AE-12.4-07 (Free-Tier 5 Pricing-Requirement Cap, F-AE-014, status `pending`) acknowledges the Free 5 cap as an Authored Extension but does not address the broader §34.1.1 / §39 placement gap.

**Severity: P1 numerical_singleton** — five inline numerical values that should live in §34.1.1 / §39.

### 2.6 §15.2.2 inline character caps not in §39 → D-4.6-006 (P1 numerical_singleton)

§15.2.2 schema declares `title: string (≤100 chars)` and `description: string (≤300 chars)`. §39 Object Size Constraints has no row for Pricing Requirement (or, if Pricing Requirement is folded into Requirement, the limits diverge from §31091 / §31092 — Requirement title is 500 chars and description is 10,000 chars in §39). Two readings: (a) Pricing Requirement inherits Requirement caps and §15.2.2 inline values are wrong; (b) Pricing Requirement is a distinct entity with its own caps and §39 has no row for it. Either way, §39 is the authoritative home and §15.2.2 inline values violate the singleton rule.

**Severity: P1 numerical_singleton** — inline character caps not registered in §39.

### 2.7 No §32 API endpoints for TCO → D-4.6-007 (P1 api)

§32.5 endpoint catalogue (lines 26262–26416) declares no `/v1/workspaces/{workspace_id}/tco/*`, no `/v1/workspaces/{workspace_id}/pricing-requirements/*`, no `/v1/workspaces/{workspace_id}/tco/configure`, no `/v1/workspaces/{workspace_id}/tco/calculate`, no `/v1/workspaces/{workspace_id}/tco/export`. §32.5 sections enumerate Workspaces, Requirements, Responses, Scores, Vendors, Scenarios, Selection Reports, Traceability Matrices, Intelligence, Capability Declarations, Internal Comments, Audit Events, Users & Org, Billing — but no TCO surface. §15 is therefore not reachable through the public API; an external integration partner cannot configure TCO inputs, fetch TCO breakdown reports, or initiate TCO export programmatically.

§15.5.1 / §15.5.2 imply UI-only configuration. The implication conflicts with §40.1 which expects programmatic export of TCO data ("All export formats complete within 30 seconds for workspaces with ≤ 10,000 requirements" — §40.5) AND with the §44.1 row "PDF Export (100 requirements) | < 5s" which presumes an export-job mechanism. If TCO is UI-only, the spec must explicitly state "TCO is not exposed via the public API in v7.1.0" and document the §32 omission. Currently the spec is silent.

**Severity: P1 api** — endpoint coverage convention violated; no method/path/auth/idempotency declared for any TCO operation.

### 2.8 No §31 webhooks for TCO config or pricing-requirement amendment → D-4.6-008 (P1 webhook)

§31 has no webhook events for TCO configuration changes (`workspace.tco.configured`, `workspace.tco.recalculated`) or pricing-requirement amendments (`workspace.pricing_requirement.created`, `workspace.pricing_requirement.amended`). §15.5.2 declares "Recalculation: Automatic, <2s latency" and "Vendor blended scores recalculated if scenario includes TCO blending" — both are observable state mutations downstream consumers (CRM sync, finance ETL, custom dashboards) require visibility into. Without webhooks, downstream systems must poll. Convention #7 (every observable state change has a registered webhook in Appendix C and Appendix G) is violated.

Note: Appendix G has 4 PostHog events (`tco_use_case_created`, `tco_requirement_added`, `tco_calculation_run`, `tco_export_generated` — lines 41967–41970) — these are PostHog-only and not registered as Notification Events in Appendix C. The webhook catalogue and the PostHog catalogue are not the same: PostHog events are platform-internal observability; webhook events are customer-facing integration triggers.

**Severity: P1 webhook** — webhook coverage convention violated for an observable state-mutation surface.

### 2.9 TCO percentile undefined when N = 1 → D-4.6-009 (P1 acceptance_criteria)

§15.4.2 (line 14024): `tco_percentile = (N − vendor_rank) / (N − 1)` where `N = total number of vendors`. When N = 1 (single vendor evaluation), the denominator is zero. §15 declares no fallback (e.g., default to 1.0, default to 0.5, suppress percentile, raise error). §13.7.3 Blended Score formula (line 13013) cites `tco_percentile` as an input to blended-score arithmetic — a NaN propagates through the blended score. §13.7 and §15 are silent on this case.

Realistic occurrence: a Workspace with only one bidding vendor (common in sole-source / RFI-with-one-respondent scenarios). `tco_value_weight` defaulting to 0.5 in §13.7.4 (line 13683) ensures the NaN propagates whenever any non-trivial scenario is run with a single vendor.

**Severity: P1 acceptance_criteria** — algebra contract has an unhandled boundary case; QA cannot author a deterministic test.

### 2.10 Retention / DSAR / residency silent for TCO data → D-4.6-010 (P1 retention)

§40.2 retention table (lines 31293–31332) has no row for Pricing Requirement, TCO Configuration, TCO Use Case, or any §15 entity. §15 itself contains no retention clause, no DSAR cascade, no residency partition declaration, no GDPR anonymization path. By inheritance from the parent Workspace (§40.2 line 31297 "Deleted workspace (soft delete) | 30 days, then permanent purge"), TCO data presumably cascades — but the cascade is not documented and no entity-local cite to §40.2 exists.

DSAR concerns: TCO Configuration carries `created_by` / `updated_by` user references (implied; not declared per §15.5.1 silence). On DSAR for the configuring user, what happens to projection settings? Pricing Requirement also carries authoring user references. Spec is silent.

Residency concerns: Pricing data may be vendor-confidential. EU vendor responses must remain in EU residency. §15 has no residency declaration; cross-region recalculation would silently leak EU pricing data to US infrastructure.

**Severity: P1 retention** — convention #9 violated (every new data class states retention, DSAR, residency, GDPR anonymization).

### 2.11 Console firewall / cross-firewall behavior undefined for vendor pricing responses → D-4.6-011 (P1 firewall_leakage)

§19.4.1 (line 19449) declares "Cost / TCO Computations Internal to Buyer (§15) | NEVER CARRIED" as the carry rule for the buyer-side TCO surface. The carry rule covers the TCO total / breakdown / percentile from the buyer console; it is silent on what the SELLER sees when responding to a Pricing Requirement. §15.2.1 says "Output: Dollar value per vendor" and §15.2.3 vendor-input schemas describe vendor inputs — but the firewall semantics on the seller side are not stated:

- Does a vendor see the full TCO Use Case (other pricing requirements they haven't been asked about)? 
- Does a vendor see other vendors' pricing responses (must NEVER per §1.3 firewall integrity)? 
- Does a vendor see the workspace's `projection_years` / `initial_seat_count` / `seat_growth_rate` / `currency` (informational for their pricing strategy, but possibly leaks buyer scale signal)?
- Does a vendor see the buyer's TCO Breakdown Report ranking?

§25 Cross-Console Mechanics has no explicit Pricing Requirement materialization rule equivalent to the §25.5 Buyer Requirement → Seller Bid Response materialization. §15 is silent on whether Pricing Requirements use the same materialization machinery.

**Severity: P1 firewall_leakage** — convention #13 violated (Cross-Console Bridge entities must enumerate carried vs. redacted fields); the firewall integrity for pricing-data round-trip is not documented.

### 2.12 Audit-event action types for TCO not registered → D-4.6-012 (P1 enum)

The §15.5.2 "audit trail of TCO amendments" requirement has no corresponding registered action types in Appendix J `audit_event_action_type` (or equivalent enum for AuditEvent.action). Expected actions: `tco_use_case_created`, `tco_use_case_amended`, `tco_use_case_deleted`, `pricing_requirement_created`, `pricing_requirement_amended`, `pricing_requirement_deleted`, `tco_configuration_amended`, `tco_recalculated`, `tco_exported`. Appendix G has the corresponding 4 PostHog events but PostHog is not the audit catalog. Convention #3 (every enum value used in §4–§51 is registered in Appendix J) is violated, and the §15.5.2 audit-trail requirement cannot be implemented against a registered enum.

**Severity: P1 enum** — enum registration convention violated.

### 2.13 `discount.applied_to` grammar / enum unspecified → D-4.6-013 (P1 enum)

§15.2.3 Discount structure (lines 13954–13957) declares vendor input `applied_to (e.g., "Years 2–3")`. The string grammar is undefined: is `"Years 2–3"` a literal range expression? Is `"All years"` valid? `"Year 1 only"`? `"Years 1, 3, 5"`? `"After Year 2"`? No registered Appendix J enum (e.g., `discount_applied_to_kind ∈ {all_years, single_year, year_range, after_year}`), no parser grammar, no validator. The §15.3 calculation engine ("Reduce applicable years' costs") cannot be implemented deterministically against a free-form string. Two implementers will write two different parsers; vendor responses will fail on one and pass on the other.

**Severity: P1 enum** — applied_to lacks a registered enum / grammar; calculation engine is non-deterministic.

### 2.14 `percentage_of_license` circular-reference cycle detection absent → D-4.6-014 (P1 acceptance_criteria)

§15.2.3 Percentage of License (lines 13941–13945): "Vendor inputs: `base_requirement_id` (reference to another pricing req), `percentage`. Calculation: `percentage × (cost from base_requirement_id)`". Cycle detection rule absent. A vendor (or buyer, in misconfiguring) can author Requirement A `percentage_of_license` referencing Requirement B which `percentage_of_license` references Requirement A. The recursive expansion never terminates. §15 has no:

- Cycle-detection invariant (e.g., "topological sort of `percentage_of_license` references; reject on cycle with HTTP 422 `pricing_requirement_circular_reference`").
- Depth limit (e.g., "max 3 levels of indirection").
- Validator on `base_requirement_id.pricing_structure` (can a `percentage_of_license` reference a `tiered`? a `discount`? a `flat`?).

**Severity: P1 acceptance_criteria** — calculation engine has an undefined cycle case; engine is non-terminating against adversarial input.

### 2.15 Vendor missing pricing-response handling absent → D-4.6-015 (P2 acceptance_criteria)

§15.2.2 schema includes `response_required: boolean` — but §15.3.3 calculation algebra (`year_N_cost = SUM(annual_cost[requirement_i] for all pricing requirements)`) does not state behavior when a vendor has not submitted a response to a `response_required=true` requirement. Three readings: (a) treat as $0 → silently understates TCO; (b) treat as NaN → propagates to total; (c) reject vendor from comparison until all required responses submitted. Realistic edge case; §15 is silent.

**Severity: P2 acceptance_criteria** — silent on missing-response handling.

### 2.16 Tied vendor TCO ranking — tie-breaking absent → D-4.6-016 (P2 acceptance_criteria)

§15.4.2 ranks vendors by `total_tco` ascending. §15.3.4 says "Comparison: Rank vendors by cost/seat; highlight lowest cost vendor." When two vendors have identical `total_tco`, the rank is a tie. §15 declares no tie-breaking rule (alphabetical? response-submission timestamp? cost/seat as secondary key?). The percentile calculation `(N − vendor_rank) / (N − 1)` is undefined when ranks are not 1..N strict. The "highlight lowest cost vendor" UI rendering is undefined when two vendors share the lowest cost.

**Severity: P2 acceptance_criteria** — silent on tie-breaking.

### 2.17 §15.5.2 `<2s recalc latency` not in §44.1 → D-4.6-017 (P2 numerical_singleton)

§15.5.2 inlines "Recalculation: Automatic, <2s latency". §44.1 Performance Targets has no row for TCO recalculation. The §44.1 pattern (e.g., line 31745 EvalStarter materializer, line 31747 Defense View generation) is single-source: §44.1 is canonical, body cites §44.1. §15.5.2 violates the singleton.

**Severity: P2 numerical_singleton** — inline performance budget should live in §44.1.

### 2.18 `cumulative_cost_per_seat` algebra ambiguous → D-4.6-018 (P2 acceptance_criteria)

§15.3.3 (line 13997): `cumulative_cost_per_seat = total_tco / (average seats across all years)`. "Average" is undefined: arithmetic mean of year-1..year-N seat counts? Time-weighted? Geometric? With seat growth, arithmetic and geometric means diverge meaningfully (10% growth over 3 years: arithmetic mean 110, geometric mean ~110.34, time-weighted 110.0). Two implementers will write two different denominators; the resulting `cost_per_seat` value diverges across implementations.

**Severity: P2 acceptance_criteria** — algebra has an undefined statistical operator.

### 2.19 `tiered` overflow tier behavior unspecified → D-4.6-019 (P2 acceptance_criteria)

§15.2.3 Tiered Pricing example: `$100/seat for 1–50 users, $80/seat for 51–100, $60/seat for 100+`. The example uses an open-ended highest tier. §15 does not declare what happens when a vendor's tier definitions terminate (e.g., final tier `max_qty=100`) and the projected seat count is 150. Three readings: (a) extrapolate using highest-tier price; (b) reject as out-of-band; (c) clamp at highest defined tier's max_qty (so additional seats are not priced). Implementations diverge.

**Severity: P2 acceptance_criteria** — overflow-tier behavior undefined.

### 2.20 Currency-mismatch validation absent → D-4.6-020 (P2 acceptance_criteria)

Compounding D-4.6-001: §15 has no validator that asserts vendor-supplied `currency` matches Workspace `currency` (or, if mismatched, fires the FX-conversion path). A buyer in USD whose vendors all submit in EUR currently produces a TCO total in EUR with no conversion. The UI label says "$" because of the Workspace default, but the underlying numeric is EUR. Reads diverge: implementer A presents the EUR value with a USD glyph (silent error); implementer B converts via spot FX (different rate every render); implementer C rejects EUR submission at write time. None matches the spec because the spec is silent.

**Severity: P2 acceptance_criteria** — silent on currency-mismatch path; sub-defect of D-4.6-001 but tracked separately for the validator-level fix.

### 2.21 Concurrency on TCO Configuration unspecified → D-4.6-021 (P2 state_machine)

§15.5.1 grants `Workspace Owner, Use Case Lead` edit access. §15.5.2 declares "Recalculation: Automatic, <2s latency". Two Use Case Leads simultaneously editing `projection_years` (Lead A: 3 → 5; Lead B: 3 → 7) fall into a last-write-wins / 409 / merge ambiguity. §15 has no concurrency rule. Convex transactional semantics suggest last-write-wins, but the §44.1 line 31736 "Convex Reactive Query Commit-to-Render SLO" presumes conflict-free updates. The Score / Internal Comment patterns elsewhere (§13.6 collaborative scoring; §4.3.12 Internal Comment Post `edit_locked_at` window) declare explicit concurrency semantics; §15 does not.

**Severity: P2 state_machine** — concurrency contract absent.

### 2.22 §15.7 acceptance criteria are unchecked checkboxes, not §13.10-style → D-4.6-022 (P2 acceptance_criteria)

§15.7.1 through §15.7.5 are bullet checkbox lists (e.g., `- [ ] TCO Use Cases distinct from capability use cases`). The convention §13.10 / §14.9 / §17.8 / §20.7 requires numbered, observable, measurable, scope-bound criteria of the form "Given X, when Y, then Z within threshold T." §15.7 criteria have no observable inputs, no measurable thresholds, no scope qualifiers. A QA engineer cannot author deterministic test fixtures from `- [ ] TCO Use Cases distinct from capability use cases` — the criterion is restated narrative.

**Severity: P2 acceptance_criteria** — convention §13.10 style violated.

### 2.23 Mobile divergence — §15 silent on §38 cross-reference → D-4.6-023 (P2 mobile_divergence)

§38 Mobile Feature Parity Matrix lines 30874–30877 declare three TCO mobile rows: TCO Configuration `not_supported` on mobile; TCO Results `supported` (read-only); TCO Pricing Response Entry (Seller) `simplified` (flat, one-time editable; tiered/range/discount deferred to desktop). §15 does not cite §38; no §15.X "Mobile Behavior" sub-section; no §15.7 acceptance criterion bound to the mobile parity rules. The §38 row "TCO Pricing Response Entry (Seller)" implies a seller-side mobile entry surface that §15 does not authorize at all (compounded by D-4.6-011).

**Severity: P2 mobile_divergence** — convention #14 (mobile vs desktop divergence) violated; §15 silent on §38 cross-reference.

### 2.24 No glossary entries for TCO / Pricing Requirement / Estimate Range / Discount / Percentage of License → D-4.6-024 (P2 glossary)

Appendix K (Glossary, lines 46704–47323) has no entries for: `Total Cost of Ownership (TCO)`, `Pricing Requirement`, `TCO Use Case`, `Pricing Structure`, `Estimate Range`, `Percentage of License`, `Discount` (in pricing-structure sense), `tco_value_weight`, `tco_percentile`. All of these terms appear across §13.7.3 / §13.8.2 / §15 / §28916–§28921 / §47834–§47838 / §41967–§41970 — multi-section terms requiring registration per Convention #4.

**Severity: P2 glossary** — convention #4 violated.

### 2.25 Appendix M.1 row labels do not match `pricing_structure` enum → D-4.6-025 (P3 documentation_gap)

Appendix M.1 line 47838: `TCO Modeling (perpetual / subscription / consumption / custom)`. The four parenthetical labels are not the canonical Appendix J `pricing_structure` enum values (`flat`, `tiered`, `one_time`, `percentage_of_license`, `estimate_range`, `discount`). The labels appear to be a different categorization (commercial-model categorization, possibly from a pre-v6 draft). The row is non-actionable for a CI gate (`appendix_m_coverage_on_diff` cannot bind to this label set); a future implementer cannot map the surface row to the enum.

**Severity: P3 documentation_gap** — Appendix M label set does not match the canonical enum.

### 2.26 `## 15.2 ... {#15.2-tco-use-cases-&-pricing-requirements}` anchor contains literal `&` → D-4.6-026 (P3 documentation_gap)

§15.2 heading anchor (line 13882): `{#15.2-tco-use-cases-&-pricing-requirements}`. Convention #11 (heading syntax `## N.N Title {#n.n-title}`) prefers slug-safe anchors. The literal `&` in the slug breaks anchor-link tooling on most Markdown renderers; the convention elsewhere (e.g., line 13876 `{#15.-tco-modeling}`, line 14031 `{#15.5-tco-modeling-&-editing}`) is inconsistent — some sections use `&`, others use `and`. The §15.2 anchor matches the §15.5 anchor pattern (with literal `&`), but conflicts with §44.6.5 `{#44.6.5-engine-telemetry-and-ops-routing}` (uses `and`).

**Severity: P3 documentation_gap** — anchor-slug hygiene drift.

### 2.27 §15 testing / shortcuts cite "Section 14" — wrong section → D-4.6-027 (P3 documentation_gap)

§32030 (line 32030, Testing Strategy) and §37629 (line 37629, Keyboard Shortcuts) both label their TCO blocks `### TCO Modeling (Section 14)` and `### TCO Configuration (Section 14)`. §14 is Scenario Modeling; TCO is §15. Stale section reference predates the §14 / §15 split.

**Severity: P3 documentation_gap** — stale cross-reference.

### 2.28 §15 silent on Selection Report TCO appendix gating → D-4.6-028 (P2 acceptance_criteria)

§33586 declares a Selection Report appendix tag `tco_appendix | false | TCO projection per vendor (§15) | If true, appended; never includes per-vendor unit pricing if the underlying TCO data flagged 'pricing_confidential=true'.` §15 declares no `pricing_confidential` flag on Pricing Requirement or Vendor Response; the §33586 reference is to a field that does not exist in §15 / §4. A §15 implementer authoring the Pricing Requirement schema does not know to include a `pricing_confidential` flag.

**Severity: P2 acceptance_criteria** — referenced field does not exist in the source-of-truth section.

### 2.29 §15 silent on Solo per-evaluation $199 charge dependency → D-4.6-029 (P2 documentation_gap)

§34.2.5 (line 28521) declares the Solo per-evaluation $199 charge fires on Selection Report PDF export. §40.1 / §33586 confirm the Selection Report PDF embeds the TCO appendix when configured. §15 does not cross-reference §34.2.5 or note that the TCO data feeds a billable artifact. The TCO algebra ambiguities (D-4.6-009, D-4.6-014, D-4.6-015, D-4.6-018, D-4.6-019, D-4.6-020) therefore feed an indirect billing surface; documenting the dependency would force tighter remediation. §15 silence on the Solo billing-surface coupling makes the algebra defects look lower-stakes than they are.

**Severity: P2 documentation_gap** — billing-surface dependency not surfaced in §15.

### 2.30 Multi-vendor comparison rendering — N=0 / N=1 UI behavior absent → D-4.6-030 (P2 acceptance_criteria)

§15.3.4 TCO Breakdown Report and §15.4.2 percentile both presume N ≥ 2 vendors. §15 declares no behavior for N=0 (no vendors yet bid) or N=1 (single-vendor evaluation). The TCO Breakdown Report must render some surface in these cases (empty state, single-vendor narrative, "TCO requires ≥2 vendors" gate). §3.7 generic empty-state pattern is not invoked from §15. The percentile defect (D-4.6-009) compounds — when N=1, the rendering must drop the percentile column gracefully.

**Severity: P2 acceptance_criteria** — empty-state / single-vendor rendering absent (compounded with D-4.6-009).

---

## 3. Counterfactual Pass

Per the audit-prompt mandate, three realistic failure modes per feature were enumerated. The §15 features in scope: F-273 (TCO Modeling), F-274 (Pricing Requirement), F-275 (TCO Projection), F-276 (Blended Score Integration), F-277 (TCO Editing UI), F-278 (Plan Limits).

| Failure mode | Spec coverage |
|---|---|
| Vendor submits in EUR; Workspace is USD; no FX policy | UNHANDLED → D-4.6-001 |
| `percentage_of_license` cycle | UNHANDLED → D-4.6-014 |
| `estimate_range` with `min > max` | UNHANDLED — no validator declared (sub-defect of D-4.6-002 entity convention) |
| `tiered` overflow (projected seats > highest max_qty) | UNHANDLED → D-4.6-019 |
| `discount.applied_to` = `"After Year 4"` with `projection_years=3` | UNHANDLED → D-4.6-013 |
| Percentile divide-by-zero (N=1) | UNHANDLED → D-4.6-009 |
| Tied TCO totals | UNHANDLED → D-4.6-016 |
| Vendor missing required pricing response | UNHANDLED → D-4.6-015 |
| Workspace currency change mid-evaluation | UNHANDLED — silent (compound with D-4.6-001) |
| Convex outage during recalc | UNHANDLED — §15.5.2 declares no outage behavior |
| DSAR on `created_by` of TCO Configuration | UNHANDLED → D-4.6-010 |
| Cross-residency vendor responses (US Workspace, EU vendor) | UNHANDLED → D-4.6-010 / D-4.6-011 |
| Two Use Case Leads concurrent edits | UNHANDLED → D-4.6-021 |
| Mobile vendor pricing-response entry on `tiered` | UNHANDLED — §38 declares parity but §15 doesn't bind it → D-4.6-023 |
| Selection Report PDF export with stale TCO data | UNHANDLED — §15 doesn't declare staleness rules → D-4.6-029 |

Every counterfactual failure mode is captured in a defect row.

---

## 4. Self-Challenge Pass (Hostile-Reviewer Re-Read)

For each defect filed, re-evaluated:

- **D-4.6-001 evidence reproducible?** YES — line citations 13926/13938/13950/13966 quote vendor-input schemas accepting `currency`; §4.8.1 line 8068/8069 quotes the canonical FX pattern not invoked in §15. Severity P1 confirmed (multi-currency unbuildable).
- **D-4.6-002 / D-4.6-003 evidence reproducible?** YES — §15.2.2 prose schema vs §4 convention; §15.5.1 dropdown without entity declaration. Severity P1 confirmed (entity unbuildable).
- **D-4.6-004 — could "Business" be a defensible legacy alias?** NO — §34.1.3 and Appendix J `buyer_plan_tier` (Phase 14.9) explicitly enumerate `business_starter` / `business_growth` / `business_scale`; "Business" alone is not a tier name. Severity P1 confirmed.
- **D-4.6-005 — could the §15.6.1 inline table be defensible as a §39-style mirror?** NO — §39 mirror rows (lines 31125–31144) cite §34.1.1 and never restate the value. §15.6.1 inline-restates. Severity P1 confirmed.
- **D-4.6-007 — could §15 reasonably be UI-only without API endpoints?** NO — §40.1 export contract is API-driven; §44.1 PDF Export budget presumes API; §32 has endpoints for Scenarios (which are similar surface), Selection Reports, etc. The omission is a gap, not an architectural choice. Severity P1 confirmed.
- **D-4.6-008 — could the 4 PostHog events substitute for webhooks?** NO — PostHog events are platform-internal; webhooks are customer-integration triggers (§31 distinct catalog from Appendix G). Severity P1 confirmed.
- **D-4.6-009 — could the N=1 case be argued away as "no scenario blends in single-vendor mode"?** NO — `tco_value_weight` defaults to 0.5 (line 13683); a single-vendor scenario with non-zero `tco_value_weight` produces NaN propagation. Severity P1 confirmed.
- **D-4.6-010 — could retention be inherited from Workspace silently?** PARTIALLY — §40.2 cascade is real, but DSAR / residency are NOT inherited automatically (each entity needs its own DSAR clause per §6.8 and residency declaration per §1.6). Severity P1 confirmed.
- **D-4.6-011 — is the firewall question already answered by §19.4.1?** NO — §19.4.1 covers the buyer-side TCO computations carry rule. The seller-side question (what does a vendor see when responding to a Pricing Requirement?) is unanswered. Severity P1 confirmed.
- **D-4.6-012 — is Appendix G PostHog coverage sufficient for the audit-trail requirement?** NO — Appendix G is observability; AuditEvent (§4.6.1) is the audit-trail entity. Distinct catalogs. Severity P1 confirmed.
- **D-4.6-013 — could `applied_to` be parsed by a permissive regex?** NO — engine determinism requires a registered grammar / enum; permissive parsing is convention #3 violation. Severity P1 confirmed.
- **D-4.6-014 — could cycle detection be assumed in implementation?** NO — adversarial input from a vendor authoring a misconfigured response can produce non-terminating computation; engine must declare cycle-rejection contract. Severity P1 confirmed.
- **D-4.6-015 / 016 / 017 / 018 / 019 / 020 / 021 / 022 / 023 / 024** — all P2 defects; severity rule (P2 = ambiguity that two engineers resolve differently) holds across the set.
- **D-4.6-025 / 026 / 027** — all P3; severity rule (P3 = cosmetic / terminological / citation drift) holds.
- **D-4.6-028 / 029 / 030** — P2 confirmed (ambiguity that compound with billing or rendering surfaces).

**Severity revisions during self-challenge pass:** None. All 30 defects retain initial severity.

**Recommendation sharpening during self-challenge pass:** D-4.6-001 recommendation tightened from "author currency policy" to "extend AIOperation FX pattern (line 8068) to TCO; lock vendor-supplied `currency` at submit; convert at render via §4.8 `fx_rate_locked`; add `currency_mismatch_workspace_default` validator." D-4.6-009 recommendation tightened from "handle N=1" to "explicit AC: when N=1, set `tco_percentile=1.0` and propagate as informational-only (no NaN); QA test `tco_percentile_single_vendor` asserts." D-4.6-014 recommendation tightened from "add cycle detection" to "topological sort on `percentage_of_license` reference graph at write time; reject with HTTP 422 `pricing_requirement_circular_reference`; QA test against synthetic A→B→A graph."

---

## 5. Coverage Matrix Update Plan

For F-273 through F-278 + F-AE-014, the following cell updates are warranted (executed in DEFECT_LEDGER promotion below):

| Feature | Cell changes |
|---|---|
| F-273 TCO Modeling | `data_model` ✅→❌ (D-4.6-002, D-4.6-003); `enums` ⚠→❌ (D-4.6-012, D-4.6-013); `glossary` ⚠→❌ (D-4.6-024); `acceptance_criteria` ⚠→❌ (D-4.6-022, D-4.6-009, D-4.6-018); `state_machine` n/a→⚠ (D-4.6-021 concurrency); `api` ✅→❌ (D-4.6-007); `webhook` ✅→❌ (D-4.6-008); `notifications` ✅→❌ (D-4.6-012); `error_codes` ⚠→❌ (Appendix I has only 1 TCO code); `retention` ⚠→❌ (D-4.6-010); `dsar` ⚠→❌ (D-4.6-010); `residency` ⚠→❌ (D-4.6-010); `console_firewall` ⚠→❌ (D-4.6-011); `mobile_parity` ⚠→❌ (D-4.6-023); `surface_engine_mapping` ✅→⚠ (D-4.6-025); `performance_budget` ⚠→❌ (D-4.6-017). |
| F-274 Pricing Requirement | mirrors F-273 plus `data_model` ❌ (D-4.6-002), `numerical_singleton` ❌ (D-4.6-006). |
| F-275 TCO Projection | `acceptance_criteria` ❌ (D-4.6-009 / 015 / 016 / 018 / 019 / 020); `enums` ❌ (D-4.6-013); `numerical_singleton` ❌ (D-4.6-001 currency drift). |
| F-276 TCO/Standard Scoring Integration | `acceptance_criteria` ❌ (D-4.6-009 propagation); `glossary` ❌ (D-4.6-024 `tco_value_weight` / `tco_percentile`). |
| F-277 TCO Modeling & Editing UI | `acceptance_criteria` ❌ (D-4.6-022); `state_machine` ❌ (D-4.6-021); `mobile_parity` ❌ (D-4.6-023); `performance_budget` ❌ (D-4.6-017). |
| F-278 TCO Plan Limits | `plan_gating` ❌ (D-4.6-004, D-4.6-005). |
| F-AE-014 AE-12.4-07 | `authored_extension_status` ⚠ retained; `numerical_singleton` ❌ (D-4.6-005 placement). |

Aggregate matrix totals re-derived in next V-prompt cross-check (V4).

---

## 6. Promotion to Ledger

All 30 defects promoted to `_audit/DEFECT_LEDGER.md` under section "Phase 4 — Prompt 4.6 — §15 TCO Modeling End-to-End Audit (2026-05-04)" in the established Phase 4.4 / Phase 4.5 row format. Severity roll-up: 0 P0 / 14 P1 / 13 P2 / 3 P3.

**Phase 4.6 sign-off:** HALT not triggered (zero P0). 14 open P1 defects in §15 scope contribute to Phase 4 V-prompt advance gate (compounded with §13 / §14 P1 backlogs from prior sub-prompts).

**Forward references:** Phase 8 (D-4.6-007 / 008 / 012 — §32 / §31 / Appendix J / Appendix C / Appendix I extensions for TCO surface); Phase 9 (D-4.6-010 / 011 — retention / DSAR / residency / firewall); Phase 10 (D-4.6-022 — §13.10-style AC rewrite); Phase 14.13 (D-4.6-024 — Appendix K Glossary cluster).
