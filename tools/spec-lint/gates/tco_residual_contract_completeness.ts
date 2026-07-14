/**
 * Gate: `tco_residual_contract_completeness`
 * Source defects: D-4.6-017, D-4.6-021, D-4.6-023 through D-4.6-027,
 * and D-4.6-029.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { lineForToken } from "./catalog_gate_helpers.js";

const REQUIRED = [
  "{#15.2-tco-use-cases-and-pricing-requirements}",
  "{#15.5-tco-modeling-and-editing}",
  "| **TCO recalculation - post-configuration change** | p95 < 2s for a TCO Model containing up to 100 vendors and up to 100 active Pricing Requirements per vendor.",
  "### 15.6.3 Mobile Behavior",
  "Open on desktop to configure TCO",
  "`flat` and `one_time`",
  "`tiered`, `percentage_of_license`, `estimate_range`, and `discount`",
  "### 15.6.4 Selection Report Coupling",
  "§34.2.5",
  "`tco_appendix`",
  "Refresh and merge",
  "**Total Cost of Ownership (TCO).**",
  "**Pricing Requirement.**",
  "**TCO Use Case.**",
  "**Pricing Structure.**",
  "**Estimate Range.**",
  "**Percentage of License.**",
  "**Discount (pricing structure).**",
  "**`tco_value_weight`.**",
  "**`tco_percentile`.**",
  "| TCO Modeling | §15.2, §15.5, §4.3.28 (`TCOModel` entity) |",
  "| Pricing Requirement Authoring | §15.2, §4.3.28.1 |",
  "| TCO Configuration | §15.5, §4.3.28.2 |",
  "### TCO Configuration (Section 15\\)",
];

const FORBIDDEN = [
  "{#15.2-tco-use-cases-&-pricing-requirements}",
  "{#15.5-tco-modeling-&-editing}",
  "### TCO Configuration (Section 14\\)",
  "TCO Modeling (perpetual / subscription / consumption / custom)",
];

export const gate: SpecLintGate = {
  id: "tco_residual_contract_completeness",
  sourcePhase: "v7.1.1 Phase 4.6 TCO residual P2/P3 closure",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (const token of REQUIRED) {
      if (!doc.text.includes(token)) {
        findings.push({
          file: doc.path,
          line: 1,
          matched_text: token,
          message: "Required Phase 4.6 TCO residual contract is missing.",
        });
      }
    }

    const versionRows = doc.text.match(/^\| `version` \| Integer \| Required; starts at 1; increments atomically on each mutation \|/gm) ?? [];
    if (versionRows.length < 2) {
      findings.push({
        file: doc.path,
        line: lineForToken(doc, "| `version` | Integer |"),
        matched_text: "TCOModel.version and TCOConfiguration.version",
        message: "Both the TCOModel and TCOConfiguration field contracts must carry the optimistic-lock version.",
      });
    }

    for (const token of FORBIDDEN) {
      if (doc.text.includes(token)) {
        findings.push({
          file: doc.path,
          line: lineForToken(doc, token),
          matched_text: token,
          message: "Stale Phase 4.6 TCO heading, anchor, or Appendix M label remains active.",
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
