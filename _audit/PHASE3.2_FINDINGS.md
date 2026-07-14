# Phase 3.2 — §5.11 Feature Access Matrix Coverage (Findings)

**Run:** 2026-05-04
**Master Spec baseline:** v7.1.0 (2026-04-28)
**Scope:** §5.11 Feature Access Matrix (Comprehensive) — lines 9171–9290.
**Cross-reference reads:** §1.3 Console Firewall · §4.3.1 Workspace `role` enum · §5.1–§5.10 (Phase 3.1 input) · §5.12 enforcement · §13.11 Defense View · §13.12 Buyer Maya · §22 Seller KB · §22.20 Seller Maya · §25.3 Disqualification · §25.7 Internal Comment Threads · §27 Marketplace · §27.2 / §27.4 / §27.9 / §27.10 · §31 Webhooks · §32 Public APIs · §34.1 / §34.13 / §34.14 / §34.16 plan-tier authority · §39 Object Size Constraints · §44 Surface treatment · §48 Growth Loops M2 / M5 / M8 / M9 / M10 / M11 / M12 / M13 · §50.11 Seller Template Review · Appendix J Plan Tiers / Workspace Roles / Seller Console Role Extension · Appendix K Glossary · Appendix M Surface/Engine Mapping · `_audit/FEATURE_INVENTORY.md` (135 user_capability rows) · Phase 3.1 D-3.1-001 .. D-3.1-024.
**Convention preamble:** Sourcera Audit Program v1.0 — `Audit_Prompts.md` Prompt 3.2.

---

## 1. Method

1. End-to-end read of §5.11 (lines 9171–9290) including the matrix body, Notes, and Seller Console Role Overlay.
2. Inventory of column set: 11 role columns + Feature column (`Org Owner | Org Admin | Billing Admin | Workspace Owner | Workspace Admin | Use Case Lead | Reviewer | Guest (read_only) | Guest (contributor) | Guest (scorer) | Guest (full_participant)`).
3. Inventory of row groups: 13 groups, ~52 capability rows.
4. Forward pass — every §5.11 row-label inline plan-tier string compared against §34.1.1 / §34.1.2 canonical Plan-Tier tables and Appendix J `buyer_plan_tier` / `seller_plan_tier` enum registrations.
5. Reverse pass — whole-Master-Spec grep for `§5.11` (39 hits) walked end-to-end. Every "is updated to add the row" / "registers the row in §5.11" / "see §5.11 Feature Access Matrix" promise verified against the actual §5.11 body.
6. Cross-walk against `_audit/FEATURE_INVENTORY.md` user_capability class (135 rows) — sample-walk on plan-gated capabilities.
7. Counterfactual pass — per-cell ambiguity simulation (junior engineer reading §5.11 in isolation; Solo upgrade flow; Seller Console role overlay enforcement; Marketplace role enforcement; Ops role enforcement).
8. Self-challenge pass — re-read every defect candidate as a hostile reviewer.

## 2. Headline Verdict

**§5.11 fails its own self-description as the "Comprehensive" Feature Access Matrix.** Three structural failures and roughly twenty-two material missing-row failures.

The three structural failures are:

1. **Role-keyed only.** The matrix is an 11-role × ~52-row grid. Plan-tier gating — which §34.1.3 line 27693 explicitly directs the matrix to encode ("(b) gate per-capability access to plan tiers per the Entitlement Matrix in §34.8") — is reflected only as inline narrative strings on row labels, not as a structural dimension. The §14.9.1 backlog acknowledges this on a 27-location list and tells readers to defer to §34.1.1 / §34.1.2 in the meantime, but no remediation has landed.
2. **Plan-tier strings are literal Title-Case names ("Free", "Solo", "Starter", "Growth", "Scale", "Enterprise").** Appendix J registers canonical lowercase enums (`buyer_free`, `buyer_solo`, `business_starter`, `business_growth`, `business_scale`, `buyer_enterprise`; mirror set on the seller side). Every inline string drifts; gating breaks silently when a plan name changes.
3. **Console-firewall column coverage is incomplete.** The 11 columns are buyer-console roles only. Three groups in the matrix (Seller Signals, Buyer Signal Opt-In, CRM Sync) introduce seller-console operations but represent the seller-console role differentiation in *prose* (the Seller Console Role Overlay Note at lines 9282–9286), not in columns. Marketplace roles (§5.6) and Ops Console roles (referenced by §48.6 M9–M13 row authorings) are absent entirely.

