# Phase 3 Adversarial Verification — §22 Seller Console — Knowledge Base (KB Engineering Spec → Master Spec Integration)

**Scope.** Verification of the Phase 3 integration of `KB_Engineering_Spec.md` (§0–§20) into `Sourcera_Master_Spec.md` as the rewritten §22 (Seller Console — Knowledge Base) including the §22.1 → §22.17 subsection tree, the 5 Managed Agent definitions (§22.10.2–§22.10.6), the 7 MCP tool contracts (§22.8.4.1–§22.8.4.7), and the supporting Capability Registry rows (§21.4.1 / §21.4.1.A / §21.4.2), AIWallet budget surface (§21.5), and the explicit deprecation of Claude Agent SDK as an implementation primitive (§22.2.2, §22.16.9).

**Reviewer role.** Hostile — actively looking for reasons the bundle should not ship as v7.0.0. Every claim in §22 cross-read line-by-line against KB Engineering Spec §0–§20 and against §21.4 / §21.5 / §34.10 / §34.11. Drift reported even where §22 is internally consistent.

**Baseline (Phase 3 pre-integration).** `_baselines/Sourcera_Master_Spec_v6.0.0.md` §22 placeholder (retrieval + citation discipline stub; no MCP server; no Managed Agent definitions; no KB Entry lifecycle; no Ghost-Bid Importer; no Capability Registry rows for `kb_bootstrap`, `ghost_rfp_ingestion`, `first_pass_responses`, `capability_declaration_suggest`, or `document_attach_suggest`).

**Target.** `/Sourcera/Sourcera_Master_Spec.md` (current working copy; §22 = §22.1–§22.17; §21.4 = §21.4.1 → §21.4.5 + augmentations; §21.5 = AIWallet-referenced surface).

**Historical integration inputs (resolved in the 2026-04-18 hierarchy).**
1. `Sourcera_Master_Spec.md` — authoritative build specification (target).
2. `Sourcera_Buyer_Pricing_Strategy.md` + `Sourcera_Seller_Pricing_Strategy.md` — authoritative for pricing, AIOperations, entitlement.
3. `KB_Engineering_Spec.md` — historical Phase 3 integration input for Seller KB / MCP / Managed Agent / Retrieval / Indexing; Master Spec §22 is the current authority.
4. `Sourcera_Master_Summary.md` — historical input for concepts not yet integrated at this pass; superseded by the Master Spec after v7.0.0 integration and never current authority.

**Verification date.** 2026-04-18.

**Current-authority supersession (2026-07-11).** The list above records the April 2026 integration context. For all current KB, MCP, Managed Agent, retrieval, and indexing work, Master Spec §22 is canonical; the retired KB Engineering Spec and Master Summary are historical provenance only. This note governs future use of this log without changing its dated findings.

**Verification protocol.** The six Phase 3 verification items are scored **PASS / PARTIAL / FAIL**. Each carries a structural test, an adversarial sub-finding pass, and a remediation name per finding. Sign-off recommendation in §7.

**Non-modification warrant.** This verification does NOT modify `Sourcera_Master_Spec.md`. No edits to §21 / §22 / §34 / Appendices were made in the course of this audit; the single deliverable is this file. Remediation recommendations are named for Phase 4 remediation and tracked into `_integration/RECONCILIATION.md` separately.

---

## 1. ITEM 1 — KB Engineering Spec §0–§18 Coverage by §22

### 1.1 Coverage Map

Every section of KB Engineering Spec §0–§18 MUST be represented in §22. The mapping below cites both the KB Spec source section and the §22 destination anchor, and records the mapping as **Verbatim** (normalized into Master Spec voice but content-complete), **Distributed** (KB Spec content split across multiple §22 subsections), **Forward-Referenced** (KB Spec content cited, not restated, because its authoritative home is elsewhere in Master Spec), or **Gap** (material content missing).

| KB Spec § | KB Spec Title | §22 Destination | Evidence (§22 anchor + line range) | Mapping Class | Status |
| :---- | :---- | :---- | :---- | :---- | :---- |
| §0 | Document Map | §22.1 Purpose & Scope | L11292–11312 (§22.1 preamble + scope bullets) | Distributed | PASS |
| §1 | Goals & Non-Goals | §22.1 Purpose & Scope | L11292–11312; goals restated as §22.1 scope bullets | Verbatim | PASS |
| §2 | Architectural Overview | §22.2 Architectural Overview | §22.2.1 Layered Model (L11317); §22.2.2 Why Managed Agents, Not Agent SDK (L11376); §22.2.3 Beta Header & Version Pinning (L11405) | Verbatim | PASS |
| §3 | The Sourcera KB MCP Server | §22.8 The Sourcera KB MCP Server | §22.8.1 Why MCP (L11757); §22.8.2 Registration on the Agent (L11772); §22.8.3 Vault Auth at Session Creation (L11803); §22.8.4 Tools Exposed (L11859); §22.8.5 Permission Policy (L12306); §22.8.6 Implementation Requirements (L12326) | Verbatim | PASS |
| §4 | Retrieval Engineering | §22.9 Retrieval Engineering | §22.9.1 Pipeline (L12352); §22.9.2 Indexing Substrate (L12424); §22.9.3 Chunking (L12438); §22.9.4 Why Not Just Dense (L12446); §22.9.5 Query Expansion (L12456); §22.9.6 Re-Rank Model Selection (L12468); §22.9.7 Metadata Pre-Filter (L12485); §22.9.8 Stale Entry Handling (L12493); §22.9.9 Failure Modes (L12500) | Verbatim | PASS |
| §5 | Indexing Pipeline | §22.4 KB Entry Lifecycle & Indexing Pipeline | §22.4.1 Entry Lifecycle (L11547); §22.4.2 Failed Vectorization (L11574); §22.4.3 Re-Indexing on Entry Edit (L11594); §22.4.4 Namespace Migration (L11610); §22.4.5 Embedding Version Bumps (L11631) | Verbatim | PASS |
| §6 | Managed Agent Definitions | §22.10 Managed Agent Definitions | §22.10.1 Conventions (L12512); §22.10.2 first_pass_responder (L12521); §22.10.3 kb_bootstrap (L12614); §22.10.4 q_and_a_suggestion (L12629); §22.10.5 kb_to_capability (L12644); §22.10.6 ghost_bid_ingestion (L12659); §22.10.7 Update Workflow (L12674); §22.10.8 Failure Modes (L12683) | Verbatim | PASS |
| §7 | Custom Tool Contracts (Client-Side) | §22.11 Custom Tool Contracts | §22.11.1 emit_structured_draft (L12695); §22.11.2 request_seller_clarification (L12735); §22.11.3 Tool Design Discipline (L12760); §22.11.4 Failure Modes (L12775) | Verbatim | PASS |
| §8 | Skills | §22.12 Skills | §22.12.1 Skill Authoring Principles (L12787); §22.12.2 rfp_drafting (L12796); §22.12.3 confidence_thresholds (L12854); §22.12.4 compliance_citations (L12866); §22.12.5 kb_extraction (L12876); §22.12.6 docling_pdf (L12885); §22.12.7 q_and_a_tone (L12893); §22.12.8 capability_authoring (Authored Extension) (L12902); §22.12.9 Distribution (L12913); §22.12.10 Failure Modes (L12924) | Verbatim + 1 Authored Extension | PASS |
| §9 | Environments | §22.13 Environments | §22.13.1 kb_runner (L12936); §22.13.2 bootstrap (L12974); §22.13.3 Lifecycle (L13006); §22.13.4 Failure Modes (L13012) | Verbatim | PASS |
| §10 | Session Lifecycle — Per-Capability Flows | §22.14 Session Lifecycle | §22.14.1 First-Pass Flow (L13024); §22.14.2 Q&A (L13082); §22.14.3 KB-to-Capability (L13088); §22.14.4 Ghost-Bid Importer (L13094); §22.14.5 Interruption & Steering (L13104); §22.14.6 Resumption (L13112); §22.14.7 Failure Modes (L13122) | Verbatim | PASS |
| §11 | Event Stream Handling | §22.15 Event Stream Handling | §22.15.1 Event Types Consumed (L13134); §22.15.2 Orchestrator Implementation (L13158); §22.15.3 Idempotency (L13192); §22.15.4 Back-Pressure & Rate Limits (L13198); §22.15.5 Failure Modes (L13209) | Verbatim | PASS |
| §12 | Citation, Provenance & Anti-Hallucination Guardrails | §22.16.1 Citation Guardrails | §22.16.1 (L13221) | Verbatim | PASS |
| §13 | Cost, Performance & Prompt Caching Discipline | §22.16.2 Cost, Performance & Prompt Caching Discipline | §22.16.2 (L13261). §13.2 per-capability cost rows are **Forward-Referenced** to §21.4.2 (authoritative home for `cost_base`, `value_price`, `cost_price`, `typical_tokens`) per Authoring Convention #10. §22.16.2 is the *behavioral* discipline surface. | Distributed (behavioral in §22.16.2; pricing in §21.4.2) | PASS |
| §14 | Evaluation Harness | §22.16.3 Evaluation Harness | §22.16.3 (L13296) | Verbatim | PASS |
| §15 | Observability & Metrics | §22.16.4 Observability & Metrics | §22.16.4 (L13344) | Verbatim | PASS |
| §16 | Rollout, Versioning, Canary | §22.16.5 Rollout, Versioning, Canary | §22.16.5 (L13378) | Verbatim | PASS |
| §17 | Failure Modes & Recovery | §22.16.6 Failure Modes & Recovery | §22.16.6 (L13402) | Verbatim | PASS |
| §18 | Security, Firewall & Residency Enforcement | §22.16.7 Security, Firewall & Residency Enforcement | §22.16.7 (L13442) | Verbatim | PASS |

