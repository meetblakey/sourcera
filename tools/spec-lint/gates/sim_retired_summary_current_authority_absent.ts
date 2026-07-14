/** Gate: retired Master Summary C.100 may remain only as explicit history. */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const RETIRED_SIM_REF = /(?:Summary\s+C\.100|Summary\s+§2\.3\.5|§C\.100|\bC\.100\b)/;

function isAllowedHistoricalReference(line: string): boolean {
  const normalized = line.toLowerCase();
  return (
    line.includes("| `C.NN` (bare) |") ||
    line.includes("Master Summary §2.3.5 (SIM concept narrative)") ||
    (normalized.includes("retired master summary") && normalized.includes("historical provenance")) ||
    (line.includes("Retired Master Summary C.100") && line.includes("historical seed provenance only"))
  );
}

export const gate: SpecLintGate = {
  id: "sim_retired_summary_current_authority_absent",
  sourcePhase: "v7.1.1 SIM source-authority cleanup",
  rowClass: "content_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    const lines = ctx.masterSpec.text.split(/\r?\n/);

    lines.forEach((line, index) => {
      const match = line.match(RETIRED_SIM_REF);
      if (!match || isAllowedHistoricalReference(line)) return;
      findings.push({
        file: ctx.masterSpec.path,
        line: index + 1,
        matched_text: match[0],
        message: "Retired Master Summary C.100 is cited as current SIM authority; use §48.4.10 / §50.15 or label the reference historical.",
      });
    });

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
