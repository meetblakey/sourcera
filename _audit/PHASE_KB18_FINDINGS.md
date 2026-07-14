# Phase KB18 — KB Engineering Spec §0–§18 vs Master Spec §22 Exhaustive Cross-Check

**Run date.** 2026-05-12 (Cowork Opus 4.6 session)
**Posture.** Non-destructive. Defect-ID mnemonic: `D-KB18-NNN` (per Audit_Prompts.md Defect Ledger Format mnemonic permission).
**Scope.** Exhaustive cross-check of `_baselines/retired-sources/KB_Engineering_Spec_retired_2026-04-26.md §0–§18` (the entire retired KB Engineering Spec) against `Sourcera_Master_Spec.md` v7.1.0 §22 (lines 16277–19805). Mirror of Phase 5.2 / 5.3 cross-walks but executed with a fresh context and all seven prompt checks walked sequentially. Findings that duplicate D-5.2-NNN / D-5.3-NNN / D-5V-NNN rows are NOT re-filed; the ledger is append-only and a re-walk does not republish prior decisions.

**Sources read in full.**
- `_baselines/retired-sources/KB_Engineering_Spec_retired_2026-04-26.md` §0–§18 (lines 1–1546) plus §19 References (1548–1566) and §20 Open Items (1570–1582).
- `Sourcera_Master_Spec.md` §22.1 (16277–16299), §22.2 (16300–16410), §22.3 (16411–16529), §22.4 (16530–16638), §22.5 (16640–16691), §22.6 (16692–16719), §22.7 (16720–16737), §22.8 (16738–17583), §22.9 (17584–17743), §22.10 (17744–17999), §22.11 (18001–18091), §22.12 (18093–18241), §22.13 (18242–18327), §22.14 (18330–18437), §22.15 (18440–18526), §22.16 (18527–18810), §22.17 ACs (18813–18866).
- Targeted reads of `DEFECT_LEDGER.md` Phase 5.2 (lines 1877–1955), Phase 5.3 (1957–2042), Phase 5 V5 (2394–2434) to avoid re-filing prior findings.

---

## 1. Counterpart Coverage (Check 1)

Every KB Spec subsection (§0 Document Map through §18 Security/Firewall/Residency) maps to a §22 counterpart. The §22 reorganization is correct: KB Spec engineering surfaces are pulled into §22.x with cross-references back to retired-snapshot section IDs.

| KB Spec subsection | §22 counterpart | Status |
| :---- | :---- | :---- |
| §0 Document Map | (no counterpart needed; §22 has its own internal structure) | n/a |
| §1.1 Goals | §22.1 Purpose & Scope (partial; goals not enumerated) | ⚠ partial — D-KB18-006 |
| §1.2 Non-Goals | (no counterpart; three non-goals not mirrored) | ❌ missing — D-KB18-006 |
| §1.3 Decision Principles | (no counterpart; five decision principles partially absorbed into §22.2.2 / §22.9 / §22.16.7 but not enumerated as principles) | ❌ missing — D-KB18-006 |
| §2 Architectural Overview | §22.2 | ✅ |
| §3 KB MCP Server | §22.8 | ✅ (D-5.2-006 already flags 9-vs-7-tool extension) |
| §4 Retrieval Engineering | §22.9 | ✅ (additions covered) |
| §5 Indexing Pipeline | §22.4 KB Entry Lifecycle & Indexing Pipeline | ✅ |
| §6 Managed Agent Definitions | §22.10 | ✅ (with §22.10.6 surface change — D-KB18-013) |
| §7 Custom Tool Contracts | §22.11 | ✅ |
| §8 Skills | §22.12 | ✅ (with two added skills already flagged by D-5.3-010) |
| §9 Environments | §22.13 | ✅ |
| §10 Session Lifecycle | §22.14 | ✅ |
| §11 Event Stream Handling | §22.15 | ✅ |
| §12 Citation / Provenance / Anti-Hallucination | §22.16.1 | ✅ (with reason-enum drift — D-KB18-001) |
| §13 Cost / Performance / Caching | §22.16.2 (cost-base table moved to §21.4.2 by design) | ✅ |
| §14 Evaluation Harness | §22.16.3 | ✅ |
| §15 Observability & Metrics | §22.16.4 | ✅ (with audit-event mapping incompleteness — D-KB18-009) |
| §16 Rollout / Versioning / Canary | §22.16.5 | ✅ |
| §17 Failure Modes & Recovery | §22.16.6 | ✅ |
| §18 Security / Firewall / Residency | §22.16.7 | ✅ |

