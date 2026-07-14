# v7.1.1 Webhook Singleton Doc-Detector Runtime Promotion Verify

**Date:** 2026-07-07
**Scope:** M02.3 spec-tree detector promotion for two §M.5 singleton rows:

- `webhook_delivery_attempt_in_envelope`
- `webhook_event_id_canonical_format`

## Scope Boundary

These are documentation/spec-tree gates only. Product-codebase gates remain pending unless their own Convex / API / UI / deploy-validator evidence exists.

## Runtime Evidence

| Gate | Evidence |
|---|---|
| `webhook_delivery_attempt_in_envelope` | Detector added at `tools/spec-lint/gates/webhook_delivery_attempt_in_envelope.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS on live Master Spec. |
| `webhook_event_id_canonical_format` | Detector added at `tools/spec-lint/gates/webhook_event_id_canonical_format.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS on live Master Spec. The detector was narrowed to separate Markdown-safe tokens for §31.5 after the spec already carried the canonical `event_id` format cell. |

## Verification

| Check | Result |
|---|---|
| Direct detector runs | Pass, 0 findings for both gates. |
| `npm --prefix tools/spec-lint run typecheck` | Pass. |
| `npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md` | Pass, 0 blocking findings. |
| `tools/release/stamp_gate.ts --json` | Fails overall on remaining runtime-evidence blockers. Current parse: 420 runtime rows; 357 blockers. |

## Stamp-Gate Delta

| Owning pack | Remaining blockers |
|---|---:|
| `m02_3` | 224 |
| `m11_3` | 102 |
| `m21_3` | 26 |
| `m24_3` | 5 |

**Disposition:** The two rows above are promoted to `runtime_active`. No product-codebase row was promoted.
