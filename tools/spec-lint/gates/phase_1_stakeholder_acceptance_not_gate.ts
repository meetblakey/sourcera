/**
 * Gate: `phase_1_stakeholder_acceptance_not_gate`
 *
 * Assertion: Phase 1 -> Phase 2 requires stakeholder invitation, not
 * stakeholder acceptance.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const REQUIRED_TEXTS = [
  "At least 1 stakeholder invited; invitation acceptance is optional and MUST NOT block Phase 1 → Phase 2 advancement",
  "Workspace may advance when stakeholder invitations are sent even if zero invited stakeholders have accepted",
];

const FORBIDDEN_RE =
  /stakeholders?\s+(?:invited\s+and\s+confirmed|must\s+accept|required\s+to\s+accept)|acceptance\s+(?:is\s+)?required/i;

export const gate: SpecLintGate = {
  id: "phase_1_stakeholder_acceptance_not_gate",
  sourcePhase: "4.2",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const section = findSectionByAnchor(doc, "10.2-phase-1-stakeholder-alignment-and-discovery");

    if (!section) {
      return [{
        file: doc.path,
        line: 0,
        anchor: "10.2-phase-1-stakeholder-alignment-and-discovery",
        message: "§10.2 Phase 1 section is missing.",
      }];
    }

    const sectionText = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
    for (const required of REQUIRED_TEXTS) {
      if (!sectionText.includes(required)) {
        findings.push({
          file: doc.path,
          line: section.startLine,
          anchor: section.heading.anchor,
          matched_text: required,
          message: `§10.2 must state stakeholder acceptance is non-blocking: ${required}`,
        });
      }
    }

    for (let lineNo = section.startLine; lineNo <= section.endLine; lineNo++) {
      const line = doc.lines[lineNo] ?? "";
      const match = FORBIDDEN_RE.exec(line);
      if (match) {
        findings.push({
          file: doc.path,
          line: lineNo,
          anchor: anchorForLine(doc, lineNo),
          matched_text: match[0],
          message: "§10.2 must not require stakeholder acceptance/confirmation for Phase 1 advancement.",
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
