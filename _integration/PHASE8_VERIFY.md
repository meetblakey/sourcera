# Phase 8 Verification — UX System (§3.6–§3.11, §38.6–§38.8)

**Phase:** 8 of 13
**Scope:** UX tokens, page-state catalog, Side Peek, Cursor Presence, Bulk Action Toolbar, Dark Mode parity, Breakpoints, Gesture Equivalents, Mobile Feature Parity Matrix.
**Spec under review:** `/Sourcera/Sourcera_Master_Spec.md` (v6.0.0 + Phase 8 integrations).
**Verifier:** Opus — senior technical product strategist / staff engineer for Sourcera.
**Date:** 2026-04-24.
**Verdict (headline):** **PASS** on all four Phase 8 exit gates. Section, token, breakpoint, gesture, parity-matrix, contrast-rule, and 5-tap-ceiling requirements are present, concrete, and cross-consistent. Supplemental observations and residual follow-ups are logged at the end; none block Phase 8 exit.

---

## 1. Exit-Gate Checklist

The Phase 8 prompt specifies four mandatory checks. Each is evaluated below against the current Spec text, with file-line citations and a quoted excerpt where the claim is load-bearing.

| # | Gate | Status | Evidence |
| :---- | :---- | :---- | :---- |
| 1 | §3.6–§3.11 present with concrete tokens/values | **PASS** | §3.6 (L1771), §3.7 (L1907), §3.8 (L2123), §3.9 (L2249), §3.10 (L2369), §3.11 (L2516). Tokenized values, enum bindings, acceptance criteria, and observability events present in each. |
| 2 | §38.6–§38.8 present with breakpoints, gestures, parity matrix | **PASS** | §38.6 (L25556) five-tier breakpoint taxonomy with pixel boundaries + Tailwind aliases; §38.7 (L25666) keyboard-to-gesture translation table + 5-tap-ceiling normative definition + tap-count probe harness; §38.8 (L25777) four-status parity matrix + top-20 workflow catalog + release-gate rule. |
| 3 | Dark-mode contrast ratio rule (≥ 4.5:1) stated explicitly | **PASS** | Asserted in §3.11.2 (L2537), reified as a named gate in §3.11.3 (L2573–L2583), and encoded as Acceptance Criterion 2 in §3.11.10 (L2655). Also enforced at the token-pair CI level in §50.17.4 / `ux_token_contrast_check` (L40697). |
| 4 | 5-tap ceiling referenced in mobile workflows | **PASS** | Narrative origin in §3.4-era exit criterion (L1727); normative definition at §38.7.2 (L25699–L25707); acceptance gating at §38.7.6 #5 (L25757); per-workflow ceiling declared for every row of the §38.8.4 top-20 catalog (L25949–L25970); release-gate binding at §38.8.5 #1 / #3 (L25982, L25984). |

---

## 2. §3.6 — Form & Input Tokens

**Presence.** Section begins at L1771 with Purpose clause C.109 and a concrete scope that enumerates every form control class it governs (text/password/email/phone/numeric/monetary inputs, textarea, select, multi-select, tag input, toggle, checkbox, radio, segmented control, slider, stepper, file picker, search input, inline-edit cell, rich-text wrapper) plus explicit exclusions (Command Palette search input, NDA signature, third-party embeds).

**Token concreteness.** §3.6.1 table (L1781–L1809) declares 24 authoritative tokens with numeric values, not prose. Representative sample:

| Token | Value | Binding |
| :---- | :---- | :---- |
| `--input-height-sm` | 28px | Dense inputs |
| `--input-height-md` | 36px | Canonical primary form field |
| `--input-height-lg` | 44px | Hero / mobile (WCAG touch target) |
| `--input-padding-x` | 12px | Horizontal (sm/md) |
| `--input-radius` | `--radius-md` = 6px | All inputs |
| `--input-focus-ring-width` | 3px | Outer ring, offset 0 |
| `--input-min-width-numeric` | 8ch | Monetary / SLA-day |
| `--input-max-width-url` | 480px | URL fields |

Cross-token invariants (L1811) lock vertical-centering math against typography tokens (e.g., `--input-height-md` + Body 14px ⇒ 11px vertical padding), preventing ambiguity in component rendering.

**Behavioral surfaces.**

- Focus-ring rules (§3.6.2, L1813) specify `:focus-visible` gating, hover suppression, active-state dampening, error-mode ring inversion, Command-Palette z-stack exception, and reduced-motion handling.
- Validation-state enum `input_validation_state` (§3.6.3, L1825) defines `default | focus | success | warning | error | disabled`, orthogonal `read_only`, and explicit state precedence; per-state border/fill/ring/helper-text/cursor/ARIA contract table (L1827–L1835) is exhaustive.
- State-transition edge cases (L1837–L1842): async-validation race (discard stale responses, spinner in trailing icon, no flicker), focus-during-error (rate-limit ARIA to 1/2s), disabled-midinteraction telemetry (`input.disabled_midinteraction`), read-only+success composability.
- Labels/helper/counter rules (§3.6.4, L1844) require visible `<label>` via `htmlFor` or `aria-labelledby`, reject placeholder-as-label at lint (`no-placeholder-label`), and spec character-counter thresholds (warning at 90%, danger at 100%).
- Accessibility block (§3.6.6, L1869) enumerates seven WCAG-binding rules, including ≥ 4.5:1 label-vs-background contrast and ≥ 3:1 border contrast in all states.
- Failure modes (§3.6.7, L1879) cover six realistic production defects: multiline paste, async timeout >3s, concurrent inline-edit conflict, IME-composition `maxLength` overflow, screen-reader submit during async validation, browser autofill.
- Acceptance criteria (§3.6.8, L1890) are 10 numbered, testable assertions each pointing to a named test (`token_audit_inputs`, `async_validation_timeout_fallback`, `inline_edit_conflict_rollback`, `ux_token_drift_check`).
- Observability (L1903) registers six `ui_form_input_*` PostHog events in Appendix G with the canonical property set (`surface, form_id, field_id, validation_state, console, plan_tier, user_role`).

**Verdict.** Concrete. Implementation-ready. No missing contract.

---

## 3. §3.7 — Loading / Empty / Error State Catalog

**Presence.** L1907. Purpose C.110. Enum `page_state_kind` (Appendix J): `loading | empty | error | partial | ready`. Scope names 25+ surfaces across Buyer, Seller, Ops, Marketplace.

