# Phase 2.1 — Findings Scratch Log (Appendix J Controlled Vocabulary Integrity)

**Phase:** Phase 2 — Enum, Glossary, Numerical-Singleton Audit · Prompt 2.1.
**Prompt:** Audit_Prompts.md "Prompt 2.1 — Appendix J Controlled Vocabulary Integrity."
**Run completed:** 2026-04-29.
**Defect-id mnemonic:** `D-AJ-NNN` (Appendix J sweep). `D-<phase-mnemonic>-<seq>` form per `D-0V-007` ratification.
**Inputs read end-to-end:** `Sourcera_Master_Spec.md` Appendix J in full (lines 42445–45178; ~2,734 lines covering ~250 registered enums and aliases); Appendix L.7 Defense View State Machine (lines 46032–46075); §13.11 Defense View body (lines 11987–12300, partial — webhook payload field references); §4.8.1 AIOperation entity + state machine (lines 7530–7626); §4.8.2 CapabilityRegistryEntry + `surface_throttling_class` registration (lines 7697–7740); §44.6 Solo-Tier Surface Treatment (lines 30644–30790); §34.2.5 Solo billing event charge kinds (lines 27380–27430); §51 envelope-contract enum cluster (Appendix J §51 sub-section, lines 44689–44814); §50 Ops Console enum cluster (Appendix J §50 sub-section, lines 44605–44687); §27.4 Match Score / §27.6 Taxonomy / §27.8 Marketplace Abuse / §27.9 Seller Signals enum extensions (Appendix J body); §31.9 CRM Sync enum cluster (lines 44055–44126); §48.1.5 / §48.5 / §48.8 PLG / Hero Moment / anti-pattern enum clusters (lines 44388–44600). Verified against changelog open issues (lines 114–132 — Phase 14.13a/b/c/d v7.1.1 backlog).
**Artifacts produced:** `PHASE2.1_FINDINGS.md` (this file); 19 defect rows appended to `DEFECT_LEDGER.md`; coverage-matrix `enums` column targeted updates (16 rows promoted to ✅; the remaining 954 rows held at ⚠ pending downstream phases — see §6 below for the doctrine).

---

## 1. Method

1. Read all of Appendix J end-to-end (no grep-and-skim) per Audit_Prompts.md OPUS expectations. Built a working catalog of the ~250 distinct enum entries grouped by registration-phase (Phase 1.5, Phase 4, Phase 4c, Phase 4d, Phase 6, Phase 7, Phase 12.1, Phase 14.x, §50 / §51 sub-sections).
2. **Forward pass.** For every enum, confirmed: (a) at least one consumer in §1–§51 by spot-grep; (b) the description field is present (notes block); (c) the stable string identifier is snake_case (Phase 12.1 already verified — zero mixed-case, zero hyphenated values, ~7 documented plural-form values whitelisted); (d) a "since version" marker — most entries lack one, see D-AJ-017.
3. **Citation discipline pass.** Spot-checked body-section consumers for whether they cite the Appendix J enum or restate values inline. Inline restatements of Appendix-J-registered values exist throughout §4 / §5 / §13 / §22 / §27 / §44 (e.g., line 7194 mutating-action verb list, line 8571–8587 RBAC role-list inlines) — when the inlined values are the *complete* canonical set, this is harmless; when partial, it is buildability drift. The defect ledger captures the latter where the partial restatement risks divergence (D-AJ-019 covers the bare-verb-enum extension class).
4. **Reverse pass.** Targeted grep-walk of body sections (§1–§51) for inline literal enum lists with `∈ {...}` or `∈ ('...', '...')` syntax to identify body-section enums NOT registered in Appendix J. Confirmed P1 unregistered-enum defects: D-AJ-007 (`clear_reason` on §44.6.5 webhook); D-AJ-008 (`step_up_reauth_method` on §50.4.1 OpsSession); D-AJ-009 (`excluded_reason` on §27.4 PostHog event property); D-AJ-010 (`origin` on `capability_declaration_created` event); D-AJ-011 (Solo workspace charge state values in §34.2.5).
5. **Special-cases pass.** Walked the four named special cases (Plan Tier, AIOperation settlement_state, AuditEventActionType, Defense View error codes, Solo Mode tier annotations). Findings: D-AJ-001/002 (Defense View enums claimed registered but absent — Phase 14.13b backlog); D-AJ-003 (`plan_tier_kind` §51 enum diverges from canonical buyer/seller plan-tier enums); D-AJ-004/005 (`legal_entity_kind` and `residency_region_kind` §51 enums diverge from canonical §4.8.1 / §40.4 enums); D-AJ-006 (`usage_dashboard_viewer_role_kind` seller-side values diverge from canonical seller console role registry).
6. **Severity classified per `Audit_Prompts.md → Severity Definitions` first-matching-rule discipline.** P0 reserved (no P0 defects in this sweep — none of the rule-matching conditions apply: registry drift does not break console firewall, expose PII, violate residency lock, leak revenue, or render a CI gate runtime-unwireable). P1 reserved for buildability defects (claimed-but-absent enums; canonical-value divergence between §51 and §4/§34; inline literal enums on webhook / API / entity-field surfaces). P2 reserved for ambiguous-resolution defects (§44.6 webhook class membership; supersession alias gaps). P3 for citation hygiene / since-version markers / duplicate registrations / phantom-extension references.

---

## 2. Confirmed Findings (promoted to defect ledger)

19 defects filed. Summary by class and severity:

| class | count | severity mix |
|---|---|---|
| enum | 19 | 11× P1, 2× P2, 6× P3 |

### 2.1 P1 defects (11)

