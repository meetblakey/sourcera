# Sourcera Spec-Lint

CI gate detectors for `Sourcera_Master_Spec.md` and `UX_Design_of_Sourcera.md`,
enforcing the §M.4 / §M.5 catalog contracts. Runs in
`.github/workflows/spec-lint.yml` on every PR that touches the spec.

## Layout

```
tools/spec-lint/
├── lib/                     # reusable harness
│   ├── types.ts             # enums + interfaces (RuntimeStatus, GateOutcome, SpecLintGate, ...)
│   ├── spec_loader.ts       # doc loader, heading/anchor parser, markdown-table parser
│   ├── overrides.ts         # @ci-gate-override: / @appendix-m-internal-only: grammar (§M.4.4)
│   ├── emit.ts              # §M.4.5 four-destination audit emitter + idempotency
│   └── gate.ts              # runner, CLI, fixture mode, makeSingletonGate factory
├── gates/                   # one file per detector (directly runnable)
├── fixtures/<gate_id>/      # pass.md + fail.md per gate (CI fixture proof)
├── observability/           # Datadog + PagerDuty monitors-as-code (§M.4.6)
├── run-all.ts               # batch runner (blocking runtime_active + advisory)
├── run-gate.ts              # single-gate dispatcher
├── audit_emit.ts            # §M.4.5 emit aggregator (workflow entrypoint)
├── appendix_k_canonicality.ts   # pre-existing runtime_active gate (Phase 2V)
└── cross_validation.ts          # pre-existing §M.4.4.2 cross-validator
```

## Gates in this harness (M02.3 runtime-active set)

**`runtime_active` (merge-blocking; verified PASS on the live Master Spec):**

| Gate | Archetype |
|---|---|
| `appendix_anchor_slug_no_colon` | single-pattern anchor-slug grep |
| `principle_9_anchor_canonicality` | multi-file cross-reference alias rejection |
| `appendix_i_internal_event_no_http_status` | named-subsection table-column-shape |
| `appendix_m_no_orphan_engine_concept` | Appendix M.1 Spec home resolution |
| `appendix_g_event_name_underscore_normalization` | Appendix G event-name normalization |
| `posthog_sampling_rate_enum_closed` | Appendix G sampling-rate enum closure |
| `defense_view_appendix_i_pairing` | named-error-code-set cross-reference resolution |
| `appendix_m5_runtime_status_coverage` | catalog self-consistency (enum coverage) |
| `appendix_m5_header_count_parity` | catalog self-consistency (row-count parity) |
| `eval_starter_appendix_i_pairing` | named-error-code-set cross-reference resolution |
| `appendix_m5_cross_reference_resolution_completeness` | catalog citation resolution |
| `solo_tier_numeric_single_source` | numerical-singleton grep |
| `retention_singleton_section_40_2_canonical` | retention-singleton grep |
| `section_anchor_slug_no_colon` | broad anchor-slug grep |
| `k_anon_floor_single_source` | numerical-singleton grep |
| `entity_console_field_or_scope_paragraph_required` | entity scope paragraph coverage |
| `ghost_bid_import_size_single_source` | numerical-singleton grep |
| `seller_maya_audit_action_namespace` | audit-action namespace consistency |
| `audit_event_schema_single_source_of_truth` | audit-event schema single-source check |
| `audit_log_scope_single_source` | audit-log scope single-source check |
| `appendix_c_webhook_catalog_completeness` | Appendix C Phase 6/10 webhook catalog completeness |
| `appendix_c_to_appendix_g_coverage` | Appendix C to Appendix G mirror coverage |
| `appendix_c_to_appendix_f_retry_class_coverage` | Appendix C to Appendix F retry-class coverage |
| `webhook_default_retry_class` | webhook retry-class default binding |
| `appendix_j_enum_completeness` | Appendix J Phase 6/10 enum completeness |
| `policy_ingestion_enum_canonical_consumer` | §12 Policy Ingestion enum consumer check |
| `appendix_l_policy_ingestion_state_machine_canonicality` | Appendix L Policy Ingestion state-machine canonicality |
| `policy_ingestion_webhook_catalog_completeness` | Policy Ingestion webhook / mirror / firewall catalog check |

**Advisory:** none. The AE ledger schema gates were promoted to blocking
runtime-active checks on 2026-06-30.

`solo_tier_numeric_single_source` and
`retention_singleton_section_40_2_canonical` are built on the shared
`makeSingletonGate` factory (Authoring Convention #10 — one kernel, two
singleton classes) and were promoted to blocking on 2026-06-24 after returning
0 findings on the live Master Spec plus pass/fail fixtures.

The eight Phase 6 / Phase 10 catalog-completeness gates above were promoted on
2026-06-24 after returning 0 findings on the live Master Spec. They are
spec-tree detectors for the §M.5.18 / §M.5.19 contracts and do not add product
runtime dependencies.

## Run locally

```bash
npm install                                   # installs tsx + typescript
# whole batch (from repo root):
npx tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --no-emit
# a single gate:
npx tsx tools/spec-lint/gates/principle_9_anchor_canonicality.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --no-emit
# against a fixture:
npx tsx tools/spec-lint/gates/appendix_anchor_slug_no_colon.ts --fixture tools/spec-lint/fixtures/appendix_anchor_slug_no_colon/fail.md --no-emit
```

Exit codes (fail-closed, §M.4.3): `0` pass / override_applied, `1` fail, `2` parse_error.

## Authoring a new gate

1. Add `gates/<gate_id>.ts` exporting a `SpecLintGate` (use `makeSingletonGate`
   for numerical-singleton gates, or implement `run(ctx)` directly).
2. Add `fixtures/<gate_id>/{pass.md,fail.md}`.
3. Verify it PASSES on the live Master Spec before promoting — a `runtime_active`
   gate must be green on the latest commit (§M.5.6 transition rule).
4. Add it to `GATES_RUNTIME_ACTIVE` (blocking) or `GATES_ADVISORY` in `run-all.ts`.
5. Flip its §M.5.4 `Runtime status` cell to `runtime_active` in the SAME PR
   (§M.5.6 / `Build_Execution_Strategy.md` per-pack closure protocol).
