# Sourcera Master Spec — Integration Prompt Program

**Version:** 1.2 (Opus-optimized)
**Author:** Sourcera Technical Product Strategy
**Required Model:** **Claude Opus 4.6 (1M context)** — every prompt in this program must be run with Opus. Do not run any prompt on Sonnet or Haiku. The program is calibrated for Opus's reasoning depth, cross-document synthesis, and long-context coherence. Using a lesser model will silently degrade fidelity — the verification gates will not catch all classes of drift.
**Purpose:** Sequenced, pastable prompt program to integrate `Sourcera_Master_Summary.md` and `KB_Engineering_Spec.md` into `Sourcera_Master_Spec.md` at Master Spec level of detail and information density.
**Outcome:** A single, consistent, build-ready Master Spec v7.0.0 with zero orphan concepts, zero enum drift, zero unresolved cross-references, and a defensible audit trail for every integration decision.

**v1.2 changeset:** Updated to reflect `Sourcera_Master_Summary.md` v1.1 (2026-04-17), which integrates `Sourcera_Seller_Pricing_Strategy.md` v2 in full. Affected areas: Global Conventions Preamble (Rule 13 date), Prompt 0.2 (coverage expanded to C.141, new §2/§3/§6 sections), Prompt 1.2 (Marketplace Discovery entities), Prompt 1.4 (Marketplace Discovery billing entities), Prompt 2.1 (expanded §2 inputs, new §34.15 Marketplace Discovery Pricing), Phase 4 (seller PLG path, Hero Moment, seller network effects), Phase 5 (new prompts for §6.13.7 KB Value Capture, §6.16.6 Marketplace Discovery Pricing, §6.28.2 Seller Onboarding), Operator Notes (Summary version reference).

---

## How to Use This Program

1. Run each prompt in a **separate, fresh Cowork session on Opus** against the Sourcera project folder. Fresh sessions prevent cross-prompt assumption leakage and force each session to re-derive conclusions from the authoritative source files.
2. **Run in numeric order within a phase.** Phases have ordering dependencies (data model before features, features before enum registry, enum registry before consistency sweep, consistency sweep before TOC regeneration).
3. **After each prompt, commit the modified `Sourcera_Master_Spec.md` to git** (or a versioned backup in `legacy-import:_versions/`) before running the next. This creates discrete, revertible integration steps.
4. **Run `Prompt V` (the Verification prompt at the end of each phase)** before moving to the next phase. Because you are running Opus, verification prompts are permitted to *challenge* the authoring phase rather than just checklist it — the verification prompt is a full adversarial review, not a tick-the-boxes pass.
5. **Do not skip Phase 0.** It creates the scaffolding and reconciliation log the later phases depend on.
6. **No model budgeting constraints.** Because every prompt runs on Opus and cost is not a limiting factor, prompts are sized for depth-of-reasoning, not token economy. If the model wants to ask for more context, read a full source document end-to-end, or produce a longer artifact than feels minimal, let it.

---

## Global Verification Protocol

Every `Prompt V` (phase-level verification) inherits the adversarial structure
defined in **Prompt V1** below: a Structural Checks section, an Adversarial
Checks section (hostile-reviewer persona), a Known Gaps section, and a Sign-Off
Criteria section. When running any later V prompt, append the V1 adversarial
pattern to the specific checks listed in that prompt. The explicit bullet list
in each V prompt is the *minimum* set — Opus should exceed it.

If any V prompt finds an unresolved defect, STOP. Do not advance to the next
phase. Remediate within the current phase.

---

## Global Conventions Preamble

> **The following block must be pasted at the top of every integration prompt below.** It enforces Master Spec authoring conventions and prevents drift. These conventions are derived from reading `Sourcera_Master_Spec.md` §4.1 (Model Design Principles) and observable patterns throughout.

```
CONTEXT
You are acting as the senior technical product strategist and staff engineer for the
Sourcera platform, running on Claude Opus. You are editing `Sourcera_Master_Spec.md`
— the authoritative build specification that engineering, design, QA, analytics,
security, finance, and ops all implement against. You have full reasoning budget;
depth, edge-case coverage, and consistency are the goals, not brevity.

MODEL EXPECTATIONS (OPUS)
- Read every cited source document in full before authoring. Do not skim. Do not
  guess at content based on headings.
- Actively challenge the source. If the Summary and the Spec disagree, resolve
  the conflict explicitly — do not paper over it.
- Surface edge cases the source documents missed: concurrency, partial failure,
  permission denial, downgrade paths, data-residency collisions, timezone/locale
  issues, empty/loading/error UI states, retry semantics, idempotency.
- Where a source is underspecified, author the missing detail at Master Spec
  fidelity — but mark the addition in RECONCILIATION.md under "Authored Extensions"
  so human reviewers can sign off.
- Produce longer, more thorough artifacts over shorter ones. A well-structured
  800-line section is preferred over a 200-line skeleton that defers details.

AUTHORING CONVENTIONS (NON-NEGOTIABLE)
1. Every new or rewritten entity MUST include a full data-model table with columns:
   Field | Type | Constraints | Notes. Follow §4 patterns exactly: include
   `id` (UUID), `org_id` (FK) where applicable, `console` enum where applicable,
   `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at` (nullable,
   soft delete). Respect scope-isolation rules (org-scoped, console-scoped,
   workspace-scoped, or marketplace-domain).
2. Every new feature MUST end with numbered Acceptance Criteria in the same style
   as §13.10, §14.9, §17.8, §20.7. Acceptance criteria must be testable —
   observable inputs, observable outputs, measurable thresholds.
3. Every new enum value MUST be added to Appendix J (Controlled Vocabulary Registry).
   Do NOT invent enum values inline; if an enum is needed, define it and update
   Appendix J in the same edit.
4. Every new entity, capability, or workflow MUST be added to Appendix-B Glossary
   entries if the term is used in more than one section.
5. Every new state-transition MUST be documented as a state machine in the style
   of Appendices A, D, E (From / To / Trigger / Conditions / Notes), NOT as prose.
6. Every new API endpoint MUST follow §32 patterns: authentication header, rate
   limit headers, pagination where applicable, request/response example, error
   codes from Appendix I (add new codes to Appendix I if needed).
7. Every new webhook event MUST follow §31 patterns: HMAC-SHA256 signing,
   idempotency via event_id, retry curve, DLQ after 5 failures, payload ≤256KB,
   and MUST be added to the Appendix-C Notification Event Catalog and the
   Appendix-G PostHog Event Taxonomy.
8. Every new plan-gated feature MUST be reflected in §5.11 Feature Access Matrix,
   §34.1 Plan Tier Definitions, and §39 Object Size Constraints.
9. Retention, residency, and DSAR implications MUST be stated for any new data
   class (§6.8, §40.2, §45).
10. Dollar figures, durations, char limits, and file sizes MUST come from the
    authoritative source tables — never invent a new one; if a new limit is
    genuinely required, add it to §39 or §44 as appropriate.
11. Do NOT delete existing Master Spec content unless the prompt explicitly says
    "replace." When extending, preserve the existing text and add beneath it.
12. Preserve the exact heading syntax used by the Master Spec:
    `## N.N Title {#n.n-title}` with anchor slugs matching Section N's conventions.
13. If a requirement in the Summary conflicts with the existing Spec, the Summary
    takes precedence IF it is the newer source (Summary v1.1 dated 2026-04-17
    post-dates Spec v6.0.0). Call out every overwrite in the reconciliation log.
14. Factually verify against `Sourcera_Master_Summary.md`, `KB_Engineering_Spec.md`,
    `Sourcera_Buyer_Pricing_Strategy.md`, `Sourcera_Seller_Pricing_Strategy.md`, before authoring.
    Do NOT hallucinate content not present in source documents.
15. Before saving, run a pass to remove duplicate content that already exists in
    the Spec (exact or semantic duplicates). When merging, the Spec's original
    field names win unless explicitly renamed by the Summary.
16. SELF-CHALLENGE PASS (Opus-mandatory). After completing the authoring for a
    prompt, re-read your own output as a hostile staff engineer. For every
    decision, ask: "Would this pass a production code review? Would QA accept
    these acceptance criteria? Could a junior engineer build against this
    unambiguously?" Revise in place before saving. Log self-challenge findings
    and resolutions in RECONCILIATION.md under "Self-Challenge Log."
17. COUNTERFACTUAL PASS. For every new feature, enumerate at least three
    realistic failure modes (partial failure, adversarial input, dependency
    outage) and confirm the authored section addresses each. If a failure mode
    is not addressed, author the handling before saving.

OUTPUT PROTOCOL
- Write directly to `/Sourcera/Sourcera_Master_Spec.md`.
- Update the reconciliation log at `/Sourcera/_integration/RECONCILIATION.md`
  with: change summary, added/modified sections, new enums, new endpoints, new
  entities, conflicts resolved.
- Do NOT produce summary or "what I did" commentary at the end. The
  reconciliation log is the summary.
```

---

# Phase 0 — Audit & Scaffold

Goal: Create the working scaffold (version bump, reconciliation log, delta inventory) so every later phase has deterministic inputs.

### Prompt 0.1 — Version Bump & Backup

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
1. Copy the current `Sourcera_Master_Spec.md` to `/Sourcera/_baselines/Sourcera_Master_Spec_v6.0.0.md` (baseline snapshot).
2. At the top of `Sourcera_Master_Spec.md`, bump the version header to:
   Version: 7.0.0-integration-in-progress
   Last Updated: <today's ISO date>
   Prior Version: 6.0.0
   Status: Under integration — see /_integration/RECONCILIATION.md
3. Create `/Sourcera/_integration/` folder and seed `RECONCILIATION.md` with
   headings: Summary, Phase Log (Phase 0 through Phase 13), Enum Additions,
   Entity Additions, Endpoint Additions, Webhook Additions, Breaking Changes,
   Known Gaps. Leave each section empty for later phases to append to.
4. Create `/Sourcera/_integration/DELTA_INVENTORY.md` and leave empty; Prompt 0.2
   will populate it.

DO NOT modify any spec content yet. This prompt is pure scaffolding.
```

### Prompt 0.2 — Delta Inventory

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Produce `/Sourcera/_integration/DELTA_INVENTORY.md` — an exhaustive list of every
concept in `Sourcera_Master_Summary.md` and `KB_Engineering_Spec.md` that is
either (a) absent from `Sourcera_Master_Spec.md`, (b) present but less detailed,
or (c) present but inconsistent.

FORMAT (table, one row per delta):
ID | Source Doc | Source Anchor | Spec Target (§ or "NEW") | Status
(MISSING / EXTENDS / CONFLICTS) | Detail Gap (1 line) | Target Phase
(1-13 below) | Estimated Integration Size (S/M/L/XL)

COVERAGE REQUIREMENTS
- Walk every §1-§6.38 and Appendix A-C of `Sourcera_Master_Summary.md` (v1.1).
- Walk every §0-§18 of `KB_Engineering_Spec.md`.
- Include M1-M17 growth mechanics as individual rows.
- Include all 141 Appendix-C items from the Summary as individual rows (C.1–C.141;
  C.128–C.141 are new in Summary v1.1 — seller pricing integration).
- Include every new AI capability named in Summary §6.12.2 as individual rows.
- Include every Spec section that the Summary appears to SUPERSEDE (esp. §34
  Plan Tiers, which is superseded by the Summary's outcome-based consumption
  model).
- Pay special attention to Summary v1.1 additions that expand seller-side scope:
  §2.1 Core Principle, §2.4 Seller Plan Architecture (enriched), §2.8 Seller
  Rate Card, §2.9 Seller Outcome Signals, §2.10 Marketplace Discovery Pricing
  (Non-AI Layer), §2.11 Pricing Engineering Requirements (expanded), §2.12
  Seller Financial Targets, §3.1b Seller Paid Path, §3.4 Seller-Side Network
  Effects, §3.6 Seller Hero Moment Mechanics, §6.13.7 KB Value Capture &
  Stake-Building, §6.16.6 Marketplace Discovery Pricing, §6.28.2 Seller
  Onboarding Experience, and Appendix C items C.128–C.141 (Seller Core
  Principle, Rate Card Extended, Outcome Signals, Marketplace Discovery Pricing,
  Seller Hero Moment, Three Conversion Moments, Seller Paid-Path Progression,
  Seller Activation Metric, Forced-Vendor-Signup Playbook, Win/Loss Debrief,
  Seller-Side Network Effects Inventory, Seller Plan Upgrade Carry-Over
  Guarantee, Seller Onboarding Seven-Stage Flow, Onboarding Anti-Patterns).

VERIFICATION
At the bottom, produce a table: Phase | Rows Assigned | Estimated L/XL Count.
This drives later phase scope.

