# Phase 2 Adversarial Verification — §34 Pricing & Billing Rewrite, §5.2.1 Billing Admin, §32.8 Billing Endpoints, §31.8 Billing Webhooks

**Scope.** Verification of the §34 token-budget → AIOperation/value-dollars rewrite and the four supporting integrations: §5.2.1 Billing Admin role authoring, §5.11 Feature Access Matrix updates, §32.8 Billing Endpoint detail, and §31.8 Billing-Domain Webhook Catalog. Phase 1 entity authoring (§4.3) and Phases 3 / 4 / 4b / 4c entity authoring (§4.4 / §4.5 / §4.7 / §4.8 / §5.2.1) are not the primary subject; their downstream effects on §34 are noted only where they invalidate or strengthen a §34 finding.
**Reviewer role.** Hostile — actively looking for reasons the §34 rewrite + Billing Admin + Billing Endpoints + Billing Webhooks bundle should not ship as v7.0.0.
**Baseline.** `_versions/Sourcera_Master_Spec_v6.0.0.md` (token-denominated §34, no Billing Admin role, no §31.8, no §32.8).
**Target.** `Sourcera_Master_Spec.md` (current working copy; §34 = §34.1–§34.14, §32.8 = §32.8.1–§32.8.10, §31.8 = §31.8.1–§31.8.10, §5.2.1 = §5.2.1.1–§5.2.1.5).
**Verification date.** 2026-04-15.
**Verification protocol.** Each of the six verification items in the integration-program prompt is scored PASS / PARTIAL / FAIL with structural and adversarial sub-findings; remediation is named per finding; sign-off recommendation appears in §7.

---

## 1. ITEM 1 — §34 Rewrite: Token-Budget Model Fully Replaced

### 1.1 Internal §34 conformance

**Inside the §34 boundary (lines 12702–13670):** the rewrite is internally clean.

| Test | Result | Evidence |
| :--- | :--- | :--- |
| Any inline reference to the historic per-month token budget (Free 50K / Business 500K / Enterprise 5M) inside §34 | NONE | Grep against §34.1–§34.14 returns zero matches for `500K`, `5M tokens`, `tokens/month`, or `Agent Token Budget` |
| Any reference to "tokens" inside §34 that denotes AI-consumption units | NONE substantive | The single residual "token" mention is `max API tokens` (line 12707-area cross-reference to §39 — API tokens are unrelated to AI consumption); the §34.1.3 grandfathering paragraph refers to the v6.0.0 model as historical context only ("Existing v6.0.0 Business customers ($499/mo, token-denominated budget) grandfather into Business Growth…"); §4.8.11 footnote mentions "API-only identity (token-only user)" — also unrelated |
| AIOperation entity referenced throughout §34 | YES | 30 references across §34.1, §34.3, §34.5, §34.8, §34.10, §34.11, §34.12, §34.13, §34.14 |
| AIWallet entity referenced throughout §34 | YES | 21 references; central to §34.10 and woven through §34.5 / §34.6 / §34.12 / §34.13 |
| value-dollar denomination used as the consumption unit | YES | 19 references; §34.3.1 Pricing Formula and §34.10.1 Wallet Counters anchor the unit |
| OutcomeContract / ContestRecord / CapabilityRegistryEntry / FreeAllowanceCounter / CommittedSpendContract / PricingTableVersion / DowngradeExcessDataBucket / BillingSeatSnapshot referenced where relevant | YES | §34.3 cites OutcomeContract, §34.6 cites DowngradeExcessDataBucket, §34.7 cites BillingSeatSnapshot, §34.8 cites CapabilityRegistryEntry + FreeAllowanceCounter, §34.10 cites AIWallet, §34.11 cites OutcomeContract + ContestRecord + CostBaseRecalculationLog, §34.12 cites CommittedSpendContract |

**Verdict on §34 internal conformance: PASS.** The rewrite is faithful to the Pricing Strategy and the §4.8 entity authoring; the wallet, the rate card, the entitlement matrix, the wallet state machine, the Outcome Resolver, and the Pro Trial Seat carry-over are all token-free.

### 1.2 Cross-section drift — dangling references to the old model OUTSIDE §34

The rewrite was scope-limited to §34. Six artifacts elsewhere in the spec still encode the old token-budget model and produce a contradiction with the new §34. Each is a ship-blocker for documentation integrity, even though the runtime billing surface (§4.8 entities, §32.8 endpoints, §31.8 webhooks) is internally consistent.

| ID | Severity | Location | Defect | Remediation |
| :--- | :--- | :--- | :--- | :--- |
| **D-1** | HIGH | Line 564 (TOC) | `[34.4 Agent Token Budget & Overage]` is the v6.0.0 §34.4 title. Current §34.4 is "No Per-Unit Metering on Structural Resources." The TOC also still names §34.3 as "Overage Pricing (Business Tier)" (line 562; current §34.3 is "Outcome-Based AI Operation Pricing") and §34.9 as "Acceptance Criteria" (line 574; current §34.9 is "Onboarding and Trial Carry-Over"). §34.10 through §34.14 are entirely missing from the TOC. | Regenerate the TOC for §34.1–§34.14; add anchor entries for §34.10 AI Wallet Service, §34.11 Outcome Resolver, §34.12 Cross-Side Billing Rules, §34.13 Buyer-Funded Pro Trial Seat, §34.14 Acceptance Criteria. |
| **D-2** | HIGH | Lines 14558–14562 (§44.2 Agent Performance) | `Monthly Agent Token Budget: Free: 50K tokens/month (≈ 500-1000 requirements pre-scored) / Business: 500K tokens/month (≈ 5000-10000 requirements pre-scored) / Enterprise: 5M tokens/month (unlimited)`. Direct verbatim restatement of the OLD per-tier token budget. Engineering reading §44.2 in isolation will implement the wrong gating. | Delete the bullet block. Replace with: "Per-tier AI included-budget ceilings are authoritative in §34.1; per-Org wallet behavior in §34.10. §44.2 references those tables and does not restate values." |
| **D-3** | HIGH | Line 15309 (Stripe SKU table, §42 area) | SKU `sourcera_agent_tokens` priced at `Business: $0.01/1000 tokens (beyond 500K/mo). Enterprise: included in contract`. Old token-metered SKU; conflicts with the §34.3.1 outcome-based pricing formula and the §32.8.1 Public Pricing API rate-card schema. A live Stripe configuration matching this row would double-bill or under-bill against the §4.8.1 settlement model. | Remove the `sourcera_agent_tokens` row. Replace with the four authoritative billable SKU classes implied by §34.3 / §4.8.1: per-AIOperation overage (`sourcera_ai_operation_overage_value_dollars_cents`), wallet manual top-up (`sourcera_wallet_topup_value_dollars_cents`), wallet auto-top-up (`sourcera_wallet_autotopup_value_dollars_cents`), CommittedSpend annual commit (`sourcera_committed_spend_annual`). Confirm naming with §4.8.3 Wallet Stripe Metering and §4.8.8 CommittedSpendContract billing path. |
| **D-4** | HIGH | Lines 9911 (§21.6 Agent Failure Handling, "Token budget exceeded") and 9922 ("Failed calls that are retried consume tokens only on the successful attempt") | Both rows still reason in tokens. The first row maps the failure mode `Token budget exceeded` to error code `agent_budget_exceeded` (the same code surfaces in Appendix I lines 15381 and 15406, both labeled "monthly token budget exceeded"). The second sentence makes a token-accounting claim that has no analog in the value-dollar model. | (a) Rename the §21.6 row to `Wallet exhausted` with action `Reject call with ai_wallet_exhausted` (new error code; add to Appendix I). Cross-reference §34.10.4 wallet state machine. (b) Replace the "consume tokens" sentence with: "Failed calls that retry consume value-dollars only on the settling attempt; failed calls that degrade gracefully consume the `cost_price` per §4.8.1 (rejected outcome bills cost basis)." (c) Update Appendix I lines 15381 and 15406 to rename `agent_budget_exceeded` → `ai_wallet_exhausted` (or add the new code and deprecate the old with a sunset note); error message text must drop "token". |
| **D-5** | MEDIUM | Line 9962 (§21.9 Agent Acceptance Criteria) | Bullet: "Monthly token consumption is accurately metered and displayed." Token-denominated. | Replace with: "Monthly value-dollar consumption is accurately metered against the AIWallet (§34.10) and displayed per §4.8 visibility surfaces; FreeAllowanceCounter draw precedes wallet draw per §34.8.4." |
| **D-6** | MEDIUM | Lines 9874–9904 (§21.5 Agent AI Budgets) | §21.5 was rewritten to value-dollars (good), and it does cross-reference §34.10 and §34.11.3 (good), but it ALSO restates the per-plan budget table in full (Buyer Free $5 / Business Starter $50 / Business Growth $300 / Business Scale $800 / Enterprise Committed; Seller Free $5 / Seller Starter $30 / etc.). This is a verbatim duplicate of the §34.1 plan-tier definitions — exactly the duplication item 6 of the verification protocol forbids. Two consequences: (a) any future price change has two edit sites; (b) Authoring Convention #10 ("dollar figures…have one authoritative home") is violated. | Replace the §21.5 budget table with a single sentence + a forward reference: "Per-plan included AI budgets are authoritative in §34.1.1 (Buyer Plan Tiers) and §34.1.2 (Seller Plan Tiers). Pooled-across-consoles math is authoritative in §34.10.3. Wallet-overage behavior is authoritative in §34.10. Visibility surfaces are described in §4.8.3 (Wallet) and §4.8.7 (FreeAllowanceCounter)." Keep the "value-dollar denomination" preamble paragraph (it correctly summarizes the unit choice); delete the table. |

