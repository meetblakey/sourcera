# Fixture

## 37.1 Accessibility (WCAG 2.1 AA) {#37.1-accessibility}

- **Motor and target size.** Touch-target minimums are sourced only from §38.6.2. §37 interprets those tier values against WCAG 2.5.5 / 2.5.8 and never authors an independent target-size number.

## 38.6.2 Per-Breakpoint Layout Rules {#38.6.2-per-breakpoint-layout-rules}

| Dimension | `mobile_xs` | `mobile_sm` | `tablet` | `desktop` | `desktop_xl` |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Touch-target minimum | 48 × 48 CSS px | 48 × 48 CSS px | 44 × 44 CSS px | 32 × 32 CSS px | 32 × 32 CSS px |

## UX Fixture

- Touch targets follow the Master Spec §38.6.2 per-tier minimum.

## M.5 CI Gate Catalog {#m-5-ci-gate-catalog}

| Gate ID | Source phase | Runtime status | Scope | Trigger | Failure mode | Authority anchor |
|---|---|---|---|---|---|---|
| `touch_target_per_tier_single_source` | Phase 37 P1 | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/touch_target_per_tier_single_source.ts`) | Master Spec post-edit grep against §37 / §38 / UX component docs. | Touch-target numeric values MUST be sourced from §38.6.2; inline target-size numbers outside §38.6.2 must cite the source table or fail. | PR comment naming the duplicate target-size literal; merge blocked. Override path: `default_ci_gate_override` with source-table citation. | §37.1; §38.6.2; D-37-001. |