**State governance.** §3.7.1 (L1913) defines the state-machine transitions (mount → loading → ready | empty | error | partial; partial → ready | error; error → loading on retry) and codifies the `ui_page_state_changed` telemetry event with `from_state, to_state, latency_ms, console, surface, page_surface_kind`. The **no-flash rule** (L1928) specifies a 300ms setTimeout on skeleton render to prevent skeleton-flicker on warm caches.

**Content-shaped skeletons.** §3.7.2 (L1930) enumerates seven rules: shape-matching (table skeletons mirror column widths + avatars), no spinners on primary content, 1500ms shimmer (with `prefers-reduced-motion` fallback to 15% opacity static block), per-surface p95 duration budget, schema-preloaded column widths, progressive reveal, cancellability for >5s loads.

**Empty-state contract.** §3.7.3 (L1940) mandates named emptiness (≤6 words), next-step explanation (1–2 sentences), primary CTA as verb, enum `empty_state_next_best_action_kind` with exactly one of `create | import | invite | browse | configure | contact_ops | none`. Permission-aware emptiness auto-substitutes `Request Access` routed through Inbox §29.

**Error contract (Failure / Reason / Recovery).** §3.7.4 (L1950) locks three-part error copy. Recovery enum `error_recovery_kind` = `retry | reload | contact_support | change_input | wait | upgrade_plan | view_status | no_recovery`. Transient errors auto-retry once; plan-gate errors (402 / `feature_not_entitled`) render yellow (not red) with `Upgrade` primary CTA.

**Illustration rules (§3.7.5, L1971).** Table maps context → illustration weight with authoritative sizing: 120×120px accent-stroke for aspirational empty; 96×96px tertiary-stroke for error; never on loading or partial. Mandated `prefers-color-scheme` SVG variants with ≥ 4.5:1 dark-mode contrast.

**Per-surface catalog (§3.7.6, L1984).** Six sub-sections (Dashboard, Matrix, Detail, Settings, Ops, KB) each declare loading skeleton shape, empty-state copy and CTA, canonical error treatments, and max durations with partial-transition thresholds. Every row names the recovery kind and, where relevant, the plan-gate treatment.

**Copy guidelines (§3.7.7, L2066).** Length budgets (empty headline ≤6 words, error headline ≤8, recovery CTA ≤3), verb discipline, no internal jargon on customer surfaces, plural conventions, incident-ID caption rule (monospace `Ref:` prefix, copy-on-click), status-page link standard.

**Recovery CTA table (§3.7.8, L2076).** Locks default labels and behavior per recovery kind, including retry debounce (1500ms), three-strike flip to Contact Support, and CTA-count cap (max three; escalate to full-screen incident surface §29.11 if more).

**Connectivity and offline signaling (§3.7.10, L2104).** Sticky warning banner on `navigator.onLine = false`, suppresses per-page error states during offline, emits reconnect toast.

**Failure modes (§3.7.9, L2091) and Acceptance Criteria (§3.7.11, L2108).** Eight authored failure modes with handling; 10 acceptance criteria, each bound to a named test or automated audit.

**Verdict.** Concrete, exhaustive, and cross-referenced to §3.11 (dark-mode), §29 (Inbox), §38 (tokens). No drift.

---

## 4. §3.8 — Side Peek Dimensions & Behavior

**Presence.** L2123. Purpose C.111. Scope table binds the Peek to every primary list/table surface across Buyer, Seller, Ops, Marketplace; explicit exclusion for Command Palette overlays and for full-page URL-routed details.

**Dimensions (§3.8.1).** Default 480px, min 360, max 640, resize step 8px (keyboard `Cmd+Alt+Arrow`), persisted per-user × per-surface in `UserPreferences.side_peek_widths_json` with LRU-30 cache. Mobile collapses to 100% viewport full-screen modal (§3.4). Elevation `shadow-3`, z-index 30, 200ms ease-in-out open slide + 150ms fade, symmetrical close, reduced-motion path. RECONCILIATION flag for UX §3.1 420px legacy value explicitly logged (L2133).

**Triggers.** Open (§3.8.2): `Enter`/row-click on desktop; explicit rule that `Space` is reserved for bulk selection (§3.10), not Peek; `Cmd+Click` reserved for toggle-select; `O` alternate binding; deep-link `?peek={id}` with graceful invalid-ID Toast. **First-focus rule**: focus moves to Peek's primary action if present, else close button. Close (§3.8.3): Escape → returns focus to opening row, with fallback to list primary CTA if row was removed; close button identical; desktop has NO backdrop; mobile backdrop click closes; navigation/back-button auto-close.

**Navigation within Peek (§3.8.4).** `Cmd+[` / `Cmd+]` prev/next within filtered-and-sorted list scope; bounds render 200ms orange chevron chirp; cross-page auto-advance with cancel control; permission-gated items silently skipped. Explicit rebinding rule when the underlying list filter changes mid-Peek.

**Layout (§3.8.5).** Header 48px, body fluid scrollable, footer 56px sticky. Scroll preservation across prev/next uses a per-entity LRU of 10 scroll positions, session-scoped.

**State variants (§3.8.6).** Per-state rendering bound to §3.7.6.3 detail catalog.

**Failure modes (§3.8.7, L2217).** Eight: pagination race, sub-360 resize auto-repeat clamp, console-switch auto-close, session expiration, deep-link through hidden filter, concurrent entity update, parent-list unmount, screen-reader focus-trap.

**Acceptance criteria (§3.8.8, L2230).** 12 numbered assertions covering dimensions, persistence, keyboard bindings, focus restoration, deep-link resolution, bounds chirp, pagination auto-advance, scroll preservation, console-switch close, filter-rebind test (`side_peek_prev_next_respects_filter_change`), axe-core zero violations, dark-mode elevation contrast.

**Observability.** Seven `ui_side_peek_*` events.

**Verdict.** Concrete. Edge cases exhaustive.

---

## 5. §3.9 — Cursor Presence Visualization

**Presence.** L2249. Purpose C.112. Enum `cursor_presence_status`, entity binding to §4.3.14 `PresenceRecord`. Scope includes Requirements/Scoring/Traceability matrices, Requirement Detail body, Response/Comment/Selection-Report/Bid/KB editors; Ops Console **excluded by design**.

**Rendering table (§3.9.1, L2257).** Self cursor = native OS cursor (never double-rendered); teammate cursor = 16×16 SVG pointer with 2px colored border, initials 20×20 badge, 800ms-hover tooltip; text caret = 2px vertical bar in teammate color; selection highlight = 20% alpha fill; typing indicator aggregates up to 3 names, overflow as `+N`.

