import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  buildSourceChecksumCandidate,
  verifySourceChecksumContract,
  type SourceChecksumContract,
} from "./lib/source-checksums.js";

function readArguments(arguments_: string[]) {
  const values = new Map<string, string>();
  const allowed = new Set(["--contract", "--candidate-out"]);
  for (let index = 0; index < arguments_.length; index += 2) {
    const name = arguments_[index];
    const value = arguments_[index + 1];
    if (!allowed.has(name) || !value?.trim() || values.has(name)) {
      throw new Error(
        "Usage: source-checksums --contract <path> [--candidate-out <path>]",
      );
    }
    values.set(name, value);
  }
  const contract = values.get("--contract");
  if (!contract) {
    throw new Error(
      "Usage: source-checksums --contract <path> [--candidate-out <path>]",
    );
  }
  return {
    contractPath: path.resolve(contract),
    candidatePath: values.has("--candidate-out")
      ? path.resolve(values.get("--candidate-out")!)
      : null,
  };
}

const { contractPath, candidatePath } = readArguments(process.argv.slice(2));
const contract = JSON.parse(
  readFileSync(contractPath, "utf8"),
) as SourceChecksumContract;
const candidate = candidatePath
  ? buildSourceChecksumCandidate(contract, process.cwd())
  : null;
if (candidatePath) {
  if (candidatePath === contractPath) {
    throw new Error("--candidate-out must not overwrite --contract");
  }
  if (candidate!.findings.length === 0) {
    writeFileSync(
      candidatePath,
      `${JSON.stringify(candidate!.contract, null, 2)}\n`,
      { encoding: "utf8", flag: "wx", mode: 0o600 },
    );
  }
}
const findings = candidate?.findings ??
  verifySourceChecksumContract(contract, process.cwd());
const report = {
  schemaVersion: 1,
  passed: findings.length === 0,
  ...(candidatePath && findings.length === 0 ? { candidate: candidatePath } : {}),
  findings,
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (!report.passed) process.exitCode = 1;
