# AE Ratification Recommendations

**Run date:** 2026-05-12
**Scope:** Per-row ratification recommendations for the v7.1.0-program residual queue (CLAUDE.md §16, 7 rows) and class-level recommendations for the v7.1.1 stamp-gate residual inheritance queue (~140 rows).
**Authority:** Audit-pass recommendation only. Final ratification authority rests with the named sign-off owner per row.
**Companion artifacts:** `_audit/PHASE_AE_FINDINGS.md` (audit scratch log); `_audit/DEFECT_LEDGER.md → "Phase AE"` block (15 defects filed D-AE-001..-015).

---

## 1. v7.1.0-Program Residual Queue (CLAUDE.md §16) — Per-Row Recommendation

The CLAUDE.md §16 block names 7 rows as the "v7.1.0 ratification queue". Per the Phase AE audit walk, 5 are READY (Engineering / Founder owner sign-off only) and 2 are BLOCKED on Phase V11 cluster ratification. Per-row recommendation:

### AE-14.9-01 — Solo enum authoritative; alias retired

- **Owner:** Engineering.
- **Recommendation:** **APPROVE.**
- **Acceptance test (proposed):** (a) Appendix J Plan Tiers row shows `buyer_solo` and `seller_solo` as authoritative values; (b) §34.1.3 reflects Solo-inclusive plan-tier semantics; (c) line 11899 carries the v7.1 corrected reference (per Phase 14.9.1 fix-pass); (d) deploy-time validator `solo_tier_numeric_single_source` resolves cleanly across §34.1.1 / §34.1.2 / §34.1.3 / §34.2.1 / §34.2.2 / §34.2.5 / §34.10.3 / §34.12.6.
- **Dependency blockers:** None.
- **Verdict:** READY.

### AE-14.10-07 — Solo `low_priority_background` capability membership

- **Owner:** Engineering + Sourcera Ops.
- **Recommendation:** **APPROVE.**
- **Acceptance test (proposed):** (a) §44.6.4.1 capability-registry seed pass registers `proactive_cmd_k_marketplace_surfacing`, `weekly_kb_refresh_suggestions`, and `vendor_page_enrichment_polling` with `surface_throttling_class = low_priority_background`; (b) §44.6 Solo-Tier Surface Treatment language is consistent with the 3-capability set; (c) deploy-time validator `solo_capability_throttling_class_membership` resolves cleanly.
- **Dependency blockers:** None (depends on AE-14.10-01 / AE-14.10-02 / AE-14.10-03 which are `acknowledged`).
- **Verdict:** READY.

### AE-14.14-21 — §2.8.7 AC #5 deadline-countdown TZ formatting

- **Owner:** Engineering.
- **Recommendation:** **APPROVE.**
- **Acceptance test (proposed):** (a) §2.8.7 AC #5 includes binding rule "renders in `User.timezone` per §41 convention"; (b) the rule is testable against a synthetic User with non-UTC timezone (Tokyo) and the countdown surface emits the localized timestamp; (c) §41 timezone convention citation is present.
- **Dependency blockers:** None.
- **Verdict:** READY.

### AE-14.18.1-01 — §M.5 CI gate catalog (122-row assertion)

- **Owner:** Engineering.
- **Recommendation:** **HOLD — BLOCKED on Phase V11 cluster ratification.**
- **Acceptance test (proposed, post-V11-ratification):** (a) §M.5 catalog row count is 122 per the V11 D-11.3-004 corrected arithmetic; (b) per-row `runtime_status` assignment table at §M.5.5 names 2 `runtime_active`, 119 `spec_binding_pending_pack_<id>`, 1 `spec_binding_release_gate_only`; (c) §M.5.3 schema includes the 5 new V11 columns (`row_class`, `runtime_status`, `execution_context`, `assertion`, `runbook`, `override_path`); (d) M02.3 / M11.3 / M21.3 / M24.3 / release-orchestration implementation packs own runtime wiring per `Build_Execution_Strategy.md` §11.
- **Dependency blockers:** AE-V11-03 (§M.5 schema tightening — 5 new columns); AE-V11-07 (§M.5 V11 hardening block — 19 new rows + 17 in-place amendments + corrected post-V11 122-row arithmetic).
- **Verdict:** BLOCKED. Per defect D-AE-011 (P1), the CLAUDE.md §16 "has no blocker" framing is wrong; this row depends on V11 cluster ratification. Ratify V11 cluster first, then this row.

