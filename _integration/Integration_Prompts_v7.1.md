# Integration Prompts — v7.1.0 Surface-Abstraction & Dual-Maya Program

**Version:** 1.0
**Date:** 2026-04-26
**Program scope:** Integrate the surface-abstraction discipline (Principle 9), the dual-Maya persona model (Buyer Maya + Seller Maya), Single-Operator Mode, the Defense View, the Solo pricing tier, the Marketplace-as-Programmatic-RFP-Exchange framing, per-vertical eval starters, and the First-30-Seconds Test into the Sourcera corpus. Produces Master Spec **v7.1.0**.
**Predecessor:** `Integration_Prompts.md` (the 13-phase v7.0.0 program). v7.1.0 begins **only after v7.0.0 has been stamped**. This is non-negotiable — absorbing this scope mid-v7.0.0 corrupts the reconciliation log.
**Source authority:** Cowork session 2026-04-26 (PG-style validation pass + dual-Maya reframing + Blake's six locked decisions).
**Operator discipline:** Run sequentially. Do not skip phases. Do not author across phase boundaries in a single session. Each phase ends with a verification gate and a reconciliation log append. Adversarial review (Phase 14.19) blocks the final stamp (Phase 14.20).

---

## How to use this prompt book

Each phase below is structured identically:

- **Goal** — what the phase produces.
- **Read first** — files and sections that must be loaded end-to-end before authoring. Opus-grade discipline: read the section, do not grep it.
- **Edit** — files and sections that will change.
- **Authoring instructions** — concrete, step-by-step.
- **Verification gate** — observable conditions that must hold before the phase is closed.
- **Reconciliation log entry** — exact append to `_integration/RECONCILIATION.md`.
- **Stop conditions** — when to halt and surface a problem instead of proceeding.

Run one phase per session. Open the next session with: *"Run Phase 14.N from `Integration_Prompts_v7.1.md`."*

Every destructive edit to `Sourcera_Master_Spec.md`, `Sourcera_Master_Summary.md`, or either pricing strategy doc must be preceded by a backup copy to `_versions/` with the naming pattern `{Filename}.v{current-version}-pre-v7.1.{phase}-{YYYY-MM-DD}.md`. This is enforced in Phase 14.0 and re-asserted in every subsequent phase.

---

## Phase 14.0 — Pre-flight: Backup, Baseline Tagging, Reconciliation Header

### Goal
Snapshot the corpus before any v7.1.0 work. Establish the reconciliation header. Create the verification-log skeleton. No content edits in this phase.

### Read first
None. Pre-flight only.

### Edit
- `_versions/` — five new snapshots
- `_integration/RECONCILIATION.md` — append header
- `_integration/PHASE14_VERIFY.md` — create skeleton

### Authoring instructions
1. Confirm v7.0.0 has been stamped. If `Sourcera_Master_Spec.md` front matter is not at `v7.0.0`, halt — v7.1.0 cannot begin.
2. Copy the five primary files to `_versions/`:
   - `Sourcera_Master_Spec.md` → `_versions/Sourcera_Master_Spec.v7.0.0-pre-v7.1-2026-04-26.md`
   - `Sourcera_Master_Summary.md` → `_versions/Sourcera_Master_Summary.v1.1-pre-v7.1-2026-04-26.md`
   - `Sourcera_Buyer_Pricing_Strategy.md` → `_versions/Sourcera_Buyer_Pricing_Strategy.v2-pre-v7.1-2026-04-26.md`
   - `Sourcera_Seller_Pricing_Strategy.md` → `_versions/Sourcera_Seller_Pricing_Strategy.v2-pre-v7.1-2026-04-26.md`
   - `UX_Design_of_Sourcera.md` → `_versions/UX_Design_of_Sourcera.v2.0.0-pre-v7.1-2026-04-26.md`
3. Append a v7.1.0 program header to `_integration/RECONCILIATION.md`:
   - Heading: `## v7.1.0 — Surface-Abstraction & Dual-Maya Integration Program`
   - Date opened: `2026-04-26`
   - Source authority: `Cowork session 2026-04-26 (PG-style validation pass + dual-Maya reframing + Blake's six locked decisions on 2026-04-26)`
   - Scope summary: enumerate the eight integration objects (Principle 9, Appendix M, Single-Operator Mode, Defense View, Solo pricing tier, Marketplace-as-RFP-Exchange framing, per-vertical eval starters, First-30-Seconds Test) plus the five GTM/Execution doc rewrites.
4. Create `_integration/PHASE14_VERIFY.md` with one row per sub-phase (14.1 through 14.20), columns: `Phase | Status | Defects | Reviewer notes | Closed at`.

### Verification gate
- Five files exist in `_versions/` with the exact naming pattern.
- Reconciliation header appended with all four required fields.
- `PHASE14_VERIFY.md` skeleton created with 21 rows.

### Reconciliation log entry
> **Phase 14.0 — Pre-flight (closed):** v7.0.0 baseline confirmed. Five backups copied to `_versions/`. v7.1.0 program header opened. PHASE14_VERIFY.md skeleton created. No content edits.

### Stop conditions
- v7.0.0 not stamped → halt.
- Any backup copy fails → halt and surface error.

---

## Phase 14.1 — Foundational: Principle 9 (Surface Simplicity, Engine Complexity)

### Goal
Introduce the architectural principle that governs every subsequent surface decision in v7.1.0. Becomes the binding constraint on all UI authoring.

### Read first
- `Sourcera_Master_Spec.md` §1 (Architecture Overview) — full.
- `Sourcera_Master_Spec.md` §3 (UX / Design Language), including the existing eight UX principles — full.
- `Integration_Prompts_v7.1.md` introduction (this file).

### Edit
- `Sourcera_Master_Spec.md` §3 — add new principle.
- `Sourcera_Master_Spec.md` §1 — add cross-reference paragraph.

### Authoring instructions
1. Backup before edit per Phase 14.0 discipline.
2. Add a new sub-section under §3 with heading `## 3.X Principle 9 — Surface Simplicity, Engine Complexity {#3.x-principle-9-surface-simplicity-engine-complexity}` (use the next available principle number; existing principles are 3.1 through 3.8).
3. Body text:
   > Sourcera runs a full dual-sided programmatic RFP engine: 13-phase pipeline, dual-console firewall, KB governance, AIOperation metering, Capability Declarations, Match Scoring, outcome resolution, plan-tier gating, audit trail, marketplace inventory. The user — buyer-side or seller-side, first-timer or veteran, single-operator or buying committee — sees only the work that requires their judgment. Every backend primitive is an engineering construct that the user never names, configures, or thinks about.
   >
   > Surfacing complexity is a defect.
   >
   > **Acid test.** Would a panicked first-timer understand this surface element in the first 30 seconds with no training? If no, it belongs in the engine, not the surface. Appendix M (Surface/Engine Mapping) is the canonical contract that enforces this principle, and the First-30-Seconds Test (`UX_Design_of_Sourcera.md` §X) is the operational quality gate.
4. Add a paragraph to §1 (Architecture Overview) noting that Principle 9 is the binding constraint on all subsequent UI authoring decisions and references Appendix M as the contract.

### Verification gate
- Principle 9 sub-section present under §3 with exact heading and body.
- Cross-references to Appendix M and the First-30-Seconds Test present (forward references — both are authored in later phases).
- §1 cross-reference paragraph added.

### Reconciliation log entry
> **Phase 14.1 — Principle 9 added (closed):** Master Spec §3 now contains Principle 9 (Surface Simplicity, Engine Complexity) as a co-equal architectural principle. Forward-references Appendix M (Phase 14.2) and First-30-Seconds Test (Phase 14.17). §1 cross-reference added.

### Stop conditions
- §3 principle numbering conflicts with another section → resolve by inspecting current §3 numbering before proceeding.
- Master Spec front matter not at v7.0.0 → halt.

---

## Phase 14.2 — Foundational: Appendix M (Surface/Engine Mapping)

### Goal
Author the canonical contract that maps every engine concept to a surface metaphor. This is the single most important artifact in v7.1.0 — every subsequent phase must update it, and every future spec change must obey it.

### Read first
- `Sourcera_Master_Spec.md` §4 (data model) — full.
- `Sourcera_Master_Spec.md` §5 (RBAC including §5.11 Feature Access Matrix) — full.
- `Sourcera_Master_Spec.md` §6 (auth) — full.
- `Sourcera_Master_Spec.md` §13 (eval phases — buyer side) — full.
- `Sourcera_Master_Spec.md` §17 (eval phases — closing) — full.
- `Sourcera_Master_Spec.md` §22 (Seller KB, integrated portions) — full.
- `Sourcera_Master_Spec.md` §27 (Marketplace) — full.
- `Sourcera_Master_Spec.md` §31 (webhooks), §32 (APIs), §34 (plan tiers), §39 (object size constraints), §44 (consumption model) — full.
- `Sourcera_Master_Spec.md` Appendix A through Appendix L — for format reference.

### Edit
- `Sourcera_Master_Spec.md` — add new Appendix M after Appendix L.

### Authoring instructions
1. Backup before edit.
2. Add new appendix `## Appendix M — Surface/Engine Mapping {#appendix-m-surface-engine-mapping}`.
3. Open with a paragraph stating the appendix's role:
   > Appendix M is the canonical contract enforcing Principle 9 (Master Spec §3.X). Every engine concept that exists in the corpus has a corresponding surface metaphor here, or a documented "internal-only, never surfaced" entry. Adding an engine concept to the spec without adding a row to Appendix M is a CI-gate failure (see Phase 14.18 enforcement). Every UX surface authored in `UX_Design_of_Sourcera.md` cross-references the relevant Appendix M row.
4. Author the master table with columns:
   - `Engine concept` — the spec term as it appears in the body of the Master Spec.
   - `Spec home` — section reference, e.g., §13.4, §44.2.
   - `Surface metaphor` — what the user sees, in plain English.
   - `Hidden from tier(s)` — Free, Solo, Starter, Growth, Scale, Enterprise (indicate which tiers do not see the engine concept).
   - `Notes` — any abstraction tradeoffs, throttling behavior, or escalation paths.
5. Populate exhaustively. Walk every section listed under "Read first" and add a row for every engine concept that has a UI surface (or that explicitly does not have one and remains internal-only). Minimum 60 rows expected; more likely 80–120 once exhaustive.
6. Use the seed table from the Cowork session 2026-04-26 as the starter — it covers: 13-phase pipeline, AIOperation accepted/rejected metering, value-dollars rate card, wallet/overage/auto-topup, Capability Declarations, Match Scoring math, KB governance/staleness/dedupe, console firewall, Marketplace as backend index vs destination, Feature Access Matrix, plan tiers, data model nouns, stakeholder cohorts, SLA timers and Pulse Health Score, Selection Record SHA-256 hash, Ghost-RFP Importer, Buyer-Funded Pro Trial Seats, outcome resolver. Expand from there.
7. Add a closing sub-section "Process gates":
   - Every new engine concept added in any subsequent integration phase must include an Appendix M row in the same change.
   - The First-30-Seconds Test (`UX_Design_of_Sourcera.md`) is the surface-authoring quality gate.
   - The adversarial review pass (Phase 14.19) audits Appendix M coverage as a P0 check.

### Verification gate
- Appendix M exists with the exact heading and anchor.
- Table contains ≥60 rows.
- Every concept enumerated in §13.10, §17.8, §20.7, §22, §27, §34, §44 has at least one row.
- Process gates sub-section present.
- Forward-references to Phase 14.18 and 14.19 enforcement present.

### Reconciliation log entry
> **Phase 14.2 — Appendix M authored (closed):** Master Spec Appendix M now exists as the canonical Surface/Engine Mapping contract. N rows authored covering every engine concept with a UI surface across §4, §5, §6, §13, §17, §22, §27, §31, §32, §34, §39, §44. Process gates documented. Becomes the binding contract for all subsequent v7.1.0 phases and all post-v7.1 UI authoring.

### Stop conditions
- Any read-first section is materially missing from the Master Spec → halt and surface the gap; do not author Appendix M against an incomplete corpus.
- Row count below 60 after exhaustive walk → re-walk; this likely means the walk was not exhaustive.

---

## Phase 14.3 — Data Model: `evaluation_owner_mode`

### Goal
Introduce the single-operator vs team scope on the Workspace entity. Drives surface compression for Solo Mode.

### Read first
- `Sourcera_Master_Spec.md` §4 (data model — Workspace entity) — full.
- `Sourcera_Master_Spec.md` §5 (RBAC, especially §5.11 Feature Access Matrix) — full.
- `Sourcera_Master_Spec.md` §13 (eval phase semantics that may depend on this enum) — full.
- `Sourcera_Master_Spec.md` Appendix J (Controlled Vocabulary Registry) — full.

### Edit
- `Sourcera_Master_Spec.md` §4 — add field to Workspace entity.
- `Sourcera_Master_Spec.md` §5.11 — note Solo-mode UX defaults.
- `Sourcera_Master_Spec.md` Appendix J — register `EvaluationOwnerMode` enum.
- `Sourcera_Master_Spec.md` Appendix M — add row.

### Authoring instructions
1. Backup before edit.
2. Add field to Workspace entity field table:

   | Field | Type | Constraints | Notes |
   |---|---|---|---|
   | `evaluation_owner_mode` | enum (`EvaluationOwnerMode`) | required, default `solo` for Workspaces created on Free/Solo plan; default `team` on Starter+ plan | Drives UX surface compression. `solo` = single-operator surface (4-step compressed pipeline UI per §3.X, optional stakeholder invites, deadline countdown replaces SLA UI). `team` = full multi-stakeholder surface as currently spec'd. Switchable Solo→Team at any time; Team→Solo allowed only if no stakeholders have been invited. |

3. Register enum in Appendix J:
   - `EvaluationOwnerMode = solo | team`
4. Update §5.11 Feature Access Matrix: add a row noting that Solo Mode is the default surface for Free / Solo / Starter plans; Team Mode is the default for Growth / Scale / Enterprise. Cross-reference Principle 9 and Appendix M.
5. Add Appendix M row:
   - Engine concept: `evaluation_owner_mode` (Workspace field)
   - Spec home: §4.X
   - Surface metaphor: invisible — drives surface compression silently. User sees the appropriate UI without ever naming the mode.
   - Hidden from: all tiers (the field itself is never surfaced; only its consequences are).

### Verification gate
- Workspace field table updated with full schema discipline.
- Appendix J updated.
- §5.11 row added with cross-references.
- Appendix M row added.
- No inline numerical values introduced (the mode drives behavior, not numerics).

### Reconciliation log entry
> **Phase 14.3 — `evaluation_owner_mode` added (closed):** Workspace entity (Master Spec §4) now carries `evaluation_owner_mode` enum. Registered in Appendix J. Solo/Team defaults documented in §5.11. Appendix M row added. No surface UI changes in this phase — they are authored in Phase 14.6.

### Stop conditions
- Workspace entity not present in §4 in expected shape → halt and reconcile §4 baseline before proceeding.

---

## Phase 14.4 — Method: Single-Operator Mode

### Goal
Absorb Solo Mode into the Sourcera Method as a first-class path. The Method itself is invariant; the surface compresses.

### Read first
- `Sourcera_Master_Spec.md` §2 (the Sourcera Method) — full.
- `Sourcera_Master_Spec.md` §13 through §17 (eval phase sections that reference stakeholder cohorts) — full.
- `Sourcera_Master_Summary.md` §4 (the Method summary) — full.

### Edit
- `Sourcera_Master_Spec.md` §2 — add Single-Operator Mode sub-section + edits to existing stakeholder-cohort content.
- `Sourcera_Master_Spec.md` Appendix M — confirm rows for cohort visibility.

### Authoring instructions
1. Backup before edit.
2. Add sub-section `## 2.X Single-Operator Mode {#2.x-single-operator-mode}` to §2.
3. Body:
   - Define Single-Operator Mode as the default surface path for first-time evaluation owners. The operator is all five cohort roles (Exec Sponsor, Eval Lead, Functional Lead, Technical Evaluator, SME) until they explicitly invite others.
   - The 13-phase pipeline runs as the engine; the Solo surface compresses to a 4-step progress bar (Setup → Define → Score → Decide), authored in Phase 14.6.
   - Phase gates are soft (skip-with-warning) in Solo Mode and hard in Team Mode.
   - SLAs and Pulse Health Score run in the engine for audit; the Solo surface shows a single deadline countdown and a "what to do this week" panel.
   - Stakeholder invites are contextual: the operator invites the CISO at the moment the security section is drafted; invites Finance at the moment the TCO model is filled. Each invite is a one-click action embedded inline at the natural moment, not an upfront setup step.
   - Single-Operator Mode is a surface, not a methodology change. The Method itself is invariant.
4. Edit §2 stakeholder cohort section to note that the cohorts are engine-level constructs that auto-assign from email-domain heuristics when stakeholders are invited; in Solo Mode they remain as engine constructs but do not surface as roles to the operator.
5. Confirm Appendix M (Phase 14.2) contains rows for: stakeholder cohorts (engine-only on Solo), SLA timers (engine-only on Solo), Pulse Health Score (engine-only on Solo). If missing, add.

### Verification gate
- §2.X authored with full body.
- §2 stakeholder cohort section edited to reflect engine/surface split.
- Appendix M rows confirmed for cohort/SLA/Pulse visibility.
- Cross-reference to Principle 9.

### Reconciliation log entry
> **Phase 14.4 — Single-Operator Mode (closed):** Master Spec §2 now treats Solo Mode as a first-class surface path. Method invariant; surface compresses. Stakeholder cohorts demoted to engine-only constructs in Solo Mode, surfaceable in Team Mode. Appendix M rows confirmed.

### Stop conditions
- §2 cohort model not present in expected shape → halt and reconcile.

---

## Phase 14.5 — Feature: Defense View

### Goal
Author the Defense View as a new feature. Simple scope: talking points + linked evidence + one-page CFO summary. No multi-stakeholder rehearsal modes, no slide generation.

### Read first
- `Sourcera_Master_Spec.md` §13 (eval phase sections, especially closing phases where Selection Record is produced) — full.
- `Sourcera_Master_Spec.md` §17 (closing phases) — full.
- `Sourcera_Master_Spec.md` §32 (APIs), §44 (Consumption model) — full.
- `UX_Design_of_Sourcera.md` — relevant component patterns — full.
- `Sourcera_Master_Spec.md` Appendix K (Glossary) — full.

### Edit
- `Sourcera_Master_Spec.md` — new sub-section under §13 (or §17, wherever Selection Record presentation lives — operator chooses based on baseline structure).
- `Sourcera_Master_Spec.md` Appendix K — register `Defense View`.
- `Sourcera_Master_Spec.md` Appendix C (Notification Event Catalog) — register events for Defense View generated/regenerated.
- `Sourcera_Master_Spec.md` Appendix M — add row.
- `UX_Design_of_Sourcera.md` — new component spec.

### Authoring instructions
1. Backup before edit.
2. Master Spec sub-section: `## 13.X Defense View {#13.x-defense-view}`.
   - **Purpose.** A single surface the buyer-side operator opens 5 minutes before the leadership meeting. Delivers, in plain English: (a) the recommended vendor and the one-sentence reason; (b) the three highest-weighted reasons why; (c) the one or two material risks and how they were mitigated; (d) linked evidence per claim back to the Selection Record; (e) a one-page printable CFO summary.
   - **Inputs.** Selection Record (already SHA-256 hashed; cross-reference §X.Y).
   - **Behavior.** Generated server-side via Sonnet on the operator's first open. Cached. Regenerated only when the underlying Selection Record mutates. Generation is an AIOperation with capability ID `defense_view_generate`. Accepted = operator opens the view at least once before the recommendation is presented to leadership (90-day window). Rejected = operator regenerates within 24 hours of first generation (signals quality miss).
   - **Surface.** One screen, four sections (Recommendation · Why · Risks · Evidence), one action ("Print/Export PDF"). Deadline countdown in header. No navigation away.
   - **Plan gating.** Solo+ tier (full surface, unwatermarked). Free tier sees a watermarked preview with a "Solo unlocks the full view" CTA. Cite §34.1 for tier boundaries.
   - **Data model.** New entity `DefenseView` with field table:

     | Field | Type | Constraints | Notes |
     |---|---|---|---|
     | `id` | UUID | required, PK | |
     | `org_id` | UUID | required, FK | org-scoped |
     | `console` | enum | required = `buyer` | |
     | `workspace_id` | UUID | required, FK | |
     | `selection_record_id` | UUID | required, FK | one-to-one with Selection Record |
     | `selection_record_hash` | text | required | SHA-256 of source SR; mismatch triggers regeneration |
     | `recommendation_text` | text | required | 1 sentence |
     | `top_reasons` | jsonb | required | 3 reason objects with evidence ref |
     | `material_risks` | jsonb | required | 1–2 risk objects with mitigation ref |
     | `cfo_summary_md` | text | required | 1-page Markdown |
     | `generated_at` | timestamp | required | |
     | `opened_at` | timestamp | nullable | first operator open; drives accepted signal |
     | `regenerated_count` | integer | required, default 0 | drives rejected signal at ≥1 within 24h |
     | `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at` | standard | required | soft delete supported |

   - **Indexes.** `(workspace_id)`, `(selection_record_id)`, `(selection_record_hash)`.
   - **Retention.** Tied to Workspace retention (§40.2). Soft-deleted on Workspace archive; purged per standard retention.
   - **Acceptance criteria** (numbered, observable, scope-bound):
     1. Given a Workspace with a finalized Selection Record, when the operator opens the Defense View for the first time, the system generates the four sections within 8 seconds (p95) and renders without further interaction.
     2. Given an opened Defense View, when the operator clicks "Print/Export PDF," the system produces a single-page PDF containing all four sections plus the Selection Record SHA-256 in the footer, within 3 seconds (p95).
     3. Given a Defense View whose underlying Selection Record has mutated (hash mismatch), when the operator opens the view, the system regenerates and surfaces a "regenerated due to source change" chip.
     4. Given a Free-tier operator, when they open the Defense View, the system renders a watermarked preview with the recommendation and one top reason visible; remaining sections are gated with the Solo upgrade CTA.
     5. Given a Solo-tier operator with no Defense View previously generated for a Workspace, when they open the view, the AIOperation `defense_view_generate` resolves to `accepted` if and only if `opened_at` is non-null within 90 days of `generated_at` and `regenerated_count` is `0`.
3. Appendix K: register `Defense View — Surface that delivers the operator's leadership-meeting talking points, generated from the finalized Selection Record. See §13.X.`
4. Appendix C: register two notification events:
   - `defense_view.generated` — buyer console, fires on first generation.
   - `defense_view.regenerated` — buyer console, fires on regeneration.
   - HMAC-SHA256 signing per §31, idempotency via `event_id`, retry curve standard.
5. Appendix M row:
   - Engine concept: `DefenseView` entity + `defense_view_generate` AIOperation.
   - Spec home: §13.X.
   - Surface metaphor: "One-screen leadership-meeting brief generated from the Selection Record. Print/Export PDF for CFO."
   - Hidden from: Free (preview only).
6. UX spec: author component spec covering layout, design tokens, interaction states (loading, generating, ready, regenerated, watermarked, error), mobile read-only behavior, keyboard shortcuts (Cmd+P to export, Esc to close).

### Verification gate
- Master Spec §13.X authored with full data model, AIOp registration, acceptance criteria.
- Appendix K, Appendix C, Appendix M updated.
- UX component spec authored.
- Cross-references to §31 (webhooks), §32 (APIs), §34 (plan tiers), §44 (consumption).

### Reconciliation log entry
> **Phase 14.5 — Defense View authored (closed):** Master Spec §13.X now contains the Defense View feature spec at full Master Spec fidelity. Entity `DefenseView` registered. AIOperation `defense_view_generate` registered with accepted/rejected signals. Appendix K, Appendix C (events `defense_view.generated`, `defense_view.regenerated`), Appendix M updated. UX spec authored.

### Stop conditions
- Selection Record location ambiguous (§13 vs §17) → resolve baseline before authoring; do not duplicate.

---

## Phase 14.6 — UX Compression: 4-Step Progress Bar

### Goal
Compress the 13-phase pipeline UI to a 4-step progress bar on both consoles. The engine pipeline is unchanged.

### Read first
- `Sourcera_Master_Spec.md` §3 (UX), §13 (buyer pipeline), §17 (buyer closing), §22 (seller pipeline integrated portions) — full.
- `UX_Design_of_Sourcera.md` — current pipeline component spec — full.
- `Sourcera_Master_Spec.md` Appendix M (Phase 14.2) — confirm pipeline rows.

### Edit
- `Sourcera_Master_Spec.md` §3 — surface-compression sub-section.
- `Sourcera_Master_Spec.md` §13 and §22 — note surface compression in Solo Mode.
- `UX_Design_of_Sourcera.md` — new compressed pipeline component spec.
- `Sourcera_Master_Spec.md` Appendix M — confirm/expand rows.

### Authoring instructions
1. Backup before edit.
2. Master Spec §3: add sub-section `## 3.X Pipeline Surface Compression {#3.x-pipeline-surface-compression}`. The 13-phase pipeline is an engine construct. Solo Mode renders it as four steps; Team Mode renders the full 13-phase breadcrumb (existing component).
3. Document the buyer-side mapping:
   - **Setup** — engine phases 1–3: Workspace creation, Use Case decomposition, Requirements authoring.
   - **Define** — engine phases 4–6: Vendor longlist, RFI/RFP design, vendor invites.
   - **Score** — engine phases 7–10: Vendor responses, scoring, calibration, escalation.
   - **Decide** — engine phases 11–13: Selection Record, Defense View, post-selection close-out.
4. Document the seller-side mapping:
   - **Receive** — engine phases 1–2: bid invitation received, Hero Moment bootstrap.
   - **Draft** — engine phases 3–7: First-pass drafting, KB-grounded responses.
   - **Review** — engine phases 8–10: operator review, edits, KB-gap creation.
   - **Submit** — engine phases 11–13: submission, post-bid debrief, KB compounding.
5. UX spec: author the four-step progress bar component with two states — `solo` (four steps) and `team` (full 13-phase breadcrumb). Document interaction patterns: clicking a step jumps to the engine phase corresponding to its first sub-phase; soft phase gates render skip-with-warning toasts.
6. Appendix M: confirm rows for pipeline visibility per tier and mode.

### Verification gate
- §3.X compression sub-section authored.
- Both buyer-side and seller-side mappings explicit.
- UX component spec includes both modes.
- Appendix M rows confirmed.

### Reconciliation log entry
> **Phase 14.6 — Pipeline surface compression (closed):** 13-phase engine renders as 4-step Setup→Define→Score→Decide on the buyer console and Receive→Draft→Review→Submit on the seller console in Solo Mode. Team Mode renders the full breadcrumb. UX component spec authored with both modes.

### Stop conditions
- Existing pipeline component cannot be cleanly extended → flag for UX team to refactor before merge.

---

## Phase 14.7 — Buyer Maya Onboarding & Per-Vertical Eval Starters

### Goal
Author the "What are you evaluating?" intake flow and the `EvalStarter` entity that powers it.

### Read first
- `Sourcera_Master_Spec.md` §4 (data model), §13.1–§13.3 (Workspace/UseCase/Requirement creation flows) — full.
- `Sourcera_Master_Spec.md` §22 (Seller KB / Marketplace inventory) — full.
- `Sourcera_Master_Spec.md` Appendix J (controlled vocabulary) — full.
- `UX_Design_of_Sourcera.md` — current onboarding flow — full.

### Edit
- `Sourcera_Master_Spec.md` — new sub-section under §13.
- `Sourcera_Master_Spec.md` §4 — new entity `EvalStarter`.
- `Sourcera_Master_Spec.md` Appendix J — register `EvalVertical` enum.
- `Sourcera_Master_Spec.md` Appendix M — add rows.
- `UX_Design_of_Sourcera.md` — onboarding screen component.

### Authoring instructions
1. Backup before edit.
2. Master Spec sub-section `## 13.X "What Are You Evaluating?" Intake {#13.x-what-are-you-evaluating-intake}`:
   - Single screen, single question, six default vertical options + free text.
   - Defaults: CRM, ITSM, EDR / Endpoint Security, Observability, Payroll / HRIS, Other.
   - Selection pre-populates the new Workspace with: 3–8 Use Cases, 30–80 Requirements, default scoring rubric (FM/PM/EJ mix per vertical), recommended vendor longlist (drawn from Marketplace inventory), default deadline of 4 weeks.
   - Operator can edit anything; nothing is locked.
   - Acceptance criteria (numbered, observable).
3. Define `EvalStarter` entity in §4:

   | Field | Type | Constraints | Notes |
   |---|---|---|---|
   | `id` | UUID | required, PK | |
   | `vertical_slug` | text | required, unique | e.g., `crm`, `itsm`, `edr` |
   | `display_name` | text | required | |
   | `use_cases` | jsonb | required | seed Use Case decomposition |
   | `requirements` | jsonb | required | seed Requirement set with weights |
   | `default_rubric` | jsonb | required | per-requirement scoring model defaults |
   | `recommended_longlist` | jsonb | nullable | seed vendor list from Marketplace inventory |
   | `default_deadline_days` | integer | required, default 28 | |
   | `created_at`, `updated_at`, `created_by`, `updated_by` | standard | required | |

   - Scope: marketplace-domain (single global registry maintained by Sourcera Ops).
   - Indexes: `(vertical_slug)`.
   - Retention: indefinite, versioned.
4. Appendix J: register `EvalVertical = crm | itsm | edr | observability | payroll_hris | other`.
5. Appendix M:
   - Engine: `EvalStarter` entity → Surface: "What are you evaluating?" intake question.
   - Engine: Workspace pre-population logic → Surface: half-built Workspace ready for editing.
6. UX spec: author the onboarding screen (single question, six tiles + free text), plus the post-selection landing screen showing the pre-populated Workspace with a "What we filled in for you" callout panel.

### Verification gate
- §13.X authored with acceptance criteria.
- `EvalStarter` entity registered with full field table.
- `EvalVertical` enum in Appendix J.
- Appendix M rows added.
- UX component spec authored.

### Reconciliation log entry
> **Phase 14.7 — Buyer Maya onboarding (closed):** "What are you evaluating?" intake flow + `EvalStarter` entity authored. Six default verticals registered in Appendix J. Master Spec §13.X populates a Workspace with seed Use Cases, Requirements, rubric, and longlist on selection. UX onboarding surface authored.

### Stop conditions
- Marketplace inventory model not finalized for seeding `recommended_longlist` → ship with `recommended_longlist` nullable; add a follow-up issue to Linear.

---

## Phase 14.8 — Seller Maya Surface Polish (Hero Moment Abstraction Pass)

### Goal
Apply the surface-abstraction discipline to the existing Hero Moment spec. Engine survives intact; surface gets simplified, language gets de-jargoned, AE/SE/Bid Manager personas explicitly targeted.

### Read first
- `Sourcera_Master_Spec.md` §22 (Seller KB integrated portions) — full.
- `Sourcera_Master_Summary.md` §3.6 (Seller Hero Moment mechanics) and §6.28.2 (Seller Onboarding Experience) — full.
- `KB_Engineering_Spec.md` — relevant retrieval and bootstrap sections — full.
- `Sourcera_Master_Spec.md` Appendix M (Phase 14.2) — confirm KB rows.

### Edit
- `Sourcera_Master_Spec.md` §22 — surface-abstraction pass.
- `UX_Design_of_Sourcera.md` — Seller Maya magic-link landing screen polish.
- `Sourcera_Master_Spec.md` Appendix M — add rows for auto-generated Capability Declarations, silent KB governance, label-only Match Scoring on Solo/Free.

### Authoring instructions
1. Backup before edit.
2. Audit §22 against Principle 9. For every surface element that exposes a Sourcera-specific concept to Seller Maya, abstract it:
   - **Capability Declarations** are auto-generated during the Hero Moment from the bootstrapped KB. Seller Maya never authors one in Solo/Free. Surface message: *"Your profile is now discoverable for: CRM, Sales Engagement, Lead Scoring."* Operator can edit the displayed list; the underlying Capability Declaration entities are managed silently.
   - **KB governance, staleness classifier, dedupe** run silently. Surface: *"We refreshed your knowledge base from your website — N new entries proposed."* (weekly cadence).
   - **Match Scoring math** hidden on Solo/Free; surface labels only: *"Strong match / Likely match / Weak match."*
   - **AIOp consumption** hidden on Solo/Free per Phase 14.10.
3. Persona note: explicitly add to §22 that Seller Maya is title-agnostic — Account Executive, Solutions Engineer, or Bid Manager at a 50–500-person B2B SaaS vendor. Onboarding surface assumes none of these have prior Sourcera experience.
4. UX spec: polish the magic-link landing screen — domain bootstrap progress narrative, Hero Moment counters ("47 AI drafts prepared. 31 cite evidence from your website."), inline citation hover behavior, KB-gap detector empty state, stake-reveal screen on submission.
5. Appendix M:
   - Engine: Capability Declarations → Surface: discoverable-categories chip list.
   - Engine: KB governance → Surface: weekly "we refreshed your KB" notification.
   - Engine: Match Scoring numeric → Surface: three-label compression on Solo/Free.

### Verification gate
- §22 surface-abstraction pass complete.
- Persona note (AE/SE/Bid Manager) added.
- UX landing screen polish authored.
- Appendix M rows added.

### Reconciliation log entry
> **Phase 14.8 — Seller Maya surface polish (closed):** Hero Moment spec audited against Principle 9. Capability Declarations auto-generated and surface-abstracted; KB governance silenced behind weekly notification; Match Scoring math hidden on Solo/Free with three-label compression. AE/SE/Bid Manager persona explicit. UX landing screen polished. Appendix M rows added.

### Stop conditions
- §22 references engine concepts not yet integrated from KB_Engineering_Spec → halt and reconcile with v7.0.0 baseline before applying surface abstraction.

---

## Phase 14.9 — Pricing: Solo Tier (Symmetric, Both Consoles)

### Goal
Introduce the Solo tier on Buyer and Seller pricing strategies. Update Master Spec plan tier scaffolding consistently.

### Read first
- `Sourcera_Buyer_Pricing_Strategy.md` — full.
- `Sourcera_Seller_Pricing_Strategy.md` — full.
- `Sourcera_Master_Spec.md` §34.1 (Plan Tier Definitions), §5.11 (Feature Access Matrix), §39 (Object Size Constraints) — full.
- `Sourcera_Master_Spec.md` Appendix J — full.

### Edit
- `Sourcera_Buyer_Pricing_Strategy.md` — add Solo tier.
- `Sourcera_Seller_Pricing_Strategy.md` — add Solo tier.
- `Sourcera_Master_Spec.md` §34.1 — register Solo tier on both consoles.
- `Sourcera_Master_Spec.md` §5.11 — Solo tier feature access row.
- `Sourcera_Master_Spec.md` §39 — Solo tier object-size constraints.
- `Sourcera_Master_Spec.md` Appendix J — register `solo` plan tier value.

### Authoring instructions
1. Backup all three pricing-touching files.
2. Buyer Solo tier in `Sourcera_Buyer_Pricing_Strategy.md`:
   - $49/mo (annual: $39/mo) OR $199/eval one-time.
   - 1 active eval, unlimited requirements, unlimited vendors within that eval.
   - Unwatermarked Selection Report and Defense View.
   - 90-day audit retention.
   - Full single-operator surface (Solo Mode default).
   - AI consumption invisible (cost absorbed; see Phase 14.10).
   - SSO/SCIM/residency: no.
   - CSM: no.
   - Support: community.
   - Update plan-tier table in §2.3.
3. Seller Solo tier in `Sourcera_Seller_Pricing_Strategy.md`:
   - $49/mo (annual: $39/mo) OR $199/bid one-time.
   - 1 active bid, full Hero Moment, KB persistence across bids on subscription, per-bid only on $199.
   - Unwatermarked submission.
   - 90-day audit retention.
   - AI consumption invisible.
   - Update plan-tier table in §2.4 (or wherever the seller tier table lives).
4. Update gating triggers in both pricing docs:
   - Solo → Starter (Buyer): second concurrent eval, multi-stakeholder invitations, KB-cap.
   - Solo → Starter (Seller): second concurrent bid, EOI access requested, Capability Declaration count > 3.
5. Master Spec §34.1: register Solo tier on both consoles with all gating numerics. **All numerics live here only.** Pricing strategy docs reference §34.1, never duplicate.
6. Master Spec §5.11: add full feature gating row for Solo on both consoles.
7. Master Spec §39: object-size limits for Solo tier (matching Free where reasonable, scoped to single active eval/bid).
8. Appendix J: register `PlanTier` enum value `solo` (insert between `free` and `starter`).

### Verification gate
- Both pricing docs updated.
- Master Spec §34.1, §5.11, §39 consistent with the pricing docs.
- All numerical values cited in §34.1 / §39 only — never duplicated inline.
- Appendix J updated.
- Appendix M: confirm Solo tier-related abstractions are reflected (AI consumption invisibility, etc.).

### Reconciliation log entry
> **Phase 14.9 — Solo tier added symmetric (closed):** Buyer Solo and Seller Solo tiers added at $49/mo or $199/eval-or-bid. Master Spec §34.1, §5.11, §39 updated with full numerical homing. Both pricing strategy docs reflect Solo as the personal-card on-ramp. Gating triggers documented for Solo→Starter on both sides. Appendix J updated. Pricing strategy doc versions bumped to v3.

### Stop conditions
- Pricing model conflicts with cross-side billing pooling logic in Master Summary §2.5 → halt and reconcile (Solo billing is per-console; pooling logic must accommodate).

---

## Phase 14.10 — Pricing: AI Consumption Invisibility for Solo

### Goal
Hide AIOp metering, value-dollars, wallet, overage, and rate card from the Solo-tier surface while preserving the engine for accounting and margin protection.

### Read first
- `Sourcera_Master_Spec.md` §44 (Consumption Model) — full.
- `Sourcera_Master_Spec.md` §32 (APIs related to billing) — full.
- `Sourcera_Buyer_Pricing_Strategy.md` and `Sourcera_Seller_Pricing_Strategy.md` — full.
- `UX_Design_of_Sourcera.md` — current billing surface — full.

### Edit
- `Sourcera_Master_Spec.md` §44 — new sub-section "Solo-Tier Surface Treatment."
- `UX_Design_of_Sourcera.md` — Solo-tier billing surface.
- `Sourcera_Master_Spec.md` Appendix M — rows for hidden surfaces.

### Authoring instructions
1. Backup before edit.
2. Add sub-section `## 44.X Solo-Tier Surface Treatment {#44.x-solo-tier-surface-treatment}`:
   - For Solo-tier accounts on either console, AIOperation cost is metered in the engine for accounting and margin protection but is never surfaced to the operator.
   - Operator sees a single fixed line item: "Plan: Solo · $49/mo" or "Eval billed: $199 paid 2026-04-26."
   - Wallet, overage, auto-topup, value-dollars, rate card, per-AIOp accounting surfaces are hidden.
   - The public rate card at `api.sourcera.com/v1/pricing` continues to emit for engineering transparency; it is not surfaced in-app for Solo accounts.
   - **Throttling behavior.** If a Solo account's actual AI cost approaches 80% of the absorbed margin envelope (per-capability configurable, defaults in §44.X.1), the system silently throttles lowest-priority capabilities (proactive suggestions, Cmd+K Marketplace surfacing, weekly KB refresh cadence) and does not break the active workflow. Surface message if throttled: *"Some background suggestions paused — your active workflow is unaffected."*
   - **Margin envelope defaults.** Buyer Solo: $5 absorbed value/mo (matches Free budget) at subscription, $5 per eval at one-time. Seller Solo: $5 absorbed value/mo subscription, $5 per bid at one-time. Capabilities exceeding the envelope route to throttling, not to user-visible billing.
3. UX spec: author the Solo-tier billing surface — one card, one number, no rate card, no wallet, no per-op breakdown. Soft cap notification surface for the rare throttling event.
4. Appendix M:
   - Engine: AIOperation accepted/rejected metering → Surface: invisible on Solo (Free, Solo).
   - Engine: value-dollars rate card → Surface: invisible on Solo; visible at `api.sourcera.com/v1/pricing` always for engineering transparency.
   - Engine: wallet, overage, auto-topup → Surface: invisible on Solo; visible on Starter+.
   - Engine: throttling → Surface: single notification line, no per-capability detail.

### Verification gate
- §44.X authored with throttling behavior and margin envelope defaults.
- UX Solo-tier billing surface authored.
- Appendix M rows added.
- Cross-references to §34.1 (where Solo tier is registered).

### Reconciliation log entry
> **Phase 14.10 — AI consumption invisibility for Solo (closed):** Master Spec §44 now contains Solo-Tier Surface Treatment. Engine metering preserved; surface compresses to a single line item. Throttling behavior documented for the rare margin-envelope-exceeded case. UX surface authored. Appendix M rows added.

### Stop conditions
- §44 baseline does not contain the cost-base recalculation job and per-capability outcome resolver as expected → halt; v7.0.0 baseline is incomplete.

---

## Phase 14.11 — Master Summary §1 Rewrite

### Goal
Surface dual-Maya personas in the canonical compressed reference. Retain SEP as the headline category. Frame the Marketplace internally as the Programmatic RFP Exchange.

### Read first
- `Sourcera_Master_Summary.md` §1 (One-Pager — What Sourcera Is) — full.
- `Sourcera_Master_Summary.md` §6 (Personas, integrated portions) — full.
- This integration prompt book — for resolved persona language.

### Edit
- `Sourcera_Master_Summary.md` §1 — rewrite Who It's For block, add Marketplace marquee framing.
- `Sourcera_Master_Summary.md` front matter — bump version to v1.2 with changeset note.

### Authoring instructions
1. Backup before edit.
2. Keep the tagline (*Choose Correct. Move Faster.*) and the "Software Evaluation Platform" category framing.
3. Rewrite the "Who It's For" block:
   - **Primary buyer-side ICP customer:** mid-market organizations 200–2,000 employees, $500K–$10M annual software spend, regulated verticals (financial services, healthcare, government) favored.
   - **Primary buyer-side surface persona — Buyer Maya:** first-time evaluation owner (IT Director, InfoSec Lead, Ops Lead) at a target-ICP organization. Inherited a $200K–$2M software decision. 4-week deadline. No prior eval methodology. Personally career-exposed to a wrong recommendation. Currently using a Smartsheet template a friend at another company sent her in Slack.
   - **Primary seller-side ICP customer:** B2B SaaS vendors 50–500 employees responding to 10–100 RFPs per year.
   - **Primary seller-side surface persona — Seller Maya:** Account Executive, Solutions Engineer, or Bid Manager at a target-ICP vendor. Forwarded a buyer invite from Sourcera with a 4-day deadline. No prior Sourcera experience.
   - **Wedge ICP:** the regulated-vertical Buyer Maya — fintech or healthcare, with a CISO/Compliance officer who personally signs off on vendor selections.
4. Add a paragraph framing the Marketplace internally and in marketing as **The Programmatic RFP Exchange** — the dual-sided structured-intent / structured-capability / agent-mediated marquee feature inside the SEP. Note that this is a marquee positioning of the Marketplace, not a category rename. The platform remains a Software Evaluation Platform; the Marketplace inside it is the Programmatic RFP Exchange.
5. Update §1's "Category" sub-section to retain SEP and add the RFP Exchange framing as the Marketplace's marquee positioning.
6. Bump front matter version to v1.2 with date 2026-04-26 and changeset note enumerating the persona model and the RFP Exchange framing.

### Verification gate
- Tagline and SEP category preserved.
- Both surface personas explicit and named (Buyer Maya, Seller Maya).
- Marketplace-as-RFP-Exchange framing landed in §1 without renaming the category.
- Version bumped to v1.2.

### Reconciliation log entry
> **Phase 14.11 — Master Summary §1 rewrite (closed):** ICP block now surfaces dual-Maya personas. SEP retained as headline category. Marketplace internally and in marketing positioned as "The Programmatic RFP Exchange" — marquee feature inside the SEP. Master Summary version bumped to v1.2.

### Stop conditions
- §1 has been edited mid-flight by another integration phase → halt and reconcile.

---

## Phase 14.12 — GTM_POSITIONING.md Rewrite

### Goal
Align positioning narrative with v7.1.0. SEP headline; Marketplace = Programmatic RFP Exchange marquee; both Mayas explicit; procurement-officer-led narrative removed or qualified.

### Read first
- `GTM_POSITIONING.md` — full.
- `Sourcera_Master_Summary.md` §1 (post Phase 14.11) — full.

### Edit
- `GTM_POSITIONING.md` — full rewrite of headline sections.

### Authoring instructions
1. Backup before edit.
2. Lead with SEP as the headline category.
3. Position Marketplace as "The Programmatic RFP Exchange" — the dual-sided structured-RFP infrastructure layer that compounds the platform's value with every additional buyer and seller.
4. Both surface personas explicit (Buyer Maya, Seller Maya) in the positioning narrative.
5. Update messaging hierarchy:
   - **Headline:** Software Evaluation Platform built for first-time evaluation owners.
   - **Sub-message:** dual-sided programmatic RFP exchange compounds value with every buyer and seller.
   - **Wedge sub-message:** regulated-vertical defensibility (audit-grade Selection Records, compliance-officer-signoff-ready output).
6. Remove or qualify procurement-officer-led messaging. Where procurement officers are addressed, frame them as a stakeholder Buyer Maya invites, not as the primary buyer.
7. Retain regulated-vertical posture as a defensibility narrative.

### Verification gate
- All persona references aligned with Master Summary §1.
- Marketplace-as-RFP-Exchange framing consistent across all sections.
- Procurement-officer-led narrative removed or qualified.

### Reconciliation log entry
> **Phase 14.12 — GTM_POSITIONING.md rewrite (closed):** Positioning rewritten around dual-Maya personas. SEP headline preserved. Marketplace = Programmatic RFP Exchange marquee positioning landed. Procurement-officer narrative qualified. Regulated-vertical defensibility preserved.

### Stop conditions
- GTM_POSITIONING.md baseline conflicts with Master Summary §1 in non-resolvable ways → escalate to human.

---

## Phase 14.13 — GTM_PLG_ARCHITECTURE.md Rewrite

### Goal
Symmetric Buyer Maya + Seller Maya paid paths in v1, with Solo tier as the on-ramp on both sides. All 17 growth mechanics ship in v1.

### Read first
- `GTM_PLG_ARCHITECTURE.md` — full.
- `Sourcera_Master_Summary.md` §3.1 (Buyer Paid Path), §3.1b (Seller Paid Path), §3.2 (Growth Loops), §3.3 (Growth Mechanics) — full.
- `Sourcera_Buyer_Pricing_Strategy.md` and `Sourcera_Seller_Pricing_Strategy.md` post-Phase-14.9 — full.

### Edit
- `GTM_PLG_ARCHITECTURE.md` — rewrite paid-path sections; add Defense View Public Share viral loop.

### Authoring instructions
1. Backup before edit.
2. Author symmetric Buyer Maya paid path: Free → Solo → Starter → Growth → Scale → Enterprise. Document per-tier triggers per Phase 14.9 gating.
3. Author symmetric Seller Maya paid path: Free → Solo → Starter → Growth → Scale → Enterprise.
4. Confirm Hero Moment is v1 core, not v2.
5. Confirm forced-vendor-signup loop (M1) ships in v1.
6. Confirm Selection Report Public Link (M2) is a primary v1 viral loop.
7. **Add new viral loop — Defense View Public Share:** when Buyer Maya generates a Defense View, she can optionally share a watermarked link to her CFO/CISO. Link opens to a one-page summary with a "View this evaluation in Sourcera" CTA. Tertiary viral loop. Document anti-spam controls (suppression list, k-anonymity floor on aggregate Defense View shares per evaluation, Ops-maintained domain blocklist).
8. Confirm all 17 growth mechanics M1–M17 ship in v1.

### Verification gate
- Both symmetric paid paths authored.
- Hero Moment, M1, M2 confirmed v1.
- Defense View Public Share new viral loop documented with anti-spam controls.
- All M1–M17 sequenced as v1.

### Reconciliation log entry
> **Phase 14.13 — GTM_PLG_ARCHITECTURE.md rewrite (closed):** Symmetric Buyer Maya + Seller Maya paid paths authored with Solo tier on-ramp. Hero Moment, M1 forced-vendor-signup, M2 Selection Report Public Link confirmed v1 core. New tertiary viral loop "Defense View Public Share" added with anti-spam controls. All 17 growth mechanics confirmed v1.

### Stop conditions
- Anti-spam controls in Master Summary §3.5 cannot accommodate Defense View Public Share without modification → flag for revision in a follow-up phase before activating the loop.

---

## Phase 14.14 — GTM_SALES_PLAYBOOK.md Rewrite

### Goal
Dual-Maya bottom-up motion. AE/SE/Bid Manager seller targeting. Procurement-team-sale playbook removed; Enterprise-trigger founder-led path preserved.

### Read first
- `GTM_SALES_PLAYBOOK.md` — full.
- Updated GTM_POSITIONING.md (post Phase 14.12) — full.

### Edit
- `GTM_SALES_PLAYBOOK.md` — full rewrite of motion sections.

### Authoring instructions
1. Backup before edit.
2. **Buyer-side motion:** bottom-up to Buyer Maya. Targeting: IT Director, InfoSec Lead, Ops Lead at 200–2,000-person companies, regulated verticals favored. Channels: r/sysadmin, r/cybersecurity, r/ITManagers, /r/devops, Pavilion, CISO Slack groups, LinkedIn DM. Procurement Foundry is secondary, not primary. Founder-led sales is org-expansion only — triggered by a second Maya at the same org or by a tier-upgrade trigger.
3. **Seller-side motion:** bottom-up to Seller Maya. Title-agnostic targeting: Account Executive, Solutions Engineer, or Bid Manager at 50–500-person B2B SaaS vendors. Forced-vendor-signup (M1) is the primary cold-start; warm outbound to AE/SE community Slacks (Modern Sales Pros, Bravado, RevGenius) is secondary.
4. Replace existing procurement-team-sale playbook with the Maya-conversion playbook.
5. Preserve Enterprise-trigger founder-led path: SSO required, DPA required, ≥$12K AI commit, custom integration.
6. Document discovery question framework (the five-question program from the validation framework) as the standard Buyer Maya intake interview.

### Verification gate
- Buyer-side and seller-side persona targeting aligned with Master Summary §1 / GTM_POSITIONING.md.
- Bottom-up motion documented for both consoles.
- Enterprise-trigger founder-led path preserved.
- Five-question discovery framework embedded.

### Reconciliation log entry
> **Phase 14.14 — GTM_SALES_PLAYBOOK.md rewrite (closed):** Sales playbook rewritten around dual-Maya bottom-up motion. AE/SE/Bid Manager targeting on seller side; IT/InfoSec/Ops on buyer side. Enterprise-trigger founder-led path preserved. Five-question discovery framework embedded as standard intake interview.

### Stop conditions
- None.

---

## Phase 14.15 — GTM_90DAY_SPRINT.md Rewrite

### Goal
90-day operator-led plan around dual-Maya cohort building. Solo-operator capacity-aware.

### Read first
- `GTM_90DAY_SPRINT.md` — full.
- Validation framework Section 4 (find first 10 customers) from the Cowork session 2026-04-26 — full.

### Edit
- `GTM_90DAY_SPRINT.md` — full rewrite of weekly plan.

### Authoring instructions
1. Backup before edit.
2. Author week-by-week plan:
   - **Weeks 1–4:** Buyer Maya outreach (5 LinkedIn DMs/day, 5 community engagements/week, 5 warm-intro asks/week) + content production (per-vertical eval starter content for SEO matching the six default verticals from Phase 14.7).
   - **Weeks 5–8:** First Buyer Maya conversion cycle. Founder personally co-runs the first 2–3 evals end-to-end. Document every friction.
   - **Weeks 9–13:** Buyer Maya cohort scale to 10. Seller Maya cohort seeded organically via M1 forced-vendor-signup from Buyer Maya evals. Founder begins withdrawing from the eval-running loop.
3. Document daily and weekly metrics for each phase: conversations scheduled, conversations completed, evals running, evals completed, paying customers, founder-hours-per-eval (must trend toward zero).
4. Add a "Stop and re-scope" decision point at week 10: if founder is still required in every eval, the product is a paid consulting practice — re-scope honestly before raising or hiring.

### Verification gate
- Plan reflects dual-Maya focus.
- Validation framework discovery program embedded.
- Concrete weekly milestones with metrics.
- Stop-and-re-scope decision point documented.

### Reconciliation log entry
> **Phase 14.15 — GTM_90DAY_SPRINT.md rewrite (closed):** 90-day plan rewritten around dual-Maya cohort building. Weeks 1–4 outreach + content; weeks 5–8 first conversion cycle with founder co-running; weeks 9–13 cohort scale to 10 with Seller Maya seeded organically. Stop-and-re-scope decision point at week 10.

### Stop conditions
- None.

---

## Phase 14.16 — Build_Execution_Strategy + Linear_Execution_Blueprint Updates

### Goal
Add net-new milestones (Defense View, Single-Operator Mode, per-vertical eval starters, Solo tier billing surface, Appendix M maintenance gate). **No resequencing.** Existing milestones for Hero Moment, KB engineering, Marketplace destination, dual-console firewall, all 17 growth mechanics remain in v1 scope.

### Read first
- `Build_Execution_Strategy.md` — full.
- `Linear_Execution_Blueprint.md` — full.
- All v7.1.0 phases authored to date — for net-new milestone scoping.

### Edit
- `Build_Execution_Strategy.md` — add net-new milestones to existing structure.
- `Linear_Execution_Blueprint.md` — add net-new milestones with implementation packs and AGENTS.md scoping.

### Authoring instructions
1. Backup before edit.
2. Add net-new milestones:
   - **Defense View** (Master Spec §13.X) — entity, AIOp, UX surface, PDF export. Implementation pack scoped.
   - **Single-Operator Mode** (Master Spec §2.X + §4 enum + §3.X surface compression) — engine field, surface compression, mode switching.
   - **Per-vertical eval starters** (Master Spec §13.X + `EvalStarter` entity) — six default verticals seeded with Use Cases / Requirements / rubric / longlist content.
   - **Solo tier billing surface** (Master Spec §44.X + UX) — Solo-tier billing card, throttling notification, hidden wallet/rate card surfaces.
   - **Appendix M maintenance gate** (CI / process) — every PR introducing a new engine concept must include an Appendix M row update; gate enforced in CI per Phase 14.18.
3. Confirm existing milestones for Hero Moment, KB engineering, Marketplace destination, dual-console firewall, all 17 growth mechanics remain v1.
4. Update Linear project structure: add net-new projects/milestones; do not remove or defer any existing project.

### Verification gate
- Net-new milestones added with implementation pack scoping.
- No existing milestones removed or deferred.
- Linear project structure consistent.

### Reconciliation log entry
> **Phase 14.16 — Execution strategy updated (closed):** Net-new milestones added: Defense View, Single-Operator Mode, per-vertical eval starters, Solo tier billing surface, Appendix M maintenance gate. No existing milestones removed or deferred. Hero Moment, KB engineering, Marketplace destination, dual-console firewall, all 17 growth mechanics remain v1.

### Stop conditions
- Linear blueprint refers to phasing language (v1/v2) inconsistent with single-ship discipline → reconcile language; confirm with operator that single-ship is still authoritative.

---

## Phase 14.17 — UX Discipline: First-30-Seconds Test

### Goal
Make the surface-simplicity discipline operationally enforceable inside `UX_Design_of_Sourcera.md`. Every new surface authored from this point must pass the test.

### Read first
- `UX_Design_of_Sourcera.md` — full.
- `Sourcera_Master_Spec.md` §3 (Principle 9) and Appendix M.

### Edit
- `UX_Design_of_Sourcera.md` — new section "First-30-Seconds Test" + edits to existing component specs to retro-document.

### Authoring instructions
1. Backup before edit.
2. Add a top-level section "First-30-Seconds Test" near the start of `UX_Design_of_Sourcera.md`, after the design posture statement.
3. Body:
   - Every new UI surface authored in this spec must include a "First 30 Seconds" sub-section that documents:
     - **What the user sees** on the screen (1–2 sentences).
     - **What they understand** without training (1 sentence).
     - **What they do next** (1 action).
     - **What is hidden** and why (cross-reference Appendix M row).
   - If the documented 30 seconds requires the user to learn a Sourcera-specific concept, the surface is over-engineered and must be re-scoped before merge.
   - Cross-reference Master Spec Principle 9 (§3.X) and Appendix M.
4. Retro-document the test for the four surfaces authored in v7.1.0:
   - Buyer Maya onboarding (Phase 14.7).
   - Defense View (Phase 14.5).
   - Compressed pipeline progress bar (Phase 14.6).
   - Seller Maya magic-link landing (Phase 14.8).
5. Add a CI-gate note: PRs introducing a new UI surface must include the First-30-Seconds Test sub-section; missing test = PR blocked.

### Verification gate
- "First-30-Seconds Test" section authored.
- Four v7.1.0 surfaces retro-documented.
- CI-gate note documented.

### Reconciliation log entry
> **Phase 14.17 — First-30-Seconds Test (closed):** UX spec now contains the operational quality gate for Principle 9. Pattern documented; four v7.1.0 surfaces retro-documented; CI-gate note for future UI authoring.

### Stop conditions
- None.

---

## Phase 14.18 — Decisions Ledger Close-Out + CI-Gate Authoring

### Goal
Close the seven decisions resolved by the Cowork session 2026-04-26. Author the CI-gate logic that enforces Appendix M coverage on every spec change.

### Read first
- `_integration/Decisions.md` — full.
- `_integration/RECONCILIATION.md` — v7.1.0 program section.

### Edit
- `_integration/Decisions.md` — close the seven decisions.
- `_integration/RECONCILIATION.md` — finalized close-out entry.
- `Sourcera_Master_Spec.md` Appendix M — append the CI-gate specification.

### Authoring instructions
1. Close the following decisions in `_integration/Decisions.md`, each with date 2026-04-26 and rationale "Cowork session 2026-04-26":
   - **D-7.1-001 Solo pricing model:** closed → Option A symmetric ($49/mo or $199/eval-or-bid on both consoles).
   - **D-7.1-002 Defense View scope:** closed → simple (talking points + evidence + one-page CFO summary). No multi-stakeholder rehearsal modes.
   - **D-7.1-003 Seller-side ship sequencing:** closed → full v1, no deferral. Hero Moment ships in v1.
   - **D-7.1-004 Marketplace ship sequencing:** closed → full v1, destination page included. Marketplace = "The Programmatic RFP Exchange" marquee.
   - **D-7.1-005 Build sequence:** closed → single ship, no v1/v2 phasing.
   - **D-7.1-006 Category framing:** closed → SEP retained as headline; "Programmatic RFP Exchange" is a marquee positioning of the Marketplace, not a category rename.
   - **D-7.1-007 v7.0.0 vs v7.1.0 sequencing:** closed → finish v7.0.0 cleanly first, then run v7.1.0 program. Do not absorb mid-v7.0.0.
2. CI-gate authoring in Appendix M:
   - Add a closing sub-section to Appendix M titled "CI Gate — Appendix M Coverage."
   - Specify: every PR that touches `Sourcera_Master_Spec.md` and introduces a new engine concept must include an Appendix M row in the same diff. Lint check enforces presence of an Appendix M row update when the diff adds a new entity, AIOperation, capability, enum value, plan-tier feature, webhook event, or notification event.
   - Failure mode: PR is blocked with a comment naming the missing concept.
   - Override path: explicit `@appendix-m-internal-only` annotation in the PR description, requiring a one-line justification ("internal-only construct, not surfaced") that auto-generates the corresponding Appendix M row marked as `internal-only, never surfaced`.
3. Reconciliation log: append closing summary citing the seven closed decisions and the CI gate.

### Verification gate
- All seven decisions closed with rationale.
- CI gate spec authored in Appendix M.
- Reconciliation log entry appended.

### Reconciliation log entry
> **Phase 14.18 — Decisions ledger close-out + CI gate (closed):** Seven decisions D-7.1-001 through D-7.1-007 closed with full rationale. Appendix M now contains the CI-gate specification enforcing Appendix M coverage on every Master Spec change. Override path documented for internal-only constructs.

### Stop conditions
- Existing decision IDs in `Decisions.md` collide with D-7.1-NNN namespace → renumber and document.

---

## Phase 14.19 — Adversarial Review Pass

### Goal
Hostile-staff-engineer review of the v7.1.0 corpus state. Block final stamp on any P0 defect.

### Read first
- Full diff between v7.0.0 baseline (`_versions/Sourcera_Master_Spec.v7.0.0-pre-v7.1-2026-04-26.md`) and current `Sourcera_Master_Spec.md`.
- All v7.1.0-touched files: Master Summary, both pricing strategy docs, UX spec, GTM_POSITIONING, GTM_PLG_ARCHITECTURE, GTM_SALES_PLAYBOOK, GTM_90DAY_SPRINT, Build_Execution_Strategy, Linear_Execution_Blueprint, Decisions.md, RECONCILIATION.md.
- `_integration/PHASE14_VERIFY.md` — current phase log.

### Edit
- `_integration/PHASE14_VERIFY.md` — populate adversarial findings.

### Authoring instructions
1. Adopt a hostile reviewer posture. For every change, audit:
   - **Acceptance criteria completeness** — every new feature has numbered, observable, scope-bound criteria per Master Spec §13.10 / §14.9 / §17.8 / §20.7 style.
   - **Appendix M coverage** — every new engine concept has a row.
   - **Plan-tier consistency** — Master Spec §34.1, both pricing strategy docs, §5.11, §39, Appendix tables all agree.
   - **Surface-engine coupling defects** — any surface element that exposes engine concepts (AIOps, Capability Declarations, etc.) on Solo/Free where Phase 14.10 / 14.8 hide them.
   - **Cross-reference integrity** — Principle 9 ↔ Appendix M ↔ feature sections; no broken anchors.
   - **Numerical-value drift** — every dollar/character/file-size/duration cited from §34 / §39 / §44 / §6.8 / §40.2 / §42.1; no inline duplicates.
   - **Anti-pattern surfacing** — any feature exposing engine internals to Solo tier.
   - **DSAR / GDPR / data-residency compatibility** — new entities (`DefenseView`, `EvalStarter`) state retention, DSAR behavior, data residency.
   - **Mobile vs desktop divergence** — new surfaces (Defense View, onboarding, magic-link landing) document mobile behavior.
   - **Buyer/seller console firewall preservation** — no new surface leaks across console.
   - **Marketplace-domain leakage** — `EvalStarter` is marketplace-domain; ensure scoping is correct.
   - **Timezone, locale, currency formatting** — Solo tier billing surface, deadline countdown.
   - **Downgrade paths** — Solo → Free preserves data per §6 retention.
   - **Right-to-erasure compatibility** — Defense View, EvalStarter included in DSAR scope per §6.8.
2. For each defect found, write: defect ID, severity (P0 = blocks final stamp; P1 = must fix in v7.1.1; P2 = backlog), recommended fix, owner phase to revisit.
3. Status: `complete` | `requires-rework` | `escalate-to-human`.
4. If any P0 defects: revisit the affected phase, fix, then re-run Phase 14.19. Do not proceed to Phase 14.20.

### Verification gate
- Adversarial review log complete and populated.
- All P0 defects resolved.
- Status `complete` recorded.

### Reconciliation log entry
> **Phase 14.19 — Adversarial review pass (closed):** v7.1.0 corpus reviewed against [N] audit dimensions. P0 defects: [N, all resolved]. P1 defects: [N, scheduled for v7.1.1]. P2 defects: [N, backlog]. Status: complete. Cleared for final stamp.

### Stop conditions
- Any P0 defect open → halt; do not proceed to Phase 14.20 until resolved.

---

## Phase 14.20 — Final Stamp: v7.1.0

### Goal
Version-bump, changelog, CLAUDE.md update, final reconciliation entry.

### Read first
- `Sourcera_Master_Spec.md` front matter and changelog.
- `Sourcera_Master_Summary.md` front matter.
- Both pricing strategy docs front matter.
- `CLAUDE.md` (project root).
- `_integration/RECONCILIATION.md` v7.1.0 section.

### Edit
- `Sourcera_Master_Spec.md` front matter → version `7.1.0`.
- `Sourcera_Master_Spec.md` changelog → v7.1.0 changeset summary.
- `Sourcera_Master_Summary.md` front matter → version `1.2`.
- `Sourcera_Master_Summary.md` changeset note.
- `Sourcera_Buyer_Pricing_Strategy.md` and `Sourcera_Seller_Pricing_Strategy.md` → version `v3`.
- `CLAUDE.md` → updated `Last updated` date and `Corpus state` line.
- `_integration/RECONCILIATION.md` → final close-out entry.

### Authoring instructions
1. Bump Master Spec front matter to v7.1.0 with date.
2. Author the v7.1.0 changeset summary citing every closed phase 14.1 through 14.18:
   - 14.1 Principle 9 added; 14.2 Appendix M authored; 14.3 `evaluation_owner_mode`; 14.4 Single-Operator Mode; 14.5 Defense View; 14.6 Pipeline surface compression; 14.7 Buyer Maya onboarding + EvalStarter; 14.8 Seller Maya surface polish; 14.9 Solo tier symmetric; 14.10 AI consumption invisibility; 14.11 Master Summary §1 rewrite; 14.12 GTM_POSITIONING rewrite; 14.13 GTM_PLG_ARCHITECTURE rewrite + Defense View Public Share viral loop; 14.14 GTM_SALES_PLAYBOOK rewrite; 14.15 GTM_90DAY_SPRINT rewrite; 14.16 Execution milestones added; 14.17 First-30-Seconds Test; 14.18 Decisions ledger + CI gate.
3. Bump Master Summary to v1.2 with parallel changeset note.
4. Bump pricing strategy docs to v3.
5. Update `CLAUDE.md`:
   - `Last updated` → today's date.
   - `Corpus state` → `Master Spec v7.1.0 stamped. v7.1.0 Surface-Abstraction & Dual-Maya program complete. Baseline v7.0.0 snapshot at /_versions/. Next program is TBD.`
6. Update §17 (Known Drift / Open Issues) in `CLAUDE.md` to reflect v7.1.0 state. Specifically: Master Summary v1.2 supersedes prior; Solo tier and Defense View are now authoritative in Master Spec; Appendix M is the canonical surface/engine contract; CI gate is active.
7. Append final reconciliation entry: `v7.1.0 stamp: [date]. Source authority: Cowork session 2026-04-26 + adversarial pass complete. Program closed.`

### Verification gate
- All version numbers bumped consistently.
- Changelog entries complete.
- CLAUDE.md updated.
- Reconciliation log final entry present.
- All v7.1.0 phases marked closed in PHASE14_VERIFY.md.

### Reconciliation log entry
> **Phase 14.20 — v7.1.0 stamped (program closed):** Master Spec v7.1.0, Master Summary v1.2, pricing strategy docs v3. CLAUDE.md updated. Surface-Abstraction & Dual-Maya program closed. Baseline preserved at `_versions/Sourcera_Master_Spec.v7.0.0-pre-v7.1-2026-04-26.md`. Source authority: Cowork session 2026-04-26 + adversarial pass complete.

### Stop conditions
- Phase 14.19 status not `complete` → halt; do not stamp v7.1.0.

---

## Operator Notes

**Session-per-phase discipline.** Each phase is one Claude session. Open with: *"Run Phase 14.N from `Integration_Prompts_v7.1.md`."* Do not run multiple phases in one session — context discipline degrades and reconciliation accuracy suffers.

**Backup discipline.** Phase 14.0 takes the program-opening snapshots. Every subsequent destructive edit takes its own per-phase snapshot using the pattern `_versions/{Filename}.v{current-version}-pre-v7.1.{phase}-{YYYY-MM-DD}.md`.

**Cross-phase dependencies.** The dependency order is roughly: 14.0 → 14.1 → 14.2 (foundational) → 14.3 → 14.4 → 14.5–14.10 (parallelizable in principle but recommended sequential for reconciliation cleanliness) → 14.11 → 14.12–14.16 (GTM/execution downstream) → 14.17 → 14.18 → 14.19 → 14.20. Do not execute 14.20 until 14.19 returns `complete`.

**Adversarial review failures.** If Phase 14.19 finds P0 defects, return to the affected phase, fix, then re-run 14.19. Do not skip the re-run — the audit is the gate.

**Authored extensions.** Where a phase requires authoring detail not present in the Cowork session 2026-04-26 source, mark the addition as **Authored Extension — requires human sign-off** in the relevant section. The adversarial review pass (Phase 14.19) flags all authored extensions as P1 for explicit operator approval before stamp.

**Out-of-scope.** This program does not change the dual-console firewall logic, the underlying 13-phase engine, the AIOperation rate card formula (`value = cost_base × 10`; `cost = cost_base × 1.05`), the cross-side billing pooling logic, the seller-side network effect inventory beyond the surface-abstraction pass, the verification tiers, the anti-spam controls beyond the Defense View Public Share addition, or any data residency / DSAR / retention semantics. If any of these need to change, scope a separate v7.2 program.

**Program ownership.** Blake (operator). Adversarial review may be delegated to a fresh Opus session with no prior context for independence.
