/**
 * Sourcera Spec-Lint — single-gate dispatcher.
 *
 *   npx tsx run-gate.ts <gate_id> --spec ../../Sourcera_Master_Spec.md [--ux ...]
 *
 * Convenience entrypoint that resolves a gate id to its detector and runs it
 * through the standard CLI (emit + exit code). Equivalent to invoking the gate
 * file directly; provided so CI / operators can dispatch by id.
 */

import { runGateCli } from "./lib/gate.js";
import { GATES } from "./run-all.js";

const id = process.argv[2];
const gate = GATES.find((g) => g.id === id);
if (!gate) {
  process.stderr.write(
    `Unknown gate "${id ?? "<none>"}". Known: ${GATES.map((g) => g.id).join(", ")}\n`,
  );
  process.exit(2);
}
// Shift argv so runGateCli's flag parser sees flags after the gate id.
process.argv.splice(2, 1);
void runGateCli(gate);
