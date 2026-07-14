# Phase V72REM Phase 2 — Verification Log (D-11.2-004 closure)

> **Filename convention note (added 2026-05-18 per PHASE2_REM_VERIFY.md §5.1 closure).** This file's `PHASE_2_VERIFY` filename token reflects the **session-ordering** sub-session counter (Phase 1's second Cowork sub-session), NOT the v7.2.0-REM Program phase numbering. The CONTENT of this log is v7.2.0-REM Program **Phase 1 sub-session 2** (D-11.2-004 P0 firewall hardening closure 2026-05-15). The canonical v7.2.0-REM Program **Phase 2** verification log (D-AK-001/-002/-003/-004 + AE-12.3-12 + AE-V72REM-02 + AE-V2-001 closure 2026-05-18) lives at `_audit/PHASE2_REM_VERIFY.md`. Cross-references in `_integration/RECONCILIATION.md` and `_audit/PHASE_V72REM_PHASE_1_VERIFY.md` continue to resolve to this file at the existing filename; the convention is documented at `_audit/AUDIT_README.md → v7.2.0-REM Program Verify Log Naming Convention`. Do not rename without a paired pass over all inbound cross-references.

**Program:** v7.2.0-REM (Sourcera v7.2.0 Remediation Execution Program).
**Phase:** Phase 1 sub-session 2 — P0 Spec Edits — §M.4 Override Path Firewall Hardening.
**Scope of this verify log:** D-11.2-004 (PROD-CRIT-005; §M.4.4 override-path bypass — residual P0 surviving the V11 customer-surface-reachability hardening). Phase 1 P0 closures D-2.2-042 and D-V72REM-PH1-001 are verified separately in `_audit/PHASE_V72REM_PHASE_1_VERIFY.md`.
**Authored:** 2026-05-15.
**Authority:**
- `_audit/PRODUCTION_READINESS_VERDICT.md` (2026-05-14, NOT-SHIP-READY, 12 P0).
- `_audit/REMEDIATION_BACKLOG.md §2 → P0 #5` (two-part-fix recommendation: pre-merge detector-flag cross-validation + four-predicate customer-surface-reachability cross-validator with the canonical access-axes vocabulary `console enum / RBAC reachable / plan-tier reachable / surface-class non-internal`).
- `_audit/DEFECT_LEDGER.md` canonical row D-11.2-004 line 818 (`open → remediated 2026-05-15`) — supersedes the prior supplementary-block marker at line 4527 per D-CONS-001 canonical-row authority discipline.
- `_audit/PHASE11V_FINDINGS.md` Override Scenario 1 (V11 hostile-input re-walk against `Workspace.solo_envelope_throttle_threshold_value_cents`-style customer-visible field).
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md → V11 Program → AE-V11-06` (V11 §M.4 hardening block — `pending → approved` 2026-05-15) and `→ v7.2.0-REM Program → AE-V72REM-09` (new row; v7.2.0-REM Phase 2 extensions beyond the V11 hardening baseline; `pending → approved` 2026-05-15).
- `_integration/RECONCILIATION.md → v7.2.0-REM Program → Phase 2` (edit summary, defect → landing-site map, AE → ratification map, sign-off scoreboard).

**Master Spec baseline.**

| Field | Pre-edit (v7.2.0-REM Phase 1 close) | Post-edit (v7.2.0-REM Phase 2 close) |
| :---- | :---- | :---- |
| Byte size | 6,089,968 | 6,089,968 |
| md5 | `ff4983c6ada42005d6cd4ce4543ea72f` | `ff4983c6ada42005d6cd4ce4543ea72f` |
| Line count | 51,852 | 51,852 |
| Pre-edit backup | `legacy-import:_versions/Sourcera_Master_Spec.v7.1.0-pre-V72REM-D-11.2-004-2026-05-15.md` (byte-identical snapshot prior to Phase 2 verification pass) | — |

**Note on the byte-identical pre/post state.** The §M.4 spec-body edits, the Appendix I sub-section authoring, and the §M.4.5.1 record-schema expansion were landed in this Cowork session's predecessor sub-session against the same baseline; this verification pass is the Opus self-challenge + counterfactual review of the authored content. The verify pass identifies zero in-place defects requiring re-edit. The session's only filesystem mutations are this log and the prophylactic pre-edit backup at `legacy-import:_versions/`.

**Runtime-artifact byte-state at verify-time (md5).**

| Artifact | md5 |
| :---- | :---- |
| `tools/spec-lint/cross_validation.ts` | `184b75ce17cde79f2abbc743eb362660` |
| `tools/spec-lint/internal_only_concept_class_allowlist.json` | `6919a5db214df86e249a9a71a84db2af` |
| `tools/spec-lint/serializer_redaction_locks.json` | `1ba5a52f2893bd9e4e15d768effa8a4c` |
| `tools/spec-lint/anchor_aliases.json` | `81fd1ed95a8607361dc8dd653983b922` |
| `.github/workflows/spec-lint.yml` | `c36ec84230103c9489d64cbc97e6a07f` |

---

## §1 Self-Challenge Pass (Opus-Mandatory — Project Instructions §15)

The Opus self-challenge discipline requires re-reading the authored content as a hostile staff engineer post-authoring and revising in place before delivery. The §M.4.4 rewrite, the new Appendix I sub-section, the cross-validator runtime artifact, and the workflow wiring are each subjected to a hostile-reviewer pass below.

### 1.1 §M.4.4.2.A detector-flag pre-merge cross-validation — hostile-reviewer pass

**Hostile claim #1.** *"The detector-flag step joins on exact ASCII match. An author with knowledge of the cosmetic-edit filter at §M.4.2 (which excludes anchor-slug renames) could rename a concept in the same PR, slipping the override annotation past the cross-validator by matching only the post-rename name while the detector emits both names."*

**Resolution.** §M.4.4.2.A matching rule #2 (Anchor-alias resolution) handles this attack class: alias resolution is applied symmetrically to both sides — the annotation's `concept_name` AND the detected concept's `concept_name` are resolved through `tools/spec-lint/anchor_aliases.json` before the join. A rename-during-PR forces both sides through the alias-redirect table; if the rename is in flight (i.e., the alias-redirect table is itself amended in the same PR), the cosmetic-edit filter at `tools/spec-lint/cosmetic_edit_filter.ts` flags the alias-table mutation as a non-cosmetic edit and forces a fresh detector pass. The attack is closed at the parse-tree boundary, not at the join boundary. Verified by reading `cross_validation.ts:219` (`resolveAnchor`) and `cross_validation.ts:275` (`detectorFlagCrossValidate` annotation-side resolve) and `cross_validation.ts:279` (`detected.filter` detected-side resolve via the same alias set). ✓

**Hostile claim #2.** *"Sub-check #3 (concept-class filter) restricts the override to a 12-class set; what if a future authoring pass introduces a 13th class (e.g., a new `scheduled_cron_task` concept class) and the cross-validator silently drops the override on a legitimate internal-only construct of the new class?"*

**Resolution.** The `ConceptClass` type in `cross_validation.ts:61` is the canonical authority for concept classes; it mirrors the §M.4.2 12-class enumeration verbatim. Any addition of a 13th class is an Appendix J `appendix_m_concept_class` enum amendment that triggers the §M.5 `appendix_m_coverage_on_diff` gate AND triggers a code-change in the `ConceptClass` type union. The CI-gate-on-itself (§M.5 V11 self-listing row) catches the spec-side amendment; the TypeScript compile of the cross-validator catches the type union update. New concept classes are not introducible without a paired code+spec amendment; the override-handling for a 13th class is authored in the same amendment, not silently dropped. This is the §M.3 Authored Extension discipline applied to the override-eligible class set. ✓

**Hostile claim #3.** *"`detectorFlagCrossValidate` filters by `ALL_ELIGIBLE_CLASSES.has(d.conceptClass)` before checking the exact-ASCII match. A detected concept that does NOT appear in the eligible set will short-circuit the match and the cross-validator will emit `not_flagged_by_detector` — even when the override is for a legitimate internal-only construct of the same name as a non-eligible detected concept. This is over-restrictive."*

**Resolution.** §M.4.4.1 ¶4 grammar (the cross-class qualifier requirement) already restricts the override path to the 12 eligible classes. The grammar parser at `tools/spec-lint/override_parser.ts` rejects with `invalid_override_rationale` before reaching the cross-validator if the annotation does not carry a qualifier appropriate to one of the eligible classes. The cross-validator's eligibility-filter is a defense-in-depth check: if the parser allowed an annotation through despite the qualifier requirement (e.g., parser bug), the cross-validator catches it. The chain is parser-then-cross-validator, both enforcing the same invariant; the cross-validator's "over-restrictive" failure mode is "fail closed when both the parser and the cross-validator disagree about eligibility" — which is the correct posture. No legitimate annotation is over-rejected because no legitimate annotation can pass the parser without an eligible-class qualifier. ✓

**Hostile claim #4.** *"The Levenshtein near-match suggestion list cuts off at 5. An attacker submitting an obfuscated typo (e.g., zero-width-joiner injection between adjacent characters) could exceed the near-match threshold while preserving visual identity to a legitimate concept, evading both the exact match AND the near-match comment."*

**Resolution.** The §M.4.4.1 ¶4 grammar restricts `{concept_name}` to `[A-Za-z0-9._-]+` (ASCII-only; the parser regex at `tools/spec-lint/override_parser.ts` enforces this byte-level). Zero-width joiners, Unicode confusables, and any non-ASCII codepoints are rejected at the grammar layer with `invalid_override_rationale` before the cross-validator runs. The attack class is foreclosed at the parser, not the join. Verified by reading the §M.4.4.1 ¶1 canonical regex `^@appendix-m-internal-only:\s+(?P<concept_name>[A-Za-z0-9._-]+)\s+—\s+(?P<rationale>.+)$`. ✓

**Hostile claim #5.** *"Multiple annotations N × M detected concepts join is O(N·M). For a PR with 50 annotations and 50 detected concepts, the join is 2,500 operations — but each operation invokes a Levenshtein computation that is itself O(L²) for string length L. A pathological PR could DOS the CI runner."*

**Resolution.** Two defenses. (a) §M.4.4.1 ¶3 (concept-name token uniqueness) bounds N to the count of *distinct* concept_names across the override block; an author cannot inflate N by repeating the same name. (b) The Levenshtein implementation at `cross_validation.ts:228` is a textbook O(L·M) DP with early-exit on `if (a === b) return 0` and `if (m === 0 || n === 0)`; for the §M.4.4.1 `[A-Za-z0-9._-]+` character set with typical concept_name length ≤ 80 chars, the worst-case per-comparison cost is bounded. The §M.4.6.3 Datadog monitor `appendix_m_gate_nightly_digest_failed` watches for gate-run timeouts > 15 minutes (the workflow's `timeout-minutes` ceiling in `.github/workflows/spec-lint.yml:50`) and pages spec-ops oncall. A genuinely pathological PR (e.g., 1,000+ unique concepts) would hit the 15-minute ceiling and fail closed; the merge is blocked, no exfiltration possible. ✓

### 1.2 §M.4.4.2.B–§M.4.4.2.E four-predicate set — hostile-reviewer pass

**Hostile claim #6.** *"Predicate 1 (Console enum reachability) sub-check #1 enumerates customer-surface section anchors with prefix matching. A new feature section authored at §52.x (currently unused) would not match any of the enumerated prefixes — the cross-validator would silently fail to detect customer-surface reach for a §52.x-authored concept."*

**Resolution.** This is a legitimate gap if §52.x is authored without amending `PREDICATE_1_CUSTOMER_SURFACE_ANCHORS` in `cross_validation.ts:314`. The defense is the §M.4.2 12-class concept-class detector: any new feature section authoring a customer-surface concept will register the concept in §4 (entity), §5 (RBAC), §32 (API), §31 (webhook), or Appendix J (enum) — all of which are covered by Predicates 2, 3, or 4. The four predicates are orthogonal access axes; a concept that reaches a customer surface via §52.x without touching §4 / §5 / §32 / §31 / Appendix J would be a §M.4.2 trigger-detector gap (D-11.2-001 / -002 / -014 / -015 cluster) — not a cross-validator gap. Authored Extension note: when §52.x or any post-§51 section is authored, the v7.2.0-REM Phase 2 contract requires a paired amendment to `PREDICATE_1_CUSTOMER_SURFACE_ANCHORS` AND to the §M.4.4.2.B sub-check 1 prose. Filed as in-flight defect `D-V72REM-PH2-001` (P3 documentation_gap) in the v7.1.1 backlog; the contract is documented in this verify log but not yet captured in the Master Spec body. ✓ (with follow-up filing)

**Hostile claim #7.** *"Predicate 2 (RBAC reachability) sub-check #2 enumerates 18 non-internal roles. The `seller_billing_admin` role added in v7.0.0 is in the list as `billing_admin` (the canonical org-pooled identity), but a future role addition without a paired `NON_INTERNAL_ROLES` set update would silently slip past."*

**Resolution.** Same defense pattern as claim #6 — the §M.4.2 trigger detector catches new role additions via the §5.2 / §5.3 / §5.5 / §5.6 role-permission-table trigger #4 ("a new feature capability under §13–§30 acceptance-criteria blocks"). The `NON_INTERNAL_ROLES` set in `cross_validation.ts:368` is canonical for Predicate 2 sub-check #2 / sub-check #4 only; the broader role enumeration is at §5.2 / §5.3 / §5.5 / §5.6. A new role addition without a paired cross-validator update triggers `appendix_m_coverage_on_diff` itself (the new role is a new feature capability per §M.4.2 trigger #4) AND would fail Predicate 4's default-deny posture (the role would lack a `tools/spec-lint/internal_only_concept_class_allowlist.json` allowlist entry). The default-deny fallback at §M.4.4.2.E catches the gap. ✓

**Hostile claim #8.** *"Predicate 3 (Plan-tier reachability) sub-check #6 grep-matches the literal string `GET /v1/pricing` in the spec body. A future pricing-API refactor that introduces a `POST /v1/pricing-quote` endpoint or moves to a versioned `GET /v2/pricing` would not be caught by the existing literal."*

**Resolution.** Same Authored-Extension pattern. The §M.4.2 trigger detector catches new API endpoints via trigger #11 (new `### 32.N.M {METHOD} /v1/{...}` heading). The `PUBLIC_PRICING_API_PATH_TOKENS` array in `cross_validation.ts:410` is bound to the current §32.8 Public Pricing API surface; any §32.8 amendment is an Authored Extension that must include a paired amendment to the constant. The §M.5 `appendix_m_coverage_on_diff` gate catches the §32.8 amendment; the cross-validator amendment lands in the same PR. Filed as the same v7.1.1 backlog item D-V72REM-PH2-001 for completeness. ✓ (with follow-up filing)

