/**
 * Gate: `kb_citation_in_closed_bid_attributed_registered`
 *
 * Assertion: Appendix G registers `kb_citation_in_closed_bid_attributed`
 * with the canonical payload and idempotency key, and §51 consumes that same
 * event for the KB ROI panel and AC-9 join test.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { findLine, m5RuntimeActiveFindings, push } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "kb_citation_in_closed_bid_attributed_registered";

const APPENDIX_G_TOKENS = [
  "`kb_citation_in_closed_bid_attributed` event registration",
  "Fires when a KBEntry is cited by a bid response that subsequently reaches a closed-bid outcome",
  "Payload schema:",
  "seller_org_id",
  "kb_entry_id",
  "bid_workspace_id",
  "bid_outcome ∈ {won, lost, withdrawn}",
  "fires exactly once per `(kb_entry_id, bid_workspace_id)` pair",
  "Idempotency key: `(kb_entry_id, bid_workspace_id)`",
  "§51.5.3 KB Utilization Panel",
  "§51.5.6 AC-9 integration test",
  "DSAR cascade: pseudonymized via standard pattern",
  "Residency: partition by Seller Org's `residency_region`",
  "CI gate `kb_citation_in_closed_bid_attributed_registered`",
];

const KB_ROI_TOKENS = [
  "| KB ROI |",
  "`kb_citation_in_closed_bid_attributed`",
  "registered under `seller_kb` event family at §22.18 KB Value Capture",
  "Appendix G → KB Value Capture Events subsection",
  "cross-family consumption per §51.1.5 cross-reference table",
];

const AC9_TOKENS = [
  "KB ROI panel joins `kb_citation_in_closed_bid_attributed` to bid outcome",
  "integration test with 10 synthesized bids",
];

function requireLineTokens(
  findings: Finding[],
  doc: SpecDoc,
  label: string,
  predicate: (line: string) => boolean,
  tokens: readonly string[],
) {
  const row = findLine(doc, predicate);
  if (!row) {
    push(findings, doc, 0, label, `${label} is missing.`);
    return;
  }
  for (const token of tokens) {
    if (!row.text.includes(token)) push(findings, doc, row.line, token, `${label} is missing required token: ${token}`);
  }
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM V13",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    requireLineTokens(
      findings,
      doc,
      "Appendix G kb_citation_in_closed_bid_attributed event registration",
      (line) => line.includes("**`kb_citation_in_closed_bid_attributed` event registration.**"),
      APPENDIX_G_TOKENS,
    );

    requireLineTokens(
      findings,
      doc,
      "§51.5.3 KB ROI row",
      (line) => line.startsWith("| KB ROI |"),
      KB_ROI_TOKENS,
    );

    requireLineTokens(
      findings,
      doc,
      "§51.5.6 AC-9",
      (line) => line.startsWith("9. KB ROI panel joins"),
      AC9_TOKENS,
    );

    findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
