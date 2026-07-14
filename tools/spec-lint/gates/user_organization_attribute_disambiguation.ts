/**
 * Gate: `user_organization_attribute_disambiguation`
 *
 * Assertion: WorkOS `User.organization_attribute` is an internal department /
 * org-unit string, not Sourcera `OrgMembership.org_id`.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  findSectionByTitle,
  parseTableAt,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

function clean(value: string): string {
  return value.replace(/[*`]/g, "").replace(/\s+/g, " ").trim();
}

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function isAllowedDisambiguation(line: string): boolean {
  return /not to be confused|internal department|organizational unit|org-unit|WorkOS Predefined Attribute/i.test(line);
}

function isHistoricalOrGateRow(line: string): boolean {
  return /Phase 3V\+|user_organization_attribute_disambiguation|CI gate|defect|remediation/i.test(line);
}

export const gate: SpecLintGate = {
  id: "user_organization_attribute_disambiguation",
  sourcePhase: "3V+",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const userSection = findSectionByTitle(doc, /^4\.2\.3 User \(Global\)$/);
    if (!userSection) {
      push(findings, doc, 0, "§4.2.3", "§4.2.3 User section is missing.");
      return findings;
    }
    const table = parseTableAt(doc, userSection.startLine, userSection.endLine);
    const attrRow = table.rows.find((row) => clean(row.cells[0] ?? "") === "organization_attribute");
    if (!attrRow) {
      push(findings, doc, userSection.startLine, "organization_attribute", "§4.2.3 User field table must define `organization_attribute`.");
    } else {
      const notes = clean(attrRow.cells[3] ?? "");
      if (!/WorkOS Predefined Attribute/i.test(notes)) {
        push(findings, doc, attrRow.line, "organization_attribute", "`User.organization_attribute` must be labeled as a WorkOS Predefined Attribute.");
      }
      if (!/not to be confused with Sourcera Organization .*org_id/i.test(notes)) {
        push(findings, doc, attrRow.line, "organization_attribute", "`User.organization_attribute` must explicitly say it is not Sourcera Organization `org_id`.");
      }
      if (!/department|organizational unit|org-unit/i.test(notes)) {
        push(findings, doc, attrRow.line, "organization_attribute", "`User.organization_attribute` must describe a department / org-unit value, not tenant membership.");
      }
    }

    for (let line = 1; line < doc.lines.length; line++) {
      const raw = doc.lines[line] ?? "";
      if (!/organization_attribute/.test(raw)) continue;
      if (isHistoricalOrGateRow(raw) || isAllowedDisambiguation(raw)) continue;
      if (/OrgMembership\.org_id|Organization\s*\(`org_id`\)|Sourcera Organization|tenant|membership FK|Organization ID/i.test(raw)) {
        push(
          findings,
          doc,
          line,
          "organization_attribute",
          "Active prose appears to conflate `User.organization_attribute` with Sourcera organization membership; keep it as WorkOS department/org-unit metadata and use `OrgMembership.org_id` for tenant membership.",
        );
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