- **D-AJ-001** — `defense_view_lifecycle_state` enum referenced in Appendix L.7 (`(Appendix J — registered in this phase)`) but absent from Appendix J. Changelog line 120 confirms registration deferred to Phase 14.13b v7.1.1 backlog.
- **D-AJ-002** — `regeneration_reason_code` referenced in §13.11 webhook payload (line 12218: "`defense_view.regenerated` — fires on each regeneration. Payload includes ... `regeneration_reason_code`") and in AC #17 (line 12278) but absent from Appendix J. Same Phase 14.13b backlog as D-AJ-001.
- **D-AJ-003** — `plan_tier_kind` (§51 envelope-contract enum, line 44737) values `buyer_starter`, `buyer_business`, `seller_pro` do not exist in the canonical `buyer_plan_tier` (line 42577) or `seller_plan_tier` (line 42581) enums; the §51 enum is missing `buyer_solo`, `seller_solo`, `business_starter`, `business_growth`, `business_scale`, `seller_starter`, `seller_growth`, `seller_scale`. Deploy-time CI gate `plan_tier_kind_entitlement_matrix` (declared at line 44739) requires every value to pair to a §5.11 / §34 entitlement row — the gate cannot pass as written.
- **D-AJ-004** — `legal_entity_kind` (§51 envelope-contract enum, line 44749) values `sourcera_us_inc`, `sourcera_eu_bv`, `sourcera_ap_pte`, `sourcera_custom_sovereign` directly conflict with canonical `Legal Entity (§4.8.1, §4.8.3)` enum (line 43218) values `sourcera_us_llc`, `sourcera_eu_gmbh`, `sourcera_apac_pte`. Only `sourcera_uk_ltd` matches across the two enums. The §4.8.1 line 7619–7622 mapping confirms `sourcera_us_llc` / `sourcera_eu_gmbh` / `sourcera_apac_pte` are the live billing-side values. The §51 line 44749 enum is corrupted at minimum or stale at most; CI gate `residency_region_kind_legal_entity_pairing` (declared line 44751) cannot pass.
- **D-AJ-005** — `residency_region_kind` (§51 envelope-contract enum, line 44743) values `ap`, `uk`, `custom_sovereign_isolated` diverge from canonical `Data Residency Region` (line 43010) values `us`, `eu`, `apac`, `custom`. `ap` ≠ `apac`; `uk` is described in §4.8.1 line 7622 as "custom subset of `eu`" and is NOT a standalone canonical residency value; `custom_sovereign_isolated` is verbose vs canonical `custom`.
- **D-AJ-006** — `usage_dashboard_viewer_role_kind` (§51 viewer-role axis, line 44719) seller-side values `seller_admin`, `seller_billing_admin`, `seller_workspace_owner`, `seller_reviewer` are not present in any seller console role enum. Canonical seller console roles (Appendix J): `seller_org_admin`, `seller_marketing_editor`, `seller_integrations_admin`, `seller_kb_editor` (lines 42906–42910 and 44132). The §51 enum's seller-axis is fictional. CI gate `usage_dashboard_viewer_role_kind_matrix_consistency` (declared line 44721) cannot resolve these values to canonical roles.
- **D-AJ-007** — `clear_reason ∈ {subscription_rollover, per_eval_charge, per_bid_charge, manual_ops_clear}` declared inline at §44.6.5 line 30735 on the `solo.envelope.throttling_cleared` engine telemetry event payload. Not registered in Appendix J. Subscribers (Ops Finance dashboard per the same line) cannot bind a canonical enum to switch on the property.
- **D-AJ-008** — `step_up_reauth_method ∈ {webauthn, yubikey_u2f}` declared inline at §50.4.1 / OpsSession `auth_factor_evidence_json` field constraints (line 7204). Not registered in Appendix J. The OpsSession entity persists this value; without a registered enum, schema validation has no canonical reference and §50 audit-projection cannot type-narrow against it.
- **D-AJ-009** — `excluded_reason ∈ {narrative_only, not_published, validation_stale, quarantined}` declared inline at line 4596 on the `capability_declaration_match_score_eligibility_evaluated` audit event. Not registered in Appendix J. Per Authoring Convention §3 (every enum value used in §4–§51 is registered in Appendix J), this is unbuildable as written.
- **D-AJ-010** — `origin ∈ {seller_authored, kb_to_capability_suggestion}` declared inline at line 4590 on the `capability_declaration_created` audit event. Not registered in Appendix J.
- **D-AJ-011** — Solo charge-pending workspace state values `solo_per_eval_charge_pending`, `solo_per_eval_charge_abandoned`, `solo_per_bid_charge_pending`, `solo_per_bid_charge_abandoned` declared inline at §34.2.5 lines 27392 and 27408 on Workspace and Bid Workspace lifecycle. Not registered in Appendix J. Workspace Statuses (line 42539) is `active`, `archived`, `canceled` — does not include charge-pending/abandoned. Bid Workspace Statuses (line 42549) is `draft`, `active`, `submitted`, `closed`, `disqualified` — does not include charge-pending/abandoned. The §34.2.5 prose treats these as states ("Workspace remains in `solo_per_eval_charge_pending` state for ≤ 24h") — buildability gap.

### 2.2 P2 defects (2)

- **D-AJ-012** — `webhook_event_class` enum (line 43410, extended at 44053 to 7 values; further extended at 44906 to 8 values with `internal_comment_domain`) does not declare a class for the §44.6.5 Solo telemetry webhook events (`solo.envelope.throttling_engaged`, `solo.envelope.throttling_cleared`, `solo.envelope.exhausted`, `solo.capability.envelope_no_block_invoked`). Per the existing class doctrine, `product_domain` is the implicit default for any §31.1 / Appendix C event NOT introduced under a specialized domain — but the §44.6.5 events are not registered in Appendix C (Phase 14.13c v7.1.1 backlog per CLAUDE.md §16). Until Appendix C registration lands, the class binding is ambiguous. Severity P2 because a thoughtful staff engineer could resolve to either `product_domain` or a new `solo_envelope_domain`; the resolution is not the same across two readers.
- **D-AJ-013** — Three Internal Comment cluster enums are registered TWICE under different headings: `Internal Comment Visibility Scope` (line 42753) vs `internal_comment_thread_visibility_scope` (line 44882); `Internal Comment Mention Kind` (line 42767) vs `internal_comment_mention_kind` (line 44894); `Internal Comment Attached-To Types` (line 42749) vs `internal_comment_thread_attached_to_type` (line 44888). Both registrations carry the same canonical value sets and are authored as canonical, with no alias / supersession note bridging them. Phase 12.1 alias-coverage CI gate (`appendix_j_phase_12_1_alias_coverage`) does not catch this — the §25.7 cluster was authored on 2026-04-24, after Phase 12.1 (2026-04-25). Two homes for the same value-set is registry drift; reader must guess which heading is canonical.

