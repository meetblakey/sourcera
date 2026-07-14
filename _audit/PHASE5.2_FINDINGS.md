# Phase 5.2 — §22.1–§22.8 KB & MCP Server Cross-Reference Audit — Scratch Findings Log

**Date:** 2026-05-06
**Auditor model:** Claude Opus
**Audit prompt:** Walk Master Spec §22.1–§22.8; cross-reference `_versions/KB_Engineering_Spec_retired_2026-04-26.md §0–§3` end-to-end.
**Status:** Findings promoted to `DEFECT_LEDGER.md` Phase 5.2 section. This file is the scratch artifact retained per audit-program protocol.

---

## Sources Read (in full)

- `Sourcera_Master_Spec.md` §22.1 (lines 15936–15958), §22.2 (15959–16069), §22.3 (16070–16188), §22.4 (16189–16297), §22.5 (16299–16350), §22.6 (16351–16378), §22.7 (16379–16396), §22.8 (16397–17242)
- `_versions/KB_Engineering_Spec_retired_2026-04-26.md` §0 (lines 1–32), §1 (34–60), §2 (61–155), §3 (156–442), §5 (573–631) for indexing-pipeline cross-checks, §6.3 (line 733) for tool-references-without-definitions
- `Sourcera_Master_Spec.md` Appendix C KB-Domain (lines 41496–41594), Appendix C preamble Coverage Invariant (line 41502), Appendix I sample (line 43151+), Appendix J reference (line 43868+), Appendix K MCPSessionTokenRecord glossary entry (line 47235), §22.10 alias table (line 17430), §22.17 acceptance criteria (lines 18421–18475), §1.3 console firewall

## Cross-Reference Walk — Per-Check Results

### Check 1: Layered Model (§22.2.1) matches KB Spec §2.1 in full

**Result:** Substantive match in narrative, **drift in tool list**.

The §22.2.1 ASCII diagram (lines 15968–16006) and KB Spec §2.1 diagram (lines 65–104) both list **7 tools**: `kb_retrieve`, `kb_get_entry`, `document_library_find`, `doc_attach`, `capability_find`, `capability_declare_draft`, `cite_verify`. Both diagrams omit `kb_entry_draft_create` and `kb_dedupe_check`, which are defined in §22.8.4.8 / §22.8.4.9 and which §22.8.4 preamble (line 16505) explicitly states are part of the "nine tools registered in Appendix J `mcp_tool_name`."

The "Key mappings" table (lines 16011–16020) and the surrounding narrative are substantive parity with KB Spec §2.2; Master Spec adds the AIWallet-debit row and a few cross-references.

→ **D-5.2-001 (P1)** filed.

### Check 2: Why Managed Agents not Agent SDK (§22.2.2) matches KB Spec §2.3

**Result:** Match with extension.

KB Spec §2.3 lists 5 capabilities (First-Pass, KB Bootstrap, Ghost-Bid Importer, Q&A Suggestion, KB-to-Capability Suggestion). Master Spec §22.2.2 table lists 7 (adds `kb_to_response_suggestion` and `kb_staleness_classifier`). Both extensions fit the Managed Agents profile (interactive tool-heavy, bulk async).

The "Managed Agents features Sourcera relies on" sub-table is also extended — Master Spec adds explicit token-accounting cross-reference to §4.8.6 nightly recalc; KB Spec §2.3 had only generic "session persistence + event streaming." Extension is sound, no defect.

### Check 3: Beta Header & Version Pinning (§22.2.3) matches KB Spec §2.4

**Result:** Match with substantial extension.

Both pin `managed-agents-2026-04-01`. Master Spec §22.2.3 inlines the canary-rollout playbook (5 steps); KB Spec §2.4 cross-references §16 instead. Master Spec also adds the failure mode for version mismatch (HTTP 503 `anthropic_beta_version_unsupported`, new error code).

The cross-reference to KB Spec §16 was correctly retired (§22.2.3 inline procedure now self-contained). Confirm that `anthropic_beta_version_unsupported` is registered in Appendix I (verification deferred to Phase 8 sweep).

