# Phase 2.4 — Findings Scratch Log (Plan-Tier Reference Audit)

**Phase:** Phase 2.4 — Plan-Tier Reference Audit (`Audit_Prompts.md` Prompt 2.4, lines 937–965).
**Run completed:** 2026-05-03.
**Scope per prompt:** Confirm every plan-gated feature is reflected consistently in §5.11 Feature Access Matrix, §34.1 Plan Tier Definitions, and §39 Object Size Constraints. Procedure steps walked: (1) FEATURE_INVENTORY user_capability + platform_mechanic features traversed; (2) plan-gated features cross-walked across §5.11/§34.1/§39; (3) Solo-tier presence per §34.1.1 / §34.1.2 / §34.1.3 / §34.2.1 / §34.2.2 / §34.2.5 / §34.10.3 / §34.12.6 verified; (4) Defense View §5.11 vs §13.11 reconciled; (5) Buyer Maya §5.11 vs §13.12 / §22.20 reconciled; (6) KB capacity gating §22 vs §39 vs §34 reconciled.

**Inputs read end-to-end:**
- `Sourcera_Master_Spec.md` v7.1.0 §5.11 (lines 9171–9287); §6.2.1 / §6.6.2 / §6.7.3 (plan-tier-cited subsections); §13.11 Defense View end-to-end (lines 12365–12674); §13.12 Buyer Maya end-to-end (lines 12674–12824); §22.1 (lines 15022–15045); §22.20 Seller Maya Surface Abstraction end-to-end (lines 18177–18415); §27.9.8 Direct Invite from Cohort (lines 22680–22789); §34.1.1 / §34.1.2 / §34.1.3 (lines 27598–27692); §34.2.1 / §34.2.2 / §34.2.5 (lines 27692–27810); §34.10.3 Pooled Budget (lines 28332–28365); §34.12.1 / §34.12.5 / §34.12.6 (lines 28485–28588); §34.13 Pro Trial Seat (sampled lines 28200–28250 + §34.5/§34.6 cross-refs); §39 Object Size Constraints end-to-end (lines 30322–30491); §44.6 Solo-Tier Surface Treatment (lines 30950–30966 sampled).
- `_audit/FEATURE_INVENTORY.md` — 312 user_capability + platform_mechanic rows traversed.
- `_audit/DEFECT_LEDGER.md` rows D-AS-001..013, D-2.2-007..023..033..037, D-2.3-001..005, D-1.5-013/014 (existing plan-gating-adjacent classifications).
- `_audit/COVERAGE_MATRIX.md` rows F-262 / F-264 / F-371 / F-381 / F-457 / F-545 (sampled).

**Artifacts produced:** This scratch log; 6 new defect rows promoted to `DEFECT_LEDGER.md` (D-2.4-001..D-2.4-006); 5 cell tightenings on COVERAGE_MATRIX.md `plan_gating` column; one Phase 2.4 Update section appended to COVERAGE_MATRIX.md run-summary.

---

## 1. Procedure Step 1 — Feature Inventory Walk (user_capability ∪ platform_mechanic)

The `feature_class ∈ {user_capability, platform_mechanic}` partition of `FEATURE_INVENTORY.md` is 312 rows. Per the prompt, the plan-gating cross-walk targets only those rows that are actually plan-gated. The non-plan-gated rows in scope (universal capabilities such as F-031 Sidebar Nav, F-302 Templates universally available, F-029 Sourcera Constraint, F-573 Browser Support Matrix, etc.) trip the `n/a` cell value on the plan_gating column and are not findings.

The plan-gated subset (~70 rows) was filtered by the inline tier-list strings in §34.1.1 / §34.1.2, the §5.11 row labels carrying tier-list annotations, and the §13.11.4 / §13.12.3 / §22.20 / §27.9.8 / §34.13 / §6.2.1 / §6.6.2 / §6.7.3 / §27.4 plan-gating prose. The 6 P1 / P3 defects below are surfaced from the systematic walk; the remaining ~64 plan-gated rows resolve cleanly across all three sections.

---

## 2. Procedure Step 2 — Cross-Walk Findings

### 2.1 Defense View — §5.11 row missing → D-2.4-001 (P1 plan_gating)

§13.11.11 (line 12602): "**Plan gate.** Authoritative entry registered in §5.11 Feature Access Matrix as row `defense_view` with the gate semantics defined in §13.11.4 (Free: watermarked preview only; Solo+: full surface; Enterprise: full surface plus PDF audit-receipt footer)."

End-to-end read of §5.11 (lines 9171–9287) confirms **no row labeled `defense_view`, "Defense View", "Open Defense View", or any equivalent** exists in any row group (Workspace Management; Vendor Curation & Disqualification; Use Case Management; Requirement Management; Scoring; Response Management; Comments & Collaboration; Team & Member Management; Reporting & Analytics; Billing & AI Accounting; Seller Signals — Seller Console; Buyer Signal Opt-In — Buyer Console; CRM Sync — Seller Console). The Reporting & Analytics row group (lines 9219–9223) covers "View Selection Report", "View Efficiency Metrics", "Export evaluation", "View audit log" — and stops there. The matrix is verifiably silent on Defense View.

A junior engineer building the entitlement enforcement against §5.11 cannot determine the role-based access for Defense View (Workspace Owner / Workspace Admin / Use Case Lead / Reviewer / Guest variants) and cannot enforce the §13.11.4 plan-tier visibility variant against the §5.11 RBAC matrix. The §13.11.11 cross-reference is broken on its target.

**Severity: P1 plan_gating** per the rule "missing plan-gating row in §5.11/§34.1/§39".

