# Phase 4.9 Q&A Residual P1 Verification — 2026-06-23

## Scope

Target rows:

- D-4.9-010 — P1 `numerical_singleton`
- D-4.9-014 — P1 `surface_engine_mapping`
- D-4.9-011 — adjacent P2 `consistency_drift`

Authoritative sources read before classification: Master Spec §18 end-to-end; §21.4.1.B; §22.1 / §22.8; §34.1.1; §39; Appendix I Q&A error rows; Appendix M.1 §18 rows; §M.5; `_audit/DEFECT_LEDGER.md`; `_audit/V711_BACKLOG_INDEX.md`; `_audit/REMEDIATION_BACKLOG.md`; `_integration/AUTHORED_EXTENSIONS_LEDGER.md`.

## Classification

| Defect | Classification | Result |
|---|---|---|
| D-4.9-010 | True issue | Closed by adding §34.1.1 Q&A quota cells, §39 Q&A object-limit rows, citation rewrites in §18 / §21 / Appendix I, and §M.5.54 guardrail coverage. |
| D-4.9-011 | True lower-severity consistency drift | Closed by replacing stale Appendix M.1 Q&A phase/tier rows and adding §M.5.54 guardrail coverage. |
| D-4.9-014 | True issue | Closed by expanding Appendix M.1 §18 coverage and adding §18.4.1.1 buyer/seller Q&A suggestion firewall boundary. |

No target row was stale, duplicate, or blocked. D-4.9-014's filed remediation proposal implied a buyer-side bridge into seller KB; current Master Spec §22.1 forbids buyer-console sessions, including agent-driven sessions, from reading seller KB or calling KB MCP. The remediation therefore resolves the source conflict in favor of §22.1 and fails closed unless a future Authored Extension explicitly authorizes a new bridge.

## Spec Changes

- §18 now cites §34.1.1 and §39 as canonical homes for Q&A question caps, additional-slot caps, title/body/edit-window/attachment/draft/justification limits.
- §18.4.1.1 defines the no-buyer-seller-KB retrieval boundary for `qa_suggestion_buyer` and the scoped seller-side retrieval contract for `qa_suggestion_seller`.
- §21.4.1.B and Appendix I now cite §39 for Q&A draft / attachment bounds.
- §34.1.1 adds Q&A question and additional-slot quota rows.
- §39 adds Q&A Thread / Post / Attachment / AgentQASuggestion / QAAdditionalSlotsRequest rows.
- Appendix M.1 expands §18 Q&A rows for phase gating, visibility, author masking, buyer-side suggestion, cross-console retrieval boundary, editing/moderation, attachments, mentions/digest, search, and additional-slot workflow.
- §M.5.54 registers four guardrails: `qa_thread_numeric_single_source`, `appendix_m_qa_section_completeness`, `appendix_m_qa_phase_and_tier_consistency`, and `qa_suggestion_cross_console_firewall_boundary`.

## Tracking Updates

- `_audit/DEFECT_LEDGER.md`: D-4.9-010, D-4.9-011, and D-4.9-014 set to `remediated 2026-06-23`.
- `_audit/V711_BACKLOG_INDEX.md`: current index-series P1 count updated to 86 rows / 86 unique IDs.
- `_audit/REMEDIATION_BACKLOG.md`: Phase 4.9 residual note added; Phase 4.9 cluster row and affected class rollups updated.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md`: AE-V72REM-PH4P49-QA-RESIDUAL-P1-01 added.
- `_integration/RECONCILIATION.md`: Phase 4.9 Q&A Residual P1 pass appended.

## Verification

Canonical open P1 scan:

```text
open_p1_rows=86
unique_open_p1_ids=86
```

Target row status scan:

```text
D-4.9-010 P1 remediated 2026-06-23
D-4.9-011 P2 remediated 2026-06-23
D-4.9-014 P1 remediated 2026-06-23
```

Target stale-string scans returned no matches for stale §18 / Appendix M phrases:

```text
phase-gated; Phase 9 specifically
Agent Q&A Suggestion (buyer-side AI).*Gr+
Max 50 questions
≤300-character
<10MB
15 minutes of creation
```

Full lint command:

```bash
npx tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit
```

Result: exit code 0. All blocking gates passed. Advisory-only failures remain:

- `solo_tier_numeric_single_source`: 52 advisory findings
- `retention_singleton_section_40_2_canonical`: 115 advisory findings
- `section_anchor_slug_no_colon`: 13 advisory findings

These advisory families are outside the Phase 4.9 Q&A residual scope.
