/**
 * Gate: `agent_threshold_config_contract_completeness`
 *
 * Assertion: per-capability Agent threshold tuning resolves to one complete
 * spec contract across entity, role/plan gate, API, error, retention, glossary,
 * and surface registry authorities.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  requireDocTokens,
  requireM5RowTokens,
  requireRuntimeActive,
  requireSectionTokensByAnchor,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "agent_threshold_config_contract_completeness";
const SOURCE_PHASE = "v7.2.0-REM Phase 4.12";

const ORG_AGENT_CONFIG_TOKENS = [
  "| `org_id` | UUID (FK) | Required; FK -> Organization | Owning Org |",
  "| `console` | Enum (Appendix J `console`) | `buyer` or `seller`; required | Threshold overrides are console-partitioned. `marketplace` / `ops` values are invalid for customer configuration. |",
  "| `capability_id` | String | Required; FK -> CapabilityRegistryEntry.`capability_id` | Capability being configured. Family-root and alias-only capability ids are rejected; config must target runtime-invokable siblings. |",
  "| `confidence_threshold_override` | Decimal(4,3) | Nullable; `0.000 <= value <= 1.000` | Null means inherit `CapabilityRegistryEntry.confidence_threshold_default`. Stored as ratio; rendered as percent per §21.3 / §3.6.4. |",
  "| `feedback_tuning_enabled` | Boolean | Default true | Enables the §21.3 per-Org threshold-tuning loop that consumes AgentFeedbackRecord aggregates. Disabling never opts into model training. |",
  "| `version` | Integer | >= 1; default 1 | Optimistic-concurrency token for Settings -> Agent writes. |",
  "`agent_confidence_threshold_invalid`",
  "Rows are retained for Org life unless the override is soft-deleted, then retained for 30 days for undo / audit review before configuration payload purge.",
  "A PATCH with a threshold outside `[0.000, 1.000]` MUST return HTTP 422 `agent_confidence_threshold_invalid`.",
] as const;

const AGENT_GUARDRAIL_TOKENS = [
  "The effective threshold is resolved in order: `OrgAgentCapabilityConfig.confidence_threshold_override` (§4.8.15), then `CapabilityRegistryEntry.confidence_threshold_default` (§4.8.2), then no suppression when the registry default is null because the capability is rule-based, alias-only, or non-suggestion.",
  "Users with the §5.11 row family `Agent Threshold Tuning` authority may adjust threshold overrides in Settings -> Agent; invalid values return Appendix I `agent_confidence_threshold_invalid`.",
] as const;

const API_TOKENS = [
  "| GET | `/v1/orgs/{org_id}/agent-capabilities/{capability_id}/config` |",
  "| PATCH | `/v1/orgs/{org_id}/agent-capabilities/{capability_id}/config` |",
  "`PATCH` accepts `confidence_threshold_override`, `feedback_tuning_enabled`, and `version`.",
  "Values outside `[0.000, 1.000]` return `agent_confidence_threshold_invalid`.",
  "Threshold config endpoints MUST read / write §4.8.15 only and MUST never mutate §4.8.2 platform seed rows.",
] as const;

const DOC_TOKENS = [
  "| Agent Threshold Tuning | `business_growth`+ | `seller_growth`+ | §21.3; §4.8.15; §32.10.6; §34.8.5 `agent_threshold_tuning` |",
  "| `agent_threshold_tuning` | `n_a_non_ai` | `not_applicable` | `business_growth` | `seller_growth` | `agent_settings_upgrade_cta` |",
  "| OrgAgentCapabilityConfig (§4.8.15) | Active override rows retained for Org-life.",
  "| `agent_confidence_threshold_invalid` | 422 | §21 / §32.10.6 agent invocation endpoints | Agent threshold override or registry default is outside `[0.000, 1.000]` (§4.8.2; §4.8.15; §21.3). | `error.agent.agent_confidence_threshold_invalid` |",
  "`org_agent_capability_config`",
  "**OrgAgentCapabilityConfig.** Org-scoped, console-scoped override row for Agent capability configuration",
  "**Agent Threshold Tuning.** Settings -> Agent surface that lets authorized admins set `OrgAgentCapabilityConfig.confidence_threshold_override`",
  "| Agent threshold tuning | §21.3, §21.8, §4.8.15, §32.10.6 | Settings -> Agent threshold sliders / numeric inputs | Gr, Sc, Ent, sGr, sSc, sEnt |",
] as const;

const M5_ROW_TOKENS = [
  "api_contract_completeness",
  "spec-tree §21 / §4.8.15 / §32.10.6 / Appendix catalogs only",
  "product settings UI, config persistence, permission middleware, threshold tuning jobs, and runtime invocation suppression remain product-pack evidence",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: SOURCE_PHASE,
  rowClass: "api_contract_completeness",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireSectionTokensByAnchor(
      findings,
      ctx.masterSpec,
      "4.8.15-orgagentcapabilityconfig",
      "§4.8.15 OrgAgentCapabilityConfig",
      ORG_AGENT_CONFIG_TOKENS,
    );
    requireSectionTokensByAnchor(
      findings,
      ctx.masterSpec,
      "21.3-guardrails-and-hallucination-protection",
      "§21.3 Agent guardrails",
      AGENT_GUARDRAIL_TOKENS,
    );
    requireSectionTokensByAnchor(
      findings,
      ctx.masterSpec,
      "32.10.6-agent-invocation-and-configuration-endpoints",
      "§32.10.6 Agent APIs",
      API_TOKENS,
    );
    requireDocTokens(findings, ctx.masterSpec, "Agent threshold cross-catalog contract", DOC_TOKENS);
    requireM5RowTokens(findings, ctx.masterSpec, GATE_ID, M5_ROW_TOKENS);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
