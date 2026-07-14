# Phase 1.7 — §4.8 Billing & AI Accounting Entities (Scratch Findings Log)

**Prompt scope.** Audit §4.8 Billing & AI Accounting Entities of `Sourcera_Master_Spec.md` v7.1.0: AIOperation, CapabilityRegistryEntry, AIWallet, OutcomeContract, ContestRecord, CostBaseRecalculationLog, FreeAllowanceCounter, CommittedSpendContract, PricingTableVersion, DowngradeExcessDataBucket, BillingSeatSnapshot, MarketplaceDiscoveryRevenueRecord, SellerOutcomeSignalConfig.

**Authority.** §4.8 lines 7625–8642. Cross-referenced into Appendix J (line 42551 onward), Appendix I (line 41889 onward), Appendix L (line 45862 onward), Appendix M (line 46184 onward), Appendix C (line 40285 onward), §31.8 (line 24221 onward), §34.10 (line 28032 onward), §34.14 / §34.15 / §34.20 (line 28416 onward).

**Method.** End-to-end read of all 13 §4.8 sub-sections. Per-entity convention checklist (data model · acceptance criteria · enum registration · glossary · state machine · API · webhook · plan gating · retention/privacy · numerical singletons · heading syntax · surface/engine mapping · console firewall · edge cases). Cross-document verification against Appendix J / I / L / C / M registrations and against §34 numerical singletons. Counterfactual pass: for each entity, three realistic failure modes confirmed against the spec's Failure Modes block. Self-challenge pass: each defect re-evaluated against the Severity Definitions rule set.

---

## 1. Findings Summary (18 defects)

| Severity | Count | IDs |
|---|---|---|
| P0 | 1 | D-1.7-001 |
| P1 | 4 | D-1.7-002 / D-1.7-003 / D-1.7-004 / D-1.7-005 |
| P2 | 5 | D-1.7-008 / D-1.7-009 / D-1.7-010 / D-1.7-011 / D-1.7-016 |
| P3 | 8 | D-1.7-006 / D-1.7-007 / D-1.7-012 / D-1.7-013 / D-1.7-014 / D-1.7-015 / D-1.7-017 / D-1.7-018 |

The audit halts on the P0 per the global stop condition. All 18 findings file simultaneously so that the remediation pass has a complete picture.

---

## 2. P0 — D-1.7-001: SellerOutcomeSignalConfig seed table violates canonical-form lock

**Location.** §4.8.13 Seed Specification table, Master Spec lines 8612–8623.

**Evidence.** The seed table prescribes 12 rows with the following `capability_id` values (verbatim):

```
seller_first_pass_rfp_draft
seller_qa_suggestion
seller_kb_to_capability_suggestion
seller_kb_bootstrap
seller_ghost_rfp_ingestion
seller_firecrawl_crawl_dedupe
seller_kb_staleness_classifier
seller_page_enrichment
seller_capability_declaration_suggest
seller_match_score_numeric
seller_bid_task_assignment_suggest
seller_document_attach_suggest
```

The Appendix J `seller_outcome_signal_capability` enum (Master Spec line 43470) registers a different set — explicitly without the `seller_` prefix:

```
first_pass_rfp_draft, qa_suggestion_seller, kb_to_capability_suggestion,
kb_bootstrap, ghost_rfp_ingestion, firecrawl_crawl_dedupe,
kb_staleness_classifier, seller_page_enrichment,
capability_declaration_suggest, match_score_numeric,
bid_task_assignment_suggest, document_attach_suggest
```

The Appendix J entry's note is unambiguous: *"no `seller_` prefix is permitted on a `capability_id` — the single retained `seller_page_enrichment` is a noun-scoped identifier (the enrichment target is the Marketplace seller page) and is grandfathered into canonical form because stripping the prefix loses semantic meaning. … deploy-time validator `canonical_capability_id_lock` (§32.8.0) asserts no entry begins with `buyer_` prefix or bare `seller_` prefix (the `seller_page_enrichment` grandfather is whitelisted explicitly in the validator)."* The §34.14.1 Rate Card baseline (lines 28422–28433) and §34.15.1 Outcome Contract baseline (line 28515) both materialize the canonical (unprefixed) capability_ids. The §4.8.13 Acceptance Criterion #1 (line 8627) requires "Exactly `|seller_outcome_signal_capability|` active SellerOutcomeSignalConfig rows MUST exist at any time (v1 migration seeds 12, one per enum value)" — the seeds enumerated in the §4.8.13 table do not satisfy "one per enum value."

