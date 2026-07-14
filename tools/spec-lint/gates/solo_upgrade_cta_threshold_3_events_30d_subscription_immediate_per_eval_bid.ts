/** Local pr_lint half of the Solo throttling-pressure upgrade-CTA gate. */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { findLine, push } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "solo_upgrade_cta_threshold_3_events_30d_subscription_immediate_per_eval_bid";

function sectionText(doc: SpecDoc, title: RegExp): { text: string; line: number } | null {
  const section = findSectionByTitle(doc, title);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
  };
}

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const behavior = sectionText(doc, /^34\.5\.4 Solo Throttling-Pressure Upgrade CTA/);
  const aggregation = sectionText(doc, /^44\.6\.5\.A Sustained Throttling Upgrade-CTA Aggregation/);
  if (!behavior) push(findings, doc, 0, "34.5.4", "§34.5.4 Solo upgrade-CTA behavior contract is missing.");
  if (!aggregation) push(findings, doc, 0, "44.6.5.A", "§44.6.5.A Solo upgrade-CTA aggregation contract is missing.");
  if (!behavior || !aggregation) return findings;

  const behaviorTokens = [
    "Buyer Solo subscription",
    "Buyer Solo per-evaluation",
    "Seller Solo subscription",
    "Seller Solo per-bid",
    "solo.envelope.throttling_engaged",
    "rolling 30-day window",
    "solo.envelope.exhausted",
    "First event in that evaluation",
    "First event in that bid",
    "business_starter",
    "seller_starter",
    "billing.solo_upgrade_cta.triggered",
    "solo_upgrade_cta_triggered",
    "MUST NOT render inside the",
    "throttling toast",
  ];
  for (const token of behaviorTokens) {
    if (!behavior.text.includes(token)) push(findings, doc, behavior.line, token, `§34.5.4 is missing Solo upgrade-CTA contract token: ${token}.`);
  }
  if (!/(?:≥|>=) 3 events/.test(behavior.text)) {
    push(findings, doc, behavior.line, "3 events", "§34.5.4 subscription mode must require at least 3 events in 30 days.");
  }
  if (!behavior.text.includes("upgrade_completed.trigger = solo_envelope_pressure")) {
    push(findings, doc, behavior.line, "solo_envelope_pressure", "§34.5.4 upgrade_completed.trigger attribution must be solo_envelope_pressure.");
  }

  for (const token of [
    "subscription_throttling_3_in_30d",
    "per_eval_envelope_hit",
    "per_bid_envelope_hit",
    "No-toast upsell invariant",
  ]) {
    if (!aggregation.text.toLowerCase().includes(token.toLowerCase())) {
      push(findings, doc, aggregation.line, token, `§44.6.5.A is missing aggregation token: ${token}.`);
    }
  }

  const redaction = `${behavior.text.match(/MUST NOT include[^\n]*/)?.[0] ?? ""} ${aggregation.text.match(/MUST NOT carry[^\n]*/)?.[0] ?? ""}`.toLowerCase();
  const exclusions = new Map<string, string[]>([
    ["envelope", ["envelope"]],
    ["cost", ["cost"]],
    ["raw content", ["raw"]],
    ["buyer identity", ["buyer identity"]],
    ["seller identity", ["seller identity", "vendor identity"]],
    ["per-capability spend", ["per-capability spend"]],
  ]);
  for (const [label, aliases] of exclusions) {
    if (!aliases.some((alias) => redaction.includes(alias))) {
      push(findings, doc, behavior.line, label, `§34.5.4 / §44.6.5.A payload exclusion is missing: ${label}.`);
    }
  }

  for (const token of [
    "billing.solo_upgrade_cta.triggered",
    "solo_upgrade_cta_triggered",
    "solo_upgrade_cta_trigger_mode",
    "subscription_throttling_3_in_30d",
    "per_eval_envelope_hit",
    "per_bid_envelope_hit",
    "upgrade_completed_trigger",
    "solo_envelope_pressure",
  ]) {
    if (!doc.text.includes(token)) push(findings, doc, 0, token, `Solo upgrade-CTA Appendix C/G/J registration is missing: ${token}.`);
  }

  const m5 = findLine(doc, (line) => line.trim().startsWith(`| \`${GATE_ID}\` |`));
  for (const token of [
    "spec_binding_pending_pack_m02_3",
    `tools/spec-lint/gates/${GATE_ID}.ts`,
    "deployed aggregation, idempotency, and render evidence remains required",
  ]) {
    if (!m5?.text.includes(token)) push(findings, doc, m5?.line ?? 0, token, `§M.5 ${GATE_ID} row is missing local/external evidence boundary: ${token}.`);
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Solo throttling P1",
  rowClass: "cross_feature_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
