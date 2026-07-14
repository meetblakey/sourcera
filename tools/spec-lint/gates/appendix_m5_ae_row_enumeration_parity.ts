/**
 * Gate: `appendix_m5_ae_row_enumeration_parity` (Source phase: V11, D-11.3-006)
 * Archetype: catalog self-consistency meta-gate.
 *
 * Assertion (§M.5.4): Authored Extension rows that enumerate a CI-gate batch
 * must match the §M.5.4 rows that cite the AE-ID in their Authority anchor.
 */

import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  anchorForLine,
  findSectionByTitle,
  parseTableAt,
  splitUnescapedPipes,
} from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";

const GATE_ID_CELL = /^`([a-z0-9_]+)`$/;
const AE_ID = /\b(AE-[A-Za-z0-9][A-Za-z0-9.-]*)\b/g;
const BACKTICK_TOKEN = /`([a-z][a-z0-9_]{2,})`/g;
const BATCH_ROW =
  /\b(?:gates_added\[\]|New CI gates registry batch|\d+\s+new CI gates|\d+\s+new\s+§M\.5|CI gates?\s*\([^)]*\d+\s+gates|\d+\s+lightweight CI gates)\b/i;

interface BatchRow {
  aeId: string;
  line: number;
  gateIds: Set<string>;
  text: string;
}

function stripMd(s: string): string {
  return s.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function parseMarkdownRow(raw: string): string[] {
  const trimmed = raw.trim().replace(/^\|/, "").replace(/\|$/, "");
  return splitUnescapedPipes(trimmed).map((c) => c.trim());
}

function m54AuthorityIndex(doc: SpecDoc): {
  gateIds: Set<string>;
  byAeId: Map<string, Set<string>>;
  findings: Finding[];
} {
  const section = findSectionByTitle(doc, "M.5.4 Catalog index");
  if (!section) {
    return {
      gateIds: new Set(),
      byAeId: new Map(),
      findings: [{
        file: doc.path,
        line: 0,
        message: "parse_error: §M.5.4 Catalog index section not found.",
      }],
    };
  }

  const { rows } = parseTableAt(doc, section.startLine + 1, section.endLine);
  const gateIds = new Set<string>();
  const byAeId = new Map<string, Set<string>>();

  for (const row of rows) {
    const m = GATE_ID_CELL.exec((row.cells[0] ?? "").trim());
    if (!m) continue;
    const gateId = m[1];
    gateIds.add(gateId);
    const authority = row.cells[row.cells.length - 1] ?? "";
    AE_ID.lastIndex = 0;
    let hit: RegExpExecArray | null;
    while ((hit = AE_ID.exec(authority)) !== null) {
      const aeId = hit[1];
      if (!byAeId.has(aeId)) byAeId.set(aeId, new Set());
      byAeId.get(aeId)!.add(gateId);
    }
  }

  const findings: Finding[] = [];
  if (gateIds.size === 0) {
    findings.push({
      file: doc.path,
      line: section.startLine,
      anchor: anchorForLine(doc, section.startLine),
      message: "parse_error: §M.5.4 catalog index parsed zero gate rows.",
    });
  }
  return { gateIds, byAeId, findings };
}

function aeBatchRows(doc: SpecDoc, m54GateIds: Set<string>): BatchRow[] {
  const rows: BatchRow[] = [];
  for (let i = 1; i < doc.lines.length; i++) {
    const raw = doc.lines[i];
    if (!/^\s*\|.*\|\s*$/.test(raw)) continue;
    const cells = parseMarkdownRow(raw);
    const aeId = stripMd(cells[0] ?? "");
    if (!/^AE-[A-Za-z0-9_.-]+$/.test(aeId)) continue;
    const text = cells.join(" | ");
    if (!BATCH_ROW.test(text)) continue;

    const gateIds = new Set<string>();
    BACKTICK_TOKEN.lastIndex = 0;
    let hit: RegExpExecArray | null;
    while ((hit = BACKTICK_TOKEN.exec(text)) !== null) {
      if (m54GateIds.has(hit[1])) gateIds.add(hit[1]);
    }
    if (gateIds.size >= 2) rows.push({ aeId, line: i, gateIds, text });
  }
  return rows;
}

function sortedDiff(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter((x) => !b.has(x)).sort();
}

export const gate: SpecLintGate = {
  id: "appendix_m5_ae_row_enumeration_parity",
  sourcePhase: "V11",
  rowClass: "meta_catalog_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true, aeLedger: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const aeLedger = ctx.extraDocs.get("aeLedger");
    if (!aeLedger) {
      return [{
        file: ctx.masterSpec.path,
        line: 0,
        message: "parse_error: AE Ledger not loaded; pass --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md.",
      }];
    }

    const index = m54AuthorityIndex(ctx.masterSpec);
    if (index.findings.length > 0) return index.findings;

    const batches = aeBatchRows(aeLedger, index.gateIds);
    if (batches.length === 0) {
      return [{
        file: aeLedger.path,
        line: 0,
        message: "parse_error: AE Ledger parsed zero in-scope CI-gate batch rows for §M.5.4 parity.",
      }];
    }

    const findings: Finding[] = [];
    for (const row of batches) {
      const cited = index.byAeId.get(row.aeId) ?? new Set<string>();
      const enumeratedButNotCited = sortedDiff(row.gateIds, cited);
      const citedButNotEnumerated = sortedDiff(cited, row.gateIds);
      if (enumeratedButNotCited.length === 0 && citedButNotEnumerated.length === 0) continue;

      findings.push({
        file: aeLedger.path,
        line: row.line,
        anchor: anchorForLine(aeLedger, row.line),
        matched_text: row.aeId,
        message: `AE Ledger row ${row.aeId} enumerates a §M.5.4 CI-gate batch that does not match §M.5.4 Authority anchor citations. Enumerated-but-not-cited: ${enumeratedButNotCited.join(", ") || "<none>"}. Cited-but-not-enumerated: ${citedButNotEnumerated.join(", ") || "<none>"}.`,
      });
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
