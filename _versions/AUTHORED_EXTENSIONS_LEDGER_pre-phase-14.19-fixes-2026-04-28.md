# AUTHORED EXTENSIONS LEDGER — Phase 12 (Consistency Sweep)

**Created:** 2026-04-26 during Phase 12 Gate re-issue.
**Purpose:** Single sign-off register for every Authored Extension introduced during the v7.0.0 integration that requires human ratification before release.
**Owner of ledger:** Founder (or delegate). Owners of individual rows: see `Sign-off owner` column.
**Release-gate policy.** v7.0.0 release is **not gated** on every Authored Extension being `approved`. v7.0.0 **IS gated** on:
- All Phase-12.3 Security-or-Legal entries (AE-12.3-04, AE-12.3-05, AE-12.3-06) being `approved` or `acknowledged`;
- All Phase-12.4 Engineering+Finance entries (AE-12.4-01, AE-12.4-02) being `approved` or `acknowledged`;
- The Enterprise SLA Breaking Change (BC-12.4-01) being `acknowledged` by Sales/Legal.

Every other entry is non-blocking for v7.0.0 release but MUST be ratified before v7.1.0 cycle close.

---

## Status Values

| Value | Meaning |
| :---- | :---- |
| `pending` | Authored, sign-off owner notified, no decision recorded |
| `approved` | Owner has explicitly ratified the extension |
| `rejected` | Owner has explicitly rejected; the extension MUST be reverted |
| `acknowledged` | Owner has read and accepts as-is for v7.0.0; revisit in v7.1.0 |
| `superseded` | A later extension supplants this one; cross-reference required |

---

## Phase 12.1 — Appendix J Enum Registry & Missing Enum Authoring

| ID | Subject | Sign-off Owner | Status | Source artifact |
| :---- | :---- | :---- | :---- | :---- |
| AE-12.1-01 | New enum `content_refresh_status` (5 values + state-transitions in prose) | Engineering | `pending` | PHASE12_1_VERIFY.md §2 + RECONCILIATION.md Phase 12.1 |
| AE-12.1-02 | New enum `match_score_mode` (render-mode classifier; cold-start, hard-gate variants) | Engineering + Product | `pending` | PHASE12_1_VERIFY.md §2 |
| AE-12.1-03 | New enum `match_score_model_version_state` (full state-machine table) | Engineering | `pending` | PHASE12_1_VERIFY.md §2 |
| AE-12.1-04 | New enum `seller_signal_state` (5-state; `partially_de_anonymized` semantics) | Engineering + Security | `pending` | PHASE12_1_VERIFY.md §2 |
| AE-12.1-05 | 9 Phase-12.1 alias entries (`ops_role`, `page_status`, `claim_status`, `trial_seat_status`, `taxonomy_node_status`, `opt_out_scope`, `ghost_import_status`, `seller_onboarding_stage`, `stake_reveal_moment`) | Engineering | `acknowledged` | PHASE12_1_VERIFY.md §5 |

**Phase 12.1 Deferred Items — Re-labeled to Phase 12.5 / v7.1.0 (correction applied 2026-04-26):**

| ID | Subject | Target Phase | Status |
| :---- | :---- | :---- | :---- |
| AE-12.1-DEF-01 | Heading-form normalization (noun-phrase → `*_enum`/`*_kind`) | Phase 12.5 | `pending` |
| AE-12.1-DEF-02 | CI gate `appendix_j_phase_12_1_alias_coverage` | Phase 12.5 | `pending` |
| AE-12.1-DEF-03 | CI gate `appendix_j_body_redundancy_check` | Phase 12.5 | `pending` |
| AE-12.1-DEF-04 | CI gate `enum_value_plural_audit` | Phase 12.5 | `pending` |
| AE-12.1-DEF-05 | CI gate `appendix_j_caption_plural_whitelist` | Phase 12.5 | `pending` |
| AE-12.1-DEF-06 | Appendix L.27 state-machine entries for the 4 NEW enums | Phase 12.5 | `pending` |
| AE-12.1-DEF-07 | Webhook catalog entries for `marketplace_content.refresh.*` and `marketplace.seller_signal.state_changed` | Phase 12.5 | `pending` |
| AE-12.1-DEF-08 | Field-set migration on §4.4.18 (`seller_signal.suppressed_reason` → paired `state` + `state_reason`) | Phase 12.5 | `pending` |

---

## Phase 12.2 — Appendix K Glossary Coverage Sweep

