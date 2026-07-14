# Phase 11.1 — Appendix M.1 Mapping Registry Coverage (Scratch Log)

**Phase prompt:** `Audit_Prompts.md` → Prompt 11.1 (Appendix M.1 end-to-end walk).
**Scope:** Master Spec v7.1.0 Appendix M.1 (lines 49000–49371) cross-referenced against `_audit/FEATURE_INVENTORY.md` (480 rows; surface = 106, engine_concept = 374).
**Defect-ID convention:** `D-11.1-NNN`.
**Severity rule application:** P1 reserved for "surface introduced without an Appendix-M row" (Severity Definitions rule per `Audit_Prompts.md` line 79); P2 for partial-coverage / wrong-anchor / column-semantics ambiguity that two staff engineers would resolve differently; P3 for cosmetic / labeling drift.
**Self-challenge revisions:** Two — logged inline at §6 below.

---

## 1. Sources Read End-to-End

- Master Spec §3.13 (Principle 9) and §3.14 (Pipeline Surface Compression) preamble.
- Master Spec Appendix M preamble (lines 48994–48999) and Appendix M.1 table in full (lines 49000–49371; 365 data rows + 23 area-header rows).
- Master Spec Appendix M.2 Process Gates (lines 49373–49389) and §M.4 CI gate spec (lines 49395–49432) for invariant interpretation.
- Master Spec §8.3 (Triage Queue Management — lines 11240–11279+).
- Master Spec §11.1–§11.4 (Buyer Console Navigation Shell, Sidebar, Content Regions, Persistent UI).
- Master Spec §13.11 Defense View; §13.12 Buyer Maya intake / EvalStarter.
- Master Spec §20.1–§20.6 Inbox & Pulse.
- Master Spec §22.18.6.2 Post-Close Outcome Debrief Overlay; §22.19 (Seller Compressed Surface Mapping); §22.20.2/.3/.4 Seller Maya Surface Abstraction; §22.20.6 Magic-Link Hero Moment Surface Polish.
- Master Spec §25 Cross-Console Bridge — §25.2.3 Dual-Surface Failure Visibility (Bridge Health / Sync Health) + §25.6 Bridge Observability.
- Master Spec §26.7 SellerOrgPage; §26.8 SellerSoftware & SoftwarePage public surfaces.
- Master Spec §29.2 In-App Toast Notifications; §29.9 Sourcera Support Widget; §29.11 Full-Screen Incident Surface.
- Master Spec §30.1 Command Palette.
- Master Spec §31.9.9 CRM Sync Review Queue.
- Master Spec §35.2 Seller Onboarding flow — §35.2.3 Progress Storytelling Bootstrap UI; §35.2.6 Stake-Reveal Screen; §35.2.7 Outcome Debrief Surface.
- Master Spec §43.1–§43.5 Admin Dashboard (the legacy Ops summary).
- Master Spec §50.1–§50.19 Sourcera Ops Console (19 subsections, the v7.0.0 canonical Ops Console spec) — read by heading inventory + §50.10/.11/.12/.13/.14/.15/.16/.17.5 surface-introducing subsections.
- Master Spec §51.1–§51.8 Product Usage Analytics & PLG Instrumentation — read by heading inventory + §51.3/.4/.5.2/.5.3/.5.4/.6.3 surface-introducing subsections.
- `_audit/FEATURE_INVENTORY.md` rows: every `feature_class = surface` data row (106 rows) and the `feature_class = engine_concept` rows for §50, §51, §44.6, §22.20, §13.12 (sampled coverage).
- `_audit/DEFECT_LEDGER.md` header + row format + Severity Definitions block.
- `Audit_Prompts.md` Prompt 11.1 (lines 2411–2439) + Global Conventions Preamble (lines 117–242).

---

## 2. Check-by-Check Disposition

