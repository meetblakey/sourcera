#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateGraph } from "./lib/graph.js";
import type {
  Disposition,
  ManifestRow,
  ReleaseDefinition,
  ReleaseId,
  SourceRequirement,
} from "./lib/model.js";
import { parseRuntimeGate } from "./lib/sources.js";

interface DetailedRequirement extends SourceRequirement {
  featureClass: string;
  summary: string;
}

interface DispositionOverride {
  requirementId: string;
  disposition: Disposition;
}

interface Assignment {
  requirementId: string;
  release: ReleaseId;
  rationale: string;
}

interface RuntimeGateDependency {
  requirementId: string;
  dependencies: string[];
}

const releaseSequence: Record<ReleaseId, number> = {
  R0: 0,
  R1: 1,
  R2: 2,
  R3: 3,
  R4: 4,
  R5: 5,
};

const releaseReason: Record<ReleaseId, string> = {
  R0: "Core defensible-evaluation path or prerequisite.",
  R1: "Team evaluation and collaboration after the single-buyer R0 path.",
  R2: "Repeatability, reporting, administration, or operating workflow.",
  R3: "Marketplace supply, discovery, matching, growth, or trust workflow.",
  R4: "Decision intelligence, scenarios, TCO, knowledge automation, or agents.",
  R5: "Enterprise integration, compliance, globalization, residency, or scale control.",
};

function cells(line: string): string[] {
  return line
    .split(/(?<!\\)\|/)
    .slice(1, -1)
    .map((value) => value.trim().replace(/\\\|/g, "|"));
}

function dependencies(value: string): string[] {
  if (!value || value === "—") return [];
  return [...value.matchAll(/F-(?:AE-|BC-)?\d+/g)].map((match) => match[0]);
}

function parseInventory(markdown: string): DetailedRequirement[] {
  const docs: Record<string, string> = {
    master_spec: "Sourcera_Master_Spec.md",
    ux_design: "UX_Design_of_Sourcera.md",
    buyer_pricing: "Sourcera_Buyer_Pricing_Strategy.md",
    seller_pricing: "Sourcera_Seller_Pricing_Strategy.md",
    kb_eng: "_baselines/retired-sources/KB_Engineering_Spec_retired_2026-04-26.md",
  };
  const rows: DetailedRequirement[] = [];
  for (const line of markdown.split(/\r?\n/)) {
    if (!/^\|\s*F-(?:AE-|BC-)?\d+\s*\|/.test(line)) continue;
    const [
      requirementId,
      outcome,
      featureClass,
      section,
      ,
      sourceDoc,
      sourceVersion,
      summary,
      dependencyText,
    ] = cells(line);
    rows.push({
      requirementId,
      outcome,
      featureClass,
      summary,
      sourceDoc: docs[sourceDoc] ?? sourceDoc,
      sourceVersion,
      section,
      dependencies: dependencies(dependencyText),
      disposition: "executable",
    });
  }
  return rows;
}

function sectionNumber(section: string): number | null {
  const match = section.match(/§(\d+)/);
  return match ? Number(match[1]) : null;
}

function classify(row: DetailedRequirement): ReleaseId {
  const text = `${row.outcome} ${row.featureClass} ${row.section} ${row.summary}`.toLowerCase();
  const section = sectionNumber(row.section);

  const fixedRelease = new Map<string, ReleaseId>([
    ["F-139", "R0"],
    ["F-140", "R0"],
    ["F-229", "R0"],
    ["F-389", "R0"],
    ["F-502", "R0"],
    ["F-612", "R0"],
    ["F-615", "R2"],
    ["F-637", "R0"],
    ["F-688", "R0"],
    ["F-752", "R0"],
  ]).get(row.requirementId);
  if (fixedRelease) return fixedRelease;

  if (row.requirementId === "F-004") return "R0";
  if (["F-608", "F-609", "F-610", "F-611"].includes(row.requirementId)) return "R2";

  if (
    /enterprise|saml|scim|single sign-on|sso\b|data residency|multi-region|regional failover|globalization|internationali[sz]ation|locali[sz]ation|locale|rtl\b|right-to-left|compliance certification|soc 2|iso 27001|hipaa|gdpr|data processing agreement|object size|scale test/.test(text) ||
    [31, 32, 33, 39, 47].includes(section ?? -1)
  ) return "R5";

  if (
    /\bagent\b|artificial intelligence|\bai\b|anthropic|claude|language model|model routing|scenario|simulation|\btco\b|total cost|organizational intelligence|decision intelligence|knowledge base|firecrawl|crawl|embedding|semantic retrieval|recommendation/.test(text) ||
    [14, 15, 16, 21, 22].includes(section ?? -1)
  ) return "R4";

  if (
    /marketplace|discovery|matching|promoted listing|promotion|seller profile|vendor profile|verification badge|capability declaration|vendor directory|supply|network effect|referral|trust signal|review moderation|abuse prevention/.test(text) ||
    [26, 27, 48].includes(section ?? -1)
  ) return "R3";

  if (
    /report|analytics|dashboard|administration|admin console|operations|support|billing|pricing|subscription|entitlement|invoice|retention|migration|import\b|template library|repeat|digest|settings|audit export|data portability/.test(text) ||
    [17, 19, 34, 36, 43].includes(section ?? -1)
  ) return "R2";

  if (
    /collaborat|comment|mention|presence|cursor|team governance|seller team|stakeholder|inbox|pulse|notification|q&a|question|real-time|realtime|concurrent|reviewer assignment|approval workflow/.test(text) ||
    [8, 9, 18, 20].includes(section ?? -1)
  ) return "R1";

  if (section === 2 && /§2\.6/.test(row.section)) return "R1";
  if (section === 2 && /§2\.7/.test(row.section)) return "R2";
  if (section === 3 && /§3\.3\.4/.test(row.section)) return "R4";
  if (section === 3 && /§3\.3\.5|§3\.9/.test(row.section)) return "R1";
  if (section === 3 && /§3\.3\.7/.test(row.section)) return "R2";
  if (section === 24 && !/nda|non-disclosure/.test(text)) return "R1";
  if (section === 29 && !/invitation|invite/.test(text)) return "R1";
  if (section === 37 && !/accessib|keyboard|focus|screen reader|contrast/.test(text)) return "R5";
  if (section === 40 && /import|migration/.test(text)) return "R2";
  if (section === 45 && /abuse|moderation|fraud|spam/.test(text)) return "R3";

  return "R0";
}

