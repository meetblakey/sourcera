# Phase 5.3 — §22.9–§22.20 KB Retrieval / Skills / Lifecycle / Maya Cross-Reference Audit — Scratch Findings Log

**Date:** 2026-05-06
**Auditor model:** Claude Opus
**Audit prompt:** Walk Master Spec §22.9–§22.20 and cross-reference `_versions/KB_Engineering_Spec_retired_2026-04-26.md §4–§18` end-to-end. Run the 10-check matrix from `Audit_Prompts.md → Phase 5.3 — KB Retrieval, Indexing, Skills, Lifecycle (§22.9–§22.20)`.
**Status:** Findings promoted to `DEFECT_LEDGER.md` Phase 5.3 section. This file is the scratch artifact retained per audit-program protocol.

---

## Sources Read (in full)

- `Sourcera_Master_Spec.md` §22.9 (lines 17243–17402), §22.10 (17403–17608) including §22.10.1.A alias table, §22.11 (17609–17699), §22.12 (17701–17848), §22.13 (17850–17936), §22.14 (17938–18046), §22.15 (18048–18133), §22.16 (18135–18419), §22.17 ACs #21–#49 (18421–18475), §22.18 (18476–19023) including §22.18.1–§22.18.7, §22.19 (19025–19088), §22.20 (19091–19359) including §22.20.1–§22.20.8
- `_versions/KB_Engineering_Spec_retired_2026-04-26.md` §4 Retrieval Engineering (lines 443–571) including §4.1–§4.8, §5 Indexing Pipeline (573–631), §6 Managed Agent Definitions (634–777), §7 Custom Tool Contracts (779–847), §8 Skills (850–950), §9 Environments (953–1018), §10 Session Lifecycle (1020–1114), §11 Event Stream Handling (1116–1188), §12 Citation Guardrails (1191–1255), §13 Cost & Caching (1258–1335), §14 Eval Harness (1338–1394), §15 Observability (1396–1432), §16 Rollout & Canary (1436–1466), §17 Failure Modes (1469–1509), §18 Security & Residency (1511–1546)
- `Sourcera_Master_Spec.md` §22.3.1 KBEntry entity (16081–16125) for field-name canonicality verification, §22.5 KB Health Model (16299–16350) for decay-curve / win_rate cross-check, §22.8.4 MCP tool catalog (16503–17199) for retrieval-pipeline → tool I/O cross-check
- `Sourcera_Master_Spec.md` §34.19 Seller Plan Upgrade Carry-Over Guarantee (30145–30249) including §34.19.1 Protected Asset Classes, §34.19.2 KB Value Meter formula and the `Organization.kb_value_meter_score` field claim
- `Sourcera_Master_Spec.md` §51 Product Usage Analytics (40578–41320) for the §22 KB Hero Moment / KB Value Meter / Stake-Reveal event-family registration
- `Sourcera_Master_Spec.md` §1 introduction (62–179) for Appendix L state-machine inventory (`InternalCommentThread, BuyerReferral, Pro Trial Seat Grant, KB Entry, KB Document, Target Account, AIOperation` — `CapabilityDeclaration` NOT in inventory)

## Cross-Reference Walk — Per-Check Results

### Check 1: Retrieval pipeline (§22.9) matches KB Spec §4 — chunking, query expansion, re-rank, metadata pre-filter, stale-entry handling

**Result:** Substantive match across all eight pipeline stages and supporting subsections; **two cross-reference defects** in §22.9.3.

§22.9.1 vs KB Spec §4.1 — The eight-stage pipeline ASCII diagram is reproduced verbatim; Master Spec adds the **Stage-level invariants table** (lines 17306–17317) which is a sound extension introducing per-stage rejection / fallback semantics, schema inputs (e.g., `query` length 1–4,000 chars), and concrete error codes (HTTP 422 `bad_request`, HTTP 503 `retrieval_unavailable`). KB Spec §4.1 had no invariants table.

§22.9.2 Indexing Substrate vs KB Spec §4.2 — Match. Both name OpenSearch / Voyage-3-large / pgvector / Voyage rerank-2 / Claude Haiku secondary; Master Spec §22.9.2 explicitly states Voyage-3-large is **1024-dim** (line 17326), reaffirming D-5.2-014 — the Master Spec §22.3.1 KBEntry entity declares `embedding | Vector(1536)` which is OpenAI/ada-002 dimensionality, not Voyage. The dimensionality conflict is internal to Master Spec (§22.3.1 vs §22.9.2). Re-affirmed; cross-link to D-5.2-014.