DO NOT edit `Sourcera_Master_Spec.md` in this prompt.
```

---

# Phase 1 — Data Model Extensions

Goal: Land every new entity the Summary and KB Spec reference, before any feature section depends on them. Data model changes are the blast-radius foundation.

### Prompt 1.1 — New Buyer Entities

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Extend `Sourcera_Master_Spec.md` §4.3 (Buyer Console Entities) to add the
following entities at Master Spec level of detail. Each requires a full field
table following §4.3.1 conventions, plus scope-isolation classification,
relationships to existing entities, and a paragraph of authoring-intent.

ENTITIES TO ADD
- Internal Comment (thread, post, mention) — per Summary C.119; derive fields
  from Q&A Thread schema (§18.3.1) as precedent. Must be buyer-side only.
- Presence Record — per Summary C.120; session-scoped, ephemeral, tied to
  Convex Presence.
- Unread Marker — per Summary C.120; per-user-per-thread counter across
  Comments, Q&A, and Inbox.
- Buyer Referral — per Summary M16 / C.74.
- Buyer-Funded Pro Trial Seat Grant — per Summary M17 / §2, and
  `Sourcera_Seller_Pricing_Strategy.md §15.5`.
- Usage Event — per Summary C.88 / C.89 (PostHog-backed, standardized property
  schema).
- Time-Saved Credit — per Summary C.91.

REQUIREMENTS
- Every new enum value used (e.g., referral_status, trial_seat_status) must be
  added to Appendix J in the same edit.
- Each entity gets a Constraints column, an Indexes column (call out required
  indexes for Convex query patterns), and explicit retention rules that tie
  back to §40.2 and §45.
- Add Glossary entries in Appendix B.

VERIFICATION
Append to `RECONCILIATION.md` Phase Log: list of added entities with line
numbers where each was inserted.
```

### Prompt 1.2 — New Seller Entities

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Extend §4.4 (Seller Console Entities) to add:
- SellerSoftware (Product) — per Summary §6.15.5. One Seller Org → many Products;
  fields: slug, category_id (FK Taxonomy), description (markdown), capability
  declaration refs, kb_namespace, claim_status, page_status, seo_status.
- SellerOrgPage — the public-facing seller page entity backing
  `sourcera.com/sellers/:slug`. Fields include SEO fields, Schema.org payload
  cache, last_enrichment_at, enrichment_capability_ref.
- SoftwarePage — product-level page equivalent.
- CategoryPage — Marketplace category landing (M9). Fields include
  category_id (FK), content_version, last_refreshed_at, refresh_cadence,
  k_anon_floor.
- GuidePage — "How to Evaluate [X]" page (M10).
- ComparisonPage — side-by-side product comparison (M11).
- MarketIntelligenceReport — quarterly aggregate report (M12).
- HeatMapCell — aggregated demand cell for Public Marketplace Heat Map (M13).
- GhostBidImport — historical RFP ingestion record (M15).
- SellerSignal — anonymized buyer intent record (§6.17).
- PromotedListing — keyword-targeted category-scoped placement per Summary
  §6.16.6 / §2.10 / C.131. Fields: id, seller_org_id, category_id,
  keyword_targets[], daily_cap, per_eoi_cap, clearing_price_cents,
  impression_count, eoi_acceptance_count, frequency_cap_config, status
  (active/paused/exhausted/expired), created_at, ended_at.
- FeaturedPlacement — paid monthly/quarterly placement on Category Pages,
  Comparison Pages, Heat Map per Summary §6.16.6 / C.131. Fields: id,
  seller_org_id, placement_surface (category_page/comparison_page/heat_map),
  target_entity_id, commitment_period, status, created_at, expires_at.
- VerificationReviewRecord — Ops-reviewed verification tier upgrade per Summary
  §6.16.6. Fields: id, seller_org_id, requested_tier, documentation_refs[],
  reviewer_ops_user_id, outcome (approved/rejected/pending), reviewed_at,
  next_review_due_at.
- SellerOnboardingSession — seven-stage onboarding flow tracking per Summary
  §6.28.2. Fields: id, seller_org_id, user_id, invite_source (buyer_invite/
  ghost_bid/direct), stage_reached (1-7), hero_moment_completed_at,
  first_requirement_response_at, first_bid_submitted_at, elapsed_seconds,
  created_at.

REQUIREMENTS
- All content-page entities must carry a `vendor_opt_out_honored_at` timestamp
  and a source-of-truth field linking back to the Opt-Out Registry (Summary
  C.123).
- k-anonymity floors MUST be configured per entity (k=5 signal, k=10 aggregate,
  k=20 market intelligence).
- PromotedListing impressions must be k-anonymized at k=5 before attribution
  to seller analytics (no buyer-level identification) per Summary §6.16.6.
- PromotedListing uses second-price auction clearing; document the auction
  mechanics.
- FeaturedPlacement labeled with persistent "Featured" visual treatment;
  FTC native-advertising compliance required per Summary §6.16.6.
- SellerOnboardingSession must track every stage defined in Summary §6.28.2;
  the activation metric (minutes from magic-link to first requirement response,
  target p50 < 20 min) must be derivable from this entity.
- Retention, DSAR, and GDPR anonymization behavior must be specified for each.

VERIFICATION
Update `RECONCILIATION.md`. Add Glossary. Add enums to Appendix J.
```

### Prompt 1.3 — New Marketplace & Cross-Console Entities

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Extend §4.5 (Marketplace Entities) and add a new §4.7 (Cross-Console Bridge
Entities):
- Taxonomy Node (Category, Capability Category) — Ops-managed, versioned,
  deprecation-aware per Summary C.60 / C.95.
- Controlled-Vocabulary Tag — references Taxonomy Node; enforces sellers-
  cannot-create-freeform-tags rule.
- Vendor Opt-Out Record — global registry per Summary C.123. Domain-verified,
  cascades across M2, M11, and all public-facing mechanics. Retroactive
  honoring is required.
- Marketplace Abuse Report — per §45.3.
- EOI Acceptance Record — formalize the one-click acceptance flow from §27.5.
- Console Bridge Event — the materialized sync record between a Buyer Workspace
  Requirement and a linked Seller Bid Workspace Response Item per Summary
  C.116. Must carry version, sync_status (pending/synced/failed), last_retry_at,
  retry_count, failure_reason, and bounded-lag SLO metadata.
- Vendor Disqualification Record — per Summary C.118.

REQUIREMENTS
- Console Bridge Events must never leak data across the firewall — explicitly
  document the field-level redaction rules (what IS carried, what is NEVER
  carried).
- Retry curves: exponential backoff, DLQ after 5 failures, 30-second bounded-lag
  SLO.
- Add every new enum to Appendix J.

VERIFICATION
Update reconciliation log.
```

### Prompt 1.4 — New Pricing/Billing Entities (Foundation for Phase 2)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Add §4.8 Billing & AI Accounting Entities. These are the foundation for the
outcome-based consumption model that will replace §34 in Phase 2.

ENTITIES TO ADD (schemas derived from `Sourcera_Buyer_Pricing_Strategy.md`,
`Sourcera_Seller_Pricing_Strategy.md`, and Summary §2 (including §2.8 Seller
Rate Card, §2.9 Seller Outcome Signals, §2.10 Marketplace Discovery Pricing),
C.75–C.87, C.128–C.131, C.139):
- AIOperation — immutable record per Summary C.75. Fields: id, org_id,
  capability_id, parent_operation_id, actor_id, console, workspace_id (nullable),
  model_tier, cost_base (cents), value_price (cents), cost_price (cents),
  settlement_state (enum: pending/accepted/rejected/auto_accepted/contested/
  reversed), settlement_at, provenance_hash, fx_rate_locked, billing_currency,
  created_at. Immutable after settlement.
- CapabilityRegistryEntry — Ops-managed authoritative list per Summary C.76.
  Replaces the hardcoded-21-capabilities list.
- AIWallet — org-scoped, pooled across buyer + seller consoles. Counters:
  budget_value_dollars, consumed_value_dollars, overage_cap_value_dollars,
  auto_topup_enabled, auto_topup_increment, auto_topup_max_monthly,
  last_topup_at, residency_locked_entity.
- OutcomeContract — per-capability acceptance/rejection signal schema per
  Summary §2 and C.76. Fields: capability_id, accepted_signal_rule,
  rejected_signal_rule, auto_accept_after_seconds, contest_window_days.
- ContestRecord — per Summary C.78. 14-day window; credits balance on approval.
- CostBaseRecalculationLog — nightly job run record per Summary C.77. Includes
  drift_percent, approved_by (nullable if drift <10%), override_reason.
- FreeAllowanceCounter — per-org-per-capability counter for the 10-free-op
  allowance per Summary C.80.
- CommittedSpendContract — Enterprise annual commit with discount bands per
  Summary C.81.
- PricingTableVersion — supports Public Pricing API per Summary C.83.
- DowngradeExcessDataBucket — 90-day read-only preservation per Summary C.85.
- BillingSeatSnapshot — per Summary C.86.
- MarketplaceDiscoveryRevenueRecord — accounting-isolated line item for
  non-AI seller monetization per Summary §2.10 / §6.16.6 / C.131. Fields:
  id, seller_org_id, sku (promoted_listing / verification_upgrade /
  featured_placement), amount_cents, billing_period_start, billing_period_end,
  cost_center (always `rev_marketplace_discovery`), invoice_ref, created_at.
  Separate from AIWallet ledger — does not draw from AI budget.
- SellerOutcomeSignalConfig — per-capability accepted/rejected signal
  definitions per Summary §2.9 / C.130. Fields: capability_id, accepted_signal
  (rule expression), rejected_signal, window_seconds, timeout_default
  (always `rejected`). Extends OutcomeContract with seller-specific signals.

REQUIREMENTS
- Every monetary field MUST use integer cents; document FX-locking semantics
  per C.84.
- Residency-locked invoicing requires the legal-entity field (Sourcera US
  LLC vs. Sourcera EU GmbH) — specify enum.
- AIOperation is append-only; document the state machine (pending → accepted |
  rejected | auto_accepted → contested → reversed) as Appendix K (new).
- MarketplaceDiscoveryRevenueRecord must live in its own cost center
  (`rev_marketplace_discovery`), accounting-isolated from `rev_ai_wallet`
  and `rev_subscription` per Summary §6.16.6. Finance dashboards must
  report gross margin for each line independently.
- Seller-side outcome signals (Summary §2.9) must be fully represented:
  12 capabilities with accepted signal, window, and timeout-default-rejected
  semantics.

VERIFICATION
Update Appendix J, Appendix B, and RECONCILIATION.md. Flag that §34 will be
rewritten in Phase 2 to reference these entities.
```

### Prompt V1 — Phase 1 Verification (Adversarial)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Adversarial verification of Phase 1. You are acting as a hostile reviewer whose
job is to find reasons v7.0.0 should not ship. Produce
`/Sourcera/_integration/PHASE1_VERIFY.md` with the following sections:

1. STRUCTURAL CHECKS
   - Entity-count delta: count of entity subsections in §4 before vs. after.
   - For every entity added, confirm it has: full field table, Constraints,
     Indexes, Retention, Glossary entry, Appendix-J enum registration (if any
     enums), at least one relationship back to an existing §4 entity.
   - No §4 field deleted (use git diff).
   - No enum value removed from Appendix J.

2. ADVERSARIAL CHECKS (Opus-expected depth)
   - For each new entity, identify one realistic query pattern that would be
     slow or impossible given the specified indexes. Flag or confirm.
   - For each new entity with retention, identify whether DSAR right-of-erasure
     can be satisfied without breaking referential integrity. Flag any cascade
     concerns.
   - For each new FK, identify whether the target entity's soft-delete semantics
     are compatible. Flag any cases where a soft-deleted parent would orphan
     the child.
   - For each new entity with a console scope, confirm that no field could
     inadvertently leak data across the firewall (§1.3).
   - For each new enum, confirm every value has at least one consumer in the
     Spec. Orphan enum values must be either removed or given a consumer.

3. KNOWN GAPS
   - List any Summary-cited entity that was NOT added and justify.
   - Add to RECONCILIATION.md under Known Gaps.

4. SIGN-OFF CRITERIA
   - Zero structural defects.
   - Every adversarial finding either resolved by Phase 1 re-work or explicitly
     deferred to a named later phase with rationale.

If any finding cannot be resolved without re-running an earlier prompt, STOP.
Do not advance to Phase 2. Produce a remediation plan and halt.
```

---

# Phase 2 — Pricing, Billing, and AI Operation Accounting

Goal: Replace the Master Spec's token-budget pricing (§34 and touched sections) with the outcome-based consumption model from `Sourcera_Buyer_Pricing_Strategy.md`, `Sourcera_Seller_Pricing_Strategy.md`, and Summary §2.