**Hue palette.** `presence_hue_1..8`, deterministic lowest-index assignment, wrap after 8 concurrent sessions (C.112), avatar stack shows `+N more` with hover popover.

**Idle fade (§3.9.3, L2283).** Opacity thresholds: `active` <3s (100%), `active_idle` 3–10s (80%), `idle` 10–30s (35% with 500ms fade), `disconnected` 30–60s (cursor removed; badge @ 50%), evicted >60s. Reduced-motion replaces fade with instant transitions.

**Off-screen viewport indicators (§3.9.4, L2293).** 24×24px edge arrow with teammate initials; click smooth-scrolls cursor into view (reduced-motion → instant jump); max 3 per edge; overflow into `+N` jumplist popover; suppressed during own typing (resumes 500ms post-keystroke); anchored to `viewport_element_ref` on row/cell-based surfaces.

**Mobile divergence (§3.9.5).** No live cursors (no mouse); presence avatars + online-status dots in header; text carets still render during editor sessions; edge indicators replaced by bottom-sheet "Teammates" tap affordance.

**Cross-console / cross-org rules (§3.9.6).** Buyer/Seller firewall enforced; Guest cross-org one-way visibility; 5s eviction on console switch; Ops impersonation sessions render NO cursors (banner-only per §50.11).

**Accessibility (§3.9.7).** Color + initials pairing (WCAG 1.4.1), ≥ 3:1 edge contrast, ≥ 4.5:1 badge-text contrast in both modes, `aria-live="polite"` join/leave announcements (rate-limit 1/2s), reduced-motion suppression, User Settings opt-out.

**Performance budget (§3.9.8).** Client throttle 50ms, server delivery 100ms, max 8 rendered cursors, GPU-composited `transform: translate3d`, degrade-to-250ms under sustained >50 events/sec with `ui_cursor_presence_throttled` telemetry.

**Failure modes (§3.9.9, L2339) and Acceptance Criteria (§3.9.10, L2352).** Eight failure modes; 10 criteria including Playwright tests `presence_palette_wrap`, `presence_console_firewall`, `presence_reduced_motion`.

**Observability.** Seven `ui_cursor_presence_*` events.

**Verdict.** Concrete. Parity with dark-mode and firewall rules enforced.

---

## 6. §3.10 — Bulk Action Toolbar

**Presence.** L2369. Purpose C.113. Scope includes Requirements/Vendor/Triage/Comment Inbox/KB/Marketplace/SellerSoftware/Ops/Team/Workspace/API-Token/Notification-rule lists; explicit exclusion of Scoring-Matrix cells and Selection Report.

**Selection mechanics (§3.10.1, L2375).** Checkbox click / `Space` / Shift+Click / Cmd+Click / Cmd+A all specified with cross-pagination behavior. `Cmd+A` defaults to `all_in_filter` (up to 10,000 cap); toolbar surfaces `Only on this page (N)` narrowing action. Enum `bulk_action_selection_mode = visible_only | all_in_filter`. Individual-selection warning at 500 rows.

**Pagination persistence (§3.10.2, L2391).** Client-side `selectionState` keyed by `(surface, filter_signature, sort_signature)`; filter/sort change prompts Keep/Clear (Escape default = Clear); cross-page Shift+Click resolves server-side with "Selecting 142 rows across pages…" progress.

**Placement (§3.10.3, L2406).** Desktop sticky-top 48px; floating 720px-max variant for dense surfaces; mobile bottom 56px bar above tab bar; Ops 40px dense. Anatomy mock (L2417) with count popover + primary actions + overflow + clear + close.

**Action catalog (§3.10.4, L2428).** 14-surface table maps surface → primary + overflow actions + plan-gate bindings. Permission handling rule: ungranted actions hidden (not grayed); partial-applicability actions grayed with tooltip.

**Destructive confirmation (§3.10.5, L2450).** Modal contract: count-named headline, consequence body, danger-fill primary, `Enter` NOT bound (accident guard — `Alt+Enter` required), undo toast for reversibles (10s), "Yes, I understand" checkbox for irreversibles.

**Dispatch & progress (§3.10.6, L2474).** Chunked 200-row execution streamed via SSE / Convex subscription; partial failure segments selection; rate-limit 429 pauses with `wait` recovery.

**Failure modes (§3.10.7, L2485) and Acceptance Criteria (§3.10.8, L2499).** Eight failure modes including resumable partial-commit inbox item ("Your bulk delete was interrupted. 187 of 237 completed. [Resume] [Review]"); 10 acceptance criteria including mobile safe-area test on iOS 17+ / Android 14+.

**Observability.** Nine `ui_bulk_action_*` events.

**Verdict.** Concrete.

---

## 7. §3.11 — Dark Mode Parity Rules

**Presence.** L2516. Purpose C.115. First-class dark mode across both consoles, Ops Console, Marketplace authoring, and email HTML previews; explicit exclusion for printable artifacts (Selection Report PDF, Audit Log export) and status-page artifacts.

**Theme resolution (§3.11.1, L2522).** Enums `theme_mode` and `theme_override_source` registered in Appendix J. Four-step resolution order (user override → Org default → system preference → default system). User/Org surfaces exposed. No reload required on change.

**Token mapping (§3.11.2, L2535, table L2541–L2562).** Explicit light/dark hex pairs for 14 tokens including page/sidebar/card/elevated backgrounds, borders, primary/secondary/tertiary text (with explicit note that tertiary INVERTS salience direction), inverse text, accent + hover, success/warning/danger/info/exception/agent, presence-self, presence-other. Each dark semantic token is re-tuned (not lightened) to hit a stated contrast ratio (accent 4.7:1, success 5.1:1, warning 6.4:1, danger 4.8:1, exception 4.6:1). Surface-specific tuning for scoring cells (80% saturation), error-state fills, illustrations (dark SVG variants), avatars/brand logos (never tinted).

**Contrast gate (§3.11.3, L2573).** Explicit rule:

> "WCAG 2.1 AA requires 4.5:1 for normal text and 3:1 for large text (≥ 18pt or ≥ 14pt bold) and UI components. Sourcera's internal standard is stricter: ≥ 4.5:1 for text and ≥ 3:1 for UI component boundaries in BOTH modes."

