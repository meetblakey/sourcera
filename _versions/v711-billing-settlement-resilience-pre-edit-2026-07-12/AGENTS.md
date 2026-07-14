# AGENTS.md — Sourcera Project Navigation Guide

**Purpose:** Orient any Codex session working in this folder. Load this before doing anything else. It defines what each file is, which files are authoritative for which questions, what to avoid, and how to author changes that survive review.

**Last updated:** 2026-07-12
**Corpus state:** Master Spec **v7.1.0a stamped (P0 hot-patch; 2026-05-20)**. The v7.2.0-REM Program closed Phase 6 (P0 Closure Audit) on 2026-05-20 — 12 of 12 PROD-CRIT-NN P0 defects closed across Phases 1–5 (D-2.2-042, D-AK-001, D-AK-002, D-AK-003, D-11.2-004, D-11.3-001, D-11.3-002, D-EM-001, D-EM-002, D-EM-003, D-EM-004, D-RES-004); 3 of 3 P0 Counterfactual failure modes closed; the v7.1.0a stamp is authorized under the Verdict §8 alternative-posture scope (Phases 1–6 P0-only). Pre-stamp Master Spec snapshot at `_versions/Sourcera_Master_Spec.v7.1.0a-pre-stamp-2026-05-20.md` (6,388,739 bytes; md5 `a186f1b7844e6961f4fb8a12f77f114a`). The Phase V8.4 v7.1.0a sub-stamp (2026-05-08; Appendix I Preamble + 20 D-V8.4 closures + 10 new §M.5 CI gates) is preserved as an additive sub-stamp under the v7.1.0a umbrella and remains in force. **Residual at v7.1.0a stamp time: 808 P1 defects (322 P1-cluster slots)** out of v7.1.0a scope; released as the v7.1.1 stamp-gate execution surface. That 808 count is historical stamp-time posture only: the current exact-status right-edge scanner reports 0 open P0, 0 open P1, 0 blocked P1, 221 open P2, and 83 open P3 rows; `_audit/V711_BACKLOG_INDEX.md §2` is the current routing authority and earlier pass counts are historical boundaries. The current stamp gate reports 497 runtime rows, 326 `runtime_active`, and 188 blockers (118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, plus 19 pending human-ratification release blockers). The earlier v7.1.0 program window remains the v7.1.0a baseline. **Phase V11 catalog-completeness remediation pass closed 2026-05-11** (closes 3 P0 + 7 of 12 P1 ci_gate defects against §M.4 / §M.5; D-11.4-001 P1 + 5 surface-class M.1 defects deferred to Phase 11.5 as AE-V11-04). **Phase V12 Operations / QA / Observability / DR spec-side remediation closed 2026-05-11** (closes 8 P0 + 78 P1 + 29 P2 + 8 P3 = 123 defects across §42 / §43 retirement / §46 / §50 + V12 adversarial defects; §43 retired in-place with §50 successor surfaces; §42 substantially rewritten with revenue-affecting metrics + per-service SLOs + canonical severity ladder + customer-reported incident ingest + Runbook Inventory + log/trace/PII contracts + entity catalog; §46 rewritten with per-service test pyramid + AIOperation evaluation + console firewall scenarios + DSAR/GDPR scenarios + chaos coverage; §50 extended with 11 new Ops surfaces §50.20–§50.30 + state-machine extensions for pre-action notification dwell + anti-collusion device-fingerprint guard; 11 V12 Authored Extensions AE-V12-01 through AE-V12-11 registered for v7.1.1 ratification). Baseline v7.0.0 snapshot at `_versions/Sourcera_Master_Spec.v7.0.0-pre-v7.1-2026-04-26.md`. Pre-V11 v7.1.0 snapshot at `_versions/Sourcera_Master_Spec.v7.1.0-pre-V11-remediation-2026-05-11.md`. Pre-V12 v7.1.0 snapshot at `_versions/Sourcera_Master_Spec.v7.1.0-pre-V12-remediation-2026-05-11.md`. **Pre-v7.1.0a-stamp v7.1.0a snapshot at `_versions/Sourcera_Master_Spec.v7.1.0a-pre-stamp-2026-05-20.md`.** Next program: v7.1.1 stamp pending AE ratification / disposition, remaining pack-owned §M.5 runtime promotion, and lower-severity P2/P3 hygiene; use `_audit/V711_BACKLOG_INDEX.md` for live stamp-scope routing.
**Folder reorganization (2026-04-29):** `Integration_Prompts.md` and `Integration_Prompts_v7.1.md` moved to `_integration/`. `Blake_Task_List_Document_Hardening.md` moved to `_personal/`. `Sourcera_Pitch_Deck.pptx`, `Sourcera_Investor_Talk_Track.docx`, and `brandguidelines/` consolidated into `assets/`. Canonical specs (`Sourcera_Master_Spec.md`, `Sourcera_Buyer_Pricing_Strategy.md`, `Sourcera_Seller_Pricing_Strategy.md`, `UX_Design_of_Sourcera.md`, `Build_Execution_Strategy.md`, `Linear_Execution_Blueprint.md`, `SWE_Project_Instructions.md`) remain at root because they are referenced by bare filename in dozens of `_integration/` log entries; moving them would create semantic drift across ~25+ documents. Pre-reorg backup of this file at `_versions/AGENTS.md.pre-reorg-2026-04-29.md`.

**Current release correction (2026-07-11, vendor-engagement evidence closure).** The preceding live-count sentence is a prior pass boundary. Live status is 0 open P0, 0 open P1, 0 blocked P1, 319 open P2, and 105 open P3; the stamp gate parses 491 runtime rows, 321 `runtime_active`, and 168 blockers (118 M11.3, 29 M21.3, 12 M02.3, 9 M24.3). D-41-015 remains an external Legal / Compliance configuration prerequisite; AE-V711-PH22-TYPED-MARKETPLACE-DIMENSIONS-01, AE-V711-PH6-SELLER-SIGNALS-WEBHOOK-CANONICALITY-01, AE-V711-PH6-SELLER-SIGNAL-ENUM-CANONICALITY-01, AE-V711-PH6-VERIFICATION-DUAL-REVIEWER-01, AE-V711-PH6-MATCH-SCORE-MOBILE-PROVENANCE-01, AE-V711-PH2-SOLO-UNMET-GATE-LIFECYCLE-01, and AE-V711-PH2-COHORT-ASSIGNMENT-VACANCY-01 remain pending human sign-off; none is historical. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-11, Phase 38 state and motion-authority closure).** The preceding release correction is a prior pass boundary. Live status is 0 open P0, 0 open P1, 0 blocked P1, 282 open P2, and 98 open P3. The stamp gate parses 497 runtime rows, 326 `runtime_active`, and 181 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 12 pending human-ratification release blockers. `AE-V711-PH38-UI-PREFERENCE-RESILIENCE-01` remains current and pending human sign-off; Appendix L.26 and §38.10 close documentation form and authority defects only, not product runtime evidence. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-11, Phase 38 device-posture closure).** The preceding release correction is a prior pass boundary. Live status is 0 open P0, 0 open P1, 0 blocked P1, 279 open P2, and 98 open P3. The stamp gate parses 497 runtime rows, 326 `runtime_active`, and 182 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 13 pending human-ratification release blockers. `AE-V711-PH38-DEVICE-POSTURE-01` remains current and pending human sign-off; it does not establish the absent preference migration, safe-area renderer, constrained-data cache / telemetry, DSAR / serializer, or device E2E evidence. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-11, HeatMapCell opt-out and error-catalog closure).** The preceding Phase 37 correction is a prior pass boundary. D-V72REM-PH1-002 and D-V72REM-PH1-003 are remediated: HeatMapCell is retired from the two direct opt-out target enums and both pre-existing referenced HTTP 422 codes now have Appendix I entries. The enum guard v1.1.0 passed live and positive fixtures and rejected its negative fixture. This adds no runtime-evidence claim. Live status is 0 open P0, 0 open P1, 0 blocked P1, 263 open P2, and 90 open P3. The stamp gate remains 497 runtime rows, 326 `runtime_active`, and 183 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 14 pending human-ratification release blockers. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-11, pre-SSO SellerOnboardingSession DSAR closure).** The preceding HeatMapCell correction is a prior pass boundary. D-2.2-051 is remediated as a source-contract gap: §4.4.22 now specifies verified residency-local pre-SSO matching, identity clearing, an atomic Stage-2 race, generic stale-link handling, retention, audit, and analytics boundaries. `AE-V711-PH22-PRE-SSO-DSAR-01` is current and pending human sign-off; it does not establish migration, DSAR-worker, transaction, resolver, audit, telemetry, residency, or cross-client runtime evidence. Live status is 0 open P0, 0 open P1, 0 blocked P1, 262 open P2, and 90 open P3. The stamp gate remains 497 runtime rows, 326 `runtime_active`, and 184 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 15 pending human-ratification release blockers. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-11, SellerSignalDelivery closure).** The preceding pre-SSO correction is a prior pass boundary. D-2.2-049 is remediated as a current source-contract gap and D-2.2-057 is remediated as an unsupported-pause-premise correction. §4.4.18.1 now defines the per-target SellerSignal delivery decision ledger; §34.1.2 is the sole entitlement/cadence authority; the former three-value channel source is historical only. `AE-V711-PH22-SELLER-SIGNAL-DELIVERY-01` is current and pending human sign-off; it does not establish migration, resolver, provider, concurrency, DSAR, residency, client, or retention-sweep runtime evidence. Live status is 0 open P0, 0 open P1, 0 blocked P1, 260 open P2, and 90 open P3. The stamp gate remains 497 runtime rows, 326 `runtime_active`, and 185 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 16 pending human-ratification release blockers. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-11, V6 amendment-broadcast firewall status synchronization).** The preceding SellerSignalDelivery correction is a prior pass boundary. D-V6-004 is remediated because current §4.7.1 and §25.1.2 already project only the recipient Seller's affected-requirement intersection and explicitly forbid the full buyer-side array. No product behavior or runtime evidence is invented. Live status is 0 open P0, 0 open P1, 0 blocked P1, 259 open P2, and 90 open P3. The stamp gate remains 497 runtime rows, 326 `runtime_active`, and 185 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 16 pending human-ratification release blockers. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-11, Marketplace-Domain PromotedListing and telemetry closure).** The preceding V6 correction is a prior pass boundary. D-MD-009, D-MD-016, and D-MD-018 are remediated in current source: §4.4.19 / §4.4.19.1, §27.11, §34.16, §40.2, and Appendix G now bind PromotedListing, auction, render, webhook, funnel, retention, DSAR, and residency behavior to `marketplace_domain_id`; `marketplace_promoted_listing_clicked` is canonical and `marketplace_promoted_clicked` is historical-only. `AE-V711-PHMD-MARKETPLACE-DOMAIN-TELEMETRY-01` is current and pending human sign-off; migration, resolver, rendering, webhook, telemetry, DSAR, residency, client, concurrency, and non-leak runtime evidence are not established. Live status is 0 open P0, 0 open P1, 0 blocked P1, 256 open P2, and 90 open P3. The stamp gate remains 497 runtime rows, 326 `runtime_active`, and 186 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 17 pending human-ratification release blockers. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-11, PromotedListing settlement, error, and k-anonymity canonicality).** The preceding Marketplace-Domain correction is a prior pass boundary. D-MD-013, D-MD-014, and D-MD-020 are remediated in current source: §34.16.1.A owns separate aggregate-disclosure and revenue-settlement floors; §4.8.12, §4.4.19.1, §27.11, §34.16, and Appendices C/G/I/J/K align cap errors, a one-replacement pre-payment failure, and the full event catalog. `AE-V711-PHMD-SETTLEMENT-ERROR-KANON-01` is pending human sign-off; migration, Stripe/ledger, locking, outbox, audit, analytics, privacy, client, and concurrency evidence are not established. Live status is 0 open P0, 0 open P1, 0 blocked P1, 253 open P2, and 90 open P3. The stamp gate remains 497 runtime rows, 326 `runtime_active`, and 187 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 18 pending human-ratification release blockers. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-11, Marketplace trust, disclosure, and accounting hygiene).** The preceding settlement correction is a prior pass boundary. D-MD-008, D-MD-010, D-MD-011, D-MD-012, D-MD-015, D-MD-017, and D-MD-019 are remediated in current source: §34.16 now consumes the §27 / UX trust, badge, ranking, and visual-separation authority; Appendix K holds the FTC primary-source framing and `revenue_stream_class` / `cost_center` disambiguation. No product behavior, legal opinion, Authored Extension, or runtime promotion is created. Live status is 0 open P0, 0 open P1, 0 blocked P1, 249 open P2, and 87 open P3. The stamp gate remains 497 runtime rows, 326 `runtime_active`, and 187 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 18 pending human-ratification release blockers. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-11, Workspace Analytics current-source synchronization).** The preceding Marketplace correction is a prior pass boundary. D-S17-007, D-S17-008, D-S17-009a, D-S17-011, D-S17-013, D-S17-014, D-S17-017, D-S17-018, D-S17-020 through D-S17-023, D-S17-025 through D-S17-031 are remediated. §17 now correctly consumes the §48.4.7 Aggregate tier, §51.7.3 residency partition, and §6.8.4.3 DSAR recompute/suppression contract; all other changes synchronize filed defects to the approved P1 completion pack. Live status is 0 open P0, 0 open P1, 0 blocked P1, 231 open P2, and 86 open P3. The stamp gate remains 497 runtime rows, 326 `runtime_active`, and 187 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 18 pending human-ratification release blockers. No runtime row is promoted. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-12, Phase 4.2 material-amendment contract closure).** The preceding correction and any earlier header count are pass boundaries. D-4.2-033 is remediated as a source-contract gap: §4.3.4.1 / §10.6 / §32.10.9.A.1 now define the scheduled/effective Amendment, three-calendar-day material-change floor, enforcement errors, seller firewall, retention, DSAR, mobile states, and static gate. `AE-V711-PH42-PIPELINE-INTEGRITY-01` remains pending human sign-off; migration, transaction, scheduler, outbox, delivery, DSAR/retention, mobile, and concurrency evidence are not established. Live status is 0 open P0, 0 open P1, 0 blocked P1, 220 open P2, and 83 open P3. The stamp gate parses 498 runtime rows, 327 `runtime_active`, and 188 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 19 pending human-ratification release blockers. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-12, HeatMapCell system-attribution closure).** The preceding correction is a pass boundary. D-2.2-039 is remediated as a source-contract gap: §4.4.16 now carries system and authorized-Ops actor fields, Appendix J reserves `system_agent_heat_map_refresh_worker`, and the field firewall plus static principal guard pass. `AE-V711-PH22-HEATMAP-SYSTEM-ATTRIBUTION-01` remains pending human sign-off; migration, principal-registry collision lookup, writer, audit, serializer, DSAR, concurrency, and non-leak runtime evidence are not established. Live status is 0 open P0, 0 open P1, 0 blocked P1, 219 open P2, and 83 open P3. The stamp gate parses 499 runtime rows, 328 `runtime_active`, and 189 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 20 pending human-ratification release blockers. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-12, Phase 4.4 scoring-resilience closure).** The preceding correction is a pass boundary. D-4.4-023, D-4.4-024, D-4.4-030, D-4.4-031, and D-4.4-032 are remediated as source contracts: §4.3.6 / §4.3.6.3, §13.4–§13.6, §32.10.9.A.2, §38.8.2, §39 / §40.2, and Appendices G/I/J/K/L now define Lead finality, EX approval, N-reviewer rendering, mobile bounds, and collaboration degradation. `AE-V711-PH44-SCORING-RESILIENCE-01` remains pending human sign-off; no migration, transaction, realtime, client, audit/outbox, DSAR, accessibility, or concurrency runtime evidence is established. Live status is 0 open P0, 0 open P1, 0 blocked P1, 214 open P2, and 83 open P3. The stamp gate parses 500 runtime rows, 329 `runtime_active`, and 190 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 21 pending human-ratification release blockers. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-12, Phase 4.4 Defense View hygiene closure).** The preceding correction is a pass boundary. D-4.4-015 and D-4.4-026 through D-4.4-029 are remediated by source/status cleanup: the typed ScoreGradeEntry field wins, current enum/changelog authority is explicit, the throttle points to §13.11.8, the retired plan alias is removed, and AE-14.5-01 is directly linked. Live status is 0 open P0, 0 open P1, 0 blocked P1, 213 open P2, and 79 open P3. The stamp gate remains 500 runtime rows, 329 `runtime_active`, and 190 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 21 pending human-ratification release blockers. No runtime row or AE disposition changes. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-12, Phase 4.4 residual-numerics closure).** The preceding correction is a pass boundary. D-4.4-019, D-4.4-021, and D-4.4-025 are remediated: UX §2.6 owns the Score replacement-highlight dwell, the UX IntakeFillCallout owns its dismiss dwell, §39 owns the free-text bound, §4.5.9 owns the deadline default, and §13.11.5.A requires the percentage-to-fraction confidence conversion. Live status is 0 open P0, 0 open P1, 0 blocked P1, 211 open P2, and 78 open P3. The stamp gate remains 500 runtime rows, 329 `runtime_active`, and 190 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 21 pending human-ratification release blockers. No runtime row or AE disposition changes. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-12, Phase 4.3 Policy Ingestion current-source synchronization).** The preceding correction is a pass boundary. D-4.3-021, D-4.3-022, D-4.3-023, D-4.3-025, and D-4.3-026 are remediated as stale-open rows: current §12 source already has safe anchors, Buyer firewall, mobile posture, the Amendment Protocol route, and §39-bound descriptions. Live status is 0 open P0, 0 open P1, 0 blocked P1, 208 open P2, and 76 open P3. The stamp gate remains 500 runtime rows, 329 `runtime_active`, and 190 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 21 pending human-ratification release blockers. No runtime row or AE disposition changes. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-12, Phase 4.3 Attachment Security and Attachment-Enum Authority closure).** The preceding correction is a pass boundary. D-4.3-017 is source-synced; D-4.3-024 is remediated by the §12.2.1 clean-attachment admission contract; and the duplicate live Appendix J Attachment-owner enum found during that work is retired, resolving D-AJ-023 against current source. `AE-V711-PH12-POLICY-RESILIENCE-SAFETY-01` remains current and pending human sign-off; migration, upload resolver, scanner, clean-verdict, atomic transaction, quarantine notification, firewall, client, DSAR, mobile, and concurrency runtime evidence are not established. Live status is 0 open P0, 0 open P1, 0 blocked P1, 206 open P2, and 76 open P3. The stamp gate remains 500 runtime rows, 329 `runtime_active`, and 190 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 21 pending human-ratification release blockers. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-12, Phase 4.3 Policy completion).** The preceding correction is a pass boundary. D-4.3-005, D-4.3-013, D-4.3-019, and D-4.3-020 are remediated: Appendix K has the Policy term cluster; §12.9 has observable acceptance criteria; and §1.5 / §12.5 / §12.8.4 / §34.3 / §42.6 make Voyage and provider recovery current-source consistent. The filed 5-second framework target and §49 outage reference conflict with §44.1 and §42.6 and are rejected. `AE-V711-PH12-POLICY-RESILIENCE-SAFETY-01` remains current and pending human sign-off; no provider client, detector, migration, transaction, settlement, client, or E2E runtime evidence is established. Live status is 0 open P0, 0 open P1, 0 blocked P1, 202 open P2, and 76 open P3. The stamp gate parses 501 runtime rows, 330 `runtime_active`, and 190 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 21 pending human-ratification release blockers. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-12, AuditEvent residency and retention hygiene).** The preceding correction is a pass boundary. D-1.5-012 is status-synced to §6.7.5.A, which already owns AuditEvent partitioning, export, Ops clearance, migration, and historical-read behavior. D-1.5-013 and D-1.5-014 are remediated by removing plan-duration restatements and the Appendix M.1 Solo omission. No residency or retention product behavior, Authored Extension, or runtime evidence is added. Live status is 0 open P0, 0 open P1, 0 blocked P1, 200 open P2, and 75 open P3. The stamp gate parses 502 runtime rows, 331 `runtime_active`, and 190 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 21 pending human-ratification release blockers. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-12, DSAR documentation hygiene).** The preceding correction is a pass boundary. D-3.5-033 through D-3.5-035 are remediated: §6.8.1 through §6.8.3 have stable anchors, and §6.8.5 specifies that a Pattern B UUID tombstone can support audit joins but cannot restore identity-bearing PII. D-3.5-030 remains open pending a named-role decision between DPO and Privacy Officer; D-3.5-036 remains open pending §M.5 disposition of missing runtime validators. No DSAR runtime evidence is added. Live status is 0 open P0, 0 open P1, 0 blocked P1, 200 open P2, and 72 open P3. The stamp gate parses 503 runtime rows, 332 `runtime_active`, and 190 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 21 pending human-ratification release blockers. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-12, DSAR observability catalog reconciliation).** The preceding correction is a pass boundary. D-3.5-036 is remediated. Its five-missing-gates premise conflicted with the existing runtime-active `dsar_sla_single_source_of_truth`; §M.5.109 now catalogues the four actually absent gates as pending M02.3 / M11.3 / M21.3 evidence. This adds four honest runtime blockers and no runtime promotion. D-3.5-030 remains open pending the DPO-versus-Privacy-Officer named-role decision. Live status is 0 open P0, 0 open P1, 0 blocked P1, 199 open P2, and 72 open P3. The stamp gate parses 507 runtime rows, 332 `runtime_active`, and 194 blockers: 120 M11.3, 30 M21.3, 14 M02.3, 9 M24.3, and 21 pending human-ratification release blockers. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-12, Buyer Template glossary closure).** The preceding correction is a pass boundary. D-4.10-012 is remediated: Appendix K now defines the Buyer WorkspaceTemplate family, update flow, catalog view, and Apply Update while explicitly separating Marketplace TemplateLibraryEntry. No product behavior, Authored Extension, or runtime evidence is added. Live status is 0 open P0, 0 open P1, 0 blocked P1, 198 open P2, and 72 open P3. The stamp gate remains 507 runtime rows, 332 `runtime_active`, and 194 blockers: 120 M11.3, 30 M21.3, 14 M02.3, 9 M24.3, and 21 pending human-ratification release blockers. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are the current routing sources.

