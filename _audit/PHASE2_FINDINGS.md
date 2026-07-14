# Phase 2 — §2 (The Sourcera Method) Findings (Scratch Log)

**Audit prompt:** Walk §2 end-to-end. Confirm decomposition state diagram, scoring acceptance criteria, vendor-shortlist plan gating in §39, evaluation-timeline benchmarks vs §10, cohort Solo-suppression in §44.6, template cross-refs to §19, exhaustive §2.8, and AE-14.X Solo-Mode pending status. P1 for any §2.8 silent edge case.

**Sources read end-to-end (this prompt):**

- `Sourcera_Master_Spec.md` §1.3, §2 (full), §10.2–§10.16 (focus §10.15), §13.11.3–§13.11.5, §13.12 (referenced), §19 (full), §39 (full), §44 (focus §44.6), Appendix M.1 (relevant rows around 47692–47972).
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` — Phases 14.4 / 14.6 / 14.7 / 14.9 / 14.10 / 14.14 Solo-Mode rows.
- `Audit_Prompts.md` (Defect Ledger Format, Severity Definitions).

**Self-challenge protocol applied:** every defect re-read for evidence reproducibility, severity rule match, and recommendation sharpness. Counterfactual pass per finding (≥3 failure modes per audited block).

---

## §2.1 Overview

- §2.1 claims The Method "compresses 6–12 week evaluations into 4–6 weeks." This is a duration claim that conflicts with §10.15's "Total Estimated Timeline: 10–20 weeks (2.5–5 months)" — both anchored on the *same Sourcera Method*. Per Authoring Convention #10, every duration must have one authoritative home; §10.15 is the §10 home, but §2.1 inlines a contradicting duration. Promoted as **D-2-001**.
- §2.1 says The Method is "not mandatory — users can adopt Buyer Console without the Method." This is engine-relevant: which §10 phases are skippable, and what does "not adopting the Method" actually mean for `pipeline_stage_id` advancement, `expected_phase_durations`, Pulse Health Score, and Solo Mode? §10 / §2.8 do not define a "Method-disabled" mode. Either The Method is invariant (and the §2.1 statement is wrong) or it is configurable (and the configuration is unspecified). Promoted as **D-2-023**.

## §2.2 Decomposition: Use Cases → Requirements

- Convention #5 (state machines): the prompt explicitly asks "Confirm use-case decomposition has a complete state diagram." §2.2 has *no* state machine. Use Case has a lifecycle (drafted → validated → locked at Phase 12 entry → soft-deleted) and Requirement has a lifecycle (drafted → reviewed → locked → traceability-linked) but neither is registered as a `From | To | Trigger | Conditions | Notes` table in §2.2 or in Appendix L (Appendix L has L.2 Buyer Referral, L.3 Pro Trial Seat, etc., but no Use Case / Requirement state machine). Convention #5 explicitly bars prose state descriptions. Promoted as **D-2-002** (P1).
- Convention #2 (acceptance criteria): §2.2 has guidance ("3–8 use cases", "50–200 requirements", "exactly one scorable outcome per requirement") but no numbered, testable acceptance criteria. Required by §13.10 / §14.9 / §17.8 / §20.7 pattern. Promoted as **D-2-003** (P2).
- Convention #10 (numerical singletons): "3–8 Use Cases", "50–200 requirements", "Target 50–200 total requirements per evaluation" — these limits collide with §39 (§39 has "Use Case | name | 200 chars", but the 3–8 / 50–200 quantity caps belong in §34.1.1 cells `Use Cases per Workspace` and `Requirements per Workspace`, which §39 cites by reference per the Phase 14.9 / Phase 2V D-2.4-002 mirror pattern). §2.2 inlines quantity guidelines that are plan-gated on Free tier (3 Use Cases per workspace per §34.1.1, per §47725 Appendix M note "Free: 3 per workspace"). The "3–8 Use Cases" guideline conflicts with the Free-tier hard cap of 3. Promoted as **D-2-004** (P1).
- Convention #4 (glossary): "Use Case", "Requirement", "Acceptance Criteria", "Granularity (Core / Important / Nice-to-Have)" all appear in §2.2 and across §10, §13, §19. Need to confirm each term is in Appendix K. Defer until verified.
- Counterfactual pass: (a) operator authors a requirement that bundles "and / or" — what does the platform do? §2.2 says "decompose it" but no enforcement; not a defect, just guidance. (b) operator authors fewer than 3 Use Cases on Free tier — §34.1.1 caps at 3 maximum (Free), but §2.2 says minimum 3 — Free-tier operator can't go below 3 OR above 3. Authored guideline is degenerate on Free. Reinforces **D-2-004**. (c) operator decomposes a Use Case into 200+ Requirements — §39 plan-gating governs; §2.2 is silent on overflow handling; not promoted (covered by §39).

## §2.3 Scoring Calibration

- Convention #2: prompt asks "Confirm scoring calibration has acceptance criteria." §2.3 has "Do / Don't" lists (§2.3.2) but no numbered, testable acceptance criteria. Promoted as **D-2-005** (P1).
- Convention #3 (enums): §2.3.1 introduces FM / PM / EJ scoring models and "Yes / No / Partial" answer values. These map to §4.3.4 `scoring_model` enum and §4.3.6 `score_value` enum per Appendix M (line 47726 / 47822). Spot-confirmed; not a defect.
- Convention #2 + #5: §2.3.1 says "For EJ scoring, provide a written scoring rubric (e.g., '5 = Moderate risk, 2-year relationship, regional support' vs. '3 = High risk, startup, no local presence')." This is an example, not a contract. Whether the platform enforces a rubric on EJ-scored requirements is undefined. §13.x does not mandate a rubric for `scoring_model=ej`. P2 silent edge case. Promoted as **D-2-006** (P2).
- Convention #14 (edge cases): §2.3.2 says "Allow anonymous or comment-free scoring" is a "Don't" — implying the platform should reject it. §13 does not enforce a comment requirement on EJ scores. P2. Promoted as **D-2-007** (P2).
- Counterfactual pass: (a) two SMEs disagree on EJ rubric — §2.6.3 escalation pattern applies; not a defect. (b) FM "Partial" with weight 5 vs FM "Yes" with weight 5 — how does the score aggregator weigh "Partial"? §13.7 governs; §2.3 is silent. Not promoted (covered downstream). (c) calibration session never happens — §2.3.2 says "Conduct calibration session" but there is no engine enforcement / Pulse trigger / phase-gate that asserts a calibration session ran. Promoted as **D-2-008** (P2).

## §2.4 Vendor Shortlisting

- Convention #1 / #8 (plan gating in §39): the prompt asks "Confirm vendor shortlisting has plan-gated thresholds in §39." §2.4.1 inlines vendor count thresholds ("10 vendors → 5–7 vendors → 1–2 finalists"). These are guidance, not enforcement. §39 / §34.1.1 cell **Vendors tracked** caps the underlying entity count by plan. §2.4 does not cite §39 / §34.1.1 for the upper bound. Inlining "10 vendors" without acknowledgment that Free tier may cap differently violates Convention #10. Promoted as **D-2-009** (P1).
- Convention #11 / consistency: §2.4 introduces "Phase 1: Initial Screening (Weeks 0–1)" and "Phase 2: Deep Evaluation (Weeks 2–6)" — these are *shortlisting phases*, but they collide terminologically with the §10 13-phase pipeline, where Phase 1 = Stakeholder Alignment and Phase 2 = Requirement Definition. The §10 cross-reference appears mid-paragraph ("Scoring during Phases 10–11 (see Section 10 for phase definitions)") but the §2.4 shortlist phase-numbering is never disambiguated. A reader pasted into §2.4 cannot tell whether "Phase 1" means a 13-phase pipeline phase or a §2.4 sub-stage. Promoted as **D-2-010** (P2).
- Convention #2: §2.4.2 has Keep / Drop criteria ("Covers ≥ 80% of Core requirements", "TCO within budget band ±20%") but these are not bound to acceptance-criteria style; they are shortlist heuristics. There is no numbered AC for the §2.4.1 shortlist phase advancement. Promoted as **D-2-011** (P2).
- Convention #14 (edge cases):
  - 0–9 vendors at Phase 1 entry — what does the platform do? §10.5 (Vendor Discovery & Outreach) is the §10 home; §2.4 is silent on too-few-vendors path. P2.
  - Vendor signals "lack of interest" — §2.4 says "Drop vendor if … Vendor signals lack of interest (slow RFI response, no availability for demo)" but there is no engine signal for "vendor signals lack of interest." Pulse Health Score (§20.3) does not enumerate this. Engine-side automation undefined. Promoted as **D-2-012** (P2).
  - "TCO > budget + 30%, AND no flexibility signaled in pricing discussion" — "flexibility signaled" is undefined. P2.

## §2.5 Evaluation Timeline Benchmarks

- Convention #10 (numerical singletons): the §2.5 table conflicts with §10.15 in three ways:
  1. Total: §2.5 = "4–6 weeks"; §10.15 = "10–20 weeks (2.5–5 months)". Direct contradiction. Promoted as **D-2-013** (P1).
  2. Phase grouping: §2.5 groups "Phase 1–3 (Planning) | 1–2 weeks"; §10.15 has Phase 1 = 1–3 weeks, Phase 2 = 2–5 business days, Phase 3 = 1–2 weeks (sum: ~2.4–5 weeks just for Phase 1–3). §2.5's "1–2 weeks" for the same range is ~half of the lower bound of §10.15. Promoted as **D-2-014** (P1).
  3. Phase labels: §2.5 says "Phase 4–5 (RFI)" — §10.5 says Phase 4–5 = Vendor Discovery & Outreach. §2.5's "RFI" label belongs to §10.5 only by stretch (RFI is one outreach instrument; vendor discovery is broader). §2.5 says "Phase 6–7 (Shortlist + RFP)"; §10.6 = Vendor Bidding Opens (not Shortlist), §10.7 = Vendor Response Refinement (not RFP). §2.5 says "Phase 10–11 (Scoring + Selection)"; §10.10 = Team Evaluation & Scoring, §10.11 = Score Review & Consensus, §10.12 = Selection & Recommendation — Selection is Phase 12, not 10–11. §2.5 says "Phase 12 (Close)"; §10.12 = Selection & Recommendation, §10.13 = Contract & Closure (Terminal). §2.5 *omits Phase 13 entirely*. Promoted as **D-2-015** (P1).
- Convention #11 (heading syntax): not violated; §2.5 anchors are well-formed.
- Convention #2 (acceptance criteria): §2.5 has none.
- Counterfactual pass: (a) buyer extends Phase 6 beyond §2.5's 1–2 weeks — §2.5 says guidelines are advisory ("Workspace Owner may compress or extend phases" — but that quote is from §10.15, not §2.5; §2.5 is silent on flexibility). (b) buyer compresses Phase 6 below the 7-calendar-day minimum (§10.6) — §2.5 does not flag the 7-day floor; §10.6 owns it. P2 inconsistency. Already covered by **D-2-015**.

## §2.6 Cross-Departmental Alignment

- Cohort semantics declared (§2.6.1) — confirmed; five cohorts named, engine-vs-surface contract documented for Solo Mode.
- Solo-mode suppression — the prompt asks "Confirm Solo-mode suppression in §44.6." §44.6.1 (Surface Hide List) covers AIWallet, rate card, per-AIOperation breakdown, FreeAllowanceCounter, contest CTA, cost-base banner, PostHog wallet diagnostics — but **does not include** stakeholder-cohort surface suppression. Cohort suppression is documented in §2.6.1 (line 1542 prose) and §2.8 (the canonical Solo-Mode landing) and Appendix M (line 47718). §44.6 is named "Solo-Tier Surface Treatment" which implies authoritative for *all* Solo surface treatment, but it scopes to AI consumption invisibility only. The scope mismatch is a documentation defect: a reader looking up "Solo-tier suppressions" expects §44.6 to enumerate all of them; they would miss cohort suppression. Promoted as **D-2-016** (P2 organizational / consistency_drift).
- Convention #2 (acceptance criteria): §2.6 has cadences and an escalation pattern but no numbered acceptance criteria. The escalation pattern (§2.6.3) names "15-min discussion" and "schedule a follow-up demo question" — not testable. No SLA-bound observable. Promoted as **D-2-017** (P2).
- Convention #5 (state machine): §2.6.3 escalation has implicit states (Pending Discussion → Pending Functional Lead Tiebreaker → Pending Vendor Clarification → Resolved) but no `From | To | Trigger | Conditions | Notes` table. Promoted as **D-2-018** (P2).
- Convention #3 (enum registration): §2.6.1 references the cohort enum strings `exec_sponsor`, `evaluation_lead`, `functional_lead`, `technical_evaluator`, `sme_evaluator`. Need confirmation in Appendix J. The §2.6.1 prose says "the cohort enum strings… are never displayed verbatim", implying engine enum exists; not confirmed in this audit. Promoted as **D-2-019** (P3 — verify and downgrade if registered).
- Counterfactual pass:
  - Auto-assignment heuristic misfires (e.g., a CFO is invited under a finance-team domain and is auto-assigned Functional Lead instead of Exec Sponsor) — §2.6.1 says the heuristic is "advisory" and the Workspace Owner can re-assign. P2 silent edge case (no SLA / re-trigger semantics). Promoted as **D-2-020** (P2).
  - Cohort assignment fails on email-domain mismatch (e.g., personal Gmail) — §5.9 governs, §2.6.1 cites §5.9 — not a defect.
  - Stakeholder churn (cohort owner leaves) — §2.6.1 silent. Reassignment story unspecified. P2. Promoted as **D-2-021** (P2).

## §2.7 Template Design Framework

- Cross-reference to §19: the prompt asks "Confirm §2.7 cross-references §19 Template Library." §2.7 has *no* cross-reference to §19. The phrase "Use Sourcera's Template Builder to auto-generate RFP from requirements" appears in §2.7.2 but no anchor. §2.8.8 cross-references §19 for "TCO Modeling, Q&A Threads, Templates" — but §2.7 itself does not. Promoted as **D-2-022** (P2).
- Structural mismatch §2.7 vs §19: §2.7 frames templates as RFI / RFP question structures (Vendor Background, Compliance & Security, etc.). §19 frames templates as Use Case + Requirement bundles (§19.3.2: "Included: Use Cases (name, description, weight), Requirements (title, description, type, category, weight)"). The §19 Template Library does not own RFI / RFP structure; §19.2.1 lists templates like "SaaS Security & Compliance" and "Cloud Infrastructure" — not RFI/RFP categories. The relationship between RFI/RFP templates (§2.7) and the §19 Template Library is unspecified. Two readings are admissible: (a) RFI/RFP templates are *also* §19 Template Library entries with a different `template_kind` enum; (b) RFI/RFP templates are a separate construct (Bid Request Template) authored elsewhere (§4.4.28 TemplateLibraryEntry on the Seller side?). Spec is silent. Promoted as **D-2-024** (P1).
- Convention #2: §2.7 has no acceptance criteria.
- Convention #11: heading syntax OK.
- Counterfactual pass:
  - Org has 0 templates (no Sourcera-seeded templates loaded due to seed failure) — §19.2.1 governs seed; §2.7 silent.
  - Custom template author bundles RFI + RFP into a single template — §2.7 says decompose; §19 has no `template_kind` field per the Master Spec excerpts read. Promoted as **D-2-025** (P2).
  - Template versioning interaction (§19.2.2) with §2.7 RFI/RFP framework — §2.7 is silent on whether RFI structure changes when an underlying §19 template versions. P2. Promoted as **D-2-026** (P2).

## §2.8 Single-Operator Mode

- Convention #2: §2.8.7 has 12 numbered acceptance criteria. Good.
- Convention #5: §2.8 has implicit state machine for `evaluation_owner_mode` (`solo` ↔ `team`) — transitions are documented in prose at §2.8.5 ("first stakeholder accepted into the Workspace does not auto-transition…") and §4.3.1 carries the field. Need confirmation that a `From | To | Trigger | Conditions | Notes` table exists. The §2.8.8 cross-reference to "§4.3.1 (Workspace): `evaluation_owner_mode` field, indexes, transition guards" implies §4.3.1 owns the table. Defer until §4.3.1 is read end-to-end (out of scope for this prompt; the audit checklist requires file but not adjacent verification). Marked **D-2-027** (P3 — verify).
- Convention #6 (APIs): §2.8 references the Phase Advancement API (§10.16) with the `soft_gates_enabled` request flag (AE-14.4-01) but the request/response example for `soft_gates_enabled=true` with `warnings` envelope has not been authored in §10.16 (line 12281 read end-to-end shows the existing `targetPhase`-only request). §10.16.1 still shows the v6.0.0 Convex-style request body, not v7.1's `soft_gates_enabled` extension. Promoted as **D-2-028** (P1 api_contract_gap).
- Convention #7 (webhooks): §2.8 introduces `phase_advanced_with_unmet_gates` (audit event, not webhook) and `workspace_evaluation_owner_mode_changed` (audit event, not webhook). Per §2.8.8, these are registered in Appendix C (Notification Event Catalog). Not webhooks per se — audit events. AE-14.4-02 / AE-14.4-06 still `pending`. Convention #7 not violated, but the webhook contract for these events (HMAC-SHA256, retry curve, DLQ) has not been authored as §31 webhook rows because they are audit events, not webhooks. Spec ambiguity: are they ALSO webhook events for external subscribers? Promoted as **D-2-029** (P2 webhook_or_audit_event_classification).
- Convention #8 (plan gating): `evaluation_owner_mode` defaults are plan-gated. §2.8.7 AC #1 states the default rules; §34.1.1 cell **Default `evaluation_owner_mode`** owns the value; §5.11 Notes carries the implication. Confirmed.
- Convention #9 (retention / DSAR / residency):
  - `evaluation_owner_mode` is on Workspace, retention follows Workspace retention (§40.2). Not separately stated.
  - The unmet-gate ledger banner ("{N} setup items were skipped under Solo Mode" — §2.8.3) is engine-derived from `phase_advanced_with_unmet_gates` audit events. The audit events follow §40.2 audit retention by tier. §2.8 is silent on this. Promoted as **D-2-030** (P2 retention_unspecified).
  - DSAR: `evaluation_owner_mode` is not PII; no DSAR touch. The `phase_advanced_with_unmet_gates.metadata.unmet_gates[]` payload may carry user_ids of cohort members blocking the gate. §6.8.1 DSAR cascade applies, but §2.8 is silent. Promoted as **D-2-031** (P2 dsar_unspecified).
  - Data residency: Workspace-bound; inherits Org `data_residency_region`. Not separately stated. Acceptable.
- Convention #10: §2.8 cites numerical limits via reference (e.g., "7-calendar-day minimum, §10.6"). Acceptable.
- Convention #11: heading syntax OK.
- Convention #12 (Appendix M): AC #11 says "Appendix M MUST contain a tightened, surface-bound row for Single-Operator Mode (the forward-reference row authored in Phase 14.2)." The closest row in Appendix M is line 47961 "Solo Mode pipeline compression — Buyer Solo plan default" which is Phase-14.6-bound (§3.14.1 surface), not specifically a "Single-Operator Mode" row. The `evaluation_owner_mode` row at line 47723 is the engine-concept row. There is NO row whose Engine Concept column is literally "Single-Operator Mode" — instead the §2.8 surface is distributed across a dozen Appendix M rows (Stakeholder Cohorts, Pulse Inbox, Pulse Health Score, Pulse Digest Email, SLA Timers, evaluation_owner_mode enum, Solo Mode pipeline compression, etc.). Whether AC #11 is satisfied depends on whether "tightened, surface-bound row" allows distribution. A literal reading of AC #11 is unmet. Promoted as **D-2-032** (P2 surface_engine_mapping).
- Convention #13 (console firewall): §2.8.6 explicitly covers firewall integrity. AC #10 enforces. Confirmed.
- Convention #14 (edge cases):
  - **First-time vs returning user.** §2.8.1 says "default surface path for first-time evaluation owners and for any Workspace whose owner is running the evaluation alone." This conflates two populations (first-timers + alone-runners) and is silent on the experience of a returning user creating a *second* Solo Workspace. Does the contextual-invite affordance still surface? Does the §13.13 "What we filled in for you" callout fire on every Workspace or first-only? §2.8.5 ("never an upfront setup step") does not address it. Per the prompt's mandate ("P1 for any §2.8 silent edge case"), promoted as **D-2-033** (P1 edge_case_silence — first-time vs returning).
  - **Solo + Defense View.** Solo gets the full Defense View per §13.11.4 / Appendix M line 47958. §2.8.2 Decide-step row references Defense View but does not state the gating outcome ("ungated for Solo"). §2.8.8 Phase-14.5 cross-reference acknowledges Defense View. Reasonable cross-reference; not a defect at P1 level. Marked **D-2-034** (P3 documentation_gap — explicit Solo-gating cite missing in §2.8.2).
  - **Solo + KB integration on the buyer side.** KB is seller-side (§22). Buyer-side has no KB. §2.8 is silent on KB; §22 is seller-only by §1.3 / §7.2 firewall. The silence is implicit but the audit checklist requires *explicit* coverage of Solo + KB. Not a P1 (firewall covers it structurally) but **D-2-035** (P3 documentation_gap — explicit "buyer Solo Mode does not interact with seller KB" cite missing).
  - **Solo + mobile.** §2.8 is silent on mobile parity. The four-step bar mobile rendering is a Phase 14.6 deliverable in `UX_Design_of_Sourcera.md` §5.2.19, but §2.8 says nothing about mobile divergence. Per the audit checklist, mobile divergence is a required edge-case dimension. Promoted as **D-2-036** (P1 mobile_divergence — silent in §2.8).
  - **Solo + soft-gate skip + retention of unmet-gate ledger.** Already promoted as **D-2-030**.
  - **Solo + concurrent edits to `evaluation_owner_mode`.** §2.8.5 covers automatic team transition on second non-guest membership, but the race condition (two stakeholders accepted simultaneously, both crossing the threshold) is unspecified. Optimistic locking on Workspace? §2.8 silent. Promoted as **D-2-037** (P1 concurrency).
  - **Solo + downgrade.** §44.6.7 #3 covers Solo → Free downgrade for billing surface. §2.8 is silent on `evaluation_owner_mode` behavior on plan downgrade (does Solo → Free preserve `solo` mode? Does Solo → Free force `solo` on existing `team` Workspaces? §2.8.1 says "subsequent plan changes do not auto-recompute the field" — this addresses upgrade, not downgrade explicitly). Promoted as **D-2-038** (P2 downgrade).
  - **Solo + console firewall + audit event leak.** AC #10 enumerates Console Bridge Event / Public Pricing API / Marketplace Listing exclusion. But the `phase_advanced_with_unmet_gates` audit event is workspace-scoped and seller-invisible by firewall, so this is fine. **However**, §44.6.5 telemetry events (`solo.envelope.throttling_engaged`, etc.) carry `console` and `plan_tier` and a Solo Org with both consoles operating could conceivably leak `seller_solo` metadata into a buyer-Solo customer's webhook subscription if not properly partitioned. §44.6.5 + §44.6.8 #8 enforces non-routing to customer subscribers; §2.8 is silent. Cross-checked; covered by §44.6.8 #8. Not promoted.
  - **Solo + DSAR** — covered above.
  - **Solo + locale / TZ.** §2.8.7 AC #5 specifies the deadline-countdown TZ rendering ("`User.timezone` falling back to `Org.timezone`") and the §M.5 CI gate `solo_deadline_countdown_renders_in_user_timezone` "to be added." The CI gate is **forward-referenced as not-yet-added** in AC #5. Per the prompt "(§M.5 — to be added)" — the CI gate is unwireable as written. Promoted as **D-2-039** (P1 ci_gate — forward-referenced, runtime-unwireable).

- Convention #4 / phase-tag accuracy:
  - §2.8.1 line 1607: "Default-on for Buyer Free and Buyer Solo (Phase 14.6) plan tiers." Buyer Solo plan-tier registration is Phase 14.9 (per AE-14.9-01 in `_integration/AUTHORED_EXTENSIONS_LEDGER.md`). Phase 14.6 was Pipeline Surface Compression. Phase-tag mismatch. Promoted as **D-2-040** (P3 documentation_drift).
  - §2.8.2 line 1611: "whose canonical step-to-phase mapping is authored in §3.14.1 (closed Phase 14.6)" — correct.
  - §2.8.7 AC #11 line 1672: "(Phase 14.4 deliverable)" — correct.
  - §2.8.8 line 1693 references "Phase 14.6a (Solo Plan Tier — pricing & entitlement) is the deferred Solo plan-tier introduction" — Phase 14.6a is the legacy name; Phase 14.9 superseded it per AE-14.9. Phase-tag drift. Promoted as **D-2-041** (P3 documentation_drift).

## §2 — Method-wide structural defects

- §2.1–§2.7 (the entire Method content excluding §2.8) lacks numbered, testable acceptance criteria. §2.8 has 12 ACs. Convention #2 requires every feature to have ACs. The Method-defining sections are *the* foundational contract for the rest of the spec; their absence of testable ACs is a Method-wide P1. Promoted as **D-2-042** (P1 acceptance_criteria — Method-wide).
- §2.1–§2.7 have no Glossary canonicalization confirmation. Terms used: Use Case, Requirement, Acceptance Criteria, Scoring Model (FM / PM / EJ), Granularity (Core / Important / Nice-to-Have), Stakeholder Cohort, Cohort, Evaluation Lead, RFI, RFP. Need Appendix K confirmation. Defer.

## AE-14.X Solo-Mode rows pending — confirmation

Per `_integration/AUTHORED_EXTENSIONS_LEDGER.md` (read 2026-05-04):

- **Phase 14.4 — Single-Operator Mode** (AE-14.4-01 .. 06): all 6 rows `pending`. ✅ Confirmed pending.
- **Phase 14.6 — Pipeline Surface Compression** (AE-14.6-01 .. 04): all 4 rows `pending`. ✅ Confirmed pending.
- **Phase 14.9 — Solo Plan Tier (Symmetric)** (AE-14.9-01 .. 12): all 12 rows `pending`. ✅ Confirmed pending.
- **Phase 14.10 — Solo-Tier Surface Treatment (§44.6)** (AE-14.10-01 .. 08): 4 rows `acknowledged` (01, 02, 03, 06), 4 rows `pending` (04, 05, 07, 08). Mixed status. The audit prompt says "AE-14.X rows tagged Solo Mode are still pending; confirm" — partially confirmed (most are pending; some 14.10 rows have advanced to acknowledged in line with Phase 14.10.1 / 14.14 landings).
- **Phase 14.14 (Cross-cutting)** AE-14.14-19 / 20 (Solo / Free overrides for §22.18.3.5 / §48.8.4 / §48.8.5): `acknowledged`.

Per the AE ledger release-gate policy (CLAUDE.md §16: "open `pending` rows must ratify before each version stamp"), the 22 Solo-Mode AEs that are still `pending` (6+4+12) gate v7.1.1. **D-2-043** (P2 authored_extension — 22 Solo-Mode AEs `pending` against v7.1.1 ratification gate).

---

## Self-challenge revision log

Re-read all defects 2026-05-04. Adjustments:

- **D-2-001** vs §10.15 ("These durations are guidelines, not requirements"). The §10.15 disclaimer suggests benchmarks are advisory. Does that resolve the §2.1 4–6 weeks vs §10.15 10–20 weeks contradiction? No — §2.1 states a *promise* ("compress 6–12 week evaluations into 4–6 weeks"), not a guideline; §10.15 says recommended baseline is 10–20 weeks. Promise contradicts baseline. Severity P1 confirmed.
- **D-2-002** state-machine: a hostile reviewer would argue "Use Case isn't a state-machined entity; it's just a CRUD entity." Counter: Use Case has at minimum a `validated_at` semantics in §10.4 and a Phase-12-locked semantics. Engine has implicit states. Convention #5 mandates the table even if implicit. P1 confirmed.
- **D-2-009** plan_gating-inline: a hostile reviewer might say §2.4's "10 vendors" is illustrative, not a contract. Counter: §2.4 is the Method's authoritative shortlisting strategy; downstream impl will read §2.4 as the requirement. Authoring Convention #10 forbids inline literal counts. P1 confirmed.
- **D-2-013/014/015** §2.5-vs-§10.15: re-checked. §2.5 phase labels and ranges are demonstrably from a pre-§10 12-phase model. §10 uses 13 phases. The §2.5 table was never reconciled. P1 across the board.
- **D-2-016** §44.6 organizational: a hostile reviewer might say §44.6 is correctly scoped to AI consumption invisibility per its own preamble, and cohort suppression is correctly in §2.6 / §2.8. Counter: the section's name is "Solo-Tier Surface Treatment" — broader than AI consumption invisibility. The narrower scope is documented in §44.6's preamble but the title misleads. P2 confirmed (organizational, not blocker).
- **D-2-022** §2.7-no-§19-cite: hostile reviewer — "templates section is general guidance; §19 is the storage layer; no cite required." Counter: every other §2.x section cross-references its implementing engine section. §2.7 should at minimum mention §19. P2 confirmed.
- **D-2-024** §2.7-vs-§19 structural mismatch: hostile reviewer — "RFI/RFP templates may be a future feature; §19 covers the current implementation." Counter: §2.7 describes RFI/RFP as if they are first-class platform constructs. §19 has no `template_kind` enum supporting RFI/RFP. The mismatch is a real engineering question. P1 confirmed.
- **D-2-033** first-time vs returning: hostile reviewer — "the spec covers the field, the rest is UI polish." Counter: §3.13 First-30-Seconds Test is a binding contract for Solo Mode (per §2.8.7 AC #2 and §2.8.8 cross-reference). The contract semantics for a returning user (who has *already* taken the 30-second test) are unspecified — does the contextual-invite affordance fire every Workspace? Does the seeded EvalStarter intake fire every Workspace? P1 confirmed (audit prompt explicitly requires P1 for §2.8 silent edge case).
- **D-2-036** mobile_divergence: hostile reviewer — "covered in `UX_Design_of_Sourcera.md` §5.2.19." Counter: §2.8 is the engine-side contract; mobile parity assertions belong in the engine-side AC list (per §2.8.7 AC #2 First-30-Seconds Test on the four-step bar — a panicked first-timer on mobile is a real persona). P1 confirmed.
- **D-2-037** concurrency: hostile reviewer — "optimistic locking is platform-default per §4." Counter: §2.8.5 describes the auto-team-transition trigger as "a second non-guest Workspace Membership… is accepted." The race when two acceptances arrive in the same transaction is unspecified. §2.8 is the surface contract for the transition; it should specify. P1 confirmed.
- **D-2-039** CI gate forward-reference: hostile reviewer — "AC #5 says 'to be added' — the gate is in the v7.1.1 backlog." Counter: per CLAUDE.md §16 "v7.1.1 backlog open" lists Phase 14.18.1 runtime wiring as backlog; if `solo_deadline_countdown_renders_in_user_timezone` is in §M.5 backlog, AC #5 is testable as a deferred CI-gate row. Severity downgrade rationale: the spec EXPLICITLY tags it as "to be added" — the runtime wiring is backlogged, not lost. **Downgrade to P2** on second pass. Adjusted.
- **D-2-042** Method-wide AC absence: hostile reviewer — "§2 is foundational philosophy; impl details live in §10 / §13 / §15 / §17 / §19 / §20 with their own ACs." Counter: §2.8 has ACs (12 of them); §2.1–§2.7 do not. Inconsistent treatment within §2. The Method-as-implemented surfaces are scattered across §10/§13/etc., but the Method *contract* is in §2. A junior engineer reading §2 cannot derive testable behavior. P1 confirmed.

## Counterfactual pass — three failure modes per audited block

Already inlined above. Summary: 36 confirmed defects (D-2-001 through D-2-043, with D-2-002 promoted to P1, D-2-039 downgraded to P2 in self-challenge).