§22.9.3 Chunking Strategy vs KB Spec §4.3 — Substantive match; **two cross-reference defects**:

- Line 17338: "long-doc chunking for bootstrap (§22.10.3), ghost-bid RFPs per §22.10.5" — but **§22.10.5 is `agent_sourcera_kb_to_capability`**, NOT ghost-bid. The Ghost-Bid Importer agent is §22.10.6. KB Spec §4.3 said "ghost-bid RFPs per §6" (the Managed Agents chapter, ambiguous). Master Spec resolved the ambiguity but to the wrong sub-section. → **D-5.3-001** filed.

§22.9.4 vs KB Spec §4.4 — Match. Both identify three reasons (rare terms, acronyms / code mentions, query length asymmetry).

§22.9.5 vs KB Spec §4.5 — Match. Master Spec adds explicit YAML file paths (`packages/sourcera-kb-thesaurus/synonyms.yaml` etc.), audit attribute `retrieval_metadata.expansion_applied`, and a CI thesaurus-regression test (sound extensions).

§22.9.6 vs KB Spec §4.6 — Match (verbatim Python pseudocode). Master Spec adds the `first_pass_high_stakes` classification block (line 17378) — sound extension; the cost-base note ($0.0004/retrieval) inherited from KB Spec §4.6.

§22.9.7 vs KB Spec §4.7 — Three reasons match (recall preservation, cost, security). Master Spec extends "Security" with the explicit firewall-pre-filter vs. post-filter argument from §22.8.3.

§22.9.8 vs KB Spec §4.8 — Match plus the §22.17 AC #49 / §22.10 alias-table cross-reference for the `kb_staleness_classifier` capability monopoly on the `exclude_review_states=[]` override.

§22.9.9 Failure Modes — net new in Master Spec; KB Spec §4 had no Counterfactual subsection. Three failure modes enumerated (Voyage outage, OpenSearch corruption, Re-rank rate limit) with explicit handling cited to §22.9.1 stages and §22.16.6 retry curve. Sound extension.

### Check 2: Skills registry (§22.12) matches KB Spec §8

**Result:** Substantive match for the four KB Spec-defined skills; three closures of KB Spec internal gaps; one PCI extension; multiple Authored Extension flagging defects.

KB Spec §8 defined four skills: §8.2 `skill_sourcera_rfp_drafting`, §8.3 `skill_sourcera_confidence_thresholds`, §8.4 `skill_sourcera_compliance_citations`, §8.5 `skill_sourcera_kb_extraction`. KB Spec §6.3 / §6.4 referenced two additional skills (`skill_sourcera_docling_pdf`, `skill_sourcera_q_and_a_tone`) but never gave them §8 definitions. KB Spec §8 also did NOT define `skill_sourcera_capability_authoring` (referenced by KB Spec §6.5).

Master Spec §22.12 adds:

- §22.12.1 Authoring Principles — Match KB Spec §8.1 (six bullets). ✅
- §22.12.2 `skill_sourcera_rfp_drafting` — Match KB Spec §8.2 (full SKILL.md body verbatim, three reference files). ✅
- §22.12.3 `skill_sourcera_confidence_thresholds` — Match KB Spec §8.3 (three threshold rows, plus the §21.4.2 `Default Confidence Threshold` cross-reference, sound extension). ✅
- §22.12.4 `skill_sourcera_compliance_citations` — KB Spec §8.4 listed **4 frameworks** (SOC2, ISO27001, GDPR, HIPAA); Master Spec §22.12.4 lists **5** (adds **PCI** with `doc_attach (category: pci)`). The PCI addition is sound but unflagged as Authored Extension and unregistered in `_integration/RECONCILIATION.md → Authored Extensions`. → **D-5.3-009** filed.
- §22.12.5 `skill_sourcera_kb_extraction` — KB Spec §8.5 says **bootstrap-only**; Master Spec §22.12.5 extends to ALSO be used by `agent_sourcera_ghost_bid_ingestion` (§22.10.6). Sound extension closing a referenced-but-unspec'd usage; unflagged as Authored Extension. → **D-5.3-011** filed.
- §22.12.6 `skill_sourcera_docling_pdf` — KB Spec §6.3 referenced this skill in the bootstrap agent's `skills` list; KB Spec §8 never defined it. Master Spec §22.12.6 closes the gap. Same convention violation pattern as D-5.2-006 (`kb_entry_draft_create` / `kb_dedupe_check` MCP tools) — gap closure unflagged as Authored Extension. → **D-5.3-010** filed.
- §22.12.7 `skill_sourcera_q_and_a_tone` — KB Spec §6.4 referenced; KB Spec §8 never defined. Master Spec §22.12.7 closes gap. Same pattern. → **D-5.3-010** (consolidated with §22.12.6 finding).
- §22.12.8 `skill_sourcera_capability_authoring` — Master Spec correctly flags as **Authored Extension** "flagged in RECONCILIATION.md." ✅
- §22.12.9 Skill Distribution — Match KB Spec §8.6 plus the explicit body length validation (≤ 500 lines per §22.12.1 cap) and `skill_definition_updated` audit-event extension claim — verification deferred to Phase J-Audit (cross-link to D-5.2-019 pattern). → **D-5.3-020** filed.
- §22.12.10 Failure Modes — net new. Sound.

