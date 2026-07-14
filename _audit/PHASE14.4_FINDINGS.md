# Phase 14.4 — Master Spec ↔ UX Design v2 Cross-Doc Walk Findings

**Date.** 2026-05-12 (retroactive scratch log authored 2026-05-13 per V14 remediation pass D-V14-001).
**Auditor posture.** Senior technical product strategist + staff engineer; Opus-grade depth; non-destructive audit (`Audit_Prompts.md → Prompt 14.4 — Master Spec ↔ UX Design v2`).
**Source documents read end-to-end.** `UX_Design_of_Sourcera.md` v2.0.0 (483 KB; 2026-04-28) — §2.1 Typography / §2.2 Color System (light + dark mode declaration) / §2.3 Spacing Scale / §2.4 Elevation & Shadows / §2.5 Border Radius / §2.6 Motion & Transitions / §2.7 Iconography / §2.8 Z-Index Scale / §2.9 Form & Input Tokens / §3.1–§3.7 Global Application Structure + Navigation / §5.2 Component System Specification (19 components including the 10 preserved + 9 v2-additions: Modal §5.2.11 / Dropdown §5.2.12 / FormField §5.2.13 / TriageQueue §5.2.14 / SLATimer §5.2.15 / PhaseAdvancer §5.2.16 / AmendmentBanner §5.2.17 / DiffViewer §5.2.18 / PipelineSurface §5.2.19) / §11.6 Accessibility Acceptance Criteria A-01 through A-12. `Sourcera_Master_Spec.md` v7.1.0 §2.x (where the UX v2 component specs bind state contracts) / §3.6 (Form Token registry) / §3.6.1 Form & Input Tokens canonical table / §3.7 Component State Catalog / §3.8 Side Peek pattern / §3.10 Bulk Action Toolbar / §3.11 Dark Mode Parity Rules / §3.12 Loading & Skeleton States / §38 Component Library + token registry / §50.17.4 `ux_token_drift_check` CI gate / Appendix J `requirement_score_grade` enum.
**Authoritative outputs.** Defect ledger entries D-14.4-001 through D-14.4-012 (12 rows; 0 P0 / 0 P1 / 12 P2 / 0 P3); CONSISTENCY_DELTA.md "UX Design v2" section (lines 673–817).

**Retroactive-authoring note.** This scratch log was authored 2026-05-13 from the canonical Phase 14.4 outputs in `CONSISTENCY_DELTA.md` and `DEFECT_LEDGER.md` to remediate D-V14-001 (P2 documentation_gap; scratch-log discipline). The defect content, severity classifications, recommendations, and sign-off below faithfully reproduce the 2026-05-12 walk outputs. No new findings or severity changes are introduced in this retroactive authoring.

---

## 1. Walk Methodology

The walk traversed the UX v2 design-system foundation top to bottom — §2.1 through §2.9 (tokens) → §3.1–§3.7 (global structure) → §5.2 (component-by-component spec) → §11.6 (accessibility AC) — and for each substantive token, component variant, interaction state, or accessibility token, located the corresponding authoritative home in the Master Spec.

For each pair, four checks per `Audit_Prompts.md → Prompt 14.4`:

1. **Tokens consistent (color, spacing, typography, motion, elevation).** Every token cited in a UX v2 component spec resolves to a registered token in UX §2.x AND in Master Spec §3.6.1 / §38.1 token registry.
2. **Component variants consistent.** Component variants enumerated in UX v2 §5.2 reconcile with Master Spec §38 Component Library + §3.x component specs.
3. **Interaction states consistent.** Per-component interaction states (default / hover / focus / disabled / error / loading / empty / breached / etc.) reconcile against Master Spec §3.7 Component State Catalog.
4. **Accessibility tokens consistent.** UX §11.6 AC A-01 through A-12 reconcile against Master Spec §3.6.6 / §3.7 / §3.8 / §3.10 / §3.11 / §3.12 accessibility contracts.

Defects were filed only when a gap met all of: (i) the UX v2 commitment is materially load-bearing for the v7.1.0 / v7.1.x design system foundation; (ii) the Master Spec is silent on the dimension OR the two documents diverge; (iii) the gap is not already filed in DEFECT_LEDGER.md (cross-checked against D-3UX-NNN, D-3-NNN, D-37-NNN, D-38-NNN clusters).

## 2. Pre-Existing Defect Cross-Check (Scope De-duplication)

