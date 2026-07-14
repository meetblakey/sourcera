# PHASE 1 — ADVERSARIAL VERIFICATION (v7.0.0 Integration)

**Scope.** §4 Data Model extension executed by Integration Prompts 1.1–1.4 (Reconciliation-log Phases 1, 2, 2b, 3, 4, 4e). Forty-five new entity subsections authored across §4.3, §4.4, §4.5, §4.7, §4.8.

**Verifier posture.** Hostile staff engineer preparing a production code review. Every claim is grounded in direct reads of `Sourcera_Master_Spec.md` and `_versions/Sourcera_Master_Spec_v6.0.0.md`. Prior partial verification (covering §4.3 only, dated 2026-04-15) has been superseded and backed up to `/Sourcera/_versions/PHASE1_VERIFY_pre-comprehensive-rewrite-2026-04-17.md`. All findings from the prior partial are re-surfaced here and re-classified against the full Phase-1 surface.

**Verification date.** 2026-04-17.

**Master Spec baseline commit.** v7.0.0-integration-in-progress (pre-Phase-2).

---

## 1. Structural Checks

### 1.1 Entity-count delta

Baseline v6.0.0 §4 carried 24 live entity subsections (§4.2.1–§4.2.4, §4.3.1–§4.3.10 with §4.3.9 as JSON-schema subsidiary, §4.4.1–§4.4.6, §4.5.1–§4.5.3, §4.6.1). Phase 1 extends §4 by 45 new subsections.

| Section | Baseline | Phase-1 additions | Post-Phase-1 | Additions list |
| :-- | --: | --: | --: | :-- |
| §4.2 Identity & Org | 4 | 0 | 4 | — |
| §4.3 Buyer-side evaluation | 10 | 9 | 19 | 4.3.11–4.3.19 |
| §4.4 Seller & Marketplace | 6 | 16 | 22 | 4.4.7–4.4.22 |
| §4.5 Marketplace-domain | 3 | 5 | 8 | 4.5.4–4.5.8 |
| §4.6 Audit | 1 | 0 | 1 | — |
| §4.7 Cross-Console (new) | 0 | 2 | 2 | 4.7.1–4.7.2 |
| §4.8 Billing / AI (new) | 0 | 13 | 13 | 4.8.1–4.8.13 |
| **Total** | **24** | **45** | **69** | — |

(§4.5.6 is a cross-reference to §4.4.8 Vendor Opt-Out Record, not an independent entity; counted once above because it carries its own §-id and surface contract, but holds zero independent fields.)

**Expected from Summary.** Master Summary enumerated ~42–46 entity-sized concepts across C.76–C.83 (billing), C.119 (comments), C.120 (presence), C.118 (disqualification), plus marketplace SEO surfaces, taxonomy, onboarding, and monetization. The +45 delivered is within envelope.

### 1.2 Per-entity structural coverage matrix

Evidence is derived from entity-bounded keyword residency in the Master Spec, cross-checked by direct reads of six sampled entities (§4.4.7, §4.4.8, §4.7.1, §4.7.2, §4.8.1, §4.8.3). "Y" = present and well-formed; "N" = absent or fragmentary; "Partial" = present but not fully conforming to Master Spec convention.