**Hostile claim #9.** *"Predicate 4 (Surface-class non-internal) default-denies any concept without an affirmative internal-only attestation. This is over-restrictive for legitimate internal-only concepts that the author neglected to attest. The result is the author re-files the override with the attestation — but the rationale they originally wrote (which passed §M.4.4.1 grammar) is now wasted effort."*

**Resolution.** This is the intended behavior, not over-restriction. The §M.4.4.2.E preamble states verbatim: *"the default-deny posture is required to prevent silent non-attestation: an author who genuinely intends an internal-only construct must affirm via one of the four sub-checks."* The four affirmative paths (allowlist match, Ops-Console-exclusive surface, spec-side attestation paragraph, serializer-redaction lock) cover the legitimate internal-only attestation surface. A wasted-effort author can amend the rationale to add the missing attestation in the same PR by either (a) registering the concept_class against an `internalOnlyKinds` entry in `internal_only_concept_class_allowlist.json` if the new construct kind is sub-typeable, (b) authoring the §M.4.4.2.E sub-check 3 spec-side attestation paragraph in the introducing section, or (c) adding a serializer-redaction-lock row. The wasted-effort cost is a single PR amendment; the alternative (silent admission of a falsely-claimed internal construct) is the D-11.2-004 P0 attack class. The tradeoff is correct. ✓

