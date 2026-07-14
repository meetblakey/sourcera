# Fixture

### 22.13.1 `env_sourcera_kb_runner` {#22.13.1-env-kb-runner}

| Config | Required value | Notes |
|---|---|---|
| `MCP_SERVER_RATE_LIMITS` | Initial deployment target: 30 rps sustained / 60 rps burst per `mcp.sourcera.com` server. Target steady-state: 60 rps sustained / 120 rps burst after Anthropic per-MCP-server quota confirmation. | Conservative launch cap. |

**MCP rate-limit launch posture.** Until Anthropic per-MCP-server quota confirmation is recorded, production environments MUST deploy the initial 30 rps / 60 burst target. The SIM signal `mcp_rate_limit_confirmation_pending` remains open while the target steady-state is unconfirmed. Engineering Lead clears it only by writing `mcp_rate_limit_confirmation_log` in runbook `RB-PERF-011`, citing Anthropic documentation or support confirmation, the approved steady-state limit, approver, and effective date. Raising the live config to the 60 rps / 120 burst target before that log exists is forbidden.

### 22.16.4 Observability & Metrics {#22.16.4-observability-and-metrics}

- MCP 429 rate > 0.5% for 5 min OR `mcp_rate_limit_confirmation_pending` remains open inside 14 days of launch -> page on-call; runbook `RB-PERF-011`.

### 42.2.3 Alarm Rules - V12 Rewrite {#42.2.3-alarm-rules-v12-rewrite}

| Signal | Severity | Response | Runbook |
|---|---|---|---|
| `mcp_rate_limit_confirmation_pending` open inside 14 days of launch OR MCP 429 rate > 0.5% over 5 min during canary/launch | P2 | keep or revert to 30 rps / 60 burst until confirmation log exists | `RB-PERF-011` |

### 42.5.1 Runbook Inventory {#42.5.1-runbook-inventory}

RB-PERF-001 through RB-PERF-011 are seeded.

### 50.15.4 Detector Catalog - Four New Categories (Task Brief Verbatim) {#50.15.4-detector-catalog-four-new-categories}

| Detector | ID | Signal | Inputs | Auto |
|---|---|---|---|---|
| MCP rate-limit confirmation | `mcp_rate_limit_confirmation_detector_v1` | `mcp_rate_limit_confirmation_pending` | `mcp_rate_limit_confirmation_log` | auto-revert to 30 rps / 60 burst |

### 50.15.5 SIM Signal-Class Catalog Extensions {#50.15.5-sim-signal-class-catalog-extensions}

| Signal | Severity |
|---|---|
| `mcp_rate_limit_confirmation_pending` | warning (critical inside launch window or high 429 rate) |

#### `signal_integrity_monitor_signal_class_enum` (§48.4.12 constraint #5; extends §C.100)

`mcp_rate_limit_confirmation_pending`

**Notes.** D-DEC-009 MCP launch-safety signal.

#### M.5.71 v7.1.1 D-DEC-009 MCP Rate-Limit Launch Posture Canonicality addition (2026-07-09) {#m-5-71-v711-d-dec-009-mcp-rate-limit-launch-posture-canonicality-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `mcp_rate_limit_launch_posture_canonicality` | numerical_singleton_invariant | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/mcp_rate_limit_launch_posture_canonicality.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §22.13.1 MUST name the initial 30 rps / 60 burst launch target, the 60 rps / 120 burst steady-state target, and the confirmation workflow. A bare 60 rps / 120 burst row with no launch-safe posture fails. | M02.3 |