The PHASE3_SECTION3 audit (2026-05-09 + adversarial re-walk 2026-05-10) filed the following UX v2 ↔ Master Spec drift defects. Phase 14.4 confirms each is still `open` and does NOT re-file:

| Pre-filed defect | Severity | Scope it covers |
|---|---|---|
| D-3UX-003 | P2 | Side Peek default width drift — UX §3.1 specifies 420px; Master Spec §3.8.1 specifies 480px. Resolution path: UX v2 narrative edit (line 287–293, line 299) per Master Spec authoritative dimension. |
| D-3UX-017 | P3 | §3.6 Form & Input Token table is duplicated between Master Spec §3.6.1 and UX §2.9 — policy-managed via `ux_token_drift_check` CI gate (§50.17.4); the duplication itself is intentional (paired-mirror designer-facing surface). |
| D-3UX-019 | P2 | UX §3.10 Bulk Action Toolbar component specification lacks a state-machine table (From / To / Trigger / Conditions / Notes); recommendation is to extend §3.10 with a state machine. |
| D-3UX-020 | P2 | UX §3.7.6 per-surface state catalog has no dark-mode column — related to (but distinct from) D-14.4-009 (Dark Mode palette token values absent in §2.2). |

Phase 14.4 inherits these as cross-references; DEFECT_LEDGER.md `links` column on each new D-14.4-NNN row cites the relevant pre-filed defect where appropriate.

## 3. Section-by-Section Walk (Findings → Defect Mapping)

### UX §2.1 Typography → 2 new defects (D-14.4-001, D-14.4-005)

The 7-row typography role table (Display / Heading 1 / Heading 2 / Body / Body Small / Caption / Mono) reconciles cleanly with Master Spec §38.1 token registry. The Caption role is canonically defined as `12px / 0.75rem / weight 500 / 1.4 line-height / 0.02em tracking`.

- **§5.2.11 Modal + §5.2.16 PhaseAdvancer reference `Heading 3` / `Heading 4` ⚠** — undefined in UX §2.1 + Master Spec §38.1. The Modal Title cites "Heading 4" (line 3916) and the PhaseAdvancer Phase Display cites "Heading 3" (line 4178). Neither role is registered. → **D-14.4-001 (P2)**.
- **§5.2.13 FormField Label cites `letter-spacing: 0.5px` ⚠** — contradicts §2.1 Caption tracking `0.02em` (≈0.24px at 12px font size). Cross-section internal contradiction within UX v2; the Caption role has two different tracking values depending on section. → **D-14.4-005 (P2)**.

### UX §2.2 Color System → 2 new defects (D-14.4-002, D-14.4-009)

The Light Mode 22-row token table (`--color-bg-*`, `--color-border-*`, `--color-text-*`, `--color-accent`, `--color-success`, `--color-warning`, `--color-danger`, `--color-info`, `--color-exception`, `--color-agent`, `--color-presence-*`) reconciles cleanly with Master Spec §3 component implementations. Grade-color tokens (FM=`--color-success` / PM=`--color-warning` / DNM=`--color-danger` / EX=`--color-exception`) align with the canonical Sourcera grade vocabulary at Appendix J `requirement_score_grade`.

- **§5.2.13 FormField + §5.2.19 PipelineSurface cite bare `--color-border` ⚠** — UX §2.2 declares `--color-border-default` and `--color-border-strong` only; the bare token is undefined. Tokens Studio Figma round-trip cannot resolve an undefined token; CSS falls through to browser default. → **D-14.4-002 (P2)**.
- **Dark Mode paragraph at line 168 declares "all color tokens have dark-mode equivalents" with NO hex value table ⚠** — Master Spec §3.11 Dark Mode Parity Rules requires per-token contrast verification (WCAG 1.4.3 ≥ 4.5:1); without the values, UX §11.6 A-01 contrast verification is impossible. The Figma-to-CSS dark-mode export produces an empty `:root[data-theme="dark"]` block. → **D-14.4-009 (P2; near-P1 in strict-interpretation list)**.

### UX §2.3 Spacing Scale → 1 new defect (D-14.4-007)

The `--space-{1..12}` scale (4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48) reconciles cleanly with Master Spec §3.6.1 (`--space-1`, `--space-3`, `--space-4`, `--space-6` consumed by token reference). The scale itself is correct.

