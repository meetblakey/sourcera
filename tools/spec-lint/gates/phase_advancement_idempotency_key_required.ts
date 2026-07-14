/**
 * Gate: `phase_advancement_idempotency_key_required`
 *
 * Assertion: §10.16 requires `Idempotency-Key`, defines the 24h replay cache,
 * and suppresses duplicate side effects on replay.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const ANCHOR = "10.16-phase-advancement-api";
const REQUIRED_TEXTS = [
  "Idempotency-Key: {client-generated UUID per §32.3 idempotency convention; required on every mutation per §32 conventions}",
  "**`Idempotency-Key` header** — required.",
  "The server caches the response keyed by `(Idempotency-Key, workspace_id, target_phase)` for 24 hours",
  "A client retrying after a network timeout re-uses the same `Idempotency-Key` and is guaranteed to advance the Workspace at most once.",
  "The endpoint MUST deduplicate retries for 24 hours by `(Idempotency-Key, workspace_id, target_phase)` and MUST NOT double-emit audit, webhook, Console Bridge, or PostHog side effects on replay.",
  "retrying the same `Idempotency-Key` MUST recover the cached response or the already-at-target no-op without duplicate side effects",
  "Replay tests MUST prove the same `Idempotency-Key` after a dependency failure or unknown commit result cannot double-write audit, webhook, Console Bridge, PostHog, or notification side effects.",
];

export const gate: SpecLintGate = {
  id: "phase_advancement_idempotency_key_required",
  sourcePhase: "V8.1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const section = findSectionByAnchor(doc, ANCHOR);
    if (!section) {
      return [{
        file: doc.path,
        line: 0,
        anchor: ANCHOR,
        message: "§10.16 Phase Advancement API section is missing.",
      }];
    }

    const text = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
    const findings: Finding[] = [];
    for (const required of REQUIRED_TEXTS) {
      if (!text.includes(required)) {
        findings.push({
          file: doc.path,
          line: section.startLine,
          anchor: ANCHOR,
          matched_text: required,
          message: `§10.16 idempotency contract is missing required binding: ${required}`,
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
