# Phase 3 — UX §3.1–§3.14 + UX_Design_of_Sourcera.md cross-reference Findings

**Run date:** 2026-05-09
**Baseline:** `Sourcera_Master_Spec.md` v7.1.0 (§3.1 line 1755 → §3.14 line 3508)
**Cross-doc:** `UX_Design_of_Sourcera.md` v2.0.0 (§1.4, §2.1–§2.9, §3.1, §11.2)
**Audit prompt:** Phase 3 §3.1–§3.14 walk per `Audit_Prompts.md` Defect Ledger Format

This scratch log promotes confirmed findings into `DEFECT_LEDGER.md`. The 9-check
matrix below is followed by the per-defect block, the self-challenge revision log,
and the counterfactual pass.

---

## Check Matrix

| # | Check | Result | Defect IDs |
|---|---|---|---|
| 1 | Every token defined once in §3 or UX Design | ⚠ partial | (informational only — Master Spec §3.6 declares authoritative; UX §2.9 paired-mirror; cross-doc duplication is policy-managed via `ux_token_drift_check`) |
| 2 | Every interaction pattern has a state catalog | ⚠ partial | D-3UX-019 (§3.10 lacks state-machine table) |
| 3 | Side Peek covers every surface that uses it | ⚠ partial | D-3UX-018 (§3.8 scope omits Scoring Matrix; §38.6.2 includes "Scoring Card (Side Peek)") |
| 4 | Cursor Presence consistent across buyer / seller | ✅ | (§3.9.6 + §3.12.2 firewall rules consistent) |
| 5 | Bulk Action Toolbar covers every multi-select surface | ⚠ partial | D-3UX-012 (§3.10 Scope vs §3.10.4 Action Catalog drift on Scoring Matrix) |
| 6 | Dark Mode parity explicit per surface | ⚠ partial | D-3UX-020 (§3.7.6 per-surface state catalog has no dark-mode column) |
| 7 | Presence & Unread tied to Convex Presence | ✅ | (§3.12.1 explicit) |
| 8 | Principle 9 testable; every surface has Appendix M.1 row | ❌ | D-3UX-001 (§X placeholder); D-3UX-002 (stale forward-refs); D-3UX-004 (§3.6 / §3.7 / §3.8 / §3.10 / §3.11 / §3.7.12 surfaces lack M.1 rows); D-3UX-008 (engine-phase number leak in §3.7.6.2 copy) |
| 9 | Pipeline Surface Compression cites Appendix M.1 | ⚠ partial | D-3UX-015 (§3.14.5 references row "authored under 'Pipeline Surface Compression'" but M.1 has no such labeled row) |

---

## Defects (proposed for promotion)

### D-3UX-001 — `§X` placeholder in §3.13 First-30-Seconds Test cross-reference
- **Severity:** P2
- **Class:** documentation_gap
- **Location:** §3.13 line 3498 + §3.13 cross-references line 3504
- **Evidence:**
  - Line 3498: "Appendix M (Surface/Engine Mapping) is the canonical contract that enforces this principle, and the First-30-Seconds Test (`UX_Design_of_Sourcera.md` §X) is the operational quality gate."
  - Line 3504: "First-30-Seconds Test (`UX_Design_of_Sourcera.md` §X, Phase 14.17) is the operational quality gate."
  - UX §1.4 is the canonical home (UX_Design_of_Sourcera.md lines 67–119).
- **Convention violated:** Master Spec authoring convention §11 (heading anchor / cross-reference resolution); CLAUDE.md §11 (cross-references must resolve).
- **Recommendation:** Replace literal `§X` with `§1.4` in both cited locations.
- **Owner hint:** engineering

### D-3UX-002 — §3.13 "Status of forward references" stale
- **Severity:** P3
- **Class:** consistency_drift
- **Location:** §3.13 line 3500
- **Evidence:** "Status of forward references. Appendix M is authored in Phase 14.2 and the First-30-Seconds Test is authored in Phase 14.17 of the v7.1.0 integration program (`Integration_Prompts_v7.1.md`). Until those phases land, this principle is in force as an authoring constraint but its enforcement artifacts are pending."
- **State of corpus (per CLAUDE.md):** v7.1.0 stamped 2026-04-28; Appendix M present at line 48508; UX §1.4 present at line 67. The forward-reference state described is no longer current.
- **Convention violated:** Master Spec §11 spec-currency; CLAUDE.md §16 v7.1.0 stamp state.
- **Recommendation:** Replace paragraph with: "**Status (v7.1.0 stamped 2026-04-28).** Appendix M (§M.1 / §M.4 / §M.5) and UX §1.4 First-30-Seconds Test are landed; the principle is binding and enforcement artifacts are wired (4 runtime CI gates active per §M.4; 33 spec-binding gates queued for runtime wiring per §M.5)."
- **Owner hint:** engineering

### D-3UX-003 — Side Peek default-width drift (Master Spec 480px vs UX Design v2 §3.1 420px)
- **Severity:** P2 (cross-document drift between §3 and UX Design v2 — per audit prompt classification rule)
- **Class:** consistency_drift
- **Location:** Master Spec §3.8.1 line 2761; UX_Design_of_Sourcera.md §3.1 lines 287–293
- **Evidence:**
  - Master Spec §3.8.1 row "Default width | 480px | Authoritative default per C.111. Wider than UX Summary §3.1's legacy 420px; the 420px reference is superseded and flagged in RECONCILIATION.md for UX-source update."
  - UX Design v2 §3.1 line 287: "[Sidebar] 240px ... [Main Content Area] Fluid (min 600px) ... [Side Peek] 420px (optional)"
  - UX Design v2 §3.1 line 299: "Side Peek (Right, 420px, conditional)"
  - Master Spec acknowledges drift in its own row note but UX Design v2 source was not updated.
- **Convention violated:** CLAUDE.md §2 (Master Spec wins on UI dimensions when there is conflict); single-source-of-truth.
- **Recommendation:** Update UX_Design_of_Sourcera.md §3.1 to 480px in the block diagram on lines 287–293 and in the prose on line 299; cross-reference Master Spec §3.8.1 as the authoritative home for Side Peek dimension tokens; add the row to the v7.1.1 hygiene mechanical pass.
- **Owner hint:** design

### D-3UX-004 — Major §3 surfaces / engine concepts missing from Appendix M.1
- **Severity:** P2
- **Class:** surface_engine_mapping
- **Location:** Appendix M.1 (lines 48518 → end of M.1 table)
- **Evidence:** Walked Appendix M.1 by topical group. Rows present for: `pipeline_stage_id` (line 48525), Presence Record (line 48559), Unread Marker (line 48560), individual entity rows (Workspace, Use Case, Requirement, Score, AIWallet, KB Entry, etc.). **Rows absent or only entity-bound** for the following §3 UX surfaces / engine concepts:
  - **Side Peek** (§3.8). Side Peek is a surface contract (dimensions, persistence in `UserPreferences.side_peek_widths_json`, deep-link `?peek={id}` URL pattern, focus-trap, prev/next navigation cursor). Appendix M.1 mentions Side Peek only inline in entity-row notes (e.g., line 20986 Use Case "Side Peek §3.8 inline tab"); no row binds the Side Peek surface or its `UserPreferences.side_peek_widths_json` engine field.
  - **Bulk Action Toolbar** (§3.10). The toolbar is a cross-surface contract with the `bulk_action_selection_mode` enum (Appendix J), 10,000-row cap, action catalog. No M.1 row.
  - **Dark Mode / `theme_mode`** (§3.11). The `theme_mode` enum is registered in Appendix J (line 47185); the resolution-order rule (User > Org > System) is engine logic; the per-Org default is on `Organization.default_theme_mode` (which is itself missing from §4.2.1 — see D-3UX-010). No M.1 row.
  - **Form & Input Tokens** (§3.6). The token system spans both consoles and Ops Console (§3.6 Scope). No M.1 row binds the token contract.
  - **Loading / Empty / Error State Catalog** (§3.7). Per-surface catalog of states with `page_state_kind` and `page_surface_kind` enums (Appendix J). No M.1 row.
  - **External-Target Clipboard Confirmation Pattern** (§3.7.12). Authored as an Authored Extension; emits `firewall_protected_clipboard_copy_confirmed` audit event; binds to firewall-protected surfaces (Internal Comment Post, Selection Report draft Redlines pane). No M.1 row.
  - **Optimistic Mutation Rollback** (§3.5). Cross-cutting pattern with explicit feature-specific rollback table; interacts with `If-Match` override on inline-edit cells; emits `inline_edit_conflict_rollback` telemetry. No M.1 row.
  - **Presence & Unread** (§3.12). Subsystem contract (Convex reactivity, fanout SLO, mute behavior, marker derivation) goes well beyond the entity-row binding for `PresenceRecord` and `UnreadMarker`. No M.1 row for the subsystem.
- **Convention violated:** Appendix M preamble (line 48510): "Every engine concept that exists anywhere in the corpus has a corresponding row here mapping it to a surface metaphor, **or** an explicit 'internal-only, never surfaced' entry that documents why it stays inside the engine. Adding an engine concept to the spec ... without adding a row to Appendix M in the same change is a CI-gate failure (see Phase 14.18 enforcement)." The eight items above are engine concepts or surface contracts authored in §3 with no corresponding M.1 row.
- **CI gate impact:** `appendix_m_coverage_on_diff` (§M.4) would have flagged the §3 commits at v7.1.0 if the gate had been runtime-wired; the gate is spec-binding only at v7.1.0 (per CLAUDE.md §16). The defect surfaces a v7.1.0 known-issue rather than a v7.1.0 stamp blocker.
- **Recommendation:** Author 8 new Appendix M.1 rows (one per item above). Each row uses the standard 5-column schema: Engine concept | Spec home | Surface metaphor | Hidden from tier(s) | Notes. Group under existing "Architecture & Console Routing" or a new "UX Standards (§3)" thematic banner. The `theme_mode` row should additionally cross-reference the `Organization.default_theme_mode` and `OrganizationPreference.ops_default_theme_mode` fields (which themselves require schema authoring per D-3UX-010).
- **Owner hint:** engineering + design

### D-3UX-005 — §3.7.8 Recovery CTA `contact_support` row inlines Solo-blind tier list
- **Severity:** P2
- **Class:** plan_gating
- **Location:** §3.7.8 line 2656
- **Evidence:** "**contact_support** | Contact Support | Opens §29.9 Support Widget (Zendesk-backed; available on every paid tier — Starter, Growth, Scale, Enterprise — per §34.1 cell **Support**). For Free tier, opens a mailto with `request_id` pre-filled."
- **Convention violated:** `solo_role_grid_inclusion` CI gate (§M.5 line 49002) — every inline plan-tier list string in §5.11 / §34 / §39 / Appendix M MUST be Solo-aware per §34.1.1 / §34.1.2 cell values. §3.7.8 is currently outside the gate's enclosing-section list, but the same Solo-inclusion contract is the rule of the road for v7.1.0 per Phase 14.9.1 27-location backlog. Buyer Solo and Seller Solo are paid tiers (per §34.1) and therefore eligible for Support per the Support cell; the inline list omits them.
- **Recommendation:** Replace with citation: "Opens §29.9 Support Widget (available on every paid tier per §34.1 cell **Support**); on Free tier, opens a mailto with `request_id` pre-filled." Extend `solo_role_grid_inclusion` gate's enclosing-section allowlist to include §3 inline plan-tier strings (or author a sibling gate `inline_plan_tier_list_completeness_section_3`).
- **Owner hint:** engineering

