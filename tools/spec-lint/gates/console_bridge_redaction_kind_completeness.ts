/**
 * Gate: `console_bridge_redaction_kind_completeness`
 *
 * Assertion: every Appendix J `console_bridge_event_kind` value has exactly
 * one §4.7.1 field-level redaction row with explicit CARRIED / NEVER CARRIED
 * cells, and seller-to-buyer N/A rows carry the required safe-direction note.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  findSectionByAnchor,
  parseTableAt,
  type SectionRange,
  type TableRow,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const BRIDGE_ANCHOR = "4.7.1-console-bridge-event";

function clean(cell: string): string {
  return cell.replace(/[*`]/g, "").replace(/\s+/g, " ").trim();
}

function normalizeHeader(cell: string): string {
  return clean(cell).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function backtickTokens(s: string): string[] {
  return [...s.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
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

function sameSet(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v) => b.includes(v));
}

function canonicalAppendixKinds(doc: SpecDoc, findings: Finding[]): string[] {
  const headingLine = doc.lines.findIndex((line) => /^###\s+`console_bridge_event_kind`/.test(line));
  if (headingLine <= 0) {
    push(findings, doc, 0, "console_bridge_event_kind", "Appendix J `console_bridge_event_kind` heading is missing.");
    return [];
  }
  const tokens = new Set<string>();
  for (let line = headingLine + 1; line < doc.lines.length; line++) {
    const raw = doc.lines[line] ?? "";
    if (/^###\s+/.test(raw)) break;
    for (const token of backtickTokens(raw)) {
      if (token !== "console_bridge_event_kind") tokens.add(token);
    }
  }
  if (tokens.size === 0) {
    push(findings, doc, headingLine, "console_bridge_event_kind", "Appendix J `console_bridge_event_kind` has no registered values.");
  }
  return [...tokens];
}

function phase6AppendixKinds(doc: SpecDoc): { line: number; values: string[] } | null {
  const line = doc.lines.findIndex((raw) => raw.includes("**`console_bridge_event_kind`** (§4.7.1):"));
  if (line <= 0) return null;
  const beforeCount = (doc.lines[line] ?? "").split(/\(\d+\s+values\)/)[0] ?? "";
  return {
    line,
    values: backtickTokens(beforeCount).filter((token) => token !== "console_bridge_event_kind"),
  };
}

function fieldTableKinds(doc: SpecDoc, section: SectionRange, findings: Finding[]): string[] {
  const table = parseTableAt(doc, section.startLine, section.endLine);
  if (!table.header) {
    push(findings, doc, section.startLine, "Console Bridge Event field table", "§4.7.1 field table is missing.");
    return [];
  }
  const row = table.rows.find((r) => clean(r.cells[0] ?? "") === "event_kind");
  if (!row) {
    push(findings, doc, section.startLine, "`event_kind`", "Console Bridge Event field table is missing `event_kind`.");
    return [];
  }
  return backtickTokens(row.cells[2] ?? "").filter(
    (token) => token !== "event_kind" && token !== "console_bridge_event_kind",
  );
}

function redactionRows(doc: SpecDoc, section: SectionRange, findings: Finding[]): TableRow[] {
  for (let line = section.startLine; line <= section.endLine; line++) {
    const raw = doc.lines[line] ?? "";
    if (!/^\s*\|.*\|\s*$/.test(raw)) continue;
    const table = parseTableAt(doc, line, section.endLine);
    if (!table.header) continue;
    const headers = table.header.cells.map(normalizeHeader);
    if (headers[0] === "eventkind" && headers[1] === "fieldscarried" && headers[2] === "fieldsnevercarried") {
      return table.rows;
    }
    line = table.rows.length ? table.rows[table.rows.length - 1].line : line;
  }
  push(
    findings,
    doc,
    section.startLine,
    "Field-Level Redaction Rules",
    "§4.7.1 Field-Level Redaction Rules table is missing.",
  );
  return [];
}

function validateRedactionRows(
  doc: SpecDoc,
  findings: Finding[],
  rows: TableRow[],
  canonicalKinds: string[],
): string[] {
  const seen = new Map<string, TableRow[]>();
  for (const row of rows) {
    const tokens = backtickTokens(row.cells[0] ?? "");
    const carried = clean(row.cells[1] ?? "");
    const never = clean(row.cells[2] ?? "");
    if (tokens.length !== 1) {
      push(
        findings,
        doc,
        row.line,
        row.cells[0] ?? "",
        "Each Field-Level Redaction Rules row must name exactly one backticked event kind; grouped or empty rows are forbidden.",
      );
      continue;
    }
    const kind = tokens[0];
    seen.set(kind, [...(seen.get(kind) ?? []), row]);
    if (!canonicalKinds.includes(kind)) {
      push(
        findings,
        doc,
        row.line,
        kind,
        `Field-Level Redaction Rules row \`${kind}\` is not registered in Appendix J \`console_bridge_event_kind\`.`,
      );
    }
    if (!carried) {
      push(findings, doc, row.line, row.cells.join(" | "), `\`${kind}\` must have a non-empty Fields CARRIED cell.`);
    }
    if (!never) {
      push(
        findings,
        doc,
        row.line,
        row.cells.join(" | "),
        `\`${kind}\` must have a non-empty Fields NEVER CARRIED cell.`,
      );
    } else if (/^N\/A\b/i.test(never) && !/seller\s*[→\\-]?\s*buyer/i.test(never)) {
      push(
        findings,
        doc,
        row.line,
        never,
        `\`${kind}\` uses N/A in Fields NEVER CARRIED but lacks an explicit seller-to-buyer safe-direction attestation.`,
      );
    } else if (/^N\/A\b/i.test(never) && !/reverse/i.test(never)) {
      push(
        findings,
        doc,
        row.line,
        never,
        `\`${kind}\` seller-to-buyer N/A attestation must state that redaction rules apply in reverse.`,
      );
    }
  }
  for (const [kind, matches] of seen) {
    if (matches.length > 1) {
      for (const row of matches) {
        push(
          findings,
          doc,
          row.line,
          kind,
          `Field-Level Redaction Rules contains duplicate rows for \`${kind}\`; exactly one row is required.`,
        );
      }
    }
  }
  return [...seen.keys()];
}

export const gate: SpecLintGate = {
  id: "console_bridge_redaction_kind_completeness",
  sourcePhase: "v7.2.0-REM Phase 2.2",
  rowClass: "cross_feature_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_console_firewall",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const section = findSectionByAnchor(doc, BRIDGE_ANCHOR);
    if (!section) {
      push(findings, doc, 0, "§4.7.1", "§4.7.1 Console Bridge Event section is missing.");
      return findings;
    }

    const canonicalKinds = canonicalAppendixKinds(doc, findings);
    const fieldKinds = fieldTableKinds(doc, section, findings);
    if (canonicalKinds.length && fieldKinds.length && !sameSet(canonicalKinds, fieldKinds)) {
      const missing = canonicalKinds.filter((kind) => !fieldKinds.includes(kind));
      const extra = fieldKinds.filter((kind) => !canonicalKinds.includes(kind));
      push(
        findings,
        doc,
        section.startLine,
        "`event_kind`",
        `§4.7.1 event_kind field values must match Appendix J console_bridge_event_kind. Missing: ${missing.join(", ") || "none"}; extra: ${extra.join(", ") || "none"}.`,
      );
    }

    const phase6 = phase6AppendixKinds(doc);
    if (phase6 && canonicalKinds.length && !sameSet(canonicalKinds, phase6.values)) {
      const missing = canonicalKinds.filter((kind) => !phase6.values.includes(kind));
      const extra = phase6.values.filter((kind) => !canonicalKinds.includes(kind));
      push(
        findings,
        doc,
        phase6.line,
        "v7.2.0-REM Phase 6 console_bridge_event_kind",
        `Appendix J Phase 6 mirror must match canonical console_bridge_event_kind. Missing: ${missing.join(", ") || "none"}; extra: ${extra.join(", ") || "none"}.`,
      );
    }

    const redactionKinds = validateRedactionRows(doc, findings, redactionRows(doc, section, findings), canonicalKinds);
    for (const kind of canonicalKinds) {
      if (!redactionKinds.includes(kind)) {
        push(
          findings,
          doc,
          section.startLine,
          kind,
          `Appendix J console_bridge_event_kind \`${kind}\` has no §4.7.1 Field-Level Redaction Rules row.`,
        );
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