### Check 3: Tool use patterns (§22.11) match KB Spec §7

**Result:** Substantive match plus extension; KB Spec §7.2 schema was truncated and Master Spec §22.11.2 closes the gap (sound extension; one Authored-Extension flag missing).

§22.11.1 `emit_structured_draft` — Master Spec adds `strict: true` to the schema (KB Spec §7.1 schema does NOT carry `strict: true` though §7.3 narrative claims it "is used"). Master Spec also adds the explicit Strict-mode rationale paragraph (sound extension; preserves intent). Server-side handling extension (the ≥ 3 rejections → `agent_emit_draft_repeated_rejection` PostHog event + manual-review prompt) is sound and surfaces a new failure mode KB Spec §7.1 left implicit. Appendix G PostHog event registration deferred to Phase J-Audit / Phase 8.

§22.11.2 `request_seller_clarification` — KB Spec §7.2 input schema was rendered as `{ ... }` (truncated). Master Spec §22.11.2 provides full schema (`requirement_id`, `conflicting_kb_entry_ids` with `minItems: 2`, `summary_of_conflict` with `maxLength: 1000`, `suggested_resolution_paths`). The orchestrator's `kb.draft.needs_clarification` notification event — registered in Appendix C per Master Spec §22.17 AC #17 — is a sound extension. **The truncation closure is itself an Authored Extension** that should be flagged in RECONCILIATION.md alongside §22.12.6 / §22.12.7. Minor; rolled into D-5.3-010 per consolidation.

§22.11.3 Tool Design Discipline — Match KB Spec §7.3 (eight checklist items). Master Spec adds the CI test name `mcp_tool_design_discipline_audit` — sound extension.

§22.11.4 Failure Modes — net new. Sound.

### Check 4: Memory store matches §22 (interpreted as session-state / context-persistence)

**Result:** No explicit "memory store" entity in either spec. Implicit through Anthropic session log + §22.14.6 archival + §22.15.3 idempotency dedup table. Match.

KB Spec §10.6 Session Resumption + KB Spec §11.3 Idempotency cover this. Master Spec §22.14.6 + §22.15.3 reproduce and extend with explicit retention citation (§40.2 `ai_operation_session_log_archive`, 12-month retention, GDPR-anonymized at 90 days for terminated user accounts) and 7-day TTL on `agent_session_event_processed` dedup table. Sound.

No defect filed for "memory store" as such — the spec is silent on a dedicated memory entity because Anthropic's harness owns the in-session memory; Sourcera's persistent memory is the application-layer DB (drafts in BidWorkspace, AIOperation ledger). The check is satisfied.

### Check 5: Indexing substrate (§22.9.2) matches KB Spec §4.2

**Result:** Match between §22.9.2 narrative and KB Spec §4.2; **internal Master Spec inconsistency** between §22.9.2 (1024-dim) and §22.3.1 (Vector(1536)) re-affirmed from D-5.2-014.

Both list the five-component substrate identically: OpenSearch BM25, Voyage-3-large dense embeddings (with `voyage-3` 512-dim option for cost-sensitive tier), pgvector HNSW (`ef_construction=200`, `m=16`, shard by `namespace_id` for >10M entries), Voyage rerank-2 primary, Claude Haiku secondary. Master Spec adds the `KBSubstrateVersion` denormalized record concept (line 17331) for substrate-version pinning per (org_id, namespace_id) — sound extension; not declared as an entity in §4 but acknowledged "engineered alongside §22.3.1 entity tables."

The 1024 (§22.9.2) vs 1536 (§22.3.1 KBEntry `embedding`) dimensionality conflict was filed in Phase 5.2 as **D-5.2-014**; Phase 5.3 confirms §22.9.2 is the canonical side (matches KB Spec §4.2 and Voyage AI documentation).

