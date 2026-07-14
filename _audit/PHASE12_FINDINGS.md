# Phase 12 Findings — §12 Policy-Powered Requirement Generation Audit

**Scope.** Master Spec §12.1 – §12.9, plus all cross-cutting referents: §4 (entity convention), §5.8 / §5.11 (RBAC + Feature Access Matrix), §10.6 / §10.7 (Amendment Protocol inline definition), §22.4 / §27.6 (cross-spec dedup thresholds), §29 / Appendix C (Notification Event Catalog), §31 (webhooks), §32.5 (API endpoint catalog), §34.1.1 (Plan Tier Definitions, Buyer side), §34.3.4 (capability rate card), §34.8.5 (Entitlement Matrix), §39 (Object Size Constraints), Appendix F (webhook retry curve), Appendix G (PostHog Event Taxonomy), Appendix I (Error Code Catalog), Appendix J (Controlled Vocabulary Registry), Appendix K (Glossary), Appendix L (Entity State Machines), Appendix M (Surface/Engine Mapping).

**Verdict.** §12 fails the v7.1.0 production-readiness bar. The section reads like a v6.0.0 narrative draft that was never re-pulled through the v7.x convention pipeline (§4 entity blocks, §31 webhook contracts, §32 endpoint catalog, §39 numerical singletons, Appendix J/K/L/M registrations). It cross-cites §34.1.1 / §34.3.4 / §39 in the §12.8 preamble but the actual table cells continue to inline-restate plan-tier numerics in violation of Authoring Convention #10. There is no Policy Ingestion entity in §4, no state machine in Appendix L, no API endpoint in §32.5, no webhook in §31, no Appendix M row, and the §12.9 acceptance criteria omit Solo-tier behavior, console-firewall enforcement, residency partition, DSAR cascade, and the Appendix M-declared mobile-parity split (upload supported / review unsupported).

**Defect-ID convention.** Per the Defect Ledger Format amendment ratified by `D-0V-007` (2026-04-29), this prompt uses `D-12-NNN`.

**Severity mix (final).** 0 P0 · 13 P1 · 9 P2 · 4 P3. The section is unbuildable as written; the P1 cluster is concentrated on missing convention blocks (entity, state machine, API, webhook, Appendix M, retention/DSAR/residency, plan-gating duplication, error codes, console firewall) rather than on isolated drafting defects, which means a clean remediation requires a §12-rewrite Phase rather than spot edits.

## Counterfactual Pass — Failure Modes Mandated for §12

For each scoped capability the audit enumerated three realistic failure modes and confirmed §12's coverage:

| Capability | Failure mode | §12 coverage | Defect filed |
|---|---|---|---|
| Framework detection | Anthropic Opus outage during `framework_inference` | Silent — §12.3.1 declares the streaming call but does not declare retry / circuit-break / fallback to manual selection | `D-12-008` |
| Framework detection | Document is multi-framework (e.g., SOC 2 + ISO 27001 jointly) and confidence splits 0.55/0.45 | Silent — §12.3.1 confidence-threshold logic only handles single-framework `< 0.60` rejection | `D-12-006` |
| Framework detection | Adversarial input — PDF embedded with prompt-injection text | Silent — no §12.3 / §21.3 cite for guardrails on uploaded policy text | `D-12-016` |
| Control extraction | Token-limit partial extraction (187 of 234) with subsequent re-upload of remaining sections | Surface mentioned (toast text); engine state for "partial" extraction not modeled; no idempotency on re-upload | `D-12-007` |
| Control extraction | Concurrent uploads from same Workspace (two users upload SOC 2 simultaneously) | Silent — §12 has no concurrency control or idempotency | `D-12-019` |
| Control extraction | Anthropic Opus rate-limited (429) mid-stream | Partially covered (3x retry with 2s/4s/8s backoff) but conflicts with §31 / Appendix F retry curve (5 attempts, 1s/2s/4s/8s/16s) | `D-12-014` |
| Deduplication | Haiku embedding-API outage during dedup pass | Covered (§12.5.1 #6 — toast + manual continuation), but no engine-side mark of "dedup unavailable" on subsequent reports | `D-12-009` |
| Deduplication | Embedding model upgrade mid-flight (different vector dim) | Silent — no `embedding_model_version` field captured per control | `D-12-009` |
| Deduplication | Two near-duplicate controls from different framework families (e.g., ISO 2.1.1 vs NIST AC-3) — should they merge? | Silent — §12.5 doesn't define cross-framework merge semantics or whether `framework_reference` is preserved post-merge | `D-12-009` |
| Traceability | Sonnet returns guidance that exceeds 300-char cap mid-stream | Silent — no truncation / rejection rule | `D-12-005` |
| Traceability | Original document deleted before traceability pass completes | Silent — §12.6 Mapping Process step 3 names "original document text" as input but no retention / locking guarantee | `D-12-013` |
| Traceability | Document contains PII or HIPAA-regulated data (the policy itself describes PHI handling rules) | Silent — no residency / encryption-at-rest / k-anonymity statement on PolicyDocument | `D-12-013` |
| Conversion + Amendment | Workspace Owner who is the named reviewer is deprovisioned before review deadline | Silent — §12.7.2 names Workspace Owner as reviewer but no deprovisioning fall-through (cf. §5.9 Executive Sponsor cascade) | `D-12-010` |
| Conversion + Amendment | Review deadline expires (7 days) with amendments still PENDING_REVIEW | Silent — §12.7.2 declares the deadline but not the timeout behavior (auto-reject? auto-approve? escalate?) | `D-12-010` |
| Conversion + Amendment | User clicks "Accept All Recommendations" twice (double-submit) | Silent — no idempotency declaration on Batch Amendment UI actions | `D-12-019` |
| Plan Limits | Solo-tier user uploads a Policy document | Silent — §12.8.1 has no Solo column but §34.1.1 Solo cell exists ("Free Allowance + Engine-absorbed envelope per §44") | `D-12-011` |
| Plan Limits | Free-tier user exceeds Free Allowance mid-extraction | Partial — §12 cross-cites §34.3.4 capability for wallet-charging, but no §44.6 envelope check or "extraction halted at envelope exhaustion" AC | `D-12-018` |
| Plan Limits | Enterprise customer's wallet hard-cap is reached during a Policy Ingestion | Silent — Wallet HTTP 402 path not surfaced in §12.4.2 / §12.9 | `D-12-018` |
| Acceptance Criteria | Seller console caller hits a Buyer-side `/v1/workspaces/{ws}/policy-ingestions` URL | Silent — no console firewall AC | `D-12-022` |
| Acceptance Criteria | Mobile user attempts to review extracted requirements | Inconsistency — §12 silent; Appendix M lines 30864–30866 declare upload `supported` but review/dedup `not_supported` | `D-12-021` |
| Acceptance Criteria | DSAR right-to-erasure request hits a User who uploaded Policy Documents | Silent — §6.8 cascade not bound to PolicyDocument | `D-12-013` |

## Self-Challenge Pass

Adversarial re-read of every defect filed below; no severity downgrades, two recommendation tightenings:
- `D-12-001` recommendation tightened from "author a PolicyDocument entity" → "author PolicyDocument and PolicyControl entities", because §12.4 + §12.6 both implicate a persisted PolicyControl row.
- `D-12-009` evidence tightened to enumerate the four cross-spec dedup thresholds (§12.5.1 0.90; §22.4 0.92; §27.6 0.85; §22.7 0.95) and to file the inconsistency as a separate row (`D-12-020`).
- `D-12-018` re-checked: §44.6 Solo-envelope contract is the canonical billing-envelope, but §12 does not bind to it; the failure mode (Free Allowance exhaustion mid-stream) requires an explicit Convex transaction-level rollback story. Defect retained at P1.

No defect downgraded to "false alarm" on adversarial re-read. The section's silence on entity, state machine, API, webhook, Appendix M, retention, residency, and DSAR is structural, not stylistic.

## Promoted to DEFECT_LEDGER.md

All 26 defects (`D-12-001` through `D-12-026`) promoted to `DEFECT_LEDGER.md` at session close. Coverage Matrix cells for `F-265 Policy Ingestion` (and any sibling §12 inventory rows — F-266 Framework Detection, F-267 Control Extraction, F-268 Policy Dedup, F-269 Traceability Mapping, F-270 Amendment Protocol if registered separately) tightened in `COVERAGE_MATRIX.md` per the row-tightening pattern set by Phase 1.1 / 1.2.

## Forward References

- Phase 4 (RBAC + Acceptance Criteria) inherits `D-12-022` (console firewall AC) and `D-12-024` (DSAR cascade AC).
- Phase 6 (Privacy & Residency) inherits `D-12-013` (retention/DSAR/residency on PolicyDocument).
- Phase 8 (API + Webhook) inherits `D-12-002` (state machine), `D-12-003` (API endpoints), `D-12-004` (webhook contract), `D-12-014` (retry-curve drift).
- Phase 9 (Observability) inherits `D-12-015` (PostHog → webhook → notification trinity).
- Phase 10 (Surface/Engine Mapping) inherits `D-12-012` (Appendix M row).
- v7.1.1 stamp gate inherits `D-12-001`, `D-12-002`, `D-12-003`, `D-12-004`, `D-12-011`, `D-12-012`, `D-12-013`, `D-12-022` as P1-blocking remediations on §12.
