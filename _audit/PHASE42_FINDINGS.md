# Phase 42 Findings — §42 Observability, Reliability & Disaster Recovery

**Scope.** Master Spec v7.1.0 §42.1 through §42.7 inclusive of §42.3.1, §42.4.1, §42.4.2, §42.6.0, §42.6.1 (lines 32338–32613). Eight prompt-mandated checks:

1. SLOs per service (latency p99, error rate, availability).
2. Logs: structured logging schema; PII scrubbing.
3. Metrics: every revenue-affecting event has a metric.
4. Traces: distributed tracing across MCP, Managed Agents, Stripe, WorkOS.
5. Alerting: every SLO violation pages.
6. Runbooks: every alert links to a runbook.
7. RTO/RPO targets per service.
8. DR drills cadence.

Also walks the full Master Spec convention checklist (entity definition, ACs, enums, glossary, state machines, APIs, webhooks, plan gating, retention/privacy, numerical singletons, heading syntax, surface/engine mapping, console firewall, edge cases) for every concept §42 introduces or implies.

**Date.** 2026-05-11.

**Inputs read end-to-end.** §42 in full (lines 32338–32613); §34.1.1 / §34.1.2 plan-tier SLA cells (lines 29091, 29131); §44.1 Performance Targets table (lines 32719–32741); §44.2 Agent Performance Budgets (lines 32742–32763); §44.5 Performance ACs; §1.5 Stack table (line 1404); §25.6.2 Cross-Console Bridge alerting + runbook anchors (lines 21121–21197); §50.4 Impersonation Audit (line 38901, cited by §42.6.0 as "Ops Activity Log"); §50.14 Internal Analytics Dashboards by Role (line 40298, cited by §42.6.0 as "Ops Health Dashboard"); Appendix I error code catalog (preamble at line 44020; `dr_game_day_overdue` at line 49856; `audit_chain_break_detected` at line 44190); Appendix M.1 mapping (banner search); Appendix J controlled-vocabulary registry (enum search); Appendix K Glossary (term search for SLO / SLA / RTO / RPO / MTTR / Postmortem / Runbook / War-Room / Statuspage / Game-Day / Burn-Rate / Error Budget); Appendix C Notification Event Catalog; Appendix G PostHog Event Taxonomy. Cross-cuts: F-599 / F-600 / F-601 / F-602 / F-603 / F-604 / F-605 / F-606 / F-607 in `_audit/FEATURE_INVENTORY.md`; F-AE-016 (Enterprise SLA breaking change AE) and F-AE-018 (External Provider Health Detectors AE).

**Verdict.** §42 is **structurally underbuilt for the load-bearing role it plays.** The chapter is 275 lines (32338–32613) but is the canonical home for: every SLO the platform commits to internally, every alarm threshold, every alarm-to-runbook bridge, every incident response procedure, every postmortem cadence, every DR target, every provider-health detector, and the audit-integrity background-job catalog. Inbound citations from §25.6.2 ("§42.5 Runbook Inventory"; "§42.3 escalation policy (primary 5m → secondary 10m → manager 15m)"), §50.6.4 ("§42"), §44.1 (performance budgets that imply but do not bind §42 alarms), and ~14 other sites expect more contract at §42 than §42 actually authors. Roughly the inverse problem of §41 (which is silent and ambient-dependent): §42 has the right tools listed (Pino, Datadog, OpenTelemetry, Sentry, Statuspage.io, PagerDuty, Notion runbooks) but lacks the contract that binds tool to obligation. A junior engineer reading §42 end-to-end can determine which vendors to integrate with, but cannot determine (a) which services have which SLOs, (b) what fields are in a log row, (c) what trace context propagates across MCP / Stripe / WorkOS boundaries, (d) which alarms are required for which SLO, (e) what RTO each service carries, (f) what success criteria a DR drill must meet.

§42 also fails the revenue-leakage prompt rule outright: the most revenue-affecting surfaces in the platform — AIOperation metering (§4.8.1), AIWallet debit/credit (§4.8.3), OutcomeContract settlement (§34.11), Stripe meter-event submission (§34.10.5), invoice finalization (§34.18.5) — have **zero §42.2 alarms** and **zero §42.6 SLO bindings**. The only Stripe alarm is `stripe_charge_failure_burst` at §42.6.0 (charge-failure rate > 2% over 1 hour), which detects gross outage but not silent revenue leakage (e.g., AIOperations accepted but failing to write a Stripe meter event, OutcomeContracts settling but failing to debit the wallet, Solo per-eval charges failing the §34.2.5 7-day-refund-window state machine). Per the prompt's explicit P0 rule ("P0 for any revenue-affecting service without SLO/alerting") and per the Defect Ledger Format P0 rule (d) ("billing surface ... ambiguous in a way that allows revenue leakage or double-charge"), this is the chapter's defining defect.

Filed 30 defects across the eight prompt checks and the full convention checklist: **P0 = 1 · P1 = 19 · P2 = 8 · P3 = 2 · total = 30.**

**Self-challenge pass.** Re-read each filed defect after first draft as a hostile staff engineer. Cell sharpenings: (a) D-42-001 originally bundled AIOperation + AIWallet + OutcomeContract + Stripe meter-event into a single defect — sharpened to enumerate each revenue-affecting metric independently so a remediation pack cannot close one bullet and leave the others open; (b) D-42-005 originally pointed only at "broken §25.6 → §42.5 citation" — sharpened to also bind the §25.6.2 5m/10m/15m three-step escalation citation (which §42.3 / §42.5 do not author; §42.5 carries only a single-step 10-minute escalation), so the remediation cannot close the runbook half and leave the escalation half open; (c) D-42-021 originally flagged inline thresholds as a "consistency_drift" — re-classed to `numerical_singleton` since the actual rule violated is Authoring Convention #10 (one authoritative home for every numerical value); (d) D-42-022 (broken citation to §50.4 / §50.14) originally drafted at P0 on a residual PII-leakage theory — demoted to P2 because the citation drift is a documentation error rather than a runtime PII risk; the runtime audit-log destination is determined by the implementation, not the citation. No defects demoted from P0 except where the rule explicitly did not apply.

**Counterfactual pass.** Three realistic failure modes the spec must handle and §42's coverage:

1. **AIOperation acceptance but Stripe meter-event submission silently fails for 4 hours.** Per §34.10.5, every accepted AIOperation must write a Stripe meter event for invoice line-item accumulation. If the meter-event submission path silently 5xx's (e.g., Stripe API change, signing key rotation, regional outage), accepted AIOperations are not billed but value is delivered. §42.6.0 `stripe_charge_failure_burst` detects charge failures at 2% over 1 hour, NOT meter-event submission failures (those happen out-of-band, not at charge time). §42.2 has no alarm. §42.6 has no metric. The §51.2.5 UsageEventValidator (cited in line 44679) catches schema violations but not delivery failures. **Captured by D-42-001, D-42-020.**

