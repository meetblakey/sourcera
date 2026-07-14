# Sourcera Master Spec — Production-Readiness Audit Prompt Program

**Version:** 1.0
**Author:** Sourcera Technical Product Strategy
**Required Model:** **Claude Opus 4.6 (1M context)** — every prompt in this program must be run with Opus. Audit gates are calibrated for Opus-level depth, cross-document synthesis, and adversarial review. Sonnet/Haiku will silently miss whole defect classes (numerical-singleton drift, RBAC/firewall leakage, retention/DSAR breaks, Appendix-M coverage holes, Authored Extension ratification gaps).
**Baseline:** `Sourcera_Master_Spec.md` v7.1.0 (2026-04-28). Snapshot reference: `_versions/Sourcera_Master_Spec.v7.0.0-pre-v7.1-2026-04-26.md`.
**Purpose:** Sequenced, pastable prompt program that audits the entire Master Spec at production-grade fidelity. Confirms that every feature is fully defined, plan-gated, instrumented, retention-typed, residency-typed, DSAR-compatible, accessibility-compliant, surface/engine-mapped, and cross-document-consistent. Identifies every gap and produces a prioritized remediation backlog.
**Outcome:** A defensible production-readiness verdict for v7.1.0 plus a P0/P1/P2 remediation backlog, persisted under `/Sourcera/_audit/`.

> This program is **non-destructive by default**. The audit produces findings and proposed edits; remediation is a separate execution step (run on a per-defect basis, via the same authoring conventions used by `Integration_Prompts.md`). Do not edit `Sourcera_Master_Spec.md` from inside an audit prompt unless the prompt explicitly instructs you to do so.

---

## How to Use This Program

1. Run each prompt in a **separate, fresh Cowork session on Opus** against the Sourcera project folder. Fresh sessions force every audit to re-derive findings from authoritative source files instead of inheriting earlier conclusions.
2. **Run in numeric order within a phase.** Phases have ordering dependencies — feature inventory before convention audits, convention audits before cross-document reconciliation, reconciliation before final verdict.
3. **Persist every audit run.** Each prompt writes to `/Sourcera/_audit/` under deterministic filenames (see `Audit Workspace Layout` below). The directory is the audit's source of truth — never let conclusions live only in the chat scrollback.
4. **Run the `V` (Verification) prompt at the end of each phase before advancing.** V prompts are full adversarial reviews, not checkbox passes. They MAY find additional defects that the phase's authoring prompts missed; if they do, append to the defect ledger and remediate before advancing.
5. **Do not skip Phase 0.** It produces the Feature Inventory, the Coverage Matrix, and the Authoritative-Source Cross-Reference Map. Every later phase depends on these artifacts.
6. **Defect severity is rule-based, not vibe-based.** Use the `Severity Definitions` block below. Self-classifications drift over time; rule-based classifications stay defensible.
7. **No model budgeting constraints.** Audit prompts are sized for depth, not token economy. If Opus wants to read a section end-to-end, follow citations into other documents, or produce a longer artifact than feels minimal, let it.
8. **Read source documents in full.** This is a v7.1.0-fidelity audit. Sampling headings will miss defects; the program assumes Opus has the budget to read entire sections.

---

## Audit Workspace Layout

The audit creates and writes to a dedicated directory. Phase 0 seeds it; later phases append to it.

```
/Sourcera/_audit/
  AUDIT_README.md                  — version, scope, run log
  FEATURE_INVENTORY.md             — every feature found in spec & companion docs
  COVERAGE_MATRIX.md               — feature × convention-dimension grid
  AUTHORITATIVE_SOURCE_MAP.md      — § anchor → authoritative-source link table
  DEFECT_LEDGER.md                 — every finding, append-only, P0/P1/P2/P3
  REMEDIATION_BACKLOG.md           — Phase-15 output (curated from defect ledger)
  PHASE0_VERIFY.md … PHASE15_VERIFY.md  — per-phase adversarial review logs
  PHASE{N}_FINDINGS.md             — per-phase scratch log of findings before promotion to ledger
  CONSISTENCY_DELTA.md             — Phase-14 cross-document drift inventory
  PRODUCTION_READINESS_VERDICT.md  — Phase-15 final artifact
```

Do not place audit artifacts elsewhere. Do not write to `/Sourcera/_integration/` from this program — that directory is reserved for the v7.0.0 integration program and must remain stable.

---

## Defect Ledger Format

`DEFECT_LEDGER.md` is the audit's authoritative findings store. Every defect is one row.

| Column | Definition |
|---|---|
| `defect_id` | `D-<phase>-<seq>` (e.g., `D-1.3-007`) **or** `D-<phase-mnemonic>-<seq>` (e.g., `D-AS-001` for Phase 1.1 Authoritative-Source Map sweep; `D-0V-001` for Phase 0 Verification). Sequential within a phase or mnemonic-bound sweep. The phase-mnemonic form is permitted to keep prompt-scoped ID strings stable across rolls of the phase numbering and to minimize cross-reference invalidation when a sweep spans more than one prompt within a phase. Once a defect_id is published, it is immutable; reroll via a forwarding row in DEFECT_LEDGER.md if a renumber is genuinely required. |
| `severity` | `P0` / `P1` / `P2` / `P3` per the Severity Definitions below. |
| `class` | `data_model` / `enum` / `glossary` / `rbac` / `acceptance_criteria` / `state_machine` / `api` / `webhook` / `notification` / `posthog_event` / `error_code` / `plan_gating` / `entitlement` / `numerical_singleton` / `retention` / `dsar` / `residency` / `firewall_leakage` / `surface_engine_mapping` / `ci_gate` / `consistency_drift` / `authored_extension` / `glossary_canonicality` / `accessibility` / `mobile_divergence` / `performance_budget` / `observability` / `test_coverage` / `instrumentation_gap` / `network_effect_gap` / `growth_mechanic_gap` / `documentation_gap`. Add a class only if every existing class is a worse fit; new classes go in the ledger header. |
| `location` | Section anchor (e.g., `§4.4 → SellerSoftware`) or appendix reference. Include line number range when relevant. |
| `summary` | One-sentence statement of the defect. Concrete and falsifiable. |
| `evidence` | Quote, line number, table cell, or cross-document delta. Must be reproducible. |
| `convention_violated` | The convention or contract the defect violates (e.g., "Master Spec authoring convention §4.1 — every entity must declare retention"). |
| `recommendation` | One-sentence proposed fix. If the fix is structural and large, link to a follow-up `RECOMMENDATION_<id>.md` artifact under `/Sourcera/_audit/`. |
| `remediation_owner_hint` | Default-suggested owner: `engineering` / `design` / `pricing` / `ops` / `security` / `legal` / `analytics` / `unassigned`. |
| `phase_owner` | The phase that found it (e.g., `Phase 1`). |
| `status` | `open` / `proposed_extension` / `wont_fix` / `remediated` / `superseded`. |
| `links` | Cross-references to related defects, Authored Extensions ledger entries, or `_integration/Decisions.md` rows. |

The ledger is append-only. Do not delete defects; transition `status` instead.

---

## Severity Definitions

Severity is rule-based. Use the first matching rule.

| Severity | Rule |
|---|---|
| **P0** | The defect blocks production deployment of v7.1.0 because it (a) breaks the buyer/seller console firewall, (b) exposes PII or PCI scope to an unintended actor, (c) violates a hard regulatory requirement (GDPR right-to-erasure, US/EU data-residency lock, audit-log integrity), (d) leaves a billing surface (AIOperation, AIWallet, OutcomeContract, Stripe metering) ambiguous in a way that allows revenue leakage or double-charge, or (e) leaves a CI gate referenced in `Build_Execution_Strategy.md` runtime-unwireable as written. |
| **P1** | The defect makes a feature unbuildable as written: missing field-level schema, missing acceptance criteria, missing state machine, missing error code, missing webhook contract, missing plan-gating row in §5.11/§34.1/§39, missing retention/DSAR/residency clause, conflicting numerical singleton between Master Spec and a companion strategy doc, or surface introduced without an Appendix-M row. |
| **P2** | The defect makes a feature ambiguous in a way that a thoughtful staff engineer could resolve, but the resolution is not the *same* across two readers (e.g., undefined edge case, soft-state behavior, sparse error-code coverage, accessibility gap that does not block compliance, mobile parity not specified, observability instrumentation under-specified). |
| **P3** | Cosmetic, terminological, or documentation drift that does not affect implementation but reduces spec hygiene (heading anchor missing, glossary entry duplicated, Appendix-J value listed but with stale comment, retired-document reference still present). |

Tiebreakers: when in doubt between P1 and P2, default to P1 if a junior engineer would build the wrong thing. Default to P0 only when the rule above explicitly applies — P0 is reserved for genuinely-blocking defects so that the production-readiness verdict reflects real shippability.

---

## Coverage Matrix Format

`COVERAGE_MATRIX.md` is a feature × convention grid. Every feature in the Feature Inventory is one row; every convention dimension is one column. Cell values are `✅`, `⚠ partial`, `❌ missing`, or `n/a`. Phase 0 seeds the matrix; later phases populate cells as audits produce findings.

Required columns (minimum):

```
feature_id | feature_name | section_anchor | data_model | enums |
glossary | rbac | plan_gating (§5.11/§34.1/§39) | acceptance_criteria |
state_machine | api | webhook | notifications | posthog_events |
error_codes | retention | dsar | residency | console_firewall |
empty_state | loading_state | error_state | retry_idempotency |
mobile_parity | accessibility | i18n | performance_budget |
surface_engine_mapping | ci_gate_coverage | observability |
test_coverage | growth_mechanic_link | network_effect_link |
authored_extension_status
```

A column is `n/a` only when the convention is structurally inapplicable (e.g., a marketing landing page has no state machine; a non-AI feature has no AIOperation). Justify every `n/a` in a comment column or a footnote.

---

## Global Verification Protocol

Every `V` prompt inherits the adversarial structure defined in `Prompt V0` below: Structural Checks → Adversarial Checks (hostile-reviewer persona) → Cross-Phase Linkage Check → Known Gaps → Sign-Off Criteria. When running any later V prompt, append the V0 adversarial pattern to the specific checks listed in that V prompt. The explicit bullets in each V prompt are the *minimum* set — Opus should exceed it.

If any V prompt finds an unresolved P0 or P1 defect, STOP. Do not advance. Append remediation tasks and resolve before continuing.

---

## Global Conventions Preamble

> **The following block must be pasted at the top of every audit prompt below.** It enforces audit posture, output discipline, and the spec's authoring conventions. It is the audit-mode equivalent of the Global Conventions Preamble in `Integration_Prompts.md`.

```
CONTEXT
You are acting as the senior technical product strategist and staff engineer for the
Sourcera platform, running on Claude Opus. You are AUDITING `Sourcera_Master_Spec.md`
v7.1.0 — the authoritative build specification — for production-grade specificity.
You are not authoring new product behavior unless the prompt explicitly instructs
you to author a remediation. Your job is to find defects, classify them, and
record them in the audit defect ledger.

You have full reasoning budget; depth, edge-case coverage, and consistency are
the goals, not brevity.

MODEL EXPECTATIONS (OPUS)
- Read every cited source document in full before producing findings. Do not
  skim. Do not infer content from headings. Opus's context budget is sufficient
  for the entire Sourcera corpus — use it.
- Adversarially review every section. Assume the section was written by a smart
  person under deadline. Where would a hostile reviewer attack? Look there.
- For every feature, walk the convention checklist below end-to-end. A feature
  that satisfies 7 of 8 conventions is not a passing feature; it is a feature
  with one defect.
- Surface edge cases the spec missed: concurrency, partial failure, permission
  denial, downgrade paths, data-residency collisions, timezone/locale issues,
  empty/loading/error UI states, retry semantics, idempotency, mobile divergence,
  guest scoping, console firewall integrity, marketplace-domain leakage.
- Where the spec is silent on an applicable dimension, FILE A DEFECT. Do not
  paper over silence by inferring intent.

AUDIT CHECKLIST (NON-NEGOTIABLE; DEFECTS MUST BE FILED FOR EVERY MISS)
For each entity, capability, or feature in scope of the prompt, verify:

1. ENTITY DEFINITION (§4 conventions). Full field table: Field | Type |
   Constraints | Notes. Includes id (UUID), org_id (FK) where applicable,
   console enum where applicable, created_at, updated_at, created_by,
   updated_by, deleted_at (nullable for soft delete). States scope isolation
   (org-scoped, console-scoped, workspace-scoped, marketplace-domain). States
   required indexes. States retention rules.

2. ACCEPTANCE CRITERIA (§13.10/§14.9/§17.8/§20.7 style). Numbered, testable,
   observable, measurable, scope-bound. Each criterion has observable inputs,
   observable outputs, and a measurable threshold.

3. ENUM REGISTRATION (Appendix J). Every enum value used in §4–§51 is registered
   in Appendix J. Every Appendix J value has at least one consumer in §4–§51.

4. GLOSSARY (Appendix K). Every term used across more than one section appears
   in Appendix K. Appendix K is the canonical Glossary (Phase 12.3 amendment;
   Appendix B is the Keyboard Shortcut Reference).

5. STATE MACHINES. Every state-transition is documented as a table with columns
   From | To | Trigger | Conditions | Notes. Prose state descriptions are NOT
   acceptable.

6. APIS (§32 conventions). Every endpoint declares method, path, auth scope,
   rate-limit class, cursor pagination (default 50, max 250), request schema,
   response schema, error codes (registered in Appendix I), idempotency
   semantics, concrete examples.

7. WEBHOOKS (§31 conventions). HMAC-SHA256 signed, idempotency via event_id,
   exponential backoff, DLQ after 5 failures, payload ≤256 KB, registered in
   Appendix C (Notification Event Catalog) and Appendix G (PostHog Taxonomy).

8. PLAN GATING. Reflected in §5.11 (Feature Access Matrix), §34.1 (Plan Tier
   Definitions), §39 (Object Size Constraints). Inline references cite the
   table; numerical limits are NEVER duplicated inline.

9. RETENTION & PRIVACY. Every new data class states retention (§40.2), DSAR
   behavior (§6.8), data-residency behavior, GDPR anonymization path. Cascade
   compatibility with parent soft-delete is documented.

10. NUMERICAL SINGLETONS. Every dollar figure, character limit, file-size
    limit, duration, rate-limit, k-anonymity floor, retention TTL has exactly
    one authoritative home (§34, §39, §44, §6.8, §40.2, §42.1). Inline references
    cite the source table, not the literal value.

11. HEADING SYNTAX. Format `## N.N Title {#n.n-title}` with anchor slugs.

