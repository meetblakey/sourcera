/**
 * Gate: `api_rate_limit_class_registry_consistency`
 *
 * Assertion: endpoint Rate-Limit Class values resolve to §32.4.5 and
 * Appendix J, §32.4.5 rows carry required limit cells, and rate-limit classes
 * do not leak into Auth Scope columns.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  computeSectionRanges,
  findSectionByAnchor,
  parseTableAt,
  splitUnescapedPipes,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const EXCLUDED_CODE_TOKENS = new Set([
  "api_rate_limit_class",
  "api_token_scope",
  "api_rate_limit_class_registry_consistency",
  "appendix_j_rate_limit_class_path_resolves",
  "analytics_rate_limit_class_enforcement",
  "rate_limit_exceeded",
  "rate_limited",
]);

function stripMd(value: string): string {
  return value.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function normalizedHeader(value: string): string {
  return stripMd(value).toLowerCase().replace(/[\s_\-/]/g, "");
}

function codeTokens(value: string): string[] {
  const out: string[] = [];
  const re = /`([^`]+)`/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(value)) !== null) out.push(match[1]);
  return out;
}

function codeTokensWithIndex(value: string): Array<{ token: string; index: number }> {
  const out: Array<{ token: string; index: number }> = [];
  const re = /`([^`]+)`/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(value)) !== null) out.push({ token: match[1], index: match.index });
  return out;
}

function classTokenFromCode(token: string): string | null {
  let value = token.trim();
  value = value.split(/\s*=\s*/)[0].trim();
  value = value.split(/\s+/)[0].trim();
  value = value.replace(/[),.;:]+$/g, "");
  if (EXCLUDED_CODE_TOKENS.has(value)) return null;
  if (/_rate_limit_exceeded$/.test(value) || /_rate_limited$/.test(value)) return null;
  if (!/^[a-z][a-z0-9_]*$/.test(value)) return null;
  if (value.includes(":")) return null;
  return value;
}

function classTokens(value: string): string[] {
  const seen = new Set<string>();
  for (const token of codeTokens(value)) {
    const parsed = classTokenFromCode(token);
    if (parsed) seen.add(parsed);
  }
  return [...seen];
}

function appendixJRange(doc: SpecDoc) {
  return computeSectionRanges(doc).find((range) => /^Appendix J:/.test(range.heading.title)) ?? null;
}

function appendixMRange(doc: SpecDoc) {
  return computeSectionRanges(doc).find((range) => /^Appendix M\b/.test(range.heading.title)) ?? null;
}

function isInside(range: { startLine: number; endLine: number } | null, line: number): boolean {
  return !!range && line >= range.startLine && line <= range.endLine;
}

function tableCells(raw: string): string[] {
  return splitUnescapedPipes(raw.trim().replace(/^\|/, "").replace(/\|$/, "")).map((cell) => cell.trim());
}

function isTableLine(raw: string | undefined): boolean {
  return !!raw && /^\s*\|.*\|\s*$/.test(raw);
}

function isDelimiterRow(raw: string | undefined): boolean {
  if (!isTableLine(raw)) return false;
  return tableCells(raw ?? "").every((cell) => /^:?-{2,}:?$/.test(cell) || cell === "");
}

function isHeaderLine(doc: SpecDoc, line: number): boolean {
  return isTableLine(doc.lines[line]) && isDelimiterRow(doc.lines[line + 1]);
}

