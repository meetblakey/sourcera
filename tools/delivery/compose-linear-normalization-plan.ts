#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  openSync,
  readFileSync,
  realpathSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";

type InputRole = "base" | "overlay" | "append";

interface InputSpec {
  path: string;
  role: InputRole;
}

interface Arguments {
  expectedUpdates: number | null;
  inputs: InputSpec[];
  out: string;
  publicationOut: string;
}

interface NormalizedUpdate {
  before?: {
    descriptionSha256: string;
  };
  classification?: string;
  description: string;
  diagnostics?: Record<string, unknown>;
  issueId: string;
  source?: Record<string, unknown>;
  title: string;
}

interface SourceReceipt {
  path: string;
  role: InputRole;
  sha256: string;
  updateCount: number;
}

const ISSUE_ID = /^(?:PLA|BUY|SEL|INT)-([1-9]\d*)$/;
const PUBLICATION_TITLE_DEFECTS: Array<[string, RegExp]> = [
  ["manual source section reference", /§\s*[A-Z0-9]/i],
  ["retired or stale title", /\b(?:Evaluation Lead Role|Evaluator Role|Scorer Role|Seller Team (?:Owner|Lead|Member) Role|Pipeline Phase Mapping Correction|Drift Override Paragraphs)\b/i],
  ["obsolete roadmap framing", /\b(?:Known Limitations\s*&\s*Phase 2 Roadmap|Data Residency\s*&\s*Compliance Roadmap)\b/i],
];
const PUBLICATION_PROSE_DEFECTS: Array<[string, RegExp]> = [
  ["manual Linear or source identifier", /\b(?:PLA|BUY|SEL|INT)-\d+\b|\bF-(?:AE-|BC-)?\d+(?:\.[A-Z0-9]+)*\b|\b(?:SG|SR)-[A-Z0-9-]+\b|https?:\/\/linear\.app\/|<issue\b|\bSource family\s*:/i],
  ["manual acceptance-criteria reference", /\b(?:AC|Acceptance Criteria)\s*#\d+[a-z]?\b/i],
  ["manual remediation-closure reference", /\bR-\d{2}\s+closure\b/i],
  ["manual source-pack reference", /\bR\d+--[A-Z0-9-]+\b|\bAE--\d+\b/i],
  ["planning-history fragment", /\b(?:V\d+(?:\.\d+)*|Phase \d+(?:\.\d+)*)\s+(?:closure|residual closeout|supersedes)\b|\bV\d+\s+(?:—|add\b)|\bPhase\s+(?:1[4-9]|[2-9]\d)(?:\.\d+|\.x)?\b|\bv\d+\s*→\s*v\d+\b|\bMS Baseline\b|\b(?:line|row) \d{3,}\b|\b#\d+\s+cascade\b|\b(?:this|same) pass\b|\bPromoted from prose\b|\bintroduced in Acceptance Criteria\b|\bHistorical KB\s*\/\s*Pricing Inputs\b|\bprior path\b/i],
  ["manual Linear planning prose", /\bExact Linear readback\b|\bLinear (?:readback|drift|relations?|status|fields?|metadata)\b|\bnative (?:dependency|relations?)\b|\bsource-level dependency edges\b|\babsence of legacy duplicates\b|\bplanned semantic child keys\b|\bLinear assigns different ids\b|\bwrite assigned ids\b/i],
  ["unresolved path placeholder", /\bthe named (?:implementation|test|proof) path\b/i],
  ["unresolved rollout or scope placeholder", /\bapplicable existing control\b|\bthe relevant (?:role|path|rule|section|contract|policy|test|proof)\b/i],
  ["source deferral", /\b(?:as|per) (?:specified|defined|documented) (?:in|by|at)\s+(?:the\s+)?(?:Master Spec|UX Design|Appendix|Acceptance Criteria)\b|\bcited (?:mechanic|row|section|source)\b/i],
  ["manual prompt or gap reference", /\bPer this prompt\b|\bGap\s+\d+(?:\.\d+)*\b/i],
  ["planning-status prose", /\bRequired missing artifacts?\b/i],
  ["dangling source phrase", /(?<!-)\b(?:in|through)\.(?=\s|$)/i],
  ["malformed source fragment", /\bDeliver Deliver\b|\bin\.0a\b|\bfor until\b|\bper the the\b|\bwhere is silent\b|consistent with\)\.|\b(?:is|are)\.(?=\s|$)|\b[a-z][a-z0-9_]*\\[a-z][a-z0-9_]*\b|\+\s*AC\.|-\s*equivalent compliance|after,,|ownership\.,,,|Assumption:,,|\/\/\s*producer chain|node_modules\.bin|\band\s+'s\b|^\s*[,;:]|Source binding\.\s*\*/im],
];

function usage(): string {
  return `Usage: compose-linear-normalization-plan [inputs] --out <path> --publication-out <path> [options]

Inputs:
  --base <path>       One required base plan. Duplicate IDs are rejected.
  --overlay <path>    Replaces matching base rows; may also add rows. Repeatable.
  --append <path>     Adds disjoint rows only. Repeatable.

Options:
  --expected-updates <count>  Fail unless the final exact update count matches.
  --help                      Show this help.

The publication output contains only issueId, title, description, and hashes. Native Linear fields and relations are never included.
`;
}

function argumentsOf(values: string[]): Arguments {
  if (values.includes("--help") || values.includes("-h")) {
    process.stdout.write(usage());
    process.exit(0);
  }
  if (values.length % 2 !== 0) throw new Error("Every argument needs a value");
  const inputs: InputSpec[] = [];
  let out: string | null = null;
  let publicationOut: string | null = null;
  let expectedUpdates: number | null = null;
  for (let index = 0; index < values.length; index += 2) {
    const name = values[index];
    const value = values[index + 1]?.trim();
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${name}`);
    if (name === "--base" || name === "--overlay" || name === "--append") {
      inputs.push({ path: resolve(value), role: name.slice(2) as InputRole });
    } else if (name === "--out") {
      if (out) throw new Error("Duplicate --out");
      out = resolve(value);
    } else if (name === "--publication-out") {
      if (publicationOut) throw new Error("Duplicate --publication-out");
      publicationOut = resolve(value);
    } else if (name === "--expected-updates") {
      if (expectedUpdates !== null) throw new Error("Duplicate --expected-updates");
      if (!/^[1-9]\d*$/.test(value)) throw new Error("--expected-updates must be a positive integer");
      expectedUpdates = Number(value);
    } else {
      throw new Error(`Unsupported argument ${name}`);
    }
  }
  if (inputs.filter((input) => input.role === "base").length !== 1) {
    throw new Error("Exactly one --base plan is required");
  }
  if (!out || !publicationOut) throw new Error("--out and --publication-out are required");
  if (out === publicationOut) throw new Error("--out and --publication-out must differ");
  return { expectedUpdates, inputs, out, publicationOut };
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function nonEmpty(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function exactDescription(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function jsonFile(path: string): { raw: string; value: Record<string, unknown> } {
  if (!existsSync(path)) throw new Error(`Input is missing: ${path}`);
  const real = realpathSync(path);
  const raw = readFileSync(real, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Input is invalid JSON (${real}): ${error instanceof Error ? error.message : String(error)}`);
  }
  const value = asRecord(parsed);
  if (!Array.isArray(value.updates)) throw new Error(`Input lacks updates array: ${real}`);
  return { raw, value };
}

function normalizeUpdate(raw: unknown, path: string, index: number): NormalizedUpdate {
  const row = asRecord(raw);
  const after = asRecord(row.after);
  const payload = asRecord(row.updatePayload);
  const issueId = nonEmpty(row.issueId) ?? nonEmpty(row.lookupId);
  const title = nonEmpty(after.title) ?? nonEmpty(row.title) ?? nonEmpty(payload.title);
  const description = exactDescription(after.description) ?? exactDescription(row.description) ?? exactDescription(payload.description);
  if (!issueId || !ISSUE_ID.test(issueId)) {
    throw new Error(`${path} update ${index + 1} has an invalid issue ID`);
  }
  if (!title || !description) {
    throw new Error(`${path} ${issueId} lacks an exact title or description`);
  }
  if (/^\s*\[[^\]]+\]/.test(title)) {
    throw new Error(`${path} ${issueId} retains a manual title prefix`);
  }
  const titleDefect = PUBLICATION_TITLE_DEFECTS.find(([, pattern]) => pattern.test(title));
  if (titleDefect) {
    throw new Error(`${path} ${issueId} retains ${titleDefect[0]}: ${title}`);
  }
  const proseWithoutCode = description
    .replace(/```[\s\S]*?```/g, "code_token")
    .replace(/`[^`\n]*`/g, "code_token");
  const proseDefect = PUBLICATION_PROSE_DEFECTS
    .map(([label, pattern]) => [
      label,
      pattern.exec(label === "malformed source fragment" ? proseWithoutCode : description),
    ] as const)
    .find(([, match]) => match !== null);
  if (proseDefect) {
    const [label, match] = proseDefect;
    const at = match?.index ?? 0;
    const context = description.slice(Math.max(0, at - 80), Math.min(description.length, at + 160))
      .replace(/\s+/g, " ");
    throw new Error(`${path} ${issueId} retains ${label}: ${context}`);
  }
  const declaredFields = row.fieldsToWrite;
  if (declaredFields !== undefined && (
    !Array.isArray(declaredFields) ||
    declaredFields.length !== 2 ||
    declaredFields[0] !== "title" ||
    declaredFields[1] !== "description"
  )) {
    throw new Error(`${path} ${issueId} declares fields other than title and description`);
  }
  if (row.preserveNativeFieldsAndRelations !== undefined && row.preserveNativeFieldsAndRelations !== true) {
    throw new Error(`${path} ${issueId} does not preserve native Linear fields and relations`);
  }
  const normalized: NormalizedUpdate = { description, issueId, title };
  const before = asRecord(row.before);
  const beforeDescriptionSha256 = nonEmpty(before.descriptionSha256);
  if (before.descriptionSha256 !== undefined && !/^[a-f0-9]{64}$/.test(beforeDescriptionSha256 ?? "")) {
    throw new Error(`${path} ${issueId} has an invalid prior description SHA-256`);
  }
  if (beforeDescriptionSha256) {
    normalized.before = { descriptionSha256: beforeDescriptionSha256 };
  }
  const classification = nonEmpty(row.classification);
  if (classification) normalized.classification = classification;
  if (Object.keys(asRecord(row.diagnostics)).length > 0) normalized.diagnostics = asRecord(row.diagnostics);
  if (Object.keys(asRecord(row.source)).length > 0) normalized.source = asRecord(row.source);
  return normalized;
}

function compareIssueIds(left: string, right: string): number {
  const teamOrder = new Map([["PLA", 0], ["BUY", 1], ["SEL", 2], ["INT", 3]]);
  const [leftTeam, leftNumber] = left.split("-");
  const [rightTeam, rightNumber] = right.split("-");
  return (teamOrder.get(leftTeam) ?? 99) - (teamOrder.get(rightTeam) ?? 99) ||
    Number(leftNumber) - Number(rightNumber);
}

function atomicWrite(path: string, value: string): void {
  const temporary = resolve(dirname(path), `.${randomUUID()}.linear-compose.tmp`);
  let descriptor: number | null = null;
  try {
    descriptor = openSync(temporary, "wx", 0o600);
    writeFileSync(descriptor, value, "utf8");
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = null;
    renameSync(temporary, path);
  } catch (error) {
    if (descriptor !== null) closeSync(descriptor);
    if (existsSync(temporary)) unlinkSync(temporary);
    throw error;
  }
}

function main(): void {
  const args = argumentsOf(process.argv.slice(2));
  const updatesById = new Map<string, NormalizedUpdate>();
  const baseIds = new Set<string>();
  const overlayIds = new Set<string>();
  const receipts: SourceReceipt[] = [];
  let baseUpdateCount = 0;
  let overlaidBaseCount = 0;
  let addedOverlayCount = 0;
  let appendedCount = 0;

  for (const input of args.inputs) {
    const { raw, value } = jsonFile(input.path);
    const updates = (value.updates as unknown[]).map((row, index) => normalizeUpdate(row, input.path, index));
    const localIds = new Set<string>();
    for (const update of updates) {
      if (localIds.has(update.issueId)) throw new Error(`${input.path} duplicates ${update.issueId}`);
      localIds.add(update.issueId);
      if (input.role === "base") {
        if (updatesById.has(update.issueId)) throw new Error(`Base duplicates ${update.issueId}`);
        updatesById.set(update.issueId, update);
        baseIds.add(update.issueId);
        baseUpdateCount += 1;
      } else if (input.role === "overlay") {
        if (overlayIds.has(update.issueId)) throw new Error(`Overlay inputs duplicate ${update.issueId}`);
        overlayIds.add(update.issueId);
        if (baseIds.has(update.issueId)) {
          const base = updatesById.get(update.issueId);
          if (
            base?.classification === "delivery_parent" &&
            (
              update.classification !== "delivery_parent" ||
              !/\bnon-executable (?:native )?(?:coordination|source) parent\b/i.test(update.description)
            )
          ) {
            throw new Error(`Overlay cannot replace coordination parent ${update.issueId} with an executable contract`);
          }
          overlaidBaseCount += 1;
        } else addedOverlayCount += 1;
        updatesById.set(update.issueId, update);
      } else {
        if (updatesById.has(update.issueId)) throw new Error(`Append input collides with ${update.issueId}`);
        updatesById.set(update.issueId, update);
        appendedCount += 1;
      }
    }
    receipts.push({ path: realpathSync(input.path), role: input.role, sha256: sha256(raw), updateCount: updates.length });
  }

  const updates = [...updatesById.values()].sort((left, right) => compareIssueIds(left.issueId, right.issueId));
  if (args.expectedUpdates !== null && updates.length !== args.expectedUpdates) {
    throw new Error(`Expected ${args.expectedUpdates} updates, composed ${updates.length}`);
  }
  const canonicalUpdates = `${JSON.stringify(updates)}\n`;
  const updatesSha256 = sha256(canonicalUpdates);
  const generatedAt = new Date().toISOString();
  const plan = {
    schemaVersion: 1,
    kind: "linear_normalization_composed_plan",
    generatedAt,
    sources: receipts,
    summary: {
      baseUpdateCount,
      overlaidBaseCount,
      addedOverlayCount,
      appendedCount,
      finalUpdateCount: updates.length,
      updatesSha256,
    },
    updates,
  };
  const publication = {
    schemaVersion: 1,
    kind: "linear_title_description_publication",
    generatedAt,
    sourceUpdatesSha256: updatesSha256,
    fieldsToWrite: ["title", "description"],
    preserveNativeFieldsAndRelations: true,
    updateCount: updates.length,
    updates: updates.map(({ issueId, title, description }) => ({
      issueId,
      title,
      description,
      titleSha256: sha256(title),
      descriptionSha256: sha256(description),
    })),
  };
  atomicWrite(args.out, `${JSON.stringify(plan, null, 2)}\n`);
  atomicWrite(args.publicationOut, `${JSON.stringify(publication, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(plan.summary)}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
