/**
 * Gate: `eval_starter_seed_schema_currency`
 *
 * Assertion: §4.5.9 binds active EvalStarter seed rows to the current Appendix J
 * seed schema versions and keeps the deploy-time validator explicit.
 */

import { anchorForLine } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, rowByField } from "./marketplace_entity_gate_helpers.js";

const GATE_ID = "eval_starter_seed_schema_currency";

function push(findings: Finding[], doc: SpecDoc, line: number, matchedText: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matchedText,
    message,
  });
}

function lineFor(doc: SpecDoc, token: string): number {
  for (let line = 1; line < doc.lines.length; line++) {
    if ((doc.lines[line] ?? "").includes(token)) return line;
  }
  return 0;
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
    const row = rowByField(doc, "4.5.9-eval-starter", "seed_schema_version");
    if (!row) {
      push(findings, doc, lineFor(doc, "seed_schema_version"), "seed_schema_version", "§4.5.9 EvalStarter is missing `seed_schema_version` field row.");
    } else {
      const text = row.cells.join(" | ");
      for (const token of [
        "current code-side schema version resolves to Appendix J",
        "`eval_starter_use_case_seed_schema_version`",
        "`eval_starter_requirement_seed_schema_version`",
        "Future divergence requires splitting this field before deploy",
      ]) {
        if (!text.includes(token)) {
          push(findings, doc, row.line, token, `EvalStarter.seed_schema_version row is missing schema-currency token: ${token}`);
        }
      }
    }

    for (const token of [
      "### `eval_starter_use_case_seed_schema_version`",
      "### `eval_starter_requirement_seed_schema_version`",
      "Integer; current value `1`",
      "Deploy-time validator `eval_starter_seed_schema_currency` MUST assert",
    ]) {
      if (!doc.text.includes(token)) {
        push(findings, doc, lineFor(doc, token), token, `EvalStarter schema-currency contract is missing token: ${token}`);
      }
    }

    findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