CI pipeline: Playwright + `axe-core` + `@adobe/leonardo-contrast-colors` runs on every PR touching `app/styles/tokens.css` or any component .tsx file, and on nightly schedule; loads every Storybook story in both modes, computes all token-pair contrasts (text-on-bg, border-on-bg, focus-ring-on-bg), fails build on <4.5:1 text or <3:1 UI, and surfaces failing pairs in the PR comment with a baseline diff.

**Non-token elements (§3.11.5, L2591).** Table covers Recharts/D3 charts (derive from tokens), Stripe Elements (`theme: "night"`), Firecrawl iframe wrapper chip, Zendesk widget, Perplexity citations (Sourcera-rendered), user-uploaded images/PDFs (neutral chip), Markdown + `react-markdown` + One Dark Pro syntax theme, email previews (light-forced container).

**Ops Console default (§3.11.6).** Dark by default via system-managed `OrganizationPreference.ops_default_theme_mode`; user override permitted; cross-Org user-role composition specified.

**Edge cases (§3.11.7, L2615).** Eight: screenshot-capture cross-mode handling, printed Selection Report (force-light), email preview sandboxing, Org-default-change-while-user-has-override resolution, reduced-motion + dark + high-contrast composition, Enterprise custom brand color validation (with signed-waiver path), cross-mode content-paste sanitization.

**High Contrast mode (§3.11.8, Authored Extension, L2625).** Layered over light/dark; ≥ 7:1 text, 2px borders, 4px focus ring, icon+text pairing for all status surfaces, auto-activation via `forced-colors: active` or user override.

**Failure modes (§3.11.9, L2639) and Acceptance Criteria (§3.11.10, L2652).** Eight failure modes (hardcoded hex slippage, dark contrast regression, toggle flicker, dark-print illegibility, brand-color failure, support-screenshot mode mismatch, iframe adoption failure, in-flight transaction theme-swap). 10 acceptance criteria including token drift check (§50.17.4), contrast gate, Settings-Appearance override without reload, `prefers-color-scheme` honoring for `system` mode, Ops default, forced-light on printed artifacts, SVG illustration coverage, high-contrast activation path, `no_hardcoded_hex` lint.

**Observability.** Five `ui_theme_*` and `ui_high_contrast_activated` events; `ui_theme_flash_detected` fires if theme swaps more than once within 1s of mount (instrumented detection of flash-of-wrong-theme leakage).