**Verdict on §34 cross-section conformance: FAIL.** The §34 rewrite did not finish the cross-section sweep. Six locations outside §34 still encode the legacy token-budget model. None are inside the §34 boundary, but D-1 (TOC) is on the user-facing navigation, D-2 (§44.2 Performance) is what an engineer reading the perf section will treat as authoritative, and D-3 (Stripe SKU table) is the only row that would have direct revenue impact if implemented as written.

### 1.3 Item 1 sign-off

**ITEM 1 RESULT: PARTIAL PASS (internal §34 PASS; cross-section FAIL).** The §34 boundary is internally consistent and faithful to Pricing Strategy and §4.8 entities. The remediations for D-1 through D-6 (TOC regen, §44.2 rewrite, Stripe SKU swap, §21.6/Appendix I error-code rename, §21.9 acceptance bullet rewrite, §21.5 table delete-and-reference) are mechanical edits totaling ~50 line changes across five non-§34 sections; they MUST land before v7.0.0 ship to avoid documentation contradiction.

---

## 2. ITEM 2 — Entitlement Matrix (§34.8.5) Coverage of the Capability Registry

### 2.1 Structural test

The §34.8.5 Entitlement Matrix (lines 13146–13197) lists 47 capability_id rows. Each row carries `enforcement_mode`, `free_allowance_ops`, per-console plan minimum (Buyer + Seller), and `upgrade_surface`. The §34.8.7 Acceptance Criterion #6 states the contract:

> Every customer-billed capability in CapabilityRegistryEntry with `state=active` MUST have a row in the §34.8.5 Entitlement Matrix; deploy-time validator asserts.

Because CapabilityRegistryEntry (§4.8.2) is a runtime data table — not an inline enumeration in the spec — there is no spec-level master list of `capability_id` values to cross-reference for completeness. The validator described by Acceptance #6 MUST be the runtime gate; the spec cannot pre-prove coverage. This is the structurally correct design (the registry MUST be Ops-mutable at runtime per §4.8.2 Authoring Intent), but it does mean the spec-time "coverage" check is best-effort against the editorial catalogs that DO appear in prose.

### 2.2 Editorial cross-check against §21.4 Agent Capability Catalog

§21.4 is the editorial Capability Catalog (lines 9818–9872). It enumerates 21 buyer capabilities and 13 seller capabilities by display name. Mapping each to the §34.8.5 capability_id surfaces a coverage gap.

| §21.4 display name | Console | §34.8.5 capability_id | Status |
| :--- | :--- | :--- | :--- |
| Policy Document Parsing | buyer | `policy_parsing` | ✅ |
| Policy Deduplication | buyer | — | **MISSING** |
| Policy Traceability Mapping | buyer | — | **MISSING** |
| Triage Auto-Mapping | buyer | — | **MISSING** |
| Requirement Splitting | buyer | — | **MISSING** |
| Vendor Invite Suggestion | buyer | — | **MISSING** |
| Evidence Parsing | buyer | — | **MISSING** |
| Pre-Scoring | buyer | `pre_scoring` | ✅ |
| Disagreement Insight Card | buyer | — | **MISSING** |
| Demo Focus Brief | buyer | — | **MISSING** |
| "What Would Flip" Analysis | buyer | — | **MISSING** |
| TCO Analysis Narrative | buyer | (`tco_modeling` carries `enforcement_mode = n/a (non-AI)` — not the same row) | **AMBIGUOUS** |
| Sensitivity Narrative | buyer | — | **MISSING** |
| Organizational Intelligence Briefing | buyer | `org_intelligence_vendor_history` / `org_intelligence_full` / `org_intelligence_suggestions` | ✅ (matrix splits 1 catalog entry into 3 rows; defensible — drift only in cardinality) |
| Deep Comparison | buyer | `deep_comparison` | ✅ |
| Stakeholder Summary | buyer | `stakeholder_summary` | ✅ |
| Vendor Summary | buyer | `vendor_summary` | ✅ |
| Requirement Extraction | buyer | `requirement_extraction` | ✅ |
| Pulse Digest (Weekly) | buyer | — | **MISSING** |
| Comment Thread Summary | buyer | — | **MISSING** |
| SLA Escalation | buyer | n/a (rule-based, not AI) | ✅ (correctly absent) |
| KB Bootstrap | seller | `kb_bootstrap` | ✅ |
| First-Pass RFP Draft | seller | `first_pass_rfp_draft` | ✅ |
| KB-to-Response Suggestion | seller | `kb_suggestion` (shared with buyer) | ✅ (shared id may merit a `kb_suggestion_buyer` / `kb_suggestion_seller` split — see §2.3 below) |
| Q&A Answer Suggestion | seller | `qa_suggestion` | ✅ |
| KB-to-Capability Suggestion | seller | `kb_to_capability_suggestion` | ✅ |
| KB Staleness Classifier | seller | `kb_staleness_classifier` | ✅ |
| Firecrawl Crawl + Dedupe | seller | `firecrawl_crawl_dedupe` | ✅ |
| Ghost-RFP Ingestion | seller | `ghost_rfp_ingestion` | ✅ |
| Seller Page Enrichment | seller | `seller_page_enrichment` | ✅ |
| Capability Declaration Suggest | seller | `capability_declaration_suggest` | ✅ |
| Match Score (numeric) | seller | `match_score_numeric` | ✅ |
| Bid Task Assignment Suggest | seller | `bid_task_assignment_suggest` | ✅ |
| Document Attach Suggest | seller | `document_attach_suggest` | ✅ |

