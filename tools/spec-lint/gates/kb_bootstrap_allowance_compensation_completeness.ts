/** Local spec-contract half of the KB Bootstrap compensation gate. */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { findLine, m5PendingLocalGuardFindings, push, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "kb_bootstrap_allowance_compensation_completeness";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "48.8.13-kb-bootstrap-allowance-compensation-contract"), "§48.8.13 KB Bootstrap compensation", [
    "`firecrawl_outage_degraded_kb_bootstrap`",
    "`claude-opus-4-6`",
    "`provider_kind = 'convex'`",
    "`kb_draft_entry_count` is < 10",
    "`kb_bootstrap.allowance_restored",
    "`POST /v1/ops/seller-orgs/{org_id}/kb-bootstrap/refund`",
    "`ops_growth_admin` or `ops_finance_admin`",
  ]);
  const enumRow = findLine(doc, (line) => line.startsWith("**`kb_bootstrap_restoration_reason`**"));
  for (const token of ["`firecrawl_outage`", "`anthropic_rate_limit`", "`convex_partition`", "`useful_bootstrap_floor_miss`"]) {
    if (!enumRow?.text.includes(token)) push(findings, doc, enumRow?.line ?? 0, token, `Appendix J kb_bootstrap_restoration_reason is missing ${token}.`);
  }
  const emailRow = findLine(doc, (line) => line.startsWith("| KB Bootstrap Allowance Restored |"));
  for (const token of ["`kb_bootstrap_allowance_restored`", "Tier-2 retry", "§48.8.13"]) {
    if (!emailRow?.text.includes(token)) push(findings, doc, emailRow?.line ?? 0, token, `§41.2 KB Bootstrap restoration email is missing required registration: ${token}`);
  }
  findings.push(...m5PendingLocalGuardFindings(doc, GATE_ID, ["deployed Convex, endpoint, audit, and delivery evidence remains required"]));
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
