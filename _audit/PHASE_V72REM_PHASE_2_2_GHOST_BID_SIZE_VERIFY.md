# v7.2.0-REM Phase 2.2 GhostBidImport Size Singleton Verification

Date: 2026-06-22

## Scope

Focused pass for:

- D-2.2-031 (P1 numerical_singleton): §4.4.17 GhostBidImport field rows restated size limits instead of citing §39.
- D-AS-010 (P3 numerical_singleton): §39 omitted the GhostBidImport parsed Q/A pair-count cap while §48.7.2 cited it inline.

## Adjudication

D-2.2-031 was a true live P1 issue, but the filed evidence was partly stale. Current §39 already carried `GhostBidImport.source_file_byte_size`, `GhostBidImport.raw_text`, and `GhostBidImport.parsed_qa_pairs_json`; the remaining live issue was §4.4.17 field-table restatement and the missing parsed-pair singleton from D-AS-010.

D-AS-010 was a true paired P3 issue. §39 did not own `GhostBidImport.parsed_qa_pairs`, and Appendix I did not register a parser-overflow error for pair-count rejection.

## Landing Sites

| Defect | Landing site |
| :---- | :---- |
| D-2.2-031 | §4.4.17 GhostBidImport field rows, state-machine transitions, and AC #1; §48.7.2 Ghost-Bid RFP workflow; §M.5.38 `ghost_bid_import_size_single_source`; `tools/spec-lint/gates/ghost_bid_import_size_single_source.ts`; `tools/spec-lint/run-all.ts`. |
| D-AS-010 | §39 `GhostBidImport.parsed_qa_pairs`; Appendix I `ghost_bid_import_pair_count_exceeded`; D-AS supplemental summary row. |

## Changes Verified

- §4.4.17 `source_file_byte_size`, `raw_text`, and `parsed_qa_pairs_json` rows cite §39 instead of restating file-size, text-length, or JSON-payload caps.
- §4.4.17 parser transitions reject output above §39 `GhostBidImport.parsed_qa_pairs` with `ghost_bid_import_pair_count_exceeded`.
- §39 owns `GhostBidImport.parsed_qa_pairs`.
- §48.7.2 cites §39 for GhostBidImport file-size and parsed-pair behavior.
- Appendix I registers `ghost_bid_import_pair_count_exceeded`.
- §M.5.38 registers runtime-active `ghost_bid_import_size_single_source`.
- `_audit/DEFECT_LEDGER.md` marks D-2.2-031 and D-AS-010 remediated.
- `_audit/REMEDIATION_BACKLOG.md`, `_audit/V711_BACKLOG_INDEX.md`, `_integration/AUTHORED_EXTENSIONS_LEDGER.md`, and `_integration/RECONCILIATION.md` record the closure and residual Phase 2.2 scope.

## Backup Evidence

- `_versions/Sourcera_Master_Spec_pre-2026-06-22-phase-2-2-ghost-bid-size-singleton.md` md5 `4d602ef91d36afb759dcc96bccbd1efa`
- `_versions/DEFECT_LEDGER_pre-2026-06-22-phase-2-2-ghost-bid-size-singleton.md` md5 `db5b40ff41e7de6df01e344e2a264f7e`
- `_versions/REMEDIATION_BACKLOG_pre-2026-06-22-phase-2-2-ghost-bid-size-singleton.md` md5 `0dca3fa641c21f3bfb2196a3601bda41`
- `_versions/V711_BACKLOG_INDEX_pre-2026-06-22-phase-2-2-ghost-bid-size-singleton.md` md5 `82a4a842cb5539c979dd730e2dad18f3`
- `_versions/RECONCILIATION_pre-2026-06-22-phase-2-2-ghost-bid-size-singleton.md` md5 `78d7e5e5bce4bca774e7678673b2509a`
- `_versions/AUTHORED_EXTENSIONS_LEDGER_pre-2026-06-22-phase-2-2-ghost-bid-size-singleton.md` md5 `b18938c652e63d564d3d652c0acc0820`

## Verification Commands

```bash
npm exec -- tsx gates/ghost_bid_import_size_single_source.ts --spec ../../Sourcera_Master_Spec.md --no-emit
npm run typecheck
npm run all -- --no-emit
rg -n '^\\| D-[^|]+ \\| P1 \\|[^\\n]*\\| open \\|' _audit/DEFECT_LEDGER.md | wc -l
```

## Verified Results

- Direct gate: pass, 0 findings.
- Typecheck: pass.
- Full spec-lint: all blocking gates pass, including `ghost_bid_import_size_single_source`.
- Advisory-only findings remain unchanged in class: `solo_tier_numeric_single_source` (52), `retention_singleton_section_40_2_canonical` (124), and `section_anchor_slug_no_colon` (13).
- Direct DEFECT_LEDGER regex count: 397 open P1 rows after D-2.2-031 closure.

## Residuals

Adjacent Phase 2.2 P1 rows remain open and are not part of this closure:

- D-2.2-027
- D-2.2-029
- D-2.2-030
- D-2.2-043 through D-2.2-047