| Prompt Check | Disposition |
| :---- | :---- |
| 1. Every `surface` inventory row has ≥1 M.1 row. | ❌ Failed — 31 surfaces uncovered or anchored elsewhere. Filed `D-11.1-001` through `D-11.1-008`. |
| 2. Every `engine_concept` inventory row has ≥1 M.1 row. | ⚠ Partial — §50/§51 engine concepts (taxonomy entities, pricing-admin entities, baseline-assumption entities, SIM entities, fraud entities, usage-dashboard snapshot entities) are not represented in M.1. Rolled into `D-11.1-001` and `D-11.1-002` because the surfaces and underlying engine concepts share the same gap and remediation will land in one Appendix M block. |
| 3. Every row has the required columns populated per the M.1 schema. | ⚠ Partial — table schema is `Engine concept │ Spec home │ Surface metaphor │ Hidden from tier(s) │ Notes`; the `Notes` column is sparsely populated (allowed by schema); the `Hidden from tier(s)` column carries semantic ambiguity (filed `D-11.1-010` P3). No row found with an empty `Engine concept` / `Spec home` / `Surface metaphor` cell. |
| 4. Solo-Mode suppression annotations on the five named rows. | ✅ Passed. Stakeholder Cohorts (line 49030), Pulse Inbox (49168), Pulse Health Score (49169), Pulse Digest Email (49170), SLA Timers (49173) each carry an explicit `Solo Mode:` clause in the Surface-metaphor cell + an explicit "surface-suppressed (engine-only) when `Workspace.evaluation_owner_mode=solo` per §2.8" qualifier in the Hidden-from-tier cell. |
| 5. v7.1.x deferred rows clearly labeled. | ✅ Passed (Marketplace-as-RFP-Exchange). The single deferred row at line 49369 reads `(deferred to v7.1.x; Phase 14.0.1 scope amendment)` in the Engine-concept cell and carries a full Phase-14.0.1 descope rationale in the Notes cell. **GTM rewrites** (`GTM_POSITIONING.md`, `GTM_PLG_ARCHITECTURE.md`, `GTM_SALES_PLAYBOOK.md`, `GTM_90DAY_SPRINT.md`) are document-level descopes outside M.1's engine-concept→surface mapping scope per CLAUDE.md §16; no M.1 row is owed for them. |
| Reverse pass — every M.1 row's surface or engine actually exists. | ✅ Passed (sampled). Spot-checked: Sourcera KB MCP Server → §22.8 exists; Selection Report SHA-256 hash → §4.3.21 exists; BidSuccessShare → §4.4.29 exists; EvalStarter → §4.5.9 exists; Defense View → §13.11 exists; Pipeline Surface Compression → §3.14 exists; Single-Operator Mode → §2.8 exists. Filed `D-11.1-009` (P3) for the one wrong-anchor case — `Admin Dashboard (Ops Console)` row at line 49342 anchors to `§43.1` but the canonical v7.0.0 home for the Ops Console is `§50.1`. |

---

## 3. Defects (Promoted to `DEFECT_LEDGER.md`)

`D-11.1-001` through `D-11.1-010` — see ledger.

### 3.1 Cluster A — §50 Sourcera Ops Console (P1, surface_engine_mapping)

The §50 program (entirely new in v7.0.0; 19 subsections from §50.1 to §50.19) introduces a customer-facing OpsSession projection, an Ops Cross-Reference View, a Taxonomy CMS authoring surface with 6 sub-screens, a Seller Template Review Rubric surface, a Pricing Admin surface with three sub-editors, a Baseline Assumption Manager, an Internal Analytics Dashboard set with five role-specific dashboards, a Signal Integrity Monitor surface, a Fraud Analyst surface with review queue, and a Paging Runbook surface. Appendix M.1 contains a **single** Ops-related row: `Admin Dashboard (Ops Console) | §43.1 | Ops-only console at ops.sourcera.com | Internal-only (Ops staff) | Customers never see this.` (line 49342). That row pre-dates §50 and resolves to the older summary at §43, not the canonical v7.0.0 Ops Console spec. **19 §50 surfaces — F-696, F-710, F-712, F-715–F-720, F-721, F-725, F-729, F-730, F-731, F-734, F-735, F-736, F-737, F-738, F-739, F-741, F-746, F-747, F-750 — and the associated engine concepts (taxonomy entities, SIMSignal, SIMCase, SellerTemplateReviewRubric/Assessment/Appeal, CalibrationPack, PricingAdminChangeProposal, BaselineAssumption/Version) — are uncovered by Appendix M.1 as of v7.1.0.** Per `Audit_Prompts.md` Severity Definition for P1 ("surface introduced without an Appendix-M row") + Appendix M.2 process gate #1 ("Surface/Engine row required on every engine-concept addition"), this is a P1 surface_engine_mapping defect.

