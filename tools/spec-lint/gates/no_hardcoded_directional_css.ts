/**
 * Gate: `no_hardcoded_directional_css`
 *
 * Assertion: spec-authored CSS / TSX style declarations use logical
 * properties. Physical left/right styles require the §37.3 allow-list.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, fenceMask } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const GATE_ID = "no_hardcoded_directional_css";

const SOURCE_DIRS = ["app", "src", "components", "pages", "styles", "ui", "packages"];
const SOURCE_EXT = new Set([".css", ".scss", ".sass", ".less", ".tsx", ".jsx"]);

const DECLARATION_PATTERNS = [
  /\b(?:margin|padding|border|inset|scroll-margin|scroll-padding)-(?:left|right)\s*:/i,
  /\b(?:left|right)\s*:/i,
  /\b(?:margin|padding|border|inset|scrollMargin|scrollPadding)(?:Left|Right)\s*:/,
  /\btext-align\s*:\s*(?:left|right)\b/i,
  /\b(?:float|clear)\s*:\s*(?:left|right)\b/i,
] as const;

const CLASS_PATTERNS = [
  /\b(?:left|right)-[A-Za-z0-9_\-[\]/:.]+/,
  /\b(?:ml|mr|pl|pr)-[A-Za-z0-9_\-[\]/:.]+/,
  /\bborder-(?:l|r)(?:-[A-Za-z0-9_\-[\]/:.]+)?\b/,
  /\brounded-(?:l|r|tl|tr|bl|br)(?:-[A-Za-z0-9_\-[\]/:.]+)?\b/,
  /\b(?:text|float|clear|origin)-(?:left|right)\b/,
] as const;

const REQUIRED_37_3_TOKENS = [
  "#### 37.3.1 Directional CSS Allow-List",
  "| `canvas_coordinate_grid` |",
  "| `geospatial_map_viewport` |",
  "| `pdf_page_coordinate_overlay` |",
  "All other layout, spacing, alignment, positioning, borders, and animation styles MUST use logical CSS properties",
  "Any CSS / TSX declaration that uses physical `left` / `right` MUST carry an allow-list token",
] as const;

const REQUIRED_38_11_TOKENS = [
  "CSS logical-property enforcement is validated by `no_hardcoded_directional_css`",
  "runtime mirroring remains owned by `rtl_directionality_runtime_contract`",
] as const;

const REQUIRED_M5_TOKENS = [
  "**`runtime_active`**",
  `tools/spec-lint/gates/${GATE_ID}.ts`,
  "verified PASS on live Master Spec, UX spec, source-tree scan, and pass/fail fixtures",
  "spec / UX style snippets and CSS/TSX files present in this repository",
  "product runtime RTL behavior remains owned by `rtl_directionality_runtime_contract`",
] as const;

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: line > 0 ? anchorForLine(doc, line) : undefined,
    matched_text: matched,
    message,
  });
}

function sectionText(doc: SpecDoc, anchor: string): { text: string; startLine: number; endLine: number } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    startLine: section.startLine,
    endLine: section.endLine,
  };
}

function requireTokens(
  findings: Finding[],
  doc: SpecDoc,
  scope: { text: string; startLine: number } | null,
  label: string,
  tokens: readonly string[],
) {
  if (!scope) {
    push(findings, doc, 0, label, `${label} section is missing.`);
    return;
  }
  for (const token of tokens) {
    if (!scope.text.includes(token)) push(findings, doc, scope.startLine, token, `${label} is missing required token: ${token}`);
  }
}

function allowListIds(doc: SpecDoc, findings: Finding[]): Set<string> {
  const scope = sectionText(doc, "37.3.1-directional-css-allow-list");
  const ids = new Set<string>();
  if (!scope) {
    push(findings, doc, 0, "37.3.1 Directional CSS Allow-List", "§37.3.1 Directional CSS Allow-List is missing.");
    return ids;
  }
  for (let line = scope.startLine; line <= scope.endLine; line += 1) {
    const raw = doc.lines[line] ?? "";
    const match = /^\|\s*`([^`]+)`\s*\|/.exec(raw.trim());
    if (match && match[1] !== "allow_list_id") ids.add(match[1]);
  }
  if (ids.size === 0) push(findings, doc, scope.startLine, "allow_list_id", "§37.3.1 allow-list has no registered IDs.");
  return ids;
}

function physicalDeclaration(text: string): string | null {
  for (const re of DECLARATION_PATTERNS) {
    const match = re.exec(text);
    if (match) return match[0];
  }
  return null;
}

function codeSegments(line: string, inFence: boolean): string[] {
  if (inFence) return [line];
  const segments = [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  if (/\b(?:className|class|style|tw)=|clsx\(|cva\(|style=\{\{/.test(line)) segments.push(line);
  return segments;
}

function physicalClass(text: string): string | null {
  for (const re of CLASS_PATTERNS) {
    const match = re.exec(text);
    if (match) return match[0];
  }
  return null;
}

function allowIdOnLine(line: string): string | null {
  return /@directional-css-allow:([a-z0-9_]+)/.exec(line)?.[1] ?? null;
}

function lineIsAllowListSection(line: number, allowScope: { startLine: number; endLine: number } | null): boolean {
  return !!allowScope && line >= allowScope.startLine && line <= allowScope.endLine;
}

function markdownFindings(doc: SpecDoc, allowedIds: Set<string>): Finding[] {
  const findings: Finding[] = [];
  const mask = fenceMask(doc);
  const allowScope = sectionText(doc, "37.3.1-directional-css-allow-list");

  for (let line = 1; line < doc.lines.length; line += 1) {
    if (lineIsAllowListSection(line, allowScope)) continue;
    const raw = doc.lines[line] ?? "";
    const allowId = allowIdOnLine(raw);
    if (allowId && !allowedIds.has(allowId)) {
      push(findings, doc, line, allowId, `Directional CSS allow-list token \`${allowId}\` is not registered in §37.3.1.`);
      continue;
    }
    if (allowId && allowedIds.has(allowId)) continue;

    for (const segment of codeSegments(raw, mask[line])) {
      const decl = physicalDeclaration(segment);
      if (decl) {
        push(findings, doc, line, decl, "Physical left/right CSS declaration must use logical properties or carry a registered @directional-css-allow token.");
        break;
      }
      const cls = physicalClass(segment);
      if (cls) {
        push(findings, doc, line, cls, "Physical left/right utility class must use logical utilities or carry a registered @directional-css-allow token.");
        break;
      }
    }
  }

  return findings;
}

function sourceRoot(doc: SpecDoc): string {
  return resolve(dirname(doc.path || "."));
}

function ext(path: string): string {
  const dot = path.lastIndexOf(".");
  return dot >= 0 ? path.slice(dot) : "";
}

function sourceFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      const rel = relative(root, path);
      if (rel.includes("node_modules") || rel.includes("tools/spec-lint/fixtures")) continue;
      const st = statSync(path);
      if (st.isDirectory()) {
        walk(path);
      } else if (SOURCE_EXT.has(ext(path))) {
        out.push(path);
      }
    }
  };
  for (const dir of SOURCE_DIRS) {
    const path = join(root, dir);
    if (existsSync(path) && statSync(path).isDirectory()) walk(path);
  }
  return out;
}

function sourceTreeFindings(doc: SpecDoc, allowedIds: Set<string>): Finding[] {
  const findings: Finding[] = [];
  for (const file of sourceFiles(sourceRoot(doc))) {
    const lines = readFileSync(file, "utf-8").split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const raw = lines[i] ?? "";
      const allowId = allowIdOnLine(raw);
      if (allowId && !allowedIds.has(allowId)) {
        findings.push({ file, line: i + 1, matched_text: allowId, message: `Directional CSS allow-list token \`${allowId}\` is not registered in §37.3.1.` });
        continue;
      }
      if (allowId && allowedIds.has(allowId)) continue;
      const decl = physicalDeclaration(raw) ?? physicalClass(raw);
      if (decl) {
        findings.push({ file, line: i + 1, matched_text: decl, message: "Physical left/right CSS or utility style must use logical properties or carry a registered @directional-css-allow token." });
      }
    }
  }
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const rowLine = doc.lines.findIndex((line) => line.trim().startsWith(`| \`${GATE_ID}\` |`));
  if (rowLine < 0) {
    push(findings, doc, 0, GATE_ID, `§M.5 row ${GATE_ID} is missing.`);
    return findings;
  }
  const row = doc.lines[rowLine] ?? "";
  for (const token of REQUIRED_M5_TOKENS) {
    if (!row.includes(token)) push(findings, doc, rowLine, token, `§M.5 ${GATE_ID} row is missing required runtime evidence token: ${token}`);
  }
  return findings;
}

function unique(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  return findings.filter((finding) => {
    const key = `${finding.file}:${finding.line}:${finding.matched_text}:${finding.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "Phase 37 P1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "default_ci_gate_override",
  inputs: { masterSpec: true, uxSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    requireTokens(findings, doc, sectionText(doc, "37.3-right-to-left-(rtl)-support"), "§37.3 RTL Support", REQUIRED_37_3_TOKENS);
    requireTokens(findings, doc, sectionText(doc, "38.11-right-to-left-and-locale-mirror-behavior"), "§38.11 RTL Mirror Behavior", REQUIRED_38_11_TOKENS);
    const allowedIds = allowListIds(doc, findings);
    findings.push(...markdownFindings(doc, allowedIds));
    if (ctx.uxSpec) findings.push(...markdownFindings(ctx.uxSpec, allowedIds));
    else push(findings, doc, 0, "UX_Design_of_Sourcera.md", "UX spec is required for no_hardcoded_directional_css.");
    findings.push(...sourceTreeFindings(doc, allowedIds));
    findings.push(...m5Findings(doc));
    return unique(findings);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