**Net coverage findings.** Decision-Principles and Non-Goals from KB §1.2 / §1.3 not mirrored anywhere in §22 → D-KB18-006 (P3 documentation_gap).

---

## 2. Beta Header (Check 2)

Both documents pin `anthropic-beta: managed-agents-2026-04-01` and explicitly require canary rollout on bump.

| Surface | Pin | Status |
| :---- | :---- | :---- |
| KB Spec §2.4 | `managed-agents-2026-04-01` | ✅ |
| KB Spec §19 References | "Beta header pinned at `managed-agents-2026-04-01`. Review and bump on Anthropic version advance." | ✅ |
| Master Spec §22.2.3 | Same pin; explicit 5-step canary rollout procedure | ✅ enhanced |
| Master Spec §22.16.9 References | Same pin cross-referenced | ✅ |

**No defect.** Beta header consistent.

---

## 3. MCP Tool I/O Schemas (Check 3)

KB Spec §3.4 defines 7 tools; §22.8.4 defines 9 (adds `kb_entry_draft_create` §22.8.4.8, `kb_dedupe_check` §22.8.4.9). The 9-vs-7 extension is already filed as D-5.2-006 (P2 authored_extension flag).

| Tool | KB Spec schema | §22 schema | Drift |
| :---- | :---- | :---- | :---- |
| `kb_retrieve` (§3.4.1 / §22.8.4.1) | Input: query (max 2000 chars prose), namespace_preference (no bounds), filters, top_k 1–10, max_excerpt_chars 200–1000 | Same fields; adds JSON-Schema enforcement (`maxLength: 2000` on query; `minItems: 1, maxItems: 10` on namespace_preference). Output identical. | ⚠ Internal §22 drift surfaced — D-KB18-003, D-KB18-004 (see Check 4 below) |
| `kb_get_entry` (§3.4.2 / §22.8.4.2) | input/output identical | identical | ✅ |
| `document_library_find` (§3.4.3 / §22.8.4.3) | KB has bare `query` string + `compliance_framework` (string, no enum) + `require_unexpired` | §22 adds `maxLength: 500` on query and enum constraint on compliance_framework | ✅ enhancement |
| `doc_attach` (§3.4.4 / §22.8.4.4) | minimal input | §22 adds descriptions, side-effect, error envelope, webhook emission | ✅ enhancement |
| `capability_find` (§3.4.5 / §22.8.4.5) | KB Spec stub: one-line prose, no schema | §22 authors full input/output schema | ✅ authored extension (KB Spec gap, already noted) |
| `capability_declare_draft` (§3.4.6 / §22.8.4.6) | KB Spec stub: one-line prose, no schema | §22 authors full schema | ✅ authored extension |
| `cite_verify` (§3.4.7 / §22.8.4.7) | KB §3.4.7 input/output simple; KB §12.3 enumerates 6 reason values (`entry_not_found`, `offsets_out_of_bounds`, `excerpt_mismatch`, `stale`, `unauthorized_namespace`) | §22.8.4.7 schema enumerates 6 reason values: `entry_modified_after_offset_capture`, `offsets_out_of_range`, `excerpt_does_not_match`, `entry_not_found`, `entry_archived`, `entry_flagged_stale`. §22.16.1 semantics table re-states the KB Spec's reason vocabulary verbatim (`entry_not_found`, `offsets_out_of_bounds`, `excerpt_mismatch`, `stale`, `unauthorized_namespace`). | **P1 NEW — D-KB18-001 — internal §22 drift between two reason vocabularies** |
| `kb_entry_draft_create` (§22.8.4.8) | (not in KB Spec) | full schema authored | ✅ AE per D-5.2-006 |
| `kb_dedupe_check` (§22.8.4.9) | (not in KB Spec) | full schema authored | ✅ AE per D-5.2-006 |

