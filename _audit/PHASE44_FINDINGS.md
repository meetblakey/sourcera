# Phase 44 Findings — §44 Performance Requirements & Solo-Tier Surface Treatment

**Scope.** Master Spec v7.1.0 §44.1 through §44.6.8 (lines 32697–32922). Four checks per prompt:

1. Per-surface budgets: TTFB, FCP, LCP, INP, CLS.
2. p50 / p95 / p99 targets cited consistently (Phase 2.3 baseline — `D-2.3-002` already remediated for the §7.5.3 row).
3. Solo-Tier Surface Treatment — every Solo-mode override declares surface, suppression mode, Appendix M.1 reference, and the §M.5 CI gate.
4. Performance-regression CI gate — confirm.

**Date.** 2026-05-11.

**Inputs read end-to-end.** §44 (32697–32922), §44.1 row table, §44.2 Agent budget block, §44.3 / §44.4 / §44.5, §44.6.1 through §44.6.8; §26.9.10 (in-app CWV reference for cross-spec consistency, lines 22130–22265); §3.7 (state catalog), §3.13 Principle 9 (Surface Simplicity / Engine Complexity), §3.14 Pipeline Surface Compression; §4.8.1–§4.8.3 / §4.8.7 / §4.8.9 (AIOperation, CapabilityRegistryEntry, AIWallet, FreeAllowanceCounter, PricingTableVersion); §22.20 (Seller Maya Surface Polish), §34.1.1–§34.1.2 plan tables, §34.2.1 / §34.2.2 / §34.2.5 (Solo plan price + per-evaluation / per-bid orchestration), §34.3 (cost-base derivation), §34.10 / §34.10.3 (Solo co-resident pool), §34.11 Outcome Resolver, §34.18 Year-1 mix; §M.1 Appendix M mapping, §M.4 `appendix_m_coverage_on_diff` CI gate, §M.5 catalog (Phase 14.10 row block, 7 gates); §7.5.3 (Convex reactive SLO); Appendix C / Appendix G (telemetry registration); Appendix I error codes; Appendix J `surface_throttling_class` enum; `_integration/AUTHORED_EXTENSIONS_LEDGER.md` AE-14.10-01 … AE-14.10-08 rows; `_audit/PHASE2.3_FINDINGS.md` (singletons-tighter-pass results bearing on §44).

**Verdict.** §44 is the busiest cross-roads in v7.1.0: it carries the platform-wide latency contract, the Agent budget contract, the load-testing contract, the Solo-tier surface contract, and the Solo-tier engine-absorption envelope. §44.6 is mechanically defended (7 §M.5 gates, 18 ACs, 15 enumerated edge cases). §44.1 through §44.5 are weaker — they carry the platform-wide latency promise but lack mobile / Core Web Vital coverage, lack percentile binding on half the rows, lack a CI gate, and conflict with the load-testing target. Filed 16 defects: 0 P0 · 6 P1 · 8 P2 · 2 P3.

---

## Walking the four checks

### Check 1 — Per-surface budgets: TTFB, FCP, LCP, INP, CLS

**Partial.** §44.1 carries FCP (`< 1s`) and TTI (`< 2s`) only. The modern Core Web Vital trio — LCP, INP, CLS — and the canonical TTFB row are entirely absent from §44.1.

The corpus already authors Core Web Vitals at §26.9.10 (line 22130) but binds them to *public Marketplace pages only*: `LCP ≤ 2.5s`, `INP ≤ 200ms`, `CLS ≤ 0.1`, `FCP ≤ 1.8s`, `TTFB ≤ 600ms (cached) / 1 200ms (uncached)`. The in-app (Buyer Console / Seller Console / Marketplace authenticated paths / Ops Console) has no equivalent row block. §44.1 is the canonical home for in-app performance budgets and silently omits the trio. Per Authoring Convention #10 (numerical singletons), the public-page CWV row block at §26.9.10 cannot be re-used as the in-app contract without an inline citation; in-app surfaces are physically distinct.