### 3.2 Cluster B — §51 Product Usage Analytics surfaces (P1, surface_engine_mapping)

The §51 program (entirely new in v7.0.0; 8 subsections) introduces an Org-Level Usage Dashboard (§51.3 — customer-visible), a User-Level Usage Dashboard (§51.4 — customer-visible per user), and four seller dashboard panels (Per-Bid Spend Panel §51.5.2, KB Utilization Panel §51.5.3, Win-Rate Correlation Panel §51.5.4, Time-Saved Customer-Visible Panel §51.6.3). Appendix M.1 contains **no row** referencing §51.x. **6 §51 surfaces — F-760, F-762, F-764, F-765, F-766, F-768 — and the supporting engine concepts (UsageDashboardSnapshot row family, baseline-assumption-versioned time-saved conversion factors, panel SLOs) — are uncovered.** P1.

### 3.3 Cluster C — Cross-Console Dual-Surface Failure Visibility (P1, surface_engine_mapping)

§25.2.3 introduces a buyer-side **Bridge Health** panel, a seller-side **Sync Health** panel, and an Ops Cross-Workspace Bridge Dashboard (F-400). These are explicit customer-facing surfaces with reactive freshness contracts (`sync_status` and `slo_bounded_lag_ms` fields per §4.7.1 line 7868 / 7877). The existing M.1 row `Console Bridge Observability | §25.6 | No surface — internal Ops dashboards | Internal-only, never surfaced` (line 49211) explicitly asserts no customer surface exists — directly contradicting §25.2.3. Either §25.2.3 needs a separate M.1 row, or the §25.6 row's Surface-metaphor and Hidden-from-tier cells need a v7.0.0 rewrite that names the customer panels. P1 because the contradiction makes the surface contract unbuildable as written: an engineer reading M.1 will not author the panels, while an engineer reading §25.2.3 will.

### 3.4 Cluster D — §8.3 Triage Queue surfaces (P1, surface_engine_mapping)

§8.3.1 (Buyer-Side Triage Queue) and §8.3.2 (Seller-Side Triage Queue) introduce two named customer-facing queue surfaces with explicit state machines (`new/in_review/ready_for_scoring/assigned/resolved/archived` buyer-side; `response-submitted/resolved` seller-side). Appendix M.1 contains **no row** for either. F-191, F-192. P1.

### 3.5 Cluster E — §11 Buyer Console nav shell (P2, surface_engine_mapping)

§11.1–§11.4 introduces the **Buyer Console Navigation Shell** (F-240, §11.1), **Buyer Sidebar Navigation** (F-241, §11.2 — partially absorbed under the UX Design "Navigation Shell" pattern row at line 49301), **Buyer Content Layout Regions** (F-242, §11.3), and **Buyer Persistent UI Elements** (F-243, §11.4 — org switcher, console toggle, search, notification bell, profile menu, Pulse widget). No M.1 row anchors at §11.x. Filed P2 (not P1) because the UX Design "Navigation Shell (Sidebar + Topbar)" row at the bottom of M.1 (`UX Design §Patterns.Navigation`) and the "Console-Firewall Visual Treatment" row partially carry the concept — but a thoughtful engineer would not resolve which Master-Spec section authoritatively binds the surface.

### 3.6 Cluster F — §3 / §20 / §22 cross-surface and onboarding gaps (P2, surface_engine_mapping)

Surfaces with no direct M.1 row anchor:

- F-031 Sidebar Navigation Pattern (§3.2) — overlaps with UX Design Patterns row; no Master-Spec anchor.
- F-048 Connectivity / Offline Banner (§3.7.10).
- F-050 Side Peek (§3.8).
- F-057 Bulk Action Toolbar (§3.10).
- F-067 Workspace Header Avatar Stack (§3.12.2) — partially absorbed under the §38.12 Presence Avatar Stack row.
- F-068 Thread Viewer Indicator (§3.12.2).
- F-069 Global Bell Badge (§3.12.3) / F-070 Mention Dot Overlay / F-071 Scrollback Unread Divider.
- F-143 Billing Admin Audit View (§5.2.1.4) — partially absorbed under Audit Logging row at line 49129, but the role-scoped variant deserves its own row.
- F-224 Summary Scoring Report (§10.11).
- F-269 Scenario Comparison View (§14.5) — partially absorbed under "Evaluation Scenario" row at line 49147.
- F-277 TCO Modeling & Editing UI (§15.5) — partially absorbed under TCO Modeling row at line 49150.
- F-305 Template Library UI (§19.4) — partially absorbed under Template Library row at line 49165.
- F-308 Inbox & Pulse parent surface (§20.1); F-309 Inbox Structure (§20.2).
- F-379 Post-Close Outcome Debrief Overlay (§22.18.6.2) — partially absorbed under §22.18 row.
- F-386 Magic-Link Hero Moment Surface Polish (§22.20.6) — Phase-14.8 polish authored but no M.1 row.
- F-467 In-App Toast Notifications (§29.2) — covered by §29.11 Full-Screen Incident row only for severity escalation.
- F-474 Sourcera Support Widget (§29.9).
- F-495 CRM Sync Review Queue (§31.9.9) — partially absorbed under §31.9 Match-in-Review-Queue row at line 49253.
- F-560 Progress Storytelling Bootstrap UI (§35.2.3); F-561 Stake-Reveal Screen (§35.2.6); F-562 Outcome Debrief Surface (§35.2.7).

P2 — each is a partial-coverage / missing-anchor finding where two engineers would resolve the surface contract differently from M.1 alone.

### 3.7 Cluster G — UX Design component surfaces (P3, surface_engine_mapping / documentation_gap)

F-865 through F-902 (Button, Input, Select, Modal, Drawer, Toast, Tooltip, Tabs, Table, Pagination, Empty-State, Loading, Error-State, Navigation Shell pattern, Console-Firewall Visual Treatment) are component-level rows in `FEATURE_INVENTORY.md` anchored at `UX Design §Components.*`. Appendix M's stated purpose is engine-concept→surface mapping. Component-level UI primitives (`Button`, `Input`) are surface primitives only; they have no engine concept distinct from the consuming feature. P3 because the inventory's prescribed granularity ("UX Design tokens/components are captured as engine_concept / surface families; per-variant population happens in the §3 / UX-Design audit phases" — FEATURE_INVENTORY.md preamble line 7) explicitly defers per-component M.1 mapping to a later UX-Design audit phase.

### 3.8 §43.1 vs §50.1 wrong-anchor (P3, consistency_drift)

The `Admin Dashboard (Ops Console) | §43.1 | …` row at M.1 line 49342 anchors at §43.1. The canonical v7.0.0 home for the Ops Console is §50 (`Sourcera Ops Console` — §50.1 Purpose; §50.2 Separation Architecture; §50.3 Ops Role Matrix; etc.). The §43 block has been retained as a higher-level admin-tooling summary, but §50 is the authoritative spec for what the row describes (`ops.sourcera.com`, separate WorkOS tenant, role matrix, impersonation audit). The Spec-home cell should read `§50.1, §43.1` or `§50.1 (canonical), §43.1 (legacy)`. P3.

### 3.9 "Hidden from tier(s)" column semantics (P3, documentation_gap)

The column header `Hidden from tier(s)` is semantically inverted by the table's own legend at line 49002, which defines `All` to mean "visible on every paid and free plan on the relevant console" — i.e., **not** hidden from any tier. The column thus carries two opposing semantics: tier names listed = hidden from those tiers (per the column header); the special value `All` = visible to all tiers (per the legend). A reader scanning the column without reading the preamble at line 49002 will read `All` as "hidden from all tiers." Recommendation: rename the column to `Tier visibility` and adopt one consistent semantic (positive: tiers listed = visible to those tiers; `Internal-only, never surfaced` = no customer-visible surface) OR keep the negative semantic and replace `All` with `None hidden`. P3.

---

## 4. Solo-Mode Suppression Annotations — Detailed Verification