### Prompt 2.1 — Rewrite §34 Plan Tiers, Billing & Entitlements

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
REPLACE §34 end-to-end with the outcome-based consumption model. Preserve
§34.X section anchors; rewrite content.

INPUTS (read in full before writing):
- `Sourcera_Buyer_Pricing_Strategy.md` (all 358 lines)
- `Sourcera_Seller_Pricing_Strategy.md` (all 685 lines)
- `Sourcera_Master_Summary.md` v1.1 §2 (all of §2.1–§2.12, including the
  enriched Seller Plan Architecture §2.4, Seller Rate Card §2.8, Seller
  Outcome Signals §2.9, Marketplace Discovery Pricing §2.10, Pricing
  Engineering Requirements §2.11, Financial Targets §2.12) and Appendix
  C.75–C.87 plus C.128–C.131 and C.139
- Current `Sourcera_Master_Spec.md` §34 (to preserve section anchors)

REQUIRED SECTIONS IN THE REWRITE
34.1 Plan Tier Definitions (Authoritative) — Buyer + Seller tables from
     Summary §2. Preserve seat-unlimited semantics. Every cell must have a
     citation back to the pricing strategy document.
34.2 Pricing — monthly-annual and monthly-monthly rows, one line per plan.
34.3 Outcome-Based AI Operation Pricing — value_price = cost_base × 10;
     cost_price = cost_base × 1.05; nightly recalculation job; margin floor
     enforcement at price-update time.
34.4 No Per-Unit Metering on Structural Resources — explicit list: storage,
     requirements, workspaces, KB entries, vendors, seats.
34.5 Plan Upgrade / Downgrade — reference DowngradeExcessDataBucket (§4.8).
34.6 Downgrade Excess Data Handling — 90-day read-only preservation.
34.7 Billing Seat Count — enforcement rules, guest exclusion, API-only
     identity exclusion.
34.8 Entitlement Enforcement — soft vs. hard modes per capability. Produce a
     comprehensive Entitlement Matrix table mapping every capability_id to
     its enforcement mode (table format: capability_id | enforcement_mode |
     free_allowance_ops | gated_at_plan_minimum | upgrade_surface).
34.9 Onboarding and Trial Carry-Over.
34.10 AI Wallet Service — counters, configuration, pooled-budget-across-consoles
      rules, Stripe metering integration, downgrade behavior.
34.11 Outcome Resolver — capability outcome contracts, contest window,
      cost-base recalculation.
34.12 Cross-Side Billing Rules — single Enterprise contract collapse with
      $3K/mo floor.
34.13 Buyer-Funded Pro Trial Seat (M17) — full flow from Summary §3.3 M17.
34.14 Seller Rate Card (Authoritative) — full rate card table from Summary
      §2.8. 12 seller-side capabilities with model tier, accepted (value)
      price, rejected (cost) price, and unit definition. Cite
      `Sourcera_Seller_Pricing_Strategy.md §9` as the authoritative source;
      Summary §2.8 is the condensed reference.
34.15 Seller Outcome Signals (Authoritative) — full signal table from Summary
      §2.9. Per-capability accepted signal, window, and timeout-default-rejected
      semantics. Cite `Sourcera_Seller_Pricing_Strategy.md` as authoritative.
34.16 Marketplace Discovery Pricing (Non-AI Layer) — per Summary §2.10 /
      §6.16.6 / C.131. Three SKUs: Promoted Listings (second-price auction,
      daily/per-EOI caps, k=5 anonymization, frequency caps), Verification
      Tiers (Basic free / Verified / Certified with Ops review), Featured
      Placements (monthly/quarterly commitment, FTC disclosure). Accounting
      isolation: `rev_marketplace_discovery` cost center, separate from
      `rev_ai_wallet` and `rev_subscription`. Anti-spam linkage: KB health
      floor + ≥1 closed bid in prior 90 days for Promoted Listing eligibility.
      Buyer Experience Guardrails: paid placements never suppress organic match
      signal; Verified/Certified badges label-only; Featured lanes visually
      distinct.
34.17 Pricing Engineering Requirements — consolidated list from Summary §2.11
      (14 items). Each requirement cross-links to the Spec section that
      implements it.
34.18 Financial Targets — blended gross margin ≥90%; year-1 exit mixes for
      buyer and seller sides per Summary §2.12. Enterprise <10% of accounts
      constraint.
34.19 Seller Plan Upgrade Carry-Over Guarantee — per Summary §6.13.7 / C.139.
      KB entries, confidence scores, staleness states, citation graphs, win-rate
      weights, and provenance records carry forward on upgrade. Downgrade
      preserves KB in read-only 12-month window.
34.20 Acceptance Criteria.

CRITICAL REQUIREMENTS
- The rewrite MUST cite `AIOperation`, `AIWallet`, `OutcomeContract`,
  `CapabilityRegistryEntry`, `ContestRecord`, `MarketplaceDiscoveryRevenueRecord`,
  `PromotedListing`, `FeaturedPlacement`, `VerificationReviewRecord`,
  `SellerOutcomeSignalConfig` — entities added in Phase 1.
- Reference §40.2 for retention and §6.8 for DSAR implications of billing data.
- §34.16 Marketplace Discovery Pricing must explicitly separate three revenue
  streams: `rev_ai_wallet`, `rev_subscription`, `rev_marketplace_discovery`
  with independent gross-margin reporting.
- §34.15 Seller Outcome Signals must cover all 12 seller capabilities from
  Summary §2.9 with concrete accepted-signal definitions and windows.
- §34.19 Carry-Over Guarantee must reference the KB Value Meter mechanics
  from Summary §6.13.7.
- Flag every conflict with the old §34 in RECONCILIATION.md → Breaking Changes.

OUTPUT
Updated §34 in `Sourcera_Master_Spec.md`. Updated RECONCILIATION.md.
```

### Prompt 2.2 — Billing Admin Role & RBAC Extension

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Extend §5 RBAC:
- Add Billing Admin to §5.2 Org-Level Roles with full permission list.
- Update §5.11 Feature Access Matrix to show Billing Admin × every
  billing-surfaced feature (AIWallet, ContestRecord, CommittedSpendContract,
  Pricing API, AIOperation ledger, auto-topup).
- Add Billing Admin to Appendix J Global Organization Roles.
- Update Audit Event Action Types (Appendix J) to include all
  billing_admin_action audits.

REFERENCES
Summary §6.22.1, C.75–C.87.

VERIFICATION
Confirm no other §5 role was modified. Confirm every permission listed matches
a concrete API operation. Update RECONCILIATION.md.
```

### Prompt 2.3 — Billing API Surface

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Extend §32 The Sourcera API with billing endpoints at Master Spec detail level
(follow §32.5 Workspaces / Requirements conventions).

ENDPOINTS (follow Summary C.83 and pricing strategy docs):
- GET  /v1/pricing — public pricing API; no auth required; rate-limited
  separately from authenticated endpoints; returns PricingTableVersion.
- GET  /v1/orgs/:orgId/wallet
- POST /v1/orgs/:orgId/wallet/cap — set overage cap
- POST /v1/orgs/:orgId/wallet/auto-topup
- GET  /v1/orgs/:orgId/ai-operations — billing ledger (paginated, cursor-based)
- GET  /v1/orgs/:orgId/ai-operations/:opId
- POST /v1/orgs/:orgId/ai-operations/:opId/contest — 14-day window enforcement
- GET  /v1/orgs/:orgId/free-allowance
- GET  /v1/orgs/:orgId/committed-spend (Enterprise only)

REQUIREMENTS
- Each endpoint: method, path, auth scope, rate limit class, request body schema,
  response body schema, error codes (update Appendix I), pagination behavior,
  idempotency semantics.
- Add three new token scopes to Appendix J API Token Scopes: `read:billing`,
  `write:billing`, `admin:billing`.
- Add endpoint row to §32.5 subsection appropriate (new subsection "Billing").

VERIFICATION
Every new endpoint has a concrete example. Update RECONCILIATION.md.
```

### Prompt 2.4 — Billing Webhooks & PostHog Events

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Add billing-domain webhook events to §31 and Appendix F (retry curve), plus
PostHog events to Appendix G.

WEBHOOK EVENTS
- ai_operation.settled
- ai_operation.contested
- ai_operation.reversed
- wallet.cap_warning_80 / wallet.cap_warning_100
- wallet.auto_topup_executed / wallet.auto_topup_failed
- plan.upgraded / plan.downgraded / plan.downgrade_scheduled
- committed_spend.contract_activated / committed_spend.renewal_due_60
- free_allowance.exhausted

POSTHOG EVENTS (Appendix G Advanced Feature Events)
- billing_wallet_viewed
- billing_contest_submitted
- billing_contest_approved / rejected
- billing_auto_topup_executed
- upgrade_cta_viewed (property: capability_id, plan_from, plan_to)
- upgrade_completed (property: trigger — evaluation_limit, vendor_limit,
  ai_budget_exhaustion, opus_gated_capability)

REQUIREMENTS
- HMAC-SHA256 signing, idempotency via event_id, retry curve, DLQ after 5
  failures. Payload schema for each.
- Add notifications to Appendix C Notification Event Catalog where user-facing.

VERIFICATION
Update RECONCILIATION.md. Confirm no existing webhook was removed.
```

### Prompt V2 — Phase 2 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Produce `/Sourcera/_integration/PHASE2_VERIFY.md`:
1. Confirm §34 rewrite: token-budget model fully replaced; AIOperation
   referenced throughout; no dangling references to the old "Business
   500K/month" token budget.
2. Confirm Entitlement Matrix (§34.8) covers every capability_id listed in
   the Capability Registry.
3. Confirm Billing Admin present in §5.2, §5.11, Appendix J.
4. Confirm every billing endpoint has rate-limit class, auth scope, and
   example.
5. Confirm every billing webhook has retry curve and notification mapping.
6. Diff check: old §21.5 (Agent AI Budgets / Value-Dollars) must now reference
   §34 rather than duplicate it.
7. Confirm §34.14 Seller Rate Card contains all 12 seller-side capabilities
   from Summary §2.8 with value/cost pricing per capability.
8. Confirm §34.15 Seller Outcome Signals contains all 12 seller-side
   capabilities from Summary §2.9 with accepted signal definitions and
   windows.
9. Confirm §34.16 Marketplace Discovery Pricing covers three SKUs (Promoted
   Listings, Verification Tiers, Featured Placements) with accounting
   isolation to `rev_marketplace_discovery` cost center.
10. Confirm §34.17 lists all 14 Pricing Engineering Requirements from Summary
    §2.11, each cross-linked to an implementing Spec section.
11. Confirm §34.19 Carry-Over Guarantee specifies lossless data migration on
    upgrade AND 12-month read-only preservation on downgrade.

DO NOT modify the Spec in this prompt.
```

---

# Phase 3 — Agent Capability Expansion & KB Engineering Integration

Goal: Extend §21 (Agent) from the hardcoded 21-capability list to the dynamic Capability Registry, AND integrate `KB_Engineering_Spec.md` in full into §22 (Seller KB).

### Prompt 3.1 — Capability Registry & Expansion Capabilities

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
REWRITE §21.4 (Agent Capability Catalog) to operate off the Capability Registry
entity rather than a fixed table. Preserve the existing 21-capability content
as the initial registry seed.

INPUTS
- Summary §6.12.1, §6.12.2 (21 cataloged + expansion capabilities)
- Summary Appendix C.76

REQUIRED
- Preserve the existing 21-row table under a new subsection §21.4.1 "Initial
  Registry Seed (Master Spec v6 → v7)" with original model/phase columns.
- Add §21.4.2 "Extended Capabilities" listing: page_enrichment,
  kb_bootstrap, first_pass_responses, team_suggestion,
  next_evaluation_suggestion, external_vendor_lookup, guide_draft_generation,
  guide_refresh_analysis, category_faq_generation, market_intelligence_report,
  ghost_rfp_ingestion. For each: model tier, typical input size, output
  contract reference, OutcomeContract reference, default confidence threshold,
  gated_at_plan_minimum, free_allowance_ops, platform-owned vs. customer-billed.
- Add §21.4.3 "Platform-Owned Capabilities (Not Customer-Billed)" — content-
  generation capabilities billed to Sourcera Marketing cost center.
- Add §21.4.4 "Free-Plan Access Rules" — per-capability allowance.
- Add §21.4.5 "Outcome Signals" — concrete accepted/rejected signal definitions
  per capability.
- Section §21.5 retained but rewritten to reference AIWallet and value-dollars.

VERIFICATION
Every capability referenced in the Summary, Pricing strategies, and KB
Engineering Spec appears in the registry. Update RECONCILIATION.md.
```

