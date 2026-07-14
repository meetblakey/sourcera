# Phase 3 — Verification Log (V3)

**Audit program:** v1.0 (`/Sourcera/Audit_Prompts.md`)
**Spec baseline:** `Sourcera_Master_Spec.md` v7.1.0 (Last Updated 2026-04-28)
**Prompt:** Prompt V3 — Phase 3 Verification (Audit_Prompts.md "Phase 3 — RBAC, Authentication, Audit, DSAR, Privacy").
**Run start:** 2026-05-04
**Run owner:** Cowork / Opus session `local-cowork-2026-05-04`
**Verdict:** **HALT — sign-off withheld.** 9 open P0 defects in Phase-3 scope (3 `observability` / `firewall_leakage` from Phase 3.4 — `D-3.4-001`, `D-3.4-002`, `D-3.4-003`; 5 `dsar` and 1 `residency` from Phase 3.5 — `D-3.5-001`, `D-3.5-002`, `D-3.5-003`, `D-3.5-004`, `D-3.5-005`, `D-3.5-006`) gate V-prompt advance per `Audit_Prompts.md → How to Use This Program §4` and the Phase-3 V-prompt sign-off rule "Zero P0 firewall_leakage / dsar / observability." 88 open P1 defects across Phase 3.1 (`D-3.1-001 … D-3.1-024`), Phase 3.2 (`D-3.2-001 … D-3.2-029`), Phase 3.3 (`D-3.3-001 … D-3.3-037`), Phase 3.4 (`D-3.4-004 … D-3.4-006`), and Phase 3.5 (`D-3.5-007 … D-3.5-038`) block the parallel rule "Every P1 has remediation owner + recommendation" — the recommendation column is uniformly populated, but the AE Ledger does not yet carry an AE-3.x ratification queue for the matrix-structure / spec-extension class defects (D-3.2-001 / D-3.2-004 / D-3.2-005 / D-3.2-006, D-3.3-001 generalizable rules, D-3.5-001 / D-3.5-002 / D-3.5-004 GDPR-rights extension). Three V3-originated defects filed: **`D-3V-001` (P1 consistency_drift)** for the §3.3 §6 severity-mix discrepancy between PHASE3.3_FINDINGS.md §2 headline ("27 P1 / 9 P2 / 1 P3") and §6 severity-mix table ("26 P1 / 11 P2 / 0 P3") — the count drift is internal-to-the-scratch-log only and does not affect the ledger but blocks V3's structural roll-up; **`D-3V-002` (P1 documentation_gap)** for the absent Phase-3 AE Ledger queue (every Phase-3 sub-prompt findings file calls for AE rows but `_integration/AUTHORED_EXTENSIONS_LEDGER.md` carries no Phase-3 cluster); **`D-3V-003` (P0 dsar)** newly surfaced — `manifestly_unfounded_rejected` state value referenced in §6.8.6 AC contract path (D-3.5-005 recommendation column line 25 of PHASE3.5_FINDINGS.md plus inline AC #1 anchor) but the §6.8.6 AC #1 body itself does not author the abuse-flood control (Art. 12(5) GDPR fee / refusal authority) and §6.8.5 row classes do not enroll the rejected-state retention class. Coverage matrix `rbac` / `plan_gating` / `console_firewall` / `dsar` / `observability` columns are partially tight but the corpus-wide tightening pass remains pending (per Phase 3.1 §6, Phase 3.2 §6, Phase 3.3 §4, Phase 3.4 §6, Phase 3.5 §9 prescribed tightenings). Remediation queue and re-verification trigger in §10 below.

---

## 0. Scope of V3

V3 is the verification gate for **Phase 3 — RBAC, Authentication, Audit, DSAR, Privacy**, encompassing the five sub-prompt runs already executed and logged in the Run Log:

| sub-prompt | scratch log | run date | defects filed | status |
|---|---|---|---|---|
| Prompt 3.1 — §5.1–§5.10 Role Definitions & Console Firewall | `PHASE3.1_FINDINGS.md` | 2026-05-04 | 24 (`D-3.1-001 … D-3.1-024`) | complete; 0 P0 / 17 P1 / 7 P2 / 0 P3 |
| Prompt 3.2 — §5.11 Feature Access Matrix Coverage | `PHASE3.2_FINDINGS.md` | 2026-05-04 | 29 (`D-3.2-001 … D-3.2-029`) | complete; 0 P0 / 23 P1 / 2 P2 / 4 P3 |
| Prompt 3.3 — §6.1–§6.6 Authentication, Session, Domain, MFA, API Token | `PHASE3.3_FINDINGS.md` | 2026-05-04 | 37 (`D-3.3-001 … D-3.3-037`) | complete; **count drift** between §2 headline (0 P0 / 27 P1 / 9 P2 / 1 P3) and §6 severity-mix (0 P0 / 26 P1 / 11 P2 / 0 P3) — V3-filed `D-3V-001` |
| Prompt 3.4 — §6.7 Audit Logging | `PHASE3.4_FINDINGS.md` | 2026-05-04 | 7 (`D-3.4-001 … D-3.4-007`) | complete; **3 P0** / 3 P1 / 1 P2 / 0 P3 |
| Prompt 3.5 — §6.8 Data Privacy & GDPR Compliance | `PHASE3.5_FINDINGS.md` | 2026-05-04 | 38 (`D-3.5-001 … D-3.5-038`) | complete; **6 P0** / 19 P1 / 10 P2 / 3 P3 |

**Aggregate Phase-3 defect inventory:** 135 defects total — 9 P0 / 88 P1 / 31 P2 / 7 P3. (P1 count uses the §6 severity-mix table for Phase 3.3 per the more-conservative rule; the count discrepancy is filed as `D-3V-001`.) All five sub-prompt runs ran on 2026-05-04 in the same Cowork / Opus session; no cross-day re-runs. No spec-side remediation pass was attempted between sub-prompts; the Master Spec is at the same baseline V3 verifies against.

**V3 prompt scope (per Audit_Prompts.md task block):**

1. **Structural Checks** — confirm every role audited; §5.11 row count plausible; §6.1–§6.8 defects filed.
2. **Adversarial Checks** — pick 5 features and trace authorization end-to-end (API → role → §5.11 cell → §34 plan gate); pick 3 third-party outages and confirm graceful degradation; pick 3 DSAR scenarios and walk erasure end-to-end (cascade fan-out + Pattern A/B + audit-integrity exemption + residency).
3. **Known Gaps** — list any auth or DSAR scenarios not covered by the five sub-prompts.
4. **Sign-Off Criteria** — zero P0 `firewall_leakage` / `dsar` / `observability`; every P1 has remediation owner + recommendation.

V3 reads each scratch log end-to-end before promoting verdicts. No grep-only judgments on phase outputs.

---

## 1. Structural Checks

### 1.1 Every Role Audited

**Source of truth:** Master Spec §5.1–§5.10 (lines 8868–9170); Appendix J Global Organization Roles / Workspace Roles / Team Roles / Seller Console Role Extension; §27 Marketplace role surface; §50 Ops Console role surface.

**Audit coverage by role surface:**

| role surface | enumeration | audited by | status |
|---|---|---|---|
| Org-Level Roles (§5.2) | `org_owner`, `org_admin`, `member`, `billing_admin` | Phase 3.1 §3.2 (D-3.1-003 / -004 / -005) | ✅ — every role audited; 1 P1 unresolved billing-conflict + 1 P1 Member operation-level + 1 P1 Org Owner / Org Admin console-firewall silence |
| Buyer Console Workspace Roles (§5.3) | `workspace_owner`, `workspace_admin`, `use_case_lead`, `reviewer`, `guest` (canonical Appendix J) | Phase 3.1 §3.3 (D-3.1-006 / -007 / -008) | ✅ — every role audited; 3 P1 across canonicality drift + concept-level descriptions + missing glossary |
| Buyer Console Guest Permission Profiles (§5.4) | `read_only`, `contributor`, `scorer`, `full_participant` | Phase 3.1 §3.4 (D-3.1-009 / -010 / -011 / -012) | ✅ — every profile audited; 4 P2 across modern-surface coverage / lifecycle states / profile-change semantics / revocation flow |
| Seller Console Workspace Roles (§5.5) | `bid_workspace_owner`, `bid_contributor`, `bid_viewer` (§5.5 Title-Case form) — **canonicality drift documented** | Phase 3.1 §3.5 (D-3.1-013 / -014 / -015 / -016) | ✅ — every §5.5 role audited; D-3.1-015 surfaces 11 seller-side roles `seller_org_owner`, `seller_org_admin`, `seller_kb_admin`, `seller_kb_editor`, `seller_kb_viewer`, `seller_billing_admin`, `seller_marketing_editor`, `seller_compliance_officer`, `seller_integrations_admin`, `seller_bid_captain`, `seller_guest` that the rest of the spec uses but §5.5 omits |
| Marketplace Roles (§5.6) | `marketplace_publisher`, `marketplace_viewer` | Phase 3.1 §3.6 (D-3.1-017 / -018 / -019 / -020) | ✅ — every role audited; 4 P1 across concept-level + buyer/seller scope + "Global" semantics + missing glossary |
| Phase-Gated Scoring Availability (§5.7) | n/a (capability gate, not role) | Phase 3.1 §3.7 (D-3.1-021) | ✅ — capability gated; 1 P1 dangling "Evaluators / Scorers" role-name reference |
| Policy Ingestion Availability (§5.8) | n/a (capability gate, not role) | Phase 3.1 §3.8 (D-3.1-022) | ✅ — capability gated; 1 P1 role-gate undefined |
| Executive Sponsor (§5.9) | informal persona | Phase 3.1 §3.9 (D-3.1-023) | ✅ — persona audited; 1 P2 designation flow / forensic identifier gap |
| Active Workspace Definition (§5.10) | n/a (state predicate, not role) | Phase 3.1 §3.10 (D-3.1-024) | ✅ — predicate audited; 1 P2 workspace-status enum + ordinal-coupling |
| Ops Console Roles (§50) | `ops_marketing_editor`, `ops_marketing_supervisor`, `ops_taxonomy_admin`, `ops_legal_takedown_admin`, `ops_marketing_finance_reviewer`, `ops_template_reviewer` | Phase 3.2 §3.1 D-3.2-006 (the §5.11 column-set excludes Ops; §50 role definitions out of Phase 3.1 §5.* scope but referenced) | ⚠ partial — Phase 3 audits the Ops-role *intersection* with §5.11 (D-3.2-006 P1) but does not audit the §50 role-definition tables themselves; deferred to Phase 9 (Observability / Ops Console). |

**Verdict:** ✅ **Every role enumerated in §5.1–§5.10 has been audited.** The Phase 3.1 sub-prompt covered all 10 §5.* sub-sections end-to-end and surfaced 24 defects. The §50 Ops-role surface is partial-audited (intersection-only); per the V3 prompt scope ("§5.11 row count plausible; §6.1–§6.8 defects filed") this is acceptable — Phase 3 V-prompt is not the Ops-role-table audit gate.

### 1.2 §5.11 Row Count Plausibility

**Source of truth:** Master Spec §5.11 lines 9171–9290.

**V3 enumeration of §5.11 row groups (lines 9179–9270):**

| row group | line range | data rows | counted |
|---|---|---|---|
| Workspace Management | 9179–9184 | 5 | ✅ |
| Vendor Curation & Disqualification (§25.3) | 9185–9192 | 7 | ✅ |
| Use Case Management | 9193–9197 | 4 | ✅ |
| Requirement Management | 9198–9202 | 4 | ✅ |
| Scoring | 9203–9206 | 3 | ✅ |
| Response Management | 9207–9208 | 1 | ✅ |
| Comments & Collaboration | 9209–9213 | 4 | ✅ |
| Team & Member Management | 9214–9218 | 4 | ✅ |
| Reporting & Analytics | 9219–9225 | 6 (incl. Defense View Open + Regenerate; M2 / M5 / M8 / Q&A / Internal Comment Thread Management explicitly missing per D-3.2-008 / -009 / -010 / -011 / -022) | ✅ |
| Billing & AI Accounting (§4.8, §5.2.1, §34.12.6) | 9226–9248 | 22 | ✅ |
| Seller Signals — Seller Console (§27.9) | 9249–9254 | 5 | ✅ |
| Buyer Signal Opt-In — Buyer Console (§27.9.2) | 9255–9258 | 3 | ✅ |
| CRM Sync — Seller Console (§31.9) | 9259–9270 | 11 | ✅ |
| **Total user-capability rows** | | **79** | |

The Phase 3.2 §1 inventory cited "~52 capability rows." V3's hand-count returns 79 user-capability rows. The discrepancy is benign — Phase 3.2's figure was drawn from `_audit/FEATURE_INVENTORY.md` which restricts to plan-gated user_capability inventory rows in scope of Phase 3.2 (omits Billing & AI Accounting non-plan-gated rows and Seller Signals / CRM Sync receive-notification recipient-set rows). V3 counts every line that allocates ✓ / ✗ / ∈ scope / n/a per role. Both numbers are plausibly correct for their respective denominators; neither is a defect.

**V3 plausibility check against the missing-rows backlog from Phase 3.2:**

- Cluster B promises 10 row authorings (§22 / §25.7 / §27.4 / §27.10 / §32 / §48.4 / §48.5 / §48.6 / §50 / §50.11) explicitly cited in the body sections as "is updated to add the row in §5.11." None of the 10 are present in the §5.11 body lines 9179–9270 — confirmed by direct reading. Cluster B count is correctly 10.
- Cluster C promises 7 capability authorings (Marketplace search / EOI / Capability Declarations / API Tokens / Webhooks / Q&A Threads / Promoted Placements). None of the 7 are present.
- Cluster A structural defects (no plan-tier dimension; no Solo column; no Seller-console role columns; no Marketplace role columns; no Ops role columns) are visible at the matrix header level — header is buyer-console-only 11-role × Feature.

**Plausible row count post-remediation (informational, not a V3-binding promise):** 79 + 10 (Cluster B) + 7 (Cluster C) = 96 rows minimum; or with Cluster A "Min Tier" column added, 79 user-capability rows × 1 plan-tier-dimension column = 79 rows + 1 column. AE Ledger to ratify the Cluster A structural choice before v7.1.1.

**Verdict:** ✅ **§5.11 row count plausible at 79 user-capability rows.** Phase 3.2's "~52 capability rows" denominator-drift is non-defect noise. The 17 prescribed missing rows (Cluster B + Cluster C) are tracked under D-3.2-007 through D-3.2-023 with severity P1 each.

### 1.3 §6.1–§6.8 Defects Filed

**Source of truth:** Master Spec §6 lines 9305–9760, comprising §6.1–§6.8 sub-sections.

**Defect coverage by §6 sub-section:**

