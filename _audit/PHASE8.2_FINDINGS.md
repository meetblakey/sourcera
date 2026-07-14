# PHASE 8.2 — §31 Webhooks & Appendix F Retry — Audit Scratch Log

**Walked.** Sourcera_Master_Spec.md v7.1.0; sections §31.1–§31.9 end-to-end; Appendix F (retry curves); cross-walk against Appendix C (Notification Event Catalog), Appendix G (PostHog Event Taxonomy), Appendix I (API Error Codes), Appendix J (Controlled Vocabulary), Appendix L (Entity State Machines L.1–L.7), §29.1 / §29.5 (legacy notification block), §22 KB webhooks, §27 marketplace webhooks, §50 Ops Console webhooks, §13.11 Defense View, §25.3 Disqualification, §25.7 Internal Comments, §32 API surface couplings.

**Walk pattern.** Per-webhook 7-check audit (HMAC + rotation, idempotency, retry curve, DLQ, payload size, schema versioning, Appendix C/G registration). Reverse-pass walk Appendix L L.1–L.7 + AIWallet (§4.8.3) + CommittedSpendContract (§4.8.8) + ContestRecord (§4.8.5) + Plan-Tier (§4.2.1) state-machine transitions against §31 / §31.8 / §31.9 webhook catalogs. Counterfactual pass enumerated 3+ failure modes per webhook family.

**Severity totals (Phase 8.2 first walk).** P0 = 0; P1 = 20; P2 = 15; P3 = 3; total = 38. Halt rule (zero P0) **PASSES**. No buyer/seller console firewall breach, no PII / PCI exposure, no GDPR / data-residency hard violation surfaced; defects accumulate around (a) general-envelope schema-versioning omissions, (b) retry-curve numerical-singleton drift across ≥ 5 inconsistent citations, (c) entity-state-machine reverse-pass coverage gaps for revenue-affecting transitions (BuyerReferral, ProTrialSeatGrant, KBDocument, AIWallet, CommittedSpendContract, ContestRecord), and (d) downstream feature stubs (§31.3, §31.4, subscription model, secret-rotation flow, DLQ entity).

---

## A. Per-Webhook 7-Check Findings

### A.1 HMAC-SHA256 signing + rotating-secret flow

- §31.6 specifies `HMAC-SHA256(webhook_secret, raw_request_body)` and `X-Sourcera-Signature: sha256=<hex>`. Signing is specified.
- Secret-rotation flow is **NOT** defined at the §31 root. §31.8.8 introduces `X-Sourcera-Webhook-Secret-Version` header and a 30-day grace for *billing-domain only*. No rotation API endpoint, no rotation UX surface, no "secret about to be rotated" notification, no rotation policy (manual? scheduled? Ops-forced?). General §31 webhooks have no documented path to rotate a compromised secret.
- JSON canonicalization for HMAC is unspecified — the body bytes that the producer signs and the bytes the consumer hashes for verification must be byte-identical, but key ordering / whitespace policy is silent. Defect.
- `signature_algorithm` field exists in §31.8.2 (`hmac_sha256_v1`) but not in the §31.2 general envelope. Future algorithm rotation has no path.

### A.2 Idempotency via `event_id`

- §31.1 declares `event_id` is unique per event and persists across retries — the contract is correct.
- **Format conflict** across the spec: §31.1 (`evt_{timestamp}_{random}`), §31.5 ("UUID"), §31.8.2 (`evt_{unix_ms}_{base32_random10}`), §27.11 / §30192 ("UUIDv7"). Four canonical forms cited; consumer regex parsers cannot generalize.
- Producer-side at-least-once / exactly-once / ordering guarantees specified inline at §31.8.10 ("delivery ordering not guaranteed; out-of-order tolerated") but never lifted to the §31 root. Other domains have no producer-semantic statement.

### A.3 Exponential backoff per Appendix F

**This is the largest single area of drift.** Five inconsistent retry-curve citations:

| Citation | Curve | Total attempts | Cumulative |
|---|---|---|---|
| Appendix F.1 (canonical) | 0 / 1m / 15m / 1h / 6h | 5 | 7.3 h (header claims 24 h) |
| Appendix F.2 (financial-impact) | 0 / 5s / 1m / 15m / 1h | 5 | 1 h 16 min |
| §29.5 | 1s / 2s / 4s / 8s / 16s | 5 | 31 s (header claims 24 h) |
| §25.7 / §21147 (Internal Comment domain) | "(1 s, 2 s, 4 s, 8 s, 16 s → DLQ after 5 failures)" cites Appendix F `webhook_standard` | 5 | 31 s |
| §22.629 (Taxonomy domain) | "7 retries over 3 hours" cites Appendix F `webhook_standard` | 7 | 3 h |
| §22.760 (Taxonomy support narrative) | "7 retries over 3 hours" | 7 | 3 h |
| §27.9.9 / §31.9.9 / §30192 / §31.8.7 (footer) | 1m / 5m / 30m / 2h / 12h | 5 | 14 h 36 min |

Every citation labels itself "the Appendix F standard curve" or "Appendix F `webhook_standard`". The actual Appendix F.1 table is none of them. CI gate `webhook_default_retry_class` (declared in F.1 preamble) cannot pass against the current spec.

Additional retry-class drift:
- §19085 cites retry-curve class `webhook_critical_business` for the `bid.disqualified` webhook — class is **not defined** in Appendix J `webhook_retry_class` enum (which lists `standard`, `financial_impact`, `auto_topup_charge`, `pricing_api_publish`, `retroactive_sweep`, `console_bridge_standard`, `transactional_email`).
- §19085 cites the class location as "§31.9 retry-curve class" but §31.9 is CRM Sync, which doesn't author retry classes either.
- Appendix C Phase 3V Audit-Remediation block introduces 4 new retry-curve classes (`security_critical`, `compliance_critical`, `org_management`, `infra_critical`, `console_bridge_standard`) **without** authoring corresponding §F.x sub-sections. The F.1 default-coverage rule says "New event-type proposals attempting to introduce a third retry class MUST author it as a new §F.x subsection with rationale, and MUST register the class membership in Appendix J `webhook_retry_class` enum" — gate violated by Appendix C itself.

### A.4 DLQ after 5 failures

- §31.6 DLQ rule is correct: "After 5 failed deliveries, webhook marked `failed`."
- 4xx-retry behavior **contradicts**: §31.6 lists "3xx, 4xx, 5xx, timeout" as retryable; Appendix F.1 footer ("If payload invalid (malformed), return 4xx (will NOT retry)") and §31.8.10 ("Consumer 4xx responses cause NO retry") explicitly except 4xx. P1 contradiction.
- DLQ data model is **undefined**: no entity definition (no `WebhookDeliveryFailureRow` or equivalent), no field schema, no retention row in §40.2, no DSAR cascade behavior. §31.6 references "Settings → Integrations → Failed Webhooks (30-day retention)" surface but no API for DLQ list, no API for manual retry, no audit-event emission on DLQ entry.
- DLQ admin-notification recipient is ambiguous: §31.6 says "Admin receives email notification" — Org Admin? Billing Admin? Org Owner? `seller_integrations_admin`? Unspecified.
- Failure-notification SLA "within 1 hour of final failure" (§31.7) has no observability instrumentation or §44 rate-limit binding.

### A.5 Payload size ≤ 256 KB

- §31.5 row declares "256 KB" with CI gate `webhook_payload_max_256kb`. Fine.
- Pre-compression vs post-compression byte budget unspecified. P3.
- §31.6.1 declares 3 firewall-sensitive payload-exclusion gates (`webhook_payload_no_internal_comment_body`, `webhook_payload_no_selection_report_narrative`, `webhook_payload_no_kb_restricted_body`). The Selection Report gate references "§10.13 webhook block" — but no Selection Report webhook block is authored in §10.13 OR §31. The gate guards a non-existent payload.

### A.6 Payload schema with versioning (`event_version`)

- **§31.2 general envelope has NO `event_version` / `schema_version` field.** P1 — payload schema cannot be evolved without breaking consumers.
- §31.8.2 billing envelope adds `signature_algorithm` and `webhook_secret_version` but still lacks an `event_version` field.
- General envelope at §31.2 also lacks `event_class` (only billing carries it via §31.8.2), `delivery_attempt` (only billing), and millisecond-precision `timestamp` (§31.2 says ISO 8601; §31.8.2 stipulates millisecond). Consumer parsers built on the §31.2 contract cannot subscribe by class or observe attempt count.
- `workspace_id` is a top-level field in §31.2 but is null for Org-pooled events (`billing.plan.upgraded`, `billing.committed_spend.contract_activated`, etc.); nullability is unstated.