**Consequence (severity rule).** The seed migration would fail the `canonical_capability_id_lock` deploy-time validator on 11 of the 12 capability_ids. With the migration blocked, no `SellerOutcomeSignalConfig` row would exist for any seller-side capability. Per §34.15.5 (line 28587): *"every AIOperation whose capability is seller-console-only MUST resolve through the active SellerOutcomeSignalConfig for its `capability_id` at settlement time. Missing or `state=retired` configs cause settlement to halt with `seller_outcome_signal_config_missing` (HTTP 500)."* That is a billing-surface ambiguity that prevents settlement of every seller AIOperation — Severity Rule (d) "leaves a billing surface (AIOperation, AIWallet, OutcomeContract, Stripe metering) ambiguous in a way that allows revenue leakage" applies. Severity Rule (e) is also implicated: the deploy-time CI gate `canonical_capability_id_lock` referenced in `Build_Execution_Strategy.md` is runtime-unwireable as written because the seed payload itself trips the gate.

**Recommendation.** Replace the §4.8.13 seed table's twelve `capability_id` values with the canonical Appendix J values: `first_pass_rfp_draft`, `qa_suggestion_seller`, `kb_to_capability_suggestion`, `kb_bootstrap`, `ghost_rfp_ingestion`, `firecrawl_crawl_dedupe`, `kb_staleness_classifier`, `seller_page_enrichment` (grandfathered — keep), `capability_declaration_suggest`, `match_score_numeric`, `bid_task_assignment_suggest`, `document_attach_suggest`. Add a CI-gate cross-link beneath the table referencing `canonical_capability_id_lock` so future authors do not regress. Mirror the canonical IDs into §4.8.13 Failure Mode prose (line 8594, 8603) and Acceptance Criterion #11 (line 8637).

---

## 3. P1 webhook gaps — D-1.7-002 / -003 / -004 / -005

Authoring Convention #7 (CLAUDE.md §11) requires every webhook event to be HMAC-SHA256-signed, idempotent on `event_id`, retried on the documented backoff curve, registered in Appendix C (Notification Event Catalog), and registered in Appendix G (PostHog Taxonomy). Four webhook families referenced from §4.8 are unregistered.

### D-1.7-002 (P1) — `contest.sla_breach`

`contest.sla_breach` is referenced from §4.8.5 SLA paragraph (line 8069), §4.8.5 AC #6 (line 8086), §34.11.2 (lines 28192, 28193, 28210), and §34.20.4 AC #20 (line 29098). AC #6 is mandatory: *"SLA breaches MUST emit `contest.sla_breach` webhook within 10 minutes of breach."* The event is absent from §31.8.3 / §31.8.4 / §31.8.5 / §31.8.6 / §31.8.7, from Appendix C lines 40349–40361 (the Phase-4c billing-event block ends at `billing.free_allowance.exhausted`), and from Appendix G's billing-event family. There is no registered payload schema, retry-curve class, signing rule, or idempotency contract.

### D-1.7-003 (P1) — `contest.abandoned`

`contest.abandoned` is mentioned in §4.8.5 state machine (line 8066): *"Emits `contest.abandoned` webhook and an Ops Finance audit record."* The webhook fires on the dual abandonment paths (Ops non-pickup ≥90d; Ops non-decision ≥120d) and converts the soft credit to a permanent customer-favorable credit. Without registration, subscribers cannot route the credit-posted notification. Same gap pattern as D-1.7-002.

### D-1.7-004 (P1) — `pricing_table_scheduled` / `pricing_table_published` / `pricing_table_rolled_back`

Three webhooks are referenced from §34.14.5 Rate Card Lifecycle (lines 28490, 28491, 28493). The §4.8.9 PricingTableVersion entity declares Acceptance Criterion #1 *"The Public Pricing API MUST return the `published_payload_json` of the row with the most recent `effective_at` ≤ `now` and `status=published`"* and AC #4 *"The endpoint MUST be cacheable for 60 seconds with the `published_payload_hash` as the ETag."* These behaviors implicitly depend on subscribers receiving the publish/scheduled/rollback transitions to invalidate caches and trigger 30-day breaking-change customer notifications. None of the three is registered in Appendix C; none has a payload contract, retry class (the `pricing_api_publish` retry class at line 43510 only covers fanout, not the event family itself), or signing rule.