No Authored Extensions logged. Phase 12.2 was a pure consolidation pass — every new entry references existing body authoring; nothing was invented.

**Drift items deferred to v7.1.0** (per PHASE12_2_VERIFY.md §4):

| ID | Subject | Target Phase | Status |
| :---- | :---- | :---- | :---- |
| AE-12.2-DEF-01 | `FeaturedPlacement` (§4.4.20) vs `Featured Placement` (§48.2.10) prose disambiguation | v7.1.0 | `pending` |
| AE-12.2-DEF-02 | Glossary alphabetization (currently chronological by integration phase) | v7.1.0 | `pending` |
| AE-12.2-DEF-03 | Dual-entry consolidation (SIM, k-Anonymity Floor, SellerSignal — each registered twice) | v7.1.0 | `pending` |

---

## Phase 12.3 — Cross-Reference Integrity

| ID | Subject | Sign-off Owner | Status | Source artifact |
| :---- | :---- | :---- | :---- | :---- |
| AE-12.3-01 | Appendix A — Requirement Status State Machine (10 acceptance criteria) | Engineering + Product | `pending` | PHASE12_3_VERIFY.md §11 |
| AE-12.3-02 | Appendix B — Keyboard Shortcut Reference (10 sub-tables; 5 ACs) | Design + Engineering | `pending` | PHASE12_3_VERIFY.md §11 |
| AE-12.3-03 | Appendix C — Notification Event Catalog umbrella heading + 3 CI gates | Engineering | `pending` | PHASE12_3_VERIFY.md §11 |
| AE-12.3-04 | §6.8.4 DSAR Cascade Across Linked Entities (4 ACs) | **Security + Legal** | **`pending` — RELEASE-GATING for v7.0.0** | PHASE12_3_VERIFY.md §11 |
| AE-12.3-05 | §6.8.5 Audit-Integrity Exemption (15-row table; deterministic pseudonymization scheme; 4 ACs) | **Security + Legal + Finance** | **`pending` — RELEASE-GATING for v7.0.0** | PHASE12_3_VERIFY.md §11 |
| AE-12.3-06 | §7.3 PII Handling Across Org Boundaries (7 rules; 3 CI-gate ACs) | **Security + Legal** | **`pending` — RELEASE-GATING for v7.0.0** | PHASE12_3_VERIFY.md §11 |
| AE-12.3-07 | §7.5 Convex Subscription / Reactivity Layer pointer (5 numbered rules) + §7.5.3 SLO restatement | Engineering | `pending` | PHASE12_3_VERIFY.md §11 |
| AE-12.3-08 | §29.7–§29.11 pointer subsections (Notification Failure Audit; Preference Inheritance; Support Widget; Frequency Override Rules; Full-Screen Incident Surface) | Engineering | `pending` | PHASE12_3_VERIFY.md §11 |
| AE-12.3-09 | §38.9–§38.12 pointer subsections (Print Stylesheet; Reduced-Motion; RTL; Presence Avatar Stack) | Engineering + Design | `pending` | PHASE12_3_VERIFY.md §11 |
| AE-12.3-10 | §50.17.4 Token Drift Check + §50.17.5 Paging Runbook | Engineering + Design | `pending` | PHASE12_3_VERIFY.md §11 |
| AE-12.3-11 | Citation Convention preamble + `citation_intra_spec_resolution` CI gate | Engineering | `acknowledged` | PHASE12_3_VERIFY.md §11 |
| AE-12.3-12 | `appendix_k_glossary_canonicality` CI gate (resolves convention drift) | Engineering | `acknowledged` | PHASE12_3_VERIFY.md §11 |
| AE-12.3-13 | `appendix_c_*` CI gates (3 gates: webhook catalog completeness, Appendix-G coverage, Appendix-F retry coverage) | Engineering | `pending` | PHASE12_3_VERIFY.md §11 |
| AE-12.3-14 | Phase 12.5 Notation Cleanup scope (58 residual notation refs + Class B anchor promotions) | Engineering (resolve Phase 12.5) | `pending` | PHASE12_3_VERIFY.md §2.4 |

---

## Phase 12.4 — Numerical & Limit Consistency

