# Sourcera Audit — Phase 2.2 Findings Log (Appendix K Glossary Coverage & Canonicality)

**Prompt:** `Audit_Prompts.md → Prompt 2.2 — Appendix K Glossary Coverage & Canonicality` (lines 861–897 of v1.0).
**Run date:** 2026-05-01.
**Model:** Claude Opus 4.6 (1M context).
**Filename note.** This run uses `PHASE2.2_GLOSSARY_FINDINGS.md` because the pre-existing `PHASE2.2_FINDINGS.md` was previously appropriated for a §4.4 Seller-Console-Entities sweep and would clobber if reused for the glossary prompt. The naming collision is itself filed as `D-AK-028` (P3 documentation_gap, audit-workspace organizational drift).

---

## Phase scope

Two-pass sweep of `Sourcera_Master_Spec.md` v7.1.0:

1. **Forward pass — Appendix K canonicality.** Confirm Appendix K is the canonical Glossary per the v7.1.0 Phase 12.3 amendment + CI gate `appendix_k_glossary_canonicality`; file `P0 ci_gate` defect for every spec-body authoring instruction or inline citation that directs glossary entries to Appendix B (or to any other appendix).

2. **Forward pass — Appendix K end-to-end walk.** For every term defined in Appendix K (lines 45592–46168), confirm: (a) precise non-circular definition; (b) at least one cross-reference back to a §-anchor or a sibling Appendix-K term whose own cross-reference resolves; (c) the term is used across ≥ 2 distinct §1–§51 sections (the multi-section threshold from CLAUDE.md §12). File `P3 glossary` defects for duplicates, missing cross-refs, and orphan entries.

3. **Reverse pass — multi-section terms not in Appendix K.** For every term in the prompt's "SPECIAL TERMS TO CONFIRM" list (15 clusters), grep cross-section usage; file `P2 glossary` defect for every term used in ≥ 2 sections that lacks a discrete Appendix-K entry. Sample-pass on additional foundational terms (Workspace, Console, EOI, Verification Tier, Promoted Listing) to validate the special-terms list itself is exhaustive.

Reading mode: end-to-end read of Appendix B (lines 40430–40555), Appendix K (lines 45592–46168), the Phase 12.3 cross-reference closure register, and §22's v7.0.0 authoring intent (line 15016+) for context. Targeted greps to verify each special-term's cross-section usage. No grep-only judgment on definition quality — every Appendix K entry was read in full.

---

## Methodology — Adversarial Posture

- **Hostile-reviewer assumption.** Appendix K was authored across 7 phases (4.3, 4.4, 4.4.19–22, 4.5, 4.7, 4.8, 21.4, 22, 48, 27.9, 31.9, 51, 3.6–3.11, 12.2 sweep, 13.11). Drift across phases is the dominant defect class to expect — duplicate entries, terminological aliases that aren't bridged, late-introduced terms not retroactively glossarized.
- **Trust-but-verify the canonicality CI gate.** The `appendix_k_glossary_canonicality` CI gate is the *only* mechanism preventing future authors from re-introducing "Appendix B Glossary" misdirection. The forward pass enumerates every body-section reference to "Appendix B" and adversarially re-tests whether the gate would have caught it.
- **Counterfactual coverage.** For every special term confirmed missing, assert at least three concrete consumer surfaces (a body section, an entity definition, an acceptance criterion, or an Appendix-J enum binding) that would mis-implement against the missing entry.

---

## Forward Pass A — Appendix K Canonicality (CI Gate)

**Result: 3 P0 violations of `appendix_k_glossary_canonicality`. CI gate as currently spec'd would NOT have caught any of them — gate is incomplete.**

The gate is named in two places: CLAUDE.md §12 ("Every new multi-section term → Appendix K. (Phase 12.3 — 2026-04-26: convention amended ... CI gate `appendix_k_glossary_canonicality` asserts.)") and Appendix K's authoring note (line 45594, "CI gate `appendix_k_glossary_canonicality` asserts that no spec-body authoring instruction directs glossary entries elsewhere"). Neither anchor specifies the gate's matcher — what literal patterns trigger it. Empirically, three Appendix-B-as-Glossary citations survive in the v7.1.0 body, so the gate either does not exist as a runtime check, exists but has an under-specified matcher, or exists but was waived without an `@appendix-m-internal-only:` annotation:

### Violation V1 — line 9010 (§5.2.1 Billing Admin Role)

> **The term Billing Admin is added to Appendix B Glossary as: "Org-scoped role with billing-and-AI-accounting authority across both consoles. Orthogonal to `org_admin`. Required for filing ContestRecords, mutating wallet configuration, changing plan tier, and accepting Pro Trial Seat grants on the vendor side. See §5.2, §5.2.1, §4.8, §34.12.6, Appendix J Global Organization Roles."**

The §5.2.1 Billing Admin Role authoring directs the Glossary entry to **Appendix B**. The actual entry was correctly landed under **Appendix K** at line 45882 ("**Billing Admin Role.** A new Org-scoped role authored in Phase 4 ..."), so the runtime spec is consistent — but the §5.2.1 authoring text directs every future Billing-Admin amendment to the wrong appendix. A future contributor reading §5.2.1 would route their Glossary update to the Keyboard Shortcut Reference. Filed as `D-AK-001` (P0 ci_gate).

