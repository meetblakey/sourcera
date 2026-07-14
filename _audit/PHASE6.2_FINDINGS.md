# Phase 6 / Prompt 6.2 — Vendor Discovery & RFP Marketplace (§27) — Scratch Log

**Audit baseline.** Master Spec v7.1.0 (2026-04-28). Prompt 6.2 walks §27 end-to-end (§27.1 → §27.11) with cross-references to §34.16 (Marketplace Discovery Pricing), §22 (Seller KB), §26 (Seller Profile / Verification badge surfaces), §44.6 (Solo-Tier Surface Treatment), §45.3 (Marketplace Abuse Escalation), §48 (PLG / Network Effects), §42.3.1 (Marketplace Abuse Operational SLA), §1.3 / §7.2 (Console Firewall), §4.4.7 / §4.4.8 / §4.4.18 / §4.4.19 / §4.4.20 / §4.4.21 / §4.5.1 / §4.5.2 / §4.5.6 / §4.5.7 (consumed entities), §4.8.12 (MarketplaceDiscoveryRevenueRecord), §31 / §32 (webhook + API contracts), Appendix C (Notification Event Catalog), Appendix G (PostHog Taxonomy), Appendix I (Error Code Catalog), Appendix J (Controlled Vocabulary Registry), Appendix K (Glossary), Appendix L (Entity State Machines), Appendix M (Surface/Engine Mapping).

**Audit posture.** Non-destructive. Findings filed against `DEFECT_LEDGER.md` per `Audit_Prompts.md → Defect Ledger Format`. Defect-id mnemonic for this prompt: `D-6.2-NNN`.

**Convention abbreviations.** ME = Master Spec body; APX-C = Appendix C (Notification Event Catalog); APX-F = Appendix F (Webhook Retry & Recovery); APX-G = Appendix G (PostHog Event Taxonomy); APX-I = Appendix I (Error Code Catalog); APX-J = Appendix J (Controlled Vocabulary Registry); APX-K = Appendix K (Glossary); APX-L = Appendix L (Entity State Machines); APX-M = Appendix M (Surface/Engine Mapping).

---

## 1. Section Inventory

§27 sub-sections audited end-to-end:

| Anchor | Title | Line range | Scope summary |
|---|---|---|---|
| §27.1 | Purpose | 21936–21939 | Marketplace = neutral-domain directory firewalled from both consoles. |
| §27.2 | Availability | 21940–21951 | Plan-gating summary; cites §34.1.1 / §34.1.2 as authoritative. |
| §27.3 | Marketplace Search & Filtering | 21952–21974 | Filters, listing display, sort. |
| §27.4 | Marketplace Match Score | 21975–22344 | Learned-ensemble ranking model with v1 cold-start, GBDT internals, hard gates (residency / vendor opt-out), fairness audit suite, feedback entity, programmatic API + audit receipts. (12 sub-sub-sections.) |
| §27.5 | Expression of Interest (EOI) | 22345–22370 | EOI content, vendor-side Accept / Decline / Request-Info, post-listing-close auto-rejection. |
| §27.6 | Marketplace Tags & Controlled Vocabulary | 22371–22867 | Taxonomy CMS, deprecation cascade, freeform-tag prohibition, migration tooling, public read API. (11 sub-sub-sections.) |
| §27.7 | Acceptance Criteria | 22868–22882 | Top-level §27 ACs covering §27.1–§27.5. |
| §27.8 | Marketplace Abuse & Takedown | 22883–23436 | Reporter classes, severity matrix, Ops triage SLA, seller appeal flow, ban-scope rules, webhook catalog, evidence bundles, legal-process ingestion, public transparency reporting. (14 sub-sub-sections.) |
| §27.9 | Seller Signals (Anonymized Buyer Intent) | 23437–23864 | BuyerSignalOptInRecord, SellerSignalDeliveryPreference, SellerSignalDeAnonymizationLink, k-anon enforcement pipeline, k_anon_satisfied state machine, delivery surfaces, direct-invite flow, webhook catalog, DSAR cascade, Ops tooling. (15 sub-sub-sections.) |
| §27.10 | Vendor Opt-Out Global Registry | 23865–24416 | DNS TXT / Seller Owner authority attestation, enforcement-surface allowlist (17 surfaces), 60-second latency budget (5 stages), retroactive cross-Org cascade, public API, two webhook families (lifecycle vs page-sweep), DSAR cascade. (11 sub-sub-sections.) |
| §27.11 | Marketplace Discovery Pricing (Non-AI Layer) | 24417–25044 | Promoted Listings + Verification Tiers + Featured Placements product-behavior layer; defers all billing to §34.16 / §4.8.12. (10 sub-sub-sections.) |

**Cross-referenced entities walked.** §4.4.7 Marketplace Category; §4.4.8 Vendor Opt-Out Record; §4.4.10 Seller Org Page; §4.4.11 Software Page; §4.4.12 Category Page; §4.4.13 Guide Page; §4.4.14 Comparison Page; §4.4.15 Market Intelligence Report; §4.4.16 Heat Map Cell; §4.4.18 SellerSignal; §4.4.19 PromotedListing; §4.4.20 FeaturedPlacement; §4.4.21 VerificationReviewRecord; §4.5.1 Marketplace Listing; §4.5.2 EOI Record; §4.5.4 Taxonomy Node; §4.5.5 Controlled-Vocabulary Tag; §4.5.6 Marketplace-Domain Read/Render Contract; §4.5.7 Marketplace Abuse Report; §4.5.8 EOI Acceptance Record; §4.8.12 MarketplaceDiscoveryRevenueRecord.

**External cross-references walked.** §1.3 Dual-Console Isolation; §7.2 Cross-Console Firewall; §22.5 KB Health Score; §22.20 Seller Maya Surface Abstraction; §26.1 / §26.2 / §26.3 Seller Profile + Verification + Capability Declarations; §31 Webhook contract; §32 API patterns; §34.1.1 / §34.1.2 Plan Tier Definitions; §34.10.3 Solo-co-resident pool rule; §34.16 Marketplace Discovery Pricing; §40.1 Residency; §40.2 Retention; §42.3.1 Marketplace Abuse Operational SLA; §44.6 Solo-Tier Surface Treatment; §45.1 Data Privacy; §45.2 Abuse Prevention; §45.3 Marketplace Abuse Escalation; §48.2.11 L10 Marketplace Match-Score Teaser; §48.4 Anti-Spam & Abuse Controls; §48.6 M9–M13 Public Marketplace Content Mechanics.

---

## 2. Convention Walk Per Audit Checklist

The 14-point audit checklist applied to §27 produced the findings enumerated in §3 below. Highlights:

| Convention | §27 Result | Notes |
|---|---|---|
| 1 — Entity definition | **Mostly compliant.** The seven net-new entities authored under §27 (`MarketplaceMatchScoreFeedback` §27.4.11; `MarketplaceAbuseEvidenceBundle` §27.8.12; `MarketplaceLegalProcessIngest` §27.8.13; `BuyerSignalOptInRecord` §27.9.2; `SellerSignalDeliveryPreference` §27.9.3; `SellerSignalDeAnonymizationLink` §27.9.4; `VendorOptOutAuthorityAttestation` §27.10.2) all carry full field tables, scope isolation, indexes, retention, and DSAR rules. Two referenced sub-resources are forward-references without complete entity tables: `DirectInviteTargetAccount` (§27.9.8) and `MarketplaceMatchFeatureRegistry` / `MarketplaceMatchScoreModelVersion` / `MarketplaceMatchScoreSnapshot` (§27.4.3 / §27.4.5 / §27.4.9 — all "authored under §4.5.x in the follow-on integration phase"). See D-6.2-006. | |
| 2 — Acceptance criteria | **Compliant** for every authored sub-section (§27.4.10, §27.4.11, §27.4.12, §27.6.9, §27.6.11, §27.7, §27.8.11, §27.8.12, §27.8.13, §27.8.14, §27.9.12, §27.10.9, §27.11.8). Numbered, testable, scope-bound. | |
| 3 — Enum registration in APX-J | **Failing.** 13 enums introduced in §27 are not registered as discrete H3/H4 entries in Appendix J. See D-6.2-005. | |
| 4 — Glossary in APX-K | **Spot-check failures.** "Hide Sponsored", "Verification Badge", "VendorOptOutAuthorityAttestation", "MarketplaceAbuseEvidenceBundle", "Legal-Process Ingest", "Transparency Report", "Hot-Registry Index", "Cost-Center Firewall", "Featured Lane", "distinctiveness veto", "Marketplace Match Score", "Coordinated abuse" — all multi-section terms used across §27 and either §22, §26, §44.6, §45, §48, §3, or `UX_Design_of_Sourcera.md` — absent from APX-K. P3 each. See D-6.2-008. | |
| 5 — State machines | **Catalogued in §27 prose but absent from APX-L.** §27 introduces ≥10 new state machines (Match Score Model Version, MarketplaceMatchScoreFeedback, MarketplaceAbuseEvidenceBundle, MarketplaceLegalProcessIngest, VendorOptOutAuthorityAttestation, k_anon_satisfied per-row state, BuyerSignalOptInRecord, FeaturedPlacement extended status set, PromotedListing extended status set, abuse-report `pending_second_signoff`). APX-L preamble (line 47641) requires "every status enum registered in Appendix J that corresponds to a non-trivial lifecycle must have a corresponding state machine table here or an explicit cross-reference to the originating section." Cross-references absent. P2. See D-6.2-007. | |
| 6 — APIs | §27.4.12, §27.6.10, §27.9.10, §27.10.6, §27.11.7 author the public endpoints to §32 fidelity (method, path, scope, rate-limit class, idempotency, request/response schemas, error tables). | |
| 7 — Webhooks | **Failing.** ~36 webhook events introduced in §27 are absent from Appendix C and (the corresponding PostHog mirrors) Appendix G. See D-6.2-003 and D-6.2-004. | |
| 8 — Plan gating | §27.2 cell summary cites §34.1.1 / §34.1.2; §27.4.6 cites §34.1; §27.9 plan-tier-row gates cite §34.1.2; §27.10.10 #8 explicitly says opt-outs are NOT plan-gated (privacy invariant). No inline numeric duplication. **One issue** — §27.9.6.2 says "monthly digest on seller_starter, weekly on seller_growth+, real-time on seller_scale+" inline; §34.1.2 row "Seller Signals" is the authoritative cell — confirm whether this constitutes restatement (P3). Logged as part of D-6.2-016. | |
| 9 — Retention & privacy | §27.4.11 (life of platform for feedback aggregate analytics); §27.8 (abuse-report life of platform per §4.5.7); §27.9.2 (Workspace + 180d post-archive); §27.9.4 (Org-life + 7y); §27.10.2 (Org-life + 7y; `ops_imposed` 10y); §27.10.8 (registry full DSAR cascade). All clauses present. | |
| 10 — Numerical singletons | **Failing on the §27.8.4 vs §42.3.1 abuse-SLA conflict.** §27.8.4 publishes a severity-tiered Ops triage SLA matrix (low/medium 24h, high 12h, critical 4h) and a per-severity total-resolution SLO table; §42.3.1 is the Phase 12.5 R-05 authoritative single home for marketplace-abuse SLA values and publishes a non-severity-tiered "<24 hours" initial-review window. §45.3 cites §42.3.1 as authoritative and forbids inline restatement. §27.8 acknowledges §45.3 but does not cite §42.3.1; §42.3.1 does not acknowledge §27.8.4. Engineering must build to one or the other; the two are not reconcilable as written. See D-6.2-001 (P1 numerical_singleton). | |
| 11 — Heading syntax | **Compliant.** All H2 / H3 / H4 / H5 in §27 carry anchor slugs in the `## N.N Title {#n.n-title}` form. | |
| 12 — Surface/engine mapping APX-M | **Mostly compliant.** APX-M carries discrete rows for: Marketplace Match Score (qualitative vs numeric); Match Score model_version_id; Match Score residency / opt-out / abuse-report hard gates; Match Score Cache Invalidation Webhooks; Match Score Feedback; Match Score Drift & Fairness Dashboard; Marketplace Search & Filtering; EOI; Marketplace Tags / Controlled Vocabulary; Marketplace Abuse & Takedown; Seller Signals; Buyer Signal Opt-In; Vendor Opt-Out + Authority Attestation; Marketplace Discovery Pricing. **Gaps:** "Hide Sponsored" buyer toggle (§27.11.2), "Score-Drift & Fairness Dashboard" (§27.4.11 — APX-M has "Match Score Drift & Fairness Dashboard" — verify wording match), "Public Transparency Report" surface (§27.8.14), "MarketplaceLegalProcessIngest" (§27.8.13 — Ops-only but still emits a render path on hide messaging), "Pre-flight scope report" Ops Console surface (§27.6.6), "Score-Drift & Fairness Dashboard" Ops Console (§27.4.11). See D-6.2-009. | |
| 13 — **Console firewall** | **Compliant where authored.** §27.4 Match Score honors the firewall; §27.8 Ban scope explicitly says `org_level_all_consoles` does NOT cross to Buyer Console; §27.10 Vendor Opt-Out cross-console reads return HTTP 404 with `vendor_opt_out_cross_console_access`; §27.11.7 cross-console reads return HTTP 404 with `cross_console_access`. **One leak vector** identified: §27.6.7 `taxonomy.category_added` payload includes `authored_by_ops_user_id` — emitted to **all** customer Org subscribers (§27.6.7 "There is no per-plan-tier gate on taxonomy webhook subscription — the events are foundational"). Leaks Sourcera Ops user identity (Ops PII) to every subscribing customer Org. See D-6.2-002 (P1 firewall_leakage). | |
| 14 — Edge cases | §27 covers most dimensions through the per-sub-section "Failure Modes Addressed" blocks. **Gaps:** mobile-divergence behavior on the §27.4.6 provenance panel; reporter-audience webhook suppression under non-disclosure legal process (§27.8.13 says only "Subject Org webhooks ... MUST be suppressed" — does not enumerate the reporter-audience suppression rule). See D-6.2-010 and D-6.2-011. | |

---

## 3. Defect Findings (promoted to DEFECT_LEDGER.md)

### P0 — Block production deployment

None confirmed. The audit prompt's CHECK 5 "Vendor Opt-Out Record honoring is retroactive and cascades across §27, §22, §26, §48" was specifically pressure-tested for P0 leak vectors. Each cascade clamps correctly:

- §27.10.3 Surface allowlist enumerates 17 enforcement surfaces and §27.10.9 AC #14 + #26 require a CI test to fail the build if a new render path emits Seller identity without an APX-M row.
- §27.4.4 + §27.4.7 honor `vendor_opt_out_effective_flag = 1` as a static hard gate AND invalidate cached snapshots within 60s of `vendor_opt_out.applied`.
- §27.9.5 stage 7 + §27.9.5.1 row `suppressed_vendor_opt_out_at_delivery` block Seller Signal delivery to an opted-out target.
- §22 (KB) and §26 (Seller Profile) integration: §27.10.3 Surface #6 (SellerOrgPage) and #7 (SoftwarePage) return 410 Gone on opt-out match; the seller-side KB stack (§22.7 / §22.18) is private-by-construction and does not surface seller identity to other Orgs.
- §48 PLG growth loops: §48.4.7 nightly drift sweep is the secondary defense layer per §27.9.5.1 for k-anon recovery; §48.2.11 L10 Match-Score teaser respects the same hard gate.

The temporal race window — `marketplace.match_score.computed` webhook firing for a snapshot whose subject seller opts out moments later — is bounded by the §27.4.7 60s staleness SLO and the §27.10.4 60s live-render enforcement budget, both authored to be co-indexed with the §27.9.5 60s snapshot-age bound. The race is by-design; not a P0 leak.

### P1 — Build-blocking