**Findings:**
- **C-1 (HIGH).** Twelve buyer-side §21.4 capabilities are not represented in the §34.8.5 Entitlement Matrix: Policy Deduplication, Policy Traceability Mapping, Triage Auto-Mapping, Requirement Splitting, Vendor Invite Suggestion, Evidence Parsing, Disagreement Insight Card, Demo Focus Brief, "What Would Flip" Analysis, Sensitivity Narrative, Pulse Digest (Weekly), Comment Thread Summary. Each of these is listed in §21.4 with `Plan Access = All` (or a tier gate) and a non-zero `value` price — i.e., each is `customer_billed`. Per §34.8.7 Acceptance #6 the deploy-time validator will fail the build until these rows exist in CapabilityRegistryEntry AND in the matrix.
- **C-2 (MEDIUM).** TCO Analysis Narrative is in §21.4 as an AI capability ($1.20 accepted / $0.15 rejected). The matrix row `tco_modeling` carries `enforcement_mode = n/a (non-AI)`, which contradicts the §21.4 catalog. Either §21.4 mis-classifies TCO as AI and the matrix is correct, or the matrix mis-classifies as non-AI and the catalog is correct. Authoritative resolution required before either can be implemented.
- **C-3 (MEDIUM).** OrgIntelligence is one editorial capability in §21.4 but three matrix rows. The split-by-tier design (`org_intelligence_vendor_history` Starter+, `org_intelligence_full` Growth+, `org_intelligence_suggestions` Enterprise) is defensible from a plan-gating perspective, but the catalog should call out the tri-split so buyers and sellers reading §21.4 do not mistake this for one billable capability.

### 2.3 Naming-convention drift between Entitlement Matrix and Public Pricing API

The §32.8.1 Public Pricing API sample response (lines 11762–11804) uses **prefixed** capability_ids: `buyer_pre_scoring`, `buyer_qa_classify`, `seller_first_pass_response`. The §34.8.5 Entitlement Matrix uses **unprefixed** ids: `pre_scoring`, `qa_suggestion`, `first_pass_rfp_draft`. Three drift instances:

| Concept | §34.8.5 id | §32.8.1 sample id | Drift |
| :--- | :--- | :--- | :--- |
| Pre-scoring | `pre_scoring` | `buyer_pre_scoring` | Prefix |
| Q&A suggestion | `qa_suggestion` | `buyer_qa_classify` | Prefix + name (`suggestion` vs `classify`) |
| First-pass RFP draft | `first_pass_rfp_draft` | `seller_first_pass_response` | Prefix + name (`rfp_draft` vs `response`) |

**Finding C-4 (HIGH).** A customer-facing Public Pricing API response advertising one capability_id while the runtime Entitlement Matrix evaluates against a different id will, at minimum, confuse customers reading the rate card and, at worst, silently fail entitlement checks if the runtime cache loads the matrix verbatim. The `console_applicability` field on CapabilityRegistryEntry (§4.8.2) provides the per-console disambiguation; prefixing capability_ids with `buyer_` / `seller_` is therefore redundant. Authoritative form: the §34.8.5 unprefixed id is the canonical surface; §32.8.1 sample MUST be updated to drop prefixes in the response example. Per §4.8.2 acceptance #1 (`capability_id` immutable once any AIOperation has referenced it), the canonical form MUST be locked NOW, before v7.0.0 ship, or the immutability invariant binds the wrong choice.

### 2.4 Cross-check against §3 / §29 capability declarations

§3.0 (line 3029) introduces `comparison_page_generation` as a new capability_id with the parenthetical "(new; to be added to capability registry in Phase 3)." §3.0 (line 3306) introduces `seller_signal_aggregation` with the parenthetical "(new; Phase 3 capability registry)". Both of these IDs DO appear in the §34.8.5 matrix (lines 13194, 13196) tagged `n/a (platform_marketing)` / `n/a (sourcera_owned)`. Coverage is good for these two.

**Finding C-5 (LOW).** The Phase-3 parentheticals at lines 3029 and 3306 should be updated to drop "to be added" language since §34.8.5 already lists both ids — the additions have landed.

### 2.5 Item 2 sign-off

**ITEM 2 RESULT: PARTIAL PASS.** The matrix is structurally correct and well-indexed; the §34.8.7 Acceptance Criterion #6 deploy-time validator is the right backstop. Coverage against the editorial catalog (§21.4) is incomplete (12 missing, 1 ambiguous, 1 cardinality split). Naming drift between matrix and Public Pricing API sample (C-4) is a HIGH-severity authoring error that locks the wrong canonical form via §4.8.2 immutability if not fixed pre-ship. The §3.0 forward-references at C-5 are stale.

**Remediation summary for Item 2:**
1. Add 11 missing customer-billed buyer capabilities to §34.8.5 with explicit `capability_id`, plan-tier minimum, and `free_allowance_ops`; co-add corresponding rows to CapabilityRegistryEntry seed data per §4.8.2.
2. Resolve the TCO ambiguity: either reclassify §21.4 #12 as non-AI (and remove the value/cost price columns) or change `tco_modeling` to a `customer_billed` AI row.
3. Annotate §21.4 #14 to disclose the tri-split into `org_intelligence_*` rows.
4. Strip `buyer_` / `seller_` prefixes from the §32.8.1 sample response capability_ids; verify the Public Pricing API generator at §4.8.9 reads from the matrix's canonical `capability_id` form (not from a prefixed variant).
5. Update §3.0 forward-reference parentheticals at lines 3029 and 3306.

---

## 3. ITEM 3 — Billing Admin Present in §5.2, §5.11, Appendix J

### 3.1 §5.2 (Org-Level Roles)

| Test | Result | Evidence |
| :--- | :--- | :--- |
| `Billing Admin` listed in the §5.2 role table | YES | Line 4915, full row with scope, capabilities, and explicit non-permissions |
| Dedicated subsection authoring the role end-to-end | YES | §5.2.1 Billing Admin (lines 4917–5040): Authoring Intent, Scope, §5.2.1.1 Permission List (22 enumerated operations with API path + RBAC + audit action), §5.2.1.2 Assignment & Replacement Pattern, §5.2.1.3 Deprovisioning Behavior, §5.2.1.4 Billing Admin Audit View, §5.2.1.5 Failure Modes, Appendix-B Glossary entry, deploy-time validator hook |
| Replacement Pattern for empty-role-pool Org | YES | §5.2.1.2 — `org_owner` retains de facto fallback authority when zero `billing_admin` users exist |
| Deprovisioning behavior | YES | §5.2.1.3 — explicit handling of in-flight contests, in-flight Stripe charges, role transfer |
| Failure modes | YES | §5.2.1.5 — 5+ enumerated failure modes including the "deprovisioned 1s after filing" race |

**Verdict §5.2: PASS.** Authoring is complete and at Master Spec fidelity.

### 3.2 §5.11 (Feature Access Matrix)