### Check 6: KB Health Model (§22.5) decay-curve math is explicit

**Result:** Decay curve formula and boundary behavior are explicit; **two underlying-data defects**.

§22.5.1 decay formula:
```
confidence_modifier = clamp(
    base_confidence
    × (1 − (days_since_review / (review_cadence_days × 2)))
    × usage_boost
    × win_rate_modifier,
    min = 0.1, max = 1.5
)
```

Boundary behavior is explicit at `days_since_review = 0` (factor 1.0), `= cadence` (factor 0.5), `= 2×cadence` (factor 0.0), `> 2×cadence` (factor clamped to 0). ✅ The math is explicit and testable.

**Defect (a) — `historical_dismiss_rate` data source.** §22.5.1 line 16319 uses `win_rate_modifier = 1.0 − 0.20 × indicator(historical_dismiss_rate ≥ 0.50)` and the engagement guard (`historical_surface_count ≥ 5 AND historical_dismiss_rate ≥ 0.50`). Neither `historical_dismiss_rate` nor `historical_surface_count` is declared on §22.3.1 KBEntry. Filed in Phase 5.2 as **D-5.2-016**; **re-affirmed and extended** here because §22.9.1 Stage 6 (line 17315) ALSO reads the same family of fields (`win_rate` derived from `recent_usage_count − historical_dismiss_count`). Cross-link D-5.2-016 forward.

**Defect (b) — `win_rate` triple-conflation.** Three different concepts share names without reconciliation:

1. §22.5.1 `win_rate_modifier` — derived from `historical_dismiss_rate` (penalty multiplier 0.80 when dismiss_rate ≥ 0.50).
2. §22.9.1 Stage 6 `win_rate` — derived from `recent_usage_count − historical_dismiss_count`, multiplier `(0.5 + 0.5 × win_rate)` clamped to `[0.5, 1.0]`.
3. §22.18.3.3 `win_rate_weight` — NEW field on KBEntry (Authored Extension), default 0.5, range [0.0, 1.0], updated by EMA (α=0.08) on bid close.

Engineering cannot tell whether these are the same value computed three ways or three independent values. The three formulas are mathematically incompatible (different ranges, different update events, different multiplier shapes). → **D-5.3-003** filed.

### Check 7: KB Hero Moment instrumentation is wired to §51 events

**Result:** KB Hero Moment events are registered in Appendix G; §51.1.5 cross-reference table includes `kb_value_meter_*`, `kb_export_*`, `stake_reveal_rendered_kb_value_capture` under family `kb_core`. ✅ Wiring exists.

The Seller Hero Moment events (`hero_moment_completed`, `hero_moment_latency_breached`, `hero_moment_first_edit`) are emitted from §35 / §49.1 onboarding under family `onboarding_core` per §51.1.5. KB-side stake-reveal and Value-Meter telemetry per §22.18 / §22.20 is registered under `kb_core`. The §51.1.6 AC #1 requires every Appendix-G event to declare exactly one `event_family`; verification of the KB-Domain Appendix-G section's `event_family` annotation is deferred to a downstream Appendix-G sweep. Cross-link to D-5.2-009 / D-5.2-017 (the existing Appendix C / Appendix G coverage debt).

No new P1 defect filed under this check; the instrumentation is wired. Two minor concerns:

- The §22 events reference Appendix G directly (e.g., §22.18.4.3 line 18842) without citing the §51 family contract. Engineers reading §22 in isolation would not know which `event_family` envelope the events must carry. Surfaced as a documentation hygiene point under D-5.3-016 (instrumentation gap rolled into the broader §22-vs-§51 cross-link audit).

### Check 8: Seller Maya Polish (§22.20) — exhaustive: state machine, confidence thresholds, fallback to manual, Authored Extensions ratification, Appendix M.1 row

**Result:** §22.20 is comprehensive in narrative coverage but introduces multiple **unregistered or deferred** schema elements. The fallback-to-manual path is explicitly spec'd; the state machine extension is described but **Appendix L registration is unverified** (the §1 introduction line 179 inventory of Appendix L state machines does NOT include `capability_declaration_state_machine`).

State machine — §22.20.2 says "registered in Appendix L `capability_declaration_state_machine` as row 7a; the existing rows 1–7 are unchanged." But the Master Spec §1 introduction line 179 enumerates Appendix L's seven state machines as `InternalCommentThread, BuyerReferral, Pro Trial Seat Grant, KB Entry, KB Document, Target Account, AIOperation` — no CapabilityDeclaration state machine in the enumeration. Either (a) the enumeration is stale and the CapabilityDeclaration state machine exists in Appendix L unannounced, or (b) §22.20.2 forward-claims a registration that has not landed. → **D-5.3-012** filed.

