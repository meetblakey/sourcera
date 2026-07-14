/** Local spec-contract half of the Firecrawl outage render gate. */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5PendingLocalGuardFindings, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "firecrawl_outage_progress_line_substitution";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "48.8.3-onboarding-surface-minutes-0-3"), "§48.8.3 substitute progress line", [
    "reads `provider_health_state(firecrawl)` at line-render time",
    'line is replaced with the substitute line `"Drafting from your KB while we connect to your website…"`',
    "MUST NOT render",
    "§48.8.7 #7",
    "`stage_3_firecrawl_outage_pause_ms`",
    "Seller onboarding Stage-3 population-latency threshold",
  ]);
  findings.push(...m5PendingLocalGuardFindings(doc, GATE_ID, ["deployed render-path and Datadog evidence remains required"]));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 M02.3 local guard closure",
  rowClass: "content_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] { return findingsFor(ctx.masterSpec); },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
