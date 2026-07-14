# PHASE17_FINDINGS — §17 Workspace Analytics Audit Scratch Log

**Scope of audit prompt.** Walk §17 (Workspace Analytics, Master Spec v7.1.0) and confirm that:
1. Analytics queries are specified buildably.
2. Performance budgets are cited from §44 (not duplicated inline).
3. Instrumentation cross-references §51 / Appendix G.
4. Plan-gating cites §5.11 / §34.1.

**Source state.** Master Spec v7.1.0 (`Sourcera_Master_Spec.md`) read end-to-end for §17 (lines 14385–14630) plus the convention-binding sections cited below. Audit-mode artifact directory `/Sourcera/_audit/` did not exist prior to this prompt; this prompt seeds it (per Audit_Prompts.md §38 Folder Layout, audit artifacts live in `/Sourcera/_audit/`). The Phase-0 seed (DEFECT_LEDGER.md, COVERAGE_MATRIX.md) was not present; this prompt minimally seeds those artifacts at §17 scope only — a full Phase-0 sweep remains required and is flagged at the bottom of this log.

---

## Section walk — what §17 says vs. what the conventions require

### §17.1 Overview (line 14387)
- One-paragraph gloss. No console-scope statement (Buyer-only is implicit but never declared). No `evaluation_owner_mode = solo` interaction. No §44 / §51 / Appendix M cross-reference.

### §17.2 Phase-Aware Metric Availability (line 14391)
- §17.2.1 Visibility Rules table — phases cited inline (Phase 10+, Phase 6+, Phase 1+) but the canonical phase enumeration is `workspace_phase_kind` (Appendix J). No enum citation.
- §17.2.2 Empty State Messaging — UX literals (`14px`, `light gray`) inline, not cited from §3.6 / §3.11 typography/color tokens. Convention #10 violation.
- Appendix M row at line 47845 says "Available after Phase {N}" — but Appendix M's phase cite ("post-Phase 8") **disagrees** with §17.2.1 (Phase 10+ for Scoring Progress and Score Distribution; Phase 6+ for Response Rate). Drift.

### §17.3 Core Analytics Metrics (line 14411)
- §17.3.1 Scoring Progress — formula `pairs_graded / pairs_total × 100%`. No source-of-truth for `pairs_total` (where is the cardinality `requirements × vendors` materialized? §4.3.6 Score / Scorecard? Not cited). "Real-time: Updates as grades are submitted (Convex subscriptions)" — no §44.1 Convex Reactive Query Commit-to-Render SLO citation.
- §17.3.3 Phase Duration — "Timeline showing all phases (1–12)". The Sourcera Method has **13 phases** per §10 / §2 / Appendix J `workspace_phase_kind`. Off-by-one. Also "Comparison: Show org-wide average for same phase" — cross-Org aggregate with no k-anonymity floor (cf. §27 / §51 uses k≥5), no residency partition, no DSAR posture.
- §17.3.4 Score Distribution — uses literal grade names (FM, PM, DNM, EX) inline. Whether `grade_kind` is registered in Appendix J is uncertain (grep shows the literal strings used as JSON-payload values in §13 but the enum may not be registered in Appendix J).
- §17.3.4 — color-coded bars cited as literal color names ("green for FM, yellow for PM, red for DNM, gray for EX"). Should cite §3.6 / §3.11 semantic tokens. Also no a11y backup (icon, pattern, label) — §3.11 requires color is never the only encoding.
- §17.3.6 SLA Compliance — thresholds cited inline (`95% green / 80–94% yellow / <80% red`). No source-of-truth; not cited from §8.4 SLA Timers; not cited from §44.
- §17.3.7 Team Velocity — "Org-wide average velocity for reference" — same k-anon / residency / DSAR concerns as §17.3.3. Also undefined what "average" means: median, mean, p50, p95? No formula. Compare §51.6 Time-Saved Baseline Model which has explicit conversion-factor binding to §50.13.

### §17.4 Filtering & Aggregation (line 14501)
- §17.4.2 — "Latency: <1 second". Performance number inline; should cite §44.1. Convention #10 violation.
- §17.4.2 — "Filters persist for current session only (not across browser reload)". No specification of session-scope storage (Convex session? URL params? in-memory React state? localStorage?). Multi-tab sync behavior undefined.
- §17.4.1 Time Range "Last 7 days, 30 days, custom range" — preset windows hard-coded; max-window cap undefined; an Enterprise caller could request a 5-year custom range and trigger an unbounded data scan. No backstop.
- Multi-select dropdowns lack max-selection caps (URL-bomb / query-cost vector).

