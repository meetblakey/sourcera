# M02.3 Runtime-Wiring — Classification & Build-Out Plan

**Program:** v7.2.0-REM → M02.3 Runtime-Wiring Pass
**Date:** 2026-06-15
**Authority:** `Build_Execution_Strategy.md` §11 (M02.3 milestone); `Sourcera_Master_Spec.md` §M.4 / §M.5 (CI gate contracts); `Linear_Execution_Blueprint.md` §5.
**Related:** `_integration/RECONCILIATION.md → v7.2.0-REM Program → M02.3 Runtime-Wiring Pass (2026-06-15)`; `_integration/AUTHORED_EXTENSIONS_LEDGER.md → … M02.3 Runtime-Wiring Pass`; `_audit/PHASE_V72REM_M02_3_VERIFY.md`; `_audit/DEFECT_LEDGER.md → v7.2.0-REM M02.3 Runtime-Wiring Pass`.

---

## 1. The honesty contract (why this pass is scoped the way it is)

§M.5 defines `runtime_active` (Appendix J `ci_gate_runtime_status`; Master Spec L51713) as: *the gate's runtime artifact exists in the CI/production pipeline AND has run — green — on the most recent main-branch commit (spec-tree gates) or deploy (runtime gates) or scheduled run (monitors) AND the run record is ingested by the §42 observability stack.* The §M.5.6 transition rule adds: a row flips to `runtime_active` **in the same PR that lands the runtime artifact** and only after the first run completes successfully.

Two consequences govern this entire pass:

1. **A gate whose scan target is the product codebase cannot be `runtime_active` in this repository.** This folder is the specification corpus (`Sourcera_Master_Spec.md`, `UX_Design_of_Sourcera.md`, the appendices, the `_integration/` ledgers) plus the spec-lint tooling that lints it. It contains **no** Convex backend, GraphQL schema, REST handlers, RBAC enum declarations, MFA code paths, DSAR cascade-walker, or EvalStarter registry. A detector authored here for those gates would scan nothing and pass vacuously — a **false** `runtime_active` stamp that the `v7_1_1_stamp_gate_runtime_status_audit` release gate is explicitly built to catch.
2. **A spec-tree gate cannot be `runtime_active` while the live spec fails it.** A detector that is correct (passes its fixtures) but reports findings on the current Master Spec is *working as designed* — but the gate is not green, so promotion would be dishonest. Such gates run **advisory / non-blocking** until the spec is remediated to green.

This pass therefore promotes **only** the spec-tree-lint gates that (a) scan documents present in this repo and (b) verify green on the live Master Spec + their CI fixtures. Everything else is held with a documented reason.

---

## 2. Classification of the 59 M02.3-tagged §M.5.4 gate rows

| Bucket | Count | Disposition this pass |
|---|---:|---|
| **A — Promoted to `runtime_active`** | 8 | Detector + fixtures + workflow wiring landed; §M.5.4 row flipped; verified PASS on live spec. *(Increment 1: 6; Increment 2 added `eval_starter_appendix_i_pairing` + `appendix_m5_cross_reference_resolution_completeness`.)* |
| **B — Advisory-held (spec-tree, detector built, live spec non-green)** | 3 | Detector + fixtures landed; runs advisory/non-blocking; stays `spec_binding_pending_pack_m02_3`; finding filed. *(Increment 2 added the new follow-on gate `section_anchor_slug_no_colon`.)* |
| **C — Spec-tree, buildable here, not yet built** | 35 | Future M02.3 spec-tree sub-passes (this repo). Archetype-mapped in §5. *(Increment 2 promoted 2 of the original 37.)* |
| **D — Product-codebase, NOT addressable in this repo** | 14 | Deferred to the product-repo M02.3 implementation pack. Stays `spec_binding_pending_pack_m02_3`. §6. |

> **Increment 2 (Fix-Everything, 2026-06-15) note.** Promoted total moved 6 → **8**; the retention detector bug was fixed (180 → 124 findings — the §6.8 false positives cleared, residual 124 are genuine §4 retention-literal debt for the V9/hygiene pass); a new advisory gate `section_anchor_slug_no_colon` was authored for D-V72REM-M023-002. See `_audit/PHASE_V72REM_M02_3_VERIFY.md §8` and `_integration/RECONCILIATION.md → … M02.3 Runtime-Wiring Pass → Increment 2`.

