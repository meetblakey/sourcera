/**
 * Gate: `eval_starter_marketplace_category_mapping_present`
 *
 * Assertion: §4.5.9 defines `marketplace_category_slug` and §13.12.7 defines
 * the filtered Marketplace search path plus generic fallback.
 */

import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, rowByField } from "./marketplace_entity_gate_helpers.js";

const GATE_ID = "eval_starter_marketplace_category_mapping_present";

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
    const row = rowByField(doc, "4.5.9-eval-starter", "marketplace_category_slug");
    if (!row) {
      push(findings, doc, 0, "marketplace_category_slug", "§4.5.9 EvalStarter is missing `marketplace_category_slug` field row.");
    } else {
      const text = row.cells.join(" | ");
      for (const token of [
        "§4.5.4 Taxonomy Node",
        "`kind=marketplace_category`",
        "generic `/marketplace` search",
      ]) {
        if (!text.includes(token)) {
          push(findings, doc, row.line, token, `EvalStarter.marketplace_category_slug row is missing Marketplace fallback token: ${token}`);
        }
      }
    }

    for (const anchor of ["13.12.7-surface-what-we-filled-in-for-you", "13.12.10-acceptance-criteria"]) {
      const section = sectionText(doc, anchor);
      if (!section) {
        push(findings, doc, 0, anchor, `Required EvalStarter Marketplace fallback section ${anchor} is missing.`);
        continue;
      }
      for (const token of ["EvalStarter.marketplace_category_slug", "generic `/marketplace` search", "no vertical filter"]) {
        if (!section.text.includes(token)) {
          push(findings, doc, section.line, token, `${anchor} is missing Marketplace category fallback token: ${token}`);
        }
      }
    }

    findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
