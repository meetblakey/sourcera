# Fixture

## 37.5 Testing & Audit Pipeline {#37.5-testing-and-audit-pipeline}

- **Annual external audit.** A third-party WCAG audit is required annually +/- 60 days and before any Enterprise customer contract that names WCAG conformance as a pre-signature requirement. Findings map to the platform severity ladder: P0/P1/P2/P3 remediation targets follow §42.3.0 unless Legal sets a shorter customer commitment.

## 37.6 Acceptance Criteria {#37.6-acceptance-criteria}

11. Annual third-party audit findings MUST be logged as defects, mapped to severity, assigned an owner, and tracked to closure; unresolved P0/P1 findings block any release claiming WCAG conformance.

## M.5 CI Gate Catalog {#m-5-ci-gate-catalog}

| Gate ID | Source phase | Runtime status | Scope | Trigger | Failure mode | Authority anchor |
|---|---|---|---|---|---|---|
| `annual_wcag_audit_remediation_sla_tracker` | Phase 37 P1 | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/annual_wcag_audit_remediation_sla_tracker.ts`; tracker `_audit/WCAG_AUDIT_FINDING_TRACKER.md`) | External WCAG audit tracker, defect ledger, release gate metadata. | Annual third-party WCAG audit findings MUST map to defects, severity, owners, and closure status; unresolved P0/P1 findings block releases claiming WCAG conformance. | Release-check failure naming overdue or unmapped finding. Override path: `not_permitted_accessibility_conformance`. | §37.5; §37.6 AC #11; D-37-004. |

# WCAG Audit Finding Tracker

**Canonical owner:** Design Lead + Engineering Lead
**Release gate:** `annual_wcag_audit_remediation_sla_tracker`
**Source authority:** Master Spec §37.5 / §37.6 AC #11
**Current cycle:** `first_annual_cycle_pending`
**First-cycle due rule:** due by 2027-08-21 or before any Enterprise contract that names WCAG conformance as a pre-signature requirement, whichever comes first.
**Current open P0/P1 findings:** 0

No current third-party WCAG audit findings are open as of 2026-07-07.

| Finding ID | External audit cycle | Success criterion | Severity | Owner | Defect ID | Status | Release blocking | Target close date | Closure evidence |
|---|---|---|---|---|---|---|---|---|---|
| `none_current` | `first_annual_cycle_pending` | N/A | N/A | Design Lead + Engineering Lead | N/A | `no_external_findings_received` | `false` | N/A | `_audit/WCAG_AUDIT_FINDING_TRACKER.md` |
