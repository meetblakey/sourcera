# Phase 11.2 — Appendix M.4 CI Gate Spec (Scratch Log)

**Phase prompt:** `Audit_Prompts.md` → Prompt 11.2 (`Walk §M.4`).
**Scope:** Master Spec v7.1.0 §M.4 (lines 49395–49432) plus its declared linkage to §M.2 process gates #1, #4, #7, §M.5 catalog (lines 49434–49571), and `_integration/AUTHORED_EXTENSIONS_LEDGER.md` rows AE-14.18.1-01 / -02.
**Defect-ID convention:** `D-11.2-NNN` (sequential per Defect Ledger format).
**Severity rule application:** P0 reserved for `Audit_Prompts.md` Severity Definitions rule (e) — "leaves a CI gate referenced in `Build_Execution_Strategy.md` runtime-unwireable as written" — and rule (b) "exposes PII or PCI scope to an unintended actor" (applied here as "lets an unintended customer surface ship as a hidden 'internal-only' construct"). P1 for "feature unbuildable as written: missing field-level schema, missing acceptance criteria, missing error code, missing webhook contract, missing retention/DSAR clause." P2 for "ambiguous in a way that two staff engineers would resolve differently." P3 for cosmetic / heading / anchor hygiene.
**Self-challenge revisions:** Three — logged inline at §6 below.

---

## 1. Sources Read End-to-End