#### D-6.2-001 — §27.8.4 abuse-triage SLA conflicts with §42.3.1 authoritative SLA
- **Class.** `numerical_singleton`.
- **Location.** §27.8.4 Severity Matrix (lines 22943–22980) + §27.8.5 Total-Resolution SLO (lines 22963–22982); §42.3.1 Marketplace Abuse Operational SLA (lines 31741–31752); §45.3 Marketplace Abuse Escalation (line 32226).
- **Evidence.** §42.3.1 row 1: "Initial admin review of `pending_review` report | < 24 hours from filing | Ops Trust & Safety". §42.3.1 preamble at line 31743: "Authoritative home for marketplace-abuse-report operational timings. Promoted from §45.3 in Phase 12.5 (R-05 closure)." §45.3 line 32228: "The numerical SLA values for this workflow live in the §42.3.1 *Marketplace Abuse Operational SLA* table. The narrative below describes the state-transition workflow only; SLA durations cite §42.3.1 and MUST NOT duplicate values inline." §27.8.4 publishes a 4-tier severity SLA matrix (low: 24h, medium: 24h, high: 12h, critical: 4h) AND §27.8.5 publishes per-severity total-resolution SLOs (low: 5d, medium: 3d, high: 2d, critical: 24h) — none cite §42.3.1. §27.8 self-citation says "Where §45.3 is less specific than §27.8 (e.g., on severity, ban scope, or webhook delivery), §27.8 is treated as the specialized Marketplace-surface canonical source per the Source-of-Truth hierarchy" — but this conflicts with §45.3 / §42.3.1's Phase 12.5 R-05 closure that specifically promoted the SLA values into §42.3.1 as the single authoritative home.
- **Why P1.** A junior engineer building against §27.8.4 will implement the 4-tier severity SLA; a finance / compliance reviewer reading §42.3.1 will assert the flat <24h Initial-review SLA; deploy-time validators citing §42.3.1 (Phase 12.5 R-05) will not find the §27.8.4 severity values in §42.3.1 and will either fail or pass-through incorrectly.
- **Convention violated.** Authoring Convention #10 (Numerical Singletons — exactly one authoritative home; inline references cite the source table) per CLAUDE.md §11. §45.3 explicit instruction "MUST NOT duplicate values inline" — §27.8 inline-restates the SLAs without a citation.
- **Recommendation.** Reconcile via one of three paths: (a) extend §42.3.1 to carry the 4-tier severity matrix and update §27.8.4 to cite §42.3.1 verbatim; (b) update §42.3.1 preamble to acknowledge §27.8.4 as the specialized §27-surface canonical source for severity-tiered SLAs and §42.3.1 as the umbrella row; (c) collapse §27.8.4 severity-tiered SLAs into §42.3.1 with severity-tier columns added. Path (a) is preferred because it preserves the Phase 12.5 R-05 single-home promotion and keeps §45.3's "MUST NOT duplicate values inline" rule intact. After reconciliation, add a deploy-time validator `marketplace_abuse_sla_single_source` asserting that no inline restatement of the SLA values exists outside §42.3.1.
- **Remediation owner hint.** `engineering`.

#### D-6.2-002 — `taxonomy.category_added` webhook leaks Sourcera Ops user identity to every subscribing customer Org
- **Class.** `firewall_leakage`.
- **Location.** §27.6.7 `taxonomy.category_added` payload schema (lines 22612–22634) + Subscription model (line 22708).
- **Evidence.** §27.6.7 line 22632: payload includes `"authored_by_ops_user_id": "usr_01OPS..."`. §27.6.7 Subscription model (line 22708): "Any customer Org MAY subscribe to taxonomy events via `POST /api/v1/webhooks` with event-type filters (§31.3). There is no per-plan-tier gate on taxonomy webhook subscription — the events are foundational and all Orgs need them to keep their integrations synchronized." Combined: every customer Org with an active subscription receives the Sourcera Ops user's UUID in the webhook payload. §27.6.7 also includes `authored_by_ops_user_ids[]` in `taxonomy.category_deprecated` and `taxonomy.category_retired` payloads. The same leak applies to `marketplace.abuse_report.seller_banned` (§27.8.9 line 23140) which carries `signed_by_ops_user_ids[]` in the subject-audience payload.
- **Why P1.** Sourcera's Ops user identities are PII; broadcasting them to every subscribing customer Org enables: (a) social-engineering vectors against named Ops staff, (b) Ops-staff identification across customer-tracking dashboards, (c) reverse-correlation of approval timing to specific Ops individuals. The §1.3 Dual-Console Isolation invariant explicitly forbids cross-Org user-identity leakage. CLAUDE.md §13 Operational Rule "Surface conflicts explicitly" and the `firewall_leakage` class definition both apply.
- **Convention violated.** §1.3 Dual-Console Isolation; §6.8 DSAR (Sourcera Ops staff PII handling); §45.1 Data Privacy ("No PII in analytics events" — webhooks are not analytics but the spirit of PII redaction applies).
- **Recommendation.** Replace `authored_by_ops_user_id` (and `signed_by_ops_user_ids[]` in §27.8.9, `authored_by_ops_user_ids[]` in §27.6.7 deprecated/retired payloads) with: (i) `authored_by_role` (the canonical role string only, e.g., `"ops_taxonomy_admin"`), and (ii) an opaque per-customer-Org HMAC pseudonym `authored_by_actor_pseudonym = HMAC(actor_user_id, subscribing_org_id || webhook_secret)` so that each subscribing Org can correlate two events written by the same Ops user *to themselves only* but cannot resolve to a global identifier. Same pattern as the §4.7.1 Console Bridge `fanout_group_id` HMAC pseudonym remediation. Update §27.6.7, §27.8.9, and any related Appendix C event entries; update the §27.6.9 / §27.8.11 ACs to assert the leakage check; add CI test `taxonomy_webhook_no_ops_user_identity_leak` and `abuse_report_webhook_no_ops_user_identity_leak`.
- **Remediation owner hint.** `security`.