The twenty-two material missing-row failures are gathered in §3 (Cluster B and Cluster C) below. The largest cluster: every seller-console plan-gated user capability cited from §22 (KB operations), §27 (Marketplace operations), §27.10 (Verification Tier requests), §31 (Webhook Endpoint CRUD), §6.6 (API Token CRUD), §50.11 (Seller Template submission), §48.4 / §48.5 / §48.6 (M5 / M8 / M9–M13) is silent in §5.11 despite the originating section citing §5.11 as the home of the gate.

The matrix as written is unbuildable for buyers and sellers attempting to enforce plan-tier gating without cross-referencing four other locations (§34.1, §34.8, §39, §22 / §27 individual sections). Per Audit_Prompts.md Severity Definitions, "missing plan-gating row in §5.11/§34.1/§39" is a P1 plan_gating defect by rule.

Phase 3.1 D-3.1-006 (role-name canonicality drift) and D-3.1-013 (seller-side analogue) are inherited as cross-phase context — §5.11 column headers use Title-Case names ("Workspace Owner") rather than the canonical Appendix J enum (`workspace_owner`); the per-row "Use Case Lead" column maps to no §5.3 role definition at all (D-3.1-006 reroutes "Evaluator" → canonical `use_case_lead`). Those defects' resolution will require §5.11 column-header rewrites in lockstep.

## 3. Defect Candidates (promoted to Defect Ledger)

Twenty-nine candidate defects drafted; all twenty-nine promoted to `DEFECT_LEDGER.md` with IDs `D-3.2-001` through `D-3.2-029`.

### 3.1 Cluster A — Structural defects in §5.11 (6 defects)

- **D-3.2-001 [P1 plan_gating].** §5.11 lacks a plan-tier dimension despite §34.1.3 line 27693 directing the matrix to "(b) gate per-capability access to plan tiers per the Entitlement Matrix in §34.8." The matrix is role × capability; plan-tier gating is distributed across §34.1.1 / §34.1.2 / §34.8 / §39 / inline §5.11 row-label strings. A junior engineer enforcing both role and plan-tier gates on a feature reads at minimum five locations and reconstructs the joint gate by hand. Reverse pass: every "see §5.11 Feature Access Matrix" promise in §22 / §27 / §31 / §32 / §50.11 / §48 returns a row that, even when present, does not encode plan tiers as columns or as a per-row "Min Tier" column.
- **D-3.2-002 [P1 plan_gating].** §5.11 inline plan-tier strings (~11 row labels at lines 9185, 9192, 9222, 9231, 9244, 9252, 9259, 9263–9266, plus the 27-location §14.9.1 backlog of cross-section inline tier-lists) use literal Title-Case plan names ("Free", "Solo", "Starter", "Growth", "Scale", "Enterprise") rather than canonical Appendix J `buyer_plan_tier` / `seller_plan_tier` enum values (`buyer_free`, `buyer_solo`, `business_starter`, `business_growth`, `business_scale`, `buyer_enterprise`; mirror set on the seller side). Gating breaks silently when a plan name changes (per the audit prompt itself: "gating drifts when plan names change"). Phase 14.9.1 backlog acknowledges 27 locations with the note "until that audit lands, readers MUST defer to §34.1.1 / §34.1.2 over any inline string" — the backlog is the explicit acknowledgement of the defect, not its remediation.
- **D-3.2-003 [P1 plan_gating].** §5.11 Notes at lines 9277–9278 explicitly assert "the matrix is role-keyed and Solo's surface compression is driven by `evaluation_owner_mode=solo`" and decline to add a Solo column. The rationale is correct for surface compression — but Solo is also an authoritative billable plan tier per §34.1.1 / §34.1.2 (subscription pricing, AI envelope, KB ceiling, Verification Tier eligibility, support tier, per-evaluation / per-bid alternative pricing all differ from Free). Plan-tier-driven gates on Solo (e.g., Verified eligibility, KB Bootstrap re-bootstrap, unwatermarked Selection Report) are not surfaced in §5.11. The inline-list-inclusion-or-exclusion rule in the same Notes block ("inclusive of Solo wherever Solo's §34.1 cell value is non-`—`, exclusive of Solo wherever the §34.1 cell value is `—` or 'Not available'") is a band-aid that pushes plan-gate joint-resolution onto the reader. Either add Solo as a column or add a "Min Tier (Buyer)" / "Min Tier (Seller)" column per row.
- **D-3.2-004 [P1 rbac].** §5.11 column header set is 11 buyer-console roles + Feature. The matrix has rows for Seller Signals (§27.9), Buyer Signal Opt-In (§27.9.2), and CRM Sync (§31.9) but does not have columns for Seller Console roles `seller_org_admin`, `seller_marketing_editor`, or `seller_integrations_admin` (registered in Appendix J `seller_console_role` per Phase 3.1 cross-reference; described in the Seller Console Role Overlay Note at lines 9282–9286). The Note describes additive permissions in *prose* ("`seller_org_admin` — Same access as `org_owner` on all rows in the **Seller Signals — Seller Console** and **CRM Sync — Seller Console** groups"); this is a tabulation gap. Two readers will reach divergent conclusions on whether a `seller_marketing_editor` can read SellerSignal Dashboard (the Note says read-only, but the matrix shows ✓ only on `org_owner`).
- **D-3.2-005 [P1 rbac].** Marketplace roles (`marketplace_publisher`, `marketplace_viewer` per §5.6) are absent from §5.11 columns and no Marketplace operations are tabulated as rows. §27.4.1 line 20974 explicitly cites §5.11 as authority for "Match Score numeric exposure"; §27 line 23448 explicitly cites §5.11 for "which plans can bid, which can request Certified"; §34.1.3 line 27693 explicitly cites §5.11 for Marketplace plan-tier gating. None of these resolve in the actual §5.11 body.
- **D-3.2-006 [P1 rbac].** Ops Console roles (`ops_marketing_editor`, `ops_marketing_supervisor`, `ops_taxonomy_admin`, `ops_legal_takedown_admin`, `ops_marketing_finance_reviewer`, `ops_template_reviewer`) are absent from §5.11 columns. §48.6 (M9–M13 marketplace editorial mechanics) explicitly authors 14 §5.11 row authorings against these Ops roles (lines 34509, 34679, 34788, 34901, 35058, 35152). With no Ops columns, the rows are unbuildable; with no rows authored, the §48.6 commitments are unverifiable.