### D-1.7-005 (P1) — `billing.committed_spend.renewed` / `.expired` / `.renewal_opted_out`

§31.8.6 line 24585 self-confesses: *"`billing.committed_spend.renewed`, `billing.committed_spend.expired`, and `billing.committed_spend.renewal_opted_out` are NOT in the Phase scope of this prompt; they are flagged in `_integration/RECONCILIATION.md → Known Gaps for follow-up authoring."* §4.8.8 state machine has terminal transitions to `expired`, `terminated`, and `auto_renewed` and AC #5 *"Auto-renewal MUST issue a customer notification 30 days before `commit_period_end`; opt-out window is 7 days before renewal."* The notification path is unbuildable without the corresponding webhooks. The Known Gap is documented but the gap itself is a P1 by Severity Rule (missing webhook contract on a state-transition that customer-facing behavior depends on).

---

## 4. P2 findings

### D-1.7-008 (P2) — AIOperation `auto_accept_after_seconds` range mismatch with source

§4.8.1 line 7664: *"`auto_accept_after_seconds` | Integer | ≥ 0 | Snapshot of OutcomeContract.`auto_accept_after_seconds` at write time; drives `pending → auto_accepted` timer."* §4.8.4 line 7971 source field: *"`auto_accept_after_seconds` | Integer | ≥ 60 (1 minute floor); ≤ 7776000 (90-day ceiling) | The auto-accept timer; copied to AIOperation.`auto_accept_after_seconds` at write time."* The snapshot field permits values the source field rejects. A junior engineer building AIOperation against the entity's own constraints could permit a 30-second auto-accept value (e.g., during an OutcomeContract pre-publish race) that the resolver depends on being ≥ 60. Mirror the source's range constraint on the snapshot field.

### D-1.7-009 (P2) — AIWallet single `committed_spend_contract_id` vs §4.8.8 "many active commits"

AIWallet line 7874: *"`committed_spend_contract_id` | UUID (FK) | Nullable; FK → CommittedSpendContract | Set when an Enterprise commit is active."* (Singular FK.) §4.8.8 line 8207: *"Org-scoped; many active contracts permitted in theory but typically one (overlapping commits handled below)."* §4.8.8 Overlapping Commits paragraph (line 8251) describes per-AIOperation burn-priority on the earlier-ending contract, but the AIWallet schema cannot represent two simultaneously-active commits. Either restrict CommittedSpendContract to exactly-one-active-per-Org (and update §4.8.8 narrative accordingly) or move the linkage to a junction (e.g., `AIWalletCommitBinding(wallet_id, contract_id, priority_rank)`).

### D-1.7-010 (P2) — `auto_topup_max_monthly_value_dollars` AC missing

AIWallet field `auto_topup_max_monthly_value_dollars` (line 7867) carries the constraint `≥ 5000; ≤ 50000000` (i.e., $50–$500K in cents). Appendix I error code `wallet_autotopup_max_monthly_out_of_range` (line 42017) exists. But §4.8.3 Acceptance Criteria block contains AC #5 only for the increment ($50–$10K) and is silent on the monthly cap. A junior engineer building only against the AC list would miss the $500K monthly absolute ceiling. Add AC #11 *"`auto_topup_max_monthly_value_dollars` MUST be ≥ $50 and ≤ $500,000; values outside this range MUST be rejected with HTTP 422 `wallet_autotopup_max_monthly_out_of_range`."*

### D-1.7-011 (P2) — `effective_charge_cents` undefined during `contested` state

§4.8.1 AC #4 (line 7754): *"The `effective_charge_cents` MUST equal `value_price_cents` for `accepted`/`auto_accepted`, `cost_price_cents` for `rejected`, and `0` for `reversed`; any other combination MUST be rejected at the database constraint layer."* The state machine table includes the `contested` state (transitions in line 7712–7716) but AC #4 is silent on what `effective_charge_cents` carries while `settlement_state=contested`. Two reasonable readings: (a) preserve original `effective_charge_cents` and represent the soft credit as a separate wallet-side ledger row (the spec's prose at line 7712 — *"Wallet draw temporarily reversed pending Ops Finance review (soft credit)"* — supports this); (b) zero out during `contested`. The DB constraint cited by AC #4 would reject both (since neither equals the four enumerated states). Resolve.

