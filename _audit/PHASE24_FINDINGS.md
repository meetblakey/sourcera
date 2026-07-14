# Phase 24 — §24 Seller Console: Q&A, NDA, Inbox & Pulse Walk — Scratch Findings Log

**Date:** 2026-05-06
**Auditor model:** Claude Opus
**Audit prompt:** Walk Master Spec §24. Confirm Q&A visibility per NDA state, inbox aggregation, Pulse score math (separate from buyer Pulse), retention, residency.
**Status:** Findings promoted to `DEFECT_LEDGER.md → Phase 24` section. This file is the scratch artifact retained per audit-program protocol.

---

## Sources Read (in full)

- `Sourcera_Master_Spec.md` §24.1 Seller Q&A (lines 19450–19459), §24.2 NDA Module & Execution (19461–19500), §24.3 Seller Inbox (19502–19514), §24.4 Seller Pulse (19516–19527), §24.5 Seller Analytics (19529–19537), §24.6 Acceptance Criteria (19539–19545).
- §4.5.3 NDA Record (Marketplace Domain) (lines 6761–6783) — full field table.
- §18.1–§18.8 Q&A Threads (14792–15015) — full lifecycle, phase-gating, visibility, schema, plan limits, ACs.
- §20.1–§20.7 Inbox & Pulse (Buyer-side) (15257–15583) — Inbox structure (20.2), Pulse Health Score formula (20.3), Pulse Digest Email (20.4), In-App Pulse Widget (20.5), Notification Preferences (20.6), Acceptance Criteria (20.7).
- §17.1–§17.8 Workspace Analytics (Buyer-side) (14543–14790) — Phase-aware metric availability, drill-down, real-time updates, exports, ACs.
- §4.3.22 Inbox Item Group (4515–4565) — Org-Scoped, Buyer (no Seller equivalent).
- §4.3.15 Unread Marker (4110–4158) — Cross-Console; covers `qa_thread`, `internal_comment_thread`, `inbox_item_group` thread_type values.
- §4.7.1 Console Bridge Event lines 7836 (`nda_executed` carried payload row), 7741 (`event_kind` enum), 7904 (Retention Classes), 7908 (`bridge_event_financial_class` includes `nda_executed`).
- §1.5 Single-Operator Mode invariants — §1.5 #6 line 19050 ("Compute and persist Seller Pulse (§24.4) and any seller-side analytics (§24.5) per Bid Workspace tick regardless of the rendered surface").
- §1.5 #4 line 19067 (Buyer-driven seller transitions surface via §24.3 Seller Inbox).
- §29.1 Notification Event Catalog (24990–25023) — `nda_signature_requested` registered; no other NDA / Seller Inbox / Seller Pulse events.
- Appendix C `nda_request` (line 41511).
- §38 Mobile Parity Matrix (31043–31078) — covers Q&A reply (seller), NDA Execution, Seller Inbox, Seller Pulse; **no row for §24.5 Seller Analytics**.
- §47/Appendix M.1 surface/engine rows for §24.1 Seller Q&A (48073), §24.2 NDA Module & Execution (48074), §24.3–24.5 Seller Inbox / Pulse / Analytics collapsed into a single row (48075).
- Targeted greps: `Buyer Pulse`, `pulse score`, `seller_pulse`, `nda_signed_at`, `nda_version_id`, `nda_status` enum, `seller_inbox_item_kind`, `qa_visibility`, `nda_required` (§4.5.3 Marketplace Domain).

## Cross-Reference Walk — Per-Check Results

### Check 1: Q&A visibility per NDA state — §24.1 vs §18 vs §6.7 vs §4.5.3 NDA Record

