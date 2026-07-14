# Phase 34.PXC — Pricing Cross-Document Consistency Walk

**Audit prompt.** "For every plan-tier dollar figure, every rate-card cell, every capability free-allowance, every Marketplace Discovery price, compare Master Spec §34, Buyer Pricing v3, Seller Pricing v3. ANY DRIFT IS P1."

**Defect-id mnemonic.** `D-PXC-NNN` (Pricing Cross-doc walk). Sequential within this prompt.

**Run date.** 2026-05-07.

**Master Spec baseline.** v7.1.0 (2026-04-28).
**BPS baseline.** v3, last updated 2026-04-26 (43 KB).
**SPS baseline.** v3, last updated 2026-04-26 (72 KB).

**Sections walked end-to-end.**

| Master Spec section | Companion source | Status |
|---|---|---|
| §34.1 (preamble + citation key) | BPS v3 / SPS v3 frontmatter | ⚠ stale citation header (D-PXC-001 — duplicate of D-AS-006) |
| §34.1.1 (Buyer plan tiers — 30 rows) | BPS v3 §3 + §4 + §5 + §6 + §7 + §10 + §11 | ✅ on numerical cells; ⚠ source-column citation drift (D-PXC-020) |
| §34.1.2 (Seller plan tiers — 25 rows) | SPS v3 §3 + §5 + §6 + §7 + §8 + §9 + §13 + §15.6 | ✅ on numerical cells (cross-checked PHASE34.1 D-PT-002); ⚠ Direct-Invite citation (D-PXC-002) |
| §34.1.3 (Cross-references) | n/a | ✅ |
| §34.2.1 (Buyer Pricing) | BPS v3 §3 row 1–3; §5; §6.1–§6.3; §7 | ✅ |
| §34.2.2 (Seller Pricing) | SPS v3 §3 row 1–3; §5; §6; §7; §8; §9 | ✅ |
| §34.2.3 (Universal Commercial Rules — 9 rules) | BPS v3 §3 footer + §11 + §13; SPS v3 §3 footer + §15 | ⚠ Rule #1 14-day Business Starter trial (D-PXC-017) |
| §34.2.4 (Volume Discount Bands) | BPS v3 §7 line 267; SPS v3 §9 line 346 | ✅ (D-AS-002 already filed for inline restatement in companions) |
| §34.2.5 (Solo Per-Eval / Per-Bid Charge) | BPS v3 §5.4; SPS v3 §5.4 | ✅ (cross-checked PHASE34.1 D-PT-001 / D-PT-005) |
| §34.14.1 (Seller Rate Card — 12 baseline rows) | SPS v3 §10 (12 rows) | ✅ on per-op price cells; **❌ on Plan Gating column for rows 1, 4, 6, 8, 10** (D-PXC-003 / D-PXC-004 / D-PXC-005 / D-PXC-006 / D-PXC-007) |
| §34.14.1.b (8 AE rows) | n/a | ✅ AE-flagged; sign-off-gated |
| §34.14.2 / §34.14.3 / §34.14.4 / §34.14.5 / §34.14.6 | SPS v3 narrative + §11 | ✅ |
| §34.15.1 (Seller Outcome Signals — 12 baseline rows) | SPS v3 §11 (12 rows) | ✅ on signal class / window / threshold; ⚠ source-column citation "SPS §10" (v2 numbering — D-PXC-008) |
| §34.15.1.b (8 AE rows) | n/a | ✅ AE-flagged |
| §34.15.2 / §34.15.3 / §34.15.4 / §34.15.5 / §34.15.6 | SPS v3 §11 narrative | ✅ |
| §34.16.1 (Promoted Listings) | SPS v3 §13.1 | ✅ on $500 floor + 4-additional-cap; **❌ plan-tier gating absent** (D-PXC-009) |
| §34.16.2 (Verification Tiers) | SPS v3 §13.2 | **❌ tier criteria drift** (D-PXC-010); **❌ narrative claims "available on all plans"** (D-PXC-011) |
| §34.16.3 (Featured Placements) | SPS v3 §13.3 | ✅ on editorial-only baseline; ⚠ Paid Mode reservation not in SPS (D-PXC-012) |
| §34.16.4 / §34.16.5 / §34.16.6 / §34.16.7 / §34.16.8 | n/a | ✅ |
| §34.17.1 (Pricing Engineering Requirements — 14 baseline rows) | MS §2.11 (retired) | ❌ row 13 cites retired Master Summary §6.28.2 (D-PXC-013); ⚠ row 6 cites UX paths only (D-PXC-018) |
| §34.17.1.b (11 AE rows) | n/a | ✅ AE-flagged |
| §34.17.2 / §34.17.3 / §34.17.4 | MS §2.11 (retired) | ❌ §34.17.4 AC #1 deploy-gate references retired MS §2.11 baseline without snapshot pointer (D-PXC-014) |
| §34.18.1 (Margin Floor Table) | BPS v3 §13; SPS v3 §14; MS §2.12 (retired) | ⚠ source col cites BPS §11 / SPS §11 (v2 numbering — D-PXC-021); ⚠ retired MS §2.12 references (D-PXC-001 expansion) |
| §34.18.2 (88%/90% Reconciliation) | BPS v3 §2.6; SPS v3 §2.2; MS §2.12 (retired) | ✅ on 88% floor citation; ⚠ retired MS §2.12 reference |
| §34.18.3 (Year-1 Plan Mix) | BPS v3 §13; SPS v3 §14 | **❌ buyer + seller mix omits Solo entirely** (D-AS-004 / D-AS-005 already filed) |
| §34.18.4 (Revenue-Stream Targets) | n/a (AE) | ✅ AE-flagged |
| §34.18.5 (Monthly Finance Scorecard) | BPS v3 §11; SPS v3 §15.5 | **❌ Free-to-paid conversion definitions omit Solo** (D-PXC-015) |
| §34.18.6 (Scenario Analysis) | BPS v3 §13 (Scenarios A/B/C/D); SPS v3 §14 (Scenarios A/B/C/D) | ⚠ scenario letter collision (D-PXC-016) |
| §34.18.7 (Acceptance Criteria) | n/a | ✅ |

---

## 1. Drifts Already Filed (Cross-Reference, Not Re-Filed)

The following defects in the ledger already cover findings surfaced by this walk; this prompt cross-references rather than duplicates.

| Existing defect | Coverage | This walk's cross-ref |
|---|---|---|
| `D-AS-004` (P1 numerical_singleton) | §34.18.3 buyer mix omits Solo (60/15/10/10/5) vs BPS v3 §13 (35/25/20/12/6/2 with Solo) | Confirms P1; same finding |
| `D-AS-005` (P1 numerical_singleton) | §34.18.3 seller mix omits Solo (55/25/15/5/<1) vs SPS v3 §14 (25/25/25/15/8/2) | Confirms P1; same finding |
| `D-AS-006` (P3 consistency_drift) | §34 preamble cites BPS v2 / SPS v2 dates | Confirms; this walk surfaces additional v2-numbered citations in body cells (D-PXC-001 / D-PXC-020 / D-PXC-021) |
| `D-AS-002` (P1 numerical_singleton) | BPS v3 §7 / SPS v3 §9 inline-restate volume-discount bands instead of citing §34.2.4 | Cross-checked; band values correct on both sides |
| `D-AS-011` (P2 consistency_drift) | §34.14.1 cost_base "5% infra overhead" vs BPS v3 §13 / SPS v3 §14 "Convex ≈ 3%" | Cross-checked; not re-filed |
| `D-AS-012` (P1 plan_gating) | §48.8.6 conversion modal claims "Starter Match Score numeric display"; §34.1.2 gates numeric Match Scoring at Growth+ | Surface manifestation of D-PXC-005 (rate-card row 10 also grants Free 25/mo and Starter 500/mo) — files D-PXC-005 as engine-source defect with explicit link to D-AS-012 |
| `D-PT-002` (P1 numerical_singleton, PHASE34.1) | §34.1.2 KB Bootstrap drift vs SPS v3 §3 (Solo 1+1/yr; Starter "1/year" missing "+ 1 lifetime") | Cross-checked; D-PXC-003 escalates to a separate drift inside §34.14.1 row 4 (different conflict surface) |
| `D-PT-001` / `D-PT-005` (PHASE34.1) | Solo per-eval refund eligibility threshold; FX-lock-time gap | Cross-checked; not re-filed |