- **§5.2 component specs systematically use literal pixel values rather than `--space-N` tokens ⚠** — Modal Body 24px / DiffViewer panel headers 24px / multiple inline `8px` / `12px` / `16px` values. Master Spec §3.6.1 line 2378 uses canonical token form `--input-group-gap | --space-4 (16px)`; UX §5.2 specs do not. Tokens Studio export cannot detect drift on inline literals. → **D-14.4-007 (P2)**.

### UX §2.4 Elevation & Shadows → No new defects

5-level shadow scale (Flat / Raised / Floating / Overlay / Topmost) reconciles cleanly. No defects.

### UX §2.5 Border Radius → No new defects

5-token radius scale (`--radius-sm` 4px / `--radius-md` 6px / `--radius-lg` 8px / `--radius-xl` 12px / `--radius-full` 9999px) reconciles cleanly with §3.6.1 (`--input-radius = --radius-md`). No defects.

### UX §2.6 Motion & Transitions → 3 new defects (D-14.4-004, D-14.4-010, D-14.4-011)

9-property motion table (Color/opacity 150ms / Side Peek 200ms / Modal open 200ms / Modal close 150ms / Toast enter 200ms / Toast exit 150ms / Skeleton 1500ms / Command Palette 150ms / Dropdown 100ms) reconciles cleanly at the per-property level. The `prefers-reduced-motion: reduce` contract is preserved at the section's closing paragraph.

- **§5.2.15 SLATimer breached-state `0.6s pulse` ⚠** — 600ms is NOT in the §2.6 motion table (100 / 150 / 200 / 1500ms only); 32px badge height ALSO undocumented in `--input-height-*` scale (28/36/44). The pulse cannot be reduced-motion-suppressed because it bypasses the token scale. → **D-14.4-004 (P2)**.
- **§5.2.19 PipelineSurface references `motion.duration.medium` (240ms) and `motion.ease.standard` ⚠** — neither token is registered in §2.6 (which uses per-property naming, not named-token form). 240ms is not in the duration list. The dot-namespaced token convention conflicts with the per-property convention. → **D-14.4-010 (P2; near-P1 in strict-interpretation list)**.
- **§5.2.11 Modal open animation `scale 0.9 → 1` ⚠** — contradicts §2.6 line 212 "Scale from 95%". Cross-section drift within UX v2; same animation, two different start-scale values. → **D-14.4-011 (P2)**.

### UX §2.7 Iconography → No new defects

Lucide Icons baseline; 20px / 16px / 24px size scale; 48×48 touch target per WCAG / §37.1; grade icons (checkmark-circle FM / half-circle PM / x-circle DNM / minus-circle EX) reconcile with §2.2 grade colors. Phase icons numbered circle badges 1–13 align with §3.3 and §5.2.19 PipelineSurface. No defects.

### UX §2.8 Z-Index Scale → 1 new defect (D-14.4-008)

10-layer scale (Base 0 / Sticky 10 / Sidebar 20 / Side Peek 30 / Dropdown 40 / Toast 50 / Modal Backdrop 60 / Modal 70 / Command Palette 80 / Tooltip 90 / Topmost 100) reconciles cleanly with Master Spec §3 component implementations.

- **§5.2.17 AmendmentBanner assigned `z-index: 50` ⚠** — collides with Toast layer per §2.8. AmendmentBanner is a sticky in-page element and should occupy Sticky (10) or a new Sticky Banner layer between Sidebar (20) and Side Peek (30). Undefined paint order when banner and toast are concurrently visible. → **D-14.4-008 (P2)**.

### UX §2.9 Form & Input Tokens → 2 new defects (D-14.4-003, D-14.4-006)

10-row token sub-table mirrors Master Spec §3.6.1 (which carries the canonical 25-token table). D-3UX-017 (P3 pre-filed) covers the cross-doc duplication; the `ux_token_drift_check` CI gate (§50.17.4) is the policy enforcement mechanism.

- **§5.2.12 Dropdown menu items + §5.2.13 FormField textarea/select at `40px` height ⚠** — not in the 28/36/44 `--input-height-{sm,md,lg}` scale; 40px sits between the registered `--input-height-md` (36px) and `--input-height-lg` (44px) with no token home. → **D-14.4-003 (P2)**.
- **§5.2.13 FormField help-text + error-text at `8px margin-top` ⚠** — Master Spec §3.6.1 line 2377 authoritatively defines `--input-helper-gap = --space-1 = 4px`. The 8px UX value is 2× the canonical 4px. → **D-14.4-006 (P2)**.

