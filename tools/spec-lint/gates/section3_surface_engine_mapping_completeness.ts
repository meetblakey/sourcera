/**
 * Gate: `section3_surface_engine_mapping_completeness`
 *
 * Assertion: Appendix M.1 explicitly maps every D-3UX-004 §3 UX surface.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "section3_surface_engine_mapping_completeness";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-m-surface-engine-mapping"), "Appendix M.1 §3 UX mappings", [
    "F-041 - Optimistic Mutation Rollback",
    "F-042 - Form & Input Tokens System",
    "F-044 - Loading / Empty / Error State Catalog",
    "External-Target Clipboard Confirmation Pattern",
    "Side Peek tier-aware rendering",
    "F-058 - Bulk Selection Persistence",
    "F-059 - Bulk Action Destructive Confirmation",
    "F-060 - Bulk Action Dispatch Streaming Progress",
    "F-061 - Dark Mode Parity",
    "F-062 - Theme Mode Resolution",
    "Presence & Unread Tracking Subsystem",
  ]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Section 3 surface-engine mapping closure",
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