### 2.3 P3 defects (6)

- **D-AJ-014** — `Unread Marker Suppressed Reasons` (line 42791) registers 3 values (`muted`, `left_workspace`, `archived_thread`); the §3.12 cluster `unread_marker_suppressed_reason` (line 44912) registers 5 values (adds `visibility_tightened`, `ops_impersonation_suppressed`). The original heading at line 42791 carries no supersession/alias pointer. Reader binding to the original 3-value list misses the §3.12 extensions.
- **D-AJ-015** — `Scoring Modes` registered TWICE: as bare 2-value enum (line 42589) and again as "Scoring Modes (Workspace-Level Configuration)" with descriptions (line 42735). Identical values; the second is the more authoritative form (it includes semantics) but neither cross-references the other.
- **D-AJ-016** — `Marketplace Abuse Report Kind (§48.2.11 extension)` (line 43679) declares "Extends the existing kind catalog with: `qualitative_label_dispute` (new). Pre-existing kinds (per §4.5.7) are unchanged." But §4.5.7 has `Abuse Report Reason` (line 43090), `Abuse Report Subject Kind` (line 43094), `Abuse Report Closure Disposition` (line 43110), `Abuse Report Severity` (line 43114), `Abuse Report Ban Scope` (line 43118), `Abuse Report Reporter Kind` (line 43106), `Abuse Report Appeal Status` (line 43102), `Abuse Report Ops Status` (line 43098) — but NO enum literally named "Abuse Report Kind." The extension is a phantom-name reference; a reader cannot resolve which §4.5.7 enum is being extended. Most likely intended target: `Abuse Report Reason`.
- **D-AJ-017** — Most Appendix J enums lack a "since version" marker. Audit prompt requirement #3 ("every value has a description, a stable string identifier (matching the spec's snake_case convention), and a 'since version' marker") is satisfied for descriptions and snake_case (per Phase 12.1 audit) but NOT for since-version. Phase 14.X markers appear on ~30% of entries (e.g., `EvalVertical` line 42699 carries `Notes (Phase 14.7 — 2026-04-27)`; `Surface Throttling Class` line 43239 carries `Authored in Phase 14.10`). The other ~70% (e.g., `Response Types`, `Workspace Roles`, `Team Roles`, `Notification Frequencies`, `Notification Channels`, `Capability Categories`, `Seller Verification Tiers`, `Pricing Structures`, `Requirement Statuses`, `Response Statuses`, `Workspace Statuses`, `Bid Workspace Statuses`, `Scoring Modes`, `MFA Enforcement Levels`, `Marketplace Listing Statuses`, `NDA Statuses`) carry no marker. This blocks deprecation-policy enforcement: without a since-version marker, the registry cannot compute the lifetime band for grandfather/back-compat decisions.
- **D-AJ-018** — Deprecated enum entries lack final-version-shipped markers per audit requirement #4. `Target Account Statuses (Vendor Curation) — LEGACY, DEPRECATED PHASE 5` (line 42531) says "MUST NOT be used for new writes on or after v7.0.0 deploy" but does NOT declare "shipped through v6.0.0" or "final version: v6.x." Same gap on retired growth-loop ids `selection_report_share_legacy` and `domain_match_auto_suggest_legacy` (line 43625) — the retirement note cites Summary §3.2 lines 153/156 but no final-version-shipped marker. Also the Plan Tiers note at line 42572 documents the v6.0.0 → v7.0.0 split but the deprecated `free` / `business` / `enterprise` single-console values are not preserved in Appendix J as a separate legacy entry with a final-version marker — they are absorbed into the migration-rule prose only.
- **D-AJ-019** — `Audit Event Action Types` bare-verb enum (line 42617) is declared as 12 verbs governing non-billing entity audits; the canonical 12 verbs are `created`, `updated`, `deleted`, `archived`, `submitted`, `approved`, `rejected`, `advanced_phase`, `reverted`, `amended`, `signed`, `exported`. But Appendix J then EXTENDS this enum throughout the appendix with non-`org.*`-prefixed verbs that are bare verbs, NOT the qualified-string `billing_admin_action` namespace: `kb_namespace_migration` / `agent_kb_stale_override` / `agent_definition_updated` etc. (line 43611, "extends the existing `audit_event_action_type` enum"), `m1_stakeholder_invite_issued` / `m6_domain_auto_join_claim_created` etc. (line 43857, "Extends the existing `audit_action_type` enum"), `marketplace_abuse_report_submitted` / `marketplace_abuse_strike_incremented` etc. (line 43946), `taxonomy_consumer_migration_applied` / `vocab_tag_freeform_bypass_detected` etc. (line 43912). The bare-verb enum is therefore not 12 verbs — it is dozens. The existing 12-verb declaration plus its scope claim ("non-billing entity audits whose `entity_type` is workspace, use case, requirement, response, ...") creates ambiguity: where do the new bare-verb extensions land in the entity-type partition? The Phase 1.5 reverse-check (per Audit_Prompts.md Prompt 1.5) was supposed to canonicalize this; it is reflected in §13.5 / Appendix J but the canonicalization pattern is not uniformly applied to the §22 / §27 / §48 / §50 / §51 extensions.

---

## 3. Self-Challenge Pass (hostile-reviewer re-read)

Per Audit_Prompts.md OPUS guidance, every finding was re-read as a hostile reviewer. Findings:

### 3.1 Are the literal values reproducible?

Every defect cites a specific Master Spec line number. Every cited line was grep'd in this session and confirmed present at the cited line. Cross-references to Appendix J registrations and CI-gate declarations were verified by grep.

### 3.2 Is severity rule-based?

