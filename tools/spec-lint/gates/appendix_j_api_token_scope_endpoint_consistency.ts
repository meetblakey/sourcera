/**
 * Gate: `appendix_j_api_token_scope_endpoint_consistency`
 *
 * Assertion: endpoint Auth Scope values resolve to Appendix J `api_token_scope`,
 * scope registries agree, and rate-limit classes do not leak into Auth Scope.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  computeSectionRanges,
  parseTableAt,
  splitUnescapedPipes,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const INTERNAL_ONLY_SCOPE = "admin:ops_compliance";
const FORBIDDEN_AUTH_SCOPE_VALUES = new Set([
  "marketplace_read",
  "marketplace_write",
  "marketplace_match_score_read",
]);
const LEGACY_SCOPES = new Set([
  "bidding:write",
  "evaluation:read",
  "scoring:write",
  "responses:read",
  "analytics:read",
]);

function stripMd(value: string): string {
  return value.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function codeTokens(value: string): string[] {
  const out: string[] = [];
  const re = /`([^`]+)`/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(value)) !== null) out.push(match[1]);
  return out;
}

function scopeTokens(value: string): string[] {
  return codeTokens(value).filter((token) => /^[a-z]+:[a-z0-9_]+$/.test(token));
}

function appendixJRange(doc: SpecDoc) {
  return computeSectionRanges(doc).find((range) => /^Appendix J:/.test(range.heading.title)) ?? null;
}

function isInside(range: { startLine: number; endLine: number } | null, line: number): boolean {
  return !!range && line >= range.startLine && line <= range.endLine;
}

function extractPrimaryScopeRegistry(doc: SpecDoc): { values: Set<string>; line: number } {
  const appendix = appendixJRange(doc);
  if (!appendix) return { values: new Set(), line: 0 };

  for (let line = appendix.startLine; line <= appendix.endLine; line++) {
    if (!/^### API Token Scopes\b/.test(doc.lines[line] ?? "")) continue;
    for (let cursor = line + 1; cursor <= appendix.endLine; cursor++) {
      const raw = doc.lines[cursor] ?? "";
      if (/^#{1,6}\s+/.test(raw)) break;
      const tokens = scopeTokens(raw);
      if (tokens.length > 0) return { values: new Set(tokens), line: cursor };
    }
    return { values: new Set(), line };
  }
  return { values: new Set(), line: appendix.startLine };
}

function extractMirrorScopeRegistry(doc: SpecDoc): { values: Set<string>; line: number } {
  const appendix = appendixJRange(doc);
  if (!appendix) return { values: new Set(), line: 0 };

  for (let line = appendix.startLine; line <= appendix.endLine; line++) {
    if (!(doc.lines[line] ?? "").includes("`api_token_scope` canonical enum")) continue;
    for (let cursor = line + 1; cursor <= Math.min(line + 8, appendix.endLine); cursor++) {
      const tokens = scopeTokens(doc.lines[cursor] ?? "");
      if (tokens.length > 0) return { values: new Set(tokens), line: cursor };
    }
    return { values: new Set(), line };
  }
  return { values: new Set(), line: appendix.startLine };
}

function m5GateLine(doc: SpecDoc): { line: number; count: number | null } {
  for (let line = 1; line < doc.lines.length; line++) {
    const raw = doc.lines[line] ?? "";
    if (!raw.includes("`appendix_j_api_token_scope_endpoint_consistency`")) continue;
    const count = /canonical\s+(\d+)-value\s+Appendix J\s+`api_token_scope`/.exec(raw)?.[1];
    return { line, count: count ? Number(count) : null };
  }
  return { line: 0, count: null };
}

function tableCells(raw: string): string[] {
  return splitUnescapedPipes(raw.trim().replace(/^\|/, "").replace(/\|$/, "")).map((cell) => cell.trim());
}

function isDelimiterRow(raw: string): boolean {
  return tableCells(raw).every((cell) => /^:?-{2,}:?$/.test(cell) || cell === "");
}

function checkAuthScopeCell(
  findings: Finding[],
  doc: SpecDoc,
  registry: Set<string>,
  line: number,
  cell: string,
  source: string,
) {
  const normalized = stripMd(cell).toLowerCase();
  if (
    normalized === "" ||
    normalized === "none" ||
    normalized === "n/a" ||
    normalized.startsWith("same as ") ||
    normalized.includes("any active appendix j")
  ) {
    return;
  }

  for (const token of codeTokens(cell)) {
    if (FORBIDDEN_AUTH_SCOPE_VALUES.has(token)) {
      findings.push({
        file: doc.path,
        line,
        anchor: anchorForLine(doc, line),
        matched_text: token,
        message: `${source} uses rate-limit class \`${token}\` as an Auth Scope.`,
      });
    }
  }

  for (const token of scopeTokens(cell)) {
    if (!registry.has(token)) {
      findings.push({
        file: doc.path,
        line,
        anchor: anchorForLine(doc, line),
        matched_text: token,
        message: `${source} Auth Scope \`${token}\` is not registered in Appendix J api_token_scope.`,
      });
    }
  }
}

export const gate: SpecLintGate = {
  id: "appendix_j_api_token_scope_endpoint_consistency",
  sourcePhase: "3V",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const appendix = appendixJRange(doc);
    const primary = extractPrimaryScopeRegistry(doc);
    const mirror = extractMirrorScopeRegistry(doc);

    if (primary.values.size === 0) {
      findings.push({
        file: doc.path,
        line: primary.line,
        matched_text: "API Token Scopes",
        message: "Appendix J API Token Scopes registry has no parseable scope values.",
      });
      return findings;
    }

    for (const value of primary.values) {
      if (!mirror.values.has(value)) {
        findings.push({
          file: doc.path,
          line: mirror.line,
          anchor: anchorForLine(doc, mirror.line),
          matched_text: value,
          message: `Appendix J api_token_scope mirror paragraph is missing primary scope \`${value}\`.`,
        });
      }
    }
    for (const value of mirror.values) {
      if (!primary.values.has(value)) {
        findings.push({
          file: doc.path,
          line: mirror.line,
          anchor: anchorForLine(doc, mirror.line),
          matched_text: value,
          message: `Appendix J api_token_scope mirror paragraph includes \`${value}\` outside the primary API Token Scopes registry.`,
        });
      }
    }

    const m5 = m5GateLine(doc);
    if (m5.count !== null && m5.count !== primary.values.size) {
      findings.push({
        file: doc.path,
        line: m5.line,
        anchor: anchorForLine(doc, m5.line),
        matched_text: `${m5.count}-value`,
        message: `§M.5 appendix_j_api_token_scope_endpoint_consistency says ${m5.count} values, but Appendix J registers ${primary.values.size}.`,
      });
    }

    for (let line = 1; line < doc.lines.length; line++) {
      const raw = doc.lines[line] ?? "";
      if (!/^\s*\|.*\|\s*$/.test(raw)) continue;
      const header = tableCells(raw);
      const authIdx = header.findIndex((cell) => stripMd(cell).toLowerCase() === "auth scope");
      if (authIdx < 0) continue;

      for (let rowLine = line + 2; rowLine < doc.lines.length; rowLine++) {
        const rowRaw = doc.lines[rowLine] ?? "";
        if (!/^\s*\|.*\|\s*$/.test(rowRaw)) break;
        if (isDelimiterRow(rowRaw)) continue;
        const cells = tableCells(rowRaw);
        checkAuthScopeCell(findings, doc, primary.values, rowLine, cells[authIdx] ?? "", `Table row ${rowLine}`);
      }
    }

    for (let line = 1; line < doc.lines.length; line++) {
      const raw = doc.lines[line] ?? "";
      if (isInside(appendix, line)) continue;
      if (!/(?:\*\*Auth Scope\.\*\*|Token scope:|with scope\s+`)/i.test(raw)) continue;
      checkAuthScopeCell(findings, doc, primary.values, line, raw, `Prose line ${line}`);
    }

    for (const scope of primary.values) {
      if (scope === INTERNAL_ONLY_SCOPE) continue;
      let consumers = 0;
      for (let line = 1; line < doc.lines.length; line++) {
        if (isInside(appendix, line)) continue;
        if ((doc.lines[line] ?? "").includes(`\`${scope}\``)) consumers++;
      }
      if (consumers === 0) {
        findings.push({
          file: doc.path,
          line: primary.line,
          anchor: anchorForLine(doc, primary.line),
          matched_text: scope,
          message: `Customer-issuable api_token_scope \`${scope}\` has no non-Appendix-J consumer.`,
        });
      }
    }

    for (let line = 1; line < doc.lines.length; line++) {
      if (isInside(appendix, line)) continue;
      const raw = doc.lines[line] ?? "";
      for (const legacy of LEGACY_SCOPES) {
        if (!raw.includes(`\`${legacy}\``)) continue;
        if (/\b(?:legacy|pre-v3|retired|migration|migrat(?:e|ed|ion)|historical)\b/i.test(raw)) continue;
        findings.push({
          file: doc.path,
          line,
          anchor: anchorForLine(doc, line),
          matched_text: legacy,
          message: `Retired pre-V3 API-token scope \`${legacy}\` appears outside a legacy migration note.`,
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