**Out-of-scope-for-Item-1 but registered.** KB Spec §19 (References) → §22.16.9 (L13482); KB Spec §20 (Open Items) → §22.16.8 (L13469). Both are present and registered; not part of the Item-1 §0–§18 coverage requirement but noted for completeness.

### 1.2 Adversarial Sub-Findings

**Sub-finding 1.A (LOW).** KB Spec §13.2 per-capability typical-tokens / cost-base rows ARE intentionally relocated to §21.4.2 rather than duplicated inside §22.16.2. This satisfies Authoring Convention #10 ("every dollar figure has one authoritative home") but creates a potential seam where a reader of §22.16.2 in isolation does not see the per-capability cost table. **Not a defect** — §22.16.2 contains a forward-reference anchor to §21.4.2. Verified on read. Retained as a LOW observation only.

**Sub-finding 1.B (LOW).** KB Spec §6.7 (Agent Update Workflow) maps to §22.10.7. KB Spec §6.7 originally carried the "1 lifetime free per Org" override for `kb_bootstrap` and `ghost_rfp_ingestion`. In the integrated §22, that override is correctly **relocated** to §21.4.4 (Free-Plan Access Rules, L11132–11138) — the authoritative Free Allowance home per §4.8.7. §22.10.3 and §22.10.6 retain the cross-reference ("1 lifetime free per Org per Summary C.73 / SPS §9") to maintain discoverability. **Not a defect.**

**Sub-finding 1.C (MEDIUM, observed).** §22.4 Indexing Pipeline maps to KB Spec §5. §22.4 is complete as authored but omits the **review queue** routing surface described informally in KB Spec §5 ("seller review before promotion to `active`"). §22.4.1 L11574 carries the lifecycle state transitions but does not enumerate the reviewer-inbox routing rules. The authoritative home for reviewer inbox routing is §22.10.3 (KB Bootstrap agent) + §22.8.4.6 (`capability_declare_draft` → `pending_review` state) + Appendix C (`capability_declaration_pending_review` notification). Coverage is therefore complete-by-composition, but a reader of §22.4 in isolation does not see the reviewer routing. **Recommendation (Phase 4):** Add a one-sentence forward-reference in §22.4.1 ("Proposed entries from `kb_bootstrap` sessions enter `pending_review` state; reviewer routing per §22.10.3 / §22.8.4.6 / Appendix C `capability_declaration_pending_review`"). Severity LOW.

**Sub-finding 1.D (LOW, observed).** KB Spec §5 references a **namespace migration** lifecycle event (§22.4.4, L11610). The §22 absorption retains the migration state-machine but KB Spec §5 also referenced **backfill** as a distinct concept (re-indexing on embedding-version bump without namespace change). The §22 integration retains this distinction at §22.4.5 (L11631, Embedding Version Bumps). **Not a defect.**

**Sub-finding 1.E (LOW).** KB Spec §18.3 Data Residency enforcement detail maps to §22.16.7 (L13442). §22.16.7 is internally consistent but does not re-enumerate the per-region (US / EU / custom) residency behavior table; it forward-references §40 (Data Retention) and §6.8 (DSAR). Coverage is complete-by-composition. **Not a defect.**

### 1.3 Item 1 Sign-off

**ITEM 1 RESULT: PASS.** All 19 KB Engineering Spec sections §0–§18 are represented in §22 with mapping class recorded. Zero Gaps. Four LOW observations (1.A, 1.B, 1.D, 1.E) and one LOW-upgraded-from-MEDIUM observation (1.C) are non-blocking and logged for Phase 4 cleanup consideration.

---

## 2. ITEM 2 — Managed Agent Definition Field Completeness

### 2.1 Structural Test

Every Managed Agent documented in §22.10 MUST carry **all six required fields**: (a) `id` (agent definition pointer); (b) `model` (model tier); (c) `tool allowlist` (explicit enable/disable per toolset — `agent_toolset_20260401`, `mcp_toolset`, custom tools); (d) `skills` (skill id + version); (e) `environment` (environment pointer + version); (f) **OutcomeContract** cross-link (§34.11 / §21.4.5 reference with signal, window, auto-accept).

### 2.2 Agent-by-Agent Completeness Matrix