### D-1.7-016 (P2) — FreeAllowanceCounter quota_total decrease handling missing

§4.8.7 Failure Mode #2 (line 8190): *"Ops increases `quota_total` mid-flight. Resolved: increase takes effect immediately for future operations; in-flight operations unaffected."* The decrease case is unhandled. The `quota_consumed | Integer | ≥ 0; ≤ quota_total` constraint at line 8170 means an Ops decrement of `quota_total` below current `quota_consumed` violates the row constraint. Either reject the decrease (preferred) with HTTP 422 `free_allowance_quota_below_consumed` or document the truncation behavior (e.g., "decrease accepted; `quota_remaining` clamps to 0; subsequent invocations bill the wallet"). Add to Failure Modes block and to Acceptance Criteria.

---

## 5. P3 findings

### D-1.7-006 (P3) — ContestRecord `console` enum value `system` unregistered

§4.8.5 line 8026: *"`console` | Enum | `buyer`, `seller`, `system` | Mirrors AIOperation.console for cross-console firewall enforcement on read."* Appendix J `ai_operation_console` (line 43302) registers `buyer, seller, platform_marketing, sourcera_owned, ops` — the value `system` is absent. The "mirrors AIOperation.console" wording is internally inconsistent. Per Authoring Convention #3 ("Every enum value used in §4–§51 is registered in Appendix J. … Never invent inline enum values") either register a `contest_record_console` enum (`buyer, seller, system`) explicitly, or normalize the §4.8.5 inline definition to reference `ai_operation_console` and re-classify auto-filed contests under `ops` rather than a fictitious `system`.

### D-1.7-007 (P3) — `external_provider` enum unregistered

§4.8.1 line 7674 inline-defines: *"`external_provider` | Enum | Nullable; `firecrawl`, `perplexity`, `loops`, `posthog_ingest`, `none`."* §4.8.2 line 7798 mirrors. The enum has no Appendix J entry. Per Authoring Convention #3, register as `ai_operation_external_provider` (or equivalent name) in Appendix J with the five values listed.

### D-1.7-012 (P3) — §34.20.4 AC #56 misleading wording on SellerOutcomeSignalConfig deferral

§34.20.4 AC #56 (line 29158): *"SellerOutcomeSignalConfig (Authored Extension per §34.15.5) is explicitly DEFERRED in v7.0.0; any reference to per-Org signal threshold override MUST return HTTP 501 `feature_not_yet_available`; QA test `seller_signal_override_not_implemented` asserts."* §34.15.5 (line 28585) clarifies the actual scope: *"Per-Org overrides are NOT supported at the Organization level in v7.0.0 — SellerOutcomeSignalConfig is platform-scoped and Ops-managed; all sellers share the same signal rules per capability. … No Authored Extension entity is required at this layer — §4.8.13 is already authoritative."* AC #56's leading clause conflates the entity (`SellerOutcomeSignalConfig` — fully authored at §4.8.13 in v7.1.0) with the deferred sub-feature (per-Org threshold override). A reader skimming AC #56 could conclude the entire entity is deferred. Reword AC #56 to: *"Per-Org SellerOutcomeSignalConfig threshold overrides (FE-§34.15-V1) are explicitly DEFERRED in v7.0.0; any API call attempting per-Org threshold override MUST return HTTP 501 `feature_not_yet_available`. The platform-scoped §4.8.13 SellerOutcomeSignalConfig entity itself is authoritative at v7.0.0+."*

### D-1.7-013 (P3) — Appendix L missing cross-references for §4.8 state machines

Appendix L preamble (line 45864): *"every `status` enum registered in Appendix J that corresponds to a non-trivial lifecycle must have a corresponding state machine table here or an explicit cross-reference to the originating section."* Twelve §4.8 status enums are registered in Appendix J with non-trivial lifecycles — `ai_operation_settlement_state`, `ai_wallet_state`, `ai_wallet_topup_trigger_state`, `capability_registry_status`, `outcome_contract_state`, `contest_status`, `cost_base_recalc_approval_status`, `committed_spend_status`, `pricing_table_version_status`, `downgrade_excess_bucket_status`, `marketplace_discovery_revenue_status`, `seller_outcome_signal_state` — and all have inline state machines in §4.8.* (which §4.8.1 explicitly defends as deliberate: *"deliberately retained inline here because its transitions are tightly coupled to billing settlement, contest, and committed-spend semantics"*). However, none has a stub cross-reference in Appendix L. Add an Appendix L.8 "§4.8 Billing & Accounting State Machines (Cross-References)" sub-section listing each enum with a one-line pointer to its inline §4.8.x table. Without these stubs the preamble's invariant is violated.

