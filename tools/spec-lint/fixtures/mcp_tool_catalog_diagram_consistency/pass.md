# 22 Seller KB {#22-seller-kb}

### 22.2.1 Layered Model {#22.2.1-layered-model}

kb_retrieve kb_get_entry document_library_find doc_attach capability_find capability_declare_draft cite_verify kb_entry_draft_create kb_dedupe_check

**MCP tool-catalog invariant.** The diagram above intentionally lists all nine tools in the §22.8.4 catalog and Appendix J `mcp_tool_name`.

### 22.8.4 Tools Exposed by the MCP Server {#22.8.4-tools-exposed-by-the-mcp-server}

Each tool is versioned via the URL path (`/kb/v1/*`, `/kb/v2/*`) so contracts can evolve without breaking deployed agent versions. All nine tools are registered in Appendix J `mcp_tool_name`.

kb_retrieve kb_get_entry document_library_find doc_attach capability_find capability_declare_draft cite_verify kb_entry_draft_create kb_dedupe_check

### 22.8.6 MCP Server Implementation Requirements {#22.8.6-mcp-server-implementation-requirements}

| Concern | Requirement | Cross-link |
|---|---|---|
| Per-tool rate limits | `kb_retrieve` 60 rps per session; `kb_get_entry` 30 rps; `kb_dedupe_check` 30 rps; `cite_verify` 60 rps; `document_library_find`, `doc_attach`, `capability_find`, `capability_declare_draft`, `kb_entry_draft_create` 10 rps. Overruns return structured `rate_limit_exceeded` errors with `retry_after_ms`. | §22.8.4 |

# Appendix J {#appendix-j}

`kb_retrieve`, `kb_get_entry`, `document_library_find`, `doc_attach`, `capability_find`, `capability_declare_draft`, `cite_verify`, `kb_entry_draft_create`, `kb_dedupe_check`

#### M.5.57 v7.2.0-REM Phase 5.2 KB / MCP P1 addition {#m-5-57-v72rem-phase-5-2-kb-mcp-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `mcp_tool_catalog_diagram_consistency` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/mcp_tool_catalog_diagram_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Catalog. | M02.3 |
