# Fixture

## 37.1 Accessibility (WCAG 2.1 AA) {#37.1-accessibility}

**Success Criterion set.** The §37.6 acceptance criteria are the binding test surface for WCAG Success Criteria 1.1.1 and 2.4.1 plus WCAG 2.2 AA Success Criterion 3.3.8.

### 37.5.1 Accessibility Audit Manifest {#37.5.1-accessibility-audit-manifest}

| Success Criterion | Requirement | Fixture / procedure | Scope |
|---|---|---|---|
| `1.1.1` | Non-text Content | `axe:non_text_content_alt_text`; `manual:decorative_image_hidden_review` | Public pages. |
| `2.4.1` | Bypass Blocks | `keyboard:skip_link_first_tab_stop`; `axe:bypass_blocks` | Route shell. |
| `3.3.8` | Accessible Authentication | `manual:accessible_auth_no_cognitive_test`; `screen_reader:login_mfa_recovery_walk` | Auth routes. |

## M.5 CI Gate Catalog {#m-5-ci-gate-catalog}

| Gate ID | Source phase | Runtime status | Scope | Trigger | Failure mode | Authority anchor |
|---|---|---|---|---|---|---|
| `accessibility_success_criterion_fixture_coverage` | Phase 37 P1 | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/accessibility_success_criterion_fixture_coverage.ts`) | §37.5.1 Accessibility Audit Manifest and §37.1 Success Criterion set. | Criteria resolve to fixtures. | PR comment naming uncovered Success Criterion, duplicate criterion, blank fixture cell, or malformed procedure token. | §37.5.1. |