| Test | Result | Evidence |
| :--- | :--- | :--- |
| Billing Admin column exists in the matrix | YES | Line 5204 — column header position 4 |
| Billing & AI Accounting feature group exists | YES | Lines 5242–5263 — 22 operation rows under the group header `**Billing & AI Accounting** (§4.8, §5.2.1, §34.12.6)` |
| Each Billing & AI Accounting row marks `billing_admin` ✓ and `org_admin` ✗ | YES (with one documented inconsistency carried forward; see below) | Spot-checked all 22 rows |
| Replacement Pattern (`✓ (fallback)`) annotated for ContestRecord file/withdraw | YES | Lines 5250 and 5252 |
| Filtered audit view annotated (`✓ (filtered)`) | YES | Line 5241 (View audit log) and 5262 (Billing Admin Audit View) |

**Finding R-1 (LOW carried-over).** The §5.11 preamble (line 5202) explicitly logs an unresolved conflict: §5.2 says Org Admin has "All org-scoped resources except billing"; §4.8.3 / §4.8.11 entity-level RBAC lists `org_admin` in some wallet / seat-snapshot reads. §5.11 hard-codes `org_admin` ✗ on Billing rows but the entity RBAC says ✓. This was logged as out-of-scope for the Billing Admin authoring phase and forwarded to a human reviewer in `_integration/RECONCILIATION.md`. It is not a Billing Admin authoring defect; it is a pre-existing drift surfaced by the Billing Admin work. Carry as Known Gap; resolve in a dedicated phase.

**Verdict §5.11: PASS** with R-1 carry-forward.

### 3.3 Appendix J (Controlled Vocabulary Registry)

| Test | Result | Evidence |
| :--- | :--- | :--- |
| Global Organization Roles enum contains `billing_admin` | YES | Line 15510: `org_owner, org_admin, billing_admin, member, guest` |
| Notes paragraph documenting the role's introduction | YES | Lines 15512–15515 — provenance (v7.0.0; §5.2, §5.2.1, §4.8, §34.12.6); orthogonality to `org_admin`; Replacement Pattern reference; ineligibility of `member` and `guest` for direct grant |
| New Billing-domain enum blocks present | YES | Billing Admin Audit Action Types (referenced at §5.2.1.4 + line 4998); `webhook_event_class` (§31.8.10); `upgrade_completed_trigger` (§31.8.10); `committed_spend_discount_band`; `contest_status`; `contest_resolution_reason`; `ai_operation_console`; etc. |
| Deploy-time validator binding | YES | §5.2.1.5 acceptance criterion #1 asserts: "The `billing_admin` role MUST be enumerated in Appendix J Global Organization Roles; a deploy-time validator asserts the enum contains `billing_admin`." |

**Verdict Appendix J: PASS.**

### 3.4 Appendix B (Glossary)

The Billing Admin term is added to Appendix B Glossary at line 5039 / 16563-area (cross-referenced from §5.2.1). Entry text: "Org-scoped role with billing-and-AI-accounting authority across both consoles. Orthogonal to `org_admin`. Required for filing ContestRecords, mutating wallet configuration, changing plan tier, and accepting Pro Trial Seat grants on the vendor side. See §5.2, §5.2.1, §4.8, §34.12.6, Appendix J Global Organization Roles." **PASS.**

### 3.5 Item 3 sign-off

**ITEM 3 RESULT: PASS.** Billing Admin is consistently authored across §5.2, §5.2.1 (full role definition), §5.11 (feature matrix), Appendix J (enum), Appendix B (glossary), §4.8.3 / §4.8.5 / §4.8.8 (entity RBAC), §34.12.6 (cross-side billing rules), §31.8.4 / §31.8.5 / §31.8.6 (webhook recipient set), and §32.8 (API endpoint RBAC). The sole carry-over is R-1, the §5.2-vs-§4.8 Org Admin drift, which is correctly logged as out-of-scope for this phase.

---

## 4. ITEM 4 — Every Billing Endpoint Has Rate-Limit Class, Auth Scope, and Example

### 4.1 §32.8 endpoint detail conformance

§32.8 enumerates and details 9 billing endpoints, with §32.8.0 establishing common conventions. Per-endpoint conformance against the three required artifacts (Auth Scope, Rate-Limit Class, Concrete Example) plus the §32.8.0 baseline (Method & Path, Pagination, Idempotency, Webhook coupling, Currency presentation):

| § | Endpoint | Auth Scope | Rate-Limit Class | Concrete Example | Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 32.8.1 | `GET /v1/pricing` | None (public) | `public_pricing_unauth` | curl example, line 11833 | ✅ |
| 32.8.2 | `GET /v1/orgs/{org_id}/wallet` | `read:billing` | Standard authenticated per-Org | curl example, line 11940 | ✅ |
| 32.8.3 | `POST /v1/orgs/{org_id}/wallet/cap` | `write:billing` | Standard authenticated per-Org | curl example, line 12009 | ✅ |
| 32.8.4 | `POST /v1/orgs/{org_id}/wallet/auto-topup` | `write:billing` | Standard authenticated per-Org | curl example, line 12097 | ✅ |
| 32.8.5 | `GET /v1/orgs/{org_id}/ai-operations` | `read:billing` | Standard authenticated per-Org | curl example, line 12237 | ✅ |
| 32.8.6 | `GET /v1/orgs/{org_id}/ai-operations/{op_id}` | `read:billing` | Standard authenticated per-Org | curl example, line 12300 | ✅ |
| 32.8.7 | `POST /v1/orgs/{org_id}/ai-operations/{op_id}/contest` | `admin:billing` | Standard + 5/min/Org contest write-ceiling | curl example, line 12391 | ✅ |
| 32.8.8 | `GET /v1/orgs/{org_id}/free-allowance` | `read:billing` | Standard authenticated per-Org | curl example, line 12487 | ✅ |
| 32.8.9 | `GET /v1/orgs/{org_id}/committed-spend` | `read:billing` | Standard authenticated per-Org | curl example, line 12570 | ✅ |

**Verdict on §32.8 detailed endpoints: PASS.** All nine endpoints carry Method & Path, Auth Scope, RBAC, Rate-Limit Class, Query Parameters / Request Body, Response Body, Error Codes, Pagination, Idempotency, and a runnable Concrete Example.

### 4.2 §32.8 coverage gap vs §5.2.1.1 Permission List

§5.2.1.1 enumerates 22 Billing-Admin-callable operations (lines 4929–4949). Of these, only 9 are authored in §32.8 detail. The remaining 13 are referenced in the §5.2.1.1 table with API paths but never authored at the §32.8 fidelity level:

| §5.2.1.1 op # | Endpoint referenced | Authored in §32.8? |
| :--- | :--- | :--- |
| 4 | `POST /v1/billing/wallet/topup` (manual top-up) | **NO** |
| 8 | `POST /v1/billing/ai-operations/export` (Billing Ledger CSV export) | **NO** |
| 11 | `POST /v1/billing/contests/{contest_id}/withdraw` | **NO** |
| 13 | `POST /v1/billing/committed-spend/{contract_id}/opt-out-renewal` | **NO** |
| 14 | `POST /v1/billing/plan-change` | **NO** |
| 15 | `POST /v1/billing/pro-trial-seats/{grant_id}/accept` | **NO** |
| 16 | `POST /v1/billing/pro-trial-seats/{grant_id}/decline` | **NO** |
| 17 | `GET /v1/billing/downgrade-buckets` | **NO** |
| 18 | `GET /v1/billing/seat-snapshots` | **NO** |
| 19 | `GET /v1/billing/pricing/pinned` (auth read) + pin/unpin mutation surface | **PARTIAL** (read scope/RLclass implicit via §32.8.0; pin/unpin mutation absent) |
| 20 | `GET /v1/billing/pricing/history` | **NO** |
| 21 | `GET /v1/audit-events?action_namespace=org.billing&org=me` (Billing Admin Audit View) | **NO** (general audit endpoint exists; the filtered view is not authored) |

