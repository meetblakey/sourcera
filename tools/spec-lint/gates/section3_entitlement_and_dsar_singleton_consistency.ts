/**
 * Gate: `section3_entitlement_and_dsar_singleton_consistency`
 *
 * Assertion: Section 3 cites entitlement and DSAR authority instead of
 * restating stale tier lists or a 72-hour erasure deadline.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "section3_entitlement_and_dsar_singleton_consistency";

function forbidTokens(findings: Finding[], doc: SpecDoc, anchor: string, label: string, tokens: readonly string[]) {
  const scope = sectionTextByAnchor(doc, anchor);
  if (!scope) {
    push(findings, doc, 0, label, `${label} section is missing.`);
    return;
  }
  for (const token of tokens) {
    if (scope.text.includes(token)) push(findings, doc, scope.startLine, token, `${label} retains stale inline authority: ${token}`);
  }
}

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "3.7-loading-empty-error-state-catalog"), "§3.7 Support recovery authority", [
    "available on every paid tier per §34.1 cell **Support**",
  ]);
  forbidTokens(findings, doc, "3.7-loading-empty-error-state-catalog", "§3.7 Support recovery authority", [
    "Starter, Growth, Scale, Enterprise",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "3.10-bulk-action-toolbar"), "§3.10 Triage SLA entitlement authority", [
    "SLA change (per §34.1.1 / §34.1.2 cell **SLA timers**)",
  ]);
  forbidTokens(findings, doc, "3.10-bulk-action-toolbar", "§3.10 Triage SLA entitlement authority", [
    "SLA change (paid tiers only",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "3.12-presence-and-unread-tracking"), "§3.12 DSAR fulfillment authority", [
    "§6.8.6 fulfillment window",
  ]);
  forbidTokens(findings, doc, "3.12-presence-and-unread-tracking", "§3.12 DSAR fulfillment authority", [
    "72-hour DSAR target",
  ]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Section 3 entitlement and DSAR singleton closure",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
