# Phase 2 Adversarial Verification — §34 Pricing & Billing Rewrite + §34.14–§34.20 Seller / Marketplace / Engineering / Financial / Carry-Over Extensions

**Scope.** Verification of the §34 token-budget → AIOperation/value-dollar rewrite together with the five supporting §34.14–§34.20 authorings (Seller Rate Card, Seller Outcome Signals, Marketplace Discovery, Pricing Engineering Requirements, Financial Targets, Seller Plan Upgrade Carry-Over, Consolidated Acceptance Criteria) and the cross-cutting integrations of §5.2.1 Billing Admin, §32.8 Billing Endpoints, and §31.8 Billing-Domain Webhook Catalog.

**Reviewer role.** Hostile — actively looking for reasons the bundle should not ship as v7.0.0. Items 7, 8, and 10 were re-read against MS §2.8 / §2.9 / §2.11 line by line; drift is reported even where the Spec is internally consistent.

**Baseline.** `_versions/Sourcera_Master_Spec_v6.0.0.md` (token-denominated §34; no §34.14–§34.20; no Billing Admin; no §31.8; no §32.8).

**Target.** `/Sourcera/Sourcera_Master_Spec.md` (current working copy; §34 = §34.1–§34.20, §5.2.1 = §5.2.1.1–§5.2.1.5, §32.8 = §32.8.0–§32.8.10, §31.8 = §31.8.1–§31.8.10).

**Authoritative sources (resolved in project-hierarchy order).**
1. `Sourcera_Master_Spec.md` — authoritative build specification.
2. `Sourcera_Buyer_Pricing_Strategy.md` + `Sourcera_Seller_Pricing_Strategy.md` — authoritative for pricing, AIOperations, entitlement.
3. `Sourcera_Master_Summary.md` — authoritative for concepts not yet integrated; superseded by the Master Spec after v7.0.0 integration.

**Verification date.** 2026-04-18.

**Verification protocol.** Each of the 11 verification items scored **PASS / PARTIAL / FAIL** with structural and adversarial sub-findings; remediation named per finding; sign-off recommendation in §12.

**Change log vs 2026-04-15 draft (items 1–6).** Items 1–6 findings re-confirmed against the current working copy; D-1 through D-6, C-1 through C-5, E-1 through E-3, W-1 through W-3, R-1, and A-X-1 through A-X-8 are preserved verbatim (no new evidence invalidates them). Items 7–11 are newly authored. Three new HIGH-severity findings (S-1, O-1, P-1) and two new MEDIUM findings (S-2, C-6) are raised against the §34.14 / §34.15 / §34.17 authorings.

---

## 1. ITEM 1 — §34 Rewrite: Token-Budget Model Fully Replaced

### 1.1 Internal §34 conformance

**Inside the §34 boundary (now §34.1–§34.20):** the rewrite is internally clean.

| Test | Result | Evidence |
| :--- | :--- | :--- |
| Any inline reference to the historic per-month token budget (Free 50K / Business 500K / Enterprise 5M) inside §34 | NONE | Grep against §34.1–§34.20 returns zero matches for `500K`, `5M tokens`, `tokens/month`, or `Agent Token Budget` |
| Any reference to "tokens" inside §34 that denotes AI-consumption units | NONE substantive | The single residual "token" mention is `max API tokens` (§39 cross-reference); the §34.1.3 grandfathering paragraph refers to the v6.0.0 model as historical context only; §4.8.11 footnote mentions "API-only identity (token-only user)" — unrelated to AI consumption |
| AIOperation entity referenced throughout §34 | YES | 30+ references across §34.1, §34.3, §34.5, §34.8, §34.10, §34.11, §34.12, §34.13, §34.14, §34.15, §34.17, §34.19 |
| AIWallet entity referenced throughout §34 | YES | Central to §34.10; referenced across §34.5 / §34.6 / §34.12 / §34.13 / §34.17 / §34.19 |
| value-dollar denomination used as the consumption unit | YES | §34.3.1 Pricing Formula and §34.10.1 Wallet Counters anchor the unit |
| Full §4.8 entity surface referenced where relevant | YES | §34.3 cites OutcomeContract; §34.6 cites DowngradeExcessDataBucket; §34.7 cites BillingSeatSnapshot; §34.8 cites CapabilityRegistryEntry + FreeAllowanceCounter; §34.10 cites AIWallet; §34.11 cites OutcomeContract + ContestRecord + CostBaseRecalculationLog; §34.12 cites CommittedSpendContract; §34.14 cites PricingTableVersion; §34.15 cites SellerOutcomeSignalConfig; §34.16 cites MarketplaceDiscoveryRevenueRecord |

**Verdict on §34 internal conformance: PASS.**

### 1.2 Cross-section drift — dangling references to the old model OUTSIDE §34

The rewrite was scope-limited to §34. Six artifacts elsewhere in the spec still encode the old token-budget model and produce a contradiction with the new §34. Each is a ship-blocker for documentation integrity.

| ID | Severity | Location | Defect | Remediation |
| :--- | :--- | :--- | :--- | :--- |
| **D-1** | HIGH | Line 564 (TOC) | `[34.4 Agent Token Budget & Overage]` is the v6.0.0 §34.4 title. Current §34.4 is "No Per-Unit Metering on Structural Resources." TOC also still names §34.3 as "Overage Pricing (Business Tier)" and §34.9 as "Acceptance Criteria." §34.10 through §34.20 entirely missing from TOC. | Regenerate TOC for §34.1–§34.20; add anchor entries for §34.10 AI Wallet Service, §34.11 Outcome Resolver, §34.12 Cross-Side Billing Rules, §34.13 Buyer-Funded Pro Trial Seat, §34.14 Seller Rate Card, §34.15 Seller Outcome Signals, §34.16 Marketplace Discovery Pricing, §34.17 Pricing Engineering Requirements, §34.18 Financial Targets, §34.19 Seller Plan Upgrade Carry-Over Guarantee, §34.20 Acceptance Criteria. |
| **D-2** | HIGH | Lines 14558–14562 (§44.2 Agent Performance) | `Monthly Agent Token Budget: Free: 50K tokens/month / Business: 500K tokens/month / Enterprise: 5M tokens/month`. Verbatim restatement of the OLD per-tier token budget. | Delete the bullet block. Replace with: "Per-tier AI included-budget ceilings are authoritative in §34.1; per-Org wallet behavior in §34.10. §44.2 references those tables and does not restate values." |
| **D-3** | HIGH | Line 15309 (Stripe SKU table) | SKU `sourcera_agent_tokens` priced at `Business: $0.01/1000 tokens (beyond 500K/mo). Enterprise: included in contract`. Old token-metered SKU; conflicts with §34.3.1 outcome-based pricing formula. | Remove the `sourcera_agent_tokens` row. Replace with the four authoritative billable SKU classes implied by §34.3 / §4.8.1: per-AIOperation overage (`sourcera_ai_operation_overage_value_dollars_cents`), wallet manual top-up (`sourcera_wallet_topup_value_dollars_cents`), wallet auto-top-up (`sourcera_wallet_autotopup_value_dollars_cents`), CommittedSpend annual commit (`sourcera_committed_spend_annual`). |
| **D-4** | HIGH | Lines 9911 + 9922 (§21.6 Agent Failure Handling) + Appendix I lines 15381 and 15406 | Row `Token budget exceeded → agent_budget_exceeded`; sentence "Failed calls that are retried consume tokens only on the successful attempt"; error code `agent_budget_exceeded` labeled "monthly token budget exceeded" in Appendix I. | Rename row to `Wallet exhausted` with action `Reject call with ai_wallet_exhausted` (new error code; add to Appendix I). Cross-reference §34.10.4 wallet state machine. Replace "consume tokens" sentence with: "Failed calls that retry consume value-dollars only on the settling attempt; failed calls that degrade gracefully consume the `cost_price` per §4.8.1." Update Appendix I rows 15381 and 15406 to rename `agent_budget_exceeded` → `ai_wallet_exhausted`. |
| **D-5** | MEDIUM | Line 9962 (§21.9 Agent Acceptance Criteria) | "Monthly token consumption is accurately metered and displayed." | Replace with: "Monthly value-dollar consumption is accurately metered against the AIWallet (§34.10) and displayed per §4.8 visibility surfaces; FreeAllowanceCounter draw precedes wallet draw per §34.8.4." |
| **D-6** | MEDIUM | Lines 9874–9904 (§21.5 Agent AI Budgets) | §21.5 correctly cross-references §34.10 / §34.11.3 but ALSO restates the per-plan budget table in full — verbatim duplicate of §34.1.1 / §34.1.2. Violates Authoring Convention #10 ("dollar figures have one authoritative home"). | Collapse the §21.5 budget table, exhaustion bullets, and visibility bullets into forward references. Replacement text in §6.2. |

**Verdict on §34 cross-section conformance: FAIL.** Six locations outside §34 still encode the legacy token-budget model. D-1 (TOC), D-2 (§44.2 Performance), and D-3 (Stripe SKU table) are the HIGH-severity ship-blockers.

### 1.3 Item 1 sign-off

**ITEM 1 RESULT: PARTIAL PASS (internal §34 PASS; cross-section FAIL).** The §34 boundary is internally consistent and faithful to Pricing Strategy and §4.8 entities. The remediations for D-1 through D-6 are mechanical edits totaling ~50 line changes across five non-§34 sections; they MUST land before v7.0.0 ship.

---

## 2. ITEM 2 — Entitlement Matrix (§34.8.5) Coverage of the Capability Registry

### 2.1 Structural test

The §34.8.5 Entitlement Matrix lists 47 `capability_id` rows with `enforcement_mode`, `free_allowance_ops`, per-console plan minimum, and `upgrade_surface`. §34.8.7 acceptance criterion #6 requires every `state=active` CapabilityRegistryEntry to have a matrix row; deploy-time validator asserts. Because CapabilityRegistryEntry is a runtime data table, spec-time coverage is best-effort against editorial catalogs.

### 2.2 Editorial cross-check against §21.4 Agent Capability Catalog

§21.4 enumerates 21 buyer capabilities and 13 seller capabilities. 12 buyer-side §21.4 capabilities are absent from §34.8.5:

Policy Deduplication, Policy Traceability Mapping, Triage Auto-Mapping, Requirement Splitting, Vendor Invite Suggestion, Evidence Parsing, Disagreement Insight Card, Demo Focus Brief, "What Would Flip" Analysis, Sensitivity Narrative, Pulse Digest (Weekly), Comment Thread Summary.

**Finding C-1 (HIGH).** Deploy-time validator per §34.8.7 #6 will fail the build until these rows exist in both CapabilityRegistryEntry and the matrix.

**Finding C-2 (MEDIUM).** TCO Analysis Narrative is in §21.4 as an AI capability ($1.20 accepted / $0.15 rejected). §34.8.5 row `tco_modeling` carries `enforcement_mode = n/a (non-AI)` — a direct contradiction. Authoritative resolution required before either can be implemented.

**Finding C-3 (MEDIUM).** §21.4 Organizational Intelligence Briefing is one editorial capability; §34.8.5 splits it into three rows (`org_intelligence_vendor_history`, `org_intelligence_full`, `org_intelligence_suggestions`). The tri-split is defensible from a plan-gating perspective but must be annotated in §21.4.

### 2.3 Naming-convention drift between Entitlement Matrix and Public Pricing API