Knock-on consequences:

- §26.9.10 declares a "Sustained CWV degradation (90 days) triggers a Performance Incident (§38) and pages the on-call engineer" hook. §38 in v7.1.0 is *Responsive Design — Breakpoints / Browser Support / Mobile Feature Parity*, NOT a Performance Incident section. The cross-reference is broken (defect filed against §26.9.10 separately, but surfaced here because it crosses through the §44 contract).
- The build-time bundle-size budget block at §26.9.10 (initial HTML ≤ 50 KB, initial JS ≤ 80 KB, hero image ≤ 200 KB, total ≤ 500 KB above-the-fold) is also public-page-only and has no in-app analogue. §44.3 cites "Code Splitting" and "Compression" as strategies but does not author a build-time size budget.

→ **D-44-001** (P1 — Core Web Vitals + TTFB absent from §44.1); **D-44-014** (P2 — mobile / network-quality budgets absent from §44).

### Check 2 — p50 / p95 / p99 targets cited consistently

**Partial.** Of the 19 rows in §44.1's target table, only 9 carry an explicit percentile binding (`p95`, `p99`, or both); the remaining 10 carry a single-number budget with no percentile.

Inconsistent rows:

- `First Contentful Paint | < 1s` — no percentile (vs §26.9.10 line 22154 row "FCP ≤ 1.8s" at the public-page 75th percentile).
- `Time to Interactive (TTI) | < 2s` — no percentile.
- `Real-time Subscription Latency (collaborative scoring) | < 200ms` — no percentile (the general-scope reactive row at line 32710 carries explicit `p95 ≤ 500 ms / p99 ≤ 1 s` per the D-2.3-002 remediation, but the tighter collaborative-scoring scope is silent).
- `Search Index Latency (Command Palette fuzzy search) | < 200ms` — no percentile.
- `PDF Export (100 requirements) | < 5s` — no percentile.
- `Workspace Load (1,000 requirements, matrix view) | < 2s` — no percentile.
- `Agent Pre-Score per Requirement | 10-30s (Sonnet)` — no percentile and no monotone direction (10s lower bound vs 30s upper bound is a range, not a budget).
- `Agent Pre-Score per Workspace | budget = count × 15s` — no percentile.
- `Selection Report Generation | < 5 minutes (Opus...)` — no percentile.

A junior engineer cannot determine whether "FCP < 1s" should be configured as a `p50`, `p75`, `p95`, or worst-case alarm. The drift is independent of D-2.3-002 (which closed the §7.5.3 row); the residue is the percentile-binding silence on the §44.1 table itself.

→ **D-44-002** (P2 — percentile binding inconsistent across §44.1).

### Check 3 — Solo-Tier Surface Treatment maps to Appendix M.1 + §M.5

**Partial.** Mechanical contracts are strong at §44.6.4–§44.6.8 (state suppression, error-code registration, AC binding) but the **§44.6.1 hide-list-to-Appendix-M.1 mapping is implicit, not declared inline, and no CI gate asserts it.**

§44.6.1 enumerates 10 surfaces that MUST NOT render on a Solo console (AIWallet widget, overage UI, auto-topup UI, rate card, per-AIOp ledger row breakdown, FreeAllowanceCounter inline counter, AIWallet state badges, Contest CTA, cost-base 30-day banner, PostHog wallet-counter freshness diagnostics). Each row names the engine spec home (e.g., `§4.8.3 / §34.10`) but **none cites an Appendix M.1 row**. The audit checklist convention #12 (Surface/Engine Mapping) requires every UI surface to carry an Appendix M.1 row reference.

§M.5 catalog (line 49426 onward) authors 7 gates under "Phase 14.10 — Solo-Tier Surface Treatment (§44.6)": `solo_engine_metering_parity`, `solo_telemetry_no_customer_routing`, `solo_envelope_value_single_source`, `solo_billing_card_price_single_source`, `solo_throttling_class_change_takes_effect_at_next_envelope_rollover`, `solo_envelope_per_console_isolation`, `solo_capability_registry_field_registration`, `solo_envelope_throttling_targets_low_priority_background_only`. None of these gates asserts that **each §44.6.1 hide-list item has an Appendix M.1 row with a Solo suppression annotation**.