(59 = the §M.5.4 cluster. The broader M02.3 spec-tree backlog also includes the §M.5.18 catalog-completeness gates — `appendix_c_webhook_catalog_completeness`, `appendix_c_to_appendix_g_coverage`, `appendix_c_to_appendix_f_retry_class_coverage`, `webhook_default_retry_class`, `appendix_j_enum_completeness` — and the §M.5.19 §12 policy-ingestion gates, all `spec_binding_pending_pack_m02_3` and spec-tree-buildable; they fold into the §5 roadmap.)

### Bucket A — promoted (8)

`appendix_anchor_slug_no_colon`, `principle_9_anchor_canonicality`, `appendix_i_internal_event_no_http_status`, `defense_view_appendix_i_pairing`, `appendix_m5_runtime_status_coverage`, `appendix_m5_header_count_parity`, `eval_starter_appendix_i_pairing`, `appendix_m5_cross_reference_resolution_completeness`.

### Bucket B — advisory-held (3)

`solo_tier_numeric_single_source` (45 findings → D-V72REM-M023-003), `retention_singleton_section_40_2_canonical` (180 → **124** after the Increment-2 detector fix; residual genuine §4 debt → D-V72REM-M023-004), and `section_anchor_slug_no_colon` (new follow-on gate; 13 findings = §2.2/§10.x colon section anchors → D-V72REM-M023-002; §M.5 catalog row registers at promotion). The first two are built on the shared `makeSingletonGate` factory.

### Bucket D — product-codebase, deferred to product-repo M02.3 pack (14)

| Gate | Scan target (not in this repo) |
|---|---|
| `solo_mode_engine_field_not_in_seller_serializers` | Convex serializers + GraphQL + REST responses |
| `pipeline_surface_compression_no_separate_seller_phase_counter` | Codebase identifier grep |
| `eval_vertical_eval_starter_coverage` | EvalStarter registry seed (deploy-time) |
| `eval_starter_seed_schema_currency` | EvalStarter row writes |
| `eval_starter_seed_use_case_index_validity` | EvalStarter write-time validator |
| `eval_starter_marketplace_category_mapping_present` | EvalStarter row writes |
| `solo_capability_registry_field_registration` | §4.8.2 schema-validation test (Convex) |
| `mfa_enforcement_level_canonical_consumer` | MFA-policy code paths |
| `dsar_cascade_residency_partition_isolation` | DSAR cascade-walker code (static analysis) |
| `workspace_status_canonical_consumer` | active-workspace predicate code paths |
| `workos_raw_attributes_not_consumed` | codebase static-analysis |
| `fga_custom_role_scope_canonical_consumer` | RBAC role enum declarations (code) |
| `dsar_cascade_class_coverage_completeness` | §4 entity inventory static-analysis property test — promoted spec-side on 2026-07-07 via `tools/spec-lint/gates/dsar_cascade_class_coverage_completeness.ts`; product-schema parity remains covered by `dsar_cascade_per_row_idempotency_marker_completeness` |
| `dsar_cascade_per_row_idempotency_marker_completeness` | §4 entity schema static analysis |

Note: `dsar_cascade_class_coverage_completeness` was promoted spec-side on 2026-07-07 because the v7.1.1 stamp gate checks this repo's detector artifact path and the binding contract is the Master Spec §4 / §6.8.4.3 inventory. `dsar_cascade_per_row_idempotency_marker_completeness` and `solo_capability_registry_field_registration` still require product-schema parity evidence before promotion.

---

## 3. What landed this pass (runtime artifacts)

