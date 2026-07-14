/**
 * Gate: `workspace_template_entitlement_singleton`
 *
 * Assertion: §34.1.1 cell "Custom Templates (author / share)" is the only
 * buyer-plan entitlement source for WorkspaceTemplate author/share behavior.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  findLine,
  m5RuntimeActiveFindings,
  push,
  requireTokens,
  sectionTextByTitle,
} from "./workspace_template_gate_helpers.js";

const FORBIDDEN_TIER_RE = /\b(?:Buyer Free|Buyer Solo|Business Starter|Growth|Scale|Enterprise)\b/;

function entitlementFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const storage = sectionTextByTitle(doc, "19.6.1 Template Storage");
  requireTokens(findings, doc, storage, "§19.6.1", [
    "§34.1.1 cell **Custom Templates (author / share)**",
    "§5.11 Template Library row group",
    "§19 does not restate per-tier values",
    "On downgrade to a plan where the §34.1.1 cell removes author / share availability",
  ]);
  if (storage) {
    const forbidden = FORBIDDEN_TIER_RE.exec(storage.text);
    if (forbidden) {
      push(
        findings,
        doc,
        storage.startLine,
        forbidden[0],
        "§19.6.1 must not restate tier-specific Template Library entitlement values; cite §34.1.1 cell Custom Templates instead.",
      );
    }
  }

  const rbacRow = findLine(doc, (line) =>
    line.includes("**Template Library (§19; buyer-console WorkspaceTemplate, plan-gated per §34.1.1 cell Custom Templates)**"),
  );
  if (!rbacRow) {
    push(findings, doc, 0, "Template Library (§19; buyer-console WorkspaceTemplate", "§5.11 Template Library row group must cite the §34.1.1 Custom Templates entitlement cell.");
  }

  const entitlementRow = findLine(doc, (line) => line.trim().startsWith("| **Custom Templates (author / share)** |"));
  if (!entitlementRow) {
    push(findings, doc, 0, "Custom Templates (author / share)", "§34.1.1 Custom Templates entitlement row is missing.");
  } else {
    for (const token of ["WorkspaceTemplate rows (§4.3.29)", "source for §19.6.1", "§5.11 Template Library row group"]) {
      if (!entitlementRow.text.includes(token)) {
        push(findings, doc, entitlementRow.line, token, `§34.1.1 Custom Templates row is missing required singleton token: ${token}`);
      }
    }
  }

  return findings;
}

export const gate: SpecLintGate = {
  id: "workspace_template_entitlement_singleton",
  sourcePhase: "v7.2.0-REM Phase 4.10",
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [...entitlementFindings(ctx.masterSpec), ...m5RuntimeActiveFindings(ctx.masterSpec, "workspace_template_entitlement_singleton")];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
