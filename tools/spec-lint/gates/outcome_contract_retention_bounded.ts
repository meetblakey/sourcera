/**
 * Gate: `outcome_contract_retention_bounded`
 *
 * Assertion: OutcomeContract retention is bounded in §6.8.5 row #9 and the
 * dedicated §40.2 OutcomeContract row. `Life-of-platform` must not be used for
 * OutcomeContract retention.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, parseTableAt, type TableRow } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const REQUIRED_BOUND_RE =
  /Active version \+ 7 years; superseded versions retained until the youngest dependent AIOperation expires retention, then \+7 years/i;

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function strip(cell: string): string {
  return cell.replace(/[*`]/g, "").trim();
}

function findTableRow(rows: TableRow[], predicate: (cells: string[]) => boolean): TableRow | null {
  return rows.find((row) => predicate(row.cells.map(strip))) ?? null;
}

export const gate: SpecLintGate = {
  id: "outcome_contract_retention_bounded",
  sourcePhase: "3V",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_gdpr_art_17",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (let line = 1; line < doc.lines.length; line++) {
      const text = doc.lines[line] ?? "";
      if (!/OutcomeContract/i.test(text)) continue;
      if (!/\blife[- ]of[- ]platform\b/i.test(text)) continue;
      push(findings, doc, line, "OutcomeContract / life-of-platform", "OutcomeContract retention must be bounded; `Life-of-platform` is forbidden for OutcomeContract.");
    }

    const retained = findSectionByAnchor(doc, "6.8.5-audit-integrity-exemption");
    if (!retained) {
      push(findings, doc, 0, "§6.8.5", "§6.8.5 retained-row section is missing.");
    } else {
      const table = parseTableAt(doc, retained.startLine, retained.endLine);
      const row = findTableRow(table.rows, (cells) => cells[0] === "9" && /OutcomeContract/.test(cells[1] ?? ""));
      if (!row) {
        push(findings, doc, retained.startLine, "OutcomeContract row #9", "§6.8.5 must contain retained-row class #9 for OutcomeContract.");
      } else {
        const retentionWindow = strip(row.cells[3] ?? "");
        const redactionTreatment = strip(row.cells[4] ?? "");
        if (!REQUIRED_BOUND_RE.test(retentionWindow)) {
          push(findings, doc, row.line, retentionWindow, "§6.8.5 OutcomeContract row #9 must use the bounded active/superseded-version retention window.");
        }
        if (!/authored_by.*supersession \+ 90 days/i.test(redactionTreatment)) {
          push(findings, doc, row.line, redactionTreatment, "§6.8.5 OutcomeContract row #9 must preserve the authored_by supersession pseudonymization rule.");
        }
      }
    }

    const retention = findSectionByAnchor(doc, "40.2-data-retention-and-deletion");
    if (!retention) {
      push(findings, doc, 0, "§40.2", "§40.2 retention section is missing.");
    } else {
      const table = parseTableAt(doc, retention.startLine, retention.endLine);
      const row = findTableRow(table.rows, (cells) => /^OutcomeContract \(§4\.8\.4\)/.test(cells[0] ?? ""));
      if (!row) {
        push(findings, doc, retention.startLine, "OutcomeContract (§4.8.4)", "§40.2 must contain a dedicated OutcomeContract retention row.");
      } else {
        const body = strip(row.cells[1] ?? "");
        if (!REQUIRED_BOUND_RE.test(body)) {
          push(findings, doc, row.line, body, "§40.2 OutcomeContract row must use the bounded active/superseded-version retention window.");
        }
        if (!/per §6\.8\.5 row 9/i.test(body)) {
          push(findings, doc, row.line, body, "§40.2 OutcomeContract row must cite §6.8.5 row 9.");
        }
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
