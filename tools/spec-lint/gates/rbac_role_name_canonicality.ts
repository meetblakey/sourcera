/**
 * Gate: `rbac_role_name_canonicality`
 *
 * Assertion: §5.3 / §5.5 / §5.6 role table labels are canonical Appendix J
 * enum values, not retired Title-Case aliases.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  computeSectionRanges,
  findSectionByAnchor,
  parseTableAt,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

interface RoleTableSpec {
  sectionAnchor: string;
  sectionLabel: string;
  enumName: string;
  enumSource: "workspace_heading" | "inline_enum";
}

const ROLE_TABLES: RoleTableSpec[] = [
  {
    sectionAnchor: "5.3-console-level-roles-(buyer-console)",
    sectionLabel: "§5.3",
    enumName: "workspace_role_kind",
    enumSource: "workspace_heading",
  },
  {
    sectionAnchor: "5.5-console-level-roles-(seller-console)",
    sectionLabel: "§5.5",
    enumName: "seller_workspace_role",
    enumSource: "inline_enum",
  },
  {
    sectionAnchor: "5.6-marketplace-roles",
    sectionLabel: "§5.6",
    enumName: "marketplace_role",
    enumSource: "inline_enum",
  },
];

function stripMd(value: string): string {
  return value.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function codeTokens(value: string): string[] {
  const out: string[] = [];
  const re = /`([^`]+)`/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(value)) !== null) out.push(match[1]);
  return out;
}

function roleLabel(value: string): string {
  return codeTokens(value)[0] ?? stripMd(value);
}

function isCanonicalRoleValue(value: string): boolean {
  return /^[a-z][a-z0-9_]*$/.test(value);
}

function appendixJRange(doc: SpecDoc) {
  return computeSectionRanges(doc).find((range) => /^Appendix J:/.test(range.heading.title)) ?? null;
}

function extractWorkspaceRoleValues(doc: SpecDoc): { values: Set<string>; line: number } {
  const range = appendixJRange(doc);
  if (!range) return { values: new Set(), line: 0 };

  for (let line = range.startLine; line <= range.endLine; line++) {
    if (/^### Workspace Roles\b/.test(doc.lines[line] ?? "")) {
      const values = new Set<string>();
      for (let cursor = line + 1; cursor <= range.endLine; cursor++) {
        const raw = doc.lines[cursor] ?? "";
        if (/^#{1,6}\s+/.test(raw)) break;
        for (const token of codeTokens(raw)) {
          if (isCanonicalRoleValue(token)) values.add(token);
        }
        if (values.size > 0) return { values, line: cursor };
      }
      return { values, line };
    }
  }

  return { values: new Set(), line: range.startLine };
}

function extractInlineEnumValues(doc: SpecDoc, enumName: string): { values: Set<string>; line: number } {
  const range = appendixJRange(doc);
  if (!range) return { values: new Set(), line: 0 };

  for (let line = range.startLine; line <= range.endLine; line++) {
    const raw = doc.lines[line] ?? "";
    if (!raw.includes(`\`${enumName}\``)) continue;
    const values = new Set<string>();
    for (const token of codeTokens(raw)) {
      if (token !== enumName && isCanonicalRoleValue(token)) values.add(token);
    }
    return { values, line };
  }

  return { values: new Set(), line: range.startLine };
}

function enumValues(doc: SpecDoc, spec: RoleTableSpec): { values: Set<string>; line: number } {
  return spec.enumSource === "workspace_heading"
    ? extractWorkspaceRoleValues(doc)
    : extractInlineEnumValues(doc, spec.enumName);
}

export const gate: SpecLintGate = {
  id: "rbac_role_name_canonicality",
  sourcePhase: "3V",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (const spec of ROLE_TABLES) {
      const registry = enumValues(doc, spec);
      if (registry.values.size === 0) {
        findings.push({
          file: doc.path,
          line: registry.line,
          matched_text: spec.enumName,
          message: `Appendix J ${spec.enumName} has no parseable canonical role values.`,
        });
        continue;
      }

      const section = findSectionByAnchor(doc, spec.sectionAnchor);
      if (!section) {
        findings.push({
          file: doc.path,
          line: 0,
          matched_text: spec.sectionAnchor,
          message: `${spec.sectionLabel} role table section is missing.`,
        });
        continue;
      }

      const table = parseTableAt(doc, section.startLine, section.endLine);
      if (!table.header) {
        findings.push({
          file: doc.path,
          line: section.startLine,
          anchor: section.heading.anchor,
          matched_text: spec.sectionLabel,
          message: `${spec.sectionLabel} canonical role table is missing.`,
        });
        continue;
      }

      const roleIdx = table.header.cells.findIndex((cell) => stripMd(cell).toLowerCase().startsWith("role"));
      if (roleIdx < 0) {
        findings.push({
          file: doc.path,
          line: table.header.line,
          anchor: section.heading.anchor,
          matched_text: table.header.cells.join(" | "),
          message: `${spec.sectionLabel} role table must include a Role column.`,
        });
        continue;
      }

      const seen = new Map<string, number>();
      for (const row of table.rows) {
        const label = roleLabel(row.cells[roleIdx] ?? "");
        if (!isCanonicalRoleValue(label)) {
          findings.push({
            file: doc.path,
            line: row.line,
            anchor: anchorForLine(doc, row.line),
            matched_text: row.cells[roleIdx] ?? "",
            message: `${spec.sectionLabel} role label must be lowercase snake_case; found ${JSON.stringify(label)}.`,
          });
          continue;
        }
        if (!registry.values.has(label)) {
          findings.push({
            file: doc.path,
            line: row.line,
            anchor: anchorForLine(doc, row.line),
            matched_text: label,
            message: `${spec.sectionLabel} role label \`${label}\` is not registered in Appendix J ${spec.enumName}.`,
          });
        }
        seen.set(label, row.line);
      }

      for (const value of registry.values) {
        if (!seen.has(value)) {
          findings.push({
            file: doc.path,
            line: registry.line,
            anchor: anchorForLine(doc, registry.line),
            matched_text: value,
            message: `${spec.sectionLabel} role table is missing Appendix J ${spec.enumName} value \`${value}\`.`,
          });
        }
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