### D-3UX-006 — §3.10.4 Bulk Action Catalog "Triage Queue" SLA-change row inlines Solo-blind tier list
- **Severity:** P2
- **Class:** plan_gating
- **Location:** §3.10.4 line 3064
- **Evidence:** "Triage Queue | Assign to Team, Change Priority, Resolve | Reopen, Change SLA, Export Selected | SLA change (paid tiers only — Starter, Growth, Scale, Enterprise per §34.1)"
- **Convention violated:** Same as D-3UX-005 — `solo_role_grid_inclusion` family of contracts; Solo eligibility for SLA timers per §34.1 cell **SLA timers** is not reflected in the inline list.
- **Recommendation:** Cite §34.1.1 cell **SLA timers** without enumerating tier names: "SLA change (per §34.1.1 / §34.1.2 cell **SLA timers**)".
- **Owner hint:** engineering

### D-3UX-007 — §3.7.6.6 KB error banner copy surfaces engine plan-tier names
- **Severity:** P2
- **Class:** plan_gating + Principle 9 leakage
- **Location:** §3.7.6.6 line 2638
- **Evidence:** "Error (plan-gate, KB over byte quota) | Yellow banner: 'You've reached the Seller Starter KB size limit (see §34.2). Upgrade to Growth to continue indexing.' CTA: `Upgrade`."
- **Convention violated:** §3.13 Principle 9 acid test — engine tier names ("Seller Starter", "Growth") surface verbatim to a panicked first-timer. Per §22.20.7 / `seller_maya_solo_free_copy_string_lint` (§M.5 line 48992), engine tokens like `AIWallet`, `match score number`, etc., are forbidden in Solo / Free copy; the same posture should hold for surfacing plan tier names in user-facing error banners.
- **Recommendation:** Reword to "You've reached your KB size limit (see §34.2). Upgrade to continue indexing." OR template the tier name dynamically from the resolved plan + the next tier above. Add a sibling lint rule `customer_facing_plan_tier_name_lint` that flags inline tier names in user-facing copy outside the §34/§5.11 matrices.
- **Owner hint:** design + engineering

### D-3UX-008 — §3.7.6.2 Matrix empty-state copy leaks engine phase number
- **Severity:** P2
- **Class:** surface_engine_mapping (Principle 9 leakage)
- **Location:** §3.7.6.2 line 2584
- **Evidence:** "Empty (no vendors in Scoring Matrix) | No illustration. Copy: 'No vendors added to this workspace.' Primary CTA: `Add Vendors` (if Phase ≥ 3). If Phase < 3: CTA disabled with tooltip 'Vendor curation begins in Phase 3.'"
- **Convention violated:**
  - §3.13 Principle 9 acid test: a panicked first-timer reading "Phase 3" in 30 seconds will not have learned the 13-phase Sourcera Method vocabulary. The buyer Solo-mode compressed surface (§3.14.1) intentionally maps Phases 4–6 (Vendor Discovery & Outreach, Bidding) to the "Define" step, not "Phase 3".
  - The `pipeline_stage_id` Appendix M.1 row (line 48525) explicitly says "The integer itself is never displayed."
  - Phase ordinal-comparison ("Phase ≥ 3") in surface copy contradicts the spirit of the `workspace_status_canonical_consumer` CI gate (§M.5 line 49039) — even though the gate targets predicate code paths, the surface copy that exposes ordinal phase numbers is the upstream symptom.
- **Recommendation:** Reword the disabled-state tooltip to user-vocabulary: "Vendor curation begins after Setup." For Buyer Team Mode, name the phase from the §10.5 phase title (e.g., "Available in Phase 4 — Vendor Discovery"). For Buyer Solo Mode, the empty state is a Setup-step surface; the CTA disables silently with a Setup-step copy. Add a CI gate `customer_copy_no_engine_phase_ordinal` that flags `Phase ≥ N` / `Phase < N` / `Phase N` in `UX_Design_of_Sourcera.md` and Master Spec §3 prose.
- **Owner hint:** engineering + design

### D-3UX-009 — §3.12 DSAR right-to-erasure timing drift (30 days vs 72 hours)
- **Severity:** P2
- **Class:** numerical_singleton + retention
- **Location:** §3.12.5 line 3405; §3.12.10 line 3462; §3.12.11 AC #13 line 3484
- **Evidence:**
  - §3.12.5: "On DSAR right-to-erasure, the viewing user's markers are hard-deleted within 30 days per §6.8."
  - §3.12.10 row: "DSAR erasure of a user with 10,000+ markers | Hard-delete in batches; retention-job throttled at 5,000 deletes/min. Completes within the §6.8 72-hour DSAR target."
  - §3.12.11 AC #13: "DSAR hard-delete of the viewing user's markers completes within the §6.8 72-hour target."
- **Convention violated:** Authoring Convention #10 (numerical singletons — single authoritative home). Per §40.2 / §6.8 the DSAR right-to-erasure target should resolve to one canonical value; §3.12 carries two conflicting values within the same section.
- **Recommendation:** Resolve §6.8.3 target (likely 72 hours for the high-priority hard-delete path; 30-day window is the GDPR Art. 17 maximum). Normalize §3.12.5 prose to "72 hours" and add the explicit citation to §6.8.3. If the 30-day window is the right number for marker-class objects (with the 72-hour target reserved for primary identity records), document the asymmetry in §6.8.4 cascade rules and pull the §3.12.5 / §3.12.10 / §3.12.11 references into alignment.
- **Owner hint:** security + engineering

### D-3UX-010 — `Organization.default_theme_mode` and `OrganizationPreference.ops_default_theme_mode` referenced but not defined in §4
- **Severity:** P1
- **Class:** data_model
- **Location:** §3.11.1 line 3157; §3.11.6 line 3239; absent from §4.2.1 Organization (lines 3607–3631)
- **Evidence:**
  - §3.11.1 line 3157: "Else Org default from `Organization.default_theme_mode` (if set to `light` or `dark`)."
  - §3.11.1 line 3161: "Org Admins can set the org-level default via Org Settings → Appearance, which becomes the default for users who have not set a user override."
  - §3.11.6 line 3239: "the Ops Console uses `OrganizationPreference.ops_default_theme_mode` (system-managed), not `Organization.default_theme_mode`."
  - §4.2.1 Organization field list (read end-to-end): no `default_theme_mode` field; no `OrganizationPreference` entity authored anywhere in §4.
- **Convention violated:** Authoring Convention #1 (Entity Definition — every entity referenced in prose has a §4 field table; every field has Field | Type | Constraints | Notes; scope isolation declared). The `Organization.default_theme_mode` field and the `OrganizationPreference` entity are referenced by prose but lack engine-side schema, leaving the resolution-order rule (User > Org > System) unbuildable.
- **Recommendation:** Author two changes in a single PR:
  1. Add `default_theme_mode` field to §4.2.1 Organization: `Type: Enum (Appendix J theme_mode); Constraints: nullable; default NULL; Notes: Org-level default rendered when no user override is set; null is treated as system preference resolution per §3.11.1.`
  2. Author `OrganizationPreference` entity in §4.2.x with at minimum `id`, `org_id (FK)`, `ops_default_theme_mode` (Enum theme_mode; system-managed), and the audit / soft-delete blocks per §4.1. Document scope isolation (Org-scoped) and retention. Note the system-managed nature explicitly to gate Org Admin write access at §5.
  3. Add Appendix M.1 row (per D-3UX-004) binding both fields to the `theme_mode` resolution-order surface.
- **Owner hint:** engineering

### D-3UX-011 — §3.11.6 references "Ops Director" role not defined in §5/§50
- **Severity:** P3
- **Class:** rbac + documentation_gap
- **Location:** §3.11.6 line 3236
- **Evidence:** "Ops-role users (`ops_*` role family) get an Org default of `dark` via a system-managed OrganizationPreference (not user-editable directly; Ops Director managed)."
- **Convention violated:** Authoring Convention #11 (heading / role naming consistency). "Ops Director" is not a registered role in the §5 RBAC catalog or §50 Ops Console role family.
- **Recommendation:** Replace "Ops Director" with the canonical Ops role responsible for OrganizationPreference mutation (likely `ops_admin` or a §50.2 role). Cross-reference §5.13 / §50.2 role tables.
- **Owner hint:** ops

### D-3UX-012 — §3.10 Scope vs §3.10.4 Action Catalog drift on Scoring Matrix
- **Severity:** P2
- **Class:** consistency_drift
- **Location:** §3.10 line 3001 (Scope) + §3.10.4 line 3062 (Action Catalog)
- **Evidence:**
  - §3.10 Scope: "Excluded: surfaces where multi-select is semantically meaningless (Scoring Matrix cells — each cell is its own edit target; Selection Report — single-entity surface)."
  - §3.10.4 Action Catalog: "Scoring Matrix (row-level; cells excluded) | Reassign Reviewer, Lock Scores, Unlock Scores | Recompute Pre-Score, Export Selected | —"
- The Scope paragraph excludes "Scoring Matrix cells" but is silent on row-level multi-select; the Action Catalog explicitly documents row-level bulk actions on Scoring Matrix. A reader of Scope alone would conclude Scoring Matrix is wholly excluded.
- **Convention violated:** Authoring Convention #11 (terminology consistency); Scope and Action Catalog must agree on which surfaces are in scope.
- **Recommendation:** Update §3.10 Scope paragraph to "Applies to: Requirements Matrix, ..., Scoring Matrix (row-level only — see §3.10.4), ..., Notification rule list. Excluded: Scoring Matrix cells (each cell is its own edit target), Selection Report (single-entity surface)." Mirror in the Action Catalog row note.
- **Owner hint:** engineering

### D-3UX-013 — §3.1 "Sourcera Constraint" vs §3.4 / §38.7 / §31569 "Linear Constraint" terminology drift
- **Severity:** P3
- **Class:** consistency_drift / glossary
- **Location:** §3 chapter heading line 1753; §3.1 line 1757; §3.4 line 2285 / 2287; §38.7 line 31569
- **Evidence:**
  - §3 chapter heading (line 1753): "# 3\\. UX Standard — The Sourcera Constraint".
  - §3.1 line 1757: "The **Sourcera** **Constraint** is an opinionated UI/UX principle..."
  - §3.4 heading (line 2285): "Mobile Translation of Linear Constraint".
  - §3.4 prose (line 2287): "the Linear Constraint translates keyboard-first patterns to gesture-first equivalents while preserving the 'linear flow' principle".
  - §38.7 (line 31569): "The Linear Constraint (§3.1) is keyboard-first on desktop."
- §38.7 explicitly cites §3.1 as the home of "the Linear Constraint", but §3.1 names the principle "the Sourcera Constraint". Two terms refer to the same principle within the Master Spec.
- **Convention violated:** Authoring Convention #11 (terminology consistency); CLAUDE.md §13 (maintain terminology consistency across the corpus).
- **Recommendation:** Pick one canonical term. The §3 chapter title and §3.1 use "Sourcera Constraint"; §3.4 / §38.7 use "Linear Constraint". Recommend "Linear Constraint" as the term-of-art (more descriptive of the rule itself; "Sourcera Constraint" is a brand-adjacent qualifier). Update §3 chapter title and §3.1 to "Linear Constraint" with a one-line note that the principle is sometimes informally called "the Sourcera Constraint" (or strike that informal name entirely). Add to Appendix K Glossary if not already present.
- **Owner hint:** design + engineering