| Row | Line | Surface metaphor excerpt | Hidden-from-tier cell excerpt | Status |
| :---- | :---- | :---- | :---- | :---- |
| Stakeholder Cohorts | 49030 | `Solo Mode: surface suppressed; cohorts remain engine-level constructs auto-assigned from email-domain heuristics on invite acceptance, surface-promoted at first non-guest invite or explicit solo → team toggle per §2.8.5.` | `All in Team Mode; surface-suppressed (engine-only) when Workspace.evaluation_owner_mode=solo per §2.8` | ✅ |
| Pulse Inbox + Inbox Item Group | 49168 | `Solo Mode: surface suppressed in favor of "What to do this week" three-item panel per §2.8.4.` | `All in Team Mode; surface-suppressed (engine-only) when Workspace.evaluation_owner_mode=solo per §2.8` | ✅ |
| Pulse Health Score | 49169 | `Solo Mode: per-component breakdown widget suppressed; composite score still computed and persisted on WorkspacePulseHealth for audit and post-solo→team exposure per §2.8.4.` | `All paid in Team Mode (Free has no Pulse); surface-suppressed (engine-only) when Workspace.evaluation_owner_mode=solo per §2.8` | ✅ |
| Pulse Digest Email | 49170 | `Solo Mode: default-suppressed; opt-in via Notification Preferences (§20.6, §2.8.4 AC #6).` | `All paid in Team Mode; opt-in only when Workspace.evaluation_owner_mode=solo` | ✅ |
| SLA Timers (per-team, per-role) | 49173 | `Solo Mode: SLA pills suppressed; surface compresses to a single "Due {date}" deadline countdown for the next phase-bound deadline per §2.8.4.` | `All paid in Team Mode; surface-suppressed (engine-only) when Workspace.evaluation_owner_mode=solo per §2.8` | ✅ |

All five rows carry the required Solo-Mode suppression annotation in both the Surface-metaphor cell and the Hidden-from-tier cell. No defect.

---

## 5. v7.1.x Deferred Labeling — Detailed Verification

| Row | Line | Cell content | Status |
| :---- | :---- | :---- | :---- |
| Marketplace-as-RFP-Exchange | 49369 | Engine-concept cell: `Marketplace-as-RFP-Exchange (deferred to v7.1.x; Phase 14.0.1 scope amendment)`. Spec-home cell: `Phase 14.x (deferred — owner-phase to be assigned in v7.1.x)`. Hidden-from-tier cell: `All (deferred)`. Notes cell carries a full Phase 14.0.1 descope rationale block: "**Phase 14.0.1 (closed 2026-04-28) — formal descope.** … the §27 narrative (Marketplace as one-way vendor directory), §27.8–§27.11 hardening sections, and §48 PLG / network-effects loops remain unchanged at v7.1.0 stamp time …" | ✅ Labeled. |
| GTM rewrites | n/a | Not present in Appendix M.1. Per CLAUDE.md §16 ("GTM rewrites … are formally descoped to v7.1.x"), the descope is at the document level — `GTM_POSITIONING.md`, `GTM_PLG_ARCHITECTURE.md`, `GTM_SALES_PLAYBOOK.md`, `GTM_90DAY_SPRINT.md` — outside Appendix M's engine-concept→surface mapping scope. No row owed. | ✅ Correctly absent. |

---

## 6. Self-Challenge Revisions

1. **Initial claim:** "§44.6 Solo-Tier Surface Treatment surfaces are absent from M.1." **Hostile re-read:** the §44.6 block is documented under the **Solo-Tier Surface Treatment (§44.6 — closed Phase 14.10 — 2026-04-28)** area header at line 49275, with 10 rows authored across lines 49276–49284. The Solo single-card billing surface, AIOperation metering suppression, value-dollars rate-card visibility, AIWallet/overage/auto-topup suppression, envelope-throttling notification, `surface_throttling_class` enum, `solo_envelope_override_value_cents` field, `solo_envelope_no_block` field, single-card billing surface, and envelope-counter engine field all carry rows. **Revision:** removed from defect list. Verified F-618 (Solo Single-Card Billing Surface, §44.6.2) and F-622 (the Solo notification suppression — Authored Extension AE-14.10-08, F-AE-065) resolve to M.1 rows at lines 49283 (single-card billing) and 49279 (envelope throttling notification). The cluster is covered.

2. **Initial claim:** "Defense View (F-261) has only a forward-reference row." **Hostile re-read:** the line 49367 forward-reference row was *tightened* in Phase 14.5 ("closed Phase 14.5") with a full surface-metaphor description (Recommendation / Why / Risks / Evidence / CFO PDF), tier-visibility cell (`Free (preview only … watermarked, PDF export gated to Solo+ upgrade CTA). Solo (Phase 14.6 — forthcoming; alias to Business Starter+ until then), Business Starter, Growth, Scale, Enterprise: full surface unwatermarked. Buyer-console-only — seller console returns HTTP 404 …`), and Notes cell flagging the `defense_view_generate` capability registry row as a follow-on Authored Extension. **Revision:** Defense View row is present and correctly tightened; removed from defect list.

