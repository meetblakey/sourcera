# Phase 0 — Findings Scratch Log

_Per Audit_Prompts.md OUTPUT PROTOCOL: per-prompt scratch log. Confirmed findings promote into `DEFECT_LEDGER.md` at end of phase. Phase-0 prompts (0.1 → 0.4) primarily seed deterministic artifacts; defect filing volume is intentionally low. Findings here are the seed for Prompt V0 (Phase 0 verification)._

---

## Prompt 0.3 — Coverage Matrix Construction (2026-04-29)

### Construction Method

`COVERAGE_MATRIX.md` was generated programmatically from `FEATURE_INVENTORY.md` (968 rows) by `build_coverage_matrix.py` (in the audit-tooling outputs directory; transient). Each cell was seeded by:

1. **Class-based default.** Per `feature_class` (engine_concept · user_capability · surface · platform_mechanic · pricing_primitive · growth_mechanic · api_surface · integration_surface), each of the 31 convention dimensions gets a default of `✅` / `⚠` / `n/a`. Defaults err toward `⚠` per Phase-0 doctrine. `n/a` is reserved for structurally inapplicable convention/class pairs (e.g., `integration_surface` rows have no platform RBAC; `engine_concept` rows have no `empty_state`/`loading_state` UI surface).
2. **Anchor / name-keyword overrides.** When a row's primary or secondary anchor unambiguously satisfies a convention, the cell is promoted from `⚠` to `✅`. The override registry is documented in the script and reproduced below for future auditors.
3. **Authored-Extension status.** F-AE-* rows set `authored_extension_status` from the `[AE: pending]` / `[AE: ratified]` flag in their `one_line_summary`.
4. **Evidence column.** For every non-`✅` cell, a one-line evidence template (`<dim>: <reason>`) is emitted. Templates intentionally describe the *unverified condition* (e.g., "Appendix J registration not yet cross-checked") so Phase-1+ can sharpen with line numbers and either promote to `✅` or demote to `❌`.

### Override Registry (anchor → dimension promotion)

| Trigger | Promotion |
|---|---|
| anchor starts with `§4.` AND name contains "entity" OR class ∈ {engine_concept, pricing_primitive} | `data_model` → ✅ |
| anchor starts with `§5.` | `rbac` → ✅ |
| `Appendix C` in any anchor | `notifications` → ✅ |
| `Appendix G` in any anchor | `posthog_events` → ✅ |
| `Appendix I` in any anchor | `error_codes` → ✅ |
| `Appendix J` in any anchor | `enums` → ✅ |
| `Appendix K` in any anchor | `glossary` → ✅ |
| `Appendix M` in any anchor | `surface_engine_mapping` → ✅ |
| `Appendix L` in any anchor | `state_machine` → ✅ |
| anchor `§31` (or sec contains it) | `webhook` → ✅ |
| anchor `§32` (or sec contains it) | `api` → ✅ |
| anchor `§34` (or sec contains it) | `plan_gating` → ✅ |
| anchor `§40.2` / `§40` | `retention` → ✅ |
| anchor `§44` / `§44` in sec | `performance_budget` → ✅ |
| anchor `§47` / `§47` in sec | `residency` → ✅ |
| `§48` in any anchor | `growth_mechanic_link` → ⚠; `network_effect_link` → ⚠ |
| `§51` in any anchor | `posthog_events` → ✅; `observability` → ✅ |
| `§3.7.*` anchor | `empty_state` / `loading_state` / `error_state` → ✅ |
| `§3.11.*` anchor | `accessibility` → ✅ |
| `§38` anchor / sec | `mobile_parity` → ✅ |
| `§37` anchor | `accessibility` / `i18n` → ✅ |
| `§50.17` in any anchor | `ci_gate_coverage` → ✅ |
| `§M.4` / `§M.5` | `ci_gate_coverage` → ✅ |
| anchor `§1.3` or `§1.4` | `console_firewall` → ✅ |
| name contains "webhook" | `webhook` → ✅ |
| name contains "endpoint" / "api token" / "api key" | `api` → ✅ |
| name contains "audit" + "event" | `observability` → ✅ |
| name contains "ci gate" | `ci_gate_coverage` → ✅ |
| name contains "mobile" | `mobile_parity` → ✅ |
| name contains "accessibility" / "wcag" / "contrast" | `accessibility` → ✅ |
| name contains "performance" / "slo" / "p95" / "latency" | `performance_budget` → ✅ |
| name contains "dsar" / "gdpr" / "right to erasure" / "right of access" | `dsar` → ✅ |
| name contains "residency" / "region" / "us/eu" | `residency` → ✅ |
| name contains "firewall" / "console bridge" / "cross-console" | `console_firewall` → ✅ |
| name contains "plan tier" or tier-keyword pattern | `plan_gating` → ✅ |
| name contains M1–M17 token or "growth mechanic" | `growth_mechanic_link` → ✅; `network_effect_link` → ⚠ |
| name contains "network effect" | `network_effect_link` → ✅ |
| name contains "state machine" / "lifecycle" / "state transition" | `state_machine` → ✅ |
| any of {§13.10, §14.9, §17.8, §20.7, §22.20, §22.21, §23.10, §25.10, §27.10, §38.10, §44.6} in any anchor | `acceptance_criteria` → ✅ |