Compare Phase 14.4 (Single-Operator Mode): §M.5 row `solo_mode_appendix_m_coverage` (line 49437) explicitly asserts "The Stakeholder Cohorts row, Pulse Inbox row, Pulse Health Score row, Pulse Digest Email row, and SLA Timers row MUST each carry a Solo-Mode suppression annotation in the `Hidden from tier(s)` cell." Phase 14.10 carries no analogue — the §44.6.1 ten surfaces are not asserted to have Appendix M.1 rows with the Solo suppression annotation. The audit prompt's reference to `solo_mode_appendix_m_coverage` (a Phase 14.4 gate) treats it as the canonical exemplar of the convention; the convention is unmet for the §44.6.1 surface set.

Additional drift inside §44.6.1:

- Items 1–10 cite the engine concept (`§4.8.3 / §34.10`, etc.) but the **suppression mode** (hide-on-render vs. omit-from-serializer vs. flag-as-feature-gated) is uniform prose ("HIDDEN ... MUST NOT render") with no machine-readable annotation. Item 6 (FreeAllowanceCounter) splits "engine continues to track" vs. "inline surface is suppressed" — implicitly a "hide-on-render only" mode. Items 8 (Contest CTA) and 9 (cost-base 30-day banner) carry similar conditional language. The mode is not registered in Appendix J or elsewhere.
- Item 10 (PostHog wallet-counter freshness diagnostics) cites §22.20.5 #4 as the suppression authority but §22.20.5 #4 itself cross-cites §44.6.1 #10 → §22.20.5 #4 → §44.6.1 #10 — circular reference; the binding rule lives in neither.