Per §32.5 Billing block (lines 11622–11640), only the 9 authored endpoints are listed as canonical paths. Per the §32.8.10 acceptance criteria #21, four interim webhook events are flagged as "known-incomplete subset"; analogous endpoint coverage is not similarly flagged. The §32.5 and §5.2.1.1 path enumerations therefore disagree on the size of the public billing surface.

**Finding E-1 (HIGH).** The Billing Admin role has 22 enumerated operations in §5.2.1.1 with stable API paths. Customers relying on those paths today will get HTTP 404 because the routes are not authored, not registered in §32.5, and not detailed in §32.8. Either:
- (a) Author the 13 missing endpoints at §32.8 fidelity (Method & Path, Auth Scope, Rate-Limit Class, request/response schemas, Concrete Examples, error codes added to Appendix I), OR
- (b) Mark §5.2.1.1 operations 4 / 8 / 11 / 13–21 as "Convex-only (server-side mutation; no public REST surface)" with a forward-reference to a future phase that authors them.

Option (a) is the structurally correct answer; it is ~13 × ~80–120 lines per endpoint = ~1,000–1,500 lines of net-new authoring. Option (b) is a documentation-only retreat that admits the integration is incomplete.

**Finding E-2 (MEDIUM).** §32.8.0 documents implicit-Org alias paths (`/v1/billing/...`) that resolve identically to the explicit-Org form (`/v1/orgs/{org_id}/...`) per the path-convention reconciliation note. The 9 detailed endpoints all carry the explicit-Org canonical form. The 13 §5.2.1.1 paths use the implicit-Org form. Engineering reading §5.2.1.1 in isolation will implement against `/v1/billing/wallet/topup` and discover only after deploy that the routing layer aliases — but no test in §32.8.10 asserts the alias for the 13 missing endpoints (the alias acceptance #18 only covers the 9 detailed endpoints by reference).

### 4.3 §32.8.0 common-conventions coverage

| Convention | Documented in §32.8.0 | Inherited by all 9 detailed endpoints |
| :--- | :--- | :--- |
| Path parameter `{org_id}` semantics + cross-Org 404 codes | ✅ | ✅ |
| Authorization header format + scope inheritance (`admin → write → read`) | ✅ | ✅ |
| Token Scope Inheritance Rule for back-fill | ✅ | n/a (one-shot at deploy) |
| Rate-limit class default + public override | ✅ | ✅ |
| Pagination semantics (cursor, default 50, max 250, 24h cursor expiry) | ✅ | ✅ |
| Idempotency-Key semantics | ✅ | ✅ on all POST endpoints |
| Currency presentation (`..._cents` + `..._display`) | ✅ | ✅ |
| Timestamps (ISO 8601 UTC ms `Z`) | ✅ | ✅ |
| Error envelope including `request_id` and entity-id details | ✅ | ✅ |
| Webhook coupling (state changes emit §31 / Appendix C events with shared `event_id`) | ✅ | ✅ |

**Verdict §32.8.0 conventions: PASS.** The common-convention block is complete and faithfully inherited by every detailed endpoint.

### 4.4 §32.8.10 acceptance criteria conformance

§32.8.10 lists 21 acceptance criteria. Spot-checked 5 against the §32.8.1–§32.8.9 endpoint authoring:
- #1 (`pricing_api_no_auth_variance`): §32.8.1 Auth Scope = None ✅
- #2 (`pricing_api_quota_isolation`): §32.8.1 Rate-Limit Class = `public_pricing_unauth` (independent counter) ✅
- #18 (`billing_path_alias_equivalence`): asserted but coverage scope = the 9 detailed endpoints; the 13 missing endpoints at finding E-1 are NOT covered by the alias-equivalence test (since they are not authored at all)
- #21: explicitly flags the 4 "interim webhook events" (`billing.wallet.overage_cap_changed`, etc.) as known-incomplete; this is correct as of v7.0.0 because §31.8 supersedes the interim list.

**Finding E-3 (LOW).** §32.8.10 acceptance #21 is partially superseded by §31.8 authoring. The four "interim" webhook events ARE now formally catalogued at §31.8.4 (`billing.wallet.cap_warning_80`, `billing.wallet.cap_warning_100`, etc.) plus the §32.8 mutation endpoints emit the four mutation-coupled webhooks (`billing.wallet.overage_cap_changed`, `billing.wallet.auto_topup_config_changed`, `billing.contest.filed`, `billing.contest.decision_received`). Update #21 to reference §31.8 as the authoritative catalog.

### 4.5 Item 4 sign-off

**ITEM 4 RESULT: PARTIAL PASS.** The 9 detailed endpoints in §32.8 are textbook — every one carries Method & Path, Auth Scope, Rate-Limit Class, and a Concrete Example, with §32.8.0 inheriting common conventions cleanly. The defect is coverage: 13 of the 22 §5.2.1.1 Billing Admin operations have no §32.8 entry. Until E-1 is resolved, engineering implementing against §5.2.1.1 will hit HTTP 404 for ~60% of the role's API surface.

---

## 5. ITEM 5 — Every Billing Webhook Has Retry Curve and Notification Mapping

### 5.1 §31.8 catalog completeness

§31.8 (Billing-Domain Webhook Catalog, lines 10965–11400) catalogs 13 net-new billing-domain events organized into 5 functional groups:

| Group | Events |
| :--- | :--- |
| §31.8.3 AIOperation Settlement | `billing.ai_operation.settled`, `billing.ai_operation.contested`, `billing.ai_operation.reversed` |
| §31.8.4 Wallet Threshold + Auto-Topup | `billing.wallet.cap_warning_80`, `billing.wallet.cap_warning_100`, `billing.wallet.auto_topup_executed`, `billing.wallet.auto_topup_failed` |
| §31.8.5 Plan-Tier Lifecycle | `billing.plan.upgraded`, `billing.plan.downgraded`, `billing.plan.downgrade_scheduled` |
| §31.8.6 Committed Spend | `billing.committed_spend.contract_activated`, `billing.committed_spend.renewal_due_60` |
| §31.8.7 Free Allowance | `billing.free_allowance.exhausted` |

Plus the four mutation-coupled webhooks emitted by §32.8 endpoints (`billing.wallet.overage_cap_changed`, `billing.wallet.auto_topup_config_changed`, `billing.contest.filed`, `billing.contest.decision_received`) — these are emitted by the API layer not the §31.8 catalog but follow the same envelope.

### 5.2 Per-event conformance

§31.8.8 (Signing, Idempotency, Retry, DLQ) establishes baseline semantics that every §31.8 event inherits:

| Requirement | §31.8.8 statement | Inherited by all 13 |
| :--- | :--- | :--- |
| HMAC-SHA256 signing with per-Org webhook secret + version rotation | ✅ explicit | ✅ |
| Idempotency via `event_id` (`evt_{unix_ms}_{base32_random10}`) | ✅ explicit, with consumer dedup guidance | ✅ |
| Retry curve = standard 5-attempt 24h per Appendix F + tightened 5s first retry for financial-impact events per Appendix F §F.2 | ✅ explicit | ✅ (financial-impact events identified per §31.8.9 acceptance #14) |
| DLQ after 5 failed deliveries; Org Admin + Billing Admin notified within 1h; manual retry available; 30-day DLQ retention | ✅ explicit | ✅ |
| Payload size ≤ 256 KB per §31.5 | ✅ explicit; max-size analysis for `billing.plan.upgraded` (~32 KB worst case) | ✅ |
| Delivery ordering = `timestamp` is source-of-truth; consumers MUST tolerate out-of-order | ✅ explicit | ✅ |
| Cross-console pooling (one Org subscription receives both consoles' billing events) | ✅ explicit | ✅ |

**Per-event field conformance:**
- Common envelope (§31.8.2) includes `event_id`, `event_type`, `event_class=billing_domain`, `idempotency_key`, `timestamp`, `org_id`, `console`, `signature`, `webhook_secret_version`, `transaction_correlation_id` (where applicable).
- Each event includes a Trigger paragraph, a Payload table (Field | Type | Source | Notes), Subscriber Routing notes, and Failure-mode commentary.

**Finding W-1 (LOW).** §31.8.8 says all 13 events follow the standard 24h Appendix F curve EXCEPT financial-impact events (`billing.ai_operation.reversed`, `billing.wallet.auto_topup_executed`, `billing.wallet.auto_topup_failed`) which follow the Appendix F §F.2 tightened curve. §31.8.10 says §F.2 was authored; verify that Appendix F §F.2 actually exists in the spec body before ship. (Out of scope to verify here — flagged in `_integration/RECONCILIATION.md` Webhook Additions if §F.2 has not landed.)

### 5.3 Notification mapping (Appendix C cross-reference)

§31.8.9 acceptance #15 requires every billing-domain event to be registered in Appendix C with its user-facing notification mapping. §31.8.10 declares the Appendix C update:
- Eight of 13 events are user-facing AND emit in-app + email notifications via Loops.so (Appendix C Lifecycle Events extension).
- Five are webhook-only (high volume or system-domain) and are explicitly registered as "Webhook-only; no in-app/email notification."

Per §31.8.5 / §31.8.6 / §31.8.7 commentary, the user-facing-vs-webhook-only partition is plausibly:
- **User-facing (8):** `billing.wallet.cap_warning_80`, `billing.wallet.cap_warning_100`, `billing.wallet.auto_topup_failed`, `billing.plan.upgraded`, `billing.plan.downgraded`, `billing.plan.downgrade_scheduled`, `billing.committed_spend.renewal_due_60`, `billing.free_allowance.exhausted`.
- **Webhook-only (5):** `billing.ai_operation.settled`, `billing.ai_operation.contested`, `billing.ai_operation.reversed`, `billing.wallet.auto_topup_executed`, `billing.committed_spend.contract_activated`.

**Finding W-2 (MEDIUM).** §31.8.10 references the Appendix C update by line — but the actual Appendix C entries should be inspected to confirm the eight user-facing events have explicit Loops.so template ids, recipient-set definitions (e.g., `org_owner` ∪ `billing_admin`), throttling (e.g., the cap_warning events MUST suppress the second within 24h per §31.8.4 commentary), and locale-aware copy. If any of those are missing, the customer-facing notification path will silently drop the event.

### 5.4 PostHog mapping (Appendix G cross-reference)

§31.8.9 acceptance #16 requires every billing-domain event to emit a parallel PostHog event. The default mapping rule is `event_type` with `.` → `_`. §31.8.10 lists six explicit PostHog event-name overrides per the integration prompt:
- `billing_wallet_viewed`
- `billing_contest_submitted`
- `billing_contest_approved`
- `billing_contest_rejected`
- `billing_auto_topup_executed`
- `upgrade_cta_viewed`
- `upgrade_completed`

**Finding W-3 (LOW).** The default-mapping rule covers the 13 §31.8 events. The override list includes `upgrade_cta_viewed` and `upgrade_completed` which are NOT §31.8 webhook events — they are product-funnel events emitted from the entitlement-rejection / soft-gate UI path. They belong to Appendix G but their inclusion in §31.8.10 (a Webhook section) is misleading. Move those two to a separate "PostHog-only product-funnel events" subsection of §31.8.10 OR move them entirely to Appendix G.

### 5.5 §31.8.9 acceptance criteria conformance

§31.8.9 enumerates 18 acceptance criteria. Each maps to a QA test name. Sampling for substance:
- #2 (`webhook_aiop_settled_no_duplicate_on_late_signal`): tests the §4.8.1 Failure Mode #2 late-signal path does not double-fire the settled event ✅
- #5 (`webhook_wallet_cap_warning_at_most_once_per_period`): tests the AT-MOST-ONCE-per-period invariant ✅
- #8 (`webhook_plan_change_dual_console_correlation`): tests `transaction_correlation_id` correctness ✅
- #11 (`webhook_renewal_due_60_skips_opted_out`): tests the `auto_renewal_opt_out=true` short-circuit ✅
- #14: explicitly distinguishes the standard-vs-tightened retry curve for financial-impact events ✅
- #18: requires §4.8 entity revisions to add new events to §31.8 — design-time rather than runtime test, but a sound checklist item ✅

**Verdict §31.8.9: PASS.** Acceptance criteria are concrete, named, test-tied, and exhaustive.

### 5.6 Item 5 sign-off

**ITEM 5 RESULT: PASS** with W-1, W-2, W-3 as carry-forward LOW/MEDIUM polish items. The 13 net-new billing-domain webhooks plus the 4 mutation-coupled webhooks all carry retry curve (Appendix F + §F.2 override), notification mapping (Appendix C; webhook-only set explicitly declared), HMAC-SHA256 signing, idempotency via `event_id`, DLQ after 5 failures, ≤256 KB payload, and PostHog mirroring. The §31.8.8 common-semantics block enforces the inheritance.

---

## 6. ITEM 6 — Diff Check: Old §21.5 (Agent AI Budgets / Value-Dollars) Must Reference §34, Not Duplicate

### 6.1 What §21.5 contains today

§21.5 (lines 9874–9904) is titled "Agent AI Budgets (Value-Dollars)." Structure:
1. Preamble paragraph: declares value-dollar denomination, references the `value = cost × 10` / `cost = cost × 1.05` multiplier, and forward-references §34.11.3 for nightly cost-base re-derivation. **CORRECT — references §34, no duplication.**
2. Per-plan budget table (10 rows: Buyer Free → Enterprise; Seller Free → Seller Enterprise; columns: Console, Plan, Monthly Included Budget, Wallet Overage, Visibility). **DUPLICATE — restates the §34.1.1 Buyer Plan Tiers and §34.1.2 Seller Plan Tiers tables, with the same numerical values ($5 / $50 / $300 / $800; $5 / $30 / $200 / $600).**
3. Budget exhaustion behavior (3 bullets: wallet overage disabled, enabled-cap-not-hit, enabled-cap-hit). **DUPLICATE / PARTIAL — restates §34.10.4 Wallet State Machine transitions in narrative form.**
4. "Pooled across consoles" paragraph. **REFERENCE — explicit forward to §34.10.3.**
5. Visibility surface bullets (6 items: value-dollars used, % of budget consumed, breakdown by capability/model/accept-reject, wallet balance/overage, committed spend status, forecast trend). **DUPLICATE — overlaps with §4.8.3 Wallet visibility and §4.8.7 FreeAllowanceCounter visibility.**

### 6.2 Verdict on item 6

**ITEM 6 RESULT: PARTIAL PASS.** §21.5 has the right intent (value-dollar denomination, forward references) but materially duplicates §34.1, §34.10.3, §34.10.4, and §4.8.3 in three blocks: the per-plan table, the budget-exhaustion bullets, and the visibility bullet list. Per Authoring Convention #10 ("Dollar figures, durations, char limits…have one authoritative home"), the per-plan budget figures MUST live only in §34.1; §21.5 must cite the §34.1 tables, not restate them.

This finding is identical to D-6 in §1.2 — the cross-section drift sweep flagged §21.5 there. Resolution is the same: collapse the duplicated table, exhaustion bullets, and visibility bullets into forward references. Suggested replacement text:

> Per-plan AI included-budget figures are authoritative in §34.1.1 (Buyer Plan Tiers) and §34.1.2 (Seller Plan Tiers). Wallet overage configuration, exhaustion behavior, and the wallet state machine are authoritative in §34.10. Pooled-across-consoles math is authoritative in §34.10.3. Per-capability free-allowance behavior is authoritative in §34.8.4. Visibility surfaces are authoritative in §4.8.3 (AIWallet) and §4.8.7 (FreeAllowanceCounter). The unit (value-dollar) and the cost-base recalculation rule are described in this section's preamble; everything else is referenced.

### 6.3 Verification of §21.6 / §21.7 / §21.9 collateral

Per the broader scope of item 6 (the diff check is "Agent AI Budgets / Value-Dollars must reference §34 rather than duplicate it"), the §21 surface immediately adjacent to §21.5 must also pass the duplication check. Findings already raised under D-4 / D-5:
- §21.6 row "Token budget exceeded → `agent_budget_exceeded`" (line 9911) is BOTH a stale token reference (D-4) and a duplication of §34.10.4 wallet exhaustion (a `pending → blocked` style transition). Replace as in D-4.
- §21.6 sentence "Failed calls that are retried consume tokens only on the successful attempt" (line 9922) is BOTH a stale token reference and a billing claim that has no analog in §4.8.1. Replace as in D-4.
- §21.9 acceptance criterion "Monthly token consumption is accurately metered and displayed" (line 9962) is BOTH stale and duplicative of §4.8.3 / §4.8.7 visibility surfaces and §34.14.3 acceptance criteria. Replace as in D-5.

---

## 7. KNOWN GAPS

Compiled from §1–§6 above. Each is named with severity and owner-phase.

### 7.1 Blocking gaps (must resolve before v7.0.0 ship)

| ID | Severity | Defect | Source verification item | Remediation phase |
| :--- | :--- | :--- | :--- | :--- |
| D-1 | HIGH | TOC entries for §34.3, §34.4, §34.9 are stale; §34.10–§34.14 missing from TOC | Item 1 | Phase 2.5 (TOC regen) |
| D-2 | HIGH | §44.2 Agent Performance restates the v6.0.0 token budget verbatim (`Free 50K / Business 500K / Enterprise 5M`) | Item 1 | Phase 2.5 (10-line edit) |
| D-3 | HIGH | Stripe SKU `sourcera_agent_tokens` (line 15309) priced per-1000-tokens; conflicts with §34.3 outcome-based formula | Item 1 | Phase 2.5 (Stripe SKU swap with §4.8.3 / §4.8.8 alignment) |
| D-4 | HIGH | §21.6 + Appendix I `agent_budget_exceeded` error code labeled "monthly token budget exceeded"; §21.6 sentence about token-consumption-on-retry | Item 1 | Phase 2.5 (rename code, edit ~5 strings) |
| C-1 | HIGH | 12 buyer-side §21.4 capabilities have no row in §34.8.5 Entitlement Matrix; deploy-time validator (§34.8.7 #6) will fail | Item 2 | Phase 2.5 (add 11 missing customer-billed capability rows; reconcile TCO classification) |
| C-4 | HIGH | Public Pricing API §32.8.1 sample uses `buyer_pre_scoring` / `buyer_qa_classify` / `seller_first_pass_response` while §34.8.5 matrix uses unprefixed `pre_scoring` / `qa_suggestion` / `first_pass_rfp_draft`. §4.8.2 acceptance #1 makes capability_id immutable once any AIOperation has referenced it — locking the wrong canonical form is a one-way door | Item 2 | Phase 2.5 (lock canonical form before ship; update §32.8.1 sample; verify §4.8.9 generator reads canonical form) |
| E-1 | HIGH | 13 of 22 §5.2.1.1 Billing Admin operations have no §32.8 endpoint authoring; customers calling those routes get HTTP 404 | Item 4 | Phase 2.6 (author 13 endpoints OR mark Convex-only with explicit phase-deferral note) |

### 7.2 Non-blocking gaps (defer to a named later phase with owner)

| ID | Severity | Defect | Remediation phase |
| :--- | :--- | :--- | :--- |
| D-5 | MEDIUM | §21.9 acceptance criterion uses "Monthly token consumption" wording | Phase 2.5 |
| D-6 / Item 6 | MEDIUM | §21.5 duplicates §34.1 budget table, §34.10.4 exhaustion behavior, and §4.8.3 visibility surfaces | Phase 2.5 |
| C-2 | MEDIUM | TCO Analysis Narrative classification disagreement (§21.4 = AI; §34.8.5 = non-AI) | Phase 2.5 (resolve classification + sync both surfaces) |
| C-3 | MEDIUM | OrgIntelligence catalog-vs-matrix cardinality split (1 catalog row → 3 matrix rows) | Phase 2.5 (annotate §21.4) |
| C-5 | LOW | §3.0 forward-reference parentheticals (lines 3029, 3306) are stale — the IDs landed in §34.8.5 | Phase 2.5 (one-line edits) |
| E-2 | MEDIUM | §32.8.0 alias-equivalence acceptance (#18) covers only the 9 detailed endpoints; the 13 missing endpoints have no alias-equivalence test coverage | Phase 2.6 (lands automatically when E-1 is resolved) |
| E-3 | LOW | §32.8.10 acceptance #21 references "interim webhook events" superseded by §31.8 | Phase 2.5 |
| R-1 | LOW (carry-forward) | §5.2 ("Org Admin has all org-scoped resources except billing") conflicts with §4.8.3 / §4.8.11 entity RBAC (which lists `org_admin` in some wallet/seat-snapshot reads) | Dedicated reconciliation phase (human resolution required; do not touch in Phase 2.x) |
| W-1 | LOW | Verify Appendix F §F.2 (tightened first-retry curve for financial-impact events) actually exists in the spec body | Phase 2.5 (verify; author if missing) |
| W-2 | MEDIUM | Appendix C entries for the 8 user-facing billing webhooks should be inspected for Loops.so template ids, recipient-set definitions, throttling rules, and locale-aware copy | Phase 2.5 (inspect; author if missing) |
| W-3 | LOW | §31.8.10 PostHog override list includes `upgrade_cta_viewed` / `upgrade_completed` which are not §31.8 webhook events; misleading placement | Phase 2.5 (move to Appendix G or to a separate §31.8.10 subsection) |

---

## 8. ADDITIONAL ADVERSARIAL FINDINGS NOT TIED TO A SPECIFIC ITEM

The following surfaced during cross-document reading and are catalogued for completeness; each is a v7.0.0 ship-quality concern but does not invalidate the §34 / Billing Admin / Billing Endpoints / Billing Webhooks bundle.

**A-X-1 (MEDIUM) — `kb_suggestion` console ambiguity.** `kb_suggestion` is shared across both consoles in the §34.8.5 matrix (Buyer minimum `buyer_free`; Seller minimum `seller_free`). §21.4 has TWO capabilities mapping to this id: buyer-side "KB Suggestion" (implicit via #20 / cross-references) and seller-side "KB-to-Response Suggestion" (S3). Pricing in §21.4 differs ($0.30 vs $0.03). A single `capability_id` cannot have two rate-card prices unless `console_applicability` selects a different OutcomeContract per console — but §4.8.2 indexes `(capability_id, console_applicability)` as a single tuple, not as a per-console price discriminator. Either split into `kb_suggestion_buyer` / `kb_suggestion_seller` (preferred) or document the per-console pricing override path.

**A-X-2 (MEDIUM) — Wallet `payment_failed_grace` recipient set.** §34.10.4 wallet state-machine row says "billing admin emailed hourly" during the 48h `payment_failed_grace` window. Hourly emails to billing admins is potentially 48 emails per failure event. Verify the throttling matches §31.8.4 commentary on cap-warning suppression; otherwise this is a notification-flood vector.

**A-X-3 (MEDIUM) — `billing.committed_spend.renewed` / `billing.committed_spend.expired` / `billing.committed_spend.renewal_opted_out` events deferred.** §31.8.6 explicitly defers three CommittedSpend events to a later phase; meanwhile customers on Enterprise will have CommittedSpendContracts that renew, expire, or opt-out without webhook coverage. Engineering integrating their accounting systems will discover this at the first renewal cycle. Either author the deferred events in Phase 2.6 or raise the deferral as a customer-visible "Enterprise-customer accounting integration" caveat in BPS / SPS.

**A-X-4 (LOW) — Cross-currency presentation.** §32.8.0 `..._cents` + `..._display` convention assumes all monetary fields convert at write-time `fx_rate_locked`. For aggregated views (`GET /v1/orgs/{org_id}/ai-operations` with multiple operations spanning days of FX drift), the `..._display` sum will not equal the displayed sum-of-rows because each row uses its own locked rate. Document the aggregation behavior at §32.8.5 OR provide a `display_currency_conversion_disclaimer` field in list responses.

**A-X-5 (MEDIUM) — `billing_admin` role grant API surface absent.** §5.2.1.2 says assignment is via `POST /v1/organizations/me/members/{user_id}/roles` with body `{"role": "billing_admin"}`. This endpoint is not in §32.5 or §32.8 and is not authored at Master Spec fidelity. Same defect class as E-1; flagged separately because it is the only path to grant the role and is therefore functionally critical for v7.0.0 operability.

**A-X-6 (LOW) — `transaction_correlation_id` correlation window.** §31.8.5 says cross-console plan changes share a correlation id "within the same `transaction_correlation_id`." No window is specified — when does a grouped transaction expire and become two independent transactions for correlation purposes? Specify a window (e.g., 5 seconds) or adopt a per-transaction id with an explicit lifetime.

**A-X-7 (MEDIUM) — `agent_budget_exceeded` error code dual-life.** Appendix I has TWO entries for `agent_budget_exceeded` (lines 15381 under "Limit & Entitlement Errors" and 15406 under "Agent Errors"). Both are token-denominated. After the D-4 rename to `ai_wallet_exhausted`, ensure the duplicate-entry artifact is collapsed.

**A-X-8 (LOW) — §32.8.7 contest filing rate-ceiling discrimination.** Per-Org rate-ceiling at 5 contests/min/Org. A determined adversary could use a single Org's billing_admin grant to fill the ContestRecord queue. Verify that Ops Finance has a per-Org throttling counter on `contest.filed` ingestion rate, not just on the API surface.

---

## 9. SIGN-OFF CRITERIA

### 9.1 Sign-off recommendation

**THE §34 REWRITE + BILLING ADMIN + BILLING ENDPOINTS + BILLING WEBHOOKS BUNDLE DOES NOT MEET SIGN-OFF CRITERIA AS AUTHORED.**

The §34 boundary is internally clean, the §34.8.5 Entitlement Matrix is structurally correct, the §5.2.1 Billing Admin authoring is at full Master Spec fidelity, the 9 §32.8 endpoints are textbook, and the §31.8 webhook catalog is exhaustive in its 13-event scope. But seven HIGH-severity defects (D-1, D-2, D-3, D-4, C-1, C-4, E-1) and ~ten MEDIUM/LOW polish items (D-5, D-6, C-2, C-3, C-5, E-2, E-3, R-1, W-1, W-2, W-3, plus A-X-1 through A-X-8) require remediation before the bundle can ship as v7.0.0.

The HIGH-severity defects are mechanical (TOC regen, ~10-line §44.2 rewrite, Stripe SKU table rewrite, error-code rename, 11 matrix-row additions, capability_id canonical-form lock, 13 endpoint authorings — the last is the largest item). None require revisiting the underlying design decisions in §34, §4.8, §5.2.1, §32.8, or §31.8.

### 9.2 Recommended remediation packaging

**Phase 2.5 (TOC + cross-section sweep + matrix coverage).** ~600–900 lines of edits across §21.5 / §21.6 / §21.9, §32.8.10, §3.0, §31.8.10, §44.2, line 15309 Stripe SKU table, lines 15381 / 15406 Appendix I error codes, TOC, and §34.8.5 (11 row additions) + capability_id naming-canonicalization sweep. ~2–4 hours of Opus-grade authoring.

**Phase 2.6 (endpoint authoring).** Author the 13 missing §32.8 endpoints OR explicitly defer them with a named Convex-only-for-now status. Authoring 13 endpoints at §32.8 fidelity = ~1,000–1,500 lines net new. ~4–6 hours of Opus-grade authoring.

**Phase 2.7 (Appendix C / Appendix F / Appendix G inspection + author-if-missing).** Verify Appendix F §F.2 (tightened retry curve), inspect Appendix C billing-domain entries for Loops.so template completeness, polish Appendix G PostHog overrides per W-3. ~1–2 hours.

**Carry-forward to a dedicated reconciliation phase.** R-1 (Org Admin §5.2-vs-§4.8 RBAC drift) — requires human resolution.

### 9.3 STOP-condition assessment

**STOP condition triggered? No.** The findings are resolvable within Phases 2.5–2.7; they do not require reverting Phase 4 (§4.8 entity authoring), Phase 4b (§5.2.1 Billing Admin authoring), Phase 4c (§32.8 / §31.8 / §34 rewrite), or any of the §4.4 / §4.5 / §4.7 entity work. The §34 design is sound; the documentation just is not finished outside the §34 boundary, and 13 of 22 Billing Admin operations need their §32.8 entries.

Do NOT advance to Phase 5 entity authoring (or any post-Phase-4 substantive work) until the seven HIGH-severity defects are resolved. The MEDIUM/LOW items may defer to Phase 2.7 with named owner per §7.2 above, provided each is added to `RECONCILIATION.md → Known Gaps` with an explicit later-phase owner before sign-off.

---

**End of PHASE2_VERIFY.md.**