### A.7 Registration in Appendix C and Appendix G

- Appendix C carries the canonical catalog at scale (Transactional / Lifecycle / Marketing / Billing / KB / Disqualification / Growth / M1–M8 / Taxonomy / Marketplace-Abuse / Marketplace-Signals / **CRM-Sync** / Ops-Console / Internal-Comment / Defense-View / Phase-3V Audit-Remediation / WorkOS-Group blocks).
- Most §31.8 billing events have correctly mapped Appendix C + Appendix G rows.
- **CRM Sync event-name drift** is severe: §31.9.10 webhook catalog uses `crm_sync.connection_created`, `crm_sync.activity_accepted`, `crm_sync.activity_failed`. Appendix C uses `seller.crm_sync.connection_activated`, `seller.crm_sync.activity_written`, `seller.crm_sync.activity_failed`, `seller.crm_sync.activity_dead_lettered`. Appendix G uses `crm_sync_activity_emitted`, `crm_sync_activity_succeeded`, `crm_sync_activity_failed`, `crm_sync_activity_dead_lettered`. The transformation `.` → `_` rule from §31.8 Acceptance #16 doesn't reconcile these names. §31.9.14 AC #22 explicitly asserts naming consistency: "Every CRM Sync event registered in Appendix C and Appendix G MUST match the emitted `event_type` exactly" — the spec violates its own AC.
- **CRM Sync activity_state enum drift**: §31.9.6 declares enum `pending` / `in_flight` / `accepted` / `failed_retryable` / `failed_terminal` / `failed_needs_review` / `skipped_*` / `redacted_by_dsar`. Appendix C uses `failed_permanent` (not in enum) and `dead_lettered` (not in enum) as triggers. P1 — consumer state-machine reasoning broken.

---

## B. Reverse Pass — Appendix L state machines vs §31 webhook coverage

