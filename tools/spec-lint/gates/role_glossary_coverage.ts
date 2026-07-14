/**
 * Gate: `role_glossary_coverage`
 *
 * Assertion: Appendix J role enums resolve to Appendix K glossary entries with
 * scope, canonical enum value, §5 / §5.11 references, and retired-alias coverage.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, computeSectionRanges } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

interface RoleEnumSpec {
  enumName: string;
  sectionRef: string;
  values: readonly string[];
}

const ROLE_ENUMS: RoleEnumSpec[] = [
  {
    enumName: "workspace_role_kind",
    sectionRef: "§5.3",
    values: ["workspace_owner", "workspace_admin", "use_case_lead", "reviewer", "guest"],
  },
  {
    enumName: "seller_workspace_role",
    sectionRef: "§5.5",
    values: [
      "seller_org_owner",
      "seller_org_admin",
      "seller_billing_admin",
      "seller_marketing_editor",
      "seller_kb_admin",
      "seller_kb_editor",
      "seller_kb_viewer",
      "seller_bid_captain",
      "seller_bid_contributor",
      "seller_compliance_officer",
      "seller_integrations_admin",
      "seller_guest",
    ],
  },
  {
    enumName: "marketplace_role",
    sectionRef: "§5.6",
    values: ["marketplace_publisher", "marketplace_viewer", "marketplace_public_reader"],
  },
];

const RETIRED_ALIASES = [
  { alias: "Evaluation Lead", canonical: "workspace_admin", enumName: "workspace_role_kind", sectionRef: "§5.3" },
  { alias: "Evaluator", canonical: "use_case_lead", enumName: "workspace_role_kind", sectionRef: "§5.3" },
  { alias: "Scorer", canonical: "reviewer", enumName: "workspace_role_kind", sectionRef: "§5.3" },
  { alias: "Bid Owner", canonical: "seller_bid_captain", enumName: "seller_workspace_role", sectionRef: "§5.5" },
  { alias: "Bid Contributor", canonical: "seller_bid_contributor", enumName: "seller_workspace_role", sectionRef: "§5.5" },
  { alias: "Bid Viewer", canonical: "seller_kb_viewer", enumName: "seller_workspace_role", sectionRef: "§5.5" },
] as const;

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/role_glossary_coverage.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "Appendix K role glossary entry",
  "§5 / §5.11 cross-reference",
  "retired pre-V3 aliases",
];

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function appendixKRange(doc: SpecDoc) {
  return computeSectionRanges(doc).find((range) => /^Appendix K:/.test(range.heading.title)) ?? null;
}

function lineInAppendixK(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  const range = appendixKRange(doc);
  if (!range) return null;
  for (let line = range.startLine; line <= range.endLine; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function hasScope(text: string): boolean {
  return /\b(?:Workspace-scoped|Workspace-specific|Org-scoped|Bid-Workspace-scoped|Seller-Org-scoped|Authenticated buyer-Org|Synthetic unauthenticated|Marketplace role|scope is bounded)\b/i.test(text);
}

function requireToken(findings: Finding[], doc: SpecDoc, text: string, line: number, label: string, token: string) {
  if (!text.includes(token)) push(findings, doc, line, token, `${label} is missing required role-glossary token: ${token}`);
}

function roleFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  if (!appendixKRange(doc)) {
    push(findings, doc, 0, "Appendix K", "Appendix K glossary section is missing.");
    return findings;
  }

  for (const spec of ROLE_ENUMS) {
    for (const value of spec.values) {
      const entry = lineInAppendixK(doc, (line) => line.includes(`(\`${value}\`)`));
      if (!entry) {
        push(findings, doc, 0, value, `Appendix K is missing a role glossary entry for ${spec.enumName} value \`${value}\`.`);
        continue;
      }
      if (!hasScope(entry.text)) {
        push(findings, doc, entry.line, entry.text.trim(), `Appendix K role entry for \`${value}\` must state scope.`);
      }
      requireToken(findings, doc, entry.text, entry.line, `Appendix K role entry for \`${value}\``, spec.sectionRef);
      requireToken(findings, doc, entry.text, entry.line, `Appendix K role entry for \`${value}\``, "§5.11");
      requireToken(findings, doc, entry.text, entry.line, `Appendix K role entry for \`${value}\``, `Appendix J \`${spec.enumName}\``);
    }
  }

  return findings;
}

function aliasFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const alias of RETIRED_ALIASES) {
    const entry = lineInAppendixK(doc, (line) => line.startsWith(`**${alias.alias} (retired alias).**`));
    if (!entry) {
      push(findings, doc, 0, alias.alias, `Appendix K is missing retired-alias entry for ${alias.alias}.`);
      continue;
    }
    for (const token of ["Retired", alias.canonical, alias.sectionRef, `Appendix J \`${alias.enumName}\``]) {
      requireToken(findings, doc, entry.text, entry.line, `Appendix K retired-alias entry for ${alias.alias}`, token);
    }
  }
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `role_glossary_coverage` |"));
  if (!row) {
    push(findings, doc, 0, "`role_glossary_coverage`", "§M.5 row role_glossary_coverage is missing.");
    return findings;
  }
  for (const token of M5_TOKENS) {
    requireToken(findings, doc, row.text, row.line, "§M.5 role_glossary_coverage row", token);
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "role_glossary_coverage",
  sourcePhase: "Phase 3.1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...roleFindings(doc),
      ...aliasFindings(doc),
      ...m5Findings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
