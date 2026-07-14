# Phase 5.6 — §26 Seller Profiles, Verification & Capability Declarations — Scratch Findings Log

**Date:** 2026-05-06
**Auditor model:** Claude Opus
**Audit prompt:** Walk Master Spec §26 end-to-end with the five prompt-scoped checks (public profile schema cites §4.4 SellerOrgPage / SoftwarePage; verification tiers match §34.16; VerificationReviewRecord lifecycle fully spec'd; capability declarations cite Capability Registry in §21.4; vendor opt-out cascade per §4.5 / §4.7 honored). Apply the V0 14-check audit checklist on top.
**Status:** Findings promoted to `DEFECT_LEDGER.md` Phase 5.6 section. This file is the scratch artifact retained per audit-program protocol.

---

## Sources Read (in full)

- `Sourcera_Master_Spec.md` §26 (lines 21116–21830) including §26.1 Seller Profile, §26.2 Verification Tiers, §26.3 Capability Declarations, §26.4 KB-to-Capability Auto-Suggestion, §26.5 UX Implementation, §26.6 Acceptance Criteria, §26.7 SellerOrgPages (incl. §26.7.1–§26.7.6), §26.8 SellerSoftware & SoftwarePages (incl. §26.8.1–§26.8.7), §26.9 SEO Requirements (incl. §26.9.1–§26.9.10), §26.10 Acceptance Criteria (Extended) — 46 ACs total
- `Sourcera_Master_Spec.md` §4.4.3 Seller Profile entity (4636–4658), §4.4.4 Capability Declaration entity (4660–4776), §4.4.9 SellerSoftware (4944–5028), §4.4.10 SellerOrgPage (5030–5108), §4.4.11 SoftwarePage (5109–5174), §4.4.21 VerificationReviewRecord (6008–6151)
- `Sourcera_Master_Spec.md` §4.4.8 Vendor Opt-Out Record (4863–4943), §4.5.6 Vendor Opt-Out Marketplace-Domain Read & Render Contract (6939–6982)
- `Sourcera_Master_Spec.md` §21.4 Agent Capability Registry (15637–15847) including §21.4.1 Initial Registry Seed, §21.4.1.A Seller-Console Augmentations, §21.4.2 Extended Capabilities (where `seller_page_enrichment` is registered), §21.4.3 Platform-Owned Capabilities, §21.4.4 Free-Plan Access Rules, §21.4.5 Outcome Signals
- `Sourcera_Master_Spec.md` §34.16 Marketplace Discovery Pricing (29789–29960) including §34.16.1 Promoted Listings, §34.16.2 Verification Tiers, §34.16.3 Featured Placements, §34.16.4 Buyer Guardrails, §34.16.5 Failure Modes, §34.16.6 Retention/Residency/DSAR, §34.16.7 Webhooks/APIs (17 events), §34.16.8 Acceptance Criteria
- `Sourcera_Master_Spec.md` §29102 Entitlement Matrix `seller_page_enrichment` row, §29616 plan-tier gates table, §28792 rate card
- `Sourcera_Master_Spec.md` Appendix M.1 (47861–47980) — verified that SellerOrgPage / SoftwarePage / Capability Declaration / VerificationReviewRecord rows exist; cross-checked for surface-level coverage of §26.7.2 enrichment review pane, §26.7.6 preview-token issuance, §26.8.7 product-transfer wizard, §26.8.7 bulk-create endpoint, §26.9.7 OG image generator
- `_audit/AUDIT_README.md`, `_audit/DEFECT_LEDGER.md` row format, `_audit/FEATURE_INVENTORY.md` rows F-415–F-428
- `Audit_Prompts.md` Defect Ledger Format (lines 49–68), Severity Definitions (lines 72–83), Phase 5.6 prompt body (lines 1570–1589)

---

## Per-Check Results

### Check 1 — Public seller profile schema cites SellerOrgPage / SoftwarePage in §4.4

**Result:** **Partial.** §26.7 / §26.8 do cite §4.4.10 / §4.4.11 / §4.4.9 directly (e.g., §26.7 line 21203 "entity definition at §4.4.10 (SellerOrgPage)"; §26.8 line 21332 "entity definitions at §4.4.9 (SellerSoftware) and §4.4.11 (SoftwarePage)"). However:

- **§26.1 Seller Profile section is silent on §4.4.3** — the Seller Profile entity. §26.1 lists "Profile fields" prose that a hostile reviewer would expect to be a citation to §4.4.3. Worse, §26.1 lists `Verification tier (Basic, Verified, Certified)` as a Seller Profile field, but §4.4.3 has NO `verification_tier` field. **Filed as D-5.6-003 (P1).**
- **§26.7 cites §26.1 Seller Profile in §26.7.1 region #1 ("Hero Section")** for the public contact email. The contact email field IS present in §26.1 prose ("Public contact email") but is NOT in §4.4.3 entity table either — entity-schema gap reinforces D-5.6-003.
- **§26.4 KB-to-Capability Auto-Suggestion never cites §4.4.4 or §21.4.** Audit-prompt check #4 ("Capability declarations cite Capability Registry in §21.4") fails on §26.3 / §26.4 — neither subsection cites the Registry; §26.3 sets up a six-field capability declaration schema that contradicts the v7.0.0 §4.4.4 25-field schema (with `capability_type`, `canonical_capability_id`, `marketplace_category_id`, `evidence_kb_entry_ids`, `geographic_scope`, etc.). **Filed as D-5.6-004 (P1).**
- **§26.4 KB-to-Capability flow does cite "Agent (Haiku)"** — narratively the `kb_to_capability_suggestion` capability registered as v6 Seed row 18 (§21.4.1, line 15680). But §26.4 doesn't cite §21.4.1 row 18 nor §22.14.3 (the canonical KB-to-Capability evidence-overlap rule). **Filed as D-5.6-010 (P2).**

### Check 2 — Verification tiers match §34.16 Marketplace Discovery Pricing

**Result:** **Fail — three-way criteria conflict.** Tier names match (Basic / Verified / Certified) across §26.2 / §4.4.21 / §34.16.2 — but the criteria for each tier are mutually inconsistent:

| Tier | §26.2 (line 21138–21142) | §4.4.21 (line 6014–6016) | §34.16.2 (line 29837–29842) |
| :--- | :--- | :--- | :--- |
| Basic | "Email verified + account created. Automatic upon signup." | "free, automatic on **domain verification (§4.4.9)**." | "self-attested KYB + email verification" |
| Verified | "Email + business registration lookup (OpenCorporates or similar)." | "earned-free at Seller Starter+; profile completeness 100% + **SOC 2 OR ISO 27001** doc validated by Ops." | "domain + business registration + uptime history" |
| Certified | "Verified criteria + manual review by Sourcera (compliance docs reviewed). ~5–10 business days." | "earned-free at Seller Growth+; verified prerequisite + **≥ 3 closed bids with buyer-confirmation**; HIPAA / PCI per category." | "full compliance audit (SOC 2, HIPAA, GDPR, etc.)" |

§26.2's "Basic = email + account creation" disagrees with §4.4.21's "Basic = automatic on domain verification" disagrees with §34.16.2's "Basic = self-attested KYB + email verification." §26.2's "Verified = OpenCorporates business-registration lookup" makes no mention of the SOC 2 / ISO 27001 documentation requirement that §4.4.21 hard-gates. §26.2's "Certified = manual review of compliance docs" elides §4.4.21's `≥ 3 closed bids + buyer-confirmation` gate (which is the actual buildable criterion). **Filed as D-5.6-002 (P1).**

Additionally, §26.2 says "Buyers can filter Marketplace by verification tier. Certified vendors have higher visibility in match scoring." This contradicts §27.4.3 line 21909, which positions `verification_tier_ordinal` as a **learned-residual feature with a static prior** (i.e., not a deterministic boost). **Subsumed under D-5.6-002.**

### Check 3 — VerificationReviewRecord lifecycle fully spec'd

**Result:** **Pass on §4.4.21 mechanics; partial on §26 cross-references.** §4.4.21 (lines 6008–6151) provides the full canonical lifecycle:

- 53-field entity table with proper scope isolation, indexes, retention, residency, DSAR
- 13-row state machine table (`From / To / Trigger / Conditions / Notes`)
- Pre-write prerequisites (Verified / Certified)
- Separation-of-duties constraint (`verification_review_separation_of_duties_violation`)
- Residency-scoped reviewer pool (EU-residency sellers → EU reviewers only)
- 8 failure modes addressed
- 9 numbered acceptance criteria

**§26 itself does not surface this lifecycle.** §26.2 (line 21142 "Approval Workflow" column) gives only three approval-time descriptors ("Automatic", "Semi-automatic, <1 hour", "Manual review, ~5–10 business days") — none of which match §4.4.21's actual SLA: Verified = 5 business days; Certified = 10 business days; SLA breach → `auto_rejected_sla_breach`. §26.2 does NOT cite §4.4.21. The "<1 hour" claim for Verified is unsupported by the canonical SLA. **Subsumed under D-5.6-002.**

### Check 4 — Capability declarations cite Capability Registry in §21.4

**Result:** **Fail.** §26.3 Capability Declarations (line 21146) authors a six-field schema (capability name, category, declaration text, evidence files, verification status with three values `pending` / `evidence_provided` / `verified`, published) with NO citation to §4.4.4 or §21.4. The §4.4.4 canonical schema has 25 fields, a 7-state lifecycle (`draft`, `pending_review`, `published`, `rejected`, `quarantined_taxonomy`, `quarantined_registry`, `deprecated`), invariant write-time rules, taxonomy-vs-narrative type distinction, and explicit cross-reference to `canonical_capability_id` (FK → §4.8.2 `CapabilityRegistryEntry`). The §26.3 schema is the v6.0.0 thin schema; §4.4.4 is the v7.0.0 hardened schema; §26.3 was not updated. The §26.3 verification status enum (`pending`, `evidence_provided`, `verified`) is wholly disjoint from the §4.4.4 `state` enum and is not registered in Appendix J. **Filed as D-5.6-004 (P1).**

§26.4 KB-to-Capability flow doesn't cite §21.4.1 row 18 (`kb_to_capability_suggestion` registry entry) nor §22.14.3 (the canonical evidence-overlap rule for KB-to-capability promotion). **Filed as D-5.6-010 (P2).**

### Check 5 — Vendor opt-out cascade (§4.5 / §4.7) is honored

**Result:** **Mostly honored at the page level (§26.7 / §26.8 / §26.9.5); silent at the capability-declaration level.**

- §26.9.5 step 1 explicitly cascades opt-out to `suppressed_by_opt_out` for SellerOrgPage / SoftwarePage with HTTP 200 + `X-Robots-Tag: noindex` — but **§4.5.6 line 6966 says "render `410 Gone`"** for the same case. **Direct conflict — Filed as D-5.6-008 (P1).**
- §26.7.3 Domain Verification Gate creates a "synthetic opt-out record" with `reason_code = ops_imposed` on domain-verification loss. This is sound but the synthetic-opt-out write contract is under-specified — no `created_by` (Ops user? system worker?), no `scope_kind` (presumably `specific_page`), no `effective_from`. **Filed as D-5.6-017 (P2).**
- §26 is silent on capability-declaration redaction when a Seller Org has a `global` Vendor Opt-Out Record. §4.5.6's redaction-target table doesn't list capability declarations, but a published seller's capability cards still appear on Marketplace match-score and search-result surfaces (§26.3 line 21157 "Published (boolean, controls visibility in Marketplace)"). When a global opt-out activates, the SellerOrgPage transitions to `suppressed_by_opt_out` and the listing is delisted — but the underlying capability declarations remain `state=published` and could leak via APIs that don't gate on opt-out. **Filed as D-5.6-023 (P2).**

---

## V0 Audit Checklist — Per-Subsection Results

### §26.1 Seller Profile

- **Entity definition:** Lists 11 prose-only "Profile fields"; no field table; no `id`, `org_id`, `console`, audit columns. §4.4.3 (the actual entity) has only some of these fields and is missing `verification_tier`, `industries_served`, `certification_badges`, `tagline`-without-overlap. **D-5.6-003 (P1).**
- **Acceptance criteria:** None.
- **Plan gating:** `marketplace_opted_in = true` predicate referenced inline; not cited from §5.11.
- **Edge cases:** First-time seller, draft-state profile, profile-completeness gate (referenced from §4.4.21 but not §26.1) — all silent.

### §26.2 Verification Tiers

- **Entity definition:** Inline three-row tier table; criteria contradict §4.4.21 / §34.16.2. **D-5.6-002 (P1).**
- **Acceptance criteria:** None in §26.2; tier-side ACs live in §4.4.21 acceptance criteria.
- **Surface/engine mapping:** Appendix M.1 row exists for VerificationReviewRecord (line 47944) but does NOT bind §26.2's three-tier criteria table to either §4.4.21 or §34.16.2 — the row is silent on which document defines the criteria.
- **Plan gating:** §4.4.21 plan-gates Verified at `seller_starter+` and Certified at `seller_growth+`. §26.2 inline copy is silent on plan gating.

### §26.3 Capability Declarations

- **Entity definition:** Six-field schema in prose; contradicts §4.4.4 25-field schema. **D-5.6-004 (P1).**
- **Acceptance criteria:** Five §26.6 ACs apply (lines 21195–21199), all phrased as UX measurements ("Seller can declare 5–10 capabilities in <30 minutes") rather than testable system properties. **D-5.6-013 (P2).**
- **Enums:** `verification_status` enum (`pending`, `evidence_provided`, `verified`) NOT in Appendix J. §4.4.4's `capability_declaration_state` (7 values) IS in Appendix J. Inline §26.3 enum is unregistered. **D-5.6-004 covers.**
- **State machine:** None in §26.3; §4.4.4 has the canonical 9-edge state machine.
- **Capability Registry citation:** Missing. **D-5.6-004 covers.**

### §26.4 KB-to-Capability Auto-Suggestion

- **Capability registry citation:** Missing — does not cite §21.4.1 row 18 or §22.14.3. **D-5.6-010 (P2).**
- **Confidence threshold:** Cites 0–100% confidence inline; doesn't reference §21.3 (default confidence threshold floor) or the Org-tunable Settings → Agent threshold.
- **Acceptance criteria:** AC #5 ("KB-to-Capability suggestions appear within 3 seconds of editor load") is testable but doesn't cite the §22.14.3 evidence-overlap rule.
- **Edge cases:** Silent on what happens when KB has zero matching entries; what happens when suggestion confidence is below threshold; what happens when seller has 0 published declarations vs. >100.

### §26.5 UX Implementation

- **UX tokens:** No citations to §3 UX tokens or `UX_Design_of_Sourcera.md`.
- **Keyboard shortcuts:** `Cmd+N`, `Cmd+Shift+P` introduced inline; not registered in Appendix B (Keyboard Shortcut Reference). **D-5.6-012 (P3).**
- **Mobile divergence:** Bullet "Mobile: Single-column card grid. Native file picker (no drag-and-drop on touch)" — under-specified; no mobile breakpoint cited; no token citation; no reference to UX spec.

### §26.6 Acceptance Criteria

- Five bullets, none numbered, none traced to a system-observable property:
  - "Seller can declare 5–10 capabilities in <30 minutes" — UX time-to-value measurement, not a system AC.
  - "Evidence files are securely stored in Convex Storage with access logs" — does not cite §4.6.2 Attachment entity or §6.7 audit log entity. **D-5.6-022 (P2).**
  - "Capability badges render correctly in Marketplace listings" — "correctly" is undefined.
  - '"Evidence Provided" badge text is accurate and not misleading' — qualitative; not measurable.
  - "KB-to-Capability suggestions appear within 3 seconds of editor load" — testable.
- **D-5.6-013 (P2).** §26.10 (Extended ACs) covers §26.7–§26.9 with 46 numbered ACs but does not extend §26.1–§26.6.

### §26.7 SellerOrgPages

- **§26.7.1 Page Content & Structure:** Section-type enum `seller_org_page_section_type` referenced; need to verify Appendix J registration (sampled — present per §4.4.10 cross-reference, OK).
- **§26.7.2 Page Enrichment:** **Critical billing-mode contradiction.** §26.7.2 step 2: "Cost center: `sourcera_owned` (`platform_marketing`); the seller is NOT charged." §4.4.10 entity field `enrichment_cost_center` is hardcoded `sourcera_owned (fixed)`. But §21.4.2 row 1 (line 15715) registers `seller_page_enrichment` as `customer_billed` with `cost_base ~$0.80`, value_price $8.00, plan_gate `seller_starter`. §29102 Entitlement Matrix gates this hard at `seller_starter` (3/mo). §29616 publishes `Free: 0. Starter: 3/mo. Growth: 20/mo. Scale: 80/mo. Enterprise: unmetered`. The §21.4.2 / §29102 / §29616 rows say the customer's wallet is debited; §4.4.10 / §26.7.2 say the customer is never charged. Per Severity rule (d) (billing surface ambiguity that allows revenue leakage or double-charge), this is **P0**. **Filed as D-5.6-001 (P0).**
- **§26.7.2 capability_id:** §26.7.2 references "the `page_enrichment` capability (registered in §21.4; Opus-tier)"; but §21.4 only registers `seller_page_enrichment` (with the `seller_` prefix). §4.4.10 / §4.4.11 enum field `last_enrichment_capability_ref` is hardcoded `page_enrichment` — not the registry's canonical id. **D-5.6-005 (P1).**
- **§26.7.2 retry curve:** "Queue retries 3× with exponential backoff (1m, 5m, 15m)" duplicated inline — should cite §31.9 retry-curve class. **D-5.6-024 (P3, consolidated).**
- **§26.7.3 Domain Verification Gate:** Creates synthetic opt-out record on domain-verification loss; write contract under-specified (no `created_by`, `scope_kind`, `effective_from` enumerated). **D-5.6-017 (P2).**
- **§26.7.6 Edge Caching:** Numerical singletons inline (60-second snapshot TTL, 600s/86400s cache TTL, 1000 QPS rate-limits, $10K bid sanity cap, 60s p95 / 300s p99 SLOs, 5-attempt DLQ, 30-minute Ops manual purge SLA, 7-day JWT preview TTL). Many should cite §39 / §42.3 / §42.7 / §31. **D-5.6-011 (P2).**
- **§26.7.6 preview-token revocation:** "flushes the JWT key version, invalidating all prior tokens" — vague: per-page, per-Org, per-admin scope unspecified. **D-5.6-018 (P2).**

### §26.8 SellerSoftware & Software Pages

- **§26.8.1 Auto-Created (Unclaimed) Products:** "render a 'Claim this listing' CTA on the public SoftwarePage" — but §26.8.5 publication gate requires `claim_status=claim_verified`. §4.4.9 state machine note (line 4998) reinforces "Public SoftwarePage may render in 'unclaimed' state" — three sources contradict whether unclaimed products have a public SoftwarePage. **D-5.6-009 (P1).**
- **§26.8.7 Product Transfer (M&A):** References `SellerSoftwareTransferRequest` entity — not defined in §4. **D-5.6-006 (P1).** References `former_org_ids` array on SellerSoftware — §4.4.9 has no such field (only `former_kb_namespace_ids`). **D-5.6-007 (P1).**
- **§26.8.7 Source Org silent-consent (14-day timeout):** Auto-escalates to Ops review with `silent_consent_inferred=true` — no provision for non-responsive Source Orgs. M&A targets that have shut down or have absent admins risk forced transfer. **D-5.6-019 (P2).**
- **§26.8.7 Bulk Create endpoint:** Defines POST `/api/v1/seller/software/bulk` with full schemas. ✓ rate-limit class cited (`bulk_write` per §32.2). Per-product max 50 ("added in this section") — should be registered in §39. **D-5.6-011 covers (numerical singleton).**
- **§26.8.7 SoftwarePage Preview Tokens:** Same JWT-key-version revocation ambiguity. **D-5.6-018 covers.**
- **§26.8.4 KB Namespace Isolation:** Cites `KB_Engineering_Spec §5.4` — KB Engineering Spec is retired in v7.0.0; canonical content is in §22. **D-5.6-021 (P3).**

### §26.9 SEO Requirements

- **§26.9.5 step 4:** Authored Extension flagged for Search Console API access — sound but creates a P1-equivalent dependency risk if access cannot be procured by launch. (Not filed; the Authored Extension flag is the correct surfacing mechanism.)
- **§26.9.7 OG Image Generator:** Authored Extension; depends on `@vercel/og` or equivalent satori renderer. Authored Extension flagged. (Not filed.)
- **§26.9.10 Page Accessibility & CWV:** Comprehensive; includes performance budgets and a11y audit cadence. ✓
- **Surface/Engine mapping:** §26.7.2 split-pane enrichment review pane, §26.8.7 product-transfer wizard, §26.7.6 preview-token issuance UI, §26.9.7 default OG image generator — none have explicit Appendix M.1 rows. **D-5.6-016 (P2).**

### §26.10 Acceptance Criteria (Extended)

- 46 numbered, testable, scope-bound acceptance criteria covering §26.7–§26.9. ✓ Convention-compliant per §13.10/§14.9/§17.8/§20.7 style.
- Webhook references in ACs (`vendor_opt_out.applied`, `seller_org_page.published`, etc.) but §26 itself doesn't author the §31 webhook contracts (HMAC-SHA256, idempotency, retry curve, payload size, Appendix C registration). **D-5.6-015 (P2).**

---

## Counterfactual Pass — Three Failure Modes Per Major Feature

### F-415 Seller Profile

1. Seller authors profile with all required fields but `verification_tier` not yet earned: **engine-buildable** (default to `basic` per §27.4.3 line 21909).
2. Seller deletes profile while VerificationReviewRecord is `pending`: **silent** in §26 — cascade to VerificationReviewRecord lifecycle not specified.
3. Seller marketplace_opted_in flips false mid-evaluation: **partially covered** by §4.4.10 state machine but not surfaced in §26.1.

### F-416 Verification Tiers

1. SOC 2 expires while seller holds Certified: covered by §4.4.21 failure mode 2 (mid-quarter expiry).
2. Reviewer-collusion attempt: covered by §4.4.21 separation-of-duties.
3. EU-residency seller submits documents to US reviewer: covered by §4.4.21 residency-scoped reviewer pool.

### F-417 Capability Declarations

1. Cross-org evidence reference: covered by §4.4.4 invariant #3.
2. Seller publishes narrative-only with capability-like text: surfaces nudge per §4.4.4 AC #8.
3. Capability registered against deprecated Marketplace Category without successor: covered by §4.4.4 quarantine state.

### F-419 Seller Organization Page

1. Domain verification revoked post-publication: covered by §26.7.3 cascade.
2. Concurrent enrichment requests: covered by §26.7.2 7-day rate limit.
3. Enrichment service entirely down: covered by §26.7.2 failure-modes table.

### F-420 SellerOrgPage Enrichment

1. **Cost-center routing under §21.4.2 vs §4.4.10 contradiction:** UNRESOLVED — billing surface ambiguity. **D-5.6-001 (P0).**
2. Enrichment validator rejects content (anti-spam): covered by §26.7.2.
3. Firecrawl rate-limited mid-crawl: not explicitly covered — silent on partial crawl recovery.

### F-423 SellerSoftware & Software Pages

1. Concurrent claim attempts from two Orgs: covered by §26.8.2 dispute resolution.
2. Parent SellerSoftware transferred mid-bid: covered by §26.8.7 transfer flow + Bid Workspace impact (claim_pending reset).
3. Soft-deleted SellerSoftware with active SoftwarePage: covered by §26.8.1 soft-delete cascade + §4.4.11 archive transition.

### Vendor Opt-Out Cascade

1. Opt-out targets a SellerOrgPage with active enrichment in flight: **NOT covered.** What happens to the in-flight enrichment AIOperation? Settled or cancelled? Charged or not? **D-5.6-023 covers.**
2. Opt-out targets SellerSoftware in mid-claim-dispute: **NOT covered.** Both `claim_disputed` Orgs see the listing; opt-out from neither yet authoritative.
3. Buyer accesses cached SellerOrgPage during cache-purge race: covered by §26.7.6 60-second snapshot TTL.

---

## Self-Challenge Pass

Re-reading findings as a hostile staff engineer:

- **D-5.6-001 (P0):** Could a thoughtful engineer reconcile by reading "§4.4.10 cost_center is the *page-side* cost center, not the *capability-side* cost center"? **No** — the field is named `enrichment_cost_center` and the §26.7.2 step 2 prose explicitly says "Cost center: `sourcera_owned` (`platform_marketing`); the seller is NOT charged." Two different sources state the customer is not charged; one source (§21.4.2 / §29102 / §29616) says they are. The contradiction is direct and severity P0 stands. (One hedge: §29616 row 8 footnote does say `customer_billed` BUT the gates table renders Free 0 / Starter 3 / Growth 20 / Scale 80 / Ent unmetered as "operations" — could be quotas of free operations followed by overage. But §4.4.10 hardcodes the field at `sourcera_owned (fixed)`, foreclosing any "first N free, rest billed" interpretation. P0 stands.)

- **D-5.6-002 (P1):** The three criteria sets are non-overlapping. A junior engineer building Verified-tier validation against §26.2 (OpenCorporates lookup) would build the wrong thing if §4.4.21's "SOC 2 OR ISO 27001 documentation" is canonical. P1 stands.

- **D-5.6-003 (P1):** §26.1 promises a Seller Profile field that §4.4.3 doesn't define. Trivial fix (add `verification_tier` to §4.4.3 and cite the `seller_verification_tier` enum from Appendix J), but until fixed, the Seller Profile entity cannot return verification tier in API responses. P1 stands.

- **D-5.6-004 (P1):** §26.3 schema is the v6.0.0 thin schema, not the v7.0.0 §4.4.4 schema. §26.3 references a `verification_status` enum (`pending`, `evidence_provided`, `verified`) that does not exist in Appendix J and conflicts semantically with §4.4.4 `capability_declaration_state`. P1 stands.

- **D-5.6-005 (P1):** Whether `page_enrichment` is an "alias" of `seller_page_enrichment` per §4.8.2 `aliases` array is theoretically possible, but unstated. The §4.4.10 / §4.4.11 enum field hardcodes `page_enrichment` as the only valid value — meaning the registry's canonical id is rejected at write time. P1 stands.

- **D-5.6-006 (P1):** `SellerSoftwareTransferRequest` is a wholly new entity referenced in §26.8.7 step 1 ("New `SellerSoftwareTransferRequest` row created with `transfer_status=requested`") but not defined in §4. No field schema, no state machine, no acceptance criteria. P1 stands.

- **D-5.6-007 (P1):** `former_org_ids` is referenced in §26.8.7 step 5; §4.4.9 has only `former_kb_namespace_ids`. Parallel structure — could be added trivially — but until then the transfer flow's audit-trail field is undefined. P1 stands.

- **D-5.6-008 (P1):** §4.5.6 line 6966 explicitly says "Opted-out entity's own page MUST render `410 Gone`". §4.4.10 AC #3 explicitly says "Public GET requests for a suppressed page MUST return HTTP 200 with the placeholder body (not 404; 404 would break SEO and invite recrawl thrash)". §26.9.5 reinforces the HTTP 200 + noindex pattern. Two sources (§4.4.10 / §26.9.5) say 200 + noindex; one source (§4.5.6) says 410 Gone. The reconciliation argument from §4.4.10 ("404 would break SEO and invite recrawl thrash") is technically sound — 410 Gone is also generally SEO-okay because it signals permanent removal — but the contradiction would result in different implementations. P1 stands.

- **D-5.6-009 (P1):** §4.4.9 state machine note (line 4998) and §26.8.1 unclaimed-products prose say public SoftwarePages render for unclaimed products with a claim CTA. §26.8.5 publication gate and §4.4.11 publication gate require `claim_status = claim_verified`. The reconciliation could be that "unclaimed page" is rendered server-side from SellerSoftware data without an entity-level published SoftwarePage row — but this is unstated and the slug resolution path is unclear. P1 stands.

All P0/P1 defects survive the hostile-reviewer pass.

P2/P3 defects re-checked for sharpness — no revisions; all recommendations cite specific sections and line numbers.

---

## Promotion to DEFECT_LEDGER.md

25 defects promoted: 1× P0, 8× P1, 12× P2, 4× P3. See `DEFECT_LEDGER.md` Phase 5.6 block.