| Appendix L state machine | Revenue-affecting / integrator-visible transitions | §31 webhook coverage | Defect |
|---|---|---|---|
| L.1 InternalCommentThread | created / open→resolved / resolved→open / open→archived / resolved→archived / post moderated | `internal_comment_thread.created`, `.post_appended`, `.mention_sent`, `.resolved`, `.reopened`, `.archived`, `.visibility_changed`, `internal_comment_post.moderated` | Covered. |
| L.2 BuyerReferral | pending→signed_up→activated→credit_issued→credit_redeemed / credit_expired / forfeited / flagged_fraud / revoked | NONE | **D-8.2-012 (P1)** — credit lifecycle is revenue-affecting; integrators cannot reconcile. |
| L.3 ProTrialSeatGrant | issued→invite_sent→provisioned→in_trial→converted / auto_downgraded / vendor_declined / expired_unaccepted / buyer_revoked / fraud_blocked | NONE | **D-8.2-013 (P1)** — `converted` is the conversion event for Pro Trial pool accounting; Sales-Ops integrators (e.g., Salesforce Marketo lead-scoring) need it. |
| L.4 KBEntry | draft→under_review→active→review_due→review_overdue→flagged_stale→archived | `kb.entry.published` (→active), `kb.entry.archived` (→archived), `kb.entry.flagged_stale`. `under_review` / `review_due` / `review_overdue` not webhooked. | **D-8.2-039 (P3)** — staleness sub-states webhook-omitted by design (digest preferred); document exclusion. |
| L.5 KBDocument | active→expired / superseded / archived; doc_attach (covered) | `kb.document.attached` only. No webhook for expired / superseded / archived. | **D-8.2-014 (P1)** — vendor-verification status and SOC-2 cert-renewal cycles depend on `expired` signal; missing. |
| L.6 TargetAccount | prospect→qualified→solicited→bidding→shortlisted→finalist→disqualified / superseded | `vendor.disqualified`, `vendor.disqualification.reversed` cover terminal disqualification. Workflow milestones uncovered. | **D-8.2-018 (P2)** — workflow-state webhooks (qualified, solicited, shortlisted, finalist) absent; integrators cannot drive procurement automation off Sourcera state without polling §32. |
| L.7 DefenseView | (none)→generated_unopened→opened→regenerated_unopened→archived | `defense_view.generated`, `defense_view.regenerated` cover most transitions. Archived cascade silent (HTTP 404 documented). | Acceptable. |
| §4.8.1 AIOperation | pending→accepted/auto_accepted/rejected→contested→reversed | `billing.ai_operation.settled`, `.contested`, `.reversed` | Covered (excellent §31.8.3 coverage). |
| §4.8.3 AIWallet (state machine implied; not in Appendix L) | active→soft_capped_80→soft_capped_100→hard_capped_100→suspended→closed; auto-topup transitions | `billing.wallet.cap_warning_80`, `.cap_warning_100`, `.auto_topup_executed`, `.auto_topup_failed` | **D-8.2-015 (P1)** — `suspended` and `closed` lifecycle transitions are revenue-affecting (e.g., Stripe-grace exhaustion → wallet suspended → all AIOperations rejected) but emit no webhook. **D-8.2-040 (P2)** — AIWallet state machine itself is not catalogued in Appendix L compendium. |
| §4.8.5 ContestRecord | filed→approved / rejected / withdrawn | `billing.ai_operation.reversed` covers `approved` (only when reversal posts). `rejected`, `withdrawn` emit NO webhook. | **D-8.2-017 (P1)** — `contest.rejected` and `contest.withdrawn` are accounting-relevant (the soft credit applied at filing must be unwound; subscriber reconciliation logic needs the signal). |
| §4.8.8 CommittedSpendContract | pending→active→active(+59d)→renewal_due_60→renewed / expired / opted_out_renewal / decommitted | `billing.committed_spend.contract_activated`, `.renewal_due_60`. | **D-8.2-016 (P1)** — `renewed`, `expired`, `renewal_opted_out`, `decommitted` events explicitly named in §31.8.6 footer as "NOT in the Phase scope of this prompt; they are flagged in `_integration/RECONCILIATION.md` → Known Gaps for follow-up authoring" — never closed. |
| §4.2.1 Plan-Tier (per-console) | upgraded / downgraded / downgrade_scheduled / downgrade_canceled | `billing.plan.upgraded`, `.downgraded`, `.downgrade_scheduled` | **D-8.2-041 (P2)** — `downgrade_canceled` explicitly flagged as Authored Extension in §31.8.5; no firing path. |
| §4.8.7 FreeAllowanceCounter | quantity_remaining→0; reset on period rollover | `billing.free_allowance.exhausted` | Acceptable; reset is implicit. P3: `free_allowance.reset` would help upgrade-CTA telemetry but is not required. |

---

## C. Counterfactual Failure Modes Surfaced

For each webhook family, three failure modes were enumerated and checked against §31 + Appendix F coverage:

1. **Webhook-secret rotation mid-delivery.** If Sourcera rotates the per-Org webhook secret while a delivery is in retry-curve flight, attempts 2..5 will fail signature verification on the consumer side. §31.8.8 specifies a 30-day grace via `X-Sourcera-Webhook-Secret-Version` for billing. **Failure mode unhandled for non-billing webhooks.** D-8.2-008.
2. **Consumer endpoint is slow but not failing (8-second response).** §31.6 declares HTTP 2xx within 10 s as success criterion. TLS handshake budget unspecified; if a TCP RST or TLS handshake takes 3 s, the consumer effectively has 7 s. Failure ambiguous. D-8.2-037.
3. **Consumer returns 4xx for a malformed payload that Sourcera produced.** §31.6 says all non-2xx retry; Appendix F.1 footer says 4xx skips retry. Sourcera's bug becomes a no-retry failure for the consumer — but if 4xx retries (per §31.6), the consumer gets 5 attempts of the same broken payload. P1 contradiction. D-8.2-006.
4. **Webhook subscription endpoint moved to a new URL** (consumer migration). No CRUD endpoints documented; consumers cannot programmatically rotate. D-8.2-009.
5. **DLQ saturation under sustained outage.** §31.6 doesn't bound DLQ size per Org; outage can fill DLQ indefinitely until 30-d retention purges. No back-pressure / saturation handling. P2.
6. **Provider concurrent fan-out: 5 subscribers configured for an Org, one is slow.** Producer parallelism and head-of-line blocking unspecified. P2.
7. **Same `event_id` arrives at two subscribers via two different subscriptions.** Idempotency contract is per-consumer; cross-subscriber dedup is consumer-side only. Acceptable.
8. **Org has no active webhook subscription when a critical event fires.** No catch-up replay endpoint specified at the §31 root. §22 Taxonomy authors `/api/v1/webhooks/deliveries/replay` — but only for taxonomy events (per §22.760 narrative); general replay endpoint is undefined. P2.