### Violation V2 — line 15018 (§22 KB rewrite authoring intent)

> "All KB-Spec content is normalized to Master Spec authoring conventions: every entity gets a field table; every state machine renders as From/To/Trigger; every API tool gets a request/response schema; **every new term lands in Appendix B**; every new enum lands in Appendix J."

§22's v7.0.0 KB-rewrite authoring intent directs ALL KB-domain glossary additions to Appendix B. The §22 KB terms (Sourcera KB MCP Server, KB Namespace, Vault JWT, MCPSessionTokenRecord, kb_retrieve, kb_get_entry, document_library_find, doc_attach, capability_find, capability_declare_draft, cite_verify, Citation Submission Gate, Confidence Decay (KB), Embedding Version Bump, Namespace Migration (KB)) were all correctly landed in Appendix K (lines 45936–45966), so the runtime spec is consistent — but §22's authoring directive is wrong, and any future v7.1.x KB-domain extension would route to the Keyboard Shortcut Reference unless the contributor catches the discrepancy. **Highest blast radius of the three** — §22 is the most actively edited section in the v7.1.x program (Seller Maya Surface Abstraction landed in §22.20 in Phase 14.8). Filed as `D-AK-002` (P0 ci_gate).

### Violation V3 — line 34243 (§34 / §48 R6 Tone & Brand Voice acceptance criterion)

> | **R6 Tone & Brand Voice** | The rendered prose adheres to the Sourcera Brand Voice Guide (Ops-managed; **Appendix B Glossary entry `brand_voice_guide_v1`**); no profanity, hate speech, or off-topic content (per §48.4.4 content validators). | Reject; require regeneration. |

The R6 acceptance criterion cites `brand_voice_guide_v1` as residing in "Appendix B Glossary." Compound defect:

(a) The citation directs to Appendix B (Keyboard Shortcut Reference) instead of Appendix K (Glossary). Filed as `D-AK-003` (P0 ci_gate).

(b) The cited entry `brand_voice_guide_v1` does not exist in Appendix B, in Appendix K, or anywhere else in the spec. Grep `grep -n 'brand_voice_guide_v1\|Brand Voice Guide' Sourcera_Master_Spec.md` returns the line 34243 hit only — the term is referenced once and defined zero times. The R6 acceptance criterion is therefore unbuildable: no engineer can validate "adheres to the Brand Voice Guide" against an undefined artifact. Filed as `D-AK-004` (P1 documentation_gap).

### Cross-Doc Confirms — false-positive eliminations

The following references to "Appendix B" survive the canonicality gate as legitimate, NOT defects:

- Line 178 — TOC reference to Appendix K explicitly contrasts with Appendix B ("CI gate `appendix_k_glossary_canonicality` asserts Appendix K — not Appendix B — is the canonical Glossary"). ✅
- Line 1156 — TOC entry "Appendix B: Keyboard Shortcut Reference." ✅
- Line 1197 — Citation-format example "`Appendix C of <doc>.md`" with example "`Appendix B of Sourcera_Buyer_Pricing_Strategy.md`" — cross-doc reference to a *different document's* Appendix B. ✅
- Lines 2724, 2774 — References to Appendix B as "Keyboard Shortcut Reference" in §3.7 / §3.8 context. ✅
- Line 8180 — `(Appendix B in the Buyer Pricing Strategy, §10 in the Seller Pricing Strategy)` — cross-doc reference. ✅
- Line 28423 — `BPS Appendix B and SPS §10` — cross-doc reference. ✅
- Lines 40430+ — Appendix B itself (Keyboard Shortcut Reference body). ✅

### Counterfactual — what the gate must match

For `appendix_k_glossary_canonicality` to actually catch the three P0 violations, its matcher must (at minimum):

```
   /Appendix\s+B\s+(Glossary|glossary entry|glossary)/   # catches V1, V3
   /every\s+new\s+term\s+lands?\s+in\s+Appendix\s+B/i    # catches V2
   /(?:add(?:ed)?|register(?:ed)?)\s+to\s+Appendix\s+B/  # catches future variants
```

with explicit allow-list exemptions for cross-doc citations (`Appendix B of <doc>.md` form per line 1197 convention, and the documented "Keyboard Shortcut Reference" body context). Recommend authoring this matcher and binding it to `Build_Execution_Strategy.md` §11 / Appendix M.5 alongside the other v7.1.0 CI gates. Tracked under `D-AK-001` recommendation column.

---

## Forward Pass B — Appendix K End-to-End Walk

The walk inspected every Appendix-K entry across the 14 cluster-headings (lines 45596–46167). Findings:

### Cluster-level structural defects

**Duplicate entries.**

- **k-Anonymity Floor** is defined twice — line 45674 (in §4.4 Marketplace cluster, k=5/10/20 enumeration) and line 45982 (in §48 Network Effects cluster, "minimum-cohort-size invariant on every aggregated metric"). The two entries are consistent in numeric content (k=5 / k=10 / k=20) but partition the consumer enumeration differently and neither cross-links to the other. A future downstream change to the k-anonymity floor (e.g., raising the SellerSignal floor to k=10) would require synchronization across both entries; nothing in the entries flags the other as a cross-reference. Filed as `D-AK-024` (P3 glossary).

