# Phase 4 — Prompt 4.11 — §20 Inbox & Pulse Findings (Scratch Log)

**Audit prompt.** `Audit_Prompts.md → Phase 4 → Prompt 4.11`. Walk §20. Confirm: (a) inbox aggregation; (b) Pulse health score math; (c) Pulse digest email cites §41; (d) Solo-mode suppression cites §44.6 and Appendix M.1; (e) mobile parity in §38. Output: defect ledger entries.

**Scope.** §20 (Master Spec v7.1.0, lines 15099–15428) end-to-end. Cross-document reads of §1.3 console firewall, §2.6 Stakeholder Cohorts, §2.8 / §2.8.4 Single-Operator Mode (engine-on / surface-off contract), §4.3.10 Evaluation Pulse Event, §4.3.15 Unread Marker, §4.3.22 Inbox Item Group, §4.8.1 AIOperation, §5.9 Executive Sponsor persona, §5.11 Feature Access Matrix, §8.4 SLA Timers, §20.7 Acceptance Criteria, §21.3 Agent Guardrails, §21.4.1 row #19 `pulse_digest_weekly`, §22.20 Seller Maya Surface Abstraction, §24.3 / §24.4 Seller Inbox / Seller Pulse, §29.1 Notification Event Catalog, §29.2 Delivery Channels, §29.3 User Preferences (quiet hours / DND), §29.4 Slack Integration, §31 Webhook Catalog, §32.5 API Endpoints, §34.1.1 / §34.1.2 Plan Tier Definitions, §34.10 AI Wallet, §34.11 Outcome Resolver, §38.4 Mobile Parity prose summary (lines 30563–30589), §38.8.2 Mobile Feature Parity Matrix Inbox & Pulse rows (lines 30896–30901, 30921–30922), §39 Object Size Constraints, §40.2 Data Retention, §40.4 Data Residency, §41 Email Deliverability & Compliance (§41.1 Loops.so authority; §41.2 `weekly_digest.hbs` row line 31409; §41.3 compliance; §41.4 opt-out classification; §41.5 acceptance criteria), §44.1 latency budgets, §44.6 Solo-Tier Surface Treatment (engine-absorbed envelope, surface hide list, single-card billing), §49 Third-Party Outage Catalog, §51.3 / §51.4 Org-Level / Per-User Usage Dashboards (the disambiguation §51 lines 40638 / 40808 makes against §20), Appendix C Notification Event Catalog, Appendix G PostHog Event Taxonomy, Appendix I Error Codes, Appendix J Controlled Vocabulary, Appendix K Glossary, Appendix L State Machines, Appendix M.1 Surface/Engine Mapping (Pulse — Workspace Health row group, lines 47855–47861).

---

## 1. Prompt-Mandated Confirmation Tasks

The audit prompt explicitly requires five confirmations. Verdict on each:

| Confirmation task | Verdict | Evidence | Defect |
|---|---|---|---|
| Inbox aggregation is authored to convention | ❌ FAIL | §20.2 describes a flat unified feed with a §20.2.2 "Notification Item Schema" expressed as a JSON example, not as a §4 entity field table. The canonical aggregation entities — `Inbox Item Group` (§4.3.22) and `Unread Marker` (§4.3.15) — are not cited from §20 anywhere. Appendix M.1 line 47856 binds §20.2 to §4.3.22 explicitly ("Pulse Inbox + Inbox Item Group | §20.2, §4.3.22, §2.8.4") but §20 does not reciprocate. The §20.2.2 surface-level "Notification Item" schema is irreconcilable with §4.3.22's `group_type` / `anchor_entity_type` / `item_count` / `unread_count` engine model. | D-4.11-001, D-4.11-002, D-4.11-007 |
| Pulse Health Score math is correct and authored to convention | ❌ FAIL | §20.3.1 formula uses `Phase_velocity_ratio = (actual_days_in_current_phase / sourcera_method_recommended_days) × 100%`. Adding `0.2 × velocity_ratio` directly to the score INVERTS the intended direction: a workspace running 50% (faster than recommended) contributes only 10 to the score (worse), and a workspace running 200% (twice as slow) contributes 40 (better). §20.4.2 even narrates "Phase Velocity: 110% (trending 1 day late)" then claims healthy — but 110% velocity in the §20.3.1 formula adds 22 to the score, vs. the on-time case (100% → 20). No clamp on velocity > 100% blows the 0–100 score range. No div-by-zero handling for `Response_rate_pct` before any responses arrive. SLA aggregation across §8.4 per-team-per-role timers is unspecified. | D-4.11-003, D-4.11-004, D-4.11-005, D-4.11-026 |
| §20.4 Pulse Digest Email cites §41 | ❌ FAIL | §20.4.1 says "Delivery: Via Loops.so email service" — and stops there. §20.4 does not cite §41.1 (Loops.so authority), §41.2 row `weekly_digest.hbs` (line 31409 — the canonical template registration with subject "Your Sourcera Pulse digest", category Lifecycle), §41.3 (CAN-SPAM / GDPR / CASL compliance, bounce rate target), §41.4 (opt-out classification: Marketing/Lifecycle, opt-in required, unsubscribe in footer), or §41.5 acceptance criteria (preview URL, 60-second delivery, opt-out preference). §20.4.2's templated subject "[Workspace Name] Weekly Pulse — Health Score: 78% (Yellow)" disagrees with the §41.2 canonical subject "Your Sourcera Pulse digest" — two authoritative sources, neither citing the other. | D-4.11-008, D-4.11-016 |
| Solo-mode suppression cites §44.6 and Appendix M.1 | ❌ FAIL | §20 makes ZERO references to (a) `Workspace.evaluation_owner_mode` (the field that drives suppression per §2.8); (b) §2.8.4 (the Single-Operator Mode contract whose AC #6 explicitly says "Pulse Digest Email (§20.4) MUST default to suppressed in Solo Mode and MUST be opt-in via Notification Preferences (§20.6)"); (c) §44.6 Solo-Tier Surface Treatment (Solo plan-tier engine-on / surface-off contract); (d) Appendix M.1 lines 47856–47861 which carry the per-row Solo-Mode and Solo-Tier surface-suppression annotations for Pulse Inbox / Pulse Health Score / Pulse Digest Email / SLA Timers; (e) §22.20 Seller Maya Surface Abstraction (the seller-side mirror of the same surface-off contract). The §20.6 Notification Preferences UI does not declare the Solo opt-in surfaces required by §2.8.4 AC #6. The two distinct "Solo" concepts (Solo plan tier per §34.1.1 / §34.1.2 / §44.6 and `evaluation_owner_mode = solo` per §2.8) are both authoritative for §20 and both unsurfaced. | D-4.11-009 |
| Mobile parity is cited in §38 | ❌ FAIL | §20 contains zero references to §38, §38.4, or §38.8.2. §38.4 prose lists "View Pulse health metrics" as mobile-supported and §38.8.2 (lines 30896–30901, 30921–30922) carries the structured Inbox & Pulse parity matrix (`parity` / `parity` / `parity` / `simplified` for buyer-side; `parity` / `parity` for seller-side). §20.5.3 CSV export ("Export past 12 weeks as CSV") is not mobile-flagged anywhere — §38.8.2 doesn't carry an export row, and §38.4 lists "Workspace Analytics — Export" as desktop-only by analogy. §20.6 Quiet hours, DND, and per-event toggles are silent on §38.6.2 mobile constraints (e.g., the bottom-sheet versus full-modal divergence). | D-4.11-010 |

All five confirmation tasks FAIL.

---

## 2. Convention-by-Convention Score (§20)

| Convention | Verdict | Notes / Defect |
|---|---|---|
| 1. Entity definition (§4 conventions) | ❌ missing | §20.2.2 NotificationItem schema is JSON, not §4 field-table; no `org_id`, no `console`, no scope, no indexes, no retention, no soft delete. `WorkspacePulseHealth` referenced in §2.8.4 / Appendix M.1 has no §4 entity. → D-4.11-001, D-4.11-007 |
| 2. Acceptance criteria (numbered, observable, measurable) | ❌ missing | §20.7.1–§20.7.5 use checkbox-prose `- [ ]` with no observable inputs, observable outputs, or measurable thresholds. → D-4.11-017 |
| 3. Enum registration (Appendix J) | ❌ missing | `notification_item_type` (PHASE_TRANSITION / SLA_ALERT / QA_MENTION / ...), `notification_priority` (1–3), `pulse_digest_day` (Mon/Wed/Fri), `notification_expiry_class`, `pulse_health_color_band` not registered. → D-4.11-012, D-4.11-018 |
| 4. Glossary (Appendix K) | ❌ missing | "Pulse", "Pulse Health Score", "Pulse Digest", "Pulse Widget", "Inbox Item", "Quiet Hours", "Do Not Disturb" used across §20 / §24 / §29 — no Appendix K entries reciprocated from §20. → D-4.11-012 (consolidated) |
| 5. State machines (From / To / Trigger / Conditions / Notes) | ❌ missing | NotificationItem has implicit states (`unread → read → dismissed → expired`) and §20.3.2 has Phase-band gating (Before 6 / 6–9 / 10–11 / 12 locked) — neither expressed as a state-machine table. → D-4.11-001 (consolidated) |
| 6. APIs (§32 conventions) | ❌ missing | §32.5 has no `/v1/inbox`, `/v1/pulse`, `/v1/digests` endpoints. §20 describes a CRUD surface (mark-read, dismiss, mark-all-read, filter, paginate, export digests CSV) without any §32 contract. → D-4.11-011 |
| 7. Webhooks (§31 conventions) | ❌ missing | §2.8.4 / Appendix M.1 reference `pulse.health_score_threshold_breached` as authoritative — not registered in §29.1, §31.1, §31.8, Appendix C, or Appendix G. → D-4.11-006 |
| 8. Plan gating (§5.11 / §34.1 / §39) | ⚠ partial | Appendix M.1 line 47857 says Pulse Health Score is "All paid in Team Mode (Free has no Pulse)"; §28972 `pulse_digest_weekly` row gates at Starter+ (Free read-only). §20 itself enumerates no gating rows; §5.11 Feature Access Matrix has no §20 row group. → D-4.11-013 |
| 9. Retention & privacy | ❌ missing | §20.5.3 "past 12 weeks" archive cited; §40.2 has no `WorkspacePulseHealth` / `InboxItem` retention row; §6.8 DSAR cascade for Pulse history silent; §40.4 residency for daily 9am UTC computation silent. → D-4.11-021, D-4.11-023 |
| 10. Numerical singletons | ❌ missing | Inline literals: 100/200 char title/description, 20/load pagination, 30-day archived-notification window, 12-week digest archive, 9am UTC daily recording, ~300 token AI summary, 80–100 / 50–79 / 0–49 color bands, 0.3 / 0.3 / 0.2 / 0.2 weights, 5-second toast, 5pm–9am quiet hours default. None cited from §39 / §44 / §6.8.1 / §40.2. → D-4.11-018 |
| 11. Heading syntax | ✅ | §20.1–§20.7 conform to `## N.N Title {#n.n-title}`. |
| 12. Surface/engine mapping (Appendix M.1) | ⚠ partial | Appendix M.1 has rows for Pulse Inbox, Pulse Health Score, Pulse Digest Email, In-App Pulse Widget, Notification Preferences, SLA Timers (engine-vs-surface annotated); §20 does not reciprocate. The "What to do this week" three-item Solo panel cited by Appendix M.1 (lines 47856) is not authored in §20. → D-4.11-028 |
| 13. Console firewall (§1.3) | ❌ missing | §20 nowhere declares buyer-console scope. §24.3 / §24.4 mirror is uncited from §20. §20.4.3 AI summary "mentions vendors/use cases by name" risks marketplace-domain leakage when the seller-mirror generates text on the seller console — no firewall guidance. → D-4.11-014, D-4.11-025 |
| 14. Edge cases (concurrency, retry, idempotency, third-party outage, mobile, downgrade, residency, TZ, DSAR) | ❌ missing | Mark-as-read / dismiss / mark-all-read concurrency unspecified; Loops.so outage handling absent; mobile parity uncited; downgrade behavior on Pulse history silent; 9am UTC TZ vs §40.4 residency silent; DSAR for Pulse audit retention silent. → D-4.11-019, D-4.11-020, D-4.11-021, D-4.11-022, D-4.11-023, D-4.11-024, D-4.11-029, D-4.11-030 |

---

## 3. Counterfactual Pass — Failure-Mode Coverage

For every §20 capability, three realistic failure modes were enumerated; verdict on whether §20 addresses each:

| Capability | Failure mode | §20 addresses? | Defect |
|---|---|---|---|
| Pulse Health Score daily compute | Workspace has zero responses (Phase < 6) → response_rate denominator = 0 | ❌ no — §20.3.2 says "Phase 6+ only" but the formula at §20.3.1 always lists the `Response_rate_pct` term | D-4.11-005 |
| Pulse Health Score | Phase_velocity_ratio = ∞ (workspace abandoned past recommended days × 10) | ❌ no — no clamp; score blows 0–100 range | D-4.11-004 |
| Pulse Digest Email Sonnet generation | Anthropic outage during weekly batch dispatch | ❌ no — §49 outage runbook silent on §20.4; no fallback (skip / queue / send-without-summary) authored | D-4.11-030 |
| Pulse Digest Email Loops.so dispatch | Loops.so 5xx burst across digest send window | ❌ no — §41.2 `weekly_digest.hbs` row not cited from §20.4 so retry/DLQ semantics inherit silently | D-4.11-008, D-4.11-030 |
| Inbox mark-as-read | Two clients mark same item read concurrently | ❌ no — idempotency / last-writer-wins unspecified | D-4.11-029 |
| Inbox dismiss / mark-all-read | User dismisses an item that was just expired by the auto-expiry job | ❌ no — race condition unspecified | D-4.11-019, D-4.11-029 |
| Pulse archive CSV export | DSAR right-to-erasure on a User whose actions are in the 12-week archive | ❌ no — §6.8 DSAR cascade for Pulse archive silent | D-4.11-023 |
| Pulse computation 9am UTC | EU customer with `data_residency_region = eu` and §40.4 residency lock | ❌ no — TZ vs residency silent | D-4.11-021 |
| In-app Pulse widget | Widget loads while Pulse compute job hasn't run yet (cold-start) | ❌ no — empty/loading state for Pulse widget unspecified | D-4.11-019 (consolidated) |
| Notification Preferences | User on Buyer Solo upgrades to Starter mid-cycle | ❌ no — Solo opt-in default → Starter active default transition unspecified | D-4.11-009 |

---

## 4. Self-Challenge Pass — Hostile-Reviewer Notes

After drafting D-4.11-001 through D-4.11-032, re-read each row as a hostile staff engineer:

- **D-4.11-003 (Pulse velocity inversion)**: confirmed reproducible. The §20.3.1 formula, taken literally, produces `health_contribution = 0.2 × 200 = 40` for a workspace running 200% of recommended days, and `health_contribution = 0.2 × 50 = 10` for a workspace running 50% of recommended days. Faster = lower score. This is not a documentation gap — it is a math defect. P1 confirmed.
- **D-4.11-008 (no §41 cite)**: confirmed. The audit prompt explicitly required "Pulse digest email cites §41". §20.4 cites Loops.so by name but does not anchor to §41 in any sub-section. The §41.2 row exists; the §20.4 → §41 reciprocation is the missing link. P1 confirmed.
- **D-4.11-009 (no §44.6 / Appendix M.1 cite)**: confirmed. Re-read §20 end-to-end checking for any token resembling `evaluation_owner_mode`, `solo`, `Solo`, `§2.8`, `§44.6`, `§22.20`, or `Appendix M`. Zero hits. The §20.4 / §20.6 surfaces are silently violating the §2.8.4 AC #6 contract and the §44.6.1 surface hide list. P1 confirmed.
- **D-4.11-010 (no §38 cite)**: confirmed. Zero §38 / §38.4 / §38.6 / §38.8 hits in §20. P1 confirmed.
- **D-4.11-015 (phantom SMS)**: re-checked §29.2 (no SMS row), §41 (no SMS template), §32 (no SMS endpoint), §34.1.1 Enterprise cell (no SMS feature). The §20.6.2 "SMS (Enterprise only)" claim has no backing anywhere in the corpus. P1 (unbuildable as written) confirmed.
- **D-4.11-016 (subject conflict)**: re-checked §41.2 line 31409 — `weekly_digest.hbs` subject "Your Sourcera Pulse digest". §20.4.2 templated subject "[Workspace Name] Weekly Pulse — Health Score: 78% (Yellow)". These are two distinct subject lines for the same email. P1 confirmed (numerical-singleton class extended to subject-string singleton).
- **D-4.11-031 ("Slack v7.0" stale)**: re-checked §29.4 (Slack Integration is shipped). §20.6.2 says "Slack (future): Integration planned for v7.0" — v7.0 closed; v7.1.0 stamped. P3 (cosmetic / consistency drift) confirmed.

**Withdrawn on hostile-reviewer pass.** None.

**Adjusted on hostile-reviewer pass.** D-4.11-011 (no §32 APIs) was initially scoped to enumerate every endpoint individually (8+ rows). Consolidated into one defect with the endpoint list inside the recommendation, mirroring D-4.10-006's pattern.

---

## 5. Defect Promotion

32 defects identified; 32 promoted to ledger (no withdrawals). Severity breakdown: 0 P0 / 16 P1 / 14 P2 / 2 P3.

No P0: §20 does not break the buyer/seller console firewall (Appendix M.1 binds it to buyer-only; the firewall integrity is asserted at §24 mirror), does not expose PII (digest content is rendered server-side from §20-internal data), and does not introduce billing-revenue ambiguity (the §21.4.1 row #19 `pulse_digest_weekly` AIOperation gating is the §34 surface, not §20). The defect mass concentrates at P1 (math inversion, missing entity, missing webhook, missing §41 cite, missing §44.6 cite, missing §38 cite, phantom SMS feature, missing API set) and P2 (edge cases, retention, DSAR, residency, TZ, perf budgets, idempotency, AI-summary firewall risk).

---

## 6. Cross-References

- Defect ledger: appended to `_audit/DEFECT_LEDGER.md` under the `Phase 4 — Prompt 4.11` block.
- Coverage matrix tightening: F-308 (Inbox & Pulse), F-309 (Inbox Structure), F-310 (Pulse Health Score), F-311 (Pulse Digest Email), F-312 (In-App Pulse Widget), F-313 (Notification Preferences) — cells updated in `_audit/COVERAGE_MATRIX.md`.
- Forward references: Phase 1 (§4) inherits D-4.11-001 / D-4.11-007 (NotificationItem entity; WorkspacePulseHealth entity); Phase 3 (§5) inherits D-4.11-013 (no §5.11 row group for §20); Phase 7 (§34) inherits D-4.11-013 / D-4.11-015 (gating; phantom SMS); Phase 8 (§29 / §31 / §32) inherits D-4.11-006 / D-4.11-008 / D-4.11-011 / D-4.11-015 / D-4.11-016; Phase 9 (privacy / retention / residency) inherits D-4.11-021 / D-4.11-023; Phase 10 (UX / mobile / a11y / perf) inherits D-4.11-010 / D-4.11-018 / D-4.11-022 / D-4.11-024 / D-4.11-029; Phase 11 (Appendix M / surface-engine) inherits D-4.11-028; Phase 12 (Operations / outage runbooks) inherits D-4.11-030; Phase 14.10 (Solo-Tier Surface Treatment) inherits D-4.11-009.

**Master Spec unchanged** — audit non-destructive per Audit_Prompts.md default.
