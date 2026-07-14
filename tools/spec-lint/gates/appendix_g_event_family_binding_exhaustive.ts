/**
 * Gate: `appendix_g_event_family_binding_exhaustive`
 *
 * Assertion: Appendix G, Appendix J, and §51 agree on the closed
 * `event_family` registry. Stale pre-remediation family aliases are rejected.
 */

import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { anchorForLine, findSectionByTitle, splitUnescapedPipes } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";

const EXPECTED = [
  "ai_capability",
  "workspace",
  "billing",
  "vendor",
  "seller_kb",
  "bid",
  "marketplace",
  "identity",
  "ops_surface",
  "analytics_meta",
  "system_job",
];

const STALE = [
  "workspace_core",
  "vendor_core",
  "marketplace_core",
  "kb_core",
  "bid_core",
  "billing_core",
  "onboarding_core",
  "plg_growth_loops",
  "anti_abuse_core",
  "ops_domain",
];

function stripMd(s: string): string {
  return s.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function cells(raw: string): string[] {
  return splitUnescapedPipes(raw.trim().replace(/^\|/, "").replace(/\|$/, "")).map((c) => c.trim());
}

function isDelimiter(row: string[]): boolean {
  return row.every((c) => /^:?-{2,}:?$/.test(c) || c === "");
}

function backticks(s: string): string[] {
  return [...s.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim()).filter(Boolean);
}

function valuesEqual(findings: Finding[], doc: SpecDoc, line: number, label: string, values: string[]) {
  const expected = new Set(EXPECTED);
  const observed = new Set(values);
  for (const v of values) {
    if (!expected.has(v)) {
      findings.push({
        file: doc.path,
        line,
        anchor: anchorForLine(doc, line),
        matched_text: v,
        message: `${label} contains unregistered event_family \`${v}\`.`,
      });
    }
  }
  for (const v of EXPECTED) {
    if (!observed.has(v)) {
      findings.push({
        file: doc.path,
        line,
        anchor: anchorForLine(doc, line),
        matched_text: v,
        message: `${label} is missing Appendix J event_family \`${v}\`.`,
      });
    }
  }
}

function appendixJFamilies(doc: SpecDoc, findings: Finding[]): Set<string> {
  const section = findSectionByTitle(doc, /event_family/);
  if (!section) {
    findings.push({ file: doc.path, line: 0, message: "parse_error: Appendix J event_family section not found." });
    return new Set();
  }
  for (let line = section.startLine + 1; line <= section.endLine; line++) {
    const found = backticks(doc.lines[line] ?? "");
    if (found.length >= 3) {
      valuesEqual(findings, doc, line, "Appendix J event_family enum", found);
      return new Set(found);
    }
  }
  findings.push({
    file: doc.path,
    line: section.startLine,
    anchor: section.heading.anchor,
    message: "parse_error: Appendix J event_family enum value row not found.",
  });
  return new Set();
}

function sectionFamilyTable(doc: SpecDoc, findings: Finding[]) {
  const section = findSectionByTitle(doc, /^51\.1\.1 Canonical Event Families\b/);
  if (!section) {
    findings.push({ file: doc.path, line: 0, message: "parse_error: §51.1.1 not found." });
    return;
  }
  const values: string[] = [];
  const seen = new Map<string, number>();
  let inTable = false;
  for (let line = section.startLine + 1; line <= section.endLine; line++) {
    const raw = doc.lines[line] ?? "";
    if (!/^\s*\|.*\|\s*$/.test(raw)) {
      if (inTable) break;
      continue;
    }
    const row = cells(raw);
    if (isDelimiter(row)) continue;
    const first = stripMd(row[0] ?? "");
    if (first === "Family") {
      inTable = true;
      continue;
    }
    if (!inTable || !first) continue;
    values.push(first);
    const prev = seen.get(first);
    if (prev !== undefined) {
      findings.push({
        file: doc.path,
        line,
        anchor: anchorForLine(doc, line),
        matched_text: first,
        message: `§51.1.1 duplicates event_family \`${first}\`; each Appendix J family must appear exactly once.`,
      });
    }
    seen.set(first, line);
  }
  valuesEqual(findings, doc, section.startLine, "§51.1.1 family table", values);
}

function appendixGMatrix(doc: SpecDoc, findings: Finding[]) {
  const appendixG = findSectionByTitle(doc, /^Appendix G\b/);
  if (!appendixG) {
    findings.push({ file: doc.path, line: 0, message: "parse_error: Appendix G section not found." });
    return;
  }
  let matrixLine = -1;
  for (let line = appendixG.startLine + 1; line <= appendixG.endLine; line++) {
    if ((doc.lines[line] ?? "").includes("**Event-Family Binding Matrix.")) {
      matrixLine = line;
      break;
    }
  }
  if (matrixLine < 0) {
    findings.push({
      file: doc.path,
      line: appendixG.startLine,
      anchor: appendixG.heading.anchor,
      message: "Appendix G is missing the Event-Family Binding Matrix.",
    });
    return;
  }
  const values: string[] = [];
  let inTable = false;
  for (let line = matrixLine + 1; line <= appendixG.endLine; line++) {
    const raw = doc.lines[line] ?? "";
    if (!/^\s*\|.*\|\s*$/.test(raw)) {
      if (inTable) break;
      continue;
    }
    const row = cells(raw);
    if (isDelimiter(row)) continue;
    const header = row.map((c) => stripMd(c).toLowerCase());
    if (header.includes("default event_family")) {
      inTable = true;
      continue;
    }
    if (!inTable) continue;
    const found = backticks(row[1] ?? "");
    if (found.length !== 1) {
      findings.push({
        file: doc.path,
        line,
        anchor: anchorForLine(doc, line),
        matched_text: row[1] ?? "",
        message: "Appendix G Event-Family Binding Matrix row must declare exactly one default event_family.",
      });
      continue;
    }
    values.push(found[0]);
  }
  valuesEqual(findings, doc, matrixLine, "Appendix G Event-Family Binding Matrix", values);
}

function section51CrossReferenceFamilies(doc: SpecDoc, findings: Finding[], allowed: Set<string>) {
  const section = findSectionByTitle(doc, /^51\.1\.5 Event Catalog Cross-Reference\b/);
  if (!section) {
    findings.push({ file: doc.path, line: 0, message: "parse_error: §51.1.5 not found." });
    return;
  }
  let inTable = false;
  for (let line = section.startLine + 1; line <= section.endLine; line++) {
    const raw = doc.lines[line] ?? "";
    if (!/^\s*\|.*\|\s*$/.test(raw)) {
      if (inTable) break;
      continue;
    }
    const row = cells(raw);
    if (isDelimiter(row)) continue;
    const header = row.map((c) => stripMd(c).toLowerCase());
    if (header.includes("family")) {
      inTable = true;
      continue;
    }
    if (!inTable) continue;
    const values = backticks(row[1] ?? "");
    const unique = new Set<string>();
    for (const value of values) {
      if (!allowed.has(value)) {
        findings.push({
          file: doc.path,
          line,
          anchor: anchorForLine(doc, line),
          matched_text: value,
          message: `§51.1.5 cross-reference row uses unregistered event_family \`${value}\`.`,
        });
      }
      if (unique.has(value)) {
        findings.push({
          file: doc.path,
          line,
          anchor: anchorForLine(doc, line),
          matched_text: value,
          message: `§51.1.5 cross-reference row repeats event_family \`${value}\`; use each family once per row.`,
        });
      }
      unique.add(value);
    }
  }
}

function staleAliases(doc: SpecDoc, findings: Finding[]) {
  const staleRe = new RegExp(`\\b(${STALE.join("|")})\\b`, "g");
  for (let line = 1; line < doc.lines.length; line++) {
    const raw = doc.lines[line] ?? "";
    let match: RegExpExecArray | null;
    staleRe.lastIndex = 0;
    while ((match = staleRe.exec(raw)) !== null) {
      const token = match[1];
      if (token === "ops_domain" && raw.includes("marketplace_match_score_ops_domain")) continue;
      findings.push({
        file: doc.path,
        line,
        anchor: anchorForLine(doc, line),
        matched_text: token,
        message: `Stale pre-remediation event_family alias \`${token}\` is forbidden; use Appendix J event_family values only.`,
      });
    }
  }
}

export const gate: SpecLintGate = {
  id: "appendix_g_event_family_binding_exhaustive",
  sourcePhase: "M.5.64",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const allowed = appendixJFamilies(doc, findings);
    sectionFamilyTable(doc, findings);
    appendixGMatrix(doc, findings);
    section51CrossReferenceFamilies(doc, findings, allowed);
    staleAliases(doc, findings);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
