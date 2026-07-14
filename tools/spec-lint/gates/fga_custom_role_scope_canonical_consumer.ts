/**
 * Gate: `fga_custom_role_scope_canonical_consumer`
 *
 * Assertion: every current Sourcera RBAC role enum value has exactly one
 * §5.13.1 WorkOS FGA scope binding, and every binding uses Appendix J
 * `fga_custom_role_scope_type` values. The only allowed non-FGA role is the
 * synthetic anonymous `marketplace_public_reader`.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  computeSectionRanges,
  parseTableAt,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings } from "./enterprise_security_gate_helpers.js";

const EXPECTED_FGA_SCOPES = new Set(["organization", "workspace", "bid_workspace", "marketplace", "platform"]);
const ANONYMOUS_ROLE = "marketplace_public_reader";

function codeTokens(value: string): string[] {
  const out: string[] = [];
  const re = /`([^`]+)`/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(value)) !== null) out.push(match[1]);
  return out;
}

function isRoleToken(value: string): boolean {
  return /^[a-z][a-z0-9_]*$/.test(value) || value === "ops_*";
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

function appendixJRange(doc: SpecDoc) {
  return computeSectionRanges(doc).find((range) => /^Appendix J:/.test(range.heading.title)) ?? null;
}

function findHeadingRange(doc: SpecDoc, titlePattern: RegExp) {
  return computeSectionRanges(doc).find((range) => titlePattern.test(range.heading.title)) ?? null;
}

function extractHeadingCodeValues(doc: SpecDoc, headingPattern: RegExp): { values: Set<string>; line: number } {
  const range = findHeadingRange(doc, headingPattern);
  if (!range) return { values: new Set(), line: 0 };
  const values = new Set<string>();
  for (let line = range.startLine + 1; line <= range.endLine; line += 1) {
    const raw = doc.lines[line] ?? "";
    if (/^#{1,6}\s+/.test(raw)) break;
    for (const token of codeTokens(raw)) {
      if (isRoleToken(token) && token !== "ops_*") values.add(token);
    }
    if (values.size > 0) return { values, line };
  }
  return { values, line: range.startLine };
}

function extractInlineEnumValues(doc: SpecDoc, enumName: string): { values: Set<string>; line: number } {
  const range = appendixJRange(doc);
  if (!range) return { values: new Set(), line: 0 };

  for (let line = range.startLine; line <= range.endLine; line += 1) {
    const raw = doc.lines[line] ?? "";
    if (!raw.includes(`\`${enumName}\``)) continue;

    const values = new Set<string>();
    if (enumName !== "fga_custom_role_scope_type") {
      for (const token of codeTokens(raw)) {
        if (token !== enumName && isRoleToken(token) && token !== "ops_*") values.add(token);
      }
      return { values, line };
    }

    for (let cursor = line; cursor <= Math.min(range.endLine, line + 12); cursor += 1) {
      const current = doc.lines[cursor] ?? "";
      if (cursor > line && /^#{1,6}\s+/.test(current)) break;
      if (cursor > line && current.startsWith("**`") && current.includes(" enum")) break;
      for (const token of codeTokens(current)) {
        if (token !== enumName && isRoleToken(token) && token !== "ops_*") values.add(token);
      }
    }
    return { values, line };
  }

  return { values: new Set(), line: range.startLine };
}

function extractFgaScopeValues(doc: SpecDoc): { values: Set<string>; line: number } {
  const inline = extractInlineEnumValues(doc, "fga_custom_role_scope_type");
  return {
    values: new Set([...inline.values].filter((value) => EXPECTED_FGA_SCOPES.has(value))),
    line: inline.line,
  };
}

function expectedRoles(doc: SpecDoc): { values: Set<string>; sources: Map<string, number> } {
  const groups = [
    extractHeadingCodeValues(doc, /^Global Organization Roles$/),
    extractHeadingCodeValues(doc, /^Workspace Roles$/),
    extractInlineEnumValues(doc, "seller_workspace_role"),
    extractInlineEnumValues(doc, "marketplace_role"),
    extractInlineEnumValues(doc, "ops_console_role"),
  ];
  const values = new Set<string>();
  const sources = new Map<string, number>();
  for (const group of groups) {
    for (const value of group.values) {
      values.add(value);
      if (!sources.has(value)) sources.set(value, group.line);
    }
  }
  return { values, sources };
}

function parseScope(scopeCell: string): "none" | string | null {
  if (/none\s*[—-]\s*anonymous/i.test(scopeCell)) return "none";
  for (const token of codeTokens(scopeCell)) {
    if (EXPECTED_FGA_SCOPES.has(token)) return token;
  }
  if (/\bplatform-wide\b/i.test(scopeCell)) return "platform-wide";
  return null;
}

export const gate: SpecLintGate = {
  id: "fga_custom_role_scope_canonical_consumer",
  sourcePhase: "3V+",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const fgaScopes = extractFgaScopeValues(doc);
    for (const scope of EXPECTED_FGA_SCOPES) {
      if (!fgaScopes.values.has(scope)) {
        push(findings, doc, fgaScopes.line, scope, `Appendix J fga_custom_role_scope_type is missing required value \`${scope}\`.`);
      }
    }
    for (const scope of fgaScopes.values) {
      if (!EXPECTED_FGA_SCOPES.has(scope)) {
        push(findings, doc, fgaScopes.line, scope, `Appendix J fga_custom_role_scope_type has non-canonical value \`${scope}\`.`);
      }
    }

    const expected = expectedRoles(doc);
    if (expected.values.size === 0) {
      push(findings, doc, 0, "role enums", "No Appendix J role enum values were parsed.");
    }

    const mappingRange = findHeadingRange(doc, /^5\.13\.1 FGA Custom Role/);
    if (!mappingRange) {
      push(findings, doc, 0, "5.13.1", "§5.13.1 FGA Custom Role mapping section is missing.");
      return findings;
    }

    const table = parseTableAt(doc, mappingRange.startLine, mappingRange.endLine);
    if (!table.header) {
      push(findings, doc, mappingRange.startLine, "FGA mapping table", "§5.13.1 FGA mapping table is missing.");
      return findings;
    }

    const mapped = new Map<string, { scope: string; line: number }>();
    const exemptAnonymous = new Set<string>();

    for (const row of table.rows) {
      const roleCell = row.cells[0] ?? "";
      const scopeCell = row.cells[1] ?? "";
      const scope = parseScope(scopeCell);
      const roles = codeTokens(roleCell).filter(isRoleToken);

      if (roles.includes("ops_*")) {
        if (scope !== "platform") {
          push(findings, doc, row.line, scopeCell, "§5.13.1 ops_* mapping must use Appendix J scope `platform`, not prose-only platform wording.");
        }
        for (const role of [...expected.values].filter((value) => value.startsWith("ops_"))) {
          mapped.set(role, { scope: "platform", line: row.line });
        }
        continue;
      }

      if (!scope) {
        push(findings, doc, row.line, scopeCell, "§5.13.1 FGA mapping row has no parseable scope.");
        continue;
      }

      if (scope !== "none" && !EXPECTED_FGA_SCOPES.has(scope)) {
        push(findings, doc, row.line, scopeCell, `§5.13.1 FGA mapping row uses non-Appendix-J scope \`${scope}\`.`);
      }

      for (const role of roles) {
        if (role === ANONYMOUS_ROLE) {
          if (scope !== "none") {
            push(findings, doc, row.line, role, "`marketplace_public_reader` must remain explicitly anonymous / non-FGA.");
          }
          exemptAnonymous.add(role);
          continue;
        }
        if (!expected.values.has(role)) {
          push(findings, doc, row.line, role, `§5.13.1 maps role \`${role}\`, but no current Appendix J role enum declares it.`);
          continue;
        }
        const prior = mapped.get(role);
        if (prior) {
          push(findings, doc, row.line, role, `§5.13.1 maps role \`${role}\` more than once (${prior.scope} at line ${prior.line}, ${scope} here).`);
          continue;
        }
        mapped.set(role, { scope, line: row.line });
      }
    }

    for (const role of expected.values) {
      if (role === ANONYMOUS_ROLE) {
        if (!exemptAnonymous.has(role)) {
          push(findings, doc, expected.sources.get(role) ?? 0, role, "`marketplace_public_reader` must be explicitly mapped as anonymous / non-FGA in §5.13.1.");
        }
        continue;
      }
      if (!mapped.has(role)) {
        push(findings, doc, expected.sources.get(role) ?? 0, role, `Appendix J role \`${role}\` has no §5.13.1 FGA scope mapping.`);
      }
    }

    findings.push(...m5RuntimeActiveFindings(doc, "fga_custom_role_scope_canonical_consumer"));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