### §17.5 Export & Reporting (line 14525)
- §17.5.1 — "Schedule periodic export: (Enterprise plan)". **Plan-tier string inline.** §34.1.1 has a row **Export Formats** but no row for "Scheduled Periodic Analytics Export." Convention #8 (§5.11 / §34.1 / §39 plan-gating) violated and Convention #10 (numerical singletons) violated. Adjacent plan-tier inline lists are tracked in `_integration/RECONCILIATION.md → Phase 14.9.1 Inline Tier-List Audit` but §17.5.1 is **not** on that 27-location list — additional drift not yet captured.
- §17.5.1 — "CSV export: Full data table with all metrics, filters applied" / "PDF export: Dashboard snapshot (styled, page layout optimized for printing)". No §32 endpoint; no `format` enum; no async vs. sync semantics; no PDF rendering job spec; no `solo_export_format` plan-tier check (§34.1.1 cell **Export Formats** says Free=CSV,PDF; Solo+=CSV,PDF,Excel — but §17 lists Excel only via Schedule, not as a primary export format).
- §17.5 silent on max-export-size limits (cf. §51.3.7 AC #6 / §51.4.6 AC #8: "Export size ceiling: 50 MB / 20 MB"; §17 has none).
- §17.5 silent on watermarking. Free-tier Selection Report is watermarked per §34.1.1 cell **Selection Report watermark**; analytics PDF export is silent on watermark inheritance.
- §17.5 silent on retention of export artifacts. Compare §32.8.11 Billing Ledger CSV Export — signed time-limited URL with §40.2 retention class.
- §17.5 silent on audit-event emission. Compare §32.8.11 / §32.9 KB Export emit `OpsActionRecord` and PostHog `*_export_initiated` / `_completed`.
- §17.5 silent on AIOperation accounting. PDF rendering is presumably non-AI (server-side render), but §17 doesn't say so explicitly.

### §17.6 Drill-Down & Detail Views (line 14539)
- "Click any metric card → open modal or side panel" — choice undefined. A junior engineer cannot disambiguate.
- §17.6.2 Linked Detail Views cross-reference §13 / §8.3 but those targets do not declare entry-point contracts from analytics drill-down.
- No empty / loading / error state for the drill-down panel.

### §17.7 Real-Time Updates (line 14556)
- §17.7.1 — "Cached calculations: Complex metrics (e.g., Team Velocity) cached; refreshed on 5-minute interval."
- §17.7.2 — "Auto-refresh: Metrics refresh every 30 seconds (throttled to reduce API calls)."
- **Internal contradiction:** is the dashboard refreshed every 30s or every 5 min? Which metrics are governed by which TTL? Is Team Velocity stale up to 5 min while Scoring Progress is real-time? Spec is ambiguous. Convention #2 violated (no observable threshold). Production code-review fail.
- §17.7.1 — "Real-time via Convex subscriptions" but no §44.1 "Convex Reactive Query Commit-to-Render SLO" citation. The §44.1 SLO (p95 ≤ 500 ms / p99 ≤ 1 s of commit timestamp) explicitly applies to "non-collaborative-scoring reactive surfaces" — Workspace Analytics is exactly that.
- §17.7.1 — "Visual indicator: Small pulse icon next to metric value when updating" — pulse animation; spec silent on `prefers-reduced-motion`. §3.11 a11y compliance gap.

### §17.8 Acceptance Criteria (line 14571)
- Format: numbered checkboxes. None cite source-of-truth tables for thresholds (e.g., 17.8.6 "Latency <1 second" duplicates §44 instead of citing it).
- Most ACs are observable but not measurable in the §13.10 / §14.9 / §17.8-style sense (the audit prompt itself names §17.8 as the canonical exemplar — and yet §17.8 fails its own bar in places).
- 17.8.4 — "Timeline shows all 12 phases" — propagates the §17.3.3 off-by-one error.
- No AC for: error-state rendering, retry behavior on Convex outage, cache-TTL semantics, max-export-size, scheduled-export idempotency / DLQ, k-anonymity floor on Org-wide aggregates, plan-gate enforcement at every export endpoint, console-firewall integrity (Buyer-only), Solo Mode divergence, mobile divergence, watermark inheritance, audit-event emission, DSAR right-to-erasure compatibility for cached snapshots.

---

## Cross-cutting gaps (not in any sub-section)

### Data model (§4) — entirely missing
§17 implies but does not define:
- `WorkspaceAnalyticsSnapshot` (cached metric rows; the §17.7.1 5-min cache).
- `WorkspaceAnalyticsExportJob` (CSV/PDF generation; analogous to §22.18.2.5 KB Export Job and §32.8.11 Billing Ledger Export).
- `WorkspaceAnalyticsScheduledExport` (Enterprise weekly/monthly email; entirely undefined).
- `WorkspaceAnalyticsFilterState` (if persisted server-side; undefined in §17).

Convention #1 violation across the section.

### APIs (§32) — entirely missing
- `GET /v1/workspaces/{workspace_id}/analytics/metrics` — undefined.
- `POST /v1/workspaces/{workspace_id}/analytics/export` — undefined.
- `GET /v1/workspaces/{workspace_id}/analytics/export/{export_id}` — undefined.
- `POST/GET/DELETE /v1/workspaces/{workspace_id}/analytics/scheduled-exports` — undefined.

§32 has §32.8.11 (Billing Ledger CSV Export) and §32.9 (KB Export) as templates but §17 has no parallel.

### Webhooks (§31) — missing for export jobs
- Async PDF / CSV exports require `analytics.export.ready` and `analytics.export.failed` events with HMAC-SHA256, idempotency, exponential backoff, DLQ — none registered in Appendix C / Appendix G. Compare `kb.export.ready` / `.failed` (line 28166) and `billing.ledger.export_completed` (line 27524).

### PostHog instrumentation (Appendix G) — entirely missing
Zero §17 events. §51.1.5 (Event Catalog Cross-Reference) **claims** "Every event documented in §11–§14, §17, §20–§27, §29, §31.8, §34, §35, §48, §49.1, and §50 is registered in Appendix G" — but §17 has no events to register. **§51.1.5 is a false statement until §17 either authors events or §51.1.5 redacts §17 from the list.**

Expected events (modeled on existing taxonomy):
- `workspace_analytics_dashboard_opened`
- `workspace_analytics_metric_drilldown_opened`
- `workspace_analytics_filter_applied` (with `filter_dimension`, `filter_count`)
- `workspace_analytics_export_initiated` / `_completed` / `_failed`
- `workspace_analytics_scheduled_export_configured` / `_executed` / `_failed`
- `workspace_analytics_refresh_clicked`

### Plan-gating (§5.11 / §34.1)
- §5.11 has a "Reporting & Analytics" group (line 9430) but its rows are: View Selection Report, View Efficiency Metrics, Open Defense View, Regenerate Defense View, Export evaluation, View audit log. **No row for** "View Workspace Analytics dashboard," "Filter Workspace Analytics," "Export Workspace Analytics CSV," "Export Workspace Analytics PDF," "Configure Scheduled Workspace Analytics Export."
- §34.1.1 has cell **Export Formats** (Free=CSV,PDF; Solo+=CSV,PDF,Excel) but no row for **Scheduled Periodic Analytics Export** despite §17.5.1 inline citing "Enterprise plan." The §34.1 preamble explicitly names §17 as a section that must reference §34.1 and not restate.

### Performance budgets (§44)
- §44.1 has "Workspace Load (1,000 requirements, matrix view) <2s" — but no §17 dashboard-load budget, no analytics export latency, no PDF analytics export budget.
- §17.4.2 inline `<1 second` filter latency and §17.7.2 inline `30 seconds` auto-refresh and §17.7.1 inline `5-minute interval` cache TTL all violate Convention #10 (one authoritative home per number).
- §44.1 "Convex Reactive Query Commit-to-Render SLO" applies and should be cited from §17.7.1.

### Surface/Engine mapping (Appendix M)
Three rows present (line 47845–47847) for §17.2 / §17.6 / §17.7. **Missing rows:**
- §17.4 Filtering & Aggregation
- §17.5 Export & Reporting (CSV / PDF)
- §17.5.1 Scheduled Periodic Export (Enterprise)
- §17.7.2 Auto-refresh / Manual Refresh
- §17.3 individual metric surfaces (Scoring Progress, Response Rate, Phase Duration, Score Distribution, Weight Coverage, SLA Compliance, Team Velocity)

The line-47845 row also misstates the phase gate ("post-Phase 8") relative to §17.2.1 (Phase 10+ / Phase 6+).

### Console firewall
§25.1.2 (line 19438) classifies Workspace Analytics as **NEVER CARRIED** across the bridge — that's correct. §17 itself does not state the console restriction inline, but the firewall is enforced at the bridge layer per §25.4 / §20467 CI gate `materialization_firewall`. Acceptable but §17 should declare console scope.

### Mobile divergence
§38.x parity matrix (line 30885–30886) declares "Workspace Analytics — Dashboard | parity / parity / supported" and "Workspace Analytics — Export | parity / parity / not_supported." §17 itself is **silent on mobile divergence** — should state how export CTAs are hidden / disabled on mobile per §38.

### Solo Mode (§2.8 / §44.6) divergence
Solo Mode compresses the multi-stakeholder surface (Pulse SLA timers, Inbox Item Group, divergence detection all suppressed per Appendix M / §44.6). §17 is silent on whether Team Velocity / Scoring Progress aggregations should be suppressed or simplified for `evaluation_owner_mode=solo` Workspaces. Phase 14.4 / 14.6 surface compression program left §17 untouched — at minimum a flag.

### Retention / DSAR / Residency
§17 silent on:
- Retention of cached `WorkspaceAnalyticsSnapshot` rows (§40.2)
- Retention of generated CSV/PDF exports
- DSAR right-to-erasure for cached metric data (§6.8)
- Residency partition for cross-Org "average" comparators (§17.3.3, §17.3.7)
- GDPR anonymization of `last_activity` per-user data (§17.3.7)

---

## Counterfactual pass — three failure modes

1. **Convex subscription drops mid-render of a 1,000-requirement dashboard.** Spec is silent. No fallback to polled fetch, no error state, no "stale" indicator. P2 → captured in D-S17-018.
2. **Scheduled weekly export job fails on PDF render (third-party render outage).** Spec has no retry curve, no DLQ, no Ops alert, no email-failure notification, no replay path. P1 → captured in D-S17-003.
3. **Cross-Org leakage via "Org-wide average for same phase."** A two-Org Sourcera tenant where one Org is the only Customer in its tier could, by inverting the average, infer the other Org's elapsed phase duration. No k-anonymity floor, no residency partition. P2 → captured in D-S17-014.

---

## Self-challenge revisions

After hostile re-read:
- D-S17-001 originally classified P2 → **promoted to P1**: an inline plan-tier string ("Enterprise plan") with no §34.1 cell and no §5.11 row matches the P1 rule "missing plan-gating row in §5.11/§34.1/§39."
- D-S17-006 originally classified P2 (numerical singleton) → split into D-S17-006 (P1: missing §44 budgets for analytics dashboard load + analytics export, feature unbuildable) and D-S17-021 (P2: filter-latency duplication).
- D-S17-009 originally classified P2 → kept P2; the missing Appendix M rows are cosmetic vs. the missing §44 / §32 / Appendix G content. The Appendix-M phase-gate misstatement at line 47845 ("post-Phase 8") is split out as D-S17-009b at P1 because it would cause a junior engineer to gate metrics behind the wrong phase.
- D-S17-012 originally P2 → **promoted to P1**: 30 s vs. 5 min ambiguity is two different production behaviors. Per Severity tiebreaker ("default to P1 if a junior engineer would build the wrong thing").
- D-S17-019 (no §5.11 rows for analytics) reclassified P1 because the Feature Access Matrix is the canonical RBAC contract and an absent row for an entire feature surface = unbuildable RBAC.

---

## Phase-0 dependency note (audit-program scaffolding)

`/Sourcera/_audit/` did not exist before this prompt. A full Phase-0 sweep is required before subsequent audit prompts run — this prompt seeds DEFECT_LEDGER.md and COVERAGE_MATRIX.md with §17 rows only and does not attempt to enumerate the full Feature Inventory or seed the matrix beyond §17. Phase-0 must:
- Author the full Feature Inventory across §4–§51.
- Seed the Coverage Matrix with the canonical column set per Audit_Prompts.md → Coverage Matrix Format.
- Author the Authoritative-Source Cross-Reference Map.
- Stamp the DEFECT_LEDGER.md header with the Severity Definitions block per Audit_Prompts.md → Defect Ledger Format.

This audit prompt is non-destructive and produces only §17 findings; it does not block Phase-0.