| Agent | §22 Anchor | id | model | tool allowlist | skill list | environment | OutcomeContract | Verdict |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `agent_sourcera_first_pass_responder` | §22.10.2 (L12521) | `agent_sourcera_first_pass_responder_v17` | `claude-sonnet-4-6` default; `claude-opus-4-6` when `first_pass_high_stakes` (§22.9.6) | `agent_toolset_20260401` — read/grep/glob enabled, all others disabled; MCP `sourcera_kb` with `kb_retrieve`, `kb_get_entry`, `document_library_find`, `doc_attach`, `cite_verify`; custom tools `emit_structured_draft`, `request_seller_clarification` | `skill_sourcera_rfp_drafting`, `skill_sourcera_compliance_citations`, `skill_sourcera_confidence_thresholds` | `env_sourcera_kb_runner_v3` (§22.13.1) | §34.11.1 `first_pass_rfp_draft` — ≥ 50% draft retained in submitted bid; window 14d or on bid submission | PASS |
| `agent_sourcera_kb_bootstrap` | §22.10.3 (L12614) | `agent_sourcera_kb_bootstrap_v9` | `claude-opus-4-6` (deep extraction, one-shot per run) | Full `agent_toolset_20260401` (`bash`, `web_fetch`, `read`, `write`, `edit`); MCP `sourcera_kb` narrowed to `kb_entry_draft_create`, `kb_dedupe_check` (both `always_ask` per §22.8.5) | `skill_sourcera_kb_extraction` (bootstrap-only; §22.12.5), `skill_sourcera_docling_pdf` | `env_sourcera_bootstrap_v2` (§22.13.2) | §34.11.1 `kb_bootstrap` — ≥ 60% of proposed entries approved within 30d; `requires_explicit_user_signal=true` | PASS |
| `agent_sourcera_q_and_a_suggestion` | §22.10.4 (L12629) | `agent_sourcera_q_and_a_suggestion_v6` | `claude-sonnet-4-6` | MCP `sourcera_kb` with `kb_retrieve`, `kb_get_entry`, `cite_verify`; `agent_toolset_20260401` fully disabled; no custom tools | `skill_sourcera_rfp_drafting`, `skill_sourcera_q_and_a_tone` (§22.12.7) | `env_sourcera_kb_runner_v3` (§22.13.1) | §21.4.5 `qa_suggestion` — suggested answer sent with ≤ 30% edit distance; window 7d | PASS |
| `agent_sourcera_kb_to_capability` | §22.10.5 (L12644) | `agent_sourcera_kb_to_capability_v4` | `claude-haiku-4-5` (high-volume classification + drafting) | MCP `sourcera_kb` with `kb_retrieve`, `capability_find`, `capability_declare_draft`; no filesystem tools | `skill_sourcera_capability_authoring` (Authored Extension; §22.12.8) | `env_sourcera_kb_runner_v3` (§22.13.1) | §21.4.5 `kb_to_capability_suggestion` — Capability Declaration published within 14d | PASS |
| `agent_sourcera_ghost_bid_ingestion` | §22.10.6 (L12659) | `agent_sourcera_ghost_bid_ingestion_v3` | `claude-opus-4-6` (rare invocations; quality-over-cost) | Full `agent_toolset_20260401` (`read`, `bash` for `docling`, `write` for structured output); **no MCP** at ingestion stage (parsed entries persisted server-side from structured output, not via `kb_entry_draft_create`) | `skill_sourcera_kb_extraction`, `skill_sourcera_docling_pdf` | `env_sourcera_bootstrap_v2` (§22.13.2) | §34.11.1 `ghost_rfp_ingestion` — resulting KB entries cited in a future bid within 90d; `requires_explicit_user_signal=true` | PASS |

All five agents carry all six required fields. Each also carries `version` (Sourcera internal + Anthropic pinned), `update workflow ref` (§22.10.7), and a capability cross-link (§21.4 row). The definition table format codified at §22.10.1 L12519 is honored on all five.

### 2.3 Adversarial Sub-Findings

**Sub-finding 2.A (PASS).** Tool allowlists are **explicit at the per-toolset level**, not implicit. Anthropic's Managed Agents `agent_toolset_20260401` default is "everything on"; Sourcera overrides this with `default_config: {enabled: false}` and per-name opt-in per the Tools (JSON) block at L12574–12586. This satisfies the Master Spec authoring discipline of defense-in-depth minimization and the §22.16.7 prompt-injection-defense layering principle. Verified.

**Sub-finding 2.B (PASS).** Every agent's OutcomeContract cross-link names the specific per-capability row in §21.4.5 or §34.11.1. `auto_accept_after_seconds` is referenced (either via the signal window or the `requires_explicit_user_signal=true` flag) for all five. The two agents that carry `requires_explicit_user_signal=true` (`kb_bootstrap`, `ghost_rfp_ingestion`) are the two with outcome signals that cannot be inferred from user-dismissal-on-timer alone per §21.4.5.A #4 (indefinite `pending` forced to `rejected` at window expiry). Design verified.

**Sub-finding 2.C (LOW, observed).** §22.10.2 First-Pass Responder's OutcomeContract cites `first_pass_rfp_draft` as the §34.11.1 signal id. §21.4.2 row 3 uses `first_pass_responses` as the `capability_id`. §34.11.1 and §21.4.2 must agree — per §21.4.1.A "Canonical-ID reconciliation note" (L11063), KB Spec `first_pass_response` (singular, per-requirement) is an alias of Master Spec `first_pass_responses` (batch-of-100, §21.4.2), and the §22.10.2 cross-link text uses `first_pass_rfp_draft` as the OutcomeContract signal-contract name, which is a *third* spelling. **Not a ship-blocker** because `CapabilityRegistryEntry.aliases` (§4.8.2) stores all three, but the spelling divergence is a documentation hazard for a downstream reader. **Recommendation (Phase 4):** Either (a) normalize the OutcomeContract signal-contract id in §22.10.2 and §22.10.6 to match the §21.4.2 `capability_id` (preferred), or (b) add an explicit alias table in §22.10.1 recording the three-way mapping. Severity LOW.

**Sub-finding 2.D (MEDIUM, observed).** §22.10.3 `kb_bootstrap` agent has a narrowed MCP scope of `kb_entry_draft_create`, `kb_dedupe_check`. These two MCP tools are NOT documented in §22.8.4 (§22.8.4 documents the 7 read-side tools: `kb_retrieve`, `kb_get_entry`, `document_library_find`, `doc_attach`, `capability_find`, `capability_declare_draft`, `cite_verify`). The §22.10.3 table carries a parenthetical ("Extension hooks `kb_entry_draft_create` and `kb_dedupe_check` are the engineering-side draft-write paths exposed by the MCP server in addition to the §22.8.4 read-side surface; both are flagged `always_ask` per §22.8.5.") that acknowledges this but does not fully author them at §22.8.4 fidelity. **This is an Authored-Extension admission, not a specification gap** — the §22.10.3 parenthetical signals that these tools are engineering surfaces added to the MCP server beyond the customer-facing §22.8.4 surface. **Recommendation (Phase 4):** Either (a) author §22.8.4.8 `kb_entry_draft_create` and §22.8.4.9 `kb_dedupe_check` at the same fidelity as §22.8.4.1–§22.8.4.7 (preferred; eliminates the hidden-surface ambiguity and brings both into Appendix J `mcp_tool_name` registry — see also Item 3 Finding 3.C), or (b) move them into a clearly-labeled §22.8.4.I "Engineering-only MCP Hooks" subsection. Severity MEDIUM for documentation integrity; LOW for ship-readiness because the parenthetical does identify them.

**Sub-finding 2.E (PASS).** The §22.10.7 Agent Update Workflow (6 steps) is present and cross-references the §22.16.3 Eval Harness pre-release gate, the §22.16.5 canary rollout staging, and the §6.7 Audit Ledger for the `agent_definition_updated` action (with Appendix J extension flagged). Verified.

**Sub-finding 2.F (PASS).** §22.10.1 codifies the 8K-char system-prompt cap on the agent definition; §22.10.8 Failure Mode #1 confirms CI enforces on every PR. The skill-migration path (§22.12) is the overflow destination. Verified.

### 2.4 Item 2 Sign-off

**ITEM 2 RESULT: PASS.** All 5 Managed Agents carry all 6 required fields plus the standard `version` / `update workflow ref` / capability cross-link supplementary fields. One LOW observation (2.C) and one MEDIUM observation (2.D) logged for Phase 4 documentation cleanup.

---

## 3. ITEM 3 — MCP Tool Contract Field Completeness

### 3.1 Structural Test

Every MCP tool exposed by the Sourcera KB MCP Server (§22.8.4) MUST carry **all five required fields**: (a) **auth** (how the call is authenticated); (b) **request schema** (JSON Schema input); (c) **response schema** (JSON Schema output); (d) **permission scope** (`always_allow` vs `always_ask` per §22.8.5); (e) **rate limit class** (per-session rps).