**Result:** §24.1 line 19452 cross-references "Section 17" for buyer Q&A behavior, but §17 is Workspace Analytics; §18 is Q&A Threads. Broken cross-reference. NDA-state conditioning on Q&A visibility is undefined: §18.2.1 phase-gates Q&A (Phase 6+) and §10 phase-gates NDA execution (Phase 4→5), so the implicit chain is "phase 6 ⇒ phase 5 ⇒ NDA executed," but the contract is not stated. §4.5.3 NDA Record has `nda_status ∈ {draft, pending_buyer, pending_seller, executed, expired}` — the `expired` transition has no behavioral implication on prior Q&A visibility. NDA "Request Changes" (§24.2) leaves the Bid Workspace in `nda_status=pending` with vendor seeing the buyer's earlier-shared NDA document (since `nda_document_url` is populated at upload time per §24.2 step 1) but unable to advance to Phase 5; whether the vendor can read Q&A threads created on the buyer side in this state is silent. → **D-24-001** filed (broken cross-reference); **D-24-002** filed (NDA-state conditioning silent); **D-24-003** filed (Phase 8 read-only contradicts §18.2.1).

§24.1 also says "Vendor cannot post questions to themselves" — but §18.2.2 makes Q&A creation `requirement_id`-scoped, not vendor-scoped. The §24.1 sentence is meaningless on its face (a vendor cannot post questions to themselves regardless), and it omits the §18.2.3 50-question/vendor/workspace limit that the seller side must enforce on every "Ask Question" CTA. → **D-24-004** filed.

### Check 2: Inbox aggregation — §24.3 vs §4.3.22 Inbox Item Group vs §29.1 vs §20.2

**Result:** Seller Inbox has no entity definition. §4.3.22 Inbox Item Group is explicitly "Org-Scoped, Buyer". No `SellerInbox`, `SellerInboxItem`, `SellerInboxItemGroup`, `seller_inbox_item_kind` enum exists in §4. §24.3 lists 7 item types (new buyer requirements, amendment re-verification requests, Q&A responses, KB review-due, document-library expiry, NDA signature requests, phase transitions) — none registered against Appendix J `seller_inbox_item_kind`, none cross-referenced to §29.1 Notification Event Catalog rows, none surfacing the §29.1 `Recipients` / `Default Delivery` columns. The §24.3 priority sort scheme "action required > updates > info" (3 buckets) drifts from the §20.2 buyer-side priority taxonomy "1=high, 2=medium, 3=low". §1.5 #4 line 19067 commits the §24.3 Seller Inbox as the canonical surfacing path for buyer-driven phase transitions, but §24.3 declares no `inbox_item_kind=phase_advanced` row. → **D-24-005** filed (no entity); **D-24-006** filed (no aggregation/sort/filter/pagination/SLA contract); **D-24-007** filed (priority taxonomy drift); **D-24-008** filed (no §29.1 / Appendix C registration); **D-24-009** filed (no plan-tier gating).

### Check 3: Pulse score math — §24.4 vs §20.3 (Buyer Pulse) vs §1.5 #6

