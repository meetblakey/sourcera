# Phase 37 — §37 Accessibility & Internationalization End-to-End Audit (2026-05-10)

## Scope

`Sourcera_Master_Spec.md` §37 (lines 31357–31398) walked end-to-end against the Audit_Prompts.md TASK / CHECKS / Master Spec authoring conventions, cross-referenced against:

- §3.6 (Form & Input Tokens) — line 2345 onward.
- §3.8 (Side Peek) — line 2751 onward; AC #11 cites focus-trap + axe-core gate.
- §3.9 (Cursor Presence) — line 2877 onward; §3.9.7 Accessibility line 2952; line 2958 cross-references "User Settings → Accessibility".
- §3.10 (Bulk Action Toolbar) — line 2997 onward; AC #8 cites toolbar a11y; ARIA-live announcement rate 500/1000/complete.
- §3.11 (Dark Mode Parity) — line 3144 onward; §3.11.3 Contrast Gate (≥4.5:1) line 3201; §3.11.8 High Contrast Mode line 3253 cites "Settings → Accessibility".
- §3.12 (Presence & Unread Tracking) — §3.12.9 Accessibility line 3443; line 3446 cites `settings.a11y.mention_assertive` preference field that has no entity definition.
- §30.6 (Keyboard Accessibility for the Command Palette) — line 25717.
- §36.1 (User Settings) — line 31303; table does NOT enumerate an "Accessibility" panel despite Appendix B / §3.9 / §3.11 forward-referencing one.
- §38.6 (Breakpoints) — §38.6.2 line 31479 enumerates per-tier touch-target minimums (32×32 desktop / 44×44 tablet / 48×48 mobile).
- §38.10 (Reduced-Motion & Accessibility Tier Overrides) — line 31919; pointer-only.
- §38.11 (Right-to-Left & Locale Mirror Behavior) — line 31923; authors `useDirectionality()` hook + `responsive_conformance_suite` RTL conformance.
- Appendix B (Keyboard Shortcut Reference) — line 42187; §B.10 Accessibility Notes line 42298; line 42302 cites "Settings → Accessibility (§37.4)".
- Appendix M.1 (Surface/Engine Mapping) — line 48982; no row binds an Accessibility Compliance Posture or Locale Resolution engine concept.

Features in scope: F-569 WCAG 2.1 AA Accessibility Contract (§37.1), F-570 Internationalization Architecture (§37.2), F-571 RTL Support (§37.3), F-572 Accessibility Testing Pipeline (§37.4), F-065 High Contrast Mode (§3.11.8 — referenced via §37.1 secondary anchor).

## Convention walk