### D-1.7-014 (P3) — Appendix I §4.8 codes catalogued by name only

Appendix I preamble (line 42008): *"Pre-existing billing-adjacent codes referenced from §4.8 entity definitions (`ai_operation_immutable_after_settlement`, `ai_operation_invalid_transition`, … `billing_admin_grant_target_ineligible_role`) are catalogued in their respective entity sections; the table below catalogues codes introduced for the §32.8 endpoint surface itself."* Authoring Convention #6 places error-code authority in Appendix I (CLAUDE.md §11: *"error codes (registered in Appendix I)"*). Distributing 30+ codes across §4.8.1–§4.8.13 Failure Modes blocks rather than rolling them into Appendix I forces consumers to grep multiple sections to determine HTTP code and response shape. Either (a) hoist the per-entity codes into Appendix I as one consolidated `### §4.8 Billing & AI Accounting Errors` table, leaving the entity sections with name-only references, or (b) accept the distributed catalog and amend the convention in CLAUDE.md §11 + Audit_Prompts.md to reflect the per-entity catalog pattern. Option (a) preferred for parity with the §32.8, §22, §25, §26 error blocks already in Appendix I.

### D-1.7-015 (P3) — `_value_dollars` field naming vs `_value_dollars_cents` API naming

AIWallet entity fields use the suffix `_value_dollars` (e.g., `budget_value_dollars`, `consumed_value_dollars`, `auto_topup_increment_value_dollars`, `auto_topup_max_monthly_value_dollars`) with field-Notes documenting integer USD cents. Appendix I `wallet_autotopup_max_monthly_out_of_range` (line 42017) references the API field as `max_monthly_value_dollars_cents`. §4.8.12 MarketplaceDiscoveryRevenueRecord uses `amount_cents` (line 8435). The schema convention is inconsistent: the same conceptual unit (integer USD cents) appears as `_value_dollars` on AIWallet, `_value_dollars_cents` on §32.8 endpoint surfaces, and `_cents` on MarketplaceDiscoveryRevenueRecord. Pick one canonical convention (recommended: `_value_dollars_cents` on AIWallet to match the API surface and dispel the dollars/cents ambiguity). The Master Spec preamble at §28046 *"All counters are stored in **integer USD cents**"* documents the semantic but does not disambiguate the naming.

### D-1.7-017 (P3) — OutcomeContract `signal_subject_entity_kinds` underspecified