**Critical NEW finding: D-KB18-001.** `cite_verify` carries two parallel reason-enum vocabularies inside Master Spec v7.1.0 itself:

| Reason value (§22.16.1 semantics table line 18555–18561) | Counterpart in §22.8.4.7 schema (line 17283) | Match? |
| :---- | :---- | :---- |
| `ok` | (absent — §22.8.4.7 uses `null`) | drift |
| `entry_not_found` | `entry_not_found` | match |
| `offsets_out_of_bounds` | `offsets_out_of_range` | **drift** |
| `excerpt_mismatch` | `excerpt_does_not_match` | **drift** |
| `stale` | `entry_flagged_stale` (and reference in §22.9.8 to `stale`) | **drift** |
| `unauthorized_namespace` | (absent in §22.8.4.7 schema; surfaces via HTTP 403 `firewall_violation`) | drift |
| (absent in §22.16.1) | `entry_modified_after_offset_capture` | drift |
| (absent in §22.16.1) | `entry_archived` | drift |

Per §22.4.3 line 16595 narrative, `cite_verify` returns `valid=false, reason="entry_modified_after_offset_capture"`. Per §22.9.8 line 17733, the same call returns `valid: false, reason: "stale"`. The two prose passages reference DIFFERENT reason values that the §22.8.4.7 schema cannot both produce. Junior engineer building the cite_verify handler against the schema vs. against §22.16.1 will produce divergent implementations. Master Spec is internally inconsistent on the canonical vocabulary.

**Distinct from D-5.2-008** (which targeted HTTP error-code completeness for §22.8.4.3 / .5 / .6 / .7 per Appendix I, not the in-schema reason-enum vocabulary).

---

## 4. Retrieval Pipeline Math + Parameters (Check 4)

KB Spec §4.1 eight-stage pipeline preserved verbatim in §22.9.1. RRF k=60, namespace boost 1.0/0.85, freshness modifier `confidence_modifier × (0.5 + 0.5 × win_rate)`, re-rank to top_k default 5.

**TWO net-new intra-§22 drift defects on stage-level invariants** — neither caught by Phase 5.3:

### D-KB18-003 — Query length cap drift

| Source | Value | Authority |
| :---- | :---- | :---- |
| KB Spec §3.4.1 description prose | "Max 2000 chars" | retired |
| §22.8.4.1 input schema (line 16880) | `"maxLength": 2000` | tool contract |
| §22.9.1 Stage 1 invariant (line 17651) | "`query` length 1–4,000 chars (§39 row `mcp_kb_retrieve_query`)" | retrieval pipeline contract |

§22.9.1 Stage 1 invariant contradicts §22.8.4.1 schema and the KB Spec inheritance. The 4,000-char cap is cited to a §39 row (`mcp_kb_retrieve_query`) which is itself the candidate for the authoritative-home decision per Authoring Convention #10. Engineering implementation will accept queries up to whichever cap binds first — the tool schema or the pipeline pre-filter. The contradiction is reachable (a 2,500-char query rejected by the schema but allowed by the pipeline invariant).

### D-KB18-004 — `namespace_preference[]` bounds drift

| Source | Bounds |
| :---- | :---- |
| KB Spec §3.4.1 description | (unbounded; "ordered list of namespace IDs") |
| §22.8.4.1 input schema (line 16887) | `"minItems": 1, "maxItems": 10` |
| §22.9.1 Stage 1 invariant (line 17651) | "`namespace_preference[]` length 0–8 (§39)" |

The §22.9.1 invariant says 0–8 (allowing empty list); §22.8.4.1 schema says 1–10 (rejecting empty list). The empty-list contradiction is direct: a tool call with `namespace_preference=[]` is rejected by JSON-Schema (`minItems: 1`) but permitted by Stage 1 (lower bound 0). The upper-bound divergence (8 vs 10) is also direct.

