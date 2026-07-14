/**
 * Gate: `pagination_envelope_canonical`
 *
 * Assertion: §32 list response examples use the §32.3 canonical envelope:
 * top-level `data` and `pagination`, with `pagination.has_more`,
 * `pagination.next_cursor`, and `pagination.limit`.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, computeSectionRanges } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function section32Range(doc: SpecDoc) {
  const ranges = computeSectionRanges(doc);
  const start = ranges.find((range) => range.heading.level === 2 && /^32\.1\b/.test(range.heading.title));
  const end = ranges.find((range) => range.heading.level === 2 && /^33\.1\b/.test(range.heading.title));
  if (start && end) return { startLine: start.startLine, endLine: end.startLine - 1 };
  const first32 = ranges.find((range) => range.heading.level === 2 && /^32\b/.test(range.heading.title));
  return first32 ? { startLine: first32.startLine, endLine: doc.lines.length - 1 } : null;
}

function fencedBlocks(doc: SpecDoc, startLine: number, endLine: number) {
  const blocks: Array<{ text: string; line: number }> = [];
  let inFence = false;
  let start = 0;
  let lang = "";
  let parts: string[] = [];

  for (let line = startLine; line <= endLine; line++) {
    const raw = doc.lines[line] ?? "";
    const fence = /^```(\w+)?/.exec(raw.trim());
    if (fence) {
      if (inFence) {
        if (!lang || lang === "json") blocks.push({ text: parts.join("\n"), line: start });
        inFence = false;
        lang = "";
        parts = [];
      } else {
        inFence = true;
        start = line;
        lang = (fence[1] ?? "").toLowerCase();
        parts = [];
      }
      continue;
    }
    if (inFence) parts.push(raw);
  }
  return blocks;
}

function hasTopLevelKey(text: string, key: string): boolean {
  return new RegExp(`^\\s{2}\"${key}\"\\s*:`, "m").test(text);
}

function hasPaginationKey(text: string, key: string): boolean {
  const paginationMatch = /"pagination"\s*:\s*\{([\s\S]*?)\n\s*\}/.exec(text);
  if (!paginationMatch) return false;
  return new RegExp(`"${key}"\\s*:`).test(paginationMatch[1]);
}

function looksLikeListResponse(text: string): boolean {
  return /"data"\s*:\s*\[/.test(text) || /"pagination"\s*:\s*\{/.test(text) || /"next_cursor"\s*:/.test(text);
}

export const gate: SpecLintGate = {
  id: "pagination_envelope_canonical",
  sourcePhase: "V8.1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const section32 = section32Range(doc);
    if (!section32) {
      push(findings, doc, 0, "§32", "§32 API section is missing.");
      return findings;
    }

    for (const block of fencedBlocks(doc, section32.startLine, section32.endLine)) {
      const text = block.text;
      if (!looksLikeListResponse(text)) continue;
      const hasPagination = /"pagination"\s*:\s*\{/.test(text);

      if (!hasPagination && hasTopLevelKey(text, "next_cursor")) {
        push(
          findings,
          doc,
          block.line,
          "next_cursor",
          "§32 list response example uses flat next_cursor instead of the §32.3 data + pagination envelope.",
        );
      }
      if (!hasPagination) continue;

      if (!hasTopLevelKey(text, "data")) {
        push(findings, doc, block.line, "pagination", "§32 paginated response example is missing top-level data array.");
      }
      for (const key of ["has_more", "next_cursor", "limit"]) {
        if (hasPaginationKey(text, key)) continue;
        push(
          findings,
          doc,
          block.line,
          key,
          `§32 paginated response example is missing pagination.${key}.`,
        );
      }
      if (hasPaginationKey(text, "cursor")) {
        push(
          findings,
          doc,
          block.line,
          "cursor",
          "§32 paginated response example uses pagination.cursor; §32.3 requires pagination.next_cursor.",
        );
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