### Prompt 3.2 — Rewrite §22 with KB Engineering Spec (Architecture & MCP)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
REWRITE §22 Seller Console Knowledge Base to incorporate `KB_Engineering_Spec.md`
in full. This is a structural replacement — the existing §22.1–§22.7 becomes
a light "Product Overview" subsection; the new content takes over.

INPUTS (in full)
- `KB_Engineering_Spec.md` §0–§18
- Summary §6.13, C.52–C.59

TARGET STRUCTURE
§22.1 Purpose & Scope (preserve existing)
§22.2 Architectural Overview
  22.2.1 Layered Model (KB Spec §2.1)
  22.2.2 Why Managed Agents, Not Agent SDK (KB Spec §2.3)
  22.2.3 Beta Header & Version Pinning (KB Spec §2.4)
§22.3 Ingestion Channels (preserve + refine from existing §22.2)
§22.4 KB Entry Lifecycle & Indexing Pipeline
  22.4.1 Entry Lifecycle (KB Spec §5.1)
  22.4.2 Failed Vectorization (KB Spec §5.2)
  22.4.3 Re-Indexing on Entry Edit (KB Spec §5.3)
  22.4.4 Namespace Migration (KB Spec §5.4)
  22.4.5 Embedding Version Bumps (KB Spec §5.5)
§22.5 KB Health Model (preserve existing §22.4, extend with decay curve math)
§22.6 Firecrawl Integration (preserve existing §22.5)
§22.7 Document Library (preserve existing §22.6)
§22.8 The Sourcera KB MCP Server (NEW — KB Spec §3 in full)
  22.8.1 Why MCP (KB Spec §3.1)
  22.8.2 Registration on the Agent (KB Spec §3.2)
  22.8.3 Vault Auth at Session Creation (KB Spec §3.3)
  22.8.4 Tools Exposed (KB Spec §3.4 — kb_retrieve, kb_get_entry,
         document_library_find, doc_attach, capability_find,
         capability_declare_draft, cite_verify)
  22.8.5 MCP Server Permission Policy (KB Spec §3.5)
  22.8.6 MCP Server Implementation Requirements (KB Spec §3.6)

REQUIREMENTS
- Every MCP tool gets a full request/response schema following KB Spec §3.4
  verbatim.
- Add new entities if any MCP-tool internal state needs persistence (e.g.,
  MCP Session Token Record).
- Add new enum values (tool_name, permission_scope) to Appendix J.
- Cross-link every MCP tool to its upstream AIOperation settlement rule.

VERIFICATION
Line-by-line reading of KB_Engineering_Spec §0–§3 confirms no content loss.
Update RECONCILIATION.md.
```

### Prompt 3.3 — §22 KB Retrieval & Indexing Engineering

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Continue the §22 rewrite begun in Prompt 3.2. Add the retrieval and indexing
engineering subsections.

§22.9 Retrieval Engineering (NEW — KB Spec §4 in full)
  22.9.1 Retrieval Pipeline (KB Spec §4.1)
  22.9.2 Indexing Substrate (KB Spec §4.2)
  22.9.3 Chunking Strategy (KB Spec §4.3)
  22.9.4 Why Not Just Dense Retrieval (KB Spec §4.4)
  22.9.5 Query Expansion (KB Spec §4.5)
  22.9.6 Re-Rank Model Selection (KB Spec §4.6)
  22.9.7 Metadata Pre-Filter (KB Spec §4.7)
  22.9.8 Stale Entry Handling (KB Spec §4.8)
§22.10 Managed Agent Definitions (KB Spec §6)
§22.11 Custom Tool Contracts (KB Spec §7)
§22.12 Skills (KB Spec §8)
§22.13 Environments (KB Spec §9)
§22.14 Session Lifecycle — Per-Capability Flows (KB Spec §10)
§22.15 Event Stream Handling (KB Spec §11)
§22.16 Observability & Evaluation (KB Spec §12+ if present)
§22.17 Acceptance Criteria (consolidated)

REQUIREMENTS
- Every Managed Agent gets a full definition table: id, purpose, model,
  tool allowlist, skill list, environment, version, update workflow.
- Every skill gets its full markdown body preserved verbatim from the KB Spec.
- Every environment gets its rate-limit matrix and tool-access allowlist.
- Cross-link each capability in §22.10–§22.13 to its Capability Registry entry
  in §21.4 and its OutcomeContract in §34.11.

VERIFICATION
Line-by-line reading of KB_Engineering_Spec §4–§11 confirms no content loss.
Update RECONCILIATION.md.
```

### Prompt V3 — Phase 3 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Produce `/Sourcera/_integration/PHASE3_VERIFY.md`:
1. Every KB Spec section (§0–§18) is represented in the new §22.
2. Every Managed Agent has: id, model tier, tool allowlist, skill list,
   environment, outcome contract.
3. Every MCP tool has: auth, request schema, response schema, permission scope,
   rate limit class.
4. Capability Registry (§21.4) contains a row for every capability referenced
   in KB Spec §6.
5. Grep for "AgentSDK" or "Agent SDK" — should appear only where explaining
   why Managed Agents were chosen instead.
6. Confirm §21.5 (budgets) now references AIWallet rather than token budgets.

DO NOT modify the Spec in this prompt.
```

---

# Phase 4 — PLG, Growth Mechanics, and Network Effects

Goal: Add a new §48 PLG & Growth Mechanics section specifying M1–M17 at Master Spec detail.

### Prompt 4.1 — §48 Introduction, PLG Framework, Core Growth Loops

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Create a new §48 "PLG, Growth Mechanics & Network Effects" positioned after §47
(Governance) and before the existing Appendices.

§48.1 PLG Framework Overview — the buyer paid path (signup → aha → ceiling
      hit → expansion → enterprise trigger) per Summary §3.1, AND the seller
      paid path (forced-signup → hero moment → first bid → three conversion
      moments → expansion → enterprise trigger) per Summary §3.1b. Both paths
      must be fully specified as parallel funnels. Reference Summary §3.6 for
      the Hero Moment mechanics (pre-arrival preparation, onboarding surface
      minutes 0–3, in-workspace value proof minutes 3–45, post-submission
      reveal). Include the seller-side activation metric (p50 < 20 min from
      magic-link to first submitted requirement response) per Summary §3.1b /
      C.135.
§48.2 The 10 Core Growth Loops — each loop gets a full subsection:
      id, mechanism, trigger event, acting entity, targeted entity, telemetry
      events (PostHog), anti-spam controls, acceptance criteria. Enumerate:
      Vendor-Invite-Creates-Account, Template-Clone-Attribution, Seller-Profile
      SEO, Free-AI-Teaser-to-Paid, Cmd+K Suggestion Loop, Bid-Close-Offers-KB-
      Sync, Template Publish Incentive, Marketplace Match-Score Teaser.
      (Two loops are retired per the Summary — note them explicitly with
      "retired, replaced by MX" annotation.)
§48.3 Network Effects — qualitative framing, measurable signals, dashboards.
      MUST include seller-side network effects (7 compounding loops from Summary
      §3.4): Invited-Vendor→Published-Profile→Marketplace-Ready Inventory,
      KB→Capability Declaration→Match Score→EOI→Revenue, Bid-Close→Win/Loss
      Signal→Platform Learning, Seller-Profile SEO Loop, Ghost-Bid Import Loop,
      Buyer-Funded Pro Trial Loop, Template Publish Incentive. Each loop needs
      mechanism, entity refs, telemetry, and measurable signal. Reference
      C.138 Seller-Side Network Effects Inventory.
§48.4 Anti-Spam & Abuse Controls (Global) — email throttling, DMARC/SPF
      reputation, shared-use domain detection, content validators, template
      spam ML classifier, referral fraud controls, k-anonymity floors,
      suppression list, global vendor opt-out, Signal Integrity Monitor cross-
      reference. MUST include seller-side pricing-specific constraints from
      Summary §3.5: per-seller/per-category/per-buyer EOI rate limits, taxonomy-
      validated Capability Declarations, anomalous-velocity detection, Ops
      downgrade/throttle/suspend authority, 180-day zombie-inventory demotion
      for inactive free sellers. Pricing gives access to outbound tools;
      Marketplace integrity defines the acceptable-use floor.
§48.8 Seller Hero Moment & Onboarding Anti-Patterns — per Summary §3.6 /
      C.132 / C.141. Full product-surface specification: pre-arrival
      preparation (domain enrichment, category tagging, bootstrap queue
      pre-warm), onboarding surface (zero-form, progress storytelling),
      in-workspace value proof (inline citations, accept/edit/reject, KB-gap
      detector, budget counter), post-submission reveal (stake-reveal screen).
      Six banned anti-patterns from Summary §3.6 as hard requirements.
      Three conversion moments — authoritative binding at §48.1.7 (the
      testable contract) and UX surface specification at §48.8.6 (the
      presentation layer) — from Summary §3.1b / C.133 as the definitive
      upgrade trigger specification.

[NB-18 REMEDIATION NOTE — 2026-04-19] This prompt previously referenced
"§48.5" for the Seller Hero Moment. During Phase 4 execution, the Hero Moment
and Onboarding Anti-Patterns were placed at §48.8 of the Master Spec and the
Three Conversion Moments were bound authoritatively at §48.1.7 with UX surface
specification at §48.8.6 (while §48.5 became the home for M1–M8 Buyer-Side
Growth Mechanics). All downstream §48.5 references to the Hero Moment / Three
Conversion Moments / SellerOnboardingSession Seller-Console reference have
been corrected to §48.8 / §48.1.7 below. Prior v6-to-v7.0.0 execution
transcripts that cite the legacy §48.5 numbering remain valid historical
records; the corrected numbering is authoritative for v7.0.0+ reviews.

REQUIREMENTS
- Every loop gets telemetry events. Add to Appendix G.
- Every loop gets at least one entity reference in §4.
- k-anonymity floors per surface: k=5 signal, k=10 aggregate, k=20 market
  intelligence.
- Seller paid path must reference SellerOnboardingSession entity from Phase 1.2.
- Hero Moment must cross-link to §22 KB Bootstrap, §21.4 Capability Registry
  (first_pass_responses, kb_bootstrap), and §34.10 AIWallet (free budget
  consumption during onboarding).
- Three conversion moments (second concurrent bid, first EOI attempt, KB
  ceiling) must each have: trigger event, upgrade CTA copy, telemetry event,
  plan-from/plan-to mapping.
- Leading seller-side indicators (8 metrics from Summary §3.1b) must be
  listed with PostHog event mappings.
- Onboarding anti-patterns are HARD requirements, not guidelines — QA must
  be able to test each ban.

VERIFICATION
Update RECONCILIATION.md. Confirm retired loops are annotated, not deleted.
Confirm seller paid path and buyer paid path are both fully specified.
Confirm all 7 seller-side network effects are present with entity refs.
```

### Prompt 4.2 — M1–M8 Growth Mechanics

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Extend §48 with §48.5 M1–M8 Growth Mechanics. Each mechanic gets a full
subsection at Master Spec detail level.

PER-MECHANIC STRUCTURE (apply to every mechanic)
- Purpose
- Trigger
- Actor & Entity Schema (reference §4 entities)
- Workflow (step-by-step, including phase-gating where applicable)
- UX Surfaces (reference §3.3 pattern mapping)
- Data Collected / Retained
- Anti-Abuse Controls (specific rules; cross-link §48.4)
- Plan Gating & Entitlement
- Telemetry Events
- Notifications Fired
- Webhooks Fired
- API Endpoints (list with auth scope)
- Acceptance Criteria

MECHANICS
M1 Stakeholder Read-Only Invite
M2 Selection Report Public Link (watermarked)
M3 Evaluation Certificate Badge
M4 "Kick Off Next Evaluation" on Close
M5 Buyer-Pull Vendor Invite (Summary C.63 — detailed anti-abuse)
M6 Domain-Based Auto-Join (Summary C.64 — shared-use domain exclusion list)
M7 Suggested Team Discovery (Summary C.65)
M8 Org Intelligence Value Curve (Summary C.66)

REQUIREMENTS
- M2 must specify per-section redaction controls and watermark spec.
- M3 must specify certificate schema (signature, hash, embed format).
- M5 must specify 20/user/month and 5/target-domain/30d throttles.
- M6 must reference the Signal Integrity Monitor.

