/**
 * CLI for §M.4.4.5 `@ci-gate-override:` sibling override grammar checks.
 *
 * The parser is intentionally catalog-bound: unknown gate IDs and row-level
 * `not_permitted*` override paths fail before any downstream detector can honor
 * an override annotation.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseOverrides } from "./lib/overrides.js";
import { splitUnescapedPipes } from "./lib/spec_loader.js";

interface Args {
  prDescription: string;
  catalogSpec: string;
  emitResult?: string;
}

function parseArgs(argv: string[]): Args {
  const out: Partial<Args> = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i]!;
    const value = argv[++i];
    switch (key) {
      case "--pr-description":
        out.prDescription = value;
        break;
      case "--catalog-spec":
        out.catalogSpec = value;
        break;
      case "--emit-result":
        out.emitResult = value;
        break;
      default:
        throw new Error(`unknown argument: ${key}`);
    }
  }
  if (!out.prDescription) throw new Error("missing required argument --pr-description");
  if (!out.catalogSpec) throw new Error("missing required argument --catalog-spec");
  return out as Args;
}

interface Catalog {
  knownGateIds: Set<string>;
  notPermittedGateIds: Set<string>;
}

function extractCatalog(specText: string): Catalog {
  const knownGateIds = new Set<string>();
  const notPermittedGateIds = new Set<string>();
  let inM5 = false;
  for (const line of specText.split(/\r?\n/)) {
    if (/^### M\.5 CI Gate Catalog/.test(line)) inM5 = true;
    if (!inM5) continue;
    const match = /^\|\s*`([a-z0-9_]+)`\s*\|/.exec(line);
    if (!match) continue;
    const gateId = match[1]!;
    knownGateIds.add(gateId);
    const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
    const cells = splitUnescapedPipes(trimmed).map((cell) => cell.trim());
    const overrideText = cells.join(" ");
    if (/\bnot_permitted(?:_[a-z0-9_]+)?\b/.test(overrideText)) {
      notPermittedGateIds.add(gateId);
    }
  }
  return { knownGateIds, notPermittedGateIds };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const prDescription = readFileSync(resolve(args.prDescription), "utf-8");
  const catalogText = readFileSync(resolve(args.catalogSpec), "utf-8");
  const catalog = extractCatalog(catalogText);
  const overrides = parseOverrides(prDescription, {
    knownGateIds: catalog.knownGateIds,
    notPermittedGates: catalog.notPermittedGateIds,
  });
  const annotations = [...overrides.values()];
  const failures = annotations.filter((a) => a.grammar_error);
  const payload = {
    outcome: failures.length > 0 ? "fail" : "pass",
    annotation_count: annotations.length,
    failure_count: failures.length,
    known_gate_count: catalog.knownGateIds.size,
    not_permitted_gate_count: catalog.notPermittedGateIds.size,
    annotations,
  };
  const json = JSON.stringify(payload, null, 2);
  process.stdout.write(json + "\n");
  if (args.emitResult) writeFileSync(resolve(args.emitResult), json + "\n", "utf-8");
  process.exitCode = failures.length > 0 ? 1 : 0;
}

main();