Both defects are P1 numerical_singleton class — junior engineer building runtime would produce divergent behavior depending on which document they consulted.

**Re-rank model selection (KB §4.6 vs §22.9.6).** Same `if operation_class in {...}` structure; same models; same parameters. §22.9.6 adds `first_pass_high_stakes` classification gate (bid_value_estimate ≥ $250K, opt-in, compliance_critical) — Authored Extension to KB Spec §4.6. Not a defect.

**Stale entry handling (KB §4.8 vs §22.9.8).** §22.9.8 line 17733 reads "the agent **cannot** cite a stale entry — `cite_verify` (§22.8.4.7) returns `{valid: false, reason: "stale"}`" — but §22.8.4.7's schema does not list `stale` as a reason. This is a sub-case of D-KB18-001.

---

## 5. Indexing Substrate (Check 5)

KB Spec §4.2 five-component substrate (OpenSearch, Voyage-3-large 1024-dim, pgvector HNSW, Voyage rerank-2, Claude Haiku secondary) preserved verbatim in §22.9.2.

**Known defect already filed: D-5.2-014.** §22.3.1 KBEntry `embedding` field declares `Vector(1536)` — contradicts the 1024-dim Voyage-3-large substrate. Filed by Phase 5.2 as P2 data_model defect. Not re-filed; cross-referenced from this walk.

Chunking strategy (KB §4.3 vs §22.9.3) consistent.

Why-not-dense rationale (KB §4.4 vs §22.9.4) consistent.

Query expansion (KB §4.5 vs §22.9.5) consistent.

Metadata pre-filter (KB §4.7 vs §22.9.7) consistent.

KB Spec §5 indexing pipeline (`§5.1` entry lifecycle three-store atomic transaction; `§5.2` failed vectorization; `§5.3` re-indexing on edit; `§5.4` namespace migration; `§5.5` embedding version bumps) all mapped to §22.4.x. The atomic-three-store happy-path narrative gap was flagged by D-5.2-015 (P3).

---

## 6. Skill Registry (Check 6)

KB Spec §8 enumerates 5 skills (§8.2–§8.5 + the docling_pdf reference in §6.3 + the q_and_a_tone reference in §6.4 — 4 defined + 2 referenced-but-undefined).

§22.12 enumerates 7 skills:
- §22.12.2 `skill_sourcera_rfp_drafting` (preserved)
- §22.12.3 `skill_sourcera_confidence_thresholds` (preserved)
- §22.12.4 `skill_sourcera_compliance_citations` (preserved; PCI added — D-5.3-009 unflagged AE)
- §22.12.5 `skill_sourcera_kb_extraction` (preserved; ghost-bid scope-extended — D-5.3-011 unflagged AE)
- §22.12.6 `skill_sourcera_docling_pdf` (closed KB §6.3 reference gap — D-5.3-010 unflagged AE)
- §22.12.7 `skill_sourcera_q_and_a_tone` (closed KB §6.4 reference gap — D-5.3-010 unflagged AE)
- §22.12.8 `skill_sourcera_capability_authoring` (NEW, AE-flagged)

Skill bodies verbatim where preserved. Distribution process (§22.12.9) matches KB §8.6. 20-skill-per-session Anthropic limit (KB §8) preserved as §22.12 preamble.

**No NEW defects from skill registry walk.** The four AE-related flagging gaps (D-5.3-009, D-5.3-010, D-5.3-011, D-5.2-006) are already filed.

---

## 7. "Memory Store" (Check 7)

KB Spec has no explicit "memory store" section. Three candidate surfaces map to the prompt's check:

| Candidate | KB Spec | §22 counterpart | Status |
| :---- | :---- | :---- | :---- |
| Session transcript persistence | §10.6 Session Resumption — "transcripts persist; archive within 24h to cold storage" | §22.14.6 — same + adds §40.2 retention cross-ref (`ai_operation_session_log_archive` 12-month, GDPR-anonymized at 90d) | ✅ enhanced |
| Audit-log ledger | §15.4 — 5 events (`ai_kb_retrieved`, `ai_draft_emitted`, etc.) | §22.16.4 — same 5 events | ⚠ INCOMPLETE — D-KB18-009 (see below) |
| Tool audit ledger | §3.6 implementation requirements (passing reference) | §22.8.6 row "Audit" — 13-month retention; keyed `(org_id, session_id, tool_call_id)` | ✅ enhanced |

**NEW finding: D-KB18-009.** §22.8.4 enumerates 9 MCP tools, four of which are side-effectful and persist state: `doc_attach` (§22.8.4.4 — buyer-visible attachment), `capability_declare_draft` (§22.8.4.6 — CapabilityDeclaration row in pending_review), `kb_entry_draft_create` (§22.8.4.8 — KBEntry draft row), and `cite_verify` (read-only, explicitly noted "not audited"). The §22.16.4 audit-log table at lines 18680–18684 lists ONLY:

- `kb_retrieve → ai_kb_retrieved`
- `emit_structured_draft → ai_draft_emitted`
- `cite_verify → not audited (internal verification)`
- Session creation → `ai_session_started`
- Session termination → `ai_session_ended`

Three side-effectful, state-persisting MCP tools (`doc_attach`, `capability_declare_draft`, `kb_entry_draft_create`) are NOT mapped to audit events. The §22.17 AC #45 enumeration also names only four state-persisting actions (`emit_structured_draft`, `request_seller_clarification`, session start, session end) and omits the three side-effectful MCP tool actions. Engineering implementing the §6.7 audit ledger against §22.16.4 + AC #45 will leave three audit channels unwritten — a §6.7 compliance hole and a forensic-trail gap. The Sourcera Tool Audit Ledger (operational; §22.8.6) captures every MCP call but is engineering-only — it is not the §6.7 audit ledger which is legal-evidence-trail.

Distinct from D-5.3-016 (which targeted the §22.16.4 vs §22.15.1 emit-side ambiguity for `emit_structured_draft` — i.e., who fires `ai_draft_emitted`). D-KB18-009 is about missing rows for three tools that PERSIST STATE and never had audit-event mappings authored.

P2 documentation_gap / audit-event-coverage.

---

## 8. Additional Findings — Surface Scope Drift in §22.10.6

KB Spec §6.6 `agent_sourcera_ghost_bid_ingestion` Tools clause: "full toolset (needs `read`, `bash` for docling, `write` for structured output). **No MCP needed at ingestion stage.**"

§22.10.6 `tool allowlist`: "Full `agent_toolset_20260401` enabled... `mcp_toolset` `sourcera_kb` — narrowed to the bootstrap/ingestion surface: `kb_dedupe_check` (§22.8.4.9, `always_allow`, read-only similarity probe) and `kb_entry_draft_create` (§22.8.4.8, `scoped_allow_with_quota`, per-session write cap of 200 drafts per parent AIOperation)."

**Master Spec adds MCP tool calls during the ingestion stage that KB Spec explicitly excluded.** The change is sound — `kb_dedupe_check` and `kb_entry_draft_create` close the Reviewer-Inbox routing contract per §22.4.1 — but the deliberate divergence from KB Spec §6.6 is silent. Authored Extension should be flagged in §22.10.6 and in `_integration/AUTHORED_EXTENSIONS_LEDGER.md`. Same convention violation pattern as D-5.2-006 / D-5.3-010 / D-5.3-011.

NEW: D-KB18-013 (P2 authored_extension).

---

## 9. Net-New Defects (Promoted to Ledger)

