import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface AnchorAlias {
  deprecatedAnchor: string;
  canonicalAnchor: string;
}

export interface ParsedHeading {
  level: number;
  title: string;
  anchor: string;
  line: number;
  endLine: number;
}

export interface ParsedTableRow {
  header: string[];
  cells: string[];
  line: number;
  anchor: string;
}

export interface InlineGateReference {
  gateId: string;
  line: number;
  anchor: string;
}

export interface SpecSnapshot {
  text: string;
  lines: string[];
  headings: ParsedHeading[];
  tableRows: ParsedTableRow[];
  gateIds: Set<string>;
  m1ConceptCells: string[];
  inlineGateReferences: InlineGateReference[];
}

export type StructuralChange =
  | { kind: "heading"; line: number; anchor: string; value: string }
  | { kind: "table_row"; line: number; anchor: string; value: string }
  | { kind: "inline_gate_reference"; line: number; anchor: string; value: string };

export function readPreEditSpec(
  postEditPath: string,
  preEditPath?: string,
  mergeBaseSha?: string,
): string {
  if (preEditPath) return readFileSync(resolve(preEditPath), "utf-8");
  if (!mergeBaseSha) throw new Error("missing --pre-edit-spec or --merge-base-sha");
  const gitPath = postEditPath.replace(/^\.\//, "");
  const result = spawnSync("git", ["show", `${mergeBaseSha}:${gitPath}`], {
    encoding: "utf-8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`cannot read merge-base snapshot ${mergeBaseSha}:${gitPath}: ${result.stderr.trim()}`);
  }
  return result.stdout;
}

export function parseSpec(text: string, aliases: AnchorAlias[] = []): SpecSnapshot {
  const lines = text.split(/\r?\n/);
  const visible = visibleLines(lines);
  const aliasMap = new Map(aliases.map((entry) => [stripHash(entry.deprecatedAnchor), stripHash(entry.canonicalAnchor)]));
  const headings: ParsedHeading[] = [];
  const lineAnchors: string[] = new Array(lines.length).fill("#document");
  const stack: ParsedHeading[] = [];

  for (let index = 0; index < visible.length; index++) {
    const line = visible[index] ?? "";
    const match = /^(#{1,6})\s+(.+?)(?:\s+\{#([^}]+)\})?\s*$/.exec(line);
    if (match) {
      const level = match[1]!.length;
      const rawTitle = match[2]!.trim();
      const explicit = match[3]?.trim();
      const derived = slugify(rawTitle.replace(/\s+\{#[^}]+\}\s*$/, ""));
      const anchor = canonicalAnchor(explicit ?? derived, aliasMap);
      while (stack.length && stack[stack.length - 1]!.level >= level) stack.pop();
      const heading: ParsedHeading = {
        level,
        title: rawTitle.replace(/\s+\{#[^}]+\}\s*$/, "").trim(),
        anchor,
        line: index + 1,
        endLine: lines.length,
      };
      stack.push(heading);
      headings.push(heading);
    }
    lineAnchors[index] = `#${stack[stack.length - 1]?.anchor ?? "document"}`;
  }

  for (let index = 0; index < headings.length; index++) {
    const current = headings[index]!;
    const next = headings.slice(index + 1).find((candidate) => candidate.level <= current.level);
    current.endLine = (next?.line ?? lines.length + 1) - 1;
  }

  const tableRows: ParsedTableRow[] = [];
  for (let index = 0; index < visible.length - 1; index++) {
    const headerLine = visible[index] ?? "";
    const separatorLine = visible[index + 1] ?? "";
    if (!isTableLine(headerLine) || !isSeparatorRow(separatorLine)) continue;
    const header = splitMarkdownRow(headerLine);
    let rowIndex = index + 2;
    while (rowIndex < visible.length && isTableLine(visible[rowIndex] ?? "")) {
      const cells = splitMarkdownRow(visible[rowIndex] ?? "");
      if (cells.length === header.length) {
        tableRows.push({
          header,
          cells,
          line: rowIndex + 1,
          anchor: lineAnchors[rowIndex] ?? "#document",
        });
      }
      rowIndex++;
    }
    index = rowIndex - 1;
  }

  const gateIds = new Set<string>();
  const m1ConceptCells: string[] = [];
  for (const row of tableRows) {
    const normalizedHeader = row.header.map(normalizeCell);
    if (normalizedHeader[0] === "gate id") {
      const gateId = identifier(row.cells[0] ?? "");
      if (gateId) gateIds.add(gateId);
    }
    if (row.anchor === "#m-1-master-surface-engine-mapping-table" || row.anchor.startsWith("#m-1-")) {
      const first = row.cells[0] ?? "";
      if (first && !/^\*\*/.test(first.trim())) m1ConceptCells.push(first);
    }
  }

  const inlineGateReferences: InlineGateReference[] = [];
  for (let index = 0; index < visible.length; index++) {
    const line = visible[index] ?? "";
    for (const match of line.matchAll(/Appendix M\.5\s+`([a-z0-9_]+)`/g)) {
      inlineGateReferences.push({
        gateId: match[1]!,
        line: index + 1,
        anchor: lineAnchors[index] ?? "#document",
      });
    }
  }

  return { text, lines, headings, tableRows, gateIds, m1ConceptCells, inlineGateReferences };
}

export function structuralDiff(
  preText: string,
  postText: string,
  aliases: AnchorAlias[] = [],
): StructuralChange[] {
  const pre = parseSpec(preText, aliases);
  const post = parseSpec(postText, aliases);
  const preHeadings = new Set(pre.headings.map(headingKey));
  const preRows = new Set(pre.tableRows.map(tableRowKey));
  const preRefs = new Set(pre.inlineGateReferences.map((ref) => `${ref.gateId}@${ref.anchor}`));
  const changes: StructuralChange[] = [];

  for (const heading of post.headings) {
    if (!preHeadings.has(headingKey(heading))) {
      changes.push({ kind: "heading", line: heading.line, anchor: `#${heading.anchor}`, value: heading.title });
    }
  }
  for (const row of post.tableRows) {
    if (!preRows.has(tableRowKey(row))) {
      changes.push({ kind: "table_row", line: row.line, anchor: row.anchor, value: row.cells.join(" | ") });
    }
  }
  for (const ref of post.inlineGateReferences) {
    if (!preRefs.has(`${ref.gateId}@${ref.anchor}`)) {
      changes.push({ kind: "inline_gate_reference", line: ref.line, anchor: ref.anchor, value: ref.gateId });
    }
  }
  return changes;
}

export function normalizeCell(value: string): string {
  return value
    .replace(/\\\|/g, "|")
    .replace(/[`*~]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function identifier(value: string): string {
  const backtick = /`([^`]+)`/.exec(value)?.[1];
  const raw = backtick ?? value;
  return raw
    .replace(/\[[^\]]+\]\([^)]*\)/g, "")
    .replace(/[`*~]/g, "")
    .replace(/^\s+|\s+$/g, "")
    .split(/\s+[—–(:]/, 1)[0]!
    .trim();
}

function visibleLines(lines: string[]): string[] {
  const out = [...lines];
  let inFence = false;
  let inComment = false;
  let inFrontmatter = lines[0]?.trim() === "---";
  for (let index = 0; index < lines.length; index++) {
    const raw = lines[index] ?? "";
    if (inFrontmatter) {
      out[index] = "";
      if (index > 0 && raw.trim() === "---") inFrontmatter = false;
      continue;
    }
    if (/^\s*(```|~~~)/.test(raw)) {
      inFence = !inFence;
      out[index] = "";
      continue;
    }
    if (inFence) {
      out[index] = "";
      continue;
    }
    let line = raw;
    if (inComment) {
      const end = line.indexOf("-->");
      if (end < 0) {
        out[index] = "";
        continue;
      }
      line = line.slice(end + 3);
      inComment = false;
    }
    while (line.includes("<!--")) {
      const start = line.indexOf("<!--");
      const end = line.indexOf("-->", start + 4);
      if (end < 0) {
        line = line.slice(0, start);
        inComment = true;
        break;
      }
      line = line.slice(0, start) + line.slice(end + 3);
    }
    out[index] = line;
  }
  return out;
}

function splitMarkdownRow(line: string): string[] {
  const source = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let current = "";
  let escaped = false;
  let inCode = false;
  for (const char of source) {
    if (escaped) {
      current += char;
      escaped = false;
    } else if (char === "\\") {
      current += char;
      escaped = true;
    } else if (char === "`") {
      inCode = !inCode;
      current += char;
    } else if (char === "|" && !inCode) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function isTableLine(line: string): boolean {
  return /^\s*\|.*\|\s*$/.test(line);
}

function isSeparatorRow(line: string): boolean {
  if (!isTableLine(line)) return false;
  const cells = splitMarkdownRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function stripHash(anchor: string): string {
  return anchor.replace(/^#/, "");
}

function canonicalAnchor(anchor: string, aliases: Map<string, string>): string {
  let current = stripHash(anchor);
  const seen = new Set<string>();
  while (aliases.has(current) && !seen.has(current)) {
    seen.add(current);
    current = aliases.get(current)!;
  }
  return current;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/§/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function headingKey(heading: ParsedHeading): string {
  return `${heading.anchor}|${normalizeCell(heading.title)}`;
}

function tableRowKey(row: ParsedTableRow): string {
  return `${row.anchor}|${row.header.map(normalizeCell).join("|")}|${row.cells.map(normalizeCell).join("|")}`;
}
