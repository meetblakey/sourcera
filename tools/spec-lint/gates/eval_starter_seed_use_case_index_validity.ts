/**
 * Gate: `eval_starter_seed_use_case_index_validity`
 *
 * Assertion: EvalStarter seed mapping is canonical on
 * `requirements[].use_case_index`; the retired `use_cases[].requirement_indices`
 * mapping must not reappear.
 */

import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, rowByField } from "./marketplace_entity_gate_helpers.js";

const GATE_ID = "eval_starter_seed_use_case_index_validity";

function push(findings: Finding[], doc: SpecDoc, line: number, matchedText: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matchedText,
    message,
  });
}

function sectionText(doc: SpecDoc, anchor: string): { text: string; line: number } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return { text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"), line: section.startLine };
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "14.7",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const useCases = rowByField(doc, "4.5.9-eval-starter", "use_cases");
    const requirements = rowByField(doc, "4.5.9-eval-starter", "requirements");
    if (!useCases) {
      push(findings, doc, 0, "use_cases", "§4.5.9 EvalStarter is missing `use_cases` field row.");
    } else if (useCases.cells.join(" | ").includes("requirement_indices")) {
      push(findings, doc, useCases.line, "requirement_indices", "`use_cases[].requirement_indices` is retired; use `requirements[].use_case_index`.");
    }
    if (!requirements) {
      push(findings, doc, 0, "requirements", "§4.5.9 EvalStarter is missing `requirements` field row.");
    } else {
      const text = requirements.cells.join(" | ");
      for (const token of ["use_case_index", "0 <= use_case_index < use_cases.length"]) {
        if (!text.includes(token)) {
          push(findings, doc, requirements.line, token, `EvalStarter.requirements row is missing use-case index token: ${token}`);
        }
      }
    }

    for (const anchor of ["4.5.9-eval-starter", "13.12.4-materialization-and-plan-tier-truncation"]) {
      const section = sectionText(doc, anchor);
      if (!section) {
        push(findings, doc, 0, anchor, `Required EvalStarter section ${anchor} is missing.`);
        continue;
      }
      if (!section.text.includes("requirements[].use_case_index")) {
        push(findings, doc, section.line, "requirements[].use_case_index", `${anchor} must cite canonical seed mapping requirements[].use_case_index.`);
      }
      if (anchor === "13.12.4-materialization-and-plan-tier-truncation" && section.text.includes("requirement_indices")) {
        push(findings, doc, section.line, "requirement_indices", `${anchor} must not reintroduce retired use_cases[].requirement_indices mapping.`);
      }
    }

    findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
