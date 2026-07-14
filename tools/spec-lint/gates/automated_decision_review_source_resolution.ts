/**
 * Gate: `automated_decision_review_source_resolution`
 *
 * Assertion: §4.6.5 DSARRequest and §6.8.11 bind Article 22 reviews to
 * source-type/source-entity identifiers, with AIOperation id as a conditional
 * bridge rather than the only reviewable source.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function findLine(doc: SpecDoc, re: RegExp, start = 1, end = doc.lines.length - 1): number {
  for (let line = start; line <= end; line++) {
    if (re.test(doc.lines[line] ?? "")) return line;
  }
  return -1;
}

function requireLineIncludes(
  findings: Finding[],
  doc: SpecDoc,
  line: number,
  matched: string,
  includes: string[],
) {
  if (line < 0) {
    push(findings, doc, 0, matched, `Missing required DSAR automated-decision binding row for ${matched}.`);
    return;
  }
  const text = doc.lines[line] ?? "";
  for (const item of includes) {
    if (!text.includes(item)) {
      push(findings, doc, line, matched, `Row for ${matched} must include \`${item}\`.`);
    }
  }
}

export const gate: SpecLintGate = {
  id: "automated_decision_review_source_resolution",
  sourcePhase: "V711-PH35",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_article_22",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const decisionIdLine = findLine(doc, /^\| `decision_id` \|/);
    requireLineIncludes(findings, doc, decisionIdLine, "decision_id", [
      "AIOperation-backed",
      "non-AIOperation",
    ]);

    const sourceTypeLine = findLine(doc, /^\| `decision_source_type` \|/);
    requireLineIncludes(findings, doc, sourceTypeLine, "decision_source_type", [
      "automated_decision_review",
      "dsar_automated_decision_source_type",
    ]);

    const sourceEntityLine = findLine(doc, /^\| `decision_source_entity_id` \|/);
    requireLineIncludes(findings, doc, sourceEntityLine, "decision_source_entity_id", [
      "automated_decision_review",
      "decision_source_type",
    ]);

    const section = findSectionByAnchor(doc, "6.8.11-automated-decision-rights");
    if (!section) {
      push(findings, doc, 0, "6.8.11", "§6.8.11 Automated-Decision Rights section is missing.");
      return findings;
    }

    const sectionText = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
    for (const required of [
      "decision_source_type",
      "decision_source_entity_id",
      "decision_id",
      "required only when the challenged decision materializes as an AIOperation row",
      "automated_decision_review_source_resolution",
    ]) {
      if (!sectionText.includes(required)) {
        push(findings, doc, section.startLine, required, `§6.8.11 must bind Article 22 review source resolution through \`${required}\`.`);
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
