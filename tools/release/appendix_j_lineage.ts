#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");

const sources = [
  {
    label: "<=v6.0.0",
    path: "_baselines/Sourcera_Master_Spec_v6.0.0.md",
  },
  {
    label: "v7.0.0",
    path: "_baselines/Sourcera_Master_Spec.v7.0.0-pre-v7.1-2026-04-26.md",
  },
  {
    label: "v7.1.0a",
    path: "_baselines/Sourcera_Master_Spec.v7.1.0a-pre-stamp-2026-05-20.md",
  },
  {
    label: "current_unstamped",
    path: "Sourcera_Master_Spec.md",
  },
] as const;

function appendixJ(markdown: string, sourcePath: string): string {
  const start = markdown.search(/^## Appendix J(?::|\s)/m);
  if (start < 0) throw new Error(`${sourcePath}: Appendix J heading not found`);
  const tail = markdown.slice(start);
  const next = tail.slice(1).search(/^## Appendix K(?::|\s)/m);
  return next < 0 ? tail : tail.slice(0, next + 1);
}

function controlledTokens(markdown: string, sourcePath: string): Set<string> {
  const tokens = new Set<string>();
  const section = appendixJ(markdown, sourcePath);
  for (const match of section.matchAll(/`([^`\n]+)`/g)) {
    const token = match[1].trim();
    if (/^[a-z][a-z0-9_]*(?:\.[a-z0-9_]+)*$/.test(token)) tokens.add(token);
  }
  return tokens;
}

const loaded = sources.map((source) => {
  const absolutePath = resolve(root, source.path);
  const markdown = readFileSync(absolutePath, "utf8");
  return {
    ...source,
    sha256: createHash("sha256").update(markdown).digest("hex"),
    tokens: controlledTokens(markdown, source.path),
  };
});

const current = loaded.at(-1);
if (!current) throw new Error("No current source configured");

const lineage = [...current.tokens].sort().map((token) => {
  const first = loaded.find((source) => source.tokens.has(token));
  if (!first) throw new Error(`Current Appendix J token has no lineage: ${token}`);
  return { token, since: first.label, source: first.path };
});

const result = {
  generated_at: new Date().toISOString(),
  authority: "Sourcera_Master_Spec.md Appendix J version-lineage contract",
  sources: loaded.map(({ label, path, sha256, tokens }) => ({
    label,
    path,
    sha256,
    appendix_j_controlled_token_count: tokens.size,
  })),
  summary: {
    current_controlled_token_count: lineage.length,
    unresolved_token_count: 0,
    first_seen_counts: Object.fromEntries(
      sources.map(({ label }) => [
        label,
        lineage.filter((entry) => entry.since === label).length,
      ]),
    ),
  },
  lineage,
};

if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else {
  process.stdout.write(
    `Appendix J lineage: ${result.summary.current_controlled_token_count} controlled tokens, 0 unresolved\n`,
  );
  for (const [label, count] of Object.entries(result.summary.first_seen_counts)) {
    process.stdout.write(`${label}: ${count}\n`);
  }
}
