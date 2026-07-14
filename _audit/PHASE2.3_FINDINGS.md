# Phase 2.3 — Findings Scratch Log (Numerical Singletons Tighter-Pass)

**Phase:** Phase 2.3 — Numerical Singletons Audit (tighter pass; Audit_Prompts.md Prompt 2.3, line 899).
**Run completed:** 2026-05-03.
**Inputs read end-to-end:** `AUTHORITATIVE_SOURCE_MAP.md` (all 22 sections, including the post-2026-04-29 RL section); `DEFECT_LEDGER.md` rows D-AS-001 … D-AS-013 (existing classifications), `D-0V-001 … D-0V-007` (Phase-0 verification residue), `D-AJ-001 … D-AJ-019` (Phase 2.1 enum sweep), `D-1V-001 … D-1V-006` (Phase 1V data-model verification residue); `Sourcera_Master_Spec.md` v7.1.0 §34.1–§34.20, §34.10, §34.3, §44.1–§44.6, §39, §40.2, §6.8, §42.1, §32.4 + §32.8 wallet endpoint contract, §48.4.7 (k-anonymity canonical), §7.5.3 (reactivity SLO sub-anchor), Appendix I (rate-limit class error codes); `Sourcera_Buyer_Pricing_Strategy.md` v3 §3 / §6 / §7 / §13; `Sourcera_Seller_Pricing_Strategy.md` v3 §3 / §6 / §9 / §14.
**Artifacts produced:** This scratch log; 5 new defect rows appended to `DEFECT_LEDGER.md` (D-2.3-001 … D-2.3-005); `AUTHORITATIVE_SOURCE_MAP.md` Sections E (manual top-up bounds + rate-limit), Q (k-anon auth_section correction), and X (Defects Filed roll-up) updated.

---

## 1. Step 1 — Existing-Defect Classification Confirmation

Per Audit_Prompts.md Prompt 2.3 ("Walk AUTHORITATIVE_SOURCE_MAP.md and confirm every drift defect has been classified"), every D-AS-* drift row in the existing ledger was re-read against the Severity Definitions block of `DEFECT_LEDGER.md` (first-matching-rule discipline) and the Section X roll-up of `AUTHORITATIVE_SOURCE_MAP.md`.

| defect_id | filed severity | rule applied | re-verification verdict |
|---|---|---|---|
| D-AS-001 | P1 numerical_singleton | "conflicting numerical singleton between Master Spec and a companion strategy doc" → P1 by rule | **CONFIRMED.** §48.8.6 inline literal `$49 / month` disagrees with §34.2.2 cell `Seller Starter $149 (annual) / $179 (monthly)`. Junior engineer building the Conversion Moment modal would render the wrong price on the seller-acquisition path. P1 is correct. |
| D-AS-002 | P1 numerical_singleton | Authoring Convention #10 violation; §34.2.4 single-source rule | **CONFIRMED.** BPS v3 §7 + SPS v3 §9 inline restate the four bands (10/15/20/25% at 25K/50K/100K/250K) instead of citing §34.2.4. Companion-doc / Master-Spec drift triggers P1 per the severity rule. |
| D-AS-003 | P3 consistency_drift | citation hygiene; values match | **CONFIRMED.** Two §34.3.3 self-citations (line 27449 vs 27471) disagree on which BPS sub-section is canonical for the 88% margin floor. Values agree; the conflict is a citation-pointer drift only. P3 by rule. |
| D-AS-004 | P1 numerical_singleton | Master-Spec / companion-doc plan-mix structural inconsistency | **CONFIRMED.** §34.18.3 omits Solo entirely from the Year-1 mix; BPS v3 §13 publishes a Solo-inclusive mix on a non-comparable axis. Two readers cannot reconcile. P1 by rule. |
| D-AS-005 | P1 numerical_singleton | Same as D-AS-004 (seller side) | **CONFIRMED.** |
| D-AS-006 | P3 consistency_drift | citation freshness | **CONFIRMED.** §34 preamble cites BPS v2 / SPS v2; current pricing docs are v3. Values resolve correctly through v3 numbering — the drift is the version label only. P3 by rule. |
| D-AS-007 | P2 consistency_drift | banner-mitigated stale Stripe model | **CONFIRMED.** Appendix H emits v6.0.0 SKUs with a STALE banner above. Banner mitigates but doesn't strike through inline. Two readers may pick different per-row dispositions. P2 by rule. |
| D-AS-008 | P3 consistency_drift | §39 row-label ambiguity | **CONFIRMED.** §39 row "Certified re-review cadence | 90 days" conflates a near-expiry warning lead-time with the annual recertification cadence (§34.16.2). P3 by rule. |
| D-AS-009 | P3 numerical_singleton | missing §39 row | **CONFIRMED.** P3 by rule because the 200-char title cap is cited inline at §22 line 14782; resolution is unambiguous. |
| D-AS-010 | P3 numerical_singleton | missing §39 row | **CONFIRMED.** Same logic as D-AS-009. |
| D-AS-011 | P2 consistency_drift | non-comparable cost-base infra-overhead figures | **CONFIRMED.** §34.14.1 uses 5%; BPS v3 §13 / SPS v3 §14 use 3%. P2 by rule because reasonable readers might pick different figures for scenario modeling. |
| D-AS-012 | P1 plan_gating | inline copy promises feature absent from entitlement matrix | **CONFIRMED.** §48.8.6 promises "Starter Match Score numeric display"; §34.1.2 / §34.8.5 gate numeric scoring to Growth+. Junior engineer would build conflicting feature-gating. P1 by rule. |
| D-AS-013 | P3 consistency_drift | citation to a rule absent from the cited section | **CONFIRMED.** §48.8.6 cites "Seller Pricing §3" for the 10-month annual rule; SPS v3 §3 publishes prices but doesn't author the rule. P3 by rule. |