§4.8.4 line 7975: *"`signal_subject_entity_kinds` | Array[Enum] | Subset of AIOperation entity kinds | Which downstream entities the resolver watches for retention/edit signals."* No enum named "AIOperation entity kinds" is registered in Appendix J. The phrase is ambiguous — possibly a reference to `ai_operation_console` (which doesn't fit), to a per-capability entity-class registry, or to the §22 KB entity surface (KBEntry, KBDocument, etc.) for retention signals. The OutcomeContract `accepted_signal_rule` JSON schema is bounded by `outcome_contract_rule_schema` (Appendix J line 43359 lists the signal-type enum) but the entity-kind reference is undefined. Author the missing enum (e.g., `outcome_contract_signal_subject_entity_kind` with values `bid_response, requirement_response, kb_entry, capability_declaration, document_attachment, …`) and update the field reference.

### D-1.7-018 (P3) — AIOperation `parent_operation_id` prose ambiguity

§4.8.1 line 7651: *"`parent_operation_id` | UUID (FK) | Nullable; self-ref → AIOperation | For Managed Agent sub-call (Summary C.55); the parent is the customer-facing operation, children are sub-calls. Never null for `actor_type=managed_agent`."* The clause "Never null for `actor_type=managed_agent`" is correct but the parenthetical "the parent is the customer-facing operation, children are sub-calls" can be misread as "all managed_agent ops are parents" (whereas the rule is the opposite — managed_agent ops are *children*; parents have `actor_type ∈ {user, system, ops}`). Tighten the wording to *"Managed Agent sub-call rows have `actor_type=managed_agent` and a non-null `parent_operation_id` pointing at the customer-facing parent operation. Customer-facing parent operations have `actor_type ∈ {user, system, ops}` and a null `parent_operation_id` (or a non-null pointer to a higher-level Ops-tagged orchestrator operation, never to a managed_agent row)."*

---

## 6. Counterfactual pass — three failure modes per entity

For each of the 13 entities the spec's Failure Modes block was checked against three realistic adversarial scenarios. Coverage is strong; one new gap surfaced per the §5 P2 list (D-1.7-016 — FreeAllowanceCounter decrease). All other failure modes I enumerated are already named in the spec's Failure Modes blocks (e.g., AIOperation #1 wallet exhaustion, #5 FX-rate parity on reversal, #11 free-allowance race; AIWallet #2 Stripe webhook idempotency, #3 Feb 31 anchor normalization, #6 mid-period residency change; ContestRecord #3 contest then Org closure, #5 auto-file during DSAR; MarketplaceDiscoveryRevenueRecord #1 cost-center drift, #11 dashboard UNION across cost centers, #15 refund-of-refund chain).

The three classes most consistently well-handled across §4.8: (a) settlement immutability post-window, (b) cost-center isolation (rev_marketplace_discovery vs rev_ai_wallet vs rev_subscription), (c) FX-locking on reversal. The three classes most consistently under-handled: (a) Ops downward-mutation of quota / cap fields (D-1.7-016), (b) state-machine cross-reference hygiene (D-1.7-013), (c) webhook contract completeness (D-1.7-002 / -003 / -004 / -005).

---

## 7. Self-challenge pass

Each defect was re-evaluated against the Severity Definitions block.

- **D-1.7-001 (P0).** Re-tested. The seed table either ships against the canonical_capability_id_lock validator (deploy blocked, Severity Rule (e)) or — if the validator is itself unwired at the time of seed — ships with broken capability_ids (Severity Rule (d) revenue leakage). Either path produces a P0. Confirmed.
- **D-1.7-002 / -003 / -004 / -005 (P1).** Each missing webhook is referenced from a Master Spec Acceptance Criterion or state-machine transition. A junior engineer cannot build the dispatch path without the registration; the §31 / Appendix C / Appendix G triple-registration is the convention. Confirmed P1.
- **D-1.7-008 / -009 / -010 / -011 / -016 (P2).** Each is buildable by a thoughtful engineer who reads adjacent sections, but two engineers reading only the entity definition would arrive at different builds. Confirmed P2.
- **D-1.7-006 / -007 / -012 / -013 / -014 / -015 / -017 / -018 (P3).** Each is hygiene / consistency-drift; no implementation impact. Confirmed P3.

No defect was demoted or promoted on re-read.

---

## 8. Items confirmed clean (audit checklist passes)

The following dimensions of §4.8 pass the audit checklist without filing:

1. **Numerical Singletons (Convention #10).** Every monetary field is `Integer` cents — no float-typed dollar fields exist anywhere in §4.8. Spot-checked all 13 entities. The `_value_dollars` naming is hygiene (D-1.7-015) but the type discipline holds.
2. **AIWallet org-scope and console-pooling (Item 3).** §4.8.3 line 7855 (`org_id … unique`) plus §34.10.3 (line 28062) plus §34.20.4 AC #10 (line 29085) plus QA test `wallet_endpoint_console_pooling` (line 27019) all converge on the same rule. The spec internally documents the pool-collapse rule for Solo + Free combinations. The audit prompt's hypothesis "soft-pooled or split otherwise" is not what the spec implements — the wallet is unified across all paid combinations and explicitly collapses to $0 / paid-side-only on Free + Paid and Solo + * combinations per the §34.10.3 table. No defect; the prompt's expectation is itself out-of-date relative to v7.1.0.
3. **CapabilityRegistryEntry replaces hardcoded capability lists (Item 4).** The §4.8.2 Authoring Intent (line 7769) explicitly retires the v6.0.0 "21 capabilities" hardcoding. §34.14.1 / §34.15.1 / §27 / §22.20 all reference CapabilityRegistryEntry by name; no consumer was found referencing a literal list.
4. **OutcomeContract accepted/rejected/contest-window semantics (Item 5).** §4.8.4 contest_window_days field (line 7972) defaults to 14 (citing Summary C.78) with per-capability override capped at 90; auto_accept_after_seconds floor is 60s, ceiling 90d. The state machine and Failure Modes are complete on the OutcomeContract side.
5. **ContestRecord 14-day window and credit-on-approval (Item 6).** §4.8.5 state machine line 7712 (soft credit on `accepted/auto_accepted → contested`), line 7713 (final credit on `contested → reversed` / `approved`); §4.8.5 AC #2 / #3 / #4 enforce. Window enforcement uses DB transaction commit time per §4.8.1 Failure Mode #6.
6. **CostBaseRecalculationLog nightly job + 10% drift threshold (Item 7).** §4.8.6 AC #1 (line 8149) "MUST run nightly at 03:00 UTC"; AC #2 enforces explicit `ops_finance_admin` approval at `drift_severity ∈ {alert_10_25, critical_gt_25}`. Margin-floor breach AC #3 forbids auto-apply.
7. **MarketplaceDiscoveryRevenueRecord cost-center isolation (Item 8).** §4.8.12 explicitly partitions to `rev_marketplace_discovery`. AC #1 / #2 / #13 / #14 enforce DB CHECK + dashboard isolation + no AIWallet linkage + no AIOperation write. Failure Modes #1 / #9 / #11 cover drift / accidental linkage / dashboard UNION.
8. **SellerOutcomeSignalConfig 12-capability coverage (Item 9).** §4.8.13 seed table lists 12 rows with accepted-signal rule, window, alt-boundary, and timeout-default per capability. The capability_id mismatch is filed as D-1.7-001 P0; the structure of the seed (12 rows, one per Appendix J enum value) is correct.
9. **Integer-cents discipline (Item 10).** Spot-checked every monetary field across §4.8.1–§4.8.13. No float types found. All fields are `Integer` with documented cents semantics.
10. **AIOperation immutability post-settlement (Item 1).** §4.8.1 Settlement Freeze paragraph (line 7719), AC #3 (line 7753), and the state machine table are consistent: post-`contest_window_at` the row is fully frozen except for DSAR redaction; in-window writes are restricted to `contested` and `reversed` transitions through ContestRecord. Append-only semantics are enforced.
11. **fx_rate_locked + billing_currency at AIOperation creation (Item 2).** §4.8.1 line 7679 (`billing_currency` "Customer-visible currency at write time"), line 7680 (`fx_rate_locked` "locked at write to the daily Treasury rate per C.84; preserved through `contested` and `reversed`"), AC #5 (`aiop_reversal_fx_parity` test) all confirm. Failure Mode #5 documents the FX parity round-trip.

---

## 9. Promotion to Defect Ledger

All 18 defects above are appended to `/Sourcera/_audit/DEFECT_LEDGER.md` as `D-1.7-001` through `D-1.7-018`. Per-row tightening for F-123 (AIOperation) through F-137 (Billing & AI Accounting Entity Set) is appended to `/Sourcera/_audit/COVERAGE_MATRIX.md` under "Phase 1.7 Update".

---

## 10. Forwarded to downstream phases

- **Phase 2.3 (Appendix J completeness)** inherits D-1.7-006 (`contest_record_console` value `system`), D-1.7-007 (`ai_operation_external_provider` enum), D-1.7-017 (OutcomeContract entity-kind enum).
- **Phase 7 (Retention & Cascade)** — none additional; §4.8 retention contracts are robust.
- **Phase 8 (API + Webhook)** inherits D-1.7-002 / -003 / -004 / -005 webhook authoring (8 webhook-event contracts to author across Appendix C + Appendix G + §31.8).
- **Phase 9 (Observability / CI gates)** inherits D-1.7-001 P0 remediation verification (the canonical_capability_id_lock gate must pass against the post-fix seed payload) and D-1.7-013 (Appendix L cross-references for §4.8 state machines).
- **Phase 10 (Numerical Singletons)** inherits D-1.7-015 (`_value_dollars` vs `_value_dollars_cents` naming convention).
- **Phase V2 / FINAL** inherits D-1.7-001 P0 as a stamp-blocker and D-1.7-012 (§34.20.4 AC #56 wording).
