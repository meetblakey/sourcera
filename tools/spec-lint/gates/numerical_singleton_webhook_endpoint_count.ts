/**
 * Gate: `numerical_singleton_webhook_endpoint_count`
 * Source defects: D-8.2-021, D-8.2-022.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const REQUIRED = [
  "Endpoint-cap authority and pooling",
  "one Org-pooled endpoint set across both consoles",
  "maximum of the buyer-tier and seller-tier limits",
  "Per §34.1.1 / §34.1.2 cell **Webhook Endpoints**",
];

const FORBIDDEN = [
  /Free\s+1\s*\/\s*Starter\s+5\s*\/\s*Growth\s+25\s*\/\s*Scale\s+50\s*\/\s*Enterprise\s+100/i,
  /Solo\s+1\s*\/\s*Starter\s+5\s*\/\s*Growth\s+25\s*\/\s*Scale\s+50\s*\/\s*Enterprise\s+100/i,
];

export const gate: SpecLintGate = {
  id: "numerical_singleton_webhook_endpoint_count",
  sourcePhase: "v7.1.1 Phase 8.2 webhook residual P2/P3 closure",
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_entitlement_drift",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const section = findSectionByAnchor(doc, "31.5-webhook-configuration-and-limits");
    if (!section) {
      return [{ file: doc.path, line: 1, message: "§31.5 is missing; webhook endpoint singleton cannot be verified." }];
    }
    const text = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
    const findings: Finding[] = [];
    for (const token of REQUIRED) {
      if (!text.includes(token)) {
        findings.push({ file: doc.path, line: section.startLine, anchor: section.heading.anchor, matched_text: token, message: "§31.5 is missing the canonical Org-pooled endpoint-cap contract." });
      }
    }
    for (const pattern of FORBIDDEN) {
      const match = pattern.exec(text);
      if (match) {
        findings.push({ file: doc.path, line: section.startLine, anchor: section.heading.anchor, matched_text: match[0], message: "§31.5 duplicates the §34.1 webhook endpoint ladder inline." });
      }
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