**Verdict.** All 13 D-AS-* drift defects are correctly classified per the severity rules. No re-classifications required.

---

## 2. Step 2 — Tighter Pass: Eight Singleton Categories

### 2.1 Plan-tier dollar figures (§34.1)

Re-read every cell in §34.1.1 (Buyer plans) and §34.1.2 (Seller plans) against BPS v3 §3 / §5.1 / §6.1 / §6.2 / §6.3 / §7 and SPS v3 §3 / §5.1 / §6 / §7 / §8 / §9. Every plan-tier subscription price (Free $0, Solo $49 annual / $59 monthly, Starter / Growth / Scale / Enterprise) matches row-for-row. The single Master-Spec / companion drift was D-AS-001 (already filed).

**No additional drifts surfaced beyond D-AS-001.**

### 2.2 Object-size limits (§39)

Walked §39 rows top-to-bottom and grepped §4 entity field tables, §32 endpoint contracts, §31 webhook payload size discipline, §22 KB entry sizes, and §28 Markdown editor limits. Existing missing-row defects (D-AS-009 KB title; D-AS-010 GhostBidImport pair count) cover the residue. The 256 KB webhook payload ceiling at §31 is consistently cited from §31 across every webhook block.

**No additional drifts surfaced beyond D-AS-009 / D-AS-010.**

### 2.3 Performance budgets (§44)

Grepped p50 / p95 / p99 references throughout §13 (scoring), §17 (analytics), §22 (KB MCP retrieval), §27 (search), §50 (ops console), §51 (instrumentation). Every reference resolves to §44.1 / §44.2 / §44.4 OR §44.6 (Solo) per the source-map enrolled rows.

**One new drift surfaced.** §7.5.3 ("Reactivity SLO" sub-anchor at line 9910–9914) explicitly states that "the authoritative latency target lives in §44.1 — this subsection is the §7.5 sub-anchor for cross-references" (line 9912) and declares "p95 ≤ 500 ms / p99 ≤ 1 s of the commit timestamp" (line 9914). §44.1's row table at line 30945–30966 enumerates "Real-time Subscription Latency (collaborative scoring) | < 200ms" (line 30953) but does NOT carry the general Convex reactive query commit-to-render row that §7.5.3 declares. Body sections at lines 3289 / 3361 / 3424 / 9908 / 10075 / 10181 / 30318 / 46207 / 46482 / 46508 cite "§44.1 reactivity SLO p95 ≤ 500 ms" — citing a row that does not exist in §44.1. The < 200ms row covers a tighter, narrower scope (collaborative scoring active edit deltas); it is not the same singleton as the general reactive SLO. This is **D-2.3-002** below.

### 2.4 Retention TTLs (§40.2)

Walked §40.2 row table (lines 30512–30551); cross-checked against §4 entity Retention blocks, §6.8 DSAR cascade, §40 export/import, §41 email retention, §42 DR backups. Values resolve consistently.

