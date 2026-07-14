#!/usr/bin/env node
/** §M.4.2 Appendix M coverage detector. */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ConceptClass, DetectedConcept } from "./cross_validation.js";
import {
  identifier,
  normalizeCell,
  parseSpec,
  readPreEditSpec,
  structuralDiff,
  type AnchorAlias,
  type InlineGateReference,
  type ParsedHeading,
  type ParsedTableRow,
} from "./appendix_m_diff_core.js";

export interface CoverageConcept extends DetectedConcept {
  coveredByAppendixM: boolean;
}

export interface CoverageResult {
  gate_id: "appendix_m_coverage_on_diff";
  outcome: "pass" | "needs_coverage" | "orphan_inline_gate_reference";
  triggered_concepts: CoverageConcept[];
  orphan_inline_gate_references: Array<{ gateId: string; line: number; anchor: string }>;
  stats: { triggered_count: number; uncovered_count: number; orphan_gate_reference_count: number };
}

const INFRA_FIELDS = new Set([
  "id", "org_id", "console", "created_at", "updated_at", "created_by", "updated_by", "deleted_at",
]);

export function detectCoverage(
  preText: string,
  postText: string,
  aliases: AnchorAlias[] = [],
): CoverageResult {
  const pre = parseSpec(preText, aliases);
  const post = parseSpec(postText, aliases);
  const changes = structuralDiff(preText, postText, aliases);
  const addedHeadingLines = new Set(changes.filter((item) => item.kind === "heading").map((item) => item.line));
  const addedRowLines = new Set(changes.filter((item) => item.kind === "table_row").map((item) => item.line));
  const addedRefLines = new Set(changes.filter((item) => item.kind === "inline_gate_reference").map((item) => item.line));
  const concepts = new Map<string, CoverageConcept>();

  const add = (conceptClass: ConceptClass, conceptName: string, anchor: string, line: number, covered?: boolean) => {
    const cleanName = identifier(conceptName);
    if (!cleanName) return;
    const key = `${conceptClass}::${cleanName}@${anchor}`;
    concepts.set(key, {
      conceptName: cleanName,
      conceptClass,
      specAnchor: anchor,
      specLineNumber: line,
      coveredByAppendixM: covered ?? hasM1Coverage(cleanName, post.m1ConceptCells),
    });
  };

  for (const heading of post.headings.filter((item) => addedHeadingLines.has(item.line))) {
    detectHeadingConcepts(heading, post.lines, add);
  }
  for (const row of post.tableRows.filter((item) => addedRowLines.has(item.line))) {
    detectRowConcepts(row, pre.tableRows, add);
  }

  const orphanRefs: CoverageResult["orphan_inline_gate_references"] = [];
  for (const ref of post.inlineGateReferences.filter((item) => addedRefLines.has(item.line))) {
    const covered = post.gateIds.has(ref.gateId);
    add("named_ci_gate", ref.gateId, ref.anchor, ref.line, covered);
    if (!covered) orphanRefs.push({ gateId: ref.gateId, line: ref.line, anchor: ref.anchor });
  }

  const triggered = [...concepts.values()].sort((a, b) => a.specLineNumber - b.specLineNumber || a.conceptClass.localeCompare(b.conceptClass));
  const uncovered = triggered.filter((item) => !item.coveredByAppendixM && item.conceptClass !== "named_ci_gate");
  return {
    gate_id: "appendix_m_coverage_on_diff",
    outcome: orphanRefs.length ? "orphan_inline_gate_reference" : uncovered.length ? "needs_coverage" : "pass",
    triggered_concepts: triggered,
    orphan_inline_gate_references: orphanRefs,
    stats: {
      triggered_count: triggered.length,
      uncovered_count: uncovered.length,
      orphan_gate_reference_count: orphanRefs.length,
    },
  };
}

function detectHeadingConcepts(
  heading: ParsedHeading,
  lines: string[],
  add: (conceptClass: ConceptClass, name: string, anchor: string, line: number, covered?: boolean) => void,
): void {
  const anchor = heading.anchor;
  const title = heading.title.replace(/^\d+(?:\.\d+)*\s+/, "").trim();
  const body = lines.slice(heading.line, heading.endLine).join("\n");
  if (/^4-[2-8]-\d/.test(anchor) && /\|\s*Field\s*\|\s*Type\s*\|/i.test(body)) {
    add("entity", title, `#${anchor}`, heading.line);
  }
  const numeric = /^(\d+)-/.exec(anchor)?.[1];
  if (numeric && Number(numeric) >= 13 && Number(numeric) <= 30 && /Acceptance Criteria|Implementation contract|Plan tier/i.test(body)) {
    add("capability_non_ai", title, `#${anchor}`, heading.line);
  }
  if (/^(6-8|22-20|44-6)/.test(anchor) && /\b(Free|Solo|Starter|Growth|Scale|Enterprise|plan tier)\b/i.test(body)) {
    add("plan_tier_feature", title, `#${anchor}`, heading.line);
  }
  if (/^29-\d/.test(anchor)) add("notification_event", title, `#${anchor}`, heading.line);
  const endpoint = /\b(GET|POST|PUT|PATCH|DELETE)\s+(\/v1\/\S+)/i.exec(heading.title);
  if (/^32-/.test(anchor) && endpoint) add("api_endpoint", `${endpoint[1]!.toUpperCase()} ${endpoint[2]}`, `#${anchor}`, heading.line);
}

