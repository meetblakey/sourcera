/**
 * Gate: `cooldown_status_convention`
 *
 * Assertion: time-window / cooldown / rate-limit style Appendix I errors use
 * HTTP 429 with Retry-After semantics, not generic state-conflict statuses.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  computeSectionRanges,
  splitUnescapedPipes,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const TARGET_CODE_RE =
  /(?:_cooldown(?:_active)?|_rate_limit(?:ed|_exceeded)|_rate_limited|_velocity(?:_[a-z0-9]+)*_exceeded|_cadence_exceeded|_debounce_active)$/;
const HISTORICAL_RE = /\b(?:legacy|alias|migrat(?:ed|ion)|pre-v8\.4|d-v8\.4|status correction|409\s*(?:→|->)\s*429)\b/i;

function stripMd(value: string): string {
  return value.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function splitTableRow(raw: string): string[] {
  return splitUnescapedPipes(raw.trim().replace(/^\|/, "").replace(/\|$/, "")).map((cell) => cell.trim());
}

function isDelimiterRow(raw: string): boolean {
  return splitTableRow(raw).every((cell) => /^:?-{2,}:?$/.test(cell) || cell === "");
}

function appendixIRange(doc: SpecDoc) {
  return computeSectionRanges(doc).find((range) => /^Appendix I:/.test(range.heading.title)) ?? null;
}

function targetCode(value: string): boolean {
  const code = stripMd(value);
  if (/_fraud_cooldown$/.test(code)) return false;
  return TARGET_CODE_RE.test(code);
}

export const gate: SpecLintGate = {
  id: "cooldown_status_convention",
  sourcePhase: "V8.4",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_retry_class_binding",
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
        message: "Appendix I is missing; cooldown status convention cannot be evaluated.",
      }];
    }

    for (let line = appendix.startLine; line <= appendix.endLine; line++) {
      const raw = doc.lines[line] ?? "";
      if (/^\s*\|.*\|\s*$/.test(raw)) {
        const header = splitTableRow(raw);
        const normalized = header.map((cell) => stripMd(cell).toLowerCase());
        const codeIdx = normalized.findIndex((cell) => cell === "code" || cell === "error code");
        const httpIdx = normalized.findIndex((cell) => cell === "http" || cell === "http / exit");
        if (codeIdx < 0 || httpIdx < 0) continue;

        for (let rowLine = line + 2; rowLine <= appendix.endLine; rowLine++) {
          const rowRaw = doc.lines[rowLine] ?? "";
          if (!/^\s*\|.*\|\s*$/.test(rowRaw)) break;
          if (isDelimiterRow(rowRaw)) continue;
          const cells = splitTableRow(rowRaw);
          const code = stripMd(cells[codeIdx] ?? "");
          const http = stripMd(cells[httpIdx] ?? "");
          if (targetCode(code) && http !== "429") {
            findings.push({
              file: doc.path,
              line: rowLine,
              anchor: anchorForLine(doc, rowLine),
              matched_text: code,
              message: `Cooldown/rate-limit code \`${code}\` must use HTTP 429; found HTTP ${http || "(blank)"}.`,
            });
          }
        }
      }

      const bullet = /^\s*-\s+`([^`]+)`\s+—\s+HTTP\s+((?:2|4|5)\d\d)\b/.exec(raw);
      if (bullet && targetCode(bullet[1]) && bullet[2] !== "429") {
        findings.push({
          file: doc.path,
          line,
          anchor: anchorForLine(doc, line),
          matched_text: bullet[1],
          message: `Cooldown/rate-limit bullet \`${bullet[1]}\` must use HTTP 429; found HTTP ${bullet[2]}.`,
        });
      }
    }

    const codeRe = /`([a-z][a-z0-9]*(?:_[a-z0-9]+)+)`[^\\n]{0,160}?HTTP\s+((?:2|4|5)\d\d)\b/g;
    for (let line = 1; line < doc.lines.length; line++) {
      const raw = doc.lines[line] ?? "";
      if (HISTORICAL_RE.test(raw)) continue;
      codeRe.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = codeRe.exec(raw)) !== null) {
        const code = match[1];
        const http = match[2];
        if (targetCode(code) && http !== "429") {
          findings.push({
            file: doc.path,
            line,
            anchor: anchorForLine(doc, line),
            matched_text: code,
            message: `Active prose reference for cooldown/rate-limit code \`${code}\` must cite HTTP 429; found HTTP ${http}.`,
          });
        }
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
