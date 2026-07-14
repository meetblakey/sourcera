/**
 * Gate: `match_score_mobile_provenance_contract`
 *
 * Assertion: Match Score's mobile provenance surface retains the established
 * plan, scope, stale-data, accessibility, telemetry, parity, and mapping
 * contract without creating a divergent mobile scoring path.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "match_score_mobile_provenance_contract";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "27.4.6.1-mobile-provenance-panel"), "§27.4.6.1 mobile provenance", [
    "**Authored Extension — requires human sign-off.**",
    "At `mobile_xs` / `mobile_sm`, a tier-eligible Buyer or Seller taps **Why this match?** to open one contextual bottom sheet.",
    "It is not a drawer, Side Peek, or generic Modal.",
    "Free / Starter label-only views have no provenance opener and never fetch a provenance payload.",
    "client rebucketing and client-side feature recomputation are forbidden.",
    "If the snapshot is stale or re-fetch fails, the sheet closes and the parent surface follows §27.4.7's `insufficient_signal` fallback",
    "On cache invalidation, plan downgrade, console switch, party-scope change, or breakpoint reflow, the client discards the open projection",
    "Focus moves into the sheet and returns to the opener on close",
    "match_score.provenance.opened",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "38.8.2-mobile-feature-parity-matrix"), "§38.8.2 Match Score parity row", [
    "| Marketplace — Match Score + provenance | parity | supported | supported |",
    "§27.4.6.1 contextual bottom sheet",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-m-surface-engine-mapping"), "Appendix M Match Score mobile mapping", [
    "On `mobile_xs` / `mobile_sm`, the entitled panel is the §27.4.6.1 contextual bottom sheet",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-g-posthog-event-taxonomy"), "Appendix G Match Score mobile observability", [
    "| `match_score_provenance_opened` | Body ref `match_score.provenance.opened`; a Growth+ user opens the §27.4.6.1 mobile provenance sheet |",
  ]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Match Score mobile provenance closure",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
