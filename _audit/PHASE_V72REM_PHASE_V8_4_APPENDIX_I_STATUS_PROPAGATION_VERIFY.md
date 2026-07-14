# Phase v7.2.0-REM Phase V8.4 Appendix I Status Propagation Verification

**Date:** 2026-06-22
**Verdict:** PASS
**Scope:** BL-P1-PH8P84-ERR and sibling V8.4 P1 rows D-V8.4-001, D-V8.4-002, D-V8.4-003, D-V8.4-004, D-V8.4-005, D-V8.4-006, D-V8.4-008, D-V8.4-018, and D-V8.4-019.

## Adjudication

These were true P1 issues at filing. They are not live authoring issues now because the Master Spec already landed the Phase V8.4 Appendix I spec-side remediation on 2026-05-08.

This pass propagated the canonical DEFECT_LEDGER status cells to match the existing authoritative transition table and Master Spec changelog. It did not modify the Master Spec.

| Defect | True issue at filing | Existing remediation authority |
|---|---|---|
| D-V8.4-001 | Appendix I lacked canonical registration for 31 pre-existing billing-domain codes. | Appendix I "Pre-existing Billing Domain Codes" + `appendix_i_billing_code_completeness`. |
| D-V8.4-002 | `ai_operation_contest_window_expired` was referenced but not registered. | Appendix I row under "Pre-existing Billing Domain Codes". |
| D-V8.4-003 | `wallet_hard_capped` / `ai_wallet_exhausted` had conflicting status/code semantics. | `wallet_hard_capped` HTTP 402 canonical; `ai_wallet_exhausted` deprecated alias. |
| D-V8.4-004 | Vendor opt-out capability invocation lacked a top-level error code. | `vendor_opt_out_blocks_capability` + `vendor_opt_out_capability_layer_enforcement`. |
| D-V8.4-005 | Appendix I lacked a catalog-wide retryability convention. | Appendix I Preamble + `error_retry_class` + `appendix_i_retryability_completeness`. |
| D-V8.4-006 | Legacy Appendix I tables lacked `used_by` endpoint references. | Appendix I Preamble + `appendix_i_endpoint_cross_reference_completeness`. |
| D-V8.4-008 | `audit-events/export` was referenced without a §32 endpoint contract. | §32.8.24 `POST /v1/orgs/{org_id}/audit-events/export`. |
| D-V8.4-018 | `kb_export_console_forbidden` had 403/422/404 firewall-status drift. | Appendix I + §22.18 AC #73 now use HTTP 404 non-leak. |
| D-V8.4-019 | Auto-topup runtime charge decline lacked a synchronous API error code. | `wallet_autotopup_charge_declined` HTTP 402 row. |

## Files Updated

- `_audit/DEFECT_LEDGER.md`: canonical status propagation for the nine V8.4 P1 rows above.
- `_audit/REMEDIATION_BACKLOG.md`: BL-P1-PH8P84-ERR count set to 0 and live ID set corrected.
- `_audit/V711_BACKLOG_INDEX.md`: advisory parsed P1-open count updated 483 -> 474 and current-delta note added.
- `_integration/RECONCILIATION.md`: status-propagation block appended.

## Backups

| File | Backup | MD5 |
|---|---|---|
| `_audit/DEFECT_LEDGER.md` | `legacy-import:_versions/DEFECT_LEDGER_pre-phase-v8-4-appendix-i-status-propagation-2026-06-22.md` | `79e2ee0b0eb6df9fe08bbdd2251b4e63` |
| `_audit/REMEDIATION_BACKLOG.md` | `legacy-import:_versions/REMEDIATION_BACKLOG_pre-phase-v8-4-appendix-i-status-propagation-2026-06-22.md` | `f970713664d45acee3a78f989f00ddfa` |
| `_audit/V711_BACKLOG_INDEX.md` | `legacy-import:_versions/V711_BACKLOG_INDEX_pre-phase-v8-4-appendix-i-status-propagation-2026-06-22.md` | `638befabc3e48cece6064dc0bcde2d8d` |
| `_integration/RECONCILIATION.md` | `legacy-import:_versions/RECONCILIATION_pre-phase-v8-4-appendix-i-status-propagation-2026-06-22.md` | `63b61cbd62a5d9d913cbfe545228e206` |

## Verification

- Targeted DEFECT_LEDGER scan confirmed the nine V8.4 P1 rows now carry `remediated 2026-05-08 (propagated 2026-06-22...)`.
- Negative scan for those nine row IDs with `status=open` returned no matches.
- Targeted scans confirmed the Master Spec V8.4 changelog, Appendix I landing sites, §32.8.24 endpoint, §22.18 AC #73, §M.5 V8.4 gates, and AE-V8.4 approved rows exist.
- Merge-marker scan over touched files returned no markers.
- Spec-lint was not rerun because this was a ledger/backlog status propagation with no Master Spec body edit.

## Post-Edit Fingerprints

| File | MD5 |
|---|---|
| `_audit/DEFECT_LEDGER.md` | `cd3c22c4015f0882833eea7b96b36346` |
| `_audit/REMEDIATION_BACKLOG.md` | `c55253ae8e33fd190c9e777a8b5623d4` |
| `_audit/V711_BACKLOG_INDEX.md` | `bf13327ced43999869cb2386c2dd72ce` |
| `_integration/RECONCILIATION.md` | `5bb24b84dc87976a76ecea21251c4009` |

## Residuals

- Lower-severity V8.4 rows remain outside this P1 status-propagation pass.
- Appendix I legacy-table backfill and AE-V8.4-05 webhook Appendix C / G registration remain as v7.1.1 hygiene surfaces where explicitly preserved by the Master Spec known-issues block.
- Broader D-CONS status propagation remains open outside this targeted V8.4 P1 slice.
