/**
 * Gate: `error_envelope_canonical`
 *
 * Assertion: endpoint error examples in §10, §22, §31, and §32 use the §32.6
 * standard envelope: top-level `error`, nested `error.code`, `error.message`,
 * `error.details`, and `error.request_id`. Top-level `error_code`, string
 * `error`, and legacy `error.type` shapes are forbidden.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, computeSectionRanges, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const SCANNED_SECTION_PREFIXES = ["10", "22", "31", "32"];
const REQUIRED_ENVELOPE_KEYS = ["code", "message", "details", "request_id"];

function topLevelRanges(doc: SpecDoc) {
  return computeSectionRanges(doc).filter((range) => {
    if (range.heading.level !== 2) return false;
    return SCANNED_SECTION_PREFIXES.some((prefix) => range.heading.title.startsWith(`${prefix} `) || range.heading.title.startsWith(`${prefix}.`));
  });
}

function appendixIRange(doc: SpecDoc) {
  return computeSectionRanges(doc).find((range) => /^Appendix I:/.test(range.heading.title)) ?? null;
}

function lineInRanges(ranges: Array<{ startLine: number; endLine: number }>, line: number): boolean {
  return ranges.some((range) => line >= range.startLine && line <= range.endLine);
}

function normalizeCodeCandidate(value: string): string[] {
  return value
    .split("|")
    .map((part) => part.trim().replace(/\\\|/g, "|"))
    .filter((part) => /^[a-z][a-z0-9_]*$/.test(part));
}

function codeIsRegistered(appendixText: string, code: string): boolean {
  return appendixText.includes(`\`${code}\``);
}

function validateExampleText(
  findings: Finding[],
  doc: SpecDoc,
  appendixText: string,
  text: string,
  line: number,
  label: string,
) {
  if (!/"error"\s*:/.test(text) && !/"error_code"\s*:/.test(text)) return;

  if (/"error_code"\s*:/.test(text) || /error_code\s*:/.test(text)) {
    findings.push({
      file: doc.path,
      line,
      anchor: anchorForLine(doc, line),
      matched_text: "error_code",
      message: `${label} uses legacy top-level error_code instead of nested error.code.`,
    });
  }

  if (/"error"\s*:\s*"/.test(text)) {
    findings.push({
      file: doc.path,
      line,
      anchor: anchorForLine(doc, line),
      matched_text: '"error": "',
      message: `${label} uses a string error value instead of the §32.6 error object.`,
    });
  }

  if (/"error"\s*:\s*\{[\s\S]*"type"\s*:/.test(text)) {
    findings.push({
      file: doc.path,
      line,
      anchor: anchorForLine(doc, line),
      matched_text: '"error": { "type"',
      message: `${label} uses legacy error.type instead of error.code.`,
    });
  }

  if (!/"error"\s*:\s*\{/.test(text)) return;

  for (const key of REQUIRED_ENVELOPE_KEYS) {
    if (new RegExp(`"${key}"\\s*:`).test(text)) continue;
    findings.push({
      file: doc.path,
      line,
      anchor: anchorForLine(doc, line),
      matched_text: key,
      message: `${label} is missing required §32.6 error.${key} field.`,
    });
  }

  const codeRe = /"code"\s*:\s*"([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = codeRe.exec(text)) !== null) {
    for (const code of normalizeCodeCandidate(match[1])) {
      if (codeIsRegistered(appendixText, code)) continue;
      findings.push({
        file: doc.path,
        line,
        anchor: anchorForLine(doc, line),
        matched_text: code,
        message: `${label} references error code \`${code}\`, but Appendix I does not register it.`,
      });
    }
  }
}

function fencedBlocks(doc: SpecDoc, ranges: Array<{ startLine: number; endLine: number }>) {
  const blocks: Array<{ text: string; line: number }> = [];
  let inFence = false;
  let start = 0;
  let parts: string[] = [];

  for (let line = 1; line < doc.lines.length; line++) {
    if (!lineInRanges(ranges, line)) continue;
    const raw = doc.lines[line] ?? "";
    if (/^```/.test(raw.trim())) {
      if (inFence) {
        blocks.push({ text: parts.join("\n"), line: start });
        inFence = false;
        parts = [];
      } else {
        inFence = true;
        start = line;
        parts = [];
      }
      continue;
    }
    if (inFence) parts.push(raw);
  }

  return blocks;
}

export const gate: SpecLintGate = {
  id: "error_envelope_canonical",
  sourcePhase: "V8.1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const ranges = topLevelRanges(doc);
    const appendix = appendixIRange(doc);
    const appendixText = appendix ? doc.lines.slice(appendix.startLine, appendix.endLine + 1).join("\n") : "";

    const section32 = findSectionByAnchor(doc, "32.6-error-handling");
    if (!section32) {
      findings.push({
        file: doc.path,
        line: 0,
        anchor: "32.6-error-handling",
        message: "§32.6 Error Handling section is missing.",
      });
    } else {
      const text = doc.lines.slice(section32.startLine, section32.endLine + 1).join("\n");
      validateExampleText(findings, doc, appendixText, text, section32.startLine, "§32.6 standard envelope");
    }

    for (const block of fencedBlocks(doc, ranges)) {
      validateExampleText(findings, doc, appendixText, block.text, block.line, `JSON error example at line ${block.line}`);
    }

    for (let line = 1; line < doc.lines.length; line++) {
      if (!lineInRanges(ranges, line)) continue;
      const raw = doc.lines[line] ?? "";
      if (!/\{"error":/.test(raw) && !/"error_code"\s*:/.test(raw) && !/"error"\s*:\s*"/.test(raw)) continue;
      validateExampleText(findings, doc, appendixText, raw, line, `Inline error example at line ${line}`);
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