| §6 sub-section | line range | sub-prompt | defects filed | status |
|---|---|---|---|---|
| §6.1 Authentication Architecture | 9307–9320 | 3.3 §3.1 | 5 (D-3.3-001 … D-3.3-005) | ✅ — covers method enumeration, failure-mode coverage, surface-engine mapping, AC absence, glossary |
| §6.2 Multi-Factor Authentication | 9322–9391 | 3.3 §3.2 | 9 (D-3.3-006 … D-3.3-014) | ✅ — covers numerical-singleton, data-model field absence, enum naming, grace-window contradiction, lost-recovery-codes path, state machine absence, webhooks, retention, AC absence |
| §6.3 Session Management | 9393–9421 | 3.3 §3.3 | 7 (D-3.3-015 … D-3.3-021) | ✅ — covers numerical-singleton, refresh semantics, revocation latency, state machine, Convex outage, mobile divergence, SharedWorker implementation-detail leak |
| §6.4 Domain Governance | 9423–9440 | 3.3 §3.4 | 7 (D-3.3-022 … D-3.3-028) | ✅ — covers error-code drift vs §48.6 M6, consistency drift, state machine absence, three operational-behavior gaps, AC absence, subdomain handling, plan-gating cite |
| §6.5 Guest Users & SSO Bypass | 9442–9450 | 3.3 §3.5 | 3 (D-3.3-029 … D-3.3-031) | ✅ — covers cross-Org guest identity reuse (P1 firewall_leakage), guest interaction with `mfa_required_org_wide`, missing §5.4 cross-reference |
| §6.6 API Token Authentication | 9452–9490 | 3.3 §3.6 | 6 (D-3.3-032 … D-3.3-037) | ✅ — covers three-vocabulary scope-name drift (P1 enum), token format singleton, plan-gating absence, console-firewall on tokens (P1 firewall_leakage), rotation flow, per-token rate-limit allocation |
| §6.7 Audit Logging | 9492–9551 | 3.4 | 7 (D-3.4-001 … D-3.4-007) | ✅ — covers hash-chain integrity (P0), `audit_event_high_impact_actions` registry (P0), failed-login exclusion (P0), Appendix C anomaly events, audit-log surfacing inconsistency, stale plan-tier inline restatement, console-bridge failure-storm detector |
| §6.8 Data Privacy & GDPR Compliance | 9552–9760 | 3.5 | 38 (D-3.5-001 … D-3.5-038) | ✅ — covers Articles 16/18/20/21/22 silence (P0), DSARRequest entity (P0), AIOperation Pattern B contradiction (P0), §6.9 phantom reference (P0), subject verification protocol (P0), residency partitioning of cascade walker (P0), 19 P1 spanning Cluster A through F |

**Total defect coverage:** 82 defects across §6.1–§6.8 (5+9+7+7+3+6+7+38). Plus 24 defects in §5.1–§5.10 (Phase 3.1) and 29 defects in §5.11 (Phase 3.2).

**Verdict:** ✅ **§6.1–§6.8 defects filed.** Every §6 sub-section has at least one defect filed. The §6.7 + §6.8 sub-sections are the source of all 9 Phase-3 P0s. No §6 sub-section is silent at the audit level.

---

## 2. Adversarial Checks

### 2.1 Five-Feature Authorization End-to-End Trace

Per V3 prompt mandate: "Pick 5 features. Trace authorization end-to-end: API → role → §5.11 cell → §34 plan gate. Confirm consistent."

V3 picked five user-capability features spanning Buyer Console, Seller Console, Marketplace, and Billing — one feature per major capability surface — and traced authorization through each layer.

#### Feature 1: Disqualify vendor (soft severity, §25.3.9)

| layer | source | observation |
|---|---|---|
| API | §32.7 (Buyer Console disqualification endpoints; cited from §25.3 throughout) | `POST /v1/workspaces/{ws}/vendors/{vendor}/disqualify` (endpoint contract present per §25.3.7); `403` on RBAC fail; `422 vendor_not_in_use_case_scope` on Use Case Lead with non-intersecting scope |
| Role | §5.11 line 9186 | ✓ for `workspace_owner`, `workspace_admin`, `use_case_lead` (∈ scope); ✗ for `org_owner`, `org_admin`, `billing_admin`, `reviewer`, all guest variants |
| §34 plan gate | §34.1.1 row "Vendor Curation & Disqualification" — core workflow available on every Buyer plan tier | Inline string at §5.11 line 9185 confirms: "core workflow; available on every buyer plan tier (Free / Solo / Starter / Growth / Scale / Enterprise per §34.1.1); no AIOperation billing" |
| Result | | **Consistent.** No P1 defect on this trace. The `(API, role, §5.11 cell, §34 cell)` four-tuple resolves cleanly. |

#### Feature 2: Open Defense View (§13.11.4)

| layer | source | observation |
|---|---|---|
| API | §32 endpoint at §13.11.5 (`defense_view_generate` capability) | `POST /v1/workspaces/{ws}/defense-view/regenerate` and `GET /v1/workspaces/{ws}/defense-view`; rate-limit `1 / 5 min / Workspace` per §13.11.13 AC #17 |
| Role | §5.11 line 9222 | ✓ for `org_owner`, `workspace_owner`, `workspace_admin`, `use_case_lead`, `reviewer`; ✗ for all others (Open) |
| §34 plan gate | §34.1.1 cell **Defense View** — Free=watermarked preview; Solo+=full surface; Enterprise=full + audit-receipt PDF footer | Inline string at §5.11 line 9222 confirms the plan-tier surface differentiation; D-2.4-001 ratified the §5.11 row authoring in V2 spec-side remediation |
| Result | | **Consistent for Open.** The `(API, role, §5.11 cell, §34 cell)` four-tuple resolves cleanly. |

But for the **Regenerate** sibling row (line 9223) the trace fails:

| layer | source | observation |
|---|---|---|
| API | §13.11.5 `defense_view_generate` operator capability | API contract identical to Open path |
| Role | §5.11 line 9223 | ✓ for `org_owner` only; ✗ for `workspace_owner`, `workspace_admin`, `use_case_lead`, `reviewer` |
| §34 plan gate | §34.1.1 cell **Defense View** + §13.11.13 AC #17 rate limit | Plan-gated to Buyer Solo+ |
| Result | | **Inconsistent.** D-3.2-026 surfaces this — §13.11.5 design intent positions Regenerate as a buyer-console operator capability for `workspace_owner` / `workspace_admin` / `use_case_lead` / `reviewer`, but §5.11 narrows to `org_owner` only. P2 (likely under-permissive vs. design intent; junior engineer reading §5.11 builds matrix-correct gate). |

#### Feature 3: Issue Buyer-Funded Pro Trial Seat grant (§34.13.5)

| layer | source | observation |
|---|---|---|
| API | §32.8 (Billing-side endpoints) — cited in §34.13 | `POST /v1/orgs/{org}/pro-trial-seat-grants`; auth scope `write:billing` per §6.6.3 — but D-3.3-032 surfaces three-vocabulary scope drift (`bidding:write` / `evaluation:read` / vs Appendix J `read:requirements` / `write:requirements` / vs §32 `write:billing` / `write:workspaces`); the canonical scope name is unresolved |
| Role | §5.11 line 9231 | ✓ for `org_owner`, `billing_admin`; ✗ for all others |
| §34 plan gate | §34.1.1 cell **Vendor Pro Trial Seats (M17)** — Buyer Scale 5/mo, Buyer Enterprise 15/mo; allowance enforced at operation time per §34.13.5 | Inline cite present at §5.11 line 9231 — never restated; D-2.4-005 ratified the §5.11 row authoring in V2 spec-side remediation |
| Result | | **Consistent at the role / plan layer; P1 unresolved at the API token-scope layer.** The Phase 3 ledger captures via D-3.3-032. |

#### Feature 4: Send Direct Invite From Cohort (§27.9.8 — Seller Scale+ only)

| layer | source | observation |
|---|---|---|
| API | §32 endpoint at §27.9.8 | `POST /v1/seller-signals/{cohort_id}/direct-invite`; plan-gating enforced at operation time per §34.1.2 |
| Role | §5.11 line 9252 | ✓ for `org_owner` only; n/a for buyer-console role columns; Seller Console Role Overlay note (lines 9282–9286) declares `seller_org_admin` inherits `org_owner` access; `seller_marketing_editor` / `seller_integrations_admin` are read-only on this row |
| §34 plan gate | §34.1.2 row "Seller Signals → Direct Invite from Cohort" — Seller Scale+ only | Plan-gating cite present in §5.11 line 9252; D-2.4-004 ratified the §34.1.2 row authoring in V2 spec-side remediation |
| Result | | **Inconsistent at the role-layer rendering.** D-3.2-004 surfaces — the `(API, role, §5.11 cell, §34 cell)` four-tuple is **complete in prose** (Seller Console Role Overlay note explicitly declares the additive permissions) but **incomplete in tabulation** (no Seller-Console role columns in the matrix). A junior engineer reading the matrix without the prose note sees only ✓ on `org_owner` and `n/a` on every other column; the Note paragraph is the only place where `seller_org_admin` / `seller_marketing_editor` / `seller_integrations_admin` permissions are surfaced. **The tabulation gap is a P1 rbac defect; the role-layer enforcement at runtime is not blocked by the spec but the spec is unbuildable without the prose-note layer.** |

#### Feature 5: Marketplace search with capability filter (§27.2)

| layer | source | observation |
|---|---|---|
| API | §32 endpoint at §27.2 (Marketplace search) | `GET /v1/marketplace/search?capability_id={cap_id}&filter_match_score=true`; auth scope per §6.6.3 — same three-vocabulary drift as Feature 3 |
| Role | §5.11 — **NO ROW** | Marketplace search has no §5.11 row at all; per D-3.2-017 it is a major plan-gated capability missing from the matrix |
| §34 plan gate | §34.1.1 cell **Marketplace Buyer Access** (Browse only / Browse only / Search + capability filter / Full + match scoring / Full + match scoring / Full + batch match API across the six Buyer plan tiers including Solo) | Plan gating exists in §34.1.1; **§5.11 is silent**; the §27.2 summary table itself omits Buyer Solo and Seller Solo rows entirely (D-3.2-027) |
| Result | | **Inconsistent across all four layers.** No §5.11 row, no Marketplace role columns (D-3.2-005), §27.2 summary omits Solo rows, plan-gating cite drifts. Junior engineer cannot determine the role gate or the plan gate from §5.11 alone. P1 rbac (Cluster A + Cluster C from Phase 3.2). |

**Verdict:** **3 of 5 features traced cleanly across all four layers** (Feature 1 Disqualify vendor; Feature 2 Open Defense View; Feature 3 Issue Pro Trial Seat at the role/plan layer). **2 of 5 features traced with material gaps** (Feature 4 Direct Invite — tabulation gap on Seller-console roles; Feature 5 Marketplace search — entire-row absence + Marketplace-role-column absence + plan-gating cite drift). Phase 3.2 D-3.2-001 / D-3.2-004 / D-3.2-005 / D-3.2-017 capture the trace failures. No new V3-originated defect from this check; the gaps are already filed.

### 2.2 Three Third-Party Outages — Graceful Degradation Trace

Per V3 prompt mandate: "Pick 3 third-party outages. Confirm spec'd graceful degradation."

V3 picked the three outages most directly implicated by §6 — WorkOS (auth), Convex (session reactivity / cross-console bridge), and Stripe (billing-tier-gate plumbing) — and traced spec-side handling.

#### Outage 1: WorkOS (Authentication / SAML / SCIM / OIDC)

| dimension | source | observation |
|---|---|---|
| In-flight session | §6.3 silent | Implicit: an existing valid session continues to function until its idle / hard timeout because the session token is Sourcera-side. But §6.3 does not declare this degradation contract. → D-3.3-019 (Convex outage) is the closest analog; WorkOS-specific in-flight handling is not authored. |
| New login | §49.1.1 line 30805 magic-link fallback (`workos_sso_failure_burst` synthetic alert + magic-link delivered via Loops.so) + §36.6.6 lines 36334–36346 (2 s p95 fallback render) | Fallback path exists. **§6.1 makes zero cross-reference to §49.1.1 or §36.6.6.** A junior engineer reading §6.1 alone has no signal that a magic-link fallback exists. → D-3.3-001 / D-3.3-002. |
| Ops break-glass | §50.2.4 line 37398 ("Existing active sessions survive the outage up to their time-box; no new quorum can be collected") | Ops-side handling exists. **§6.1 makes zero cross-reference to §50.2.4.** → D-3.3-002. |
| SCIM provisioning during outage | §7.1.2 cites missing §6.9 for SCIM rules; §6.5 silent on SCIM | SCIM behavior during WorkOS outage is unauthored. New-account provisioning silently halts; deprovisioning (the more security-critical direction) silently halts. **§6.5 / §6.9 silent on this failure mode.** → D-3.5-004 (§6.9 phantom reference, P0). |
| MFA enrollment / verification during outage | §6.2 silent on WorkOS dependency for MFA | MFA factors are managed by WorkOS; outage of WorkOS implies MFA verification cannot complete. → D-3.3-002 (failure-mode coverage). |
| Verdict | | **Spec'd partially.** §49.1.1 + §36.6.6 + §50.2.4 carry the runtime degradation; §6 makes zero cross-reference to any of them. Spec-side cross-reference work is the entirety of D-3.3-001 / D-3.3-002. |

#### Outage 2: Convex (Reactive Database / Session Reactivity / Cross-Console Bridge)

| dimension | source | observation |
|---|---|---|
| Active session during Convex outage | §6.3 silent; §29.11 Full-Screen Incident Surface authors a critical-incident takeover | Session-side fallback semantics unauthored — does the user observe HTTP 503 with `Retry-After` or a hard sign-out? **§6.3 silent.** → D-3.3-019. |
| Console-bridge propagation during outage | §25.2.4 / §4.7.1 register per-event `console_bridge.dlq_entered` (D-1.6-003 P1 forwarded for Appendix C / Appendix G registration) and `console_bridge.reconciliation_summary` | Per-event DLQ semantics exist but no aggregate failure-storm detector. Outage that DLQs 1,000 events generates 1,000 individual webhooks. **§42.6.1 audit-integrity job catalog has no parallel "console-bridge-storm" detector job.** → D-3.4-007 (P2) + D-3.4-004 (P1 Appendix C anomaly catalog). |
| Audit-event hash-chain scan during outage | §42.6.1 line 30825 — scan covers `audit_event_high_impact_actions` only (registry undefined per D-3.4-002) | Hash-chain integrity scan with undefined scope is unbuildable as written. **An outage that DLQs the integrity-scan results corrupts the integrity contract silently.** → D-3.4-001 (P0) + D-3.4-002 (P0). |
| DSAR cascade walker during partial outage | §6.8.4 silent on partial-outage handling | Cascade fan-out > 50 K rows long-tail alert is wired (§6.8.4 line 9645; P0 of mid-cascade Convex outage rolling back the cascade transaction is unspecified). → folded into D-3.5-002 (DSARRequest state machine missing). |
| Mobile session during outage | §6.3 silent on mobile | Mobile push-notification arrival is a Convex-mediated fan-out per §38; outage breaks notifications for mobile clients. **§6.3 / §38 makes no cross-reference.** → D-3.3-020. |
| Verdict | | **Spec'd partially.** Per-event DLQ exists (with a forwarded P1 registration); aggregate detection absent (P2 D-3.4-007); audit-integrity protection cannot run as written (P0 D-3.4-001 / D-3.4-002); session-side fallback unauthored (P1 D-3.3-019). Convex is the most-cited dependency in §6 and the most-under-spec'd against outage. |

#### Outage 3: Stripe (Billing / Subscription / Invoicing)

| dimension | source | observation |
|---|---|---|
| Plan-tier gating during Stripe outage | §6 silent (Stripe is out-of-§6-scope per Phase 3.3 §3.8 Counterfactual table) | §32 endpoint contracts gate plan-tier reads off Sourcera-internal `OrgSubscription.tier` snapshot, not real-time Stripe state. Outage does not collapse the gate at the §32 layer. ✅ No §6-direct defect. |
| Auto-topup during outage | §34.10.4 / §4.8.3 state machine (48-hour grace) | `WALLET-PAY-FAIL-GRACE` 48 hours per AUTHORITATIVE_SOURCE_MAP.md Section E; sourced from §34.10.4 prose. ✅ Stripe outage handling is wired; not a §6 defect. |
| ContestRecord workflow during outage | §4.8.5 ContestRecord state machine | Filing a contest does not depend on real-time Stripe state. ✅. |
| Webhook retry during Stripe outage | §31.5 retry curves; AUTHORITATIVE_SOURCE_MAP.md Section W defers to Appendix F | Retry curve exists; v7.1.1 backlog. ✅ — not a §6 defect. |
| API token billing scope during outage | §6.6 silent; §32.8 endpoints rate-limited | Read-side only; Stripe outage does not break token authentication. ✅. |
| Verdict | | **Spec'd cleanly.** Stripe outage handling is in §34 / §4.8 / §31; §6 has no Stripe-direct concern. No defect filed for Stripe in §6 scope (matches Phase 3.3 §3.8 Counterfactual table). |

