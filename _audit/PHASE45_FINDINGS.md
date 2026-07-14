# Phase 45 Findings — §45 Privacy & Abuse Prevention

**Scope.** Single-prompt audit of Master Spec v7.1.0 §45 (lines 32584–32631). Six checks per prompt: (1) public-surface rate-limiting, (2) end-to-end abuse-report flow, (3) mechanically-auditable vendor opt-out, (4) k-anonymity floors at the query layer, (5) Promoted Listing anti-spam linkages, (6) KB content moderation (profanity / illegal content / IP-infringement).

**Date.** 2026-05-08.

**Verdict.** §45 fails the production-readiness bar for its title. The section is ~46 lines for a chapter that should anchor the privacy and abuse-prevention story for the entire platform. Almost every substantive contract lives elsewhere (§4.5.7, §22, §27.8, §27.9, §27.10, §27.11.2, §32.4, §40.2, §42.3.1, §47.4, §48.4.4) and §45 fails to route a reader to those homes. Several of the six checks are silent at §45 and either partial or absent across the corpus.

---

## Walking the six checks

### Check 1 — Every public surface (vendor profile, marketplace search, EOI submission) has rate-limiting

**Confirmed (incomplete).** §45.2 cites only `Section 32.4. Per-org, per-API-key, per-user concurrency`. §32.4 in fact defines:

- Per-Organization burst (5,000 soft / 10,000 hard / 100 burst per minute) — authenticated only.
- Per-plan monthly API-call quotas — authenticated only.
- Per-user concurrency (max 10) — authenticated only.
- Public Pricing API class `public_pricing_unauth` (600 / 1,200 / 60 per IP) — covers `GET /v1/pricing` only.

Gaps:

- Vendor profile (`sourcera.com/sellers/:slug` per §4.4.10 SellerOrgPage) and Software Page (`sourcera.com/software/:slug` per §4.4.11) are unauthenticated public surfaces. §32.4 has no anonymous-bucket rate-limit class for them. §5.6 V3 disambiguation (line 9696) declares the synthetic `marketplace_public_reader` role is "resolved at the §32.4 anonymous-bucket rate-limiter layer" — but no such layer is authored at §32.4.
- EOI submission rate limits exist at §48.4.12 / §4.4.26 EOIRateLimitOverride (per-seller 24h, per-category 7d, per-buyer 30d). §45.2 routes a reader to §32.4 only and would cause them to miss the EOI rate-limit story entirely.
- Marketplace search rate-limiting is bound to the per-Org authenticated quota; no anonymous-bucket class for SEO crawlers / public discovery.
- Marketplace Abuse Report rate limits live at §4.5.7 (20/24h authenticated; 5/24h per `reporter_ip_hash` for anonymous). §45.2 cites neither.

→ **D-45-008** (EOI / Abuse-Report rate-limiting cross-reference miss); **D-45-009** (anonymous-bucket class declared but unauthored).

### Check 2 — Marketplace Abuse Report flow is end-to-end (file → triage → resolution → audit-trail)

**Partial.** §45.3 narrates an 8-step prose workflow but:

- The flow is prose, not a `From | To | Trigger | Conditions | Notes` state-machine table per Authoring Convention #5. § 27.8 has no state-machine table either; the canonical state machine for §4.5.7 is in the entity row at §4.5.7.
- §45.3 does not cite §27.8 (the canonical operational behavior section) or §4.5.7 (the canonical entity). § 27.8 reciprocally cites §45.3 ("§45.3 Marketplace Abuse Escalation | Narrative of abuse-report lifecycle and escalation authority. Canonical for narrative") but the citation is one-way; a reader landing on §45.3 has no route to the severity matrix, ban-scope dual sign-off, court-order ingestion, coordinated-abuse signature catalog, transparency reporting, or appeal SLA enforcement.
- Audit-trail integrity: §27.8.1 row asserts "every state transition and Ops action on an abuse report writes an audit row" (§4.6.1). §45.3 omits this contract entirely. A reader cannot confirm "mechanically auditable" from §45.3 alone.
- §45.3 uses "admin queue / admin review / Sourcera management" terminology; §27.8 uses "Ops / Ops triage / Ops management". Drift.

