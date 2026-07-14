# Fixture

## 37.1 Accessibility (WCAG 2.1 AA) {#37.1-accessibility}

Every UI surface MUST carry a WCAG conformance posture binding.

Appendix M conformance posture is enforced by `appendix_m_coverage_on_diff` (§M.4) and the §M.5 gate `appendix_m_conformance_posture_completeness`. The gate fails any diff that adds a surface §-anchor without an Appendix M.1 conformance-posture note, OR that adds an Appendix M.1 row with an empty / malformed posture note.

## M.1 Master Surface/Engine Mapping Table {#m-1-master-surface-engine-mapping-table}

| Engine concept | Spec home | Surface metaphor | Tier visibility | Notes |
|---|---|---|---|---|
| **Section** | | | | |
| Visible row | §1 | Settings page | All | Conformance posture: inherits_§37.1. |
| Ops row | §50 | Ops Console panel | Internal Ops | Conformance posture: inherits_§37.1. |
| Internal row | §4 | No surface — internal worker only | Internal-only, never surfaced | No customer or Ops surface. |
| Deviation row | §26 | Public page | Public | Conformance posture: deviation rationale for third-party embed; mitigation is keyboard fallback and audited alternative. |

## M.5 CI Gate Catalog {#m-5-ci-gate-catalog}

| Gate ID | Source phase | Runtime status | Scope | Trigger | Failure mode | Authority anchor |
|---|---|---|---|---|---|---|
| `appendix_m_conformance_posture_completeness` | Phase 37 P1 | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/appendix_m_conformance_posture_completeness.ts`) | Appendix M.1 row set. | Visible rows carry `inherits_§37.1` or deviation rationale + mitigation. | PR comment naming the row. | §37.1. |
