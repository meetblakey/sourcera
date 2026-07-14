/**
 * Gate: `network_effects_inventory_completeness`
 *
 * Assertion: §48.3.5, §48.3.6, and §48.3.7 are exhaustive for S1-S7, B1-B7,
 * and X1-X5, and each registry row has a dashboard surface.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const REGISTRIES = [
  {
    anchor: "48.3.5-seller-side-compounding-network-effects",
    label: "§48.3.5 seller-side network effects",
    expected: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"],
    idColumn: 0,
    signalColumn: 5,
    dashboardColumn: 6,
    dashboardHeader: "Dashboard Tile (§48.3.3 Network Effects Dashboard)",
  },
  {
    anchor: "48.3.6-buyer-side-compounding-network-effects",
    label: "§48.3.6 buyer-side network effects",
    expected: ["B1", "B2", "B3", "B4", "B5", "B6", "B7"],
    idColumn: 0,
    signalColumn: 4,
    dashboardColumn: 5,
    dashboardHeader: "Dashboard Tile (§48.3.3)",
  },
  {
    anchor: "48.3.7-cross-side-network-effects",
    label: "§48.3.7 cross-side network effects",
    expected: ["X1", "X2", "X3", "X4", "X5"],
    idColumn: 0,
    signalColumn: 3,
    dashboardColumn: 4,
    dashboardHeader: "Dashboard Tile",
  },
] as const;

const REQUIRED_SECTION_TOKENS = [
  "CI gate `network_effects_inventory_completeness`",
  "§48.3.5 (S1–S7)",
  "§48.3.6 (B1–B7)",
  "§48.3.7 (X1–X5)",
  "every registry row",
  "§48.3.3 Network Effects Dashboard",
];

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/network_effects_inventory_completeness.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "§48.3.5 (S1–S7), §48.3.6 (B1–B7), §48.3.7 (X1–X5) exhaustive",
  "every row has a §48.3.3 dashboard tile",
  "M2/M14 signal sources resolve to current entity anchors",
];

const SIGNAL_SOURCE_REQUIREMENTS = new Map([
  ["m2_public_link_share_rate_per_workspace", "§48.5.2 PublicSelectionReport"],
  ["m14_bid_success_share_rate_per_winning_bid", "§4.4.29 BidSuccessShare"],
]);

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function requireToken(findings: Finding[], doc: SpecDoc, text: string, line: number, label: string, token: string) {
  if (!text.includes(token)) push(findings, doc, line, token, `${label} is missing required network-effects inventory token: ${token}`);
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function extractLoopId(cell: string): string | null {
  const match = /\*\*([SBX][1-7])\*\*/.exec(cell);
  return match?.[1] ?? null;
}

function registryFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];

  for (const registry of REGISTRIES) {
    const section = findSectionByAnchor(doc, registry.anchor);
    if (!section) {
      push(findings, doc, 0, registry.anchor, `${registry.label} section is missing.`);
      continue;
    }
    const table = parseTableAt(doc, section.startLine, section.endLine);
    const headers = table.header?.cells ?? [];
    if (!headers.includes(registry.dashboardHeader)) {
      push(findings, doc, table.header?.line ?? section.startLine, registry.dashboardHeader, `${registry.label} table is missing the dashboard tile column.`);
    }

    const seen = new Map<string, number>();
    for (const row of table.rows) {
      const id = extractLoopId(row.cells[registry.idColumn] ?? "");
      if (!id) {
        push(findings, doc, row.line, row.cells[registry.idColumn] ?? "", `${registry.label} row is missing a bold loop id.`);
        continue;
      }
      if (!registry.expected.includes(id as never)) {
        push(findings, doc, row.line, id, `${registry.label} has unexpected loop id ${id}.`);
      }
      if (seen.has(id)) {
        push(findings, doc, row.line, id, `${registry.label} has duplicate loop id ${id}.`);
      }
      seen.set(id, row.line);

      const signal = row.cells[registry.signalColumn] ?? "";
      const dashboard = row.cells[registry.dashboardColumn] ?? "";
      if (!signal.trim() || signal.trim() === "--") {
        push(findings, doc, row.line, signal, `${registry.label} ${id} is missing a measurable signal.`);
      }
      if (!dashboard.trim() || dashboard.trim() === "--") {
        push(findings, doc, row.line, dashboard, `${registry.label} ${id} is missing a dashboard tile or exec-roll-up surface.`);
      }
    }

    for (const id of registry.expected) {
      if (!seen.has(id)) push(findings, doc, section.startLine, id, `${registry.label} is missing loop ${id}.`);
    }
    if (table.rows.length !== registry.expected.length) {
      push(findings, doc, table.header?.line ?? section.startLine, `${table.rows.length}`, `${registry.label} must contain exactly ${registry.expected.length} registry rows.`);
    }
  }

  return findings;
}

function citationFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByAnchor(doc, "48.3.7-cross-side-network-effects");
  if (!section) {
    push(findings, doc, 0, "48.3.7-cross-side-network-effects", "§48.3.7 cross-side network effects section is missing.");
    return findings;
  }
  const text = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
  for (const token of REQUIRED_SECTION_TOKENS) {
    requireToken(findings, doc, text, section.startLine, "§48.3.7 network-effects inventory gate note", token);
  }
  return findings;
}

function signalSourceFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByAnchor(doc, "48.3.2-measurable-signals");
  if (!section) {
    push(findings, doc, 0, "48.3.2-measurable-signals", "§48.3.2 measurable-signals section is missing.");
    return findings;
  }

  const table = parseTableAt(doc, section.startLine, section.endLine);
  const headers = table.header?.cells ?? [];
  const signalIndex = headers.indexOf("Signal");
  const sourceIndex = headers.indexOf("Source");
  if (signalIndex < 0 || sourceIndex < 0) {
    push(findings, doc, table.header?.line ?? section.startLine, headers.join(" | "), "§48.3.2 signal table must include Signal and Source columns.");
    return findings;
  }

  const seen = new Set<string>();
  for (const row of table.rows) {
    const signal = (row.cells[signalIndex] ?? "").replace(/[`*]/g, "").trim();
    const requiredSource = SIGNAL_SOURCE_REQUIREMENTS.get(signal);
    if (!requiredSource) continue;
    seen.add(signal);
    const source = row.cells[sourceIndex] ?? "";
    if (!source.includes(requiredSource) || /placeholder|known gap|tbd/i.test(source)) {
      push(findings, doc, row.line, source, `§48.3.2 signal ${signal} source must resolve to ${requiredSource} with no placeholder qualifier.`);
    }
  }

  for (const signal of SIGNAL_SOURCE_REQUIREMENTS.keys()) {
    if (!seen.has(signal)) push(findings, doc, section.startLine, signal, `§48.3.2 is missing required signal ${signal}.`);
  }
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `network_effects_inventory_completeness` |"));
  if (!row) {
    push(findings, doc, 0, "`network_effects_inventory_completeness`", "§M.5 row network_effects_inventory_completeness is missing.");
    return findings;
  }
  for (const token of M5_TOKENS) requireToken(findings, doc, row.text, row.line, "§M.5 network_effects_inventory_completeness row", token);
  return findings;
}

export const gate: SpecLintGate = {
  id: "network_effects_inventory_completeness",
  sourcePhase: "V13",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.1.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...registryFindings(doc),
      ...signalSourceFindings(doc),
      ...citationFindings(doc),
      ...m5Findings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