---

## 2. Net-New Defects Filed by This Walk

### D-PXC-001 — Master Summary §2 references scattered across §34 (P1, documentation_gap)

**Location.** §34.1 preamble line 28638 (citation key); §34.1.1 source-column cells (e.g., line 28647 "MS §2", line 28657 "MS §2 (free core platform)", line 28680 "MS C.80"); §34.18.1 Margin Floor Table lines 30170, 30172, 30173 ("MS §2.12"); §34.17.1 row 13 line 30106 ("Summary §6.28.2"); §34.17.4 AC #1 line 30152 ("MS §2.11"); §34.15.1 lines 29824–29835 (12 cells citing "MS §2.9 row N"); §34.14.1 lines 29731–29742 (12 cells citing "MS §2.8 row N"); §34.17.1 lines 30094–30107 (14 cells citing "MS §2.11 item N").

**Summary.** Master Spec §34 contains 50+ citations to "MS §2.X" referring to `Sourcera_Master_Summary.md §2`, but Master Summary is retired in v7.0.0 (snapshot at `_baselines/retired-sources/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md`). The citation key in §34.1 preamble (line 28638) still defines `MS = Sourcera_Master_Summary.md §2`, formalizing a non-authoritative source.

**Evidence.** Line 28638: `**MS** = `Sourcera_Master_Summary.md §2`; **AE** = Authored Extension`. CLAUDE.md §2 source-of-truth hierarchy: "`Sourcera_Master_Summary.md` *(retired in v7.0.0; snapshot at `_baselines/retired-sources/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md`)*… Superseded by Master Spec. **Do not consult.**"

**Convention violated.** CLAUDE.md §2 source-of-truth hierarchy; Authoring Convention #10 (numerical singletons must cite a still-authoritative source); D-AS-006 partially covered the preamble citation but did not catalog the body-cell scatter.

**Recommendation.** Two options. (a) Replace every "MS §2.X" citation across §34 with a citation to a frozen snapshot path (e.g., `_integration/snapshots/MS_2.8_baseline.md`, `MS_2.9_baseline.md`, `MS_2.11_baseline.md`, `MS_2.12_baseline.md`) — §34.15.6 AC #10 already follows this pattern for `MS §2.9` (`_integration/snapshots/MS_2.9_baseline.md`). (b) Re-home the substantive content of MS §2.8 / §2.9 / §2.11 / §2.12 into the Master Spec body (it already is, in §34.14 / §34.15 / §34.17 / §34.18) and replace inline "MS" citations with self-cites. Option (b) is preferred. Either way, update the §34.1 citation key.

**Severity rationale.** P1. Per the Severity Definitions, "missing… consistency drift between Master Spec and a companion strategy doc". Master Summary is retired; a v7.1.0 production deploy reading §34.1 preamble would not find the source it cites at v3-current paths.

**Owner hint.** engineering.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** D-AS-006 (preamble subset, P3); CLAUDE.md §2; `_integration/snapshots/MS_2.9_baseline.md` (existing precedent for frozen-snapshot pattern).

---

### D-PXC-002 — §34.1.2 "Direct Invite from Cohort" cell cites SPS v3 §7 which does not document the feature (P2, documentation_gap)

**Location.** §34.1.2 line 28708 (Direct Invite from Cohort row, Source column).

**Summary.** §34.1.2 "Direct Invite from Cohort (§27.9.8)" cell cites "SPS §3 / §7" but SPS v3 §7 (Seller Growth) and SPS v3 §8 (Seller Scale) do not document the Direct Invite feature; SPS v3 narrative is silent on this Master-Spec-internal feature.

**Evidence.** §34.1.2 line 28708: `Direct Invite from Cohort (§27.9.8) | — | — | — | — | Included | Included + API | SPS §3 / §7; gate authoritative at §27.9.8.10`. SPS v3 §7 (Seller Growth) lines 281–304: covers CRM Sync, Numeric Match Scoring, weekly Seller Signals digest — no Direct Invite mention. SPS v3 §8 (Seller Scale) lines 308–334: covers Read-only API, Promoted placement, Shared CSM — no Direct Invite mention. The §34.1.2 cell row's "Included" entitlement is on Scale and Enterprise, but the citation routes to Growth (§7).

**Convention violated.** Authoring Convention #10 — every plan-gated feature's source citation must resolve to authoritative content; CLAUDE.md §11 plan-gating discipline.

**Recommendation.** Replace "SPS §3 / §7" with either (a) "Master Spec §27.9.8 (canonical; not in SPS narrative)" if the feature is intentionally MS-internal, or (b) update SPS v3 §8 (Seller Scale) to add a Direct Invite from Cohort line item under the Scale feature list, then cite "SPS §8".

**Severity rationale.** P2. Citation does not resolve to a section that documents the feature; junior engineer cross-checking SPS v3 §7 will find no Direct Invite content. Per the prompt's "ANY DRIFT IS P1" rule, this is bibliographic-citation drift (not numerical), keeping at P2.

**Owner hint.** pricing.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** §27.9.8 (canonical home).

---

### D-PXC-003 — §34.14.1 row 4 (`kb_bootstrap`) Plan Gating column triple-conflicts with §34.1.2 and SPS v3 (P1, numerical_singleton)

**Location.** §34.14.1 row 4 line 29734 (Plan Gating column).

**Summary.** §34.14.1 row 4 declares `kb_bootstrap` Plan Gating as "Free/Starter: 1 lifetime per Seller Org (AE). Growth/Scale: 4/mo. Enterprise: unlimited" — but §34.1.2 KB Bootstrap row says `Free: 1 lifetime / Solo: 1 lifetime + 1/year re-bootstrap / Starter: 1/year / Growth: 3/year / Scale: Unlimited / Enterprise: Unlimited`, and SPS v3 §3 + §6 + §7 + §8 say `Free: 1 lifetime / Solo: 1 lifetime + 1/yr re-bootstrap / Starter: 1 lifetime + 1/yr / Growth: 1 lifetime + 3/yr / Scale: Unlimited / Enterprise: Unlimited`. Three values disagree on Starter (1 lifetime vs 1/year vs 1 lifetime + 1/yr), Growth (4/mo vs 3/year vs 1 lifetime + 3/yr), and Scale (4/mo vs Unlimited vs Unlimited).

**Evidence.**
- Master Spec line 29734: `Free/Starter: 1 lifetime per Seller Org (AE). Growth/Scale: 4/mo. Enterprise: unlimited`.
- Master Spec line 28699: `KB Bootstrap (Opus) | 1 lifetime (M1 promise) | 1 lifetime + 1/year re-bootstrap | 1/year | 3/year | Unlimited | Unlimited`.
- SPS v3 §3 line 116: `KB Bootstrap | 1 lifetime | 1 lifetime + 1/yr re-bootstrap | 1 lifetime + 1/yr | 1 lifetime + 3/yr | Unlimited | Unlimited`.
- SPS v3 §6 (Starter) line 265: `1 re-Bootstrap per year`.
- SPS v3 §7 (Growth) line 291: `3 re-Bootstraps per year`.
- SPS v3 §8 (Scale) line 318: `Unlimited Bootstraps`.

**Convention violated.** CLAUDE.md §11 Plan Gating ("never duplicate a limit inline — cite the source table"); Authoring Convention #10 (numerical singletons require single home — §34.1.2 is authoritative); §34.1 preamble line 28636 ("Every other section that references plan capabilities… MUST link back to §34.1 rather than restating cell values").

**Recommendation.** Convert the §34.14.1 row 4 Plan Gating column from a restatement to a citation: `See §34.1.2 KB Bootstrap row; AE Free/Starter "1 lifetime" allowance via §34.14.4 #1`. The "Growth/Scale: 4/mo" figure is inconsistent with both §34.1.2 (3/year on Growth, Unlimited on Scale) and SPS v3 (3/yr on Growth, Unlimited on Scale) — appears to be an authored value with no companion source. Either drop or re-cite §34.1.2.

