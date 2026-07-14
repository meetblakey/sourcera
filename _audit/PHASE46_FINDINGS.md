# Phase 46 Findings — §46 Test Strategy & QA Framework

**Scope.** Master Spec v7.1.0 §46.1 through §46.5 (lines 32994–33116). Eight checks per prompt:

1. Test pyramid per service (unit / integration / e2e).
2. Test coverage targets per surface.
3. AIOperation testing strategy: golden datasets, regression thresholds.
4. Console firewall test scenarios.
5. DSAR / GDPR test scenarios.
6. Performance regression tests cite §44.
7. Accessibility automated checks cite §37.
8. Mobile responsive checks cite §38.

**Date.** 2026-05-11.

**Inputs read end-to-end.** §46 (32994–33116); §1.3 Dual-Console Data Isolation (1346–1383); §1.6 Deployment Regions; §3.7 page surface catalog (page_surface_kind enum); §3.13 Principle 9 / §3.14 Pipeline Surface Compression; §6.8 GDPR sub-articles (10176–10440 — Access, Erasure, Cascade, SLA, Rectification, Restriction, Object, Portability, Automated Decision-Making); §7.5.3 Convex reactive SLO (Phase 2.3 baseline); §13.10 / §13.11 Defense View / §13.12 Buyer Maya; §14.9 / §17.8 / §20.7 (canonical AC style); §22 Managed Agents + §22.20 Seller Maya Polish; §27 Marketplace Discovery; §29 Notifications; §31 Webhooks (HMAC, idempotency, DLQ); §32 Public API (rate-limit classes, cursor pagination, Appendix I error codes); §34.1.1 / §34.1.2 plan tables; §34.2.5 Solo per-eval / per-bid; §34.3 / §34.3.3 cost-base; §34.5 plan-change & downgrade; §34.8 Entitlement Matrix; §34.10 AIWallet (incl. §34.10.3 Solo co-resident); §34.11 Outcome Resolver; §37.1–§37.5 accessibility/i18n/RTL/testing/ACs; §38.1 / §38.4 / §38.5 / §38.6 (5-tier taxonomy) / §38.7 / §38.8 / §38.9 / §38.10 / §38.11 / §38.12; §39 Object Size Constraints; §40.2 Retention & Deletion; §43 Ops Console; §44.1 / §44.2 / §44.3 / §44.4 / §44.5 / §44.6 (Solo-Tier Surface Treatment); §45 Privacy & Security; §M.4 / §M.5 (CI gate catalogs, 122 gates per CLAUDE.md); Appendix C Notification Event Catalog; Appendix G PostHog Taxonomy; Appendix I error codes; Appendix J Controlled Vocabulary Registry; `_audit/PHASE44_FINDINGS.md` (D-44-001 / D-44-003 / D-44-012 bear on the §46 perf-regression contract); `_audit/PHASE37_FINDINGS.md` (D-37-004 / D-37-005 bear on the §46 a11y contract); `_audit/PHASE38_FINDINGS.md` (mobile contract upstream); `_audit/PHASE_RETENTION_FINDINGS.md` (§40.2 + DSAR); `_integration/AUTHORED_EXTENSIONS_LEDGER.md` for the v7.1.0 ratification queue.

**Verdict.** §46 is the v6.0.0-era test strategy frozen since the v6 → v7 integration program; it has NOT been updated to absorb the v7.0.0 / v7.1.0 surface and engine expansion. The pyramid is platform-flat (not per-service); the advanced-feature catalog stops at the Section-25 capability declarations and omits every v7.x feature (Defense View §13.11, Buyer Maya §13.12, Seller Maya Polish §22.20, Pipeline Surface Compression §3.14, Single-Operator Mode §2.8, Solo-Tier Surface Treatment §44.6, KB Managed Agents §22, Marketplace Discovery §27, Pulse §16, AIWallet §4.8.3, OutcomeContract §34.11, Cost-Base Recalculation §4.8.6 / §34.3.3); the feature-flag table mirrors the v6.0.0 8-flag set and is internally inconsistent with §44.6 (Solo has no wallet; the "wallet-charged on all tiers" annotation breaks). §46 is silent on AIOperation evaluation strategy, console-firewall test scenarios, DSAR/GDPR test scenarios, entitlement enforcement testing, chaos / third-party-outage testing, schema migration & plan-downgrade testing, §M.4 / §M.5 CI-gate self-testing, i18n / RTL / locale testing, and test-data fixtures / mocking strategy. The cross-references that exist (Axe DevTools, "performance budget per §44.4 (p95 ≤ §44.1)", "Pagination cursor-based") are thin or anchor-less; the §46.5 ACs are loose, lack numbering, lack measurable thresholds, lack sign-off authority, and falsely claim AC parity for §31–§47. Filed 22 defects: 0 P0 · 12 P1 · 8 P2 · 2 P3.

---

## Walking the eight checks

### Check 1 — Test pyramid per service (unit / integration / e2e)

**Absent.** §46.1 carries a single platform-wide pyramid (Unit ≥ 80% Vitest; Integration ≥ 60% Vitest + "Convex test harness"; E2E ≥ 40% Playwright critical paths). The pyramid is NOT per-service.

Sourcera is multi-service: Convex backend functions; Next.js frontend (Buyer Console / Seller Console / Marketplace / Ops Console); Public REST API (§32); Webhook delivery (§31); AI Agent runtime (§22 Managed Agents); AIOperation metering + AIWallet engine (§4.8.1 / §4.8.3); OutcomeContract / Outcome Resolver (§34.11); Cost-Base Recalculation engine (§4.8.6 / §34.3.3); DSAR Cascade Walker (§6.8.4); §M.4 spec-lint pipeline (`tools/spec-lint/*`); Cron workers (§M.4 nightly digest cron at `convex/crons/appendix_m_gate_nightly_digest.ts` plus the cron set at §43 / §40.2). A single 80/60/40 numeric line cannot bind these services individually: Convex backend functions warrant higher unit-coverage (ACID semantics + reactive consistency), Public API warrants contract testing against the OpenAPI / Appendix I error-code spec, Webhook delivery warrants idempotency + DLQ replay testing, AI Agent runtime warrants eval harness (Check 3), and the spec-lint pipeline is itself a CI-gate harness that needs self-testing.

