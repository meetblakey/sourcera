/**
 * Gate: `entity_retention_coverage_on_diff`
 *
 * Assertion: every live §4 entity field table resolves to §40.2 Data Retention
 * by section number or entity name. Retired §4 anchors are exempt. This is the
 * current-tree form of the diff gate: if a new or renamed §4 entity lands
 * without a §40.2 coverage row/citation, the current-tree proof fails.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  computeSectionRanges,
  findSectionByAnchor,
  parseTableAt,
  type SectionRange,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings } from "./enterprise_security_gate_helpers.js";

const NON_ENTITY_TITLE_RE =
  /\b(JSON|Schema|Registry|Field Definitions|Lifecycle|State Machine|Acceptance Criteria|Endpoint Binding|Plan Limits|Residency|Retention & DSAR Cascade|Indexes|Failure Modes|Scope Isolation|API|Enum|Migration|Convention|Notes)\b/i;

interface EntitySection {
  section: string;
  title: string;
  line: number;
}

function clean(value: string): string {
  return value
    .replace(/\{#[^}]+}/g, "")
    .replace(/[*`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value: string): string {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function sectionNumber(title: string): string | null {
  return title.match(/^(4(?:\.\d+)+)\b/)?.[1] ?? null;
}

function entityTitle(title: string): string {
  return clean(title)
    .replace(/^4(?:\.\d+)+\s+/, "")
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s*[-—].*$/, "")
    .trim();
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

function hasFieldTable(doc: SpecDoc, section: SectionRange): boolean {
  for (let line = section.startLine; line <= section.endLine; line += 1) {
    const raw = doc.lines[line] ?? "";
    if (!/^\s*\|.*\|\s*$/.test(raw)) continue;
    const table = parseTableAt(doc, line, section.endLine);
    if (!table.header) continue;
    const firstHeader = normalize(table.header.cells[0] ?? "");
    if (firstHeader === "field") return true;
    line = table.rows.length ? table.rows[table.rows.length - 1].line : line;
  }
  return false;
}

function isLiveEntitySection(doc: SpecDoc, section: SectionRange): boolean {
  const number = sectionNumber(section.heading.title);
  if (!number) return false;
  if ((number.match(/\./g) ?? []).length < 2) return false;
  if (/\bretired\b/i.test(section.heading.title)) return false;
  if (NON_ENTITY_TITLE_RE.test(section.heading.title)) return false;
  return hasFieldTable(doc, section);
}

function entitySections(doc: SpecDoc): EntitySection[] {
  return computeSectionRanges(doc)
    .filter((section) => isLiveEntitySection(doc, section))
    .map((section) => ({
      section: sectionNumber(section.heading.title)!,
      title: entityTitle(section.heading.title),
      line: section.heading.line,
    }));
}

function retentionScope(doc: SpecDoc, findings: Finding[]): { text: string; normalized: string; line: number } | null {
  const section = findSectionByAnchor(doc, "40.2-data-retention-and-deletion");
  if (!section) {
    push(findings, doc, 0, "§40.2", "§40.2 Data Retention & Deletion section is missing.");
    return null;
  }
  const text = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
  return { text, normalized: normalize(text), line: section.startLine };
}

function entityCovered(entity: EntitySection, scope: { text: string; normalized: string }): boolean {
  if (scope.text.includes(`§${entity.section}`)) return true;
  if (scope.text.includes(entity.section)) return true;
  const title = normalize(entity.title);
  if (title.length >= 4 && scope.normalized.includes(title)) return true;
  return false;
}

export const gate: SpecLintGate = {
  id: "entity_retention_coverage_on_diff",
  sourcePhase: "V9",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const scope = retentionScope(doc, findings);
    if (!scope) return findings;

    for (const entity of entitySections(doc)) {
      if (!entityCovered(entity, scope)) {
        push(
          findings,
          doc,
          entity.line,
          `§${entity.section} ${entity.title}`,
          `Live §4 entity \`${entity.title}\` has no §40.2 retention coverage by section number or entity name.`,
        );
      }
    }

    findings.push(...m5RuntimeActiveFindings(doc, "entity_retention_coverage_on_diff"));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