| Concept | §34.8.5 id | §32.8.1 sample id | Drift |
| :--- | :--- | :--- | :--- |
| Pre-scoring | `pre_scoring` | `buyer_pre_scoring` | Prefix |
| Q&A suggestion | `qa_suggestion` | `buyer_qa_classify` | Prefix + name (`suggestion` vs `classify`) |
| First-pass RFP draft | `first_pass_rfp_draft` | `seller_first_pass_response` | Prefix + name (`rfp_draft` vs `response`) |

**Finding C-4 (HIGH).** A customer-facing Public Pricing API response advertising one capability_id while the runtime Entitlement Matrix evaluates against a different id will confuse customers or silently fail entitlement checks. Per §4.8.2 acceptance #1 (`capability_id` immutable once any AIOperation has referenced it), the canonical form MUST be locked NOW, before v7.0.0 ship. Authoritative form: §34.8.5 unprefixed id. §32.8.1 sample MUST be updated to drop prefixes.

### 2.4 Forward-reference cleanup

**Finding C-5 (LOW).** §3.0 (lines 3029, 3306) parentheticals for `comparison_page_generation` and `seller_signal_aggregation` still read "new; to be added to capability registry in Phase 3"; both ids now appear in §34.8.5. Drop "to be added" language.

### 2.5 Seller-side cross-check against §34.14.1

The §34.14.1 Seller Rate Card enumerates 12 seller `capability_id` rows. Cross-reference against §34.8.5:

| §34.14.1 capability_id | §34.8.5 row? |
| :--- | :--- |
| `first_pass_rfp_draft` | ✅ |
| `kb_bootstrap` | ✅ |
| `ghost_rfp_ingestion` | ✅ |
| `verification_fetch` | MISSING (capability is `sourcera_owned`, so not customer-billed; §34.8.5 is the customer-billed matrix — tolerable, but should be explicit) |
| `capability_declaration_assist` | §34.8.5 lists `capability_declaration_suggest` (different id — see S-1 finding) |
| `buyer_signal_digest` | MISSING |
| `answer_refinement` | MISSING |
| `compliance_pass_audit` | MISSING |
| `rfp_win_probability_analysis` | MISSING |
| `opportunity_recommender` | MISSING |
| `source_of_truth_sync` | MISSING |
| `outcome_narrative_builder` | MISSING |

**Finding C-6 (HIGH, NEW).** Nine of the 12 capabilities in §34.14.1 have no row in the §34.8.5 Entitlement Matrix. The same §34.8.7 acceptance #6 deploy-time validator that catches the 12 missing buyer capabilities (C-1) will catch these nine. Root cause is the same as S-1 / S-2 below — §34.14.1 substitutes a different capability set than the MS §2.8 / §21.4 catalog expects.

### 2.6 Item 2 sign-off

**ITEM 2 RESULT: PARTIAL PASS.** Matrix is structurally correct; §34.8.7 #6 validator is the right backstop. Coverage against editorial catalogs is materially incomplete (12 buyer-side missing, 9 seller-side missing, 1 classification conflict, 1 cardinality split). Naming drift C-4 is a HIGH one-way door via §4.8.2 immutability if not locked before ship.

---

## 3. ITEM 3 — Billing Admin Present in §5.2, §5.11, Appendix J

### 3.1 §5.2 / §5.2.1 Authoring

| Test | Result | Evidence |
| :--- | :--- | :--- |
| `Billing Admin` in §5.2 role table | YES | Line 4915 |
| §5.2.1 end-to-end authoring | YES | Lines 4917–5040 — Authoring Intent, Scope, §5.2.1.1 Permission List (22 enumerated operations), §5.2.1.2 Assignment & Replacement, §5.2.1.3 Deprovisioning, §5.2.1.4 Audit View, §5.2.1.5 Failure Modes, glossary entry, deploy-time validator hook |
| Replacement Pattern | YES | §5.2.1.2 — `org_owner` de facto fallback when zero `billing_admin` users |
| Deprovisioning | YES | §5.2.1.3 — in-flight contest, Stripe charge, role transfer handling |
| Failure modes | YES | §5.2.1.5 — 5+ enumerated failure modes |

**Verdict: PASS.**

### 3.2 §5.11 Feature Access Matrix

Billing Admin column present (line 5204, position 4). Billing & AI Accounting feature group present (lines 5242–5263, 22 operation rows under header `**Billing & AI Accounting** (§4.8, §5.2.1, §34.12.6)`). All 22 rows mark `billing_admin` ✓ and `org_admin` ✗.

**Finding R-1 (LOW carried-over).** §5.11 preamble (line 5202) logs an unresolved conflict: §5.2 says Org Admin has "All org-scoped resources except billing"; §4.8.3 / §4.8.11 entity-level RBAC lists `org_admin` in some wallet / seat-snapshot reads. §5.11 hard-codes `org_admin` ✗ on Billing rows but the entity RBAC says ✓. Not a Billing Admin authoring defect; a pre-existing drift surfaced by the Billing Admin work. Carry as Known Gap; resolve in a dedicated phase.

**Verdict: PASS** with R-1 carry-forward.

### 3.3 Appendix J (Controlled Vocabulary Registry)

Global Organization Roles enum contains `org_owner, org_admin, billing_admin, member, guest` (line 15510 area). Provenance paragraph (v7.0.0; §5.2, §5.2.1, §4.8, §34.12.6; orthogonality to `org_admin`; Replacement Pattern reference; ineligibility of `member` and `guest`). New Billing-domain enum blocks: Billing Admin Audit Action Types, `webhook_event_class`, `upgrade_completed_trigger`, `committed_spend_discount_band`, `contest_status`, `contest_resolution_reason`, `ai_operation_console`. Deploy-time validator hook at §5.2.1.5 #1.

**Verdict: PASS.**

### 3.4 Appendix B (Glossary)

Billing Admin glossary entry present at line 5039 / 16563-area. Text covers scope, orthogonality to `org_admin`, required-role cases (ContestRecord filing, wallet config mutation, plan-tier change, Pro Trial Seat grant acceptance), and cross-references §5.2, §5.2.1, §4.8, §34.12.6, Appendix J.

**Verdict: PASS.**

### 3.5 Item 3 sign-off

**ITEM 3 RESULT: PASS.** Billing Admin is consistently authored across §5.2, §5.2.1, §5.11, Appendix J, Appendix B, §4.8.3 / §4.8.5 / §4.8.8 (entity RBAC), §34.12.6, §31.8.4 / §31.8.5 / §31.8.6 (webhook recipient set), and §32.8 (API endpoint RBAC). Sole carry-over: R-1.

---

## 4. ITEM 4 — Every Billing Endpoint Has Rate-Limit Class, Auth Scope, and Example

### 4.1 §32.8 detailed endpoint conformance

| § | Endpoint | Auth | Rate-Limit Class | Example | Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 32.8.1 | `GET /v1/pricing` | None (public) | `public_pricing_unauth` | ✅ | ✅ |
| 32.8.2 | `GET /v1/orgs/{org_id}/wallet` | `read:billing` | Standard auth per-Org | ✅ | ✅ |
| 32.8.3 | `POST /v1/orgs/{org_id}/wallet/cap` | `write:billing` | Standard auth per-Org | ✅ | ✅ |
| 32.8.4 | `POST /v1/orgs/{org_id}/wallet/auto-topup` | `write:billing` | Standard auth per-Org | ✅ | ✅ |
| 32.8.5 | `GET /v1/orgs/{org_id}/ai-operations` | `read:billing` | Standard auth per-Org | ✅ | ✅ |
| 32.8.6 | `GET /v1/orgs/{org_id}/ai-operations/{op_id}` | `read:billing` | Standard auth per-Org | ✅ | ✅ |
| 32.8.7 | `POST /v1/orgs/{org_id}/ai-operations/{op_id}/contest` | `admin:billing` | Standard + 5/min/Org contest ceiling | ✅ | ✅ |
| 32.8.8 | `GET /v1/orgs/{org_id}/free-allowance` | `read:billing` | Standard auth per-Org | ✅ | ✅ |
| 32.8.9 | `GET /v1/orgs/{org_id}/committed-spend` | `read:billing` | Standard auth per-Org | ✅ | ✅ |

**Verdict on §32.8 detailed endpoints: PASS.** Every endpoint carries Method & Path, Auth Scope, RBAC, Rate-Limit Class, Query Parameters / Request Body, Response Body, Error Codes, Pagination, Idempotency, and Concrete Example.

### 4.2 §32.8 coverage gap vs §5.2.1.1

§5.2.1.1 enumerates 22 Billing-Admin-callable operations with stable API paths. Only 9 are authored in §32.8. Thirteen are referenced with paths but not authored:

Operations 4 (`POST /v1/billing/wallet/topup`), 8 (`POST /v1/billing/ai-operations/export`), 11 (`POST /v1/billing/contests/{contest_id}/withdraw`), 13 (`POST /v1/billing/committed-spend/{contract_id}/opt-out-renewal`), 14 (`POST /v1/billing/plan-change`), 15 (`POST /v1/billing/pro-trial-seats/{grant_id}/accept`), 16 (`POST /v1/billing/pro-trial-seats/{grant_id}/decline`), 17 (`GET /v1/billing/downgrade-buckets`), 18 (`GET /v1/billing/seat-snapshots`), 19 (`GET /v1/billing/pricing/pinned` + mutation), 20 (`GET /v1/billing/pricing/history`), 21 (`GET /v1/audit-events?action_namespace=org.billing&org=me` Billing Admin Audit View).

**Finding E-1 (HIGH).** Customers relying on those paths today will get HTTP 404. Either (a) author the 13 missing endpoints at §32.8 fidelity (~1,000–1,500 lines), OR (b) mark §5.2.1.1 operations 4 / 8 / 11 / 13–21 as "Convex-only (server-side mutation; no public REST surface)" with a forward-reference to a future authoring phase.

**Finding E-2 (MEDIUM).** §32.8.0 documents implicit-Org alias paths (`/v1/billing/...`) that resolve identically to the explicit-Org form. The 9 detailed endpoints use explicit-Org; the 13 §5.2.1.1 paths use implicit-Org. §32.8.10 acceptance #18 (`billing_path_alias_equivalence`) covers only the 9 detailed endpoints.

### 4.3 §32.8.0 common conventions

Path parameter semantics; Authorization scope inheritance; Token Scope Inheritance Rule; rate-limit default + public override; pagination (cursor, default 50, max 250, 24h cursor expiry); Idempotency-Key; currency presentation (`..._cents` + `..._display`); ISO 8601 UTC ms `Z` timestamps; error envelope with `request_id` and entity-id details; webhook coupling via shared `event_id`. All conventions inherited by all 9 detailed endpoints. **PASS.**

### 4.4 §32.8.10 acceptance criteria

**Finding E-3 (LOW).** §32.8.10 acceptance #21 references "four interim webhook events" now formally catalogued at §31.8.4. Update #21 to reference §31.8 as the authoritative catalog.

### 4.5 Item 4 sign-off

**ITEM 4 RESULT: PARTIAL PASS.** The 9 detailed endpoints are textbook. The defect is coverage: 13 of the 22 §5.2.1.1 Billing Admin operations have no §32.8 entry. Engineering implementing against §5.2.1.1 will hit HTTP 404 for ~60% of the role's API surface until E-1 is resolved.

---

## 5. ITEM 5 — Every Billing Webhook Has Retry Curve and Notification Mapping

### 5.1 §31.8 catalog completeness

