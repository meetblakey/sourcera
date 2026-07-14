/**
 * Gate: `kb_export_console_firewall_status_consistency`
 *
 * Assertion: active `kb_export_console_forbidden` behavior resolves to HTTP 404
 * everywhere. Explicit pre-V8.4 / legacy-alias notes may mention older statuses
 * only as historical context.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const CODE = "kb_export_console_forbidden";
const BAD_HTTP_RE = /\bHTTP\s+(403|422)\b/g;
const BAD_TABLE_RE = /^\s*\|\s*(403|422)\s*\|\s*`kb_export_console_forbidden`\s*\|/;
const HISTORICAL_ALLOW_RE =
  /\b(?:pre-V8\.4|legacy|deprecated|alias|historical|status correction|migrated)\b/i;

const REQUIRED_TEXTS = [
  "| `console` | Enum | Always `seller` | Buyer-console writes return HTTP 404 `kb_export_console_forbidden` per the §7.2 non-leak firewall rule. |",
  "| `console` | Enum | `console = 'seller'` ONLY | `'buyer'` writes return HTTP 404 `kb_export_console_forbidden` per the §7.2 non-leak firewall rule. Buyer consoles have no KB surface (§8 buyer-side scope). |",
  "| 404 | `kb_export_console_forbidden` | Token issued from buyer-console scope; non-leak firewall response |",
  "| 404 | `kb_export_console_forbidden` | Buyer-console token; non-leak firewall response |",
  "| `kb_export_console_forbidden` | 404 |",
  "QA test `kb_export_buyer_console_rejected` asserts HTTP 404 `kb_export_console_forbidden`",
];

function lineIsAllowedHistorical(line: string): boolean {
  return HISTORICAL_ALLOW_RE.test(line);
}

function badHttpBindsToConsoleCode(line: string, statusIndex: number): boolean {
  const afterStatus = line.slice(statusIndex, statusIndex + 120);
  return afterStatus.includes(`\`${CODE}\``);
}

export const gate: SpecLintGate = {
  id: "kb_export_console_firewall_status_consistency",
  sourcePhase: "V8.4",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_console_firewall",
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
          message: `Missing canonical KB export console-firewall binding: ${required}`,
        });
      }
    }

    for (let lineNo = 1; lineNo < doc.lines.length; lineNo++) {
      const line = doc.lines[lineNo] ?? "";
      if (!line.includes(CODE)) continue;

      if (BAD_TABLE_RE.test(line) && !lineIsAllowedHistorical(line)) {
        findings.push({
          file: doc.path,
          line: lineNo,
          anchor: anchorForLine(doc, lineNo),
          matched_text: line.trim(),
          message: "`kb_export_console_forbidden` active error-table rows must use HTTP 404.",
        });
        continue;
      }

      BAD_HTTP_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = BAD_HTTP_RE.exec(line)) !== null) {
        if (lineIsAllowedHistorical(line)) continue;
        if (!badHttpBindsToConsoleCode(line, m.index)) continue;
        findings.push({
          file: doc.path,
          line: lineNo,
          anchor: anchorForLine(doc, lineNo),
          matched_text: m[0],
          message: "`kb_export_console_forbidden` active prose must name HTTP 404, not HTTP 403/422.",
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
