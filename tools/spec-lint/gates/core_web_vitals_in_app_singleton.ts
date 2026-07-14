/**
 * Gate: `core_web_vitals_in_app_singleton`
 *
 * Assertion: authenticated-console Core Web Vitals thresholds live in §44.1;
 * §26.9.10 remains public-page-only.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { push } from "./enterprise_security_gate_helpers.js";
import {
  requireRuntimeActive,
  requireSectionTokensByAnchor,
  sectionByAnchorOrFinding,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "core_web_vitals_in_app_singleton";
const SOURCE_PHASE = "v7.2.0-REM Phase 44";

const SECTION_44_1_TOKENS = [
  "| **In-app LCP - authenticated surfaces** | Buyer Console, Seller Console, authenticated Marketplace, and Ops Console MUST meet p75 ≤ 2.5s on desktop and p75 ≤ 4.0s on mobile web. Public-page LCP remains owned by §26.9.10; this row is the in-app Core Web Vitals singleton. |",
  "| **In-app INP - authenticated surfaces** | Buyer Console, Seller Console, authenticated Marketplace, and Ops Console MUST meet p75 ≤ 200ms for primary click, keyboard, command, Side Peek, and mobile bottom-sheet interactions. |",
  "| **In-app CLS - authenticated surfaces** | Buyer Console, Seller Console, authenticated Marketplace, and Ops Console MUST meet p75 ≤ 0.1 across initial load, route transition, skeleton replacement, Side Peek open/close, and responsive breakpoint change. |",
  "| **In-app TTFB - cached authenticated routes** | Buyer Console, Seller Console, authenticated Marketplace, and Ops Console cached SSR / edge routes MUST meet p75 ≤ 600ms on desktop and mobile web. |",
  "| **In-app TTFB - uncached authenticated routes** | Buyer Console, Seller Console, authenticated Marketplace, and Ops Console uncached dynamic routes MUST meet p75 ≤ 1,200ms on desktop and mobile web; provider-outage annotated windows follow §42.6 exclusion discipline. |",
] as const;

const FORBIDDEN_26_TOKENS = [
  "In-app LCP - authenticated surfaces",
  "In-app INP - authenticated surfaces",
  "In-app CLS - authenticated surfaces",
  "In-app TTFB - cached authenticated routes",
  "In-app TTFB - uncached authenticated routes",
] as const;

function rejectAuthenticatedRowsInPublicPageSection(findings: Finding[], ctx: GateContext): void {
  const section = sectionByAnchorOrFinding(
    findings,
    ctx.masterSpec,
    "26.9.10-page-accessibility-and-core-web-vitals",
    "§26.9.10 public-page Core Web Vitals",
  );
  if (!section) return;

  const lines = section.text.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    for (const token of FORBIDDEN_26_TOKENS) {
      if (line.includes(token)) {
        push(
          findings,
          ctx.masterSpec,
          section.startLine + i,
          token,
          "§26.9.10 must stay public-page-only; authenticated-console Core Web Vitals belong in §44.1.",
        );
      }
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
    requireSectionTokensByAnchor(findings, ctx.masterSpec, "44.1-performance-targets", "§44.1 in-app Core Web Vitals singleton", SECTION_44_1_TOKENS);
    rejectAuthenticatedRowsInPublicPageSection(findings, ctx);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