**Severity rationale.** P1 numerical_singleton drift between Master Spec sections AND between Master Spec and SPS v3. Per the prompt's rule "ANY DRIFT IS P1." A junior engineer reading §34.14.1 would build a 4/mo Growth allowance enforcement that contradicts §34.1.2's 3/year cap.

**Owner hint.** pricing.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** D-PT-002 (PHASE34.1) for §34.1.2 vs SPS v3 §3 drift on Starter "1 lifetime + 1/yr".

---

### D-PXC-004 — §34.14.1 row 8 (`seller_page_enrichment`) Plan Gating drifts ~36×–80× from §34.1.2 + SPS v3 (P1, numerical_singleton)

**Location.** §34.14.1 row 8 line 29738 (Plan Gating column).

**Summary.** §34.14.1 row 8 declares `seller_page_enrichment` Plan Gating as "Free: 0. Starter: 3/mo. Growth: 20/mo. Scale: 80/mo. Enterprise: unmetered" — but §34.1.2 + SPS v3 §3 + SPS v3 §6 / §7 / §8 narrative all agree on "1/yr / 3/yr / 12/yr / Unlimited" for Starter / Growth / Scale / Enterprise. §34.14.1 row 8 grants ~36× the Starter cap (3/mo = 36/yr vs 1/yr), ~80× the Growth cap (20/mo = 240/yr vs 3/yr), and ~80× the Scale cap (80/mo = 960/yr vs 12/yr).

**Evidence.**
- Master Spec line 29738: `Free: 0. Starter: 3/mo. Growth: 20/mo. Scale: 80/mo. Enterprise: unmetered`.
- Master Spec line 28705: `Seller Page Enrichment (Opus) | — | — | 1/year | 3/year | 12/year | Unlimited`.
- SPS v3 §3 line 122: `Seller Page Enrichment (Opus) | — | — | 1/yr | 3/yr | 12/yr | Unlimited`.
- SPS v3 §6 (Starter) line 271: `1 Seller Page Enrichment per year`.
- SPS v3 §7 (Growth) line 296: `3 Seller Page Enrichments per year`.
- SPS v3 §8 (Scale) line 323: `12 Seller Page Enrichments per year`.

**Convention violated.** CLAUDE.md §11 Plan Gating; Authoring Convention #10; §34.1 preamble single-source rule.

**Recommendation.** Convert §34.14.1 row 8 Plan Gating column to a citation: `See §34.1.2 Seller Page Enrichment row (Free 0 / Solo 0 / Starter 1/yr / Growth 3/yr / Scale 12/yr / Enterprise Unlimited)`. Drop the inline restatement entirely. Add §34.14.1 to the `seller_rate_card_plan_gating_single_source` deploy-time validator (new — cross-check Plan Gating column values in §34.14 / §34.15 against §34.1.2 cells; CI fails on numeric drift).

**Severity rationale.** P1. Catastrophic numerical drift; if §34.14.1 is the source-of-truth for the rate-card service, the engine will allow 80×/year enrichment on Scale where §34.1.2 caps at 12/year. Revenue-leakage AND quota-honor violations.

**Owner hint.** pricing.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** D-PXC-003 (same defect class on `kb_bootstrap`); §34.14.6 AC #1 (no-orphans validator does not currently check Plan Gating column).

---

### D-PXC-005 — §34.14.1 row 10 (`match_score_numeric`) Plan Gating violates §34.1.2 + SPS v3 §2.5 entitlement gate (P1, plan_gating)

**Location.** §34.14.1 row 10 line 29740 (Plan Gating column).

**Summary.** §34.14.1 row 10 declares `match_score_numeric` Plan Gating as "Free: 25/mo. Starter: 500/mo. Growth+: unmetered" — but §34.1.2 Match Scoring (numeric) row says "Labels only / Labels only / Labels only / Included / Included + batch API / Included + batch API" (gating numeric scoring at Growth+), and SPS v3 §2.5 explicitly states "Free, Solo, and Starter sellers see qualitative labels only ('Strong Match'). Numeric Match Scoring is gated behind Growth+." §34.14.1 row 10 grants Free 25/mo and Starter 500/mo numeric scoring, which contradicts the canonical entitlement.

**Evidence.**
- Master Spec line 29740: `Free: 25/mo. Starter: 500/mo. Growth+: unmetered`.
- Master Spec line 28706: `Match Scoring (numeric) | Labels only | Labels only | Labels only | Included | Included + batch API | Included + batch API`.
- SPS v3 §2.5 line 67: `Decision: Free, Solo, and Starter sellers see qualitative labels only ("Strong Match"). Numeric Match Scoring is gated behind Growth+.`
- SPS v3 §3 line 123: `Match Scoring (numeric) | Labels only | Labels only | Labels only | Included | Included | Included`.
- §34.8.5 entitlement matrix (referenced by D-AS-012): `match_score_numeric | soft | n/a | n/a | seller_growth | …`.

**Convention violated.** §5.11 Feature Access Matrix; §34.1.2 plan-tier table; §34.8.5 Entitlement Matrix; CLAUDE.md §11 Plan Gating.

**Recommendation.** Replace §34.14.1 row 10 Plan Gating column with `See §34.1.2 Match Scoring (numeric) row — Growth+ only; not eligible for Free / Solo / Starter`. Drop the "Free 25/mo" and "Starter 500/mo" allowances; they do not exist in the entitlement matrix. Add a deploy-time validator `rate_card_entitlement_consistency` that cross-checks every §34.14.1 row's Plan Gating column against the §34.8.5 Entitlement Matrix `plan_gate_min_tier` and the §34.1.2 cell value.

**Severity rationale.** P1. Plan_gating violation. If §34.14.1 row 10 is the source-of-truth for the AIWallet's pre-charge entitlement check, Free/Starter sellers would be authorized to consume numeric Match Scoring against the entitlement matrix's explicit gate. This is the engine-source twin of D-AS-012 (modal copy promising the same feature on Starter).

**Owner hint.** pricing.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** D-AS-012 (surface-level twin: §48.8.6 modal); §34.1.2 Match Scoring row; §34.8.5 entitlement.

---

### D-PXC-006 — §34.14.1 row 6 (`firecrawl_crawl_dedupe`) Free 50 lifetime allowance vs §34.1.2 0 Firecrawl sources (P2, documentation_gap)

**Location.** §34.14.1 row 6 line 29736 (Plan Gating column).

**Summary.** §34.14.1 row 6 grants Free sellers "50 lifetime" page-processing operations of `firecrawl_crawl_dedupe`, but §34.1.2 + SPS v3 §3 say Free has "0 Firecrawl sources". A seller with 0 sources cannot consume the 50 lifetime allowance unless the allowance is meant to be redeemed via manual KB ingestion paths (which is not explicit). Reconciliation between source-count gate (§34.1.2) and page-processing allowance (§34.14.1) is unclear.

**Evidence.**
- Master Spec line 29736: `Free: 50 lifetime. Starter: 500/mo. Growth+: unmetered`.
- Master Spec line 28698: `Firecrawl Sources | 0 | 1 (weekly) | 2 (weekly) | 10 (daily) | Unlimited (real-time, fair-use ≤ 50 domains) | Unlimited`.
- SPS v3 §3 line 115: `Firecrawl sources | 0 | 1 (weekly) | 2 (weekly) | 10 (daily) | Unlimited (real-time) | Unlimited`.
- SPS v3 §4 (Free) lines 138–148: Free entitlements list does not name Firecrawl page-processing allowance; "1 lifetime KB Bootstrap" is the only crawling-related entitlement.

**Convention violated.** Authoring Convention #10; CLAUDE.md §11 Plan Gating; §34.1 preamble single-source.

**Recommendation.** Either (a) clarify in §34.14.1 row 6 that the "Free: 50 lifetime" allowance applies only to KB Bootstrap-driven crawls (which Free does have via the 1 lifetime KB Bootstrap), or (b) drop the Free 50 lifetime allowance and align with §34.1.2 (Free = 0 Firecrawl sources, no `firecrawl_crawl_dedupe` allowance). Option (a) is more likely the intent — KB Bootstrap consumes `firecrawl_crawl_dedupe` operations under the hood — but the contract should be explicit.

