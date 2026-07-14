/**
 * Gate: `mcp_tool_catalog_diagram_consistency`
 *
 * Assertion: §22.2.1, §22.8.4, Appendix J `mcp_tool_name`, and §22.8.6
 * enumerate the same nine KB MCP tools.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { push } from "./enterprise_security_gate_helpers.js";
import {
  requireDocTokens,
  requireRuntimeActive,
  sectionByAnchorOrFinding,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "mcp_tool_catalog_diagram_consistency";
const SOURCE_PHASE = "v7.2.0-REM Phase 5.2";

const TOOLS = [
  "kb_retrieve",
  "kb_get_entry",
  "document_library_find",
  "doc_attach",
  "capability_find",
  "capability_declare_draft",
  "cite_verify",
  "kb_entry_draft_create",
  "kb_dedupe_check",
] as const;

const REQUIRED_DOC_TOKENS = [
  "**MCP tool-catalog invariant.** The diagram above intentionally lists all nine tools in the §22.8.4 catalog and Appendix J `mcp_tool_name`.",
  "All nine tools are registered in Appendix J `mcp_tool_name`.",
  "`kb_retrieve`, `kb_get_entry`, `document_library_find`, `doc_attach`, `capability_find`, `capability_declare_draft`, `cite_verify`, `kb_entry_draft_create`, `kb_dedupe_check`",
  "| Per-tool rate limits | `kb_retrieve` 60 rps per session; `kb_get_entry` 30 rps; `kb_dedupe_check` 30 rps; `cite_verify` 60 rps; `document_library_find`, `doc_attach`, `capability_find`, `capability_declare_draft`, `kb_entry_draft_create` 10 rps.",
] as const;

function requireToolsInSection(findings: Finding[], ctx: GateContext, anchor: string, label: string): void {
  const section = sectionByAnchorOrFinding(findings, ctx.masterSpec, anchor, label);
  if (!section) return;
  for (const tool of TOOLS) {
    if (!section.text.includes(tool)) {
      push(findings, ctx.masterSpec, section.startLine, tool, `${label} is missing KB MCP tool ${tool}.`);
    }
  }
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: SOURCE_PHASE,
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireToolsInSection(findings, ctx, "22.2.1-layered-model", "§22.2.1 KB MCP diagram");
    requireToolsInSection(findings, ctx, "22.8.4-tools-exposed-by-the-mcp-server", "§22.8.4 KB MCP catalog");
    requireToolsInSection(findings, ctx, "22.8.6-mcp-server-implementation-requirements", "§22.8.6 KB MCP limits");
    requireDocTokens(findings, ctx.masterSpec, "MCP tool catalog", REQUIRED_DOC_TOKENS);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
