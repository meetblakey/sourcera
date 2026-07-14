/**
 * Gate: `policy_ingestion_enum_canonical_consumer`
 * Source phase: v7.2.0-REM Phase 10 (§M.5.19)
 *
 * Assertion: §12 Policy Ingestion consumes the Appendix J enum names and uses
 * `custom_other` as the only open-ended framework fallback.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { lineForToken } from "./catalog_gate_helpers.js";

const REQUIRED_ENUMS = [
  "policy_framework_kind",
  "policy_framework_confidence_band",
  "policy_framework_inference_outcome",
  "policy_custom_use_case_category",
  "policy_dedup_action",
  "policy_amendment_state",
  "policy_ingestion_job_status",
];

export const gate: SpecLintGate = {
  id: "policy_ingestion_enum_canonical_consumer",
  sourcePhase: "v7.2.0-REM Phase 10",
  rowClass: "meta_catalog_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const startLine = lineForToken(doc, "## 12.1 Overview");
    const endLine = lineForToken(doc, "## 13.");
    if (!startLine || !endLine || endLine <= startLine) {
      return [{
        file: doc.path,
        line: 0,
        anchor: "12",
        message: "§12 Policy Ingestion section is missing; cannot verify enum consumers.",
      }];
    }
    const text = doc.lines.slice(startLine, endLine).join("\n");
    const findings: Finding[] = [];
    for (const enumName of REQUIRED_ENUMS) {
      if (!text.includes(`Appendix J \`${enumName}\``)) {
        findings.push({
          file: doc.path,
          line: lineForToken(doc, enumName),
          anchor: "12",
          matched_text: enumName,
          message: `§12 must consume Appendix J ${enumName} by name.`,
        });
      }
    }
    if (!text.includes("`custom_other` is the only fallback")) {
      findings.push({
        file: doc.path,
        line: lineForToken(doc, "custom_other"),
        anchor: "12",
        matched_text: "custom_other",
        message: "§12 must preserve custom_other as the only open-ended policy framework fallback.",
      });
    }
    if (/\b(PENDING_REVIEW|APPROVED|REJECTED|PENDING_REFINEMENT|ACTIVE)\b/.test(text)) {
      findings.push({
        file: doc.path,
        line: startLine,
        anchor: "12",
        message: "§12 reintroduced Title-Case / uppercase PolicyAmendment states; use lowercase Appendix J policy_amendment_state values.",
      });
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
