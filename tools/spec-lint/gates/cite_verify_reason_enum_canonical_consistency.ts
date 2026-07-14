/**
 * Gate: `cite_verify_reason_enum_canonical_consistency`
 *
 * Assertion: Appendix J `cite_verify_reason` is the only live reason
 * vocabulary for `cite_verify` tool results, Appendix G mirrors, and
 * orchestrator submission-gate payloads.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const CANONICAL_REASONS = [
  "ok",
  "entry_not_found",
  "offsets_out_of_bounds",
  "excerpt_mismatch",
  "stale",
  "entry_archived",
  "unauthorized_namespace",
] as const;

const RETIRED_REASONS = [
  "entry_modified_after_offset_capture",
  "offsets_out_of_range",
  "excerpt_does_not_match",
  "entry_flagged_stale",
] as const;

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/cite_verify_reason_enum_canonical_consistency.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "Appendix J `cite_verify_reason` is the sole allowed reason vocabulary",
  "§22.8.4.7 `cite_verify`, §22.16.1 server-side semantics, Appendix G `cite_verify_failed`, and orchestrator submission-gate payloads",
];

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function sectionTextByAnchor(doc: SpecDoc, anchor: string, label: string, findings: Finding[]) {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) {
    push(findings, doc, 0, anchor, `${label} section is missing.`);
    return null;
  }
  return {
    line: section.startLine,
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
  };
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean) {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { line, text };
  }
  return null;
}

function requireToken(
  findings: Finding[],
  doc: SpecDoc,
  text: string,
  line: number,
  label: string,
  token: string,
) {
  if (!text.includes(token)) push(findings, doc, line, token, `${label} is missing required cite-verify reason binding: ${token}`);
}

function canonicalReasonFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const citeSection = sectionTextByAnchor(doc, "22.8.4.7-cite_verify", "§22.8.4.7 cite_verify", findings);
  if (citeSection) {
    requireToken(findings, doc, citeSection.text, citeSection.line, "§22.8.4.7 cite_verify", "\"reason\": \"ok\"");
    requireToken(
      findings,
      doc,
      citeSection.text,
      citeSection.line,
      "§22.8.4.7 cite_verify",
      "\"reason\": \"entry_not_found | offsets_out_of_bounds | excerpt_mismatch | stale | entry_archived | unauthorized_namespace\"",
    );
    requireToken(
      findings,
      doc,
      citeSection.text,
      citeSection.line,
      "§22.8.4.7 cite_verify",
      "`reason` is always a value from Appendix J `cite_verify_reason`; success returns `ok`.",
    );
    retiredReasonFindings(findings, doc, citeSection.text, citeSection.line, "§22.8.4.7 cite_verify");
  }

  const appendixSection = findSectionByTitle(doc, "Cite Verify Reason");
  if (!appendixSection) {
    push(findings, doc, 0, "Cite Verify Reason", "Appendix J Cite Verify Reason section is missing.");
  } else {
    const text = doc.lines.slice(appendixSection.startLine, appendixSection.endLine + 1).join("\n");
    const expected = CANONICAL_REASONS.map((reason) => `\`${reason}\``).join(", ");
    requireToken(findings, doc, text, appendixSection.startLine, "Appendix J Cite Verify Reason", expected);
    requireToken(
      findings,
      doc,
      text,
      appendixSection.startLine,
      "Appendix J Cite Verify Reason",
      "§22.8.4.7, §22.16.1, Appendix G `cite_verify_failed`, and any tool-result or orchestrator-submission-gate payload MUST use these values verbatim.",
    );
    retiredReasonFindings(findings, doc, text, appendixSection.startLine, "Appendix J Cite Verify Reason");
  }

  const appendixGLine = findLine(doc, (line) => line.includes("| `cite_verify_failed` |"));
  if (!appendixGLine) {
    push(findings, doc, 0, "`cite_verify_failed`", "Appendix G `cite_verify_failed` row is missing.");
  } else {
    requireToken(
      findings,
      doc,
      appendixGLine.text,
      appendixGLine.line,
      "Appendix G cite_verify_failed row",
      "`reason` (per Appendix J `cite_verify_reason`)",
    );
    retiredReasonFindings(findings, doc, appendixGLine.text, appendixGLine.line, "Appendix G cite_verify_failed row");
  }

  return findings;
}

function retiredReasonFindings(
  findings: Finding[],
  doc: SpecDoc,
  text: string,
  startLine: number,
  label: string,
) {
  const lines = text.split("\n");
  for (let offset = 0; offset < lines.length; offset++) {
    const lineText = lines[offset] ?? "";
    const line = startLine + offset;
    for (const retired of RETIRED_REASONS) {
      if (lineText.includes(retired)) {
        push(findings, doc, line, retired, `${label} contains retired cite_verify reason \`${retired}\`.`);
      }
    }
  }
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `cite_verify_reason_enum_canonical_consistency` |"));
  if (!row) {
    push(findings, doc, 0, "`cite_verify_reason_enum_canonical_consistency`", "§M.5 row cite_verify_reason_enum_canonical_consistency is missing.");
    return findings;
  }
  for (const token of M5_TOKENS) {
    requireToken(findings, doc, row.text, row.line, "§M.5 cite_verify_reason_enum_canonical_consistency row", token);
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "cite_verify_reason_enum_canonical_consistency",
  sourcePhase: "KB18",
  rowClass: "enum_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [...canonicalReasonFindings(ctx.masterSpec), ...m5Findings(ctx.masterSpec)];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
