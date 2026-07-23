import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Finding, SourceRequirement } from "./model.js";

const SOURCE_DOCS: Record<string, string> = {
  master_spec: "Sourcera_Master_Spec.md",
  ux_design: "UX_Design_of_Sourcera.md",
  buyer_pricing: "Sourcera_Buyer_Pricing_Strategy.md",
  seller_pricing: "Sourcera_Seller_Pricing_Strategy.md",
  linear_planning: "delivery/planning-source-register.md",
  kb_eng:
    "_baselines/retired-sources/KB_Engineering_Spec_retired_2026-04-26.md",
};

function cells(line: string): string[] {
  return line
    .split(/(?<!\\)\|/)
    .slice(1, -1)
    .map((value) => value.trim().replace(/\\\|/g, "|"));
}

function list(value: string): string[] {
  if (!value || value === "—") return [];
  return [...value.matchAll(/F-(?:AE-|BC-)?\d+/g)].map(
    (match) => match[0],
  );
}

function unique(rows: SourceRequirement[]): SourceRequirement[] {
  const seen = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.requirementId)) {
      throw new Error(`Duplicate requirement_id ${row.requirementId}`);
    }
    seen.add(row.requirementId);
  }
  return rows;
}

export function parseFeatureInventory(markdown: string): SourceRequirement[] {
  const rows: SourceRequirement[] = [];
  for (const line of markdown.split(/\r?\n/)) {
    if (!/^\|\s*F-(?:AE-|BC-)?\d+\s*\|/.test(line)) continue;
    const [
      id,
      name,
      ,
      section,
      ,
      sourceDoc,
      version,
      ,
      dependencies,
    ] = cells(line);
    rows.push({
      requirementId: id,
      outcome: name,
      sourceDoc: SOURCE_DOCS[sourceDoc] ?? sourceDoc,
      sourceVersion: version,
      section,
      dependencies: list(dependencies),
      disposition: "executable",
    });
  }
  if (!rows.length) throw new Error("Feature inventory contains no requirement rows");
  return unique(rows);
}

export function parseRuntimeGate(json: string): SourceRequirement[] {
  const parsed = JSON.parse(json) as {
    findings?: Array<{
      id: string;
      file: string;
      line: number;
      severity?: string;
    }>;
  };
  const rows = (parsed.findings ?? [])
    .filter((finding) => !finding.severity || finding.severity === "blocker")
    .map((finding) => ({
      requirementId: `RG:${finding.id}`,
      outcome: `Prove runtime gate ${finding.id}`,
      sourceDoc: finding.file,
      sourceVersion: "live",
      section: `line:${finding.line}`,
      dependencies: [],
      disposition: "proof_only" as const,
    }));
  return unique(rows);
}

export function sourceReferenceFindings(
  rows: SourceRequirement[],
  root: string,
): Finding[] {
  const findings: Finding[] = [];
  for (const row of rows) {
    if (!row.sourceVersion || !row.section) {
      findings.push({
        code: "source_not_pinned",
        requirementId: row.requirementId,
        message: `${row.requirementId} lacks version or section`,
      });
    }
    if (!existsSync(resolve(root, row.sourceDoc))) {
      findings.push({
        code: "source_file_missing",
        requirementId: row.requirementId,
        message: `${row.sourceDoc} does not exist`,
      });
    }
  }
  return findings;
}
