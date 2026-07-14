# PHASE 50 — §50 Sourcera Ops Console Audit (Scratch Findings Log)

**Date:** 2026-05-11
**Auditor:** Opus 4.6, Sourcera audit harness
**Target:** `Sourcera_Master_Spec.md` §50.1 – §50.19 (lines 38660 – 41423)
**Source authority cited by §50:** Summary §6.35; Summary C.93 – C.100; §1.3 Console firewall; §4.6.1 Audit Event; §4.6.3 OpsSession; §4.4.27 OpsActionRecord; §4.8.* billing; §5.1 Console split; §5.11 Feature Access Matrix; §27.6 Taxonomy; §27.8 Abuse; §34 Pricing; §40 Privacy; §43 Admin Dashboard (superseded but still in spec); §48.2.12.4 GrowthLoopKillSwitch; §48.4.10 SIM Signal-Class catalog; Appendices C / G / I / J / M.

**Prompt scope (verbatim).** "Walk §50. CHECKS: (1) every Ops surface declared (impersonate, refund, force-action, verification review queue, abuse triage, AIOperation reversal, plan override, residency override, etc.); (2) every Ops action emits audit event; (3) every Ops action requires 2-person rule where applicable; (4) RBAC gates Ops surfaces strictly."

## Method

End-to-end read of §50.1 – §50.19 plus cross-referenced anchors (§4.4.27, §4.6.1, §4.6.3, §4.6.4, §26.7 Verification Review Queue at §24910, §27.8 Abuse adjudication, §34 plan-tier, §43 Admin Dashboard, §48.2.12.4 GrowthLoopKillSwitch). Walked the §50.3.2 Capability Envelope Matrix row-by-row. Cross-checked Authored Extension list (§50.9 items #1–#28; §50.18 items #29–#36). Self-challenged severity classifications against §6.7 audit-integrity, §5.1 firewall, §34 numerical singleton, §50 closure invariants.

## Defects Filed (D-50-NNN cluster)

Promoted on first pass — no draft-revision held back. Severity per `DEFECT_LEDGER.md` rules.

| Defect | Sev | Class | One-line |
|---|---|---|---|
| D-50-001 | P1 | rbac | §50.3.2 matrix closure invariant violated: §50.10 / §50.11 / §50.13 / §50.14 author granular Ops roles + capabilities without extending §50.3.2 matrix (only §50.16.5 does). |
| D-50-002 | P1 | consistency_drift | OpsSession scope contradiction: §4.6.3 says non-impersonation Ops actions (pricing publish, taxonomy edit) write OpsActionRecord WITHOUT OpsSession; §50.10 / §50.12 / §50.13 require OpsSession FK on the action row. Spec is ambiguous on which side wins. |
| D-50-003 | P1 | rbac | Verification Review Queue Ops surface mentioned at §26.7 but never re-declared in §50 at the §50.10 / §50.11 fidelity; §50.3.2 matrix lists `ops_verification_reviewer` / `ops_verification_senior_reviewer` but adds no rows for them. |
| D-50-004 | P1 | rbac | Abuse Report adjudication §50.3.2 row marks `ops_fraud_analyst` solo with no quorum; §27.8.8 mandates dual sign-off (two `ops_content_admin`) for `seller_banned org_level_all_consoles`. Matrix and §27.8 are out of sync. |
| D-50-005 | P1 | rbac | "Manually reverse AIOperation" §50.3.2 row is a matrix cell only — no §50.X surface authors UX, API, Stripe linkage, customer notification, idempotency. Compare §50.12 pricing-publish authoring fidelity. |
| D-50-006 | P0 | numerical_singleton | Plan-override / manual plan-tier adjustment Ops surface is absent from §50. §43.1 (superseded) describes it; §34 has no plan-override path; §26107 references "Sales-Ops manual provisioning" without authoring. Allows revenue leakage by undefined ops path. |
| D-50-007 | P1 | rbac | Residency override / customer-Org residency change Ops surface absent. §50.3.2 grants `residency_access_tier='global'` for the Ops user but never authors the Org-side data_residency_region mutation path or evacuation flow (§40.3 / §40.4 are narrative). |
| D-50-008 | P1 | rbac | "Authorize refund via Stripe" §50.3.2 row is matrix-only; no §50.X surface authors refund UX, API, Stripe idempotency, ContestRecord linkage, customer notification, or post-refund AIWallet adjustment. |
| D-50-009 | P1 | rbac | "Adjust AIWallet balance manually" §50.3.2 row is matrix-only; no §50.X surface. |
| D-50-010 | P1 | rbac | Trial extension / creation / convert-to-paid Ops surface absent (§43.1 lists it). |
| D-50-011 | P2 | observability | §50.4.1 ¶3 mandates `read`-class Audit Event emission per Ops-actor read, sample rate 1.0; §4.6.1 schema is built for mutating actions and has no read-class authoring (no read-verb registry, no projection rules, no retention partitioning vs mutation retention). |
| D-50-012 | P1 | consistency_drift | §50.5.1 actor_type/user_id contract conflicts with §4.6.1 user_id constraint. §4.6.1 says `user_id` nullable only for `console = platform_system`; §50.5.1 #2 requires nullable for `actor_type='ops'` (which has `console='ops'`). §4.6.1 field-table never updated. |
| D-50-013 | P1 | error_code | §50.10.7 AC #4 cites `ops_session_capability_denied`; §50.3.2 invariant #3 cites `ops_capability_outside_envelope`. Error-code drift across §50. |
| D-50-014 | P1 | data_model | §50.6.4 ¶4 introduces `OpsKillSwitchBundle` entity with no field table, scope isolation, indexes, retention, DSAR, state machine, API, webhook, or AC — only flagged as "authored extension" with no body. |
| D-50-015 | P1 | data_model | §50.14.8 `OpsAnalyticsDashboardConfig` entity field table is incomplete (no PK, no scope isolation declaration, no indexes, no retention, no DSAR clause, no state machine even though "Config mutations follow §50.14.2 #7" implies one). |
| D-50-016 | P2 | rbac | §50.3.2 legend defines only `✓` / `✓²` / `✓ᴱ`. §50.16.5 introduces `✓³` (two-quorum-signer) without extending the legend at §50.3.2 line 38790. |
| D-50-017 | P1 | rbac | §50.3.2 row "Adjudicate ContestRecord" is solo `ops_finance`. Contest adjudication mutates billing materially and reverses AIOperation revenue; should require quorum or at least step-up re-auth `ᴱ`, consistent with the same role's other revenue-touching rows. |
| D-50-018 | P1 | acceptance_criteria | §50.4.5 break-glass disclosure-commitment has no terminal escalation path. AC #2 raises §42 P1 at 14 days; if no owner ever provisions and no Zendesk fallback succeeds, the customer disclosure is deferred indefinitely with no legal escalation or transparency-report path authored. |
| D-50-019 | P1 | rbac | §50.4.7 customer revocation surface restricted to `org_owner` only (`org_admin` and below cannot revoke). Edge case: sole Org Owner is the user being impersonated, or sole Org Owner is locked out, or no Org Owner is provisioned (FM#4 break-glass scenario) — nobody can revoke the active session. |
| D-50-020 | P1 | rbac | Marketplace Listing moderation surface (approve / reject / hide pending / restore) is absent from §50. §50.11 covers Template Library Entry review only; §50.16.4.4 covers Vendor Opt-Out revocation only. §43.1 lists Marketplace Moderation; §50 omits it. |
| D-50-021 | P1 | rbac | API token revocation, password reset, SCIM deprovisioning sync (§43.1 User Management list) — none authored as §50.X surfaces. |
| D-50-022 | P1 | rbac | §50.3.2 "Edit TaxonomyNode" row shows `·` for all six C.94 roles; §50.10 authors taxonomy editing via `ops_taxonomy_editor` (new granular role). Matrix and surface disagree on whether taxonomy edit is permitted by any role. |
| D-50-023 | P2 | consistency_drift | §50.4.1 AC #2 says step-up re-auth required for "Every OpsSession open" within 5 min; §50.2.2 #3 enumerates four sensitive actions (open OpsSession is implicitly in there but the enumeration drops it). Inconsistent statements of which actions require step-up. |
| D-50-024 | P1 | rbac | §50.3.2 matrix has no row for "Deactivate SIM-origin kill-switch" though §50.15.7 / §50.15.8.8 are explicit that only `ops_admin` (incl. specialized mappings) may deactivate. Capability is enforced in body prose but not in the closed matrix. |
| D-50-025 | P1 | acceptance_criteria | §50.16.4 "Bulk-resolve" referenced in §50.16.8 FM#2 as a mitigation, but §50.16.4 never authors a bulk-resolve endpoint, scope, rate-limit, audit semantics. |
| D-50-026 | P2 | webhook | §50.16.6 declares customer-facing event `billing.organization.suspended` per §31.8.5 "authored extension" but §31.8.5 is never updated; consumer registration left dangling. |
| D-50-027 | P1 | webhook | §50.15.9 / §50.16.6 SIM + fraud-action webhooks register `event_class='ops_sim'` (new) without authoring delivery semantics in §31 (retry curve, DLQ depth specific to ops-internal class, idempotency guarantees on the `#eng-oncall` Slack bridge path). |
| D-50-028 | P1 | numerical_singleton | §50.4.6 hard limits (3 concurrent / Org overlap = 2 / 50,000 api_request_ids / chain depth 10) are inline numerical literals; §39 Object Size Constraints does not enumerate them as the single-source-of-truth. Future changes risk drift. |
| D-50-029 | P1 | consistency_drift | §27.8.8 dual sign-off names `ops_content_admin` as the required role — that role is absent from §50.3.2 enum + matrix and from §50.3.2 "Pre-existing specialized Ops roles" mapping. Role drift between §27.8 and §50. |
| D-50-030 | P1 | acceptance_criteria | §50.6.4 ¶5 cites a "Customer Communication Workflow" for customer-data-affecting incidents but the workflow's timeline, channel matrix, customer-facing template, audit-of-communications, and reversal-disclosure are not authored at §50 (cross-reference to §42 + §6.6 leaves it underspecified). |
| D-50-031 | P1 | rbac | §50.4.6 chain-depth-10 escape-hatch — "investigations > 10 chained sessions require explicit `ops_admin` escape-hatch sign-off" — but no §50.X authors the escape-hatch surface, quorum, audit trail, or escape-hatch sign-off enum value. |
| D-50-032 | P1 | rbac | §50.5.2 mandates `ops_session_id` on every AIOperation with `actor_type='ops'`; but the §50.3.2 row "Manually reverse AIOperation" is permitted to `ops_finance` whose Open-OpsSession rows in the matrix are buyer-scope or seller-scope only — manually reversing AIOperation in the billing-admin surface is not impersonation, so where does `ops_session_id` come from? Conflict with §4.6.3 non-impersonation rule. |
| D-50-033 | P2 | consistency_drift | §50.9 item #16 "ops_growth_pm, ops_gtm_lead, ops_fraud_analyst, ops_finance, ops_analyst granular Ops roles" — but `ops_fraud_analyst` and `ops_finance` are already canonical C.94 roles in §50.3.1; listing them as "new granular Ops roles" is misleading authoring. |
| D-50-034 | P1 | observability | §50.14.8 SLOs (page first-load p95 1.5 s; widget render 2.0 s; etc.) are not registered against §44 performance targets or §42 alerting. The breach behavior cites "§50.8 Ops-performance SLO alert" but §50.8 doesn't author an Ops-performance SLO alerting catalog. |
| D-50-035 | P2 | observability | §50.4.1 customer-Org-Owner notification dispatch lacks per-channel partial-success accounting. Loops.so success + InboxItem failure (or vice versa) doesn't transition `customer_owner_notification_failure_code` cleanly; the enum only has `loops_dispatch_unrecoverable` / `no_owner_resolvable` / `residency_legal_hold_suppressed` / `none`. |
| D-50-036 | P1 | webhook | §50.10–§50.16 register many new webhooks (taxonomy, template-review, pricing, baseline, dashboard, SIM, fraud-action) but Appendix C registration is described as "all conform to §31" without per-event Appendix C registration log; integrator-facing webhook catalog is incomplete. |
| D-50-037 | P2 | accessibility | §50 authors no accessibility / a11y contract for Ops Console surfaces (Sourcera customer surfaces inherit §37 WCAG 2.1 AA; §50 is silent on whether the Ops Console must meet the same bar). |
| D-50-038 | P1 | rbac | §50.3.2 row "Grant `residency_access_tier = 'global'`" enforces Authored-Extension dual sign-off but the 5-Ops-user cap (§50.2.2 #5) doesn't appear in the matrix or in any AC; cap enforcement is body-prose only. |
| D-50-039 | P1 | data_model | §50.5.3 OpsActionRecord extension adds `linked_ops_session_id` (nullable; required when an active OpsSession exists). §50.12.10 ¶5 also requires `co_approver_ops_session_id` for two-approver actions, registered in §50.9 #17. These two new fields are not jointly registered in §4.4.27 field table; §4.4.27 doesn't currently list them. |
| D-50-040 | P2 | numerical_singleton | §50.4.6 "Soft cap 10,000; hard cap 50,000" for `api_request_ids` per session conflicts with §4.6.3 line 7274 hard cap of 100,000. Numerical drift between §50.4.6 and §4.6.3. |

## Self-Challenge Pass

Re-read findings as a hostile reviewer.

- **D-50-006 P0 challenge:** is plan-override truly P0? Rule: P0 if "billing surface ambiguous in a way that allows revenue leakage or double-charge." Manual plan-tier override without authored audit / quorum / customer notification is a revenue-leakage surface — staff or compromised support can set an Org to Enterprise tier indefinitely with no detected paper trail. P0 confirmed.
- **D-50-002 P1 challenge:** is the OpsSession scope contradiction unbuildable? Two readings of §4.6.3 vs §50.10/§50.12 produce two different implementations: (a) pricing publish does not open an OpsSession and `ops_session_id_proposer` is null — but the field is NOT NULL; (b) pricing publish DOES open a synthetic OpsSession with `console_scope` undefined. Engineering will pick one and the other becomes drift. P1 confirmed.
- **D-50-022 P1 challenge:** are matrix and §50.10 really in conflict? §50.3.2 "Edit TaxonomyNode" is `·` for all C.94 roles; §50.3.2 invariant #4 says "Every Ops capability used anywhere in the Spec MUST register in this matrix OR in a §50.3.2-extension subsection." §50.10 doesn't extend the matrix. So §50.10 capabilities are unmatrixed. P1 confirmed; recommendation: §50.10.6 must add an explicit §50.3.2 sub-matrix extension table.
- **D-50-017 P1 challenge:** is ContestRecord adjudication risky enough for quorum? §4.8.5 ContestRecord reversal posts a wallet credit AND reverses an AIOperation row. A single `ops_finance` user can issue arbitrary credits. The §50.12 rate-card guardrail (≥ 5% requires quorum) doesn't apply here because credits are per-row, not rate-card. P1 confirmed.
- **D-50-018 P1 challenge:** is the break-glass infinite-defer really unsafe? AC #2 says "unfired commitments older than 14 days raise a §42 P1 alert and page ops_security_admin." Paging is not customer disclosure. GDPR Article 14 right-to-information for processing by Sourcera staff doesn't have a 14-day open window. P1 confirmed; recommendation: author a legal-team escalation path with a 30-day customer-disclosure obligation.
- **D-50-019 P1 challenge:** edge case of locked-out sole Org Owner sounds rare. §27.8 abuse-driven account compromise is exactly this case; banned Orgs lose Owner login. §6.5 session revoke + SCIM deprovisioning produces it on offboarding. Not rare. P1 confirmed.

No severity demotions. No findings withdrawn.

## Counterfactual Pass

Three+ realistic failure modes per §50 surface; checked spec coverage.

- **Impersonation (§50.4):** (1) WorkOS outage mid-incident — §50.7 FM#4 addresses ✓; (2) sole Org Owner locked out / no owner provisioned — §50.4.5 FM#4 break-glass handles open but not the customer-disclosure tail (D-50-018) ✗; (3) Ops Admin races time-box expiry — §4.6.3 FM#7 addresses ✓; (4) customer revoke mid-mutation — §50.4.7 ¶4 addresses ✓; (5) malicious Ops user exfiltrates via impersonation — §50.7 #2 defense-in-depth ✓ ; (6) Ops user collusion — partially defended via §50.4.4 self-signoff forbid + Slack alert, but two Ops users on the same physical workstation aren't checked except in pricing (§50.12 FM #1).
- **Pricing publish (§50.12):** (1) Approver-proposer collusion via shared device — §50.12 FM#1 ✓; (2) ToCToU on gate threshold — §50.12 FM#2 ✓; (3) Cache inconsistency across regions — §50.12 FM#3 ✓; (4) Comms-plan delivery silent failure — §50.12 FM#4 ✓; (5) cost_base provider drift — §50.12 FM#5 ✓; (6) cumulative-drift evasion — §50.12 FM#7 ✓ (Authored Extension #41); (7) withdrawal-rate abuse — §50.12 FM#8 ✓ (Authored Extension #42); (8) plan-override end-run around §50.12 (D-50-006) ✗ — Ops can bypass §50.12 entirely via the unauthored plan-tier manual adjustment.
- **Fraud actions (§50.16):** all eight §50.16.8 FMs addressed except (9) Bulk-resolve referenced but unauthored (D-50-025) ✗.
- **Taxonomy CMS (§50.10):** all five §50.10.8 FMs addressed except matrix unmapped (D-50-001 / D-50-022).
- **SIM / Kill-switch (§50.15):** all eight §50.15.12 FMs addressed except `ops_session_id` not derivable for non-impersonation SIM kill-switch activation (D-50-032 cascade).
- **Verification Review:** queue is at §26.7; §50 doesn't surface dedicated Ops authoring (D-50-003).

## Coverage Matrix Cell Prescription (queued for v7.1.1 mechanical pass)

Per the §50 audit, the following F-rows from `FEATURE_INVENTORY.md` are targets for cell tightening. The mechanical update is queued (matches Phase 8.1 / 11.2 / 11.3 incremental-tightening pattern). Aggregate counters not updated in this pass.

- F-119 OpsSession Entity → `consistency_drift` ⚠ → ❌ (D-50-002), `numerical_singleton` ⚠ → ❌ (D-50-040).
- F-696 Sourcera Ops Console → `rbac` ✅ → ⚠ (D-50-001), `acceptance_criteria` ⚠ → ❌ (D-50-030).
- F-697 Ops Console Separation Architecture → no change.
- F-701 Ops Role Matrix → `rbac` ✅ → ❌ (D-50-001, D-50-022, D-50-024, D-50-029).
- F-704 Impersonation Audit → `rbac` ⚠ → ❌ (D-50-019), `acceptance_criteria` ⚠ → ❌ (D-50-018), `consistency_drift` ⚠ → ❌ (D-50-023).
- F-708 Customer Notification Dispatch → `observability` ⚠ → ❌ (D-50-035).
- F-711 Ops-Tagged Audit Actor → `data_model` ⚠ → ❌ (D-50-012, D-50-039), `observability` ⚠ → ❌ (D-50-011).
- F-713 Incident Response Workflow → `acceptance_criteria` ⚠ → ❌ (D-50-030).
- F-714 OpsKillSwitchBundle → `data_model` ⚠ → ❌ (D-50-014).
- F-725 Pricing Admin Surface → `consistency_drift` ⚠ → ❌ (D-50-002, D-50-032).
- F-734 Internal Analytics Dashboards → `data_model` ⚠ → ❌ (D-50-015), `observability` ⚠ → ❌ (D-50-034).
- F-740 OpsAnalyticsDashboardConfig → `data_model` ✅ → ❌ (D-50-015).
- F-741 SIM Surface → `webhook` ⚠ → ❌ (D-50-027).
- F-746 Fraud Analyst Surface → `rbac` ⚠ → ❌ (D-50-004), `acceptance_criteria` ⚠ → ❌ (D-50-025), `webhook` ⚠ → ❌ (D-50-026).

Adds gap rows (new defects propose new feature-inventory rows where surfaces are missing):

- F-MISSING-PLAN-OVERRIDE (D-50-006) — Plan-Tier Manual Override Ops Surface.
- F-MISSING-RESIDENCY-OVERRIDE (D-50-007) — Residency Change / Evacuation Ops Surface.
- F-MISSING-REFUND (D-50-008) — Refund Authorization Ops Surface.
- F-MISSING-WALLET-ADJUST (D-50-009) — AIWallet Manual Adjustment Ops Surface.
- F-MISSING-TRIAL-MGMT (D-50-010) — Trial Management Ops Surface.
- F-MISSING-MARKETPLACE-MOD (D-50-020) — Marketplace Listing Moderation Ops Surface.
- F-MISSING-USER-MGMT (D-50-021) — User Token / Password / SCIM Ops Surface.
- F-MISSING-AIOPS-REVERSAL (D-50-005) — AIOperation Reversal Ops Surface.
- F-MISSING-VERIFICATION-QUEUE (D-50-003) — Verification Review Queue §50 Ops Authoring.
- F-MISSING-AIOPS-CHAIN-ESCAPE (D-50-031) — OpsSession Chain-Depth Escape-Hatch Surface.

Phase 50 feature-inventory diff queued to v7.1.1 hygiene pass.

## Forwarded to Downstream Phases

- v7.1.1 stamp-gate inherits D-50-006 (P0) and the P1 cluster.
- Phase V11 / M02.3 implementation pack inherits D-50-001 / D-50-022 / D-50-024 / D-50-029 (matrix-closure CI gate cannot land while these gaps exist).
- Phase 14 cross-document consistency inherits D-50-002 / D-50-012 / D-50-013 / D-50-029 / D-50-032 / D-50-040.
- Phase 8.2 (webhooks) inherits D-50-026 / D-50-027 / D-50-036.
- Phase 9 (Privacy / Retention) inherits D-50-018 / D-50-011.
- §27.8 owner inherits D-50-004 (matrix-to-§27.8 drift).
- §43 retire-prose Phase inherits D-50-006 / D-50-008 / D-50-009 / D-50-010 / D-50-020 / D-50-021 (these §43 surfaces must be re-authored in §50 before §43 can be retired per §50.1 ¶ "Relationship to §43").

## Cross-Reference for Defect Ledger

All forty defects above will be appended to `/Sourcera/_audit/DEFECT_LEDGER.md` in a `## Phase 50 — §50 Sourcera Ops Console Walk (2026-05-11)` block.