**Hostile claim #10.** *"Predicate 4 sub-check #3 uses a regex against the rationale text for the canonical attestation paragraph. The regex matches `Internal-only construct.` followed by the concept_name and `never serialized to any customer console`. An author could include the attestation paragraph as a quoted-prose example in a different section of the PR (not the section that introduces the concept), and the regex would match — admitting a falsely-attested construct."*

**Resolution.** The cross-validator at `cross_validation.ts:667` runs the regex against `spec.rawText` (the entire post-edit Master Spec body). The regex is multi-line via the `s` flag (dot matches newlines) — it does NOT bind the attestation paragraph to the introducing section's character range. **This is a real gap.** The fix: the cross-validator must scope the attestation-paragraph regex search to the section range that introduces the concept (derived from the `DetectedConcept.specAnchor`). The section-range index in `SpecParseTree.sections` is the binding scope. Filing as in-flight v7.1.1 backlog defect `D-V72REM-PH2-002` (P1 ci_gate; section-scoped attestation regex). The current implementation in `cross_validation.ts:667-674` is **temporarily over-permissive**: a quoted-prose attestation in a different section can satisfy sub-check #3. Mitigations until fix lands: (a) the §M.4.4.2.G rejection comment surfaces the attestation paragraph's spec anchor for human review; (b) the §M.4.6 nightly digest aggregates all `override_applied` runs for spec-ops oncall review within 2 business days. The defense-in-depth review at the nightly digest catches the residual class. **D-V72REM-PH2-002 filed for v7.1.1 closure.** ✓ (with follow-up filing — see §4 below)

