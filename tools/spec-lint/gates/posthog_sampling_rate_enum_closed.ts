/**
 * Gate: `posthog_sampling_rate_enum_closed`
 *
 * Assertion: every decimal literal used with Appendix G `sampling_rate` belongs
 * to Appendix J `sampling_rate_kind`.
 */

import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { anchorForLine, findSectionByTitle } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";

const DECIMAL = /(?<![A-Za-z0-9])([0-9]+\.[0-9]+)(?![A-Za-z0-9])/g;
const HAS_DECIMAL = /(?<![A-Za-z0-9])[0-9]+\.[0-9]+(?![A-Za-z0-9])/;
const BACKTICK = /`([^`]+)`/g;

function collectAllowed(doc: SpecDoc): Set<string> | null {
  const section = findSectionByTitle(doc, /sampling_rate_kind/);
  if (!section) return null;
  const allowed = new Set<string>();
  for (let line = section.startLine + 1; line <= section.endLine; line++) {
    let chunk: RegExpExecArray | null;
    BACKTICK.lastIndex = 0;
    while ((chunk = BACKTICK.exec(doc.lines[line] ?? "")) !== null) {
      let m: RegExpExecArray | null;
      DECIMAL.lastIndex = 0;
      while ((m = DECIMAL.exec(chunk[1])) !== null) allowed.add(m[1]);
    }
  }
  return allowed;
}

function samplingLiterals(line: string): string[] {
  const values: string[] = [];
  const setMatch = /sampling_rate.*?∈\s*\{([^}]+)\}/.exec(line);
  if (setMatch) {
    let m: RegExpExecArray | null;
    DECIMAL.lastIndex = 0;
    while ((m = DECIMAL.exec(setMatch[1])) !== null) values.push(m[1]);
  }

  let chunk: RegExpExecArray | null;
  BACKTICK.lastIndex = 0;
  while ((chunk = BACKTICK.exec(line)) !== null) {
    const text = chunk[1];
    if (!text.includes("sampling_rate") && !HAS_DECIMAL.test(text)) continue;
    DECIMAL.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = DECIMAL.exec(text)) !== null) values.push(m[1]);
    DECIMAL.lastIndex = 0;
  }
  return [...new Set(values)];
}

export const gate: SpecLintGate = {
  id: "posthog_sampling_rate_enum_closed",
  sourcePhase: "M.5.64",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const appendixG = findSectionByTitle(doc, /^Appendix G\b/);
    const allowed = collectAllowed(doc);
    if (!appendixG) {
      return [{ file: doc.path, line: 0, message: "parse_error: Appendix G section not found." }];
    }
    if (!allowed || allowed.size === 0) {
      return [{ file: doc.path, line: 0, message: "parse_error: Appendix J sampling_rate_kind enum not found or empty." }];
    }

    const findings: Finding[] = [];
    let references = 0;
    for (let line = appendixG.startLine + 1; line <= appendixG.endLine; line++) {
      const text = doc.lines[line] ?? "";
      if (!text.includes("sampling_rate")) continue;
      references++;
      for (const value of samplingLiterals(text)) {
        if (!allowed.has(value)) {
          findings.push({
            file: doc.path,
            line,
            anchor: anchorForLine(doc, line),
            matched_text: value,
            message: `Appendix G sampling_rate literal ${value} is not registered in Appendix J sampling_rate_kind (${[...allowed].sort().join(", ")}).`,
          });
        }
      }
    }

    if (references === 0) {
      findings.push({
        file: doc.path,
        line: appendixG.startLine,
        anchor: appendixG.heading.anchor,
        message: "parse_error: Appendix G contains no sampling_rate references.",
      });
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