- Master Spec §M.4 in full (lines 49395–49432) — every sub-subsection (M.4.1 Scope; M.4.2 Triggers; M.4.3 Failure mode; M.4.4 Override path; M.4.5 Audit trail; M.4.6 Authored Extension flag).
- Master Spec §M.2 Process Gates (lines 49373–49389) — all seven gates, since §M.4.1 says M.4 specifies the deploy-time enforcement contract for gates #1, #4, and #7.
- Master Spec §M.3 Authored Extension Note (line 49391–49393).
- Master Spec §M.5 catalog body (lines 49434–49571) — schema row, Phase 14.2 cluster (where M.4-adjacent gates live), `@ci-gate-override:` definitional paragraph (line 49567), V9 cluster override-path-not-permitted exemplars (lines 49537 / 49540 / 49546 / 49549 / 49554 / 49557).
- Master Spec changelog references to Phase 14.18 / Phase 14.18.1 / Phase 14.20 (lines 102–103, 181, 184, 49575).
- Master Spec inline §M.4 invokers — §4.7.1 forward-compatibility rule (line 7894), §6.8 DSAR cascade dual-trigger rule (line 10435), §M.1 Conformance Posture augmented-gate rule (line 31380).
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` rows AE-14.18.1-01 and AE-14.18.1-02 (lines 280–281).
- `_audit/DEFECT_LEDGER.md` rows D-11.1-001 through D-11.1-010 and the row/severity format header.
- `_audit/PHASE11.1_FINDINGS.md` §3.1–§3.9 (immediate prior-phase context for surface/engine mapping authoring conventions).
- `Audit_Prompts.md` Prompt 11.2 body (lines 2441–2461) + Global Conventions Preamble (lines 117–242) + Defect Ledger Format (lines 49–68) + Severity Definitions (lines 72–83).
- `CLAUDE.md` §16 Known Drift entries on `§M.4 CI gate is active; §M.5 runtime wiring is partial` and on "§M.4.4 / §M.4.5 nightly digest reviewer rotation" (v7.1.1 backlog item 11).

---

## 2. Check-by-Check Disposition

| Prompt Check | Disposition |
| :---- | :---- |
| 1. Trigger condition unambiguous ("what counts as a new engine concept introduction?"). | ❌ Failed — M.4.2 lists 7 concept classes, but detection scope is materially under-specified on five axes: (a) field-addition to existing entities not a trigger (contradicts §4.7.1 line 7894); (b) capability_id detector scoped only to §22.10 / §34.10 / §44.6 (misses §13.11, §13.12, §22.20, §50, §51); (c) plan-tier-feature detector scoped only to §34.1.1/.1.2/.1.3 (misses §34.8 entitlement matrix, §39 object size constraints); (d) capability (non-AI) "new feature heading under §13–§30" is hopelessly broad and admits false positives on reorganizational edits; (e) cosmetic-edit filter is "filtered by the parser" with no canonical rule. Filed `D-11.2-001`, `D-11.2-002`, `D-11.2-014`, `D-11.2-015`, `D-11.2-016`. |
| 2. Failure mode spec'd: status `appendix_m_coverage_on_diff: missing_row`, comment format defined. | ⚠ Partial — The two named statuses (`missing_row`, `invalid_override_rationale`) are concrete, but (a) the comment template uses the annotation form `@appendix-m-internal-only` while the M.4.4 parser requires the colon form `@appendix-m-internal-only:` — drift; (b) the `{concept_class}` / `{concept_name}` / `{spec_anchor}` placeholder semantics are not pinned (no canonical token form for `concept_name` of an enum value, for example); (c) the gate_outcome enum in M.4.5 (`pass | fail_missing_row | override_applied | fail_invalid_override`) collides on compound outcomes (mixed manual-row + override-applied PRs); (d) the comment-poster identity (github-app account, signing key) is not declared; (e) failure mode is silent on third-party outage (gate cannot post the comment); (f) gate_outcome enum not registered in Appendix J. Filed `D-11.2-003`, `D-11.2-005`, `D-11.2-006`, `D-11.2-019`, `D-11.2-020`. |
| 3. Override path: `@appendix-m-internal-only:` annotation spec'd per §M.4.4. Confirm rationale-substring requirement. | ❌ Failed — Two real defects: (a) **bypass vulnerability** — the override auto-generates an "internal-only" Appendix M row without cross-validating that the override target is actually internal-only; an author can ship a customer-visible surface behind a false "internal-only construct, not surfaced" claim, and the gate passes and merges (Phase 14.19 review is post-merge); (b) **override-keying ambiguity** — the override line is keyed by `{concept_name}` only, but identical concept names can exist across different concept classes / anchors (e.g., an enum value and a field name sharing a token), so the binding from override line to triggered concept is non-unique. Additional drift: §M.5 declares a sibling annotation `@ci-gate-override:` with conflicting rationale-format specs (M.5 line 49440 "same rationale-format constraint as M.4.4" vs M.5 line 49567 "≥ 30 chars + Gate ID match" vs AE-14.18.1-02 "≥ 30 chars; gate ID in M.5 must match"). Filed `D-11.2-004` (P0), `D-11.2-010`, `D-11.2-011`, `D-11.2-017`, `D-11.2-018`. |
| 4. Audit-trail emitter spec'd. | ❌ Failed — M.4.5 lists fields and the `gate_outcome` enum but omits everything load-bearing: (a) **log destination** (PostHog? Datadog? Convex audit table? §4.6.1 AuditEvent? spec-repo git history?); (b) **serialization format** ("structured log entry" is hand-waving); (c) **retention TTL** — "lifetime of the spec repo" is not §40.2 compatible; (d) **DSAR cascade behavior** — `pr_id` and override rationale text can identify authors and contain PII; (e) **idempotency on re-run**; (f) **schema-stability commitment** if the CI provider migrates; (g) **PII redaction policy** on rationale text. Filed `D-11.2-007`. |
| 5. Nightly digest spec'd. | ❌ Failed — "Posts a digest to the integration channel for human review" is a single sentence and omits: destination identifier (Slack channel ID, MS Teams URL, email DL — CLAUDE.md §16 records this as Phase 14.20-closeout-deferred → v7.1.1 backlog), cron schedule + timezone, reviewer rotation, reviewer SLA, action on missed review, failed-job alarming, digest format / template, retention divergence between log store and channel store. Filed `D-11.2-008` (P1, channel destination undefined at v7.1.0 stamp time), `D-11.2-009` (P2, everything else). |
| Cross-cutting — §M.4 catalog registration in §M.5. | ❌ Failed — §M.5 self-describes (line 49436) as "the canonical registry of every CI gate authored as a forward-reference during the v7.1.0 Surface-Abstraction & Dual-Maya Integration program (Phases 14.1 through 14.10 plus 14.17)" but Phase 14.18 (which authored `appendix_m_coverage_on_diff`) is not in the catalog table. CLAUDE.md §16 counts §M.4 as one of the "4 gates runtime-active at v7.1.0" but the gate has no §M.5 row — no `Gate ID / Source phase / Scope / Trigger / Failure mode / Authority anchor` row at §M.4 fidelity. Filed `D-11.2-012`. |
| Cross-cutting — §M.4 Authored Extension ledger registration. | ❌ Failed — §M.4.6 declares §M.4 itself as an Authored Extension introduced in Phase 14.18. No AE row exists in `_integration/AUTHORED_EXTENSIONS_LEDGER.md` for §M.4 (only AE-14.18.1-01 / -02 for §M.5). Per CLAUDE.md §13 rule 4 every Authored Extension requires a ledger row. Filed `D-11.2-013`. |
| Cross-cutting — §M.4 sub-subsection heading anchorability. | ❌ Failed — §M.4.1 through §M.4.6 are rendered as bold-prose pseudo-headings (e.g., `**M.4.1 Scope.**`), not as anchored Markdown sub-headings. Authoring Convention #11 (CLAUDE.md §11) requires `## N.N Title {#n.n-title}` with anchor slugs. Cross-references from other sections ("per §M.4.4") cannot resolve to a deep anchor — they resolve only to `#appendix-m-ci-gate` (the §M.4 parent anchor). Filed `D-11.2-021`. |
| Cross-cutting — runtime-status contradiction. | ⚠ Partial — §M.4.6 says §M.4 is "enforced through code review discipline" until Phase 14.18 wiring artifacts ship in the spec-repo CI pipeline, and that Phase 14.20 closeout audits the wiring as part of the v7.1.0 stamp gate. CLAUDE.md §16 claims §M.4 is "runtime-active at v7.1.0." The Master Spec records that v7.1.0 stamped 2026-04-28 (line 49575) but does not record the OUTCOME of the Phase-14.20 §M.4 wiring audit. Either M.4.6 is stale or CLAUDE.md is wrong — the spec is silent on which. Filed `D-11.2-022`. |