→ **D-45-003** (state-machine table absent), **D-45-004** (no §27.8 / §4.5.7 cross-reference), **D-45-014** (audit-trail invariant not surfaced), **D-45-021** (terminology drift admin↔Ops).

### Check 3 — Vendor opt-out enforcement is mechanically auditable

**Confirmed at §27.10 — but absent from §45.** §27.10 has the full Vendor Opt-Out Global Registry: 29 acceptance criteria with QA-test names, latency SLOs (P99 ≤ 60s end-to-end; P99 ≤ 10s registry replication; P99 ≤ 20s edge-purge), CI gate `vendor_opt_out_surface_allowlist_invariant` for new-surface regression, lifecycle webhooks `vendor.opted_out` / `vendor.opted_in` / `vendor_opt_out.applied` / `vendor_opt_out.revoked`, sweep-manifest reverse-replay invariant, fail-closed default on registry unavailability, anti-circumvention coverage on transfer / new-software emergence, DSAR signer-erasure invariance.

Gap: §45.1 — the canonical Privacy section — never mentions the Vendor Opt-Out Registry. A reader of §45 would not be routed to §27.10. The privacy-mechanism table (Data Ownership, Model Training, Analytics, Error Logs, DPA, Subprocessor List) omits the single most material seller-side privacy mechanism in the corpus.

→ **D-45-005** (privacy section silent on §27.10 vendor opt-out).

### Check 4 — Buyer/seller k-anonymity floors enforced at query layer

**Confirmed at §4 / §27.9 — but absent from §45.** Multiple k-anonymity contracts are mechanically enforced at the entity / pipeline layer:

- CategoryPage (§4.4.12): k=5; publish gate `category_page_k_anon_floor_not_met` (HTTP 409) on aggregate render with `k_anon_satisfied=false`.
- ComparisonPage / GuidePage / SoftwarePage cohort signals (§4.4.13–§4.4.14): k=5.
- MarketIntelligenceReport (§4.4.15): k=20; `market_intel_k_anon_floor_not_met` (HTTP 409).
- MarketDemandHeatMapCell (§4.4.16): k=10; suppressed-cell render path renders "Insufficient data."
- SellerSignalCohort (§4.5.10): primary k=5 floor, secondary distinctiveness gate at k=10 (general) / k=20 (de-anonymization-related publication) per D-1.3-001 remediation.
- §27.8.14 Public Transparency Reporting per-cell floor of 10 for DMCA aggregate counts.
- §27.9.5 Aggregation pipeline: k-anonymity stage with `tuple_distinctiveness_threshold_exceeded` suppressed-reason precedence.

Gap: §45.1 omits k-anonymity entirely. A reader of the canonical Privacy section would not see that the platform encodes k-anonymity floors as hard publish gates with falsifiable HTTP error codes.

→ **D-45-006** (privacy section silent on k-anonymity contracts).

### Check 5 — Promoted Listing anti-spam linkages spec'd

**Confirmed at §27.11.2 / §4.5.x PromotedListing — but absent from §45.** §27.11.2 / Promoted Listing entity (§4.5.x) carries:

- Per-buyer frequency cap: max 3 impressions per `(buyer_org_id, category_id)` per rolling 7-day window (Summary §6.16.6 default).
- `daily_cap_cents` (100–500,000), `per_eoi_cap_cents`, `frequency_cap_config`, `eoi_acceptance_count` qualified-EOI definition.
- Eligibility check enums: `kb_health_floor_not_met`, `no_closed_bids_prior_90d`, `plan_tier_below_scale`, `category_inactive`, `seller_software_not_claim_verified`, `software_page_not_published`, `vendor_opt_out_active_for_category` — terminate eligibility with `status=terminated_eligibility_lost`.
- Buyer-console scrubbed projection (cost / bid / cap / spend fields excluded) per cross-console firewall.

