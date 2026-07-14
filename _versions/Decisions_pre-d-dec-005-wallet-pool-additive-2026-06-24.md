# Sourcera v7.0.0 Integration — Pending Decisions & Recommendations

**Date:** 2026-04-15
**Author:** Staff Engineer / Product Strategy (advisory)
**Source:** `_integration/RECONCILIATION.md` — Phases 0–4, Pricing Rewrite Track, Phase 22-Rewrite
**Purpose:** Consolidate every decision that requires human sign-off, with a clear recommendation for each. Organized by urgency and domain. Each recommendation is grounded in source-document evidence and includes the second-order consequences of both action and inaction.

---

## How to Read This Document

Each decision is tagged with:

- **Blocker Level:** `HARD BLOCKER` (code cannot be written correctly), `SOFT BLOCKER` (specific feature blocked), or `NON-BLOCKING` (can ship without, but should resolve before GA).
- **Owner:** Who needs to make the call.
- **Recommendation:** What I would do and why.
- **What the source docs say:** Direct evidence from the pricing strategies, Master Spec, and RECONCILIATION.md.
- **Alternatives considered:** What else was on the table and why I ruled it out.
- **If We Defer:** What happens if we punt — specifically, what breaks, what degrades, and what compounds.

---

## Part 1: Engineering Decisions

These are data model and architecture decisions. Getting them wrong means rework across every layer of the stack. They are ordered by dependency — later decisions depend on earlier ones being resolved first.

---

### E-1. Currency Unit Convention: Dollars vs. Cents

**Blocker Level:** HARD BLOCKER
**Owner:** Engineering Lead
**RECONCILIATION.md ref:** K-V8

**The problem.** Two groups of entities in the same billing pipeline store money differently:

- **Phase 1 entities** (Buyer Referral §4.3.16, Time-Saved Credit §4.3.19, Usage Event §4.3.18) use `Decimal(10,2)` in USD dollars: `credit_value_usd`, `value_saved_usd`, `loaded_hourly_rate_usd`, `ai_value_consumed_usd`.
- **Phase 4 entities** (AIOperation §4.8.1, AIWallet §4.8.3, CommittedSpendContract §4.8.8) use integer USD cents: `cost_base_cents`, `value_price_cents`, `cost_price_cents`, `effective_charge_cents`, `included_budget_cents`, `commit_value_cents`.

These are not isolated systems. They share a billing pipeline: an AIOperation settles against an AIWallet, which reports to a Billing Ledger, which credits a Buyer Referral reward, which adjusts a Time-Saved Credit computation. Every one of those handoffs crosses the dollar/cents boundary.

**What the source docs say.** The Buyer Pricing Strategy §11 defines the pricing formula as `value_price = cost_base × 10` and `cost_price = cost_base × 1.05`. It does not specify the storage unit. The Master Spec §4.8.1 implements this as integer cents (`cost_base_cents × 10`). Phase 1 entities were authored before Phase 4 established the cents convention. The RECONCILIATION.md K-V8 finding states: "Phase-1 fields should be retroactively migrated to cents or the divergence explicitly tolerated."

**Recommendation: Standardize on integer cents. Migrate Phase 1 fields.**

The reasoning is layered:

First, integer cents eliminates floating-point rounding errors. `Decimal(10,2)` is safe for simple addition, but the billing pipeline includes multiplication (hourly rate × hours = value saved), division (cost-base recalculation), and percentage computation (wallet utilization thresholds at 50%, 80%, 100%). Each of those operations on Decimal types can produce values that don't fit cleanly into two decimal places. Integer cents sidesteps this entirely — you compute in integers and format for display at the UI layer.

Second, integer cents is what Stripe uses. Every charge, refund, credit note, and invoice line item in the Stripe API is denominated in the smallest currency unit (cents for USD). The AIWallet already carries a `stripe_subscription_id` and `stripe_customer_id`. Every Stripe integration touchpoint — auto-topup charges, subscription invoicing, credit notes for contest approvals, committed-spend contract invoicing — will require a conversion if the internal representation doesn't match Stripe's. That conversion is one more place for a 100× bug.

Third, Phase 1 has fewer downstream dependencies than Phase 4. Phase 4 entities are the foundation of the entire billing surface: §34 Plan Tiers, §34.8 Entitlement Enforcement, §34.10 AI Wallet Service, §34.11 Outcome Resolver, §34.12 Cross-Side Billing. Migrating Phase 4 to match Phase 1 would mean rewriting the pricing formula, the wallet state machine, the contest credit logic, and the committed-spend discount bands. Migrating Phase 1 to match Phase 4 means changing ~8 fields across 4 entities.

**Migration specifics.** Rename fields from `*_usd` to `*_cents` (breaking change to any API consumer, but no API endpoints are authored yet for these entities per K-V9 — so the window is open). Change column type from `Decimal(10,2)` to `BigInt`. Multiply existing values by 100. Update the 5 acceptance criteria that reference dollar amounts to reference cent amounts. Update Appendix K glossary entries. Estimated spec delta: ~40 lines of field-table changes + ~20 lines of acceptance-criteria updates.

**Alternatives considered.**

- *Tolerate the divergence with a conversion layer.* This is the "we'll just multiply by 100 at the boundary" approach. It works until someone forgets the conversion, or applies it twice, or applies it in the wrong direction. In a billing system, "works until someone forgets" is not an acceptable risk posture. Every payment processor, every fintech framework, and every accounting standard recommends against mixed-unit monetary storage in the same pipeline.
- *Migrate Phase 4 to Decimal(10,2) dollars instead.* This would align everything on dollars, but it contradicts Stripe's API convention and introduces rounding risk in the pricing formula. The formula `cost_base × 10` is clean in integers; in decimals, it produces values like `$0.0105 × 10 = $0.105` which must then be rounded to `$0.11` or `$0.10` — a 5% rounding error on a single operation that compounds across thousands of operations per day.

**If we defer.** Every developer touching billing code must mentally track which convention each field uses. The type system won't catch it — both are numeric types that compile and run without error. The bug manifests as a 100× overcharge or undercharge on a customer invoice, a wallet that shows $3.00 when it should show $300.00, or a Time-Saved Credit that reports "$15,000 saved this month" when the actual figure is $150. These bugs are silent in development and testing (where small numbers make the ×100 error less obvious) and catastrophic in production (where real dollar amounts make it customer-visible).

---

### E-2. Organization Plan Tier Field Split

**Blocker Level:** HARD BLOCKER
**Owner:** Engineering Lead + Sales-Ops
**RECONCILIATION.md ref:** Phase 4 Known Gaps, Pricing Rewrite Track Breaking Changes

**The problem.** The v6.0.0 `Organization` entity (§4.2.1) has a single `plan_tier` field with three values: `free`, `business`, `enterprise`. The v7.0.0 pricing model requires per-console plan activation. The Seller Pricing Strategy §11 is explicit: "Plans activate per console, not per Org. An Org can hold (Buyer Growth + Seller Starter), (Buyer Free + Seller Scale), etc." This means a single `plan_tier` field cannot represent the state space.

**What the source docs say.** The Master Spec §34.1.3 already defines the new enum values: buyer-side (`buyer_free`, `business_starter`, `business_growth`, `business_scale`, `buyer_enterprise`) and seller-side (`seller_free`, `seller_starter`, `seller_growth`, `seller_scale`, `seller_enterprise`). The RECONCILIATION.md Breaking Changes section logs the split as: "v6.0.0 holds a single `plan_tier ∈ {free, business, enterprise}` per Org. Per BPS §13 / SPS §11 / MS §2, plans activate per-console." The Pricing Rewrite Track Known Gaps section adds: "Either split the `Organization.plan_tier` field or introduce an `OrgConsolePlan` entity. Pricing Rewrite Track recommends the per-field split for read-path simplicity."

Two options:

- **(A) Split the field:** Add `buyer_plan_tier` and `seller_plan_tier` directly on Organization. Deprecate `plan_tier`.
- **(B) Junction entity:** Create an `OrgConsolePlan` table with `(org_id, console, plan_tier)` rows.

**Recommendation: Option A — split the field.**

The core argument is that this is not a variable-length relationship. An Org will always have exactly two console plans — buyer and seller. Never one, never three. That's the kind of cardinality that belongs as fields on the parent entity, not as rows in a junction table. Option B's normalization is technically correct but adds a join to every entitlement check, every feature gate, every plan-comparison query, and every Convex reactive subscription. In Convex specifically, reactive queries on a single document are cheap; reactive queries across a join require a subscription to both tables and a client-side merge, which doubles the subscription cost and introduces a consistency window where the two documents can be out of sync.

The downstream impact of this decision is wide: §5.11 Feature Access Matrix reads `plan_tier` to gate every feature. §34.8 Entitlement Enforcement reads it on every AIOperation. §39 Object Size Constraints reads it to enforce per-plan limits. §34.10 Wallet Service reads it to compute the included budget. Every one of these hot paths benefits from the field being on the Organization document directly.