**Verdict.** Concrete. The 4.5:1 rule is stated explicitly three times (§3.11.2 intro, §3.11.3 heading + body, §3.11.10 AC #2) and operationalized via a named CI gate.

---

## 8. §38.6 — Breakpoints (Authoritative Taxonomy)

**Presence.** L25556. Purpose C.114. §38.6 declared authoritative over §38.1's coarse narrative; five-tier taxonomy binding to Tailwind, Convex, and per-surface token selection.

**Enum & table (§38.6.1, L25562).** Enum `responsive_breakpoint_tier` (Appendix J): `mobile_xs | mobile_sm | tablet | desktop | desktop_xl`. Tier table with exact pixel boundaries + canonical devices + Tailwind alias:

| Tier | Width | Alias |
| :---- | :---- | :---- |
| `mobile_xs` | `< 640px` | (default) |
| `mobile_sm` | `640 ≤ w < 768` | `sm:` |
| `tablet` | `768 ≤ w < 1024` | `md:` |
| `desktop` | `1024 ≤ w < 1280` | `lg:` |
| `desktop_xl` | `≥ 1280` | `xl:` |

Rounding & edge rules explicitly: exact 640 ⇒ `mobile_sm`, exact 768 ⇒ `tablet`, etc. `window.innerWidth` authoritative; `clientWidth` fallback for kiosk mode. Zoom, orientation, split-view all recompute tier. Debounce 150ms ±20ms; `ui_responsive_breakpoint_crossed` event with `from_tier, to_tier, width_px, reason ∈ {resize, rotation, dev_tools_open, split_view_change}`.

**Per-breakpoint layout rules (§38.6.2, L25574, table L25578–L25603).** 20+ dimensions binding tier → layout: column layout, sidebar, Side Peek, Command Palette presence, primary nav, breadcrumbs, tab bars, matrix/table rendering, DataTable column density, cursor presence, Bulk Action Toolbar, keyboard shortcuts, hover interactions, touch-target minimum (48/48/44/32/32), typography base, line-length cap, page-level padding, modal dimensions, bottom sheet, color-scheme participation, reduced-motion participation, Seller Bid Composer rendering, Ops Console rendering (blocked on mobile; read-only on tablet; full on desktop).

**Convex viewport-aware diffing (L25604).** Subscriptions may request smaller row fanout on mobile (e.g., Requirements Matrix defaults to `limit=20` on mobile vs `limit=50` on desktop). Cache keyed by `(org_id, console, surface, breakpoint_tier, filter_hash)` to prevent desktop-cached rows bleeding into mobile renders.

**Entity binding (§38.6.3, L25607).** `UserUIPreference` entity documented per Master-Spec conventions (id, user_id, last_observed_breakpoint_tier, sidebar_collapsed_per_tier_json, side_peek_width_px_per_tier_json, datatable_columns_hidden_per_tier_json, created_at/updated_at/deleted_at). User-scoped, cross-console-shared. DSAR-bound via §6.8. Residency replicates User record.

**Tier-transition edge cases (§38.6.4, L25627).** Window-resize mid-interaction, orientation change mid-Peek, iPadOS split-view drag below threshold, external-monitor unplug (Ops Console degrade-to-read-only banner), zoom >200% on desktop_xl, rotation with Command Palette open on `mobile_sm` (defensive leak detection event), dev-tools split resize, `@media print` forcing tier to `desktop`.

**Conformance tests (§38.6.5).** `responsive_conformance_suite` renders every route at 375/720/820/1200/1440 px and asserts no horizontal overflow, tier-minimum touch targets, required panels visible, forbidden components absent.

**Acceptance criteria (§38.6.6, L25644).** 10 numbered assertions with exact-tie-break rule, debounce tolerance, conformance coverage, per-tier preference persistence, unsaved-form preservation across reflow, print stylesheet rule, telemetry firewall compliance, Ops Console 302-redirect enforcement.

**Failure modes (L25657).** Six counterfactuals: tier thrash near boundary (20px hysteresis), iOS Safari URL-bar toggle (key on `innerWidth` alone), dev-tools split consumption, accessibility zoom on small laptop, Galaxy Fold transition (settled event authoritative), external-monitor hot-plug.

**Verdict.** Concrete and implementation-ready.

---

## 9. §38.7 — Gesture Equivalents & 5-Tap Ceiling

**Presence.** L25666. Purpose C.114. §38.7 supersedes §3.4 as the authoritative gesture translation contract.

**Enums.** `mobile_gesture_kind` (14 values) and `mobile_keyboard_shortcut_target` (14 values) both bound to Appendix J.

**Translation table (§38.7.1, L25678–L25697).** Every canonical desktop keyboard pattern maps to a gesture across three device contexts (mobile xs/sm, tablet without keyboard, tablet with external keyboard) plus notes. Representative bindings:

- `J` / `K` → `swipe_up` / `swipe_down` with 300 px/s velocity threshold (below threshold = scroll, above = row advance).
- `Enter` on focused row → tap row; full-screen peek on mobile, 72% overlay on tablet, 480px peek on desktop.
- `Escape` → `bottom_sheet_drag_down` OR Android hardware back OR backdrop tap; iOS edge-swipe reserved for WebView history and NOT reassigned.
- `Cmd+K` → tap Search icon → bottom-sheet palette at 85% viewport with auto-focused input + virtual keyboard auto-shown.
- `L` (inline edit) → long-press ≥500ms with haptic.
- `Shift+Click` → long-press-to-anchor + tap-to-extend.
- `Cmd+A` → long-press → action sheet → "Select all matching filter" (respects 10,000-row cap).
- `D` (delete) → swipe-left with 50% viewport width commit threshold + haptic warning.
- `Cmd+Enter` → sticky Submit button pinned above virtual keyboard via `position: sticky; bottom: env(keyboard-inset-height)`.
- `Cmd+[` / `Cmd+]` peek prev/next → `swipe_right` / `swipe_left` with 100px edge-drag threshold originating ≥24px inside the viewport (iOS back-gesture safe-area collision guard).

**5-Tap Ceiling (§38.7.2, L25699).** Normative definition with four tiers of clarity:

- **What counts as a tap.** Discrete touch-down-to-release on an interactive target that advances the workflow. Counted: buttons, links, rows, cells, pills, chips, icons, action-sheet items.
- **What does NOT count.** Scrolling, pinch-zoom, keyboard entry (virtual or physical), gesture dismissals (swipe-down, back-gesture), focus transitions (Tab, virtual-keyboard Next/Prev), long-press-to-reveal (the long-press itself; the follow-on action-sheet selection IS a tap), `pull_to_refresh`.
- **Ceiling.** ≤5 taps for every major workflow (enumerated in §38.8.4) from a pre-authenticated entry point (Dashboard or Inbox).
- **Destructive exception.** Workflows whose final step is destructive may exceed by one tap for confirmation (cap 6); tracked with `destructive_exception=true` flag.

**Enforcement.** `tap_count_probe` CI job simulates each top-20 workflow and fails the build on breach. Runtime telemetry `ui_mobile_tap_count_probe_exceeded` fires on production sessions where instrumented workflows exceed ceiling, with `workflow_kind, observed_taps, ceiling, user_agent_class`.

**Gesture safety, conflicts & edge cases (§38.7.3, L25709).** 12 rows: iOS edge-swipe safe area (≥24px interior touch-start filter), Android hardware back (closes overlays top-down), accidental-swipe-during-scroll thresholds (300 px/s, 50% viewport commit), long-press mechanics (500ms + haptic + dim), pull-to-refresh only on refreshable surfaces, two-finger-tap Scoring Matrix reserved for popover (anti-misfire), pinch-zoom disabled on Scoring Matrix, virtual-keyboard submit preservation, peek prev/next horizontal swipe vs scroll vertical, rapid double-tap (250ms debounce on score pills), external-keyboard tablet dual-path, reduced-motion visual suppression, AssistiveTouch/Voice Control tap-only fallbacks.

**Tap-count probe harness (§38.7.4, L25728).** Playwright + Appium + in-house `@sourcera/tap-probe`. Execution cadence: pre-merge on PRs touching `/src/mobile`, `/src/ui/components/**/*Mobile*`, `/src/ui/hooks/useBreakpoint.ts`, `/src/ui/layout/**`; nightly full-sweep on iOS Safari / Chrome Android / Samsung Internet × two tiers × two orientations; release-gate pre-production cut. Failure artifacts: full video, tap-by-tap screenshot series, DOM snapshot per step, expected vs. observed tap count, JSON diff. Uploaded to `responsive_tier_conformance` dashboard (§50.14.3). Runtime companion: `ui_mobile_workflow_tap_sequence` events on top-20 workflows, p50/p95/p99 time series, p95-over-ceiling alert for 3 consecutive days.

**Error codes (§38.7.5, L25742).** Four added to Appendix I: `gesture_out_of_safe_area` (422), `mobile_command_palette_hydration_forbidden` (500), `tap_count_probe_ceiling_breach` (CI exit 42), `mobile_ops_console_write_attempted` (403).

**Acceptance criteria (§38.7.6, L25751).** 12 numbered assertions including the 5-tap-ceiling CI-enforcement rule (#5), destructive-exception cap (#9), iOS safe-area filter (#7), virtual-keyboard Submit preservation on iOS 16.4+ / Android 13+ (#10), reduced-motion gesture recognition (#11), AssistiveTouch fallback (#12).

**Failure modes (L25766).** Eight counterfactuals with named mitigations including iOS WebKit edge-swipe regression fixtures across iOS 16/17/18, low-velocity swipe false-positives, landscape bottom-sheet palette obstruction on iPhone SE rotated, motor-control accessibility path, legacy Android WebView keyboard-inset fallback, Bluetooth-keyboard hotplug mid-session.

**Verdict.** Concrete, normative, CI-enforced, and runtime-monitored. 5-tap ceiling is present at definition, enforcement, and release-gate levels.

---

## 10. §38.8 — Mobile Feature Parity Matrix

**Presence.** L25777. Purpose C.114. Supersedes §38.4 narrative summary.

**Enum (§38.8).** `mobile_feature_parity_status`: `parity | supported | simplified | not_supported`. Status definitions (L25783–L25788) are concrete: `parity` = identical behavior; `supported` = equivalent capability, mobile-specific UX (e.g., bottom-sheet palette); `simplified` = reduced capability surface with enumerated limitations; `not_supported` = unavailable with informational redirect OR hard redirect.

**Cross-tier transition contract (§38.8.1, L25790).** Five mandatory behaviors on tier crossing: form state preservation, reflow within one animation frame, scroll preservation, focus preservation, `ui_responsive_tier_component_reflowed` emission with `component_id, from_tier, to_tier, preserved_state_bytes`. Failure is P1 regression.

**Parity matrix (§38.8.2, L25802, table L25806–L25931).** ~110+ rows across the 10-section functional taxonomy (Buyer §11, Policy & Agent §12/§21, Scoring §13, TCO §15, Scenario Modeling §14, Org Intelligence §16, Analytics §17, Q&A §18/§24, Template Library §19, Inbox & Pulse §20, Seller KB §22, Seller Bid §23, Seller Q&A/NDA/Inbox §24, Marketplace §26/§27, Cross-Console §25, Settings & Admin §7/§36, Notifications §31, Integrations §32, Accessibility & I18n §37, Ops Console §50, Product Usage Analytics §51, PLG & Growth M1–M17 §48). Each row declares desktop/tablet/mobile status + Notes enumerating simplifications. Matrix-completeness rule: `feature_parity_matrix_completeness` CI job scans feature-introducing sections and fails if any missing.

**Simplification disclosure contract (§38.8.3, L25935).** Three mandatory disclosure patterns per status: `simplified` ⇒ informational chip with enumerated list; `not_supported` redirect-permitted ⇒ redirect banner with continue/dismiss; `not_supported` hard-block ⇒ `/:console/mobile-unsupported` page with deep-link preservation.

**Top-20 workflows (§38.8.4, L25945).** Catalog of 20 workflows for `tap_count_probe` CI job, each with: `tap_count_probe_workflow_kind` enum value, workflow description, entry point, ceiling, `destructive_exception` flag, notes. All 20 declared ceilings are ≤5, most are 2–4. Destructive-exception workflows (6-tap ceiling) enumerated separately: `buyer_delete_requirement`, `seller_withdraw_bid`, `buyer_disqualify_vendor`.

**Release-gate rule (§38.8.5, L25978).** Five blocking conditions: tap-count probe failing on any of 20 workflows; matrix-completeness failing; runtime p95 tap-count over ceiling 3 consecutive days on canary; responsive conformance failing at any of 5 canonical widths; any Ops Console `/ops/*` route serving 200 to mobile write. Merge blocked on any of these until resolved. Override requires `ops_platform_admin` role + documented audit-log justification.

**Acceptance criteria (§38.8.6, L25990).** 10 assertions including per-feature row existence (#1), Notes-non-empty for simplified rows (#3), no silent no-op on not_supported (#4), cross-tier preservation (#5), probe coverage (#6), runtime probe sample rate (100% for top-20, 10% for others) (#7), destructive cap (#8), disclosure chip persistence (#9), release-gate binding (#10).

**Failure modes (L26003).** Eight counterfactuals with named mitigations including matrix-completeness CI scan against heading pattern, `spec_matrix_lint` for Notes enforcement, mobile-fallback route registration (`mobile_unsupported_surface_test`), probe flake handling (3× retries + consecutive-breach requirement), cohort-context alert annotation, cross-tier state preservation E2E (`cross_tier_preservation`), release-gate bypass audit-logging, parity-row-vs-actual-behavior validation via `responsive_conformance_suite`.

**Verdict.** Concrete, matrix is populated, release-gate enforcement is wired.

---

## 11. Dark-Mode 4.5:1 Rule — Explicit Citations

Verification target: "Dark mode contrast ratio rule (≥ 4.5:1) stated explicitly."

| # | Location | Quoted Statement |
| :---- | :---- | :---- |
| 1 | §3.11.2, L2537 | "Semantic tokens are RE-TUNED (not merely lightened) to hit ≥ 4.5:1 contrast against dark backgrounds." |
| 2 | §3.11.3 heading, L2573 | "### 3.11.3 Contrast Gate (≥ 4.5:1)" |
| 3 | §3.11.3 body, L2575 | "Sourcera's internal standard is stricter: ≥ 4.5:1 for text and ≥ 3:1 for UI component boundaries in BOTH modes." |
| 4 | §3.11.3 CI pipeline, L2581 | "Fails the build on any < 4.5:1 text or < 3:1 UI contrast." |
| 5 | §3.11.10 Acceptance Criterion #2, L2655 | "Contrast ratios in both modes are ≥ 4.5:1 for text and ≥ 3:1 for UI boundaries; CI contrast gate passes." |
| 6 | §3.11.2 token table row `--color-presence-other`, L2562 | "Each hue maintains ≥ 3:1 vs background; initials badge text ≥ 4.5:1. See §3.9.2." |
| 7 | §3.6.6 Accessibility rule, L1873 | "Contrast ratios: label vs background ≥ 4.5:1; helper text vs background ≥ 4.5:1; border vs background ≥ 3:1 in all states; focus ring vs background ≥ 3:1." |
| 8 | §3.6.8 AC #4, L1895 | "Label-vs-background contrast ratio measured at ≥ 4.5:1 in both Light and Dark modes for every tokenized input component, verified via automated Playwright + axe-core scan gated in CI." |
| 9 | §3.7.5 illustration rule, L1982 | "The dark-mode variant re-tunes stroke color to preserve ≥ 4.5:1 contrast with the dark background (see §3.11)." |
| 10 | §3.7.9 failure-mode row, L2100 | "Any < 4.5:1 contrast fails the build. §3.11 parity rule enforcement." |
| 11 | §3.7.11 AC #9, L2118 | "Dark-mode illustration contrast ratio ≥ 4.5:1 on all rendered illustrations; visual regression suite `dark_mode_illustration_contrast` passes." |
| 12 | §3.9.7 accessibility rule, L2327 | "Hue contrast against both light and dark backgrounds is audited at ≥ 3:1 for the cursor edge and ≥ 4.5:1 for the initials badge text." |
| 13 | §3.9.10 AC #9, L2362 | "Hue contrast against dark mode is ≥ 3:1 (edge), ≥ 4.5:1 (badge text); dark-mode parity test asserts." |
| 14 | §3.10.8 AC #10, L2510 | "Dark-mode parity: toolbar and button contrast ratios ≥ 4.5:1; §3.11 gate passes." |
| 15 | §25 / §37 Accessibility Requirements, L25460 | "Color Contrast: ≥ 4.5:1 (normal text), ≥ 3:1 (large text). Color is not sole information conveyor." |
| 16 | §50.17.4 token-drift gate, L40697 | "CI gate `ux_token_contrast_check` … computing token-pair contrast across all 20 mapped pairs in §3.11.4 and failing the build if any pair regresses below WCAG 2.1 AA thresholds (4.5:1 for text, 3:1 for UI components)." |

The rule is declared as policy, reified as a named CI gate (`ux_token_contrast_check`), encoded in per-section Acceptance Criteria, and bound to Ops-Console runtime drift monitoring (§50.17.4 `token_audit_inputs`).

**Verdict.** Gate satisfied with redundancy. No single-point-of-failure in rule encoding.

---

## 12. 5-Tap Ceiling — Explicit Mobile-Workflow References

Verification target: "5-tap ceiling referenced in mobile workflows."

| # | Location | Quoted Statement |
| :---- | :---- | :---- |
| 1 | §3.4-era criterion, L1727 | "All major workflows completable within 5 taps (excluding text entry)." |
| 2 | §38.7 Purpose, L25668 | "…enforcing the 5-tap ceiling defined in §3.4.1." |
| 3 | §38.7.2 heading, L25699 | "### 38.7.2 5-Tap Ceiling — Normative Definition & Enforcement" |
| 4 | §38.7.2 Definition, L25701 | Counted vs. non-counted tap interactions normatively enumerated (row-advance taps, action-sheet selections counted; scroll, pinch-zoom, keyboard entry, long-press itself, pull-to-refresh not counted). |
| 5 | §38.7.2 Ceiling, L25703 | "Every major workflow (enumerated in §38.8.4) MUST complete in ≤5 taps on `mobile_xs` and `mobile_sm`, starting from a pre-authenticated entry point (Dashboard or Inbox). Text entry within the workflow does not count against the ceiling…" |
| 6 | §38.7.2 Destructive exception, L25705 | "Workflows whose final step is destructive (delete requirement, withdraw EOI, disqualify vendor) MAY exceed the ceiling by one tap for the confirmation dialog, capping at 6 taps." |
| 7 | §38.7.2 Ceiling-breach handling, L25707 | CI `tap_count_probe` job fails build on breach; runtime `ui_mobile_tap_count_probe_exceeded` telemetry with `workflow_kind, observed_taps, ceiling, user_agent_class`. |
| 8 | §38.7.5 error codes, L25748 | "`tap_count_probe_ceiling_breach` (CI only, exit code 42) — tap-count probe exceeded ceiling." |
| 9 | §38.7.6 AC #5, L25757 | "The 5-tap ceiling MUST be enforced in CI via `tap_count_probe` job against the top-20 workflows in §38.8.4 on every qualifying PR; ceiling breach blocks merge." |
| 10 | §38.7.6 AC #9, L25761 | "Destructive-action workflows MUST NOT exceed 6 taps on mobile (ceiling + 1 for confirmation)…" |
| 11 | §38.8.4 table columns, L25949 | Every top-20 workflow row declares `Ceiling` and `Destructive Exception` columns; all 20 non-destructive ceilings are ≤5. |
| 12 | §38.8.4 destructive block, L25972 | `buyer_delete_requirement`, `seller_withdraw_bid`, `buyer_disqualify_vendor` tracked at 6-tap ceiling. |
| 13 | §38.8.5 release-gate #1/#3, L25982/L25984 | Release-gate conditions include `tap_count_probe` failing for any of 20 workflows AND runtime p95 tap-count exceeding ceiling for 3 consecutive days on canary cohort. |
| 14 | §38.8.6 AC #6 / AC #8, L25998/L26000 | Probe coverage of all 20 workflows per PR and on nightly sweep; destructive cap MUST NOT exceed 6 taps. |

The ceiling is present at narrative-criterion, normative-definition, CI-enforcement, runtime-monitoring, and release-gate levels. It is bound to a per-workflow catalog (§38.8.4 top-20) with explicit per-row ceilings; it enumerates the destructive-exception carve-out; and it defines what is and is not a "tap" at the first-principles level (counted vs. non-counted interactions).

**Verdict.** Gate satisfied. Ceiling is implementable, testable, monitorable, and gated.

---

## 13. Cross-Section Consistency Audit

Spot-checks performed during verification to catch silent drift between UX sections and mobile/breakpoint sections:

| Check | Result |
| :---- | :---- |
| Side Peek width (default 480, min 360, max 640 desktop; full-screen mobile) consistent between §3.8.1 and §38.6.2 breakpoint table | Consistent. Desktop 480 default with 360–640 clamp is mirrored in §38.6.2 row "Side Peek". `desktop_xl` extends clamp max to 720px per §38.6.2 ("`desktop_xl`: 480px default, 360–720px user-resizable"); this is the only inter-section divergence and it is directional (xl relaxes desktop cap). Acceptable; logged in cross-consistency observations below. |
| Touch-target minimums vs WCAG | §38.6.2 declares 48/48/44/32/32 per tier. §3.6.1 `--input-height-lg` = 44px is marked for mobile. §3.11 icon standards respect the same. No conflict. |
| Command Palette presence on mobile | §3.2/§38.6.2 both specify non-render on `mobile_xs`/`mobile_sm`. §38.7.1 maps `Cmd+K` to bottom-sheet palette on mobile. Defensive `mobile_command_palette_hydration_forbidden` (500) error code catches SSR leakage. |
| Cursor Presence availability on mobile | §3.9.5 mobile-divergence block: no live cursors, static avatar strip only. §38.6.2 row "Cursor Presence": `mobile_xs` and `mobile_sm` = "Static avatar strip only; no live cursors"; tablet at 60% opacity cap. Consistent. |
| Bulk Action Toolbar mobile behavior | §3.10.3 mobile row: 56px bottom; horizontally scrollable. §38.6.2 row: hidden on `mobile_xs`/`mobile_sm`; long-press action sheet. Apparent conflict: §3.10.3 shows a 56px bottom bar on mobile, while §38.6.2 says "Hidden; bulk actions via long-press → action sheet." |

**Observation** on the Bulk Action Toolbar mobile divergence: the conflict is language-level, not behavior-level. §3.10.3 describes the toolbar as rendered only after a selection is active; §38.6.2 describes the chrome-state *before* selection. Both are true at different points in the workflow. Recommend a clarifying note in §3.10.3 mobile row reading: "Rendered only after first selection (via long-press action sheet); hidden otherwise." This is a clarity improvement, not a blocking defect.

**Verdict.** No blocking cross-section inconsistency. One language-level clarification recommended (above) for §3.10.3. Does not block Phase 8 exit.

---

## 14. Counterfactual / Edge-Case Coverage Audit

Spot-check confirming the Phase 8 sections collectively address the minimum edge-case surfaces mandated by the project instructions:

| Edge-case class | Coverage |
| :---- | :---- |
| First-time / returning users | §3.7 empty-state rules (aspirational vs routine); §3.7.6 per-surface catalog (first-run vs filter-yields-none). |
| Empty / loading / error / partial | §3.7 enum and catalog; skeleton no-flash (300ms); partial-panel timeout 30s. |
| Concurrency / sync conflicts | §3.6.7 inline-edit rollback; §3.8.7 concurrent-update banner; §3.10.7 permission-revoked mid-dispatch. |
| Idempotency / retry | §3.7 auto-retry-once-on-mount; §3.10.7 idempotent bulk-action rows treated as no-ops. |
| Third-party outages | §3.7.6.6 Firecrawl outage with 60s retry cooldown; §3.11.5 Stripe / Zendesk widget theming; §3.11.7 brand-color waiver path. |
| Mobile vs desktop divergence | §38.6 breakpoint taxonomy; §38.7 gesture translation; §38.8 parity matrix. |
| Admin vs end-user | §3.7.6.4 settings 403 differentiation; §3.10.4 permission hide vs gray; §3.11.6 Ops Console dark default. |
| Guest cross-org | §3.9.6 one-way guest presence visibility. |
| Console firewall integrity | §3.8.7 Peek console-switch auto-close; §3.9.6/§3.9.9 Presence firewall tests. |
| Timezone / locale / currency | §38.8.2 row "Timezone / locale / currency formatting" → parity across tiers. |
| Downgrade paths | §3.7.4 plan-gate yellow banner + `Upgrade` CTA; §3.7.8 `upgrade_plan` recovery. |
| DSAR / right-to-erasure | §38.6.3 `UserUIPreference` DSAR-bound per §6.8; anonymized per §40.2. |

**Verdict.** Coverage is comprehensive for Phase 8 scope. Remaining gaps (if any) are scoped to later Phase targets (Phase 9 data model, Phase 11 APIs, etc.) and do not block Phase 8 exit.

---

## 15. Residual Observations — Dispositions

The following items were identified during verification. Five are resolved in this pass via targeted Master Spec edits; two are deferred to scope-appropriate phases (UX-source doc update; Phase 10 analytics review). Full details are logged in the Phase 8 entry of `/Sourcera/_integration/RECONCILIATION.md`.

| # | Residual | Disposition | Evidence |
| :---- | :---- | :---- | :---- |
| R1 | UX §3.1 Side Peek legacy 420px value drift | **Deferred — UX-source update.** Master Spec §3.8.1 already supersedes to 480px and logs the UX-source update. Master Spec is authoritative per CLAUDE.md §2; UX doc update queued for next UX-integration pass. No Spec change required. | §3.8.1 default-width row supersession notice (unchanged); RECONCILIATION Phase 8 "Pending UX-source updates." |
| R2 | §3.10.3 mobile toolbar row ambiguous vs §38.6.2 | **Resolved.** §3.10.3 mobile row clarified — the 56px bottom bar renders only after the first selection (entered via long-press → action sheet per §38.7.1). §38.6.2 describes the pre-selection chrome state; §3.10.3 describes the post-selection chrome state. Animation and reduced-motion note added. | §3.10.3 — Mobile row edited. |
| R3 | §3.8.1 vs §38.6.2 Peek clamp upper bound (640 on `desktop` vs 720 on `desktop_xl`) | **Resolved.** §3.8.1 Max-width row updated to declare both tier-appropriate upper bounds with per-tier rationale, and points explicitly to §38.6.2 (runtime tier resolution) and §38.6.3 (per-tier persistence schema `UserUIPreference.side_peek_width_px_per_tier_json`). | §3.8.1 — Max-width row edited. |
| R4 | High Contrast mode (§3.11.8) Authored Extension flag | **No action required.** §3.11.8 intro already carries the Authored-Extension flag; tracked in authoring-convention #16 compliance. | §3.11.8 intro (unchanged). |
| R5 | Runtime tap-count probe sampling heuristics (100% top-20, 10% others) | **Deferred — Phase 10 analytics.** Validate PostHog event-budget against AC #7 sampling rates at expected mobile-MAU. Confirm adaptive-sampling need. No Spec change this pass. | §38.7.4 runtime companion + §38.8.6 AC #7 (unchanged). |
| R6 | §38.8.6 failure-mode referenced both `feature_parity_matrix_completeness` and `spec_matrix_lint` without disambiguation | **Resolved.** §38.8.6 `simplified`-row failure-mode bullet expanded: `feature_parity_matrix_completeness` asserts every feature has a row; `spec_matrix_lint` is the per-row invariant suite asserting Notes-non-empty on `simplified`, `destructive_exception` boolean presence, and enum-value validity. Both run in the same CI stage and independently block merge. | §38.8.6 Failure Modes — `simplified` row edited. |
| R7 | §38.8.2 "Full keyboard navigation" mobile cell value `n/a` is not a valid `mobile_feature_parity_status` enum value | **Resolved.** Mobile cell changed from `n/a` to `supported`. Notes expanded to cite the §38.7.1 gesture-equivalent translation table, virtual-keyboard Next/Prev chevrons for form-field navigation, and the §38.7.3 external-Bluetooth-keyboard hotplug upgrade path. Explicit note added that `n/a` is not a valid enum value. | §38.8.2 — Accessibility & I18n / Full keyboard navigation row edited. |

**Net result.** All Phase 8 exit gates remain PASS. All seven residuals now have explicit dispositions; no unresolved items carry forward into Phase 9 except the two intentional deferrals (UX-source update, Phase 10 analytics validation) which are logged in RECONCILIATION with targeted owners.

---

## 16. Phase 8 Exit Decision

**Gates:**

| Gate | Result |
| :---- | :---- |
| §3.6–§3.11 present with concrete tokens/values | **PASS** |
| §38.6–§38.8 present with breakpoints, gestures, parity matrix | **PASS** |
| Dark-mode contrast ratio rule (≥ 4.5:1) stated explicitly | **PASS** |
| 5-tap ceiling referenced in mobile workflows | **PASS** |

**Exit Decision:** **Phase 8 complete.** Proceed to Phase 9.

**Signed:** Opus (senior technical product strategist / staff engineer for Sourcera).
**Timestamp:** 2026-04-24.