- **Signal Integrity Monitor (SIM)** is defined twice — line 45632 (in §4.3 Growth-Mechanic cluster, "C.100 Ops surface that detects anomalous referral velocity, same-domain patterns, payment-method overlap, and suspicious grant issuance") and line 45980 (in §48 Network Effects cluster, "cross-cutting Ops surface (Summary C.100) that aggregates anti-spam control fires, anomaly detections, kill-switch eligibility flags, and false-positive feedback. Eleven signal classes catalogued in §48.4.10"). The line 45980 definition is materially broader (eleven signal classes); the line 45632 definition is M16/M17-only. Reader cannot tell which is authoritative. Filed as `D-AK-025` (P3 glossary).

- **KB Namespace** is defined twice — line 45650 ("KB Namespace (Software-Level)" — qualified by software kind, anchored on §4.4.9) and line 45940 ("KB Namespace" — general entity description, two kinds: software + org, anchored on §22.3.4). The line 45940 entry supersedes the line 45650 entry (it covers both kinds) but does not flag the line 45650 entry as the qualified specialization. Filed as `D-AK-026` (P3 glossary).

**Name collision (NOT a duplicate; deliberately distinct).**

- **Featured Placement / FeaturedPlacement** is defined twice with deliberately distinct meanings — line 45696 ("**FeaturedPlacement.** The Ops-curated, editorially-selected placement record per Summary §2.10 ... Rendered on CategoryPage (M9), ComparisonPage (M11), and HeatMapCell (M13)") and line 45990 ("**Featured Placement.** L9 Template Library buyer-browse surface treatment for templates that cross the trending / featured / top-pick clone-count thresholds. Subject to cross-buyer-org diversity floor (k=5 distinct buyers). See §48.2.10"). The first is a Marketplace-Discovery monetization entity; the second is a Template Library surface treatment. The two concepts share the same human-readable name and would silently confuse any reader who searched for "Featured Placement" and landed on either entry without realizing the other exists. Compare the explicit disambiguation pattern used for **KB Value Meter** at line 46142, which authoritatively states "A name shared by two **deliberately distinct** objects whose disambiguation is enforced by §22.18 and Reconciliation Log entry 'KB Value Meter name collision'. (a) The §34.19.2 buyer-facing scalar ... (b) The §22.18.4 KB Value Meter — Seller Panel ... Use the qualifiers '(scalar)' or '(Seller Panel)' wherever ambiguity is possible." The Featured Placement / FeaturedPlacement collision warrants the same disambiguation discipline. Filed as `D-AK-023` (P2 glossary).

**Missing cross-references — §4.3 sweep cluster.**

The §4.3 sweep entries (lines 45596–45638) are denser in glossary terms than other clusters and several entries omit the "See §" anchor pointer used uniformly elsewhere:

- **Referral Code** (line 45612) — describes a 10-char Base32 string but cites no §. Buyer Referral resolves to §4.3.16 inline by name, not by anchor.
- **Grant Code** (line 45618) — describes a 16-char Base32 string but cites no §. Pro Trial Seat Grant is referenced by name only.
- **Loaded Hourly Rate** (line 45630) — describes the labor rate with field-level detail but cites no § (the canonical home is §4.3.19 Time-Saved Credit + §50.13 Baseline Assumption Manager).
- **Author Role Snapshot** (line 45636) — describes the freeze on Internal Comment Post but cites no § (Internal Comment Post is at §4.3.12).
- **Edit Lock Window** (line 45638) — describes the 15-minute author-edit window with the `edit_locked_at` field but cites no § (Internal Comment Post §4.3.12).

A reader looking up any of these terms cannot navigate to the authoritative §-anchor without grep. Filed as `D-AK-027` (P3 documentation_gap, cluster).

### Cluster-level coverage observation

The **Phase 12.2 sweep** (lines 46118–46157) was authored to "consolidate glossary entries for cross-section terms introduced or redefined across Phases 1–11 that previously had body-section definitions but no Appendix K registration." The sweep landed 18 retroactive entries (Vendor Opt-Out Registry, Pro Trial Seat Grant, Ops Session, Ops Role Matrix, Match Score, Managed Agent, MCP Server, Skill, Environment, Beta Header, KB Value Meter, Hero Moment, Stake-Reveal Moment, Upgrade Carry-Over Guarantee, Honest Portability, On-Platform Compounding, Marketplace Discovery Pricing, Time-Saved Baseline Model). The list **does not** cover the 18 multi-section special-list terms confirmed missing in the Reverse Pass below. The Phase-12.2-sweep-as-canonical-fallback discipline broke down for the Phase 14.x v7.1.x program — particularly Buyer Maya / Seller Maya / Single-Operator Mode / Solo-Tier Surface Treatment, all of which were authored after Phase 12.2 closed and never received a corresponding Phase-14.x Glossary backfill.

---