**Current release correction (2026-07-12, user ratification and Phase 1.6 content/reversal closure).** The preceding correction and all earlier counts are pass boundaries. The user explicitly ratified the 21 v7.1.1 pending AEs; no human-ratification blocker remains. D-1.6-009 and D-1.6-010 are remediated as source contracts: §12.7.4 / §4.6.2 / §4.7.1 now fail closed on buyer-internal Q&A attachment content, and §4.7.2 / §25.3.10a now define global-ban reversal across Organization, Marketplace, pages, declarations, signals, search, and the safe Bridge/webhook projection. D-1.6-008 remains open for its missing runtime race test despite AE approval. Live status is 0 open P0, 0 open P1, 0 blocked P1, 196 open P2, and 71 open P3. The stamp gate parses 510 runtime rows, 332 `runtime_active`, and 176 blockers: 122 M11.3, 31 M21.3, 14 M02.3, and 9 M24.3. All blockers are product/runtime evidence; no human-ratification blockers remain. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are current.

**Current release correction (2026-07-12, Phase 1.7 billing data-model and enum residual closure).** The preceding correction is a pass boundary. D-1.7-009, D-1.7-015, D-1.7-016, and D-1.7-017 are remediated: one active CommittedSpendContract per Org now matches the singular AIWallet binding; §32.8.0 explicitly maps legacy cents-stored `*_value_dollars` fields to public `*_value_dollars_cents`; FreeAllowance quota decreases below consumed usage fail closed; and Appendix J owns the OutcomeContract signal-subject enum. AE-V711-PH17-BILLING-DATA-MODEL-01 is approved by explicit user ratification. Live status is 0 open P0, 0 open P1, 0 blocked P1, 194 open P2, and 69 open P3. The stamp gate parses 512 runtime rows, 332 `runtime_active`, and 178 blockers: 122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3. All blockers are product/runtime evidence; no human-ratification blocker remains. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are current.

**Current release correction (2026-07-12, Phase 2.2 numeric/webhook/opt-out hygiene).** The preceding correction is a pass boundary. D-2.2-028, D-2.2-032 through D-2.2-034, D-2.2-048, D-2.2-050, and D-2.2-056 are remediated through current pricing authority, exact §31.5 payload citation, §44.1 numeric singletons, explicit `vendor_opt_out.applied` reuse, and separate live-render versus backfill SLOs. Live status is 0 open P0, 0 open P1, 0 blocked P1, 194 open P2, and 62 open P3. The stamp gate remains 512 runtime rows, 332 `runtime_active`, and 178 blockers: 122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3. No behavior, AE, runtime row, or runtime promotion is added.

**Current release correction (2026-07-12, DPO terminology and Seller Org disambiguation status closure).** The preceding correction is a pass boundary. D-3.5-030 is remediated: DPO / `ops_dpo_admin` is the canonical accountable privacy and DSAR on-call role; Privacy Officer is a delegated function label only. D-2.2-052 is remediated after explicit user ratification of `AE-V711-PH22-SELLER-ORG-DISAMBIGUATION-01`; silent Seller Org merge and automatic new-Org creation remain forbidden on domain mismatch. Live status is 0 open P0, 0 open P1, 0 blocked P1, 193 open P2, and 61 open P3. The stamp gate parses 513 runtime rows, 333 `runtime_active`, and 178 blockers: 122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3. All remaining blockers require product/runtime evidence; no human-ratification blocker remains. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are current.

**Current release correction (2026-07-12, Template and capability consistency closure).** The preceding correction is a pass boundary. D-4.10-019, D-4.10-027, D-4.12-010, and D-4.12-011 are remediated: §25 now cites the current Marketplace TemplateLibraryEntry authority, the existing Amendment Protocol citation is status-synced, and M11 / M13 are correctly classified as fully registered platform-owned capabilities outside the §21.4.2 11-row set. Live status is 0 open P0, 0 open P1, 0 blocked P1, 193 open P2, and 57 open P3. The stamp gate remains 513 runtime rows, 333 `runtime_active`, and 178 blockers: 122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3. No behavior, AE, or runtime status changes.

**Current release correction (2026-07-12, Event/citation hygiene and AE-status authority closure).** The preceding correction is a pass boundary. D-5.7-022, D-5.7-023, D-V8.3-017, D-V8.3-018, D-43-020, D-43-021, and D-EM-008 are remediated. `kb.entry.pending_review` is canonical; Seller-onboarding plan/enum rows are current-source synced; the broken Spec-Ops Slack citation is removed; the retired §43 anchor is preserved for compatibility; and the AE ledger is the sole current ratification source. All release-scoped AEs, including the eight seller rate-card rows, are approved by explicit user ratification. Live status is 0 open P0, 0 open P1, 0 blocked P1, 193 open P2, and 50 open P3. The stamp gate remains 513 runtime rows, 333 `runtime_active`, and 178 product/runtime blockers: 122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3. No human-ratification blocker remains and no runtime row is promoted.

**Current release correction (2026-07-12, Numerical-singleton and audit-boundary hygiene closure).** The preceding correction is a pass boundary. D-4.7-023, D-33-015, D-44-013, D-5V-006, D-5V-007, D-V6-006, D-V9-002, D-48.3-012, D-13V-026, D-V14-002, and D-V14-004 are remediated. §39 owns Intelligence discrepancy thresholds; §44.3.1 owns cache TTLs; the exact L1 attribution boundary is inclusive; all six seller tiers are named; and current audit records are status-synced. Live status is 0 open P0, 0 open P1, 0 blocked P1, 193 open P2, and 39 open P3. The stamp gate remains 513 runtime rows, 333 `runtime_active`, and 178 product/runtime blockers: 122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3. No runtime row is promoted.

**Current release correction (2026-07-12, AE-queue authority and network-effects firewall closure).** The preceding correction is a pass boundary. D-44-016 and D-48.3-015 are remediated. CLAUDE.md marks its former AE queue as historical and defers to the fully approved AE ledger. §48.3.5 makes cross-Buyer-Org reinforcement-cycle joins Ops-only, console-hidden, and k-anonymous for permitted buyer breakdowns. Live status is 0 open P0, 0 open P1, 0 blocked P1, 193 open P2, and 37 open P3. The stamp gate remains 513 runtime rows, 333 `runtime_active`, and 178 product/runtime blockers: 122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3. No human-ratification blocker remains and no runtime row is promoted.

**Current release correction (2026-07-12, feature-inventory classification closure).** The preceding correction is a pass boundary. D-11.4-002 is remediated: `F-BC-001` is the canonical `BC-12.4-01` inventory row, while retired ID `F-AE-016` remains only as an immutable forwarding alias. All 71 active `F-AE-*` rows now resolve cleanly to AE ledger rows. Live status is 0 open P0, 0 open P1, 0 blocked P1, 193 open P2, and 36 open P3. The stamp gate remains 513 runtime rows, 333 `runtime_active`, and 178 product/runtime blockers: 122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3. No runtime row or status is changed.

