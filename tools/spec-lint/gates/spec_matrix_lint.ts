/**
 * Gate: `spec_matrix_lint`
 *
 * Assertion: §38.8.2 mobile parity matrix rows have valid shape and status
 * values. Broad feature-section coverage remains `feature_parity_matrix_completeness`.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { push } from "./enterprise_security_gate_helpers.js";
import {
  requireDocTokens,
  requireRuntimeActive,
  sectionTableRowsByAnchor,
  RESPONSIVE_SOURCE_PHASE,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "spec_matrix_lint";
const VALID_STATUSES = new Set(["parity", "supported", "simplified", "not_supported"]);

const REQUIRED_TOKENS = [
  "### 38.8.2 Mobile Feature Parity Matrix {#38.8.2-mobile-feature-parity-matrix}",
  "| Feature | Desktop | Tablet | Mobile | Notes |",
  "### 38.8.3 Simplification Disclosure Contract {#38.8.3-simplification-disclosure-contract}",
  "| `simplified` | **Informational chip** at the top of the mobile feature surface:",
  "| `not_supported` (redirect permitted) | **Redirect banner** with continue/dismiss:",
  "| `not_supported` (hard block) | **Hard redirect** to the `/:console/mobile-unsupported` informational page",
  "**Destructive destructive-exception workflows (tracked separately, 6-tap ceiling).**",
  "8. Destructive-exception workflows MUST NOT exceed 6 taps; `destructive_exception=true` MUST be set in fixtures and the runtime-probe event.",
] as const;

function lintMatrixRows(findings: Finding[], doc: GateContext["masterSpec"]): void {
  const rows = sectionTableRowsByAnchor(findings, doc, "38.8.2-mobile-feature-parity-matrix", "§38.8.2 Mobile Feature Parity Matrix");
  for (const row of rows) {
    const [feature, desktop, tablet, mobile, notes] = row.cells;
    if (!feature || feature.startsWith("**")) continue;
    if (row.cells.length !== 5) {
      push(findings, doc, row.line, row.cells.join(" | "), "§38.8.2 matrix row must have exactly 5 cells.");
      continue;
    }
    for (const [label, value] of [
      ["Desktop", desktop],
      ["Tablet", tablet],
      ["Mobile", mobile],
    ] as const) {
      if (!VALID_STATUSES.has(value)) {
        push(findings, doc, row.line, value, `§38.8.2 ${label} status must resolve to Appendix J mobile_feature_parity_status.`);
      }
    }
    if ((tablet === "simplified" || mobile === "simplified" || tablet === "not_supported" || mobile === "not_supported") && !notes) {
      push(findings, doc, row.line, feature, "§38.8.2 simplified/not_supported rows require non-empty Notes.");
    }
  }
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: RESPONSIVE_SOURCE_PHASE,
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec, "§38.8.2 matrix lint", REQUIRED_TOKENS);
    lintMatrixRows(findings, ctx.masterSpec);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