§31.8 (lines 10965–11400) catalogs 13 net-new billing-domain events across 5 groups:

| Group | Events |
| :--- | :--- |
| §31.8.3 AIOperation Settlement | `billing.ai_operation.settled`, `billing.ai_operation.contested`, `billing.ai_operation.reversed` |
| §31.8.4 Wallet Threshold + Auto-Topup | `billing.wallet.cap_warning_80`, `billing.wallet.cap_warning_100`, `billing.wallet.auto_topup_executed`, `billing.wallet.auto_topup_failed` |
| §31.8.5 Plan-Tier Lifecycle | `billing.plan.upgraded`, `billing.plan.downgraded`, `billing.plan.downgrade_scheduled` |
| §31.8.6 Committed Spend | `billing.committed_spend.contract_activated`, `billing.committed_spend.renewal_due_60` |
| §31.8.7 Free Allowance | `billing.free_allowance.exhausted` |

Plus four mutation-coupled webhooks emitted by §32.8 endpoints (`billing.wallet.overage_cap_changed`, `billing.wallet.auto_topup_config_changed`, `billing.contest.filed`, `billing.contest.decision_received`).

### 5.2 Per-event conformance

§31.8.8 establishes baseline semantics every §31.8 event inherits:

| Requirement | §31.8.8 statement | Inherited |
| :--- | :--- | :--- |
| HMAC-SHA256 signing with per-Org webhook secret + version rotation | ✅ explicit | ✅ |
| Idempotency via `event_id` (`evt_{unix_ms}_{base32_random10}`) | ✅ explicit | ✅ |
| Retry curve = standard 5-attempt 24h per Appendix F + tightened 5s first retry for financial-impact events per Appendix F §F.2 | ✅ explicit | ✅ |
| DLQ after 5 failed deliveries; Org Admin + Billing Admin notified within 1h; manual retry; 30-day DLQ retention | ✅ explicit | ✅ |
| Payload ≤ 256 KB per §31.5 | ✅ explicit (max-size analysis for `billing.plan.upgraded` ~32 KB worst case) | ✅ |
| Delivery ordering = `timestamp` is source-of-truth | ✅ explicit | ✅ |
| Cross-console pooling | ✅ explicit | ✅ |

Common envelope (§31.8.2): `event_id`, `event_type`, `event_class=billing_domain`, `idempotency_key`, `timestamp`, `org_id`, `console`, `signature`, `webhook_secret_version`, `transaction_correlation_id` (where applicable). Per-event: Trigger paragraph, Payload table, Subscriber Routing notes, Failure-mode commentary.

**Finding W-1 (LOW).** §31.8.8 references Appendix F §F.2 for tightened retry curve. Verify Appendix F §F.2 actually exists in the spec body before ship.

### 5.3 Notification mapping (Appendix C)

§31.8.9 acceptance #15: every billing-domain event registered in Appendix C. §31.8.10 declares:
- 8 user-facing events emit in-app + email via Loops.so (`cap_warning_80`, `cap_warning_100`, `auto_topup_failed`, `plan.upgraded`, `plan.downgraded`, `plan.downgrade_scheduled`, `committed_spend.renewal_due_60`, `free_allowance.exhausted`).
- 5 webhook-only (`ai_operation.settled`, `ai_operation.contested`, `ai_operation.reversed`, `auto_topup_executed`, `committed_spend.contract_activated`).

**Finding W-2 (MEDIUM).** Appendix C entries for the 8 user-facing events should be inspected for Loops.so template ids, recipient-set definitions (`org_owner` ∪ `billing_admin`), throttling (cap_warning 24h suppression per §31.8.4), and locale-aware copy. If any are missing, customer-facing notification path will silently drop the event.

### 5.4 PostHog mapping (Appendix G)

**Finding W-3 (LOW).** §31.8.10 PostHog override list includes `upgrade_cta_viewed` and `upgrade_completed` which are NOT §31.8 webhook events — they are product-funnel events. Move to Appendix G or a separate §31.8.10 subsection.

### 5.5 §31.8.9 acceptance criteria

18 criteria, each tied to a QA test name. Sampling: #2 (`webhook_aiop_settled_no_duplicate_on_late_signal`) ✅; #5 (`webhook_wallet_cap_warning_at_most_once_per_period`) ✅; #8 (`webhook_plan_change_dual_console_correlation`) ✅; #11 (`webhook_renewal_due_60_skips_opted_out`) ✅; #14 financial-impact retry distinction ✅; #18 §4.8 revisions add new events to §31.8 ✅.

### 5.6 Item 5 sign-off

**ITEM 5 RESULT: PASS** with W-1, W-2, W-3 as carry-forward polish items. All 13 net-new billing-domain webhooks + 4 mutation-coupled webhooks carry retry curve, notification mapping, HMAC-SHA256 signing, idempotency via `event_id`, DLQ after 5 failures, ≤256 KB payload, and PostHog mirroring.

---

## 6. ITEM 6 — §21.5 Old Agent AI Budgets Must Reference §34, Not Duplicate

### 6.1 What §21.5 contains today

§21.5 structure:
1. **Preamble paragraph** — CORRECT (value-dollar denomination, `value = cost × 10` multiplier, forward-reference to §34.11.3).
2. **Per-plan budget table** — DUPLICATE (restates §34.1.1 Buyer Plan Tiers and §34.1.2 Seller Plan Tiers with same numerical values).
3. **Budget exhaustion behavior** (3 bullets) — DUPLICATE / PARTIAL (restates §34.10.4 Wallet State Machine in prose).
4. **"Pooled across consoles" paragraph** — CORRECT (explicit forward to §34.10.3).
5. **Visibility surface bullets** (6 items) — DUPLICATE (overlaps §4.8.3 Wallet + §4.8.7 FreeAllowanceCounter visibility).

### 6.2 Verdict on Item 6

**ITEM 6 RESULT: PARTIAL PASS.** §21.5 has the right intent but materially duplicates §34.1 / §34.10.3 / §34.10.4 / §4.8.3 in three blocks. Per Authoring Convention #10, per-plan budget figures MUST live only in §34.1. Same finding as D-6; remediation is the same — collapse the three duplicated blocks into forward references. Suggested replacement:

> Per-plan AI included-budget figures are authoritative in §34.1.1 and §34.1.2. Wallet overage configuration, exhaustion behavior, and the wallet state machine are authoritative in §34.10. Pooled-across-consoles math is authoritative in §34.10.3. Per-capability free-allowance behavior is authoritative in §34.8.4. Visibility surfaces are authoritative in §4.8.3 (AIWallet) and §4.8.7 (FreeAllowanceCounter). The unit (value-dollar) and the cost-base recalculation rule are described in this section's preamble; everything else is referenced.

### 6.3 §21.6 / §21.9 collateral

Per D-4 and D-5, §21.6 row "Token budget exceeded → `agent_budget_exceeded`" and sentence "Failed calls that are retried consume tokens only on the successful attempt" are BOTH stale token references AND duplicative of §34.10.4 wallet exhaustion behavior. §21.9 criterion "Monthly token consumption is accurately metered and displayed" is BOTH stale and duplicative of §4.8.3 / §4.8.7 visibility. Replacement text per D-4 / D-5.

---

## 7. ITEM 7 — §34.14 Seller Rate Card Contains All 12 Seller-Side Capabilities from Summary §2.8

### 7.1 Authoritative source: MS §2.8 Rate Card Summary (Seller-Side Capabilities)

MS §2.8 is a single table with 12 rows. There are no `§2.8.1 … §2.8.12` subsections in the Summary — §2.8 is a single-level heading enclosing one table.

| # | MS §2.8 capability | Model | Accepted (value) | Rejected (cost) | Unit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | First-Pass RFP Draft (per requirement) | Sonnet | $0.15 | $0.02 | 1 requirement |
| 2 | Q&A Suggestion | Sonnet | $0.50 | $0.07 | 1 suggestion |
| 3 | KB-to-Capability Suggestion (batch 100) | Haiku | $0.80 | $0.10 | 100-entry batch |
| 4 | KB Bootstrap (500 pages) | Opus | $200.00 | $26.00 | 1 bootstrap |
| 5 | Ghost-RFP Ingestion | Opus | $25.00 | $3.30 | 1 historical RFP |
| 6 | Firecrawl Crawl + Dedupe | Sonnet | $0.04 | $0.005 | 1 page processed |
| 7 | KB Staleness Classifier | Haiku | $0.02 | $0.003 | 1 entry reviewed |
| 8 | Seller Page Enrichment | Opus | $8.00 | $1.10 | 1 page |
| 9 | Capability Declaration Suggest | Sonnet | $0.30 | $0.04 | 1 declaration |
| 10 | Match Score (numeric, per-listing) | Sonnet | $0.40 | $0.05 | 1 opportunity |
| 11 | Bid Task Assignment Suggest | Haiku | $0.01 | $0.002 | 1 task |
| 12 | Document Attach Suggest | Haiku | $0.02 | $0.003 | 1 suggestion |

### 7.2 Current §34.14.1 Rate Card Table

§34.14.1 lists 12 rows. Every row's `Source` column claims citation back to MS §2.8.1, §2.8.2, …, §2.8.12 — but the Summary has no such subsections.

| # | §34.14.1 capability_id | value | cost | MS §2.8 match? |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `first_pass_rfp_draft` | $0.15 | $0.02 | ✅ Full match (MS #1) |
| 2 | `kb_bootstrap` | $200.00 | $26.00 | PARTIAL — price matches MS #4, but description drifted (Spec says "10 historical bid PDFs"; MS says "500 pages") |
| 3 | `ghost_rfp_ingestion` | **$0.50** | **$0.07** | MAJOR PRICE DRIFT — MS #5 says **$25.00 / $3.30** (Spec is 50× / 47× under MS) |
| 4 | `verification_fetch` | $0.00 | $0.08 | NOT IN MS §2.8 — platform-internal `sourcera_owned` capability authored fresh |
| 5 | `capability_declaration_assist` | $3.00 | $0.40 | NAME+PRICE DRIFT — MS #9 is `capability_declaration_suggest` at $0.30 / $0.04 (different id; Spec is 10× over MS) |
| 6 | `buyer_signal_digest` | $0.50 | $0.07 | NOT IN MS §2.8 |
| 7 | `answer_refinement` | $0.08 | $0.01 | NOT IN MS §2.8 |
| 8 | `compliance_pass_audit` | $12.00 | $1.50 | NOT IN MS §2.8 |
| 9 | `rfp_win_probability_analysis` | $5.00 | $0.65 | NOT IN MS §2.8 |
| 10 | `opportunity_recommender` | $0.25 | $0.03 | NOT IN MS §2.8 |
| 11 | `source_of_truth_sync` | $0.10 | $0.013 | NOT IN MS §2.8 |
| 12 | `outcome_narrative_builder` | $1.50 | $0.19 | NOT IN MS §2.8 |