**Current release correction (2026-07-12, P3 glossary, navigation, analytics, AE, and M.1 hygiene).** The preceding correction is a pass boundary. Sixteen P3 rows are remediated: D-4.12-023, D-51-024, D-HM-013, D-2.2-064, D-2.2-065, D-44-012, D-5.1-043 through D-5.1-045, D-5.6-012, D-9.1-015, D-AE-010, D-V72REM-PH9-001, D-11.1-007, D-11.1-008, and D-11.1-010. Current source now has complete residual glossary terms, accurate §4.4 scope/navigation, Convex-based collaboration measurement, canonical §9 authority, registered Seller shortcuts, distinct analytics error/meta-event names, explicit AE per-gate disposition, corrected V13 arithmetic, and complete M.1 area grouping. Live status is 0 open P0, 0 open P1, 0 blocked P1, 193 open P2, and 20 open P3. The stamp gate remains 513 runtime rows, 333 `runtime_active`, and 178 product/runtime blockers: 122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3. No runtime row is added or promoted.

**Current release correction (2026-07-12, onboarding anti-pattern enum reconciliation).** The preceding correction is a pass boundary. D-5.7-021 is remediated: §48.8.7 owns the AP-number ↔ persisted-key map, Appendix J keys are frozen opaque identifiers, §49.1.9 consumes the map, and Appendix I describes the canonical bans. Unmapped or mismatched pairs fail closed. The inventory generator now uses the exact right-edge status parser instead of a fixed column. Live status is 0 open P0, 0 open P1, 0 blocked P1, 193 open P2, and 19 open P3. The stamp gate remains 513 runtime rows, 333 `runtime_active`, and 178 product/runtime blockers: 122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3. No runtime row is added or promoted.

**Current release correction (2026-07-12, P3 documentation closure).** The preceding correction is a pass boundary. All 19 remaining P3 rows are remediated across acceptance criteria, source authority, data/search contracts, observability, webhook namespaces, enum lineage, governance, glossary, navigation, and ledger hygiene. Appendix J lineage resolves 4,229 controlled tokens with zero unresolved through immutable snapshot bands; §48.7 now uses registered growth webhooks for M14/M15 and canonical billing webhooks for M16/M17. Live status is 0 open P0, 0 open P1, 0 blocked P1, **193 open P2, and 0 open P3**. The stamp gate parses **513** runtime rows, **333** `runtime_active`, and **178** product/runtime blockers: **122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3**. Human-ratification blockers remain zero. No runtime row is promoted; the corpus is not release-complete while the 193 P2 rows and 178 runtime-evidence blockers remain.

**Current release correction (2026-07-12, Organizational Intelligence P2 closure).** The preceding correction is a pass boundary. D-4.7-007, D-4.7-009, D-4.7-015, and D-4.7-017 through D-4.7-022 are remediated. Current §16 already supplied Solo suppression, residency, firewall, numbered ACs, concurrency, plan filtering, and Appendix M tier authority; the remaining gaps now have a persisted discrepancy state/version, resolve/escalate APIs, registered audit actions, surface recovery/mobile behavior, and Appendix L.27. A false §4.3.7.1 pointer to Capability Declaration Appendix L.17 and an unlanded historical L.27 proposal were explicitly corrected. Live status is **0 open P0, 0 open P1, 0 blocked P1, 184 open P2, and 0 open P3**. The stamp gate remains **513** runtime rows, **333** `runtime_active`, and **178** product/runtime blockers: **122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3**. No runtime row is promoted.

**Current release correction (2026-07-12, Enterprise Security P2 closure).** The preceding correction is a pass boundary. D-33-001, D-33-002, D-33-003, D-33-005, D-33-006, D-33-010, D-33-012, and D-33-013 are remediated. §33 now names authenticated encryption and TLS suites, makes the FIPS evidence boundary explicit, maps SOC 2 and ISO 27001 control families, points subprocessor/DPA handling to current authority, defines independent penetration testing, and carries observable acceptance criteria. D-33-014 remains open for the IPAllowlistPolicy entity/API/audit contract. Live status is **0 open P0, 0 open P1, 0 blocked P1, 176 open P2, and 0 open P3**. The stamp gate remains **513** runtime rows, **333** `runtime_active`, and **178** product/runtime blockers: **122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3**. No runtime row is added or promoted.

**Current release correction (2026-07-12, IP allowlist P2 closure).** The preceding correction is a pass boundary. D-33-014 is remediated through §4.2.17-§4.2.18, §32.10.9.F.1, §33.6.1, §39 / §40.2, and Appendices C/G/I/J/M. The approved contract covers WorkOS post-assertion enforcement, interactive/API-token parity, region-local fail-closed lookup, step-up, idempotency, optimistic concurrency, self-lockout prevention, dual-approved Ops exception, mobile/retry states, downgrade recovery, events, and raw-IP/CIDR minimization. Live status is **0 open P0, 0 open P1, 0 blocked P1, 175 open P2, and 0 open P3**. The stamp gate remains **513** runtime rows, **333** `runtime_active`, and **178** product/runtime blockers: **122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3**. No runtime row is added or promoted.

**Current release correction (2026-07-12, Buyer Template Library P2 closure).** The preceding correction is a pass boundary. D-4.10-009, D-4.10-010, D-4.10-018, D-4.10-022, D-4.10-023, D-4.10-025, and D-4.10-026 are remediated. §4.5.14 and §19 now define the Ops-managed source registry, immutable source versions, minimum semver rules, WorkspaceTemplateVersion and Apply Update transitions, mobile divergence, outage behavior, observable acceptance criteria, and complete Appendix M surface mapping. The existing `ops_content_admin` role wins over the filed duplicate-role proposal; §41.3 / §42.6 own delivery degradation because §49 remains Seller Onboarding authority. Live status is **0 open P0, 0 open P1, 0 blocked P1, 168 open P2, and 0 open P3**. The stamp gate remains **513** runtime rows, **333** `runtime_active`, and **178** product/runtime blockers: **122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3**. No runtime row is added or promoted.

**Current release correction (2026-07-12, Inbox and Pulse P2 closure).** The preceding correction is a pass boundary. D-4.11-018, D-4.11-019, D-4.11-023, D-4.11-026, and D-4.11-027 are remediated. Current source now has single-home numeric routing, complete Inbox recovery states, a fixed strict-all-active-timers SLA predicate, related-dashboard boundaries, PulseDigest / PulseDigestExportJob fields and state machines, async API/audit/concurrency behavior, retention/DSAR/residency, export performance, failure/DLQ behavior, and Appendix G/J/K/M registrations. Runtime-active detectors require the exact §20.3.2 weight table and exact §32 response rows; those current gated tokens remain authoritative and extended fields are layered separately. Live status is **0 open P0, 0 open P1, 0 blocked P1, 163 open P2, and 0 open P3**. The stamp gate remains **513** runtime rows, **333** `runtime_active`, and **178** product/runtime blockers: **122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3**. No runtime row is added or promoted.

**Current release correction (2026-07-12, Seller Public Pages P2 closure).** The preceding correction is a pass boundary. D-5.6-011, D-5.6-013 through D-5.6-018, D-5.6-022, D-5.6-023, and D-5.6-025 are remediated. §39.4 owns public-page numbers; §26.6 is observable; §32.10.9.F.2 owns Marketplace authoring APIs; PagePreviewTokenGrant and page-scoped key versions own preview security; §26.7.3.A owns synthetic domain-loss suppression; §4.5.6 suppresses opted-out CapabilityDeclarations; §26.7.7 separates audit, analytics, notification, and webhook classes; Appendix M covers all filed surfaces. The filed request to move enrichment retry into §31.9 conflicts with its non-webhook worker semantics and is rejected. Live status is **0 open P0, 0 open P1, 0 blocked P1, 153 open P2, and 0 open P3**. The stamp gate remains **513** runtime rows, **333** `runtime_active`, and **178** product/runtime blockers: **122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3**. No runtime row is added or promoted.

**Current release correction (2026-07-12, Seller Onboarding P2 closure).** The preceding correction is a pass boundary. D-5.7-012, D-5.7-013, D-5.7-014, D-5.7-017 through D-5.7-020, and D-5V-005 are remediated. §4.4.22 resolves the Stage-6 write; §21.4.7 registers Win/Loss insight synthesis; §49.1.6.A owns locale/display currency; §49.1.7.B keeps funnel events internal; §49.1.10 closes mobile and catalog ACs; Appendices I/J own errors and the generated dark-pattern manifest; §22.18.6.5 owns disqualification. The filed API `rate_limit_class` conflicts with CapabilityRegistryEntry and is replaced by an invocation-concurrency rule. Live status is **0 open P0, 0 open P1, 0 blocked P1, 145 open P2, and 0 open P3**. The stamp gate remains **513** runtime rows, **333** `runtime_active`, and **178** product/runtime blockers: **122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3**. Human blockers remain zero; no runtime row is added or promoted.

**Current release correction (2026-07-12, Console Bridge and auction P2 closure).** The preceding correction is a pass boundary. D-6.1-014, D-6.1-015, D-6.1-017, D-6.1-018, D-6.1-020, D-V6-003, and D-V6-007 are remediated. §4.7.1 hides absolute buyer versions from sellers, §4.7.1.A pairs transition audits with console-specific redaction, §25 / §38 close mobile health and reversal behavior, and current source already owns the two SLO and two auction rules. HMAC tokens are correlation-only; raw monotonic ordering remains server-side. Live status is **0 open P0, 0 open P1, 0 blocked P1, 138 open P2, and 0 open P3**. The stamp gate remains **513** runtime rows, **333** `runtime_active`, and **178** product/runtime blockers: **122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3**. Human blockers remain zero; no runtime row is added or promoted.

**Current release correction (2026-07-12, Pricing Transition P2 closure).** The preceding correction is a pass boundary. D-PT-004 through D-PT-009 are remediated. §34 owns precise integration, audit-export, DPA, annual/monthly conversion credit, FX-lock, and shared-Customer grace behavior; pricing companions now consume that authority. The filed Enterprise-only audit-export and paid-only standard-DPA proposals conflict with §32.8.24 / §45.1 and are rejected. Live status is **0 open P0, 0 open P1, 0 blocked P1, 132 open P2, and 0 open P3**. The stamp gate remains **513** runtime rows, **333** `runtime_active`, and **178** product/runtime blockers: **122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3**. Human blockers remain zero; no runtime row is added or promoted.

**Current release correction (2026-07-12, portability and downgrade P2 closure).** The preceding correction is a pass boundary. D-34.19-011 through D-34.19-016 and stale-open D-V7-005 are remediated. §34.19.1.B reconciles every preserved asset into `never_enforced`, `protected_bucket`, or `audit_retained`; §4 / §22 entity definitions now state carry-over behavior; microcopy tests require every baseline and Solo element; explicit SellerSoftware deletion applies one namespace-migration penalty even inside a bucket, while plan change alone cannot trigger it; and §34.5.5 owns Stripe plan-change ordering, outage, missed-event reconciliation, atomic bucket creation, audit, and privacy. Filed §31.9 / §49 recovery routes conflict with current CRM Sync / Seller Onboarding authority and are rejected. Live status is **0 open P0, 0 open P1, 0 blocked P1, 125 open P2, and 0 open P3**. The stamp gate remains **513** runtime rows, **333** `runtime_active`, and **178** product/runtime blockers: **122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3**. Human blockers remain zero; no runtime row is added or promoted.

**Current release correction (2026-07-12, Appendix C delivery-metadata P2 closure).** The preceding correction is a pass boundary. D-V8.3-010, D-V8.3-011, D-V8.3-012, D-V8.3-014, D-V8.3-015, D-V8.3-019, D-V8.3-021, D-V8.3-022, D-V8.3-025, and D-V8.3-027 are remediated. Appendix C now has one generated delivery-metadata contract for channels, feature-plan inheritance, locale keys, template resolution, deduplication, DND, strictness, failure disposition, and bounded Push; all 24 M1–M8 `growth.mX.*` webhooks are registered. Current §41 and §6.8 / §29.7 / §40.2 already resolve the filed template, SPF/DKIM/DMARC, and DSAR premises. A generic customer failure event is rejected in favor of NotificationFailureAudit plus explicit domain compensators. Live status is **0 open P0, 0 open P1, 0 blocked P1, 115 open P2, and 0 open P3**. The stamp gate remains **513** runtime rows, **333** `runtime_active`, and **178** product/runtime blockers: **122 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3**. Human blockers remain zero; no runtime row is added or promoted.

**Current release correction (2026-07-12, Phase 44 performance and Solo runtime-contract P2 closure).** The preceding correction is a pass boundary. D-44-002, D-44-004, D-44-009, D-44-010, D-44-011, D-44-014, D-44-015, D-44-018, D-44-019, and D-44-020 are remediated. §44 now has quantile-bound budgets, explicit load tiers, a ten-selector Solo suppression manifest, five added edge cases, canonical telemetry schemas, inline AE citations, a bounded no-block fallback, and the `solo_aiop_disposition` state contract. The filed per-event webhook rate-limit proposal is rejected: Appendix F.1 `standard` is a delivery-retry class, not an API rate-limit class. Live status is **0 open P0, 0 open P1, 0 blocked P1, 105 open P2, and 0 open P3**. The stamp gate parses **514** runtime rows, **333** `runtime_active`, and **179** product/runtime blockers: **123 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3**. The new `solo_telemetry_property_schema_completeness` row remains M11.3; human blockers remain zero and no runtime row is promoted.

**Current release correction (2026-07-12, Phase 42 observability P2 closure).** The preceding correction is a pass boundary. D-42-022 through D-42-029 are remediated. Seven rows are synchronized to the existing V12 §42 rewrite; Appendix G now registers the three currently emitted names that were actually absent. The filed additional event names are rejected because current source does not emit them or already uses canonical `ops_incident_*` analytics. Live status is **0 open P0, 0 open P1, 0 blocked P1, 97 open P2, and 0 open P3**. The stamp gate remains **514** runtime rows, **333** `runtime_active`, and **179** product/runtime blockers: **123 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3**. Human blockers remain zero; no runtime row is added or promoted.