### 2.2 §39 missing structural plan-quantity mirror rows → D-2.4-002 (P1 plan_gating)

§34.1.3 Plan-Tier Cross-References (line 27688) declares: "**Object size constraints** (max workspaces, max requirements, max KB entries, max storage, max API tokens, max webhook endpoints) for each plan are mirrored into §39 Object Size Constraints with `Source: §34.1.1` / `Source: §34.1.2` annotations. §39 NEVER restates a number; it cites the §34.1 cell."

§39 preamble (line 30326) reinforces: "rows below that cite a §34.1 cell are automatically Solo-aware via the column lookup."

End-to-end read of §39 (lines 30322–30491) confirms **exactly one** row mirrors a §34.1 plan-quantity cell — line 30363:
> | Internal Comment Thread | active threads per Workspace (plan-gated) | Per §34.1.1 cell **Internal Comment Threads per Workspace** (Free / Buyer Solo / Starter / Growth / Scale / Enterprise) | Source: §34.1.1 cell **Internal Comment Threads per Workspace** (authoritative; never restated in §39). … Buyer Solo cap (25, mirrors Free) is set at §34.1.1 — Phase 14.9. |

The promised §39 plan-quantity mirror rows for the following §34.1.1 / §34.1.2 cells are missing:

| §34.1 cell | §39 row missing? | Plan-gated quantity at risk |
|---|---|---|
| Active Evaluations (concurrent) — Buyer | Missing | 1 / 1 / 5 / 20 / Unlimited / Unlimited |
| Vendors tracked — Buyer | Missing | 25 / Unlimited within 1 active / 250 / 2,500 / Unlimited / Unlimited |
| Use Cases per Workspace — Buyer | Missing | 3 / 3 / 50 / Unlimited / Unlimited / Unlimited |
| Requirements per Workspace — Buyer | Missing | 200 / 200 / 2,000 / 10,000 / Unlimited / Unlimited |
| API Keys — Buyer | Missing | 1 / 1 / 5 / 25 / 50 / 100 |
| Webhook Endpoints — Buyer | Missing | 1 / 1 / 5 / 25 / 50 / 100 |
| KB Entries — Buyer | Missing | 50 / 50 / 1,000 / 10,000 / Unlimited / Unlimited |
| KB Document Library — Buyer | Missing | 50 docs / 50 / 500 / 5,000 / Unlimited / Unlimited |
| Storage — Buyer | Missing | 1 GB / 5 GB / 25 GB / 250 GB / 2 TB / Custom |
| Vendor Pro Trial Seats (Buyer monthly allowance) | Missing | — / — / — / — / 5/mo / 15/mo |
| Bid Workspace Access (concurrent invited) — Seller | Missing | 1 / 1 / 3 / 15 / Unlimited / Unlimited |
| Invited Bids (concurrent) — Seller | Missing | 1 / 1 / 3 / 15 / Unlimited / Unlimited |
| Proactive Marketplace EOIs — Seller | Missing | 0 / 0 / 10/mo / Unlimited / Unlimited / Unlimited |
| KB Entries — Seller | Missing | 50 / 250 / 1,000 / 10,000 / Unlimited / Unlimited |
| Firecrawl Sources — Seller | Missing | 0 / 1 weekly / 2 weekly / 10 daily / Unlimited / Unlimited |
| KB Bootstrap (Opus) — Seller | Missing | 1 lifetime / 1 lifetime + 1/yr / 1/yr / 3/yr / Unlimited / Unlimited |
| SellerSoftware Entities — Seller | Missing | 1 / 1 / 5 / 25 / Unlimited / Unlimited |
| Capability Declarations — Seller | Missing | 3 / 3 / 25 / 250 / Unlimited / Unlimited |
| Seller Page Enrichment (Opus) — Seller | Missing | — / — / 1/yr / 3/yr / 12/yr / Unlimited |
| Promoted Marketplace Placements — Seller | Missing | — / — / — / — / 1/mo / 3/mo |

That is **20 missing structural mirror rows** against the explicit §34.1.3 promise. The single delivered row (Internal Comment Thread) confirms the authoring pattern is feasible and was attempted; the rest were not landed.

Downstream consequences:
- **§22.1 KB plan-gating cross-reference is broken.** §22.1 line 15043 says: "KB plan gating and quantitative limits — see §5.11 Feature Access Matrix, §34.1 Plan Tier Definitions, §39 Object Size Constraints." §39 has no per-tier KB Entries / KB Document Library / KB Bootstrap / Firecrawl Source / Capability Declaration row. §5.11 has no quantity-based KB row (matrix is role-keyed). Only §34.1 carries the gates — the §22.1 three-section cross-reference is two-thirds broken.
- **§39 inability to absorb downgrade enforcement.** §4.8.10 DowngradeExcessDataBucket and §34.5.3 / §34.6 downgrade-safe rules cite §39-style ceilings as the baseline for "excess" computation. Without §39 mirror rows, the engineering owner of `DowngradeExcessDataBucket` must read §34.1 cells directly — which is fine — but the audit-of-truth seam is broken: a §34.1 ceiling change must trigger a §39 update by hand because there is no §39 row to keep in sync. The integrity is enforced only by `solo_tier_numeric_single_source` (§34.1.3 / §44.6) which is grep-against-Master-Spec and does NOT validate §39 row presence.
- **Phase 14.9 closure is incomplete.** The §39 preamble explicitly stamps Phase 14.9 as the program that landed the §39 plan-tier coverage; the closure is falsified by the missing rows. The 27-location `solo_role_grid_inclusion` validator (Phase 14.9.1) backlog enumerated in §5.11 line 9275 will surface this once it lands; pre-landing, the gap is silent.