VERIFICATION
Update RECONCILIATION.md.
```

### Prompt 4.3 — M9–M13 Content Mechanics (Marketplace SEO)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Extend §48 with §48.6 M9–M13. These are content-generation-heavy and have
editorial/review requirements.

MECHANICS
M9 Per-Category Marketplace Landing Pages
M10 "How to Evaluate [X]" Guides
M11 Software Comparison Pages
M12 Aggregate Market Intelligence Reports
M13 Public Marketplace Heat Map

REQUIREMENTS (per mechanic)
- AI capability reference (from §21.4 registry; confirm each capability is
  marked platform-owned).
- Editorial review workflow (who, when, rubric).
- Refresh cadence + refresh-analysis capability.
- Schema.org structured data requirements.
- k-anonymity floors enforced before rendering.
- Vendor Opt-Out honoring behavior.
- Takedown / appeal flow.
- Cost-center routing (Platform Marketing, not customer-billed).
- Acceptance criteria including: a page must fail to render if k-anonymity
  floor is not met.

VERIFICATION
Update RECONCILIATION.md. Confirm entity references back to §4.4 Seller
entities (CategoryPage, GuidePage, ComparisonPage, MarketIntelligenceReport,
HeatMapCell).
```

### Prompt 4.4 — M14–M17 Sharing, Importers, Referrals, Trials

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Extend §48 with §48.7 M14–M17.

M14 Seller Bid Success Share — one-click social post; buyer anonymization
    validator; seller authorship retained.
M15 Ghost-Bid Importer — historical RFP paste/upload; `ghost_rfp_ingestion`
    capability; first import free per Seller Org; reference the GhostBidImport
    entity from Phase 1.3.
M16 Buyer Referral Credit — referral flow, same-domain self-referral block,
    payment-method overlap detection, minimum-activity gating, credit
    reconciliation.
M17 Buyer-Funded Pro Trial Seat — cite §34.13 verbatim; cross-link. Include
    Buyer Org → Seller Org grant flow, 30-day auto-downgrade, cross-console
    billing reconciliation.

REQUIREMENTS
- M14 anonymization validator must block publication if buyer name detected.
- M15 must specify the ingestion → review-queue → accept/reject flow.
- M16 must specify fraud heuristics.
- M17 is a cross-reference; do not duplicate §34.13.

VERIFICATION
Update RECONCILIATION.md.
```

### Prompt V4 — Phase 4 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Produce `/Sourcera/_integration/PHASE4_VERIFY.md`:
1. §48 contains all 10 core loops + M1–M17.
2. Retired loops (#3 and #6) are annotated, not silently removed.
3. Every M-mechanic has: entity ref, telemetry, anti-abuse, acceptance
   criteria, plan gating.
4. Appendix G contains a new section "Growth Mechanic Events" with at least
   one event per mechanic.
5. k-anonymity floors appear in M9, M12, M13.
6. Vendor Opt-Out Registry is referenced by M2, M9, M11, M14.
7. Seller paid path (§48.1) specifies all 7 stages from Summary §3.1b with
   concrete triggers and conversion moments. (Summary §3.1b authoritative
   7-stage enumeration is reconciled against the §48.1.2 5-row tabular
   encoding per §48.1.2 ¶ Reconciliation Note.)
8. Seller Hero Moment (§48.8) contains pre-arrival, onboarding, value-proof,
   and reveal phases with all 6 banned anti-patterns as hard requirements.
9. Three conversion moments — authoritative binding at §48.1.7, UX surface
   specification at §48.8.6 — are each testable with trigger/CTA/
   telemetry/plan mapping.
10. All 7 seller-side network effects (§48.3) are present with mechanism,
    entity refs, and measurable signals.
11. Seller-side anti-spam constraints from Summary §3.5 are present in §48.4.
12. SellerOnboardingSession entity is referenced from §48.1 and §48.8
    (Seller-Console scope; §48.5 intentionally excluded — §48.5 is the
    Buyer-Console M1–M8 section and the cross-console firewall prohibits
    Seller-Console entity references from Buyer-Console sections).

DO NOT modify the Spec in this prompt.
```

---

# Phase 5 — Marketplace & Seller Expansion

### Prompt 5.1 — Extend §26 Seller Profiles to Products & Pages

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Extend §26 to integrate Summary §6.15.4, §6.15.5:
- §26.7 Seller Organization Pages — public page at sourcera.com/sellers/:slug.
  Enrichment via `page_enrichment` capability. Domain verification gates
  publication.
- §26.8 SellerSoftware & Software Pages — per-product pages, claim verification
  flow, capability declarations per product, KB namespace isolation per product,
  comparison-page participation rules.
- §26.9 SEO Requirements — Schema.org structured data, canonical URLs,
  sitemap generation, robots.txt, vendor-opt-out honoring.
- §26.10 Acceptance Criteria (extended).

REQUIREMENTS
- Cross-link to entities added in Phase 1.2.
- Cross-link to §27 Marketplace for listing behavior.
- Add new enums (page_status, claim_status) to Appendix J.

VERIFICATION
Update RECONCILIATION.md.
```

### Prompt 5.1b — §22 KB Value Capture & Stake-Building

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Extend §22 (Seller Console Knowledge Base) with a new subsection for KB Value
Capture & Stake-Building per Summary §6.13.7 / C.139.

§22.18 KB Value Capture & Stake-Building (NEW — Summary §6.13.7)
  22.18.1 Design Principle — "Honest Portability; On-Platform Compounding"
  22.18.2 Honest Portability — full export specification (Markdown bodies,
          JSON schema, entry metadata manifest, provenance log, zipped
          attachments). One-click, rate-limited-for-abuse-only, never
          paywalled, documented format, available on every tier including Free.
          DSAR/Right-to-Erasure compatibility preserved.
  22.18.3 On-Platform Compounding — 5 features that only work inside Sourcera:
          confidence score from acceptance rates, staleness state from Health
          Model (§22.5), win-rate weighting from closed-bid outcomes, cross-bid
          citation graph, KB-to-Capability auto-declarations (C.46).
  22.18.4 KB Value Meter — persistent panel specification. Nightly recomputation.
          Explainable math (response-time saved × blended hourly rate; win-rate
          lift from citation graph × deal value). Every number click-through to
          source entries. Visible on Free tier.
  22.18.5 Upgrade Carry-Over Guarantee — lossless migration: entries, confidence
          scores, staleness states, citations, win-rate weights, provenance
          records. No re-indexing penalty. Plain-language confirmation at upgrade
          moment. Downgrade: 12-month read-only, then archival per §6.27.
  22.18.6 Stake-Reveal Moments — 3 deliberate surfaces: (1) Free-tier KB
          landing (Value Meter), (2) closed-bid outcome debrief (cited entries
          overlay), (3) three conversion thresholds (upgrade screen previews
          which KB features remain per tier).
  22.18.7 Acceptance Criteria.

REQUIREMENTS
- Cross-link Value Meter to §50 Analytics (nightly computation, telemetry).
- Cross-link Carry-Over Guarantee to §34.19.
- Cross-link Stake-Reveal Moments to §48.1.7 (three conversion moments
  authoritative binding) and §48.8.6 (UX surface specification).
- Export format must be public API-surfaced at GET /v1/orgs/:orgId/kb/export
  — add to §32 billing endpoints if not already covered.
- Add PostHog events: kb_value_meter_viewed, kb_export_initiated,
  stake_reveal_displayed (property: reveal_moment).

VERIFICATION
Update RECONCILIATION.md. Confirm cross-links to §34.19, §48.1.7, §48.8.6, §50.
```

### Prompt 5.1c — §6.16.6 Marketplace Discovery Pricing (Feature Section)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Extend §27 Vendor Discovery & RFP Marketplace with the non-AI monetization
layer from Summary §6.16.6 / §2.10 / C.131.

§27.11 Marketplace Discovery Pricing (Non-AI Monetization Layer) (NEW)
  27.11.1 Overview — three SKUs, accounting-isolated from AI Wallet.
  27.11.2 Promoted Listings — keyword-targeted, category-scoped, second-price
          auction, daily cap and per-EOI cap per seller, k=5 anonymization
          before seller-side impression attribution, frequency-cap per buyer
          per category per rolling 7-day window. Eligibility: KB health above
          floor threshold (reference §22.5) + ≥1 closed bid in prior 90 days.
  27.11.3 Verification Tiers (Paid Upgrade Path) — Basic (free, automatic on
          domain verification), Verified (paid, badge + match-score weight
          multiplier, requires SOC 2 or ISO 27001 Ops review), Certified (paid,
          deep compliance review, quarterly re-review cadence, listing
          priority). Fees invoiced monthly alongside plan; do not draw from AI
          Wallet.
  27.11.4 Featured Placements — three surfaces (Category Pages M9, Comparison
          Pages M11, Heat Map M13). Monthly/quarterly commitments. Persistent
          "Featured" label with tooltip; FTC native-advertising compliance.
          Featured status does NOT alter organic match scores.
  27.11.5 Accounting Isolation — `rev_marketplace_discovery` cost center;
          separate from `rev_ai_wallet` and `rev_subscription`. Finance
          dashboards report gross margin per stream independently. Unit
          economics: AI Wallet ≈ 4.5% platform margin, subscription ≈ 85–90%,
          Marketplace Discovery ≈ 95%+.
  27.11.6 Buyer Experience Guardrails — paid placements never suppress organic
          match signal; Verified/Certified labels don't override capability
          filters; Featured lanes visually distinct from organic results.
          Match Scoring computed on organic signal only — Certified with weak
          declarations ranks below Basic with strong declarations.
  27.11.7 API Endpoints — POST/GET/DELETE for promoted listings, featured
          placements. Seller Dashboard surfaces. Admin surfaces in Ops Console.
  27.11.8 Acceptance Criteria.

REQUIREMENTS
- Cross-link to §34.16 (billing specification for this layer).
- Cross-link to PromotedListing, FeaturedPlacement, VerificationReviewRecord
  entities from Phase 1.2.
- Cross-link to MarketplaceDiscoveryRevenueRecord entity from Phase 1.4.
- Add new enums: promoted_listing_status, featured_placement_surface,
  verification_review_outcome to Appendix J.
- Add API endpoints to §32 with full request/response schemas.
- Add webhooks: promoted_listing.created, .exhausted, .paused;
  verification.review_completed; featured_placement.activated, .expired.

VERIFICATION
Update RECONCILIATION.md. Confirm no overlap with §34.16 (billing handles
accounting; §27.11 handles product behavior).
```

### Prompt 5.1d — §6.28.2 Seller Onboarding Experience

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Extend the Spec's onboarding section with a new subsection for the Seller
Onboarding Experience per Summary §6.28.2 / C.132 / C.136 / C.141.

NOTE: The general Hero Moment mechanics are specified in §48.8 (Phase 4).
The Three Conversion Moments authoritative binding lives at §48.1.7; the UX
surface specification is §48.8.6. This prompt specifies the
IMPLEMENTATION-LEVEL onboarding flow — the seven-stage UX, the engineering
requirements, and the acceptance criteria. [NB-18 remediation: prior §48.5
references corrected.]

§XX.1 Seller Onboarding — Seven-Stage Flow (NEW — Summary §6.28.2)
  XX.1.1 Stage 1: Magic-Link Arrival — zero-form, domain + invite identity
         sufficient. SSO redirect window used for bootstrap pre-warm.
  XX.1.2 Stage 2: Domain Bootstrap — Opus-tier crawl inside SSO latency (30–90s).
         40–200 draft KB entries. Reference §22 KB Bootstrap (§22.8).
  XX.1.3 Stage 3: First-Pass Draft — Sonnet/Managed Agent drafts for every
         buyer requirement. Reference §21.4 first_pass_responses capability.
  XX.1.4 Stage 4: Landing Screen — "Your bid is ready" with drafted/cited
         counters. SellerOnboardingSession entity tracks elapsed time.
  XX.1.5 Stage 5: In-Workspace Review — inline citations, accept/edit/reject
         per requirement, KB-gap detector on rejections, live budget counter.
  XX.1.6 Stage 6: First Bid Submission — stake-reveal screen on submit.
  XX.1.7 Stage 7: Post-Submission — win/loss debrief as upgrade trigger
         (Summary C.137), KB compounding confirmation.
  XX.1.8 Progress Storytelling UX — every status line is true and reflects
         actual work. Specify copy for each stage transition.
  XX.1.9 Onboarding Anti-Patterns (Authoritative) — 6 banned behaviors from
         Summary §3.6 as HARD requirements: no credit card before upgrade
         intent, no company description before bootstrap, no "try Pro free"
         modal on first login, no pricing page before first bid submitted,
         no dark patterns on upgrade CTAs, no upgrade offer during active
         bid work.
  XX.1.10 Acceptance Criteria — including: p50 < 20 min magic-link to first
          requirement response (Summary C.135); bootstrap completes ≥40
          approved entries on p50 of seller domains (hero-moment acceptance
          rate); zero violations of anti-pattern bans in QA.

REQUIREMENTS
- Cross-link to SellerOnboardingSession entity from Phase 1.2.
- Cross-link to §48.8 Hero Moment mechanics and §48.1.7 / §48.8.6 Three
  Conversion Moments.
- Cross-link to §22 (KB Bootstrap), §21.4 (first_pass_responses, kb_bootstrap).
- Add PostHog events: seller_onboarding_stage_entered (property: stage 1-7),
  seller_onboarding_completed, seller_hero_moment_displayed,
  seller_first_requirement_response, seller_first_bid_submitted.
- The section number (XX) should be placed logically — likely as an extension
  of the existing onboarding section or as §51 if no natural insertion point.

VERIFICATION
Update RECONCILIATION.md. Confirm cross-links to §48.8 (Hero Moment),
§48.1.7 / §48.8.6 (Three Conversion Moments), §22, §21.4, §34.
```