---

## 7. Counterfactual Failure-Mode Pass

Three realistic failure modes the M.1 contract must handle, and confirmation whether the spec addresses each:

1. **Ops introduces a new SIM detector category that needs a customer-facing surface.** §M.4 CI gate (`appendix_m_coverage_on_diff`) traverses §4.x entities, §5.x roles, state-machine entries, §21.4/§22.10 capabilities, §34.1 plan-gated features, §31 webhooks, §32 endpoints, and Appendix G PostHog events; a new SIM category that adds a new entity, capability, webhook, or PostHog event will trip the gate. **Handled.** But if the new SIM category surfaces only via an existing entity's state machine transition (no new entity / capability / webhook / endpoint), the gate's traversal may miss it. **Not unambiguously handled.** Not filing a defect here — covered by Phase 11.3 (M.5 gate coverage) — but flagging for cross-phase linkage.

2. **A new §50 Ops surface (e.g., a tenth Internal Analytics dashboard) is added without an Appendix M row.** §M.4 CI gate asserts coverage on new entities, capabilities, webhooks, endpoints, and PostHog events — but a dashboard that reuses existing entities and only adds a Convex view function would not trip the gate. The §50 dashboards (Growth PM, GTM Lead, Support, Fraud Analyst, Finance) each have dedicated subsections (§50.14.3–§50.14.7) and dedicated AC blocks but **no current M.1 row** (Cluster A). **Not handled** — this is the same defect as Cluster A.

3. **A surface is correctly hidden via the Feature Access Matrix (§5.11) but the M.1 `Hidden from tier(s)` column says `All`.** Per the §M.2 process gate #6 ("Tier visibility integrity") and the Phase-14.18 tier-flip smoke test, a divergence between the §5.11 matrix and the M.1 column on tier visibility is a P0 defect. M.1 column semantics ambiguity (`Hidden from tier(s)` header but `All` = visible-to-all) leaves room for the smoke-test pack to be written against the wrong interpretation. **Partially handled.** Filed `D-11.1-010` (P3, column semantics).

---

## 8. Cross-Phase Linkage

- **Phase 11.2 (§M.4 CI gate spec).** Cluster A and Cluster B may surface engine concepts that §M.4's traversal cannot detect (a §50 dashboard that adds no new entity / webhook / endpoint). Phase 11.2 should verify §M.4's trigger conditions cover surface-only additions.
- **Phase 11.3 (§M.5 37-gate catalog coverage).** The 33-of-37 not-yet-runtime gates include `appendix_m_coverage_on_diff` (the canonical §M.4 gate); Phase 11.3 must confirm the gate is wired against §50 / §51 sections before v7.1.1 stamp.
- **Phase 11.4 (surface/engine cross-reference audit).** Will absorb the per-feature trace from `FEATURE_INVENTORY.md` → §-anchor → M.1 → §M.5 → AE ledger. Cluster A / B / C / D will produce 27+ missing M.1 anchors in the Phase 11.4 trace.
- **Phase 14.18.1 runtime wiring (v7.1.1 backlog per CLAUDE.md §16).** The §M.5 gate set is the enforcement mechanism that would have caught Clusters A / B / C / D at v7.0.0 if the runtime had been live. Filing the defects against v7.1.0 spec content (not against the gate spec) so they remediate via direct M.1 edits, not via gate wiring.

---

## 9. Known Gaps / Out-of-Scope

- Per-component UX Design audit (Cluster G P3) is deferred to a UX-Design audit phase; not produced in this prompt.
- M.5 gate-by-gate coverage trace is Phase 11.3 scope.
- Appendix M.1 → Authored Extensions Ledger trace is Phase 11.4 scope.

---

## 10. Sign-Off

Promoted 10 defects (`D-11.1-001` through `D-11.1-010`) to `_audit/DEFECT_LEDGER.md`. P1 = 4 (Clusters A / B / C / D), P2 = 2 (Clusters E / F), P3 = 4 (Cluster G; §43.1 vs §50.1 anchor; column semantics; UX Design component-level). Solo-Mode suppression and v7.1.x deferred-row checks pass clean. No P0 found.
