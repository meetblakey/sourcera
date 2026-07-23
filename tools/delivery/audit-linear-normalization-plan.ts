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
import {
  auditLinearNormalizationPlan,
  type BaselineIssueInput,
  type ManifestRowInput,
  type SourceOverrideInput,
} from "./lib/linear-normalization-semantic-audit.js";
import { assertHistoricalNormalizationSourceMap } from "./lib/linear-normalization-source-map.js";

interface Arguments {
  baseline: string | null;
  manifest: string;
  out: string | null;
  plan: string;
  replacementRegister: string | null;
  replacementRegisterExplicit: boolean;
  root: string;
  sourceMap: string;
}

const USAGE = `Usage: audit-linear-normalization-plan --plan <path> [options]

Options:
  --baseline <path>              Live baseline issue capture.
  --replacement-register <path> Intentional-replacement register to validate in strict full-register mode.
  --out <path>                   Write the JSON report atomically instead of stdout.
  --root <path>                  Audit root; defaults to the current directory.
  --manifest <path>              Delivery manifest path relative to the audit root.
  --source-map <path>            Normalization source map path relative to the audit root.
  --help                         Show this help.

Baseline audits automatically load delivery/linear-intentional-replacements.json when it exists.
The implicit canonical register is scoped to exact token or path losses in the current plan, so unrelated
approved rows do not fail subset or no-loss plans. Passing --replacement-register is deliberately strict:
every register row must match the audited plan and loss set; use it for a full merged audit.
`;

function argumentsOf(values: string[]): Arguments {
  const allowed = new Set([
    "--baseline",
    "--plan",
    "--out",
    "--root",
    "--manifest",
    "--source-map",
    "--replacement-register",
  ]);
  if (values.length % 2 !== 0) throw new Error("Every argument needs a value");
  const parsed = new Map<string, string>();
  for (let index = 0; index < values.length; index += 2) {
    const name = values[index];
    const value = values[index + 1];
    if (!allowed.has(name)) throw new Error(`Unknown argument ${name}`);
    if (!value?.trim() || value.startsWith("--")) throw new Error(`Missing value for ${name}`);
    if (parsed.has(name)) throw new Error(`Duplicate argument ${name}`);
    parsed.set(name, value);
  }
  const plan = parsed.get("--plan");
  if (!plan) {
    throw new Error(USAGE.trimEnd());
  }
  const root = realpathSync(resolve(parsed.get("--root") ?? process.cwd()));
  const replacementRegisterExplicit = parsed.has("--replacement-register");
  const defaultReplacementRegister = resolve(root, "delivery/linear-intentional-replacements.json");
  return {
    baseline: parsed.has("--baseline") ? resolve(parsed.get("--baseline") as string) : null,
    manifest: resolve(root, parsed.get("--manifest") ?? "reports/delivery/delivery-manifest.json"),
    out: parsed.has("--out") ? resolve(parsed.get("--out") as string) : null,
    plan: resolve(plan),
    replacementRegister: replacementRegisterExplicit
      ? resolve(parsed.get("--replacement-register") as string)
      : existsSync(defaultReplacementRegister)
        ? defaultReplacementRegister
        : null,
    replacementRegisterExplicit,
    root,
    sourceMap: resolve(root, parsed.get("--source-map") ?? "delivery/linear-normalization-source-map.json"),
  };
}

function fileSha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function jsonFile(path: string, label: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${label} is missing or invalid: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function atomicWrite(path: string, value: string): void {
  const temporary = resolve(dirname(path), `.${randomUUID()}.linear-semantic-audit.tmp`);
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
  if (process.argv.slice(2).some((value) => value === "--help" || value === "-h")) {
    process.stdout.write(USAGE);
    return;
  }
  const args = argumentsOf(process.argv.slice(2));
  const plan = jsonFile(args.plan, "normalization plan");
  const manifestRaw = existsSync(args.manifest)
    ? jsonFile(args.manifest, "delivery manifest") as { rows?: ManifestRowInput[] }
    : {};
  const sourceMapExists = existsSync(args.sourceMap);
  const sourceMapRaw = sourceMapExists
    ? jsonFile(args.sourceMap, "normalization source map")
    : {};
  if (sourceMapExists) assertHistoricalNormalizationSourceMap(sourceMapRaw);
  const baselineRaw = args.baseline
    ? jsonFile(args.baseline, "baseline issue capture")
    : [];
  const useReplacementRegister = Boolean(
    args.replacementRegister && (args.replacementRegisterExplicit || args.baseline),
  );
  const replacementRegisterPath = useReplacementRegister
    ? args.replacementRegister
    : null;
  const replacementRegister = replacementRegisterPath
    ? jsonFile(replacementRegisterPath, "intentional baseline replacement register")
    : undefined;
  const baselineIssues = Array.isArray(baselineRaw)
    ? baselineRaw as BaselineIssueInput[]
    : Array.isArray((baselineRaw as { issues?: unknown }).issues)
      ? (baselineRaw as { issues: BaselineIssueInput[] }).issues
      : [];
  const report = auditLinearNormalizationPlan(plan, {
    baselineCaptureSha256: args.baseline ? fileSha256(args.baseline) : undefined,
    baselineIssues,
    manifestRows: Array.isArray(manifestRaw.rows) ? manifestRaw.rows : [],
    replacementRegister,
    replacementRegisterScope: args.replacementRegisterExplicit ? "full" : "matching-losses",
    replacementRegisterSha256: replacementRegisterPath
      ? fileSha256(replacementRegisterPath)
      : undefined,
    root: args.root,
    sourceOverrides: (sourceMapRaw as { sources?: Record<string, SourceOverrideInput> }).sources ?? {},
  });
  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  if (args.out) atomicWrite(args.out, serialized);
  else process.stdout.write(serialized);
  process.exitCode = report.verdict === "go" ? 0 : 1;
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 2;
}