2. **Anthropic MCP proxy hangs (not 5xx; 100% response latency).** §42.6.0 `anthropic_mcp_proxy_degraded` triggers on `(5xx + timeout) / total > 1% over 15 minutes`. A latency-only failure mode (responses arrive but take 60s+ each, no timeouts, no 5xx) is not detected. AIOperations accumulate in the queue; customer-visible latency degrades; no banner fires; no PagerDuty page. **Captured by D-42-004, D-42-006.**

3. **EU residency partition Convex shard fails; same-region replica also fails.** §42.4.1 says traffic degrades to read-only with `residency_failover_blocked` (Appendix I; HTTP 503). Customer-visible banner per §42.4.1 fires. But (a) DR-drill rehearsal scope does not include this scenario (DR drills are per §42.4.2 "quarterly DR restore tests" and §42.4.1 "quarterly game-day exercising same-residency replica failover" — i.e., they exercise failover, not concurrent-replica-loss), and (b) the customer-visible read-only-degraded banner has no Appendix M.1 row, no `partial_state` enum value, and no test coverage. **Captured by D-42-014, D-42-019.**

---

## Walking the eight checks

### Check 1 — SLOs per service (latency p99, error rate, availability)

**FAIL.** §42.1 customer-SLA table sets only one customer SLA value: Enterprise 99.9% uptime + 4-hour critical response. Free / Starter / Growth / Scale are "None (best effort)." §42.2 "Key Metrics" enumerates six metric *families* (API latency p50/p95/p99, error rate 4xx/5xx, DB query latency, Convex Storage latency, Agent API latency and cost, webhook delivery success rate) — but binds **zero SLO targets** to those metric families. §44.1 has the latency budget (FCP < 1s, TTI < 2s, p95 < 500ms, p99 < 1s, real-time subscription < 200ms, search < 200ms, EvalStarter < 2.5s / 4.5s, Defense View < 8s, etc.) but those are budgets, not SLOs — they have no observation window, no error budget, no burn-rate alarm, no per-service decomposition.

Missing per-service SLO breakdowns: Convex query (general) p99; Convex query (collaborative-scoring real-time) p99; Stripe webhook ingest p99; Stripe meter-event submit p99; Anthropic Managed Agent API per-capability p99; Firecrawl scrape p99; MCP proxy per tool-call p99; Pinecone (vector index) p99; PostHog outbox ingest p99; Loops.so dispatch p99; WorkOS SSO callback p99. Availability target for each (separate from the platform-wide 99.9% Enterprise customer SLA — Enterprise SLA is the customer-committed external promise; internal service SLOs are typically tighter, e.g., 99.95% Convex availability so that the customer-facing 99.9% has slack).

Error-rate SLO: §42.2 alarm "Error rate > 1%" is platform-wide, not per-service. The Stripe webhook ingest error rate, Anthropic Managed Agent error rate, Firecrawl error rate, search index error rate are all amalgamated.

Per-Agent latency / cost SLO: §42.2 line 32361 names "Agent API latency and cost" as a metric family but binds no threshold; §44.2 publishes per-tier Agent cost ranges but those are budgets, not alarms. The §22 Managed Agent harness has retry semantics (§22.8) but the harness-level p99 SLO is not authored.

→ **D-42-001** (revenue-affecting services without SLO/alerting — P0); **D-42-004** (per-service SLO breakdown + burn-rate/error-budget — P1).

### Check 2 — Logs: structured logging schema; PII scrubbing

**FAIL.** §42.6 row 1: "Structured logs (JSON) for all API requests, errors, state changes" via Pino → Datadog. That is a tool selection, not a schema. Specific gaps:

- **Schema.** No log-row schema authored. Industry-standard required fields for a structured log row in a multi-tenant, residency-bound, AI-billing platform: `timestamp`, `level`, `service`, `route`, `method`, `status_code`, `latency_ms`, `request_id` (correlates to `X-Request-Id` header), `trace_id` (correlates to OpenTelemetry trace), `span_id`, `org_id`, `console`, `user_id`, `actor_kind` (`customer` / `managed_agent` / `ops` / `internal_cron`), `error_code` (when applicable, matches Appendix I), `error_subkind` (Appendix J `error_subkind` enum), `plan_tier`, `residency_region`, `legal_entity` (per §4.8.1 invoice routing), `audit_event_id` (when the log row corresponds to a §4.6.1 AuditEvent), `posthog_distinct_id` (for cross-tool correlation). None of these are bound at §42.
- **PII scrubbing.** §6.7 covers secret redaction (`loops_*_secret*`, line 7420) but does not cover field-level PII in log payloads. A request that POSTs `{ "email": "foo@bar.com", "phone": "+1234567890" }` will, in a naive Pino setup, log the body. Sourcera's PII surfaces (vendor stakeholder PII per §27.11; buyer evaluator PII per §6.8.4; KB-uploaded customer documents per §22.6.3) must be redacted at log-emit time. The redaction transform, the redaction registry (which field paths are scrubbed), the test that asserts redaction on every PII-bearing request — all unauthored. This is a §6.8 DSAR-cascade adjacency: logs containing pre-pseudonymization PII for a subject who later issues a right-to-erasure are a cascade-target surface (§42.4.2 backup re-pseudonymization handles backups; logs are a separate retention surface and the cascade is silent on them).
- **Log retention.** §40.2 should be the authoritative home; §42 should cite §40.2. §42 carries no retention citation. A log row holding org-scoped PII is subject to §6.8 DSAR cascade and §40.2 retention; the cascade-to-logs bridge is unauthored.
- **Sampling.** Production log volume on a multi-tenant Convex deployment is large; the sampling strategy (always-on for error rows; sampled for info; head-based vs tail-based) is unauthored.
- **Per-residency log routing.** Logs containing EU subject PII MUST route only to EU-resident Datadog ingest (per §1.6 residency and §42.4.2 backup-residency policy). §42.6 does not state this. If Datadog ingest is regional, this is a GDPR Chapter V third-country-transfer risk on the log surface — analogous to the §42.4.1 / §42.4.2 D-RES remediation but on the observability path.

→ **D-42-002** (log schema, PII scrubbing, retention, sampling, per-residency routing — P1).

### Check 3 — Metrics: every revenue-affecting event has a metric