**One documentation drift surfaced.** Four §4 entity blocks carry stale "New §40.2 row required (see below)" / "update retention row below" TODO markers — but §40.2 already contains the corresponding rows. Lines 4022 (Unread Marker), 4153 (Pro Trial Seat Grant), 4216 (Usage Event), 4260 (Time-Saved Credit) are stale TODO markers; §40.2 lines 30523 / 30526–30527 / 30528–30530 / 30531–30533 author the rows. This is **D-2.3-005** below.

### 2.5 Rate-limit classes (§32 + Appendix I)

Source map's RL section (added 2026-04-29) enumerates 67+ classes across RL.1–RL.5. Walked every class's auth_section against §32.4 / §22.8.4 / §27 / §29 / §31 / §50 / §51. Values resolve; D-0V-001 (rate-limit-class enrollment gap) closed in source map.

**One source-map gap surfaced.** §32.8 wallet manual top-up endpoint declares two singletons not enrolled in the source map's RL or Section E (AIWallet) blocks: (a) manual top-up amount lower bound `$10` (Master Spec line 26692, error code `topup_amount_out_of_range`); (b) per-Org rate limit `>3 top-ups / hour` (Master Spec line 26697, error code `topup_rate_limit_exceeded`). These are independent of the auto-topup `$50–$10,000` increment bounds (Section E rows WALLET-TOPUP-MIN / WALLET-TOPUP-MAX). This is **D-2.3-004** below.

### 2.6 k-anonymity floors (§27 / §22.8 / §51 / §17 / §48)

Re-read §48.4.7 ("k-Anonymity Floors" canonical three-tier table at line 32318–32326) and walked every k=5 / k=10 / k=20 reference across §3.5 (UX), §4.4.10 (CategoryPage), §4.4.15 (MarketIntelligenceReport), §4.4.16 (HeatMapCell), §4.4.18 (SellerSignal), §4.4.19 (PromotedListing), §17.x (Time-Saved analytics fairness), §22.8 (KB MCP), §27.9.5 (SellerSignal aggregation), §27.11.2 (auction k=5 surface), §51.x (instrumentation), §48.3 / §48.4 (growth signals). All references resolve consistently to the canonical three-tier mapping (k=5 signal / k=10 aggregate / k=20 market intelligence).

**One source-map staleness surfaced.** Source map row `RET-K-ANON-SIGNAL` (Section Q line 366) declares `auth_section = §3.5 / §34.16 / §3.5` and notes "§3.5 / Summary anti-spam framework". In v7.1.0 the canonical authoritative home is §48.4.7 ("k-Anonymity Floors", line 32318), explicitly authoring the three-tier floor structure. The "§3.5" anchor refers to retired Summary §3.5 (the Summary was retired in v7.0.0; snapshot at `_versions/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md`); §34.16 is downstream of §48.4.7 (per-listing surface enforcement, not the canonical declaration). This is **D-2.3-003** below.

### 2.7 cost-base / value-price multipliers (§34.3)

`cost_base × 10` (accepted) and `cost_base × 1.05` (rejected) are referenced consistently across §34.3.1 (canonical formula authoring), §34.14.1 / §34.14.2 (derivation + invariants), §34.20.2 AC #6 (deploy-time validator), §4.8.1 (entity field defaults), §4.8.2 (registry floors), §22 (KB session settlement prose), §34.10 (wallet posting), §34.11 (outcome resolver), §48.8 (activation accounting), §49 (Solo activation). Every restatement matches the canonical and is sanctioned per the dual-home pattern (entity field defaults + canonical formula).

**No additional drifts surfaced.**

### 2.8 AIWallet thresholds (§34.10)

`cap_warning_50 / cap_warning_80 / cap_warning_100` notification thresholds (50% / 80% / 100% of pool) and auto-topup increment bounds ($50–$10,000 single charge; $50–$500,000 monthly absolute ceiling) resolve consistently across §34.10.1 / §34.10.2 / §34.10.4, §4.8.3 schema, §4.8.3 AC #6, §31.8.3 (`billing.wallet.cap_warning_80` / `cap_warning_100` webhooks), §32.8 wallet config endpoints, Appendix I error codes. Every value matches.

**No additional drifts surfaced beyond manual-topup gap (D-2.3-004 above).**

---

## 3. Step 3 — Master-Spec Internal Drifts (Adversarial Pass)

The audit prompt asks for "every drift" P1 minimum. A hostile adversarial pass on the Master Spec for **internal-to-the-spec** numerical-singleton drifts surfaced one P1 drift the original Phase-1 sweep did not flag.

