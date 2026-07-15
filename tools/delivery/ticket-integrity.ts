#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  scanTicketIntegrity,
  type TicketIntegrityCapture,
  type TicketIntegritySnapshot,
  type TicketSourceChecksumContract,
} from "./lib/ticket-integrity.js";

function argumentsByName(): Map<string, string> {
  const values = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 2) {
    const name = process.argv[index];
    const value = process.argv[index + 1];
    if (!name?.startsWith("--") || !value) {
      throw new Error(`Invalid argument near ${name ?? "end of command"}`);
    }
    values.set(name, value);
  }
  return values;
}

function main(): void {
  const argv = argumentsByName();
  const snapshotPath = argv.get("--snapshot");
  const capturePath = argv.get("--capture");
  if (!snapshotPath || !capturePath) {
    throw new Error("--snapshot and --capture are required");
  }
  const snapshot = JSON.parse(
    readFileSync(resolve(snapshotPath), "utf8"),
  ) as TicketIntegritySnapshot;
  const capture = JSON.parse(
    readFileSync(resolve(capturePath), "utf8"),
  ) as TicketIntegrityCapture;
  const checksumPath = argv.get("--checksum-contract");
  const checksumContract = checksumPath
    ? JSON.parse(
        readFileSync(resolve(checksumPath), "utf8"),
      ) as TicketSourceChecksumContract
    : undefined;
  const report = scanTicketIntegrity(snapshot, capture, checksumContract);
  const json = `${JSON.stringify(report, null, 2)}\n`;
  const outPath = argv.get("--out");
  if (outPath) writeFileSync(resolve(outPath), json);
  else process.stdout.write(json);
  if (!report.passed) process.exitCode = 1;
}

try {
  main();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