12. SURFACE/ENGINE MAPPING (Appendix M). Every UI surface or engine concept
    has a corresponding Appendix M.1 row. New concepts trigger the
    `appendix_m_coverage_on_diff` CI gate per §M.4. Override path is the
    `@appendix-m-internal-only:` PR-description annotation.

13. CONSOLE FIREWALL (§1.3). No field, query path, or webhook event leaks data
    across the buyer/seller firewall. Cross-Console Bridge entities (§4.7)
    explicitly enumerate carried vs. redacted fields.

14. EDGE CASES. First-time vs returning users; empty / loading / error / retry
    / partial-completion states; validation; auth/permission failures;
    concurrency and sync conflicts; idempotency and retries; notification and
    webhook delivery failures; third-party outages (WorkOS, Stripe, Convex,
    Anthropic, Firecrawl, PostHog, Loops.so, Perplexity, Zendesk); mobile vs
    desktop divergence; admin vs end-user; guest scoping; marketplace-domain
    leakage; data residency (US / EU / custom); timezone, locale, currency;
    downgrade paths and data preservation; DSAR right-to-erasure compatibility.

OUTPUT PROTOCOL
- Append every finding to `/Sourcera/_audit/DEFECT_LEDGER.md` using the row
  format defined in `Audit_Prompts.md → Defect Ledger Format`.
- Update `/Sourcera/_audit/COVERAGE_MATRIX.md` cells for every feature in
  scope of the prompt. Mark `✅`, `⚠ partial`, `❌ missing`, or `n/a`.
- Maintain a running scratch log at `/Sourcera/_audit/PHASE{N}_FINDINGS.md`
  that promotes confirmed findings into the defect ledger at end of prompt.
- Do NOT edit `Sourcera_Master_Spec.md` directly unless the prompt explicitly
  instructs you to author a remediation. Audit prompts are non-destructive
  by default.
- Do NOT produce a "what I did" summary. The defect ledger is the summary.

SELF-CHALLENGE PASS (Opus-mandatory)
After running an audit prompt, re-read your own findings as a hostile reviewer.
For every defect filed: is the evidence reproducible? Is the severity
classification rule-based? Could the recommendation be sharper? Revise in
place before saving. Log self-challenge revisions in the same prompt's
PHASE{N}_FINDINGS.md scratch log.

COUNTERFACTUAL PASS
For every feature audited, enumerate at least three realistic failure modes
the spec must handle (partial failure, adversarial input, dependency outage)
and confirm the spec addresses each. If a failure mode is unhandled, file a
defect — do not author the handling inside an audit prompt.
```

---

# Phase 0 — Audit Scaffold, Feature Inventory, Coverage Matrix

Goal: Produce the deterministic inputs every later phase depends on. No defect ledger entries are created in this phase except those that surface as a side effect of the inventory pass; if found, those defects are filed under `Phase 0`.

### Prompt 0.1 — Audit Workspace Setup

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
1. Create `/Sourcera/_audit/` if it does not exist.
2. Seed `/Sourcera/_audit/AUDIT_README.md` with:
   - Audit Program Version: 1.0
   - Master Spec Baseline: v7.1.0 (read the Master Spec changelog header to
     confirm the current version stamp; if the baseline drifts, halt and ask
     the operator).
   - Run Log table (columns: phase | prompt | started_at | completed_at |
     opus_session_id | findings_count | status). Leave empty.
   - Pointers to the Master Spec, Buyer Pricing, Seller Pricing, KB
     Engineering Spec, UX Design, Authored Extensions ledger, Decisions
     ledger, RECONCILIATION.md.
3. Seed `/Sourcera/_audit/DEFECT_LEDGER.md` with:
   - Header explaining row format (cite Audit_Prompts.md).
   - Severity Definitions block (cite Audit_Prompts.md).
   - Empty `defects` table with the column headers.
4. Seed `/Sourcera/_audit/FEATURE_INVENTORY.md`, `COVERAGE_MATRIX.md`,
   `AUTHORITATIVE_SOURCE_MAP.md`, `CONSISTENCY_DELTA.md`,
   `REMEDIATION_BACKLOG.md`, `PRODUCTION_READINESS_VERDICT.md` as empty
   files with title-only headers. Later prompts populate them.

DO NOT touch `Sourcera_Master_Spec.md`. This prompt is pure scaffolding.

OUTPUT
Confirm in chat that all files exist with the expected headers. Append a
RUN row to AUDIT_README.md.
```

### Prompt 0.2 — Feature Inventory Extraction

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk every section of `Sourcera_Master_Spec.md` end-to-end, plus
`Sourcera_Buyer_Pricing_Strategy.md`, `Sourcera_Seller_Pricing_Strategy.md`,
`KB_Engineering_Spec.md`, `UX_Design_of_Sourcera.md`. Produce the canonical
list of every feature, surface, engine, and capability the platform claims
to deliver.

INPUTS (READ END-TO-END, NOT SAMPLED)
- Sourcera_Master_Spec.md §1–§51, Appendices A–M
- Sourcera_Buyer_Pricing_Strategy.md
- Sourcera_Seller_Pricing_Strategy.md
- KB_Engineering_Spec.md
- UX_Design_of_Sourcera.md

DEFINITION OF "FEATURE" FOR THIS AUDIT
A feature is any one of:
- A user-facing capability (e.g., "Defense View", "Single-Operator Mode",
  "Promoted Listings", "Buyer Maya Intake", "Seller Maya Polish")
- An engine concept (e.g., "Capability Registry", "Outcome Resolver",
  "Console Bridge", "Cost-Base Recalculation Job")
