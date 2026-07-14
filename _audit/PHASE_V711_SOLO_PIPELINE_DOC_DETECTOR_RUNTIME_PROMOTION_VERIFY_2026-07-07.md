# v7.1.1 Solo / Pipeline Doc-Detector Runtime Promotion Verify

**Date:** 2026-07-07
**Scope:** M02.3 spec-tree detector promotion for two §M.5 rows:

- `solo_mode_appendix_m_coverage`
- `pipeline_surface_compression_team_mode_unchanged_buyer`

## Scope Boundary

These are documentation/spec-tree gates only. Product-codebase gates remain pending unless their own Convex / API / UI / deploy-validator evidence exists.

## Runtime Evidence

| Gate | Evidence |
|---|---|
| `solo_mode_appendix_m_coverage` | Detector added at `tools/spec-lint/gates/solo_mode_appendix_m_coverage.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS on live Master Spec. |
| `pipeline_surface_compression_team_mode_unchanged_buyer` | Detector added at `tools/spec-lint/gates/pipeline_surface_compression_team_mode_unchanged_buyer.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS on live Master Spec + UX spec. |

## Verification

| Check | Result |
|---|---|
| Direct detector runs | Pass, 0 findings for both gates. |
| `npm --prefix tools/spec-lint run typecheck` | Pass. |
| `npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md` | Pass, 0 blocking findings. |
| `tools/release/stamp_gate.ts --json` | Fails overall on remaining runtime-evidence blockers. Current parse: 420 runtime rows; 368 blockers. |

## Stamp-Gate Delta

| Owning pack | Remaining blockers |
|---|---:|
| `m02_3` | 235 |
| `m11_3` | 102 |
| `m21_3` | 26 |
| `m24_3` | 5 |

**Disposition:** The two rows above are promoted to `runtime_active`. No product-codebase row was promoted.
