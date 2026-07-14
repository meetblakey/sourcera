/**
 * Gate: `appendix_c_webhook_catalog_completeness`
 * Source phase: v7.2.0-REM Phase 6 (§M.5.18)
 *
 * Assertion: the Phase 6 and Phase 10 catalog-completeness webhook rows in
 * Appendix C remain present exactly once.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  PHASE_6_EVENTS,
  POLICY_INGESTION_EVENTS,
  duplicateTokens,
  missingTokens,
  requireText,
} from "./catalog_gate_helpers.js";

export const gate: SpecLintGate = {
  id: "appendix_c_webhook_catalog_completeness",
  sourcePhase: "v7.2.0-REM Phase 6",
  rowClass: "meta_catalog_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...requireText(
        doc,
        "appendix-c-notification-event-catalog",
        "Every webhook event named anywhere in the spec body MUST appear in this appendix exactly once.",
        "Appendix C is missing the coverage invariant for exactly-once webhook registration.",
      ),
      ...missingTokens(doc, "appendix-c-v72rem-phase-10", "Appendix C Phase 10 Policy Ingestion block", POLICY_INGESTION_EVENTS),
      ...duplicateTokens(doc, "appendix-c-v72rem-phase-10", "Appendix C Phase 10 Policy Ingestion block"),
      ...missingTokens(doc, "appendix-c-v72rem-phase-6", "Appendix C Phase 6 catalog-completeness block", PHASE_6_EVENTS),
      ...duplicateTokens(doc, "appendix-c-v72rem-phase-6", "Appendix C Phase 6 catalog-completeness block"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
