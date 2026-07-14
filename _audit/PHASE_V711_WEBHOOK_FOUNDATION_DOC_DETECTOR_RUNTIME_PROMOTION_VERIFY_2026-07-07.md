# v7.1.1 Webhook Foundation Doc-Detector Runtime Promotion Verify

**Date:** 2026-07-07
**Scope:** M02.3 spec-tree detector promotion for five §M.5.23 rows:

- `webhook_event_version_in_envelope`
- `webhook_event_class_required_in_envelope`
- `webhook_4xx_no_retry`
- `webhook_secret_rotation_contract`
- `webhook_secret_plaintext_no_log`

## Scope Boundary

These are documentation/spec-tree gates only. Product-codebase gates remain pending unless their own Convex / API / UI / deploy-validator evidence exists.

## Conflict Closed

| Conflict | Resolution |
|---|---|
| §31.10 Rotation API allowed `seller_integrations_admin`, but §31.10 acceptance criterion #4 and Appendix I `webhook_secret_rotation_role_forbidden` omitted that role from the permitted set. | §31.10 AC #4 and Appendix I now use `{org_owner, org_admin, seller_integrations_admin, billing_admin}`, matching the Rotation API table, §5.11 Webhook Endpoint CRUD role posture, and Appendix K Seller Integrations Admin definition. |

## Runtime Evidence

| Gate | Evidence |
|---|---|
| `webhook_event_version_in_envelope` | Detector added at `tools/spec-lint/gates/webhook_event_version_in_envelope.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS on live Master Spec. |
| `webhook_event_class_required_in_envelope` | Detector added at `tools/spec-lint/gates/webhook_event_class_required_in_envelope.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS on live Master Spec. |
| `webhook_4xx_no_retry` | Detector added at `tools/spec-lint/gates/webhook_4xx_no_retry.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS on live Master Spec. |
| `webhook_secret_rotation_contract` | Detector added at `tools/spec-lint/gates/webhook_secret_rotation_contract.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS on live Master Spec. |
| `webhook_secret_plaintext_no_log` | Detector added at `tools/spec-lint/gates/webhook_secret_plaintext_no_log.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS on live Master Spec. |

## Verification

| Check | Result |
|---|---|
| Direct detector runs | Pass, 0 findings for all five gates. |
| `npm --prefix tools/spec-lint run typecheck` | Pass. |
| `npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md` | Pass, 0 blocking findings. |
| `tools/release/stamp_gate.ts --json` | Fails overall on remaining runtime-evidence blockers. Current parse: 420 runtime rows; 359 blockers. |

## Stamp-Gate Delta

| Owning pack | Remaining blockers |
|---|---:|
| `m02_3` | 226 |
| `m11_3` | 102 |
| `m21_3` | 26 |
| `m24_3` | 5 |

**Disposition:** The five rows above are promoted to `runtime_active`. No product-codebase row was promoted.
