# Agent Threshold Fixture

### 4.8.15 OrgAgentCapabilityConfig (Org-Scoped Agent Configuration) {#4.8.15-orgagentcapabilityconfig}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `org_id` | UUID (FK) | Required; FK -> Organization | Owning Org |
| `console` | Enum (Appendix J `console`) | `buyer` or `seller`; required | Threshold overrides are console-partitioned. `marketplace` / `ops` values are invalid for customer configuration. |
| `capability_id` | String | Required; FK -> CapabilityRegistryEntry.`capability_id` | Capability being configured. Family-root and alias-only capability ids are rejected; config must target runtime-invokable siblings. |
| `confidence_threshold_override` | Decimal(4,3) | Nullable; `0.000 <= value <= 1.000` | Null means inherit `CapabilityRegistryEntry.confidence_threshold_default`. Stored as ratio; rendered as percent per §21.3 / §3.6.4. |
| `feedback_tuning_enabled` | Boolean | Default true | Enables the §21.3 per-Org threshold-tuning loop that consumes AgentFeedbackRecord aggregates. Disabling never opts into model training. |
| `version` | Integer | >= 1; default 1 | Optimistic-concurrency token for Settings -> Agent writes. |

`agent_confidence_threshold_invalid`

Rows are retained for Org life unless the override is soft-deleted, then retained for 30 days for undo / audit review before configuration payload purge.

A PATCH with a threshold outside `[0.000, 1.000]` MUST return HTTP 422 `agent_confidence_threshold_invalid`.

## 21.3 Guardrails & Hallucination Protection {#21.3-guardrails-and-hallucination-protection}

The effective threshold is resolved in order: `OrgAgentCapabilityConfig.confidence_threshold_override` (§4.8.15), then `CapabilityRegistryEntry.confidence_threshold_default` (§4.8.2), then no suppression when the registry default is null because the capability is rule-based, alias-only, or non-suggestion.
Users with the §5.11 row family `Agent Threshold Tuning` authority may adjust threshold overrides in Settings -> Agent; invalid values return Appendix I `agent_confidence_threshold_invalid`.

## 32.10.6 Agent Invocation and Configuration Endpoints {#32.10.6-agent-invocation-and-configuration-endpoints}

| Method | Path | Auth Scope | RBAC | Rate-Limit Class | Idempotency |
|---|---|---|---|---|---|
| GET | `/v1/orgs/{org_id}/agent-capabilities/{capability_id}/config` | read | admin | standard | N/A |
| PATCH | `/v1/orgs/{org_id}/agent-capabilities/{capability_id}/config` | write | admin | data_mutation | REQUIRED |

`PATCH` accepts `confidence_threshold_override`, `feedback_tuning_enabled`, and `version`.
Values outside `[0.000, 1.000]` return `agent_confidence_threshold_invalid`.
Threshold config endpoints MUST read / write §4.8.15 only and MUST never mutate §4.8.2 platform seed rows.

| Agent Threshold Tuning | `business_growth`+ | `seller_growth`+ | §21.3; §4.8.15; §32.10.6; §34.8.5 `agent_threshold_tuning` |
| `agent_threshold_tuning` | `n_a_non_ai` | `not_applicable` | `business_growth` | `seller_growth` | `agent_settings_upgrade_cta` |
| OrgAgentCapabilityConfig (§4.8.15) | Active override rows retained for Org-life. |
| `agent_confidence_threshold_invalid` | 422 | §21 / §32.10.6 agent invocation endpoints | Agent threshold override or registry default is outside `[0.000, 1.000]` (§4.8.2; §4.8.15; §21.3). | `error.agent.agent_confidence_threshold_invalid` |

`org_agent_capability_config`

**OrgAgentCapabilityConfig.** Org-scoped, console-scoped override row for Agent capability configuration.
**Agent Threshold Tuning.** Settings -> Agent surface that lets authorized admins set `OrgAgentCapabilityConfig.confidence_threshold_override`.

| Agent threshold tuning | §21.3, §21.8, §4.8.15, §32.10.6 | Settings -> Agent threshold sliders / numeric inputs | Gr, Sc, Ent, sGr, sSc, sEnt |

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `agent_threshold_config_contract_completeness` | api_contract_completeness | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/agent_threshold_config_contract_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §21 / §4.8.15 / §32.10.6 / Appendix catalogs only; product settings UI, config persistence, permission middleware, threshold tuning jobs, and runtime invocation suppression remain product-pack evidence) | pr_lint | Assertion. | M02.3 |
