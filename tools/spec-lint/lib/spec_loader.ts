/**
 * Sourcera Spec-Lint Harness — document loader + markdown structure parser.
 *
 * Authority anchor: Sourcera_Master_Spec.md §M.4.2 (parse-tree trigger detector
 * conventions) + §M.5.3 (catalog schema). Mirrors the section-range scoping and
 * anchor-extraction logic already in `tools/spec-lint/appendix_k_canonicality.ts`
 * so the two detectors share one mental model.
 *
 * Pure utilities; no network, no side effects. Node built-ins only.
 */

import { readFileSync } from "node:fs";
import type { SpecDoc } from "./types.js";

/**
 * Load a markdown document with 1-indexed line access. `lines[0]` is the empty
 * string so `lines[N]` is the Nth line as humans (and the audit record) count.
 */
export function loadDoc(path: string): SpecDoc {
  const text = readFileSync(path, "utf-8");
  const split = text.split(/\r?\n/);
  return { path, text, lines: ["", ...split] };
}

export interface Heading {
  level: number; // 1 = `# `, 2 = `## `, ...
  title: string;
  anchor?: string; // slug inside {#...}
  line: number; // 1-based
}

const HEADING_RE = /^(#{1,6})\s+(.*?)\s*(?:\{#([^}]+)\})?\s*$/;

/** Parse every ATX heading with its line number and optional anchor slug. */
export function parseHeadings(doc: SpecDoc): Heading[] {
  const out: Heading[] = [];
  let inFence = false;
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i];
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = HEADING_RE.exec(line);
    if (m) {
      out.push({
        level: m[1].length,
        title: m[2].trim(),
        anchor: m[3]?.trim(),
        line: i,
      });
    }
  }
  return out;
}

/** Every `{#anchor}` slug declared in the document, with declaring line. */
export function extractAnchors(doc: SpecDoc): Map<string, number> {
  const anchors = new Map<string, number>();
  const re = /\{#([^}]+)\}/g;
  for (let i = 1; i < doc.lines.length; i++) {
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(doc.lines[i])) !== null) {
      if (!anchors.has(m[1])) anchors.set(m[1], i);
    }
  }
  return anchors;
}

export interface SectionRange {
  heading: Heading;
  startLine: number; // line of the heading
  endLine: number; // last line before the next heading of <= level
}

/**
 * Compute the [start,end] line span owned by each heading (until the next
 * heading at the same or shallower level). Used for section-scoped detectors
 * (e.g., "scan only Appendix I" or "exclude the appendix range").
 */
export function computeSectionRanges(doc: SpecDoc): SectionRange[] {
  const headings = parseHeadings(doc);
  const ranges: SectionRange[] = [];
  for (let h = 0; h < headings.length; h++) {
    const cur = headings[h];
    let end = doc.lines.length - 1;
    for (let k = h + 1; k < headings.length; k++) {
      if (headings[k].level <= cur.level) {
        end = headings[k].line - 1;
        break;
      }
    }
    ranges.push({ heading: cur, startLine: cur.line, endLine: end });
  }
  return ranges;
}

/**
 * Find the line span of the first heading whose title matches `titleMatch`
 * (string includes or RegExp). Returns null if not found.
 */
export function findSectionByTitle(
  doc: SpecDoc,
  titleMatch: string | RegExp,
): SectionRange | null {
  const ranges = computeSectionRanges(doc);
  for (const r of ranges) {
    const hit =
      typeof titleMatch === "string"
        ? r.heading.title.includes(titleMatch)
        : titleMatch.test(r.heading.title);
    if (hit) return r;
  }
  return null;
}

/** Find a section by its anchor slug. */
export function findSectionByAnchor(
  doc: SpecDoc,
  anchor: string,
): SectionRange | null {
  const ranges = computeSectionRanges(doc);
  for (const r of ranges) {
    if (r.heading.anchor === anchor) return r;
  }
  return null;
}

/** The nearest enclosing heading anchor (or title) for a given line. */
export function anchorForLine(doc: SpecDoc, line: number): string | undefined {
  const headings = parseHeadings(doc);
  let best: Heading | undefined;
  for (const h of headings) {
    if (h.line <= line) best = h;
    else break;
  }
  return best?.anchor ?? best?.title;
}

export interface TableRow {
  cells: string[];
  line: number; // 1-based line of the row
}

/**
 * Parse the GitHub-flavored markdown table that begins at or after `fromLine`
 * and ends at the first non-table line. Returns header + data rows. Delimiter
 * rows (`| :--- | :--- |`) are skipped. Cell content is trimmed; leading/
 * trailing pipes are stripped. Escaped pipes (`\|`) inside cells are preserved.
 */
export function parseTableAt(
  doc: SpecDoc,
  fromLine: number,
  toLine?: number,
): { header: TableRow | null; rows: TableRow[] } {
  const end = toLine ?? doc.lines.length - 1;
  let header: TableRow | null = null;
  const rows: TableRow[] = [];
  let started = false;
  for (let i = fromLine; i <= end; i++) {
    const raw = doc.lines[i];
    if (raw === undefined) break;
    const isTableLine = /^\s*\|.*\|\s*$/.test(raw);
    if (!isTableLine) {
      if (started) break; // table ended
      continue; // not started yet; keep scanning for the first row
    }
    started = true;
    // Split on unescaped pipes.
    const trimmed = raw.trim().replace(/^\|/, "").replace(/\|$/, "");
    const cells = splitUnescapedPipes(trimmed).map((c) => c.trim());
    const isDelimiter = cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "");
    if (isDelimiter) continue;
    if (header === null) header = { cells, line: i };
    else rows.push({ cells, line: i });
  }
  return { header, rows };
}

/** Split a markdown table row on pipes that are not backslash-escaped. */
export function splitUnescapedPipes(s: string): string[] {
  const out: string[] = [];
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\\" && s[i + 1] === "|") {
      cur += "\\|";
      i++;
      continue;
    }
    if (s[i] === "|") {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += s[i];
  }
  out.push(cur);
  return out;
}

/** True if the line lies inside a fenced code block. Precomputed mask. */
export function fenceMask(doc: SpecDoc): boolean[] {
  const mask = new Array<boolean>(doc.lines.length).fill(false);
  let inFence = false;
  for (let i = 1; i < doc.lines.length; i++) {
    if (/^\s*```/.test(doc.lines[i])) {
      // The fence delimiter line itself is considered "inside" for scanning
      // purposes (we never want to match rules on a ``` line anyway).
      mask[i] = true;
      inFence = !inFence;
      continue;
    }
    mask[i] = inFence;
  }
  return mask;
}