Gap: §45.2 — the canonical abuse-prevention section — never references Promoted Listing anti-spam. Frequency caps, daily caps, eligibility-loss termination, and the FTC disclosure interlock are absent from any abuse-prevention contract a reader would encounter at §45.

→ **D-45-007** (abuse section silent on Promoted Listing anti-spam).

### Check 6 — KB content moderation: profanity, illegal content, IP-infringement screens

**NOT CONFIRMED.** This is the most serious gap in the section.

- §22 (KB Engineering): no content-moderation pipeline. KB Entry lifecycle (§22.4) and Firecrawl ingestion (§22.6) define index gates (`failed`, `failed_vectorization`, `partial_success`, `recoverable_failure`) but no profanity / illegal-content / trademark-infringement classifier on author or ingest.
- §48.4.4 content validators (XSS sanitizer, structured-data injection guard, PII detector, profanity classifier, prompt-injection scanner, off-topic spam classifier) apply to: Public Selection Reports (§48.5), watermark text overrides, custom email message bodies (§48.4.4), `seller_edited_post_text` social-promotion drafts (§48.x). They DO NOT apply to KB Entry body, KB Document content, or KB Firecrawl-ingested content.
- §45.2 "Response Validation" lists output-side rendering controls only (no executable scripts, sandboxed render, Markdown sanitization) — these address XSS / injection, not editorial / illegal-content moderation.
- §27.8 abuse-report flow can take down a published Software Page with `misleading_claims` / `trademark_infringement` / `harmful_content` reasons after the fact, but there is no write-time screen on the KB content that feeds a Managed Agent to compose a bid response.
- Consequence: a seller can author a KB Entry containing profanity, libellous claims about a competitor, drug / firearms-trafficking guidance, or trademark-infringing brand-name impersonation; the entry vectorizes, flows into the §22.9 retrieval pipeline, and surfaces in Managed-Agent-composed bid responses delivered to buyers without a profanity / legality / trademark gate.

→ **D-45-010** (KB content-moderation pipeline absent at §22 and unaddressed at §45.2).

---

## Authoring-convention sweep against §45

Walking Authoring Conventions 1–14 against the four §45 sub-sections:

| Convention | §45.1 | §45.2 | §45.3 | §45.4 |
|---|---|---|---|---|
| 1 Entity definition | n/a (no entities authored here) | n/a | n/a (defers to §4.5.7) | n/a |
| 2 Acceptance criteria (numbered, testable) | absent (entire sub-section is bullets) | absent | absent (8 prose steps, no AC) | **defective** — 5 unnumbered bullets, not testable, restate "24 hours" inline (D-45-001, D-45-002, D-45-019) |
| 3 Enum registration (Appendix J) | n/a | n/a | n/a (defers to §4.5.7 enums) | n/a |
| 4 Glossary (Appendix K) | "DPA", "Subprocessor", "Sandboxed rendering" not defined inline; not yet cross-checked against Appendix K | same | same | same |
| 5 State machines | n/a | n/a | **defective** — prose-only 8-step workflow, no `From\|To\|Trigger\|Conditions\|Notes` table (D-45-003) |  n/a |
| 6 APIs | n/a | n/a | n/a (defers to §4.5.7) | n/a |
| 7 Webhooks | n/a | n/a | n/a (lifecycle webhooks at §27.8.9 not surfaced here) | n/a |
| 8 Plan gating | "DPA: Available for all plans" — prose statement; not cited from §5.11 / §34.1 / §39 | n/a | n/a | n/a |
| 9 Retention & privacy | "All customer data retention policies" — vague reference; should cite §40.2 retention table | n/a | n/a | references "retention policies" without §40.2 citation |
| 10 Numerical singletons | "Updated quarterly" inline — Appendix subprocessor cadence has no §40.2 / §42 single-source home | "5 failed attempts" cited from §33.6 (good); "90 days" API token rotation inline (no §39 / §6 source); "24-hour", "7-day", "24-hour" SLAs cited from §42.3.1 (good) | "24-hour" SLA cited from §42.3.1 (good); explicit single-source preamble (good) | **defective** — "24 hours" restated inline (D-45-002) |
| 11 Heading syntax | ✅ `## 45.1 Data Privacy {#45.1-data-privacy}` | ✅ | ✅ | ✅ |
| 12 Surface/engine mapping (Appendix M) | "subprocessor list public surface" / "DPA artifact" / "privacy policy public surface" not in Appendix M.1 | n/a | "abuse-report admin queue" / "seller appeal form" — Appendix M coverage by §27.8 not §45 | n/a |
| 13 Console firewall | not stated | not stated | "reporter identity NEVER revealed to subject" lives at §27.8.6, not surfaced here (D-45-022) | n/a |
| 14 Edge cases | residency US/EU divergence absent (D-45-016); third-party outage absent (D-45-017); subprocessor change SLA absent (D-45-013); PII scope of "No PII in analytics" undefined (D-45-011) | input-side validation absent (D-45-012); prompt-injection absent (D-45-018); impersonation / DMCA absent (D-45-020); WorkOS outage absent (D-45-017) | partial-completion / SLA-breach handling delegated to §27.8 (acceptable) | not testable as authored |