---

## D. Self-Challenge Pass

Re-read the above as a hostile staff engineer:

- **Severity gradings checked.** P1 grades reserved for buildability blockers (missing schema fields, undefined retry classes, name-drift breaking AC #22, reverse-pass coverage gaps on revenue-affecting state machines). No P0 graded — none of the defects breach the buyer/seller console firewall, expose PII / PCI to an unintended actor, or break a hard regulatory clamp.
- **Are reverse-pass defects "missing-by-design vs missing-defect"?** For BuyerReferral and ProTrialSeatGrant, the spec contains no rationale for omitting webhooks; both are revenue-affecting and carry Stripe Credit Note interactions (BuyerReferral) or pool-accounting (ProTrialSeatGrant). For KBDocument expiry, vendor-verification cascade explicitly documents downstream consumers (§22; verification-tier downgrade). For CommittedSpendContract `renewed`/`expired`, the §31.8.6 footer explicitly admits omission as "Known Gaps for follow-up authoring" — by the spec's own admission, defects.
- **Is the retry-curve drift one defect or many?** Two filings: (1) D-8.2-005 catalogues the curve drift as a numerical-singleton P1; (2) D-8.2-007 is the undefined-class reference for `webhook_critical_business` (specific to `bid.disqualified`). Both are independent.
- **Are envelope omissions one defect or three?** Three filings: D-8.2-001 (event_version), D-8.2-002 (event_class), D-8.2-003 (delivery_attempt). Each affects a separate consumer use case (schema evolution; class subscription filtering; observability of attempt count). Filing them separately preserves remediation granularity.
- **Is "subscription CRUD undefined" really P1?** Yes — every other webhook in the Spec presumes subscriptions exist (e.g., Appendix C "delivered to every subscribed Org webhook endpoint"), but the API surface to create/update/delete subscriptions is unspecified. A junior engineer cannot build the subscription model from §31. Confirmed P1.

No severity demotions on self-challenge. One defect upgraded: D-8.2-006 (4xx contradiction) was initially P2; reclassified P1 because a junior engineer reading the conflicting prose will pick the wrong rule, and the wrong rule causes either DLQ-spam (consumer 4xx looped 5×) or silent loss (4xx skipped on Sourcera bugs).

---

## E. Promotion to DEFECT_LEDGER.md

All 38 defects below promoted with Defect-IDs `D-8.2-001` through `D-8.2-041` (numbering accounts for 3 P3 entries authored under reverse-pass, plus state-machine compendium gap D-8.2-040, plus plan-downgrade-canceled gap D-8.2-041). Sequence is non-contiguous because counterfactual-pass items merged into reverse-pass slots during self-challenge consolidation.

**Coverage matrix updates.** §31.1, §31.2, §31.3, §31.4, §31.5, §31.6, §31.7, §31.8, §31.9, Appendix F, Appendix C cells touched. Cells transitioning to ⚠ partial: `webhook` (§31.2 envelope coverage), `state_machine` (Appendix L reverse-pass), `error_codes` (CRM Sync state enum drift), `numerical_singleton` (retry-curve drift, webhook-endpoint count duplication).

---

**Halt rule (zero unresolved P0 in §31 Webhooks + Appendix F surface).** PASS. Phase 8.2 advancement to Prompt 8.3 (Appendix C catalog walk) **UNBLOCKED** — though Prompt 8.3 will inherit several findings here (notably the Internal-Comment / Taxonomy / Phase-3V retry-curve drift, the CRM-Sync naming reconciliation, and the Appendix-C-vs-§31.8 13-event gap already filed at D-V8.1-021).