```
tools/spec-lint/
├── lib/{types,spec_loader,overrides,emit,gate}.ts   # reusable harness
├── gates/<gate_id>.ts                                # 8 detectors
├── fixtures/<gate_id>/{pass,fail}.md                 # 16 CI fixtures
├── observability/{datadog_monitors,pagerduty_rotation}.tf + README.md
├── audit_emit.ts            # §M.4.5 emit aggregator (closes the dangling workflow ref)
├── run-all.ts / run-gate.ts # batch + dispatcher (blocking vs advisory split)
├── package.json / package-lock.json / tsconfig.json / README.md / .gitignore
.github/workflows/spec-lint.yml                       # + "Run M02.3 spec-tree-lint batch" step
```

The harness generalizes the single-detector pattern previously embodied by `tools/spec-lint/appendix_k_canonicality.ts` into a framework. Key reusable pieces: `spec_loader` (heading/anchor/markdown-table parsers), `overrides` (§M.4.4.1/§M.4.4.5 grammar), `emit` (§M.4.5 four-destination + §M.4.5.3 idempotency), `gate` (runner + CLI + fixture mode + `makeSingletonGate` factory).

---

## 4. Archetype taxonomy (reuse map)

Every spec-tree gate reduces to one of these kernels. The harness covers all six; future gates mostly compose existing kernels.

| Archetype | Kernel | Proven by (this pass) |
|---|---|---|
| Single-pattern grep | line scan + regex | `appendix_anchor_slug_no_colon` |
| Multi-file cross-reference alias rejection | link-target regex over master+ux | `principle_9_anchor_canonicality` |
| Named-subsection table-column-shape | section-range + `parseTableAt` | `appendix_i_internal_event_no_http_status` |
| Named-set cross-reference resolution | token set × section ranges × Appendix table | `defense_view_appendix_i_pairing` |
| Numerical singleton | `makeSingletonGate` (regex set + allowed-home predicate + override) | `solo_tier_numeric_single_source`, `retention_singleton_section_40_2_canonical` |
| Catalog self-consistency meta-gate | catalog table parse + invariant | `appendix_m5_runtime_status_coverage`, `appendix_m5_header_count_parity` |

---

## 5. Build-out roadmap for the 37 remaining spec-tree gates (Bucket C)

Sequenced by archetype reuse (cheapest first) and dependency. Each sub-pass: author detector(s) → fixtures → run on live spec → promote only if green → else file finding + hold advisory.

**Wave 1 — catalog self-consistency meta-gates (2 gates; lowest risk, highest integrity).** `appendix_m5_cross_reference_resolution_completeness`, `appendix_m5_ae_row_enumeration_parity`. Reuse the §M.5-table parser already built for `appendix_m5_runtime_status_coverage`. Cross-reference resolution scans the spec body for `` Appendix M.5 `<id>` `` citations and resolves against the catalog; AE-row parity joins the AE ledger `gates_added[]` lists to §M.5 authority-anchor cites.

**Wave 2 — Appendix-pairing / completeness (Appendix I + J + C/G).** `eval_starter_appendix_i_pairing` (same kernel as `defense_view_appendix_i_pairing`), `appendix_i_billing_code_completeness`, `appendix_i_retryability_completeness`, `appendix_i_endpoint_cross_reference_completeness`, `error_code_localization_key_completeness`, `cooldown_status_convention`, `kb_export_console_firewall_status_consistency`, plus the §M.5.18 catalog-completeness set (`appendix_c_webhook_catalog_completeness`, `appendix_c_to_appendix_g_coverage`, `appendix_c_to_appendix_f_retry_class_coverage`, `webhook_default_retry_class`, `appendix_j_enum_completeness`). Note: several Appendix I completeness gates have V8.4 known-backfill scope (pre-2026-05-08 legacy rows) and will likely run **advisory** until the v7.1.1 Appendix-I backfill lands.

**Wave 3 — Appendix-M coverage gates.** `appendix_m_engine_to_surface_completeness`, `appendix_m_no_orphan_engine_concept`, `appendix_m_no_inline_engine_concepts_in_ux_spec`, `solo_mode_appendix_m_coverage`. These overlap the already-`runtime_active` `appendix_m_coverage_on_diff`; build as siblings that share its concept-class parser. Risk: the engine-to-surface completeness traversal is broad and may surface real coverage gaps → expect some advisory holds.