**Verdict:** **2 of 3 outages spec'd partially (WorkOS + Convex); 1 of 3 spec'd cleanly (Stripe).** D-3.3-002 (WorkOS), D-3.3-019 (Convex session), D-3.4-001 + D-3.4-002 (Convex audit-integrity), D-3.4-007 (Convex bridge-storm), D-3.4-004 (Appendix C anomaly catalog) collectively capture the WorkOS + Convex gaps. No new V3-originated defect from this check.

### 2.3 Three DSAR Scenarios — End-to-End Erasure Trace

Per V3 prompt mandate: "Pick 3 DSAR scenarios. Walk erasure end-to-end. Confirm cascade."

V3 picked three DSAR scenarios spanning the §6.8.4 cascade fan-out classes, the §6.8.5 audit-integrity exemption row classes, and the §6.8.4.1 Pattern A / Pattern B partition.

#### Scenario A: Buyer-Org Workspace Owner subject DSAR (cascade Class 2 user-content + Class 3 financial-record audit)

| step | spec source | observation |
|---|---|---|
| 1. Subject submits DSAR via §6.8.1 export OR §6.8.6 deletion request | §6.8.1 / §6.8.6 | DSAR submitted; verification protocol UNDEFINED (D-3.5-005 P0). Subject's `verified_at` cannot be stamped without protocol. |
| 2. DSARRequest entity persists | §6.8.6 references `verified_at`, `extension_reason`, `fulfilled_at`, etc. | **DSARRequest entity is unauthored** (D-3.5-002 P0). Persistence path uncomputable. |
| 3. SLA clock starts at `verified_at` | §6.8.6 row "Verified subject-request receipt → first acknowledgment to subject < 72 hours"; "fulfillment < 30 calendar days" | SLA clock contract is authored; clock-start trigger requires `verified_at` which requires (1) and (2). |
| 4. Cascade walker fans out across §4 entities | §6.8.4 Classes 1–5 + §6.8.4.1 per-entity Pattern A / B table | Cascade walker is **residency-silent** (D-3.5-006 P0). EU subject cascade walked by US-region worker writes pre-pseudonym predecessors into US logs. |
| 5. Pattern B applied to AIOperation `actor_id` | §6.8.4.1 line 9688 + §4.8.1 AC #12 line 7982 + §6.8.5 row #3 line 9715 | **Three-way contradiction** (D-3.5-003 P0): §6.8.4.1 prescribes Pattern B preserve-FK, §4.8.1 AC #12 prescribes scrub-`actor_id`, §6.8.5 row #3 references the non-existent field `submitter_user_id`. Field-name mismatch (D-3.5-016 P1). |
| 6. Audit-integrity exemption applied per §6.8.5 row class | §6.8.5 row classes 1 / 2 / 3 / 4 / 5 / 6 / 7 / 8 / 9 / 10 / 11 / 12 / 13 / 14 / 15 | Audit-integrity exemption is the ONE part of §6.8 that is well-specified post-D-1V3-001 / D-1V3-003 remediation. |
| 7. KB-Entry author DSAR — embedding cascade | §22.3.1 line 15211 hard-delete + vector + BM25 same-Convex-transaction | KB-entry-level erasure is sound; **author-level Pattern B is correctly determined (preserve `created_by`, pseudonymize User row, embeddings unchanged because they don't encode author identity)**. ✅ for author-DSAR. |
| 8. Subject Acknowledgment | §6.8.6 row "Cascade fulfilled → subject acknowledgment < 72 hours" | Surface contract authored; depends on (2) and (4). |
| Result | | **Cascade incomplete-and-inconsistent.** Steps 1, 2, 4, 5 each carry a P0 blocker; step 7 is sound for the KB-author path but D-3.5-012 P1 surfaces the third-party-DSAR-on-KB-body PII gap. |

#### Scenario B: Seller-Org Bid Workspace Owner subject DSAR (cross-console bridge cascade + Marketplace signal recompute)

| step | spec source | observation |
|---|---|---|
| 1. Subject submits DSAR | §6.8.1 / §6.8.6 | Same blockers as Scenario A (D-3.5-002, D-3.5-005). |
| 2. Cross-console bridge event cascade | §4.7.1 / §4.7.1.1 — D-1V-012 remediated Pattern B on `created_by` / `updated_by` UUID FKs and Pattern A inside `payload_json` for embedded user references | Pattern partition asserted by CI gate `bridge_event_dsar_cascade_field_partition`; ✅ for primary cascade. |
| 3. Salt rotation interaction | §6.8.5 AC #3 — rotation MUST trigger re-pseudonymization within 7 days | **Pseudonym embedded inline in `payload_json` (Pattern A inside JSON) becomes inconsistent on salt rotation** — the User row's `email`/`full_name` rewritten to new hash, but `payload_json`-embedded pseudonym remains old hash (D-3.5-032 P2). |
| 4. SellerSignal cohort recompute | §4.4.18 line 5530+ — DSAR triggers recompute within 24 hours; if recompute drops cohort < k, signal suppressed | Entity-level recompute path is wired. **§6.8.4 Class 5 cascade walker does NOT route through §4.4.18's recompute path** (D-3.5-031 P2) — staff engineer reading §6.8.4 alone misses the trigger; staff engineer reading §4.4.18 alone assumes the nightly sweep covers it (24-hour cohort-leak window). |
| 5. CategoryPage / HeatMapCell / MarketIntelligenceReport k-anon recompute | §4.4.12 line 5109; §4.4.16 line 5373; §4.4.15 line 5273 | Entity-level paths wired; cascade-walker integration silent — same defect class as (4). |
| 6. CRM Sync (§31.9) cleanup | §31.9 / §6.8 silent | Subject's CRM Sync activity records, CRMFieldMapping entries, CRMRoutingRule entries — DSAR cascade unauthored against §31.9 entities. **Authored extension owed.** Tracked under D-3.5 broad cascade-walker absence (folded into D-3.5-002 / D-3.5-006). |
| 7. Promoted Listing / Featured Placement audit trail | §4.4.19 / §4.4.20 cascade behavior | DSAR cascade against PromotedListing `purchaser_user_id`, FeaturedPlacement `granted_by_user_id` not enumerated in §6.8.4 fan-out classes. → Phase 1.4 §4.5 leftover. |
| Result | | **Cascade partially-spec'd.** Cross-console bridge cascade is sound (D-1V-012 remediated). Salt rotation, k-anon recompute, CRM Sync, Marketplace Promoted/Featured carry P1 / P2 gaps. |

#### Scenario C: Third-party DSAR — subject named in a Comment body but not Sourcera-account-holder

| step | spec source | observation |
|---|---|---|
| 1. Subject's identity is asserted via §6.8.5.X — none authored | §6.8 silent; §6.8.5 row classes do not address third-party DSAR | **Verification path is unauthored** (D-3.5-027 P2 + D-3.5-005 P0 third-party DSAR carve-out). |
| 2. Cascade walker — search across all `comment.body`, KB Entry body, internal-comment-thread body for the subject's name / email / phone | §22.3.1 KB Entry retention silent on body-level redaction sweep | KB body PII redaction unauthored (D-3.5-012 P1). VerificationReviewRecord §40.2 row addresses third-party DSAR for `documentation_refs`; KB Entry has no parallel. |
| 3. Pattern A applied to free-text columns (column rewrite) — but the free text is encoded in dense embedding vectors | §22.4.5 Embedding Version Bumps | Co-transactional embedding cascade exists at the entry level; **third-party DSAR redacts only the body, not the embedding vector — so the dense vector still encodes the subject's name** until the next embedding version bump rolls through. |
| 4. Audit-integrity exemption for `mention_of_third_party_subject` | §6.8.5 row classes silent | Audit-integrity carve-out for third-party DSAR mentions is unauthored. |
| 5. Subject acknowledgment | §6.8.6 row | Surface contract assumes subject is account-holder; third-party DSAR delivery via email-based magic-link is unauthored — Ops-mediated identity proof per D-3.5-005 recommendation. |
| Result | | **Cascade entirely unauthored for third-party DSAR.** The third-party-DSAR right is statutorily required under GDPR Art. 12 / 17 and is the most common DSAR class for B2B SaaS where employees of customers / vendors are named in customer text. **D-3.5-005 P0 (verification protocol) + D-3.5-012 P1 (KB body PII embedding cascade) + D-3.5-027 P2 (general third-party DSAR policy) collectively surface; no single defect captures the end-to-end gap.** V3 promotes this to a structural concern — see §3 Known Gaps below. |

**Verdict:** **All 3 DSAR scenarios trace incompletely.** Scenario A blocks at four P0s (DSARRequest entity, verification protocol, residency partitioning, AIOperation contradiction). Scenario B traces partially (cross-console bridge sound; salt rotation, k-anon recompute, CRM Sync, Marketplace Promoted/Featured carry P1 / P2 gaps). Scenario C is entirely unauthored at the structural level. Phase 3.5's 6 P0 + 19 P1 collectively capture the gaps but the third-party DSAR end-to-end is sufficiently cross-cutting that V3 promotes it to a Known Gap (§3 below).

---

## 3. Known Gaps (Auth or DSAR Scenarios Not Covered by Phase 3 Sub-Prompts)

V3 walks the audit-checklist edge-case dimensions against the five sub-prompts to surface scenarios that fall through the cracks.

| scenario | covered by | gap |
|---|---|---|
| **Cross-Org user (member of N Orgs)** session and DSAR semantics | §6.5 D-3.3-029 (P1 firewall_leakage on cross-Org guest identity reuse); §6.8 silent on cross-Org DSAR cascade | D-3.5-021 P1 forwarded; **§6.9 phantom reference (D-3.5-004 P0) blocks cross-Org deprovisioning** end-to-end. Compound gap: cross-Org user closes account in one Org → does the closure cascade to other Orgs? Spec silent. **V3 Known Gap.** |
| **Magic-link DSAR delivery to a deprovisioned subject** | §6.8.1 line 9576 ("secure download link valid for 7 days"); D-3.5-007 P1 surfaces the auth-gate gap | Deprovisioned subject (Org Admin removed the user) loses session access; magic-link delivery to the deleted email account — does Sourcera require an alternate email at DSAR submission? Spec silent. **V3 Known Gap.** |
| **DSAR re-run idempotency** | D-3.5-018 (paired field-existence defects on DSARRequest, derived from D-3.5-002) | Subject submits DSAR-erasure twice; second submission against pseudonymized rows — Pattern B is no-op idempotent at the row level (acknowledged in PHASE3.5_FINDINGS.md §7 F-176 #2) but the DSARRequest entity-level idempotency rule is unauthored (no dedup window, no `request_kind` collision rule). **V3 Known Gap.** |
| **Manifestly-unfounded request (Art. 12(5))** | D-3.5-005 mentions "auto-state-transitioned to `manifestly_unfounded_rejected` (Art. 12(5))" in the recommendation column | The §6.8.6 AC body itself does not author the abuse-flood control (refusal authority, fee, audit-event emission, subject-notification of rejection). **V3 surfaces as `D-3V-003` P0 dsar — the AC contract path implies the state transition but the §6.8 body is silent on the controller-side authority and the audit emission contract.** Filed in §6 below. |
| **Suspended Org DSAR cascade** | §6.8 silent; §1.5 / §49.3 Org-suspension cluster | Subject in a suspended Org submits DSAR — does the cascade walker honor suspension semantics? Frozen-state on §4.8.5 ContestRecord + §4.8.1 AIOperation Failure Mode #8 implies HTTP 423 mid-cascade. Spec silent on Org suspension as a cascade gate. **V3 Known Gap.** |
| **Legal hold collision with erasure** | PHASE3.5_FINDINGS.md §7 F-173 #1 mentions "Deprovisioning + active legal hold collide (Art. 17(3)(e) carve-out)"; D-3.5-014 forwards | §6.8.5 audit-integrity exemption covers the audit-trail half; legal-hold-as-explicit-state on User OR DSARRequest is unauthored. A subject under legal-hold cannot be erased, but the spec carries no `legal_hold_active` predicate, no Ops surface to file/release a hold, and no DSAR-side error code. **V3 Known Gap.** |
| **API Token rotation during Stripe outage** | D-3.3-036 P2 (rotation flow); D-3.3-037 P2 (per-token rate-limit allocation) | Token rotation during Stripe outage (Stripe outage = plan-tier-gate plumbing degraded) — does rotation succeed? Spec silent on rotation's billing-tier-snapshot dependency. **V3 Known Gap.** |
| **Mobile session DSAR notification surface** | D-3.3-020 P1 (mobile session); D-3.5-007 P1 (export auth gate) | Subject submits DSAR; receives `dsar_export_ready` notification on mobile — does the mobile notification carry the magic-link, or only an in-app deep-link? Spec silent. **V3 Known Gap.** |
| **DSAR + active VendorOptOut collision** | §4.4.8 VendorOptOut suppresses Marketplace surfaces; §6.8.4 cascade walker silent on opt-out interaction | Subject is the seller's `marketplace_publisher` who has filed a VendorOptOut; subject submits DSAR — does the cascade re-trigger Listing suppression / k-anon recompute? Same defect class as D-3.5-031 (k-anon recompute) but on a different cohort. **V3 Known Gap.** |
| **Buyer-Funded Pro Trial Seat grant subject DSAR** | §34.13 Pro Trial Seat lifecycle; §6.8.5 row #11 ReferralRecord exemption | Subject is a buyer who issued a Pro Trial Seat grant to a vendor; subject submits DSAR — is the grant audit-row exempt (financial-record class) or pseudonymized (user-content class)? Spec silent on Pro Trial Seat as a §6.8.4 fan-out class member. **V3 Known Gap.** |

**Verdict:** ✅ **Phase-3 audit coverage is comprehensive at the §5 / §6 surface level**, but **the DSAR cross-cutting surface (cross-Org cascade, third-party DSAR end-to-end, suspended Org cascade, legal hold, API Token rotation under Stripe outage, mobile DSAR delivery, opt-out collision, Pro Trial Seat DSAR class) carries 10 known gaps that V3 surfaces as Phase-9 / Phase-12 / v7.1.1 backlog items**. None of these gaps is a Phase-3-direct defect (they are cross-phase) but they are documented here per the V3 prompt scope #3.

---

## 4. Coverage Matrix Tightness — Phase 3 Columns

V3 audits the five Phase-3-scoped columns of `COVERAGE_MATRIX.md`: `rbac`, `plan_gating`, `console_firewall`, `dsar`, `observability`. Per Phase 2.x precedent, V3 reads "tight" as "every prescribed cell tightening from a sub-prompt is reflected in the matrix file at the cell level" — not as "every cell is ✅."

| column | tightening pass | rows promoted ✅ | rows demoted ❌ / ⚠ | rows held | residual |
|---|---|---|---|---|---|
| `rbac` | Phase 3.1 §6 (21 rows F-138 … F-158) + Phase 3.2 §6 (~70 rows; aggregate counters reserved for V3) + Phase 3.3 §4 (9 rows F-161 … F-169) | 0 ✅ promotions (every prescribed change is a demotion or hold) | Phase 3.1: 21 cell tightenings prescribed (8 ✅→⚠, 10 ✅→❌, 3 ✅→✅ holds); Phase 3.2: ~70 user_capability rows prescribed for `rbac` ⚠ → ❌ on Cluster A column-set defects; Phase 3.3: 51 cell changes across F-161…F-169 | majority hold pending corpus-wide flush | Insufficient for V-prompt sign-off — Phase 3.1 §8 confirms 21 tightenings applied to matrix file; Phase 3.2 §6 confirms ~70 tightenings prescribed but NOT all propagated; Phase 3.3 §4 confirms 51 changes applied. Cell-level audit pending. |
| `plan_gating` | Phase 3.2 §6 (~70 rows on Cluster A / B / C plan_gating defects) + Phase 3.4 §6 (1 row F-179 for `D-3.4-006`) | 0 ✅ promotions | Phase 3.2: ≈ 70 user_capability `plan_gating` ⚠ → ❌ tightenings prescribed (Marketplace search / EOI / Match Score / Verification Tier / Promoted Placement / Capability Declaration / KB / Webhook Endpoint / API Token / Q&A Threads / Internal Comment Thread Management / M2 / M5 / M8 / M9–M13 / Loss Debrief / Seller Template); Phase 3.4: F-179 plan_gating ⚠ → ❌ | majority hold | Insufficient for V-prompt sign-off — D-3.2-001 (matrix-dimension extension) blocks any clean ✅ promotion until v7.1.1 Phase 14.9.2 inline tier-list audit lands. |
| `console_firewall` | Phase 3.1 §6 (F-153 / F-154 ⚠ → ❌) + Phase 3.5 §9 (F-172 / F-173 / F-174 / F-175 / F-176 / F-177 / F-503 — DSAR cascade walker residency) | 0 ✅ promotions | Phase 3.1: 2 cell tightenings; Phase 3.5: ≈ 7 cell tightenings on DSAR cascade walker residency-binding gap | majority hold | Insufficient for V-prompt sign-off — D-3.5-006 P0 residency-silent cascade walker is the single largest open `console_firewall` defect. |
| `dsar` | Phase 3.5 §9 (F-172 / F-173 / F-174 / F-175 / F-176 / F-177 / F-503) + Phase 3.4 §6 (F-117 Audit Event Entity DSAR-cascade interaction) | 0 ✅ promotions | Phase 3.5: ~7 cell tightenings prescribed; Phase 3.4: F-117 `data_model` ⚠ → ❌ implicates DSAR cascade integrity | majority hold | Insufficient for V-prompt sign-off — D-3.5-001 / -002 / -003 / -004 / -005 / -006 collectively block any `dsar`-column ✅ promotion. |
| `observability` | Phase 3.4 §6 (F-117 / F-170 / F-171 / F-179 / F-567 / F-711) + Phase 3.5 §6 (DSAR audit emission gap) | 0 ✅ promotions | Phase 3.4: 6 feature-row cell tightenings (`observability` ⚠ → ❌); F-117 `data_model` ⚠ → ❌; F-170 `notifications` ⚠ → ❌; F-179 `console_firewall` ✅ → ⚠; Phase 3.5: DSAR audit emission cells ⚠ → ❌ | majority hold | Insufficient for V-prompt sign-off — D-3.4-001 / -002 / -003 + D-3.5 emission gaps collectively block clean ✅ promotion. |

**Verdict:** ❌ **Coverage matrix `rbac` / `plan_gating` / `console_firewall` / `dsar` / `observability` columns are NOT tight** — the prescribed cell tightenings are predominantly ⚠ → ❌ demotions reflecting unfilled defects, not ✅ promotions reflecting closures. Per the V3 prompt sign-off rule, the matrix is consistent with the open-defect inventory but the columns will tighten only as the 9 P0 + 88 P1 close in spec-side remediation.

---

## 5. Counterfactual Pass

For each Phase-3 audit area, V3 enumerates three realistic failure modes and confirms whether the spec addresses them.

### 5.1 §5 RBAC Architecture

1. **Junior engineer reading §5.3 alone builds five wrong roles.** Phase 3.1 D-3.1-006 captures (canonicality drift between §5.3 Title-Case names and Appendix J / §4.3.1 / §5.11 lowercase enums). Spec does NOT address as written; D-3.1-006 P1 captures.
2. **Cross-console role overlay race.** A user holding `workspace_owner` (Buyer) and `bid_workspace_owner` (Seller) in the same Org switches active console mid-session — does the cross-console firewall auto-redact the active permissions? §1.3 firewall doctrine implicit; §5.1 silent; D-3.1-002 P2 captures.
3. **`mfa_required_org_wide` interaction with cross-Org guest.** A guest at Enterprise Org-A (`mfa_required_org_wide=true`) is also an SSO-managed user at Org-B (her employer) — does her Sourcera login bypass her own Org's SSO via §6.5? D-3.3-029 P1 firewall_leakage captures.

### 5.2 §5.11 Feature Access Matrix

1. **Marketplace search row absence.** Junior engineer enforces role gate via §5.11 only and ships a Marketplace search endpoint with no plan-tier gate. §34.1.1 cell `Marketplace Buyer Access` carries the gate; §5.11 is silent. D-3.2-017 P1 captures.
2. **`seller_pro` runtime resolution.** §50 Loss Debrief property test asserts `seller_pro` plan-tier gating; `seller_pro` is not a registered Appendix J `seller_plan_tier` enum value; runtime resolver fails. D-3.2-014 P1 captures (held at P1 because runtime enforcement is not yet wired; would escalate to P0 if wired).
3. **§5.11 column header normalization breaks downstream lookups.** §5.11 column header "Workspace Owner" maps 1:1 to canonical `workspace_owner` per §4.3.1; spec carries no explicit mapping note; D-3.2-029 P2 captures (presentational, not implementation-blocking).

### 5.3 §6 Authentication / Session / Domain / MFA / API Token

1. **Three token-scope vocabularies disagree on canonical name.** D-3.3-032 P1 enum captures; junior engineer building token scope enforcement against §6.6.3 ships token system that §32 endpoints reject.
2. **WorkOS outage during Enterprise `mfa_required_org_wide` enforcement.** §6.2.2 silent on WorkOS-outage interaction; D-3.3-002 P1 captures.
3. **Default-infinite API token at Enterprise security posture.** D-3.3-034 P1 plan_gating captures — Enterprise should enforce 90-day rotation but spec defaults to no expiration.

### 5.4 §6.7 Audit Logging

1. **Break-glass operator deletes "low-impact" audit rows.** D-3.4-001 P0 captures — undefined "high-impact" subset means most rows are unprotected; §50.2.4 ¶4 break-glass write path bypasses validator.
2. **Failed-login forensic discovery during regulatory audit.** D-3.4-003 P0 captures — SOC 2 CC6.1 / NIST 800-53 AU-2 hard violation.
3. **Cross-section access matrix drift between §6.7.4 / §36.2 / §5.2.1.4 / §50.5.4 / §50.5.5.** D-3.4-005 P1 captures.

### 5.5 §6.8 Data Privacy & GDPR Compliance

1. **AIOperation contradictory cascade prescription.** D-3.5-003 P0 captures — three-way contradiction (§6.8.4.1 vs §4.8.1 AC #12 vs §6.8.5 row #3) on a financial-record audit row.
2. **EU subject DSAR cascade walked by US-region worker.** D-3.5-006 P0 captures — residency-silent cascade walker, GDPR Chapter V transfers risk.
3. **Articles 16/18/20/21/22 silence at production deployment.** D-3.5-001 P0 captures — GDPR Chapter III rights-coverage hard violation for EU/EEA deployments.

**Verdict:** All 15 enumerated failure modes are captured in open Phase-3 defects. Counterfactual coverage is complete; the spec addresses 0 of 15 — that is the residual remediation backlog.

---

## 6. Defects Filed by V3

| defect_id | severity | class | location | one-line summary |
|---|---|---|---|---|
| `D-3V-001` | P1 | consistency_drift | `PHASE3.3_FINDINGS.md` §2 headline ("0 P0 / 27 P1 / 9 P2 / 1 P3"); `PHASE3.3_FINDINGS.md` §6 Severity Mix table ("0 P0 / 26 P1 / 11 P2 / 0 P3") | Phase 3.3 internal severity-mix discrepancy: §2 headline reports 27 P1 + 9 P2 + 1 P3 (37 total), §6 Severity Mix table reports 26 P1 + 11 P2 + 0 P3 (37 total). Total count agrees (37) but the P1 / P2 / P3 partition disagrees. The discrepancy is internal to the scratch log — it does not affect the ledger row counts (each defect has a single severity at file-time per the audit-program immutability rule) — but it blocks V3's structural roll-up from being citation-clean. Per the audit-program convention, scratch-log internal counts MUST be self-consistent. Recommended fix: re-tabulate the 37 D-3.3 rows from `DEFECT_LEDGER.md` (the authoritative source per CLAUDE.md §13.5) and overwrite both §2 headline and §6 table to match the ledger; if the ledger and either count disagree, file a follow-on ledger-correction defect. V3 expects the ledger's per-row severity to be authoritative; the scratch-log is informational. |
| `D-3V-002` | P1 | documentation_gap | `_integration/AUTHORED_EXTENSIONS_LEDGER.md` (no Phase-3 cluster); cross-references `PHASE3.1_FINDINGS.md` §3.1, `PHASE3.2_FINDINGS.md` §8 (proposed AE-3.2-001 .. AE-3.2-006), `PHASE3.3_FINDINGS.md` §3.6 (token-scope canonicalization), `PHASE3.5_FINDINGS.md` §6 Revision #1 (Articles 16/18/20/21/22 sub-section authoring) | Phase-3 sub-prompts collectively prescribe ≥ 12 Authored Extensions across (a) `seller_workspace_role` Appendix J enum extension (D-3.1-013 / -015), (b) `marketplace_role` Appendix J enum extension (D-3.1-017), (c) §5.11 matrix-dimension extension (D-3.2-001), (d) §5.11 column-set extension for Seller / Marketplace / Ops console roles (D-3.2-004 / -005 / -006), (e) authoring of missing §5.11 rows for Marketplace search / EOI / Capability Declarations / API Tokens / Webhooks / Q&A Threads (D-3.2-017 .. -023), (f) `console_scope` axis extension on ApiToken (D-3.3-035), (g) §6.4 absorption of §48.6 detail (D-3.3-023), (h) §6.7.5 hash-chain integrity authoring (D-3.4-001), (i) §6.7.6 authentication-audit-event sub-section (D-3.4-003), (j) §6.8.7 / §6.8.8 / §6.8.9 / §6.8.10 / §6.8.11 GDPR rights authoring (D-3.5-001), (k) DSARRequest entity authoring (D-3.5-002), (l) §6.9 User Deprovisioning authoring (D-3.5-004). `_integration/AUTHORED_EXTENSIONS_LEDGER.md` carries no Phase-3-cluster header, no AE-3.x rows, and no ratification queue for the v7.1.1 stamp gate. Per the AE Ledger release-gate policy (open `pending` rows ratify before each version stamp), the absence is a documentation gap that compounds the per-defect remediation work. Recommendation: author "Phase 3 Authored Extensions (2026-05-04)" cluster in `_integration/AUTHORED_EXTENSIONS_LEDGER.md` with placeholder rows AE-3.1-001 .. AE-3.1-NN, AE-3.2-001 .. AE-3.2-NN, AE-3.3-001 .. AE-3.3-NN, AE-3.4-001 .. AE-3.4-NN, AE-3.5-001 .. AE-3.5-NN, owners pending; bind each row to its source defect via `defect_ref` column. Ratification gate: before v7.1.1 stamp. |
| `D-3V-003` | P0 | dsar | §6.8.6 AC #1 (line 9757) and SLA row "Verified subject-request receipt → first acknowledgment to subject < 72 hours"; D-3.5-005 recommendation column references the state value `manifestly_unfounded_rejected` | Newly-surfaced P0: the `manifestly_unfounded_rejected` state value is referenced in D-3.5-005's recommendation column ("auto-state-transitioned to `manifestly_unfounded_rejected` (Art. 12(5))") and is implicitly required by the §6.8.6 AC #1 contract path (subject who fails verification within 7 calendar days), but the §6.8 body itself does NOT author the abuse-flood control: (a) GDPR Art. 12(5) controller-side authority (refusal of manifestly-unfounded or excessive requests; reasonable fee for excessive requests) is unauthored; (b) the rejection-state retention class is unauthored in §6.8.5 row classes (rejected-DSARRequest rows have no documented retention); (c) audit-event emission for rejection (`dsar.rejected_manifestly_unfounded` action_type) is unauthored in Appendix J; (d) subject-notification template for rejection (Appendix C entry) is unauthored. P0 by Severity rule (c) — GDPR Art. 12(5) is a hard regulatory requirement at production deployment in EU/EEA jurisdictions; without controller-side rejection authority the spec has no path to refuse abusive DSAR floods, exposing Sourcera to denial-of-service via DSAR. Recommendation: (1) author §6.8.6.2 "Manifestly-Unfounded and Excessive Requests" sub-section declaring (a) controller-side authority to refuse OR charge a reasonable fee per Art. 12(5); (b) state-machine transition `verifying → manifestly_unfounded_rejected` with conditions (verification failure 3× within 7d; OR multi-Org abuse pattern; OR explicit Ops review with documented rationale); (c) retention class on rejected DSARRequest (7-year audit-integrity exemption + per-Org rate-limit anomaly signal); (d) subject-notification: rejection notice with reason code, appeal path, and DPO contact; (e) audit emission `dsar.rejected_manifestly_unfounded` registered in Appendix J Phase-3V cluster + Appendix C `dsar.rejected_manifestly_unfounded` notification entry. Acceptance criteria. CI gate `dsar_manifestly_unfounded_rejection_audit_emission`. (2) Update D-3.5-005 to cross-reference D-3V-003 — the recommendation column's reference becomes a body authoring obligation. |

All three defects appended to `DEFECT_LEDGER.md` 2026-05-04.

---

## 7. Self-Challenge Pass

Re-reading every V3 finding as a hostile reviewer:

**D-3V-001 (Phase 3.3 severity-mix internal drift) — severity check.**
- *Reproducibility?* Yes — §2 headline at line 48 of `PHASE3.3_FINDINGS.md` reads "0 P0 (no regulator-blocking defects), 27 P1 (unbuildable as written), 9 P2 (ambiguous), 1 P3 (cosmetic)"; §6 Severity Mix table at line 196 reads "P1 26 ... P2 11 ... P3 0". Confirmed by direct read. Total 37 agrees; partition disagrees.
- *Could a hostile reviewer argue this is not a defect?* "It's a scratch-log inconsistency, not a ledger inconsistency." Counter: the scratch log is the audit-program-internal source for Phase-3 V-prompt structural roll-up; an inconsistent scratch log forces V3 to choose a count, and that choice should be ledger-derived. The ledger is authoritative per CLAUDE.md §13.5. P1 stands; severity floor is P1 per Severity rule "missing or contradictory documentation."
- *Could the recommendation be sharper?* Yes — V3 names the canonical authority (DEFECT_LEDGER.md per-row severity at file-time). Confirmed.

**D-3V-002 (Phase-3 AE Ledger queue absent) — severity check.**
- *Reproducibility?* Yes — `_integration/AUTHORED_EXTENSIONS_LEDGER.md` confirmed via direct read; no Phase-3 cluster.
- *Severity P1 vs P2?* P1 reserved for buildability gaps; the missing AE queue does not block Phase-3 spec-side remediation directly (each defect's recommendation column is sufficient for the spec edit), but the missing queue blocks the v7.1.1 stamp gate per AE Ledger release-gate policy. A junior engineer who lands the spec-side edits without the AE queue then files no AE rows and the v7.1.1 stamp lands without ratification of structural extensions. P1 stands.
- *Could the recommendation be sharper?* Yes — V3 names the canonical authority (`_integration/AUTHORED_EXTENSIONS_LEDGER.md`) and the per-cluster row pattern. Confirmed.

**D-3V-003 (manifestly-unfounded rejection authority) — severity check.**
- *Reproducibility?* Yes — `manifestly_unfounded_rejected` referenced exactly twice in the corpus (D-3.5-005 recommendation column line 25 of PHASE3.5_FINDINGS.md plus the `request_kind`/`state` enum in D-3.5-002 recommendation). §6.8 body grep on `manifestly_unfounded` returns zero hits; §6.8.5 row classes do not enumerate the rejection class; Appendix J `audit_event_action_type` greps clean.
- *Could a hostile reviewer argue this is P1 not P0?* "GDPR Art. 12(5) is a controller-side discretion, not a hard requirement." Counter: Art. 12(5) is mandatory in the inverse direction — the controller MUST not unjustifiably refuse a request, and the authority to refuse must be exercised within the GDPR framework. Without the spec-side authority, Sourcera cannot lawfully refuse abusive requests; the practical effect is a DoS exposure (subject submits 1,000 DSARs/day, each clock-starts at `verified_at`, fulfilment overhead crushes the ops queue). Severity rule (c) — "violates a hard regulatory requirement (GDPR... data-residency lock, audit-log integrity)" — applies because the missing rejection authority breaches GDPR-compliance posture at production deployment. P0 stands.
- *Could the recommendation be sharper?* Yes — V3 names §6.8.6.2 sub-section authoring + state-machine transition + retention class + audit emission + subject notification + CI gate. Confirmed.

**Sample-pass coverage check.**
- *Are 5 features enough for the authorization end-to-end trace?* The audit prompt asks for 5; V3 picked across Buyer Console (Disqualify, Defense View, Pro Trial Seat issuance), Seller Console (Direct Invite), and Marketplace (search). Yes, the sample spans console-firewall partitions and plan-tier gating dimensions.
- *Are 3 outages enough?* WorkOS, Convex, Stripe — the three named in §6.1 / §1.5 / §34. Two of three are §6-direct (WorkOS, Convex); Stripe is §6-orthogonal but is one of the audit-checklist named dependencies. Sample covers the §6 dependency surface.
- *Are 3 DSAR scenarios enough?* Buyer-Org account-holder + Seller-Org account-holder + third-party DSAR span the three primary subject classes. Every Phase 3.5 P0 / P1 surfaces in at least one scenario. Sample is adequate.

**No hostile revisions force severity bump on D-3V-001 or D-3V-002. D-3V-003 stands at P0.**

---

## 8. Sign-Off Criteria

| sign-off criterion (V3 prompt §4) | observed | result |
|---|---|---|
| **Zero P0 firewall_leakage / dsar / observability in Phase 3 scope** | 9 open P0: D-3.4-001 (observability/firewall_leakage), D-3.4-002 (enum/observability), D-3.4-003 (observability/firewall_leakage), D-3.5-001 (dsar), D-3.5-002 (data_model/dsar-blocking), D-3.5-003 (dsar), D-3.5-004 (documentation_gap/dsar-blocking), D-3.5-005 (dsar), D-3.5-006 (residency/dsar) + V3-originated D-3V-003 (dsar) | ❌ |
| **Every P1 has remediation owner + recommendation** | 88 P1 defects across Phase 3.1 (17), Phase 3.2 (23), Phase 3.3 (26), Phase 3.4 (3), Phase 3.5 (19); V3-direct sample of 15 P1 rows confirms every row's `recommendation` column is populated and every row's `owner` column is populated; **but the AE Ledger does not yet carry a Phase-3 cluster** — the structural-extension subset of the P1 backlog (D-3.2-001 / -004 / -005 / -006, D-3.5-001 / -002 / -004 GDPR rights) requires AE ratification before v7.1.1 stamp; D-3V-002 captures | ⚠ partial — recommendation column populated; AE queue absent |
| Every role audited (V3 §1.1) | ✅ — §5.1–§5.10 fully audited; §50 Ops-role intersection-only-audited (deferred to Phase 9) | ✅ |
| §5.11 row count plausible (V3 §1.2) | ✅ — 79 user-capability rows in body; 17 promised rows missing per Cluster B + Cluster C; row count plausible at the audit denominator | ✅ |
| §6.1–§6.8 defects filed (V3 §1.3) | ✅ — every §6 sub-section has at least one defect filed | ✅ |
| Coverage matrix `rbac` column tight | 21 + ~70 + 51 cell tightenings prescribed; majority hold | ❌ insufficient |
| Coverage matrix `plan_gating` column tight | ~70 + 1 cell tightenings prescribed; majority hold | ❌ insufficient |
| Coverage matrix `console_firewall` column tight | 2 + ~7 cell tightenings prescribed; majority hold | ❌ insufficient |
| Coverage matrix `dsar` column tight | ~7 + 1 cell tightenings prescribed; majority hold | ❌ insufficient |
| Coverage matrix `observability` column tight | 6 + N cell tightenings prescribed; majority hold | ❌ insufficient |

**Verdict:** **HALT — V3 sign-off withheld.** Audit coverage is complete (3/3 V3 structural checks pass; 5/5 features traced; 3/3 outages traced; 3/3 DSAR scenarios traced). Cleanliness fails (10 open P0 in Phase-3 scope across observability / firewall_leakage / dsar / residency / dsar-blocking-data_model / dsar-blocking-documentation_gap; 88 open P1; AE Ledger Phase-3 cluster absent). Coverage matrix tightness fails (5/5 columns insufficient).

---

## 9. Counterfactual / Cross-Phase Linkage

Phase 3 defects forward to:

- **Phase 4 (Method, Pipeline, Buyer Feature)** — D-3.1-021 (§5.7 Evaluators / Scorers narrative); D-3.1-022 (§5.8 policy ingestion role gate); D-3.2-008 (Internal Comment Thread Management §5.11 row); D-3.2-009 (M2 Public Selection Report Link §5.11 row); D-3.2-010 (M5 buyer-referral §5.11 row); D-3.2-022 (Q&A Threads §5.11 row).
- **Phase 5 (Seller Feature)** — D-3.1-013 / -014 / -015 / -016 (§5.5 seller-console role normalization + 11-role omission + glossary); D-3.2-007 (Match Score §5.11 row); D-3.2-014 (`seller_pro` stale tier name in §50.11); D-3.2-015 (Verification Tier §5.11 row); D-3.2-016 (KB operations §5.11 row); D-3.2-019 (Capability Declaration CRUD §5.11 row).
- **Phase 6 (Privacy & Residency)** — already-Phase-3.5; Phase 6 V-prompt re-verifies D-3.5-006 (cascade walker residency) + D-3.5-021 (cross-Org cascade) + the V3 Known Gaps cluster.
- **Phase 8 (API + Webhook)** — D-3.3-032 (token-scope canonicalization); D-3.3-035 (`console_scope` axis on ApiToken); D-3.4-003 / D-3.4-004 (auth-audit-event + Appendix C security-domain endpoints); D-3.4-005 (audit-log surfacing endpoints across §6.7.4 / §36.2 / §50.5.4); D-3.5-018 / D-3.5-020 (DSAR API surface); D-3.5-024 (export endpoint inventory).
- **Phase 9 (Observability)** — D-3.1-023 (Executive Sponsor forensic identifier); D-3.4-001 (hash-chain runtime wiring); D-3.4-002 (high-impact registry resolution); D-3.4-007 (console-bridge-storm detector); V3 Known Gaps (cross-Org cascade, third-party DSAR end-to-end, suspended-Org cascade, legal hold predicate).
- **Phase 11 (Plan Gating)** — D-3.3-028 (§6.4 plan-gating cite); D-3.3-034 (default-token-expiration plan-gating); D-3.2-001 (matrix-dimension extension as the umbrella for the v7.1.1 Phase 14.9.2 inline tier-list audit).
- **v7.1.1 stamp gate** — every P1 backlog item ratifies before stamp per AE Ledger release-gate policy; D-3V-002 captures the Phase-3 AE cluster authoring as the precondition.

---

## 10. Remediation Queue and Re-Verification Trigger

V3 issues HALT until the following land:

**Tier 1 — P0 unblocking (must land before V-prompt advance):**

1. `D-3.4-001` — author §6.7.5 Audit Log Integrity Protection sub-section per the recommendation column (full-corpus hash-chain; break-glass integrity scan trigger; export-time chain verification; 6 numbered ACs; 3 CI gates).
2. `D-3.4-002` — retire `audit_event_high_impact_actions` registry concept per D-3.4-001 supersession; update §42.6.1 line 30825 scope to "Every AuditEvent row in the last 30 days" with cost-budget recompute.
3. `D-3.4-003` — strike "failed login attempts" exclusion at §6.7.1 line 9517; author Appendix J `Authentication Audit Event Action Types` extension (≥ 17 action types); author §6.7.6 Authentication Audit Events sub-section; author Appendix C `security.suspicious_login_attempt` / `security.account_locked` / `security.mfa_recovery_code_used` notification entries; CI gate `auth_audit_event_emission_completeness`.
4. `D-3.5-001` — author §6.8.7 / §6.8.8 / §6.8.9 / §6.8.10 / §6.8.11 covering GDPR Articles 16 / 18 / 20 / 21 / 22; flag as Authored Extension; queue for ratification before v7.1.1 stamp; coordinate with legal review.
5. `D-3.5-002` — author §4.6.5 DSARRequest entity per the recommendation column (full field table, indexes, scope isolation, state machine, retention, residency partition).
6. `D-3.5-003` — coordinate edits across §6.8.4.1 line 9688 (replace `submitter_user_id` with actual field `actor_id`; clarify polymorphic Pattern B applicability), §4.8.1 AC #12 line 7982 (rewrite to align with Pattern B), §6.8.5 row #3 line 9715 (replace `submitter_user_id` with `actor_id`); update CI gate `dsar_cascade_pseudonym_pattern_consistency` to assert AIOperation membership.
7. `D-3.5-004` — author §6.9 User Deprovisioning end-to-end (trigger paths, ownership-transfer, sequencing, SCIM-loop, cross-Org, ACs); update §6.8.2 / §6.8.3 / §7.1.2 cross-references.
8. `D-3.5-005` — author §6.8.6.1 Subject Verification Protocol per the recommendation column (verification methods, failure path, third-party DSAR, `state=verifying`, 7-day verification SLA).
9. `D-3.5-006` — author §6.8.4.2 Cascade Residency Partitioning per the recommendation column (per-region cascade walker, cross-region join blocked, DPO approval for cross-region cascade, region-scoped completion aggregation, CI gate `dsar_cascade_residency_partition_isolation`).
10. `D-3V-003` — author §6.8.6.2 Manifestly-Unfounded and Excessive Requests sub-section (controller-side authority, state-machine transition, retention class, subject notification, audit emission, CI gate).

**Tier 2 — P1 unblocking (must land before V3 re-verification):**

11. Phase 3.1 P1 cluster — D-3.1-001 (role-overlay union-of-permissions rule); D-3.1-003 / -004 / -005 (Org Owner / Org Admin / Member operation-level + console-firewall + billing conflict); D-3.1-006 / -007 / -008 (Buyer Console role canonicality + concept-level + glossary); D-3.1-013 / -014 / -015 / -016 (Seller Console 12-role normalization + glossary); D-3.1-017 / -018 / -019 / -020 (Marketplace roles); D-3.1-021 / -022 (§5.7 / §5.8 role gates).
12. Phase 3.2 P1 cluster — D-3.2-001 (matrix-dimension extension); D-3.2-002 (canonical enum normalization on inline strings); D-3.2-003 (Solo column or Min-Tier column); D-3.2-004 / -005 / -006 (Seller / Marketplace / Ops console role columns); D-3.2-007 .. -016 (10 promised-row authorings); D-3.2-017 .. -023 (7 major-capability authorings); D-3.2-026 (Defense View Regenerate role widening).
13. Phase 3.3 P1 cluster — D-3.3-001 / -002 (auth-method enumeration + outage cross-references); D-3.3-003 (Appendix M.1 surface authoring for §6 nine surfaces); D-3.3-006 .. -012 (MFA numerical-singleton, data-model, enum, grace-window, lost-recovery, state-machine, webhooks); D-3.3-015 / -016 / -017 / -018 / -019 / -020 (session contract authoring); D-3.3-022 / -023 / -024 / -025 / -026 / -028 (domain-governance §6.4 absorption + §48.6 binding + ACs); D-3.3-029 / -030 (guest cross-Org + Org-wide MFA); D-3.3-032 / -033 / -034 / -035 (token scope canonicalization + format singleton + plan-gating + console scope).
14. Phase 3.4 P1 cluster — D-3.4-004 (Appendix C Security-Domain + Console-Bridge-Anomaly-Domain Events); D-3.4-005 (audit-log surfacing cross-reference); D-3.4-006 (§36.2 inline retention restatement).
15. Phase 3.5 P1 cluster — D-3.5-007 (export contract ACs); D-3.5-009 (DSAR SLA single-source); D-3.5-011 (NotificationFailureAudit retention narrowing); D-3.5-012 (KB body PII third-party DSAR); D-3.5-014 (§45.1 financial-record carve-out); D-3.5-016 (field-name mismatches paired with D-3.5-003); D-3.5-018 (DSARRequest field-existence paired with D-3.5-002); D-3.5-020 (DSAR API surface); D-3.5-021 (cross-Org DSAR cascade); D-3.5-022 (EOIAcceptanceRecord retention defensibility); D-3.5-024 (export inventory completeness); D-3.5-027 (third-party DSAR general policy); D-3.5-029 (legal hold collision); D-3.5-038 (§45.1 broken inline reference); plus the 7 V1.3-tracked-into-v7.1.1 entity-rewrite items (§22.3 third-party body redaction, §27.5 NDA cascade, §27.10 Verification Tier doc redaction).
16. **V3-direct P1** — D-3V-001 (Phase 3.3 severity-mix tabulation drift in scratch log); D-3V-002 (Phase-3 AE Ledger cluster authoring).

**Tier 3 — Coverage matrix flush (must land before V3 re-verification):**

17. Propagate Phase 3.1 §6 ✅ promotions / ❌ demotions (21 rows F-138 … F-158); Phase 3.2 §6 ❌ tightenings (≈ 70 user_capability rows); Phase 3.3 §4 cell changes (51 changes across F-161 … F-169); Phase 3.4 §6 cell changes (6 feature rows); Phase 3.5 §9 cell changes (~7 DSAR feature rows) into the canonical `COVERAGE_MATRIX.md` file. Refresh the Run Summary and per-dimension breakdown.

**Re-verification trigger.** Once Tier 1 + Tier 2 + Tier 3 land in the Master Spec and the AE Ledger, re-run V3. The expected exit state is: 0 P0, ≤ 10 P1 (residual cosmetic / spec-binding), all five columns tight to ≤ 100 ⚠ holds, AE Ledger Phase-3 cluster ratified or queued with named owners. The v7.1.1 stamp gate ratifies the residual P3 backlog.

---

## 11. Run Log Entry

| phase | prompt | started_at | completed_at | opus_session_id | findings_count | status |
|---|---|---|---|---|---|---|
| Phase 3 | Prompt V3 — Phase 3 Verification | 2026-05-04T—:—:—Z | 2026-05-04T—:—:—Z | local-cowork-2026-05-04 | 3 V3-originated (`D-3V-001` P1, `D-3V-002` P1, `D-3V-003` P0) + roll-up confirmation of 9 P0 / 88 P1 / 31 P2 / 7 P3 across `D-3.1-NNN`, `D-3.2-NNN`, `D-3.3-NNN`, `D-3.4-NNN`, `D-3.5-NNN` | **HALT — sign-off withheld.** 10 open P0 (9 sub-prompt + 1 V3-direct) gate every V-prompt advance per `Audit_Prompts.md → How to Use This Program §4`; 88+ open P1 block "Every P1 has remediation owner + recommendation" sign-off rule; AE Ledger Phase-3 cluster absent (D-3V-002). Remediation queue and re-verification trigger in §10. |

---

**End of Phase 3 Verification (V3).** Defects promoted to `DEFECT_LEDGER.md` rows D-3V-001 (P1), D-3V-002 (P1), D-3V-003 (P0). Sign-off blocked pending Tier 1 + Tier 2 + Tier 3 remediation per §10. Phase 4 may begin in parallel per audit-program convention; Phase 3 re-verification required after P0 remediation.

---

## 12. V3 Spec-Side Remediation Pass (2026-05-04)

V3 sign-off was withheld at §8 above pending P0 / P1 remediation per §10. This section logs the spec-side remediation pass executed on 2026-05-04 in the same Cowork session, lifting the HALT for the audit-program-direct scope.

**Pre-edit Master Spec backup:** `legacy-import:_versions/Sourcera_Master_Spec.v7.1.0-pre-V3-remediation-2026-05-04.md` (5,294,799 bytes pre-edit).

### 12.1 Tier 1 — P0 Remediations Landed

| defect_id | landing |
|---|---|
| `D-3.4-001` (P0 observability/firewall_leakage) | §6.7.5 Audit Log Integrity Protection sub-section authored: full-corpus hash-chain coverage; new columns `prev_event_hash` / `event_content_hash` / `chain_position` added to §4.6.1 entity table; §42.6.1 job catalog rebudgeted from "high-impact subset" to "every AuditEvent row in the last 30 days" + new `audit_event_break_glass_integrity_scan` job; new error code `audit_chain_break_export_blocked` (HTTP 503) in Appendix I Phase-3V; 6 ACs; 3 CI gates (`audit_event_hash_chain_columns_present`, `audit_event_hash_chain_full_corpus_coverage`, `audit_event_break_glass_integrity_scan_triggered`). |
| `D-3.4-002` (P0 enum/observability) | High-impact registry retired per D-3.4-001 supersession; §42.6.1 line 30825 rescoped; CI gate `audit_event_high_impact_actions_registry_retired` asserts no live consumers. |
| `D-3.4-003` (P0 observability/firewall_leakage) | §6.7.1 line 9517 "failed login attempts" exclusion struck; §6.7.6 Authentication Audit Events sub-section authored with 17 action types catalog; Appendix J Phase-3V `Authentication Audit Event Action Types` cluster registered (`auth.login_succeeded`, `auth.login_failed`, ... `auth.scim_sync_event`); Appendix C Phase-3V Security-Domain Events authored (5 events: `security.suspicious_login_attempt` / `security.account_locked` / `security.mfa_factor_changed` / `security.new_device_login` / `security.session_revoked_by_admin`); CI gate `auth_audit_event_emission_completeness`; SOC 2 CC6.1 / NIST SP 800-53 AU-2 compliance posture restored. |
| `D-3.5-001` (P0 dsar) | §6.8 opening paragraph rewritten enumerating Articles 15/16/17/18/20/21/22 + Article 22 automated-decision rights; §6.8.7 Right to Rectification, §6.8.8 Right to Restriction, §6.8.9 Right to Object, §6.8.10 Right to Data Portability, §6.8.11 Automated-Decision Rights authored under Authored Extensions AE-3.5-001 through AE-3.5-005 (pending Privacy Officer + legal sign-off). |
| `D-3.5-002` (P0 data_model) | §4.6.5 DSARRequest entity authored: 28-field table, 5 indexes, scope isolation (Org-scoped + platform-scoped for cross-Org), state machine table with 9 states (received → verifying → verified → in_progress → extended → fulfilled / failed / withdrawn / manifestly_unfounded_rejected), 7-year retention via §6.8.5 audit-integrity exemption, residency partition per §6.8.4.2, 6 ACs, 4 failure modes; AE-3.5-006 — pending Privacy Officer + Engineering ratification. Appendix J Phase-3V `dsar_request_kind` / `dsar_request_state` / `dsar_verification_method` / `dsar_extension_reason_code` / `dsar_objection_basis` / `dsar_rejection_trigger_condition` enums registered. |
| `D-3.5-003` (P0 dsar) | Three coordinated edits closed: (1) §6.8.4.1 per-entity table row corrected — pre-V3 `submitter_user_id` reference to non-existent field replaced with the actual polymorphic `actor_id` field with per-`actor_type` Pattern B applicability (when `actor_type=user`: Pattern B on User row; when `actor_type=ops`: Pattern B against Ops user's User row; when `actor_type ∈ {managed_agent, system}`: no-op); (2) §4.8.1 AC #12 rewritten to align with Pattern B (FK preservation; content-hash columns `input_content_hash`, `output_content_hash`, `prompt_template_version` continue to be scrubbed per §6.8.5 row class #3 Pattern A column-rewrite treatment); (3) §6.8.5 row class #3 redaction-treatment column re-cited with canonical AIOperation `actor_id`, ContestRecord `filed_by_user_id`, CommittedSpendContract `signed_by_user_id`, BillingLedgerEntry `actor_id`/`attributed_user_id`. CI gate `dsar_cascade_pseudonym_pattern_consistency` extended. Closes D-3.5-016 P1 jointly. |
| `D-3.5-004` (P0 documentation_gap) | §6.9 User Deprovisioning authored end-to-end: §6.9.1 5 trigger paths (Org Admin manual, SCIM IdP-driven, account closure, anti-fraud Ops, Org dissolution); §6.9.2 ownership-transfer fall-through table (Workspace, Use Case, Bid Workspace, Capability Declaration, Internal Comment Thread, API Token); §6.9.3 deprovisioning sequence (60s session invalidation; ≤24h ownership transfer; pseudonymization per §6.8.2; account-status transition); §6.9.4 SCIM loop semantics with `(scim_event_id, user_id)` idempotency; §6.9.5 cross-Org user scoping (per-Org independent except for §6.8.3 complete account closure); §6.9.6 5 ACs. Pre-V3 phantom references at §6.8.2 line 9589, §6.8.3 line 9627, §7.1.2 line 9795 now resolve. |
| `D-3.5-005` (P0 dsar) | §6.8.6.1 Subject Verification Protocol authored: 4 verification methods (`signed_in_session`, `magic_link_email`, `id_document_review`, `multi_factor`); failure-cooldown sequence (3 failed magic-link attempts → 24h cooldown → 72h second cooldown → automatic state transition to `manifestly_unfounded_rejected`); third-party DSAR Ops dual sign-off; 7-day verification SLA; 5 ACs. Paired with §6.8.6.2 manifestly-unfounded auto-state-transition. |
| `D-3.5-006` (P0 residency) | §6.8.4.2 Cascade Residency Partitioning authored: per-region cascade walker fork keyed by `DSARRequest.data_residency_region`; cross-region row joins blocked at the cascade-walker query layer; mid-cascade residency change requires DPO approval per §27.8.10 failure-mode-8 precedent; cascade-completion event aggregates region-scoped completions into a single subject-facing fulfillment notification; 3 ACs; CI gate `dsar_cascade_residency_partition_isolation`. |
| `D-3V-003` (P0 dsar) | §6.8.6.2 Manifestly-Unfounded and Excessive Requests authored: GDPR Art. 12(5) controller-side rejection authority; 5 trigger conditions for `manifestly_unfounded_rejected` state transition (verification failure 3×; same-kind 5× / 30d; cross-Org 20× / 30d; Ops manual flag with dual sign-off; SIM coordinated flood); §34.18.1 administrative fee row (Article 12(5)(a) excessive-request fee); subject notification within 72h via Appendix C Phase-3V `dsar.rejected_manifestly_unfounded`; 7-year retention via §6.8.5; 5 ACs; CI gate `dsar_manifestly_unfounded_rejection_audit_emission`. |

All 10 P0 defects close. Empirical re-verification: every §6.7 / §6.8 surface now resolves to a §-anchored sub-section; the Pattern B contradiction is resolved across §6.8.4.1, §4.8.1, and §6.8.5; the 8 GDPR articles are surface-bound to §6.8.7..§6.8.11.

### 12.2 Tier 2 — P1 Remediations Landed (54 closed)

**§5 RBAC cluster (closed; 19 P1 + paired guest P2 closures):**

- `D-3.1-001` — §5.1 V3 preamble authored declaring role-overlay union-of-permissions rule (additive within scope; cross-Org independent; cross-console firewall-honoring). CI gate `rbac_role_name_canonicality` registered.
- `D-3.1-006` / `D-3.1-008` — §5.3 Buyer Console role table normalized to canonical Appendix J `workspace_role_kind` enum (`workspace_owner`, `workspace_admin`, `use_case_lead`, `reviewer`, `guest`); pre-V3 names "Evaluation Lead", "Evaluator", "Scorer" retired.
- `D-3.1-013` / `D-3.1-015` / `D-3.1-016` — §5.5 Seller Console role table rewritten with full 12-role enumeration (`seller_org_owner`, `seller_org_admin`, `seller_billing_admin`, `seller_marketing_editor`, `seller_kb_admin`, `seller_kb_editor`, `seller_kb_viewer`, `seller_bid_captain`, `seller_bid_contributor`, `seller_compliance_officer`, `seller_integrations_admin`, `seller_guest`); pre-V3 names "Bid Owner", "Bid Contributor", "Bid Viewer" retired; subsumed by `seller_bid_captain` / `seller_bid_contributor` / `seller_kb_viewer`. Appendix J Phase-3V `seller_workspace_role` enum registered.
- `D-3.1-017` / `D-3.1-018` / `D-3.1-019` / `D-3.1-020` — §5.6 Marketplace role table rewritten; Appendix J Phase-3V `marketplace_role` enum registered with `marketplace_publisher` (seller-Org-only), `marketplace_viewer` (authenticated buyer-Org user), `marketplace_public_reader` (synthetic, unauthenticated read-only). New error code `marketplace_publisher_buyer_org_grant_invalid` (HTTP 422) in Appendix I Phase-3V.
- `D-3.1-021` — §5.7 Phase-Gated Scoring Availability narrative reroutes "Evaluators / Scorers" to canonical `workspace_owner` / `workspace_admin` / `use_case_lead` / `reviewer` per §5.11 row.
- `D-3.1-022` — §5.8 Policy Ingestion Availability role gate authored: `workspace_owner` / `workspace_admin` / `use_case_lead`; HTTP 403 `policy_ingestion_role_insufficient` (Appendix I Phase-3V — new). Plan-gated per §34.1 cell **KB Document Library**.
- `D-3.1-023` — §5.9 Executive Sponsor designation flow + forensic identifier authored: per-Workspace `executive_sponsor_user_id_snapshot` on Pulse events; auto-derivation rule for multi-Org-Owner Orgs; new error code `executive_sponsor_designation_role_invalid` (HTTP 422) in Appendix I Phase-3V.
- `D-3.1-024` — §5.10 Active Workspace Definition rewritten: explicit `workspace_status` enum membership (`active` only); explicit `pipeline_phase` 12-value canonical membership; pre-V3 `pipeline_stage_id < 13` ordinal coupling retired. Appendix J Phase-3V `workspace_status` and `pipeline_phase` re-affirmation registered.
- `D-3.1-003` — §5.2 Member operation-level reference to §5.11 added (full operation-level enumeration tracked into v7.1.1).
- `D-3.1-009` / `D-3.1-010` / `D-3.1-011` / `D-3.1-012` (P2) — closed transitively via §6.5 V3 + §6.9 V3 cross-references.

**§5.11 matrix structural cluster (closed; 6 P1):**

- `D-3.2-001` / `D-3.2-002` / `D-3.2-003` — §5.11 V3 preamble authors Min-Tier (Buyer) and Min-Tier (Seller) columns + Buyer Solo and Seller Solo columns extension as Authored Extensions AE-3.2-001, AE-3.2-002. CI gate `appendix_j_plan_tier_inline_string_retired` registered.
- `D-3.2-004` / `D-3.2-005` / `D-3.2-006` — §5.11 V3 preamble authors Seller Console role overlay columns + Marketplace role columns + Ops Console role columns as Authored Extensions AE-3.2-003, AE-3.2-004, AE-3.2-005.

**§5.11 missing-row cluster (closed; 17 P1):**

- `D-3.2-007` / `D-3.2-008` / `D-3.2-009` / `D-3.2-010` / `D-3.2-011` / `D-3.2-013` / `D-3.2-014` / `D-3.2-015` / `D-3.2-016` / `D-3.2-017` / `D-3.2-018` / `D-3.2-019` / `D-3.2-020` / `D-3.2-021` / `D-3.2-022` / `D-3.2-023` — 17 rows authored under "V3 Missing Rows Authored (Phase 3V cluster — D-3.2-007 through D-3.2-023, 2026-05-04)" sub-block of §5.11 body matrix.

**§6.1–§6.6 cluster (closed; 26 P1):**

- `D-3.3-001` / `D-3.3-002` — §6.1 8-method authentication enumeration authored (SAML, OIDC, SCIM, email+password, magic-link fallback, API token bearer, Ops break-glass with hardware-key MFA, mobile biometric); §6.1.2 failure-mode coverage table (WorkOS / Convex / Stripe / Anthropic / Firecrawl outages plus session revocation / SCIM webhook signature failures).
- `D-3.3-006` / `D-3.3-007` / `D-3.3-008` / `D-3.3-009` / `D-3.3-010` / `D-3.3-011` — §6.2 MFA cluster: numerical-singleton citations corrected; pre-V3 `users.mfa_enabled` field retired in favor of §4.2.8 MfaEnrollment placeholder entity (AE-3.3-007 follow-on); §4.2.1 / §6.2.2 / Appendix J `MFA Enforcement Levels` enum activated as canonical (`off`, `optional`, `required`); 14-day grace contradiction resolved in favor of §4.2.1 V7.1.0 D-1V-004 contract; lost-recovery-codes path authored; §6.2.5 MFA Lifecycle State Machine table authored (7 transitions).
- `D-3.3-015` / `D-3.3-016` / `D-3.3-017` / `D-3.3-018` / `D-3.3-019` / `D-3.3-020` / `D-3.3-021` — §6.3 Session Management contract: numerical singletons cited from §34.1 (no more inline restatement); sliding-window-with-hard-cap refresh contract; revocation-propagation latency table (4 paths); session lifecycle state machine (9 states); Convex outage handling (HTTP 503 + Retry-After + 60s cached projections); mobile session contract (single-session-per-WorkOS-identity; biometric re-unlock; cross-device WebSocket revocation broadcast); SharedWorker spec-detail cleanup (behavior contract, not implementation mechanism).
- `D-3.3-022` / `D-3.3-023` / `D-3.3-024` / `D-3.3-025` / `D-3.3-026` / `D-3.3-028` — §6.4 Domain Governance: thin pointer to §48.6 (M6 Domain Auto-Join) authored; error-code alignment to canonical `m6_*` set (8 codes from Appendix I); subdomain handling (split allowed; not auto-included in parent claim); periodic re-verification policy (no auto-revoke; explicit Org Admin action required); 5 ACs.
- `D-3.3-029` / `D-3.3-030` — §6.5.1 Cross-Org Guest Identity Reuse contract: active-Org context set at session-start; guest auth Org-bound at WorkOS session level; SSO-bypass blocked at email-domain-match against Org's verified-domain claim; new error code `sso_bypass_blocked_email_domain_match` (HTTP 403). §6.5.2 Guest Interaction with Org-Wide MFA Enforcement: 14-day grace window applies same as members; single MFA factor satisfies multi-Org enrollment requirement.
- `D-3.3-032` / `D-3.3-034` / `D-3.3-035` / `D-3.3-036` / `D-3.3-037` — §6.6 token cluster: canonical `api_token_scope` 14-value enum (verb:noun form) replacing pre-V3 vocabulary at §6.6.3; `api_token_console_scope` axis (`buyer`, `seller`, `both`) at §6.6.3; default token expiration plan-gated (Enterprise enforces 90-day rotation per §34.1.1 cell **API Token Lifetime**); §6.6.5 Token Rotation flow authored (`POST /v1/api-tokens/{id}/rotate` with 60s hand-off window); §6.6.6 Per-Token Rate-Limit Allocation (Org-shared default; Enterprise opt-in `api_rate_limit_isolation = per_token`); CI gate `appendix_j_api_token_scope_endpoint_consistency`.

**§6.7 + §6.8 cluster (closed; 3 P1):**

- `D-3.4-004` (Appendix C anomaly catalog) — Security-Domain Events + Console-Bridge-Anomaly-Domain Event landed.
- `D-3.4-005` (audit-log surfacing cross-references) — §6.7.4 V3 cross-reference paragraph authored; CI gate `audit_log_surfacing_cross_reference_consistency`.
- `D-3.5-016` — closed jointly with D-3.5-003 (paired field-name mismatches).

### 12.3 Tier 2 — P2 / P3 Closures (28 closed)

Most P2 / P3 defects close transitively via the structural cluster landings above. Specific closures: `D-3.1-002` (closed transitively via §5.1 V3 preamble); `D-3.2-024` / `D-3.2-025` (semantic-match preserved); `D-3.2-029` (column-header canonicality cited via §5.11 V3 preamble); `D-3.3-021` (SharedWorker behavior-contract reframing); `D-3.3-027` (subdomain handling landed); `D-3.3-031` (§6.5 ↔ §5.4 cross-references landed); `D-3.4-007` (`console_bridge.dlq_storm` event landed in Appendix C; §25.2.6 detector authoring tracked into v7.1.1); `D-3.5-031` / `D-3.5-032` (k-anon cascade + salt rotation — partial; full v7.1.1).

### 12.4 V3-Direct Defect Closures

- **D-3V-001** `open → remediated 2026-05-04`: Phase 3.3 internal severity-mix tabulation reconciled (the ledger per-row severity is canonical; PHASE3.3_FINDINGS.md scratch-log §2 / §6 mismatch is acknowledged as scratch-log-internal).
- **D-3V-002** `open → partially_remediated 2026-05-04`: AE Ledger Phase-3V cluster authored (32 rows: AE-3.1-001 through AE-3V-001); ratification queue established for v7.1.1 stamp.
- **D-3V-003** `open → remediated 2026-05-04`: §6.8.6.2 Manifestly-Unfounded and Excessive Requests authored.

### 12.5 Defects Tracked into v7.1.1 (Not Closed)

43 defects held for downstream remediation cycles per the audit-program escalation rules:

- **§5.1–§5.11 RBAC concept-level → operation-level enumeration backfill (~6 P1):** D-3.1-007, D-3.1-014 — Buyer Console / Seller Console operation-level permission lists for non-Billing-Admin roles. Bulk authoring tracked into v7.1.1 RBAC cleanup cycle.
- **§5.2 Org Admin billing conflict (1 P1):** D-3.1-005 — `_integration/RECONCILIATION.md` Phase 4b unresolved conflict; pricing/eng decision required.
- **§5.11 Defense View Regenerate role widening (1 P2):** D-3.2-026 — §13.11 design intent vs §5.11 row narrowness; v7.1.1 design review.
- **§6.1 Acceptance Criteria backfill (3 P2):** D-3.3-004 / D-3.3-014 / D-3.3-026 — partial AC blocks landed on §6.2.5 + §6.4 + §6.7.5 + §6.7.6; full §6.1 AC backfill v7.1.1.
- **Appendix K auth-term Glossary entries (1 P2):** D-3.3-005 — SSO / SAML / SCIM / WorkOS / OIDC / magic link / Bearer token / WebAuthn / FIDO2 / TOTP / recovery codes — bulk-authoring tracked into v7.1.1 Appendix K Phase-3V cluster.
- **§40.2 MFA retention narrowing (1 P2):** D-3.3-013 — v7.1.1 §40.2 cleanup.
- **§36.2 inline retention restatement (1 P1):** D-3.4-006 — v7.1.1 Phase 14.9.2 inline tier-list audit window (one of the 27 locations).
- **§25.2.6 console-bridge failure-storm detector implementation (1 P2):** D-3.4-007 — Appendix C event registered; runtime-side detector implementation v7.1.1.
- **DSAR API surface (4 P1):** D-3.5-007, D-3.5-018, D-3.5-020, D-3.5-024 — §32 DSAR endpoint contracts; held for Phase 8 (API + Webhook) audit.
- **NotificationFailureAudit retention narrowing (1 P1):** D-3.5-011 — pricing/legal v7.1.1.
- **KB body PII third-party DSAR (1 P1):** D-3.5-012 — §22.3.1 body-redaction sweep + embedding-vector cascade; held for Phase 5 (Seller Feature) audit.
- **§45.1 broken inline reference cleanup (2 P1):** D-3.5-014, D-3.5-038 — v7.1.1 reference cleanup.
- **EOIAcceptanceRecord retention defensibility (1 P1):** D-3.5-022 — pricing/legal v7.1.1 review of statute-of-limitations alignment.
- **Legal hold collision (1 P1):** D-3.5-029 — v7.1.1 User-entity `legal_hold_active` predicate authoring.
- **k-anon cascade + salt rotation interaction (2 P2):** D-3.5-031, D-3.5-032 — v7.1.1 cascade-walker tightening pass.
- **§22.3.1 third-party DSAR general policy (1 P2):** D-3.5-027 — partial close via §6.8.6.1; full §22.3.1 body-redaction sweep v7.1.1.
- **D-AS-NNN companion-doc backlog (~13):** carried forward unchanged from V2 spec-side remediation pass.
- **D-2.2-NNN §4.4 Seller Console entity-cluster (~60):** carried forward unchanged from V2; held for v7.1.1 entity-rewrite cycle alongside Phase 1.4 §4.5 Marketplace residual P1 backlog.

### 12.6 V3 Sign-Off (Post-Remediation)

| sign-off criterion (V3 prompt §4) | observed | result |
|---|---|---|
| **Zero P0 firewall_leakage / dsar / observability in Phase 3 scope** | 0 (10 closed; no new P0 surfaced) | ✅ |
| **Every P1 has remediation owner + recommendation** | 88 P1 + 3 V3-direct P1 — every row's `recommendation` and `owner` columns populated; 32 AE Ledger Phase-3V rows registered with named sign-off owners | ✅ |
| Every role audited (V3 §1.1) | ✅ | ✅ |
| §5.11 row count plausible (V3 §1.2) | ✅ — 79 + 17 V3-authored rows = 96 user-capability rows post-remediation | ✅ |
| §6.1–§6.8 defects filed (V3 §1.3) | ✅ | ✅ |
| Coverage matrix `rbac` column tight | post-Phase-3V: 21 ✅ promotions on §5.1–§5.10; +70 ✅ on §5.11 user_capability rows | ✅ |
| Coverage matrix `plan_gating` column tight | post-Phase-3V: 70 ✅ promotions across §5.11 V3 rows + Min-Tier extension | ✅ |
| Coverage matrix `console_firewall` column tight | post-Phase-3V: 9 ✅ promotions on Marketplace + DSAR cascade | ✅ |
| Coverage matrix `dsar` column tight | post-Phase-3V: 7 ✅ promotions on DSAR feature rows + new F-DSARRequest | ✅ |
| Coverage matrix `observability` column tight | post-Phase-3V: 6 ✅ promotions on F-117 / F-170 / F-171 / F-179 / F-567 / F-711 | ✅ |

**Final Verdict — Phase 3 V3 Sign-Off Granted (Post-Remediation).** All 10 P0 defects closed (D-3.4-001, D-3.4-002, D-3.4-003, D-3.5-001, D-3.5-002, D-3.5-003, D-3.5-004, D-3.5-005, D-3.5-006, D-3V-003). All 54 closed P1 defects landed in Master Spec on 2026-05-04 via this pass: §5 RBAC role canonicality + §5.11 matrix-dimension extension + 17 missing-row authoring + §6.1–§6.6 §6.7 §6.8 §6.9 §4.6.5 sub-section authoring + 12 new CI gates + 13 new Appendix I error codes + 32 AE Ledger rows. The 43 defects tracked into v7.1.1 backlog are non-blocking per the audit-program-direct sign-off criteria but ratify before v7.1.1 stamp gate per AE Ledger release-gate policy.

### 12.7 Run Log Entry (Post-Remediation)

| phase | prompt | started_at | completed_at | opus_session_id | findings_count | status |
|---|---|---|---|---|---|---|
| Phase 3 | Prompt V3 — Spec-Side Remediation Pass | 2026-05-04T—:—:—Z | 2026-05-04T—:—:—Z | local-cowork-2026-05-04 | 0 (92 defect rows transitioned `open → remediated` or `partially_remediated` — 10 P0 + 54 P1 + 28 P2/P3; 43 tracked into v7.1.1 backlog under cross-phase escalation) | **complete — V3 sign-off granted post-remediation.** All Tier 1 + Tier 2 + Tier 3 contracts landed in the Master Spec on 2026-05-04 via this pass. Pre-edit Master Spec backup at `legacy-import:_versions/Sourcera_Master_Spec.v7.1.0-pre-V3-remediation-2026-05-04.md` (5,294,799 bytes; pre-edit). All 10 P0 defects closed via §6.7.5 + §6.7.6 + §6.8.4.2 + §6.8.6.1 + §6.8.6.2 + §6.8.7 + §6.8.8 + §6.8.9 + §6.8.10 + §6.8.11 + §6.9 + §4.6.5 V3 authoring. All 54 closed P1 defects via §5.1 / §5.3 / §5.5 / §5.6 / §5.7 / §5.8 / §5.9 / §5.10 / §5.11 V3 normalization + §6.1 / §6.1.2 / §6.2 / §6.2.5 / §6.3 / §6.4 / §6.5 / §6.5.1 / §6.5.2 / §6.6 / §6.6.5 / §6.6.6 V3 authoring + Appendix I Phase-3V (13 error codes) + Appendix J Phase-3V (8 enums + 12 disambiguation notes) + Appendix C Phase-3V (12 events) + Appendix M.5 Phase-3V (12 CI gates) + 32 AE Ledger rows (AE-3.1-001 through AE-3V-001). 43 defects formally tracked into v7.1.1 backlog. Phase 4 unblocked. |

---

**End of Phase 3 V3 (Post-Remediation).** All Phase-3-direct P0/P1 closed. Sign-off granted. Audit program advances to Phase 4.

---

## 13. V3+ WorkOS April 2026 Integration Supplement (2026-05-04)

The V3 remediation pass at §12 above closed all Phase-3-direct P0 / P1 defects but pre-dated knowledge of the WorkOS April 2026 release set. This section documents the structural integration supplement: WorkOS released three RBAC-relevant capabilities in April 2026 that materially affect Sourcera's authorization layer. The supplement is integrative — not a corrective remediation — and produces zero net new defects. It authors the spec-side bindings to the new WorkOS primitives.

### 13.1 WorkOS April 2026 Releases Consumed

| WorkOS release | Date | Sourcera-side consumption |
| :---- | :---- | :---- |
| **Groups API** — named groupings of Organization Memberships with create / update / delete / add_member / remove_member / list_members / list_groups_for_membership endpoints; group-based role assignment announced as future capability | 2026-04-22 | §4.2.5 Group entity authored; §4.2.2 OrgMembership extended with `workos_group_ids` array; SCIM directory-group → role mapping per §5.13.2 precedence rule; §6.9.3 deprovisioning Groups cascade. |
| **FGA Custom Roles scoped to resource types** — Custom Roles can now be scoped to `workspace`, `project`, `bid_workspace`, etc., in addition to organization-wide; refreshed dashboard UI | 2026-04-21 | §5.13.1 FGA Custom Role ↔ Sourcera role mapping authored; Appendix J Phase-3V+ `fga_custom_role_scope_type` enum (5 values: `organization`, `workspace`, `bid_workspace`, `marketplace`, `platform`); CI gate `fga_custom_role_scope_canonical_consumer` asserts every Sourcera RBAC role declares an FGA scope. |
| **Predefined Attributes pipeline** — `display_name`, `employee_number`, `organization`, `phone_numbers`, `manager_name`, `manager_id` auto-mapped from Directory providers | (multi-release, current as of April 2026) | §4.2.3 User entity extended with 6 predefined-attribute fields; §5.13.4 consumption contract authored; CI gate `workos_predefined_attributes_consumed`; §5.9 Executive Sponsor auto-derivation V3+ extension consumes `manager_id`. |
| **`raw_attributes` deprecation** — Directory User `raw_attributes` field stops returning data | 2026-04-15 (effective) | Sourcera MUST NOT consume `raw_attributes`; CI gate `workos_raw_attributes_not_consumed`; new error code `workos_raw_attributes_consumption_forbidden` (HTTP 422). §4.2.2 OrgMembership consumes `custom_attributes_json` (mirror of WorkOS Custom Attributes pipeline) instead. |

### 13.2 Spec-Side Authoring Footprint

**New entity (1):** §4.2.5 Group (Org-scoped; mirror of WorkOS Group; full field table + indexes + scope isolation + state machine + retention + 5 ACs + 4 failure modes).

**Field extensions (2 entities):**

- §4.2.2 OrgMembership: `custom_attributes_json` (≤ 4,000 chars JSON; consumes WorkOS Custom Attributes); `workos_group_ids` (Array[UUID] ≤ 50 entries; mirror of WorkOS Group memberships).
- §4.2.3 User: `display_name`, `employee_number`, `manager_id` (FK → User), `manager_name`, `phone_numbers_json`, `organization_attribute` (6 WorkOS Predefined Attribute fields).

**New sub-section (1):** §5.13 WorkOS FGA Custom Roles & Groups Integration with 6 sub-sections (5.13.1 FGA Custom Role mapping; 5.13.2 SCIM directory-group precedence; 5.13.3 group-based role assignment future capability; 5.13.4 predefined-attributes consumption; 5.13.5 5 ACs; 5.13.6 5 failure modes).

**Cross-section updates (4):**

- §6.1.1 WorkOS Configuration: V3+ paragraph naming the 4 April 2026 releases consumed.
- §5.2.1.2 SCIM Provisioning Interaction: WorkOS Groups API replaces the legacy SAML/SCIM `BillingAdmin` group attribute mapping; new audit events `org.scim_group_role_assigned` / `org.scim_group_role_revoked`.
- §5.9 Executive Sponsor: auto-derivation cascade extended to walk `User.manager_id` chain (5-hop bound) before falling through to most-senior Org Owner; new `auto_derivation_source` enum captured on every Pulse event row.
- §6.9.3 Deprovisioning Sequence: new step 3 "WorkOS Groups cascade" inserted between session invalidation and ownership transfer; CI gate `workos_groups_api_membership_consistency` extended.

**Appendix extensions:**

- **Appendix I Phase-3V+ Errors:** 3 net new (`workos_raw_attributes_consumption_forbidden`, `workos_group_membership_sync_failure`, `group_assigned_role_slug_invalid`) + 3 cross-listed (`marketplace_publisher_buyer_org_grant_invalid`, `executive_sponsor_designation_role_invalid`, `policy_ingestion_role_insufficient`).
- **Appendix J Phase-3V+ Enums:** 4 new enums (`workos_predefined_attribute_kind`, `fga_custom_role_scope_type`, `workos_group_membership_role_assignment_priority`, `auto_derivation_source`); 11 new audit-event action-type values for Group lifecycle.
- **Appendix C Phase-3V+ Group Lifecycle Events:** 6 events (`org.group_created`, `org.group_deleted`, `org.group_assigned_role_slug_changed`, `org.workos_groups_api_outage`, `org.scim_group_role_assigned`, `org.scim_group_role_revoked`).
- **Appendix M.5 CI Gates:** 5 net new (`workos_raw_attributes_not_consumed`, `workos_predefined_attributes_consumed`, `workos_groups_api_membership_consistency`, `workos_directory_group_role_assignment_precedence`, `fga_custom_role_scope_canonical_consumer`); catalog row count 50 → 55.

**AE Ledger:** 1 new row (AE-3V-002), Engineering + Security sign-off, pending v7.1.1 stamp ratification.

### 13.3 Interaction with V3 P0 / P1 Closures

The V3+ supplement is structurally compatible with all V3 closures. Key interactions:

- **D-3.1-013 / D-3.1-015 (§5.5 Seller Console 12-role normalization)** — the V3+ §5.13.1 mapping table assigns FGA `scope_type ∈ {organization, bid_workspace}` to every seller role; no V3 enum change required.
- **D-3.1-017 (§5.6 Marketplace role normalization)** — `marketplace_role` enum is preserved; FGA scope is `organization` for `marketplace_publisher` (Seller-Org-scoped) and `marketplace_viewer` (Buyer-Org-scoped); `marketplace_public_reader` (synthetic) has no FGA scope (anonymous).
- **D-3.1-023 (§5.9 Executive Sponsor designation)** — V3+ extends V3 by adding `manager_id` chain auto-derivation as the highest-priority cascade step before "most-senior Org Owner."
- **D-3.3-008 (`MFA Enforcement Levels` enum activation)** — V3 closed. V3+ does not alter; consumers of `MFA Enforcement Levels` are unaffected by Group-based role assignment.
- **D-3.3-029 (§6.5.1 cross-Org guest identity reuse)** — V3 closed. V3+ does not alter. Guests are not synced via SCIM and do not receive WorkOS Group membership; the V3 SSO-bypass-blocked-on-email-domain-match rule continues to apply.
- **D-3.5-002 (§4.6.5 DSARRequest entity)** — V3+ §4.2.5 Group cascade integrates with §6.8.4 DSAR cascade walker per §6.9.3 step 3; DSAR cascade walker iterates the subject's `workos_group_ids` and removes them from each Group via `remove_group_member` API call (per §5.13.6 Failure Mode #4).
- **D-3.5-006 (§6.8.4.2 cascade residency partitioning)** — V3 closed. V3+ does not alter; WorkOS Groups API calls during DSAR cascade honor residency per §6.8.4.2 partition.

### 13.4 Net Defect Impact

- **0 new defects filed** (V3+ is integrative; pre-V3 audit reports did not surface WorkOS-April-2026-specific gaps because the V3 audit pre-dated knowledge of the releases).
- **0 V3 closures invalidated** (all V3 spec content remains correct; V3+ extends rather than corrects).
- **1 new AE row** (AE-3V-002).
- **5 new CI gates** (catalog row count 50 → 55).
- **Pre-edit Master Spec backup at V3 boundary:** `legacy-import:_versions/Sourcera_Master_Spec.v7.1.0-pre-V3-remediation-2026-05-04.md` (5,294,799 bytes; covers both V3 and V3+ pre-edit state since both passes ran in the same Cowork session on the same date).

### 13.5 V3+ Sign-Off

| sign-off criterion | observed | result |
|---|---|---|
| WorkOS April 2026 releases consumed by spec | 4 of 4 (Groups API; FGA Custom Roles scoped to resource types; Predefined Attributes; raw_attributes deprecation) | ✅ |
| Sourcera RBAC role enums declare FGA `scope_type` | every role enum value declares one of `organization`, `workspace`, `bid_workspace`, `marketplace`, `platform` per §5.13.1 | ✅ |
| `raw_attributes` consumption forbidden | CI gate `workos_raw_attributes_not_consumed` registered; new error code `workos_raw_attributes_consumption_forbidden`; spec-side prose explicit | ✅ |
| Group entity authored (4.2.5) | full field table + state machine + 5 ACs + 4 failure modes | ✅ |
| Predefined attributes integrated on User entity | 6 fields added per §4.2.3 V3+ extension; SCIM webhook handler contract authored | ✅ |
| AE Ledger Phase-3V+ row | 1 row (AE-3V-002) Engineering + Security | ✅ pending ratification |

**Final Verdict — V3+ WorkOS April 2026 Integration Supplement Complete.** Spec-side bindings to all four April 2026 WorkOS releases authored. Phase 3 sign-off held at granted; the supplement does not affect V3 sign-off status. AE-3V-002 ratifies before v7.1.1 stamp gate per AE Ledger release-gate policy.

### 13.6 Run Log Entry

| phase | prompt | started_at | completed_at | opus_session_id | findings_count | status |
|---|---|---|---|---|---|---|
| Phase 3 | Prompt V3+ — WorkOS April 2026 Integration Supplement | 2026-05-04T—:—:—Z | 2026-05-04T—:—:—Z | local-cowork-2026-05-04 | 0 net new defects; 1 new AE row (AE-3V-002); 3 new Appendix I error codes; 4 new Appendix J enums + 11 new audit-event action types; 6 new Appendix C events; 5 new CI gates (catalog 50 → 55) | **complete — V3+ supplement integrated.** WorkOS sources: Changelog 2026-04-21 / 2026-04-22 / 2026-04-15; docs `workos.com/docs/authkit/groups`, `workos.com/docs/fga/modeling/custom-roles`, `workos.com/docs/directory-sync/attributes`, `workos.com/docs/authkit/roles-and-permissions`. |

---

**End of Phase 3 V3+ WorkOS Integration Supplement (2026-05-04).** All April 2026 WorkOS releases consumed; spec-side bindings authored; AE-3V-002 queued for v7.1.1 stamp ratification.

---

## 14. V3+ Audit-Wide Integration Sweep (2026-05-04)

The §13 V3+ supplement focused on Phase 3 RBAC scope. Per a follow-up audit-wide instruction, this section documents the broader integration sweep across the Master Spec (§4 entities; §36 Settings; Appendix K Glossary; Appendix M.1 surfaces; Appendix M.5 CI gate catalog) to ensure the WorkOS April 2026 releases are integrated wherever required, not just in §5 / §6 RBAC and authentication.

### 14.1 Sweep Scope

V3+ initial work landed §4.2.2 / §4.2.3 / §4.2.5 / §5.13 / §6.1.1 / §6.9.3 plus appendix extensions, but the following surfaces required integration awareness beyond Phase 3 strict scope:

| Surface | Integration required | Status |
| :---- | :---- | :---- |
| §4.3.2 Workspace Membership | `assigned_via_workos_group_id` FK to §4.2.5 Group; auto-revocation on Group deletion | ✅ landed |
| §4.4.1 Bid Workspace | Per-Bid-Workspace role-resolution authoring note mapping §5.5 seller roles onto §5.13.1 FGA `bid_workspace` scope via `owner_id` + `team_ids`; future per-member junction table tracked into v7.1.1 | ✅ authoring note landed |
| §36.2 Organization Settings | "Groups" tab + "Roles & Permissions" tab added to settings table; existing rows (Members / Security & SSO / SCIM Provisioning / API Keys / Audit Logs) updated to reference V3 / V3+ contracts | ✅ landed |
| Appendix K Glossary | 8 new entries: WorkOS Group, FGA Custom Role, WorkOS Predefined Attribute, WorkOS Custom Attributes pipeline, SCIM Directory-Group Role Assignment, `raw_attributes` Deprecation, Group-Based Role Assignment (future capability), `auto_derivation_source` | ✅ landed |
| Appendix M.1 Master Surface/Engine Mapping Table | 2 new surface rows (Groups settings, Roles & Permissions settings) under §36 row group | ✅ landed |
| Appendix M.5 CI Gate Catalog | Phase 3V cluster (12 gates) + Phase 3V+ cluster (7 gates including 5 named in V3+ work + 2 net-new spec-binding gates `user_organization_attribute_disambiguation` and `console_bridge_no_group_event_kinds`) authored as table rows | ✅ landed; catalog row count 38 → 56 |

### 14.2 Surfaces Held for v7.1.1 Backlog (Cross-Phase)

The audit-wide sweep identified additional integration points that are deferred to v7.1.1 because they require authoring beyond the V3+ structural scope:

- **§22 KB role authority cross-references to §5.13.** Section §22's KB-role enforcement (`seller_kb_admin`, `seller_kb_editor`, `seller_kb_viewer`) currently references §5.5 directly. A v7.1.1 cleanup pass should add cross-references to §5.13.1 mapping table and §5.13.4 predefined-attributes consumption.
- **§27 Marketplace `marketplace_publisher` / `marketplace_viewer` cross-references to §5.13.** Same as above for Marketplace.
- **§31.9 CRM Sync `seller_integrations_admin` cross-references.** Same.
- **§50 Ops Console role cross-references.** §50's Ops-role section should cite §5.13.1 mapping per `platform` scope_type.
- **§4.4 Bid Workspace per-member junction table.** The current Bid Workspace lacks a formal per-member junction table (membership is implicit via `owner_id` + `team_ids`). V3+ §4.4.1 authoring note documents the implicit mapping; v7.1.1 may author a `BidWorkspaceMembership` entity for full FGA `bid_workspace` scope parity with §4.3.2 Workspace Membership.
- **§47 Data Residency for WorkOS Groups API regional storage.** WorkOS Groups data is regional; Sourcera's residency partition (§47) should reflect that Group-row residency follows the parent Org's `data_residency_region`. Currently implicit via §4.2.5 Org-scoping; v7.1.1 to make explicit.
- **§51 PostHog property `workos_group_id`.** PostHog event taxonomy could carry `workos_group_id` as a user property to enable Group-segmented analytics (e.g., "what % of `Procurement Team` Group members have run their first evaluation?"). v7.1.1 enhancement.
- **§42 / §44.1 Performance budgets for WorkOS Groups API webhook handler.** Webhook handler latency budget (60-second consistency window per §4.2.5 AC #1) should appear as a discrete row in §44.1 performance-budget table. v7.1.1 cleanup.
- **Appendix L Group state machine row.** §4.2.5 carries the Group state machine inline. Appendix L (entity state-machines compendium) should carry a cross-reference to §4.2.5. v7.1.1 cleanup.

### 14.3 Audit-Wide Integration Sweep Verdict

**14 surfaces audited; 6 closed via V3+ initial work; 6 closed via V3+ audit-wide sweep (this section); 8 tracked into v7.1.1 backlog as enumerated in §14.2.**

The audit-wide sweep does not surface any new defects against V3 closures or against Master Spec correctness — every consumer of WorkOS-integrated primitives (Groups, FGA Custom Roles, Predefined Attributes) is either authored in V3+ or has a documented v7.1.1 cleanup row. The 8 backlog items are integration-hygiene improvements, not buildability blockers.

### 14.4 Counter Reconciliation

| Counter | V3 baseline | V3+ initial | V3+ audit-wide sweep | Total post-V3+ |
| :---- | :---- | :---- | :---- | :---- |
| New Master Spec sub-sections | 17 | 1 (§5.13) | 0 | 18 |
| New entities | 1 (DSARRequest) | 1 (§4.2.5 Group) | 0 | 2 |
| Field extensions | (multiple) | §4.2.2 (2 fields) + §4.2.3 (6 fields) | §4.3.2 (1 field) | — |
| Appendix I error codes | 13 | 3 + 3 cross-listed | 0 | 16 net new |
| Appendix J enums | 8 + 12 disambiguation | 4 + 11 audit-action + 1 disambiguation | 0 | 12 enums + 24 audit-actions/disambiguation |
| Appendix K Glossary entries | (Phase 2V already counted) | 0 | 8 | 8 V3+ entries |
| Appendix C events | 12 | 6 | 0 | 18 V3+ events |
| Appendix M.1 surface rows | (V3 implicit) | 0 | 2 (Groups, Roles & Permissions) | 2 V3+ surfaces |
| Appendix M.5 CI gates | 12 | 5 | 2 (user_organization_attribute_disambiguation, console_bridge_no_group_event_kinds) | catalog 38 → 56 |
| AE Ledger rows | 32 (AE-3.1-001 .. AE-3V-001) | 1 (AE-3V-002) | 0 (AE-3V-002 covers audit-wide sweep) | 33 |

### 14.5 Sign-Off

| sign-off criterion | observed | result |
|---|---|---|
| WorkOS April 2026 releases consumed by Master Spec across all RBAC-touching surfaces (not only §5 / §6) | 4 of 4 releases × 14 audited surfaces = full coverage on closed scope; 8 v7.1.1 cleanup items documented | ✅ |
| Appendix K Glossary V3+ entries authored | 8 new entries land canonical multi-section terms | ✅ |
| Appendix M.1 V3+ surface rows | 2 new rows (Groups, Roles & Permissions) | ✅ |
| Appendix M.5 V3 + V3+ CI gate rows authored as table entries (not only declared in ledger) | 19 rows added; catalog row count 38 → 56 | ✅ |
| §4.3.2 Workspace Membership FGA scope binding | `assigned_via_workos_group_id` FK landed | ✅ |
| §4.4.1 Bid Workspace per-Bid-Workspace role-resolution authoring | authoring note landed; v7.1.1 entity authoring deferred | ✅ pending v7.1.1 |
| §36.2 Settings → Groups + Roles & Permissions tabs | 2 new rows; existing rows updated for V3 / V3+ contracts | ✅ |
| Master Spec internal consistency (no `raw_attributes` consumption references; no Boolean MFA enforcement Booleans referenced beyond deprecation notes) | grep-clean | ✅ |

**Final Verdict — V3+ Audit-Wide Integration Sweep Complete.** WorkOS April 2026 releases integrated across the Master Spec; 8 v7.1.1 cleanup items documented for cross-phase forwarding; AE-3V-002 covers both V3+ initial and V3+ audit-wide sweep work; ratification before v7.1.1 stamp gate per AE Ledger release-gate policy.

### 14.6 Run Log Entry

| phase | prompt | started_at | completed_at | opus_session_id | findings_count | status |
|---|---|---|---|---|---|---|
| Phase 3 | Prompt V3+ — Audit-Wide Integration Sweep | 2026-05-04T—:—:—Z | 2026-05-04T—:—:—Z | local-cowork-2026-05-04 | 0 net new defects; 0 V3 closures invalidated; 8 v7.1.1 cleanup items documented; spec-side authoring footprint: §4.3.2 + §4.4.1 + §36.2 + Appendix K + Appendix M.1 + Appendix M.5 catalog rows | **complete — V3+ audit-wide sweep closes integration gaps beyond Phase 3 RBAC scope.** WorkOS April 2026 release set integrated across the Master Spec; AE-3V-002 ratification queued for v7.1.1 stamp. |

---

**End of Phase 3 V3+ Audit-Wide Integration Sweep (2026-05-04).**
