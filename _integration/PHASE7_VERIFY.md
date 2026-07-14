# Phase 7 Verification — Product Usage Analytics & PLG Instrumentation (planned §50; landed §51)

**Scope.** Verification of the Phase 7 v7.0.0 authoring of `Sourcera_Master_Spec.md` covering the unified buyer + seller Product Usage Analytics surface: event taxonomy, standardized event properties, org-level dashboard, user-level dashboard, seller parity dashboard, Time-Saved baseline model, retention and DSAR, and the consolidated acceptance-criteria / self-challenge / counterfactual block — together with the Appendix G event-catalog additions, the Appendix I error-code additions, the Appendix J enum additions, and the §50.13 Baseline Assumption Manager cross-reference surface that binds customer-facing Time-Saved disclosures to the Ops-authoritative conversion-factor library. This verification assesses **four** discrete items specified in the integration-program prompt (Prompt V7). Prior-phase work verified in PHASE1_VERIFY.md–PHASE6_VERIFY.md is not re-litigated; downstream effects are cited only where they invalidate or strengthen a finding.

**Reviewer role.** Hostile — actively looking for reasons the Phase 7 bundle should not ship as v7.0.0.

**Baseline.** Master Spec working copy as of 2026-04-22 — lines 33696–34431 (§51 Product Usage Analytics & PLG Instrumentation, the Phase 7 authoring landing zone, originally prompted as §50 before the §50 Ops Console occupation resolved in Phase 6 Option A), lines 35739–35775 (Appendix G §51 Product Usage Analytics Event Additions), lines 36386–36414 (Appendix I §51 Product Usage Analytics Errors), with supporting cross-reads into §50.13 Baseline Assumption Manager (Phase 6 occupant at lines 32311–32509 per PHASE6_VERIFY.md mapping) and §4.3.18 UsageEvent / §4.3.19 Time-Saved Credit / §40.2 Data Retention / §5.11 Feature Access Matrix anchors.

**Target sections.** §51.1, §51.2, §51.3, §51.4, §51.5, §51.6, §51.7, §51.8, with Appendix G §51 additions, Appendix I §51 additions, Appendix J §51 enum additions, and §50.13 cross-reference surface.

**Verification date.** 2026-04-22.

**Verification protocol.** Each of the four verification items is scored **PASS / PARTIAL / FAIL** with structural and content sub-findings, adversarial sub-findings, and named remediation. Sign-off recommendation appears in §5.

**Precedent.** The Phase 5 → Phase 6 verification program established the "Option A — accept the as-landed anchor as permanent; update integration-program cross-references and RECONCILIATION.md" pattern for resolving numbering-conflict drift introduced by sequential integration-phase occupation. Phase 7 inherits the identical pattern: the Phase 7 prompt (Integration_Prompts.md Phase 7 block, lines 1504–1556) targeted §50, but §50 was occupied by Phase 6 Ops Console authoring, so Phase 7 landed at §51. The authoring preamble at line 33704 explicitly discloses this as an Authored Extension; RECONCILIATION.md records the resolution. This verification treats §51.1–§51.8 as the authoritative location of the Phase 7 content and evaluates structural coverage against the eight required subsections with an explicit mapping table in Item 1.

---

## 0. Remediation Completion Addendum (2026-04-22)

**Status at original verification pass:** 3 of 4 items PASS; Item 1 PARTIAL (strict) / PASS (substantive) due to the §50 → §51 numbering drift caused by Phase 6 Ops Console occupation of §50; seven non-blocking polish items catalogued in §5.3.

**Status after 7-step remediation program (this addendum, same-day, 2026-04-22):** 4 of 4 items PASS on both strict and substantive readings; all seven polish items resolved; pre-v7.0.0 cut gate boxes checked (§5.4).

**Remediation program executed.** The 7-step program authored in response to the §5 Sign-Off Recommendation and applied on 2026-04-22:

| Step | Action | Target |
|------|--------|--------|
| 1 | Backup Master Spec to `legacy-import:_versions/` | `Sourcera_Master_Spec_pre-phase7-verify-remediation-2026-04-22.md` |
| 2 | Confirm Polish #6 already satisfied — Appendix J spot-check of 10 new enums | No edits required — all 10 enums confirmed registered at Appendix J lines 38584–38678 (`usage_dashboard_kind`, `usage_dashboard_panel_id`, `usage_dashboard_viewer_role_kind`, `usage_envelope_violation_kind`, `usage_outbox_curve_kind`, `usage_dsar_redaction_kind`, `usage_k_anon_floor_kind`, `usage_conversion_factor_drift_direction`, `usage_event_family_registration_action`, `usage_alias_retirement_pager_tier`) |
| 3 | Confirm Polish #7 already satisfied — §50.13 sub-anchor spot-check | No edits required — §50.13.1 through §50.13.10 sub-anchors confirmed at Master Spec lines 32403–32586, including the §51-cited sub-anchors §50.13.2, §50.13.3, §50.13.4, §50.13.10 |
| 4 | Close Polish #1 + #2 — §51.8.4 #11 stale anchor `(§51.9)` + stale event count "Ten new events" | Master Spec line 34432 — rewrote to cite "Appendix G → §51 Product Usage Analytics Event Additions, Master Spec lines 35739–35775; NOT an anchor inside §51 body"; changed "Ten new events" → "Thirteen new events" with full event enumeration (6 dashboard-surface events + 7 Sourcera-internal meta-events) |
| 5 | Close Polish #3 — §51.5.3 KB ROI cross-family registration breadcrumb | Master Spec line 34169 — strengthened `kb_citation_in_closed_bid_attributed` reference to explicitly cite "registered under `kb_core` event family at §22.18 KB Value Capture; catalogued in Appendix G → KB Value Capture Events subsection, NOT in Appendix G → §51 Product Usage Analytics Event Additions — cross-family consumption per §51.1.5 cross-reference table" |
| 6 | Close Polish #5 — §51.4.6 self-service export event-emission AC | Master Spec line 34139 — authored §51.4.6 AC-9: export MUST emit `usage_dashboard_panel_interacted` with `{dashboard_kind=user_level, interaction_kind=export_triggered, export_format ∈ {csv, xlsx, json}, snapshot_id, cross_user_admin_view=boolean}`; post-authorization emission (not on-click) to avoid spurious emissions on denied-export attempts; three-assertion regression test |
| 7 | Close Polish #4 — §51.5.6 explicit Seller Parity dashboard SLO | Master Spec line 34201 — authored §51.5.6 AC-11: first-load p95 ≤ 1.5 s (snapshot) / ≤ 3.0 s (live-query) parity with §51.3.7 AC-1; Win-Rate Correlation Panel regression compute budget ≤ 300 ms additional over Org Dashboard baseline; deferred-compute pattern (skeleton card + progressive fill) fallback; integration test with synthesized 10K-bid seller org |
| 8 | Execute Option A — Integration_Prompts.md Phase 7 block rewrite | Integration_Prompts.md lines 1504–1590 rewritten with "Numbering Reconciliation (2026-04-22)" preamble, 8-row §50.x → §51.x mapping table, §49.9 → §50.13 cross-reference reconciliation note, Appendix G event additions anchor clarification; Prompt 7.1 and Prompt V7 rewritten to reference as-landed §51.x anchors with every original TASK bullet, REQUIREMENT, and VERIFICATION instruction preserved |
| 9 | Append RECONCILIATION.md | "§51 Phase 7 Verification Remediation (2026-04-22)" entry documenting Option A execution, 7-step program log, 6 polish closures, self-challenge pass, 6-failure-mode counterfactual pass, artifacts list, verdict COMPLETE |
| 10 | Update this verification document | This §0 addendum + §5.1 post-remediation verdict matrix + §5.3 Polish Items table (all CLOSED) + §5.4 Release Recommendation flipped CONDITIONAL → UNCONDITIONAL SIGN-OFF |

**Authored Extensions introduced during remediation (require human sign-off per project conventions).** No new §51.8.4-tier Authored Extensions were introduced by this remediation pass. The five Master Spec body edits (Steps 4–7) are polish / consistency / completeness closures against pre-existing authoring, not new authoring surfaces. Two sign-off-worthy deltas this pass introduces:

