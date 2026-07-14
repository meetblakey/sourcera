#!/usr/bin/env node
/** §M.4.2 structural filter: prose, comments, whitespace, and registered anchor aliases are cosmetic. */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readPreEditSpec, structuralDiff, type AnchorAlias, type StructuralChange } from "./appendix_m_diff_core.js";

export function filterCosmeticEdits(preText: string, postText: string, aliases: AnchorAlias[]): StructuralChange[] {
  return structuralDiff(preText, postText, aliases);
}

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function main(): void {
  try {
    const postPath = arg("--post-edit-spec") ?? "Sourcera_Master_Spec.md";
    const post = readFileSync(resolve(postPath), "utf-8");
    const pre = readPreEditSpec(postPath, arg("--pre-edit-spec"), arg("--merge-base-sha"));
    const aliasPath = arg("--anchor-aliases") ?? "tools/spec-lint/anchor_aliases.json";
    const aliases = JSON.parse(readFileSync(resolve(aliasPath), "utf-8")) as AnchorAlias[];
    const changes = filterCosmeticEdits(pre, post, aliases);
    const payload = { outcome: "pass", structural_change_count: changes.length, structural_changes: changes };
    const json = `${JSON.stringify(payload, null, 2)}\n`;
    process.stdout.write(json);
    const emit = arg("--emit-filtered-diff");
    if (emit) writeFileSync(resolve(emit), json, "utf-8");
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 2;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