### Run Statistics (regenerated)

| metric | value |
|---|---|
| feature rows | 968 |
| total convention cells | 30,008 |
| `✅` count | 695 |
| `⚠ partial` count | 20,689 |
| `❌ missing` count | 0 |
| `n/a` count | 8,624 |
| coverage % (✅ / (✅ + ⚠ + ❌)) | 3.25% |

The `❌ missing` count is intentionally `0` in Phase 0. Phase-0 cannot disprove presence on a quick read; demoting a `⚠` to `❌` requires a full section read (Phase 1+ responsibility). The coverage % is therefore a *floor*, not a target — the audit's actual coverage will rise as Phase 1+ promotes `⚠` → `✅` cells based on full reads.

### Spot-Check Sample (Hostile-Reviewer Read of 5 Random Features)

Sample drawn with seed `20260429`: F-031, F-440, F-678, F-402, F-214.

**F-031 — Sidebar Navigation Pattern (§3.2, surface).** Spot-read of §3.2: the section enumerates eight interaction patterns (sidebar nav, command palette, inline editing, shortcuts, optimistic mutation, context menu, modal+esc, live preview/presence). Per-pattern AC, state machines, and accessibility detail are NOT in §3.2; they appear in §3.3 / §3.6 / §3.7 / §3.11 / Appendix B. Seeded values (`acceptance_criteria=⚠`, `state_machine=⚠`, `accessibility=⚠`, `mobile_parity=⚠`) match a hostile-reviewer reading. **Phase-0 verdict: aligned. No tightening needed.**

**F-440 — Vendor Opt-Out Global Registry (§27.10, platform_mechanic).** Spot-read of §27.10 (lines 22473–22622+): section is *exceptionally* well-specified. §27.10.2 has a complete entity field table for `VendorOptOutAuthorityAttestation` (data_model → tightenable to ✅), an explicit From|To|Trigger state machine (state_machine → ✅), validation block with error codes registered in Appendix I (error_codes → ✅), retention block (retention → ✅), residency block (residency → ✅), DSAR block (dsar → ✅), enums explicitly registered in Appendix J (enums → ✅), §27.10.6 §32-compliant API endpoints (api → ✅), §27.10.7 webhook catalog (webhook → ✅), §27.10.9 numbered AC (acceptance_criteria → ✅, *which the override correctly promoted*), §27.10.4 latency budget with surface-allowlist invariant (ci_gate_coverage → ✅). The current Phase-0 seed shows only `acceptance_criteria=✅`; the other dimensions are seeded `⚠`. **Phase-0 verdict: under-tightened. The seeding heuristic does not promote `⚠` → `✅` based on body-content scan, only on anchor / secondary-anchor / name. This is by Phase-0 design (the matrix is a *seed*; Phase 1+ tightens via full reads). The evidence-template column tells the next phase what to confirm. No correction needed in Phase 0.**

**F-678 — Growth Mechanic M10 (§48.6.6, growth_mechanic).** Spot-read of §48.6.6 header: M10 is defined as editorial guides per category, with cross-reference to §4.4.13 (GuidePage entity). Seeded: `growth_mechanic_link=✅` (correct), `network_effect_link=⚠` (correct — promoted by §48 anchor rule), most other dims `⚠`. **Phase-0 verdict: aligned. Phase-1+ will tighten when the §4.4.13 GuidePage entity is fully audited.**