| Check | §37 posture |
|---|---|
| 1 Entity definition | n/a — §37 is a posture / compliance section, not an entity section. But the implicit `UserAccessibilityPreference` field set (`settings.a11y.mention_assertive`, "Show teammate cursors" toggle, High Contrast opt-in) referenced by §3.6.4 / §3.9.7 / §3.11.8 / Appendix B has no entity definition, no defaults, no scope isolation declaration, no DSAR clause, no retention. ❌. |
| 2 Acceptance criteria | §37.5 has 5 unnumbered bullets; not testable (no Axe version pin, no severity threshold, no "all pages" enumeration, no override path). Violates §13.10/§14.9/§17.8/§20.7 style. ❌. |
| 3 Enum registration | §37 introduces no enums. n/a. |
| 4 Glossary | "WCAG 2.1 AA," "ARIA-Live," "Logical Properties," "BCP-47," "IANA timezone" appear across multiple sections (§3.6 / §3.9 / §3.11 / §37 / §38.11) but only `IANA timezone` resolves in Appendix K. ❌ partial. |
| 5 State machines | No state machine in §37. The locale-resolution chain (URL param → user pref → Org default → browser default) and the High-Contrast Mode activation chain (user override → `forced-colors: active` → default) are state-transition logic without a state-machine table. ⚠. |
| 6 APIs | §37 introduces no endpoints. The "remapping UI" Appendix B §B.10 implies a settings mutation API, never authored. ⚠ partial. |
| 7 Webhooks | n/a — no webhooks expected. But the "Annual third-party WCAG 2.1 AA audit" produces findings that have no notification path (Appendix C silent). ⚠. |
| 8 Plan gating | n/a — accessibility is universal, not plan-gated. But the spec is silent on the n/a declaration; Appendix M / §5.11 should record "universal" explicitly. ⚠. |
| 9 Retention / privacy | The implicit accessibility-preference fields have no retention declaration (§40.2 silent), no DSAR clause (§6.8 silent), no residency clause (§40.4 silent). ❌. |
| 10 Numerical singletons | §37.1 inlines 4.5:1, 3:1, 3px focus-indicator border, 48×48 touch target. §3.11.3 owns the contrast gate; §3.6.2 owns focus-ring tokens; §38.6.2 owns per-tier touch targets. Multiple homes; §37 should cite, not duplicate. ❌. |
| 11 Heading syntax | §37 headings conform (`## 37.N Title {#37.n-title}`). ✅. |
| 12 Surface/Engine mapping | No Appendix M.1 row for "Accessibility Compliance Posture" engine, no row for "Locale Resolution" engine, no row for "Axe CI gate" engine, no row for "Annual WCAG audit pipeline" engine, no row for "useDirectionality() RTL hook" engine. Appendix M.1 contract violated (every engine concept needs a row). ❌. |
| 13 Console firewall | n/a — accessibility is cross-console by definition. ✅ (implicitly). |
| 14 Edge cases | §37 enumerates none of the edge-case dimensions: third-party outage of Axe-core CI service, locale-fallback when browser locale unsupported, timezone collision between user pref and Workspace local tz, RTL collaborative-cursor re-flow, screen-reader announcement during optimistic mutation rollback (§3.5), focus loss on toast auto-dismiss, focus-trap escape on session expiry mid-modal, third-party iframe (Stripe / Firecrawl / Zendesk) a11y keyboard-trap detection, currency mismatch between display currency (Org default) and billing currency (AIWallet `billing_currency`). ❌. |

## Defect candidates → confirmed findings

Defect-ID convention: `D-37-NNN`, sequential within phase. P1 minimum on any defect that affects WCAG AA conformance per the prompt's "OUTPUT" directive.

**P1 (unbuildable as written / WCAG AA conformance gap):**

- **D-37-001 (P1, consistency_drift):** §37.1 Motor row asserts "Touch targets ≥ 48×48px" universally, but §38.6.2 line 31495 specifies per-tier minimums (32×32 desktop / 44×44 tablet / 48×48 mobile). §37.1 reads as a hard universal rule; §38.6.2 reads as a per-tier rule. Engineering will build different components depending on which section they consult first. WCAG 2.5.5 (AAA) is 44×44; WCAG 2.5.8 (AA, new in 2.2) is 24×24. §37 should cite §38.6.2, not redefine. Affects WCAG AA conformance by introducing inconsistent per-tier compliance posture.

- **D-37-002 (P1, consistency_drift):** §37.3 declares "v6.0: Deferred to Phase 2." but §38.11 (line 31923) authors RTL implementation via `useDirectionality()` hook with tier-by-tier conformance tests inside `responsive_conformance_suite`. The two sections directly contradict. Per CLAUDE.md §2 source-of-truth hierarchy, conflicts must be surfaced and resolved; §37.3 is stale and contradicts §38.11. Engineering reading §37.3 would not implement RTL; engineering reading §38.11 would. RTL is a WCAG 2.1 AA dimension (1.3.2 Meaningful Sequence) when used for Arabic, Hebrew, Persian, Urdu locales.

- **D-37-003 (P1, documentation_gap):** Multiple §-level cross-references to "User Settings → Accessibility" surface — §3.9.7 line 2958 ("Show teammate cursors"), §3.11.8 line 3265 (High Contrast opt-in), Appendix B line 42302 (assistive-tech-conflict remapping; cited as "§37.4"). §36.1 User Settings table (line 31303) does NOT include an Accessibility panel. The Appendix B cross-reference resolves to §37.4 which is "Testing," not Accessibility settings. The cited preference field `settings.a11y.mention_assertive` (§3.6.4 line 3446) has no entity definition, no field row in §4.2.3 User, no default, no scope-isolation declaration, no DSAR/retention coverage. Multiple cross-references dangle. Junior engineer cannot build the Accessibility settings surface as written.