### Prompt 5.2 — Match Score Internals & Controlled Vocabulary

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Extend §27 Vendor Discovery & RFP Marketplace:
- §27.4 expanded: Match Score Internals per Summary C.61. Document input
  feature list, feature weightings (or note they are learned), retraining
  window, free-vs-paid surface differences (labels vs. numeric), model
  deprecation policy.
- §27.6 expanded: Controlled Vocabulary Registry per Summary C.60. Document
  the Ops Console authoring flow, deprecation-with-cascade rules, freeform-tag
  prohibition, and migration tooling when a tag is retired.
- §27.8 (new): Abuse & Takedown per §45.3 + extended from Summary.

REQUIREMENTS
- Match Score features table: feature_id | name | type | source_entity |
  freshness_requirement | weight_mode (learned/static) | null_handling.
- Every taxonomy change surfaces a webhook event (taxonomy.category_added,
  .deprecated, .retired).

VERIFICATION
Update RECONCILIATION.md.
```

### Prompt 5.3 — Seller Signals & CRM Sync

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Add two new sections:
- §27.9 Seller Signals (Anonymized Buyer Intent) per Summary §6.17. Opt-in
  buyer flow (off by default), k-anonymity enforcement, delivery surfaces
  (Seller Dashboard, weekly digest, CRM Sync). De-anonymization ONLY on EOI
  or direct invite — specify the exact state transition.
- §31.8 CRM Sync per Summary §6.18. Full implementation for Salesforce,
  HubSpot, Dynamics, Pipedrive. Account matching algorithm (domain + name +
  fuzzy), routing rules, activity payload per event, failure queue, OAuth
  setup UX, field mapping UI, retry semantics.

REQUIREMENTS
- Seller Signals must specify the k-anonymity floor (k=5) and the de-anonymization
  state machine (anonymized → eoi-submitted or direct-invite → de-anonymized).
- CRM Sync field mapping is plan-gated (Growth+).
- Add CRM Sync to §5.11 Feature Access Matrix.

VERIFICATION
Update RECONCILIATION.md.
```

### Prompt 5.4 — Vendor Opt-Out Global Registry

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Add §27.10 Vendor Opt-Out Global Registry per Summary C.123.

REQUIREMENTS
- Opt-out is Seller-Org-scoped and applies retroactively across all Orgs.
- Enforcement surfaces: M2 Selection Report Public Link, M9 Category Pages,
  M11 Comparison Pages, M12 Market Intelligence Reports, M13 Heat Map,
  any page rendering seller identity.
- DNS TXT or Seller Owner attestation proves authority.
- API endpoints: POST /v1/opt-outs, GET /v1/opt-outs, DELETE /v1/opt-outs/:id.
- Webhook: vendor.opted_out, vendor.opted_in.
- Acceptance criteria: enforcement latency ≤60 seconds across all rendering
  surfaces.

VERIFICATION
Update RECONCILIATION.md.
```

### Prompt V5 — Phase 5 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Produce `/Sourcera/_integration/PHASE5_VERIFY.md`:
1. §26 covers Seller Org Pages + SellerSoftware Pages + SEO requirements.
2. §27.4 contains Match Score feature table.
3. §27.6 contains Taxonomy CMS flow.
4. §27.9 Seller Signals present with k-anonymity state machine.
5. §31.8 CRM Sync covers all four named CRMs.
6. §27.10 Opt-Out Registry enforcement is wired to M2, M9, M11, M12, M13.
7. §22.18 KB Value Capture present with: Honest Portability (export spec),
   On-Platform Compounding (5 features), KB Value Meter (nightly recompute,
   explainable math), Upgrade Carry-Over Guarantee, Stake-Reveal Moments (3).
   Cross-links to §34.19, §48.1.7, §48.8.6, §50 confirmed.
8. §27.11 Marketplace Discovery Pricing present with: three SKUs, accounting
   isolation (`rev_marketplace_discovery`), anti-spam linkage (KB health
   floor + closed-bid requirement), buyer experience guardrails (paid never
   suppresses organic match signal). Cross-link to §34.16 confirmed.
9. Seller Onboarding Experience section present with: seven stages, progress
   storytelling UX, 6 banned anti-patterns as hard requirements, activation
   metric (p50 < 20 min), cross-links to §48.8 (Hero Moment) and §48.1.7 /
   §48.8.6 (Three Conversion Moments), §22, §21.4.
10. SellerOnboardingSession, PromotedListing, FeaturedPlacement,
    VerificationReviewRecord entities are all referenced from the new sections.

DO NOT modify the Spec in this prompt.
```

---

# Phase 6 — Sourcera Ops Console

Goal: Add the Sourcera Ops Console section covering internal admin surfaces, separation architecture, role matrix, Taxonomy CMS, and Signal Integrity Monitor.

> **Numbering Reconciliation (2026-04-21).** The prompts in this phase were originally drafted targeting `§49`. During Phase 5 integration, `§49` was permanently allocated to Seller Onboarding, pushing the Ops Console to `§50`. Phase 6 landed and verified at `§50` in the Master Spec. All references below have been updated to the as-landed section numbers. Subsection mapping: original `§49.1–§49.5` → current `§50.1–§50.5`; original `§49.6` → `§50.10` (Taxonomy CMS); `§49.7` → `§50.11` (Template Review); `§49.8` → `§50.12` (Pricing Admin); `§49.9` → `§50.13` (Baseline Assumption Manager); `§49.10` → `§50.14` (Internal Analytics Dashboards); `§49.11` → `§50.15` (Signal Integrity Monitor); `§49.12` → `§50.16` (Fraud Analyst Surface); `§49.13` → consolidated ACs distributed across `§50.8` and `§50.17`, with `§50.19` added as the Consolidated Acceptance Criteria Pointer. The intermediate `§50.6–§50.9` are occupied by Ops-Tagged Audit Actor depth, Ops Console authentication architecture, Ops Console AC preamble, and Support Agent Surface. See `_integration/RECONCILIATION.md` (§50 Phase 6 Verification Remediation entry).

### Prompt 6.1 — §50 Ops Console Architecture & Role Matrix

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Create §50 Sourcera Ops Console, positioned after §49.

§50.1 Purpose
§50.2 Separation Architecture (Summary C.93) — Ops Console is a SEPARATE app;
      its own auth; mutations flow through the same customer APIs tagged with
      an Ops actor; NO direct DB access; impersonation is time-bounded and
      audited.
§50.3 Ops Role Matrix (Summary C.94) — 6 roles: Ops Admin, Pricing Admin,
      Template Reviewer, Support Agent, Fraud Analyst, Finance. Role matrix
      table with every Ops capability per role.
§50.4 Impersonation Audit Requirements (Summary C.98) — justification required,
      default 30-min time-box, fully audited, customer Org Owner notified on
      session start AND end.
§50.5 Ops-Tagged Audit Actor — every Ops mutation appears in customer audit
      logs tagged with `actor_type: ops`, Ops role, and justification reference.

REQUIREMENTS
- Data model: OpsSession (id, ops_user_id, org_id_impersonated, justification,
  started_at, ended_at, actions_taken_count).
- Add OpsSession to §4.6 Audit & Logging Entities.
- Add Ops roles to Appendix J Audit Event Action Types.

VERIFICATION
Update RECONCILIATION.md.
```

### Prompt 6.2 — §50 Ops Features: Taxonomy CMS, Template Review, Pricing Admin

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Extend §50:
§50.10 Taxonomy CMS (Summary C.95) — category + capability-declaration taxonomy
       authoring, versioning, deprecation cascade, migration tooling. Full
       screen-by-screen UX and API. Wire to §27.6.
§50.11 Seller Template Review Rubric (Summary C.96) — scoring rubric: schema
       validity, anti-spam signals, category fit, quality. Reviewer workflow,
       appeal flow, audit trail.
§50.12 Pricing Admin Surface — edit pricing table, edit cost_base override,
       edit free allowances, publish pricing version (triggers Public Pricing
       API refresh).
§50.13 Baseline Assumption Manager (Summary C.97) — edit Time-Saved conversion
       factors, version-tracked.
§50.14 Internal Analytics Dashboards by Role (Summary C.99) — per-role
       dashboards (Growth PM, GTM Lead, Finance, Fraud Analyst, Support).

REQUIREMENTS
- Every Ops mutation has an audit event with Ops actor tag.
- Pricing Admin changes require two-Ops-approver workflow for rate-card
  changes of ≥5% or cost_base drift ≥10%.

VERIFICATION
Update RECONCILIATION.md.
```

### Prompt 6.3 — §50 Signal Integrity Monitor & Fraud Controls

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Extend §50:
§50.15 Signal Integrity Monitor (Summary C.100) — detector categories:
       anomalous query patterns, referral velocity spikes, suspicious uploads,
       email sender-reputation drift. Emits alerts + one-click kill-switch per
       growth mechanic. Full alert taxonomy.
§50.16 Fraud Analyst Surface — review queue for flagged events, case lifecycle
       (flagged → investigating → resolved → escalated), actions available
       (suspend Org, suspend User, reverse referral credit, revoke opt-out
       claim).
§50.17 Acceptance Criteria (consolidated for §50; see also §50.19 Consolidated
       Acceptance Criteria Pointer).

REQUIREMENTS
- Kill-switch must disable a growth mechanic globally within 60 seconds of
  Ops action.
- Kill-switch must be reversible by Ops Admin only (not Fraud Analyst).
- Every kill-switch event triggers a Slack alert to the on-call engineering
  channel.

VERIFICATION
Update RECONCILIATION.md. Cross-link §50.15 to §48.4 anti-spam controls.
```

### Prompt V6 — Phase 6 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Produce `/Sourcera/_integration/PHASE6_VERIFY.md`:
1. §50 exists with all Ops Console subsections (original Prompt V6 spec:
   13 subsections covering Purpose, Separation Architecture, Role Matrix,
   Impersonation Audit, Ops-Tagged Audit Actor, Taxonomy CMS, Template
   Review, Pricing Admin, Baseline Assumption Manager, Internal Analytics
   Dashboards, Signal Integrity Monitor, Fraud Analyst Surface, ACs).
2. OpsSession entity present in §4.6.
3. Impersonation audit notifies Org Owner at start AND end.
4. Kill-switch specified for every growth mechanic in §48.
5. Pricing Admin two-approver rule specified for ≥5% rate-card changes.

DO NOT modify the Spec in this prompt.
```

---

# Phase 7 — Usage Analytics, Time-Saved, PLG Instrumentation

## Numbering Reconciliation (2026-04-22)

**Context.** Phase 7 was originally prompted as §50 Product Usage Analytics & PLG Instrumentation, positioned after §49. At Phase 7 authoring time, §50 was occupied by Sourcera Ops Console (Phase 6 authoring, §50.1–§50.19). Per the Master-Spec authoring convention forbidding silent overwrite, Phase 7 content was inserted as §51 Product Usage Analytics & PLG Instrumentation. PHASE7_VERIFY.md (2026-04-22) identified the same numbering-drift defect as Phase 6 Item 1 and recommended the identical Option A remediation: accept §51 as the permanent landing; rewrite the Phase 7 prompt-level references to reflect reality; record the reconciliation here and in RECONCILIATION.md.

**Resolution: Option A executed 2026-04-22.** §51 is the authoritative location for Phase 7 content. The original prompt-level §50.x subsection numbering is preserved below as a mapping table for traceability. Prompt 7.1 and Prompt V7 below are rewritten to reference the as-landed §51.x anchors.

**§50.x → §51.x Mapping Table.**