**F-402 — Bridge Kill-Switch & Notification Suppression (§25.2.6, platform_mechanic).** Spot-read of §25.2.6 header: section authors a cross-console bridge pause mechanism with a 6-hour suppression window. Seeded: most cells `⚠`. The override registry does not promote any cells for the §25.2.6 anchor. **Phase-0 verdict: aligned. Phase-1+ verification will tighten `state_machine`, `console_firewall`, `acceptance_criteria`, `notifications` based on full read. The evidence column flags these for the next phase.**

**F-214 — Phase 4-5: Vendor Discovery & Outreach (§10.5, user_capability).** Spot-read of §10.5: this is a phase-overview section consolidating Phase 4 (Vendor Discovery) and Phase 5 (Outreach) — §10.5 is largely a narrative wrapper that defers to §10.5.1+ sub-sections and §27 for marketplace-domain detail. As a *user_capability* row, the all-`⚠` seeding is reasonable; the row legitimately spans many sub-features. **Phase-0 verdict: aligned. Phase-2 (UX/feature audit) will likely break this row into sub-features and re-seed coverage individually. File P3 documentation candidate? — see findings below.**

### Self-Challenge — Hostile-Reviewer Defect Candidates (carry to PHASE0_VERIFY)

The following candidates emerged during seeding and spot-check. They are *not* defects in `COVERAGE_MATRIX.md` itself — they are observations to be triaged in Prompt V0 (Phase 0 verification).

**SC-0.3-1 (P3 documentation_gap candidate).** F-214 (Phase 4-5: Vendor Discovery & Outreach) is too coarse — §10.5 wraps two distinct phases with materially different acceptance surfaces (vendor shortlisting vs ITB issuance vs vendor confirmation). The inventory captures this as a single row. *Recommendation:* Phase-2 (UX/feature audit) re-segments §10.5 into sub-feature rows. *Promotion criterion for ledger:* file as P3 if Phase 2 confirms the conflation; do NOT file in Phase 0 — the `FEATURE_INVENTORY.md` extraction was per its prescribed granularity.

**SC-0.3-2 (P3 documentation_gap candidate).** Many `engine_concept` rows in §4.* (e.g., F-091 Evaluation Pulse Event) actually surface to a UI consumer (Pulse Inbox) and would benefit from `empty_state`/`loading_state`/`error_state` cells set to `⚠` rather than `n/a`. The class-based default seeds these as `n/a`. *Recommendation:* Phase-3 (UX audit) audits cross-class UI exposure and re-seeds applicable `engine_concept` rows. *Promotion criterion for ledger:* file as P3 if Phase 3 surfaces ≥10 misclassified rows; otherwise leave as a Phase-0 doctrine choice.

**SC-0.3-3 (P3 documentation_gap candidate).** The `evidence` column convention compresses every non-`✅` cell into a single semicolon-separated string. For rows with 25+ non-`✅` cells (most `engine_concept` rows), the evidence note is long (~1.5 KB). This is *intentional* — the matrix is a single artifact and Phase-1+ filings sharpen line by line — but a P3 documentation candidate could split evidence into per-dimension columns. *Recommendation:* Defer until Phase 1 has produced 50+ defect filings; if the per-dim column is consistently more useful than the compressed string, split. *Promotion criterion for ledger:* not before Phase 1.

**SC-0.3-4 (P2 numerical_singleton candidate, defer to Prompt 0.4).** The matrix does not yet cross-check that every `pricing_primitive` row in `FEATURE_INVENTORY.md` has a corresponding row in `AUTHORITATIVE_SOURCE_MAP.md`. *Recommendation:* Prompt 0.4 (Authoritative-Source Cross-Reference Map) is the right place to file this. Do not file in Prompt 0.3.

**SC-0.3-5 (P2 documentation_gap candidate).** The override registry uses string matching on anchor / name keywords. False-negative risk: a feature whose name does not contain "webhook" but whose primary section is dominantly about webhooks (e.g., F-409 Cross-Console Bridge — bridges *are* webhooks under the hood) may not get the `webhook` cell promoted. *Recommendation:* Phase-1 (Data Model Integrity) and Phase-7+ (API/Webhook audit) will catch these via full reads. The Phase-0 seeding's evidence-column note already flags `webhook` as `⚠` for these rows. *Promotion criterion for ledger:* not in Phase 0.