---

## Counterfactual pass — three realistic failure modes per check

**Check 1 — Rate-limiting failure modes.**
1. Adversarial scraper hits `sourcera.com/sellers/:slug` at 1M req/min from IPv6 rotation. **Unhandled** — no anonymous-bucket class at §32.4 for non-pricing surfaces (D-45-009).
2. Buyer fires 10,000 EOI submissions in a 1-hour window via the public API. **Handled at §48.4.12 / §4.4.26 — but reader of §45.2 would not learn this** (D-45-008).
3. Reporter floods abuse-report API at 100 reports / minute. **Handled at §4.5.7 (20/24h auth, 5/24h IP-hash) — but reader of §45.2 would not learn this** (D-45-008).

**Check 2 — Abuse-report flow failure modes.**
1. Ops user resolves a `medium` report without seller response. **Handled at §27.8.4 ("Can Upheld-Close Without Seller Response? — No, except `dismissed` or `duplicate_of_prior_report`") — not in §45.3** (D-45-004).
2. Severity escalates `medium → high` mid-review and the subject must re-hide within 60s. **Handled at §27.8.4 — not in §45.3** (D-45-004).
3. Coordinated-abuse cluster of 50 reports targets a single Seller Org. **Handled at §27.8.12 (cross-report aggregation, evidence bundles, signature detection) — not in §45** (D-45-004).

**Check 3 — Vendor opt-out failure modes.**
1. Hot-registry replication lag > 10s during opt-out write. **Handled at §27.10.4 / §27.10.10 #1 (fail-closed default).**
2. Cloudflare tag-purge partial failure (one POP times out). **Handled at §27.10.10 #2.**
3. Seller transfers SellerSoftware to a different Org to escape opt-out. **Handled at §27.10.11.10 — but §45 does not surface vendor opt-out at all** (D-45-005).

**Check 4 — k-anonymity failure modes.**
1. Cohort drops below floor post-publication due to DSAR cascade. **Handled at §4.4.12 #2 (nightly sweep `k_anon_satisfied=false`, transition to `pending_review`).**
2. Heat-map cell signal cohort shrinks below k=10 after vendor opt-out cascade. **Handled at §4.4.16 #1.**
3. Seller signal de-anonymization-related publication exceeds tuple-distinctiveness threshold. **Handled at §4.5.10 secondary check (D-1.3-001 remediation).**

→ §45.1 should at minimum cite these mechanisms (D-45-006).

