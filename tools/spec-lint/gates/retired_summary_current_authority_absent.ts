/** Gate: retired Master Summary labels cannot control active behavior. */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const PREFIXED_RETIRED_REFERENCE = /(?:Summary\s+C\.\d+|Summary\s+§\d+(?:\.\d+)*)/g;
const BARE_AUTHORITY_REFERENCE = /(?:\bper\s+|\baccording\s+to\s+|\brequired\s+by\s+|\bsourced?\s+from\s+|\bbased\s+on\s+)(?:the\s+)?C\.\d+/gi;
const BARE_SUBJECT_AUTHORITY = /\bC\.\d+\s+(?:establishes|requires|allows|defines|maintains|controls|governs)\b/gi;
const RETIRED_AUTHORITY_TABLE_REFERENCE = /\b(?:retired\s+Master\s+Summary|retired\s+KB(?:[_ ]Engineering)?\s+Spec|(?:Summary\s+)?C\.\d+)/i;

function explicitlyHistorical(line: string): boolean {
  const normalized = line.toLowerCase();
  return normalized.includes("retired master summary") || normalized.includes("historical seed") || normalized.includes("historical provenance");
}

export const gate: SpecLintGate = {
  id: "retired_summary_current_authority_absent",
  sourcePhase: "v7.1.1 retired Master Summary authority sweep",
  rowClass: "content_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.1.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    const lines = ctx.masterSpec.text.split(/\r?\n/);
    const activeStart = lines.findIndex((line) => /^# 1\\?\. Product Overview/.test(line));
    if (activeStart < 0) {
      return [{ file: ctx.masterSpec.path, line: 1, matched_text: "# 1. Product Overview", message: "Active Master Spec body start was not found." }];
    }

    let authoritativeSourceColumn = -1;
    lines.slice(activeStart).forEach((line, offset) => {
      const lineNumber = activeStart + offset + 1;
      const nextLine = lines[activeStart + offset + 1] ?? "";
      const cells = line.startsWith("|") ? line.split("|").slice(1, -1).map((cell) => cell.trim()) : [];
      if (line.startsWith("|") && /^\|\s*:?-{2,}/.test(nextLine)) {
        authoritativeSourceColumn = cells.findIndex((cell) => cell.toLowerCase() === "authoritative source");
        return;
      }
      if (!line.trim() || /^#{1,6}\s/.test(line)) authoritativeSourceColumn = -1;
      const authorityCell = authoritativeSourceColumn >= 0 ? cells[authoritativeSourceColumn] ?? "" : "";
      if (authorityCell && RETIRED_AUTHORITY_TABLE_REFERENCE.test(authorityCell)) {
        findings.push({
          file: ctx.masterSpec.path,
          line: lineNumber,
          matched_text: authorityCell,
          message: "An Authoritative Source table cannot name retired Summary, C-number, or retired KB material; cite the current Master Spec home and keep history outside the authority cell.",
        });
      }
      if (explicitlyHistorical(line)) return;
      const matches = [
        ...line.matchAll(PREFIXED_RETIRED_REFERENCE),
        ...line.matchAll(BARE_AUTHORITY_REFERENCE),
        ...line.matchAll(BARE_SUBJECT_AUTHORITY),
      ];
      for (const match of matches) {
        findings.push({
          file: ctx.masterSpec.path,
          line: lineNumber,
          matched_text: match[0],
          message: "Retired Master Summary material is cited as current authority; cite a current Master Spec home and keep the legacy label only as explicit history.",
        });
      }
    });

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