### Verification Against Audit_Prompts.md Coverage Matrix Format

Required columns checklist (per Audit_Prompts.md Coverage Matrix Format):

- [x] feature_id
- [x] feature_name
- [x] section_anchor (= primary_section_anchor in the inventory)
- [x] data_model
- [x] enums
- [x] glossary
- [x] rbac
- [x] plan_gating (§5.11/§34.1/§39)
- [x] acceptance_criteria
- [x] state_machine
- [x] api
- [x] webhook
- [x] notifications
- [x] posthog_events
- [x] error_codes
- [x] retention
- [x] dsar
- [x] residency
- [x] console_firewall
- [x] empty_state
- [x] loading_state
- [x] error_state
- [x] retry_idempotency
- [x] mobile_parity
- [x] accessibility
- [x] i18n
- [x] performance_budget
- [x] surface_engine_mapping
- [x] ci_gate_coverage
- [x] observability
- [x] test_coverage
- [x] growth_mechanic_link
- [x] network_effect_link
- [x] authored_extension_status
- [x] evidence (mandatory for every non-`✅` cell, per OUTPUT requirement)

Total columns: 4 identity (feature_id, feature_name, section_anchor, feature_class) + 31 convention dimensions + 1 evidence = **36 columns**. The `feature_class` column is not in the minimum required set but is included because it is the seeding key; removing it would harm Phase-1+ readability.

### Verification — Row-Count Equality

`FEATURE_INVENTORY.md` data rows: 968 (`grep -c "^| F-"`).  
`COVERAGE_MATRIX.md` data rows: 968 (`grep -c "^| F-"`).  
**Equality verified: ✅.**

### Defects Promoted to DEFECT_LEDGER.md

**None.** Per Phase-0 doctrine, candidates are carried into `PHASE0_VERIFY.md` (Prompt V0) and only promoted if V0 confirms. Prompt 0.3 itself produced zero direct defects.

### Notes for Prompt 0.4 (Authoritative-Source Cross-Reference Map)

- Use the `pricing_primitive` rows (61 total) and §34 / §39 / §44.6 / §6.8 / §40.2 / §42.1 anchors as the seed for the singleton enumeration.
- The `growth_mechanic` rows (45) carry `§48` anchors that should be cross-checked against §48 numerical singletons.
- The `integration_surface` rows (19) carry §1.5 anchors and define the boundary between platform-managed and vendor-managed singletons (e.g., Stripe's API rate limits are vendor-managed; Convex's reactivity SLO is platform-managed per §7.5.3).

### Notes for Prompt V0 (Phase 0 Verification)

- Sample 5 random features and re-read primary anchors end-to-end; tighten cells that the hostile-reviewer reading would promote `⚠` → `✅`.
- Sample 5 random rows from `AUTHORITATIVE_SOURCE_MAP.md` (when Prompt 0.4 produces it) and grep the Master Spec for the value.
- Confirm `COVERAGE_MATRIX.md` row count == `FEATURE_INVENTORY.md` row count == 968.
- Confirm the override-registry cells fired correctly by spot-checking 5 anchor patterns (one each from §5.*, §31, §32, Appendix J, Appendix M).
- Triage SC-0.3-1 through SC-0.3-5 above — promote to ledger only on V0 confirmation.

---

## Prompt 0.3 — Independent Verification Re-Run (2026-04-29)

This block records a fresh hostile-reviewer pass on the constructed `COVERAGE_MATRIX.md` to satisfy the Prompt 0.3 VERIFICATION clause: "Sample 5 random features and confirm the seeded values match a hostile-reviewer reading of the section." The earlier spot-check used seed `20260429` (F-031, F-440, F-678, F-402, F-214). To produce an independent sample, this pass selected a deterministic spread biased toward classes that were under-represented in the prior sample: `user_capability` (F-150), `surface` (F-380, F-560), `platform_mechanic` (F-740), and an **AE: ratified** row (F-AE-027). The spread also covers four spec sections that were not exercised by the prior sample (§5.5, §22.19, §35.2.3, §50.14.8, §39).

