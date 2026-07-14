/**
 * Gate: `pipeline_surface_compression_step_to_phase_canonical`
 *
 * Assertion: §2.8.2, §3.14.1, §3.14.2, and §22.19.1 must preserve the
 * canonical four-step to engine-phase mappings defined by §3.14.
 */

import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { anchorForLine, findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";

interface ExpectedRow {
  step: string;
  phases: number[];
  clickTarget: number;
}

interface Target {
  section: RegExp;
  label: string;
  expected: ExpectedRow[];
}

const BUYER: ExpectedRow[] = [
  { step: "Setup", phases: [1, 2, 3], clickTarget: 1 },
  { step: "Define", phases: [4, 5, 6], clickTarget: 4 },
  { step: "Score", phases: [7, 8, 9, 10], clickTarget: 7 },
  { step: "Decide", phases: [11, 12, 13], clickTarget: 11 },
];

const SELLER: ExpectedRow[] = [
  { step: "Receive", phases: [1, 2], clickTarget: 1 },
  { step: "Draft", phases: [3, 4, 5, 6, 7], clickTarget: 3 },
  { step: "Review", phases: [8, 9, 10], clickTarget: 8 },
  { step: "Submit", phases: [11, 12, 13], clickTarget: 11 },
];

const TARGETS: Target[] = [
  { section: /^2\.8\.2\b/, label: "§2.8.2 Buyer Solo mirror", expected: BUYER },
  { section: /^3\.14\.1\b/, label: "§3.14.1 Buyer canonical", expected: BUYER },
  { section: /^3\.14\.2\b/, label: "§3.14.2 Seller canonical", expected: SELLER },
  { section: /^22\.19\.1\b/, label: "§22.19.1 Seller mirror", expected: SELLER },
];

function stripMd(s: string): string {
  return s.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function expandPhases(cell: string): number[] {
  const out: number[] = [];
  const re = /Phase\s+(\d+)(?:\s*[–-]\s*(\d+))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cell)) !== null) {
    const start = Number(m[1]);
    const end = m[2] ? Number(m[2]) : start;
    for (let n = start; n <= end; n++) out.push(n);
  }
  return out;
}

function firstPhase(cell: string): number | null {
  const m = /Phase\s+(\d+)/.exec(cell);
  return m ? Number(m[1]) : null;
}

function sameNumbers(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((n, i) => n === b[i]);
}

function fmt(nums: number[]): string {
  return nums.join(",");
}

function checkTarget(doc: SpecDoc, target: Target): Finding[] {
  const section = findSectionByTitle(doc, target.section);
  if (!section) {
    return [{
      file: doc.path,
      line: 0,
      message: `parse_error: ${target.label} section not found.`,
    }];
  }

  const table = parseTableAt(doc, section.startLine + 1, section.endLine);
  if (!table.header || table.rows.length === 0) {
    return [{
      file: doc.path,
      line: section.startLine,
      anchor: section.heading.anchor,
      message: `parse_error: ${target.label} step-to-phase table not found.`,
    }];
  }

  const headers = table.header.cells.map((c) => stripMd(c).toLowerCase());
  const stepIdx = headers.findIndex((h) => h.includes("step"));
  const phasesIdx = headers.findIndex((h) => h.includes("engine phases"));
  const clickIdx = headers.findIndex((h) => h.includes("click target"));
  if (stepIdx < 0 || phasesIdx < 0 || clickIdx < 0) {
    return [{
      file: doc.path,
      line: table.header.line,
      anchor: anchorForLine(doc, table.header.line),
      message: `parse_error: ${target.label} table is missing step, engine-phase, or click-target columns.`,
    }];
  }

  const findings: Finding[] = [];
  for (const expected of target.expected) {
    const row = table.rows.find((r) => stripMd(r.cells[stepIdx] ?? "") === expected.step);
    if (!row) {
      findings.push({
        file: doc.path,
        line: table.header.line,
        anchor: anchorForLine(doc, table.header.line),
        matched_text: expected.step,
        message: `${target.label} is missing compressed step ${expected.step}.`,
      });
      continue;
    }

    const phases = expandPhases(row.cells[phasesIdx] ?? "");
    const clickTarget = firstPhase(row.cells[clickIdx] ?? "");
    if (!sameNumbers(phases, expected.phases)) {
      findings.push({
        file: doc.path,
        line: row.line,
        anchor: anchorForLine(doc, row.line),
        matched_text: `${expected.step} -> ${fmt(phases) || "<none>"}`,
        message: `${target.label} step ${expected.step} maps to phases ${fmt(phases) || "<none>"}; expected ${fmt(expected.phases)}.`,
      });
    }
    if (clickTarget !== expected.clickTarget) {
      findings.push({
        file: doc.path,
        line: row.line,
        anchor: anchorForLine(doc, row.line),
        matched_text: `${expected.step} click target ${clickTarget ?? "<none>"}`,
        message: `${target.label} step ${expected.step} click target is Phase ${clickTarget ?? "<none>"}; expected Phase ${expected.clickTarget}.`,
      });
    }
  }

  const extraRows = table.rows.filter((row) => {
    const step = stripMd(row.cells[stepIdx] ?? "");
    return step && !target.expected.some((expected) => expected.step === step);
  });
  for (const row of extraRows) {
    findings.push({
      file: doc.path,
      line: row.line,
      anchor: anchorForLine(doc, row.line),
      matched_text: stripMd(row.cells[stepIdx] ?? ""),
      message: `${target.label} contains an unexpected compressed step.`,
    });
  }

  return findings;
}

export const gate: SpecLintGate = {
  id: "pipeline_surface_compression_step_to_phase_canonical",
  sourcePhase: "14.6",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return TARGETS.flatMap((target) => checkTarget(ctx.masterSpec, target));
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
