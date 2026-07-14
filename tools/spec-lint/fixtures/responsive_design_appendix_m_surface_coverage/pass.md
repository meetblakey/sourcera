# 38. Responsive Design & Platform Support {#38.-responsive-design-and-platform-support}

## 38.9 Print Stylesheet Behavior {#38.9-print-stylesheet-behavior}

## 38.10 Reduced-Motion & Accessibility Tier Overrides {#38.10-reduced-motion-and-accessibility-tier-overrides}

## 38.11 Right-to-Left & Locale Mirror Behavior {#38.11-right-to-left-and-locale-mirror-behavior}

## 38.12 Presence Avatar Stack Component {#38.12-presence-avatar-stack-component}

## Appendix M: Surface / Engine Mapping Registry {#appendix-m-surface-engine-mapping-registry}

| Surface | Authority | Visible Surface | Audience | Notes |
|---|---|---|---|---|
| **Responsive Design (§38)** | | | | |
| Responsive breakpoint tier engine | §38.6.1, Appendix J `responsive_breakpoint_tier` | |
| UserUIPreference breakpoint and layout persistence | §4.2.15, §38.6.3, §38.6.4.1 | |
| Modern device posture and constrained-data renderer | §38.6.4.1 | |
| Side Peek tier-aware rendering | §3.8, §38.6.2, §38.8.1 | |
| Bottom Nav mobile primary navigation | §38.6.2 | |
| Hamburger Sidebar mobile navigation | §38.6.2 | |
| Mobile Search / bottom-sheet Command Palette | §38.6.2, §38.7.1 | |
| Agent FAB mobile entry point | §38.7.1, §21.3 | |
| Simplification Disclosure chip | §38.8.3 | |
| Mobile-unsupported informational page | §38.8.3, §50.2.2 | |
| Mobile Feature Parity Matrix | §38.8.2, Appendix J `mobile_feature_parity_status` | |
| Tap-count probe workflow engine | §38.7.4, §38.8.4, Appendix J `tap_count_probe_workflow_kind` | |
| Responsive Tier Conformance Dashboard | §38.6.5, §50.14.13 | |
| Mobile Feature Parity Dashboard | §38.8.2, §38.8.5, §50.14.14 | |
| Print Stylesheet Behavior | §38.9 | |
| Reduced-Motion Override | §38.10 | |
| RTL `useDirectionality()` hook | §37.3, §38.11 | |
| Presence Avatar Stack Component | §38.12 | |

#### M.5.59 v7.2.0-REM Phase 38 Responsive / Mobile P1 addition {#m-5-59-v72rem-phase-38-responsive-mobile-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `responsive_design_appendix_m_surface_coverage` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/responsive_design_appendix_m_surface_coverage.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Surface coverage. | M02.3 |
