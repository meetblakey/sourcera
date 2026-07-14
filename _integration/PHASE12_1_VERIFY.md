# PHASE12_1_VERIFY — Appendix J Audit & Closure

**Phase:** 12.1 — Appendix J Walk, Coverage Verification, Naming Consistency, Missing-Enum Authoring.
**Authoring date:** 2026-04-25.
**Authoritative artifact:** `Sourcera_Master_Spec.md` → `## Appendix J: Controlled Vocabulary Registry` → `### Phase 12.1 Closure Cluster — Appendix J Audit, Canonicalization & Missing Enum Authoring`.
**Backup:** `_versions/Sourcera_Master_Spec_pre-phase12.1-appendixJ-audit-2026-04-25.md`.
**Reconciliation entry:** `_integration/RECONCILIATION.md` → "Phase 12.1 — Appendix J Audit & Closure."

---

## 1. Methodology

The Phase 12.1 audit was executed in five passes against `Sourcera_Master_Spec.md`:

1. **Inventory pass.** Extracted every `### ...` and `#### ...` heading inside Appendix J (lines 39781–42190 in the pre-Phase-12.1 baseline). Result: 431 heading entries spanning 124 named enums plus prose subsection introductions.
2. **Body-vs-registry pass.** For each enum, extracted the registered value set, then grep'd each value against the Spec body (lines 1–39780) and the rest of Appendix J. Values appearing only in their own definition with no body or cross-reference citation were flagged as orphan candidates and triaged.
3. **Registry-vs-body pass.** Inverse direction: for the Phase 12.1 prompt's list of expected enums, located each by name, value set, and home section. Three names had no canonical home (`content_refresh_status`, `match_score_mode`, `seller_signal_state`); one had only an implicit home in §27.4.8 prose without explicit Appendix J registration (`match_score_model_version_state`). Authored as new entries.
4. **Naming-consistency pass.** Scanned for: mixed-case values, hyphenated values, plural enum-value identifiers, plural heading captions, and `*_enum` vs noun-phrase heading drift. Findings logged below.
5. **Phase 1–11 coverage confirmation pass.** Walked the Phase 12.1 prompt's enumerated additions list (`ai_operation_settlement_state`, `crm_provider`, etc.) and confirmed registration; nine names were already canonical under noun-phrase headings and received Phase-12.1 alias registrations for citation hygiene.

---

## 2. Per-Enum Coverage Verification

The following table summarizes the Phase 12.1 prompt's named additions against the registry state.