---

## 3. Counterfactual Pass (per Opus mandate)

Three realistic failure modes the §M.4 spec must handle:

1. **Adversarial override.** Author writes `@appendix-m-internal-only: visible_to_customer_thing — internal-only construct, not surfaced (false claim)`. Gate auto-generates an "Internal-only, never surfaced" Appendix M row, passes, merges. Nightly digest reviewer catches it next day — IF they read the digest, IF they recognize the concept name. The merge is in. No rollback path is specified. ❌ Spec does not address. Covered by `D-11.2-004` (P0).

2. **Concurrent diffs into the same Appendix M area group.** Two PRs A and B each invoke `@appendix-m-internal-only:` on different concepts. Both auto-generate rows under the same area-group banner. Merge order produces a structural merge conflict on the M.1 table. Conflict-resolution rule is undefined. ❌ Spec does not address. Covered by `D-11.2-017`.

3. **CI provider degradation.** GitHub API is degraded; the gate cannot post the inline review comment. M.4.3 is silent on fail-open / fail-closed default and on retry-with-backoff. The audit-trail emitter is also silent on whether the failed-comment-post produces a log entry. ❌ Spec does not address. Covered by `D-11.2-020`.

Fourth bonus failure mode (recorded for completeness, not separately defected; subsumed under `D-11.2-016`):

4. **Heading anchor renames.** A cosmetic edit that renames a section anchor (e.g., `{#feature-x}` → `{#feature-x-v2}`) is treated by a literal parse-tree diff as a structural insertion (new anchor) and a structural deletion (old anchor). M.4.2's cosmetic-edit filter is unspecified, so the gate may false-positive on every anchor-rename PR.

---

## 4. Defects (Promoted to `DEFECT_LEDGER.md`)

`D-11.2-001` through `D-11.2-022` — 22 defects total. Severity split: 1 P0 / 12 P1 / 8 P2 / 1 P3.

Clustering by §M.4 sub-subsection:

| Sub-subsection | Defects |
| :---- | :---- |
| §M.4.2 Triggers | `D-11.2-001`, `D-11.2-002`, `D-11.2-014`, `D-11.2-015`, `D-11.2-016` |
| §M.4.3 Failure mode | `D-11.2-003`, `D-11.2-019`, `D-11.2-020` |
| §M.4.4 Override path | `D-11.2-004`, `D-11.2-010`, `D-11.2-011`, `D-11.2-017`, `D-11.2-018` |
| §M.4.5 Audit-trail emitter | `D-11.2-005`, `D-11.2-006`, `D-11.2-007` |
| §M.4.5 Nightly digest | `D-11.2-008`, `D-11.2-009` |
| §M.4.6 / cross-cutting | `D-11.2-012`, `D-11.2-013`, `D-11.2-021`, `D-11.2-022` |

---

## 5. Coverage Matrix Cell Prescription