Confidence thresholds — §22.20.4 three-label compression (`Strong match` / `Likely match` / `Weak match`) is well-defined with the four-engine-bucket → three-label collapse table. The four engine buckets (`strong_match`, `moderate_match`, `weak_match`, `insufficient_signal`) are referenced inline but **not explicitly registered in Appendix J** as an enum (e.g., `marketplace_match_engine_bucket_enum`). § 27.4 may carry the registration; verification deferred. → **D-5.3-013** filed.

Fallback to manual — §22.20.2 Edge Case #2 covers the "<3 evidence entries" fallback to `pending_review`. Edge Case #4 covers upgrade-to-sSt manual-authoring availability. ✅ The fallback paths are explicit. No defect on this dimension.

Authored Extensions ratification — §22.20.7 enumerates 10 Authored Extensions:

1. `pending_review_reason` enum extension `solo_free_auto_publish` — Phase 13 deferral.
2. State-machine row 7a — Phase 13 deferral. (Filed as D-5.3-012.)
3. `display_label_override` field on CapabilityDeclaration — Phase 13 deferral. → **D-5.3-013** filed.
4. `created_via` enum extensions (`kb_to_capability_suggestion_solo_free_auto_publish`, `maya_added_chip`) — Phase 13 deferral.
5. Audit-event action extensions — Phase 13 deferral.
6. `firecrawl_resolution_status_line_variant_enum` (5 values) — Phase 13 deferral; **AC #97 / #98 do not test variant selection**. → **D-5.3-022** filed.
7. `Firecrawl.first_resolved_page_category` field — Phase 13 deferral.
8. PostHog events (7) — Phase 13 deferral.
9. CI gate `seller_maya_surface_abstraction_engine_unchanged` — Phase 14.18 implementation deferral.
10. Pro Trial Seat inheritance — Phase 13 deferral.

The ratification queue is explicit per audit-program convention; the AE Ledger should track each row. The §22.20.7 list does NOT include four entities/fields that other §22.20 rules reference inline (see D-5.3-002 / D-5.3-003 / D-5.3-007). The AE coverage is complete for §22.20-introduced elements but does not catch upstream conflations.

Appendix M.1 row — §22.20.7 #9 references the CI gate; §22.20.8 says "three new Phase 14.8 rows authored in this phase under §22.20." ✅ Per §1 introduction the §M.1 mapping registry exists; verification of the three rows is deferred to Phase 11 (Appendix M coverage sweep).

### Check 9: KB Value Capture (§22 / §6.13.7 in Summary v1.1, integrated) — every §34.19 carry-over guarantee field exists in the data model

**Result:** **Three load-bearing fields are referenced in the carry-over guarantee but not declared on any §4 entity.** Engineering cannot build the upgrade-preservation contract from the spec.

§34.19.1 enumerates 13 Protected Asset Classes and §22.18.5.1 cross-references the KB-specific subset (10 classes). Per AC #74: "An upgrade ... MUST preserve `KBEntry.confidence_score`, `KBEntry.review_state`, `KBEntry.win_rate_weight`, `KBCitationGraphEdge` rows, and `CapabilityDeclarationSuggestion` rows byte-for-byte."

Field-by-field verification against §22.3.1 KBEntry entity:

| Field cited in §34.19 / §22.18.5 | §22.3.1 declaration? | Status |
| :---- | :---- | :---- |
| `KBEntry.id` | ✅ row 16085 | OK |
| `KBEntry.body_markdown` (Class 1) | ✅ row 16092 | OK |
| `KBEntry.confidence_score` | ❌ §22.3.1 declares `base_confidence` (16104) and `confidence_modifier` (16105); no `confidence_score` | **DEFECT** — D-5.3-002 |
| `KBEntry.review_state` | ❌ §22.3.1 declares `status` (16099) — registered as Appendix J `kb_entry_status`; no `review_state` field. (§22.5 uses `review_state` in narrative; §22.4.1 lifecycle table uses `status`. Field-name conflation between `status`, `review_state`, `lifecycle_state` partially filed as D-5.2-003.) | **DEFECT** — extended D-5.2-003 / D-5.3-002 |
| `KBEntry.win_rate_weight` | ❌ §22.3.1 declares neither `win_rate_weight` nor `win_rate`. §22.18.3.3 introduces as Authored Extension. | **DEFECT** — D-5.3-003 |
| `KBNamespace` | ✅ §22.3.4 row 16174 | OK |
| `KBDocument` | ✅ §22.3.2 row 16126 | OK |
| `KBCitationGraphEdge` | ❌ Defined inline at §22.18.3.4 instead of §4 catalog; Authored Extension | **DEFECT** — D-5.3-005 |
| `CapabilityDeclarationSuggestion` | ❌ Referenced at §22.18.3.5; no field table anywhere | **DEFECT** — D-5.3-006 |
| `KBExportJob` | ❌ Defined inline at §22.18.2.1 instead of §4 catalog | **DEFECT** — D-5.3-004 |
| `Organization.kb_value_meter_score` (§34.19.2 line 30195) | ❌ "(new field, Authored Extension; requires §4.x Organization spec update)" | **DEFECT** — D-5.3-007 |
| `Bid Workspace.outcome_debrief_seen_by_user_ids[]` (§22.18.6.2) | ❌ Not in §4.4.1 BidWorkspace table | **DEFECT** — additional finding rolled into D-5.3-008 |