| Phase 7 Prompt (original §50.x) | As-Landed §51.x | Spec Title | Master Spec Line |
|--------------------------------|-----------------|------------|------------------|
| §50.1 Event Taxonomy | §51.1 | Event Taxonomy (Summary C.88) | 33706 |
| §50.2 Standardized Event Properties | §51.2 | Standardized Event Properties (Summary C.89) | 33793 |
| §50.3 Org-Level Usage Dashboard | §51.3 | Org-Level Usage Dashboard | 33910 |
| §50.4 User-Level Usage Dashboard | §51.4 | User-Level Usage Dashboard (Summary C.90) | 34080 |
| §50.5 Seller Usage Parity | §51.5 | Seller Usage Parity (Summary C.92) | 34140 |
| §50.6 Time-Saved Baseline Model | §51.6 | Time-Saved Baseline Model (Summary C.91) | 34201 |
| §50.7 Retention & DSAR | §51.7 | Retention & DSAR | 34278 |
| §50.8 Acceptance Criteria | §51.8 | Acceptance Criteria — Aggregate, Self-Challenge, and Counterfactual Pass | 34352 |

**§49.9 → §50.13 cross-reference reconciliation.** The original Prompt 7.1 named "Ops Console (§50.13)" as the editing home for Time-Saved conversion factors — but an earlier Summary shorthand had used "§49.9" for the same surface. Phase 6 Option A locked the Baseline Assumption Manager at §50.13. Every §51 cross-reference to the conversion-factor editor points at §50.13 (17 distinct citations catalogued in PHASE7_VERIFY.md Item 3). No `§49.9`-as-Baseline-Assumption-Manager references remain anywhere in the corpus.

**Appendix G event additions — anchor clarification.** The Phase 7 authoring registered 13 net-new events under the `analytics_meta` event family in "Appendix G → §51 Product Usage Analytics Event Additions" (Master Spec lines 35739–35775). This is an Appendix G subsection, NOT an anchor `§51.9` inside the §51 body. §51.8.4 #11 was updated in the same 2026-04-22 remediation pass to cite the correct anchor and the correct event count (13, not 10).

---

### Prompt 7.1 — §51 Product Usage Analytics (as-landed)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Create §51 Product Usage Analytics & PLG Instrumentation. Position after §50
(Sourcera Ops Console; Phase 6 occupant). Originally prompted as §50; §50 is
occupied — see Numbering Reconciliation (2026-04-22) above.

§51.1 Event Taxonomy (Summary C.88) — unified buyer+seller schema; reference
      Appendix G for the full list.
§51.2 Standardized Event Properties (Summary C.89) — org_id, console,
      workspace_id, user_id, phase, entity_ref, capability_id. Mandatory on
      every event for join-ability.
§51.3 Org-Level Usage Dashboard — per-capability spend, acceptance rate, top
      consumers, trend vs. prior 3 months.
§51.4 User-Level Usage Dashboard (Summary C.90) — per-user AI spend, accept/
      reject rate, capability mix, personal productivity.
§51.5 Seller Usage Parity (Summary C.92) — per-bid spend, capability mix, KB
      utilization, win rate correlation.
§51.6 Time-Saved Baseline Model (Summary C.91) — conversion factors per
      capability; Baseline Assumption Manager reference; surface locations
      (Org dashboard, inline PLG CTAs).
§51.7 Retention & DSAR — 24-month rolling retention; full DSAR coverage.
§51.8 Acceptance Criteria — Aggregate, Self-Challenge, and Counterfactual Pass.

REQUIREMENTS
- Expand Appendix G with every event from the existing taxonomy PLUS every
  event named in the Summary. Register at "Appendix G → §51 Product Usage
  Analytics Event Additions" subsection (NOT as §51.9 inside §51 body).
- Standardize event property schema — add an Appendix-G preamble documenting
  the required property set.
- Time-Saved conversion factors must be editable in Ops Console (§50.13
  Baseline Assumption Manager). Any earlier Summary shorthand citing §49.9
  for this surface is reconciled to §50.13 by Phase 6 Option A.

VERIFICATION
Update RECONCILIATION.md.
```

### Prompt V7 — Phase 7 Verification (as-landed)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Produce `/Sourcera/_integration/PHASE7_VERIFY.md`:
1. §51 present with all 8 subsections (§51.1–§51.8). Original prompt named §50;
   §50 is occupied by Phase 6 Ops Console — Option A executed 2026-04-22
   accepts §51 as permanent landing. See §50.x → §51.x mapping table above.
2. Appendix G expanded with new events (at "Appendix G → §51 Product Usage
   Analytics Event Additions" subsection).
3. Time-Saved conversion factors cross-link to §50.13 (Baseline Assumption
   Manager).
4. Org / User / Seller dashboards each have explicit acceptance criteria
   (§51.3.7, §51.4.6, §51.5.6).

DO NOT modify the Spec in this prompt.
```

---

# Phase 8 — UX & Design System Depth

### Prompt 8.1 — §3 UX Standard — Tokens & State Catalogs

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Extend §3 UX Standard with detailed token and state-catalog subsections.

§3.6 Form & Input Tokens (Summary C.109) — token table for input height,
     padding, border default/focus/error, focus ring color, label spacing,
     helper-text treatment.
§3.7 Loading / Empty / Error State Catalog (Summary C.110) — per-page-type
     catalog with copy guidelines, illustration rules, recovery CTA rules.
     Loading uses content-shaped skeletons; empty states include next-best-
     action; errors name failure, reason, recovery.
§3.8 Side Peek Dimensions & Behavior (Summary C.111) — 480px default width,
     360–640 resizable, open on Enter/row-click, close on Escape, Cmd+[/Cmd+]
     navigates prev/next entity without closing.
§3.9 Cursor Presence Visualization (Summary C.112) — up to 8 cursors, distinct
     hues per session, 10-sec idle-fade, viewport indicator for off-screen
     teammates.
§3.10 Bulk Action Toolbar (Summary C.113) — Shift+Click range select, Cmd+A
      all-within-filter, toolbar placement, persistence across pagination.
§3.11 Dark Mode Parity Rules (Summary C.115) — luminance inversion; semantic
      color preservation; agent/success/warning/danger/exception re-tuned for
      ≥4.5:1 contrast in both modes; user override in Settings.

REQUIREMENTS
- Every token has a name, value, and usage rule.
- State catalog covers: dashboard, matrix, detail, settings, Ops console, KB.

VERIFICATION
Update RECONCILIATION.md. Cross-link to Appendix B Keyboard Shortcut Reference.
```

### Prompt 8.2 — §38 Responsive & Mobile Expansion

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Extend §38 Responsive Design & Platform Support:
- §38.6 Breakpoints (Summary C.114) — 640/768/1024/1280 px with per-breakpoint
  layout rules.
- §38.7 Gesture Equivalents — J/K → swipe-up/down, Cmd+K → bottom-sheet palette,
  Side Peek → full-screen modal. Enforce 5-tap ceiling.
- §38.8 Mobile Feature Parity Matrix — feature × desktop/mobile cell (supported,
  parity, simplified, not-supported).

REQUIREMENTS
- Every major workflow must resolve to ≤5 taps on mobile.
- Acceptance criteria: tap-count probe test on top 20 workflows.

VERIFICATION
Update RECONCILIATION.md.
```

### Prompt V8 — Phase 8 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Produce `/Sourcera/_integration/PHASE8_VERIFY.md`:
1. §3.6–§3.11 present with concrete tokens/values.
2. §38.6–§38.8 present with breakpoints, gestures, parity matrix.
3. Dark mode contrast ratio rule (≥4.5:1) stated explicitly.
4. 5-tap ceiling referenced in mobile workflows.

DO NOT modify the Spec in this prompt.
```

---

# Phase 9 — Cross-Console Mechanics

### Prompt 9.1 — §25 Cross-Console Bridge Expansion

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Extend §25 Cross-Console Mechanics:
- §25.1 already covers Data Flow via Console Bridge — extend with full entity-
  level redaction rules (what IS carried vs. NEVER carried).
- §25.2 already covers Sync Behavior & Retry — specify the bounded-lag SLO
  (<30s), retry curve (exponential backoff), DLQ after 5 failures, failure
  surfaces on BOTH buyer and seller operational dashboards.
- §25.5 (NEW) Materialization Protocol — the adapter layer that translates
  buyer Requirement changes into seller Response Item changes without leaking
  scores, internal comments, or vendor-list membership.
- §25.6 (NEW) Console Bridge Observability — metrics, alert thresholds, on-call
  runbook link.

REQUIREMENTS
- Redaction rules: enumerate every buyer field. Each field is labeled CARRIED
  or REDACTED. Scores, internal comments, vendor identities, evaluator names
  are always REDACTED.
- Reference the Console Bridge Event entity (§4.7).

VERIFICATION
Update RECONCILIATION.md.
```

### Prompt 9.2 — Vendor Disqualification Workflow

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Formalize §25.3 Disqualification (existing but light) per Summary C.118:
- Full state machine (bid_active → disqualified; disqualified is terminal for
  the current evaluation).
- Vendor notification template.
- Bid Workspace freeze to read-only on disqualification.
- Audit trail: disqualification reason, disqualifying user, timestamp, hash.
- Buyer-side UX (disqualified vendors grouped in a separate lane).
- Vendor-side UX (in-app banner, email notification).
- API: POST /v1/workspaces/:id/vendors/:vendorId/disqualify
- Webhook: vendor.disqualified

VERIFICATION
Update RECONCILIATION.md. Add to Appendix D (Response Status) or Appendix E
(Workspace Status) as appropriate.
```

### Prompt V9 — Phase 9 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Produce `/Sourcera/_integration/PHASE9_VERIFY.md`:
1. §25.1 redaction rules cover every buyer field.
2. §25.2 SLO (<30s) and retry curve present.
3. §25.5 and §25.6 added.
4. §25.3 Disqualification has state machine + API + webhook.

DO NOT modify the Spec in this prompt.
```

---

# Phase 10 — Internal Surfaces: Comments, Presence, Unread Tracking

### Prompt 10.1 — §25.7 Internal Comments + §3.12 Presence & Unread

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
- Add §25.7 Internal Comments (Summary C.119) — private threads on Workspaces,
  Use Cases, Requirements. NEVER visible to vendors. Business: 500/workspace
  cap. Enterprise: unlimited. Mentions, markdown, attachments. Cross-link to
  Internal Comment entity from Phase 1.1.
- Add §3.12 Presence & Unread Tracking (Summary C.120) — Convex Presence for
  live cursors; Convex Unread Tracking for per-thread counts across Comments,
  Q&A, Inbox. Performance budgets. Visibility-rules enforcement.

REQUIREMENTS
- Internal Comments never cross-console — explicitly state the firewall rule.
- Unread counters must respect visibility (e.g., a private Q&A thread's unread
  count is hidden from users outside the visibility scope).

VERIFICATION
Update RECONCILIATION.md.
```

### Prompt V10 — Phase 10 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Produce `/Sourcera/_integration/PHASE10_VERIFY.md`:
1. §25.7 Internal Comments present with plan caps and firewall rule.
2. §3.12 Presence & Unread present with performance budgets.
3. Entities Internal Comment, Presence Record, Unread Marker referenced.

DO NOT modify the Spec in this prompt.
```

---

# Phase 11 — GTM / Positioning Appendix

### Prompt 11.1 — Appendix K GTM & Positioning

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Create Appendix K "GTM & Positioning Reference" containing Summary §1 one-pager
and Appendix C.124–C.127 content at Master Spec fidelity. This is reference
content, not build content, but lives in the Spec so engineering, support, and
product are aligned on narrative.