### 3.2 Cluster B — Promised §5.11 rows not present (reverse-pass defects, 10 defects)

- **D-3.2-007 [P1 plan_gating].** §27.4.1 line 20974 declares "Billing and entitlement for numeric score exposure: §21.4.2 `match_score_numeric` + §5.11 Feature Access Matrix"; Appendix M row at line 45421 declares "Cross-referenced from §5.11 Feature Access Matrix row 'Match Scoring (qualitative)' / 'Match Scoring (numeric)' / 'Match Scoring (audit-receipted)'." None of the three rows exists in §5.11. Match Score plan-tier gating (Labels only / Labels only / Labels only / Included / Included + batch API / Included + batch API per §34.1.2 row "Match Scoring (numeric)") has no §5.11 representation.
- **D-3.2-008 [P1 plan_gating].** §25.7 line 20192 declares "§5.11 is updated in this pass to add one row group 'Internal Comment Thread Management' noting that `visibility_scope` mutation is restricted to thread author, Workspace Owner, Workspace Admin, and that 'Resolve / Re-open' is restricted to thread author, Workspace Owner, Workspace Admin, Use Case Lead." §25.7.6 line 19975 cites §5.11 for the upgrade CTA on cap reach. No "Internal Comment Thread Management" row group exists in §5.11; the Comments & Collaboration group at lines 9210–9213 covers only individual post add/edit/delete, not thread-level operations.
- **D-3.2-009 [P1 plan_gating].** §32 / §10 declares row "Generate M2 Public Selection Report Link" at line 32756: "The §5.11 Feature Access Matrix is updated to include the row 'Generate M2 Public Selection Report Link' with these three roles ✓ and all others ✗." The row does not exist. The Reporting & Analytics row group (lines 9219–9225) includes "View Selection Report" and "Export evaluation" but not the M2 link-generation operation, which is a public-link materialization with separate audit / abuse semantics from internal Selection Report viewing.
- **D-3.2-010 [P1 plan_gating].** §48.4 line 33527 declares "The §5.11 Feature Access Matrix is updated to grant M5 to `workspace_owner`, `evaluation_lead`, `use_case_lead`." The M5 buyer-referral invitation row does not exist in §5.11. (Note: "evaluation_lead" is non-canonical per Phase 3.1 D-3.1-006 — should normalize to `workspace_admin`.)
- **D-3.2-011 [P1 plan_gating].** §48.5 line 34122 declares "The §5.11 Feature Access Matrix is updated to add the row 'View M8 Org Intelligence Value Curve': ✓ for `org_owner`, `org_admin`, `billing_admin` (on plans that include §16); ✗ for everyone else." The row does not exist.
- **D-3.2-012 [P1 plan_gating].** §48.6 lines 34509 (M9), 34679 (M10), 34788 (M11), 34901 (M12), 35058 (M13), and 35152 (rollup: "**§5.11 Feature Access Matrix:** 14 new rows registering M9–M13 editorial AND admin operations against the four new/extended Ops roles") declare 14 §5.11 row authorings. Zero rows exist in §5.11. Compounded with D-3.2-006 (no Ops columns), these 14 rows are doubly-blocked.
- **D-3.2-013 [P1 plan_gating].** §50 (Loss Debrief) line 36690 declares "Loss Debrief MUST gate Pro-tier insights on plan entitlement (§5.11 Feature Access Matrix); a property test asserts that Free-tier sellers see exactly ≤ 3 insights AND that Pro-tier sellers see ALL insights." No Loss Debrief row exists in §5.11, and "Pro-tier" is not a canonical Seller plan tier (see D-3.2-014).
- **D-3.2-014 [P1 plan_gating].** §50.11 line 37744 declares "Plan gating: seller template submission is Seller Pro+ (§5.11)." `seller_pro` is NOT a registered plan-tier enum value in Appendix J `seller_plan_tier` (canonical: `seller_free`, `seller_solo`, `seller_starter`, `seller_growth`, `seller_scale`, `seller_enterprise`). Stale plan-tier name used as the gate authority. No corresponding §5.11 row exists. Two compounded P1 defects: (a) the stale "Seller Pro" tier name AND (b) the missing §5.11 row. Severity is held at P1 (not P0) because the stale name in §50.11 is presently a documentation-only contract; no runtime enforcement is wired against `seller_pro` per the §50.11 prose. If a runtime enforcement path were wired, severity would escalate to P0 entitlement leak.
- **D-3.2-015 [P1 plan_gating].** §27.10 line 23448 declares "**Plan-tier entitlements** (which plans can bid, which can request Certified) — see §5.11 Feature Access Matrix and §34.1 Plan Tier Definitions." No "Request Certified Verification Tier" or analogous row exists in §5.11. Bidding-eligibility gating is also absent (no row distinguishes which plan tiers may submit a bid response).
- **D-3.2-016 [P1 plan_gating].** §22.1 line 15046 declares "§5.11 Feature Access Matrix is role-keyed and is NOT a KB-quantity authority — it carries `kb_*` operation rows for RBAC only." §5.11 has zero `kb_*` rows. KB Entry CRUD, KB Document Library upload, KB Bootstrap (Opus) trigger, Seller Page Enrichment, MCP session-start, and KB-tool-execution operations are entirely absent — yet §22 cites §5.11 as the home of the role gate. (Pricing companion `_audit/PHASE2.4_FINDINGS.md` confirmed via D-2.4-002 that §22.1 line 15046 was already corrected in V2 spec-side remediation to drop the misleading §5.11 binding for KB *quantities*; the role-gate binding remains and the rows remain absent.)

