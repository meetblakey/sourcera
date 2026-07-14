/**
 * Gate: `api_path_prefix_canonical`
 *
 * Assertion: live Sourcera REST API endpoint path tokens use the §32.1 `/v1`
 * root and never use the legacy `/api/v1` prefix.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const REQUIRED_TEXTS = [
  "Current version: `v1`",
  "Base URL: `https://api.sourcera.io/v1`",
  "uses the `/v1` path-prefix convention from §32.1",
  "Console-qualified path roots (`/v1/seller/marketplace`, `/v1/buyer/marketplace`, `/v1/ops/marketplace`) are canonical under the §32.1 `/v1` API version and are not alternate API prefixes.",
];

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/api_path_prefix_canonical.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "§32.1 `/v1` root",
  "legacy `/api/v1` prefix",
];

const METHOD_PATH_RE = /\b(GET|POST|PATCH|PUT|DELETE)\s+`?(\/[^`\s|)]+)/g;
const LEGACY_API_PREFIX_RE = /(?:^|[\s`(])(?:https?:\/\/[^`\s)]*)?\/api\/v1(?:\/|[\s`)])/i;
const HISTORICAL_ALLOW_RE = /\b(?:retired|historical|legacy|Pre-V\d|pre-V\d|prior|old|superseded|deprecated|may appear only|canonical fallback to the root Marketplace index)\b/i;

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function requiredTextFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const required of REQUIRED_TEXTS) {
    if (!doc.text.includes(required)) {
      push(findings, doc, 0, required, `Missing API path-prefix canonicality text: ${required}`);
    }
  }
  return findings;
}

function pathTokenFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (let lineNo = 1; lineNo < doc.lines.length; lineNo++) {
    const line = doc.lines[lineNo] ?? "";
    if (LEGACY_API_PREFIX_RE.test(line) && !HISTORICAL_ALLOW_RE.test(line)) {
      push(findings, doc, lineNo, line.trim(), "Legacy `/api/v1` API prefix appears outside an explicit historical note.");
    }

    METHOD_PATH_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = METHOD_PATH_RE.exec(line)) !== null) {
      const method = match[1];
      const path = match[2];
      if (path.startsWith("/v1")) continue;
      if (path.startsWith("/kb/v1")) continue;
      if (HISTORICAL_ALLOW_RE.test(line)) continue;
      push(findings, doc, lineNo, `${method} ${path}`, "Live Sourcera REST API endpoint path tokens must start with `/v1`; placeholders and alternate roots are not permitted.");
    }
  }
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `api_path_prefix_canonical` |"));
  if (!row) {
    push(findings, doc, 0, "`api_path_prefix_canonical`", "§M.5 row api_path_prefix_canonical is missing.");
    return findings;
  }
  for (const token of M5_TOKENS) {
    if (!row.text.includes(token)) {
      push(findings, doc, row.line, token, `§M.5 api_path_prefix_canonical row is missing required token: ${token}`);
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "api_path_prefix_canonical",
  sourcePhase: "V8.1",
  rowClass: "content_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...requiredTextFindings(doc),
      ...pathTokenFindings(doc),
      ...m5Findings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