**Severity: P1 plan_gating** per "missing plan-gating row in §5.11/§34.1/§39". Tier-of-impact escalates: a junior engineer looking up the KB-Entries cap for Buyer Growth in §39 would find nothing and either build to the wrong default OR refer to §34.1 (correct). Two readers can disagree on what §39 is missing because the absence is not flagged.

### 2.3 §22.20 Seller Maya plan-tier scope excludes `seller_solo` → D-2.4-003 (P1 plan_gating)

§22.20 "Plan-tier scope" preamble (line 18183): "§22.20 binds the **Solo / Free seller surface** (`plan_tier = seller_free` per §34.1.2; per `Seller_Pricing_Strategy.md` §3 Solo / Free is the entry tier). … Paid seller tiers (sSt, sGr, sSc, sEnt) retain the existing surface set per §22.18.4.1, §27.4, §22.5, and §48.8 unchanged…"

Phase 14.9 (§34.1.2 lines 27650–27684; §34.1.3 cross-reference) registered `seller_solo` as a discrete billable plan tier alongside `seller_free`. The §22.20 prose conflates them under a single `plan_tier = seller_free` enum value, but the Acceptance Criteria #79–#98 (lines 18374–18393) and the linked CI gate `seller_maya_surface_abstraction_engine_unchanged` (Phase 14.18) all enforce ONLY against `plan_tier = seller_free`:

- AC #79: "Every Capability Declaration emitted by `kb_to_capability_suggestion` (§22.10.5) on a `plan_tier = seller_free` Org MUST transition `(none) → published` directly via `pending_review_reason = 'solo_free_auto_publish'`…"
- AC #86: "Every `plan_tier = seller_free` Org … MUST receive exactly one weekly KB governance notification per ISO calendar week…"
- AC #95: "A UX fixture test asserts that no AIWallet balance counter … render on the §48.8.3 / §48.8.4 / §48.8.5 Hero Moment surfaces for a `plan_tier = seller_free` Org."

§34.1.3 disambiguates the inclusive-of-Solo rule: "the §5.11 inline tier-list strings… are interpreted as **inclusive of Solo** wherever Solo's §34.1 cell value is non-`—`." §34.1.2 Seller Solo cells are non-`—` for every row §22.20 compresses (Match Score: "Labels only"; Wallet Overage: "—"; Free Allowance: "10 ops"; Capability Declarations: "3"; KB Entries: "250"; KB Bootstrap: "1 lifetime + 1/year re-bootstrap"). Per the rule, §22.20 SHOULD apply to `plan_tier ∈ {seller_free, seller_solo}` — which it does in narrative ("Solo / Free seller surface") but does NOT in the AC enum value (`plan_tier = seller_free` only).