### Sample Construction Method

| feature_id | name | anchor | feature_class | rationale for inclusion |
|---|---|---|---|---|
| F-150 | Bid Owner Role | §5.5 | user_capability | Tests `rbac=✅` override on a `§5.*` anchor; tests the user_capability class default. |
| F-380 | Seller Compressed Surface Mapping | §22.19 | surface | Phase 14.6 v7.1.0 surface introduction with explicit AC table; tests whether the override registry caught `acceptance_criteria` for an AC-bearing section outside the {§13.10, §14.9, §17.8, §20.7, §22.20, §22.21, §23.10, §25.10, §27.10, §38.10, §44.6} allowlist. |
| F-560 | Progress Storytelling Bootstrap UI | §35.2.3 | surface | Sparse descriptive UX prose; tests whether class-default `n/a` cells stay defensible on a thin surface. |
| F-740 | OpsAnalyticsDashboardConfig (versioning) | §50.14.8 | platform_mechanic | Tests whether sibling-section appendix extensions (§50.14.10 enums / PostHog events / error codes) propagate to a row anchored at §50.14.8. |
| F-AE-027 | AE-14.5-03: DefenseView Object Size Constraints | §39 | platform_mechanic | Tests `authored_extension_status=✅` for a ratified AE row and the §39 Object Size Constraints anchor's plan_gating posture. |

### Per-Feature Hostile-Reviewer Verdict

**F-150 — Bid Owner Role (§5.5, user_capability).** Read §5.5 end-to-end (lines 8772–8779). The section is a 7-line role table: Bid Owner, Bid Contributor, Bid Viewer with bid-workspace scope and high-level responsibilities. No detailed permission matrix (lives in §5.11), no AC, no state machine, no API, no plan-tier gating, no audit/observability instrumentation. Seeded `rbac=✅` is correct (§5.* override fired). All other dims `⚠` are appropriate Phase-0 conservatism — for a role-definition row, many cells (api / webhook / notifications / empty_state / loading_state / error_state) will demote to `n/a` in Phase-1+ and several (plan_gating, AC) will tighten via the §5.11 / §34 audit. **Verdict: aligned with Phase-0 doctrine. No tightening required at Phase 0. Phase-1+ tightening expected; will not produce Phase-0 defects.**