### 3.2 Tool-by-Tool Completeness Matrix

§22.8.4 preamble (L11861–11867) establishes that **every tool** authenticates via the Vault-issued JWT bearer (§22.8.3), rejects on missing/invalid token with HTTP 401 `mcp_auth_required` or 403 `mcp_auth_invalid` (Appendix I), records a per-tool span linked to `parent_aioperation_id`, counts toward the per-tool rate limit (§22.8.6), and does not itself debit the AIWallet (parent AIOperation accounting only — sub-operation cost-base per §4.8.6). This applies uniformly to all seven tools.

§22.8.5 (L12306) establishes the permission policy: default `always_ask` per Anthropic MCP docs; side-effectful tools (`doc_attach`, `capability_declare_draft`) are pinned `always_ask`; read-only retrieval tools (`kb_retrieve`, `kb_get_entry`, `document_library_find`, `capability_find`, `cite_verify`) can be promoted to `always_allow` on a per-Org basis via Seller Console → Settings → Agent → MCP Permissions.

| MCP Tool | §22 Anchor | Auth | Request Schema | Response Schema | Permission Scope | Rate Limit | Verdict |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `kb_retrieve` | §22.8.4.1 (L11880) | JWT bearer (§22.8.3) | `query`, `namespace_preference`, `filters{compliance_framework, region, kind, customer_segment, language, exclude_review_states}`, `top_k` (default 5, max 10), `max_excerpt_chars` (default 400, max 1000). `required: [query, namespace_preference]` | `hits[{kb_entry_id, namespace_id, namespace_kind, kind, title, excerpt, excerpt_offsets, confidence, freshness, win_rate, evidence_refs[]}]`, `total_matches`, `retrieval_metadata{bm25_candidates, dense_candidates, reranker_used, elapsed_ms}` | `always_allow`-eligible (read-only) | **60 rps per session** | PASS |
| `kb_get_entry` | §22.8.4.2 (L12036) | JWT bearer (§22.8.3) | `kb_entry_id` (required) | `kb_entry_id`, `body_markdown`, `metadata{topic_tags, compliance_framework, customer_segment, language}`, `references[{doc_id, title, expiration}]`, `review_state`, `last_reviewed_at` | `always_allow`-eligible (read-only) | **30 rps per session** | PASS |
| `document_library_find` | §22.8.4.3 (L12104) | JWT bearer (§22.8.3) | `query` (max 500), `compliance_framework` enum, `require_unexpired` (default true) | `matches[{doc_id, title, framework, issued_at, expires_at, file_url (null), attach_ref}]` | `always_allow`-eligible (read-only) | **10 rps per session** | PASS |
| `doc_attach` | §22.8.4.4 (L12148) | JWT bearer (§22.8.3) | `response_slot_id`, `attach_ref` (30-min TTL) | `status: "attached"`, `attachment_id` | **`always_ask` (pinned)** — side-effectful; writes to buyer-visible surface | **10 rps per session** | PASS |
| `capability_find` | §22.8.4.5 (L12186) | JWT bearer (§22.8.3) | `query` (max 500), `namespace_preference[]`, `top_k` (default 5, max 10) | `hits[{capability_declaration_id, title, category, kind, evidence_kb_entry_ids[], confidence}]` | `always_allow`-eligible (read-only) | **10 rps per session** | PASS |
| `capability_declare_draft` | §22.8.4.6 (L12227) | JWT bearer (§22.8.3) | `title` (max 200), `category` enum, `kind` enum, `evidence_kb_entry_ids[]` (minItems 1), `summary_markdown` (max 5000) | `capability_declaration_id`, `status: "pending_review"` | **`always_ask` (pinned)** — side-effectful; writes `CapabilityDeclaration` row in `pending_review` | **10 rps per session** | PASS |
| `cite_verify` | §22.8.4.7 (L12264) | JWT bearer (§22.8.3) | `kb_entry_id`, `excerpt` (max 2000), `claimed_offsets` [start, end] | `valid: boolean`, `reason: null \| entry_modified_after_offset_capture \| offsets_out_of_range \| excerpt_does_not_match \| entry_not_found \| entry_archived \| entry_flagged_stale` | `always_allow`-eligible (read-only) | **60 rps per session** (matched to `kb_retrieve` — every retrieval implies one verify per cited excerpt) | PASS |

All seven tools carry all five required fields. Per §22.8.4 preamble L11861, all seven are registered in Appendix J `mcp_tool_name`. Error envelope per §22.8.6 is authored at L12022–12032 and inherited uniformly.

### 3.3 Adversarial Sub-Findings

**Sub-finding 3.A (PASS).** Every tool specifies a **structural error envelope** (`error.type` enum across `rate_limit_exceeded | invalid_namespace | stale_token | not_found | firewall_violation | wrong_region`) at §22.8.4.1 L12022, inherited by §22.8.4.2–§22.8.4.7. Side-effectful tools additionally specify their side-effect-specific error codes: `doc_attach` has `stale_attach_ref`, `wrong_response_slot`, `doc_no_longer_active`; `capability_declare_draft` carries a `missing_evidence` implicit error (1+ `kb_entry_id` required by the input schema). Registration in Appendix I is cited; verified.

**Sub-finding 3.B (PASS).** The §22.8.4 preamble's MCP-tool-to-AIOperation-settlement table (L11870–11878) correctly distinguishes "sub-operation" calls (accumulated into parent AIOperation cost base via per-tool spans) from "side-effectful" calls that **contribute to the parent capability's `accepted` signal** per §21.4.5 (`doc_attach` success → contributing signal; `capability_declare_draft` success → `pending_review` → `published` is the settlement signal). This is the AIOperation-ledger integrity discipline and is correct.

**Sub-finding 3.C (MEDIUM, observed).** §22.10.3 `kb_bootstrap` references `kb_entry_draft_create` and `kb_dedupe_check` as MCP tools in the agent's `tool allowlist`. Neither is documented in §22.8.4.1–§22.8.4.7. This is the cross-item variant of Finding 2.D. The §22.10.3 parenthetical describes them as "engineering-side draft-write paths exposed by the MCP server in addition to the §22.8.4 read-side surface," both flagged `always_ask` per §22.8.5. **Consequence:** Item 3's structural test ("every MCP tool exposed by the Sourcera KB MCP Server has all five required fields") is technically violated for these two tools because they are exposed but NOT documented at §22.8.4 fidelity. **Recommendation (Phase 4):** Author §22.8.4.8 `kb_entry_draft_create` and §22.8.4.9 `kb_dedupe_check` with full input/output schemas, `always_ask` permission scope, 10 rps per session (matching other side-effectful tools), and register both in Appendix J `mcp_tool_name`. Failing that, move the `kb_bootstrap` agent's draft-write path to a **custom tool** (§22.11 surface) rather than an MCP tool, which removes the §22.8.4 documentation obligation. Severity MEDIUM.

**Sub-finding 3.D (LOW).** The permission-scope column interpretation: §22.8.5 L12306+ states the default is `always_ask`. Five of the seven tools are "`always_allow`-eligible" — meaning they CAN be promoted to `always_allow` via Seller Console → Settings → Agent → MCP Permissions (§22.8.5), but **default** is still `always_ask`. The two pinned-`always_ask` tools (`doc_attach`, `capability_declare_draft`) are non-promotable regardless of seller preference. §22.8.5 is authoritative; each per-tool row in Item 3's matrix correctly reflects the promotion eligibility. **Not a defect.**

