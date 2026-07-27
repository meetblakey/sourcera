#!/usr/bin/env node
import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  existsSync,
  fsyncSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
  writeSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";

import { LinearAuthorityHttpTransport } from "./lib/linear-authority-http-transport.js";
import {
  combinedLinearAuthorityJournalRaw,
  normalizedLinearAuthorityJournalPrefix,
  writeAllLinearAuthorityJournalBytes,
} from "./lib/linear-authority-journal.js";
import type {
  LinearAuthorityAllocation,
  LinearAuthorityManifest,
  LinearAuthorityValidationInput,
} from "./lib/linear-authority-manifest.js";
import {
  executeLinearAuthorityPublication,
  type LinearAuthorityPublicationArtifacts,
  type LinearAuthorityPublicationPins,
} from "./lib/linear-authority-publisher.js";

const DIGEST = /^[a-f0-9]{64}$/;
const SAFE_INPUT_NAME = /^[a-z][a-z0-9-]{0,79}$/;
const PACKAGE_FILES = {
  manifestRaw: "manifest.json",
  semanticPlanRaw: "semantic-plan.json",
  liveCaptureRaw: "live-capture.json",
  captureReceiptRaw: "capture-receipt.json",
  allocationRaw: "allocation.json",
  operationsRaw: "operations.json",
} as const;

interface CliArgs {
  apply: boolean;
  packageDir: string;
  runId?: string;
  journalOut?: string;
  maxHttpAttempts?: number;
}

function fail(message: string): never {
  throw new Error(`Linear authority publisher CLI: ${message}`);
}

function parseArgs(argv: string[]): CliArgs {
  let apply = false;
  const values = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === "--apply") {
      if (apply) fail("--apply is duplicated");
      apply = true;
      continue;
    }
    if (!flag || !["--package-dir", "--run-id", "--journal-out", "--max-http-attempts"].includes(flag)) fail(`unknown argument ${flag ?? ""}`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) fail(`${flag} requires a value`);
    if (values.has(flag)) fail(`${flag} is duplicated`);
    values.set(flag, value);
    index += 1;
  }
  const packageDir = values.get("--package-dir");
  if (!packageDir) fail("--package-dir is required");
  const runId = values.get("--run-id");
  const journalOut = values.get("--journal-out");
  if (apply && (!runId || !journalOut)) fail("--apply requires --run-id and --journal-out");
  if (!apply && (runId || journalOut)) fail("--run-id and --journal-out require --apply");
  const rawBudget = values.get("--max-http-attempts");
  const maxHttpAttempts = rawBudget === undefined ? undefined : Number(rawBudget);
  if (maxHttpAttempts !== undefined && (!Number.isInteger(maxHttpAttempts) || maxHttpAttempts < 1 || maxHttpAttempts > 1_000)) {
    fail("--max-http-attempts must be an integer from 1 to 1000");
  }
  return { apply, packageDir, runId, journalOut, maxHttpAttempts };
}