function detectRowConcepts(
  row: ParsedTableRow,
  preRows: ParsedTableRow[],
  add: (conceptClass: ConceptClass, name: string, anchor: string, line: number, covered?: boolean) => void,
): void {
  const header = row.header.map(normalizeCell);
  const anchor = row.anchor;
  const first = identifier(row.cells[0] ?? "");
  const cell = (name: string) => row.cells[header.indexOf(name)] ?? "";

  if (/^#4-[2-8]-/.test(anchor) && ["field", "type", "constraints", "notes"].every((name) => header.includes(name))) {
    if (first && !INFRA_FIELDS.has(first)) add("entity_field", first, anchor, row.line);
  }
  if (/^#4-8-2/.test(anchor) && header.some((name) => name.includes("capability"))) {
    add("aioperation", cell("capability_id") || first, anchor, row.line);
  }
  if (/^#5-11/.test(anchor) || (/^#(21-4|22-10)/.test(anchor) && header.some((name) => /tool|capability/.test(name)))) {
    add("capability_non_ai", first, anchor, row.line);
  }
  if (/^#appendix-j/.test(anchor) && header.includes("value")) add("enum_value", cell("value") || first, anchor, row.line);
  if (/^#appendix-(a|d|e|l)/.test(anchor) && ["from", "to", "trigger", "conditions", "notes"].every((name) => header.includes(name))) {
    const toState = identifier(cell("to"));
    const priorStates = new Set(preRows.filter((candidate) => candidate.anchor === anchor).flatMap((candidate) => [identifier(candidate.cells[0] ?? ""), identifier(candidate.cells[1] ?? "")]));
    if (toState && !priorStates.has(toState)) add("state_machine_state", toState, anchor, row.line);
  }
  if (/^#(5-11|34-1|34-8|34-13|39)/.test(anchor)) add("plan_tier_feature", first, anchor, row.line);
  if (/^#31/.test(anchor) && header.some((name) => name === "event_kind" || name === "event kind")) {
    add("webhook_event", cell("event_kind") || cell("event kind") || first, anchor, row.line);
  }
  if (/^#appendix-c/.test(anchor)) {
    const kind = normalizeCell(cell("kind"));
    if (kind === "notification") add("notification_event", cell("event_kind") || cell("event kind") || first, anchor, row.line);
    else if (header.some((name) => name === "event_kind" || name === "event kind")) add("webhook_event", cell("event_kind") || cell("event kind") || first, anchor, row.line);
  }
  if (/^#appendix-g/.test(anchor) && header.some((name) => name === "event_name" || name === "event name")) {
    add("posthog_event", cell("event_name") || cell("event name") || first, anchor, row.line);
  }
  if (/^#51/.test(anchor) && header.some((name) => name.includes("event"))) add("posthog_event", first, anchor, row.line);
  if (/^#32-(5|8|9)/.test(anchor) && header.some((name) => /endpoint|path|method/.test(name))) add("api_endpoint", row.cells.slice(0, 2).map(identifier).join(" "), anchor, row.line);
}

function hasM1Coverage(conceptName: string, cells: string[]): boolean {
  const needle = normalizeCell(conceptName).replace(/[^a-z0-9]+/g, " ").trim();
  if (!needle) return false;
  return cells.some((cell) => {
    const haystack = normalizeCell(cell).replace(/[^a-z0-9]+/g, " ").trim();
    return haystack === needle || haystack.startsWith(`${needle} `) || haystack.includes(` ${needle} `);
  });
}

interface CliArgs {
  postEditSpec: string;
  preEditSpec?: string;
  mergeBaseSha?: string;
  anchorAliases: string;
  emitTriggered?: string;
  emitParseError?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const out: CliArgs = {
    postEditSpec: "Sourcera_Master_Spec.md",
    anchorAliases: "tools/spec-lint/anchor_aliases.json",
  };
  for (let index = 0; index < argv.length; index++) {
    const key = argv[index]!;
    const value = argv[++index];
    if (key === "--post-edit-spec" || key === "--spec") out.postEditSpec = value!;
    else if (key === "--pre-edit-spec") out.preEditSpec = value;
    else if (key === "--merge-base-sha") out.mergeBaseSha = value;
    else if (key === "--anchor-aliases") out.anchorAliases = value!;
    else if (key === "--emit-triggered-concepts") out.emitTriggered = value;
    else if (key === "--emit-parse-error") out.emitParseError = value;
    else if (["--pr-id", "--commit-sha"].includes(key)) { /* accepted audit metadata */ }
    else throw new Error(`unknown argument: ${key}`);
  }
  return out;
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  try {
    if (!existsSync(args.postEditSpec)) throw new Error(`post-edit spec not found: ${args.postEditSpec}`);
    const post = readFileSync(resolve(args.postEditSpec), "utf-8");
    const pre = readPreEditSpec(args.postEditSpec, args.preEditSpec, args.mergeBaseSha);
    const aliases = JSON.parse(readFileSync(resolve(args.anchorAliases), "utf-8")) as AnchorAlias[];
    const result = detectCoverage(pre, post, aliases);
    const json = `${JSON.stringify(result, null, 2)}\n`;
    process.stdout.write(json);
    if (args.emitTriggered) writeFileSync(resolve(args.emitTriggered), json, "utf-8");
  } catch (error) {
    const payload = {
      gate_id: "appendix_m_coverage_on_diff",
      outcome: "parse_error",
      message: error instanceof Error ? error.message : String(error),
    };
    const json = `${JSON.stringify(payload, null, 2)}\n`;
    if (args.emitParseError) writeFileSync(resolve(args.emitParseError), json, "utf-8");
    process.stderr.write(json);
    process.exitCode = 2;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
