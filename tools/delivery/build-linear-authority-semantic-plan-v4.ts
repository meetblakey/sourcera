#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildLinearAuthoritySemanticPlanV4FromCapture } from "./lib/linear-authority-semantic-plan-v4.js";

const allowed = new Set([
  "--root",
  "--fingerprint",
  "--descriptions",
  "--recovery-map",
  "--publication",
]);

function argumentsMap(values: string[]): Map<string, string> {
  const parsed = new Map<string, string>();
  for (let index = 0; index < values.length; index += 2) {
    const name = values[index];
    const value = values[index + 1];
    if (!name || !value || !allowed.has(name) || parsed.has(name)) {
      throw new Error(`Invalid or duplicate argument near ${name ?? "end of command"}`);
    }
    parsed.set(name, value);
  }
  return parsed;
}

function main(): void {
  const args = argumentsMap(process.argv.slice(2));
  const fingerprintPath = args.get("--fingerprint");
  const descriptionsPath = args.get("--descriptions");
  const recoveryPath = args.get("--recovery-map");
  const publicationPath = args.get("--publication");
  if (!fingerprintPath || !descriptionsPath || !recoveryPath || !publicationPath) {
    throw new Error(
      "Required arguments: --fingerprint, --descriptions, --recovery-map, and --publication",
    );
  }
  const result = buildLinearAuthoritySemanticPlanV4FromCapture({
    rootDir: resolve(args.get("--root") ?? process.cwd()),
    fingerprintJson: readFileSync(resolve(fingerprintPath)),
    descriptionsJson: readFileSync(resolve(descriptionsPath)),
    recoveryMappingJson: readFileSync(resolve(recoveryPath)),
    publicationJson: readFileSync(resolve(publicationPath)),
  });
  process.stdout.write(`${JSON.stringify(result.plan, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
