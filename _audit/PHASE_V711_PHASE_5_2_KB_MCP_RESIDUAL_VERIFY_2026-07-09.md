# v7.1.1 Phase 5.2 KB / MCP Residual P2/P3 Closure Verification

**Date:** 2026-07-09  
**Scope:** D-5.2-007, D-5.2-008, D-5.2-010, D-5.2-011, D-5.2-012, D-5.2-013, D-5.2-014, D-5.2-016, D-5.2-019, D-5.2-020

## Result

All ten documentation rows are remediated. Exact-status posture moves from 485 to 477 open P2 and from 166 to 164 open P3. P0, P1, and blocked P1 remain zero.

The Master Spec now carries:

- Separate KBEntry ingestion and KBDocument upload-channel contracts.
- KBEntry `Vector(1024)` plus explicit Voyage `output_dimension=1024` and dimension-matched version-migration rules.
- Complete ordinary and authorized-override `exclude_review_states` behavior.
- Concrete request/response examples for `document_library_find`, `capability_find`, `capability_declare_draft`, and `cite_verify`.
- Per-tool MCP error blocks and a canonical §22.8.6 applicability matrix.
- Appendix I auth, evidence, and cross-Org error registrations plus a corrected 30-minute `stale_attach_ref` TTL.
- Historical-only treatment of the retired KB Engineering Spec's 10-requests/second `cite_verify` value; current authority remains 60 requests/second.
- Runtime-active `kb_mcp_phase52_residual_contract_completeness` in §M.5.80.

## Conflicts resolved

The retired KB Engineering Spec's 10-requests/second `cite_verify` value conflicted with current Master Spec §22.8.4.7 / §22.8.6 at 60 requests/second. The current Master Spec controls; the retired value is historical provenance only.

D-5.2-014 requested 1,536 dimensions, but current official [Voyage embeddings documentation](https://docs.voyageai.com/docs/embeddings) lists 2,048, 1,024, 512, and 256 for `voyage-3-large`, with 1,024 as the default. The v1 column and requests now pin 1,024.

Appendix I's five-minute `stale_attach_ref` TTL conflicted with §22.8.4.3 / §22.8.4.4 at 30 minutes. The tool contract controls, and Appendix I now matches it.

The filed `review_due` exclusion recommendation conflicted with current retrieval semantics. Ordinary retrieval returns `active` and `review_due`; only `review_overdue` and `flagged_stale` are privileged override states.

The MCP `capability_declare_draft` no-auto-publish rule remains intact. Seller Solo / Free direct materialization is a separate §22.20.2 engine path and writes the canonical §4.4.4 / Appendix L.17 transition directly.

D-5.2-016 and D-5.2-019 were stale-open: current §22.3.1 / §22.5 consume `win_rate_weight`, and Appendix J already registers `kb_namespace_migration`.

## Verification

```zsh
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/kb_mcp_phase52_residual_contract_completeness.ts --spec Sourcera_Master_Spec.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/kb_mcp_phase52_residual_contract_completeness.ts --fixture tools/spec-lint/fixtures/kb_mcp_phase52_residual_contract_completeness/pass.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/kb_mcp_phase52_residual_contract_completeness.ts --fixture tools/spec-lint/fixtures/kb_mcp_phase52_residual_contract_completeness/fail.md --no-emit
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
```

**Observed:** live gate PASS; positive fixture PASS; negative fixture FAIL with 22 expected findings; typecheck PASS; full spec-lint PASS. Exact-status scan returns 0 open P0, 0 open P1, 0 blocked P1, 477 open P2, and 164 open P3. Stamp gate parses 435 runtime rows, 287 `runtime_active`, and fails on the unchanged 146 product/runtime evidence blockers: 104 M11.3, 26 M21.3, 11 M02.3, and 5 M24.3.

**Authored Extension:** approved AE-V72REM-PH5P52-KB-MCP-P1-01 addendum.  
**Backups:** `_versions/Sourcera_Master_Spec.pre-phase52-kb-mcp-residual-closure-2026-07-09.md`, `_versions/AUTHORED_EXTENSIONS_LEDGER.pre-phase52-kb-mcp-residual-closure-2026-07-09.md`, `_versions/DEFECT_LEDGER.pre-phase52-kb-mcp-residual-closure-2026-07-09.md`, `_versions/REMEDIATION_BACKLOG.pre-phase52-kb-mcp-residual-closure-2026-07-09.md`.