**Wave 4 — enum-membership / firewall invariants on §4.7.1.** `console_bridge_no_dsar_event_kinds`, `console_bridge_no_group_event_kinds`, `console_bridge_no_dsar_v9_event_kinds`. Single kernel: parse the §4.7.1 Console Bridge `event_kind` enum and assert no forbidden-domain value appears. (The runtime handler-registry half of these is M11.3, not M02.3.)

**Wave 5 — numerical singletons (extend the factory).** `solo_envelope_value_single_source`, `settlement_freeze_carveouts_canonical`, `cost_base_publish_gate_threshold_single_source`, `appendix_j_plan_tier_inline_string_retired`. All instantiate `makeSingletonGate`. Expect findings (cf. the Bucket-B advisory holds) → advisory until the v7.1.1 numerical-singleton hygiene pass.

**Wave 6 — diff-scoped invariants + i18n + analytics-enum.** `pipeline_surface_compression_engine_unchanged`, `pipeline_surface_compression_team_mode_unchanged_buyer`, `pipeline_surface_compression_step_to_phase_canonical`, `seller_maya_surface_abstraction_engine_unchanged`, `entity_retention_coverage_on_diff`, `dsar_cascade_pattern_default_row_retired`, `bridge_event_body_pii_sweep_completeness`, `audit_log_surfacing_cross_reference_consistency`, `solo_microcopy_template_parity`, `seller_activation_cohort_canonical_enum`, `rbac_role_name_canonicality`, `appendix_j_api_token_scope_endpoint_consistency`, `user_organization_attribute_disambiguation`, `audit_event_hash_chain_columns_present`, `solo_role_grid_inclusion`. The diff-scoped gates (`*_engine_unchanged`) require a merge-base diff (the harness already resolves merge-base in CI); the rest are grep/table/enum checks. `first_30_seconds_test_present_on_new_ux_surface` and `solo_billing_card_price_single_source` are UX-spec-scoped (the latter partly inspects UX component code → may split).

**Rough effort.** ~25 of the 37 reuse an existing kernel directly (≤½ day each incl. fixtures); ~8 need a new-ish parser branch (1 day); the broad `appendix_m_engine_to_surface_completeness` is the largest single item. Realistic cadence: 4–6 sub-passes.

---

## 6. The 14 product-codebase gates (Bucket D) — handoff to the product repo

These belong to the M02.3 implementation pack as built in the **product engineering repository** (Convex + Next.js + the spec-lint-style static analyzers that run against real code), per `Build_Execution_Strategy.md` §11 and the AGENTS.md per-pack convention. They remain `spec_binding_pending_pack_m02_3` here. The `v7_1_1_stamp_gate_runtime_status_audit` will require their pack-side artifacts at v7.1.1 stamp time. Splitting them out of this pass is the difference between an honest runtime-status ledger and a vacuously-green one.

---

## 7. Risks & edge-cases carried forward

- **Detector citation-breadth (D-V72REM-M023-004).** `retention_singleton_*` currently exempts only §40.2 cites; it should also exempt §6.8 / §34 cites (both allowed homes). Fix before promotion.
- **Numerical-singleton debt (D-V72REM-M023-003/-004).** The advisory holds reflect real spec debt, not detector error; promotion is gated on the v7.1.1 hygiene pass, not on rewriting the gates.
- **Section-anchor colons (D-V72REM-M023-002).** Out-of-charter sibling finding; motivates a `section_anchor_slug_no_colon` follow-on gate.
- **Aggregate count re-baseline.** Deferred to the v7.1.1 §M.5 hygiene pass per the §M.5.18 precedent; the running split (9 `runtime_active` / 171 / 1) is maintained in §M.5.6 + Appendix J.
- **`npm ci` lockfile.** `package-lock.json` is now committed so the workflow's `npm ci --prefix tools/spec-lint` resolves; keep it in sync when harness deps change.
- **Datadog/PagerDuty are declarative-only here.** `tools/spec-lint/observability/*.tf` is applied by the Ops Terraform pipeline; this pass made no live-account mutation. Replace the placeholder PagerDuty member IDs before first apply.
