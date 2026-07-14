/**
 * Gate: `pagination_param_canonical`
 *
 * Assertion: §32 list endpoint pagination query parameters use `cursor` and
 * `limit`; `page_size` and `offset` are not allowed in active §32 endpoint
 * query-parameter declarations.
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

function isHistoricalOrNonEmittable(line: string): boolean {
  return /\b(historical|migration|non-emittable|deprecated|retired)\b/i.test(line);
}

export const gate: SpecLintGate = {
  id: "pagination_param_canonical",
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

    for (let line = section32.startLine; line <= section32.endLine; line++) {
      const text = doc.lines[line] ?? "";
      if (isHistoricalOrNonEmittable(text)) continue;
      for (const token of ["page_size", "offset"]) {
        if (token === "offset" && /\bnot\s+offset\b/i.test(text)) continue;
        const re = new RegExp("(?:`" + token + "`|\\b" + token + "\\b)");
        if (!re.test(text)) continue;
        push(
          findings,
          doc,
          line,
          token,
          `§32 active list pagination declaration uses ${token}; §32.3 requires cursor + limit.`,
        );
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
