# Phase 12.2 — Glossary Coverage Verification

**Date:** 2026-04-25
**Phase:** 12.2 (Glossary sweep — terms introduced across Phases 1–11)
**Authoring section:** Master Spec Appendix K — Glossary
**Backup:** `_versions/Sourcera_Master_Spec_pre-phase-12.2-glossary-2026-04-25.md`
**Exit criterion:** Zero undefined cross-section terms.
**Status:** PASS — exit criterion met.

---

## 1. Procedure

1. Inventoried Appendix K Glossary in full (line 42441–end).
2. Walked the `TERMS TO VERIFY` list from the Phase 12.2 prompt against Appendix K.
3. For each term: (a) confirmed an Appendix K entry exists, OR (b) located its body-section authoring and authored a new Appendix K entry that points at it.
4. Re-read every existing Appendix K entry for cross-section terms to confirm definitions remain consistent with the post-integration spec body. Drift items are surfaced in §4.
5. Authored 16 new Appendix K entries under a new heading: *Terms Confirmed in Phase 12.2 Glossary Sweep (v7.0.0 Integration)*.

The Appendix K continues to live where v7.0.0 placed it. The authoring-convention pointer to "Appendix-B Glossary" is preserved as a non-blocking authoring note at the head of Appendix K.

---

## 2. Terms Confirmed (already in Appendix K — no edit required)