**Check 5 — Promoted Listing anti-spam failure modes.**
1. Seller exhausts daily cap mid-day; further auctions suppress. **Handled at PromotedListing entity (`promoted_listing_daily_cap_exhausted`).**
2. Buyer hits 3 impressions for a category in a rolling 7-day window. **Handled at PromotedListing `frequency_cap_config`.**
3. Seller loses KB health floor mid-campaign. **Handled at `eligibility_check_failed_reason=kb_health_floor_not_met` → `status=terminated_eligibility_lost`.**

→ §45.2 should at minimum surface these (D-45-007).

**Check 6 — KB content moderation failure modes.**
1. Seller authors a KB Entry containing libellous claim against a competitor. **Unhandled — no write-time profanity / disparagement classifier on KB Entry. §27.8 abuse report can react after the fact, but the content has already vectorized and surfaced in agent responses** (D-45-010).
2. Seller ingests a Firecrawl source containing illegal-content claims (drug / firearms / weapons trafficking guidance). **Unhandled — §22.6 has no content classifier on ingest** (D-45-010).
3. Seller authors a KB Entry impersonating a known brand (trademark-infringing). **Unhandled at write — only reactive via §27.8.4 `impersonation_of_known_brand` signature with brand-owner trademark assertion** (D-45-010, D-45-020).

---

## Self-Challenge Pass

Re-reading the 22 candidate defects as a hostile reviewer.

**D-45-005, D-45-006, D-45-007 — "privacy section silent on X."** Hostile question: "If the contract lives at §27.10 / §4.4 / §27.11.2 with full ACs and CI gates, isn't the §45 silence merely a routing-doc miss?" Answer: yes — but §45 is the canonical "Privacy & Abuse Prevention" chapter; a regulator-facing audit, a SOC2 reviewer, a GDPR auditor, or an enterprise procurement security review will ask "where is your privacy policy?" and a junior staff engineer will hand them §45. §45 actively misleads by appearing complete (DPA + Subprocessor + Analytics + Error Logs + Model Training) while omitting the three most material privacy/abuse mechanisms. Severity P1 holds because the failure mode is reader misrouting under audit pressure, not just doc hygiene. **No revision.**

**D-45-009 — anonymous-bucket class declared at §5.6 V3 but unauthored at §32.4.** Hostile question: "Is the §5.6 V3 wording loose enough to read as 'fall through to per-IP burst at the WAF layer'?" Answer: no — the wording is "resolved at the §32.4 anonymous-bucket rate-limiter layer", which asserts a §32.4-internal class. §32.4 has no such class. Either the §5.6 V3 wording is a forward reference to a Phase-N-pending §32.4 anonymous-bucket class (in which case file as P1 because surface security under-defined), or §5.6 V3 is wrong (still P1 because contradiction). **No revision.**

**D-45-010 — KB content moderation absent.** Hostile question: "Is the §22.4 indexing pipeline's `partial_success` / `failed_vectorization` enum implicitly handling moderation?" Answer: no — those are extraction / vectorization failures, not classifier failures. Hostile question: "Does §48.4.4 cover KB content?" Answer: no — §48.4.4 explicitly lists Public Selection Reports, watermark text, email custom messages, social-promotion text. Hostile question: "Could moderation live in the Managed Agent guardrails (§22.10) at retrieval time rather than write time?" Answer: §22.10 / §22.8.6 (MCP server permission policy) governs tool-use permissions, not content classification on retrieved chunks. Severity P1 holds: a junior engineer reading §22 would build a KB pipeline with no content moderation, and the corpus has no other home for the moderation contract. **No revision.**

**D-45-011 — "No PII in analytics" unscoped.** Hostile question: "Doesn't Appendix G PostHog taxonomy convention define PII allowlist implicitly?" Answer: I cannot confirm without reading Appendix G end-to-end against §6.8 DSAR redaction policy. Demoting from a hard P2 to P2 with caveat — Phase-9 Observability sweep should confirm. **No revision; will flag in defect note.**

**D-45-019 — "All customer data retention policies documented and enforced" unfalsifiable.** Hostile question: "Could a Phase-9 retention sweep operationally define this?" Answer: that's exactly the point — §45.4 should cite §40.2 directly so the AC is a deterministic predicate. **No revision.**