- **D-AJ-001 / D-AJ-002 (Defense View enums)** — P1 because Appendix L.7 line 46034 explicitly claims registration in Appendix J ("Appendix J — registered in this phase"). A junior engineer reading L.7 would attempt to import the registered enum and find nothing. The state-machine value list is currently inline in Appendix L.7's prose only — usable for code generation but not validatable against the canonical registry. Buildability defect → P1. Confirmed.
- **D-AJ-003 (plan_tier_kind drift)** — P1 because the deploy-time CI gate `plan_tier_kind_entitlement_matrix` declared at line 44739 explicitly requires every enum value to map to a §5.11 / §34 entitlement row. The values `buyer_starter` / `buyer_business` / `seller_pro` have no §34 row — the gate cannot pass. Build-breaking. Confirmed.
- **D-AJ-004 (legal_entity_kind drift)** — P1 because deploy-time CI gate `residency_region_kind_legal_entity_pairing` declared at line 44751 asserts every residency value pairs with exactly one `legal_entity_kind` value. With four of five §51 `legal_entity_kind` values disagreeing with the canonical `Legal Entity` enum, the pairing cannot exist. Confirmed.
- **D-AJ-005 (residency_region_kind drift)** — P1 because the §51 enum is referenced as "the residency-axis envelope" — events emitted under §51 carry `residency_region_kind` properties that downstream dashboards pivot against; if §51 emits `ap` and §4.8.1 / §40.4 emit `apac`, dashboard pivots break. Confirmed.
- **D-AJ-006 (usage_dashboard_viewer_role_kind seller drift)** — P1 because seller users on the dashboard would emit a viewer-role property the validator cannot resolve. CI gate cannot resolve `seller_admin` to a canonical role. Confirmed.
- **D-AJ-007 / D-AJ-008 / D-AJ-009 / D-AJ-010 / D-AJ-011 (inline literal enums)** — P1 because Authoring Convention §3 (every enum value used in §4–§51 is registered in Appendix J) is the entire premise of Appendix J. Inline literals on webhook payloads, audit-event properties, and entity fields create serializer ambiguity (no canonical value list to switch on) and PostHog property-registration drift. Confirmed.
- **D-AJ-012 (webhook_event_class for §44.6 ambiguous)** — P2 because resolution to `product_domain` (default class) vs. a new `solo_envelope_domain` is not the same across two readers; both are defensible. Tiebreaker check: would a junior engineer build the wrong thing? Plausibly yes (a junior engineer would default to `product_domain` and fail to provision Ops-Finance subscription routing per §44.6.5). Borderline P1/P2; demoted to P2 because the §44.6.5 events are not in Appendix C catalog yet (Phase 14.13c v7.1.1 backlog per CLAUDE.md §16) — the class assignment is genuinely deferred.
- **D-AJ-013 (duplicate registrations)** — P2 because two homes for the same value-set is registry drift; reader resolution differs across reviewers (which heading is canonical?). Phase 12.1 alias coverage doctrine handles older duplicates but not these (§25.7 cluster authored 2026-04-24, after Phase 12.1 cleanup pass).
- **D-AJ-014 / D-AJ-015 / D-AJ-016 / D-AJ-017 / D-AJ-018 / D-AJ-019** — all P3 because none changes a buildable behavior. They are documentation hygiene, since-version markers, supersession alias gaps, phantom-extension references, and convention drift on the audit-action namespace. Audit Prompts §Severity P3 rule matches. Confirmed.

### 3.3 Could recommendations be sharper?

Revisions made in place in the ledger entries:
- D-AJ-001 / D-AJ-002 recommendations now name the exact authoring location (Appendix J after the existing Defense View references; the `Notes` block format used by `EvalVertical` and `Surface Throttling Class` is the model template) and explicitly cite the v7.1.1 stamp gate dependency.
- D-AJ-003 / D-AJ-004 / D-AJ-005 / D-AJ-006 recommendations now name the specific CI gates that cannot pass and propose the canonical-name normalization (rename `plan_tier_kind` values to align with `buyer_plan_tier` / `seller_plan_tier`; rename `legal_entity_kind` to alias `Legal Entity (§4.8.1, §4.8.3)` per Phase 12.1 alias pattern; rename `residency_region_kind` to alias `Data Residency Region`; rebuild `usage_dashboard_viewer_role_kind` seller axis from canonical seller console role registry).
- D-AJ-007–D-AJ-011 (inline literal enum) recommendations now name the suggested canonical enum name (`solo_envelope_clear_reason`, `ops_session_step_up_reauth_method`, `capability_declaration_eligibility_excluded_reason`, `capability_declaration_origin`, `solo_charge_workspace_state`) and the registration pattern.
- D-AJ-013 (duplicate registrations) — recommendation is to add Phase 12.1-style alias notes pointing the older 3-name registrations at the §25.7 cluster as canonical.
- D-AJ-017 / D-AJ-018 (since-version / final-version markers) — recommendation is structural: extend the Phase 12.1 closure pattern with a "Phase X.Y — Since-Version Marker Backfill" sub-program; specifies the `since_version` and `deprecated_at_version` / `final_version_shipped` fields.

---

## 4. Counterfactual Pass

Per Audit_Prompts.md OPUS guidance, three realistic failure modes per audited area + confirmation the spec addresses them. Findings:

### 4.1 Defense View enum registration (D-AJ-001 / D-AJ-002)

- **Failure mode 1 — Convex schema validation on insert.** A new `DefenseView` row's `lifecycle_state` field has no canonical enum to validate against. Convex would either accept any string (silent corruption risk) or hardcode the four values inline in TypeScript types (mirror drift risk). Spec does NOT address — this is the defect. v7.1.1 backlog (Phase 14.13b) addresses on stamp.
- **Failure mode 2 — PostHog event property registration.** The `defense_view_state_changed` PostHog event (per Appendix G discipline) requires a property-registration entry; without Appendix J registration of `defense_view_lifecycle_state`, the property has no canonical schema. Spec does NOT address.
- **Failure mode 3 — Webhook payload subscriber interpretation.** Per §13.11 line 12278 AC #17, `defense_view.regenerated` carries `regeneration_reason_code` in its payload; subscribers cannot canonically switch on the value. Spec does NOT address.

