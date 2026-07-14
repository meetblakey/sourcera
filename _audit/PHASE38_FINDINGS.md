# Phase 38 — §38 Responsive Design & Platform Support — Audit Scratch Log (2026-05-11)

## Sweep Scope

`Sourcera_Master_Spec.md` §38 (lines 31402–31938) walked end-to-end against the prompt's six named CHECKS plus the 14-point Master Spec authoring conventions checklist plus the audit-prompt edge-case discipline. Cross-referenced:

- §3.4 Mobile Translation of Linear Constraint (lines 2285–2306)
- §3 line 3433 (iOS/Android app-backgrounded Convex subscription pause)
- §29.3 push-notification user preferences (referenced from §3 line 3433)
- §38.6.2 per-tier layout-rules table; §38.6.3 UserUIPreference entity; §38.6.4 tier-transition edge cases; §38.6.5 conformance suite; §38.6.6 ACs; §38.7.x gesture contract; §38.8.x parity matrix
- §44 Performance Requirements & Solo-Tier Surface Treatment (cited from §38 only at §38.12 AC #4 for the PresenceAvatarStack reactive-query latency budget)
- §44.1 Performance Targets (FCP/TTI/p95/p99) — desktop-centric
- §50.14.3 Growth PM Dashboard (cross-reference target from §38.7.4 §38.8.5; mismatched intent)
- §50.14.4 GTM Lead Dashboard (cross-reference target from §38.8.2 Matrix Completeness Rule; mismatched intent)
- Appendix C Notification Event Catalog (no `ui_responsive_*` / `ui_mobile_*` rows present)
- Appendix G PostHog Event Taxonomy preamble + Standard / Advanced / Billing tables (no §38 events present)
- Appendix I API Error Code Catalog (no §38.7.5 codes present)
- Appendix J Controlled Vocabulary Registry (no §38 enums present)
- Appendix K Glossary (no §38 multi-section terms present)
- Appendix M.1 Master Surface/Engine Mapping Table (no §38 surfaces or engine concepts present)
- Appendix M.5 CI Gate Catalog (37 + V9 = 95 gates; no `responsive_conformance_suite` / `tap_count_probe` / `feature_parity_matrix_completeness` / `release_gate_assert` / `spec_matrix_lint` rows present)
- §6.8.4.3 DSAR Cascade Class Coverage Registry (V9 gate `dsar_cascade_class_coverage_completeness`); UserUIPreference registry gap remediated 2026-07-07; retention/idempotency residual remains
- §40.2 Retention Per Data Class (V9 gate `entity_retention_coverage_on_diff`); UserUIPreference unregistered
- §1.3 / §7.2 Buyer/Seller Console Firewall (UserUIPreference scope is "cross-console-shared")
- §3.10 Bulk Action Toolbar; §30 Command Palette; §3.7 keyboard shortcuts (referenced by §38.7 translation contract)

## Methodology

Walked the audit-prompt 14-point checklist against the §38 in-scope features per `_audit/FEATURE_INVENTORY.md`:

- F-573 Browser Support Matrix (§38.2)
- F-574 JavaScript Requirement (§38.3)
- F-575 Mobile Feature Parity Coarse Rules (§38.4)
- F-576 Authoritative Five-Tier Breakpoint Taxonomy (§38.6)
- F-577 UserUIPreference Entity (§38.6.3)
- F-578 Tier-Transition Edge-Case Contract (§38.6.4)
- F-579 Responsive Conformance Test Suite (§38.6.5)
- F-580 Keyboard-to-Gesture Translation Contract (§38.7)
- F-581 5-Tap Ceiling (§38.7.2)
- F-582 Tap-Count Probe Test Harness (§38.7.4)
- F-583 Mobile Feature Parity Matrix (§38.8)
- F-584 Cross-Tier Component Transition Contract (§38.8.1)
- F-585 Simplification Disclosure Contract (§38.8.3)
- F-586 Mobile Release Gate (§38.8.5)
- F-587 Print Stylesheet Behavior (§38.9)
- F-588 Reduced-Motion & Accessibility Tier Overrides (§38.10)
- F-589 RTL & Locale Mirror Behavior Contract (§38.11)
- F-590 Presence Avatar Stack Component (§38.12)

Plus the prompt's six named CHECKS:

1. **Breakpoints defined.** §38.1 (3-tier coarse) + §38.6.1 (5-tier authoritative) + §38.6.2 per-tier layout rules; §38.1↔§38.6.1↔§3.4 disagreement on tablet floor (D-38-007).
2. **Mobile Translation of Linear Constraint (§3.4) reflected.** §38.7 supersedes §3.4 (declared at §38.7 preamble); §3.4 retained as narrative recap; §38.7.1 translation table covers the §3.7 keyboard set but does not back-bind every §3.4 row (right-click context-menu absent; sidebar gesture inconsistent — see audit notes below).
3. **Per-surface mobile parity table.** §38.8.2 supplies the matrix; incomplete against v7.1.0 surfaces (D-38-010).
4. **Native app surface (if claimed) parity with web.** Not claimed by §38.2 / §38.4 (browsers only); but §3 line 3433 + §29.3 imply native iOS/Android app behavior (D-38-025).
5. **Touch-target sizes (min 44×44 px iOS / 48×48 px Android).** §38.6.2 satisfies with mobile = 48×48; tablet = 44×44; desktop = 32×32. But conflicts with §3.4 (44×44 mobile), §38.5 AC (≥ 48 mobile only), §37.1 (≥ 48×48 universal — see Phase 37 D-37-001) — D-38-008.
6. **Performance budgets on mobile (cite §44).** §38 has no mobile-specific performance budget block; §38 does not cite §44 except at §38.12 AC #4 for PresenceAvatarStack reactive-query latency. §44.1 is desktop-centric (FCP < 1s; TTI < 2s) with no mobile-cellular variant — D-38-009.

Severity rule per `_audit/DEFECT_LEDGER.md` Severity Definitions block (rule-based; first matching rule wins). Mobile-divergence and accessibility gaps held at P2 unless they affect WCAG AA conformance, leave a feature unbuildable, or break a CI gate referenced as merge-blocking.

Defect-ID convention: `D-38-NNN`, sequential within phase. Mnemonic-bound per `Audit_Prompts.md → Defect Ledger Format`.

## Findings Promoted to Defect Ledger

27 defects promoted: 0 P0 / 9 P1 / 14 P2 / 4 P3.

| defect_id | severity | class | one-line summary |
|---|---|---|---|
| D-38-001 | P1 | enum | 5 §38 enums declared "(Appendix J)" but not registered (`responsive_breakpoint_tier`, `mobile_gesture_kind`, `mobile_keyboard_shortcut_target`, `mobile_feature_parity_status`, `tap_count_probe_workflow_kind`). |
| D-38-002 | P1 | posthog_event | 5 §38 PostHog events declared "(Appendix G)" but not registered (`ui_responsive_breakpoint_crossed`, `ui_responsive_tier_component_reflowed`, `ui_mobile_workflow_tap_sequence`, `ui_mobile_tap_count_probe_exceeded`, `ui_command_palette_mobile_leak_detected`). |
| D-38-003 | P1 | error_code | 4 §38.7.5 error codes declared "registered in Appendix I" but absent (`gesture_out_of_safe_area`, `mobile_command_palette_hydration_forbidden`, `tap_count_probe_ceiling_breach`, `mobile_ops_console_write_attempted`). |
| D-38-004 | P1 | surface_engine_mapping | Zero Appendix M.1 rows for §38 surfaces or engine concepts (UserUIPreference, Side Peek tier-aware rendering, Bottom Nav, hamburger sidebar, mobile bottom-sheet palette, Agent FAB, Simplification Disclosure chip, mobile-unsupported informational page, Print stylesheet, RTL mirror, PresenceAvatarStack, breakpoint-tier engine). |
| D-38-005 | P1 | ci_gate | 5 §38 CI gates cited as merge-blocking but not registered in §M.5 catalog (`responsive_conformance_suite`, `tap_count_probe`, `feature_parity_matrix_completeness`, `release_gate_assert`, `spec_matrix_lint`). |
| D-38-006 | P1 | ci_gate | Broken cross-references: §38.7.4 cites the `responsive_tier_conformance` dashboard at §50.14.3 — but §50.14.3 is the Growth PM Dashboard (signup→activation funnel, TTFV, retention curves), not a responsive-conformance dashboard. §38.8.2 cites `feature_parity_matrix_completeness` job at §50.14.4 — but §50.14.4 is the GTM Lead Dashboard (free→paid funnel, deal velocity), not a CI job. Repeats in §38.7.6 AC #6 and §38.8.5. |
| D-38-007 | P2 | mobile_divergence | §38.1 says tablet = 640–1024 px (puts 640–768 in tablet); §38.6.1 says tablet = 768–1024 (puts 640–768 in `mobile_sm`); §3.4 declares mobile = "viewport < 768px." Even with the §38.6 reconciliation note ("§38.1 must be interpreted as a rounded narrative view"), §38.1's tablet-floor numeric is materially wrong. |
| D-38-008 | P1 | accessibility | Touch-target singleton drift: §38.6.2 (authoritative) sets mobile 48×48 / tablet 44×44 / desktop 32×32; §3.4 says 44×44 universal mobile; §38.5 AC says ≥48 on mobile (silent on tablet/desktop); §37.1 says ≥48×48 universal (Phase 37 D-37-001). Junior engineer would build inconsistently; WCAG 2.5.5 / 2.5.8 gate. |
| D-38-009 | P1 | performance_budget | §38 has no mobile-specific performance budget block; does not cite §44 except at §38.12 AC #4 for PresenceAvatarStack. §44.1 is desktop-centric with no mobile-cellular variant for FCP, TTI, LCP, INP, total bundle size, cold-cache load. |
| D-38-010 | P2 | acceptance_criteria | §38.8.2 Mobile Feature Parity Matrix incomplete vs v7.1.0 features. Missing rows for Defense View (§13.11), Buyer Maya intake (§13.12 EvalStarter), Seller Maya Polish (§22.20), Single-Operator Mode toggle (§2.8), Pipeline Surface Compression four-step bar (§3.14), Solo-Tier Surface Treatment (§44.6), AIWallet widget (§4.8.3), Wallet overage / Auto-topup, ContestRecord CTA (§4.8.5), FreeAllowanceCounter (§4.8.7), Pro Trial Seat Grant M17 absent for buyer-side row, Buyer Referral M16 (§4.3.16), DSAR self-service surface (§6.8). The §38.8 Matrix Completeness Rule + §38.8.6 AC #1 + the `feature_parity_matrix_completeness` CI gate are violated by the matrix itself. |
| D-38-011 | P2 | data_model | UserUIPreference (§38.6.3) field table omits `created_by` and `updated_by` per Master Spec authoring Convention #1 (every entity declares created_by/updated_by/deleted_at audit fields). Scope prose addresses cross-console / cross-org isolation but the entity table lacks any `console` field or audit-by columns. |
| D-38-012 | P2 | retention | UserUIPreference is not registered in §40.2 Retention Per Data Class. §38.6.3 says "Follows User lifecycle (§40.2 User row); no independent retention" but §40.2 has no UserUIPreference row; V9 CI gate `entity_retention_coverage_on_diff` requires every new §4 / entity-table row to have a §40.2 row. |
| D-38-013 | P2 | dsar | Original finding: UserUIPreference was not registered at §6.8.4.3 DSAR Cascade Class Coverage Registry. Current status as of 2026-07-07: registry coverage is remediated and `dsar_cascade_class_coverage_completeness` passes; the residual is per-row idempotency-marker coverage under `dsar_cascade_per_row_idempotency_marker_completeness`. |
| D-38-014 | P2 | state_machine | §38.6.4 tier transitions and §38.8.x mobile-parity status transitions (parity → simplified → not_supported) are prose-only. Authoring Convention #5 mandates `From | To | Trigger | Conditions | Notes` table form; prose state descriptions are not acceptable. No Appendix L.x row for `responsive_breakpoint_tier` transitions. |
| D-38-015 | P2 | plan_gating | §38 introduces tier-bound visibility (Ops Console mobile redirects, Solo plan tier hidden surfaces per §44.6, mobile Search Bar replaces Cmd+K) but does not extend §5.11 Feature Access Matrix and does not extend §34.1 Plan Tier Definitions. The "Hidden from tier(s)" Appendix M column also has no §38-specific row. |
| D-38-016 | P2 | observability | `ui_responsive_breakpoint_crossed` declared to fire on every tier transition (debounced 150ms). With no `sampling_rate` declared, a user dragging a window border can emit hundreds of events per minute — and the Appendix G preamble §51.2 mandates `sampling_rate ∈ {1.0, 0.1, 0.01}` non-null. `width_px` carried as integer in [320, 7680] is unbounded cardinality (preamble cardinality discipline applies). |
| D-38-017 | P2 | consistency_drift | §38.7.6 AC #11 + §38.7.3 row "`prefers-reduced-motion`" both author specific reduced-motion behavior; §38.10 pointer subsection states "No body section MAY author its own reduced-motion override; the §38.10 contract is universal." Two authoring contracts; engineering will resolve differently. |
| D-38-018 | P2 | mobile_divergence | §38 silent on (a) iOS notch / Dynamic Island safe-area-inset policy on the bottom nav; (b) iPad Stage Manager multitasking-introduced viewport thrash; (c) Samsung Z Flip half-folded posture (only "folded → mobile_xs / unfolded → tablet" named); (d) browser zoom that takes effective mobile_xs width below 320 CSS px (relevant to WCAG 1.4.10 — see Phase 37 D-37-007); (e) iOS Low Power / Reduced Data Mode impact on Convex viewport-aware fanout. |
| D-38-019 | P2 | retry_idempotency | UserUIPreference offline-queued tier updates have no idempotency contract. AC #5 says "Updated within 500ms of a tier transition; offline queues the update." If a user transits desktop → tablet → desktop in 300ms while offline, the queued writes can flush out-of-order and persist `tablet` when the live tier is `desktop`. No `last-write-wins-by-client-timestamp` rule, no `idempotency_key`. |
| D-38-020 | P1 | firewall_leakage | UserUIPreference scope is "User-scoped, cross-console-shared (a single User has one record regardless of active console)" — §38.6.3 Scope. §38.6.6 AC #9 requires "Tier-transition telemetry MUST NOT cross the Dual-Console Firewall (§7); events emit to the active console's PostHog project only." But the entity itself spans the firewall. Cross-console-shared state could leak the buyer-console session's UI state into the seller-console session for the same User (e.g., `last_observed_breakpoint_tier=desktop` reveals the user used the buyer console on desktop). §38.6.3 does not enumerate which fields cross the firewall safely (the JSON preference blobs are arguably safe; `last_observed_breakpoint_tier` is arguably not — it leaks the contralateral console's last activity). |
| D-38-021 | P2 | downgrade_path | §38 silent on what happens to UserUIPreference rows when a User is removed from one console (e.g., loses seller-side access). The cross-console-shared entity continues to carry per-tier preferences; whether the seller-console-derived `last_observed_breakpoint_tier` should be cleared, retained, or partitioned is unstated. |
| D-38-022 | P3 | heading_syntax | §38.6 anchor `{#38.6-breakpoints-authoritative-taxonomy}` truncates the title's "& Per-Breakpoint Layout Rules" half. Convention §11 prefers `{#n.n-title}` with the full title slug. Cosmetic; no engineering impact. |
| D-38-023 | P3 | glossary | Multi-section terms used across §3 / §22 / §38 are absent from Appendix K: "5-Tap Ceiling," "tap" (as defined in §38.7.2 with explicit not-counted rules — different from a generic UI tap), "tier transition," "Side Peek tier-aware rendering," "Simplification Disclosure," "bottom-sheet palette," "responsive conformance suite," "tap-count probe." Convention §4. |
| D-38-024 | P3 | documentation_gap | §38.6.1 Tailwind alias column maps `mobile_sm` → `sm:`. Tailwind's `sm:` prefix conventionally means "small breakpoint and up" (≥640) not "mobile small specifically." Engineer reading the table risks applying `sm:` where they mean "tablet+" (`md:`). Suggest a Notes column annotation. |
| D-38-025 | P2 | mobile_divergence | Native app surface contradiction. §38.2 / §38.4 enumerate browsers only (iOS Safari, Chrome Android, Samsung Internet); no native app claimed. But §3 line 3433 says "iOS/Android app-backgrounded state pauses the Convex subscription; on resume, a one-shot reconciliation call fetches current state. Push notifications for mentions are governed by §29.3 user preferences and by the user's OS-level notification grant" — implies native iOS/Android app with push grants. §29.3 echoes. §38 should explicitly declare "no native app surface in v7.1.x — web-only on iOS Safari, Chrome Android, Samsung Internet" and then either (a) mark §3 line 3433 as forward-looking / authored-extension, or (b) add native-app rows to the §38.8.2 parity matrix. |
| D-38-026 | P3 | ux_copy | §38.4 redirect-banner copy reads "[Feature] is best experienced on desktop. Continue on your computer or dismiss." §38.8.3 redirect-banner copy reads "[Feature] is best experienced on desktop. [Continue on Desktop] [Dismiss]." Same banner, two strings. Lint-relevant; pick one. |
| D-38-027 | P2 | consistency_drift | §38.4 prose limits "Mobile Limited Write Access" to "Comment on requirements (threaded comments); Submit boolean responses (Seller Console); View and acknowledge notifications." But §38.8.2 matrix supports many more mobile writes: Bid Response Qualitative Response (`supported`), Bid Response Pricing flat/one-time (`supported`), KB Entry Create (`supported`), Marketplace Discovery Run (`supported`), Buyer Referral Send (`supported`), Inbox bulk actions (`simplified`), and so on. §38.4 prose is stale relative to §38.8.2; junior engineer reading §38.4 alone would build a thinner mobile capability than §38.8.2 contracts. |

## Counterfactual Pass

For each in-scope feature, three realistic failure modes enumerated and confirmed against the spec:

**F-576 Authoritative Five-Tier Breakpoint Taxonomy.**
1. *Tier thrash from rapid resize.* §38.6.6 Failure Modes covers via 150ms debounce + 20px hysteresis. ✅ Handled.
2. *iOS Safari URL bar toggle fires resize without changing innerWidth.* §38.6.6 Failure Modes covers (key on innerWidth, not innerHeight). ✅ Handled.
3. *Foldable mid-fold settling event ordering.* §38.6.6 covers (settled event is authoritative). But Z Flip *half-folded* posture (cover screen) is unspecified. ❌ → D-38-018.

**F-577 UserUIPreference Entity.**
1. *Offline queued updates flush out-of-order on reconnect.* Spec silent on idempotency. ❌ → D-38-019.
2. *Cross-org user has two `UserUIPreference` rows.* Scope prose covers ("two distinct rows"). ✅ Handled.
3. *Cross-console firewall leakage via shared row.* Scope prose says "cross-console-shared"; §38.6.6 AC #9 says telemetry MUST NOT cross. Contradiction. ❌ → D-38-020.

**F-579 Responsive Conformance Test Suite.**
1. *Test runner false-positive from flaky selector.* §38.8.6 Failure Modes covers (3× retries with element-ready waits). ✅ Handled.
2. *CI gate not registered in §M.5; refactor removes it silently.* ❌ → D-38-005.
3. *Cross-reference target §50.14.3 is Growth PM dashboard, not conformance dashboard; engineers cannot find the dashboard implementation.* ❌ → D-38-006.

**F-580 Keyboard-to-Gesture Translation Contract.**
1. *iOS WebKit edge-swipe back-gesture hijacks peek-prev.* §38.7.3 + §38.7.6 Failure Modes cover (24px safe-area filter; iOS 16/17/18 regression suite). ✅ Handled.
2. *External Bluetooth keyboard paired mid-session on `mobile_sm`.* §38.7.6 Failure Modes covers (hotplug detection upgrades shortcut layer). ✅ Handled.
3. *AssistiveTouch / Voice Control user cannot long-press.* §38.7.6 AC #12 mandates non-gesture fallback ("⋯" overflow button on every swipe-action / long-press surface). ✅ Handled.

**F-581 5-Tap Ceiling.**
1. *Probe regresses post-launch via component refactor that escapes pre-merge gate.* §38.7.4 Runtime Companion covers via `ui_mobile_workflow_tap_sequence` p95 alert — but the event is not registered in Appendix G. ❌ → D-38-002.
2. *Production p95 alert fires from a legitimate UX event (e.g., new-user first-time complex flow).* §38.8.6 Failure Modes covers via `cohort_context` annotation. ✅ Handled.
3. *Destructive-exception workflow exceeds 6 taps because of inserted "are you sure?" interstitial.* §38.7.2 destructive-action exception caps at 6; §38.8.4 fixtures enumerate the three destructive workflows. ✅ Handled.

**F-583 Mobile Feature Parity Matrix.**
1. *New v7.1.0 feature merged without a matrix row.* §38.8.6 Failure Modes covers via `feature_parity_matrix_completeness` CI gate. But the gate cross-reference points at §50.14.4 (GTM Lead Dashboard, not a CI gate). ❌ → D-38-006. And the gate itself isn't in §M.5. ❌ → D-38-005. And §38.8.2 already violates its own completeness rule. ❌ → D-38-010.
2. *Row claims `parity` but component has hover-only tooltip that fails silently on mobile.* §38.8.6 Failure Modes covers via `responsive_conformance_suite` cross-validation. ✅ Handled (modulo D-38-005 / D-38-006).
3. *User reaches `not_supported` surface via deep link, sees blank page.* §38.8.6 Failure Modes covers via `mobile_unsupported_surface_test` E2E. But the test is not registered anywhere as a CI gate or release condition in §M.5. ❌ → D-38-005.

**F-587 Print Stylesheet Behavior.**
1. *Print resolution drops below A4 width and content overflows.* §38.9 says "forces every console surface to the desktop responsive tier." Behavior at print resolutions below desktop floor unspecified. (Out of scope for this audit; flagged for §44 follow-on.)
2. *`-webkit-print-color-adjust: exact` fails on Firefox.* Spec silent on cross-browser print fallback. (Captured implicitly by D-38-018; accepted.)
3. *Side peek inlined exposes content that would normally be access-gated when peek is closed.* §38.9 silent on access-gate compatibility. (Captured implicitly by D-38-014 — print as a state transition.)

**F-590 PresenceAvatarStack Component.**
1. *Mobile collision shrinks visible count to 2 but Convex Presence sends 8 active users; "+N more" rendering fails to update reactively.* §38.12 AC #4 covers reactive-query latency budget (cite §44.1). ✅ Handled.
2. *Avatar contrast drift in dark mode below WCAG 1.4.11.* §38.12 AC #3 covers via `ux_token_drift_check`. ✅ Handled (modulo Phase-37 contrast singleton drift D-37-001 / D-37-010).
3. *Live cursor opacity cap (60%) on tablet conflicts with high-contrast user setting.* §38.6.2 silent on tier × accessibility-tier override interaction; §38.10 silent on cursor-presence specifically. (Captured implicitly by D-38-017 reduced-motion conflict.)

## Self-Challenge Pass

Hostile-reviewer pass against each filed defect:

- **D-38-001 (P1, enum).** Could be argued P2 (enum registration is "register one Appendix J row per declared value"); held P1 because §38.6.6 AC #1 binds `responsive_breakpoint_tier` enum behavior to a CI gate (`responsive_conformance_suite`), and §38.7.1 / §38.8.2 ACs depend on enum values being in Appendix J for the cardinality-bounded PostHog dashboards. Junior engineer would either invent local enum values or skip Appendix J registration — either way, downstream dashboards drift.
- **D-38-002 (P1, posthog_event).** Could be argued P2 (PostHog accepts unregistered events); held P1 because the Appendix G preamble §51.2 mandates the validator rejects events lacking a matching Appendix J enum value (`UsageEventValidator` → `usage_event_envelope_violation` DLQ); five §38 events would emit and silently DLQ.
- **D-38-003 (P1, error_code).** Holds P1 — the four codes are literal HTTP status returns (HTTP 422 / 500 / 403) and a CI exit code (42); engineering returning a code that doesn't exist in Appendix I is a runtime error at the API gateway layer (Sourcera-Error-Subkind validator).
- **D-38-004 (P1, surface_engine_mapping).** Held P1 by rule — Appendix M.4 `appendix_m_coverage_on_diff` CI gate fails any diff that introduces an engine concept without a row. §38 introduced `responsive_breakpoint_tier`, UserUIPreference, etc., without rows.
- **D-38-005 (P1, ci_gate).** Held P1 by Severity Definitions rule (e) ("leaves a CI gate referenced in `Build_Execution_Strategy.md` runtime-unwireable as written"). Five gates named in §38.8.5 release-gate rule are not in §M.5.
- **D-38-006 (P1, ci_gate).** Considered P2 (cross-reference drift); held P1 because §38.8.5 release-gate rule directly cites the broken §50.14.3 / §50.14.4 references and an engineer wiring the release gate against §50.14.3 would build the wrong dashboard.
- **D-38-007 (P2, mobile_divergence).** Considered P1 (numerical-singleton drift); held P2 because §38.6 explicitly authorises §38.6 over §38.1 ("§38.1 must be interpreted as a rounded narrative view") — the contradiction is acknowledged by the spec, even if the §38.1 numeric value is wrong.
- **D-38-008 (P1, accessibility).** Considered P2; promoted to P1 to match Phase 37 D-37-001 (same root cause; same WCAG 2.5.5 / 2.5.8 risk; severity rule consistency across audit phases).
- **D-38-009 (P1, performance_budget).** Considered P2 (§44 covers desktop budgets and engineering can derive mobile from there); held P1 because the §38 release gate (§38.8.5) does not list any mobile performance budget condition, and §44.1 alone has no mobile-cellular variant for FCP/TTI/LCP/INP — engineering reading either §38 or §44 would not have a mobile budget contract.
- **D-38-010 (P2, acceptance_criteria).** Considered P1 (CI gate `feature_parity_matrix_completeness` would block merge of v7.1.0 features per the matrix's own rule); held P2 because the CI gate isn't actually wired (D-38-005 / D-38-006). The matrix-completeness gap is a real authoring debt but won't block production until the gate is wired.
- **D-38-011 (P2, data_model).** Held P2 — `created_by` / `updated_by` omission on a per-user preferences row is a Convention #1 violation but the entity is functional without them (no audit trail, but no data corruption risk).
- **D-38-012 (P2, retention).** Considered P1 (V9 gate `entity_retention_coverage_on_diff` is named at §M.5); held P2 because the V9 gate is in the spec catalog but the runtime wiring lands in M11.3 implementation pack per CLAUDE.md §16. Spec contract is binding; runtime not yet.
- **D-38-013 (P2, dsar).** Same reasoning as D-38-012; held P2.
- **D-38-014 (P2, state_machine).** Held P2 — Convention #5 violation on prose state descriptions, but §38.6.4 / §38.8.x prose is comprehensive; engineering can derive a state machine. The convention requires the table form for engineering accept; absent the table, QA cannot assert transition coverage.
- **D-38-015 (P2, plan_gating).** Held P2 — §38 does not extend §5.11 / §34.1 with new rows but the implicit behavior (Ops mobile redirect, Solo hidden surfaces) is plan-tier-driven. Engineering would derive entitlement from §44.6 (Solo surfaces) and §38 (mobile redirects) directly. The convention asks for a single matrix.
- **D-38-016 (P2, observability).** Considered P1 (Appendix G validator rejects events lacking `sampling_rate`); held P2 because the validator's "first 30 days warn-and-emit" window mitigates the immediate impact.
- **D-38-017 (P2, consistency_drift).** Held P2 — engineering would build per-§38.10 (universal contract) and miss the per-section §38.7.6 nuance. But the substantive behavior is consistent (suppress motion, preserve gesture recognition); the contradiction is in the meta-rule.
- **D-38-018 (P2, mobile_divergence).** Held P2 — five edge cases unaddressed but each is a soft ambiguity rather than a buildability blocker. iOS notch safe-area is the most concrete; if §38.6.2 mobile_xs / mobile_sm rows omitted `padding-bottom: env(safe-area-inset-bottom)`, the bottom nav would render under the home indicator on iPhone 14+. Could promote to P1 on second look; held P2 pending Phase-10 follow-on.
- **D-38-019 (P2, retry_idempotency).** Held P2 — out-of-order tier-update flush corrupts a per-user UI preference row; cosmetic impact, no data-integrity risk to other entities.
- **D-38-020 (P1, firewall_leakage).** Promoted from P2 to P1. Reasoning: Severity Definitions rule (a) — "breaks the buyer/seller console firewall." UserUIPreference is cross-console-shared; the `last_observed_breakpoint_tier` field reveals which console the user was last in. A buyer-side adversary who somehow gains read on a User's UserUIPreference (e.g., via a buyer-side debug endpoint that dumps the row) would observe the contralateral console's last activity. The §38.6.6 AC #9 partial mitigation (telemetry-only firewall) is insufficient — the entity itself is the leak vector.
- **D-38-021 (P2, downgrade_path).** Held P2 — undefined behavior on console removal; soft drift; preserves data but UI behavior is unspecified.
- **D-38-022 (P3, heading_syntax).** P3 by rule (cosmetic).
- **D-38-023 (P3, glossary).** P3 by Phase-2 glossary cleanup convention.
- **D-38-024 (P3, documentation_gap).** P3 by rule (Tailwind alias confusion is documentation, not engineering).
- **D-38-025 (P2, mobile_divergence).** Considered P1 (native app push surface contradicts browser-only stance); held P2 because §29.3 push-notifications path is plausibly a forward-reference for v8.x and §38 just hasn't added the "no native app in v7.1.x" disclaimer.
- **D-38-026 (P3, ux_copy).** P3 by rule.
- **D-38-027 (P2, consistency_drift).** Held P2 — §38.4 prose is stale; §38.8.2 matrix supersedes; engineering reading §38.4 alone would build the wrong capability surface.

## Severity Roll-Up

- **P0:** 0.
- **P1:** 9 (D-38-001 / 002 / 003 / 004 / 005 / 006 / 008 / 009 / 020).
- **P2:** 14 (D-38-007 / 010 / 011 / 012 / 013 / 014 / 015 / 016 / 017 / 018 / 019 / 021 / 025 / 027).
- **P3:** 4 (D-38-022 / 023 / 024 / 026).
- **Total: 27 defects.**

## Halt-Rule Evaluation

No P0 surfaced. Phase 38 does not halt the audit program. The 9 P1 defects route to a §38 spec-side remediation pass scheduled for the v7.1.1 backlog; they inherit Phase 10 (UX / Accessibility / i18n / Mobile / Performance) owner per `Audit_Prompts.md` cross-reference.

D-38-008 consolidates with Phase-37 D-37-001 (same touch-target singleton root cause; remediation should converge in one §38.6.2 / §37.1 / §3.4 / §38.5 single-source rewrite that cites §38.6.2 as authoritative).

D-38-006 needs paired remediation in §50.14.3 / §50.14.4 — the cross-reference resolution requires either renumbering (insert new dashboard sub-sections at §50.14.3a / §50.14.4a) or editing the §38 cross-references to point at a new §50.x sub-section that holds the responsive-conformance and feature-parity-completeness dashboards. Recommend the latter.

D-38-005 + D-38-006 together imply §M.5 must absorb 5 new rows (`responsive_conformance_suite`, `tap_count_probe`, `feature_parity_matrix_completeness`, `release_gate_assert`, `spec_matrix_lint`) and the §M.5 "runtime wiring lands in M{N}.{N} implementation pack" annotation should bind these to M21.3 (UI / mobile implementation pack) per `Build_Execution_Strategy.md` §11.

## Pre-edit Backup

Non-destructive audit pass; no Master Spec edits performed. Master Spec at v7.1.0 unchanged.

## Cross-References

- `_audit/DEFECT_LEDGER.md` Phase 38 block (this run's authored output).
- `_audit/COVERAGE_MATRIX.md` (F-573 / F-575 / F-576 / F-577 / F-578 / F-579 / F-580 / F-581 / F-582 / F-583 / F-584 / F-585 / F-586 / F-587 / F-588 / F-589 / F-590 cell tightening).
- `Sourcera_Master_Spec.md` §38 lines 31402–31938; §3.4 lines 2285–2306; §3 line 3433; §29.3; §44.1 lines 32701–32722; §50.14.3 lines 40302–40316; §50.14.4 lines 40318–40330; Appendix C; Appendix G lines 42891–43795; Appendix I lines 44000–44200; Appendix J lines 44893–47997; Appendix K lines 47998–48653; Appendix M.1 lines 48982–49500; Appendix M.5 lines 49500–49555.
- Phase 37 cross-link: D-38-008 ↔ D-37-001 (touch-target singleton); D-38-009 forward-references the v7.1.1 §44 mobile-budget remediation; D-38-014 forward-references Appendix L for the responsive-tier and parity-status state-machine additions.
- v7.1.1 stamp gate inherits the 9 P1 defects.
- Phase 10 (UX / Accessibility / i18n / Mobile / Performance) absorbs the remediation owner per `Audit_Prompts.md` Phase-10 owner mapping.
- AE Ledger forward references: the §38 remediation pass will open AE rows for (a) UserUIPreference field-table extension (created_by / updated_by / DSAR class), (b) Appendix M.1 row additions for §38 surfaces, (c) Appendix M.5 CI-gate additions for the five §38 gates, (d) Appendix J registration for the five §38 enums, (e) Appendix G registration for the five §38 PostHog events, (f) Appendix I registration for the four §38.7.5 error codes, (g) §38.8.2 matrix completeness rewrite covering Defense View / Buyer Maya / Seller Maya / Single-Operator Mode / Solo-Tier surfaces, (h) §38.10 vs §38.7.6 reduced-motion contradiction reconciliation.
