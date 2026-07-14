/**
 * Gate: `kb_mcp_phase52_residual_contract_completeness`
 * Source defects: D-5.2-007, D-5.2-008, D-5.2-010 through D-5.2-014,
 * D-5.2-016, D-5.2-019, and D-5.2-020.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { lineForToken } from "./catalog_gate_helpers.js";

const REQUIRED = [
  "### 22.3.5 KBDocument Upload Channel",
  "| `embedding` | Vector(1024), nullable |",
  "`output_dimension=1024`",
  "**Concrete example (`document_library_find` request).**",
  "**Concrete example (`capability_find` request).**",
  "**Concrete example (`capability_declare_draft` request).**",
  "**Concrete examples (`cite_verify`).**",
  "**Errors (`document_library_find`).**",
  "**Errors (`capability_find`).**",
  "**Errors (`capability_declare_draft`).**",
  "**Errors (`cite_verify`).**",
  "**Per-tool error applicability matrix.**",
  "**Historical divergence record.**",
  "`exclude_review_states` defaults to `[review_overdue, flagged_stale]` per §22.8.4.1",
  "| `mcp_auth_required` | 401 | §22 KB / MCP server endpoint families |",
  "| `mcp_auth_invalid` | 403 | §22 KB / MCP server endpoint families |",
  "| `capability_declaration_evidence_required` | 422 | §22.8.4.6 `capability_declare_draft` |",
  "`kb_namespace_migration`, `agent_output_uncited_sentence`",
  "`kb_mcp_phase52_residual_contract_completeness` | spec_tree_lint | **`runtime_active`**",
];

const FORBIDDEN = [
  "| `embedding` | Vector(1536), nullable |",
  "with optional inclusion of `review_due` / `review_overdue` / `flagged_stale` per `exclude_review_states` policy",
  "Divergence from KB Spec §3.6",
];

export const gate: SpecLintGate = {
  id: "kb_mcp_phase52_residual_contract_completeness",
  sourcePhase: "v7.1.1 Phase 5.2 KB/MCP residual P2/P3 closure",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_console_firewall",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    for (const token of REQUIRED) {
      if (!doc.text.includes(token)) {
        findings.push({
          file: doc.path,
          line: 1,
          matched_text: token,
          message: "Required Phase 5.2 KB/MCP residual contract is missing.",
        });
      }
    }
    for (const token of FORBIDDEN) {
      if (doc.text.includes(token)) {
        findings.push({
          file: doc.path,
          line: lineForToken(doc, token),
          matched_text: token,
          message: "Stale Phase 5.2 KB/MCP dimension, freshness, or source-authority wording remains active.",
        });
      }
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
