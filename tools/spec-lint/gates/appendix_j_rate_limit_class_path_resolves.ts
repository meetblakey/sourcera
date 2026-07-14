/**
 * Gate: `appendix_j_rate_limit_class_path_resolves`
 *
 * Assertion: Appendix J's §51 rate-limit-class path list matches the §51.3.5,
 * §51.4.4, and §51.5.5 endpoint rows exactly. Legacy `/usage/dashboard`
 * aliases are rejected unless a deprecation/dual-emit row is authored.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const ENDPOINT_SECTIONS = [
  ["51.3.5-apis", "§51.3.5"],
  ["51.4.4-apis-51-4", "§51.4.4"],
  ["51.5.5-apis-51-5", "§51.5.5"],
] as const;

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/appendix_j_rate_limit_class_path_resolves.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "Appendix J §51 rate-limit path list resolves exactly to §51.3.5 / §51.4.4 / §51.5.5 endpoint rows",
  "legacy `/usage/dashboard` aliases are rejected",
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

function requireToken(findings: Finding[], doc: SpecDoc, text: string, line: number, label: string, token: string) {
  if (!text.includes(token)) push(findings, doc, line, token, `${label} is missing required rate-limit path token: ${token}`);
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function normalizeMethodPath(method: string, path: string): string {
  return `${method.replace(/`/g, "").trim()} ${path.replace(/`/g, "").trim()}`;
}

function appendixJSection(doc: SpecDoc) {
  return findSectionByTitle(doc, "Rate-Limit Classes for §51 and Workspace Analytics");
}

function appendixPaths(doc: SpecDoc, findings: Finding[]): Map<string, number> {
  const section = appendixJSection(doc);
  if (!section) {
    push(findings, doc, 0, "Rate-Limit Classes for §51 and Workspace Analytics", "Appendix J §51 rate-limit class path section is missing.");
    return new Map();
  }
  const text = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
  const paths = new Map<string, number>();
  const re = /`(GET|POST|PATCH|DELETE|PUT)\s+(\/v1\/[^`]+)`/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const before = text.slice(0, match.index);
    const line = section.startLine + before.split(/\n/).length - 1;
    paths.set(normalizeMethodPath(match[1], match[2]), line);
  }
  if (paths.size === 0) {
    push(findings, doc, section.startLine, "/v1/", "Appendix J §51 rate-limit class path section lists no concrete §51 endpoint paths.");
  }
  const legacyAlias = /`(?:GET|POST|PATCH|DELETE|PUT)\s+\/usage\/dashboard[^`]*`/.exec(text);
  if (legacyAlias) {
    const before = text.slice(0, legacyAlias.index);
    const line = section.startLine + before.split(/\n/).length - 1;
    push(findings, doc, line, legacyAlias[0], "Appendix J §51 rate-limit path list must not use legacy `/usage/dashboard` aliases without an authored dual-emit/deprecation row.");
  }
  requireToken(findings, doc, text, section.startLine, "Appendix J §51 rate-limit class notes", "CI gate `appendix_j_rate_limit_class_path_resolves`");
  requireToken(findings, doc, text, section.startLine, "Appendix J §51 rate-limit class notes", "§51.3.5 / §51.4.4 / §51.5.5 endpoint row");
  return paths;
}

function endpointRows(doc: SpecDoc, findings: Finding[]): Map<string, number> {
  const rows = new Map<string, number>();
  for (const [anchor, label] of ENDPOINT_SECTIONS) {
    const section = findSectionByAnchor(doc, anchor);
    if (!section) {
      push(findings, doc, 0, anchor, `${label} API section is missing.`);
      continue;
    }
    const table = parseTableAt(doc, section.startLine, section.endLine);
    const headers = table.header?.cells ?? [];
    if (headers[0] !== "Method" || headers[1] !== "Path" || !headers.includes("Rate-Limit Class")) {
      push(findings, doc, table.header?.line ?? section.startLine, headers.join(" | "), `${label} endpoint table must expose Method, Path, and Rate-Limit Class columns.`);
    }
    for (const row of table.rows) {
      const method = row.cells[0] ?? "";
      const path = row.cells[1] ?? "";
      const key = normalizeMethodPath(method, path);
      rows.set(key, row.line);
      const classCell = row.cells[3] ?? "";
      if (!classCell.includes("`analytics_read`") && !classCell.includes("`analytics_export`")) {
        push(findings, doc, row.line, classCell, `${label} endpoint ${key} must use analytics_read or analytics_export rate-limit class.`);
      }
      if (path.includes("/usage/dashboard")) {
        push(findings, doc, row.line, path, `${label} endpoint table must not use legacy /usage/dashboard aliases without an authored dual-emit/deprecation row.`);
      }
    }
  }
  return rows;
}

function pathResolutionFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const appendix = appendixPaths(doc, findings);
  const endpoints = endpointRows(doc, findings);

  for (const [key, line] of appendix) {
    if (!endpoints.has(key)) {
      push(findings, doc, line, key, `Appendix J §51 rate-limit path ${key} does not resolve to a §51.3.5 / §51.4.4 / §51.5.5 endpoint row.`);
    }
  }
  for (const [key, line] of endpoints) {
    if (!appendix.has(key)) {
      push(findings, doc, line, key, `§51 endpoint row ${key} is missing from the Appendix J §51 rate-limit path list.`);
    }
  }
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `appendix_j_rate_limit_class_path_resolves` |"));
  if (!row) {
    push(findings, doc, 0, "`appendix_j_rate_limit_class_path_resolves`", "§M.5 row appendix_j_rate_limit_class_path_resolves is missing.");
    return findings;
  }
  for (const token of M5_TOKENS) requireToken(findings, doc, row.text, row.line, "§M.5 appendix_j_rate_limit_class_path_resolves row", token);
  return findings;
}

export const gate: SpecLintGate = {
  id: "appendix_j_rate_limit_class_path_resolves",
  sourcePhase: "V13",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...pathResolutionFindings(doc),
      ...m5Findings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