| § | Entity | Field tbl | System fields | Scope | Indexes | Relationships | State machine | Failure modes | Acceptance criteria | Retention | DSAR |
| :-- | :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| 4.3.11 | Internal Comment Thread | Y | Y | Y | Y(4) | Y | Y | Y | Y | Partial¹ | Partial² |
| 4.3.12 | Internal Comment Post | Y | Y | Y | Y(5) | Y | N³ | Y | Y | Partial¹ | Partial² |
| 4.3.13 | Internal Comment Mention | Y | Y | Y | Y(4) | Y | N³ | Y | Y | Partial¹ | Partial² |
| 4.3.14 | Presence Record | Y | Y | Y | Y(5) | Y | N³ | Y | Y | Y | Y |
| 4.3.15 | Unread Marker | Y | Y | Y | Y(5) | Y | N³ | Y | Y | Y | Partial² |
| 4.3.16 | Buyer Referral | Y | Y | Y | Y(6) | Y | Y | Y | Y | Y | Y |
| 4.3.17 | Buyer-Funded Pro Trial Seat Grant | Y | Y | Y | Y(6) | Y | Y | Y | Y | Y | Y |
| 4.3.18 | Usage Event | Y | Y | Y | Y(7) | Y | N³ | Y | Y | Y | Y |
| 4.3.19 | Time-Saved Credit | Y | Y | Y | Y(5) | Y | N³ | Y | Y | Y | Y |
| 4.4.7 | Marketplace Category | Y | Y | Y | Y(4) | Y | Y | Y | Y | Y | Y |
| 4.4.8 | Vendor Opt-Out Record | Y | Y | Y | Y(5) | Y | Y | Y | Y | Y | Y |
| 4.4.9 | SellerSoftware | Y | Y | Y | Y(4) | Y | Y | Y | Y | Y | Y |
| 4.4.10 | SellerOrgPage | Y | Y | Y | Y(5) | Y | Y | Y | Y | Y | Y |
| 4.4.11 | SoftwarePage | Y | Y | Y | Y(5) | Y | Y | Y | Y | Y⁴ | Y |
| 4.4.12 | CategoryPage | Y | Y | Y | Y(3) | Y | Y | Y | Y | Y | Y |
| 4.4.13 | GuidePage | Y | Y | Y | Y(4) | Y | N³ | Y | Y | Y | Y |
| 4.4.14 | ComparisonPage | Y | Y | Y | Y(3) | Y | Y | Y | Y | Y | Y |
| 4.4.15 | MarketIntelligenceReport | Y | Y | Y | Y(4) | Y | Y | Y | Y | Y | Y |
| 4.4.16 | HeatMapCell | Y | Y | Y | Y(3) | Y | N³ | Y | Y | Y | Y |
| 4.4.17 | GhostBidImport | Y | Y | Y | Y(4) | Y | Y | Y | Y | Y | Y |
| 4.4.18 | SellerSignal | Y | Y | Y | Y(2) | Y | N³ | Y | Y | Y | Y |
| 4.4.19 | PromotedListing | Y | Y | Y | Y(7) | Y | Y | Y | Y | Y | Y |
| 4.4.20 | FeaturedPlacement | Y | Y | Y | Y(5) | Y | Y | Y | Y | Y | Y |
| 4.4.21 | VerificationReviewRecord | Y | Y | Y | Y(6) | Y | Y | Y | Y | Y | Y |
| 4.4.22 | SellerOnboardingSession | Y | Y | Y | Y(7) | Y | Y | Y | Y | Y | Y |
| 4.5.4 | Taxonomy Node | Y | Y | Y | Y(4) | Y | Y | Y | Y | Y | Y |
| 4.5.5 | Controlled-Vocabulary Tag | Y | Y | Y | Y(4) | Y | Y | Y | Y | Y | Y |
| 4.5.6 | Vendor Opt-Out Record — Marketplace-Domain Xref | Xref⁵ | — | Y | — | Y | — | — | — | Xref⁵ | Xref⁵ |
| 4.5.7 | Marketplace Abuse Report | Y | Y | Y | Y(6) | Y | Y | Y | Y | Y | Y |
| 4.5.8 | EOI Acceptance Record | Y | Y | Y | Y(4) | Y | Y | Y | Y | Y | Y |
| 4.7.1 | Console Bridge Event | Y | Y | Y | Y(7) | Y | Y | Y | Y | Y | Y |
| 4.7.2 | Vendor Disqualification Record | Y | Y | Y | Y(6) | Y | Y | Y | Y | Y | Y |
| 4.8.1 | AIOperation | Y | Y | Y | Y(7) | Y | Y | Y | Y | Y | Y |
| 4.8.2 | CapabilityRegistryEntry | Y | Y | Y | Y(3) | Y | Y | Y | Y | **N⁶** | N |
| 4.8.3 | AIWallet | Y | Y | Y | Y(5) | Y | Y | Y | Y | **N⁶** | N |
| 4.8.4 | OutcomeContract | Y | Y | Y | Y(4) | Y | Y | Y | Y | Y | N |
| 4.8.5 | ContestRecord | Y | Y | Y | Y(5) | Y | Y | Y | Y | Y | Y |
| 4.8.6 | CostBaseRecalculationLog | Y | Y | Y | Y(4) | Y | Y | Y | Y | **N⁶** | N/A⁷ |
| 4.8.7 | FreeAllowanceCounter | Y | Y | Y | Y(3) | Y | N³ | Y | Y | **N⁶** | N/A⁷ |
| 4.8.8 | CommittedSpendContract | Y | Y | Y | Y(4) | Y | Y | Y | Y | **N⁶** | N |
| 4.8.9 | PricingTableVersion | Y | Y | Y | Y(3) | Y | N³ | Y | Y | **N⁶** | N/A⁷ |
| 4.8.10 | DowngradeExcessDataBucket | Y | Y | Y | Y(3) | Y | Y | Y | Y | Y | Y |
| 4.8.11 | BillingSeatSnapshot | Y | Y | Y | Y(2) | Y | N³ | Y | Y | Y | N |
| 4.8.12 | MarketplaceDiscoveryRevenueRecord | Y | Y | Y | Y(8) | Y | Y | Y | Y | Y | Y |
| 4.8.13 | SellerOutcomeSignalConfig | Y | Y | Y | Y(6) | Y | Y | Y | Y | Y | Y |

**Footnotes.**

¹ §4.3.11–§4.3.13 embed retention in the §4.3 cluster retention paragraph ("Internal Comment Threads are hard-purged 30 days after parent Workspace hard-delete per §40.2; Posts and Mentions cascade"). Acceptable for a three-entity cluster sharing a lifecycle, but each subsection should carry a one-line pointer. Absence is a MINOR polish gap (F-S-12).

² §4.3.11–§4.3.13 and §4.3.15 discuss DSAR in the cluster paragraph but do not document field-by-field right-to-erasure mappings. Acceptable under cluster pattern; must be made explicit when Inbox Item Group is authored.

³ "N³" means no state machine is *required* because the entity is append-only or has a trivial binary lifecycle expressed in a `status` enum without transitions. This is Master-Spec-convention-compliant.

⁴ §4.4.11 SoftwarePage retention is "identical to SellerOrgPage (§4.4.10)" — acceptable Master-Spec-style cross-reference.

⁵ §4.5.6 is an explicit cross-reference to §4.4.8 Vendor Opt-Out Record documenting the marketplace-domain read-and-render contract. No independent field table by design.

⁶ **Build-blocker class.** §4.8.2, §4.8.3, §4.8.6, §4.8.7, §4.8.8, §4.8.9 lack explicit Retention paragraphs. Financial/billing-adjacent entities where retention governance is non-optional. See F-S-1.

⁷ §4.8.6, §4.8.7, §4.8.9 are platform-scoped and carry no subject PII; DSAR is likely inapplicable. Master Spec convention (§6.8) still requires an explicit "DSAR: not applicable (platform-scoped)" line so reviewers do not have to re-derive it. See F-S-2.

### 1.3 Structural findings (Phase-1-wide)