- **D-37-004 (P1, acceptance_criteria):** §37.5 Acceptance Criteria is a 5-bullet list, not numbered, not testable. "Zero Axe violations on all pages" has no Axe version pin, no rule set, no severity threshold (critical/serious/moderate/minor), no "all pages" enumeration, no override path, no regression policy. Violates Master Spec authoring convention §13.10/§14.9/§17.8/§20.7. §3.11.10 (Dark Mode AC) demonstrates the correct numbered + measurable form — §37.5 should mirror that style. WCAG AA conformance gate is unbuildable as written.

- **D-37-005 (P1, surface_engine_mapping):** §37 authors no Appendix M.1 row for any of its engine concepts: Axe-core CI gate pipeline, annual third-party WCAG audit pipeline, `useDirectionality()` RTL hook (per §38.11), Locale Resolution engine (`next-intl`-backed), Accessibility Compliance Posture, Settings → Accessibility surface, High Contrast Mode renderer. §M.1 contract requires every engine concept and every surface to have an Appendix M.1 row; `appendix_m_coverage_on_diff` CI gate (§M.4) fails on missing rows. Engineering implementation packs (M02.3 / M11.3 / M21.3 / M24.3 per §M.5) have no §37 binding.

- **D-37-006 (P1, accessibility):** §37.4 names only NVDA and JAWS for screen-reader testing. macOS VoiceOver (which Appendix B line 42302 explicitly enumerates as an assistive-tech default-binding source alongside NVDA and JAWS) and iOS VoiceOver are omitted. Mac/iPad/iPhone enterprise users — Sourcera's buyer-side audience explicitly per §38.4 mobile-feature-parity — are uncovered by the test plan. WCAG AA conformance for these users is unverified. Direct conflict with Appendix B §B.10 AC #4 (the NVDA/VoiceOver/JAWS default-binding non-shadow CI test).

- **D-37-007 (P1, accessibility):** §37 is silent on WCAG 1.4.10 Reflow (no horizontal scrolling at 320 CSS px wide and 256 CSS px tall, equivalent to 400% zoom). §38.6.1 minimum viewport is 375 px (iPhone SE); the 320 px reflow standard is not authored. §38.6.4 line 31536 covers zoom > 200% reflow but stops at the `tablet` tier; the 400% zoom case on `desktop` and the 320 px case on `mobile_xs` are unspecified. WCAG 2.1 AA Success Criterion 1.4.10 is unverified.

- **D-37-008 (P1, accessibility):** §37 is silent on focus management contracts across modal (§3.4), Side Peek (§3.8), toast (§3.7), dropdown (§3.6), and Command Palette (§30.6). §3.8 AC #11 asserts focus-trap on Peek; §30.6 names focus return-to-previous on `Escape`; §3.6 covers form-input focus; toast focus management is unauthored anywhere; modal focus-trap is referenced in §3.4 prose but not specified. §37 should be the canonical aggregator of focus-management contracts with cross-references to per-component specs; instead, focus management is fragmented across five sections with no §37 anchor. WCAG 2.4.3 (Focus Order) and WCAG 2.4.11 (Focus Not Obscured, WCAG 2.2 AA-adjacent) compliance is unverified.

- **D-37-009 (P1, accessibility):** §37 silent on WCAG 2.4.1 Bypass Blocks (skip links). §37.1 mentions landmark regions (`<main>`, `<nav>`, `<aside>`) but does not require a skip-link rendering. Sourcera's three-column desktop layout (§38.6.2) has a 240px persistent sidebar; keyboard-only users would tab through every sidebar item on every page load without a skip-link.

**P2 (ambiguous in a way two engineers would resolve differently):**

- **D-37-010 (P2, accessibility):** §37.1 silent on WCAG 1.4.11 Non-text Contrast (3:1 for graphics and UI components). The section authors only text contrast (≥ 4.5:1 normal / ≥ 3:1 large) and the color-not-sole-means rule. The discrete UI-component-boundary 3:1 standard is authored at §3.11.3 line 3203 ("≥ 3:1 for UI component boundaries in BOTH modes") but §37 does not cite. Engineering reading §37 alone would build text-only contrast verification.

- **D-37-011 (P2, accessibility):** §37.1 Focus indicator rule (`≥ 3:1 contrast, ≥ 3px border`) conflicts with §3.6.2 Focus Ring spec (uses `--input-focus-ring-color` at 20% opacity in light / 30% in dark — not a 3px border) and §3.11.8 High Contrast Mode (focus ring widened to 4px). Three sources, three contracts. Authoring Convention §10 (numerical singletons) violated — focus-indicator dimensions have no single authoritative home. Engineering will build different focus indicators depending on which source they read first.

