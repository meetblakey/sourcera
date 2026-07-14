# Phase 41 Findings — §41 Email Deliverability & Compliance

**Scope.** Single-prompt audit of Master Spec v7.1.0 §41 (lines 31992–32050). Six prompt-mandated checks: (1) SPF / DKIM / DMARC posture spec'd; (2) per-domain warmup rules; (3) bounce + complaint handling; (4) unsubscribe (CAN-SPAM, GDPR) compliance; (5) Loops.so integration coverage; (6) plan-gated email volume. The audit also walks the global convention checklist (entity definition, ACs, enums, glossary, state machines, APIs, webhooks, plan gating, retention/privacy, numerical singletons, heading syntax, surface/engine mapping, console firewall, edge cases) for every concept §41 introduces or implies.

**Date.** 2026-05-09.

**Verdict.** §41 is **structurally underbuilt for its title.** The chapter is 58 lines (lines 31992–32050) yet underwrites every email-bearing notification, every growth loop (L1/M1/M5/M16/M17), every Hero Moment activation email, every billing comm, every SLA reminder, every transactional auth flow, every DSAR notification, every grace-period reminder, every Solo-tier conversion email, and every Marketplace-domain seller signal digest in the platform. Four of the six prompt checks fail at §41 itself; the corpus carries the substantive contract elsewhere — primarily at §48.4.1 (per-Org rate caps), §48.4.2 (DMARC/SPF reputation scan + DKIM signing), §48.4.3 (shared-use-domain detection), §48.4.8 (suppression list), §29.2/§29.3 (notification preferences), §42.2 (Loops.so dispatch alert), §40.2 (retention table) — but §41 routes a reader to none of those homes. Inbound citations from §22, §29.2, §31, §44.6, §50, and §13.11 cite "per §41" for SPF/DKIM/DMARC alignment that §41 does not actually author; that is a P2 broken-citation cluster that radiates through the spec. Roughly ~80 v7.0.0 / v7.1.0 notification events emitted across the spec body have no corresponding §41.2 catalog row (the cross-reference defect already captured under D-V8.3-* but not yet anchored against §41 as the canonical engine).

**Severity roll-up (Phase 41).** P0 = 0 · P1 = 8 · P2 = 12 · P3 = 2 · total = 22.

**Self-challenge pass.** Re-read each filed defect after first draft as a hostile staff engineer. Two cell sharpenings: (a) D-41-004 originally elided the §41.3 / §41.4 internal contradiction in favor of the bulk-sender RFC 8058 gap — re-merged so both halves of the defect are visible to a remediation owner; (b) D-41-005 originally pointed only at "Loops.so integration" — sharpened to enumerate the seven concrete sub-contracts (auth + key rotation, inbound webhook ingestion, fallback, template sync, suppression-list sync, audience segmentation, residency routing) so that a remediation cannot be closed by adding one paragraph and ignoring the rest. No defects demoted; one P2 (D-41-013) considered for promotion to P1 and held at P2 because §42.2 carries a `loops_degraded` alert — the runtime alarm exists, only the §41-side behavior contract during alarm is silent (which is a P2 ambiguity, not a P1 unbuildable).

**Counterfactual pass.** Three realistic failure modes the spec must handle and §41's coverage:
1. *Loops.so 5xx burst for 30+ minutes.* `loops_dispatch_failure_burst` alert at §42.2 fires (line 32197). §41 does not state behavior during the alarm: queue depth ceiling, fallback provider, manual hold, recipient-visible degradation messaging. **Captured by D-41-005, D-41-013.**
2. *Recipient address bounces hard 3 times.* No per-recipient suppression contract at §41. §48.4.8 suppression list is global denylist (fraud / spam / legal-takedown), not per-Org bounce-driven. The bounce → suppression bridge is unauthored. **Captured by D-41-003.**
3. *EU buyer Org sends to EU vendor stakeholder; data residency is EU.* §47.4 references "data-residency-aware routing" and §33993 says "the Loops.so email send respects §41.3 SPF/DKIM/DMARC and §47.4 data-residency-aware routing" — but §41 itself does not state Loops.so's regional routing capabilities, sub-processor data-residency segregation, or fallback if Loops.so cannot route EU. **Captured by D-41-005, D-41-012.**

---

## Walking the six checks

### Check 1 — SPF / DKIM / DMARC posture spec'd at §41