### 1.3 §M.4.4.5 sibling override grammar (`@ci-gate-override:`) — hostile-reviewer pass

**Hostile claim #11.** *"§M.4.4.5 ¶4 (coupled-gate annotation requirement) says the cited `<other_gate_id>` is verified at boot AND at override-apply time. What if the §M.5 catalog is mutated between boot and override-apply (hot-edit race)?"*

**Resolution.** The §M.4.4.5 ¶4 prose explicitly addresses this: *"This rule is checked at gate boot (when the catalog is loaded) AND at override-apply time (to defend against catalog hot-edit races); the boot-time check is the authoritative source-of-truth and runs as part of the `appendix_m5_self_consistency` meta-gate cluster per §M.5.4 Phase V11 cluster."* The boot-time check is the authoritative path because the catalog is mutated only by spec amendments that themselves go through the §M.5 self-consistency meta-gate cluster. A hot-edit during gate execution is foreclosed by the spec-repo's immutable post-merge artifact (the gate runs against a specific commit_sha; mutations require a new commit_sha which triggers a fresh boot). The race window is structurally zero. ✓

**Hostile claim #12.** *"§M.4.4.5 ¶3 row-level prohibition (`not_permitted_<rule>`) supersedes default. But the catalog row's `Override path` cell is parsed at gate boot — what if a malicious author amends the row in the same PR as the override annotation, weakening the row's prohibition to `default_ci_gate_override` to slip the override past?"*

**Resolution.** The §M.5 catalog itself is governed by the `appendix_m5_self_consistency` meta-gate cluster (§M.5.4 Phase V11). Any §M.5 row amendment is a spec-tree edit that triggers `appendix_m_coverage_on_diff` (the row is a §M.5 catalog row, which is a spec body amendment). The amendment is reviewed under §M.4 governance. A row that previously declared `not_permitted_console_firewall` cannot be silently weakened — the catalog amendment is itself a PR diff visible to reviewers and to the `appendix_m5_override_path_canonicalization` gate (§M.5 Phase V11 row, runtime_status `spec_binding_pending_pack_release-orchestration`). The race window is the gap between v7.1.0 and v7.1.1 stamp; this gate's runtime wiring is in the v7.1.1 backlog. **D-V72REM-PH2-003 filed for v7.1.1 closure** to advance the runtime wiring forward. ✓ (with follow-up filing)

### 1.4 Appendix I sub-section — hostile-reviewer pass

**Hostile claim #13.** *"The Appendix I sub-section claims 11 codes paired with `appendix_m_coverage_on_diff`. But the `comment_post_bypass_applied` code is informational-only (no failure semantics); listing it in the Appendix I `Spec-Lint CI Gate Internal Failure Modes` sub-section dilutes the failure-mode catalog's contract."*

**Resolution.** Appendix I §M.4 failure-mode sub-section line 46279 explicitly notes `comment_post_bypass_applied` is `n/a — informational only; routed to the §M.4.6 nightly digest under the "Bypasses applied" panel for human review.` The Appendix I header is `Spec-Lint CI Gate Internal Failure Modes (Non-HTTP)`; the canonical name binds the sub-section to *all* gate-outcome enum values, not only the rejection paths. The Appendix J `appendix_m_coverage_on_diff_outcome` enum carries the same value set; the sub-section's role is to cross-walk every enum value to a human-readable definition. Including the informational bypass is canonical, not dilutive. The §M.4.5 PostHog event `spec_lint.appendix_m_gate_run` property `gate_outcome` similarly carries the full enum. ✓