Per the audit doctrine the matrix is feature-scoped; §M.4 itself is not a discrete feature-inventory row (the closest seed is `F-806 CI Gate Catalog` referenced in the matrix preamble's seeding doctrine). Cell tightening prescription queued to the v7.1.1 hygiene mechanical pass alongside Phase 1.1 / V1.3 / Phase 8.1 residuals:

- **F-806 (CI Gate Catalog, §M.5)**: `ci_gate_coverage` ✅ → ⚠ — D-11.2-012 establishes that the catalog itself omits `appendix_m_coverage_on_diff`; CI-gate-coverage convention is violated by §M.5's claim to be the canonical registry while excluding its own deploy-time enforcement gate.
- **F-AE-* rows referencing AE-14.18.1-01 / -02**: `authored_extension_status` ⚠ holds (still `pending` per AE ledger). D-11.2-013 introduces a new AE requirement (AE-14.18-XX for §M.4 itself); on AE-row landing, cell may further degrade until ratification.
- **All cells referencing the `appendix_m_coverage_on_diff` gate as their coverage proof** — §4 entities (per the M.4.2 #1 trigger rule), §4.7.1 forward-compatibility rule (line 7894), §6.8.4 DSAR cascade dual-trigger rule (line 10435), §M.1 Conformance Posture augmented gate (line 31380): downstream phases relying on `appendix_m_coverage_on_diff` as their proof-of-coverage should be cross-aware that the gate has runtime-status ambiguity (D-11.2-022) and trigger-scope gaps (D-11.2-001 / -002 / -014 / -015). No automatic cell change; flagged for cross-phase awareness only.

The Phase 11.2 Update block is appended to `COVERAGE_MATRIX.md` Run Summary in the same change as this scratch log.

---

## 6. Self-Challenge Revisions

**Revision #1.** Initial draft classified the override-bypass as P1 (`feature unbuildable as written`). On hostile-reviewer re-read: the rule (a) in Severity Definitions covers "breaks the buyer/seller console firewall" and rule (b) covers PII exposure. A surface that ships hidden behind a false `@appendix-m-internal-only:` claim violates M.2 process gate #6 ("a surface that appears for a tier listed in this column is a P0 defect") and could exfiltrate a buyer-only surface to a seller-console session, which is firewall leakage. Promoted to P0 (`D-11.2-004`). Rule (a) is the cited basis.

**Revision #2.** Initial draft filed the §M.5 sibling-annotation rationale-format conflict under §M.5 scope. On re-read of the prompt scope ("Walk §M.4"), the conflict materially affects §M.4.5 nightly-digest aggregation: the digest aggregates `override_applied` runs, but if there are two override-annotation grammars in use (the M.4.4 `internal-only construct, not surfaced` substring rule and the M.5 `≥ 30 chars + Gate ID match` rule), the aggregator's parser cannot deterministically classify which rule applies on a given annotation line. Defect re-anchored at §M.4 / §M.5 interface and retained as `D-11.2-011` P1.

**Revision #3.** Initial draft filed the heading-anchor sub-section defect as P2 (`ambiguous in a way that two engineers would resolve differently`). On re-read of Authoring Convention #11 ("Heading syntax. Preserve Master Spec heading format: `## N.N Title {#n.n-title}` with anchor slugs"), this is a literal convention violation, but the violation does not materially change implementation. Severity held at P3 (`D-11.2-021`) per the P3 rule ("cosmetic, terminological, or documentation drift that does not affect implementation but reduces spec hygiene"). However, cross-references from other parts of the spec to "per §M.4.4" cannot resolve — they degrade to the §M.4 parent anchor — which a hostile reviewer might escalate to P2. Held at P3 with a note for Phase V11 to re-litigate.

---

## 7. Sign-Off

Phase 11.2 walk complete. 22 defects filed. Self-challenge pass and counterfactual pass complete. Cross-cutting findings on §M.5 catalog completeness, AE ledger registration, sub-subsection anchorability, and runtime-status contradiction recorded as `D-11.2-012` / `-013` / `-021` / `-022`. P0 defect `D-11.2-004` (override bypass vulnerability) per Severity Rule (a) — surface that ships as hidden internal-only construct via false claim breaks the §1.3 console firewall integrity.

Phase 11.3 (Appendix M.5 37-Gate Catalog Coverage) is the next prompt and inherits `D-11.2-011` (override-grammar drift) and `D-11.2-012` (M.4 absent from catalog).
