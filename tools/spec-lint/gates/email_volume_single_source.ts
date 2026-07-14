/**
 * Gate: `email_volume_single_source`
 *
 * Assertion: outbound email volume points to §34.1.1 / §34.1.2 and §39 as the
 * only plan-tier cap source. §41 / §48.4.1 must not restate per-tier cap rows.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push, requireTokens, sectionText } from "./email_domain_gate_helpers.js";

function volumeFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const requiredWholeDocTokens = [
    "| **Outbound Email Volume (24h)** |",
    "| EmailSend | outbound sends per Org per 24h (plan-gated) | Per §34.1.1 / §34.1.2 cell **Outbound Email Volume (24h)** |",
  ];
  for (const token of requiredWholeDocTokens) {
    if (!doc.text.includes(token)) {
      push(findings, doc, 0, token, `Master Spec is missing outbound-email volume singleton token: ${token}`);
    }
  }

  requireTokens(findings, doc, "41.4.1-plan-and-rate-gates", "§41.4.1 Plan and Rate Gates", [
    "Per-Org outbound email volume is authoritative in §34.1.1 / §34.1.2 cell **Outbound Email Volume (24h)** and mirrored by §39.",
    "§48.4.1 owns anti-spam dedupe and the Loops.so account-level cap.",
  ]);
  requireTokens(findings, doc, "48.4.1-email-throttling", "§48.4.1 Email Throttling", [
    "Per-Org outbound email volume is enforced at the Loops.so adapter layer (§41.1) against the canonical §34.1.1 / §34.1.2 cell **Outbound Email Volume (24h)** and mirrored by §39.",
    "§48.4.1 MUST NOT restate per-tier volume literals.",
  ]);

  const guardedAnchors = [
    { anchor: "41.4.1-plan-and-rate-gates", label: "§41.4.1" },
    { anchor: "48.4.1-email-throttling", label: "§48.4.1" },
  ];
  const perTierTablePattern = /\|\s*(Free|Solo|Starter|Growth|Scale|Enterprise|buyer_free|seller_free)\b.*\b(1,000|5000|5,000|10000|10,000|25000|25,000|100000|100,000)\b/i;
  for (const guarded of guardedAnchors) {
    const section = sectionText(doc, guarded.anchor);
    if (!section) continue;
    for (let line = section.startLine; line <= section.endLine; line++) {
      const text = doc.lines[line] ?? "";
      if (perTierTablePattern.test(text)) {
        push(findings, doc, line, text.trim(), `${guarded.label} must cite §34 / §39 instead of restating per-tier outbound-email caps.`);
      }
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "email_volume_single_source",
  sourcePhase: "v7.2.0-REM Phase 41",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [...volumeFindings(ctx.masterSpec), ...m5RuntimeActiveFindings(ctx.masterSpec, "email_volume_single_source")];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