| ID | Subject | Sign-off Owner | Status | Source artifact |
| :---- | :---- | :---- | :---- | :---- |
| AE-12.4-01 | §32.4 Monthly API-Call Quotas (Free 1K, Starter 10K, Growth 50K, Scale 250K, Enterprise Unlimited) | **Engineering + Finance** | **`pending` — RELEASE-GATING for v7.0.0** | PHASE12_4_VERIFY.md §3 |
| AE-12.4-02 | §34.18.3 Year-1 Buyer Plan-Mix Split (Starter 15%/10%, Growth 10%/20%, Scale 10%/40%, Enterprise 5%/30%) | **Founder + GTM Lead** | **`pending` — RELEASE-GATING for v7.0.0** | PHASE12_4_VERIFY.md §3 |
| AE-12.4-03 | §16.9.1 Intelligence Availability mapping ("Full" = three of four briefing surfaces; "Predictive Suggestions" = Enterprise-only) | Product | `pending` | PHASE12_4_VERIFY.md §3 |
| AE-12.4-04 | §22.6 max-pages-per-crawl preserved values (100 / 1,000 / 10,000) | Engineering | `pending` | PHASE12_4_VERIFY.md §3 |
| AE-12.4-05 | §19.6.1 Templates — Free read-only / paid full-authoring | Product | `pending` | PHASE12_4_VERIFY.md §3 |
| AE-12.4-06 | §14.8.1 Free-tier 5-scenario cap | Product | `pending` | PHASE12_4_VERIFY.md §3 |
| AE-12.4-07 | §15.6.1 Free-tier 5 pricing-requirement cap | Product | `pending` | PHASE12_4_VERIFY.md §3 |
| AE-12.4-08 | §18.7.1 Free-tier 10-question per-vendor-per-workspace Q&A cap | Product | `pending` | PHASE12_4_VERIFY.md §3 |

### Breaking Change

| ID | Subject | Sign-off Owner | Status | Source artifact |
| :---- | :---- | :---- | :---- | :---- |
| BC-12.4-01 | **Enterprise SLA reduced from 1-hour response (v6.0.0) to 4-hour critical response (v7.0.0)** per §42.1 reconciliation to §34.1 cell SLA. Pre-v7.0.0 Enterprise contracts citing 1-hour are now misaligned with the spec. | **Sales + Legal + Comms** | **`pending` — RELEASE-GATING for v7.0.0** | PHASE12_4_VERIFY.md §4 #4 |

### Phase 12.5 Residual Items (Numerical Reconciliation)

| ID | Subject | Target Phase | Status |
| :---- | :---- | :---- | :---- |
| AE-12.4-DEF-01 | DSAR 30-day SLA codification (currently appears in ~15 places without authoritative §6.8 / §40.2 row) | Phase 12.5 | `pending` |
| AE-12.4-DEF-02 | §32.4 API-call quota Authored Extension ratification (separate from AE-12.4-01) | Phase 12.5 | `pending` |
| AE-12.4-DEF-03 | §44.5 server-side timeout 30s promotion into §44.1 authoritative table | Phase 12.5 | `pending` |
| AE-12.4-DEF-04 | §45.2 "Account locked for 15 minutes" security control promotion into §33.6 | Phase 12.5 | `pending` |
| AE-12.4-DEF-05 | §45.3 marketplace appeal "7 days" / Ops review "24 hours" promotion into §42.3 / §45.3 SLO table | Phase 12.5 | `pending` |
| AE-12.4-DEF-06 | Volume discount bands ($25K / $50K / $100K / $250K) promotion into a dedicated §34.2.4 table | Phase 12.5 | `pending` |

---

## Phase 13 — Engineering Review