### AE-14.18.1-02 — `@ci-gate-override:` annotation pattern

- **Owner:** Engineering.
- **Recommendation:** **HOLD — BLOCKED on Phase V11 cluster ratification.**
- **Acceptance test (proposed, post-V11-ratification):** (a) §M.5.7 + §M.4.4.5 override grammar is canonical at "rationale ≥ 60 chars + Gate ID literal match + row-level `not_permitted` supersedes default + `coupled_with:<other_gate_id>` / `requires_audit_event:<event_kind>` suffixes"; (b) `tools/spec-lint/override_parser.ts` parses both `@appendix-m-internal-only:` (§M.4.4.1 — Appendix M coverage gate only) and `@ci-gate-override:` (§M.4.4.5 — all other gates); (c) `@appendix-m-internal-only:` and `@ci-gate-override:` annotations on a non-matching Gate ID fail the override parser with `override_unknown_gate`; (d) the V11 D-11V-004 coupled-gate / requires-audit-event suffixes parse cleanly.
- **Dependency blockers:** AE-V11-06 (§M.4 V11 hardening block — §M.4.4.5 sibling override grammar canonicalization that "replaces the three-way drift between §M.4.4-v1 / §M.5-line-49567-v1 / AE-14.18.1-02-v1").
- **Verdict:** BLOCKED. Per defect D-AE-011 (P1), ratify AE-V11-06 first, then this row.

### AE-14.0.1-01 — Descope of GTM rewrites to v7.1.x

- **Owner:** Founder + GTM.
- **Recommendation:** **ACKNOWLEDGE.**
- **Acceptance test (proposed):** (a) RECONCILIATION.md Phase 14.0.1 records the scope amendment; (b) Appendix M.1 forward-reference rows for `GTM_POSITIONING.md` / `GTM_PLG_ARCHITECTURE.md` / `GTM_SALES_PLAYBOOK.md` / `GTM_90DAY_SPRINT.md` are labeled with "(deferred to v7.1.x; Phase 14.0.1 scope amendment)" — already `acknowledged` at AE-14.0.1-03 line 289; (c) CLAUDE.md §16 v7.1.x descopes block reflects the deferral.
- **Dependency blockers:** None.
- **Verdict:** READY (pure scope amendment — ratify by acknowledgement).

### AE-14.0.1-02 — Descope of Marketplace-as-RFP-Exchange to v7.1.x

- **Owner:** Founder + Product.
- **Recommendation:** **ACKNOWLEDGE.**
- **Acceptance test (proposed):** (a) RECONCILIATION.md Phase 14.0.1 records the scope amendment; (b) Appendix M.1 forward-reference row for "Marketplace-as-RFP-Exchange" labeled "(deferred to v7.1.x; Phase 14.0.1 scope amendment)" — already `acknowledged` at AE-14.0.1-03; (c) §27 narrative reframing + §48 loop updates remain explicitly out of v7.1.0 scope.
- **Dependency blockers:** None.
- **Verdict:** READY (pure scope amendment — ratify by acknowledgement).

### Roll-Up — v7.1.0-Program Residual Queue

| Row | Verdict | Sign-off owner action |
| :---- | :---- | :---- |
| AE-14.9-01 | READY | Engineering: approve |
| AE-14.10-07 | READY | Engineering + Sourcera Ops: approve |
| AE-14.14-21 | READY | Engineering: approve |
| AE-14.18.1-01 | BLOCKED | Wait for AE-V11-03 + AE-V11-07 |
| AE-14.18.1-02 | BLOCKED | Wait for AE-V11-06 |
| AE-14.0.1-01 | READY | Founder + GTM: acknowledge |
| AE-14.0.1-02 | READY | Founder + Product: acknowledge |

5 of 7 rows are READY for immediate sign-off. 2 of 7 are BLOCKED on the Phase V11 cluster and must wait for V11 ratification first.

---

## 2. v7.1.1 Stamp-Gate AE Inheritance — Class-Level Recommendations

The actual v7.1.1 stamp-gate inheritance set is ~140 rows. CLAUDE.md §16 names only the 7-row legacy subset. Per defect D-AE-012 (P2), the framing is materially understated. Class-level recommendations by cluster:

### 2.1 Phase 12.x DEF Cluster — RECONCILE FIRST

