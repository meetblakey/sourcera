/**
 * Gate: `solo_unmet_gate_lifecycle_contract`
 *
 * Assertion: Solo soft-gate actions remain audit-only, preserve the existing
 * compact phase webhook, and retain their privacy/retention/firewall contract.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "solo_unmet_gate_lifecycle_contract";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(
    findings,
    doc,
    sectionTextByAnchor(doc, "2.8.3.1-unmet-gate-audit-delivery-retention-dsar"),
    "§2.8.3.1 Solo unmet-gate lifecycle contract",
    [
      "**Authored Extension — requires human sign-off.**",
      "contains only registered Appendix J gate identifiers",
      "MUST NOT contain a `user_id`, email, display name, free text, response content, seller identifier, or vendor identifier",
      "are **audit-only actions**, not individually subscribable webhook or Appendix C events",
      "`workspace.phase_advanced` webhook once, with `soft_gate_skip=true`",
      "MUST NOT include `unmet_gate_ids[]`",
      "A mode change emits no webhook.",
      "Neither action creates a separate Appendix G / PostHog event.",
      "MUST NOT carry `soft_gate_skip`, `unmet_gate_ids[]`, or `evaluation_owner_mode`",
      "read-time, deduplicated projection",
      "It has no independent persisted row.",
      "loading, stale, error, and retry states",
      "7-year AuditEvent retention",
      "§6.8.4.1 Pattern B",
      "Organization.data_residency_region",
      "cross-region and cross-console reads fail closed",
    ],
  );
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Phase 2 Solo unmet-gate lifecycle closure",
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