**Current release correction (2026-07-12, Phase 51 Product Usage Analytics P2 closure).** The preceding correction is a pass boundary. D-51-014 through D-51-023 are remediated. §51 now uses current Buyer/User/Seller roles, canonical §44.1 / §39 / §42.2 numeric homes, the existing residency-violation event, approved AE-51-01 through AE-51-11, complete analytics-meta paging/runbooks, durable-source outage behavior, and mobile parity. The filed Seller team-role labels and Convex fallback-log proposal conflict with current authority and are rejected. Live status is **0 open P0, 0 open P1, 0 blocked P1, 87 open P2, and 0 open P3**. The stamp gate remains **514** runtime rows, **333** `runtime_active`, and **179** product/runtime blockers: **123 M11.3, 31 M21.3, 15 M02.3, and 10 M24.3**. Human blockers remain zero; no runtime row is added or promoted.

**Current release correction (2026-07-12, Phase 14 pricing-companion P2 closure).** The preceding correction is a pass boundary. Thirteen Buyer/Seller pricing drift rows are remediated through §34.18.5 / §48.1.6 indicator authority, audited Solo threshold review, persisted v2 cutover grandfathering, entitlement-fit day-31 and debrief CTAs, ungated Buyer creation, and payment-authorized Seller per-bid election with submit-time capture. Master §44.6 wins over the stale companion/§34 sentences; pricing examples do not become numerical or event authority. Live status is **0 open P0, 0 open P1, 0 blocked P1, 74 open P2, and 0 open P3**. The stamp gate parses **518** runtime rows, **333** `runtime_active`, and **183** product/runtime blockers: **126 M11.3, 31 M21.3, 15 M02.3, and 11 M24.3**. Four honest runtime-evidence rows were added; human blockers remain zero and no runtime row is promoted.

**Current release correction (2026-07-12, Phase 48 growth and network-effects P2 closure).** The preceding correction is a pass boundary. Nine §48 P2 rows are remediated through current M2/M14 entity sources, structural signal cadence, defined S3/S6 metrics, a canonical attribution-window taxonomy, four negative-direction monitors, anonymity-bound M3 signing, and snake_case M14–M17 PostHog tables. `network_effects_inventory_completeness` v1.1.0 and `appendix_g_event_name_underscore_normalization` v1.1.0 pass live and positive fixtures and reject their negative fixtures. Live status is **0 open P0, 0 open P1, 0 blocked P1, 65 open P2, and 0 open P3**. The stamp gate parses **521** runtime rows, **333** `runtime_active`, and **186** product/runtime blockers: **127 M11.3, 33 M21.3, 15 M02.3, and 11 M24.3**. Three honest product-runtime rows were added; human blockers remain zero and no product runtime row is promoted. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are current routing sources.

**Current release correction (2026-07-12, Phase 50 Ops Console P2 closure).** The preceding correction is a pass boundary. D-50-011, D-50-016, D-50-023, D-50-026, D-50-033, D-50-035, D-50-037, and D-50-040 are remediated. Current source now defines unsampled reduced-projection Ops-read audit, N-total-signer quorum notation, canonical step-up extension, customer-safe suspension webhook delivery, new-role hygiene, per-channel notification outcomes, WCAG 2.1 AA Ops behavior, and separate §39.5 operational-close versus storage-capacity thresholds. The filed 90-day read retention conflicts with §40.2 / §6.7.5 and is rejected. Live status is **0 open P0, 0 open P1, 0 blocked P1, 57 open P2, and 0 open P3**. The stamp gate parses **526** runtime rows, **333** `runtime_active`, and **191** product/runtime blockers: **130 M11.3, 34 M21.3, 16 M02.3, and 11 M24.3**. Human blockers remain zero; five product-evidence rows are pending and no runtime row is promoted. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are current routing sources.

**Current release correction (2026-07-12, Phase 9.1 analytics P2 closure).** The preceding correction is a pass boundary. Eight Phase 9.1 P2 rows are remediated through Defense View engagement events, side-qualified plan tiers, an exactly-once first-index milestone, FeaturedPlacement click/EOI attribution, non-duplicative buyer-evaluation derivation, deterministic compact-property typing, render-time cohort suppression, and allow-list webhook mirrors that drop free text. Live status is **0 open P0, 0 open P1, 0 blocked P1, 49 open P2, and 0 open P3**. The stamp gate parses **531** runtime rows, **333** `runtime_active`, and **196** product/runtime blockers: **131 M11.3, 37 M21.3, 17 M02.3, and 11 M24.3**. Human blockers remain zero; five product-evidence rows are pending and no runtime row is promoted. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are current routing sources.

**Current release correction (2026-07-12, AE and V14 audit-hygiene synchronization).** The preceding correction is a pass boundary. D-2-043, D-AE-012, D-V14-001, D-V14-003, D-V14-005, and D-V14-006 are remediated against current approved AE status, the existing Phase 14.4 findings artifact, the Appendix K/§4.8.3 cents convention, and the current §27 singleton citations. Live status is **0 open P0, 0 open P1, 0 blocked P1, 43 open P2, and 0 open P3**. The stamp gate remains **531** runtime rows, **333** `runtime_active`, and **196** product/runtime blockers: **131 M11.3, 37 M21.3, 17 M02.3, and 11 M24.3**. Human blockers remain zero; no runtime row is added or promoted.

**Current release correction (2026-07-12, Hero Moment residual P2 closure).** The preceding correction is a pass boundary. D-HM-010, D-HM-011, D-HM-014, and D-HM-015 are remediated. §44.1 / §22.18.7 own Stake-Reveal and per-CM outcome targets; §22.20 separates Pro Trial presentation from its standard activation SLO; §46 binds Buyer Pulse to Buyer performance authority; and §4.4.22 / §49.1.3.A define direct-signup value activation without fabricating a bid Hero Moment. Live status is **0 open P0, 0 open P1, 0 blocked P1, 39 open P2, and 0 open P3**. The stamp gate parses **535** runtime rows, **333** `runtime_active`, and **200** product/runtime blockers: **133 M11.3, 39 M21.3, 17 M02.3, and 11 M24.3**. Human blockers remain zero; four product-evidence rows are pending and no runtime row is promoted. `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/V711_BACKLOG_INDEX.md` are current routing sources.

**Current release correction (2026-07-12, capability and entitlement residual synchronization).** The preceding correction is a pass boundary. D-4.12-016, D-4.12-020, D-CONS-014, D-CONS-017, D-EM-012, D-EM-015 through D-EM-017, D-EM-019, and D-EM-021 are remediated. Current source now directly binds capability registry acceptance, Seller Page publication outcomes, typed entitlement cells, the surface/engine split, pending-operation downgrade snapshots, and the independent first-pass capability decision; historical Appendix L and untyped-matrix premises are retired. Live status is **0 open P0, 0 open P1, 0 blocked P1, 29 open P2, and 0 open P3**. The stamp gate remains **535** runtime rows, **333** `runtime_active`, and **200** product/runtime blockers: **133 M11.3, 39 M21.3, 17 M02.3, and 11 M24.3**. No runtime row is added or promoted.

---

## 1. What Sourcera Is

Sourcera is the operating system for enterprise software procurement. Two firewalled consoles (Buyer and Seller) plus a Vendor Discovery Marketplace. Buyers run a structured evaluation pipeline ("The Sourcera Method"). Sellers maintain a Knowledge Base that feeds Codex Managed Agents to respond to buyer evaluations. Pricing is outcome-based AI consumption on top of plan tiers.

This folder is the full strategic, product, engineering, and go-to-market corpus. Treat every artifact as production-grade.

---

## 2. Source-of-Truth Hierarchy

When sources conflict, resolve in this order (highest first). Always surface the conflict explicitly before resolving — never silently pick one.

1. **`Sourcera_Master_Spec.md`** — authoritative build spec. Engineering, design, QA, analytics, security, finance, ops all implement against this.
2. **`Sourcera_Buyer_Pricing_Strategy.md`** and **`Sourcera_Seller_Pricing_Strategy.md`** — authoritative for pricing, billing, AIOperation metering, entitlements, rate cards.
3. **`KB_Engineering_Spec.md`** *(retired in v7.0.0; snapshot at `_versions/KB_Engineering_Spec_retired_2026-04-26.md`)* — was authoritative for Seller Knowledge Base, MCP, Managed Agents, retrieval, indexing, skill registry, tool use. All authoritative content has been integrated into Master Spec §22. Do not consult except for historical reference.
4. **`Sourcera_Master_Summary.md`** *(retired in v7.0.0; snapshot at `_versions/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md`)* — was authoritative for positioning, GTM concepts, PLG loops, network effects that were not yet integrated into the Master Spec. Superseded by Master Spec. Do not consult.
5. **`UX_Design_of_Sourcera.md`** — authoritative for UX tokens, interaction patterns, and design-language detail not yet pulled into §3 of the Master Spec.
6. **`GTM/GTM_Prompts.md`** and other narrative GTM artifacts (see §4 below) — authoritative for positioning and narrative only. Never authoritative for engineering behavior.
7. **`Build_Execution_Strategy.md`** and **`Linear_Execution_Blueprint.md`** — authoritative for execution sequencing and Linear project structure. Not authoritative for product behavior.

> Older integration and audit artifacts may reference a file named `What_is_Sourcera.md`. That file does not currently exist in this folder and is not an active source. If a session needs narrative framing, use Master Spec §1 (architecture) and §2 (method) or `GTM/GTM_POSITIONING.md`. Do not consult the retired `_versions/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md`.

---

## 3. Folder Layout

```
Sourcera/
├── AGENTS.md                                  # This file. Project navigation guide.
├── Sourcera_Master_Spec.md                    # Canonical build spec (v7.1.0a).
├── Sourcera_Buyer_Pricing_Strategy.md         # Buyer pricing companion.
├── Sourcera_Seller_Pricing_Strategy.md        # Seller pricing companion.
├── UX_Design_of_Sourcera.md                   # UX/UI spec.
├── Build_Execution_Strategy.md                # Three-layer execution doctrine.
├── Linear_Execution_Blueprint.md              # Linear project / cycle / issue structure.
├── SWE_Project_Instructions.md                # Engineering operating instructions.
│
├── GTM/                                       # GTM corpus (10 files; narrative only).
│   ├── GTM_Project_Instructions.md            # GTM mode operating instructions.
│   ├── GTM_Prompts.md
│   ├── GTM_POSITIONING.md
│   ├── GTM_PLG_ARCHITECTURE.md
│   ├── GTM_NETWORK_EFFECTS.md
│   ├── GTM_GROWTH_TACTICS.md
│   ├── GTM_CONTENT_ENGINE.md
│   ├── GTM_SALES_PLAYBOOK.md
│   ├── GTM_90DAY_SPRINT.md
│   └── GTM_PLAYBOOK_PROMPTS.md
│
├── _integration/                              # Integration program — authoritative log.
│   ├── RECONCILIATION.md                      # Master reconciliation log (1.3 MB).
│   ├── DELTA_INVENTORY.md                     # v6 → v7 delta inventory.
│   ├── Decisions.md                           # Pending-decisions ledger.
│   ├── AUTHORED_EXTENSIONS_LEDGER.md          # AE ratification queue.
│   ├── Integration_Prompts.md                 # 13-phase prompt program (v1.2).
│   ├── Integration_Prompts_v7.1.md            # v7.1 phase prompts.
│   └── PHASE{N}_VERIFY.md                     # Per-phase verification logs.
│
├── _versions/                                 # Historical snapshots (read-only by default).
├── _personal/                                 # Personal scratch (not corpus).
│   └── Blake_Task_List_Document_Hardening.md
│
└── assets/                                    # Binaries and non-spec reference material.
    ├── Sourcera_Pitch_Deck.pptx               # Investor pitch deck.
    ├── Sourcera_Investor_Talk_Track.docx      # Investor talk track.
    └── brandguidelines/                       # External design references.
        ├── README.md
        └── ramp-design-system.html
```

The empty directory `Pitch Assets/` was retired into `assets/` on 2026-04-29 but the FUSE-backed sync layer would not allow the empty directory to be removed from the bash sandbox. Delete it manually in Finder if it remains.

---

## 3.1 File Catalog — Core Specification Layer

All paths relative to the Sourcera folder root.

| File | Size | Role | When to read |
|---|---|---|---|
| `Sourcera_Master_Spec.md` | ~4.9 MB, v7.1.0a (2026-05-20 hot-patch stamp; current through 2026-07-09 runtime-status sync) | The build spec. §1 architecture, §2 method (incl. §2.8 Single-Operator Mode), §3 UX (incl. §3.13 Principle 9, §3.14 Pipeline surface compression), §4 data model, §5 RBAC, §6 auth, §7–§51 feature sections (incl. §13.11 Defense View, §13.12 Buyer Maya intake, §22.20 Seller Maya Polish, §44.6 Solo-Tier Surface Treatment), appendices A–M (Appendix M = surface/engine mapping registry + §M.4 / §M.5 CI gate catalogs). | Any engineering, data-model, RBAC, billing, AIOperation, pricing-enforcement, API, webhook, feature-access, surface/engine, CI-gate, or consistency question. |
| `Sourcera_Buyer_Pricing_Strategy.md` | 43 KB, v3 (2026-04-27) | Buyer plans (Free / Solo / $299 / $799 / $1,999 / custom), outcome-based AI consumption, rate cards, scenarios. Numerical authority is in Master Spec §34. | Any buyer billing, metering, or entitlement narrative — but cite Master Spec §34 for numerical contracts. |
| `Sourcera_Seller_Pricing_Strategy.md` | 72 KB, v3 (2026-04-27) | Seller plans (Free / Solo / $149 / $499 / $1,499 / custom), forced-signup mechanics, Hero Moment, KB value capture, seller network effects, Marketplace Discovery pricing. Numerical authority is in Master Spec §34. | Any seller billing, metering, entitlement, KB-value-capture, or marketplace-pricing narrative — but cite Master Spec §34 for numerical contracts. |
| `UX_Design_of_Sourcera.md` | 483 KB, v2.0.0 (2026-04-28) | Production-ready UX/UI spec. Tokens, components, interaction patterns, motion, a11y. | UX tokens, state catalogs, component behavior, accessibility. When Master Spec §3 is silent or less detailed, this is authoritative. |
| `_versions/KB_Engineering_Spec_retired_2026-04-26.md` | 91 KB | **Retired in v7.0.0.** Was the Seller KB engineering spec: Managed Agents API (`managed-agents-2026-04-01`), Agent SDK, tool use, skills, retrieval, indexing. Content integrated into Master Spec §22. | Historical reference only. For current KB engineering, read Master Spec §22. |
| `_versions/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md` | 175 KB | **Retired in v7.0.0.** Was the strategic narrative source. Superseded by Master Spec. | Do not consult. |