### 3.1 Volume-discount band Master-Spec internal inline restatements

Phase 12.5 R-06 closure moved the canonical home of the Enterprise Volume Discount Bands from §34.2.3 #6 prose to §34.2.4 (single-source rule). The validator `volume_discount_band_single_source` (§34.2.4 AC #1) was authored to assert no other inline restatement within the Master Spec. The validator does not catch three Master-Spec-internal inline restatements that survived the closure:

| line | section | inline literal |
|---|---|---|
| 8425 | §4.8.8 CommittedSpendContract → Authoring Intent | "10% discount at $25K commit, 15% at $50K, 20% at $100K, 25% at $250K+" |
| 27723 | §34.2.3 #6 prose | "Volume discount bands on overage: 10% at $25K commit, 15% at $50K, 20% at $100K, 25% at $250K+" |
| 45834 | Appendix K Glossary → CommittedSpendContract | "Discount bands derived from `commit_value_dollars`: 10% at $25K, 15% at $50K, 20% at $100K, 25% at $250K+" |

None of these locations cites §34.2.4. By parity with D-AS-002 (companion-doc inline restatements filed P1 numerical_singleton), these Master-Spec-internal inline restatements violate the same Authoring Convention #10 rule and should be filed P1.

The validator `volume_discount_band_single_source` is therefore unimplementable as written: a CI sweep of the Master Spec for the band-literal regex would catch all three locations and fail. The validator was authored as if §34.2.4 were the only band-author location; the three legacy inline restatements predate the closure and were not back-rewritten.

This is **D-2.3-001** below.

---

## 4. Step 4 — Self-Challenge Pass (Hostile-Reviewer Re-Read)

Per Audit_Prompts.md OPUS guidance, every newly-filed defect re-read as a hostile reviewer:

### 4.1 Reproducibility — every literal grep-able?

| defect | evidence line(s) | reproducible? |
|---|---|---|
| D-2.3-001 | Master Spec lines 8425, 27723, 45834 | YES — three explicit grep hits |
| D-2.3-002 | Master Spec lines 9912, 9914 (§7.5.3); 30945–30966 (§44.1 table) | YES — sub-anchor explicitly attributes authority to §44.1; §44.1 row table is exhaustive and lacks the row |
| D-2.3-003 | AUTHORITATIVE_SOURCE_MAP.md Section Q line 366 vs Master Spec line 32318 | YES |
| D-2.3-004 | Master Spec line 26692 ($10 lower bound); line 26697 (>3/hour rate-limit) | YES |
| D-2.3-005 | Master Spec lines 4022, 4153, 4216, 4260 (TODO markers) vs §40.2 lines 30523, 30526–30527, 30528–30530, 30531–30533 (rows present) | YES |

### 4.2 Severity rule-based?

