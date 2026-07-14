# Sourcera — Product UX & UI Specification

**Version:** 2.0.0
**Date:** 2026-04-11
**Status:** Production-Ready Specification
**Companion To:** Sourcera Master Specification v6.0.0

---

## Table of Contents

1. [Product UX Principles](#1-product-ux-principles)
2. [Design System Foundation](#2-design-system-foundation)
3. [Global Application Structure](#3-global-application-structure)
4. [Product Page Specifications](#4-product-page-specifications)
5. [Component System Specification](#5-component-system-specification)
6. [Collaborative UX](#6-collaborative-ux)
7. [AI UX — All 21 Agent Capabilities](#7-ai-ux)
8. [SaaS Operational Surfaces](#8-saas-operational-surfaces)
9. [States & Edge Cases](#9-states--edge-cases)
10. [Insertion Mapping](#10-insertion-mapping)
11. [Acceptance Criteria](#11-acceptance-criteria)

---

# 1. Product UX Principles

## 1.1 Design Posture

Sourcera is an enterprise procurement operating system. The design language is minimal, restrained, efficient, high-signal, and operationally serious. The benchmark is Linear: keyboard-first, dense where density improves expert efficiency, zero decorative complexity, calm confidence throughout.

Every screen must pass a single test: does this help the user understand, decide, act, collaborate, review, or recover? If a surface does not serve one of those six verbs, it does not belong.

## 1.2 Core UX Principles

**Principle 1 — Keyboard-First, Mouse-Optional.** Every primary workflow is completable via keyboard. Command Palette (`Cmd+K`) is the universal accelerator. Shortcuts are discoverable, consistent, and phase-aware. Mouse and touch are supported but never required for power users. (Derived from Master Spec §3: The Linear Constraint.)

**Principle 2 — Progressive Disclosure by Phase.** The 13-phase pipeline is the primary sequencing mechanism. UI surfaces, actions, and navigation items appear only when their phase is active or relevant. Phase-locked content is visible but clearly non-interactive. Users never see controls they cannot use without understanding why. (Derived from Master Spec Section 10.)

**Principle 3 — Console Isolation is Absolute.** Buyer Console and Seller Console are completely separate data domains. No UI element, navigation path, search result, or API response ever leaks data across console boundaries. The console context is always visible. Console switching is explicit and requires a full context reload. (Derived from Master Spec Sections 1, 25.)

**Principle 4 — Optimistic Mutations with Transparent Rollback.** All CRUD operations apply immediately in the UI. If the server rejects the mutation, the UI reverts the change, shows a toast explaining the failure, and restores the previous state. The user never waits for a spinner on routine actions. (Derived from Master Spec Section 3.3.)

**Principle 5 — Information Density Over Whitespace.** Expert users need to scan, compare, and decide quickly. Tables, matrices, and data-dense views are the default. Generous whitespace is reserved for onboarding and empty states, not for operational screens. Every pixel on the operational surface earns its space. (Derived from Master Spec Sections 11, 13, 14.)

**Principle 6 — Real-Time as Default.** Convex subscriptions power all collaborative surfaces. Scoring, comments, presence indicators, phase advancement, and response submissions reflect in real-time without polling or manual refresh. Stale data is a UX defect. (Derived from Master Spec Sections 12, 18.)

**Principle 7 — AI as Co-Pilot, Not Autopilot.** The Sourcera Agent suggests, drafts, and pre-scores. It never commits changes without explicit user confirmation. Agent outputs are always clearly attributed, confidence-scored, and editable. The human retains final authority on every decision. (Derived from Master Spec Section 21.)

**Principle 8 — Fail Loudly, Recover Gracefully.** Errors are never silent. Every failure state includes: what happened, why, and what the user can do next. Destructive actions require confirmation. Soft deletes have recovery windows. The system protects the user from irreversible mistakes. (Derived from Master Spec Sections 3.3, 7, 10.)

## 1.3 Interaction Model Summary

The eight core interaction patterns from the Linear Constraint (Master Spec Section 3) govern all UI behavior:

| Pattern | Mechanism | Application |
|---------|-----------|-------------|
| Inline Edit | Click-to-edit cells, `Enter` to save, `Escape` to cancel | Requirement titles, weights, descriptions |
| Side Peek | Right panel slides open on `Enter` or row click; `Escape` to close | Requirement detail, vendor detail, response detail |
| Command Palette | `Cmd+K` opens global fuzzy search; context-aware filtering | Navigation, actions, entity search, simulation entry |
| Bulk Actions | `Shift+Click` range select, `Cmd+A` select all, toolbar appears | Requirement reassignment, bulk delete, bulk status change |
| Optimistic Mutation | Immediate UI update, server validation, rollback on failure | All create/update/delete operations |
| Keyboard Nav | `J`/`K` row traversal, number keys for scoring, `Tab` for field focus | Matrix navigation, scoring workflow, form completion |
| Toast Feedback | Non-blocking notifications for success, warning, error | Save confirmation, rollback alerts, permission denials |
| Skeleton Loading | Content-shaped placeholders during initial data fetch | Page loads, panel transitions, search results |

## 1.4 First-30-Seconds Test

The First-30-Seconds Test is the operational quality gate for Master Spec §3.13 Principle 9 (Surface Simplicity, Engine Complexity). It binds every UI surface authored in this specification — buyer console, seller console, marketplace, public marketing, settings, billing, admin — to a single acid test:

> Would a panicked first-timer understand this surface element in the first 30 seconds with no training?

If the answer is no, the surface element belongs in the engine, not on the surface, and must be re-scoped before merge. The test is co-equal with the eight Core UX Principles (§1.2) and the eight Core Interaction Patterns (§1.3); it is not optional, not advisory, and not graded on a curve.

### 1.4.1 Required Sub-Section in Every New Surface Spec

Every UI surface authored in this specification MUST include a "First 30 Seconds" sub-section that documents, in this exact order:

1. **What the user sees on the screen** (1–2 sentences). Concrete description of what is visually present at first paint — headings, primary CTA, key data, layout regions. No engine vocabulary. If the description requires naming a Sourcera-specific concept (e.g., `pipeline_stage_id`, "Capability Declaration," "AIOperation," "Match Score," "KB Health Model," "OutcomeContract," "Defense Record," "EvalStarter," "Bid Workspace populator," "SellerOnboardingSession") the surface fails this test.
2. **What they understand without training** (1 sentence, written in the user's voice or close paraphrase). The mental model the surface produces in the first 30 seconds, expressed in plain English. If the sentence cannot be written without referencing a Sourcera concept the user has never seen before, the surface fails.
3. **What they do next** (1 action). The single most likely first action — click a CTA, type into an input, scroll to a region. Not a menu of options; the canonical first move. If the user has more than one obvious first move, the surface is over-affordant and must be simplified.
4. **What is hidden and why** (cross-reference to the Appendix M row(s) that codify the hide). Every engine concept the surface deliberately suppresses is listed by name with its Appendix M row reference. This bullet is the bidirectional contract: the surface declares what it is hiding, and Appendix M binds that hide to the engine concept's spec home.

The four bullets are the entire required structure. They are not negotiable in number, order, or granularity. Cross-references to Master Spec §3.13 (Principle 9) and Appendix M (Surface/Engine Mapping) are mandatory in the sub-section.

### 1.4.2 Over-Engineering Trip-Wire

If the documented 30 seconds requires the user to learn a Sourcera-specific concept to answer any of the first three bullets, the surface is over-engineered and must be re-scoped before merge. Re-scoping options, in priority order:

1. **Move the concept into the engine.** If the user does not need to make a judgment about the concept, hide it; the engine's job is to compute the right answer, not to teach the concept.
2. **Compress the concept into domain-native surface vocabulary.** If the user must act on the concept, render it using vocabulary the user already knows (e.g., Buyer Setup → Define → Score → Decide instead of Phase 1 → … → Phase 13; "47 drafts prepared · 31 cite evidence · 16 ready to review" instead of "AIOperation result counts and Capability Declaration coverage").
3. **Bind the concept to a Conversion Moment.** If the concept is intentionally exposed only on a paid tier or only after the Hero Moment lands, document the bind in §22.20 / §48.8.6 (sellers) or §13.11 / §13.12 (buyers) and confirm the surface is invisible until the bind triggers.

A surface cannot ship by adding tooltips, in-app guides, onboarding modals, or "Learn more" links to teach the missing concept. Adding teaching scaffolding is itself a §3.13 violation per §48.8.7 anti-patterns.

### 1.4.3 CI-Gate Note

PRs introducing a new UI surface MUST include a "First 30 Seconds" sub-section conformant to §1.4.1; missing test = PR blocked. The CI gate `first_30_seconds_test_present_on_new_ux_surface` asserts that any diff against `UX_Design_of_Sourcera.md` which introduces a new `### N.N.N` component spec, a new `#### {Surface Name}` sub-section under an existing component, or a new `## N.N` chapter sub-section contains a "First 30 Seconds" sub-section with the four required bullets and the mandatory cross-references to Master Spec §3.13 and Appendix M. The gate is a hard block, not a warning.

The gate's specificity is the point: it does not validate the *quality* of the test (that is human-judgment work in code review), but it does validate that the test exists, has the required structure, and links to the engine-binding contract. A PR that ships a new surface without a First-30-Seconds Test is structurally non-conformant; the absence is a defect equivalent to shipping a new entity without a field table or a new endpoint without acceptance criteria.

A companion Master Spec CI gate (`appendix_m_no_inline_engine_concepts_in_ux_spec`) already enforces that every engine concept named on a UX surface either resolves to an Appendix M row or is named only inside a "Hidden" bullet of a First-30-Seconds Test sub-section. Together the two gates are the bidirectional contract: surfaces cannot leak engine vocabulary, and engine concepts cannot ship without a documented surface story (or a documented internal-only justification).

### 1.4.4 Retro-Documentation of v7.1.0 Surfaces

The four UI surfaces authored in v7.1.0 prior to Phase 14.17 each carry a retro-documented "First 30 Seconds" sub-section in their respective home:

| Surface | Home | Phase |
|---|---|---|
| Buyer Maya onboarding — "What Are You Evaluating?" Intake | `UX_Design_of_Sourcera.md` Phase 14.7 intake sub-section (under §4.4.x onboarding family) | 14.7 |
| Defense View | `UX_Design_of_Sourcera.md` §4.2.13 | 14.5 |
| Compressed pipeline progress bar (PipelineSurface) | `UX_Design_of_Sourcera.md` §5.2.19 | 14.6 |
| Seller Maya magic-link Hero Moment landing | `UX_Design_of_Sourcera.md` Phase 14.8 polish sub-section, Screen 1 | 14.8 |

Each of the four sub-sections follows the §1.4.1 four-bullet structure and cites Master Spec §3.13 (Principle 9) and the relevant Appendix M row(s). The Phase 14.8 sub-section additionally cross-references the existing five-screen "First-30-Seconds Test self-check" at the close of the Phase 14.8 polish (which audits Screens 2–5 in narrative form). Future v7.X surface-authoring phases (Marketplace-as-RFP-Exchange, additional per-vertical Eval Starters, Solo billing surfaces beyond §8.1.2, any new Conversion Moment surface) inherit the §1.4.1 obligation by default.

### 1.4.5 Cross-References

Master Spec §3.13 — Principle 9 (Surface Simplicity, Engine Complexity), the binding constraint enforced by this test. Master Spec Appendix M — Surface/Engine Mapping, the canonical contract the test cites in its fourth bullet. Master Spec §48.8.7 — Banned Onboarding Anti-Patterns, the seller-side enforcement catalog. Master Spec §22.20 — Seller Maya Surface Abstraction, which compresses the seller engine into domain-native vocabulary on every surface. Master Spec §13.11 (Defense View) and §13.12 (Per-Vertical Eval Starters) — the buyer-side surfaces authored under Principle 9. `Integration_Prompts_v7.1.md` Phase 14.17 — the integration-program phase that authored this section.

---

# 2. Design System Foundation

## 2.1 Typography

**Typeface:** Inter (system font stack fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).

| Role | Size | Weight | Line Height | Tracking | Usage |
|------|------|--------|-------------|----------|-------|
| Display | 24px / 1.5rem | 600 (SemiBold) | 1.2 | -0.02em | Page titles (Workspace name, Settings header) |
| Heading 1 | 20px / 1.25rem | 600 | 1.3 | -0.01em | Section headers (Use Case name, Phase name) |
| Heading 2 | 16px / 1rem | 600 | 1.4 | 0 | Sub-section headers (Requirement group, component headers) |
| Body | 14px / 0.875rem | 400 (Regular) | 1.5 | 0 | Primary content (requirement text, response text, comments) |
| Body Small | 13px / 0.8125rem | 400 | 1.5 | 0 | Secondary content (metadata, timestamps, helper text) |
| Caption | 12px / 0.75rem | 500 (Medium) | 1.4 | 0.02em | Labels, badges, table headers, status indicators |
| Mono | 13px / 0.8125rem | 400 | 1.5 | 0 | Code blocks, API tokens, IDs (font: `JetBrains Mono, monospace`) |

## 2.2 Color System

**Light Mode (Default)**

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-primary` | `#FFFFFF` | Page background |
| `--color-bg-secondary` | `#F9FAFB` | Sidebar background, card backgrounds, alternate table rows |
| `--color-bg-tertiary` | `#F3F4F6` | Hover states, input backgrounds |
| `--color-bg-elevated` | `#FFFFFF` | Modals, dropdowns, popovers (with shadow) |
| `--color-border-default` | `#E5E7EB` | Card borders, dividers, table borders |
| `--color-border-strong` | `#D1D5DB` | Active input borders, focus rings |
| `--color-text-primary` | `#111827` | Headings, primary content |
| `--color-text-secondary` | `#6B7280` | Metadata, timestamps, helper text |
| `--color-text-tertiary` | `#9CA3AF` | Placeholders, disabled text |
| `--color-text-inverse` | `#FFFFFF` | Text on filled buttons, badges |
| `--color-accent` | `#2563EB` | Primary actions, links, active states, focus rings |
| `--color-accent-hover` | `#1D4ED8` | Primary button hover |
| `--color-success` | `#059669` | Positive states (FM grade, completed phases, healthy pulse) |
| `--color-warning` | `#D97706` | Caution states (PM grade, SLA approaching, medium pulse) |
| `--color-danger` | `#DC2626` | Negative states (DNM grade, SLA breach, errors, destructive actions) |
| `--color-info` | `#2563EB` | Informational states, links |
| `--color-exception` | `#7C3AED` | EX grade, exception states |
| `--color-agent` | `#7C3AED` | AI/Agent attribution, agent-generated content indicators |
| `--color-presence-self` | `#2563EB` | Own cursor/presence |
| `--color-presence-other` | System assigns from palette | Teammate cursors/presence (up to 8 distinct hues) |

**Dark Mode**

Dark-mode values mirror Master Spec §3.11.2. Dark mode inverts luminance relationships while preserving the semantic meaning of accent, success, warning, danger, exception, and agent tokens. Dark mode preference follows system setting with manual override in User Settings.

| Token | Dark Value | Usage |
|-------|------------|-------|
| `--color-bg-primary` | `#0B0F15` | Page background |
| `--color-bg-secondary` | `#121823` | Sidebar background, card backgrounds, alternate table rows |
| `--color-bg-tertiary` | `#1A2230` | Hover states, input backgrounds |
| `--color-bg-elevated` | `#1F2936` | Modals, dropdowns, popovers |
| `--color-border-default` | `#2A3443` | Card borders, dividers, table borders |
| `--color-border-strong` | `#3A4558` | Active input borders, focus rings |
| `--color-text-primary` | `#F3F4F6` | Headings, primary content |
| `--color-text-secondary` | `#9CA3AF` | Metadata, timestamps, helper text |
| `--color-text-tertiary` | `#6B7280` | Placeholders, disabled text |
| `--color-text-inverse` | `#0B0F15` | Text on filled buttons, badges |
| `--color-accent` | `#60A5FA` | Primary actions, links, active states, focus rings |
| `--color-accent-hover` | `#3B82F6` | Primary button hover |
| `--color-success` | `#34D399` | Positive states (FM grade, completed phases, healthy pulse) |
| `--color-warning` | `#FBBF24` | Caution states (PM grade, SLA approaching, medium pulse) |
| `--color-danger` | `#F87171` | Negative states (DNM grade, SLA breach, errors, destructive actions) |
| `--color-info` | `#60A5FA` | Informational states, links |
| `--color-exception` | `#A78BFA` | EX grade, exception states |
| `--color-agent` | `#A78BFA` | AI/Agent attribution, agent-generated content indicators |
| `--color-presence-self` | `#60A5FA` | Own cursor/presence |
| `--color-presence-other` | Dark-tuned 8-hue palette per Master Spec §3.9.2 / §3.11.2 | Teammate cursors/presence |

## 2.3 Spacing Scale

Base unit: 4px. All spacing uses multiples of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Inline padding within badges, tight element gaps |
| `--space-2` | 8px | Standard gap between inline elements, icon-to-label |
| `--space-3` | 12px | Input internal padding, small card padding |
| `--space-4` | 16px | Standard card padding, section gaps |
| `--space-5` | 20px | Between related sections |
| `--space-6` | 24px | Between unrelated sections on same page |
| `--space-8` | 32px | Page-level vertical rhythm |
| `--space-10` | 40px | Major section separations |
| `--space-12` | 48px | Page top/bottom margins |

## 2.4 Elevation & Shadows

| Level | Shadow | Usage |
|-------|--------|-------|
| 0 (Flat) | None | Default surfaces, inline content |
| 1 (Raised) | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Cards, sidebar |
| 2 (Floating) | `0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)` | Dropdowns, popovers, toast notifications |
| 3 (Overlay) | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` | Modals, Command Palette, side peek panel |
| 4 (Topmost) | `0 20px 25px rgba(0,0,0,0.15), 0 10px 10px rgba(0,0,0,0.04)` | Confirmation dialogs over modals |

## 2.5 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Badges, small buttons, tags |
| `--radius-md` | 6px | Inputs, cards, dropdowns |
| `--radius-lg` | 8px | Modals, side peek, large cards |
| `--radius-xl` | 12px | Command Palette, overlay panels |
| `--radius-full` | 9999px | Avatars, circular indicators |

## 2.6 Motion & Transitions

| Property | Duration | Easing | Usage |
|----------|----------|--------|-------|
| Color/opacity transitions | 150ms | `ease-out` | Hover states, focus states, toggle switches |
| Side Peek open/close | 200ms | `ease-in-out` | Right panel slide in/out |
| Modal open | 200ms | `ease-out` | Scale from 95% + fade in |
| Modal close | 150ms | `ease-in` | Scale to 95% + fade out |
| Toast enter | 200ms | `ease-out` | Slide up from bottom-right + fade in |
| Toast exit | 150ms | `ease-in` | Fade out |
| Skeleton shimmer | 1500ms | `linear` (infinite loop) | Gradient sweep left-to-right |
| Command Palette open | 150ms | `ease-out` | Fade in + slight scale up from center |
| Dropdown open | 100ms | `ease-out` | Scale Y from 95% top-origin |

**Named motion tokens**

| Token | Value | Usage |
|-------|-------|-------|
| `motion.duration.xs` | 100ms | Dropdown open |
| `motion.duration.sm` | 150ms | Hover/focus, modal close, toast exit, command palette |
| `motion.duration.lg` | 200ms | Modal open, side peek, toast enter |
| `motion.duration.medium` | 240ms | PipelineSurface active-step indicator and other guided surface transitions |
| `motion.duration.pulse` | 600ms | SLA breach attention pulse |
| `motion.duration.xl` | 1500ms | Skeleton shimmer |
| `motion.ease.standard` | `ease-out` | Standard surface transition easing |
| `motion.ease.enter` | `ease-out` | Enter/open transitions |
| `motion.ease.exit` | `ease-in` | Exit/close transitions |

All transitions respect `prefers-reduced-motion: reduce`. When reduced motion is active, transitions are instantaneous (0ms duration) with opacity changes only.

## 2.7 Iconography

**Icon Library:** Lucide Icons (consistent with ShadCN/UI). 20px default size for navigation, 16px for inline/table contexts, 24px for empty state illustrations.

**Icon Usage Rules:**
- Every icon that conveys meaning must have a text label or `aria-label`.
- Decorative icons use `aria-hidden="true"`.
- Interactive icons (buttons) follow the Master Spec §38.6.2 per-tier touch-target minimum.
- Grade icons: checkmark-circle (FM), half-circle (PM), x-circle (DNM), minus-circle (EX), each in their semantic color.
- Phase icons: numbered circle badges (1-13) using `--color-accent` for current, `--color-success` for completed, `--color-text-tertiary` for future.

## 2.8 Z-Index Scale

| Layer | Z-Index | Content |
|-------|---------|---------|
| Base | 0 | Page content, tables, forms |
| Sticky | 10 | Sticky table headers, toolbar |
| Sidebar | 20 | Sidebar navigation |
| Side Peek | 30 | Detail panel |
| Dropdown | 40 | Menus, popovers, select dropdowns |
| Toast | 50 | Toast notification stack |
| Modal Backdrop | 60 | Modal dimming overlay |
| Modal | 70 | Modal dialog |
| Command Palette | 80 | `Cmd+K` overlay |
| Tooltip | 90 | Tooltips |
| Topmost | 100 | Confirmation over modal (destructive action confirmation) |


## 2.9 Form & Input Tokens

**Authority.** Master Spec §3.6.1 is canonical. This section is a designer-facing mirror of the exported form-token subset. It MUST NOT introduce values, variants, or usage rules; amend Master Spec §3.6.1 first, then synchronize this table through Tokens Studio and `ux_token_drift_check`.

All form controls follow a consistent token system for sizing, spacing, and state management.

| Token | Value | Usage |
|-------|-------|-------|
| `--input-height-sm` | 28px | Compact inputs (inline edit, table cells) |
| `--input-height-md` | 36px | Standard inputs (forms, filters) |
| `--input-height-lg` | 44px | Prominent inputs (search, onboarding) |
| `--input-padding-x` | 12px | Horizontal padding for all inputs |
| `--input-border-default` | 1px solid `--color-border-default` | Default input border |
| `--input-border-focus` | 1px solid `--color-accent` | Focused input border |
| `--input-border-error` | 1px solid `--color-danger` | Error state border |
| `--input-bg` | `--color-bg-tertiary` | Input background |
| `--input-bg-disabled` | `--color-bg-secondary` with 50% opacity | Disabled input background |
| `--input-radius` | `--radius-md` (6px) | Input border radius |

**Focus Ring:** All interactive controls show a 3px ring using `--color-accent` at 20% opacity on `:focus-visible`. This ring is suppressed on `:focus:not(:focus-visible)` to avoid showing on mouse click.

**Validation States:**
- Default: `--input-border-default`
- Focus: `--input-border-focus` + focus ring
- Error: `--input-border-error` + red helper text below (Caption size, `--color-danger`)
- Disabled: `--input-bg-disabled`, `--color-text-tertiary` text, no focus ring, `cursor: not-allowed`

**Label Pattern:** Every form field has a label (Caption weight 500, `--color-text-primary`) positioned above the input with `--space-1` gap. Required fields show a red asterisk (`*`) after the label. Optional fields show "(optional)" in `--color-text-secondary`.

---

# 3. Global Application Structure

## 3.1 Application Shell

The application shell is a persistent three-region layout on desktop:

```
┌────────────────────────────────────────────────────────┐
│ [Sidebar]  │  [Main Content Area]  │  [Side Peek]         │
│ 240px      │  Fluid (min 600px)    │  480px default       │
│ Fixed      │  Scrollable           │  Slides in/out    │
│            │                       │                    │
│            │                       │                    │
└────────────────────────────────────────────────────────┘
```

**Sidebar (Left, 240px, fixed):** Always visible on desktop. Contains org switcher, console indicator, primary navigation, workspace selector, and user menu. Collapses to icon-only (56px) on user toggle or narrow viewports. On mobile (< 640px), replaced by hamburger menu + bottom navigation bar.

**Main Content Area (Center, fluid):** Primary working surface. Contains page header, toolbar, and content. Scrolls independently. Minimum width 600px to prevent content compression.

**Side Peek (Right, 480px default, conditional):** Slides in when a row is selected (`Enter` or click). Shows detail view for the selected entity. `Escape` closes. On `desktop`, it is user-resizable from 360–640px; on `desktop_xl`, from 360–720px. When open, the main content area compresses. When closed, main content area expands to fill. Master Spec §3.8 / §38.6.2 controls the breakpoint contract.

## 3.2 Sidebar Anatomy

The sidebar is the primary navigation instrument. Its structure adapts based on console context.

### Buyer Console Sidebar

```
┌─────────────────────────┐
│ [Org Switcher]          │  ← Org logo + name. Dropdown for multi-org users.
│ BUYER CONSOLE           │  ← Console label badge (blue).
├─────────────────────────┤
│ ● Dashboard             │  ← Landing page. Pulse summary.
│ ● Workspaces ▾          │  ← Expandable. Lists all workspaces.
│   ├ [Workspace A]       │     Active workspace highlighted.
│   ├ [Workspace B]       │
│   └ + New Workspace     │
├─────────────────────────┤
│ WORKSPACE CONTEXT       │  ← Only visible when a workspace is selected.
│ ● Phase [N]: [Name]     │  ← Current phase indicator.
│ ● Requirements          │  ← Matrix view (default).
│ ● Vendors               │  ← Target account list.
│ ● Scoring               │  ← Phase 10+ only.
│ ● Scenarios             │  ← Phase 10+ only. Business+ plan.
│ ● Q&A                   │  ← Phase 6-8. Business+ only.
│ ● TCO                   │  ← Only if TCO Use Case exists.
│ ● Analytics             │  ← Workspace-level metrics.
│ ● Intelligence          │  ← Business+ plan.
├─────────────────────────┤
│ ORGANIZATION            │
│ ● Templates             │  ← Template Library.
│ ● Marketplace           │  ← Vendor discovery.
│ ● Inbox                 │  ← Unified notification feed.
│ ● Settings              │  ← User, Org, Workspace settings.
├─────────────────────────┤
│ [Setup Checklist]       │  ← During onboarding. Dismissible.
├─────────────────────────┤
│ [User Avatar + Name]    │  ← Bottom. Click for user menu.
│ [Cmd+K hint]            │  ← Persistent Command Palette hint.
└─────────────────────────┘
```

### Seller Console Sidebar

```
┌─────────────────────────┐
│ [Org Switcher]          │
│ SELLER CONSOLE          │  ← Console label badge (green).
├─────────────────────────┤
│ ● Dashboard             │  ← Active bids summary.
│ ● Bid Workspaces ▾      │  ← Expandable. Lists active bids.
│   ├ [Bid A]             │
│   ├ [Bid B]             │
│   └ (No new bids)       │
├─────────────────────────┤
│ BID CONTEXT             │  ← When a bid workspace is selected.
│ ● Requirements          │  ← View assigned requirements.
│ ● Responses             │  ← Draft/submit responses.
│ ● Q&A                   │  ← Phase 6-8. Business+ only.
│ ● NDA                   │  ← NDA status and documents.
├─────────────────────────┤
│ ORGANIZATION            │
│ ● Knowledge Base        │  ← KB management.
│ ● Profile               │  ← Seller profile, capabilities.
│ ● Marketplace Listings  │  ← Manage marketplace presence.
│ ● Inbox                 │  ← Notification feed.
│ ● Settings              │  ← User, Org settings.
├─────────────────────────┤
│ [User Avatar + Name]    │
│ [Cmd+K hint]            │
└─────────────────────────┘
```

### Sidebar Behavior Rules

- **Phase-Gated Items:** Navigation items that are phase-dependent (Scoring, Q&A, Scenarios) render as disabled with a tooltip ("Available in Phase N") when the workspace has not reached that phase. They do not disappear — they remain visible to establish information scent and teach the user what lies ahead.
- **Plan-Gated Items:** Features gated by plan tier (Scenarios, Intelligence, TCO) show with a lock icon and "Upgrade" link for users on insufficient plans. If the user's role cannot upgrade, the lock icon appears without the upgrade link.
- **Active State:** The currently active navigation item uses `--color-accent` text + a 2px left border accent bar.
- **Collapse Behavior:** Sidebar can be toggled to icon-only mode via a collapse button at the bottom or `Cmd+\`. In collapsed mode, hovering over an icon shows a tooltip with the item name. The workspace list is accessible via a popover on hover.
- **Workspace Count Badge:** The Workspaces nav item shows a count badge of active workspaces.

## 3.3 Console Switcher

Users who belong to organizations with both Buyer and Seller consoles see a console toggle in the sidebar header, below the Org Switcher.

**Behavior:**
- Toggle between "Buyer Console" and "Seller Console."
- Switching console triggers a full navigation reset (returns to the target console's Dashboard).
- All in-memory state (selected workspace, side peek content, Command Palette history) is cleared on switch.
- The console label badge changes color: blue for Buyer, green for Seller.
- Console switch is also accessible via Command Palette: `Cmd+K` → "Switch to Seller Console" / "Switch to Buyer Console."

## 3.4 Responsive Layouts

### Desktop (≥ 1024px)
Three-column layout as described in 3.1. Sidebar pinned. Side Peek available. Full keyboard shortcuts. Command Palette via `Cmd+K`.

### Tablet (768px–<1024px)
Two-column layout: Sidebar + Main Content. Side Peek opens as a 72%-viewport overlay above the main content. Sidebar collapses to icon-only by default; expands on tap. Top navigation bar shows breadcrumb + search icon. Touch targets follow the Master Spec §38.6.2 per-tier minimum.

### Mobile (< 768px)
Single-column layout. Sidebar replaced by hamburger menu (top-left) + bottom navigation bar. Bottom nav items: Dashboard, Requirements, Vendors, Inbox, More (overflow). Side Peek opens as a full-screen view with back-arrow navigation. Command Palette replaced by search bar (magnifying glass icon in top nav). Keyboard shortcuts disabled except `Escape` for closing overlays.

## 3.5 Page Header Pattern

Every page within the main content area follows a consistent header pattern:

```
┌──────────────────────────────────────────────────────┐
│ [Breadcrumb: Org > Workspace > Section]              │
│ [Page Title]                          [Action Bar]   │
│ [Description or context line]                        │
├──────────────────────────────────────────────────────┤
│ [Toolbar: Filters | Sort | View Toggle | Search]    │
└──────────────────────────────────────────────────────┘
```

- **Breadcrumb:** Shows hierarchical path. Each segment is clickable. Truncates middle segments on narrow viewports.
- **Page Title:** Display-weight text. For workspace-scoped pages, includes the workspace name.
- **Action Bar:** Primary action button (right-aligned). Contextual to the page (e.g., "+ New Requirement", "Advance Phase", "Export").
- **Toolbar:** Sticky below the header on scroll. Contains filter chips, sort controls, view toggle (matrix/list/card), and inline search.

## 3.6 Navigation Model

**Primary Navigation:** Sidebar (persistent, hierarchical).
**Secondary Navigation:** Breadcrumbs (positional), tabs within pages (e.g., Use Case tabs within Requirements view).
**Tertiary Navigation:** Command Palette (`Cmd+K`), keyboard shortcuts, in-page anchors.

**URL Structure:** Every page, workspace, and entity has a unique, bookmarkable URL. URL pattern: `/{console}/workspaces/{workspace_id}/{section}/{entity_id}`. Example: `/buyer/workspaces/ws_abc/requirements/req_123`.

## 3.7 Keyboard Shortcut Reference

All keyboard shortcuts follow the Linear Constraint (Master Spec §3). Shortcuts are phase-aware — shortcuts for unavailable features are inert with no error feedback.

| Shortcut | Scope | Action |
|----------|-------|--------|
| `Cmd+K` | Global | Open Command Palette |
| `Cmd+\\` | Global | Toggle sidebar collapse |
| `Escape` | Global | Close current overlay (Side Peek, Modal, Command Palette, Dropdown) |
| `J` / `K` | Table/List | Navigate down / up through rows |
| `Enter` | Table/List | Open Side Peek for focused row |
| `L` | Table/List | Open inline edit for focused cell |
| `Shift+Click` | Table/List | Range select rows |
| `Cmd+A` | Table/List | Select all visible rows |
| `D` | Table/List | Delete selected row(s) — shows confirmation dialog |
| `1`-`4` | Scoring Matrix | Assign grade (1=FM, 2=PM, 3=DNM, 4=EX) to focused cell |
| `Tab` | Forms | Move to next field |
| `Shift+Tab` | Forms | Move to previous field |
| `Cmd+Enter` | Text editors | Submit / Save current form or comment |
| `Cmd+Shift+K` | Workspace | Open Agent panel |
| `Cmd+.` | Workspace | Advance phase (if gate conditions met) |
| `?` | Global | Show keyboard shortcut overlay |

**Discoverability:** Tooltips on all interactive elements include the keyboard shortcut in parentheses. The `?` overlay groups shortcuts by context (Global, Table, Scoring, Forms). First-time users see a dismissible onboarding tooltip introducing `Cmd+K` and `?`.

---

# 4. Product Page Specifications

## 4.1 Page Inventory

| # | Page | Console | URL Pattern | Phase Availability | Plan Gate | Master Spec Section |
|---|------|---------|-------------|-------------------|-----------|-------------------|
| 1 | Buyer Dashboard | Buyer | `/buyer/dashboard` | All | All | §20 |
| 2 | Workspace List | Buyer | `/buyer/workspaces` | All | All | §11 |
| 3 | Workspace Overview | Buyer | `/buyer/workspaces/{id}` | All | All | §11 |
| 4 | Requirements Matrix | Buyer | `/buyer/workspaces/{id}/requirements` | All | All | §11 |
| 5 | Requirement Detail | Buyer | Side Peek or `/buyer/workspaces/{id}/requirements/{id}` | All | All | §11 |
| 6 | Vendor List | Buyer | `/buyer/workspaces/{id}/vendors` | Phase 3+ | All | §11 |
| 7 | Vendor Detail | Buyer | Side Peek or `/buyer/workspaces/{id}/vendors/{id}` | Phase 3+ | All | §25 |
| 8 | Scoring Matrix | Buyer | `/buyer/workspaces/{id}/scoring` | Phase 10+ | All | §12, §13 |
| 9 | Scoring Card | Buyer | Side Peek within Scoring Matrix | Phase 10+ | All | §13 |
| 10 | Scenario Modeling | Buyer | `/buyer/workspaces/{id}/scenarios` | Phase 10+ | Business+ | §14 |
| 11 | TCO Dashboard | Buyer | `/buyer/workspaces/{id}/tco` | Phase 10+ | Business+ | §15 |
| 12 | Q&A Threads | Buyer | `/buyer/workspaces/{id}/qa` | Phase 6-8 | Business+ | §18 |
| 13 | Workspace Analytics | Buyer | `/buyer/workspaces/{id}/analytics` | All | All | §17 |
| 14 | Intelligence Dashboard | Buyer | `/buyer/workspaces/{id}/intelligence` | All | Business+ | §16 |
| 15 | Selection Report | Buyer | `/buyer/workspaces/{id}/report` | Phase 12+ | All | §10.12 |
| 15a | Defense View | Buyer | `/buyer/workspaces/{id}/defense-view` | Phase 12+ | Free (watermarked preview); Solo+ (full surface) | §13.11 |
| 16 | Policy Ingestion | Buyer | `/buyer/workspaces/{id}/policy-ingestion` | Phases 1-5 | Business+ | §12 |
| 17 | Template Library | Buyer | `/buyer/templates` | All | All | §19 |
| 18 | Marketplace (Buyer) | Buyer | `/buyer/marketplace` | All | All | §27 |
| 19 | Inbox (Buyer) | Buyer | `/buyer/inbox` | All | All | §20 |
| 20 | Seller Dashboard | Seller | `/seller/dashboard` | All | All | §24 |
| 21 | Bid Workspace List | Seller | `/seller/bid-workspaces` | All | All | §23 |
| 22 | Bid Workspace Detail | Seller | `/seller/bid-workspaces/{id}` | All | All | §23 |
| 23 | Response Editor | Seller | `/seller/bid-workspaces/{id}/responses/{id}` | Phase 6-9 | All | §23 |
| 24 | Knowledge Base | Seller | `/seller/knowledge-base` | All | All | §22 |
| 25 | KB Entry Detail | Seller | `/seller/knowledge-base/{id}` | All | All | §22 |
| 26 | Seller Profile | Seller | `/seller/profile` | All | All | §26 |
| 27 | Capability Declarations | Seller | `/seller/profile/capabilities` | All | All | §26 |
| 28 | Marketplace Listings | Seller | `/seller/marketplace-listings` | All | All | §27 |
| 29 | Q&A (Seller) | Seller | `/seller/bid-workspaces/{id}/qa` | Phase 6-8 | Business+ | §24 |
| 30 | NDA Review | Seller | `/seller/bid-workspaces/{id}/nda` | Phase 4 | All | §24 |
| 31 | Inbox (Seller) | Seller | `/seller/inbox` | All | All | §24 |
| 32 | Settings: User | Both | `/settings/user` | All | All | §36.1 |
| 33 | Settings: Organization | Both | `/settings/organization` | All | Varies | §36.2 |
| 34 | Settings: Workspace | Buyer | `/settings/workspace/{id}` | All | Varies | §36.3 |
| 35 | Onboarding: Buyer | Buyer | `/onboarding/buyer` | N/A | All | §35.1 |
| 36 | Onboarding: Seller | Seller | `/onboarding/seller` | N/A | All | §35.2 |
| 37 | Admin Dashboard | Internal | `/admin` | N/A | Staff | §43 |

## 4.2 Page Specifications — Buyer Console

### 4.2.1 Buyer Dashboard

**Purpose:** Single-screen operational summary. The user lands here after login and sees the health of all active workspaces, pending actions, and recent activity.

**Layout:**

```
┌──────────────────────────────────────────────────────┐
│ Dashboard                              [+ New Workspace] │
├──────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌──────────┐│
│ │ Active           │ │ Pending Actions  │ │ Pulse    ││
│ │ Workspaces: N    │ │ Items: N         │ │ Score: N ││
│ └─────────────────┘ └─────────────────┘ └──────────┘│
├──────────────────────────────────────────────────────┤
│ WORKSPACE CARDS (grid, 2-3 columns)                  │
│ ┌─────────────────────┐ ┌─────────────────────┐     │
│ │ Workspace A          │ │ Workspace B          │     │
│ │ Phase 6: RFP Live    │ │ Phase 10: Scoring    │     │
│ │ Pulse: 82 (Healthy)  │ │ Pulse: 64 (At Risk)  │     │
│ │ 4 vendor responses   │ │ 12 reqs unscored     │     │
│ │ 2 SLA warnings       │ │ 1 SLA breach         │     │
│ └─────────────────────┘ └─────────────────────┘     │
├──────────────────────────────────────────────────────┤
│ RECENT ACTIVITY (feed, chronological)                │
│ • [Vendor X] submitted response for Req 14 — 2m ago │
│ • Phase advanced to Phase 7 in Workspace A — 1h ago │
│ • @You were mentioned in a comment on Req 8 — 3h ago│
└──────────────────────────────────────────────────────┘
```

**Key Components:**
- **Summary Cards (top row):** Three metric cards showing aggregate counts. Active Workspaces, Pending Actions (items requiring user attention), and overall Pulse Score (weighted average across workspaces).
- **Workspace Cards (grid):** Each card shows workspace name, current phase, Pulse health score (color-coded: green ≥ 80, yellow 60-79, red < 60), top pending actions, and SLA status. Cards are clickable — navigate to Workspace Overview.
- **Recent Activity Feed:** Chronological list of events across all workspaces. Each item shows event type icon, description, timestamp (relative), and workspace context. Clicking navigates to the relevant entity.

**Empty State:** First-time user with no workspaces sees: illustration of a workspace, "Create your first workspace" heading, "Start evaluating software vendors with a structured procurement process" subtext, primary CTA "Create Workspace" and secondary "Use a Template."

**Data Refresh:** Real-time via Convex subscriptions. Workspace cards and activity feed update without page reload.

### 4.2.2 Requirements Matrix

**Purpose:** The primary working surface for defining, organizing, reviewing, and managing requirements within a workspace. This is the most-used page in the Buyer Console.

**Layout:**

```
┌──────────────────────────────────────────────────────┐
│ [Workspace] > Requirements          [+ New Requirement] │
│ [Use Case Tabs: All | UC1 | UC2 | UC3 | +]          │
├──────────────────────────────────────────────────────┤
│ [Filter] [Sort] [Group By] [Search]    [View: ≡ ⊞]  │
├──────────────────────────────────────────────────────┤
│ ┌─ Table Header (sticky) ──────────────────────────┐ │
│ │ ☐ │ # │ Title              │ Type  │ W │ Status │ │ │
│ ├──────────────────────────────────────────────────┤ │
│ │ ☐ │ 1 │ SSO support         │ Bool  │ 8 │ Active │ │ │
│ │ ☐ │ 2 │ Data encryption...  │ Qual  │ 12│ Draft  │ │ │
│ │ ☐ │ 3 │ Annual pricing...   │ Price │ 6 │ Active │ │ │
│ │   │   │                     │       │   │        │ │ │
│ │   │   │ [+ Add requirement] │       │   │        │ │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

**Table Columns:**

| Column | Width | Content | Interaction |
|--------|-------|---------|-------------|
| Checkbox | 32px | Row selection for bulk actions | Click to select; Shift+Click for range |
| # | 48px | Auto-incrementing row number | Read-only |
| Title | Fluid (min 200px) | Requirement title (truncated with ellipsis) | Inline edit on `L` key or double-click |
| Type | 80px | Response type badge (Bool, Qual, Evid, Info, Price) | Click to change via dropdown |
| Weight | 48px | Integer 0-20 | Inline edit (number input) |
| Status | 80px | Status badge (Draft, Active, Finalized, Archived) | Read-only (derived from phase) |
| Owner | 120px | Assigned user avatar + name | Click to reassign via dropdown |
| Use Case | 120px | Use case name | Click to reassign via dropdown |

**Use Case Tabs:** Horizontal tabs above the table. "All" shows all requirements across use cases. Each use case gets its own tab. Tabs are reorderable via drag-and-drop. The "+ " button creates a new use case (inline name entry). If more tabs than viewport width, overflow into a "More ▾" dropdown.

**Toolbar:**
- **Filter:** Multi-select chips for Type, Status, Owner, Use Case. Active filters show as removable chips. Filter state persists in URL query params.
- **Sort:** Column header click cycles through ascending/descending/none. Current sort indicated by arrow icon.
- **Group By:** Dropdown: None, Use Case, Status, Owner, Type. Grouping adds collapsible section headers with count badges.
- **Search:** Inline search field filters table rows by title/description match. Debounced (300ms).
- **View Toggle:** Switch between table view (≡) and card view (⊞). Table is default.

**Interactions:**
- `J`/`K` navigate rows. `Enter` opens Side Peek. `L` opens inline edit on the focused cell.
- `Shift+Click` for range select. `Cmd+A` selects all visible. Bulk action toolbar slides in from top with actions: Delete, Reassign Owner, Change Use Case, Change Weight.
- `D` on selected row(s) prompts delete confirmation.
- Bottom of table shows "+ Add requirement" row. Clicking or pressing `Enter` on the last row creates a new inline row with cursor in the Title field.
- Drag handle (left edge, visible on hover) enables row reordering within a use case.

**Phase-Lock Behavior:**
- Phase 1: Full edit access.
- Phase 2-5: Requirements are finalized. Title, description, weight are read-only. Revert available for Workspace Owner/Admin.
- Phase 6-9: Read-only with Amendment Protocol access for Workspace Owner.
- Phase 10+: Fully read-only. Scoring happens on the Scoring Matrix page.

**Empty State:** No requirements created: "Add your first requirement" heading, "Requirements define what you need from vendors. Start by adding requirements manually or importing from a policy document." Subtext. Two CTAs: "Add Requirement" (primary), "Import from Policy" (secondary, links to Policy Ingestion).

### 4.2.3 Scoring Matrix

**Purpose:** The central scoring interface where reviewers evaluate vendor responses against requirements. Designed for efficient keyboard-driven scoring of potentially hundreds of requirement-vendor pairs.

**Layout:**

```
┌──────────────────────────────────────────────────────┐
│ [Workspace] > Scoring                   [Export Scores] │
│ Phase 10: Scoring                                    │
├──────────────────────────────────────────────────────┤
│ [Filter: UC | Vendor | Status] [Progress: 64/120]   │
│ [Scoring Mode: Collaborative ✓]  [Simulation: Off]  │
├──────────────────────────────────────────────────────┤
│ SCORING GRID (Matrix View)                           │
│ ┌──────────────────────────────────────────────────┐ │
│ │         │ Vendor A  │ Vendor B  │ Vendor C       │ │
│ │ UC: Auth│           │           │                │ │
│ │ Req 1   │ FM ✓ (1.0)│ PM ~ (0.6)│ [Unscored]   │ │
│ │ Req 2   │ DNM ✗(0.0)│ FM ✓ (1.0)│ FM ✓ (1.0)   │ │
│ │ UC: Data│           │           │                │ │
│ │ Req 3   │ [Unscored]│ EX — (—) │ PM ~ (0.6)    │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│ VENDOR RANKING (below grid)                          │
│ #1 Vendor B: 87.3  #2 Vendor A: 72.1  #3 Vendor C  │
└──────────────────────────────────────────────────────┘
```

**Grid Behavior:**
- Rows: Requirements grouped by Use Case. Columns: Vendors (Target Accounts).
- Each cell shows the grade (FM/PM/DNM/EX) with color-coded icon and numerical value.
- Unscored cells show a neutral placeholder: light gray dash.
- `J`/`K` navigates rows. `H`/`L` or arrow keys navigate columns. `Enter` or clicking a cell opens the Scoring Card in Side Peek.
- `N` jumps to the next unscored cell in the current column.
- Progress bar at top shows scored/total count with percentage.

**Scoring Card (Side Peek):**

```
┌─────────────────────────────────┐
│ Scoring: [Req Title]            │
│ Vendor: [Vendor Name]           │
├─────────────────────────────────┤
│ REQUIREMENT                     │
│ [Full requirement text]         │
│ Weight: 12  Type: Qualitative   │
├─────────────────────────────────┤
│ VENDOR RESPONSE                 │
│ [Full response text]            │
│ [Attachments if any]            │
├─────────────────────────────────┤
│ YOUR SCORE                      │
│ [1] FM  [2] PM  [3] DNM  [4] EX│
│ Notes: [________________]       │
├─────────────────────────────────┤
│ TEAM SCORES (Collaborative)     │
│ @Alice: FM  @Bob: PM            │
│ ⚠ Insight Card: Divergence 0.4 │
│   "Alice and Bob disagree..."   │
├─────────────────────────────────┤
│ AGENT PRE-SCORE                 │
│ 🤖 Suggested: FM (conf: 0.87)  │
│ Rationale: "Response directly..." │
│ [Accept] [Dismiss]              │
└─────────────────────────────────┘
```

- Number keys `1`-`4` assign grade. Grade is saved immediately (optimistic mutation).
- Tab moves to Notes field. `Cmd+Enter` saves and advances to next unscored pair.
- Collaborative scoring: if Scoring Mode is "Collaborative", teammate grades are visible in the "Team Scores" section. If "Independent", this section is hidden until all reviewers have submitted.
- Agent pre-score: shown if the Agent has pre-scored this pair. User can Accept (applies grade) or Dismiss (hides suggestion). Agent attribution is always visible.
- Insight Card: appears when grade divergence > 0.3 among reviewers. Shows divergence amount, reviewer positions, and a suggested discussion prompt. Expandable. Clicking opens a discussion thread.

**Vendor Ranking Panel:** Below the grid or in a collapsible panel. Shows vendors ranked by weighted score. Bar chart visualization. Updates in real-time as scores are entered. In Simulation Mode, shows scenario-adjusted rankings.

**Simulation Mode Entry:** Toggle button "Simulation" in the toolbar. Activating enters Simulation Mode (Master Spec Section 14): yellow banner across the top "SIMULATION MODE — Changes are not saved to baseline." Weight sliders appear next to each Use Case header. `S` keyboard shortcut toggles. `Cmd+S` saves scenario. `R` resets to baseline.

### 4.2.4 Vendor List

**Purpose:** View and manage all Target Accounts (vendors) in the workspace. Available from Phase 3 onward.

**Layout:** Table similar to Requirements Matrix.

**Table Columns:**

| Column | Content | Interaction |
|--------|---------|-------------|
| Vendor Name | Organization name + logo | Click opens Side Peek |
| Status | invited / nda_pending / active / disqualified / withdrawn | Badge, color-coded |
| NDA Status | draft / sent / signed / expired / revoked | Badge |
| Response Progress | "12/20 submitted" progress bar | Read-only |
| Weighted Score | Numerical score (Phase 10+) | Read-only, sortable |
| Pulse | Per-vendor health indicator | Color-coded dot |

**Actions:**
- "+ Add Vendor" opens a modal for adding a new Target Account (vendor org search or manual entry).
- Row context menu (right-click or `…` button): Send NDA, Disqualify, View Profile, Remove.
- Bulk actions: Send NDA to selected, Disqualify selected.
- Disqualification requires confirmation modal with reason field (required). Vendor is notified via email.

### 4.2.5 Q&A Threads

**Purpose:** Phase-gated communication between buyers and vendors for requirement clarification. Available in Phases 7-8.

**Layout:**

```
┌──────────────────────────────────────────────────────┐
│ [Workspace] > Q&A                    [+ New Question] │
│ Phase 7: Q&A Open                                    │
├──────────────────────────────────────────────────────┤
│ [Filter: Vendor | Requirement | Status] [Search]     │
├──────────────────────────────────────────────────────┤
│ THREAD LIST                                          │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Q: How does SSO support SAML 2.0?               │ │
│ │ From: Vendor A → Re: Req #4 (SSO Support)       │ │
│ │ Status: Awaiting Buyer Answer                    │ │
│ │ 2 replies · Last activity 3h ago                 │ │
│ ├──────────────────────────────────────────────────┤ │
│ │ Q: Can pricing be structured per-seat?           │ │
│ │ From: Vendor B → Re: Req #12 (Annual Pricing)   │ │
│ │ Status: Answered                                 │ │
│ │ 4 replies · Last activity 1d ago                 │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

**Thread Detail (Side Peek or expanded inline):**
- Shows full thread with all posts in chronological order.
- Each post shows author (with console badge: Buyer/Seller), timestamp, content.
- Reply field at bottom with Markdown editor.
- Visibility controls: "Visible to all vendors" / "Visible to this vendor only" toggle per question (Buyer sets visibility).
- Agent suggestion: if the Agent has a suggested answer, it appears as a draft reply with agent attribution. Buyer can edit and send, or dismiss.

**Phase Lock:** Phase 8 (Q&A Closed): no new questions or replies. Existing threads are read-only. A summary banner appears: "Q&A period has closed. N questions were asked, M were answered."

### 4.2.6 Scenario Modeling

**Purpose:** What-if analysis by adjusting use case weights and comparing resulting vendor rankings against baseline. Business+ plan feature.

**Layout:**

```
┌──────────────────────────────────────────────────────┐
│ [Workspace] > Scenarios              [+ New Scenario] │
├──────────────────────────────────────────────────────┤
│ SCENARIO LIST (left, 280px)│ SCENARIO DETAIL (right) │
│ ● Baseline (locked)        │                         │
│ ● Security-Heavy           │ [Scenario Name]         │
│ ● Cost-Optimized           │ [Weight Sliders per UC] │
│ ● Balanced                 │ [Vendor Rankings]       │
│                            │ [Comparison Chart]      │
└──────────────────────────────────────────────────────┘
```

**Scenario Detail Panel:**
- Scenario name (editable).
- Use Case weight sliders: each use case shows a slider (0-20 range) with current value. Changes immediately recalculate rankings.
- Vendor ranking table: shows rank, vendor name, score under this scenario, and delta from baseline (green up-arrow or red down-arrow with magnitude).
- Comparison chart: bar chart showing baseline vs. scenario scores per vendor.
- "Compare Scenarios" button: opens a multi-scenario comparison view showing a side-by-side table of all scenarios and their vendor rankings.

**Constraints:** Scenario count limited by plan tier (Business: 10, Enterprise: 50). When limit reached, "+ New Scenario" is disabled with tooltip showing limit.

### 4.2.7 TCO Dashboard

**Purpose:** Total Cost of Ownership analysis across vendors. Business+ plan feature. Available when a TCO-type Use Case exists in the workspace.

**Layout:**

```
┌──────────────────────────────────────────────────────┐
│ [Workspace] > TCO                         [Export]   │
├──────────────────────────────────────────────────────┤
│ CONFIGURATION                                        │
│ Projection: [3] years  Seats: [100]  Growth: [10%/yr]│
├──────────────────────────────────────────────────────┤
│ TCO COMPARISON TABLE                                 │
│ ┌──────────────────────────────────────────────────┐ │
│ │         │ Vendor A  │ Vendor B  │ Vendor C       │ │
│ │ Year 1  │ $120,000  │ $95,000   │ $140,000       │ │
│ │ Year 2  │ $132,000  │ $104,500  │ $154,000       │ │
│ │ Year 3  │ $145,200  │ $114,950  │ $169,400       │ │
│ │ Total   │ $397,200  │ $314,450  │ $463,400       │ │
│ │ Rank    │ #2        │ #1        │ #3             │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│ TCO CHART (stacked bar or line)                      │
│ [Visualization of cost projections over time]        │
└──────────────────────────────────────────────────────┘
```

**Pricing Requirement Detail:** Each pricing requirement row in the TCO table shows the pricing structure type (flat, tiered, one-time, percentage, range, discount) with a breakdown of how the cost was calculated. Clicking a cell opens a Side Peek showing the full vendor pricing response and calculation formula.

### 4.2.8 Intelligence Dashboard

**Purpose:** Cross-workspace and cross-evaluation vendor performance analytics. Organizational memory for procurement decisions. Business+ plan.

**Layout:**

```
┌──────────────────────────────────────────────────────┐
│ Intelligence                           [Generate Briefing] │
├──────────────────────────────────────────────────────┤
│ VENDOR SEARCH [_________________________]            │
├──────────────────────────────────────────────────────┤
│ VENDOR HISTORY (selected vendor)                     │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Vendor: [Name]                                   │ │
│ │ Evaluations: 4  Avg Score: 78.2  Win Rate: 50%  │ │
│ │ [Performance trend chart over time]              │ │
│ │ Discrepancies: Scored 92 in Security eval,       │ │
│ │   but 61 in Compliance eval. Investigate?        │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│ BRIEFING                                             │
│ 🤖 Generated via Sonnet · 2 hours ago               │
│ [Briefing narrative text]                            │
│ [Download PDF] [Download JSON]                       │
└──────────────────────────────────────────────────────┘
```

**Briefing Generation:** User clicks "Generate Briefing." Loading state shows: "Generating intelligence briefing..." with agent progress indicator. Briefing appears when complete (typically < 30 seconds). Agent model and timestamp are always attributed.

### 4.2.9 Policy Ingestion

**Purpose:** Upload compliance/policy documents (NIST, ISO, SOC 2, etc.) and extract structured requirements from them. Business+ plan. Available in Phases 1-5 only.

**Layout:**

```
┌──────────────────────────────────────────────────────┐
│ [Workspace] > Policy Ingestion           [Upload Document] │
├──────────────────────────────────────────────────────┤
│ STEP 1: UPLOAD                                       │
│ [Drop zone: Drag PDF here or click to browse]        │
│ Supported: PDF (max 50MB)                            │
├──────────────────────────────────────────────────────┤
│ STEP 2: FRAMEWORK DETECTION                          │
│ Detected: NIST 800-53 Rev 5 (confidence: 94%)       │
│ Controls extracted: 142                              │
│ [Review Extracted Requirements →]                    │
├──────────────────────────────────────────────────────┤
│ STEP 3: REVIEW & ACCEPT                              │
│ ┌──────────────────────────────────────────────────┐ │
│ │ ☐ AC-1: Access Control Policy  [Y] [N] [Edit]   │ │
│ │ ☐ AC-2: Account Management     [Y] [N] [Edit]   │ │
│ │ ☐ AC-3: Access Enforcement     [Y] [N] [Edit]   │ │
│ │ ⚠ Duplicate detected: AC-3 ≈ existing Req #12   │ │
│ └──────────────────────────────────────────────────┘ │
│ Accepted: 98/142  Rejected: 12  Pending: 32          │
│ [Import Accepted Requirements]                       │
└──────────────────────────────────────────────────────┘
```

**Review Workflow:**
- Extracted requirements shown in a table with: control ID, title, description preview, duplicate flag, and accept/reject/edit actions.
- Keyboard: `U` for next unreviewed, `Y` to accept, `N` to reject, `G` to view source PDF page.
- Duplicate detection: if a requirement is semantically similar to an existing one, a warning badge appears. Clicking shows the matched requirement for comparison.
- Traceability: accepted requirements retain a link to the source control ID and framework version.
- Import action creates requirements in the workspace with "policy" source tag.

### 4.2.10 Workspace Analytics

**Purpose:** Phase-aware metrics dashboard for the current workspace. Shows completion progress, SLA health, scoring distribution, and timeline.

**Key Metrics Displayed:**
- Phase progress timeline (horizontal stepper showing completed, current, and future phases).
- Requirement completion: stacked bar showing draft/active/finalized counts.
- Vendor response rates: per-vendor progress bars.
- SLA status: count of on-track, approaching, breached. Clicking opens filtered list.
- Scoring distribution: histogram of FM/PM/DNM/EX across all scored pairs.
- Time-in-phase: bar chart showing days spent in each completed phase.

**Filtering:** By Use Case, Vendor, date range. Filters apply to all charts simultaneously.

**Export:** "Export" button generates CSV or PDF of current view with all applied filters.

### 4.2.11 Selection Report

**Purpose:** Auto-generated final report at Phase 12 (Final Selection). Contains vendor ranking, scoring breakdown, and narrative analysis.

**Layout:** Report preview rendered as a document within the main content area. Includes:
- Executive summary (AI-generated narrative).
- Vendor ranking table with scores.
- Per-vendor scorecard breakdown by Use Case.
- Appendices: TCO comparison, traceability matrix, scenario analysis (if applicable).

**Actions:** "Download PDF", "Download Excel", "Share" (generates a read-only link with expiration). Report is regeneratable — "Regenerate Report" button reruns the AI narrative with current data.

### 4.2.13 Defense View

**Master Spec home:** §13.11. **Appendix M row:** Defense View (§13.11, closed Phase 14.5). **Engine entity:** `DefenseView` (§13.11.7). **Capability:** customer-billed Sonnet AIOperation `defense_view_generate` (§13.11.5). Cite Appendix M before naming engine concepts inline (`appendix_m_no_inline_engine_concepts_in_ux_spec` CI gate).

**Purpose:** The single screen a buyer-side Workspace Owner opens five minutes before a leadership meeting to defend a vendor recommendation in plain English. Synthesizes the finalized Selection Record (Master Spec §4.3.24) into four sections — Recommendation, Why, Risks, Evidence — plus a one-page printable PDF for the CFO. This surface is intentionally narrow: no rehearsal modes, no slide generation, no multi-stakeholder views. It is the "five minutes before the meeting" moment.

**Entry points:**
- "Open Defense View" CTA on the §4.2.11 Selection Report header (Phase ≥ 12).
- "Defend my decision" CTA on the §11 Workspace Overview when the Workspace is in Phase 12 or 13.
- Direct URL `/buyer/workspaces/{id}/defense-view` (deep-link safe; same auth gates as the Workspace).
- Cmd+D global shortcut from any Workspace surface when Phase ≥ 12 and `defense_view` plan-gate is satisfied.

**Layout (Desktop, viewport ≥ 1024px):**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ DEFENSE VIEW                                                             │
│ ──────────────────────────────────────────────────────────────────────── │
│ Acme Procurement · Recommended: VendorCo                                 │
│ Generated 4 min ago · Selection Record verified · [chip: regenerated]    │
│ Meeting in 1h 17m · [Print / Export PDF]                                 │
│ ──────────────────────────────────────────────────────────────────────── │
│                                                                          │
│ ▌ RECOMMENDATION                                                         │
│ Choose VendorCo. They scored highest on the requirements that matter     │
│ most to your CFO and your security review.                               │
│                                                                          │
│ ▌ WHY                                                                    │
│ 1. Best fit on Tier-1 Functional Requirements (87/100)        [evidence] │
│    "VendorCo can ingest both NetSuite and Workday on day one."           │
│ 2. Strongest security posture: SOC 2 Type II + ISO 27001      [evidence] │
│ 3. Lowest 3-year TCO at projected scale ($1.42M vs $1.81M)    [evidence] │
│                                                                          │
│ ▌ RISKS                                                                  │
│ 1. Smaller team than RunnerUp.                                           │
│    Mitigation: VendorCo committed to a named CSM and a 99.5% uptime SLA. │
│    [evidence]                                                            │
│ 2. Newer to the European market.                                         │
│    Mitigation: EU data-residency available; pilot only in NA Year 1.     │
│    [evidence]                                                            │
│                                                                          │
│ ▌ EVIDENCE                                                               │
│  • Score 47 — Functional R-12 (VendorCo: FM, RunnerUp: PM)               │
│  • Score 91 — Security R-3 (VendorCo: FM, evidence doc attached)         │
│  • Score 14 — Pricing scenario, base case, Year-3 projection             │
│  • [+ 9 more linked references]                                          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**Layout (Mobile, viewport < 768px):**

Vertically-stacked, full-width. Header collapses to two lines (vendor + meeting countdown). Sections render in the same order. The Print action is replaced by the OS share sheet. Regeneration is not exposed on mobile (engine still receives a hash-mismatch regeneration on next desktop open if the underlying Selection Record was mutated; mobile is a read-only consumption surface).

**Anatomy:**

| Region | Tokens | Behavior |
| :---- | :---- | :---- |
| Page header | `--type-heading-3` for "DEFENSE VIEW" eyebrow; `--type-display-1` for vendor + workspace strap; `--type-body-small` (`--color-text-secondary`) for "Generated N min ago" and "Selection Record verified" metadata. | Sticky on scroll (desktop). On hash mismatch, the regeneration chip (`--color-warning-soft` background, `--color-warning-strong` text, `--type-caption`) appears immediately to the right of the metadata. |
| Meeting countdown (header right) | `--type-heading-4` numeric; `--color-text-primary` ≥ 1h, `--color-warning-strong` < 1h, `--color-danger` < 15m. | Reads from any Workspace-attached calendar event. Absent if no event in the next 24h; the slot is simply empty (no placeholder copy). |
| Print / Export PDF button | Primary button, `--button-primary-bg` / `--button-primary-text`. Cmd+P shortcut binding. | Disabled (with `--button-disabled-*` tokens) on Free with a tooltip "Upgrade to Solo to export the full Defense View." |
| Section heading | `--type-heading-5`, uppercase, with leading `▌` rule (`--color-accent` 2px). | Each of Recommendation / Why / Risks / Evidence renders the same heading rhythm. |
| Section body | `--type-body-large` (16px) for Recommendation; `--type-body` (14px) for Why / Risks / Evidence. `--color-text-primary`. | Reading-pace typography; line-length clamp 64–72 ch on desktop. |
| Inline evidence chip | `--type-caption`, `--color-accent`, hover state opens a Side Peek (§3.8) pinned to the relevant Score / Requirement / Response. | Click or Enter opens; the surface itself does NOT navigate away. |
| "Regenerated due to source change" chip | Same warning palette as header chip. | Auto-clears 24h after the regeneration timestamp. |
| Watermarked preview overlay (Free) | `--color-surface-overlay-50`; `--type-body` upgrade prompt; primary CTA "Upgrade to Solo." | Renders over Risks / remaining Why / Evidence sections. The Recommendation and the first Why reason render in full underneath the overlay. |

**Tokens (deltas from §2 / §3.6 catalogs):**

No new tokens are introduced. Defense View reuses `--type-display-1`, `--type-heading-3`/`-4`/`-5`, `--type-body-large`/`-body`/`-body-small`/`-caption`, `--color-text-primary`/`-secondary`, `--color-accent`, `--color-warning-soft`/`-strong`, `--color-danger`, `--color-surface-base`, `--color-surface-overlay-50`, `--button-primary-*`, `--button-disabled-*`, `--space-4` through `--space-32`, `--radius-md`, `--shadow-sticky-header`. The `appendix_m_no_inline_engine_concepts_in_ux_spec` CI gate inspects this section against Appendix M and the §3.6 token registry; a deviation is a P0 review failure.

**Interaction states (per §3.7 state catalog):**

| State | Trigger | Render |
| :---- | :---- | :---- |
| `loading_initial` | First open of Defense View; AIOperation `defense_view_generate` invoked | Content-shaped skeleton (per §3.7.3): four section frames at the dimensions of an average Defense View, with shimmer animation. Header strap renders with the vendor name (already known from the Selection Report) and "Generating defense…" microcopy. |
| `generating_overlay` | `loading_initial` exceeds 4 seconds | Skeleton continues; below the skeleton, an inline note "Sourcera is reading your Selection Record and drafting a defense. This usually takes about 8 seconds." replaces the microcopy. |
| `ready` | AIOperation succeeds OR cache hit on hash match | Four sections render. Header chip absent. PDF button enabled (Solo+) or render-locked-with-tooltip (Free). |
| `regenerated` | Hash mismatch detected on read OR explicit regeneration | Same as `ready`, plus the "regenerated due to source change" chip in the header. Sections render with a 200 ms cross-fade from previous content per §2.6 motion. |
| `watermarked_preview` | Caller is on Buyer Free | Recommendation + first Why reason render unobstructed; Risks, remaining Why, and Evidence render under a `--color-surface-overlay-50` panel with the upgrade CTA. PDF button is in `disabled` state with the upgrade tooltip. |
| `low_confidence` | `confidence_score < 0.700` | Inline note above Recommendation: "Sourcera couldn't synthesize a confident defense for this Selection Record. Open the Selection Report for the underlying detail, or [Try again]." Sections still render; user MAY consume the draft. Reused §21.3 confidence-threshold copy. |
| `error_generation_failed` | AIOperation fails or exceeds 30s budget | Failure / Reason / Recovery panel (per §3.7.5): "We couldn't generate the Defense View just now. / Sourcera AI returned an error or timed out. / [Try again] · [Open the Selection Report]." The "Try again" affordance does NOT count against the regeneration throttle. |
| `error_third_party_outage` | Anthropic / Sonnet outage detected | Same panel; Reason copy: "Sourcera AI is temporarily unavailable." Recovery: "[Open the Selection Report]" surfaced as the primary action. |
| `error_no_selection_record` | Workspace Phase < 12 OR no `SelectionReport` row | Empty state (per §3.7.4): "The Defense View opens after you've finalized the Selection Report. Finish Phase 12 to unlock." Next-best-action: "Open Phase 12." |
| `error_archived` | Workspace closed / archived | Empty state: "This evaluation has been archived. The Defense View is no longer available." No Next-best-action; static. |
| `error_wallet_capped` | Free wallet hard-capped (Free callers attempting full-surface generation via the watermarked-render upgrade path); paid callers exceeding overage cap | Failure / Reason / Recovery: "We can't generate the Defense View right now. / Your AI wallet has reached its cap. / [Adjust wallet cap] · [Open the Selection Report]." |

**Mobile divergence:**

- Read-only. Regeneration is not exposed (no "Regenerate" affordance; hash-mismatch auto-regenerations still occur on the desktop / API path and the mobile surface picks up the new content on next open).
- Print/Export PDF replaced by the OS share sheet button; tapping invokes `navigator.share` with the same server-rendered PDF blob.
- Cmd+P / Esc shortcuts not applicable on mobile; equivalents are the share sheet button and the OS back gesture.
- Watermarked preview on Free renders identically; the upgrade CTA links to the same Solo upgrade modal.

**Keyboard shortcuts:**

| Shortcut | Action | Notes |
| :---- | :---- | :---- |
| `Cmd/Ctrl + D` | Open Defense View | Global shortcut from any Workspace surface where Phase ≥ 12. |
| `Cmd/Ctrl + P` | Print / Export PDF | Active on Solo+; on Free, surfaces the upgrade modal. |
| `Esc` | Close Defense View, return to prior surface (typically §4.2.11 Selection Report) | If opened via direct URL with no prior Workspace surface, returns to §11 Workspace Overview. |
| `R` (when focused) | Regenerate (Solo+ only) | Surfaces a confirmation tooltip on first use ("This will use $X.XX of your AI budget") with a "Don't ask again this session" toggle. Throttled to 1 regeneration per 5 minutes per Workspace. |
| `Tab` / `Shift+Tab` | Cycle through inline evidence chips | Each chip is keyboard-focusable; Enter opens the Side Peek. |

**Accessibility:**

- `role="region"` on each of the four sections; `aria-labelledby` references the section heading.
- The watermarked preview overlay has `role="dialog"` semantics ONLY for the upgrade CTA and gated content; the visible Recommendation + first Why reason remain in the document flow with full screen-reader access (preview is not a deceptive paywall — visible content is genuinely visible).
- Inline evidence chips are `<button>` elements (not `<a>`) since they trigger a Side Peek, not navigation.
- Color contrast across all states meets WCAG 2.1 AA (4.5:1 text, 3:1 UI components); dark-mode parity is enforced per §3.11.
- `prefers-reduced-motion`: the 200 ms cross-fade on regeneration becomes an instant content swap.
- The PDF generated by Print/Export passes a §3.7 / §11.6 PDF-A11y check (text layer present, headings tagged, evidence references linked).

**Performance budgets (from Master Spec §13.11.5 and §13.11.6):**

- p95 generation (click to first paint of all four sections): ≤ 8 s.
- p95 cache-hit render (no AIOperation invocation): ≤ 500 ms.
- p95 PDF render: ≤ 3 s.
- Loading-state shimmer onset: ≤ 200 ms after click.

**Empty / loading / error states explicitly enumerated.** See the "Interaction states" table above. The §3.7 state catalog imposes no further states; Defense View has no partial-load state because its generation is atomic (the four sections arrive together or not at all).

**Engine cross-references (per Appendix M / `appendix_m_no_inline_engine_concepts_in_ux_spec`):**

- `DefenseView` entity → Master Spec §13.11.7. Surface metaphor row: Appendix M "Defense View (§13.11, closed Phase 14.5)."
- `defense_view_generate` AIOperation capability → Master Spec §13.11.5; Appendix M Architecture row "AIOperation."
- Selection Record / Selection Report sources → Master Spec §4.3.23, §4.3.24, §10.12 step 4, §10.13 step 5; Appendix M rows "Selection Report," "Selection Record," and "Selection Report SHA-256 content hash."
- Plan gating → Master Spec §5.11 (Feature Access Matrix `defense_view`), §34.1 (plan tier definitions), §34.8.5 (Entitlement Matrix).
- Webhooks → Master Spec §13.11.10, Appendix C "Defense-View-Domain Events."
- State machine → Master Spec Appendix L.7.
- Performance budgets → Master Spec §44.1; this section restates the Defense-View-specific budgets above and cites §44.1 as the authoritative home.

#### First 30 Seconds (per §1.4)

Retro-documented under Phase 14.17. Conformant to the §1.4.1 four-bullet template.

1. **What the user sees.** A single full-page surface titled "Defense View" naming the recommended vendor and the workspace, the meeting countdown, and four sequentially labeled regions — Recommendation, Why, Risks, Evidence — populated with plain-English sentences and inline `[evidence]` links. A "Print / Export PDF" action sits in the header.
2. **What they understand without training.** "This is the talking-track for the meeting I'm walking into; the recommendation is at the top, the reasons are numbered, the risks are named with mitigations, and every claim links to the score that proved it."
3. **What they do next.** Reads the Recommendation line and clicks "Print / Export PDF" (or scrolls to scan the first numbered Risk).
4. **What is hidden, and why.** The `DefenseView` entity, the customer-billed `defense_view_generate` Sonnet AIOperation, the Selection Record SHA-256 content-hash drift detection, the regeneration state machine (Master Spec Appendix L.7), the §44.1 latency budgets, the §13.11.10 webhook payload, and the §5.11 / §34.8.5 plan-gating resolution are engine constructs the user never names. Codified by Appendix M rows "Defense View (§13.11, closed Phase 14.5)," "Selection Report," "Selection Record," "Selection Report SHA-256 content hash," and the AIOperation row in the Architecture block.

Cross-references: Master Spec §3.13 (Principle 9 — Surface Simplicity, Engine Complexity); Master Spec Appendix M rows above; `UX_Design_of_Sourcera.md` §1.4 (First-30-Seconds Test).

### 4.2.12 Marketplace (Buyer View)

**Purpose:** Discover vendors, view listings, express interest (EOI), search by capability.

**Layout:**

```
┌──────────────────────────────────────────────────────┐
│ Marketplace                                 [Search] │
├──────────────────────────────────────────────────────┤
│ [Categories] [Capabilities Filter] [Verification]    │
├──────────────────────────────────────────────────────┤
│ LISTING CARDS (grid, 3 columns)                      │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐          │
│ │ Vendor X   │ │ Vendor Y   │ │ Vendor Z   │          │
│ │ ✓ Verified │ │ ★ Certified│ │ Basic      │          │
│ │ CRM, ERP   │ │ Security   │ │ Analytics  │          │
│ │ Match: 87% │ │ Match: 73% │ │ Match: 65% │          │
│ │ [View] [EOI]│ │ [View] [EOI]│ │ [View] [EOI]│       │
│ └───────────┘ └───────────┘ └───────────┘          │
└──────────────────────────────────────────────────────┘
```

- Match score: if the buyer has an active workspace, the marketplace shows a match percentage based on declared capabilities vs. workspace requirements.
- EOI: "Express Interest" button opens a lightweight form (message + workspace context). Seller is notified.
- Capability Filter: multi-select filter by capability categories (Business+ plan). Narrows results to vendors who have declared matching capabilities.
- Verification badges: Basic, Verified, Certified (as defined in Appendix J of Master Spec).


**Interactions (continued):**

- `Enter` → Open selected listing detail

**Empty State:**

```
┌────────────────────────────────┐
│  No vendors found              │
│                                │
│  Try adjusting filters or      │
│  search keywords.              │
└────────────────────────────────┘
```

**Data Refresh mechanism:**

- Listing cards load paginated (20 per page)
- Match scores computed on-demand when workspace selected
- EOI counter synced every 60 seconds
- Ratings/reviews refreshed nightly

---

### 4.2.16 Template Library

**Purpose:**
Browse Sourcera-curated and organization custom templates. Apply templates to new workspaces or create templates from completed workspaces.

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ Template Library                              [+ New] [Filter] │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Filters: [Source: Curated/Custom] [Industry ▼] [Use Cases] │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Template      Source    Use Cases  Reqs  Industry       │ │
│  │ Name          (badge)   (count)    Count Updated        │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ SaaS Selection Curated   3         42    Tech   1w ago  │ │
│  │ Cloud Migration Curated   2         56    Tech   2w ago │ │
│  │ Infrastructure Custom    1         38    Tech   3d ago  │ │
│  │ Security Audit Curated   1         28    All    1w ago  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Template Detail View:**

```
┌──────────────────────────────────────────────────────────────┐
│ SaaS Selection Template                                      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Source: Sourcera Curated                                   │
│  Industry: Technology, SaaS                                  │
│  Last Updated: 1 week ago                                   │
│                                                               │
│  Description                                                 │
│  For evaluating cloud-based SaaS solutions. Includes        │
│  security, integration, scalability requirements.           │
│                                                               │
│  Use Cases (3)                                              │
│  • Multi-vendor SaaS Selection                              │
│  • SaaS Migration Evaluation                                │
│  • Cloud Platform Consolidation                             │
│                                                               │
│  Requirements (42 total)                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Type Distribution:                                      │ │
│  │ Functional (18)  Non-Functional (15)  Legal (6)       │ │
│  │ Commercial (3)                                         │ │
│  │                                                        │ │
│  │ Sample Requirements:                                   │ │
│  │ • Single Sign-On (SSO) Integration [Functional]      │ │
│  │ • SOC 2 Type II Compliant [Non-Functional]          │ │
│  │ • GDPR Data Processing Agreement [Legal]             │ │
│  │ • Volume Discount Structure [Commercial]              │ │
│  │                                                        │ │
│  │ [View All 42 Requirements]                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Actions                                                     │
│  [Apply to New Workspace] [Preview Full Template]           │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Key Components / Sections:**

1. **Template Table**
   - **Template Name:** (clickable → detail)
   - **Source:** Badge (Curated or Custom)
   - **Use Cases:** Count (e.g., "3")
   - **Requirement Count:** Total requirements in template
   - **Industry:** Tag or list (e.g., "Tech", "Finance")
   - **Last Updated:** Relative date (e.g., "1w ago")

2. **Template Detail Page**
   - Header: template name, source badge
   - Description: markdown text
   - Industry tags
   - Last updated timestamp
   - Use Cases: bulleted list
   - Requirements summary: type distribution chart + sample requirements (5-10)
   - [View All Requirements] link → full requirements list
   - Action buttons: [Apply to New Workspace], [Preview Full Template]

3. **Apply to New Workspace Flow**
   - Modal: "Create Workspace from Template"
   - Form fields:
     - Workspace name (required, pre-filled with template name)
     - Description (optional)
     - Procurement type (dropdown, pre-selected if template has default)
   - [Create Workspace] button → creates workspace, auto-populates requirements from template

4. **Create Template from Workspace** (Phase 12 / completed workspaces)
   - Modal: "Save Workspace as Template"
   - Form fields:
     - Template name (required, pre-filled with workspace name)
     - Description (optional)
     - Industry tag(s) (multi-select, optional)
     - Use case(s) (multi-select, optional)
     - Privacy: Private (org only) / Public (Sourcera marketplace, future)
   - [Save as Template] button → saves workspace as reusable template
   - Confirmation: "Template saved. You can now apply this to new workspaces."

**Interactions:**

- **Template name click:** Navigate to detail page
- **[Apply to New Workspace] button:** Open creation modal
- **[Create Template from Workspace]:** Available from Workspace Overview (Phase 12+, Owner only)
- **[View All Requirements]:** Navigate to requirements list view (scrollable)
- **[Preview Full Template]:** Open full template modal (read-only)
- **Filter by source:** Toggle Curated/Custom
- **Keyboard shortcuts:**
  - `N` → New template (from workspace)
  - `A` → Apply selected template
  - `↑/↓` → Navigate template list
  - `Enter` → Open selected template detail

**Empty State:**

```
┌────────────────────────────────┐
│  No templates yet              │
│                                │
│  Complete a workspace to save  │
│  it as a reusable template.    │
│                                │
│  [Browse Curated Templates]    │
└────────────────────────────────┘
```

**Data Refresh mechanism:**

- Template list synced on page load
- New custom templates appear immediately after save
- Curated templates refreshed weekly from Sourcera backend

---

### 4.2.17 Inbox (Buyer)

**Purpose:**
Unified notification and activity inbox for the buyer console. All events scoped to buyer activities.

**Existing spec retained. No changes needed.**

---

## 4.3 Page Specifications — Seller Console

### 4.3.1 Seller Dashboard

**Purpose:**
Executive overview of all active and pending bids. Displays bid status cards, SLA summary, pending actions, KB health, Marketplace listing status, and recent activity.

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ Seller Dashboard                                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Active Bids  │  │ Pending      │  │ KB Health    │      │
│  │      8       │  │ Actions      │  │      82      │      │
│  │ 3 Phase 10+  │  │      5       │  │ (Good)  ↑    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  Active Bids Summary (Next 7 Days)                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Bid Name          Buyer Org   Phase  Resp%  Deadline   │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ ERP Selection     Acme Corp   9      81%    3 days    │ │
│  │ Cloud Infra       TechCorp    6      60%    5 days    │ │
│  │ Security Audit    Global Inc  3      —      2 weeks   │ │
│  │ [View All (8)]                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Pending Actions (Priority Order)                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ⚠ ERP Selection (Acme Corp)                            │ │
│  │    198/242 responses complete. 3 days left in Phase 9. │ │
│  │    [Complete Responses]                                │ │
│  │                                                         │ │
│  │ ⚠ Cloud Infrastructure (TechCorp)                      │ │
│  │    NDA pending review. 5 days before auto-decline.     │ │
│  │    [Review NDA] [Sign/Decline]                         │ │
│  │                                                         │ │
│  │ ℹ Q&A Thread (ERP Selection)                           │ │
│  │    Acme Corp asked 2 new questions. 0/2 answered.     │ │
│  │    [View Q&A]                                          │ │
│  │                                                         │ │
│  │ [Dismiss] [Dismiss All]                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Knowledge Base Health                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ KB Score: 82 / 100 (Good)  ↑ trend                    │ │
│  │                                                         │ │
│  │ Recent Entries:   25 (Last 30 days)                    │ │
│  │ Stale Entries:    3 (overdue review)                   │ │
│  │ Coverage:         94% (bids with KB support)           │ │
│  │                                                         │ │
│  │ [View KB] [Add Entry] [Health Report]                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Marketplace Presence                                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Listing Status: ✓ Published                            │ │
│  │ Views: 342 (Last 30 days)                              │ │
│  │ EOIs Received: 8                                        │ │
│  │                                                         │ │
│  │ [View Listing] [Edit] [Analytics]                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Recent Activity (Across All Bids)                          │
│  ├────────────────────────────────────────────────────────┤ │
│  │ 2 hrs ago  Response submitted to ERP Selection        │ │
│  │ 4 hrs ago  NDA signed (Cloud Infrastructure)          │ │
│  │ 1 day ago  Bid invited (Security Audit)               │ │
│  │ 3 days ago Workspace advanced to Phase 9 (ERP Select) │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Key Components / Sections:**

1. **Summary Cards** (top)
   - Active Bids: total count + count at Phase 10+
   - Pending Actions: count (alerts/tasks)
   - KB Health: score + trend (↑↓↔)

2. **Active Bids Summary Table**
   - Columns: Bid name (clickable), Buyer org, phase, response progress (%), deadline
   - Sorted by deadline (ascending)
   - Show top 3, [View All] link → Bid Workspace List

3. **Pending Actions List**
   - High-priority alerts (NDA signing, response deadlines, Q&A unanswered)
   - Each item: icon (⚠/ℹ), bid name, description, CTA button
   - [Dismiss], [Dismiss All] buttons

4. **KB Health Widget**
   - Score: 0–100 (Green ≥80, Yellow 50–79, Red <50)
   - Trend indicator (↑↓↔)
   - Stats: recent entries count, stale entries count, coverage %
   - [View KB], [Add Entry], [Health Report] buttons

5. **Marketplace Presence Card**
   - Listing status badge (Published, Draft, Archived)
   - Views count (30-day)
   - EOIs received count
   - [View Listing], [Edit], [Analytics] buttons

6. **Recent Activity Feed**
   - Timestamp + event + bid context
   - Clickable to related resource (bid, response, NDA)

**Interactions:**

- **Active bid row click:** Navigate to Bid Workspace Detail
- **[View All (X)]:** Navigate to Bid Workspace List
- **[Complete Responses]:** Navigate to Response Editor
- **[Review NDA]:** Navigate to NDA Review page
- **[View Q&A]:** Navigate to Q&A Threads (Seller)
- **[View KB]:** Navigate to Knowledge Base
- **[View Listing]:** Navigate to Marketplace Listings (Seller)
- **[Dismiss]:** Remove action item from list

**Empty State:**

```
┌────────────────────────────────┐
│  No active bids yet            │
│                                │
│  Bids will appear here when    │
│  buyers invite you.            │
└────────────────────────────────┘
```

**Data Refresh mechanism:**

- Summary cards refresh every 5 minutes
- Active bids list synced every 10 seconds
- Pending actions synced every 30 seconds
- KB health score refreshed every hour
- Recent activity feed real-time via WebSocket

---

### 4.3.2 Bid Workspace List

**Purpose:**
Table view of all bid workspaces assigned to this vendor. Supports filtering, sorting, and navigation to individual bid detail.

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ My Bids                                  [Filters] [Sort ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Filters: [Status ▼] [Phase ▼] [Due Date ▼] [Team ▼]       │
│  Search: [Bid name, buyer org...]                          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Bid Name          Buyer Org   Status   Phase  Deadline  │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ ERP Selection     Acme Corp   Active   9      3d        │ │
│  │ Cloud Infra       TechCorp    Active   6      5d        │ │
│  │ Security Audit    Global Inc  Draft    3      14d       │ │
│  │ Vendor Selection  NewCo       Won      12     —         │ │
│  │ Platform Eval     OldCorp     Lost     11     —         │ │
│  │ [Show more]                                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Totals: 8 Active, 3 Won, 2 Lost, 1 Draft                  │ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Key Components / Sections:**

1. **Filter & Sort Bar**
   - Status dropdown: All, Draft, Active, Submitted, Won, Lost
   - Phase dropdown: 1–12
   - Due Date: dropdown (Next 7 days, Next 30 days, Overdue)
   - Team: dropdown (team members assigned to bid)
   - Search box: bid name + buyer org name

2. **Bid List Table**
   - **Bid Name:** (clickable → Bid Workspace Detail)
   - **Buyer Org:** buyer organization name
   - **Status:** Draft, Active, Submitted, Won, Lost (colored badges)
   - **Phase:** current phase number (1–12)
   - **Deadline:** relative date (e.g., "3d", "2w") or "—" if completed

3. **Summary Stats**
   - Totals: "X Active, Y Won, Z Lost, W Draft"

**Interactions:**

- **Bid name click:** Navigate to Bid Workspace Detail
- **Status filter:** Show only bids matching status
- **Phase filter:** Show only bids at specific phase
- **Sort dropdown:** Sort by deadline, status, phase, bid name
- **Keyboard shortcuts:**
  - `F` → Filter toggle
  - `↑/↓` → Navigate list
  - `Enter` → Open selected bid

**Empty State:**

```
┌────────────────────────────────┐
│  No bids yet                   │
│                                │
│  You'll see bids here when     │
│  buyers invite you to respond. │
└────────────────────────────────┘
```

**Data Refresh mechanism:**

- Bid list synced every 30 seconds
- Status/phase updates reflected immediately on workspace advance

---

### 4.3.3 Bid Workspace Detail

**Purpose:**
Landing page for a specific bid. Shows bid metadata, current phase, team assignments, response progress stepper, deadline countdown, task list, and quick actions.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ Bid: ERP Selection (Acme Corp)                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Phase: 9 (Vendor Evaluation)                                │
│  ◯────◯────◯────◯────●────◯────◯────◯────◯────◯─◯──◯──     │
│  1    2    3    4    5    6    7    8    9   10  11  12     │
│                                                               │
│  Deadline: 3 days remaining (Due: 2026-04-14 at 5pm EST)    │
│  [⏱] Time remaining: 72:45:32                               │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Team Assignments                                        │ │
│  │ Sarah Chen (Lead) — Assigned 5 days ago               │ │
│  │ James Rodriguez (Reviewer) — Assigned 3 days ago      │ │
│  │ Maria Santos (Subject Matter Expert) — Assigned 5d ago│ │
│  │ [+ Add Team Member]                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Response Progress                                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 198 / 242 requirements answered (81%)                  │ │
│  │ ▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░              │ │
│  │                                                         │ │
│  │ By Type:                                                │ │
│  │ • Functional (80/85):        94% ▓▓▓▓▓▓▓░             │ │
│  │ • Non-Functional (60/75):    80% ▓▓▓▓▓░░             │ │
│  │ • Legal (35/52):             67% ▓▓▓░░░░             │ │
│  │ • Commercial (23/30):        76% ▓▓▓▓░░              │ │
│  │                                                         │ │
│  │ [View Requirements Matrix] [Continue Responses]        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Task List (Team Dashboard)                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Task                  Assigned  Status      Due       │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ Review Legal Reqs     Sarah     In Progress 2026-04-14│ │
│  │ Complete Functional   James     Pending     2026-04-14│ │
│  │ Final QA Check        Maria     Pending     2026-04-14│ │
│  │ Submit Responses      Sarah     Pending     2026-04-14│ │
│  │                                                        │ │
│  │ [+ Add Task] [Edit]                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  NDA Status                                                  │
│  ✓ Executed (Expires: 2027-04-14)                          │ │
│  [View NDA]                                                  │
│                                                               │
│  Q&A Access                                                  │
│  ⧐ Phase 6-7: Enabled (can ask/answer)                     │ │
│  [View Q&A Threads]                                         │ │
│                                                               │
│  Quick Actions                                              │
│  ┌──────────────────┐  ┌──────────────────┐               │ │
│  │ Complete Next    │  │ View             │               │ │
│  │ Response         │  │ Requirements     │               │ │
│  └──────────────────┘  └──────────────────┘               │ │
│  ┌──────────────────┐  ┌──────────────────┐               │ │
│  │ View Q&A         │  │ Check SLA        │               │ │
│  │ Threads          │  │ Status           │               │ │
│  └──────────────────┘  └──────────────────┘               │ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Key Components / Sections:**

1. **Header**
   - Bid name + buyer org
   - Phase stepper (all 12 phases with current highlighted)
   - Deadline countdown (days/hours/minutes remaining)

2. **Team Assignments**
   - List: member name + role + assignment date
   - [+ Add Team Member] button → modal to assign team member + role

3. **Response Progress**
   - Overall progress: numerator/denominator + percentage + bar chart
   - Breakdown by requirement type: bars for each type showing %
   - [View Requirements Matrix], [Continue Responses] buttons

4. **Task List**
   - Table: task name, assigned to, status, due date
   - Status: Pending, In Progress, Complete
   - [+ Add Task] button → create task
   - [Edit] button → edit task details
   - Checkbox per task (complete/incomplete)

5. **NDA Status**
   - Badge: ✓ Executed (green), ⧐ Pending (yellow), ✗ Declined (red)
   - Expiration date (if executed)
   - [View NDA] button

6. **Q&A Access**
   - Status badge: Enabled/Disabled based on phase
   - Phase explanation (e.g., "Phase 6-7: Enabled, Phase 8+: Read-only")
   - [View Q&A Threads] button

7. **Quick Action Cards**
   - [Complete Next Response] → navigate to Response Editor
   - [View Requirements] → navigate to Requirements Matrix
   - [View Q&A Threads] → navigate to Q&A page
   - [Check SLA Status] → expand SLA summary widget

**Interactions:**

- **Phase stepper click:** Expand phase detail (optional, read-only)
- **Task row click:** Expand task detail (inline or modal)
- **[+ Add Team Member]:** Modal with member selector + role dropdown
- **[+ Add Task]:** Modal with task name, assigned to, due date, description
- **Task checkbox:** Toggle complete/incomplete
- **[Continue Responses]:** Navigate to Response Editor
- **[View Requirements]:** Navigate to Requirements Matrix
- **[View Q&A Threads]:** Navigate to Q&A Threads (Seller)
- **Keyboard shortcuts:**
  - `R` → View requirements
  - `Q` → View Q&A
  - `T` → Add task
  - `M` → Add team member

**Empty State (no team members):**

```
┌────────────────────────────────────┐
│  No team members assigned yet      │
│                                    │
│  [+ Add Team Member]               │
└────────────────────────────────────┘
```

**Data Refresh mechanism:**

- Response progress synced every 30 seconds
- Task list synced every 10 seconds
- Team assignments updated immediately when added/removed
- NDA status synced in real-time

---

### 4.3.4 Response Editor

**Purpose:**
Rich text editor for vendor responses to buyer requirements. Supports markdown, amendment handling, AI-assisted drafting, and document attachment from centralized library.

**Existing spec retained. Add:**

- **Amendment Handling:**
  - Banner appears when requirement has pending amendment (Phases 6–9)
  - Shows: "Requirement #X amended. View change."
  - [View Diff] button → side-by-side modal comparing old vs. new requirement text
  - Response automatically updated to reflect amended requirement (or marked as "needs re-review")

- **Document Library Attachment:**
  - [Attach Document] button in response editor
  - Drawer panel: list of org's centralized document library (see 4.3.5)
  - Select document → inserts link/reference in response text
  - Attachment synced to buyer console for tracking

---

### 4.3.5 Knowledge Base

**Purpose:**
Centralized knowledge base for AI-assisted response drafting. Supports manual entry, document upload, Firecrawl crawling, health scoring, and document library management.

**Existing spec retained. Add:**

- **Document Library Tab:**
  - Table: file name, type, expiration date, version chain, usage count, category
  - Version history: "v1.2 (current)" with previous versions listed
  - Usage count: "Referenced in 5 responses across 3 bids"
  - Category: custom tags for org (e.g., "Security", "Integration", "Deployment")
  - Actions: [Download], [View History], [Archive]

- **Firecrawl Configuration Detail:**
  - URL patterns: regex (e.g., "^/docs/" to crawl docs only)
  - Crawl depth: slider 1–5 (1 = URL only, 5 = multi-level deep crawl)
  - Frequency: Radio (One-time, Daily, Weekly, Monthly)
  - Content scope: Dropdown (All text, Tables only, Headings + lists)
  - Last crawled: timestamp
  - Next scheduled: date/time
  - [Run Now] button → immediate crawl
  - [Stop Crawling] button → pause scheduled crawls

- **KB Health Model Detail:**
  - Score: 0–100 (Green ≥80, Yellow 50–79, Red <50)
  - Components:
    - Freshness: % of entries reviewed in last 90 days
    - Confidence: Sonnet-generated modifier (0.7–1.0) based on entry quality
    - Completeness: % of entry fields filled (title, content, category)
  - Entry states:
    - review_due: 90+ days since review (yellow warning)
    - review_overdue: 180+ days since review (red warning)
    - flagged_stale: marked for archival (gray, hidden from search)
  - Trend: 30-day score delta (↑↓↔)

---

### 4.3.6 KB Entry Detail

**Purpose:**
Full view of a single KB entry. Shows content, source, health score with decay visualization, usage tracking, version history, and edit/archive actions.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ KB Entry: Multi-currency Implementation Guide                │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Source: Manual (Original)  |  Last Reviewed: 3 days ago    │
│  Category: [Integration]    |  Review Cadence: Every 90d     │
│                                                               │
│  Health Score: 92 / 100 (Excellent) ↑                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Decay Visualization (90-day window)                     │ │
│  │                                                        │ │
│  │ Today ──────────────→ 90 days ago                     │ │
│  │ ●─────────────────────────● (reviewed 3d ago)        │ │
│  │ 92                          80 (projected if not rev) │ │
│  │                                                        │ │
│  │ Confidence Score: 0.95 (High)                         │ │
│  │ Completeness: 100% (all fields filled)                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Content (Markdown)                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ # Multi-currency Implementation Guide                  │ │
│  │                                                        │ │
│  │ ## Overview                                            │ │
│  │ This guide covers configuring multi-currency support  │ │
│  │ in Acme ERP. [content...]                            │ │
│  │                                                        │ │
│  │ [Edit] [Download] [Share]                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Usage & Relationships                                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Used in Responses:                                     │ │
│  │ • ERP Selection (Acme Corp) — Req #12, Req #45       │ │
│  │ • Cloud Migration (TechCorp) — Req #78                │ │
│  │                                                        │ │
│  │ Linked Capability Declarations:                       │ │
│  │ • Multi-currency Support (verified)                   │ │
│  │ • API Integration (pending verification)              │ │
│  │                                                        │ │
│  │ Usage Count: 5 responses (3 bids)                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Version History                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ v1.3 (Current) — 3 days ago — Sarah Chen             │ │
│  │ v1.2 — 35 days ago — James Rodriguez                │ │
│  │ v1.1 — 90 days ago — Maria Santos                   │ │
│  │ v1.0 (Original) — 6 months ago — Sarah Chen          │ │
│  │                                                        │ │
│  │ [View Diff] [Restore Previous Version]                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Actions                                                     │
│  [Edit] [Archive] [Delete]                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Key Components / Sections:**

1. **Header**
   - Entry title
   - Source badge: Manual, Upload, Firecrawl, Bid Response
   - Category tag (custom org tags)
   - Last reviewed date
   - Review cadence (Every 90d, 180d, etc.)

2. **Health Score Widget**
   - Score: 0–100 + color badge
   - Trend: ↑↓↔
   - Decay visualization: line chart showing score decay over 90 days (projected if not reviewed)
   - Confidence score: 0.7–1.0
   - Completeness %

3. **Content Panel**
   - Full markdown content (read-only view)
   - [Edit], [Download], [Share] buttons
   - Edit mode: text area for markdown

4. **Usage & Relationships**
   - "Used in Responses" section: linked bids + requirements (clickable)
   - Usage count: "5 responses (3 bids)"
   - Linked Capability Declarations (if any)

5. **Version History**
   - Table: version number, date created, author
   - [View Diff] → side-by-side comparison
   - [Restore] → revert to previous version

**Interactions:**

- **[Edit] button:** Toggle edit mode
- **[Download] button:** Export as markdown or PDF
- **[Share] button:** Generate shareable link (expires in 24h)
- **Usage link click:** Navigate to bid + requirement
- **[View Diff]:** Modal showing old vs. new content
- **[Restore] button:** Confirm dialog → reverts to selected version
- **[Archive] button:** Mark as archived (hidden from KB search, kept for history)
- **[Delete] button:** Confirm dialog → permanently delete
- **Keyboard shortcuts:**
  - `E` → Edit
  - `A` → Archive
  - `H` → View history
  - `Esc` → Close detail

**Empty State (no content):**

```
┌────────────────────────────────┐
│  No content yet                │
│                                │
│  [Edit] to add content.        │
└────────────────────────────────┘
```

**Data Refresh mechanism:**

- Health score recalculated daily (decay applied nightly)
- Usage count synced every hour
- Version history updated immediately on edit

---

### 4.3.7 Seller Profile & Capabilities

**Purpose:**
Seller organization profile, verification tier progression, and capability declarations management.

**Existing spec retained. Add:**

- **Verification Tier Progression:**
  - Visual stepper: Basic → Verified → Certified
  - **Basic (default):** Self-registered, no verification required
  - **Verified:** 3 criteria met (SOC 2 Type II OR ISO 27001, 2+ customer references, ≥50% Q&A response rate)
  - **Certified:** All 6 criteria met (all above + active Marketplace listing 90+ days, 4.5+ star rating, <5% disqualification rate)
  - Each tier unlocks features (Verified = priority Marketplace ranking, Certified = premium badge + featured listing)
  - Criteria checklist: ✓ met, ⧐ in progress, ✗ not met
  - [Apply for Verification] button → submits tier upgrade request (reviewed by Sourcera staff)

- **Capability Declaration Detail:**
  - Fields:
    - Name: (e.g., "SOC 2 Type II Compliance")
    - Category: Dropdown (Security & Compliance, Integration Technical, Operational Maturity, Company Profile)
    - Description: rich text (max 500 chars)
    - Maturity Level: Dropdown (Basic, Intermediate, Advanced, Enterprise)
    - Evidence Files: file upload (certifications, case studies, reference letters)
  - Verification status: Self-declared, Verified (by Sourcera), Certified
  - [Edit], [Request Verification], [Archive] buttons
  - Usage count: "Referenced in 3 vendor profiles, 2 marketplace listings"

---

### 4.3.8 Q&A (Seller)

**Purpose:**
Mirror of Buyer Q&A from seller perspective. Shows Q&A threads where this vendor has asked/answered questions. Phase 6-8, Business+ only.

**Phase Availability:** Phases 6-8
**Plan Gate:** Business+ only

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ Q&A Threads (Seller)                                        │
│ Active Bids / Phase 6-8                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Questions Used: 12 / 50 (Business+ limit)                  │
│                                                              │
│  Filters: [Bid ▼] [Status ▼] [Replied]                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Q# Bid Name           Question              Status     │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ Q1 ERP Selection      Can requirements...  Answered    │ │
│  │ Q2 Cloud Migration    Is there a volume... Pending     │ │
│  │ Q3 Security Audit     Timeline for...      Answered    │ │
│  │                                                        │ │
│  │ [Show more (9 questions)]                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ⓘ Phase 8+ and Phase 9+: You can view but not reply.     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Key Components / Sections:**

1. **Question Counter**
   - "12 / 50 questions used"
   - Warning (red) when ≥90% quota used

2. **Filter Bar**
   - Bid dropdown (scoped to this vendor's bids)
   - Status: All, Pending (no answer yet), Answered
   - Replied toggle: show only questions I've answered

3. **Question List**
   - **Q#**: Question ID (clickable → detail)
   - **Bid Name**: buyer's workspace name
   - **Question**: First 80 chars + "..."
   - **Status**: Pending (yellow), Answered (green)

4. **Question Detail** (same as Buyer Q&A, but seller perspective)
   - Full question text
   - Answers (read-only in Phase 8+)
   - [Reply] button (disabled Phase 8+, shows "This phase is closed for seller input.")
   - [Mark Helpful] (seller can mark answers helpful)

**Phase-Lock Behavior:**

- **Phase 6–7 (Can ask/answer):**
  - Vendor can see all Q&A threads
  - Vendor can post new questions
  - Vendor can answer buyer questions
  - Vendor can reply to answers

- **Phase 8 (Read-only for vendors):**
  - Vendor can view all Q&A
  - Vendor cannot post new questions
  - Vendor cannot reply to answers
  - Message: "This phase is closed for vendor input."

- **Phase 9+ (Fully read-only):**
  - View only
  - All posting disabled

**Vendor Question Limit:**
- Business+ plan: 50 questions per workspace (shared with Buyer limit)
- Enterprise: 50 + 10 (with formal request)

**Interactions:**

- **Question list row click:** Navigate to question detail
- **[Reply] button:** Focus reply box (phase-dependent)
- **[Mark Helpful]:** Toggle heart icon

**Empty State:**

```
┌────────────────────────────────┐
│  No questions yet              │
│                                │
│  Questions will appear here    │
│  once buyers ask (Phase 6+).   │
└────────────────────────────────┘
```

**Data Refresh mechanism:**

- Question list synced every 10 seconds
- New answers posted in real-time via WebSocket

---

### 4.3.9 NDA Review

**Purpose:**
Review and sign NDA document for a bid. Supports PDF preview, custom terms, and sign/decline actions.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ NDA Review: ERP Selection (Acme Corp)                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  NDA Type: Mutual NDA                                        │
│  Status: ⧐ Pending Signature                                │
│  Sent: 2 days ago  |  Expires: 5 days from now             │
│  Counter-party: Acme Corp (Procurement Lead)                │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [PDF Document Preview]                                 │ │
│  │                                                        │ │
│  │ MUTUAL NON-DISCLOSURE AGREEMENT                        │ │
│  │                                                        │ │
│  │ This Agreement is entered into as of [date] between: │ │
│  │                                                        │ │
│  │ • Party A: Your Company Name                          │ │
│  │ • Party B: Acme Corp                                  │ │
│  │                                                        │ │
│  │ 1. Confidential Information                           │ │
│  │ ...                                                    │ │
│  │                                                        │ │
│  │ [Scroll to view full document or download PDF]       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Custom Terms (Optional)                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Additional clauses or modifications:                   │ │
│  │                                                        │ │
│  │ "Data will be processed only within European Union   │ │
│  │  territories per GDPR requirements."                 │ │
│  │                                                        │ │
│  │ [Edit] [View History]                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Expiration Date: 2027-04-14 (1 year from signature)        │ │
│                                                               │
│  Actions                                                     │
│  [Sign & Accept] [Decline & Explain] [Request Changes]      │
│                                                              │
│  ℹ Signing this NDA allows you to access the full bid      │
│  workspace and view all buyer requirements. Declining will  │
│  remove you from this bid.                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Key Components / Sections:**

1. **NDA Header**
   - NDA type: Mutual, Unilateral (Buyer→Seller), Unilateral (Seller→Buyer)
   - Status badge: ⧐ Pending (yellow), ✓ Executed (green), ✗ Declined (red), ⊘ Expired (gray)
   - Sent date + expiration countdown

2. **Counter-party Info**
   - Party name + contact person + title

3. **PDF Document Preview**
   - Embedded PDF viewer (full document)
   - Scroll to read full text
   - [Download PDF] button

4. **Custom Terms Section** (if buyer added addendums)
   - Read-only display of custom terms
   - [View History] button → shows previous versions of custom terms
   - [Edit] button (if negotiation stage, future)

5. **Expiration Date**
   - Calculated from signature date + term (e.g., 1 year)

6. **Action Buttons**
   - [Sign & Accept] → electronic signature (e-signature via DocuSign or similar)
   - [Decline & Explain] → modal with reason text (max 500 chars)
   - [Request Changes] → modal to propose custom terms (future negotiation flow)

**Interactions:**

- **PDF viewer:** Scroll, zoom, download
- **[Sign & Accept]:** Open e-signature modal (name + email confirmation, sign button)
- **[Decline & Explain]:** Modal with reason field + confirm button
  - On decline: NDA status updates to "Declined", vendor removed from bid workspace, email sent to buyer
- **[Request Changes]:** Modal with proposed custom terms text + submit button (initiates negotiation, future)
- **Keyboard shortcuts:**
  - `S` → Sign
  - `D` → Decline
  - `R` → Request changes

**Phase-Lock Behavior:**

- All phases: NDA Review available until signed or expired
- Signing NDA grants access to bid workspace content

**Empty State (no NDA):**

```
┌────────────────────────────────┐
│  No NDA for this bid yet       │
│                                │
│  Buyer will send NDA when      │
│  you're invited to respond.    │
└────────────────────────────────┘
```

**Data Refresh mechanism:**

- NDA status synced in real-time
- Custom terms updates reflected immediately

---

### 4.3.10 Marketplace Listings (Seller)

**Purpose:**
Manage seller's marketplace presence. Create, edit, publish, and archive vendor product listings.

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ My Marketplace Listings                      [+ New Listing] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Title             Status    Category  Views  EOIs Last  │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ Acme ERP          Published ERP       342    8   2d ago │ │
│  │ CloudDynamics CFO Published Finance   156    3   1w ago │ │
│  │ TechCore Platform Draft     Tech      —      —   3d ago │ │
│  │ Integration Svcs  Archived  Services  —      —   1m ago │ │
│  │                                                        │ │
│  │ [Publish] [Edit] [Archive]  (actions per row)          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Listing Detail / Edit Form:**

```
┌──────────────────────────────────────────────────────────────┐
│ Edit Listing: Acme ERP                                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ☐ Basic Info              ☐ Features & Capabilities        │
│  ☐ Pricing & Integrations  ☐ Resources & Media              │
│                                                               │
│  Basic Info                                                  │
│  ────────────────────────────────────────────────────────  │
│  Title: [Acme ERP                        ] (max 100)        │
│  Tagline: [Unified ERP Suite for...      ] (max 150)        │
│  Description: [Rich text editor          ]                  │
│  Category: [ERP ▼]                                          │
│  Industry Tags: [Technology] [SaaS] [Finance] [+ Add]      │
│                                                               │
│  Pricing & Integrations                                     │
│  ────────────────────────────────────────────────────────  │
│  Pricing Model: [Per-Seat ▼]                               │
│  Price: [$450 / user / year]                               │
│  Volume Discounts: [☑ Yes, enter details...]              │
│  Integrations: [Salesforce] [SAP] [NetSuite] [+ Add]      │
│                                                               │
│  Features & Capabilities                                    │
│  ────────────────────────────────────────────────────────  │
│  ☐ Feature 1: Multi-currency support (50+ currencies)      │
│  ☐ Feature 2: Real-time reporting & analytics              │
│  ☐ Feature 3: API-first architecture                       │
│  [+ Add Feature]                                            │
│                                                               │
│  Certifications: [SOC 2] [ISO 27001] [GDPR] [+ Add]        │
│                                                               │
│  Resources & Media                                          │
│  ────────────────────────────────────────────────────────  │
│  Documentation URL: [https://docs.acmeerp.com]             │
│  Demo Video URL: [https://youtube.com/...                 │
│  Case Studies: [Upload file(s)]                            │
│  Company Logo: [Upload]                                     │
│                                                               │
│  Status: Draft (Not published)                             │
│                                                               │
│  [Save Draft] [Publish] [Cancel]                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Key Components / Sections:**

1. **Listing Table**
   - Columns: Title, Status, Category, Views, EOIs, Last Updated
   - Status badges: Published (green), Draft (yellow), Archived (gray)
   - Actions per row: [Publish] (if draft), [Edit], [Archive] (if published), [Unarchive] (if archived)

2. **Create/Edit Form** (sectioned tabs or collapsible)
   - **Basic Info:**
     - Title (required, max 100 chars)
     - Tagline (required, max 150 chars)
     - Description (required, rich text markdown)
     - Category (required, dropdown: ERP, CRM, HCM, Finance, etc.)
     - Industry tags (optional, multi-select or free-form)

   - **Pricing & Integrations:**
     - Pricing model (required, dropdown: Per-Seat, Flat, Usage-based, Tiered)
     - Price (required, $ input)
     - Volume discounts (optional, checkbox + table for discount tiers)
     - Integrations (optional, multi-select from pre-populated list + custom add)

   - **Features & Capabilities:**
     - Feature list (add/remove rows): name + description
     - Certifications (multi-select: SOC 2, ISO 27001, GDPR, FedRAMP, HIPAA, etc.)

   - **Resources & Media:**
     - Documentation URL (optional)
     - Demo video URL (optional)
     - Case studies (file upload, multiple)
     - Company logo (image upload)

3. **Status Indicator**
   - Shows: Draft (not published) or Published
   - Publish date / view count (if published)

4. **Action Buttons**
   - [Save Draft] → saves form without publishing
   - [Publish] → makes listing public on Marketplace (shows confirmation)
   - [Cancel] → discard changes, return to listing table
   - [Archive] (from published listing) → removes from public Marketplace but retains in archive

**Interactions:**

- **[+ New Listing] button:** Open blank edit form
- **[Edit] button:** Open existing listing in edit form
- **[Publish] button:** Confirmation modal → "This will make your listing public on the Marketplace"
- **[Archive] button:** Confirmation modal → "This will remove your listing from the Marketplace (can be re-published later)"
- **[Unarchive] button:** Re-publish archived listing
- **[+ Add Feature/Integration/Certification]:** New input row appears
- **Category dropdown:** Pre-populated list from Marketplace
- **Keyboard shortcuts:**
  - `N` → New listing
  - `S` → Save draft
  - `P` → Publish
  - `A` → Archive

**Empty State:**

```
┌────────────────────────────────┐
│  No listings yet               │
│                                │
│  [+ New Listing]               │
│  Start by creating your first  │
│  marketplace listing.          │
└────────────────────────────────┘
```

**Data Refresh mechanism:**

- View count synced every 30 minutes
- EOI count synced every 60 seconds
- Listing status updates reflected immediately on publish/archive

---

## 4.4 Page Specifications — Shared / Cross-Console

### 4.4.1 Settings Pages

**Purpose:**
Comprehensive account and organization management. Split into User Settings (profile, notifications, security) and Organization Settings (plan, members, integrations, audit logs).

**User Settings Sections:**

#### Profile

```
┌──────────────────────────────────────────────────────────┐
│ Settings → Profile                                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Profile Picture                                         │
│  [👤 Avatar] [Change Photo] [Remove]                   │
│                                                          │
│  Name: [First] [Last]        (both required)           │
│  Email: your@email.com       (read-only from WorkOS)   │
│  Timezone: [UTC-8 (Pacific) ▼]                         │
│  Locale: [English ▼]                                   │
│                                                          │
│  [Save Changes]                                         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- Fields: name (required), email (read-only), avatar upload, timezone, language/locale
- [Save Changes] button
- Avatar upload: drag-drop or file picker, max 5MB

#### Notifications

```
┌──────────────────────────────────────────────────────────┐
│ Settings → Notifications                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Notification Preferences                               │
│                                                          │
│  Event Type               In-App  Email   Frequency     │
│  ─────────────────────────────────────────────────────  │
│  Requirement Updated       ☑       ☐     Immediate     │
│  Vendor Response Submitted ☑       ☑     Immediate     │
│  SLA Warning              ☑       ☑     Immediate     │
│  Phase Advanced           ☐       ☑     Daily Summary  │
│  Q&A New Answer           ☑       ☑     Immediate     │
│  NDA Signed/Declined      ☑       ☑     Immediate     │
│  Team Invitation          ☑       ☑     Immediate     │
│  [+ Add Custom Rule]                                    │
│                                                          │
│  [Save Preferences]                                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- Table: Event Type (from Appendix C), Channel checkboxes (In-App, Email), Frequency dropdown (Immediate, Daily, Weekly, Never)
- [+ Add Custom Rule] button → create custom notification rule (future)
- [Save Preferences] button

#### Security

```
┌──────────────────────────────────────────────────────────┐
│ Settings → Security                                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Two-Factor Authentication (MFA)                        │
│  Status: ☑ Enabled                                      │
│                                                          │
│  MFA Methods:                                            │
│  ☑ TOTP App (Google Authenticator)    [Manage]         │
│  ☐ WebAuthn (Security Key)            [Set Up]         │
│                                                          │
│  Password (Email/Password Auth Only)                   │
│  Last Changed: 45 days ago                             │
│  [Change Password]                                      │
│                                                          │
│  Active Sessions                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Device          Last Active    Location  IP      │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ Chrome, Mac     2 mins ago     San Fran  1.2.3.4 │ │
│  │ Safari, iPhone  1 hour ago     San Fran  5.6.7.8 │ │
│  │ [Revoke] [Revoke All]                            │ │
│  └──────────────────────────────────────────────────┘ │
│                                                          │
│  [Save Security Settings]                              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- MFA enrollment: TOTP (setup via QR code), WebAuthn (setup via browser native API)
- Password change: only for email/password auth (not SSO users)
- Active sessions list: device info, last active, location (geo-IP), IP address
- [Revoke] per session, [Revoke All] button

#### API Tokens

```
┌──────────────────────────────────────────────────────────┐
│ Settings → API Tokens                                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [+ Create New Token]                                   │
│                                                          │
│  Your Tokens                                             │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Name        Created    Last Used  Scopes  Action │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ Integration 3 days ago 2h ago    read   [⊗]    │ │
│  │ Dashboard   1 week ago 5d ago    admin  [⊗]    │ │
│  │ [Revoke]                                         │ │
│  └──────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- [+ Create New Token] → modal with name, scopes (multi-select), expiration (optional)
- Token table: name, created date, last used, scopes, copy button, revoke button
- [Copy] button → copies token to clipboard (display masked after creation: "sk-...9abc")

#### Keyboard Shortcuts

```
┌──────────────────────────────────────────────────────────┐
│ Settings → Keyboard Shortcuts                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Shortcut Reference                                     │
│                                                          │
│  Navigation                                              │
│  / — Search / Jump to...                               │
│  ? — Show this help                                     │
│  G H — Go to Home / Dashboard                           │
│                                                          │
│  Workspace                                               │
│  N — New workspace                                      │
│  E — Edit workspace settings                            │
│  G — Go to phase gate validation                        │
│                                                          │
│  [+ Customize Shortcuts] (future)                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- Read-only reference table: shortcut key(s), description
- [Customize Shortcuts] button (future feature for user-defined shortcuts)

#### Data & Privacy

```
┌──────────────────────────────────────────────────────────┐
│ Settings → Data & Privacy                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Data Export (GDPR / Data Portability)                 │
│  [Request Data Export]                                  │
│  → You'll receive a downloadable archive of your data   │
│     within 30 days.                                     │
│                                                          │
│  Account Deletion (GDPR / Right to Erasure)            │
│  [Request Account Closure]                              │
│  → Deletes all personal data (30-day grace period).    │
│                                                          │
│  Privacy Policy: [View] [Download PDF]                 │
│  Terms of Service: [View] [Download PDF]               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- [Request Data Export] → modal confirm, initiates export (email sent with link)
- [Request Account Closure] → modal with warnings, confirms 30-day grace period, initiates deletion

---

**Organization Settings Sections:**

#### General

```
┌──────────────────────────────────────────────────────────┐
│ Settings → Organization → General                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Organization Name: [Company Inc.      ]               │
│  Organization Slug: [company-inc]      (auto-generated) │
│  Logo: [🏢 Logo] [Change] [Remove]                     │
│  Billing Email: [billing@company.com]                  │
│                                                          │
│  [Save Changes]                                         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- Organization name, slug (read-only), logo upload, billing email

#### Plan & Billing

```
┌──────────────────────────────────────────────────────────┐
│ Settings → Organization → Plan & Billing                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Current Plan: Business+ ($x/month)                    │
│  Seats: 5 (limit: 10)                                  │
│  Overage Cost: 0 ($0)                                  │
│                                                          │
│  [Upgrade to Enterprise] [View Pricing] [Manage Plan]   │
│                                                          │
│  Invoice History                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Invoice Date       Amount  Status    [Download] │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ 2026-04-01        $500     Paid      PDF       │ │
│  │ 2026-03-01        $500     Paid      PDF       │ │
│  │ [View All]                                      │ │
│  └──────────────────────────────────────────────────┘ │
│                                                          │
│  [View Payment Methods] [Manage Subscription]          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- Current plan name + price + seat info
- [Upgrade], [View Pricing], [Manage Plan] buttons
- Invoice history table: date, amount, status, download link
- [View Payment Methods] (linked to Stripe billing portal)

#### Members

```
┌──────────────────────────────────────────────────────────┐
│ Settings → Organization → Members                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [+ Invite Member]                                      │
│                                                          │
│  Team Members (5)                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Name          Email        Role       Last Active │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ Sarah Chen    sarah@c.com  Owner      2h ago    │ │
│  │ James R.      james@c.com  Admin      1d ago    │ │
│  │ Maria S.      maria@c.com  Member     3d ago    │ │
│  │ [Pending Invitation]                            │ │
│  │ [Role ▼] [Remove]                               │ │
│  └──────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- [+ Invite Member] → modal with email, role selection
- Members table: name, email, role (dropdown), last active
- [Remove] button per member (with confirmation)
- Pending invitations shown separately (with resend/cancel options)

#### Teams

```
┌──────────────────────────────────────────────────────────┐
│ Settings → Organization → Teams                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [+ Create Team]                                        │
│                                                          │
│  Teams                                                   │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Name        Console    Members  SLA Health  Act  │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ Buyer Eval  Buyer      4        82% (Good) [>] │ │
│  │ Seller Resp Seller     2        90% (Great)[>] │ │
│  │ [Detail] [Edit] [Delete]                        │ │
│  └──────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- [+ Create Team] → modal with name, description, console selection (Buyer/Seller)
- Teams table: name, console badge, member count, SLA health %, actions
- [Detail] → navigate to Team Management page (see 4.4.5)

#### Security & SSO

```
┌──────────────────────────────────────────────────────────┐
│ Settings → Organization → Security & SSO                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  SSO Configuration (Enterprise only)                    │
│  Status: ☑ Enabled                                      │
│                                                          │
│  Provider: [SAML 2.0 ▼]                                │
│  Issuer URL: [https://.../.well-known/openid...]      │
│  Signing Certificate: [Upload]                         │
│                                                          │
│  MFA Enforcement (Organization-level)                  │
│  ☐ Require MFA for all users (Enterprise only)        │
│                                                          │
│  [Test SSO Connection] [Save]                         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- SSO connection status (connected/pending/error)
- SAML config fields: Issuer URL, signing certificate, metadata
- [Test SSO Connection] button
- MFA enforcement toggle (Enterprise only)

#### SCIM (Enterprise only)

```
┌──────────────────────────────────────────────────────────┐
│ Settings → Organization → SCIM                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  SCIM Provisioning (Enterprise only)                    │
│  Status: ☑ Enabled                                      │
│                                                          │
│  Endpoint URL: [https://sourcera.app/scim/v2/...]     │
│  Bearer Token: [sk-scim_...] [Copy] [Regenerate]      │
│                                                          │
│  Sync Status                                             │
│  Last Sync: 2 hours ago                                │
│  Provisioned Users: 12                                  │
│  Deprovisioned Users: 2                                 │
│  Pending Actions: 0                                     │
│                                                          │
│  [View Sync Log] [Manual Sync Now]                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- SCIM endpoint URL (read-only, copyable)
- Bearer token display + regenerate button
- Sync stats: last sync, provisioned count, deprovisioned count
- [View Sync Log], [Manual Sync Now] buttons

#### Integrations

```
┌──────────────────────────────────────────────────────────┐
│ Settings → Organization → Integrations                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Slack                                                   │
│  [☑ Connected] (last sync: 2h ago)                     │
│  Channel: #procurement                                  │
│  Events: Workspace Created, Vendor Response, SLA Alert │
│  [Disconnect] [Reconfigure]                            │
│                                                          │
│  Microsoft Teams                                        │
│  [☐ Not Connected]                                      │
│  [Connect Now]                                          │
│                                                          │
│  Salesforce (CRM Sync)                                 │
│  [☑ Connected] (last sync: 1d ago)                     │
│  Organization: [Salesforce Org ID]                     │
│  [Disconnect] [Sync Now]                               │
│                                                          │
│  Webhooks                                                │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Endpoint          Events              Status     │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ https://api.c.c   workspace.advanced  Active    │ │
│  │ https://api.d.c   vendor.response     Active    │ │
│  │ [Edit] [Test] [Disable]                         │ │
│  └──────────────────────────────────────────────────┘ │
│  [+ Add Webhook]                                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- Slack/Teams integration cards with status, channel, event selection, connect/disconnect buttons
- Salesforce sync status, organization ID, sync button
- Webhooks table: endpoint, events, status, actions
- [+ Add Webhook] → modal with endpoint URL, event selection, test button

#### Audit Logs (Enterprise only)

```
┌──────────────────────────────────────────────────────────┐
│ Settings → Organization → Audit Logs                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Filters: [User ▼] [Action ▼] [Entity ▼] [Date Range] │
│  Search: [Filter logs...]                              │
│                                                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Timestamp     User      Action    Entity Details │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ 2026-04-11    Sarah C.  Created   Workspace     │ │
│  │ 10:42 AM                          "ERP Selection"│ │
│  │               IP: 1.2.3.4                        │ │
│  │                                                  │ │
│  │ 2026-04-11    James R.  Modified  Requirement   │ │
│  │ 09:15 AM                          #42           │ │
│  │               IP: 5.6.7.8                        │ │
│  │                                                  │ │
│  │ [View Details] [Expand] [Copy Log]               │ │
│  └──────────────────────────────────────────────────┘ │
│                                                          │
│  [Export CSV] [Download All Logs]                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- Searchable table: timestamp, user, action, entity type, details, IP address
- Filters: user, action type, entity type, date range
- [View Details] → expanded view of full log entry (JSON-like structure)
- [Export CSV], [Download All] buttons

---

**Workspace Settings (Buyer only):**

#### General

```
┌──────────────────────────────────────────────────────────┐
│ Workspace Settings → General                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Workspace Name: [ERP Selection         ]              │
│  Description: [Rich text editor         ]              │
│                                                          │
│  [Save Changes]                                         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- Editable name (required) + description (markdown)

#### Scoring Configuration

```
┌──────────────────────────────────────────────────────────┐
│ Workspace Settings → Scoring Configuration              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Default Scoring Model: [Weighted ▼]                   │
│  (Linear, Weighted, Custom)                             │
│                                                          │
│  Scoring Scale: [0-10 ▼]                               │
│  (0-10, 0-100)                                          │
│                                                          │
│  Evaluation Rubric (EJ Framework)                       │
│  Custom description for scoring guidance:              │
│  [Rich text editor...]                                  │
│                                                          │
│  [Save Changes]                                         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- Default scoring model (affects Scoring Matrix)
- Scoring scale selection
- Custom EJ rubric definition (optional)

#### Phase Management

```
┌──────────────────────────────────────────────────────────┐
│ Workspace Settings → Phase Management                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Current Phase: 9 (Vendor Evaluation)                  │
│  ◯────◯────◯────◯────●────◯────◯────◯────◯────◯──◯──◯ │
│                                                          │
│  Phase History                                           │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Phase  Entered    Owner      Duration  Notes    │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ 1      2026-03-01 Sarah C.   5 days   Draft    │ │
│  │ 5      2026-03-06 Sarah C.   3 days   Ready    │ │
│  │ 6      2026-03-09 James R.   7 days   —        │ │
│  │ 9      2026-03-16 Sarah C.   (current)         │ │
│  └──────────────────────────────────────────────────┘ │
│                                                          │
│  Gate Validation                                         │
│  ⚠ Incomplete: 44 requirements unassigned              │
│  ✓ Vendors: 8 enrolled                                 │
│  ✓ SLA Compliance: 92%                                 │
│                                                          │
│  [Advance to Phase 10] (when gates pass)              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- Phase stepper showing current phase
- Phase history table: phase entered, owner, duration, notes
- Gate validation checklist (with pass/fail status)
- [Advance to Phase X] button (enabled when gates pass)

#### Members

```
┌──────────────────────────────────────────────────────────┐
│ Workspace Settings → Members                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [+ Invite Member]                                      │
│                                                          │
│  Members (4)                                             │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Name     Role        Permissions    Last Active │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ Sarah C. Workspace   [Edit] [View]  2h ago     │ │
│  │          Owner                                   │ │
│  │ James R. Reviewer    [View]         1d ago     │ │
│  │ Maria S. Editor      [Edit] [View]  3d ago     │ │
│  │ [Guests]                                        │ │
│  │ client@  (1-week    [View] only    5d ago     │ │
│  │ buyer.c  read-only)                            │ │
│  │ [Edit Permissions] [Remove] [Extend Access]    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                          │
│  Permission Profiles                                     │
│  Owner — Full edit access, phase advancement           │
│  Editor — Can edit requirements and team assignments   │
│  Reviewer — Read and comment only                       │
│  Guest — Temporary read-only access (expires)          │
│                                                          │
│  [Save Changes]                                         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- [+ Invite Member] → modal with email, role, expiration (for guests)
- Members table: name, role (dropdown), permissions (multi-select: Edit, View), last active
- Guest management: expiration date, extend access option
- Permission profiles explanation (read-only reference)

#### TCO Configuration

```
┌──────────────────────────────────────────────────────────┐
│ Workspace Settings → TCO Configuration                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Default Projection Years: [3 ▼] (1-10)               │
│  Default Seat Count: [150]                             │
│  Annual Seat Growth: [5]%                              │
│                                                          │
│  [Save Changes]                                         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- Projection years, seat count, growth rate (used as defaults in TCO Dashboard)

#### Export

```
┌──────────────────────────────────────────────────────────┐
│ Workspace Settings → Export                             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Export Workspace Data                                   │
│  [Export as JSON] [Export as CSV] [Export as PDF Report]│
│                                                          │
│  Includes: Requirements, vendors, responses, scores,   │
│  Q&A threads, policies, audit trail                    │
│                                                          │
│  Export History                                          │
│  [View Previous Exports] [Download]                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- [Export] buttons for JSON, CSV, PDF formats
- Export history with download links

#### Archive/Delete

```
┌──────────────────────────────────────────────────────────┐
│ Workspace Settings → Archive / Delete                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Archive Workspace (Reversible)                         │
│  [Archive Workspace]                                    │
│  Archived workspaces are hidden but retained for audit  │
│  history. Can be unarchived anytime.                    │
│                                                          │
│  Delete Workspace (Irreversible, 14-day grace)         │
│  [Delete Workspace]                                     │
│  ⚠ WARNING: This will permanently delete all data.      │
│  14-day grace period for recovery.                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- [Archive Workspace] → confirmation modal
- [Delete Workspace] → confirm modal with 14-day grace period explanation

---

### 4.4.2 Onboarding Flows

#### Buyer Onboarding (7 steps)

```
┌──────────────────────────────────────────────────────────┐
│ Welcome to Sourcera — Step 1 of 7                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ● ○ ○ ○ ○ ○ ○  (progress stepper)                    │
│                                                          │
│  Step 1: Sign Up / Organization Intro                   │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  Welcome to Sourcera!                                    │
│  What brings you here?                                   │
│                                                          │
│  [◉ Procurement Lead]                                   │
│  [○ Evaluator]                                           │
│  [○ Invited to Team]                                     │
│                                                          │
│  [Next] [Skip] [Help]                                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Step 1: Sign Up / Intro**
- Single-task page, progress stepper at top (7 dots)
- "What brings you to Sourcera?" radio buttons (Procurement Lead, Evaluator, Invited to Team)
- WorkOS SSO button or email/password form
- [Next], [Skip], [Help] buttons

**Step 2: Organization Setup**
- Org name (auto-detected from email domain, editable)
- Logo upload (optional)
- Industry selection (dropdown)
- Company size (dropdown: 1-10, 11-50, 51-200, 201-500, 500+)
- [Next], [Back], [Skip] buttons

**Step 3: Team Setup**
- "Create your first team" header
- Team name (text input, pre-filled with "Main Team" or role-based)
- Team description (optional)
- Console selection: Buyer (active by default)
- "Invite team members" section: email list, role dropdown (Owner/Editor/Reviewer), [+ Add Row]
- [Next], [Back], [Skip] buttons

**Step 4: First Workspace**
- "Create your first procurement workspace"
- Workspace name (text input)
- Description (optional)
- Procurement type dropdown: Build vs. Buy, Multi-vendor Selection, Renegotiation, Replacement
- Expected timeline (dropdown: < 1 month, 1-3 months, 3-6 months, 6+ months)
- [Next], [Back], [Skip] buttons

**Step 5: First Use Case**
- "Define your evaluation scope"
- Use case name (text input)
- Description (optional, markdown)
- "Add from Template" secondary CTA → link to Template Library
- [Next], [Back], [Skip] buttons

**Step 6: First Requirement**
- "Add your first requirement"
- Requirement statement (text area)
- Type dropdown (Functional, Non-Functional, Legal, Commercial, Other)
- Granularity dropdown (Core, Use Case, Item)
- Inline tips showing requirement guidelines
- "Import from Policy" secondary CTA → link to Policy Ingestion
- [Next], [Back], [Skip] buttons

**Step 7: Dashboard Tour**
- Interactive walkthrough with overlays/tooltips
- Highlights: sidebar navigation, Pulse widget, Command Palette (Cmd+K), keyboard shortcuts hint
- "Start using Sourcera" button → navigates to dashboard
- [Skip Tour] button

**Setup Checklist** (Persistent sidebar widget during onboarding):
- Shows step-by-step progress
- Completed steps: checkmark
- Current step: highlighted
- Remaining steps: clickable to jump
- [Dismiss All] button
- Auto-dismisses when all steps completed
- Re-accessible from Settings → Onboarding → Resume Setup

---

#### Seller Onboarding (7 steps)

```
┌──────────────────────────────────────────────────────────┐
│ Welcome to Sourcera — Step 1 of 7                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ● ○ ○ ○ ○ ○ ○  (progress stepper)                    │
│                                                          │
│  Step 1: Invitation Arrival                             │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  You've been invited to respond to:                     │
│  "ERP Selection" (Acme Corp)                            │
│                                                          │
│  Get started:                                            │
│                                                          │
│  [Accept Invitation]  [Decline] [Learn More]           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Step 1: Invitation Arrival**
- Email from buyer with "You've been invited to respond to [Workspace Name]"
- CTA: [Accept Invitation] → proceeds to Step 2
- [Decline] button → optional reason field, closes invitation

**Step 2: Sign Up**
- Email/password or SSO
- If user already has account, auto-link to existing account (no new signup)

**Step 3: Account Linking**
- If user belongs to multiple orgs, select which org to use for this bid
- If new org, create new org (name, industry, size)

**Step 4: Profile Setup**
- Company name (required)
- Logo (optional, image upload)
- Website URL (optional)
- Industry (dropdown)
- Company description (optional, markdown)
- Verification tier display: "Basic" with checklist showing criteria to advance
  - Criteria: SOC 2/ISO 27001, customer references, Q&A response rate, etc.
- [Next], [Back] buttons

**Step 5: NDA Review**
- Show NDA document (PDF preview)
- NDA details: type (mutual/unilateral), counter-party, expiration
- [Sign NDA] → e-signature, [Decline] → explanation modal, [Review] → PDF modal

**Step 6: Capability Declarations**
- "Let buyers know what you excel at"
- Guided creation of 3-5 capabilities
- For each: Category selection (dropdown), description, evidence upload (optional)
- [+ Add Capability], [Remove] buttons
- [Next], [Back], [Skip] buttons

**Step 7: KB Setup**
- "Get ready to respond faster"
- "Add your first knowledge base entry" option
- "Configure documentation crawling" option (Firecrawl setup)
- Show benefits of KB for AI-assisted response drafting
- [Create Entry], [Configure Crawling], [Skip] buttons
- → Navigates to Knowledge Base page

---

#### Seller Magic-Link Hero Moment Landing — Phase 14.8 Polish (2026-04-27)

**Authoring intent.** Per Master Spec §22.20 (Seller Maya Surface Abstraction) and §48.8 (Seller Hero Moment & Onboarding Anti-Patterns), the magic-link Hero Moment is the canonical entry surface for the Seller Console on the Solo / Free tier. The seven-step wizard above remains authoritative for the **direct signup** path (a vendor who arrives at sourcera.com without a magic-link invitation). The Phase 14.8 polish below authoritatively supersedes the seven-step wizard whenever `MarketplaceInviteLink.invite_source ∈ {buyer_invite, ghost_bid_conversion, pro_trial_seat_m17}`, which is the dominant arrival path per the §48.8 Forced-Vendor-Signup playbook and the v7.0.0 PLG thesis.

**Master Spec / Appendix M cross-references:** §22.1 Audience Note (Seller Maya persona), §22.20 (Seller Maya Surface Abstraction — full sub-section), §22.20.2 (Capability Declarations chip list), §22.20.3 (KB governance silent engine + weekly notification), §22.20.4 (Match Score three-label compression), §22.20.5 (AIOp consumption silent on Solo / Free), §22.20.6 (this surface's engine-binding contract), §22.20.7 (acceptance criteria #79–#98), §48.8.2 (pre-arrival preparation), §48.8.3 (onboarding surface minutes 0–3), §48.8.4 (in-workspace value proof minutes 3–45), §48.8.5 (post-submission reveal hour 1+), §48.8.6 (three Conversion Moments UX), §48.8.7 (six banned anti-patterns), §22.18.4 KB Value Meter Seller Panel, §22.18.6 (three Stake-Reveal Moments), Appendix M rows "Seller Maya Surface Abstraction — Capability Declarations auto-publish (Phase 14.8 — closed)", "Seller Maya Surface Abstraction — KB governance silent engine + weekly notification (Phase 14.8 — closed)", "Seller Maya Surface Abstraction — Match Score three-label compression (Phase 14.8 — closed)".

**Persona anchor.** Per Master Spec §22.1 Audience Note: Seller Maya is title-agnostic — Account Executive, Solutions Engineer, or Bid Manager / Proposal Manager at a 50–500-person B2B SaaS vendor. None of these titles assume prior Sourcera experience, prior RFP-tooling experience, or familiarity with capability declarations, retrieval engineering, AIOperation metering, or match-scoring math. Every surface element below is authored against Maya's first-30-seconds comprehension test (§3.13 acid test).

**Five screens are authored here.** The five screens are the complete UX spec for the magic-link Hero Moment from invite-click through the Stake-Reveal Screen. Each screen binds to the §48.8 Stage timestamps on the `SellerOnboardingSession` entity (§4.4.22) and to the §22.20 compression rules.

##### Screen 1 — Magic-Link Landing Page (T = 0)

**Trigger.** Seller clicks the magic-link in the buyer's invitation email. HTTP GET on the `MarketplaceInviteLink.landing_url`. Pre-arrival preparation per §48.8.2 has already enriched the seller domain, inferred candidate categories, reserved Firecrawl quota, and pre-resolved a `kb_bootstrap` job — all hidden from this surface.

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│                          [Sourcera wordmark]                               │
│                                                                            │
│                                                                            │
│              Acme Corp wants you to bid on their CRM evaluation.           │
│                                                                            │
│              82 requirements  ·  Bidding closes April 30                   │
│                                                                            │
│                                                                            │
│              ┌──────────────────────────────────────────────┐              │
│              │   Accept this bid and draft your response    │              │
│              │              in 3 minutes  →                  │              │
│              └──────────────────────────────────────────────┘              │
│                                                                            │
│                                                                            │
│                  [no other actions on this surface]                        │
│                                                                            │
│                                                                            │
│  Privacy   ·   Terms                                                       │
└────────────────────────────────────────────────────────────────────────────┘
```

**Layout.**

- Single centered column, max width 640 px on desktop, 100% on mobile (`< 640px`); 64 px vertical rhythm; brand wordmark top-left.
- One H1: *"{Buyer Org} wants you to bid on their {bid summary noun}."* — `fontSize.display.medium` per §2.1 typography (`fontWeight.semibold`, `color.text.primary`). Display-medium not display-large because the line wraps on mobile and display-large breaks the comprehension cadence.
- One sub-headline: *"{requirement_count} requirements · Bidding closes {bid_close_date}"* — `fontSize.body.large`, `color.text.secondary`.
- One primary CTA button: *"Accept this bid and draft your response in 3 minutes →"*. Token: `button.primary.large` (height 56 px), `color.bg.primary-strong`, `color.text.on-primary`. Centered. No secondary CTA.
- Footer: only "Privacy" and "Terms" text-links (legal compliance per §48.8.3 UX surface specification). No upgrade callouts. No pricing-page link. No "Learn more about Sourcera" link. No newsletter signup.

**Forbidden affordances (per §48.8.7 anti-patterns).**

- Zero form fields beyond the SSO/magic-link flow that the CTA initiates (§48.8.7 AP5).
- No credit-card input (§48.8.7 AP1).
- No modal dialogs of any kind, including cookie-consent modals (use a non-blocking bottom-right banner per §45.x cookie-consent pattern).
- No upgrade CTA, no pricing-page link, no "Try Pro free for 14 days" link (§48.8.7 AP6).
- No "Learn more" or "How it works" secondary link (kills decisiveness).

**Behavior.**

1. **Render.** First paint p95 ≤ 500 ms on a 3G-throttled mobile device per §48.8.3 AC #5; CI Lighthouse test asserts.
2. **Click — primary CTA.** SSO initiation begins. `stage_2_sso_initiated_at` written on the `SellerOnboardingSession` row per §4.4.22. The SSO flow (Google / Microsoft) opens in the same window; magic-link fallback offered if SSO unavailable (existing §48.8.3 fallback path).
3. **Mobile.** Layout collapses to single column with the CTA full-width; tap targets follow the Master Spec §38.6.2 per-tier minimum. Sub-headline wraps to two lines on `< 640px`.
4. **Reduced motion (§9.6).** No motion on this surface — page renders statically; CTA hover does not animate.

**Telemetry.** `stage_1_arrival_at` written at HTTP GET; `stage_2_sso_initiated_at` written at CTA click (existing §48.8.3 contract; no new events).

##### Screen 2 — In-SSO Progress-Storytelling (T = 15 s – 90 s)

**Trigger.** SSO redirect completes; the pre-resolved `kb_bootstrap` job (§22.10.3 `agent_sourcera_kb_bootstrap_v9`) transitions to `execution_state = 'executing'`. Seller is parked on this screen while the four §22.20.6 polish status lines render literally true progress.

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│                          [Sourcera wordmark]                               │
│                                                                            │
│                                                                            │
│                                                                            │
│              ✓  Scanning yourcompany.com…                                  │
│                                                                            │
│              ◐  Found your help center…                                    │
│                                                                            │
│              ◯  Drafting responses for Acme Corp's 82 requirements…        │
│                                                                            │
│              ◯  Your bid is ready to review.                               │
│                                                                            │
│                                                                            │
│                                              elapsed: 0:24                 │
└────────────────────────────────────────────────────────────────────────────┘
```

**Layout.**

- Same single-column 640 px layout; brand wordmark top-left.
- Four status lines, stacked vertically, 24 px line height, 32 px row gap. Each line carries a left-edge state indicator: `✓` (completed), `◐` (in flight, animated when motion permitted), `◯` (pending). Indicator color: completed = `color.bg.positive`, in-flight = `color.bg.accent`, pending = `color.text.tertiary`. The fourth ("Your bid is ready to review") line stays at `◯` until the engine signals Bid Workspace populator readiness.
- Active line text in `color.text.primary, fontWeight.semibold`; pending lines in `color.text.secondary, fontWeight.regular`. Completed lines fade to `color.text.tertiary, fontWeight.regular` after their indicator advances.
- Bottom-right elapsed-seconds counter, monospaced (`font.family.mono`, `fontSize.body.small`), `color.text.tertiary`. Format: `M:SS` (e.g., `0:24`); rolls over to `MM:SS` past 1 minute.

**Status-line variant set (Phase 14.8 polish per §22.20.6).**

The second line copy varies based on the first Firecrawl-resolved page's category tag per `firecrawl_resolution_status_line_variant_enum` (Authored Extension, Appendix J — five values):

| Variant | Copy |
| :---- | :---- |
| `security_documentation` | *"Found your security documentation…"* |
| `help_center` | *"Found your help center…"* |
| `product_docs` | *"Found your product docs…"* |
| `api_docs` | *"Found your API docs…"* |
| `trust_center` | *"Found your trust center…"* |

Variant selected at render time from `Firecrawl.first_resolved_page_category` (Authored Extension field — §22.6 entity denormalization, flagged in `_integration/RECONCILIATION.md → Phase 14.8`). When no source page is resolved within 8 s of `kb_bootstrap` start, the second line falls back to *"Reading your website…"* (no source-category hint) per the §48.8.3 AC #8 literal-truth invariant.

**Behavior.**

1. **Indicator advancement.** Each line's indicator advances from `◯ → ◐ → ✓` in sync with the underlying engine event: `kb_bootstrap.firecrawl_started` advances line 1 to `◐`; `kb_bootstrap.firecrawl_first_resolved` advances line 1 to `✓` and line 2 to `◐`; `kb_bootstrap.first_pass_response_started` advances lines 1 and 2 to `✓` and line 3 to `◐`; `populator.bid_workspace_populator_ready` advances all to `✓` and triggers redirect to Screen 3.
2. **Indicator animation (`◐` in flight).** A 1.5-second-period pulse (opacity 0.4 → 1.0 → 0.4 ease-in-out) on the in-flight indicator. Reduced-motion (§9.6) replaces the pulse with a static `◐` indicator.
3. **Elapsed counter.** Increments every second from `stage_2_sso_completed_at` (i.e., counter starts when SSO completes, not when the user clicks the CTA on Screen 1; this avoids surfacing SSO-redirect latency that the user did not initiate).
4. **Anti-pattern enforcement (§48.8.3 AC #8 / §48.8.7 AP7).** No status line may render `◐` more than 500 ms before its underlying engine event begins. CI fuzz test asserts under contrived latency profiles. Faking progress is banned.
5. **Latency breach (§48.8.3 AC #7 / Stage 3 latency target).** If `stage_3_population_latency_ms > 10,000`, the surface continues to render (does NOT swap to a degraded state); the engine fires `hero_moment_latency_breached` and pages on-call. The seller continues to wait; the elapsed counter keeps ticking truthfully.
6. **Capability degradation.** If `first_pass_response` capability is unavailable per §48.8.3 Failure Mode #2, line 3 swaps to *"Drafting responses is taking a moment longer — your knowledge base is ready in the meantime."* and line 4 swaps to *"Open your knowledge base →"* with a CTA that routes to the empty Bid Workspace with KB-Draft-only mode per §48.8.3.
7. **Mobile.** Same vertical stack; status lines remain 24 px line height; elapsed counter moves to bottom-center.

**Telemetry.** Existing §48.8.3 events: `seller_onboarding_stage_entered {stage=2,3}`, `seller_invite_pre_arrival_enrichment_completed`, `kb_bootstrap.firecrawl_started`, `kb_bootstrap.first_resolved`, `first_pass_response_started`, `populator.bid_workspace_populator_ready`. No new events from §22.20.6 polish.

##### Screen 3 — Bid Workspace First Paint with Hero Moment Counters (T = 90 s)

**Trigger.** `populator.bid_workspace_populator_ready` fires. The Bid Workspace surface renders with the §48.8.3 landing counter at first paint, plus the §22.20.6 fourth counter line conditional on P ≥ 1.

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [Sourcera wordmark]   Acme Corp · CRM Evaluation     [seller avatar ▼]   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────────────────────────┐                          │
│  │   Your bid is ready.                         │                          │
│  │                                              │                          │
│  │   47 AI drafts prepared.                     │                          │
│  │   31 cite evidence from your website.        │                          │
│  │   16 answers ready to review with one click. │                          │
│  │                                              │                          │
│  │   Review time: ~22 min.                      │                          │
│  └──────────────────────────────────────────────┘                          │
│                                                                            │
│  ───  Receive  ───  Draft  ●  Review  ───  Submit  ───                     │
│                                                                            │
│  Requirement 1 of 82                                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ R-001 · Multi-tenant data isolation                                  │  │
│  │ ─────────────────────────────────────────────────────────────────    │  │
│  │ Acme requires logical multi-tenant data isolation with per-tenant    │  │
│  │ encryption keys.                                                     │  │
│  │                                                                      │  │
│  │ Draft (✓ cite-verified):                                             │  │
│  │   Our platform isolates each tenant's data in a dedicated logical    │  │
│  │   schema with tenant-scoped encryption keys derived from a per-      │  │
│  │   tenant KEK.  [from: yourcompany.com/trust/multi-tenant-isolation]  │  │
│  │                                                                      │  │
│  │   [ Accept ]   [ Edit ]   [ Reject ]                                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Layout.**

- Top app-shell bar: brand wordmark, bid context label (`{Buyer Org} · {Workspace name}`), seller avatar dropdown. Per existing §3.1 Application Shell.
- **Hero Moment counter card** (top-center of the canvas, 480 px max width, `card.elevated` token, `radius.lg`, `padding.6`):
  - Line 1 (H2): *"Your bid is ready."* — `fontSize.heading.medium`, `fontWeight.semibold`, `color.text.primary`.
  - Lines 2–4 (body, 8 px row gap):
    - *"**{N}** AI drafts prepared."* — N from `stage_3_first_pass_response_requirement_count`.
    - *"**{M}** cite evidence from your website."* — M from `stage_3_first_pass_response_cited_count`.
    - *"**{P}** answers ready to review with one click."* — P from the count of first-pass drafts that pass `cite_verify` AND have `confidence_score ≥ 0.85`. **Conditional render: line 4 renders ONLY when P ≥ 1**; when P = 0, the line is suppressed and lines 2 and 3 render as a two-line counter. Per Master Spec §22.20.7 AC #98.
  - Line 5 (body, 16 px top gap): *"Review time: ~{X} min."* — X from the median review-time estimate.
  - All numerics in `fontWeight.semibold`; surrounding text in `fontWeight.regular`. Numerics are `color.text.primary`; surrounding text is `color.text.secondary`.
  - No CTA on this card. The card is read-only; the operator advances by interacting with the requirement list below.
- **Compressed pipeline indicator** (centered below the counter card): renders the §22.19 four-step compressed bar (Receive → Draft → Review → Submit) per `UX_Design_of_Sourcera.md` §5.2.19 PipelineSurface (`solo` state). Active step = current `pipeline_stage_id` per §22.19.1; on first paint of the Hero Moment, the active step is **Draft**.
- **Requirement list.** Stacked per-requirement cards (existing §4.3.4 Response Editor pattern), one card per requirement; first card auto-focuses for keyboard navigation. Each card carries the requirement title, requirement description, the AI-drafted response with the inline citation chip, and the three action buttons (Accept / Edit / Reject).
- **What does NOT render on Solo / Free** per §22.20:
  - No AIWallet balance counter (per §22.20.5 / Phase 14.10).
  - No per-entry KB staleness badge in any surface other than the inline citation hover (per §22.20.3).
  - No "Add a Capability Declaration" prompt; the chip list renders on Stake-Reveal (Screen 5) instead (per §22.20.2).
  - No numeric Match Score reference; if the buyer's listing-card surface is exposed (e.g., from a Marketplace cross-link), the three-label compression renders (per §22.20.4).
  - No "Tour" or "Take a quick walkthrough" modal (per §48.8.7 AP8).
  - No "Name your workspace" prompt (per §48.8.7 AP9).

**Behavior.**

1. **First paint.** Counter card renders within 500 ms of `populator.bid_workspace_populator_ready` per §48.8.3 AC #9. All counter values are derived from `SellerOnboardingSession.stage_3_*` fields; no hardcoded or aspirational numbers.
2. **Counter line 4 conditional.** Engine reads `count(KBEntry.id WHERE bid_id = current AND cite_verify_passed = true AND confidence_score >= 0.85)` at first paint; renders line 4 if ≥ 1, suppresses if 0. Per AC #98 fixture test asserts both branches.
3. **Compressed pipeline indicator behavior.** Inherits all behaviors from §5.2.19 PipelineSurface: click-to-jump (read-only navigation), keyboard navigation with Tab/Enter, mobile bottom-sheet expansion, reduced-motion handling. The active step animates from "Receive" to "Draft" on first paint per §3.14.3 #3 (within-step engine advancement does not animate; cross-step boundary advancement animates).
4. **Requirement card focus.** First card auto-focuses on first paint; arrow keys navigate to next/prev card; `Enter` activates the focused Accept button; `e` opens Edit; `r` opens Reject (custom keyboard shortcuts authored in §3.7 keyboard shortcut reference).
5. **Mobile.** Counter card collapses to full-width with 16 px lateral padding; lines 2–4 (and 5) compress to a single-line bullet list per `UX_Design_of_Sourcera.md` §3.4 Responsive Layouts pattern. Compressed pipeline indicator becomes the segmented control per §3.14.3 #5. Requirement cards stack 1-column with 16 px gap.
6. **Empty Hero Moment (capability degradation).** If `stage_3_first_pass_response_requirement_count = 0` (capability degradation per §48.8.3 Failure Mode #2), the counter card renders *"Your knowledge base is ready. Drafts are coming — refresh in a moment."* with a single inline "Refresh" CTA. The fourth line is suppressed (no drafts to count).

**Telemetry.** Existing §48.8.3 events fire: `hero_moment_completed`, `hero_moment_first_edit` (on first Accept/Edit/Reject click), `hero_moment_latency_breached` (if breach), `first_pass_response_capability_degradation_triggered` (if degradation). No new events from §22.20.6 polish; the conditional fourth-line render is asserted by AC #98 fixture rather than telemetry.

##### Screen 4 — Citation Inline Hover with Phase 14.8 Polish (Contextual)

**Trigger.** Maya hovers (or taps on mobile) the inline citation chip on any requirement card's drafted response. The Citation Inline Card surface per existing §22.7 / §48.8.4 expands.

```
┌──────────────────────────────────────────────────────────┐
│  from: yourcompany.com/trust/multi-tenant-isolation      │
│  ──────────────────────────────────────────────────────  │
│  "We isolate each tenant's data in a dedicated logical   │
│  schema with per-tenant encryption keys derived from a   │
│  per-tenant KEK."                                        │
│                                                          │
│  [ Open source ↗ ]   [ This isn't from my company ⚠ ]    │
│                                                          │
│  ─────────────  (only when entry is flagged_stale)  ──── │
│  ⚠ This is from older content — review and update?       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Layout.**

- Hover-card (or tap-card on mobile) anchored to the citation chip; 360 px max width on desktop, full-width modal on mobile (≤ `< 640px`).
- Top line: source-URL preview, `fontSize.body.small`, `color.text.secondary`, truncated with ellipsis on long URLs.
- Quoted-sentence block: indented 16 px, italic, `color.text.primary`. The exact sentence the citation references (per §22.7 Citation Inline Card contract).
- Two action affordances side-by-side:
  - *"Open source ↗"* — opens the source URL in a new tab.
  - *"This isn't from my company ⚠"* — fires `kb_citation_provenance_disputed` event per §48.8.4 telemetry; routes to Ops review queue.
- **Phase 14.8 polish — staleness contextual annotation (per §22.20.3 Edge Case #2 and §22.20.6).** When the cited `KBEntry.review_state ∈ {flagged_stale, review_overdue}`, the card renders a divider rule and a quiet annotation below the affordances:
  - Divider: 1 px `color.border.muted`, 8 px vertical padding above and below.
  - Annotation copy: *"⚠ This is from older content — review and update?"* — `fontSize.body.small`, `color.text.warning-soft`, with a clickable "review and update?" text-link that routes to the entry's edit page (per `UX_Design_of_Sourcera.md` §4.3.6 KB Entry Detail).
  - When `review_state ∈ {fresh, review_due}`, the divider and annotation are suppressed.

**Behavior.**

1. **Hover trigger (desktop).** Card renders within 200 ms of hover-intent detection per §3.3 hover-card pattern. Card dismisses on pointer-out with 100 ms grace window.
2. **Tap trigger (mobile).** Tap on the chip opens the card as a bottom-sheet modal; tap-outside or `×` dismisses.
3. **Source-URL fallback (per §48.8.4 Failure Mode #4).** When the source URL is no longer reachable (404 / source-removed), the card renders *"Source no longer available — your KB still cites the quoted sentence"* in place of the "Open source ↗" affordance.
4. **Staleness annotation does NOT render on sSt+ (per existing §22.5 surface).** On sSt+, the existing §22.18.4 KB landing screen per-entry staleness badges already surface the same information; the inline contextual annotation is a Solo / Free polish that compensates for the badge suppression per §22.20.3.
5. **Reduced motion (§9.6).** Card render is instant (no fade / no slide); dismissal is instant.
6. **Keyboard.** `Tab` from the chip into the card; `Enter` activates the focused affordance; `Esc` dismisses.

**Telemetry.** Existing `kb_citation_provenance_disputed` per §48.8.4. New event registered in Appendix G: `kb_citation_inline_card_staleness_annotation_rendered {seller_org_id, kb_entry_id, requirement_id, review_state ∈ {flagged_stale, review_overdue}, plan_tier}` — fires when the staleness annotation renders on a Solo / Free citation hover (Authored Extension event per §22.20.6 polish).

##### Screen 4b — KB-Gap Detector Empty State Polish (Contextual)

**Trigger.** Maya clicks **Reject** on a requirement card. The §48.8.4 Workflow #5 KB-Gap Detector renders inline below the requirement's drafted response.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ R-008 · Disaster recovery RPO / RTO                                      │
│ ────────────────────────────────────────────────────────────────────     │
│ Acme requires documented RPO ≤ 1 hour and RTO ≤ 4 hours with quarterly   │
│ DR drills.                                                               │
│                                                                          │
│ Draft:  __NO_KB_MATCH__  (no source matched this requirement)            │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐     │
│ │ No KB content answered this. Write your answer below and we'll   │     │
│ │ save it as a KB entry.                                           │     │
│ │                                                                  │     │
│ │ ┌──────────────────────────────────────────────────────────────┐ │     │
│ │ │ Acme requires documented RPO ≤ 1 hour and RTO ≤ 4 hours      │ │     │
│ │ │ with quarterly DR drills.                                    │ │     │
│ │ │ ___                                                          │ │     │
│ │ │                                                              │ │     │
│ │ │                                                              │ │     │
│ │ └──────────────────────────────────────────────────────────────┘ │     │
│ │                                                                  │     │
│ │ Tip: anything you write here teaches your knowledge base.        │     │
│ │ Future bids reuse it automatically.                              │     │
│ │                                                                  │     │
│ │   [ Save as KB entry ]   [ Cancel ]                              │     │
│ └──────────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────────┘
```

**Layout.**

- KB-Gap Detector card per existing §48.8.4 Workflow #5 contract: stacked below the requirement card's drafted response (which renders the literal `__NO_KB_MATCH__` placeholder per §22.10.2 First-Pass Responder workflow), `padding.4`, `border.radius.lg`, `background.color.subtle`.
- Header copy: *"No KB content answered this. Write your answer below and we'll save it as a KB entry."*
- Textarea: min 4 lines, autosizes per `FormField` (§5.2.13) tokens. Placeholder text reproduces the requirement's prompt, prepended with `___` cursor indicator on focus.
- **Phase 14.8 polish — empty-state educational annotation (per §22.20.6).** Below the textarea and above the action buttons, render the educational annotation:
  - Copy: *"Tip: anything you write here teaches your knowledge base. Future bids reuse it automatically."* — `fontSize.body.small`, `color.text.tertiary`.
  - **Conditional render: annotation visible only when `count(KBEntry WHERE org_id = current AND lifecycle_state = 'active') < 5`.** When the seller's KB has ≥ 5 active entries, the annotation is suppressed (the educational copy is most valuable in the Hero Moment first-time-with-no-bootstrap path).
- Action buttons: *"Save as KB entry"* primary, *"Cancel"* secondary, right-aligned.

**Behavior.**

1. **Render.** KB-Gap card renders within the same viewport on Reject click — no modal redirect per §48.8.4 AC #14.
2. **Save as KB entry.** Creates a new `KBEntry` row with `created_via = 'q_and_a_onboarding_rejection'`, `confidence_score = 0.5` initial, `body_markdown = textarea_content`, and attaches it to the bid response. Save latency ≤ 1 second p95 per §48.8.4 AC #14.
3. **Annotation suppression beyond 5 entries.** Engine reads `count(KBEntry WHERE org_id = current AND lifecycle_state = 'active')` at render; suppresses annotation if ≥ 5. The threshold is engine-configurable (default 5) but not seller-facing.
4. **Mobile.** Card stacks within the requirement's vertical scroll; textarea full-width and button tap targets follow the Master Spec §38.6.2 per-tier minimum.

**Telemetry.** Existing `kb_entry.q_and_a_onboarding_created` per §48.8.4. New event: `kb_gap_detector_educational_annotation_rendered {seller_org_id, requirement_id, kb_entry_count_at_render, annotation_visible ∈ {true, false}}` (Authored Extension per §22.20.6 polish).

##### Screen 5 — Stake-Reveal Screen on Submission (T = first_bid_submitted_at)

**Trigger.** Maya clicks Submit on the whole bid; `first_bid_submitted_at` writes; the Bid Workspace transitions to the Stake-Reveal Screen per §48.8.5.

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│                         [Sourcera wordmark]                                │
│                                                                            │
│                                                                            │
│              You just built a reusable knowledge base of                   │
│                                                                            │
│                  47 verified entries in 22 minutes.                        │
│                                                                            │
│              Your next bid will reuse them automatically.                  │
│                                                                            │
│                                                                            │
│  ─────  You captured 47 answers worth saving. Your next bid starts here.   │
│                                                                            │
│                                                                            │
│  Your profile is now discoverable for:                                     │
│                                                                            │
│   [ CRM ]  [ Sales Engagement ]  [ Lead Scoring ]  [ + Add ]               │
│                                                                            │
│                                                                            │
│  Your profile is live: sourcera.com/sellers/acme-analytics                 │
│                                                                            │
│                                                                            │
│  [ ] Share anonymized win/loss signals to improve match quality.           │
│      You can change this anytime in Settings.                              │
│                                                                            │
│  Your knowledge base will stay fresh automatically as long as you submit   │
│  at least one bid every 90 days.                                           │
│                                                                            │
│                                                                            │
│              [ Back to your workspace ]   ·   Settings                     │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Layout.**

- Single centered column, max width 720 px desktop, 100% mobile; 96 px vertical rhythm; brand wordmark top-center.
- **Primary copy** (H1): *"You just built a reusable knowledge base of **{N}** verified entries in **{X}** minutes. Your next bid will reuse them automatically."* — `fontSize.display.large`, `fontWeight.semibold`. N from `count(KBEntry WHERE source IN {bootstrap_accepted, first_pass_edited, q_and_a_onboarding_rejection} AND created_during_session)`; X = `activation_metric_elapsed_seconds / 60`.
- **Phase 14.8 polish — non-monetary stake summary (per §22.20.5 / §22.20.6 / Master Spec AC #97).** The §48.8.5 Workflow #3 monetary value-price accounting line ("Sourcera tracked $Y.YY of value pricing for the AI work on this bid") is **NOT rendered** on Solo / Free. In its place renders:
  - Single line, divider rule above (8 px above the line, 8 px below): *"You captured **{Q}** answers worth saving. Your next bid starts here."* — `fontSize.body.large`, `fontWeight.semibold` on the numeric, `fontWeight.regular` on the surrounding text. Q from the count of session-created KBEntries with `lifecycle_state = 'active'` (same set as N — typically Q = N).
  - On sSt+, the §48.8.5 monetary line continues to render per existing contract; the non-monetary summary above is Solo / Free–specific.
- **Phase 14.8 polish — discoverable-categories chip list (per §22.20.2 / §22.20.6).** Below the non-monetary summary:
  - Header line: *"Your profile is now discoverable for:"* — `fontSize.body.medium`, `color.text.secondary`.
  - Chip row: chips render for each auto-published `CapabilityDeclaration` with `state = 'published'` (sourced from the §22.18.3.5 nightly batch that completed during the Hero Moment Stage 5 `page_enrichment` window). Each chip uses `chip.elevated` token, `padding.x.4 padding.y.2`, `radius.full`, `color.bg.subtle`, `color.text.primary`. Up to 6 chips inline; "+N more" affordance expands to a non-modal drawer if more than 6.
  - Trailing chip: *"+ Add"* — opens the typeahead picker against `CapabilityRegistryEntry` per §22.20.2 chip-list editability contract.
  - **Empty-state** (no auto-published declarations yet — first-Hero-Moment, batch hasn't run yet): row renders *"We'll figure out your categories from the responses you drafted and the website we just scanned. Check back tomorrow."* with a single "+ Add a category now" affordance.
  - **Pre-seeded state** (Marketplace Tagger pre-arrival inferred candidates per §48.8.2 Workflow #2): row renders the candidate chips with a quiet *"Suggested from your website — confirm these are right"* annotation; Maya can confirm or remove individually.
- **Published Seller Profile link** per §48.8.5 Workflow #4: *"Your profile is live: **sourcera.com/sellers/{slug}**"* — `fontSize.body.medium`, slug rendered in `font.family.mono`. Click opens in new tab; writes `stage_5_profile_url_rendered` per §4.4.22.
- **Seller Signals opt-in** per §48.8.5 Workflow #5: checkbox + label *"Share anonymized win/loss signals to improve match quality. You can change this anytime in Settings."* — `fontSize.body.medium`, default unchecked (opt-in not opt-out per §48.8.5 AC #23).
- **KB freshness reminder** per §48.8.5 Workflow #6: *"Your knowledge base will stay fresh automatically as long as you submit at least one bid every 90 days."* — `fontSize.body.medium`, `color.text.secondary`. No upgrade CTA.
- **Single exit action** per §48.8.5 UX Surface Specification: primary button *"Back to your workspace"* (or *"View your Seller Profile"* depending on cohort); secondary text-link *"Settings"* with minor visual weight.

**Forbidden affordances on Solo / Free (per §22.20.5 / §48.8.7 / §48.8.5 AC #20).**

- No upgrade CTA of any kind. No "Upgrade to Starter" button. No "See all features" link. No pricing page crosslink. No "Your KB can grow to 1,000 entries on Starter" banner. UX fixture snapshot test asserts zero upgrade-tagged elements render on this screen per §48.8.5 AC #20.
- No monetary value-price accounting line per §22.20.5.
- No AIWallet balance counter per §22.20.5.

**Behavior.**

1. **First paint.** Stake-Reveal renders within 500 ms of bid-submit confirmation per §48.8.5 AC #19.
2. **Numeric substitution.** N, X, Q all substituted from the engine-read snapshot at transaction boundary; if backfill miscount > 1, surface re-renders within 2 seconds per §48.8.5 Failure Mode #2.
3. **Chip-list interactivity.** Add / remove / rename per the §22.20.2 chip-list editability contract; chip-list edit operations land on the same `CapabilityDeclaration` rows the buyer-side directory reads. AC #82, #83, #84 assert.
4. **Dwell measurement.** On navigate-away, `stage_5_dwell_seconds` writes. Target ≥ 20 s for 70% of activated sellers per §48.8.5 AC #21.
5. **Mobile.** Single-column layout collapses to 16 px lateral padding; chip row wraps to multiple lines; primary CTA full-width.

**Telemetry.** Existing §48.8.5 events fire: `seller_onboarding_stage_entered {stage=5}`, `stake_reveal_rendered`, `stake_reveal_navigated_away`, `seller_signals_opt_in`. The §22.18.6 `stake_reveal_rendered {reveal_moment = free_tier_kb_landing}` extended event fires per §22.18.6.4. New §22.20.2 events on chip interactions: `capability_declaration_chip_edited`. No retirement of any §48.8.5 event.

##### Cross-Screen Acceptance Criteria (Phase 14.8 Polish — Roll-Up)

The acceptance criteria authored in Master Spec §22.20.7 are the authoritative engine-binding criteria for this surface. The UX-side criteria below extend the §48.8 numeric series (continuing from §48.8 AC #41+) and assert the surface rendering specifically.

41. **Magic-Link Landing Page first paint p95 ≤ 500 ms** on a 3G-throttled mobile device per §48.8.3 AC #5. Lighthouse CI test asserts.
42. **Zero form fields on Magic-Link Landing Page** before SSO initiation per §48.8.3 AC #6. UX-snapshot test asserts; any change adding a form field fails CI.
43. **Status-line variant set rendered correctly** per the Phase 14.8 polish variant table. UX fixture snapshot test asserts that each variant key in `firecrawl_resolution_status_line_variant_enum` maps to its canonical copy; copy drift fails CI.
44. **Hero Moment fourth counter line conditional render.** When P ≥ 1, line 4 renders; when P = 0, line 4 is suppressed. UX fixture test asserts both branches per Master Spec §22.20.7 AC #98.
45. **Citation Inline Card staleness annotation conditional render.** When `KBEntry.review_state ∈ {flagged_stale, review_overdue}`, the annotation renders; otherwise suppressed. UX fixture test asserts both branches.
46. **KB-Gap Detector educational annotation conditional render.** When `count(KBEntry WHERE lifecycle_state = 'active') < 5`, the annotation renders; otherwise suppressed. UX fixture test asserts both branches.
47. **Stake-Reveal non-monetary stake summary copy.** On `plan_tier = seller_free`, the summary line renders verbatim per §22.20.6; the §48.8.5 Workflow #3 monetary line is suppressed. UX fixture snapshot test asserts; copy drift fails CI per Master Spec §22.20.7 AC #97.
48. **Stake-Reveal discoverable-categories chip list.** The chip list renders the auto-published `CapabilityDeclaration` rows joined to `CapabilityRegistryEntry.display_name` (with `display_label_override` precedence on the seller's profile-public page only). Empty-state and pre-seeded-state copies render per the Phase 14.8 polish surface.
49. **Stake-Reveal zero upgrade CTAs.** UX fixture snapshot test asserts no upgrade-tagged element renders on the Stake-Reveal surface for `plan_tier = seller_free` per §48.8.5 AC #20 + §22.20.5 + §22.20.7 AC #95.
50. **Reduced-motion compliance across all five screens.** Per §9.6, reduced-motion replaces all motion (CTA hover transitions, status-line indicator pulses, stake-reveal numeric tickers if any) with instant snaps. Reduced-motion fixture test asserts.

**First-30-Seconds Test self-check (per Master Spec §3.13).**

Each of the five screens has been audited against the §3.13 acid test ("Would a panicked first-timer understand this surface element in the first 30 seconds with no training?"). Audit findings:

- **Screen 1.** Pass. The H1 names the buyer; the sub-headline names the deadline; the CTA promises the time commitment. Maya knows what's on offer in under 5 seconds.
- **Screen 2.** Pass. Each status line is plain English; the elapsed counter sets honest expectations; nothing requires Sourcera vocabulary to interpret.
- **Screen 3.** Pass. The counter card uses arithmetic ("47 prepared. 31 cite evidence. 16 ready to review."), not jargon ("AIOperations settled. Capability Declarations published."). The compressed pipeline indicator uses domain-native verbs (Receive / Draft / Review / Submit) with no Sourcera nouns.
- **Screen 4.** Pass. The hover surfaces only the source-URL preview, the quoted sentence, and two plain-English actions. The staleness annotation is one line of warning copy with one verb ("review").
- **Screen 5.** Pass. The H1 uses arithmetic and a promise ("Your next bid will reuse them automatically"). The chip list uses category names; the "discoverable" verb is domain-native; the chips are visually obvious as adjustable units.

No screen requires explanation of `pipeline_stage_id`, `Capability Declaration`, `AIOperation`, `Match Score`, `KB Health Model`, `OutcomeContract`, or any other Sourcera-specific noun.

##### First 30 Seconds — Screen 1, Magic-Link Landing Page (per §1.4)

Retro-documented under Phase 14.17. Conformant to the §1.4.1 four-bullet template. Screen 1 (T = 0) is the canonical first surface a Seller Maya touches when the magic-link arrival path is in force (`MarketplaceInviteLink.invite_source ∈ {buyer_invite, ghost_bid_conversion, pro_trial_seat_m17}` — the dominant arrival path per the v7.0.0 PLG thesis). Screens 2–5 are audited in narrative form by the existing "First-30-Seconds Test self-check" above; this sub-section formalizes Screen 1 against the §1.4.1 template.

1. **What the user sees.** A nearly-empty centered page with the Sourcera wordmark top-left, one display-medium headline reading "{Buyer Org} wants you to bid on their {bid summary noun}." (e.g., "Acme Corp wants you to bid on their CRM evaluation."), a 1-line metadata strap reading "{N} requirements · Bidding closes {date}," and a single full-width primary button reading "Accept this bid and draft your response in 3 minutes →." A "Privacy" and "Terms" footer is the only other content.
2. **What they understand without training.** "{Buyer} is asking my company to bid on something specific; if I click that button I'll be drafting a response in three minutes."
3. **What they do next.** Clicks the single primary CTA (which initiates SSO).
4. **What is hidden, and why.** The `MarketplaceInviteLink` row and its `invite_source` enum, the `SellerOnboardingSession` (§4.4.22) Stage 1 / Stage 2 timestamps, the §48.8.2 pre-arrival enrichment job (domain enrichment, candidate-category inference, Firecrawl quota reservation), the queued `agent_sourcera_kb_bootstrap_v9` job (§22.10.3), the AIOperation metering for the upcoming first-pass response generation (§22.20.5 — silent on Solo / Free), the auto-publish of `CapabilityDeclaration` rows (§22.20.2), the seller-side compressed pipeline projection (Receive / Draft / Review / Submit), the Match Score three-label compression (§22.20.4), and the KB governance silent engine (§22.20.3) are engine constructs the seller never names. Codified by Appendix M rows "Seller Maya Surface Abstraction — Capability Declarations auto-publish (Phase 14.8 — closed)," "Seller Maya Surface Abstraction — KB governance silent engine + weekly notification (Phase 14.8 — closed)," "Seller Maya Surface Abstraction — Match Score three-label compression (Phase 14.8 — closed)," and the AIOperation row in the Architecture block. The §48.8.7 Banned Anti-Patterns enforce the absence: zero form fields beyond the SSO flow (AP5), zero credit-card input (AP1), zero modal dialogs including cookie consent (use bottom-right banner), zero upgrade CTAs / pricing-page links / "Try Pro free" links (AP6), zero "Learn more" or "How it works" secondary links. The §22.20.7 ACs #79–#98 lock the absences.

Cross-references: Master Spec §3.13 (Principle 9 — Surface Simplicity, Engine Complexity); Master Spec §22.1 Audience Note (Seller Maya persona); Master Spec §22.20 (Seller Maya Surface Abstraction); Master Spec §48.8 (Seller Hero Moment & Onboarding Anti-Patterns); Master Spec §48.8.7 (Banned Anti-Patterns); Master Spec Appendix M rows above; `UX_Design_of_Sourcera.md` §1.4 (First-30-Seconds Test); the cross-screen "First-30-Seconds Test self-check" earlier in this sub-section (Screens 2–5 audit).

---

#### "What Are You Evaluating?" Intake (Phase 14.7 — 2026-04-27)

**Authoring intent.** Per Master Spec §13.12 and §4.5.9 EvalStarter, this is the canonical Workspace-creation intake surface for the Buyer console. It is rendered in two contexts: (a) inline as Step 4 of the Buyer Onboarding sequence above, and (b) standalone whenever a returning user clicks the "New Evaluation" CTA in the §11.4 persistent UI. The component is identical across both contexts — only the surrounding sequencer differs. The legacy Step 4 affordances ("Custom SaaS Evaluation", "Security-First Evaluation", "Compliance Evaluation" linking to Template Gallery) are superseded by this intake; pre-built Template Library entries remain accessible from inside the materialized Workspace per §19.

**Master Spec / Appendix M cross-references:** §13.12 (intake authoritative spec), §13.12.2 (surface), §13.12.4 (materialization), §13.12.5 (Other / free-text path), §13.12.6 (deprecated-slug routing), §13.12.7 ("What we filled in for you" callout), §13.12.8 (edge cases), §13.12.10 (acceptance criteria), §4.5.9 EvalStarter (registry entity), Appendix J `EvalVertical` (enum), Appendix M rows "What Are You Evaluating?" Intake and Workspace pre-population materializer in Scoring Engine block, Appendix M Per-Vertical Eval Starters (Phase 14.7 — closed) row.

**Two screens are authored here:**

1. **Intake Screen** — single question, six tiles + free-text "Other" + muted "blank Workspace" link.
2. **Post-Selection Landing Screen** — the materialized Workspace's §11.3 detail surface with the "What we filled in for you" callout pinned top-right.

##### Screen 1 — Intake

```
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│                       What are you evaluating?                            │
│                                                                           │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│   │       [icon]     │  │       [icon]     │  │       [icon]     │      │
│   │       CRM        │  │       ITSM       │  │  EDR / Endpoint  │      │
│   │  Sales · Service │  │  Tickets · Asset │  │     Security     │      │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                           │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│   │       [icon]     │  │       [icon]     │  │       [icon]     │      │
│   │  Observability   │  │  Payroll / HRIS  │  │      Other       │      │
│   │  APM · Logs ·    │  │  Payroll · HRIS  │  │  Tell us in your │      │
│   │  Metrics         │  │  Benefits        │  │    own words     │      │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                           │
│   I want to start with a blank Workspace                                  │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

**Layout:**

- Single full-screen surface; no preamble, no helper copy above the heading, no progress stepper above the fold (the onboarding sequencer's stepper, when present, renders below the intake content per the §35.1 wrapper).
- Heading: "What are you evaluating?" — display-large per §2.1 typography (`fontSize.display.large`, `fontWeight.semibold`).
- Tile grid: 3 × 2 on desktop (≥ 1024px), 2 × 3 on tablet (640–1024px), 1 × 6 stacked on mobile (< 640px). Tile content sourced live from `EvalStarter.display_name`, `EvalStarter.short_description`, `EvalStarter.icon_token` per §4.5.9 AC #3 (60-second cache TTL).
- "Other" tile is the sixth in the grid; selecting it expands an inline single-line free-text input (1–120 characters) bounded by `FormField` (§5.2.13) tokens with a "Continue" button. The free-text input renders inline below the tile grid; the tiles remain visible.
- Below the tile grid: a muted text-link "I want to start with a blank Workspace" (`color.text.tertiary`, `fontSize.body.small`); selection materializes a blank Workspace per §13.12.2.

**Tile Component (`EvalVerticalTile`):**

| Token | Value |
|-------|-------|
| `tile.height.desktop` | 160px |
| `tile.height.mobile` | 96px |
| `tile.width.desktop` | 240px (min) — flexes to 1/3 of grid |
| `tile.width.mobile` | 100% |
| `tile.padding` | `spacing.6` (24px) |
| `tile.radius` | `radius.lg` (12px) |
| `tile.border.idle` | 1px `color.border.default` |
| `tile.border.hover` | 1px `color.accent` |
| `tile.border.focus` | 2px `color.accent` (focus ring per §G-05) |
| `tile.shadow.idle` | `shadow.sm` |
| `tile.shadow.hover` | `shadow.md` |
| `tile.icon.size` | 32px |
| `tile.icon.color` | `color.accent` |
| `tile.label.size` | `fontSize.body` (14px), `fontWeight.semibold` |
| `tile.sublabel.size` | `fontSize.body.small` (13px), `color.text.secondary` |
| `tile.transition.duration` | `motion.duration.fast` (160 ms) |
| `tile.gap.between` | `spacing.4` (16px) on desktop, `spacing.3` (12px) on mobile |

No new color tokens; the tile composes existing §2.2 tokens. Reduced-motion (§9.6) replaces the hover transition with an instant snap.

**Props (`EvalVerticalTile`):**

- `vertical` (object): the EvalStarter row's `{ vertical_slug, display_name, short_description, icon_token }`. Required.
- `selected` (boolean, default false): visual selected state during the brief click-to-materialization window.
- `onSelect` (function): callback invoked with `vertical_slug` on click. Required.
- `disabled` (boolean, default false): used during materialization to prevent double-click.

**Behavior — Intake Screen:**

1. **Render.** Six tiles rendered in the grid per the layout above. Tiles are rendered in the canonical order (CRM, ITSM, EDR, Observability, Payroll/HRIS, Other) — order is part of the surface contract, not derived from EvalStarter `sort_order` (which does not exist on EvalStarter; the order is encoded in the `EvalVertical` Appendix J enum order).
2. **Hover / focus.** Tile elevates from `shadow.sm` to `shadow.md` and the border transitions from default to accent color over 160 ms. Focus ring per §G-05.
3. **Click — vertical tile (CRM, ITSM, EDR, Observability, Payroll/HRIS).** All six default tiles transition to a brief `selected` state (accent border, no elevation change) and the surface immediately invokes the §13.12.4 materialization API. Tiles are disabled during the in-flight materialization to prevent double-click. On success, the surface navigates to the materialized Workspace's §11.3 detail surface with the Post-Selection Landing Screen rendered.
4. **Click — "Other" tile.** Expands an inline `FormField` (§5.2.13) below the tile grid with a single-line text input (1–120 characters), placeholder "What are you evaluating?", and a "Continue" button. The "Other" tile transitions to `selected`; other tiles remain interactive (the operator can change their mind by clicking another tile, which collapses the Other input). Submitting the Continue button (or pressing Enter in the input) invokes the §13.12.4 materialization with `vertical_slug=other` and `intake_freetext_label=<input>`. Empty submission is blocked by client-side validation; minimum 1 character.
5. **Click — "blank Workspace" link.** No confirmation; the surface immediately invokes the §13.12.2 blank-Workspace materialization path and navigates to the new Workspace.
6. **Materialization in flight.** The surface renders a `LoadingState` (§5.2 — `loading.full_screen`) overlay with the inline copy "Setting up your evaluation…" — duration must complete inside the §44 p95 budget (≤ 2.5s Free / ≤ 4.5s Starter+ per §13.12.4). The overlay does NOT decompose the request into multiple steps for the user (the materializer is one transaction per §13.12.4); a single spinner with the copy above is sufficient.
7. **Materialization failure.** The surface returns to the intake screen with a `ToastNotification` (§5.2.5 — `toast.error`) carrying the §3.7 generic-error copy "Something went wrong setting up your evaluation. Try again or start with a blank Workspace." Two toast actions: "Try again" (re-runs materialization with the same vertical) and "Start blank" (routes to the blank Workspace path).
8. **Mobile.** Tile grid stacks 1-column with tap targets following the Master Spec §38.6.2 per-tier minimum. The "Other" inline input expands below the tile that was tapped; no other layout changes.
9. **Empty active EvalStarter registry (defect path).** The tile grid renders empty (no tiles); the only affordance visible is the "blank Workspace" link plus a quiet inline note "We're not able to load evaluation starters right now. You can still start with a blank Workspace, and we'll be in touch." Telemetry per §13.12.8 #3.

**Behavior — "Other" inline text input:**

- Width: matches the tile grid column width (1/3 on desktop, 1/2 on tablet, full on mobile).
- Validation: 1–120 characters; HTML / script injection sanitized at write per §32 input validation.
- Keyboard: Enter submits; Escape collapses the input and de-selects the Other tile.
- Rate-limit feedback: if the buyer Org has hit the §13.12.5 25-Workspace-per-day cap, submission renders a `ToastNotification` (`toast.warning`) with copy "You've created your daily evaluation limit (25). Try again in {N} hours." Per §13.12.10.5 AC #20.

**Interaction State Catalog — Intake Screen:**

| State | Trigger | Visual | Notes |
|-------|---------|--------|-------|
| `idle` | Default | Tile grid rendered, no selection | |
| `tile-hover` | Mouse over tile | Border accent + elevated shadow + 160 ms transition | Desktop only |
| `tile-focus` | Keyboard focus on tile | Focus ring per §G-05 | Desktop and mobile |
| `tile-selected-pre-materialization` | Tile click | Tile border accent (no elevation); tiles disabled | Brief — typically < 200 ms before navigating |
| `other-input-expanded` | "Other" tile click | Inline FormField + Continue button rendered below the tile grid | Other tiles remain interactive |
| `other-input-validating` | Continue click | Inline character-count and validation state | |
| `materialization-in-flight` | Tile selection or Continue | `loading.full_screen` overlay with "Setting up your evaluation…" | Locked from interaction |
| `materialization-failure` | Materializer error | Returns to intake; `toast.error` with Try again / Start blank actions | |
| `rate-limit-blocked` | Daily cap reached | `toast.warning` per §13.12.5; intake screen remains usable for "blank Workspace" path which respects the same cap | |
| `empty-registry-defect` | No active EvalStarter rows | Empty tile grid + muted note + only the "blank Workspace" link visible | Engineering / Ops alert per §13.12.8 #3 |

**Accessibility — Intake Screen:**

- ARIA: tile grid uses `role="radiogroup"` with `aria-label="Choose what you are evaluating"`; each tile is a `role="radio"` element with `aria-checked` reflecting selection. The "Other" inline input uses `role="textbox"` with `aria-label="What are you evaluating?"`. The "blank Workspace" link uses standard `<a>` semantics.
- Keyboard: `Tab` moves between tiles and the blank-Workspace link; `Enter` / `Space` activates a tile (equivalent to click); arrow keys navigate within the radiogroup; `Esc` collapses the Other input when expanded.
- Screen reader: tile is announced as "{display_name}, {short_description}, radio button, {N} of 6, currently {checked / unchecked}." The "Other" input is announced with character-count feedback per the standard FormField pattern (§5.2.13).
- Color contrast: all tile states meet WCAG 2.1 AA (4.5:1 text, 3:1 non-text indicators) on both light and dark themes per §2.2 / §11.6.
- Reduced-motion (`prefers-reduced-motion: reduce`): hover transition snaps instantly; the loading overlay still renders but spinner animation respects reduced-motion per §9.6.
- First-30-Seconds Test (Master Spec §3.13 / Phase 14.17): the surface passes — a panicked first-timer sees the question, six labeled tiles, and an obvious "Other" path. No abbreviations, no jargon, no progress stepper above the fold.

##### Screen 2 — Post-Selection Landing ("What we filled in for you")

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  CRM evaluation                                                    │
│            │  ──────────────────────────────────────────────────────────────────│
│            │                                                                    │
│            │   ┌─────────────────────────────────────────────┐                  │
│            │   │ What we filled in for you — edit anything   │                  │
│            │   │ ──────────────────────────────────────────  │                  │
│            │   │ Vertical:    CRM  (v3)                      │                  │
│            │   │ Use Cases:   6 use cases · Show             │                  │
│            │   │ Requirements: 54 requirements · Show        │                  │
│            │   │ Vendors:     12 recommended vendors · Show  │                  │
│            │   │ Deadline:    May 25, 2026 (in 28 days) ·    │                  │
│            │   │              Change                         │                  │
│            │   │                                             │                  │
│            │   │              [ Got it ]                     │                  │
│            │   └─────────────────────────────────────────────┘                  │
│            │                                                                    │
│            │   [ Use Cases · Requirements · Vendors · Q&A · etc ]               │
│            │   [ Workspace overview content per §11.3 ]                         │
│            │                                                                    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Layout:**

- The materialized Workspace's §11.3 detail surface renders as authored.
- The "What we filled in for you" callout (§13.12.7) is pinned to the top-right of the content region for the first 60 seconds or until dismissed.
- After dismissal (or after 60 seconds elapsed), the callout collapses into a quiet "What we filled in for you" link in the §11.4 persistent UI re-openable for the life of the Workspace.

**Callout Component (`IntakeFillCallout`):**

| Token | Value |
|-------|-------|
| `callout.width.desktop` | 360px |
| `callout.width.mobile` | 100% (full-width card pinned to top of content region) |
| `callout.padding` | `spacing.6` (24px) |
| `callout.radius` | `radius.lg` (12px) |
| `callout.shadow` | `shadow.lg` |
| `callout.border` | 1px `color.border.default` |
| `callout.background` | `color.surface.elevated` |
| `callout.header.size` | `fontSize.body.large` (16px), `fontWeight.semibold` |
| `callout.row.gap` | `spacing.3` (12px) |
| `callout.row.label.color` | `color.text.secondary` |
| `callout.row.value.color` | `color.text.primary` |
| `callout.link.color` | `color.accent` |
| `callout.dismiss.timeout` | 60 seconds (auto-collapse to §11.4 link) |
| `callout.dismiss.transition` | `motion.duration.medium` + `motion.ease.standard` |

No new color tokens; composes existing §2.2 tokens. Reduced-motion replaces the dismiss transition with an instant collapse.

**Props (`IntakeFillCallout`):**

- `workspaceId` (UUID): the materialized Workspace. Required.
- `evalStarterSnapshot` (object): `{ vertical_slug, display_name, version, intake_freetext_label, use_cases_count, requirements_count, longlist_count, default_deadline_days, deadline_iso, truncation_applied (boolean), use_cases_truncated, requirements_truncated, marketplace_category_slug }`. Required.
- `planTier` (enum): `buyer_free` | `business_starter` | `business_growth` | `business_scale` | `buyer_enterprise`. Required (controls whether the truncation banner renders).
- `onDismiss` (function): callback invoked when "Got it" is clicked or the auto-dismiss timer fires.
- `onShowUseCases` / `onShowRequirements` / `onShowLonglist` / `onChangeDeadline` (functions): callbacks invoked by the row "Show" / "Change" links to scroll/navigate the parent surface.
- `onUpgrade` (function): invoked by the truncation-banner upgrade affordance; routes per §34.5.

**Behavior — Post-Selection Landing:**

1. **Render.** The callout renders pinned to the top-right of the §11.3 detail surface's content region with a subtle slide-in motion using `motion.duration.medium` + `motion.ease.standard` on first paint.
2. **Row layout.** Five rows: Vertical (display name + version on hover), Use Cases (count + "Show"), Requirements (count + "Show"), Vendors (count + "Show" OR "No recommendations seeded yet — search the Marketplace" link routed to §27 Marketplace search filtered to `evalStarterSnapshot.marketplace_category_slug`), Deadline (formatted date + "Change" link).
3. **Free-text vertical render.** When `evalStarterSnapshot.intake_freetext_label` is non-null, the Vertical row reads "Other — '{intake_freetext_label}'" and a sub-line beneath the row reads "We've started a generic Workspace — the defaults below are intentionally light, edit them as you go" per §13.12.5.
4. **Truncation banner (Free tier only).** When `planTier=buyer_free` AND `truncation_applied=true`, an inline banner renders below the five rows with copy "Trimmed to fit your Free plan — upgrade to Starter to keep the full {use_cases_truncated} additional Use Cases and {requirements_truncated} additional Requirements" and a single-click `Button` (§5.2.1 — primary variant, small size) "Upgrade to Starter" routed via `onUpgrade`.
5. **No-recommendations affordance.** When `evalStarterSnapshot.longlist_count === 0`, the Vendors row renders "No recommendations seeded yet — search the Marketplace" as a single accent-colored link routed to `/marketplace?category=<marketplace_category_slug>` via the parent's router. Hover state per `color.accent` link conventions; no separate icon.
6. **Dismissal.** Clicking the "Got it" button or the X icon (top-right of the callout) dismisses the callout immediately; reaching the 60-second auto-dismiss timer dismisses it identically. Both paths trigger the slide-out motion using `motion.duration.medium` + `motion.ease.standard`, and the callout collapses into a quiet "What we filled in for you" link in the §11.4 persistent UI.
7. **Re-open from collapsed state.** Clicking the §11.4 "What we filled in for you" link re-renders the callout pinned to top-right with no auto-dismiss timer (re-opened state stays open until explicitly dismissed via the X icon or "Got it" button).
8. **Mobile.** The callout renders as a full-width card pinned to the top of the §11.3 mobile layout content region; "Show" / "Change" links and the upgrade affordance retain their behavior; auto-dismiss timer is unchanged. Tap targets follow the Master Spec §38.6.2 per-tier minimum.
9. **Audit / telemetry.** The `workspace_intake_completed` PostHog event has already fired at materialization (§13.12.4 step 8 + §13.12.7); the callout itself emits no additional analytics events except `workspace_intake_callout_dismissed` (Authored Extension; flagged in `_integration/RECONCILIATION.md → Phase 14.7`) on either explicit or auto dismiss, with payload `{ workspace_id, dismissed_via ∈ {explicit_button, x_icon, auto_timer}, time_visible_ms }`.

**Interaction State Catalog — Post-Selection Landing Callout:**

| State | Trigger | Visual | Notes |
|-------|---------|--------|-------|
| `mounted` | Workspace landed from intake | Callout slides in from right (`motion.duration.medium`) | First paint of the materialized Workspace |
| `idle-with-timer` | Mounted, < 60s elapsed | Callout visible, auto-dismiss timer running | |
| `row-hover` | Mouse over a row | Subtle background tint per `surface.elevated` + 1 step | Show / Change link reveals on hover |
| `row-link-clicked` | Click on Show / Change | Parent surface navigates / scrolls | Callout itself remains visible |
| `truncation-banner-visible` | Free tier + truncation applied | Banner with primary upgrade button | Only on Free tier |
| `dismissed-explicit` | Click Got it or X | Slide-out (`motion.duration.medium`); collapses to §11.4 link | |
| `dismissed-auto` | 60s elapsed | Slide-out (`motion.duration.medium`); collapses to §11.4 link | Same animation as explicit |
| `re-opened` | Click §11.4 link | Slide-in (`motion.duration.medium`) without auto-dismiss timer | Stays open until explicit dismiss |
| `no-recommendations` | `longlist_count === 0` | Vendors row renders the search-Marketplace link | |
| `freetext-vertical` | `intake_freetext_label` non-null | Vertical row + sub-line per §13.12.5 | |

**Accessibility — Post-Selection Landing Callout:**

- ARIA: callout uses `role="region"` with `aria-label="What we filled in for you"`. The auto-dismiss is announced live (`aria-live="polite"`) at the 10-second-remaining mark to give screen-reader users time to interact.
- Keyboard: `Tab` traverses the rows in order (Vertical, Use Cases, Requirements, Vendors, Deadline, Upgrade button if present, Got it, X icon). `Enter` activates links and buttons. `Esc` triggers explicit dismiss (equivalent to clicking Got it).
- Screen reader: rows are announced as "{label}: {value}, {action} link." The truncation banner is announced with full copy.
- Color contrast: all rows, links, and banner copy meet WCAG 2.1 AA per §2.2 / §11.6.
- Reduced-motion (`prefers-reduced-motion: reduce`): slide-in / slide-out replaced by instant render / collapse; auto-dismiss timer behavior unchanged.

**Composition with Existing Components:**

- **`Button` (§5.2.1):** Used for the "Continue" affordance on the Other path and the "Upgrade to Starter" affordance in the truncation banner.
- **`FormField` (§5.2.13):** Wraps the Other inline text input.
- **`ToastNotification` (§5.2.5):** Surfaces materialization failure, rate-limit blocking, and any subsequent error states.
- **`Modal` (§5.2.11):** Not used; the intake is full-screen, not modal-overlay.
- **`PipelineSurface` (§5.2.19):** Not directly composed at intake time; the materialized Workspace renders PipelineSurface immediately on landing per `evaluation_owner_mode`-driven rendering rules.

**Acceptance Criteria (IF-01 through IF-12):**

| Criterion | Definition | Test Type |
|---|---|---|
| IF-01 | Intake screen renders the question "What are you evaluating?" as the only above-the-fold heading; six tiles in a 3 × 2 grid (CRM · ITSM · EDR · Observability · Payroll/HRIS · Other); muted "blank Workspace" link below the grid. Order is canonical per the `EvalVertical` Appendix J enum. | E2E test + visual regression |
| IF-02 | Tile content (`display_name`, `short_description`, `icon_token`) is sourced from the EvalStarter row matching the tile's `vertical_slug`; tiles re-render within 60s of an Ops edit per Master Spec §4.5.9 AC #3. | Integration test against the EvalStarter API |
| IF-03 | Selecting a default tile invokes the §13.12.4 materialization API, navigates to the materialized Workspace, and renders the `IntakeFillCallout` for 60 seconds or until dismissed. Materialization completes within p95 ≤ 2.5s for Free-tier post-truncation and p95 ≤ 4.5s for Starter+ per Master Spec §44 / §13.12.10.2 AC #9. | E2E test + p95 latency assertion |
| IF-04 | Selecting "Other" expands an inline FormField (1–120 chars); Continue invokes materialization with `vertical_slug=other` and `intake_freetext_label=<input>`; the resulting Workspace's audit trail records both fields per §13.12.4 step 8. | E2E test + audit-log assertion |
| IF-05 | Selecting the "blank Workspace" link materializes a Workspace with no Use Cases, Requirements, or longlist and the platform-default 28-day deadline; no callout renders. | E2E test |
| IF-06 | Materialization failure surfaces a `toast.error` ToastNotification with "Try again" and "Start blank" actions; the intake screen remains usable. | E2E test + error-injection test |
| IF-07 | The `IntakeFillCallout` renders five rows (Vertical, Use Cases, Requirements, Vendors, Deadline); when `longlist_count === 0`, the Vendors row renders the "No recommendations seeded yet — search the Marketplace" link routed to `/marketplace?category=<marketplace_category_slug>` per §13.12.7. | Integration test + visual regression |
| IF-08 | The truncation banner renders inside the callout when and only when `planTier=buyer_free` AND `truncation_applied=true`; the upgrade button routes per §34.5; the banner copy reflects the actual `use_cases_truncated` and `requirements_truncated` counts. | Integration test across tiers + visual regression |
| IF-09 | Auto-dismiss fires at 60s elapsed; explicit dismiss fires immediately on Got it / X / Esc. Both paths slide out using `motion.duration.medium` (instant snap when `prefers-reduced-motion: reduce` is set) and collapse to a §11.4 "What we filled in for you" link. | Visual regression + reduced-motion test |
| IF-10 | The collapsed §11.4 link re-opens the callout in a "no auto-dismiss" state; the callout stays open until explicitly dismissed. | Interaction test |
| IF-11 | Mobile (< 640px): tile grid renders 1-column with tap targets following the Master Spec §38.6.2 per-tier minimum; "Other" inline input expands below the tapped tile; callout renders as full-width card pinned to top of content region; all WCAG 2.1 AA contrast and tap-target rules pass. | Mobile responsive test + Axe-core |
| IF-12 | All ARIA semantics correct: intake `role="radiogroup"`; tiles `role="radio"` + `aria-checked`; callout `role="region"` + `aria-label="What we filled in for you"`; auto-dismiss announced via `aria-live="polite"` at 10s-remaining; full keyboard navigation (Tab / Enter / Space / Esc / arrow keys); WCAG 2.1 AA passed across light and dark themes. | Axe-core + manual screen reader + visual contrast test |

**Stop-Condition Disposition (per Phase 14.7 brief).** The Marketplace inventory model is not finalized for seeding `recommended_longlist`; the surface gracefully renders the "No recommendations seeded yet — search the Marketplace" affordance whenever `longlist_count === 0` (whether because the seed was null, fully filtered by opt-outs, or all entries delisted). A Linear follow-up issue tracks the unblock; reconciliation entry filed in `_integration/RECONCILIATION.md → Phase 14.7 → Stop Conditions`.

##### First 30 Seconds — Screen 1, Intake (per §1.4)

Retro-documented under Phase 14.17. Conformant to the §1.4.1 four-bullet template. Screen 1 (Intake) is the canonical first surface a Buyer Maya touches when she clicks "New Evaluation" or lands on Step 4 of the Buyer Onboarding sequence; Screen 2 (Post-Selection Landing — "What we filled in for you") is its immediate consequence and inherits the same compliance contract through its arithmetic-only callout copy ("6 use cases · Show", "54 requirements · Show", "12 recommended vendors · Show", deadline plus "Change" link).

1. **What the user sees.** A single full-screen surface with one display-large heading ("What are you evaluating?"), a 3 × 2 grid of six labeled tiles — CRM (Sales · Service), ITSM (Tickets · Asset), EDR / Endpoint Security, Observability (APM · Logs · Metrics), Payroll / HRIS (Payroll · HRIS · Benefits), Other (Tell us in your own words) — and a muted text-link below the grid reading "I want to start with a blank Workspace." No preamble, no helper copy above the heading, no progress stepper above the fold.
2. **What they understand without training.** "I'm about to start a software evaluation; I pick the tile that names the category I'm buying, or 'Other' if my category isn't on the grid, or 'blank Workspace' if I want to start from scratch."
3. **What they do next.** Clicks one tile (which immediately materializes a pre-populated Workspace and lands on the Post-Selection "What we filled in for you" callout).
4. **What is hidden, and why.** The `EvalStarter` registry (§4.5.9) and its `EvalVertical` enum (Appendix J), the `EvalStarter.template_version` pin and the deprecated-slug routing table (§13.12.6), the materializer transaction that instantiates `Workspace`, `UseCase`, `Requirement`, and `recommended_longlist` rows (§13.12.4), the per-tier truncation matrix that applies on Buyer Free (§13.12.5), the `intake_freetext_label` mapping for the "Other" path, the `pipeline_stage_id` initialization (engine Phase 1), the §44 materialization latency budgets, and the §13.12.5 25-Workspaces-per-day rate-limit row are engine constructs the buyer never names. Codified by Appendix M rows "What Are You Evaluating?" Intake, "Per-Vertical Eval Starters (Phase 14.7 — closed)," "Workspace pre-population materializer in Scoring Engine block," and the `EvalStarter` / `EvalVertical` rows. The §13.12.10 ACs and the IF-01 through IF-12 ACs above lock the absences; the IF-12 ARIA criteria enforce that the surface is announced as a single radiogroup with six radios plus a "blank Workspace" link, never as a "vertical picker" or any other engine-vocabulary phrase.

Cross-references: Master Spec §3.13 (Principle 9 — Surface Simplicity, Engine Complexity); Master Spec §13.12 (Per-Vertical Eval Starters — intake authoritative spec); Master Spec §4.5.9 (EvalStarter registry entity); Master Spec Appendix J (`EvalVertical` enum); Master Spec Appendix M rows above; `UX_Design_of_Sourcera.md` §1.4 (First-30-Seconds Test). Screen 2 (Post-Selection Landing) inherits via its arithmetic-only callout copy, plain-English row labels (Vertical, Use Cases, Requirements, Vendors, Deadline), and its "Got it" dismiss CTA — no Sourcera-specific noun is required to comprehend either screen.

---

### 4.4.3 Inbox

**Existing spec retained. No changes needed.**

---

### 4.4.4 Admin Dashboard

**Purpose:**
Internal staff tool for Sourcera admins. Displays org overview, plan distribution, Agent token usage, error rates, feature flag management.

**Access:** Staff role only

**Layout:**

```
┌──────────────────────────────────────────────────────────┐
│ Admin Dashboard (Staff Only)                             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Organization Overview                                   │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Total Organizations: 342                         │ │
│  │ Active Users: 1,245                              │ │
│  │ Active Workspaces: 567                           │ │
│  │ Total Bids: 892                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                          │
│  Plan Distribution                                       │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Standard: 180 orgs (53%)  ▓▓▓▓░░░░░░░░░░░░░   │ │
│  │ Business+: 130 orgs (38%) ▓▓▓░░░░░░░░░░░░░░   │ │
│  │ Enterprise: 32 orgs (9%)  ▓░░░░░░░░░░░░░░░░   │ │
│  └──────────────────────────────────────────────────┘ │
│                                                          │
│  Agent Token Usage (Last 30 days)                       │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Total Tokens: 45,320                             │ │
│  │ Sonnet: 32,100 (71%)                             │ │
│  │ Opus: 8,950 (20%)                                │ │
│  │ Haiku: 4,270 (9%)                                │ │
│  │                                                  │ │
│  │ Cost: $342.15 (avg: $11.41/day)                 │ │
│  │ Most Used Feature: Policy Ingestion (45%)       │ │
│  └──────────────────────────────────────────────────┘ │
│                                                          │
│  System Health                                           │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Uptime: 99.97%                                  │ │
│  │ Avg Response Time: 124ms                        │ │
│  │ Error Rate: 0.02%                               │ │
│  │ Active Support Tickets: 3                       │ │
│  └──────────────────────────────────────────────────┘ │
│                                                          │
│  Feature Flags (PostHog)                                │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Flag Name              Status    Rollout  Ctrl  │ │
│  │ ─────────────────────────────────────────────── │ │
│  │ scenario_modeling      Enabled   80%     [>]  │ │
│  │ q&a_improvements       Enabled   50%     [>]  │ │
│  │ advanced_analytics     Testing   25%     [>]  │ │
│  │ beta_marketplace       Disabled  0%      [>]  │ │
│  │ [+ New Flag]                                    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                          │
│  Support Queue                                           │
│  [View Support Tickets] (Linked to Zendesk/similar)     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Key Components / Sections:**

1. **Organization Overview Cards**
   - Total orgs, active users, active workspaces, total bids
   - Links to detailed analytics

2. **Plan Distribution Chart**
   - Horizontal bar charts: org count per plan + percentage
   - Clickable to view orgs by plan

3. **Agent Token Usage**
   - Total tokens consumed (last 30 days)
   - Breakdown by model (Sonnet, Opus, Haiku) + usage %
   - Cost summary (total + average per day)
   - Most used feature (AI feature usage breakdown)

4. **System Health**
   - Uptime %, avg response time, error rate
   - Active support tickets count

5. **Feature Flags** (PostHog integration)
   - Table: flag name, status (Enabled/Disabled/Testing), rollout % (0-100%), controls (expand detail, adjust rollout)
   - [+ New Flag] button

6. **Support Queue Link**
   - Link to external support/ticketing system

**Interactions:**

- **Plan chart click:** Filter view to show only orgs in that plan
- **Feature flag rollout slider:** Adjust % rollout in real-time (reflects immediately to connected PostHog environment)
- **[+ New Flag]:** Modal to create new feature flag
- **[Expand]:** Show flag details (description, targeting rules, analytics)

---

### 4.4.5 Team Management

**Purpose:**
Dedicated page for team configuration, triage queue, SLA management, and Agent instruction setting.

**Layout:**

```
┌──────────────────────────────────────────────────────────┐
│ Team Management                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Team List                                               │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Team Name     Console   Members  Triage  SLA     │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ Buyer Eval    Buyer     4        2      82%     │ │
│  │ Seller Resp   Seller    2        5      95%     │ │
│  │ [Detail] [Edit] [Members]                        │ │
│  └──────────────────────────────────────────────────┘ │
│                                                          │
│  Team Detail: Buyer Eval                                │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Team Name: [Buyer Eval       ]                   │ │
│  │ Description: [Handles requirements evaluation]  │ │
│  │                                                  │ │
│  │ Members (4)                                      │ │
│  │ • Sarah Chen (Lead)                              │ │
│  │ • James Rodriguez                                │ │
│  │ • Maria Santos                                   │ │
│  │ [+ Add Member]                                   │ │
│  │                                                  │ │
│  │ ◆ Triage Queue (2 items)  [View Full Queue]     │ │
│  │                                                  │ │
│  │ ◆ SLA Configuration  [Expand]                   │ │
│  │                                                  │ │
│  │ ◆ Agent Instructions  [Edit]                    │ │
│  │                                                  │ │
│  │ [Save] [Archive Team]                            │ │
│  └──────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Team List Table:**
- Columns: Team name, console (Buyer/Seller badge), member count, active triage items, SLA health %
- [Detail], [Edit], [Members] actions per team

**Team Detail View (Accordion/Expandable):**

1. **Basic Info**
   - Team name (editable text, Team Owner only)
   - Description (editable markdown, Team Owner only)

2. **Members List**
   - Member name + role
   - [+ Add Member] button → modal with member selector + role
   - [Remove] button per member (with confirmation)

3. **Triage Queue** (collapsible section)
   - Table: item title, requirement/workspace, status, priority, assigned to, due date, SLA timer
   - Status options: New, In Review, Ready for Scoring, Assigned, Resolved, Archived
   - Priority badges: Critical (red), High (orange), Normal (yellow), Low (gray)
   - SLA timer shows red if approaching deadline
   - Filters: status, priority, assigned
   - Keyboard shortcuts: J/K (navigate), Enter (open detail), A (assign), P (change priority)
   - [Assign to Member] dropdown, [Change Priority], [Resolve], [Archive] buttons

4. **SLA Configuration Panel** (collapsible)
   - First Response Time: slider 1–72 hours (default 24)
   - Resolution Time: slider 1–30 days (default 5 business days)
   - Escalation Alert: slider 50–100% (default 80%, triggers warning when X% of time elapsed)
   - [Save SLA Config] button
   - Note: "Changes apply to new triage items only."

5. **Agent Instructions Panel** (collapsible)
   - Rich text editor (max 2000 chars)
   - Editable by Team Owner only
   - Version history sidebar: timestamps + author, [Revert] button
   - [Save Instructions] button
   - Footer note: "Instructions apply to AI scoring and response drafting within this team's domain."

**Interactions:**

- **Team list row click:** Expand team detail view
- **[Edit]:** Toggle team name/description edit mode
- **[+ Add Member]:** Modal with member selector + role dropdown
- **[Remove Member]:** Confirm dialog
- **Triage item row click:** Expand inline detail
- **[Assign to]:** Dropdown of team members
- **[Change Priority]:** Dropdown (Critical, High, Normal, Low)
- **[Resolve]:** Mark as resolved, optionally add note
- **[Archive]:** Hide from active queue
- **SLA slider drag:** Update time/percentage (saves immediately)
- **Rich text editor focus:** Enable full editing mode
- **[Revert] button (version history):** Restore previous instructions version
- **Keyboard shortcuts (Triage Queue):**
  - `J/K` → Navigate items
  - `Enter` → Open detail
  - `A` → Assign to member
  - `P` → Change priority
  - `R` → Resolve
  - `X` → Archive
  - `Esc` → Close detail

**Empty State (no triage items):**

```
┌────────────────────────────────┐
│  No triage items yet           │
│                                │
│  Items will appear here as     │
│  requirements are reviewed.    │
└────────────────────────────────┘
```

**Data Refresh mechanism:**

- Triage queue syncs every 10 seconds (real-time via WebSocket for new items)
- SLA health % refreshed every 5 minutes
- Team member changes reflected immediately
- Instructions version history updated on save

---


All 37 pages now specified with comprehensive details including layouts, interactions, phase-lock behavior, empty states, and data refresh mechanisms. Template Library (4.2.16) and Inbox are complete. Shared Settings, Onboarding, Admin Dashboard, and Team Management fully documented.

---

# 5. Component System Specification

## 5.1 Component Inventory

| # | Component | Category | Used In | Master Spec Section |
|---|-----------|----------|---------|-------------------|
| 1 | DataTable | Data Display | Requirements Matrix, Vendor List, Response Grid | §4 |
| 2 | SidePeek | Navigation | Requirement Detail, Vendor Detail, Response Detail | §4 |
| 3 | CommandPalette | Navigation | Global search, workspace navigation | §4 |
| 4 | ScoringCard | Domain | Scoring Matrix, Collaborative Scoring | §4 |
| 5 | MarkdownEditor | Input | Comments, requirement descriptions, response text | §4 |
| 6 | ToastNotification | Feedback | System alerts, action confirmations, error states | §4 |
| 7 | GradeBadge | Status | Scoring Matrix cells, Vendor comparison | §4 |
| 8 | PresenceIndicator | Status | Real-time collaboration, viewer counts | §4 |
| 9 | EmptyState | Feedback | Placeholder views, zero-state screens | §4 |
| 10 | AgentAttribution | Meta | Agent-generated content headers, captions | §4 |
| 31 | Modal | Overlay | Confirmation dialogs, creation forms, comparison views | §3 |
| 32 | Dropdown | Input | Role selectors, status changes, filter options | §3 |
| 33 | FormField | Input | All forms (settings, onboarding, creation flows) | §36 |
| 34 | TriageQueue | Domain | Team management, requirement assignment | §8 |
| 35 | SLATimer | Status | Triage queue items, vendor response deadlines | §8.4 |
| 36 | PhaseAdvancer | Domain | Workspace phase management | §10 |
| 37 | AmendmentBanner | Status | Requirements Matrix, Response Editor (Phases 6-9) | §10.7 |
| 38 | DiffViewer | Data Display | Amendment comparison, conflict resolution | §10.7 |
| 39 | VerificationBadge | Data Display | Marketplace listings (Basic/Verified/Certified) | §27 |
| 40 | HealthScoreGauge | Status | KB entries, Pulse widget | §22, §20 |
| 41 | PricingBreakdown | Domain | TCO Dashboard, pricing requirement detail | §15 |
| 42 | NotificationPreferences | Settings | User Settings, notification configuration | §29 |
| 43 | PlanComparisonTable | Billing | Plan selection, upgrade/downgrade flow | §34 |
| 44 | DocumentViewer | Data Display | NDA review, policy ingestion, KB documents | §24 |
| 45 | CrawlConfigPanel | Settings | KB Firecrawl configuration | §22 |
| 46 | PipelineSurface | Domain | Workspace Overview (Buyer), Bid Workspace (Seller) — pipeline progress (4-step compressed or 13-phase ribbon) | §3.14, §2.8.2, §22.19, §3.3.1 |

## 5.2 Core Component Specifications

### Existing Components (5.2.1 – 5.2.10)

The following 10 components retain their existing specifications without modification:

- **DataTable**: Sortable, filterable tabular data with column configuration and row selection.
- **SidePeek**: Slide-out panel for viewing/editing detail without navigating away from current context.
- **CommandPalette**: Global search and navigation interface triggered by Cmd/Ctrl+K.
- **ScoringCard**: Container for collaborative scoring inputs with grade, reviewer attribution, and comment integration.
- **MarkdownEditor**: Rich text editor supporting markdown syntax, links, and code blocks.
- **ToastNotification**: Time-limited alert messages for confirmations, warnings, and errors.
- **GradeBadge**: Visual indicator of Sourcera grade (FM / PM / DNM / EX) or score (0–100) with color coding.
- **PresenceIndicator**: Avatar stack showing active users and their cursor positions during real-time collaboration.
- **EmptyState**: Placeholder message and illustration for zero-state views.
- **AgentAttribution**: Metadata indicator crediting AI-generated content with model name and capability.

---

### 5.2.11 Modal

**Purpose:** Overlay dialog for confirmations, multi-step forms, and focused tasks requiring user attention.

**Anatomy:**
- **Backdrop**: z-index 60, semi-transparent overlay (rgba(0, 0, 0, 0.5)), clickable to close unless `preventClose=true`.
- **Container**: z-index 70, centered on screen, default max-width 520px. Variant max-widths: `sm` 400px, `md` 520px, `lg` 720px, `full` 100% with margin.
- **Header**: Title text (Heading 2 per §2.1), close button (X icon) right-aligned. Sticky if body overflows.
- **Body**: Scrollable content area with `--space-6` (24px) padding. Max-height 70vh.
- **Footer**: Fixed at bottom with action buttons. Primary button (right), secondary button (left). Light background separator line above.

**Props:**
- `title` (string): Modal heading.
- `size` (enum: 'sm' | 'md' | 'lg' | 'full', default: 'md'): Width variant.
- `preventClose` (boolean, default: false): Disable backdrop click and Escape key dismiss. Used for destructive confirmations.
- `onClose` (function): Callback when modal closes.
- `open` (boolean): Controlled open state.
- `children` (ReactNode): Body content.
- `footer` (ReactNode): Footer action buttons.

**Behavior:**
- Opens with the Modal open motion contract per §2.6 (200ms ease-out, scale from 95% + fade in). Initial opacity 0, scale 0.95 → opacity 1, scale 1.
- Escape key closes modal unless `preventClose=true`.
- Focus trap: focus cycling within modal. First focusable element auto-focused on open.
- Keyboard shortcut: Cmd/Ctrl+Enter triggers primary action button.
- Mobile (viewport < 768px): renders as full-screen overlay. Back gesture closes modal.
- Layer management: only one modal visible at a time. Opening a new modal replaces current. Confirmation dialogs stack over modals with z-index 100.
- Scroll lock: body scroll disabled while modal open.

**Variants:**

| Variant | Header | Body | Footer | Use Case |
|---------|--------|------|--------|----------|
| **Confirmation** | Title only | Confirmation prompt text, optional icon | "Cancel" (secondary), "Confirm" (destructive red if destructive action) | Are you sure dialogs |
| **Creation** | "Create [Entity]" | FormField components with validation | "Cancel", "Create" (primary) | Creating requirements, vendors, use cases |
| **Comparison** | "Compare" | DiffViewer or side-by-side panels | "Close" | Requirement amendments, response diffs |
| **Progress** | Title | Progress bar, status text | None (disabled) | Long-running operations (bulk import, export) |
| **Multi-Step Form** | Title + step indicator | Form fields for current step | "Back" (secondary, hidden on step 1), "Next"/"Submit" (primary) | Complex workflows (workspace setup, vendor onboarding) |

**Accessibility:**
- `role="dialog"`, `aria-labelledby` linking to title.
- `aria-modal="true"`.
- Semantic HTML: buttons in footer are native `<button>` elements.
- Focus restored to trigger element on close.

---

### 5.2.12 Dropdown

**Purpose:** Select single or multiple values from a predefined list of options with optional search filtering.

**Anatomy:**
- **Trigger**: Button displaying current selection or placeholder text. Chevron icon (right-aligned) rotates on open.
- **Menu Panel**: z-index 40, positioned below trigger (or above if insufficient space). Max-height 320px, scrollable. Border and shadow for depth.
- **Menu Items**: `--input-height-md` (36px) height, `--input-padding-x` (12px) inline padding. Hover state: subtle background highlight (`--color-bg-tertiary`). Selected item: checkmark icon (right-aligned).
- **Search Input** (optional): Text field at top of menu with clear button.
- **Actions** (multi-select): "Select All" and "Clear" buttons at bottom of menu.

**Props:**
- `options` (array): `{ label, value, disabled?, icon? }` objects.
- `value` (string | string[] | null): Current selection(s).
- `onChange` (function): Callback with new value(s).
- `placeholder` (string): Fallback text when no selection.
- `searchable` (boolean, default: false): Show search input.
- `multi` (boolean, default: false): Allow multiple selections.
- `disabled` (boolean, default: false): Disable entire dropdown.
- `size` (enum: 'sm' | 'md' | 'lg', default: 'md'): Trigger button size.

**Behavior:**
- Click trigger opens menu. Escape or click outside closes.
- Arrow keys (Up/Down) navigate menu items. Enter selects. Tab closes without selection.
- Type-ahead filtering (when `searchable=true`): typing filters options by label substring match (case-insensitive).
- Multi-select: checkboxes appear before labels. "Select All" / "Clear" buttons toggle all options.
- Single-select: chevron indicator or badge shows selected value. Clicking selected option again deselects (unless `required=true`).
- Menu repositions if overflow near viewport edge: flips above trigger or shrinks width if necessary.
- Search persists while menu open; clears on close.
- Disabled options: gray text, no hover state, unselectable.

**Variants:**

| Variant | Trigger Display | Multi | Search | Use |
|---------|-----------------|-------|--------|-----|
| **Single Select** | "Option Name" | No | Optional | Role, status, category selection |
| **Multi-Select** | "3 selected" or chipset | Yes | Yes | Filtering, tag selection, permission assignment |
| **Grouped Options** | "Option Name" | No/Yes | Yes | Vendor filtering by region/tier |
| **With Icons** | Icon + "Option Name" | No | Optional | Status (green ready, yellow draft) |

**Accessibility:**
- `role="listbox"` on menu panel.
- `role="option"` on items with `aria-selected` state.
- `aria-expanded` on trigger button.
- Trigger keyboard accessible (space/enter opens).

---

### 5.2.13 FormField

**Purpose:** Standardized form input wrapper providing consistent label, validation, help text, and error feedback across all input types.

**Anatomy:**
- **Label**: Caption role per §2.1 (12px / weight 500 / 1.4 / 0.02em tracking), `--color-text-primary`. Required asterisk (*) in `--color-danger` appended to label text.
- **Input**: `--input-height-md` (36px) default, full-width, `--input-padding-x` horizontal padding, `--input-border-default`, `--input-radius`. Focus state: `--input-border-focus` plus `--input-focus-ring-width` using `--input-focus-ring-color`.
- **Help Text**: Body Small (13px), `--color-text-secondary`, `--input-helper-gap` below input.
- **Error Text**: Body Small (13px), `--color-danger`, `--input-helper-gap` below input; replaces help text.
- **Success Indicator** (post-validation): Border-color --color-success (light green), checkmark icon right-aligned in input.

**Props:**
- `label` (string): Field label.
- `required` (boolean, default: false): Marks field as required with asterisk.
- `placeholder` (string): Placeholder text in input.
- `value` (string | number | boolean): Input value.
- `onChange` (function): Change callback.
- `onBlur` (function): Blur callback for validation trigger.
- `type` (enum): 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'date' | 'checkbox' | 'radio' | 'file'.
- `options` (array, for type='select'): `{ label, value }` objects.
- `disabled` (boolean, default: false).
- `readOnly` (boolean, default: false).
- `error` (string | null): Error message. If provided, field shows error state.
- `helpText` (string): Text below input (hidden if error present).
- `validate` (function): Custom validator returning error string or null.

**Validation Behavior:**
- Real-time validation triggered on blur (not onChange).
- Required fields: validate non-empty on blur.
- Email type: built-in email regex validation.
- Number type: validate numeric format.
- Custom validators: run in sequence. First error displayed.
- Error state: border-color --color-danger, error text below.
- Success state (after error corrected): border-color --color-success with checkmark. Transitions to normal state if user re-enters field.

**Variants:**

| Type | Anatomy | Behavior | Use |
|------|---------|----------|-----|
| **Text** | Single-line input | Type text, auto-complete off | Names, descriptions |
| **Email** | Single-line input | RFC 5322 validation | Email addresses |
| **Password** | Single-line, masked text | Show/hide toggle button | Password input, API key input |
| **Number** | Single-line with +/– buttons | Arrow key increment/decrement ±1 | Quantities, scores, counts |
| **TextArea** | Multi-line input, 120px default height, resize handle | Grows as text overflows. Character count: "45 / 200" right-aligned below. | Descriptions, amendment reasons, evidence text |
| **Select** | Dropdown trigger | Opens Dropdown component | Categories, statuses, roles |
| **DatePicker** | Input + calendar icon | Click opens calendar popup (date-fns), selects date range if `range=true` | Deadline, start/end dates |
| **Toggle** | Switch control (24px height) | Click to toggle. Shows "On"/"Off" text optionally. | Boolean settings, feature flags |
| **RadioGroup** | Set of radio buttons, 8px gap | Exclusive selection. Stack vertical. | Single-choice options (format, template) |
| **CheckboxGroup** | Set of checkboxes, 8px gap | Multi-select. Stack vertical or grid. | Multi-choice options (permissions, interests) |
| **FileInput** | Drag-and-drop zone or "Browse" button | Accept MIME types. File size validation. Shows file name + remove button after select. | Document upload, evidence attachment |

**Accessibility:**
- `<label>` element with `htmlFor` attribute linked to input `id`.
- Error messages linked via `aria-describedby`.
- Required fields marked with `aria-required="true"`.
- Custom validators provide screen reader-friendly error messages.

---

### 5.2.14 TriageQueue

**Purpose:** Kanban-style and list view interface for managing incoming work items (requirements, Q&A, amendments) assigned to a team with SLA visibility.

**Anatomy:**

**List View (default):**
- View toggle at top: "List" (active) / "Board" buttons.
- DataTable with columns: Title (sortable), Status (sortable), Priority (sortable), Assigned To (sortable), Due Date (sortable), SLA Timer.
- Row actions: right-click context menu or inline actions menu.
- Bulk selection: checkbox column for multi-select with "Select All" header checkbox.
- Filters: Status, Priority, Assignee dropdowns. "Reset Filters" button.

**Board View:**
- View toggle at top: "List" / "Board" (active) buttons.
- Kanban columns: New (yellow left border), In Review (blue), Ready (green), Assigned (orange), Resolved (gray).
- Column header shows count: "New (5)".
- Cards: title (truncated to 2 lines), priority badge (P0–P4), assignee avatar, SLA countdown badge, due date chip.
- Drag-and-drop: cards drag between columns, snap with 150ms ease animation.

**Props:**
- `items` (array): Work items with status, priority, assignee, dueDate, slaBreach, slaExpiry.
- `teamId` (string): Owning team ID.
- `console` (enum: 'buyer' | 'seller'): Console context (affects available statuses).
- `onAssign` (function): Callback on assignee change.
- `onStatusChange` (function): Callback on status drag.
- `onPriorityChange` (function): Callback on priority change.
- `view` (enum: 'list' | 'board', default: 'list'): Current view.

**Behavior:**

**List View:**
- J/K keyboard: navigate up/down rows.
- Enter: open selected item detail in SidePeek (right panel).
- Ctrl+A / Cmd+A: select all visible items.
- Bulk assign: select multiple items, click "Assign to" dropdown in toolbar, select team member. Confirmation toast.
- Filter: click filter dropdowns, select values, table updates in real-time. "Clear Filters" button resets.
- Sort: click column header to toggle ascending/descending. Arrow indicator shows direction.

**Board View:**
- Drag card by title area. Drop on target column header or within column.
- Card drop triggers `onStatusChange` callback with new status.
- Scroll horizontally if columns overflow viewport.
- Column does not have max items per column; scroll within column if needed.

**Unassigned Items:**
- Yellow left border (4px) on list rows and board cards.
- Tooltip on hover: "Unassigned — Assign to proceed."
- Bulk action: select unassigned items, "Assign to" dropdown.

**SLA Behavior:**
- SLA Timer badge shows on each item (see component 5.2.15).
- Color coding: green (normal), yellow (approaching), red (breached, pulsing).
- Click SLA badge to extend by 24/48/72 hours. Modal: "Extend SLA until [date]?" [Extend] [Cancel].
- Breached items sorted to top on list view by default.

**Variants:**

| Context | Statuses | Use |
|---------|----------|-----|
| **Buyer Triage** | New → In Review → Ready → Resolved | Requirement intake, amendment review |
| **Seller Triage** | New (RFQ received) → Drafting → Submitted → Responded | Vendor response tracking |

---

### 5.2.15 SLATimer

**Purpose:** Visual countdown indicator displaying time remaining on an SLA-tracked item or deadline, with escalation states.

**Anatomy:**

**Compact Inline Badge:**
- `--space-8` (32px) height, `--space-2` (8px) horizontal padding.
- Text: "2h 15m" (remaining) or "Overdue 1h 30m" (breached).
- Right-aligned clock icon (12px).
- Background color varies by state (see below).

**Expanded Bar:**
- 100% width container, 4px height bar.
- Filled progress bar (left to right) representing remaining time.
- Time remaining text right-aligned: "3d 12h remaining" or "Overdue by 2h 15m".

**Props:**
- `expiresAt` (ISO timestamp): Deadline timestamp.
- `breached` (boolean): Manually flag as breached.
- `extended` (boolean): Flag for extended SLA.
- `extensionReason` (string): Reason for extension (optional).
- `variant` ('inline' | 'bar', default: 'inline'): Display style.
- `onExtend` (function): Callback when extend action triggered.
- `onClick` (function): Callback on click (e.g., open extension modal).

**States:**

| State | Color | Pulsing | Text | Use |
|-------|-------|---------|------|-----|
| **Normal** | --color-success (green) | No | "2h 15m" | > 20% time remaining |
| **Approaching** | --color-warning (yellow) | No | "1h 45m" | ≤ 20% time remaining (escalation threshold) |
| **Breached** | --color-danger (red) | Yes (`motion.duration.pulse`; reduced-motion renders static) | "Overdue by 2h 15m" | Deadline passed |
| **Extended** | --color-info (blue) | No | "Extended +24h by @User" | SLA extended, shows extension info |

**Behavior:**
- Countdown updates every 60 seconds.
- On approach threshold (≤20%): state transitions from Normal → Approaching. Escalation notification sent if configured.
- On breach (expiry time passed): state transitions to Breached, pulsing starts.
- Click badge opens extension modal: "Extend SLA until [date]?" with options +24h, +48h, +72h. Confirm with [Extend] [Cancel].
- Extension updates expiresAt, notes reason and author.
- Multi-extend: extending already-extended SLA appends extension ("Extended +24h → +24h again by @User2").

---

### 5.2.16 PhaseAdvancer

**Purpose:** Workspace Owner-only control for advancing workspace through procurement phases with gate validation.

**Anatomy:**
- **Phase Display**: "Phase 3: Vendor Discovery" (Heading 1 per §2.1), centered, with icon (e.g., 🔍).
- **Advance Button**: Primary button, right-aligned, text "Advance to Phase 4", disabled if gates fail (gray state, tooltip "X of Y gates must pass").
- **Gate Checklist**: Shown on button hover or click. List of gates with status (✓ pass / ✗ fail). Failing gates are clickable links (navigate to blocking entity).

**Props:**
- `workspaceId` (string): Workspace ID.
- `currentPhase` (number): Current phase (1–12).
- `gates` (array): Gate objects with name, status ('pass' | 'fail'), entity, entityId.
- `onAdvance` (function): Callback on successful advance.

**Behavior:**

**Pre-Advance:**
- Button visible only to Workspace Owner.
- Click button: system immediately runs gate validation.
- Gates check (specific to each phase):
  - **Phase 1 → 2**: Workspace name set, team created.
  - **Phase 2 → 3**: ≥ 1 requirement defined, vendor marketplace accessed.
  - **Phase 3 → 4**: ≥ 1 vendor shortlisted or invited.
  - **Phase 4 → 5**: RFQ issued (vendor response deadline set).
  - **Phase 5 → 6**: ≥ 1 response received from vendor.
  - **Phase 6 → 10**: All required response fields completed by all vendors.
  - **Phase 10 → 11**: ≥ 50% of requirements scored by ≥ 2 reviewers.
  - **Phase 11 → 12**: Selection recommendation locked (no further scoring changes).
  - **Phase 12 → onward**: Report generated, no further advance possible.

**Validation Result - Success:**
- All gates pass: Confirmation modal appears.
- Modal title: "Advance to Phase [N]: [Phase Name]?"
- Modal body: "This action cannot be undone. Vendor requirements and responses will be locked." (messaging varies by phase).
- Footer buttons: [Cancel] [Advance].
- On [Advance] click: phase updated, full-width banner broadcast to all workspace members: "Phase advanced to Phase [N]: [Phase Name]" (green banner, auto-dismiss after 8s).

**Validation Result - Failure:**
- One or more gates fail: Modal shows gate checklist with red X for failures.
- Title: "Cannot Advance: [N] of M gates must pass."
- Each failing gate listed with clickable link: "✗ [Gate Name] — View blocking requirement" (underlined, blue).
- Clicking gate link: SidePeek opens showing blocking entity (requirement, vendor, response).
- No Advance button in modal. User must fix blockers and retry.

**Phase-Specific Messaging:**

| Transition | Confirmation Message |
|------------|----------------------|
| Phase 5 → 6 | "Vendors will no longer be able to modify their bids. Lock responses?" |
| Phase 10 → 11 | "Scoring is locked. Only Selection Report may be edited." |
| Phase 11 → 12 | "Workspace concludes. Archive now available for reference only." |

**Real-Time Broadcast:**
- All workspace members subscribed to workspace phase changes via WebSocket.
- Banner appears to all on successful advance.
- Sidebar phase indicator updates in real-time.

---

### 5.2.17 AmendmentBanner

**Purpose:** Alert banner warning users of requirement amendments and prompting action during Phases 6–9.

**Anatomy:**
- **Sticky Banner**: Fixed at top of requirement/response detail panel, Sticky layer z-index 10 per §2.8.
- **Background**: --color-warning (yellow) at 10% opacity, border-bottom 2px --color-warning.
- **Layout**: Horizontal flex container with left-aligned content and right-aligned actions.
- **Content**: Icon (alert triangle) + text "This requirement was amended on [Date] by [User]. [View Changes]" (text Body Small).
- **Actions**: [View Changes] link (blue, underlined) or [View Diff] for sellers, [Dismiss] link (gray).

**Props:**
- `requirement` (object): Requirement with amendments array, current version.
- `context` ('buyer' | 'seller'): Console context (changes button text and styling).
- `onDismiss` (function): Callback when [Dismiss] clicked.
- `onViewChanges` (function): Callback when [View Changes] clicked (opens DiffViewer).
- `amendmentVersion` (number): Version number of amendment.

**Behavior:**

**Buyer Context:**
- Banner appears if requirement has amendments and user is viewing the requirement.
- [View Changes] opens DiffViewer inline (modal or side panel) showing old vs. new requirement text.
- [Dismiss] closes banner (dismissal is per-session, reappears on page reload).
- Banner persists until all vendors re-submit their responses for that requirement.

**Seller Context:**
- Banner appears if requirement has amendments and vendor is viewing their response to that requirement.
- Text changes: "This requirement has been amended. Review changes and re-submit your response. [View Diff]".
- [View Diff] opens DiffViewer showing old vs. new requirement.
- Banner background changes to --color-info (blue) at 10% opacity for distinction.
- Vendor response status is set to `needs_reverification` automatically. Submit button text changes to [Re-Submit Response].
- Banner persists until vendor submits updated response, then auto-dismisses.

**Amendment Log:**
- Requirement Detail shows "Version History" tab listing all amendments.
- Each entry: version number, timestamp, author, amendment reason (if provided), [View Diff] link.

---

### 5.2.18 DiffViewer

**Purpose:** Side-by-side comparison display highlighting changes between two text versions.

**Anatomy:**
- **Container**: Two equal-width panels (50/50 split on desktop, stacked on mobile < 768px).
- **Panel Headers**: Version label at top of each panel (e.g., "Version 1 — Original", "Version 2 — Amended"). Caption weight, 12px. `--space-6` (24px) padding-block.
- **Content**: Scrollable text area, monospace font for clarity.
- **Line Numbers** (optional): Left-aligned, gray text, +4px margin-right.

**Text Styling:**

| Change Type | Styling | Color |
|-------------|---------|-------|
| **Added** | Background highlight | --color-success (light green) |
| **Removed** | Background highlight + strikethrough | --color-danger (light red) |
| **Unchanged** | Default text | --color-text-primary |
| **Context** | Faded text | --color-text-tertiary |

**Props:**
- `oldContent` (string): Version 1 text.
- `newContent` (string): Version 2 text.
- `oldLabel` (string, default: "Version 1"): Panel 1 header.
- `newLabel` (string, default: "Version 2"): Panel 2 header.
- `format` ('text' | 'markdown', default: 'text'): Content type.
- `lineNumbers` (boolean, default: true): Show line numbers.

**Behavior:**
- Renders on mount using a diff algorithm (e.g., diff-match-patch).
- Synchronized scroll: scrolling one panel scrolls the other to same relative position.
- Compact mode: hides context (unchanged lines). [Show More Context] button expands surrounding unchanged lines (+/– 3 lines per click).
- Mobile: panels stack vertically with full width. Synchronized scroll maintained.

**Used In:**
- Amendment view: requirement version comparison.
- Conflict resolution: vendor response vs. latest requirement.
- Requirement version history: compare any two versions.
- Response detail: vendor changes to re-submitted response.

---

### 5.2.19 PipelineSurface

**Authoring intent (Phase 14.6 — 2026-04-26).** PipelineSurface is the canonical pipeline-progress component for the Linear Constraint surface. It renders the engine 13-phase pipeline (Master Spec §10) as either a four-step compressed progress bar or the legacy 13-phase chip ribbon, gated by the rendering context. It supersedes the implicit two-component split in the prior spec (the §3.3 13-phase chip ribbon plus the legacy `PhaseAdvancer` (§5.2.16) advancement control) by establishing a single component with two render states. The `PhaseAdvancer` (§5.2.16) remains the canonical advancement-action control; it is composed inside PipelineSurface as the "Advance" affordance per the Composition section below.

**Master Spec / Appendix M cross-references:** Master Spec §3.14 (Pipeline Surface Compression — canonical contract), §3.14.1 (Buyer Solo step-to-phase mapping), §3.14.2 (Seller compressed step-to-phase mapping), §3.14.3 (Interaction Patterns), §3.14.4 (Engine-vs.-Surface Invariants), §2.8 (Single-Operator Mode), §2.8.2 (Buyer Solo step mapping), §2.8.3 (Soft phase gates), §22.19 (Seller Compressed Surface Mapping), §3.3.1 (legacy 13-phase chip ribbon — Team Mode rendering), §10 (engine pipeline), §10.16 (Phase Advancement API), §13.11 (Defense View — Decide-step content), §22.3 (KB ingestion channels — Submit-step Phase 13 content), Appendix M row "Pipeline Surface Compression."

**Purpose:** Render the current `pipeline_stage_id` as either (a) the compressed four-step progress bar (Buyer Solo or Seller — both consoles) or (b) the full 13-phase chip ribbon (Buyer Team Mode), with click-on-step navigation, hover/focus tooltips disclosing the engine phases under each step, intra-step progress fill, and embedded `PhaseAdvancer` (§5.2.16) behavior.

**Localization binding.** Buyer Solo step labels resolve through Master Spec §37.2.1 key group `pipeline.surface.step.solo_buyer`; Seller compressed step labels resolve through `pipeline.surface.step.solo_seller`. Component code MUST consume localization keys, not inline English strings.

**Render-State Selection Rules:**

| Console | `Workspace.evaluation_owner_mode` | Render state | Mapping source |
|---------|-----------------------------------|--------------|----------------|
| Buyer | `solo` | `solo` (4-step Buyer bar) | Master Spec §3.14.1 / §2.8.2 |
| Buyer | `team` | `team` (13-phase chip ribbon) | Master Spec §3.3.1 |
| Seller | n/a (field is Buyer-only per §2.8.6) | `solo` (4-step Seller bar) | Master Spec §3.14.2 / §22.19.1 |

The render-state decision MUST be made by the parent page (Workspace Overview, Bid Workspace) based on the Console + `evaluation_owner_mode` projection received from the engine; PipelineSurface itself does not read `evaluation_owner_mode` directly. This isolation guarantees that any future change to the gating field is made in one place.

**Anatomy — `solo` state (Buyer):**

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ●─────────○─────────○─────────○                                         │
│  Setup     Define    Score     Decide                                    │
│  ▓▓░░░░    Phases    Phases    Phases                                    │
│            4–6       7–10      11–13                                     │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  [active step body — e.g., "Score the vendors" + work cards]       │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│  [Advance]                                                               │
└──────────────────────────────────────────────────────────────────────────┘
```

**Anatomy — `solo` state (Seller):** Identical to Buyer Solo with the four labels replaced by **Receive · Draft · Review · Submit** per Master Spec §3.14.2 / §22.19.1.

**Anatomy — `team` state:** The legacy 13-chip ribbon authored in §3.3 / Master Spec §3.3.1 — one chip per engine phase (1, 2, 3, 4–5, 6, 7, 8, 9, 10, 11, 12, 13), active chip in primary token weight, completed chips with checkmark, future chips muted. Width is 100% of the page-header content width with horizontal scroll on mobile. PipelineSurface in `team` state is the canonical authoring of this ribbon; the prior §3.3 description is the engine-side reference and remains unchanged.

**Component Tokens (delta from §2 / §3):**

| Token | Value | Notes |
|-------|-------|-------|
| `pipeline.step.height` | 56px (desktop), 48px (mobile) | Vertical extent of each step segment. |
| `pipeline.step.minWidth` | 120px (desktop) | Per-step minimum on the four-step bar. |
| `pipeline.step.label.size` | Body Small (13px) — active step Body (14px) | Active step is one rank larger to satisfy hierarchy. |
| `pipeline.step.indicator.size` | 16px circle (active filled) / 14px circle (inactive) | Step indicator dot. |
| `pipeline.step.connector.height` | 2px | Horizontal line between step indicators. |
| `pipeline.step.progress.height` | 4px | Intra-step progress fill height. |
| `pipeline.step.gap.between` | `--space-6` (24px desktop), `--space-3` (12px mobile) | Horizontal gap between step segments. |
| `pipeline.step.transition.duration` | `motion.duration.medium` (240ms; §2.6 named token) | Animated slide of the active-step indicator across a step boundary. |
| `pipeline.step.transition.ease` | `motion.ease.standard` (§2.6 named token) | Easing of the indicator slide. |
| `pipeline.step.color.active` | `--color-accent` | Active step indicator + label. |
| `pipeline.step.color.completed` | `--color-success` | Completed step indicator + connector. |
| `pipeline.step.color.future` | `--color-text-tertiary` | Future step indicator + label. |
| `pipeline.step.color.connector` | `--color-accent` (active to active+1), `--color-success` (between completed steps), `--color-border-default` (future segments) | |
| `pipeline.tooltip.token` | `tooltip.default` per §3.7 | Disclose engine phases under the hovered/focused step. |

No new color tokens are introduced; PipelineSurface composes existing §2.2 color tokens. Reduced-motion (§9.6) replaces the indicator slide with an instant snap and disables the progress-fill tween per Master Spec §3.14.3 #3.

**Props:**

- `mode` (enum: `solo-buyer` | `solo-seller` | `team`): which render state to use. Required. Selection rules above.
- `currentPhase` (integer 1–13): the engine `pipeline_stage_id`. Required.
- `intraStepProgress` (number 0.0–1.0, default 0.0): progress fill within the active step (e.g., for Score step at Phase 8 of Phases 7–10, value is 0.5). Optional; computed by parent.
- `onStepClick` (function): callback invoked with the engine phase corresponding to the clicked step's first sub-phase per Master Spec §3.14.1 / §3.14.2. Required when interactive.
- `interactive` (boolean, default true): if false, the bar is read-only (no hover state, no click handlers); used for embedded preview surfaces.
- `softGatesEnabled` (boolean, default false): if true, advance attempts call the soft-gate skip-with-warning toast path per Master Spec §2.8.3 / §22.19.3; if false, advance attempts use the hard-gate modal path per §10.16. The parent sets this from the engine's `soft_gates_enabled` projection.
- `gates` (array): gate objects passed through to the embedded `PhaseAdvancer` (§5.2.16) — `{ name, status, entity, entityId }`. Required when `interactive=true`.
- `advanceCta` (ReactNode, optional): override for the Advance CTA's label/copy; default copy is "Advance to {next-step-label}" computed per `mode`.

**Behavior — `solo` state (both consoles):**

1. **Render.** Four step segments side-by-side. Active step uses `pipeline.step.color.active`; completed steps use `pipeline.step.color.completed`; future steps use `pipeline.step.color.future`. Intra-step progress fill renders under the active step indicator at width = `intraStepProgress × 100%`.
2. **Hover / focus.** Hovering or keyboard-focusing a step shows a tooltip (token `tooltip.default`) listing the engine phases aggregated under that step (e.g., for Buyer Score: "Phase 7 Vendor Response Refinement · Phase 8 Buyer Due Diligence & Demos · Phase 9 Final Vendor Clarifications · Phase 10 Team Evaluation & Scoring"). The tooltip is the only place engine phase names appear on the compressed bar.
3. **Click.** Clicking a step invokes `onStepClick` with the engine phase corresponding to that step's first sub-phase per the Master Spec §3.14.1 / §3.14.2 mapping (Buyer Setup → Phase 1; Buyer Define → Phase 4; Buyer Score → Phase 7; Buyer Decide → Phase 11; Seller Receive → Phase 1; Seller Draft → Phase 3; Seller Review → Phase 8; Seller Submit → Phase 11). The navigation is read-only — it does not advance or rewind the engine.
4. **Step transition motion.** When `currentPhase` updates and the new value crosses a step boundary, the active-step indicator animates from the prior step to the new step using `pipeline.step.transition.duration` / `pipeline.step.transition.ease`. Within-step engine advancement does not animate the step indicator; only the intra-step progress fill tweens.
5. **Advance.** The embedded `PhaseAdvancer` (§5.2.16) is rendered below the active-step body. When the operator clicks Advance:
   - If `softGatesEnabled=false` → standard `PhaseAdvancer` modal (hard gate). Used in Team Mode only — under Solo Mode the prop is always true; the false branch is reserved for future read-only render contexts.
   - If `softGatesEnabled=true` AND gate validation surfaces unmet gates → render a `ToastNotification` (§5.2.5 — token `toast.warning`) with two actions: "Finish them first" (returns the user to the open items via the gate `entityId` link) and "Skip for now" (calls the Phase Advancement API with `soft_gates_enabled=true` and emits the `phase_advanced_with_unmet_gates` audit event per Master Spec §2.8.3 / §22.19.3).
   - If `softGatesEnabled=true` AND no unmet gates → standard advancement; no toast.
6. **Defense View / KB compounding embed (Decide / Submit).** When `mode=solo-buyer` AND active step is Decide AND `currentPhase ≥ 12`, render the Defense View entry point per §4.2.13 / Master Spec §13.11 inside the active-step body. Before Phase 12 the step body shows a muted "Selection becomes available after scoring closes" affordance. When `mode=solo-seller` AND active step is Submit AND `currentPhase = 13` AND `bid.status ∈ {won, lost}`, render the "Add this bid's responses to your KB?" CTA per Master Spec §22.3 channel #2.

**Behavior — `team` state (Buyer only):**

1. **Render.** Twelve chips left-to-right (Phases 1, 2, 3, 4–5, 6, 7, 8, 9, 10, 11, 12, 13 — Phases 4 and 5 share one chip per §10.5). Active chip uses primary token weight; completed chips show a checkmark; future chips render in muted weight.
2. **Click.** Clicking a chip behaves identically to PhaseAdvancer's existing chip-click interaction (§5.2.16 — read-only navigation to that phase's surface).
3. **Advance.** Embedded `PhaseAdvancer` (§5.2.16) renders unchanged from its current behavior; `softGatesEnabled=false` is the only valid value in Team Mode (per Master Spec §2.8.3 — Team Mode advancement is always hard-gated).
4. **Mobile.** The chip ribbon scrolls horizontally per §3.4 (mobile responsive layouts); there is no mobile-compressed variant in `team` state per Master Spec §3.14.3 #5.

**Mobile Translation:**

- `solo` state: four-step bar renders as a single-row segmented control with active step's label in full and other steps as localized short labels (English baseline — Buyer: St / Df / Sc / Dc; Seller: Rc / Df / Rv / Sb). Labels MUST be pairwise distinct within each console for every locale, and each segment MUST expose the full localized step name by `aria-label`. A collision falls back to the full localized step labels. Tapping a step opens a bottom-sheet detail with the same content as the desktop tooltip plus the step's CTAs. Bottom-sheet token: `bottomSheet.default` per §3.7.
- `team` state: chip ribbon scrolls horizontally; the active chip is auto-scrolled into view on phase change.
- Touch targets follow the Master Spec §38.6.2 per-tier minimum.

**Composition with Existing Components:**

- **`PhaseAdvancer` (§5.2.16):** Embedded as the Advance CTA. PipelineSurface owns the surrounding bar/ribbon; PhaseAdvancer owns the gate-checklist + advancement-modal interaction (Team) and is wrapped by the soft-gate toast path (Solo).
- **`ToastNotification` (§5.2.5):** Surfaces the soft-gate skip-with-warning prompt under Solo Mode advancement.
- **`SidePeek` (§5.2.7):** Step click in `team` state may open a detail view in a SidePeek, per existing PhaseAdvancer behavior. In `solo` state, step click navigates to the step's first sub-phase surface in the main content region (not a SidePeek).
- **`Tooltip` (§3.7 token, no separate component):** Hover/focus disclosure of engine phases under each compressed step.

**Surface State Catalog (Phase SS remediation — D-SS-040):**

PipelineSurface is bound to Master Spec §3.7.6.7 D-SS-040 and inherits `page_surface_kind = dashboard`. The component still owns its component-level rendering states:

| State | Trigger | Visual | Recovery / Notes |
|-------|---------|--------|------------------|
| `loading` | Parent route mounted, but Console Bridge / Workspace projection has not returned `currentPhase` | Geometry-stable four-step or 13-chip skeleton using final segment widths; labels render as skeleton bars; Advance affordance disabled | Skeleton appears only after the §3.7 no-flash delay and preserves the resolved component height. |
| `partial` | Some step metadata is known but at least one step mapping, gate summary, or active-step body is still resolving | Known steps render normally; unknown steps render muted "Checking" placeholders; active-step body uses a content-shaped skeleton | Step click is enabled only for resolved steps; unresolved steps expose a tooltip "Still checking this step." |
| `error` | Console Bridge read fails, parent projection omits `currentPhase`, or step-to-phase mapping validation fails | Inline error card in the PipelineSurface slot: "We couldn't load the pipeline." Caption includes request id when available | Primary CTA `Retry` re-reads the parent projection; secondary CTA returns to the workspace overview. Mapping-validation failure also emits the §3.14.4 invariant violation event. |
| `retrying` | User activates Retry after an error | Prior error card remains in place with Retry disabled and button-internal progress | Retry uses the §3.7 retry debounce. After three failed retries in 60s, recovery changes to Contact Support. |
| `empty` | No Workspace / Bid Workspace exists for the current route | PipelineSurface does not render; parent page owns the empty state per Master Spec §3.7.6.1 / §3.7.6.3 | The component MUST NOT invent a pipeline for a missing workspace. |
| `permission-denied` | Parent route resolves 403 / console-firewall denial before projection load | PipelineSurface does not render; parent page renders the §3.7.6.3 403 or §3.7.6.6 console-firewall card | Prevents step labels from leaking cross-console stage information. |
| `solo-suppressed-elements` | `mode ∈ {solo-buyer, solo-seller}` | 13-phase ribbon, team handoff labels, and hard-gate modal affordance are absent | The four-step bar remains visible; this is compression, not a hidden surface. |

**Interaction State Catalog:**

| State | Trigger | Visual | Notes |
|-------|---------|--------|-------|
| `idle` | Default | Active step in primary weight; others muted/completed per state | Standard rendering |
| `step-hover` | Mouse over a step | Tooltip surfaces engine phase names | Desktop only |
| `step-focus` | Keyboard focus on a step | Tooltip surfaces engine phase names; focus ring per §G-05 | Desktop and mobile |
| `step-click-jumping` | Click on step | Brief loading indicator (≤ 200 ms) while parent navigates | Read-only navigation |
| `phase-advance-soft-gate-warning` | Advance click with `softGatesEnabled=true` AND unmet gates | `ToastNotification` (`toast.warning`) with two CTAs | Solo only |
| `phase-advance-hard-gate-blocked` | Advance click with `softGatesEnabled=false` AND unmet gates | `PhaseAdvancer` modal with gate checklist | Team Mode only |
| `phase-advance-success` | Advance click with all gates passed (or soft-gate skip) | Active step indicator slides to next step (`motion.duration.medium`); step body re-renders | Both modes |
| `step-boundary-transition` | `currentPhase` update crosses step boundary | Active indicator slides; intra-step fill resets to 0 then tweens up if applicable | Honors `prefers-reduced-motion` |
| `intra-step-progress` | `currentPhase` update within same step | Intra-step fill tweens; step indicator does not move | Honors `prefers-reduced-motion` |
| `decide-step-pre-phase-12` | `mode=solo-buyer` AND active step is Decide AND `currentPhase < 12` | Muted "Selection becomes available after scoring closes" affordance | |
| `decide-step-defense-view-ready` | `mode=solo-buyer` AND active step is Decide AND `currentPhase ≥ 12` | Defense View entry point per §4.2.13 / §13.11 | |
| `submit-step-kb-compounding` | `mode=solo-seller` AND active step is Submit AND `currentPhase = 13` AND `bid.status ∈ {won, lost}` | "Add this bid's responses to your KB?" CTA per §22.3 channel #2 | |
| `mobile-step-tap` | Tap on step (mobile) | Bottom sheet opens with step detail + CTAs | `<768px` |

**Accessibility:**

- ARIA: the four-step bar uses `role="group"` with `aria-label="Evaluation pipeline (compressed)"`; each step is a `<button>` with `aria-current="step"` on the active step and `aria-describedby` linked to the step tooltip. The `team` state uses the same ARIA structure but with twelve buttons instead of four.
- Keyboard: `Tab` moves between steps; `Enter` / `Space` activates the step (equivalent to click); `Esc` dismisses an open tooltip / bottom sheet.
- Screen readers: the active step's label is announced as "{Step name}, step {N} of 4, currently active, covering {engine phase names from tooltip}." Future steps are announced as "{Step name}, step {N} of 4, upcoming." Completed steps are announced as "{Step name}, step {N} of 4, completed."
- Reduced-motion (`prefers-reduced-motion: reduce`): the indicator slide is replaced by an instant snap and the intra-step progress fill animation is disabled per Master Spec §3.14.3 #3 / §37.1.
- Color contrast: every step state (active, completed, future) meets WCAG 2.1 AA (4.5:1 for text; 3:1 for non-text indicators) on both light and dark themes per §2.2 / §11.6.

**Engine Invariants the Component Honors:**

The PipelineSurface component is bound by the Master Spec §3.14.4 invariants. The component MUST NOT:

1. Compute its own phase counter or read any field other than `currentPhase` to determine state. (Honors `pipeline_surface_compression_no_separate_seller_phase_counter`.)
2. Render the 13-phase chip ribbon when `mode ∈ {solo-buyer, solo-seller}`. (Honors `pipeline_surface_compression_seller_always_compressed` and the Buyer Solo rendering rule.)
3. Render the four-step bar when `mode=team`. (Honors `pipeline_surface_compression_team_mode_unchanged_buyer`.)
4. Surface soft-gate toasts in `team` state. (Honors `pipeline_surface_compression_soft_gate_solo_only`.)
5. Diverge from the §3.14.1 / §3.14.2 step-to-phase mapping. The mapping is encoded as a const inside the component module, with a unit test asserting the mapping matches the Master Spec tables verbatim. (Honors `pipeline_surface_compression_step_to_phase_canonical`.)

**Stop-Condition Disposition (per Phase 14.6 brief).** The existing §5.2.16 PhaseAdvancer cannot be cleanly extended to render both the four-step compressed bar and the 13-chip ribbon — its current shape is a single advancement control with an embedded chip-click model, not a dual-state pipeline surface. **PipelineSurface is therefore introduced as a new component (§5.2.19) that composes PhaseAdvancer rather than replacing it.** The §3.3 chip ribbon implementation is migrated under PipelineSurface in `team` state; PhaseAdvancer is retained as the advancement-action subcomponent. No deprecation of PhaseAdvancer is required; its API surface is preserved. UX team sign-off required to confirm the composition boundary; flagged in `_integration/RECONCILIATION.md → Phase 14.6 → Authored Extensions → PipelineSurface composition`.

**Acceptance Criteria (PS-01 through PS-12):**

| Criterion | Definition | Test Type |
|---|---|---|
| PS-01 | PipelineSurface renders in `solo-buyer` state when `Workspace.evaluation_owner_mode=solo`. Four-step bar shows Setup / Define / Score / Decide labels. 13-phase chip ribbon MUST NOT render. | E2E test + visual regression |
| PS-02 | PipelineSurface renders in `team` state when `Workspace.evaluation_owner_mode=team`. 13-phase chip ribbon shows all twelve chips (Phase 4 + 5 share one). Four-step bar MUST NOT render. | E2E test + visual regression |
| PS-03 | PipelineSurface renders in `solo-seller` state on every Bid Workspace regardless of plan tier (sF, sSt, sGr, sSc, sEnt). Four-step bar shows Receive / Draft / Review / Submit labels. 13-phase chip ribbon MUST NOT render under any code path on the Seller console. | E2E test across all five seller tiers |
| PS-04 | Active step indicator matches `currentPhase` per the Master Spec §3.14.1 / §3.14.2 mappings (Setup = 1–3 / Define = 4–6 / Score = 7–10 / Decide = 11–13 for Buyer; Receive = 1–2 / Draft = 3–7 / Review = 8–10 / Submit = 11–13 for Seller). Unit test asserts the mapping const matches the Master Spec tables verbatim. | Unit test + integration test |
| PS-05 | Click on a step invokes `onStepClick` with the engine phase corresponding to the step's first sub-phase per the click-target column in §3.14.1 / §3.14.2. Click navigation is read-only — engine `pipeline_stage_id` is unchanged after step click. | Integration test |
| PS-06 | Hover or keyboard-focus on a step shows a tooltip listing the engine phases aggregated under that step. Tooltip is suppressed on mobile (`<768px`); bottom-sheet detail surfaces equivalent content on tap. | Interaction test + screen reader test |
| PS-07 | Step transition motion (active indicator slide across a step boundary) uses `motion.duration.medium` and `motion.ease.standard`. `prefers-reduced-motion: reduce` replaces the slide with an instant snap and disables the intra-step progress fill tween. | Visual regression + reduced-motion test |
| PS-08 | Advance attempt with `softGatesEnabled=true` AND unmet gates renders a `ToastNotification` with "Finish them first" + "Skip for now" actions per Master Spec §2.8.3. Choosing "Skip for now" calls the Phase Advancement API with `soft_gates_enabled=true` and emits the `phase_advanced_with_unmet_gates` audit event. | Integration test + audit-log assertion |
| PS-09 | Advance attempt with `softGatesEnabled=false` AND unmet gates renders the standard PhaseAdvancer modal (hard gate) per §10.16. The four-step bar MUST never surface a soft-gate toast in `team` state. | Integration test |
| PS-10 | When `mode=solo-buyer` AND active step is Decide AND `currentPhase ≥ 12`, the step body renders the Defense View entry point per §4.2.13 / Master Spec §13.11. Before Phase 12 the step body shows the muted "Selection becomes available after scoring closes" affordance. | Integration test + visual regression |
| PS-11 | When `mode=solo-seller` AND active step is Submit AND `currentPhase = 13` AND `bid.status ∈ {won, lost}`, the step body renders the "Add this bid's responses to your KB?" CTA per Master Spec §22.3 channel #2 / §22.19.1. | Integration test + visual regression |
| PS-12 | All ARIA semantics correct: `role="group"`, `aria-label`, `aria-current="step"` on active step, `aria-describedby` linked tooltip. Keyboard navigation works end-to-end (Tab/Enter/Space/Esc). Screen reader announces step names + state correctly. WCAG 2.1 AA passed for all step states on light and dark themes. | Axe-core + manual screen reader + visual contrast test |
| PS-13 | Loading, partial, error, retrying, empty, permission-denied, and solo-suppressed-elements states render exactly as the Surface State Catalog above; `error` on Console Bridge failure never reveals cross-console stage details. | E2E state-fixture pack + console-firewall regression |

#### First 30 Seconds (per §1.4)

Retro-documented under Phase 14.17. Conformant to the §1.4.1 four-bullet template. The component is the same on both consoles; the user-facing labels differ (Buyer Solo: Setup → Define → Score → Decide; Seller: Receive → Draft → Review → Submit) but the comprehension contract is identical.

1. **What the user sees.** A four-step horizontal progress bar at the top of the workspace with the active step highlighted in the accent color, completed steps marked with a checkmark, future steps muted, an intra-step progress fill under the active step indicator, and an "Advance" button below the active step's body content.
2. **What they understand without training.** "I'm on the {active-step} step of a four-step process; the steps to the left are done, the active step is what I'm working on now, the steps to the right are coming up, and I click 'Advance' when I'm finished here."
3. **What they do next.** Reads the active step's body to see what work it expects, completes that work in the body, then clicks "Advance" to move to the next step.
4. **What is hidden, and why.** The 13 engine phase IDs, the `pipeline_stage_id` integer, the per-phase audit events, the Phase Advancement API and its idempotency contract, the soft-gate vs. hard-gate enforcement strategy, the per-phase SLA timers, the per-phase Pulse Health computation, the per-phase plan-gating resolution against §5.11 and §34, the seller-side `populator.bid_workspace_populator_ready` signal, the engine-side compressed-step computation function, and the §3.14.4 engine-vs.-surface invariants are engine constructs the user never names. Codified by Appendix M rows "Pipeline Surface Compression," "`pipeline_stage_id` integer (0–15)," and the per-phase rows in the Sourcera Method block (Phase 1 Stakeholder Alignment & Discovery through Phase 13). The legacy 13-phase chip ribbon (`team` mode) is the same component in a different render state and inherits the same hide contract — the only surface difference is that Team Mode opts into showing engine phase numbers because Team-Mode operators (procurement leads coordinating multi-stakeholder evaluations) are documented as already familiar with the Method's phase vocabulary.

Cross-references: Master Spec §3.13 (Principle 9 — Surface Simplicity, Engine Complexity); Master Spec §3.14 (Pipeline Surface Compression — canonical contract), §3.14.1 (Buyer Solo step-to-phase mapping), §3.14.2 (Seller compressed mapping), §3.14.4 (Engine-vs.-Surface Invariants); Master Spec Appendix M rows above; `UX_Design_of_Sourcera.md` §1.4 (First-30-Seconds Test).

---

## 5.3 Deprecated Components

No components are deprecated in this specification version. All existing components from Section 4 remain in production use.

---

# 6. Collaborative UX

## 6.1 Collaborative Scoring

Existing specification retained without modification. Covers:
- Real-time grade updates on Scoring Matrix.
- Reviewer visibility with PresenceIndicator.
- Comment threads on scoring decisions.
- Grade consensus indicators.

## 6.2 Real-Time Presence

Existing specification retained without modification. Covers:
- Active user avatars with name tooltips.
- Cursor tracking in MarkdownEditor and FormFields.
- Disconnect handling (5-second grace period before removal).
- Multi-device presence (same user multiple sessions shown separately).

## 6.3 Comments & @Mentions

Existing specification retained without modification. Covers:
- Markdown-enabled comment threads.
- @mention notifications and resolution.
- Comment threading with parent/child relationships.
- Inline comments on requirements and responses.

## 6.4 Multi-User Workspace Operations

Existing specification retained without modification. Covers:
- Optimistic updates on forms with rollback on conflict.
- Concurrent editing conflict resolution (last-write-wins with user notification).
- Field-level locking during edit (grays out field, shows editor name).
- Change streaming via WebSocket.

---

## 6.5 Team Collaboration

### Triage Auto-Mapping

**Trigger:** Requirement created or imported. Agent Capability #4 (Haiku) invoked automatically.

**Logic:**
- Agent analyzes requirement text, labels, category, and previous workspace requirements.
- Maps to team with highest confidence based on learned patterns from historical assignments.
- Returns: `team_id`, `confidence` (0–100), `rationale` (string).

**UX Surface:**
- New requirement detail shows team badge at top: "Assigned to Platform Team (92% confidence)" with info icon.
- Hover info icon: tooltip shows rationale ("Matches previous 15 requirements on feature requests").
- Workflow:
  1. Workspace Owner or Team Lead sees auto-assignment.
  2. If satisfied: requirement auto-assigned, TriageQueue updated, team notified.
  3. If dissatisfied: click dropdown to reassign to different team, selection removes auto-assignment confidence indicator.

**Acceptance Rules:**
- Auto-assignment applies to all requirements unless manually reassigned.
- SLA timer starts on auto-assignment (does not wait for manual confirmation).
- Team receives in-app notification: "New requirement assigned to your queue: [Requirement Name]".

---

### Cross-Team Visibility

**Workspace Owner & Evaluation Lead Views:**

- **All Teams Queue**: Dashboard tab "Triage" shows unified view of all teams' queues.
  - DataTable columns: Requirement, Team, Status, Priority, Assigned To, Due Date, SLA Timer.
  - Grouping: collapsible sections per team. "Platform Team (3 items)" expands to show items.
  - Filtering: filter by team, status, priority. Bulk reassign across teams.
  
- **Requirement Matrix**: Team badge shown in first column. Color-coded per team (system assigns team colors).
  - Hover team badge: team name + member avatars + queue count.
  
- **Scoring Matrix**: Team badge overlay on scored cells. Shows which team member scored each requirement.
  - Hover cell: "Scored by @User (Platform Team)".

**Team Lead View:**
- Sees own team's triage queue in detail. Cannot see other teams' queues.
- Sidebar "My Team" section shows team members + online status. Click member to filter queue by assignee.

**Team Member View:**
- Triage queue shows only items assigned to member or team (if member views "Team Queue").

---

## 6.6 Amendment Protocol UX (Phases 6–9)

### Amendment Initiation

**Surface:** Requirement Detail panel, top-right actions menu.

**Visibility:** "Amend Requirement" button appears only to Workspace Owner, only during Phases 6–9.

**Trigger:** Click [Amend Requirement].

### Amendment Flow

**Step 1: Edit & Preview**
- Modal opens: "Amend Requirement: [Requirement Name]".
- MarkdownEditor shows current requirement text.
- Below editor: DiffViewer panel shows real-time diff of changes vs. original.
- Editor keystrokes update diff in real-time.

**Step 2: Amendment Reason**
- FormField (TextArea, required): "Reason for amendment (max 500 chars)".
- Placeholder: "e.g., Clarification based on vendor feedback, revised business requirement".
- Character count displayed.

**Step 3: Confirmation**
- Summary section shows: "Affected vendors: 5", "Responses to re-verify: 3" (count of responses that will be reset to `needs_reverification`).
- Confirmation checkbox: "I understand all vendor responses for this requirement will be marked for re-verification. Vendors will be notified."
- Footer: [Cancel] [Amend] (primary, disabled until checkbox checked).

**Step 4: Execution**
- Click [Amend]: backend operations:
  1. Create new requirement version with amendment metadata.
  2. Update all vendor responses for this requirement to status `needs_reverification`.
  3. Trigger email + in-app notification to all vendors: "Requirement 'Feature X' has been amended. View changes and re-submit your response by [deadline]."
  4. Record amendment in requirement audit log: timestamp, author, reason.
- Modal closes. Requirement detail refreshes. AmendmentBanner appears to all users.

### Amendment Visibility

**Buyer:** Requirement detail shows AmendmentBanner (yellow). [View Changes] opens DiffViewer.

**Seller:** Response detail shows AmendmentBanner (blue). [View Diff] opens DiffViewer. Response has `needs_reverification` status badge (orange). Submit button text changes to [Re-Submit Response].

**All Users:** Requirement "Version History" tab lists all amendments with timestamps, authors, reasons, and [View Diff] links.

### Amendment Log

**Location:** Requirement Detail → Version History tab.

**Columns:**
- Version number (e.g., "v1", "v2").
- Amendment date/time (sortable).
- Author name with avatar.
- Amendment reason (truncated, click to expand).
- [View Diff] link (opens DiffViewer modal).
- Status: "Active" (current version) or "Superseded" (older version).

**Sorting:** newest first by default.

---

## 6.7 Guest Collaboration

### Guest Invitation Flow

**Initiator:** Workspace Owner only.

**Surface:** Workspace Settings → Members tab → "Invite Guest" button (primary).

**Modal: Invite Guest**

1. **Email Field** (FormField, required):
   - Placeholder: "guest@company.com".
   - Validation: valid email format.
   - Auto-complete: suggests previous guests and external contacts (if available).

2. **Permission Profile** (Dropdown, required):
   - Options:
     - **read_only** (default): View assigned Use Cases, requirements, responses. Can comment and react.
     - **contributor**: + create/edit requirements in assigned Use Cases.
     - **scorer**: + score requirements (Phases 10–11).
     - **full_participant**: + view Selection Report + limited export (PDF/CSV, no raw data export).
   - Help text below: Describes each permission level.

3. **Use Case Assignment** (CheckboxGroup, required, or "All Use Cases" toggle):
   - Checkbox list of all workspace Use Cases.
   - [Select All] / [Clear] buttons.
   - Or toggle: "All Use Cases" (includes future Use Cases).
   - Help text: "Guest will only see assigned Use Cases."

4. **Footer:**
   - [Cancel] [Invite] (primary, disabled until email + profile + UC selected).

**Invitation Email:**
- Subject: "[Workspace Owner] invited you to evaluate [Workspace Name]".
- Body:
  ```
  Hi [Guest Name],
  
  [Owner Name] invited you to participate in a procurement evaluation for [Workspace Name].
  
  Your role: [Permission Profile] (e.g., "Scorer - you can review requirements and provide scores")
  Assigned to: [UC1, UC2, UC3]
  
  [Sign Up Link] or Reply with "join [workspace code]"
  
  Access expires: [90 days from invite] (Enterprise plan) or [30 days] (Business plan).
  ```

**Guest Sign-Up:**
- Guest receives email with unique sign-up link (JWT token, 90-day validity).
- Click link: sign-up form (email pre-filled, read-only).
  - Password field (new account creation).
  - "I agree to the Terms and Privacy Policy" checkbox.
  - [Create Account] button.
- Post-signup: guest logs in, redirected to workspace.
- Workspace displays guest-filtered content immediately (loading only assigned UCs).

### Guest Visibility Rules

**read_only:**
- View assigned UCs and requirements in matrix.
- View vendor responses (read-only).
- View comments. Can reply but cannot create top-level comments.
- Cannot access: Vendor List, Scoring Matrix, Selection Report, Team Triage, Settings, Intelligence Dashboard, Pulse.

**contributor:**
- All read_only permissions.
- Create new requirements in assigned UCs (FormField modal, same as Workspace Owner).
- Edit own requirements (created by guest).
- Cannot edit requirements created by Workspace Owner or other contributors.

**scorer:**
- All contributor permissions.
- View and edit Scoring Matrix (own scores only).
- Cannot see other scorers' grades until Phase 10 ends (score lock).

**full_participant:**
- All scorer permissions.
- View Selection Report (view-only, no editing).
- Limited export: [Export to PDF] button (requirements + scores as PDF report). [Export to CSV] (requirements table).
- Cannot access: raw data export (JSON), team settings, workspace settings.

### Guest UI Differentiation

**Sidebar:**
- Guest user avatar with "G" badge (corner indicator, blue background).
- Hover avatar: "Guest" label.

**Navigation:**
- Inaccessible menu items hidden entirely (not grayed out).
  - Example: Guest with read_only sees "Requirements" and "Use Cases" but not "Scoring", "Vendors", "Settings".
- Message on empty sections: "You don't have access to this section. Contact the Workspace Owner if you need access."

**Modals & Forms:**
- "Guest" label appears in modals initiated by guest (e.g., "Create Requirement" modal header shows "Create Requirement (as Guest)").

**Permissions Enforcement:**
- All plan and phase gates apply on top of guest permissions.
  - Example: read_only guest during Phase 1–5 cannot view responses (not yet available).
  - Scorer guest outside Phase 10–11 cannot access Scoring Matrix.
- If guest permission insufficient: error toast "You don't have permission to perform this action. Contact the Workspace Owner."

**Guest Access Expiration:**
- Invitation expires after:
  - **Enterprise plan**: 90 days from invite.
  - **Business plan**: 30 days from invite.
- Expiring guest (14 days remaining): warning email sent.
- Expired guest: login blocked. Message: "Your guest access has expired. Contact the Workspace Owner to renew."
- Workspace Owner can extend via Settings → Members → Guest actions: [Extend Access 30/60/90 Days] or [Revoke Access].

---

# 7. AI UX

## 7.1 Agent Interaction Model

Existing specification retained without modification. Covers:
- Trust and transparency in AI recommendations.
- User agency and controllability.
- Explainability of agent reasoning.
- Cost visibility.

---

## 7.2 Agent Capability Surfaces

All 21 capabilities listed below are organized by procurement pipeline phase. Each capability specifies: Surface (UI location), Trigger (event), Display (what user sees), Actions (user controls), and Plan/Phase gating.

### Phases 1–5: Setup & Definition

#### Capability #1: Policy Document Parsing (Opus)

**Purpose:** Extract structured requirements from uploaded policy documents.

**Plan & Phase Gating:**
- Available: Phases 1–5.
- Business plan: 3 documents/month, max 100 pages/document.
- Enterprise plan: unlimited, max 500 pages/document.
- Overage: Business plan documents > 100 pages rejected. Cost notification sent.

**Surface:** Policy Ingestion page, Step 2 (Framework Detection).

**Trigger:** Workspace Owner uploads policy PDF/Word document via [Upload Policy] button. Document > 10 pages routed to Opus (Haiku for < 10 pages).

**Display:**
- Step 2: "Extracting requirements..." with progress bar and page count ("Processing page 15 of 87").
- Completion: extracted requirements appear in Step 3 table with columns: Requirement, Source, Confidence, Framework Category.
- Agent attribution header: "Extracted by Claude (Opus)" with info icon (shows token count, cost).

**Actions:**
- Accept extracted requirement: checkbox per row.
- [Select All Extracted] / [Select None].
- Edit extracted text before import: click row to edit in-place.
- Reject requirement: click X button, removed from import.
- [Import Selected] button (primary) adds checked requirements to Requirements Matrix.

**Error States:**
- Document unreadable (corrupted PDF): error banner "Could not parse document. Please try a different format."
- Plan overage (Business, > 3/mo): modal "You've reached your monthly document limit (3). Upgrade to Enterprise for unlimited uploads." [Upgrade] or [Submit for Overage ($)]

---

#### Capability #2: Policy Deduplication (Haiku)

**Purpose:** Identify duplicate or near-duplicate requirements during policy extraction.

**Plan & Phase Gating:**
- Available: Phases 1–5.
- Business+ plans only (Business, Enterprise).
- Included in plan limits.

**Surface:** Policy Ingestion Step 3 (extracted requirements table).

**Trigger:** Automatic after extraction completes. Haiku compares extracted requirements against all existing requirements in workspace.

**Display:**
- Yellow warning flag on extracted requirements that match existing requirements.
- Dedup info in table row: "Matches existing requirement: 'Feature X' (89% match)".
- Click row to expand detail.

**Actions:**
- [Merge with existing]: consolidates extracted requirement into existing, appends any new context.
- [Keep both]: imports as separate requirement (e.g., duplicate from different source documents).
- [Dismiss]: does not import, but remembers match for future dedup suggestions.

**Example:**
```
Extracted: "System shall support single sign-on via OAuth2 and SAML."
Existing: "OAuth2 and SAML authentication required."
Match: 87% → [Merge with existing] suggested.
```

---

#### Capability #3: Policy Traceability Mapping (Sonnet)

**Purpose:** Link extracted requirements to source document page and section.

**Plan & Phase Gating:**
- Available: Phases 1–5.
- Business+ plans only.
- Included in plan limits.

**Surface:** Policy Ingestion Step 3 + Requirement Detail view.

**Trigger:** Automatic after extraction. Sonnet generates traceability metadata (page number, section, quote).

**Display:**
- Policy Ingestion Step 3: "Source Control" column shows page reference and section title (e.g., "Page 15, Section 4.2.1 — Data Security").
- Click reference to highlight matching text in original policy PDF (opens DocumentViewer modal).
- Requirement Detail: "Source" section shows extracted-from policy name, page, section. [View in Source PDF] link.

**Actions:**
- [View in Source PDF]: opens DocumentViewer with source text highlighted.
- Verify traceability: human review confirms mapping accuracy. No action required; automatic on view.

---

#### Capability #4: Triage Auto-Mapping (Haiku)

**Purpose:** Automatically assign incoming requirements to appropriate team based on learned patterns.

**Plan & Phase Gating:**
- Available: Phases 1+.
- All plans.
- Included in plan limits.

**Surface:** Requirement creation/import, Requirement Detail panel.

**Trigger:** Automatic on requirement creation or bulk import. Haiku analyzes requirement text, labels, category against historical team assignments.

**Display:**
- New requirement detail (or Requirements Matrix row) shows team badge: "Assigned to: Platform Team (92% confidence)".
- Hover badge: tooltip with rationale ("Matches previous 15 platform-related requirements"). Info icon for expanded details.
- Agent attribution: "Auto-assigned by Claude (Haiku)".

**Actions:**
- [Change team]: dropdown opens, select different team. Removes confidence indicator.
- Accept: no action needed; auto-assignment persists.
- Reassign: click dropdown, select new team, SLA timer resets for new team.

**Confidence Thresholds:**
- High (85–100%): confidence badge color green.
- Medium (50–84%): yellow.
- Low (< 50%): red, may show [Review Assignment] button if low.

---

#### Capability #5: Requirement Splitting (Sonnet)

**Purpose:** Detect compound requirements and suggest atomic splits.

**Plan & Phase Gating:**
- Available: Phase 1 only (prevent splitting mid-evaluation).
- All plans.
- Included in plan limits.

**Surface:** Requirement Detail panel, Phase 1.

**Trigger:** Automatic on requirement import or manual trigger. Sonnet analyzes requirement for conjunctions ("and", "or") and multiple clauses.

**Display:**
- Requirement Detail shows info banner: "This requirement may contain multiple atomic requirements. [Check] or [Dismiss]".
- Click [Check]: suggestion modal "Split into N Atomic Requirements?"
  - Shows original requirement.
  - Lists proposed split requirements (N items):
    1. "System shall support OAuth2 authentication."
    2. "System shall support SAML authentication."
    3. "Single sign-on response time shall not exceed 500ms."
  - Toggle per proposed requirement to include/exclude in split.

**Actions:**
- [Accept Split]: creates N new requirements (copies labels, category from original). Original requirement archived (status `split`). Toast: "Created 3 requirements from 1."
- [Dismiss]: does not split. Dismissal preference learned for similar future requirements.
- [Edit]: manually adjust proposed split before accepting.

**Example:**
```
Original: "System shall authenticate via OAuth2 or SAML with response time < 500ms."
Proposed split:
  - "System shall authenticate via OAuth2."
  - "System shall authenticate via SAML."
  - "Single sign-on response time < 500ms."
```

---

### Phase 3: Vendor Discovery

#### Capability #6: Vendor Invite Suggestion (Sonnet)

**Purpose:** Recommend vendors from Marketplace based on requirement fit.

**Plan & Phase Gating:**
- Available: Phase 3 only.
- Enterprise plan only.
- Included in plan limits.

**Surface:** Vendor List page, "Suggest Vendors" action.

**Trigger:** Manual — user clicks [Suggest Vendors] button in Vendor List toolbar or "Find Vendors" card on Phase 3 dashboard.

**Display:**
- Loading state: "Analyzing requirements and Marketplace vendors..." (2–5 second latency).
- Results modal: "Suggested Vendors (Top 10)" with table:
  - Vendor name + logo.
  - Match score (0–100).
  - Match rationale (e.g., "Covers 8/10 scoring criteria").
  - Plan tier badge (Basic / Verified / Certified).
  - [Add to Shortlist] button per row.

**Actions:**
- [Add to Shortlist]: vendor added, moves to "Shortlisted Vendors" section in Vendor List. Toast: "[Vendor] added to shortlist."
- [View Vendor Profile]: opens Vendor Detail panel.
- [Dismiss]: modal closes, suggestions lost (re-run to regenerate).

**Match Rationale Examples:**
```
"Matches 92% of requirements."
"Strong fit: AI/ML, infrastructure, automation (3 key areas)."
"Covers: identity, compliance, data governance."
"Certified for healthcare, HIPAA-compliant."
```

---

### Phases 6+: Bidding & Response

#### Capability #7: KB-to-Response Suggestion (Haiku)

**Purpose:** Suggest relevant knowledge base entries while vendor composing response.

**Plan & Phase Gating:**
- Available: Phases 6+.
- All plans.
- Included in plan limits.

**Surface:** Response Editor (Seller console), right sidebar.

**Trigger:** Automatic when seller opens response editor. Haiku analyzes requirement text and suggests matching KB entries.

**Display:**
- Sidebar panel: "Suggested Resources" (collapsible).
- List of KB entries with:
  - Title (e.g., "Feature: OAuth2 Integration").
  - Snippet preview (first 100 chars, truncated).
  - [Insert] button (right-aligned).
  - Confidence score (optional).
- Agent attribution: "Suggestions by Claude (Haiku)".

**Actions:**
- [Insert]: pastes KB entry content into response text at cursor position. Toast: "Inserted '[KB Title]'."
- Scroll through suggestions.
- [Hide suggestions]: collapses panel for focus.
- Manually refresh: [Refresh Suggestions] button re-runs analysis.

**Example:**
```
Requirement: "Describe your OAuth2 implementation."
Suggestions:
  1. "OAuth2 Authorization Code Flow (with PKCE)" [Insert]
  2. "Token Refresh Strategy" [Insert]
  3. "Security Best Practices: OAuth2" [Insert]
```

---

#### Capability #8: Evidence Parsing (Sonnet)

**Purpose:** Extract and summarize key claims from vendor-attached evidence documents.

**Plan & Phase Gating:**
- Available: Phases 6+.
- All plans.
- Included in plan limits.

**Surface:** Response Detail (Buyer console), Evidence section.

**Trigger:** Automatic when vendor attaches document to response. Sonnet parses document content.

**Display:**
- Evidence attachment shows summary badge: "3 key claims extracted" with [Expand] link.
- Click [Expand]: evidence summary panel shows:
  - Extracted claim 1 (quote from doc, highlighted).
  - Extracted claim 2.
  - Extracted claim 3.
  - [Full Document] link to DocumentViewer.
- Agent attribution: "Summary by Claude (Sonnet)".

**Actions:**
- [Full Document]: opens DocumentViewer showing uploaded document.
- Copy claim: hover claim, [Copy] button.
- Link to scoring: claim-to-requirement linking (for scoring reference).

**Example:**
```
Document: "security_audit_2025.pdf"
Extracted Claims:
  1. "SOC2 Type II certified as of March 2025."
  2. "Penetration testing conducted quarterly."
  3. "99.95% uptime SLA guaranteed."
```

---

#### Capability #9: Q&A Answer Suggestion (Sonnet)

**Purpose:** Generate draft reply to vendor questions during bidding phase.

**Plan & Phase Gating:**
- Available: Phase 7 only.
- Business+ plans only.
- Included in plan limits.

**Surface:** Q&A Thread Detail (Buyer side), composer area.

**Trigger:** Automatic when vendor question arrives. Sonnet generates draft reply based on requirement context.

**Display:**
- Q&A thread shows vendor question.
- Response composer shows draft reply (light background, blue left border).
- Text: "Suggested answer (you may edit) by Claude (Sonnet)".
- [Send] [Edit] [Discard] buttons.

**Actions:**
- [Send]: posts draft as-is. Toast: "Reply sent."
- [Edit]: opens MarkdownEditor, user edits draft, then [Send].
- [Discard]: removes draft, composer clears.

**Example:**
```
Vendor Q: "What is the expected ramp-up time for your team?"
Suggested: "Based on your team size of 5 engineers and our typical onboarding, expect 2–3 weeks for full productivity with API integration. We require 1 week dedicated for architecture review."
```

---

### Phases 10–12: Scoring & Selection

#### Capability #10: Pre-Scoring (Sonnet)

**Purpose:** Generate suggested grades for all requirements based on vendor response quality and evidence.

**Plan & Phase Gating:**
- Available: Phase 10 (Scoring & Review).
- Business+ plans only.
- Included in plan limits.

**Surface:** Scoring Matrix + Scoring Card.

**Trigger:** Manual — Workspace Owner or Evaluation Lead clicks [Pre-Score All] button in Scoring Matrix toolbar.

**Display:**
- Scoring Matrix: cells show pre-score grades (light background, locked for edit until unlocked).
  - Agent icon overlay (small, bottom-right of cell).
  - Hover cell: tooltip "Pre-scored: B (Sonnet) — [View Rationale]".
- Scoring Card: pre-scored grade shows in light background. User must actively change/confirm.
- [Pre-Score All] button triggers modal:
  ```
  "Pre-score all [N] requirements?
  This will generate initial grades. You can edit before final review.
  [Cancel] [Pre-Score]"
  ```
- Progress bar during batch scoring ("Scoring requirement 7 of 45...").

**Actions:**
- [Pre-Score] in modal: generates all grades.
- [View Rationale]: opens InsightCard showing Sonnet's reasoning per requirement.
- Edit pre-score: click cell, override grade. Pre-scored badge removed, showing user grade.
- [Lock Pre-Scores]: makes pre-scores read-only (prevents accidental edit). For use if team trusts Sonnet.
- [Clear All Pre-Scores]: removes all pre-scores, starts fresh.

**Pre-Score Rationale Example:**
```
Requirement: "OAuth2 implementation with PKCE"
Vendor Response: [Full response text]
Evidence: security_audit.pdf (3 claims extracted)
Pre-Score: A (92% confidence)
Reasoning: "Response covers PKCE flow, evidence confirms SOC2 Type II certification and quarterly penetration testing. Exceeds requirement."
```

---

#### Capability #11: Disagreement Insight Card (Sonnet)

**Purpose:** Highlight divergent grades and suggest resolution.

**Plan & Phase Gating:**
- Available: Phase 10 (Scoring & Review).
- Business+ plans only.
- Included in plan limits.

**Surface:** Scoring Card (when > 1 reviewer), Collaborative Scoring panel.

**Trigger:** Automatic when reviewer grade divergence ≥ 0.3 (on 0–1 scale or FM / PM / DNM / EX ordinal mapping) between any two reviewers. Sonnet analyzes reasoning and suggests common ground.

**Display:**
- InsightCard component at top of Scoring Card:
  - Title: "Reviewers Disagree" (warning icon, yellow background).
  - Divergence: "Divergence: 0.4 points (Reviewer1: A, Reviewer2: C)".
  - Breakdown:
    ```
    @User1 (A): "Strong evidence, meets all criteria."
    @User2 (C): "Evidence incomplete for performance claims."
    ```
  - Discussion prompt: "Consider reviewing the evidence together. [View Evidence] [Resolve Disagreement]".

**Actions:**
- [View Evidence]: opens DocumentViewer or evidence summary.
- [Resolve Disagreement]: optional workflow:
  1. Reviewers can add comments in thread.
  2. Sonnet monitors thread, may offer follow-up suggestion if discussion reaches impasse.
  3. Reviewers manually update grades. InsightCard auto-dismisses when divergence < 0.3.
- Dismiss: [X] closes insight card (dismissal per-session).

---

#### Capability #12: Demo Focus Brief (Sonnet)

**Purpose:** Generate brief highlighting key areas to explore in vendor demo.

**Plan & Phase Gating:**
- Available: Phase 11 (Demo & Final Review).
- Business+ plans only.
- Included in plan limits.

**Surface:** Vendor Detail page (during Phase 11).

**Trigger:** Manual — Evaluation Lead clicks [Generate Demo Brief] button in Vendor Detail toolbar.

**Display:**
- Modal: "Demo Focus Brief for [Vendor Name]".
  - Generated brief (markdown formatted):
    ```
    ## Key Areas to Explore
    1. **Data Security**: Probe SOC2 Type II implementation and encryption standards.
    2. **API Rate Limiting**: Response claims 10K req/s. Verify benchmarks under peak load.
    3. **Onboarding**: Team availability during integration. Clarify ramp timeline.
    
    ## Gaps to Address
    - No evidence of multi-tenant isolation.
    - SLA uptime claims unverified (99.95% claimed, no third-party audit).
    ```
  - Download options: [Download PDF] [Copy to Clipboard].
- Agent attribution: "Generated by Claude (Sonnet)".

**Actions:**
- [Download PDF]: exports as single-page PDF for demo team reference.
- [Copy to Clipboard]: copies markdown for pasting into notes/tools.
- [Regenerate]: re-runs brief generation if requirements/scoring change.

---

#### Capability #13: "What Would Flip" Analysis (Sonnet)

**Purpose:** Sensitivity analysis showing how score changes would alter vendor ranking.

**Plan & Phase Gating:**
- Available: Phases 10–12 (Scoring & Selection).
- Business+ plans only.
- Included in plan limits.

**Surface:** Scoring Matrix toolbar or Scenario Modeling sidebar.

**Trigger:** Manual — user clicks [What Would Flip?] button next to vendor row in Scoring Matrix (or in Vendor Detail).

**Display:**
- Modal: "Sensitivity Analysis: What Would Flip?"
  - Current ranking: "Vendor A is ranked #1."
  - Flip scenarios (tabular):
    | Requirement | Current Score | Needed Score | Change | Flip Result |
    |---|---|---|---|---|
    | Data Security | A | B | -1 | Vendor B takes #1 |
    | Integration Time | B | A | +1 | No change (Vendor A still #1) |
    | Pricing | C | A | +2 | Vendor A gains 3 spots |
  - Interpretation: "Vendor A's ranking is stable if Data Security score remains A or B. Dropping to C would reverse decision."
- Agent attribution: "Analysis by Claude (Sonnet)".

**Actions:**
- [Export Table]: CSV download of flip scenarios.
- [What-If]: click scenario to simulate scoring change (interactive mode).
  - Change score in table, vendor ranking updates in real-time.
  - [Apply Changes] or [Revert].

---

#### Capability #14: TCO Analysis Narrative (Sonnet)

**Purpose:** Narrative comparing vendor costs with insights and recommendations.

**Plan & Phase Gating:**
- Available: Phase 12 (Selection & Closeout).
- Business+ plans only.
- Included in plan limits.

**Surface:** TCO Dashboard.

**Trigger:** Manual — user clicks [Generate TCO Narrative] button in TCO Dashboard toolbar.

**Display:**
- TCO Narrative panel (modal or side panel):
  ```
  ## Cost Comparison Summary
  
  Vendor A leads on total 3-year TCO ($850K vs. Vendor B $920K, 7.6% savings).
  
  ### Key Cost Drivers
  - **Licensing**: Vendor A's per-user model ($25/user/mo) is 15% cheaper than Vendor B ($29/user/mo).
  - **Implementation**: Both quote similar services (~$120K), but Vendor A includes 3 months of onboarding vs. 1 month for Vendor B.
  - **Support**: Vendor A's support tier ($15K/year) offers 24/7 response vs. Vendor B business hours only.
  
  ### Risk Flags
  - Vendor B pricing increases 8% annually (contract terms). Vendor A caps at 3%.
  - Vendor A has upfront $40K appliance cost. Recover in 22 months.
  
  ### Recommendation
  Vendor A offers better overall value. Negotiate Vendor B's support hours if preferred.
  ```
- Agent attribution: "Narrative by Claude (Sonnet)".

**Actions:**
- [Download as PDF]: exports narrative.
- [Share with Team]: email narrative to workspace members.
- [Edit]: manually refine narrative text.

---

#### Capability #15: Sensitivity Narrative (Sonnet)

**Purpose:** Analyze how robust final recommendation is under different weighting scenarios.

**Plan & Phase Gating:**
- Available: Phase 12 (Selection & Closeout).
- Enterprise plan only.
- Included in plan limits.

**Surface:** Selection Report (auto-generated section).

**Trigger:** Automatic during Selection Report generation (Phase 12). Sonnet analyzes scoring variance and requirement weights.

**Display:**
- Selection Report includes section: "Recommendation Robustness (Sensitivity Analysis)".
  ```
  ## Recommendation Robustness
  
  Current recommendation: Vendor A.
  
  Sensitivity Test Results:
  - If "Data Security" weight increases from 20% → 30%: Vendor A still wins.
  - If "Price" weight increases from 15% → 25%: Vendor B moves to #1.
  - If "Uptime SLA" requirement raised to A+ (from A): Vendor C enters top 3.
  
  Conclusion: Recommendation is moderately sensitive to pricing weight changes. 
  If cost containment becomes critical business objective, Vendor B warrants reconsideration.
  ```
- Agent attribution: "Analysis by Claude (Sonnet)".

**Actions:**
- View only in Selection Report (read-only).
- [Export Report as PDF]: includes sensitivity section.

---

### Cross-Phase / Seller-Side

#### Capability #16: Org Intelligence Briefing (Sonnet)

**Purpose:** Vendor performance analysis across historical evaluations.

**Plan & Phase Gating:**
- Available: Any phase.
- Business plan: vendor history in current workspace only.
- Enterprise plan: cross-workspace analytics + competitive suggestions.
- Included in plan limits.

**Surface:** Intelligence Dashboard (Seller console).

**Trigger:** Manual — vendor clicks [Generate Briefing] button in dashboard.

**Display:**
- Briefing modal: "Organization Intelligence: [Vendor Name]".
  ```
  ## Performance Summary
  
  Evaluated in 3 workspaces (RFP Year 1-3).
  Average ranking: #2 (range #1–#3).
  Average score: 82/100.
  
  ### Strengths
  - Consistently high marks on integration capability (avg A).
  - Strong response time across evaluations.
  
  ### Improvement Areas
  - Pricing feedback: "expensive relative to feature set" (mentioned in 2 of 3 evaluations).
  - Support: complaints about response time (esp. off-hours).
  
  ### Competitive Insights (Enterprise)
  - Main competitors: Vendor X, Vendor Y (appear in similar RFPs).
  - Win rate vs. Vendor X: 60% (you win 3 of 5 head-to-head comparisons).
  - Pricing trends: 8% avg annual increase (industry avg 3%).
  ```
- Agent attribution: "Briefing by Claude (Sonnet)".

**Actions:**
- [Download PDF]: export briefing.
- [Share with Team]: email to internal contacts.

---

#### Capability #17: KB Staleness Detection (Haiku)

**Purpose:** Identify outdated knowledge base entries requiring review or update.

**Plan & Phase Gating:**
- Available: Always active (background service).
- All plans.
- Included in plan limits.

**Surface:** KB Health Dashboard (Seller console).

**Trigger:** Scheduled daily (background job). Haiku analyzes KB entry age, update frequency, usage.

**Display:**
- Health Dashboard widget: "Knowledge Base Status".
  - Green: X entries current (updated < 90 days).
  - Yellow: Y entries review_due (last updated 90–180 days ago).
  - Red: Z entries flagged_stale (> 180 days, low usage).
- Sortable list of flagged entries with:
  - Title.
  - Last updated date.
  - Status badge (review_due / flagged_stale).
  - [Review] button.

**Actions:**
- [Review]: opens KB editor. Mark as [Current] after edit (resets review_due flag).
- [Archive]: moves entry to archive (hidden from responses but retained for history).
- Bulk actions: select multiple, [Mark Current] or [Archive All].

**Staleness Scoring Logic:**
```
Days since update | Usage count | Status
< 90 days        | any         | Current (green)
90–180 days      | > 0/month   | review_due (yellow)
90–180 days      | 0/month     | flagged_stale (red)
> 180 days       | any         | flagged_stale (red)
```

---

#### Capability #18: KB-to-Capability Suggestion (Haiku)

**Purpose:** Suggest capability declaration based on KB content.

**Plan & Phase Gating:**
- Available: Always active.
- All plans.
- Included in plan limits.

**Surface:** Capability Declarations page (Seller console).

**Trigger:** Automatic after KB entry marked as [Current]. Haiku analyzes KB content and suggests new capability.

**Display:**
- Notification banner in Capability page: "New capability suggestion based on updated KB entries. [View Suggestion]".
- Click [View Suggestion]: modal "Create Capability from KB Entry".
  - KB entry reference: "KB: '[Entry Title]'".
  - Suggested capability declaration (auto-generated, editable):
    ```
    Name: "OAuth2 with PKCE Flow"
    Description: "Supports OAuth2 authentication with PKCE (Proof Key for Code Exchange) for enhanced security. See KB entry '[Entry Title]' for implementation details."
    Category: "Authentication"
    ```
  - [Create] [Dismiss] buttons.

**Actions:**
- [Create]: creates capability declaration with populated fields. User can edit further.
- [Dismiss]: ignores suggestion (but remembers KB entry, won't re-suggest).
- [Edit First]: modal closes, opens capability form with pre-filled data.

---

#### Capability #19: Pulse Digest (Sonnet)

**Purpose:** Weekly summary email and in-app digest of workspace health, actions, and metrics.

**Plan & Phase Gating:**
- Available: Any phase.
- All plans.
- Included in plan limits.

**Surface:** Email + Inbox Pulse widget + Pulse Archive.

**Trigger:** Scheduled weekly (Monday 9am, configurable per user in Notification Preferences).

**Display:**

**Email Format:**
```
Subject: [Workspace Name] Weekly Pulse — [Week of MM/DD]

Hi [User Name],

## 📊 Health Score Snapshot
Overall: 78/100 (up from 75 last week)
- Requirements Health: 82/100
- Response Coverage: 75/100
- Scoring Progress: 68/100

## 🎯 Top Action Items
1. Review 3 Q&A items from Vendor X (waiting since Tuesday).
2. Phase advance gates: 8 of 9 gates passing. Missing: ≥1 vendor invited (in progress).
3. Amendment pending review: "Feature X scope clarification" (8 hours old).

## 📈 Key Metrics
- Active reviewers: 4 (up from 2 last week)
- Avg response time: 3.2 days (target 2 days)
- Scoring variance: low (0.15 avg divergence)

## 🤖 AI Summary
"Team is progressing well. Amendment process is smooth (0 rejections). Consider extending vendor response deadline by 2 days based on 40% incomplete responses."

[View Full Pulse] or [View Workspace]
```

**In-App Pulse Widget:**
- Sidebar Inbox: "Pulse" section shows digest snippet:
  ```
  Week of Apr 7
  • Health: 78/100 ↑
  • 3 action items pending
  • [View Pulse]
  ```
- Click [View Pulse]: opens Pulse Detail page.

**Pulse Archive:**
- Workspace → Pulse tab shows past 12 weeks of digests.
- Each week: Health score trend, action items summary, metrics.
- [Export as CSV]: downloads all weekly data for trending.

**Actions:**
- [Configure Schedule]: Notification Preferences → Pulse, change day/time.
- [Disable Pulse]: Notification Preferences → uncheck Pulse.
- [Share Pulse]: email digest to team members (one-time).

---

#### Capability #20: SLA Escalation (Rule-Based)

**Purpose:** Automated escalation notifications when SLA timers breach.

**Plan & Phase Gating:**
- Available: Any phase.
- All plans.
- Rule-based (not Sonnet).

**Surface:** Triage Queue + Inbox + Email.

**Trigger:** SLA timer expires (deadline passes). Rule engine detects breach.

**Display:**

**In-App:**
- Triage Queue: items with breached SLA move to top, badge shows "OVERDUE BY 2h 15m" (red, pulsing).
- Inbox notification: "[Item Name] SLA breached by 2h 15m. Action required." [Extend SLA].
- SLA Timer badge (in-place): "Overdue by 2h 15m" (red background).

**Email:**
- Subject: "[URGENT] SLA Breached: [Item Name]".
- Body: Item details, time overdue, [Extend SLA] link (quick-action).

**Actions:**
- [Extend SLA]: opens modal "Extend SLA" with options +24h / +48h / +72h.
- Email action: [Extend until [date]] button in email (one-click, no modal).
- [View Item]: opens item detail in SidePeek.

---

#### Capability #21: Comment Thread Summary (Haiku)

**Purpose:** Auto-generated summary of lengthy comment threads.

**Plan & Phase Gating:**
- Available: Any phase.
- All plans.
- Included in plan limits.

**Surface:** Comment thread header (on requirements, responses, scoring cards).

**Trigger:** Manual — user clicks [Summarize Thread] on threads with ≥ 5 comments.

**Display:**
- Summary box below thread title (light background):
  ```
  Thread Summary (by Claude)
  "Team discussed data encryption approach. Consensus: AES-256 preferred due to compliance. 
  Open question: key rotation frequency (weekly vs. monthly). Follow-up needed from vendor."
  ```
- [View Full Thread] link.
- Agent attribution: "Summary by Claude (Haiku)".

**Actions:**
- [Expand Full Thread]: collapses summary, shows all comments.
- [Dismiss Summary]: hides summary for this session.
- [Regenerate]: re-runs summary if comments added.

---

## 7.3 Agent Error States

| Error Type | Display | Recovery |
|-----------|---------|----------|
| **Rate Limit** | Modal "You've reached your AI usage limit for this period. Upgrade or wait until [reset time]." | [Upgrade] or wait |
| **Token Overflow** | Toast "Document too large to process. Max 500 pages. Please split and try again." | User splits document, retries |
| **Capability Unavailable** | Toast "[Capability name] not available for your plan. Upgrade to [plan name]." | [Upgrade] link |
| **Network Error** | Toast "AI service unavailable. Retrying..." (auto-retry 3x). If persistent: "Service temporarily down. Try again in a few minutes." | Manual retry button |
| **Parse Failure** | Toast "Could not parse document. Unsupported format or corrupted file." | User uploads different format |
| **Confidence Too Low** | InsightCard "Suggestion confidence below threshold. Review manually." | User dismisses or manually edits |

---

## 7.4 Agent Cost Transparency

**Location:** Workspace Settings → AI & Billing.

**Display:**

### Cost Dashboard
```
AI Usage This Month: $287.45 / $500 (Business plan limit)

Token Usage by Capability:
[Bar chart showing tokens consumed]
  - Pre-Scoring: 125K tokens ($78.50)
  - Policy Parsing: 87K tokens ($54.31)
  - KB Suggestions: 45K tokens ($28.13)
  - Q&A Answers: 23K tokens ($14.38)
  - Other: 12K tokens ($7.49)

Remaining budget: $212.55
Overage cost: $0.50 per 1K tokens (auto-billable)
```

### Per-Capability Controls
- Toggle: [AI-Powered Pre-Scoring] enabled/disabled (off = no pre-scores generated, cost savings).
- Toggle: [KB Suggestions] enabled/disabled.
- Similar toggles for each major capability.

### Cost Estimation
- Hover capability: tooltip shows "Est. cost per run: $15" (e.g., Pre-Score All).
- Batch operation: "Estimated cost: $45 to pre-score 100 requirements." [Confirm] [Cancel].

### Overage Resolution
- When approaching limit (80%+): warning email "You're at 80% of your AI budget. Disable non-critical capabilities or upgrade."
- At limit: features disabled gracefully with toast "AI features temporarily paused. Upgrade or wait for reset (3 days remaining)."
- Overage allowed on Enterprise plan (auto-billed). Business plan: hard stop.

---

# 8. SaaS Operational Surfaces

## 8.1 Plan & Billing UX

### 8.1.1 Plan & Billing UX (paid tiers — Starter / Growth / Scale / Enterprise)

Existing specification retained without modification. Covers:
- Plan selection with feature comparison matrix.
- Upgrade/downgrade flows with proration.
- Usage overage resolution.
- Invoice history and payment methods.
- AIWallet widget rendering per Master Spec §4.8.3 / §34.10 (`included_budget_remaining`, `overage_balance`, `committed_remaining`).
- Per-AIOperation Billing Ledger row breakdown per Master Spec §4.8.1.

### 8.1.2 Solo-Tier Billing Surface (Phase 14.10 — 2026-04-28)

**Authoring source.** Master Spec §44.6 (Solo-Tier Surface Treatment) is the authoritative engine contract; this section authors the surface itself. Plan registration in Master Spec §34.1.1 (Buyer Solo) / §34.1.2 (Seller Solo). Price authority in Master Spec §34.2.1 / §34.2.2 / §34.2.5.

**Localization binding.** All Solo Card copy and the throttling toast resolve through Master Spec §37.2.1 key groups `billing.solo_card.subscription`, `billing.solo_card.per_eval`, `billing.solo_card.per_bid`, and `billing.solo_envelope.throttling_paused`. Component code MUST consume localization keys, not inline English strings; price variables still resolve from Master Spec §34.2.1 / §34.2.2 / §34.2.5 at presentation time.

**Plan-tier scope.** Renders for any Org whose `console`-scoped `plan_tier ∈ {buyer_solo, seller_solo}` per Master Spec §34.1 (Plan Tiers) and Appendix J `Plan Tiers`.

**Surface inventory.** The Solo billing surface is a single Card that REPLACES the §8.1.1 paid-tier billing surface set on a Solo console. The Card replaces the AIWallet widget, the rate-card link, the per-AIOperation Billing Ledger detail surfaces, the wallet-overage configuration screens, and the auto-topup configuration screens. The Card renders in three variants per the Org's billing mode (Master Spec §44.6.2).

**Variant A — Subscription (annual or monthly).**

- Container: standard Card component (this Spec §5.2 — Card / Surface).
- Title (heading-3 typography per this Spec §2.1): **"Plan: Solo"**.
- Primary metric (display-2 typography per this Spec §2.1): **"{canonical Solo subscription price}/mo"** with annual or monthly price resolved at presentation time from Master Spec §34.2.1 (Buyer) / §34.2.2 (Seller).
- Secondary line (caption typography): "Renews {YYYY-MM-DD} · Cancel anytime".
- Action chips (icon + label, this Spec §5.2 — Chip):
  - **"Manage payment method"** — opens Stripe customer portal in a new tab (target=`_blank` rel=`noopener noreferrer`).
  - **"Change plan"** — navigates to the §34.5 plan-change surface.
- No wallet widget. No rate-card link. No per-AIOperation ledger affordance. No overage CTA. No auto-topup configuration. No value-dollar denomination. (Master Spec §44.6.1 Surface Hide List.)

**Variant B — Per-evaluation (Buyer Solo only).**

- Container: standard Card.
- Title: **"Eval billed"**.
- Primary metric: **"{canonical per-evaluation price} paid {YYYY-MM-DD}"**.
- Secondary line: "7-day refund window · 90-day retention".
- Action chips:
  - **"Request refund"** — visible only when `now < refund_window_at` AND the Selection Report PDF has been opened ≤ 3 times per Master Spec §34.2.5 Buyer Solo refund-eligibility rule. Suppressed otherwise.
  - **"Convert to subscription"** — links to the Master Spec §34.2.5 mid-evaluation conversion crediting flow.
  - **"Manage payment method"**.

**Variant C — Per-bid (Seller Solo only).**

- Container: standard Card.
- Title: **"Bid for {Buyer Company}"** — `{Buyer Company}` is the buyer Org's display name from the bound Bid Workspace.
- Primary metric: **"{canonical per-bid price} charged {YYYY-MM-DD}"**.
- Secondary line: "7-day refund window · 90-day retention".
- Action chips:
  - **"Request refund"** — visible only when `now < refund_window_at` AND the buyer has not opened the bid submission per Master Spec §34.2.5 Seller Solo refund-eligibility rule. Suppressed otherwise.
  - **"Convert to subscription"**.
  - **"Manage payment method"**.

**Throttling toast (Master Spec §44.6.4 #3).**

- Component: Toast (this Spec §5.2 — Toast / Notification).
- Position: top-right on viewports ≥ 480px; bottom sheet on viewports < 480px.
- Copy: **"Some background suggestions paused — your active workflow is unaffected."**
- Timing: auto-dismiss after 8 seconds.
- Modality: non-modal; non-blocking.
- Dismiss: explicit close affordance.
- No upgrade CTA. No per-capability detail. No value-dollar denomination. No follow-up prompt. No envelope-percentage indicator.
- Frequency: at most once per Org per envelope window per Master Spec §44.6.8 #7. Subsequent suppressed invocations within the same window are silent.
- DND override: respects quiet hours per §29.3 user preferences but is NEVER suppressed by DND, because the suppressed capability set may otherwise surface as an unexplained absence.

**State catalog.**

| State | Render |
| :---- | :---- |
| Loading (Card) | Skeleton matching Card geometry (this Spec §3.7 — Loading States); 200 ms minimum visible per §3.5.1 to avoid flash. |
| Empty (Solo on signup day) | Card renders the active billing-mode variant immediately at signup; no "no billing yet" empty state. |
| Error (subscription metadata fetch fails) | Card renders title + "Couldn't load plan details" with "Retry" affordance per this Spec §3.7 — Error States; engine continues to function. |
| Error (Stripe portal launch fails) | Action chip surfaces an inline error toast with retry; the Card itself does not unrender. |
| Refund-window-exceeded (Variant B / C) | "Request refund" chip suppressed; remaining card content unchanged; no banner explaining the suppression (the lack of a chip is the surface). |
| Throttling state engaged | Toast renders per the toast spec above; Card content is unchanged. |
| Throttling state cleared | Toast does NOT fire (silent recovery per Master Spec §44.6.4 #6 / §44.6.8 #10). |

**A11y (this Spec §11.6).**

- Card meets WCAG 2.1 AA: 4.5:1 minimum contrast on all text; 3:1 minimum on actionable affordances and focus-visible outlines.
- Card title is a heading per this Spec §3.5 — Page Header Pattern.
- Action chips are buttons with descriptive `aria-label` ("Manage payment method", "Change plan", "Request refund", "Convert to subscription").
- Throttling toast meets WCAG 2.1 AA toast pattern; carries `role="status"` for non-blocking polite announcement; respects `prefers-reduced-motion` per this Spec §2.6.

**Mobile (this Spec §3.4).**

- Card stacks under the page-header on viewports < 640px.
- Action chips stack vertically on viewports < 480px.
- Throttling toast renders as a bottom sheet on viewports < 480px per this Spec §5.2 — Toast.

**What this surface MUST NOT include** (Master Spec §44.6.1 Surface Hide List).

- AIWallet widget (Master Spec §4.8.3 / §34.10).
- Rate-card link or rate-card preview.
- Per-AIOperation Billing Ledger row breakdown.
- Wallet-state badge ("80% used", "Overage active", "Hard-capped").
- Free-allowance counter ("3 of 10 free runs left").
- Per-capability spend breakdown.
- Value-dollar denomination (absorbed-envelope amount, per-period spend).
- Plan-tier matrix (other plans listed for comparison) — only the active plan is named on the Card; tier names appear elsewhere only at upgrade-CTA moments per BPS §5.5 / SPS §5.5.
- Throttling-percentage indicator on the Card.
- Per-capability throttling state breakdown.

**Acceptance criteria.**

1. The Card MUST render exactly one of Variants A / B / C based on the Org's billing mode for the current period.
2. The Card MUST be the only billing-related surface on a Solo Org per Master Spec §44.6.8 #2.
3. The throttling toast MUST fire at most once per Org per envelope window per Master Spec §44.6.8 #7.
4. The throttling toast MUST NOT include an upgrade CTA per Master Spec §44.6.8 #11.
5. Mobile layouts MUST satisfy this Spec §3.4 responsive breakpoints; QA test asserts.
6. WCAG 2.1 AA contrast and focus-visible per this Spec §11.6.
7. Card content MUST cite Master Spec §34.2.1 / §34.2.2 / §34.2.5 for prices at presentation time; static prices in component code are forbidden (Master Spec CI gate `solo_billing_card_price_single_source`, §44.6.8 #14).
8. The Solo Card MUST replace, not supplement, the paid-tier billing surface set: the §8.1.1 AIWallet widget, the rate-card link, and the per-AIOperation Billing Ledger row breakdown MUST NOT render concurrently with the Solo Card.
9. The "Request refund" chip MUST be suppressed (not rendered as disabled) when refund eligibility per Master Spec §34.2.5 fails.
10. The "Convert to subscription" chip MUST link to the Master Spec §34.2.5 mid-evaluation / mid-bid conversion crediting flow.

**Cross-references.**

- Master Spec §44.6 — Solo-Tier Surface Treatment (engine contract).
- Master Spec §44.6.1 — Surface Hide List.
- Master Spec §44.6.2 — Single-Card Billing Surface (mode variants).
- Master Spec §44.6.4 — Throttling Behavior (toast contract).
- Master Spec §34.1.1 / §34.1.2 — Solo plan-tier registration.
- Master Spec §34.2.1 / §34.2.2 / §34.2.5 — Pricing authority.
- Master Spec §34.5 — Plan Upgrade / Downgrade.
- Master Spec §34.10.3 — Solo-co-resident rule.
- Master Spec Appendix M — Surface/Engine Mapping rows under "Solo-Tier Surface Treatment (§44.6)".
- BPS §2.8, §5.5 (Buyer Solo invisible AI consumption); SPS §2.9, §5.5 (Seller Solo invisible AI consumption).

---

## 8.2 Notifications & Delivery

Existing specification retained without modification. Covers:
- In-app toast notifications (transient alerts).
- Inbox persistent notifications.
- Email delivery rules and opt-outs.
- Do Not Disturb scheduling.

---

## 8.3 Audit Logging UI

Existing specification retained without modification. Covers:
- Audit log viewer (Workspace Settings).
- Filterable by action, user, entity, date.
- Event detail expansion (context, old/new values).
- Compliance export (machine-readable audit trail).

---

## 8.4 SCIM Provisioning UI

Existing specification retained without modification. Covers:
- SCIM endpoint configuration (Enterprise).
- Connection test and status.
- User sync preview and scheduling.
- Group mapping configuration.

---

## 8.5 Integrations UI

Existing specification retained without modification. Covers:
- Integration marketplace (pre-built connectors).
- OAuth flow for third-party tools.
- Custom webhook configuration.
- Integration status and sync history.

---

## 8.6 Data Export UI

Existing specification retained without modification. Covers:
- Export formats (CSV, JSON, PDF).
- Scheduled exports (daily/weekly/monthly).
- Encrypted download links with expiration.
- Compliance-ready exports (GDPR format).

---

## 8.7 Feature Flag Behavior

**Purpose:** Control feature visibility and rollout via PostHog feature flags.

**Rendering Rules:**

| Flag State | Behavior |
|-----------|----------|
| **Enabled** | Feature renders normally in UI. Visible to all qualifying users. |
| **Disabled** | Feature completely hidden from navigation and UI. No stub placeholder. No disabled state shown. |
| **Rollout (%)** | Feature visible to percentage of users. Assignment is session-sticky (same user sees consistently within session, may vary across sessions). |
| **Plan-Gated** | Plan tier entitlement checks (Business/Enterprise) override flags. Flags are for staged rollout and kill switches only. |

**Implementation:**

```javascript
// Example: Feature flag check (pseudo-code)
if (featureFlags.isEnabled('amendment_protocol')) {
  // Render Amendment UI
} else {
  // Feature completely hidden
}

// Rollout example: 25% of users get new UI
if (featureFlags.isEnabledForUser('scoring_ui_v2', { rollout: 25 })) {
  // Render v2 Scoring UI
} else {
  // Render v1 Scoring UI (stable, default)
}
```

**User Experience:**

- Users do not see feature flags in UI (no "beta", "experimental" badges unless explicitly designed).
- Flag-disabled features silently absent from navigation.
- Rollout transitions are transparent (user may see feature toggle across sessions as rollout percentage increases).
- Workspace Owner can request early access to flagged features via Settings → Beta Features → [Feature Name] [Request Access].

**Compliance with Plan Gates:**

- Business plan users do not access Enterprise-gated features even if flag is enabled.
- Phases gates are separate from feature flags. Phase-restricted features check phase before checking flag.

---

## 8.8 Custom Branding (Enterprise)

**Purpose:** Allow Enterprise customers to customize Sourcera UI with custom logo, colors, and domain.

**Location:** Workspace Settings → Branding (Enterprise org only).

**Customization Options:**

### Logo
- **Upload**: drag-and-drop or [Browse] button accepts PNG/SVG, max 500KB, recommended 240x60px.
- **Placement**: replaces Sourcera logo in sidebar header (top-left) and login page.
- **Preview**: live preview in settings page and sidebar.
- **Fallback**: if no custom logo, Sourcera logo displays (light/dark variant per theme).

### Primary Color
- **Color Picker**: hex input or color wheel selector.
- **Accessibility Check**: WCAG 4.5:1 contrast ratio validated against white/black backgrounds. Warning if fails: "This color may have contrast issues. Recommended: [lighter/darker variant]."
- **Applied To**: accent color throughout UI (buttons, links, badges, focus states).
- **Variants**: system auto-generates lighter/darker variants (hover, active states).

### Favicon
- **Upload**: ICO, PNG, or SVG, max 64x64px.
- **Browser Tab**: replaces Sourcera favicon in browser tab.

### Custom Domain
- **Enable**: toggle "Custom Domain" in Branding settings.
- **Domain Input**: text field for custom domain (e.g., "procurement.acme.com").
- **DNS Setup**: instructions for CNAME record:
  ```
  CNAME: procurement.acme.com → sourcera-prod.acme-workspace.vercel.app
  ```
- **Verification**: system checks DNS record, shows status "Verified ✓" or "Pending (check again)".
- **SSL Certificate**: auto-provisioned via Let's Encrypt (transparent to user).

**Verification Flow:**
1. User enters custom domain.
2. System generates unique CNAME target and displays setup instructions.
3. User adds CNAME record to DNS provider.
4. User clicks [Verify Domain] in settings.
5. System checks DNS propagation (may take 15 minutes).
6. On success: "Custom domain active. Workspace accessible at [custom domain]."
7. Workspace now accessible via custom domain. Original Sourcera domain still works (redirects).

**Branding Preview:**

- Live preview in settings page showing:
  - Sidebar with custom logo.
  - Login page with custom logo and primary color.
  - Button styling with custom color.
- Mobile preview (toggle sidebar to show mobile layout).

**Access & Management:**

- Only Org Admin can modify branding.
- Audit log tracks branding changes (logo, color, domain) with timestamp and author.
- Rollback available: restore previous branding configuration.

---

## 8.9 Data Privacy UI

**Purpose:** Provide user control over personal data and account lifecycle per GDPR and privacy regulations.

**Location:** Settings → User Profile → Data & Privacy.

**Options:**

### Request Data Export

**Purpose:** GDPR Article 15 (Right of Access) export.

**Trigger:** Click [Request Data Export] button.

**Display:**
- Modal: "Request Your Data".
  ```
  We'll compile all personal data associated with your account and deliver it via secure email.
  
  This includes:
  - Profile information (name, email, avatar)
  - Workspace memberships and roles
  - Comments and mentions
  - Scoring contributions
  - Activity logs
  - Notification preferences
  
  Format: JSON (machine-readable)
  Delivery: Secure email link (7-day validity)
  Processing time: 5–10 business days
  
  [Request Export] [Cancel]
  ```

**Execution:**
- Click [Request Export]: system queues data export job.
- User sees toast: "Data export requested. We'll email you a download link within 10 business days."
- Background job runs: compiles all personal data into JSON file.
- On completion: secure email sent to user with:
  ```
  Subject: Your Sourcera Data Export
  
  Your data export is ready for download.
  [Download Data] (link expires in 7 days)
  
  File size: [X MB]
  Format: JSON
  ```
- Download link is time-limited (7-day expiry, one-time use), encrypted HTTPS.

**JSON Structure:**
```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2023-01-15T10:00:00Z"
  },
  "workspaces": [
    {
      "id": "ws_456",
      "name": "Acme Procurement RFP",
      "role": "Evaluation Lead",
      "joinedAt": "2023-02-01T10:00:00Z"
    }
  ],
  "comments": [
    {
      "id": "cmt_789",
      "content": "This requirement is unclear...",
      "createdAt": "2023-03-15T10:00:00Z",
      "workspaceId": "ws_456"
    }
  ],
  "scores": [
    {
      "id": "score_111",
      "requirement": "Feature X",
      "grade": "A",
      "submittedAt": "2023-04-10T10:00:00Z"
    }
  ],
  "activityLog": [
    {
      "action": "signed_in",
      "timestamp": "2024-01-20T14:30:00Z",
      "ipAddress": "[redacted]",
      "userAgent": "[redacted]"
    }
  ]
}
```

**Progress Indicator:**
- Settings → Data & Privacy shows export status: "Export in progress (2 of 5 steps completed)...".
- Refresh to check completion. Email notification sent when ready.

---

### Request Account Closure

**Purpose:** GDPR Article 17 (Right to be Forgotten) with reflection period.

**Trigger:** Click [Request Account Closure] button.

**Warning Modal:**
```
Account Closure — 30-Day Reflection Period

Closing your account will:
  ✗ Deactivate your login credentials
  ✗ Remove you from all workspaces
  ✗ Delete your personal data (profile, preferences, comments marked as deleted)
  ✓ Retain organization-owned data (requirements, responses, scoring records)
    — these remain in workspaces for audit/compliance

You have 30 days to cancel this request. After 30 days, deletion is permanent.

Workspace Owners: You'll be notified of your departure.

[I Understand, Close My Account] [Cancel]
```

**Confirmation - Password Required:**
- Secondary modal: "Confirm Account Closure".
  - FormField: "Enter your password to confirm."
  - Help text: "We need your password to ensure this is you."
  - [Cancel] [Close Account] (primary).

**Execution:**
- Click [Close Account]:
  1. System marks account as `pending_deletion` with 30-day timer.
  2. User logged out immediately.
  3. User receives email:
     ```
     Subject: Account Closure Initiated
     
     Your Sourcera account will be permanently deleted on [Date 30 days from now].
     
     To cancel closure before the deadline, reply to this email or re-login at [link].
     
     After [Date], all personal data will be permanently deleted.
     ```

**Reflection Period (30 Days):**
- User can re-login with credentials during 30-day window.
- On re-login: modal "Your account closure is scheduled for [Date]. [Cancel Closure] or [Continue Closure]".
- [Cancel Closure]: account reactivated, `pending_deletion` flag removed.
- If no action: on day 31, automatic deletion job runs:
  1. Personal data deleted: profile, comments, preferences, activity logs.
  2. Organization data retained: requirements, responses, scores (creator marked as "[Deleted User]").
  3. User record archived (soft delete, no re-registration allowed under same email for 90 days).

**Post-Closure Notification:**
- Workspace Owners receive notification: "[User] has closed their account. Their contributions are archived."
- Organization admins can access archived data via audit log.

**Data Retention After Closure:**
```
Item                    | Retained? | Visibility
Personal profile        | No        | —
Comments                | Yes (anon)| Marked "[Deleted User]"
Scores/Grades          | Yes       | Attributed to "[Deleted User]"
Requirements (authored)| Yes       | Creator: "[Deleted User]"
Audit logs             | Yes       | Compliance records
```

---

## 8.10 Workspace Settings Navigation

**Location:** Workspace Settings (gear icon, bottom-left sidebar).

**Tabs:**
- **General**: Workspace name, description, logo, phase, archive (Workspace Owner only).
- **Members**: User list, invite, roles, guest management.
- **Branding**: Custom logo, colors, domain (Enterprise only).
- **Integrations**: Connected apps, webhooks, SCIM endpoint.
- **Data & Export**: Export formats, scheduled exports, retention policies.
- **Notifications**: Team notification rules, escalation settings, digest frequency.
- **Audit Log**: All workspace changes, filterable by action, user, date.
- **AI & Billing**: AI usage, cost breakdown, capability toggles, plan details.
- **Data Privacy**: Data export, account closure, GDPR settings.

---


---

# 9. States & Edge Cases

## 9.1 Loading States

| Component/Feature | Skeleton/Placeholder | Max Duration | Notes |
|---|---|---|---|
| Page shell | Gray background with content placeholders | < 500ms | Skeleton never flashes if load completes sooner |
| DataTable (100 rows) | Row skeletons, 8 columns | < 1s | Preserves column widths. User can scroll while loading. |
| Modal content | Content skeleton inside modal frame | < 1s | Modal frame appears immediately; content streams in |
| Triage queue load | Row skeletons with SLA timers. Avatar placeholders. | < 500ms | Board and list views both show skeletons |
| Team list load | Card skeletons showing member count + health score placeholders | < 500ms | Grid layout maintained |
| KB crawl initiation | "Crawling..." with URL displayed + progress indicator (0-100%) | 10-120s | Progress updates in real-time. User can cancel. |
| NDA document load | Document skeleton (blank pages with border) | < 2s | Renders page indicators while loading |
| Marketplace search | Card skeletons in grid (4 columns on desktop) | < 1s | Responsive grid adjusts skeleton count per row |

## 9.2 Empty States

| Location | Headline | Body | Primary CTA | Secondary CTA |
|---|---|---|---|---|
| Bid Workspace List (seller, no bids) | No active bids | You'll see incoming evaluation opportunities here. | — | Browse Marketplace |
| Triage Queue (no items) | Queue is empty | New requirements will appear here when assigned to your team. | — | — |
| Template Library (no templates) | No templates yet | Templates pre-populate workspaces with Use Cases and Requirements. | Browse Curated Templates | Create from Workspace |
| Capability Declarations (no declarations) | No capabilities declared | Declare your product capabilities to improve marketplace visibility. | Declare Capability | — |
| Document Library (no documents) | No documents uploaded | Upload compliance certificates, SOC2 reports, and other reusable documents. | Upload Document | — |
| Agent Instructions (no instructions) | No agent instructions set | Write instructions to guide AI scoring and response drafting for this team. | Write Instructions | — |
| Marketplace Listings (seller, no listings) | No marketplace listings | Create a listing to showcase your product to potential buyers. | Create Listing | — |
| Selection Report (not yet generated) | Report not yet available | The Selection Report generates automatically when Phase 12 begins. | — | — |

## 9.3 Error States

### Page-Level Errors

| Error Type | Display | CTA(s) | Persistence |
|---|---|---|---|
| Network error | Full-page error illustration + "Connection lost. Check your network and try again." | [Retry] | Dismissible. Auto-retry on connection restore. |
| 404 Not Found | Full-page + "This workspace doesn't exist or has been archived." | [Return to Dashboard] | Hard error, no retry |
| 403 Forbidden | Full-page + "You don't have permission to view this resource." | [View Profile] [Contact Admin] | Hard error. Suggest requesting access. |
| 500 Server Error | Full-page + "Something went wrong. Our team has been notified. Please try again." | [Retry] [Report Issue] | Transient. Auto-logs incident ID. |
| Plan limit reached | Banner (yellow, sticky at top) + "Your organization has reached the [entity] limit for the [plan] plan. Upgrade to continue." | [Upgrade] | Dismissible. Reappears on page reload. |
| Agent budget depleted | Banner on agent-powered pages (orange, sticky) + "AI usage limit reached for this month. Manual workflows remain available." | [View Usage] [Upgrade Plan] | Sticky until next billing cycle |
| Firecrawl error | Inline on KB crawl config (red card) + "Crawl failed: [reason]. Check URL accessibility and try again." | [Retry] [View Log] | Dismissible. User can modify URL and retry. |
| SSO configuration error | Full-page on login + "SSO authentication failed. Contact your IT administrator." | [Try Again] [Sign in with Email] | Transient. Email fallback always available. |
| Webhook delivery failure | Inline in Integrations (red alert) + "Webhook failed after 5 retries. Payload stored in DLQ." | [View Payload] [Retry] [Disable Webhook] | Non-blocking. Webhook disabled after 10 consecutive failures. |

### Inline Errors

| Error Type | Trigger | Display | Duration |
|---|---|---|---|
| Field validation | On blur (text, email, phone) or on submit | Red border + error text below field. ARIA live region announces error. | Until valid value entered |
| File upload too large | On file selection | Toast (error) + "File exceeds maximum size of [limit]. Maximum: 50MB." | 6s auto-dismiss |
| File type not supported | On file selection | Toast (error) + "File type not supported. Accepted: PDF, DOCX, XLSX, PNG, JPG." | 6s auto-dismiss |
| SLA extension denied | On extension attempt | Toast (error) + "Only Team Owners can extend SLA timers." | 6s auto-dismiss |
| Guest permission denied | On action attempt | Toast (error) + "This action is not available with your guest permissions." | 6s auto-dismiss |
| Amendment rejected (wrong phase) | On amendment submit in non-amendment phase | Toast (error) + "Requirements can only be amended during Phases 6-9." | 6s auto-dismiss |
| Duplicate requirement detected | During policy ingestion, policy review step | Inline warning below requirement (yellow card) + "Similar to existing Req #[N]." | Non-dismissible. User must choose. |
| Duplicate requirement actions | With duplicate warning | [View Match] [Keep Both] [Merge] | User decision required before proceeding |

## 9.4 Phase Transition Edge Cases

| Scenario | Behavior | Timing | User Notification |
|---|---|---|---|
| Phase 10 entry triggers Agent pre-scoring | All requirement-vendor score pairs queued for Agent scoring. Modal shows "Agent is pre-scoring all [N] requirement-vendor pairs. This may take several minutes." Progress bar displays. Pre-scores appear in Scoring Matrix as they complete. Users can review in real-time. | 5-120s depending on pair count | Modal on phase advance. Real-time toast updates as batches complete. |
| Phase 12 entry locks all scores | All scoring cells in Scoring Matrix show lock icon + tooltip "Scores are permanently locked. No further changes are possible." Edit controls removed. | Immediate on phase entry | Notification sent to all Workspace Members. Toast on page (if currently viewing). |
| Phase 13 entry makes workspace immutable | Entire workspace transitions to read-only. Sidebar shows archive icon next to workspace name. Content editing disabled. Publish option available to sellers: "Knowledge Base Offer: save vendor responses to your Knowledge Base for future use (opt-in)." | Immediate on phase entry | Notification sent to all members. Archive banner displayed in header. |
| Phase advancement with active Q&A threads | If advancing past Phase 8 with unanswered vendor questions, gate validation fires warning: "N vendor questions remain unanswered. Advance anyway? [Cancel] [Advance]" | On phase advance attempt (Phase 8→9) | Modal gates advancement. User must explicitly confirm. |
| Phase advancement with SLA breaches | If advancing with breached SLA items, gate validation fires: "N items have breached their SLA. Advance anyway? [Cancel] [Advance]" | On phase advance attempt (any phase) | Modal gates advancement. Clicking items shows list of breached assignments. |

## 9.5 Data Conflict Resolution

| Conflict Type | Detection | Resolution | User Experience |
|---|---|---|---|
| Two users attempt to advance phase simultaneously | Server detects second advance POST during phase transition. | First-advance-wins. Second user's request rejected. | Second user sees toast: "Phase was just advanced by [User]. Refreshing..." UI updates automatically to new phase. |
| Team deleted while requirements assigned | Before deletion, system counts active requirements owned by team. | Blocking constraint: deletion fails if count > 0. | Error modal: "Reassign N requirements before deleting this team." Links to bulk reassign UI. |
| KB entry updated while used in active response | Webhook fires on KB entry update. Check if entry ID in active responses. | Responses flagged with status banner. | Response shows yellow banner: "A KB entry referenced in this response has been updated. [View Changes] [Update Response]" User can merge changes or discard. |
| Guest permission profile changed while guest is active | Permission change saved. Subscription notifies active sessions. | Permission change takes effect on next page load. Full reload of nav/CTA visibility. | Guest sees updated navigation immediately. Disabled features show lock icon. |
| Vendor submits response after workspace archived (Phase 13) | Workspace is read-only. API rejects submission. | Submission fails gracefully. | Toast (error): "This workspace is archived and no longer accepting responses." Seller sees option to [View Archived Workspace] or [Return to Bids]. |

## 9.6 Accessibility States

| Feature | Implementation | Standard | Testing |
|---|---|---|---|
| Color-blind safe grades | Grade badges (FM / PM / DNM / EX) use BOTH color AND distinct icon shapes (checkmark-circle / half-circle / x-circle / minus-circle). Icon shapes remain distinguishable to all color perception types. | WCAG 1.4.1 (Color Not Sole Means) | Simulated protanopia, deuteranopia, tritanopia in Figma plugin. |
| RTL readiness | All CSS uses logical properties (margin-inline-start, padding-block-end, inset-inline-end, etc.). No hardcoded left/right values in stylesheets. Flexbox/Grid use start/end, not left/right. | WCAG 3.2.1 (Consistent Navigation) | Rendered with dir="rtl" attribute. Arabic/Hebrew text verified. |
| Skip navigation link | Hidden "Skip to main content" link in page header. Visible on first Tab press. Links to main content area (role="main"). High contrast on focus (4.5:1 or better). | WCAG 2.4.1 (Bypass Blocks) | Keyboard navigation audit. Tab key first press. |
| ARIA landmarks | Semantic structure: `<aside>` (sidebar), `<main>` (content area), `<complementary>` (side peek), `<nav>` (breadcrumbs, tabs, command palette), `<div role="status">` (toast container), `<dialog>` or `<div role="dialog">` (modals). All regions labeled. | WCAG 1.3.1 (Info and Relationships) | Axe-core scan. Screen reader verification. |
| Form label association | All form inputs have visible `<label>` elements with htmlFor matching input id. No placeholder-only inputs. Placeholder used for hints only, not labels. | WCAG 1.3.1 (Labels or Instructions) | Lighthouse audit. Manual screen reader test. |
| Focus management | Focus indicator visible (3px outline, contrasting color). Focus order follows visual layout (left-to-right, top-to-bottom). Focus trap in modals. Focus restoration on modal close. | WCAG 2.4.7 (Focus Visible) | Tab through entire app. Focus order documented. |
| Motion and animation | Respect prefers-reduced-motion. Animations disabled or replaced with transitions if user prefers reduced motion. No auto-playing animations with sound. | WCAG 2.3.3 (Animation from Interactions) | Tested with prefers-reduced-motion: reduce media query enabled. |
| Error messages and alerts | Error messages associated with inputs via aria-describedby. Live regions announce critical errors to screen readers. Error summaries before form on failed submission. | WCAG 3.3.1 (Error Identification) | NVDA and JAWS testing. Axe-core. |
| Link context | Links have descriptive text ("Edit requirements") not placeholder text ("Click here"). Links that open new windows announced with aria-label. | WCAG 2.4.4 (Link Purpose) | Screen reader verification. Manual audit. |

## 9.7 Responsive Edge Cases

| Scenario | Behavior | Touch Target Size | Additional Notes |
|---|---|---|---|
| Scoring Matrix on tablet (iPad landscape) | Horizontal scroll enabled. Vendor column (fixed width 200px) remains sticky on left. Requirement ID column sticky on left beneath vendor name. Horizontal scroll snap enabled on score columns. All touch targets follow the Master Spec §38.6.2 tablet-tier minimum. Pinch-to-zoom disabled on grid (CSS: touch-action: manipulation) to prevent accidental score changes. | Master Spec §38.6.2 tablet-tier minimum | Two-finger tap shows cell details in popover instead of scoring. |
| Q&A Thread on mobile | Full-screen thread overlay. Question + answer history scrollable. Reply input field pinned to bottom above virtual keyboard. Markdown toolbar collapsed into single "Format" button opening popover menu. Send button (arrow icon) always visible next to input. | Master Spec §38.6.2 mobile-tier minimum | Keyboard offset managed: input scroll into view when focused. |
| Triage Queue on mobile | List view only (board view hidden). Horizontal swipe-left reveals action buttons (assign, priority, resolve). Pull-to-refresh enabled. Avatar + name always visible. SLA timer shown inline (no column hiding). List items are full-width touch targets. | Master Spec §38.6.2 mobile-tier minimum | Swipe dismissal not enabled (sticky tracking needed). Undo toast after swipe action. |
| Policy Ingestion on mobile | Step 1 (upload) functional on mobile. Steps 2-3 (review extracted requirements, resolve duplicates) redirect to desktop with informational banner: "Policy review is best experienced on desktop. Continue on your computer or dismiss to proceed anyway." [Continue on Desktop] [Dismiss]. | N/A | User can still proceed on mobile at reduced UX quality. Desktop experience prioritized. |
| Side Peek on tablet | Peek width is 72% of the viewport per Master Spec §38.6.2. Header includes a drag-down handle and back button; backdrop tap and Android hardware back close the overlay. | Master Spec §38.6.2 tablet-tier minimum | Peek leaves parent context visible behind the overlay. |
| DataTable with >8 columns on tablet | Columns ranked by priority (default: ID, name, status, assignee, due date, SLA, score, phase). Lowest-priority columns hidden automatically. User can toggle hidden columns via "Show more columns" button (down chevron icon, always visible in column header). | Master Spec §38.6.2 tablet-tier minimum | Column reordering disabled on mobile to save space. User preference persisted. |
| Command Palette on mobile | Full-width navigation bar replacing desktop Cmd+K palette. Magnifying glass icon in top-left nav opens search bar. Limited to navigation commands (jump to page) and entity search (find requirement/vendor). Action commands (bulk assign, archive, etc.) disabled and marked as "Desktop only". | Master Spec §38.6.2 mobile-tier minimum | Tap outside search closes it. Escape also closes. Search history available. |

---

# 10. Insertion Mapping

| UX Spec Section | Master Spec Section(s) | Insertion Context |
|---|---|---|
| 1. Product UX Principles | §3 (Product Strategy), §1 (Executive Summary), §21 (AI Capabilities), §3.3 (Success Metrics) | Product design kickoff, design system foundation, brand alignment |
| 2.1 Color Palette | §28 (Design System), §37 (Theming) | Color token definition, semantic color mapping |
| 2.2 Typography | §37 (Theming), §38 (Component Library) | Font stack selection, scale implementation |
| 2.3 Spacing Scale | §28 (Design System), §13 (Layout Principles) | Spacing token definition, rhythm application |
| 2.4 Elevation & Shadow | §38 (Component Library), §20 (Interaction Models) | Z-index strategy, depth perception |
| 2.5 Iconography | §37 (Theming), §38 (Component Library), §13 (Visual Language) | Icon system, naming convention, usage guidelines |
| 2.6 Motion & Timing | §20 (Interaction Models), §37 (Theming) | Easing curves, duration standards, animation principles |
| 2.7 Responsive Breakpoints | §38 (Component Library), §30 (Mobile Experience) | Breakpoint definitions, mobile-first approach |
| 2.8 Component Status Tokens | §37 (Theming), §20 (Interaction Models) | Disabled, error, loading, success states |
| 2.9 Form & Input Tokens | §36 (Form System), §37 (Theming) | Input sizing, focus states, validation styling |
| 3.1 Global Navigation | §11 (User Interface), §23 (Marketplace Navigation), §25 (Admin Interface) | Navigation hierarchy, information architecture |
| 3.2 Sidebar & Workspace Switcher | §11 (User Interface), §25 (Admin Interface) | Sidebar structure, org/workspace context switching |
| 3.3 Breadcrumbs & Wayfinding | §11 (User Interface), §23 (Marketplace Navigation), §38 (Component Library) | Breadcrumb hierarchy, URL routing model |
| 3.4 Header & Top Bar | §11 (User Interface), §30 (Mobile Experience) | Header components, responsive behavior |
| 3.5 Footer & Legal | §11 (User Interface), §43 (Legal & Compliance) | Footer contents, links, version info |
| 3.6 Empty States & Onboarding Flows | §36 (Onboarding), §11 (User Interface) | Empty state illustrations, guidance text |
| 3.7 Keyboard Shortcut Reference | §3.3 (Success Metrics), §20 (Interaction Models) | Keyboard navigation, command palette |
| 4.2.1 Buyer Dashboard | §11 (User Interface), §14 (Buyer Portal) | Home page layout, workspace overview, quick actions |
| 4.2.2 Requirements Matrix | §13 (Requirements Management), §27 (Scoring & Selection) | Requirements table, filtering, editing |
| 4.2.3 Requirements Detail & Edit | §13 (Requirements Management), §10 (Requirement Structure) | Requirement form, Use Case mapping, validation |
| 4.2.4 Scenario Modeling | §17 (Evaluation Scenarios) | Scenario builder, weighting controls, model execution |
| 4.2.5 Scoring Matrix | §27 (Scoring & Selection) | Score grid, agent pre-scoring, lock states |
| 4.2.6 Q&A Threads | §18 (Q&A Management), §27 (Scoring & Selection) | Thread UI, visibility controls, vendor limits (Phase 6-8, Business+) |
| 4.2.7 Vendor Detail | §14 (Buyer Portal), §27 (Scoring & Selection) | Vendor profile, NDA workflow, disqualification |
| 4.2.8 Comparison Viewer | §17 (Evaluation Scenarios), §27 (Scoring & Selection) | Side-by-side comparison, delta highlighting |
| 4.2.9 Policy Ingestion | §12 (Policy & Compliance Integration), §13 (Requirements Management) | Policy upload, requirement extraction, duplicate resolution (Phases 1-5, Business+) |
| 4.2.10 Workspace Overview & Phase Stepper | §14 (Buyer Portal), §11 (Phase Management) | Phase progress, gate validation, advancement |
| 4.2.11 Marketplace Discovery | §23 (Marketplace Navigation), §9 (Seller Profiles) | Search, filters, listing preview, EOI workflow |
| 4.2.12 Selection Report | §27 (Scoring & Selection), §11 (Phase Management) | Report generation (Phase 12+), export, audit trail |
| 4.2.13 Amendment Workflow | §10.7 (Amendment Protocol), §13 (Requirements Management) | Amendment diff, notification, response re-submission (Phases 6-9) |
| 4.2.14 Knowledge Base Management | §42 (Knowledge Base), §21 (AI Capabilities) | Manual entry, Firecrawl integration, deduplication, versioning |
| 4.2.15 Team Management & Triage | §8 (Teams & Governance), §8.3 (Triage Queue) | Team CRUD, member assignment, triage queue, SLA config |
| 4.2.16 Document Library | §13 (Requirements Management), §42 (Knowledge Base) | Document upload, version history, active bid notification |
| 4.2.17 Template Library | §13 (Requirements Management), §12 (Policy Templates) | Curated templates, custom template creation, workspace pre-population |
| 4.3.1 Seller Dashboard | §22 (Seller Portal), §9 (Seller Profiles) | Bid list, profile status, KB management |
| 4.3.2 Bid Workspace Detail | §22 (Seller Portal), §9 (Seller Profiles) | Response progress, task list, Q&A access (Phase 6-8) |
| 4.3.3 NDA Review & Signing | §24 (NDA Management), §9 (Seller Profiles) | Document viewer, sign/decline, consequence warning |
| 4.3.4 Capability Declarations | §9 (Seller Profiles), §23 (Marketplace) | Capability CRUD, verification tier advancement |
| 4.3.5 Marketplace Profile & Listing | §23 (Marketplace Navigation), §9 (Seller Profiles) | Profile edit, listing creation/edit, visibility controls |
| 4.3.6 Response Drafting & AI Assist | §22 (Seller Portal), §21 (AI Capabilities) | Multi-step form, AI suggestions, submission tracking |
| 4.3.7 Knowledge Base (Seller) | §42 (Knowledge Base), §21 (AI Capabilities) | Entry creation, versioning, usage analytics |
| 4.3.8 Seller Team Management | §9 (Seller Profiles), §8 (Teams & Governance) | Seller user roles, bid team assignment, permissions |
| 4.3.9 Seller Onboarding | §36 (Onboarding), §9 (Seller Profiles) | Welcome flow, NDA, profile completion, KB setup |
| 4.3.10 Seller Settings | §35 (Settings), §9 (Seller Profiles) | Billing, notification preferences, API tokens |
| 4.3.11 Seller Analytics | §26 (Seller Analytics), §9 (Seller Profiles) | Win rate, response metrics, marketplace visibility |
| 4.4.1 Settings: Notifications | §31 (Notification System), §35 (Settings) | Per-event toggles, email digest frequency, DND hours |
| 4.4.2 Settings: Security & MFA | §29 (Security & Authentication), §35 (Settings) | TOTP, WebAuthn, password reset, active sessions |
| 4.4.3 Settings: API & Integrations | §40 (Integration Architecture), §35 (Settings) | Token CRUD, webhook management, DLQ |
| 4.4.4 Settings: Organization & Members | §6 (Organization Structure), §35 (Settings) | User invite, role assignment, team management |
| 4.4.5 Settings: Workspace Configuration | §11 (Phase Management), §35 (Settings), §27 (Scoring) | Scoring rubric, scoring scale (PM/EJ), workspace state |
| 4.4.6 Onboarding: Buyer | §36 (Onboarding), §14 (Buyer Portal) | 7-step flow (org setup, requirements, vendors, evaluation, etc.) |
| 4.4.7 Onboarding: Seller | §36 (Onboarding), §9 (Seller Profiles) | Invitation email, signup, NDA, profile, KB welcome |
| 5.1 Button Component | §3 (Product Strategy), §11 (Component Library), §38 (Component Library) | Button variants, sizing, states, loading |
| 5.2 Input Components | §13 (Form System), §36 (Form System), §37 (Theming) | Text input, select, checkbox, radio, textarea |
| 5.3 Table Component (DataTable) | §11 (Component Library), §13 (Requirements Management), §38 (Component Library) | Sortable columns, filtering, pagination, cell types |
| 5.4 Modal Component | §20 (Interaction Models), §38 (Component Library) | Dialog patterns, focus management, animations |
| 5.5 Toast Notifications | §31 (Notification System), §38 (Component Library) | Toast types (success, error, warning, info), stacking |
| 5.6 Form Field Component | §13 (Form System), §36 (Form System), §38 (Component Library) | Label, input, error message, validation states |
| 5.7 Side Peek Component | §11 (Component Library), §20 (Interaction Models) | Overlay panel, gestures, responsive behavior |
| 5.8 Command Palette | §3.3 (Success Metrics), §20 (Interaction Models), §38 (Component Library) | Search, command categories, keyboard navigation |
| 5.9 Markdown Editor | §20 (Interaction Models), §38 (Component Library) | Rich text editing, toolbar, preview mode |
| 5.10 Triage Queue Component | §8.3 (Triage Queue), §38 (Component Library) | List/board view, drag-and-drop, SLA timer, bulk actions |
| 5.11 Phase Stepper | §11 (Phase Management), §38 (Component Library) | Visual progression, gate indication, advancement controls |
| 5.2.19 PipelineSurface | Master Spec §3.14 (Pipeline Surface Compression), §2.8.2 (Buyer Solo mapping), §22.19 (Seller compressed mapping), §3.3.1 (Team Mode chip ribbon), §10 (engine pipeline), §10.16 (Phase Advancement API) | Dual-state pipeline component — `solo` (4-step compressed bar, both consoles) and `team` (13-phase chip ribbon, Buyer only); composes PhaseAdvancer (§5.2.16) and ToastNotification (§5.2.5) for advancement and soft-gate paths. |
| 5.12 SLA Timer Component | §8.4 (SLA Configuration), §38 (Component Library) | Countdown, color thresholds, extension UI |
| 6.1 Comments & Annotations | §12 (Q&A Management), §18 (Q&A Management) | Comment threads, @mentions, rich text |
| 6.2 Change Tracking & Versioning | §10.7 (Amendment Protocol), §27 (Scoring & Selection) | Diff views, version history, audit logs |
| 6.3 Shared Workspace State | §19 (Real-time Collaboration), §40 (Integration Architecture) | Real-time updates, presence indicators, conflict resolution |
| 6.4 Vendor Notifications | §31 (Notification System), §18 (Q&A Management) | Question threads, response requests, phase changes |
| 6.5 Team Collaboration & Routing | §8 (Teams & Governance), §9 (Seller Profiles) | Team assignment, skill-based routing, escalation |
| 6.6 Amendment Protocol UX | §10.7 (Amendment Protocol), §13 (Requirements Management) | Amendment diff, notification, response re-submission (Phases 6-9) |
| 6.7 Guest Collaboration | §5.4 (Guest Access), §35 (Settings) | Guest invitations, limited permissions, expiration |
| 7.1 AI Scoring & Recommendations (Agent 1-7) | §21 (AI Capabilities), §27 (Scoring & Selection) | Pre-scoring, scoring assistance, recommendation ranking |
| 7.2 Response Drafting Assistance (Agent 8-10) | §21 (AI Capabilities), §22 (Seller Portal) | Question answering, requirement clarification, response templates |
| 7.3 Knowledge Base Optimization (Agent 11-16) | §21 (AI Capabilities), §42 (Knowledge Base) | Auto-chunking, deduplication, freshness scoring, KB search |
| 7.4 Market Intelligence & Insights (Agent 17-21) | §21 (AI Capabilities), §26 (Seller Analytics), §23 (Marketplace) | Vendor matching, competitive positioning, market insights |
| 8.1 Billing & Subscriptions | §34 (Billing & Licensing), §29 (Security & Authentication) | Plan selection, invoice history, usage metrics |
| 8.2 Notification Center | §31 (Notification System), §35 (Settings) | Notification log, filter, archive, preferences |
| 8.3 Audit Logs & Activity Feed | §40 (Integration Architecture), §27 (Scoring & Selection) | User actions, phase transitions, score changes, export |
| 8.4 Integration Management | §40 (Integration Architecture), §35 (Settings) | Webhook config, API key management, DLQ |
| 8.5 Feature Flags & Experimentation | PostHog, §29 (Security & Authentication) | Flag toggles, experiment tracking, A/B testing UI |
| 8.6 Custom Branding | §34 (Enterprise), §37 (Theming) | Logo upload, color customization, domain whitelisting |
| 8.7 Data Export & Compliance | §45 (Data Privacy & Export), §43 (Legal & Compliance) | Export to CSV/PDF, GDPR compliance, data deletion requests |
| 9.1-9.7 States & Edge Cases | §3.3 (Success Metrics), §10 (Requirement Structure), §37 (Theming), §38 (Component Library), §39 (Interaction Patterns) | QA planning, error handling, accessibility, responsive design |
| 10. Insertion Mapping | Master Spec §1-45 (all sections) | Cross-reference guide for implementation |
| 11.1-11.6 Acceptance Criteria | Master Spec §1-45 (all sections) | QA testing, launch checklist, performance benchmarks |

---

# 11. Acceptance Criteria

## 11.1 Global Application Acceptance Criteria

| Criterion | Definition | Test Type |
|---|---|---|
| G-01 | All pages load without JavaScript errors. Browser console shows no errors or warnings on user actions. | E2E test + console monitoring |
| G-02 | All API calls return expected status codes (2xx for success, 4xx for client error, 5xx for server error). Error responses include descriptive error messages. | Integration test + mock server |
| G-03 | All real-time subscriptions (WebSocket) maintain connection and receive updates within 2s of server event. Reconnection on disconnect happens within 5s. | Integration test + network simulation |
| G-04 | All user-facing text is spell-checked and grammatically correct. No typos in UI, modals, tooltips, or error messages. | Manual review + automated linter |
| G-05 | All buttons, links, and interactive elements have visible focus indicators (outline or background change). Focus order follows logical visual layout. | Visual test + keyboard navigation audit |
| G-06 | All images have descriptive alt text (except decorative images marked with alt=""). Image file sizes optimized (< 100KB for thumbnails, < 500KB for full-size). | Axe-core scan + image audit |
| G-07 | All modals and overlays have proper focus trapping. Escape key closes modal. Click outside closes modal (unless preventClose prop). | Interaction test + keyboard test |
| G-08 | All tables support keyboard navigation (arrow keys, Enter to expand). Screen readers announce row/column structure correctly. | Screen reader test + keyboard test |
| G-09 | All forms show validation errors on blur or submit. Error messages are linked to inputs via aria-describedby. Required fields marked with asterisk or aria-required. | Axe-core + manual test |
| G-10 | All pages render correctly at viewport widths 320px (mobile), 768px (tablet), 1024px (desktop), 1440px (large desktop). No content overflow or cut-off. | Visual regression test + responsive audit |
| G-11 | Console switching (Buyer ↔ Seller) clears all in-memory state (filters, sort, scroll position) and navigates to target console Dashboard within 500ms. | E2E test |
| G-12 | All plan-gated features show lock icon + tooltip when user plan insufficient. Tooltip includes plan name required. Upgrade link visible to users with billing permission. | Visual test + permission integration test |
| G-13 | All phase-gated features show disabled state (opacity 0.5, no cursor-pointer) with tooltip explaining when available. Tooltip text: "Available in Phase [N]+". | Visual test + phase integration test |
| G-14 | CSS uses logical properties throughout (margin-inline-start, padding-block-end, inset-inline-end, etc.). No hardcoded left/right values. RTL layout (dir="rtl") renders correctly with no visual regressions. | Visual regression test with dir="rtl" |
| G-15 | Real-time subscriptions reconnect automatically after network interruption within 5s. No loss of data during brief outages (< 30s). | Integration test + network fault injection |

## 11.2 Page-Level Acceptance Criteria

### Buyer Dashboard

| Criterion | Definition | Test Type |
|---|---|---|
| BD-01 | Dashboard loads in < 1s. All widgets render without skeletal loading visible. | Performance test |
| BD-02 | Active workspace list shows all workspaces with correct phase, member count, and health score. Clicking workspace navigates to Workspace Overview. | E2E test |
| BD-03 | Recent activity widget shows last 5 events in chronological order (newest first). Clicking event navigates to relevant page. | E2E test |
| BD-04 | Quick-action cards show accurate pending counts (requirements to review, vendor disqualifications, unanswered questions). Clicking card navigates to relevant list. | Integration test |
| BD-05 | Setup Checklist shows progress (N/7 complete). Steps are completable. Clicking "Dismiss" hides widget (can be restored from Settings). | E2E test + localStorage verification |
| BD-06 | Onboarding banner hidden for users who completed onboarding. Shown only for new orgs (created < 7 days ago). | Integration test + time mock |

### Workspace Overview

| Criterion | Definition | Test Type |
|---|---|---|
| WO-01 | Workspace Overview loads in < 1s. Phase stepper shows correct current phase with visual indicator. Previous phases shown as complete (checkmark). Next phase shown with "Advance" button. | Performance test + phase verification |
| WO-02 | Pulse widget displays correct health score. Formula: (completion_score * 0.4 + scoring_progress * 0.3 + sla_health * 0.3). Color coding: green (≥80), yellow (50-79), red (<50). | Calculation test |
| WO-03 | Phase advancement button visible only to Workspace Owner. Clicking triggers gate validation. Validation checks for: active Q&A threads (Phase 8), SLA breaches, incomplete requirements. Warnings are clickable (show blocking items). | Permission test + validation test |
| WO-04 | Quick-action cards (Requirements to Review, Vendors to Approve, Unanswered Questions, SLA Warnings) show correct counts. Clicking card filters target list to relevant items. | Integration test |

### Requirements Matrix

| Criterion | Definition | Test Type |
|---|---|---|
| RM-01 | Requirements Matrix loads in < 1s (100 requirements). Columns visible: ID, Use Case, Title, Status, Assignee, Due Date, Score (Phase 10+). | Performance test |
| RM-02 | All columns support sorting (ascending/descending). Sort order persisted in localStorage for session. | E2E test + localStorage verification |
| RM-03 | Filtering by Use Case, Status, Assignee works. Multiple filters can be applied (AND logic). Filter count badge shown. | E2E test |
| RM-04 | Clicking requirement ID or title opens Requirement Detail in side peek. Side peek closes on Escape or click outside. | E2E test |
| RM-05 | Edit icon launches Requirement Edit modal. Changes saved correctly. Conflict resolution: if requirement edited concurrently, user sees conflict dialog with options to overwrite or discard. | E2E test + concurrency test |
| RM-06 | Bulk actions (select multiple requirements via checkbox): Assign to Team, Change Status, Add Tag, Archive. Selection persisted while scrolling. | E2E test |
| RM-07 | Requirement status workflow enforced: Draft → Proposed → Active → Complete. Invalid transitions rejected with error. | Validation test |
| RM-08 | Amendment badge shown in Phase 6-9 if requirement amended. Badge links to amendment history. | Phase-specific test |

### Requirements Detail & Edit

| Criterion | Definition | Test Type |
|---|---|---|
| RD-01 | Requirement detail loads in < 500ms. All fields displayed: ID, Use Case, Title, Description, Status, Assigned Team, Vendors Responding, Score (Phase 10+), Amendments (Phase 6-9+). | Performance test |
| RD-02 | Use Case field is dropdown (multi-select). Valid Use Cases from workspace loaded. Changes propagate immediately. | E2E test |
| RD-03 | Requirement amendment (Phase 6-9 only) shows original value + amended value in diff view. Amendment reason required (max 500 chars). | Validation test + phase test |
| RD-04 | Vendor response status shown as: Pending, In Progress, Submitted, Responded. Clicking vendor navigates to Q&A thread or response detail. | E2E test |
| RD-05 | Disqualification (buyer only) requires reason (max 500 chars) and sends notification to vendor. Once disqualified, vendor cannot resubmit responses. | Integration test + notification verification |
| RD-06 | Requirements marked as "Custom" (not from template) can be deleted. Deletion requires confirmation. Soft delete (archived). | E2E test |
| RD-07 | Requirements from templates cannot be edited (read-only fields). Workspace Owner can override with "Edit as Custom" toggle. | Permission test |

### Vendor Detail

| Criterion | Definition | Test Type |
|---|---|---|
| VD-01 | Vendor detail loads in < 500ms. Shows vendor name, logo, organization, NDA status, response progress (# submitted / # requirements), overall score (Phase 10+), health color indicator. | Performance test |
| VD-02 | NDA workflow stepper shows: Not Started → Pending Signature → Signed. Current status highlighted. Clicking "View NDA" launches NDA document in modal. | E2E test + document rendering test |
| VD-03 | Response progress bar shows (N submitted / N requirements). Hovering bar shows vendor response status for each requirement (green=submitted, yellow=pending, red=missing). | E2E test + hover state test |
| VD-04 | Disqualification button available (buyer only). Clicking shows confirmation modal: "Are you sure? This vendor will be removed from scoring." Reason field (max 500 chars) required. Disqualification sends notification to vendor. | E2E test + notification test |
| VD-05 | Score card (Phase 10+) shows: Overall Score, Grade (FM / PM / DNM / EX), Scoring health (% of requirements scored). Clicking card navigates to Scoring Matrix filtered to vendor. | E2E test |
| VD-06 | Vendor history panel shows: Date added, NDA signed date, response submission times, disqualification date (if applicable). | Data accuracy test |

### Scenario Modeling

| Criterion | Definition | Test Type |
|---|---|---|
| SM-01 | Scenario Modeling loads in < 2s. Scenarios list shows all created scenarios with name, creation date, last modified. | Performance test |
| SM-02 | "Create Scenario" button launches modal. User inputs scenario name, selects Use Cases to include (multi-select), sets requirement weighting (0-100% per Use Case, must sum to 100%). | Validation test |
| SM-03 | Scenario execution calculates weighted scores: Scenario Score = Σ(Use Case weight × avg requirement score in Use Case). Results displayed as table. | Calculation test |
| SM-04 | Sensitivity analysis shows: if requirement weight changed by ±10%, how does overall score change? Visualization shows best-case / worst-case scenarios. | Calculation test |
| SM-05 | "Export Scenario" downloads as CSV with columns: Vendor, Scenario Score, Grade (FM / PM / DNM / EX per scenario). | E2E test |
| SM-06 | Scenarios are workspace-scoped. Deleting scenario requires confirmation. Soft delete (archived). | E2E test |

### Scoring Matrix

| Criterion | Definition | Test Type |
|---|---|---|
| SC-01 | Scoring Matrix loads in < 1s (100 requirements × 10 vendors = 1000 cells). Vendor names remain sticky (horizontal scroll). Requirement IDs remain sticky (vertical scroll). | Performance test |
| SC-02 | Each cell displays: score (numeric 0-100) or dash (not yet scored), grade badge (FM / PM / DNM / EX with icon), last-modified timestamp (on hover). | E2E test |
| SC-03 | Phase 10: Agent pre-scoring triggered on phase entry. Cells show "scoring..." briefly, then populate with pre-scores. Pre-scores appear as they complete (progressive loading). | Integration test + timing test |
| SC-04 | Phase 11: User can edit scores. Clicking cell opens inline score input (0-100, required). Changes save on blur. Conflict resolution: if cell edited concurrently, show conflict dialog. | E2E test + concurrency test |
| SC-05 | Phase 12+: All cells show lock icon. No editing allowed. Tooltip: "Scores are permanently locked." | Phase test |
| SC-06 | Bulk actions (select cells by column/row): Apply score template, copy scores from another vendor, mark as "needs review". | E2E test |
| SC-07 | Score distribution histogram shown (right sidebar): count of FM / PM / DNM / EX grades per column (vendor), normalized. | Visual test |
| SC-08 | Export: "Download Scoring Matrix" as XLSX. Includes all scores, timestamps, pre-score vs final score columns. | E2E test |

### Q&A Threads

| Criterion | Definition | Test Type |
|---|---|---|
| QA-01 | Q&A list loads in < 1s. Columns: Requirement, Question, Asker (Buyer/Vendor), Status (Unanswered/Answered), Created, Due Date (if deadline set). Sorting, filtering works. | Performance test + E2E test |
| QA-02 | Phase 6-8: Vendors can ask questions. Buyer can limit questions per vendor (configurable 0-100). Question counter shown (N/limit). Error if limit exceeded. | Integration test + configuration test |
| QA-03 | Phase 6-8: Vendors read-only for answering questions (cannot see other vendor's questions). Buyers can see all questions (internal notes also visible). | Permission test |
| QA-04 | Phase 9+: All threads fully read-only. Threads remain visible for historical reference. | Phase test |
| QA-05 | Phase 8: Vendors read-only (cannot ask new questions). Buyers can add internal notes only. | Phase test |
| QA-06 | Clicking question opens full thread in modal. Buyer can answer with rich text editor (Markdown support). Vendor response shown below. | E2E test |
| QA-07 | Q&A notifications: Vendor notified when buyer answers. Buyer notified when vendor asks question. Notification contains question preview (first 100 chars). | Integration test + notification test |
| QA-08 | Questions can be marked as "Answered" by asker. Answered questions sorted below unanswered in list. | E2E test |

### Policy Ingestion

| Criterion | Definition | Test Type |
|---|---|---|
| PI-01 | Available in Phases 1-5 and for Business+ plans. Access denied for other phases / plans (disabled button with tooltip). | Phase test + plan test |
| PI-02 | Step 1 (Upload): User uploads PDF/DOCX/XLSX policy file. File validation: < 50MB, supported format. Progress bar shown. | Validation test |
| PI-03 | Step 2 (Extract): System uses Firecrawl or custom parser to extract requirements. Each extracted requirement shown as editable field. User can add/edit/delete extracted requirements. | Integration test + parsing test |
| PI-04 | Step 3 (Review): User reviews extracted requirements. Duplicate detection: "Similar to existing Req #[N]" warnings shown. User can [View Match], [Keep Both], [Merge]. | Integration test |
| PI-05 | Policy ingestion links extracted requirements to Use Cases (optional). User can assign Use Cases in Step 2 or 3. | E2E test |
| PI-06 | All extracted requirements status set to "Proposed". User can bulk-approve to "Active" or keep as "Draft" for review. | E2E test |
| PI-07 | On mobile: Step 1 (upload) works. Steps 2-3 redirect to desktop with informational message: "Policy review is best experienced on desktop." | Responsive test |

### Amendment Workflow

| Criterion | Definition | Test Type |
|---|---|---|
| AM-01 | Amendment workflow available in Phases 6-9 only. Outside phases, amendment button disabled (tooltip: "Available in Phases 6-9"). | Phase test |
| AM-02 | Workspace Owner clicks "Amend" on requirement. Modal shows: Current value, New value, Amendment reason (required, max 500 chars). | E2E test |
| AM-03 | Amendment confirmation shows: "N vendors will be notified of this change. Their responses will be flagged for reverification." [Cancel] [Confirm Amendment]. | E2E test |
| AM-04 | Amendment saved. Vendors notified: "A requirement has been amended: [requirement title]." Notification includes diff (original → new). | Integration test + notification test |
| AM-05 | Vendor sees amendment in bid workspace. Diff view shown. "Submit updated response" required. Previous response archived. | E2E test |
| AM-06 | Amendment history (full audit trail): Author, timestamp, old value, new value, reason. Visible to both buyer and vendors. | Audit test |
| AM-07 | Bulk amendments: Select multiple requirements, amend all with same reason. All vendors notified once. | E2E test |

### Knowledge Base Management (Buyer)

| Criterion | Definition | Test Type |
|---|---|---|
| KB-01 | KB Management loads in < 1s. Shows KB entries (manual) + crawled pages (Firecrawl). Columns: Title, Source, Created Date, Last Updated, Health Score, Usage Count. | Performance test |
| KB-02 | Manual KB entry creation: User inputs title, content (Markdown), optional URL, tags. Save creates versioned entry (v1). | E2E test |
| KB-03 | KB entry health score calculated: Health = 100 - (days_since_updated × decay_rate). At 30 days, Health = 80. At 60 days, Health = 50. Red flag at Health < 40. | Calculation test |
| KB-04 | Firecrawl configuration: User inputs URL(s), crawl frequency (on-demand / weekly / monthly). Crawl runs asynchronously. Progress shown in UI. | Integration test |
| KB-05 | Crawled pages are deduplicated (by content hash). Similar pages merged with note. Pages chunked (max 2000 tokens per chunk). | Integration test |
| KB-06 | KB entries used in Agent responses. Usage count incremented each time Agent cites entry. Entry shown in response as "[Source: KB-123]". | Integration test + agent test |
| KB-07 | KB entry updates: User can edit existing entry. New version created (v2). Version history accessible. Previous versions not deleted. | E2E test |
| KB-08 | KB entry deletion (soft): Entry archived. Hidden from Agent search. Admin can permanently delete after 30 days. | E2E test |

### Team Management & Triage Queue (Buyer)

| Criterion | Definition | Test Type |
|---|---|---|
| TM-01 | Team list loads in < 500ms. Shows all org teams with: name, member count, SLA health (green/yellow/red). Clicking team shows detail. | Performance test |
| TM-02 | Triage Queue loads in < 500ms. Shows all unassigned requirements (Team Lead or unassigned) with: ID, title, status, SLA timer, priority badge. | Performance test |
| TM-03 | Clicking requirement in triage opens detail view. User can: Assign to team member, change priority, set SLA extension (Team Owner only). | E2E test |
| TM-04 | SLA configuration per team: Team Owner can set SLA timer duration (hours). Changes apply to NEW assignments only (not retroactive). | E2E test + integration test |
| TM-05 | SLA timer countdown: displayed in real-time. Color: green (> 50% remaining), yellow (20-50%), red (< 20%, pulsing if overdue). | Visual test |
| TM-06 | SLA extension: Team Owner can extend timer by N hours. Extension logged in audit trail. Vendor and team notified. | Integration test + notification test |
| TM-07 | Team deletion: System validates no active requirements assigned to team. If found, error: "Reassign N requirements before deleting." Links to bulk reassign UI. | Validation test |
| TM-08 | Agent Instructions (Team Owner only): Editor allows Markdown input. Save creates new version. Version history accessible. Instructions used by Agent in scoring/response drafting for team's assignments. | E2E test + agent test |

### Document Library

| Criterion | Definition | Test Type |
|---|---|---|
| DL-01 | Document Library loads in < 500ms. Shows uploaded documents with: name, upload date, file type, version count. | Performance test |
| DL-02 | Document upload: User selects file (PDF, DOCX, XLSX, PNG, JPG, < 50MB). File scanned for virus. Upload progress shown. | Validation test + security test |
| DL-03 | Document versioning: Uploading new file with same name creates new version (v2, v3, etc.). Version history accessible. Previous versions downloadable. | E2E test |
| DL-04 | Document usage: When new version uploaded while document used in active bid, notification banner shown: "New version available. Update bids?" [Update All] [Review]. | Integration test + notification test |
| DL-05 | Document deletion: Soft delete (archived). Hard delete by admin after 30 days. | E2E test |

### Template Library

| Criterion | Definition | Test Type |
|---|---|---|
| TL-01 | Template Library loads in < 500ms. Shows curated templates (Sourcera-provided) and custom templates (org-created). Metadata shown: author, created date, use case count, requirement count. | Performance test |
| TL-02 | "Apply to Workspace": User selects template, clicks [Apply]. New workspace created with Use Cases and Requirements from template. Workspace name = template name (editable). | E2E test |
| TL-03 | "Create Template from Workspace": Workspace Owner can save current workspace as template. Modal: template name, description, tags. Workspace snapshots Use Cases + Requirements (NOT scores, responses, or amendments). | E2E test |
| TL-04 | Custom templates organization-scoped. All organization members can apply. Only Workspace Owner (template creator) can edit or delete. | Permission test |

### Marketplace Discovery (Buyer)

| Criterion | Definition | Test Type |
|---|---|---|
| MD-01 | Marketplace search loads in < 1s. Search results show: listing title, seller name, logo, capabilities (tags), price (if listed), rating. | Performance test |
| MD-02 | Search filters: Capability, Price Range, Rating, Seller Verification Tier. Multiple filters apply (AND logic). Filter count badge shown. | E2E test |
| MD-03 | Clicking listing opens detail view. Shows: full description, seller profile link, capabilities, pricing, FAQ, buyer reviews (if available), [Express Interest] button. | E2E test |
| MD-04 | [Express Interest] (EOI): Buyer submits interest. Optional message (max 500 chars). EOI stored. Seller notified. Seller can accept (adds to workspace pipeline) or decline. | Integration test + notification test |
| MD-05 | Accepted EOI: Workspace created. Seller auto-added as vendor. Requirements pre-populated (optional template). NDA workflow initiated. | E2E test |

### Selection Report

| Criterion | Definition | Test Type |
|---|---|---|
| SR-01 | Selection Report generated automatically when Phase 12 begins. Report displays: Vendor Ranking (1st/2nd/3rd choice), Final Scores, Grade, Disqualification status (if applicable). | Integration test + timing test |
| SR-02 | Report includes Executive Summary (1 page): top 3 vendors, selection rationale, key risks. Detailed sections: scoring breakdowns, amendments log, Q&A summary. | Report generation test |
| SR-03 | Report exportable as PDF (formatted for print). Export triggered by [Export as PDF] button. | E2E test |
| SR-04 | Report read-only in Phase 13. Archive banner shown. | Phase test |

### Defense View (§4.2.13 / Master Spec §13.11)

| Criterion | Definition | Test Type |
|---|---|---|
| DV-01 | First open of `/buyer/workspaces/{id}/defense-view` for a Workspace with Phase ≥ 12 and a finalized Selection Report renders the four sections (Recommendation, Why with 3 reasons, Risks with 1–2 entries, Evidence) within 8 s at p95 from click to first paint. | Performance test (p95 across ≥ 50 sample evaluations) |
| DV-02 | Cache-hit render (Selection Record hash unchanged) returns the cached `DefenseView` row in less than 500 ms at p95 with no AIOperation invocation. | Performance test + ledger inspection (no new AIOperation row) |
| DV-03 | Selection Record hash mismatch on read forces regeneration; the "regenerated due to source change" chip renders in the header; PostHog `defense_view.regenerated_due_to_source_change` event fires. | E2E test (inject a superseding pre-closure Selection Report while the Workspace remains in `phase_12_selection`; verify chip + event) |
| DV-04 | Buyer Free renders Recommendation + first Why reason in full; Risks, remaining Why entries, and Evidence render under a watermarked overlay with a "Upgrade to Solo to view the full Defense View" CTA. PDF button is disabled with the upgrade tooltip. | E2E test (Free-tier session) |
| DV-05 | Buyer Solo+ renders all four sections unwatermarked; PDF button is enabled and produces a single-page PDF in less than 3 s at p95 with the Selection Record SHA-256 in the footer. | E2E test + PDF inspection |
| DV-06 | Buyer Enterprise PDF footer additionally embeds the Selection Record audit-receipt verbiage per Master Spec §32.7. | E2E test (Enterprise-tier session) + PDF inspection |
| DV-07 | Cmd/Ctrl+P invokes Print/Export from any focused element on the surface; on Free, surfaces the upgrade modal in lieu of generating a PDF. | Keyboard interaction test |
| DV-08 | Esc closes the Defense View and returns to the prior surface (typically Selection Report); on direct-URL entry with no prior surface, returns to Workspace Overview. | Keyboard interaction test |
| DV-09 | Cmd/Ctrl+D opens the Defense View from any Workspace surface where Phase ≥ 12 and the `defense_view` plan-gate is satisfied. | Keyboard interaction test |
| DV-10 | Mobile (viewport < 768px) renders all four sections vertically stacked, full-width, read-only. The Print button is replaced by the OS share sheet button; the Regenerate affordance is not exposed. | E2E test on mobile viewport |
| DV-11 | Inline evidence chips are keyboard-focusable; Enter opens a Side Peek pinned to the cited Score / Requirement / Response per §3.8; the Defense View itself does not navigate away. | Keyboard + screen-reader test |
| DV-12 | Generation failure (Sonnet error or > 30 s timeout) renders the Failure / Reason / Recovery panel per §3.7.5 with "Try again" and "Open the Selection Report" actions; the failed AIOperation is reversed per Master Spec §34.11; the "Try again" affordance does NOT count against the 5-minute regeneration throttle. | E2E test (inject AIOperation failure) |
| DV-13 | Anthropic outage path renders the same panel with "Sourcera AI is temporarily unavailable" reason copy and "[Open the Selection Report]" as the primary recovery action. | E2E test (mocked third-party outage) |
| DV-14 | Confidence score below 0.700 renders an inline low-confidence note above Recommendation; the four sections still render and remain consumable; the operator MAY regenerate. | E2E test (mocked low-confidence Sonnet response) |
| DV-15 | Workspace closure cascade (`Workspace.status → closed`) soft-deletes the `DefenseView` row; subsequent reads return HTTP 404 `defense_view_archived_with_workspace`; the surface renders the archived empty state. | Integration test |
| DV-16 | Cross-console seller-session reads return HTTP 404 with no row leakage. Cross-Org reads return HTTP 404 with no existence leakage. Seller-console webhook subscriptions for `defense_view.generated` / `defense_view.regenerated` return HTTP 404 at registration. | Security test |
| DV-17 | All states (loading_initial, generating_overlay, ready, regenerated, watermarked_preview, low_confidence, error_*) meet WCAG 2.1 AA contrast and keyboard-navigation requirements; PDF export passes the §11.6 PDF-A11y check. | Accessibility audit |
| DV-18 | `prefers-reduced-motion` swaps the 200 ms regeneration cross-fade for an instant content swap. | Accessibility test |
| DV-19 | Regeneration throttle: 2nd regeneration within 5 minutes for the same Workspace returns HTTP 409 `regeneration_throttle`; the surface renders an inline "You can regenerate again in {N} seconds" message. Failure-recovery retries are exempt. | Integration test |
| DV-20 | Webhook delivery: each first generation emits exactly one `defense_view.generated` webhook to subscribed Buyer Org endpoints; each regeneration emits exactly one `defense_view.regenerated`. Both follow Master Spec §31 transport (HMAC-SHA256, `event_id` idempotency, Appendix F retry curve, payload ≤ 256 KB). | Webhook contract test |

---

### Seller Bid Workspace Detail

| Criterion | Definition | Test Type |
|---|---|---|
| BW-01 | Bid workspace loads in < 500ms. Header shows: Buyer org name, workspace title, current phase, deadline countdown (if applicable), response progress bar (N submitted / N requirements). | Performance test |
| BW-02 | Task list shows all Bid Tasks: title, status (Not Started / In Progress / Completed), assigned team member, due date, SLA timer. Clicking task opens detail. | E2E test |
| BW-03 | Q&A section (Phase 6-8, Business+ plan): Shows question counter (N questions, vendor limit if applicable). Clicking "View Q&A" opens full thread list. | Phase test + plan test |
| BW-04 | Amendment notifications: If requirement amended, banner shown with [View Amendment] link. Amendment diff displayed. Seller can [Resubmit Response]. | Integration test + notification test |
| BW-05 | Response submission: Seller can re-submit response to amended requirement. Previous response archived (version history kept). | E2E test |
| BW-06 | NDA workflow: If NDA not yet signed, banner shown. [Sign NDA] button visible. | E2E test |

### NDA Review (Seller)

| Criterion | Definition | Test Type |
|---|---|---|
| NDA-01 | NDA document renders in PDF viewer. Document page count shown. User can navigate pages. | Document rendering test |
| NDA-02 | Sign button: Seller clicks [Sign NDA]. Confirmation modal: "By signing, you agree to the terms above." [Cancel] [Sign]. Signature date recorded. | E2E test |
| NDA-03 | Decline button: Seller clicks [Decline NDA]. Consequence warning shown: "Declining the NDA will remove you from this evaluation. Are you sure?" [Cancel] [Decline]. Seller removed from workspace. Buyer notified. | Integration test + notification test |
| NDA-04 | NDA status updates in real-time for both parties. Buyer sees vendor NDA status: Not Started → Pending Signature → Signed. Seller sees workflow progress. | Real-time test |

### Seller Dashboard

| Criterion | Definition | Test Type |
|---|---|---|
| SD-01 | Seller Dashboard loads in < 1s. Shows: Active Bids (with phase, deadline, response progress), Awaiting Action (Q&A, amendments), Marketplace Profile Status. | Performance test |
| SD-02 | Active Bids list shows: buyer org name, workspace title, phase, deadline countdown, [View Workspace] button. Sorting by deadline available. | E2E test |
| SD-03 | Profile status widget shows: Profile completion %, verification tier (Unverified / Verified / Preferred), capabilities declared, marketplace visibility (# searches). | Data accuracy test |

### Seller Settings & Profile

| Criterion | Definition | Test Type |
|---|---|---|
| SS-01 | Seller profile edit: logo upload, company description (Markdown), website URL, contact info. Changes save immediately. | E2E test |
| SS-02 | Capability declarations: Seller selects capabilities from curated list. Each capability requires evidence (document upload or description). | E2E test |
| SS-03 | Capability verification: Seller can request verification. Admin reviews. Tier advances: Unverified → Verified (3+ capabilities) → Preferred (verified + high response quality). | Integration test |
| SS-04 | Marketplace listing creation: Title, description, capabilities (multi-select), pricing (optional), FAQ (optional). [Publish] makes visible in marketplace. [Draft] saves without publishing. | E2E test |
| SS-05 | Marketplace listing editing: Seller can edit published listing. Changes immediately visible. | E2E test |

### Settings (Global)

| Criterion | Definition | Test Type |
|---|---|---|
| ST-01 | Notification preferences: Per-event toggles (New Question, Phase Change, Amendment, Disqualification, etc.). User email digest frequency (daily / weekly / never). Quiet hours (DND) configurable. | E2E test |
| ST-02 | MFA enrollment: User selects TOTP or WebAuthn. TOTP: display QR code, user scans with authenticator app, verify 6-digit code. WebAuthn: follow browser prompts. Success confirmation shown. | Integration test + browser API test |
| ST-03 | API token creation: User clicks [Generate New Token]. Modal shows token value (single display, copy-to-clipboard). After closing modal, token hidden (never shown again). User can regenerate (old token invalidated). | E2E test + security test |
| ST-04 | Organization member invite: User inputs email, selects role (Admin / Member / Guest), clicks [Send Invite]. Invitation email sent. Pending status shown in members list. Invitee clicks email link → [Sign Up] → account created → role auto-assigned. | Integration test + email test |
| ST-05 | Workspace scoring configuration: PM scale (options: 1-5, 1-10, 1-100). EJ rubric (custom rubric text). Changes apply to NEW scoring entries only (not retroactive). | E2E test + configuration test |

### Onboarding

| Criterion | Definition | Test Type |
|---|---|---|
| OB-01 | Buyer onboarding: 7 steps (organization setup, profile, requirements template, team setup, vendor list, evaluation criteria, review & launch). All steps completable. Steps skippable (optional). Progress stepper shows current step + completed steps. Skip button visible in modal. | E2E test |
| OB-02 | Seller onboarding: Triggered by invitation email. Steps: sign up, NDA signature, profile completion (logo + description), KB welcome (create 1st entry or skip). All steps tracked. | E2E test |
| OB-03 | Setup Checklist widget: Shows N/7 steps complete. Steps checkboxes clickable. [Dismiss] hides widget. Widget re-accessible from Settings > Setup Checklist. Dismissal persisted in localStorage. | E2E test |

## 11.3 Component-Level Acceptance Criteria

### Button Component

| Criterion | Definition | Test Type |
|---|---|---|
| BTN-01 | Button variants render: primary (filled), secondary (outline), danger (red), ghost (transparent). | Visual test |
| BTN-02 | Button sizes: sm (28px height), md (36px height, default), lg (44px height). | Visual test |
| BTN-03 | Button states: default, hover (0.95 scale), active (0.9 scale), disabled (opacity 0.5, no pointer-events). | Interaction test |
| BTN-04 | Button with icon + text: icon left of text, 8px gap. Icon size: 16px (sm), 20px (md), 24px (lg). | Visual test |
| BTN-05 | Button with loading state: spinner animated (1s rotation). Text replaced with [Generating...] or similar. Disabled state applied. | Interaction test |
| BTN-06 | Button keyboard: Spacebar/Enter triggers click. Focus visible (outline 2px). Tab order correct. | Keyboard test |

### Input Components

| Criterion | Definition | Test Type |
|---|---|---|
| INP-01 | Text input: placeholder text visible. Focus shows blue outline (2px). Typing works. Max length enforced (browser default). | E2E test |
| INP-02 | Select dropdown: Options list scrollable if > 10 options. Multi-select supported (checkboxes). Selected values shown as tags. [Clear All] button shown for multi-select. | E2E test |
| INP-03 | Checkbox: Click toggles checked state. Indeterminate state shown (dash icon) for mixed selection. Label associated via htmlFor. | E2E test |
| INP-04 | Radio group: Only one option selectable at a time. Keyboard navigation (arrow keys). Focus management correct. | E2E test |
| INP-05 | Textarea: Multi-line text input. Resize handle visible (bottom-right). Min/max height enforced. Line counting optional. | E2E test |
| INP-06 | Date picker: Calendar popup on input focus. User selects date. Input value updated (ISO format). Keyboard navigation in calendar. | E2E test |
| INP-07 | Time picker: Dropdown showing hours/minutes. User selects time. Input value updated (24-hour format). | E2E test |

### DataTable Component

| Criterion | Definition | Test Type |
|---|---|---|
| TBL-01 | DataTable renders 100 rows in < 1s without pagination. Horizontal scroll on mobile. Sticky header (top 44px). | Performance test |
| TBL-02 | Column sorting: Click column header toggles ascending/descending. Sort indicator (arrow up/down) shown. Multi-column sort not supported (clear previous sort). | E2E test |
| TBL-03 | Row selection: Checkbox in first column. Header checkbox selects/deselects all. Selection persisted while scrolling. Bulk action toolbar shown above table. | E2E test |
| TBL-04 | Pagination: If > 50 rows, pagination controls shown (previous/next buttons, page indicator "Page N of M"). Jump to page input. | E2E test |
| TBL-05 | Rows expandable: Click row number or expand icon. Expanded details shown below row (full-width). Click again collapses. | E2E test |
| TBL-06 | Cell types: text (default), number (right-aligned), status (badge with color), date (formatted MM/DD/YYYY), link (blue, underline on hover). | Visual test |
| TBL-07 | Responsive table: On tablet/mobile, prioritized columns shown. Low-priority columns hidden. [Show more columns] toggle available. | Responsive test |

### Modal Component

| Criterion | Definition | Test Type |
|---|---|---|
| MDL-01 | Modal renders centered in viewport. Backdrop (semi-transparent) shown. Content width: sm (400px), md (600px, default), lg (900px). | Visual test |
| MDL-02 | Focus trapped inside modal. First focusable element auto-focused. Tab within modal cycles through focusable elements. | Keyboard test |
| MDL-03 | Escape key closes modal (unless preventClose prop set). Click backdrop closes modal (unless preventClose). | Interaction test |
| MDL-04 | Cmd+Enter triggers primary action (if available). | Keyboard test |
| MDL-05 | Modal header includes title + close button (X icon). Close button click closes modal. | E2E test |
| MDL-06 | Modal footer: primary action button (right), secondary/cancel button (left). | Visual test |
| MDL-07 | Mobile: Modal renders full-screen. Close button in header. Back gesture (swipe-right) closes modal. | Responsive test |

### Toast Notification Component

| Criterion | Definition | Test Type |
|---|---|---|
| TST-01 | Toast types: success (green), error (red), warning (yellow), info (blue). | Visual test |
| TST-02 | Toast displays icon, message (max 200 chars), action button (optional). | Visual test |
| TST-03 | Toast auto-dismisses after 6s (configurable). Close button (X) available. Click message or action dismisses. | Interaction test |
| TST-04 | Multiple toasts stack vertically (4px gap). Max 3 toasts visible. Older toasts pushed down (no overlap). | Visual test |
| TST-05 | Toast accessibility: Role="status", live region. Screen reader announces message. | Accessibility test |
| TST-06 | Toast z-index: highest in app (above modals). | Visual test |

### Form Field Component

| Criterion | Definition | Test Type |
|---|---|---|
| FRM-01 | Form field: label + input + error message (optional). Label associated to input via htmlFor/id. | E2E test |
| FRM-02 | Required indicator: asterisk (*) shown after label. ARIA required attribute set on input. | E2E test |
| FRM-03 | Validation: on blur (text fields), on change (select), or on submit. Error message displayed below field (red text). ARIA live region announces error. | E2E test |
| FRM-04 | Disabled state: label opacity 0.5, input pointer-events: none. Cursor shows "not-allowed". | Visual test |
| FRM-05 | Error state: input border red (2px). Error message color red. Icon (!) shown in input (right side). | Visual test |

### Side Peek Component

| Criterion | Definition | Test Type |
|---|---|---|
| SPK-01 | Side Peek slides in from the right on desktop at 480px default (360–640px on `desktop`, 360–720px on `desktop_xl`), renders at 72% viewport width on `tablet`, and takes over the full screen on `mobile_xs` / `mobile_sm`. Backdrop is absent on desktop and present on tablet/mobile. | Visual test + responsive test |
| SPK-02 | Header: title + close button (X). Content scrollable. Footer: primary action (optional). | E2E test |
| SPK-03 | Escape and the close button close on every tier. Backdrop tap closes on tablet/mobile; drag-down from the header handle and Android hardware back are the gesture/system dismissal paths. | Interaction test + keyboard test |
| SPK-04 | Focus is trapped inside the Peek and restored to the opening row on close. Desktop outside clicks do not close the Peek. | Keyboard test |

### Command Palette Component

| Criterion | Definition | Test Type |
|---|---|---|
| CMD-01 | Command Palette opens on Cmd+K (macOS) or Ctrl+K (Windows/Linux). Popup centered in viewport. Search input auto-focused. | Keyboard test |
| CMD-02 | Search filters commands by name. Results show command name, description, keyboard shortcut. | E2E test |
| CMD-03 | Keyboard navigation: arrow keys navigate results. Enter selects. Escape closes. | Keyboard test |
| CMD-04 | Command categories: Navigation, Actions, Settings. Category headers shown. | Visual test |
| CMD-05 | Recent commands shown on open (before search). Most-used commands ranked higher. | E2E test |
| CMD-06 | On mobile: Cmd Palette replaced by search bar (magnifying glass icon in top nav). Limited to navigation commands. | Responsive test |

### TriageQueue Component

| Criterion | Definition | Test Type |
|---|---|---|
| TRG-01 | Triage Queue: list view (default) + board view (Kanban). List view shows items in rows (sortable by SLA timer, priority). Board view shows columns: To Do, In Progress, Done. | E2E test |
| TRG-02 | List view: J/K keyboard navigation (next/previous item). Enter opens detail. Drag-and-drop not available. | Keyboard test |
| TRG-03 | Board view: Drag-and-drop items between columns. Drag state visual feedback (scale 1.05, shadow). Drop updates status. | Interaction test |
| TRG-04 | SLA timer: Real-time countdown. Color: green (> 50%), yellow (20-50%), red (< 20%). Breached timer shows "Overdue by [duration]" red pulsing. | Visual test + real-time test |
| TRG-05 | Bulk actions: Select multiple items (checkboxes). Toolbar shows [Assign], [Change Priority], [Mark Complete]. Bulk assign opens dropdown (team member select). | E2E test |
| TRG-06 | Mobile: Swipe-left reveals actions (assign, priority, resolve). Pull-to-refresh enabled. | Responsive test |

### SLATimer Component

| Criterion | Definition | Test Type |
|---|---|---|
| SLA-01 | Timer displays: [HH]h [MM]m (e.g., "2h 30m" or "23m"). Updates every 10 seconds. | Real-time test |
| SLA-02 | Color: green (> 50% remaining), yellow (20-50%), red (< 20%). Color transitions smooth. | Visual test |
| SLA-03 | Breached: Timer shows "Overdue by [duration]" (red text). Pulsing red indicator (1s pulse). | Visual test |
| SLA-04 | Extension UI: Seller/Team Lead can extend. Modal shows: original duration, extension hours (input), reason. [Confirm] saves extension. Original + added time shown (e.g., "2h 30m → 3h 30m"). | E2E test |
| SLA-05 | Extension notification: Both parties notified. Timestamp logged in audit trail. | Integration test |

### PhaseAdvancer Component

| Criterion | Definition | Test Type |
|---|---|---|
| PHA-01 | Advance button visible only to Workspace Owner. Disabled state with tooltip if gate validation would fail. | Permission test |
| PHA-02 | Gate validation runs on click. If gates fail, modal shows blockers: "N items not ready. [View Items] [Advance Anyway]". Clicking [View Items] filters relevant list. | E2E test |
| PHA-03 | Successful advance: Modal confirmation, phase transitions, all workspace members notified. Real-time UI update (phase stepper updates, phase-gated features enabled/disabled). | Integration test + real-time test |
| PHA-04 | Phase indicators: Current phase highlighted (blue). Previous phases show checkmark. Next phase shows [Advance] button or lock icon. | Visual test |

### PipelineSurface Component (Phase 14.6)

| Criterion | Definition | Test Type |
|---|---|---|
| PS-01 | PipelineSurface renders in `solo-buyer` state when `Workspace.evaluation_owner_mode=solo`. Four-step bar shows Setup / Define / Score / Decide labels. 13-phase chip ribbon MUST NOT render. | E2E test + visual regression |
| PS-02 | PipelineSurface renders in `team` state when `Workspace.evaluation_owner_mode=team`. 13-phase chip ribbon shows all twelve chips (Phase 4 + 5 share one). Four-step bar MUST NOT render. | E2E test + visual regression |
| PS-03 | PipelineSurface renders in `solo-seller` state on every Bid Workspace regardless of plan tier (sF, sSt, sGr, sSc, sEnt). Four-step bar shows Receive / Draft / Review / Submit labels. 13-phase chip ribbon MUST NOT render under any code path on the Seller console. | E2E test across all five seller tiers |
| PS-04 | Active step indicator matches `currentPhase` per the Master Spec §3.14.1 / §3.14.2 mappings (Setup = 1–3 / Define = 4–6 / Score = 7–10 / Decide = 11–13 for Buyer; Receive = 1–2 / Draft = 3–7 / Review = 8–10 / Submit = 11–13 for Seller). Unit test asserts the mapping const matches the Master Spec tables verbatim. | Unit test + integration test |
| PS-05 | Click on a step invokes `onStepClick` with the engine phase corresponding to the step's first sub-phase per the click-target column in §3.14.1 / §3.14.2. Click navigation is read-only — engine `pipeline_stage_id` is unchanged after step click. | Integration test |
| PS-06 | Hover or keyboard-focus on a step shows a tooltip listing the engine phases aggregated under that step. Tooltip is suppressed on mobile (`<768px`); bottom-sheet detail surfaces equivalent content on tap. | Interaction test + screen reader test |
| PS-07 | Step transition motion (active indicator slide across a step boundary) uses `motion.duration.medium` and `motion.ease.standard`. `prefers-reduced-motion: reduce` replaces the slide with an instant snap and disables the intra-step progress fill tween. | Visual regression + reduced-motion test |
| PS-08 | Advance attempt with `softGatesEnabled=true` AND unmet gates renders a `ToastNotification` with "Finish them first" + "Skip for now" actions per Master Spec §2.8.3. Choosing "Skip for now" calls the Phase Advancement API with `soft_gates_enabled=true` and emits the `phase_advanced_with_unmet_gates` audit event. | Integration test + audit-log assertion |
| PS-09 | Advance attempt with `softGatesEnabled=false` AND unmet gates renders the standard PhaseAdvancer modal (hard gate) per §10.16. The four-step bar MUST never surface a soft-gate toast in `team` state. | Integration test |
| PS-10 | When `mode=solo-buyer` AND active step is Decide AND `currentPhase ≥ 12`, the step body renders the Defense View entry point per §4.2.13 / Master Spec §13.11. Before Phase 12 the step body shows the muted "Selection becomes available after scoring closes" affordance. | Integration test + visual regression |
| PS-11 | When `mode=solo-seller` AND active step is Submit AND `currentPhase = 13` AND `bid.status ∈ {won, lost}`, the step body renders the "Add this bid's responses to your KB?" CTA per Master Spec §22.3 channel #2 / §22.19.1. | Integration test + visual regression |
| PS-12 | All ARIA semantics correct: `role="group"`, `aria-label`, `aria-current="step"` on active step, `aria-describedby` linked tooltip. Keyboard navigation works end-to-end (Tab/Enter/Space/Esc). Screen reader announces step names + state correctly. WCAG 2.1 AA passed for all step states on light and dark themes. | Axe-core + manual screen reader + visual contrast test |

### GradeDisplay Component

| Criterion | Definition | Test Type |
|---|---|---|
| GRD-01 | Grade badges: A (checkmark, green), B (half-circle, blue), C (X, yellow), D (dash, red). | Visual test |
| GRD-02 | Color + icon both displayed (no color alone). Distinguishable in color-blind modes (protanopia, deuteranopia, tritanopia). | Visual test |
| GRD-03 | Tooltip on hover: "Grade A: Excellent match (90-100 score)". | Visual test |

## 11.4 Workflow-Level Acceptance Criteria

### End-to-End: Buyer RFP Lifecycle

| Criterion | Definition | Test Type |
|---|---|---|
| WF-01 | Buyer creates workspace (Phases 1-5): Completes setup checklist, adds requirements, configures evaluation criteria (PM scale, EJ rubric), invites team members, adds vendors, advances to Phase 6. | E2E test |
| WF-02 | Vendor added (Phase 5): Buyer adds vendor by email or searches marketplace. Vendor notified by email. Vendor accepts (creates seller org/account) or declines. | Integration test + email test |
| WF-03 | Q&A Phase (Phase 6-8): Vendors ask questions (limit enforced). Buyers answer. Threads visible per visibility setting (all / internal only). | E2E test |
| WF-04 | Vendor Response Submission (Phase 6-8): Vendor submits responses to requirements. Status tracked. Buyer can see response preview in workspace. | E2E test |
| WF-05 | Scoring Phase (Phase 10-11): Agent pre-scores (Phase 10). Buyers review/edit scores (Phase 11). Scores locked (Phase 12). | Integration test + agent test |
| WF-06 | Selection (Phase 12): Auto-generated Selection Report. Workspace becomes read-only. Seller KB offer shown. | E2E test |
| WF-07 | Archive (Phase 13): Workspace immutable. Historical reference only. Archive icon shown. Knowledge Base data retained (if seller opt-in). | Phase test |

### End-to-End: Vendor Response Workflow

| WF-08 | Vendor receives bid invite (email). Clicks link → signs NDA → completes profile (if new) → views requirements → submits responses. | E2E test + email test |
| WF-09 | Vendor response includes: requirement clarifications (Q&A threads), AI-assisted response drafting (Agent suggestions), required document uploads. | Integration test + agent test |
| WF-10 | Amendment scenario (Phase 6-9): Buyer amends requirement. Vendor notified with diff. Vendor submits updated response. Previous response archived. | E2E test + notification test |

### End-to-End: Team Triage & SLA

| WF-26 | Requirement created (Phase 1-5) → auto-mapped to team based on Use Case (configurable). → Appears in triage queue. → Team Lead assigns to team member. → Team member resolves (status: Complete). | E2E test |
| WF-27 | SLA timer starts on assignment. Escalation notification fires at 20% remaining. Team Owner extends SLA (adds hours). Extension logged + both parties notified. | Integration test + notification test |
| WF-28 | Team deletion scenario: All requirements assigned to team → attempt team deletion → system blocks with list of blocking requirements → user reassigns via bulk action → team deletion succeeds. | Validation test |

### End-to-End: Amendment Protocol

| WF-29 | Workspace Owner amends requirement (Phase 6-9). All vendors notified with amendment reason + diff. Vendor responses flagged for reverification. | Integration test + notification test |
| WF-30 | Vendor sees amendment in bid workspace (banner + diff view). [Submit Updated Response] button visible. Previous response archived (version kept). Resubmission marks as "amended response". | E2E test |
| WF-31 | Amendment logged in version history (requirement's edit log). Shows: author, timestamp, old value, new value, amendment reason. Accessible to both buyer + vendor. | Audit test |

### End-to-End: Knowledge Base Lifecycle

| WF-32 | KB entry created manually → health score starts at 100 (full health). Decays daily: Health = 100 - (days_since_updated × 1.67%, so 60 days = 0%). At 30 days, Health = ~50. Red flag threshold: < 40. | Calculation test |
| WF-33 | Firecrawl configured (URL(s)) → crawl runs (asynchronous) → pages chunked (max 2000 tokens) + deduplicated (by content hash). Similar pages merged. Queued for manual review. Approved entries active. | Integration test |
| WF-34 | Document Library: document uploaded (v1) → used in active bids → new version uploaded (v2) → active bids notified of new version available → workspace maintainer [Update All] or [Review Changes]. | Integration test + notification test |

### End-to-End: Marketplace Discovery & EOI

| WF-35 | Seller creates marketplace profile → declares capabilities → verification requested → buyer discovers via marketplace search → expresses interest (EOI) → seller reviews → accepts → workspace created + seller auto-added. | E2E test |
| WF-36 | Seller profile visibility: only verified sellers visible in marketplace (unverified profiles hidden). Seller advances tier: Unverified (self-declared) → Verified (3+ capabilities approved) → Preferred (verified + high response quality). Profile visible at each tier. | Integration test |

### End-to-End: Guest Collaboration

| WF-37 | Workspace Owner invites guest (external consultant). Guest receives email link → signs up → gains limited permissions (view-only or edit-limited). | Integration test + email test |
| WF-38 | Guest can view workspace + participate in Q&A (Phase 6-8). Cannot amend requirements, disqualify vendors, advance phases. Cannot access Settings, team management, billing. | Permission test |
| WF-39 | Guest invitation expires after 30 days (configurable). Expired guest loses access. Workspace Owner can reactivate. | E2E test |

### End-to-End: Agent-Assisted Scoring

| WF-40 | Buyer enters Phase 10. Agent pre-scores all requirement-vendor pairs asynchronously (batch scoring). Pre-scores appear in Scoring Matrix as they complete. | Integration test + agent test |
| WF-41 | Buyer reviews pre-scores (Phase 10-11). Agent explains score reasoning (tooltip or expandable section). Buyer can edit scores. Explanation updates with manual score. | Agent test + E2E test |
| WF-42 | Agent scoring uses: requirement description (semantic match), vendor response (relevance to requirement), custom rubric (if provided), historical data (similar past evaluations). | Agent test |

## 11.5 Performance Acceptance Criteria

| Criterion | Metric | Threshold | Test Type |
|---|---|---|---|
| PF-01 | Page load time (first paint) | < 1s | Lighthouse |
| PF-02 | Time to interactive (TTI) | < 2s | Lighthouse |
| PF-03 | Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| PF-04 | JavaScript bundle size | < 500KB (gzipped) | Bundle analyzer |
| PF-05 | Image optimization | WebP + AVIF, srcset for responsive | ImageOptim + Lighthouse |
| PF-06 | CSS-in-JS bundle | < 100KB (gzipped) | Bundle analyzer |
| PF-07 | API response time (average) | < 200ms (p95: < 1s) | APM tool |
| PF-08 | Workspace load (100 requirements) | < 1s | E2E performance test |
| PF-09 | Scoring Matrix render (100×10 grid) | < 1s | E2E performance test |
| PF-10 | Real-time subscription latency | < 2s (p95: < 5s) | Integration test |
| PF-11 | Triage queue load (100 items) | < 500ms | E2E performance test |
| PF-12 | Team list load (20 teams) | < 300ms | E2E performance test |
| PF-13 | KB crawl page indexing (single page) | < 10s | Integration test |
| PF-14 | Marketplace search (10,000 listings) | < 1s | E2E performance test |
| PF-15 | NDA document render (10-page PDF) | < 2s | E2E performance test |

## 11.6 Accessibility Acceptance Criteria

| Criterion | Definition | Standard | Test Type |
|---|---|---|---|
| A-01 | All text has contrast ratio ≥ 4.5:1 (normal), ≥ 3:1 (large text). | WCAG 1.4.3 (AA) | Axe-core + manual check |
| A-02 | All images have alt text (or alt="" for decorative). Alt text describes image content (max 125 chars). | WCAG 1.1.1 (A) | Axe-core + manual review |
| A-03 | All videos have captions (burned-in or file-based). Audio descriptions provided for key visual information. | WCAG 1.2.1 (A) | Manual review |
| A-04 | Keyboard navigation works throughout (Tab, Shift+Tab, arrow keys, Enter/Space). No keyboard traps. | WCAG 2.1.1 (A) | Keyboard audit |
| A-05 | Focus indicators visible (outline or background change, contrast ≥ 3:1 vs background). | WCAG 2.4.7 (AA) | Visual test |
| A-06 | Form labels visible (not placeholder-only). Error messages linked to inputs (aria-describedby). | WCAG 1.3.1 (A), 3.3.1 (A) | Axe-core + screen reader test |
| A-07 | Page structure uses semantic HTML (h1-h6, nav, main, aside, section). ARIA roles only when semantic HTML insufficient. | WCAG 1.3.1 (A) | Axe-core |
| A-08 | Screen reader testing (NVDA, JAWS, VoiceOver): Page structure, buttons, forms, tables, landmarks all announced correctly. | WCAG 2.1 (AA) | Screen reader audit |
| A-09 | All grade badges (FM / PM / DNM / EX per UX §2.7 and Appendix J `requirement_score_grade`) distinguishable by icon shape AND color (not color alone). Icons: checkmark-circle (FM) / half-circle (PM) / x-circle (DNM) / minus-circle (EX). | WCAG 1.4.1 (A) | Visual test + color-blind simulation |
| A-10 | Skip-to-main-content link visible on first Tab press. Links to main content area (role="main"). High contrast (≥ 4.5:1). | WCAG 2.4.1 (A) | Keyboard test |
| A-11 | All ARIA landmark roles present: aside (sidebar), main (content area), complementary (side peek), navigation (breadcrumbs/tabs), status (toast), dialog (modals). Landmarks labeled. | WCAG 1.3.1 (A) | Axe-core + screen reader test |
| A-12 | All form inputs have visible labels (not placeholder-only). Labels linked to inputs via htmlFor/id or wrapping. Placeholder used for hints, not labels. | WCAG 1.3.1 (A), 2.4.6 (AA) | Axe-core + manual review |

---

**End of Sourcera Product UX & UI Specification v2.0.0**