function argumentsByName(): Map<string, string> {
  const values = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 2) {
    const name = process.argv[index];
    const value = process.argv[index + 1];
    if (!name?.startsWith("--") || !value) throw new Error(`Invalid argument near ${name ?? "end"}`);
    values.set(name, value);
  }
  return values;
}

const argv = argumentsByName();
const root = resolve(argv.get("--root") ?? ".");
const inventoryPath = resolve(root, argv.get("--inventory") ?? "_audit/FEATURE_INVENTORY.md");
const stampPath = resolve(root, argv.get("--stamp") ?? "/tmp/sourcera-stamp.json");
const dispositionsPath = resolve(root, argv.get("--dispositions") ?? "delivery/dispositions.json");
const runtimeDependenciesPath = resolve(root, argv.get("--runtime-dependencies") ?? "delivery/runtime-gate-dependencies.json");
const releasesPath = resolve(root, argv.get("--releases") ?? "delivery/releases.json");
const outPath = resolve(root, argv.get("--out") ?? "delivery/release-plan.json");

const overrides = JSON.parse(readFileSync(dispositionsPath, "utf8")) as {
  overrides: DispositionOverride[];
};
const dispositionById = new Map(overrides.overrides.map((row) => [row.requirementId, row.disposition]));
const runtimeDependencies = JSON.parse(readFileSync(runtimeDependenciesPath, "utf8")) as {
  dependencies: RuntimeGateDependency[];
};
const runtimeDependenciesById = new Map(
  runtimeDependencies.dependencies.map((row) => [row.requirementId, row.dependencies]),
);
const inventory = parseInventory(readFileSync(inventoryPath, "utf8")).map((row) => ({
  ...row,
  disposition: dispositionById.get(row.requirementId) ?? row.disposition,
}));
const runtime = parseRuntimeGate(readFileSync(stampPath, "utf8")).map<DetailedRequirement>((row) => ({
  ...row,
  dependencies: runtimeDependenciesById.get(row.requirementId) ?? [],
  featureClass: "runtime_gate",
  summary: row.outcome,
}));
const rows = [...inventory, ...runtime];
const assignmentById = new Map<string, Assignment>();

for (const row of rows) {
  if (row.disposition !== "executable" && !row.requirementId.startsWith("RG:")) continue;
  const release = classify(row);
  assignmentById.set(row.requirementId, {
    requirementId: row.requirementId,
    release,
    rationale: `${release}: ${releaseReason[release]}`,
  });
}

let changed = true;
while (changed) {
  changed = false;
  for (const row of rows) {
    if (row.requirementId.startsWith("RG:")) continue;
    const assignment = assignmentById.get(row.requirementId);
    if (!assignment) continue;
    for (const dependencyId of row.dependencies) {
      const dependency = assignmentById.get(dependencyId);
      if (!dependency) continue;
      if (releaseSequence[dependency.release] <= releaseSequence[assignment.release]) continue;
      const prior = dependency.release;
      dependency.release = assignment.release;
      dependency.rationale = `${assignment.release}: prerequisite of ${row.requirementId}; pulled forward from ${prior} to preserve dependency order.`;
      changed = true;
    }
  }
}

for (const row of runtime) {
  const assignment = assignmentById.get(row.requirementId);
  if (!assignment || !row.dependencies.length) {
    throw new Error(`${row.requirementId} lacks a runtime behavior dependency`);
  }
  const dependencyAssignments = row.dependencies
    .map((dependencyId) => assignmentById.get(dependencyId))
    .filter((dependency): dependency is Assignment => Boolean(dependency));
  if (dependencyAssignments.length !== row.dependencies.length) {
    throw new Error(`${row.requirementId} references an unassigned behavior dependency`);
  }
  const release = dependencyAssignments.reduce((latest, dependency) =>
    releaseSequence[dependency.release] > releaseSequence[latest]
      ? dependency.release
      : latest,
  dependencyAssignments[0].release);
  assignment.release = release;
  assignment.rationale = `${release}: runtime proof follows ${row.dependencies.join(", ")}.`;
}

const assignments = [...assignmentById.values()].sort((left, right) =>
  left.requirementId.localeCompare(right.requirementId, undefined, { numeric: true }),
);
const releases = (JSON.parse(readFileSync(releasesPath, "utf8")) as { releases: ReleaseDefinition[] }).releases;
const manifest: ManifestRow[] = rows.map((row) => ({
  ...row,
  release: assignmentById.get(row.requirementId)?.release ?? null,
  issueId: null,
}));
const findings = validateGraph(manifest, releases);
if (findings.length) {
  throw new Error(`Release plan graph invalid:\n${findings.map((finding) => `${finding.code}: ${finding.message}`).join("\n")}`);
}

writeFileSync(outPath, `${JSON.stringify({ assignments }, null, 2)}\n`);
const counts = assignments.reduce<Record<string, number>>((result, row) => {
  result[row.release] = (result[row.release] ?? 0) + 1;
  return result;
}, {});
process.stdout.write(`${JSON.stringify({ assignments: assignments.length, counts })}\n`);