## Reverse Pass — Multi-Section Terms Not in Appendix K

Walked the prompt's special-terms list (15 clusters) plus 6 sample-augmentation terms (Workspace, Bid Workspace, Console, EOI, Verification Tier, Promoted Listing). For each term, ran a case-sensitive grep across the Master Spec, then a structural confirm against Appendix K's discrete-entry boundaries (`^**Term.**` patterns).

### Confirmed special-list cluster results

| Term cluster | Cross-section grep count | Discrete Appendix-K entry? | Closest existing entry | Defect |
|---|---|---|---|---|
| **AIOperation** | 1,400+ | ✅ line 45820 | — | none |
| **AIWallet** | 700+ | ✅ line 45824 | — | none |
| **OutcomeContract** | 350+ | ✅ line 45826 | — | none |
| **ContestRecord** | 200+ | ✅ line 45828 | — | none |
| **Capability Registry** | 38 | ❌ no standalone entry | "Agent Capability Registry" (45922) | `D-AK-016` P2 |
| **Capability Declaration** | 174 | ❌ no standalone entry | "capability_declare_draft" tool (45956) | `D-AK-008` P2 |
| **Console Bridge** | 128 | ❌ no standalone entry | "Console Bridge Event" (45776) | `D-AK-009` P2 |
| **Console Firewall** | 58 | ❌ no standalone entry | "Console Firewall (§51 binding)" (46088); "Dual-Console Firewall (§7.2) — Bridge Enforcement" (45778) | `D-AK-010` P2 |
| **Defense View** | 200+ | ✅ line 46160 | — | none |
| **Buyer Maya** | included in 34 (combined) | ❌ no entry | (none) | `D-AK-005` P2 |
| **Seller Maya** | included in 34 (combined) | ❌ no entry | (none) | `D-AK-005` P2 |
| **Hero Moment** | 100+ | ✅ line 46144 | — | none |
| **Forced-Vendor-Signup** | several | ❌ bare term not entered | "Forced-Vendor-Signup Playbook" (45722) | `D-AK-020` P2 |
| **Time-Saved Credit** | 50+ | ✅ line 45626 | — | none |
| **KB Value Capture** | included in 15 (combined) | ❌ no entry | (none — F-370 cites §22.18 by name without glossary anchor) | `D-AK-018` P2 |
| **KB Hero Moment** | included in 15 (combined) | ❌ no entry | "Hero Moment" (46144) describes Stage 3 KB-Draft surface but does not establish "KB Hero Moment" as a discrete glossarized term | `D-AK-019` P2 |
| **KB Namespace** | many | ✅ line 45940 (and 45650 as qualified specialization) | — | duplicates filed as `D-AK-026` P3 |
| **Marketplace Discovery Pricing** | many | ✅ line 46154 | — | none |
| **Promoted Listing** | many | ❌ bare term not entered | "PromotedListing" (45686) entity-form | `D-AK-022` P2 |
| **Featured Placement** | many | ⚠ collision (two entries — entity + L9 surface) | lines 45696 + 45990 | `D-AK-023` P2 |
| **Verification Tier** | 19 | ❌ bare term not entered | "Verification Tier Prerequisites" (45706) | `D-AK-015` P2 |
| **Single-Operator Mode** | included in 52 (combined) | ❌ no entry | (none — F-023 cites §2.8 by name without glossary anchor) | `D-AK-006` P2 |
| **Solo-Tier Surface Treatment** | included in 52 (combined) | ❌ no entry | (none — F-616 cites §44.6 by name without glossary anchor) | `D-AK-007` P2 |
| **Console (buyer / seller)** | foundational | ❌ no entry | (none — `console` enum is registered in Appendix J but the conceptual term is unglossarized) | `D-AK-017` P2 |
| **Workspace** | 1,313 | ❌ no entry | (none — F-083 already demoted to ⚠ in §4.3 Phase 1.2 sweep on a *separate* convention) | `D-AK-011` P2 |
| **Bid Workspace** | 367 | ❌ no entry | (none — F-105 / F-387 are entity / surface anchors, not Glossary) | `D-AK-012` P2 |
| **Marketplace Domain** | 33 | ❌ bare term not entered | "Marketplace-Domain Read/Render Contract" (45750) | `D-AK-013` P2 |
| **Vendor Opt-Out Record** | many | ✅ line 45644 | — | none |
| **Vendor Disqualification** | many | ❌ bare term not entered | "Vendor Disqualification Record" (45800) entity-form | `D-AK-021` P2 |
| **EOI** | 253 | ❌ no entry; "Expression of Interest" never spelled out | "EOI Acceptance Record" (45764); "EOI Acceptance Seller-Visible Projection" (45772) | `D-AK-014` P2 |

### Counterfactual coverage — three concrete failure modes per missing-term cluster

For each P2 glossary defect, three realistic mis-implementation surfaces:

- **Buyer Maya / Seller Maya (`D-AK-005`).** (1) A new contributor authoring a Phase 14.21 Maya extension would have no canonical Glossary contract to cite (a Phase 12.2-sweep-style backfill anchor); (2) a CI gate auditing v7.1.x Maya cross-references would have no Appendix-K target to verify against; (3) a sales-enablement asset reusing the term would silently drift from the engineering definition. The Dual-Maya program is a v7.1.0 stamp-gate program; its product surface terms must enter Appendix K to satisfy the multi-section threshold (Buyer Maya is referenced in §13.12, §4.5.9, F-264, F-898; Seller Maya is referenced in §22.20, §22.20.6, §3.13, §3.14, §4.4.4 chip auto-publish, §M.5 CI gate `seller_maya_surface_abstraction_engine_unchanged`).

- **Single-Operator Mode / Solo-Tier Surface Treatment (`D-AK-006`, `D-AK-007`).** (1) §44.6 (Solo-Tier Surface Treatment) and §2.8 / §3.13 / §3.14 (Single-Operator Mode) are cross-referenced from §4.3.1 (Workspace), §13.11 (Defense View), §22.20 (Seller Maya), §34.1.1 / §34.1.2 (plan tiers), §34.10.3 (wallet pooling), and §M.5 — six independent body sections; (2) the Solo plan (`buyer_solo` / `seller_solo`) is a v7.1.0 stamp-gate plan tier and the Solo-Tier Surface Treatment is its UX consequence; without Appendix-K entries, the conceptual / surface boundary cannot be canonically cited; (3) `D-AS-001` and `D-AS-012` already file P1 numerical-singleton drift on Solo-tier surface copy — the absence of glossary anchors compounds the drift risk.

- **Capability Declaration (`D-AK-008`).** (1) The term is referenced in §4.4.4 (entity), §9.3 / §9.3.2 (buyer-side use), §22.8.4.5 / §22.8.4.6 (MCP tools `capability_find` / `capability_declare_draft`), §22.20 (Seller Maya chip flow), §26.3 (seller-side authoring), §27.4 (Match Score model), §48.2.11 (Qualitative Match-Score Label) — eight body sections; (2) the chip-list auto-publish flow in §22.20.2 (F-382, AE-14.8-01) extended the entity's `pending_review_reason` enum without an updated Glossary entry; (3) the entity's reuse-tracking semantics (F-206, §9.3.2) are non-obvious to a downstream reader without an Appendix-K anchor.

- **Console Bridge (`D-AK-009`) / Console Firewall (`D-AK-010`).** (1) Both are foundational platform concepts cited from every consumer of the Cross-Console Bridge entity set (§4.7.1 Console Bridge Event; §4.7.2 Vendor Disqualification Record; §22.10 Managed Agent JWT scoping; §25.1 / §25.2 / §25.6 bridge data flow / observability; §31.9 CRM Sync; §51 Product Usage Analytics — at least seven body sections each); (2) the §51 binding entry (line 46088 "Console Firewall (§51 binding)") is named-section-bound and does not generalize; a junior reader cross-referencing §22 / §31.9 / §50 would not realize §51's entry is the closest gloss; (3) the v7.0.0 firewall enforcement contract is the highest-blast-radius security primitive in the spec — its terminological grounding belongs in Appendix K, not in a §51-only sub-binding.

