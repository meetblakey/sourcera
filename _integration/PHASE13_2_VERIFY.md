# Phase 13.2 — Acceptance-Criteria Coverage Verification Log

**Date:** 2026-04-26
**Author:** Phase 13.2 authoring pass
**Master Spec target:** `Sourcera_Master_Spec.md` (v7.0.0 integration in progress)
**Pre-edit snapshot:** `_versions/Sourcera_Master_Spec_pre-phase13_2_acceptance_criteria-2026-04-26.md`

---

## 1. Phase Scope

Per Phase 13.2 prompt: for every §N.M subsection that introduces a user-facing feature, confirm a numbered Acceptance Criteria block exists (following §13.10 conventions). Author missing AC blocks. Each criterion observable, measurable, scope-bound.

Cross-cutting infrastructure subsections — data model entities (already carrying entity-level AC inline), RBAC tables, API authentication boilerplate, pointer subsections that explicitly delegate to authoritative sources — are out of scope per the §13.10 convention which targets user-facing feature surfaces.

---

## 2. Audit Method

1. Enumerated all `^## \d+\.\d+ ` headings in the Master Spec (full subsection map).
2. Searched for every existing `Acceptance Criteria` instance (heading and inline) — 240+ matches.
3. Cross-referenced each user-facing feature subsection against the AC coverage map.
4. Determined coverage in three categories:
   - **Covered by section-final AC:** the subsection's behavior is testable through the section-level §N.last AC block (e.g., §13.1–§13.9 covered by §13.10).
   - **Covered by inline / per-subsection AC:** the subsection itself contains a numbered AC list.
   - **Uncovered:** the subsection introduces user-facing behavior and lacks both above forms.
5. Authored AC blocks for every uncovered user-facing subsection following §13.10 conventions: numbered group sub-sections, observable test bullets, scope-bound predicates.

---

## 3. Subsections With Added Acceptance Criteria

| Subsection | New AC Anchor | Group Subsections | Criteria Count |
| :---- | :---- | :---- | :---- |
| §8.2 Team Deletion & Recovery | §8.2.6 | 6 (Pre-Deletion Constraint, Triage Queue Reassignment, SLA Configuration Archive, UI Visibility Rules, Recovery, Audit & Telemetry) | 21 |
| §8.3 Triage Queue Management | §8.3.3 | 6 (Item Lifecycle Buyer, Item Lifecycle Seller, SLA Tracking & Escalation, Permissions, Concurrency & Convex Reactivity, Auto-Mapping) | 21 |
| §8.4 Team SLA Configuration | §8.4.4 | 5 (Configuration Bounds, Apply Semantics, Timer Behavior, Escalation & Notifications, Audit & Telemetry) | 16 |
| §9.1 Seller Team Architecture | §9.1.3 | 3 (Team Properties, Role Permissions, KB Category Coupling) | 9 |
| §9.2 Seller Triage Queue & Auto-Mapping | §9.2.4 | 4 (Auto-Mapping Determinism, Manual Remap, Decline-to-Bid, Firewall & Console Bridge) | 12 |
| §9.3 Vendor Response Drafting & Capability Declarations | §9.3.3 | 4 (Vendor Response Lifecycle, Capability Declaration Reuse, Drafting UI Contract, Audit & Telemetry) | 12 |
| §9.4 Response Quality & AI Assistance | §9.4.3 | 3 (Generation, Approval & Auditability, Failure Modes) | 10 |
| §25.5 Materialization Protocol | §25.5.10 | 6 (Idempotency & Versioning, Firewall Invariants, Re-Verification Field, Conflict & Failure Handling, Enums/Errors/Catalog Registration, Observability Coupling) | 22 |
| §25.6 Console Bridge Observability | §25.6.6 | 6 (Metrics Coverage, Alert Routing, Dashboard Behavior, Runbook Anchors, Kill-Switch, Completeness Gate Singularity) | 23 |
| **Totals** | **9 new anchors** | **43 group subsections** | **146 criteria** |

---

## 4. AC Count — Before vs. After

### 4.1 Top-Level Section-Final AC Blocks (`^## N.M Acceptance Criteria`)

| Phase | Count |
| :---- | :---- |
| Pre-13.2 | 38 |
| Post-13.2 | 38 |

(No change at the top level — added AC are subsection-scoped per §13.10 convention, which places §N.last as the section-final block. New AC blocks live as `### N.M.X Acceptance Criteria` subsections under the corresponding feature subsection.)

### 4.2 Subsection-Local AC Anchors (`^### N.M.X Acceptance Criteria`)

