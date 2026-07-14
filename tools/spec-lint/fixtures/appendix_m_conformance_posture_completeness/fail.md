# Fixture

## 37.1 Accessibility (WCAG 2.1 AA) {#37.1-accessibility}

Partial accessibility text without the binding sentence.

## M.1 Master Surface/Engine Mapping Table {#m-1-master-surface-engine-mapping-table}

| Engine concept | Spec home | Surface metaphor | Tier visibility | Notes |
|---|---|---|---|---|
| Visible row | §1 | Settings page | All | Missing posture. |
| Ops row | §50 | Ops Console panel | Internal Ops | Missing posture. |
| Bad deviation row | §26 | Public page | Public | Conformance posture: deviation rationale only. |
| Internal row | §4 | No surface — internal worker only | Internal-only, never surfaced | No customer or Ops surface. |

## M.5 CI Gate Catalog {#m-5-ci-gate-catalog}

| Gate ID | Source phase | Runtime status | Scope | Trigger | Failure mode | Authority anchor |
|---|---|---|---|---|---|---|
| `appendix_m_conformance_posture_completeness` | Phase 37 P1 | `spec_binding_pending_pack_m02_3` | Appendix M.1 row set. | Visible rows carry posture. | PR comment naming the row. | §37.1. |
