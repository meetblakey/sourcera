/**
 * Gate: `appendix_m_qa_phase_and_tier_consistency`
 *
 * Assertion: Appendix M.1 Q&A phase and AI-tier text matches §18.2.1 and
 * §34.3.4 / §34.8.5.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  push,
  requireDocTokens,
  requireQaM5RuntimeActive,
  requireTokensInSlice,
  rejectTokensInSlice,
  sliceBetweenTokens,
} from "./qa_gate_helpers.js";

const GATE_ID = "appendix_m_qa_phase_and_tier_consistency";

const REQUIRED_DOC_TOKENS = [
  "| 6–7 | Create & reply | Create & reply | Editable (both sides) |",
  "| 8 | No new threads; read existing | Read only | Threads read-only for vendor |",
  "| 9–12 | Read only | Read only | All read-only |",
  "Agent Q&A Suggestion is wallet-charged per §34.3.4 (`qa_suggestion_buyer`) and entitlement-gated by §34.8.5.",
  "§34.3.4",
  "§34.8.5",
] as const;

const REQUIRED_APPENDIX_M_TOKENS = [
  "creatable Phases 6-7; vendor read-only Phase 8; all read-only Phases 9-12",
  "Phase 9 is read-only, not the creation phase.",
  "All Buyer tiers; AIOperation treatment per §34.3.4 / §34.8.5",
  "Capability `qa_suggestion_buyer` is wallet/commit charged",
] as const;

const FORBIDDEN_APPENDIX_M_TOKENS = ["Phase 9 specifically", "Gr+"] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 4.9",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_entitlement_drift",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec, "Q&A phase/tier source text", REQUIRED_DOC_TOKENS);
    const qaSection = sliceBetweenTokens(ctx.masterSpec, "| **Q&A Threads (§18)** |", "| **Templates (§19)** |");
    if (!qaSection) {
      push(findings, ctx.masterSpec, 0, "Q&A Threads (§18)", "Appendix M.1 Q&A section is missing.");
    } else {
      requireTokensInSlice(findings, ctx.masterSpec, "Appendix M.1 Q&A phase/tier section", qaSection, REQUIRED_APPENDIX_M_TOKENS);
      rejectTokensInSlice(findings, ctx.masterSpec, "Appendix M.1 Q&A phase/tier section", qaSection, FORBIDDEN_APPENDIX_M_TOKENS);
    }
    requireQaM5RuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
