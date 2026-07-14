/**
 * Gate: `kb_export_integrity_http_code_single_source`
 *
 * Assertion: every active `kb_export_archive_integrity_failed` status binding
 * resolves to HTTP 410.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const CODE = "kb_export_archive_integrity_failed";
const HTTP_RE = /\bHTTP\s+(\d{3})\b/g;
const TABLE_STATUS_RE = /^\s*\|\s*(\d{3})\s*\|\s*`kb_export_archive_integrity_failed`\s*\|/;
const ALLOW_CONTEXT_RE = /\b(?:forbidden|historical|pre-V8\.1|legacy|not\s+404)\b/i;

const REQUIRED_TEXTS = [
  "HTTP 410 `kb_export_archive_integrity_failed`",
  "| 410 | `kb_export_archive_integrity_failed` |",
  "| `kb_export_archive_integrity_failed` | 410 |",
  "QA test `kb_export_integrity_failure_410` corrupts the S3 object post-ready, polls, and asserts HTTP 410 `kb_export_archive_integrity_failed`.",
];

export const gate: SpecLintGate = {
  id: "kb_export_integrity_http_code_single_source",
  sourcePhase: "V8.1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (const required of REQUIRED_TEXTS) {
      if (!doc.text.includes(required)) {
        findings.push({
          file: doc.path,
          line: 0,
          matched_text: required,
          message: `Missing canonical KB export integrity status binding: ${required}`,
        });
      }
    }

    for (let lineNo = 1; lineNo < doc.lines.length; lineNo++) {
      const line = doc.lines[lineNo] ?? "";
      if (!line.includes(CODE)) continue;

      const table = TABLE_STATUS_RE.exec(line);
      if (table && table[1] !== "410" && !ALLOW_CONTEXT_RE.test(line)) {
        findings.push({
          file: doc.path,
          line: lineNo,
          anchor: anchorForLine(doc, lineNo),
          matched_text: line.trim(),
          message: "`kb_export_archive_integrity_failed` table rows must use HTTP 410.",
        });
      }

      HTTP_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = HTTP_RE.exec(line)) !== null) {
        if (m[1] === "410" || ALLOW_CONTEXT_RE.test(line)) continue;
        findings.push({
          file: doc.path,
          line: lineNo,
          anchor: anchorForLine(doc, lineNo),
          matched_text: m[0],
          message: "`kb_export_archive_integrity_failed` active prose must name HTTP 410.",
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