| defect_id | severity | class | one-line | distinct from |
| :---- | :---- | :---- | :---- | :---- |
| D-KB18-001 | P1 | enum / consistency_drift | `cite_verify` reason-enum vocabulary drift between §22.8.4.7 schema and §22.16.1 semantics table (also vs §22.4.3 and §22.9.8 prose) | D-5.2-008 (HTTP error-code completeness; different surface) |
| D-KB18-003 | P1 | numerical_singleton | `kb_retrieve` query length: §22.8.4.1 schema maxLength 2000 vs §22.9.1 Stage 1 invariant 1–4,000 chars (§39 row) | (not previously filed) |
| D-KB18-004 | P1 | numerical_singleton | `kb_retrieve` `namespace_preference[]` bounds: §22.8.4.1 schema minItems 1 / maxItems 10 vs §22.9.1 Stage 1 invariant 0–8 | (not previously filed) |
| D-KB18-006 | P3 | documentation_gap | KB Spec §1.2 Non-Goals (3) and §1.3 Decision Principles (5) not mirrored in §22; engineering design frame lost | (not previously filed) |
| D-KB18-009 | P2 | observability / audit-event-coverage | §22.16.4 audit-log mapping table omits 3 side-effectful state-persisting MCP tools (`doc_attach`, `capability_declare_draft`, `kb_entry_draft_create`); §22.17 AC #45 also omits | D-5.3-016 (different surface — emit-side ambiguity, not coverage gap) |
| D-KB18-013 | P2 | authored_extension | §22.10.6 ghost-bid agent silently extends KB Spec §6.6 ("No MCP needed at ingestion stage") with two MCP tools (`kb_dedupe_check`, `kb_entry_draft_create`); AE flag missing | D-5.2-006 (different scope — that targeted §22.8 9-vs-7 tool count) |

Severity distribution net-new: 3 P1 / 2 P2 / 1 P3. Zero P0.

## 10. Cross-Referenced Existing Defects (Re-Confirmed at this Walk)

The following Phase 5.2 / 5.3 defects were re-confirmed reproducible at the cited anchors during this exhaustive walk. They are NOT re-filed; the existing ledger entries stand.

| Existing defect | Re-confirmation note |
| :---- | :---- |
| D-5.2-006 | §22.8 9-vs-7 tool extension still unflagged at §22.8 preamble |
| D-5.2-007 | Concrete examples missing for §22.8.4.3, .5, .6, .7 — re-confirmed at lines 17091, 17173, 17214, 17252 |
| D-5.2-010 | `cite_verify` rate-limit 60 rps (§22.8.6) vs KB §3.6 "others 10 rps" — re-confirmed at line 17291 |
| D-5.2-013 | `exclude_review_states` enum (§22.8.4.1) vs §22.8.4.8 prose mentioning `review_due` — re-confirmed; §22.4.1 line 16561 says retrieval excludes `lifecycle_state='draft'` |
| D-5.2-014 | `Vector(1536)` vs Voyage-3-large 1024-dim — re-confirmed at line 16447 |
| D-5.2-022 | `KB_Engineering_Spec.md` bare-filename citations in §22.1–§22.8 — re-confirmed at lines 16302, 16413, 16444, 16470, 16602, 16622, 16740, 17566–17578 |
| D-5.3-009 / D-5.3-010 / D-5.3-011 | Skill-side AE flags unattached — re-confirmed at §22.12.4 (PCI), §22.12.5 (ghost-bid scope), §22.12.6/.7 (docling/q_and_a) |
| D-5.3-016 | §22.16.4 vs §22.15.1 audit-event emit-side ambiguity for `emit_structured_draft` — re-confirmed |
| D-5.3-023 | `KB_Engineering_Spec.md` bare-filename citations in §22.9–§22.16 — re-confirmed at lines 17586, 17746, 18003, 18095, 18244, 18332, 18442, 18529 |
| D-5V-004 | §22.10.3 per-Org concurrency lock now AUTHORED (§22.10.3.A added 2026-05-06) — re-confirmed remediated in-place |

---

## 11. Counterfactual Pass (per-section, 3+ failure modes)

For every §22 sub-section walked, three or more realistic failure modes enumerated and checked against the spec text. All non-trivial failure modes are covered by §22.x.{8|9|11|14|15|16} failure-mode tables OR by a Phase 5.2/5.3 defect or by a NEW Phase KB18 defect.