| Phase | Count | Notes |
| :---- | :---- | :---- |
| Pre-13.2 | 49 (sampled across §3.6.8, §3.7.11, §3.8.8, §3.9.10, §3.10.8, §3.11.10, §3.12.11, §22.18.7, §25.3.13, §25.7.13, §26.10, §27.4.10, §27.6.9, §27.8.11, §27.9.12, §27.10.9, §27.11.8, §31.8.9, §31.9.14, §32.8.23, §32.9.4, §34.8.7, §34.11.4, §34.13.8, §34.14.6, §34.15.6, §34.16.8, §34.17.4, §34.18.7, §34.19.7, §38.6.6, §38.7.6, §38.8.6, §48.1.4, §48.1.8, §48.2.13, §48.3.4, §48.4.11, §48.5.9, §48.6.10, §48.8.10, §49.1.10, §50.10.7, §50.11.11, §50.12.13, §50.13.9, §50.14.11, §50.15.11, §50.16.7) | Inferred from grep tabulation. |
| Post-13.2 | 58 | +9 anchors: §8.2.6, §8.3.3, §8.4.4, §9.1.3, §9.2.4, §9.3.3, §9.4.3, §25.5.10, §25.6.6. |

### 4.3 Total Numbered Acceptance Criterion Bullets

| Phase | Approximate count | Notes |
| :---- | :---- | :---- |
| Pre-13.2 | ~890 | Aggregate across all section-final and inline AC blocks; rough count by `\[ \]` checkbox bullets in AC subsections. |
| Post-13.2 | ~1,036 | +146 criteria from this pass. |

---

## 5. Subsections Confirmed Covered (No Authoring Required)

Audit determined the following user-facing subsections were already covered. Citations indicate the covering AC anchor.

### §3 — UX Patterns

| Subsection | Covering AC |
| :---- | :---- |
| §3.6 Form & Input Tokens | §3.6.8 |
| §3.7 Loading / Empty / Error State Catalog | §3.7.11 |
| §3.8 Side Peek Dimensions & Behavior | §3.8.8 |
| §3.9 Cursor Presence Visualization | §3.9.10 |
| §3.10 Bulk Action Toolbar | §3.10.8 |
| §3.11 Dark Mode Parity Rules | §3.11.10 |
| §3.12 Presence & Unread Tracking | §3.12.11 |

### §7 — Organization

| Subsection | Coverage |
| :---- | :---- |
| §7.1 Organization Lifecycle | Inline AC (line 8697) |
| §7.3 PII Handling Across Org Boundaries | Inline AC (line 8814) |
| §7.5 Convex Subscription / Reactivity Layer | Pointer subsection — delegates to §22.4, §25.1, §31.6, §44.1; no new AC needed |

### §8 — Buyer Teams

| Subsection | Coverage |
| :---- | :---- |
| §8.1 Team Architecture | Inline AC (line 8908) |
| §8.5 Agent Instructions | Inline AC (line 9110) |

### §10 — 13-Phase Pipeline

Each phase has its own inline AC (per §10.2 through §10.13 inline AC blocks). §10.14 (Cancellation Protocol) inline AC (line 10102). §10.15 (Phase Duration Benchmarks) is informational/non-feature. §10.16 (Phase Advancement API) covered through API conformance tests in §32.

### §11–§24, §26–§47 — Major Feature Sections

All covered by section-final AC blocks: §11.5, §12.9, §13.10, §14.9, §15.7, §16.10, §17.8, §18.8, §19.7, §20.7, §21.9, §22.17, §22.18.7, §23.5, §24.6, §25.4 (covers §25.1–§25.3), §25.7.13, §26.6 + §26.10, §27.7 + §27.8.11 + §27.9.12 + §27.10.9 + §27.11.8, §28.3, §29.6 (with §29.9 / §29.11 inline; §29.7 / §29.8 / §29.10 are pointer subsections covered upstream), §30.7, §31.7 + §31.8.9 + §31.9.14, §32.7 + §32.8.23 + §32.9.4, §33.9, §34.20 (consolidated across all §34 subsections, with per-subsection AC at §34.8.7, §34.11.4, §34.13.8, §34.14.6, §34.15.6, §34.16.8, §34.17.4, §34.18.7, §34.19.7), §35.4, §36.4, §37.5, §38.5 + §38.6.6 + §38.7.6 + §38.8.6, §40.5, §41.5, §42.7, §43.5, §44.5, §45.4, §46.5, §47.5.

### §48 — PLG / Network Effects

Per-loop and per-mechanic AC blocks: §48.1.4, §48.1.8, §48.2.13, §48.3.4, §48.4.11, §48.5 (per-mechanic AC at M1–M8), §48.5.9 (cross-mechanic), §48.6 (per-mechanic AC at M9–M13), §48.6.10 (cross-mechanic), §48.7 (per-mechanic AC at M14–M17), §48.8.10 (Hero Moment aggregate).

