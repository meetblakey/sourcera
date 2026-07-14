/**
 * Gate: `system_agent_id_enum_no_alias_collision`
 *
 * Static source proof for the Appendix J system-agent namespace. Runtime
 * principal-registry lookup remains an implementation-pack responsibility.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const SYSTEM_AGENT_RE = /^system_agent_[a-z0-9_]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REQUIRED_HEATMAP_ID = "system_agent_heat_map_refresh_worker";
const REQUIRED_HEATMAP_LABEL = "Sourcera System · Heat Map Refresh Worker";

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function codeValues(text: string): string[] {
  return [...text.matchAll(/`([^`]+)`/g)].map((match) => match[1]?.trim() ?? "").filter(Boolean);
}

function systemAgentFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const appendix = findSectionByAnchor(doc, "appendix-j-controlled-vocabulary-registry");
  if (!appendix) {
    push(findings, doc, 0, "Appendix J", "Appendix J controlled-vocabulary registry is missing.");
    return findings;
  }

  let enumLine = -1;
  for (let line = appendix.startLine; line <= appendix.endLine; line++) {
    if ((doc.lines[line] ?? "").includes("`system_agent_id_enum`")) {
      enumLine = line;
      break;
    }
  }
  if (enumLine < 0) {
    push(findings, doc, appendix.startLine, "system_agent_id_enum", "Appendix J system-agent enum is missing.");
    return findings;
  }

  let valuesLine = -1;
  let values: string[] = [];
  for (let line = enumLine + 1; line <= Math.min(enumLine + 8, appendix.endLine); line++) {
    const candidate = codeValues(doc.lines[line] ?? "");
    if (candidate.length > 0) {
      valuesLine = line;
      values = candidate;
      break;
    }
  }
  if (valuesLine < 0) {
    push(findings, doc, enumLine, "system_agent_id_enum", "system_agent_id_enum has no value row.");
    return findings;
  }

  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) push(findings, doc, valuesLine, value, `system_agent_id_enum duplicates ${value}.`);
    seen.add(value);
    if (!SYSTEM_AGENT_RE.test(value) || UUID_RE.test(value)) {
      push(findings, doc, valuesLine, value, `system_agent_id_enum value ${value} must be a non-UUID system_agent_* identifier.`);
    }
  }
  if (!values.includes(REQUIRED_HEATMAP_ID)) {
    push(findings, doc, valuesLine, REQUIRED_HEATMAP_ID, "HeatMap refresh system-agent identity is missing from Appendix J.");
  }

  const appendixText = doc.lines.slice(enumLine, Math.min(enumLine + 12, appendix.endLine) + 1).join("\n");
  const labelOccurrences = appendixText.split(REQUIRED_HEATMAP_LABEL).length - 1;
  if (labelOccurrences !== 1) {
    push(findings, doc, enumLine, REQUIRED_HEATMAP_LABEL, "HeatMap refresh system-agent display label must appear exactly once in Appendix J.");
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "system_agent_id_enum_no_alias_collision",
  sourcePhase: "V711-PH22",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_audit_log_integrity",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return systemAgentFindings(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) runGateCli(gate);