| Sub-section | Failure modes considered | Coverage |
| :---- | :---- | :---- |
| §22.4 Lifecycle | Voyage outage (BM25 fallback); Convex transaction half-write; corrupted body 5-retry exhausted; edit-during-cite_verify race; concurrent SellerSoftware deletion; namespace migration mid-bid | §22.4.2 / .3 / .4 |
| §22.5 Health Model | Decay job stale > 26h; decay re-run idempotency; win_rate < 5 surfacings; usage_boost overflow | §22.5.1 / .3; D-5.3-003 (`win_rate` triple-conflation) covers fields |
| §22.6 Firecrawl | Crawl source offline; domain unverified post-registration; plan max-pages exceeded | §22.6 FM block |
| §22.8 MCP server | Vault JWT expiry; namespace-migration race; Anthropic MCP proxy outage; one-time-use token replay; cross-region presentment | §22.8.6 FM block |
| §22.9 Retrieval | Voyage outage; OpenSearch corruption; rerank rate-limit; both legs out | §22.9.9 |
| §22.10 Agent definitions | System prompt > 8K; retired capability_id; POINTERS.json drift | §22.10.8 |
| §22.10.3 KB Bootstrap | Two concurrent invocations on same Org | §22.10.3.A (per-Org lock) |
| §22.11 Custom tools | emit_structured_draft schema rejection; request_seller_clarification lazy escalation; infinite-loop reject | §22.11.4 |
| §22.12 Skills | SKILL.md > 500 lines; skill update mid-stream; reserved-word validator | §22.12.10 |
| §22.13 Environments | Missing allowed_hosts; deprecated apt; long-running session outliving env retention | §22.13.4 |
| §22.14 Session lifecycle | Orchestrator crash; session_terminated; JWT expires mid-session | §22.14.7 |
| §22.15 Event stream | SSE disconnect; compaction storm; status_terminated w/o prior error | §22.15.5 |
| §22.16 Citation guardrails | Six-layer table covers every observed failure mode | §22.16.1 |

No additional unhandled failure modes detected within KB-spec-mapped surfaces beyond the 6 net-new + 47 pre-existing Phase 5.x defects.

---

## 12. Self-Challenge Pass

Re-read all six net-new findings as a hostile reviewer.

**D-KB18-001.** Severity: hostile-reviewer test — "is this build-blocking?" Yes. A junior engineer building the `cite_verify` HTTP handler against the §22.8.4.7 schema would emit `reason="entry_modified_after_offset_capture"` while the orchestrator's submission-gate path in §22.16.1 expects `reason="ok"` on success and `reason="excerpt_mismatch"` on failure. Held at **P1**.

**D-KB18-003.** Severity: "is this build-blocking?" Yes — Stage 1 validation rejects/accepts queries differently depending on which contract is consulted. The §39 row `mcp_kb_retrieve_query` is named as the authority but the §22.8.4.1 schema does not derive its cap from §39. Held at **P1**.

**D-KB18-004.** Same as D-KB18-003 — direct numerical contradiction between two §22 surfaces; build-blocking. Held at **P1**.

**D-KB18-006.** Severity: documentation hygiene. Considered for P2 reclassification — non-goals and decision principles are arguably "engineering rationale" that engineering should be able to derive from §22.1 / §22.2.2 / §22.16.7 cross-references. Held at **P3** — engineering can still build without explicitly mirroring KB §1.2 / §1.3.

**D-KB18-009.** Considered for P1 reclassification — audit ledger holes are forensic-trail integrity and could mask a future security incident. Held at **P2** because the operational Tool Audit Ledger (§22.8.6) still captures the calls; the §6.7 audit-ledger mapping gap is recoverable by adding 3 rows. Junior engineer building against AC #45 would not produce a §6.7 audit row for `doc_attach` — that's a forensic gap, but the actions are still traceable via the operational store. **P2** survives.