### D-3UX-014 — §3.9 multi-device hue-assignment behavior unspecified
- **Severity:** P3
- **Class:** documentation_gap
- **Location:** §3.9.2 lines 2900–2907 (Hue Assignment algorithm)
- **Evidence:** "On PresenceRecord insertion, the client requests a hue assignment from the Convex Presence function. The function inspects active PresenceRecords with the same `(org_id, workspace_id | bid_workspace_id)` scope and chooses the lowest-index hue not in use."
- A user with 3 simultaneous device sessions creates 3 PresenceRecords; the algorithm consumes 3 hues. Other teammates see the same person rendered as 3 distinct cursors with distinct initials badges. This is implicitly the intended behavior (§4.3.14 PresenceRecord scoping is per session) but it's not documented.
- **Convention violated:** Edge-case discipline (concurrency / multi-device) per CLAUDE.md §12.
- **Recommendation:** Append to §3.9.2: "Multi-device sessions of the same user consume distinct hues (one per active PresenceRecord). Initials badges are identical for all of the user's sessions; hue distinguishes the device. Avatar-stack roster aggregates the user under a single avatar with a '+N devices' indicator." Add Playwright test `presence_multi_device_hue_distinct`.
- **Owner hint:** engineering

### D-3UX-015 — §3.14.5 Appendix M cross-reference target not present
- **Severity:** P3
- **Class:** consistency_drift / surface_engine_mapping
- **Location:** §3.14.5 line 3584
- **Evidence:**
  - §3.14.5: "Appendix M (Surface/Engine Mapping): authoritative row authored in this phase under 'Pipeline Surface Compression.'"
  - Appendix M.1 walked end-to-end: no row carries the literal label "Pipeline Surface Compression"; the binding lives inside the `pipeline_stage_id` row at line 48525, which explicitly names both renderings (chip ribbon and four-step compressed bar).
  - §M.5 (gate catalog) does carry a "**Phase 14.6 — Pipeline Surface Compression**" header (line 48977), but that's the gate catalog, not the M.1 mapping registry.
