import { readFileSync } from "node:fs";
import path from "node:path";

import {
  verifySourceChecksumContract,
  type SourceChecksumContract,
} from "./lib/source-checksums.js";

function readArguments(arguments_: string[]) {
  if (
    arguments_.length !== 2 ||
    arguments_[0] !== "--contract" ||
    !arguments_[1]?.trim()
  ) {
    throw new Error("Usage: source-checksums --contract <path>");
  }
  return path.resolve(arguments_[1]);
}

const contractPath = readArguments(process.argv.slice(2));
const contract = JSON.parse(
  readFileSync(contractPath, "utf8"),
) as SourceChecksumContract;
const findings = verifySourceChecksumContract(contract, process.cwd());
const report = {
  schemaVersion: 1,
  passed: findings.length === 0,
  findings,
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (!report.passed) process.exitCode = 1;
