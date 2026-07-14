# v7.1.1 Pipeline Surface Doc-Detector Runtime Promotion Verify

**Date:** 2026-07-07
**Scope:** M02.3 spec-tree detector promotion for two Phase 14.6 Pipeline Surface Compression rows:

- `pipeline_surface_compression_engine_unchanged`
- `pipeline_surface_compression_no_separate_seller_phase_counter`

## Scope Boundary

These are documentation/spec-tree gates only. Product-codebase gates remain pending unless their own Convex / API / UI / deploy-validator evidence exists.

## Runtime Evidence

| Gate | Evidence |
|---|---|
| `pipeline_surface_compression_engine_unchanged` | Detector added at `tools/spec-lint/gates/pipeline_surface_compression_engine_unchanged.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS on live Master Spec. |
| `pipeline_surface_compression_no_separate_seller_phase_counter` | Detector added at `tools/spec-lint/gates/pipeline_surface_compression_no_separate_seller_phase_counter.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS on live Master Spec + UX spec. |

## Verification

| Check | Result |
|---|---|
| Direct detector runs | Pass, 0 findings for both gates. |
| `npm --prefix tools/spec-lint run typecheck` | Pass. |
| `npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md` | Pass, 0 blocking findings. |
| `tools/release/stamp_gate.ts --json` | Fails overall on remaining runtime-evidence blockers. Current parse: 420 runtime rows; 355 blockers. |

## Stamp-Gate Delta

| Owning pack | Remaining blockers |
|---|---:|
| `m02_3` | 222 |
| `m11_3` | 102 |
| `m21_3` | 26 |
| `m24_3` | 5 |

**Disposition:** The two rows above are promoted to `runtime_active`. No product-codebase row was promoted.
