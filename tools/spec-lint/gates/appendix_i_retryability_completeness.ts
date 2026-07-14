/**
 * Gate: `appendix_i_retryability_completeness`
 *
 * Assertion: Appendix I error-code registrations authored after the V8.4
 * preamble carry explicit retryability using the canonical `error_retry_class`
 * vocabulary.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  computeSectionRanges,
  splitUnescapedPipes,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const RETRY_VALUES = new Set(["transient", "permanent", "conditional", "idempotent_retry_only"]);

function stripMd(value: string): string {
  return value.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function splitTableRow(raw: string): string[] {
  return splitUnescapedPipes(raw.trim().replace(/^\|/, "").replace(/\|$/, "")).map((cell) => cell.trim());
}

function isDelimiterRow(raw: string): boolean {
  const cells = splitTableRow(raw);
  return cells.every((cell) => /^:?-{2,}:?$/.test(cell) || cell === "");
}

function postV84Title(title: string): boolean {
  const date = /2026-(\d{2})-(\d{2})/.exec(title);
  if (date) return Number(date[1]) * 100 + Number(date[2]) >= 508;
  return /v7\.1\.1|v7\.2\.0-REM|Responsive \/ Mobile Surface Errors/.test(title);
}

function sectionTitleForLine(doc: SpecDoc, line: number): string {
  let best = "";
  for (const range of computeSectionRanges(doc)) {
    if (range.startLine <= line && line <= range.endLine) best = range.heading.title;
  }
  return best;
}

function appendixIRange(doc: SpecDoc) {
  return computeSectionRanges(doc).find((range) => /^Appendix I:/.test(range.heading.title)) ?? null;
}

function hasHttpStatus(value: string): boolean {
  return /\b(?:2\d\d|4\d\d|5\d\d)\b/.test(value);
}

export const gate: SpecLintGate = {
  id: "appendix_i_retryability_completeness",
  sourcePhase: "V8.4",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const appendix = appendixIRange(doc);
    if (!appendix) {
      return [{
        file: doc.path,
        line: 0,
        matched_text: "Appendix I",
        message: "Appendix I is missing; retryability completeness cannot be evaluated.",
      }];
    }

    for (let line = appendix.startLine; line <= appendix.endLine; line++) {
      const raw = doc.lines[line] ?? "";
      const title = sectionTitleForLine(doc, line);
      if (!postV84Title(title)) continue;

      if (/^\s*\|.*\|\s*$/.test(raw)) {
        const header = splitTableRow(raw);
        const normalized = header.map((cell) => stripMd(cell).toLowerCase());
        const codeIdx = normalized.findIndex((cell) => cell === "code" || cell === "error code");
        const httpIdx = normalized.findIndex((cell) => cell === "http" || cell === "http / exit");
        if (codeIdx < 0 || httpIdx < 0) continue;

        const retryIdx = normalized.findIndex((cell) => cell === "retryable");
        if (retryIdx < 0) {
          findings.push({
            file: doc.path,
            line,
            anchor: anchorForLine(doc, line),
            matched_text: header.join(" | "),
            message: "Post-V8.4 Appendix I error-code table is missing an explicit Retryable column.",
          });
          continue;
        }

        for (let rowLine = line + 2; rowLine <= appendix.endLine; rowLine++) {
          const rowRaw = doc.lines[rowLine] ?? "";
          if (!/^\s*\|.*\|\s*$/.test(rowRaw)) break;
          if (isDelimiterRow(rowRaw)) continue;
          const cells = splitTableRow(rowRaw);
          const retryable = stripMd(cells[retryIdx] ?? "");
          if (!RETRY_VALUES.has(retryable)) {
            findings.push({
              file: doc.path,
              line: rowLine,
              anchor: anchorForLine(doc, rowLine),
              matched_text: cells[codeIdx] ?? "",
              message: `Appendix I row ${(cells[codeIdx] ?? "").trim()} must use an explicit error_retry_class value in Retryable; found "${retryable || "(blank)"}".`,
            });
          }
        }
      }

      const bullet = /^\s*-\s+`([^`]+)`\s+—\s+HTTP\s+((?:2|4|5)\d\d)\s*;(.*)$/.exec(raw);
      if (bullet && hasHttpStatus(raw)) {
        const tail = bullet[3];
        const retryMatch = /`(transient|permanent|conditional|idempotent_retry_only)`|retryable=(transient|permanent|conditional|idempotent_retry_only)\b/.exec(tail);
        if (!retryMatch) {
          findings.push({
            file: doc.path,
            line,
            anchor: anchorForLine(doc, line),
            matched_text: bullet[1],
            message: `Appendix I bullet registration \`${bullet[1]}\` must carry an explicit error_retry_class value after its HTTP status.`,
          });
        }
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