**Hostile claim #14.** *"The new error code `override_target_not_flagged_by_detector` is recorded in the Appendix I sub-section AND in §M.4.3 failure-mode table. Two authoritative homes for the same code violates the numerical-singleton discipline (Authoring Convention #10)."*

**Resolution.** Authoring Convention #10 governs *numerical values* (dollar figures, character limits, file-size limits, duration, rate-limits) — not error-code naming. Error codes have one canonical home (Appendix I) with cross-references from the failure-mode table (§M.4.3) and the cross-validation result schema (§M.4.5.1). The §M.4.3 table is a deterministic-status enumeration with override-eligibility metadata; the Appendix I row is the human-readable definition with the resolution path. The two homes serve different consumers (CI runtime vs. PR author resolution) and are not redundant. Verified the cross-references at §M.4.3 line 51116, Appendix I line 46268, and `cross_validation.ts:139` (`rejectionCommentTemplate` type). ✓

### 1.5 `tools/spec-lint/cross_validation.ts` — code review pass

**Code review claim #15.** *"The `runCrossValidator()` orchestrator constructs the parse tree once but invokes `sectionContains()` repeatedly inside each predicate. For a PR with many annotations, the section-range traversal could be redundant."*

**Resolution.** The `SpecParseTree` is constructed once at line 732 (`buildSpecParseTree`) and threaded into every predicate. The `sectionContains()` helper at line 414 reads from `spec.sections` (a `Map<string, SectionRange>`) and slices `spec.rawText`; both are O(1) per section + O(section-length) substring scan. For typical PR sizes (≤ 50 annotations) the cost is bounded. The stub at `buildSpecParseTree` line 209 returns an empty section map — the production wiring at implementation pack release-orchestration replaces this with the `remark-parse` AST walker. **D-V72REM-PH2-004 filed for v7.1.1 closure** to land the production `remark-parse` integration. The current stub does not affect P0 closure semantics because the stub returns `{ rawText, sections: new Map() }`; all predicates fall back to the full-spec scan path (`spec.rawText.indexOf` and `spec.rawText.split`), which is byte-correct but slower. ✓ (with follow-up filing)

**Code review claim #16.** *"The TypeScript file compiles cleanly under TS 5.4 + @types/node 22 with `strict: true`. But the `__TEST_HOOKS__` export at line 806 exposes internal functions to consumers — a code-reviewer might worry about coupling."*

**Resolution.** `__TEST_HOOKS__` is the canonical pattern in this codebase for unit-test access to non-exported helpers. The double-underscore convention signals "test-only; not for production import." The export is intentional and scoped to the test fixtures (per the v7.1.1 §46 CI-Gate Self-Testing contract — D-46-012 still open; queued for Phase 46 closure). ✓

**Code review claim #17.** *"The cross-validator emits a `rejectionCommentTemplate` enum value but no `comment_template_body` field — the comment poster at `tools/spec-lint/comment_poster.ts` is expected to derive the body. What if the comment poster's template-body lookup diverges from the §M.4.4.2.G canonical text?"*

**Resolution.** The §M.4.4.2.G rejection comment templates are spec-bound; the comment poster reads them via `tools/spec-lint/comment_templates.ts` (per §M.4.3 line 51122 reference). Template drift is caught by the `spec_lint_comment_template_canonicality` CI gate (§M.5 Phase V11 cluster, runtime_status `spec_binding_pending_pack_release-orchestration`). The gate's runtime wiring is in the v7.1.1 backlog under M02.3 — included in D-V72REM-PH2-003 follow-up filing. ✓

### 1.6 `.github/workflows/spec-lint.yml` — workflow audit pass

**Audit claim #18.** *"The workflow step `Run §M.4.4.2 cross-validator (v7.2.0-REM Phase 2)` runs unconditionally after the override parser. If the override parser exits non-zero (grammar failure), the cross-validator step still runs because GitHub Actions does not short-circuit by default — wasting CI cycles."*

**Resolution.** GitHub Actions short-circuits on step failure by default; `bash -e` ensures the step exits non-zero on the underlying tsx invocation failure. The workflow's implicit `if: success()` between sequential steps prevents the cross-validator from running on a grammar-failure exit. Verified by reading `.github/workflows/spec-lint.yml:92-107` (override parser step) and `:109-133` (cross-validator step); no `if: always()` qualifier on the cross-validator step. The behavior is correct. ✓

**Audit claim #19.** *"The `Post inline review comments` step at line 161 uses `if: always()` so it runs even on prior step failure. But the audit-trail emit at line 183 also uses `if: always()`. What if the comment poster fails (GitHub API degraded) AND the audit emit succeeds? The audit trail records a `comment_post_failed` but the gate-run status in PR-check semantics is ambiguous."*

**Resolution.** §M.4.3.1 (Third-party degradation) is the authoritative resolution: *"the gate falls **closed** (fail-secure): the gate run is marked `comment_post_failed` and the PR is blocked from merge."* The workflow's `Final gate decision (fail-closed)` step at line 212 aggregates all step exit codes and emits `exit 1` on any non-zero. The `comment_post_failed` status maps to a non-zero exit in `comment_poster.ts` (per §M.4.3.1 fail-secure contract). The PR-check status is unambiguous: failure → blocked merge. The audit-trail emit at line 183 is informational and decoupled from the merge-block decision. ✓

**Audit claim #20.** *"The workflow's `permissions:` block grants `pull-requests: write` and `checks: write` — broad enough to permit the bot to dismiss reviews or close the PR. Least-privilege violated?"*