### Check 4: Ingestion Channels (§22.3) include Firecrawl, document upload, manual entry

**Result:** Match with one scope-qualifier ambiguity.

Master Spec §22.3 enumerates 4 KBEntry channels: manual authoring, bid response import, Firecrawl, Ghost-Bid Importer. KB Spec did not have a single "ingestion channels" enumeration in §0–§3 — channels were implicit in §5/§6.

"Document upload" is intentionally out of §22.3 scope because Document Library uploads produce `KBDocument` rows (§22.7), not `KBEntry` rows. However, §22.3 heading "Ingestion Channels" lacks a scope qualifier (KBEntry vs KBDocument), and §22.3 makes no forward-reference to §22.7 KBDocument upload.

→ **D-5.2-011 (P2)** filed.

### Check 5: Entry lifecycle & indexing pipeline (§22.4) matches KB Spec §5

**Result:** Match with substantial extension; multiple drift defects.

§22.4.1 codifies the seven-state lifecycle (KB Spec §5.1 only had a 4-step Create → Vectorize → BM25 → Metadata diagram, no state machine). Extension is sound.

§22.4.2 Failed Vectorization parity with KB Spec §5.2 plus added explicit Convex-transaction atomicity, persistent-failure auto-flag-stale path, and 3 counterfactual modes.

§22.4.3 Re-Indexing on Entry Edit: parity with KB Spec §5.3 plus explicit idempotency (`(kb_entry_id, updated_at)` keying) and 3 counterfactual modes.

§22.4.4 Namespace Migration: extends KB Spec §5.4 (which had 4 prose steps) into 8 procedural steps with audit/webhook/notification emission. Adds 3 counterfactual modes.

§22.4.5 Embedding Version Bumps: extends KB Spec §5.5 (4 prose steps) with explicit per-Org coverage threshold gating, fallback semantics, and 3 counterfactual modes.

Defects identified:

- **D-5.2-002 (P1):** §22.4.1 cites `KB_Engineering_Spec.md §0` for the 90-day default — §0 is the Document Map.
- **D-5.2-003 (P1):** Field name inconsistency (`status` vs `lifecycle_state`).
- **D-5.2-015 (P3):** §22.4.1 row note mis-cites §22.4.2 for the atomic happy-path commit.
- **D-5.2-019 (P3):** `audit_event_action_type` Appendix J registration of `kb_namespace_migration` — verification deferred.
- **D-5.2-020 (P3):** §22.4.1 row note's `exclude_review_states` default wording drift.

### Check 6: KB MCP server (§22.8) matches KB Spec §3 verbatim, including every tool

**Result:** Substantive match for the 7 KB Spec tools; 2 added; multiple drift defects.

KB Spec §3 had 7 tool sub-sections (§3.4.1–§3.4.7). Master Spec §22.8.4 has 9 sub-sections (§22.8.4.1–§22.8.4.9). The 2 added tools (`kb_entry_draft_create`, `kb_dedupe_check`) close a KB Spec internal gap — KB Spec §6.3 referenced them as bootstrap-agent MCP tools without defining their I/O.

Per-tool coverage assessed:

- **§22.8.4.1 `kb_retrieve`**: ✅ input + output + description + 2 examples + error envelope + rate limit. Drift: `freshness` enum incomplete (D-5.2-004); per-tool error envelope inconsistent with §22.8.6 (D-5.2-012).
- **§22.8.4.2 `kb_get_entry`**: ✅ input + output + description + 1 example + errors + rate limit.
- **§22.8.4.3 `document_library_find`**: ⚠ input + output + description + rate limit. Missing example; missing per-tool error code list. (D-5.2-007, D-5.2-008.)
- **§22.8.4.4 `doc_attach`**: ✅ input + output + description + side-effects + 4 errors + rate limit. No concrete example. (D-5.2-007.)
- **§22.8.4.5 `capability_find`**: ⚠ input + output + description + rate limit. Missing example, missing error codes. (D-5.2-007, D-5.2-008.)
- **§22.8.4.6 `capability_declare_draft`**: ⚠ input + output + description + side-effect + rate limit. Missing example, missing error codes. (D-5.2-007, D-5.2-008.)
- **§22.8.4.7 `cite_verify`**: ⚠ input + output + description + rate limit. Missing example, missing HTTP error codes (only 6 `reason` enum values). (D-5.2-007, D-5.2-008.) Rate-limit divergence from KB Spec §3.6 (60 vs 10 rps) unflagged. (D-5.2-010.)
- **§22.8.4.8 `kb_entry_draft_create`**: ✅ exemplar — input + description + output + example + 8-row error code list + side-effect + permission scope + rate limit.
- **§22.8.4.9 `kb_dedupe_check`**: ✅ exemplar — same coverage as §22.8.4.8.

§22.8.5 Permission Policy: parity with KB Spec §3.5 plus the new `scoped_allow_with_quota` permission scope, the citation-completeness gate, and the firewall gate. Defect: firewall gate alert mechanism unspecified (D-5.2-021).

§22.8.6 Implementation Requirements: parity with KB Spec §3.6 plus per-tool latency budgets (9 tools, all listed), per-tool rate limits, residency cross-region 403, observability, audit ledger, error envelope. Defect: webhook list incomplete (5 vs the 8 in §22.17 AC #17). (D-5.2-009.)

### Check 7: MCP session token record entity (if introduced) is in §4.4 or §4.8

**Result:** Defect.

The `MCPSessionTokenRecord` entity is introduced at §22.8.3.1 — inline in §22.8.3 architecture content, NOT in §4.4 or §4.8. The entity definition satisfies §4 conventions (full field table, indexes, retention, residency) but is misplaced. Engineering teams reading §4 for the data model will miss the entity.

→ **D-5.2-005 (P1)** filed.

---

## Counterfactual Pass

13 realistic failure modes enumerated against §22.1–§22.8. All 13 have spec-side handling. No additional unhandled failure modes detected in scope. Detail in Phase 5.2 Counterfactual Pass section of `DEFECT_LEDGER.md`.

## Self-Challenge Pass

Re-read 22 findings as a hostile reviewer.

- **Severity reclassifications:** D-5.2-006 P1 → P2 (documentation hygiene, not engineering blocker).
- **Severity considered but held:** D-5.2-014 (P2 — silently mis-sized vector column = real implementation cost), D-5.2-021 (P1 — firewall observability is security-critical), D-5.2-009 (P1 — integrator-facing table partial enumeration).
- **No defects withdrawn** post self-challenge.

---

## Forward References

| Defect | Forward phase | Reason |
|---|---|---|
| D-5.2-008, D-5.2-012 | Phase 8 (Appendix I sweep) | Per-tool error codes need Appendix I rows |
| D-5.2-019 | Phase J-Audit | Appendix J `audit_event_action_type` enum verification |
| D-5.2-001 | Phase 11 (Appendix M coverage) | §22.2.1 surface mapping (verify Appendix M.1 lists 9 tools, not 7) |
| D-5.2-022 | Phase 14 (cross-document hygiene) | Bare `KB_Engineering_Spec.md` cites pervasive across §1, §13, §17, §22, §27 |
| D-5.2-006 | AE Ledger | `kb_entry_draft_create` + `kb_dedupe_check` Authored Extension status |
| D-5.2-005 | AE Ledger | `MCPSessionTokenRecord` AE-ratification step (entity already AE-flagged in Glossary line 47235; placement decision is the AE-ratification gate) |

## Phase 5.2 Sign-Off

- 22 defects promoted (0 P0 / 9 P1 / 10 P2 / 3 P3).
- Sub-prompt HALT not triggered (zero P0).
- 9 open P1 defects in §22.1–§22.8 scope advance to Phase 5 V (verification) gate.
- Master Spec unchanged (audit non-destructive).
- Backup not required (no edits).
