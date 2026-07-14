/**
 * Gate: `responsive_mobile_ci_gate_catalog_completeness`
 *
 * Assertion: §38 responsive/mobile CI references resolve to §M.5 rows and
 * pack assignments without promoting runtime/UI evidence rows.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  requireDocTokens,
  requireM5RowTokens,
  requireRuntimeActive,
  RESPONSIVE_SOURCE_PHASE,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "responsive_mobile_ci_gate_catalog_completeness";

const REQUIRED_TOKENS = [
  "Every top-level route (§3.7 `page_surface_kind` × route) MUST pass an automated `responsive_conformance_suite` test",
  "The `tap_count_probe` CI job (§38.7.4) MUST run against these 20 workflows.",
  "No Sourcera production release MAY ship if any of the following is true:",
  "1. `tap_count_probe` CI job failing against ≥1 of the 20 workflows at `mobile_xs` or `mobile_sm` tier.",
  "2. `feature_parity_matrix_completeness` CI job failing (a new feature was added without a matrix row).",
  "4. `responsive_conformance_suite` failing at any of the 5 canonical widths (375, 720, 820, 1200, 1440 px).",
  "The gate is enforced at the CI layer via the `release_gate_assert` job",
  "### 50.14.14 Mobile Feature Parity Dashboard {#50.14.14-mobile-feature-parity-dashboard}",
  "**Purpose:** canonical Ops target for §38.8.2 matrix completeness, `feature_parity_matrix_completeness`, `spec_matrix_lint`, `tap_count_probe`, and release-gate assertion output.",
] as const;

const M5_ROWS: Array<[string, readonly string[]]> = [
  ["responsive_conformance_suite", ["spec_binding_pending_pack_m21_3", "M21.3", "ui_e2e + visual_regression"]],
  ["tap_count_probe", ["spec_binding_pending_pack_m21_3", "M21.3", "ui_e2e + nightly_full_sweep"]],
  ["feature_parity_matrix_completeness", ["**`runtime_active`**", "tools/spec-lint/gates/feature_parity_matrix_completeness.ts", "verified PASS on live Master Spec and pass/fail fixtures"]],
  ["release_gate_assert", ["spec_binding_release_gate_only", "release-orchestration", "release_branch_gate"]],
  ["spec_matrix_lint", ["**`runtime_active`**", "tools/spec-lint/gates/spec_matrix_lint.ts", "verified PASS on live Master Spec and pass/fail fixtures"]],
];

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: RESPONSIVE_SOURCE_PHASE,
  rowClass: "catalog_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec, "Responsive/mobile CI gate catalog", REQUIRED_TOKENS);
    for (const [gateId, tokens] of M5_ROWS) requireM5RowTokens(findings, ctx.masterSpec, gateId, tokens);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