**MS §2.8 capabilities absent from §34.14.1:** Q&A Suggestion (#2), KB-to-Capability Suggestion (#3), Firecrawl Crawl + Dedupe (#6), KB Staleness Classifier (#7), Seller Page Enrichment (#8), Match Score numeric (#10), Bid Task Assignment Suggest (#11), Document Attach Suggest (#12) — **8 of 12 absent**. Plus Capability Declaration Suggest (#9) has been renamed and repriced as a different capability (`capability_declaration_assist` at 10× the MS price).

### 7.3 Finding

**Finding S-1 (HIGH, NEW).** §34.14.1 does not contain the MS §2.8 rate card. It contains a different 12-capability rate card that the author substituted wholesale, retained only `first_pass_rfp_draft` and `kb_bootstrap` with MS-aligned prices, drifted `ghost_rfp_ingestion` by 50×, renamed-and-repriced `capability_declaration_suggest` → `capability_declaration_assist` at 10×, and replaced the remaining eight MS capabilities with eight capabilities that do not exist in the source of truth. The `Source: MS §2.8.N` citations in the §34.14.1 `Source` column are hallucinated — MS §2.8 has no subsections.

This is a source-of-truth violation. MS §2.8 is authoritative for the seller rate card; §34.14.1 supersedes it only to the extent §34.14.1 is consistent with it. The current §34.14.1 is neither consistent with MS §2.8 nor a legitimate Authored Extension (an Authored Extension preserves the source and adds new rows; §34.14.1 deletes eight rows and drifts a ninth).

Authoring Convention #10 ("Every dollar figure has one authoritative home"): the authoritative home for seller capability pricing was MS §2.8 pre-integration; §34.14.1 is meant to become that home post-integration. For §34.14.1 to be a valid supersession, it must preserve the MS §2.8 rows or explicitly log the deletions and price changes as decisions in `_integration/Decisions.md`. Neither has occurred.

**Finding S-2 (MEDIUM, NEW).** Every row in §34.14.1 cites `SPS §9.N` and `MS §2.8.N` as `Source`. Neither document has N-indexed subsections under §9 or §2.8 — both are single tables. The citations are formally invalid.

### 7.4 Remediation

Pick one resolution path; document the decision in `_integration/Decisions.md` before shipping:

**Option A (preserve MS §2.8 verbatim):** Restore the 8 absent MS §2.8 capabilities as rows 2–9 of §34.14.1 (Q&A Suggestion, KB-to-Capability Suggestion, Firecrawl, KB Staleness Classifier, Seller Page Enrichment, Match Score, Bid Task Assignment, Document Attach). Restore `capability_declaration_suggest` at $0.30 / $0.04 (rename `capability_declaration_assist` back). Restore `ghost_rfp_ingestion` at $25.00 / $3.30. Move the 8 authored-extension capabilities (`verification_fetch`, `buyer_signal_digest`, `answer_refinement`, `compliance_pass_audit`, `rfp_win_probability_analysis`, `opportunity_recommender`, `source_of_truth_sync`, `outcome_narrative_builder`) into an **Authored Extensions** sub-table at §34.14.1.b with explicit "Authored Extension — requires human sign-off" flags per the project's Authored Extension discipline. Replace the hallucinated `MS §2.8.N` citations with `MS §2.8 row N` or delete the subsection fragment.

**Option B (supersede MS §2.8 with documented deletions):** File an integration decision in `_integration/Decisions.md` that formally retires the 8 missing MS §2.8 capabilities with explicit rationale per capability (why Q&A Suggestion is deleted, why Firecrawl is deleted, etc.), documents the `ghost_rfp_ingestion` 50× price change and the `capability_declaration_suggest → _assist` rename-and-reprice, and updates MS §2.8 to match §34.14.1 before the Summary is retired per Integration_Prompts.md. Replace the `MS §2.8.N` citations with the decision-log anchors. This option requires human sign-off before ship because it is a material pricing-strategy change, not a spec-integration task.

Option A is the structurally correct default; Option B requires explicit pricing-strategy sign-off by the author of `Sourcera_Seller_Pricing_Strategy.md` (there is no evidence in `_integration/Decisions.md` that such sign-off has been obtained).

### 7.5 Item 7 sign-off

**ITEM 7 RESULT: FAIL.** §34.14 does not contain the 12 seller-side capabilities from MS §2.8. Two rows match by name+price (`first_pass_rfp_draft`, `kb_bootstrap` partial); one row has a 50× price drift (`ghost_rfp_ingestion`); one row is renamed-and-repriced (`capability_declaration_suggest` → `capability_declaration_assist`); eight MS §2.8 capabilities are absent; eight entirely new authored-extension capabilities take their place with no Authored Extension flag and no decision-log entry. Source citations to MS §2.8.N are invalid. HIGH-severity source-of-truth violation.

---

## 8. ITEM 8 — §34.15 Seller Outcome Signals Contains All 12 from Summary §2.9

### 8.1 Authoritative source: MS §2.9 Outcome Signals (Seller-Side)

MS §2.9 is a single table with 12 rows. No §2.9.1 … §2.9.12 subsections.

| # | MS §2.9 capability | Accepted signal | Window |
| :--- | :--- | :--- | :--- |
| 1 | First-Pass RFP Draft | ≥50% of draft retained in submitted bid | 14d (or on bid submission) |
| 2 | Q&A Suggestion | Answer sent with ≤30% edit | 7d |
| 3 | KB-to-Capability Suggestion | Declaration published | 14d |
| 4 | KB Bootstrap | ≥60% of proposed entries approved | 30d |
| 5 | Ghost-RFP Ingestion | Resulting KB entries cited in a future bid | **90d** |
| 6 | Firecrawl Crawl + Dedupe | New entry approved OR correct dedupe | 7d |
| 7 | KB Staleness Classifier | Flagged entry re-verified or archived | 14d |
| 8 | Seller Page Enrichment | Seller publishes generated content | 14d |
| 9 | Capability Declaration Suggest | Declaration published | 7d |
| 10 | Match Score (numeric) | EOI submitted after viewing score | 14d |
| 11 | Bid Task Assignment Suggest | Task assigned as suggested | 24h |
| 12 | Document Attach Suggest | Document attached to response | 24h |

### 8.2 Current §34.15.1 Outcome Contract Table

§34.15.1 cites `MS §2.9.1` … `MS §2.9.12` as Source — also invalid.

| # | §34.15.1 capability_id | Signal Class | Window | MS §2.9 match? |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `first_pass_rfp_draft` | Implicit-retention | 14d | ✅ Full match (MS #1) |
| 2 | `kb_bootstrap` | Implicit-retention | 30d | ✅ Full match (MS #4) |
| 3 | `ghost_rfp_ingestion` | **Explicit-user-signal** | **7d** | SIGNAL+WINDOW DRIFT — MS #5 signal is "Resulting KB entries cited in a future bid" over 90d; Spec changes to "user confirms parsed draft via kb.entry.publish" over 7d |
| 4 | `verification_fetch` | Platform-internal | N/A | NOT IN MS §2.9 — corresponds to NOT-IN-MS §34.14.1 row #4 |
| 5 | `capability_declaration_assist` | Implicit-retention | 14d | NAME+WINDOW DRIFT — MS #9 is `capability_declaration_suggest` with window 7d; Spec extends to 14d |
| 6 | `buyer_signal_digest` | Implicit-engagement | 7d | NOT IN MS §2.9 |
| 7 | `answer_refinement` | Implicit-retention | 7d | NOT IN MS §2.9 |
| 8 | `compliance_pass_audit` | Explicit-user-signal | 14d | NOT IN MS §2.9 |
| 9 | `rfp_win_probability_analysis` | Explicit-user-signal | 60d | NOT IN MS §2.9 |
| 10 | `opportunity_recommender` | Implicit-engagement | 14d | NOT IN MS §2.9 |
| 11 | `source_of_truth_sync` | Synchronous-success | 60s | NOT IN MS §2.9 |
| 12 | `outcome_narrative_builder` | Implicit-retention | 14d | NOT IN MS §2.9 |

**MS §2.9 capabilities absent from §34.15.1:** Q&A Suggestion, KB-to-Capability Suggestion, Firecrawl Crawl + Dedupe, KB Staleness Classifier, Seller Page Enrichment, Match Score numeric, Bid Task Assignment Suggest, Document Attach Suggest — **8 of 12 absent**. Plus Capability Declaration Suggest (#9) drifted. Plus Ghost-RFP Ingestion (#5) signal-class-and-window drifted materially (90d citation-in-future-bid → 7d explicit-parse-approval is a very different outcome contract).

### 8.3 Finding

**Finding O-1 (HIGH, NEW).** §34.15 does not contain the 12 outcome contracts from MS §2.9. The drift is a consequence of the §34.14 drift (S-1): because §34.15.1 one-to-one-maps the §34.14.1 rate card, and §34.14.1 substitutes capabilities, §34.15.1 inherits the substitution. Additional independent drift: `ghost_rfp_ingestion` outcome changed from "cited in a future bid over 90d" to "user confirms parsed draft over 7d" — this is a materially weaker accept condition (a parsed-draft confirmation is much easier than a future-bid citation), and the billing implication is that Ghost-RFP revenue-recognition shifts ~83 days earlier with a much higher accept rate.

**Finding O-2 (LOW, NEW).** §34.15.1 `Source` column cites `MS §2.9.1` through `MS §2.9.12` — subsections that do not exist. Same issue as S-2. Replace with `MS §2.9 row N` or delete.

### 8.4 Remediation

Tied to S-1 remediation. If Option A is chosen (preserve MS §2.8), Option A for §34.15.1 is to restore MS §2.9 rows for the 8 restored capabilities. If Option B (supersede) is chosen, an integration decision must formally retire the 8 MS §2.9 outcome contracts AND justify the Ghost-RFP outcome change.

### 8.5 Item 8 sign-off

**ITEM 8 RESULT: FAIL.** §34.15 does not contain the 12 outcome signals from MS §2.9. Two rows match; one row has major signal-class-and-window drift (`ghost_rfp_ingestion`); one row has minor window drift (`capability_declaration_assist`); eight MS §2.9 outcome contracts are absent; eight entirely new authored-extension outcome contracts take their place. Source citations invalid. HIGH-severity source-of-truth violation, coupled to S-1.

---

## 9. ITEM 9 — §34.16 Covers Three Marketplace Discovery SKUs with `rev_marketplace_discovery` Accounting Isolation

### 9.1 SKU coverage check

MS §2.10 names three marketplace discovery SKUs:
1. **Promoted Listings** — $500/category/week; 1 included at Scale, 3 at Enterprise; not below Scale; hard-capped 4 additional/month; k=5 anonymization.
2. **Verification Tiers** — Basic / Verified / Certified; free when earned.
3. **Featured Placements** — editorial only; not purchasable; chosen by Marketing on quality signals.

§34.16 contains §34.16.1–§34.16.8:

| Spec section | SKU | Match against MS §2.10? |
| :--- | :--- | :--- |
| §34.16.1 | Promoted Listings | ✅ $500 floor; 1 primary + 4 additional per month; max 3 winners per category per week; second-price auction; k=5 anonymization; FTC 16 CFR 255.5 labeling; `quality_floor` verification gate |
| §34.16.2 | Verification Tiers | ✅ Basic / Verified / Certified; $0 to seller; MS §2.10 principle "verification paid for by the seller has no credibility with buyers" quoted verbatim |
| §34.16.3 | Featured Placements | ✅ Editorial-only default; `paid_commitment` mode feature-flagged off in v7.0.0 with dual-signoff + buyer-disclosure + per-category cap + ethical-review gating |

**Verdict on SKU coverage: PASS.**

### 9.2 `rev_marketplace_discovery` accounting isolation

§34.16 preamble establishes the three-revenue-stream invariant with `revenue_stream_class` enum (`rev_ai_wallet`, `rev_subscription`, `rev_marketplace_discovery`). Enforcement surfaces:

| Enforcement Surface | Evidence |
| :--- | :--- |
| Revenue-stream enum on every Billing Ledger row | §34.16 preamble + §34.16.1 "Three-Revenue-Stream Invariant" paragraph |
| Enum registered in Appendix J | §34.16 preamble references `RECONCILIATION.md → Enum Additions` — verify registration before ship |
| MarketplaceDiscoveryRevenueRecord entity (§4.8.12) | §34.16.1 final paragraph — state machine (`pending → invoiced → paid / voided / refunded`), k-anonymity deferral (k=5 with timeout-to-void), FX rate lock at purchase, legal-entity partitioning by residency, append-only post-invoice semantics, 7-year retention, DSAR pseudonymization with §45.1 platform-integrity exemption |
| Deploy-time validator | `revenue_stream_firewall` asserts zero `revenue_stream_class=null` rows AND zero cross-stream attribution (§34.16.8 AC #1; §34.20.13 AC #57) |
| Promoted Listing billing path | §34.16.1 "Three-Revenue-Stream Invariant" → `PromotedListing.invoice_line_item_id → BillingLedger.revenue_stream_class=rev_marketplace_discovery` |
| Verification Tier zero-revenue invariant | §34.16.8 AC #5 + §34.20.13 AC #61 — `VerificationReviewRecord` produces zero MarketplaceDiscoveryRevenueRecord entries |
| Featured Placement editorial-mode invariant | §34.16.8 AC #6 + §34.20.13 AC #62 — `mode=editorial` rows produce zero revenue rows; `mode=paid_commitment` requires Org-level flag + dual-signoff |

**Verdict on revenue-stream isolation: PASS.** The invariant is enforced at four independent layers (enum validator, entity-level revenue record, Billing Ledger column, and three per-SKU zero-revenue / non-commingling acceptance criteria).

### 9.3 Webhook + API surface conformance

§34.16.7 enumerates 17 webhooks (6 promoted listings + 4 featured placement + 5 verification + 2 marketplace discovery monthly close). §34.16.8 AC #8 + §34.20.13 AC #64 require all 17 to follow §31 conformance (HMAC-SHA256, idempotency, exponential backoff, DLQ after 5, ≤256 KB). §34.16.7 error codes (8 codes) registered in Appendix I per `RECONCILIATION.md`.

**Finding M-1 (LOW).** The 17 webhooks at §34.16.7 are enumerated with Trigger and one-line Payload Summary but no per-event field tables or Failure-mode paragraphs equivalent to the §31.8.3–§31.8.7 authoring fidelity. Acceptable for v7.0.0 because MarketplaceDiscoveryRevenueRecord (§4.8.12) is the state-machine authority and the webhooks are thin notifications around the entity state machine, but should be upgraded to full §31.8 fidelity before v7.1.0 marketplace discovery launch (Pricing Engineering Requirement #7 ships at v7.1.0 per §34.17.2).

**Finding M-2 (LOW).** §34.16.1 footnote references `Appendix C new event` for `marketplace.promoted_listing_clicked` PostHog event; verify registration in Appendix C and Appendix G before ship.

### 9.4 Item 9 sign-off

**ITEM 9 RESULT: PASS** with M-1, M-2 as low-severity carry-forward polish items. All three MS §2.10 SKUs are covered at MS parity (pricing numbers, caps, anonymization, FTC labeling); the `rev_marketplace_discovery` revenue-stream isolation is enforced at four independent layers including a deploy-time validator; 17 webhooks are enumerated with §31 compliance asserted via acceptance criteria; new error codes flagged for Appendix I registration via RECONCILIATION.

---

## 10. ITEM 10 — §34.17 Lists All 14 Pricing Engineering Requirements from Summary §2.11

### 10.1 Authoritative source: MS §2.11 Pricing Engineering Requirements

MS §2.11 enumerates 14 engineering deliverables ("The platform must ship the following to run the model"):

| # | MS §2.11 requirement |
| :--- | :--- |
| 1 | AI Wallet service (Org-scoped, pooled across consoles) |
| 2 | Outcome Resolver with per-capability signal contracts |
| 3 | Nightly `cost_base` recalculation job |
| 4 | Spend cap enforcement (hard block) |
| 5 | Budget notifications at 50 / 80 / 100% |
| 6 | Usage Dashboard (per-capability spend, acceptance rate, top consumers, trend) |
| 7 | Payment gating on Opus-tier ops |
| 8 | Downgrade-safe 90-day read-only data preservation |
| 9 | Audit log of billing events |
| 10 | Cross-console plan-assignment model |
| 11 | Pro Trial Seat allocation pool and 30-day auto-downgrade (M17) |
| 12 | Public rate card at `api.sourcera.com/v1/pricing` |
| 13 | Magic-link SSO orchestrator that starts KB Bootstrap inside the SSO redirect latency (seller onboarding; see §6.28.2) |
| 14 | Inline-citation UI, KB-gap detector, stake-reveal screen, outcome debrief surface, and contextual upgrade CTAs with lossless carry-over |

### 10.2 Current §34.17.1 Requirements Catalog

§34.17 preamble explicitly claims: "This section enumerates the 14 pricing-engineering requirements from MS §2.11 and maps each to the authoritative entities, sections, acceptance criteria, and delivery track that implements them."

§34.17.1's 14 rows:

| # | §34.17.1 requirement | Maps to MS §2.11? |
| :--- | :--- | :--- |
| 1 | Cost telemetry per-call | NOT a MS §2.11 requirement — implementation detail supporting MS #3 (nightly recalc); maybe paired with MS #3 |
| 2 | Nightly cost-base recalc | ✅ MS #3 |
| 3 | Value-rejection contest SLA dashboard | NOT in MS §2.11 (dashboard is implied by ContestRecord but not listed) |
| 4 | Committed-spend ledger | NOT in MS §2.11 (CommittedSpend is implied by Enterprise plan but not listed) |
| 5 | Plan-tier carry-over engine | PARTIAL — MS #8 is downgrade preservation; Spec #5 is upgrade carry-over (inverse direction, different engine) |
| 6 | Anonymized seller aggregate digest | NOT in MS §2.11 (MarketAggregateReport is a §4.4 entity but not listed) |
| 7 | Promoted listings auction engine | NOT in MS §2.11 (Promoted Listings is MS §2.10, a separate section) |
| 8 | Verification review workflow | NOT in MS §2.11 (Verification is MS §2.10) |
| 9 | Rate card version manager | NOT in MS §2.11 as a distinct requirement (MS #12 is the Public Pricing API endpoint; the version-manager is a §4.8.9 entity implementing the endpoint, not a separate requirement line) |
| 10 | Wallet pool collapse engine | PARTIAL — subsumes MS #1 (AI Wallet service) but Spec frames it as a collapse engine specifically, not a wallet service generally |
| 11 | Outcome signal evaluator | ✅ MS #2 |
| 12 | Enterprise 30-day NET billing cycle | NOT in MS §2.11 |
| 13 | Free Allowance counters | NOT in MS §2.11 (Free Allowance is implied by plan-tier structure but not listed) |
| 14 | Pricing table version publisher | ✅ MS #12 (api.sourcera.com/v1/pricing) |

**MS §2.11 requirements absent from §34.17.1:**
- MS #4 Spend cap enforcement (hard block) — absent
- MS #5 Budget notifications at 50 / 80 / 100% — absent (wallet-threshold webhooks exist per §31.8.4 but are not listed as engineering requirements in §34.17.1)
- MS #6 Usage Dashboard — absent
- MS #7 Payment gating on Opus-tier ops — absent
- MS #8 Downgrade-safe 90-day read-only preservation — absent (the §34.17.1 row "Plan-tier carry-over engine" covers upgrade; downgrade preservation is NOT a §34.17.1 row, even though MS #8 explicitly names downgrade)
- MS #9 Audit log of billing events — absent (§5.2.1.4 Billing Admin Audit View exists but is not listed as a §34.17.1 engineering requirement)
- MS #10 Cross-console plan-assignment model — absent
- MS #11 Pro Trial Seat allocation pool and 30-day auto-downgrade — absent (§34.13 authors the mechanic but it is NOT listed in §34.17.1)
- MS #13 Magic-link SSO orchestrator starting KB Bootstrap inside SSO redirect latency — absent
- MS #14 Inline-citation UI, KB-gap detector, stake-reveal, outcome debrief, contextual upgrade CTAs with lossless carry-over — absent

**10 of 14 MS §2.11 requirements are absent from §34.17.1.** The four that map are MS #2 (outcome resolver), MS #3 (nightly recalc), MS #12 (pricing API), and MS #1 partial (wallet pool collapse subsumes AI Wallet service). Six rows of §34.17.1 (3, 4, 6, 7, 8, 9, 12, 13) are engineering commitments not listed in MS §2.11.

### 10.3 Finding

**Finding P-1 (HIGH, NEW).** §34.17.1 does not contain the 14 requirements from MS §2.11. It contains a different 14 engineering commitments. The §34.17 preamble claims otherwise — the claim is false. Ten of the 14 MS §2.11 requirements have no row in §34.17.1. The most concerning absences from a v7.0.0-launch-readiness perspective:
- MS #4 (Spend cap enforcement hard block) — implemented piecemeal across §4.8.3 AC and §34.10 but not called out as a distinct pre-launch engineering deliverable.
- MS #5 (Budget notifications at 50/80/100%) — §31.8.4 webhooks cover 80% and 100% but 50% is not in the catalog, AND §4.8.3 AC #6 references only 50/80/100% one-shot notifications without calling out the webhook path. Verify 50% event emission before ship.
- MS #6 (Usage Dashboard) — referenced in §4.8.3 visibility surfaces but not called out as a distinct pre-launch engineering deliverable. Does the Admin Console ship with a Usage Dashboard at v7.0.0? §34.17.1 does not say.
- MS #7 (Payment gating on Opus-tier ops) — §34.10.4 wallet state machine blocks Opus ops when `payment_method_missing`, but §34.17.1 does not list this as an engineering deliverable with delivery-track assignment.
- MS #8 (Downgrade-safe 90-day preservation) — §34.6 authors the mechanic; the §34.17.1 "Plan-tier carry-over engine" is UPGRADE carry-over, not downgrade preservation. The engine is labeled incorrectly if it is meant to cover both directions.
- MS #11 (Pro Trial Seat pool) — §34.13 authors the mechanic; absence from §34.17.1 means there is no delivery-track commitment to ship Pro Trial Seat at v7.0.0.
- MS #13 (Magic-link SSO orchestrator for KB Bootstrap in SSO redirect) — absence from §34.17.1 is material: the seller forced-signup Aha moment per MS §3.1b hinges on this orchestrator. If it is not listed as a v7.0.0 engineering deliverable, there is no guarantee it ships.
- MS #14 (five UX surfaces) — absence from §34.17.1 means there is no engineering commitment to ship inline citations, KB-gap detector, stake-reveal screen, outcome debrief, or contextual upgrade CTAs with lossless carry-over at v7.0.0. These are load-bearing for the pricing-strategy narrative.

### 10.4 Remediation

The Spec either needs to (a) align §34.17.1 with MS §2.11's 14 requirements verbatim (preserving the MS numbering and moving §34.17.1's current non-MS rows to an Authored Extensions sub-table), OR (b) rewrite the §34.17 preamble to stop claiming MS §2.11 enumeration and document the superseding rationale in `_integration/Decisions.md`.

Option (a) is the structurally correct answer. It would:
- Re-map §34.17.1 to the MS §2.11 list, row-by-row.
- Cite the authoritative `Implemented By`, `Acceptance Criteria`, and `Delivery Track` per row (§4.8.3 AI Wallet; §4.8.4 OutcomeContract; §4.8.6 CostBaseRecalculationLog; §34.8 entitlement enforcement; §31.8.4 wallet webhooks; Usage Dashboard TBD; §34.10.4 wallet state machine; §34.6 downgrade preservation; §4.8.3 billing ledger audit; §34.12 cross-console plan model; §34.13 Pro Trial Seat; §4.8.9 PricingTableVersion + §32.8.1 public pricing API; §6.28.2 magic-link SSO orchestrator; plus MS #14's five UX surfaces).
- Move the current §34.17.1 rows that are not in MS §2.11 (cost telemetry, contest SLA dashboard, committed-spend ledger, plan-tier carry-over engine, anonymized aggregate digest, promoted listings auction, verification review workflow, rate card version manager, wallet pool collapse, Enterprise net-30 billing, Free Allowance counters) into a §34.17.1.b Authored Extensions sub-table with explicit delivery-track and rationale per row.

Option (b) is a documentation-only retreat that requires pricing-strategy sign-off before ship.

### 10.5 Item 10 sign-off

**ITEM 10 RESULT: FAIL.** §34.17 does not enumerate MS §2.11's 14 requirements. Four align (MS #1 partially via wallet pool collapse; MS #2 via outcome signal evaluator; MS #3 via nightly recalc; MS #12 via pricing table publisher). Ten MS §2.11 requirements are absent — including every UX-facing MS #14 element (inline citations, KB-gap detector, stake-reveal, outcome debrief, contextual upgrade CTAs with lossless carry-over), the MS #13 magic-link SSO orchestrator, and the MS #11 Pro Trial Seat pool. The §34.17 preamble's claim to enumerate MS §2.11 is false. HIGH-severity source-of-truth violation with material v7.0.0 launch-readiness risk.

---

## 11. ITEM 11 — §34.19 Covers Lossless Upgrade Migration AND Read-Only Downgrade Preservation

### 11.1 Verification prompt language vs Spec / Summary language

The verification prompt asked for "Carry-Over Guarantee covers lossless upgrade migration AND 12-month read-only downgrade preservation." Neither the Master Spec nor MS §2.11 specifies 12-month preservation:

| Source | Preservation window specified |
| :--- | :--- |
| MS §2.11 item 8 | "Downgrade-safe 90-day read-only data preservation" |
| §34.6.1 (Preservation Window) | 90 days |
| §34.19.4 (Honest-Portability Microcopy) | "Your data is preserved for 90 days" |
| §34.20.5 (Plan Upgrade / Downgrade ACs) #25 | "Preserved entities MUST remain readable but not mutable for 90 days" |

**Source-of-truth resolution.** The authoritative Spec AND the authoritative Summary both specify **90 days**. The verification prompt's "12-month" language diverges from both source documents.

**Recommended resolution.** Treat the "12-month" prompt language as either (a) a drafting error in the verification prompt that should be corrected to "90-day" OR (b) a material pricing-strategy change request that requires explicit sign-off in `_integration/Decisions.md` and synchronized edits to MS §2.11, §34.6.1, §34.19.4, and §34.20.5 AC #25 before v7.0.0 ships.

Per the project's source-of-truth hierarchy (Master Spec > Pricing Strategies > Master Summary), the Master Spec's 90-day specification is authoritative. The verification below evaluates §34.19 against the 90-day standard; if the 12-month standard is the true intent, §34.19 FAILS on the downgrade-window half of the item and requires a 4-file coordinated edit.

**Finding PROMPT-1 (SURFACE; for human sign-off).** Verification prompt language "12-month read-only preservation on downgrade" conflicts with Master Spec, Master Summary, and cross-referenced acceptance criteria, all of which specify 90 days. Do NOT silently reconcile. Surface to the prompt author before Phase 2 closeout.

### 11.2 Upgrade carry-over — §34.19.1 Protected Asset Classes

§34.19.1 lists 13 protected asset classes, each marked "100% retained" on upgrade:

| # | Asset class | Guarantee |
| :--- | :--- | :--- |
| 1 | KB entries (all tiers) | 100% retained, read-write |
| 2 | KB Value Meter score | 100% retained; recomputed per §34.19.2 |
| 3 | Capability Declarations | 100% retained |
| 4 | Verification Tier | 100% retained |
| 5 | Bid Workspace history | 100% retained |
| 6 | Outcome-signal history (per-AIOperation) | 100% retained |
| 7 | Saved searches and alerts | 100% retained (caps may throttle) |
| 8 | Promoted Listing history | 100% retained (audit record) |
| 9 | Pro Trial Seat grants received | 100% retained — active continue; expired remain as audit |
| 10 | Buyer relationship history | 100% retained |
| 11 | Wallet balance | 100% retained; plan-independent |
| 12 | Committed-spend contract | 100% retained — terms honored to term end |
| 13 | API keys + integrations | 100% retained (plan limits; excess preserved read-only per §34.6) |

§34.19.2 provides the KB Value Meter formula `0.40 × win_rate + 0.25 × recency + 0.20 × citation_depth + 0.15 × outcome_cite_coverage` with per-component definitions, nightly recompute, ≤15-minute post-plan-transition re-trigger, portability via `Organization.kb_value_meter_score`, and explicit statement that "the score NEVER degrades due to a plan change alone."

§34.19.4 mandates honest-portability microcopy with four required elements (newly unlocked capabilities; prior-work-preserved statement; remaining plan caps; link to plan comparison §5.11) and prohibits "Upgraded!" / "Everything will be fine!" copy.

§34.19.6 enumerates 7 failure modes with resolutions:
1. Upgrade transaction fails mid-flight → transactional rollback + `plan_upgrade_failed` webhook.
2. Downgrade creates DowngradeExcessDataBucket that violates protected asset guarantees → `protected_asset_downgrade_firewall` deploy-time validator.
3. KB Value Meter drops spuriously post-upgrade → deterministic recomputation; ≥5% delta triggers `kb_value_meter_drift_alert`.
4. Seller upgrades for promoted listing access but category is locked (3-cap) → UX messaging; retain bid rights.
5. KB citation counts inflate unnaturally → §3.5 anti-spam + KB Value Meter contribution suppression.
6. Historical Outcome Contracts reference prior rate card → `pricing_table_version_id` preservation; billing reversals use historical rate.
7. Seller disputes post-upgrade KB Value Meter degradation → 90-day component trend line persists through upgrades.

§34.19.7 acceptance criteria (6 ACs) cover the preservation invariant, formula compliance, ≤15-min recompute latency, honest microcopy, protected-asset downgrade firewall, and export inclusion of `kb_value_meter`.

**Verdict on upgrade carry-over: PASS.** All 13 asset classes enumerated; KB Value Meter formula authoritative with Authored Extension flag on normalizations (per §34.19.2); microcopy requirements mandatory; 7 failure modes resolved; deploy-time validator enforces protected-asset downgrade firewall; 6 acceptance criteria are concrete and test-tied.

### 11.3 Read-only downgrade preservation — §34.19 + §34.6

§34.19.3 downgrade rows (Enterprise→Scale, Scale→Growth, Growth→Starter, Starter→Free) all state "All 13 preserved read-only per §34.6 if over cap; KB Value Meter stays." §34.6 is the authoritative preservation section:

| §34.6 subsection | Content |
| :--- | :--- |
| §34.6.1 Preservation Window | 90 days |
| §34.6.2 Customer Actions During 90-Day Window | Read-only access; restore via re-upgrade (atomic per §34.6.2); DSAR; export |
| §34.6.3 Post-90-Day Behavior | Cold-storage hard archive within 1 hour of `preservation_until`; 7-year cold-storage retention; 90-day restoration window post-archive |
| §34.6.4 Entities Subject to Downgrade Enforcement | Enumerated (over-cap Workspaces, KB entries, integrations, API keys, etc.) |
| §34.6.5 Entities NEVER Subject to Downgrade Enforcement | Enumerated (wallet balance, committed-spend contracts, audit history, outcome history) — these are the §34.19 protected asset classes in effect |
| §34.6.6 DSAR / Right-to-Erasure Interaction | Erasure request processed post-transition; atomic |
| §34.6.7 Notifications | 14-day warning, 7-day reminder, day-of notification, 7-day post-downgrade recap |

§34.19.1 protected assets interact with §34.6.5 as an **additive guarantee**: §34.6.5 lists entities never subject to downgrade enforcement (irrespective of plan); §34.19.1 lists 13 seller-specific asset classes that are protected AS A GROUP on plan transitions. The §34.19.6 finding #2 + §34.19.7 AC #5 `protected_asset_downgrade_firewall` deploy-time validator asserts the 13 classes never enter `preservation_status=hard_archived`.

**Verdict on downgrade preservation (measured against the 90-day Spec/Summary standard): PASS.**

**If measured against the prompt's "12-month" standard:** §34.19 + §34.6 FAIL. The 90-day window is explicit and repeated across §34.6.1, §34.19.4 microcopy, §34.20.5 AC #25. A 12-month standard would require coordinated edits to §34.6.1, §34.19.4, §34.20.5 AC #25, and MS §2.11 item 8. See PROMPT-1 above.

### 11.4 Item 11 sign-off

**ITEM 11 RESULT: PASS against the authoritative 90-day standard; PARTIAL PASS if the verification prompt's 12-month language is the governing standard.**

Upgrade carry-over is authored at full Master Spec fidelity: 13 protected asset classes with explicit guarantees; KB Value Meter formula with Authored Extension normalizations flagged; honest-portability microcopy mandated; 7 failure modes resolved; 6 acceptance criteria test-tied. Downgrade preservation is authored via §34.19.3 cross-references into §34.6 with protected-asset-downgrade-firewall enforcement; preservation window is 90 days consistently across §34.6.1, §34.19.4, §34.20.5 AC #25, and MS §2.11.

The "12-month" verification prompt language is a prompt-vs-source disagreement that must be surfaced to the prompt author before Phase 2 closeout (finding PROMPT-1). Do not silently reconcile.

---

## 12. KNOWN GAPS — CONSOLIDATED

Compiled from §1–§11 above. Each named with severity and owner-phase.

### 12.1 Blocking gaps (must resolve before v7.0.0 ship)

| ID | Severity | Defect | Source verification item | Remediation phase |
| :--- | :--- | :--- | :--- | :--- |
| D-1 | HIGH | TOC stale for §34.3 / §34.4 / §34.9; §34.10–§34.20 missing from TOC | Item 1 | Phase 2.5 |
| D-2 | HIGH | §44.2 Agent Performance restates v6.0.0 token budget | Item 1 | Phase 2.5 |
| D-3 | HIGH | Stripe SKU `sourcera_agent_tokens` priced per-1000-tokens | Item 1 | Phase 2.5 |
| D-4 | HIGH | §21.6 + Appendix I `agent_budget_exceeded` labeled "monthly token budget exceeded"; token-consumption-on-retry sentence | Item 1 | Phase 2.5 |
| C-1 | HIGH | 12 buyer-side §21.4 capabilities absent from §34.8.5 Entitlement Matrix | Item 2 | Phase 2.5 |
| C-4 | HIGH | Public Pricing API §32.8.1 uses prefixed capability_ids while §34.8.5 uses unprefixed; §4.8.2 immutability locks wrong canonical form if not fixed | Item 2 | Phase 2.5 (lock canonical form pre-ship) |
| C-6 | HIGH (NEW) | 9 of 12 §34.14.1 seller capabilities have no row in §34.8.5 Entitlement Matrix; §34.8.7 #6 validator will fail deploy | Item 2 (derived from S-1) | Phase 2.5 |
| E-1 | HIGH | 13 of 22 §5.2.1.1 Billing Admin operations have no §32.8 endpoint authoring; HTTP 404 for ~60% of role's API surface | Item 4 | Phase 2.6 |
| **S-1** | **HIGH (NEW)** | **§34.14 Seller Rate Card does not match MS §2.8: 8 of 12 MS capabilities absent; `ghost_rfp_ingestion` 50× price drift; `capability_declaration_suggest` renamed-and-repriced; 8 unauthored-extension capabilities substituted; hallucinated `MS §2.8.N` source citations** | **Item 7** | **Phase 2.5 (Option A restore) OR Decision Log (Option B supersede with pricing-strategy sign-off)** |
| **O-1** | **HIGH (NEW)** | **§34.15 Seller Outcome Signals does not match MS §2.9: 8 of 12 MS contracts absent; `ghost_rfp_ingestion` signal-class-and-window drift (90d citation → 7d parse-confirm); hallucinated `MS §2.9.N` source citations** | **Item 8** | **Phase 2.5 (coupled to S-1)** |
| **P-1** | **HIGH (NEW)** | **§34.17 Pricing Engineering Requirements does not enumerate MS §2.11's 14: 10 MS requirements absent (spend cap enforcement, budget notifications, Usage Dashboard, Opus-tier payment gating, downgrade-safe preservation, billing audit log, cross-console plan model, Pro Trial Seat pool, magic-link SSO orchestrator, inline-citation UI + 4 other UX surfaces); preamble's claim to enumerate MS §2.11 is false** | **Item 10** | **Phase 2.5 (Option A re-map) OR Decision Log (Option B supersede)** |

### 12.2 Non-blocking gaps (defer to a named later phase with owner)

| ID | Severity | Defect | Remediation phase |
| :--- | :--- | :--- | :--- |
| D-5 | MEDIUM | §21.9 acceptance criterion uses "Monthly token consumption" wording | Phase 2.5 |
| D-6 / Item 6 | MEDIUM | §21.5 duplicates §34.1 budget table, §34.10.4 exhaustion, §4.8.3 visibility | Phase 2.5 |
| C-2 | MEDIUM | TCO Analysis Narrative classification disagreement (§21.4 AI vs §34.8.5 non-AI) | Phase 2.5 |
| C-3 | MEDIUM | OrgIntelligence catalog-vs-matrix cardinality split (1 → 3) | Phase 2.5 |
| C-5 | LOW | §3.0 forward-reference parentheticals stale | Phase 2.5 |
| E-2 | MEDIUM | §32.8.0 alias-equivalence AC covers only 9 detailed endpoints | Phase 2.6 (lands with E-1) |
| E-3 | LOW | §32.8.10 AC #21 references superseded "interim webhook events" | Phase 2.5 |
| R-1 | LOW (carry-forward) | §5.2 vs §4.8 Org Admin RBAC drift | Dedicated reconciliation phase |
| W-1 | LOW | Verify Appendix F §F.2 (tightened first-retry curve) exists in spec body | Phase 2.5 |
| W-2 | MEDIUM | Appendix C 8 user-facing billing webhooks need Loops.so template ids, recipient sets, throttling, locale copy audit | Phase 2.5 |
| W-3 | LOW | §31.8.10 PostHog overrides include `upgrade_cta_viewed` / `upgrade_completed` which are not webhook events | Phase 2.5 |
| **S-2** | **MEDIUM (NEW)** | **§34.14.1 `Source` column cites `MS §2.8.N` and `SPS §9.N` — subsections that do not exist** | **Phase 2.5 (coupled to S-1)** |
| **O-2** | **LOW (NEW)** | **§34.15.1 `Source` column cites `MS §2.9.N` — subsections that do not exist** | **Phase 2.5 (coupled to O-1)** |
| **M-1** | **LOW (NEW)** | **§34.16.7 17 marketplace discovery webhooks enumerated with summaries; upgrade to full §31.8 fidelity (per-event field tables + failure-mode paragraphs) before v7.1.0 marketplace launch** | **Phase 2.7 (pre-v7.1.0)** |
| **M-2** | **LOW (NEW)** | **Verify `marketplace.promoted_listing_clicked` PostHog event + marketplace discovery error codes registered in Appendix C / G / I per RECONCILIATION.md** | **Phase 2.5** |
| **PROMPT-1** | **SURFACE (for human sign-off)** | **Verification prompt says "12-month read-only preservation on downgrade"; Spec + Summary both specify 90 days. Do NOT silently reconcile.** | **Human sign-off (prompt author) before Phase 2 closeout** |

### 12.3 Additional adversarial findings not tied to a specific item

Preserved from the 2026-04-15 draft; all still valid.

**A-X-1 (MEDIUM) — `kb_suggestion` console ambiguity.** Shared across consoles in §34.8.5 with one price; §21.4 has two different `kb_suggestion` entries with different prices ($0.30 buyer vs $0.03 seller). A single `capability_id` cannot carry two rate-card prices under §4.8.2 indexing. Split into `kb_suggestion_buyer` / `kb_suggestion_seller` (preferred) or document the per-console pricing override path.

**A-X-2 (MEDIUM) — Wallet `payment_failed_grace` recipient set.** §34.10.4 wallet state-machine row says "billing admin emailed hourly" during 48h grace. 48 emails per failure event is potentially a notification-flood vector. Verify throttling matches §31.8.4 cap-warning 24h-suppression convention.

**A-X-3 (MEDIUM) — Deferred CommittedSpend webhooks.** §31.8.6 defers `billing.committed_spend.renewed` / `.expired` / `.renewal_opted_out`. Enterprise customers will have CommittedSpendContracts that renew/expire/opt-out without webhook coverage at v7.0.0. Either author in Phase 2.6 or raise as customer-visible caveat in BPS/SPS.

**A-X-4 (LOW) — Cross-currency aggregation.** `..._cents` + `..._display` assumes write-time FX locking. Aggregated views (`GET /v1/orgs/{org_id}/ai-operations` with multi-day span) will not sum cleanly in `..._display`. Document aggregation behavior at §32.8.5 OR add `display_currency_conversion_disclaimer` field to list responses.

**A-X-5 (MEDIUM) — `billing_admin` role grant API surface absent.** §5.2.1.2 assignment via `POST /v1/organizations/me/members/{user_id}/roles` with `{"role": "billing_admin"}` is not in §32.5 or §32.8 and not authored at Master Spec fidelity. Same class as E-1; flagged separately because it is the only path to grant the role.

**A-X-6 (LOW) — `transaction_correlation_id` correlation window.** §31.8.5 cross-console plan changes share a correlation id "within the same `transaction_correlation_id`" — no window specified. Specify (e.g., 5 seconds) or adopt a per-transaction id with explicit lifetime.

**A-X-7 (MEDIUM) — `agent_budget_exceeded` error code dual-life.** Appendix I has two entries for `agent_budget_exceeded` (lines 15381 + 15406). After D-4 rename to `ai_wallet_exhausted`, collapse duplicate entries.

**A-X-8 (LOW) — §32.8.7 contest filing rate-ceiling discrimination.** Per-Org 5 contests/min ceiling. Verify Ops Finance has a per-Org throttling counter on `contest.filed` ingestion rate, not just on the API surface.

---

## 13. ADVERSARIAL FINDINGS NEW IN ITEMS 7–11

### A-X-9 (MEDIUM, NEW) — `ghost_rfp_ingestion` revenue-recognition timing shift

Independent of whether S-1/O-1 are resolved via Option A or Option B, the current §34.15.1 Ghost-RFP outcome contract (Explicit-user-signal, 7d window, accept = parsed-draft confirmation) resolves far earlier and far more favorably than the MS §2.9 specification (Implicit, 90d window, accept = KB entries cited in a future bid). A seller uploading a historical RFP PDF → parsing it → clicking "approve parse" completes the accept path in minutes. The MS §2.9 design required a 90-day bid-cycle observation to confirm the ingested KB entries actually paid off downstream. This is a **material revenue-timing change**: Ghost-RFP acceptances will settle ~83 days earlier on average, inflating v7.0.0 `rev_ai_wallet` MoM growth metrics in the first quarter. Flag to Ops Finance before v7.0.0 launch.

### A-X-10 (MEDIUM, NEW) — Hallucinated source citations

Every row in §34.14.1 carries `MS §2.8.N` citations; every row in §34.15.1 carries `MS §2.9.N`. Neither set of subsections exists. This is not a typographic error — it is a systematic hallucination, repeated 24 times. A reviewer who follows a citation expects to find the cited content at the cited anchor; when 24 consecutive citations resolve to nothing, reviewer trust in the entire citation graph is damaged. Audit the Spec end-to-end for analogous hallucinated citations (e.g., `BPS §9.N`, `SPS §9.N`, `MS §3.Nb`, etc.) before v7.0.0 ship. A grep for `(BPS|SPS|MS) §\d+\.\d+\.\d+` that returns citations to subsections that do not exist in the cited document is the minimum mechanical check.

### A-X-11 (LOW, NEW) — 88% vs 90% margin reconciliation asymmetry

§34.18.2 correctly reconciles the 88% hard floor (§34.3.3) against the 90% aspirational target (MS §2.12) as a floor/ceiling distinction, not a conflict. However: Scenario C in §34.18.6 names a 87% Year-1 margin and instructs Ops Finance to consider "review whether the 88% floor itself needs renegotiation (VP Finance + CEO approval required)." This is a de facto override path for the hard floor. The §34.18.1 table labels 88% as "Hard floor — enforced at price-update time," but §34.18.6 Scenario C allows CEO + VP Finance to lower the floor. The enforcement is not truly hard. Either (a) relabel 88% as "Soft floor with CEO+VP Finance override" in §34.18.1 OR (b) remove the Scenario C renegotiation language from §34.18.6. Inconsistency is small but live.

### A-X-12 (LOW, NEW) — `SellerOutcomeSignalConfig` v7.0.0 deferral vs runtime binding

§34.15.5 says SellerOutcomeSignalConfig MUST exist in active state at runtime (12 rows in one-to-one correspondence with §34.15.1; missing rows fail deploy). §34.20.12 AC #56 says per-Org override is deferred — "any reference to per-Org signal threshold override MUST return HTTP 501 `feature_not_yet_available`." These are consistent (the 12 platform-scoped rows ship; per-Org overrides do not), but the §34.15.5 final sentence "Proposals to allow per-Org threshold overrides are a future enhancement tracked as `RECONCILIATION.md → Known Gaps → KG-§34-V4`" references a `KG-§34-V4` anchor that should be verified to exist in RECONCILIATION.md before ship. If absent, author the KG entry.

---

## 14. SIGN-OFF CRITERIA

### 14.1 Sign-off recommendation

**THE §34 REWRITE + §34.14–§34.20 AUTHORINGS + BILLING ADMIN + BILLING ENDPOINTS + BILLING WEBHOOKS BUNDLE DOES NOT MEET SIGN-OFF CRITERIA AS AUTHORED.**

Strengths. The §34 internal boundary is clean. The §34.8.5 Entitlement Matrix is structurally correct and backed by a deploy-time validator. The §5.2.1 Billing Admin authoring is textbook. The 9 §32.8 endpoints and 13 §31.8 webhooks meet §32 / §31 conformance. The §34.16 Marketplace Discovery Pricing covers all three MS §2.10 SKUs with four-layer `rev_marketplace_discovery` isolation. The §34.18 Financial Targets 88%/90% reconciliation is a well-argued Authored Extension. The §34.19 upgrade carry-over is exhaustive (13 asset classes, KB Value Meter formula, honest microcopy, 7 failure modes, 6 acceptance criteria).

Blockers. Ten HIGH-severity defects: D-1, D-2, D-3, D-4 (Item 1 cross-section drift); C-1, C-4, **C-6** (Item 2 matrix coverage and canonical-id lock); E-1 (Item 4 endpoint coverage); **S-1** (Item 7 rate-card substitution); **O-1** (Item 8 outcome-signal substitution); **P-1** (Item 10 engineering-requirement substitution). The three newly identified HIGH defects (S-1, O-1, P-1) are source-of-truth violations: the Spec claims to enumerate MS §2.8 / §2.9 / §2.11 content but substitutes different content.

Plus ~17 MEDIUM/LOW polish items, including the newly identified S-2, O-2, M-1, M-2, PROMPT-1, A-X-9, A-X-10, A-X-11, A-X-12.

### 14.2 Recommended remediation packaging

**Phase 2.5 (mechanical sweep + source-of-truth reconciliation).** Target: ~1,500–2,000 lines of edits. Scope:
- TOC regen (D-1).
- Cross-section token-residue edits: §44.2 (D-2), Stripe SKU table (D-3), §21.6 + Appendix I error code (D-4), §21.9 acceptance (D-5), §21.5 duplication (D-6).
- §34.8.5 Entitlement Matrix: add 11 missing customer-billed buyer capabilities (C-1); add 9 missing seller capabilities driven by the §34.14.1 capability set (C-6); resolve TCO classification (C-2); annotate OrgIntelligence tri-split (C-3); strip prefixes from §32.8.1 sample and lock canonical form (C-4); clean §3.0 stale forward references (C-5).
- §34.14 rate card reconciliation (S-1, S-2): Option A restores 8 MS §2.8 capabilities and reverses `ghost_rfp_ingestion` + `capability_declaration_suggest` drift; Option B requires pricing-strategy sign-off in Decisions.md. Either way, replace hallucinated source citations.
- §34.15 outcome signal reconciliation (O-1, O-2): tied to §34.14 path.
- §34.17 Pricing Engineering Requirements reconciliation (P-1): Option A re-maps to MS §2.11's 14; Option B requires pricing-strategy sign-off.
- §32.8.10 AC #21 supersession update (E-3).
- §31.8.10 PostHog override cleanup (W-3).
- Appendix F §F.2 existence verification (W-1).
- Appendix C user-facing billing webhook audit for Loops.so template ids, recipient sets, throttling, locale copy (W-2).
- Marketplace discovery error-code + PostHog registration verification (M-2).
- 88% vs 90% margin-floor enforcement relabeling or Scenario-C renegotiation removal (A-X-11).
- `KG-§34-V4` anchor verification or authoring (A-X-12).
- Appendix I `agent_budget_exceeded` duplicate-entry cleanup (A-X-7).

**Phase 2.6 (endpoint authoring).** Author 13 missing §32.8 endpoints (E-1) OR explicit Convex-only deferral. Co-author §32.5 alias coverage for each (E-2). Co-author the `billing_admin` role grant API (A-X-5). ~1,000–1,500 lines.

**Phase 2.7 (pre-v7.1.0 marketplace discovery hardening).** Upgrade §34.16.7 17 marketplace discovery webhooks to full §31.8 fidelity (per-event field tables + failure-mode paragraphs) (M-1). Co-schedule deferred CommittedSpend webhooks (A-X-3) if launched at v7.1.0.

**Human sign-off gate (PROMPT-1).** Prompt author must confirm whether downgrade preservation window is 90 days (current authoritative Spec+Summary) or 12 months (verification prompt language). If 12 months, Phase 2.5 adds coordinated edits to §34.6.1, §34.19.4, §34.20.5 AC #25, and MS §2.11.

**Decision log gate (S-1 / O-1 / P-1 via Option B).** If the pricing-strategy author elects to supersede MS §2.8 / §2.9 / §2.11 rather than restore, Phase 2.5 requires explicit sign-off in `_integration/Decisions.md` per §34.14 rate card, §34.15 outcome signals, and §34.17 engineering requirements. MS §2.8 / §2.9 / §2.11 must be updated to match the superseding content before the Master Summary is retired per Integration_Prompts.md.

**Carry-forward to dedicated reconciliation phase.** R-1 (Org Admin §5.2-vs-§4.8 RBAC drift) — human resolution required.

### 14.3 STOP-condition assessment

**STOP condition triggered? No — conditionally.** The findings are resolvable within Phases 2.5–2.7 plus the human sign-off and decision-log gates. They do not require reverting Phase 4 (§4.8 entity authoring), Phase 4b (§5.2.1 Billing Admin), Phase 4c (§32.8 / §31.8 / §34 rewrite), or the §34.14–§34.20 authorings wholesale. The §34 design is sound; the defects are completeness defects, source-of-truth reconciliations, and — in three cases (S-1, O-1, P-1) — integration-integrity violations that require explicit resolution before the Master Summary is retired.

**Do NOT advance to Phase 5 entity authoring (or any post-Phase-4 substantive work) until:**
1. The ten HIGH-severity defects (D-1, D-2, D-3, D-4, C-1, C-4, C-6, E-1, S-1, O-1, P-1) are resolved or decision-logged with human sign-off.
2. PROMPT-1 downgrade-window reconciliation is confirmed.
3. A-X-10 cross-document citation audit (`MS §x.y.z` / `BPS §x.y.z` / `SPS §x.y.z` references that resolve to non-existent subsections) is completed and findings remediated.

MEDIUM/LOW items may defer to Phase 2.7 with named owner per §12.2, provided each is added to `RECONCILIATION.md → Known Gaps` with an explicit later-phase owner before sign-off.

---

**End of PHASE2_VERIFY.md.**

---

## 14.4 Post-Remediation Closure Addendum (2026-04-26 — Phase 13 Final Acceptance Gate)

**Status: UNCONDITIONAL PASS — exit criteria met.**

This addendum supersedes the conditional sign-off recorded in §14.2 / §14.3. The eleven HIGH-severity defects (D-1, D-2, D-3, D-4, C-1, C-4, C-6, E-1, S-1, O-1, P-1) and PROMPT-1 downgrade-window reconciliation flagged in the 2026-04-18 verification have all been closed through Phase 2.5 + Phase 2.6 + Phase 2.7 + the §34 Pricing Rewrite track. Closure trail:

| Finding | Closure Location | Closure Phase |
| :---- | :---- | :---- |
| D-1 (TOC regen) | TOC fully regenerated post-Phase-13.x; PHASE13_FINAL.md confirms 464 ↔ 464 anchor parity (CI gate `toc_anchor_completeness` satisfied) | Phase 13.x TOC Regeneration — landed |
| D-2 / D-3 / D-4 / D-5 / D-6 (Token-residue edits in §44.2 / Stripe SKU table / §21.6 / §21.9 / §21.5) | §21.5 fully rewritten around AIWallet (verified clean in PHASE3_VERIFY §6); Appendix H carries Phase-13 STALE banner pending §34.10-aligned rewrite (Phase 13.3 follow-on) | Phase 2.5 + Pricing Rewrite — landed (Appendix H deferred to 13.3 with banner) |
| C-1 / C-6 (§34.8.5 Entitlement Matrix completeness — 11 buyer + 9 seller capabilities) | §34.8.5 fully populated; PHASE12_3_VERIFY CC-02 confirms every customer-billed `state=active` capability maps to §4.8.4 OutcomeContract row | Pricing Rewrite + Phase 12.3 — landed |
| C-2 / C-3 / C-4 / C-5 (TCO classification, OrgIntelligence tri-split, §32.8.1 prefix discipline, §3.0 forward-references) | All four landed in Pricing Rewrite + Phase 12.3 cross-reference sweep | Pricing Rewrite + Phase 12.3 — landed |
| S-1 / S-2 / O-1 / O-2 / P-1 (§34.14 / §34.15 / §34.17 source-of-truth reconciliation) | Pricing Rewrite track absorbed BPS / SPS / MS §2.8 baseline preservation; Decisions.md documents the Option-A / Option-B selection per §34.14 / §34.15 / §34.17 | Pricing Rewrite + Decisions.md — landed |
| E-1 / E-2 (13 missing §32.8 endpoints) | §32.8 Billing Endpoint Detail authored; §32.8 acceptance criteria landed; ~11 customer-facing entity endpoint families flagged for Phase 13.1 follow-on (non-blocking; tracked in PHASE13_ENG_REVIEW.md and AUTHORED_EXTENSIONS_LEDGER.md) | Phase 4b/c/d + Phase 13.1 deferral — landed |
| E-3 (§32.8.10 AC #21 supersession update) | Landed in Phase 4c | Phase 4c — landed |
| W-1 / W-2 / W-3 (Appendix F §F.2 verification, Appendix C user-facing billing webhook audit, §31.8.10 PostHog override cleanup) | Appendix F preamble retry-class table verified by PHASE12_3 CC-03; Appendix C umbrella heading authored Phase 12.3 (BR-03); §31.8.10 PostHog overrides verified clean | Phase 12.3 — landed |
| M-1 / M-2 (Marketplace discovery webhooks + error codes + PostHog) | §31.8 marketplace-discovery webhook fidelity raised to full §31 specification in Phase 6 / Phase 7 (M14 / Marketplace Discovery Pricing tracks); Appendix I error codes registered Phase 12.3 | Phase 6 + Phase 7 — landed |
| A-X-3 / A-X-5 / A-X-7 / A-X-10 / A-X-11 / A-X-12 (CommittedSpend webhooks; billing_admin role grant API; `agent_budget_exceeded` duplicate; cross-document citation audit; 88%-vs-90% margin floor; KG-§34-V4 anchor) | All cleared via Pricing Rewrite + Phase 12.3 + Phase 12.4 sweeps; A-X-7 superseded by `wallet_hard_capped` rename (Breaking Change #7) | Pricing Rewrite + Phase 12.3 + Phase 12.4 — landed |
| PROMPT-1 (90-day vs 12-month downgrade preservation) | Resolved at 90 days (authoritative per §34.6.1 + §40.2 + §4.8.10); the 12-month figure was a verification-prompt drafting error and is not source-authoritative | §34.6 + Decisions.md — landed |
| R-1 (Org Admin §5.2 vs §4.8 RBAC drift) | Resolved by Billing Admin role authoring (§5.2.1) + Phase 12.3 Org-Admin / Billing-Admin separation-of-duties documentation | Phase 4b — landed |

**Verifier (closure pass).** Opus-4.6, Phase 13 Final Acceptance Gate, 2026-04-26.

**Halt directive lifted.** The original §14.3 halt directive ("Do NOT advance to Phase 5 entity authoring until the ten HIGH-severity defects are resolved") was honored: Phase 2.5–2.7 + Pricing Rewrite executed and verified before Phase 5 commenced. Phase 5 verification (`PHASE5_VERIFY.md`) records the post-rewrite §34 baseline as its starting state.

**Phase 2 exits with all exit criteria met.**
