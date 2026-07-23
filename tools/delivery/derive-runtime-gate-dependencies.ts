#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface Feature {
  id: string;
  name: string;
  featureClass: string;
  primary: string;
  secondary: string;
  summary: string;
}

interface DispositionOverride {
  requirementId: string;
  disposition: string;
}

const stop = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "contract",
  "every", "for", "from", "gate", "has", "have", "in", "is", "it",
  "must", "no", "not", "of", "on", "only", "or", "row", "runtime",
  "shall", "should", "that", "the", "their", "this", "to", "when",
  "with", "without", "consistency", "completeness", "invariant", "enforced",
  "required", "requirement", "requirements", "ready", "single", "source",
]);

function cells(line: string): string[] {
  return line
    .split(/(?<!\\)\|/)
    .slice(1, -1)
    .map((value) => value.trim().replace(/\\\|/g, "|"));
}

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .map((token) => token.replace(/(?:ing|ed|es|s)$/i, ""))
    .filter((token) => token.length > 2 && !stop.has(token));
}

function sections(value: string): string[] {
  return [...value.matchAll(/§\s*(\d+(?:\.\d+)*)/g)].map((match) => match[1]);
}

function featureRows(markdown: string): Feature[] {
  return markdown.split(/\r?\n/).flatMap((line) => {
    if (!/^\|\s*F-(?:AE-|BC-)?\d+\s*\|/.test(line)) return [];
    const row = cells(line);
    return [{
      id: row[0],
      name: row[1],
      featureClass: row[2],
      primary: row[3],
      secondary: row[4],
      summary: row[7],
    }];
  });
}

function score(
  gateId: string,
  assertion: string,
  feature: Feature,
): { score: number; reasons: string[] } {
  const gateTokens = new Set(tokens(gateId));
  const assertionTokens = new Set(tokens(assertion));
  const nameTokenSet = new Set(tokens(feature.name));
  const featureTokens = new Set(tokens(`${feature.name} ${feature.summary}`));
  let value = 0;
  const reasons: string[] = [];
  const gateOverlap = [...gateTokens].filter((token) => featureTokens.has(token));
  const assertionOverlap = [...assertionTokens].filter((token) => featureTokens.has(token));
  value += gateOverlap.length * 25;
  value += [...gateTokens].filter((token) => nameTokenSet.has(token)).length * 15;
  value += assertionOverlap.length * 2;
  if (gateOverlap.length) reasons.push(`gate:${gateOverlap.join(",")}`);
  if (assertionOverlap.length) reasons.push(`assertion:${assertionOverlap.slice(0, 8).join(",")}`);

  const gateText = `${gateId} ${assertion}`.toLowerCase().replace(/[^a-z0-9]+/g, " ");
  const nameTokens = tokens(feature.name);
  for (let index = 0; index < nameTokens.length - 1; index += 1) {
    const phrase = `${nameTokens[index]} ${nameTokens[index + 1]}`;
    if (gateText.includes(phrase)) {
      value += 12;
      reasons.push(`phrase:${phrase}`);
    }
  }

  const gateSections = sections(assertion);
  const primarySections = sections(feature.primary);
  const secondarySections = sections(feature.secondary);
  for (const gateSection of gateSections) {
    if (primarySections.includes(gateSection)) {
      value += 35;
      reasons.push(`primary-section:${gateSection}`);
    } else if (secondarySections.includes(gateSection)) {
      value += 15;
      reasons.push(`secondary-section:${gateSection}`);
    } else if (primarySections.some((section) => section.split(".")[0] === gateSection.split(".")[0])) {
      value += 4;
    } else if (secondarySections.some((section) => section.split(".")[0] === gateSection.split(".")[0])) {
      value += 2;
    }
  }
  return { score: value, reasons };
}

const finalOutput = process.argv.includes("--dependencies");
const rootArgument = process.argv.slice(2).find((value) => !value.startsWith("--"));
const root = resolve(rootArgument ?? ".");
const dispositionOverrides = JSON.parse(
  readFileSync(resolve(root, "delivery/dispositions.json"), "utf8"),
) as { overrides: DispositionOverride[] };
const excluded = new Set(
  dispositionOverrides.overrides
    .filter((row) => row.disposition !== "executable")
    .map((row) => row.requirementId),
);
const inventory = featureRows(
  readFileSync(resolve(root, "_audit/FEATURE_INVENTORY.md"), "utf8"),
).filter(
  (feature) =>
    !excluded.has(feature.id) &&
    !/\bCI Gate\b/i.test(feature.name),
);
const specLines = readFileSync(resolve(root, "Sourcera_Master_Spec.md"), "utf8").split(/\r?\n/);
const stamp = JSON.parse(readFileSync("/tmp/sourcera-stamp.json", "utf8")) as {
  findings: Array<{ id: string; line: number; severity?: string }>;
};
const suggestions = stamp.findings
  .filter((finding) => !finding.severity || finding.severity === "blocker")
  .map((finding) => {
    const line = specLines[finding.line - 1] ?? "";
    const row = line.startsWith("|") ? cells(line) : [];
    const assertion = row[4] ?? line;
    const candidates = inventory
      .map((feature) => ({ feature, ...score(finding.id, assertion, feature) }))
      .filter((candidate) => candidate.score > 0)
      .sort((left, right) => right.score - left.score || left.feature.id.localeCompare(right.feature.id))
      .slice(0, 5)
      .map((candidate) => ({
        requirementId: candidate.feature.id,
        name: candidate.feature.name,
        primary: candidate.feature.primary,
        score: candidate.score,
        reasons: candidate.reasons,
      }));
    return {
      requirementId: `RG:${finding.id}`,
      assertion,
      candidates,
      confidenceGap: (candidates[0]?.score ?? 0) - (candidates[1]?.score ?? 0),
    };
  });

if (!finalOutput) {
  process.stdout.write(`${JSON.stringify({ suggestions }, null, 2)}\n`);
} else {
  const overrides = JSON.parse(
    readFileSync(
      resolve(root, "delivery/runtime-gate-dependency-overrides.json"),
      "utf8",
    ),
  ) as {
    dependencies: Array<{
      requirementId: string;
      dependencies: string[];
      rationale: string;
    }>;
  };
  const overrideById = new Map(
    overrides.dependencies.map((row) => [row.requirementId, row]),
  );
  const dependencies = suggestions.map((suggestion) => {
    const override = overrideById.get(suggestion.requirementId);
    if (override) return override;
    const candidate = suggestion.candidates[0];
    if (!candidate) {
      throw new Error(`${suggestion.requirementId} has no behavior candidate`);
    }
    return {
      requirementId: suggestion.requirementId,
      dependencies: [candidate.requirementId],
      rationale: `Highest source-section and assertion match: ${candidate.requirementId} ${candidate.name}.`,
    };
  }).sort((left, right) => left.requirementId.localeCompare(right.requirementId));
  const known = new Set(suggestions.map((row) => row.requirementId));
  const unknownOverrides = overrides.dependencies.filter(
    (row) => !known.has(row.requirementId),
  );
  if (unknownOverrides.length) {
    throw new Error(
      `Unknown runtime dependency overrides: ${unknownOverrides.map((row) => row.requirementId).join(", ")}`,
    );
  }
  process.stdout.write(`${JSON.stringify({ dependencies }, null, 2)}\n`);
}
