/**
 * Gate: `qa_thread_numeric_single_source`
 *
 * Assertion: Q&A question and additional-slot caps source from §34.1.1, while
 * Q&A field and object-size limits source from §39.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  requireDocTokens,
  requireQaM5RuntimeActive,
  rejectTokensInSlice,
  sliceBetweenTokens,
  push,
} from "./qa_gate_helpers.js";

const GATE_ID = "qa_thread_numeric_single_source";

const REQUIRED_TOKENS = [
  "The per-vendor-per-Workspace question cap is sourced exclusively from §34.1.1 cell **Q&A Questions per Vendor per Workspace**.",
  "Workspace Owner can grant additional slots up to the §34.1.1 cell **Q&A Additional Slots per Vendor per Workspace**",
  "Question throughput and additional-slot caps are sourced from §34.1.1; §18 cites those cells and does not restate per-tier numerical limits.",
  "Agent Q&A Suggestion is wallet-charged per §34.3.4 (`qa_suggestion_buyer`) and entitlement-gated by §34.8.5.",
  "| Questions per vendor per Workspace | §34.1.1 cell **Q&A Questions per Vendor per Workspace**; §39 mirror row `Q&A Thread.questions per vendor per Workspace (plan-gated)` |",
  "| Additional slots per vendor per Workspace | §34.1.1 cell **Q&A Additional Slots per Vendor per Workspace**; §39 mirror row `Q&A Thread.additional slots per vendor per Workspace (plan-gated)` |",
  "| **Q&A Questions per Vendor per Workspace** | 10 | 10 | 50 | 50 | 50 | 50 |",
  "| **Q&A Additional Slots per Vendor per Workspace** | 0 | 0 | 0 | 5 | 10 | 10 |",
  "| Q&A Thread | title | 0-100 chars |",
  "| Q&A Thread | questions per vendor per Workspace (plan-gated) | Per §34.1.1 cell **Q&A Questions per Vendor per Workspace** |",
  "| Q&A Thread | additional slots per vendor per Workspace (plan-gated) | Per §34.1.1 cell **Q&A Additional Slots per Vendor per Workspace** |",
  "| Q&A Post | body_markdown | 1-5,000 chars |",
  "| Q&A Post | edit_window | 15 minutes from `created_at` |",
  "| Q&A Post | attachments (count) | 10 files |",
  "| Q&A Attachment | byte_size | 10 MB per file |",
  "| AgentQASuggestion | draft_text | 300 chars |",
  "| QAAdditionalSlotsRequest | justification | 1-200 chars |",
] as const;

const FORBIDDEN_SECTION_18_TOKENS = [
  "zero to ten Attachments",
  "Q&A Post has many Q&A Mentions and zero to ten Attachments",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 4.9",
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec, "Q&A numerical singleton", REQUIRED_TOKENS);
    const section18 = sliceBetweenTokens(ctx.masterSpec, "# 18.", "# 19.");
    if (section18) {
      rejectTokensInSlice(findings, ctx.masterSpec, "§18 Q&A numeric singleton", section18, FORBIDDEN_SECTION_18_TOKENS);
    } else {
      push(findings, ctx.masterSpec, 0, "# 18.", "§18 Q&A section is missing.");
    }
    requireQaM5RuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
