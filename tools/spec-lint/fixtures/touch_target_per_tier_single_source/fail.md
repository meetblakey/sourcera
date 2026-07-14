# Fixture

## 37.1 Accessibility (WCAG 2.1 AA) {#37.1-accessibility}

- **Motor and target size.** Touch targets ≥ 48px per WCAG / Master Spec Section 37.1.

## 38.6.2 Per-Breakpoint Layout Rules {#38.6.2-per-breakpoint-layout-rules}

| Dimension | `mobile_xs` | `mobile_sm` | `tablet` | `desktop` | `desktop_xl` |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Touch-target minimum | 48x48px minimum | 48x48px minimum | 44x44px minimum | 32x32px minimum | 32x32px minimum |

## UX Fixture

- Buttons must use a 48x48px minimum touch target.

## M.5 CI Gate Catalog {#m-5-ci-gate-catalog}

| Gate ID | Source phase | Runtime status | Scope | Trigger | Failure mode | Authority anchor |
|---|---|---|---|---|---|---|
| `touch_target_per_tier_single_source` | Phase 37 P1 | `spec_binding_pending_pack_m02_3` | Master Spec post-edit grep against §37 / §38 / UX component docs. | Touch-target numeric values should be checked later. | PR comment. | §37.1. |