| Cluster | Status | Recommendation |
| :---- | :---- | :---- |
| AE-12.1-DEF-01 through AE-12.1-DEF-08 (8 rows) | All `pending`, target `Phase 12.5` | Re-target every row to v7.1.1. Phase 12.5 was never run; the scope absorbed into Phase 14. |
| AE-12.2-DEF-01 through AE-12.2-DEF-03 (3 rows) | All `pending`, target `v7.1.0` | Re-target to v7.1.1 (target version slid past stamp). |
| AE-12.4-DEF-01 (DSAR 30-day SLA) | `pending`, target `Phase 12.5` | **Supersede** by AE-V9-004 + AE-V9-005 per defect D-AE-009. |
| AE-12.4-DEF-02 (§32.4 API quota AE) | `pending`, target `Phase 12.5` | **Supersede** by AE-12.4-01 per defect D-AE-008. |
| AE-12.4-DEF-03 (§44.5 timeout promotion) | `pending`, target `Phase 12.5` | Re-target to v7.1.1; verify no V8.4 / V9 supersedes. |
| AE-12.4-DEF-04 (§45.2 account-lockout promotion) | `pending`, target `Phase 12.5` | Re-target to v7.1.1; verify no V3 §6 supersedes. |
| AE-12.4-DEF-05 (§45.3 marketplace appeal SLO) | `pending`, target `Phase 12.5` | Verify whether AE-PH6R-012 (§42.3.1 per-severity triage SLA single-source) supersedes; if so, transition to `superseded`. |
| AE-12.4-DEF-06 (Volume discount bands → §34.2.4) | `pending`, target `Phase 12.5` | **Supersede** by AE-V2-006 + D-2.3-001 V2 remediation per defect D-AE-007. |
| AE-12.3-DEF-14 (Phase 12.5 Notation Cleanup, 58 refs) | `pending`, target `Phase 12.5` | Re-target to v7.1.1; partial supersession by AE-V11-05 (anchor-slug alias-redirect table). |

**Class-level recommendation.** Treat the Phase 12.x DEF cluster as the highest-priority v7.1.1 hygiene pass. Per defect D-AE-006 (P1), the rows are orphaned on an absent phase. Ratification is impossible until rows are re-targeted or superseded.

### 2.2 Phase 12.3 / 12.4 Release-Gating Rows (v7.0.0 Release-Gate Block)

