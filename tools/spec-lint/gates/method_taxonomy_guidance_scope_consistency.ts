/**
 * Gate: `method_taxonomy_guidance_scope_consistency`
 *
 * Assertion: Method guidance never creates a second buyer workflow, vendor
 * shortlisting stages never shadow the §10 pipeline, and §44.6 points readers
 * to the separate non-AI Solo suppressions.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "method_taxonomy_guidance_scope_consistency";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "2.1-overview"), "§2.1 Method guidance scope", [
    "Users MAY opt out of Method guidance (instructional copy and recommended prompts)",
    "every Buyer Workspace remains on the same canonical platform phases, roles, and controls",
    "there is no Method-disabled workflow or alternate lifecycle.",
    "MUST NOT define alternate phase names, alternate duration totals, or a parallel procurement lifecycle.",
    "MUST NOT bypass Workspace, Use Case, Requirement, phase-advancement, RBAC, audit, retention, or pricing constraints",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "2.4.1-shortlisting-stages"), "§2.4.1 shortlisting taxonomy", [
    "The Sourcera Method recommends a two-stage vendor filtering approach:",
    "**Stage 1: Initial Screening (RFI; Weeks 0–1)**",
    "**Stage 2: Deep Evaluation (RFP; Weeks 2–6)**",
    "§10.5 / §10.6 remain the phase-gate authority.",
    "Scoring during Phases 10–11 (see Section 10 for phase definitions).",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "44.6.1-surface-hide-list"), "§44.6.1 non-AI Solo-suppression locator", [
    "**Non-AI Solo-suppression locator.**",
    "stakeholder-cohort role chips and controls, cohort-reassignment rate and vacancy action",
    "§2.6.1 / §2.6.1.A, §2.8.4, §20.1.1, and Appendix M.1 govern the separate Buyer-Workspace suppression set",
    "This locator does not create a second hide list or change any current entitlement, audit, or rendering rule.",
  ]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Phase 2 Method taxonomy and scope closure",
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