### UX §3.1–§3.7 Global Application Structure + Navigation → No new defects (D-3UX-003 pre-filed for Side Peek width)

Application Shell, Sidebar Anatomy, Console Switcher, Responsive Layouts, Page Header Pattern, Navigation Model, Keyboard Shortcut Reference reconcile with Master Spec §3.8 + §3.10 + §50 + Appendix B Keyboard Shortcut Reference. D-3UX-003 P2 pre-filed for Side Peek default width drift (420px UX vs 480px Master Spec).

### UX §5.2 Component System Specification → 10 of 12 net-new defects route here

10 existing components (DataTable / SidePeek / CommandPalette / ScoringCard / MarkdownEditor / ToastNotification / GradeBadge / PresenceIndicator / EmptyState / AgentAttribution) preserved without modification. 9 v2-additions reviewed end-to-end. Net-new defects D-14.4-001 / -002 / -003 / -004 / -005 / -006 / -007 / -008 / -010 / -011 route to §5.2 component spec rewrites in the v7.1.1 hygiene pass.

### UX §11.6 Accessibility Acceptance Criteria → 1 new defect (D-14.4-012)

A-01 (WCAG 1.4.3 contrast ratio ≥ 4.5:1) / A-04 (keyboard navigation) / A-05 (focus indicators) / A-06 (form labels) / A-07 (semantic HTML) / A-08 (screen reader) / A-10 (skip-to-main) / A-11 (ARIA landmarks) / A-12 (form input labels) reconcile to Master Spec §3.6.6 / §3.7 / §3.8 / §3.10 / §3.11 / §3.12 accessibility contracts.

- **AC A-09 uses `A/B/C/D` grade-badge vocabulary ⚠** — contradicts canonical FM/PM/DNM/EX vocabulary per Appendix J `requirement_score_grade` enum + UX §2.7 grade icons + Master Spec §4 / §11 / §13 scoring sections. A QA engineer authoring an Axe-core test from A-09 would produce a fixture against non-existent DOM markers; test passes against the wrong target. → **D-14.4-012 (P2; near-P1 in strict-interpretation list)**.
- **A-01 contrast verification ⚠** — dependent on D-14.4-009 Dark Mode palette absence (verification impossible without dark-mode hex values).

---

## 4. Counterfactual Pass — Failure Modes Per Defect

Per `Audit_Prompts.md → MODEL EXPECTATIONS`, every defect's surrounding feature is walked for at least 3 realistic failure modes; if a failure mode is unhandled, an additional defect is filed.

### D-14.4-001 — Heading 3 / Heading 4 undefined

1. **Engineering picks wrong font size.** Reads "Heading 4" as 14px Body; Modal title becomes indistinguishable from Modal body; visual hierarchy collapses. **Mitigated by recommendation option (b)** — rewrite to cite existing roles.
2. **Designer authors Heading 4 in Figma in isolation.** 16px / weight 400 pushed via Tokens Studio without coordinating with Master Spec; Modal title renders with wrong weight. **Mitigated by recommendation option (a) + AE ratification.**
3. **Accessibility audit fails on A-08.** Semantic HTML h1–h6 mapping expects Modal title → `<h2>` or `<h3>`; without a typography role bound to a heading level, semantic structure drifts. **Mitigated by recommendation: register roles with semantic heading-level binding.**

### D-14.4-002 — Bare `--color-border` undefined

1. **Tokens Studio Figma export silently drops the bare token.** CSS falls through to browser default (typically `currentColor` or `#000`); form fields render with black borders in dark mode. **Mitigated by recommendation.**
2. **Engineer reading §5.2.13 picks `--color-border-strong` (incorrect intent).** Form fields render with `#D1D5DB` borders rather than `#E5E7EB`; visual density drifts heavier than design intent. **Mitigated by recommendation.**
3. **`ux_token_drift_check` CI gate passes silently.** Regex detector doesn't fire because `--color-border` IS a valid token *prefix* per `--color-border-default` and `--color-border-strong`. **Mitigated by `ux_color_token_resolved` validator addition.**

### D-14.4-003 — 40px input height absent from token scale

