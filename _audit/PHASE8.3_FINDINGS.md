# Phase 8 — Prompt 8.3 — Appendix C Notification Event Catalog (Scratch Log)

**Audit baseline.** Master Spec v7.1.0 (2026-04-28). Walk performed 2026-05-08.
**Prompt source.** `Audit_Prompts.md` lines 1980+ (Prompt 8.3).
**Mnemonic.** `D-V8.3-NNN`.
**Halt rule.** Zero unresolved P0; every P1 carries owner + recommendation.
**Authoring posture.** Non-destructive. No edits to `Sourcera_Master_Spec.md`.

This file is the per-prompt scratch log; confirmed findings promote into `DEFECT_LEDGER.md` at end of prompt.

---

## 1. Walk Inventory — Appendix C Subsections

Appendix C (lines 41835–42204) is structured as one H2 umbrella + 16 H3 event-class subsections.

| # | H3 Subsection | Lines | Event Count | Channels Covered |
|---|---|---|---|---|
| 1 | Transactional Events (No Opt-Out) | 41845–41875 | 27 | In-App + Email |
| 2 | Lifecycle Events (Opt-In) | 41876–41884 | 4 | In-App + Email |
| 3 | Marketing Events (Opt-In) | 41885–41892 | 3 | In-App + Email |
| 4 | Billing-Domain Events | 41893–41914 | 13 | Webhook + Selective User |
| 5 | KB-Domain Events | 41915–41934 | 11 | Webhook + Selective User |
| 6 | Disqualification-Domain Events | 41935–41946 | 4 | Webhook (parallel Loops.so) |
| 7 | Growth-Domain Events | 41948–41960 | 4 | Selective User |
| 8 | M1–M8 Growth-Mechanics Events | 41961–42003 | 35 | In-App + Email |
| 9 | Taxonomy-Domain Events | 42005–42026 | 14 | Webhook + Ops Alerts |
| 10 | Marketplace-Abuse-Domain Events | 42028–42049 | 12 | Webhook + Selective User |
| 11 | Marketplace-Signals-Domain Events | 42051–42072 | 11 | Webhook + Seller User |
| 12 | CRM-Sync-Domain Events | 42073–42095 | 13 | Webhook + Seller User |
| 13 | Ops-Console-Domain Events | 42097–42117 | 7 | Customer Notification |
| 14 | Internal-Comment-Domain Events | 42119–42138 | 8 | Webhook + Buyer User |
| 15 | Defense-View-Domain Events | 42140–42153 | 2 | Webhook Only |
| 16 | Phase 3V Audit-Remediation Events (Security / Console-Bridge-Anomaly / DSAR-Lifecycle / Phase 3V+ WorkOS Group Lifecycle) | 42155–42204 | 19 | Mixed |

**Total enumerated events.** ~187. Volume budget per individual subsection footnotes is internally consistent for the events present.

---

## 2. Per-Notification Audit Walk (Checks 1–6)

The audit prompt enumerates six checks per notification:

1. Trigger condition / recipient resolution / channels (in-app, email, push, webhook)
2. Plan-tier eligibility
3. Localization (i18n hook) referenced
4. Email deliverability (§41) compliance — SPF/DKIM/DMARC, unsubscribe link
5. Idempotency / dedup window
6. Retention of notification records

The walk below maps each subsection to a check matrix.

