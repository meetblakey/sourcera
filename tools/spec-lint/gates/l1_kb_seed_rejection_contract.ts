/**
 * Gate: `l1_kb_seed_rejection_contract`
 *
 * Assertion: an L1-linked `kb_bootstrap` rejection caused by the existing
 * outcome-contract approval floor terminates L1 deterministically, is
 * separately observable, and cannot be counted as a seeded success.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "l1_kb_seed_rejection_contract";

function sectionText(doc: SpecDoc, anchor: string): { text: string; line: number } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return { text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"), line: section.startLine };
}

function requireTokens(
  findings: Finding[],
  doc: SpecDoc,
  scope: { text: string; line: number } | null,
  label: string,
  tokens: readonly string[],
) {
  if (!scope) {
    push(findings, doc, 0, label, `${label} section is missing.`);
    return;
  }
  for (const token of tokens) {
    if (!scope.text.includes(token)) push(findings, doc, scope.line, token, `${label} is missing required token: ${token}`);
  }
}

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const l1 = sectionText(doc, "48.2.2-l1-vendor-invite-creates-account");
  requireTokens(findings, doc, l1, "§48.2.2 L1 rejection outcome", [
    "growth_loop_l1_kb_seed_failed",
    "§21.4.5 `kb_bootstrap` rejected signal",
    "`lifecycle_state=decayed`",
    "`lifecycle_state_reason=quality_floor_failed`",
    "`loop_outcome_value_usd` remains null",
    "MUST NOT write `growth_loop_l1_kb_seeded`",
    "`bootstrap_ai_operation_id`",
  ]);

  requireTokens(findings, doc, sectionText(doc, "48.2.12-growthloopexecution-entity"), "§48.2.12 L1 lifecycle", [
    "`growth_loop_l1_kb_seed_failed`",
    "`quality_floor_failed`",
    "`in_progress` | `decayed`",
  ]);

  requireTokens(findings, doc, sectionText(doc, "51.1.5-event-catalog-cross-reference-appendix-g"), "§51.1.5 Forced-Vendor-Signup Playbook", [
    "growth_loop_l1_kb_seed_failed",
  ]);

  requireTokens(findings, doc, sectionText(doc, "appendix-g-posthog-event-taxonomy"), "Appendix G L1 rejection event", [
    "growth_loop_l1_kb_seed_failed",
    "growth_loop_execution_id",
    "bootstrap_ai_operation_id",
    "approval_ratio",
  ]);

  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
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
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
