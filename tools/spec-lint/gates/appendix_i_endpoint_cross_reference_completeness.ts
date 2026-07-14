/**
 * Gate: `appendix_i_endpoint_cross_reference_completeness`
 *
 * Assertion: Appendix I HTTP error-code tables carry endpoint traceability via
 * a non-empty `Used By` / `Endpoint` column.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  computeSectionRanges,
  parseTableAt,
  splitUnescapedPipes,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

interface Section {
  heading: { title: string; anchor?: string };
  startLine: number;
  endLine: number;
}

function splitTableRow(raw: string): string[] {
  return splitUnescapedPipes(raw.trim().replace(/^\|/, "").replace(/\|$/, "")).map((cell) => cell.trim());
}

function normalized(cell: string): string {
  return cell.replace(/[*`]/g, "").trim().toLowerCase();
}

function stripMd(cell: string): string {
  return cell.replace(/[*`]/g, "").replace(/<br\s*\/?>/gi, " ").trim();
}

function codeToken(cell: string): string {
  return cell.match(/`([^`]+)`/)?.[1] ?? stripMd(cell).split(/\s+/)[0] ?? "";
}

function isHttpCell(cell: string): boolean {
  return /\b(?:2\d\d|4\d\d|5\d\d)\b/.test(cell);
}

function appendixIRange(doc: SpecDoc): Section | null {
  const range = computeSectionRanges(doc).find((item) => /^Appendix I:/.test(item.heading.title));
  return range ? { heading: range.heading, startLine: range.startLine, endLine: range.endLine } : null;
}

function sectionForLine(doc: SpecDoc, line: number): Section | null {
  let best: Section | null = null;
  for (const range of computeSectionRanges(doc)) {
    if (range.startLine <= line && line <= range.endLine) {
      best = { heading: range.heading, startLine: range.startLine, endLine: range.endLine };
    }
  }
  return best;
}

function excludedSection(title: string): boolean {
  return /Preamble|Error Response Schema|Internal Integrity Events|Polling Payload Flags|Spec-Lint CI Gate Internal Failure Modes/i.test(title);
}

function usedByIdx(headers: string[]): number {
  return headers.findIndex((header) =>
    header === "used by" ||
    header === "used_by" ||
    header === "endpoint" ||
    header === "endpoints" ||
    header.includes("used by") ||
    header.includes("endpoint"),
  );
}

function missingUsedBy(value: string): boolean {
  const stripped = stripMd(value);
  return !stripped || /^[-—]+$/.test(stripped) || /^(?:n\/a|tbd|none)$/i.test(stripped);
}

function resolvableUsedBy(value: string): boolean {
  const stripped = stripMd(value);
  return (
    /§\d/.test(stripped) ||
    /\b(?:GET|POST|PATCH|DELETE|PUT)\b/.test(stripped) ||
    /\/(?:v1\/|ops\/|crm-sync|seller-signals|marketplace|orgs|workspaces|qa-|kb-|agent|billing)/.test(stripped) ||
    /\b(?:Any|All|Internal|Background|Nightly|Ops|Webhook|worker|job|pipeline|surface|API|endpoint|endpoints|flow|dispatcher|handler|export|read|write|mutation|mutations|create|creation|update|delete|publish|generation|invocation|callback|bridge|polling|request|requests|CRUD|accept|access|render|verification|operations|transition|transitions|scheduler|preview|filing|attempt|attempts|claim|verify-dns)\b/i.test(stripped)
  );
}

export const gate: SpecLintGate = {
  id: "appendix_i_endpoint_cross_reference_completeness",
  sourcePhase: "V8.4",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const appendix = appendixIRange(doc);
    if (!appendix) {
      return [{
        file: doc.path,
        line: 0,
        matched_text: "Appendix I",
        message: "Appendix I is missing; endpoint cross-reference completeness cannot be evaluated.",
      }];
    }

    for (let line = appendix.startLine; line <= appendix.endLine; line++) {
      const raw = doc.lines[line] ?? "";
      if (!/^\s*\|.*\|\s*$/.test(raw)) continue;

      const headerCells = splitTableRow(raw);
      const headers = headerCells.map(normalized);
      const codeIdx = headers.findIndex((header) => header === "code" || header === "error code");
      const httpIdx = headers.findIndex((header) => header === "http" || header === "http / exit" || header.startsWith("http "));
      if (codeIdx < 0 || httpIdx < 0) continue;

      const section = sectionForLine(doc, line);
      if (section && excludedSection(section.heading.title)) continue;

      const traceIdx = usedByIdx(headers);
      if (traceIdx < 0) {
        findings.push({
          file: doc.path,
          line,
          anchor: anchorForLine(doc, line),
          matched_text: headerCells.join(" | "),
          message: `${section?.heading.title ?? "Appendix I"} table must include a Used By or Endpoint column for §32 traceability.`,
        });
        continue;
      }

      const table = parseTableAt(doc, line, section?.endLine ?? appendix.endLine);
      const lastRowLine = table.rows.length ? table.rows[table.rows.length - 1].line : line;
      for (const row of table.rows) {
        const code = codeToken(row.cells[codeIdx] ?? "");
        const http = row.cells[httpIdx] ?? "";
        if (!code || !isHttpCell(http)) continue;
        const usedBy = row.cells[traceIdx] ?? "";
        if (missingUsedBy(usedBy)) {
          findings.push({
            file: doc.path,
            line: row.line,
            anchor: anchorForLine(doc, row.line),
            matched_text: code,
            message: `Appendix I row \`${code}\` must carry a non-empty Used By / Endpoint value.`,
          });
          continue;
        }
        if (!resolvableUsedBy(usedBy)) {
          findings.push({
            file: doc.path,
            line: row.line,
            anchor: anchorForLine(doc, row.line),
            matched_text: `${code} | ${usedBy}`,
            message: `Appendix I row \`${code}\` has a Used By / Endpoint value that is not resolvable to a §32 endpoint, endpoint family, or runtime surface.`,
          });
        }
      }
      line = lastRowLine;
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
