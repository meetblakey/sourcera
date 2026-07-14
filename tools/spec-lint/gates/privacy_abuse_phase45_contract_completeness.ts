/**
 * Gate: `privacy_abuse_phase45_contract_completeness`
 * Source defects: D-45-006, D-45-011, D-45-012, D-45-013,
 * D-45-015, D-45-016, D-45-017, D-45-022.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { lineForToken } from "./catalog_gate_helpers.js";

type RequiredToken = {
  token: string;
  message: string;
};

const REQUIRED: RequiredToken[] = [
  { token: "### 45.1.1 Subprocessor Change Control", message: "§45.1.1 subprocessor change-control contract is missing." },
  { token: "SubprocessorChangeRecord", message: "SubprocessorChangeRecord contract is missing." },
  { token: "SubprocessorObjection", message: "SubprocessorObjection contract is missing." },
  { token: "30 calendar days before `effective_at`", message: "Contractual default subprocessor notice window is missing." },
  { token: "### 45.2.1 Input and Upload Validation", message: "§45.2.1 input/upload validation contract is missing." },
  { token: "### 45.2.2 Third-Party Outage Posture", message: "§45.2.2 dependency-outage matrix is missing." },
  { token: "**Reporter-identity firewall.**", message: "§45.3 reporter-identity firewall is missing." },
  { token: "Pseudonymous Analytics Identifier", message: "Analytics pseudonymity glossary contract is missing." },
  { token: "HTTP API JSON request | decompressed\\_body\\_bytes", message: "§39 JSON body-byte singleton is missing." },
  { token: "HTTP API JSON request | nesting\\_depth", message: "§39 JSON nesting-depth singleton is missing." },
  { token: "HTTP API JSON request | node\\_count", message: "§39 JSON node-count singleton is missing." },
  { token: "HTTP API multipart request | part\\_count", message: "§39 multipart part-count singleton is missing." },
  { token: "SubprocessorChangeRecord / SubprocessorObjection (§45.1.1)", message: "§40.2 subprocessor retention row is missing." },
  { token: "`request_body_too_large`", message: "Appendix I request-body error is missing." },
  { token: "`request_content_type_unsupported`", message: "Appendix I media-type error is missing." },
  { token: "`request_schema_invalid`", message: "Appendix I request-schema error is missing." },
  { token: "`request_structure_too_complex`", message: "Appendix I structure-complexity error is missing." },
  { token: "`subprocessor_active_objection_processing_blocked`", message: "Appendix I active-objection processing block is missing." },
  { token: "**`subprocessor_change_kind`:**", message: "Appendix J subprocessor change-kind enum is missing." },
  { token: "**`subprocessor_change_state`:**", message: "Appendix J subprocessor change-state enum is missing." },
  { token: "**`subprocessor_objection_state`:**", message: "Appendix J subprocessor objection-state enum is missing." },
  { token: "`privacy.subprocessor_change.notice_published`", message: "Appendix C privacy notice event is missing." },
  { token: "`privacy.subprocessor_objection.resolved`", message: "Appendix C privacy objection-resolution event is missing." },
  { token: "`privacy_subprocessor_change_notice_published`", message: "Appendix G privacy notice mirror is missing." },
  { token: "`privacy_subprocessor_objection_resolved`", message: "Appendix G privacy objection-resolution mirror is missing." },
  { token: "| Public Privacy Policy | §45.1, §47.4 |", message: "Appendix M public privacy-policy surface row is missing." },
  { token: "| DPA Request / Download | §45.1, §6.8, §47.4 |", message: "Appendix M DPA surface row is missing." },
  { token: "| Subprocessor List and Change Log | §45.1.1 |", message: "Appendix M subprocessor public surface row is missing." },
  { token: "| Subprocessor Objection Workflow | §45.1.1 |", message: "Appendix M objection surface row is missing." },
  { token: "| Marketplace Abuse Seller Appeal | §4.5.7, §27.8.6, §45.3 |", message: "Appendix M seller-appeal surface row is missing." },
  { token: "| Marketplace Abuse Ops Triage Queue | §27.8, §42.3.1, §50.16, §45.3 |", message: "Appendix M Ops triage surface row is missing." },
];

const FORBIDDEN = [
  "Aggregated anonymized metrics sent to PostHog",
  "No PII in analytics events",
  "Anti-Spam & Abuse Controls (Signal Integrity Monitor — SIM, Summary C.100)",
];

export const gate: SpecLintGate = {
  id: "privacy_abuse_phase45_contract_completeness",
  sourcePhase: "v7.1.1 Phase 45 P2 privacy and abuse closure",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_console_firewall",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (const required of REQUIRED) {
      if (!doc.text.includes(required.token)) {
        findings.push({
          file: doc.path,
          line: 1,
          matched_text: required.token,
          message: required.message,
        });
      }
    }

    for (const forbidden of FORBIDDEN) {
      if (doc.text.includes(forbidden)) {
        findings.push({
          file: doc.path,
          line: lineForToken(doc, forbidden),
          matched_text: forbidden,
          message: "Retired or unfalsifiable Phase 45 wording remains active.",
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