function exactObject(value: unknown, keys: readonly string[], label: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object`);
  const row = value as Record<string, unknown>;
  if (Object.keys(row).sort().join("\0") !== [...keys].sort().join("\0")) fail(`${label} contract is invalid`);
  return row;
}

function packageRoot(path: string): string {
  const absolute = resolve(path);
  const stat = lstatSync(absolute);
  if (stat.isSymbolicLink() || !stat.isDirectory()) fail("package directory must be a real directory");
  return realpathSync(absolute);
}

function safeExistingFile(root: string, relativePath: string, label: string): string {
  if (!relativePath || isAbsolute(relativePath)) fail(`${label} path is invalid`);
  const candidate = resolve(root, relativePath);
  const within = relative(root, candidate);
  if (!within || within.startsWith("..") || isAbsolute(within)) fail(`${label} escapes its root`);
  const stat = lstatSync(candidate);
  if (stat.isSymbolicLink() || !stat.isFile()) fail(`${label} must be a regular non-symlink file`);
  const real = realpathSync(candidate);
  const realWithin = relative(realpathSync(root), real);
  if (!realWithin || realWithin.startsWith("..") || isAbsolute(realWithin)) fail(`${label} resolves outside its root`);
  return real;
}

function readPackageFile(root: string, name: string): string {
  return readFileSync(safeExistingFile(root, name, `package file ${name}`), "utf8");
}

function repositoryRoot(start: string): string {
  let current = realpathSync(start);
  while (true) {
    if (existsSync(join(current, ".git"))) return current;
    const parent = dirname(current);
    if (parent === current) fail("package directory is not inside a Git checkout");
    current = parent;
  }
}

function pins(raw: string): LinearAuthorityPublicationPins {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    fail("pins.json is not valid JSON");
  }
  const row = exactObject(parsed, [
    "manifestSha256", "semanticPlanSha256", "liveCaptureSha256", "captureReceiptSha256", "allocationSha256", "operationsSha256",
  ], "pins.json");
  for (const [key, value] of Object.entries(row)) if (typeof value !== "string" || !DIGEST.test(value)) fail(`pins.json ${key} is invalid`);
  return row as unknown as LinearAuthorityPublicationPins;
}

function newOutputPath(path: string): string {
  const absolute = resolve(path);
  const parent = realpathSync(dirname(absolute));
  const output = join(parent, basename(absolute));
  if (existsSync(output)) fail("journal output must be a new path");
  return output;
}

function safeJournalSink(path: string, prefix: string): { append(line: string): void; close(): void; ensure(): void } {
  let descriptor: number | null = null;
  const ensure = (): void => {
    if (descriptor !== null) return;
    descriptor = openSync(path, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
    if (prefix.length > 0) {
      writeAllLinearAuthorityJournalBytes(prefix, (buffer, offset, length) => writeSync(descriptor!, buffer, offset, length, null));
    }
    fsyncSync(descriptor);
  };
  return {
    append(line): void {
      ensure();
      writeAllLinearAuthorityJournalBytes(line, (buffer, offset, length) => writeSync(descriptor!, buffer, offset, length, null));
      fsyncSync(descriptor!);
    },
    ensure,
    close(): void {
      if (descriptor === null) return;
      closeSync(descriptor);
      descriptor = null;
    },
  };
}

function optionalResume(root: string): { raw?: string; digest?: string } {
  const journal = join(root, "resume-journal.jsonl");
  const pin = join(root, "resume-journal.sha256");
  const hasJournal = existsSync(journal);
  const hasPin = existsSync(pin);
  if (hasJournal !== hasPin) fail("resume journal and digest must both be present or absent");
  if (!hasJournal) return {};
  const raw = readFileSync(safeExistingFile(root, "resume-journal.jsonl", "resume journal"), "utf8");
  const digest = readFileSync(safeExistingFile(root, "resume-journal.sha256", "resume journal digest"), "utf8").trim();
  if (!DIGEST.test(digest)) fail("resume journal digest is invalid");
  return { raw, digest };
}

function buildValidationInput(input: {
  root: string;
  repositoryRoot: string;
  artifacts: LinearAuthorityPublicationArtifacts;
  pins: LinearAuthorityPublicationPins;
  manifest: LinearAuthorityManifest & { schemaVersion: 2 };
}): LinearAuthorityValidationInput {
  const compilerInputs = new Map<string, Buffer>();
  for (const row of input.manifest.inputs) {
    if (!SAFE_INPUT_NAME.test(row.name)) fail(`manifest compiler input ${row.name} is unsafe`);
    compilerInputs.set(row.name, readFileSync(safeExistingFile(input.root, join("inputs", row.name), `compiler input ${row.name}`)));
  }
  const sourceFiles = new Map<string, Buffer>();
  for (const source of input.manifest.sources) {
    sourceFiles.set(source.path, readFileSync(safeExistingFile(input.repositoryRoot, source.path, `authority source ${source.path}`)));
  }
  return {
    manifestRaw: input.artifacts.manifestRaw,
    expectedManifestSha256: input.pins.manifestSha256,
    sourceFiles,
    compilerInputs,
    liveCaptureRaw: input.artifacts.liveCaptureRaw,
    expectedLiveCaptureSha256: input.pins.liveCaptureSha256,
    allocationRaw: input.artifacts.allocationRaw,
    expectedAllocationSha256: input.pins.allocationSha256,
    repositoryRoot: input.repositoryRoot,
  };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const root = packageRoot(args.packageDir);
  const repo = repositoryRoot(process.cwd());
  const artifacts = Object.fromEntries(Object.entries(PACKAGE_FILES).map(([key, name]) => [key, readPackageFile(root, name)])) as unknown as LinearAuthorityPublicationArtifacts;
  const publicationPins = pins(readPackageFile(root, "pins.json"));
  let manifest: LinearAuthorityManifest & { schemaVersion: 2 };
  let allocation: LinearAuthorityAllocation;
  try {
    manifest = JSON.parse(artifacts.manifestRaw) as LinearAuthorityManifest & { schemaVersion: 2 };
    allocation = JSON.parse(artifacts.allocationRaw) as LinearAuthorityAllocation;
  } catch {
    fail("manifest or allocation is not valid JSON");
  }
  const validationInput = buildValidationInput({ root, repositoryRoot: repo, artifacts, pins: publicationPins, manifest });
  const resume = optionalResume(root);
  const resumePrefix = normalizedLinearAuthorityJournalPrefix(resume.raw);
  const outputPath = args.apply ? newOutputPath(args.journalOut!) : undefined;
  const sink = outputPath ? safeJournalSink(outputPath, resumePrefix) : undefined;
  try {
    const result = await executeLinearAuthorityPublication({
      artifacts,
      pins: publicationPins,
      authorityValidationInput: validationInput,
      mode: args.apply ? "apply" : "dry-run",
      runId: args.runId,
      limits: args.maxHttpAttempts === undefined ? undefined : { maxHttpAttempts: args.maxHttpAttempts },
      resumeJournalRaw: resume.raw,
      expectedResumeJournalSha256: resume.digest,
      credentialProvider: args.apply
        ? () => {
          const credential = process.env.LINEAR_API_KEY;
          if (!credential) fail("LINEAR_API_KEY is unavailable");
          return credential;
        }
        : undefined,
      transport: args.apply ? new LinearAuthorityHttpTransport({ manifest, allocation }) : undefined,
      journalSink: sink ? (line) => sink.append(line) : undefined,
    });
    const combinedJournalRaw = combinedLinearAuthorityJournalRaw(resume.raw, result.appendedJournalRaw);
    let journalBytes = Buffer.from(combinedJournalRaw, "utf8");
    if (sink) {
      sink.ensure();
      sink.close();
      const outputStat = lstatSync(outputPath!);
      if (outputStat.isSymbolicLink() || !outputStat.isFile()) fail("journal output identity changed");
      journalBytes = readFileSync(outputPath!);
      if (!journalBytes.equals(Buffer.from(combinedJournalRaw, "utf8"))) fail("journal output differs from the validated combined chain");
    }
    const summary = {
      mode: result.mode,
      status: result.status,
      planRoot: result.planRoot,
      semanticRoot: result.semanticRoot,
      liveCaptureRoot: result.liveCaptureRoot,
      operationCount: result.operationCount,
      applied: result.applied,
      alreadyApplied: result.alreadyApplied,
      httpAttempts: result.httpAttempts,
      journalSha256: createHash("sha256").update(journalBytes).digest("hex"),
    };
    process.stdout.write(`${JSON.stringify(summary)}\n`);
  } finally {
    sink?.close();
  }
}

main().catch(() => {
  process.stderr.write("Linear authority publication failed\n");
  process.exitCode = 1;
});
