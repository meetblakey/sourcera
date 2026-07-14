### 48.8.3 Onboarding {#48.8.3-onboarding-surface-minutes-0-3}

The sequencer reads `provider_health_state(firecrawl)` at line-render time. The scanning line MUST NOT render during outage; §48.8.7 #7 applies. The line is replaced with `"Scanning yourcompany.com…"`. The pause is stored in `stage_3_firecrawl_outage_pause_ms` and checked against the Seller onboarding Stage-3 population-latency threshold.

#### M.5

| Gate | Row class | Runtime status | Context | Assertion | Pack |
|---|---|---|---|---|---|
| `firecrawl_outage_progress_line_substitution` | content | spec_binding_pending_pack_m02_3 | pr_lint + next.js render-path test + Datadog synthetic | Local guard `tools/spec-lint/gates/firecrawl_outage_progress_line_substitution.ts` and pass/fail fixtures protect the spec contract; deployed render-path and Datadog evidence remains required. | M02.3 |