Coverage methodology is undefined: line vs branch vs statement vs path. "Critical paths ≥ 40% E2E" is unenumerated — what flows count? §13 phases 1–13, §22.20 Seller Maya, §13.11 Defense View, §13.12 Buyer Maya, §44.6 Solo-Tier Surface Treatment, §34.5 plan change, §6.8 DSAR fulfillment, §27 Marketplace search/EOI/NDA? §46 is silent.

The pyramid is also silent on test types beyond the three labels: contract testing (consumer-driven contracts between Convex backend and Next.js frontend, or between AIOperation engine and Outcome Resolver), property-based testing (fast-check / Hypothesis-style — important for cost-base recalculation and Outcome Resolver settlement), snapshot testing (component output stability), visual regression testing (Chromatic / Playwright screenshot diffs), mutation testing (Stryker), and load testing (which §44.4 owns separately but §46.1 does not bind to the pyramid).

→ **D-46-001** (P1 — pyramid not per-service; critical-path E2E flow set unenumerated; coverage methodology undefined).

### Check 2 — Test coverage targets per surface

**Partial.** §46.2 enumerates test cases for 8 v6.0.0-era features (Collaborative Scoring §12, Policy Ingestion §11, TCO §14, Scenario Modeling §13, Organizational Intelligence §24, Capability Declarations §25, Command Palette §19, Real-Time Collaboration / Convex OT) plus three cross-cuts (API, Mobile, Webhooks). The catalog is feature-by-feature, NOT surface-by-surface (compare §3.7 `page_surface_kind` enum: Dashboard, Matrix, Detail, Settings, Ops Console, Knowledge Base, plus §38.8 mobile parity matrix surfaces).

The catalog is v6.0.0-era and was not updated for v7.0.0 or v7.1.0. Every v7.x feature is uncovered:

- **§13.11 Defense View** — 5 error codes (Appendix I v7.1.0 sub-section), state machine in Appendix L.7, AC set added in Phase 14. Zero test cases in §46.2.
- **§13.12 Buyer Maya Intake** — 23 ACs, 4 error codes (Master Spec changelog line 63). Zero test cases.
- **§22.20 Seller Maya Surface Polish** — silent AI surface, §22.20.5 telemetry suppression. Zero test cases.
- **§3.14 Pipeline Surface Compression** — surface compression bar, Appendix M.1 row. Zero test cases.
- **§2.8 / §44.6 Single-Operator Mode + Solo-Tier Surface Treatment** — 18 ACs, 7 §M.5 CI gates, 4 webhook events (§44.6.5), engine-absorbed envelope semantics (§44.6.3 / §44.6.4). Zero test cases.
- **§22 KB Managed Agents** — `managed-agents-2026-04-01` API, Agent SDK, tool use, skills, retrieval, indexing. Zero test cases.
- **§27 Marketplace Discovery** — EOI, NDA Execution (§3.7.6.6 third-party iframe), Verification Tier (Basic / Verified / Certified), Marketplace Reviews. Zero test cases.
- **§16 Evaluation Pulse / Pulse Health Score / Pulse Digest** — F-559 / F-534 Hero Moment cluster, `hero_moment_completed_at` p90 SLO ≤ 10s (D-0V-002). Zero test cases.
- **§4.8.3 AIWallet + §34.10 budget service** — wallet states (`active`, `soft_warned_50`, `soft_warned_80`, `hard_capped_100`, `payment_failed_grace`), overage, auto-topup, co-resident rule (§34.10.3). Zero test cases.
- **§34.11 OutcomeContract + Outcome Resolver** — settlement transitions (`pending → accepted | auto_accepted | rejected | reversed`). Zero test cases.
- **§4.8.6 / §34.3.3 Cost-Base Recalculation + 30-day breaking-change banner** — recalc cadence, CostBaseRecalculationLog. Zero test cases.
- **§6.8 GDPR sub-articles (§6.8.7–§6.8.11 Article 16/18/21/20/22)** — Authored Extensions AE-3.5-001 through -005. Zero test cases.

Compared against the §46.2 catalog claim of completeness for "advanced features": the surface set has effectively doubled since v6.0.0 and §46.2 has not been touched.

In addition, §46.2 inline restates several numerical singletons rather than citing source tables: Insight Card divergence `> 0.3` (cite §12 or canonical home); touch targets `≥ 48px` (cite §37.1 motor and §38.1 / §38.5 — already duplicated across sections, drift surfaced here); real-time sync `< 500ms` and `< 200ms` (cite §44.1 row table — note D-44-002 inconsistent percentile binding); pre-score rate-limit `10,001st request → 429` (cite §32 rate-limit class table); deduplication `≥ 90%` semantic match (cite §11 canonical home).

→ **D-46-002** (P1 — §46.2 catalog v6.0.0-era; v7.x features uncovered); **D-46-003** (P1 — §46.2 organizes by feature not by §3.7 `page_surface_kind` surface, no per-surface coverage matrix); **D-46-017** (P2 — §46.2 inline restates numerical singletons).

### Check 3 — AIOperation testing strategy: golden datasets, regression thresholds

**Absent.** §46 contains zero AIOperation testing strategy. There is no reference to golden datasets, no regression thresholds for model output quality, no evaluation harness, no model-version regression testing.

The corpus authors AIOperation as a billable, accounted, margin-protected engine: §4.8.1 AIOperation entity, §4.8.2 CapabilityRegistryEntry, §34.3 cost-base derivation, §34.3.3 30-day breaking-change window, §34.11 Outcome Resolver. The runtime is Anthropic Claude (Opus / Sonnet / Haiku per §44.2). Quality regression on AI outputs has direct margin and customer-trust consequences:

- **Model-snapshot regression.** Anthropic releases model snapshots (e.g., `claude-opus-4-6`, `claude-sonnet-4-6`, `claude-haiku-4-5-20251001` per the system prompt). A snapshot upgrade can shift accept/reject mix, cost-base, or response quality. §34.3.3's 30-day breaking-change window assumes detection; §46 specifies no detection apparatus.
- **Golden-dataset eval.** Each capability (`policy_ingestion`, `first_pass_rfp_response_generator`, `scenario_modeling`, `ai_vendor_research`, `match_score_numeric`, Buyer Maya intake, Seller Maya intake, KB Managed Agent skills) needs an eval suite with curated inputs, expected outputs, and pass/fail thresholds.
- **Cost-base regression.** §34.3 specifies `value_price_cents` / `cost_price_cents` per capability, with a `cost_base_cents` derivation that feeds margin protection. Regression on the derivation (e.g., Anthropic price change, infra overhead drift) must be detected.
- **Drift detection.** Response-quality drift over time (e.g., due to prompt-pack changes, tool-call schema changes, retrieval-index drift) must be detected via rolling eval.
- **Buyer Maya / Seller Maya intake.** §13.12 / §22.20 author specialized intake agents with PII-handling and onboarding-conversion responsibilities. No eval framework.