- **Convention violated:** Cross-reference resolution (Authoring Convention #11). A reader following §3.14.5 to "Pipeline Surface Compression" in Appendix M will not find a labeled row.
- **Recommendation:** Either (a) add a labeled M.1 row at the top of the Sourcera-Method banner: "Pipeline Surface Compression | §3.14, §M.5 Phase 14.6 gates | The §3.3.1 chip ribbon (Buyer Team) and the §5.2.19 PipelineSurface four-step bar (Buyer Solo + Seller) are the two renderings of `pipeline_stage_id`. | All | Bound by `pipeline_surface_compression_engine_unchanged` and 5 sibling §M.5 gates."; or (b) reword §3.14.5 to "Appendix M.1 — `pipeline_stage_id` row (line 48525) is the authoritative surface/engine mapping; §M.5 Phase 14.6 cluster carries the 6-gate enforcement catalog."
- **Owner hint:** engineering

### D-3UX-016 — §3.7.10 offline-banner detection assumes browser `navigator.onLine`; mobile native unspecified
- **Severity:** P2
- **Class:** mobile_divergence
- **Location:** §3.7.10 line 2680 + §3.7.11 AC #8 line 2691
- **Evidence:**
  - §3.7.10: "When `navigator.onLine` flips to false, a sticky `--color-warning` banner renders at top of the viewport: 'Offline. Changes you make will sync when you reconnect.'"
  - §3.7.11 AC #8: "Offline banner renders within 500ms of `navigator.onLine = false` and suppresses per-page error states while offline; e2e test `offline_banner_suppresses_errors` passes."
- iOS / Android native apps use platform reachability APIs (Reachability, ConnectivityManager / NetworkCallback), not `navigator.onLine`. The 500ms SLO and the suppression contract are unsourced for native-app surfaces.
- **Convention violated:** Edge-case discipline — mobile vs desktop divergence (CLAUDE.md §12).
- **Recommendation:** Append to §3.7.10: "Native mobile apps (iOS, Android) use the platform reachability API (NWPathMonitor on iOS 16+, ConnectivityManager.NetworkCallback on Android API 24+). The 500ms SLO holds across web (`navigator.onLine`), mobile-web (same), and native. The `ui_offline_banner_shown` Appendix G event carries `client_device_class` and `online_signal_source ∈ {browser_online_event, ios_nwpath, android_connectivity_callback}` properties for cross-platform attribution."
- **Owner hint:** engineering

### D-3UX-017 — §3.6 token system value duplication between Master Spec §3.6.1 and UX Design v2 §2.9
- **Severity:** P3
- **Class:** consistency_drift
- **Location:** Master Spec §3.6.1 lines 2355–2384 (~25 tokens); UX Design v2 §2.9 lines 250–275 (~10 tokens)
- **Evidence:** The two locations share token names (`--input-height-sm`, `--input-height-md`, `--input-height-lg`, `--input-padding-x`, `--input-radius`, `--input-bg`, `--input-border-default`, `--input-border-focus`, `--input-border-error`, `--input-bg-disabled`) with identical values. Master Spec §3.6.1 carries roughly 15 additional tokens that UX Design v2 §2.9 does not include.
- **Status:** Master Spec §3.6 declares the §3.6.1 table authoritative; UX Design v2 §2.9 is the paired designer-facing surface. The CI gate `ux_token_drift_check` (§50.17.4) is described as enforcing sync. Cross-doc duplication is therefore policy-managed.
- **Convention violated:** Authoring Convention #10 (numerical singletons — single authoritative home). The values that overlap are duplicated rather than cited.
- **Recommendation:** Either (a) author UX Design v2 §2.9 as a citation block ("All form-control tokens are defined in Master Spec §3.6.1; this section is a designer-facing summary mirrored via the Tokens Studio export and `ux_token_drift_check` CI gate."); or (b) accept the duplication as the documented policy and ensure `ux_token_drift_check` is runtime-active (per CLAUDE.md §16 it currently is). This is hygiene, not a build blocker.
- **Owner hint:** design

### D-3UX-018 — §3.8 Side Peek Scope omits Scoring Matrix despite §38.6.2 row "Scoring Card (Side Peek)"
- **Severity:** P3
- **Class:** consistency_drift
- **Location:** §3.8 Scope line 2755; §38.6.2 line 31487 ("Scoring Card (Side Peek)")
- **Evidence:**
  - §3.8 Scope: "Applies to every list or table surface that exposes an associated detail entity: Requirements Matrix (row → Requirement Detail), Vendor List (row → Vendor Detail), Triage Queue (row → Requirement Detail), Comment Inbox (row → Comment Thread), KB Browser (card → Entry Detail), Ops entity tables, Marketplace Listings (card → Seller/Software page preview)."
  - §38.6.2 line 31487 row: "Scoring Card (Side Peek) | parity | parity | supported | Full-screen on mobile; includes comment thread."
- The §3.8 Scope omits Scoring Matrix entirely (Score Card surface absent), but §38.6.2 documents a Side Peek surface for "Scoring Card". A reader of §3.8 alone would conclude Scoring Matrix has no Side Peek; §38 contradicts.
- **Convention violated:** Authoring Convention #11 (Scope completeness).
- **Recommendation:** Update §3.8 Scope to include "Scoring Matrix (row → Score Detail / Scoring Card per §38.6.2)". Resolve any ambiguity about whether the Score Card peek is row-level (consistent with §3.10.4 row-level Bulk Actions on Scoring Matrix) or cell-level (which would conflict with §3.10 Scope's "cells excluded" rule).
- **Owner hint:** engineering

### D-3UX-019 — §3.10 Bulk Action Toolbar lacks formal state-machine catalog
- **Severity:** P3
- **Class:** state_machine
- **Location:** §3.10 (no state-machine sub-section)
- **Evidence:** §3.10 has §3.10.1 Selection Mechanics (interaction-event table), §3.10.2 Selection Persistence (prose), §3.10.6 Action Dispatch and Progress (prose), §3.10.7 Failure Modes. No table with columns From | To | Trigger | Conditions | Notes documenting the toolbar's selection / dispatch / progress states.
- **Convention violated:** Authoring Convention #5 (State Machines — every state-transition is documented as a table; prose state descriptions are not acceptable).
- **Recommendation:** Author §3.10.x State Machine table with at least the following states: `inactive` (zero selection), `selecting` (≥1 row selected), `selecting_all_in_filter` (Cmd+A pressed; capped at 10K), `dispatching` (action in flight), `paused_network`, `paused_rate_limit`, `partial_failure_segmented`, `complete`. Triggers: row-click, Shift+Click, Cmd+A, Escape, action-click, server response, network-fail, 429. Conditions: `selection_size`, `permission_check`, `idempotency_key`. The §3.10.4 catalog supplies the action enum domain.
- **Owner hint:** engineering

### D-3UX-020 — §3.7.6 Per-Surface Catalog has no dark-mode column
- **Severity:** P3
- **Class:** documentation_gap
- **Location:** §3.7.6.1 → §3.7.6.6 (per-surface state tables)
- **Evidence:** §3.11 Dark Mode is comprehensive at the token level, but §3.7.6 per-surface catalogs (Dashboard, Matrix, Detail, Settings, Ops, KB) declare only `Loading | Empty | Error | Plan-gate` cells. No row enumerates the per-surface dark-mode treatment (e.g., illustration variant, banner color tuning, Ops Console dark-default override). Implementations must cross-reference §3.11 for every surface, which is correct but not codified at the surface-catalog level.
- **Convention violated:** Edge-case discipline (CLAUDE.md §12 — every authored UX catalog should explicitly reflect dark-mode parity for the surfaces it covers).
- **Recommendation:** Add a "Dark-mode treatment" column to each §3.7.6.x table, or author a §3.7.6.7 cross-reference matrix mapping every surface row to its §3.11.2 token block + illustration variant + Ops dark-default override status.
- **Owner hint:** design

---

## Self-Challenge Pass

A hostile staff engineer re-read each defect; revisions logged in place above and summarized here.

- **D-3UX-001** unchanged. Evidence reproducible (line numbers cited); P2 because cross-reference resolution failure makes the principle unbuildable for any new contributor reading §3.13. Could be argued P3 (cosmetic), but the placeholder is a genuine ambiguity, not a typo — kept at P2.
- **D-3UX-002** kept at P3. Strictly hygiene; doesn't change behavior. But surfaces a v7.1.0 stamp-state misalignment; recommend including in v7.1.1 hygiene mechanical pass.
- **D-3UX-003** kept at P2 per the audit prompt's own classification rule ("cross-document drift between §3 and UX Design v2 is P2"). Master Spec is authoritative; UX Design v2 should follow.
- **D-3UX-004** kept at P2. Considered upgrading to P1 (Authoring Convention #12: every UI surface or engine concept has an Appendix M.1 row), but the surfaces are spec'd in §3 with full ACs and state catalogs — the missing artifact is the Appendix M registration, not the surface contract itself. P2 is the rule-bound classification (the registration gap is real but does not make the surface unbuildable).
- **D-3UX-005, D-3UX-006, D-3UX-007** kept as three separate defects rather than one bundled "inline plan-tier list strings in §3" defect, because each instance has distinct line citations and distinct surface impact. The recommendation in each is identical in shape (cite §34.1 cell instead of inlining) but the affected surfaces differ.
- **D-3UX-008** kept at P2. "Phase 3" leak in customer-facing copy is a Principle 9 violation; could argue P1 because a panicked first-timer cannot interpret. Held at P2 because the leak is in a disabled-state tooltip (a low-traffic surface), not a primary CTA label.
- **D-3UX-009** kept at P2. The 30-day vs 72-hour conflict is unbuildable as written (engineering must pick a value); could argue P1. Held at P2 because both values are in §6.8 territory and the resolution is a one-line edit, not a structural authoring effort.
- **D-3UX-010** **upgraded** from initial P2 to P1 in this self-challenge pass. The Organization entity field table in §4.2.1 was read end-to-end; `default_theme_mode` is genuinely absent, not a citation-style elision. The OrganizationPreference entity is referenced but not authored. Per Authoring Convention #1 / §4.1, missing field-level schema is a P1 by rule. Recommendation expanded to require both schema authorings in a single PR.
- **D-3UX-011** kept at P3. "Ops Director" naming is hygiene; the §3.11.6 prose is fundamentally buildable.
- **D-3UX-012** kept at P2. Scope-vs-Catalog drift would surface in implementation review; not a code-level blocker but a real ambiguity.
- **D-3UX-013** kept at P3. Terminology drift; resolution is a search-and-replace.
- **D-3UX-014** kept at P3. Edge case is unhandled but the authoritative resolution is implicit; documenting it is hygiene.
- **D-3UX-015** kept at P3. Cross-reference is loose but the underlying surface contract is authored.
- **D-3UX-016** kept at P2. Mobile native silence on offline detection is a build-time gap; native engineers must invent the integration without authoritative guidance.
- **D-3UX-017** kept at P3. Token duplication is policy-managed via the CI gate.
- **D-3UX-018** kept at P3. Scope omission is real but the §38.6.2 row carries the spec.
- **D-3UX-019** kept at P3. State-machine table is missing but the prose carries enough detail to build against; would tighten to P2 if a junior engineer would build the wrong dispatcher.
- **D-3UX-020** kept at P3. Per-surface dark-mode column is hygiene; §3.11 is the authoritative cross-reference.

---

## Counterfactual Pass

For each in-scope §3 surface, three failure modes were enumerated and checked against the spec's authored handling.

### §3.6 Form & Input Tokens
1. Async validation timeout > 3s — handled (§3.6.7 row 2 → falls back to default state with neutral glyph).
2. IME composition exceeding maxLength — handled (§3.6.7 row 4 → composition allowed to complete, excess trimmed).
3. Concurrent inline-edit conflict — handled (§3.6.7 row 3 → revert + 1000ms red flash + "Apply mine anyway" override).
**Unhandled:** Browser autofill of an SSO email into a non-SSO sign-in form — not addressed beyond the generic "autofill" row. P3, not filed.

### §3.7 Loading / Empty / Error State Catalog
1. Skeleton never resolves — handled (§3.7.9 row 1 → hard timeout + telemetry).
2. Retry storm — handled (§3.7.9 row 2 → debounce + 60s suppression).
3. Offline-triggered empty state — handled (§3.7.9 row 5 → suppressed in favor of offline banner).
**Unhandled:** Native mobile app offline detection (D-3UX-016 filed). Engine-phase number leak in matrix empty-state tooltip (D-3UX-008 filed).

### §3.8 Side Peek
1. Pagination race on open — handled (§3.8.7 row 1).
2. Resize below min via key auto-repeat — handled (§3.8.7 row 2).
3. Console switch with peek open — handled (§3.8.7 row 3).
**Unhandled:** Multi-tab Side Peek on the same surface — what happens if Tab A has Peek open and Tab B's filter mutation removes the row? §3.8.7 row "Row removed from underlying list" handles single-tab. Cross-tab not addressed. P3, not filed (judged out of scope for §3.8).

### §3.9 Cursor Presence
1. Heartbeat lag — handled (§3.9.9 row 1).
2. Hue exhaustion (>8) — handled (§3.9.9 row 2).
3. Convex Presence disconnection — handled (§3.9.9 row 3).
**Unhandled:** Multi-device hue assignment for the same user (D-3UX-014 filed).

### §3.10 Bulk Action Toolbar
1. >10K rows in `all_in_filter` selection — handled (§3.10.7 row 1).
2. Filter change with 500 rows selected — handled (§3.10.7 row 2).
3. Network failure mid-dispatch — handled (§3.10.7 row 3).
**Unhandled:** Race between Cmd+A (`all_in_filter` count snapshot) and other users' concurrent inserts/deletes during dispatch. The §3.10.6 dispatch streams progress per chunk but doesn't address the underlying count drift. Permission revocation is handled; row count drift is not. P3, not filed (judged a corner case below the §3.10 fidelity bar).

### §3.11 Dark Mode
1. Hard-coded hex slips into a component — handled (§3.11.9 row 1).
2. Print artifact in dark mode — handled (§3.11.9 row 4).
3. Custom enterprise brand color failing contrast — handled (§3.11.9 row 5).
**Unhandled:** Org default `default_theme_mode` field referenced but not authored (D-3UX-010 filed).

### §3.12 Presence & Unread
1. Reconnect with stale state — handled (§3.12.10 row 1).
2. Fanout SLO breach — handled (§3.12.10 row 2).
3. Workspace membership revoked with active markers — handled (§3.12.10 row 3).
**Unhandled:** DSAR target conflict (D-3UX-009 filed).

### §3.13 Principle 9
1. New surface ships without First-30-Seconds Test — handled by `first_30_seconds_test_present_on_new_ux_surface` CI gate (§M.5 line 49013).
2. Engine concept introduced without M.1 row — handled by `appendix_m_coverage_on_diff` CI gate (§M.4) — runtime-active.
3. Surface adopts Sourcera-specific vocabulary unintentionally — handled by `appendix_m_no_inline_engine_concepts_in_ux_spec` (UX §1.4.3 cross-reference); status of runtime wiring not confirmed in this audit.
**Unhandled:** `§X` placeholder cross-reference (D-3UX-001 filed); stale status paragraph (D-3UX-002 filed).

### §3.14 Pipeline Surface Compression
1. Engine-side change to a §10 phase definition under a §3.14 surface change label — handled (`pipeline_surface_compression_engine_unchanged`, §M.5 line 48978).
2. Step-to-phase mapping divergence between §3.14.1 / §3.14.2 / §2.8.2 / §22.19.1 — handled (`pipeline_surface_compression_step_to_phase_canonical`, §M.5 line 48979).
3. Hard-gate modal path leaking into Solo-mode soft-gate — handled (`pipeline_surface_compression_soft_gate_solo_only`, §M.5 line 48983).
**Unhandled:** Appendix M.1 cross-reference target ("authored under 'Pipeline Surface Compression'") not present (D-3UX-015 filed).

---

## Promotion Plan

All 20 defects above promote into `DEFECT_LEDGER.md` under the `D-3UX-NNN` mnemonic.
Coverage matrix tightening prescription is appended to `COVERAGE_MATRIX.md` after the
Phase 9.1 block, in the same incremental-update pattern (mechanical apply queued to v7.1.1).

P0: 0 · P1: 1 (D-3UX-010) · P2: 9 · P3: 10 · Total: 20.

---

# Second-Pass Findings (2026-05-10)

**Run date:** 2026-05-10
**Trigger:** Phase 3 audit prompt re-issued. First pass closed at 20 defects (D-3UX-001..020).
This pass is a fresh adversarial walk that adds defects the first pass missed; it does
not re-file confirmed defects and does not supersede prior findings unless explicitly
noted in a defect's `links` field.
**Baseline:** Master Spec v7.1.0 unchanged since the first pass (no v7.1.1 stamp landed).
**Cross-doc:** `UX_Design_of_Sourcera.md` v2.0.0 unchanged.

## Second-Pass Check Matrix Delta

| # | Check | First-pass result | Second-pass refinement | New Defect IDs |
|---|---|---|---|---|
| 1 | Tokens defined once | ⚠ partial | Confirmed; additionally `--input-bg = --color-bg-tertiary` collides with §3.11.2's "Hover, input bg" semantic — input has no hover-fill delta. | (advisory; not filed at P3 — see counterfactual) |
| 2 | Every interaction pattern has a state catalog | ⚠ partial | §3.7.1 page-state machine is rendered as ASCII art, not a `From / To / Trigger / Conditions / Notes` table — Convention #5 violation that the first pass missed. | D-3UX-029 |
| 3 | Side Peek covers every surface that uses it | ⚠ partial | Confirmed (D-3UX-018). Additionally: §3.8.6 "Peek never opens on an empty entity" contradicts §3.8 Scope row "Comment Inbox (row → Comment Thread)" — a thread with zero posts is a valid empty state per §3.7.6.3 but §3.8.6 deems it impossible. | D-3UX-035 |
| 4 | Cursor Presence consistent across buyer / seller | ✅ | Drift surfaced **inside §3** (not buyer/seller): §3.9 observability event names disagree with Appendix G registry (`ui_cursor_presence_joined` vs `ui_cursor_presence_session_joined`; `_left` vs `_session_evicted`; `_palette_wrapped` vs `_hue_wrap_collision_detected`). | D-3UX-024 |
| 5 | Bulk Action Toolbar covers every multi-select surface | ⚠ partial | Confirmed (D-3UX-012). Additionally: Plan-Gated column inlines tier-name shorthand "Scale+", "Enterprise" — same Principle 9 family as D-3UX-005/006/007 but in catalog-table cells, not error copy. Selection thresholds 200 / 500 / 10,000 collide. | D-3UX-027, D-3UX-033 |
| 6 | Dark Mode Parity explicit per surface | ⚠ partial | Confirmed (D-3UX-020). | (no new) |
| 7 | Presence & Unread tied to Convex Presence | ✅ | Strong drift: §4.3.14 PresenceRecord `status` enum is 3-valued (`active / idle / disconnected`) but §3.9.3 / §3.9.4 / §3.12.2 reference `active_idle` as a 4th state. §3.12.2 row explicitly cites `status ∈ {active, active_idle, idle}` — an enum value that is not registered. | D-3UX-022 |
| 8 | Principle 9 testable; every surface has Appendix M.1 row | ❌ | Confirmed (D-3UX-001..004, 008). Additionally: D-3UX-001's `§X` placeholder scope is wider than the first pass captured — at least one more in Appendix M.1 row "First-30-Seconds Test (Phase 14.17)" line 49354 and one in §1.1 line 1334. | D-3UX-039 (extends D-3UX-001) |
| 9 | Pipeline Surface Compression cites Appendix M.1 | ⚠ partial | First-pass D-3UX-015 partially incorrect: a labeled "Pipeline Surface Compression" row IS present in Appendix M.1 at line 49350. The defect is reframed: §3.14 itself is missing Acceptance Criteria, Failure Modes, and Observability subsections (Convention #2 + adjacent). | D-3UX-028 (and D-3UX-015 status note appended) |

## Defects (proposed for promotion)

### D-3UX-021 — `UserPreferences` entity referenced across §3.8 and §3.11 but never defined in §4

- **Severity:** P1
- **Class:** data_model
- **Location:** §3.8.1 line 2765; §3.8.8 AC #1 line 2860; §3.11.1 line 3156; §3.11.1 line 3161
- **Evidence:**
  - §3.8.1 line 2765: "Stored in `UserPreferences.side_peek_widths_json` (§4.2 user-entity field); per-surface keys e.g. `requirements_matrix`, `vendor_list`. LRU cache of 30 most-recent keys; older surfaces revert to 480px default."
  - §3.8.8 AC #1: "user-adjusted width persists per-surface per-user in `UserPreferences.side_peek_widths_json`."
  - §3.11.1 line 3156: "User override from `UserPreferences.theme_mode` (if set to `light` or `dark`)."
  - §3.11.1 line 3161: "Changing the override writes `UserPreferences.theme_mode` and re-applies without reload."
  - Master Spec entity inventory: a grep for `UserPreferences\b` returns four hits — all in §3 prose, none in §4 entity tables. The actual user-preferences entity authored in §4 is `UserUIPreference` (singular, no final `s`) at line 31514, with fields `last_observed_breakpoint_tier`, `sidebar_collapsed_per_tier_json`, `side_peek_width_px_per_tier_json`, `datatable_columns_hidden_per_tier_json` — and it carries neither `side_peek_widths_json` nor `theme_mode`.
- **Convention violated:** Authoring Convention #1 (Entity Definition — every entity referenced in prose has a §4 field table; every field has Field | Type | Constraints | Notes; scope isolation declared). Both the entity and the two fields are referenced but unauthored.
- **Why distinct from D-3UX-010:** D-3UX-010 covers Org-side fields (`Organization.default_theme_mode`, `OrganizationPreference.ops_default_theme_mode`). D-3UX-021 covers User-side fields (`UserPreferences.theme_mode`, `UserPreferences.side_peek_widths_json`). The §3.11.1 resolution-order rule "User > Org > System" is unbuildable on **both** ends; D-3UX-010 covered the Org defaults but missed the User-side fields.
- **Recommendation:** Resolve in a single PR alongside D-3UX-010:
  1. Either (a) rename §3.8.1 / §3.8.8 / §3.11.1 references from `UserPreferences` to the canonical `UserUIPreference`, AND author two new fields on `UserUIPreference`: `theme_mode` (Enum theme_mode; nullable; default NULL) and `side_peek_widths_json` (JSON; per-surface key set per §3.8.1; LRU cap 30); OR (b) author a new `UserPreferences` entity in §4.2.x distinct from `UserUIPreference` with the two referenced fields and document the rationale for two parallel preference entities.
  2. Reconcile with D-3UX-032 below (per-surface vs per-tier persistence).
  3. Add Appendix M.1 row binding both fields to the Side Peek + theme resolution surfaces (per D-3UX-004).
- **Owner hint:** engineering
- **Links:** D-3UX-010 (Org-side mirror); D-3UX-032 (per-surface vs per-tier reconciliation); D-3UX-004 (Appendix M.1 binding).

### D-3UX-022 — `active_idle` cursor state referenced in §3.9 / §3.12 but missing from §4.3.14 PresenceRecord `status` enum

- **Severity:** P1
- **Class:** enum
- **Location:** §4.3.14 PresenceRecord row line 4142; §3.9.3 line 2914; §3.9.4 line 2933; §3.12.2 line 3317
- **Evidence:**
  - §4.3.14 PresenceRecord field table line 4142: `status | Enum | active | idle | disconnected | idle after 10s without heartbeat; disconnected after 30s; evicted after 60s` — three values.
  - §3.9.3 Idle Fade table line 2914: "`active_idle` (3s ≤ heartbeat < 10s) | 80% | Solid | Near-continuous; no visible change for most users." — names a 4th state.
  - §3.9.4 line 2933: "Indicator renders only for cursors with `status = 'active'` or `active_idle`." — predicate references `active_idle`.
  - §3.12.2 Workspace Header Avatar Stack row line 3317: "Data Source: PresenceRecord `status ∈ {active, active_idle, idle}` within `(org_id, workspace_id)`" — explicitly enumerates the missing value as the data-source filter.
- **Convention violated:** Authoring Convention #3 (Enum Registration — every enum value used in §4–§51 is registered in Appendix J; every Appendix J value has at least one consumer). The `active_idle` value has three §3 consumers but is registered neither in §4.3.14's `status` field nor in Appendix J. Engineering would either reject `active_idle` at the data layer (silently mis-classifying ~7s of idle as `active`) or extend the enum without spec authority.
- **Recommendation:** Single-PR resolution:
  1. Update §4.3.14 PresenceRecord `status` field constraint to `active | active_idle | idle | disconnected` and update the Notes column to "`active_idle` after 3s without heartbeat per §3.9.3; `idle` after 10s; `disconnected` after 30s; evicted after 60s."
  2. Register the four-value enum in Appendix J as `presence_session_status` (or co-locate with the existing `status` reference) with consumers cited.
  3. Update the §4.3.14 Convex index `(org_id, workspace_id, status)` documentation to confirm the index covers all four values.
  4. Update `presence_console_firewall` and any related Playwright tests to assert the four-state transition path.
- **Owner hint:** engineering
- **Links:** D-3UX-014 (multi-device hue assignment also touches §3.9.2).

### D-3UX-023 — §3.7.6.2 Matrix empty-state copy names Phase 3 for vendor curation; canonical pipeline puts vendor curation in Phase 4

- **Severity:** P2
- **Class:** consistency_drift
- **Location:** §3.7.6.2 Matrix Surfaces row line 2584
- **Evidence:**
  - §3.7.6.2 line 2584: "Empty (no vendors in Scoring Matrix) | No illustration. Copy: 'No vendors added to this workspace.' Primary CTA: `Add Vendors` (if Phase ≥ 3). If Phase < 3: CTA disabled with tooltip 'Vendor curation begins in Phase 3.'"
  - §10.4 line 11845: "Phase 3: Use Case Definition & Validation".
  - §10.5 line 11898: "Phase 4–5: Vendor Discovery & Outreach".
  - §3.14.1 Buyer Solo step-to-phase mapping table line 3522 places Phase 3 (Use Case Definition & Validation) in the **Setup** step and Phases 4–5 (Vendor Discovery & Outreach) in the **Define** step.
  - Appendix M.1 confirms: Phase 3 row at line 49350-prefix says "Buyer Team: 'Group requirements into use cases' / Use Case grouping panel"; Phase 4–5 row says "'Find vendors' + 'Invite vendors to bid'".
- **Convention violated:** Authoring Convention #11 (terminology / cross-reference consistency) and substantive correctness. The tooltip is FACTUALLY WRONG — vendor curation begins in Phase 4 (Vendor Discovery & Outreach), not Phase 3 (Use Case Definition). The condition `(if Phase ≥ 3)` is also wrong; it should be `(if Phase ≥ 4)` to align with the engine. This compounds D-3UX-008 (Principle 9 leakage) with substantive incorrectness.
- **Why distinct from D-3UX-008:** D-3UX-008 named the Principle 9 issue (engine phase ordinal in surface copy). D-3UX-023 is the engineering-correctness defect that even a non-Principle-9 reading would reject — the tooltip would mislead a Buyer Team-Mode reader (who DOES see phase numbers per §3.3.1) about WHEN vendor curation actually begins.
- **Recommendation:** Two changes in the same PR as D-3UX-008's remediation:
  1. Replace the gating predicate with the canonical step boundary: `(if step ≥ Define)` (Buyer Solo) / `(if Phase ≥ 4)` (Buyer Team).
  2. Replace the disabled-state tooltip per D-3UX-008's remediation; the Buyer Team variant should read "Available in Phase 4 — Vendor Discovery" (matching §10.5 phase title) and the Buyer Solo variant per the §3.14.1 step labels.
- **Owner hint:** engineering + design
- **Links:** D-3UX-008 (Principle 9 leakage at the same line).

### D-3UX-024 — §3 Observability event lists drift from Appendix G registered names

- **Severity:** P2
- **Class:** observability
- **Location:** §3.7.1 line 2500; §3.7.9 lines 2669–2670; §3.9.10 Observability line 2993; §3.10.8 Observability line 3140
- **Evidence:**
  - §3.7.1 line 2500: "The state-manager hook MUST emit telemetry `ui_page_state_changed`" — but Appendix G (lines 17–18 of the §3.6–§3.11 family registry) carries **two** events: `ui_page_state_entered` and `ui_page_state_exited`. The single-event name `ui_page_state_changed` is not registered.
  - §3.7.9 line 2670: "Telemetry `ui_retry_storm_suppressed`" — Appendix G registers `ui_page_state_retry_storm_suppressed` (with the `ui_page_state_` prefix). The shorter name is not registered.
  - §3.9.10 line 2993: enumerates `ui_cursor_presence_joined`, `ui_cursor_presence_left`, `ui_cursor_presence_palette_wrapped`. Appendix G registers `ui_cursor_presence_session_joined`, `ui_cursor_presence_session_evicted` (NOT `_left`), `ui_cursor_presence_hue_wrap_collision_detected` (NOT `_palette_wrapped`). Three name mismatches in one §3.9.10 list.
  - §3.10.8 line 3140 enumerates `ui_bulk_action_completed`, `ui_bulk_action_cancelled`, `ui_bulk_action_destructive_confirm_shown`. Appendix G's bulk-action family carries `ui_bulk_action_dispatched`, `ui_bulk_action_progress`, `ui_bulk_action_pagination_persistence_resolved`, `ui_bulk_action_cap_breach_warned`, `ui_bulk_action_all_in_filter_selected`, `ui_bulk_action_shift_range_expanded`, `ui_bulk_action_selection_cleared` — none of the three §3.10.8-named events match.
- **Convention violated:** Authoring Convention #11 (terminology consistency); CLAUDE.md §13 (terminology consistency across the corpus). §3 sections are the spec home for behavior; Appendix G is the canonical registry for emitted events. When the two disagree, engineering would either (a) emit the §3 names and fail Appendix G coverage CI, or (b) emit the Appendix G names and fail §3 acceptance criteria that reference the §3 names.
- **Recommendation:** Reconcile in a one-PR mechanical pass:
  1. Audit every "Observability" subsection in §3.6 → §3.12 against Appendix G entries.
  2. For each mismatch, prefer the Appendix G name (canonical registry) and update the §3 prose to cite it.
  3. For the §3.7.1 single-event drift (`ui_page_state_changed` vs the two `_entered` / `_exited` Appendix G events), update §3.7.1 prose to "MUST emit `ui_page_state_entered` and `ui_page_state_exited` (Appendix G) on every transition" and update §3.7.6 max-duration text to specify which event carries the timeout signal.
  4. Add a §M.5 spec-binding gate `appendix_g_event_name_canonicality` that fails CI if any §3 prose names an event not present in Appendix G.
- **Owner hint:** engineering
- **Links:** —

### D-3UX-025 — §3.7.10 Connectivity & Offline Signaling pattern emits no observability event

- **Severity:** P2
- **Class:** observability
- **Location:** §3.7.10 line 2680; §3.7.11 AC #8 line 2691; Appendix G `ops_surface` event family lines 43820+
- **Evidence:**
  - §3.7.10 authors the global offline banner ("Offline. Changes you make will sync when you reconnect.") plus the success-toast on reconnect ("Back online — syncing (N pending changes)."). No `ui_*` event is named in the section.
  - §3.7.11 AC #8 references e2e test `offline_banner_suppresses_errors` but no telemetry event.
  - Appendix G lines 43820+ (`§3.6–§3.11 Authoring Pass`) registers no event for the offline banner. Searching Master Spec for `ui_offline_banner` returns only references inside D-3UX-016's recommendation prose.
- **Convention violated:** Authoring Convention (observability discipline implicit across §3 — every authored UX behavior with a measurable trigger emits an Appendix G event; cf. §3.6 / §3.7 / §3.8 / §3.9 / §3.10 / §3.11 / §3.12 each carry an Observability subsection). §3.7.10's behavior is observable (banner shown, banner dismissed, pending-change count) and quality-monitorable (false-positive rate of `navigator.onLine`) but emits no event.
- **Recommendation:** Author two events in Appendix G `ops_surface` family and back-cite from §3.7.10:
  - `ui_offline_banner_shown` — emitted when the banner first renders. Properties: `surface`, `page_surface_kind`, `online_signal_source ∈ {browser_online_event, ios_nwpath, android_connectivity_callback}` (per D-3UX-016), `time_since_last_online_ms`.
  - `ui_offline_banner_dismissed` — emitted on reconnect. Properties: `surface`, `page_surface_kind`, `pending_changes_count`, `offline_duration_ms`, `dismiss_reason ∈ {online_event, manual_user_dismiss}`.
- **Owner hint:** engineering + analytics
- **Links:** D-3UX-016 (mobile-divergence root for `online_signal_source`).

### D-3UX-026 — §3.12.2 Avatar-stack max (5) conflicts with §3.12.6 (≤ 20) and §3.9.1 (≤ 8 cursors)

- **Severity:** P2
- **Class:** numerical_singleton
- **Location:** §3.12.2 row line 3317; §3.12.6 row line 3412; §3.9.1 row line 2894; §3.12.11 AC #1 line 3472
- **Evidence:**
  - §3.12.2 line 3317 row "Workspace Header Avatar Stack | Up to 5 overlapping avatars + '+N more' chip".
  - §3.12.6 line 3412 row "Reactive-query fanout | ≤ 8 rendered cursors per surface; ≤ 20 avatars in stack".
  - §3.9.1 row line 2894 (cursors) — implicit max 8 via the 8-hue palette (§3.9.2).
  - §3.12.11 AC #1: "Workspace Header Avatar Stack renders up to 5 overlapping avatars with '+N more' chip" — restates §3.12.2's 5.
- **Convention violated:** Authoring Convention #10 (numerical singletons — single authoritative home). Three different avatar / cursor caps in adjacent sections without a unifying rule. A reader reasonably concludes the avatar stack contract is 5 (per §3.12.2 + AC #1) **or** 20 (per §3.12.6); the values cannot both be true.
- **Recommendation:** Resolve §3.12.2 vs §3.12.6 to one canonical rule. Likely intent: 5 = visible overlapping avatars in the header chip strip; 20 = maximum length of the popover roster (full list expansion). If so, §3.12.2 should add the popover row and §3.12.6 should clarify "20 avatars in popover roster, 5 in header chip strip". Update §3.12.11 AC #1 to assert both bounds.
- **Owner hint:** engineering + design
- **Links:** —

### D-3UX-027 — §3.10.4 Plan-Gated column inlines tier-name shorthand "Scale+" / "Enterprise" — Principle 9 family violation

- **Severity:** P2
- **Class:** plan_gating
- **Location:** §3.10.4 line 3061; line 3063; line 3069
- **Evidence:**
  - §3.10.4 line 3061 row "Requirements Matrix | … | Export (Scale+), AI Summary (Scale+)".
  - §3.10.4 line 3063 row "Vendor List | … | Merge (Enterprise)".
  - §3.10.4 line 3069 row "SellerSoftware List | … | Transfer (Enterprise)".
- **Convention violated:** Same `solo_role_grid_inclusion` / Principle 9 family as D-3UX-005 / D-3UX-006 / D-3UX-007 — inline tier-name shorthand surfaces engine plan-tier names without §34.1 cell-citation discipline AND omits Solo. The defect is in a catalog-table column rather than user-facing copy, but the underlying contract is identical: every plan-tier list must cite §34.1 cells, never enumerate tier names.
- **Recommendation:** Replace each Plan-Gated cell with a `§34.1.1` / `§34.1.2` cell-citation: "Export (per §34.1.1 cell **Bulk Export**)", "AI Summary (per §34.1.1 cell **AI Bulk Summary**)", "Merge (per §34.1.1 cell **Vendor Merge**)", "Transfer (per §34.1.2 cell **Software Ownership Transfer**)". Extend the §3 inline plan-tier-list lint scope to include `§3.10.4` table cells (currently the gate's allowlist only addresses prose strings in §5.11 / §34 / §39 / Appendix M).
- **Owner hint:** engineering + pricing
- **Links:** D-3UX-005, D-3UX-006, D-3UX-007 (same family, different surface).

### D-3UX-028 — §3.14 Pipeline Surface Compression has no Acceptance Criteria, no Failure Modes, no Observability sections

- **Severity:** P1
- **Class:** acceptance_criteria
- **Location:** §3.14 (lines 3508 → 3585; ends at §3.14.5 Cross-References)
- **Evidence:**
  - §3.14.1 (Compression Contract — Buyer), §3.14.2 (Compression Contract — Seller), §3.14.3 (Interaction Patterns), §3.14.4 (Engine-vs.-Surface Invariants — 6 named CI gates), §3.14.5 (Cross-References).
  - No §3.14.6 / §3.14.7 / §3.14.8 with Acceptance Criteria, Failure Modes (Counterfactual Pass), or Observability subsections.
  - Comparison: §3.6, §3.7, §3.8, §3.9, §3.10, §3.11, §3.12 all carry the trio (AC + Failure Modes + Observability). §3.14 is the only major §3 sub-section that omits all three.
  - §3.14.4 enumerates 6 CI-gate identifiers that "are enforced by a CI gate authored in Phase 14.18" — but no testable acceptance criteria mapping observable input → observable output → measurable threshold (per Convention #2, mirroring §13.10 / §14.9 / §17.8 / §20.7 style).
- **Convention violated:** Authoring Convention #2 (Acceptance Criteria — every new feature ends with numbered, testable acceptance criteria). Engineering cannot assemble e2e coverage from §3.14 as written; CI gates are spec-binding contracts but they verify rendering invariants, not user-observable behavior (e.g., "Step transition motion respects `prefers-reduced-motion`", "Soft-gate toast emits `phase_advanced_with_unmet_gates` audit event with the right payload", "Mobile bottom-sheet renders the step's CTAs after tap").
- **Recommendation:** Author three new subsections at §3.14 fidelity:
  1. **§3.14.6 Failure Modes (Counterfactual Pass).** Cover at minimum: (a) engine advances past two step boundaries in a single transaction (e.g., bulk-skip from Setup to Score); (b) `evaluation_owner_mode` toggled `team → solo` mid-evaluation while the engine is in Phase 7 (Score step); (c) Defense View entry CTA clicked before `pipeline_stage_id ≥ 12` on a flaky network; (d) tooltip suppression on mobile when the user taps a step on `mobile_xs`; (e) reduced-motion engaged mid-step-transition; (f) Console Bridge projection delay leaves the seller-side `pipeline_stage_id` stale relative to the buyer.
  2. **§3.14.7 Acceptance Criteria.** ≥ 12 numbered criteria covering: step-click navigation, soft-gate toast emission, hard-gate retention in Team Mode, mobile bottom-sheet content, tooltip content, dark-mode parity, motion behavior, plan-gated step-content rendering, Defense View binding, Bid Submission binding, KB-compounding offer binding, audit event emission.
  3. **§3.14.8 Observability.** Register events: `ui_pipeline_step_clicked` (with `step`, `console`, `current_phase`), `ui_pipeline_step_transition_animated` (with `from_step`, `to_step`, `boundary_crossed`), `ui_pipeline_soft_gate_skip_chosen` (with `unmet_gates`), `ui_pipeline_step_tooltip_shown` (with `step`, `device_class`).
- **Owner hint:** engineering + design
- **Links:** D-3UX-015 status note (the §3.14 → Appendix M.1 cross-reference is more rebuttable now that the M.1 row is confirmed present — see D-3UX-015 reframing below).

### D-3UX-029 — §3.7.1 page-state state machine rendered as ASCII art, not a `From / To / Trigger / Conditions / Notes` table

- **Severity:** P2
- **Class:** state_machine
- **Location:** §3.7.1 lines 2491–2498
- **Evidence:** §3.7.1 lines 2491–2498 author the page-state machine inside a fenced code block:
  ```
  (mount) → loading → ready | empty | error | partial
  loading → (no upward transition; loading is a leaf transient)
  partial → ready | error
  ready → loading (refetch) → ready
  empty → loading (user action triggers data) → ready | empty
  error → loading (retry) → ready | error
  ```
  - No `From | To | Trigger | Conditions | Notes` table is present anywhere in §3.7.
  - The five-value `page_state_kind` enum (Appendix J) explicitly carries five values; the ASCII art makes the partial-state preconditions implicit and the `loading → empty` transition is missing entirely (the catalog row "(mount) → … → empty" implies a direct loading-to-empty transition that the second line "loading → (no upward transition; loading is a leaf transient)" appears to forbid).
- **Convention violated:** Authoring Convention #5 (State Machines — every state-transition is documented as a table; prose state descriptions are not acceptable). ASCII art is worse than prose — it loses the Conditions and Notes columns entirely.
- **Recommendation:** Replace the code-block ASCII art with a `From | To | Trigger | Conditions | Notes` table covering all 20 transitions (5 states × 4 destinations). Resolve the `loading → empty` ambiguity in the table. Cross-reference Appendix L state machines for stylistic precedent.
- **Owner hint:** engineering
- **Links:** D-3UX-019 (sibling state-machine gap in §3.10).

### D-3UX-030 — §3.14.3 #5 Mobile rendering step-initial labels reuse the same character within one console (Buyer "S/D/S/D"; Seller "R/D/R/S")

- **Severity:** P2
- **Class:** mobile_divergence + accessibility
- **Location:** §3.14.3 #5 line 3552
- **Evidence:**
  - §3.14.3 #5: "the active step's label in full and the other steps as truncated initials (S / D / S / D for Buyer; R / D / R / S for Seller)".
  - Buyer step labels per §3.14.1: Setup → Define → Score → Decide. Initials S, D, S, D — Setup vs Score collide; Define vs Decide collide.
  - Seller step labels per §3.14.2: Receive → Draft → Review → Submit. Initials R, D, R, S — Receive vs Review collide.
- **Convention violated:** Edge-case discipline (mobile vs desktop divergence) and accessibility (screen-reader narration loses identity when the same one-character label is reused). A first-timer on `mobile_xs` who taps the second "S" expects Setup but lands on Score.
- **Recommendation:** Choose one of:
  1. Use 2-letter initials: Buyer "Se / De / Sc / De" — wait, "De" still collides. Use "St / Df / Sc / Dc" (or similar disambiguating initials). Seller "Rc / Df / Rv / Sb".
  2. Drop initials entirely on `mobile_xs` and use numbered pills (Step 1 / 2 / 3 / 4); the active step still shows the full label.
  3. Use icons + active label (e.g., setup gear icon, define funnel icon, score grade icon, decide trophy icon) — more screen-reader-discoverable than ambiguous initials.
  Authoring should pick one and update §3.14.3 #5 + add an §3.14.6 acceptance criterion "Mobile step initials are pairwise distinct within a console" enforced by Playwright on `mobile_xs`.
- **Owner hint:** design + engineering
- **Links:** D-3UX-028 (missing §3.14 AC).

### D-3UX-031 — §3.8.8 AC #2 Side Peek width clamp `[360, 640]` omits `desktop_xl` 720px max from §3.8.1

- **Severity:** P2
- **Class:** acceptance_criteria
- **Location:** §3.8.1 line 2763 (Max width row); §3.8.8 AC #2 line 2861
- **Evidence:**
  - §3.8.1 Max width row: "640px on `desktop` tier (1024 ≤ w < 1280); **720px on `desktop_xl` tier (≥ 1280)**".
  - §3.8.8 AC #2: "Width is clamped to [360, 640]; attempts beyond either bound snap to the nearest bound and emit a single toast."
  - The AC's hard-coded upper bound 640 contradicts the §3.8.1 dimensional rule on `desktop_xl`. An e2e test asserting AC #2 would fail a legitimate 720px Peek on a 1280×… display.
- **Convention violated:** Authoring Convention #2 (Acceptance Criteria — observable, measurable, scope-bound). The criterion is not scope-bound to tier; the max bound is a function of `responsive_breakpoint_tier` per §3.8.1 and `UserUIPreference.side_peek_width_px_per_tier_json` constraint `value ∈ [360, 720]` per line 31518.
- **Recommendation:** Update AC #2 to: "Width is clamped to `[360, tier_max]` where `tier_max = 640` on `responsive_breakpoint_tier=desktop` and `tier_max = 720` on `responsive_breakpoint_tier=desktop_xl`; attempts beyond either bound snap to the nearest bound and emit a single toast. Playwright `side_peek_width_clamp_per_tier` runs the assertion against both `desktop` (1200px) and `desktop_xl` (1440px) viewports."
- **Owner hint:** engineering
- **Links:** D-3UX-032 (per-tier vs per-surface persistence drift).

### D-3UX-032 — §3.8.1 documents two distinct persistence stores for Side Peek width with no reconciliation rule

- **Severity:** P2
- **Class:** consistency_drift
- **Location:** §3.8.1 Max width row line 2763; Persisted preference row line 2765; §38.6 `UserUIPreference` field table line 31518
- **Evidence:**
  - §3.8.1 line 2763 row references `UserUIPreference.side_peek_width_px_per_tier_json` (key set = `responsive_breakpoint_tier`; per-tier persistence; one width per tier).
  - §3.8.1 line 2765 row references `UserPreferences.side_peek_widths_json` (per-surface keys e.g. `requirements_matrix`, `vendor_list`; LRU 30; per-surface persistence; one width per surface).
  - The two storage descriptions disagree on the partition: per-tier vs per-surface. They also disagree on the entity (D-3UX-021).
  - No spec text reconciles whether Side Peek width is a function of (tier), (surface), (tier, surface), or both stored independently with one winning at resolution time.
- **Convention violated:** Authoring Convention #1 (Entity Definition + scope isolation) + Authoring Convention #11 (consistency).
- **Recommendation:** Decide one of three resolutions and author it as a single field:
  1. **Per-tier only.** Use `UserUIPreference.side_peek_width_px_per_tier_json` (already authored at line 31518). Drop the `UserPreferences.side_peek_widths_json` reference. Side Peek width is a function of tier; surfaces share the tier's width. Simplest.
  2. **Per-surface only.** Author `side_peek_widths_per_surface_json` on `UserUIPreference` (or the canonical user-preferences entity per D-3UX-021) and drop the per-tier field. Width is a function of surface; tier is irrelevant.
  3. **Per-(surface, tier).** Replace both fields with a single `side_peek_widths_per_surface_per_tier_json` keyed by the tuple `(surface, tier)`. Most flexible; highest persistence-volume impact.
  In all three, update §3.8.1 to one row, update §3.8.8 AC, update Appendix M.1 row (per D-3UX-004) to the resolved single field name.
- **Owner hint:** engineering + design
- **Links:** D-3UX-021 (`UserPreferences` entity name); D-3UX-031 (tier-aware AC).

### D-3UX-033 — §3.7.6.2 / §3.7.6.6 plan-gate rows omit the secondary "Request Upgrade from Billing Admin" CTA contracted in §3.7.4

- **Severity:** P2
- **Class:** consistency_drift
- **Location:** §3.7.4 line 2543; §3.7.6.2 plan-gate row line 2588; §3.7.6.6 plan-gate row line 2638
- **Evidence:**
  - §3.7.4 contract: "Plan-gate errors (402 / `feature_not_entitled`) are distinguished with a yellow banner (not red), primary CTA 'Upgrade', secondary CTA 'Request Upgrade from Billing Admin'."
  - §3.7.6.2 line 2588 row: "Banner (yellow) at top: 'This workspace contains more requirements than your plan allows. Upgrade to view all.' CTA: `Upgrade`. Matrix renders first N rows (see §39)." — single CTA only.
  - §3.7.6.6 line 2638 row: "Yellow banner: 'You've reached the Seller Starter KB size limit (see §34.2). Upgrade to Growth to continue indexing.' CTA: `Upgrade`." — single CTA only.
  - No row in the §3.7.6 catalog applies the secondary "Request Upgrade from Billing Admin" CTA. A non-Billing-Admin viewer (most viewers) hits a dead-end on Upgrade per §34.10 (only Billing Admin can self-serve upgrade).
- **Convention violated:** Authoring Convention #11 (catalog rows must honor the umbrella contract they implement).
- **Recommendation:** Append the secondary CTA to every plan-gate catalog row in §3.7.6. Add a §3.7.6 footnote: "All plan-gate rows MUST honor the §3.7.4 dual-CTA contract (`Upgrade` primary + `Request Upgrade from Billing Admin` secondary) regardless of the row's specific copy." Add an audit script `plan_gate_row_dual_cta_coverage` to §50.17.4.
- **Owner hint:** engineering + design + pricing
- **Links:** D-3UX-007 (KB error banner is in the same row family).

### D-3UX-034 — §3.10 selection-size thresholds 200 / 500 / 10,000 collide across §3.10.1 and §3.10.6 with no precedence rule

- **Severity:** P2
- **Class:** consistency_drift
- **Location:** §3.10.1 line 3017; §3.10.6 line 3104; line 3105
- **Evidence:**
  - §3.10.1 line 3017: "`all_in_filter` selections cap at **10,000 rows** per bulk action … Individual selections (non-Cmd+A) are uncapped but surface a warning at 500 rows: 'Selecting more than 500 rows may slow actions. Consider narrowing your filter.'"
  - §3.10.6 line 3104: "Client sends one bulk action request with the row-ID list (≤ 500) or filter expression + selection_mode (`all_in_filter`)."
  - §3.10.6 line 3105: "Server executes in chunks of 200 rows; progress streamed back as an SSE or Convex subscription."
  - The three numbers conflict in semantics: 500 is both a soft warning (§3.10.1) and a hard request-payload cap (§3.10.6). What happens on a 600-row visible_only selection? The user is warned at 500 (§3.10.1) but cannot dispatch a 600-row request (§3.10.6 caps at 500). Does the client auto-elevate to all_in_filter? Does the dispatch fail? Spec is silent.
- **Convention violated:** Authoring Convention #11 (consistency); Authoring Convention #10 (numerical singletons — these three numbers should resolve from §39 Object Size Constraints with one citation per usage).
- **Recommendation:** Resolve in two parts:
  1. Promote the three thresholds to §39 Object Size Constraints as `bulk_action_chunk_size_max` (200), `bulk_action_request_row_list_cap` (500), `bulk_action_all_in_filter_cap` (10,000).
  2. Author the precedence rule in §3.10.1 / §3.10.6: "When a `visible_only` selection exceeds the §39 `bulk_action_request_row_list_cap`, the client offers a one-click 'Switch to all-in-filter' affordance with the equivalent filter expression; cancel returns to the unsubmitted selection. The dispatch never silently elevates."
  3. Add §3.10.7 failure-mode row "User selects > 500 rows in `visible_only`" with the authored handling.
- **Owner hint:** engineering
- **Links:** —

### D-3UX-035 — §3.7.10 global offline banner suppresses per-page errors but §3.5 specifies a per-mutation persistent banner — precedence undefined

- **Severity:** P2
- **Class:** consistency_drift
- **Location:** §3.7.10 line 2680; §3.5 step 7 lines 2327–2331
- **Evidence:**
  - §3.7.10: "[the offline banner] is rendered by the global App Shell, not per-page, and suppresses per-page error states during the offline window."
  - §3.5 Failure Path (Network Error), step 7: "UI keeps optimistic change visible. Persistent banner appears at top: 'Offline. Changes will sync when online. [Retry] [Discard]' If Retry: attempt save when connection restored (automatic). If Discard: revert change and remove banner."
  - Two banners: a global App Shell banner (§3.7.10) and a per-mutation persistent banner (§3.5 step 7). §3.7.10 says the global banner suppresses per-page errors during the offline window — but §3.5 step 7's banner is a per-mutation surface (queued mutation context, Retry / Discard CTAs), not a per-page error state. Engineering would either render both (visually noisy, redundant) or honor §3.7.10's suppression and lose the per-mutation Retry / Discard affordances.
- **Convention violated:** Authoring Convention #11 (cross-section consistency).
- **Recommendation:** Author the precedence rule in §3.7.10:
  - During the global offline window, §3.5's per-mutation banner is suppressed; queued mutations display in a single aggregated counter inside the global banner ("N pending changes — will sync on reconnect").
  - On reconnect, the success-toast names the dispatched count and any failures are surfaced inline per §3.5 (per-mutation Retry / Discard) at that point.
  - Update §3.5 Failure Path (Network Error) to cite §3.7.10 as the umbrella offline-state owner and reference the §3.7.10 success-toast for reconnect copy.
- **Owner hint:** engineering + design
- **Links:** D-3UX-016 (mobile reachability source feeds the global banner).

### D-3UX-036 — §3.5 Optimistic Mutation Rollback feature-specific table covers 7 features; §3.3 enumerates ~30 features

- **Severity:** P3
- **Class:** documentation_gap
- **Location:** §3.5 Feature-Specific Rollback Behavior table lines 2335–2343
- **Evidence:**
  - §3.5 table covers: Create Requirement, Edit Requirement, Delete Requirement, Score Requirement (FM), Score Requirement (PM), Add Comment, Submit Bid Response. Seven features.
  - §3.3 enumerates many more features with optimistic-mutation behavior in their primary-pattern row, including but not limited to: Edit Use Case, Delete Use Case, Reorder Requirements, Score Requirement (EJ), Add Score Note, View Vendor Response, Edit Vendor Response (Seller), Compare Vendor Responses, View Score History, Lock Score, AI Scoring Suggestion, Intelligent Summary, Discrepancy Detection, Live Presence, Mention Notification, Manage Seller Capabilities, Manage Team Members, Manage Workspace Guests, Configure Workspace Scoring Model, Export Evaluation, Audit Log.
  - 22+ features authored without rollback contract in §3.5.
- **Convention violated:** Authoring Convention #11 (catalog completeness — every feature consuming the optimistic-mutation pattern has a §3.5 row).
- **Recommendation:** Either (a) extend the §3.5 table to cover every §3.3 feature with optimistic-mutation behavior; or (b) author a §3.5 default-rollback policy ("All optimistic mutations not enumerated below default to the validation-error / network-error / concurrency-conflict pathways per the umbrella behavior in §3.5"), and limit the table to the override cases where default behavior diverges. Option (b) is lighter-weight and more maintainable.
- **Owner hint:** engineering + design
- **Links:** —

---

## Self-Challenge Pass (Second Pass)

A hostile staff engineer re-read each of D-3UX-021 → D-3UX-036:

- **D-3UX-021 (P1):** Considered downgrading to P2 because the entity name `UserPreferences` could be charitably read as shorthand for `UserUIPreference`. Held at P1 because (a) §3.11.1 references a `theme_mode` field that does not exist on either entity (vs. just an entity-name alias), and (b) §3.8.8 AC #1 names `side_peek_widths_json` which is not on `UserUIPreference`. The fields are missing, not just the entity. P1 by Convention #1 rule (missing field-level schema).
- **D-3UX-022 (P1):** Considered downgrading to P2. Held at P1 because the `active_idle` value is referenced as a query-filter value in §3.12.2 (data source) — engineering would build a filter against an unregistered enum value, which fails type-check at the data layer. Build-time blocker.
- **D-3UX-023 (P2):** Held at P2. The substantive incorrectness of "Phase 3" is a real engineering bug (vendor curation begins in Phase 4, not 3), but the surface is a disabled-state tooltip on a low-traffic empty state. Not a P1 because the engine guard (`evaluation_owner_mode` + step gating) would prevent the user from acting on the wrong tooltip.
- **D-3UX-024 (P2):** Held at P2. Could argue P1 because event-name drift between §3 and Appendix G means engineering would emit one set of events and analytics would query the other set, breaking the entire `ops_surface` family's usefulness. Held at P2 because the event-emission code paths are typically generated from Appendix G (the registry), so engineering would default to the Appendix G names in practice. The §3 prose is the documentation drift, not the runtime drift.
- **D-3UX-025 (P2):** Held at P2. The §3.7.10 banner is a high-visibility behavior with no observability. A site-reliability engineer would want this metric on day one. Could argue P3 (not a build blocker), but the absence is a real engineering gap.
- **D-3UX-026 (P2):** Held at P2. The 5/8/20 conflict has a plausible reconciliation (5 visible, 20 in popover) but no spec text supports that reading. A junior engineer would build to the §3.12.11 AC #1's "5" and ignore the §3.12.6 "20".
- **D-3UX-027 (P2):** Held at P2 (consistent with the D-3UX-005/006/007 family classification).
- **D-3UX-028 (P1):** **Upgraded** from initial P2 to P1 in this self-challenge pass. Convention #2 (Acceptance Criteria) is a structural requirement; §3.14 has none. The CI gates in §3.14.4 are useful but they verify spec invariants, not user-observable behavior. A QA engineer cannot author tests for §3.14 from §3.14 alone.
- **D-3UX-029 (P2):** Held at P2 (parallel to D-3UX-019's P3 — but elevated because §3.7's state machine is the umbrella spec for every page surface, whereas §3.10's missing state machine is contained to one toolbar). The cross-cutting reach of §3.7's missing table makes it more impactful.
- **D-3UX-030 (P2):** Held at P2. Mobile usability and accessibility issue; not a build blocker but a real first-time-user defect.
- **D-3UX-031 (P2):** Held at P2. AC drift on a key dimensional contract; engineering would build to either AC #2 (640 cap) or §3.8.1 (720 on `desktop_xl`) and one would be wrong on the wider tier.
- **D-3UX-032 (P2):** Held at P2. Storage drift; impacts both engineering (which field to read?) and product (which UX granularity is correct?). Bound to D-3UX-021.
- **D-3UX-033 (P2):** Held at P2. Catalog row inconsistency with the umbrella contract; engineering would either omit the secondary CTA (matching §3.7.6) or inject it (matching §3.7.4) and either choice is defensible without the §3.7.6 footnote.
- **D-3UX-034 (P2):** Held at P2. Three numerical thresholds with overlapping semantics; engineering needs the precedence rule. Could argue P1 because a 600-row visible_only dispatch is unbuildable as written.
- **D-3UX-035 (P2):** Held at P2. Two banners is a real ambiguity; engineering would render both and ship the noisy version.
- **D-3UX-036 (P3):** Held at P3. Hygiene gap; per-feature rollback can be inferred from §3.5's umbrella pattern. The reframe-as-default-policy recommendation reduces this to a one-paragraph addition.

## Counterfactual Pass (Second Pass — extension)

For each second-pass defect, three realistic failure modes were enumerated and checked against the spec:

### D-3UX-021 / D-3UX-032 — Preferences entity drift
1. Engineering picks `UserPreferences` as the entity name and discovers it has no schema → 500 on first write. **Unhandled.**
2. Engineering picks `UserUIPreference` (correct) but tries to add `theme_mode` field via migration without spec authority → migration review block. **Unhandled.**
3. Engineering implements per-tier persistence (line 2763) AND per-surface persistence (line 2765) and the two desync at runtime. **Unhandled.** (D-3UX-032).

### D-3UX-022 — `active_idle` enum
1. Convex query filter rejects `status = "active_idle"` because the enum is 3-valued — Avatar Stack data source is empty. **Unhandled.**
2. Engineering quietly extends the enum to four values without spec authority → audit-time defect. **Unhandled.**
3. Engineering retains the 3-value enum and reinterprets `active` as "0–10s since heartbeat" — fails §3.9.3 80%-opacity rule for the `active_idle` band. **Unhandled.**

### D-3UX-023 — Vendor-curation Phase 3/4 drift
1. Buyer Team-Mode user reads "Vendor curation begins in Phase 3" tooltip and expects to add vendors in the Use Case Definition phase → confusion. **Unhandled.**
2. Engineering implements `if (phase >= 3)` predicate and the Add Vendors CTA enables one phase early → vendors created without Use Cases linked. **Unhandled** at the gating level (would land on Use Case Definition surface with no Use Case to anchor to).
3. QA writes an e2e test asserting the tooltip copy, then the §3.14.1 Setup-step banner copy ("Vendor curation begins after Setup") is added per D-3UX-008 — both copies coexist with conflicting phase numbers. **Unhandled.**

### D-3UX-024 — Event-name drift
1. Engineering emits the §3 names, analytics queries the Appendix G names, dashboard is empty for weeks. **Unhandled.**
2. Engineering emits the Appendix G names, e2e tests assert the §3 names, tests fail. **Unhandled.**
3. The `appendix_g_event_name_canonicality` gate is added but the §3 prose is not normalized; the gate fails on every PR touching §3. **Unhandled** (D-3UX-024 recommends both the gate AND the normalization).

### D-3UX-025 — Offline-banner observability gap
1. Pre-launch RUM: false-positive rate of `navigator.onLine` is unknown because no event measures it. **Unhandled.**
2. Customer reports "the offline banner appeared but I had connectivity" — Ops cannot reproduce or measure prevalence. **Unhandled.**
3. Mobile native (per D-3UX-016) is added; cross-platform attribution requires the `online_signal_source` property on a non-existent event. **Unhandled.**

### D-3UX-028 — §3.14 missing AC / Failure / Observability
1. QA cannot generate test plan from §3.14 — engineering ships the four-step bar with ad-hoc Playwright coverage that misses the soft-gate emission contract. **Unhandled** (no AC anchors the contract).
2. Step transition from Phase 11 → Phase 12 (within Score → Decide) crosses a step boundary — animation rule per §3.14.3 #3 is not testable as written. **Unhandled** (no AC asserts the boundary-cross signal vs within-step signal).
3. Mobile bottom-sheet on `mobile_xs` doesn't render the active step's CTAs because the §3.14.3 #5 rule is not enumerated as a testable AC. **Unhandled.**

### D-3UX-030 — Mobile step-initial collision
1. Screen reader on iOS narrates "S" twice without disambiguation — user cannot navigate. **Unhandled.**
2. Sighted user on `mobile_xs` taps the second "S" expecting Setup but lands on Score. **Unhandled.**
3. Two step initials in a horizontal-scroll segmented control fail the `responsive_conformance_suite` test on `mobile_xs`. **Untested** (the conformance suite per §38.6 doesn't test for label uniqueness).

### D-3UX-034 — Bulk-action threshold collision
1. User selects 600 rows visibly → warning at 500, then dispatch fails at 500 cap → no recovery affordance. **Unhandled.**
2. Server chunks 600 rows in 200-row batches per §3.10.6 — but the request was capped at 500, so the server only sees 500. Three rows go un-actioned silently. **Unhandled.**
3. `Cmd+A` on a filter that resolves to 600 rows defaults to `all_in_filter` (per §3.10.1) — selection is "All 600 in filter (under 10,000 cap)". User then deselects 100 → selection becomes 500 visible_only? Or stays all_in_filter with 100 manually excluded? Spec is silent. **Unhandled.**

### D-3UX-035 — Offline banner precedence
1. Network outage with 3 queued mutations → both the global banner AND the three per-mutation banners render → cluttered top-of-viewport. **Unhandled.**
2. Network outage with 0 queued mutations → only global banner renders → user sees no per-mutation Retry affordances on resume. **Acceptable** but spec does not say so.
3. Network outage transitioning to plan-gate error mid-flight → which banner wins? **Unhandled** — §3.7.10 says "suppresses per-page error states" but plan-gate banner is yellow not red and may not count as an "error state".

---

## Status note: D-3UX-015 partial reframing

D-3UX-015 was filed in the first pass for the §3.14.5 cross-reference "Appendix M (Surface/Engine Mapping): authoritative row authored in this phase under 'Pipeline Surface Compression.'" The first-pass evidence claimed "Appendix M.1 walked end-to-end: no row carries the literal label 'Pipeline Surface Compression'."

Second-pass walk: a labeled row "**Pipeline Surface Compression (§3.14, closed Phase 14.6)**" IS present in Appendix M.1 at line 49350. The first-pass walk apparently missed it (the row may have been below the prior auditor's read window, or the claim was over-reaching).

Recommendation: **D-3UX-015 should be transitioned to `superseded` with a forwarding note.** The cross-reference is satisfied; no remediation required. The §3.14.5 wording is consistent with the M.1 row that exists.

This second-pass note is appended to the ledger as a status update on D-3UX-015 rather than a new defect.

---

## Promotion Plan (Second Pass)

D-3UX-021 → D-3UX-036 promote into `DEFECT_LEDGER.md` under the `D-3UX-NNN` mnemonic, continuing the sequence after D-3UX-020.

D-3UX-015 receives a status forward-note (not a state change to `superseded` — that requires human review per the ledger's transition discipline; this audit log records the recommendation).

Coverage matrix tightening: the §3.14 row should additionally be marked `❌ missing` for `acceptance_criteria` and `observability` columns (per D-3UX-028); the §3 row should be marked `⚠ partial` for `data_model` (D-3UX-021), `enum` (D-3UX-022), and `observability` (D-3UX-024 / D-3UX-025).

**P0: 0 · P1: 3 (D-3UX-021, D-3UX-022, D-3UX-028) · P2: 11 · P3: 2 (D-3UX-036, plus D-3UX-039 advisory) · Total new: 16.**

**Cumulative across both passes: P0: 0 · P1: 4 · P2: 20 · P3: 12 · Total: 36.**