1. **Engineering implements 40px literal in DropdownMenu component.** Tokens Studio Figma export does not contain 40px (no token references it); Figma-to-code parity check fails silently. **Mitigated by option (b) rewrite to `--input-height-md` 36px.**
2. **Engineer reading §5.2.13 textarea/select height picks 40px literal.** Textarea ships at 40px in one render path, 36px in another; layout density inconsistent across forms. **Mitigated by recommendation.**
3. **A11y touch-target check.** 40px height meets WCAG 2.5.5 minimum (44px) for desktop, but mobile (per §38 + §37.1) requires 44×44 minimum — 40px breaks mobile touch-target compliance. **Mitigated by option (a) registering `--input-height-menu-item` 40px scoped to desktop only OR option (b) using `--input-height-md` 36px and gating mobile to `--input-height-lg` 44px.**

### D-14.4-004 — SLATimer 0.6s pulse + 32px badge undocumented

1. **`prefers-reduced-motion: reduce` does not disable the pulse.** Token bypasses motion scale; reduced-motion users see unintended animation. Accessibility regression. **Mitigated by recommendation extending reduced-motion contract.**
2. **Pulse duration drifts.** Designer changes 0.6s → 0.8s in Figma; implementation stays at 0.6s; visual regression. **Mitigated by `--motion-duration-pulse` token registration.**
3. **32px badge height not in `--input-height-*` scale.** Subject to inline-pixel-literal drift across SLATimer + GradeBadge + status badge family. **Mitigated by `--badge-height-md` token registration.**

### D-14.4-005 — FormField Label tracking 0.5px vs 0.02em

1. **QA Playwright test asserts Caption tracking 0.02em globally.** FormField labels fail; engineering reverts vs. spec edit coin-flip. **Mitigated by rewriting §5.2.13 to cite Caption role.**
2. **Tokens Studio Figma export includes 0.02em from §2.1 but Figma component override on FormField label specifies 0.5px.** Designer-vs-implementation drift. **Mitigated by recommendation.**
3. **If a tighter tracking IS genuinely desired for form labels** (legibility argument at 12px size), the response is to register a new `Form Label` typography role with explicit 0.04em (≈0.5px at 12px). **Mitigated by alt-path recommendation.**

### D-14.4-006 — Helper-gap 8px vs 4px

1. **Engineering implements 8px per UX §5.2.13.** Every form field across the app renders with double the helper-gap; mobile responsive layouts (per UX §3.4 tablet < 1024px) overflow. **Mitigated by recommendation citing `--input-helper-gap`.**
2. **QA writes Playwright test expecting `--input-helper-gap` from §3.6.1.** Test fails against 8px implementation; engineering revert vs. spec edit coin-flip. **Mitigated by recommendation.**
3. **Tokens Studio Figma export contains 4px (per §3.6.1) but implementation uses 8px (per §5.2.13).** Figma-to-code parity check fails. **Mitigated by `ux_helper_gap_4px_single_source` regex-detector validator.**

### D-14.4-007 — Literal pixel values bypass `--space-N` token scale

1. **Designer changes `--space-4` from 16 → 20 globally (e.g., to widen layout density).** Inline-pixel-literal component specs do not pick up the change; layout inconsistent across surfaces. **Mitigated by `ux_spacing_token_single_source` validator.**
2. **Mobile responsive scale.** §38 mobile spacing scale may differ from desktop; literal pixel values cannot scale. **Mitigated by token consumption.**
3. **Figma → code round-trip silently drifts.** Tokens Studio doesn't detect inline pixels. **Mitigated by validator addition.**

### D-14.4-008 — AmendmentBanner z-index 50 collides with Toast

1. **AmendmentBanner + Toast concurrent visibility.** A workspace with both a sticky AmendmentBanner and a Toast (e.g., "Amendment requires re-submission") renders both at z-index 50; undefined paint order. **Mitigated by recommendation reassigning banner to Sticky 10 or new Sticky Banner 25.**
2. **Toast dismissal interaction.** User clicks "X" on Toast but click resolves to AmendmentBanner (or vice versa) depending on stacking; user-facing behavior unpredictable. **Mitigated by recommendation.**
3. **Mobile responsive stacking.** Mobile layout may compose Toast + Banner stacking differently; z-index conflict cascades. **Mitigated by `ux_z_index_token_single_source` validator.**

### D-14.4-009 — Dark Mode palette absent (22 hex values missing)