function extractAppendixJRegistry(doc: SpecDoc): { values: Set<string>; line: number } {
  const appendix = appendixJRange(doc);
  if (!appendix) return { values: new Set(), line: 0 };

  for (let line = appendix.startLine; line <= appendix.endLine; line++) {
    if (!/^### API Rate-Limit Classes\b/.test(doc.lines[line] ?? "")) continue;
    const values = new Set<string>();
    let firstValueLine = line;
    for (let cursor = line + 1; cursor <= appendix.endLine; cursor++) {
      const raw = doc.lines[cursor] ?? "";
      if (/^#{1,6}\s+/.test(raw)) break;
      for (const value of classTokens(raw)) {
        values.add(value);
        if (firstValueLine === line) firstValueLine = cursor;
      }
    }
    return { values, line: firstValueLine };
  }

  return { values: new Set(), line: appendix.startLine };
}

interface RateLimitRegistry {
  values: Set<string>;
  lineByValue: Map<string, number>;
  sectionLine: number;
}

function extractSection3245Registry(doc: SpecDoc, findings: Finding[]): RateLimitRegistry {
  const section = findSectionByAnchor(doc, "32.4.5-rate-limit-class-registry");
  const values = new Set<string>();
  const lineByValue = new Map<string, number>();
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      matched_text: "32.4.5-rate-limit-class-registry",
      message: "§32.4.5 Rate-Limit Class Registry section is missing.",
    });
    return { values, lineByValue, sectionLine: 0 };
  }

  const table = parseTableAt(doc, section.startLine, section.endLine);
  if (!table.header) {
    findings.push({
      file: doc.path,
      line: section.startLine,
      anchor: section.heading.anchor,
      matched_text: "Rate-Limit Class Registry",
      message: "§32.4.5 Rate-Limit Class Registry table is missing.",
    });
    return { values, lineByValue, sectionLine: section.startLine };
  }

  const classIdx = table.header.cells.findIndex((cell) => normalizedHeader(cell) === "classid");
  const requiredColumns = [
    { key: "scope", label: "Scope" },
    { key: "softlimit", label: "Soft Limit" },
    { key: "hardlimit", label: "Hard Limit" },
    { key: "burstconcurrency", label: "Burst / Concurrency" },
    { key: "429error", label: "429 Error" },
  ];
  const requiredIndexes = requiredColumns.map((column) => ({
    ...column,
    idx: table.header!.cells.findIndex((cell) => normalizedHeader(cell) === column.key),
  }));

  if (classIdx < 0) {
    findings.push({
      file: doc.path,
      line: table.header.line,
      anchor: section.heading.anchor,
      matched_text: table.header.cells.join(" | "),
      message: "§32.4.5 registry table must include a Class ID column.",
    });
  }

  for (const column of requiredIndexes) {
    if (column.idx >= 0) continue;
    findings.push({
      file: doc.path,
      line: table.header.line,
      anchor: section.heading.anchor,
      matched_text: table.header.cells.join(" | "),
      message: `§32.4.5 registry table is missing required ${column.label} column.`,
    });
  }

  for (const row of table.rows) {
    const classCell = classIdx >= 0 ? (row.cells[classIdx] ?? "") : "";
    const tokens = classTokens(classCell);
    if (tokens.length !== 1) {
      findings.push({
        file: doc.path,
        line: row.line,
        anchor: anchorForLine(doc, row.line),
        matched_text: classCell,
        message: "§32.4.5 registry row must declare exactly one Class ID code token.",
      });
      continue;
    }
    const classId = tokens[0];
    if (values.has(classId)) {
      findings.push({
        file: doc.path,
        line: row.line,
        anchor: anchorForLine(doc, row.line),
        matched_text: classId,
        message: `§32.4.5 registry duplicates rate-limit class \`${classId}\`.`,
      });
    }
    values.add(classId);
    lineByValue.set(classId, row.line);

    for (const column of requiredIndexes) {
      if (column.idx < 0) continue;
      const cell = stripMd(row.cells[column.idx] ?? "");
      if (cell.length > 0) continue;
      findings.push({
        file: doc.path,
        line: row.line,
        anchor: anchorForLine(doc, row.line),
        matched_text: classId,
        message: `§32.4.5 rate-limit class \`${classId}\` has an empty ${column.label} cell.`,
      });
    }
  }

  return { values, lineByValue, sectionLine: section.startLine };
}

function checkClassReferences(
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
    normalized.includes("endpoint-local")
  ) {
    return;
  }

  for (const token of classTokens(cell)) {
    if (registry.has(token)) continue;
    findings.push({
      file: doc.path,
      line,
      anchor: anchorForLine(doc, line),
      matched_text: token,
      message: `${source} declares unregistered Rate-Limit Class \`${token}\`; add it to §32.4.5 and Appendix J or retarget to a registered class.`,
    });
  }
}

function checkAuthScopeCell(
  findings: Finding[],
  doc: SpecDoc,
  registry: Set<string>,
  line: number,
  cell: string,
  source: string,
) {
  for (const token of classTokens(cell)) {
    if (!registry.has(token)) continue;
    findings.push({
      file: doc.path,
      line,
      anchor: anchorForLine(doc, line),
      matched_text: token,
      message: `${source} uses rate-limit class \`${token}\` as an Auth Scope.`,
    });
  }
}

function proseSegments(raw: string): string[] {
  const segments: string[] = [];
  const re = /rate[- ]limit class(?:es)?/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw)) !== null) {
    const rest = raw.slice(match.index);
    const sentenceEnd = rest.search(/\.\s/);
    segments.push(sentenceEnd >= 0 ? rest.slice(0, sentenceEnd + 1) : rest);
  }
  return segments;
}