- A surface (e.g., "Buyer Pulse Inbox", "Seller KB Dashboard", "Marketplace
  Heat Map", "Vendor Discovery Search")
- A platform mechanic (e.g., "AIWallet auto-topup", "Buyer-Funded Pro Trial
  Seat Grant", "Forced-Vendor-Signup Playbook")
- A growth mechanic M1–M17 (§48)
- A pricing/billing primitive (AIOperation, OutcomeContract, etc.)

OUTPUT FORMAT (write to `/Sourcera/_audit/FEATURE_INVENTORY.md`)
One row per feature. Columns:

feature_id (F-NNN, sequential) | feature_name | feature_class
(user_capability / engine_concept / surface / platform_mechanic /
growth_mechanic / pricing_primitive / api_surface / integration_surface) |
primary_section_anchor | secondary_section_anchors | originating_doc
(master_spec / buyer_pricing / seller_pricing / kb_eng / ux_design) |
introduced_in_version | one_line_summary | known_dependencies
(comma-separated other feature_ids)

COVERAGE REQUIREMENTS
- Walk every § and every appendix. Do not stop at "obvious" features.
- Capture sub-features when they have independent acceptance criteria
  (e.g., Defense View has a state machine and 5 dedicated error codes
  per the v7.1.0 §13.11 work — that is a distinct feature).
- Capture every engine concept named in Appendix M.1.
- Capture every Anthropic dependency: Managed Agents, MCP server, skills,
  tool use, vector retrieval, memory store.
- Capture every webhook event in Appendix C and every API endpoint in §32
  (these are independent feature rows when they expose a behavior not
  otherwise enumerated as a user capability).
- Capture every Buyer/Seller plan tier and every plan-gated capability as
  separate rows.
- Capture every Authored Extension currently in the
  AUTHORED_EXTENSIONS_LEDGER.md.

VERIFICATION
At the bottom of FEATURE_INVENTORY.md, produce a count summary:
- total features
- count by feature_class
- count by originating_doc
- count of features whose primary_section_anchor is missing or unresolved
  (these are P0/P1 candidates — file a defect for each)

DO NOT edit the Master Spec.
```

### Prompt 0.3 — Coverage Matrix Construction

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Convert FEATURE_INVENTORY.md into COVERAGE_MATRIX.md. Every row in the
inventory becomes a row in the matrix. Add the convention-dimension
columns defined in Audit_Prompts.md → Coverage Matrix Format.

For each cell, perform a quick (NOT exhaustive) read of the feature's
primary section to seed a coverage value:

- ✅ if the convention dimension is clearly satisfied on a quick read
- ⚠ partial if some but not all of the convention's sub-checks are met
- ❌ missing if the dimension is silent
- n/a if the convention is structurally inapplicable

The Phase 0 pass is a SEED. Later phases will tighten cells with full
reads. Phase 0 is allowed to err toward ⚠ — later phases will resolve.

EVIDENCE COLUMN (MANDATORY)
For every cell that is not ✅, append a one-line evidence note: line
number, missing element, or "silent". This becomes the seed for Phase-N
defect filings.

OUTPUT
Updated COVERAGE_MATRIX.md. Run summary at the bottom:
- ✅ count
- ⚠ partial count
- ❌ missing count
- n/a count
- coverage % = ✅ / (✅ + ⚠ + ❌)

VERIFICATION
The matrix MUST have one row per feature in FEATURE_INVENTORY.md and
every required column in the Coverage Matrix Format. Sample 5 random
features and confirm the seeded values match a hostile-reviewer reading
of the section.
```

### Prompt 0.4 — Authoritative-Source Cross-Reference Map

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Produce `/Sourcera/_audit/AUTHORITATIVE_SOURCE_MAP.md` — a single table that,
for every numerical singleton, plan-gated limit, retention TTL, rate limit,
and pricing constant in the platform, names exactly one authoritative home
in the spec and lists every other location that references the value.

FORMAT (one row per singleton)
singleton_id | description | authoritative_section | authoritative_value |
referencing_locations (comma-separated § anchors and companion docs) |
notes (e.g., "FX-locked at billing time", "k-anonymity floor", "guest
exclusion rule")

COVERAGE REQUIREMENTS
- Walk §34 (plan tiers, AI consumption, rate cards) end-to-end. Every
  dollar figure, every plan-gating cell, every Marketplace Discovery
  Pricing constant.
- Walk §39 (Object Size Constraints) end-to-end.
- Walk §44 (Performance Requirements & Solo-Tier Surface Treatment).
- Walk §6.8 (DSAR / GDPR), §40.2 (retention), §42.1 (DR/RTO/RPO).
- Walk §44.6 (Solo-Tier Surface Treatment).
- Walk Buyer Pricing v3 and Seller Pricing v3 — companion docs that ARE
  expected to mirror Master Spec §34. Any drift becomes a P1 consistency
  defect filed in this prompt.

For each row, identify whether the authoritative section's value matches
every referencing location. If not, file a P1 numerical_singleton defect.
Mismatches between Buyer/Seller Pricing v3 and §34 are explicitly a P1
because §34 is authoritative per CLAUDE.md §2.

OUTPUT
- Updated AUTHORITATIVE_SOURCE_MAP.md
- Defect entries appended to DEFECT_LEDGER.md for every drift.

DO NOT edit the Master Spec or the pricing strategies. Filing the defects
is the work; remediation is later.
```

### Prompt V0 — Phase 0 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Adversarial verification of Phase 0. Produce
`/Sourcera/_audit/PHASE0_VERIFY.md`.

1. STRUCTURAL CHECKS
   - Confirm `/Sourcera/_audit/` contains all files listed in Audit
     Workspace Layout.
   - Confirm FEATURE_INVENTORY.md row count is plausible (a v7.1.0
     Master Spec has hundreds of features; an inventory under 200 rows
     is suspicious).
   - Confirm every row in FEATURE_INVENTORY.md is present in
     COVERAGE_MATRIX.md and vice versa.
   - Confirm AUTHORITATIVE_SOURCE_MAP.md covers — at minimum — every
     dollar figure in §34, every char/file/object limit in §39, every
     retention TTL in §40.2, every rate limit class in §32 and Appendix
     I, every k-anonymity floor in §27, and every Solo-Tier override in
     §44.6.

2. ADVERSARIAL CHECKS (Opus-expected depth)
   - Pick five features at random from FEATURE_INVENTORY.md. For each,
     re-read the primary section anchor and verify the seeded coverage
     cells match a hostile-reviewer reading. Flag any cell that the
     hostile reading would tighten.
   - Pick five rows at random from AUTHORITATIVE_SOURCE_MAP.md. Search
     the Master Spec for the value. If the value appears anywhere not
     already listed in the row's referencing_locations, that is a Phase-0
     evidence defect — file P3 documentation_gap.
   - Look for FEATURE_INVENTORY rows whose primary_section_anchor is
     "missing" or "TBD". File P0 documentation_gap for each — a feature
     without a home in the spec is a P0.
   - Look for any feature in COVERAGE_MATRIX.md with `n/a` in more than
     four columns. The convention list is broad enough that this is
     suspicious — re-validate.

3. KNOWN GAPS
   - List any feature you suspect exists but could not place. File a P3
     documentation_gap for each. Examples to check: Buyer Maya retry
     semantics, Defense View Solo-mode behavior, KB Hero Moment
     instrumentation, Cross-Console Bridge bounded-lag SLO.

4. SIGN-OFF CRITERIA
   - Zero P0 documentation_gaps after this prompt resolves the
     inventory.
   - COVERAGE_MATRIX.md row count == FEATURE_INVENTORY.md row count.
   - AUTHORITATIVE_SOURCE_MAP.md covers every singleton class enumerated
     in the structural checks above.

If any P0 finding cannot be resolved, STOP. Re-run Prompt 0.2 / 0.3 / 0.4
as needed.
```

---

# Phase 1 — Data Model Integrity Audit (§4)

Goal: Confirm every entity in §4 satisfies the §4.1 Model Design Principles, has a complete field table, declares scope isolation, declares retention, declares relationships, and is registered in Appendix J / Appendix K where required.

**Phase-1 Execution Modes (D-1V-014 remediation, 2026-04-29).** Phase 1's §4 audit MAY be executed in either of two modes:

- **Mode A — Sequenced Sub-Prompts (canonical).** Run prompts 1.1 → 1.7 in separate fresh Cowork sessions, each scoped to one §4 sub-section (1.1 §4.2 / 1.2 §4.3 / 1.3 §4.4 / 1.4 §4.5 / 1.5 §4.6 / 1.6 §4.7 / 1.7 §4.8). Each prompt produces its own scratch log promoted to the defect ledger.
- **Mode B — V1 Standalone Adversarial Read (substitution).** A single V1 verification pass executes the V1 adversarial-checks block as a standalone §4 audit, sampling ≥ 6 §4 entities deep-read across the seven sub-sections plus running the structural / cross-phase / Appendix J checks. Mode B is permitted as a substitute for Mode A when (a) the V1 pass meets the read-depth bar (≥ 6 entities deep-read with ≥ 3 sub-sections covered), (b) every defect surfaced is filed under `D-{phase-mnemonic}-NNN` with the standard ledger schema, and (c) the V1 verification log explicitly documents the standalone-read scope and the entities not covered (handed forward via a `D-{phase-mnemonic}-NNN` re-run-tracking row). Mode B closes Phase 1 once all P0/P1 defects are remediated.

**Defect-ID convention.** Phase-1 defects from Mode A use `D-1.X-NNN` (e.g., `D-1.1-007` for Phase 1.1 sub-prompt seventh defect). Phase-1 defects from Mode B use `D-1V-NNN` (the V1 verification mnemonic). Both forms are permitted per the Defect Ledger Format amendment in this file.

### Prompt 1.1 — §4.2 Organization & Auth Entities

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Audit §4.2 Organization & Auth Entities (Org, OrgConsole, OrgConsoleConfig,
User, OrgMembership, ConsoleMembership, ApiToken, MfaEnrollment, etc.).

CHECKS (file P0/P1/P2/P3 defects per Severity Definitions)
1. Every entity has a full field table. No prose-only entity definitions.
2. Every field has Type and Constraints. NULL semantics are explicit
   (NULL allowed / NOT NULL / soft-delete sentinel).
3. Every entity declares scope isolation in plain text (org-scoped /
   console-scoped / user-scoped / global).
4. Every entity declares required indexes — at minimum (org_id), and
   any composite index needed for the query patterns described in §32 /
   §17 / §51.
5. Every entity declares retention. Cite §40.2.
6. Every entity declares DSAR behavior. Cite §6.8.
7. Every enum referenced in §4.2 is registered in Appendix J. Every
   Appendix J value referenced from §4.2 has a consumer in §4.2 or
   downstream sections.
8. Every entity has a Glossary entry in Appendix K when the term is
   used outside §4.2.
9. Every FK declares soft-delete cascade behavior (parent soft-delete
   → child preserved, anonymized, or cascaded).
10. Org-Console firewall: confirm no §4.2 field can carry data across the
    firewall (e.g., a User table that joins to both buyer and seller
    workspaces must be schema-firewalled at the membership level).

OUTPUT
- Append findings to PHASE1_FINDINGS.md, then promote to DEFECT_LEDGER.md.
- Update COVERAGE_MATRIX.md cells for every feature whose primary anchor
  is in §4.2.

DO NOT edit the Master Spec.
```

### Prompt 1.2 — §4.3 Buyer Console Entities

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Audit §4.3 Buyer Console Entities (Workspace, Requirement, UseCase,
Vendor, ResponseItem, Score, Rubric, Scenario, TCOModel, QAThread,
TemplatePack, TimeSavedCredit, Internal Comment, Presence Record,
Unread Marker, Buyer Referral, Buyer-Funded Pro Trial Seat Grant,
Usage Event, etc.).

CHECKS (in addition to the §4.2 checklist)
1. Console isolation: every entity has `console = 'buyer'` (or equivalent
   firewall enforcement). Confirm no field can be queried from a seller
   session.
2. Workspace scope: entities scoped to a Workspace declare workspace_id
   and the cascade behavior on Workspace soft-delete.
3. Requirement-level entities (Score, ResponseItem, etc.) declare their
   bounded-lag SLO when surfaced through Console Bridge to a seller.
4. The Single-Operator Mode (§2.8) entities or attributes — confirm
   every Buyer entity that is suppressed under Solo Mode is annotated;
   reference §44.6 Solo-Tier Surface Treatment.
5. Defense View (§13.11) entities: confirm every Defense View concept
   has a corresponding §4.3 entity (e.g., DefenseView state, defense
   citations cache, defense-mode session).
6. Buyer Maya Intake (§13.12) entities: confirm intake records,
   capability output cache, and OutcomeContract linkage are in §4.3.
7. Idempotency: entities created via API endpoints declare an
   idempotency_key field where §32 says they should.
8. Authored Extensions ledger: cross-check whether any §4.3 entity
   originated as an Authored Extension; confirm AE-XX rows are still
   listed pending vs. ratified.

OUTPUT
- Defect ledger entries.
- Coverage matrix updates for buyer features.
- Specific attention: file a P1 if any Buyer feature has no §4.3 entity
  backing it (a feature without a model is unbuildable).
```

### Prompt 1.3 — §4.4 Seller Console Entities

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Audit §4.4 Seller Console Entities (SellerOrg, SellerSoftware, KB Entry,
KB Namespace, BidWorkspace, ResponseItem, Capability Declaration,
SellerOrgPage, SoftwarePage, CategoryPage, GuidePage, ComparisonPage,
MarketIntelligenceReport, HeatMapCell, GhostBidImport, SellerSignal,
PromotedListing, FeaturedPlacement, VerificationReviewRecord,
SellerOnboardingSession, etc.).

CHECKS (in addition to the §4.2 checklist)
1. Console isolation: every entity has `console = 'seller'` and is
   firewalled from buyer queries.
2. KB-namespace scope: KB-related entities declare kb_namespace and the
   cascade behavior on Seller Org delete / pause.
3. KB Value Capture (§22 / §6.13.7 in Summary v1.1): confirm KB
   entry-level fields exist for confidence score, staleness state,
   citation graph node, win-rate weight, provenance. Every field that
   the carry-over guarantee (§34.19) preserves on upgrade MUST exist.
4. Marketplace Discovery: PromotedListing, FeaturedPlacement,
   VerificationReviewRecord. Confirm:
   - PromotedListing carries auction-clearing fields.
   - FeaturedPlacement carries FTC-disclosure timestamp.
   - VerificationReviewRecord carries Ops reviewer FK and outcome.
5. Seller Onboarding Seven-Stage Flow (§49 + §6.28.2): confirm
   SellerOnboardingSession captures every stage, the elapsed_seconds
   target (p50 < 20 min), and the activation metric.
6. Seller Maya (§22.20): confirm every Seller Maya state has a backing
   entity or session record.
7. Vendor Opt-Out: confirm every public-facing seller entity carries a
   vendor_opt_out_honored_at column AND that the §4.7 Vendor Opt-Out
   Record cascades to all of them (cascade rule must be testable, not
   prose).
8. k-anonymity floors: confirm fields that aggregate buyer signal
   declare the k threshold (k=5 / k=10 / k=20 per §27).

OUTPUT
- Defect ledger entries.
- Coverage matrix updates for seller features.
- File P0 if any Seller field could leak buyer identity below the
  declared k-anonymity floor.
```

### Prompt 1.4 — §4.5 Marketplace Entities

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Audit §4.5 Marketplace Entities (Taxonomy Node, Controlled-Vocabulary
Tag, Vendor Opt-Out Record, Marketplace Abuse Report, EOI Acceptance
Record, Vendor Disqualification Record, MarketplaceDiscoveryRevenueRecord
where applicable, etc.).

CHECKS
1. Taxonomy nodes are versioned and deprecation-aware. Deprecated
   nodes preserve historical EOI traceability.
2. Controlled-Vocabulary Tags enforce sellers-cannot-create-freeform-tags.
3. Vendor Opt-Out Record is global, domain-verified, retroactive, and
   has a cascade rule that names every entity it propagates to.
4. EOI Acceptance Record formalizes the one-click acceptance flow from
   §27.5 — confirm fields support audit-grade reconstruction.
5. Vendor Disqualification Record: confirm rationale, who-marked-whom,
   appeal window, and the corresponding webhook (Appendix C) exist.
6. MarketplaceDiscoveryRevenueRecord (if §4.5; otherwise §4.8): confirm
   accounting isolation to `rev_marketplace_discovery` cost center, and
   independence from `rev_ai_wallet` and `rev_subscription`.

OUTPUT
- Defect ledger entries.
- Coverage matrix updates.
```

### Prompt 1.5 — §4.6 Audit & Logging Entities

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Audit §4.6 Audit & Logging Entities (AuditEvent, AuditEventActionType
enum, retention, immutability, regional storage).

CHECKS
1. AuditEvent is append-only — confirm spec explicitly states no
   updates/deletes are permitted, even via DSAR (DSAR redacts; it
   does not delete).
2. Every action_type referenced anywhere in the spec is registered in
   the Appendix-J Audit Event Action Types enum. Walk §13.5
   (score-modification audit), §22.20 (Seller Maya audit), §34
   (billing admin actions), §50 (Ops Console actions), §6.7 (auth
   audit), §51 (instrumentation audit) and reverse-check.
3. Audit retention is defined per data class (§40.2 must include audit
   events with their own TTL).
4. Audit residency is defined (US/EU split with no cross-region copy).
5. Audit-event payloads do NOT carry user-bearer secrets (passwords,
   raw API tokens, MFA seeds) — confirm the schema explicitly excludes
   secret fields.
6. DSAR right-to-erasure compatibility: confirm anonymization (not
   deletion) is the spec'd behavior for audit events.

OUTPUT
- Defect ledger entries; P0 for any leakage of secrets in audit
  payloads or any audit event whose action_type is unregistered.
```

### Prompt 1.6 — §4.7 Cross-Console Bridge Entities

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Audit §4.7 Cross-Console Bridge Entities (Console Bridge Event, Bid
Workspace ↔ Buyer Workspace materialized sync, redaction rules,
bounded-lag SLO).

CHECKS
1. Console Bridge Events name explicit fields that ARE carried and
   fields that are NEVER carried (PII, internal scores, Defense View
   notes, etc.). Confirm field-level redaction is testable.
2. Retry curve: exponential backoff, DLQ after 5 failures, 30-second
   bounded-lag SLO. Confirm spec'd.
3. Failure modes: sync_status enum covers pending/synced/failed and
   the spec covers each transition.
4. Replay semantics: spec must state how a stuck bridge is replayed
   without double-effecting on the seller side.
5. Console firewall integrity: file a P0 for any bridge field that
   could carry data the §1.3 firewall rule prohibits.

OUTPUT
- Defect ledger entries; this is the highest-risk surface for
  firewall leakage. Any P0 here halts the audit.
```

### Prompt 1.7 — §4.8 Billing & AI Accounting Entities

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Audit §4.8 Billing & AI Accounting Entities (AIOperation,
CapabilityRegistryEntry, AIWallet, OutcomeContract, ContestRecord,
CostBaseRecalculationLog, FreeAllowanceCounter, CommittedSpendContract,
PricingTableVersion, DowngradeExcessDataBucket, BillingSeatSnapshot,
MarketplaceDiscoveryRevenueRecord, SellerOutcomeSignalConfig).

CHECKS
1. AIOperation is immutable post-settlement. Confirm append-only
   semantics and the Appendix L state machine for settlement_state.
2. AIOperation declares fx_rate_locked + billing_currency at creation
   time (per Summary C.84). Confirm.
3. AIWallet is org-scoped and pooled across buyer + seller consoles
   in the Enterprise plan; soft-pooled or split otherwise — confirm
   per §34.10.
4. CapabilityRegistryEntry replaces hardcoded capability lists.
   Confirm every consumer in the spec references the registry, not
   a literal capability_id list.
5. OutcomeContract: confirm accepted/rejected signal rules, contest
   window (14 days), auto_accept_after_seconds.
6. ContestRecord: 14-day window, credits balance on approval.
7. CostBaseRecalculationLog: nightly job, drift_percent threshold
   (10%) for human approval.
8. MarketplaceDiscoveryRevenueRecord is in its own cost center
   (`rev_marketplace_discovery`) — confirm spec states accounting
   isolation from `rev_ai_wallet` and `rev_subscription`.
9. SellerOutcomeSignalConfig covers all 12 seller capabilities from
   Summary §2.9 (now §34.15) with accepted-signal, window, and
   timeout-default semantics.
10. Every monetary field uses integer cents — confirm; file P0 on
    any float dollar field.

OUTPUT
- Defect ledger entries; P0 for any settlement immutability gap, FX
  drift, currency ambiguity, or accounting cost-center mixing.
```

### Prompt V1 — Phase 1 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Adversarial verification of Phase 1. Produce
`/Sourcera/_audit/PHASE1_VERIFY.md`.

1. STRUCTURAL CHECKS
   - Confirm every entity in §4 has at least one row in COVERAGE_MATRIX.md
     and at least one cell evaluated.
   - Confirm DEFECT_LEDGER.md has Phase 1 entries for every ❌ in
     COVERAGE_MATRIX.md columns: data_model / enums / glossary /
     plan_gating / retention / dsar / residency / console_firewall.
   - Confirm no §4 field was authored or removed by the audit.

2. ADVERSARIAL CHECKS (Opus-expected depth)
   - For each new entity referenced by features in FEATURE_INVENTORY.md,
     verify the entity exists in §4. File P0 documentation_gap for
     missing entities.
   - For each FK in §4, simulate parent soft-delete: does the spec'd
     cascade behavior preserve referential integrity? Flag.
   - For each entity with retention, simulate DSAR right-to-erasure:
     can the spec'd behavior satisfy GDPR Article 17 without
     orphaning audit events? Flag.
   - For each entity with console scope, identify a query path that
     could (but should not) bridge the firewall. Confirm spec
     explicitly forbids that path.
   - For every Appendix J enum referenced in §4, confirm at least one
     consumer exists. Orphan enums are P3 documentation_gap.

3. CROSS-PHASE LINKAGE CHECK
   - Every §4 entity referenced by an API endpoint (§32) must have
     a request/response schema row in §32. File defects for missing
     pairings (will be re-audited in Phase 8).
   - Every §4 entity referenced by a webhook (§31) must have a payload
     schema. File defects (re-audited in Phase 8).

4. KNOWN GAPS
   - Append known gaps to AUDIT_README.md run log.

5. SIGN-OFF CRITERIA
   - Zero unresolved P0 defects in Phase 1.
   - Every P1 defect has a remediation_owner_hint and a one-line
     recommendation.
   - COVERAGE_MATRIX.md cells for §4 features are tightened (no
     ⚠ partial that could be ✅ or ❌ on a tighter read).

If any P0 cannot be resolved, STOP and produce a remediation plan.
```

---

# Phase 2 — Enum, Glossary, Numerical-Singleton Audit

Goal: Confirm Appendix J completeness, Appendix K canonicality, and that every numerical singleton has exactly one authoritative home.

### Prompt 2.1 — Appendix J Controlled Vocabulary Integrity

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk Appendix J end-to-end. For every enum:
1. Confirm every value has at least one consumer somewhere in §1–§51,
   §4, §22, §32, §31, §34, etc.
2. Confirm every consumer cites the Appendix J enum, not a literal
   value list (literal lists in body sections drift; Appendix J does
   not).
3. Confirm every value has a description, a stable string identifier
   (matching the spec's snake_case convention), and a "since version"
   marker.
4. Confirm no value was removed without a deprecation comment + the
   final version it shipped in.

REVERSE PASS
For every enum reference in §1–§51, confirm the value exists in
Appendix J. File a P1 enum defect for every literal value in the body
that is NOT registered.

SPECIAL CASES
- Plan tier enum (Free / Solo / $299 / $799 / $1,999 / Enterprise on
  buyer side; equivalent on seller side): confirm canonical IDs match
  §34.1 and Appendix J.
- AIOperation settlement_state enum: confirm matches Appendix L.
- AuditEventActionType enum: confirm Phase 1.5 reverse-check is
  reflected.
- Defense View error codes: confirm 5 codes from Appendix I v7.1.0
  are also in Appendix J if Appendix J lists error codes (it does
  not — but the registration discipline requires confirmation).
- Solo Mode tier annotations: confirm every Solo-mode-suppressed
  surface is enum-tagged.

OUTPUT
- Defect ledger entries.
- Coverage matrix updates: every feature whose enums are clean →
  enums column to ✅.
```

### Prompt 2.2 — Appendix K Glossary Coverage & Canonicality

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
1. Confirm Appendix K is the canonical Glossary (CI gate
   `appendix_k_glossary_canonicality` per CLAUDE.md §12 and v7.1.0
   Phase 12.3 amendment). File P0 ci_gate defect if Appendix B is
   used as Glossary anywhere in the spec.
2. Walk Appendix K end-to-end. For every term:
   - Confirm the definition is precise (not circular).
   - Confirm at least one cross-reference back to a §-anchor.
   - Confirm the term appears in §1–§51 in at least two distinct
     sections (the multi-section threshold from CLAUDE.md §12).
3. Reverse pass: for every term used across more than one section,
   confirm it is in Appendix K. File a P2 glossary defect for every
   missing entry.

SPECIAL TERMS TO CONFIRM
- AIOperation, AIWallet, OutcomeContract, ContestRecord
- Capability Registry, Capability Declaration
- Console Bridge, Console Firewall
- Defense View, Buyer Maya, Seller Maya
- Hero Moment, Forced-Vendor-Signup, Time-Saved Credit
- KB Value Capture, KB Hero Moment, KB Namespace
- Marketplace Discovery Pricing, Promoted Listing, Featured Placement,
  Verification Tier
- Single-Operator Mode, Solo-Tier Surface Treatment
- Console (buyer / seller), Workspace, Bid Workspace, Marketplace
  Domain
- Vendor Opt-Out Record, Vendor Disqualification, EOI

OUTPUT
- Defect ledger entries.
- Coverage matrix updates.
```

### Prompt 2.3 — Numerical Singletons Audit

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk AUTHORITATIVE_SOURCE_MAP.md (Phase 0.4) and confirm every drift
defect has been classified. Then perform a TIGHTER pass than Phase 0
gave time for:

1. Plan-tier dollar figures: every cell in §34.1 buyer/seller plan
   tables matches Buyer Pricing v3 / Seller Pricing v3 row-for-row.
   Drift is P1 numerical_singleton.
2. Object-size limits (§39): every limit referenced in §4 entity
   tables, §32 endpoints, §31 webhook payload sizes, §22 KB entry
   sizes, §28 Markdown editor limits cites §39.
3. Performance budgets (§44): every p50/p95/p99 referenced in §13
   (scoring), §17 (analytics), §27 (search), §51 (instrumentation),
   §50 (ops console) cites §44 — including §44.6 Solo-Tier Surface
   Treatment.
4. Retention TTLs (§40.2): every retention claim in §4 entity tables,
   §6.8 (DSAR), §40 (export/import), §41 (email), §42 (DR) cites
   §40.2.
5. Rate-limit classes (§32 / Appendix I): every class referenced in
   §32 endpoint subsections, §31 webhook delivery, §22.8 MCP server,
   §27 marketplace search.
6. k-anonymity floors (§27): k=5 / k=10 / k=20 referenced in §22.8,
   §51, §17, §48.
7. Cost-base / value-price multipliers (§34.3): cost_base × 10 and
   cost_base × 1.05 referenced consistently in §34, §34.10, §34.11.
8. AIWallet thresholds (§34.10): cap_warning_80 / cap_warning_100,
   auto-topup increment bounds.

OUTPUT
- Defect ledger entries; every drift is P1 minimum.
- Update AUTHORITATIVE_SOURCE_MAP.md with any new singleton classes.
```

### Prompt 2.4 — Plan-Tier Reference Audit (§5.11 / §34.1 / §39)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Confirm every plan-gated feature is reflected consistently in:
- §5.11 Feature Access Matrix
- §34.1 Plan Tier Definitions
- §39 Object Size Constraints (where the gating is a quantity)

PROCEDURE
1. Walk every feature in FEATURE_INVENTORY.md whose feature_class is
   user_capability or platform_mechanic.
2. For each feature, identify whether it is plan-gated. If yes,
   confirm presence in all three sections. If absent from any section,
   file a P1 plan_gating defect.
3. Confirm Solo plan rows exist where the feature is Solo-eligible
   (§34.1.1 / §34.1.2 / §34.1.3 / §34.2.1 / §34.2.2 / §34.2.5 /
   §34.10.3 / §34.12.6).
4. Confirm Defense View plan-gating row in §5.11 matches §13.11 plan-
   tier requirement.
5. Confirm Buyer Maya plan-gating row in §5.11 matches §13.12 / §22.20.
6. Confirm KB capacity gating in §22 vs §39 vs §34.

OUTPUT
- Defect ledger entries; P1 for every missing row.
- Coverage matrix updates: plan_gating column.
```

### Prompt V2 — Phase 2 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Adversarial verification of Phase 2. Produce
`/Sourcera/_audit/PHASE2_VERIFY.md`.

1. STRUCTURAL CHECKS
   - Confirm every Appendix J enum has been audited.
   - Confirm every Appendix K term has been audited.
   - Confirm AUTHORITATIVE_SOURCE_MAP.md is current.

2. ADVERSARIAL CHECKS
   - Pick 10 numerical singletons at random. Search the entire spec
     and companion docs. Count occurrences. If any occurrence is NOT
     a citation back to the authoritative section, file a P1.
   - Pick 5 enums at random. Pick 5 values from each. Search for
     consumers. Orphan values are P3.
   - Pick 5 multi-section terms. Confirm Appendix K presence.
   - Re-validate `appendix_k_glossary_canonicality` CI gate is
     spec'd correctly.

3. KNOWN GAPS
   - List any singleton class not yet captured in
     AUTHORITATIVE_SOURCE_MAP.md.

4. SIGN-OFF CRITERIA
   - Zero unresolved P0/P1 in Phase 2.
   - Coverage matrix enum/glossary/plan_gating/numerical-singleton
     columns are tight.
```

---

# Phase 3 — RBAC, Auth, Identity Audit (§5, §6)

Goal: Confirm every role is fully defined, every permission is concrete, every feature appears in the §5.11 matrix, every authentication path is complete, every audit event is registered, and DSAR / GDPR / right-to-erasure are operationally complete.

### Prompt 3.1 — Role Definitions & Console Firewall

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Audit §5.1–§5.10. For every role:
1. Permission list is concrete (operation-level, not concept-level —
   "can read AIOperation ledger" is concrete; "manages billing" is
   not).
2. Role scope is explicit (org-level / console-level / workspace-level
   / marketplace-domain).
3. Guest scoping (§5.4) covers every workspace surface and every
   firewall rule.
4. Executive Sponsor (§5.9) and Active Workspace Definition (§5.10)
   are operationally tight.
5. Billing Admin role is fully defined and registered in Appendix J.
6. Marketplace roles (§5.6) are firewalled from buyer/seller console
   roles.
7. Console firewall (§1.3) is enforced at every role × surface
   intersection.

CHECKS
- File P0 firewall_leakage for any role that could read across
  consoles.
- File P1 rbac for any role with a vague permission ("manages
  collaborators" without a list of operations).
- File P1 rbac for any role that lacks a Glossary entry.

OUTPUT
- Defect ledger entries.
- Coverage matrix updates: rbac column.
```

### Prompt 3.2 — §5.11 Feature Access Matrix Coverage

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
1. Walk §5.11 Feature Access Matrix end-to-end. Confirm every
   user-facing capability in FEATURE_INVENTORY.md has a row.
2. Confirm every column is populated for every row (no blank cells,
   no "TBD").
3. Confirm cells reference §34.1 plan tier IDs, not literal plan
   names — gating drifts when plan names change.
4. Confirm Solo tier (buyer_solo / seller_solo) is a column where
   applicable.
5. Reverse pass: every plan-gated capability mentioned in §10–§51
   must appear in §5.11. File P1 plan_gating for missing rows.

OUTPUT
- Defect ledger entries.
- Coverage matrix updates.
```

### Prompt 3.3 — Authentication, Session, Domain Governance, MFA (§6.1–§6.6)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Audit §6.1–§6.6.

CHECKS
1. Authentication architecture (§6.1) names every IdP, every flow
   (SSO, magic link, password+MFA, API token), and every failure
   mode (IdP outage, expired session, revoked org, deleted user).
2. MFA (§6.2) declares per-org enforcement, recovery codes, lost-
   phone path, hardware key support.
3. Session (§6.3) declares idle timeout, absolute timeout, refresh
   semantics, single-session-per-device or multi-session, revocation
   propagation latency.
4. Domain governance (§6.4): claim, verify, contest, reclaim flows.
5. Guest users & SSO bypass (§6.5): firewall rules vs. invited-guest
   identity reuse.
6. API token auth (§6.6): scope enums match Appendix J; rotation,
   revocation, audit-event emission per scope.

EDGE CASES (file defects for any silent dimension)
- WorkOS outage: spec'd graceful degradation?
- Stripe outage: billing-action fallback?
- Convex outage: presence/realtime fallback?
- Anthropic outage: AIOperation fallback (queueing / failed-state
  AIOperation row)?
- Firecrawl outage: KB ingestion fallback?

OUTPUT
- Defect ledger entries.
- Coverage matrix updates.
```

### Prompt 3.4 — Audit Logging Coverage (§6.7)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §6.7. Confirm:
1. Every action_type in the spec is registered in Appendix J Audit
   Event Action Types (Phase 1.5 reverse check; promote any missing
   to P1 audit defects).
2. Audit log retention is set in §40.2.
3. Audit log integrity protection (append-only, hash-chained, or
   equivalent) is spec'd.
4. Audit log surfacing in Ops Console (§50) and Buyer/Seller
   Settings (§36) is consistent.
5. Anomaly detection (suspicious login, MFA bypass attempt, console
   bridge failure storm) is wired to Appendix C notifications.

OUTPUT
- Defect ledger entries; P0 for any audit-log integrity gap.
```

### Prompt 3.5 — DSAR, GDPR, Right-to-Erasure (§6.8)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §6.8 Data Privacy & GDPR Compliance. For every data class:
1. Confirm export path exists (DSAR Article 15).
2. Confirm rectification path exists (Article 16).
3. Confirm erasure path exists (Article 17). Erasure semantics
   (delete vs. anonymize) are explicit per data class.
4. Confirm restriction path (Article 18) is spec'd where applicable.
5. Confirm portability path (Article 20) is spec'd where applicable.
6. Confirm DSAR SLA (§6.8 / §40 / §29) is consistent.

REVERSE PASS
For every entity in §4 with retention rules, simulate DSAR erasure.
Does the spec'd cascade preserve referential integrity AND audit
integrity? File P0 dsar for any conflict.

SPECIAL CASES
- AIOperation immutability vs. DSAR erasure: confirm anonymization
  is the spec'd path.
- AuditEvent immutability vs. erasure: same.
- KB-derived embeddings: confirm erasure cascades to vector store.
- Cross-Console Bridge Events: confirm erasure cascades both sides.
- Marketplace Discovery aggregates: k-anonymity floor protects against
  re-identification post-erasure.

OUTPUT
- Defect ledger entries; this is one of the highest-stakes audits.
```

### Prompt V3 — Phase 3 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Adversarial verification of Phase 3. Produce
`/Sourcera/_audit/PHASE3_VERIFY.md`.

1. STRUCTURAL CHECKS
   - Every role audited; §5.11 row count plausible; §6.1–§6.8
     defects filed.
2. ADVERSARIAL CHECKS
   - Pick 5 features. Trace authorization end-to-end: API → role →
     §5.11 cell → §34 plan gate. Confirm consistent.
   - Pick 3 third-party outages. Confirm spec'd graceful degradation.
   - Pick 3 DSAR scenarios. Walk erasure end-to-end. Confirm
     cascade.
3. KNOWN GAPS
   - List any auth or DSAR scenarios not covered.
4. SIGN-OFF CRITERIA
   - Zero P0 firewall_leakage / dsar / observability.
   - Every P1 has remediation owner + recommendation.
```

---

# Phase 4 — Method, Pipeline, Buyer Feature Audit (§2, §10–§21, §28, §35)

Goal: Confirm the buyer-side platform — the Sourcera Method, the 13-Phase Pipeline, scoring, scenarios, TCO, analytics, agent, onboarding, editor — is exhaustively defined.

### Prompt 4.1 — The Sourcera Method (§2) including Single-Operator Mode (§2.8)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §2 end-to-end. Confirm:
1. Use-case decomposition (§2.2) has a complete state diagram.
2. Scoring calibration (§2.3) has acceptance criteria.
3. Vendor shortlisting (§2.4) has plan-gated thresholds in §39.
4. Evaluation timeline benchmarks (§2.5) reference §10 phase
   durations.
5. Cross-departmental alignment (§2.6) declares stakeholder cohort
   semantics — confirm Solo-mode suppression in §44.6.
6. Template design (§2.7) cross-references §19 Template Library.
7. Single-Operator Mode (§2.8) is exhaustive: defines every
   suppression, every Solo-tier surface override, every Maya
   integration point. Confirm Appendix M.1 Solo-Mode rows match.
8. Authored Extensions: AE-14.X rows tagged Solo Mode are still
   pending; confirm.

EDGE CASES
- First-time vs returning user in Solo Mode.
- Solo Mode + Defense View: gated, ungated, or fallback?
- Solo Mode + KB integration on the buyer side (KB is seller-side;
  confirm spec is silent or explicit).

OUTPUT
- Defect ledger entries; P1 for any §2.8 silent edge case.
```

### Prompt 4.2 — 13-Phase Pipeline (§10)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §10 phases 1–13 + cancellation (§10.14) + benchmarks (§10.15)
+ phase advancement API (§10.16).

CHECKS (per phase)
1. Entry conditions and exit conditions are explicit and testable.
2. State machine transitions exist in Appendix A or Appendix L.
3. Plan-gated phase actions reference §34.1.
4. Acceptance criteria exist for every phase action.
5. Cancellation protocol (§10.14) covers every phase (no orphan
   phases that lack a cancel path).
6. Phase advancement API (§10.16) has full §32-style schema:
   method, path, auth, rate limit, request, response, errors,
   idempotency, examples.
7. Cross-phase state preservation on plan change (Solo → $299 →
   $799) is spec'd.
8. Cross-phase state preservation on workspace transfer / archive
   / restore.

EDGE CASES
- Phase advancement during a third-party outage.
- Phase advancement during Console Bridge backlog.
- Phase advancement when seller has not joined.
- Phase 6 vendor-bidding minimum 7 days: confirm enforced at
  API + UI.

OUTPUT
- Defect ledger entries.
- Coverage matrix updates.
```

### Prompt 4.3 — Policy-Powered Requirement Generation (§12)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §12. Confirm:
1. Supported document types (§12.2) are exhaustive.
2. Framework detection (§12.3) declares every framework supported,
   with confidence threshold.
3. Control extraction (§12.4) declares output schema and
   capability_id.
4. Deduplication (§12.5) declares the merge algorithm.
5. Traceability (§12.6) is preserved end-to-end.
6. Conversion + amendment (§12.7) has a state machine.
7. Plan limits + costs (§12.8) cite §34/§39, do not duplicate.
8. Acceptance criteria (§12.9) cover happy path + edge cases.

OUTPUT
- Defect ledger entries.
```

### Prompt 4.4 — Scoring & Grading (§13) including Defense View (§13.11) and Buyer Maya Intake (§13.12)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §13.

CHECKS
1. Rubric definition (§13.2) supports every requirement type.
2. Weighting (§13.3) algebra is explicit and testable.
3. EX-grade exclusion (§13.4) handling is plan-aware.
4. Score modification audit (§13.5) hits Appendix J + §6.7.
5. Collaborative scoring & disagreement resolution (§13.6) covers
   concurrency, lock semantics, presence integration.
6. Score aggregation (§13.7) declares math (sum / weighted avg /
   etc.) and tie-break.
7. Auto-scoring (§13.8) cites the OutcomeContract.
8. Phase lifecycle (§13.9) matches Appendix A / D / E.
9. Defense View (§13.11) is exhaustive: state machine in Appendix
   L.7, 5 error codes in Appendix I v7.1.0, Appendix M.1 row,
   Authored Extensions ratification status.
10. Buyer Maya Intake (§13.12) names every input, every Maya
    capability invoked, every output, every failure mode (Maya
    timeout, low-confidence, ambiguous classification).

OUTPUT
- Defect ledger entries; high-stakes section.
```

### Prompt 4.5 — Scenario Modeling (§14)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §14.

CHECKS
1. Scenario definition (§14.2) declares every input field, every
   constraint.
2. Validation (§14.3) declares rule set.
3. Scoring & ranking (§14.4) algorithm is reproducible.
4. Comparison view (§14.5) declares delta-rendering rules.
5. Lifecycle & permissions (§14.6) cite §5.11.
6. Simulation mode (§14.7) declares fork semantics, snapshot
   integrity.
7. Plan limits (§14.8) cite §34/§39.
8. Acceptance criteria (§14.9) cover happy path + edge cases.

OUTPUT
- Defect ledger entries.
```

### Prompt 4.6 — TCO Modeling (§15)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §15. Confirm: TCO inputs, TCO algebra, currency support, FX
locking, plan-gating, audit trail of TCO amendments, multi-vendor
comparison rendering, export to PDF / CSV (cross-reference §40).

OUTPUT
- Defect ledger entries.
```

### Prompt 4.7 — Organizational Intelligence (§16)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §16. Confirm: org-context capture, stakeholder cohort modeling,
Solo-mode suppression, residency boundaries (no cross-org leakage),
DSAR cascade.

OUTPUT
- Defect ledger entries.
```

### Prompt 4.8 — Workspace Analytics (§17)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §17. Confirm: analytics queries, performance budgets cited
from §44, instrumentation cross-references §51, plan-gating cited
from §5.11/§34.

OUTPUT
- Defect ledger entries.
```

### Prompt 4.9 — Q&A Threads (§18)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §18. Confirm: thread schema, NDA-aware visibility, mention
notifications cite Appendix C, retention cites §40.2.

OUTPUT
- Defect ledger entries.
```

### Prompt 4.10 — Template Library (§19)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §19. Confirm: template versioning, fork semantics, sharing
permissions cite §5.11, plan-gating cites §34.

OUTPUT
- Defect ledger entries.
```

### Prompt 4.11 — Inbox & Pulse (§20)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §20. Confirm: inbox aggregation, Pulse health score math,
Pulse digest email cites §41, Solo-mode suppression cites §44.6
and Appendix M.1, mobile parity in §38.

OUTPUT
- Defect ledger entries.
```

### Prompt 4.12 — The Sourcera Agent (§21)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §21.

CHECKS
1. Capability Registry (§21.4) is dynamic; no hardcoded 21 list.
2. Initial registry seed (§21.4.1) preserved.
3. Extended capabilities (§21.4.2) match §34.14 seller rate card
   and §34.15 outcome signals where applicable.
4. Platform-owned capabilities (§21.4.3) bill to Sourcera Marketing
   cost center.
5. Free-plan access rules (§21.4.4) match §34.4 / §34.10.3.
6. Outcome signals (§21.4.5) match Appendix L state machines.
7. Agent Budgets (§21.5) reference §34.10 AIWallet — no duplication.

OUTPUT
- Defect ledger entries; cross-reference Phase 7 (pricing).
```

### Prompt V4 — Phase 4 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Adversarial verification of Phase 4. Produce
`/Sourcera/_audit/PHASE4_VERIFY.md`.

1. STRUCTURAL CHECKS — every §2/§10–§21 feature in coverage matrix
   audited.
2. ADVERSARIAL CHECKS
   - Walk the buyer journey end-to-end (signup → workspace creation
     → requirement generation → scoring → scenario → recommendation
     → contract). At every state transition, confirm the spec
     covers third-party outage, partial failure, and concurrency.
   - Walk the Solo journey end-to-end. Confirm every suppression
     is annotated.
   - Walk the Defense View flow end-to-end including the 5 error
     codes.
3. KNOWN GAPS — file P1 buyer-feature defects for any silent edge
   case.
4. SIGN-OFF CRITERIA — zero P0; every P1 has owner + recommendation.
```

---

# Phase 5 — Seller Console & KB Audit (§9, §22, §23, §24, §26, §49)

Goal: Confirm the seller-side platform — KB engineering, MCP, Managed Agents, retrieval, indexing, bid workspace, profile, verification, onboarding seven-stage flow, Seller Maya — is exhaustively defined and consistent with the KB Engineering Spec.

### Prompt 5.1 — Seller Teams & Triage (§9)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §9. Confirm: seller team schema, triage queue & auto-mapping,
response drafting, capability declarations, AI assistance gating.

OUTPUT
- Defect ledger entries.
```

### Prompt 5.2 — KB Architecture, MCP, Managed Agents (§22.1–§22.8)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §22.1–§22.8 and cross-reference KB_Engineering_Spec.md §0–§3
end-to-end.

CHECKS
1. Layered model (§22.2.1) matches KB Spec §2.1 in full.
2. Why Managed Agents not Agent SDK (§22.2.2) matches KB Spec §2.3.
3. Beta header & version pinning (§22.2.3) matches KB Spec §2.4 —
   confirm `managed-agents-2026-04-01` pin and the upgrade
   playbook.
4. Ingestion channels (§22.3) include Firecrawl, document upload,
   manual entry, and any others KB Spec adds.
5. Entry lifecycle & indexing pipeline (§22.4) matches KB Spec §5
   verbatim including failed-vectorization handling, re-indexing,
   namespace migration, embedding version bumps.
6. KB MCP server (§22.8) matches KB Spec §3 verbatim, including
   every tool: kb_retrieve, kb_get_entry, document_library_find,
   doc_attach, capability_find, capability_declare_draft,
   cite_verify. Each tool has full I/O schema, permissions, error
   codes.
7. MCP session token record entity (if introduced) is in §4.4 or
   §4.8.

OUTPUT
- Defect ledger entries; high-stakes — KB drift between spec and
  KB Engineering Spec is a P1 minimum.
```

### Prompt 5.3 — KB Retrieval, Indexing, Skills, Lifecycle (§22.9–§22.20)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §22.9–§22.20 and cross-reference KB Engineering Spec §4–§18.

CHECKS
1. Retrieval pipeline (§22.9) matches KB Spec §4 — chunking, query
   expansion, re-rank, metadata pre-filter, stale-entry handling.
2. Skills registry (KB Spec §6 if applicable) matches §22.
3. Tool use patterns match KB Spec §7.
4. Memory store (KB Spec §8 if applicable) matches §22.
5. Indexing substrate (§22.9.2) matches KB Spec §4.2.
6. KB Health Model (§22.5) decay-curve math is explicit.
7. KB Hero Moment instrumentation is wired to §51 events.
8. Seller Maya Polish (§22.20) — confirm exhaustive: state machine,
   confidence thresholds, fallback to manual, Authored Extensions
   ratification, Appendix M.1 row.
9. KB Value Capture (§22 / §6.13.7 in Summary v1.1, integrated):
   confirm every field that the §34.19 carry-over guarantee
   preserves on upgrade — confidence scores, staleness states,
   citation graphs, win-rate weights, provenance — exists in the
   data model.
10. KB downgrade behavior: 12-month read-only preservation per
    §34.19 is reflected in §22 (lifecycle on plan change).

OUTPUT
- Defect ledger entries.
```

### Prompt 5.4 — Bid Workspace & Response Management (§23)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §23. Confirm: bid workspace lifecycle, response item schema,
Console Bridge sync semantics (cross-reference §4.7 + §25), draft
state, submission state, post-submission edits, withdrawal,
disqualification, plan-gating.

OUTPUT
- Defect ledger entries.
```

### Prompt 5.5 — Seller Q&A, NDA, Inbox, Pulse (§24)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §24. Confirm: Q&A visibility per NDA state, inbox aggregation,
Pulse score math (separate from buyer Pulse), retention, residency.

OUTPUT
- Defect ledger entries.
```

### Prompt 5.6 — Seller Profiles, Verification, Capability Declarations (§26)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §26.

CHECKS
1. Public seller profile schema cites SellerOrgPage / SoftwarePage
   in §4.4.
2. Verification tiers (Basic / Verified / Certified) match
   §34.16 Marketplace Discovery Pricing.
3. VerificationReviewRecord lifecycle is fully spec'd.
4. Capability declarations cite Capability Registry in §21.4.
5. Vendor opt-out cascade (§4.5 / §4.7) is honored.

OUTPUT
- Defect ledger entries.
```

### Prompt 5.7 — Seller Onboarding Seven-Stage Flow (§49 + §6.28.2 in Summary)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §49 (the implementation-level seven-stage flow).

CHECKS
1. All seven stages are defined with entry/exit conditions.
2. Magic-link → first requirement response p50 < 20 min activation
   metric is testable (cite §51).
3. Forced-Vendor-Signup playbook (Summary C.137) is reflected.
4. Hero Moment mechanics (Summary §3.6) are reflected.
5. Three Conversion Moments (Summary C.135) are reflected.
6. Onboarding anti-patterns (Summary C.140) are flagged in the
   spec as forbidden.
7. Plan-gating differentiates Free / Solo / paid onboarding paths.
8. Drop-off recovery is spec'd (re-engagement email per §41,
   inbox nudges per §20, etc.).

OUTPUT
- Defect ledger entries; P1 for any of the seven stages with a
  silent edge case (timeout, abandon, third-party outage).
```

### Prompt V5 — Phase 5 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Adversarial verification of Phase 5. Produce
`/Sourcera/_audit/PHASE5_VERIFY.md`.

1. STRUCTURAL CHECKS — every §9/§22/§23/§24/§26/§49 feature
   audited.
2. ADVERSARIAL CHECKS
   - Walk the seller journey end-to-end (forced signup → KB
     bootstrap → first response → submission → win/loss). At every
     state transition, confirm spec covers outage, partial failure,
     concurrency.
   - Pick 3 KB tools. Walk request/response/error end-to-end.
     Confirm KB Engineering Spec congruence.
   - Walk the Hero Moment instrumentation end-to-end.
3. CROSS-PHASE LINKAGE
   - Every §22 capability ties to a Capability Registry entry
     (§21.4) and a §34.14 / §34.15 row.
4. SIGN-OFF CRITERIA — zero P0; KB drift defects either resolved
   or scheduled.
```

---

# Phase 6 — Cross-Console & Marketplace Audit (§25, §27)

Goal: Confirm the buyer-seller bridge and the public marketplace are leak-free, abuse-proof, and pricing-consistent.

### Prompt 6.1 — Cross-Console Mechanics (§25)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §25 end-to-end. Cross-reference §4.7 Cross-Console Bridge
Entities.

CHECKS
1. Field-level redaction rules are testable (a list of carried
   fields and a list of NEVER-carried fields).
2. Bounded-lag SLO (30 seconds) is spec'd and instrumented (cite
   §51).
3. Retry curve and DLQ behavior match §31 / Appendix F.
4. Replay semantics avoid double-effect on the seller side
   (idempotency_key on replay).
5. Bridge failure storm: alerting (§42 + Appendix C) wired.
6. Console firewall (§1.3) integrity is provable: file P0 for any
   identifier or field that could uniquely re-identify a buyer
   from the seller side or vice versa.
7. Bridge events emit AuditEvents both consoles can read (with
   their own redactions).

OUTPUT
- Defect ledger entries; this is a high-risk surface — P0 firewall
  defects halt the audit.
```

### Prompt 6.2 — Vendor Discovery & RFP Marketplace (§27)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §27 end-to-end (very long section).

CHECKS
1. Search ranking algorithm is spec'd: input features, weights,
   tie-break, k-anonymity floor (k=5 minimum).
2. Promoted Listing auction mechanics (§27 + §34.16) match: second-
   price clearing, daily/per-EOI caps, frequency caps,
   k-anonymized impressions, KB-health-floor + closed-bid-90-days
   eligibility.
3. Featured Placements: monthly/quarterly commitment, FTC labeling,
   visual-distinct lane (§3 / UX Design v2 token).
4. Verification tier UI: badge labels are label-only — buyer
   experience guardrails per §34.16.
5. Vendor Opt-Out Record honoring is retroactive and cascades
   across §27, §22, §26, §48.
6. EOI Acceptance Record one-click flow is audit-trailed.
7. Marketplace abuse reporting (§45.3) is wired.
8. Solo-tier marketplace experience: confirm §44.6 governs
   suppressions if any.

OUTPUT
- Defect ledger entries; P0 for any vendor opt-out leak.
```

### Prompt V6 — Phase 6 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Adversarial verification of Phase 6.

1. STRUCTURAL CHECKS — §25 + §27 features audited.
2. ADVERSARIAL CHECKS
   - Construct a hypothetical Bridge Event payload. Identify any
     field that could re-identify a buyer to a seller below the
     k-anonymity floor.
   - Construct a marketplace search trace. Identify any way an
     opted-out vendor could surface.
   - Construct a Promoted Listing auction tie. Confirm spec
     resolves it deterministically.
3. SIGN-OFF CRITERIA — zero P0 firewall_leakage; zero P0
   vendor_opt_out leak.
```

---

# Phase 7 — Pricing, Billing, AIOperation Audit (§34, §44)

Goal: Confirm the entire economic model — plan tiers, outcome-based pricing, AIWallet, OutcomeContract, ContestRecord, Marketplace Discovery Pricing, Carry-Over Guarantee — is internally consistent AND consistent with Buyer Pricing v3 / Seller Pricing v3.

### Prompt 7.1 — §34.1 Plan Tier Definitions

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §34.1 end-to-end (buyer + seller plan tiers, including Solo).

CHECKS
1. Every plan tier has a complete cell row covering every dimension
   (price monthly, price annual, included AI value-dollars, included
   storage, included workspaces, included seats, included KB
   capacity, etc.).
2. Plan-tier IDs match Appendix J enums.
3. Solo plan rows present in §34.1.1 / §34.1.2 / §34.1.3 / §34.2.1
   / §34.2.2 / §34.2.5 / §34.10.3 / §34.12.6.
4. Buyer Pricing v3 reconciliation: every cell matches. Drift is
   P1.
5. Seller Pricing v3 reconciliation: every cell matches. Drift is
   P1.

OUTPUT
- Defect ledger entries.
```

### Prompt 7.2 — Outcome-Based Pricing & AIOperation Lifecycle (§34.3, §34.10, §34.11)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §34.3, §34.10, §34.11.

CHECKS
1. cost_base × 10 = value_price; cost_base × 1.05 = cost_price.
   Confirm spec'd everywhere consistently.
2. Nightly cost-base recalculation job declares drift threshold
   (10%) for human approval.
3. AIWallet pooling rules are explicit (Enterprise pooled across
   consoles; non-Enterprise scoped per console).
4. Auto-topup config bounds, opt-in / opt-out path, frequency caps.
5. Cap-warning thresholds (80% / 100%) wired to webhooks
   (Appendix C).
6. AIOperation state machine matches Appendix L.
7. Contest record 14-day window enforced at API + DB.
8. Free-allowance counter mechanics (10 free ops per capability,
   per Summary C.80) — confirm.

OUTPUT
- Defect ledger entries; P0 for any settlement-immutability gap or
  FX-locking ambiguity.
```

### Prompt 7.3 — Entitlement Matrix (§34.8)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §34.8 Entitlement Matrix.

CHECKS
1. Every capability_id in the Capability Registry has an entry.
2. enforcement_mode (soft / hard) is set for each.
3. free_allowance_ops set for each.
4. gated_at_plan_minimum set for each.
5. upgrade_surface set for each (which UI surface routes to
   upgrade).
6. Reverse pass: every plan-gated UI surface in §3 / §11 / §28 /
   §44.6 has a matching matrix row.

OUTPUT
- Defect ledger entries.
```

### Prompt 7.4 — Marketplace Discovery Pricing (§34.16)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §34.16 end-to-end.

CHECKS
1. Three SKUs explicit: Promoted Listing, Verification Tiers,
   Featured Placement.
2. Accounting isolation: cost center `rev_marketplace_discovery`
   independent of `rev_ai_wallet` and `rev_subscription`.
3. Anti-spam linkage (KB health floor + ≥1 closed bid in prior
   90 days) explicit.
4. Buyer Experience Guardrails: paid placements never suppress
   organic; Verified/Certified badges label-only; Featured lanes
   visually distinct.
5. FTC native-advertising compliance language in spec.
6. Cross-reference §27 search ranking + §3 UX tokens.
7. Confirm MarketplaceDiscoveryRevenueRecord (§4.8) ties.

OUTPUT
- Defect ledger entries.
```

### Prompt 7.5 — Carry-Over Guarantee, Downgrade Excess Data Bucket (§34.5–§34.6, §34.19)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §34.5, §34.6, §34.19.

CHECKS
1. Plan upgrade preserves every KB field listed in §34.19 (KB
   entries, confidence scores, staleness, citation graph, win-rate
   weights, provenance).
2. Plan downgrade preserves data in DowngradeExcessDataBucket for
   90 days (general) or 12 months (KB-specific per §34.19).
3. Seller Plan Upgrade Carry-Over Guarantee acceptance criteria
   testable (§34.20).
4. Reverse pass: every entity declared in §4.4 with KB-related
   fields has carry-over annotation.

OUTPUT
- Defect ledger entries.
```

### Prompt 7.6 — Cross-Document Number Reconciliation

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
For every plan-tier dollar figure, every rate-card cell, every
capability free-allowance, every Marketplace Discovery price,
compare:
- Master Spec §34
- Buyer Pricing v3 (where buyer-side)
- Seller Pricing v3 (where seller-side)

PROCEDURE
- Walk §34.1 buyer table → diff with Buyer Pricing v3 §X (cite
  exact subsection).
- Walk §34.1 seller table → diff with Seller Pricing v3 §X.
- Walk §34.14 seller rate card → diff with Seller Pricing v3 §9.
- Walk §34.15 seller outcome signals → diff with Seller Pricing
  v3.
- Walk §34.16 Marketplace Discovery → diff with Seller Pricing
  v3 §Marketplace Discovery Pricing.
- Walk §34.17 Pricing Engineering Requirements (14 items) →
  confirm each cross-links to a Spec section that implements it.
- Walk §34.18 Financial Targets → confirm blended GM ≥90%, year-1
  exit mixes, Enterprise <10% of accounts.

ANY DRIFT IS P1.

OUTPUT
- Defect ledger entries.
- Update CONSISTENCY_DELTA.md with cross-doc diffs.
```

### Prompt V7 — Phase 7 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Adversarial verification of Phase 7.

1. STRUCTURAL — every §34 subsection and §44 audited.
2. ADVERSARIAL
   - Construct a worst-case AIOperation scenario: nightly recalc
     spikes cost_base 12%; auto-topup hits monthly cap; user
     contests 30 ops simultaneously. Confirm spec resolves
     deterministically.
   - Construct a downgrade scenario: Solo → Free with KB > free
     ceiling. Confirm preservation rules + UX messaging.
   - Construct an Enterprise pooled-wallet scenario across both
     consoles. Confirm.
3. SIGN-OFF — zero P0 in pricing/billing.
```

---

# Phase 8 — APIs, Webhooks, Notifications, Events, Error Codes (§31, §32, Appendices C, F, G, I)

Goal: Confirm every endpoint, webhook, notification, and PostHog event meets §32 / §31 standards and that error codes are exhaustive.

### Prompt 8.1 — §32 API Endpoint Coverage & Conventions

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §32 end-to-end.

CHECKS (per endpoint)
1. method, path, auth scope, rate-limit class.
2. Pagination: cursor-based, default 50, max 250.
3. Request schema with field types, constraints, required/optional.
4. Response schema.
5. Error codes referenced from Appendix I (no inline error code
   literals).
6. Idempotency semantics for write endpoints (idempotency_key
   header).
7. Concrete request example + concrete response example.
8. Auth scope is registered in Appendix J API Token Scopes.

REVERSE PASS
For every entity in §4 that the spec implies is API-exposed
(everything user-facing), confirm an endpoint exists. File P1
api_gap for missing endpoints. Examples to check: AIWallet, AIOperation
ledger, ContestRecord, OutcomeContract introspection, Capability
Registry list, Vendor Opt-Out submit, EOI accept, Promoted Listing
manage, Verification Review submit, KB MCP token issue.

OUTPUT
- Defect ledger entries.
- Update COVERAGE_MATRIX.md `api` column.
```

### Prompt 8.2 — §31 Webhooks & Appendix F Retry

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §31 end-to-end.

CHECKS (per webhook)
1. HMAC-SHA256 signing with rotating secret + secret-rotation flow.
2. Idempotency via event_id.
3. Exponential backoff curve per Appendix F.
4. DLQ after 5 failures.
5. Payload size ≤256 KB.
6. Payload schema with versioning (event_version).
7. Registration in Appendix C and Appendix G.

REVERSE PASS
For every state transition in Appendix L, confirm a webhook is
emitted (or explicitly NOT emitted by design). File P1 webhook for
missing emissions on revenue-affecting transitions (AIOperation
settlement, contest, plan change, downgrade scheduled, etc.).

OUTPUT
- Defect ledger entries.
```

### Prompt 8.3 — Appendix C Notification Event Catalog

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk Appendix C end-to-end.

CHECKS (per notification)
1. Notification has trigger condition, recipient resolution rule,
   channel(s) (in-app, email, push, webhook).
2. Plan-tier eligibility (some notifications gated to paid).
3. Localization (i18n hook) referenced.
4. Email deliverability (§41) compliance: SPF/DKIM/DMARC,
   unsubscribe link where required.
5. Idempotency: deduped within a window.
6. Retention of notification records.

REVERSE PASS
For every webhook in §31, confirm a paired notification (or explicit
non-emission). For every Appendix-G PostHog event tied to an action
that should also emit a notification, confirm the notification.

OUTPUT
- Defect ledger entries.
```

### Prompt 8.4 — Appendix G PostHog Event Taxonomy

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk Appendix G end-to-end.

CHECKS (per event)
1. Event name follows the spec's snake_case convention.
2. Properties are defined with type + description.
3. Privacy: no PII in event properties.
4. Sampling rules where applicable (high-volume events).
5. Retention in PostHog matches §40.2.
6. Cohort assignment rules where applicable.

REVERSE PASS
For every conversion moment in §48 / §51 / §35 / §22 / §49, confirm
a PostHog event exists. File P1 instrumentation_gap for missing
events.

CRITICAL EVENTS TO CONFIRM
- buyer_evaluation_started / completed
- seller_first_response_submitted (Hero Moment)
- seller_kb_first_entry_indexed (Hero Moment)
- seller_magic_link_clicked
- seller_seven_stage_advance_X (one per stage)
- buyer_maya_intake_completed
- defense_view_opened / dismissed
- promoted_listing_impression / click / EOI
- featured_placement_impression / click
- verification_tier_upgraded
- contest_submitted / approved / rejected
- ai_operation_settled (sampled)
- plan_upgraded / downgraded

OUTPUT
- Defect ledger entries.
```

### Prompt 8.5 — Appendix I API Error Code Catalog

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk Appendix I end-to-end.

CHECKS (per error code)
1. Code is stable, unique, and snake_case.
2. HTTP status mapping is consistent.
3. Description is unambiguous; client-facing message is
   localizable.
4. Retryability is annotated (transient / permanent).
5. Cross-references the endpoint(s) that can return it.

REVERSE PASS
For every endpoint in §32, confirm every error path is registered.
For every webhook delivery error, confirm registered. For every
plan-gating reject path, confirm registered.

CRITICAL CODES TO CONFIRM
- Defense View 5 codes (v7.1.0 sub-section).
- AIOperation contest window expired.
- AIWallet cap exceeded; auto-topup denied.
- Capability not in plan.
- Vendor opt-out blocks operation.
- KB MCP session expired.
- Console firewall denial.

OUTPUT
- Defect ledger entries.
```

### Prompt V8 — Phase 8 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Adversarial verification of Phase 8.

1. STRUCTURAL — §31, §32, Appendices C/F/G/I audited.
2. ADVERSARIAL
   - Pick 5 endpoints. Construct invalid requests targeting
     auth/plan/scope/data-residency. Confirm error code path
     spec'd.
   - Pick 5 webhooks. Simulate sustained 5xx receiver. Confirm
     DLQ + alerting wired.
   - Pick 5 PostHog events. Confirm property schema is privacy-
     compliant.
3. SIGN-OFF — every revenue-affecting event has webhook +
   notification + PostHog coverage.
```

---

# Phase 9 — Privacy, Retention, Residency, Compliance (§6.8, §33, §40, §41, §42, §45)

Goal: Confirm every data class has a retention rule, a DSAR path, a residency rule, and a privacy/abuse path. Confirm Enterprise security & compliance is exhaustive.

### Prompt 9.1 — Retention Per Data Class (§40.2)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §40.2 end-to-end.

CHECKS
1. Every entity in §4 is represented as a data class with a TTL.
2. Audit events have their own retention (longer than typical
   transactional data).
3. Billing data (AIOperation, AIWallet snapshots) retention is
   compliant with US/EU tax-and-records requirements.
4. KB derived artifacts (embeddings) retention cascades from KB
   entry deletion.
5. Cross-Console Bridge events retention is shorter than parent
   workspace retention.

REVERSE PASS
For every entity in §4, confirm §40.2 names it. File P1 retention
for missing.

OUTPUT
- Defect ledger entries.
```

### Prompt 9.2 — DSAR / Right-to-Erasure Compatibility (re-cross §6.8)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Re-walk §6.8 with focus on cross-cascade integrity.

CHECKS
1. For every entity, the DSAR cascade is testable.
2. For every immutable entity (AIOperation, AuditEvent), the
   anonymization path is spec'd.
3. For every entity that contains buyer-identifying data on the
   seller side (Marketplace aggregates, Bridge events, etc.),
   confirm k-anonymity floor protects against re-identification
   post-erasure.
4. SLA compliance: DSAR completes within statutory window.

OUTPUT
- Defect ledger entries.
```

### Prompt 9.3 — Data Residency & Cross-Region Behavior

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §1.6 (Deployment Regions) + §6.8 + §40 + §42 with focus on
residency.

CHECKS
1. US / EU / custom regions named.
2. Per-org residency lock; no cross-region copy without explicit
   consent.
3. Cross-region failover behavior is spec'd (what happens during
   a regional outage).
4. Backups respect residency.
5. Audit logs respect residency.
6. AIOperation residency-locked entity (legal entity: Sourcera US
   LLC vs. Sourcera EU GmbH) is consistent with billing.

OUTPUT
- Defect ledger entries.
```

### Prompt 9.4 — Privacy & Abuse Prevention (§45)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §45.

CHECKS
1. Every public surface (vendor profile, marketplace search, EOI
   submission) has rate-limiting.
2. Marketplace Abuse Report flow is end-to-end (file → triage →
   resolution → audit-trail).
3. Vendor opt-out enforcement is mechanically auditable.
4. Buyer/seller k-anonymity floors enforced at query layer.
5. Promoted Listing anti-spam linkages spec'd.
6. KB content moderation: profanity, illegal content,
   IP-infringement screens — confirm.

OUTPUT
- Defect ledger entries.
```

### Prompt 9.5 — Enterprise Security & Compliance (§33)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §33.

CHECKS
1. SOC 2 Type II controls mapped.
2. ISO 27001 controls mapped (where claimed).
3. Penetration testing cadence spec'd.
4. Vulnerability disclosure program (VDP) referenced.
5. Subprocessor list maintained (cite §6.8).
6. Encryption at rest + in transit standards.
7. Key management (KMS) and rotation cadence.
8. Incident response runbook referenced.

OUTPUT
- Defect ledger entries.
```

### Prompt 9.6 — Email Deliverability (§41)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §41.

CHECKS
1. SPF / DKIM / DMARC posture spec'd.
2. Per-domain warmup rules.
3. Bounce + complaint handling.
4. Unsubscribe (CAN-SPAM, GDPR) compliance.
5. Loops.so integration coverage.
6. Plan-gated email volume.

OUTPUT
- Defect ledger entries.
```

### Prompt V9 — Phase 9 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Adversarial verification of Phase 9.

1. STRUCTURAL — every §33/§40/§41/§42/§45/§6.8 area audited.
2. ADVERSARIAL
   - Construct a DSAR scenario across both consoles + a Bridge
     Event. Walk cascade.
   - Construct an EU-resident user accessing a US-resident org.
     Confirm residency block path.
   - Construct an abuse-spam scenario in marketplace. Confirm
     mitigation.
3. SIGN-OFF — zero P0 dsar / residency / firewall_leakage /
   abuse_path.
```

---

# Phase 10 — UX, Accessibility, i18n, Mobile, Performance (§3, §37, §38, §44)

Goal: Confirm every UI surface meets the design system, accessibility, i18n, mobile, and performance contracts.

### Prompt 10.1 — UX Standard & Tokens (§3)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §3.1–§3.14 + cross-reference UX_Design_of_Sourcera.md.

CHECKS
1. Every token (color, spacing, typography, motion, elevation) is
   defined once in §3 or UX Design.
2. Every interaction pattern has a state catalog (see §3.7).
3. Side Peek (§3.8) covers every surface that uses it.
4. Cursor Presence (§3.9) is consistent across buyer / seller.
5. Bulk Action Toolbar (§3.10) covers every multi-select surface.
6. Dark Mode Parity (§3.11) is explicit per surface.
7. Presence & Unread Tracking (§3.12) ties to Convex Presence.
8. Principle 9 — Surface Simplicity, Engine Complexity (§3.13) is
   testable: every surface has an Appendix M.1 row mapping it to
   its engine.
9. Pipeline Surface Compression (§3.14) compresses the right
   surfaces; cite Appendix M.1.

OUTPUT
- Defect ledger entries; cross-document drift between §3 and UX
  Design v2 is P2.
```

### Prompt 10.2 — State Catalog Coverage (§3.7)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
For every UI surface in FEATURE_INVENTORY.md (feature_class =
surface), confirm:
1. Loading state defined (with skeleton or spinner spec).
2. Empty state defined (first-time + returning user variants).
3. Error state defined (with retry CTA, error code surfacing,
   support-link affordance).
4. Retry state defined.
5. Partial-completion state defined.
6. Permission-denied state defined.
7. Plan-gated upgrade-CTA state defined.
8. Solo Mode suppression where applicable.

OUTPUT
- Defect ledger entries; P1 for any surface missing more than two
  required states.
```

### Prompt 10.3 — Accessibility & i18n (§37)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §37.

CHECKS
1. WCAG 2.1 AA compliance posture spec'd per surface.
2. Keyboard navigation (Appendix B Keyboard Shortcut Reference)
   complete.
3. Screen-reader compatibility (ARIA labels) standards.
4. Color-contrast tokens meet 4.5:1 for body, 3:1 for large.
5. Focus management on modals, side peek, toasts.
6. i18n: locale, timezone, currency formatting consistent.
7. RTL support (if claimed) — confirm.
8. Date/time formatting consistent.

OUTPUT
- Defect ledger entries; accessibility gaps are P1 minimum if they
  affect WCAG AA conformance.
```

### Prompt 10.4 — Responsive Design & Mobile Divergence (§38)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §38.

CHECKS
1. Breakpoints defined.
2. Mobile Translation of Linear Constraint (§3.4) reflected.
3. Per-surface mobile parity table: feature × mobile-supported /
   mobile-deferred / mobile-suppressed.
4. Native app surface (if claimed) parity with web.
5. Touch-target sizes (min 44×44 px iOS / 48×48 px Android).
6. Performance budgets on mobile (cite §44).

OUTPUT
- Defect ledger entries.
```

### Prompt 10.5 — Performance & Solo-Tier Treatment (§44)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §44 end-to-end including §44.6.

CHECKS
1. Per-surface budgets: TTFB, FCP, LCP, INP, CLS.
2. p50/p95/p99 targets cited consistently (Phase 2.3).
3. Solo-Tier Surface Treatment: every Solo-mode override declares
   the surface, the suppression mode, the Appendix M.1 reference,
   and the §M.5 CI gate (`solo_mode_appendix_m_coverage`).
4. Performance regression CI gate (if claimed) — confirm.

OUTPUT
- Defect ledger entries.
```

### Prompt V10 — Phase 10 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Adversarial verification of Phase 10.

1. STRUCTURAL — every §3 / §37 / §38 / §44 area audited.
2. ADVERSARIAL
   - Pick 5 surfaces. Walk loading→empty→error→retry→partial→
     permission-denied→upgrade-CTA. Confirm each defined.
   - Pick 5 surfaces. Confirm WCAG AA at each.
   - Pick 5 mobile surfaces. Confirm parity table entry.
3. SIGN-OFF — zero P0 accessibility / performance.
```

---

# Phase 11 — Surface/Engine Mapping & CI Gate Audit (Appendix M)

Goal: Confirm Appendix M.1 covers every surface/engine, that §M.4 CI gate is unambiguous, and that the §M.5 37-gate catalog is exhaustively spec'd.

### Prompt 11.1 — Appendix M.1 Mapping Registry Coverage

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk Appendix M.1 end-to-end.

CHECKS
1. Every surface in FEATURE_INVENTORY.md (feature_class = surface)
   has at least one row.
2. Every engine in FEATURE_INVENTORY.md (feature_class =
   engine_concept) has at least one row.
3. Every row has the required columns populated (per the Appendix
   M.1 schema).
4. Solo-Mode suppression annotations on Stakeholder Cohorts row,
   Pulse Inbox row, Pulse Health Score row, Pulse Digest Email
   row, SLA Timers row.
5. v7.1.x deferred rows clearly labeled (GTM rewrites,
   Marketplace-as-RFP-Exchange).

REVERSE PASS
For every Appendix M.1 row, confirm the surface or engine actually
exists in the spec body.

OUTPUT
- Defect ledger entries; P1 surface_engine_mapping for any missing
  row.
```

### Prompt 11.2 — Appendix M.4 CI Gate Spec

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §M.4.

CHECKS
1. Trigger condition unambiguous (what counts as a "new engine
   concept introduction"?).
2. Failure mode spec'd: status `appendix_m_coverage_on_diff:
   missing_row`, comment format defined.
3. Override path: `@appendix-m-internal-only:` annotation spec'd
   per §M.4.4. Confirm rationale-substring requirement.
4. Audit-trail emitter spec'd.
5. Nightly digest spec'd.

OUTPUT
- Defect ledger entries.
```

### Prompt 11.3 — Appendix M.5 37-Gate Catalog Coverage

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §M.5.

CHECKS
1. Total gate count = 37 (confirm).
2. Each gate has: name, owning phase, scope, assertion, failure
   message, runbook reference.
3. 4 gates are runtime-active at v7.1.0; 33 are spec-binding
   contracts pending runtime wiring (M02.3 / M11.3 / M21.3 /
   M24.3 implementation packs).
4. Every Authored Extension referenced from a gate is in the
   ledger.
5. v7.1.1 stamp gate marked.

OUTPUT
- Defect ledger entries.
- File P0 ci_gate for any active CI gate that lacks a deterministic
  failure mode.
```

### Prompt 11.4 — Surface/Engine Cross-Reference Audit

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Build a coverage trace: feature → primary § anchor → Appendix M.1
row → Appendix M.5 gate → AUTHORED_EXTENSIONS_LEDGER row (if
applicable).

For every feature in FEATURE_INVENTORY.md, populate the trace.
Missing links are filed as P1 defects (surface_engine_mapping or
ci_gate or authored_extension).

OUTPUT
- Defect ledger entries.
- A coverage-trace artifact at
  `/Sourcera/_audit/SURFACE_ENGINE_TRACE.md`.
```

### Prompt V11 — Phase 11 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Adversarial verification of Phase 11.

1. STRUCTURAL — Appendix M coverage matches inventory.
2. ADVERSARIAL
   - Pick 5 §M.5 gates. Construct a violating diff. Confirm gate
     rejects.
   - Pick 5 §M.5 gates. Construct a diff that should be accepted
     via override. Confirm path works.
3. SIGN-OFF — zero P0 ci_gate.
```

---

# Phase 12 — Operations, QA, Observability, Disaster Recovery (§42, §43, §46, §50)

Goal: Confirm operational readiness — SLOs, runbooks, ops console, QA framework, disaster recovery — is complete.

### Prompt 12.1 — Observability, Reliability, DR (§42)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §42 end-to-end.

CHECKS
1. SLOs per service (latency p99, error rate, availability).
2. Logs: structured logging schema; PII scrubbing.
3. Metrics: every revenue-affecting event has a metric.
4. Traces: distributed tracing across MCP, Managed Agents, Stripe,
   WorkOS.
5. Alerting: every SLO violation pages.
6. Runbooks: every alert links to a runbook.
7. RTO/RPO targets per service.
8. DR drills cadence.

OUTPUT
- Defect ledger entries; P0 for any revenue-affecting service
  without SLO/alerting.
```

### Prompt 12.2 — Internal Operations & Admin Tooling (§43)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §43.

CHECKS
1. Internal admin actions are RBAC-gated to Sourcera Ops roles.
2. Every internal action emits an audit event (Appendix J).
3. Customer-impacting actions (impersonate, refund, force-cancel
   workspace) require justification + 2-person rule.
4. Internal tooling has its own UI (§50 Ops Console).

OUTPUT
- Defect ledger entries.
```

### Prompt 12.3 — Test Strategy & QA Framework (§46)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §46.

CHECKS
1. Test pyramid per service (unit / integration / e2e).
2. Test coverage targets per surface.
3. AIOperation testing strategy: golden datasets, regression
   thresholds.
4. Console firewall test scenarios.
5. DSAR / GDPR test scenarios.
6. Performance regression tests cite §44.
7. Accessibility automated checks cite §37.
8. Mobile responsive checks cite §38.

OUTPUT
- Defect ledger entries.
```

### Prompt 12.4 — Sourcera Ops Console (§50)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §50.

CHECKS
1. Every Ops surface declared (impersonate, refund, force-action,
   verification review queue, abuse triage, AIOperation reversal,
   plan override, residency override, etc.).
2. Every Ops action emits audit event.
3. Every Ops action requires 2-person rule where applicable.
4. RBAC gates Ops surfaces strictly.

OUTPUT
- Defect ledger entries.
```

### Prompt V12 — Phase 12 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Adversarial verification of Phase 12.

1. STRUCTURAL — §42/§43/§46/§50 audited.
2. ADVERSARIAL
   - Construct a P0 incident scenario. Walk runbook → mitigation
     → comms → postmortem.
   - Construct an Ops impersonation. Confirm audit + 2-person
     rule.
3. SIGN-OFF — zero P0 observability / ops.
```

---

# Phase 13 — PLG, Growth, Analytics (§48, §51)

Goal: Confirm every growth mechanic is fully spec'd, every network effect is captured, every PLG event is instrumented.

### Prompt 13.1 — M1–M17 Growth Mechanic Coverage (§48)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §48.

CHECKS (per mechanic)
1. Mechanic name, description, target loop (acquisition /
   activation / retention / referral / revenue).
2. Trigger conditions explicit.
3. Plan-tier eligibility.
4. Rate limits (anti-abuse).
5. Anti-spam linkages where applicable.
6. Instrumentation event(s) named (cross-reference §51 + Appendix
   G).
7. Metric: north-star KPI for the mechanic.

OUTPUT
- Defect ledger entries; P1 growth_mechanic_gap for any silent
  mechanic.
```

### Prompt 13.2 — Network Effects (§48)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §48 (network effects subsections).

CHECKS
1. Buyer-side network effects enumerated.
2. Seller-side network effects enumerated (forced signup, KB value
   capture, ghost RFP ingestion, etc.).
3. Cross-side network effects enumerated.
4. Each network effect has a measurable proxy metric.

OUTPUT
- Defect ledger entries.
```

### Prompt 13.3 — Product Usage Analytics & PLG Instrumentation (§51)

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk §51 end-to-end.

CHECKS
1. Activation metric defined per console.
2. Retention cohorts defined.
3. Conversion funnel defined per growth path.
4. PLG-loop instrumentation matches mechanics in §48.
5. Hero Moment events tied to §22 + §49.
6. Forced-Vendor-Signup playbook events tied to §27.
7. Every event referenced in §51 exists in Appendix G.

OUTPUT
- Defect ledger entries.
```

### Prompt 13.4 — Hero Moment Instrumentation

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk every Hero Moment in the spec (buyer-side + seller-side).

CHECKS
1. Each Hero Moment has a definition (entry condition, "moment of
   value", exit condition).
2. Each has a PostHog event (Appendix G).
3. Each has a metric target (e.g., p50 < 20 min for Seller
   onboarding magic-link → first-requirement-response).
4. Each has a recovery path on miss (e.g., re-engagement email,
   inbox nudge).
5. Solo-Tier Hero Moment is spec'd if applicable.

OUTPUT
- Defect ledger entries.
```

### Prompt V13 — Phase 13 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Adversarial verification of Phase 13.

1. STRUCTURAL — §48 + §51 audited.
2. ADVERSARIAL
   - Walk one buyer growth loop end-to-end (M-X). Confirm
     instrumentation.
   - Walk one seller growth loop end-to-end. Confirm
     instrumentation.
   - Construct a Hero Moment failure. Confirm recovery path.
3. SIGN-OFF — zero P0 instrumentation_gap.
```

---

# Phase 14 — Cross-Document Consistency Audit

Goal: Reconcile the Master Spec against every companion document, the Authored Extensions ledger, the Decisions ledger, and the v7.1.1 backlog.

### Prompt 14.1 — Master Spec ↔ Buyer Pricing Strategy v3

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Read both end-to-end. Produce a section-by-section consistency
diff in `/Sourcera/_audit/CONSISTENCY_DELTA.md` under heading
"Buyer Pricing v3".

CHECKS
1. Plan tier dollar figures match §34.1 buyer rows.
2. AI Operation pricing model description matches §34.3 / §34.10 /
   §34.11.
3. Outcome-based consumption framing matches §34.
4. Free / Solo / paid tier scenarios match.
5. Every concept mentioned in Buyer Pricing exists in spec; flag
   missing.

ANY DRIFT IS P1 consistency_drift; spec wins per CLAUDE.md §2 ;
file the defect against the strategy doc with a recommendation
to update.

OUTPUT
- CONSISTENCY_DELTA.md updated.
- Defect ledger entries.
```

### Prompt 14.2 — Master Spec ↔ Seller Pricing Strategy v3

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Same as 14.1, against Seller Pricing v3.

CHECKS
1. Seller plan tier figures match §34.1 seller rows.
2. Forced-signup mechanics match §27 + §49 + §48.
3. Hero Moment match §22 + §49.
4. KB value capture match §22 + §34.19.
5. Marketplace Discovery Pricing match §34.16.
6. Seller network effects match §48.

OUTPUT
- CONSISTENCY_DELTA.md updated under "Seller Pricing v3".
- Defect ledger entries.
```

### Prompt 14.3 — Master Spec ↔ KB Engineering Spec

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk KB_Engineering_Spec.md §0–§18 vs. §22.

CHECKS (mirror Phase 5.2 / 5.3 cross-checks but exhaustively)
1. Every KB Spec subsection has a §22 counterpart or an explicit
   exclusion.
2. Beta header `managed-agents-2026-04-01` consistent.
3. MCP tool I/O schemas verbatim consistent.
4. Retrieval pipeline math + parameters consistent.
5. Indexing substrate consistent.
6. Skill registry consistent.
7. Memory store consistent.

OUTPUT
- CONSISTENCY_DELTA.md updated under "KB Engineering Spec".
- Defect ledger entries.
```

### Prompt 14.4 — Master Spec ↔ UX Design v2

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk UX_Design_of_Sourcera.md vs. §3 + state catalog + token
references.

CHECKS
1. Tokens consistent (color, spacing, typography, motion,
   elevation).
2. Component variants consistent.
3. Interaction states consistent.
4. Accessibility tokens consistent.

OUTPUT
- CONSISTENCY_DELTA.md updated under "UX Design v2".
- Defect ledger entries (P2 typically; P1 if a UX contract is
  unimplementable as written).
```

### Prompt 14.5 — Authored Extensions Ledger Ratification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk `_integration/AUTHORED_EXTENSIONS_LEDGER.md`.

CHECKS
1. Every `pending` row has the data needed for ratification:
   originating phase, evidence, rationale, owner, target
   ratification version.
2. Every `pending` row that targets v7.1.1 stamps with a clear
   acceptance test.
3. Every `pending` row that has been superseded by a later
   integration is transitioned to `superseded`.
4. v7.1.0 ratification queue (AE-14.9-01, AE-14.10-07,
   AE-14.14-21, AE-14.18.1-01, AE-14.18.1-02, AE-14.0.1-01,
   AE-14.0.1-02) has no blocker.

OUTPUT
- Defect ledger entries.
- A ratification recommendation list at
  `/Sourcera/_audit/AE_RATIFICATION_RECOMMENDATIONS.md`.
```

### Prompt 14.6 — Decisions Ledger Resolution

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk `_integration/Decisions.md`. For every open decision:
1. Confirm whether the spec has implemented the recommended
   resolution.
2. If not, file a P1 defect citing the open decision.
3. If implemented but the decision row is still `open`, recommend
   transition to `closed` in the audit log.

OUTPUT
- Defect ledger entries (P1 for unresolved open decisions whose
  spec impact is felt).
- A decisions-status report at
  `/Sourcera/_audit/DECISIONS_STATUS_REPORT.md`.
```

### Prompt 14.7 — v7.1.1 Backlog Status

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk RECONCILIATION.md → v7.1.1 Backlog (P1 defects from Phase
14.19 + P2 cosmetic backlog + Phase 14.13a/b/c/d / 14.9.2 /
14.12.1 / 14.18.1 runtime wiring).

CHECKS
1. Every backlog item has owner + target version.
2. Every backlog item has acceptance criteria.
3. None of the backlog items duplicates an audit defect; if
   duplicate, link.

OUTPUT
- A v7.1.1-readiness summary at
  `/Sourcera/_audit/V711_READINESS.md`.
- Defect ledger entries.
```

### Prompt V14 — Phase 14 Verification

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Adversarial verification of Phase 14.

1. STRUCTURAL — every companion doc + ledger audited.
2. ADVERSARIAL
   - Pick 5 cross-doc deltas. Confirm CONSISTENCY_DELTA.md row
     evidence is reproducible.
   - Pick 5 AE rows. Confirm ratification readiness.
   - Pick 5 Decisions rows. Confirm spec implementation status.
3. SIGN-OFF — zero P0 consistency_drift in pricing-relevant
   numbers.
```

---

# Phase 15 — Final Synthesis & Production-Readiness Verdict

Goal: Consolidate every defect, prioritize a remediation backlog, and produce a defensible production-readiness verdict.

### Prompt 15.1 — Defect Ledger Consolidation

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Walk DEFECT_LEDGER.md end-to-end. For every defect:
1. Confirm severity is rule-based (re-validate against Severity
   Definitions).
2. Confirm class is the most-specific applicable.
3. Confirm evidence is reproducible.
4. Confirm recommendation is one-sentence sharp.
5. Deduplicate cross-phase defects (link via the `links` column;
   one canonical row per defect).
6. Mark defects as `superseded` if a later phase resolved them.

OUTPUT
- Updated DEFECT_LEDGER.md.
- A defect-statistics summary at the top of the ledger:
  - Counts by severity (P0 / P1 / P2 / P3).
  - Counts by class.
  - Counts by phase_owner.
  - Counts by remediation_owner_hint.
```

### Prompt 15.2 — P0/P1/P2 Remediation Backlog

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
From the consolidated defect ledger, produce
`/Sourcera/_audit/REMEDIATION_BACKLOG.md`.

STRUCTURE
1. Section "P0 — Blockers" — every P0 defect with: title,
   evidence, recommendation, suggested owner, suggested
   implementation pack (cross-reference Linear_Execution_Blueprint
   §5 if applicable), estimated effort (S/M/L/XL), gating impact
   (which downstream phases or features depend on this fix).
2. Section "P1 — Required for v7.2.0 stamp" — same fields.
3. Section "P2 — Required for v7.x continuous improvement" —
   same fields.
4. Section "P3 — Cosmetic / hygiene" — grouped as a single
   sweep epic.

CROSS-LINKAGE
- Each P0/P1 row in the backlog must link to a candidate Linear
  issue ID convention (DOC-XXX or PROD-XXX) per
  Linear_Execution_Blueprint conventions.
- Each P0/P1 row must list the Authored Extension ledger row(s)
  it touches.

OUTPUT
- REMEDIATION_BACKLOG.md.
```

### Prompt 15.3 — Production-Readiness Verdict

```
[PASTE GLOBAL CONVENTIONS PREAMBLE]

TASK
Produce `/Sourcera/_audit/PRODUCTION_READINESS_VERDICT.md`.

STRUCTURE
1. Verdict — one of:
   - SHIP-READY (zero P0; P1 count below threshold; P2/P3 in
     backlog).
   - SHIP-WITH-CONDITIONS (zero P0; P1 count above threshold but
     each has a remediation pack scoped).
   - NOT-SHIP-READY (any P0).
2. Threshold rationale — state the P1 threshold used and why.
3. Top 10 P0 / P1 defects, summarized.
4. Top 5 cross-document drifts, summarized.
5. Authored Extensions ratification readiness — listed by AE-ID.
6. Decisions ledger residual openness.
7. CI gate readiness (4 active vs. 33 spec-binding) — confirm
   stamp gate impact for v7.1.1.
8. Recommended next program (likely a remediation execution
   program targeting v7.2.0 stamp, with phase ordering modeled on
   Integration_Prompts.md).
9. Sign-off block — fields for: Tech Lead, Pricing Owner,
   Security Officer, Compliance Officer, GTM Lead. Audit only
   produces the artifact; sign-off is human.

OUTPUT
- PRODUCTION_READINESS_VERDICT.md.
- AUDIT_README.md → Run Log finalized.

This prompt is the program's terminal output. After this, the
audit hands off to a remediation execution program.
```

---

# Operator Notes

- **Run cadence.** The full program is ~75 prompts. Run Phase 0 in one sitting (it is the foundation). Phases 1–13 may be parallelized within a phase across multiple Cowork sessions on Opus, but DO NOT cross phase boundaries without running the V prompt for the prior phase. Phases 14–15 are sequential.
- **Source-of-truth hierarchy.** All defects defer to CLAUDE.md §2 source-of-truth resolution. When the Master Spec disagrees with a companion doc, the Master Spec wins; file the defect against the companion doc.
- **No silent picks.** Every conflict surfaces in CONSISTENCY_DELTA.md and the defect ledger. No prompt is permitted to silently resolve drift.
- **Audit is non-destructive.** No prompt edits the Master Spec. Remediation is a separate execution program; that program will run with `Integration_Prompts.md`-style authoring prompts targeting REMEDIATION_BACKLOG.md.
- **Authored Extensions discipline.** If an audit prompt finds that a spec section is silent on a dimension AND the dimension is genuinely under-specified across the corpus, file the defect as `class=authored_extension` with `severity=P1` and link it to a recommended Authored Extension ledger entry. Do NOT author the extension inside the audit.
- **CI gate runtime wiring.** §M.5 is a 37-gate catalog; only 4 are runtime-active at v7.1.0. The audit's `ci_gate` defect class flags spec-binding contracts that the runtime cannot yet enforce. These are P1 by default until M02.3 / M11.3 / M21.3 / M24.3 implementation packs ship.
- **Solo Mode.** The Solo plan and §44.6 Solo-Tier Surface Treatment are recent (v7.1.0). Audit prompts pay special attention to silent edge cases under Solo Mode — these are the most likely defects.
- **Cross-document numerical singletons.** Buyer Pricing v3 / Seller Pricing v3 are companion strategy docs; they are NOT authoritative for numbers. Master Spec §34 is. Drift defects always recommend updating the strategy doc.
- **Re-baseline.** Before running Prompt 0.1, confirm the Master Spec version stamp in `Sourcera_Master_Spec.md` is v7.1.0 (or higher). If the baseline drifts during the audit, halt the program, document the drift in AUDIT_README.md, and re-baseline.

# Versioning

- v1.0 — Initial program. Audits Master Spec v7.1.0 (2026-04-28). Designed for Claude Opus 4.6 (1M context). Non-destructive by default. Produces DEFECT_LEDGER.md, REMEDIATION_BACKLOG.md, and PRODUCTION_READINESS_VERDICT.md.