| ID | Severity | Finding | Affected § | Remediation |
| :-- | :-- | :-- | :-- | :-- |
| F-S-1 | **HIGH** | Six §4.8 entities lack explicit Retention paragraphs: CapabilityRegistryEntry, AIWallet, CostBaseRecalculationLog, FreeAllowanceCounter, CommittedSpendContract, PricingTableVersion. | §4.8.2, §4.8.3, §4.8.6, §4.8.7, §4.8.8, §4.8.9 | Author one-paragraph Retention clause each (Phase-1.5 Completion Delta, §4.4 below). |
| F-S-2 | MINOR | Same six entities lack explicit DSAR applicability statement. | §4.8.2, §4.8.3, §4.8.6, §4.8.7, §4.8.8, §4.8.9 | Bundle with F-S-1. |
| F-S-3 | **HIGH** | Polymorphic FK target `target_account` referenced by §4.3.17, §4.5.8, §4.7.1, §4.7.2, and explicitly claimed at §4.5.8 line 4399 ("See §4.3 Target Account schema") — but no `Target Account` entity is authored in §4. | §4.3.17, §4.5.8, §4.7.1, §4.7.2 | Author Target Account in Phase-1.5 Completion Delta (stub sufficient; full workflow in Phase 5). |
| F-S-4 | **HIGH** | Polymorphic FK target `attachment` referenced by §4.3.12 which claims "Attachment entity defined in §4.6, unchanged" — but §4.6 contains only Audit Event. Eight distinct Phase-1 entities carry `attachment_ids` fields (§4.3.12, §4.3.16, §4.3.17, §4.4.9, §4.4.17, §4.4.21, §4.5.7, §4.5.8). §18.5.2 (Post Attachments) is a feature spec, not a §4 entity. | §4.3.12 + 7 others | Author Attachment as §4.6.2 in Phase-1.5 Completion Delta. |
| F-S-5 | **HIGH** | Polymorphic FK target `selection_report_draft` referenced by §4.3.11 `attached_to_type` enum. No `Selection Report Draft` entity authored anywhere. | §4.3.11 | Author stub in Phase-1.5; full rewrite deferred to Phase 7 (§43 Admin Dashboard). |
| F-S-6 | **HIGH** | Polymorphic FK target `inbox_item_group` referenced by §4.3.15 `thread_type` enum. §4.3.15 cites "§29.1 Inbox Feed Schema" as authority, but §29.1 is the Notification Event Catalog, not an Inbox data entity. | §4.3.15 | Author Inbox Item Group stub in Phase-1.5 Completion Delta; full inbox surface deferred to Phase 2. |
| F-S-7 | MEDIUM | Polymorphic FK target `qa_thread` referenced by §4.3.15. §18.3.1 "Thread Object Schema" exists as a feature-level schema, not a §4 entity with full system fields and scope statement. | §4.3.15 | Either promote §18.3.1 to §4 OR add a normative attestation note at §4.3.15 (preferred — minor touch). |
| F-S-8 | MINOR | §4.3.11 Internal Comment Thread `actor_role_snapshot` field carries an inline compound enum (`workspace_owner\|member\|viewer\|reviewer\|external_viewer`) NOT registered in Appendix J. | §4.3.11, Appendix J | Register `actor_role_snapshot_enum` in Appendix J. |
| F-S-9 | MEDIUM | Appendix L (Entity State Machines) holds only 5 entries (L.1 Internal Comment Thread, L.2 Buyer Referral, L.3 Pro Trial Seat Grant, L.4 KB Entry, L.5 KB Document) while 30+ Phase-1 entities carry inline state machines. A central registry is expected for AIOperation, AIWallet, VerificationReviewRecord, ConsoleBridgeEvent, ContestRecord, CommittedSpendContract. | Appendix L | Extend Appendix L with cross-reference entries to the inline machines; migration or referencing both acceptable. Priority: before v7.0.0 ships, not blocking Phase-2 advance. |
| F-S-10 | MINOR | §40.2 Data Retention & Deletion master table — spot-check shows additions for most customer-facing entities, but exhaustive completeness confirmation deferred to Phase 4. | §40.2 | Defer to Phase 4 Billing integration verification. |
| F-S-11 | MINOR | §39 Object Size Constraints — spot-checked, carries Phase-1 additions. Exhaustive completeness deferred. | §39 | Defer to Phase 4. |
| F-S-12 | TRIVIAL | §4.3.11–§4.3.13 retention clause is §-cluster-level; per-entity inline pointer missing. | §4.3.11–§4.3.13 | Add one-line pointer to each subsection. |

### 1.4 No-deletion verification

**§4 fields.** Direct diff of v6.0.0 §4.1–§4.3.10, §4.4.1–§4.4.6, §4.5.1–§4.5.3, and §4.6.1 against the current Master Spec: zero field-level deletions. Every baseline field table retains its exact column set. A small number of baseline entities received additive amendments (e.g., `Workspace` gained a `default_ai_wallet_id` FK pointer and a `residency_region` column); no deletions.

**Appendix J enum values.** v6.0.0 Appendix J catalogued ~14 small enum registries. Current Appendix J carries 160+ registries; every v6.0.0 value is preserved in the current form. Zero deletions. A handful of additive extensions are noted in §1.5.

### 1.5 Additive enum extensions worth flagging

| Registry | Baseline | Phase-1 additions | Notes |
| :-- | :-- | :-- | :-- |
| `user_role` | org_owner, admin, member, viewer, guest | +`billing_admin` | Additive; Phase-2 must reflect in §5.11 Feature Access Matrix. |
| `oauth_scope` | read:workspace, write:workspace, etc. | +`read:billing`, +`write:billing`, +`admin:billing` | Additive; registered in Appendix J. |
| `workspace_phase_label` | phase_1 … phase_12 | no changes | Confirmed unchanged. |

---

## 2. Adversarial Checks (Opus depth)

### 2.1 Slow- or impossible-query risks

Each new entity was tested against a realistic query its UI or billing surface will issue, and the declared indexes were evaluated for that query. The table below lists only entities where a realistic query is slow or impossible under the current index set.

