/**
 * Gate: `mcp_kb_retrieve_query_singleton_consistency`
 *
 * Assertion: §39 row `mcp_kb_retrieve_query` is the only source for
 * `kb_retrieve.query` bounds, with §22.8.4.1 and §22.9.1 bound to it.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/mcp_kb_retrieve_query_singleton_consistency.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "§39 row `mcp_kb_retrieve_query` is the sole canonical home for `kb_retrieve.query` bounds",
  "§22.8.4.1 input schema and §22.9.1 Stage 1 MUST bind to that row",
];

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean) {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { line, text };
  }
  return null;
}

function sectionText(doc: SpecDoc, anchor: string, label: string, findings: Finding[]) {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) {
    push(findings, doc, 0, anchor, `${label} section is missing.`);
    return null;
  }
  return {
    line: section.startLine,
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
  };
}

function requireToken(
  findings: Finding[],
  doc: SpecDoc,
  text: string,
  line: number,
  label: string,
  token: string,
) {
  if (!text.includes(token)) push(findings, doc, line, token, `${label} is missing required kb_retrieve.query singleton token: ${token}`);
}

function queryFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const limitRow = findLine(doc, (line) => line.includes("| MCP `kb_retrieve` | `query` (`mcp_kb_retrieve_query`) |"));
  if (!limitRow) {
    push(findings, doc, 0, "`mcp_kb_retrieve_query`", "§39 row `mcp_kb_retrieve_query` is missing.");
  } else {
    requireToken(findings, doc, limitRow.text, limitRow.line, "§39 MCP kb_retrieve query row", "1–2,000 chars");
    requireToken(findings, doc, limitRow.text, limitRow.line, "§39 MCP kb_retrieve query row", "Source for §22.8.4.1 input schema and §22.9.1 Stage 1 validation.");
    requireToken(findings, doc, limitRow.text, limitRow.line, "§39 MCP kb_retrieve query row", "HTTP 422 `bad_request` and `details.invalid_field='query'`");
  }

  const tool = sectionText(doc, "22.8.4.1-kb_retrieve", "§22.8.4.1 kb_retrieve", findings);
  if (tool) {
    requireToken(findings, doc, tool.text, tool.line, "§22.8.4.1 kb_retrieve input schema", "\"query\": {");
    requireToken(findings, doc, tool.text, tool.line, "§22.8.4.1 kb_retrieve input schema", "Length bounds are canonical in §39 row mcp_kb_retrieve_query.");
    requireToken(findings, doc, tool.text, tool.line, "§22.8.4.1 kb_retrieve input schema", "\"minLength\": 1");
    requireToken(findings, doc, tool.text, tool.line, "§22.8.4.1 kb_retrieve input schema", "\"maxLength\": 2000");
  }

  const pipeline = sectionText(doc, "22.9.1-retrieval-pipeline", "§22.9.1 Retrieval Pipeline", findings);
  if (pipeline) {
    requireToken(
      findings,
      doc,
      pipeline.text,
      pipeline.line,
      "§22.9.1 Stage 1 invariant",
      "1. Normalization & Expansion | `query` length binds to §39 row `mcp_kb_retrieve_query`",
    );
  }

  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `mcp_kb_retrieve_query_singleton_consistency` |"));
  if (!row) {
    push(findings, doc, 0, "`mcp_kb_retrieve_query_singleton_consistency`", "§M.5 row mcp_kb_retrieve_query_singleton_consistency is missing.");
    return findings;
  }
  for (const token of M5_TOKENS) {
    requireToken(findings, doc, row.text, row.line, "§M.5 mcp_kb_retrieve_query_singleton_consistency row", token);
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "mcp_kb_retrieve_query_singleton_consistency",
  sourcePhase: "KB18",
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [...queryFindings(ctx.masterSpec), ...m5Findings(ctx.masterSpec)];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
