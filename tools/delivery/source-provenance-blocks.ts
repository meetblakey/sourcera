#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  registeredLinearSourceProvenance,
  resolveRegisteredSourceChecksum,
  verifySourceChecksumContract,
  type SourceChecksumContract,
} from "./lib/source-checksums.js";

const arguments_ = new Map<string, string>();
for (let index = 2; index < process.argv.length; index += 2) {
  const name = process.argv[index];
  const value = process.argv[index + 1];
  if (
    !["--contract", "--source-id"].includes(name ?? "") ||
    !value ||
    value.startsWith("--") ||
    arguments_.has(name)
  ) {
    throw new Error(`Invalid argument near ${name ?? "end"}`);
  }
  arguments_.set(name, value);
}

const contractPath = resolve(
  arguments_.get("--contract") ?? "delivery/ticket-source-checksums.json",
);
const contract = JSON.parse(
  readFileSync(contractPath, "utf8"),
) as SourceChecksumContract;
const findings = verifySourceChecksumContract(contract, process.cwd());
if (findings.length) {
  throw new Error(
    findings.map((finding) => `${finding.sourceId}: ${finding.message}`).join("\n"),
  );
}
const requested = arguments_.get("--source-id");
const sourceIds = contract.sources
  .map((row) => row.sourceId)
  .filter((sourceId) => !requested || sourceId === requested)
  .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
if (requested && sourceIds.length !== 1) {
  throw new Error(`Registered source ${requested} is missing`);
}
const sources = sourceIds.map((sourceId) =>
  registeredLinearSourceProvenance(
    resolveRegisteredSourceChecksum(sourceId, contract),
  )
);
process.stdout.write(
  `${JSON.stringify({ schemaVersion: 1, sources }, null, 2)}\n`,
);