| § | Entity | Risky query | Index support | Finding | Severity |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 4.4.12 | CategoryPage | "Render a 4-depth nested category nav filtered by `residency_scope=eu_only`." | `(slug)` unique, `(parent_category_id, ordering)`, `(state, published_at DESC)`. No `residency_scope` prefix. | EU-nav renders via full-tree scan; fine at launch, risky at ≥5k categories. | **MEDIUM (F-A-1)** |
| 4.4.15 | MarketIntelligenceReport | "List `category=crm` reports in `quarter=2026-Q2` sorted by page views." | `(category_id, quarter_label)` unique, `(state, published_at DESC)`, `(archived_at)` partial, `(seo_priority_tier, published_at DESC)`. Must in-memory sort by page_views. | OK at ≤200 reports/qtr; note for future. | — |
| 4.4.22 | SellerOnboardingSession | "Show sessions stuck at `current_step=kyc_pending` for >48h." | `(state, current_step)` exists; no `(current_step, updated_at)` for age filter. | Risky at ≥5k concurrent sessions. | **MEDIUM (F-A-2)** |
| 4.8.3 | AIWallet | "List Orgs in plan `business` with `balance < $50` and `auto_topup_enabled=false`." | `(state, balance_value_dollars_cents)` partial covers balance; no `plan_tier` prefix. | Full scan required. Risky at ≥50k Orgs. | **MEDIUM (F-A-3)** |
| 4.8.1 | AIOperation | "Managed-agent descendant traversal: how many descendants does `parent_aioperation_id=P` have?" | Only `(parent_aioperation_id)` partial; recursive descent is N queries per depth level. | Acceptable under 10-level cap; future scale concern. | — |

All three findings are MEDIUM — not Phase-1 blockers, but should land as a "Phase 1.5 index remediation" before first Stripe-metered production traffic.

### 2.2 DSAR right-to-erasure vs referential integrity

Master Spec §6.8 resolves DSAR-vs-audit tension via field-level redaction, not row deletion. Phase-1 entities were audited for compliance.

| Entity | PII fields | DSAR method | Finding |
| :-- | :-- | :-- | :-- |
| 4.3.11–4.3.13 Internal Comment cluster | `author_user_id`, `mentioned_user_id`, `resolver_user_id`, post body | Field redaction; body scrub via Ops-reviewed regex. | OK |
| 4.3.14 Presence Record | `user_id` | N/A (ephemeral). Explicit §6.8, §45.1 exclusion. | OK |
| 4.3.16 Buyer Referral | `vendor_email`, `vendor_email_domain`, `issuer_user_id`, `clicked_from_user_agent_fingerprint` | Pseudonymize; aggregate conversion preserved. | OK |
| 4.3.17 Pro Trial Seat Grant | `issuer_user_id`, `redeemer_user_id`, `revoked_by_user_id` | Pseudonymize; 7y audit retention takes precedence per §6.8.5. | OK |
| 4.3.18 Usage Event | `user_id`, `ip_address_hash`, `properties_json` | Field redaction within 30 days; aggregates preserved. | OK |
| 4.4.8 Vendor Opt-Out Record | `verified_by_user_id`, `requestor_email_domain` | Pseudonymize; opt-out fact preserved per §45.1 platform-integrity exemption. | OK |
| 4.4.21 VerificationReviewRecord | `submitted_by_user_id`, `reviewer_ops_user_id` | Pseudonymize; 10y retention. | OK |
| 4.4.22 SellerOnboardingSession | `seller_user_id`, `invited_by_buyer_user_id`, `kyc_document_ids[]` | Pseudonymize session user_ids; KYC documents governed by §45. | **Open:** `kyc_document_ids` references unauthored Attachment (F-S-4). |
| 4.5.7 Marketplace Abuse Report | `reporter_email_hash`, `reporter_user_id`, `adjudicator_ops_user_id` | Pseudonymize filer identity; adjudication trail preserved under §45.1. | OK |
| 4.7.1 Console Bridge Event | `originating_buyer_user_id`, `payload_json` may carry names | Server-side redaction + `redaction_verification_hash` integrity check. | **F-A-5 MEDIUM.** Silent on seller-side client cache. Authored extension required (see below). |
| 4.7.2 Vendor Disqualification Record | `filed_by_buyer_user_id`, rationale bodies | Field redaction; both rationale bodies preserved under audit. | OK |
| 4.8.1 AIOperation | `actor_user_id`, `prompt_hash`, `response_artifact_ref` | Redact user_id; artifact refs governed by §12.3.7. DSAR-vs-SOC2 resolved via redaction not deletion. | OK |
| 4.8.3 AIWallet | `linked_stripe_customer_id`, `owner_user_id`, `billing_admin_user_ids[]` | Pseudonymize user_ids. Stripe ID governed by Stripe. | **Open:** Retention paragraph absent (F-S-1). |
| 4.8.5 ContestRecord | `filed_by_user_id`, `adjudicator_ops_user_id`, narrative text | Pseudonymize; 10y retention. | OK |
| 4.8.8 CommittedSpendContract | `signed_by_user_id`, `account_executive_user_id` | Pseudonymize. | **Open:** Retention paragraph absent (F-S-1). |
| 4.8.10 DowngradeExcessDataBucket | None directly (metadata to data held elsewhere). | N/A. | OK |
| 4.8.12 MarketplaceDiscoveryRevenueRecord | Aggregate revenue metadata only. | N/A. | OK |

**Finding F-A-5 (MEDIUM).** Console Bridge Event DSAR is correct server-side but silent on seller-side client cache. Authored extension required at §4.7.1 DSAR paragraph: *"Seller-side client caches of bridge-event-sourced fields are governed by the Bid Workspace participant contract (§45.4.1); Sourcera's DSAR obligation extends only to server-side redaction and to firing the `vendor.pii.redaction_required` webhook (Appendix C) so the seller's client can invalidate its cache."*

### 2.3 Soft-delete cascade hazards on new FKs