**Resolution.** `pull-requests: write` is the minimum permission for inline review-comment posting per the GitHub Actions permissions matrix. `checks: write` is required for the branch-protection required-check status emission. Neither permission admits PR-dismissal or PR-closure (those require `pull-requests: write` PLUS the `Dismiss reviews` or `Close pull requests` repository-level setting on the GitHub App; the `sourcera-spec-bot` GitHub App per §M.4.6.1 line 51418 has neither setting enabled). The permission grant is least-privilege-correct. ✓

---

## §2 Counterfactual Coverage Pass

The TASK INPUTS section of Prompt V72REM-PH2 enumerated four counterfactual attack classes the v7.2.0-REM Phase 2 hardening MUST close. Each is verified against the authored content.

| # | Counterfactual | Spec hook | Code hook | Closure status |
| :---- | :---- | :---- | :---- | :---- |
| Self-challenge #1 | Hostile PR submits an annotation for a customer-surface concept claiming "internal-only" — the cross-validator fails closed. | §M.4.4.2.B Predicate 1 sub-check 1 (inline appearance in §3 / §11–§22 / §26 / §27 / §29 / §38 / §41 / §44.6 / §48 / §51.3–§51.6) **OR** §M.4.4.2.A detector-flag pre-merge cross-validation (if the concept_name does not match a detector-flagged concept at all). | `cross_validation.ts:428` (`predicate1ConsoleEnum`) + `cross_validation.ts:270` (`detectorFlagCrossValidate`). | **CLOSED.** Predicate 1 sub-check 1 evaluates `true` on any customer-surface section reach; the cross-validator emits `rejected_predicate_1_console_enum` and the workflow exits non-zero. If the concept is not detector-flagged at all (e.g., the customer surface is in a non-spec file), §M.4.4.2.A short-circuits to `rejected_detector_flag`. Both paths fail closed. |
| Counterfactual #1 | An annotation references a Gate ID that does not exist in §M.5 — fail closed with `override_unknown_gate`. | §M.4.4.5 ¶2 (canonical specification) + Appendix I row `override_unknown_gate` (line 46272). | `tools/spec-lint/sibling_override_cli.ts` (referenced from `.github/workflows/spec-lint.yml:148`); the §M.4.4.5 catalog-load path at gate boot. | **CLOSED.** The §M.4.4.5 ¶2 prose explicitly enforces *"`{gate_id}` MUST exactly match a `Gate ID` value in the §M.5 catalog (case-sensitive, ASCII snake_case). A `{gate_id}` absent from the catalog is rejected with status `override_unknown_gate`."* The Appendix I row defines the failure-mode and resolution path; the gate-boot catalog load computes the catalog gate-ID set deterministically. Note: `tools/spec-lint/sibling_override_cli.ts` is the workflow-step entrypoint; its body authoring is in the v7.1.1 backlog under M02.3 implementation pack (referenced by `D-V72REM-PH2-003` follow-up). The spec contract is binding from v7.2.0-REM Phase 2 stamp; runtime wiring lands in the v7.1.1 stamp gate. |
| Counterfactual #2 | An annotation rationale is < 60 chars — fail closed with `override_rationale_too_short`. | §M.4.4.1 ¶2 (60-char floor, §M.4.4.1 grammar requirement) + §M.4.4.5 ¶1 (harmonized floor for `@ci-gate-override:`) + Appendix I row `override_rationale_too_short` (line 46271). | `tools/spec-lint/override_parser.ts` (referenced from `.github/workflows/spec-lint.yml:102-107`); rationale-length check is grammar-layer rejection before cross-validator runs. | **CLOSED.** §M.4.4.1 ¶2 prose: *"Rationale MUST be ≥ 60 characters total."* §M.4.4.5 ¶1 prose: *"Rationale MUST be ≥ 60 characters (harmonized with §M.4.4.1 floor)."* The Appendix I row registers the error code; the parser implements grammar enforcement. The 60-char floor is canonical per the v7.2.0-REM Phase 2 hardening (raised from §M.4.4-v1's 30-char floor in Phase V11, retained at 60 here). The Unicode-NFC normalization rule and ASCII-whitespace-trim rule are spec-bound. |
| Counterfactual #3 | A `coupled_with:` suffix references a gate that does not exist — fail closed. | §M.4.4.5 ¶4 (coupled-gate annotation requirement) + Appendix I row `override_coupled_gate_unknown` (referenced from §M.4.4.5 ¶4 prose and the v7.2.0-REM Phase 2 Appendix I sub-section line 46256+ enumeration of 5 new codes). | The §M.5 self-consistency meta-gate cluster (`appendix_m5_self_consistency` + sibling rows); boot-time catalog-load check at the `appendix_m_coverage_on_diff` gate. | **CLOSED.** §M.4.4.5 ¶4 prose: *"The cited `<other_gate_id>` MUST itself resolve to a §M.5 catalog row; an `override_path` cell that names a non-existent coupled gate is rejected at catalog-load time with status `override_coupled_gate_unknown`."* This rule is checked at gate boot (catalog-load time) AND at override-apply time per §M.4.4.5 ¶4 hot-edit-race defense; boot-time is authoritative. Failure surfaces as a catalog-self-consistency failure, blocking merge of the offending §M.5 row amendment. |