**Sub-finding 3.E (LOW).** Rate limit class is documented as **per-session rps** rather than an abstract class name (e.g., "class_A / class_B / class_C"). This is a stylistic choice consistent with KB Engineering Spec §3 and the §22.8.6 Implementation Requirements section. The class concept is implicit: retrieval-heavy (60 rps) for `kb_retrieve` and `cite_verify`; body-fetch (30 rps) for `kb_get_entry`; side-effectful or catalog-lookup (10 rps) for everything else. **Not a defect** — the numeric values are more precise than abstract classes.

**Sub-finding 3.F (PASS).** Every tool has at least one concrete worked example (request + response JSON). §22.8.4.1 `kb_retrieve` carries a full encryption-at-rest example; §22.8.4.2 `kb_get_entry` carries the matching SOC2 evidence example. §22.8.4.3–§22.8.4.7 carry per-tool concrete schemas though not always fully worked examples — the examples authored at the §22.8.4.1 level and the response-shaping discipline at §22.8.4.1 L12014 are inherited. This meets the §32 API pattern requirement for concrete examples.

### 3.4 Item 3 Sign-off

**ITEM 3 RESULT: PARTIAL PASS (7 of 9 exposed MCP tools fully documented at §22.8.4 fidelity; 2 engineering-surface tools `kb_entry_draft_create` / `kb_dedupe_check` referenced at §22.10.3 but not authored).** The 7 documented tools PASS Item 3's field-completeness test unconditionally. Finding 3.C is the one MEDIUM gap — recommended for Phase 4 remediation via §22.8.4.8 / §22.8.4.9 authoring OR relocation to custom-tool (§22.11) surface.

---

## 4. ITEM 4 — Capability Registry (§21.4) Coverage of KB Engineering Spec §6 References

### 4.1 Capability Identification

KB Engineering Spec §6 defines 5 Managed Agent surfaces (§6.2–§6.6). Through the §22.8.4 preamble MCP-tool-to-capability table and the §22.10 agent cross-links, the capabilities referenced by KB Engineering Spec §6 (directly in §6 or via the agents they instantiate) are:

1. `first_pass_responses` — First-Pass RFP Responses (Managed Agent batch)
2. `kb_bootstrap` — KB Bootstrap
3. `qa_suggestion` / `q_and_a_suggestion` — Q&A Answer Suggestion
4. `kb_to_capability_suggestion` — KB-to-Capability Suggestion
5. `ghost_rfp_ingestion` — Ghost-RFP Ingestion (M15)

Through the §22.8.4 MCP-tool parent-capability table (L11870), the additional capabilities surfaced by shared tool paths are:

6. `kb_to_response_suggestion` — KB-to-Response Suggestion (via `kb_retrieve`, `kb_get_entry`)
7. `kb_staleness_classifier` — KB Staleness Classifier (via `kb_retrieve` with `exclude_review_states=[]` override)
8. `document_attach_suggest` — Document Attach Suggest (via `document_library_find`, `doc_attach`)
9. `capability_declaration_suggest` — Capability Declaration Suggest (via `capability_find`, `capability_declare_draft`)

### 4.2 Registry-Row Presence Matrix