1. **Engineering ships dark-mode CSS with no tokens.** Entire app renders as light-mode-on-dark-background (white text on white background within dark surrounding); unusable. **Mitigated by recommendation authoring 22-row table.**
2. **Per-token WCAG 1.4.3 contrast verification cannot run.** A-01 fails; multiple tokens ship below 4.5:1; legal accessibility exposure. **Mitigated by Axe-core verification in `ux_dark_mode_palette_completeness` validator.**
3. **User with `prefers-color-scheme: dark` opens app.** Side Peek renders with `--color-bg-elevated: #FFFFFF` because no dark-mode override exists; white-on-white invisible. **Mitigated by recommendation.**

### D-14.4-010 — `motion.duration.medium` / `motion.ease.standard` unregistered

1. **240ms hidden in PipelineSurface; not visible anywhere else.** Designer searching for "where is medium duration defined" finds only §5.2.19; cannot reason about reuse. **Mitigated by recommendation migrating §2.6 to named-token form.**
2. **Reduced-motion contract.** Named tokens not in §2.6 cannot be suppressed by the §2.6 `prefers-reduced-motion: reduce` rule. **Mitigated by recommendation.**
3. **Tokens Studio Figma round-trip.** Dot-namespaced tokens incompatible with per-property registry; export fails or produces incomplete CSS. **Mitigated by `ux_motion_duration_token_resolved` validator.**

### D-14.4-011 — Modal open scale 0.9 vs 0.95

1. **Engineering builds 0.9 per §5.2.11.** Modal "pop-in" feels heavier than intended; visual regression vs. Figma source. **Mitigated by recommendation citing §2.6 contract.**
2. **QA visual-regression test takes screenshot at mid-animation.** 0.9 vs 0.95 produces different pixel diff; test flakes. **Mitigated by recommendation.**
3. **Cross-platform parity.** macOS / Windows / mobile render scale animations with subtle differences at 0.9 vs 0.95; perceptual drift. **Mitigated by recommendation.**

### D-14.4-012 — A/B/C/D vs FM/PM/DNM/EX grade vocabulary

1. **Color-blind simulation QA test from A-09.** Produces fixture with grade-A through grade-D DOM markers; test passes trivially against fixture that doesn't reflect production; production color-blind regression slips. **Mitigated by `ux_grade_vocabulary_single_source` regex-detector.**
2. **New engineer refactors GradeBadge to expose `A/B/C/D` props.** Production breaks across §4 / §11 / §13 / Appendix J consumers. **Mitigated by recommendation rewriting AC + validator addition.**
3. **Customer-success documentation reads `A/B/C/D` and publishes external-facing docs with wrong vocabulary.** Sellers and buyers see grade-A in docs but FM in product; positioning incoherence. **Mitigated by recommendation.**

All 36 failure modes (3 per defect × 12 defects) addressed by the existing recommendation set OR by sibling defects in the cluster. No additional defects filed.

---

## 5. Self-Challenge Pass (Hostile-Reviewer Persona)

Re-reading findings as a hostile staff engineer prepping engineering, design, QA, and accessibility for v7.1.1 sign-off.

### 5.1 Severity Classifications — Are They Rule-Based?

Per `Audit_Prompts.md → Prompt 14.4` classification rule: "P2 typically; P1 if a UX contract is unimplementable as written."

- **D-14.4-001 / -003 / -004 (undefined tokens P2).** Hostile reviewer: *"Token cited but not defined — structurally P1 'feature unbuildable as written.'"* Counter: every defect has TWO buildable resolution paths (option a — register; option b — rewrite to existing). P1 is reserved for cases where no buildable resolution exists; P2 is correct for ambiguous-but-resolvable. **D-14.4-001 and D-14.4-010 are closest to P1; recorded in strict-interpretation list.**
- **D-14.4-006 (helper-gap 4px vs 8px P2).** Hostile reviewer: *"Numerical-singleton drift between Master Spec §3.6.1 and UX v2 §5.2.13 — P1 numerical_singleton."* Counter: Severity rule reserves P1 numerical_singleton for "conflicting numerical singleton between Master Spec and a companion strategy doc" — companion strategy docs are BPS / SPS. The UX v2 drift is buildable (either value renders a usable form); P2 stands.
- **D-14.4-008 (z-index collision P2).** Hostile reviewer: *"Stacking conflict between Toast and AmendmentBanner breaks a primary UX contract — P1."* Counter: visual layering glitch is P2 ambiguity, not P1 unbuildable. Both components render; user can dismiss either; no functionality lost.
- **D-14.4-009 (Dark Mode palette absent P2).** Hostile reviewer: *"Entire dark-mode visual design is structurally undefined — P1 'surface introduced without an Appendix-M row' equivalent."* Counter: dark mode is referenced in §2.2 + Master Spec §3.11 authoritatively rules dark mode parity; the contract exists, only the concrete values are missing from the paired-mirror surface. Gap is paired-mirror coverage, not absence-of-contract. P2 stands.
- **D-14.4-012 (A/B/C/D vs FM/PM/DNM/EX P2).** Hostile reviewer: *"AC A-09 is unbuildable verbatim — QA produces test against non-existent fixture. P1."* Counter: AC IS unbuildable verbatim, BUT the resolution is unambiguous (replace via regex). Pragmatic P2 stands because the regex-detector validator forecloses the failure mode; strict P1 recorded.

