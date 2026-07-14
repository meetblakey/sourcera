/** Local pr_lint half of the buyer-evaluation warehouse derivation gate. */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { findLine, push } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "buyer_evaluation_funnel_derivation_consistency";
const SOURCE_EVENTS = [
  "workspace_created",
  "procurement_completed",
  "workspace_archived",
  "workspace_canceled",
  "workspace_no_vendor_response_aborted",
];

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const event of SOURCE_EVENTS) {
    if (!findLine(doc, (line) => line.trim().startsWith(`| \`${event}\` |`))) {
      push(findings, doc, 0, event, `Appendix G source event ${event} is missing.`);
    }
  }
  for (const alias of ["buyer_evaluation_started", "buyer_evaluation_completed"]) {
    const emitter = findLine(doc, (line) => line.trim().startsWith(`| \`${alias}\` |`));
    if (emitter) push(findings, doc, emitter.line, alias, `Friendly alias ${alias} must remain a derived view; duplicate emitter rows are forbidden.`);
  }

  const derivation = findLine(doc, (line) => line.includes("Buyer-evaluation funnel derivation."));
  const tokens = [
    "No duplicate `buyer_evaluation_started` or `buyer_evaluation_completed` emitter exists",
    "`buyer_evaluation_started := workspace_created`",
    "`buyer_evaluation_completed := procurement_completed`",
    "`workspace_archived`, `workspace_canceled`, and `workspace_no_vendor_response_aborted` are terminal exits, not completions",
    "The join key is `workspace_id`",
    "retries dedupe by source `event_id`",
  ];
  for (const token of tokens) {
    if (!derivation?.text.includes(token)) push(findings, doc, derivation?.line ?? 0, token, `Buyer-evaluation derivation is missing contract: ${token}`);
  }

  const activation = findLine(doc, (line) => line.includes("Buyer evaluation start/completion labels are derived exactly as Appendix G specifies"));
  for (const token of ["activated `workspace_created` is start", "`procurement_completed` is completion", "archive, cancellation, and no-vendor-response abort are exits", "No duplicate alias event is emitted"]) {
    if (!activation?.text.includes(token)) push(findings, doc, activation?.line ?? 0, token, `§48.1 buyer funnel consumer is missing contract: ${token}`);
  }

  const m5 = findLine(doc, (line) => line.trim().startsWith(`| \`${GATE_ID}\` |`));
  for (const token of [
    "spec_binding_pending_pack_m02_3",
    `tools/spec-lint/gates/${GATE_ID}.ts`,
    "warehouse-model evidence",
  ]) {
    if (!m5?.text.includes(token)) push(findings, doc, m5?.line ?? 0, token, `§M.5 ${GATE_ID} row is missing local/external evidence boundary: ${token}`);
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Phase 9.1",
  rowClass: "content_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] { return findingsFor(ctx.masterSpec); },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
