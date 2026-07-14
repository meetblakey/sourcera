/**
 * Gate: `appendix_m_no_orphan_engine_concept`
 *
 * Assertion: every concrete Appendix M.1 mapping row must have a `Spec home`
 * cell that resolves to an existing Master Spec section, companion document, or
 * local audit artifact. Group-divider rows are ignored.
 */

import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { anchorForLine, findSectionByTitle, parseHeadings, splitUnescapedPipes } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";

const SECTION_REF = /§\s*([A-Z](?:\.\d+)+|\d+(?:\.\d+)*)/g;
const APPENDIX_REF = /Appendix\s+([A-Z])(?:\.(\d+))?/g;
const COMPANION = /^Companion:\s*([^ ]+)\s+§(.+)$/i;
const LOCAL_PATH = /(?:^|\s)(_[a-z]+\/[A-Za-z0-9_.\/-]+)/;

function stripMd(s: string): string {
  return s.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function isTableLine(raw: string): boolean {
  return /^\s*\|.*\|\s*$/.test(raw);
}

function isDelimiter(cells: string[]): boolean {
  return cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "");
}

function sectionIds(doc: SpecDoc): Set<string> {
  const ids = new Set<string>();
  for (const heading of parseHeadings(doc)) {
    const m = /^([A-Z](?:\.\d+)*|\d+(?:\.\d+)*)\b/.exec(heading.title);
    if (m) ids.add(m[1]);
    const appendix = /^Appendix\s+([A-Z])\b/.exec(heading.title);
    if (appendix) ids.add(appendix[1]);
  }
  return ids;
}

function hasSection(ids: Set<string>, ref: string): boolean {
  if (ids.has(ref)) return true;
  for (const id of ids) {
    if (id.startsWith(`${ref}.`)) return true;
  }
  return false;
}

function localPathExists(root: string, cell: string): boolean {
  const m = LOCAL_PATH.exec(cell);
  return m ? existsSync(join(root, m[1])) : false;
}

function companionExists(root: string, cell: string): boolean {
  const m = COMPANION.exec(cell);
  return m ? existsSync(join(root, m[1])) : false;
}

function resolveSpecHome(root: string, ids: Set<string>, cell: string): boolean {
  const specHome = stripMd(cell);
  if (!specHome) return false;
  if (companionExists(root, specHome) || localPathExists(root, specHome)) return true;

  const refs = [
    ...[...specHome.matchAll(SECTION_REF)].map((m) => m[1]),
    ...[...specHome.matchAll(APPENDIX_REF)].map((m) => (m[2] ? `${m[1]}.${m[2]}` : m[1])),
  ];
  if (refs.length === 0) return false;
  return refs.every((ref) => hasSection(ids, ref));
}

export const gate: SpecLintGate = {
  id: "appendix_m_no_orphan_engine_concept",
  sourcePhase: "14.2",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const root = dirname(resolve(doc.path));
    const section = findSectionByTitle(doc, "M.1 Master Surface/Engine Mapping Table");
    if (!section) {
      return [{
        file: doc.path,
        line: 0,
        message: "parse_error: Appendix M.1 mapping table section not found.",
      }];
    }

    const ids = sectionIds(doc);
    const findings: Finding[] = [];
    let rows = 0;
    for (let line = section.startLine + 1; line <= section.endLine; line++) {
      const raw = doc.lines[line] ?? "";
      if (!isTableLine(raw)) continue;
      const cells = splitUnescapedPipes(raw.trim().replace(/^\|/, "").replace(/\|$/, "")).map((c) => c.trim());
      if (isDelimiter(cells)) continue;
      if (cells[0] === "Engine concept") continue;
      if ((cells[0] ?? "").startsWith("**")) continue;
      rows++;
      if (!resolveSpecHome(root, ids, cells[1] ?? "")) {
        findings.push({
          file: doc.path,
          line,
          anchor: anchorForLine(doc, line),
          matched_text: `${stripMd(cells[0] ?? "")} -> ${stripMd(cells[1] ?? "") || "<empty>"}`,
          message: "Appendix M.1 row has an empty or unresolved Spec home cell.",
        });
      }
    }

    if (rows === 0) {
      findings.push({
        file: doc.path,
        line: section.startLine,
        anchor: section.heading.anchor,
        message: "parse_error: Appendix M.1 mapping table parsed zero concrete rows.",
      });
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
