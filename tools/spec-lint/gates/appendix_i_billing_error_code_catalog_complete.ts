/**
 * Gate: `appendix_i_billing_error_code_catalog_complete`
 *
 * Assertion: every §32.8.10-.22 endpoint error-table code resolves to an
 * Appendix I billing row with matching HTTP status and non-empty description.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  computeSectionRanges,
  parseTableAt,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

interface Section {
  heading: { title: string; anchor?: string };
  startLine: number;
  endLine: number;
}

interface RegistryRow {
  code: string;
  http: string;
  line: number;
  section: string;
  description: string;
}

interface EndpointCode {
  code: string;
  http: string;
  line: number;
  section: Section;
}

function normalizedHeader(cell: string): string {
  return cell.replace(/[*`]/g, "").trim().toLowerCase();
}

function codeToken(cell: string): string {
  return cell.match(/`([^`]+)`/)?.[1] ?? "";
}

function httpStatus(cell: string): string {
  return cell.match(/\b(\d{3})\b/)?.[1] ?? "";
}

function push(
  findings: Finding[],
  doc: SpecDoc,
  line: number,
  matched: string,
  message: string,
) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function sectionText(doc: SpecDoc, section: Section): string {
  return doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
}

function billingEndpointSections(doc: SpecDoc): Section[] {
  return computeSectionRanges(doc)
    .filter((range) => {
      const match = /^32\.8\.(\d+)\s+/.exec(range.heading.title);
      if (!match) return false;
      const n = Number(match[1]);
      return n >= 10 && n <= 22;
    })
    .map((range) => ({
      heading: range.heading,
      startLine: range.startLine,
      endLine: range.endLine,
    }));
}

function findErrorLabelLine(doc: SpecDoc, section: Section): number {
  for (let i = section.startLine; i <= section.endLine; i++) {
    if (/^\*\*(?:Errors?|Error Codes?)\.\*\*/i.test(doc.lines[i] ?? "")) return i;
  }
  return 0;
}

function endpointCodes(doc: SpecDoc, findings: Finding[]): EndpointCode[] {
  const out: EndpointCode[] = [];
  for (const section of billingEndpointSections(doc)) {
    const labelLine = findErrorLabelLine(doc, section);
    if (!labelLine) {
      push(findings, doc, section.startLine, section.heading.title, `${section.heading.title} is missing an **Errors.** table.`);
      continue;
    }

    const table = parseTableAt(doc, labelLine, section.endLine);
    if (!table.header) {
      push(findings, doc, labelLine, doc.lines[labelLine] ?? "", `${section.heading.title} must use a concrete error-code table, not shorthand prose.`);
      continue;
    }

    const headers = table.header.cells.map(normalizedHeader);
    const httpIdx = headers.findIndex((h) => h === "http");
    const codeIdx = headers.findIndex((h) => h === "code");
    if (httpIdx < 0 || codeIdx < 0) {
      push(findings, doc, table.header.line, table.header.cells.join(" | "), `${section.heading.title} error table must include HTTP and Code columns.`);
      continue;
    }

    for (const row of table.rows) {
      const code = codeToken(row.cells[codeIdx] ?? "");
      const http = httpStatus(row.cells[httpIdx] ?? "");
      if (!code) continue;
      if (!http) {
        push(findings, doc, row.line, row.cells.join(" | "), `${section.heading.title} error row for \`${code}\` is missing an HTTP status.`);
        continue;
      }
      out.push({ code, http, line: row.line, section });
    }
  }
  return out;
}

function registryRowsFromSection(doc: SpecDoc, section: Section, findings: Finding[]): RegistryRow[] {
  const table = parseTableAt(doc, section.startLine, section.endLine);
  if (!table.header) {
    push(findings, doc, section.startLine, section.heading.title, `${section.heading.title} must contain an Appendix I code table.`);
    return [];
  }

  const headers = table.header.cells.map(normalizedHeader);
  const codeIdx = headers.findIndex((h) => h === "code");
  const httpIdx = headers.findIndex((h) => h === "http");
  const descriptionIdx = headers.findIndex((h) => ["meaning", "description", "used by"].includes(h));
  if (codeIdx < 0 || httpIdx < 0 || descriptionIdx < 0) {
    push(findings, doc, table.header.line, table.header.cells.join(" | "), `${section.heading.title} table must include Code, HTTP, and Meaning/Description/Used By columns.`);
    return [];
  }

  const rows: RegistryRow[] = [];
  for (const row of table.rows) {
    const code = codeToken(row.cells[codeIdx] ?? "");
    if (!code) continue;
    const http = httpStatus(row.cells[httpIdx] ?? "");
    const description = (row.cells[descriptionIdx] ?? "").trim();
    if (!http) {
      push(findings, doc, row.line, row.cells.join(" | "), `Appendix I row for \`${code}\` is missing an HTTP status.`);
    }
    if (!description) {
      push(findings, doc, row.line, row.cells.join(" | "), `Appendix I row for \`${code}\` is missing a meaning/description.`);
    }
    rows.push({ code, http, line: row.line, section: section.heading.title, description });
  }
  return rows;
}

function appendixBillingRegistry(doc: SpecDoc, findings: Finding[]): Map<string, RegistryRow[]> {
  const ranges = computeSectionRanges(doc).map((range) => ({
    heading: range.heading,
    startLine: range.startLine,
    endLine: range.endLine,
  }));
  const targetSections = ranges.filter((section) =>
    /^Billing Endpoint Errors\b|^Pre-existing Billing Domain Codes\b/.test(section.heading.title),
  );
  if (targetSections.length < 2) {
    push(
      findings,
      doc,
      0,
      "Billing Endpoint Errors / Pre-existing Billing Domain Codes",
      "Appendix I billing error registry sections are missing.",
    );
  }

  const map = new Map<string, RegistryRow[]>();
  for (const section of targetSections) {
    for (const row of registryRowsFromSection(doc, section, findings)) {
      const rows = map.get(row.code) ?? [];
      rows.push(row);
      map.set(row.code, rows);
    }
  }
  return map;
}

export const gate: SpecLintGate = {
  id: "appendix_i_billing_error_code_catalog_complete",
  sourcePhase: "V8.1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const registry = appendixBillingRegistry(doc, findings);
    const endpoints = endpointCodes(doc, findings);

    for (const endpoint of endpoints) {
      const rows = registry.get(endpoint.code) ?? [];
      if (!rows.length) {
        push(
          findings,
          doc,
          endpoint.line,
          `\`${endpoint.code}\``,
          `${endpoint.section.heading.title} references \`${endpoint.code}\`, but Appendix I has no billing row for it.`,
        );
        continue;
      }
      if (!rows.some((row) => row.http === endpoint.http)) {
        const seen = rows.map((row) => `${row.http || "<missing>"} at line ${row.line}`).join(", ");
        push(
          findings,
          doc,
          endpoint.line,
          `${endpoint.http} \`${endpoint.code}\``,
          `${endpoint.section.heading.title} uses HTTP ${endpoint.http} for \`${endpoint.code}\`, but Appendix I registers ${seen}.`,
        );
      }
    }

    const requiredAc = "appendix_i_billing_error_code_catalog_complete";
    const billingAc = computeSectionRanges(doc).find((range) => range.heading.anchor === "32.8.23-acceptance-criteria-billing");
    if (billingAc && !sectionText(doc, billingAc).includes(requiredAc)) {
      push(
        findings,
        doc,
        billingAc.startLine,
        requiredAc,
        "§32.8.23 acceptance criteria must cite CI gate `appendix_i_billing_error_code_catalog_complete`.",
      );
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
