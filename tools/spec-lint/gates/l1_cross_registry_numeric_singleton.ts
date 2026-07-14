/**
 * Gate: `l1_cross_registry_numeric_singleton`
 *
 * Assertion: L1's attribution duration, PostHog funnel budget, and SIM
 * thresholds are authored once in §40.2, §44.1, and §48.4.10 respectively.
 * §48.2.2 consumes those registries without restating the values.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "l1_cross_registry_numeric_singleton";

function sectionText(doc: SpecDoc, anchor: string): { text: string; line: number } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return { text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"), line: section.startLine };
}

function requireTokens(findings: Finding[], doc: SpecDoc, scope: { text: string; line: number } | null, label: string, tokens: readonly string[]) {
  if (!scope) {
    push(findings, doc, 0, label, `${label} section is missing.`);
    return;
  }
  for (const token of tokens) {
    if (!scope.text.includes(token)) push(findings, doc, scope.line, token, `${label} is missing required token: ${token}`);
  }
}

function inlineFinding(findings: Finding[], doc: SpecDoc, scope: { text: string; line: number } | null, re: RegExp, label: string) {
  if (!scope) return;
  const lines = scope.text.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    if (re.test(line)) push(findings, doc, scope.line + index, line.trim(), `${label} must cite its canonical registry instead of restating a numeric value.`);
  }
}

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionText(doc, "40.2-data-retention-and-deletion"), "§40.2 GrowthLoopExecution attribution registry", [
    "GrowthLoopExecution — attribution-window expiry",
    "L1: 60 days",
    "L2: 30 days",
    "L4: 90 days",
    "L7: 30 days",
    "L10: 30 days",
  ]);
  requireTokens(findings, doc, sectionText(doc, "44.1-performance-targets"), "§44.1 PostHog funnel budget", [
    "PostHog Insights funnel query performance",
    "p95 ≤ 30 seconds",
    "PostHog Insights → Funnels",
  ]);
  requireTokens(findings, doc, sectionText(doc, "48.4.10-sim-cross-reference"), "§48.4.10 L1 SIM threshold registry", [
    "L1 SIM threshold registry",
    "L1 signup-attribution rate",
    "> 3σ below cohort baseline",
    "L1 invite velocity",
    "> 4× cohort 95th-percentile",
    "growth_loop_velocity_anomaly_detected",
  ]);

  const l1 = sectionText(doc, "48.2.2-l1-vendor-invite-creates-account");
  requireTokens(findings, doc, l1, "§48.2.2 L1", [
    "§40.2 row **GrowthLoopExecution — attribution-window expiry**",
    "§44.1 row **PostHog Insights funnel query performance**",
    "§48.4.10 **L1 SIM threshold registry**",
  ]);
  inlineFinding(findings, doc, l1, /\b60[- ]day\b|\b60d\b/i, "§48.2.2 L1 attribution window");
  inlineFinding(findings, doc, l1, /p95\s*(?:≤|<=)\s*30\s*seconds/i, "§48.2.2 L1 funnel budget");
  inlineFinding(findings, doc, l1, />\s*3σ|>\s*4×/i, "§48.2.2 L1 SIM threshold");

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