### §49 — Seller Onboarding

§49.1.10 — consolidated stage-level AC; per-stage AC distributed across §49.1.1 through §49.1.9.

### §50 — Ops Console

§50.8 (aggregate), §50.10.7, §50.11.11, §50.12.13, §50.13.9, §50.14.11, §50.15.11, §50.16.7, §50.17 (consolidated §50.15 / §50.16), §50.19 (consolidated pointer).

### §51 — PostHog Analytics

Per-subsection AC: §51.1.6, §51.2.6, §51.3.7, §51.4.6, §51.5.6, §51.6.6, §51.7.6, §51.8 (aggregate / self-challenge / counterfactual).

---

## 6. Adherence to §13.10 Conventions

Each authored AC block:

- Uses numbered group sub-sections (e.g., §8.2.6.1, §8.2.6.2 …) corresponding to coherent test areas, mirroring §13.10.1–§13.10.7.
- Lists individual criteria as `- [ ]` checkbox bullets, each phrased as an observable, server-enforceable predicate.
- Cites the authoritative cross-references (§39 size constraints, §40.2 retention, §44.1 / §44.2 performance budgets, §6.2 MFA, §6.8 DSAR, §7.2 firewall, §22.4 / §22.5 KB pipeline, §25.2 retry curve, §25.5 materialization, §29 notifications, §34.10 / §34.11 / §34.14 wallet & rate cards, §41.2 email catalog, §42.3 incident routing, §50.4 / §50.17 ops impersonation & SIM).
- Names the relevant CI gate, server-side validator, or HTTP error code where enforcement is build-time or run-time mechanical.
- Does not duplicate dollar figures, durations, or character limits inline.
- Preserves the `## N.N Title {#n.n-title}` heading syntax for the parent subsection and uses `### N.N.X Title {#n.n.x-title}` for the new AC block.

---

## 7. New References Introduced (Tracked in RECONCILIATION.md → Authored Extensions)

| Reference | Type | Status |
| :---- | :---- | :---- |
| `seller_auto_mapping_tiebreaker_enum` | Appendix J enum | New — to register in follow-on appendix-completeness pass (AE-13.2-01) |
| ~20 new error codes (enumerated in RECONCILIATION.md) | Appendix I | New — to register in Appendix I follow-on (AE-13.2-02) |
| New webhook + PostHog event names | Appendix C / Appendix G | New — payload schemas pending (AE-13.2-03) |
| `team_sla_config_archive` retention tier (30 days) | §40.2 | New retention tier — registration required (AE-13.2-04) |
| Step-up MFA on SLA extensions ≥ 24h | §6.2 | Within existing step-up scope; no §6.2 edits needed (AE-13.2-05) |

---

## 8. Self-Challenge Pass Findings

Six revisions made during hostile-staff-engineer re-read (full detail in RECONCILIATION.md → Phase 13.2 Self-Challenge Log):

1. §8.2.6.5 — recovery permission scope handles case where original Team Owner has been removed from Org.
2. §8.4.4.4 — escalation idempotency keyed on `(item_id, timer_kind, threshold_pct)` to prevent jitter duplication.
3. §9.2.4.1 — fourth tiebreaker (lexicographic `team_id`) added for full determinism.
4. §9.4.3.1 — confirmed seller-side AI wallet ownership per §34.10; explicit reference added.
5. §25.5.10.4 — schema-mismatch SIM alert latency constrained to ≤ 60 seconds matching §50.17 detector cadence.
6. §25.6.6.5 — kill-switch banner propagation latency tied to §44.1 reactivity SLO (p95 ≤ 5 s).

---

## 9. Counterfactual Pass

Three failure modes per authored block enumerated (full detail in RECONCILIATION.md → Phase 13.2 Counterfactual Pass). All failure modes are addressed by either authored AC bullets or by referenced upstream sections.

---

## 10. Phase 13.2 Verification Status

- [x] Pre-edit snapshot taken: `_versions/Sourcera_Master_Spec_pre-phase13_2_acceptance_criteria-2026-04-26.md`
- [x] All 9 user-facing subsections lacking AC have authored AC blocks.
- [x] Existing AC coverage map verified across §3 through §51.
- [x] Authored AC follows §13.10 convention.
- [x] Self-challenge pass executed; 6 revisions in place.
- [x] Counterfactual pass executed; ≥ 3 failure modes per block.
- [x] RECONCILIATION.md updated with Phase 13.2 entry.
- [x] Authored Extensions logged (AE-13.2-01 through AE-13.2-05).
- [x] Verification artifact (`PHASE13_2_VERIFY.md`) produced.

**Phase 13.2 closes with full AC coverage across all user-facing feature subsections in the Master Spec.**