**Migration specifics.** Backfill: set `buyer_plan_tier = <old plan_tier>` and `seller_plan_tier = seller_free` for all existing Orgs. (Rationale: v6.0.0 had no seller console, so every existing Org is effectively seller-free.) Deploy: add both new fields alongside the old `plan_tier` field. Run a dual-write period where any plan change writes to both old and new fields. Cut over: migrate reads one surface at a time (start with §34.8 entitlement enforcement, then §5.11, then §39, then billing UI). Deprecate: remove `plan_tier` after all reads are migrated. The old three-value enum (`free`, `business`, `enterprise`) gets a successor mapping per Appendix J convention: `free → buyer_free`, `business → business_growth` (per BPS §13 grandfather rule), `enterprise → buyer_enterprise`.

**Alternatives considered.**

- *Option B, junction entity.* More normalized, but the join cost is real and the normalization buys nothing for a fixed-cardinality relationship. If Sourcera ever introduced a third console, Option B would be better — but that's speculative, and "optimize for speculative future states" is how you end up with over-engineered data models that are slower and harder to reason about for the state space you actually have.
- *Single field with compound values (e.g., `buyer_growth__seller_starter`).* This avoids a schema change but makes every plan-tier comparison a string-parse operation, breaks enum validation, and produces a combinatorial explosion of values (5 buyer × 5 seller = 25 compound values, each of which needs to be registered in Appendix J and handled in every switch statement). Categorically worse than either A or B.

**If we defer.** No entitlement check can be implemented. No feature gate can be built. No Stripe subscription can be created. No billing UI can render a plan name. The entire §34 surface — the largest single section in the Master Spec — is blocked. Every sprint that passes without this decision is a sprint where billing engineers are either idle or building against an assumption that may be wrong.

---

### E-3. Dangling Foreign Key References (Phase 1)

**Blocker Level:** HARD BLOCKER
**Owner:** Engineering Lead
**RECONCILIATION.md ref:** K-V1

**The problem.** Phase 1 introduced FK references and enum values pointing at four entities that don't exist in §4 yet:

- **Selection Report Draft** — consumed by `internal_comment_attached_to_type` enum. Internal Comments can be attached to Selection Report drafts (the document a buyer team produces at Phase 12 of an evaluation to summarize vendor scores and recommend a winner). The entity is described procedurally in §26 but has no formal §4 definition.
- **Inbox Item Group** — consumed by `unread_marker_thread_type` enum. Unread Markers track read state for three thread types; one of them is Inbox Item Groups. The Inbox is described in §20.7.1 but has no formal §4 entity.
- **Target Account** — consumed by `Pro Trial Seat Grant.issuing_target_account_id`. A Target Account is the buyer's internal record of a vendor they're evaluating. It exists conceptually in §14 (Vendor Curation UX) but has no formal §4 entity.
- **Attachment** — consumed by `Internal Comment Post.attachment_ids`. File attachments are referenced across multiple features but have no unified §4 entity.

**What the source docs say.** RECONCILIATION.md K-V1 states: "Resolution: author placeholder §4 entries with forward-references. Owner: Integration program (Phase 1.5 targeted rework)."

**Recommendation: Author placeholder entity stubs in §4 with forward-reference markers.**

Each stub needs: entity name, scope classification, a minimal field table (`id UUID PK`, `org_id UUID FK`, `created_at`, `updated_at`, `deleted_at`), the specific FK consumers that reference it, and a note: "Full entity definition pending Phase N — this stub exists to satisfy FK constraints and enum validation from §4.3.x Phase 1 entities."

This approach unblocks three things simultaneously: (1) database migration tooling can generate valid schemas, (2) enum validators accept the values, and (3) test fixtures can create the referenced entities. It does not commit to the full entity design — the stub is explicitly marked as incomplete.

**Why not just remove the references instead?** Because the references are correct. Internal Comments *should* be attachable to Selection Report drafts — that's the primary use case (buyer teams discussing the draft before finalizing). Unread Markers *should* track Inbox Items — that's the notification surface. Removing the references to avoid the dangling FK would mean re-adding them later, which is a migration on a table that already has data.

**If we defer.** Database migration for Phase 1 entities fails at the FK constraint step. Workaround: make the FKs nullable and skip validation. But that means the FKs are unenforced, which means orphaned records accumulate silently, which means data quality degrades in a way that's expensive to repair once the real entities are authored.

---

### E-4. Event Taxonomy Whitelist Gaps (Phase 1)

**Blocker Level:** HARD BLOCKER
**Owner:** Engineering Lead
**RECONCILIATION.md ref:** K-V2

**The problem.** Usage Events (§4.3.18) use a write validator that enforces a whitelist lookup against Appendix G (PostHog Event Taxonomy). The validator rejects any event whose `event_name` is not registered in Appendix G. Phase 1 introduces new event names (`internal_comment.thread.created`, `internal_comment.thread.resolved`, `buyer_referral.credit_issued`, `buyer_referral.credit_redeemed`, `pro_trial_seat.granted`, `pro_trial_seat.converted`, `pro_trial_seat.auto_downgraded`, `usage_event.dlq_threshold_crossed`) that are not registered.

**What the source docs say.** The Master Spec §4.3.18 states the validator rule explicitly: events not in the Appendix G registry are rejected at write time. RECONCILIATION.md K-V2 states: "Any Phase-1 Usage Event emitted with a new `event_name` fails the §4.3.18 write validator because the Appendix G registry enforces whitelist lookup. Ship-blocker for Phase 1 entity UX."

**Recommendation: Register all Phase 1 event names in Appendix G immediately.**

This is pure spec authoring with no design ambiguity. Each event needs: event name, property schema (which fields are carried), PostHog event type (`track` or `identify`), and PII classification (for the `skipped_pii_blocked` DSAR-aware mirror skip that §4.3.18 already defines). The property schemas can be derived mechanically from the entity field tables — `internal_comment.thread.created` carries `thread_id`, `workspace_id`, `attached_to_type`, `attached_to_id`, `created_by_user_id`.

Estimated spec delta: ~60 lines of Appendix G additions (8 events × ~7 lines each).

**If we defer.** Every Phase 1 feature that emits usage events is non-functional. Internal Comment creation, Buyer Referral credit issuance, Pro Trial Seat grants — all of these fire usage events as part of their write path. If the validator rejects the event, the behavior depends on whether the write path treats the rejection as fatal (transaction rolled back, feature broken) or non-fatal (event silently dropped, analytics blind spot). Neither outcome is acceptable.

---

### E-5. Missing Database Indexes (Phase 1)

**Blocker Level:** HARD BLOCKER (for billing-grade and PLG-surface claims)
**Owner:** Engineering Lead
**RECONCILIATION.md ref:** K-V3

**The problem.** Five Phase 1 entities lack indexes required for the performance claims the spec makes. The specific gaps:

- **§4.3.11 Internal Comment Thread** needs a GIN index on `subscribed_user_ids` (array field). Without it, "show me all threads I'm subscribed to" is a sequential scan across every thread in the workspace. For a workspace with 500 threads (the Business plan cap per C.119), this is ~500 document reads per page load.
- **§4.3.16 Buyer Referral** needs `(LOWER(referee_email), status)`. The Referee Exclusivity Rule (§4.3.16 — first-to-activate wins) requires a uniqueness check on referee email at `credit_issued` time. Without a case-insensitive index, the check is a sequential scan that's also vulnerable to the K-V7 race condition.
- **§4.3.17 Pro Trial Seat Grant** needs `(buyer_org_id, vendor_org_id, created_at DESC)`. The 365-day same-buyer-vendor rate limit (§34.13.5 restriction #1) requires looking up the most recent grant for a buyer-vendor pair. Without this index, the lookup is a full-table scan filtered by two FKs.
- **§4.3.18 Usage Event** needs either a per-capability-per-day aggregate table or a nightly-batch caveat. The spec claims "sub-100ms" dashboard rendering for per-capability usage charts. Raw Usage Events at scale (thousands per day per Org for active evaluations) cannot be aggregated in real-time within that budget.
- **§4.3.19 Time-Saved Credit** needs `(org_id, recognized_at) WHERE reversed_by_credit_id IS NULL` as a partial index. The spec's aggregation rule is `SUM(value_saved_cents) WHERE reversed_by_credit_id IS NULL` — without a partial index, every aggregation query scans reversed credits only to discard them.

**Recommendation: Author all five indexes in the Phase 1.5 rework, with a design note on the Usage Event aggregate.**

The first four are straightforward index additions to the entity definitions. The Usage Event aggregate requires a design choice: I recommend a nightly materialized aggregate table (`UsageEventDailyAggregate`) with `(org_id, capability_id, date, event_count, total_value_cents)` that the dashboard reads from. The raw Usage Event table remains the audit-grade source of truth; the aggregate is the performance-optimized read model. This is a standard CQRS pattern and avoids the cost of a real-time streaming aggregation pipeline for what is fundamentally an analytics surface (billing runs through AIOperation, not Usage Event).

**If we defer.** The PLG dashboard (the surface that shows buyers "here's how much time Sourcera saved you this month") loads slowly for active Orgs. The referral credit check has a race condition. The Pro Trial Seat rate limit can be bypassed by timing. None of these are visible in development (small data sets), all of them are visible in production (real data volumes).

---

### E-6. `chain_correlation_id` on AIOperation

**Blocker Level:** SOFT BLOCKER (blocks Ghost-Bid Importer journey tracking)
**Owner:** Engineering + Finance
**RECONCILIATION.md ref:** Phase 22-Rewrite Continuation Known Gaps

**The problem.** The Ghost-Bid Importer (§4.4.17 GhostBidImport, §22.14.4) chains three AI sessions into one customer-facing journey: (1) parse the imported document, (2) extract and validate Q&A pairs, (3) write entries to the KB. Each session creates its own AIOperation. When a seller asks "why did this import cost $X?", Support needs to trace all three operations back to the single import.

**What the source docs say.** §22.14.4 describes the chaining: "Ghost-Bid Importer flow chains three sessions into one customer-facing journey; the correlation primitive is referenced but not yet on the §4.8.1 entity table." The field is proposed as `chain_correlation_id UUID NULL`.

**Recommendation: Add the field.**

The cost is near-zero: one nullable UUID column, one sparse index (`(chain_correlation_id) WHERE chain_correlation_id IS NOT NULL`), no migration on existing rows (all null). The value is high: it enables `SELECT * FROM ai_operations WHERE chain_correlation_id = :id` to answer "show me every operation in this import chain" — a query that Support, Finance (for cost attribution), and the customer-facing Billing Ledger all need.

Without it, the alternative is correlating by `(org_id, capability_id, created_at)` with a time window, which is fragile (two imports started seconds apart produce overlapping windows) and doesn't work when the three sessions span different capabilities (parse uses `ghost_bid_parse`, validation uses `kb_dedupe_check`, write uses `kb_entry_draft_create`).

**If we defer.** Ghost-Bid Importer cost attribution becomes a log-correlation exercise. Supportable for the first 100 imports; unsupportable at scale. Adding the field later requires a migration on the AIOperation table, which by then will be one of the highest-write-volume tables in the system.

---

### E-7. Seller-Visible Projection of `estimated_total_value_usd`

**Blocker Level:** SOFT BLOCKER (blocks high-stakes first-pass routing)
**Owner:** Console Bridge owner + Engineering
**RECONCILIATION.md ref:** Phase 22-Rewrite Continuation Known Gaps

**The problem.** The KB rewrite introduces a `first_pass_high_stakes` classification (§22.9.6) that decides whether to route a first-pass bid response to Opus (~5× cost, higher quality) or Sonnet (cheaper, adequate for most bids). The classification needs the bid workspace's estimated total value to distinguish a $50K mid-market deal from a $5M enterprise deal. That field (`estimated_total_value_usd`) exists on the buyer side but is currently NOT in the seller-visible projection of the `bid_workspace_opened` Console Bridge Event (§4.7.1).

**What the source docs say.** §4.7.1 defines a per-event-kind redaction whitelist (Fields CARRIED vs. Fields NEVER CARRIED). The `bid_workspace_opened` event does not carry `estimated_total_value_usd` in its seller-visible projection. §22.9.6 states: "§23 BidWorkspace `estimated_total_value_usd` exposure on seller-side reads — the bridge schema needs to confirm the field is in the seller-visible projection (it currently is NOT)."

The Dual-Console Firewall (§7.2) exists to prevent buyer intelligence from leaking to sellers. Estimated deal value is buyer intelligence — it reveals the buyer's budget, which gives the seller a negotiation advantage.

**Recommendation: Do not expose the exact dollar value. Instead, derive a coarsened `deal_size_band` server-side and carry that across the bridge.**

Define four bands: `standard` (<$100K), `midmarket` ($100K–$500K), `enterprise` ($500K–$2M), `strategic` (>$2M). The server computes the band from `estimated_total_value_usd` at bridge-event emission time; the seller side never sees the underlying number. The high-stakes classifier routes on band: `enterprise` and `strategic` get Opus; `standard` and `midmarket` get Sonnet.

This preserves the firewall's intent (sellers don't learn the buyer's exact budget) while giving the classifier enough signal to route correctly. The bands are coarse enough that a seller knowing "this is an enterprise deal" doesn't give them meaningful pricing leverage — they'd already know that from the buyer's company size and the scope of requirements.

**Alternatives considered.**

- *Expose the exact dollar value.* Violates the Dual-Console Firewall's design intent. The firewall exists specifically to prevent this kind of intelligence leakage. Even if we gate it to "system use only" (not shown in seller UI), the field would be in the Console Bridge Event payload, which means it's in the webhook payload, which means any seller with a webhook integration can read it.
- *Don't expose anything; route all first-pass to Sonnet.* Safe but forfeits quality on high-value bids. A $5M enterprise procurement getting the same AI response quality as a $20K SMB purchase is a missed opportunity to differentiate on value.
- *Use buyer company size instead of deal value.* Imprecise. A Fortune 500 company buying a $30K SaaS tool is not a high-stakes bid; a 200-person company running a $2M platform migration is. Deal value is the right signal; company size is a weak proxy.

**If we defer.** High-stakes routing doesn't work. All first-pass responses get Sonnet. This is an acceptable launch state (see C-5) but should be resolved before the Opus opt-in feature ships.

---

### E-8. Anthropic MCP Server Rate Limit Confirmation

**Blocker Level:** SOFT BLOCKER (blocks MCP server deployment config)
**Owner:** Engineering
**RECONCILIATION.md ref:** Phase 22-Rewrite Continuation Known Gaps

**The problem.** §22.13.1 authors a rate-limit matrix for `mcp.sourcera.com` with targets of 60 rps (burst 120) per server. These are targets, not confirmed quotas — they need validation against Anthropic's actual per-MCP-server limits for Managed Agents.

**Recommendation: Treat this as a pre-launch engineering task, not a spec decision.**

Rate limits are configuration, not architecture. The MCP server's internal design doesn't change whether the limit is 30 rps or 120 rps — the difference is a config value in the rate limiter. Set conservative defaults at launch (30 rps / burst 60), instrument request-rate monitoring, and adjust after confirming with Anthropic's documentation or support team.

The spec should document the limits as: "Initial deployment targets: 30 rps sustained / 60 rps burst. Subject to Anthropic per-MCP-server quota confirmation. Target steady-state: 60 rps / 120 rps burst."

**If we defer.** Low risk if we launch conservatively. The worst case is that we set the limit at 60 rps, Anthropic's quota is lower, and MCP tool calls start returning 429 errors in production. Conservative launch avoids this entirely.

---

### E-9. KBSubstrateVersion: Formal Entity or Internal-Only

**Blocker Level:** NON-BLOCKING
**Owner:** Engineering + Data
**RECONCILIATION.md ref:** Phase 22-Rewrite Continuation Known Gaps

**The problem.** §22.9.2 introduces a substrate-version pinning record that tracks which embedding model version each KB entry was vectorized with. When Sourcera bumps the embedding model (§22.4.5), this record determines which entries need re-indexing. The question is whether this record should be a formal entity in §22.3 (with field table, indexes, retention rules, DSAR rules) or an engineering-internal implementation detail.

**Recommendation: Keep it engineering-internal.**

The record has no customer-facing surface (sellers never see it), no billing implications (re-indexing is `sourcera_owned` cost center), and no PII (it contains model version identifiers and entry IDs, not user data). The DSAR path is trivial (no PII to redact or export). Adding it to §22.3 as a formal entity creates ~50 lines of spec that must be maintained, versioned, and reviewed on every change — overhead that doesn't serve any consumer of the spec (product, design, QA, leadership).

Document it in the engineering runbook for the KB indexing pipeline. If it ever gains a customer-facing surface (e.g., "show me which entries are on the latest embedding model"), promote it to a formal entity at that point.

**If we defer.** No impact. The substrate-version pinning works identically regardless of whether the spec formally describes the record.

---

### E-10. Phase 1 Sign-Off: Rework vs. Defer

**Blocker Level:** HARD BLOCKER (spec-integration gate)
**Owner:** Integration Program Lead
**RECONCILIATION.md ref:** Phase 1 Sign-off status: NOT GRANTED; `_integration/PHASE1_VERIFY.md` §4

**The problem.** The adversarial verification pass found 13 gaps (K-V1 through K-V13). RECONCILIATION.md explicitly states: "Do not advance to Phase 5 until resolved or formally deferred." The two options:

- **(A) Phase 1.5 targeted rework** — fix K-V1 through K-V5 and K-V8 now (~400–700 lines of spec authoring). Defer K-V4, K-V6, K-V7, K-V9, K-V10, K-V11, K-V12, K-V13 to Phase 13.
- **(B) Formal deferral** — leadership signs off on deferring all 13 gaps to Phase 13, and Phases 5+ proceed on the current foundation.

**Recommendation: Option A — do the Phase 1.5 rework now, but scope it to the six items that are hard blockers or data-model integrity issues.**

The six items to fix now:

1. **K-V1 (Dangling FKs)** — see E-3 above. Hard blocker.
2. **K-V2 (Event taxonomy gaps)** — see E-4 above. Hard blocker.
3. **K-V3 (Missing indexes)** — see E-5 above. Hard blocker for performance claims.
4. **K-V5 (Author Role Snapshot enum unregistered)** — violates Authoring Convention #3 (every enum in Appendix J). Five minutes to fix; no reason to defer.
5. **K-V8 (Currency collision)** — see E-1 above. Hard blocker.
6. **K-V13 (Billing Admin forward-reference)** — just needs a Known Gap annotation in the Phase 1 entity definitions. Five minutes.

The seven items safe to defer to Phase 13:

- K-V4 (DSAR mechanism gaps) — important but not blocking code. DSAR compliance is a pre-GA requirement, not a pre-Phase-5 requirement.
- K-V6 (Parent-purge renderer) — edge case for long-retained entities whose parents are deleted. Real but rare; can be handled with a "deleted parent" placeholder at the render layer.
- K-V7 (Referee exclusivity race) — the race window is narrow (two simultaneous `activated → credit_issued` for the same email). Add an advisory lock or partial unique index, but it doesn't block anything else.
- K-V9 (IP hash weakness) — security improvement, not a functional blocker. SHA-256 of IPv4 is brute-forceable but the field is analytics-grade, not auth-grade.
- K-V10 (Unread count under soft-delete) — UX edge case. Define the behavior (decrement on soft-delete, or not) but it doesn't block other features.
- K-V11 (Section citation error) — a typo. §4.3.15 cites "§29.1 Inbox Feed Schema" but the Inbox is at §20.7.1. Fix the citation.
- K-V12 (Dual-projection ambiguity for self-referencing Org) — the case where a company evaluates itself. Rare but realistic for resellers. Define the tiebreaker but it doesn't block the common case.

**Estimated cost of Phase 1.5:** 400–500 lines of spec authoring (the lower end, since we're scoping to 6 items not 13). One working session. The remaining 7 items add ~200–300 lines when addressed in Phase 13.

**If we defer the whole set.** Phases 5–13 build on a foundation with known data-model defects. The currency collision (E-1) propagates into every billing UI built in Phases 5+. The dangling FKs (E-3) propagate into every migration. The missing event taxonomy entries (E-4) mean Phase 1 features are non-functional until they're fixed — but now they're non-functional with 8 more phases of code depending on them. Technical debt compounds; fixing it later costs more than fixing it now.

---

## Part 2: Commercial & Business Model Decisions

These affect how money flows through Sourcera. They are more easily changed post-launch than data model choices, but the wallet pooling rules (C-1, C-2) are hard blockers because the AIWallet implementation literally cannot compute a balance without knowing the rule.

---

### C-1. Free+Free Wallet Pool Collapse Rule

**Blocker Level:** HARD BLOCKER (wallet pooling logic cannot be implemented)
**Owner:** Sales-Ops + Founder
**RECONCILIATION.md ref:** Pricing Rewrite Track Known Gaps

**The problem.** If a customer activates both consoles on Free plans, does their AI budget combine into a single pool or stay separate?

- **Free Buyer:** $5/mo included AI budget (BPS §3)
- **Free Seller:** $5/mo included AI budget (SPS §3)
- **Combined?** $10/mo single pool, or two $5 pools?

**What the source docs say.** The Seller Pricing Strategy §11 is unambiguous on the *mechanism*: "AI budgets are Org-scoped and pooled across consoles. If an Org has Buyer Growth ($300 budget) and Seller Starter ($30 budget), it has $330 of unified AI budget." But the example uses Paid+Paid. It does not give a Free+Free example. The Master Spec §34.10.3 (Pooled Budget Across Consoles) says the wallet is always Org-scoped and always pooled — there is no carve-out for Free plans. §4.8.3 AIWallet authoring intent: "AIWallet is the org-scoped, console-pooled value-dollar account... the wallet is explicitly Org-scoped and pooled."

The RECONCILIATION.md flags this as a Known Gap because, despite the source docs implying collapse is the default (since the wallet is always pooled), the specific Free+Free case has financial implications that the pricing team may want to decide explicitly.

**Recommendation: Collapse to a single $10 pool.**

The reasoning:

1. **Consistency with the pooling rule.** SPS §11 says budgets pool. The wallet is Org-scoped. Carving out an exception for Free+Free creates a conditional branch in the wallet logic ("pool if either plan is paid, don't pool if both are free") that adds complexity for no revenue benefit. Free customers pay $0. The $5 difference between two $5 pools and one $10 pool has no revenue impact.

2. **PLG activation incentive.** Sourcera's growth model depends on buyers discovering the seller console (or vice versa). A unified $10 pool is more generous than two $5 pools and encourages experimentation on the second console. A buyer who's used $4 of their $5 buyer budget still has $6 to try seller features — that's a smoother cross-console activation path than hitting a $5 wall and seeing a separate, untouched $5 pool they can't access from the current console.

3. **UX simplicity.** One wallet, one balance bar, one overage threshold. The alternative — two balance bars, one per console, with the user needing to understand why their "buyer budget" and "seller budget" are separate — creates a support burden and a confusing first-time user experience.

**Risk assessment.** Could a customer game this by activating both consoles just to get $10 instead of $5? Yes, but the effort is trivial (click "Activate Seller Console") and the cost to Sourcera is $5/mo in AI compute — far less than the customer acquisition cost. If gaming becomes systemic, the remedy is to reduce the Free tier budget, not to complicate the pooling logic.

**If we defer.** The wallet balance computation has an undefined branch. The AIWallet entity has a single `included_budget_cents` field — what value does the system write when both consoles are Free? If it writes $5 (ignoring the second console), the customer loses $5 of expected budget. If it writes $10 (assuming collapse), the decision has been made implicitly by an engineer, not by Sales-Ops.

---

### C-2. Free+Paid Wallet Pool Collapse Rule

**Blocker Level:** HARD BLOCKER (same wallet pooling logic)
**Owner:** Sales-Ops + Founder
**RECONCILIATION.md ref:** Pricing Rewrite Track Known Gaps

**The problem.** If a customer is Buyer Growth ($300/mo) + Seller Free ($5/mo), does the wallet show $305 or $300+$5?

**What the source docs say.** SPS §11 example: "If an Org has Buyer Growth ($300 budget) and Seller Starter ($30 budget), it has $330 of unified AI budget." This uses Paid+Paid but the language ("unified AI budget") suggests all combinations collapse. Master Spec §34.10.3 does not carve out Free+Paid as a special case.

**Recommendation: Collapse to a single $305 pool.**

The reasoning is the same as C-1, with an additional consideration: the Free-tier $5 addition is *below the noise floor* of the paid plan's budget. $5 is 1.7% of $300. No customer will notice whether their wallet says $300 or $305. But if we *don't* collapse, the customer sees two separate pools in the UI, which raises the question "why do I have two budgets?" — a question that has no satisfying answer other than "legacy architecture."

**Downgrade guardrail.** If the customer downgrades the paid console (Buyer Growth → Buyer Free), the wallet budget drops to Free+Free pool ($10). If they cancel the seller console entirely, the wallet drops to Buyer Free ($5). §34.10.6 already describes this behavior: "On downgrade, the wallet's included_budget_cents is recalculated from the new plan-tier combination." This is clean as long as the collapse rule is defined.

**If we defer.** Same as C-1 — undefined branch in the wallet balance computation.

---

### C-3. Anti-Probing No-Refund Rule (Pro Trial Seats)

**Blocker Level:** NON-BLOCKING (Pro Trial Seats gate behind Scale/Enterprise plans)
**Owner:** Sales-Ops
**RECONCILIATION.md ref:** Pricing Rewrite Track Known Gaps (§34.13.5)

**The problem.** If a buyer grants a Pro Trial Seat to a vendor and the vendor never uses it (declines or ignores the invite), does the buyer get the allocation back?

**What the source docs say.** The Master Spec §4.3.17 defines partial behavior: if the vendor declines (`status = vendor_declined`), the pool seat is *not* restored ("the buyer has already used the slot meaningfully"). If the vendor never signs up within the 30-day invite TTL (`status = expired_unaccepted`), the pool seat *is* restored ("the grant never activated"). But the RECONCILIATION.md flags the broader "no-refund" framing as an Authored Extension — the source docs define per-status behavior but don't state a general principle.

**Recommendation: Codify the per-status behavior already in §4.3.17 as the general rule, with one clarification.**

The rule should be: **allocation is consumed when the vendor is notified; restored only if the vendor was never notified.**

| Status                                          | Vendor Notified? | Allocation Restored? | Rationale                                    |
| ----------------------------------------------- | ---------------- | -------------------- | -------------------------------------------- |
| `issued` (buyer revokes before invite sent)     | No               | Yes                  | Grant never left the buyer's control         |
| `invite_sent` (buyer revokes after invite sent) | Yes              | No                   | Vendor saw the invite; buyer signaled intent |
| `provisioned` / `in_trial` (vendor accepted)    | Yes              | No                   | Trial is active                              |
| `vendor_declined`                               | Yes              | No                   | Vendor made an active decision               |
| `expired_unaccepted` (30-day TTL)               | Yes              | No                   | This is where I diverge from §4.3.17         |

**Divergence from §4.3.17 on `expired_unaccepted`.** The current spec restores the seat on expiry. I recommend *not* restoring it. Reasoning: a 30-day invite that goes unanswered is still a market signal (this vendor doesn't engage with trial offers from this buyer). Restoring the seat incentivizes spray-and-pray behavior: grant seats to 20 vendors, let the non-responders expire, get the seats back, grant to 20 more. That's the probing behavior the anti-probing rule is meant to prevent.

Exception: if the buyer revokes before the invite email is sent (status = `issued`, the email job hasn't run yet), restore the seat. The vendor was never aware of the grant.

**If we defer.** Pro Trial Seats are a Scale/Enterprise feature — not in the initial launch. But the allocation accounting logic needs the rule before the feature ships. Low urgency.

---

### C-4. Ops Override on Pro Trial Seat Allocation

**Blocker Level:** NON-BLOCKING
**Owner:** Sales-Ops
**RECONCILIATION.md ref:** Pricing Rewrite Track Known Gaps (§34.13.2)

**The problem.** Can the Ops team temporarily increase a buyer's monthly Pro Trial Seat allocation for specific evaluation cohorts?

**What the source docs say.** The spec authors this as an Authored Extension: "Ops Pricing Admin override of Pro Trial Seat allocation — allows time-boxed allocation increases for specific evaluation cohorts." It's not in BPS or SPS.

**Recommendation: Yes, with four guardrails.**

1. **Role-gated:** `ops_pricing_admin` only. Not `org_admin`, not `billing_admin`.
2. **Time-boxed:** Maximum 90-day override window. Auto-reverts to plan default at expiry.
3. **Audited:** Every override creates an audit event with the justification text, the requesting Sales rep, and the customer Org.
4. **Capped:** Override cannot exceed 3× the plan default. If Scale includes 5 seats/month, the override maximum is 15. Beyond that, the customer should be on Enterprise with a custom contract.

This is a standard enterprise sales lever. Every B2B SaaS product with per-plan feature limits has an Ops override path. The alternative — telling a $2M/year Enterprise prospect "sorry, you can only trial 5 vendors this month because that's what the plan says" — loses deals.

**If we defer.** Enterprise buyers who need more seats go through a manual process (Slack message → Sales-Ops → manual database edit). This works for the first 10 overrides; it becomes a support burden at 50+.

---

### C-5. High-Stakes First-Pass Seller Opt-In Toggle

**Blocker Level:** NON-BLOCKING
**Owner:** Sales-Ops + Product
**RECONCILIATION.md ref:** Phase 22-Rewrite Continuation Known Gaps (§22.16.8 Open Item #8)

**The problem.** Routing high-stakes first-pass bid responses to Opus costs ~5× more than Sonnet. Should sellers be able to opt into Opus-quality responses for high-value bids?

**What the source docs say.** §22.9.6 defines the `first_pass_high_stakes` classification with three inputs: `bid_value_estimate_usd` (deal size), `compliance_critical` tag (regulated industries), and a seller opt-in toggle. The opt-in toggle is flagged in §22.16.8 Open Item #8: "Routing high-stakes First-Pass to Opus is ~5× cost; the seller-facing copy and pricing communication need Sales-Ops review before release."

The Seller Pricing Strategy §3 does not mention an Opus tier or a per-operation model-quality toggle. The pricing model (value_price = cost_base × 10) already accounts for model tier via the `model_tier` dimension on CapabilityRegistryEntry — Opus operations have a higher `cost_base_cents` than Sonnet operations, so the customer naturally pays more. But the seller needs to understand *why* their bill is 5× higher for certain operations.

**Recommendation: Ship without the toggle initially. Route all first-pass to Sonnet.**

Three reasons:

1. **The classifier needs production data.** §22.9.6's deal-size bands and compliance tags are theoretical until real bids flow through the system. The thresholds that distinguish "high-stakes" from "standard" should be calibrated on actual bid-value distributions, not guesses. Ship Sonnet-for-all, instrument the classifier's *would-have* decisions (log what it would route to Opus without actually doing it), and calibrate over 60–90 days.

2. **Pricing communication is hard to get right.** "Your AI response cost $0.45 this time but $2.25 last time because we used a better model" requires clear, proactive communication. The wallet UI needs a model-tier breakdown. The per-operation detail view needs to show which model was used and why. The seller's billing page needs to explain the cost delta. None of this UI exists yet.

3. **The upside is small at launch.** First-pass response quality is primarily a function of KB quality, not model quality. A well-curated KB produces good responses on Sonnet; a poorly curated KB produces mediocre responses on Opus. The model tier matters most for nuanced, multi-document synthesis — which is the *Q&A agent's* job, not the first-pass agent's. The first-pass agent is filling in structured fields from KB entries; Sonnet is more than capable.

**When to introduce the toggle.** After you have 90 days of production data showing the cost distribution by bid size, and after the wallet UI has a model-tier breakdown. Gate the toggle behind Seller Growth+ plans (Seller Free and Seller Starter get Sonnet-only). Frame it as "Premium AI Quality" in the seller console, show the per-operation cost delta clearly in a confirmation dialog before the seller opts in, and make it per-SellerSoftware (not per-Org) so sellers can enable it only for their flagship products.

**If we defer.** All first-pass responses use Sonnet. Quality is uniform. Pricing is simple. No customer impact until you're ready to differentiate.

---

## Part 3: Finance Decisions

---

### F-1. Operational Drift Floor Thresholds

**Blocker Level:** NON-BLOCKING
**Owner:** Finance
**RECONCILIATION.md ref:** Pricing Rewrite Track Known Gaps (§34.3.3)

**The problem.** When Sourcera's AI costs drift from the baseline (because Anthropic changes pricing, or model efficiency changes, or Convex compute allocation shifts), the nightly cost-base recalculation job (§4.8.6) computes the drift and decides what to do. The spec proposes three tiers:

- **≤5% drift:** `normal` severity. Auto-applied. No human review.
- **5–10% drift:** `warning_5_10` severity. Auto-applied but Finance alerted.
- **10–25% drift:** `alert_10_25` severity. Requires `ops_finance_admin` approval before the new cost base is published.
- **>25% drift:** `critical_gt_25` severity. Auto-publish blocked. Requires explicit Finance override with justification.

The Buyer Pricing Strategy §11 states: "drift > 10% triggers a Finance alert." The spec tightened this to a three-tier model with a 5% auto-apply floor.

**Recommendation: Accept the three-tier structure but adjust the auto-apply floor to 7%.**

The problem with 5% is alert fatigue. Anthropic's API pricing is not static — model updates, efficiency improvements, and occasional price adjustments happen regularly. FX movements for non-USD customers add another 2–3% of noise. A 5% auto-apply floor means the system generates a `warning_5_10` alert several times per month under normal conditions. Finance teams learn to ignore frequent low-severity alerts, which means they'll also ignore the one that matters.

7% provides a meaningful buffer above normal noise while still catching cost shifts early enough to respond before they hit the 10% approval threshold. The tiers become:

- **≤7%:** Auto-applied. No alert.
- **7–10%:** Auto-applied. Finance alerted. (Narrow window — this is the "something is changing, pay attention" signal.)
- **10–25%:** Requires Finance approval.
- **>25%:** Blocked. Requires explicit override.

The margin-floor invariant (§34.3.1: margin must remain ≥88%, i.e., `value_price ≥ cost_base × 8.8`) is an independent check that fires regardless of drift percentage. Even a 3% drift that pushes margin below 88% triggers an alert. This backstop means the 7% auto-apply floor doesn't create a risk of selling below cost.

**If we defer.** The system ships with 5/10/25 defaults. Finance gets noisy alerts for the first month, someone raises a ticket, the threshold gets adjusted to 7%. Total cost: one sprint of alert fatigue. Not catastrophic.

---

### F-2. Auto-Topup Monthly Ceiling

**Blocker Level:** NON-BLOCKING
**Owner:** Finance
**RECONCILIATION.md ref:** Phase 4 Known Gaps

**The problem.** The spec caps auto-topup charges at $500K/month per Org. Is that the right number?

**What the source docs say.** The Buyer Pricing Strategy does not specify a monthly cap on auto-topup. The Seller Pricing Strategy does not mention it. The Master Spec §4.8.3 authors it as: `auto_topup_max_monthly_value_dollars` with a ceiling of $500K/mo. RECONCILIATION.md flags it: "Authored ceiling of $500K/mo absolute; unflagged at present. Sales/Finance review needed."

**Recommendation: $500K default is correct. Make it configurable per-Org.**

The math: the highest self-serve plan is Business Scale at $800/mo included budget with a 10× value multiplier. A Scale customer who exhausts their $800 budget and keeps going would need to consume $500K in overage to hit the cap — that's 625× their included budget. No legitimate self-serve customer will approach this. The cap exists to prevent runaway charges from a compromised API key or a buggy integration.

For Enterprise customers on CommittedSpendContracts, the cap should be configurable. A customer with a $250K annual commit running a large-scale evaluation in a single month could legitimately spend $80–100K. The $500K cap gives 5–6× headroom, which is reasonable. But a $1M/year Enterprise customer doing a massive multi-vendor evaluation might need $200K in a single month — still well under $500K, but the ceiling should be adjustable by `ops_finance_admin` for these accounts.

Implementation: store the cap on `AIWallet.auto_topup_max_monthly_value_cents` with a platform default of 50,000,000 (=$500K in cents). Allow `ops_finance_admin` to override per-Org with an audit event. The override should have a maximum of $2M/month (200,000,000 cents) — beyond that, the customer needs a manual billing arrangement.

**If we defer.** The $500K default ships. No customer will hit it in the first year.

---

## Part 4: Trust & Safety Decision

---

### T-1. Prompt Injection Scanner Pattern Library

**Blocker Level:** NON-BLOCKING
**Owner:** Trust & Safety
**RECONCILIATION.md ref:** Phase 22-Rewrite Continuation Known Gaps (§22.16.7)

**The problem.** The spec proposes scanning seller KB content for prompt injection attacks. §22.16.7 enumerates starter patterns: `ignore previous`, `system:`, `<|im_start|>`. The comprehensive pattern library and acceptable false-positive rate need T&S review.

**What the source docs say.** KB_Engineering_Spec §3.5 defines the MCP Server Permission Policy, which includes a Submission Gate that validates citation completeness and citation validity. The injection scanner is a separate, earlier-stage defense: it runs at ingestion time (when the seller adds content to the KB), not at retrieval time (when the AI agent reads from the KB).

The defense-in-depth model is:

1. **Ingestion-time scanner** (§22.16.7) — catches obvious injection patterns before they enter the KB.
2. **Retrieval-time Submission Gate** (§22.8.5) — validates that every AI-generated sentence cites a KB entry, and that the citation is real. An injected instruction that causes the AI to generate uncited content would be caught here.
3. **MCP permission scoping** (§22.8.5) — tools like `kb_retrieve` are `always_allow` but tools like `capability_declare_draft` are `always_ask`, meaning the AI agent can't take high-impact actions without explicit orchestrator approval.

**Recommendation: Ship with the starter patterns at ingestion time. Set a 1% false-positive target. Flag content for human review rather than auto-rejecting.**

The injection scanner is the least critical layer of the three defenses. The Submission Gate (layer 2) is the structural defense — it doesn't rely on pattern matching, it relies on citation validation, which is harder to circumvent. The injection scanner is an early-warning system that reduces the attack surface reaching the Submission Gate.

Given this, the right posture is: ship the scanner with known-good patterns, instrument it (log every flag with the triggering pattern and the KB entry content), measure the false-positive rate against real seller content, and iterate the pattern library monthly. Auto-rejection is too aggressive at launch — legitimate KB content can contain strings like "system:" (e.g., "Our system: compliance module integrates with...") or instructional language that resembles injection patterns.

The monthly review cadence should examine: (1) new injection techniques from the security research community, (2) false positives from the previous month, and (3) any Submission Gate blocks that could have been caught earlier by the ingestion scanner.

**If we defer.** KB ingestion works without the scanner. Layers 2 and 3 (Submission Gate + permission scoping) still protect against injection. The risk is that a sophisticated attacker crafts KB content that passes the Submission Gate by including real citations alongside injected instructions — a "citation-wrapped injection." The ingestion scanner would catch the injection pattern before it reaches the KB; without it, the attack reaches the Submission Gate, which may or may not detect the wrapped variant. Risk is real but bounded.

---

## Summary: Priority Order

| # | Decision | Blocker | Recommended Action | Owner | Estimated Effort |
|---|----------|---------|-------------------|-------|-----------------|
| E-10 | Phase 1.5 rework (go/no-go) | HARD | Rework 6 items now; defer 7 to Phase 13 | Integration Lead | 1 working session |
| E-1 | Currency: dollars vs. cents | HARD | Standardize on integer cents; migrate Phase 1 | Engineering | ~60 lines spec + migration |
| E-2 | Plan tier field split | HARD | Split into `buyer_plan_tier` + `seller_plan_tier` (Option A) | Engineering + Sales-Ops | Schema change + dual-write migration |
| E-3 | Dangling FK stubs | HARD | Author 4 placeholder entities in §4 | Engineering | ~200 lines spec |
| E-4 | Event taxonomy gaps | HARD | Register 8 event names in Appendix G | Engineering | ~60 lines spec |
| E-5 | Missing indexes | HARD | Author 5 indexes + UsageEvent aggregate table design | Engineering | ~80 lines spec |
| C-1 | Free+Free pool collapse | HARD | Collapse to single $10 pool | Sales-Ops + Founder | Decision only |
| C-2 | Free+Paid pool collapse | HARD | Collapse to single combined pool | Sales-Ops + Founder | Decision only |
| E-6 | `chain_correlation_id` | SOFT | Add nullable UUID to AIOperation | Engineering + Finance | ~10 lines spec |
| E-7 | Seller-visible bid value | SOFT | Expose as coarsened `deal_size_band`, not exact dollars | Engineering | ~30 lines spec + bridge update |
| E-8 | MCP rate limits | SOFT | Launch at 30 rps / burst 60; confirm with Anthropic | Engineering | Config only |
| C-3 | Pro Trial no-refund rule | NON | Consumed on vendor notification; restored only if never notified | Sales-Ops | Decision only |
| C-4 | Ops override on trial seats | NON | Yes, with role gate + 90-day time-box + audit + 3× cap | Sales-Ops | Decision only |
| C-5 | High-stakes Opus toggle | NON | Ship without; add after 90 days of production data | Sales-Ops + Product | Decision only |
| F-1 | Drift floor thresholds | NON | 7% auto-apply / 10% Finance review / 25% block | Finance | Decision only |
| F-2 | Auto-topup ceiling | NON | $500K default; configurable per-Org; $2M absolute max | Finance | Decision only |
| E-9 | KBSubstrateVersion formality | NON | Keep engineering-internal; document in runbooks | Engineering | Decision only |
| T-1 | Injection scanner patterns | NON | Ship starter set; flag for review (don't auto-reject); 1% FPR target | Trust & Safety | Decision only |

---

## Decision Dependencies

Some decisions depend on others being resolved first:

```
E-10 (Phase 1.5 go/no-go)
 ├── E-1 (currency) ── must be resolved IN the Phase 1.5 rework
 ├── E-3 (dangling FKs) ── must be resolved IN the Phase 1.5 rework
 ├── E-4 (event taxonomy) ── must be resolved IN the Phase 1.5 rework
 └── E-5 (indexes) ── must be resolved IN the Phase 1.5 rework

E-2 (plan tier split)
 ├── C-1 (Free+Free pool) ── wallet budget computation depends on knowing plan tiers
 └── C-2 (Free+Paid pool) ── wallet budget computation depends on knowing plan tiers

E-7 (seller-visible bid value)
 └── C-5 (Opus toggle) ── toggle depends on the classifier, which depends on deal-size signal
```

The critical path is: **E-10 → E-1/E-3/E-4/E-5 → E-2 → C-1/C-2**. Resolve these eight decisions and the entire billing pipeline is unblocked.

---

## Phase 2.5 Remediation Decisions (2026-04-18)

### D-S1 — Source-of-truth restoration (Option A)

**Decision.** When the Master Spec drifted from the Master Summary (MS §2.8 Rate Card, MS §2.9 Outcome Signals, MS §2.11 Pricing Engineering Requirements), restore the MS baseline verbatim and layer authored extensions as explicitly separate sub-tables (e.g., §34.15.1 baseline + §34.15.1.b AE; §34.17.1 baseline + §34.17.1.b AE). Enforce baseline/AE 1:1 matching at deploy time via validators `outcome_contract_baseline_1to1` and `outcome_contract_ae_1to1`.

**Rationale.** Per project source-of-truth hierarchy, the Master Spec is the authoritative build specification but MUST NOT silently diverge from Master Summary content that is not yet integrated. Option A (restore + layer) preserves MS authority while allowing AE to extend without contaminating baseline. Option B (accept drift) was rejected because it would require a ratification artifact to re-authoritize what MS had already settled.

**Alternatives considered.** Option B (accept drift, document in RECONCILIATION) was rejected on the grounds that silent drift erodes the authority model. Option C (retroactively edit MS) was rejected because MS authority flows from its stability; retroactive edits would break every downstream artifact cross-referencing MS.

**What to validate before committing.** Reviewer sign-off on AE capabilities (each AE row has an `AuthoredExtensionSignoff` record); deploy-time validator runs green on first v7.0.0 build candidate; no capability_id appears in both baseline and AE sub-tables.

### D-O1 — Outcome Signals restoration (MS §2.9 baseline)

**Decision.** §34.15.1 replaced with MS §2.9 baseline (12 rows verbatim) with exact retention windows, signal classes, and thresholds preserved. §34.15.1.b adds 8 AE rows (AE-1 through AE-8) under a distinct header. §34.15.6 AC rewritten to include `ghost_rfp_signal_class_lock` (preventing drift of `ghost_rfp_ingestion` from `implicit_retention` to other classes) and baseline/AE 1:1 cardinality checks.

**Rationale.** The prior §34.15 content had partially re-characterized MS §2.9 rows (notably `ghost_rfp_ingestion` classification) and interpolated AE rows into the baseline table without clear separation. This made it impossible for deploy-time validators to assert conformance. Restoring the verbatim MS §2.9 baseline and isolating AEs into §34.15.1.b makes conformance mechanically checkable.

**Alternatives considered.** Keeping the interleaved table (rejected: not mechanically verifiable); migrating everything to AE (rejected: would require MS ratification that the baseline is abandoned, which is not true).

**What to validate before committing.** Each of the 12 baseline rows has a matching OutcomeContract row in the billing runtime with identical signal class and window; each of the 8 AE rows has an `AuthoredExtensionSignoff` record.

### D-P1 — Pricing Engineering Requirements restoration (MS §2.11 baseline)

**Decision.** §34.17.1 replaced with MS §2.11 baseline (14 requirements verbatim). §34.17.1.b adds 11 AE rows. §34.17.3 invariants rewritten to include MS #4/#5 coupling (hard block after 50/80/100% notifications fire), MS #8/AE-4 symmetry (downgrade-safe preservation MUST have a carry-over path symmetric with upgrade), and MS #12 canonical_id lock (public rate card emits canonical form).

**Rationale.** The §34.17 rewrite in prior integration had compressed MS §2.11's 14 items into a narrative and lost individual testability. Restoring the numbered baseline table allows every MS requirement to be individually verified in Phase 3/4 QA.

**Alternatives considered.** Narrative-only (rejected: individual requirement traceability lost); full rewrite with new invariants only (rejected: would orphan MS requirement numbers cited elsewhere in the corpus).

**What to validate before committing.** Each MS #1–#14 requirement has at least one QA test with a traceable identifier; each AE #1–#11 has a signoff record; MS #5 `budget_notification_precedes_hard_block` validator asserts on every wallet-hard-cap transition.

### D-PROMPT1 — Authored Extension sign-off discipline

**Decision.** Every Authored Extension capability (capabilities in AE sub-tables — §34.15.1.b, §34.17.1.b) requires an `AuthoredExtensionSignoff` entity record before the capability can invoke at runtime in production. Enforced via (a) `rate_card_ae_signoff_gate` validator at Rate Card publish time (blocks publish if any AE capability lacks a signoff record), and (b) `rate_card_ae_signoff_bypass_dev_only` feature flag permitted only in non-production environments. New error code `capability_not_signed_off` (HTTP 422) returned at capability invocation time if a signoff record is absent in production.

**Rationale.** Authored Extensions are content not yet ratified in the Master Summary source-of-truth. Production runtime MUST NOT invoke an AE capability without explicit human reviewer attestation — this preserves the principle that MS is the build authority and AEs are flagged proposals until signed off. The dev-only bypass flag allows engineering to iterate on AE spec without blocking, while production remains locked.

**Alternatives considered.** No sign-off gate (rejected: production could ship AE capabilities without reviewer attestation, inverting the authority model). Block all AE at runtime (rejected: too aggressive for iterative spec development).

**What to validate before committing.** `AuthoredExtensionSignoff` entity fields (`capability_id`, `signoff_by_user_id`, `signoff_at`, `signoff_scope` ∈ `{production, staging}`, `revoked_at` nullable) confirmed in §4.8 entity model; `rate_card_ae_signoff_bypass_dev_only` defaults to `false` in production environment config; at least one AE capability has a test signoff record through the v7.0.0 acceptance test suite.

---

## v7.1.0 Program Decisions (closed 2026-04-26)

The seven decisions below were surfaced during the Cowork session 2026-04-26 covering Solo pricing symmetry, Defense View scope, ship sequencing, category framing, and v7.0.0 / v7.1.0 program separation. All seven were closed in the same session; this ledger entry records the closure for downstream auditability. ID namespace `D-7.1-NNN` was confirmed clean against the prior decision corpus (no collisions with E-N, C-N, F-N, T-N, D-S1, D-O1, D-P1, D-PROMPT1) at Phase 14.18 close.

### D-7.1-001 — Solo pricing model (closed 2026-04-26)

**Decision.** Symmetric Solo pricing on both consoles: **$49/mo subscription OR $199 per evaluation (Buyer Solo) / per bid (Seller Solo)**, single per-side selection at activation. Buyer Solo and Seller Solo carry identical base price, identical AI-budget pooling rules, and identical entitlement structure relative to their respective console's Free tier — the only side-specific differences are the consumption-event noun ("evaluation" on the Buyer side, "bid" on the Seller side) and the per-side feature carve-outs already documented in `Sourcera_Buyer_Pricing_Strategy.md` §5.3 and `Sourcera_Seller_Pricing_Strategy.md` §5.3.

**Rationale (Cowork session 2026-04-26).** Symmetric pricing eliminates the per-console pricing-narrative drift that asymmetric pricing would introduce, simplifies the §34.1.1 Plan Tier Definitions table (one Solo row schema serves both consoles), preserves the Sourcera Solo persona's cross-console fluidity (a buyer who later activates the seller console encounters a familiar pricing structure), and aligns with the Phase 14.9 / 14.10 Solo-tier scaffolding edits already authored in the Master Spec and UX spec. The dual subscription / per-eval-or-bid path mirrors the established Buyer plan-tier pattern (subscription with included AI budget) and the per-event consumption pattern (single-evaluation or single-bid economic unit), giving the Solo persona a low-friction entry point at either price point.

**Alternatives considered.** Asymmetric pricing (Buyer Solo at $49 / $199, Seller Solo at $39 / $149 to match seller-side ARPU dynamics) was rejected on the grounds that the price delta would force per-console copy variants in onboarding, billing UI, and the §34 plan-tier table without a corresponding revenue benefit at the Solo scale. Subscription-only Solo (no per-eval-or-bid path) was rejected because it forecloses the single-evaluation-buyer use case explicitly identified in the dual-Maya framing.

**Closure.** Closed → Option A symmetric ($49/mo or $199/eval-or-bid on both consoles).

### D-7.1-002 — Defense View scope (closed 2026-04-26)

**Decision.** Ship Defense View at simple scope: **talking points + evidence + one-page CFO summary**. No multi-stakeholder rehearsal modes, no role-play simulations, no exec-coaching workflows. The Phase 14.5 Master Spec authoring (§13.11 Defense View) and the Phase 14.17 First-30-Seconds retro-doc (UX §4.2.13) bind this scope; future expansion is logged as out-of-scope for v7.1.0 and tracked separately if pursued.

**Rationale (Cowork session 2026-04-26).** The simple scope hits the Defense View's primary buyer pain point (incumbent renewal defense for a Solo or small-team buyer who needs to assemble a defensible decision package quickly) without introducing the surface complexity of multi-stakeholder rehearsal. Multi-stakeholder rehearsal would demand new state-machine entries, new role mappings, new Pulse cards, and new acceptance-criteria coverage — none of which align with the Solo persona who is the primary Defense View consumer. The one-page CFO summary is the highest-leverage artifact: a single document that the Solo buyer hands to the budget approver, with talking points and evidence as the supporting infrastructure.

**Alternatives considered.** Multi-stakeholder rehearsal mode (Defense View as a guided meeting facilitator) was rejected on Principle 9 grounds — surfacing the rehearsal complexity would violate "Surfacing complexity is a defect" for the Solo persona. Role-play simulation (the Defense View as an AI-facilitated objection-handling drill) was rejected as out-of-scope for v7.1.0 and would require new AIOperation capabilities, new wallet metering, and new acceptance-criteria coverage.

**Closure.** Closed → simple (talking points + evidence + one-page CFO summary). No multi-stakeholder rehearsal modes.

### D-7.1-003 — Seller-side ship sequencing (closed 2026-04-26)

**Decision.** Ship the Seller side at **full v1, no deferral**. Hero Moment ships in v1. KB-grounded first-pass response generation, magic-link landing, KB-authoring surface, GhostBidImport, and the Seller Solo / Starter / Growth / Scale / Enterprise plan-tier matrix all ship together at v7.1.0 stamp. No phased seller rollout; no "lite" Hero Moment variant; no deferral of the first-pass response generation behind a launch flag.

**Rationale (Cowork session 2026-04-26).** Sourcera's two-sided network depends on seller-side activation being immediately compelling at first contact. Deferring the Hero Moment to v2 would force every magic-link arrival to land on a degraded surface — sellers who arrive via buyer-funded Pro Trial Seats or buyer-shared Marketplace listings would see a non-Hero authoring screen, which collapses the activation funnel. The integration program's Phases 14.7 / 14.8 / 14.9 / 14.10 are already structured to land the full seller surface; partial deferral would orphan authored spec content and re-introduce drift between the Master Spec and the UX spec.

**Alternatives considered.** Phased seller rollout with Hero Moment in v2 was rejected because it inverts the activation model — the seller's first-touch surface IS the Hero Moment in the dual-Maya framing. Deferring GhostBidImport to v2 was considered but rejected on the grounds that GhostBidImport is the primary KB-bootstrapping path for sellers without prior structured Q&A inventory; deferring it would force sellers into manual KB authoring at first-touch, defeating the Hero Moment.

**Closure.** Closed → full v1, no deferral. Hero Moment ships in v1.

### D-7.1-004 — Marketplace ship sequencing (closed 2026-04-26)

**Decision.** Ship the Marketplace at **full v1, destination page included**. The Marketplace is positioned as **"The Programmatic RFP Exchange"** — the marquee surface framing for the Marketplace itself. Buyer Marketplace listings, Seller EOI submission, Match Score, Seller Signals, NDA flow, and the destination page (the public Sourcera-owned Marketplace landing page) all ship together at v7.1.0 stamp.

**Rationale (Cowork session 2026-04-26).** The Marketplace's two-sided liquidity depends on the destination page being a compelling public artifact at launch — sellers arrive at the destination page via SEO and category-page entry, buyers arrive via in-product surfaces, and both must encounter a fully-formed surface for the Marketplace to function as the programmatic RFP exchange the dual-Maya framing requires. Deferring the destination page to v2 would create a bootstrap problem: sellers without a public-facing destination page have no SEO entry into the Marketplace, and the §48 PLG / network-effects loops that depend on Marketplace virality would not initialize.

**Alternatives considered.** Phased Marketplace launch (in-product Marketplace at v1, destination page at v2) was rejected because the destination page is the primary acquisition surface for the seller side and the primary brand-anchor for the "Programmatic RFP Exchange" marquee framing. A v2 destination page would force a re-launch communication cycle and collapse the v7.1.0 launch narrative.

**Closure.** Closed → full v1, destination page included. Marketplace = "The Programmatic RFP Exchange" marquee framing.

### D-7.1-005 — Build sequence (closed 2026-04-26)

**Decision.** **Single ship, no v1/v2 phasing**. The v7.1.0 program lands as a single coordinated release at the Phase 14.20 closeout — Buyer-side Single-Operator Mode, Defense View, Solo pricing, Seller-side Hero Moment, Marketplace destination page, per-vertical eval starters, and First-30-Seconds Test all ship in the same v7.1.0 stamp. No phased customer rollout, no opt-in beta cohort, no v1/v2 split.

**Rationale (Cowork session 2026-04-26).** The v7.1.0 surfaces are mutually-reinforcing — Single-Operator Mode without Solo pricing has no plan tier to land on; Marketplace without Seller Hero Moment has no seller activation; Defense View without Buyer Solo has no primary persona. Phased shipping would force customer-facing degraded states at every intermediate cutover and would force the integration program to re-author phase verification logs as the surface set changes. The single-ship discipline aligns with the Phase 14.20 closeout's combined v7.1.0-stamp protocol (Master Spec → 7.1.0; UX spec → 2.1.0; Linear blueprint → 2.1.0; Build strategy → 1.1.0 in the same change).

**Alternatives considered.** Buyer-first ship (Buyer Solo + Single-Operator Mode + Defense View at v7.1.0; Seller Hero Moment + Marketplace at v7.2.0) was rejected because it inverts the dual-Maya framing — the framing requires both sides to land simultaneously to validate the surface symmetry. Beta cohort phased rollout (10% of orgs at v7.1.0; 100% at v7.1.1) was rejected because the surface contracts authored in Appendix M apply uniformly across all orgs; per-cohort surface gating would require new feature-flag scaffolding outside the v7.1.0 program scope.

**Closure.** Closed → single ship, no v1/v2 phasing.

### D-7.1-006 — Category framing (closed 2026-04-26)

**Decision.** **SEP retained as the headline category framing**; "Programmatic RFP Exchange" is a **marquee positioning of the Marketplace surface**, not a category rename. Sourcera remains "the Software Evaluation Platform" (or "SEP") in headline positioning copy across `GTM_POSITIONING.md`, `GTM_SALES_PLAYBOOK.md`, `What_is_Sourcera.md` (when authored), and the Master Spec §1 Architecture preamble. The Marketplace surface (§27, §4.5) is the canonical home for the "Programmatic RFP Exchange" marquee.

**Rationale (Cowork session 2026-04-26).** SEP is a buyer-anchored category that maps cleanly to the buyer's primary job-to-be-done ("evaluate enterprise software"). "Programmatic RFP Exchange" is a marketplace-mechanic framing that resonates with the seller side and with buyers who are repeat RFP runners, but renaming the entire product to that framing would (a) collapse the dual-Maya structure (the Solo buyer is not running a "programmatic RFP exchange" — they're running a single evaluation), (b) abandon the existing SEP positioning equity, and (c) force a rewrite cascade across every GTM artifact. Retaining SEP as headline and using "Programmatic RFP Exchange" as the Marketplace's marquee preserves both framings without category drift.

**Alternatives considered.** Full category rename to "Programmatic RFP Exchange" was rejected for the reasons above. Drop SEP and adopt no headline category was rejected because Sourcera's positioning depends on a recognizable category anchor — every GTM doc, sales motion, and content piece references "Software Evaluation Platform" as the category.

**Closure.** Closed → SEP retained as headline; "Programmatic RFP Exchange" is a marquee positioning of the Marketplace, not a category rename.

### D-7.1-007 — v7.0.0 vs v7.1.0 sequencing (closed 2026-04-26)

**Decision.** **Finish v7.0.0 cleanly first, then run v7.1.0 program.** The v7.0.0 closeout (front-matter stamp, Master Summary retirement, all Phase 0–13 sign-offs, RECONCILIATION.md v7.0.0 program section closure) MUST complete before any v7.1.0 surface authoring begins. v7.1.0 phases (14.0 through 14.20) MUST NOT absorb mid-v7.0.0 — even if a v7.1.0 surface concept is discovered during v7.0.0 closeout, it is logged in the v7.1.0 program scope and authored after the v7.0.0 stamp lands.

**Rationale (Cowork session 2026-04-26).** Mid-program absorption of v7.1.0 surfaces into v7.0.0 would (a) re-open Phase 0–13 verification gates that have already closed, (b) inflate the v7.0.0 program's scope past the Phase 13 Final Acceptance Gate's documented success criteria, (c) force concurrent authoring of v7.0.0 cleanup and v7.1.0 surfaces against the same Master Spec file, introducing merge-conflict surface area, and (d) collapse the audit-trail discipline that allows downstream readers to attribute every change to a specific phase prompt. The strict v7.0.0 → v7.1.0 sequence preserves the integration program's single-program-at-a-time discipline.

**Alternatives considered.** Concurrent authoring of v7.0.0 closeout and v7.1.0 pre-flight (allowing v7.1.0 backups and skeleton-only writes during v7.0.0 cleanup) was considered and partially adopted — Phase 14.0 (pre-flight) ran on 2026-04-26 the same day as the v7.0.0 stamp, but only after the v7.0.0 stamp landed in the front matter. No v7.1.0 content edits ran before the v7.0.0 stamp.

**Closure.** Closed → finish v7.0.0 cleanly first, then run v7.1.0 program. Do not absorb mid-v7.0.0.