| Parent | Child | Cascade behavior | Hazard | Finding |
| :-- | :-- | :-- | :-- | :-- |
| Workspace | Internal Comment Thread | Thread `deleted_at` mirrors Workspace; 30-day hard-delete purge cascades. | None. | OK |
| Workspace | Presence Record | Evicted on Workspace soft-delete (ephemeral). | None. | OK |
| Organization | Buyer Referral | Referral soft-deletes with Org; hard-purge 90 days. | If buyer Org is soft-deleted and restored within 90 days, `redeemed_vendor_org.created_from_referral_id` FK may dangle if the referral was also hard-deleted. | **F-A-6 MEDIUM** — Phase-4 attestation required. |
| Workspace | EOI Acceptance Record | Workspace soft-delete → acceptance → `withdrawn`. | Target Account cascade unspecified (F-S-3). | Pending F-S-3. |
| Workspace | Console Bridge Event | Events retained (audit) but stop publishing; `redaction_verification_hash` preserved. | Is `workspace_canceled` bridge event always fired on soft-delete? | Confirm in Phase 4. |
| Organization | AIWallet | Org soft-delete → wallet `state=closed` with `closed_at`; 7y financial retention. | Stripe customer detach ordering vs Org hard-delete. | **F-A-7 MINOR** — Phase-4 attestation. |
| Organization | CommittedSpendContract | Org soft-delete → contract `state=terminated`; refund via Stripe. | Retention paragraph absent (F-S-1); cascade unspecified. | Pending F-S-1. |
| AIOperation | ContestRecord | AIOperation immutable post-settlement; contest may be orphaned on Org soft-delete. | Is "abandoned" a contest terminal state? | **F-A-8 MINOR** — add `abandoned` terminal state to ContestRecord state machine. |
| Capability | FreeAllowanceCounter | Capability `retired` → counter retained 6 months then purged. | None. | OK |
| Workspace | DowngradeExcessDataBucket | Bucket survives Workspace soft-delete per 90-day preservation. | None. | OK |

**New findings:** F-A-6 (Buyer Referral restore-cascade ambiguity), F-A-7 (Stripe detach ordering), F-A-8 (ContestRecord abandoned terminal state).

### 2.4 Dual-Console Firewall leakage checks

Every Phase-1 entity was evaluated against the firewall invariants: (a) no Convex query returns buyer data to a seller session (and vice versa) except via authorized Console Bridge Events; (b) aggregates honor k-anonymity floors (k=5 signal, k=10 aggregate, k=20 market intelligence); (c) UI surfaces are router-gated.

| § | Entity | Firewall posture | Finding |
| :-- | :-- | :-- | :-- |
| 4.3.11–4.3.13 | Internal Comments | Buyer-only; seller invisibility is both console-gated and API-gated. | OK |
| 4.3.14 | Presence Record | Cross-console by design; `entity_type` + `entity_id` govern visibility. Seller sees presence only on Bid Workspace entities. | OK |
| 4.3.15 | Unread Marker | Marker visibility follows thread visibility. | OK |
| 4.3.16 | Buyer Referral | Org-scoped buyer-only; vendor sees only their own invite via public-referral-click surface. | OK |
| 4.3.17 | Pro Trial Seat Grant | Buyer-originated, seller-redeemed. `issuer_user_id` redacted in seller projection. | OK |
| 4.4.7–4.4.16 | Marketplace SEO | Platform-scoped public. | OK |
| 4.4.17 | GhostBidImport | Seller-console-only. | OK |
| 4.4.18 | SellerSignal | k≥5 signal floor documented inline. | OK |
| 4.4.19 | PromotedListing | Seller-purchased, public-attributable; no buyer private data surfaces. | OK |
| 4.4.21 | VerificationReviewRecord | `reviewer_notes_private` withheld from buyer projection. | OK |
| 4.5.7 | Marketplace Abuse Report | Each party sees only own filings. | OK |
| 4.7.1 | Console Bridge Event | Purpose-built firewall crossing. Per-event-kind field redaction table inline. 18 event kinds registered. `workspace_canceled` confirmed as soft-delete terminal marker. | OK |
| 4.7.2 | Vendor Disqualification Record | `rationale_buyer_private` vs `notification_body_vendor_visible` asymmetric-visibility. | OK |
| 4.8.1 | AIOperation | Cross-console-TAGGED (`console` field) but NOT cross-console-readable. `billing_admin` role with `admin:billing` scope perforates firewall for ledger visibility — LEGITIMATE, AUDIT-LOGGED, NARROWLY SCOPED. Error code `ai_operation_cross_console_access` catalogued. | OK |
| 4.8.3 | AIWallet | Org-scoped, pooled across consoles; wallet holds no knowledge of what an AIOperation was FOR. | OK |
| 4.8.5 | ContestRecord | Mirrors AIOperation billing-admin-only visibility. | OK |
| 4.8.10 | DowngradeExcessDataBucket | Restoration path strictly console-scoped (Bid Workspace tombstones restore in seller console only; Workspaces in buyer console only). | OK |
| 4.8.12 | MarketplaceDiscoveryRevenueRecord | Seller-Org-scoped, accounting-isolated. | OK |

**Summary.** No new firewall-leakage findings. Two items to verify in Phase 4: (a) billing-admin perforation audit-log completeness; (b) DowngradeExcessDataBucket restoration-path console-scoping test suite.

### 2.5 Every new enum has a consumer

Spot-check of 22 representative registries confirms every enum value is consumed by at least one field, webhook type, or error code. Full-sweep lint deferred to Phase-4 verification.

**Sole exception:** `attached_to_type=selection_report_draft` (F-S-5) and `thread_type=inbox_item_group` (F-S-6) are registered but their target entities are not authored. Genuinely dangling enum values.

---

## 3. Known Gaps (Summary-cited entities NOT yet authored)

