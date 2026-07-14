# Phase v7.1.1 Pulse Digest Email Single-Source Runtime Promotion Verify

**Date:** 2026-07-07  
**Gate:** `pulse_digest_email_single_source`  
**Pack:** M02.3  
**Result:** PASS for direct detector, fixtures, typecheck, and full spec-lint. Stamp gate still fails on unrelated remaining runtime-evidence blockers.

## Scope

This pass promotes the Pulse Digest email single-source contract from `spec_binding_pending_pack_m02_3` to `runtime_active`.

The scope is spec-tree evidence only:

- §20.4 delegates the Pulse Digest template key, subject pattern, sender, Reply-To policy, opt-out class, compliance, unsubscribe, preview QA, bounce / complaint, suppression, and retry behavior to §41.1 through §41.5.
- §20.4 keeps only Pulse-specific schedule, audience, and content-section requirements.
- §20.7 acceptance criteria require §41, not §20, to own the email contract.
- §41.2 owns the `weekly_digest` row, subject pattern, sender, Reply-To policy, category, opt-out class, and Appendix C binding.
- §M.5.47 now carries the runtime-active detector path.

## Source Fixes

No new product behavior was authored. The existing §20.4 / §20.7 / §41.2 contract already matched the assertion; this pass added runtime detector evidence, pass/fail fixtures, and promoted the §M.5.47 row.

## Verification

| Check | Command | Result |
|---|---|---|
| Direct detector | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/pulse_digest_email_single_source.ts --spec Sourcera_Master_Spec.md --no-emit` | PASS, 0 findings |
| Pass fixture | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/pulse_digest_email_single_source.ts --fixture tools/spec-lint/fixtures/pulse_digest_email_single_source/pass.md --no-emit` | PASS, 0 findings |
| Fail fixture | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/pulse_digest_email_single_source.ts --fixture tools/spec-lint/fixtures/pulse_digest_email_single_source/fail.md --no-emit` | FAIL as expected, 15 findings |
| Typecheck | `cd tools/spec-lint && npm run typecheck` | PASS |
| Full spec-lint | `cd tools/spec-lint && npm run all -- --no-emit` | PASS |
| Stamp gate | `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json` | FAIL overall on 287 remaining blockers |

## Stamp-Gate Delta

| Metric | Before | After |
|---|---:|---:|
| Runtime rows parsed | 420 | 420 |
| `runtime_active` | 130 | 131 |
| `spec_binding_pending_pack_m02_3` | 155 | 154 |
| Total blockers | 288 | 287 |

Remaining blocker split after this pass:

| Pack | Blockers |
|---|---:|
| M02.3 | 154 |
| M11.3 | 102 |
| M21.3 | 26 |
| M24.3 | 5 |
