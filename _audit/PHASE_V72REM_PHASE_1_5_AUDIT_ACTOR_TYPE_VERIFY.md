# Phase v7.2.0-REM — Phase 1.5 Audit Event Actor-Type Canonicality Verification

**Date:** 2026-06-22
**Scope:** D-1.5-007 P1, plus coupled D-1.5-011 P3.
**Verdict:** Remediated. D-1.5-007 was a true live P1. D-1.5-011 was coupled and is closed by the same identity-model wiring.

## 1. Backups

Backups taken before the D-1.5-007 edit pass:

- `_versions/Sourcera_Master_Spec_pre-2026-06-22-phase-1-5-audit-actor-type-enum.md` — md5 `50655116c0373f59492c9da61a3d9258`
- `_versions/DEFECT_LEDGER_pre-2026-06-22-phase-1-5-audit-actor-type-enum.md` — md5 `d372e171e80c83e47a70a81caf46c6c4`
- `_versions/V711_BACKLOG_INDEX_pre-2026-06-22-phase-1-5-audit-actor-type-enum.md` — md5 `58958fbedba8fdbbb10c1753b8539334`
- `_versions/RECONCILIATION_pre-2026-06-22-phase-1-5-audit-actor-type-enum.md` — md5 `22f2617e0d93259f801d062eb82ee36d`
- `_versions/AUTHORED_EXTENSIONS_LEDGER_pre-2026-06-22-phase-1-5-audit-actor-type-enum.md` — md5 `f5455b4774889e68975e6eea9f87d94b`

## 2. Adjudication

D-1.5-007 was live. Current Master Spec state before closure had the core §50.5.1 table partially patched to Appendix J values, but surrounding normative Ops/AuditEvent references still emitted the old `actor_type='ops'` value, Appendix I described AIOperation with `actor_type=ops_actor`, and Appendix J did not include `external_integration_principal_id` in the exhaustive identity-field assertion.

The correct resolution is not a global replacement:

- §4.6.1 AuditEvent rows use Appendix J `audit_event_actor_type`: `customer_user`, `system_agent`, `ops_actor`, `external_integration`.
- §4.8.1 AIOperation rows continue to use Appendix J `ai_operation_actor_type`: `user`, `managed_agent`, `system`, `ops`.

D-1.5-011 is closed because `external_integration` is now wired into §50.5.1 with a concrete identity field and validator rule instead of remaining a dead Appendix J value.

## 3. Master Spec Evidence

Confirmed live anchors after patch:

- §50.5.1 `actor_type` row cites Appendix J values only: `customer_user`, `system_agent`, `ops_actor`, `external_integration`.
- §50.5.1 adds `system_agent_id` and `external_integration_principal_id`.
- §50.5.1 validator covers all four AuditEvent actor types.
- §50.2.3 distinguishes AuditEvent `ops_actor` from AIOperation `ops`.
- §50.5.2 keeps AIOperation `actor_type='ops'` for the separate AIOperation enum.
- Appendix I `ai_operation_ops_actor_session_required` now cites AIOperation `actor_type=ops`.
- Appendix J `audit_event_actor_type` now asserts `user_id`, `ops_session_id`, `system_agent_id`, and `external_integration_principal_id` consistency.
- Appendix J `system_agent_id_enum` now includes `system_agent_managed_agent_bridge`, `system_agent_spec_lint_pipeline`, and `system_agent_deploy_validator`.
- Appendix M.4/M.5 audit rows now use `actor_type=system_agent` with the appropriate `system_agent_id` instead of unregistered `github_app` / `deploy_validator` actor types.

## 4. Ledger Evidence

- `_audit/DEFECT_LEDGER.md` row D-1.5-007 status: `remediated 2026-06-22`.
- `_audit/DEFECT_LEDGER.md` row D-1.5-011 status: `remediated 2026-06-22`.
- `_audit/V711_BACKLOG_INDEX.md` current count updated to index-series 389 after this pass.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` adds AE-V72REM-PH15-AUDIT-ACTOR-TYPE-01.
- `_integration/RECONCILIATION.md` adds the Phase 1.5 Audit Event Actor-Type Canonicality pass and updates prior Phase 1.5 residual notes that previously named D-1.5-007 as still open.

## 5. Targeted Scans

`rg` over `Sourcera_Master_Spec.md` for stale AuditEvent actor forms:

- `actor_type='ops'` / `actor_type = 'ops'` remaining hits are AIOperation-specific or explanatory separation text where §4.8.1 `ai_operation_actor_type='ops'` remains valid.
- `actor_type='managed_agent'` remaining hits are AIOperation-specific or explanatory separation text where §4.8.1 `ai_operation_actor_type='managed_agent'` remains valid.
- No live Master Spec hits remain for unregistered AuditEvent `actor_type = github_app` or `actor_type = deploy_validator`.

Defect-ledger targeted scan:

- D-1.5-007: remediated 2026-06-22.
- D-1.5-011: remediated 2026-06-22.
- No `| D-1.5-007 | ... | open |` or `| D-1.5-011 | ... | open |` row remains.

Count scan:

- Established V711 index regex scanner returns 389 open P1 rows / 388 unique D-* IDs after this closure.
- Direct Markdown cell-splitting is not used for the index count because many ledger cells contain escaped pipe characters in evidence text.

## 6. Residuals

- D-1.5-012 / D-1.5-013 / D-1.5-014 remain lower-severity adjacent AuditEvent residency / numerical-singleton / Appendix M issues and are outside this P1 actor-type closure.
- D-3.5-015 remains an open P1 DSAR actor / redaction-path enum issue and is a candidate next P1 pass; it is not closed by this §50.5.1 actor-type canonicalization.

## 7. Verification Status

Targeted textual verification passed.

Full spec-lint command:

`cd tools/spec-lint && npm run all -- --no-emit`

Result:

- Exit code 0.
- Blocking gates pass, including `seller_maya_audit_action_namespace`, `audit_event_schema_single_source_of_truth`, and `audit_log_scope_single_source`.
- Advisory-only findings remain unchanged in known categories: `solo_tier_numeric_single_source` (52), `retention_singleton_section_40_2_canonical` (123), and `section_anchor_slug_no_colon` (13).
