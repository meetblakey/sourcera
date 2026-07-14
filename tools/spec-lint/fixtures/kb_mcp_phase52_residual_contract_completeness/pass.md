### 22.3.5 KBDocument Upload Channel
| `embedding` | Vector(1024), nullable |
`output_dimension=1024`
**Concrete example (`document_library_find` request).**
**Concrete example (`capability_find` request).**
**Concrete example (`capability_declare_draft` request).**
**Concrete examples (`cite_verify`).**
**Errors (`document_library_find`).**
**Errors (`capability_find`).**
**Errors (`capability_declare_draft`).**
**Errors (`cite_verify`).**
**Per-tool error applicability matrix.**
**Historical divergence record.**
`exclude_review_states` defaults to `[review_overdue, flagged_stale]` per §22.8.4.1
| `mcp_auth_required` | 401 | §22 KB / MCP server endpoint families |
| `mcp_auth_invalid` | 403 | §22 KB / MCP server endpoint families |
| `capability_declaration_evidence_required` | 422 | §22.8.4.6 `capability_declare_draft` |
`kb_namespace_migration`, `agent_output_uncited_sentence`
`kb_mcp_phase52_residual_contract_completeness` | spec_tree_lint | **`runtime_active`**
