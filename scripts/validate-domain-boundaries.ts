import path from "node:path";

import { validateDomainBoundaries } from "./domain-boundaries";

async function main() {
  const violations = await validateDomainBoundaries(path.resolve(__dirname, ".."));

  process.stdout.write(
    `${JSON.stringify({
      status: violations.length === 0 ? "passed" : "failed",
      violations,
    })}\n`,
  );

  if (violations.length > 0) process.exitCode = 1;
}

void main();