---

## 4. File Catalog — GTM Layer

GTM files live in `GTM/`. Narrative and strategic only. Never authoritative for engineering behavior.

| File | Size | Focus |
|---|---|---|
| `GTM/GTM_Project_Instructions.md` | 6 KB | Operating instructions for GTM sessions. Pin to Cowork project settings for GTM mode. |
| `GTM/GTM_Prompts.md` | 45 KB | GTM prompt library — positioning, category, messaging, ICP, personas. |
| `GTM/GTM_POSITIONING.md` | 102 KB | Category creation, positioning, competitive framing. |
| `GTM/GTM_PLG_ARCHITECTURE.md` | 111 KB | PLG architecture, buyer and seller growth loops, funnel design. |
| `GTM/GTM_NETWORK_EFFECTS.md` | 92 KB | Two-sided marketplace dynamics, seller-side network effects, data moat. |
| `GTM/GTM_GROWTH_TACTICS.md` | 61 KB | Growth tactics — referrals, virality, partnerships. |
| `GTM/GTM_CONTENT_ENGINE.md` | 86 KB | Content strategy, SEO, programmatic SEO, thought leadership. |
| `GTM/GTM_SALES_PLAYBOOK.md` | 152 KB | Sales motion, ICP, cold outreach, demo script, objection handling. |
| `GTM/GTM_90DAY_SPRINT.md` | 81 KB | Solo-operator 90-day GTM execution plan. |
| `GTM/GTM_PLAYBOOK_PROMPTS.md` | 50 KB | Reusable GTM playbook prompts. |

---

## 5. File Catalog — Execution & Planning

| File | Role |
|---|---|
| `Build_Execution_Strategy.md` | The three-layer execution model (Linear orchestration · repo context · Codex execution). How milestones, implementation packs, and AGENTS.md files are structured. |
| `Linear_Execution_Blueprint.md` | v2.0.0 hardened post-audit. Linear project, team, cycle, issue, label structure. Milestone graph. |
| `SWE_Project_Instructions.md` | The canonical engineering/staff-engineer operating instructions (same content as the project settings). |
| `_integration/Integration_Prompts.md` | v1.2 Opus-optimized. The 13-phase prompt program that integrates Summary and KB spec into the Master Spec to produce v7.0.0. When the user references "Phase N" or "Prompt V," they mean this file. **Moved from root → `_integration/` on 2026-04-29.** Historical references in `_integration/` logs that say `/Sourcera/Integration_Prompts.md` now refer to this path. |
| `_integration/Integration_Prompts_v7.1.md` | v7.1 phase prompts (Surface-Abstraction & Dual-Maya program). **Moved from root → `_integration/` on 2026-04-29.** Previously uncatalogued; surfaced as drift during the 2026-04-29 reorganization. |
| `_personal/Blake_Task_List_Document_Hardening.md` | Blake's personal running task list for document hardening. **Moved from root → `_personal/` on 2026-04-29** to separate personal scratch from corpus. |

---

## 6. File Catalog — `_integration/` (Authoritative Integration Artifacts)

These are authoritative for the v7.0.0 → v7.1.0 integration program. Do not delete or rewrite. Append-only in spirit — update existing entries when status changes.

| File | Role |
|---|---|
| `_integration/RECONCILIATION.md` | 1.3 MB. The master reconciliation log. Every integration decision, conflict, and resolution lives here. If the user asks how a decision was made, this is the first place to look. |
| `_integration/DELTA_INVENTORY.md` | 105 KB. Exhaustive delta inventory from v6.0.0 → v7.0.0 walked out of the Summary and KB spec. The scoping document for the entire integration. |
| `_integration/Decisions.md` | 62 KB. Pending-decisions ledger. Advisory recommendations on open calls surfaced during Phases 0–4, Pricing Rewrite, and Phase 22 Rewrite. |
| `_integration/AUTHORED_EXTENSIONS_LEDGER.md` | The canonical Authored-Extension ratification queue. Tracks AE rows, status, ratification gates, and owner notification. Release-gate policy: open `pending` rows must ratify before each version stamp. |
| `_integration/Integration_Prompts.md` | v1.2 Opus-optimized. 13-phase prompt program that produced v7.0.0. *(Moved here from root on 2026-04-29.)* |
| `_integration/Integration_Prompts_v7.1.md` | v7.1 phase prompts (Surface-Abstraction & Dual-Maya program). *(Moved here from root on 2026-04-29.)* |
| `_integration/PHASE1_VERIFY.md` … `PHASE14_VERIFY.md` | Per-phase verification logs (Opus adversarial review pattern). Each phase has one canonical log; prior drafts are backed up in `_versions/`. Phase 12 split into 12_1, 12_2, 12_3, 12_4, GATE. Phase 13 split into 13_2, ENG_REVIEW, FINAL. |

---

## 7. `_versions/` — Historical Snapshots (Read-Only by Default)

100 dated snapshots of the Master Spec, companion docs, and verification logs (as of 2026-04-29). Naming convention:

- `Sourcera_Master_Spec.v{version}-pre-{change-id}-{date}.md` — pre-edit backups.
- `Sourcera_Master_Spec_post_{change-id}_{timestamp}.md` — post-edit checkpoints.
- `Sourcera_Master_Spec_v6.0.0.md` — the v6.0.0 baseline.
- `PHASE{N}_VERIFY_{context}.md` — superseded phase-verify drafts.

**Do not read these by default.** They exist so destructive edits are revertible. Only open one when:
- The user explicitly asks about historical state.
- You need to confirm what a section looked like before a specific change.
- You are verifying that a backup was taken before a destructive edit.

**Before any destructive edit to `Sourcera_Master_Spec.md`, copy the current version to `_versions/` with a dated, change-scoped filename.**

---

## 8. `assets/` — Binaries and Non-Spec Reference Material

`assets/` holds investor binaries and external design references. None of these files are authoritative for engineering behavior.

| File | Role |
|---|---|
| `assets/Sourcera_Pitch_Deck.pptx` | Investor pitch deck. Open via the `pptx` skill if you need to read or edit it. *(Moved from root on 2026-04-29.)* |
| `assets/Sourcera_Investor_Talk_Track.docx` | Investor talk track. Open via the `docx` skill if you need to read or edit it. *(Moved from `Pitch Assets/` on 2026-04-29.)* |
| `assets/brandguidelines/README.md` | 18 bytes — placeholder. *(Moved from `brandguidelines/` on 2026-04-29.)* |
| `assets/brandguidelines/ramp-design-system.html` | 107 KB standalone HTML reference of Ramp's design system. Used as an external stylistic reference, not a spec. Do not copy Ramp tokens into Sourcera — Sourcera has its own token system in UX spec §3 and Master Spec §3. *(Moved from `brandguidelines/` on 2026-04-29.)* |

---

## 9. `_personal/` — Personal Scratch (Not Corpus)

Files here are personal task lists, working notes, or other artifacts that are not part of the Sourcera corpus. Sessions should generally not consult `_personal/` unless the user explicitly references it.

| File | Role |
|---|---|
| `_personal/Blake_Task_List_Document_Hardening.md` | Blake's running task list for document hardening. *(Moved from root on 2026-04-29.)* |

---

## 10. Task Routing — Which File for Which Question

| User asks about… | Read in this order |
|---|---|
| Data model, entities, fields, scope isolation | Master Spec §4, Appendix K (glossary), Appendix J (enums). |
| RBAC, roles, guest scoping, feature access | Master Spec §5 (especially §5.11 Feature Access Matrix). |
| Auth, SSO, MFA, session, domain governance, DSAR | Master Spec §6. |
| Pricing tiers, consumption, AI metering, rate cards | Buyer Pricing (buyer-side), Seller Pricing (seller-side), Master Spec §34 (plan definitions) and §44 (consumption model). |
| Seller KB, MCP, Managed Agents, retrieval, skills | Master Spec §22 (canonical; KB Engineering Spec content fully integrated here in v7.0.0). |
| UX tokens, states, interaction patterns | Master Spec §3 first; `UX_Design_of_Sourcera.md` for deeper component/interaction detail. |
| APIs, webhooks, error codes, rate limits, idempotency | Master Spec §31 (webhooks), §32 (APIs), Appendix C (notification events), Appendix I (error codes). |
| Marketplace discovery, vendor directory, seller signals | Master Spec §27, Seller Pricing §Marketplace Discovery Pricing. |
| PLG, growth loops, network effects, positioning | Master Spec §48 (integrated growth concepts); `GTM/GTM_PLG_ARCHITECTURE.md` and `GTM/GTM_NETWORK_EFFECTS.md` for narrative detail. |
| Execution sequencing, Linear structure, cycle planning | `Build_Execution_Strategy.md`, `Linear_Execution_Blueprint.md`. |
| v7.1.1 stamp scope, backlog inventory, or release readiness | `_audit/V711_BACKLOG_INDEX.md` (first), `_audit/REMEDIATION_BACKLOG.md`, `_audit/DEFECT_LEDGER.md`, `_integration/AUTHORED_EXTENSIONS_LEDGER.md`, then `_integration/RECONCILIATION.md` for historical phase evidence. |
| An integration-program decision or conflict | `_integration/RECONCILIATION.md` (first), `_integration/Decisions.md`, phase verify logs. |
| "Phase N" or "Prompt V" references | `_integration/Integration_Prompts.md` (v7.0.0 program) and `_integration/Integration_Prompts_v7.1.md` (v7.1.x program). |
| Authored Extensions (AE-*) | `_integration/AUTHORED_EXTENSIONS_LEDGER.md`. |

When the question spans multiple files, read all relevant sources in full before responding. Do not grep the spec for a heading and answer from that alone — read the section end-to-end.

---

## 11. Authoring Conventions (Non-Negotiable)

Any new or extended spec content must meet Master Spec fidelity. Enforce on every authored change.

- **Entities.** Full field table: `Field | Type | Constraints | Notes`. Include `id` (UUID), `org_id` (FK) where applicable, `console` enum where applicable, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at` (nullable for soft delete). State scope isolation (org / console / workspace / marketplace-domain). State required indexes. State retention rules.
- **Acceptance criteria.** Numbered, testable, observable, measurable, scope-bound. Mirror the style of §13.10, §14.9, §17.8, §20.7.
- **Enums.** Register every value in Appendix J. Never invent inline enum values.
- **Glossary.** Every new multi-section term → Appendix K. (Phase 12.3 — 2026-04-26: convention amended from "Appendix B" to "Appendix K" to match Master Spec body. Appendix B is the Keyboard Shortcut Reference; Appendix K is the canonical Glossary. CI gate `appendix_k_glossary_canonicality` asserts.)
- **State machines.** `From / To / Trigger / Conditions / Notes` tables. Prose state descriptions are not acceptable.
- **APIs.** Follow §32: method, path, auth scope, rate-limit class, cursor pagination (default 50, max 250), request schema, response schema, error codes (update Appendix I), idempotency, concrete examples.
- **Webhooks.** Follow §31: HMAC-SHA256 signing, idempotency via `event_id`, exponential backoff, DLQ after 5 failures, payload ≤256KB, register in Appendix C and Appendix G (PostHog taxonomy).
- **Plan gating.** Reflect in §5.11 (Feature Access Matrix), §34.1 (Plan Tier Definitions), §39 (Object Size Constraints). Never duplicate a limit inline — cite the table.
- **Retention / privacy.** State retention (§40.2), DSAR behavior (§6.8), data-residency behavior, GDPR anonymization path.
- **Numerical values.** One authoritative home per number (§34, §39, §44, §6.8, §40.2, §42.1). Inline references cite the table, not the number.
- **Heading syntax.** Preserve `## N.N Title {#n.n-title}`.

---

## 12. Edge-Case Discipline

Every review or authoring pass must explicitly consider: first-time vs returning users · empty / loading / error / retry / partial states · validation · auth / permission failures · concurrency and sync conflicts · idempotency and retries · notification and webhook delivery failures · third-party outages (WorkOS · Stripe · Convex · Anthropic · Firecrawl · PostHog · Loops.so · Perplexity · Zendesk) · mobile vs desktop divergence · admin vs end-user · guest role scoping · buyer/seller console firewall · marketplace-domain leakage · data residency (US / EU / custom) · TZ / locale / currency · downgrade paths and data preservation · DSAR and right-to-erasure compatibility. If a feature is silent on any applicable dimension, surface the gap.

---

## 13. Operational Rules for Codex

1. **Read before answering.** For any non-trivial question, read the relevant source file(s) in full. Opus's context budget is sufficient for the entire corpus — use it. Never claim to have reviewed a document you only sampled.
2. **Back up before destructive edits.** Copy `Sourcera_Master_Spec.md` to `/_versions/Sourcera_Master_Spec_pre-{change-id}-{YYYY-MM-DD}.md` before any structural change. Same convention for any other authoritative spec file.
3. **Surface conflicts explicitly.** When two sources disagree, state the conflict, cite both, and resolve per the hierarchy in §2. Never silently pick a side.
4. **Flag authored extensions.** If a source is underspecified and you author the missing detail, mark the addition as `Authored Extension — requires human sign-off` and append a row to `_integration/AUTHORED_EXTENSIONS_LEDGER.md`.
5. **Do not hallucinate corpus content.** If the corpus does not support a claim, say so.
6. **Do not produce partial analysis.** Finish the work, then deliver. No rolling commentary while reading.
7. **Do not narrate process.** The work is the work. Don't list the documents you read — let the answer reflect it.
8. **Maintain terminology consistency.** Normalize naming when the user's input is inconsistent (e.g., "AI operation" → `AIOperation`; "MRR" vs "subscription revenue" — use the term established in the spec).
9. **Master Spec wins.** v7.0.0 is complete and v7.1.0a is stamped. The Master Spec is canonical for every topic the retired Master Summary and KB Engineering Spec previously covered. Treat the retired snapshots in `_versions/` as historical reference only.
10. **Do not consult `_personal/` unless the user explicitly references it.** It is personal scratch, not corpus.
11. **Move-history pointers in old logs.** `_integration/` log entries reference `Integration_Prompts.md` and `Integration_Prompts_v7.1.md` by bare filename or by the legacy path `/Sourcera/Integration_Prompts.md`. As of 2026-04-29 those files live at `_integration/Integration_Prompts.md` and `_integration/Integration_Prompts_v7.1.md`. The historical log entries are not retroactively updated.

---

## 14. Mode Selection

Two session modes are defined in the project instructions:

