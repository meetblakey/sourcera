# Phase V711 - API Single-Source Runtime Promotion Verify

**Date:** 2026-07-07
**Scope:** Six M02.3 runtime promotions for API/status single-source gates.
**Verdict:** PASS for this gate batch. v7.1.1 stamp remains blocked by other runtime-evidence rows.

## 1. Issues Found

| Area | Conflict / gap | Resolution |
|---|---|---|
| KB export console firewall | §22.18.7 / Appendix I required HTTP 404 `kb_export_console_forbidden`, but §4.4.30 / §22.18.2.1 / §32.9 still carried active HTTP 422 / 403 prose. | Active KB export wrong-console behavior now resolves to HTTP 404 non-leak; Seller-console role denials remain HTTP 403 `kb_export_role_insufficient`. |
| Phase Advancement path | §10.16 / §32.5 used `POST /v1/workspaces/{workspace_id}/advance`, while §5.3.1 and Appendix M still carried stale phase-transition paths. | Active permission-matrix and Appendix M references now use `POST /v1/workspaces/{workspace_id}/advance`; audit action normalized to `phase_advanced`. |
| Runtime evidence | Six §M.5 rows had spec-body support but no promoted detector artifact. | Added detectors, registered them in `tools/spec-lint/run-all.ts`, and promoted rows to `runtime_active` only after direct pass. |

## 2. Runtime Promotions

| Gate | Detector |
|---|---|
| `kb_export_console_firewall_status_consistency` | `tools/spec-lint/gates/kb_export_console_firewall_status_consistency.ts` |
| `kb_export_integrity_http_code_single_source` | `tools/spec-lint/gates/kb_export_integrity_http_code_single_source.ts` |
| `idempotency_key_canonical_error_code` | `tools/spec-lint/gates/idempotency_key_canonical_error_code.ts` |
| `phase_advancement_endpoint_path_canonical` | `tools/spec-lint/gates/phase_advancement_endpoint_path_canonical.ts` |
| `phase_1_stakeholder_acceptance_not_gate` | `tools/spec-lint/gates/phase_1_stakeholder_acceptance_not_gate.ts` |
| `phase_6_bidding_close_minimum_seven_days` | `tools/spec-lint/gates/phase_6_bidding_close_minimum_seven_days.ts` |

## 3. Verification

Commands run:

```bash
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/kb_export_console_firewall_status_consistency.ts --spec Sourcera_Master_Spec.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/kb_export_integrity_http_code_single_source.ts --spec Sourcera_Master_Spec.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/idempotency_key_canonical_error_code.ts --spec Sourcera_Master_Spec.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/phase_advancement_endpoint_path_canonical.ts --spec Sourcera_Master_Spec.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/phase_1_stakeholder_acceptance_not_gate.ts --spec Sourcera_Master_Spec.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/phase_6_bidding_close_minimum_seven_days.ts --spec Sourcera_Master_Spec.md --no-emit
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
```

Results:

| Check | Result |
|---|---|
| Six direct detectors | PASS, 0 findings each |
| TypeScript typecheck | PASS |
| Full spec-lint batch | PASS, 0 blocking findings |
| Stamp gate | FAIL overall, but blocker count reduced from 384 to 378 |

Current stamp-gate status counts:

```text
runtime_active: 40
spec_binding_pending_pack_m02_3: 245
spec_binding_pending_pack_m11_3: 102
spec_binding_pending_pack_m21_3: 26
spec_binding_pending_pack_m24_3: 5
spec_binding_release_gate_only: 2
```

## 4. Residuals

Remaining stamp blockers: 378 total.

| Pack | Remaining blockers |
|---|---:|
| M02.3 | 245 |
| M11.3 | 102 |
| M21.3 | 26 |
| M24.3 | 5 |

No product-code runtime row was promoted. Product-code / deploy / marketplace / billing rows remain blocked until their required runtime evidence exists.
