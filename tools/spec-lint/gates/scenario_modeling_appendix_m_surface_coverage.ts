/**
 * Gate: `scenario_modeling_appendix_m_surface_coverage`
 *
 * Assertion: Scenario Modeling customer-visible surfaces have Appendix M rows
 * with Buyer-tier visibility and firewall/residency notes.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { requireDocTokens, requireScenarioM5RuntimeActive } from "./scenario_modeling_gate_helpers.js";

const GATE_ID = "scenario_modeling_appendix_m_surface_coverage";

const REQUIRED_TOKENS = [
  "| **Scenarios & TCO (§14, §15)** |",
  "| Scenario List | §14.2 / §32.10.3.E |",
  "| Scenario Detail / Form | §14.2 / §14.3 |",
  "| Scenario Comparison Matrix | §14.5 |",
  "| Scenario Sensitivity Chart | §14.5.3 / §14.10.2 |",
  "| Simulation Mode Overlay | §14.7 |",
  "| Original Scoring Implicit Scenario | §14.6.1 / §14.6.4 |",
  "| Scenario CSV Export | §14.5.2 / §32.10.3.E |",
  "| Scenario Phase-12 Lock | §14.6.4 |",
  "All Buyer tiers",
  "Buyer-console only; parent Workspace residency",
  "report-inclusion controls remain hidden on Buyer Free / Buyer Solo / Business Starter",
  "Persisted sensitivity may invoke `scenario_modeling`; preview-only remains session-local",
  "Volatile until saved; saved output flows through Scenario create/update",
  "Derived and immutable; delete returns `scenario_original_delete_forbidden`",
  "Deterministic export; no AIOperation; no seller-console data",
  "mutation requests return `scenario_phase_locked`",
  "Conformance posture: inherits_§37.1",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 4.5",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec, "Scenario Modeling Appendix M surface coverage", REQUIRED_TOKENS);
    requireScenarioM5RuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