| # | Term | Source section | Pre-existing Appendix K location | Verification result |
|---|------|----------------|----------------------------------|---------------------|
| 1 | AIOperation | §4.8.1 | Appendix K → Phase 4 block | Definition is current. References settlement state machine, four billing facts (capability/model_tier/cost basis/wallet/FX), and Summary C.75. No drift. |
| 2 | AIWallet | §4.8.3 | Appendix K → Phase 4 block | Current. References Pricing Strategy §11 console-pooling and full state machine. No drift. |
| 3 | OutcomeContract | §4.8.4 | Appendix K → Phase 4 block | Current. Versioning behavior and pending-op resolution rule preserved. No drift. |
| 4 | CapabilityRegistryEntry | §4.8.2 | Appendix K → Phase 4 block | Current. State machine and Summary C.76 reference preserved. No drift. |
| 5 | ContestRecord | §4.8.5 | Appendix K → Phase 4 block | Current. 14-day contest window referenced; auto-filed-contest behavior preserved. No drift. |
| 6 | FreeAllowanceCounter | §4.8.7 | Appendix K → Phase 4 block | Current. 10-op default and Summary C.80 reference preserved. No drift. |
| 7 | CommittedSpendContract | §4.8.8 | Appendix K → Phase 4 block | Current. Discount band ladder ($25K/10%, $50K/15%, $100K/20%, $250K/25%) preserved. No drift. |
| 8 | Billing Admin (Role) | §5.2.1 | Appendix K → Phase 4 block ("Billing Admin Role") | Current. Body-section reference at line 7985 is consistent with Appendix K entry. No drift. |
| 9 | Signal Integrity Monitor (SIM) | §4.3.18 + §48.4.10 | Appendix K → Phase 1 + Phase §48 blocks (two entries) | Both entries reference the same C.100 Ops surface but cover different facets (fraud-signal flags vs eleven-class signal taxonomy). Consistent; the duplication is intentional and serves the reader at both authoring sites. No drift. |
| 10 | Taxonomy Node | §4.5.4 | Appendix K → Phase 3 block | Current. Multi-kind, Ops-managed, two-level hierarchy max preserved. No drift. |
| 11 | Console Bridge Event | §4.7.1 | Appendix K → Phase 3 block | Current. Firewall enforcement, retry-curve class, DLQ, idempotency-key all referenced. No drift. |
| 12 | SellerSoftware | §4.4.9 | Appendix K → Phase 2 block | Current. Claim status state machine, KB namespace binding referenced. No drift. |
| 13 | SellerOrgPage | §4.4.10 | Appendix K → Phase 2 block | Current. SEO indexing, page enrichment, Platform Marketing cost center referenced. No drift. |
| 14 | SoftwarePage | §4.4.11 | Appendix K → Phase 2 block | Current. One-to-one with SellerSoftware, claim-verified gating preserved. No drift. |
| 15 | CategoryPage (M9) | §4.4.12 | Appendix K → Phase 2 block | Current. Summary C.67, k=5, Sourcera-owned cost center preserved. No drift. |
| 16 | GuidePage (M10) | §4.4.13 | Appendix K → Phase 2 block | Current. Minor-update bypass referenced. No drift. |
| 17 | ComparisonPage (M11) | §4.4.14 | Appendix K → Phase 2 block | Current. Auto-archive < 2 non-suppressed comparisons preserved. No drift. |
| 18 | MarketIntelligenceReport (M12) | §4.4.15 | Appendix K → Phase 2 block | Current. k=20, dual sign-off (Marketing + Finance) preserved. No drift. |
| 19 | HeatMapCell (M13) | §4.4.16 | Appendix K → Phase 2 block | Current. k=10 floor preserved. No drift. |
| 20 | GhostBidImport (M15) | §4.4.17 | Appendix K → Phase 2 block | Current. First-import-free rule referenced. No drift. |
| 21 | SellerSignal | §4.4.18 + §27.9 | Appendix K → Phase 2 block + §27.9 block (two entries) | Both entries consistent. Phase-2 entry covers the entity; §27.9 entry covers the rendered surface. k=5 floor, distinctiveness check, EOI/direct-invite/regulatory de-anonymization triggers preserved. No drift. |
| 22 | Buyer Referral | §4.3.16 | Appendix K → Phase 1 block | Current. Referral Code, Minimum Activity Threshold cross-referenced. No drift. |
| 23 | Pro Trial Seat Grant | §4.3.17 | Appendix K → Phase 1 block ("Buyer-Funded Pro Trial Seat Grant") | Long-form entry already present. New short-form alias entry added in Phase 12.2 sweep (see §3 #2). |
| 24 | k-Anonymity Floor | §4.4 + §48.4.7 | Appendix K → Phase 2 + §48 blocks (two entries) | Both entries consistent. Floor values aligned (k=5 / k=10 / k=20). No drift. |
| 25 | PromotedListing | §4.4.19 | Appendix K → §4.4.19–§4.4.22 block | Current. Second-price auction, category cap, frequency cap config preserved. No drift. |
| 26 | FeaturedPlacement | §4.4.20 | Appendix K → §4.4.19–§4.4.22 block | Current. Editorial mode authoritative; paid-commitment mode reserved under feature flag. Naming collision with the §48.2.10 "Featured Placement" template-library surface noted in §4 below. |
| 27 | VerificationReviewRecord | §4.4.21 | Appendix K → §4.4.19–§4.4.22 block | Current. Earned-not-purchased semantics, separation of duties, quarterly re-review preserved. No drift. |
| 28 | MarketplaceDiscoveryRevenueRecord | §4.8.12 | Appendix K → Phase 4 block | Current. Cost-center isolation, refund companion row, 7-year retention preserved. No drift. |
| 29 | SellerOutcomeSignalConfig | §4.8.13 | Appendix K → Phase 4 block | Current. 12-capability seed, alt-boundary event, timeout-default-rejected invariant preserved. No drift. |
| 30 | SellerOnboardingSession | §4.4.22 | Appendix K → §4.4.19–§4.4.22 block | Current. Hero Moment, Three Conversion Moments, Forced-Vendor-Signup, Abandonment Classifier, Reactivation all cross-linked. No drift. |
| 31 | Seller Activation Metric | §4.4.22 | Appendix K → §4.4.19–§4.4.22 block | Current. p50 < 20 min, p90 < 60 min targets per C.135 preserved. No drift. |
| 32 | Forced-Vendor-Signup Playbook | §4.4.22 | Appendix K → §4.4.19–§4.4.22 block | Current. Magic-link sourcing from buyer-invite, GhostBidImport, buyer referral, Pro Trial Seat Grant preserved. No drift. |

**Verified-without-edit total: 32.**

---

## 3. Terms Added (new Appendix K entries authored in Phase 12.2)

All entries authored under the new Appendix K subheading *"Terms Confirmed in Phase 12.2 Glossary Sweep (v7.0.0 Integration)"* immediately before the Appendix L divider.

| # | Term | Body authoring source | Why added | Authored Extension? |
|---|------|----------------------|-----------|---------------------|
| 1 | Vendor Opt-Out Registry | §4.4.8 + §4.5.6 + §27.10 | Existing Appendix K had `Vendor Opt-Out Record` (the entity) and `Opt-Out Registry Source-of-Truth Rule` (the denormalization rule), but no entry for the registry-as-concept used in narrative throughout Phases 2/3/4. Added as a synonym/aggregation entry with a See-Also pointer to both. | No — consolidation only. |
| 2 | Pro Trial Seat Grant | §4.3.17 + §34.13 | Short-form alias for `Buyer-Funded Pro Trial Seat Grant` (the long-form entity name already in Appendix K). The short form is used in narrative throughout Phases 1, 4, 5, and 11 and required a registered alias to avoid ambiguity. | No — alias only. |
| 3 | Ops Session | §50.1 + §50.18 + §6 + §7.2 | Referenced in body (e.g., "Ops Session Viewer" at line 2043) but never glossary-defined. Distinguishes Ops auth context from Buyer/Seller sessions; required because Ops sessions never carry `org_id` and can read/write across Orgs. | No — body-defined; glossary registration only. |
| 4 | Ops Role Matrix | §50.3 | Authoritative §50.3 surface; closed-set discipline asserted by `ops_capability_matrix_coverage_complete` CI gate. Referenced from Phase 1, 2, 3, 4, 5, 7, 8, 11 sections without prior glossary anchor. | No. |
| 5 | Match Score | §27.4 + §27.4.8 + §48.2.11 + §21.4.2 | The §27.4 ranking model (Summary C.61 v7 supersession of v6 keyword baseline) had no glossary entry. Added with explicit distinction from the Sourcera Method's `grade × weight` math (§10), to prevent recurrence of the v6/v7 conflation that drove the original Summary override. | No. |
| 6 | Managed Agent | §22.10 + KB Engineering Spec §6 + Summary C.55 | Heavily referenced post-integration — including parent-child AIOperation tree depth-6 cap (§4.8.1) — but never glossary-defined. Required to bind §22.10 alias-table semantics, depth-6 cap, and `requires_managed_agent` flag. | No. |
| 7 | MCP Server | §22.8 + §22.13.1 + §22.10 | Existing entry covered "Sourcera KB MCP Server" specifically; the generic concept (third-party MCPs, env-side allowed_hosts allowlist, per-(server, Anthropic Org) rate limits) had no glossary anchor. Added. | No. |
| 8 | Skill | §22.12 + KB Engineering Spec §8 | Referenced in §22 system-prompt-discipline (8K-char cap → migrate to Skill), in §22.10.7 update workflow, and in §22.16.5 canary rollout, but never glossary-defined. Required to bind progressive-disclosure semantics and 500-line skill-body cap. | No. |
| 9 | Environment | §22.13 + KB Engineering Spec §9 | Two Environments (`env_sourcera_kb_runner`, `env_sourcera_bootstrap`) with non-versioned-by-Anthropic semantics; had no glossary anchor. Added with networking/allowed-hosts contract and lifecycle. | No. |
| 10 | Beta Header | §22.2.3 | The `anthropic-beta: managed-agents-2026-04-01` header pinning is critical to the §22 contract; canary-rollout discipline lives at §22.2.3 but had no glossary anchor. Added. | No. |
| 11 | KB Value Meter | §22.18.4 + §34.19.2 + RECONCILIATION.md | Two distinct objects share the name (buyer-facing scalar; seller-facing panel). The collision is documented in §22.18 prose and in RECONCILIATION but never registered as a glossary entry that disambiguates both. Added the unified entry with the (scalar) / (Seller Panel) qualifiers. | No — reconciliation registration. |
| 12 | Hero Moment | §48.1.5 + §4.4.22 + §48.8 + Summary §3.6 / C.132 | The four-phase Seller-Console arc has body-section coverage (§48.1.5 Framework, §48.8 UX surfaces, §4.4.22 entity field `hero_moment_completed_at`) but no glossary anchor. Added with binding to all three. | No. |
| 13 | Stake-Reveal Moment | §22.18.6 + §48.8.5 + Summary §6.13.7 | The §22.18.6 three-moment pattern was authored in Phase 2 of the §22 KB rewrite but never registered. Added with the Appendix J `kb_stake_reveal_moment_enum` reference and the AP-2 anti-pattern guarantee. | No. |
| 14 | Upgrade Carry-Over Guarantee | §34.19 + §22.18.5 + Summary C.139 | Plan-level guarantee referenced from numerous downstream sections (CM3 Conversion Moment, the Honest-Portability microcopy, SellerOnboardingSession field semantics) without a glossary anchor. Added with the 13 Protected Asset Classes summary and the `protected_asset_downgrade_firewall` validator reference. | No. |
| 15 | Honest Portability | §22.18.1 + §22.18.2 + Summary §6.13.7 | The §22.18 design contract had body-section coverage but no glossary anchor. Added with Invariant P3 reference. | No. |
| 16 | On-Platform Compounding | §22.18.1 + §22.18.3 + Summary §6.13.7 | Pair concept to Honest Portability; the five compounding features referenced in Invariant P2. Added. | No. |
| 17 | Marketplace Discovery Pricing | §34.16 + §4.8.12 + Seller Pricing Strategy §12 | Three SKUs and accounting-isolation rule had body-section coverage but no glossary anchor. Added with the FTC disclosure requirement. | No. |
| 18 | Time-Saved Baseline Model | §50.13 + §51.6 + §4.3.19 + Summary C.91 | Existing Appendix K entry was qualified `(customer-facing)` only. Added the unqualified entry that distinguishes the §50.13 Ops-managed library from the §51.6 customer-facing rendition and from individual `TimeSavedCredit` rows. | No. |

**Newly registered total: 18 entries** covering the 14 unregistered terms from the prompt (Vendor Opt-Out Registry, Pro Trial Seat Grant alias, Ops Session, Ops Role Matrix, Match Score, Managed Agent, MCP Server, Skill, Environment, Beta Header, KB Value Meter, Hero Moment, Stake-Reveal Moment, Upgrade Carry-Over Guarantee, Honest Portability, On-Platform Compounding, Marketplace Discovery Pricing) plus a Time-Saved Baseline Model disambiguation that surfaced during the verification pass.

> **Note:** "Time-Saved Baseline Model" was not in the prompt's TERMS TO VERIFY list explicitly, but verification of `Time-Saved Credit` and `Conversion Factor` (Phase 1 entries) revealed the §50.13 Ops surface was glossed only by its customer-facing rendition. Surfaced as part of the verification pass, registered to prevent future drift.

---

## 4. Drift Items Surfaced During Verification (No Body Edits Required)

These are not glossary defects — the glossary entries are correct. They are **cross-section naming overlaps** worth recording so future authoring passes do not reintroduce ambiguity. None block Phase 12.2 exit.

1. **`FeaturedPlacement` (entity, §4.4.20) vs `Featured Placement` (template-library surface attribute, §48.2.10).** Two distinct objects with near-identical names. The §4.4.20 entity is the Marketplace Discovery Pricing FeaturedPlacement record (Ops-curated editorial placement on M9/M11/M13). The §48.2.10 "Featured Placement" is a template-library buyer-browse surface treatment for templates that cross trending / featured / top-pick clone-count thresholds. Both Appendix K entries are correct in their own scope; the prose in any future authoring pass should qualify with "Marketplace Discovery FeaturedPlacement" or "Template Library Featured Placement" wherever ambiguity is possible. Recommended action: add explicit disambiguation in §4.4.20 and §48.2.10 prose preambles in a future hardening pass; no Phase 12.2 action.

2. **`KB Value Meter` (scalar, §34.19.2) vs `KB Value Meter — Seller Panel` (§22.18.4).** Already documented in §22.18 prose and RECONCILIATION.md. Phase 12.2 added a glossary entry that reasserts the disambiguation and the correct usage qualifiers. No further action required.

3. **`Signal Integrity Monitor (SIM)` glossary entry duplication.** Two distinct Appendix K entries, both reference Summary C.100. The duplication was authored deliberately during Phase 1 (entity-side fraud-signal flags) and Phase §48 (anti-spam taxonomy). Both are accurate; they cover orthogonal facets of the same Ops surface. Acceptable per current authoring conventions; flagged here for future consolidation if the glossary is reorganized into a single alphabetized pass.

4. **`k-Anonymity Floor` glossary entry duplication.** Two distinct Appendix K entries, both consistent on the floor values (k=5 / k=10 / k=20). Same pattern as SIM above. Acceptable.

5. **`SellerSignal` glossary entry duplication.** Two entries: the Phase 2 entity-shape entry (§4.4.18) and the §27.9 surface-render entry. Both consistent. Acceptable.

6. **Appendix-letter drift.** The project authoring conventions reference "Appendix-B Glossary" but the spec houses the Glossary at Appendix K. The discrepancy is documented in the Appendix K preamble and in RECONCILIATION.md → Known Gaps. Phase 12.2 does not renumber the appendix. Recommended action: a future hardening pass renumbers Appendix B (Keyboard Shortcuts) → Appendix M (or similar) and elevates the Glossary to Appendix B per the original convention. Out of scope for Phase 12.2.

---

## 5. Terms Deprecated

**None.** Every term verified or added remains active in v7.0.0 spec.

The Phase 12.2 prompt's TERMS TO VERIFY list contained no deprecation candidates. The previous deprecation pass (Phase 4 Pricing Rewrite) registered the v6.0.0 hardcoded "21 capabilities" enumeration as deprecated in favor of the §21.4 Capability Registry; that deprecation has already landed and is not in scope for re-verification here.

---

## 6. Self-Challenge Pass (Opus-Mandatory)

Re-read the new entries as a hostile staff engineer.

1. **"Could a junior engineer build against the new `Managed Agent` entry?"** Yes — the entry binds (a) the Anthropic beta version, (b) the §22.10 alias table for canonical IDs, (c) tool-allowlist composition (`agent_toolset_20260401` + MCP scopes + custom tools), (d) Skill and Environment refs, (e) the depth-6 parent/child AIOperation cap. A new engineer building a capability follows §22.10 → finds this glossary entry → has every cross-reference they need.

2. **"Does the `KB Value Meter` entry actually disambiguate at the implementation level?"** Yes — both objects are named, both surface refs cited (§34.19.2 buyer-side, §22.18.4 seller-side), the qualifier convention "(scalar)" / "(Seller Panel)" is reasserted. Implementations checking the buyer scalar formula vs the seller panel render contract land at different sections. No collision risk in code paths.

3. **"Is the `Marketplace Discovery Pricing` entry buildable?"** Yes — the three SKUs are enumerated, the cost-center isolation invariant is asserted, the FTC disclosure is binding, and the cross-references to §34.16, §4.4.19–§4.4.22, §4.8.12, and Seller Pricing Strategy §12 give Finance, Legal, and Engineering distinct entry points.

4. **"Does the `Ops Session` entry overlap unhelpfully with the `Ops Role Matrix` entry?"** No — Ops Session is the runtime auth context; Ops Role Matrix is the static role/capability catalog. They cite each other but cover orthogonal concepts.

5. **"Is the `Hero Moment` entry consistent with `Hero-Moment Completion`?"** Yes — `Hero-Moment Completion` is the existing entry for the boolean completion event (`hero_moment_completed_at IS NOT NULL` iff Stage-3 invariants hold). The new `Hero Moment` entry covers the four-phase arc itself. Reading them together gives the full picture: the arc, the success condition, and the invariants that gate the success condition.

6. **"Could a QA engineer write tests against the new entries?"** Yes — every entry that names a behavior names the validator (`kb_export_mutation_firewall`, `compounding_feature_source_firewall`, `protected_asset_downgrade_firewall`, `ops_capability_matrix_coverage_complete`) and the binding section. QA can locate tests by validator name.

**Self-challenge findings:** zero blocking issues. One minor refinement applied: clarified that Pro Trial Seat Grant is the canonical short-form alias and `Buyer-Funded Pro Trial Seat Grant` is the long-form entity name, to prevent future drift if a non-buyer-funded variant is ever introduced.

---

## 7. Counterfactual Pass (Three Failure Modes Per New Concept)

**Hero Moment.**
- *Failure mode A:* Stage-3 population latency > 10s but Bid Workspace still renders. → Already addressed: `hero_moment_completed_at` stays NULL; on-call paged via 15-minute rolling p90 alert; session still progresses (graceful degradation).
- *Failure mode B:* `kb_bootstrap` Managed Agent fails at Stage 2/3. → Already addressed: §4.4.22 AC + Capability Graceful Degradation entry — Bid Workspace renders KB-Draft-only; `capability_degradation_triggered=true`; session progresses.
- *Failure mode C:* Buyer-Console user attempts to read a SellerOnboardingSession. → Already addressed: §7.2 firewall; HTTP 404; cross-console access audit event.

**Marketplace Discovery Pricing.**
- *Failure mode A:* Finance dashboard erroneously UNIONs `rev_marketplace_discovery` with `rev_ai_wallet`. → Already addressed: DB CHECK on `cost_center`; QA test `finance_dashboard_cost_center_isolation`.
- *Failure mode B:* PromotedListing rendered without "Promoted" FTC label. → Already addressed: DOM contract test enforces label render on every surface.
- *Failure mode C:* Seller attempts a 5th purchased-top-up PromotedListing in a single calendar month. → Already addressed: 4-per-seller-per-month hard cap, transactional enforcement.

**Honest Portability + On-Platform Compounding.**
- *Failure mode A:* Plan-tier guard accidentally added to `GET /v1/orgs/{org_id}/kb/export`. → Already addressed: §22.18.7 AC #50 explicitly forbids; integration harness asserts across all five tiers.
- *Failure mode B:* Compounding feature reads from `KBExportArchive`. → Already addressed: deploy-time validator `compounding_feature_source_firewall`.
- *Failure mode C:* Export side-effect mutates `KBEntry.confidence_score`. → Already addressed: deploy-time validator `kb_export_mutation_firewall`; QA test under 1,000 synthetic export cycles.

**Counterfactual findings:** every named failure mode is addressed by an existing acceptance criterion or validator. No new authoring required.

---

## 8. Exit Criterion

**Zero undefined terms.** Every term in the Phase 12.2 prompt's TERMS TO VERIFY list resolves to an Appendix K entry — either pre-existing (32 terms) or newly authored (16 terms requested + 1 alias + 1 disambiguation). Plus 1 verification-pass-surfaced disambiguation (Time-Saved Baseline Model unqualified entry). Total Appendix K coverage delta: **+18 entries**.

The Phase 12.2 exit gate **passes**.

---

## 9. Appendix K Editing Log

| Edit | Description | File offset (post-edit, approximate) |
|------|-------------|--------------------------------------|
| 1 | Append new subheading `### Terms Confirmed in Phase 12.2 Glossary Sweep (v7.0.0 Integration)` and the 18 entries below the existing "8-Hue Palette Wrap" entry, before the Appendix L `---` divider. | After existing line 42965 |
| 2 | No deletions. | n/a |
| 3 | No renames or rewrites of pre-existing entries. | n/a |

Backup file: `_versions/Sourcera_Master_Spec_pre-phase-12.2-glossary-2026-04-25.md`. Restore is a single `cp` if rollback is required.

---

## 10. Cross-References for Future Phases

1. **Phase 13 (next):** When Appendix K is reorganized for v7.1.0 (alphabetization, deduplication of dual-entry terms like SIM and k-Anonymity Floor, appendix renumbering to elevate Glossary to Appendix B), use this document as the source-of-truth for what is in Appendix K today and where each entry came from.
2. **CI hygiene:** A markdown-lint rule for Appendix K alphabetization is **not** added in this phase. Recommended for the v7.1.0 reorganization.
3. **Authoring convention pointer:** Project-level CLAUDE.md continues to reference "Appendix-B Glossary." The Appendix K preamble carries the explicit pointer note. Either renumber appendices or amend the convention; either resolution is out of scope for Phase 12.2 but should be addressed before v7.1.0.