- **D-37-012 (P2, accessibility):** §37 is silent on WCAG 2.2.1 Timing Adjustable (session-timeout user warnings) and WCAG 2.2.2 Pause/Stop/Hide (5-second animation pause). §6 covers session lifecycle but does not specify a user-warning pattern with adjust/extend capability per WCAG 2.2.1. §38.10 covers `prefers-reduced-motion` but does not address the 5-second-animation pause/stop/hide control rule of WCAG 2.2.2. Conformance gap.

- **D-37-013 (P2, accessibility):** §37 silent on WCAG 1.3.5 Identify Input Purpose (`autocomplete` attribute on common input fields). §3.6 Form & Input Tokens specs labels, validation states, and counter behavior but does not require `autocomplete="email"`, `autocomplete="current-password"`, `autocomplete="organization"`, etc.

- **D-37-014 (P2, i18n):** §37.2 silent on locale-resolution chain (URL `?lang=` param vs `User.locale` field vs `Organization.default_locale` vs `Accept-Language` header vs browser default), language-of-page (`<html lang>` attribute per WCAG 3.1.1), language-of-parts (WCAG 3.1.2), pluralization rules (CLDR ICU MessageFormat), and number formatting beyond "thousands separator and decimal per locale" (negative-number rendering, percentages — relevant for §17 analytics dashboards, scientific notation, numeric input parsing).

- **D-37-015 (P2, accessibility):** Screen-reader announcement rate-limit rules scattered across the spec without an authoritative home: §3.6.4 line 2424 (form errors, 2s), §3.6.4 line 2430 (character counter, 3s), §3.9.7 line 2956 (cursor presence, 2s), §3.10 line 3124 (bulk actions, 500/1000/complete-interval), §3.12.7 line 3445 (unread badge, 3s), §3.12.7 line 3446 (mentions, configurable assertive). No §37-level rate-limit-rule contract. Risk: cross-component drift and screen-reader spam if a future feature authors its own debounce.

- **D-37-016 (P2, ci_gate):** §37 references no Appendix M.5 CI gate. §3.11 cites `dark_mode_illustration_contrast`, `no_hardcoded_hex`, `ux_token_drift_check`. §37.4 says "Automated accessibility audits (Axe DevTools) on every UI change (CI/CD gated)" but does not name the gate ID, does not name the runtime wiring, does not bind to §M.5. Same gap for the annual third-party audit pipeline.

- **D-37-017 (P2, i18n):** §37 silent on date / time formatting consistency. §15.x says "Workspace Owner local timezone"; §17 says "Monday morning at 9am"; §47.10 (per RECONCILIATION) says UTC for invoices; §35.x has digest formats; §50 has Ops Console formats. No authoritative §37 rule for which timezone displays when, how `Organization.timezone` interacts with `User.timezone`, or how `Workspace`-local-timezone resolves against `User.timezone`.

- **D-37-018 (P2, i18n):** §37.2 conflates display currency and billing currency. "Currency: Configurable per Organization (default USD)" — but billing-currency is per AIWallet (`billing_currency` enum: `usd`, `eur`, `gbp`, `cad`, `aud` per Appendix J) with FX locked via `fx_rate_locked`. Display currency rule for non-billing contexts (TCO projections per §15, Selection Report per §13, Analytics per §17) is not authored. Conflation will produce inconsistent rendering across §15/§17/§34.

- **D-37-019 (P2, ci_gate):** §37.5 says "Logical properties used throughout CSS (no hardcoded `left`/`right`)" but does not name the lint rule. §3.11.9 names `no_hardcoded_hex`; §37 should name `no_hardcoded_directional_css` or similar and bind to §M.5. Without a named rule, engineering cannot reason about override paths or merge-blocking semantics.

**P3 (cosmetic / spec hygiene):**

- **D-37-020 (P3, consistency_drift):** §37.2 leads with "v6.0 is English-only at launch." but the Master Spec is v7.1.0. Stale version label. Same issue with "Phase 2 Roadmap" naming — Sourcera execution phases are not numbered "Phase 2"; Build_Execution_Strategy uses milestone-style M-numbers. Replace with version-stamped guidance ("English-only through v7.1.x; multi-locale roadmap deferred to v8 per `Linear_Execution_Blueprint.md`").