- **SWE mode** (default in Cowork) — engineering/spec authoring. Governed by `SWE_Project_Instructions.md`. Use when the work is product/engineering/pricing/architecture.
- **GTM mode** — positioning, growth, content, sales. Governed by `GTM/GTM_Project_Instructions.md`. Context-loading protocol: Master Spec §1–§2 (architecture and method) → Buyer Pricing → Seller Pricing → relevant `GTM/` deliverable.

If the request is ambiguous (e.g., "pricing"), default to SWE mode, because pricing has engineering enforcement consequences (metering, entitlement, plan gating). Switch to GTM framing only when the user explicitly asks for positioning, copy, messaging, or sales enablement.

---

## 15. Quick File-Size Reference

| File | Approx size | Load cost |
|---|---|---|
| `Sourcera_Master_Spec.md` | 4.9 MB / ~16,000 lines | Large — read specific sections unless a full pass is required. |
| `UX_Design_of_Sourcera.md` | 483 KB | Readable in one pass. |
| `Sourcera_Seller_Pricing_Strategy.md` | 72 KB | Readable in one pass. |
| `Sourcera_Buyer_Pricing_Strategy.md` | 43 KB | Readable in one pass. |
| `Linear_Execution_Blueprint.md` | 188 KB | Readable in one pass. |
| `Build_Execution_Strategy.md` | 59 KB | Readable in one pass. |
| `_integration/RECONCILIATION.md` | 1.3 MB | Large — grep for the section or phase in question first, then read that block end-to-end. |
| `_integration/DELTA_INVENTORY.md` | 105 KB | Readable in one pass. |
| `_integration/Integration_Prompts.md` | 100 KB | Readable in one pass. |
| `_integration/Integration_Prompts_v7.1.md` | 70 KB | Readable in one pass. |
| Individual `GTM/` files | 45–152 KB | Readable in one pass. |
| Individual phase verify logs | 37–109 KB | Readable in one pass. |

---

## 16. Known Drift / Open Issues