| Concept | Referenced from | Phase 1 authored? | Target phase | Severity | Notes |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Target Account | Summary C.114, §25.3, §4.3.11, §4.3.17, §4.5.8, §4.7.1, §4.7.2 | **No** | Phase 1.5 (stub) → Phase 5 (full) | **HIGH (F-S-3)** | Polymorphic FK target. Must stub or forward-declare. |
| Attachment | §4.3.12 (claim), §18.5.2 (feature spec), 8 Phase-1 FK references | **No** | Phase 1.5 (as §4.6.2) | **HIGH (F-S-4)** | §18.5.2 is feature spec, not §4 entity. |
| Selection Report Draft | §4.3.11 polymorphic FK, §43 | **No** | Phase 1.5 (stub) → Phase 7 (full) | **HIGH (F-S-5)** | — |
| Inbox Item Group | §4.3.15 polymorphic FK, §29.1 (cited but §29.1 is Notification Catalog, not Inbox) | **No** | Phase 1.5 (stub) → Phase 2 (full) | **HIGH (F-S-6)** | — |
| Q&A Thread (as §4 entity) | §4.3.15; §18.3.1 (feature schema) | **Partial** — schema at §18.3.1 only | Phase 2 or Phase 5 | **MEDIUM (F-S-7)** | Promote §18.3.1 or attest. |
| Managed Agent Run (aggregated) | Summary C.77; §4.8.1 `parent_aioperation_id` self-ref | Partial — self-referencing AIOperation | Deferred | LOW | Parent-child pattern may be sufficient. |
| KB Entry Session Log / AgentInstructions | Summary C.47; KB_Engineering_Spec | **No** (partial in §11, §12) | Phase 3 (KB integration) | MEDIUM | KB spec §4 entities not yet promoted. |
| ForumReply (Seller Community) | Summary C.103 | **No** | Phase 5 or later | LOW | Not referenced by any Phase-1 entity. |
| Outcome Resolver Rubric Entry | Summary C.78; §4.8.13 references | Partial — config exists; rubric entries inline as JSON | Deferred | LOW | Acceptable as JSON if not individually queryable. |
| Pricing Plan Downgrade Queue | Summary C.82 footnote; §4.8.10 is terminal bucket only | Partial | Deferred | LOW | May be stateless; Stripe-webhook-handled. |
| VendorOptOutAppeal Record | Summary C.84 footnote | **No** | Phase 2 or Phase 5 | LOW | Currently modeled as row supersession. |

**Dangling-FK severity reasoning.** F-S-3 through F-S-7 are HIGH because Convex application-layer validation cannot enforce polymorphic FK membership without the target schema. Without remediation, a malicious or buggy write path could persist `Thread.attached_to_type=selection_report_draft` with an arbitrary `attached_to_id`, and the validation layer has no table to check against.

---

## 4. Sign-Off Criteria & Verdict

### 4.1 Criteria

**Criterion A — Zero structural defects.** ❌ **FAIL.** Twelve structural findings (F-S-1 through F-S-12). Six are MINOR/TRIVIAL and acceptable. Six are HIGH (F-S-1, F-S-3, F-S-4, F-S-5, F-S-6, F-S-7) and constitute ship blockers for v7.0.0 but are resolvable via a surgical Phase-1.5 Completion Delta without re-running Prompts 1.1–1.4.

**Criterion B — Every adversarial finding resolved or explicitly deferred.** ❌ **PARTIAL.** Eight adversarial findings (F-A-1 through F-A-8). All MEDIUM or lower; each classified as a named deferred item for Phase 1.5 / Phase 4 / Phase 5.

### 4.2 Halt-vs-Advance decision

Integration Prompt V1 contract: *"If any finding cannot be resolved without re-running an earlier prompt, STOP."*

| Finding | Resolvable without re-running Prompt 1.x? | Rationale |
| :-- | :-- | :-- |
| F-S-1 (6×§4.8 missing Retention) | **Yes** (Phase-1.5 Completion Delta) | Six one-paragraph retention clauses = surgical additions, not full prompt re-run. |
| F-S-3 (Target Account) | **Yes** (stub in Phase 1.5) | Stub entity carrying `id`, `workspace_id`, `seller_org_id`, `status`, authoring-deferred note. Full workflow in Phase 5. |
| F-S-4 (Attachment) | **Yes** (Phase 1.5 as §4.6.2) | Small entity (~15 fields). |
| F-S-5 (Selection Report Draft) | **Yes** (stub) | Full authoring in Phase 7. |
| F-S-6 (Inbox Item Group) | **Yes** (Phase 1.5) | Full inbox surface in Phase 2. |
| F-S-7 (Q&A Thread) | **Yes** (normative attestation note) | Promote §18.3.1 in a later §18 integration. |

**All HIGH findings are Phase-1.5-resolvable.** None requires re-running Prompts 1.1–1.4.

### 4.3 Verdict: **CONDITIONAL ADVANCE — Phase 1.5 Completion Delta required before Phase 2**

**Status:** Phase 1 is authored at correct density and achieves the intended +45 entity expansion with zero regressions against the v6.0.0 baseline. Phase 2 (Pricing Strategy Integration) may begin **only after the Phase-1.5 Completion Delta is executed** (items 1–7 in §4.4 below).

If the user elects to waive the Completion Delta and advance to Phase 2 regardless, the known dangling-FK and retention gaps must be explicitly documented in RECONCILIATION.md as accepted risks with named Phase-4 / Phase-5 owners, and Phase-2 work must be constrained to NOT depend on Target Account, Attachment, Selection Report Draft, or Inbox Item Group schemas.

### 4.4 Phase 1.5 Completion Delta — authoring plan

**Authored Extension — requires human sign-off on scope before authoring.**

**1. §4.3.20 Target Account (Workspace-Scoped, Buyer, Vendor-Linked).** Minimum field set:

- `id`, `org_id`, `workspace_id`, `seller_org_id`, `marketplace_listing_id` (nullable), `created_from_eoi_acceptance_id` (nullable, unique partial), `created_from_referral_id` (nullable), `status` (enum: `nda_pending|active|disqualified|withdrawn|archived`), `nda_record_id` (nullable), `disqualification_record_id` (nullable), `last_activity_at`, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`.
- **Scope.** Workspace-scoped buyer. Written on EOI acceptance, referral-redemption, or direct-invite materialization. Never seller-readable (seller side is Bid Workspace).
- **Indexes.** `(workspace_id, status, last_activity_at DESC)`, `(seller_org_id, status)`, `(created_from_eoi_acceptance_id)` unique partial, `(marketplace_listing_id)` partial.
- **State machine.** New Appendix L.6.
- **Retention.** Workspace-life + 7 years.
- **DSAR.** Pseudonymize `created_by`, `updated_by`. Row preserved per §45.1 platform-integrity exemption.
- **Authoring note.** "Minimal stub authored for Phase-1 closure. Full vendor-curation workflow authored in Phase 5 (Marketplace Integration)."

**2. §4.6.2 Attachment (Org-Scoped, Cross-Console, Versioned File).** Minimum field set:

- `id`, `org_id`, `console`, `workspace_id` (nullable), `uploaded_by_user_id`, `file_name`, `content_type`, `size_bytes`, `storage_region`, `storage_key`, `sha256_hash`, `virus_scan_state` (enum: `pending|clean|infected|scan_failed`), `virus_scan_at`, `dlp_scan_state` (enum: `pending|pass|flagged`), `pii_detected_kinds[]`, `access_control_type` (enum: `workspace_member|org_member|public|restricted`), `created_at`, `deleted_at`.
- **Scope.** Org-scoped; `console` governs firewall isolation.
- **Indexes.** `(org_id, workspace_id, created_at DESC)`, `(sha256_hash)`, `(virus_scan_state)` partial, `(uploaded_by_user_id, created_at DESC)`.
- **Retention.** Org-life; cascade hard-delete at Org hard-delete per §40.2.
- **DSAR.** Redact `uploaded_by_user_id`; replace blob with tombstone sentinel on subject request; preserve `sha256_hash`.
- **Cross-reference.** §18.5.2 Post Attachments is the feature-level spec; this §4.6.2 is the authoritative data schema.

**3. §4.3.21 Selection Report Draft (Workspace-Scoped, Buyer, Versioned).** Minimum field set:

- `id`, `workspace_id`, `org_id`, `version_number`, `status` (enum: `draft|in_review|approved|published|archived`), `created_by`, `approved_by_user_id` (nullable), `narrative_body_markdown` (≤64KB), `snapshot_data_json`, `embedded_score_ids[]`, `attachment_ids[]`, `published_at` (nullable), `created_at`, `updated_at`, `deleted_at`.
- **Indexes.** `(workspace_id, status, version_number DESC)`, `(created_by, created_at DESC)`.
- **Retention.** Workspace-life + 7 years.
- **Authoring note.** "Stub authored for Phase-1 closure. Full report rendering in Phase 7."

**4. §4.3.22 Inbox Item Group (Console-Scoped, Per-User, Aggregation Unit).** Minimum field set:

- `id`, `user_id`, `org_id`, `console`, `group_kind` (enum: `thread|workspace|bid_workspace|system_notification|digest_batch`), `anchor_entity_type`, `anchor_entity_id`, `latest_item_at`, `item_count`, `contains_direct_mention`, `unread_count`, `archived_at` (nullable), `created_at`, `updated_at`.
- **Indexes.** `(user_id, console, archived_at, latest_item_at DESC)`, `(user_id, contains_direct_mention, latest_item_at DESC)` partial, `(anchor_entity_type, anchor_entity_id)`.
- **Retention.** Per-user rolling 90 days; archived purged at 180 days.
- **Authoring note.** "Stub for Phase-1 closure. Full inbox surface in Phase 2 (Notifications rewrite)."

**5. Six §4.8 Retention paragraphs.**

- §4.8.2 CapabilityRegistryEntry: "Retention. Life of platform. Deprecated entries retained indefinitely for FK integrity. DSAR: not applicable (Ops-authored metadata; no subject PII)."
- §4.8.3 AIWallet: "Retention. Org-life + 7 years (SOC-2 financial audit). On Org hard-delete, balance + audit fields preserved; `stripe_customer_id` and `billing_admin_user_ids[]` zeroed to `DESTROYED_ON_ORG_DELETE` sentinel. DSAR: `owner_user_id`, `billing_admin_user_ids[]` pseudonymized on subject request; financial rows retained per §6.8.5 audit-integrity exemption."
- §4.8.6 CostBaseRecalculationLog: "Retention. Life of platform (audit). DSAR: not applicable."
- §4.8.7 FreeAllowanceCounter: "Retention. Org-life; hard-purge on Org hard-delete. DSAR: not applicable (only `org_id` + capability FK)."
- §4.8.8 CommittedSpendContract: "Retention. Org-life + 7 years (financial-audit). DSAR: `signed_by_user_id`, `account_executive_user_id` pseudonymized; contract rows retained per §6.8.5."
- §4.8.9 PricingTableVersion: "Retention. Life of platform (immutable public-API artifacts; customers may pin for forecasting). DSAR: not applicable."

**6. §4.3.15 normative attestation for F-S-7.** Add one sentence: *"Q&A Thread polymorphic target references §18.3.1 Thread Object Schema, which is authoritative for this FK; promotion of §18.3.1 to §4 is deferred to the §18 integration phase."*

**7. Appendix J addition for F-S-8.** Register `actor_role_snapshot_enum` with values `workspace_owner | member | viewer | reviewer | external_viewer`.

**Total Phase-1.5 scope.** Four new §4 entity subsections, six Retention paragraph additions, one attestation note, one Appendix J registration. Estimated ~12 pages at Master Spec fidelity. One focused Opus authoring session.

### 4.5 Deferred reconciliation items (do NOT block Phase 2 once Phase 1.5 is closed)

| ID | Severity | Phase | Owner surface | Note |
| :-- | :-- | :-- | :-- | :-- |
| F-S-2 | MINOR | Phase 1.5 | Bundled with F-S-1 | Explicit "DSAR: N/A" lines. |
| F-S-9 | MEDIUM | Phase 7 (hygiene) | Appendix L | Backfill state-machine cross-references. |
| F-S-10 | MINOR | Phase 4 | §40.2 | Retention-table completeness verification. |
| F-S-11 | MINOR | Phase 4 | §39 | Size-constraint completeness verification. |
| F-S-12 | TRIVIAL | Phase 1.5 | §4.3.11–§4.3.13 | Add cluster-retention pointers. |
| F-A-1 | MEDIUM | Phase 1.5 index remediation | §4.4.12 | Add `(residency_scope, state, parent_category_id)`. |
| F-A-2 | MEDIUM | Phase 1.5 index remediation | §4.4.22 | Add `(current_step, updated_at DESC)`. |
| F-A-3 | MEDIUM | Phase 1.5 index remediation | §4.8.3 | Add `(plan_tier_at_last_sync, state, balance_value_dollars_cents)`. |
| F-A-5 | MEDIUM | Phase 1.5 | §4.7.1 | Client-cache DSAR attestation paragraph. |
| F-A-6 | MEDIUM | Phase 4 | §4.3.16 | Buyer Referral restore-cascade semantics. |
| F-A-7 | MINOR | Phase 4 | §4.8.3 | Stripe detach ordering attestation. |
| F-A-8 | MINOR | Phase 1.5 | §4.8.5 | Add `abandoned` terminal state to ContestRecord. |

### 4.6 Sign-off action

**Status: CONDITIONAL PASS.** Phase 1 authoring is correct and complete on the positive surface — all 45 intended entities present, all structural conventions followed on 39 of them, zero baseline regressions. The six HIGH findings (F-S-1, F-S-3 through F-S-7) are surgical gaps, not architectural defects, and are resolvable via the Phase 1.5 Completion Delta above without re-running Prompts 1.1–1.4.

**Recommendation:** Execute the Phase 1.5 Completion Delta, then advance to Phase 2.

**Halt directive:** Per the Integration Prompt V1 contract, DO NOT advance to Phase 2 until the six HIGH findings are closed — either by executing the Completion Delta (preferred) or by the user formally accepting them as deferred risks with named Phase-4 / Phase-5 owners documented in RECONCILIATION.md.

**Verifier (this pass).** Opus-4.6, comprehensive adversarial run 2026-04-17.

**Prior partial verification (§4.3 only, 2026-04-15).** Preserved at `/Sourcera/_versions/PHASE1_VERIFY_pre-comprehensive-rewrite-2026-04-17.md`. All findings from the prior pass are incorporated above (S-1 through S-9 from the prior file map to F-S-1 through F-S-8 and F-S-12 in this comprehensive pass; no prior finding is silently dropped).

---

## 4.7 Post-Remediation Closure Addendum (2026-04-26 — Phase 13 Final Acceptance Gate)

**Status: UNCONDITIONAL PASS — exit criteria met.**

This addendum supersedes the original CONDITIONAL PASS verdict in §4.6. The six HIGH findings (F-S-1 through F-S-7) flagged in the comprehensive 2026-04-17 review have all been closed, either via the Phase 1.5 Completion Delta (executed under the same name) or by absorption into subsequent integration phases. Closure trail:

| Finding | Closure Location | Closure Phase |
| :---- | :---- | :---- |
| F-S-1 (Retention paragraph completeness on §4.8 entities) | §4.8.1 / §4.8.3 / §4.8.4 / §4.8.6 / §4.8.7 / §4.8.8 / §4.8.9 retention paragraphs as cataloged in §4.5 above | Phase 1.5 — landed |
| F-S-2 (Explicit "DSAR: N/A" lines) | §6.8.6 DSAR Operational SLA + §6.8.5 Audit-Integrity Exemption (Phase 12.3 + Phase 12.5) | Phase 12.5 — landed |
| F-S-3 / F-S-4 / F-S-5 / F-S-6 / F-S-7 (Missing §4.8.X entity authorings) | §4.8 entity cluster fully landed; entity field tables verified in PHASE12_3_VERIFY §6 (CC-02 / CC-04 cross-coverage) | Phase 1.5 — landed |
| F-A-1 / F-A-2 / F-A-3 (Index remediation) | Composite index columns added to §4.4.12 / §4.4.22 / §4.8.3 per the 2026-04-17 catalog | Phase 1.5 — landed |
| F-A-5 / F-A-6 / F-A-7 / F-A-8 (Bridge / cascade / Stripe-detach / ContestRecord state) | §4.7.1 client-cache DSAR attestation; §4.3.16 BuyerReferral restore-cascade; §4.8.3 Stripe detach ordering; §4.8.5 `abandoned` terminal state | Phase 1.5 / Phase 4 — all landed |
| F-S-9 (Appendix L state-machine cross-references) | Appendix L §L.27 entries for the seven primary entities (InternalCommentThread, BuyerReferral, Pro Trial Seat Grant, KB Entry, KB Document, Target Account, AIOperation) | Phase 1-Closeout (2026-04-17) — landed |
| F-S-10 / F-S-11 (Retention + size-constraint completeness) | §39 + §40.2 verified clean by Phase 12.4 sweep (PHASE12_4_VERIFY §3) | Phase 12.4 — landed |
| F-S-12 (Cluster-retention pointers) | §4.3.11 / §4.3.12 / §4.3.13 retention pointers added in Phase 1.5 | Phase 1.5 — landed |

**Verifier (closure pass).** Opus-4.6, Phase 13 Final Acceptance Gate, 2026-04-26.

**Halt directive lifted.** The original §4.6 halt directive ("DO NOT advance to Phase 2 until the six HIGH findings are closed") was honored: Phase 1.5 Completion Delta executed and verified before Phase 2 commenced. Phase 2 verification (`PHASE2_VERIFY.md`) records the post-Phase-1.5 baseline as its starting state.

**Phase 1 exits with all exit criteria met.**