All 12 severity classifications hold under hostile review. **Strict-interpretation P1 list: D-14.4-001 / D-14.4-010 / D-14.4-012 (3 defects).** Pragmatic-interpretation P2 list: 12 defects (all). Recommendation stands at P2 per the audit prompt's classification rule.

### 5.2 Evidence Reproducibility

Each defect's `evidence` column quotes UX v2 line numbers and spec section anchors that were personally walked. A reviewer can re-open UX v2 at the cited line and Master Spec at the cited §-anchor and reproduce the gap. ✅ Evidence is reproducible.

### 5.3 Recommendation Sharpness

Each defect's `recommendation` column names a specific section to rewrite, the token/role to register or cite, and the CI gate validator to wire (`ux_helper_gap_4px_single_source` / `ux_spacing_token_single_source` / etc.). A junior engineer with read access can implement the recommendation without further clarification. ✅ Recommendations are sharp.

### 5.4 Cross-Defect Consistency

- D-14.4-002 / -005 / -006 / -007 / -008 / -011 / -012 are all UX v2 narrative-edit defects routable to a single v7.1.1 hygiene mechanical-pass Cowork session.
- D-14.4-001 (option a) / D-14.4-003 (option a) / D-14.4-004 / D-14.4-009 / D-14.4-010 are Master Spec authoring-extension defects routable to a single AE-ratification Cowork session.
- D-14.4-010 (named motion-token registry) is a prerequisite for D-14.4-004 (motion-duration-pulse token registration) — the migration to named-token form should land first, then the pulse token registers in the named registry.
- D-14.4-009 (dark-mode palette) and D-3UX-020 (per-surface state catalog has no dark-mode column) are paired; combined remediation should produce a coherent dark-mode parity authoring pass.

### 5.5 Counterfactual Pass Sub-Defects Tracked Inline

The counterfactual pass surfaced no escalation-threshold sub-defects beyond the 12 already filed. The "alt-path" recommendations (e.g., D-14.4-005 alt — register `Form Label` typography role; D-14.4-008 alt — register Sticky Banner z-index 25) are within the original defect's recommendation scope and require no separate filing.

### 5.6 Halt-Rule Application Discipline

Per `Audit_Prompts.md → Prompt 14.4` audit prompt classification rule: "P2 typically; P1 if a UX contract is unimplementable as written." Pragmatic interpretation applied per Phase 34.PXC / Phase 14.1 / Phase 14.2 / Phase 14.3 precedents. None of the 12 P2 defects blocks v7.1.1 stamp under the narrow rule (zero P0 firewall / residency / billing). All 12 route into the v7.1.1 hygiene mechanical pass + AE ratification queue. Strict-interpretation P1 list (D-14.4-001 / -010 / -012; 3 defects) recorded for v7.1.1 backlog completeness; recommendation stands at pragmatic P2.

---

## 6. Decision Trace — What Was NOT Filed (And Why)

| Considered concern | Why not filed |
|---|---|
| UX §2.4 Elevation & Shadows 5-level scale | Reconciles cleanly with Master Spec §3 + §38 component shadow usage. No drift. |
| UX §2.5 Border Radius 5-token scale | Reconciles cleanly with §3.6.1 (`--input-radius = --radius-md`). No drift. |
| UX §2.7 Iconography Lucide baseline | Reconciles cleanly with §37.1 touch-target sizing + §2.2 grade colors. No drift. |
| UX §3.2 Sidebar Anatomy + §3.3 Console Switcher | Reconciles with §3.8 navigation model + §50 Ops Console patterns. No drift. |
| UX §3.5 Page Header Pattern | Reconciles with §3.8 navigation surface contracts. No drift. |
| UX §5.2 existing 10 components (DataTable / SidePeek / CommandPalette / ScoringCard / MarkdownEditor / ToastNotification / GradeBadge / PresenceIndicator / EmptyState / AgentAttribution) | Preserved without modification from v1.x; previously walked in PHASE3_SECTION3 (Phase 3UX). No re-walk drift. |
| UX §11.6 A-01 through A-08, A-10, A-11, A-12 | Reconcile cleanly with Master Spec §3.6.6 / §3.7 / §3.8 / §3.10 / §3.11 / §3.12 accessibility contracts. No drift. |