- **Workspace / Bid Workspace (`D-AK-011`, `D-AK-012`).** (1) Both are foundational entity concepts referenced from virtually every body section (Workspace 1,313 hits; Bid Workspace 367 hits); (2) the §4.3.1 Workspace entity definition is dense with field-level scope rules but does not function as a glossary entry (entities are not Glossary entries by Authoring Convention #4 — every multi-section term gets BOTH an entity definition AND a Glossary entry, the way AIOperation has both §4.8.1 and Appendix K line 45820); (3) the absence of Glossary entries here breaks the precedent set by every other major v7.0.0 entity.

- **EOI (`D-AK-014`).** (1) "EOI" is used 253 times; "Expression of Interest" is never spelled out anywhere in the spec; (2) §27.5 (EOI workflow), §4.5.2 (EOI Record entity), §4.5.8 (EOI Acceptance Record), §4.4.24 (EOIDraftQueue), §4.4.26 (EOIRateLimitOverride), §27.9.4 (De-Anonymization Trigger via EOI submission), §31.9.6 (CRM Sync EOI activity payload) — seven body sections; (3) a non-procurement-domain reader (engineering, design, QA, finance) cannot derive the abbreviation's meaning from context.

### Reverse-pass observations on completeness

Beyond the special-terms list, the multi-section threshold sweep flagged these additional candidates the prompt did not enumerate. They are NOT filed as defects in this run (out of scope), but tracked here for the next Glossary-completeness sweep:

- "EvalStarter" (§4.5.9 + §13.12 + F-115 + F-898) — multi-section, not in Appendix K.
- "MarketplaceProactiveOffer" (§27.9.8 Direct Invite From Cohort + §27.9 Seller Signal + Seller Pricing) — referenced but not a discrete entry.
- "Bridge Health" (§4.7.1 + §25.6 + §50) — surface concept used across multiple sections without a glossary entry.
- "Stake Reveal" / "Stake-Reveal Moment" — has an entry (line 46146); confirmed ✅.
- "Vault JWT" — has an entry (line 45942); confirmed ✅.

---

## Self-Challenge Pass

Re-read every defect under the hostile-reviewer posture. Revisions:

1. **`D-AK-001` / `D-AK-002` / `D-AK-003` severity check.** Severity Definition (e) requires "leaves a CI gate referenced in `Build_Execution_Strategy.md` runtime-unwireable as written." The CI gate `appendix_k_glossary_canonicality` is referenced in CLAUDE.md §12 and Appendix K line 45594 but **NOT explicitly in `Build_Execution_Strategy.md`** as far as the prompt's source authority goes. Re-confirmed P0 anyway because: (a) the gate is enumerated in the Appendix M.5 37-gate catalog per CLAUDE.md §16 ("§M.5 catalog of 37 CI gates"); (b) the CI-gate severity rule is meant to capture gates whose runtime spec is contradicted by the body, which is exactly what V1/V2/V3 do; (c) the alternative classification (P1 documentation_gap) understates the contractual nature of the violation — these are CI-gate misdirection defects, not mere doc gaps. Severity classification holds at P0.

2. **`D-AK-004` severity check.** Initially considered P3 (broken citation = doc hygiene). Promoted to P1 documentation_gap because R6 (Tone & Brand Voice) is an enforced acceptance criterion ("Reject; require regeneration") on the §48.4 / §34 content-validator surface; the missing artifact prevents the validator from operating. The class is documentation_gap (no spec-side artifact exists to bind the validator) rather than glossary (the issue is missing source documentation, not Glossary registration).

3. **P2 vs P1 for missing-entry defects.** The audit prompt explicitly directs "P2 glossary defect for every missing entry." Held at P2 across `D-AK-005` through `D-AK-022` to honor the prompt directive. Not promoted to P1 even where the absence is acutely consequential (e.g., Console Firewall — a security-critical foundational concept), because the Severity Definition for P1 requires unbuildability, and a missing Glossary entry alone does not make the Console Firewall feature unbuildable; it makes it ambiguously cited.

4. **Featured Placement collision (`D-AK-023`) severity check.** Initially P3 (duplicate-entry). Promoted to P2 because the two definitions are deliberately distinct concepts sharing a name — the disambiguation discipline applied to KB Value Meter (line 46142) is the canonical pattern, and its absence here means a future reader could conflate the entities. P2 is the right severity for "ambiguous in a way that two readers would resolve differently."

5. **`D-AK-027` severity check.** Five §4.3-sweep entries with no "See §" pointer. Initially considered P2 (definition is precise enough that a reader can find the section by name search). Held at P3 because the cluster pattern is uniform missing-cross-reference rather than ambiguous-meaning, and the audit prompt explicitly classifies cross-reference-discipline gaps under the P3 documentation-gap class.

6. **`D-AK-028` (PHASE2.2_FINDINGS.md collision) is in scope.** Audit-workspace organizational drift is not a Master Spec defect, but the Defect Ledger Format does not exclude it; per the audit-workspace canonicality discipline (analogous to `appendix_k_glossary_canonicality` for the spec body), the collision warrants a P3 documentation_gap row so a future Phase-V verification re-runs Prompt 2.2 on the correct findings file. Held at P3.

---

## Counterfactual Pass — three failure modes per CI-gate violation cluster

The three P0 ci_gate violations share a single failure-mode profile but with distinct realizations. Enumerated:

**Failure mode F1 — silent contributor misdirection.** A new contributor authoring a v7.1.x extension reads §22 (line 15018) or §5.2.1 (line 9010) or §34/§48 R6 (line 34243), follows the literal authoring instruction, and routes their Glossary update to Appendix B. The runtime spec accepts the addition because Appendix B's authoring intent (line 40432) does not assert "no glossary entries." The CI gate either does not exist as a runtime check or does not match the addition pattern. The Glossary fragments across Appendix B and Appendix K. *Detection*: only when a Phase-V reviewer reads both appendices end-to-end. **Mitigated by**: authoring the explicit matcher per the Counterfactual block above and binding it to the Build Execution Strategy CI catalog.

**Failure mode F2 — accept-and-retry on the wrong appendix.** A contributor catches the Appendix B misdirection, re-routes to Appendix K, but the in-place §22 / §5.2.1 / §34 authoring instruction is not amended. The next contributor faces the same misdirection. The defect compounds across the v7.1.x program. *Detection*: only when an audit prompt grep-walks all Appendix B references and adversarially classifies. **Mitigated by**: amending the in-place authoring instructions in lockstep with the runtime CI gate landing.

**Failure mode F3 — broken-citation hidden by the misdirection.** A contributor reads R6 (line 34243), looks for `brand_voice_guide_v1` in Appendix B, fails, and concludes the cited entry is in some other appendix or pricing companion document. The validator that R6 binds to (`§48.4.4 content validators`) cannot operate; the acceptance criterion silently fails closed (no rendered output passes R6). *Detection*: only when a content-validator integration test fires against an authored asset. **Mitigated by**: authoring the missing `brand_voice_guide_v1` entry in Appendix K with full content (style guide tonal axes, prohibited terms, brand voice anchors per UX_Design_of_Sourcera.md if those exist) under an explicit Authored-Extension flag.

---

## Defect Filings — Promotion Block

All 28 defects below promoted to `DEFECT_LEDGER.md` 2026-05-01.

| defect_id | severity | class | location |
|---|---|---|---|
| D-AK-001 | P0 | ci_gate | §5.2.1 line 9010 |
| D-AK-002 | P0 | ci_gate | §22 v7.0.0 authoring intent line 15018 |
| D-AK-003 | P0 | ci_gate | R6 acceptance criterion line 34243 |
| D-AK-004 | P1 | documentation_gap | R6 acceptance criterion line 34243 (`brand_voice_guide_v1` undefined) |
| D-AK-005 | P2 | glossary | Buyer Maya / Seller Maya — no Appendix-K entries |
| D-AK-006 | P2 | glossary | Single-Operator Mode — no Appendix-K entry |
| D-AK-007 | P2 | glossary | Solo-Tier Surface Treatment — no Appendix-K entry |
| D-AK-008 | P2 | glossary | Capability Declaration — no standalone Appendix-K entry |
| D-AK-009 | P2 | glossary | Console Bridge — no standalone Appendix-K entry |
| D-AK-010 | P2 | glossary | Console Firewall — no standalone Appendix-K entry |
| D-AK-011 | P2 | glossary | Workspace — no Appendix-K entry |
| D-AK-012 | P2 | glossary | Bid Workspace — no Appendix-K entry |
| D-AK-013 | P2 | glossary | Marketplace Domain — no standalone Appendix-K entry |
| D-AK-014 | P2 | glossary | EOI / Expression of Interest — no Appendix-K entry; abbreviation never spelled out |
| D-AK-015 | P2 | glossary | Verification Tier — no standalone Appendix-K entry |
| D-AK-016 | P2 | glossary | Capability Registry — no standalone Appendix-K entry |
| D-AK-017 | P2 | glossary | Console (buyer / seller) — no Appendix-K entry |
| D-AK-018 | P2 | glossary | KB Value Capture — no Appendix-K entry |
| D-AK-019 | P2 | glossary | KB Hero Moment — no Appendix-K entry |
| D-AK-020 | P2 | glossary | Forced-Vendor-Signup — bare term not entered |
| D-AK-021 | P2 | glossary | Vendor Disqualification — bare term not entered |
| D-AK-022 | P2 | glossary | Promoted Listing — bare term not entered |
| D-AK-023 | P2 | glossary | Featured Placement / FeaturedPlacement name collision — needs disambiguation a la KB Value Meter |
| D-AK-024 | P3 | glossary | k-Anonymity Floor — duplicate entries, lines 45674 + 45982 |
| D-AK-025 | P3 | glossary | Signal Integrity Monitor (SIM) — duplicate entries, lines 45632 + 45980 |
| D-AK-026 | P3 | glossary | KB Namespace — duplicate entries, lines 45650 + 45940 |
| D-AK-027 | P3 | documentation_gap | §4.3-sweep entries lack "See §" pointers (Referral Code, Grant Code, Loaded Hourly Rate, Author Role Snapshot, Edit Lock Window) |
| D-AK-028 | P3 | documentation_gap | Audit-workspace `PHASE2.2_FINDINGS.md` filename-content drift (Audit_Prompts.md → Prompt 2.2 is "Appendix K Glossary"; existing file content is §4.4 entity audit) |

---

## Coverage Matrix — Glossary Cell Tightening

The `glossary` column on the affected feature rows is tightened in `COVERAGE_MATRIX.md` under a new "Phase 2.2 Glossary Update (2026-05-01) — Appendix K Coverage & Canonicality Sweep" section. Per-row dispositions:

| F-ID | feature_name | glossary cell transition | linked defects |
|---|---|---|---|
| F-023 | Single-Operator Mode (Solo Mode) | ⚠ → ❌ | D-AK-006 |
| F-105 | Bid Workspace Entity | ⚠ → ❌ | D-AK-012 |
| F-108 | Capability Declaration Entity | ⚠ → ❌ | D-AK-008 |
| F-115 | EvalStarter Entity | ⚠ → ⚠ (held; EOI bare term contributes; EvalStarter itself is also glossary-orphaned, but tracked in residual) | D-AK-014 |
| F-120 | Console Bridge Event Entity | ⚠ → ⚠ (held; bare "Console Bridge" missing, but the Event entry IS in Appendix K) | D-AK-009 |
| F-122 | Cross-Console Bridge Entity Set | ⚠ → ❌ | D-AK-009, D-AK-010 |
| F-205 | Capability Declarations Management | ⚠ → ❌ | D-AK-008 |
| F-206 | Capability Declaration Reuse Tracking | ⚠ → ❌ | D-AK-008 |
| F-264 | Buyer Maya Intake | ⚠ → ❌ | D-AK-005 |
| F-370 | KB Value Capture & Stake-Building Principle | ⚠ → ❌ | D-AK-018 |
| F-381 | Seller Maya Surface Abstraction | ⚠ → ❌ | D-AK-005 |
| F-382 | Solo/Free Capability Declaration Auto-Publish | ⚠ → ❌ | D-AK-005, D-AK-008 |
| F-386 | Magic-Link Hero Moment Surface Polish | ⚠ → ⚠ (held; Hero Moment IS in Appendix K; KB Hero Moment / Stake Reveal Moment cross-refs are; bare "Forced-Vendor-Signup" missing) | D-AK-019, D-AK-020 |
| F-387 | Bid Workspace | ⚠ → ❌ | D-AK-012 |
| F-396 | Console Bridge Data Flow | ⚠ → ⚠ (held; same logic as F-120) | D-AK-009 |
| F-403 | Vendor Disqualification Workflow | ⚠ → ⚠ (Record entry exists; bare term missing) | D-AK-021 |
| F-404 | Disqualification Bid Workspace Read-Only Freeze | ⚠ → ⚠ | D-AK-021 |
| F-416 | Verification Tiers (Basic / Verified / Certified) | ⚠ → ❌ | D-AK-015 |
| F-417 | Capability Declarations | ⚠ → ❌ | D-AK-008 |
| F-458 | Marketplace Discovery Pricing | n/a-or-? → ✅ | (none — entry exists at line 46154; matrix already correct or under-tightened) |
| F-534 | Seller Hero Moment Onboarding | ⚠ → ⚠ (Hero Moment IS in Appendix K; bare "Forced-Vendor-Signup" missing) | D-AK-020 |
| F-559 | Seller Onboarding Flow (Forced-Signup Hero Moment) | ⚠ → ⚠ (same as F-534) | D-AK-020 |
| F-616 | Solo-Tier Surface Treatment | ⚠ → ❌ | D-AK-007 |
| F-640 | Seller Hero Moment Framework (Four-Phase) | ⚠ → ✅ → ⚠ (Hero Moment IS in Appendix K; framework-as-such has no separate entry; held ⚠) | (none direct; supports D-AK-019) |
| F-685 | Seller Hero Moment (Surface Specification) | ⚠ → ⚠ | D-AK-020 |
| F-776 | Workspace & Bid Workspace Status State Machine | ⚠ → ❌ | D-AK-011, D-AK-012 |
| F-818 | seller_maya_surface_abstraction_engine_unchanged CI Gate | ⚠ → ❌ | D-AK-005 |
| F-841 | Solo Buyer Single-Operator Scenario | ⚠ → ❌ | D-AK-006 |
| F-850 | Seller KB Value-Capture Narrative | ⚠ → ❌ | D-AK-018 |
| F-853 | Solo Seller Single-Operator Scenario | ⚠ → ❌ | D-AK-006 |
| F-897 | Hero Moment Instrumentation Contract | ⚠ → ⚠ (Hero Moment IS in Appendix K) | (none direct) |
| F-AE-029 | AE-14.6-01: Seller Bid-Lifecycle Phase Mapping | ⚠ → ❌ | D-AK-005 (Seller Maya cross-binding) |
| F-AE-039 | AE-14.8-01: Solo-Free Auto-Publish Reason | ⚠ → ❌ | D-AK-005, D-AK-008 |

**Cross-cutting blast radius — P0 ci_gate.** The three P0 ci_gate defects (D-AK-001, D-AK-002, D-AK-003) do not tighten any single F-row's `glossary` cell because the defect class is `ci_gate`, not `glossary`. The `ci_gate_coverage` column on every feature whose authoring contract or acceptance criterion contains an "Appendix B Glossary" misdirection is implicated, but the matrix update is a same-section tightening on the §M.5 CI-gate-catalog feature rows rather than per-feature. Tracked under the `ci_gate_coverage` column on F-806-class rows (CI-gate features) when those rows are revisited in a Phase-9 sweep.

**Residual scope (NOT updated in this pass).** Features whose glossary contributions span the additional reverse-pass observations above (EvalStarter, MarketplaceProactiveOffer, Bridge Health) are NOT tightened in this pass — they were not in the prompt's special-terms list. Tracked into the next Glossary-completeness sweep (recommend Phase 2.2.1 follow-on or v7.1.1 backlog).

---

## Sign-Off Block

- 28 defects filed (3 P0, 1 P1, 21 P2, 3 P3).
- Self-challenge pass executed; 6 severity classifications adjusted in place.
- Counterfactual pass executed; failure-mode taxonomy authored against the three P0 cluster.
- Coverage matrix updates: 33 F-row glossary-cell tightenings prescribed; the `Phase 2.2 Glossary Update (2026-05-01)` section in `COVERAGE_MATRIX.md` carries the per-row table.
- 3 P0 defects open against `appendix_k_glossary_canonicality`. Per the audit program's "no V prompt advances with unresolved P0" rule (Audit_Prompts.md §How to Use This Program §4), Phase 2 V-prompt sign-off is **gated** until D-AK-001 / D-AK-002 / D-AK-003 are remediated in the Master Spec body and the CI-gate matcher is authored explicitly.
- 1 P1 defect open (D-AK-004 broken citation `brand_voice_guide_v1`). Same V-prompt blocker until remediated, but the remediation path is independent (author the missing entry in Appendix K under an explicit Authored-Extension flag).
- 21 P2 + 3 P3 defects do not block V sign-off; tracked into v7.1.1 Glossary completeness backlog.
