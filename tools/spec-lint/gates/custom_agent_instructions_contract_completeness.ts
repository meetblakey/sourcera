/**
 * Gate: `custom_agent_instructions_contract_completeness`
 *
 * Assertion: Custom Agent Instructions resolve to one complete Team-backed
 * contract with limits, plan gate, API error codes, retention, glossary, and
 * Appendix M surface coverage.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  requireDocTokens,
  requireM5RowTokens,
  requireRuntimeActive,
  requireSectionTokensByAnchor,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "custom_agent_instructions_contract_completeness";
const SOURCE_PHASE = "v7.2.0-REM Phase 4.12";

const TEAM_TOKENS = [
  "| `agent_instructions` | Array[Object] | Count and per-instruction body limits from §39; default `[]` | Custom Agent Instructions consumed by §21.8.",
  "| `agent_instructions_version` | Integer | >= 1; default 1 | Optimistic-concurrency token incremented on every create / edit / archive / restore of `agent_instructions`. |",
  "| `agent_instructions_applied_at` | Timestamp | Nullable | Last time the scheduled Agent-rules compiler applied the active instruction set. Apply latency target lives in §44.1; §21.8 cites this field and never restates the duration. |",
  "**Custom Agent Instruction state machine.**",
  "| `draft` | `active` | Actor saves / publishes | Prompt-injection filter passes; optimistic-concurrency token matches | Increments `agent_instructions_version`; schedules compiler apply. |",
  "`agent_instructions.body_markdown` is customer-authored free-form text and follows §6.8.4.5 body sweep / Pattern A rewrite when it contains subject PII;",
  "Custom Agent Instruction writes MUST validate count and body limits against §39 and return Appendix I `team_agent_instructions_count_exceeded` or `team_agent_instruction_char_limit_exceeded` on violation.",
  "Custom Agent Instruction edits MUST use optimistic concurrency on `agent_instructions_version`; stale writes return HTTP 409 `team_agent_instructions_concurrent_modification`.",
] as const;

const AGENT_INSTRUCTION_TOKENS = [
  "Instructions stored per Team in `Team.agent_instructions` (§4.2.4) with count and body limits sourced from §39.",
  "Instructions are applied via the Agent-rules compiler within the §44.1 apply-latency budget; `Team.agent_instructions_applied_at` records the last successful apply.",
  "Instruction count and per-instruction body length are enforced by §39 and Appendix I errors `team_agent_instructions_count_exceeded` / `team_agent_instruction_char_limit_exceeded`.",
  "**Plan gate and role gate:** Custom Agent Instructions require the §5.11 row family `Custom Agent Instructions`.",
  "| Custom Agent Instructions | §4.2.4 `Team.agent_instructions` | Body text follows §6.8.4.5 Pattern A sweep; actor FKs follow Pattern B | Owning Org residency (§40.4) | Team Settings -> Agent Rules editor is `not_supported` on mobile; read-only summary is `simplified` | Active instructions move to `DowngradeExcessDataBucket` class `team_agent_instructions_over_cap`; runtime ignores inactive over-cap instructions until upgrade / deletion. |",
] as const;

const DOC_TOKENS = [
  "| Custom Agent Instructions | `business_growth`+ | `seller_growth`+ | §21.8; §4.2.4; §39; §34.8.5 `custom_agent_instructions` |",
  "| `custom_agent_instructions` | `n_a_non_ai` | `not_applicable` | `business_growth` | `seller_growth` | `agent_settings_upgrade_cta` |",
  "| Team | agent_instructions count | 50 active or draft instructions | Source row for §4.2.4 / §21.8 Custom Agent Instructions. Archived instructions do not count against the active-edit cap but remain retained per §40.2. |",
  "| Team | agent_instructions[i].text | 5,000 chars | Markdown. Source row for §4.2.4 / §21.8. Writes above this cap return `team_agent_instruction_char_limit_exceeded`. |",
  "| Team.agent_instructions (§4.2.4 / §21.8) | Active Team instruction payload retained for Team life. Archived instructions retained 90 days after archive, then body purged unless legal hold, audit dispute, or downgrade bucket preservation applies.",
  "Custom Agent Instructions MUST validate against §4.2.4 / §39, apply within the §44.1 apply-latency budget, and preserve a versioned audit trail.",
  "| `team_agent_instructions_count_exceeded` | 422 | §21 / §32.10.6 agent invocation endpoints | Team Custom Agent Instruction write exceeds the §39 active/draft instruction count cap. | `error.agent.team_agent_instructions_count_exceeded` |",
  "| `team_agent_instruction_char_limit_exceeded` | 422 | §21 / §32.10.6 agent invocation endpoints | Custom Agent Instruction body exceeds §39 `Team.agent_instructions[i].text`. | `error.agent.team_agent_instruction_char_limit_exceeded` |",
  "| `team_agent_instructions_concurrent_modification` | 409 | §21 / §32.10.6 agent invocation endpoints | Custom Agent Instruction write used a stale `agent_instructions_version` (§4.2.4). | `error.agent.team_agent_instructions_concurrent_modification` |",
  "**`team_agent_instruction_state`:** `draft`, `active`, `archived`.",
  "**Custom Agent Instructions.** Team-scoped instruction set that augments Agent prompts only for the owning Team's console context.",
  "| Custom Agent Instructions (per-Org system prompt augmentation) | §21.8 | \"Customize Sourcera AI\" textarea in Org Settings / Team Settings -> Agent Rules editor | Gr, Sc, Ent, sGr, sSc, sEnt |",
] as const;

const M5_ROW_TOKENS = [
  "data_model_contract",
  "spec-tree §4.2.4 / §21.8 / §34.8.5 / §39 / §40.2 / §44.1 / Appendix catalogs only",
  "Team settings UI, compiler apply jobs, permission middleware, persistence, downgrade runtime ignores, and API handlers remain product-pack evidence",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: SOURCE_PHASE,
  rowClass: "data_model_contract",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec, "§4.2.4 Team Custom Agent Instruction contract", TEAM_TOKENS);
    requireSectionTokensByAnchor(
      findings,
      ctx.masterSpec,
      "21.8-custom-agent-instructions",
      "§21.8 Custom Agent Instructions",
      AGENT_INSTRUCTION_TOKENS,
    );
    requireDocTokens(findings, ctx.masterSpec, "Custom Agent Instructions cross-catalog contract", DOC_TOKENS);
    requireM5RowTokens(findings, ctx.masterSpec, GATE_ID, M5_ROW_TOKENS);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