| Phase 12.1 Prompt Name | Status | Canonical Heading in Appendix J | Disposition |
| :---- | :---- | :---- | :---- |
| `ai_operation_settlement_state` | Already registered (Phase 4) | "AI Operation Settlement State (§4.8.1)" | Confirmed |
| `ops_role` | Already registered (Phase 11) under `ops_role_kind` | "`ops_role_kind` (§50.3.1 canonical six-role matrix)" | Phase 12.1 alias added |
| `page_status` | Already registered (Phase 6) under "Page Publication Status (Shared)" | "Page Publication Status (Shared: SellerOrgPage, SoftwarePage, …)" | Phase 12.1 alias added |
| `claim_status` | Already registered (Phase 6) under "SellerSoftware Claim Status" | "SellerSoftware Claim Status" | Phase 12.1 alias added |
| `content_refresh_status` | **MISSING** — no canonical home | (none) | **NEW — authored** |
| `referral_status` | Already registered (Phase 5) under "Referral Status" | "Referral Status" | Phase 12.1 confirmation entry added |
| `trial_seat_status` | Already registered (Phase 5) under "Pro Trial Seat Status" | "Pro Trial Seat Status" | Phase 12.1 alias added |
| `taxonomy_node_status` | Already registered (Phase 6) under "Taxonomy Node State (§4.5.4)" | "Taxonomy Node State (§4.5.4)" | Phase 12.1 alias added |
| `match_score_mode` | **MISSING** — render-mode discriminator implicit in §27.4.6 prose only | (none) | **NEW — authored** |
| `seller_signal_state` | **MISSING** — only `seller_signal_suppressed_reason` registered | (only the suppressed-reason cluster) | **NEW — authored** |
| `opt_out_scope` | Already registered (Phase 6) under "Vendor Opt-Out Scope Kind" | "Vendor Opt-Out Scope Kind" | Phase 12.1 alias added |
| `crm_provider` | Already registered (Phase 7) under `crm_provider` | "`crm_provider`" | Confirmed |
| `ghost_import_status` | Already registered (Phase 6) under "Ghost Bid Import Status" | "Ghost Bid Import Status" | Phase 12.1 alias added |
| `promoted_listing_status` (active/paused/exhausted/expired) | Already registered (Phase 6) with extended value set | "`promoted_listing_status` (§4.4.19)" | Confirmed; canonical set has 11 values (the prompt's four are a subset) |
| `featured_placement_surface` (category_page/comparison_page/heat_map) | Already registered (Phase 6) | "`featured_placement_surface` (§4.4.20)" | Confirmed |
| `verification_review_outcome` (approved/rejected/pending) | Already registered (Phase 6) with extended value set | "`verification_review_outcome` (§4.4.21)" | Confirmed; canonical set has 7 values (the prompt's three are a subset) |
| `marketplace_discovery_sku` (promoted_listing/verification_upgrade/featured_placement) | Already registered (Phase 4) | "Marketplace Discovery SKU (§4.8.12)" | Confirmed |
| `seller_onboarding_stage` (1–7) | Already registered (Phase 11) under `seller_onboarding_phase_enum` | "`seller_onboarding_phase_enum` (§48.1.5, §48.8)" | Phase 12.1 alias + Stage→Phase mapping added |
| `seller_onboarding_invite_source` (buyer_invite/ghost_bid/direct) | Already registered (Phase 6) with extended value set | "`seller_onboarding_invite_source` (§4.4.22)" | Confirmed; canonical set has 6 values (the prompt's three map to `buyer_invite`, `ghost_bid_conversion`, `direct_signup`) |
| `stake_reveal_moment` (kb_landing/bid_debrief/conversion_threshold) | Already registered (Phase 9) under `kb_stake_reveal_moment_enum` | "`kb_stake_reveal_moment_enum` (§22.18.6)" | Phase 12.1 alias added (canonical values: `free_tier_kb_landing`, `outcome_debrief`, `conversion_threshold`) |

**Verification gate.** Every prompt-named enum maps to either an existing canonical entry (with optional Phase 12.1 alias) or a Phase 12.1 NEW authoring. Zero unmapped names. Exit criterion satisfied.

---

## 3. Naming-Consistency Audit Findings

### 3.1 Heading-Form Drift (`*_enum` / `*_kind` vs. noun-phrase)

**Finding.** Approximately 60% of Phase 1.5 / §48 / §50 / §51 cluster headings use `*_enum` or `*_kind` suffixes (e.g., `seller_onboarding_phase_enum`, `ops_role_kind`); approximately 40% use bare noun-phrase form (e.g., "Pro Trial Seat Status," "Marketplace EOI Statuses"). The two forms are functionally equivalent but visually inconsistent.

**Disposition:** Deferred to Phase 12.2. Phase 12.1 records the inconsistency and authors aliases for nine of the highest-traffic body-cited enums. Full normalization is a large change and is held back to avoid touching every body-section citation in a single integration phase.

**Sample inconsistencies (non-exhaustive):**
- "Pro Trial Seat Status" vs. `trial_seat_status` — alias added Phase 12.1.
- "SellerSoftware Claim Status" vs. `claim_status` — alias added Phase 12.1.
- "Page Publication Status (Shared)" vs. `page_status` — alias added Phase 12.1.
- "Vendor Opt-Out Scope Kind" vs. `opt_out_scope` — alias added Phase 12.1.
- "Ghost Bid Import Status" vs. `ghost_import_status` — alias added Phase 12.1.
- "Taxonomy Node State (§4.5.4)" vs. `taxonomy_node_status` — alias added Phase 12.1 (with `*_state` / `*_status` policy note: state-machine entities use `*_state`; lifecycle-classification entities use `*_status`; Taxonomy uses `*_status` per Phase 12.1 standardization).

### 3.2 Plural Heading-Caption Forms

**Finding.** "Marketplace Listing Statuses," "Notification Frequencies," "Notification Channels," "Pricing Structures," "Plan Tiers," "Scoring Modes," "Capability Categories," "Referral Fraud Signals," "Referral Forfeit Reasons," "Referral Invite Channels," "Pro Trial Seat Outcomes," "Pro Trial Seat Converted-To Plans," "Usage Event Categories," "Usage Event Entity Ref Types," "Usage Event Outcomes," "Usage Event User Agent Classes," "Time-Saved Loaded Hourly Rate Sources," "Time-Saved Reversal Reasons," "Internal Comment Attached-To Types," "Marketplace EOI Statuses," "Marketplace Listing Statuses" use plural heading captions.

**Disposition:** Accepted-As-Is for v7.0.0. The underlying value-set identifiers are singular (`plan_tier_kind`, `referral_status`, `usage_event_category`); only the prose captions use plural form. Rewriting the captions risks breaking link anchors and historical reference integrity. CI gate `appendix_j_caption_plural_whitelist` (Phase 12.2 deferred) will whitelist the existing plural captions.

### 3.3 Body-Section vs. Appendix-J Redundancy

**Finding.** Several body sections declare enum values inline in addition to Appendix J. Examples:
- §4.3.20 declares `target_account_state_enum` values inline; same values in Appendix J Phase 1.5 cluster.
- §4.4.18 declares `seller_signal_suppressed_reason` inline; same values in Appendix J.
- §4.7.2 declares `vendor_disqualification_*` enums inline; same values in Appendix J.
- §3.6/§3.7/§3.10/§3.11 declare UX cluster enums inline; same values in Appendix J §3 cluster.

**Disposition:** Resolved by precedence rule. Per §2 source-of-truth hierarchy, Appendix J is authoritative. Body-section enum declarations are read as informational/redundant. CI gate `appendix_j_body_redundancy_check` (Phase 12.2 deferred) will assert that no body-section enum declares a value that diverges from Appendix J. Phase 12.1 confirmed *zero* divergences during the audit pass — every inline declaration matches its Appendix J entry exactly.

### 3.4 Mixed-Case Values

**Finding.** Zero mixed-case enum values found across Appendix J. All values are strictly `lowercase_snake_case` or `lowercase_kebab_unused`.

**Methodology.** Grep'd Appendix J for `[A-Z]` inside backticked enum values; matches were limited to:
- Heading captions (which intentionally use Title Case prose).
- Cross-reference citations like "(§4.4.21)" and "Appendix L.6" — not enum values.
- The `Marketplace_Discovery_*` audit-action prefixes in prose text — these are already snake_case at the value level.

**Disposition:** Resolved (no action required).

### 3.5 Hyphenated Values

**Finding.** Zero hyphenated enum values. The only hyphens in Appendix J are inside heading captions (e.g., "Pro Trial Seat Converted-To Plans"), retry-curve class names (e.g., `auto_topup_charge`), and prose text. The `K-Anon` values like `k5_signal`, `k10_aggregate`, `k20_market_intel` use snake_case throughout.

**Disposition:** Resolved (no action required).

### 3.6 Plural Enum-Value Identifiers

**Finding.** A small set of enum values uses plural natural-language form:
- `Downgrade Excess Data Class`: `workspaces`, `requirements_over_cap`, `kb_entries_over_cap`, `vendors_over_cap`, `capability_declarations_over_cap`, `seller_software_over_cap`, `firecrawl_sources_over_cap`, `concurrent_bids_over_cap`, `seller_signals_over_cap`, `evaluations_over_cap`.
- `SellerOrgPage Body Section Type`: `case_studies`, `integrations`, `certifications`, `products`.

**Disposition:** Accepted-As-Is. These reflect natural-language category names where the plural is the canonical noun (a "case study" category is named after the plural noun "case_studies" because the category contains many studies, not because the value is multi-valued). CI gate `enum_value_plural_audit` (Phase 12.2 deferred) will whitelist these explicitly and reject any new plural without a grandfather entry.

---

## 4. Orphan Scan

### 4.1 Methodology

For each enum entry in Appendix J, the registered value set was extracted and each value grep'd against:
- Spec body (lines 1–39780).
- Appendix J cross-references (other enum entries that mention the value as part of cross-referencing prose or table cells).
- Appendix C (Notification Event Catalog), Appendix G (PostHog Event Taxonomy), Appendix I (Error Codes), Appendix L (State Machines) — to catch downstream usage.

A value was flagged as a candidate orphan only if it appeared in *zero* locations outside its own canonical enum entry.

### 4.2 Findings

**Zero unintentional orphans.** The four caveat categories below were identified and explicitly accepted:

**Caveat 1 — Intentionally Retired Values.** The two `growth_loop_id_enum` values `l3_retired_selection_report_share` and `l6_retired_domain_match_auto_suggest` are explicitly preserved per §48.2.13 cross-loop AC #8 to support historical telemetry decoding. Flagged but not orphans.

**Caveat 2 — Reserved-For-Future Values.** The following values exist to prevent schema-change requirements when paid-mode or future-tier flags activate:
- `featured_placement_revocation_reason`: `paid_commitment_cancelled_by_seller_with_proration`, `paid_commitment_cancelled_by_ops`.
- `marketplace_discovery_sku`: `verification_upgrade`, `featured_placement` (currently editorial-only / earned-free per Seller Pricing §12.2/§12.3).
- `direct_invite_offer_kind`: `vertical_alignment` (referenced in §27.9.8 prose but not yet implemented).
- `kb_export_format_kind_enum`: `_v2`-suffixed values reserved by note in the canonical entry.

**Caveat 3 — Single-Value DB-CHECK Enums.** These are architectural choices that preserve enum-form for forward-compatibility:
- `Sourcera-Owned Cost Center`: `sourcera_owned`.
- `Marketplace Discovery Cost Center`: `rev_marketplace_discovery`.
- `Seller Outcome Signal Console Scope`: `seller`.
- `Seller Outcome Signal Timeout Default`: `rejected`.
- `KB Console`: `seller`.
- `Marketplace Discovery Cost Center`: `rev_marketplace_discovery`.

**Caveat 4 — Webhook-Subset Enums.** Enums that are defined as restricted subsets of a parent enum for use in specific webhook payloads:
- `AIOperation Settled-Event Settlement States`: subset of `ai_operation_settlement_state`.
- `AIOperation Reversed-Event Prior States`: subset of `ai_operation_settlement_state`.
- `Contest Origin (§31.8.3)`: distinct narrow enum.
- `Reversal Origin (§31.8.3)`: distinct narrow enum.
- `Plan Change Origin (§31.8.5)`: distinct narrow enum.
- `Free Allowance Next-Bills-Against (§31.8.7)`: distinct narrow enum.

These are referenced from their owning webhook payload definitions in Appendix C and the §31.8 catalog. Confirmed live cross-references; not orphans.

### 4.3 Exit Criterion

Zero unintentional orphans. Four caveat categories documented and accepted. **Pass.**

---

## 5. Phase 12.1 Diff Summary

| Class | Count | Detail |
| :---- | :---- | :---- |
| Enums added (NEW) | 4 | `content_refresh_status`, `match_score_mode`, `match_score_model_version_state`, `seller_signal_state` |
| Aliases registered | 9 | `ops_role`, `page_status`, `claim_status`, `trial_seat_status`, `taxonomy_node_status`, `opt_out_scope`, `ghost_import_status`, `seller_onboarding_stage`, `stake_reveal_moment` |
| Confirmation entries | 1 | `referral_status` (canonical-name confirmation; no behavior change) |
| Phase 1–11 prompt-named enums confirmed registered | 7 | `ai_operation_settlement_state`, `crm_provider`, `marketplace_discovery_sku`, `seller_onboarding_invite_source`, `verification_review_outcome`, `featured_placement_surface`, `promoted_listing_status` |
| Enums extended (value-set additions) | 0 | (Phase 12.1 is non-mutating to existing value sets) |
| Enums deprecated | 0 | (no Phase 12.1 deprecations) |
| Naming-consistency findings | 6 | per §3 above |
| Orphan values | 0 | (4 caveat categories documented) |

---

## 6. Phase 12.2 Deferred Work

The following items are deferred to a future Phase 12.x pass:

1. **Heading-form normalization.** Migrate every noun-phrase Appendix J heading to `*_enum` or `*_kind` form per the §3.1 finding. Touches every body-section citation; held for a dedicated pass to avoid cross-cutting churn.
2. **CI gate `appendix_j_phase_12_1_alias_coverage`.** Author the deploy-time validator that asserts new code-path enum citations use the Phase 12.1 alias form.
3. **CI gate `appendix_j_body_redundancy_check`.** Author the validator that asserts no body-section inline enum declaration diverges from Appendix J.
4. **CI gate `enum_value_plural_audit`.** Author the validator that whitelists the 14 grandfathered plural values and rejects new plurals without explicit grandfather entries.
5. **CI gate `appendix_j_caption_plural_whitelist`.** Whitelist the existing plural caption forms.
6. **Appendix L state-machine entries.** Add Appendix L.27 entries for the four Phase 12.1 NEW enums (`content_refresh_status`, `match_score_mode`, `match_score_model_version_state`, `seller_signal_state`).
7. **Webhook catalog entries.** Add §27.6 / §27.4.9 / §27.9 webhook event definitions for `marketplace_content.refresh.*` and `marketplace.seller_signal.state_changed`.
8. **Field-set migration on §4.4.18.** Migrate the `seller_signal.suppressed_reason` field to a paired `state` + `state_reason` field-set per the §4.4.19 PromotedListing canonical pattern.

Each deferred item has an entry in `_integration/RECONCILIATION.md` → "Phase 12.1 — Deferred to Phase 12.2."

---

## 7. Self-Challenge Pass (Opus-Mandatory)

Per the Phase 12.1 prompt's MODEL EXPECTATIONS clause #16, the Phase 12.1 authoring was re-read as a hostile staff engineer. Findings and resolutions:

1. **Q: Do the four NEW enums each have a complete state-machine table?** A: `match_score_model_version_state` includes the table inline. `content_refresh_status` and `seller_signal_state` describe state transitions in prose; full Appendix L tables are deferred to Phase 12.2 per the deferred-work list. **Resolution:** prose-form is acceptable per the §2 hierarchy because the Appendix L cross-reference is documented and Phase 12.2 is committed. `match_score_mode` is a render-mode classifier without a state machine (it is a serialization-time computation, not a stateful entity); no table required.

2. **Q: Does each NEW enum specify retention?** A: `content_refresh_status` specifies 365-day retention. `match_score_mode` is computed at serialization and not persisted as a long-lived entity; retention follows the parent `MarketplaceMatchScoreSnapshot` row (§27.4 retention rules). `match_score_model_version_state` retention follows the `MarketplaceMatchScoreModelVersion` row (life of platform per §27.4.8). `seller_signal_state` retention follows the SellerSignal entity per §4.4.18 (180 days raw + roll-up to Heat Map). **Resolution:** retention is implicit-by-parent-entity for three of four NEW enums; `content_refresh_status` is the only one with an explicitly-authored retention because it is a discrete run record. Acceptable.

3. **Q: Could a junior engineer build against the four NEW enums unambiguously?** A:
   - `content_refresh_status`: Yes — every transition is named, every value has a one-sentence semantic, the diff-score thresholds are stated.
   - `match_score_mode`: Yes — every value maps 1:1 to a §27.4.6 plan-tier row and the mapping is explicit.
   - `match_score_model_version_state`: Yes — full state-machine table.
   - `seller_signal_state`: Mostly yes — the `partially_de_anonymized` state is the only one with subtle semantics (one Seller's de-anonymization does not change the aggregate's anonymity for other Sellers), but this is documented in the Notes section. **Resolution:** add a forward-pointer note to §4.4.18 De-Anonymization Flow as Phase 12.2 work; for v7.0.0 the prose is adequate.

4. **Q: Are there realistic failure modes the authoring missed?** A: Per Phase 12.1 prompt clause #17, three failure modes per new feature were enumerated:
   - `content_refresh_status` — addressed: partial failure (`failed_partial`), total failure (`failed_total`), mid-run cancellation (`cancelled`), late-arrival race (`superseded_by_subsequent_run`).
   - `match_score_mode` — addressed: cold-start (`cold_start_v1_fallback`), hard-gate suppression (`hard_gated_zero`), plan-tier mismatch is rejected by construction (computed at serialization).
   - `match_score_model_version_state` — addressed: rollback (`rolled_back`), retirement (`retired`), grace-window rendering during deprecation (in state-machine notes).
   - `seller_signal_state` — addressed: k-floor breach, distinctiveness veto, opt-out collisions (buyer + vendor), residency veto, DSAR-driven recompute. **Resolution:** failure-mode coverage is complete for v7.0.0.

5. **Q: Is there a circular-dependency risk in the Phase 12.1 alias scheme?** A: Aliases are additive — they do not delete the canonical heading; CI gate `appendix_j_phase_12_1_alias_coverage` only enforces alias-form-only on *new code paths*, not on historical inline references. Pre-existing inline references continue to resolve. **Resolution:** no circular-dependency risk.

6. **Q: Could the Stage→Phase mapping for `seller_onboarding_stage` introduce ambiguity in §48.5 / §48.8 telemetry?** A: The mapping is documented in the alias entry. Stage 6 and Stage 7 both map to `completed` with discriminator fields (`win_loss_disclosed`, `conversion_moment_kind`). If a future analyst grepped for Stage 7 events without using the discriminator they would see Stage 6 events as well. **Resolution:** flagged in the alias-entry Notes; recommended dashboard filter pattern documented; Phase 12.2 will add a §48.1.7 telemetry sub-section that enumerates the canonical filter expressions.

**Self-challenge exit:** all six findings either resolved inline or scheduled to Phase 12.2. No build-blocker findings.
