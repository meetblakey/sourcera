/**
 * Gate: `responsive_dashboard_anchor_resolution`
 *
 * Assertion: §38 responsive artifact references resolve to §50.14.13 and
 * §50.14.14, not unrelated Growth PM or GTM Lead dashboards.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  rejectSectionTokensByAnchor,
  requireDocTokens,
  requireRuntimeActive,
  RESPONSIVE_SOURCE_PHASE,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "responsive_dashboard_anchor_resolution";

const REQUIRED_TOKENS = [
  "Conformance results are aggregated into the Responsive Tier Conformance Dashboard (§50.14.13).",
  "Uploaded to the Responsive Tier Conformance Dashboard (§50.14.13).",
  "A missing row is a CI failure in the `feature_parity_matrix_completeness` job and is reported on the Mobile Feature Parity Dashboard (§50.14.14).",
  "### 50.14.13 Responsive Tier Conformance Dashboard {#50.14.13-responsive-tier-conformance-dashboard}",
  "**Purpose:** canonical Ops target for §38.6.5 `responsive_conformance_suite` artifacts, §38.7.4 tap-probe artifacts, and §38.6.7 mobile performance budget signals.",
  "### 50.14.14 Mobile Feature Parity Dashboard {#50.14.14-mobile-feature-parity-dashboard}",
  "**Purpose:** canonical Ops target for §38.8.2 matrix completeness, `feature_parity_matrix_completeness`, `spec_matrix_lint`, `tap_count_probe`, and release-gate assertion output.",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: RESPONSIVE_SOURCE_PHASE,
  rowClass: "content_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec, "Responsive dashboard anchor resolution", REQUIRED_TOKENS);
    rejectSectionTokensByAnchor(
      findings,
      ctx.masterSpec,
      "38.-responsive-design-and-platform-support",
      "§38 Responsive Design",
      ["Growth PM", "GTM Lead", "§50.14.3", "§50.14.4"],
    );
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
