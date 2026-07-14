/**
 * Gate: `policy_ingestion_webhook_catalog_completeness`
 * Source phase: v7.2.0-REM Phase 10 (§M.5.19)
 *
 * Assertion: `policy.ingestion.*` events resolve across Appendix C/G/F and stay
 * buyer-Org scoped with no Console Bridge projection.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  POLICY_INGESTION_EVENTS,
  dottedToUnderscore,
  missingTokens,
  requireText,
  sectionText,
} from "./catalog_gate_helpers.js";

export const gate: SpecLintGate = {
  id: "policy_ingestion_webhook_catalog_completeness",
  sourcePhase: "v7.2.0-REM Phase 10",
  rowClass: "meta_catalog_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const cText = sectionText(doc, "appendix-c-v72rem-phase-10");
    const gText = sectionText(doc, "appendix-g-v72rem-phase-10");
    const findings: Finding[] = [
      ...missingTokens(doc, "appendix-c-v72rem-phase-10", "Appendix C Phase 10 Policy Ingestion block", POLICY_INGESTION_EVENTS),
      ...requireText(doc, "appendix-c-v72rem-phase-10", "Buyer-Org-scoped", "Policy Ingestion webhooks must remain Buyer-Org-scoped."),
      ...requireText(doc, "appendix-c-v72rem-phase-10", "No event crosses the Console Bridge", "Policy Ingestion webhooks must not cross the Console Bridge."),
      ...requireText(doc, "appendix-c-v72rem-phase-10", "webhook retry class (Appendix F.1)", "Policy Ingestion webhooks must bind to Appendix F.1 standard retry."),
    ];
    for (const event of POLICY_INGESTION_EVENTS) {
      if (!cText.includes(event)) {
        findings.push({
          file: doc.path,
          line: 0,
          anchor: "appendix-c-v72rem-phase-10",
          matched_text: event,
          message: `Appendix C is missing ${event}.`,
        });
      }
      const mirror = dottedToUnderscore(event);
      if (!gText.includes(mirror)) {
        findings.push({
          file: doc.path,
          line: 0,
          anchor: "appendix-g-v72rem-phase-10",
          matched_text: mirror,
          message: `Appendix G is missing ${mirror} mirror for ${event}.`,
        });
      }
    }
    const consoleBridgeEnumText = sectionText(doc, "appendix-j-v72rem-phase-6").split("**`console_bridge_event_direction`**")[0] ?? "";
    if (/policy\./.test(consoleBridgeEnumText)) {
      findings.push({
        file: doc.path,
        line: 0,
        anchor: "appendix-j-v72rem-phase-6",
        matched_text: "policy.",
        message: "Policy Ingestion must not register any policy.* Console Bridge event kind.",
      });
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