### 3.3 Cluster C — Major plan-gated user-facing capabilities missing from §5.11 (7 defects)

The Audit Prompt §3.2 reverse-pass directive ("every plan-gated capability mentioned in §10–§51 must appear in §5.11") forces these defects independent of whether the originating section explicitly cites §5.11.

- **D-3.2-017 [P1 plan_gating].** Marketplace search & filter operations plan-gated per §27.2 (lines 20929–20940) and §34.1.1 row "Marketplace Buyer Access" (Browse only / Browse only / Search + capability filter / Full + match scoring / Full + match scoring / Full + batch match API across the six Buyer plan tiers including Solo) are absent from §5.11. The §27.2 summary table itself omits Buyer Solo and Seller Solo rows entirely (Solo never appears as a row in the §27.2 table; the table jumps from Free → Starter → Growth → Scale → Enterprise) — and uses literal plan names with no Appendix J enum citation.
- **D-3.2-018 [P1 plan_gating].** Marketplace EOI submission operations plan-gated per §34.1.2 row "Proactive Marketplace EOIs" (0 / 0 / 10 mo / Unlimited / Unlimited / Unlimited + API) are absent from §5.11. §27.5 / §4.5.2 EOI Record creation has no §5.11 row even though it is the seller-side equivalent of the buyer-side "Disqualify vendor" operation that *is* tabulated.
- **D-3.2-019 [P1 plan_gating].** Capability Declaration CRUD operations plan-gated per §34.1.2 row "Capability Declarations" (3 / 3 / 25 / 250 / Unlimited / Unlimited) are absent from §5.11. §22.20.7 Maya-chip authoring path (Phase 14.8 v7.1.0 program) writes capability declarations; the role gate is implicit (`seller_marketing_editor`+) but never tabulated.
- **D-3.2-020 [P1 plan_gating].** API Token CRUD operations plan-gated per §34.1.1 row "API Keys" (1 / 1 / 5 / 25 / 50 / 100) and §6.6 are absent from §5.11. The token issuance / rotation / revocation operations have no §5.11 row even though §6.6.6 cites §5.11 for the role gate ("Org Owner or Org Admin only").
- **D-3.2-021 [P1 plan_gating].** Webhook Endpoint CRUD operations plan-gated per §34.1.1 row "Webhook Endpoints" (1 / 1 / 5 / 25 / 50 / 100), §31.5, and §31 webhook contract authoring are absent from §5.11.
- **D-3.2-022 [P1 plan_gating].** Q&A Threads operations (§14, public buyer-seller Q&A surface during RFP phase) are absent from §5.11. The thread-create / question-post / answer-post / clarification-request / thread-resolve operations have no §5.11 representation despite being a primary §13.7 collaboration surface with role-and-plan-tier gating distinct from Internal Comment Threads.
- **D-3.2-023 [P1 plan_gating].** Promoted Marketplace Placement purchase operations plan-gated per §34.1.2 row "Promoted Marketplace Placements" (— / — / — / — / 1 mo / 3 mo) and §34.16 / §4.4.19 PromotedListing are absent from §5.11. The plan-gated SKU purchase has no §5.11 row even though §27 / §34.16 cite §5.11 for the role gate (line 8712 cites the gate explicitly: "plan gate evaluated at purchase time per Seller Pricing §12 / §5.11 Feature Access Matrix").

