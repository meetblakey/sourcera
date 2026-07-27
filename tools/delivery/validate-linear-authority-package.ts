#!/usr/bin/env node
import { readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import {
  type LinearAuthorityManifest,
  validateLinearAuthorityStructure,
} from "./lib/linear-authority-manifest.js";

const VALUE_FLAGS = new Set([
  "--manifest",
  "--manifest-sha256",
  "--source-root",
  "--capture",
  "--capture-sha256",
  "--allocation",
  "--allocation-sha256",
]);

function parseArgs(argv: string[]): { values: Map<string, string>; inputs: Map<string, string> } {
  const values = new Map<string, string>();
  const inputs = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!flag || !value || value.startsWith("--")) throw new Error(`Missing value for ${flag ?? "argument"}`);
    if (flag === "--input") {
      const separator = value.indexOf("=");
      if (separator <= 0 || separator === value.length - 1) throw new Error("--input must be name=path");
      const name = value.slice(0, separator);
      const path = value.slice(separator + 1);
      if (inputs.has(name)) throw new Error(`Duplicate compiler input ${name}`);
      inputs.set(name, path);
      continue;
    }
    if (!VALUE_FLAGS.has(flag)) throw new Error(`Unknown argument ${flag}`);
    if (values.has(flag)) throw new Error(`Duplicate argument ${flag}`);
    values.set(flag, value);
  }
  for (const flag of VALUE_FLAGS) if (!values.has(flag)) throw new Error(`Missing required argument ${flag}`);
  return { values, inputs };
}

function safeSourcePath(root: string, sourcePath: string): string {
  const candidate = resolve(root, sourcePath);
  const relativePath = relative(root, candidate);
  if (!relativePath || relativePath.startsWith("..") || isAbsolute(relativePath)) throw new Error(`Authority source path ${sourcePath} escapes --source-root`);
  const realCandidate = realpathSync(candidate);
  const realRelative = relative(realpathSync(root), realCandidate);
  if (!realRelative || realRelative.startsWith("..") || isAbsolute(realRelative)) throw new Error(`Authority source path ${sourcePath} resolves outside --source-root`);
  return realCandidate;
}

function main(): void {
  const { values, inputs } = parseArgs(process.argv.slice(2));
  const manifestRaw = readFileSync(values.get("--manifest")!, "utf8");
  const manifest = JSON.parse(manifestRaw) as Partial<LinearAuthorityManifest>;
  if (!Array.isArray(manifest.sources)) throw new Error("Authority manifest sources are missing");
  const sourceRoot = realpathSync(values.get("--source-root")!);
  const sourceFiles = new Map<string, Buffer>();
  for (const source of manifest.sources) {
    if (!source || typeof source.path !== "string") throw new Error("Authority manifest source path is invalid");
    sourceFiles.set(source.path, readFileSync(safeSourcePath(sourceRoot, source.path)));
  }
  const compilerInputs = new Map<string, Buffer>();
  for (const [name, path] of inputs) compilerInputs.set(name, readFileSync(path));
  const summary = validateLinearAuthorityStructure({
    manifestRaw,
    expectedManifestSha256: values.get("--manifest-sha256")!,
    sourceFiles,
    compilerInputs,
    liveCaptureRaw: readFileSync(values.get("--capture")!, "utf8"),
    expectedLiveCaptureSha256: values.get("--capture-sha256")!,
    allocationRaw: readFileSync(values.get("--allocation")!, "utf8"),
    expectedAllocationSha256: values.get("--allocation-sha256")!,
  });
  process.stdout.write(`${JSON.stringify(summary)}\n`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