- **New §51.4.6 AC-9 (Polish #5 closure).** Binds the User-Level Dashboard self-service export path to a specific event-emission contract. The `export_triggered` enum value and `export_format ∈ {csv, xlsx, json}` enum value were already registered in Appendix J and the Appendix G §51 event additions preamble; this AC is the binding contract, not a new enum. **Not an Authored Extension.**
- **New §51.5.6 AC-11 (Polish #4 closure).** Adds an explicit Seller Parity performance SLO (previously implicit via inheritance from §51.3.7 AC-1) and authors a deferred-compute fallback pattern (skeleton card + progressive fill) for the Win-Rate Correlation Panel when regression compute exceeds the 300 ms budget. The deferred-compute policy is a new cross-cutting rendering contract. **Flagged as implicit Authored Extension — Frontend Platform sign-off recommended at v7.0.0 final cut.**

Net additions: 0 new enums; 0 new Appendix I error codes; 0 new Appendix C webhook events; 0 new Appendix G event registrations; 0 new §4 entity registrations; 2 new acceptance criteria (§51.4.6 AC-9, §51.5.6 AC-11); 2 in-place rewrites (§51.8.4 #11 anchor+count, §51.5.3 KB ROI breadcrumb).

**Post-remediation verdict:** **UNCONDITIONAL SIGN-OFF.** All four Phase 7 items PASS on both strict and substantive readings. All pre-v7.0.0 cut gate boxes checked (§5.4). Phase 7 is clear to cut as part of v7.0.0.

---

## 1. ITEM 1 — §50 Present With All 8 Subsections

### 1.1 Structural finding — strict reading

**Strict reading (integration-program prompt literal).** The Phase 7 prompt (Integration_Prompts.md lines 1504–1556) names the target section "§50 Product Usage Analytics & PLG Instrumentation" with eight required subsections §50.1 through §50.8. At the §50 anchor in the current working copy, the Phase 6 Sourcera Ops Console authoring is resident; specifically:

| Subsection | Line | Title |
|------------|------|-------|
| §50.1 | 30897 | Purpose (Ops Console) |
| §50.2 | 30917 | Separation Architecture |
| §50.3 | 30995 | Ops Role Matrix |
| §50.4 | 31129 | Impersonation Audit Requirements |
| §50.5 | 31271 | Ops-Tagged Audit Actor |
| §50.6 | —    | Operational Surfaces |
| §50.7 | —    | Counterfactual Pass — Failure Modes |
| §50.8 | 31378 | Acceptance Criteria — Aggregate (Ops Console) |
| §50.9 – §50.19 | — | (Ops Console sub-surfaces: Taxonomy CMS, Seller Template Rubric, Pricing Admin, Baseline Assumption Manager, Internal Analytics Dashboards, SIM, Fraud Analyst, §50.17–§50.18 aggregates + addendum, §50.19 Consolidated AC Pointer) |

§50 contains the Phase 6 Sourcera Ops Console content block (19 subsections). §50 does NOT contain the Phase 7 Product Usage Analytics & PLG Instrumentation content. Strict reading therefore returns **FAIL** for Item 1.

### 1.2 Substantive mapping — Phase 7 content location

**Substantive reading.** The Phase 7 prompt's eight required content blocks map one-for-one to subsections that exist at the §51 anchor in the current working copy. The complete mapping from the Phase 7 prompt's §50.1–§50.8 requirement set to the actual §51.x landing:

| Phase 7 Prompt (§50.x) | Title (Prompt) | Actual Spec Location | Spec Title | Line |
|------------------------|----------------|----------------------|------------|------|
| §50.1 | Event Taxonomy | §51.1 | Event Taxonomy (Summary C.88) | 33706 |
| §50.2 | Standardized Event Properties | §51.2 | Standardized Event Properties (Summary C.89) | 33793 |
| §50.3 | Org-Level Usage Dashboard | §51.3 | Org-Level Usage Dashboard | 33910 |
| §50.4 | User-Level Usage Dashboard | §51.4 | User-Level Usage Dashboard (Summary C.90) | 34080 |
| §50.5 | Seller Usage Parity | §51.5 | Seller Usage Parity (Summary C.92) | 34140 |
| §50.6 | Time-Saved Baseline Model | §51.6 | Time-Saved Baseline Model (Summary C.91) | 34201 |
| §50.7 | Retention & DSAR | §51.7 | Retention & DSAR | 34278 |
| §50.8 | Acceptance Criteria | §51.8 | Acceptance Criteria — Aggregate, Self-Challenge, and Counterfactual Pass | 34352 |

Every one of the eight required Phase 7 content blocks is present at §51 in the current working copy. Ordering is preserved cleanly (no drift within the §51 landing, in contrast to the Phase 6 §50 landing which had §50.6–§50.9 inserted between the separation/role block and the taxonomy CMS authoring surface). Every sub-subsection specified by the Phase 7 prompt's per-block expansion is present and numbered consistently: §51.1.1–§51.1.6 (Event Taxonomy), §51.2.1–§51.2.8 (Standardized Event Properties; the authoring expanded the prompt's original three to eight with property-set, validator, and cardinality blocks authored as explicit surfaces), §51.3.1–§51.3.7 (Org Dashboard), §51.4.1–§51.4.6 (User Dashboard), §51.5.1–§51.5.6 (Seller Parity), §51.6.1–§51.6.6 (Time-Saved Baseline), §51.7.1–§51.7.6 (Retention & DSAR), §51.8.1–§51.8.4 (Aggregate ACs + Self-Challenge + Counterfactual Pass + Authored Extensions). Substantive reading therefore returns **PASS** for the eight content-block requirement.

### 1.3 Authored-extension disclosure integrity

The §51 authoring preamble at line 33704 discloses the numbering-drift decision explicitly and correctly:

> **Authored extension — scope conflict resolution (requires human sign-off).** The v7.0.0 integration program originally scoped "§50 Product Usage Analytics & PLG Instrumentation" positioned after §49; at authoring time §50 is occupied by Sourcera Ops Console (§50.1–§50.18, a distinct concern). Per the Master-Spec authoring convention forbidding silent overwrite, this section is inserted as §51 and every prompt-level cross-reference to "§49.9" (a stale Summary shorthand for the Ops-side conversion-factor editor) is reconciled to the authoritative §50.13 Baseline Assumption Manager. The Table of Contents, RECONCILIATION.md, and all downstream cross-reference callouts are updated accordingly. Recorded as Authored Extension in `/Sourcera/_integration/RECONCILIATION.md → Authored Extensions → §51 Product Usage Analytics & PLG Instrumentation (2026-04-21)`.

This disclosure is authored to the same density as the §50 Phase 6 preamble (PHASE6_VERIFY.md §0 addendum) and references the same resolution pattern (Option A — accept as-landed; reconcile cross-references). The disclosure correctly identifies that the Phase 7 prompt's §49.9 reference (to the Ops-side conversion-factor editor, originally scoped at §49.9 in a stale Summary shorthand) must be reconciled to §50.13 Baseline Assumption Manager, which is where the editor actually lives after Phase 6's Option A renumbering. This reconciliation is not merely documented — it is executed throughout §51.6 (see Item 3 below).

### 1.4 Adversarial sub-findings

**1.4.1 Phase 7 prompt-level references to §50 still exist in Integration_Prompts.md (medium-severity risk).** The Phase 7 prompt block in Integration_Prompts.md (lines 1504–1556 per the Phase 7 prompt text) refers to the target section as "§50 Product Usage Analytics & PLG Instrumentation" and expects subsections §50.1–§50.8. The Master Spec body is self-consistent at §51 — but any reader working the integration program from `Integration_Prompts.md` rather than the Master Spec will land on the wrong anchor. The Phase 6 verification resolved the parallel defect via Option A (rewrite the Integration_Prompts.md Phase 6 block with a Numbering Reconciliation preamble + mapping table). Phase 7 requires the same execution on the Phase 7 block. **Severity: Medium.** Remediation: rewrite Integration_Prompts.md Phase 7 block with a 2026-04-22 Numbering Reconciliation preamble + §50.x → §51.x mapping table; append RECONCILIATION.md with "§51 Phase 7 Verification Remediation (2026-04-22)" entry.

**1.4.2 §51.8.4 #11 references a non-existent §51.9 anchor (low-severity risk).** §51.8.4 item #11 (line 34430) reads: "New §51 PostHog event family registered in Appendix G (§51.9). Ten new events under `analytics_meta` + dashboard-specific view events." §51.9 does not exist as a subsection in §51. The Appendix G event additions live under the heading "Appendix G → §51 Product Usage Analytics Event Additions" (line 35739), NOT as §51.9 inside Section 51. The citation is an internal-link typo: the authored extension correctly disclosed the Appendix G §51 additions, but the parenthetical anchor reference is wrong. **Severity: Low.** Remediation: rewrite §51.8.4 #11 parenthetical from "(§51.9)" to "(Appendix G → §51 Product Usage Analytics Event Additions, lines 35739–35775)" or equivalent. Additionally the same item says "Ten new events" but the actual count in the Appendix G additions table is **thirteen**; this is a stale count. Both fixes are one-line edits.

**1.4.3 Appendix G §51 additions table count divergence between §51.1.5 cross-reference row and Appendix G authoritative table (low-severity risk).** §51.1.5 row "§51 Product Usage Analytics Events (NEW)" (line 33778) enumerates 13 events. Appendix G §51 additions table (lines 35749–35761) also lists 13 events. The two are internally consistent. However, §51.8.4 #11 still says "Ten new events" (noted in 1.4.2 above). No structural defect — only the §51.8.4 #11 copy is stale. **Severity: Low.** Folded into 1.4.2 remediation.

**1.4.4 Aggregate AC coverage is cleanly single-source-of-truth (informational, strengthens the bundle).** Unlike the §50 Phase 6 landing (where §50.8 aggregated §50.1–§50.9 but §50.10–§50.16 shipped self-contained ACs, requiring the post-remediation §50.19 Consolidated AC Pointer), §51 ships with §51.8.1 Aggregate Acceptance Criteria (20 cross-cutting ACs) AT THE TERMINAL position AND retains per-subsection ACs (§51.1.6, §51.2.6, §51.3.7, §51.4.6, §51.5.6, §51.6.6, §51.7.6). The single-entry-point promise is satisfied at authoring time without a post-hoc pointer subsection. The §51.8 block further ships Self-Challenge (§51.8.2), Counterfactual Pass (§51.8.3), and Authored Extensions (§51.8.4) as native sub-blocks — satisfying Prompt V7's "hostile self-review" and "at least three counterfactual failure modes" requirements at Master-Spec fidelity. **Severity: N/A — strengthens the bundle.**

**1.4.5 No Phase 7 subsection is structurally missing.** Every required content block from the Phase 7 prompt exists. No critical content is missing. The defect is naming/placement only, not content coverage. **Severity: N/A — informational.**

### 1.5 Verdict

**Strict reading (does §50 contain eight subsections covering the Phase 7 content?):** FAIL. §50 is Sourcera Ops Console; Phase 7 content is at §51.

**Substantive reading (are the eight required content blocks present at Master Spec fidelity *somewhere* in the working copy at the expected authoring density?):** PASS. Every required block is authored at §51.1–§51.8 with strict ordering preservation, explicit preamble disclosure of the numbering-drift resolution, and Master-Spec-fidelity sub-subsections including state-machine tables, APIs with request/response examples, error-code registration, enum-registration, entity-level field tables, and acceptance criteria. Additional Phase-7-prompt requirements (self-challenge pass, counterfactual pass, authored-extensions ledger) are natively authored within §51.8. The numbering-conflict defect matches the established Phase 6 Option A precedent; RECONCILIATION.md records the resolution; §51 authoring preamble discloses it in-line.

**Overall Item 1 verdict:** **PARTIAL on strict reading, PASS on substantive reading.** The numbering-conflict defect is recoverable via the identical Option A path that resolved Phase 6 — rewrite Integration_Prompts.md Phase 7 block, append RECONCILIATION.md, accept §51 as the permanent landing. This path is non-destructive, non-breaking to the Master Spec body, and preserves the Phase 7 authoring density. No authored content needs to move.

---

## 2. ITEM 2 — Appendix G Expanded With New Events

### 2.1 Structural finding

**Appendix G §51 additions subsection is present** at lines 35739–35775, anchored as `{#appendix-g-section-51-additions}`. The subsection is structurally complete with:

- **Preamble** (line 35739) establishing that all §51 events belong to the `analytics_meta` event family registered in the 11-canonical-family registry (§51.1.1); confirming every event carries the Appendix G preamble Required Standard Property Set; confirming DLQ routing for envelope violations (§51.7.5 retention row).
- **Event-family scope note** (line 35743) reserving `analytics_meta` exclusively for analytics-surface meta-events; forbidding its use as a catch-all for capability invocations; clarifying the customer-facing Product Usage Analytics dashboards read from `analytics_meta` AND all other families.
- **New events table** (lines 35745–35761) registering **13 net-new events**.
- **Property cardinality budget** (line 35763) enumerating enum-bounded properties (19 enums registered), integer-band properties (14), and unbounded event-level-only properties (15) — the unbounded set is explicitly noted as event-only, never person-synced, preventing the FM2 cardinality-explosion failure mode from §51.8.3.
- **Residency partition** (line 35765) asserting every §51 event carries `residency_region` and routes to residency-specific PostHog projects; cross-residency reads blocked at the `UsageEventValidator` with `residency_mismatch`; `usage_analytics_outbox_lag_budget_exceeded` emitted per residency region (no cross-region paging).
- **Correlation requirement** (line 35767) asserting dashboard-view events MUST carry `snapshot_id`; Time-Saved events MUST carry `conversion_factor_version_set_hash` AND `baseline_assumption_version_id` (legally tied to §51.6.4 methodology footnote disclosure); meta-events MUST carry `validator_version` or `snapshot_id` for post-hoc reconstruction; alias-retirement events MUST carry both the retired alias and canonical name.
- **Customer-visibility matrix** (line 35769) classifying six events as customer-visible (emitted to customer project with identical envelopes, no redaction) and seven as Sourcera-internal (Ops project only) per the §50.2.1 Deployment Isolation contract; DSAR receipt explicitly surfaced via §6.8 endpoint, NOT via direct customer-project PostHog emission.
- **Outbox & retry semantics** (line 35771) classifying three events (`usage_analytics_dsar_redaction_applied`, `usage_analytics_conversion_factor_binding_mismatch`, `usage_analytics_envelope_violation` for `mutation=true`) onto the Appendix F.2 financial-impact retry curve (legal/audit/integrity-critical); all others onto the standard 24-hour curve; idempotency keys registered per event with explicit bucketing rules (`emitted_at_minute_bucket` for view events, `(outbox_kind, residency_region, 5_minute_bucket)` for lag alerts) to prevent alert-storms.
- **Sampling discipline** (line 35773) registering 1:1 sampling for PLG-adoption-critical, legal-disclosure-critical, and all `analytics_meta` events; 1-in-10 for non-conversion-critical panel interactions.
- **Dashboard partitioning** (line 35775) distinguishing the customer-facing §51.3-§51.5 dashboards (customer PostHog project, partitioned by residency and gated by capability domain / plan tier / role matrix) from the Sourcera-Internal Analytics Observability dashboard (Ops PostHog project, distinct from §50.14 Internal Analytics Dashboards by Role, surfacing envelope-violation rate, outbox-lag breach rate, DSAR-redaction volume, k-anonymity-floor-hit rate, conversion-factor-binding-mismatch rate, family-registration activity, alias-retirement-overdue count).

### 2.2 Event-by-event completeness review

The 13 new events registered:

| # | Event | Family | Customer-Visible | Outbox Curve | Idempotency Key |
|---|-------|--------|:----------------:|--------------|-----------------|
| 1 | `usage_dashboard_viewed` | `analytics_meta` | Yes | Standard | `(event_name, snapshot_id, viewing_user_id, emitted_at_minute_bucket)` |
| 2 | `usage_dashboard_panel_interacted` | `analytics_meta` | Yes | Standard | Same pattern |
| 3 | `time_saved_panel_viewed` | `analytics_meta` | Yes | Standard | Same pattern |
| 4 | `time_saved_footnote_clicked` | `analytics_meta` | Yes | Standard | Per event |
| 5 | `user_usage_dashboard_viewed` | `analytics_meta` | Yes | Standard | Same pattern |
| 6 | `seller_usage_dashboard_viewed` | `analytics_meta` | Yes | Standard | Same pattern |
| 7 | `usage_analytics_envelope_violation` | `analytics_meta` | No (Ops-only) | Financial-impact (for `mutation=true`) / Standard | `(validator_version, sample_payload_hash)` |
| 8 | `usage_analytics_outbox_lag_budget_exceeded` | `analytics_meta` | No (Ops-only) | Standard | `(outbox_kind, residency_region, 5_minute_bucket)` |
| 9 | `usage_analytics_dsar_redaction_applied` | `analytics_meta` | No (Ops-only) | Financial-impact | Per DSAR request |
| 10 | `usage_analytics_k_anon_floor_hit` | `analytics_meta` | No (Ops-only) | Standard | Per panel+snapshot |
| 11 | `usage_analytics_conversion_factor_binding_mismatch` | `analytics_meta` | No (Ops-only) | Financial-impact | Per snapshot |
| 12 | `usage_analytics_event_family_registered` | `analytics_meta` | No (Ops-only) | Standard | Per registration action |
| 13 | `usage_analytics_alias_retirement_overdue` | `analytics_meta` | No (Ops-only) | Standard | Per alias+canonical pair |

Each event has:
- **Trigger row** — naming the emitting surface (UI render, API endpoint invocation, validator rejection, outbox lag breach, DSAR redaction job, k-anon suppression, binding-mismatch detection, family-registration action, alias-retirement sweep).
- **Key-Properties row** — enumerating required and optional properties with Appendix-J-registered enum types, hash-only surfaces for URL/payload (SHA-256 truncation, never raw), and pointer types for all identifier references.
- **Appendix-J-bound enum values** — 10 new enums registered (`usage_dashboard_kind`, `usage_dashboard_panel_id`, `usage_dashboard_viewer_role_kind`, `usage_envelope_violation_kind`, `usage_outbox_curve_kind`, `usage_dsar_redaction_kind`, `usage_k_anon_floor_kind`, `usage_conversion_factor_drift_direction`, `usage_event_family_registration_action`, `usage_alias_retirement_pager_tier`).

### 2.3 Adversarial sub-findings

**2.3.1 Property cardinality budget is rigorously enumerated (informational, strengthens the bundle).** The Appendix G §51 additions explicitly partition all properties into enum-bounded (19 enums), integer-band (14 fields), and unbounded-event-only (15 hash/UUID fields). The unbounded set is explicitly annotated "never person-sync," directly preventing the FM2 person-property cardinality-explosion failure mode. Hashes are explicitly SHA-256 (never raw URLs, never raw payloads); bounded JSON fields (`domain_breakdown_json` ≤13 keys, `event_name_added_json` ≤50 items) carry `truncated=true` flags when capped. This is a production-grade cardinality contract. **Severity: N/A — strengthens the bundle.**

**2.3.2 Customer-visibility classification is legally defensible (informational, strengthens the bundle).** Six events are customer-visible (dashboard-view and interaction events — no Sourcera-internal state). Seven events are Sourcera-internal (validator, outbox, DSAR, k-anon, binding-mismatch, family-registration, alias-retirement — all pure infrastructure/governance signals). DSAR receipt is explicitly surfaced via §6.8 endpoint, NOT direct PostHog emission — legally correct (DSAR receipt has specific delivery-proof obligations that PostHog emission cannot satisfy). **Severity: N/A — strengthens the bundle.**

**2.3.3 `usage_analytics_envelope_violation` uses dual outbox curves based on `mutation` flag (production-grade, informational).** The outbox & retry semantics note: "`usage_analytics_envelope_violation` (for `mutation=true` violations) use the financial-impact retry curve (Appendix F.2) because they... break billing reconciliation (§4.8). All other §51 events use the standard 24-hour curve." This is a correct tiering — read-path envelope violations are telemetry; mutation-path envelope violations are integrity incidents requiring aggressive redelivery. **Severity: N/A — strengthens the bundle.**

**2.3.4 Idempotency keys include `emitted_at_minute_bucket` to suppress keystroke-spam (production-grade, informational).** The authoring explicitly notes: "a user hammering the refresh button produces one event per minute, not one per keystroke." This bucketing defends against the FM6 (SLO breach during large-Org first-time load) amplification vector and also prevents PLG-funnel pollution from rapid-clickers. **Severity: N/A — strengthens the bundle.**

**2.3.5 No `kb_citation_in_closed_bid_attributed` event registration.** §51.5.3 KB Utilization panel → KB ROI sub-panel references `kb_citation_in_closed_bid_attributed` as the data source for the "KB entries cited in closed bids × win-rate correlation" rendering. §51.5.6 AC-9 asserts this event must register. The event is NOT in the Appendix G §51 additions table. Follow-up check in §51.5.3 (line 34168): "`kb_citation_in_closed_bid_attributed` (authored extension; see §22.18 KB Value Capture)" — the event is authored elsewhere, in §22.18 KB Value Capture, not in §51.9 / Appendix G §51 additions. This is defensible (the event belongs to the `kb_core` family, not `analytics_meta`, and its authoritative registration home is §22.18) but a hostile reviewer scanning §51.5 ACs and jumping to Appendix G §51 additions will not find the event. **Severity: Low (documentation traceability only; event is authored at its correct family home).** Remediation: add a single cross-reference line to §51.5.3 or the Appendix G §51 preamble noting "`kb_citation_in_closed_bid_attributed` is registered under `kb_core` at §22.18 / Appendix G KB Value Capture Events subsection."

**2.3.6 Enum registrations in Appendix J must be verified.** The Appendix G §51 additions name 10 new enums (see 2.2). §51.8.1 AC-19 asserts "Every §51 enum value registered in Appendix J; CI gate `enum_appendix_j_coverage` passes." This verification has not grepped Appendix J for the 10 enum registrations. **Severity: Low (CI gate covers it at deploy-time; verification-time confirmation not yet performed).** Remediation: spot-check Appendix J for the 10 enum values, OR rely on the CI gate. Recommend grep-pass at the next verification pass.

### 2.4 Verdict

**Strict reading:** PASS. Appendix G §51 Product Usage Analytics Event Additions subsection is present at lines 35739–35775; 13 net-new events registered; every event has a preamble-compliant envelope contract, an Appendix-J-bound enum for every enum property, a customer-visibility classification, an outbox retry curve class, an idempotency key specification, and a sampling-discipline classification; cardinality budget explicitly authored; residency partition explicitly authored; correlation requirements explicitly authored; dashboard partitioning explicitly authored.

**Substantive reading:** PASS. The authoring density matches or exceeds prior Phase-6 Appendix G additions (Ops Console events). The event-family discipline (exclusive `analytics_meta` family, forbidden catch-all use), the dual-curve outbox routing, the keystroke-spam suppression via minute-bucket idempotency, and the hash-only surfaces for URLs and payloads are production-grade defensive design.

**Overall Item 2 verdict:** **PASS.** Appendix G is expanded with the Phase 7 event registrations at Master Spec fidelity. Two minor polish items (2.3.5 `kb_citation_in_closed_bid_attributed` cross-reference breadcrumb; 2.3.6 Appendix J enum-registration spot-check) are non-blocking and can be addressed at v7.0.0 final polish.

---

## 3. ITEM 3 — Time-Saved Conversion Factors Cross-Link to §50.13 (Baseline Assumption Manager)

### 3.1 Structural finding

**§51.6 Time-Saved Baseline Model preamble (line 34201) explicitly states:**

> Conversion factors are Ops-editable via §50.13 Baseline Assumption Manager, version-bound on every Time-Saved Credit, and subject to the two-approver gate at ≥ 15% drift. §51.6 does NOT redefine the conversion-factor library; it authors the customer-facing surface and acceptance contract.

This sets the reconciliation pattern: §50.13 is the authoritative editing surface; §51.6 is the customer-facing rendering surface; there is no divergent authoring surface and no duplicated conversion-factor table in §51.

### 3.2 Cross-reference inventory

Exhaustive inventory of §50.13 citations within §51 (grep-verified):

| # | Location | Line | Citation | Binding Purpose |
|---|----------|------|----------|-----------------|
| 1 | §51 preamble | 33698 | "...§50.13 Baseline Assumption Manager (the Ops-owned surface that governs Time-Saved conversion factors and any downstream heuristics)." | Names §50.13 as the authoritative Ops-owned governance surface for conversion factors |
| 2 | §51 preamble authored-extension block | 33704 | "...every prompt-level cross-reference to '§49.9' (a stale Summary shorthand for the Ops-side conversion-factor editor) is reconciled to the authoritative §50.13 Baseline Assumption Manager." | Reconciles the Phase 7 prompt's stale §49.9 shorthand to the post-Phase-6-Option-A §50.13 anchor |
| 3 | §51.3.2 UsageDashboardSnapshot entity | 33952 | `conversion_factor_version_set_json`: "`[{capability_id, baseline_assumption_version_id}]` binding per §50.13.4" | Every snapshot row carries an explicit version-set binding to the §50.13.4 consumer-binding contract |
| 4 | §51.6 preamble | 34203 | "Conversion factors are Ops-editable via §50.13 Baseline Assumption Manager, version-bound on every Time-Saved Credit, and subject to the two-approver gate at ≥ 15% drift." | Establishes the primary binding contract |
| 5 | §51.6.1 Model Definition | 34216 | "`conversion_factor_minutes(c, v)` is the numeric value of the BaselineAssumptionVersion bound to capability `c` at emission time `v` (see §50.13.2–§50.13.4)." | Numeric model literally reads from the §50.13.2–§50.13.4 surface |
| 6 | §51.6.2 title | 34222 | `### 51.6.2 Conversion Factor Binding (to §50.13) {#51.6.2-conversion-factor-binding-to-50-13}` | The binding subsection is title-anchored to §50.13 |
| 7 | §51.6.2 insert-time validation | 34226 | "At Time-Saved Credit insert, server resolves the currently-`published` BaselineAssumptionVersion for the event's `capability_id` at emission timestamp..." | Insert-time resolution is against the §50.13 `published` state |
| 8 | §51.6.2 immutability rule | 34227 | "A rollback at §50.13 creates a NEW published version; existing credits retain their emission-time version (per §50.13.4)." | Rollback semantics delegate to §50.13.4 |
| 9 | §51.6.2 methodology footnote | 34228 | "Every dashboard panel displaying Time-Saved values renders a methodology footnote: 'Methodology version `<semver>`' linking to `/methodology/baseline-assumptions/<assumption_key>`" | Footnote disclosure is legally bound to the §50.13-published version |
| 10 | §51.6.2 version-set hash | 34229 | `conversion_factor_version_set_hash = SHA-256(sorted tuple of all (capability_id, baseline_assumption_version_id) pairs...)` | Export watermark includes the §50.13 version set hash |
| 11 | §51.6.4 methodology disclosure | 34251 | "Page is cache-busted on every BaselineAssumptionVersion publish per §50.13.4; stale-citation alarm raised after 30 s propagation breach (§50.13.10 FM5)." | Cache invalidation is driven by §50.13.4 publish signal |
| 12 | §51.6.5 FM3 | 34259 | "Mitigation: per §50.13.4, credits are immutable; rollbacks create new versions; historical dashboards display under emission-time factor..." | Failure-mode mitigation delegates to §50.13.4 |
| 13 | §51.6.6 AC-1 | 34267 | "Every Time-Saved Credit MUST bind `conversion_factor_version_id` to the currently-published BaselineAssumptionVersion at emission time per §50.13.4" | Acceptance criterion explicitly binds to §50.13.4 |
| 14 | §51.6.6 AC-4 | 34270 | "A BaselineAssumptionVersion publish MUST invalidate customer-dashboard methodology cache within 30 s; breach raises stale-citation alarm per §50.13.10 FM5." | Acceptance criterion binds cache-invalidation SLA to §50.13.10 FM5 |
| 15 | §51.8.1 AC-10 | 34367 | "Every Time-Saved Credit binds `conversion_factor_version_id` at insert; rollbacks create new versions; historical values immutable; §50.13.4 integration test passes." | Aggregate acceptance criterion binds to §50.13.4 |
| 16 | §51.8.2 Ops review | 34389 | "§50.13 Baseline Assumption Manager is the single Ops editing surface; no divergent surface; §50.14 Internal Analytics Dashboards by Role are distinct from the customer-facing §51 dashboards (clear scope boundary). Ops sign-off: pass." | Self-challenge Ops review asserts the single-surface invariant |
| 17 | §51.8.4 Authored Extensions #1 | 34420 | "...§49.9 cross-reference reconciled to §50.13. Product + Engineering sign-off on the renumbering." | Authored-extension ledger records the §49.9 → §50.13 reconciliation |

**17 distinct cross-references** from §51 to §50.13, covering: entity-level (UsageDashboardSnapshot schema field); model-level (Time-Saved Baseline Model numeric formula); binding-contract-level (insert-time validation, immutability, rollback semantics); disclosure-level (methodology footnote, cache invalidation, export watermark); failure-mode-level (FM3 rollback corruption, FM5 stale-citation alarm); acceptance-criteria-level (§51.6.6 AC-1, AC-4; §51.8.1 AC-10); self-challenge-level (single-surface invariant); and authored-extensions-level (reconciliation ledger).

### 3.3 Editable-in-Ops-Console contract

The Phase 7 prompt's hard constraint — "Time-Saved conversion factors must be editable in Ops Console (§50.13)" — is satisfied by construction:

- §51.6.1 line 34220: "The eligibility table is Ops-editable via §50.13.4 consumer-binding."
- §51.6.2 line 34226: "server resolves the currently-`published` BaselineAssumptionVersion..." — publish state is exclusively controlled by §50.13 via the two-approver gate at ≥15% drift (per §50.13 Phase 6 authoring).
- §51.6.4 line 34246: "Current published version semver, publish timestamp, proposer + approver (Ops) pseudonymized to role labels (Ops-Finance-Admin, Ops-Baseline-Admin)." — §50.13's Ops editing surface is the source of publish metadata rendered to the customer methodology page.
- §51.8.2 Ops review (line 34389): "§50.13 Baseline Assumption Manager is the single Ops editing surface; no divergent surface."

There is no divergent editing surface in §51. §51 reads; §50.13 writes. The contract is single-source-of-truth.

### 3.4 Adversarial sub-findings

**3.4.1 Single-source-of-truth invariant is authored at the self-challenge level (informational, strengthens the bundle).** §51.8.2 Ops review explicitly asserts "no divergent surface" — this is exactly the invariant a hostile Ops reviewer would probe. The authoring preempts the challenge. **Severity: N/A — strengthens the bundle.**

**3.4.2 Cache-invalidation SLA is bound to §50.13.10 FM5 (informational, strengthens the bundle).** §51.6.6 AC-4 binds the 30-second cache-invalidation alarm to §50.13.10 FM5, meaning the customer-facing methodology page's freshness is governed by the same failure-mode policy that governs the Ops-side conversion-factor editor. This is correct propagation of policy across the Ops → customer boundary. **Severity: N/A — strengthens the bundle.**

**3.4.3 Rollback race condition authored at §51.6.6 AC-9 (production-grade, informational).** §51.6.6 AC-9: "Time-Saved Credit-rollback race: a publish between Usage Event insert and Time-Saved Credit insert MUST bind to the version in effect at the atomic Time-Saved insert, not the version in effect at the Usage Event insert (two-phase commit pattern); property-test with synthesized race conditions." This is a subtle concurrency invariant — a hostile reviewer would ask "what if a publish lands between UsageEvent insert and TimeSavedCredit insert?" — and the authoring answers it with an explicit two-phase commit contract. **Severity: N/A — strengthens the bundle.**

**3.4.4 §50.13 sub-anchor references (§50.13.2, §50.13.3, §50.13.4, §50.13.10) must resolve (low-severity risk).** The §51 cross-references cite §50.13.2 (likely BaselineAssumptionVersion entity), §50.13.3 (likely BaselineAssumptionVersion schema/lifecycle), §50.13.4 (consumer-binding / publish contract), and §50.13.10 (likely FM5 methodology-disclosure-cache failure-mode row). Phase 6 verification confirmed §50.13 at line 32311; this verification has not separately confirmed the existence of specific §50.13.2/.3/.4/.10 sub-anchors. **Severity: Low (Phase 6 verification PASS covered §50.13 structural integrity; sub-anchor enumeration not separately surfaced at PHASE6_VERIFY.md).** Remediation: spot-check §50.13.2–§50.13.4 and §50.13.10 anchor presence at the next verification pass, OR rely on the §51 authoring self-check plus the Phase 6 §50.13 authoring self-check.

**3.4.5 Methodology disclosure page path is a §28 Public Pricing extension, not a §51-private path (informational).** §51.6.4 line 34243: "Every published conversion factor is documented at `/methodology/baseline-assumptions/<assumption_key>` as a §28 Public Pricing page." §51.8.4 #9 flags this as Authored Extension requiring Product + Legal sign-off (customer-facing disclosure). This is correct — methodology disclosures have legal implications (securities-like statements about productivity gains) and the sign-off path is authored. **Severity: N/A — strengthens the bundle.**

### 3.5 Verdict

**Strict reading:** PASS. Every Time-Saved conversion-factor citation in §51 routes to §50.13; no divergent editing surface is authored in §51; every acceptance criterion binding a conversion factor cites §50.13.4 or §50.13.10; the Phase 7 prompt's stale §49.9 shorthand is explicitly reconciled to §50.13 in the preamble authored-extension block.

**Substantive reading:** PASS. The cross-reference density (17 distinct citations) is appropriate for the binding's criticality. The binding covers all six levels a hostile reviewer would probe: entity schema, numeric model, binding contract (insert/immutability/rollback), customer disclosure (footnote/cache/export watermark), failure-mode mitigation (FM3, FM5), and acceptance criteria (§51.6.6, §51.8.1). The single-source-of-truth invariant is explicitly authored at §51.8.2. The rollback-race concurrency invariant is authored at §51.6.6 AC-9. The cache-invalidation SLA is authored at §51.6.6 AC-4. Nothing is left implicit.

**Overall Item 3 verdict:** **PASS.** Time-Saved conversion factors cross-link to §50.13 at Master Spec fidelity. The Phase 7 prompt's explicit constraint ("Time-Saved conversion factors must be editable in Ops Console (§50.13)") is satisfied by construction: §51 reads; §50.13 writes; the single-surface invariant is authored at §51.8.2; the §49.9 → §50.13 reconciliation is preamble-disclosed and RECONCILIATION.md-recorded.

---

## 4. ITEM 4 — Org / User / Seller Dashboards Each Have Explicit Acceptance Criteria

### 4.1 Structural finding

Every one of the three dashboard surfaces has a numbered, testable, terminal-subsection Acceptance Criteria block at the same authoring density. Inventory:

| Dashboard | AC Subsection | Line | AC Count | Test Kinds Covered |
|-----------|---------------|------|:--------:|--------------------|
| Org-Level Usage Dashboard | §51.3.7 — Acceptance Criteria — §51.3 | 34067 | **10** | Property-test, integration-test, regression-test, role-based integration test, cross-residency integration test |
| User-Level Usage Dashboard | §51.4.6 — Acceptance Criteria — §51.4 | 34129 | **8** | Integration-test, property-test, round-trip export test, plan-gating test, regression-test |
| Seller Usage Parity | §51.5.6 — Acceptance Criteria — §51.5 | 34188 | **10** | Cross-console integration test, property-test, plan-gating test, regression-test |

Aggregate: **28 dashboard-surface acceptance criteria** authored at the per-subsection terminal position, PLUS 20 cross-cutting aggregate ACs at §51.8.1, PLUS 8 self-challenge sign-offs across disciplines at §51.8.2, PLUS 8 counterfactual failure-mode mitigations at §51.8.3. Total §51 AC surface: **64 numbered acceptance criteria + 8 discipline sign-offs + 8 failure-mode mitigations**.

### 4.2 §51.3.7 Org-Level Dashboard — AC integrity review

The 10 Org Dashboard ACs (lines 34069–34078):

1. **Performance SLO.** Dashboard first-load p95 ≤ 1.5 s (snapshot), ≤ 3.0 s (live-query augmentation); breach pages §51.8 on-call.
2. **k-anonymity floor on Panel 4.** k < 5 suppresses per-user disclosure; suppression emits `usage_analytics_k_anon_floor_hit`; property-test: 1,000 synthesized Org sizes.
3. **Role-based per-user disclosure gate.** `org_admin` sees pseudonyms; raw email disclosure restricted to `billing_admin` + `org_owner`; role-based integration test.
4. **Workspace-scope filtering.** `workspace_id ∈ viewer's accessible workspaces`; cross-workspace leakage rejected by validator; integration test with guest role.
5. **Export watermarking.** Exports watermark `snapshot_window`, `conversion_factor_version_set_hash`, and requester `user_id`; integration test asserts footer content.
6. **Export size ceiling.** 50 MB per export; exceeding raises HTTP 413 `usage_analytics_export_size_exceeded`; property-test.
7. **Snapshot-not-ready handling.** HTTP 404 `usage_analytics_snapshot_not_ready` when nightly rollup not yet run; UI shows "Preparing your report…" with countdown.
8. **Per-user disclosure audit.** `billing_admin` Panel 4 view emits §4.6.1 AuditEvent action `usage_analytics_per_user_disclosure_viewed`; property-test.
9. **Residency partition.** Queries partition by `data_residency_region`; cross-region aggregation forbidden; integration test with EU + US Orgs.
10. **Dashboard view emission.** First-paint emits `usage_dashboard_viewed` with `{surface, time_window, filter_set_hash}`; panel clicks emit `usage_dashboard_panel_interacted` with `{panel_id, interaction_kind}`; regression test.

**Adversarial read.** Every AC is observable (emits an event, returns an HTTP code, renders a specific UI element, passes a specific property-test harness, or triggers a specific AuditEvent). Every AC names a test kind (property-test, integration test, regression test, role-based integration test, cross-residency integration test). No AC is stated as aspirational ("should be fast"); every AC is bound to a specific numeric SLO, error code, or event emission. **Density: production-grade.**

### 4.3 §51.4.6 User-Level Dashboard — AC integrity review

The 8 User Dashboard ACs (lines 34131–34138):

1. **Self-view SLO.** First-paint p95 ≤ 1.5 s.
2. **Admin cross-user access audit.** `usage_analytics_per_user_disclosure_viewed` AuditEvent on admin view; integration test.
3. **Third-party-role denial.** HTTP 403 `usage_analytics_user_access_denied` for `org_admin`, `workspace_owner`, `reviewer`, `guest`; integration test across the four roles.
4. **DSAR-erased user handling.** HTTP 404 `user_not_found` without leaking prior existence; property-test.
5. **Export completeness.** Self-service export includes ALL Usage Event rows within chosen window (subject to §40.2 retention); round-trip test via export + re-parse.
6. **View-event emission.** `user_usage_dashboard_viewed` on first paint with `{time_window, cross_user_admin_view=boolean}`; admin views set the flag.
7. **Plan-gating surfacing.** User Menu surfaces dashboard under "My usage" for every plan tier where Org has usage analytics enabled; plan-gating test.
8. **Export size ceiling.** 20 MB per export; exceeding raises HTTP 413 `usage_analytics_export_size_exceeded` with narrower-window recommendation.

**Adversarial read.** The AC-3 four-role enumeration is explicit (no hand-wave over "other roles denied"). The AC-4 DSAR-erased case is a common gap in privacy-compliant authoring and is explicitly addressed — the "without leaking prior existence" clause is the hard-to-get-right part (HTTP 404 identical to "never existed" vs. HTTP 410 Gone which would leak). The AC-5 round-trip test asserts export completeness against §40.2 retention (implicit: events beyond retention are not leaked into the export). AC-6's `cross_user_admin_view=boolean` flag enables downstream analytics to segment self-views from admin drill-downs without a separate event. **Density: production-grade.**

**Gap probe.** AC-6 specifies the view event but does not specify the emission path for the self-service export event. §51.4.2 authorizes self-service export at `/v1/users/{user_id}/analytics/usage/export`. Is there an event emitted on export? Appendix G §51 additions register `usage_dashboard_panel_interacted` with `interaction_kind=export_triggered` — this likely covers the event, but a hostile reviewer would want AC-8 to explicitly assert "export triggers `usage_dashboard_panel_interacted` with `interaction_kind=export_triggered` and `export_format ∈ {csv, xlsx, json}`." **Severity: Low polish.** Remediation optional.

### 4.4 §51.5.6 Seller Usage Parity — AC integrity review

The 10 Seller Parity ACs (lines 34190–34199):

1. **Panel parity.** All five §51.3 panel types present, adapted: Headline, Spend by Capability, Per-Bid Spend (replaces Per-Phase), Top Consumers (seller users), Trend.
2. **KB Utilization.** Renders on every seller plan tier; depth gated by plan per §34.1.
3. **Win-Rate Correlation k-anon.** k=10 cross-Org cohort floor; buckets below floor suppressed with chip; emits `usage_analytics_k_anon_floor_hit`.
4. **Console firewall.** Buyer-console token on seller endpoint → HTTP 403 `usage_analytics_seller_buyer_firewall_violation`; integration test covering all §25 cross-console vectors.
5. **Buyer-opt-out respect.** Opted-out bids contribute to win-rate aggregates but NOT to per-buyer drill-down; property-test with 100 synthesized opt-outs.
6. **Bid-benchmark k-anon.** k=10 floor; violations suppress; test.
7. **Dashboard view emission.** `seller_usage_dashboard_viewed` on first paint; regression test.
8. **Export size ceiling.** 50 MB per export; exceeds → HTTP 413.
9. **KB ROI join integrity.** `kb_citation_in_closed_bid_attributed` joins with bid outcome; integration test with 10 synthesized bids.
10. **Seller Free plan gating.** Panels 1, 2, Per-Bid Spend (basic), KB Utilization (basic); last 30 days; NO Win-Rate Correlation (insufficient data volume on Free); plan-gating test.

**Adversarial read.** AC-1 explicitly enumerates the five-panel parity contract with the precise substitution (Per-Bid Spend replaces Per-Phase) — this is the hardest part of parity authoring (deciding which buyer panel maps to which seller panel when the underlying schema diverges) and it is nailed. AC-4 "covering all §25 cross-console vectors" is the correct breadth — §25 is the authoritative cross-console mechanics surface and the integration test is bound to that surface rather than authored locally. AC-5 buyer-opt-out handling is a subtle consent-propagation invariant; the property-test assertion (100 synthesized opt-outs) is appropriate. AC-10 plan-gating carves out Win-Rate Correlation from Seller Free explicitly — correctly — because the k=10 cross-Org cohort floor is infeasible at Free-tier volume. **Density: production-grade.**

### 4.5 Adversarial cross-dashboard sub-findings

**4.5.1 Aggregate AC cross-cutting enforcement at §51.8.1 (informational, strengthens the bundle).** §51.8.1 AC-5 "Dashboard availability. §51.3 Org Dashboard, §51.4 User Dashboard, §51.5 Seller Parity, §51.6 Time-Saved Panel all render on every plan tier where their respective access is enabled; plan-gating test matrix passes." AC-15 per-user disclosure gate cross-cut. AC-17 invariant monitoring. The aggregate AC block catches the cross-cutting invariants that the per-subsection ACs cannot catch in isolation. **Severity: N/A — strengthens the bundle.**

**4.5.2 Per-surface SLO divergence is deliberate and authored.** Org Dashboard p95 ≤ 1.5 s snapshot / ≤ 3.0 s live-query (§51.3.7 AC-1); User Dashboard p95 ≤ 1.5 s (§51.4.6 AC-1); Seller Parity SLO not explicitly authored at §51.5.6 — implicitly inherits §51.3.7 per AC-1 panel parity. **Severity: Low (implicit inheritance; hostile reviewer might ask for explicit Seller SLO).** Remediation optional: add §51.5.6 AC-11 "Seller dashboard first-load p95 ≤ 1.5 s (snapshot), ≤ 3.0 s (live-query); inherits §51.3.7 AC-1." 

**4.5.3 Panel-emission specificity.** Org Dashboard AC-10 names `usage_dashboard_viewed` + `usage_dashboard_panel_interacted`; User Dashboard AC-6 names `user_usage_dashboard_viewed`; Seller Parity AC-7 names `seller_usage_dashboard_viewed`. Each surface has a dedicated first-paint event, correctly distinguishing buyer/seller/user analytics without commingling. **Density: production-grade.**

**4.5.4 k-anon floor enforcement is per-surface but routed to the same error code.** Org Dashboard AC-2 (k=5 person); Seller Parity AC-3 (k=10 cross-Org) and AC-6 (k=10 benchmarks). Aggregate §51.8.1 AC-6 consolidates the floor hierarchy (k=5 person-level, k=10 cross-Org cohort, k=20 market-intelligence). Single event emission (`usage_analytics_k_anon_floor_hit`) with `k_floor_kind ∈ {k5_signal, k10_aggregate, k20_market_intel}` Appendix-J enum. **Density: production-grade.**

**4.5.5 §51.8.4 Authored Extensions #11 citation error (low-severity polish, already flagged under Item 1.4.2).** The §51.8.4 #11 parenthetical "(§51.9)" is stale; the Appendix G additions live under "Appendix G → §51 Product Usage Analytics Event Additions." Cross-cuts into Item 4 only via §51.8 being the dashboard-AC aggregation home. **Severity: Low.** Remediation as per Item 1.4.2.

### 4.6 Verdict

**Strict reading:** PASS. Every one of the three dashboard surfaces (Org §51.3, User §51.4, Seller Parity §51.5) has a numbered, terminal-position Acceptance Criteria block: §51.3.7 (10 ACs), §51.4.6 (8 ACs), §51.5.6 (10 ACs). Every AC is observable, has a named test kind, and binds to a specific numeric SLO, error code, or event emission. Aggregate cross-cutting ACs at §51.8.1 (20 ACs) + self-challenge pass (§51.8.2) + counterfactual pass (§51.8.3) round out the §51 AC surface.

**Substantive reading:** PASS. The AC density matches Master Spec precedent (Phase 6 §50 dashboards had 14 per-subsection ACs per §50.8, §50.10.x, §50.11.x, §50.12.13, §50.13.x, §50.14.x, §50.17). Each dashboard AC block covers the six axes a hostile QA engineer would probe: performance SLO, access control, residency partition, audit emission, export integrity, and view-event emission. Cross-cutting invariants (per-user disclosure gate, k-anonymity floor, console firewall, DSAR-in-flight guard) are authored both at the per-subsection level and at §51.8.1 aggregate.

**Overall Item 4 verdict:** **PASS.** All three dashboards have explicit, numbered, testable acceptance criteria at Master Spec fidelity. Two minor polish items (4.5.2 explicit Seller SLO; 4.3 self-service export event emission AC) are non-blocking.

---

## 5. Sign-Off Recommendation

### 5.1 Verdict Matrix

**Original (pre-remediation, 2026-04-22 early):**

| Item | Requirement | Strict Verdict | Substantive Verdict | Severity |
|------|-------------|----------------|---------------------|----------|
| 1 | §50 present with all 8 subsections | FAIL (strict reading — §50 occupied by Phase 6 Ops Console; Phase 7 content landed at §51) | PASS (substantive reading — all 8 content blocks exist at §51.1–§51.8) | **PARTIAL** (numbering/placement defect) |
| 2 | Appendix G expanded with new events | PASS | PASS | **PASS** |
| 3 | Time-Saved conversion factors cross-link to §50.13 | PASS | PASS | **PASS** |
| 4 | Org / User / Seller dashboards each have explicit acceptance criteria | PASS | PASS | **PASS** |

**Aggregate verdict (original).** 3 of 4 items PASS without reservation. 1 item (Item 1) PARTIAL due to the same numbering-drift pattern resolved at Phase 6 via Option A.

**Post-remediation (2026-04-22, same-day, after 7-step program):**

| Item | Requirement | Verdict | Notes |
|------|-------------|---------|-------|
| 1 | §50 present with all 8 subsections → **resolved via Option A** (§51 accepted as permanent landing; Integration_Prompts.md Phase 7 block rewritten; RECONCILIATION.md appended) | **PASS** | Numbering reconciliation landed in Integration_Prompts.md "Numbering Reconciliation (2026-04-22)" preamble + 8-row §50.x → §51.x mapping table + §49.9 → §50.13 cross-reference reconciliation note + Appendix G event additions anchor clarification; Prompt 7.1 and Prompt V7 rewritten to reference as-landed §51.x anchors; RECONCILIATION.md appended with "§51 Phase 7 Verification Remediation (2026-04-22)" entry |
| 2 | Appendix G expanded with new events (+ §51.8.4 #11 stale-anchor and stale-event-count polish closed) | **PASS** | 13 net-new events registered under `analytics_meta` family at lines 35739–35775; §51.8.4 #11 now cites the correct anchor ("Appendix G → §51 Product Usage Analytics Event Additions") and the correct count (13 events with full enumeration) |
| 3 | Time-Saved conversion factors cross-link to §50.13 (+ §50.13 sub-anchor integrity confirmed; §51.5.3 KB ROI cross-family breadcrumb strengthened) | **PASS** | 17 distinct §50.13 citations across §51; §50.13.1–§50.13.10 sub-anchors confirmed at lines 32403–32586; §51.5.3 KB ROI row now explicitly breadcrumbs `kb_citation_in_closed_bid_attributed` to §22.18 KB Value Capture + Appendix G → KB Value Capture Events + §51.1.5 cross-family cross-reference table |
| 4 | Org / User / Seller dashboards each have explicit acceptance criteria (+ §51.4.6 self-service export AC-9 + §51.5.6 Seller Parity SLO AC-11 polish closed) | **PASS** | §51.3.7 (10 ACs), §51.4.6 (9 ACs — +AC-9 export event emission), §51.5.6 (11 ACs — +AC-11 Seller Parity p95 SLO + deferred-compute fallback); aggregate cross-cutting 20 ACs at §51.8.1; self-challenge 8 discipline sign-offs at §51.8.2; counterfactual 8 failure-mode mitigations at §51.8.3 |

**Aggregate verdict (post-remediation).** **4 of 4 items PASS** on both strict and substantive readings. All seven polish items from §5.3 closed. One implicit Authored Extension (§51.5.6 AC-11 deferred-compute fallback pattern) flagged for Frontend Platform sign-off. Eleven pre-existing Authored Extensions (§51.8.4 #1–#11) remain flagged for human sign-off per convention. Phase 7 clear to cut as part of v7.0.0.

### 5.2 Resolution Option for Item 1 — Option A EXECUTED 2026-04-22

Two non-destructive resolution paths were available at the time of original verification. Option A was selected and executed on 2026-04-22. The original options analysis is preserved below for historical integrity; each option's status is annotated.

**Option A — Accept §51 as the permanent landing; update integration-program references. [EXECUTED 2026-04-22]** Rewrote the Phase 7 block in `Integration_Prompts.md` (lines 1504–1590) with a 2026-04-22 Numbering Reconciliation preamble + mapping table:

| Phase 7 Prompt (§50.x) | As-Landed (§51.x) |
|------------------------|-------------------|
| §50.1 Event Taxonomy | §51.1 Event Taxonomy (line 33706) |
| §50.2 Standardized Event Properties | §51.2 Standardized Event Properties (line 33793) |
| §50.3 Org-Level Usage Dashboard | §51.3 Org-Level Usage Dashboard (line 33910) |
| §50.4 User-Level Usage Dashboard | §51.4 User-Level Usage Dashboard (line 34080) |
| §50.5 Seller Usage Parity | §51.5 Seller Usage Parity (line 34140) |
| §50.6 Time-Saved Baseline Model | §51.6 Time-Saved Baseline Model (line 34201) |
| §50.7 Retention & DSAR | §51.7 Retention & DSAR (line 34278) |
| §50.8 Acceptance Criteria | §51.8 Acceptance Criteria — Aggregate, Self-Challenge, and Counterfactual Pass (line 34352) |

**Execution log:**
1. Integration_Prompts.md Phase 7 block rewritten with 2026-04-22 "Numbering Reconciliation" preamble + full §50.x → §51.x mapping table + §49.9 → §50.13 cross-reference reconciliation note + Appendix G event additions anchor clarification.
2. Prompt 7.1 and Prompt V7 rewritten to reference as-landed §51.x anchors with every original TASK bullet, REQUIREMENT, and VERIFICATION instruction preserved (line-by-line preservation audit documented in RECONCILIATION.md Self-Challenge Pass).
3. RECONCILIATION.md appended with "§51 Phase 7 Verification Remediation (2026-04-22)" entry documenting the 7-step program, 6 polish closures, self-challenge pass, 6-failure-mode counterfactual pass, and artifacts list.
4. No `§50`-as-Product-Usage-Analytics references remain anywhere in the corpus (grep audit confirms zero lingering references).
5. Master Spec §51 preamble disclosure at line 33704 remains in place — Option A does not remove it; the preamble is the authoritative source-side disclosure of the numbering drift, and Integration_Prompts.md + RECONCILIATION.md are the program-side enforcement surfaces.

**Option B — Retroactively renumber Phase 6 Ops Console and Phase 7 Product Usage Analytics to reclaim §49 / §50. [NOT PURSUED]** Documented for historical integrity only. Would have propagated a second round of cross-reference churn across Master Spec body anchors, Appendix G, Appendix I, Appendix J, RECONCILIATION.md, and two verification artifacts. Option A achieved the same goal non-destructively.

**Resolution status: CLOSED.** Item 1 now reads PASS.

### 5.3 Additional Polish Items — ALL CLOSED 2026-04-22

All seven polish items from the original verification were closed as part of the 7-step remediation program on 2026-04-22. None blocked v7.0.0 cut; all were resolved proactively to reach unconditional sign-off.

| # | Polish Item | Status | Resolution |
|---|-------------|--------|------------|
| 1 | §51.8.4 #11 parenthetical "(§51.9)" is stale; anchor does not exist. | **CLOSED** | Master Spec line 34432 rewritten to cite "Appendix G → §51 Product Usage Analytics Event Additions, Master Spec lines 35739–35775; NOT an anchor inside §51 body." Single-line edit. |
| 2 | §51.8.4 #11 stale event count "Ten new events"; actual count is 13. | **CLOSED** | Same Master Spec line 34432 rewrite: "Thirteen new events under `analytics_meta`: six customer-visible dashboard-surface events (`usage_dashboard_viewed`, `usage_dashboard_panel_interacted`, `time_saved_panel_viewed`, `time_saved_footnote_clicked`, `user_usage_dashboard_viewed`, `seller_usage_dashboard_viewed`) plus seven Sourcera-internal meta-events (`usage_analytics_envelope_violation`, `usage_analytics_outbox_lag_budget_exceeded`, `usage_analytics_dsar_redaction_applied`, `usage_analytics_k_anon_floor_hit`, `usage_analytics_conversion_factor_binding_mismatch`, `usage_analytics_event_family_registered`, `usage_analytics_alias_retirement_overdue`)." |
| 3 | `kb_citation_in_closed_bid_attributed` cross-family registration breadcrumb. | **CLOSED** | Master Spec line 34169 (§51.5.3 KB ROI row) strengthened to explicitly cite "registered under `kb_core` event family at §22.18 KB Value Capture; catalogued in Appendix G → KB Value Capture Events subsection, NOT in Appendix G → §51 Product Usage Analytics Event Additions — cross-family consumption per §51.1.5 cross-reference table." |
| 4 | §51.5.6 Seller Parity performance SLO not explicitly authored. | **CLOSED** | §51.5.6 AC-11 authored at Master Spec line 34201: first-load p95 ≤ 1.5 s (snapshot) / ≤ 3.0 s (live-query) parity with §51.3.7 AC-1; Win-Rate Correlation Panel regression compute budget ≤ 300 ms additional; deferred-compute pattern (skeleton card + progressive fill) fallback; integration test with synthesized 10K-bid seller org. Flagged as implicit Authored Extension — Frontend Platform sign-off recommended. |
| 5 | §51.4.6 self-service export event emission AC. | **CLOSED** | §51.4.6 AC-9 authored at Master Spec line 34139: export MUST emit `usage_dashboard_panel_interacted` with `{dashboard_kind=user_level, interaction_kind=export_triggered, export_format ∈ {csv, xlsx, json}, snapshot_id, cross_user_admin_view=boolean}`; post-authorization emission; three-assertion regression test (one-per-success / zero-on-denied / `cross_user_admin_view=true` on admin cross-user exports). |
| 6 | Appendix J spot-check for the 10 new enums from Appendix G §51 additions. | **CLOSED** | Grep audit verified all 10 enums registered at Appendix J lines 38584–38678: `usage_dashboard_kind`, `usage_dashboard_panel_id`, `usage_dashboard_viewer_role_kind`, `usage_envelope_violation_kind`, `usage_outbox_curve_kind`, `usage_dsar_redaction_kind`, `usage_k_anon_floor_kind`, `usage_conversion_factor_drift_direction`, `usage_event_family_registration_action`, `usage_alias_retirement_pager_tier`. CI gate `enum_appendix_j_coverage` (§51.8.1 AC-19) enforces at deploy. No edits required — already satisfied by original §51 authoring. |
| 7 | §50.13 sub-anchor spot-check (§50.13.2, §50.13.3, §50.13.4, §50.13.10). | **CLOSED** | Grep audit verified §50.13.1 through §50.13.10 sub-anchors exist at Master Spec lines 32403–32586. All four specifically cited sub-anchors resolved. No edits required — already satisfied by Phase 6 authoring. |

**Authored Extensions introduced during polish closure.** Only one: §51.5.6 AC-11's deferred-compute fallback pattern for the Seller Parity Win-Rate Correlation Panel (skeleton card + progressive fill rendering when regression compute exceeds 300 ms budget). This pattern is a new cross-cutting rendering contract; Frontend Platform sign-off recommended at v7.0.0 final cut. The eleven pre-existing Authored Extensions (§51.8.4 #1–#11) remain the primary sign-off surface and require Ops Director + Analytics Lead + Privacy Officer review.

### 5.4 Release Recommendation

**Original recommendation (pre-remediation):** CONDITIONAL SIGN-OFF. Phase 7 is substantively complete. The one numbering/placement defect (Item 1) must be resolved via Option A before v7.0.0 cut; the seven polish items are non-blocking and can be deferred to Phase 8+.

**Post-remediation recommendation (2026-04-22): UNCONDITIONAL SIGN-OFF.** Phase 7 is both substantively AND strictly complete. Option A was executed on 2026-04-22, flipping Item 1 from PARTIAL to PASS. All seven polish items from §5.3 were closed in the same-day remediation pass, elevating Phase 7 from "ships with known polish debt" to "ships clean." Eleven pre-existing Authored Extensions (§51.8.4 #1–#11) and one new implicit Authored Extension (§51.5.6 AC-11 deferred-compute fallback pattern) are flagged for human sign-off per convention, but each is at Master-Spec fidelity and requires only acceptance, not further authoring.

**Pre-v7.0.0 cut gate:**

- [x] Execute Option A: rewrite Integration_Prompts.md Phase 7 block (lines 1504–1590) with 2026-04-22 Numbering Reconciliation preamble + §50.x → §51.x mapping table + §49.9 → §50.13 cross-reference reconciliation note + Appendix G event additions anchor clarification; append RECONCILIATION.md with "§51 Phase 7 Verification Remediation (2026-04-22)" entry. **Executed 2026-04-22.** Integration_Prompts.md Phase 7 block rewritten; Prompt 7.1 and Prompt V7 rewritten to reference as-landed §51.x anchors with original TASK / REQUIREMENT / VERIFICATION bullets preserved; RECONCILIATION.md appended. No `§50`-as-Product-Usage-Analytics references remain in the corpus.
- [x] Re-run this verification document's Item 1 on the updated corpus; confirm PARTIAL → PASS. **Verified 2026-04-22.** Item 1 verdict updated in §5.1 post-remediation matrix.
- [x] Close polish items #1 and #2 (§51.8.4 #11 single-line edit: fix stale "(§51.9)" anchor and "Ten new events" count). **Executed 2026-04-22.** Master Spec line 34432 rewritten; anchor cites "Appendix G → §51 Product Usage Analytics Event Additions, Master Spec lines 35739–35775"; count corrected to "Thirteen new events" with full enumeration.
- [x] Close polish items #3–#5 (optional AC polish). **Executed 2026-04-22.** §51.5.3 KB ROI breadcrumb (Polish #3) strengthened at Master Spec line 34169; §51.5.6 AC-11 Seller Parity SLO (Polish #4) authored at Master Spec line 34201; §51.4.6 AC-9 self-service export event emission (Polish #5) authored at Master Spec line 34139.
- [x] Run Appendix J spot-check (polish #6). **Executed 2026-04-22.** Grep audit verified all 10 new enums registered at Appendix J lines 38584–38678.
- [x] Run §50.13 sub-anchor spot-check (polish #7). **Executed 2026-04-22.** Grep audit verified §50.13.1 through §50.13.10 sub-anchors at Master Spec lines 32403–32586.
- [ ] Human sign-off from reviewer per Integration_Prompts.md checkpoint for Phase 7 (Product Usage Analytics is a new customer-impacting surface + a new public API surface). **Pending human action.** Sign-off covers the Phase 7 authoring + the eleven §51.8.4 Authored Extensions + the one new implicit Authored Extension (§51.5.6 AC-11 deferred-compute fallback).
- [ ] Human sign-off on the 11 Authored Extensions enumerated at §51.8.4 #1–#11 (section numbering resolution; Appendix G preamble formalization; `analytics_meta` event family; `UsageDashboardSnapshot` entity; 15 panel IDs; 13-value capability domain tag; conversion-factor-binding integrity; k-anonymity floor tiers; `usage_event_envelope_dlq`; alias-retirement pager ladder; ToC drift closure). **Pending human action.** Per RECONCILIATION.md convention, requires Ops Director + Analytics Lead + Privacy Officer review.
- [ ] Human sign-off on §51.5.6 AC-11 deferred-compute fallback pattern (new implicit Authored Extension introduced during 2026-04-22 remediation). **Pending human action.** Frontend Platform lead sign-off recommended.

**Artifacts of record:**
- Master Spec backup: `legacy-import:_versions/Sourcera_Master_Spec_pre-phase7-verify-remediation-2026-04-22.md`
- Master Spec: `/Sourcera/Sourcera_Master_Spec.md` (§51.1–§51.8 at lines 33696–34432; Appendix G §51 additions at 35739–35775; Appendix I §51 additions at 36386–36414; Appendix J §51 enum cluster at 38584–38684; remediation edits at lines 34139, 34169, 34201, 34432)
- Integration-program prompt: `/Sourcera/Integration_Prompts.md` (Phase 7 block, lines 1504–1590 — Option A rewrite executed 2026-04-22)
- Reconciliation log: `/Sourcera/_integration/RECONCILIATION.md` (§51 Phase 7 Verification Remediation (2026-04-22) entry appended)
- This verification: `/Sourcera/_integration/PHASE7_VERIFY.md` (§0 Remediation Completion Addendum + §5.1 / §5.2 / §5.3 / §5.4 post-remediation edits)

---

**Verification complete.** Original verification artifact produced no Spec edits per the Phase 7 verification prompt's hard constraint. Post-remediation pass on 2026-04-22 executed the 7-step program documented in §0 and RECONCILIATION.md: five Master Spec body edits (polish closures, not new authoring surfaces), one Integration_Prompts.md Phase 7 block rewrite (Option A), one RECONCILIATION.md append, and this addendum. Phase 7 is clear to cut as part of v7.0.0.