**Three patterns dominate the failures:**

1. **Field-name conflation** — `status` / `review_state` / `lifecycle_state` for the KB entry lifecycle field (already partially D-5.2-003); `confidence_score` / `confidence_modifier` / `base_confidence` for confidence (new D-5.3-002); `win_rate` / `win_rate_modifier` / `win_rate_weight` (new D-5.3-003).
2. **Entity placement** — new entities placed under §22.x.y inline rather than in §4 catalog (KBExportJob / KBCitationGraphEdge / CapabilityDeclarationSuggestion / MCPSessionTokenRecord). Pattern previously filed as D-5.2-005.
3. **Cross-section field references** — §34.19.2 expects `Organization.kb_value_meter_score`; §22.14.4 expects `chain_correlation_id` on the AIOperation parent; §22.18.6.2 expects `BidWorkspace.outcome_debrief_seen_by_user_ids[]`. None of these fields are declared on the cross-referenced entity.

Each is filed as a discrete P1 defect; the cluster represents a systemic Phase 13 schema-consolidation debt that the AE Ledger acknowledges but the v7.1.0 spec does not yet pay down.

### Check 10: KB downgrade behavior — 12-month read-only preservation per §34.19 is reflected in §22 (lifecycle on plan change)

**Result:** **The audit prompt's "12-month" framing is incorrect.** Per Master Spec §34.19.3 the canonical preservation window is **90 days**, not 12 months. §22.18.5.3 explicitly resolves the conflict in favor of 90 days, citing §34.19 / §34.6 and AC #75 (`summary_narrative_12_month_reference_blocked` copy-linter CI rule). The 12-month figure originated in Summary §6.13.7 narrative and was retired at v7.0.0.

§22.18.5.3 lifecycle on plan change is reflected:

- 90-day read-only per §34.19.1 / §34.6 ✅
- Free-tier overflow (entries > 50 cap) preserves read-only with `kb_retrieve` carrying `readonly_mode = true` flag ✅
- After 90 days, overflow entries → `preservation_status = hard_archived` per §34.6 DowngradeExcessDataBucket ✅
- Class-1 asset cannot enter `hard_archived` without §34.6 acknowledgement (§34.19.6 FM #2) ✅

Downgrade confirmation copy is explicitly authored at §22.18.5.3 (line 18891) and §22.18.5 binds to §34.19.4 generic copy template.

This check is **satisfied** by the Master Spec; the audit-prompt language is the side that drifted from the canonical 90-day figure. Worth surfacing as **CLAUDE.md / audit-program text drift** (line 16 of the Phase 5.3 prompt cites "12-month read-only preservation per §34.19" — same error appears in `CLAUDE.md` §10 task-routing; see notes below).

→ **D-5.3-017** filed (P3 — audit-program documentation hygiene; not a Master Spec defect).

---

## Counterfactual Pass

For each §22.9–§22.20 surface audited, three realistic failure modes were enumerated:

- **Retrieval pipeline (§22.9.1)** — Voyage outage, OpenSearch corruption, Re-rank API rate limit. All three handled per §22.9.9 / §22.9.1 invariants. ✅
- **Managed Agent definition rollout (§22.10.7)** — Agent system prompt > 8K, archived `capability_id` reference, POINTERS.json drift. All three handled per §22.10.8. ✅
- **Custom tool emit_structured_draft loop (§22.11)** — Skip `cite_verify`, lazy escalation, retry-loop. All three handled per §22.11.4. ✅
- **Skill body grows past 500 lines (§22.12)** — CI rejection. ✅ Other two failure modes (mid-stream skill update, reserved-words validator) handled per §22.12.10. ✅
- **Environment lifecycle (§22.13)** — Allowed_hosts missing, apt deprecation, retention timer race. All three handled per §22.13.4. ✅
- **Session lifecycle (§22.14)** — Worker crash, session termination mid-batch, vault expiry. All three handled per §22.14.7. ✅
- **Event stream (§22.15)** — SSE disconnect, compaction storm, untyped termination. All three handled per §22.15.5. ✅
- **Observability (§22.16)** — MCP outage, hallucination spike, prompt-injection ingestion. Handled per §22.16.6 / §22.16.7. ✅
- **KB Value Meter Seller Panel (§22.18.4)** — Inflated estimated-value, stale data, console leak. Handled per §22.18.7 FMs. **Render-time clamp absent** — the inflated-value defense is "alerting Ops above $1M/yr" which fires post-render. → **D-5.3-014** filed.
- **Solo / Free auto-publish (§22.20.2)** — Evidence < 3, agent fails resolve canonical id, SIM quarantine. All three handled per §22.20.2 edge cases / failure modes block. ✅
- **Match Score three-label compression (§22.20.4)** — Numeric leak in tooltip, feedback-CTA writes label, mis-routed dispute. All three handled per §22.20.7 FMs / AC #91 / #94 / Edge Case #3. ✅
- **AIOp consumption suppression (§22.20.5)** — Counter accidentally rendered, throttle activates, billing API leaks `cost_priced_rejected_cents_accumulated`. (1) and (2) handled; (3) explicitly cross-referenced to Phase 14.10 §44 contract — verification deferred. → **D-5.3-024** filed.

Out-of-scope items noted (deferred to v7.1.1 backlog or other phases): Org-residency mid-export pause (§22.18.2.6 covers); cross-Org DSAR partial-redaction (§22.18.2.6 covers); Bid Workspace force-closed mid-debrief overlay render (§22.18.6.2 idempotency covers).

## Self-Challenge Pass

Re-read findings as a hostile reviewer:

- **D-5.3-001 (P1) — wrong cross-reference §22.10.5 should be §22.10.6.** Severity considered for P2 reclassification; held at **P1** because junior engineers reading §22.9.3 to identify the long-doc chunking owner will land on the wrong agent (`kb_to_capability` instead of `ghost_bid_ingestion`) and may build the chunking pipeline against the wrong agent definition. Cite-resolution failure in the chunking layer is genuinely build-blocking.
- **D-5.3-002 (P1) — `confidence_score` undeclared.** Considered for P2; held at **P1** because §22.18.3.1 explicitly claims "already defined in §22.3.1 entity table — this subsection describes the compounding behavior, not a new field." The claim is false. §34.19 carry-over AC #74 requires `confidence_score` byte-for-byte preservation on upgrade — a CI test against an undeclared field will fail.
- **D-5.3-003 (P1) — `win_rate` triple-conflation.** Held at **P1** because the three formulas use incompatible ranges and update events. Engineering would build three separate columns or pick one arbitrarily.
- **D-5.3-004 / D-5.3-005 / D-5.3-006 (P1) — entities placed outside §4.** All held at **P1** because §4 is the canonical entity catalog and the CLAUDE.md §11 authoring conventions explicitly require it. Same severity rule as D-5.2-005.
- **D-5.3-007 (P1) — `Organization.kb_value_meter_score` undeclared.** Held at **P1** because §34.19.2 says the field "requires §4.x Organization spec update." That update has not landed; AC #74 + AC #2 of §34.19.7 ("KB Value Meter computation MUST follow the §34.19.2 formula") cannot be tested without the field.
- **D-5.3-008 (P1) — `chain_correlation_id` and `BidWorkspace.outcome_debrief_seen_by_user_ids[]`.** Held at **P1** because both are referenced in load-bearing acceptance criteria (AC #66 outcome-debrief idempotency, ghost-bid chain billing).
- **D-5.3-009 (P2) — PCI addition unflagged AE.** Held at **P2**. Skill-body addition; not engineering-blocking but documentation-hygiene impact.
- **D-5.3-010 (P2) — docling_pdf / q_and_a_tone gap closure unflagged AE.** Held at **P2**. Same hygiene class as D-5.2-006.
- **D-5.3-011 (P2) — kb_extraction scope extension unflagged AE.** Held at **P2**.
- **D-5.3-012 (P1) — Appendix L row 7a unverified.** Held at **P1** because the §1 enumeration omits `capability_declaration_state_machine`. AC #79 is unbuildable without the state machine landing.
- **D-5.3-013 (P2) — display_label_override / engine bucket enum unregistered.** Held at **P2**. Authored-Extension queue covers; verification deferred.
- **D-5.3-014 (P2) — Estimated Value sanity clamp absent.** Considered for P3; held at **P2** because the inflated-value defense is post-render Ops alerting; a seller could see a $5M/yr value briefly before Ops catches.
- **D-5.3-015 (P2) — drift-band terms inlined.** Held at **P2** per the Authoring Convention #10 single-source-of-truth rule (same class as D-5.2-002).
- **D-5.3-016 (P2) — §22.16.4 / §22.15.1 audit-event mapping inconsistency.** Held at **P2** because the inconsistency is between two adjacent §22 sub-sections; engineers will pick one or the other.
- **D-5.3-017 (P3) — audit-program 12-month text.** Held at **P3** — not a Master Spec defect. Surfaced for CLAUDE.md / Audit_Prompts.md correction.
- **D-5.3-018 (P2) — §22.20.5 forward-claim against §48.8.4.** Held at **P2** — verification deferred to Phase 7 §48.8.4 review.
- **D-5.3-019 (P2) — `kb_injection_scanner` registration deferred.** Held at **P2** because the §22.16.7 prompt-injection defense layer #3 is contingent on the capability existing.
- **D-5.3-020 / D-5.3-021 / D-5.3-022 (P3) — Appendix J registration deferrals.** All P3 because they follow the same documentation-hygiene class as D-5.2-019.
- **D-5.3-023 (P2) — KB Spec citation hygiene extension to §22.9–§22.16.** Held at **P2** — extends D-5.2-022.
- **D-5.3-024 (P2) — billing-API leak risk on Solo / Free.** Held at **P2** because cross-reference to Phase 14.10 §44 has not been verified to land the suppression at the API layer.
- **D-5.3-025 (P2) — §22.20.4 vendor_opt_out row mapping.** Held at **P2** — table clarity defect.

No defects withdrawn post self-challenge.

---

## Forward References

| Defect | Forward phase | Reason |
|---|---|---|
| D-5.3-002, D-5.3-003, D-5.3-004, D-5.3-005, D-5.3-006, D-5.3-007, D-5.3-008, D-5.3-013 | Phase 13 (schema consolidation) | Entity / field registration in §4 catalog |
| D-5.3-012 | Phase 13 / Appendix L sweep | Appendix L `capability_declaration_state_machine` row 7a verification |
| D-5.3-013 | Phase J-Audit | Engine bucket enum registration |
| D-5.3-018 | Phase 7 | §48.8.4 surface suppression for Solo / Free |
| D-5.3-019, D-5.3-024 | Phase 14.10 audit | §44 / §21.4.3 capability registrations |
| D-5.3-020, D-5.3-021, D-5.3-022 | Phase J-Audit | Appendix J enum verifications (consolidated with D-5.2-019) |
| D-5.3-023 | Phase 14 | KB Spec citation hygiene cross-cuts |
| D-5.3-017 | Audit-program self-correction | CLAUDE.md §10 task-routing line and Audit_Prompts.md prompt 5.3 line 1535 |

## Phase 5.3 Sign-Off

- 25 defects promoted (0 P0 / 9 P1 / 13 P2 / 3 P3).
- Sub-prompt HALT not triggered (zero P0).
- 9 open P1 defects in §22.9–§22.20 scope advance to Phase 5 V (verification) gate; cluster includes (a) wrong cross-reference §22.10.5 vs §22.10.6 (D-5.3-001), (b) `confidence_score` field-name conflation (D-5.3-002), (c) `win_rate` triple-conflation (D-5.3-003), (d) three entities placed outside §4 catalog (D-5.3-004 / D-5.3-005 / D-5.3-006), (e) `Organization.kb_value_meter_score` undeclared (D-5.3-007), (f) `chain_correlation_id` / `outcome_debrief_seen_by_user_ids[]` undeclared (D-5.3-008), (g) Appendix L `capability_declaration_state_machine` row 7a unregistered / unverified (D-5.3-012).
- Master Spec unchanged (audit non-destructive).
- Backup not required (no edits).
- AE Ledger touch points: D-5.3-009 (PCI), D-5.3-010 (docling_pdf / q_and_a_tone), D-5.3-011 (kb_extraction scope) all warrant new AE rows in `_integration/AUTHORED_EXTENSIONS_LEDGER.md`.