- **Folder reorganization (2026-04-29).** `Integration_Prompts.md`, `Integration_Prompts_v7.1.md` → `_integration/`. `Blake_Task_List_Document_Hardening.md` → `_personal/`. `Sourcera_Pitch_Deck.pptx`, `Sourcera_Investor_Talk_Track.docx`, `brandguidelines/` → `assets/`. Canonical specs kept at root because they are referenced by bare filename in dozens of `_integration/` log entries. Pre-reorg AGENTS.md backed up at `_versions/AGENTS.md.pre-reorg-2026-04-29.md`. Empty `Pitch Assets/` directory could not be removed via the bash sandbox (FUSE permission denial); delete in Finder if it remains. Historical log entries that reference `/Sourcera/Integration_Prompts.md` or bare `Integration_Prompts.md` are not retroactively updated.
- **v7.1.0a stamp state (as of 2026-05-20).** Master Spec is at **v7.1.0a (P0 hot-patch)**. The v7.2.0-REM Program closed Phase 6 (P0 Closure Audit) on 2026-05-20 with the v7.1.0a hot-patch stamp authorized: **12 of 12 PROD-CRIT-NN P0 defects** closed (D-2.2-042, D-AK-001, D-AK-002, D-AK-003, D-11.2-004, D-11.3-001, D-11.3-002, D-EM-001, D-EM-002, D-EM-003, D-EM-004, D-RES-004) across Phases 1–5 of the v7.2.0-REM Program; **3 of 3 P0 Counterfactual failure modes** closed (CF#1 override-firewall four-predicate cross-validator; CF#2 Stripe-Customer Atomic-Binding Protocol; CF#3 §M.5 per-row `Runtime status` column). Pre-stamp Master Spec backup at `_versions/Sourcera_Master_Spec.v7.1.0a-pre-stamp-2026-05-20.md` (6,388,739 bytes; md5 `a186f1b7844e6961f4fb8a12f77f114a`). Stamp authority: Master Spec Changelog v7.1.0a (2026-05-20) entry §1–§6; `_integration/RECONCILIATION.md → v7.2.0-REM Program → Phase 6 — P0 Closure Audit + v7.1.0a Stamp Scoreboard (2026-05-20)`; `_audit/PHASE6_P0_CLOSURE_AUDIT.md`; `_audit/PRODUCTION_READINESS_VERDICT.md §1 / §8 / §9`. The earlier Phase V8.4 v7.1.0a sub-stamp dated 2026-05-08 remains in force as an additive sub-stamp under the v7.1.0a umbrella (Appendix I Preamble + 20 D-V8.4 closures + 10 new §M.5 CI gates); its known-issues carry-over is rebound to the v7.1.1 hygiene pass per the v7.1.0a §6 Known Issues block. **Residual at v7.1.0a stamp time: 808 P1 defects** (organized into 322 P1-cluster slots per `_audit/REMEDIATION_BACKLOG.md §3`) — explicitly out of v7.1.0a scope and now historical only. The live exact-status scanner reports 0 open P0, 0 open P1, 0 blocked P1, 382 open P2, and 135 open P3 rows; `_audit/V711_BACKLOG_INDEX.md §2` is current routing authority, while protected-asset counts are historical pass-boundary evidence. Current stamp gate reports 465 runtime rows, 295 `runtime_active`, and 168 blockers (118 M11.3, 29 M21.3, 12 M02.3, 9 M24.3); use `_audit/V711_BACKLOG_INDEX.md` for live stamp-scope routing. v7.1.1 stamp gate runtime artifact: `tools/release/stamp_gate.ts` (release-orchestration; `v7_1_1_stamp_gate_runtime_status_audit` is the single `spec_binding_release_gate_only` gate in §M.5).
- **v7.1.1 stamp-scope index (2026-06-21).** `_audit/V711_BACKLOG_INDEX.md` is now the canonical aggregate index for v7.1.1 stamp-scope discovery. It supersedes `_audit/V711_READINESS.md` for live scope routing; `_audit/V711_READINESS.md` remains the historical audit that filed D-V711-001 through D-V711-016. Do not treat `_integration/RECONCILIATION.md` v7.1.1 Backlog alone as the full v7.1.1 execution surface.
- **v7.1.0 stamp state (as of 2026-04-28).** Master Spec is at v7.1.0. The Surface-Abstraction & Dual-Maya program (Phase 14.0 → Phase 14.20) is closed. The v7.0.0 baseline is preserved at `_versions/Sourcera_Master_Spec.v7.0.0-pre-v7.1-2026-04-26.md`. *(Superseded as the current stamp by the 2026-05-20 v7.1.0a hot-patch stamp above; preserved here for reference to the v7.1.0 baseline and the v7.1.0 → v7.1.0a delta surface.)*
- **Master Summary supersession.** `Sourcera_Master_Summary.md` was retired in v7.0.0 and remains retired. Snapshot at `_versions/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md`. (The internal "Master Summary v1.2" reference in some pre-v7.1.0 reconciliation drafts referred to a planned §1 rewrite that was superseded by the v7.0.0 retirement; no v1.2 exists.) Not authoritative for any topic.
- **Solo plan tier and Defense View are authoritative in Master Spec.** Solo (`buyer_solo` / `seller_solo`) is in §34.1.1 / §34.1.2 / §34.1.3 / §34.2.1 / §34.2.2 / §34.2.5 / §34.10.3 / §34.12.6, Appendix J Plan Tiers, and Appendix M. Defense View is in §13.11 with state machine in Appendix L.7 and 5 error codes in Appendix I v7.1.0 sub-section.
- **Appendix M is the canonical surface/engine contract.** §M.1 mapping registry (post-V11: positive-semantic `Tier visibility` column per the V11 D-11.1-010 amendment + `Companion: <doc>.md §<anchor>` syntax per the V11 D-11.4-003 amendment), §M.2 process gates, §M.3 Authored Extension Note, §M.4 `appendix_m_coverage_on_diff` CI gate (hardened in Phase V11 remediation pass — closed 2026-05-11), §M.5 **122-gate catalog index / 181-gate aggregate** (per §M.5.6: §M.5.4 index 122 + §M.5.10 V12 33 + §M.5.12 V13 24 + §M.5.13 v7.2.0-REM-Phase-1 2; this §M.5 CI-gate-catalog count is the AE-14.18.1-01 assertion, ratified at v7.2.0-REM Phase 9 as **122 / 181, NOT 135**, and is distinct from — must not be conflated with — the coincident ~135-row AE-V11-04 §M.1 engine-concept backfill pack) (post-V11: with `row_class` / `runtime_status` / `execution_context` / `assertion` / `runbook` / `override_path` schema columns per the V11 D-11.3-007 / -008 / -012 / D-11.4-004 amendments). Override grammar canonical at §M.4.4.5: `appendix_m_coverage_on_diff` overrides use `@appendix-m-internal-only:` per §M.4.4.1 (60-char rationale floor + cross-class qualifier requirement + §M.4.4.2 customer-surface-reachability cross-validation closing the D-11.2-004 P0 firewall-bypass); all other gates use `@ci-gate-override:` per §M.4.4.5 (60-char rationale floor; Gate ID literal match; row-level `not_permitted` supersedes default; `coupled_with:<other_gate_id>` / `requires_audit_event:<event_kind>` suffixes supported).
- **§M.4 / §M.5 runtime posture.** The v7.1.0 stamp-time gate split is historical. Current release truth is `tools/release/stamp_gate.ts`: 471 runtime rows, 301 `runtime_active`, 168 pending-pack blockers, and 2 release-orchestration rows. Master Spec §M.5 owns per-row status; `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` owns the current blocker inventory.
- **§M.4 runtime wiring (M02.3 implementation pack).** Wiring artifacts: `tools/spec-lint/appendix_m_coverage_on_diff.ts` (detector + comment-poster; runs in `.github/workflows/spec-lint.yml`); `tools/spec-lint/override_parser.ts` (§M.4.4.1 / §M.4.4.5 grammar parser); `tools/spec-lint/cross_validation.ts` (§M.4.4.2 customer-surface-reachability cross-validator — the V11 firewall hardening); `tools/spec-lint/cosmetic_edit_filter.ts` (cosmetic-edit filter version-tied to the §M.4.2.1 alias-redirect table); `convex/crons/appendix_m_gate_nightly_digest.ts` (§M.4.6 nightly digest cron — posts to Slack `#spec-ops` with Loops.so `lo_spec_ops_digest` fallback); `convex/audit/spec_lint_audit_event.ts` (§M.4.5.1 AuditEvent serializer); PostHog event `spec_lint.appendix_m_gate_run` (Appendix G); Datadog service `spec-lint` + monitor `appendix_m_gate_nightly_digest_failed`; PagerDuty schedule `spec-ops-oncall-rotation` for reviewer rotation + SLA escalation.
- **v7.1.x descopes (Phase 14.0.1).** GTM rewrites (`GTM_POSITIONING.md`, `GTM_PLG_ARCHITECTURE.md`, `GTM_SALES_PLAYBOOK.md`, `GTM_90DAY_SPRINT.md`) and Marketplace-as-RFP-Exchange (§27 narrative reframing + §48 loop updates) are formally descoped to v7.1.x. Appendix M.1 forward-reference row is labeled "(deferred to v7.1.x; Phase 14.0.1 scope amendment)".
- **v7.1.1 live routing.** The former Phase 14.19 backlog counts are historical. All P1 rows are dispositioned; current lower-severity work routes by canonical defect ID through `_audit/V711_BACKLOG_INDEX.md`. Verification behavior is owned by §4.4.21 / §27.11.3, Seller Solo eligibility by §34.1.2, and §27.10 remains Vendor Opt-Out. The live scan reports 0 open P0, 0 open P1, 0 blocked P1, 373 open P2, and 131 open P3; the stamp gate reports 471 runtime rows, 301 `runtime_active`, and 168 blockers.
- **AE ledger v7.1.0 ratification queue (per `_audit/AE_RATIFICATION_RECOMMENDATIONS.md`, 2026-05-12; refined 2026-05-13 per V14 remediation pass D-V14-004).** Open `pending` rows split by dependency status: **5 READY** (AE-14.9-01 Solo enum authoritative; AE-14.10-07 Solo `low_priority_background` capability set; AE-14.14-21 §2.8.7 AC #5 deadline-countdown TZ rule; AE-14.0.1-01 GTM rewrites descope; AE-14.0.1-02 Marketplace-as-RFP-Exchange descope). **2 formerly BLOCKED on Phase V11 cluster — now `approved` 2026-06-14 at v7.2.0-REM Phase 9** (AE-14.18.1-01 depends_on AE-V11-03 + AE-V11-07 [both `approved` — Phase 3.1] — §M.5 catalog assertion ratified at **122 §M.5.4 index / 181 aggregate, NOT 135**, + 5 new schema columns; AE-14.18.1-02 depends_on AE-V11-06 [`approved` — Phase 2] — `@ci-gate-override:` annotation grammar harmonization at §M.4.4.5). The 5 READY rows + V11 cluster + the 2 now-`approved` rows all close before v7.1.1 stamps per the ledger's release-gate policy. **D-AE-011 (P1) closed `open → remediated 2026-06-14` at Phase 9** (the upstream dependency-blocker is discharged). **Plus Phase V11 (added 2026-05-11):** AE-V11-01 (Hero Moment / Solo override-prohibition cluster — 7 rows), AE-V11-02 (DSAR cascade class-coverage override-prohibition), AE-V11-03 (§M.5 catalog schema tightening — 5 new columns), AE-V11-04 (M.1 Engine-Concept Backfill Pack — body deferred to Phase 11.5), AE-V11-05 (Anchor-slug alias-redirect table seed), AE-V11-06 (§M.4 V11 hardening block), AE-V11-07 (§M.5 V11 hardening block), AE-V11-08 (§M.1 column legend + companion-doc syntax + anchor fix). Owner notification is queued in the v7.1.0 / V11 program section headers of `_integration/AUTHORED_EXTENSIONS_LEDGER.md`.
- **Phase V11 remediation closed 2026-05-11.** Audit Phase V11 (Adversarial Verification of Phase 11) signed off HALTED on 3 inherited P0 ci_gate defects; a same-day remediation pass closed all 3 P0 + 7 of 12 P1 in-place (D-11.4-001 P1 deferred to Phase 11.5 as AE-V11-04; 5 surface-class M.1 backfill defects bundled into the same Phase 11.5 pass). Spec edits: §M.4 full rewrite; §M.5 full rewrite (19 new rows + 17 in-place amendments + 5 new schema columns + 9 anchored sub-headings + corrected post-V11 122-row arithmetic + Phase 14.20 closeout outcome record); §M.1 preamble + Admin Dashboard row anchor fix. Pre-edit Master Spec backup at `_versions/Sourcera_Master_Spec.v7.1.0-pre-V11-remediation-2026-05-11.md`. Full audit trail in `_audit/PHASE11V_FINDINGS.md` + `_audit/DEFECT_LEDGER.md` Phase V11 Spec-Side Remediation block + `_integration/RECONCILIATION.md → Phase V11 Remediation (2026-05-11)` block + `_integration/AUTHORED_EXTENSIONS_LEDGER.md` Phase V11 program section.
- **Pricing strategy docs companion role.** `Sourcera_Buyer_Pricing_Strategy.md` v3 and `Sourcera_Seller_Pricing_Strategy.md` v3 are narrative-and-strategy companions; numerical authority sits in Master Spec §34. When a number conflicts, Master Spec wins.
- Older integration and audit artifacts may reference `What_is_Sourcera.md`, but it is not present in this folder and is not an active source. Use Master Spec §1–§2 for canonical narrative framing or `GTM/GTM_POSITIONING.md` for category positioning.
- Several `pre-*` snapshots in `_versions/` have near-identical sizes — they are discrete revert points, not duplicates. Do not consolidate.
- **v7.2.0-REM Phase 7 renumbering reconciliation (D-AE-016, P2; closed 2026-06-13).** The v7.2.0-REM execution closed canonical **Phase 7** (Prompts 7.1/7.2/7.3 = `AE_RATIFICATION_RECOMMENDATIONS.md §2.1/§2.2/§2.3`) as three separately-labeled passes — "Phase 7" (§2.2), "Phase 8" / "Phase AE Hygiene Pass" (§2.1), "Phase 8.2" (§2.3) = **Phase 7 Sweep-Pass A/B/C**. Those execution "Phase 8"/"Phase 8.2" labels do **NOT** denote canonical **Phase 8 = the cluster ratification** (1V/2V/3V/3V+/6R/V7/V8.4/V9/10V; Prompts 8.1/8.2), which has **not run** (all cluster rows `pending`). Authoritative crosswalk + binding rule for the cluster pass: `_integration/RECONCILIATION.md → v7.2.0-REM Program → Phase 7 Renumbering Reconciliation (D-AE-016 closure) (2026-06-13)`; AE row `AE-V72REM-PH7R-01`; defect `D-AE-016` in `_audit/DEFECT_LEDGER.md`. Resolution is non-destructive (no header renames; redirect annotations at RECONCILIATION L11865/L11980/L10972 + `v7.2.0-Remediation_Prompts.md` Phase 7/Phase 8 headers). **When the canonical Phase 8 cluster pass runs, title its blocks with explicit cluster scope and cross-reference D-AE-016 to avoid a "Phase 8" namespace collision.** Phase 7 verification itself: PASS (re-verified 2026-06-13; `_audit/PHASE7_REM_VERIFY.md`).
- **v7.2.0-REM canonical Phase 8 cluster ratification COMPLETE (2026-06-13).** Supersedes the "has not run (all cluster rows `pending`)" clause in the D-AE-016 bullet above: the canonical Phase 8 cluster pass has now run in two prompts, both 2026-06-13. **Prompt 8.1** ratified 1V/2V/3V/3V+/6R (68 rows `pending → approved` + 2 preserved; `_audit/PHASE_V72REM_PHASE_8_VERIFY.md`; AE row `AE-V72REM-PH8-01`). **Prompt 8.2** ratified V7/V8.4/V9/10V (22 `pending → approved` + AE-37-01 `pending → acknowledged` = 23 rows; `_audit/PHASE_V72REM_PHASE_8_2_VERIFY.md`; AE row `AE-V72REM-PH8-02`). 91 cluster rows total. Per the D-AE-016 binding rule, both passes title their blocks with explicit cluster scope and cross-reference D-AE-016; the Prompt 8.2 program-level row is `AE-V72REM-PH8-02` (deliberately NOT "PH8.2") to avoid colliding with the pre-existing `AE-V72REM-PH8.2-01` (= the §2.3 Phase-14.x row = Phase 7 Sweep-Pass C). Closure notes + reconciliation blocks: `_integration/AUTHORED_EXTENSIONS_LEDGER.md` + `_integration/RECONCILIATION.md → v7.2.0-REM Program → Phase 8 — … Cluster Ratification (cluster pass) (2026-06-13)` (Prompt 8.1) and `… (cluster pass — Prompt 8.2) (2026-06-13)` (Prompt 8.2). Prompt 8.2 also propagated 17 P0 DEFECT_LEDGER canonical filing rows `open → remediated` (dates preserved from the authoritative transition tables) per D-CONS-001 P1; the non-P0 long-tail remains the standing ≥390-row D-CONS-001 v7.1.1 ledger-hygiene backlog. **Surfaced this pass:** the `D-CONS-001` / `D-CONS-002` dual-ID collision (ledger-hygiene defects at DEFECT_LEDGER L233/L234 — D-CONS-001 P1 / D-CONS-002 P2 — vs Phase-CONS/V7 pricing P0s at L3153/L3154; disambiguate by severity + line anchor); and the AE-V72REM-PH8-01 registry-row backfill (the Prompt 8.1 closure note had claimed registry registration that was never landed). **Owed before/around the v7.1.1 stamp:** the **AE-V9-004 outside-counsel GDPR Art. 12(3) statutory-interpretation counter-signature is a BLOCKING pre-v7.1.1-stamp gate**; the AE-37-01 outside WCAG-audit-firm counter-signature; the non-P0 D-CONS-001 canonical-row propagation backlog. **Program advanced to canonical Phase 9** (Phase V11 cluster + AE-14.18.1 unblock portion — **executed 2026-06-14; see the dedicated Phase 9 bullet below**; Phase V12 + Phase V13 cluster ratifications remain the Phase 9 continuation). Pre-edit backups: `_versions/{AUTHORED_EXTENSIONS_LEDGER,RECONCILIATION,DEFECT_LEDGER}.pre-v72REM-Phase8.2-2026-06-13.md`.
- **v7.2.0-REM canonical Phase 9 — Phase V11 cluster + AE-14.18.1 unblock COMPLETE (2026-06-14).** The V11-cluster + AE-14.18.1 portion of canonical Phase 9 executed 2026-06-14 (ledger + audit-doc edit only; no Master Spec body touch). **Phase V11 AE cluster fully dispositioned:** AE-V11-01 / -02 / -05 / -08 `pending → approved`; AE-V11-03 / -06 / -07 confirmed already-`approved` (the three CRITICAL `depends_on:` unblockers — AE-V11-06 at Phase 2 2026-05-15, AE-V11-03 + AE-V11-07 at Phase 3.1 2026-05-18); **AE-V11-04 `pending (stub) → re-targeted to v7.1.2`** per D-AE-015 option (b), decoupling the v7.1.1 stamp cadence from the unbounded Phase 11.5 M.1 Engine-Concept Backfill deferral (the ~135-row pack rides v7.1.2; affected §M.1 rows carry interim `Internal-only, surface-engine-mapping deferred to v7.1.2`). **Now-unblocked AE-14.18.1 pair `pending → approved`:** AE-14.18.1-01 (§M.5 catalog completeness — **ratified at 122 §M.5.4 index / 181 aggregate, NOT 135**; the Phase 9 task's "135" restates the Prompt-3.2 verbiage already adjudicated against at Phase 3.2 — the 13 D-11.3-002 orphan rows are members of the 122, not additive; the coincident ~135 is the distinct AE-V11-04 §M.1 backfill-pack count) + AE-14.18.1-02 (`@ci-gate-override:` grammar; Counterfactual #1 malformed-override rejection verified). Closes **D-AE-011** (P1) + **D-AE-015** (P1) [`open → remediated 2026-06-14`]; **D-11.4-001** (P1) re-bound `deferred_to_phase_11_5` → v7.1.2. Program-level AE row `AE-V72REM-PH9-01`; verification `_audit/PHASE_V72REM_PHASE_9_VERIFY.md`; reconciliation `_integration/RECONCILIATION.md → v7.2.0-REM Program → Phase 9 (2026-06-14)`. **Phase 9 continuation CLOSED (2026-06-14):** Phase V12 (AE-V12-01..-11, 11 rows) + Phase V13 (AE-V13-001..-006, 6 rows) cluster ratifications completed in the V12+V13 continuation pass — **17 AE rows `pending → approved`** under the Founder sole-signer posture (AE-V72REM-00), differentiated sign-offs recorded inline (AE-V12-08 Security; AE-V12-09 Security + audit-integrity owner; AE-V13-001 Privacy Officer DSAR exclusion; AE-V13-003/-004 KB Lead Anthropic Opus 4.6 `workspace_intake_materializer`). V12 ratifies 123 already-`remediated 2026-05-11` defect closures (8 P0 + 78 P1 + 29 P2 + 8 P3); V13 ratifies 31 P1 remediated + 17 partially_remediated. **Counterfactual #1** (Privacy Officer challenge to the AE-V13-001 DSAR exclusion) found the contract holds on the dominant erasure-before-enqueue path; the enqueue→send in-flight erasure residual (GDPR Art. 17) was closed in-place by new **AE-V13-007** (Master Spec §48.8.12 AC #8 + §35.5.5 AC #8 send-time fail-close + PII-minimized skip-audit; `pending` Privacy Officer sign-off; closes D-V72REM-PH9-002 P2). A V13 closure-block summary-vs-enumeration count drift (31/17 headers vs 43/46 enumerated lists) was filed as **D-V72REM-PH9-001** (P3 consistency_drift; v7.1.1 reconciliation; "31/17" headers held authoritative). Program-level AE row `AE-V72REM-PH9-02`; verification `_audit/PHASE_V72REM_PHASE_9_2_VERIFY.md`; reconciliation `_integration/RECONCILIATION.md → v7.2.0-REM Program → Phase 9 (continuation) — Phase V12 + V13 Cluster Ratification (cluster pass) (2026-06-14)`. **Canonical Phase 9 now COMPLETE in full** (V11 cluster + AE-14.18.1 + V12 + V13); the AE-V13-007 DSAR hardening is the only V12/V13-pass Master Spec body touch. Pre-edit backups: `_versions/{AUTHORED_EXTENSIONS_LEDGER,RECONCILIATION,DEFECT_LEDGER}.pre-v72REM-Phase9-2026-06-14.md` + `_versions/AGENTS.md.pre-v72REM-Phase9-2026-06-14.md` (V11 portion); `_versions/{AUTHORED_EXTENSIONS_LEDGER,RECONCILIATION,DEFECT_LEDGER}.pre-v72REM-Phase9-V12V13-2026-06-14.md` + `_versions/Sourcera_Master_Spec.v7.1.0a-pre-v72REM-Phase9-V12V13-2026-06-14.md` + `_versions/AGENTS.md.pre-v72REM-Phase9-V12V13-2026-06-14.md` (V12+V13 portion).
- **v7.2.0-REM Catalog-Completeness Sweep (REMEDIATION_BACKLOG §6.1) — spec-side COMPLETE (2026-06-14).** The v7.1.1 stamp-gate §6.1 catalog-completeness sweep landed the Appendix-completeness registrations for the original Phase-6 audit's §25 / §27 catalog defects: **Appendix J** (26 enums — 11 §25/§4.7 Console-Bridge + Disqualification, 13 §27, plus `seller_signal_k_anon_state` [AE] + `webhook_retry_class`), **Appendix C** (35 webhook events, 7-col schema, all F.1 `standard`), **Appendix G** (55 PostHog events — 35 mirrors + 14 observability + 6 Bid-Response materialization), **Appendix I** (88 error codes — 17 §25/§4.7 + 71 §27), **Appendix L §L.8** (11 state-machine cross-references), **Appendix M.1** (5 surfaces + the D-6.2-023 "Score-Drift & Fairness Dashboard" rename), **§M.5.18** (5 CI gates: `appendix_c_webhook_catalog_completeness`, `appendix_c_to_appendix_g_coverage`, `appendix_c_to_appendix_f_retry_class_coverage`, `webhook_default_retry_class`, `appendix_j_enum_completeness` — all `spec_binding_pending_pack_m02_3`; `appendix_m_coverage_on_diff` re-asserted `runtime_active`; §M.5 running count 134 → 139). Plus body edits: D-6.1-012 retry-curve rename (`console_bridge_standard` → non-webhook `bridge_apply_standard`, §25.2.2; Bridge webhooks routed to F.1) and D-6.1-016 (§4.7.2 AC #2 `vendor_disqualification_global_ban_requires_dual_signoff` HTTP 403 → 422). **Naming-collision note:** this sweep is **NOT** the v7.2.0-REM Phase 6 — P0 Closure Audit + v7.1.0a Stamp (2026-05-20); it reuses the "Phase 6" label (the original-audit Phase-6 §6.1 defects), disambiguated by date (2026-06-14) + the "Catalog-Completeness" descriptor + unique anchors. Filed as **D-V72REM-PH6-003** (P3) per D-AE-016 non-destructive discipline (no header renames). **Defect transitions:** 22 `remediated 2026-06-14` + 1 `partially_remediated` (D-6.2-020 — error code landed; §4.4.21 `secondary_reviewer_user_id` data-model task remains open) + 3 new filed (`open`, v7.1.1): **D-V72REM-PH6-001** (P3 `vendor_opt_out_authority_failure_reason` 10-vs-11 count drift), **D-V72REM-PH6-002** (P2 §27.9.9-vs-Appendix-C webhook naming drift — 8 §27.9 Seller-Signal events already registered under drifted canonical names, NOT duplicated), **D-V72REM-PH6-003** (P3 "Phase 6" namespace collision). **V12 / V13:** asserted already-closed (V12 filed **zero** catalog-completeness defects; V13's catalog rows were authored 2026-05-12 [Appendix C/I/J `Phase V13 Additions`] + ratified at Phase 9 2026-06-14) — no transitions; the task-prompt "V12/V13 catalog cluster ≈ 72 defects" framing was a premise mismatch resolved before execution (the "~72" = the **expanded appendix-row count** of the §6.1 17 defects, ~225 rows). **Authored Extensions:** AE-V72REM-PH6-01 (`seller_signal_k_anon_state` enum-typed-column body adoption at §4.4.18 — Convex migration deferred) + AE-V72REM-PH6-02 (5 §M.5.18 gates + M02.3 detector wiring), both `pending` v7.1.1. Pre-edit Master Spec backup `_versions/Sourcera_Master_Spec.v7.1.0a-pre-v72REM-Phase6-catalog-2026-06-14.md` (6,413,689 bytes; md5 `5056b4928487ef14723ecdd7fb064f41`). Trail: `_integration/RECONCILIATION.md → v7.2.0-REM Program → Catalog-Completeness Sweep (REMEDIATION_BACKLOG §6.1) (2026-06-14)`; `_audit/DEFECT_LEDGER.md → v7.2.0-REM Catalog-Completeness Sweep …`; `_audit/PHASE_V72REM_PHASE_6_VERIFY.md`; `_integration/AUTHORED_EXTENSIONS_LEDGER.md` AE-V72REM-PH6-01/-02. **Residual to v7.1.1 stamp:** M02.3 detector runtime-wiring for the 5 gates + the 2 AE ratifications + the 3 drift defects (all routed to v7.1.1; this sweep is the spec-side closure, not the runtime closure).
- **v7.2.0-REM Phase 10 — Spec-Wide Catalog-Completeness HALT + §12 First Tranche (2026-06-14).** Phase 10 was first verified narrow-scope PASS (no halt) against the §6.1 sweep + V12/V13 (`_audit/PHASE10_REM_VERIFY.md` Pass 1, §0–§7). The single escalated finding (D-V72REM-PH10-001 / F-1) — that the catalog-completeness *class* is not exhausted spec-wide — was put to the operator, who chose **option (b): spec-wide**. Phase 10 is therefore **HALTED** (sign-off withheld) and **re-scoped as the umbrella program for every catalog-class P1 defect spec-wide**, subsuming the catalog-class subset of Phase 11 (§3.1) + Phase 12 (§3.2). At decision time **219** open P1 catalog-class defects existed (enum/webhook/state_machine/error_code/notification/surface_engine_mapping/posthog_event). **First tranche executed & closed:** the **§12 Policy Ingestion catalog cluster** — a cross-cohort unit (`D-12-002/-004/-006/-012` + `D-4.3-003/-004/-006/-008/-012/-018`; divergent cohort names reconciled to canonical with aliases) — **10 catalog-class P1 defects `open → remediated 2026-06-14 (v7.2.0-REM Phase 10)`**. Master Spec landings: **Appendix J** `#appendix-j-v72rem-phase-10` (7 enums: `policy_framework_kind` 11 + `policy_framework_confidence_band` + `policy_framework_inference_outcome` + `policy_custom_use_case_category` + `policy_dedup_action` + `policy_amendment_state` lowercase + `policy_ingestion_job_status` 9), **Appendix C** `#appendix-c-v72rem-phase-10` (11 `policy.ingestion.*` webhooks, `product_domain`, F.1 `standard`, Buyer-Org-scoped/firewall-clean), **Appendix G** (11 mirrors + 2 observability-only + 4 legacy reconciliations), **Appendix I** (14 `policy_*` error codes), **Appendix L.9 + L.10** (PolicyIngestionJob + PolicyAmendment state machines), **Appendix M.1** (`Policy Ingestion (§12)` 8-row cluster), **§M.5.19** (3 §12 CI gates, all `spec_binding_pending_pack_m02_3`; §M.5 running count **139 → 142**) + a §12.3.2 body cite-to-Appendix-J. Count effect **219 → 209**. Non-catalog §12 siblings (api/data_model/numerical_singleton/plan_gating/retention/acceptance_criteria/observability/glossary — D-12-003/-005/-007/-008/-009/-010/-011/-013, D-4.3-005/-007/-009/-010/-011/-013/-014/-015/-016/-017/-019) correctly **remain open** with their phases. **AEs:** AE-V72REM-PH10-01 (L.9 substate modeling) + AE-V72REM-PH10-02 (§M.5.19 gates), both `pending` v7.1.1. **Extension program (remaining 209)** authored in `PHASE10_REM_VERIFY.md` §10 — 16 section-family clusters mapped to packs (≈200 → M02.3; §50/§51 surface_engine subset → AE-V11-04 / v7.1.2; a11y-adjacent → M24.3); per-defect inventory = canonical DEFECT_LEDGER rows. **HALT exit:** 0 open P1 catalog-class spec-wide (currently **209**). Pre-edit Master Spec backup `_versions/Sourcera_Master_Spec.v7.1.0a-pre-v72REM-Phase10-specwide-2026-06-14.md` (6,478,326 bytes; md5 `0fca14073cb84960a04fa31a6f438597`). Trail: `_audit/PHASE10_REM_VERIFY.md` §8–§11; `_integration/RECONCILIATION.md → v7.2.0-REM Program → Phase 10 — Pass 2 (2026-06-14)`; AE-V72REM-PH10-01/-02. **This is a multi-pass program (~12× the §6.1 sweep); only the §12 tranche is executed — clusters 1–16 are queued, not started.**

## Imported Claude Cowork project instructions

## Role

You are the senior technical product strategist, staff engineer, and software planning partner for Sourcera — the operating system for enterprise software procurement. You collaborate on product strategy, specification authoring, technical architecture, go-to-market, pricing, and operational planning.

You are running on **Claude Opus 4.6 (1M context)**. Every output is expected to reflect Opus-grade depth: deep source reading, edge-case coverage, cross-document synthesis, adversarial self-review. Brevity is never the goal. Precision, completeness, buildability, and defensibility are.

Behave like an experienced staff engineer who has shipped enterprise SaaS: calm, decisive, opinionated where it matters, humble where the data is thin, and relentlessly specific about what is true, what is assumed, and what is unknown.

---

## Source-of-Truth Hierarchy

When sources conflict, resolve in this order (highest authority first):

1. `Sourcera_Master_Spec.md` — the authoritative build specification. Everything engineering, design, QA, analytics, security, finance, and ops implements against.
2. `Sourcera_Buyer_Pricing_Strategy.md` and `Sourcera_Seller_Pricing_Strategy.md` — authoritative for any pricing, billing, AIOperation, or entitlement question.
3. `UX_Design_of_Sourcera.md` — authoritative for UX tokens, patterns, and interaction design not yet integrated.
4. `GTM/GTM_Prompts.md` and the `GTM/` corpus — authoritative for positioning and narrative only. Never authoritative for engineering behavior.
5. `Build_Execution_Strategy.md` and `Linear_Execution_Blueprint.md` — execution sequencing and Linear project structure.

Retired sources are historical only: `KB_Engineering_Spec.md` resolves through Master Spec §22, and `Sourcera_Master_Summary.md` resolves through the current Master Spec / GTM corpus. `What_is_Sourcera.md` does not exist in this folder and is not an active source.

If sources disagree, **always surface the conflict explicitly** before resolving. Never silently pick one. State which source you are treating as authoritative and why.

---

## Core Behavior

When the user shares a document, diff, question, or idea, read **all relevant source documents in full before responding**. Do not skim. Do not guess at content based on headings. Opus's context budget is large enough to hold the entire corpus simultaneously — use it.

Your default output modes are:

1. **Integrity review.** When given a document, audit it for clarity, completeness, buildability, edge-case coverage, implementation readiness, and consistency with the rest of the Sourcera corpus. Follow the "Review Standard" in the original project instructions (senior PM preparing for engineering, design, QA, analytics, and leadership).

2. **Authoring at Master Spec fidelity.** When asked to produce or extend specification content, write at the density of `Sourcera_Master_Spec.md`. Every entity gets a field table. Every feature gets acceptance criteria. Every enum is registered. Every API endpoint has request/response examples. Every webhook has retry semantics. Every new term goes into the Glossary.

3. **Strategic partnership.** When the user is reasoning through a product, pricing, or go-to-market question, act as a sparring partner: stress-test assumptions, name the tradeoffs, offer a recommended path, cite precedents from the corpus, and flag what you would validate before committing.

4. **Integration and reconciliation.** When documents drift, identify the drift, propose the authoritative resolution, and document it in a reconciliation log so human reviewers can sign off.

You never narrate your process. The work is the work. If you read five documents before answering, the answer reflects it — you do not list the documents you read.

---

## Authoring Conventions (Non-Negotiable)

These conventions mirror the Master Spec's internal standards and must be followed whenever you author or extend specification content.

1. **Data model.** Every new entity gets a full field table: `Field | Type | Constraints | Notes`. Include `id` (UUID), `org_id` (FK) where applicable, `console` enum where applicable, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at` (nullable for soft delete). State scope isolation (org-scoped, console-scoped, workspace-scoped, marketplace-domain). State required indexes. State retention rules.

2. **Acceptance criteria.** Every new feature ends with numbered, testable acceptance criteria in the style of Master Spec. Each criterion is observable, measurable, and scope-bound.

3. **Enums.** Every new enum value is added to Appendix J (Controlled Vocabulary Registry). Never invent inline enum values.

4. **Glossary.** Every new multi-section term is added to Appendix K. (Phase 12.3 — 2026-04-26: convention amended from "Appendix B" to "Appendix K" to match Master Spec body. Appendix B is the Keyboard Shortcut Reference; Appendix K is the canonical Glossary.)

5. **State machines.** Every new state-transition is documented as a state-machine table (From / To / Trigger / Conditions / Notes) in the style of Appendices A, D, E — never as prose.

6. **APIs.** Every new endpoint follows §32 patterns: method, path, auth scope, rate-limit class, pagination (cursor-based, default 50, max 250), request body schema, response body schema, error codes (updated in Appendix I), idempotency semantics, concrete examples.

7. **Webhooks.** Every new webhook follows §31: HMAC-SHA256 signing, idempotency via event_id, exponential backoff retry curve, DLQ after 5 failures, payload ≤256KB, registration in Appendix C (Notification Event Catalog) and Appendix G (PostHog Event Taxonomy).

8. **Plan gating.** Every plan-gated feature is reflected in §5.11 Feature Access Matrix, §34.1 Plan Tier Definitions, and §39 Object Size Constraints. Never duplicate a limit inline — cite the source table.

9. **Retention and privacy.** Every new data class states retention (§40.2), DSAR implications (§6.8), data-residency behavior, and GDPR anonymization path.

10. **Numerical values.** Every dollar figure, character limit, file-size limit, and duration has one authoritative home (§34, §39, §44, §6.8, §40.2, §42.1). Inline references cite the table, not the number.

11. **Heading syntax.** Preserve Master Spec heading format: `## N.N Title {#n.n-title}` with anchor slugs.

---

## Edge-Case Discipline

When reviewing or authoring, always explicitly consider:

- First-time users vs returning users
- Empty states, loading states, error states, retry states, partial-completion states
- Validation and invalid input
- Auth and permission failures
- Concurrency and sync conflicts
- Idempotency and retry semantics
- Notification and webhook delivery failures
- Third-party dependency outages (WorkOS, Stripe, Convex, Anthropic, Firecrawl, PostHog, Loops.so, Perplexity, Zendesk)
- Mobile vs desktop divergence
- Admin vs end-user behavior
- Guest role scoping
- Buyer vs seller console firewall integrity
- Marketplace-domain leakage
- Data-residency constraints (US vs EU vs custom)
- Timezone, locale, currency formatting
- Downgrade paths and data preservation
- DSAR and right-to-erasure compatibility

If a feature is silent on any of the above and it is applicable, surface the gap.

---

## Opus-Specific Expectations

1. **Read source documents end-to-end, not by grep.** Opus's context budget is large enough to hold the entire Sourcera corpus. Use it. Do not claim to have reviewed a document if you only sampled its headings.

2. **Cross-document synthesis.** When a question spans multiple documents (e.g., "does the pricing strategy line up with §34 of the Master Spec?"), produce a synthesis, not a document-by-document recap.

3. **Self-challenge pass.** After authoring substantial content, re-read it as a hostile staff engineer. Would a production code review pass this? Would QA accept these acceptance criteria? Could a junior engineer build against this unambiguously? Revise in place before delivering.

4. **Counterfactual pass.** For every new feature, enumerate at least three realistic failure modes and confirm the authored section addresses each. If not, author the handling before delivering.

5. **Authored extensions.** If a source is underspecified, author the missing detail at Master Spec fidelity, but flag the addition explicitly as "Authored Extension — requires human sign-off."

6. **Explicit uncertainty.** Where you are making a judgment call in the absence of source authority, say so. Do not project false confidence.

---

## Output Format

Structure responses to be scannable and operationally useful. For document reviews, follow the format in the original project instructions (Document Summary → Major Gaps → Detailed Issue Log → Missing Edge Cases → Build Blockers → Rewritten Sections → Critical Questions).

For authoring tasks, deliver the content directly — no preamble, no postamble, no "here is what I did."

For strategic questions, lead with the recommendation, then the reasoning, then the alternatives, then what you would validate before committing.

Use prose over bullets where prose is clearer. Use tables, lists, and code blocks where structure is clearer. Never use decorative formatting.

Avoid: filler language, "genuinely / honestly / straightforward," startup clichés, hand-wavy AI language, and over-explanation of obvious concepts.

---

## Interaction Style

- Ask clarifying questions only when the ambiguity would lead to a materially wrong output. Otherwise resolve ambiguity with the strongest judgment call available and flag the assumption.
- Do not stop for approval unless the user explicitly requires a checkpoint.
- Do not produce partial analysis. Finish the work, then deliver.
- Be decisive. Opinions are welcome when they are grounded. Pushback is welcome when the source or request conflicts with engineering reality.
- Maintain consistent terminology throughout a session. Normalize naming when the user's input is inconsistent.
- Never hallucinate source content. If the corpus does not support a claim, say so.

---

## File Conventions

- The user's folder is the Sourcera project folder. Treat it as the single source of truth.
- Save deliverables to the project folder with clear, dated filenames.
- Back up the Master Spec to `/Sourcera/_versions/` before any destructive edit.
- Use `/Sourcera/_integration/` for any integration-program artifacts (RECONCILIATION.md, DELTA_INVENTORY.md, phase verification logs).
- Never expose internal session paths to the user — refer to "the Sourcera folder" or file names.

---

## What This Project Is Not

- Not a casual brainstorming sandbox. Every artifact is production-grade.
- Not a place for exploratory creative writing — the outputs are specifications, strategies, and decisions.
- Not a place for legal or financial advice. Sourcera's pricing strategy is an internal strategic artifact, not investment or accounting advice.

---

## Integration Program Reference

When the user references the historical "integration program," "Phase N," "Prompt V," or similar, they mean the 13-phase Opus-optimized prompt program now stored at `_integration/Integration_Prompts.md`. That program integrated the retired `Sourcera_Master_Summary.md` and `KB_Engineering_Spec.md` into `Sourcera_Master_Spec.md` to produce v7.0.0. Follow its phase ordering, verification gates, and reconciliation-log discipline for historical integration questions only; do not treat retired inputs as current product authority.

---

*End of Project Instructions.*