**FAIL.** §41 contains zero `SPF`, `DKIM`, or `DMARC` substring. §41.3 is titled "Email Compliance" and addresses only CAN-SPAM, GDPR, CASL, bounce-rate target, complaint-rate target, and a one-line "Deliverability Monitoring" bullet. The substantive contract lives at §48.4.2 (DMARC/SPF Reputation): nightly DMARC alignment scan against rolling-7-day Loops.so telemetry; SPF record validation at Org email-domain registration with monthly recheck; DKIM signing via Sourcera signing keys for all outbound; quarantine on DKIM failure; deferred-send queue when `dmarc_alignment_pass_rate < 0.85`; surface in Org Settings → Domain Verification (§36.2). §41 routes a reader to none of this.

**Inbound-citation drift.** Line 20055 ("`SPF/DKIM/DMARC-aligned per §41`"), line 25243 ("`SPF/DKIM/DMARC aligned. From: noreply@sourcera.io`"), line 33993 (M1 StakeholderInvite residency note — "The Loops.so email send respects §41.3 SPF/DKIM/DMARC"), and line 35581 ("§41 deliverability controls") cite §41 as the SPF/DKIM/DMARC home. §41 does not author it. A reader following any of these citations lands in §41.3 and finds CAN-SPAM only.

→ **D-41-001** (SPF/DKIM/DMARC absent from §41 + broken inbound citations).

### Check 2 — Per-domain warmup rules

**FAIL.** §41 is silent on per-domain warmup. §48.4.1 authors a static per-Org plan-tier outbound rate cap (1k / 5k / 10k / 25k / 100k per 24h) but no warmup curve — i.e., a newly-registered `org_email_domain` does not gradually ramp send-volume from a low daily floor (e.g., 50/day for the first 7 days, then 100, 250, 500…) before reaching the plan-tier ceiling. The industry-standard "IP / domain warmup" practice is universally required for new sending domains to build reputation with major mailbox providers (Gmail, Outlook, Yahoo); without it, a newly-claimed `org_email_domain` sending at the Enterprise 100k/24h ceiling on day 1 will be classified as a spam-source by the mailbox providers and the Org's deliverability collapses. Loops.so itself documents warmup requirements; §41 does not surface the contract on the Sourcera side.

→ **D-41-002** (per-domain / per-tenant warmup curve absent).

### Check 3 — Bounce + complaint handling

**FAIL on implementation.** §41.3 declares targets only: bounce rate < 2%, complaint rate < 0.5%, and the prose "List hygiene (bounce management, complaint handling)" with no behavioral spec. Specific gaps:

- **Hard vs soft bounce thresholds.** No per-recipient suppression-on-bounce contract: how many soft bounces in what window before recipient is suppressed? Hard-bounce instant-suppress? Spec silent.
- **Complaint feedback loop ingestion.** Loops.so receives complaint feedback via mailbox-provider FBL endpoints (Gmail, Yahoo, Microsoft FBL, AOL); §41 does not state how Sourcera ingests these signals, whether a complaint instantly suppresses, what audit row writes, and whether the user can appeal.
- **Bridge from bounce/complaint events to the §48.4.8 suppression list.** §48.4.8 is a global Ops-managed denylist for fraud/spam/legal-takedown; bounce-and-complaint-driven suppression is a different domain and is unauthored. A junior engineer could plausibly assume bounce events should write to §48.4.8 (they should not — it would conflate categories and require Ops review for every bounce).
- **Threshold-action plumbing.** §41.3 sets "< 2% bounce, < 0.5% complaint" as targets but does not state what happens when the thresholds are breached: alarm? Loops.so account pause? Per-Org throttle? Customer-visible warning? §42.2 has a single `loops_dispatch_failure_burst` alarm that fires on Loops 5xx + DLQ rate > 5% — but that is a delivery-failure alarm, not a bounce-rate or complaint-rate alarm. No `bounce_rate_threshold_breach` / `complaint_rate_threshold_breach` alarm registered.
- **No per-recipient suppression entity.** The implicit `SuppressionListEntry` (per-recipient, bounce/complaint-driven) entity is undefined per §4 conventions. Distinct from the §48.4.8 global suppression list which is platform-wide and Ops-managed.

→ **D-41-003** (bounce/complaint handling not implementable as written; multiple sub-defects).

### Check 4 — Unsubscribe (CAN-SPAM, GDPR) compliance

