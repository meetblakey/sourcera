#!/usr/bin/env tsx
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import {
  compileLinearAuthorityUnifiedPackage,
} from "./lib/linear-authority-unified-compiler.js";
import {
  buildLinearAuthorityPublicationOperationPlan,
  type LinearAuthorityPublicationPins,
} from "./lib/linear-authority-publisher.js";
import { parseLinearAuthoritySemanticPlanV4 } from "./lib/linear-authority-semantic-plan-v4.js";

const sha256 = (value: string | Uint8Array): string =>
  createHash("sha256").update(value).digest("hex");

function fail(message: string): never {
  throw new Error(`Unified authority package CLI: ${message}`);
}

function argumentsMap(argv: string[]): Map<string, string> {
  const allowed = new Set([
    "--repository-root", "--pre-cutover-tag", "--linear-fingerprint", "--native-identity",
    "--raw-documents", "--issue-descriptions", "--capture-receipt", "--github-execution",
    "--project-scope", "--program-scope", "--requirement-baseline", "--out-dir",
  ]);
  const values = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key || !allowed.has(key) || !value || value.startsWith("--") || values.has(key)) fail("arguments are invalid or duplicated");
    values.set(key, value);
  }
  for (const key of allowed) {
    if (key !== "--repository-root" && !values.has(key)) fail(`${key} is required`);
  }
  return values;
}

const values = argumentsMap(process.argv.slice(2));
const repositoryRoot = resolve(values.get("--repository-root") ?? process.cwd());
const outDir = resolve(values.get("--out-dir")!);
const compilerInputsDir = join(outDir, "inputs");
mkdirSync(outDir);
mkdirSync(compilerInputsDir);
const read = (name: string): Buffer => readFileSync(resolve(values.get(name)!));
const result = compileLinearAuthorityUnifiedPackage({
  repositoryRoot,
  preCutoverTag: values.get("--pre-cutover-tag")!,
  linearFingerprintRaw: read("--linear-fingerprint"),
  liveCaptureRaw: read("--native-identity"),
  rawDocumentsRaw: read("--raw-documents"),
  issueDescriptionsRaw: read("--issue-descriptions"),
  captureReceiptRaw: read("--capture-receipt"),
  githubExecutionRaw: read("--github-execution"),
  projectScopeRaw: read("--project-scope"),
  programScopeRaw: read("--program-scope"),
  requirementBaselineRaw: read("--requirement-baseline"),
});
const semanticPlanRaw = result.authority.compilerInputs.get("semantic-plan")!.toString("utf8");
const captureReceiptRaw = result.authority.compilerInputs.get("capture-receipt")!.toString("utf8");
const operations = buildLinearAuthorityPublicationOperationPlan({
  manifest: result.authority.manifest,
  allocation: result.authority.allocation,
  semantic: parseLinearAuthoritySemanticPlanV4(semanticPlanRaw),
});
const operationsRaw = `${JSON.stringify(operations)}\n`;
const pins: LinearAuthorityPublicationPins = {
  manifestSha256: result.authority.manifestSha256,
  semanticPlanSha256: sha256(semanticPlanRaw),
  liveCaptureSha256: result.authority.liveCaptureSha256,
  captureReceiptSha256: sha256(captureReceiptRaw),
  allocationSha256: result.authority.allocationSha256,
  operationsSha256: sha256(operationsRaw),
};
writeFileSync(join(outDir, "manifest.json"), result.authority.manifestRaw, { flag: "wx" });
writeFileSync(join(outDir, "semantic-plan.json"), semanticPlanRaw, { flag: "wx" });
writeFileSync(join(outDir, "live-capture.json"), result.authority.liveCaptureRaw, { flag: "wx" });
writeFileSync(join(outDir, "capture-receipt.json"), captureReceiptRaw, { flag: "wx" });
writeFileSync(join(outDir, "allocation.json"), result.authority.allocationRaw, { flag: "wx" });
writeFileSync(join(outDir, "operations.json"), operationsRaw, { flag: "wx" });
writeFileSync(join(outDir, "pins.json"), `${JSON.stringify(pins)}\n`, { flag: "wx" });
const packageInputs = new Map(result.authority.compilerInputs);
packageInputs.set("native-identity", Buffer.from(result.authority.liveCaptureRaw, "utf8"));
const compilerInputs = [...packageInputs.entries()]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([name, raw]) => {
    const path = `inputs/${name}`;
    writeFileSync(join(outDir, path), raw, { flag: "wx" });
    return { name, path, byteLength: raw.length, sha256: sha256(raw) };
  });
const metadata = {
  schemaVersion: 1,
  desiredAuthorityRoot: result.desiredAuthorityRoot,
  manifest: { path: "manifest.json", sha256: result.authority.manifestSha256 },
  allocation: { path: "allocation.json", sha256: result.authority.allocationSha256 },
  semanticPlan: { path: "semantic-plan.json", sha256: pins.semanticPlanSha256 },
  liveCapture: { path: "live-capture.json", sha256: result.authority.liveCaptureSha256 },
  captureReceipt: { path: "capture-receipt.json", sha256: pins.captureReceiptSha256 },
  operations: { path: "operations.json", sha256: pins.operationsSha256, count: operations.operations.length },
  pins: { path: "pins.json", sha256: sha256(`${JSON.stringify(pins)}\n`) },
  compilerInputs,
  audit: result.audit,
};
writeFileSync(join(outDir, "package-metadata.json"), `${JSON.stringify(metadata)}\n`, { flag: "wx" });
process.stdout.write(`${JSON.stringify({ ok: true, outDir, ...metadata })}\n`);
