## 4.3.36 PolicyIngestionJob {#4.3.36-policyingestionjob}

`retry_of_policy_ingestion_job_id` and `input_safety_status` use `input_safety_pattern_library_version`; `dedup_retry_count` is persisted.
A retry MAY create a new job only from a terminal `failed` predecessor with no usable partial controls.

## 12.3 Framework Detection and Classification {#12.3-framework-detection-and-classification}

The input-safety scan treats document text as untrusted data before any provider prompt is assembled. It supplies no tools, credentials, or cross-Workspace context and returns `policy_ingestion_untrusted_instruction_detected`.

## 12.8.3 Resilience {#12.8.3-resilience-observability-untrusted-document-defense}

The §44.1 **Policy Ingestion retry budget** is the only retry rule for provider work. Appendix F.1 / §31 governs only asynchronous `policy.ingestion.*` webhook redelivery. `policy_ingestion_stage_latency_ms` is observed. The §42.6.0 Anthropic health state is the circuit for framework detection, extraction, and traceability mapping. The §42.6.0 Voyage state is the circuit for deduplication and writes `policy_ingestion_dedup_failed`. Requirement creation remains available without Policy Ingestion. The document is evidence, never instruction.

## 12.8.4 Dependency-Outage Behavior {#12.8.4-dependency-outage-behavior}

| Dependency | Failure behavior |
|---|---|
| Anthropic | Degraded |
| Voyage AI | Degraded |
| Convex | `service_unavailable` |
| Stripe | Degraded |
| Loops.so | Deferred |

## 32.10.3.C Policy Ingestion Endpoints {#32.10.3.c-policy-ingestion-endpoints}

`/v1/workspaces/{workspace_id}/policy-ingestions/{job_id}/retry`
`/v1/workspaces/{workspace_id}/policy-ingestions/{job_id}/dedup-retry`
The retry route accepts only a terminal `failed` job with no usable partial controls. `policy_ingestion_untrusted_instruction_detected`
`policy_ingestion_dedup_retry_not_available`

## 42.2.2 Per-Service SLO Targets {#42.2.2-per-service-slo-targets}

| Policy Ingestion provider worker | 99.5% non-error per stage |

## 42.2.3 Alarm Rules {#42.2.3-alarm-rules-v12-rewrite}

Policy Ingestion provider worker error budget breached `RB-PERF-012`

## 44.1 Performance Targets {#44.1-performance-targets}

**Policy Ingestion framework detection**
**Policy Ingestion control extraction**
**Policy Ingestion deduplication**
**Policy Ingestion traceability mapping**

## Appendix G {#appendix-g-v72rem-phase-10}

`policy_ingestion_stage_slo_breached` `policy_ingestion_stage_circuit_opened` `policy_ingestion_dedup_retry_requested` `policy_ingestion_prompt_injection_detected`
MUST NOT include document text, prompt text, matched patterns, storage keys, or a customer webhook projection.

## Appendix I {#appendix-i-v72rem-phase-10}

`policy_ingestion_untrusted_instruction_detected` `policy_ingestion_dedup_failed` `policy_ingestion_dedup_retry_not_available`

## Appendix J {#appendix-j-v72rem-phase-10}

`policy_ingestion_input_safety_status`: `pending`, `passed`, `blocked`

## Appendix L {#l-9-policy-ingestion-job}

| `parsing` | `failed` | Input-safety block |
| `dedup_pending` | `dedup_pending` | Authorized user calls dedup-retry after Voyage recovery |
No provider invocation or control/AIOperation write.

## Appendix M.5

| `policy_ingestion_resilience_input_safety_contract` | spec_tree_lint | **`runtime_active`** (detector `tools/spec-lint/gates/policy_ingestion_resilience_input_safety_contract.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