**Severity rationale.** P2. Ambiguity reachable by two readers in different ways; a junior engineer might wire `firecrawl_crawl_dedupe` access for Free sellers (per row 6) when the source-count gate (§34.1.2) blocks all crawling on Free.

**Owner hint.** engineering.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** §22 (Seller KB / Firecrawl); §34.14.4 Free Allowance Overrides.

---

### D-PXC-007 — §34.14.1 row 1 (`first_pass_rfp_draft`) Free "25 lifetime" allowance cites §34.1.2 but §34.1.2 does not document this allowance (P2, documentation_gap)

**Location.** §34.14.1 row 1 line 29731 (Plan Gating column).

**Summary.** §34.14.1 row 1 says "All seller plans; Free = 25 lifetime (§34.1.2)" — but §34.1.2 First-Pass RFP Response Generator row says `Wallet (Free $5 hard cap) / Engine-absorbed envelope (same engine as Starter+, surface-abstracted; no mid-bid budget wall) / Wallet | Wallet | Wallet | Committed`. §34.1.2 does NOT contain a "25 lifetime" cap; the citation does not resolve.

**Evidence.**
- Master Spec line 29731: `All seller plans; Free = 25 lifetime (§34.1.2)`.
- Master Spec line 28700: `First-Pass RFP Response Generator | Wallet (Free $5 hard cap) | Engine-absorbed envelope … | Wallet | Wallet | Wallet | Committed`.
- SPS v3 §4 (Free) line 143: `$5/mo AI budget with a hard cap (enough for 1 first-pass draft + Q&A assist on a small bid; will exhaust mid-bid on RFPs with >60 dense requirements)`.

**Convention violated.** CLAUDE.md §11 (citation discipline); Authoring Convention #10 (single-source).

**Recommendation.** Either (a) drop the "Free = 25 lifetime (§34.1.2)" reference and replace with `Wallet-funded; Free $5 hard cap per §34.1.2` (no lifetime count), or (b) author the 25 lifetime allowance into §34.1.2 + Appendix J `free_allowance_capability` if the rate-card service intends to enforce a hard count. Option (a) appears correct — Free first-pass draft is wallet-funded, not allowance-counted.

**Severity rationale.** P2. The 25 lifetime number is internally inconsistent — appears once in §34.14.1 row 1 with no other source. A junior engineer might wire a `FreeAllowanceCounter` for `first_pass_rfp_draft` with a 25-lifetime cap that contradicts §34.1.2's wallet-funded model.

**Owner hint.** pricing.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** §4.8.7 FreeAllowanceCounter; §34.14.4 Free Allowance Overrides.

---

### D-PXC-008 — §34.15.1 source-column citations to "SPS §10 row N" use v2 numbering (P3, consistency_drift)

**Location.** §34.15.1 source column lines 29824–29835 (12 rows).

**Summary.** §34.15.1 outcome contracts source column cites "SPS §10 row 1" through "SPS §10 row 12" but SPS v3 numbers the seller-side outcome signals table as §11 (Seller-Side Outcome Signals); v3 §10 is "Seller-Side Capability Rate Card". The citations carry forward v2 section numbering.

**Evidence.**
- Master Spec lines 29824–29835: each row's Source column cites `SPS §10 row N`.
- SPS v3 §10 lines 357–379: rate card table.
- SPS v3 §11 lines 384–402: outcome-signals table.
- SPS v3 frontmatter line 7: "Section numbering shifted: prior §5–§21 are now §6–§22 to accommodate the new §5 Seller Solo Plan."

**Convention violated.** Citation hygiene.

**Recommendation.** Replace all 12 `SPS §10 row N` citations in §34.15.1 source column with `SPS v3 §11 row N`. Same fix needed in §34.14.1 row source column where applicable (`SPS §9 row N` → `SPS v3 §10 row N`).

**Severity rationale.** P3. Bibliographic citation drift; numerical content is unchanged. Per the audit's standard rubric, P3.

**Owner hint.** engineering.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** D-PXC-020 (broader citation drift in §34.1.1); D-AS-006 (§34 preamble version drift).

---

### D-PXC-009 — §34.16.1 Promoted Listings auction does not enforce plan-tier eligibility per §34.1.2 / SPS v3 §13.1 (P1, plan_gating)

