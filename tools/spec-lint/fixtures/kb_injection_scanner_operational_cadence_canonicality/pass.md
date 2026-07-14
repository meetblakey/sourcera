# Fixture

### 22.16.7 Security, Firewall & Residency Enforcement {#22.16.7-security-firewall-residency}

3. **Ingestion scanner.** At KB bootstrap/ingestion time, entries are scanned for injection patterns (`ignore previous`, `system:`, `<|im_start|>`, etc.) and flagged for Seller Team Lead review before going live. Implementation: `kb_injection_scanner`. Every scan result records `kb_injection_pattern_library_version`, `injection_pattern_matched[]`, `scanner_decision`, and `held_for_review`. False-positive discipline: the rolling 30-day false-positive rate MUST stay <= 1% of legitimate KB entries flagged; FPR > 1% opens Trust & Safety review. Monthly review: runbook `RB-TNS-001` / `kb_injection_scanner_monthly_review` reviews new injection techniques, prior-month false positives, and Submission Gate near-misses; output is surfaced in `kb_injection_scanner_fpr_dashboard`.

## 22.17 Acceptance Criteria {#22.17-acceptance-criteria}

46. **Prompt-injection ingestion scan.** KB ingestion runs the `kb_injection_scanner` capability on every new entry; each scan result pins `kb_injection_pattern_library_version`; rolling 30-day FPR stays <= 1% of legitimate KB entries flagged; FPR breach opens Trust & Safety review through `RB-TNS-001`; `kb_injection_scanner_fpr_dashboard` renders pattern-version, false-positive, review-outcome, and Submission Gate near-miss slices. QA tests: `kb_injection_scanner_active_gate`, `kb_injection_scanner_fpr_threshold`, `kb_injection_pattern_version_pinned`.

### 42.2.3 Alarm Rules - V12 Rewrite {#42.2.3-alarm-rules-v12-rewrite}

| Signal | Severity | Response | Runbook |
|---|---|---|---|
| `kb_injection_scanner_fpr_dashboard` reports FPR breach of the §22.16.7 target OR monthly `kb_injection_scanner_monthly_review` is overdue per §22.16.7 | P2 | freeze new `kb_injection_pattern_library_version` promotion until review closes | `RB-TNS-001` |

### 42.5.1 Runbook Inventory {#42.5.1-runbook-inventory}

RB-TNS-001 is titled `kb_injection_scanner_monthly_review` and contains the Trust & Safety checklist required by §22.16.7: new injection techniques, prior-month false positives, and Submission Gate near-misses.

### 50.14.6 Fraud Analyst Dashboard {#50.14.6-fraud-analyst-dashboard}

| Widget | Data Source | Purpose | Breach Alert |
|---|---|---|---|
| KB injection scanner FPR | PostHog `kb_injection_suspected` | `kb_injection_scanner_fpr_dashboard`: rolling 30-day false-positive rate by `kb_injection_pattern_library_version` | FPR breach |

**Trust & Safety extension.** `kb_injection_scanner_fpr_dashboard` is the Trust & Safety operational view. It renders `RB-TNS-001` monthly-review status.

### 50.14.10 Appendix Extensions (Authored) {#50.14.10-appendix-extensions}

- `ops_analytics_dashboard_kind`: `growth_pm`, `gtm_lead`, `support`, `fraud_analyst`, `finance`, `kb_injection_scanner_fpr_dashboard`.

### KB / MCP / Managed-Agent Events (added §22.9-§22.16)

| Event | Trigger | Key Properties |
|---|---|---|
| `kb_injection_suspected` | `kb_injection_scanner` flags an entry on ingestion (§22.16.7) | `kb_entry_id`, `kb_injection_pattern_library_version`, `injection_pattern_matched[]`, `scanner_decision`, `held_for_review` (Boolean), `review_outcome` |

### KB Injection Pattern Library Version (`kb_injection_pattern_library_version`, §22.16.7) (new)

`kb_injection_patterns_v1`

**Notes.**

- Every `kb_injection_scanner` result MUST pin `kb_injection_pattern_library_version`.
- Future values are append-only as `kb_injection_patterns_v{n}`.

### Audit Event Action Type - KB additions

- `kb_injection_suspected` payload: `kb_entry_id`, `kb_injection_pattern_library_version`, `injection_pattern_matched[]`, `scanner_decision`, `held_for_review_until`, `review_outcome` (§22.16.7).

#### M.5.72 v7.1.1 D-DEC-011 KB Injection Scanner Operational Cadence Canonicality addition (2026-07-09) {#m-5-72-v711-d-dec-011-kb-injection-scanner-operational-cadence-canonicality-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `kb_injection_scanner_operational_cadence_canonicality` | content_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/kb_injection_scanner_operational_cadence_canonicality.ts`) | pr_lint | §22.16.7 MUST name the <= 1% rolling-30-day FPR target. Starter-pattern-only text with no FPR/version/review discipline fails. | M02.3 |