| ID | Subject | Sign-off Owner | Status | Source artifact |
| :---- | :---- | :---- | :---- | :---- |
| AE-13-01 | §16.2.3 Perplexity degradation contract — banner copy "External research provider degraded — using cached and internal sources only," 30-day cache fallback rule, no-blocking invariant, Outcome-Resolver `external_provider_outage` cost-routing rule (failed Perplexity AIOperations route to Sourcera platform cost-center, not customer wallet) | **Engineering + Product + Finance** (cost-routing) | `pending` | PHASE13_ENG_REVIEW.md §3 F-7.1 |
| AE-13-02 | §42.6.0 External Provider Health Detectors — 9-row catalog (Anthropic, Firecrawl, Stripe, WorkOS, PostHog, Loops.so, Convex, Perplexity, Zendesk) with severity routing (P3 → P2 → P1 → P0), fail-open policy on detector failure | Engineering + Ops | `pending` | PHASE13_ENG_REVIEW.md §3 F-7.2 |
| AE-13-03 | Appendix F preamble — default-coverage rule and `webhook_default_retry_class` deploy-time validator | Engineering | `pending` | PHASE13_ENG_REVIEW.md §3 F-4.1 |
| AE-13-04 | §34.8.5 — Platform-internal aggregation classification rule for `*_aggregation` rows; validator-exemption rule for `entitlement_matrix_to_capability_registry` | Engineering + Product | `pending` | PHASE13_ENG_REVIEW.md §3 F-3.1.A |
| AE-13-05 | §34.11.1 — Partial-surface pointer with `outcome_contract_completeness` validator targeting union of §21.4.5 + §4.8.4 | Engineering | `pending` | PHASE13_ENG_REVIEW.md §3 F-3.2 |
| AE-13-06 | §5.11 — Coverage-pass pointer to Phase 12.3 verdict + `feature_access_to_acceptance_criteria` deploy-time validator | Engineering | `pending` | PHASE13_ENG_REVIEW.md §3 F-5.1 |
| AE-13-07 | Appendix H — STALE banner pointing readers to §34.1 / §34.2 / §32.4 / §34.3.4 / §4.8.3; `appendix_h_freshness` validator (deferred to Phase 13.3 rewrite landing) | **Engineering + Finance** | `pending` | PHASE13_ENG_REVIEW.md §3 F-8.1 |

### Phase 13.x Follow-On Items (Non-Blocking for v7.0.0)

| ID | Subject | Target Phase | Status |
| :---- | :---- | :---- | :---- |
| AE-13-DEF-01 | 11 customer-facing entity endpoint families to author in §32.5 (Team, Use Case, Inbox Item Group, Bid Workspace, Bid Response, Seller Profile, Bid Task, Bid Schedule, SellerSoftware, Marketplace Pages, Marketplace Listing/EOI/NDA/Abuse Report) | Phase 13.1 | `pending` |
| AE-13-DEF-02 | §46.6 Test-Case Inline Index — flat aggregated registry of every named QA test in the spec, keyed by `(test_name, owning_section, test_kind)` | Phase 13.2 | `pending` |
| AE-13-DEF-03 | Appendix H Rewrite — replace v6 3-tier Stripe model with v7 5-tier model; align metered SKUs with §34.3.4 + §34.10; align retry policy with §4.8.3 | Phase 13.3 | `pending` |
| AE-13-DEF-04 | 5 lightweight CI gates (`entitlement_matrix_to_capability_registry`, `outcome_contract_completeness`, `webhook_default_retry_class`, `feature_access_to_acceptance_criteria`, `external_dependency_fallback_coverage`) | Phase 13.0 | `pending` |
| AE-13-DEF-05 | `entity_to_endpoint_coverage` validator (paired with Phase 13.1 endpoint authoring) | Phase 13.1 | `pending` |
| AE-13-DEF-06 | `appendix_h_freshness` validator (paired with Phase 13.3 rewrite) | Phase 13.3 | `pending` |
| AE-13-DEF-07 | `perplexity_no_blocking_dependency` deploy-time validator | Phase 13.0 | `pending` |

---

## v7.0.0 Release-Gate Summary

For v7.0.0 release to proceed, the following entries MUST be moved from `pending` to `approved` or `acknowledged`:

- AE-12.3-04 (Security + Legal — DSAR Cascade)
- AE-12.3-05 (Security + Legal + Finance — Audit-Integrity Exemption)
- AE-12.3-06 (Security + Legal — PII Handling Across Org Boundaries)
- AE-12.4-01 (Engineering + Finance — API Quotas)
- AE-12.4-02 (Founder + GTM Lead — Year-1 Plan-Mix)
- BC-12.4-01 (Sales + Legal + Comms — Enterprise SLA Breaking Change)

**Phase 13 release-gate addition (2026-04-26):**

- AE-13-01 (Engineering + Product + Finance — Perplexity degradation contract; Finance review required for the `external_provider_outage` cost-routing rule)

All remaining entries (including AE-13-02 through AE-13-07 and the Phase-13 DEF items) are non-blocking for v7.0.0 release but MUST be ratified before v7.1.0 cycle close.

---

## Owner Notification

This ledger was authored 2026-04-26. Initial owner notifications go out via the standard `RECONCILIATION.md` review process. Status updates should be applied directly to this file with the owner's name + date in a new `Sign-off Date` column when status moves out of `pending`.

---

**End of AUTHORED_EXTENSIONS_LEDGER.md.**
