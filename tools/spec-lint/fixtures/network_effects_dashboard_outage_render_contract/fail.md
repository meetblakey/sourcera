### 48.3.8 Outages {#48.3.8-third-party-outage-render-behavior}

| Pipeline | UI |
|---|---|
| PostHog Live Insights outage | `"Stale (last refreshed Nh ago)"` |
| Snowflake reverse-ETL outage | `"Stale (rollup pending)"` |
| Datadog metrics outage | `"Data pipeline temporarily unavailable — refresh"` |

| `network_effects_dashboard_outage_render_contract` | content | spec_binding_pending_pack_m02_3 | pr_lint + next.js render-path test | Local guard `tools/spec-lint/gates/network_effects_dashboard_outage_render_contract.ts` and pass/fail fixtures protect the spec contract; deployed four-path render evidence remains required. | M02.3 |