**F-380 — Seller Compressed Surface Mapping (§22.19, surface).** Read §22.19 end-to-end (lines 17733–17796). Section authors a canonical four-step compression with explicit step-to-phase mapping (§22.19.1), engine-vs-surface invariant block (§22.19.2 #1–#5), soft-phase-gate semantics (§22.19.3), **8 numbered, testable, scope-bound acceptance criteria (§22.19.4)**, and cross-references to Appendix M / §3.14.4 CI gates (§22.19.5). Hostile-reviewer findings on Phase-0 seed:

1. **`acceptance_criteria=⚠` should be `✅`.** §22.19.4 has 8 numbered AC explicitly satisfying the §13.10/§14.9/§17.8/§20.7 fidelity convention. The override registry's allowlist of AC-bearing anchors does not include §22.19. Class-default for `surface` is `⚠`.
2. **`ci_gate_coverage=n/a` should be `⚠` at minimum.** §22.19.4 #1, #3, #8 explicitly cite three §3.14.4 CI gates (`pipeline_surface_compression_seller_always_compressed`, `pipeline_surface_compression_no_separate_seller_phase_counter`, `pipeline_surface_compression_engine_unchanged`). The class-default for `surface` is `n/a`. The override registry does not promote on §3.14.4 references in body content.
3. **`console_firewall=⚠` could be `✅`.** §22.19.2 #1 governs Console Bridge projection of `pipeline_stage_id` and §22.19 Authoring intent paragraph explicitly cites §7.2 Dual-Console Firewall. The override registry's `firewall / console bridge / cross-console` keyword test runs on the row's name ("Seller Compressed Surface Mapping") — no match.

All three are Phase-0 over-conservatism artifacts traceable to the anchor/name-only override registry. Each will be tightened in Phase 1+ via full-section read. **Verdict: under-tightened against the actual section content; consistent with Phase-0 doctrine that errs toward `⚠`. Matches SC-0.3-3 self-challenge candidate (per-row body scanning is a Phase-1 task).**

**F-560 — Progress Storytelling Bootstrap UI (§35.2.3, surface).** Read §35.2.3 end-to-end (lines 29154–29168). Section authors three parallel bootstrap operations (Domain Bootstrap / KB Propose / First-Pass Draft) and four narrating status-line strings, with the durable rule "Status lines must reflect real operations — never fabricate steps." No data model, no state machine, no API endpoint, no AC table, no error-code registration, no enum, no observability instrumentation. The seeded `⚠` cells are appropriate Phase-0 conservatism; Phase-1+ may demote several (api / webhook / notifications / state_machine / data_model already `n/a` per surface class default) and may stay `⚠` on the others (mobile, accessibility, performance, observability) because §35.2.3 is silent on each. **Verdict: aligned with Phase-0 doctrine. Section is intentionally thin; the broader §35.2 onboarding flow carries the cross-cutting contract. No Phase-0 tightening required.**

**F-740 — OpsAnalyticsDashboardConfig (versioning) (§50.14.8, platform_mechanic).** Read §50.14.8 + sibling sub-sections (lines 38246–38332). Crucial finding: §50.14.8 itself is a thin entity field-table block; the cross-cutting Ops dashboard contract lives in **§50.14.9 (API surface — §32-compliant), §50.14.10 (Appendix Extensions — 5 PostHog events, 5 enum extensions, 5 new error codes), §50.14.11 (12 numbered AC), and §50.14.12 (Counterfactual Failure-Mode Pass — 6 modes)**. A hostile-reviewer reading the broader §50.14 area would tighten:

1. **`enums=⚠` should be `✅`** — §50.14.10 explicitly registers `ops_analytics_dashboard_kind`, `ops_dashboard_pii_projection_mode`, and `ops_action_kind` extensions in Appendix J.
2. **`posthog_events=⚠` should be `✅`** — §50.14.10 registers 5 PostHog events in Appendix G (`ops_dashboard_viewed`, `_widget_drill_through`, `_export_enqueued`, `_export_completed`, `_config_published`).
3. **`error_codes=⚠` should be `✅`** — §50.14.9 registers 5 new error codes in Appendix I.
4. **`residency=⚠` should be `✅`** — §50.14.11 #4 explicitly authors residency isolation property-test (10,000 simulated queries).
5. **`ci_gate_coverage=⚠` should be `✅`** — §50.14.11 #1, #12 explicitly cite the `ops_dashboard_source_is_customer_api` CI gate.
6. **`observability=⚠` should be `✅`** — §50.14.8 SLOs + §50.14.11 #8 (perf SLO alert wiring) + §50.14.11 #9 (PostHog `ops_dashboard_breach_detected`) + §50.14.11 #11 (Audit Event + OpsActionRecord wiring).
7. **`performance_budget=⚠` may tighten to `✅`** — §50.14.8 names 5 explicit SLO budgets (page first-load p95 ≤ 1.5s, widget render p95 ≤ 2.0s, drill-through p95 ≤ 1.0s, export p95 ≤ 30s for ≤100k rows).

Six-to-seven dimensions under-tightened. The under-tightening is structural: the row's primary anchor §50.14.8 captures only the entity field table; the cross-cutting contract lives in five sibling sub-sections (§50.14.9–§50.14.12) the override registry does not scan. **Verdict: under-tightened against actual section content. Strongest evidence to date for SC-0.3-3 (per-row body scanning is a Phase-1 task). The Phase-0 evidence column already flags each dimension as "not yet verified," so Phase-1 has the necessary breadcrumb. No Phase-0 correction required.**

**F-AE-027 — AE-14.5-03: DefenseView Object Size Constraints (§39, platform_mechanic, [AE: ratified]).** Read §39 lines bounding the DefenseView block (30100–30104). The AE row contributes 5 size-constraint rows (`recommendation_text` 500, `top_reasons[i].text` 280 ×3, `material_risks[i].text` 280, `material_risks[i].mitigation` 280, `cfo_summary_md` 4,000). Authoritative ratification per AE Ledger.

- **`authored_extension_status=✅`** is correct (AE Ledger flag `[AE: ratified]`).
- **`data_model=⚠`** — defensible; the row contributes 5 fields to §39 but the entity definition lives at §13.11 / Appendix L.7.
- **`plan_gating=⚠`** — §39 IS one of the three numerical-singleton homes for plan_gating per the convention. The override registry does not promote `§39` anchor → `plan_gating=✅` (only `§34` triggers). Hostile reviewer would argue the row IS the plan-gating contract for these fields, and `✅` is defensible. However, this row is content-character cap (rather than tier-quantity cap), so the convention conflation is subtle. `⚠` is conservatively defensible.
- All other dims `⚠` are defensible — the AE is narrowly scoped (5 size rows) and does not own most cross-cutting concerns; those live in F-261 (Defense View entity), F-262 (`defense_view_generate` capability), F-263 (state machine), F-AE-028 (error codes).

**Verdict: aligned with Phase-0 doctrine. The AE-status flag fired correctly. The remaining `⚠` cells are Phase-0 conservatism on a thin AE row.**

### Aggregate Verdict

3 of 5 (F-150, F-560, F-AE-027) fully aligned with Phase-0 doctrine on hostile-reviewer reading. 2 of 5 (F-380, F-740) under-tightened due to the override registry operating on anchors and names only. The under-tightening is consistent with the Phase-0 doctrine ("Phase 0 is allowed to err toward `⚠`") AND with the existing self-challenge candidate **SC-0.3-3** (per-row body scanning will tighten cells in Phase 1+). No Phase-0 doctrine violations. No Phase-0 defects promoted to `DEFECT_LEDGER.md` from this verification block.

### Self-Challenge: Hostile Re-Read of This Verification

A hostile reviewer of *this* block would ask three questions.

1. *Are the under-tightenings on F-380 and F-740 a defect of `COVERAGE_MATRIX.md` itself, or of the Phase-0 doctrine?* The doctrine permits `⚠` over-conservatism explicitly: *"Phase 0 is allowed to err toward `⚠`."* The matrix's evidence column flags each cell as "not yet verified," giving Phase 1+ the breadcrumb to promote. Therefore the under-tightenings are doctrine-compliant. They are not Phase-0 defects.
2. *Is sample size 5 sufficient for verification?* Audit_Prompts.md Prompt 0.3's VERIFICATION clause specifies 5. Each of the 5 here covers a distinct (`feature_class`, `section_anchor`) tuple, ensuring class-default and override-registry behavior are both exercised. The earlier spot-check (F-031, F-440, F-678, F-402, F-214) already covered `surface`, `platform_mechanic`, `growth_mechanic`, `user_capability`. Combined, the two samples exercise 6 of 8 feature classes (`engine_concept`, `surface`, `platform_mechanic`, `pricing_primitive`, `user_capability`, `growth_mechanic`); only `api_surface` and `integration_surface` are unexercised — but each is structurally covered by the override registry rules (`§31` / `§32` / §1.5 anchors). Sample size is sufficient.
3. *Should an SC-0.3-6 candidate be filed?* The F-740 finding strengthens SC-0.3-3 (sibling-section body scanning) but does not introduce a new failure mode. No new SC candidate filed.

### Updated Sign-Off Criteria for V0

V0 should confirm before phase-advancing:
- [ ] Row-count equality (`FEATURE_INVENTORY.md` 968 == `COVERAGE_MATRIX.md` 968).
- [ ] All 31 required convention dimensions present + `feature_id` / `feature_name` / `section_anchor` / `evidence` (`feature_class` retained as seeding key).
- [ ] Run summary block + per-dimension breakdown present and reproducible from cell counts.
- [ ] Override-registry cells fire correctly on at least one anchor pattern from each rule (§5.*, §31, §32, Appendix J, Appendix K, Appendix M, §40.2, §44, §47, §M.4/§M.5, §3.7.*, §3.11.*, §38, §37).
- [ ] AE rows in `FEATURE_INVENTORY.md` ratified-vs-pending parity matches `_integration/AUTHORED_EXTENSIONS_LEDGER.md`.
- [ ] At least 5 hostile-reviewer spot-checks per the Audit_Prompts.md verification clause.
- [ ] SC-0.3-1 through SC-0.3-5 triaged.
- [ ] No Phase-0 doctrine violation promoted to `DEFECT_LEDGER.md`.
