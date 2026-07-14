# Appendix M Diff-Coverage Local Chain Verification

**Date:** 2026-07-12  
**Gate:** `appendix_m_coverage_on_diff`  
**Disposition:** Local spec-repo chain complete; runtime promotion not claimed.

## Before

- `appendix_m_coverage_on_diff.ts` always emitted zero concepts.
- `override_parser.ts`, `cosmetic_edit_filter.ts`, and `comment_poster.ts` were absent.
- `audit_emit.ts` passed mixed workflow JSON directly to the shared emitter and failed before writing a run record.
- The inventory reported only a nonexistent generic `tools/spec-lint/gates/appendix_m_coverage_on_diff.ts` path.

## After

- The detector compares merge-base and post-edit Markdown structures, filters comments / prose / whitespace / registered anchor aliases, and covers all twelve §M.4.2 concept classes.
- Same-diff M.1 rows satisfy coverage; orphan Appendix M.5 citations fail.
- The override parser enforces the exact target key, required phrase, 60-character floor, cross-class qualifiers, and duplicate rejection.
- The GitHub review poster uses canonical templates, honors accepted exact-key overrides, and fails closed.
- The audit aggregator emits one valid §M.4.5 result and records skipped external destinations honestly when secrets are absent.
- The workflow uses the correct push base SHA and external-delivery environment names.
- Inventory evidence now distinguishes present local files from absent product cron / AuditEvent / current-run proof.

## Verification

```text
npx tsx --test appendix_m_coverage_on_diff.test.ts override_parser.test.ts cosmetic_edit_filter.test.ts comment_poster.test.ts audit_emit.test.ts
14 tests passed

tools/spec-lint/node_modules/.bin/tsx --test tools/release/generate_runtime_blocker_inventory.test.ts
1 test passed

npm --prefix tools/spec-lint run typecheck
PASS

npm --prefix tools/spec-lint run all
blocking gates worst exit code: 0

tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --ledger _audit/DEFECT_LEDGER.md --json
0 P0 / 0 P1 / 0 P2 / 0 P3 open; 1,929 canonical rows

tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --spec Sourcera_Master_Spec.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --defect-ledger _audit/DEFECT_LEDGER.md --json
FAIL as required: 547 runtime rows; 333 active; 212 blockers
144 M11.3 / 39 M21.3 / 17 M02.3 / 12 M24.3
```

Final evidence snapshots:

- `_audit/_tmp/v711_exact_status_2026-07-12_appendix-m-chain-final.json`
- `_audit/_tmp/v711_stamp_gate_2026-07-12_appendix-m-chain-final.json`
- `_audit/_tmp/v711_ledger_taxonomy_2026-07-12_appendix-m-chain-final.json`
- `_audit/_tmp/v711_spec_lint_2026-07-12_appendix-m-chain.log`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.csv`

Active GTM / pricing / execution / UX stale-authority scan found zero current-authority claims for retired `Sourcera_Master_Summary.md`, retired `KB_Engineering_Spec.md`, or missing `What_is_Sourcera.md`. The stamp result contains zero Authored Extension blockers; lexical `pending` text in the AE ledger is schema or historical prose, not a current release blocker.

Fixture results:

- `pass.md`: one new field, same-diff M.1 row, outcome `pass`.
- `fail_missing_row.md`: outcome `needs_coverage`; poster exits 1 with one canonical review comment.
- `fail_orphan_gate.md`: outcome `orphan_inline_gate_reference`.
- Same-file live Master Spec comparison: zero triggered concepts and zero orphan references.

## Remaining blocker

`appendix_m_coverage_on_diff` remains `spec_binding_pending_pack_m02_3`. Missing current evidence:

- most recent main-branch required-check result;
- Convex AuditEvent, PostHog, and Datadog ingestion for that result;
- §M.4.6 nightly-digest execution;
- product-repo `convex/crons/appendix_m_gate_nightly_digest.ts` and `convex/audit/spec_lint_audit_event.ts` evidence;
- `tools/release/runtime_evidence/appendix_m_coverage_on_diff.json` current-run receipt.

No runtime promotion is authorized from the local tests alone.
