# Fixture

### 22.13.1 `env_sourcera_kb_runner` {#22.13.1-env-kb-runner}

| Config | Required value | Notes |
|---|---|---|
| `MCP_SERVER_RATE_LIMITS` | Per `mcp.sourcera.com` server: 60 rps per Org, burst 120 | Configured at server registration. |

### 22.16.4 Observability & Metrics {#22.16.4-observability-and-metrics}

- MCP request count is tracked.

### 42.2.3 Alarm Rules - V12 Rewrite {#42.2.3-alarm-rules-v12-rewrite}

| Signal | Severity | Response | Runbook |
|---|---|---|---|
| MCP 429 rate is high | P2 | Page on-call | `RB-PERF-010` |

### 42.5.1 Runbook Inventory {#42.5.1-runbook-inventory}

RB-PERF-001 through RB-PERF-010 are seeded.

### 50.15.4 Detector Catalog - Four New Categories (Task Brief Verbatim) {#50.15.4-detector-catalog-four-new-categories}

No MCP detector exists.

### 50.15.5 SIM Signal-Class Catalog Extensions {#50.15.5-sim-signal-class-catalog-extensions}

No MCP signal exists.

#### `signal_integrity_monitor_signal_class_enum` (§48.4.12 constraint #5; extends §C.100)

`email_sender_reputation_drift`

#### M.5.71 v7.1.1 D-DEC-009 MCP Rate-Limit Launch Posture Canonicality addition (2026-07-09) {#m-5-71-v711-d-dec-009-mcp-rate-limit-launch-posture-canonicality-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `mcp_rate_limit_launch_posture_canonicality` | numerical_singleton_invariant | spec_binding_pending_pack_m02_3 | pr_lint | A 60/120 target is documented. | M02.3 |