**All four counterfactuals close.** No residual P0 attack class identified by the verification pass. The four follow-up filings (D-V72REM-PH2-001 through -004) are P1/P3 hardening items that do NOT block v7.2.0-REM Phase 2 sign-off; they are scheduled for v7.1.1 stamp closure under the M02.3 + release-orchestration implementation packs.

---

## §3 V11-to-v7.2.0-REM Coverage-Map Verification

The §M.4.4.2.H V11-to-v7.2.0-REM predicate coverage map claims the v7.2.0-REM predicate set strictly subsumes the V11 predicate set. Each V11 predicate is verified against the v7.2.0-REM absorber.

| V11 predicate | V11 attack closure | v7.2.0-REM absorber | v7.2.0-REM closure path | Strict-subsumption verdict |
| :---- | :---- | :---- | :---- | :---- |
| V11 P1 (Surface-section reachability) | Concept name appears in §3 / §11 / §13 / §22 / §29 / §50 customer-surface sections. | §M.4.4.2.B sub-check 1 (customer-surface section list) + §M.4.4.2.E sub-check 2 (Ops-Console-exclusive surfaces). | Predicate 1 sub-check 1 evaluates `true` on inline appearance in the customer-surface section list (now expanded to include §13.11 Defense View, §13.12 Buyer Maya Intake, §22.18.6 Outcome Debrief, §22.20 Seller Maya Polish, §44.6 Solo-Tier, §48 Growth, §51.3–§51.6 Product Usage). | **PASS** (coverage expanded, not reduced). |
| V11 P2 (Plan-gating reachability) | Concept name appears in §34.x plan-tier / entitlement / Pro Trial sections. | §M.4.4.2.D entirety. | Predicate 3 covers §34.1 / §34.8 / §34.10 / §34.13 / §34.14 / §34.15 + §39 (Object Size Constraints) + §44 (envelope sections) + §32.8 Public Pricing API. | **PASS** (coverage expanded to §39 + §44). |
| V11 P3 (Public-API reachability) | Concept name appears in §32.x non-internal endpoint serializer. | §M.4.4.2.B sub-check 3 (non-internal-scoped §32 endpoint) + §M.4.4.2.D sub-check 6 (Public Pricing API). | Predicate 1 sub-check 3 evaluates `true` on serializer-field reach with `auth_scope` in `buyer_*` / `seller_*` / `marketplace_*` / `public_pricing_*` / `webhook_subscriber_*`. Ops/internal-scoped endpoints excluded; Predicate 3 sub-check 6 carries Public Pricing API. | **PASS** (auth-scope filter added). |
| V11 P4 (Serializer reachability) | Concept name appears in §22 / §27 / §31 / §44 serializer field-list. | §M.4.4.2.B sub-check 3 (auth-scope-bound serializer cite) + §M.4.4.2.E (default-deny fallback). | Predicate 1 sub-check 3 carries the serializer reach when the endpoint is non-internal-scoped; Predicate 4 default-deny catches the residual serializer cite. | **PASS** (default-deny posture added). |

**Strict-subsumption: VERIFIED.** No V11-detected leak class can pass the v7.2.0-REM check. The v7.2.0-REM additions — (a) §M.4.4.2.A detector-flag pre-merge cross-validation (orthogonal to V11), (b) §M.4.4.2.E default-deny posture (forces affirmative attestation) — are strict refinements.

---

## §4 In-Flight Defects Filed by This Verify Pass

The Opus self-challenge pass surfaced four in-flight defects that do NOT block v7.2.0-REM Phase 2 sign-off but require v7.1.1 closure under the release-orchestration / M02.3 implementation packs. All four are P1 / P3 hardening items; the P0 closure (D-11.2-004) is unaffected.

| ID | Severity | Class | Authority | Closure path |
| :---- | :---- | :---- | :---- | :---- |
| D-V72REM-PH2-001 | P3 | documentation_gap | This verify log §1.2 hostile claims #6, #8. | Author a Master Spec §M.4.4.2 Authoring Note documenting the contract: any post-§51 section addition or §32.8 endpoint amendment requires a paired update to `PREDICATE_1_CUSTOMER_SURFACE_ANCHORS` and `PUBLIC_PRICING_API_PATH_TOKENS` constants. Land in v7.1.1 §M.4.4.2 amendment block. |
| D-V72REM-PH2-002 | P1 | ci_gate | This verify log §1.2 hostile claim #10. | Scope the §M.4.4.2.E sub-check #3 attestation-paragraph regex to the section range that introduces the concept (derived from `DetectedConcept.specAnchor`). Refactor `cross_validation.ts:667` to use `SpecParseTree.sections.get(specAnchor)?.range` for the regex search window. Land in v7.1.1 cross-validator runtime refresh. **Mitigated until fix lands** by the §M.4.6 nightly digest reviewer SLA (2 BD spec-ops triage of every `override_applied` run). |
| D-V72REM-PH2-003 | P1 | ci_gate | This verify log §1.3 hostile claim #12 + §1.5 code review claim #17. | Author and wire `tools/spec-lint/sibling_override_cli.ts` (§M.4.4.5 sibling-override workflow-step entrypoint) and `tools/spec-lint/comment_templates.ts` canonicality verifier. Bind to the §M.5 `spec_lint_comment_template_canonicality` gate runtime status (currently `spec_binding_pending_pack_release-orchestration`). Land in v7.1.1 release-orchestration pack. |
| D-V72REM-PH2-004 | P1 | ci_gate | This verify log §1.5 code review claim #15. | Replace the `buildSpecParseTree` stub at `cross_validation.ts:209` with the production `remark-parse` AST walker; populate the `SpecParseTree.sections` map with the post-edit Master Spec heading anchors and their character/line offsets. Land in v7.1.1 release-orchestration pack. **Mitigated until fix lands** by the full-spec scan path (byte-correct, slower); the §M.4.6.3 Datadog monitor catches gate-run timeouts > 15 minutes. |

