/**
 * Gate: `ae_ledger_target_version_completeness`
 *
 * Asserts that every concrete AE Ledger row has a derivable
 * `target_ratification_version`. Legacy tables can rely on the normalized
 * schema overlay in AUTHORED_EXTENSIONS_LEDGER.md; newer rows should carry an
 * explicit v7.x target in the row body.
 */

import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { anchorForLine, splitUnescapedPipes } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";

const AE_ID = /^(?:AE|BC)-[A-Za-z0-9_.-]+$/;
const VERSION = /\bv7\.(?:0\.0|1\.0a|1\.0|1\.1|1\.2|2\.0)\b/;
const OVERLAY_ANCHOR = "Normalized Row Schema Overlay";

interface AeRow {
  id: string;
  text: string;
  line: number;
}

function stripMd(s: string): string {
  return s.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function parseRows(doc: SpecDoc): AeRow[] {
  const rows: AeRow[] = [];
  for (let i = 1; i < doc.lines.length; i++) {
    const raw = doc.lines[i];
    if (!/^\s*\|.*\|\s*$/.test(raw)) continue;
    const trimmed = raw.trim().replace(/^\|/, "").replace(/\|$/, "");
    const cells = splitUnescapedPipes(trimmed).map((c) => c.trim());
    if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) continue;
    const id = stripMd(cells[0] ?? "");
    if (!AE_ID.test(id)) continue;
    rows.push({ id, text: cells.join(" | "), line: i });
  }
  return rows;
}

function hasOverlay(doc: SpecDoc): boolean {
  return doc.text.includes(OVERLAY_ANCHOR);
}

export const gate: SpecLintGate = {
  id: "ae_ledger_target_version_completeness",
  sourcePhase: "Phase AE",
  rowClass: "meta_catalog_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true, aeLedger: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.extraDocs.get("aeLedger");
    if (!doc) {
      return [
        {
          file: ctx.masterSpec.path,
          line: 0,
          message: "parse_error: AE Ledger not loaded; pass --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md.",
        },
      ];
    }

    const rows = parseRows(doc);
    const overlay = hasOverlay(doc);
    const findings: Finding[] = [];
    if (rows.length === 0) {
      findings.push({
        file: doc.path,
        line: 0,
        message: "parse_error: parsed zero concrete AE/BC rows from AE Ledger.",
      });
      return findings;
    }
    if (!overlay) {
      findings.push({
        file: doc.path,
        line: 0,
        message: "AE Ledger is missing the Normalized Row Schema Overlay required to derive target versions for legacy rows.",
      });
    }

    for (const row of rows) {
      if (VERSION.test(row.text)) continue;
      if (overlay) continue;
      findings.push({
        file: doc.path,
        line: row.line,
        anchor: anchorForLine(doc, row.line),
        matched_text: row.text.slice(0, 240),
        message: `AE Ledger row ${row.id} lacks an explicit v7.x target_ratification_version and no overlay default is available.`,
      });
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
