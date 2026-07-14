# Phase V711 Seller Public Pages Spec-Tree Runtime Promotion Verify - 2026-07-09

## Scope

Promoted six §4.4.3 / §4.4.9-§4.4.11 / §26 / §27 / §M.5.58 Seller Profiles / Public Pages M02.3 rows to `runtime_active`:

- `seller_profile_public_field_contract_completeness`
- `verification_tier_criteria_single_source`
- `capability_declaration_section_26_no_shadow_schema`
- `seller_page_enrichment_capability_id_single_source`
- `seller_software_unclaimed_stub_render_mode`
- `opt_out_http_response_single_source`

`seller_software_transfer_request_entity_home` remains pending under M11.3 because transfer execution, rollback, consent, namespace migration, serializer behavior, and runtime tests require product/runtime evidence.

## Gap Found

The cluster contained spec-tree rows that could be proven from the Master Spec and one transfer-workflow row that could not. Review also found live source-authority drift in §26.7.2: `seller_page_enrichment` pricing and minimum-plan literals were restated outside the §21.4.2 / §34.1.2 / §34.14.1 authority chain.

## Changes

- Added six spec-lint detectors under `tools/spec-lint/gates/`.
- Added pass/fail fixtures under `tools/spec-lint/fixtures/`.
- Wired all six gates into `tools/spec-lint/run-all.ts`.
- Promoted the six §M.5.58 rows to `runtime_active`.
- Normalized invalid row classes to valid harness classes where needed.
- Rewrote §26.7.2 to cite the canonical capability / pricing / plan-gate authority chain instead of restating literals.

## Verification

Fixture matrix:

| Gate | Pass fixture | Fail fixture |
|---|---:|---:|
| `seller_profile_public_field_contract_completeness` | PASS / 0 findings | FAIL / 23 findings |
| `verification_tier_criteria_single_source` | PASS / 0 findings | FAIL / 19 findings |
| `capability_declaration_section_26_no_shadow_schema` | PASS / 0 findings | FAIL / 18 findings |
| `seller_page_enrichment_capability_id_single_source` | PASS / 0 findings | FAIL / 24 findings |
| `seller_software_unclaimed_stub_render_mode` | PASS / 0 findings | FAIL / 16 findings |
| `opt_out_http_response_single_source` | PASS / 0 findings | FAIL / 12 findings |

Commands:

```bash
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md
npm --prefix tools/spec-lint exec tsx tools/release/stamp_gate.ts -- --json > _audit/_tmp/v711_stamp_gate_after_seller_public_pages.json
```

Results:

- TypeScript: PASS.
- Full spec-lint: PASS with 0 blocking findings.
- Stamp gate: FAIL only on unrelated pending runtime evidence.
- Stamp summary after promotion: 420 runtime rows; 262 `runtime_active`; 102 M11.3 blockers; 5 M24.3 blockers; 26 M21.3 blockers; 23 M02.3 blockers; 2 release-gate-only rows; 156 total blockers.
- All six promoted gate IDs are absent from the stamp-gate findings.

## Boundary

This promotion proves spec-tree Seller Profiles / Public Pages documentation consistency only. It does not claim public render runtime, APIs, serializers, crawl/enrichment workers, PostHog emission, CDN/WAF behavior, transfer workflows, rollback, consent, namespace migration, deploy validators, integration tests, or production runtime correctness.
