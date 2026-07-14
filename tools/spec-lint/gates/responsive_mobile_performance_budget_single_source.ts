/**
 * Gate: `responsive_mobile_performance_budget_single_source`
 *
 * Assertion: mobile performance thresholds live in §44.1; §38 and §50 cite row
 * names and do not restate competing threshold values.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { push } from "./enterprise_security_gate_helpers.js";
import {
  requireDocTokens,
  requireRuntimeActive,
  sectionByAnchorOrFinding,
  RESPONSIVE_SOURCE_PHASE,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "responsive_mobile_performance_budget_single_source";

const REQUIRED_TOKENS = [
  "The following responsive budgets are canonical in §44.1 and are consumed here by row name. §38 MUST NOT restate competing numeric thresholds.",
  "§44.1 `Mobile FCP - mobile_xs / mobile_sm`",
  "§44.1 `Mobile LCP - mobile_xs / mobile_sm`",
  "§44.1 `Mobile INP - mobile_xs / mobile_sm`",
  "§44.1 `Mobile TTI - mobile_xs / mobile_sm`",
  "§44.1 `Mobile initial JS envelope - mobile_xs`",
  "§44.1 `Mobile cold-cache page load - simulated 4G`",
  "| **Mobile FCP - mobile_xs / mobile_sm** | p95 ≤ 2.5s on simulated 4G cold-cache first load and production mobile canary cohort. Source authority for §38.6.7; excludes provider-outage annotated windows per §42.6. |",
  "| **Mobile LCP - mobile_xs / mobile_sm** | p95 ≤ 4.0s on simulated 4G cold-cache first load and production mobile canary cohort. Source authority for §38.6.7. |",
  "| **Mobile INP - mobile_xs / mobile_sm** | p95 ≤ 200ms for tap, keyboard, bottom-sheet, and Side Peek interactions on mobile tiers. Source authority for §38.6.7. |",
  "| **Mobile TTI - mobile_xs / mobile_sm** | p95 ≤ 5.0s on simulated 4G cold-cache authenticated routes. Source authority for §38.6.7. |",
  "| **Mobile initial JS envelope - mobile_xs** | Initial route JavaScript ≤ 250 KB gzip for `mobile_xs` authenticated route bundles, excluding code-split deferred panels. Source authority for §38.6.7. |",
  "| **Mobile cold-cache page load - simulated 4G** | p95 ≤ 6.0s from navigation start to first interactive primary action on `mobile_xs` / `mobile_sm`. Source authority for §38.6.7. |",
  "2. The dashboard MUST read mobile budget thresholds by §44.1 row name; no dashboard config may embed an independent numeric threshold.",
  "6. Mobile production p95 FCP, LCP, INP, TTI, initial JavaScript envelope, or cold-cache page-load budget from §44.1 breaches for 3 consecutive canary days.",
] as const;

const FORBIDDEN_THRESHOLD_RE = /(?:FCP|LCP|INP|TTI|initial JS|cold-cache).*(?:<=|≤)\s*(?:\d+(?:\.\d+)?s|\d+ms|\d+\s*KB)/i;

function rejectThresholdRestatements(findings: Finding[], doc: GateContext["masterSpec"]): void {
  for (const [anchor, label] of [
    ["38.6.7-per-tier-performance-budgets", "§38.6.7"],
    ["50.14.13-responsive-tier-conformance-dashboard", "§50.14.13"],
  ] as const) {
    const section = sectionByAnchorOrFinding(findings, doc, anchor, label);
    if (!section) continue;
    const lines = section.text.split("\n");
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i] ?? "";
      if (FORBIDDEN_THRESHOLD_RE.test(line)) {
        push(findings, doc, section.startLine + i, line.trim(), `${label} must cite §44.1 row names instead of restating mobile performance thresholds.`);
      }
    }
  }
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: RESPONSIVE_SOURCE_PHASE,
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec, "Responsive mobile performance budget singleton", REQUIRED_TOKENS);
    rejectThresholdRestatements(findings, ctx.masterSpec);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