- **D-37-021 (P3, consistency_drift):** §37.3 leads with "v6.0: Deferred to Phase 2." Stale version label (the conflict-with-§38.11 substance is captured in D-37-002).

- **D-37-022 (P3, documentation_gap):** §37.4 says "Annual third-party WCAG 2.1 AA audit (external firm)" without naming the firm-selection policy, the findings-disposition workflow, the SLA for remediation, or the notification path (Appendix C silent). At a minimum the cadence and remediation-SLA should be authored.

- **D-37-023 (P3, glossary_canonicality):** "BCP-47," "ARIA-Live," "Logical Properties," "WCAG 2.1 AA," "axe-core" appear across §3.6 / §3.9 / §3.11 / §37 / §38.11 but are not in Appendix K. Appendix K is the canonical Glossary per Phase 12.3 amendment; multi-section terms should resolve there.

## Counterfactual pass — three failure modes per in-scope feature

**F-569 WCAG 2.1 AA Accessibility Contract (§37.1):**
- *Partial failure:* Axe-core CI gate flakes intermittently during a deploy → §37 has no retry policy or override path → unbuildable. (Captured in D-37-004.)
- *Adversarial input:* High-contrast user's browser sends `forced-colors: active` while user has explicitly overridden to Dark Mode → §3.11.8 says forced-colors wins; §37 silent → unresolved conflict. (Captured implicitly in D-37-005 + D-37-011.)
- *Dependency outage:* axe-core npm registry unavailable on CI run → §37.4 silent on fallback (block merge? allow with warning?). (Captured in D-37-016.)

**F-570 i18n Architecture (§37.2):**
- *Partial failure:* `next-intl` translation file missing the locale the user selected → §37 silent on fallback chain. (Captured in D-37-014.)
- *Adversarial input:* User sets `User.locale = "en-US"` while `User.timezone = "Asia/Tokyo"` and views a Workspace where `Workspace.timezone = "Europe/Berlin"` — three timezones in play → §37 silent on resolution. (Captured in D-37-017.)
- *Dependency outage:* Browser sends `Accept-Language` for a locale Sourcera does not ship → §37 silent on fallback. (Captured in D-37-014.)

**F-571 RTL Support (§37.3):**
- *Partial failure:* RTL hook errors mid-render on a tier-transition (§38.6.4) → §37.3 silent; §38.11 silent on error recovery. (Captured in D-37-002.)
- *Adversarial input:* Mixed LTR + RTL content (Arabic + English) in a single Requirement title → bidirectional-text rendering rules not authored. (Captured in D-37-002 / D-37-014.)
- *Dependency outage:* Logical-property polyfill incompatibility on older WebKit → §37.5 AC #5 silent on browser compatibility matrix. (Captured in D-37-002.)

**F-572 Accessibility Testing Pipeline (§37.4):**
- *Partial failure:* Annual third-party audit returns findings 60 days late → remediation SLA missing. (Captured in D-37-022.)
- *Adversarial input:* NVDA default keybinding shadows a Sourcera `g h` sequence binding → Appendix B §B.10 AC #4 asserts the test but §37 silent on remediation. (Captured in D-37-003 + D-37-006.)
- *Dependency outage:* JAWS license expiry blocks the QA testing cadence → §37.4 silent on continuity. (Captured in D-37-006.)

**F-065 High Contrast Mode (§3.11.8 — secondary anchor to §37.1):**
- *Partial failure:* User opts in via "Settings → Accessibility" — surface does not exist. (Captured in D-37-003.)
- *Adversarial input:* User opts out via user-pref while `forced-colors: active` is set by OS → precedence not authored. (Captured in D-37-003 + D-37-011.)
- *Dependency outage:* Storybook regression suite for High Contrast unavailable on a CI run → §3.11.8 silent. (Adjacent to F-065 D-37-016.)

## Self-challenge pass (hostile-reviewer revision)