---

## 7. Sign-Off

- **Phase 14.4 walk completed.** 12 net-new defects filed (D-14.4-001 through D-14.4-012; all P2 under pragmatic interpretation; 3 of 12 escalate to P1 under strict interpretation — D-14.4-001 / D-14.4-010 / D-14.4-012). 4 pre-existing defect cross-references confirmed (D-3UX-003 / D-3UX-017 / D-3UX-019 / D-3UX-020). Audit posture preserved (non-destructive; Master Spec wins per CLAUDE.md §2).
- **Counterfactual pass completed.** 36 failure-mode considerations across 12 defects; no sub-defect met the escalation threshold; all "alt-path" recommendations are within the original defect's scope.
- **Self-challenge pass completed.** All 12 severity classifications hold under hostile review; evidence is reproducible; recommendations are sharp; cross-defect consistency holds; halt-rule pragmatic interpretation defensible; strict-interpretation P1 list (3 defects) recorded for v7.1.1 backlog completeness.
- **Outputs.** `_audit/CONSISTENCY_DELTA.md → "UX Design v2"` heading appended (~12 KB; lines 673–817). `_audit/DEFECT_LEDGER.md → Phase 14.4` block appended (~30 KB; 12 defect rows + roll-up + counterfactual + self-challenge + sign-off; lines 5447–5506).
- **v7.1.1 stamp gate inherits.** D-14.4-001 through D-14.4-012 closure + 5 AE row ratifications (typography roles / `--input-height-menu-item` / badge + motion-pulse tokens / dark-mode palette / named motion-token registry) + 10 new CI gate validators wired into `ux_token_drift_check` (§50.17.4) + UX v2 mechanical edits across §2.1 / §2.2 / §2.6 / §2.8 / §2.9 / §5.2.11 / §5.2.12 / §5.2.13 / §5.2.15 / §5.2.16 / §5.2.17 / §5.2.18 / §5.2.19 / §11.6.
- **Phase 14.5 (Authored Extensions Ledger Ratification) is unblocked** — no Phase-14.4 P0 / P1 halt; the 5 new AE rows queued by Phase 14.4 join the v7.1.0 + v7.1.x AE ratification queue at `_integration/AUTHORED_EXTENSIONS_LEDGER.md`.

---

## 8. Cross-References

- **CONSISTENCY_DELTA.md "UX Design v2" block:** `_audit/CONSISTENCY_DELTA.md` lines 673–817 (12 KB; check-result summary table, section-by-section walk, roll-up by severity, halt-rule application, authoritative resolution, recommended bulk remediations, Phase 14 canonicalization pass note).
- **DEFECT_LEDGER.md Phase 14.4 block:** `_audit/DEFECT_LEDGER.md` lines 5447–5506 (12 defect rows D-14.4-001 through D-14.4-012; severity / class distribution; authoritative resolution; halt-rule policy; pre-existing cross-references; CI gate additions; AE Ledger queue; counterfactual pass; self-challenge pass; sign-off verdict).
- **V14 verification record:** `_audit/PHASE14V_FINDINGS.md` § 1 (structural verdict marks 14.4 ⚠ PASS-with-defect citing D-V14-001 for this scratch-log absence); `_audit/DEFECT_LEDGER.md` Phase V14 block (D-V14-001 status transitions `open → remediated` upon authoring of this file).
- **Phase 14.5+ next steps:** AE Ratification (Phase 14.5 → `_audit/AE_RATIFICATION_RECOMMENDATIONS.md`); Decisions Resolution (Phase 14.6 → `_audit/DECISIONS_STATUS_REPORT.md`); v7.1.1 Backlog Status (Phase 14.7 → `_audit/V711_READINESS.md`). All three downstream walks completed 2026-05-12 and unaffected by this retroactive 14.4 scratch log.