**Result:** §24.4 declares Seller Pulse as "Health dashboard for Bid Workspace Owners" with six metric bullets (response progress %, pending re-verification count, upcoming deadlines, KB health status, phase progress, team status) and asserts "Seller Pulse is the inverse of Buyer Pulse — it shows seller bottlenecks instead of buyer bottlenecks." Three things are missing: (a) **no Health Score formula** at all (versus §20.3.1's explicit `0.3·SLA + 0.3·Scoring + 0.2·Response + 0.2·Velocity` weighted-average); (b) **no normalization band, no color thresholds, no trend chart, no Phase-12 lock**; (c) **no compute cadence** (versus §20.3.4 daily 9am UTC). §24.6 then asserts "Seller Pulse updates in real-time as responses are submitted" — a cadence that contradicts §20.3.4 (daily) and is unannotated against §44.1 SLO bands.

§1.5 #6 line 19050 commits "Compute and persist Seller Pulse (§24.4) and any seller-side analytics (§24.5) per Bid Workspace tick regardless of the rendered surface" — implying both an engine and a Solo-Mode surface-suppression contract exists. Neither is authored in §24.4: there is no `SellerBidWorkspacePulseHealth` entity, no per-tick computation contract, no engine/surface split for Solo seller. The phrase "Bid Workspace tick" itself has no §44 / §22 / §51 definition. → **D-24-010** filed (no score formula — feature unbuildable); **D-24-011** filed ("real-time" vs "daily" cadence collision); **D-24-012** filed (no entity / persistence / trend / lock); **D-24-013** filed (no plan-tier gating); **D-24-014** filed (Solo Mode engine/surface contract silent despite §1.5 #6 commitment).

§24.4's metric "KB health status" overlaps §22.5 KB Health Model and §6034 / §5738 use of `kb_health_score_snapshot` for marketplace verification eligibility — "health" is over-used across surfaces with three distinct meanings (Bid Workspace pulse, KB row staleness, marketplace eligibility floor). Glossary work owed. → folded into **D-24-026** (Appendix K).

### Check 4: NDA Module — §24.2 vs §4.5.3 vs Appendix M.1 vs §38 vs §29.1

**Result:** §24.2 introduces fields and concepts that don't exist in §4.5.3 NDA Record:

- §24.2 prose: `nda_signed: boolean`, `nda_signed_at: timestamp`, `nda_version_id`, `version_number (auto-increment)`, `superseded: boolean = true`.
- §4.5.3 actual schema: `nda_signed_by_buyer`, `nda_buyer_signed_at`, `nda_signed_by_seller`, `nda_seller_signed_at`, no `nda_version_id`, no version concept, no `superseded` field.

The two are irreconcilable. Re-signing per §24.2 ("Re-signing overwrites `nda_signed_at` and `nda_version_id`") destroys the prior-signature audit evidence — there is no NDA Signature Record entity to preserve a per-version signature ledger. → **D-24-015** filed (schema collision); **D-24-018** filed (audit-trail breach on re-sign).

§4.5.3 NDA Record has 18 fields but no Indexes block, no Scope Isolation declaration, no Retention rule, no DSAR cascade clause (Pattern A or Pattern B per §6.8.4), no State Machine table (only inline `nda_status` enum), no Acceptance Criteria — failing every §4 entity convention. → **D-24-016** filed.

Three sources disagree on the NDA signature mechanism:

- §24.2 line 19497: "For v6.0, NDA signing is a checkbox acknowledgment (not third-party e-signature service like DocuSign). Stored as `nda_signed: boolean` and `nda_signed_at: timestamp`. … E-signature integration (e.g., DocuSign) is Phase 2 roadmap post-v6.0."
- Appendix M.1 line 48074: NDA Module & Execution — "Sign NDA inline gate; e-signature flow."
- §38 Mobile Parity line 31076: "NDA Execution — requires Adobe Sign embedded experience; mobile redirects to native Adobe Sign app or desktop."

Three different signature mechanisms. → **D-24-017** filed.

The "Request Changes" path (§24.2: "Buyer is notified: 'Vendor [Name] requested changes to the NDA.' Manual negotiation expected outside Sourcera. NDA remains in `pending` status until accepted or escalated.") has no API endpoint, no state machine row (`nda_status` enum has no `pending → changes_requested` transition), no escalation contract, no SLA, no audit event, no Loops.so template registration. → **D-24-019** filed.

§29.1 has only `nda_signature_requested` for the buyer→seller upload event. No `nda_executed_by_seller`, `nda_changes_requested`, `nda_version_superseded`, `nda_revoked`, `nda_expired` events. The Console Bridge §4.7.1 carries `nda_executed` (line 7836) but the seller-side audit/Inbox/notification fan-out is not authored. → **D-24-020** filed.

§24.2 makes no plan-tier distinction. Seller Free vs Solo vs Starter vs Growth vs Scale vs Enterprise: same checkbox? E-signature gated on Enterprise? §5.11 silent. → **D-24-021** filed.

### Check 5: Seller Analytics — §24.5 vs §17 (Workspace Analytics)

**Result:** §24.5 lists 5 metrics in 4 lines of prose. No data model, no compute math, no time-window options (7-day vs 30-day vs 12-month rolling), no filtering / aggregation / drilldown / export — versus §17's 21 sub-sections and §17.8's 8 acceptance-criteria families. Seller Analytics is a placeholder. → **D-24-022** filed.

§24.5 makes no plan-tier reference. Seller Pricing differentiates analytics depth (e.g., real-time vs digest) by plan tier, but §24.5 inlines no §5.11 row. → **D-24-023** filed.

§38 Mobile Parity Matrix has rows for Workspace Analytics dashboard / export (31041–31042), Seller Inbox (31077), and Seller Pulse (31078) — but **no row for §24.5 Seller Analytics**. The Appendix M.1 row at line 48075 collapses Seller Inbox / Pulse / Analytics into one entry "Mirror of buyer-side Inbox / Pulse / Analytics", further obscuring the gap. → **D-24-024** filed.

§24.5 metrics "Average response time (median hours)" and "Amendment re-verification time (median hours)" reference no data source (which audit-event row? which Console Bridge field?), no §44 SLO band, no aggregation function, no observability instrumentation. → **D-24-025** filed.

### Check 6: Acceptance Criteria §24.6

**Result:** Five toothless ACs across all of §24:

1. "NDA accept flow stores boolean + timestamp correctly" — vague; no observable input/output; no `nda_signed_by_seller` / `nda_seller_signed_at` field assertion.
2. "NDA version updates require vendor re-signature" — assumes the §24.2 versioning model that doesn't exist in §4.5.3.
3. "Inbox surfaces all action items within 2 seconds of trigger event" — single SLO, no §44.1 citation, no Console Bridge bounded-lag SLO reconciliation (§25.2.1 is 30 s p99).
4. "Seller Pulse updates in real-time as responses are submitted" — contradicts §20.3.4 daily cadence; "real-time" not measurable.
5. "Analytics reflect accurate completion rates and timelines" — toothless; no input, output, threshold, or test class.

Compare to §13.10/§14.9/§17.8/§20.7/§25.3.13 fidelity. → **D-24-026** filed.

### Check 7: Cross-cutting — Retention / DSAR / Residency / Firewall / a11y / States

**Retention.** §24 silent on retention for Seller Inbox items, Seller Pulse snapshots, Seller Analytics aggregates. NDA Record §4.5.3 silent on retention — `nda_executed` is in `bridge_event_financial_class` (`workspace_lifetime + 7 years`) but the underlying NDA Record row has no §40.2 row cited. → **D-24-027** filed.

**DSAR.** §24 silent. NDA Record §4.5.3 has no Pattern A/Pattern B declaration; per §6.8.4.1 every §4 entity MUST declare exactly one. The CI gate `dsar_cascade_pseudonym_pattern_consistency` would flag NDA Record. → **D-24-028** filed.

**Residency.** §24 silent on data residency for Inbox / Pulse / Analytics. NDA Record §4.5.3 silent on residency; cross-org evaluations spanning US/EU buyers and EU/US sellers have no §4.7.1.2 NDA-record placement contract. → **D-24-029** filed.

**Firewall.** §24 doesn't articulate console firewall behavior. Q&A posts cross via §25.1.2 `qa_thread_post_appended`. NDA executes via `nda_executed`. But §24's own surfaces don't enumerate CARRIED vs NEVER CARRIED, nor reference §25.1.2's matrix. Buyer-internal NDA notes / seller-internal Inbox items / Seller Pulse-internal computation — none classified. → **D-24-030** filed.

**Accessibility.** §24 contains no `aria` / `keyboard` / `focus` / `reduced-motion` clause across any of its 5 surfaces. §37 not cross-referenced. → **D-24-031** filed.

**Empty / loading / error / retry states.** §24 silent on first-time-Bid-Owner Inbox empty state, KB-health-empty Pulse state, post-bid debrief Pulse state, Analytics-empty (Phase 5 — no responses yet) state. → **D-24-032** filed.

**Enums.** Appendix J unregistered enums implied by §24: `seller_inbox_item_kind`, `seller_pulse_metric_id`, `nda_version_status` (`superseded`), `nda_acceptance_action` (`accept` vs `request_changes`). → **D-24-033** filed.

**Heading syntax.** §24.1 anchor `{#24.1-seller-q&a}` embeds an `&` character; brittle for slug tooling. Same pattern repeated at §24.2 (`{#24.2-nda-module-&-execution}`) and the §24 root (`{#24.-seller-console-—-q&a,-nda,-inbox-&-pulse}`). → **D-24-034** filed.

**Surface/Engine mapping (Appendix M.1).** Line 48075 collapses Seller Inbox / Pulse / Analytics into a single row "Mirror of buyer-side Inbox / Pulse / Analytics" — no per-engine declaration; no Solo-Mode suppression annotation despite §1.5 #6 commitment to engine-on / surface-off. NDA Module row line 48074 contradicts §24.2 ("e-signature flow" vs "checkbox acknowledgment"). → **D-24-035** filed.

## Counterfactual Pass

For each §24 surface audited, three realistic failure modes were enumerated and the spec was checked against each.

- **Seller Q&A (§24.1).** (1) NDA expires mid-Phase-7 (§4.5.3 `nda_status=expired`) — does the seller lose Q&A read access on prior threads? §24.1 silent. (2) Vendor reaches §18.2.3 50-question cap on a multi-team seller-side bid where multiple authors share a single bid_workspace — does the cap aggregate across users or per-user? §18.2.3 is "per vendor per workspace"; §24.1 silent on aggregation semantics. (3) Buyer toggles thread visibility from PUBLIC to (still PUBLIC; cannot make Public Private per §18.3.2) but masks vendor identity (§18.3.3 "Hide vendor identity"); does the masking apply retroactively in seller-side cached projections via the bridge? §24 silent. (Folded into D-24-002.)
- **NDA Module (§24.2).** (1) Buyer uploads NDA v2 while the vendor is mid-signing v1 — race between `nda_signed_at` write and version increment — §24.2 silent on race resolution. (2) Buyer revokes NDA (no `revoke` flow exists) — §4.5.3 `nda_status=expired` is the only retiring state and is implicitly time-driven, not action-driven. (3) Vendor's signing user is later DSAR-erased — `nda_buyer_signatory_email` / `nda_seller_signatory_email` strings are PII; §6.8 cascade is silent because §4.5.3 has no DSAR clause. → folded into D-24-016 / D-24-018 / D-24-028.
- **Seller Inbox (§24.3).** (1) Buyer pushes 200 amendment re-verification requests in a single batch — §24.3 silent on rate-limiting / collapsing into Inbox Item Group equivalent (none exists for sellers). (2) Inbox item sourced from a since-canceled Bid Workspace — §24.3 silent on cleanup cascade. (3) Loops.so outage during in-app + email fan-out — §29.1 silent on §24.3-specific fallback. → folded into D-24-005 / D-24-006 / D-24-008.
- **Seller Pulse (§24.4).** (1) Concurrent submission storm causes "real-time" computation to lag — no SLO, no degradation contract. (2) Seller is `seller_solo` plan with `evaluation_owner_mode=solo` — surface should be suppressed per §1.5 #6 but §24.4 has no surface-off behavior. (3) Bid Workspace transitions to `disqualified` (§4.7.2) — is the post-bid Pulse final value frozen, or does it continue updating? Compare to §20.3.2 ("Phase 12+: Health Score locked"). § 24 silent. → folded into D-24-010 / D-24-011 / D-24-012 / D-24-014.
- **Seller Analytics (§24.5).** (1) Seller has no submitted bids in last quarter — Analytics empty-state? §24 silent. (2) Multi-Org seller (§7 SCIM-managed) wants per-Org analytics partition — §24.5 silent. (3) Analytics export under DSAR-pending state — partial-data export contract silent. → folded into D-24-022 / D-24-024 / D-24-029.

## Self-Challenge Pass

Re-read findings as a hostile reviewer.

- **D-24-001 (broken §17 cross-reference)** — held at **P3** (cosmetic; pure documentation drift). The reader can self-correct to §18 trivially. Rejected upgrade to P2 because the misreference does not change implementation behavior.
- **D-24-002 (Q&A visibility per NDA state silent)** — held at **P1**. The audit task explicitly asks this question; spec answers it implicitly via Phase chaining and never explicitly. NDA expiry mid-evaluation is a real edge case. Rejected downgrade to P2: a junior engineer would build either "NDA-status check at every Q&A read" or "no NDA-status check" and the two paths diverge on `nda_status=expired`.
- **D-24-003 (§24.1 vs §18.2.1 Phase 8 read-only)** — held at **P2**. §18.2.1 governs; §24.1 sentence is loose paraphrase. P1 rejected because §18.2.1 unambiguously wins per Master Spec authoring convention (data-model / state-machine sections are authoritative over feature-section prose).
- **D-24-004 (§24.1 silent on §18.2.3 50-question cap)** — held at **P2**. The cap is enforced server-side per §18 and the seller surface only has to surface the §18 enforcement; the defect is the omission of a "see §18.2.3" pointer. Held at P2 because the implementation can be derived from §18 alone.
- **D-24-005 (no SellerInbox entity)** — held at **P1**. Inbox aggregation is named in the prompt; no entity means the aggregation behavior is unbuildable.
- **D-24-006 (no inbox aggregation contract)** — held at **P1**. Same reasoning as D-24-005.
- **D-24-007 (priority taxonomy drift)** — held at **P2**. Resolvable to either taxonomy.
- **D-24-008 (no §29.1 registration for Seller Inbox kinds)** — held at **P1**. Without canonical event ids, the Seller Inbox cannot bind to delivery channels (in-app / email / Slack / webhook) per §29.2.
- **D-24-009 (no plan-tier gating on Inbox)** — held at **P2**. Inbox is plausibly universal; absent §5.11 row, the universality is not asserted.
- **D-24-010 (no Pulse score formula)** — held at **P1**. The audit task explicitly asks "Pulse score math (separate from buyer Pulse)." The spec has no math at all. Considered P0 (revenue / billing surface) and rejected — Pulse is not directly billable. P1 stands: feature is unbuildable as written.
- **D-24-011 ("real-time" vs "daily" cadence)** — held at **P1**. Two contradicting cadences in the same section group. Junior engineer cannot reconcile.
- **D-24-012 (no SellerPulseHealth entity)** — held at **P1**. Engine commitment in §1.5 #6 has no schema home.
- **D-24-013 (no Pulse plan-tier gating)** — held at **P2**.
- **D-24-014 (Solo Mode contract for Seller Pulse silent)** — held at **P1**. §1.5 #6 explicitly commits the engine/surface split; §24.4 must author the surface-off behavior.
- **D-24-015 (NDA field collision §24.2 vs §4.5.3)** — held at **P1**. Two contradicting schemas; junior engineer would build one or the other and the buyer/seller projections would not interop.
- **D-24-016 (NDA Record entity convention violations)** — held at **P1**. Six structural blocks missing on a Marketplace-Domain entity that crosses the firewall. CI gate `dsar_cascade_pseudonym_pattern_consistency` would block release.
- **D-24-017 (three-way NDA-mechanism contradiction)** — held at **P1**. Three sources author three mutually exclusive signing flows. Either §24.2 is correct (checkbox), Appendix M.1 is correct (e-signature), or §38 is correct (Adobe Sign). Any two of those force the third to be wrong.
- **D-24-018 (re-sign overwrites prior signature)** — held at **P1**. Audit-integrity violation: the prior signature timestamp is destroyed. Considered P0 per rule (c) "violates a hard regulatory requirement (audit-log integrity)" — rejected because the overwrite is on the §4.5.3 NDA Record row, not the §6.7 Audit Log; the underlying audit-event row in §6.7 should still capture the prior sign event. P1 stands.
- **D-24-019 ("Request Changes" path unbuildable)** — held at **P1**. No API, no state machine, no SLA. A vendor's request-changes click goes nowhere on the schema.
- **D-24-020 (NDA notification coverage sparse)** — held at **P2**. The single registered event covers the upload-to-vendor path; the missing events are reasonably inferable from §29.1 patterns, but the absence of explicit registration would force engineering to author them ad hoc. Considered P1 and rejected because the Bridge `nda_executed` event covers the cross-console fan-out for the most critical case.
- **D-24-021 (NDA plan-tier silent)** — held at **P2**.
- **D-24-022 (Seller Analytics placeholder)** — held at **P1**. Five-bullet section vs §17's 21 sub-sections is unbuildable.
- **D-24-023 (Seller Analytics plan-tier silent)** — held at **P2**.
- **D-24-024 (Seller Analytics mobile parity row missing)** — held at **P2**.
- **D-24-025 (Seller Analytics observability silent)** — held at **P2**.
- **D-24-026 (§24.6 ACs toothless)** — held at **P2**. Standard §17.8/§20.7 fidelity rewrite is mechanical.
- **D-24-027 (retention silent)** — held at **P2**.
- **D-24-028 (DSAR Pattern A/B not declared on §4.5.3)** — held at **P1**. The CI gate `dsar_cascade_pseudonym_pattern_consistency` (§M.5) asserts that every §4 entity declares exactly one pattern. Held at P1 because the CI gate would block release.
- **D-24-029 (residency silent)** — held at **P2**.
- **D-24-030 (firewall articulation silent)** — held at **P2**. The §25.1.2 redaction matrix covers the bridge-side; §24's own surfaces don't articulate but are consumers, not producers. P2 stands.
- **D-24-031 (a11y silent)** — held at **P2**.
- **D-24-032 (states silent)** — held at **P2**.
- **D-24-033 (enum registration gaps)** — held at **P3**. Mechanically resolvable.
- **D-24-034 (heading anchor `&`)** — held at **P3**.
- **D-24-035 (Appendix M.1 collapsed row)** — held at **P2**. Surface/engine mapping discipline is normative, but the collapsed row does not block implementation.

No defect downgraded to evade rule (4) of the Severity definition. Two defect candidates considered and rejected:

- §24.4's "KB health status" overlap with §22.5 KB Health and §27 marketplace-eligibility KB health floor — three distinct meanings of "health". Filed as glossary work folded into D-24-026 (no separate defect). The overlap is a glossary problem, not a buildability problem.
- §24.3's "Document Library expiration warnings (documents expiring within 30 days)" — inlines a 30-day numerical literal without §39 citation. Folded into D-24-027 because the broader retention work covers the consolidation pass; no separate defect.

## Pre-edit Backup

No spec edits performed in this prompt (audit non-destructive by default). Master Spec at v7.1.0 unchanged.

## Cross-References

- Coverage Matrix: §24 row updates land in `COVERAGE_MATRIX.md` Phase 24 column-set update (deferred per Phase 23 precedent — full matrix tightening is a separate sweep).
- Forward references: Phase 13 (schema consolidation — D-24-005, D-24-012, D-24-015, D-24-016, D-24-018), Phase 7 (plan-gating — D-24-009, D-24-013, D-24-021, D-24-023), Phase 14 (numerical singleton consolidation — D-24-011, D-24-027), dedicated §24.4 Seller Pulse Authoring Pass (D-24-010, D-24-011, D-24-012, D-24-014) modeled on the §20.3 Buyer Pulse pattern, dedicated §4.5.3 NDA Record Convention Pass (D-24-015, D-24-016, D-24-017, D-24-018, D-24-019, D-24-028), dedicated §24.5 Seller Analytics Authoring Pass (D-24-022, D-24-024, D-24-025) modeled on the §17 Buyer Analytics fidelity pattern.