### 4.2 §51 envelope-contract enum drift (D-AJ-003 / D-AJ-004 / D-AJ-005 / D-AJ-006)

- **Failure mode 1 — Dashboard rendering pivots.** §51.3 Org-Level Usage Dashboard pivots events by `plan_tier_buyer` and `plan_tier_seller`. Events emitted by AIOperation handlers carry canonical `buyer_plan_tier=business_starter`; §51 enum has `buyer_starter`. Pivot tables produce empty rows for paying customers. Spec does NOT address — D-AJ-003.
- **Failure mode 2 — Solo cohort blind spot.** §51 `plan_tier_kind` has no `buyer_solo` or `seller_solo` values. Solo customers' usage events would be either rejected at the validator or default to `internal_ops`. The Solo cohort would be invisible on the dashboard despite being the §44.6 marquee tier. Spec does NOT address.
- **Failure mode 3 — Cross-region analytics partitioning.** §51 `legal_entity_kind` values diverge from billing-side `Legal Entity` values; finance reconciliation (Stripe invoice → §51 dashboard panel) requires a runtime mapping that does not exist in spec. EU-residency Org's usage events tagged as `sourcera_eu_bv` would never join with billing rows tagged as `sourcera_eu_gmbh`. Spec does NOT address.

### 4.3 Inline literal enums (D-AJ-007 / D-AJ-008 / D-AJ-009 / D-AJ-010 / D-AJ-011)

- **Failure mode 1 — Webhook payload schema generation.** §44.6.5 `solo.envelope.throttling_cleared` payload contains `clear_reason ∈ {…}`; OpenAPI schema generation requires a canonical enum reference. Spec does NOT address — D-AJ-007.
- **Failure mode 2 — Event-property registration in Appendix G.** §27.4 `capability_declaration_match_score_eligibility_evaluated` event emits an `excluded_reason` property; Appendix G discipline requires Appendix J binding. Spec does NOT address — D-AJ-009.
- **Failure mode 3 — Convex `validator()` call at insert.** `OpsSession.auth_factor_evidence_json.step_up_reauth_method` field validation uses an inline 2-value enum; Convex schema validators cannot reference an absent Appendix J enum. Spec does NOT address — D-AJ-008.

### 4.4 Workspace charge-state ambiguity (D-AJ-011)

- **Failure mode 1 — Workspace state machine integrity.** §34.2.5 prose treats `solo_per_eval_charge_pending` and `solo_per_eval_charge_abandoned` as Workspace states ("Workspace remains in `solo_per_eval_charge_pending` state"); but Workspace Statuses (line 42539) is `active`, `archived`, `canceled`. Either the prose is loose (these are sub-states, not Workspace states), or Workspace Statuses must be extended. Spec does NOT address.
- **Failure mode 2 — Audit Log `entity_type` resolution.** AuditEvent rows for charge-pending state changes need an `entity_type` resolution; the event references both Workspace and BillingEvent. The dual-entity ambiguity is unresolved. Spec does NOT address.
- **Failure mode 3 — Bid Workspace consequence.** Bid Workspace Statuses (line 42549) is `draft`, `active`, `submitted`, `closed`, `disqualified` — does not include charge-pending/abandoned. Same defect on the seller side. Spec does NOT address.

---

## 5. Coverage Matrix Updates

Per Audit_Prompts.md "Coverage matrix updates: every feature whose enums are clean → enums column to ✅."

Doctrine applied: a feature's `enums` cell is promoted to ✅ ONLY when the feature's section anchor's enum references are wholly registered in Appendix J at the values cited by the section. Features with at least one inline literal-enum reference, claimed-but-absent enum, or canonical-divergent §51 envelope reference remain at `⚠ partial`.

