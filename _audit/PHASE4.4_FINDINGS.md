# Phase 4.4 — §13 Scoring & Grading (incl. §13.11 Defense View, §13.12 EvalStarter / "Buyer Maya" Intake) Audit Findings

**Prompt:** `Audit_Prompts.md` → Prompt 4.4 — Scoring & Grading (§13).
**Run:** local-cowork-2026-05-04. Non-destructive (no Master Spec edits).
**Scope walked:** §13.1–§13.10 (engine), §13.11.1–§13.11.13 (Defense View), §13.12.1–§13.12.10 (Per-Vertical / "Buyer Maya" Intake), plus paired Appendix L.7, Appendix I v7.1.0 Defense View error block, Appendix J `defense_view_lifecycle_state` / `regeneration_reason_code` rows, Appendix C `defense_view.generated` / `defense_view.regenerated`, §39 DefenseView rows, §44.1 Defense View latency rows, §5.11 Defense View / Regenerate rows, AE Ledger rows AE-14.5-01..06 / AE-14.7-01..09.

**Master Spec baseline:** v7.1.0 (2026-04-28). No drift detected at audit start.

---

## 1. Findings (pre-promotion)

### 1.1 Engine §13.1–§13.10

The engine subsection (§13.1 Overview through §13.10 Acceptance Criteria) was authored pre-v7.1.0 and was lightly amended in Phase 14.6 (the Solo Mode surface compression note added at §13.1). The engine itself has not been re-walked against the v7.1.0 convention bar. The walk surfaces material gaps against checks 1 (entity definition), 2 (acceptance criteria — soft-state ACs), 5 (state machines for grade object lifecycle), 10 (numerical singletons), and 14 (edge cases — three-way divergence, Convex outage, approver-leaves, self-approval).

The most material defect is the absence of a `§4.x.y Score / Grade` entity in §4 to back the `individual_grades[]` array described prose-only in §13.5.1. The prose schema (`id`, `user_id: string`, `grade`, `value`, `supersedes`, `timestamp`, `note`) is not registered in §4, has no scope isolation, residency, retention, indexes, or DSAR cascade declared, and the `user_id: string` type drifts from every other §4 FK to User (which is `uuid`). A junior engineer building from §13.5.1 alone has no canonical schema; every score row will be implemented differently across services.

### 1.2 Defense View §13.11

§13.11 is structurally the strongest subsection — 25 ACs across 8 sub-blocks, an entity model in §13.11.7, an Appendix L.7 state machine, 5 Appendix I error codes, two webhooks in Appendix C, three PostHog events in Appendix G, plan-gating in §5.11 + §34.1 + §39, OutcomeContract in §21.4.5, p95 SLOs in §44.1, surface mapping in Appendix M.1.

Material defects nonetheless:

- §13.11.7 retention block restates the §40.2 plan-tier purge TTLs ("Free 30d, Starter/Growth 1y, Scale 3y, Enterprise 7y") inline — convention #10 violation.
- §13.11.8 GET endpoint error list (line 13298–13302) drifts in three ways: it cites "503 capability_disabled" while Appendix I authoritatively registers `defense_view_capability_disabled` at HTTP 402; it omits 3 of the 5 codes from Appendix I (`defense_view_archived_with_workspace` 404, `defense_view_cross_console_access` 404, properly-named `defense_view_capability_disabled`); and `selection_record_not_finalized` is documented for both GET and POST in Appendix I but is listed only in the GET error list with the same body as the POST list.
- §13.11.9 state machine table (in-body) is incomplete vs Appendix L.7. The Appendix L.7 canonical table includes two transitions absent from §13.11.9: `generated_unopened → regenerated_unopened` (operator regenerates before opening — failure-recovery / low-confidence path) and `regenerated_unopened → regenerated_unopened` (self-loop on subsequent regenerations before any open). The rejected-transitions enumeration (e.g., `archived → opened`) is in Appendix L.7 but absent from §13.11.9. Convention #5 (state machine) violation: the body and the appendix disagree.
- §13.11.13 AC #6 conditions OutcomeContract resolution on a "Solo-tier operator" — but §13.11.4 makes Defense View available to Solo, Starter, Growth, Scale, and Enterprise. The OutcomeContract resolves the same way across every tier that consumes `defense_view_generate`; the AC is unbuildable for Starter+ as written.
- §13.11.5 inlines OutcomeContract numerics (90-day window, 30-day auto-accept, 24-hour grace, 14-day contest window) and quality numerics (70% confidence threshold, 8s p95 first paint, 30s hard timeout). The 8s p95 has a §44.1 home (line 31747) but is not cited; the 30s timeout has no §44.1 home; the OutcomeContract numerics have no §34 / §4.8.4 home.
- §13.11.5 Free Allowance "10 ops lifetime per Org per §4.8.7 / Summary C.80 default" cites a retired source (`Sourcera_Master_Summary` was retired in v7.0.0; `_versions/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md`).
- AE-14.5-01 (CapabilityRegistryEntry + OutcomeContract row), AE-14.5-05 (Appendix J enums — already landed but ledger row still `pending`), and AE-14.5-06 (Appendix G PostHog events) remain `pending` in `_integration/AUTHORED_EXTENSIONS_LEDGER.md`. Per the AE release-gate policy these ratify before v7.1.1; currently open against v7.1.1 stamp gate.
- §13.11.13 has only 3 ACs covering failure modes (#23, #24, #25) against 10 documented failure modes in §13.11.12. Failure modes #6 (confidence < 0.700), #8 (DSAR redaction in-flight), and #10 (cross-Workspace contamination paste) have no AC binding.

### 1.3 EvalStarter / "Buyer Maya" Intake §13.12

The audit prompt names §13.12 as "Buyer Maya Intake" and CHECK #10 mandates enumeration of "every Maya capability invoked, every output, every failure mode (Maya timeout, low-confidence, ambiguous classification)." The Master Spec changelog (lines 31, 37, 44, 45, 63, 102, 141) consistently calls §13.12 "Buyer Maya intake" / "Buyer Maya Onboarding."

The actual §13.12 section is purely a static EvalStarter materializer — no AI capability is invoked anywhere in §13.12.1–§13.12.10. The "Other" path captures 1–120 characters of free-text into `Workspace.intake_freetext_label` and dumps the buyer into the generic `other` EvalStarter seed. There is no Maya `capability_id`, no OutcomeContract, no confidence threshold, no low-confidence handling, no "ambiguous classification" failure mode, no Maya timeout treatment.

Two distinct interpretations are possible:

1. **Branding-only.** "Buyer Maya" is the operator-facing brand for the entire onboarding surface (tile grid + free-text); the engine is intentionally non-AI. If so, §13.12 should explicitly state "no AI invocation; Maya is a brand" and the audit prompt's CHECK #10 is a misdirected expectation.
2. **Authoring gap.** The Maya AI classification of free-text input was intended but not authored, and the v7.1.0 program landed the static fallback only. If so, the spec is silent on a feature that the program documents call "Buyer Maya."

Either way, the spec is unbuildable from CHECK #10 as stated. P1 acceptance_criteria.

### 1.4 Cross-references

- Appendix L.7 is canonical for the Defense View state machine and is more complete than the in-body §13.11.9 table.
- Appendix I v7.1.0 Defense View block is canonical for error codes — 5 codes registered; §13.11.8 names 3.
- Appendix J `defense_view_lifecycle_state` and `regeneration_reason_code` ARE registered (lines 46513, 46519). Master Spec changelog row at line 120 still says these are "v7.1.1 backlog" — stale.
- Appendix C `defense_view.generated` is registered (line 41651). The CI gate `appendix_c_to_appendix_g_coverage` (line 41658) asserts both webhooks have PostHog Appendix G rows; AE-14.5-06 says these are `pending` v7.1.1 backlog. Drift between AE Ledger status and CI-gate assertion.
- §44.1 Defense View generation row (line 31747) and Defense View PDF row (line 31748) are present. §13.11.5 / §13.11.6 cite §44.1 for the 8s and 3s budgets respectively. The 30s timeout has no §44.1 home.
- §39 DefenseView field-size rows (lines 31259, 31260) are present. §13.11.7 cites §39. ✅
- §5.11 row 9433 ("Open Defense View") and row 9434 ("Regenerate Defense View") are present. ✅

---

## 2. Counterfactual Pass

For each subsection audited, I enumerated three realistic failure modes the spec must handle.

### 2.1 §13.2 Rubric

1. **Concurrent Ops edit to PM default mid-evaluation.** Silent — no AC for an in-flight rubric mutation. Builds two readers: one applies new PM to all grades, one applies only to grades after the edit.
2. **PM default outside 0.1–0.9.** Validated server-side (§13.2.2) but no error code registered in Appendix I; HTTP status, retry semantics unstated.
3. **Per-Use-Case rubric drift.** Spec says "PM Default Value: 0.6 (configurable per workspace, range 0.1–0.9)" — workspace-scoped. Silent on whether each Use Case can have its own PM default; matrix view rendering across Use Cases with different PM defaults unspecified.

### 2.2 §13.4 Exclusion (EX) Handling

1. **Approver leaves workspace before approving pending EX.** Silent — does the EX revert to blank, persist as pending forever, escalate to another approver?
2. **Self-approval (proposer == approver).** Silent — no rule preventing the same Workspace Owner from proposing and approving their own EX.
3. **Approver rejects with no justification.** Silent — §13.4.2 says approver clicks "Approve" or "Reject," no justification mandated for rejection. Audit log entry is incomplete.

### 2.3 §13.6 Collaborative Scoring & Disagreement Resolution

1. **Three-way divergence (3 reviewers, 3 distinct grades).** Divergence formula `(max_grade − min_grade)` reduces to a 2-way comparison; the divergence card UI shows "both grades with reviewer names" — undefined for ≥ 3 reviewers.
2. **Convex outage during reactive scoring.** Silent — no degraded-mode behavior. §44.1 line 31736 declares the general 500ms p95 reactive SLO; §13.6 does not bind to it or specify behavior on outage.
3. **Reviewer leaves workspace mid-disagreement-resolution.** Silent — does the disagreement card stay pinned, dissolve, escalate to Lead?

### 2.4 §13.11 Defense View

10 failure modes documented in §13.11.12; 3 covered by ACs (#23, #24, #25). Failure modes #6 (confidence < 0.700), #8 (DSAR redaction in-flight), #10 (cross-Workspace contamination paste) have no AC binding — file as P2 acceptance_criteria.

### 2.5 §13.12 EvalStarter / "Buyer Maya" Intake

12 edge cases documented in §13.12.8; all but #5 (Concurrent Ops edit) and #11 (Data residency) have AC bindings. Counterfactual pass otherwise clean.

The largest counterfactual gap remains the absence of any Maya AI invocation despite the program's "Buyer Maya" branding.

---

## 3. Self-Challenge Pass (Hostile Reviewer)

I re-read each candidate finding as a hostile reviewer:

- **D-4.4-001 (retention inline).** Severity P1 — the inline TTL block is a numerical singleton that the spec convention #10 explicitly forbids. Cite §40.2 instead. Defensible.
- **D-4.4-002 (`exception_reason ≤200 chars` not in §39).** Severity P1 — reviewer acceptance: §39 is the canonical home for character limits; §13.4.2's restatement is a singleton violation. Defensible.
- **D-4.4-003 (no `Score`/`Grade` entity).** Severity P1 — could be argued P0 because the spec is unbuildable, but the prose schema in §13.5.1 is sufficient for a careful engineer to infer the table; a junior engineer would build wrong. P1 holds.
- **D-4.4-004 (divergence thresholds inline).** Severity P1. A hostile reviewer might argue these are product behavior thresholds, not numerical singletons; §39 may not be the right home. Defensible if §13 itself doesn't have a thresholds table; recommendation is to author one.
- **D-4.4-006 (HTTP status drift on `defense_view_capability_disabled`).** Hostile reviewer test: is the §13.11.8 GET error list authoritative or is Appendix I? Appendix I is the authoritative catalog per Audit_Prompts §6 / §M.4 `defense_view_appendix_i_pairing`; the §13.11.8 GET list drifts. P1 holds.
- **D-4.4-008 (state machine drift between body and appendix).** Hostile reviewer: convention #5 mandates state-machine table form. Both tables are tables; both are state machines. The drift is in transition coverage. P1 holds — the body table is incomplete.
- **D-4.4-009 (AC #6 Solo-tier scoping).** Hostile reviewer: AC #6 says "Given a Solo-tier operator..." which a tester would read as "the test fixture must use a Solo-tier operator." A Starter+ operator's OutcomeContract resolution is then unspecified. The spec's intent per §21.4.5 OutcomeContract is plan-agnostic. P1 holds — junior engineer builds the test wrong.
- **D-4.4-010 ("Buyer Maya" expected, not present).** Hostile reviewer: is this a defect in the spec or a defect in the audit prompt's expectation? Both. The branding-engine drift is a real spec defect; CHECK #10's expectation is reasonable given the v7.1.0 program documents. P1 holds.
- **D-4.4-011 (OutcomeContract numerics inline).** Hostile reviewer: many of these (90 days, 24h, 14 days) are OutcomeContract-instance values, not plan-tier numerics. Convention #10 applies to "every dollar figure, character limit, file-size limit, duration, rate-limit, k-anonymity floor, retention TTL." Durations qualify. P1 holds; recommendation is a §4.8.4 OutcomeContract-numerics table or §13.11.5.1 sub-section.

I revised the severity of three candidates downward during this pass:

- D-4.4-019 (5s highlight) downgraded from P2 to P3 — a UI animation duration is plausibly inline.
- D-4.4-020 (failure-mode AC coverage gap) reaffirmed P2 — not strictly buildability-blocking but two readers will resolve differently.
- D-4.4-029 (AE flag without AE-Ledger link) downgraded from P2 to P3 — the AE Ledger row exists; the missing link is hygiene.

I revised one candidate upward during this pass:

- D-4.4-003 (no `Score` entity) upgraded from P2 to P1. Convention #1 mandates a field table for every entity; §13.5.1's prose schema is not a field table.

---

## 4. Promotion to Defect Ledger

The findings below are promoted to `DEFECT_LEDGER.md` under section "Phase 4 — Prompt 4.4 — §13 Scoring & Grading End-to-End Audit (2026-05-04)" and assigned IDs `D-4.4-001` … `D-4.4-029`.

Coverage matrix prescriptions appended to `COVERAGE_MATRIX.md` Phase 4.4 update block:

- **F-Score / F-Grade row missing.** Phase 0 inventory does not include a `Score` or `Grade` feature row; recommend cleaving via D-4.4-003.
- **F-{Defense View} (anchor §13.11.7).** `data_model` ✅ holds; `acceptance_criteria` ✅ → ⚠ via D-4.4-009 / D-4.4-018 / D-4.4-020; `state_machine` ✅ → ⚠ via D-4.4-008; `error_codes` ✅ → ⚠ via D-4.4-006 / D-4.4-007 / D-4.4-016; `numerical_singleton` ✅ → ⚠ via D-4.4-001 / D-4.4-011 / D-4.4-012; `authored_extension_status` ⚠ holds (AE-14.5-01 / -05 / -06 pending).
- **F-{Buyer Maya Intake} (anchor §13.12).** `acceptance_criteria` ✅ → ❌ via D-4.4-010; `numerical_singleton` ✅ → ⚠ via D-4.4-021.
- **F-{Scoring Engine} (anchor §13.1–§13.10).** `data_model` ✅ → ❌ via D-4.4-003; `numerical_singleton` ✅ → ⚠ via D-4.4-002 / D-4.4-004 / D-4.4-005 / D-4.4-019; `acceptance_criteria` ✅ → ⚠ via D-4.4-013 / D-4.4-022 / D-4.4-023 / D-4.4-031 / D-4.4-034 / D-4.4-035 / D-4.4-036.

---

## 5. Forward References

- **Phase 4.5 (§14 Scenario Modeling).** D-4.4-032 forward-references §14 for `tco_percentile`, `tco_value_weight`, `use_case_weight`. Phase 4.5 should verify §14 defines these.
- **Phase 8 (APIs).** D-4.4-006 / D-4.4-007 require §32.5 endpoint pass to align error-code coverage between §13.11.8 and Appendix I.
- **Phase 9 (Observability).** D-4.4-024 (mobile divergence on collaborative scoring) belongs in Phase 14 Mobile Parity / Phase 9 Observability cross-check.
- **Phase 14.13 enum / PostHog rollups.** D-4.4-014 / D-4.4-026 close on AE-14.5-05 / AE-14.5-06 ratification.

---

## 6. Self-Challenge Revision Log

| revision | from | to | rationale |
|---|---|---|---|
| D-4.4-019 severity | P2 | P3 | UI animation duration is plausibly inline; cosmetic. |
| D-4.4-029 severity | P2 | P3 | AE Ledger row exists; missing link is hygiene. |
| D-4.4-003 severity | P2 | P1 | Convention #1 mandates field table; prose schema is not a field table. |
| D-4.4-010 severity | P2 | P1 | "Buyer Maya" branding without Maya invocation is not a labelling tweak; junior engineer cannot build the AI behavior the program documents promise. |

End of scratch log.
