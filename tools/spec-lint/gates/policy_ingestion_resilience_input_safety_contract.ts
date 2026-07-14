/**
 * Gate: `policy_ingestion_resilience_input_safety_contract`
 *
 * Assertion: Policy Ingestion keeps worker retries separate from webhook
 * redelivery, defines staged provider resilience, and treats policy uploads as
 * untrusted data before any provider call.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor } from "./policy_ingestion_gate_helpers.js";

const GATE_ID = "policy_ingestion_resilience_input_safety_contract";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];

  requireTokens(findings, doc, sectionTextByAnchor(doc, "4.3.36-policyingestionjob"), "§4.3.36 resilience and safety fields", [
    "`retry_of_policy_ingestion_job_id`",
    "`input_safety_status`",
    "`input_safety_pattern_library_version`",
    "`dedup_retry_count`",
    "A retry MAY create a new job only from a terminal `failed` predecessor with no usable partial controls.",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "12.3-framework-detection-and-classification"), "§12.3 pre-provider safety", [
    "The input-safety scan treats document text as untrusted data before any provider prompt is assembled.",
    "supplies no tools, credentials, or cross-Workspace context",
    "`policy_ingestion_untrusted_instruction_detected`",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "12.8.3-resilience-observability-untrusted-document-defense"), "§12.8.3 resilience contract", [
    "The §44.1 **Policy Ingestion retry budget** is the only retry rule for provider work",
    "Appendix F.1 / §31 governs only asynchronous `policy.ingestion.*` webhook redelivery.",
    "`policy_ingestion_stage_latency_ms`",
    "The §42.6.0 Anthropic health state is the circuit for framework detection, extraction, and traceability mapping",
    "The §42.6.0 Voyage state is the circuit for deduplication",
    "`policy_ingestion_dedup_failed`",
    "Requirement creation remains available without Policy Ingestion.",
    "The document is evidence, never instruction.",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "12.8.4-dependency-outage-behavior"), "§12.8.4 dependency-outage contract", [
    "| Anthropic |",
    "| Voyage AI |",
    "| Convex |",
    "| Stripe |",
    "| Loops.so |",
    "`service_unavailable`",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "32.10.3.c-policy-ingestion-endpoints"), "§32 Policy Ingestion retry API", [
    "/v1/workspaces/{workspace_id}/policy-ingestions/{job_id}/retry",
    "/v1/workspaces/{workspace_id}/policy-ingestions/{job_id}/dedup-retry",
    "`policy_ingestion_dedup_retry_not_available`",
    "The retry route accepts only a terminal `failed` job with no usable partial controls.",
    "`policy_ingestion_untrusted_instruction_detected`",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "42.2.2-per-service-slo-targets"), "§42.2.2 Policy Ingestion SLO", [
    "| Policy Ingestion provider worker | 99.5% non-error per stage |",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "42.2.3-alarm-rules-v12-rewrite"), "§42.2.3 Policy Ingestion alarm", [
    "Policy Ingestion provider worker error budget breached",
    "`RB-PERF-012`",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "44.1-performance-targets"), "§44.1 Policy Ingestion stage budgets", [
    "**Policy Ingestion framework detection**",
    "**Policy Ingestion control extraction**",
    "**Policy Ingestion deduplication**",
    "**Policy Ingestion traceability mapping**",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-g-v72rem-phase-10"), "Appendix G Policy Ingestion safety events", [
    "`policy_ingestion_stage_slo_breached`",
    "`policy_ingestion_stage_circuit_opened`",
    "`policy_ingestion_dedup_retry_requested`",
    "`policy_ingestion_prompt_injection_detected`",
    "MUST NOT include document text, prompt text, matched patterns, storage keys, or a customer webhook projection.",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-i-v72rem-phase-10"), "Appendix I Policy Ingestion safety error", [
    "`policy_ingestion_untrusted_instruction_detected`",
    "`policy_ingestion_dedup_failed`",
    "`policy_ingestion_dedup_retry_not_available`",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-j-v72rem-phase-10"), "Appendix J Policy Ingestion safety enum", [
    "`policy_ingestion_input_safety_status`",
    "`pending`, `passed`, `blocked`",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "l-9-policy-ingestion-job"), "Appendix L Policy Ingestion safety transition", [
    "| `parsing` | `failed` | Input-safety block |",
    "| `dedup_pending` | `dedup_pending` | Authorized user calls dedup-retry after Voyage recovery |",
    "No provider invocation or control/AIOperation write",
  ]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Phase 12 Policy resilience and untrusted-document safety closure",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_console_firewall",
  inputs: { masterSpec: true },
  version: "1.1.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