function proseClassTokens(segment: string): string[] {
  const phrase = /rate[- ]limit class(?:es)?/i.exec(segment);
  if (!phrase) return [];
  const phraseEnd = phrase.index + phrase[0].length;
  const out = new Set<string>();

  for (const item of codeTokensWithIndex(segment)) {
    const parsed = classTokenFromCode(item.token);
    if (!parsed) continue;
    const between = segment.slice(phraseEnd, item.index).toLowerCase();
    const before = segment.slice(Math.max(0, item.index - 50), item.index).toLowerCase();
    const after = segment.slice(item.index + item.token.length + 2, item.index + item.token.length + 60).toLowerCase();

    if (/\b(?:qa|ci|unit|integration|e2e)?\s*test\s*$/.test(before)) continue;
    if (
      item.index - phraseEnd <= 80 ||
      /[:=]\s*[^.]*$/.test(between) ||
      /^\s*(?:class|classes|\(§32\.4\.5|\(per §32\.4\.5|per §32\.4\.5)/.test(after) ||
      /\b(?:use|uses|using|via the)\s+$/.test(before)
    ) {
      out.add(parsed);
    }
  }

  return [...out];
}

function checkProseClassReferences(
  findings: Finding[],
  doc: SpecDoc,
  registry: Set<string>,
  line: number,
  segment: string,
) {
  for (const token of proseClassTokens(segment)) {
    if (registry.has(token)) continue;
    findings.push({
      file: doc.path,
      line,
      anchor: anchorForLine(doc, line),
      matched_text: token,
      message: `Prose line ${line} declares unregistered Rate-Limit Class \`${token}\`; add it to §32.4.5 and Appendix J or retarget to a registered class.`,
    });
  }
}

export const gate: SpecLintGate = {
  id: "api_rate_limit_class_registry_consistency",
  sourcePhase: "V8.1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const appendixJ = appendixJRange(doc);
    const appendixM = appendixMRange(doc);
    const rateLimitRegistrySection = findSectionByAnchor(doc, "32.4.5-rate-limit-class-registry");
    const appendixRegistry = extractAppendixJRegistry(doc);
    const sectionRegistry = extractSection3245Registry(doc, findings);

    if (appendixRegistry.values.size === 0) {
      findings.push({
        file: doc.path,
        line: appendixRegistry.line,
        matched_text: "API Rate-Limit Classes",
        message: "Appendix J API Rate-Limit Classes registry has no parseable class values.",
      });
    }

    for (const value of appendixRegistry.values) {
      if (sectionRegistry.values.has(value)) continue;
      findings.push({
        file: doc.path,
        line: appendixRegistry.line,
        anchor: anchorForLine(doc, appendixRegistry.line),
        matched_text: value,
        message: `Appendix J api_rate_limit_class value \`${value}\` is missing from §32.4.5.`,
      });
    }
    for (const value of sectionRegistry.values) {
      if (appendixRegistry.values.has(value)) continue;
      findings.push({
        file: doc.path,
        line: sectionRegistry.lineByValue.get(value) ?? sectionRegistry.sectionLine,
        anchor: anchorForLine(doc, sectionRegistry.lineByValue.get(value) ?? sectionRegistry.sectionLine),
        matched_text: value,
        message: `§32.4.5 rate-limit class \`${value}\` is missing from Appendix J api_rate_limit_class.`,
      });
    }

    for (let line = 1; line < doc.lines.length; line++) {
      if (!isHeaderLine(doc, line)) continue;
      const header = tableCells(doc.lines[line] ?? "");
      const rateIdx = header.findIndex((cell) => normalizedHeader(cell) === "ratelimitclass");
      const authIdx = header.findIndex((cell) => normalizedHeader(cell) === "authscope");
      if (rateIdx < 0 && authIdx < 0) continue;

      const table = parseTableAt(doc, line);
      for (const row of table.rows) {
        if (rateIdx >= 0) {
          checkClassReferences(
            findings,
            doc,
            sectionRegistry.values,
            row.line,
            row.cells[rateIdx] ?? "",
            `Table row ${row.line}`,
          );
        }
        if (authIdx >= 0) {
          checkAuthScopeCell(
            findings,
            doc,
            sectionRegistry.values,
            row.line,
            row.cells[authIdx] ?? "",
            `Table row ${row.line}`,
          );
        }
      }
    }

    for (let line = 1; line < doc.lines.length; line++) {
      const raw = doc.lines[line] ?? "";
      if (!isTableLine(raw) || isDelimiterRow(raw) || isHeaderLine(doc, line)) continue;
      const cells = tableCells(raw);
      const first = normalizedHeader(cells[0] ?? "");
      if (first === "ratelimitclass" || first === "ratelimitclasses") {
        checkClassReferences(findings, doc, sectionRegistry.values, line, cells.slice(1).join(" | "), `Key/value row ${line}`);
      }
      if (first === "authscope") {
        checkAuthScopeCell(findings, doc, sectionRegistry.values, line, cells.slice(1).join(" | "), `Key/value row ${line}`);
      }
    }

    for (let line = 1; line < doc.lines.length; line++) {
      if (isInside(appendixJ, line) || isInside(appendixM, line) || isInside(rateLimitRegistrySection, line)) continue;
      const raw = doc.lines[line] ?? "";
      if (isTableLine(raw)) continue;
      if (!/rate[- ]limit class/i.test(raw)) continue;
      for (const segment of proseSegments(raw)) {
        checkProseClassReferences(findings, doc, sectionRegistry.values, line, segment);
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
