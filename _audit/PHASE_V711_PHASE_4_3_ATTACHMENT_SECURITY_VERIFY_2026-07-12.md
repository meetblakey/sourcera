# v7.1.1 Phase 4.3 Attachment Security and Attachment-Enum Authority Verification — 2026-07-12

## Scope

Remediates D-4.3-024 and the current-source recurrence of D-AJ-023. Extends the pending AE-V711-PH12-POLICY-RESILIENCE-SAFETY-01 scope; does not add a second AE or promote a runtime row.

## Conflict and resolution

| Conflict | Canonical resolution |
| :---- | :---- |
| Policy upload lacked a byte-security admission rule | §12.2.1 uses the existing §4.6.2 Attachment scan lifecycle; only a clean Attachment may atomically create PolicyDocument and PolicyIngestionJob. |
| Appendix J held two incompatible Attachment owner-enum definitions | The first Appendix J entry is the sole canonical union; the later duplicate is expressly retired. §4.6.2 no longer restates a competing subset. |

## Source contract proof

| Surface | Required proof |
| :---- | :---- |
| Data model | §4.3.34 `source_attachment_id`; §4.6.2 `policy_document` owner, Buyer-only scope, atomic clean binding AC. |
| Security state | §12.2.1 blocks every non-clean scan state; infected bytes quarantine before PolicyDocument, job, provider, billing, controls, webhook, Console Bridge, or telemetry. |
| API and errors | §32.10.3.C resolves `upload_ref`; Appendix I registers HTTP 423 `attachment_scan_pending` and HTTP 422 `policy_ingestion_attachment_scan_failed`. Appendix I also wins the surfaced endpoint conflict: unsupported-format is HTTP 415 and page-limit is HTTP 422. |
| UX and notification | §12.2.1 supplies §3.7 Failure / Reason / Recovery copy and routes the existing §4.6.2 uploader / Workspace Owner/Admin notification through §29. |
| Governance | AE-V711-PH12-POLICY-RESILIENCE-SAFETY-01 records the selected clean-scan binding and remains pending human sign-off. |

## Verification commands

| Command | Result |
| :---- | :---- |
| `npm --prefix tools/spec-lint run typecheck` | PASS |
| `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/run-gate.ts policy_ingestion_entity_contract_completeness --spec tools/spec-lint/fixtures/policy_ingestion_entity_contract_completeness/pass.md --no-emit` | PASS; detector v1.1.0. |
| `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/run-gate.ts policy_ingestion_entity_contract_completeness --spec tools/spec-lint/fixtures/policy_ingestion_entity_contract_completeness/fail.md --no-emit` | Expected FAIL; missing clean-attachment contract is detected. |
| `npm --prefix tools/spec-lint run all -- --spec ../../Sourcera_Master_Spec.md --ux ../../UX_Design_of_Sourcera.md --reconciliation ../../_integration/RECONCILIATION.md --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md --no-emit` | PASS. |
| `tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --ledger _audit/DEFECT_LEDGER.md --json` | 1,979 rows; 0 open P0; 0 open P1; 206 open P2; 76 open P3. Output: `_audit/_tmp/v711_exact_status_phase43_attachment_security_final_2026-07-12.json`. |
| `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json` | RED: 500 runtime rows; 329 active; 190 blockers. Output: `_audit/_tmp/v711_stamp_gate_phase43_attachment_security_final_2026-07-12.json`. |
| `tools/spec-lint/node_modules/.bin/tsx tools/release/generate_runtime_blocker_inventory.ts --root . --stamp-json _audit/_tmp/v711_stamp_gate_phase43_attachment_security_final_2026-07-12.json --md _audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md --csv _audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.csv --date 2026-07-12` | PASS; 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 21 human-ratification blockers. |

## Runtime boundary

The source contract and static detector do not prove migration, upload resolution, scanner operation, transaction atomicity, quarantine notification, firewall enforcement, client behavior, mobile parity, DSAR execution, or concurrency behavior. Those remain external runtime evidence and the pending AE remains a stamp-gate blocker.