### 3.4 Cluster D — Documentation drift (6 defects)

- **D-3.2-024 [P3 documentation_gap].** §13.11.4 line 12605 declares "Authoritative entry registered in §5.11 Feature Access Matrix as row `defense_view` with the gate semantics defined in §13.11.4." §5.11 has rows "Open Defense View" (line 9222) and "Regenerate Defense View" (line 9223). Semantic match, name drift. Citation hygiene only — no behavioral consequence.
- **D-3.2-025 [P3 documentation_gap].** §25.3.16 line 19580 declares "Disqualification … MUST be listed under 'Core Workflows — All Tiers' in §5.11 Feature Access Matrix." §5.11 uses the group label "Vendor Curation & Disqualification (§25.3) — core workflow; available on every buyer plan tier (Free / Solo / Starter / Growth / Scale / Enterprise per §34.1.1)" at line 9185. Group-name drift; semantic content matches.
- **D-3.2-026 [P2 rbac].** §5.11 row "Regenerate Defense View" (line 9223) restricts to `org_owner` ✓; all other roles ✗. §13.11.5 declares the capability `defense_view_generate` as a buyer-console operator capability with `plan_gate_min_tier = buyer_solo`; §13.11.13 AC #17 declares the rate-limit (1 / 5 min / Workspace). The matrix's narrowing to `org_owner` only — when `workspace_owner`, `workspace_admin`, `use_case_lead`, and `reviewer` are all the buyer-console operators who would presentationally trigger regeneration during Phase 12 / 13 — is likely under-permissive vs. the §13.11 design intent. A junior engineer building per §5.11 would block Workspace Owner regeneration; a junior engineer reading §13.11.5 in isolation would allow it. Two readers, two outcomes — the P1/P2 tiebreaker rules in `Audit_Prompts.md → Severity Definitions` resolve this to P2 (ambiguous, not unbuildable).
- **D-3.2-027 [P3 documentation_gap].** §27.2 Marketplace Availability summary table (lines 20933–20939) omits Buyer Solo and Seller Solo rows. The table jumps Free → Starter → Growth → Scale → Enterprise with no Solo row on either side. Per §34.1.3 inclusive-of-Solo rule, Solo cells must be explicit in any plan-tier summary table. Per the §5.11 Notes inline-list-inclusion rule, "(c)" defaults Solo to Free behavior, which means the §27.2 Buyer Solo cell MUST equal the Free cell ("Browse only") and Seller Solo MUST equal the Free cell ("Profile + Capability Declarations visible") — but the table does not state this.
- **D-3.2-028 [P3 documentation_gap].** §5.11 ToC entry at line 354 reads "5.11 Feature Access Matrix (Comprehensive)." The "(Comprehensive)" claim is contradicted by the ~22 missing major-capability rows enumerated in D-3.2-007 through D-3.2-023. Recommendation: either (a) qualify the heading to "(Buyer Console; partial Marketplace / Seller-Console subset)" or (b) author the missing rows to match the claim.
- **D-3.2-029 [P2 rbac].** §5.11 column headers use Title-Case role names ("Org Owner", "Org Admin", "Billing Admin", "Workspace Owner", "Workspace Admin", "Use Case Lead", "Reviewer", "Guest (read_only)", "Guest (contributor)", "Guest (scorer)", "Guest (full_participant)"). §4.3.1 / Appendix J / §5.11 row-text-internal references use canonical lowercase enums (`org_owner`, `org_admin`, `billing_admin`, `workspace_owner`, `workspace_admin`, `use_case_lead`, `reviewer`, `guest`). The convention drift is presentational — the header "Workspace Owner" is universally understood to mean `workspace_owner` — but the spec carries no explicit mapping note ("Title-Case column headers MAP 1:1 to canonical Appendix J `workspace_role_kind` enum values per §4.3.1"). Phase 3.1 D-3.1-006 cites §5.11 as the *canonical* lowercase-enum authority, which the column headers contradict. File P2 (terminology consistency, not implementation-blocking) and resolve in lockstep with D-3.1-006 / D-3.1-013 / D-3.1-017.

