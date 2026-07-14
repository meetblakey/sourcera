/** Gate: `buyer_entity_mutation_governance_contract`. */
import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor, sectionTextByTitle } from "./policy_ingestion_gate_helpers.js";

const GATE_ID = "buyer_entity_mutation_governance_contract";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByTitle(doc, /^4\.3\.1 Workspace \(Console-Scoped, Buyer\)$/), "§4.3.1 Workspace", ["`updated_by` | UUID (FK)", "Workspace updates MUST advance `updated_at` and `updated_by`"]);
  requireTokens(findings, doc, sectionTextByTitle(doc, /^4\.3\.2 Workspace Membership \(Console-Scoped, Buyer\)$/), "§4.3.2 Workspace Membership", ["`created_by` | UUID (FK)", "`updated_by` | UUID (FK)", "`updated_at` | Timestamp | Auto-updated"]);
  requireTokens(findings, doc, sectionTextByTitle(doc, /^4\.3\.3 Use Case \(Console-Scoped, Buyer\)$/), "§4.3.3 Use Case", ["**Indexes.**", "Workspace soft-delete cascades `deleted_at` to the Use Case"]);
  requireTokens(findings, doc, sectionTextByTitle(doc, /^4\.3\.5 Response \(Console-Scoped, Buyer\)$/), "§4.3.5 Response", ["`updated_by` | UUID (FK)", "**Indexes.**", "**Retention, DSAR, and residency.**"]);
  requireTokens(findings, doc, sectionTextByTitle(doc, /^4\.3\.10 Evaluation Pulse Event \(Console-Scoped, Buyer\)$/), "§4.3.10 Evaluation Pulse Event", ["**Attribution Convention Exception.**", "no `updated_by` exists because correction requires a new event", "**Indexes.**", "**Retention, DSAR, and residency.**"]);
  requireTokens(findings, doc, sectionTextByTitle(doc, /^4\.3\.13 Internal Comment Mention \(Workspace-Scoped, Buyer-Only\)$/), "§4.3.13 Internal Comment Mention", ["`updated_by` | UUID (FK)", "`updated_at` | Timestamp | Auto-updated"]);
  requireTokens(findings, doc, sectionTextByTitle(doc, /^4\.3\.19 Time-Saved Credit \(Org-Scoped, Cross-Console, Computed\)$/), "§4.3.19 Time-Saved Credit", ["`created_by` | UUID (FK)", "`updated_by` | UUID (FK)"]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "6.8.4.3-cascade-class-coverage-registry"), "§6.8.4.3 actor fields", ["Pattern B on `created_by`, `updated_by` | Body content scanned", "Pattern B on `scorer_id`, `created_by`, `updated_by`", "Pattern B on `created_by` | Hard-delete pulse rows"]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = { id: GATE_ID, sourcePhase: "v7.1.1 Buyer entity mutation-governance closure", rowClass: "spec_tree_lint", executionContext: "pr_lint", overridePath: "not_permitted_audit_log_integrity", inputs: { masterSpec: true }, version: "1.0.0", run(ctx: GateContext): Finding[] { return findingsFor(ctx.masterSpec); } };
if (isEntrypoint(import.meta.url)) void runGateCli(gate);