**Severity recalibration after self-challenge.**
- D-45-005, D-45-006, D-45-007: keep at P1 / P2 / P2 respectively (D-45-005 is the most material privacy mechanism omission — Vendor Opt-Out is the single most user-visible privacy contract on the platform; D-45-006 / D-45-007 are spec-hygiene gaps on enforcement that already lives elsewhere mechanically).
- D-45-019: keep P2 (unfalsifiable AC blocks QA test authoring).

---

## Promotion to Defect Ledger

22 defects promoted (P1 ×10, P2 ×9, P3 ×3). All rows authored against the Defect Ledger Format v1.0 / v1.1 (`Audit_Prompts.md → Defect Ledger Format`). See `DEFECT_LEDGER.md` for canonical rows D-45-001 through D-45-022.

## Coverage Matrix Cell Updates

Three rows touched: F-625 (Data Privacy Posture / §45.1), F-626 (Abuse Prevention Controls / §45.2), F-627 (Marketplace Abuse Escalation Workflow / §45.3). Cell tightening per the per-defect mapping:

- F-625: `acceptance_criteria` ⚠ → ❌ (D-45-001 inherited via §45.4 covering §45.1 ACs); `glossary` ⚠ → ❌ (DPA / Subprocessor / Sandboxed rendering not cross-checked); `retention` ⚠ → ❌ (D-45-019 unfalsifiable AC); `dsar` ⚠ → ❌ (silent); `residency` already ⚠ from D-9.2-003 → ❌ via D-45-016; `console_firewall` ⚠ → ❌ via D-45-022; `surface_engine_mapping` ⚠ → ❌ via D-45-015; `documentation_gap` ❌ already from D-RES-005 (no change).
- F-626: `acceptance_criteria` ⚠ → ❌ (D-45-001); `state_machine` ⚠ → n/a (no state in §45.2); `error_codes` ⚠ → ❌ (no error codes for input-side validation, KB moderation, EOI rate-limit, public-surface anonymous bucket — D-45-008, D-45-009, D-45-010, D-45-012); `network_effect_link` n/a (kept); `posthog_events` ⚠ → ❌ (impersonation / DMCA / KB moderation events not surfaced — D-45-020, D-45-010); `documentation_gap` n/a → ❌ (D-45-007, D-45-008, D-45-013, D-45-018, D-45-020).
- F-627: `acceptance_criteria` ⚠ → ❌ (D-45-001); `state_machine` ⚠ → ❌ (D-45-003 prose only); `webhook` ⚠ → ❌ (lifecycle webhooks at §27.8.9 not surfaced — D-45-004); `posthog_events` ⚠ → ❌ (D-45-004); `error_codes` ⚠ → ❌ (D-45-004); `console_firewall` ⚠ → ❌ (reporter-identity firewall not surfaced — D-45-022); `consistency_drift` n/a → ❌ (D-45-021 admin↔Ops); `documentation_gap` n/a → ❌ (D-45-004, D-45-014).

## Forwarded to downstream phases

- Phase 6 (Privacy & Residency): inherits D-45-005, D-45-006, D-45-011, D-45-013, D-45-016 as seed defects.
- Phase 8 (API + Webhook): inherits D-45-008, D-45-009 as seed defects (rate-limit class authoring at §32.4).
- Phase 9 (Observability): inherits D-45-011 (PII allowlist confirmation against Appendix G), D-45-014 (audit-trail invariant surfacing).
- Phase 22-deep (KB): inherits D-45-010, D-45-018, D-45-020 as seed defects (KB write-time moderation pipeline; prompt-injection guardrail; impersonation / DMCA intake on KB content).
- Phase 27.8 / 27.10 / 27.11.2 deep (Marketplace surfaces): inherits D-45-004, D-45-005, D-45-007 as bidirectional cross-reference defects (§45 must surface these mechanisms; §27.x already cites §45 narrative).