## 4. Counterfactual Pass

For each cluster, three realistic failure modes were enumerated and confirmed against the spec.

**Cluster A (structural):**

1. *A junior engineer enforcing both role and plan gates.* Reads §5.11, finds the role gate, ships. Misses the plan gate hidden in §34.1.1 row "Match Scoring (numeric)" → ships a Marketplace surface that exposes numeric Match Scores to Buyer Free customers. Failure mode confirmed by §27.4.1 line 20974 citing §5.11 as the gate home.
2. *A renamed plan tier breaks gating.* If a future commit renames "Business Starter" → "Business Pro Starter", every inline string in §5.11 silently misroutes. The Phase 14.9.1 backlog notes this risk; CI gate `solo_role_grid_inclusion` (§M.5 row 33 / Appendix M.5 catalog) targets the Solo half of the problem only.
3. *A Marketplace operation with no role-overlay column.* The Marketplace search-filter API requires authentication for the EOI submission action only. With no `marketplace_public_reader` / `marketplace_eoi_submitter` column (per Phase 3.1 D-3.1-019), an Ops engineer cannot disambiguate the public-vs-authenticated role gate.

**Cluster B (promised rows missing):**

1. *A QA engineer running the §50 Loss Debrief property test* discovers `seller_pro` does not resolve. Either the test fails (plan gate evaluates undefined) or the test mocks `seller_pro = seller_growth` and ships an entitlement leak.
2. *A Marketplace match-score CI gate* writes a row to PostHog for any view with `render_mode=numeric` on a non-Growth+ plan. The CI gate can't fire because the §5.11 row it watches doesn't exist.
3. *An M5 buyer referral abuse audit* asks "who can issue an M5 invite?" §48.4 says "see §5.11"; §5.11 says nothing. Audit lands in the Ops queue with an unresolved root cause.