D-2.3-001 P1 — applies the same rule as D-AS-002 (Authoring Convention #10 inline-restatement violation; Master-Spec internal version of the same defect class). Severity by parity.

D-2.3-002 P1 — §7.5.3 sub-anchor explicitly attributes a numeric SLO to §44.1; §44.1 does not carry the row; ten body sections cite "§44.1 reactivity SLO p95 ≤ 500 ms" against an absent row. Junior engineer building presence/unread/reactive surfaces would not know which target to hit (200ms collaborative-scoring or 500ms general reactive). P1 by the "missing... numerical singleton" rule.

D-2.3-003 P3 — source-map staleness; not a Master-Spec drift. The Master Spec's k-anonymity values are consistent. P3 by rule.

D-2.3-004 P3 — source-map gap; the Master-Spec values are unambiguous and authored at §32.8. P3 by rule (downstream auditors walking the source map only would not see the manual-topup singletons).

D-2.3-005 P3 — citation-hygiene staleness; no value drift. P3 by rule.

### 4.3 Could the recommendation be sharper?

D-2.3-001: Recommended fix is to replace the three literals with `(per §34.2.4)` cite-only references AND extend the `volume_discount_band_single_source` validator to scan for the band-literal regex across the entire Master Spec, not just §34.2.4 surroundings. This is the same shape as D-AS-002's recommendation but Master-Spec-scoped.

D-2.3-002: Recommended fix is to add a row to §44.1 — `| Convex Reactive Query Commit-to-Render Latency (general) | p95 ≤ 500 ms / p99 ≤ 1 s |` — distinct from the existing collaborative-scoring row. Update §7.5.3 to cite the new row by anchor rather than restating the SLO inline.

D-2.3-003: Recommended fix is to update Section Q row `RET-K-ANON-SIGNAL` `auth_section` from `§3.5 / §34.16 / §3.5` to `§48.4.7` and cite §27.9.5 / §27.11.2 / §3.5 (UX framing) as downstream / cross-cutting references.

D-2.3-004: Recommended fix is to add three rows to source map Section E (AI Wallet — Configuration Singletons) covering `WALLET-MANUAL-TOPUP-MIN`, `WALLET-MANUAL-TOPUP-MAX`, `WALLET-MANUAL-TOPUP-RATE-LIMIT`.

D-2.3-005: Recommended fix is to replace the four TODO markers with cite-only references (e.g., line 4153 → "Retained for Org-life + 7 years per §40.2 (Pro Trial Seat Grant — financial and outcome fields row)") and add a `master_spec_no_todo_markers` deploy-time validator to catch any future "New §40.2 row required" or similar TODO strings.

### 4.4 Counterfactual pass — three failure modes per defect addressed?

**D-2.3-001:**
1. **Validator passes despite drift** — addressed by recommending validator extension to scan entire Master Spec.
2. **Author updates §34.2.4 bands without back-rewriting downstream** — addressed by recommending the validator extension catches future drift.
3. **Companion-doc and Master-Spec-internal drifts diverge** — already covered by D-AS-002 + D-2.3-001 in tandem.

**D-2.3-002:**
1. **Engineer builds presence at 200ms target** — current body sections cite p95 ≤ 500 ms; engineer might over-engineer to the tighter target. Addressed by clarifying the two SLO rows have distinct scopes.
2. **Engineer builds collaborative scoring at 500ms target** — current §44.1 row says < 200ms. Addressed by preserving the < 200ms row in §44.1 alongside the new general-reactive row.
3. **§7.5.3 sub-anchor pointer becomes stale if §44.1 reorganized** — addressed by recommending §7.5.3 cite the new row by anchor (not by section number alone).

**D-2.3-003:**
1. **Auditor walks source map and follows §3.5 pointer to retired Summary** — addressed by recommending auth_section update.
2. **§48.4.7 reorganized** — single-source amendments to §48.4.7 cascade through every k-anon use site (already canonical).
3. **k=5 / k=10 / k=20 boundaries change** — would require an Authored Extension; § 48.4.7 is the auth registration point.

**D-2.3-004:**
1. **Engineer reads source map only and misses manual-topup bounds** — addressed by enrollment.
2. **Manual-topup endpoint changes its bounds** — endpoint is at §32.8 line 26692; source-map row points there.
3. **Rate-limit class registered but not in RL section of source map** — addressed by enrolling the class.

**D-2.3-005:**
1. **Future maintainer reads stale TODO and re-authors a duplicate row in §40.2** — addressed by recommending TODO replacement.
2. **CI gate to catch future TODO drift** — recommended `master_spec_no_todo_markers` validator.
3. **Audit reader treats TODO marker as a P1 missing-retention defect** — already mitigated by this defect filing (pointer to existing §40.2 rows).

---

## 5. Severity Summary

| defect | class | severity | status |
|---|---|---|---|
| D-2.3-001 | numerical_singleton | P1 | open |
| D-2.3-002 | numerical_singleton | P1 | open |
| D-2.3-003 | documentation_gap | P3 | open |
| D-2.3-004 | documentation_gap | P3 | open |
| D-2.3-005 | documentation_gap | P3 | open |

**Total:** 5 defects (2 P1 + 3 P3). Combined Phase-1 + Phase-2.3 numerical-singleton ledger total: 18 D-AS-* / D-2.3-* drift defects.

---

## 6. Next Pass Recommendation

The tighter pass closed every audit category in the prompt. Out-of-scope for this prompt but worth Phase-2.4 attention:

- **§32.8 manual top-up endpoint contract review** — verify the $10 lower bound is intentional vs. a copy-paste artifact from a prior $10-minimum design; reconcile with the auto-topup $50 lower bound floor.
- **§7.5.3 cite-by-anchor enforcement** — extend the anchor-citation discipline (every §44.1-cited body section uses the anchor `#44.1-reactive-query-latency` or similar) once the new row lands.
- **`volume_discount_band_single_source` validator implementation status** — confirm whether the validator currently runs and what its hit/miss profile is on D-2.3-001's three line locations.
