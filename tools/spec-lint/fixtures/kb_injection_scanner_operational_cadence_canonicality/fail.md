# Fixture

### 22.16.7 Security, Firewall & Residency Enforcement {#22.16.7-security-firewall-residency}

3. **Ingestion scanner.** At KB bootstrap/ingestion time, entries are scanned for injection patterns (`ignore previous`, `system:`, `<|im_start|>`, etc.) and flagged for Seller Team Lead review before going live. Implementation: `kb_injection_scanner`.

## 22.17 Acceptance Criteria {#22.17-acceptance-criteria}

46. **Prompt-injection ingestion scan.** KB ingestion runs the `kb_injection_scanner` capability on every new entry; entries flagged as `kb_injection_suspected` are held for Seller Team Lead review before going `active`.

### 42.2.3 Alarm Rules - V12 Rewrite {#42.2.3-alarm-rules-v12-rewrite}

| Signal | Severity | Response | Runbook |
|---|---|---|---|
| KB scanner flags increase | P2 | Page on-call | `RB-PERF-010` |

### 42.5.1 Runbook Inventory {#42.5.1-runbook-inventory}

RB-PERF-001 through RB-PERF-010 are seeded.

### 50.14.6 Fraud Analyst Dashboard {#50.14.6-fraud-analyst-dashboard}

No KB injection FPR view.

### 50.14.10 Appendix Extensions (Authored) {#50.14.10-appendix-extensions}

- `ops_analytics_dashboard_kind`: `growth_pm`, `gtm_lead`, `support`, `fraud_analyst`, `finance`.

### KB / MCP / Managed-Agent Events (added §22.9-§22.16)

| Event | Trigger | Key Properties |
|---|---|---|
| `kb_injection_suspected` | `kb_injection_scanner` flags an entry on ingestion (§22.16.7) | `kb_entry_id`, `injection_pattern_matched[]`, `held_for_review` |

### Audit Event Action Type - KB additions

- `kb_injection_suspected` payload: `kb_entry_id`, `injection_pattern_matched[]`, `held_for_review_until` (§22.16.7).

#### M.5.72 v7.1.1 D-DEC-011 KB Injection Scanner Operational Cadence Canonicality addition (2026-07-09) {#m-5-72-v711-d-dec-011-kb-injection-scanner-operational-cadence-canonicality-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `kb_injection_scanner_operational_cadence_canonicality` | content_consistency | spec_binding_pending_pack_m02_3 | pr_lint | Starter patterns are documented. | M02.3 |
