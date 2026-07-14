/**
 * Gate: `appendix_i_billing_code_completeness`
 *
 * Assertion: HTTP error codes emitted from §4.8.1-§4.8.8 billing / AI
 * accounting prose resolve to Appendix I "Pre-existing Billing Domain Codes"
 * rows with the V8.4 expanded column shape.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  computeSectionRanges,
  parseTableAt,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const TARGET_SECTION_NUMBERS = ["4.8.1", "4.8.2", "4.8.3", "4.8.4", "4.8.5", "4.8.6", "4.8.7", "4.8.8"];

const HTTP_ERROR_LINE =
  /\bHTTP\s+(?:4\d\d|5\d\d)\b|\breject(?:ed|s)? with\b|\breturns?\b.*\b(?:4\d\d|5\d\d)\b/i;
const CODE_TOKEN_RE = /`([a-z][a-z0-9]*(?:_[a-z0-9]+){1,})`/g;
const ERRORISH_TOKEN_RE =
  /(forbidden|invalid|mismatch|expired|failed|failure|conflict|declined|insufficient|capped|exceeded|required|immutable|denied|unavailable|rejected|not_found|blocked|direct_write|transition|locked|window_guard)/;

const NON_ERROR_REFERENCES = new Set([
  "agent_confidence_threshold_invalid", // Agent Errors canonical row, covered by agent threshold gate.
  "contest_record_window_guard", // DB trigger; maps to contest_record_direct_write_forbidden.
  "fx_rate_locked",
  "original_fx_rate_locked",
  "hard_capped_100",
  "hard_capped_auto_topup_monthly_cap",
]);

interface Candidate {
  code: string;
  line: number;
}

function stripMd(value: string): string {
  return value.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function sectionNumber(title: string): string {
  return /^([0-9]+(?:\.[0-9]+)*)/.exec(title.trim())?.[1] ?? "";
}

function targetRanges(doc: SpecDoc) {
  return computeSectionRanges(doc).filter((range) => TARGET_SECTION_NUMBERS.includes(sectionNumber(range.heading.title)));
}

function candidatesFromBillingSections(doc: SpecDoc): Candidate[] {
  const out = new Map<string, Candidate>();
  for (const range of targetRanges(doc)) {
    for (let line = range.startLine; line <= range.endLine; line++) {
      const raw = doc.lines[line] ?? "";
      if (!HTTP_ERROR_LINE.test(raw)) continue;
      CODE_TOKEN_RE.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = CODE_TOKEN_RE.exec(raw)) !== null) {
        const token = match[1];
        if (NON_ERROR_REFERENCES.has(token)) continue;
        if (!ERRORISH_TOKEN_RE.test(token)) continue;
        if (!out.has(token)) out.set(token, { code: token, line });
      }
    }
  }
  return [...out.values()].sort((a, b) => a.code.localeCompare(b.code));
}

function billingTable(doc: SpecDoc) {
  const section = computeSectionRanges(doc).find((range) => /^Pre-existing Billing Domain Codes$/.test(range.heading.title));
  if (!section) return null;
  const table = parseTableAt(doc, section.startLine + 1, section.endLine);
  return { section, table };
}

export const gate: SpecLintGate = {
  id: "appendix_i_billing_code_completeness",
  sourcePhase: "V8.4",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const candidates = candidatesFromBillingSections(doc);
    const parsed = billingTable(doc);
    if (!parsed || !parsed.table.header) {
      return [{
        file: doc.path,
        line: 0,
        matched_text: "Pre-existing Billing Domain Codes",
        message: "Appendix I Pre-existing Billing Domain Codes table is missing.",
      }];
    }

    const headers = parsed.table.header.cells.map((cell) => stripMd(cell).toLowerCase());
    const codeIdx = headers.findIndex((h) => h === "code");
    const httpIdx = headers.findIndex((h) => h === "http");
    const usedByIdx = headers.findIndex((h) => h === "used by");
    const retryableIdx = headers.findIndex((h) => h === "retryable");
    const localizationIdx = headers.findIndex((h) => h === "localization key");
    if ([codeIdx, httpIdx, usedByIdx, retryableIdx, localizationIdx].some((idx) => idx < 0)) {
      return [{
        file: doc.path,
        line: parsed.table.header.line,
        anchor: anchorForLine(doc, parsed.table.header.line),
        message: "Appendix I Pre-existing Billing Domain Codes table must carry Code, HTTP, Used By, Retryable, and Localization Key columns.",
      }];
    }

    const rows = new Map<string, { line: number; cells: string[] }>();
    for (const row of parsed.table.rows) {
      const code = stripMd(row.cells[codeIdx] ?? "");
      if (code) rows.set(code, { line: row.line, cells: row.cells });
    }

    for (const candidate of candidates) {
      const row = rows.get(candidate.code);
      if (!row) {
        findings.push({
          file: doc.path,
          line: candidate.line,
          anchor: anchorForLine(doc, candidate.line),
          matched_text: candidate.code,
          message: `§4.8 billing emit-path code \`${candidate.code}\` is missing from Appendix I Pre-existing Billing Domain Codes.`,
        });
        continue;
      }

      const http = stripMd(row.cells[httpIdx] ?? "");
      const usedBy = stripMd(row.cells[usedByIdx] ?? "");
      const retryable = stripMd(row.cells[retryableIdx] ?? "");
      const localization = stripMd(row.cells[localizationIdx] ?? "");
      if (!/^(4\d\d|5\d\d)$/.test(http)) {
        findings.push({
          file: doc.path,
          line: row.line,
          anchor: anchorForLine(doc, row.line),
          matched_text: candidate.code,
          message: `Appendix I billing code \`${candidate.code}\` must carry a 4xx/5xx HTTP status.`,
        });
      }
      if (!usedBy || usedBy === "—") {
        findings.push({
          file: doc.path,
          line: row.line,
          anchor: anchorForLine(doc, row.line),
          matched_text: candidate.code,
          message: `Appendix I billing code \`${candidate.code}\` must carry a non-empty Used By cell.`,
        });
      }
      if (!retryable || retryable === "—") {
        findings.push({
          file: doc.path,
          line: row.line,
          anchor: anchorForLine(doc, row.line),
          matched_text: candidate.code,
          message: `Appendix I billing code \`${candidate.code}\` must carry a non-empty Retryable cell.`,
        });
      }
      if (!/^error\.[a-z0-9_.]+$/.test(localization)) {
        findings.push({
          file: doc.path,
          line: row.line,
          anchor: anchorForLine(doc, row.line),
          matched_text: candidate.code,
          message: `Appendix I billing code \`${candidate.code}\` must carry a canonical error.<scope>.<code> localization key.`,
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
