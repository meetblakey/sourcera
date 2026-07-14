/**
 * Gate: `entity_console_field_or_scope_paragraph_required`
 * Source phase: v7.2.0-REM Phase 1.2 P1 (D-1.2-004)
 *
 * Assertion: the §4.3 buyer child entities named by D-1.2-004 must either
 * declare a fixed `console` field or carry explicit buyer-console scope text
 * with the HTTP 404 non-leak rule.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

interface Binding {
  title: string;
  entity: string;
}

const BINDINGS: Binding[] = [
  { title: "4.3.2 Workspace Membership", entity: "Workspace Membership" },
  { title: "4.3.3 Use Case", entity: "Use Case" },
  { title: "4.3.4 Requirement", entity: "Requirement" },
  { title: "4.3.5 Response", entity: "Response" },
  { title: "4.3.6 Score", entity: "Score" },
  { title: "4.3.7 Intelligence Cache Entry", entity: "Intelligence Cache Entry" },
  { title: "4.3.8 Evaluation Scenario", entity: "Evaluation Scenario" },
  { title: "4.3.10 Evaluation Pulse Event", entity: "Evaluation Pulse Event" },
  { title: "4.3.13 Internal Comment Mention", entity: "Internal Comment Mention" },
];

const CONSOLE_BUYER_RE = /`console`\s*\|\s*Enum[^|\n]*\|\s*`?buyer`?\s*(?:\(fixed\)|fixed)?/i;
const SCOPE_HEADER_RE = /\*\*Scope Isolation[:.]?\*\*/i;
const BUYER_SCOPE_RE = /Buyer console only|buyer-console-only|buyer console/i;
const SELLER_404_RE = /seller-console[\s\S]{0,160}HTTP 404|HTTP 404[\s\S]{0,160}seller-console/i;

function sectionText(lines: string[], startLine: number, endLine: number): string {
  return lines.slice(startLine, endLine + 1).join("\n");
}

export const gate: SpecLintGate = {
  id: "entity_console_field_or_scope_paragraph_required",
  sourcePhase: "v7.2.0-REM Phase 1.2 P1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_console_firewall",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (const binding of BINDINGS) {
      const section = findSectionByTitle(doc, binding.title);
      if (!section) {
        findings.push({
          file: doc.path,
          line: 0,
          anchor: binding.title,
          message: `${binding.entity} section is missing; cannot verify console-scope declaration.`,
        });
        continue;
      }

      const table = parseTableAt(doc, section.startLine, section.endLine);
      const consoleRow = table.rows.find((row) => row.cells[0] === "`console`");
      const consoleFieldFixedBuyer = consoleRow
        ? CONSOLE_BUYER_RE.test(`| ${consoleRow.cells.join(" | ")} |`)
        : false;
      const text = sectionText(doc.lines, section.startLine, section.endLine);
      const hasScopeParagraph =
        SCOPE_HEADER_RE.test(text) && BUYER_SCOPE_RE.test(text) && SELLER_404_RE.test(text);

      if (!consoleFieldFixedBuyer && !hasScopeParagraph) {
        findings.push({
          file: doc.path,
          line: section.startLine,
          anchor: section.heading.anchor ?? binding.title,
          message: `${binding.entity} must declare either a fixed buyer \`console\` field or a Scope Isolation paragraph that states Buyer console ownership and seller-console HTTP 404 non-leak behavior.`,
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
