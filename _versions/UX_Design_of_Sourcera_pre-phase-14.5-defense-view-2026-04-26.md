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

**Principle 1 — Keyboard-First, Mouse-Optional.** Every primary workflow is completable via keyboard. Command Palette (`Cmd+K`) is the universal accelerator. Shortcuts are discoverable, consistent, and phase-aware. Mouse and touch are supported but never required for power users. (Derived from Master Spec Section 3: The Linear Constraint.)

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

All color tokens have dark-mode equivalents. Dark mode inverts luminance relationships (dark backgrounds, light text) while preserving semantic meaning of accent, success, warning, danger, and exception tokens. Dark mode preference follows system setting with manual override in User Settings.

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

All transitions respect `prefers-reduced-motion: reduce`. When reduced motion is active, transitions are instantaneous (0ms duration) with opacity changes only.

## 2.7 Iconography

**Icon Library:** Lucide Icons (consistent with ShadCN/UI). 20px default size for navigation, 16px for inline/table contexts, 24px for empty state illustrations.

**Icon Usage Rules:**
- Every icon that conveys meaning must have a text label or `aria-label`.
- Decorative icons use `aria-hidden="true"`.
- Interactive icons (buttons) have a minimum touch target of 48×48px (per WCAG / Master Spec Section 37.1).
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
│ [Sidebar]  │  [Main Content Area]  │  [Side Peek]     │
│ 240px      │  Fluid (min 600px)    │  420px (optional) │
│ Fixed      │  Scrollable           │  Slides in/out    │
│            │                       │                    │
│            │                       │                    │
└────────────────────────────────────────────────────────┘
```

**Sidebar (Left, 240px, fixed):** Always visible on desktop. Contains org switcher, console indicator, primary navigation, workspace selector, and user menu. Collapses to icon-only (56px) on user toggle or narrow viewports. On mobile (< 640px), replaced by hamburger menu + bottom navigation bar.

**Main Content Area (Center, fluid):** Primary working surface. Contains page header, toolbar, and content. Scrolls independently. Minimum width 600px to prevent content compression.

**Side Peek (Right, 420px, conditional):** Slides in when a row is selected (`Enter` or click). Shows detail view for the selected entity. `Escape` closes. When open, the main content area compresses. When closed, main content area expands to fill.

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

### Desktop (> 1024px)
Three-column layout as described in 3.1. Sidebar pinned. Side Peek available. Full keyboard shortcuts. Command Palette via `Cmd+K`.

### Tablet (640–1024px)
Two-column layout: Sidebar + Main Content. Side Peek opens as a full-width overlay (slides from right, covers main content). Sidebar collapses to icon-only by default; expands on tap. Top navigation bar shows breadcrumb + search icon. Touch targets ≥ 48px.

### Mobile (< 640px)
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

## 5.2 Core Component Specifications

### Existing Components (5.2.1 – 5.2.10)

The following 10 components retain their existing specifications without modification:

- **DataTable**: Sortable, filterable tabular data with column configuration and row selection.
- **SidePeek**: Slide-out panel for viewing/editing detail without navigating away from current context.
- **CommandPalette**: Global search and navigation interface triggered by Cmd/Ctrl+K.
- **ScoringCard**: Container for collaborative scoring inputs with grade, reviewer attribution, and comment integration.
- **MarkdownEditor**: Rich text editor supporting markdown syntax, links, and code blocks.
- **ToastNotification**: Time-limited alert messages for confirmations, warnings, and errors.
- **GradeBadge**: Visual indicator of letter grade (A–F) or score (0–100) with color coding.
- **PresenceIndicator**: Avatar stack showing active users and their cursor positions during real-time collaboration.
- **EmptyState**: Placeholder message and illustration for zero-state views.
- **AgentAttribution**: Metadata indicator crediting AI-generated content with model name and capability.

---

### 5.2.11 Modal

**Purpose:** Overlay dialog for confirmations, multi-step forms, and focused tasks requiring user attention.

**Anatomy:**
- **Backdrop**: z-index 60, semi-transparent overlay (rgba(0, 0, 0, 0.5)), clickable to close unless `preventClose=true`.
- **Container**: z-index 70, centered on screen, default max-width 520px. Variant max-widths: `sm` 400px, `md` 520px, `lg` 720px, `full` 100% with margin.
- **Header**: Title text (Heading 4), close button (X icon) right-aligned. Sticky if body overflows.
- **Body**: Scrollable content area with 24px padding. Max-height 70vh.
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
- Opens with 200ms scale-and-fade animation. Initial opacity 0, scale 0.9 → opacity 1, scale 1.
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
- **Menu Items**: 40px height, left-padded 12px. Hover state: subtle background highlight (--color-surface-hover). Selected item: checkmark icon (right-aligned).
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
- **Label**: Caption weight 500 (12px), letter-spacing 0.5px, --color-text-primary. Required asterisk (*) in --color-danger appended to label text.
- **Input**: Height 36px default (40px for textarea/select), full-width, 12px horizontal padding, border 1px --color-border, border-radius 4px. Focus state: border-color --color-accent, box-shadow 0 0 0 3px --color-accent with 20% opacity.
- **Help Text**: Body Small (13px), --color-text-secondary, 8px margin-top.
- **Error Text**: Body Small (13px), --color-danger, 8px margin-top, replaces help text.
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
- 32px height, 8px horizontal padding.
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
| **Breached** | --color-danger (red) | Yes (0.6s pulse) | "Overdue by 2h 15m" | Deadline passed |
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
- **Phase Display**: "Phase 3: Vendor Discovery" (Heading 3), centered, with icon (e.g., 🔍).
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
- **Sticky Banner**: Fixed at top of requirement/response detail panel, z-index 50.
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
- **Panel Headers**: Version label at top of each panel (e.g., "Version 1 — Original", "Version 2 — Amended"). Caption weight, 12px. 24px padding top/bottom.
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

**Trigger:** Automatic when reviewer grade divergence ≥ 0.3 (on 0–1 scale or A–F) between any two reviewers. Sonnet analyzes reasoning and suggests common ground.

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

Existing specification retained without modification. Covers:
- Plan selection with feature comparison matrix.
- Upgrade/downgrade flows with proration.
- Usage overage resolution.
- Invoice history and payment methods.

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
| Color-blind safe grades | Grade badges (A/B/C/D) use BOTH color AND distinct icon shapes (checkmark / half-circle / X / dash). Icon shapes remain distinguishable to all color perception types. | WCAG 1.4.1 (Color Not Sole Means) | Simulated protanopia, deuteranopia, tritanopia in Figma plugin. |
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
| Scoring Matrix on tablet (iPad landscape) | Horizontal scroll enabled. Vendor column (fixed width 200px) remains sticky on left. Requirement ID column sticky on left beneath vendor name. Horizontal scroll snap enabled on score columns. All touch targets enlarged to 48x48px minimum. Pinch-to-zoom disabled on grid (CSS: touch-action: manipulation) to prevent accidental score changes. | 48px × 48px | Two-finger tap shows cell details in popover instead of scoring. |
| Q&A Thread on mobile | Full-screen thread overlay. Question + answer history scrollable. Reply input field pinned to bottom above virtual keyboard. Markdown toolbar collapsed into single "Format" button opening popover menu. Send button (arrow icon) always visible next to input. | 48px × 48px | Keyboard offset managed: input scroll into view when focused. |
| Triage Queue on mobile | List view only (board view hidden). Horizontal swipe-left reveals action buttons (assign, priority, resolve). Pull-to-refresh enabled. Avatar + name always visible. SLA timer shown inline (no column hiding). List items are full-width touch targets. | 48px × 48px min height | Swipe dismissal not enabled (sticky tracking needed). Undo toast after swipe action. |
| Policy Ingestion on mobile | Step 1 (upload) functional on mobile. Steps 2-3 (review extracted requirements, resolve duplicates) redirect to desktop with informational banner: "Policy review is best experienced on desktop. Continue on your computer or dismiss to proceed anyway." [Continue on Desktop] [Dismiss]. | N/A | User can still proceed on mobile at reduced UX quality. Desktop experience prioritized. |
| Side Peek on tablet | Peek width set to 60% viewport width (vs 40% on desktop). Full-width swipe-to-close gesture enabled (right swipe). Header includes back button (chevron-left icon) with label "Back". Backdrop tap also closes. | 48px × 48px | Peek never covers entire viewport on tablet. Always shows workspace behind. |
| DataTable with >8 columns on tablet | Columns ranked by priority (default: ID, name, status, assignee, due date, SLA, score, phase). Lowest-priority columns hidden automatically. User can toggle hidden columns via "Show more columns" button (down chevron icon, always visible in column header). | 44px × 44px | Column reordering disabled on mobile to save space. User preference persisted. |
| Command Palette on mobile | Full-width navigation bar replacing desktop Cmd+K palette. Magnifying glass icon in top-left nav opens search bar. Limited to navigation commands (jump to page) and entity search (find requirement/vendor). Action commands (bulk assign, archive, etc.) disabled and marked as "Desktop only". | 48px × 48px | Tap outside search closes it. Escape also closes. Search history available. |

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
| VD-05 | Score card (Phase 10+) shows: Overall Score, Grade (A/B/C/D), Scoring health (% of requirements scored). Clicking card navigates to Scoring Matrix filtered to vendor. | E2E test |
| VD-06 | Vendor history panel shows: Date added, NDA signed date, response submission times, disqualification date (if applicable). | Data accuracy test |

### Scenario Modeling

| Criterion | Definition | Test Type |
|---|---|---|
| SM-01 | Scenario Modeling loads in < 2s. Scenarios list shows all created scenarios with name, creation date, last modified. | Performance test |
| SM-02 | "Create Scenario" button launches modal. User inputs scenario name, selects Use Cases to include (multi-select), sets requirement weighting (0-100% per Use Case, must sum to 100%). | Validation test |
| SM-03 | Scenario execution calculates weighted scores: Scenario Score = Σ(Use Case weight × avg requirement score in Use Case). Results displayed as table. | Calculation test |
| SM-04 | Sensitivity analysis shows: if requirement weight changed by ±10%, how does overall score change? Visualization shows best-case / worst-case scenarios. | Calculation test |
| SM-05 | "Export Scenario" downloads as CSV with columns: Vendor, Scenario Score, Grade (A/B/C/D per scenario). | E2E test |
| SM-06 | Scenarios are workspace-scoped. Deleting scenario requires confirmation. Soft delete (archived). | E2E test |

### Scoring Matrix

| Criterion | Definition | Test Type |
|---|---|---|
| SC-01 | Scoring Matrix loads in < 1s (100 requirements × 10 vendors = 1000 cells). Vendor names remain sticky (horizontal scroll). Requirement IDs remain sticky (vertical scroll). | Performance test |
| SC-02 | Each cell displays: score (numeric 0-100) or dash (not yet scored), grade badge (A/B/C/D with icon), last-modified timestamp (on hover). | E2E test |
| SC-03 | Phase 10: Agent pre-scoring triggered on phase entry. Cells show "scoring..." briefly, then populate with pre-scores. Pre-scores appear as they complete (progressive loading). | Integration test + timing test |
| SC-04 | Phase 11: User can edit scores. Clicking cell opens inline score input (0-100, required). Changes save on blur. Conflict resolution: if cell edited concurrently, show conflict dialog. | E2E test + concurrency test |
| SC-05 | Phase 12+: All cells show lock icon. No editing allowed. Tooltip: "Scores are permanently locked." | Phase test |
| SC-06 | Bulk actions (select cells by column/row): Apply score template, copy scores from another vendor, mark as "needs review". | E2E test |
| SC-07 | Score distribution histogram shown (right sidebar): # of A/B/C/D grades per column (vendor), normalized. | Visual test |
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
| SPK-01 | Side peek slides in from right edge. Width: 40% viewport (desktop), 60% (tablet), 100% (mobile). Backdrop shown (click to close). | Visual test + responsive test |
| SPK-02 | Header: title + close button (X). Content scrollable. Footer: primary action (optional). | E2E test |
| SPK-03 | Escape key closes. Click backdrop closes. Swipe-right gesture closes (mobile/tablet). | Interaction test + keyboard test |
| SPK-04 | Focus management: focus trapped inside peek. Clicking outside closes. | Keyboard test |

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
| A-09 | All grade badges (A/B/C/D) distinguishable by icon shape AND color (not color alone). Icons: checkmark / half-circle / X / dash. | WCAG 1.4.1 (A) | Visual test + color-blind simulation |
| A-10 | Skip-to-main-content link visible on first Tab press. Links to main content area (role="main"). High contrast (≥ 4.5:1). | WCAG 2.4.1 (A) | Keyboard test |
| A-11 | All ARIA landmark roles present: aside (sidebar), main (content area), complementary (side peek), navigation (breadcrumbs/tabs), status (toast), dialog (modals). Landmarks labeled. | WCAG 1.3.1 (A) | Axe-core + screen reader test |
| A-12 | All form inputs have visible labels (not placeholder-only). Labels linked to inputs via htmlFor/id or wrapping. Placeholder used for hints, not labels. | WCAG 1.3.1 (A), 2.4.6 (AA) | Axe-core + manual review |

---

**End of Sourcera Product UX & UI Specification v2.0.0**