#### D-6.2-003 — ~36 §27 webhook events absent from Appendix C (Notification Event Catalog)
- **Class.** `notification`.
- **Location.** Appendix C body (lines 41596–41968); §27.4.9 (5 events); §27.4.11 (2 events); §27.8.9 (11 events); §27.8.12 (4 events); §27.8.13 (5 events); §27.8.14 (1 event); §27.9.9 (10 events); §27.10.7 (2 lifecycle + 2 page-sweep events); §27.11.7 (6 events).
- **Evidence.** Each §27 sub-section that introduces webhook events explicitly says they are "registered in Appendix C and Appendix G" (e.g., §27.4.9 line 22119, §27.6.7 line 22595, §27.8.9 line 23054, §27.9.9 line 23719, §27.10.7 line 24253, §27.11.7 line 24905). Programmatic scan of Appendix C across all 36 named events returns 12 hits and 36 misses (only the 11 `marketplace.abuse_report.*` events and `marketplace.buyer_signal_opt_in.changed` are registered; the rest — including all 5 Match Score lifecycle events, all 4 Evidence Bundle events, all 5 Legal Process events, the Transparency Report event, all 4 Direct Invite events, the 2 Vendor Opt-Out lifecycle events, the §27.11 Promoted/Featured/Verification events — are absent).
- **Why P1.** Appendix C is the canonical Notification Event Catalog (§31 / Authoring Convention #7). Every webhook event must be registered there with severity, user-visibility, and Loops.so template binding. Without the registration, customer-facing subscription clients cannot discover the events via `GET /v1/webhook-subscriptions/available-events` (§34.16.7 Delivery Scope), and the CI test `marketplace_discovery_27_11_webhook_conformance` (§27.11.8 AC #28) cannot pass.
- **Convention violated.** Authoring Convention #7 (Webhooks); §31 contract.
- **Recommendation.** Add §27 webhook events to Appendix C in dedicated event blocks per sub-section. Each event needs `severity ∈ {info, action_required, critical, warning}`, `user_visible vs ops_only` tag, `delivery_audience_scope ∈ {subject, reporter, ops, seller, buyer, all}`, retry-curve class (`webhook_standard` for most; `financial_impact` for any billing-adjacent), and Loops.so template id where customer-visible. Track under a single Phase 6.2 reconciliation entry "v7.1.x §27 Appendix C registration" — Authored Extension. Asserted by CI test `appendix_c_27_event_coverage` (new).
- **Remediation owner hint.** `engineering`.

#### D-6.2-004 — Same 36 §27 webhook events absent from Appendix G (PostHog Event Taxonomy)
- **Class.** `posthog_event`.
- **Location.** Appendix G body; same event set as D-6.2-003 plus the additional PostHog-only observability events: `match_score.render.stale`, `match_score.cache_invalidated`, `match_score.epoch_auto_publish_blocked`, `vendor_opt_out_enforcement_latency_measured`, `vendor_opt_out_registry_unavailable_fail_closed`, `vendor_opt_out_edge_purge_slow_pop`, `vendor_opt_out_authority_submitted`, `vendor_opt_out_authority_verified`, `vendor_opt_out_authority_failed`, `seller_signal_real_time_rate_limit_buffered`, `seller_signal_opt_in_race_detected`, `crm_sync_outbound_suppressed_by_opt_out`, `marketplace_promoted_clicked`, `marketplace_organic_clicked`.
- **Evidence.** §31.8 AC #16 mandates a PostHog parallel for every webhook event with `.` → `_` transliteration. §27.4.9 line 22119, §27.6.7 line 22595, §27.8.9 line 23054, §27.9.9 line 23720, §27.10.7 line 24310, §27.11.7 lines 24913–24914 each say "registered in Appendix G". Programmatic scan across the union of webhook-mirror + observability events shows 26 misses.
- **Why P1.** Appendix G is the canonical PostHog Taxonomy. Without registration, the §31.8 webhook-PostHog parity test (`webhook_posthog_parallel_emission_parity`) fails and dashboards cannot be built.
- **Convention violated.** Authoring Convention #7; §31.8 AC #16.
- **Recommendation.** Add a dedicated Appendix G section "§27 Marketplace Domain Event Additions" with each event's standard property set (residency_scope, plan_tier, console, entity_ref, etc., per Appendix G preamble). Same Phase 6.2 reconciliation entry as D-6.2-003.
- **Remediation owner hint.** `engineering`.

#### D-6.2-005 — 13 §27 enums absent from Appendix J (Controlled Vocabulary Registry)
- **Class.** `enum`.
- **Location.** Appendix J body. Missing enum registrations:
  - `match_score_feedback_kind` (§27.4.11 line 22160; 6 values)
  - `match_score_feedback_review_status` (§27.4.11 line 22165; 6 values)
  - `abuse_evidence_bundle_kind` (§27.8.12 line 23200; 7 values)
  - `abuse_evidence_bundle_ops_confidence` (§27.8.12 line 23205; 4 values)
  - `abuse_evidence_bundle_state` (§27.8.12 line 23208; 6 values)
  - `legal_process_kind` (§27.8.13 line 23292; 9 values)
  - `legal_process_urgency` (§27.8.13 line 23300; 3 values)
  - `legal_process_review_state` (§27.8.13 line 23301; 10 values)
  - `vendor_opt_out_authority_method` (§27.10.2 line 23908; 3 values)
  - `vendor_opt_out_authority_dns_probe_result` (§27.10.2 line 23914; 6 values)
  - `vendor_opt_out_authority_verification_state` (§27.10.2 line 23925; 6 values)
  - `vendor_opt_out_authority_failure_reason` (§27.10.2 line 23926; 11 values)
  - `vendor_opt_out_revocation_reason_code` (§27.10.6.4 line 24213; 6 values)
- **Evidence.** Each enum is referenced inline as "see Appendix J <name>" in §27, but a programmatic scan of Appendix J H3/H4 entries (471 distinct entries; `/tmp/appendix_j.txt`) returns zero matches for any of the above 13 names. Cf. existing Appendix J entries `taxonomy_cascade_disposition` (line 1476, NEW per Phase 12.x) and `taxonomy_retirement_path` (line 1490, NEW) — those WERE registered, demonstrating the convention's enforceability.
- **Why P1.** Authoring Convention #3 — every enum used in §4–§51 must be registered in Appendix J with at least one consumer cited. CI gate `appendix_j_enum_completeness` exists per CLAUDE.md §11; the gate fails for these 13.
- **Convention violated.** Authoring Convention #3 (Enums).
- **Recommendation.** Author each missing enum as an Appendix J H3 / H4 entry with its full value list, citing the §27 sub-section that introduces it. Maintain 1:1 parity with the §27 inline value lists. Order under existing §27.6 / §27.8 / §27.9 / §27.10 / §27.11 enum sections in Appendix J.
- **Remediation owner hint.** `engineering`.

#### D-6.2-006 — Forward-referenced §4.5 entities authored only inline in §27.4
- **Class.** `data_model`.
- **Location.** §27.4.3 (`MarketplaceMatchFeatureRegistry` — "platform-scoped entity authored under §4.5.9 in the follow-on integration phase; the seed content lives here", line 22003); §27.4.5 (`MarketplaceMatchScoreModelVersion` — "new; authored under §4.5.10 in the follow-on integration phase", line 22055); §27.4.2 / §27.4.9 (`MarketplaceMatchScoreSnapshot` — entity referenced extensively but full field table never authored).
- **Evidence.** §27.4.3 ME 22003: "feature set is an Ops-managed registry (`MarketplaceMatchFeatureRegistry`, a new platform-scoped entity authored under §4.5.9 in the follow-on integration phase". §27.4.5 ME 22055: "Every trained model version persists as a `MarketplaceMatchScoreModelVersion` entity (new; authored under §4.5.10 in the follow-on integration phase) with fields: `id`, `version_label`, `residency_scope`, ...". `MarketplaceMatchScoreSnapshot` is the row entity at the heart of §27.4 (every §27.4.10 AC and §27.4.12 API endpoint references it) but its entity table is never authored — fields are scattered across §27.4.2 (cache TTL), §27.4.5 (training-data alias), §27.4.6 (rendering plan-tier rules), §27.4.7 (cache invalidation), §27.4.8 (retention), §27.4.9 (webhook payload), §27.4.10 (acceptance criteria), §27.4.12 (API response shape).
- **Why P1.** Authoring Convention #1 — every entity gets a full field table. Three entities are referenced by FK from authored entities (§27.4.11 `MarketplaceMatchScoreFeedback.snapshot_id`, `MarketplaceMatchScoreFeedback.model_version_id`; §27.4.12 API endpoints) and from §27.4.7 cache invalidation logic. Engineers building §27.4 cannot do so without the full schema.
- **Convention violated.** Authoring Convention #1 (Entity Definition).
- **Recommendation.** Author the three entities in §4.5.x at full §4.4-style fidelity (Field | Type | Constraints | Notes; scope isolation; indexes; retention; residency; DSAR cascade) before v7.1.1 stamp. Mark as Authored Extension and append rows to `_integration/AUTHORED_EXTENSIONS_LEDGER.md`. The forward references in §27.4 should then become hard cross-references.
- **Remediation owner hint.** `engineering`.

#### D-6.2-007 — §27 state machines not catalogued in Appendix L
- **Class.** `state_machine`.
- **Location.** Appendix L body (lines 47639–47960); ten §27 state machines authored inline.
- **Evidence.** Appendix L preamble (line 47641): "Every `status` enum registered in Appendix J that corresponds to a non-trivial lifecycle must have a corresponding state machine table here or an explicit cross-reference to the originating section." §27 state machines in scope: (a) `MarketplaceMatchScoreModelVersion` lifecycle (§27.4.8); (b) `MarketplaceMatchScoreFeedback.applied_ml_review_status` (§27.4.11); (c) `MarketplaceAbuseReport.ops_status` extended values incl. `pending_second_signoff` (§27.8 + §27.8.8); (d) `MarketplaceAbuseEvidenceBundle.investigation_state` (§27.8.12); (e) `MarketplaceLegalProcessIngest.legal_review_state` (§27.8.13); (f) `BuyerSignalOptInRecord.opt_in_state` (§27.9.2); (g) `SellerSignal.k_anon_satisfied` per-row state machine (§27.9.5.1); (h) `MarketplaceProactiveOffer` direct-invite state machine (§27.9.7); (i) `VendorOptOutAuthorityAttestation.verification_state` (§27.10.2); (j) `PromotedListing.status` extended set (§27.11.2). Programmatic scan of Appendix L for any of these entity names returns zero matches except 2 hits on "Vendor Opt-Out" (which point at the existing §4.4.8 row, not the new §27.10.2 attestation state machine).
- **Why P2.** The state machines are present in §27 prose; engineers can build against them. The defect is the compendium-completeness rule and the resulting CI cross-link gap.
- **Convention violated.** Authoring Convention #5 (state machines tabulated; APX-L is the compendium).
- **Recommendation.** Add per-state-machine entries to Appendix L either (a) inline tables that mirror §27, or (b) explicit cross-reference rows pointing to the originating §27 sub-sections. Path (b) is faster and matches the Appendix L preamble's "or an explicit cross-reference" allowance.
- **Remediation owner hint.** `engineering`.

#### D-6.2-008 — Glossary (Appendix K) gap for §27 multi-section terms
- **Class.** `glossary`.
- **Location.** Appendix K (lines 46983–47638).
- **Evidence.** Programmatic scan for §27 multi-section terms returns zero or near-zero hits for: "Hide Sponsored" (used in §27.11.2, §27.11.6, §27.11.8, §3.x UX); "Verification Badge" (§27.11.3, §26.2, §48.x); "VendorOptOutAuthorityAttestation" (§27.10.2, §4.4.8); "MarketplaceAbuseEvidenceBundle" (§27.8.12, §4.5.7); "Legal-Process Ingest" (§27.8.13, §45.x); "Transparency Report" (§27.8.14, §6.x); "Hot-Registry Index" (§27.10.4, §40.x replication); "FTC disclosure" (§27.11.6, §34.16.4); "Featured Lane" (§27.11, §3.x); "distinctiveness veto" (§27.9.5, §48.4.x); "Marketplace Match Score" canonical phrasing; "Coordinated abuse" (§27.8.10, §27.8.12, §48.4); "Cost-Center Firewall" (§27.11.5, §34.16.x).
- **Why P3.** Cosmetic / hygiene; no implementation impact.
- **Convention violated.** Authoring Convention #4 (Glossary; APX-K canonical home per CLAUDE.md §11 amendment).
- **Recommendation.** Add Appendix K entries for the 13 listed terms, citing first-use §27 anchors and any cross-section consumers. Bundle under a single "Phase 6.2 Glossary Additions" block in Appendix K.
- **Remediation owner hint.** `engineering`.

#### D-6.2-009 — Appendix M coverage gaps for §27 surfaces
- **Class.** `surface_engine_mapping`.
- **Location.** Appendix M (lines 47961–end).
- **Evidence.** Spot-check of §27.10.3 17-surface allowlist against Appendix M: most are covered via the consolidated rows ("Marketplace Search & Filtering", "Vendor Opt-Out Global Registry"), but the following discrete surfaces have no APX-M entry:
  - "Hide Sponsored" buyer toggle (§27.11.2 + §27.11.6 G4) — surface introduced by §27.11; not present in APX-M.
  - "Public Transparency Report" (`/transparency/marketplace/:year-:half`) (§27.8.14) — not in APX-M.
  - "Pre-flight Scope Report" Ops Console (§27.6.6) — not in APX-M.
  - "Score-Drift & Fairness Dashboard" Ops Console (§27.4.11) — present in APX-M as "Match Score Drift & Fairness Dashboard" (line 48188); naming inconsistency. P3.
  - "Featured Lane visual separation" (§27.11.6 G3) — not enumerated as a surface; combined with FeaturedPlacement entry.
  - "Bid window modal" / weekly-bid-submission flow (§27.11.2) — not in APX-M.
- **Why P1.** §27.10.9 AC #14 + #26 require the CI test `vendor_opt_out_surface_allowlist_invariant` to fail the build if a new surface emitting Seller identity is missing from §27.10.3 — and §M.4 `appendix_m_coverage_on_diff` CI gate requires every UI surface or engine concept to have an APX-M row. Either gate firing without these entries blocks deploys.
- **Convention violated.** Authoring Convention #12 (Surface/Engine Mapping); §M.4 CI gate.
- **Recommendation.** Author missing rows in Appendix M.1 and reconcile naming inconsistencies. Use the Phase 6.2 Authored Extension reconciliation entry.
- **Remediation owner hint.** `engineering`.

#### D-6.2-010 — Reporter-audience webhook suppression under non-disclosure legal process is unstated
- **Class.** `firewall_leakage`.
- **Location.** §27.8.13 (lines 23325–23332).
- **Evidence.** §27.8.13 line 23327: "Subject Org webhooks for the bound abuse report or subject (if linked) MUST be suppressed; the standard `marketplace.abuse_report.*` fan-out is replaced by a `legal_process_pending` placeholder visible only to Ops." This says "Subject Org webhooks" only. §27.8.9 webhook table specifies that `marketplace.abuse_report.upheld`, `marketplace.abuse_report.dismissed`, and other resolution-path events are delivered to BOTH the Subject's Seller Org AND the Reporter's Org. If a non-disclosure court order is layered on top of an existing abuse report (§27.8.13 "Linkage to existing abuse reports"), the legal-induced takedown OVERRIDES the appeal AND transitions to `upheld` — but §27.8.13 does NOT explicitly suppress the reporter-audience copy of the resolution event. Net effect: the reporter's webhook subscriber learns the report was upheld and may infer the existence and timing of a legal process — the exact information the non-disclosure order is meant to keep secret.
- **Why P1.** A reporter learning that their abuse report just resolved as `upheld` while the subject's identity is hidden under a court-order takedown gives the reporter signal that the platform is acting under legal process. In adversarial conditions (e.g., the reporter is a state actor or competitor), this is a non-disclosure-violation vector. Even if benign, it leaks investigation existence to a non-Ops party.
- **Convention violated.** §27.8.13 non-disclosure invariant; "non-disclosure" carries an obligation to ALL non-Ops, non-counsel parties, not only the subject.
- **Recommendation.** Update §27.8.13 to assert: "When `non_disclosure_flag = true`, ALL customer-audience webhook fan-out (subject AND reporter) for the linked abuse report MUST be suppressed; only Ops-audience deliveries fire. The reporter receives a generic post-`non_disclosure_expires_at` notification 'Your report has been processed' with no temporal correlation to the actual closure time." Update §27.8.13 Acceptance Criteria #2 to assert reporter-audience suppression. Add CI test `legal_process_non_disclosure_reporter_audience_suppression`.
- **Remediation owner hint.** `legal`.

#### D-6.2-011 — Non-disclosure expiration "subject notification within 24 hours" lacks reporter-side parity
- **Class.** `firewall_leakage`.
- **Location.** §27.8.13 (line 23333) "Expiration of non-disclosure".
- **Evidence.** ME 23333: "On `non_disclosure_expires_at`, the flag auto-lifts; subject MUST be notified of the prior hide within 24 hours via an Ops-authored notification". The reporter is not addressed. Combined with D-6.2-010, the reporter has been receiving suppressed events the whole time; the §27.8.13 expiration handling does not enumerate whether the reporter's now-deferred webhooks should fan out at expiration or remain suppressed.
- **Why P1.** Same root cause as D-6.2-010 — reporter-audience handling under non-disclosure is unspecified end-to-end.
- **Convention violated.** §27.8.9 Subscription model + §27.8.13 non-disclosure invariant.
- **Recommendation.** Update §27.8.13 expiration paragraph to specify reporter-audience behavior (e.g., reporter receives a single deferred resolution event at `non_disclosure_expires_at + 24h` with no temporal correlation to the actual Ops decision time).
- **Remediation owner hint.** `legal`.

### P2 — Ambiguous to a thoughtful reader

#### D-6.2-012 — `seller_signal_suppressed_reason` enum naming inconsistency: `distinctiveness_veto` (§27.9.5) vs `tuple_distinctiveness_threshold_exceeded` (Appendix J via §4.4.18 D-1.3-001 remediation)
- **Class.** `consistency_drift`.
- **Location.** §4.4.18 line 5630 (Appendix J `seller_signal_suppressed_reason` registration); §27.9.5 line 23600.
- **Evidence.** §4.4.18 enum registration: `k_anon_floor_not_met`, `tuple_distinctiveness_threshold_exceeded` (D-1.3-001 remediation, 2026-05-01), `buyer_opt_out`, `residency_mismatch`, `vendor_opt_out`, `expired`. §27.9.5 stage 5 line 23600: `suppressed_reason='distinctiveness_veto'`. The two names refer to the same concept; engineers cannot determine which is canonical.
- **Why P2.** A staff engineer can resolve this from context but a junior engineer building the suppression path cannot. CI test `seller_signal_suppressed_reason_canonical_value` would currently fail for either inline string.
- **Convention violated.** Authoring Convention #3 (canonicality across consumers).
- **Recommendation.** Update §27.9.5 / §27.9.5.1 / §27.9.6 / §27.9.12 / §27.9.13 to use `tuple_distinctiveness_threshold_exceeded` per the D-1.3-001 remediation that established the canonical name. Single-source the value via a pointer to Appendix J `seller_signal_suppressed_reason`.
- **Remediation owner hint.** `engineering`.

#### D-6.2-013 — `recompute_deadline_exceeded` introduced in §27.9.5 without Appendix J extension to `seller_signal_suppressed_reason`
- **Class.** `enum`.
- **Location.** §27.9.5 line 23609.
- **Evidence.** §27.9.5 line 23609: "timeout of this synchronous recompute past a hard 5-second deadline forces `suppressed_reason='recompute_deadline_exceeded'` (new enum — Appendix J extension to `seller_signal_suppressed_reason`)". Appendix J `seller_signal_suppressed_reason` value list (§4.4.18 line 5630) does NOT include `recompute_deadline_exceeded`.
- **Why P2.** Authored Extension was flagged inline but the actual Appendix J value addition is missing.
- **Convention violated.** Authoring Convention #3.
- **Recommendation.** Add `recompute_deadline_exceeded` to the `seller_signal_suppressed_reason` enum in Appendix J in the same edit that closes D-6.2-005.
- **Remediation owner hint.** `engineering`.

#### D-6.2-014 — `k_anon_satisfied` per-row state machine introduces 8 new state values without enum registration
- **Class.** `enum`.
- **Location.** §27.9.5.1 (lines 23615–23633).
- **Evidence.** §27.9.5.1 enumerates the per-row state values: `unevaluated`, `satisfied`, `suppressed_k_anon`, `suppressed_distinctiveness`, `suppressed_residency`, `suppressed_k_anon_at_delivery`, `suppressed_distinctiveness_at_delivery`, `suppressed_vendor_opt_out_at_delivery`, `suppressed_recompute_deadline`, `expired`, `soft_deleted` (11 values). The §27.9.5.1 preamble describes `k_anon_satisfied` as a "computed boolean" but the state machine table shows ≥10 distinct states — these cannot all be represented in a boolean. There is no registered enum (e.g., `seller_signal_k_anon_state`) in Appendix J carrying these values.
- **Why P2.** Engineers reading "boolean" but seeing a 10-state state machine cannot implement consistently.
- **Convention violated.** Authoring Convention #3 + #5.
- **Recommendation.** (a) Author Appendix J enum `seller_signal_k_anon_state` with the 11 values. (b) Update §27.9.5 / §27.9.5.1 to use the enum instead of describing `k_anon_satisfied` as a boolean. (c) Update the §4.4.18 SellerSignal field schema to add the enum-typed column alongside the boolean. Authored Extension; flag in `_integration/AUTHORED_EXTENSIONS_LEDGER.md`.
- **Remediation owner hint.** `engineering`.

#### D-6.2-015 — `MarketplaceProactiveOffer` referenced in §27.9.8 but never authored as an entity
- **Class.** `data_model`.
- **Location.** §27.9.8 (line 23698).
- **Evidence.** §27.9.8 line 23698: "**Entity.** `MarketplaceProactiveOffer` (existing sub-resource from §27.3 Vendor Discovery — reused; NOT redefined here) with new `offer_kind='direct_invite_from_cohort'` enum value and new `source_seller_signal_id` FK pointing to the SellerSignal cohort that originated the offer." §27.3 Vendor Discovery (lines 21952–21974) does NOT author a `MarketplaceProactiveOffer` entity — §27.3 is the search & filtering surface only. Programmatic grep of the Master Spec for `MarketplaceProactiveOffer` returns hits only in §27.9.8, §27.9.9, §27.9.10, §27.9.13 — never an entity field table.
- **Why P2.** Engineers building Direct Invite from Cohort cannot reference the entity schema.
- **Convention violated.** Authoring Convention #1.
- **Recommendation.** Either (a) author `MarketplaceProactiveOffer` as a §4.5.x entity with full field table, scope isolation, indexes, retention, DSAR; or (b) remove the "existing" claim from §27.9.8 and clearly mark as Authored Extension new entity. Path (a) preferred.
- **Remediation owner hint.** `engineering`.

#### D-6.2-016 — §27.9.6.2 inline restatement of digest cadence vs §34.1.2 single-source cell
- **Class.** `numerical_singleton`.
- **Location.** §27.9.6.2 (line 23657).
- **Evidence.** §27.9.6.2 line 23657: "monthly digest on seller_starter, weekly on seller_growth+, real-time on seller_scale+ — the cadence field is the same row, cadence derives from plan at dispatch time". §34.1.2 cell **Seller Signals** is the authoritative single home for plan-tier-cadence binding. §27.9.6.2 restates the cadence inline.
- **Why P2.** Risk of plan-tier drift if §34.1.2 is updated without §27.9.6.2 being touched.
- **Convention violated.** Authoring Convention #10.
- **Recommendation.** Replace inline cadence list with `"per §34.1.2 cell **Seller Signals**"` citation. Add `seller_signal_cadence_single_source` deploy-time validator analogous to `solo_envelope_value_single_source` (§44.6.8 #13).
- **Remediation owner hint.** `engineering`.

#### D-6.2-017 — `webhook_delivery_audience_scope` referenced as "new §31 extension" but Appendix J §27.8 extension may not yet enumerate the seller / buyer scope values
- **Class.** `enum`.
- **Location.** §27.8.9 (line 23099); §27.10.7 (line 24306–24310).
- **Evidence.** §27.8.9 line 23099: "Subscribers can filter audiences per the webhook subscription's `delivery_audience_scope` field (new §31 extension, authored in this phase's reconciliation log)". Appendix J `webhook_delivery_audience_scope` entry exists (line 1542) per the Phase 6 §27.8 additions; values appear to cover `subject`, `reporter`, `ops`. The §27.10.7 family adds `seller` and `buyer` audience-scope dimensions that may not be in the original enum value set.
- **Why P2.** Engineers cannot determine the canonical value list without reading the reconciliation log; CI gate for value-set parity does not exist.
- **Convention violated.** Authoring Convention #3.
- **Recommendation.** Open `_integration/RECONCILIATION.md → Phase 6 → §27.8.9 webhook delivery audience scope` and confirm whether the Appendix J value list matches the union of values used by §27.8.9 and §27.10.7. If gaps exist, extend Appendix J. Add CI test `webhook_delivery_audience_scope_consumer_coverage`.
- **Remediation owner hint.** `engineering`.

#### D-6.2-018 — §27.4.6 / §27.4.10 / §27.4.12 mobile-divergence behavior unspecified
- **Class.** `mobile_divergence`.
- **Location.** §27.4.6 (Provenance panel), §27.11.8 AC #37 (`marketplace_mobile_parity_360px` covers Promoted/Featured but not Match Score provenance panel).
- **Evidence.** §27.11.8 AC #37 says: "Every Promoted and Featured surface renders correctly at 360px viewport width; FTC labels remain visible at default zoom". §27.4.6 provenance panel rendering rules per plan tier are silent on mobile — does the SHAP-style provenance panel collapse to a sheet, drawer, or modal on mobile? Does the qualitative-label fallback apply at viewport breakpoints?
- **Why P2.** A staff engineer can resolve from §3 UX patterns but the resolution is not the same across two readers.
- **Convention violated.** Edge-case discipline: mobile vs desktop divergence.
- **Recommendation.** Add §27.4.6 mobile-rendering subsection or an AC #6 in §27.4.10 mandating mobile parity for the qualitative label and a sheet-style provenance panel on Growth+ mobile. Reuse `UX_Design_of_Sourcera.md` mobile token set.
- **Remediation owner hint.** `design`.

#### D-6.2-019 — `frequency_cap_bypass_suspected` Ops-only webhook event named in §27.11.2 failure mode #4 but not in §27.11.7 webhook catalog
- **Class.** `notification`.
- **Location.** §27.11.2 (line 24527); §27.11.7 webhook catalog (lines 24905–24914).
- **Evidence.** §27.11.2 failure mode #4 line 24527: "cross-Org attempts (shell Orgs) are downstream Ops anti-fraud concern and surfaced via `marketplace_discovery.frequency_cap_bypass_suspected` (Ops-only webhook, Appendix C extension)." §27.11.7 webhook catalog enumerates only `promoted_listing.created`, `promoted_listing.paused`, `promoted_listing.exhausted`, `verification.review_completed`, `featured_placement.activated`, `featured_placement.expired`. The `marketplace_discovery.frequency_cap_bypass_suspected` event is named but not catalogued.
- **Why P2.** Ops cannot subscribe to an undocumented event.
- **Convention violated.** Authoring Convention #7.
- **Recommendation.** Add `marketplace_discovery.frequency_cap_bypass_suspected` to the §27.11.7 webhook catalog table with payload shape; register in Appendix C as Ops-only.
- **Remediation owner hint.** `engineering`.

#### D-6.2-020 — `verification_review_record.tier_requested = certified` two-reviewer enforcement: secondary reviewer field not in §4.4.21 schema confirmation
- **Class.** `data_model`.
- **Location.** §27.11.8 AC #16 (line 24958).
- **Evidence.** §27.11.8 AC #16 line 24958: "A `verification_review_record.tier_requested = certified` MUST receive `approved` or `denied` action by two distinct Ops users (`reviewer_user_id` ≠ `secondary_reviewer_user_id`); same-user sign-off rejected with `verification_two_reviewer_required`". The §4.4.21 entity field table (lines 6020–6066) carries `reviewer_user_id` but `secondary_reviewer_user_id` was not confirmed in spot-check; need verification.
- **Why P2.** If the field does not exist in the entity schema, the AC is unbuildable.
- **Convention violated.** Authoring Convention #1.
- **Recommendation.** Read §4.4.21 in full and verify the field exists; if absent, add it as Authored Extension. Add the corresponding error code `verification_two_reviewer_required` to Appendix I.
- **Remediation owner hint.** `engineering`.

#### D-6.2-021 — §27.5 EOI Acceptance one-click flow and audit-trailing not authored in §27.5
- **Class.** `acceptance_criteria`.
- **Location.** §27.5 (lines 22345–22370); §4.5.8 EOI Acceptance Record (referenced).
- **Evidence.** Audit prompt CHECK 6 asks: "EOI Acceptance Record one-click flow is audit-trailed." §27.5 authors EOI content, vendor-side Accept / Decline / Request-Info, and post-listing-close auto-rejection. The "one-click acceptance" flow is asserted in §27.4.10 AC #12 ("`eoi_record_id` snapshot MUST persist `match_score_at_acceptance`") and in §4.5.8 EOI Acceptance Record (referenced from §27.4 / §27.9). §27.5 does NOT explicitly enumerate the audit-trail invariants for the buyer's one-click acceptance. Specifically: §27.5 has no AC block; the only ACs covering EOI live in §27.7 (general top-level ACs) and they cite §4.5.2 state machine but do not specify the click-trail audit requirements.
- **Why P2.** A staff engineer can derive the audit requirements from §4.6.1 Audit Event + §4.5.8 EOI Acceptance Record schemas; a junior engineer building only §27.5 cannot.
- **Convention violated.** Authoring Convention #2.
- **Recommendation.** Add §27.5 acceptance-criteria block (numbered) explicitly asserting the §4.5.8 / §4.6.1 audit-trail invariants for one-click EOI acceptance: (a) every accept click writes a `marketplace.eoi.accepted` event AND an `EOIAcceptanceRecord` row in the same transaction; (b) the audit row carries the buyer Org user, the seller Org, the originating surface, and the timestamp; (c) in dual-console scenarios, the cross-bridge fanout writes are atomic with the local row insert.
- **Remediation owner hint.** `engineering`.

### P3 — Cosmetic / hygiene

#### D-6.2-022 — §27 self-citation drift: "§27.10 Verification Tiers" appears in §34.1 cells line 28666 but Verification Tiers actually live in §27.11.3 / §26.2 / §4.4.21
- **Class.** `consistency_drift`.
- **Location.** §34.1 line 28666: "Verified-tier eligibility, email support, $199 per-bid alternative — is governed by §44 (Solo-Tier Surface Treatment, Phase 14.10), §22 (Seller KB), §22.20 (Seller Surface Compression, Phase 14.8), **§27.10 (Verification Tiers)**, and Appendix M (Surface/Engine Mapping)."
- **Evidence.** §27.10 is "Vendor Opt-Out Global Registry"; Verification Tiers product behavior lives in §27.11.3, §26.2, and §4.4.21.
- **Why P3.** Cosmetic; readers can resolve to the correct anchor in context.
- **Recommendation.** Replace `§27.10 (Verification Tiers)` with `§27.11.3 / §26.2 / §4.4.21 (Verification Tiers)`.
- **Remediation owner hint.** `engineering`.

#### D-6.2-023 — Appendix M row "Match Score Drift & Fairness Dashboard" naming differs from §27.4.11 prose "Score-Drift & Fairness Dashboard"
- **Class.** `consistency_drift`.
- **Location.** Appendix M (line 48188); §27.4.11 (lines 22141–22202).
- **Evidence.** APX-M row 48188: "Match Score Drift & Fairness Dashboard". §27.4.11 prose: "Score-Drift & Fairness Dashboard".
- **Why P3.** Hygiene only.
- **Recommendation.** Choose a canonical name and propagate. Recommend "Score-Drift & Fairness Dashboard" (matches §27.4.11 prose).
- **Remediation owner hint.** `engineering`.

#### D-6.2-024 — §27.10.6 path convention note acknowledges shorthand "POST /v1/opt-outs" mismatch but the §27.11.7 endpoint table uses the same shorthand
- **Class.** `consistency_drift`.
- **Location.** §27.10.6 line 24054; §27.11.7 endpoint table (lines 24736–24766).
- **Evidence.** §27.10.6 line 24054: "This prompt's requirement of "POST /v1/opt-outs" is treated as shorthand for `/api/v1/opt-outs`; the RECONCILIATION log notes this mapping." §27.11.7 endpoint table uses `/v1/seller/marketplace/promoted-listings`, `/v1/buyer/marketplace/...`, etc. (no `/api` prefix), while the rest of §32 uses `/api/v1/`.
- **Why P3.** Hygiene only.
- **Recommendation.** Normalize §27.11.7 to `/api/v1/...`. Cross-reconcile with §32 endpoint canonical paths.
- **Remediation owner hint.** `engineering`.

#### D-6.2-025 — `seller_marketing_editor` referenced as a role in §27.11.2 (line 24466) and §27.6.2 (line 22388), but its first registration is via Appendix J §27.6 cluster
- **Class.** `glossary_canonicality`.
- **Location.** §27.11.2 line 24466.
- **Evidence.** §27.11.2 line 24466: "Seller Console → Marketplace Discovery → Promoted Listings (role: `seller_billing_admin` OR `seller_marketing_editor`; §4.4.10, Appendix J)". §27.6.2 line 22388 introduces `ops_marketing_editor` (Ops role, distinct). Both names share the "_marketing_editor_" pattern but operate in distinct consoles. Risk of confusion in audit-event role assertions.
- **Why P3.** Hygiene only; reviewers can disambiguate.
- **Recommendation.** Add Appendix K disambiguation note for the two roles (Seller Marketing Editor vs Ops Marketing Editor).
- **Remediation owner hint.** `engineering`.

---

## 4. Counterfactual Failure-Mode Pass

For each in-scope feature, three realistic failure modes were enumerated and confirmed addressed (or filed as a defect when not):

**§27.4 Marketplace Match Score**
1. Hot-registry stale snapshot delivers an opted-out seller's score → §27.4.7 60s staleness SLO + §27.10.4 60s live-render check; addressed.
2. Adversarial seller floods feedback with `score_too_high` to game the model → §27.4.11 rate limit (20/Org/24h) + SIM clustering; addressed.
3. Cold-start residency scope serves the v1 baseline forever (training data never accumulates) → §27.4.4 cold-start ≤ 90 days; addressed.

**§27.5 EOI**
1. Listing closes mid-EOI-creation race → §27.5 + §4.5.2 state machine; addressed (auto-reject `listing_closed`).
2. Buyer Workspace Owner who created the EOI is DSAR-erased before vendor accepts → §27.4.10 AC #12 EOI-Review trigger writes the `EOIAcceptanceRecord.match_score_at_acceptance` snapshot atomically with the EOI insert per §27.9.7 → §6.8.5 audit-integrity exemption preserves the snapshot; addressed.
3. EOI accept clicked twice within 200ms → §27.10.6 idempotency + §27.4.10 AC #16 idempotency-keyed (no duplicate AIOperation); addressed.

**§27.8 Marketplace Abuse & Takedown**
1. Coordinated false-flag campaign by competitor → §27.8.10 fm #1 + §27.8.12 SIM signature `competitor_reporter_clustering`; addressed.
2. Ops disposition effect fails to apply within 5 minutes (edge-cache lag) → §27.8.10 fm #5 + `disposition_effect_slo_breach` paging webhook; addressed.
3. Reporter-audience webhook leaks legal-process existence under non-disclosure → **D-6.2-010** (P1, NOT addressed).

**§27.9 Seller Signals**
1. Buyer revokes opt-in mid-Signal-Period after delivery → §27.9.13 fm #6; addressed.
2. Distinctiveness threshold tuned too aggressively → §27.9.12 AC #25 quarterly Trust & Safety review; addressed.
3. CRM Sync outbound fires before vendor opt-out is recognized → §27.10.3 Surface #16 source-side drop; addressed.

**§27.10 Vendor Opt-Out Global Registry**
1. Hot-registry replication lag → §27.10.4 fail-closed; addressed.
2. Mass-opt-out thundering herd against CDN → §27.10.11.2 debounce + global TTL fallback; addressed.
3. Seller writes opt-out, transfers SellerOrg ownership → §27.10.11.10 transfer-flow Ops review; addressed (Authored Extension flagged).

**§27.11 Marketplace Discovery Pricing**
1. Two sellers race for last category slot → §27.11.2 fm #2 `SELECT ... FOR UPDATE`; addressed.
2. Seller verification tier regresses while Featured Placement is live → §27.11.9.20 (Authored Extension); flagged but not yet authored — converged in D-6.2-009 dependency on `FeaturedPlacement` runtime re-check.
3. Promoted Listing eligibility passes at submit, fails 3h later → §27.11.2 fm #7 + §27.11.8 AC #8 02:00 UTC daily re-check; addressed.

---

## 5. Self-Challenge Pass

Each defect filed above was re-read as a hostile reviewer.

- D-6.2-001 evidence is reproducible (line numbers cited; severity rule-based per the conflicting numerical-singleton class).
- D-6.2-002 (Ops user identity in webhooks): hostile reviewer would press on whether `authored_by_ops_user_id` is opt-in subscription only. Re-read §27.6.7 confirms: "Any customer Org MAY subscribe to taxonomy events ... There is no per-plan-tier gate". So every subscriber gets the field. Confirmed P1 — but elevated severity check: if the actor user is `ops_taxonomy_admin`, do the leaked UUIDs allow correlation to Sourcera staff via other webhook event payloads? Yes — `authored_by_ops_user_ids[]` appears in `taxonomy.category_deprecated`, `taxonomy.category_retired`, AND `marketplace.abuse_report.seller_banned` (`signed_by_ops_user_ids[]`). The same UUID surfaces across multiple events to the same subscriber Org. P1 stands; not P0 because no PII other than UUID is leaked, and the UUID is not directly resolvable to a name from the customer side without out-of-band correlation.
- D-6.2-003 / D-6.2-004 / D-6.2-005: programmatic scan output is reproducible (bash grep with explicit event/enum names).
- D-6.2-007 (state machines absent from APX-L): hostile reviewer asks whether APX-L preamble's "or an explicit cross-reference" allowance applies and whether §27 state machines satisfy that. Re-read APX-L preamble: "must have a corresponding state machine table here OR an explicit cross-reference to the originating section". §27 has the tables; APX-L has neither tables nor cross-references for any of the 10 listed entities. P2 stands.
- D-6.2-009 (Appendix M coverage): hostile reviewer asks whether §M.4 CI gate would actually fail. The override path is the `@appendix-m-internal-only:` PR-description annotation; without it, the gate fails. P1 stands.
- D-6.2-010 / D-6.2-011 (non-disclosure reporter audience): hostile reviewer asks whether the reporter's webhook subscription server-side filter (per §27.8.9 line 23155) auto-scopes to `reporter_org_id = subscribing_org_id` — yes — and whether the suppression rule in §27.8.13 line 23327 covers reporter audience. Re-read confirms the rule says ONLY "Subject Org webhooks ... MUST be suppressed". P1 stands.
- D-6.2-012 (`distinctiveness_veto` vs `tuple_distinctiveness_threshold_exceeded`): the §4.4.18 enum registration explicitly cites D-1.3-001 remediation 2026-05-01 — the canonical name was set by the remediation. §27.9 still uses the pre-remediation name. P2 stands; remediation is straightforward.

No findings revised down to a lower severity.

---

## 6. Coverage-Matrix Updates

Coverage matrix cells to update for §27 features (see §7 below):

- §27.4 Match Score: data_model `⚠ partial` (forward-referenced entities — D-6.2-006); enum `❌` (D-6.2-005); webhook `❌` (D-6.2-003); posthog_event `❌` (D-6.2-004); state_machine `⚠ partial` (D-6.2-007); error_code `❌` (D-6.2-005 partial); plan_gating ✅; retention ✅; dsar ✅; residency ✅; console_firewall ✅; surface_engine_mapping ⚠ partial (D-6.2-009); accessibility / mobile_parity `❌` (D-6.2-018); api ✅; observability ✅.
- §27.5 EOI: acceptance_criteria `⚠ partial` (D-6.2-021).
- §27.6 Taxonomy / Vocab: most cells ✅; webhook `⚠ partial` (D-6.2-002 firewall leakage, D-6.2-003 catalog).
- §27.8 Abuse & Takedown: enum `⚠ partial` (D-6.2-005 evidence-bundle / legal-process); webhook `⚠ partial` (D-6.2-003); console_firewall `⚠ partial` (D-6.2-002, D-6.2-010, D-6.2-011); state_machine `⚠ partial` (D-6.2-007); numerical_singleton `❌` (D-6.2-001).
- §27.9 Seller Signals: enum `⚠ partial` (D-6.2-012, D-6.2-013, D-6.2-014); data_model `⚠ partial` (D-6.2-015); webhook `❌` (D-6.2-003); posthog_event `❌` (D-6.2-004); plan_gating `⚠ partial` (D-6.2-016).
- §27.10 Vendor Opt-Out: enum `❌` (D-6.2-005 — 5 attestation enums); webhook `❌` (D-6.2-003 — vendor.opted_out, vendor.opted_in); error_code `❌` (D-6.2-005 partial — 13 missing); console_firewall ✅; retention ✅; dsar ✅; residency ✅; api ✅; observability ✅.
- §27.11 Discovery Pricing: webhook `❌` (D-6.2-003 — 6 missing); posthog_event `❌` (D-6.2-004); enum ✅ (registered via §4.4.19 / §4.4.20 / §4.4.21 paths); plan_gating ✅; surface_engine_mapping `⚠ partial` (D-6.2-009).

---

## 7. Promotion to Defect Ledger

All 25 findings (D-6.2-001 through D-6.2-025) are promoted to `DEFECT_LEDGER.md` in the canonical pipe-table row format defined in `Audit_Prompts.md → Defect Ledger Format`. Severity distribution: 0 P0, 11 P1, 10 P2, 4 P3.

The 60-second §27.10.4 latency budget invariants and the cross-Surface allowlist enforcement (§27.10.9 AC #14 / #26) are confirmed reproducible against the spec as written; opt-out cascades into §22 (Seller KB), §26 (Seller Profile), §27.4 (Match Score), §27.9 (Seller Signals), and §48 (PLG loops) honor the registry correctly. No P0 vendor-opt-out leak surfaced.

The §27.8.4 vs §42.3.1 SLA conflict (D-6.2-001) is the highest-leverage P1 defect — engineering must build to one or the other, and finance / compliance reviewers reading §42.3.1 will see a different value than engineers reading §27.8.4.
