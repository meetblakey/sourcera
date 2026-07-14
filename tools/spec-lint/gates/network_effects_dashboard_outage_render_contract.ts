/** Local spec-contract half of the network-effects outage render gate. */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5PendingLocalGuardFindings, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "network_effects_dashboard_outage_render_contract";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "48.3.8-third-party-outage-render-behavior"), "§48.3.8 outage render matrix", [
    "PostHog Live Insights outage",
    "Snowflake reverse-ETL outage",
    "Datadog metrics outage",
    "All three simultaneous",
    '"Stale (last refreshed Nh ago)"',
    '"Stale (rollup pending)"',
    '"Data pipeline temporarily unavailable — refresh"',
    '"Dashboard temporarily unavailable — Ops investigating"',
  ]);
  findings.push(...m5PendingLocalGuardFindings(doc, GATE_ID, ["deployed four-path render evidence remains required"]));
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
