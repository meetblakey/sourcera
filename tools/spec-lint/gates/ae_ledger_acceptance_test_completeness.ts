/**
 * Gate: `ae_ledger_acceptance_test_completeness`
 *
 * Asserts that every concrete AE Ledger row has enough normalized evidence for
 * the overlay to derive an `acceptance_test`. The historical tables do not all
 * expose a physical acceptance-test column; the normalized row schema overlay
 * is therefore the deterministic contract this detector enforces.
 */

import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { anchorForLine, splitUnescapedPipes } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";

const AE_ID = /^(?:AE|BC)-[A-Za-z0-9_.-]+$/;
const OVERLAY_ANCHOR = "Normalized Row Schema Overlay";
const STATUS =
  /\b(?:pending|approved|accepted|rejected|acknowledged|superseded|ratified|re-targeted)\b/i;
const EVIDENCE =
  /(?:_audit\/|_integration\/|RECONCILIATION|PHASE\d|PHASE|Master Spec|Sourcera_Master_Spec|Appendix|§|D-[A-Z0-9][A-Z0-9_.-]*|AE-[A-Za-z0-9_.-]+|BC-[A-Za-z0-9_.-]+)/;
const OWED_ACCEPTANCE =
  /\b(?:owed|runtime wiring|ratification queue|body authoring|sign-off|counter-signature|verification|validator|gate|CI gate|runbook|pack)\b/i;
const SUPERSEDED_FORWARD =
  /(?:AE-|BC-|D-|§|RECONCILIATION|forward|pointer|supplant|supplants|supersession)/i;

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
  id: "ae_ledger_acceptance_test_completeness",
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
          message:
            "parse_error: AE Ledger not loaded; pass --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md.",
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
        message:
          "AE Ledger is missing the Normalized Row Schema Overlay required to derive acceptance tests for legacy rows.",
      });
    }

    for (const row of rows) {
      if (!STATUS.test(row.text)) {
        findings.push({
          file: doc.path,
          line: row.line,
          anchor: anchorForLine(doc, row.line),
          matched_text: row.text.slice(0, 240),
          message: `AE Ledger row ${row.id} lacks a parseable ratification status, so no acceptance_test can be derived.`,
        });
      }
      if (!EVIDENCE.test(row.text) && !OWED_ACCEPTANCE.test(row.text)) {
        findings.push({
          file: doc.path,
          line: row.line,
          anchor: anchorForLine(doc, row.line),
          matched_text: row.text.slice(0, 240),
          message: `AE Ledger row ${row.id} lacks an evidence, landing-location, or owed-work pointer for the normalized acceptance_test.`,
        });
      }
      if (/\bsuperseded\b/i.test(row.text) && !SUPERSEDED_FORWARD.test(row.text)) {
        findings.push({
          file: doc.path,
          line: row.line,
          anchor: anchorForLine(doc, row.line),
          matched_text: row.text.slice(0, 240),
          message: `AE Ledger row ${row.id} is superseded but lacks a forwarding pointer to the superseding AE, defect, section, or reconciliation entry.`,
        });
      }
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