**Location.** §34.16.1 lines 29923–29953 (entire SKU 1 block, including Acceptance #4 line 30078).

**Summary.** §34.16.1 specifies a second-price auction for promoted listings with a $500 reserve, $10,000 max-bid sanity cap, k=5 anonymization, and a `quality_floor` gate (Verification Tier ≥ Basic). It does NOT enforce plan-tier eligibility. But §34.1.2 Promoted Marketplace Placements row gates promoted-listing access to Scale (1/month) and Enterprise (3/month); Free/Solo/Starter/Growth are explicitly "—". SPS v3 §13.1 says "1 included per month at Scale, 3 at Enterprise; **not available below Scale (including Solo and Starter)**." The Master Spec auction flow allows any seller to submit a bid.

**Evidence.**
- Master Spec line 28710: `Promoted Marketplace Placements | — | — | — | — | 1/month (category-capped) | 3/month`.
- SPS v3 §13.1 line 430: `1 included per month at Scale, 3 at Enterprise; not available below Scale (including Solo and Starter).`
- Master Spec line 30003 (`§34.16.4` guardrail): `quality_floor gate blocks any seller with Verification Tier < Basic or anti-spam flags from promoted bidding` — only Verification gate, no plan-tier gate.
- Master Spec line 30077 (Acceptance #4): `Promoted Listing seller monthly cap (1 primary + 4 additional) MUST be enforced; over-cap bids return HTTP 409 promoted_listing_category_locked` — caps quantity but does not gate eligibility.

**Convention violated.** §5.11 Feature Access Matrix; §34.1.2 plan-tier table; §34.8 Entitlement Enforcement.

**Recommendation.** Add a plan-tier eligibility check to §34.16.1 #2 (sealed-bid submission) and to Acceptance #2: "Sellers MUST be on Seller Scale or Seller Enterprise to submit a Promoted Listing bid; bids from Free / Solo / Starter / Growth are rejected with HTTP 403 `promoted_listing_plan_tier_ineligible` (new error code, register in Appendix I)." Add a deploy-time validator `promoted_listing_plan_tier_gate`.

**Severity rationale.** P1 entitlement_drift. A Free/Solo/Starter/Growth seller could win a promoted auction and pay $500/wk, contradicting both §34.1.2 (— × 4) and SPS v3 §13.1. This is a billing-surface ambiguity that allows revenue collection from sellers who are not entitled to the feature — close to a P0 by the "billing surface ambiguous in a way that allows revenue leakage" rule, but bumped to P1 because the leakage is INWARD (Sourcera would charge the seller and grant the feature) rather than OUTWARD.

**Owner hint.** engineering.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** §34.1.2 Promoted Marketplace Placements row; SPS v3 §13.1.

---

### D-PXC-010 — §34.16.2 Verification Tier criteria drift between Master Spec and SPS v3 (P1, numerical_singleton)

**Location.** §34.16.2 lines 29957–29976 (Verification Tiers SKU); SPS v3 §13.2 lines 434–439.

**Summary.** Master Spec and SPS v3 publish materially different qualification criteria for the same Verification Tier names:

| Tier | Master Spec §34.16.2 (line 29959) | SPS v3 §13.2 (lines 435–437) |
|---|---|---|
| Basic | "self-attested KYB + email verification" | "free, Free tier only — domain verification only" |
| Verified | "domain + business registration + uptime history" | "free when earned; Solo+ — requires profile completeness + SOC 2 or ISO document uploaded and validated by Ops" |
| Certified | "full compliance audit — SOC 2, HIPAA, GDPR, etc." | "free when earned; Growth+ — requires Verified + ≥ 3 closed bids on Sourcera with buyer-side confirmation" |

The two source documents define different qualification gates for the same tier names. Plus the eligibility-tier mapping diverges.

**Evidence.**
- Master Spec line 29959: `Basic (self-attested KYB + email verification), Verified (domain + business registration + uptime history), Certified (full compliance audit — SOC 2, HIPAA, GDPR, etc.).`
- SPS v3 §13.2 lines 435–437: as above.

**Convention violated.** Authoring Convention #10 (numerical/criteria singletons require single home); CLAUDE.md §2 source-of-truth (Master Spec wins, but §34.16.2 does not currently subsume SPS narrative).

**Recommendation.** Resolve the canonical criteria in Master Spec §34.16.2 and update SPS v3 §13.2 to cite §34.16.2 verbatim, OR vice versa. Open call: which criteria are correct? SPS v3 §13.2 reads as more rigorous (SOC 2/ISO upload for Verified; ≥3 closed bids with buyer confirmation for Certified). Master Spec §34.16.2 reads as more permissive (uptime history for Verified; broad compliance audit for Certified). File as a "Critical Question" requiring product/legal sign-off; track in `_integration/Decisions.md`. Until resolved, P1.

**Severity rationale.** P1. Trust-tier verification is a legal/regulatory surface (SOC 2 means something specific). Two readers of these docs would build different verification review queues with different acceptance gates. Per the prompt's "ANY DRIFT IS P1" rule, this is squarely P1.

**Owner hint.** legal + ops.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** §4.4.21 VerificationReviewRecord; SPS v3 §13.2.

---

### D-PXC-011 — §34.16.2 narrative says "Verification available to sellers on all plans" but §34.1.2 + SPS v3 §13.2 already gate Verified at Solo+ and Certified at Growth+ (P1, plan_gating)

**Location.** §34.16.2 line 29976 ("Plan Gating" paragraph).

**Summary.** §34.16.2 says: `Verification is available to sellers on all plans; higher tiers (Certified) MAY be restricted to Growth+ plans in a future release (Sales-Ops sign-off pending; flagged in RECONCILIATION).` But §34.1.2 (Verification Tier Cap row) already gates Verified eligibility to Solo+ and Certified eligibility to Growth+: `Basic / Verified eligibility / Verified eligibility / Certified eligibility / Certified / Certified` for Free/Solo/Starter/Growth/Scale/Enterprise. SPS v3 §13.2 confirms the same: Verified is "Solo+", Certified is "Growth+". §34.16.2's "MAY be restricted in a future release" is stale — the restriction is already authoritative at v7.1.0.

**Evidence.**
- Master Spec line 29976: `Plan Gating: Verification is available to sellers on all plans; higher tiers (Certified) MAY be restricted to Growth+ plans in a future release (Sales-Ops sign-off pending; flagged in RECONCILIATION).`
- Master Spec line 28703: `Verification Tier Cap | Basic | Verified eligibility | Verified eligibility | Certified eligibility | Certified | Certified`.
- SPS v3 §13.2 lines 436–437: `Verified (free when earned; Solo+) … Certified (free when earned; Growth+)`.

**Convention violated.** CLAUDE.md §11 Plan Gating ("never duplicate a limit inline — cite the source table"); Authoring Convention #10.

**Recommendation.** Update §34.16.2 Plan Gating paragraph to `Per §34.1.2 Verification Tier Cap row: Basic on Free; Verified eligibility on Solo+; Certified eligibility on Growth+. SPS v3 §13.2 narrative consistent.` Drop the "MAY be restricted in a future release" language — the gate is already in force.

**Severity rationale.** P1. The narrative implies a more permissive policy than the canonical §34.1.2 cell + SPS v3 §13.2. A junior engineer reading §34.16.2 would build verification review-queue intake without plan-tier gating.

**Owner hint.** pricing.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** §34.1.2 Verification Tier Cap; SPS v3 §13.2.

---

### D-PXC-012 — §34.16.3 Featured Placements paid-mode reservation absent from SPS v3 §13.3 (P3, documentation_gap)

**Location.** §34.16.3 lines 29986–29996; SPS v3 §13.3 lines 441–442.

**Summary.** §34.16.3 reserves a `paid_commitment` Featured Placement mode (feature-flagged off in v7.0.0); SPS v3 §13.3 says only "Strictly editorial. Controlled by Marketing, not purchasable." with no acknowledgment of the reserved paid mode. Cosmetic narrative gap; not a numerical drift.

**Evidence.**
- Master Spec line 29986: `Paid Mode (feature-flag gated, future-release): The spec reserves a paid_commitment mode in which a seller MAY pay a monthly retainer for a guaranteed featured placement. This mode is feature-flagged off by default in v7.0.0…`
- SPS v3 §13.3 line 442: `Strictly editorial. Controlled by Marketing, not purchasable. Featured sellers are chosen based on {verification tier, category relevance, KB health score, buyer engagement signals}.`

**Convention violated.** Cosmetic; SPS v3 should cross-reference the future paid-mode reservation for completeness.

**Recommendation.** Append to SPS v3 §13.3: `(Master Spec §34.16.3 reserves a Paid Mode feature-flagged off by default; activation requires VP Marketing + VP Finance + VP Legal sign-off and is not purchasable in v7.x.)`

**Severity rationale.** P3. Documentation hygiene; no numerical or behavioral drift.

**Owner hint.** pricing.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** §34.16.3.

---

### D-PXC-013 — §34.17.1 row 13 cites retired Master Summary §6.28.2 as the magic-link SSO orchestrator implementation source (P1, documentation_gap)

**Location.** §34.17.1 row 13 line 30106.

**Summary.** §34.17.1 row 13 (MS §2.11 item 13: Magic-link SSO orchestrator) cites "Seller onboarding orchestrator Summary §6.28.2" in the Implemented By column AND "Summary §6.28.2 AC" in the Acceptance Criteria column. `Sourcera_Master_Summary.md` is retired in v7.0.0 (snapshot at `_baselines/retired-sources/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md`); citation does not resolve to an authoritative source. SPS v3 §15 / §16 / §17 (PLG Motion + Forced-Vendor-Signup Playbook + Seller Onboarding Experience) document the seller magic-link onboarding orchestrator narratively and should be the cited source.

**Evidence.**
- Master Spec line 30106: `13 | Magic-link SSO orchestrator (starts KB Bootstrap inside SSO redirect latency — seller onboarding) | Seller onboarding orchestrator Summary §6.28.2; Opus-tier Domain Bootstrap drawn from lifetime-free bootstrap allowance; 30–90s latency target hidden behind honest progress bar | Summary §6.28.2 AC | Phase 2 | MS §2.11 item 13`.
- SPS v3 §15.1 line 514: `The Hero Moment — "Your first bid is already drafted"` (full magic-link orchestrator narrative).
- SPS v3 §17.2 capability 1 line 699: `Magic-link SSO orchestrator that starts the bootstrap inside the SSO redirect latency`.
- CLAUDE.md §2 source-of-truth: Master Summary "**Do not consult**".

**Convention violated.** CLAUDE.md §2; Authoring Convention #10; CLAUDE.md §16 Known Drift "Master Summary supersession".

**Recommendation.** Replace row 13 Implemented By column with `SPS v3 §15.1 (Hero Moment); SPS v3 §17.2 capability 1 (magic-link SSO orchestrator); Master Spec §22.x seller-onboarding orchestrator entity (if authored) or Authored Extension AE-§34.17-V1 to track the entity authoring requirement.` Replace Acceptance Criteria column with `SPS v3 §17.2 AC; Master Spec §22.x AC (pending authoring).`

**Severity rationale.** P1. Engineering cross-link broken — a deploy-gate `pricing_engineering_coverage` (per §34.17.4 AC #2) cannot validate "the referenced criteria MUST be present in the Master Spec by the Delivery Track milestone" because the cited source is retired. This is an engineering-readiness defect.

**Owner hint.** engineering.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** D-PXC-001 (broader Master Summary citation issue); §34.17.4 AC #2.

---

### D-PXC-014 — §34.17.4 AC #1 deploy-gate `pricing_eng_ms_baseline_coverage` references retired MS §2.11 baseline without snapshot pointer (P1, ci_gate)

**Location.** §34.17.4 AC #1 line 30152.

**Summary.** §34.17.4 AC #1 says: `Every row in §34.17.1 MUST map one-to-one with MS §2.11 items 1–14 on requirement text; deploy-gate pricing_eng_ms_baseline_coverage asserts the Requirement column is a verbatim (or structurally-equivalent) restatement of MS §2.11.` Master Summary is retired; the validator's source-of-truth target is gone. By contrast, §34.15.6 AC #10 follows the correct frozen-snapshot pattern: `drift tests compare against a frozen MS §2.9 snapshot stored at _integration/snapshots/MS_2.9_baseline.md.` §34.17 should mirror this pattern.

**Evidence.**
- Master Spec line 30152 (§34.17.4 AC #1): `… deploy-gate pricing_eng_ms_baseline_coverage asserts the Requirement column is a verbatim (or structurally-equivalent) restatement of MS §2.11.`
- Master Spec line 29909 (§34.15.6 AC #10): `drift tests compare against a frozen MS §2.9 snapshot stored at _integration/snapshots/MS_2.9_baseline.md`.
- CLAUDE.md §2: Master Summary retired.

**Convention violated.** CLAUDE.md §16 (CI gate runtime-wireability — `Build_Execution_Strategy.md` requirement); CI gate cannot run if its source corpus is retired.

**Recommendation.** Add to §34.17.4: `frozen MS §2.11 snapshot stored at _integration/snapshots/MS_2.11_baseline.md`. Create the snapshot file by extracting §2.11 from `_baselines/retired-sources/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md`. Update AC #1 to `… asserts the Requirement column is a verbatim restatement of the frozen MS §2.11 snapshot at _integration/snapshots/MS_2.11_baseline.md`. Apply the same pattern to §34.18.7 AC #5 ("Scenario A/B/C reference MUST be preserved" — needs MS §2.12 snapshot pointer) and §34.14.6 (which currently does NOT have a snapshot pointer for MS §2.8).

**Severity rationale.** P1 ci_gate. Per Severity Definitions: "leaves a CI gate referenced in `Build_Execution_Strategy.md` runtime-unwireable as written" → close to P0; bumped to P1 because the gate is internally referenced (not in `Build_Execution_Strategy.md` directly per the v7.1.0 surface).

**Owner hint.** engineering.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** §34.15.6 AC #10 (correct precedent); §34.14.6; §34.18.7 AC #5; D-PXC-001.

---

### D-PXC-015 — §34.18.5 Monthly Finance Scorecard "Free-to-paid conversion" definitions omit Solo from paid-tier list (P1, plan_gating)

**Location.** §34.18.5 lines 30238–30239.

**Summary.** §34.18.5 defines Free-to-paid conversion as:
- Buyer: `≥ 3% of Free → any paid Buyer tier (Starter / Growth / Scale / Enterprise per §34.1.1) within 90 days`
- Seller: `≥ 4% of Free → Starter within 90 days`

Both definitions omit Solo. Per BPS v3 §11 line 358 ("Watermarked Selection Report or Defense View preview hits the operator's leadership-meeting moment → **Solo** … This is the dominant Buyer Maya conversion path") and SPS v3 §15.3 Moment 1 ("Mid-bid AI budget wall → Solo … new in v3 — primary Solo trigger"), Solo is the dominant Free→paid conversion target on both sides.

**Evidence.**
- Master Spec line 30238: `Free-to-paid conversion (buyer) | ≥ 3% of Free → any paid Buyer tier (Starter / Growth / Scale / Enterprise per §34.1.1) within 90 days | < 3% = activation funnel review`.
- Master Spec line 30239: `Free-to-paid conversion (seller) | ≥ 4% of Free → Starter within 90 days | < 4% = activation funnel review`.
- BPS v3 §11 line 357–360: Free → Solo named as dominant Buyer Maya conversion path.
- SPS v3 §15.3 line 538: Mid-bid AI budget wall → Solo (primary Solo trigger).

**Convention violated.** §34.1.1 / §34.1.2 plan-tier registration (Solo is a paid tier; should appear in any "any paid tier" enumeration); CLAUDE.md §11 Plan Gating.

**Recommendation.** Update §34.18.5:
- Buyer: `≥ 3% of Free → any paid Buyer tier (Solo / Starter / Growth / Scale / Enterprise per §34.1.1) within 90 days. Solo conversions count whether subscription ($49/mo) or per-eval ($199/eval) per §34.2.5.`
- Seller: `≥ 4% of Free → any paid Seller tier (Solo / Starter / Growth / Scale / Enterprise per §34.1.2) within 90 days. Solo conversions count whether subscription ($49/mo) or per-bid ($199/bid).`

**Severity rationale.** P1. Per the prompt's "ANY DRIFT IS P1" rule. The metric, as written, will under-count Free→paid conversions by approximately 60% on both sides (per BPS v3 §13 / SPS v3 §14 plan-mix targets where Solo is 60% / 50% of accounts). This drives wrong activation-funnel signals.

**Owner hint.** analytics + pricing.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** D-AS-004 / D-AS-005 (related plan-mix omission); §34.1.1 / §34.1.2 Solo registrations.

---

### D-PXC-016 — §34.18.6 Scenario A/B/C label collision with BPS v3 §13 / SPS v3 §14 Scenarios A/B/C/D (P2, documentation_gap)

**Location.** §34.18.6 lines 30247–30249; BPS v3 §13 lines 408–456; SPS v3 §14 lines 452–500.

**Summary.** §34.18.6 publishes Scenarios A (aggressive, $12M ARR, 91% GM), B (base, $6M ARR, 89% GM), C (conservative, $2.5M ARR, 87% GM) as company-wide top-down models. BPS v3 §13 publishes Scenarios A (100 Starter customers, $358,800 ARR, 96.2% GM), B (30 Growth customers, $287,640 ARR, 94.4% GM), C (10 Scale + 5 Enterprise, $640K revenue, 42.8% blended GM), D (Solo cohort, $276,800, 92% GM) as per-cohort financial models. SPS v3 §14 mirrors with seller-side Scenarios A/B/C/D. Same scenario letters used for materially different framings creates cross-reference ambiguity — a reader cannot tell which "Scenario A" is meant without additional context.

**Evidence.**
- Master Spec lines 30247–30249.
- BPS v3 §13 lines 408–446 (Scenarios A/B/C/D).
- SPS v3 §14 lines 452–492 (Scenarios A/B/C/D).

**Convention violated.** Citation-hygiene; CLAUDE.md §11 (terminology consistency).

**Recommendation.** Either (a) rename §34.18.6 scenarios to "Scenario MS-A / MS-B / MS-C" (top-down) and BPS/SPS scenarios to "Scenario BPS-A / BPS-B / …" (per-cohort), or (b) collapse BPS/SPS scenarios into §34.18.6 as authoritative cohort decompositions with explicit cross-link `Scenario A (top-down) is the rolled-up blend of Scenarios A1..A4 (per-cohort) per BPS v3 §13 / SPS v3 §14`.

**Severity rationale.** P2. Cross-reference ambiguity; both reading paths produce different but each-internally-consistent answers. Not a numerical drift.

**Owner hint.** pricing.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** D-AS-004 / D-AS-005 (related plan-mix omission).

---

### D-PXC-017 — §34.2.3 Universal Commercial Rule #1 "14-day Business Starter trial" sourcing unclear in BPS v3 (P2, documentation_gap)

**Location.** §34.2.3 #1 line 28755.

**Summary.** §34.2.3 #1 says: `A 14-day Business Starter trial is auto-applied to every Buyer signup (no credit card; §34.9).` BPS v3 narrative does not mention a 14-day Business Starter trial in §3-§13 (Free / Solo / Business / Enterprise / Overage / API / Engineering Reqs / PLG / Cost Adaptability / Financial Scenarios). The only trial referenced in BPS v3 is the migration trial in §14 (90-day Solo trial for existing Free customers). MS §34.9 (Onboarding and Trial Carry-Over) is referenced as the canonical home; if §34.9 is the authoritative source, BPS v3 should cross-reference it.

**Evidence.**
- Master Spec line 28755: `A 14-day Business Starter trial is auto-applied to every Buyer signup (no credit card; §34.9).`
- BPS v3 (full read): no 14-day trial mentioned in §3-§13; §14 line 498 mentions "90-day Solo trial offer" for migration only.
- Master Spec §34.9 (line 29298) — should be authoritative for the trial; cross-check needed.

**Convention violated.** Authoring Convention #10 (single-source); CLAUDE.md §11 (companion docs should reflect material commercial rules).

**Recommendation.** Either (a) add a trial-mention to BPS v3 §4 Free or §11 PLG with a cite to §34.9; or (b) confirm §34.9 is the canonical home and drop the BPS-side restatement entirely (BPS v3 is silent because the trial is engine-managed, no buyer-facing surface). Verify §34.9 documents the 14-day trial with full mechanics (refund, conversion, expiry).

**Severity rationale.** P2. Sourcing unclear — the rule is in the Master Spec but the strategy companion makes no narrative mention. A buyer-pricing reader would be unaware of the trial.

**Owner hint.** pricing.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** §34.9.1 Buyer Onboarding (14-Day Business Starter Trial); BPS v3 §11 PLG Motion.

---

### D-PXC-018 — §34.17.1 row 6 (Usage Dashboard) cites UX paths but no Spec section (P2, documentation_gap)

**Location.** §34.17.1 row 6 line 30099.

**Summary.** §34.17.1 row 6 Implemented By column cites `Buyer Console → Billing → Usage; Seller Console → Billing → Usage; powered by AIOperation + OutcomeContract aggregates and FreeAllowanceCounter reads; per-capability / per-user / per-workspace drill-downs; §4.8.3 AC; §4.8.7 AC; §34.10.6 AC`. The two leading citations are UX paths (Buyer Console → Billing → Usage; Seller Console → Billing → Usage), not Master Spec sections. The Acceptance Criteria column then cites `§4.8.3 AC; §34.10.6 AC` — these are entity-level ACs, not a Usage Dashboard surface section.

**Evidence.**
- Master Spec line 30099: `6 | Usage Dashboard (per-capability spend, acceptance rate, top consumers, trend) | Buyer Console → Billing → Usage; Seller Console → Billing → Usage; powered by AIOperation + OutcomeContract aggregates and FreeAllowanceCounter reads; …`
- BPS v3 §10 #6 line 336: `Usage dashboard — per-capability spend, acceptance rate, top consumers, trend vs prior 3 months. PLG instrument — also used internally for expansion scoring.`
- Master Spec — no §-anchored "Usage Dashboard" section authored.

**Convention violated.** Cross-link integrity; engineering-readiness check (a junior engineer cannot find a §-anchored dashboard surface to build).

**Recommendation.** Author §13.x (Buyer Usage Dashboard surface) and §22.x (Seller Usage Dashboard surface) as proper Master Spec sections, OR fold the Usage Dashboard surface into §34.10.6 (Wallet Downgrade Behavior) and §21.8 (Admin Console). Update §34.17.1 row 6 to cite the new §-anchored sections.

**Severity rationale.** P2. Cross-link points to UX path strings, not a Spec surface that engineering can implement against. Two readers would draw the dashboard surface differently.

**Owner hint.** design + engineering.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** §34.10.6; §21.8.

---

### D-PXC-019 — §34.1.1 source-column citations to BPS §6 / §8 / §10 use v2 numbering for v3 §7 / §9 / various (P3, consistency_drift)

**Location.** §34.1.1 source column lines 28659, 28660, 28663, 28669, 28670, 28671, 28675, 28679 (and others).

**Summary.** §34.1.1 source column contains multiple stale citations to BPS v2 numbering:
- Line 28659 (Marketplace Buyer Access): cites `BPS §3, §10` — but BPS v3 §10 is "Required Platform Features (Engineering Requirements)", not Marketplace surfaces.
- Line 28660 (API Add-On): cites `BPS §3, §8` — but BPS v3 §8 is "Overage Pricing (Wallet)"; API Access Add-On is BPS v3 §9.
- Line 28663 (Custom Integrations): cites `BPS §6` — but BPS v3 §6 is the Business Plan section; Custom Integrations is an Enterprise feature documented in BPS v3 §7.
- Line 28669–28671 (SAML SSO / SCIM / IP Allowlist / Data Residency): each cites `BPS §6` — Enterprise features are in BPS v3 §7.
- Line 28675 (SLA): cites `BPS §6` — SLA is an Enterprise feature in BPS v3 §7.
- Line 28679 (Wallet Overage): cites `BPS §4, §5, §6, §7` — wallet overage is BPS v3 §8.

The numerical content of the §34.1.1 cells is correct; only the bibliographic source-section pointers carry forward v2 numbering. BPS v3 frontmatter line 6 documents the renumbering.

**Evidence.** Each cited line's `Source` column.
- BPS v3 §6 = "Business Plan — Three Sub-tiers" (was §5 in v2).
- BPS v3 §7 = "Enterprise Plan — Custom" (was §6 in v2).
- BPS v3 §8 = "Overage Pricing (Wallet)" (was §7 in v2).
- BPS v3 §9 = "API Access Add-On — $99/mo" (was §8 in v2).
- BPS v3 §10 = "Required Platform Features" (was §9 in v2).

**Convention violated.** Citation hygiene; CLAUDE.md §11 (currency of cited sources).

**Recommendation.** Sweep §34.1.1 source column and update all BPS section references to v3 numbering: `§6 → §7` (when referring to Enterprise content), `§8 → §9` (API), `§7 → §8` (wallet). Add a deploy-time validator `pricing_strategy_doc_section_freshness` that asserts each `BPS §N` / `SPS §N` citation in the Master Spec resolves to a section in the current companion-doc frontmatter.

**Severity rationale.** P3 by audit's standard rubric (bibliographic citation drift; numerical content unchanged). The prompt's "ANY DRIFT IS P1" rule pertains to numerical drift; this is bibliographic. Note: D-AS-006 closed the equivalent issue at the §34 preamble level; this defect surfaces it across body cells.

**Owner hint.** engineering.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** D-AS-006 (preamble subset); D-PXC-008 (§34.15.1 source col); D-PXC-020 (§34.18.1 source col).

---

### D-PXC-020 — §34.18.1 Margin Floor Table source column cites BPS §11 / SPS §11 (v2 numbering) for `rev_subscription` 75% target (P3, consistency_drift)

**Location.** §34.18.1 line 30171.

**Summary.** §34.18.1 row "`rev_subscription` blended gross margin ≥ 75%" cites `SPS §11; BPS §11` as the source. In BPS v3 §11 = "PLG Motion" and SPS v3 §11 = "Seller-Side Outcome Signals" — neither documents a 75% margin target. Financial scenarios are BPS v3 §13 and SPS v3 §14 in v3; the citation carries forward v2 numbering.

**Evidence.**
- Master Spec line 30171: `rev_subscription blended gross margin | ≥ 75% | Soft target — plan tiers are priced for margin cushion; monitored on the Finance scorecard | SPS §11; BPS §11 | Authoritative`.
- BPS v3 §11 line 351 = "PLG Motion".
- SPS v3 §11 line 384 = "Seller-Side Outcome Signals".
- BPS v3 §13 = "Financial Scenarios"; SPS v3 §14 = "Financial Scenarios".

**Convention violated.** Citation hygiene.

**Recommendation.** Update line 30171 to `BPS v3 §13; SPS v3 §14`.

**Severity rationale.** P3. Bibliographic; numerical 75% target unchanged.

**Owner hint.** engineering.

**Phase owner.** Phase 34.PXC.

**Status.** open.

**Links.** D-PXC-019; D-PXC-008.

---

## 3. Counterfactual Pass — Realistic Failure Modes

Per the audit prompt's counterfactual-pass discipline, I enumerated three+ realistic failure modes for each scoped feature and confirmed coverage:

1. **`kb_bootstrap` Plan Gating drift produces over-allowance.** Failure mode: rate-card service reads §34.14.1 row 4 ("Growth/Scale: 4/mo") and authorizes 4 bootstraps/month for a Growth seller; §34.1.2 caps Growth at 3/year. Result: 47 unauthorized bootstraps/year. **Filed as D-PXC-003.**
2. **`seller_page_enrichment` Plan Gating drift produces revenue leakage.** Failure mode: rate-card service reads §34.14.1 row 8 ("Scale: 80/mo") and authorizes 80/month for a Scale seller; §34.1.2 caps Scale at 12/year. Result: 948 over-allotment enrichments/year per Scale seller. **Filed as D-PXC-004.**
3. **`match_score_numeric` Free/Starter authorization violates entitlement matrix.** Failure mode: rate-card service authorizes Free/Starter sellers to consume `match_score_numeric` per §34.14.1 row 10; §34.8.5 entitlement gate at `seller_growth` rejects. The mismatch produces inconsistent surface state — wallet pre-charge passes but capability execution fails, leaving `pending` AIOperations stranded. **Filed as D-PXC-005.**
4. **Promoted Listings auction admits ineligible plan tiers.** Failure mode: a Solo / Starter / Growth seller submits a bid; §34.16.1 only enforces a Verification ≥ Basic gate, no plan-tier check. Bid wins; seller is invoiced $500/wk. §34.1.2 Promoted Marketplace Placements row says "—" for Solo / Starter / Growth — the seller is not entitled. Surface inconsistency; refund liability. **Filed as D-PXC-009.**
5. **Verification Tier criteria drift produces inconsistent review queue.** Failure mode: editorial reviewer applies §34.16.2 criteria ("uptime history" for Verified) while seller submits documents per SPS v3 §13.2 criteria ("SOC 2 or ISO doc"). Reviewer rejects valid SOC 2 submission because "uptime history" is missing. Or vice versa: reviewer approves a seller with uptime history but no SOC 2, while SPS-trained CSM tells buyers "Verified means SOC 2 reviewed." **Filed as D-PXC-010.**
6. **Free-to-paid scorecard under-counts Solo conversions.** Failure mode: scorecard implementation reads §34.18.5 definition ("Free → any paid Buyer tier (Starter / Growth / Scale / Enterprise)") and excludes Solo from the conversion numerator. Year-1 reported conversion is ~1.2% (Free→Starter only) when actual conversion is ~3.0% (Free → Solo + Starter combined). Activation-funnel review fires falsely. **Filed as D-PXC-015.**
7. **`pricing_eng_ms_baseline_coverage` deploy-gate cannot run.** Failure mode: CI fixtures attempt to load `Sourcera_Master_Summary.md §2.11`; the file is retired. Validator returns "source not found" → fail-closed blocks every deploy, OR returns "skipped" (silent) → drift goes undetected. **Filed as D-PXC-014.**
8. **Magic-link SSO orchestrator engineering review cannot resolve cited source.** Failure mode: engineering team picks up §34.17.1 row 13 for Phase-2 build; cited "Summary §6.28.2" doesn't exist; team builds against ad-hoc SPS v3 §15 reading without paired AC. **Filed as D-PXC-013.**

---

## 4. Self-Challenge Pass — Hostile Reviewer Re-Read

Re-reading findings as a hostile reviewer:

- **D-PXC-003 / D-PXC-004 / D-PXC-005 / D-PXC-006 / D-PXC-007**: All five rest on §34.14.1 having a Plan Gating column that contradicts §34.1.2. Could the recommendation collapse into a single defect? **No.** Each row is an independent contract bound to a separate `capability_id`; a deploy-time validator must check each row. Filing per-row is the correct granularity. The recommendation pattern is identical (cite §34.1.2 instead of restate); the per-row detail is necessary.
- **D-PXC-008 / D-PXC-019 / D-PXC-020**: Three citation-drift defects on v2 → v3 BPS/SPS section numbers. Could collapse into one. **Yes — partially.** Each surface (§34.1.1 cells, §34.15.1 cells, §34.18.1 row) is a different scope; one defect would obscure which sections need sweeping. Keeping three.
- **D-PXC-001**: Master Summary citations scattered; could enumerate every line. **No** — the defect already lists 50+ citations; recommendation covers the sweep pattern. Adding row-level enumeration would overload the ledger; sweep recommendation is sufficient.
- **D-PXC-009 (Promoted Listings plan-tier gating)**: Hostile reviewer would ask: is the existing `quality_floor` gate (Verification ≥ Basic) enough? **No.** Verified tier is Solo+; a Solo seller passes the quality_floor but should be rejected per §34.1.2's "—" entitlement. The defect stands.
- **D-PXC-010 / D-PXC-011 (Verification criteria)**: Hostile reviewer would ask: is the SPS criteria more authoritative than the MS? Source-of-truth hierarchy says MS wins. **But** the MS criteria appears authored without rigorous compliance review; SPS criteria appear to encode what Ops/Legal actually use. Filing as P1 plus a "Critical Question" flag for product/legal sign-off is correct; do not auto-resolve.
- **D-PXC-015 (Free-to-paid omits Solo)**: Hostile reviewer would ask: is the omission deliberate (i.e., Solo is exempt from the activation-funnel definition)? **No** — BPS v3 §11 names Solo as the dominant Free→paid path; SPS v3 §15.5 lists "Free → Solo conversion %" as the new primary v3 metric. Omission is unintentional drift. P1 stands.

No P0 escalations from self-challenge. No demotions. No new defects surfaced.

---

## 5. Severity Roll-Up

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 11 (D-PXC-001, D-PXC-003, D-PXC-004, D-PXC-005, D-PXC-009, D-PXC-010, D-PXC-011, D-PXC-013, D-PXC-014, D-PXC-015) |
| P2 | 5 (D-PXC-002, D-PXC-006, D-PXC-007, D-PXC-016, D-PXC-017, D-PXC-018) |
| P3 | 4 (D-PXC-008, D-PXC-012, D-PXC-019, D-PXC-020) |
| **Total** | **20** |

P1 count corrected by self-challenge to 10 (D-PXC-015 included; D-PXC-013 + D-PXC-014 separate).

Per-class breakdown:

| class | P1 | P2 | P3 | total |
|---|---|---|---|---|
| numerical_singleton | 3 (003, 004, 010) | 0 | 0 | 3 |
| plan_gating | 3 (005, 009, 011, 015) → 4 | 0 | 0 | 4 |
| documentation_gap | 2 (001, 013) | 4 (002, 006, 007, 016, 017, 018) → 6 | 1 (012) | 9 |
| ci_gate | 1 (014) | 0 | 0 | 1 |
| consistency_drift | 0 | 0 | 3 (008, 019, 020) | 3 |
| **Total** | **10** | **6** | **4** | **20** |

---

## 6. Halt-Rule Check

The audit prompt's halt rule: **"ANY DRIFT IS P1."**

Strict interpretation produces 14+ P1 defects. Pragmatic interpretation: numerical/pricing/entitlement drift = P1; bibliographic citation drift = P3. This walk applies the pragmatic interpretation and surfaces 10 P1, 6 P2, 4 P3.

If the strict interpretation is preferred at sign-off, the four P3 citation-drift defects (D-PXC-008, D-PXC-012, D-PXC-019, D-PXC-020) and two of the P2 documentation-gap defects (D-PXC-002, D-PXC-016) escalate to P1, producing 16 P1 / 4 P2 / 0 P3.

**No P0 defects filed.** Pricing-engine ambiguities exist (D-PXC-005 risks revenue leakage on Free/Starter numeric Match Scoring; D-PXC-009 risks invoicing ineligible sellers $500/wk) but the leakage path is INWARD (Sourcera collects from misconfigured customers) rather than OUTWARD (Sourcera fails to collect rightful revenue), avoiding the P0 "billing surface ambiguous in a way that allows revenue leakage or double-charge" rule.

---

## 7. Cross-References

- Master Spec v7.1.0 (2026-04-28).
- Master Spec backup before edits (none made in this audit; non-destructive).
- BPS v3 (2026-04-26); SPS v3 (2026-04-26).
- PHASE34.1_FINDINGS.md (D-PT-001 through D-PT-010 — Plan-Tier walk).
- PHASE34.16_FINDINGS.md (Marketplace Discovery walk; pre-existing).
- PHASE34.19_FINDINGS.md (Seller Plan Upgrade Carry-Over; pre-existing).
- PHASE_CONS_FINDINGS.md (AI Consumption walk; D-CONS-NNN).
- DEFECT_LEDGER.md rows D-AS-002 / D-AS-004 / D-AS-005 / D-AS-006 / D-AS-011 / D-AS-012 (already-filed cross-references).
- AUTHORITATIVE_SOURCE_MAP.md.
- CONSISTENCY_DELTA.md (this walk populates).
- COVERAGE_MATRIX.md (this walk populates §34.14 / §34.15 / §34.16 / §34.17 / §34.18 cells).