Net consequence: the CI gates that enforce the §22.20 compression contract WOULD NOT fire on a `plan_tier = seller_solo` Org. A Seller Solo seller could (a) receive per-entry staleness badges suppressed only on Free (AC #87), (b) see the AIWallet counter on Hero Moment surfaces (AC #95), (c) see the four-label Match Score render instead of three labels (AC #91). The Seller Maya canonical destination tier is Solo (per §34.1.2 narrative — "personal-card on-ramp"); the canonical destination is silently excluded from the canonical compression contract.

§22.20.1 Persona Anchor (line 18197) reinforces the conflation: "the surface for `plan_tier = seller_free` is the Maya surface by construction" — but Phase 14.9 split Maya's destination into a NEW `seller_solo` tier that the persona-anchor sentence misses.

**Severity: P1 plan_gating** per "missing plan-gating row in §5.11/§34.1/§39 … or surface introduced without an Appendix-M row". A junior engineer reading §22.20 alone would build the compression contract gated on `seller_free` only and ship Solo with the paid-tier Match Score / AIWallet / per-entry surfaces.

### 2.4 §27.9.8 Direct Invite from Cohort missing standalone §34.1.2 row → D-2.4-004 (P1 plan_gating)

§5.11 carries the row (line 9249): "Send Direct Invite From Cohort (Seller Scale+ only per §27.9.8; plan-gating enforced at operation time)".

§27.9.8 Plan gate (line 22703): "Offer creation is blocked for Seller Orgs below Seller Scale per §34.1.2 ('Real-time + API' is Enterprise-only; Seller Scale includes 'Weekly + real-time' — Direct Invite From Cohort is real-time-class and requires Seller Scale minimum)."

§34.1.2 (lines 27654–27684) carries no row labeled "Direct Invite from Cohort", "Direct Invite", or "Proactive Direct Invite". The closest row is "Seller Signals" (line 27671) with values "— / — / Monthly category digest / Weekly digest / Weekly + real-time / Real-time + API". The Direct Invite gate is implicit in the "real-time-class" qualifier on the Seller Scale "Weekly + real-time" cell — derivable only by reading §27.9.8 prose alongside §34.1.2. The §34.1.2 row alone does not enable a junior engineer to build the entitlement gate without the §27.9.8 cross-reference.

§39 has no row (Direct Invite is rate-limited per §27.9.8 / §32 — 10 offers/24h per Seller Org; 100 target Workspaces/30d per Seller Org — but those are §32.4 rate-limit-class, not §39 object-size). Per §27.9.8 line 22748 the rate limits are correctly registered against §32; §39 does not need a row.

The plan-gating gap is solely in §34.1.2 — Direct Invite is a discrete user-capability with its own AC block (§27.9.8.10–§27.9.8.13), its own webhook events (§27.9.8 line 22717–22719), its own API endpoint (line 22748), and its own §5.11 row. Per Authoring Convention #8 / CLAUDE.md §11 ("Plan gating reflected in §5.11 (Feature Access Matrix), §34.1 (Plan Tier Definitions), §39 (Object Size Constraints)"), §34.1.2 should carry the row.

**Severity: P1 plan_gating** per audit prompt step 2 ("If absent from any section, file a P1 plan_gating defect"). A junior engineer building §34.1.2-driven entitlement evaluation cannot derive the Direct Invite gate without §27.9.8 prose; the implicit derivation through "real-time-class" on Seller Scale is a reasonable mis-interpretation point against Seller Growth's "Weekly digest" cell.

### 2.5 §5.11 missing buyer-side Issue Pro Trial Seat row → D-2.4-005 (P1 plan_gating)

§5.11 Billing & AI Accounting block (lines 9224–9245) carries vendor-side Pro Trial Seat actions:
- Line 9242: "Accept Buyer-Funded Pro Trial Seat grant (vendor side) | ✓ | ✗ | ✓ | ✗ | … (billing_admin, vendor Org)"
- Line 9243: "Decline Buyer-Funded Pro Trial Seat grant (vendor side) | ✓ | ✗ | ✓ | ✗ | …"

The buyer-side Pro Trial Seat **issuance** action — the action that is plan-gated to Buyer Scale (5/mo) and Buyer Enterprise (15/mo) per §34.1.1 cell `Vendor Pro Trial Seats (M17)` and per §34.8.x entitlement row `vendor_pro_trial_seat_grant` (line 28224, declaring `business_scale (5/mo) / buyer_enterprise (15/mo)`) — has **no §5.11 row**.

§4.3.17 (Buyer-Funded Pro Trial Seat Grant entity, line 4101): "M17 entity that tracks the lifecycle of a single Pro Trial Seat from issuance (buyer-side) through redemption (seller-side) to outcome…"

§34.13 (Buyer-Funded Pro Trial Seat) and §32.8 (API endpoints — issue endpoint authored, vendor accept/decline endpoints at §32.8.16 / §32.8.17) confirm the buyer-side issuance is a discrete user-capability. §5.11 carries the receive-grant-notification row (line 9245) but not the issue-grant action itself.

A junior engineer building the buyer-side Pro Trial Seat issuance UI cannot determine which buyer-console role can fire the issue action against §5.11. Per §34.13 narrative the gate is `billing_admin` (M17 issuance is a billing-domain action), but §5.11 is the canonical RBAC matrix — the row should be there.

**Severity: P1 plan_gating** per audit prompt step 2.

### 2.6 §13.11.4 / §13.11.13 stale "Phase 14.6 — forthcoming" alias copy → D-2.4-006 (P3 consistency_drift)

§13.11.4 Plan Gating table (line 12401):
> | Buyer Solo (Phase 14.6 — forthcoming) | Full surface, unwatermarked, full PDF export. | Authored Extension — coupled to the Phase 14.6 Solo plan-tier introduction. Until Phase 14.6 lands, the Solo gate aliases to Business Starter+ per the operational gating note in §13.11.13 AC 4. |

§13.11.13 AC #5 (line 12629):
> Given an operator on Solo+ (or Business Starter+ until Phase 14.6 lands per §13.11.4), when they open the Defense View, the four sections render unwatermarked and the PDF export is enabled.

§34.1.3 Plan-Tier Cross-References (line 27687) explicitly retired the alias: "The §4.8.2 `plan_gate_min_tier` '(effective on Phase 14.6 landing); aliases to `business_starter` until then' footnote (line 11898 pre-edit) is REMOVED — the aliases no longer apply post-Phase-14.9."

§13.11.5 (line 12421) confirms the retirement: "`plan_gate_min_tier` | `buyer_solo` per §34.1.1 / §34.1.3 (alias to `business_starter` retired in Phase 14.9; line corrected in Phase 14.9.1)".

The §13.11.4 row label "(Phase 14.6 — forthcoming)" and the alias note "Until Phase 14.6 lands, the Solo gate aliases to Business Starter+", together with §13.11.13 AC #5's "(or Business Starter+ until Phase 14.6 lands per §13.11.4)" parenthetical, are stale: Phase 14.9 closed, Solo is registered, the alias is retired. Two locations carry stale text in §13.11.

**Severity: P3 consistency_drift** — the values resolve correctly (Solo = full surface; the unstated alias would have aliased to Business Starter+ which also resolves to "full" per §34.1.1), so the implementation impact is nil. The hygiene impact is two stale parentheticals that mislead a reader on the Solo registration timeline. Phase 14.9.1 is the canonical cleanup window per §13.11.5; this defect rolls into that cleanup.

---

## 3. Procedure Step 3 — Solo Tier Presence per §34 Sub-Anchors

| §34 sub-anchor | Solo presence | Verdict |
|---|---|---|
| §34.1.1 Buyer Plan Tiers | Buyer Solo column present (line 27608, all rows populated) | ✅ |
| §34.1.2 Seller Plan Tiers | Seller Solo column present (line 27654, all rows populated) | ✅ |
| §34.1.3 Plan-Tier Cross-References | Solo enum values registered (`buyer_solo`, `seller_solo`); §39 mirror cross-reference; Solo numerical authority assertion (line 27690) | ✅ |
| §34.2.1 Buyer Pricing | Buyer Solo row present (line 27699) — $49 annual / $59 monthly / $199 per-eval | ✅ |
| §34.2.2 Seller Pricing | Seller Solo row present (line 27710) — $49 annual / $59 monthly / $199 per-bid | ✅ |
| §34.2.5 Solo Per-Eval / Per-Bid Charge Orchestration | Full sub-section authored (lines 27753–27810); both Buyer Solo per-eval and Seller Solo per-bid mechanics covered | ✅ |
| §34.10.3 Pooled Budget Across Consoles | Solo-co-resident pool rule present (lines 28355–28365) covering Solo+Free, Solo+Solo, Solo+Paid Business, Solo+Enterprise, Solo upgrade, Solo downgrade | ✅ |
| §34.12.6 Solo-Tier Per-Console Subscription Billing | Sub-section anchor present (line 28551) | ✅ |

**Verdict.** All eight required §34 Solo anchors are present and populated. No defect filed under procedure step 3.

---

## 4. Procedure Step 4 — Defense View §5.11 ↔ §13.11 Reconciliation

§13.11.4 Plan Gating (lines 12394–12404) declares: Free=watermarked preview, Solo+=full surface, Enterprise=full + audit-receipt footer.

§5.11 has no `defense_view` row → **D-2.4-001** (P1).

§34.1.1 row "Defense View (§13.11)" (line 27647) matches §13.11.4 — Free / Solo / Starter / Growth / Scale / Enterprise cells fully populated and consistent with §13.11.4 verbiage.

§34.1.1 ↔ §13.11.4 are mutually consistent (no defect). The break is the §5.11 silence (D-2.4-001) and the stale §13.11.4 alias copy (D-2.4-006). §34.1.1 is the canonical home and is correct.

---

## 5. Procedure Step 5 — Buyer Maya §5.11 ↔ §13.12 / §22.20 Reconciliation

§13.12.3 Plan Gating (line 12708): "The intake surface itself is unconditionally available on every Buyer plan tier — the surface is the on-ramp to the platform and the registration of the operator's first artifact. Per-tier behavior diverges only in the materialization step (§13.12.4 truncation). The Appendix M row (EvalStarter, §4.5.9) and the surface-bound row authored in Appendix M for §13.12 carry the canonical contract; the §5.11 Feature Access Matrix enforces no separate gate beyond the universal 'create a Workspace' permission."

§13.12.9 (line 12779): "The intake itself adds no new plan-gated feature; it is a surface around existing entitlements."

Verdict: §5.11 has no Buyer Maya intake row by design; the gating is via §34.1.1 caps applied at materialization (§13.12.4 step 3). This is internally consistent. No §5.11 defect on Buyer Maya.

The Buyer Maya gating-via-truncation chain DOES depend on §39 mirroring §34.1.1 caps for Use Cases per Workspace and Requirements per Workspace — both of which are missing from §39 (rolled into D-2.4-002).

§22.20 Seller Maya is the seller-side counterpart; §22.20.7 AC #79–#98 enforce against `plan_tier = seller_free` only, excluding `seller_solo` (D-2.4-003).

---

## 6. Procedure Step 6 — KB Capacity Gating: §22 vs §39 vs §34

§22.1 (line 15043): "KB plan gating and quantitative limits — see §5.11 Feature Access Matrix, §34.1 Plan Tier Definitions, §39 Object Size Constraints."

| Authority | Status |
|---|---|
| §34.1.1 KB Entries (Buyer) | Present (line 27629): 50 / 50 / 1,000 / 10,000 / Unlimited / Unlimited |
| §34.1.1 KB Document Library (Buyer) | Present (line 27630): 50 / 50 / 500 / 5,000 / Unlimited / Unlimited |
| §34.1.2 KB Entries (Seller) | Present (line 27661): 50 / 250 / 1,000 / 10,000 / Unlimited / Unlimited |
| §34.1.2 KB Bootstrap (Opus) | Present (line 27663): 1 lifetime / 1 lifetime + 1/year / 1/year / 3/year / Unlimited / Unlimited |
| §34.1.2 Firecrawl Sources | Present (line 27662): 0 / 1 weekly / 2 weekly / 10 daily / Unlimited / Unlimited |
| §39 KB Entries per Org per plan | **Missing** (rolled into D-2.4-002) |
| §39 KB Document Library per Org per plan | **Missing** (rolled into D-2.4-002) |
| §39 KB Bootstrap allowance per plan | **Missing** (rolled into D-2.4-002) |
| §39 Firecrawl Sources per plan | **Missing** (rolled into D-2.4-002) |
| §39 KB Entry body / source_url char limits | Present (lines 30350–30351) — these are character limits, not per-tier quantity gates |
| §5.11 KB-quantity row | Not applicable (matrix is role-keyed; KB-quantity gating is plan-tier-keyed). §22.1 cross-reference to §5.11 for KB plan-gating is structurally moot since §5.11 doesn't carry plan-tier rows; §22.1 should cite §34.1 only. |

The §22.1 three-section cross-reference is two-thirds broken: §39 has none of the KB-quantity rows, and §5.11 has none of them either. Only §34.1 is authoritative. The fix is the same structural defect as D-2.4-002 (§39 missing mirror rows). The §22.1 line itself could also use a tightening — citing §5.11 for KB plan-gating is misleading because §5.11 enforces no KB quantity. Filing this as evidence under D-2.4-002 rather than as a separate defect (the structural missing-mirror-row issue is the root cause).

---

## 7. Self-Challenge Pass (Opus-mandatory, Hostile Reviewer Voice)

Re-read each defect as a hostile reviewer:

**D-2.4-001 (Defense View row missing from §5.11).** Evidence reproducible? Yes — line-range is given (9171–9287) and grep across that range for `defense_view` / `Defense View` confirms zero hits. Severity classification rule-based? Yes — "missing plan-gating row in §5.11/§34.1/§39" maps to P1. Recommendation sharper? Add 1 row to §5.11 Reporting & Analytics row group: "Open Defense View (§13.11)" with role × column cells reflecting §13.11.4 / §13.11.5 access (Workspace Owner, Workspace Admin, Use Case Lead, Reviewer can read; only Workspace Owner can regenerate per §13.11.8 `regenerate` action; Free-tier callers receive watermarked preview per §13.11.4). Confirmed reproducibility — no revision.

**D-2.4-002 (§39 missing plan-quantity mirror rows).** Evidence reproducible? Yes — full row table enumerated. Severity classification rule-based? Yes — single P1 covering 20 missing rows (the structural defect is one defect with broad impact, not 20 defects; consistent with D-2.3-002 / D-2.3-003 single-defect-broad-evidence pattern). Hostile reviewer challenge: "Are these rows actually required by the convention, or is the §34.1.3 promise itself an Authored Extension that hasn't ratified?" — the §34.1.3 sentence is in the canonical Master Spec (line 27688) and is not flagged AE; it stands as authoritative. The §39 preamble (line 30326) reinforces the contract. The defect is that the closure of Phase 14.9 was claimed but the §39 deliverable was not. Confirmed P1 — no revision.

**D-2.4-003 (§22.20 plan-tier scope excludes seller_solo).** Evidence reproducible? Yes — exact AC text quoted. Severity classification rule-based? Yes — P1 "missing plan-gating row" by analogy: the AC enforces only on a subset of the plan-tier set the surface compression should apply to. Hostile challenge: "Maybe Phase 14.9 deliberately excluded `seller_solo` from §22.20 because Solo gets a less-aggressive compression?" — read §22.20 narrative again: every paragraph says "Solo / Free" interchangeably ("On Solo / Free, Seller Maya never authors a Capability Declaration", etc.). The narrative declares the compression for both tiers; the AC enum value lags. Confirmed P1 — no revision.

**D-2.4-004 (§27.9.8 Direct Invite missing standalone §34.1.2 row).** Evidence reproducible? Yes. Severity classification rule-based? P1 by audit prompt step 2 strict reading. Hostile challenge: "But §34.1.2's 'Seller Signals' row IS the gate — the row carries 'Weekly + real-time' at Scale and §27.9.8 declares Direct Invite is 'real-time-class', so the gate IS in §34.1.2." — Counter: the rule "real-time-class requires Seller Scale" is in §27.9.8 prose, not in §34.1.2. A reader of §34.1.2 alone cannot derive it. The "Seller Signals" row enumerates digest-vs-real-time, not Direct Invite. The standalone row is required for §34.1.2 self-containment. Severity could plausibly drop to P2 (resolvable via §27.9.8 prose); audit prompt step 2 says P1 for missing rows, which dominates the tiebreaker. Confirmed P1 — no revision but acknowledged the borderline.

**D-2.4-005 (§5.11 missing buyer-side Issue Pro Trial Seat row).** Evidence reproducible? Yes — §5.11 lines 9224–9245 show only accept/decline rows, no issue row. Hostile challenge: "Maybe the Issue is implicit in 'Mutate auto-topup' or 'Initiate manual wallet top-up'?" — No, those are wallet-topup rows. Pro Trial Seat issuance is a distinct buyer-side action with its own §32.8.x endpoint and its own §34.13 procedure. Severity P1 — confirmed.

**D-2.4-006 (Stale Phase 14.6 — forthcoming alias copy).** Evidence reproducible? Yes — two locations cited. Severity P3 — values resolve correctly, only the framing is stale; cosmetic per the severity rules. Confirmed.

---

## 8. Counterfactual Pass (Opus-mandatory)

For each plan-gated feature audited, three realistic failure modes the spec must handle:

**Defense View.** (1) Free-tier user attempts PDF export on watermarked preview — handled by §13.11.4 + §13.11.6 (PDF generation suppressed; upgrade modal); failure mode covered. (2) Solo-tier user upgrades to Enterprise mid-session and expects audit-receipt footer immediately — §34.5 / §34.10.3 #5 handles upgrade carry-over but §13.11.6 is silent on whether the audit-receipt-footer surfaces immediately or at next regeneration. **Unhandled — but rolls into the §13.11 audit phase, not this phase.** (3) Buyer Solo on per-eval billing fires Selection Report PDF export, which fires the $199 Stripe charge AND the Defense View regeneration — §34.2.5 governs the charge but does §13.11.5 generation pipeline assume the Stripe charge has captured before generation runs? §13.11.5 step 1–5 don't mention §34.2.5 at all. **Unhandled — surface gap; not in scope for this audit phase.**

**§22.20 Seller Maya compression contract.** (1) Maya upgrades sF→sSt mid-Hero-Moment — handled by §22.20 Edge Case (4) / §22.20.5 Edge Case (2). (2) Auto-published Capability Declaration is later quarantined — handled by §22.20.2 Edge Case (3). (3) Solo-tier Org receives the surface compression OR the paid-tier surface — **unhandled**, this is exactly D-2.4-003.

**Direct Invite from Cohort.** (1) Seller Scale mid-cycle downgrade to Growth with active Direct Invite offer — handled by §27.9.8 line 22743 `terminated_eligibility_lost` (analogous to PromotedListing pool-accounting precedent — line 5742). (2) k-anonymity floor breach mid-offer — handled by §27.9.8 AC #11 (`direct_invite_cohort_below_k_anon_floor` rejection). (3) Seller Free attempts Direct Invite — handled by `seller_signal_direct_invite_plan_tier_insufficient` (§27.9.8 AC #10) — but §34.1.2 doesn't independently gate it (D-2.4-004 root cause).

**Buyer-Funded Pro Trial Seat issuance.** (1) Buyer Scale exhausts monthly allowance — handled by §34.13 / §34.5 (allowance refresh next billing cycle; attempt within month rejected). (2) Buyer downgrades from Scale to Growth with active issued seats — handled by §34.5.2 line 27944 ("Trials in flight continue under their original 30-day window regardless of buyer downgrade"). (3) Issuance fired by non-billing-admin role — **unhandled in §5.11** (no row to declare which role can fire issuance) — exactly D-2.4-005.

The three "unhandled" cases above either (a) roll into the filed defects (D-2.4-003, D-2.4-005), or (b) are out of scope for Phase 2.4 and forwarded to §13.11 / §34.13 audit phases. No additional defects filed by the counterfactual pass.

---

## 9. Promoted Defects (Promoted to `DEFECT_LEDGER.md`)

| defect_id | severity | class | sub-prompt finding |
|---|---|---|---|
| D-2.4-001 | P1 | plan_gating | Defense View row missing from §5.11 (§13.11.11 cross-reference broken) |
| D-2.4-002 | P1 | plan_gating | §39 missing 20 structural plan-quantity mirror rows promised by §34.1.3 + §39 preamble |
| D-2.4-003 | P1 | plan_gating | §22.20 Seller Maya plan-tier scope and CI ACs bind `seller_free` only; canonical Maya tier `seller_solo` excluded from compression enforcement |
| D-2.4-004 | P1 | plan_gating | §27.9.8 Direct Invite from Cohort lacks a standalone §34.1.2 row (sub-rolled into Seller Signals "Weekly + real-time") |
| D-2.4-005 | P1 | plan_gating | §5.11 Billing & AI Accounting block missing buyer-side "Issue Buyer-Funded Pro Trial Seat grant" row |
| D-2.4-006 | P3 | consistency_drift | §13.11.4 / §13.11.13 AC #5 carry stale "(Phase 14.6 — forthcoming)" / "(or Business Starter+ until Phase 14.6 lands per §13.11.4)" alias copy after Phase 14.9 retired the alias |

5 P1 plan_gating defects + 1 P3 consistency_drift = 6 total. Forwarded to Phase 14.9.1 inline-tier-list cleanup window for D-2.4-006; D-2.4-001..005 forwarded to Phase 4 (Plan-Tier Reflection / RBAC) remediation.

---

## 10. Coverage Matrix Updates

`COVERAGE_MATRIX.md` `plan_gating` column tightenings (Phase 2.4 pass):

| feature_id | feature | prior | new | rationale |
|---|---|---|---|---|
| F-262 | defense_view_generate Capability | ⚠ | ❌ | D-2.4-001 (§5.11 row missing) + D-2.4-006 (§13.11.4 / §13.11.13 stale alias) |
| F-264 | Buyer Maya Intake | ⚠ | ⚠ | Retained ⚠. §13.12.3 explicitly disclaims §5.11 row; §34.1.1 caps cited at materialization. Indirect failure: §39 mirror rows for use_cases / requirements per Workspace are missing per D-2.4-002. |
| F-381 | Seller Maya Surface Abstraction | ⚠ | ❌ | D-2.4-003 (`plan_tier = seller_free` scope excludes `seller_solo`) |
| F-457 | Direct Invite from Cohort (Seller Scale+) | ⚠ | ❌ | D-2.4-004 (§34.1.2 missing standalone row) |
| F-545 | Buyer-Funded Pro Trial Seat (M17) | ⚠ | ❌ | D-2.4-005 (§5.11 missing buyer-side issuance row) |

Aggregate counters NOT updated in this pass (matrix-row tightening on the 5 rows is a 5-of-970 sample). Aggregate counters will be re-derived in a Phase V2 cross-check.

The 16 missing §34.1-mirror rows in §39 (D-2.4-002) tighten the `plan_gating` cell of every quantity-gated feature whose §34.1 cap depends on §39 mirror absence (Active Evaluations, Vendors tracked, Use Cases per Workspace, Requirements per Workspace, API Keys, Webhook Endpoints, KB Entries, KB Document Library, Storage, Vendor Pro Trial Seats, Bid Workspace, Invited Bids, Proactive Marketplace EOIs, Firecrawl Sources, KB Bootstrap, SellerSoftware Entities, Capability Declarations, Seller Page Enrichment, Promoted Marketplace Placements). Per the Phase 1.1 / 1.5 / 2.2 pattern of partial-tightening across-rows, the affected feature rows for these caps are cell-tightened only when the audit phase lands the cell tightening explicitly. This Phase 2.4 pass cell-tightens only the 5 features above (the audit prompt's procedural focus); the broader ❌-on-missing-§39-row tightening is forwarded to Phase 4 (Plan-Tier Reflection) per the audit program sequencing.

---

## 11. Rejected / Not-Filed Findings

Findings explored but NOT promoted to defect ledger:

1. **Solo Mode (`evaluation_owner_mode=solo`) and §39 mirror.** §4.3.1 declares the field; §39 has no mirror because the field is per-Workspace state, not a quantity. Not a defect — `evaluation_owner_mode` is correctly NOT in §39.
2. **Selection Report watermark (§34.1.1 row).** Confirmed consistent with §10.12 / §13.11 / §40.1; no §39 mirror needed (boolean state, not a quantity); no defect.
3. **MFA per §6.2.1 / §34.1.1.** §34.1.1 cell `MFA` ("Not available / Not available / Optional / Optional / Optional / Optional with org-wide enforcement") consistent with §6.2.1 sub-section table. §39 not applicable (boolean state). No defect.
4. **Audit Log Retention per §6.7.3 / §34.1.1.** §34.1.1 cell `Audit Log Retention (UI)` consistent with §6.7.3. §40.2 is the deeper authority (financial audit always 7y). No defect at this audit's scope; D-1.5-013 already filed by Phase 1.5 covers the §40.2 row inline-restatement issue.
5. **API Keys per §6.6.2 / §34.1.1.** §6.6.2 explicitly cites §34.1.1 for the per-plan ceilings ("API key limits are authoritative in §34.1.1 (Buyer) and §34.1.2 (Seller) cell **API Keys**. This subsection does NOT restate the values"). Consistent. §39 mirror missing (rolled into D-2.4-002). No additional defect.
6. **Webhook Endpoints per §31.5 / §34.1.1.** §31.5 (line 23915 — referenced in CLAUDE.md §16 as a 27-location inline-tier-list TODO) carries inline tier-list strings; consistency with §34.1.1 not verified at byte level in this phase but flagged for Phase 14.9.1. No new Phase 2.4 defect.
7. **Free Allowance Counter (§4.8.7 / §34.1.1).** §34.1.1 cell `Free Allowance per Customer-Billed Capability (signup)` set at universal "10 ops" across all tiers; consistent with §4.8.7 / §34.8.4. No defect.
8. **Seller Match Score Numeric (§27.4 / §34.1.2 / §22.20.4).** §34.1.2 cell `Match Scoring (numeric)` ("Labels only / Labels only / Labels only / Included / Included + batch API / Included + batch API"). §22.20.4 declares the three-label compression on Solo / Free; §27.4 declares the four-bucket model on paid tiers. Match across §34.1.2 + §22.20.4 + §27.4 is internally consistent (Free + Solo + Starter render labels-only; the label set differs Free/Solo three vs Starter four — but Starter labels per §27.4 unchanged is fine). No defect at this audit's scope; the Starter "Labels only" cell ambiguity (which labels?) is a §27.4 / §34.1.2 surface-clarity issue forwarded to Phase 4 (Plan-Tier Reflection) for verification.
9. **Honest Portability KB Export (F-371 / §22.18.2 / §34.1.2).** §34.1.2 doesn't carry a discrete row but §22.18.2 declares "available on every plan tier (including Free)". No defect — F-371 is unconditional and §22.18.2 is the canonical home.

---

## 12. Forward Pointers

- **D-2.4-001** → Phase 4 (Plan-Tier Reflection / RBAC). Recommendation: append `defense_view` row to §5.11 Reporting & Analytics row group with the cell pattern (Workspace Owner ✓ regenerate; Workspace Admin / Use Case Lead / Reviewer ✓ read; Free-tier callers see watermarked preview per §13.11.4).
- **D-2.4-002** → Phase 4 (Plan-Tier Reflection). Recommendation: §39 add 20 plan-quantity mirror rows (one per §34.1 row in the table above), each citing `Source: §34.1.1` or `Source: §34.1.2` per the §34.1.3 contract; consider adding a deploy-time validator `appendix_39_plan_quantity_mirror_completeness` analogous to `solo_tier_numeric_single_source` that asserts every §34.1 plan-tier row whose cell value is a numeric quantity has a corresponding §39 row citing that cell.
- **D-2.4-003** → Phase 4 (Plan-Tier Reflection) + Phase 14.18 CI gate runtime wiring. Recommendation: replace `plan_tier = seller_free` in §22.20 prose AND in AC #79–#98 with `plan_tier ∈ {seller_free, seller_solo}`; update CI gate `seller_maya_surface_abstraction_engine_unchanged` to enforce on both tiers.
- **D-2.4-004** → Phase 4 (Plan-Tier Reflection) + Phase 8 (API/Webhook). Recommendation: add a §34.1.2 row "Direct Invite from Cohort | — | — | — | — | Included | Included + API | Source: §27.9.8 (Seller Scale+ minimum)" between Seller Signals and CRM Sync rows.
- **D-2.4-005** → Phase 4 (Plan-Tier Reflection) + Phase 4b (Billing Admin RBAC). Recommendation: add a §5.11 Billing & AI Accounting row "Issue Buyer-Funded Pro Trial Seat grant (buyer side; plan-gated to Buyer Scale (5/mo) / Buyer Enterprise (15/mo) per §34.1.1)".
- **D-2.4-006** → Phase 14.9.1 inline tier-list audit (per §5.11 line 9275 known-gaps note in CLAUDE.md §16). Recommendation: edit §13.11.4 row label to "Buyer Solo" (drop "(Phase 14.6 — forthcoming)") and remove the alias note; edit §13.11.13 AC #5 to drop "(or Business Starter+ until Phase 14.6 lands per §13.11.4)".

---

## 13. Sign-Off

Phase 2.4 walked the prompt procedure end-to-end. 6 defects promoted to `DEFECT_LEDGER.md`. Coverage matrix updated for 5 features. Self-challenge and counterfactual passes applied. No additional defects surfaced post-promotion.

The Phase 2.4 pass closes cleanly subject to forwarded items (Phase 4 / Phase 4b / Phase 8 / Phase 14.9.1 / Phase 14.18) for remediation.