**Cluster C (major missing capabilities):**

1. *Buyer Solo customer attempts a Marketplace search-with-capability-filter* on the basis that "Solo unlocks the full surface." The §34.1.1 cell value is "Browse only" (Solo mirrors Free for Marketplace Buyer Access). With no §5.11 row asserting this, support agents and Solo customers will read the inline tier-list strings in §5.11 (which mention Solo for Disqualification but not for Marketplace search) as evidence Solo unlocks more than it does.
2. *Webhook endpoint count exceeded.* Buyer Starter customer creates a sixth webhook endpoint (cap 5 per §34.1.1); the endpoint POST returns 422. The error-code lookup at Appendix I cites a per-endpoint cap; the §5.11 Feature Access Matrix has no row for "Create webhook endpoint" so the customer support narrative has nowhere to land. Engineer adds a §5.11 row in v7.1.1 → defect closed retroactively.
3. *Q&A Thread visibility decision in Phase 9.* A Workspace Admin attempts to mark a vendor Q&A Thread "internal-only" (suppress from vendor view). No §5.11 row exists; the engineer routes the operation through the closest available row ("Internal Comment Thread" — but that's a different surface) and ships the wrong gate.

**Cluster D (documentation drift):**

1. *Auditor reading §13.11 in isolation* sees "row `defense_view`" referenced and grep'd; finds no row literally named `defense_view`; the closest match (`Open Defense View`) is unverifiable as the same row. Audit lands as P1 unbuildable.
2. *§27.2 reader using Solo on Marketplace.* Reader sees a 5-row table that omits Solo; defaults to "Solo unlocks more"; ships a misleading customer-facing CTA.
3. *§5.11 reader on §50 mobile.* Mobile reader sees the `(Comprehensive)` heading; concludes the matrix is exhaustive; doesn't cross-check §22 / §27 / §31 / §50.11; misses 22 rows.

All twelve failure modes are unhandled in the current §5.11; each maps to one or more defects above.

## 5. Self-Challenge Pass (Hostile Reviewer Re-Read)

Re-read all 29 defects as a hostile reviewer. Three revisions applied in place:

- **D-3.2-014** initial draft was P0 entitlement-leak. Hostile reviewer challenged: is `seller_pro` runtime-wired anywhere? Whole-spec grep confirms `seller_pro` appears at exactly one location (line 37744 in §50.11) and is documentation-only — no entitlement check, no §32 endpoint validator, no runtime resolver references it. The runtime resolver consumes Appendix J `seller_plan_tier` enum values; `seller_pro` is not a member. The defect is plan-name-drift documentation, not a runtime gate. Severity demoted P0 → P1 with explicit conditional escalation rule documented in the row text ("If a runtime enforcement path were wired, severity would escalate to P0").
- **D-3.2-026** initial draft was P1 unbuildable. Hostile reviewer challenged: is the §5.11 row actually unbuildable, or is it merely under-permissive vs. design intent? §5.11 row 9223 unambiguously assigns ✓ to `org_owner` only — a junior engineer can build that exact gate. The defect is design-intent ambiguity vs. matrix authority, not unbuildability. Severity demoted P1 → P2 per `Audit_Prompts.md → Severity Definitions` tiebreaker ("default to P1 if a junior engineer would build the wrong thing" — they would build the matrix-correct gate, just possibly tighter than §13.11 intended).
- **D-3.2-027** initial draft was P2 plan_gating. Hostile reviewer challenged: §27.2 omitting Solo rows is a documentation drift, not a plan-gating runtime defect — §34.1.1 / §34.1.2 carry the canonical Solo cell values. The §27.2 table is a summary; per §34.1.3 inclusive-of-Solo rule, Solo defaults match Free. Severity demoted P2 → P3 documentation_gap.

No new defects emerged from the self-challenge pass; no defect rows were dropped.

## 6. Coverage Matrix Updates

Phase 3.2 prescribes per-row tightenings on the `plan_gating` column for every user_capability whose §5.11 representation is missing or whose plan-tier gating is encoded only in the §14.9.1 inline-string backlog. The exhaustive list of FEATURE_INVENTORY rows touched by D-3.2-001 through D-3.2-023 is large (≈ 70 rows); the canonical row-by-row delta is captured in `COVERAGE_MATRIX.md → Phase 3.2 Update (2026-05-04)`.

Highlights (full grid in COVERAGE_MATRIX.md):

- Every Marketplace user_capability (search, filter, EOI, Match Score read, Verification Tier request, Promoted Placement purchase, Featured Placement purchase) → `plan_gating` ⚠ → ❌ (D-3.2-007, -015, -017, -018, -023).
- Every Capability Declaration / KB user_capability (CRUD, Bootstrap, Document Library upload, Page Enrichment) → `plan_gating` ⚠ → ❌ (D-3.2-016, -019).
- Every Webhook Endpoint / API Token user_capability → `plan_gating` ⚠ → ❌ (D-3.2-020, -021).
- Every M2 / M5 / M8 / M9–M13 growth-loop user_capability → `plan_gating` ⚠ → ❌ (D-3.2-009, -010, -011, -012).
- Defense View Regenerate user_capability → `rbac` ✅ → ⚠ (D-3.2-026 likely under-permissive).
- Internal Comment Thread Management user_capability → `plan_gating` ⚠ → ❌ (D-3.2-008).
- Loss Debrief / Seller Template Submission user_capabilities → `plan_gating` ⚠ → ❌ (D-3.2-013, -014).
- §27.2 Marketplace Availability `documentation_gap` recorded but does not promote a column transition.

The `rbac` column on the seller-console role-overlay-affected user_capabilities (Seller Signals, CRM Sync) holds at ⚠ pending D-3.2-004 remediation (column authoring).

## 7. Forwarded to Downstream Phases

- **Phase 3.3 (Auth, Session, Domain, MFA).** Inherits D-3.2-020 (API Token role and plan-tier gating absent from §5.11) for §6.6 cross-check.
- **Phase 4 (Buyer Pipeline & Method).** Inherits D-3.2-008 (Internal Comment Thread Management), D-3.2-009 (M2), D-3.2-010 (M5), D-3.2-022 (Q&A Threads) for §13 / §14 / §25.7 enforcement check.
- **Phase 5 (Seller Pipeline).** Inherits D-3.2-007 (Match Score), D-3.2-015 (Verification Tier), D-3.2-016 (KB operations), D-3.2-019 (Capability Declarations), D-3.2-014 (Seller Template stale tier name) for §22 / §27.10 / §50.11 enforcement check.
- **Phase 6 (Privacy & Residency).** Inherits D-3.2-005 / -006 (Marketplace + Ops console firewalling) for residency-binding cross-check.
- **Phase 8 (API + Webhook).** Inherits D-3.2-020 (API Token CRUD), D-3.2-021 (Webhook Endpoint CRUD), D-3.2-009 (M2 Public Selection Report Link endpoint pairing) for §32 / §31 endpoint role-gate authoring.
- **Phase 9 (Observability).** Inherits D-3.2-013 (Loss Debrief property-test reference) for §51 PostHog taxonomy + property-test wiring.
- **Phase 4b (Billing Admin RBAC) / Phase 14.9.1 (Inline Tier-List Audit).** Inherits D-3.2-002 as the umbrella P1 plan_gating defect tracking the 27-location backlog; D-3.2-027 for the §27.2 Solo-row authoring.
- **Phase 14.18.1 (CI gate runtime wiring).** Inherits D-3.2-001 / D-3.2-003 for the matrix-dimension extension that the `solo_role_grid_inclusion` gate (Appendix M.5 row, currently spec-binding only) ultimately enforces at runtime.

## 8. AE Ledger Cross-Reference

D-3.2-001 (matrix-dimension extension) and D-3.2-004 / -005 / -006 (column authoring for Seller / Marketplace / Ops roles) imply matrix-structure changes that are non-cosmetic. If Engineering elects to land them in v7.1.1, they MUST be filed as Authored Extensions in `_integration/AUTHORED_EXTENSIONS_LEDGER.md` (proposed AE-3.2-001 .. AE-3.2-006 placeholders, owners pending). The ratification gate per the AE Ledger release-gate policy: AE rows ratify before v7.1.1 stamp.

D-3.2-002 (canonical-enum normalization on inline strings) and D-3.2-024 / -025 / -028 (documentation drift) are routine spec-edit work and do not require AE ratification.
