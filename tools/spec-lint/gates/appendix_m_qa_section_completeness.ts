/**
 * Gate: `appendix_m_qa_section_completeness`
 *
 * Assertion: every customer-visible §18 Q&A surface is represented in
 * Appendix M.1 with conformance posture.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { push, requireQaM5RuntimeActive, requireTokensInSlice, sliceBetweenTokens } from "./qa_gate_helpers.js";

const GATE_ID = "appendix_m_qa_section_completeness";

const REQUIRED_APPENDIX_M_TOKENS = [
  "| **Q&A Threads (§18)** |",
  "| Q&A Thread (phase-gated: creatable Phases 6-7; vendor read-only Phase 8; all read-only Phases 9-12) | §18.2 |",
  "| Q&A Visibility Control | §18.3.2 / §4.4.2.1 / §24.1.1 |",
  "| Q&A Author Masking | §18.3.3 |",
  "| Agent Q&A Suggestion (buyer-side AI) | §18.4 / §21.4.1.B |",
  "| Q&A Suggestion Cross-Console Retrieval Boundary | §18.4.1.1 / §22.1 / §22.8 / §4.7.1 |",
  "| Q&A Post Editing & Moderation | §18.5.1 / §39 |",
  "| Q&A Attachments + Virus Scan | §18.5.2 / §4.6.2 / §39 |",
  "| Q&A Mentions & Notification Digest | §18.5.3 / §29.3 / Appendix C/G |",
  "| Thread Search & Index | §18.6 |",
  "| Q&A Additional Slots Request Workflow | §18.7.2 / §34.1.1 / §39 |",
  "Conformance posture: inherits_§37.1",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 4.9",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    const qaSection = sliceBetweenTokens(ctx.masterSpec, "| **Q&A Threads (§18)** |", "| **Templates (§19)** |");
    if (!qaSection) {
      push(findings, ctx.masterSpec, 0, "Q&A Threads (§18)", "Appendix M.1 Q&A section is missing.");
    } else {
      requireTokensInSlice(findings, ctx.masterSpec, "Appendix M.1 Q&A section", qaSection, REQUIRED_APPENDIX_M_TOKENS);
    }
    requireQaM5RuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
