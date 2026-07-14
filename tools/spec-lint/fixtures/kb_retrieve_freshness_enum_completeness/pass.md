# 22 Seller KB {#22-seller-kb}

#### 22.8.4.1 `kb_retrieve` {#22.8.4.1-kb_retrieve}

"freshness": { "type": "string", "enum": ["fresh", "review_due", "review_overdue", "flagged_stale"], "description": "Canonical Appendix J kb_retrieve_freshness value. review_overdue and flagged_stale are excluded from ordinary results unless exclude_review_states is overridden by the kb_staleness_classifier." }

**Freshness classification contract.** Ordinary callers receive only `fresh` and `review_due` hits because `exclude_review_states` defaults to `["review_overdue", "flagged_stale"]`. The `kb_staleness_classifier` override path (§21.4.1 #17; §22.17 AC #49) is the only path permitted to pass `exclude_review_states=[]`, and when it does, the returned `freshness` field MUST carry the actual Appendix J `kb_retrieve_freshness` value (`review_overdue` or `flagged_stale`) instead of down-casting to `review_due`.

# Appendix J {#appendix-j}

### KB Retrieve Freshness (§22.8.4.1) (new)

`fresh`, `review_due`, `review_overdue`, `flagged_stale`

- Response enum for `kb_retrieve.hits[].freshness`; it mirrors the retrieval-relevant subset of `kb_entry_status`.
- Ordinary callers receive only `fresh` and `review_due` because `exclude_review_states` defaults to `["review_overdue", "flagged_stale"]`.
- `review_overdue` and `flagged_stale` may appear only on the `kb_staleness_classifier` override path (§21.4.1 #17; §22.17 AC #49). Those values MUST NOT be down-cast to `review_due`.

#### M.5.57 v7.2.0-REM Phase 5.2 KB / MCP P1 addition {#m-5-57-v72rem-phase-5-2-kb-mcp-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `kb_retrieve_freshness_enum_completeness` | enum_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/kb_retrieve_freshness_enum_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Freshness. | M02.3 |