| Row | Owner | Status | Recommendation |
| :---- | :---- | :---- | :---- |
| AE-12.3-04 (§6.8.4 DSAR Cascade) | Security + Legal | `pending` — RELEASE-GATING for v7.0.0 | **APPROVE** — substantively superseded / extended by Phase V9 cluster (AE-V9-001..-007); ratify both as a bundle. Either close as `acknowledged` against AE-V9-001..-004 OR keep distinct and ratify alongside V9 cluster. |
| AE-12.3-05 (§6.8.5 Audit-Integrity Exemption) | Security + Legal + Finance | `pending` — RELEASE-GATING for v7.0.0 | **APPROVE** — body landed in §6.8.5; extended by AE-V9-002 (Marketplace-Aggregate Cascade Trigger row #16). |
| AE-12.3-06 (§7.3 PII Handling Across Org Boundaries) | Security + Legal | `pending` — RELEASE-GATING for v7.0.0 | **APPROVE** — body landed in §7.3; extended by Phase 6 firewall hardening. |
| AE-12.4-01 (§32.4 API-Call Quotas) | Engineering + Finance | `pending` — RELEASE-GATING for v7.0.0 | **APPROVE** — body landed in §32.4. |
| AE-12.4-02 (§34.18.3 Year-1 Buyer Plan-Mix Split) | Founder + GTM Lead | `pending` — RELEASE-GATING for v7.0.0 | **APPROVE** — but per defect D-AS-004 / D-AS-005 the §34.18.3 splits are now inconsistent with BPS v3 §13 / SPS v3 §14 Year-1 mixes. Ratify alongside a v7.1.1 §34.18.3 Solo-row authoring pass per the D-AS-004 / D-AS-005 recommendations. |
| BC-12.4-01 (Enterprise SLA 1h → 4h) | Sales + Legal + Comms | `pending` — RELEASE-GATING for v7.0.0 | **ACKNOWLEDGE** — breaking change documented; Legal sign-off owed on customer-notification protocol. |

**Class-level recommendation.** These 6 rows are release-gating per the ledger preamble at line 6 and have nonetheless landed unratified into v7.1.0. Per defect D-AE-013, the v7.1.0 stamp policy was bypassed. Recommend ratifying as a bundle at the v7.1.1 stamp gate with explicit owner sign-off (the body has landed; only the ratification gesture is owed).

### 2.3 Phase 14.x Cluster — STANDARD V7.1.1 RATIFICATION

| Sub-cluster | Row count `pending` | Owner mix | Recommendation |
| :---- | :---- | :---- | :---- |
| Phase 14.4 (Single-Operator Mode) | 6 (AE-14.4-01..-06) | Engineering | APPROVE as a bundle. Bodies all landed at §2.8.3 / §2.8.5 / §2.8.7 / §2.8.8. |
| Phase 14.5 (Defense View) | 3 (AE-14.5-01, -05, -06) | Engineering + Finance / Engineering + Analytics | AE-14.5-01: APPROVE. AE-14.5-05 / -06: re-target per defect D-AE-005 to Phase 14.13b / 14.13c sub-phase. |
| Phase 14.6 (Pipeline Surface Compression) | 4 | Engineering / Design / Product | APPROVE as a bundle. |
| Phase 14.7 (Per-Vertical Eval Starters) | 6 (AE-14.7-01, -03, -04, -05, -06, -07) | Sourcera Ops + Engineering + Marketplace Engineering | AE-14.7-01 / -03 / -04: APPROVE. AE-14.7-05 / -06 / -07: re-target to Phase 14.13c. |
| Phase 14.8 (Seller Maya Surface Polish) | 9 (AE-14.8-01..-09) | Engineering / Analytics | APPROVE -01..-07 and -09 as a bundle. AE-14.8-08: re-target to Phase 14.13d per defect D-AE-005. |
| Phase 14.9 (Solo Plan Tier) | 12 (AE-14.9-01..-12) | Engineering / Finance / Sales-Ops / Product / Sourcera Ops / Security | APPROVE as a bundle. AE-14.9-01 already in v7.1.0 ratification queue. |
| Phase 14.10 (Solo-Tier Surface Treatment) | 4 (AE-14.10-04, -05, -07, -08) | Engineering + Analytics | AE-14.10-04 / -07 / -08: APPROVE. AE-14.10-05: re-target to Phase 14.13a catalog-rollup. |
| Phase 14.14 (Error Code Rollup) | 1 (AE-14.14-21) | Engineering | APPROVE — already in v7.1.0 queue. |
| Phase 14.18.1 (CI Gate Catalog) | 2 (AE-14.18.1-01, -02) | Engineering | BLOCKED on V11 cluster — see §1 above. |
| Phase 14.0.1 (Scope Amendment) | 2 (AE-14.0.1-01, -02) | Founder + GTM / Founder + Product | ACKNOWLEDGE — already in v7.1.0 queue. |

### 2.4 Phase 1V / 2V / 3V / 3V+ / 6R / V7 Clusters — STANDARD V7.1.1 RATIFICATION

| Cluster | Row count | Notes |
| :---- | :---- | :---- |
| Phase 1V (§4 entity model) | ~12 (AE-D1V-001 through AE-D1V-014, excluding D1V-014 already `acknowledged`) | APPROVE as a bundle. Includes 2 P0 GDPR closures (D-1V-007 bid-workspace residency lock; D-1V-012 bridge-event DSAR cascade). |
| Phase 2V (audit remediation) | 7 (AE-V2-001 through AE-V2-007) | APPROVE as a bundle. AE-V2-001 (`brand_voice_guide_v1`) requires Marketing + Founder sign-off. |
| Phase 3V (RBAC + auth + DSAR) | ~30 rows | APPROVE as 5 sub-bundles by owner alignment: §5.x (Engineering); §6.1/§6.2/§6.3 (Engineering + Security); §6.4/§6.5/§6.6 (Engineering); §6.7 (Engineering + Security); §6.8 (Engineering + Legal). AE-3V-001 / AE-3V-002 CI gate batches require Engineering sign-off. |
| Phase 6R (firewall hardening) | 17 (AE-PH6R-001 through AE-PH6R-017) | APPROVE as a bundle. Includes 2 P0 P-CONS firewall closures (D-V6-001 cardinality leak; D-V6-002 Ops-user-identity leak). Legal sign-off required on AE-PH6R-015 / -016 (non-disclosure reporter-audience suppression). |
| Phase V7 (pricing/billing) | 10 (AE-V7-01 through AE-V7-10) | APPROVE as a bundle. Founder + Counsel sign-off required on AE-V7-02 (Ops Emergency Reversal Protocol) and AE-V7-05 (Contest filing rate-limit + DSAR-vs-contest deadlock-resolution). |

### 2.5 Phase V8.4 / V9 / 10V Clusters — V7.1.1 STAMP-GATE PREREQUISITES

| Cluster | Row count | Owner | Recommendation |
| :---- | :---- | :---- | :---- |
| Phase V8.4 (Appendix I structural extensions) | 5 (AE-V8.4-01 through AE-V8.4-05) | Security & Compliance Lead / Engineering API Lead / i18n Lead / Compliance & Engineering Leads | APPROVE as a sequenced queue: AE-V8.4-01 first (Security & Compliance — `console_isolation_violation` carve-out); AE-V8.4-02 / -04 (Engineering API — retryability + headers); AE-V8.4-03 (i18n — localization keys); AE-V8.4-05 (Compliance & Engineering — webhook). |
| Phase V9 (DSAR cascade + residency DR) | 7 (AE-V9-001 through AE-V9-007) | Privacy Officer + Engineering Director + Finance + Counsel + DPO + outside counsel | APPROVE as a sequenced queue. Privacy Officer + outside counsel are required signers per the GDPR Art. 17 / Art. 12(3) / Chapter V anchoring. AE-V9-004 (cumulative-pause statutory ceiling) requires the strongest outside-counsel sign-off because of GDPR Art. 12(3) interpretation. |
| Phase 10V (Per-Surface Conformance Binding) | 1 (AE-37-01) | Design Lead + Engineering Lead + outside WCAG audit firm | ACKNOWLEDGE — interim WCAG 2.1 AA + 2.2 AA Success Criterion list is supplied verbatim until Phase 37 D-37-004 rewrite lifts the list into §37.5. |

### 2.6 Phase V11 / V12 / V13 Clusters — V7.1.1 STAMP-GATE BLOCKING

| Cluster | Row count | Notes |
| :---- | :---- | :---- |
| Phase V11 (Catalog-completeness remediation) | 8 (AE-V11-01 through AE-V11-08) | **CRITICAL** — AE-14.18.1-01 and AE-14.18.1-02 BLOCKED on V11 cluster ratification per defect D-AE-011. AE-V11-04 is a STUB with body deferred to Phase 11.5 per defect D-AE-015 — recommend re-targeting AE-V11-04 to v7.1.2 (option b) to decouple the stamp gate from the unbounded deferral. |
| Phase V12 (Operations / QA / Observability / DR) | 11 (AE-V12-01 through AE-V12-11) | APPROVE as a bundle. Includes 8 inherited P0 closures + 78 P1 closures. AE-V12-08 (OpsSession pre-action dwell) requires Security sign-off. AE-V12-09 (Hash-Chain Scope) requires Security + audit-integrity owner sign-off. |
| Phase V13 (PLG / Growth / Analytics) | 6 (AE-V13-001 through AE-V13-006) | APPROVE as a bundle. AE-V13-001 (Hero Moment abandonment recovery) requires Privacy Officer sign-off on the DSAR exclusion contract. AE-V13-003 / AE-V13-004 (Buyer Hero Moment + `workspace_intake_materializer`) require KB Lead sign-off on the new Anthropic Opus 4.6 capability. |

### 2.7 Phase 13 Engineering Review Cluster (Non-Blocking for v7.0.0)

| Row | Notes |
| :---- | :---- |
| AE-13-01 through AE-13-07 (7 rows) | APPROVE as a bundle. AE-13-01 requires Finance sign-off on the `external_provider_outage` cost-routing rule. |
| AE-13-DEF-01 through AE-13-DEF-07 (7 rows) | AE-13-DEF-04: split into 3 remaining sub-rows per defect D-AE-010; transition the original to `superseded`. Other DEF rows: re-target to v7.1.1 (Phase 13.x is not actually run as a discrete stamped milestone). |

---

## 3. Per-Cluster Ratification Sequence — Recommended Order

To minimize cross-cluster ratification races (defect D-AE-011), recommend the following ratification order for v7.1.1 stamp gate:

| Wave | Clusters | Why this order |
| :---- | :---- | :---- |
| 1 | Phase 12.x DEF reconciliation (re-target + supersede) | Unblock orphaned rows before ratifying the bodies. |
| 2 | Phase 12.3 / 12.4 release-gating rows (v7.0.0 commitments) | Close the documented release-gate debt from 2026-04-26 before piling new commitments on top. |
| 3 | Phase 14.x cluster (excluding 14.18.1-01 / -02) | Pure body-already-landed approvals. Engineering + Founder owner alignment. |
| 4 | Phase 1V + 2V + 3V + 3V+ + 6R clusters | Convention / RBAC / DSAR / firewall hardening. Engineering + Security + Legal owner mix. |
| 5 | Phase V7 + V8.4 + V9 clusters | Pricing / billing / Appendix I / DSAR cascade / residency DR. Includes the heaviest outside-counsel sign-off (V9 cluster). |
| 6 | Phase V11 cluster | Unblocks AE-14.18.1-01 / -02. AE-V11-04 re-target to v7.1.2. |
| 7 | AE-14.18.1-01 + AE-14.18.1-02 (now unblocked) | Ratify post-V11-cluster. |
| 8 | Phase V12 + V13 + 10V clusters | Ops / Test / PLG / Accessibility extensions. |
| 9 | Phase 13 cluster + DEF-04 transitions | Engineering Review residual; CI gate authoring. |
| 10 | CLAUDE.md §16 reframe (defect D-AE-012) | Replace "v7.1.0 ratification queue" with full v7.1.1 stamp-gate inheritance dashboard. |
| 11 | AE Ledger schema upgrade (defects D-AE-001 / -002 / -003 / -011 / -014) | New columns; backfill across all rows. |

---

## 4. AE-V11-04 Resolution

Per defect D-AE-015 (P1), AE-V11-04 (M.1 Engine-Concept Backfill Pack) is a stub. Three resolution options:

| Option | Description | Tradeoff |
| :---- | :---- | :---- |
| (a) | Phase 11.5 must run before v7.1.1 stamps | Preserves M.1 completeness; risks unbounded stamp deferral if Phase 11.5 slips. |
| (b) | Re-target AE-V11-04 to v7.1.2 | Preserves v7.1.1 stamp cadence; M.1 engine-concept rows temporarily marked `Internal-only, surface-engine-mapping deferred to v7.1.2`. |
| (c) | Acknowledge stub with hard date deadline (2026-06-15 recommended) | Compromise; risks repeating the v7.1.0 stamp-policy bypass if the deadline slips. |

**Audit recommendation: (b).** Decoupling the v7.1.1 stamp gate from an unbounded deferral preserves stamp cadence. AE-V11-04 should explicitly target v7.1.2 with the Phase 11.5 owner (Engineering Lead) and an interim "deferred" flag on the 55 affected M.1 rows. CLAUDE.md §16 should be amended to reflect this decoupling.

---

## 5. Critical Open Questions for Owner Resolution

1. **Did the v7.1.0 stamp actually enforce the line-316 release-gate policy?** Per defect D-AE-013, the documented policy was bypassed. Owner: Founder + Engineering Director. Resolution: (i) amend the ledger preamble to declare the actual rule applied, or (ii) tighten the v7.1.1 stamp gate to actually enforce the rule. Recommend (i).

2. **Should AE-V11-04 block v7.1.1 stamp?** Per defect D-AE-015, the stub-only ratification cannot complete. Owner: Engineering Director + Phase 11.5 owner. Recommend re-target to v7.1.2.

3. **Are the V11 amendments to AE-14.18.1-01 / -02 substantively new commitments, or in-place clarifications of existing commitments?** Per defect D-AE-011, the framing matters: if substantively new, the rows need a "v7.1.0 base + V11 amendment" two-step ratification protocol; if clarifications, the rows can ratify post-V11 in a single step. Owner: Engineering Director + Security Lead.

4. **Should the AE Ledger schema upgrade (D-AE-001 / -002 / -003 / -011 / -014) land before v7.1.1 stamp or in a v7.1.1 hygiene follow-up?** Owner: Engineering Lead. Recommendation: schema upgrade lands in the v7.1.1 stamp gate window — without the schema upgrade, ratification of the ~140-row inheritance set is unreproducible.

5. **Should companion-doc inline restatements (BPS v3 / SPS v3 — D-AS-002 / D-AS-004 / D-AS-005 / D-AS-011 / D-AS-013) ratify alongside the §34 numerical singletons?** Owner: Pricing Lead. Recommendation: bundle into the v7.1.1 pricing-doc tightening pass per CLAUDE.md §16 v7.1.1 backlog.

---

**End of AE_RATIFICATION_RECOMMENDATIONS.md.**
