/**
 * Gate: `section3_surface_catalog_dark_mode_binding`
 *
 * Assertion: the §3.7 surface catalog explicitly binds every surface family
 * to the canonical dark-mode token, illustration, and Ops-default contracts.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "section3_surface_catalog_dark_mode_binding";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "3.7.6.7-phase-ss-surface-state-binding-matrix"), "§3.7.6.7 dark-mode binding matrix", [
    "**Dark-mode binding matrix.**",
    "Dashboard surfaces",
    "Matrix surfaces",
    "Detail surfaces",
    "Settings surfaces",
    "Ops Console surfaces",
    "Knowledge Base surfaces",
    "§3.11.2",
    "§3.11.4",
    "§3.11.5",
    "§3.11.6",
  ]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Section 3 surface-catalog dark-mode closure",
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
