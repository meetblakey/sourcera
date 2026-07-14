/**
 * Gate: `responsive_design_appendix_m_surface_coverage`
 *
 * Assertion: §38 responsive engines and user-visible mobile surfaces resolve to
 * Appendix M.1 surface/engine rows.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  requireDocTokens,
  requireRuntimeActive,
  RESPONSIVE_SOURCE_PHASE,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "responsive_design_appendix_m_surface_coverage";

const REQUIRED_TOKENS = [
  "| **Responsive Design (§38)** | | | | |",
  "| Responsive breakpoint tier engine | §38.6.1, Appendix J `responsive_breakpoint_tier` |",
  "| UserUIPreference breakpoint and layout persistence | §4.2.15, §38.6.3, §38.6.4.1 |",
  "| Modern device posture and constrained-data renderer | §38.6.4.1 |",
  "| Side Peek tier-aware rendering | §3.8, §38.6.2, §38.8.1 |",
  "| Bottom Nav mobile primary navigation | §38.6.2 |",
  "| Hamburger Sidebar mobile navigation | §38.6.2 |",
  "| Mobile Search / bottom-sheet Command Palette | §38.6.2, §38.7.1 |",
  "| Agent FAB mobile entry point | §38.7.1, §21.3 |",
  "| Simplification Disclosure chip | §38.8.3 |",
  "| Mobile-unsupported informational page | §38.8.3, §50.2.2 |",
  "| Mobile Feature Parity Matrix | §38.8.2, Appendix J `mobile_feature_parity_status` |",
  "| Tap-count probe workflow engine | §38.7.4, §38.8.4, Appendix J `tap_count_probe_workflow_kind` |",
  "| Responsive Tier Conformance Dashboard | §38.6.5, §50.14.13 |",
  "| Mobile Feature Parity Dashboard | §38.8.2, §38.8.5, §50.14.14 |",
  "| Print Stylesheet Behavior | §38.9 |",
  "| Reduced-Motion Override | §38.10 |",
  "| RTL `useDirectionality()` hook | §37.3, §38.11 |",
  "| Presence Avatar Stack Component | §38.12 |",
  "## 38.9 Print Stylesheet Behavior {#38.9-print-stylesheet-behavior}",
  "## 38.10 Reduced-Motion & Accessibility Tier Overrides {#38.10-reduced-motion-and-accessibility-tier-overrides}",
  "## 38.11 Right-to-Left & Locale Mirror Behavior {#38.11-right-to-left-and-locale-mirror-behavior}",
  "## 38.12 Presence Avatar Stack Component {#38.12-presence-avatar-stack-component}",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: RESPONSIVE_SOURCE_PHASE,
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec, "Responsive Appendix M surface coverage", REQUIRED_TOKENS);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