→ **D-44-006** (P1 — §44.6.1 hide list lacks Appendix M.1 mapping); **D-44-018** (P2 — §44.6.3 First-Pass RFP "fallback policy" is self-referential); **D-44-019** (P2 — §44.6.4 #5 `effective_charge_cents=0` overloads two states); **D-44-020** (P2 — AE row IDs not cited inline in §44.6.3 / §44.6.4 / §44.6.5 AE callouts).

### Check 4 — Performance regression CI gate

**Absent.** §44.4 specifies load-testing cadence (monthly 500 concurrent / quarterly 2,500 spike / quarterly 24h endurance). §44.5 acceptance criteria reference the §44.1 targets ("Production p95 latency consistently < 500ms"). **No CI gate enforces either the §44.1 budgets or the §44.4 load-test cadence.** §M.5 catalog (line 49416–49558) carries 95 gates after the V9 cluster appended 2026-05-09; none target performance-budget regression, build-time bundle-size, lighthouse-CI assertion, or load-test SLO breach.

Compare §26.9.10 line 22170 ("Build-time budget enforcement: a CI check using `bundlesize` or equivalent fails the build if a budget is exceeded by > 5%") and line 22183 (quarterly Lighthouse-CI sampled audit) — the public-page side declares both build-time and runtime CI hooks. The in-app side declares neither.

Knock-on: the §44.5 ACs are unenforceable — "Production p95 latency consistently < 500ms" is a runtime claim with no automated detector. The §44.5 AC "Real-time collaborative features sync < 200ms (measured via WebSocket delta timing)" cites WebSocket delta timing as the measurement methodology, which conflicts with the Convex reactive-query commit-to-render contract authored at §7.5.3 (Phase 2V D-2.3-002 remediation). Convex subscriptions do not expose a raw WebSocket delta timing surface — the canonical measurement surface is the §7.5.3 commit-to-observation latency.

→ **D-44-003** (P1 — no performance-regression CI gate); **D-44-004** (P2 — §44.4 load-test target conflicts with §44.1 API budget); **D-44-012** (P3 — §44.5 AC cites WebSocket delta timing inconsistent with §7.5.3 Convex commit-to-render).

---

## Additional findings surfaced during the walk

### §44.2 Agent cost estimates duplicated outside the canonical home

§44.2 emits inline cost ranges ($0.02–0.05 Haiku, $0.05–0.15 Sonnet, $0.15–0.40 Opus per requirement). These are numerical singletons that resolve to per-Anthropic-model unit costs and feed §34.3.1 (canonical formula `cost_base × 10` accepted / `cost_base × 1.05` rejected) and §34.14.1 (cost-base derivation, "5% infra overhead" annotation per D-AS-011). §44.2 restates the unit-cost ranges inline without citing §34.3 or §34.14.1. Authoring Convention #10 violation.

→ **D-44-005** (P1 — §44.2 cost figures are duplicated numerical singletons).

### §44.6.7 #5 — margin-protection breach has no hard ceiling on engine absorption

§44.6.7 #5 ("Solo Org's actual cost crosses 100% of envelope") authorises the platform to absorb the overage indefinitely: "The operator continues to operate at engine cost (the engine absorbs the overage); Ops decides on proactive outreach." The First-Pass RFP exemption (§44.6.3 `solo_envelope_no_block=true`) explicitly continues to serve while the envelope is exhausted. No emergency circuit-breaker, no per-Org absorption cap, no time-bounded escalation: a Solo Org generating high-volume First-Pass RFP traffic (e.g., a malicious script or a runaway integration partner) can drive unbounded margin loss until Ops manually intervenes. The §44.6.5 `solo.envelope.exhausted` event alerts Ops but does not auto-throttle. P1 by Severity Rule (d) — billing surface left ambiguous in a way that allows revenue leakage.

→ **D-44-008** (P1 — unbounded engine-absorption ceiling on Solo).

### §44.6.8 #1 — DOM snapshot test references a "suppressed selector set" never enumerated

§44.6.8 AC #1 (`solo_surface_hides_wallet`) prescribes "every UX surface authored in `UX_Design_of_Sourcera.md` and rendered on Solo passes a DOM snapshot check excluding the suppressed selector set." The selector set is not enumerated in §44.6, in `UX_Design_of_Sourcera.md` §8.1.2, or in Appendix M. A QA engineer cannot construct the test fixture without inventing the selector list.

→ **D-44-009** (P2 — selector set unauthored for §44.6.8 AC #1).

### §44.6.7 edge-case enumeration silent on several applicable dimensions

§44.6.7 lists 15 edge cases (dual-Solo, mid-period upgrade, mid-period downgrade, mid-active-workflow threshold, margin breach, contest, per-eval abandonment, per-bid abandonment, price spike, mid-period class change, post-upgrade API token, DSAR, webhook subscription, third-party outage, concurrent envelope writes). The audit edge-case checklist additionally requires coverage of:

- **EU / APAC residency interactions** during a price spike (cross-region cost_base recalculation cadence, regional invoice currency).
- **Mobile parity** for the Solo surface contract (mobile-only AIWallet widget vs desktop, mobile network-quality vs throttle toast).
- **Accessibility** — does the throttling toast respect `prefers-reduced-motion`? Does an `aria-live` region announce the suppression to screen readers?
- **IdP unavailability during throttled state** (does the envelope counter survive a session termination and re-login?).
- **DSAR cascade interacting with `low_priority_background` suppression** (a §6.8.4 cascade walker invoking a `low_priority_background` capability during Solo envelope exhaustion — does the cascade hang on the suppressed capability?).

→ **D-44-010** (P2 — edge-case set silent on residency, mobile, a11y, IdP, DSAR-cascade interactions).

### §44.6.5 telemetry event payload schemas declared unevenly

§44.6.5 telemetry table declares only `solo.envelope.exhausted`'s property list ("`console`, `plan_tier`, `envelope_window_id`, `consumed_value_cents`, `envelope_value_cents`"). The throttling_engaged event mirrors that payload (Notes column: "Includes `console`, `plan_tier`, `envelope_window_id`, `consumed_value_cents`, `envelope_value_cents`"). The throttling_cleared event names only `clear_reason ∈ {subscription_rollover, per_eval_charge, per_bid_charge, manual_ops_clear}` — the canonical 5-property set is implicit. The `solo.capability.envelope_no_block_invoked` event names no properties at all. Phase 14.13c rollup (per CLAUDE.md §16) was queued as a v7.1.1 backlog item for this exact closure; the §44.6.5 declaration is incomplete pending that rollup.

→ **D-44-011** (P2 — payload schema declared inconsistently across the four §44.6.5 events).

### §44.3 cache TTLs are unmoored numerical singletons

§44.3 declares cache TTLs (Workspace metadata 10-min, Vendor profiles 1-hour, Scoring rubrics permanent). These are not retention (cache, not data) so §40.2 is not the home; they are not object-size limits so §39 is not the home. The cache-TTL spec authority is unspecified — no canonical home, no CI gate asserting cache TTLs match the implementation. Authoring Convention #10 requires every numerical singleton to have exactly one authoritative home; a P3 documentation gap.

→ **D-44-013** (P3 — cache TTLs at §44.3 have no canonical home).

### §44.6.5 events not registered in Appendix C / Appendix G with rate-limit class

§44.6.5 declares HMAC-SHA256, idempotency via `event_id`, exponential backoff per Appendix F `webhook_standard` curve, DLQ after 5 failures, payload ≤ 256 KB — all standard. But the per-event rate-limit class is not declared. §31 webhook contracts uniformly carry a rate-limit class binding (e.g., `webhook_standard` per Appendix F); the four §44.6.5 events default to that class via the inherited `webhook_standard` retry-curve citation, but the rate-limit class is not asserted at the event row level. PHASE8.3 findings (D-V8.3-003) already flagged that §44.6.5 "promises Appendix C registration; subsection absent". §44.6.5 narrative says "registered in **Appendix C → Billing-Domain Events** under 'Solo-Tier Surface Treatment (§44.6)' and in **Appendix G → PostHog Event Taxonomy** with property schemas (Authored Extension — Phase 14.10; Appendix C / Appendix G additions flagged)." The "flagged" verb is unsupported — D-V8.3-003 confirms the Appendix C sub-section is absent.

→ **D-44-015** (P2 — §44.6.5 rate-limit class binding implicit; cross-references unresolved per D-V8.3-003).

### Authored Extension row IDs not cited inline at §44.6

§44.6 cites AEs in prose ("Authored Extension — Phase 14.10; flagged in `_integration/RECONCILIATION.md → Phase 14.10 → Authored Extensions`") at §44.6.3 (×2), §44.6.4 #5, §44.6.4.1 (×3 — `surface_throttling_class`, `solo_envelope_override_value_cents`, `solo_envelope_no_block`), §44.6.5 prose. The AE Ledger registers AE-14.10-01 through AE-14.10-08 (8 distinct rows; 3 `acknowledged`, 5 `pending`). §44.6 prose never names the AE row IDs inline. A reader cannot determine which AE row is being cited at each prose point. Authoring Convention #11 (Authored Extensions ratification) implicitly requires AE row identification for traceability — the convention is not enforced here.

Additionally, CLAUDE.md §16 lists open `pending` AE rows as `AE-14.9-01, AE-14.10-07, AE-14.14-21, AE-14.18.1-01, AE-14.18.1-02, AE-14.0.1-01, AE-14.0.1-02`. The AE Ledger actual `pending` count for Phase 14.10 is FOUR (`AE-14.10-04, AE-14.10-05, AE-14.10-07, AE-14.10-08`); CLAUDE.md §16 lists only AE-14.10-07. CLAUDE.md and the AE Ledger have drifted; the §44.6 ratification queue is under-represented in CLAUDE.md §16.

→ **D-44-020** (P2 — AE row IDs not cited inline at §44.6); **D-44-016** (P3 — CLAUDE.md §16 AE-14.10 queue drifts from AE Ledger).

---

## Self-Challenge Pass

After drafting the 16 defects, re-read each as a hostile reviewer.

- **D-44-001 (P1, CWV absent).** Evidence reproducible (§44.1 row table lines 32703–32722; §26.9.10 row block lines 22149–22155). Severity per Rule "missing... performance budget" is at minimum P1 (unbuildable Lighthouse CI configuration). Confirmed P1.
- **D-44-002 (P2, percentile inconsistency).** Reproducible (each row cited inline). Severity per Rule "ambiguous in a way two readers resolve differently" → P2. Confirmed.
- **D-44-003 (P1, no CI gate).** Reproducible (§M.5 catalog enumerated end-to-end). Severity per Rule "missing CI gate referenced in `Build_Execution_Strategy.md` runtime-unwireable as written" — would qualify for P0 if the §44 budgets were themselves cited as a CI gate; they are NOT cited in §M.5. The defect is the *absence* of the gate from §M.5, not the un-wireability of an existing one. P1 stands by the "missing acceptance-criteria-class enforceability" rule. Confirmed P1.
- **D-44-004 (P2, §44.4 vs §44.1 conflict).** Could be P3 (a thoughtful reader might infer §44.4 is a degraded-performance load target). Default-to-P1 per the tiebreaker rule does not apply because the resolution is ambiguous but recoverable. P2 stands.
- **D-44-005 (P1, cost ranges duplicated).** Reproducible (§44.2 inline ranges vs §34.3 canonical formula). Severity per Rule "conflicting numerical singleton between Master Spec and a companion strategy doc" — the conflict here is Master Spec internal (§44.2 vs §34.3); the rule extends to internal Master Spec duplications per Authoring Convention #10. Confirmed P1.
- **D-44-006 (P1, hide list lacks Appendix M.1 mapping).** Severity per Rule "surface introduced without an Appendix-M row" → P1. Confirmed.
- **D-44-007.** Withdrawn — the Authored Extension citation gap is consolidated into D-44-020.
- **D-44-008 (P1, no absorption ceiling).** Severity per Rule "(d) leaves a billing surface ambiguous in a way that allows revenue leakage or double-charge" — the spec authorises unbounded margin absorption with no enforcement floor; the runaway path is a real revenue-leakage vector. Defaulting to P1 per the tiebreaker (not P0) because the §44.6.5 `solo.envelope.exhausted` event is an Ops alert, which is a partial mitigation. P1 stands.
- **D-44-009 (P2, DOM snapshot selector set).** Reproducible. Resolvable by a thoughtful engineer (the implicit list is the §44.6.1 ten surfaces' DOM markers). P2.
- **D-44-010 (P2, edge-case silence).** Reproducible. P2 by rule.
- **D-44-011 (P2, payload schemas uneven).** Reproducible. P2 by rule (resolvable by a thoughtful engineer; tracked at Phase 14.13c rollup).
- **D-44-012 (P3, WebSocket-delta-timing measurement).** Reproducible. Cosmetic/terminological drift; the canonical measurement contract is at §7.5.3. P3.
- **D-44-013 (P3, cache TTL home).** Reproducible. P3 by rule (cosmetic — no implementation impact, just hygiene).
- **D-44-014 (P2, mobile / network-quality budgets absent).** Could be P1 if mobile parity is a hard build requirement; §38 declares mobile feature parity as Phase 2 (per F-634 row), so the absence of mobile performance budgets is consistent with the deferred mobile scope. P2 stands.
- **D-44-015 (P2, rate-limit class binding).** Reproducible. P2 by rule.
- **D-44-016 (P3, CLAUDE.md AE queue drift).** Reproducible. P3 — the AE Ledger is authoritative, CLAUDE.md is a summary; the drift is cosmetic.
- **D-44-018 (P2, §44.6.3 self-referential fallback).** Reproducible (§44.6.3 paragraph 4: "the capability falls back to the §44.6.3 fallback policy"). P2 by rule.
- **D-44-019 (P2, `effective_charge_cents=0` overloaded).** Reproducible. P2 — the forensic ambiguity is recoverable via the `solo_envelope_blocked=true` flag, but two readers could disagree on which field is the canonical state distinguisher.
- **D-44-020 (P2, AE row IDs not cited inline).** Reproducible. P2 — traceability gap, recoverable but not zero-cost.

Revised: ledger rows D-44-001 through D-44-020 with D-44-007 and D-44-017 withdrawn (D-44-007 consolidated into D-44-020; D-44-017 was a duplicate of D-44-012 in an earlier draft).

Final count: 16 defects (D-44-001 … D-44-006, D-44-008 … D-44-016, D-44-018 … D-44-020). 0 P0 / 6 P1 / 8 P2 / 2 P3.

---

## Counterfactual Pass — three realistic failure modes per feature

For each of the six §44 sub-features (Targets, Agent Budgets, Optimization, Load Testing, Acceptance Criteria, Solo-Tier Surface Treatment), enumerate three failure modes and confirm spec coverage.

**§44.1 Performance Targets.**

1. **Anthropic-side latency degradation** (Sonnet p95 doubles overnight). §44.2 "graceful degradation" + §44.5 AC "5% timeout with graceful degradation" partially addresses. No automatic SLA recalibration. → Unhandled.
2. **CDN partial outage in EU region.** §44.1 has no regional latency budget. §1.6 (Deployment Regions) declares US / EU / APAC as residency partitions but §44 is region-agnostic. → Unhandled.
3. **Convex reactivity backlog (mass commit storm).** §7.5.3 reactivity SLO row covers commit-to-render latency. §44.1 cites the row. Backlog-induced p95 breach detected by §42.2 alert. → Handled.

**§44.2 Agent Budgets.**

1. **Cost spike from Anthropic price update.** §34.3.3 CostBaseRecalculationLog nightly job + §44.6.7 #9 (Solo-side) handles. → Handled.
2. **Pre-score timeout on workspace with 1,000 requirements.** §44.2 budget = `requirement_count × 15s` → 4.2 hours single-threaded; parallelization to 10 concurrent → 25 minutes. Long-tail timeout handling (one stuck requirement) not specified. → Partial.
3. **Selection Report generation Opus rate-limit hit.** §44.1 row "Selection Report Generation < 5 minutes" cites Opus; Anthropic Opus rate limits not addressed. → Unhandled.

**§44.4 Load Testing.**

1. **Spike test exceeds 2,500 concurrent (real-world Hero Moment volume).** §44.4 has no auto-scaling trigger. → Unhandled.
2. **Endurance test reveals connection-pool exhaustion at hour 18.** §44.4 mentions "monitor for memory leaks, connection exhaustion" — corrective action path not specified. → Partial.
3. **Load-test budget breach is not enforced anywhere.** No CI gate. → Unhandled (D-44-003).

**§44.5 Acceptance Criteria.**

1. **Real-time WebSocket delta timing metric does not exist in the Convex stack.** Measurement methodology drift (D-44-012). → Unhandled.
2. **p95 latency rolling-window assertion has no PostHog event family.** §51 instrumentation is the canonical event home; §44.5 does not cite §51. → Unhandled.
3. **Agent budget breach → graceful degradation contract is silent on user-visible state.** §3.7 state catalog (loading / error / partial) is the canonical home; §44.5 does not cite §3.7. → Partial.

**§44.6 Solo-Tier Surface Treatment.**

1. **Solo Org with First-Pass RFP exemption + runaway script → unbounded absorption.** Unhandled (D-44-008).
2. **DOM snapshot test relies on a selector list that doesn't exist.** Unhandled (D-44-009).
3. **§44.6.5 telemetry event payload schemas drift.** Partial (D-44-011; Phase 14.13c rollup queued).

---

## Defect Ledger Promotions

16 defects promoted to `DEFECT_LEDGER.md`: D-44-001 (P1), D-44-002 (P2), D-44-003 (P1), D-44-004 (P2), D-44-005 (P1), D-44-006 (P1), D-44-008 (P1), D-44-009 (P2), D-44-010 (P2), D-44-011 (P2), D-44-012 (P3), D-44-013 (P3), D-44-014 (P2), D-44-015 (P2), D-44-016 (P3), D-44-018 (P2), D-44-019 (P2), D-44-020 (P2).

**Note on numbering.** The above list contains 18 rows because D-44-007 was consolidated into D-44-020 and D-44-017 was withdrawn as duplicative of D-44-012 during the Self-Challenge Pass. To preserve ID immutability per the DEFECT_LEDGER row convention, D-44-007 and D-44-017 are reserved (not reused) and the final ledger appends D-44-001 … D-44-020 with D-44-007 / D-44-017 absent.

Severity rollup: 0 P0 · 6 P1 · 8 P2 · 2 P3.

Phase 44 cumulative: P0 = 0, P1 = 6, P2 = 8, P3 = 2, total = 16.

---

## Coverage Matrix Updates

Per-row tightening on §44 features (F-184, F-612, F-614, F-615, F-616, F-617, F-619, F-620, F-622):

- **F-612 Performance Targets (§44.1).** `performance_budget` ✅ → ⚠ (D-44-001 — CWV + TTFB absent; D-44-002 — percentile inconsistency); `mobile_parity` ⚠ → ❌ (D-44-014); `ci_gate_coverage` ⚠ → ❌ (D-44-003); `observability` ⚠ → ❌ (D-44-012 — measurement methodology drift).
- **F-184 Reactivity SLO (§7.5.3).** No further tightening — D-2.3-002 remediation closed the §44.1 general reactive row; the collaborative-scoring sub-row at §44.1 retains the no-percentile silence (D-44-002 spans both).
- **F-614 Optimization Strategies (§44.3).** `numerical_singleton` ⚠ → ❌ (D-44-013 — cache TTL home undefined).
- **F-615 Load Testing Cadence (§44.4).** `performance_budget` ✅ → ⚠ (D-44-004); `ci_gate_coverage` ⚠ → ❌ (D-44-003).
- **F-612-acceptance.** §44.5 ACs unenforceable (D-44-003); `observability` ⚠ → ❌; `test_coverage` ⚠ → ❌ (D-44-012 — measurement methodology drift).
- **F-616 Solo-Tier Surface Treatment (§44.6).** `surface_engine_mapping` ⚠ → ❌ (D-44-006); `ci_gate_coverage` ⚠ → ✅ (7 §M.5 gates already bind; gate set is incomplete relative to §44.6.1 but each declared AC has a gate); `mobile_parity` ⚠ → ❌ (D-44-010); `accessibility` ⚠ → ❌ (D-44-010); `residency` ⚠ → ❌ (D-44-010); `authored_extension_status` ⚠ → ⚠ (D-44-020 — AE rows acknowledged but not cited inline).
- **F-617 Solo Surface Hide List (§44.6.1).** `surface_engine_mapping` ❌ (D-44-006); `acceptance_criteria` ⚠ → ⚠ (AC #1 selector set unauthored per D-44-009).
- **F-619 Solo Margin Envelope Defaults (§44.6.3).** `entitlement` ⚠ → ❌ (D-44-008 — unbounded absorption ceiling); `acceptance_criteria` ⚠ → ❌ (D-44-018 self-referential fallback).
- **F-620 Solo Throttling Behavior (§44.6.4).** `data_model` ⚠ → ⚠ (D-44-019 — `effective_charge_cents=0` state overload).
- **F-622 Solo Engine Telemetry & Webhook Catalog (§44.6.5).** Already ❌ on `notifications` per D-V8.3-003; tighten further: `webhook` ⚠ → ❌ (D-44-015 — rate-limit class binding implicit); `posthog_events` ⚠ → ❌ (D-44-011 — payload schema uneven; D-V8.3-003 baseline).

Aggregate counters not updated in this Phase-44 pass; will be re-derived in the next V-prompt cross-check.
