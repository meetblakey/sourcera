/**
 * Gate: `scenario_modeling_event_catalog_consistency`
 *
 * Assertion: Scenario Modeling lifecycle events resolve exactly across §31.16,
 * Appendix C, Appendix G, and Appendix J audit actions.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  requireDocTokens,
  requireScenarioM5RuntimeActive,
  SCENARIO_DOTTED_EVENTS,
  SCENARIO_POSTHOG_EVENTS,
} from "./scenario_modeling_gate_helpers.js";

const GATE_ID = "scenario_modeling_event_catalog_consistency";

const REQUIRED_TOKENS = [
  "## 31.16 Scenario Modeling Webhook Completeness Pack {#31.16-scenario-modeling-webhook-completeness-pack}",
  "**Scenario Modeling webhook registrations (§14 / §31.16).**",
  "The legacy `scenario.saved` row above remains an in-app notification compatibility event only",
  "Scenario Modeling payloads follow §31.16 body-exclusion rules",
  "#### `audit_event_action_type` - §14 Scenario Modeling additions",
  "`scenario.saved` remains an Appendix C in-app notification compatibility value and is not an AuditEvent action for new writes",
  ...SCENARIO_DOTTED_EVENTS,
  ...SCENARIO_POSTHOG_EVENTS,
  ...SCENARIO_DOTTED_EVENTS.map((event) => `source_webhook_event_type='${event}'`),
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 4.5",
  rowClass: "webhook_catalog_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec, "Scenario Modeling event catalog", REQUIRED_TOKENS);
    requireScenarioM5RuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
