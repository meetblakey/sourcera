# Phase v7.1.1 Email Domain Spec-Tree Runtime Promotion Verify

**Date:** 2026-07-07
**Scope:** `email_spf_dkim_dmarc_citations_resolve`, `email_domain_entity_contract_completeness`, `email_retention_dsar_binding`, `email_volume_single_source`, `loops_provider_integration_contract_completeness`
**Mode:** M02.3 spec-tree detector promotion only.

## Source Fix

No Master Spec body contract was changed in this pass beyond §M.5 runtime-status promotion. The Phase 41 email-domain spec already carried the SPF / DKIM / DMARC, entity, retention / DSAR, volume single-source, and Loops provider contracts required for these five rows.

## Scope Boundary

This pass does not claim product-code, provider, delivery-worker, suppression-runtime, webhook, PostHog, Loops, DNS-verification, or deployed email-system proof.

Two Phase 41 rows remain pending by design:

- `email_type_catalog_coverage` remains pending for full Appendix C email-channel catalog normalization.
- `email_bounce_complaint_suppression_runtime` remains pending for runtime suppression proof.

## Artifacts

| Artifact | Status |
|---|---|
| `tools/spec-lint/gates/email_domain_gate_helpers.ts` | Added |
| `tools/spec-lint/gates/email_spf_dkim_dmarc_citations_resolve.ts` | Added |
| `tools/spec-lint/gates/email_domain_entity_contract_completeness.ts` | Added |
| `tools/spec-lint/gates/email_retention_dsar_binding.ts` | Added |
| `tools/spec-lint/gates/email_volume_single_source.ts` | Added |
| `tools/spec-lint/gates/loops_provider_integration_contract_completeness.ts` | Added |
| `tools/spec-lint/fixtures/<gate_id>/pass.md` and `fail.md` | Added for all five gates |
| `tools/spec-lint/run-all.ts` | All five gates registered in `GATES_RUNTIME_ACTIVE` |
| `Sourcera_Master_Spec.md` §M.5.45 | Five rows promoted to `runtime_active` |

## Verification

| Check | Result |
|---|---|
| Direct detector runs on `Sourcera_Master_Spec.md` | PASS, 0 findings for all five gates |
| Pass fixtures | PASS, 0 findings for all five gates |
| Fail fixtures | FAIL as expected: 10 / 29 / 13 / 9 / 15 findings |
| `npm --prefix tools/spec-lint run typecheck` | PASS |
| `npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md` | PASS |
| `tools/release/stamp_gate.ts --json` | FAIL overall, expected; remaining blockers now 256 |

## Stamp-Gate Delta

| Metric | Before | After |
|---|---:|---:|
| Total blockers | 261 | 256 |
| M02.3 blockers | 128 | 123 |
| M11.3 blockers | 102 | 102 |
| M21.3 blockers | 26 | 26 |
| M24.3 blockers | 5 | 5 |
| `runtime_active` rows | 157 | 162 |

## Remaining State

The v7.1.1 stamp gate is still blocked. Product-code / deploy / runtime rows remain pending and must not be promoted without their required pack evidence.
