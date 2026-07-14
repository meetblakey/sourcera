/**
 * Gate: `agent_cost_authority_no_section44_inline_restatement`
 *
 * Assertion: §44.2 delegates pricing and cost authority to §34 / §4.8 and does
 * not author per-model, per-capability, or per-requirement dollar ranges.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { push } from "./enterprise_security_gate_helpers.js";
import {
  requireRuntimeActive,
  requireSectionTokensByAnchor,
  sectionByAnchorOrFinding,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "agent_cost_authority_no_section44_inline_restatement";
const SOURCE_PHASE = "v7.2.0-REM Phase 44";

const REQUIRED_TOKENS = [
  "**Cost Authority.** Per-requirement list price, cost base, and value / cost prices are not authored in §44.2. The authoritative homes are CapabilityRegistryEntry (§4.8.2), CostBaseRecalculationLog (§4.8.6), the pricing formula (§34.3.1), and the rate-card surfaces (§34.3.4 / §34.14.1).",
  "**AI Included-Budget Ceilings.** Per-tier AI included-budget ceilings are authoritative in §34.1 (plan tier definitions) and §34.10 (AI Wallet Service). Per-Org wallet behavior, overage, cap enforcement, and auto-topup semantics are authoritative in §34.10. §44.2 does not restate per-tier budget values; consumers MUST reference §34.1 and §34.10 for the authoritative AI-consumption budget limits.",
] as const;

const FORBIDDEN_DOLLAR_RE = /\$\s*\d|\b\d+(?:\.\d+)?\s*(?:USD|dollars?)\b|(?:per-model|per model|per-capability|per capability|per-requirement|per requirement).{0,80}(?:\$|\b(?:USD|dollars?)\b)/i;

function rejectDollarRestatements(findings: Finding[], ctx: GateContext): void {
  const section = sectionByAnchorOrFinding(findings, ctx.masterSpec, "44.2-agent-performance-budgets", "§44.2 Agent Performance Budgets");
  if (!section) return;

  const lines = section.text.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    if (FORBIDDEN_DOLLAR_RE.test(line)) {
      push(
        findings,
        ctx.masterSpec,
        section.startLine + i,
        line.trim(),
        "§44.2 must cite §34 / §4.8 pricing authority instead of restating dollar cost or budget values.",
      );
    }
  }
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: SOURCE_PHASE,
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireSectionTokensByAnchor(findings, ctx.masterSpec, "44.2-agent-performance-budgets", "§44.2 pricing/cost authority", REQUIRED_TOKENS);
    rejectDollarRestatements(findings, ctx);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