The eval framework class is named in industry usage (LangSmith, Braintrust, Promptfoo, Anthropic's own evals API); the corpus picks none.

→ **D-46-004** (P1 — AIOperation testing strategy entirely absent).

### Check 4 — Console firewall test scenarios

**Absent.** §46 contains zero console firewall test scenarios. The dual-console data isolation contract (§1.3) is the strongest invariant in the spec — a P0 by Severity Rule (a) — yet §46 is silent on:

- **Org-scope leakage.** A Buyer Console query returning Seller Console rows for the same org_id (or vice versa). §1.3.2 enumerates 17 console-scoped entities; a regression test must walk every entity and confirm cross-console reads return zero.
- **Marketplace-domain leakage.** §1.3.2 declares Marketplace as a neutral domain (EOI, NDA Record, Marketplace Listing, Marketplace Review). A regression test must confirm Marketplace queries do NOT expose Buyer-only or Seller-only fields.
- **Cross-Console Bridge integrity.** §4.7 Cross-Console Bridge entities explicitly enumerate carried vs. redacted fields. No test confirms the redaction.
- **Query scoping enforcement.** §1.4 requires console-scoped queries to carry both `org_id` AND `console`. A regression test must reject any list-endpoint call lacking `console` parameter (current Authoring Convention violation produces a P0 firewall leak per the audit rules).
- **Multi-tenancy test fixtures.** No test fixture is specified for a multi-org, multi-console test data set.
- **Webhook event-class firewall.** §31 webhooks carry `console` and `org_id`; a regression must confirm Buyer-Console-only event_kinds (e.g., evaluation lifecycle events) cannot be delivered to a Seller Console subscriber.

§46.2's API row says "All API endpoints functional (CRUD operations)" — that is functional coverage, not isolation coverage. The §1.3 firewall is the corpus's most important security boundary and has no test contract.

→ **D-46-005** (P1 — console firewall test scenarios entirely absent).

### Check 5 — DSAR / GDPR test scenarios

**Absent.** §46 contains zero DSAR or GDPR test scenarios. The corpus authors a complete GDPR Chapter III rights set across §6.8.1 through §6.8.11 plus retention/auto-delete at §40.2 plus residency lock at §1.6. None of these has a test contract in §46.

Missing scenarios:

- **§6.8.1 Right of Access (data export).** No test for export completeness (every data class enumerated in §6.8.1 must appear in the export), secure download link expiry (7 days), JSON nested format, anonymized references to other users.
- **§6.8.2 Right to Erasure (anonymization on deprovisioning).** No test that comments / responses are anonymized (`user_id = null`, `author_name = "[Anonymized User]"`, content preserved).
- **§6.8.3 / §6.8.4 / §6.8.5 Erasure Cascade.** No test of the DSAR Cascade Walker; no test that cascade traversal terminates within the §6.8.6 SLA; no test for cascade with `low_priority_background` capability suppression on Solo (per D-44-010 edge-case enumeration silence).
- **§6.8.6 DSAR Operational SLA.** No test for SLA timer enforcement.
- **§6.8.7 Rectification / §6.8.8 Restriction / §6.8.9 Object / §6.8.10 Portability / §6.8.11 Automated Decision-Making.** Authored Extensions AE-3.5-001 through -005, pending legal sign-off; §46 silent.
- **§40.2 Retention TTL enforcement.** No test that data classes are auto-deleted on schedule.
- **§1.6 Data-residency lock.** No test that an `eu` org's data never crosses to `us` (or vice versa); no test for residency-locked invoicing (per §4.8.1 `legal_entity` mapping); no test for the §44.6.7 residency edge case (cross-region cost-base recalculation cadence, regional invoice currency).
- **PII fixtures.** No specification for synthetic-vs-real PII in test data sets — a hostile reviewer would correctly flag that an absence of test-data fixtures specification can lead to PII leakage in CI logs.

→ **D-46-006** (P1 — DSAR / GDPR test scenarios entirely absent).

### Check 6 — Performance regression tests cite §44

**Partial.** §46.3 carries one citation: "Load test (500 concurrent users) — performance budget per §44.4 (p95 ≤ §44.1 budget for the equivalent endpoint class)." That single line is the entire performance-regression contract.

Gaps:

- **No CI gate.** Per Phase 44 D-44-003: §M.5 catalog (122 gates) contains zero performance-regression gates. §46.3 references the §44.4 cadence (monthly 500-user / quarterly 2,500-user spike / quarterly 24h endurance) but does not specify a CI hook. §44.5 ACs ("Production p95 latency consistently < 500ms") are runtime claims with no automated detector.
- **§46.5 AC vs §7.5.3 measurement contract conflict.** §46.5 AC line "Real-time collaborative features sync < 200ms" is described in §44.5 as "measured via WebSocket delta timing"; §7.5.3 (Phase 2V D-2.3-002 remediation) declares Convex commit-to-observation latency as the canonical measurement contract. The §46.5 AC inherits the §44.5 measurement contract by silence and the conflict propagates.
- **§44.2 Agent budgets uncovered.** §44.2 declares per-Anthropic-model cost ranges and per-capability budget ceilings. No regression test for budget overrun detection.
- **§44.6 Solo-Tier Surface Treatment uncovered.** §44.6.5 declares four webhook events (`solo.envelope.exhausted`, `solo.throttling_engaged`, `solo.throttling_cleared`, `solo.capability.envelope_no_block_invoked`) and §44.6.8 declares 18 ACs. No test for the engine-absorbed envelope, the §44.6.4 throttling state, or the §44.6.7 edge cases (15 enumerated, with 5 additional dimensions filed under D-44-010).
- **Core Web Vitals coverage.** Per D-44-001: in-app CWV (LCP / INP / CLS / TTFB) absent from §44.1; §46.3 doesn't test them either; no Lighthouse-CI hook.
- **Build-time bundle-size budget.** Per §26.9.10 the public-page side carries a `bundlesize` CI hook; in-app side has no analogue; §46 silent.

→ **D-46-007** (P1 — perf-regression coverage thin; §44.5 / §46.5 measurement methodology conflicts §7.5.3; Solo-Tier and Agent budgets uncovered).

### Check 7 — Accessibility automated checks cite §37

**Partial.** §46.3 says "Axe DevTools accessibility audit passes (zero violations)." That is the entire a11y test contract in §46.

Gaps:

- **No §37 anchor.** "Axe DevTools" is named but §37.4 (which authors the canonical accessibility testing contract — "Automated accessibility audits (Axe DevTools) on every UI change (CI/CD gated). Annual third-party WCAG 2.1 AA audit (external firm). Screen reader testing (NVDA, JAWS) on critical workflows.") is not cited by anchor.
- **Screen reader testing.** §37.4 declares NVDA and JAWS testing on critical workflows; §46 silent. Critical workflow set unenumerated.
- **Annual third-party audit.** §37.4 declares an annual WCAG 2.1 AA external-firm audit; §46 silent on cadence, external-firm SLA, and audit-finding remediation contract.
- **Per-Success-Criterion test coverage.** §37.1 (per the v7.1.0 Phase 10V remediation, AE-37-01) enumerates ~40 WCAG 2.1 AA Success Criteria plus 6 WCAG 2.2 AA additions. Phase 37 D-37-004 (queued to v7.1.1) plans to lift this list into §37.5 as numbered per-criterion ACs with per-criterion test fixtures. §46.3 carries zero per-Success-Criterion test mapping.
- **Per-Surface Conformance Posture binding.** §37.1 introduces the Appendix M.1 `Conformance Posture` cell, enforced by the §M.4 `appendix_m_coverage_on_diff` gate augmented with `appendix_m_conformance_posture_completeness` sub-gate (per Phase 37 D-37-005 remediation). §46 silent on test scenarios for the conformance-posture contract or the new sub-gate.
- **Embedded third-party iframes.** §3.7.6.6 NDA Execution row in §38.8.2 cites Stripe Checkout, Adobe Sign, Zendesk Support Widget as the deviation set. §46 silent on a11y test scenarios for these iframes (which §37.1 explicitly carves out as deviation cases).
- **Keyboard navigation / focus indicator / color contrast / aria-live.** §37.1 enumerates these; §46 carries no specific tests for them, only the umbrella "Axe DevTools".

→ **D-46-008** (P1 — accessibility test contract too thin; §37.4 not cited by anchor; screen-reader, per-SC, and Appendix M.1 conformance-posture binding tests absent).

### Check 8 — Mobile responsive checks cite §38

**Partial.** §46.2 Mobile Responsiveness sub-section carries four E2E lines:

```
- Mobile viewport (375px) displays without horizontal scroll.
- Touch targets ≥ 48px on mobile.
- Read workflows fully functional on mobile (view requirements, responses, comments).
- Limited write workflows (comments, boolean responses) fully functional on mobile.
```

Gaps:

- **No §38 anchor.** §38.5 ACs ("Mobile experience displays correctly on 375px width", "Touch targets ≥ 48px on mobile", "Read workflows fully functional on mobile", "Limited write workflows...") are restated inline. §46.2 should cite §38.5 (or §38.1 / §38.4 for the canonical content homes).
- **5-tier breakpoint coverage.** §38.6 declares the engineering-authoritative taxonomy: `mobile_xs` (< 640px), `mobile_sm` (640 ≤ w < 768), `tablet` (768 ≤ w < 1024), `desktop` (1024 ≤ w < 1280), `desktop_xl` (≥ 1280). §46.2 tests only 1 of 5 tiers (375px ∈ `mobile_xs`). The §38.6.2 layout contract per tier is untested.
- **§38.7 Gesture Equivalents.** Keyboard-to-gesture translation contract — untested.
- **§38.8 Mobile Feature Parity Matrix.** The full parity matrix (Dashboard / Matrix / Detail / Settings / Pulse / Pipeline / etc. — multiple rows) — untested. The §38.8.2 NDA Execution iframe row carries deviation rationale; no test.
- **§38.9 Print Stylesheet.** Untested.
- **§38.10 Reduced-Motion & Accessibility Tier Overrides.** `prefers-reduced-motion` interaction with motion-heavy surfaces — untested. Note D-44-010 already filed the silence on Solo throttling toast `prefers-reduced-motion` interaction.
- **§38.11 RTL & Locale Mirror Behavior.** Untested. Note §37.3 declares RTL deferred to Phase 2; §46 nonetheless silent on the CSS-logical-properties test contract that §38.11 references.
- **§38.12 Presence Avatar Stack.** Untested.
- **Numerical singletons restated inline.** 375px (cite §38.1 row `< 640px` / §38.2 minimum / §38.6.1 row `mobile_xs`); 48px (cite §37.1 motor + §38.5 AC); these are duplications.
- **Tier-transition telemetry.** §38.6 declares the `ui_responsive_breakpoint_crossed` PostHog event with `from_tier`, `to_tier`, `width_px`, `reason ∈ {resize, rotation, dev_tools_open, split_view_change}` enum. Untested.

→ **D-46-009** (P1 — mobile test contract too thin; §38 not cited by anchor; 5-tier taxonomy and §38.6–§38.12 sub-sections uncovered; numerical singletons restated inline).

---

## Additional findings surfaced during the walk

### §46.4 feature-flag catalog is v6.0.0-era and internally inconsistent

The §46.4 table enumerates 8 flags (`collaborative_scoring`, `policy_ingestion`, `scenario_modeling`, `tco_modeling`, `organizational_intelligence`, `capability_declarations`, `marketplace_capability_filter`, `ai_vendor_research`). The set mirrors the v6.0.0 advanced-feature list (Sections 11–25) and was not updated for v7.0.0 or v7.1.0.

Missing v7.x flags that the corpus elsewhere implies are independently kill-switchable:

- `defense_view` (§13.11) — 5 error codes, state machine, ACs.
- `buyer_maya_intake` (§13.12) — 23 ACs, 4 error codes.
- `seller_maya_polish` (§22.20) — silent AI surface.
- `pipeline_surface_compression` (§3.14) — surface compression bar.
- `single_operator_mode` (§2.8) — single-operator personal-card flow.
- `solo_tier_surface_treatment` (§44.6) — 18 ACs, 7 §M.5 gates, 4 webhook events.
- `kb_managed_agents` (§22) — Managed Agents `managed-agents-2026-04-01` API.
- `marketplace_discovery_*` (§27) — discovery, EOI, NDA Execution sub-features.
- `outcome_resolver_settlement` (§34.11) — settlement transitions.
- `evaluation_pulse_*` (§16) — pulse health score, pulse digest.

Internal inconsistencies in the existing table:

- **`policy_ingestion` and `scenario_modeling` "wallet-charged on all tiers; flag remains for emergency kill-switch only".** Per §44.6.1 hide-list item 1–3, Solo has NO wallet — engine-absorbed envelope only (§44.6.3). The "wallet-charged on all tiers" annotation is false for Solo. The behavior on Solo (engine-absorbed vs. surface-suppressed-but-engine-absorbed vs. flag-disabled) is undefined.
- **`ai_vendor_research` "Default: Off (Enterprise-only per §34.1.1)".** The flag is the "kill switch" per the rest of the table convention; the default for kill-switchable features should be "On" on Enterprise (because the entitlement matrix already gates non-Enterprise). "Off" as the default implies Enterprise customers get the feature only if the flag is explicitly toggled on, which contradicts §34.8 Entitlement Matrix where `ai_vendor_research` is `enterprise+` hard entitlement. Either the entitlement-and-flag precedence is undefined, or the table cell is wrong.
- **Flag-AND-entitlement closing line.** §46.4 ends with "A feature must pass both the flag check and the entitlement check to be accessible." There is no test scenario for the AND semantics; no test for the user-experience error when one passes and the other fails (Is it a 403? A "Feature unavailable" toast? Cite the surface error?).

→ **D-46-010** (P1 — §46.4 feature-flag catalog v6.0.0-era; Solo-wallet conflict; flag-vs-entitlement precedence ambiguous).

### §46.5 acceptance criteria are loose and falsely claim parity

```
- All sections with features have explicit acceptance criteria (already met in Sections 1-30; Sections 31-47 maintain parity).
- E2E test coverage ≥ 40% of critical user flows.
- Unit test coverage ≥ 80% of business logic.
- Pre-release QA sign-off required before deployment.
- All bugs fixed before 100% rollout.
```

Defects:

- **Unnumbered.** §13.10 / §14.9 / §17.8 / §20.7 author canonical AC style: numbered, observable inputs, observable outputs, measurable thresholds, scope-bound. §46.5 carries five unnumbered bullets.
- **False parity claim.** "Sections 1-30 ... Sections 31-47 maintain parity" is demonstrably false. Phase 14 audits filed numerous defects against §31–§47 ACs (e.g., D-44-007 — "AC parity for §31-§47" specifically called out in PHASE44_FINDINGS.md additional-findings block; §M.4 / §M.5 themselves are v7.1.0 additions with ratification still queued).
- **Numerical duplication.** The 40% / 80% restate §46.1 numerics rather than citing §46.1.
- **Sign-off authority undefined.** "Pre-release QA sign-off required" — by whom? Engineering Director? QA Lead? Ops Console (§43) actor? §17 Defects & QA Console actor? The §43 Ops Console may register sign-off events; §46 silent.
- **Bug-severity threshold undefined.** "All bugs fixed before 100% rollout" — what bug severity? Sev0 / Sev1 / Sev2 / Sev3? §43.5.4 incident severity scale exists; §46.5 doesn't cite. A reading that "all" means "every P3 cosmetic bug" is implausible; a reading that "all" means "all Sev0/Sev1" requires explicit threshold.

→ **D-46-011** (P1 — §46.5 ACs unnumbered; false §31–§47 parity claim; sign-off undefined; severity threshold undefined).

### §46 silent on §M.4 / §M.5 CI gate self-testing

CLAUDE.md §16 declares 122 §M.5 CI gates in v7.1.0 (Phase V11 closeout, 2026-05-11), with 2 runtime-active, 119 spec-binding-pending across implementation packs M02.3 / M11.3 / M21.3 / M24.3, and 1 release-gate-only. §M.4 declares the `appendix_m_coverage_on_diff` detector pipeline with concrete artifacts (`tools/spec-lint/appendix_m_coverage_on_diff.ts`, `override_parser.ts`, `cross_validation.ts`, `cosmetic_edit_filter.ts`, `convex/crons/appendix_m_gate_nightly_digest.ts`, `convex/audit/spec_lint_audit_event.ts`).

§46 carries zero references to:

- Unit tests for the detector itself, the override parser (§M.4.4.1 / §M.4.4.5 grammar), the cross-validation pipeline (§M.4.4.2 customer-surface-reachability — the V11 firewall hardening that closes the D-11.2-004 P0 firewall bypass), the cosmetic-edit filter.
- Integration tests for the GitHub Action workflow (`.github/workflows/spec-lint.yml`).
- Eval tests for the Slack `#spec-ops` digest cron behavior.
- Self-tests for the AuditEvent serializer.
- Smoke tests for the v7.1.1 stamp gate `v7_1_1_stamp_gate_runtime_status_audit` (the release-gate-only gate).

These are the most consequential automation in v7.1.0 — they directly enforce the surface/engine contract — and they have no test contract in §46.

→ **D-46-012** (P1 — §46 silent on §M.4 / §M.5 CI gate self-testing).

### §46 silent on AIWallet / OutcomeContract / Cost-Base Recalculation engine

Three engine surfaces directly hold revenue-leakage / double-charge / margin-protection exposure:

- **§4.8.3 AIWallet + §34.10 budget service.** States (`active`, `soft_warned_50`, `soft_warned_80`, `hard_capped_100`, `payment_failed_grace`); overage handling; auto-topup; co-resident rule (§34.10.3). No test contract.
- **§34.11 OutcomeContract + Outcome Resolver.** Settlement transitions (`pending → accepted | auto_accepted | rejected | reversed`); contest flow (§34.11.2). No test contract.
- **§4.8.6 / §34.3.3 Cost-Base Recalculation.** 30-day breaking-change window; CostBaseRecalculationLog; per-capability `solo_envelope_override_value_cents` field (AE — Phase 14.10). No test contract.

Severity is P1 because the audit's P0 trigger (d) — "leaves a billing surface ambiguous in a way that allows revenue leakage or double-charge" — is the live invariant these engines protect, and an absent test contract increases the probability of regression. Routing P1 not P0 because §46's silence is documentation absence, not an active leakage; the engines themselves are spec'd at §4.8 / §34. Aligns with the tiebreaker default.

→ **D-46-013** (P1 — AIWallet / OutcomeContract / Cost-Base Recalculation engine test scenarios absent).

### §46.3 stability criterion and canary mechanism undefined

§46.3 says "Feature flag rollout to 10% (canary) via PostHog. Monitor 24 hours (error rate, latency, user feedback). If stable, 100% rollout."

- **Stability criterion undefined.** What error-rate threshold for stability? What latency p95? What CSAT? What user-feedback volume? Cite §44.1 budgets? §43 incident-severity? §29 user-feedback channels?
- **Canary cohort selection undefined.** PostHog feature flags expose user-cohort selection (random %, geography, plan-tier, custom property). §46.3 silent on which selection rule applies. A 10% canary of Enterprise customers is structurally different from a 10% canary of Free trialists.
- **Rollback trigger undefined.** What error-rate or latency breach triggers automatic rollback? Manual rollback? Who's paged? §43 Ops oncall? §M.4 Slack `#spec-ops`?

→ **D-46-014** (P2 — §46.3 stability criterion + canary cohort + rollback trigger undefined).

### §46 silent on chaos / third-party-outage testing

The corpus has 10 third-party dependencies — WorkOS (auth), Stripe (billing), Convex (DB/RPC), Anthropic (AI), Firecrawl (web), PostHog (analytics + feature flags), Loops.so (email), Perplexity (vendor research), Zendesk (support), Vercel (hosting). The audit checklist explicitly lists each as a test dimension. §46 has zero outage-scenario coverage:

- WorkOS unavailable during login (degraded SSO fallback?).
- Stripe unavailable during invoice posting (retry curve? double-charge guard?).
- Convex partial-degradation (reactive subscription drop, ACID rollback).
- Anthropic 429 / 503 (AIOperation retry semantics; cost-base unchanged?).
- Firecrawl unavailable during KB ingestion (queue + DLQ?).
- PostHog feature-flag fetch failure (default-to-disabled or default-to-enabled? §46.4 doesn't say).
- Loops.so email-send failure (audit-event recorded? retry?).
- Perplexity unavailable (AI vendor research degraded gracefully?).
- Zendesk unavailable (in-app support widget fallback?).

No chaos / fault-injection framework named (Toxiproxy, Gremlin, Chaos Mesh, AWS FIS).

→ **D-46-015** (P2 — §46 silent on chaos / third-party-outage testing).

### §46 silent on schema migration and plan-downgrade testing

§34.5 declares plan-change semantics including downgrade paths and data preservation. §40.2 declares retention. Schema migrations themselves are mentioned at §47 (versioning) but §46 specifies no migration test:

- Test that a forward migration is reversible.
- Test that a downgrade from Growth → Starter preserves Growth-exclusive data (Org Intelligence Full → Vendor History only, per §34.1.1) and does not delete it.
- Test that a downgrade Buyer Growth → Buyer Solo (the post-Phase-14.9 path) preserves wallet history and absorbs the user into the engine-absorbed envelope.
- Test that retention auto-delete runs on schedule.

→ **D-46-016** (P2 — §46 silent on schema-migration / plan-downgrade-data-preservation testing).

### §46 silent on entitlement enforcement testing (§34.8)

§34.8 Entitlement Matrix is the canonical machine-readable feature-vs-tier gating contract. §46.4 closing line declares feature-flag-AND-entitlement enforcement but no test exists. Critical scenarios:

- Test that a Starter user attempting a Growth-only capability receives 403 with the canonical error code (Appendix I).
- Test that the Public Pricing API (§4.8.9) is open to all tiers per §44.6.1 last paragraph.
- Test that Solo's engine-absorbed envelope correctly suppresses customer-visible surfaces while engine-side metering continues (§44.6.1 hide list × engine continues to publish per §4.8.9 AC #1).

→ **D-46-017** (P2 — §46 silent on §34.8 entitlement enforcement testing).

### §46 silent on i18n / RTL / locale / timezone / currency testing

§37.2 declares i18n-ready (next-intl, externalized strings, locale-aware date/number/currency, user-configurable timezone). §37.3 declares RTL deferred to Phase 2 but CSS logical-properties architecture in place. §46 silent on:

- String-externalization completeness test (no hardcoded UI strings).
- Pseudo-localization test (translation expansion stress test).
- Locale-aware date format test (en-US MM/DD/YYYY vs en-GB DD/MM/YYYY vs en-AU DD/MM/YYYY vs ISO).
- Currency formatting test (USD / EUR / GBP / JPY no-decimal).
- Timezone test (org timezone vs user timezone; DST transition; UTC offset edge cases).
- RTL CSS-logical-properties test (no hardcoded `left`/`right`).

→ **D-46-018** (P2 — §46 silent on i18n / RTL / locale / timezone / currency testing).

### §46 silent on test-data fixtures, mocking, environment, and flaky-test management

§46 doesn't author:

- Test-data fixture strategy (synthetic PII, multi-tenant scaffolding, per-feature seed data).
- Mocking strategy (mock Convex DB? real preview deploy? mock Anthropic? mock Stripe? — note CLAUDE.md feedback against mocking the DB in integration tests would apply here).
- Test-environment matrix (local-dev / per-PR ephemeral / staging / canary / prod).
- Flaky-test management (retry policy, quarantine, flake-rate budget).
- Test-artifact retention (test reports, screenshots, traces).
- Test-failure escalation routing (who's paged when CI fails?).
- Test execution parallelism (test sharding, max wall-time).

→ **D-46-019** (P2 — §46 silent on test-data fixtures / mocking / environment / flaky-test management).

### §46 silent on security testing (SAST / DAST / SCA)

§45 declares Privacy & Security; the §M.4 cross-validation step (the V11 hardening that closes D-11.2-004 P0 firewall bypass) is itself a security boundary. §46 carries zero security test:

- SAST (CodeQL, Semgrep) on Convex backend functions.
- DAST on Public API (§32).
- SCA / dependency vulnerability scanning (Snyk, Dependabot).
- Secret scanning (truffleHog, GitHub secret scanning).
- Authentication / authorization regression (RBAC negative test).
- CSRF / XSS / SQLi / SSRF / IDOR scenario coverage.
- Webhook signature-bypass test (HMAC-SHA256 forged signature rejection per §31).

→ **D-46-020** (P2 — §46 silent on security testing).

### §46.3 "Phases 1-13 progression" v6.0.0 nomenclature

§46.3 manual-regression line names "Phases 1-13 progression, scoring, API" — that is v6.0.0 evaluation-phase terminology. v7.1.0 has extensive surface additions (Single-Operator Mode §2.8, Defense View §13.11, Buyer Maya §13.12, Seller Maya §22.20, Surface Compression §3.14, Solo-Tier Surface Treatment §44.6) that are unaddressed in the manual-regression set. Cosmetic by rule (resolvable by a thoughtful engineer who maps modern phase numbering on read), but a junior engineer doing a regression pass against the literal list would miss the v7.x surfaces.

→ **D-46-021** (P3 — §46.3 v6.0.0 phase nomenclature drift).

### §46.3 Datadog "error rate < 1%" inline numerical singleton

§46.3 release-criterion line: "Datadog dashboard green (error rate < 1%; latency within §44.1 authoritative budget)." The error-rate 1% threshold is unsourced. Authoring Convention #10 requires every numerical singleton to have exactly one authoritative home. The threshold doesn't appear in §44, §43, or §29; no `error_rate_budget` registered.

→ **D-46-022** (P3 — §46.3 inline `error rate < 1%` not single-sourced).

---

## Self-Challenge Pass

Re-reading the 22 defects as a hostile reviewer.

- **D-46-001 (P1, pyramid not per-service).** Reproducible (§46.1 row table). Severity per Rule "missing acceptance criteria / state machine" — pyramid is the AC equivalent for testing; absence of per-service decomposition is P1 by tiebreaker (junior engineer would build wrong thing). Confirmed P1.
- **D-46-002 (P1, v7.x feature catalog absent).** Reproducible (§46.2 enumerated; v7.x section IDs cross-walked). P1 by rule (missing acceptance criteria for v7.x features). Confirmed.
- **D-46-003 (P1, surface vs. feature).** Could be P2 (a thoughtful engineer might reconcile feature-by-feature to surface-by-surface). The Audit checklist Check 2 specifically asks "per surface" — the prompt explicitly requires per-surface decomposition. P1 by the prompt's check scope. Confirmed.
- **D-46-004 (P1, AIOperation testing absent).** Reproducible. Severity per Rule (d) — billing surface for AIOperation engine is ambiguous re: regression. The absence is documentation, not active leakage; P1 by tiebreaker (not P0). Confirmed.
- **D-46-005 (P1, console firewall absent).** Could be P0 by Severity Rule (a) — "breaks the buyer/seller console firewall" — but the rule reads as filing P0 when an active firewall break exists. §46 silence on firewall test scenarios is documentation absence, not an active break. P1 by tiebreaker. Confirmed P1. (A future P0 may emerge if a real firewall-breach defect is filed in §1.3 or §4.7.)
- **D-46-006 (P1, DSAR/GDPR absent).** Reproducible. Severity per Rule (c) — "GDPR right-to-erasure, US/EU data-residency lock" — same framing as D-46-005: absence of test contract is documentation absence, not active regulatory breach. P1 by tiebreaker. Confirmed.
- **D-46-007 (P1, perf-regression cite §44).** Reproducible. P1 by rule. Confirmed.
- **D-46-008 (P1, a11y cite §37).** Reproducible. P1 by rule (missing AC). Confirmed.
- **D-46-009 (P1, mobile cite §38).** Reproducible. P1 by rule. Confirmed.
- **D-46-010 (P1, §46.4 feature-flag catalog).** Reproducible. Solo-wallet conflict is internal inconsistency between two parts of the spec; P1 by rule (conflicting numerical / behavioral singleton). Confirmed.
- **D-46-011 (P1, §46.5 ACs loose).** Reproducible. P1 by rule (false parity claim is a positive falsehood in the spec). Confirmed.
- **D-46-012 (P1, §M.4 / §M.5 self-test).** Reproducible. P1 by Severity Rule (e) — "leaves a CI gate referenced in Build_Execution_Strategy.md runtime-unwireable as written" applies in adjacency: §M.4 / §M.5 are CI gates and §46 fails to author the test contract that would catch a runtime-binding regression. Confirmed P1.
- **D-46-013 (P1, AIWallet/OutcomeContract/CostBase).** Reproducible. Considered P0 by Rule (d) — the engine surfaces in question hold direct billing scope. Routing P1 because §46 silence is documentation absence, not active leakage. Confirmed.
- **D-46-014 (P2, §46.3 stability/canary).** P2 by rule. Confirmed.
- **D-46-015 (P2, chaos / outage testing).** P2 by rule. Confirmed.
- **D-46-016 (P2, schema-migration / downgrade).** P2 by rule. Confirmed.
- **D-46-017 (P2, entitlement enforcement).** P2 by rule. Could be P1 if a Solo user is incorrectly served a Growth capability (revenue leakage) — but §46 absence of test does not imply enforcement absence; the enforcement is at §34.8. P2 stands.
- **D-46-018 (P2, i18n/RTL/locale).** P2 by rule (resolvable). Confirmed.
- **D-46-019 (P2, fixtures/mocking/env/flaky).** P2 by rule. Confirmed.
- **D-46-020 (P2, security testing).** Could be P1 — absence of SAST/DAST has compliance and PII-exposure implications. Routing P2 because §45 already authors the privacy/security contract; §46 absence is a test-strategy gap, not a control gap. Confirmed P2.
- **D-46-021 (P3, "Phases 1-13" nomenclature).** Cosmetic. P3 confirmed.
- **D-46-022 (P3, Datadog 1% error-rate).** Cosmetic numerical-singleton hygiene. P3 confirmed.

No revisions made. Severity classifications hold under the rule-based framework.

---

## Counterfactual Pass

Three realistic failure modes per check, confirming §46 silence on each (defects already filed where addressed; no new defects authored within this audit prompt).

### Failure modes for the pyramid (Check 1)

1. **Coverage-target gaming.** Engineers achieve 80% line coverage by testing trivial getters/setters while critical-path code paths remain uncovered. §46 silent on coverage-quality safeguards (mutation testing, critical-path coverage gates).
2. **Convex test harness divergence from runtime.** A test using a Convex stub that does not reproduce real reactive-subscription semantics passes; production fails. §46 silent on integration-test-environment fidelity.
3. **E2E flake masking real regressions.** Playwright flakes get auto-retried; a real regression appears as flake and is dismissed. §46 silent on flake-vs-bug discrimination.

### Failure modes for AIOperation (Check 3)

1. **Anthropic snapshot deprecation mid-cycle.** A snapshot `claude-sonnet-4-6` is deprecated; production silently falls back to an older snapshot with degraded quality. §46 silent on snapshot-version pinning regression.
2. **Cost-base drift.** Anthropic raises per-token price by 5%; cost_base derivation per §34.3 / §34.14.1 should detect; no regression test confirms detection.
3. **Prompt-pack regression.** A KB Managed Agent skill prompt is edited; output quality drops; no eval suite catches.

### Failure modes for Console Firewall (Check 4)

1. **A junior engineer adds a list endpoint at §32 that omits the `console` filter** — a Buyer caller receives Seller rows. §46 silent on the negative test.
2. **A Cross-Console Bridge entity (§4.7) adds a new field without redaction declaration** — the field leaks across consoles in the next deploy. §46 silent on the bridge-field-coverage CI gate.
3. **A webhook event_kind is mistakenly delivered to the wrong-console subscriber.** §46 silent.

### Failure modes for DSAR / GDPR (Check 5)

1. **A new entity added to §4 is not added to the §6.8.1 export.** §46 silent on export-completeness CI gate.
2. **A cascade walker hangs on a `low_priority_background` capability suppressed under Solo throttling.** Per D-44-010 the §44.6 silence on the DSAR-cascade interaction; §46 silent on the integration test.
3. **An `eu` org's data is written to a `us` Convex region** — §1.6 lock breached. §46 silent on residency-lock CI gate.

### Failure modes for Performance Regression (Check 6)

1. **A Convex query introduces an N+1 pattern that breaches §44.1 row but no CI gate catches.** Per D-44-003.
2. **The §44.6.4 Solo throttling state misfires** — operator's active workflow is throttled by accident; revenue impact. §46 silent on the throttling-state test.
3. **Core Web Vitals degrade after a Next.js upgrade; no Lighthouse CI catches.** Per D-44-001.

### Failure modes for Accessibility (Check 7)

1. **A new component is added without ARIA labels; Axe is configured with a rule allowlist that misses the criterion.** §46 silent on Axe-rule-set freshness CI.
2. **A `prefers-reduced-motion` regression on a motion-heavy surface.** §46 silent.
3. **Annual third-party WCAG audit is skipped; §37.4 silent on enforcement.** §46 silent.

### Failure modes for Mobile (Check 8)

1. **A surface added at v7.1.0 (Defense View §13.11, Buyer Maya §13.12) is desktop-only by accident; §38.8 row not added; §46.2 doesn't test.**
2. **A breakpoint regression at the `mobile_sm` ↔ `tablet` boundary (768px).** §46 tests only 375px.
3. **Touch-target regression at 48px after a Tailwind utility-class refactor.** §46 inline-tests 48px but doesn't cite §37.1 or §38.5 — the assertion is positional, not contract-driven.

All failure modes are covered by the defect filings above (D-46-001 through D-46-022).

---

## Coverage Matrix Tightening (Phase 46 sub-pass)

§46 features in `FEATURE_INVENTORY.md`:

- **F-628 Test Pyramid** (§46.1) — `platform_mechanic`. Per D-46-001 and D-46-002:
  - `test_coverage`: was `✅` (seeded from anchor) → `⚠`. Pyramid declared but not per-service; methodology undefined; v7.x flows uncovered.
  - `acceptance_criteria`: `⚠` → `❌` (D-46-011 false-parity claim).
  - `observability`: `⚠` → `❌` (no test-failure escalation / artifact-retention spec, D-46-019).
- **F-629 Advanced Feature Test Cases** (§46.2) — `platform_mechanic`. Per D-46-002 / D-46-003 / D-46-017:
  - `test_coverage`: `✅` → `❌`. v7.x features uncovered; surface-vs-feature mismatch.
  - `accessibility`: `⚠` → `❌` (D-46-008 — Mobile a11y untested for §37.4 contract).
  - `mobile_parity`: `✅` → `⚠` (D-46-009 — only 1 of 5 §38.6 tiers tested).
  - `numerical_singleton`: `⚠` → `❌` (D-46-017 — inline restatements 0.3, 48px, 200ms, 500ms, 10,001).
- **F-630 QA Process & Canary Release** (§46.3) — `platform_mechanic`. Per D-46-007 / D-46-014 / D-46-015 / D-46-021 / D-46-022:
  - `acceptance_criteria`: `⚠` → `❌` (stability + rollback + sign-off undefined).
  - `performance_budget`: `✅` → `⚠` (cite §44.4 partial; §7.5.3 conflict per D-44-012 propagates).
  - `accessibility`: `✅` → `⚠` (Axe without §37 anchor; screen-reader / per-SC / Appendix M.1 conformance binding absent).
  - `observability`: `⚠` → `❌` (Datadog 1% inline unsourced; canary cohort + stability + escalation undefined).
- **F-631 Feature Flag System** (§46.4) — `engine_concept`. Per D-46-010:
  - `data_model`: `⚠` → `❌` (8-flag set v6.0.0-era; v7.x flags missing).
  - `plan_gating`: `✅` → `⚠` (Solo-wallet conflict; flag-vs-entitlement precedence ambiguous).
  - `entitlement`: `⚠` → `❌` (closing line untested; D-46-017 propagates).
  - `acceptance_criteria`: `⚠` → `❌` (per-flag ACs absent).

Aggregate counters NOT updated in this pass; aggregate ✅ / ⚠ / ❌ / n/a totals will be re-derived in the Phase V12 cross-check (Operations / QA / Observability / DR roll-up phase) or in the v7.1.1 mechanical apply, whichever lands first.

---

## Promoted to DEFECT_LEDGER.md

22 defects promoted (0 P0 · 12 P1 · 8 P2 · 2 P3): D-46-001 through D-46-022.