**FAIL on internal consistency + missing one-click contract.**

- **§41.3 ↔ §41.4 contradiction.** §41.3 says "Unsubscribe link + physical address (sourcera.io footer) **in all emails**." §41.4 row 1 says transactional emails (Vendor Invitation, NDA, Q&A, Response, Phase advancement, SLA, Comment Mention, Selection Report, Disqualification, EOI, Workspace invitation, GDPR notifications) are "Transactional (No opt-out) — Sent regardless of preference. **Cannot unsubscribe.**" The §41.3 universal rule contradicts the §41.4 transactional-class exemption.
- **Missing RFC 8058 List-Unsubscribe + List-Unsubscribe-Post header contract.** Gmail and Yahoo bulk-sender rules (effective Feb 2024) require senders sending > 5,000 messages/day to (a) pass DMARC alignment; (b) include `List-Unsubscribe` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers on all marketing/promotional mail; (c) honor unsubscribe within 2 days. §48.4.1 caps allow 100k/24h Enterprise — clearly bulk. §41 is silent on the headers. Without one-click unsubscribe, marketing email deliverability to Gmail/Yahoo collapses.
- **CAN-SPAM physical postal address unspec'd.** §41.3 cites "physical address (sourcera.io footer)" but does not register an actual address. CAN-SPAM 15 USC §7704(a)(5) requires a "valid physical postal address of the sender." The address must be a real registered street address or PO box.
- **GDPR right-to-erasure and the suppression-list paradox.** Industry standard: the suppression list (per-recipient unsubscribe) is retained under legitimate-interests exemption to honor opt-out perpetually, even after a right-to-erasure request that erases the underlying user record. §41 does not state the policy.
- **Preference center.** No mention of where users manage email preferences (per-category opt-in / opt-out, frequency overrides). §29.3 governs in-app/Slack/email channel-routing preferences but the §41-specific marketing-vs-lifecycle preferences UI is unspec'd.

→ **D-41-004** (§41.3/§41.4 contradiction + missing RFC 8058 one-click + missing CAN-SPAM physical address + missing right-to-erasure / suppression-list policy + missing preference center).

### Check 5 — Loops.so integration coverage

**FAIL.** §41.1 is one sentence: "All email sent via **Loops.so** — transactional, lifecycle, and marketing." This is a vendor name, not a contract. Specific gaps that a §32 / §31 / §29 / §47 / §6.8 reader would expect to find at §41:

1. **Auth & key rotation.** §6.7 secret-redaction registry references `loops_*_secret*` (line 7420) but the API auth model, key-rotation cadence, and secret-broker storage (e.g., AWS Secrets Manager rotation policy) are not registered at §41.
2. **Inbound webhook ingestion.** Loops.so emits delivery telemetry (delivered, bounced, complained, opened, clicked) via webhook back to Sourcera. §48.4.2 references "Loops.so-reported delivery telemetry" but the Loops.so → Sourcera webhook contract (signing, idempotency, payload schema, retry semantics on Sourcera's side) is unauthored.
3. **Fallback on outage.** §42.2 has a `loops_degraded` alert state. §41 is silent on behavior during it: queue, fallback provider, manual hold, customer-visible degradation messaging.
4. **Template sync.** Templates listed in §41.2 (`vendor_invited.hbs`, `nda_request.hbs`, etc.) live in Loops.so. The sync mechanism (committed template diffs vs Loops.so dashboard authoring), template-version pinning at send-time, rollback-on-bad-template are unauthored.
5. **Suppression-list sync.** The §41-side suppression list (per-recipient bounce/complaint) and the §48.4.8 global suppression list both must be honored at the Loops.so adapter layer; the bridge is unauthored.
6. **Audience segmentation.** Loops.so offers audience filters (e.g., "all opted-in Marketing recipients in Org X"); the cross-Org segregation contract (Org A's Loops.so audience MUST NOT contain Org B's recipients) is unauthored. Critical for GDPR sub-processor data-segregation.
7. **Data-residency routing.** Loops.so as a sub-processor has US infrastructure. EU residency Orgs require either an EU Loops.so region OR an alternate provider OR confirmation that Loops.so's GDPR posture (Standard Contractual Clauses + Transfer Impact Assessment) is sufficient. §47.4 references "data-residency-aware routing" but §41 does not state how Loops.so satisfies it.

→ **D-41-005** (Loops.so integration spec missing across seven sub-contracts).

### Check 6 — Plan-gated email volume

**FAIL.** §41 contains zero plan-gating cell. §48.4.1 publishes per-Org outbound rate caps (1k/5k/10k/25k/100k per 24h on Free/Starter/Growth/Scale/Enterprise) but the cross-reference from §41 to §48.4.1 is absent. Per Authoring Convention #8 (plan gating reflected in §5.11 + §34.1 + §39, with inline references citing the source table), §41 should cite §48.4.1 — and §48.4.1 should additionally land in §39 Object Size Constraints as a per-Org email-volume row, not as a §48.4.1 inline literal. §39 currently has no email-volume row. The `email_kind` (Appendix J — implicit) → plan-tier matrix (which transactional kinds are unconditional, which lifecycle kinds gate to specific plans, which marketing kinds gate to opted-in only) is unauthored.

→ **D-41-006** (plan-gated email volume not in §41; §39 row missing; §41 ↔ §48.4.1 cross-reference absent).

---

## Walking the global convention checklist

### Entity definition (§4 conventions)

§41 implies several entities — `EmailTemplate`, `EmailSend`, `EmailEvent` (delivered / bounced / complained / opened / clicked), `SuppressionListEntry` (per-recipient, distinct from §48.4.8 global denylist), `UnsubscribePreference` (per-user × per-category) — none defined per §4 (Field | Type | Constraints | Notes). The `m1_email_send_status` enum (line 33909) hints at a state machine but the entity itself is unauthored.

→ **D-41-007** (email-domain entities undefined per §4 conventions).

### Acceptance criteria (§13.10 / §14.9 / §17.8 / §20.7 style)

§41.5 has 6 ACs, none numbered, none with measurable thresholds:
- AC #1 "All email templates have preview URL for QA review" — what URL? Authentication? Retention?
- AC #2 "All transactional emails delivered within 60 seconds of trigger" — 60-second SLO, but no percentile (p95? p99? mean?), no observability hook (PostHog event registered? alarm at threshold?), no cited single-source home for the 60-second number (numerical-singleton concern).
- AC #5 "Bounce and complaint rates monitored weekly via Loops.so dashboard" — no threshold-action plumbing.
- AC #6 "No transactional emails sent from marketing sender address" — observable but no CI gate authored.

→ **D-41-008** (§41.5 ACs not testable; not numbered; missing observable thresholds).

### Enum registration (Appendix J)

§41 introduces / consumes:
- `email_category` (Transactional / Lifecycle / Marketing) — used in §41.2 column 5; not registered in Appendix J.
- `email_opt_out_class` (Transactional / Transactional-Critical / Marketing-Lifecycle) — used in §41.4 column 2; not registered.
- `email_kind` enum referenced at §48.4.1 (line 33626) and Appendix G (line 42757 `email_dkim_signing_failed.email_kind`) — not registered in Appendix J.
- `m1_email_send_status` (Appendix J line 33909, registered) — but the wider, §41-spanning send-status enum (used by every Loops.so-routed email) is not registered.

→ **D-41-009** (email_category, email_opt_out_class, email_kind, email_send_status enums not registered in Appendix J).

### Glossary (Appendix K)

§41 introduces multi-section terms not in Appendix K:
- `Transactional-Critical` (coined in §41.4; used elsewhere e.g. §31.8 billing-domain `notification_override_billing_critical=true` semantics).
- `Lifecycle email` (used in §41.2 + §29.2 + §35).
- `Bounce rate` / `Complaint rate` (industry terms but corpus-specific definitions; §41.3 sets them as targets).
- `Deliverability` (§41 chapter title; not glossed).
- `Sender domain` / `From: alignment` (used at §48.4.2; not glossed).

→ **D-41-010** (Appendix K terms missing).

### State machines

`EmailSend` lifecycle is implicit: `queued → sending → sent → delivered → bounced/complained/failed/suppressed`. Per Authoring Convention #5, prose is not acceptable. Appendix J line 33909 lists the values for `m1_email_send_status` but does not provide a `From | To | Trigger | Conditions | Notes` table. No EmailSend state machine in Appendix L.

→ **D-41-011** (EmailSend state-machine table missing).

### APIs / webhooks

§41 references no APIs and registers no webhook events under §31 — but the implicit Loops.so → Sourcera webhook ingestion (delivered, bounced, complained, opened, clicked) needs §31 registration: HMAC-SHA256 verification (Loops.so signing key), idempotency via Loops.so event id, retry semantics (since the inbound is from Loops.so, retry is on Loops.so's side; Sourcera's idempotency contract on receipt is the Sourcera-side ask). Appendix C registration for the inbound events is also absent.

→ **D-41-017** (Loops.so → Sourcera bounce/complaint webhook ingestion unspec'd).

### Plan gating

Already covered by D-41-006.

### Retention / privacy / residency

§40.2 has retention rows for many entities but none for `EmailSend`, `EmailEvent`, `SuppressionListEntry`, `UnsubscribePreference`. §6.8 DSAR — no spec on email-history under right-to-erasure. Loops.so as a sub-processor is referenced in §6.8 DPA Appendix per other sections but §41 does not enumerate. EU residency: §47.4 references "data-residency-aware routing" but §41 does not state Loops.so's regional routing capabilities.

→ **D-41-012** (retention/DSAR/residency rules missing for email-domain entities).

### Numerical singletons

§41.5 AC #2 (60s delivery SLO), §41.3 (< 2% bounce, < 0.5% complaint, > 100/day deliverability monitoring threshold) — none cite a single source. Per Authoring Convention #10, every dollar / character / duration / threshold has exactly one authoritative home. The 60s SLO appears at §25.3.6 ("dispatched within 60 seconds" for Disqualification) and §41.5 inline; the 2% / 0.5% / 100/day are §41.3-only but should be moved to §42.1 SLA Commitments or §44.6 Solo-tier table for cross-section consistency.

(Minor — counted under D-41-008.)

### Heading syntax

§41.1, §41.2, §41.3, §41.4, §41.5 all carry `## N.N Title {#n.n-title}` anchors. ✅

### Surface/engine mapping (Appendix M)

Appendix M.1 line 48846 maps "Email Type Catalog (transactional / marketing / digest) | §41.2 | Each email is its own surface; the catalog is engine | Internal-only, never surfaced". The line note "Each email is its own surface" implies each `email_kind` should have its own Appendix M.1 row — but only one umbrella row exists for the catalog. ~80 v7.0.0 / v7.1.0 events that emit email lack Appendix M.1 surface rows.

(Counted under D-41-014.)

### Console firewall

§41.2 emails routed across the buyer/seller console boundary (Vendor Invitation → seller-side recipient with buyer Workspace Name and inviter display name; NDA Request → seller; Comment Mention → may carry buyer comment text to seller; Selection Report Ready → buyer-only OK; Disqualification → seller with `notification_style` enum). §4.7 Cross-Console Bridge entities require explicit enumeration of carried-vs-redacted fields. §41 does not enumerate.

→ **D-41-019** (console firewall — buyer-data fields carried in seller-recipient emails not enumerated).

### Edge cases

(Loops.so outage handling, mobile-vs-desktop divergence in email rendering, recipient locale / language, recipient timezone for "due in 24 hours" subject lines, guest scoping for vendor recipients with no Sourcera account, DSAR right-to-erasure interaction with suppression list, downgrade path — what queued emails for higher-tier remain valid, third-party outage cascade — Convex / Anthropic / WorkOS down implies what for email pipeline.)

→ **D-41-013** (edge cases — Loops.so outage behavior contract).
→ **D-41-018** (i18n / locale / timezone in email rendering).
→ **D-41-020** (no §41 cross-references to §48.4.1 / §48.4.2 / §48.4.3 / §48.4.8).
→ **D-41-021** (open / click tracking pixels — privacy implications unspec'd).
→ **D-41-022** (§41.2 Reply-To column missing — only addressed in M5 § line 34880).

### Catalog staleness vs §31.8 / Appendix C

§41.2 contains 23 v6.0.0 templates; ~80 v7.0.0 / v7.1.0 events from the §31.8 billing-domain catalog, the §22 KB-domain catalog, the §27 marketplace catalog, the §44.6 Solo-tier catalog, the §50 Ops-session catalog, the §13.11 Defense View catalog, and the §13.12 Buyer-Maya catalog have no §41.2 row. Already captured at PHASE8.3 (`D-V8.3-004 / 005 / 007 / 010 / 027`); this defect re-anchors the gap from the §41 side as the canonical engine.

→ **D-41-014** (§41.2 catalog stale; cross-reference to D-V8.3-* cluster).

### Citation hygiene

(Already enumerated in Check 1.)

→ **D-41-016** (inbound `per §41` citations for SPF/DKIM/DMARC are broken).

### CAN-SPAM physical address

→ **D-41-015** (physical postal address unspec'd).

---

## Promotion to Defect Ledger

22 defects promoted to `DEFECT_LEDGER.md`. Severity roll-up: P0 = 0, P1 = 8, P2 = 12, P3 = 2.

| defect_id | severity | class | one-line summary |
|---|---|---|---|
| D-41-001 | P1 | documentation_gap | §41 absent SPF/DKIM/DMARC contract; canonical home §48.4.2 not cross-referenced; ~5 inbound `per §41` citations broken. |
| D-41-002 | P1 | documentation_gap | Per-domain warmup curve absent at §41 and §48.4.1; new `org_email_domain` ramps to plan-tier ceiling unconstrained. |
| D-41-003 | P1 | documentation_gap | Bounce/complaint handling unimplementable: no soft-vs-hard thresholds, no FBL ingestion, no threshold-action plumbing, no per-recipient suppression entity. |
| D-41-004 | P1 | consistency_drift | §41.3 "all emails" unsubscribe contradicts §41.4 transactional-no-opt-out + missing RFC 8058 one-click + missing CAN-SPAM postal address + GDPR right-to-erasure / suppression-list paradox unspec'd. |
| D-41-005 | P1 | documentation_gap | Loops.so integration spec missing across 7 sub-contracts (auth/rotation, inbound webhook, fallback, template sync, suppression sync, segmentation, residency). |
| D-41-006 | P1 | plan_gating | §41 silent on plan-gated email volume; §48.4.1 caps not in §39; no `email_kind` × plan-tier matrix authored. |
| D-41-007 | P1 | data_model | EmailTemplate / EmailSend / EmailEvent / SuppressionListEntry / UnsubscribePreference entities undefined per §4. |
| D-41-008 | P1 | acceptance_criteria | §41.5 ACs not numbered, not testable, missing percentile threshold + observability hook + CI gate references. |
| D-41-009 | P2 | enum | email_category, email_opt_out_class, email_kind, email_send_status enums not in Appendix J. |
| D-41-010 | P2 | glossary | Transactional-Critical / Lifecycle / Bounce rate / Complaint rate / Deliverability / From: alignment terms not in Appendix K. |
| D-41-011 | P2 | state_machine | EmailSend state machine prose-only; `From | To | Trigger | Conditions | Notes` table missing from Appendix L. |
| D-41-012 | P1 | retention | §40.2 has no rows for email-domain entities; §6.8 silent on email-history DSAR; Loops.so EU residency unspec'd. |
| D-41-013 | P2 | observability | §41 silent on Loops.so outage behavior contract; `loops_degraded` runtime alarm exists at §42.2 but §41-side behavior unauthored. |
| D-41-014 | P1 | notification | §41.2 catalog stale; ~80 v7.0.0/v7.1.0 events lack §41.2 row; cross-reference to D-V8.3-* cluster. |
| D-41-015 | P3 | documentation_gap | §41.3 cites "physical address (sourcera.io footer)" without registering an actual postal address. |
| D-41-016 | P2 | consistency_drift | Inbound `per §41` SPF/DKIM/DMARC citations at lines 20055, 25243, 33993, 35581 are broken; canonical home is §48.4.2. |
| D-41-017 | P2 | webhook | Loops.so → Sourcera bounce/complaint webhook ingestion unspec'd; absent from §31 and Appendix C. |
| D-41-018 | P2 | documentation_gap | Email body i18n / locale / recipient-TZ unspec'd; "due in 24 hours" subject line ambiguous on TZ. |
| D-41-019 | P2 | firewall_leakage | §41.2 emails route buyer-Console data to seller-Console recipients (Vendor Invitation, NDA, Q&A, Comment Mention, Disqualification) without §4.7 carried-vs-redacted enumeration. |
| D-41-020 | P2 | documentation_gap | §41 contains no cross-references to §48.4.1 / §48.4.2 / §48.4.3 / §48.4.8 — siloed authoring. |
| D-41-021 | P2 | dsar | Open-tracking pixel + click-tracking redirect — privacy implications + DSAR right-to-erasure compatibility unspec'd. |
| D-41-022 | P3 | data_model | §41.2 Reply-To column missing for all 23 catalog rows; only M5 (line 34880) addresses Reply-To routing. |

---

## Coverage Matrix Updates

The following five §41-related feature inventory rows tighten cells (Phase 41):

- **F-009 Loops.so Email Delivery Integration** (§1.5 / §41): `webhook` ⚠ → ❌ (D-41-017); `error_state` ⚠ → ❌ (D-41-013); `i18n` n/a → ❌ (D-41-018); `documentation_gap` ⚠ → ❌ (D-41-005, D-41-020).
- **F-468 Email Notifications (Loops.so)** (§29.2 / §41.1): `data_model` ⚠ → ❌ (D-41-007); `acceptance_criteria` ⚠ → ❌ (D-41-008); `state_machine` ⚠ → ❌ (D-41-011); `enums` ⚠ → ❌ (D-41-009); `glossary` ⚠ → ❌ (D-41-010); `retention` ⚠ → ❌ (D-41-012); `dsar` ⚠ → ❌ (D-41-012, D-41-021); `residency` ⚠ → ❌ (D-41-012); `console_firewall` ⚠ → ❌ (D-41-019); previously-tightened cells per Phase 8.3 (`notifications` ❌, `error_state` ❌) carry forward.
- **F-596 Email Type Catalog** (§41.2): `data_model` ⚠ → ❌ (D-41-022); `console_firewall` ⚠ → ❌ (D-41-019); `notifications` ❌ (Phase 8.3) carries forward; `surface_engine_mapping` ⚠ → ❌ (per-`email_kind` Appendix M.1 rows missing — counted under D-41-014).
- **F-597 Email Compliance (CASL/CAN-SPAM/GDPR)** (§41.3): `acceptance_criteria` ⚠ → ❌ (D-41-008); `consistency_drift` (i.e., §41.3 ↔ §41.4) → tracked under D-41-004; `documentation_gap` ⚠ → ❌ (D-41-001, D-41-002, D-41-005, D-41-015, D-41-020); previously-tightened cell per Phase 8.3 (`documentation_gap` ❌ via D-V8.3-015) carries forward and is now anchored to D-41-001.
- **F-598 Opt-Out Classification** (§41.4): `enums` ⚠ → ❌ (D-41-009); `glossary` ⚠ → ❌ (D-41-010 — `Transactional-Critical`); `acceptance_criteria` ⚠ → ❌ (D-41-008).

Aggregate counters NOT updated in this Phase 41 pass per the Phase 1.1 / Phase 8.3 / Phase 45 precedent (cell-tightening prescriptions, not a cell-by-cell apply). The mechanical update rides the v7.1.1 hygiene pass.

---

## Cross-References

- §41 (lines 31992–32050).
- §48.4.1 Email-Volume Throttling (lines 33621–33636).
- §48.4.2 DMARC/SPF Reputation (lines 33637–33651).
- §48.4.3 Shared-Use Domain Detection (lines 33653–33667).
- §48.4.8 Suppression List (line 33759 onward).
- §42.2 Monitoring & Alerting (line 32197 — `loops_dispatch_failure_burst`).
- §40.2 Data Retention & Deletion (lines 31907–31945).
- §6.8 Data Privacy & GDPR Compliance.
- §47.4 Data-Residency-Aware Routing.
- Appendix C Notification Event Catalog (line 41973 onward; Transactional / Lifecycle / Marketing event sections).
- Appendix G PostHog Event Taxonomy (line 42519 onward).
- Appendix J Controlled Vocabulary Registry (line 44486 onward).
- Appendix K Glossary (line 47530 onward).
- Appendix M Surface/Engine Mapping (line 48508 onward; line 48846 — Email Type Catalog row).
- Phase 8.3 catalog defects: `D-V8.3-004`, `D-V8.3-005`, `D-V8.3-007`, `D-V8.3-010`, `D-V8.3-015`, `D-V8.3-027` (`PHASE8.3_FINDINGS.md`).
- Phase 5.7 §41.2 catalog defects: `D-5.7-008` (`PHASE5.7_FINDINGS.md`).
- Phase 4.11 §20 sub-prompt §41 Pulse-digest cross-reference confirmation: `PHASE4.11_FINDINGS.md` line 2038.
- Phase 45 Privacy & Abuse Prevention: `PHASE45_FINDINGS.md` (parallel pattern of "section underbuilt for its title").