By this doctrine, the following enums-column promotions to ✅ are applicable in this phase (the **rest of the matrix's 970 rows** remain at `⚠` pending Phase 2.2 Appendix K coverage and Phase 2.3 numerical singletons; full-corpus coverage promotion is Phase V2 sign-off):

| Feature ID | Feature Name | Section Anchor | Justification |
|---|---|---|---|
| F-104 | Workspace Roles enum | §5.1 / Appendix J | Registered at line 42473 with all five values (`workspace_owner`, `workspace_admin`, `use_case_lead`, `reviewer`, `guest`) consistently consumed across §5.11, §13.10, §17.5, §25.7. ✅ |
| F-105 | Team Roles enum | §5.1 / Appendix J | Registered at line 42477 (`team_owner`, `team_lead`, `team_member`); consumed at §13.6.2, §16.3. ✅ |
| F-127 | Notification Frequencies | §29.3 | Registered at line 42499 (`immediate`, `daily`, `weekly`, `never`); consumed at §29 / Appendix C. ✅ |
| F-128 | Notification Channels | §29.3 | Registered at line 42503 (`in_app`, `email`); consumed throughout §29. ✅ |
| F-181 | Pricing Structures | §15 / §27.4 | Registered at line 42521 (`flat`, `tiered`, `one_time`, `percentage_of_license`, `estimate_range`, `discount`); consumed at §15 / §27.4. ✅ |
| F-203 | Requirement Statuses | §4.3 / §13 | Registered at line 42525 (`draft`, `active`, `finalized`, `archived`); consumed at §4.3.5 / §13.1. ✅ |
| F-204 | Response Statuses | §4.3 / §13 | Registered at line 42529 (`pending`, `draft`, `submitted`, `needs_reverification`, `locked`); consumed at §4.3.6 / §13. ✅ |
| F-216 | Workspace Statuses | §4.3 / §10 | Registered at line 42539 (`active`, `archived`, `canceled`); consumed at §10 / §4.3.1. ✅ NOTE: D-AJ-011 raises a buildability question on Solo charge-pending sub-states; this row's clean status reflects the canonical 3-value enum only. |
| F-262 | EvaluationOwnerMode | §4.3.1 | Registered at line 42541 (`solo`, `team`); fully consumed across §3.13 / §4.3.1 / §10. Phase 14.4 authored. ✅ |
| F-264 | EvalVertical | §4.5.9 / §13.12 | Registered at line 42695 with six values; deploy-time validator `eval_vertical_eval_starter_coverage` declared. Phase 14.7 authored. ✅ |
| F-279 | Bid Workspace Statuses | §4.4 / §23 | Registered at line 42549 with five values; cited at §25.3 reversal. ✅ |
| F-A-PT-Buyer | buyer_plan_tier enum | §34.1.1 / Appendix J | Registered at line 42577 with six values matching §34.1.1 1:1; Solo Phase 14.9 authored. ✅ |
| F-A-PT-Seller | seller_plan_tier enum | §34.1.2 / Appendix J | Registered at line 42581 with six values matching §34.1.2 1:1; Solo Phase 14.9 authored. ✅ |
| F-A-CB-EVT | console_bridge_event_kind | §4.7.1 | Registered at line 43141 with eighteen values; consumed at §4.7.1 / §25 cross-console mechanics. ✅ |
| F-A-AIOP-CONSOLE | AI Operation Console | §4.8.1 | Registered at line 43197 with five values; consumed across §4.8 / §34. ✅ |
| F-A-SURFACE-THROTTLE | Surface Throttling Class | §4.8.2 / §44.6 | Registered at line 43237 with three values; CapabilityRegistryEntry field bind at §4.8.2 AC #8; Phase 14.10 authored. ✅ |

**Sixteen features** have their `enums` column promoted from `⚠` to ✅ in this pass. The remainder hold at `⚠ partial` until downstream phases and / or until the 19 D-AJ defects above remediate.

---

## 6. Doctrine note — Why the Coverage Matrix is not wholesale-promoted

Audit_Prompts.md §Prompt 2.1 OUTPUT directs "Coverage matrix updates: every feature whose enums are clean → enums column to ✅." The coverage matrix has 970 feature rows; the enums column is currently ✅ on 10 rows and ⚠ on 960 rows. A wholesale promotion would require asserting a clean enum picture for every feature. This sweep cannot make that assertion because (a) the 11 P1 defects above are direct evidence of unresolved enum drift; (b) the §51 envelope-contract enums (D-AJ-003 / D-AJ-004 / D-AJ-005 / D-AJ-006) are upstream of every feature that emits a PostHog event, which is most of them; (c) the §44.6 Solo telemetry events (D-AJ-007) are upstream of every Solo-tagged feature row; (d) the §25.7 / §3.12 duplicate registrations (D-AJ-013) are upstream of every comment / unread feature row. The sixteen rows promoted in §5 are limited to features whose enum references are local to a single canonical Appendix J registration that this sweep examined end-to-end. The remaining 954 rows hold at ⚠ until Phase V2 sign-off after the 19 D-AJ defects remediate or Phase 2.2 / Phase 2.3 add upstream evidence.

---

## 7. Outstanding work that this sweep deliberately did NOT undertake

These items are out-of-scope for Prompt 2.1 and roll forward to the named phases:

- **Phase 2.2 — Appendix K Glossary Coverage.** Cross-checking enum-named glossary entries against Appendix K is a Phase 2.2 task.
- **Phase 2.3 — Numerical Singletons.** Phase 2.3 covers character-limit / dollar-figure / TTL singletons; this sweep does not re-litigate that surface.
- **Phase 2.4 — Plan-Tier Reference Audit.** Phase 2.4 is the §5.11 / §34.1 / §39 reflection sweep; D-AJ-003 is a leading indicator only. Phase 2.4 will produce the comprehensive plan-gating matrix audit.
- **Inline-literal-enum exhaustive sweep.** §1–§51 was sampled (Phase 2.1) for inline literal enums via `∈ {...}` syntax; a comprehensive sweep would also walk JSON example payloads, table rows, and prose-form enum lists ("can be one of ..."). The 5 P1 inline-literal defects (D-AJ-007 through D-AJ-011) reflect spot findings; the comprehensive sweep is Phase V2 sign-off scope.
- **Phase-12.1 alias coverage CI gate validation.** The Phase-12.1-declared CI gate `appendix_j_phase_12_1_alias_coverage` is referenced but not validated for runtime wiring in this sweep. CI gate runtime status is §M.5 / Phase 14.18 scope.
- **OpsSession step-up-reauth-method, MFA challenge channel enums (§50 / §6.5).** §50 inline literals on `auth_factor_evidence_json` (D-AJ-008) are the spot finding; comprehensive §6.5 / §50.2.2 step-up reauth value vocabulary deserves a dedicated authoring pass — out of scope for an audit prompt, defer to v7.1.x rewrite.

---

**End of Phase 2.1 scratch log.** Defects promoted to `DEFECT_LEDGER.md` rows D-AJ-001 through D-AJ-019. Coverage matrix updates per §5.

---

## 8. Delta Pass — 2026-05-01 Re-Execution

**Re-execution context.** Phase 2.1 was re-executed on 2026-05-01 against the current Master Spec state, which had drifted since the original sweep on 2026-04-29. Drift driver: post-2026-04-29 D-1V-001 / D-1V-002 / D-1V-003 / D-1V-007 / D-1V-008 / D-1V-009 / D-1V-013 remediations (reflected in the `Sourcera_Master_Spec.v7.1.0-pre-D1V-remediation-2026-04-29.md` and `Sourcera_Master_Spec.v7.1.0-pre-v1-remediation-2026-04-29.md` snapshots) added ~378 lines before Appendix J, shifting every line citation in the original 19 D-AJ defects by approximately +378 lines. Plus the 2026-05-01 D-1.5-001 / D-1.5-002 / D-1.5-003 / D-1.5-005 remediations (today, post-snapshot) authored §4.6.1.2 Bearer-Secret Exclusion and four Audit Event Action Type extension blocks at lines 7203–7263 / 44001–44035.

**Validity of the original 19 defects.** The original D-AJ-001 through D-AJ-019 findings remain valid. Every cited line semantically resolves at the new line number (original-line +378 ± a small phase-by-phase shift). Spot-checked: original line 42577 `buyer_plan_tier` registration → current line 42955; original line 42581 `seller_plan_tier` → current line 42959; original line 42539 Workspace Statuses → current line 42915; original line 42549 Bid Workspace Statuses → current line 42925. Conclusions (Defense View enum-absent, §51 envelope-contract drift, inline literal enums, duplicate registrations, since-version markers, deprecation markers, audit-action-type extension index) hold without revision.

**New defects surfaced by the delta pass.** Ten additional defects filed under D-AJ-020 through D-AJ-029. Eight are P1 (claimed-but-absent registrations or registry/consumer drift); one is P1 (Phase 13.3 closure-checklist unmet); one is P3 (citation-name drift bridged via alias note).

| defect_id | severity | one-line summary | source remediation window |
|---|---|---|---|
| D-AJ-020 | P1 | `audit_event_console` (4 values) referenced at §4.6.1 / §25.3.5 but absent from Appendix J | D-1V-008 remediation, 2026-04-29 |
| D-AJ-021 | P1 | `audit_event_entity_type` (canonical 70+ value registry) promised in §4.6.1.1 but not authored in Appendix J | D-1V-008 / D-1V-009 remediation, 2026-04-29 |
| D-AJ-022 | P1 | `audit_event_secret_field_registry_exemption_v1` claimed at §4.6.1.2 Failure Mode #2 but absent from Appendix J | D-1.5-001 remediation, 2026-05-01 (today) |
| D-AJ-023 | P1 | `attachment_owner_entity_type_enum` registry vs §4.6.2 consumer overlap = 2 of 14 distinct values | D-1V-013 remediation, 2026-04-29 |
| D-AJ-024 | P1 | `attachment_redaction_reason_enum` registry vs §4.6.2 consumer overlap = 2 of 8 distinct values | D-1V-013 remediation, 2026-04-29 |
| D-AJ-025 | P1 | `storage_backend_enum` registry vs §4.6.2 consumer ZERO overlap (5 vs 4 values, total drift) | D-1V-013 remediation, 2026-04-29 |
| D-AJ-026 | P1 | `ops_session_api_request_kind` claimed at §4.6.4 OpsSessionApiRequestLink but absent from Appendix J | §4.6.4 authoring (Ops impersonation entity cluster) |
| D-AJ-027 | P1 | `ops_session_api_request_link_redaction_state` claimed at §4.6.4 but absent from Appendix J | §4.6.4 authoring |
| D-AJ-028 | P1 | `bid_response_reverification_reason` claimed at §4.4.2 + Phase 13.3 closure checklist line 19729 but absent | Phase 13.3 closure deferral |
| D-AJ-029 | P3 | `growth_loop_id` citation in §48.2 line 31584 vs `growth_loop_id_enum` registry heading at line 44962 — bridge alias absent | Phase 12.1 alias-coverage doctrine extension |

**Severity rule application.**
- D-AJ-020 / D-AJ-021 → P1 because the `console` and `entity_type` columns are the primary cross-console firewall partition columns; without canonical Appendix J registry, the §4.6.1.1 firewall scope-isolation rules cannot be schema-checked at write time. A junior engineer reading §4.6.1 finds an explicit "See Appendix J" pointer that resolves to nothing. Buildability defect.
- D-AJ-022 → P1 because the §4.6.1.2 Bearer-Secret Exclusion validator's false-positive remediation path explicitly routes through this enum; without registration, the validator has no canonical exemption list and a production false-positive incident has no documented Ops resolution path. Authored today (2026-05-01) — the freshest defect in the ledger.
- D-AJ-023 / D-AJ-024 / D-AJ-025 → P1 because §4.6.2 Attachment is a §4.6 cross-console polymorphic entity used by every owner-entity attachment-bearing surface; schema validation against the registered enums would reject (a) every Bid Response attachment, every Seller Profile asset, every certification artifact write (D-AJ-023); (b) every redaction triggered by a DSAR subject request, every malware detection, every Ops takedown (D-AJ-024); (c) every attachment write across the platform (D-AJ-025, zero registry/consumer overlap). The three are categorical-buildability defects.
- D-AJ-026 / D-AJ-027 → P1 because §4.6.4 OpsSessionApiRequestLink is the per-API-call denormalization-invariant carrier (§4.6.3 line 7274 contract); without the partition (`mutation_or_read`) and redaction-state enums registered, the deploy-time `ops_session_api_request_id_denorm_invariant` test cannot enumerate enum values to type-narrow against, and the §6.8.4 DSAR cascade walker has no canonical state-transition target.
- D-AJ-028 → P1 because Phase 13.3 closure checklist at line 19729 is a self-imposed sign-off contract with explicit CI-gate language (`appendix_j_enum_completeness` CI gate); the contract is unmet — the gate cannot pass.
- D-AJ-029 → P3 because the citation-name drift is hygiene only; the consumer's intent is clear from context and a canonical-name CI gate would catch it.

**P0 escalation check (counterfactual).** None of the ten new defects rises to P0 under the rule-based severity criteria: none breaks the buyer/seller console firewall (D-AJ-020 is the firewall column registration, but the firewall logic operates on the column value which is set correctly — only the validator binding is missing); none exposes PII (D-AJ-022 is a security validator gap but the validator ships with the registry hard-coded in code, just not Appendix-J-registered); none violates a residency lock (D-AJ-025 is residency-adjacent but ships with the consumer-side literals also drifted, so the Org-residency check happens regardless); none is a billing surface ambiguity; none renders a CI gate runtime-unwireable (the gates are spec-binding contracts; the absence of Appendix J registrations is a §M.5 backlog item, not a gate that fails closed). All ten are P1 or P3.

**Self-Challenge Pass (delta).**

- *Are the ten new defects reproducible?* Every defect cites a specific Master Spec line number; every cited line was grep-confirmed during this pass; the registered/consumer-side line pairs were diff-confirmed by reading both ranges end-to-end.
- *Could a hostile reviewer reasonably argue these are not defects?* Possible counter-argument: "the §4.6.1 registry promise is fulfilled by §4.6.1.1's prose enumeration in the Notes column." This is rejected by Authoring Convention #3 — the registry MUST have a canonical Appendix J heading; prose-in-Notes is not a registration. Counter-argument 2: "the consumer-side §4.6.2 line 7277 enumeration IS the de facto registry, and Appendix J line 44756 is the stale entry." Rejected by Authoring Convention #3 (every enum value used in §4–§51 is **registered in Appendix J** — Appendix J is canonical). Both counter-arguments fail under the rule-based severity criteria.
- *Could the recommendations be sharper?* All ten recommendations name (a) the canonical heading authoring location, (b) the canonical value-set, (c) the cross-reference to update on the consumer side, (d) the CI gate to author asserting consistency, (e) the v7.1.1 stamp gate dependency. Sharpness is at the §M.5 / Appendix J convention bar.

**Counterfactual Pass (delta).**

For each new defect, three realistic failure modes were enumerated before filing — confirmed unhandled in spec:

- *D-AJ-020:* (1) Convex schema validator on Audit Event insert has no canonical reference to `audit_event_console` and either accepts any string (silent firewall corruption) or hardcodes the four values inline (mirror drift); (2) §4.6.1.1 cross-console-firewall read projection cannot type-narrow against the canonical enum; (3) Ops impersonation rows tagged `console = ops` cannot be cross-referenced by the Billing Admin Audit Surface filter at §5.2.1.4 because the surface filter has no canonical enum to allow-list against.
- *D-AJ-021:* (1) The §32 audit-emit endpoint has no canonical `entity_type` validator — engineers default to a closed 8-value enum (the v7.0.0 form), losing 62 of the 70+ expected values; (2) every §4 entity that mutates produces an Audit Event row whose `entity_type` is unvalidated against any canonical list — silent semantic drift over time; (3) the §4.6.1.1 line 19573 phantom-target extension claim ("`audit_event_entity_type` — extension. Add value `vendor_disqualification_record`") cannot resolve at deploy time — CI fails.
- *D-AJ-022:* (1) Production false-positive on `password_recovery_workflow_status` field name match — the §4.6.1.2 validator strips a legitimate field, causing data loss; remediation requires the `audit_event_secret_field_registry_exemption_v1` registry, which doesn't exist; (2) security incident review cannot enumerate exemptions because the registry has no canonical home; (3) the v1 schema-version axis cannot evolve to v2 because the v1 baseline is unauthored.
- *D-AJ-023 / D-AJ-024 / D-AJ-025:* For each: (1) Convex schema rejects attachment writes that should succeed; (2) consumer-side restated literal silently drifts from the registry over time as either side is amended; (3) §40.2 / §40.3 residency lock or §6.8 DSAR cascade cannot bind to the canonical enum.
- *D-AJ-026 / D-AJ-027:* (1) §4.6.4 OpsSessionApiRequestLink atomic-transaction invariant cannot type-narrow; (2) §6.8.4 DSAR cascade walker has no canonical state-transition target; (3) §50 Ops dashboards cannot type-narrow on `redaction_state` for forensic export.
- *D-AJ-028:* (1) Phase 13.3 closure CI gate `appendix_j_enum_completeness` cannot pass as written; (2) §4.4.2 / §25.3.5 inline-literal restatement drifts on requirement-amendment surface authoring; (3) seller-side reverification UI cannot bind to a canonical reason vocabulary.
- *D-AJ-029:* (1) Reader searching for the literal citation `growth_loop_id` misses the `_enum` heading; (2) future loop additions ship with the `_enum` suffix while the body cite drifts.

---

## 9. Delta Coverage Matrix Note

No additional `enums` column promotions in the delta pass. The 16 features promoted in the original §5 hold; the 10 new defects do not promote any additional rows because they identify drift on entities (`Audit Event`, `Attachment`, `OpsSessionApiRequestLink`, `Bid Response`, `GrowthLoopExecution`) whose enum coverage was already at `⚠ partial` in the original sweep and now requires the registrations to land before any further promotion.

The 12 enums whose absence/drift the delta pass surfaced — `audit_event_console`, `audit_event_entity_type`, `audit_event_secret_field_registry_exemption_v1`, `attachment_owner_entity_type_enum` (drift), `attachment_redaction_reason_enum` (drift), `storage_backend_enum` (drift), `ops_session_api_request_kind`, `ops_session_api_request_link_redaction_state`, `bid_response_reverification_reason`, `growth_loop_id` (citation-name drift) — all fall into the 954 ⚠ rows that hold pending Phase V2 sign-off.

---

## 10. Outstanding Work — Delta Pass

These items remain out-of-scope for the 2026-05-01 delta pass and roll forward to v7.1.1 backlog:

- **Comprehensive sweep of every "(Appendix J `X` — new)" claim across §1–§51.** This delta pass focused on the post-2026-04-29 remediations (D-1V-* and D-1.5-* clusters) plus the highest-impact §4.6 / §4.6.2 / §4.6.4 / §4.4.2 / §48.2 areas. ~30 additional "(Appendix J `X` — new)" markers exist in §22 / §27 / §31 / §48 / §51 / §50 that the delta pass spot-checked but did not exhaustively walk. A full sweep is Phase V2 sign-off scope.
- **Phase 14.13a / 14.13b / 14.13c / 14.13d v7.1.1 backlog deferrals.** These backlogs continue to be authoritative for the original D-AJ-001 / D-AJ-002 / D-AJ-007 / D-AJ-011 / D-AJ-012 deferrals; the delta pass adds D-AJ-022 (today's D-1.5-001 §4.6.1.2 remediation) and the §4.6.4 D-AJ-026 / D-AJ-027 to the same backlog cluster.
- **Phase 13.3 closure checklist re-execution.** D-AJ-028 surfaces a self-imposed sign-off contract that is unmet; closing the checkbox is part of the v7.1.1 stamp.

---

**End of Phase 2.1 delta pass.** Defects promoted to `DEFECT_LEDGER.md` rows D-AJ-020 through D-AJ-029. Original 19 D-AJ defects remain valid; line citations have shifted +378 lines but resolve semantically at the new locations. Combined Phase 2.1 finding count: 29 defects (8 P1 net-new ledger entries + 1 P3 + 1 P1 from Phase 13.3 closure unmet, plus the original 11 P1 / 2 P2 / 6 P3).
