# Fixture

## 37.1 Accessibility (WCAG 2.1 AA) {#37.1-accessibility}

**Success Criterion set.** The §37.6 acceptance criteria cover Success Criteria 1.1.1, 2.4.1, and 3.3.8.

### 37.5.1 Accessibility Audit Manifest {#37.5.1-accessibility-audit-manifest}

| Success Criterion | Requirement | Fixture / procedure | Scope |
|---|---|---|---|
| `1.1.1` | Non-text Content |  | Public pages. |
| `2.4.1` | Bypass Blocks | `keyboard:skip_link_first_tab_stop` | Route shell. |
| `2.4.1` | Bypass Blocks duplicate | `axe:bypass_blocks` | Route shell. |
| `9.9.9` | Phantom criterion | `manual:phantom_review` | Nowhere. |

## M.5 CI Gate Catalog {#m-5-ci-gate-catalog}

| Gate ID | Source phase | Runtime status | Scope | Trigger | Failure mode | Authority anchor |
|---|---|---|---|---|---|---|
| `accessibility_success_criterion_fixture_coverage` | Phase 37 P1 | `spec_binding_pending_pack_m02_3` | Manifest. | Criteria resolve to fixtures. | PR comment naming uncovered criterion. | §37.1. |
