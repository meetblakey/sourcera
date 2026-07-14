/**
 * Gate: `solo_tier_surface_treatment_appendix_m_coverage`
 *
 * Assertion: every §44.6.1 Solo hide-list item has an Appendix M.1 row that
 * explicitly hides the surface on both `buyer_solo` and `seller_solo`.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { findLine, push } from "./enterprise_security_gate_helpers.js";
import {
  requireRuntimeActive,
  requireSectionTokensByAnchor,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "solo_tier_surface_treatment_appendix_m_coverage";
const SOURCE_PHASE = "v7.2.0-REM Phase 44";

const HIDE_LIST_TOKENS = [
  "1. **AIWallet widget**",
  "2. **Wallet-overage configuration UI**",
  "3. **Wallet auto-topup configuration UI**",
  "4. **Per-capability rate card**",
  "5. **Per-AIOperation Billing Ledger row breakdown**",
  "6. **FreeAllowanceCounter inline counter**",
  "7. **AIWallet state badges**",
  "8. **Contest CTA on per-AIOperation rows**",
  "9. **Cost-base 30-day breaking-change banner**",
  "10. **PostHog wallet-counter freshness diagnostics**",
] as const;

const APPENDIX_M_ROWS: Array<[string, string]> = [
  ["Solo suppression - AIWallet widget (§44.6.1 #1)", "AIWallet widget"],
  ["Solo suppression - wallet-overage configuration (§44.6.1 #2)", "wallet-overage configuration"],
  ["Solo suppression - wallet auto-topup configuration (§44.6.1 #3)", "wallet auto-topup configuration"],
  ["Solo suppression - per-capability rate card (§44.6.1 #4)", "per-capability rate card"],
  ["Solo suppression - per-AIOperation billing-ledger breakdown (§44.6.1 #5)", "per-AIOperation billing-ledger breakdown"],
  ["Solo suppression - FreeAllowanceCounter inline counter (§44.6.1 #6)", "FreeAllowanceCounter inline counter"],
  ["Solo suppression - AIWallet state badges (§44.6.1 #7)", "AIWallet state badges"],
  ["Solo suppression - per-AIOperation Contest CTA (§44.6.1 #8)", "per-AIOperation Contest CTA"],
  ["Solo suppression - cost-base breaking-change banner (§44.6.1 #9)", "cost-base breaking-change banner"],
  ["Solo suppression - wallet-counter freshness diagnostics (§44.6.1 #10)", "wallet-counter freshness diagnostics"],
];

function requireAppendixMRows(findings: Finding[], doc: SpecDoc): void {
  for (const [prefix, label] of APPENDIX_M_ROWS) {
    const row = findLine(doc, (line) => line.trim().startsWith(`| ${prefix} |`));
    if (!row) {
      push(findings, doc, 0, prefix, `Appendix M.1 is missing Solo suppression row for ${label}.`);
      continue;
    }
    for (const token of ["buyer_solo", "seller_solo", "Hidden"]) {
      if (!row.text.includes(token)) {
        push(findings, doc, row.line, token, `Appendix M.1 Solo suppression row for ${label} must explicitly hide the surface on both Solo plan tiers.`);
      }
    }
  }
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: SOURCE_PHASE,
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireSectionTokensByAnchor(findings, ctx.masterSpec, "44.6.1-surface-hide-list", "§44.6.1 Solo hide list", HIDE_LIST_TOKENS);
    requireAppendixMRows(findings, ctx.masterSpec);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