| Capability ID | KB Spec §6 / §22 Reference | §21.4 Registry Row | Console | `model_tier_default` | `billing_mode` | `requires_managed_agent` | `plan_gate_min_tier` | Free Allowance Override | OutcomeContract | Verdict |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `first_pass_responses` | KB §6.2 / §22.10.2 | §21.4.2 row 3 (L11073) | seller | sonnet | customer_billed | **true** (§21.4.2.A #1) | seller_free | 10 ops lifetime (C.80 default) | §21.4.5 L11179 / §34.11.1 | PASS |
| `kb_bootstrap` | KB §6.3 / §22.10.3 | §21.4.2 row 2 (L11072) | seller | opus | customer_billed | (implicit; Managed Agent only) | seller_free | **1 lifetime free** (§21.4.4 override; L11136) | §21.4.5 L11177; `requires_explicit_user_signal=true` | PASS |
| `qa_suggestion` | KB §6.4 / §22.10.4 | §21.4.1 row 9 (L11027) | seller | sonnet | customer_billed | false (interactive) | seller_free (implicit; Initial Seed) | 10 ops lifetime (C.80 default) | §21.4.5 L11159 | PASS |
| `kb_to_capability_suggestion` | KB §6.5 / §22.10.5 | §21.4.1 row 18 (L11036) | seller | haiku | customer_billed | false (nightly batch) | seller_free (implicit) | 10 ops lifetime (C.80 default) | §21.4.5 L11168 | PASS |
| `ghost_rfp_ingestion` | KB §6.6 / §22.10.6 / §22.14.4 / §4.4.14 | §21.4.2 row 11 (L11081) | seller | opus | customer_billed | (implicit; Managed Agent only) | seller_free | **1 lifetime free** (§21.4.4 override; L11137) | §21.4.5 L11178; `requires_explicit_user_signal=true` | PASS |
| `kb_to_response_suggestion` | §22.8.4 L11872 (shared `kb_retrieve` / `kb_get_entry`) | §21.4.1 row 7 (L11025) | seller | haiku | customer_billed | false | seller_free (implicit) | 10 ops lifetime (C.80 default) | §21.4.5 L11157 | PASS |
| `kb_staleness_classifier` | §22.8.4 L11872 / §22.5.2 / §22.9.8 | §21.4.1 row 17 (L11035) | seller | haiku | customer_billed | false (nightly batch) | seller_free (implicit) | 10 ops lifetime (C.80 default) | §21.4.5 L11167 | PASS |
| `document_attach_suggest` | §22.8.4 L11874 / §22.8.4.3 / §22.8.4.4 | §21.4.1.A (L11057) | seller | haiku | customer_billed | false | seller_free (implicit) | 10 ops lifetime (C.80 default) | §21.4.5 L11176 | PASS |
| `capability_declaration_suggest` | §22.8.4 L11876 / §22.8.4.5 / §22.8.4.6 | §21.4.1.A (L11054) | seller | sonnet | customer_billed | false | seller_free (implicit) | 10 ops lifetime (C.80 default) | §21.4.5 L11173 | PASS |

All 9 capabilities referenced in KB Engineering Spec §6 (directly or via the tools shared with KB §3 / §22.8) have registry rows in §21.4 (distributed across §21.4.1 Initial Seed, §21.4.1.A KB-Spec Augmentations, and §21.4.2 Extended Capabilities). Each row carries a Console, `model_tier_default`, `billing_mode`, free-allowance default, `plan_gate_min_tier`, and an OutcomeContract cross-reference.

### 4.3 Adversarial Sub-Findings

**Sub-finding 4.A (LOW, observed).** The canonical capability ID is `qa_suggestion` (§21.4.1 row 9); KB Engineering Spec §6.4 uses `q_and_a_suggestion`. §21.4.1.A L11063 carries the explicit canonical-ID reconciliation note registering `q_and_a_suggestion` as an alias in `CapabilityRegistryEntry.aliases`. §22.10.4 uses both `q_and_a_suggestion` (in the agent id) and `qa_suggestion` (in the capability cross-link field). The §21.4.1.A note is the authoritative resolution. **Not a defect** — alias resolution is codified. Severity LOW for reader discoverability; **not** a ship-blocker.

**Sub-finding 4.B (LOW, observed).** The canonical capability ID is `first_pass_responses` (§21.4.2 row 3; batch-of-100 unit); KB Engineering Spec §6.2 implies `first_pass_response` (singular, per-requirement). §21.4.1.A L11063 registers `first_pass_response` as an alias. §22.10.2's OutcomeContract cross-link uses `first_pass_rfp_draft` (a third spelling referencing the §34.11.1 OutcomeContract signal-contract name, not a registry capability_id). **Same character as 4.A** — alias resolution in place; but the three-way split (registry canonical / KB-Spec alias / OutcomeContract signal name) is a documentation hazard. Duplicate of Finding 2.C. Severity LOW.

**Sub-finding 4.C (PASS).** The §21.4.4 Free-Plan Access Rules table L11132–11138 correctly carries the TWO "1 lifetime free" overrides (`kb_bootstrap`, `ghost_rfp_ingestion`) per Summary C.73 / SPS §9. All other customer-billed capabilities seeded in §21.4.1 / §21.4.1.A / §21.4.2 default to 10 ops lifetime per Summary C.80. This satisfies KB Engineering Spec §6.7's "1 lifetime free per Org" claim for both agents and is the authoritative free-allowance home per Authoring Convention #10. Verified.

**Sub-finding 4.D (MEDIUM, observed).** The `kb_staleness_classifier` capability (§21.4.1 row 17) is the **only** caller permitted to pass `kb_retrieve` with `exclude_review_states=[]` per §22.9.8 L12498 / §22.5.2 L11685. This invariant is codified in §22.9.8 and §22.5.2 but NOT explicitly tested in §22.17 Acceptance Criteria. **Recommendation (Phase 4):** Add an AC to §22.17 asserting that `kb_retrieve` calls with `exclude_review_states=[]` are rejected with HTTP 403 `firewall_violation` unless the invoking capability is `kb_staleness_classifier` AND the override is logged as `agent_kb_stale_override` (Appendix J extension). Severity MEDIUM for test coverage; LOW for specification completeness (the rule is codified, just not AC-tested).

**Sub-finding 4.E (MEDIUM, observed).** `requires_managed_agent` is explicitly set `true` on `first_pass_responses` (§21.4.2.A #1 at L11097). `kb_bootstrap` and `ghost_rfp_ingestion` are implicitly Managed-Agent-only (one-shot opus-tier extraction; not exposed via `POST /v1/agent/invoke` per §32) but neither row in §21.4.2 sets `requires_managed_agent=true` explicitly in the table cell. **Consequence:** a customer making a direct `POST /v1/agent/invoke` to `kb_bootstrap` would, per §21.4.2.A #1 logic, only be rejected if `requires_managed_agent=true`. If the flag is not set, the request would be accepted as a non-Managed-Agent invocation — which is incorrect for the opus-tier one-shot extraction path. **Recommendation (Phase 4):** Set `requires_managed_agent=true` on §21.4.2 row 2 (`kb_bootstrap`) and row 11 (`ghost_rfp_ingestion`), consistent with the §22.10.3 / §22.10.6 agent definitions being the sole invocation path. Severity MEDIUM for defense-in-depth; LOW for shipping because direct invocation of opus-tier capabilities is also plan-gated at `seller_free` with a 1-lifetime-free ceiling and the Seller Console does not expose a direct-invoke UI.

### 4.4 Item 4 Sign-off

**ITEM 4 RESULT: PASS.** The Capability Registry contains a row for every capability referenced in KB Engineering Spec §6 (directly in §6.2–§6.6 and via shared MCP tools in §22.8.4). Two LOW observations (4.A, 4.B) are alias-naming hazards already acknowledged in §21.4.1.A. Two MEDIUM observations (4.D, 4.E) are recommended for Phase 4 remediation: §22.17 AC addition for the `kb_staleness_classifier` override invariant; explicit `requires_managed_agent=true` flagging on §21.4.2 rows 2 and 11.

---

## 5. ITEM 5 — "AgentSDK" / "Agent SDK" Usage Audit

### 5.1 Structural Test

The Phase 3 integration replaces the Claude Agent SDK as an implementation primitive with Claude Managed Agents (§22.2.2 rationale). After integration, occurrences of "AgentSDK" or "Agent SDK" in `Sourcera_Master_Spec.md` MUST appear **only** in contexts explaining why Managed Agents were chosen instead (i.e., justification / reference contexts). No occurrence should implicate Agent SDK as an implementation surface Sourcera targets.

### 5.2 Complete Grep Audit

Pattern: `Agent ?SDK` (covers both `AgentSDK` and `Agent SDK` spellings).

| # | Line | Context (verbatim) | Classification | Verdict |
| :---- | :---- | :---- | :---- | :---- |
| 1 | 11376 | `### 22.2.2 Why Managed Agents, Not Agent SDK {#22.2.2-why-managed-agents-not-agent-sdk}` | **Heading** — "Why Managed Agents, Not Agent SDK" is the subsection title establishing the negative case (explicitly: Agent SDK is the rejected primitive) | PASS — within justification context |
| 2 | 11392 | `The Claude Agent SDK is the wrong primitive because it would require Sourcera to operate the agent loop, tool-execution runtime, container sandbox, and session log — all of which Managed Agents provides with better TTFT (per Anthropic Engineering "Scaling Managed Agents": p50 −60%, p95 −90% vs. self-hosted) and built-in prompt caching.` | **Rationale body** — explicit statement that Agent SDK is the wrong primitive | PASS — within justification context |
| 3 | 13493 | `- Agent SDK overview (for context): https://code.claude.com/docs/en/agent-sdk/overview` | **References section** (§22.16.9) — Agent SDK doc link labeled "for context" (i.e., the reader is pointed at the primitive that was NOT selected, for completeness) | PASS — within reference context; explicit "for context" disclaimer |
| 4 | 13497 | `- Building agents with the Claude Agent SDK (engineering blog): https://claude.com/blog/building-agents-with-the-claude-agent-sdk` | **References section** (§22.16.9) — Agent SDK engineering blog link | PASS — within reference context |

**Total matches:** 4. **Matches inside justification/reference context:** 4. **Matches implicating Agent SDK as an implementation surface:** 0.

### 5.3 Adversarial Sub-Findings

**Sub-finding 5.A (PASS).** §22.2.2 L11376 is the authoritative explanatory subsection. The heading is the explicit rejection statement. §22.2.2's body (lines 11376–11404) walks through (a) Sourcera-side ops cost, (b) TTFT comparison, (c) built-in prompt caching, (d) session log, (e) auto-compaction, and (f) the consequence that Sourcera engineering does NOT touch the agent loop, container runtime, or tool-execution runtime. This is the canonical "Why Managed Agents" rationale; Agent SDK appears only in negative framing.

**Sub-finding 5.B (PASS).** The two §22.16.9 references are flagged in a References block (the established §22.16.9 surface, not inline prose). The first link is explicitly labeled "(for context)"; the second is an engineering blog reference. Neither constitutes a directive to use or target the SDK. This satisfies the "reference context" acceptance criterion.

**Sub-finding 5.C (PASS).** The table at §22.2.1 L11372 describes the First-Pass Responder as "Agent definition `agent_sourcera_first_pass_responder_v{N}` bound to the KB MCP server, the Sourcera document skills, and the built-in `agent_toolset_20260401` restricted to read-only ops." The term `agent_toolset_20260401` is the Anthropic Managed-Agents **beta toolset name** (§22.2.3 Beta Header pins `managed-agents-2026-04-01`), NOT the Agent SDK. This phrasing is correct per Anthropic's Managed-Agents surface and does NOT count as an Agent-SDK mention.

**Sub-finding 5.D (PASS).** No occurrence of `AgentSDK` (closed compound) appears anywhere in the Master Spec. The only matches for the pattern `Agent ?SDK` are the 4 enumerated above. Verified by grep with pattern `Agent ?SDK` and a head-limit of 50 returning all 4 rows.

**Sub-finding 5.E (LOW, observed — preserving decision traceability).** §22.2.2 L11376 explicitly preserves the Agent SDK primitive name in the subsection heading. Some consumers of the Master Spec (e.g., a junior engineer unfamiliar with Anthropic's primitive taxonomy) might confuse the two on first read. §22.2.2's first sentence clarifies, but the subsection TITLE contains "Agent SDK." **Not a defect** — the title is exactly the canonical "Why Not X" form that enterprise spec-writing uses to preserve decision traceability. Flagged only to note the intentional retention.

### 5.4 Item 5 Sign-off

**ITEM 5 RESULT: PASS.** All 4 occurrences of "Agent SDK" in the Master Spec appear within the §22.2.2 "Why Not" rationale (heading + body sentence) or within the §22.16.9 References block labeled "for context." Zero occurrences implicate the SDK as an implementation surface.

---

## 6. ITEM 6 — §21.5 AIWallet Reference (Token-Budget Replacement)

### 6.1 Structural Test

§21.5 (Agent AI Budgets — Value-Dollars and Wallet Behavior) MUST now reference the **AIWallet entity** (§4.8.3) and the **AI Wallet Service** (§34.10), with AI-consumption units denominated in **value-dollars**, rather than the legacy token-budget model (50K / 500K / 5M tokens/month per tier).

### 6.2 §21.5 Content Verification

§21.5 (L11204–11219) has been re-authored as follows:

- **Heading:** "## 21.5 Agent AI Budgets (Value-Dollars and Wallet Behavior) {#21.5-agent-ai-budgets-(value-dollars)}" — heading explicitly references Value-Dollars and Wallet.
- **Preamble (L11206):** "The §21.5 surface is the customer-facing summary of how Agent capabilities consume budget. Authoritative entity mechanics live at **§4.8.3 `AIWallet`** (schema, indexes, state machine, acceptance criteria) and operational policy at **§34.10 AI Wallet Service** (counters, configuration, pooled-budget-across-consoles rule, Stripe metering, downgrade behavior, failure modes). §21.5 references the wallet rather than re-stating its rules."
- **Value-dollar denomination statement (L11208):** "AI budgets are denominated in **value-dollars**, not Anthropic tokens. Value-dollars are stable across cost-base recalculation: per §34.3.1, `value_price_cents = MAX(min_value, cost_base × value_multiplier)` with `value_multiplier=10.000` held invariant across the platform; if Anthropic pricing moves, the multiplier holds and `cost_base` is re-derived nightly per §34.3.3 / §4.8.6. Customers see a single, stable value-dollar number; cost-base movement is internal to Sourcera's COGS."
- **Authoritative references block (L11210):** "Per-plan AI included-budget figures are authoritative in §34.1.1 (Buyer Plan Tiers) and §34.1.2 (Seller Plan Tiers). Wallet overage configuration, auto-topup semantics, exhaustion behavior, and the wallet state machine are authoritative in §34.10 (AI Wallet Service). Pooled-across-consoles math, the Free-side collapse rule, and the `(Buyer + Seller)` unified-wallet invariant are authoritative in §34.10.3. Per-capability Free Allowance behavior is authoritative in §34.8.4 and `FreeAllowanceCounter` (§4.8.7). Wallet visibility surfaces — Settings → AI Usage, Public Pricing API parity, per-capability breakdown, per-model breakdown, burn-rate forecast, committed-remaining — are authoritative in §4.8.3 (AIWallet) acceptance criteria and §4.8.7 (FreeAllowanceCounter) acceptance criteria. Burn priority (`commit_burn_remaining → budget_value_dollars → overage_cap_value_dollars`, with Free Allowance bypassing all three) is authoritative in §34.10.1. Error codes for exhaustion (`ai_wallet_exhausted`, `wallet_hard_capped`) are authoritative in Appendix I."
- **Authoring-convention compliance (L11212):** "Per Authoring Convention #10 (`every dollar figure has one authoritative home`), §21.5 MUST NOT restate per-plan budget figures, wallet state transitions, or visibility surface bullets."
- **Acceptance criteria (L11214–11219):** §21.5 carries no independent ACs; the effective AC set is the union of §4.8.3 AIWallet ACs, §4.8.7 FreeAllowanceCounter ACs, §34.10 AI Wallet Service ACs, and §34.20 consolidated ACs. Four specific cross-references listed (Settings → AI Usage ↔ `GET /v1/orgs/{org_id}/wallet` parity; Wallet hold placement precedes AIOperation write; Free Allowance distinct from wallet consumption in UI; Unified single value-dollar number for pooled Orgs).

### 6.3 Token-Budget Residual Audit

§21.5 was audited end-to-end for residual token-budget references. Result:

| Potential Residual | Present in §21.5? | Finding |
| :---- | :---- | :---- |
| "50K tokens/month" / "500K tokens/month" / "5M tokens/month" | **NO** | §21.5 does not restate per-plan budget figures (authoritative home: §34.1.1 / §34.1.2) |
| "Agent Token Budget" (concept name) | **NO** | §21.5 uses "Agent AI Budget" denominated in value-dollars |
| "tokens/month" (unit) | **NO** | §21.5 uses "value-dollars" as the unit |
| "Anthropic tokens" as a consumption unit to customer | **Yes, but to explicitly disclaim** | L11208 "AI budgets are denominated in **value-dollars**, not Anthropic tokens." This is the only mention and it is a disclaimer / explicit rejection. |
| Direct token-budget tables reproduced inline | **NO** | Per Authoring Convention #10 — explicit prohibition; §21.5 forward-references §34.1.1 / §34.1.2 |

§21.5 contains **zero affirmative references** to the legacy token-budget model.

### 6.4 Cross-Section Verification (§21.5's Referenced Surfaces)

§21.5's AIWallet forward-references are verified end-to-end against the named destination sections:

| Reference | Destination | Present and Current? |
| :---- | :---- | :---- |
| §4.8.3 `AIWallet` | Entity definition; schema / indexes / state machine / ACs | YES |
| §4.8.7 `FreeAllowanceCounter` | Per-capability free-allowance counters | YES |
| §34.1.1 / §34.1.2 | Buyer and Seller Plan Tiers; AI included-budget figures | YES |
| §34.10 AI Wallet Service | Wallet operational surface (counters, auto-topup, exhaustion, state machine) | YES |
| §34.10.1 | Burn priority | YES |
| §34.10.3 | Pooled-across-consoles math; Free-side collapse | YES |
| §34.3.1 | Pricing formula (`value_price_cents = MAX(min_value, cost_base × value_multiplier)`) | YES |
| §34.3.3 | Cost-base recalculation cadence | YES |
| §4.8.6 CostBaseRecalculationLog | Cost-base drift audit ledger | YES |
| §34.8.4 | Entitlement enforcement via FreeAllowanceCounter | YES |
| Appendix I | `ai_wallet_exhausted`, `wallet_hard_capped` error codes | YES |
| §32.8.2 `GET /v1/orgs/{org_id}/wallet` | Wallet-state endpoint for Settings → AI Usage parity | YES |
| §34.20 | Consolidated ACs | YES |

All 13 references resolve to live sections.

### 6.5 Adversarial Sub-Findings

**Sub-finding 6.A (PASS).** §21.5 is now 15 lines (L11204–11219) of forward-references + 1 substantive statement (the value-dollar denomination rule + the cost-base recalculation rule). This is the correct depth for a cross-referential "customer-facing summary" per Authoring Convention #10. In contrast, the PHASE2_VERIFY finding D-6 (MEDIUM) previously flagged §21.5 as **duplicating** §34.10's budget table. That duplication has been fully eliminated — PHASE3_VERIFY confirms the D-6 remediation.

**Sub-finding 6.B (PASS).** §21.9 Acceptance Criteria (Agent AI at L11273, the immediately-adjacent surface) now reads "Monthly value-dollar consumption is accurately metered against the AIWallet (§34.10) and displayed per §4.8.3 / §4.8.7 visibility surfaces; `FreeAllowanceCounter` draw precedes wallet draw per §34.8.4; pooled-across-consoles math per §34.10.3." This is the PHASE2_VERIFY finding D-5 remediation — the "Monthly token consumption is accurately metered and displayed" bullet has been rewritten. Verified.

**Sub-finding 6.C (PASS).** §21.6 Agent Failure Handling at L11226 has been rewritten from "Token budget exceeded → `agent_budget_exceeded`" to "AI Wallet exhausted → `ai_wallet_exhausted`". This is the PHASE2_VERIFY finding D-4 remediation. Verified.

**Sub-finding 6.D (LOW, observed).** §21.5's acceptance-criteria block at L11214 asserts that §21.5 "carries no independent acceptance criteria." Technically, the 4 bullets listed at L11216–11219 are cross-references to other sections' ACs, framed as the "effective acceptance set." This is a correct use of the compositional-AC pattern per §4.8.3 / §34.10 / §34.20 being the authoritative AC homes. **Not a defect.**

**Sub-finding 6.E (PASS, context-only).** Outside §21.5 but in the PHASE2_VERIFY D-findings surface: §44.2 Agent Performance (PHASE2_VERIFY finding D-2, HIGH), Stripe SKU table (D-3, HIGH), §21.5 duplication (D-6, MEDIUM), and §21.9 (D-5, MEDIUM) were all cited as HIGH/MEDIUM ship-blockers against the token-budget model. Within the scope of Item 6 (§21.5 specifically), D-5 and D-6 are remediated. D-2, D-3, and D-1 (TOC) are the **out-of-scope-for-Item-6** surfaces and their remediation status is owned by PHASE2_VERIFY / Phase 2 remediation and NOT by Phase 3.

### 6.6 Item 6 Sign-off

**ITEM 6 RESULT: PASS.** §21.5 is fully rewritten around AIWallet (§4.8.3) and AI Wallet Service (§34.10). Legacy token-budget content is absent. All 13 forward-references resolve to live sections. The AIWallet-as-authoritative-entity discipline is correctly observed. Adjacent surfaces §21.6 and §21.9 (AIWallet and value-dollar consumption respectively) are also remediated from the v6 token-budget model. Zero defects.

---

## 7. Overall Sign-off and Phase 4 Remediation Docket

### 7.1 Item-by-Item Summary

| # | Verification Item | Result | Notes |
| :---- | :---- | :---- | :---- |
| 1 | KB Engineering Spec §0–§18 fully represented in §22 | **PASS** | 19-of-19 coverage; 5 LOW observations (reviewer inbox seam; residency table composition; cost-table forward-ref seam; free-allowance relocation; backfill/migration distinction) |
| 2 | Every Managed Agent has id, model tier, tool allowlist, skills, environment, OutcomeContract | **PASS** | 5-of-5 agents; 1 LOW observation (ID-alias proliferation); 1 MEDIUM observation (`kb_bootstrap` engineering-MCP tools under-documented — see Item 3) |
| 3 | Every MCP tool has auth, request schema, response schema, permission scope, rate limit | **PARTIAL PASS** | 7-of-9 tools fully documented at §22.8.4 fidelity. `kb_entry_draft_create` / `kb_dedupe_check` referenced at §22.10.3 but not authored (Finding 3.C, MEDIUM) |
| 4 | Capability Registry contains a row for every capability referenced in KB Spec §6 | **PASS** | 9-of-9 capabilities present; 2 MEDIUM observations (`requires_managed_agent=true` flagging on 2 opus rows; §22.17 AC for `kb_staleness_classifier` override); 2 LOW observations (alias proliferation) |
| 5 | "AgentSDK" / "Agent SDK" appears only in justification/reference contexts | **PASS** | 4-of-4 occurrences within §22.2.2 rationale or §22.16.9 References |
| 6 | §21.5 references AIWallet rather than token budgets | **PASS** | 15 lines, all AIWallet/value-dollar; zero legacy token-budget content |

### 7.2 Remediation Docket for Phase 4

The following remediation items are recommended for Phase 4 to lift Phase 3 from "PASS with observations" to "CLEAN PASS" before v7.0.0 ship. None is a Phase 3 ship-blocker in isolation; all are documentation-integrity or defense-in-depth improvements that compound over the v7.0.0 corpus lifecycle.

| ID | Severity | Origin | Description | Phase 4 Action |
| :---- | :---- | :---- | :---- | :---- |
| **P3-R1** | MEDIUM | Finding 3.C / 2.D | Two MCP tools (`kb_entry_draft_create`, `kb_dedupe_check`) referenced at §22.10.3 are under-documented | Author §22.8.4.8 and §22.8.4.9 at §22.8.4 fidelity with full schemas, `always_ask` permission, 10 rps limit, Appendix J registration; OR relocate to §22.11 Custom Tool surface |
| **P3-R2** | MEDIUM | Finding 4.E | `kb_bootstrap` and `ghost_rfp_ingestion` lack explicit `requires_managed_agent=true` flag | Flip the flag on §21.4.2 row 2 and row 11 for defense-in-depth parity with §21.4.2 row 3 (`first_pass_responses`) |
| **P3-R3** | MEDIUM | Finding 4.D | `kb_staleness_classifier`-only `exclude_review_states=[]` override is codified but not AC-tested | Add a §22.17 AC: "`kb_retrieve` calls with `exclude_review_states=[]` are rejected with HTTP 403 `firewall_violation` unless the invoking capability is `kb_staleness_classifier` AND the override is logged as `agent_kb_stale_override` (Appendix J extension)." |
| **P3-R4** | LOW | Finding 2.C / 4.A / 4.B | Capability-ID alias proliferation across `qa_suggestion` / `q_and_a_suggestion`, `first_pass_responses` / `first_pass_response` / `first_pass_rfp_draft` | Either normalize §22.10.2 and §22.10.6 to use the canonical §21.4.2 `capability_id` as the OutcomeContract cross-link name, OR author an explicit alias table in §22.10.1 |
| **P3-R5** | LOW | Finding 1.C | §22.4 Indexing Pipeline reviewer-inbox routing is complete-by-composition but not discoverable from §22.4 alone | Add a one-sentence forward-reference in §22.4.1 pointing to §22.10.3 / §22.8.4.6 / Appendix C `capability_declaration_pending_review` |

### 7.3 Ship Recommendation for Phase 3 (Within v7.0.0 Integration Program)

**Phase 3 integration: APPROVED to proceed to Phase 4.** All six verification items PASS (with Item 3 marked PARTIAL PASS for the 2 under-documented engineering-surface MCP tools flagged in P3-R1). Zero HIGH-severity ship-blockers. Five Phase 4 remediation items (3 MEDIUM, 2 LOW) are tracked into the docket above and should be addressed before v7.0.0 ship so that Phase 3's output integrates cleanly with Phases 4–13.

### 7.4 Verification Scope Warrant

This verification document does not modify `Sourcera_Master_Spec.md`. No edits to §21 / §22 / §34 / Appendix B / Appendix C / Appendix G / Appendix I / Appendix J were performed during this audit. All findings, remediation recommendations, and severity classifications are documentation artifacts to be consumed by the Phase 4 reconciliation step; no Master Spec text change resulted from running this verification.

**Verification owner:** Senior Technical Product Strategist (Opus pass).
**Verification date:** 2026-04-18.
**Next step:** Log Phase 4 remediation docket items P3-R1 through P3-R5 into `_integration/RECONCILIATION.md` under the Phase 4 open-items surface, then proceed to Phase 4.
