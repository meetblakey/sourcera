/**
 * Gate: `idempotency_key_canonical_error_code`
 *
 * Assertion: active endpoint behavior emits HTTP 409
 * `idempotency_key_request_mismatch`; the retired
 * `idempotency_key_body_mismatch` token is confined to alias notes.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const CANONICAL = "idempotency_key_request_mismatch";
const RETIRED = "idempotency_key_body_mismatch";
const CANONICAL_ROW = "| `idempotency_key_request_mismatch` | 409 |";
const BAD_STATUS_RE = /\bHTTP\s+(?!409\b)(\d{3})\s+`idempotency_key_request_mismatch`/g;

function retiredAliasAllowed(line: string): boolean {
  return /deprecated alias|alias note|historical logs|MUST NOT be emitted/i.test(line);
}

export const gate: SpecLintGate = {
  id: "idempotency_key_canonical_error_code",
  sourcePhase: "V8.1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    if (!doc.text.includes(CANONICAL_ROW)) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: CANONICAL_ROW,
        message: "`idempotency_key_request_mismatch` must be registered in Appendix I with HTTP 409.",
      });
    }

    for (let lineNo = 1; lineNo < doc.lines.length; lineNo++) {
      const line = doc.lines[lineNo] ?? "";

      if (line.includes(RETIRED) && !retiredAliasAllowed(line)) {
        findings.push({
          file: doc.path,
          line: lineNo,
          anchor: anchorForLine(doc, lineNo),
          matched_text: RETIRED,
          message: "Retired alias `idempotency_key_body_mismatch` appears outside an explicit alias/historical note.",
        });
      }

      if (!line.includes(CANONICAL)) continue;
      BAD_STATUS_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = BAD_STATUS_RE.exec(line)) !== null) {
        findings.push({
          file: doc.path,
          line: lineNo,
          anchor: anchorForLine(doc, lineNo),
          matched_text: m[0],
          message: "`idempotency_key_request_mismatch` active behavior must use HTTP 409.",
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