| Subsection | C1 trigger/recipient/channel | C2 plan-tier | C3 i18n hook | C4 §41 deliverability | C5 idempotency | C6 retention |
|---|---|---|---|---|---|---|
| Transactional | ✅ trigger; ⚠ recipient (role-snapshot rules implicit, e.g., `Workspace Owner` not bound to a §5.2 role slug); ⚠ channel (no `push` column despite mobile parity per §38) | ❌ no per-event plan-tier eligibility column | ❌ silent | ⚠ §41 cross-cited but no per-event template-id binding (e.g., `nda_request` row → which `*.hbs` template?) | ❌ no dedup window stated | ❌ no retention rule for in-app notification rows |
| Lifecycle | ✅ trigger; ✅ recipient (Org Owner / Workspace Owner) | ❌ silent | ❌ silent | ⚠ same as Transactional | ❌ silent | ❌ silent |
| Marketing | ✅; ✅ | ❌ silent | ❌ silent | ⚠ §41.4 routes to Marketing/Lifecycle opt-in but no SPF/DKIM/DMARC per-event check | ❌ silent | ❌ silent |
| Billing-Domain | ✅ rich trigger detail (§31.8 cross-ref); ✅ Billing Admin / Org Owner | ⚠ implicit (every billing event "deliverable across full §34.1 plan-tier set" per §31.8.9 #17, but Solo-suppression rule at §44.6.5 contradicts for `solo.*` events) | ❌ silent | ⚠ §31.8.10 cross-cites §41 but no template-id mapping; "Loops.so" cited inline | ✅ §31.8.8 explicitly states `event_id` dedup | ❌ Appendix C row lacks retention; webhook DLQ retention 30d at §31.6 only |
| KB-Domain | ✅ rich; ✅ Seller Team Lead / Integrations Admin | ⚠ no per-event plan-tier column (KB events apply across Free → Enterprise, but §22 P1 "No-Paywall Export" invariant is NOT cross-referenced here — `kb.export.ready` row carries the invariant in Notes only) | ❌ silent | ⚠ Loops.so cross-cited; no template-id binding | ⚠ "Dedup on `event_id`" stated for `kb.export.ready` only; other rows silent | ❌ silent |
| Disqualification | ✅; ⚠ recipient bridge-redacted projection cited but redaction-set table lives in §25.3.10 only | ⚠ no plan-tier eligibility | ❌ silent | ⚠ Loops.so cited for paired user notifications; no template-id binding | ⚠ "Dedup on `event_id` per §31.1" stated for `vendor.disqualified` only | ❌ silent |
| Growth-Domain | ✅; ✅ | ❌ silent | ❌ silent | ⚠ Email opt-in cited per row but no §41 DMARC binding | ❌ silent | ❌ silent |
| M1–M8 | ✅ rich; ✅ | ⚠ "Notification-to-webhook mapping" footnote cites §31.8.1 prefix convention; no per-event plan-tier | ❌ silent | ⚠ §41 cited only via `noreply-m5@sourcera.io` example; no template-id binding | ❌ silent on dedup window | ❌ silent |
| Taxonomy-Domain | ✅; ✅ Ops + (vocab_tag.*) seller user | ⚠ "no per-plan gate on taxonomy webhook subscription" stated; ✅ | ❌ silent | n/a (Ops + vocab_tag user notifications cited but no §41 binding) | ⚠ stated for `vocab_tag.approved` Notes only | ❌ silent |
| Marketplace-Abuse | ✅ rich; ✅ subject / reporter / Ops audience-scope rule | ❌ silent | ❌ silent | ⚠ §41 cross-cited via Loops.so footnote; no template-id binding | ⚠ Audience-scope dedup implied; no `event_id` rule per row | ❌ silent |
| Marketplace-Signals | ✅; ✅ | ✅ Plan-tier gate explicit (Growth+ digest, Scale+ real-time) | ❌ silent | ⚠ §41 cited via Loops.so | ⚠ stated only for cohort_published Notes | ❌ silent |
| CRM-Sync | ⚠ event names DRIFT from §31.9.10 Webhook Catalog (see D-V8.3-001 below); ✅ recipient set | ✅ Plan-tier gate explicit (Growth+ for CRM Sync; Scale+ for Ops alerts) | ❌ silent | ⚠ §41 cited; no template-id binding | ❌ silent | ❌ silent |
| Ops-Console-Domain | ✅ rich (most rigorous in the catalog); ✅ Customer Org Owner + Billing Admin | ⚠ "transactional; never opt-out-able" stated; no plan-tier column | ❌ silent | ⚠ §50.4.5 strict-mode delivery guarantee MUCH STRONGER than §41 standard transactional; no Loops.so template-id binding | ✅ stated implicitly via "fires even when actions_taken_count=0" but no `event_id` dedup window | ⚠ AuditEvent forwarding cited (§50.5.1) but in-app notification row retention silent |
| Internal-Comment-Domain | ✅ rich; ✅ Buyer-Console-only firewall enforced (CI gate cited) | ⚠ no per-event plan-tier (Internal Comments are §34 Business Starter+; not noted here) | ❌ silent | ⚠ §41 cited via Loops.so | ⚠ stated only for `mention_sent` rate-cap; no `event_id` dedup window | ❌ silent |
| Defense-View | ✅ rich; ✅ Buyer-only | ❌ silent (Defense View is §34 Business Scale+ per §13.11; not stated here) | n/a (no in-app/email per row) | n/a (webhook-only) | ✅ "Dedup on `event_id` per §31.1" stated | ⚠ webhook-only; in-app retention n/a |
| Phase 3V (Security/Bridge/DSAR/Group) | ✅ rich; ✅ | ⚠ no plan-tier column; some events (Group lifecycle) imply WorkOS Groups API → Enterprise per §4.2.5 not cross-cited | ❌ silent | ⚠ §41 cited via Loops.so for transactional; DSAR `email_template_id` not specified | ⚠ several rows state idempotent (e.g., `account_locked` on `(user_id, lockout_started_at)`) but inconsistent across rows | ❌ silent (DSAR notification retention not stated; subject's right to confirm receipt under GDPR Art. 12) |

**Roll-up.** No subsection passes Check 6 (retention of notification records). Only one (Defense-View) passes Check 5 (idempotency) consistently. C2 (plan-tier eligibility) is satisfied only by Marketplace-Signals and CRM-Sync. C3 (i18n) is satisfied by zero subsections. C4 (§41 deliverability) is uniformly partial — §41 is cross-cited but no per-event template-id binding.

---

## 3. Reverse Pass — §31 Webhooks → Appendix C

For every authored webhook event in §31 / §31.8 / §31.9 / §22 / §25 / §27 / §50 / §48 / §51 / §13.11, confirm Appendix C registration or explicit non-emission.

| Source § | Webhook event_type | Appendix C row? | Notes |
|---|---|---|---|
| §31.8.3 | `billing.ai_operation.settled` | ✅ | Webhook-only |
| §31.8.3 | `billing.ai_operation.contested` | ✅ | |
| §31.8.3 | `billing.ai_operation.reversed` | ✅ | |
| §31.8.4 | `billing.wallet.cap_warning_80` | ✅ | |
| §31.8.4 | `billing.wallet.cap_warning_100` | ✅ | |
| §31.8.4 | `billing.wallet.auto_topup_executed` | ✅ | |
| §31.8.4 | `billing.wallet.auto_topup_failed` | ✅ | |
| §31.8.5 | `billing.plan.upgraded` | ✅ | |
| §31.8.5 | `billing.plan.downgraded` | ✅ | |
| §31.8.5 | `billing.plan.downgrade_scheduled` | ✅ | |
| §31.8.6 | `billing.committed_spend.contract_activated` | ✅ | |
| §31.8.6 | `billing.committed_spend.renewal_due_60` | ✅ | |
| §31.8.7 | `billing.free_allowance.exhausted` | ✅ | |
| §31.8 (interim per §32.8 AC #21) | `billing.wallet.overage_cap_changed` | ❌ | §26833 cites the event as authored; not in Appendix C |
| §31.8 (interim per §32.8 AC #21) | `billing.wallet.auto_topup_config_changed` | ❌ | Same |
| §31.8 (interim per §32.8 AC #21) | `billing.contest.filed` | ❌ | Same |
| §31.8 (interim per §32.8 AC #21) | `billing.contest.decision_received` | ❌ | Same |
| §30261 (Solo) | `wallet.threshold_crossed` (50/80/100%) | ❌ | F-538 names `(50/80/100%)`; only 80/100 covered; no `cap_warning_50` row |
| §44.6.5 | `solo.envelope.throttling_engaged` | ❌ | §32395 says "registered in Appendix C → Billing-Domain Events under 'Solo-Tier Surface Treatment (§44.6)'" — no such block exists |
| §44.6.5 | `solo.envelope.throttling_cleared` | ❌ | Same |
| §44.6.5 | `solo.envelope.exhausted` | ❌ | Same |
| §44.6.5 | `solo.capability.envelope_no_block_invoked` | ❌ | Same; F-622 ("Solo Engine Telemetry & Webhook Catalog") confirms scope |
| §31.9.10 | `crm_sync.connection_created` | ❌ | Appendix C uses `seller.crm_sync.connection_activated` — different event name |
| §31.9.10 | `crm_sync.connection_paused` | ⚠ | Appendix C uses `seller.crm_sync.connection_paused` — prefix drift |
| §31.9.10 | `crm_sync.connection_resumed` | ❌ | Appendix C has `seller.crm_sync.connection_auto_resumed` (different semantics — `_auto_` qualifier) |
| §31.9.10 | `crm_sync.connection_revoked` | ⚠ | Prefix drift |
| §31.9.10 | `crm_sync.oauth_token_refresh_failed` | ❌ | No Appendix C row |
| §31.9.10 | `crm_sync.activity_accepted` | ❌ | Appendix C has `seller.crm_sync.activity_written` (different semantics — `written` describes the digest, not the per-event accept) |
| §31.9.10 | `crm_sync.activity_failed` | ⚠ | Appendix C uses `seller.crm_sync.activity_failed` — prefix drift |
| §31.9.10 | `crm_sync.activity_dlq_entered` | ⚠ | Prefix drift |
| §31.9.10 | `crm_sync.account_created` | ❌ | No Appendix C row |
| §31.9.10 | `crm_sync.account_match_needs_review` | ❌ | No Appendix C row |
| §31.9.10 | `crm_sync.field_mapping_updated` | ❌ | No Appendix C row |
| §31.9.10 | `crm_sync.field_mapping_reverted_on_downgrade` | ❌ | No Appendix C row |
| §31.9.10 | `crm_sync.routing_rule_updated` | ❌ | No Appendix C row |
| §31.9.10 | `crm_sync.review_queue_saturation` | ⚠ | Prefix drift (Appendix C uses `seller.`) |
| §31.9.10 | `crm_sync.connection_health_critical` | ⚠ | Prefix drift |
| §31.9.10 | `crm_sync.dsar_cascade_notification` | ❌ | No Appendix C row |
| §22.4–§22.16 | `kb.entry.published` | ✅ | |
| §22.4 | `kb.entry.archived` | ✅ | |
| §22.4 | `kb.entry.flagged_stale` | ✅ | |
| §22.4 | `kb.namespace.migrated` | ✅ | |
| §22.8.4.4 | `kb.document.attached` | ✅ | |
| §22.11.2 | `kb.draft.needs_clarification` | ✅ | |
| §22.15.1 | `kb.session.terminated` | ✅ | |
| §22.15.1 | `kb.session.mcp_auth_failed` | ✅ | |
| §22.10.3 / §22.10.6 | `kb_entry_pending_review` | ✅ | Naming inconsistency: this row breaks the `kb.entry.*` dotted convention used by all other KB events |
| §22.18.2 / §32.9.1 | `kb.export.ready` | ✅ | |
| §22.18.2.5 | `kb.export.failed` | ✅ | |
| §25.3.15 | `vendor.disqualified` | ✅ | |
| §25.3.15 | `vendor.disqualification.reversed` | ✅ | |
| §25.3.15 | `disqualification.cascade_partial_failure` | ✅ | |
| §25.3.15 | `disqualification.notification_failed` | ✅ | |
| §10.7 / §25.3 / line 19085 | `bid.disqualified` | ❌ | V5 D-5V-005 remediation explicitly required Appendix C registration; not present |
| §6.149 | `verification.tier_downgraded` | ❌ | Authored Extension flagged "to be registered in Appendix C"; not landed |
| §27.4.9 | (existing transactional `marketplace_listing_*`) | ⚠ | §27.4.9 references Appendix C but no §27.4.9-domain subsection in Appendix C — events fold into Transactional list ad-hoc |
| §27.6.7 | `taxonomy.category_added` | ✅ | |
| §27.6.7 | `taxonomy.category_deprecated` | ✅ | |
| §27.6.7 | `taxonomy.category_retired` | ✅ | |
| §27.6.7 | `taxonomy.node.updated` | ✅ | |
| §27.6.7 | `taxonomy.migration.completed` | ✅ | |
| §27.6.7 | `taxonomy.migration.rolled_back` | ✅ | |
| §27.6.7 | `taxonomy.migration.slo_breach` | ✅ | Ops-only |
| §27.6.7 | `taxonomy.orphan_reference_detected` | ✅ | Ops-only |
| §27.6.5 / §4.5.5 | `vocab_tag.approved` | ✅ | |
| §27.6.5 / §4.5.5 | `vocab_tag.rejected` | ✅ | |
| §27.6.5 | `vocab_tag.review_slo_breach` | ✅ | Ops-only |
| §27.6.5 | `vocab_tag.deprecation_slo_breach` | ✅ | Ops-only |
| §27.6.5 | `vocab_tag.freeform_bypass_detected` | ✅ | Ops-only |
| §27.8.9 | `marketplace.abuse_report.*` (12 events) | ✅ | All present |
| §27.9 | `marketplace.seller_signal.*` (7 events) | ✅ | All present |
| §27.9 | `marketplace.buyer_signal_opt_in.*` (2 events) | ✅ | All present |
| §27.9.6 | `marketplace.seller_signal.digest_skipped_empty` | ⚠ | Cited in Appendix C body footnote ("silent internal-only event") but not in the table; not registered as a row |
| §27.10 | `vendor_opt_out.*` events | ❌ | §27.10 vendor opt-out webhook catalog implied but not in Appendix C — Vendor Opt-Out events either fire under existing `vendor.disqualified` flow (unlikely) or are unmapped |
| §27.11 | `marketplace_discovery.*` events | ❌ | §24953 says "all registered in Appendix C and Appendix J `webhook_event_class = marketplace_discovery_domain`" — no Marketplace-Discovery-Domain subsection in Appendix C |
| §27.11 | `marketplace_discovery.frequency_cap_bypass_suspected` | ❌ | Cited at §24575 as "Appendix C extension"; not landed |
| §27.11 | `marketplace_discovery.anonymization_threshold_breach` | ❌ | Cited at §24558; not in Appendix C |
| §50.4.3 | `ops_session_started` | ✅ | |
| §50.4.3 | `ops_session_ended` | ✅ | |
| §50.4.7 | `ops_session_customer_revoked` | ✅ | |
| §50.4.2 | `ops_session_auto_closed_time_box_expired` | ✅ | |
| §50.4.4 | `ops_session_quorum_required_requested` | ✅ | |
| §50.4.5 | `ops_session_customer_notification_failed` | ✅ | |
| §50.3.4 | `ops_role_assignment_changed` | ✅ | |
| §50.15.7 / §50.15.9 | `sim.signal.emitted`, `sim.signal.rolled_into_case`, `sim.signal.auto_dismissed`, `sim.case.flagged`, `sim.case.investigating`, `sim.case.resolved`, `sim.case.escalated`, `sim.case.sla_breach`, `sim.kill_switch.activated`, `sim.kill_switch.deactivated` | ❌ | Line 40455 explicitly says "Register all ten `sim.*` events listed in §50.15.9 with 'Webhook-only; no in-app/email notification to customers' — these are Ops-internal" — none of these 10 events appear in Appendix C |
| §25.7 | Internal-Comment-Domain (8 events) | ✅ | All present |
| §13.11 | `defense_view.generated`, `defense_view.regenerated` | ✅ | Both present |
| §13.11 | `defense_view.regenerated_due_to_source_change` (PostHog-only chip event) | ✅ | Cited in Appendix C body footnote; not duplicated in the row table — correct |
| §6.8 | DSAR-Lifecycle (7 events) | ✅ | All present (Phase 3V Audit-Remediation) |
| §6.8.4 | Group lifecycle (6 events) | ✅ | All present (Phase 3V+) |
| §6.6.4 / §50 | Security (5 events) | ✅ | All present |
| §25.5 | Console-Bridge-Anomaly (`console_bridge.dlq_storm`) | ✅ | Present; but per-event `console_bridge.dlq_entered` is not in Appendix C even though `dlq_storm` references it as a suppressible parent |
| §29.9 / §25.5 | `support.ticket.created` | ❌ | §25.9 line 25268 says "Ticket creation MUST emit `support.ticket_created` PostHog event AND `support.ticket.created` webhook (where customer-subscribed)" — webhook is referenced but not in Appendix C |
| §29.11 | `support.incident_surface_opened` | n/a | PostHog-only per §29.11 line 25282; no webhook claimed — correctly absent from Appendix C |
| §41 / §48.4.2 | `email_dkim_signing_failed` | ❌ | §33507 (line 33507) says "DKIM signing failures emit `email_dkim_signing_failed` (Appendix G — new) and quarantine the message" — emitted as PostHog, but if email-platform fails delivery the recipient also needs awareness; no Appendix C row |
| §48.5 (M1–M8) | All 35 user-notification events (`m1.*`, `m2.*`, `m3.*`, `m4.*`, `m5.*`, `m6.*`, `m8.*`) | ✅ | All present |
| §48.5 (M7) | M7-specific user notifications | ✅ | Correctly absent — Appendix C body explicitly says M7 fires no M7-specific notifications beyond §29.1 `workspace_invitation` |
| §48.5 (companion webhooks) | `growth.m1.*`, `growth.m2.*`, …, `growth.m8.*` | ⚠ | Footnote names them ("Notification-to-webhook mapping. Every m1.* … m8.* user-notification event has a corresponding `growth.mX.*` webhook delivered to subscribed Org endpoints per §48.5 per-mechanic Webhook tables") but the Appendix C tables list only the user-notification events, not the parallel `growth.*` webhooks; reverse lookup against §31 is broken |
| §48.6 (M9–M13) | M9 page-publication, M10/M11/M12/M13 events | ❌ | Line 36400 promises "Appendix C (Notification Event Catalog): 22 new M9–M13-domain notification kinds (M9: 5; M10: 5; M11: 5; M12: 5; M13: 5; cross-mechanic: 2)" — none landed |
| §48.6 (M9 specifically) | `m9.category_page.draft_ready_for_review`, `m9.category_page.editorial_decision_published`, `m9.category_page.vendor_opt_out_resweep_applied`, `m9.category_page.k_anon_page_level_failure`, `m9.category_page.takedown_filed` | ❌ | §35780 lists them; §35786 says "Appendix C update block in §48.6.9" — §48.6.9 is M13, not the Appendix C update block; misdirected reference |
| §48.6 (M9) | `marketplace_content.m9.category_page.published`, `.archived`, `.vendor_opt_out_applied`, `.takedown_remedy_applied` | ❌ | Webhook-only; should be registered in Appendix C |
| §48.7 (M14–M17) | M14–M17 events | ❌ | Line 37039 promises "18 new M14–M17-domain notification kinds (M14: 4; M15: 4; M16: 6; M17: 7)"; none landed |
| §51 (M9–M17 cross-mechanic) | `editorial_review_task.sla_breached`, `marketplace_content.takedown.affecting_your_vendor` | ❌ | Line 36400 names these explicitly; not landed |
| §27.10 | `marketplace.direct_invite.expired` | ❌ | Cited at §23781 but not in Appendix C; the Marketplace-Signals subsection has `marketplace.seller_signal.direct_invite.expired` (different prefix); reverse lookup broken |

**Reverse pass roll-up.** Of ~225 webhook event references in §22/§25/§27/§31/§44.6/§48.5/§48.6/§48.7/§50.4/§50.15/§13.11/§6.8/§6.6, ~85 are unregistered or registered with name drift in Appendix C.

---

## 4. Forward Pass — §29.1 vs Appendix C Drift

§29.1 (lines 25140–25172) authors a SEPARATE Notification Event Catalog with ~22 events. Appendix C is supposedly the canonical roll-up (per its preamble), but §29.1 events are not all reflected:

| §29.1 event | Appendix C row | Drift |
|---|---|---|
| `response_received` | ❌ Appendix C has `response_submitted` | name drift |
| `response_ready_for_evaluation` | ❌ | missing |
| `comment_mention` | ✅ | |
| `comment_reply` | ❌ | missing |
| `grade_exception` | ❌ | missing |
| `vendor_invitation` | ❌ Appendix C has `vendor_invited` | name drift |
| `eoi_submitted` | ❌ Appendix C has `eoi_received` | drift in semantics (submitted vs received) |
| `phase_advanced` | ✅ | |
| `sla_breach` | ✅ | |
| `insight_card_generated` | ❌ | missing |
| `policy_ingestion_complete` | ❌ | missing |
| `scenario_saved` | ❌ | missing |
| `intelligence_brief_available` | ❌ | missing |
| `amendment_published` | ❌ Appendix C has `amendment_required`, `amendment_accepted` | semantic mismatch |
| `reverification_required` | ❌ | missing |
| `reverification_deadline` | ❌ | missing |
| `nda_signature_requested` | ❌ Appendix C has `nda_request`, `nda_signed` | name drift |
| `capability_declaration_evidence_needed` | ❌ Appendix C has `capability_declared` | semantic mismatch |
| `kb_entry_stale` | ❌ Appendix C has `kb.entry.flagged_stale` | name drift (`kb_entry_stale` vs `kb.entry.flagged_stale`) |
| `document_library_expired` | ❌ | missing |
| `sync_failure_persistent` | ❌ | missing |

**Forward-pass roll-up.** §29.1 and Appendix C are TWO catalogs that drift on ~17 of 22 §29.1 events. Per the Appendix C preamble, Appendix C is the canonical roll-up — §29.1 should either (a) be the same content or (b) be an explicit cross-reference. Today it is neither.

---

## 5. Forward Pass — §41.2 Email Type Catalog vs Appendix C

§41.2 enumerates 22 email templates. None of the v7.0.0 integrated events have corresponding rows in §41.2:

| Appendix C row needing email | §41.2 template? |
|---|---|
| `billing.wallet.cap_warning_80` | ❌ |
| `billing.wallet.cap_warning_100` | ❌ |
| `billing.wallet.auto_topup_executed` | ❌ |
| `billing.wallet.auto_topup_failed` | ❌ |
| `billing.plan.upgraded` | ❌ |
| `billing.plan.downgraded` | ❌ |
| `billing.plan.downgrade_scheduled` | ❌ |
| `billing.committed_spend.contract_activated` | ❌ |
| `billing.committed_spend.renewal_due_60` | ❌ |
| `kb.entry.flagged_stale` | ❌ |
| `kb.namespace.migrated` | ❌ |
| `kb.draft.needs_clarification` | ❌ |
| `kb.session.terminated` | ❌ |
| `kb.session.mcp_auth_failed` | ❌ |
| `kb.export.ready` | ❌ |
| `kb.export.failed` | ❌ |
| `disqualification.cascade_partial_failure` | ❌ |
| `disqualification.notification_failed` | ❌ |
| `vendor_disqualification_reversed` | ❌ Appendix C row exists; §41.2 has only `vendor_disqualified.hbs` |
| `m1.*`, `m2.*`, `m3.*`, `m5.*`, `m6.*`, `m8.*` (all email-bearing) | ❌ |
| `marketplace.abuse_report.*` (every email-bearing) | ❌ |
| `marketplace.seller_signal.*` | ❌ |
| `seller.crm_sync.*` | ❌ |
| `ops_session_started`, `ops_session_ended`, `ops_session_customer_revoked`, `ops_session_auto_closed_time_box_expired` | ❌ |
| `internal_comment_thread.*` | ❌ |
| Phase 3V Security: `security.suspicious_login_attempt`, `security.account_locked`, `security.mfa_factor_changed`, `security.new_device_login`, `security.session_revoked_by_admin` | ❌ |
| DSAR-Lifecycle: `dsar.acknowledged`, `dsar.fulfilled`, `dsar.extension_granted`, `dsar.cascade.partial_failure`, `dsar.rejected_manifestly_unfounded`, `dsar.export.ready`, `dsar.verification_failed` | ❌ |
| Phase 3V+ Group Lifecycle: `org.group_created`, `org.group_deleted`, `org.group_assigned_role_slug_changed`, `org.workos_groups_api_outage`, `org.scim_group_role_assigned`, `org.scim_group_role_revoked` | ❌ |

**Forward-pass roll-up.** §41.2 was written at v6.0.0; v7.0.0 integration added ~80 email-bearing events, none of which are in §41.2. F-596 (Email Type Catalog) is structurally stale.

---

## 6. §41 Email Compliance Walk

| Audit-prompt check | §41 evidence | Verdict |
|---|---|---|
| SPF | Cited at §29.2 line 25187 ("SPF/DKIM/DMARC aligned") and §48.4.2 (DMARC reputation); NOT in §41.3 | ⚠ — §41.3 is silent on SPF |
| DKIM | Cited at §48.4.2 (DKIM signing); NOT in §41.3 | ⚠ — §41.3 is silent on DKIM |
| DMARC | Cited at §48.4.2 (DMARC reputation); NOT in §41.3 | ⚠ — §41.3 is silent on DMARC |
| Unsubscribe link | §41.3 CAN-SPAM bullet; §41.4 Marketing/Lifecycle row | ✅ |
| Bounce / complaint thresholds | §41.3 (< 2% bounce; < 0.5% complaint) | ✅ |
| Per-event template registration | §41.2 enumerates 22 templates; v7.0.0 events (~80) absent | ⚠ |
| `customer_action_required` CTA discipline | Mentioned in Notes column for some Appendix C rows; not enforced via §41 | ⚠ |

---

## 7. Plan-Tier Eligibility

The audit prompt requires "some notifications gated to paid" — i.e., a per-event plan-tier column.

| Subsection | Plan-tier column? | Rule cited |
|---|---|---|
| Transactional | ❌ | none |
| Lifecycle | ❌ | none (`trial_expiring` implicitly Free; not stated) |
| Marketing | ❌ | none |
| Billing-Domain | ❌ | inverse rule §31.8.9 #17 "no plan-tier gating applies" |
| KB-Domain | ❌ | none |
| Disqualification | ❌ | none |
| Growth-Domain | ❌ | none |
| M1–M8 | ❌ | none (M2 is `business_starter+`, M3 is `business_growth+` per §51 — not surfaced here) |
| Taxonomy | ❌ | inverse rule "no per-plan gate" |
| Marketplace-Abuse | ❌ | none |
| Marketplace-Signals | ✅ | "Seller Growth+ for digest; Seller Scale+ for real-time" |
| CRM-Sync | ✅ | "Seller Growth+ for CRM Sync; Seller Scale+ for Ops alerts" |
| Ops-Console | ❌ | "transactional; never opt-out-able" — implies all-tier |
| Internal-Comment | ❌ | Internal Comments are §34 Business Starter+ feature; not stated |
| Defense-View | ❌ | Defense View is Business Scale+ per §13.11; not stated |
| Phase 3V | ❌ | none |

---

## 8. Localization (i18n) Hook

Per §37.2, "v6.0 is English-only at launch. The codebase is i18n-ready." Per the v7.1.0 Master Spec, no Appendix C row carries an `i18n_template_key` or `locale` field. Email templates in §41.2 are referenced by template-id (e.g., `vendor_invited.hbs`) but template-id ↔ locale is not modeled. On a §35427 cross-reference, M9 page narrative is "localized per §37.2 i18n for the Org's `default_locale`" — but Appendix C templates carry no locale binding.

**Verdict.** No subsection in Appendix C references an i18n hook. This is a P2 documentation gap (today launch is English-only so it does not block ship; for the v7.x i18n RFC to land cleanly the Appendix C rows will need a `template_locale_key` column or a §41.2 locale-variant binding).

---

## 9. Idempotency / Dedup Window

Per §31.1, `event_id` is the canonical webhook idempotency key. Per Appendix C preamble, Appendix C is "a derived index — every entry MUST resolve to (a) a registered §31.8 / §22.4 / … webhook event". Implicitly, all webhook-bearing rows inherit `event_id` dedup. But Appendix C does not state this in the table; per-row Notes are inconsistent.

For in-app and email rows that are NOT webhook-paralleled, no dedup window is stated:
- M-series rows: silent on idempotency
- Transactional/Lifecycle/Marketing rows: silent on idempotency
- Phase-3V rows: some carry idempotency clause (e.g., `security.account_locked` "idempotent on `(user_id, lockout_started_at)`"), most do not.

**Verdict.** Idempotency rules are inherited from §31 but not surfaced in Appendix C; the per-row dedup statement is sparse and inconsistent.

---

## 10. Retention of Notification Records

§40.2 enumerates retention rules for ~30 entity classes. None of them is an "in-app notification row" or "email send record". §29.7 cites NotificationFailureAudit retention (7 years) for FAILURE rows only. Successful in-app notification row retention is undefined; Loops.so email send-log retention is implicit (Loops.so default; not contracted).

**Verdict.** Appendix C silently inherits §40.2 silence. No row states retention. P1 by the audit prompt's check 6.

---

## 11. Counterfactual Pass — Realistic Failure Modes

For Appendix C as a whole, the audit prompt requires three realistic failure modes per feature.

| Failure mode | Spec coverage |
|---|---|
| 1. **Loops.so vendor outage during a critical billing event (e.g., `billing.wallet.cap_warning_100`)** — recipient never receives email, customer hard-caps without warning | ⚠ §31.6 webhook DLQ covered; §29.7 NotificationFailureAudit row class covered; §41.1 Loops.so failure not modeled; §50.4.5 strict-mode is the ONLY block-on-failure rule (Ops Console only) — billing-critical and KB-export emails have NO equivalent strict-mode |
| 2. **Adversarial input — webhook subscriber attempts to subscribe to `internal_comment_thread.post_appended` from a Seller-Console subscription** | ✅ Internal-Comment-Domain catalog rule names the §31 subscription-registration guard returning HTTP 404; CI gate `webhook_payload_no_internal_comment_body` cited |
| 3. **DSAR right-to-erasure on the recipient of a pending in-app notification** — does the cascade purge the in-app row? | ❌ Not modeled. §6.8 DSAR cascade walks audit rows and entity rows but Appendix C does not bind notification rows into the cascade. §40.2 has no notification retention; §6.8.4 is silent |
| 4. **Concurrent emit — two workers fire `kb.export.ready` for the same `export_id` within milliseconds** | ⚠ §22.18.2 deduplicates per `export_id` but the Appendix C row says "deduplicated to one event per export_id" — concurrent-emit ordering not specified for the two workers |
| 5. **Recipient resolution race — Workspace Owner role swaps mid-emit** | ❌ Not modeled. Recipients are role-based ("Workspace Owner", "Billing Admin"); recipient-resolution at emit-time vs at delivery-time is not stated |
| 6. **Email DKIM signing fails (line 33507 `email_dkim_signing_failed`)** | ⚠ §48.4.2 says message quarantines; no Appendix C path for delivery to fall back to alternate channel (e.g., webhook + in-app); recipient may never know the email was attempted |
| 7. **Localization — recipient locale ≠ Org default locale** | ❌ Not modeled (deferred to v7.x i18n) |
| 8. **Mobile push notification — Appendix C has no `push` channel column** | ❌ §38 mobile parity is silent; per §3.7 Notes, mobile mostly mirrors desktop but push notification surface is not modeled |

---

## 12. Findings (Pre-Ledger Promotion)

Concrete defects to promote:

- **D-V8.3-001 (P1, consistency_drift, webhook).** §31.9.10 CRM Sync webhook catalog uses `crm_sync.*` prefix; Appendix C CRM-Sync-Domain Events use `seller.crm_sync.*` prefix. Names also drift (`connection_created` vs `connection_activated`, `connection_resumed` vs `connection_auto_resumed`, `activity_accepted` vs `activity_written`).
- **D-V8.3-002 (P1, notification, webhook).** Appendix C is missing 9 §31.9.10 CRM Sync events: `crm_sync.connection_created`, `oauth_token_refresh_failed`, `account_created`, `account_match_needs_review`, `field_mapping_updated`, `field_mapping_reverted_on_downgrade`, `routing_rule_updated`, `dsar_cascade_notification`, `connection_resumed`. Coverage invariant explicitly broken.
- **D-V8.3-003 (P1, notification).** Appendix C has no Solo-Tier Surface Treatment subsection; §32395 references one as authored. Four `solo.*` events (`solo.envelope.throttling_engaged`, `solo.envelope.throttling_cleared`, `solo.envelope.exhausted`, `solo.capability.envelope_no_block_invoked`) are unregistered. F-622 confirms feature-level dependency.
- **D-V8.3-004 (P1, notification).** Appendix C is missing all M9–M17 user-notification events. §35457 / §36400 / §37039 explicitly promise "16 + 22 + 18 = 56 new notification kinds"; zero landed. M9 `m9.category_page.*` (5 events), `marketplace_content.m9.*` webhooks (4 events), and the cross-mechanic events `editorial_review_task.sla_breached` and `marketplace_content.takedown.affecting_your_vendor` are entirely absent.
- **D-V8.3-005 (P1, notification).** Appendix C is missing 10 SIM events (`sim.signal.*`, `sim.case.*`, `sim.kill_switch.*`). Line 40455 explicitly says "Register all ten `sim.*` events listed in §50.15.9 with 'Webhook-only; no in-app/email notification to customers'"; not landed.
- **D-V8.3-006 (P1, consistency_drift).** §29.1 Standard Events table and Appendix C drift on ~17 of 22 events. Per Appendix C preamble, it is "the canonical roll-up of every notification event"; §29.1 should be a cross-reference, not a parallel catalog.
- **D-V8.3-007 (P1, notification, webhook).** Appendix C is missing `bid.disqualified` (§19085 V5 D-5V-005 remediation REQUIRED Appendix C registration), `verification.tier_downgraded` (§6149 Authored Extension), and the 4 §31.8 interim billing webhooks (`billing.wallet.overage_cap_changed`, `billing.wallet.auto_topup_config_changed`, `billing.contest.filed`, `billing.contest.decision_received`).
- **D-V8.3-008 (P1, notification).** Wallet 50% threshold notification is named in F-538 ("Wallet Threshold Notifications (50/80/100%)") and §30261 ("fires `wallet.threshold_crossed` webhook at 50/80/100%"). Appendix C has only `cap_warning_80` and `cap_warning_100`; no 50% row.
- **D-V8.3-009 (P1, notification, webhook).** Appendix C is missing the §27.11 Marketplace-Discovery-Domain subsection; §24953 says "all registered in Appendix C and Appendix J `webhook_event_class = marketplace_discovery_domain`". Specific events `marketplace_discovery.frequency_cap_bypass_suspected` (§24575) and `marketplace_discovery.anonymization_threshold_breach` (§24558) are unregistered.
- **D-V8.3-010 (P2, notification).** Appendix C does NOT bind per-event template-ids to §41.2 templates. §41.2 enumerates 22 templates; Appendix C references "Loops.so" inline but never names the template per row. v7.0.0 introduced ~80 email-bearing events, none of which are in §41.2.
- **D-V8.3-011 (P2, observability).** Appendix C does not state plan-tier eligibility per row (Check 2). Marketplace-Signals and CRM-Sync are the only two subsections that cite Plan-Tier rules. M2/M3 (Buyer Starter+/Growth+ per §51), Internal Comments (§34 Business Starter+), Defense View (§34 Business Scale+) all have plan-tier gates that should be cited.
- **D-V8.3-012 (P2, observability).** Appendix C does not state localization (i18n) hooks per row (Check 3). v6.0 is English-only at launch per §37.2; v7.x i18n requires per-row template-locale-key binding. Not blocking ship; structural gap for the i18n RFC.
- **D-V8.3-013 (P1, retention).** Appendix C does not state retention of in-app notification rows per row (Check 6). §40.2 has no entry for "in-app notification" or "email send log". §29.7 NotificationFailureAudit retention covers FAILURE rows only (7 years per §6.8.5 row class #14). Successful in-app notification rows have no retention contract.
- **D-V8.3-014 (P2, observability).** Appendix C does not state idempotency / dedup window per row (Check 5). §31.1 `event_id` rule is inherited but not surfaced; per-row dedup behavior is inconsistent (e.g., `m2.link.vendor_opt_out_applied` says "deduped per link per resweep cycle" — a different dedup model — and most M-series rows are silent).
- **D-V8.3-015 (P2, documentation_gap).** §41.3 (Email Compliance) does NOT explicitly cite SPF / DKIM / DMARC. §29.2 cites "SPF/DKIM/DMARC aligned"; §48.4.2 cites DMARC + DKIM; §41.3 cites only CAN-SPAM / GDPR / CASL / bounce / complaint thresholds. Audit prompt requires §41 deliverability binding.
- **D-V8.3-016 (P1, notification).** Appendix C is missing `support.ticket.created` webhook (§29.9 line 25268 says "Ticket creation MUST emit … `support.ticket.created` webhook (where customer-subscribed) within 1 s of submission"). The PostHog event `support.ticket_created` is also unregistered in Appendix G as a separate matter.
- **D-V8.3-017 (P3, consistency_drift).** Appendix C row `kb_entry_pending_review` (line 41929) breaks the dotted `kb.entry.*` naming convention used by every other KB-Domain event in the table (`kb.entry.published`, `kb.entry.archived`, `kb.entry.flagged_stale`, etc.). Should be renamed `kb.entry.pending_review` per §31.8.1 naming-convention rule "lowercase dotted".
- **D-V8.3-018 (P3, consistency_drift).** §29.1 uses `kb_entry_stale`; Appendix C uses `kb.entry.flagged_stale`. Same event, different name.
- **D-V8.3-019 (P2, observability).** Appendix C does not enumerate `growth.mX.*` companion webhooks per row (only the user-notification side). The footnote "Notification-to-webhook mapping" cites §48.5 per-mechanic Webhook tables but Appendix C should be the single roll-up; today it is not.
- **D-V8.3-020 (P1, notification).** Appendix C `marketplace.seller_signal.digest_skipped_empty` is cited in body text ("a silent internal-only `marketplace.seller_signal.digest_skipped_empty` Ops-audience event is emitted for observability") but is NOT registered as a row in the catalog. Per the coverage invariant ("Every webhook event named anywhere in the spec body MUST appear in this appendix exactly once"), this is a registry violation.
- **D-V8.3-021 (P2, dsar).** Appendix C does not state DSAR cascade behavior for notification rows. When a recipient's user record is right-to-erased, what happens to pending in-app notification rows addressed to them? §6.8.4 DSAR cascade is silent; Appendix C is silent.
- **D-V8.3-022 (P2, mobile_divergence).** Appendix C has no `push` (mobile push notification) channel column. The audit-prompt check #1 names "channel(s) (in-app, email, push, webhook)". §38 mobile-parity does not specify push notification semantics. Today this is implicitly "no push at v6.0/v7.0"; should be stated.
- **D-V8.3-023 (P1, notification, webhook).** Appendix C is missing `marketplace_listing_*` lifecycle events from §27.4.9. §27.4.9 references "Webhook Events (Added to Appendix C Notification Event Catalog and Appendix G PostHog Event Taxonomy)"; the events `marketplace_listing_approved`, `marketplace_listing_flagged`, `marketplace_appeal_resolved` exist in Appendix C Transactional Events without a dedicated subsection, but other §27.4.9 events (the `marketplace.listing.*` webhook prefix) are not enumerated. Subsection-level drift.
- **D-V8.3-024 (P3, documentation_gap).** Appendix C preamble (line 41839) lists §31.8 / §22.4–§22.16 / §25.3.15 / §25.7 / §27.4.9 / §27.6.14 / §27.8.9 / §27.9 / §27.10 / §31.8 / §34.16 / §50.10.6 / §50.12.12 / §50.13.8 / §50.14.10 / §50.15.10 as the authoritative source set. Some referenced sections in this list do not actually exist (e.g., §27.6.14 is not in the spec — taxonomy events are at §27.6.7; §50.10.6 / §50.12.12 / §50.13.8 / §50.14.10 / §50.15.10 likewise unverified). Authoring drift.
- **D-V8.3-025 (P2, observability).** Appendix C does not differentiate "Suppressed by DND" from "Bypasses DND" in a column — the rule is buried in per-subsection footnotes ("Frequency override rules"). For a build, an engineer writing the dispatcher needs a single per-row Boolean (`bypasses_dnd: true|false`) to enforce the §50.4.5 strict-mode rule and the §29.3 quiet-hours rule.
- **D-V8.3-026 (P1, retention, dsar).** §29.7 NotificationFailureAudit retention is 7 years per §6.8.5 row class #14, but Appendix C does not state DSAR-erasure behavior for failure rows. A right-to-erasure on the failed-notification recipient must redact PII fields without breaking the SLA-investigation use case.
- **D-V8.3-027 (P2, consistency_drift).** Appendix C `disqualification.notification_failed` is the only Loops.so-specific failure event registered; no parallel `loops_email_dispatch_failed` event exists for the other ~80 email-bearing rows. When DSAR notifications, M-series invites, M9 takedown notifications, etc. fail at the Loops.so layer, recipients have no path to learn about the failure (and Ops has no per-domain failure event). NotificationFailureAudit row class #14 is the silent fallback.
- **D-V8.3-028 (P3, consistency_drift).** Appendix C subsection ordering does not match Master Spec section order. Subsections appear: Transactional → Lifecycle → Marketing → Billing-Domain (§31.8) → KB-Domain (§22) → Disqualification (§25.3) → Growth-Domain (§48) → M1–M8 (§48.5) → Taxonomy (§27.6.7) → Marketplace-Abuse (§27.8.9) → Marketplace-Signals (§27.9) → CRM-Sync (§31.9) → Ops-Console (§50.4) → Internal-Comment (§25.7) → Defense-View (§13.11) → Phase 3V. The order alternates between "by section" and "by phase introduction"; not a single coherent sort. Reader navigation cost.

---

## 13. Self-Challenge Pass

Re-read each defect as a hostile reviewer.

- **D-V8.3-001.** Evidence reproducible (lines 26283–26305 vs lines 42073–42095). Severity P1 because a webhook subscriber filtering on `event_type` will receive nothing — the filter strings disagree across the two authoritative sources. Recommendation: pick one prefix (`seller.crm_sync.*` per Appendix C) and update §31.9.10 to use it.
- **D-V8.3-002.** Evidence reproducible. Severity P1 — these are real events that fire in production but consumers cannot subscribe (no Appendix C row → no Appendix G row → no webhook subscription type → the `event_class=crm_sync_domain` envelope contract is incomplete).
- **D-V8.3-003 / D-V8.3-004 / D-V8.3-005.** All three are "promise made; promise not kept" P1 defects. Evidence: explicit lines stating Appendix C registration is required; absence in Appendix C. Severity confirmed.
- **D-V8.3-006.** P1 because §29.1 and Appendix C are both authoritative but disagree. Per the Appendix C preamble's "single canonical roll-up" claim, §29.1 should be a forward-pointer or be merged. Recommendation: deprecate §29.1 Standard Events / Additional Events tables in favor of Appendix C and replace §29.1 with a pointer.
- **D-V8.3-007.** P1 — `bid.disqualified` is required by V5 D-5V-005 remediation; non-registration is a regression on a previously-closed defect.
- **D-V8.3-008.** Severity P1 confirmed — the 50% threshold is in BPS / SPS Pricing Strategy and §30261 names the webhook explicitly; Appendix C does not register it.
- **D-V8.3-009.** P1 confirmed — §24953 is explicit; subsection missing.
- **D-V8.3-010.** Per-event template-id binding is a P2 (engineer can resolve via §41.2 template-name-to-event mapping IF they read §41.2 → cross-reference to Appendix C → infer); but the v7.0.0 events are entirely absent from §41.2 itself, which is P1. Re-classify: D-V8.3-010 stays P2 (template binding for v6.0.0 events); a sibling defect should target the v7.0.0 absence in §41.2 — captured as part of D-V8.3-004 / D-V8.3-005 et al.
- **D-V8.3-011 / D-V8.3-012 / D-V8.3-014 / D-V8.3-015.** P2 confirmed; these are observability / documentation gaps that an engineer can resolve with prudent inference but two readers may disagree.
- **D-V8.3-013.** P1 confirmed — §40.2 has no notification-row retention; this is needed for Ops-side data-retention reporting and for DSAR cascade.
- **D-V8.3-016.** P1 confirmed — `support.ticket.created` webhook is acceptance-criteria-binding at §29.9 #2 ("MUST emit … within 1 s of submission"); without Appendix C row, the contract is unobservable to integrators.
- **D-V8.3-017 / D-V8.3-018 / D-V8.3-024 / D-V8.3-028.** P3 confirmed — naming and ordering hygiene; not buildability.
- **D-V8.3-019.** Re-classify: per §48.5 each mechanic has its own Webhook table, and Appendix C only covers user notifications. The "single canonical roll-up" preamble contradicts this. P2 because reverse lookup against §31 still works through the §48.5 tables, but Appendix C does not honor its own preamble.
- **D-V8.3-020.** P1 confirmed — coverage invariant explicitly broken: "Every webhook event named anywhere in the spec body MUST appear in this appendix exactly once."
- **D-V8.3-021.** P2 confirmed — DSAR cascade behavior on notification rows is not modeled; could be P1 if the DSAR right-to-erasure deadline is missed because of unmodeled cascade. Hold at P2 because the failure mode is "engineer infers reasonable cascade", not "engineer builds wrong thing".
- **D-V8.3-022.** P2 confirmed — push channel is a "future ship" but the column is missing now.
- **D-V8.3-023.** P1 confirmed — §27.4.9 explicitly references Appendix C registration; only partial coverage.
- **D-V8.3-025.** P2 confirmed — buildability is achievable by reading the footnotes; build cost is non-zero.
- **D-V8.3-026.** P1 confirmed — DSAR right-to-erasure is a hard regulatory requirement (per §6.8); failure-row PII redaction not stated → engineer may build wrong thing.
- **D-V8.3-027.** P2 confirmed — the existence of NotificationFailureAudit (§29.7) covers the operational side; per-domain failure events are useful but not required for ship.

**Self-challenge revisions.** D-V8.3-010 confirmed P2 (re-classified above). All other severities hold.

---

## 14. Counterfactual Pass — Per-Subsection Failure Modes

For each subsection, three realistic failure modes the spec must handle:

- **Transactional (3):** (a) Loops.so vendor outage during a `vendor_disqualified` send → recipient never knows; spec coverage: NotificationFailureAudit row only. (b) Recipient hard-bounces; spec coverage: bounce-rate target only. (c) Recipient is on a Solo plan and event suppression rule applies; spec coverage: §44.6.5 implicit suppression — UNCLEAR which Transactional events are Solo-suppressed.
- **Billing-Domain (3):** (a) `billing.wallet.cap_warning_100` delivery failure during a hard-cap event → customer hits hard-cap with no warning; **NO strict-mode** equivalent to §50.4.5 — delivery failure does NOT block the cap-application. (b) Auto-topup retries while wallet hard-caps mid-charge; spec coverage: §31.8.4 covers it. (c) Stripe outage → `auto_topup_failed` fires but customer's email also bounces; spec coverage: cascade not modeled.
- **KB-Domain (3):** (a) Seller deletes the SellerSoftware while `kb.namespace.migrated` event is in flight → race condition; spec coverage: §22.4.4 partially covers. (b) Vault re-mint fails twice in a session; spec coverage: `kb.session.mcp_auth_failed` covers. (c) Reviewer-inbox 60-day TTL elapses while user is on PTO; spec coverage: archives draft per §40.2 retention tier.
- **Disqualification (3):** (a) Loops.so retry exhausts → `disqualification.notification_failed` fires (covered). (b) Cross-Console Bridge DLQ for `vendor.disqualified` → cascade_partial_failure event (covered). (c) Vendor Org soft-deleted between disqualification and notification dispatch → seller-org-deleted failure_reason (covered).
- **Ops-Console (3):** (a) Customer Org has zero active Org Owner users → escalation chain to Billing Admin to sole Ops admin (covered §50.4.5). (b) Email send fails for `ops_session_started` → strict-mode blocks session (covered §50.4.5). (c) Customer revokes mid-session and receives `ops_session_customer_revoked` (covered).

Counterfactual gap: **§50.4.5 strict-mode delivery guarantee is unique to Ops-Console**. Billing-critical, KB-export, and DSAR notifications have no equivalent strict-mode — if Loops.so fails, the customer is silently un-notified. **Captured as part of D-V8.3-013 / D-V8.3-026** (retention/DSAR-side documentation of NotificationFailureAudit recovery rules).

---

## 15. Promotion to Defect Ledger

28 defects above promote to `DEFECT_LEDGER.md`. No defects withdrawn during self-challenge.

**P0:** 0 (no buyer/seller firewall, billing surface, or regulatory hard-block defect surfaced).
**P1:** 13 (D-V8.3-001 through 010 except 010 re-classed P2; plus D-V8.3-013, 016, 020, 023, 026; plus 005, 007, 008, 009).
**P2:** 11 (D-V8.3-010, 011, 012, 014, 015, 019, 021, 022, 025, 027; counterfactual gap rolled into 013/026).
**P3:** 4 (D-V8.3-017, 018, 024, 028).

Total: 28.

Final P-bucket counts after self-challenge: P0=0 / P1=13 / P2=11 / P3=4.