Appendix K.1 One-Pager (Tagline, One-Liner, What It Is, The Problem, What
             Sourcera Changes, Who It's For, Category)
Appendix K.2 Buyer Personas (5 personas per Summary C.124, each with title,
             KPIs, pains, Sourcera-solves, objections/rebuttals, online
             behavior, stop-scrolling message)
Appendix K.3 Messaging Playbook (C.125) — Homepage H1/H2/CTA; 5 buyer and 5
             seller cold-email subjects; 30-sec voicemail script; conference
             intro script; Founder LinkedIn headline + bio; Twitter bio; 1-para
             product description.
Appendix K.4 Category Definition Narrative Arc (C.127) — Problem → Failed
             Solutions → New Category → Sourcera.
Appendix K.5 Pricing Objection Handlers (C.126) — verbatim rebuttals to "$499
             is expensive," "we have Coupa/Ivalua," "free tier is enough."

REQUIREMENTS
- This appendix is reference content. Do NOT add acceptance criteria.
- Explicitly note that this appendix is informative, not normative. Build
  teams do not implement against GTM copy.

VERIFICATION
Update RECONCILIATION.md.
```

### Prompt V11 — Phase 11 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Produce `/Sourcera/_integration/PHASE11_VERIFY.md`:
1. Appendix K exists with subsections K.1–K.5.
2. All 5 personas present.
3. Appendix K is labeled Informative.

DO NOT modify the Spec in this prompt.
```

---

# Phase 12 — Consistency Sweep

Goal: Enforce cross-document consistency — terminology, enums, cross-references, glossary.

### Prompt 12.1 — Enum Registry Normalization (Appendix J)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk Appendix J from top to bottom. For every enum:
1. Ensure every value used in the Spec body appears in the enum definition.
2. Ensure every enum value is USED somewhere in the Spec (mark orphans).
3. Ensure naming consistency — snake_case, no mixed case, no plurals.
4. For every Phase 1–11 addition, confirm enum registration.
5. Produce a diff summary: enums added, enums extended, enums deprecated.

Also add NEW enums required by Phase 1–11 that may have been missed:
- ai_operation_settlement_state
- ops_role
- page_status
- claim_status
- content_refresh_status
- referral_status
- trial_seat_status
- taxonomy_node_status
- match_score_mode
- seller_signal_state
- opt_out_scope
- crm_provider
- ghost_import_status
- promoted_listing_status (active/paused/exhausted/expired)
- featured_placement_surface (category_page/comparison_page/heat_map)
- verification_review_outcome (approved/rejected/pending)
- marketplace_discovery_sku (promoted_listing/verification_upgrade/featured_placement)
- seller_onboarding_stage (1-7)
- seller_onboarding_invite_source (buyer_invite/ghost_bid/direct)
- stake_reveal_moment (kb_landing/bid_debrief/conversion_threshold)

VERIFICATION
Grep the Spec for any enum-like value NOT in Appendix J. List in
`PHASE12_1_VERIFY.md`. Zero orphans is the exit criterion.
```

### Prompt 12.2 — Glossary Completion (Appendix B)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
For every term introduced across Phase 1–11, confirm Appendix B Glossary entry.
For every existing term, confirm definition is still accurate post-integration.

TERMS TO VERIFY (non-exhaustive)
AIOperation, AIWallet, OutcomeContract, CapabilityRegistryEntry, ContestRecord,
FreeAllowanceCounter, CommittedSpendContract, Billing Admin, Ops Session,
Ops Role Matrix, Signal Integrity Monitor, Taxonomy Node, Vendor Opt-Out
Registry, Console Bridge Event, SellerSoftware, SellerOrgPage, SoftwarePage,
CategoryPage, GuidePage, ComparisonPage, MarketIntelligenceReport, HeatMapCell,
GhostBidImport, SellerSignal, BuyerReferral, Pro Trial Seat Grant, Time-Saved
Baseline Model, Match Score, k-Anonymity Floor, Managed Agent, MCP Server,
Skill, Environment, Beta Header, PromotedListing, FeaturedPlacement,
VerificationReviewRecord, MarketplaceDiscoveryRevenueRecord,
SellerOutcomeSignalConfig, SellerOnboardingSession, KB Value Meter,
Stake-Reveal Moment, Hero Moment, Forced-Vendor-Signup, Seller Activation
Metric, Upgrade Carry-Over Guarantee, Honest Portability, On-Platform
Compounding, Marketplace Discovery Pricing.

VERIFICATION
Produce `PHASE12_2_VERIFY.md` listing: terms confirmed, terms added, terms
deprecated. Zero undefined terms is the exit criterion.
```

### Prompt 12.3 — Cross-Reference Integrity

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Grep every `§N.M` reference, every `Appendix X` reference, every entity
reference (e.g., `AIWallet`), every capability_id, every role name. For each:
1. Target exists.
2. Anchor slug matches.
3. No orphan references (reference to deleted or renamed section).

Also:
4. Every "see §X" forward-reference is valid.
5. Every feature in §5.11 Feature Access Matrix has a concrete section
   defining the feature.
6. Every capability in §21.4 Capability Registry has an OutcomeContract
   defined.
7. Every webhook event in §31 appears in Appendix F retry matrix.
8. Every PostHog event in Appendix G has a property schema entry.

VERIFICATION
Produce `PHASE12_3_VERIFY.md` listing: broken refs found, fixes applied.
Zero broken references is the exit criterion.
```

### Prompt 12.4 — Numerical & Limit Consistency

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Compare every numerical limit across the Spec:
- §34 Plan Tier limits
- §39 Object Size Constraints
- §44 Performance Requirements
- §6.8 Retention windows
- §40.2 Data Retention
- §42 SLA commitments
- §29 Notification frequencies
- Inline limits anywhere in feature sections

For every conflict, RESOLVE in favor of the authoritative source:
- Plan tier limits: §34.1
- Object size: §39
- Performance: §44
- Retention: §40.2 + §6.8 (must be consistent with each other)
- SLA: §42.1

Rewrite inline references to cite the source table, not duplicate the number.

VERIFICATION
Produce `PHASE12_4_VERIFY.md`: conflicts found, conflicts resolved, inline
duplications eliminated.
```

### Prompt V12 — Phase 12 Gate

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Confirm all four Phase 12 prompts produced zero-orphan, zero-conflict outputs.
Produce `/Sourcera/_integration/PHASE12_GATE.md` with:
- Exit criteria passed (yes/no per prompt).
- If any criterion failed, what remediation is required.

DO NOT modify the Spec.
```

---

# Phase 13 — Final QA, Version Finalization, TOC

### Prompt 13.1 — Final Engineering Review

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Act as a staff engineer doing a final review pass. Read the Spec end-to-end
and flag:
1. Any data-model entity without at least one API endpoint.
2. Any API endpoint without at least one test case in §46.2.
3. Any new capability without an OutcomeContract and an entitlement row.
4. Any webhook event not in the retry matrix.
5. Any feature referenced in §5.11 without acceptance criteria.
6. Any phase gate without exit validation rules.
7. Any external dependency (WorkOS, Stripe, Convex, Firecrawl, PostHog,
   Loops.so, Anthropic) without a documented failure-mode fallback.
8. Any dollar figure or character limit that appears twice with different
   values.

Produce `/Sourcera/_integration/PHASE13_ENG_REVIEW.md` with findings and
inline fixes applied.

VERIFICATION
Zero findings is the exit criterion.
```

### Prompt 13.2 — Acceptance Criteria Completeness

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
For every §N.M subsection that introduces a user-facing feature, confirm a
numbered Acceptance Criteria block exists (following §13.10 conventions).

For any subsection missing acceptance criteria, author them. Each criterion
must be:
- Observable (a test can run against it).
- Measurable (threshold or boolean).
- Scope-bound (what it covers; what it explicitly does not).

VERIFICATION
Produce `PHASE13_2_VERIFY.md` listing: subsections with added AC, total AC
count before vs. after.
```

### Prompt 13.3 — Table of Contents Regeneration

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Regenerate the Spec's Table of Contents to reflect every new section added in
Phases 1–11. Preserve the existing TOC formatting convention.

Include:
- §48 PLG, Growth Mechanics & Network Effects (including §48.1.7 Three
  Conversion Moments binding, §48.5 M1–M8 Buyer-Side Mechanics, §48.6 M9–M13
  Marketplace Content Mechanics, §48.7 M14–M17 Cross-Console Mechanics,
  §48.8 Seller Hero Moment & Onboarding Anti-Patterns)
- §49 Sourcera Ops Console
- §50 Product Usage Analytics & PLG Instrumentation
- New subsections inside §3, §22 (including §22.18 KB Value Capture), §25,
  §26, §27 (including §27.11 Marketplace Discovery Pricing), §31, §34
  (including §34.14–§34.20), §38
- Seller Onboarding Experience section (§51 or wherever placed)
- Appendix K GTM & Positioning Reference
- Any new Appendix (K+) added during Phase 1.4 (AIOperation state machine)

VERIFICATION
Cross-check: every heading in the body has a TOC entry. Every TOC entry
anchors correctly.
```

### Prompt 13.4 — Version Finalization

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
1. Bump version header from 7.0.0-integration-in-progress → 7.0.0.
2. Update Last Updated date.
3. Set Prior Version: 6.0.0.
4. Set Status: Current.
5. Add a Changelog section at the top of the Spec summarizing:
   - Major new sections (§48, §49, §50, Appendix K)
   - Replaced sections (§34)
   - Major extensions (§21, §22, §25, §27, §26, §3, §38)
   - Breaking changes (token-budget pricing retired)
6. Move `Sourcera_Master_Summary.md` to `legacy-import:_versions/` (it is now
   subsumed by the Master Spec v7.0.0).
7. Move `KB_Engineering_Spec.md` to `legacy-import:_versions/` (it is now
   integrated into §22).
8. Finalize RECONCILIATION.md with a summary table: Phase | Sections Added |
   Sections Modified | Entities Added | Enums Added | Endpoints Added |
   Webhooks Added | Acceptance Criteria Added.

VERIFICATION
Produce `/Sourcera/_integration/PHASE13_FINAL.md` — a one-page executive
summary of the v7.0.0 Master Spec vs. v6.0.0.
```

### Prompt V13 — Full-Spec Acceptance Gate

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Final acceptance gate. Confirm:
1. Master Spec version 7.0.0.
2. Changelog present.
3. Every Phase 1–12 verification file shows exit-criteria-met.
4. Zero orphan enums, zero broken cross-references, zero conflicting numerical
   limits, zero undefined glossary terms.
5. Summary and KB Engineering Spec moved to legacy-import:_versions/.
6. RECONCILIATION.md finalized.
7. `/Sourcera/_integration/PHASE13_FINAL.md` exists.

If any of the above fail, produce a remediation plan — do not mark v7.0.0 as
accepted.

DO NOT modify the Spec.
```

---

# Operator Notes

1. **Estimated duration.** 35 prompts total across 13 phases (3 prompts added in v1.2 for seller pricing integration: 5.1b, 5.1c, 5.1d). Each prompt run on Opus with full-document re-reads and self-challenge + counterfactual passes should be sized at 30–75 minutes. Plan for 22–38 hours of wall-clock work across 3–7 working days. Do not compress — the 1M context window lets Opus reason across the entire Spec, Summary (v1.1), KB Engineering Spec, and both pricing strategies simultaneously, but it does not eliminate the need for careful sequencing.

2. **Model discipline.** Every prompt runs on Opus. Do not mix model tiers. A Sonnet-authored section inside an Opus-authored Spec will fail consistency checks in Phase 12 because the authoring voice, detail depth, and edge-case coverage diverge detectably between tiers.

3. **Fail-safe.** Every phase produces a verification artifact. If any phase fails verification, do not advance — remediate within the phase. Never "carry forward" a known defect. Because you are running Opus, verification prompts are adversarial — they will actively look for reasons to halt. Expect them to find issues even on a well-executed authoring pass; that is the point.

4. **Git discipline.** Commit after every prompt. Tag the repo at phase boundaries (`v7.0.0-phase-1-complete`, etc.). Tag each V prompt as `v7.0.0-phase-N-verified` only after sign-off. This lets you roll back individual integrations without losing later work.

5. **Prompt authorship.** Each prompt is self-contained so it can be copy-pasted into a fresh Cowork session without parent-session context. This is by design — parent context is the most common source of integration drift.

6. **Leveraging Opus's long context.** For any prompt that reads a source document, read it end-to-end before authoring. Opus's 1M-token context accommodates the full Master Spec (~10.5K lines), Summary (~1.4K), KB Engineering Spec (~1.6K), and both pricing strategies (~1K combined) simultaneously — use this. Do not fragment source reads across separate sessions unless a prompt explicitly splits them.

7. **What to do if source documents change mid-integration.** Stop. Re-run Prompt 0.2 (Delta Inventory) against the updated source. Compare the new delta list against the old list in `/Sourcera/_integration/DELTA_INVENTORY.md`. If the delta has shifted materially, rebase the phase plan before continuing.

8. **What to do if Opus wants to extend scope.** Let it, within the prompt's target section. Opus will occasionally identify adjacent gaps (e.g., a missing acceptance criterion in §13 while authoring §34). Record these extensions in RECONCILIATION.md under "Authored Extensions — In-Scope" and proceed. If Opus wants to extend into a section not owned by the current prompt, it must stop and defer to a later phase.

9. **What this program does not do.** It does not regenerate the Master Summary after integration. The Summary is retired to `legacy-import:_versions/` in Phase 13.4. If you need a post-integration summary, author a new one from v7.0.0 — do not resurrect v1.1.

10. **Human review checkpoints.** Despite Opus's depth, this is a v7.0.0 of a business-critical document. Plan for human review at three checkpoints: end of Phase 2 (pricing model rewrite is a breaking change), end of Phase 6 (Ops Console is a new customer-impacting surface), and end of Phase 13 (final acceptance). At each, read RECONCILIATION.md end-to-end and sign off before advancing.

---

*End of Integration Prompt Program.*
