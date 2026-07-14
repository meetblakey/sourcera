/**
 * Pipe-aware exact-status scan for canonical Defect Ledger rows.
 *
 * Counts full canonical rows only. A row with a transition in its canonical
 * status cell (for example, `open → remediated 2026-07-11`) is closed.
 * Supplementary transition tables are intentionally excluded.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type Severity = "P0" | "P1" | "P2" | "P3";

const SEVERITIES: Severity[] = ["P0", "P1", "P2", "P3"];
const STATUS_RE = /^(open|proposed_extension|wont_fix|remediated|superseded|partially_remediated)(\s|$)/i;
const CLOSED_RE = /remediat|superseded|wont_fix|partially/i;

function arg(name: string, fallback?: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function splitRow(line: string): string[] {
  const trimmed = line.trim();
  const body = trimmed.slice(1, trimmed.endsWith("|") ? -1 : undefined);
  return body.split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, "|"));
}

function canonicalStatus(cells: string[]): string | undefined {
  for (let index = cells.length - 1; index >= Math.max(0, cells.length - 6); index -= 1) {
    if (STATUS_RE.test(cells[index])) return cells[index];
  }
  return undefined;
}

const ledgerPath = resolve(arg("--ledger", "_audit/DEFECT_LEDGER.md")!);
const text = readFileSync(ledgerPath, "utf8");
const rowsBySeverity: Record<Severity, number> = { P0: 0, P1: 0, P2: 0, P3: 0 };
let canonicalRows = 0;
let openRows = 0;

for (const line of text.split(/\r?\n/)) {
  if (!line.startsWith("| D-")) continue;
  const cells = splitRow(line);
  const severity = cells[1] as Severity | undefined;
  if (!severity || !SEVERITIES.includes(severity) || cells.length < 12) continue;
  const status = canonicalStatus(cells);
  if (!status) continue;
  canonicalRows += 1;
  if (CLOSED_RE.test(status)) continue;
  rowsBySeverity[severity] += 1;
  openRows += 1;
}

const result = {
  ledger: ledgerPath,
  canonical_rows_scanned: canonicalRows,
  open_rows: openRows,
  open_by_severity: rowsBySeverity,
  method: "full canonical rows only; pipe-aware; status transitions in canonical status cells are closed; supplementary tables excluded",
};

if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else {
  process.stdout.write(
    `Canonical rows: ${canonicalRows}\nOpen: P0 ${rowsBySeverity.P0}, P1 ${rowsBySeverity.P1}, P2 ${rowsBySeverity.P2}, P3 ${rowsBySeverity.P3}\n`,
  );
}