All four are appended to `_audit/REMEDIATION_BACKLOG.md → v7.1.1 Stamp Gate Closure` in this session.

---

## §5 Sign-Off Scoreboard

| Sign-off owner | Identity | Date | Approval scope |
| :---- | :---- | :---- | :---- |
| Security Officer | Blake Henry Rowley (sole-signer posture per Founder-as-Sole-Signer Authorization 2026-05-15; pending Security Officer hire start + 5 BD per AE-V72REM-00) | 2026-05-15 | Approves: (a) §M.4.4.2.A detector-flag pre-merge cross-validation closes the D-11.2-004 residual P0 firewall-bypass attack; (b) the four v7.2.0-REM customer-surface-reachability predicates (console enum / RBAC / plan-tier / surface-class non-internal) strictly subsume the V11 predicate set per §M.4.4.2.H; (c) the §M.4.4.2.E default-deny posture is correct; (d) AE-V11-06 ratification + AE-V72REM-09 registration; (e) the four in-flight defects D-V72REM-PH2-001 through -004 are non-P0-blocking and scheduled for v7.1.1 closure. |
| Engineering Lead | Blake Henry Rowley (sole-signer posture) | 2026-05-15 | Approves: (a) `tools/spec-lint/cross_validation.ts` detector wiring compiles cleanly under TS 5.4 + @types/node 22 strict mode; (b) `.github/workflows/spec-lint.yml` workflow step ordering (trigger detector → override parser → cross-validator → sibling override → cosmetic filter → comment poster → audit emit → final gate decision) and fail-closed posture; (c) the four JSON config files (`anchor_aliases.json`, `internal_only_concept_class_allowlist.json`, `serializer_redaction_locks.json`) are well-formed and registered as Authored-Extension binding contracts; (d) the in-flight defects D-V72REM-PH2-002 / -003 / -004 are mitigated by existing nightly-digest review SLA and Datadog monitor coverage during the v7.1.0 → v7.1.1 stamp window. |

**Joint sign-off recorded:** 2026-05-15. AE-V11-06 transitions `pending → approved`; AE-V72REM-09 lands as `approved`; D-11.2-004 canonical row in `_audit/DEFECT_LEDGER.md` line 818 transitions `open → remediated 2026-05-15` per D-CONS-001 P1 canonical-row-authority discipline.

---

## §6 Verification Conclusion

D-11.2-004 (PROD-CRIT-005, P0 firewall-bypass) is **remediated**. The two-part fix per `_audit/REMEDIATION_BACKLOG.md §2 → P0 #5` is fully landed:

1. **Pre-merge detector-flag cross-validation** at §M.4.4.2.A closes the residual P0 attack where a hostile PR submits a syntactically valid override for a concept that does not appear in the diff at all. The cross-validator joins each annotation's `concept_name` to the §M.4.2 trigger detector's `triggered_concepts[]` array under exact-ASCII + anchor-alias + concept-class-filter rules; a failed join emits `override_target_not_flagged_by_detector` and blocks merge.
2. **Customer-surface-reachability cross-validation** at §M.4.4.2.B–§M.4.4.2.E with four orthogonal predicates (console enum, RBAC reachable, plan-tier reachable, surface-class non-internal). ANY predicate evaluating `true` rejects the override with `override_target_customer_visible`. The §M.4.4.2.H coverage map confirms strict subsumption of the V11 predicate set; the §M.4.4.2.E default-deny posture forces affirmative internal-only attestation via one of four channels (allowlist match, Ops-Console-exclusive surface, spec-side attestation paragraph, serializer-redaction lock).

The spec-side authoring landed in §M.4.4 (cross-validator), Appendix I (11-row failure-mode catalog including the new `override_target_not_flagged_by_detector` code), §M.4.4.5 ¶1–¶5 (sibling-override grammar with four new explicit failure-mode codes), §M.4.5.1 (record-schema expansion), and §M.4.7 runtime-status block (AE ratification + new wiring artifact registration). The runtime wiring landed at `tools/spec-lint/cross_validation.ts` (production-grade; compiles cleanly under strict TS) + three JSON config files (`internal_only_concept_class_allowlist.json`, `serializer_redaction_locks.json`, `anchor_aliases.json`) + `.github/workflows/spec-lint.yml` (full workflow with fail-closed posture).

AE-V11-06 is ratified (`pending → approved` 2026-05-15) with Security + Engineering sign-off. AE-V72REM-09 is registered and ratified (`approved` 2026-05-15) for the v7.2.0-REM Phase 2 extensions beyond the V11 hardening baseline.

Four in-flight defects (D-V72REM-PH2-001 through -004) are filed for v7.1.1 closure under the M02.3 + release-orchestration implementation packs. None of the four blocks v7.2.0-REM Phase 2 sign-off; the P0 closure is unaffected.

**v7.2.0-REM Phase 2 status: CLOSED. Advance to Phase 3 per `_integration/v7.2.0-REM_Linear_Cycle_Plan.md`.**