**FAIL.** Revenue-affecting events in the platform — AIOperation acceptance/rejection (§4.8.1), AIWallet debit/credit (§4.8.3), wallet auto-topup outcome (§34.10), OutcomeContract settlement (§34.11), Solo per-eval / per-bid charge (§34.2.5), Stripe invoice line-item write (§34.10.5), Stripe charge success/fail, refund processing (§34.2.5 refund window), volume-discount band crossing (§34.2.4), CostBaseRecalculationLog (§4.8.6 / §34.3.3) — these are the events that produce or block revenue. §42.2 names "API latency", "Error rate", "DB query latency", "Convex Storage latency", "Agent API latency and cost", "Webhook delivery success rate". None of the revenue-affecting families.

Specific gaps:
- No `aiop.accepted_count` / `aiop.rejected_count` / `aiop.value_dollars_accepted` metric registered at §42.
- No `wallet.debit_success_rate` / `wallet.auto_topup_success_rate` metric.
- No `outcome_contract.settlement_latency_ms` / `outcome_contract.settled_count` metric.
- No `stripe.meter_event.submit_success_rate` / `stripe.invoice.finalize_success_rate` metric.
- No `solo.per_eval.charge_success_rate` / `solo.per_bid.charge_success_rate` metric.

The §51.2.5 UsageEventValidator catches schema violations at the event-envelope layer; that is necessary but not sufficient. A submitted-but-not-acked Stripe meter event will pass UsageEventValidator and silently fail downstream.

→ **D-42-001** (P0 — revenue-affecting metrics absent); **D-42-020** (CI gate `revenue_metric_coverage` — P1).

### Check 4 — Traces: distributed tracing across MCP, Managed Agents, Stripe, WorkOS

**FAIL.** §42.6 row 3: "OpenTelemetry → Datadog" with "Distributed request tracing (API → DB → Agent)." That is a tool selection, not a contract. Specific gaps:

- **Trace context propagation.** OpenTelemetry W3C Trace Context (`traceparent`, `tracestate` HTTP headers) must propagate from inbound customer request through Convex internal calls, through MCP proxy calls to Anthropic Managed Agent API, through Stripe webhook ingest, through WorkOS SSO callback, through Firecrawl scrape, through PostHog ingest, through Loops.so dispatch. The propagation contract is unauthored. Without explicit propagation contract, the trace breaks at every cross-process boundary and the spec's promise of "Distributed request tracing" is unimplementable.
- **Span naming.** No span naming convention. A span for "AIOperation acceptance" must have a consistent name across all sites that emit it; otherwise dashboards are unbuildable.
- **Sampling rate.** No sampling policy. Head-based sampling at the edge vs tail-based at the collector — both are valid; the choice affects what is observable. Unauthored.
- **Cardinality budget.** OpenTelemetry attributes have cardinality cost. `org_id`, `user_id`, `requirement_id`, `vendor_id` are unbounded; PostHog handles this via the cardinality budget at §51 / Appendix G; the OpenTelemetry equivalent is unauthored.
- **Cross-tool correlation.** A trace_id should appear in the corresponding log row (Datadog), the corresponding PostHog event, the corresponding Sentry exception, the corresponding audit_event. §42 does not state the contract.
- **MCP-specific concern.** Anthropic Managed Agents API takes a tool-call graph; each tool call must inherit the parent trace context so the Sourcera-side trace shows the full Managed Agent execution. §22 retrieval / tool-use spec does not bind trace context propagation; §42 does not either.

→ **D-42-003** (trace context propagation contract — P1).

### Check 5 — Alerting: every SLO violation pages

**PARTIAL.** §42.2 has 5 alarm rules; §42.6.0 has 9 provider-degraded detectors; §42.6.1 has audit-integrity alarms (`audit_chain_break_detected`, `audit_event_chain_break_detected`, `audit_integrity_batch_latency_high`, `audit_integrity_job_timeout`); §25.6.2 has Cross-Console Bridge alarms (RB-001..RB-010). But the §44.1 performance targets and the implicit SLOs are not paired with alarms:

- **FCP / TTI alarms.** §44.1 FCP < 1s, TTI < 2s. No §42 alarm.
- **Real-time subscription latency alarm.** §44.1 < 200ms (active-edit scoring deltas). No §42 alarm.
- **Convex Reactive Query Commit-to-Render SLO.** §44.1 p95 ≤ 500ms / p99 ≤ 1s (general scope, non-collaborative-scoring). No §42 alarm.
- **Search index latency alarm.** §44.1 < 200ms. No §42 alarm.
- **EvalStarter materializer SLO.** §44.1 p95 < 2.5s (Free) / < 4.5s (Solo+). No §42 alarm.
- **Defense View generation SLO.** §44.1 p95 < 8s. No §42 alarm.
- **Defense View PDF export SLO.** §44.1 p95 < 3s. No §42 alarm.
- **AI Wallet exhaustion rate alarm.** Per §34.10.1, wallet state transitions to `hard_capped_100` block AIOperations. A burst of hard-cap transitions across many Orgs is a revenue / customer-experience signal. No alarm.
- **DSAR cascade SLO breach.** §6.8.6 sets a 30-day fulfillment SLA; §42 has no alarm on cascade-job-failure rate or SLO-breach rate.
- **Agent latency / cost SLO.** §42.2 names the metric family but binds no threshold; §44.2 Sonnet 10–30s / Opus 30–60s per requirement are budgets, not alarms.
- **Per-tier wallet auto-topup failure rate.** §34.10 auto-topup runtime-denial code exists (Appendix I); no §42 alarm on the rate.

→ **D-42-006** (per-SLO alarm coverage — P1).

### Check 6 — Runbooks: every alert links to a runbook

**FAIL.** §42.6 row 7: "On-Call Runbooks: Stored in Notion. Linked from Datadog alerts. Cover: common SEV-1/2 scenarios, diagnostic steps, mitigation playbooks, rollback procedures." That is a one-paragraph promise, not a contract. Specific gaps:

- **No Runbook Inventory.** Cited inbound at §25.6.4 ("§42.5 Runbook Inventory") and §25.6.6.4 ("Anchor authorship and revisions are governed by §42.5"). §42.5 has no Runbook Inventory; §42.5 is the on-call rotation block. Broken citation cluster.
- **No required-runbook-per-alarm contract.** Of the ~30 alarms scattered across §42.2, §42.6.0, §42.6.1, §25.6.2 RB-001..RB-010, §6.8 DSAR-cascade alarms, the marketplace abuse SLA at §42.3.1, the Cross-Console Bridge alarms, the PostHog outbox saturation, only the §25.6.2 set explicitly anchors a runbook (RB-001..RB-010). The rest have no runbook anchor binding.
- **No CI gate.** Every alarm should map to a runbook anchor; that mapping should be CI-gated. No `alarm_runbook_link_completeness` gate in Appendix M.5.
- **No runbook authorship convention.** Per-runbook owner, last-reviewed timestamp, freshness SLO (e.g., runbooks must be reviewed quarterly), runbook-stale alarm (Datadog SEV-3 if a linked runbook has `last_reviewed_at > 90 days`). Unauthored.
- **No runbook retention.** Notion-hosted runbooks have implicit retention; §40.2 should declare. Unauthored.
- **Broken three-step escalation citation.** §25.6.2 line 21134 cites "§42.3 escalation policy (primary 5m → secondary 10m → manager 15m)". §42.3 does not author this. §42.5 has a single-step 10-minute escalation ("Page timeout escalation: 10 minutes → escalate to secondary"). No manager-level escalation; no 5-minute primary timeout. Two broken citations, both from §25.6.