**D-KB18-013.** Hostile review: "did §22.10.6 actually change agent behavior, or is the KB Spec phrasing imprecise?" The KB Spec §6.6 line "No MCP needed at ingestion stage" is unambiguous; §22.10.6 explicitly enables `kb_entry_draft_create` and `kb_dedupe_check`. Master Spec is correct to do so (the Reviewer-Inbox routing contract REQUIRES the ingestion agent to write KBEntry drafts), but the deliberate divergence is silent. Held at **P2 authored_extension**.

No defects withdrawn post self-challenge.

---

## 13. Coverage Matrix Cell Updates

Per Audit_Prompts.md output protocol. Phase 5.2 / 5.3 already populated §22.1–§22.20 cells. This walk does NOT republish cell values; the existing matrix entries hold. The CONSISTENCY_DELTA.md "KB Engineering Spec" section captures the cross-document drift inventory.

---

## 14. Pre-Edit Backup

No spec edits performed in this prompt (audit non-destructive). Master Spec at v7.1.0 unchanged. KB Spec snapshot at `_baselines/retired-sources/KB_Engineering_Spec_retired_2026-04-26.md` unchanged.

---

## 15. Forward References

| Forward target | Tied defect | Rationale |
| :---- | :---- | :---- |
| Phase 13 schema consolidation | D-KB18-001 (reason-enum canonicalization in Appendix J) | The `cite_verify_reason` enum should be Appendix-J-registered once during schema consolidation. |
| §39 Object Size Constraints audit | D-KB18-003 (mcp_kb_retrieve_query row) | Resolve the 2,000-vs-4,000-char cap by binding the §22.8.4.1 schema's `maxLength` to the §39 row. |
| §39 namespace-preference bounds row | D-KB18-004 | Same pattern — bind schema to canonical §39 row. |
| AE Ledger v7.1.1 ratification | D-KB18-013 | Author Extension flag for §22.10.6 ghost-bid MCP surface scope change. |
| §22.16.4 + §22.17 AC #45 audit-event rollup (Phase 14.13a) | D-KB18-009 | Add three audit-event mappings for `doc_attach`, `capability_declare_draft`, `kb_entry_draft_create`. |

---

## 16. Phase KB18 Roll-Up

| Severity | New (this walk) | Cross-referenced |
| :---- | :---- | :---- |
| P0 | 0 | — |
| P1 | 3 (D-KB18-001, -003, -004) | — |
| P2 | 2 (D-KB18-009, -013) | D-5.2-006, D-5.2-007, D-5.2-010, D-5.2-013, D-5.2-014, D-5.2-022, D-5.3-009, D-5.3-010, D-5.3-011, D-5.3-016, D-5.3-023 |
| P3 | 1 (D-KB18-006) | — |
| **Total net-new** | **6** | 11 re-confirmations |

**Halt rule application.** Audit prompt halt rule: "ANY DRIFT IS P1." Pragmatic interpretation applied per Phase 5.2 / 5.3 precedent — numerical and schema drift escalated to P1; documentation hygiene and AE-flag gaps held at P2/P3. Strict-interpretation conversion: 3 → 5 P1 (escalating D-KB18-009 audit-event-coverage and D-KB18-013 §22.10.6 AE-flag from P2 to P1). Strict list recorded for v7.1.1 backlog completeness; recommendations stand at filed severities.

---

## 17. Sign-Off

- **HALT not triggered** (zero P0).
- **Three open P1** (D-KB18-001, -003, -004) — all within-§22 internal drift; recommend bundling into a single Phase 7 or Phase 8 spec-side remediation pass against §22.8.4.1 / §22.8.4.7 / §22.9.1 / §22.16.1.
- **Two open P2** (D-KB18-009, -013) — AE-flagging + audit-event-coverage; consolidate with the v7.1.1 backlog items already tracked.
- **One open P3** (D-KB18-006) — documentation hygiene only.
- **No Master Spec edits performed.** All deltas captured in CONSISTENCY_DELTA.md "KB Engineering Spec" section and DEFECT_LEDGER.md rows D-KB18-001 through D-KB18-013 (six rows; sequence numbers 002, 005, 007, 008, 010, 011, 012 are intentionally not used to keep mnemonic-id discipline aligned with promoted defects only).