- **D-37-001 severity:** initially considered P2 (per-tier divergence is a discrepancy, not unbuildability). Promoted to P1 on hostile-reviewer rule: "junior engineer would build the wrong thing" — a desktop component built at 48×48px (per §37.1) would consume desktop layout density unnecessarily, and a mobile component built at 32×32px (per §38.6.2 row mistakenly read as authoritative across tiers) would fail WCAG 2.5.5. Either reading is plausible.
- **D-37-002 severity:** initially considered P2 (RTL is roadmap-deferred so the conflict is theoretical). Promoted to P1 because §38.11 authors actual implementation contract (`useDirectionality()` hook + CI conformance suite), not a deferral, and §37.3's "deferred" framing would be acted on by engineering as authoritative; CLAUDE.md §2 hierarchy makes this a P1 surface-of-source-of-truth conflict.
- **D-37-003 severity:** initially split into three separate defects (one per dangling reference). Consolidated to P1 because the root cause is identical (Settings → Accessibility surface unauthored) and the cited preference field has no entity backing. Three remediations, one defect.
- **D-37-004 severity:** numbered-and-testable ACs is a §13.10 convention violation. Held at P1 because every AC is unfalsifiable as currently written — junior QA could not write a passing test from "Zero Axe violations on all pages."
- **D-37-006 severity:** initially P2 (VoiceOver omission could be argued as oversight). Promoted to P1 because the audit-prompt directive is explicit: "accessibility gaps are P1 minimum if they affect WCAG AA conformance." VoiceOver users represent the entire macOS/iOS share of an enterprise SaaS audience — Sourcera's buyer-side ICP per `GTM/GTM_SALES_PLAYBOOK.md` is enterprise procurement leaders, a Mac-heavy audience.
- **D-37-007 severity:** initially P2 (reflow at 320 px is a corner case). Promoted to P1 because it's a named WCAG 2.1 AA Success Criterion (1.4.10) — by prompt directive, conformance gaps are P1 minimum.
- **D-37-008 severity:** initially P2 (focus management is implemented per-component). Promoted to P1 because the absence of a §37 aggregator means the toast focus-management contract is unauthored *anywhere*, and WCAG 2.4.3 Focus Order is uncovered.
- **D-37-009 severity:** WCAG 2.4.1 Bypass Blocks is a named AA Success Criterion. P1 per directive.
- **D-37-010 through D-37-019 severity:** all held at P2. None of these is by itself a WCAG AA blocker (the underlying conformance is achievable via the per-component specs); each is a §37-level aggregation / consistency gap that two engineers would resolve differently.
- **D-37-020 through D-37-023:** P3, cosmetic.

## Severity roll-up

- **P0:** 0.
- **P1:** 9 (D-37-001 / 002 / 003 / 004 / 005 / 006 / 007 / 008 / 009).
- **P2:** 10 (D-37-010 / 011 / 012 / 013 / 014 / 015 / 016 / 017 / 018 / 019).
- **P3:** 4 (D-37-020 / 021 / 022 / 023).
- **Total: 23 defects.**

## Halt-rule evaluation

No P0. Phase 37 does not halt the audit program. The 9 P1 defects route to a §37 spec-side remediation pass (v7.1.1 backlog) and inherit Phase 10's UX/a11y/i18n/mobile/performance scope per `Audit_Prompts.md` (line 3049 cross-reference).

## Pre-edit backup

Non-destructive audit pass; no Master Spec edits performed; no `legacy-import:_versions/` snapshot required.

## Cross-references

- `_audit/DEFECT_LEDGER.md` — 23 D-37-NNN rows appended.
- `_audit/COVERAGE_MATRIX.md` — F-569 / F-570 / F-571 / F-572 / F-065 cells tightened.
- `Sourcera_Master_Spec.md` §37 lines 31357–31398; §3.6 line 2345; §3.8 line 2751; §3.9 line 2877; §3.10 line 2997; §3.11 line 3144; §3.12 line 3297; §30.6 line 25717; §36.1 line 31303; §38.6 line 31463; §38.10 line 31919; §38.11 line 31923; Appendix B line 42187; Appendix K line 47998; Appendix M.1 line 48982.
- AE Ledger touch points: no new AE rows. The Phase 37 remediation will require AE rows for `UserAccessibilityPreference` entity (Settings → Accessibility surface + entity), Locale Resolution engine concept (Appendix M.1 row), Axe-core CI gate registration (§M.5 row), and the WCAG-2.1-AA-by-Success-Criterion enumeration in §37.1 — all to be opened in the v7.1.1 remediation pass.
- Forward references: v7.1.1 stamp gate inherits the 9 P1 defects. Phase 10 (UX / Accessibility / i18n / Mobile / Performance) absorbs the remediation owner.