→ **D-42-005** (Runbook Inventory + broken citations from §25.6 — P1); **D-42-019** (alarm → runbook CI gate — P1; pair with D-42-005).

### Check 7 — RTO/RPO targets per service

**PARTIAL.** §42.4 sets a platform-wide RTO/RPO of 1 hour per residency region (V9 remediation closed D-RES-011). That is correct for the platform but does not decompose per service. Different services have different recovery profiles:

- **Convex shard recovery.** Convex-managed; in practice minutes, not an hour.
- **Stripe replay.** Stripe is third-party-managed; not a Sourcera-side recovery target. The Sourcera-side Stripe webhook idempotency contract (§31) handles replay.
- **PostHog outbox drain.** §42.6.0 `posthog_outbox_saturated` triggers at outbox depth > 1000 OR p95 ingest latency > 60s. If the outbox saturates for an hour, drain time may exceed the RTO.
- **Loops.so re-dispatch.** Provider-managed; Sourcera-side fallback unauthored (cross-ref D-41-005).
- **Audit-integrity background-job recovery.** §42.6.1 has hard-kill timeouts and resume-from-cursor semantics; the RTO for re-running a failed audit-integrity job is implicit but not bound.
- **Search index rebuild.** Pinecone or Convex search; rebuild time for a multi-million-row index can exceed 1 hour. Unauthored.
- **Vector index rebuild.** §22 KB retrieval depends on a vector index; rebuild RTO unauthored.

→ **D-42-013** (per-service RTO/RPO — P1).

### Check 8 — DR drills cadence

**PARTIAL.** Cadence is authored:
- §42.4.1 AC #5: "Per-region game-day rehearsal MUST execute quarterly per residency partition" with `dr_game_day_overdue` Datadog SEV-3 alarm (Appendix I row at line 49856).
- §42.4.2 AC: quarterly DR restore tests per residency staging stack.
- §42.7 AC #5: "Restore test passes quarterly (data integrity verified)."

But scope and success criteria are not bound:

- **Drill scope.** Which scenarios? Regional outage (covered by AC #5 same-residency failover), Convex shard loss, Stripe outage, Anthropic outage, DSAR cascade replay, audit-chain restore from snapshot, PostHog outbox drain, residency-bound backup restore, concurrent primary + replica outage (the §42.4.1 "fail closed" path). None of these are an enumerated drill scenario; the scope is implicitly "same-residency replica failover" only.
- **Success criteria.** "Data integrity verified" (§42.7 AC #5) is undefined. Which rows are spot-checked? Which hash chains are verified end-to-end (the §42.6.1 audit-chain job? §17.8 SelectionRecord hash? §25.3.5 VendorDisqualificationRecord hash chain?)? What is the row-coverage target?
- **RTO / RPO assertion in the drill.** Does the drill measure actual RTO and RPO and assert against the §42.4 1-hour target? Unauthored.
- **Customer-visible degradation banner assertion.** Per §42.4.1, the read-only-degraded banner fires on concurrent primary + replica outage. Drill should assert the banner renders. Unauthored.
- **Drill outcome retention and post.** §40.2 retention for drill outcome reports; internal publish vs Statuspage-published drill outcomes; cross-reference to compliance evidence packs. Unauthored.
- **Drill failure escalation.** What happens if the drill fails (RTO not met, data integrity check fails)? Auto-rollback of the next release? PagerDuty page? Unauthored.
- **Participant rotation.** Who participates? On-call only? Cross-functional (engineering + ops + security + customer success for the customer-comms portion)? Unauthored.

→ **D-42-014** (DR-drill scope + success criteria + outcome retention — P1).

---

## Walking the global convention checklist

### Entity definition (§4 conventions)

§42 implies several entities. None defined per §4 (Field | Type | Constraints | Notes; id, org_id where applicable, console enum where applicable, created_at, updated_at, created_by, updated_by, deleted_at; scope isolation; required indexes; retention rules):

- **IncidentRecord.** §42.3 declares an incident lifecycle but no entity. Required for postmortem persistence, RCA tracking, statuspage subscription, customer-facing incident history.
- **PostmortemRecord.** §42.3 says "Postmortem scheduled within 24 hours; RCA completed within 48 hours; Postmortem Artifacts: Root cause analysis, Contributing factors, Preventive actions, Action items." Entity unauthored.
- **ProviderHealthState.** §42.6.0 declares 9 named provider states and severity-routing rules but no entity. Required for state-transition audit, severity escalation timer enforcement, dashboard rendering, customer-visible banner subscription.
- **OnCallShift.** §42.5 declares a weekly rotation but no entity. Required for paging logic, escalation, audit (who was paged for which incident).
- **RunbookEntry.** §42.6 declares Notion-hosted runbooks but no entity. Required for the alarm → runbook bridge CI gate (D-42-019), runbook-stale alarm, runbook freshness SLO.
- **StatuspageIncident.** §42.3 step 4 declares Statuspage notifications for SEV-1/2 but no entity. Required for subscription model, residency-aware routing, retention.
- **DrDrillRun.** §42.4.1 / §42.4.2 declare quarterly DR drills but no entity. Required for outcome retention, success-criteria assertion, audit.
- **AuditIntegrityScanRun.** §42.6.1 declares the integrity job catalog and the `ops_job_runs` reference, but `ops_job_runs` is mentioned as a destination table without entity definition (Field | Type | Constraints | Notes). The §42.6.1 prose names columns implicitly (`cursor_position`, `mismatches_found`, etc.) but does not author the entity.

→ **D-42-007** (entity definitions — P1).

### Acceptance criteria (§13.10 / §14.9 / §17.8 / §20.7 style)

§42.7 has six ACs, none numbered, none with measurable thresholds:

1. "Uptime SLA met per month (tracked via Datadog dashboard)." Threshold? "Met" against the 99.9% Enterprise target — but Enterprise is plan-tier-specific; what about non-Enterprise? Observability hook? Dashboard URL? Alarm at threshold? Single-source binding to §34.1?
2. "All SEV-1 incidents have RCA posted within 48 hours." 48 wall-clock hours or 48 business hours? Missed-RCA escalation? Where is the postmortem stored (Notion? a SourceraOps repo?)? Retention? CI gate?
3. "Postmortem action items tracked and closed within 30 days." Tracked where (Linear? Notion? §50 Ops console)? Closed by whom? Missed-closure escalation? Why 30 days and not 60 or 14?
4. "Alert false positive rate < 5% per month." "False positive" undefined. Who computes? Per-alarm or aggregate? Dashboard? Threshold-action plumbing?
5. "Restore test passes quarterly (data integrity verified)." "Data integrity verified" undefined (see D-42-014). Scope undefined.
6. "On-call team trained on all runbooks (quarterly review)." Tracked how? CI gate? Missed-training escalation? Onboarding requirements for new on-call rotation members?

§42 sub-sections do have some numbered ACs (§42.4.1 has 5 numbered ACs; §42.4.2 has 7) — those are exemplary. The §42.7 prose ACs are the gap.

→ **D-42-012** (§42.7 numbered, testable ACs — P1).

### Enum registration (Appendix J)

§42 introduces multiple enums or enum families; none registered in Appendix J:

- **`incident_severity_kind`** — `sev_1` / `sev_2` / `sev_3`. Cited at §42.3 prose only; no enum registration.
- **`provider_health_state_kind`** — `healthy` / `degraded` / `recovering`. Per-provider variants at §42.6.0: `anthropic_mcp_degraded`, `firecrawl_degraded`, `stripe_degraded`, `workos_degraded`, `posthog_outbox_saturated`, `loops_degraded`, `convex_degraded`, `perplexity_degraded`, `zendesk_degraded`. These are state names but not registered as Appendix J enum values; CI gate `usage_event_envelope_enum_violation` (Appendix I line 44679) would not catch a typo because the values are not bounded enums.
- **`dr_event_kind`** — `failover_initiated`, `failover_completed`, `read_only_degraded`, `game_day_started`, `game_day_completed`, `drill_failed`. Cited at §42.4.1 ("Failover events are emitted to the `dr-events` PagerDuty queue at SEV-2") without enum registration.
- **`runbook_status`** — `current` / `stale` / `retired`. Cited at §25.6.4 "every change logged with author + date per §42.5" implicitly.
- **`postmortem_status`** — `draft` / `under_review` / `published` / `closed`. Cited at §42.3 prose only.
- **`statuspage_incident_status`** — `investigating` / `identified` / `monitoring` / `resolved` (Statuspage convention). Cited at §42.3 prose.
- **`on_call_role_kind`** — `primary` / `secondary` / `manager` (the latter cited inbound from §25.6.2 "manager 15m" but not registered).

→ **D-42-008** (enum registrations — P1).

### Glossary (Appendix K)

Appendix K is the canonical glossary per Phase 12.3 amendment. None of the following terms appear in Appendix K, despite being used across multiple sections:

- **SLO** (Service Level Objective; distinct from SLA — customer-committed vs internal target). Used at §42.2, §44.1, §44.5, §7.5.3.
- **SLA** (Service Level Agreement; customer-committed). Used at §34.1.1, §34.1.2, §42.1, §29.9, BPS §6, SPS §8.
- **RTO** (Recovery Time Objective). Used at §42.4, §42.4.1, §42.4.2.
- **RPO** (Recovery Point Objective). Used at §42.4, §42.4.1, §42.4.2.
- **MTTD** (Mean Time to Detect). Implied by §42.6.0 detector thresholds.
- **MTTR** (Mean Time to Resolve). Implied by §42.3 process.
- **Postmortem.** Used at §42.3, §50.6.4, §25.6, §42.7 AC #2.
- **RCA** (Root Cause Analysis). Used at §42.3 process and §42.7 AC #2.
- **Runbook.** Used at §42.6, §25.6.4, §25.6.6.4, §50.6.4.
- **War Room.** Used at §42.3 process.
- **Statuspage** (the customer-facing public status page). Used at §42.3, §42.6, §1.5.
- **Game-Day** / **Game-Day Rehearsal.** Used at §42.4.1 AC #5.
- **DR Drill.** Used at §42.4, §42.7.
- **Burn-Rate Alarm.** Implied; not present in spec.
- **Error Budget.** Implied; not present in spec.
- **Break-Glass.** Used at §50.6.4 and §6.7.5 (impersonation); should disambiguate from DR break-glass (operator override of residency lock per §42.4.2 cross-region replica DPA approval).

→ **D-42-009** (glossary entries — P1; pair with `appendix_k_glossary_canonicality` CI gate).

### State machines (§ convention #5)

§42 implies state machines but authors none as From / To / Trigger / Conditions / Notes tables:

- **Incident lifecycle.** §42.3 prose: detected → on-call paged → severity assigned → war room opened → customer notified → mitigation → all-clear → postmortem scheduled → RCA → action items closed. Prose, not a table. Convention #5 prohibits prose state descriptions.
- **Provider-Health state machine.** §42.6.0: healthy → degrading (detection threshold crossed) → degraded (5-consecutive-minute confirmation) → recovering (clear-threshold met) → healthy. With severity escalation timers (P3 → P2 at 30 min → P1 at 4h → P0 at customer-visible block). Per-provider variants. No state-machine table.
- **DR failover state machine.** §42.4.1: primary_healthy → primary_unhealthy → failover_initiated → failover_complete → primary_recovering → primary_healthy. Same-residency replica only; concurrent primary + replica outage → read_only_degraded → forbidden_cross_residency. No state-machine table.
- **Postmortem lifecycle.** draft → under_review → published → closed. No state-machine table.
- **Statuspage incident lifecycle.** investigating → identified → monitoring → resolved (Statuspage convention). No state-machine table.
- **DR-drill outcome lifecycle.** scheduled → in_progress → succeeded / failed / aborted → report_drafted → report_published. No state-machine table.

→ **D-42-010** (state-machine tables — P1).

### APIs (§32 conventions)

§42 declares no API endpoints. Multiple implicit dependencies need them:

- **Statuspage incident update.** Sourcera writes to Statuspage when an incident is opened/updated/resolved (§42.3 step 4). Statuspage publishes a write API; Sourcera must call it; no §42 contract for the call.
- **Ops incident-search API.** Ops Console must search incidents (§50). Endpoint, auth scope, pagination, rate limit class unauthored.
- **On-call rotation read API.** PagerDuty offers a read API; Sourcera's on-call surface (Ops Console; possibly customer-facing for Enterprise) consumes it. No §42 contract.
- **Runbook lookup API.** When a Datadog alert fires, the on-call surface should resolve the runbook link from the Runbook Inventory (D-42-005). No §42 contract.
- **Customer-facing incident-history API.** Enterprise customers per §34.1 cell **SLA** may need historical incident data; no API contract.
- **DR drill outcome API.** Ops Console DR-drill outcome submission; no contract.

→ **D-42-011** (API endpoint contracts — P1).

### Webhooks (§31 conventions)

§42 declares no outbound webhook contract. Multiple implicit dependencies:

- **Statuspage incident subscription.** Statuspage manages its own subscription email/SMS dispatch; Sourcera writes to Statuspage. But Sourcera-direct customer webhook subscription for incidents (e.g., Enterprise customer firehose subscription to Sourcera's incident stream for their own SOC) is unauthored.
- **SLA-breach notification webhook.** Per §42.1, Enterprise customers have a 99.9% uptime SLA. Webhook to notify customer on SLA breach unauthored (and the §41 transactional template family does not register an SLA-breach notification email).
- **Provider-degraded-state-change webhook.** Customer-subscribable webhook for "Stripe degraded" → customer's billing dashboard could show a banner. Unauthored.
- **DR-failover-event webhook.** §42.4.1 "Failover events are emitted to the `dr-events` PagerDuty queue at SEV-2" — internal only. Customer-facing equivalent unauthored.

Per §31 webhook convention, each of the above needs HMAC-SHA256 signing, idempotency via `event_id`, exponential backoff, DLQ after 5 failures, payload ≤256KB, registration in Appendix C (Notification Event Catalog) and Appendix G (PostHog Event Taxonomy). None registered.

→ **D-42-015** (customer-subscribable webhook contracts — P1).

### Plan gating (§5.11 / §34.1 / §39)

§42.1 plan-tier SLA table inline-restates values from §34.1.1 cell **SLA** and §34.1.2 cell **SLA**. Per Authoring Convention #10 ("Inline references cite the source table; numerical limits are NEVER duplicated inline"), §42.1 should cite the §34.1 cells by reference, not inline. The §42.1 preamble does cite §34.1 ("Customer-contract SLAs are gated per §34.1.1 / §34.1.2 cell **SLA**") but the table itself inline-states the values, creating two homes for the same numerical contract.

Solo tier (`buyer_solo` / `seller_solo`) is also omitted from the §42.1 table. §34.1.1 Buyer Solo cell **SLA** is "None"; §34.1.2 Seller Solo cell **SLA** is "None". The §42.1 row collapses Free / Starter / Growth / Scale into a single "None (best effort)" row but does not include Solo — a junior reader cannot determine whether Solo is "best effort" or "subject to evaluation-window guarantees per §34.2.5" (the per-evaluation refund window) without cross-reading.

→ **D-42-018** (plan-tier SLA table inline restatement + Solo omission — P1).

### Retention and privacy (§40.2 / §6.8)

§42 implies multiple data classes; none state retention or DSAR behavior:

- **IncidentRecord / PostmortemRecord.** Postmortems often contain customer references ("Org X's wallet failed to auto-topup", "Vendor Y's bid was lost"). DSAR cascade compatibility on postmortem narrative text is silent. §42.4.2 backup re-pseudonymization handles backups; postmortem documents are a separate retention surface and the cascade is silent on them.
- **ProviderHealthState transitions.** §42.6.0 "All transitions write to the Ops Activity Log (§50.4)" — but §50.4 is Impersonation Audit, not an Ops Activity Log (see D-42-022). Retention of ProviderHealthState transition rows unauthored.
- **OnCallShift records.** Who was on-call for which incident is forensic evidence. Retention unauthored.
- **DR-drill outcomes.** Compliance-evidence-grade. Retention unauthored.
- **Datadog log retention.** §42.6 declares Pino → Datadog but does not bind log retention to §40.2.
- **Sentry error-tracking retention.** §42.6 row 4 declares Sentry; retention unauthored.
- **Statuspage incident history.** Public visibility; retention unauthored.
- **`ops_job_runs` table.** §42.6.1 declares 365-day retention "per §40.2 job-history retention." The §40.2 cite is correct; this is the one §42 retention citation present. (Single positive instance; the rest are gaps.)

→ **D-42-016** (entity retention / DSAR — P1).

### Numerical singletons (§ convention #10)

§42 inline-states multiple numerical thresholds without single-source binding:

- §42.2 alarm thresholds: `Error rate > 1%`, `API latency p95 > 2s`, `API latency p95 > 5s`, `Webhook delivery < 95%`. Two of these (the latency 2s and 5s thresholds) relate to §44.1 SLO targets (p95 < 500ms, p99 < 1s) but the burn-rate relationship is unexplained. A reader sees a 500ms p95 SLO and a 2s p95 warning alarm — the 1500ms gap is unexplained (no burn-rate semantics).
- §42.3 severity response times: `< 15 minutes` (SEV-1), `< 1 hour` (SEV-2), `< 4 hours` (SEV-3). Update frequencies: `Every 30 minutes` / `Every 60 minutes` / `Daily`. No single-source home; these are spec-only thresholds.
- §42.3 process timings: `Postmortem scheduled within 24 hours`, `RCA completed within 48 hours`. Single-source home unauthored.
- §42.5 escalation timing: `Page timeout escalation: 10 minutes`. Single-source home unauthored.
- §42.6.0 severity routing: `P3 on first detection; P2 if persisting > 30 minutes; P1 if persisting > 4 hours; P0 if customer-visible primary surfaces are blocked (e.g., Stripe degraded > 24h blocking auto-topups for > 50 Orgs)`. Inline values.
- §42.6.0 fail-open: "MUST raise an Ops P3 within 5 minutes." Inline.
- §42.6.0 clear-threshold: `5 consecutive minutes`. Inline.
- §42.6.1 cron times (`03:15 UTC`, `03:30 UTC`, `03:45 UTC`), latency targets (`p95 ≤ 8 minutes`, `p95 ≤ 90 minutes`, `p95 ≤ 30 minutes`, `p95 ≤ 3 minutes`), hard-kill (`30 minutes`, `240 minutes`, `10 minutes`), batch size (`1,000 rows`, `10,000 rows`), per-batch wall-clock cap (`5 seconds`), coverage gate (`≥ 99.9%`), retention (`365 days`, `7 years`). Inline values; no §40.2 / §39 / §44 binding.
- §42.7 ACs: `< 5% false positive`, `quarterly`, `30 days action item closure`.

→ **D-42-021** (numerical-singleton coverage — P1).

### Heading syntax (§ convention #11)

§42 anchor slugs include ampersand and comma characters: `{#42.-observability-reliability-and-disaster-recovery}`, `{#42.2-monitoring-and-alerting}`, `{#42.4-disaster-recovery-targets}`, `{#42.6-observability-stack}`. The D-V8.4-016 normalization pass normalized colon-bearing anchors; ampersand/comma normalization may produce renderer-dependent breakage (some markdown renderers URL-encode `&` and `,` into the slug, breaking inbound cross-references).

→ **D-42-030** (anchor-slug normalization — P3).

### Surface/engine mapping (Appendix M)

§42 introduces customer-facing surfaces without Appendix M.1 rows:

- **Statuspage.io public status page.** Customer-facing; emits subscription email/SMS; should have an Appendix M.1 row binding the surface to its engine concept (incident lifecycle).
- **Customer-visible read-only-degraded banner.** §42.4.1 ("Service degraded — read-only — your region's failover replica is recovering"). Customer-facing partial-state surface; should have an Appendix M.1 row binding to the residency-failover engine.
- **Customer-visible incident notification (Statuspage SEV-1/2 update).** §42.3 step 4; customer-facing; should have an Appendix M.1 row.
- **Ops Health Dashboard.** §42.6.0 cites "§50.14 Ops Health Dashboard" (broken citation per D-42-022, but a real engine surface implied); should have an Appendix M.1 row when authored.

Per §M.4 `appendix_m_coverage_on_diff` CI gate, every new surface requires an Appendix M.1 row.

→ **D-42-019** (Appendix M.1 rows for §42 surfaces — P1).

### Console firewall (§1.3)

§42 incidents primarily exist in the Ops Console scope (cross-tenant; not buyer- or seller-bound). The two console-firewall-adjacent concerns:

1. **Customer-visible read-only-degraded banner.** Renders on both consoles (Buyer + Seller). The §42.4.1 banner copy is identical across consoles; the per-console residency-aware behavior is not authored. A buyer Org and a seller Org could share the same residency region; the banner correctly does not cross consoles, but the contract is silent.
2. **Statuspage public-page.** Single public page (no console firewall). Acceptable.

No firewall leakage defects from §42 itself; the related broken-citation defect (D-42-022 on the §50.4 "Ops Activity Log" citation) is documentation drift, not a runtime leak.

### Edge cases

Walking CLAUDE.md §12 edge-case discipline:

- **First-time vs returning users.** §42 customer surfaces (Statuspage subscription, read-only banner) silent on first-time experience.
- **Empty / loading / error / retry / partial states.** §42 customer surfaces silent on each — the read-only banner is a partial state but the §3.7 state-catalog enum `page_state_kind` (Appendix J) is not bound to §42.4.1. (Pair with D-42-019.)
- **Validation.** N/A for §42 surfaces.
- **Auth / permission failures.** Statuspage subscription auth; Ops Console incident access auth (§50.1 RBAC). §42 silent.
- **Concurrency / sync conflicts.** Multiple Ops users editing the same postmortem concurrently. Unauthored.
- **Idempotency and retries.** Statuspage incident-creation idempotency unauthored. Datadog alarm de-duplication unauthored.
- **Notification / webhook delivery failures.** No outbound webhook for §42 (D-42-015); the inverse — what if PagerDuty itself is down — is also unauthored.
- **Third-party outages.** §42.6.0 covers nine providers (Anthropic, Firecrawl, Stripe, WorkOS, PostHog, Loops.so, Convex, Perplexity, Zendesk). NOT covered: PagerDuty itself (the paging stack), Datadog itself (the monitoring stack), Statuspage.io itself (the customer comms stack), Sentry itself (the error-tracking stack), Slack itself (the war-room stack). Meta-observability gap.
- **Mobile vs desktop divergence.** §42 silent on mobile.
- **Admin vs end-user behavior.** §42 implicitly admin-only (Ops Console); customer-visible incident surfaces unauthored beyond Statuspage.
- **Guest role scoping.** N/A.
- **Buyer/seller console firewall integrity.** See above; no leakage.
- **Marketplace-domain leakage.** N/A for §42.
- **Data residency (US / EU / custom).** §42.4.1 / §42.4.2 cover residency-bound DR. §42.6 log/trace residency routing unauthored (D-42-002).
- **TZ / locale / currency.** §42.3 process timings (24h, 48h, 30 days) silent on TZ basis (UTC? Org-local?). §42.6.1 cron times explicit (UTC).
- **Downgrade paths and data preservation.** §42 entities (incident history, postmortems) silent on Org downgrade behavior.
- **DSAR / right-to-erasure compatibility.** Postmortem narrative text containing customer references is a DSAR-cascade target; §42 silent (covered by D-42-016).

→ **D-42-023** (meta-observability — P2); **D-42-027** (mobile divergence — P2).

### Error codes (Appendix I)

§42 alarms (`anthropic_mcp_degraded`, etc.) are operational states, not HTTP error codes. When a customer-facing surface attempts an action blocked by `loops_degraded` (e.g., immediate email send required for a flow that goes via Loops.so; cross-ref §41.1, §6.8.4 verification email), what HTTP error returns? `provider_degraded` (Appendix I) is not registered. Per Appendix I preamble convention, every customer-facing failure path needs a registered error code.

§42.6.0 nine provider-degraded states need a corresponding `<provider>_degraded` HTTP 503 in Appendix I if any of the nine providers gate a customer-facing surface. Examples:
- `perplexity_degraded` (D-42-x): partially handled via §16.2.3 fallback contract that swallows the error customer-side; if the fallback also fails, customer-facing error code unauthored.
- `loops_degraded`: §41 silent on customer-facing behavior; if a transactional email cannot be queued, what HTTP error does §29.2 notification dispatch return? Unauthored.
- `stripe_degraded`: §34.10 auto-topup runtime-denial registered, but Stripe-degraded customer-facing failure during purchase unauthored.
- `convex_degraded`: §44.1 SLO carries the freshness target; customer-facing failure code unauthored.

→ **D-42-017** (provider-degraded HTTP error codes — P1).

### PostHog events (Appendix G)

§42.6.1 declares PostHog events `audit_integrity_scan_started` and `audit_integrity_scan_completed` (with properties `rows_scanned`, `mismatches_found`, `duration_ms`, `outcome`). Cross-checked against Appendix G — neither event is registered there.

Also implied by §42 but not registered:
- `incident_opened` / `incident_severity_changed` / `incident_mitigated` / `incident_resolved` / `incident_postmortem_published`.
- `provider_health_state_changed` (per the 9 providers).
- `dr_drill_started` / `dr_drill_completed` / `dr_drill_failed`.
- `runbook_anchor_followed` (which runbook anchors are most-followed during incidents — operationally useful telemetry).

→ **D-42-029** (Appendix G registrations — P2).

### Sentry coverage (§42.6)

§42.6 row 4 declares Sentry but the contract is one line. Specific gaps: (a) which error classes route to Sentry vs Datadog logs (e.g., uncaught client-side exceptions vs server-side error rows); (b) PII scrubbing on Sentry stacktraces (Sentry captures local variables which may include PII at exception time); (c) Sentry retention vs Datadog retention vs §40.2; (d) cross-tool correlation (trace_id, request_id, audit_event_id propagation into Sentry tags); (e) per-Org / per-residency segmentation (EU Org exceptions must land in EU Sentry project).

→ **D-42-028** (Sentry contract — P2).

### Webhook delivery alarm ambiguity

§42.2 alarm: `Webhook delivery < 95%`. Per §31 webhook retry semantics (exponential backoff, DLQ after 5 failures, ≤256KB payload), the 95% target is ambiguous: pre-retry delivery rate (most fails) or post-retry delivery rate (after exponential backoff + 5-failure DLQ)? A 95% pre-retry rate is healthy; a 95% post-retry rate is bad. The threshold action is also ambiguous (warn-only, not paging).

→ **D-42-024** (webhook delivery alarm ambiguity — P2).

### Detector flapping prevention

§42.6.0 fail-open + 5-minute clear threshold. Hysteresis depth (5 min) may flap during partial outages. The clear-threshold is a fixed window; an exponential backoff or longer confirmation window is unauthored.

→ **D-42-025** (detector hysteresis — P2).

### False positive rate definition

§42.7 AC #4: "Alert false positive rate < 5% per month." "False positive" undefined. Industry-standard definitions: (a) alert that fires without an underlying SLO breach; (b) alert that fires with a SLO breach but no customer impact; (c) alert that fires that on-call closes without action. §42 silent.

→ **D-42-026** (false positive definition — P2).

### Broken inbound citation cluster

§42.6.0 cites:
- "Ops Activity Log (§50.4)" — §50.4 is "Impersonation Audit Requirements," not an Ops Activity Log.
- "Ops Health Dashboard (§50.14)" — §50.14 is "Internal Analytics Dashboards by Role" (Growth PM / GTM Lead / etc.), no Ops Health Dashboard sub-section. Possible the intended dashboard is one of the §50.14 dashboards; the citation is too coarse.

→ **D-42-022** (broken citations to §50.4 / §50.14 — P2).

---

## Counterfactual pass enumerated (per audit prompt mandate)

For each §42 sub-section, three realistic failure modes and confirmed §42 coverage:

**§42.1 SLA Commitments.**
1. *Customer reports an outage during a measurement-window boundary (midnight UTC of last day of month).* §42.1 declares calendar-monthly aggregation per §34.18.5 — covered.
2. *Customer claims breach but Sourcera measurement disagrees.* Dispute-resolution path unauthored. → D-42-012 AC #1.
3. *Multi-region Enterprise customer has EU and US presence; only EU is in breach.* §42.4 declares per-region SLA measurement — covered.

**§42.2 Monitoring & Alerting.**
1. *Latency p95 violates §44.1 but no alarm fires.* §42.2 alarm threshold (2s) is far above §44.1 budget (500ms); no burn-rate alarm. → D-42-004, D-42-006.
2. *Webhook delivery rate at 94.99% sustained.* Single alarm fires but no escalation. → D-42-005 (runbook), D-42-024 (ambiguity).
3. *Datadog itself unreachable.* No alarm; observability stack itself unmonitored. → D-42-023.

**§42.3 Incident Response.**
1. *SEV-1 declared but no manager-level escalation if primary + secondary both unreachable.* §42.5 has single-step 10-min escalation; §25.6 cites 3-step but §42 doesn't author. → D-42-005.
2. *Postmortem RCA misses 48-hour SLA.* No escalation, no missed-RCA alarm. → D-42-012 AC #2.
3. *War-room Slack channel unreachable during Slack outage.* Fallback unauthored. → D-42-023.

**§42.4 Disaster Recovery Targets.**
1. *Same-residency replica also fails during primary outage.* §42.4.1 declares read-only fallback — covered.
2. *DR drill fails (RTO not met) but is silently logged.* No drill-failure escalation. → D-42-014.
3. *Drill outcome contains customer references; subject requests erasure.* Drill-outcome DSAR cascade silent. → D-42-016.

**§42.5 On-Call Rotation.**
1. *On-call goes on vacation mid-shift.* Coverage gap unauthored. → D-42-007 (OnCallShift entity).
2. *Page-timeout escalation to secondary, but secondary also unreachable.* No manager-level escalation in §42.5. → D-42-005.
3. *On-call has not reviewed runbook in 90+ days.* No runbook-stale alarm. → D-42-005.

**§42.6 Observability Stack.**
1. *Pino log volume exceeds Datadog ingest quota.* Sampling and quota unauthored. → D-42-002.
2. *OpenTelemetry trace breaks at MCP boundary.* Trace propagation contract unauthored. → D-42-003.
3. *Sentry captures local variable holding API key.* Sentry PII / secret scrubbing unauthored. → D-42-028.

**§42.6.0 External Provider Health Detectors.**
1. *Anthropic API responds slowly but no 5xx.* Latency-only failure mode not detected. → D-42-004, D-42-006.
2. *Stripe degraded > 24h blocking auto-topups for > 50 Orgs.* §42.6.0 declares P0 transition — covered.
3. *PagerDuty itself is down.* Cannot route the P0. → D-42-023.

**§42.6.1 Audit Integrity Background Jobs.**
1. *Hash mismatch detected.* §42.6.1 declares Ops alert + manual forensics — covered.
2. *Hard-kill timeout.* §42.6.1 declares P2 alarm + resume-from-cursor — covered.
3. *Persistent failure across 3 consecutive runs.* §42.6.1 declares P1 — covered.

**§42.7 Acceptance Criteria.**
1. *Uptime SLA missed.* No threshold-action plumbing in §42.7 ACs. → D-42-012.
2. *Postmortem action item open > 30 days.* No escalation. → D-42-012 AC #3.
3. *On-call team training lapses.* No tracking, no alarm. → D-42-012 AC #6.

---

## Defect summary

P0 = 1 · P1 = 19 · P2 = 8 · P3 = 2 · total = 30. Promoted to `_audit/DEFECT_LEDGER.md`. Coverage matrix cells updated for F-599 / F-600 / F-601 / F-603 / F-604 / F-605 / F-606 / F-607 / F-AE-016 / F-AE-018.
