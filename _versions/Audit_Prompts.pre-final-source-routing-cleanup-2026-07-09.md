# Audit_Prompts.md — Sourcera Master Spec Production-Grade Audit Program

**Program ID:** AUDIT-v7.1.1
**Authoring date:** 2026-04-29
**Author:** Senior staff engineer / technical product strategist
**Target stamp:** Master Spec v7.1.1
**Predecessor programs:** `Integration_Prompts.md` (v7.0.0), `Integration_Prompts_v7.1.md` (v7.1.0 Surface-Abstraction & Dual-Maya)
**Phases:** 20 (Phase 0 through Phase 19) — strictly sequential, gate-driven

---

## 0. Program Charter

### 0.1 Objective

Drive every feature, entity, surface, engine, API, webhook, enum, plan-tier reference, retention rule, and cross-document numeric in `Sourcera_Master_Spec.md` to **production-grade specificity** — defined as: a competent staff engineer can implement the section without asking a single clarifying question, a QA engineer can write acceptance tests directly from the section, and a security/privacy reviewer can sign off without follow-up.

A section is production-grade when it satisfies **all** of:

1. Every entity has a complete field table per §11 conventions.
2. Every feature ends in numbered, observable, testable acceptance criteria.
3. Every state object has a `From / To / Trigger / Conditions / Notes` table.
4. Every enum value is registered in Appendix J.
5. Every multi-section term is registered in Appendix K.
6. Every API endpoint conforms to §32 patterns; every webhook conforms to §31.
7. Every plan-gated capability is reflected in §5.11 + §34.1 + §39 — never inline.
8. Every numerical value (dollar / character limit / file size / duration / quota) lives in exactly one authoritative table; inline references cite the table, not the number.
9. Every retention/privacy implication is stated (§40.2, §6.8, residency, GDPR anonymization).
10. Every applicable edge case is addressed: empty / loading / error / retry / partial / first-time / returning / mobile / desktop / admin / guest / console-firewall / marketplace-domain-isolation / data-residency / TZ-locale-currency / downgrade / DSAR.
11. Every dependency on a third-party (WorkOS, Stripe, Convex, Anthropic, Firecrawl, PostHog, Loops.so, Perplexity, Zendesk) has an outage handling path.
12. Every surface/engine pair is registered in Appendix M.1, with the appropriate §M.5 CI gate row.

### 0.2 Scope

**In scope:**
- `Sourcera_Master_Spec.md` v7.1.0 — every section §1 through §51 and every appendix A through M.
- Cross-document reconciliation against `Sourcera_Buyer_Pricing_Strategy.md`, `Sourcera_Seller_Pricing_Strategy.md`, `UX_Design_of_Sourcera.md`.
- AE ledger (`_integration/AUTHORED_EXTENSIONS_LEDGER.md`) ratification gate.
- Appendix M surface/engine coverage and §M.4 / §M.5 CI gate catalog.

**Out of scope (descoped to v7.1.x or v8.0.0 per Phase 14.0.1):**
- GTM rewrites: `GTM_POSITIONING.md`, `GTM_PLG_ARCHITECTURE.md`, `GTM_SALES_PLAYBOOK.md`, `GTM_90DAY_SPRINT.md`.
- Marketplace-as-RFP-Exchange (§27 narrative reframing + §48 loop updates).
- Retired snapshots in `_versions/` (read only when explicitly required to verify revert points).
- `_personal/` content.
- `assets/` binaries, except `assets/Sourcera_Pitch_Deck.pptx` if its messaging diverges from Master Spec §1–§2 (out-of-band note only; no spec change).

### 0.3 Authority hierarchy (binding for every phase)

1. `Sourcera_Master_Spec.md` v7.1.0 — canonical for everything except UX micro-detail and pricing narrative.
2. Pricing companions — narrative & strategy only; **§34 of Master Spec wins on every number**.
3. `UX_Design_of_Sourcera.md` — canonical for tokens, component states, motion, a11y when Master Spec §3 is silent.
4. AE ledger — canonical for what is **provisionally** in the spec pending ratification.
5. RECONCILIATION.md — canonical for every prior decision.

When sources conflict, surface the conflict in the verify log with both citations and resolve per this order. Never silently pick.

### 0.4 Defect taxonomy

| Severity | Code | Definition | Disposition |
|---|---|---|---|
| P0 | Build Blocker | Section is unbuildable as written. Engineer would have to invent. Examples: missing field, missing state machine, undefined enum, contradiction with another section. | Must fix before v7.1.1 stamp. Logged in AUDIT_DEFECT_LEDGER.md, fixed in-place in Master Spec, reconciled in RECONCILIATION.md. |
| P1 | Spec Gap | Buildable with engineer judgment but ambiguous, missing an applicable edge case, or under-specified. Section will produce divergent implementations across teams. | Must be triaged. Either fixed before v7.1.1, or documented in v7.1.1 backlog with explicit owner and target version. |
| P2 | Cosmetic | Clarity, naming, formatting, terminology drift. Does not affect buildability. | Fixed in-phase, in the same edit pass that resolves P0/P1 in the section. Not deferred. Phase 19 verifies no leak-through. |
| P3 | AE Pending | Section is correctly written but contains an Authored Extension that has not been ratified by a human owner. | Owner notified; row in AE ledger updated; ratification before stamp. |
| P4 | Cross-Doc Drift | Section in Master Spec disagrees with a companion doc. | Master Spec wins per §0.3. Companion doc edited; reconciled. |

### 0.5 Output artifacts (every phase)

Each phase produces:

1. **`_integration/PHASE{N}_AUDIT_VERIFY.md`** — verification log. Sections: `Scope`, `Read`, `Findings (P0/P1/P2/P3/P4)`, `Resolutions in this phase`, `Carried into backlog`, `AEs added`, `Verification gate result`. Pattern matches existing `PHASE{N}_VERIFY.md` files.
2. **`_integration/RECONCILIATION.md`** — append-only entry titled `Phase {N} Audit — {Title} — {Date}`. Body: defect findings, resolution rationale, citations.
3. **`_integration/AUDIT_DEFECT_LEDGER.md`** — running ledger across the entire program. Schema: `ID | Phase | Severity | Section | Title | Status | Resolution | Owner`.
4. **`_integration/AUTHORED_EXTENSIONS_LEDGER.md`** — append a row for every AE introduced during the audit; mark P3 status.
5. **In-place edits to `Sourcera_Master_Spec.md`** — only after a `_versions/Sourcera_Master_Spec.pre-audit-phase-{N}-{YYYY-MM-DD}.md` snapshot is taken.

### 0.6 Convention checklist (apply in every phase)

For every section the phase audits, verify:

1. **Entity tables.** Field, type, constraints, notes. `id` UUID, `org_id` FK where applicable, `console` enum where applicable, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at` (nullable for soft delete). Scope isolation stated. Indexes stated. Retention stated.
2. **Acceptance criteria.** Numbered, observable, measurable, scope-bound. Each criterion testable from the spec alone. Mirror the style of §13.10, §14.9, §17.8, §20.7.
3. **Enums.** Every value referenced is registered in Appendix J. No inline-only enum values.
4. **Glossary.** Every multi-section term is in Appendix K. Cross-references in body cite Appendix K, not redefine inline.
5. **State machines.** Stateful objects have `From / To / Trigger / Conditions / Notes` tables. Prose state descriptions are P1 defects.
6. **APIs.** §32 patterns: method, path, auth scope, rate-limit class, cursor pagination (default 50, max 250), request schema, response schema, error codes (registered in Appendix I), idempotency semantics, concrete worked examples.
7. **Webhooks.** §31 patterns: HMAC-SHA256 signing, idempotency via `event_id`, exponential backoff curve, DLQ after 5 failures, payload ≤256 KB, registered in Appendix C and Appendix G.
8. **Plan gating.** Reflected in §5.11 + §34.1 + §39. Inline limits are P1 defects.
9. **Numerical values.** One authoritative home (§34, §39, §44, §6.8, §40.2, §42.1). Inline values that duplicate the table are P1 defects (drift risk).
10. **Heading syntax.** `## N.N Title {#n.n-title}` preserved. Anchor uniqueness verified.
11. **Surface/engine registration.** Every surface and engine is in Appendix M.1; §M.5 CI gate row exists where applicable.

### 0.7 Edge-case discipline (apply in every phase)

For every feature audited, explicitly check coverage of: first-time vs returning users · empty / loading / error / retry / partial-completion states · validation and invalid input · auth and permission failures · concurrency and sync conflicts · idempotency and retry · notification and webhook delivery failures · third-party outages · mobile vs desktop · admin vs end-user · guest scoping · buyer/seller console firewall · marketplace-domain leakage · data residency (US / EU / custom) · TZ / locale / currency · downgrade paths and data preservation · DSAR and right-to-erasure compatibility.

If the section is silent on an applicable dimension, log a P1 defect with the missing dimension named.

### 0.8 Phase advance gate

A phase advances when all four are true:

1. The verify log exists and is complete.
2. RECONCILIATION.md entry exists.
3. All P0 defects for the phase are resolved (fixed in-place) **or** explicitly downgraded with rationale.
4. AE ledger updates posted; owner notified for any P3 added in the phase.

If any condition is false, the phase is incomplete. Do not advance.

### 0.9 AE ratification gate

Before the v7.1.1 stamp at Phase 19:
- All `pending` AE rows from this audit must reach `ratified` or `withdrawn`.
- Existing v7.1.0 pending rows (`AE-14.9-01`, `AE-14.10-07`, `AE-14.14-21`, `AE-14.18.1-01`, `AE-14.18.1-02`, `AE-14.0.1-01`, `AE-14.0.1-02`) must be ratified per the v7.1.0 release-gate policy already documented in CLAUDE.md §16.

### 0.10 Stamp criteria — v7.1.1

The Master Spec is stamped v7.1.1 when:
- All 20 audit phases have a green verification gate.
- AUDIT_DEFECT_LEDGER.md has zero open P0 defects and an explicit triage decision on every P1.
- RECONCILIATION.md has the closing entry "v7.1.1 stamp — audit program complete".
- AE ledger has zero `pending` rows in the v7.1.0 and AUDIT-v7.1.1 sections.
- §M.4 `appendix_m_coverage_on_diff` CI gate green over the audit branch.
- The 33 §M.5 spec-binding gates that are not yet runtime-active have explicit M02.3 / M11.3 / M21.3 / M24.3 implementation pack assignments in `Linear_Execution_Blueprint.md`.

---

## Phase 0 — Audit Charter & Defect Taxonomy

### Scope
Initialize the audit program. No spec edits.

### Read end-to-end
- `CLAUDE.md`
- `_integration/Integration_Prompts_v7.1.md` (style template)
- This file (`_integration/Audit_Prompts.md`) §0
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` (current state)
- `_integration/RECONCILIATION.md` — last 5 closing entries (for cadence pattern)

### Tasks
1. Snapshot Master Spec to `_versions/Sourcera_Master_Spec.pre-audit-phase-0-2026-04-29.md`.
2. Initialize `_integration/AUDIT_DEFECT_LEDGER.md` with header + empty table.
3. Confirm AE ledger v7.1.0 pending rows are accounted for (do not ratify; only inventory).
4. Produce `_integration/AUDIT_CHARTER.md` — copy of §0 of this file with program metadata stamped (start date, owner, expected stamp target). Append the **Confirmed Operating Decisions** block (trailing appendix of this file) verbatim.
5. Create the `audit-v7.1.1` branch off current main. Verify clean working tree before Phase 1.
6. Produce `PHASE0_AUDIT_VERIFY.md` — verification gate result includes branch creation confirmation, charter file existence, decisions block presence.

### Phase prompt (paste into a fresh Opus session)

> You are running Phase 0 of AUDIT-v7.1.1, the Sourcera Master Spec production-grade audit program. The full program is defined in `_integration/Audit_Prompts.md`. Read §0 of that file end-to-end before starting. Read `CLAUDE.md` end-to-end. Read `_integration/AUTHORED_EXTENSIONS_LEDGER.md` end-to-end.
>
> Execute the Phase 0 task list verbatim. Produce `_integration/AUDIT_CHARTER.md`, `_integration/AUDIT_DEFECT_LEDGER.md` (initialized), and `_integration/PHASE0_AUDIT_VERIFY.md`. Snapshot the Master Spec to `_versions/`. Append a Phase 0 entry to `_integration/RECONCILIATION.md`.
>
> Do not edit `Sourcera_Master_Spec.md` in this phase. Verify the phase advance gate per §0.8. If green, stop and hand off to Phase 1.

### Phase advance gate
Charter exists, defect ledger exists with zero entries, snapshot exists, RECONCILIATION entry exists.

---

## Phase 1 — Structural Integrity

### Scope
Master Spec structural and document-mechanics layer. No feature semantics.

### Authority basis
Master Spec is self-authoritative for its own structure.

### Read end-to-end
- Master Spec table of contents and every heading line (use `Grep` for `^#` to enumerate every heading).
- Appendix A (state machines index), Appendix B (keyboard shortcuts), Appendix C (notification events), Appendix G (PostHog taxonomy), Appendix I (error codes), Appendix J (controlled vocabulary), Appendix K (glossary), Appendix L (state machines body), Appendix M (surface/engine registry).

### Audit checklist
1. **Heading syntax conformance.** Every heading is `## N.N Title {#n.n-title}` (or H3 equivalent). Anchor slug matches title kebab-case. P1 if violated.
2. **Anchor uniqueness.** No two sections share an anchor. P0 if violated.
3. **Cross-reference integrity.** Every `(see §X.Y)`, every `[Appendix Z]`, every `(per §N.N)` resolves to an existing anchor. P0 if dangling.
4. **TOC completeness.** TOC enumerates every section through depth 3. P1 if a §N.N exists but is not in TOC.
5. **Appendix completeness.** Every appendix referenced in body exists. Every appendix declares scope and ownership.
6. **Section ordering.** §1–§51 are monotonic; no gaps unless explicitly noted; no out-of-order numbering.
7. **Glossary canonicality.** Appendix K is the canonical glossary (per CI gate `appendix_k_glossary_canonicality`). Appendix B is keyboard shortcuts only. P0 if any term is defined in Appendix B but not Appendix K.
8. **Heading drift between Master Spec and CLAUDE.md §10 routing table.** Any topic the routing table promises is in §X but is now in §Y is a P1.
9. **Front-matter version stamp.** Master Spec front-matter declares v7.1.0 with stamp date 2026-04-28; verify.

### Phase prompt

> Phase 1 — Structural Integrity. Read `_integration/Audit_Prompts.md` §0 and §Phase 1 end-to-end. Snapshot Master Spec to `_versions/Sourcera_Master_Spec.pre-audit-phase-1-{today}.md`.
>
> Enumerate every heading in `Sourcera_Master_Spec.md` (`Grep` `^#` with `-n`). Build an in-memory anchor map. For every cross-reference in the body (`§\d+\.\d+`, `\[Appendix [A-M]\]`, `\(see §\d+`), verify the target exists. Apply the Phase 1 checklist verbatim.
>
> Log every defect to `_integration/AUDIT_DEFECT_LEDGER.md` with phase=1, severity, section, title, status=open. P0 defects must be resolved in this phase via in-place edits. P1/P2/P3 are logged for triage.
>
> Produce `_integration/PHASE1_AUDIT_VERIFY.md` and the RECONCILIATION entry. Verify the advance gate.

### Phase advance gate
Zero open P0 in defect ledger for Phase 1. Verify log complete. Reconciliation entry posted.

---

## Phase 2 — Foundations: §1 Architecture, §2 Method

### Scope
§1 (architecture, console firewall, two-sided model), §2 (The Sourcera Method, including §2.8 Single-Operator Mode).

### Authority basis
Master Spec.

### Read end-to-end
- §1 and every subsection.
- §2 and every subsection.
- `Sourcera_Buyer_Pricing_Strategy.md` §1 and §2 (intro and method narrative) — for cross-doc parity check only.
- AE ledger rows scoped to §1 / §2.

### Audit checklist
1. Every architectural component named in §1 is implemented in a downstream section. Orphan claims are P0.
2. The buyer/seller console firewall claim in §1 is enforced by §5 RBAC and §32 API auth scopes — verify both anchor back.
3. §2 Method steps reference existing feature surfaces by §-anchor; missing references are P0.
4. §2.8 Single-Operator Mode covers: solo buyer, solo seller, mode switching, plan gating, quota interaction, audit isolation. Missing dimensions are P1.
5. Marketplace-domain isolation is asserted in §1 and enforced by §27 + RBAC §5.11.
6. First-time vs returning user behavior of the architecture (cold start, account creation, tenant provisioning) is stated.
7. Convention checklist §0.6 applied. Edge-case discipline §0.7 applied.

### Phase prompt

> Phase 2 — Foundations (§1, §2). Read `_integration/Audit_Prompts.md` §0 and §Phase 2 end-to-end. Snapshot Master Spec.
>
> Read Master Spec §1 and §2 end-to-end. Build a list of every architectural component / method step claimed. For each, locate the implementing section (§-anchor) downstream. Orphan claims → P0. Missing single-operator-mode dimensions → P1.
>
> Apply Convention Checklist §0.6 and Edge-Case Discipline §0.7. Log every defect. Resolve P0 in-place. Produce verify log + RECONCILIATION entry. Verify advance gate.

### Phase advance gate
Zero open P0 in Phase 2. All §1 architectural claims have implementing references.

---

## Phase 3 — Data Model: §4 + Appendix J + Appendix K

### Scope
§4 (data model, every entity). Appendix J (enums) and Appendix K (glossary) for vocabulary registration.

### Authority basis
Master Spec §4 is canonical for entity definitions.

### Read end-to-end
- §4 in full.
- Appendix J in full.
- Appendix K in full.
- §5 (RBAC scoping references entity scopes — sanity link).
- §22 (KB-related entities live here in v7.0.0+).
- §27 (marketplace-domain entity scoping).

### Audit checklist
1. Every entity in §4 has a complete field table per §0.6 #1.
2. Every entity has scope isolation explicitly stated (org / console / workspace / marketplace-domain). P0 if absent.
3. Every entity has its required indexes stated. P1 if absent.
4. Every entity has retention rule stated (or explicit reference to §40.2 row). P0 if absent and entity is user-data-bearing.
5. Every FK resolves to an existing entity in §4 or §22 or §27. P0 if dangling.
6. Soft-delete entities have `deleted_at` nullable; hard-delete entities have explicit deletion semantics.
7. Every enum field references an Appendix J entry. P0 if inline-only enum value.
8. Every multi-section term used in §4 is in Appendix K. P1 if absent.
9. Console-scoped entities have a `console` enum (`buyer` / `seller` / `marketplace_domain` per Appendix J).
10. Cross-console entities (e.g., `Marketplace_Vendor`) declare a clear isolation rule.
11. Audit-bearing entities link to the audit-event taxonomy (Appendix C / G).
12. Edge-case discipline §0.7: GDPR right-to-erasure path stated for every PII-bearing entity.

### Phase prompt

> Phase 3 — Data Model (§4 + Appendix J + Appendix K). Read `_integration/Audit_Prompts.md` §0 and §Phase 3 end-to-end. Snapshot Master Spec.
>
> Read §4, Appendix J, Appendix K end-to-end. Build entity inventory. For every entity, run the 12-item Phase 3 checklist. For every enum referenced in §4, verify Appendix J registration. For every multi-section term, verify Appendix K registration.
>
> Cross-link to §5 (scope), §22 (KB entities), §27 (marketplace entities), §40.2 (retention), §6.8 (DSAR). Log defects. Resolve P0 in-place. Produce verify log + RECONCILIATION entry.

### Phase advance gate
Zero open P0 in Phase 3. Every §4 entity has scope, retention, indexes, FK validity, enum registration, glossary registration.

---

## Phase 4 — Authorization & Identity: §5 + §6

### Scope
§5 (RBAC, including §5.11 Feature Access Matrix), §6 (auth, SSO, MFA, session, domain governance, including §6.8 DSAR).

### Authority basis
Master Spec.

### Read end-to-end
- §5 in full, with §5.11 Feature Access Matrix end-to-end.
- §6 in full, with §6.8 DSAR end-to-end.
- §32 (API auth scopes — for parity).
- §40.2 (retention — for DSAR linkage).
- Every §7–§51 feature heading (top-line only, to enumerate features for §5.11 coverage).

### Audit checklist
1. **§5.11 exhaustiveness.** Every feature heading in §7–§51 has at least one row in §5.11. Missing rows are P0.
2. **Role completeness.** Every role enum in Appendix J (`buyer_admin`, `buyer_member`, `buyer_guest`, `seller_admin`, `seller_member`, `seller_guest`, `marketplace_admin`, `marketplace_visitor`, plus solo variants) appears as a column or row in §5.11.
3. **Console firewall.** Every buyer-console feature row in §5.11 sets seller-role permissions to `none` and vice versa. P0 if any cross-console permission is non-`none`.
4. **Marketplace-domain isolation.** Marketplace features have explicit `marketplace_admin` / `marketplace_visitor` rows. Sellers cannot bleed into the buyer marketplace experience.
5. **Plan gating.** Every plan-gated feature in §5.11 cites §34.1 (tier definition) and §39 (size constraint) by anchor. Inline limits are P1.
6. **§6 auth.** SSO (WorkOS) outage path stated. MFA enrollment + recovery covered. Session expiry, refresh, revocation. Password policies (if any) reference an authoritative table.
7. **§6.8 DSAR.** Every PII-bearing entity from §4 has a DSAR retrieval path stated. Right-to-erasure path stated. Pseudonymization vs deletion distinction made.
8. **Data residency.** US / EU / custom paths stated; sub-processor list stated; entity-level residency tags (or absence) explicit.
9. **Guest-role boundaries.** Read-only vs comment-only vs upload-only modes are explicit per surface.
10. **Edge-case discipline §0.7** applied to permission failures, downgrade paths, DSAR.

### Phase prompt

> Phase 4 — Authorization & Identity (§5, §6). Read §0 and §Phase 4 of `_integration/Audit_Prompts.md` end-to-end. Snapshot Master Spec.
>
> Enumerate every feature heading in §7–§51 (`Grep` `^## \d+\.\d+`). For each, verify a §5.11 row exists. For each row, verify console-firewall correctness (cross-console roles must be `none`). For each plan-gated row, verify it cites §34.1 and §39 by anchor.
>
> Read §6 in full. Verify SSO outage, MFA enrollment + recovery, session lifecycle, DSAR per-entity coverage, residency tags. Apply Convention Checklist §0.6 and Edge-Case Discipline §0.7. Resolve P0 in-place. Produce verify log + RECONCILIATION entry.

### Phase advance gate
§5.11 covers every §7–§51 feature. Zero console-firewall violations. §6.8 DSAR covers every §4 PII entity.

---

## Phase 5 — UX & Design Tokens: §3 + UX_Design_of_Sourcera.md

### Scope
§3 (UX, including §3.13 Principle 9 and §3.14 Pipeline surface compression). Cross-doc reconciliation with `UX_Design_of_Sourcera.md` v2.0.0.

### Authority basis
Master Spec §3 is canonical for the production-binding subset. UX spec is canonical for tokens, micro-states, motion, a11y not yet pulled into §3.

### Read end-to-end
- Master Spec §3 in full.
- `UX_Design_of_Sourcera.md` in full (it is 483 KB, single-pass).

### Audit checklist
1. Every token referenced in §3 exists in the UX spec token catalog.
2. Every interactive component referenced in §3 has a state catalog (default, hover, focus, active, disabled, loading, error, empty) in the UX spec.
3. WCAG 2.1 AA: every color-pair contrast called out, every interactive surface keyboard-reachable, every form field labeled.
4. Mobile vs desktop divergence stated for every responsive surface. P1 if absent.
5. Motion tokens conform to UX spec §motion (or wherever motion lives) — duration, easing, reduced-motion fallback.
6. §3.13 Principle 9 and §3.14 Pipeline surface compression are operationalized with concrete tokens / layouts. Aspirational prose without binding tokens → P1.
7. §44.6 Solo-Tier Surface Treatment cited from §3 where applicable.
8. UX spec content not in §3 but binding for build → P1, with proposed §3 promotion path.
9. Edge-case discipline §0.7: empty / loading / error / retry / partial / first-time / returning states for every surface.

### Phase prompt

> Phase 5 — UX & Design Tokens (§3 + UX spec). Read §0 and §Phase 5 of `_integration/Audit_Prompts.md` end-to-end. Snapshot Master Spec.
>
> Read Master Spec §3 in full. Read `UX_Design_of_Sourcera.md` in full. Build a token-and-component inventory across both docs. For every token referenced in §3, verify UX-spec presence. For every component, verify state catalog completeness.
>
> Run WCAG 2.1 AA checks per Phase 5 #3. Verify mobile/desktop divergence per surface. Verify §3.13, §3.14, §44.6 are token-bound, not prose-only. Log defects. Resolve P0 in-place. P4 cross-doc drifts trigger UX-spec edits, reconciled to RECONCILIATION.

### Phase advance gate
Zero P0 in Phase 5. Every §3 token resolves to UX spec. Every component has full state catalog.

---

## Phase 6 — Buyer Surfaces, Part 1: §7 through §13

### Scope
§7–§13 — buyer Method onboarding, evaluation pipeline scaffolding, Defense View (§13.11), Buyer Maya intake (§13.12).

### Authority basis
Master Spec.

### Read end-to-end
- §7, §8, §9, §10, §11, §12, §13 in full, including all subsections (especially §13.10 acceptance-criteria style anchor, §13.11 Defense View, §13.12 Buyer Maya intake).
- Appendix L Defense View state machine row.
- Appendix I error codes scoped to §7–§13 (including the 5 v7.1.0 Defense View error codes).

### Audit checklist
1. Every feature in §7–§13 has acceptance criteria per §0.6 #2.
2. Every entity introduced in §7–§13 is in §4 (or explicitly scoped to this section with §4 cross-reference).
3. State machines per §0.6 #5 for Pipeline, Defense View, Maya intake, evaluation lifecycles.
4. Plan gating per §0.6 #8.
5. §13.11 Defense View: state machine in Appendix L.7, 5 error codes registered in Appendix I, role coverage in §5.11.
6. §13.12 Buyer Maya intake: AIOperation metering tied to §44, plan gating tied to §34.1, escalation path stated.
7. §13.10 acceptance-criteria style is followed by every other section in this phase.
8. Edge-case discipline §0.7: empty pipeline, abandoned evaluation, vendor decline, concurrent buyer edits, sync conflicts, mobile divergence.
9. Webhooks scoped to this phase conform to §31 + Appendix C + Appendix G.
10. APIs scoped to this phase conform to §32 + Appendix I.

### Phase prompt

> Phase 6 — Buyer Surfaces, Part 1 (§7–§13). Read §0 and §Phase 6 of `_integration/Audit_Prompts.md` end-to-end. Snapshot Master Spec.
>
> Read §7, §8, §9, §10, §11, §12, §13 in full, with extra attention to §13.10, §13.11, §13.12. Read Appendix L row for Defense View, Appendix I rows for §7–§13 error codes.
>
> Run Convention Checklist §0.6 against every feature in scope. Run Edge-Case Discipline §0.7. Verify §13.11 state machine, error codes, role coverage. Verify §13.12 metering, plan gating, escalation. Log defects. Resolve P0 in-place. Produce verify log + RECONCILIATION entry.

### Phase advance gate
Zero P0 in Phase 6. Every feature has §0.6-compliant acceptance criteria, state machine where applicable, plan gating where applicable.

---

## Phase 7 — Buyer Surfaces, Part 2: §14 through §21

### Scope
Evaluation, scoring, decisioning, procurement (§14–§21).

### Read end-to-end
- §14, §15, §16, §17 (incl. §17.8 acceptance-criteria style), §18, §19, §20 (incl. §20.7 acceptance-criteria style), §21 in full.
- AIOperation rows in §44 referenced from these sections.

### Audit checklist
1. Convention Checklist §0.6 every section.
2. Scoring engine determinism: same inputs → same outputs; tie-breaking rules stated; rounding stated.
3. Decisioning: vendor selection, runner-up handling, audit trail, override path.
4. Procurement: contract artifact lifecycle, e-signature integration (or absence stated), PO generation (if in scope or descoped).
5. AIOperation metering: every AI-powered surface in this range cites §44 by row.
6. Concurrency: two buyers editing the same evaluation, conflict resolution semantics.
7. Edge-case discipline §0.7 applied with explicit attention to: vendor decline mid-evaluation, scoring abandoned, evaluation reopened post-decision.
8. Mobile divergence: scoring grid on mobile, decisioning flow on mobile.

### Phase prompt

> Phase 7 — Buyer Surfaces, Part 2 (§14–§21). Read §0 and §Phase 7 of `_integration/Audit_Prompts.md` end-to-end. Snapshot Master Spec.
>
> Read §14–§21 in full. Pay special attention to §17.8 and §20.7 as acceptance-criteria style anchors. Run Convention Checklist §0.6 and Edge-Case Discipline §0.7 across every feature.
>
> Verify scoring determinism and audit trail. Verify decisioning override path. Verify procurement artifact lifecycle. Verify AIOperation metering coverage against §44. Log defects. Resolve P0 in-place. Produce verify log + RECONCILIATION entry.

### Phase advance gate
Zero P0 in Phase 7. Scoring is deterministic and audit-traceable. Procurement lifecycle complete.

---

## Phase 8 — Seller Console & KB: §22 (full block)

### Scope
§22 in its entirety — Seller KB, MCP, Managed Agents, retrieval, indexing, skills, tool use, Hero Moment, §22.20 Seller Maya Polish. This is the section that integrated the retired KB Engineering Spec.

### Authority basis
Master Spec §22 is canonical. The retired `_versions/KB_Engineering_Spec_retired_2026-04-26.md` is consulted only to verify integration completeness — never as authority.

### Read end-to-end
- §22 in full, every subsection.
- `_versions/KB_Engineering_Spec_retired_2026-04-26.md` in full — to verify nothing was lost in integration.
- §44 AIOperation rows scoped to KB, agents, MCP.
- §34.1 plan gating for KB entitlements (chunk count, embedding budget, agent runs).

### Audit checklist
1. Convention Checklist §0.6 across §22.
2. Managed Agents API version `managed-agents-2026-04-01` declared, endpoints conform to §32, error codes in Appendix I.
3. KB ingestion pipeline: source → fetch → parse → chunk → embed → index. Each stage has acceptance criteria, error handling, retry semantics.
4. MCP tool registry: every tool has schema, auth scope, rate limit, idempotency.
5. Skills registry: every skill has invocation contract, input schema, output schema, failure modes.
6. Retrieval: chunking strategy, embedding model, vector index, ranking, cite-back contract.
7. Indexing: incremental vs full, scheduling, drift detection, reindex trigger.
8. Hero Moment: trigger conditions, AIOperation cost, plan-tier interaction, success/failure UX.
9. §22.20 Seller Maya Polish: AIOperation metering tied to §44, plan gating tied to §34.1.
10. Integration completeness vs retired KB Engineering Spec: build a section-by-section map from retired doc to §22; flag any retired-doc section with no §22 equivalent. P0 if anything was dropped.
11. Edge-case discipline §0.7: KB ingestion failure, agent crash mid-response, retrieval miss, index corruption, MCP tool 5xx.
12. Console-firewall: KB content cannot leak into buyer surfaces except via the controlled Maya pipeline.

### Phase prompt

> Phase 8 — Seller Console & KB (§22). Read §0 and §Phase 8 of `_integration/Audit_Prompts.md` end-to-end. Snapshot Master Spec.
>
> Read §22 in full. Read `_versions/KB_Engineering_Spec_retired_2026-04-26.md` in full and build a section-by-section map of where each retired-doc section now lives in §22. Anything missing → P0.
>
> Run Convention Checklist §0.6 and Edge-Case Discipline §0.7. Verify Managed Agents API version, MCP tool registry conformance, retrieval contract, indexing semantics, Hero Moment triggers, §22.20 metering. Verify plan gating cites §34.1 and §39 by anchor. Log defects. Resolve P0 in-place. Produce verify log + RECONCILIATION entry.

### Phase advance gate
Zero P0 in Phase 8. Retired KB spec section-by-section map complete with no gaps. Managed Agents API + MCP + retrieval + indexing all production-grade.

---

## Phase 9 — Seller Workflow Surfaces: §23 through §26

### Scope
Seller response surfaces, evaluation participation, vendor profile maintenance.

### Read end-to-end
- §23, §24, §25, §26 in full.
- §27 (marketplace) — adjacent context.

### Audit checklist
1. Convention Checklist §0.6.
2. Seller-side evaluation participation flow: invitation → acceptance → response → submission → outcome notification.
3. Vendor profile lifecycle: creation → claim → verification → publication → updates.
4. AIOperation metering for seller-side AI assist tied to §44.
5. Plan gating per §0.6 #8.
6. Console-firewall integrity.
7. Edge-case discipline §0.7: declined invitations, mid-response withdrawal, vendor profile delisting, marketplace-domain rebranding.

### Phase prompt

> Phase 9 — Seller Workflow Surfaces (§23–§26). Read §0 and §Phase 9 of `_integration/Audit_Prompts.md` end-to-end. Snapshot Master Spec.
>
> Read §23–§26 in full. Run Convention Checklist §0.6 and Edge-Case Discipline §0.7. Verify response lifecycle, vendor profile lifecycle, AIOperation metering, plan gating, console-firewall integrity. Log defects. Resolve P0 in-place. Produce verify log + RECONCILIATION entry.

### Phase advance gate
Zero P0 in Phase 9.

---

## Phase 10 — Marketplace Discovery: §27

### Scope
§27 — Vendor Discovery Marketplace, marketplace-domain isolation, seller signals, marketplace pricing.

### Read end-to-end
- §27 in full.
- `Sourcera_Seller_Pricing_Strategy.md` §Marketplace Discovery Pricing.
- §34 plan tier definitions for marketplace entitlements.
- §27.10 Verification Tier (especially the Solo-explicit accept rule per v7.1.1 backlog 14.12.1).

### Audit checklist
1. Convention Checklist §0.6.
2. Marketplace-domain isolation enforced — no cross-domain leakage.
3. Verification tier ladder explicit, with Solo-tier explicit acceptance per backlog 14.12.1.
4. Seller signals: which signals are computed, how, what windows, what plan-tier interaction.
5. Marketplace pricing: anchor to §34; no inline numbers.
6. Search ranking: deterministic, explainable, override-safe, ad-aware.
7. Edge-case discipline §0.7: marketplace down-listing, seller suspension, verification failure, marketplace-visitor (unauthenticated) experience.

### Phase prompt

> Phase 10 — Marketplace Discovery (§27). Read §0 and §Phase 10 of `_integration/Audit_Prompts.md` end-to-end. Snapshot Master Spec.
>
> Read §27 in full. Read Seller Pricing §Marketplace Discovery Pricing. Run Convention Checklist §0.6 and Edge-Case Discipline §0.7. Verify domain isolation, verification ladder (with Solo accept), seller-signal computation, ranking determinism, marketplace-visitor UX. Log defects. Resolve P0 in-place. Produce verify log + RECONCILIATION entry.

### Phase advance gate
Zero P0 in Phase 10. Verification ladder includes Solo accept. Domain isolation provable.

---

## Phase 11 — Cross-Cutting & Notifications: §28 through §30

### Scope
Cross-cutting feature surfaces (e.g., notifications, comments, attachments, search) and notification delivery.

### Read end-to-end
- §28, §29, §30 in full.
- Appendix C (notification event catalog) in full.
- Appendix G (PostHog event taxonomy) in full.

### Audit checklist
1. Convention Checklist §0.6.
2. Every notification event in body is registered in Appendix C and Appendix G.
3. Every PostHog event has `console`, `org_id`, `user_id`, `feature_id`, `plan_tier` properties.
4. Email delivery path (Loops.so) outage handling stated.
5. In-app notifications: read/unread, batching, retention.
6. Search: index lifecycle, permissions filtering, multi-tenancy isolation.
7. Edge-case discipline §0.7: notification storm, email-bounce handling, search-index drift.

### Phase prompt

> Phase 11 — Cross-Cutting & Notifications (§28–§30 + Appendix C + Appendix G). Read §0 and §Phase 11 of `_integration/Audit_Prompts.md` end-to-end. Snapshot Master Spec.
>
> Read §28–§30 in full. Read Appendix C and Appendix G in full. Build an inventory of every notification event mentioned in §1–§51 body. Verify each is in Appendix C and Appendix G. Verify PostHog property schema completeness. Run Convention Checklist §0.6 and Edge-Case Discipline §0.7. Log defects. Resolve P0 in-place. Produce verify log + RECONCILIATION entry.

### Phase advance gate
Zero P0 in Phase 11. Notification event inventory complete and registered.

---

## Phase 12 — APIs & Webhooks: §31 + §32 + Appendix I

### Scope
§31 (webhooks), §32 (APIs), Appendix I (error codes).

### Read end-to-end
- §31 in full.
- §32 in full.
- Appendix I in full.
- Every API endpoint reference in §1–§51 body (use Grep for `POST /` `GET /` `PUT /` `PATCH /` `DELETE /`).
- Every webhook event reference in §1–§51 body.

### Audit checklist
1. Every API endpoint in body conforms to §32 patterns: method, path, auth scope, rate-limit class, cursor pagination (default 50, max 250), request/response schema, idempotency, examples, error code list. P0 if any element missing.
2. Every error code referenced is in Appendix I. P0 if dangling.
3. Every webhook event conforms to §31: HMAC-SHA256 signing, idempotency via `event_id`, exponential backoff curve, DLQ after 5 failures, payload ≤256 KB.
4. Rate-limit classes consistent: per-org, per-user, burst.
5. Auth scopes consistent with §6 + §5.11.
6. Pagination cursor opacity, monotonicity, expiration stated.
7. Idempotency key behavior stated: header name, TTL, replay semantics.
8. Edge-case discipline §0.7: 4xx vs 5xx semantics, retry-after, partial responses, async vs sync.

### Phase prompt

> Phase 12 — APIs & Webhooks (§31, §32, Appendix I). Read §0 and §Phase 12 of `_integration/Audit_Prompts.md` end-to-end. Snapshot Master Spec.
>
> Read §31, §32, Appendix I in full. Enumerate every API endpoint and webhook event mentioned in body §1–§51 (Grep). For each endpoint, verify §32 conformance per the 8-item Phase 12 checklist. For each webhook, verify §31 conformance. For each error code, verify Appendix I registration.
>
> Log defects. Resolve P0 in-place (typically by completing the endpoint specification or registering missing error codes). Produce verify log + RECONCILIATION entry.

### Phase advance gate
Zero P0 in Phase 12. Every endpoint §32-conformant. Every webhook §31-conformant. Every error code registered.

---

## Phase 13 — Pricing, Billing, Metering: §34 + §44 + §39 + companion docs

### Scope
§34 (plan tier definitions, numerical authority), §44 (consumption / AIOperation), §39 (object size constraints). Cross-doc reconciliation against `Sourcera_Buyer_Pricing_Strategy.md` v3 and `Sourcera_Seller_Pricing_Strategy.md` v3.

### Authority basis
Master Spec §34 is the numerical authority. Pricing companions are narrative-only.

### Read end-to-end
- §34 in full.
- §44 in full (incl. §44.6 Solo-Tier Surface Treatment).
- §39 in full.
- `Sourcera_Buyer_Pricing_Strategy.md` in full.
- `Sourcera_Seller_Pricing_Strategy.md` in full.
- §5.11 Feature Access Matrix (cross-link).
- Appendix J Plan Tiers entry.

### Audit checklist
1. Every plan tier (`buyer_free`, `buyer_solo`, `buyer_$299`, `buyer_$799`, `buyer_$1999`, `buyer_custom`, `seller_free`, `seller_solo`, `seller_$149`, `seller_$499`, `seller_$1499`, `seller_custom`) has a complete row in §34.1, §34.2, Appendix J, §39, §5.11.
2. Every dollar figure / quota / limit is sourced from §34, §39, §44, §6.8, §40.2, §42.1. Inline duplications elsewhere are P1 (drift risk).
3. Every AIOperation type is registered in §44 with: name, unit cost, plan-tier inclusion, overage rate, metering point, idempotency semantics.
4. Buyer Pricing v3 numbers reconcile to §34. Discrepancies → P4 (Master Spec wins) and edit Buyer Pricing.
5. Seller Pricing v3 numbers reconcile to §34. Discrepancies → P4 (Master Spec wins) and edit Seller Pricing.
6. Forced-signup mechanics (Seller Pricing) reconcile to §34 + §22 + §27.
7. Hero Moment economics reconcile to §22 + §44.
8. KB value capture reconcile to §22 + §44.
9. Solo tier (§34.1.1, §34.1.2, §34.1.3, §34.2.1, §34.2.2, §34.2.5, §34.10.3, §34.12.6, §44.6) — every reference explicit, no implicit Solo behavior.
10. Edge-case discipline §0.7: downgrade path data preservation, plan-tier transition mid-cycle, overage handling, dunning, GDPR-erasure during active subscription.

### Phase prompt

> Phase 13 — Pricing, Billing, Metering (§34, §44, §39 + Buyer Pricing + Seller Pricing). Read §0 and §Phase 13 of `_integration/Audit_Prompts.md` end-to-end. Snapshot Master Spec. Snapshot Buyer Pricing and Seller Pricing to `_versions/`.
>
> Read §34, §44, §39, Buyer Pricing, Seller Pricing in full. Build a number inventory: every dollar figure, quota, limit, AIOperation cost. For each, verify single authoritative home in Master Spec §34 / §39 / §44 / §6.8 / §40.2 / §42.1. Reconcile every Buyer/Seller Pricing number against §34 — drift is P4, fix in companion docs.
>
> Run Convention Checklist §0.6 and Edge-Case Discipline §0.7. Verify Solo-tier coverage at every cited anchor. Verify forced-signup, Hero Moment, KB-value-capture economics. Log defects. Resolve P0 in-place. Edit pricing companions to reconcile P4 drifts.

### Phase advance gate
Zero P0 and zero P4 open in Phase 13. Every number has a single authoritative home. Buyer + Seller Pricing reconcile to §34.

---

## Phase 14 — Compliance, Retention, Privacy: §40 + §6.8 + §42

### Scope
§40 (retention), §6.8 (DSAR), §42 (privacy / compliance / sub-processors).

### Read end-to-end
- §40 in full (incl. §40.2 retention table).
- §6.8 in full.
- §42 in full.
- §4 (entity inventory — for cross-link).

### Audit checklist
1. Every entity in §4 has a retention rule in §40.2 (or explicit out-of-scope flag).
2. Every PII-bearing entity has a DSAR retrieval and erasure path in §6.8.
3. Sub-processor list current (WorkOS, Stripe, Convex, Anthropic, Firecrawl, PostHog, Loops.so, Perplexity, Zendesk).
4. Data residency tags per entity (US / EU / custom) present.
5. GDPR anonymization (vs deletion) path stated for entities that cannot be hard-deleted (e.g., billing artifacts).
6. SOC 2 / ISO 27001 control mappings declared (or explicit "out of scope until audit X").
7. Edge-case discipline §0.7: erasure during active subscription, residency conflict on user move, sub-processor offboarding.

### Phase prompt

> Phase 14 — Compliance, Retention, Privacy (§40, §6.8, §42). Read §0 and §Phase 14 of `_integration/Audit_Prompts.md` end-to-end. Snapshot Master Spec.
>
> Read §40, §6.8, §42 in full. Cross-reference §4 entity inventory. For each entity, verify retention rule + DSAR path + residency tag + erasure path. Verify sub-processor list currency. Run Convention Checklist §0.6 and Edge-Case Discipline §0.7. Log defects. Resolve P0 in-place. Produce verify log + RECONCILIATION entry.

### Phase advance gate
Zero P0 in Phase 14. Every §4 entity has retention + DSAR coverage.

---

## Phase 15 — Growth & Network Effects: §48

### Scope
§48 — PLG loops, network effects, viral mechanics, retention loops.

### Read end-to-end
- §48 in full.
- `GTM/GTM_PLG_ARCHITECTURE.md` (narrative reference).
- `GTM/GTM_NETWORK_EFFECTS.md` (narrative reference).

### Audit checklist
1. Every PLG loop has trigger, action, outcome, instrumentation event (Appendix G), and plan-gating implication.
2. Every network effect has a measurable proxy and a referenced Appendix G event.
3. Forced-signup, Hero Moment, KB-value-capture loops are explicit.
4. Marketplace-as-RFP-Exchange descope per Phase 14.0.1 acknowledged with forward-reference row.
5. Edge-case discipline §0.7: loop fails (e.g., invited user never signs up), loop abuse (referral farming), loop saturation.
6. Convention Checklist §0.6 — esp. plan gating and AIOperation metering for AI-powered loops.

### Phase prompt

> Phase 15 — Growth & Network Effects (§48). Read §0 and §Phase 15 of `_integration/Audit_Prompts.md` end-to-end. Snapshot Master Spec.
>
> Read §48 in full. Build an inventory of PLG loops and network effects. For each, verify: trigger, action, outcome, Appendix G event, plan-gating implication, abuse path, failure path. Acknowledge Marketplace-as-RFP-Exchange descope. Log defects. Resolve P0 in-place. Produce verify log + RECONCILIATION entry.

### Phase advance gate
Zero P0 in Phase 15. Every loop is instrumented and abuse-considered.

---

## Phase 16 — Surface/Engine Coverage & CI Gates: Appendix M

### Scope
Appendix M.1 (mapping registry), §M.2 (process gates), §M.3 (AE note), §M.4 (`appendix_m_coverage_on_diff` CI gate), §M.5 (37-gate catalog).

### Read end-to-end
- Appendix M in full.
- `Build_Execution_Strategy.md` §11 (M02.3 / M11.3 / M21.3 / M24.3 implementation packs).
- `Linear_Execution_Blueprint.md` §5 (runtime wiring schedule).

### Audit checklist
1. Every surface declared anywhere in Master Spec body is registered in §M.1 (forward-paired with its engine[s]).
2. Every engine is registered in §M.1 with its surface[s].
3. Every §M.5 gate has: gate name, trigger, scope, severity, runtime status (active / spec-binding-only), implementation pack assignment.
4. Currently 4 gates active at runtime (per CLAUDE.md §16); the remaining 33 are spec-binding. Verify the 33 are all assigned to M02.3 / M11.3 / M21.3 / M24.3 in `Linear_Execution_Blueprint.md` §5.
5. §M.4 CI gate `appendix_m_coverage_on_diff` is operational (verify recent green run on audit branch). Override path `@ci-gate-override:` PR-description annotation per §M.4.4.
6. Marketplace-as-RFP-Exchange forward-reference row in §M.1 is labeled "(deferred to v7.1.x; Phase 14.0.1 scope amendment)".
7. Edge-case discipline §0.7: gate false-positive, override abuse, surface added without engine.

### Phase prompt

> Phase 16 — Surface/Engine Coverage & CI Gates (Appendix M). Read §0 and §Phase 16 of `_integration/Audit_Prompts.md` end-to-end. Snapshot Master Spec.
>
> Read Appendix M in full. Read `Build_Execution_Strategy.md` §11 and `Linear_Execution_Blueprint.md` §5. Enumerate every surface and engine declared in §1–§51 body. Verify §M.1 registration for each. Enumerate every §M.5 gate; verify implementation pack assignment for the 33 spec-binding-only gates. Verify §M.4 CI gate operational on the audit branch.
>
> Log defects. Resolve P0 in-place. Produce verify log + RECONCILIATION entry.

### Phase advance gate
Zero P0 in Phase 16. Every surface and engine in §M.1. Every §M.5 gate has runtime status + implementation pack assignment.

---

## Phase 17 — Cross-Document Consistency

### Scope
Reconcile Master Spec against Buyer Pricing, Seller Pricing, UX Design end-to-end. Catch any drift introduced or surfaced by Phases 1–16.

### Read end-to-end
- All four documents.
- AUDIT_DEFECT_LEDGER.md current state.

### Audit checklist
1. Pricing companions reconcile to §34 (closes any P4 from Phase 13).
2. UX spec reconciles to §3 (closes any P4 from Phase 5).
3. Vocabulary consistency: every multi-section term used in companions exists in Appendix K.
4. Enum consistency: every enum value used in companions is in Appendix J.
5. Plan-tier nomenclature consistency: companion docs use the canonical names from §34.1 / §34.2 (e.g., `buyer_solo`, not "solo plan" or "Solo tier" inconsistently).
6. AIOperation nomenclature consistency: companion docs use canonical AIOperation names from §44.
7. Solo-tier coverage in all docs.
8. Defense View, Buyer Maya, Seller Maya, Hero Moment terminology consistent.

### Phase prompt

> Phase 17 — Cross-Document Consistency. Read §0 and §Phase 17 of `_integration/Audit_Prompts.md` end-to-end. Snapshot all four canonical docs to `_versions/`.
>
> Read Master Spec §34, Master Spec §3, Buyer Pricing v3, Seller Pricing v3, UX Design v2.0.0 in full. Run the 8-item Phase 17 checklist. Reconcile any drift — Master Spec wins on numbers and on canonical nomenclature; companions are edited to match. Log defects. Produce verify log + RECONCILIATION entry.

### Phase advance gate
Zero open P4 in Phase 17. Companions reconciled to Master Spec.

---

## Phase 18 — Adversarial Counterfactual Pass

### Scope
Re-read every section flagged in Phases 1–17 as a hostile staff engineer. For every feature surface, enumerate **at least three realistic failure modes** and verify the section addresses each.

### Authority basis
This phase produces no new spec content unless a counterfactual exposes a buildability gap. In that case, the gap is a P0 or P1 fix.

### Read end-to-end
- AUDIT_DEFECT_LEDGER.md.
- Every section that had any defect logged in Phases 1–17.

### Audit checklist
1. **Counterfactual triple per feature.** For every feature audited in Phases 6–11 + 13 + 15, enumerate three failure modes and verify the section addresses each. Failure modes drawn from edge-case discipline §0.7 — but specific to the feature, not generic.
2. **Production code review pass.** For every section with P0/P1 in earlier phases, re-read post-fix as a hostile reviewer: would this fix pass code review? Are the acceptance criteria QA-acceptable? Could a junior engineer build against this unambiguously?
3. **Concurrency adversarial pass.** Pick the 10 highest-risk concurrent scenarios from across the spec. Verify each is addressed.
4. **Third-party outage adversarial pass.** For each of the 9 external dependencies, walk the full spec and enumerate every section that depends on it. Verify each has an outage handling path.
5. **Console-firewall adversarial pass.** Attempt to construct a buyer-action-leaks-to-seller and seller-action-leaks-to-buyer scenario. Verify the spec blocks both.
6. **Marketplace-domain-leakage adversarial pass.** Same as #5 across marketplace domains.
7. **Downgrade adversarial pass.** For each plan-tier downgrade transition, verify data preservation rules.

### Phase prompt

> Phase 18 — Adversarial Counterfactual Pass. Read §0 and §Phase 18 of `_integration/Audit_Prompts.md` end-to-end.
>
> Re-read every Master Spec section that had a defect logged in Phases 1–17. For each feature, enumerate three realistic failure modes and verify the section addresses each. Run the 7-item Phase 18 checklist as an explicit hostile review. Any new gap discovered → P0 or P1, logged and resolved in this phase.
>
> Produce `_integration/PHASE18_AUDIT_VERIFY.md` and the RECONCILIATION entry. Verify advance gate.

### Phase advance gate
Zero new P0 from Phase 18. Every feature has a counterfactual triple addressed.

---

## Phase 19 — Defect Triage & v7.1.1 Stamp Gate

### Scope
Final triage. AE ratification gate. v7.1.1 stamp.

### Read end-to-end
- AUDIT_DEFECT_LEDGER.md.
- AUTHORED_EXTENSIONS_LEDGER.md.
- RECONCILIATION.md tail entries.

### Tasks
1. Triage every open defect:
   - P0 must be closed (or downgraded with rationale) — block stamp if any open.
   - P1 — close inline if low-cost; otherwise route to v7.1.1 backlog with explicit owner + target version.
   - P2 — verify all P2 cosmetics from earlier phases were fixed in-phase per §0.4. Any leak-through is fixed here, not deferred.
   - P3 — every AE row must reach `ratified` or `withdrawn` per §0.9.
   - P4 — must be closed (companion docs reconciled).
2. Run §M.4 `appendix_m_coverage_on_diff` CI gate against the audit branch. Must be green.
3. Verify the 33 §M.5 spec-binding gates have explicit M02.3 / M11.3 / M21.3 / M24.3 assignments. Block stamp if any unassigned.
4. Confirm pre-v7.1.0 AE rows ratified.
5. Increment Master Spec version stamp to v7.1.1; update CLAUDE.md §`Last updated:` and `Corpus state:`.
6. Snapshot v7.1.0 → `_versions/Sourcera_Master_Spec.v7.1.0-pre-v7.1.1-2026-XX-XX.md`.
7. Append closing entry to RECONCILIATION.md: "v7.1.1 stamp — AUDIT-v7.1.1 program complete".

### Phase prompt

> Phase 19 — Defect Triage & v7.1.1 Stamp Gate. Read §0 and §Phase 19 of `_integration/Audit_Prompts.md` end-to-end.
>
> Triage every open defect per the 7-item Phase 19 task list. Block stamp if any P0 / P4 open or any P3 unratified. Verify §M.4 CI gate green. Verify §M.5 backlog assignments complete. Snapshot v7.1.0, increment to v7.1.1, update CLAUDE.md, append RECONCILIATION closing entry.
>
> Produce `_integration/PHASE19_AUDIT_VERIFY.md` with the final defect summary, AE ratification summary, and stamp confirmation.

### Phase advance gate (and program completion gate)
v7.1.1 stamped per §0.10 stamp criteria.

---

## Appendix — Phase Sequencing Diagram

```
Phase 0  Charter
   │
Phase 1  Structural Integrity ──────────────┐
   │                                         │ enables
Phase 2  Foundations (§1, §2)               │  every
   │                                         │  later
Phase 3  Data Model (§4)                    │  phase
   │                                         │
Phase 4  Authorization & Identity (§5, §6)  │
   │                                         │
Phase 5  UX & Tokens (§3 + UX spec)         │
   │                                         │
Phase 6  Buyer Surfaces P1 (§7–§13)         │
   │                                         │
Phase 7  Buyer Surfaces P2 (§14–§21)        │
   │                                         │
Phase 8  Seller Console & KB (§22)          │
   │                                         │
Phase 9  Seller Workflow (§23–§26)          │
   │                                         │
Phase 10 Marketplace Discovery (§27)        │
   │                                         │
Phase 11 Cross-Cutting & Notifications      │
   │                                         │
Phase 12 APIs & Webhooks                    │
   │                                         │
Phase 13 Pricing, Billing, Metering         │
   │                                         │
Phase 14 Compliance, Retention, Privacy     │
   │                                         │
Phase 15 Growth & Network Effects (§48)     │
   │                                         │
Phase 16 Surface/Engine Coverage (App M)    │
   │                                         │
Phase 17 Cross-Document Consistency ◄───────┘
   │
Phase 18 Adversarial Counterfactual Pass
   │
Phase 19 Triage & v7.1.1 Stamp
```

Each phase's advance gate must be green before the next phase begins. Phase 17 explicitly closes any cross-doc drift surfaced in any earlier phase. Phase 18 is the hostile review across the cumulative work. Phase 19 is the stamp.

---

## Appendix — Confirmed Operating Decisions

Confirmed by Blake on 2026-04-29 prior to Phase 0 kickoff. Phase 0 copies this block verbatim into `_integration/AUDIT_CHARTER.md`. These decisions are immutable for the duration of AUDIT-v7.1.1; any change requires a charter-amendment commit on the audit branch and a RECONCILIATION entry titled "Charter amendment — {date}".

1. **Branch strategy.** Single `audit-v7.1.1` branch off current main. Per-phase commits. Each phase's verification gate is marked with an annotated git tag `audit-v7.1.1-phase-{N}-gate` once green. The branch merges to main at v7.1.1 stamp.
2. **Cosmetic batching.** P2 cosmetics are fixed in-phase, in the same edit pass that resolves P0/P1 in each section. Not deferred to a rollup PR. Phase 19 verifies no leak-through.
3. **Phase parallelization.** Strict sequential. Each phase's gate must be green before the next phase begins. No parallel phase execution.
4. **Companion-doc edits.** `Sourcera_Buyer_Pricing_Strategy.md` and `Sourcera_Seller_Pricing_Strategy.md` are editable in Phase 13 (numerical reconciliation to §34) and Phase 17 (cross-doc consistency). `UX_Design_of_Sourcera.md` is editable in Phase 5 and Phase 17 under the same rule. All three companions are snapshotted to `_versions/` before any edit. Master Spec wins on every conflict.
5. **AE owner notification cadence.** One notification per phase summarizing AEs added in that phase, posted to the closing block of `PHASE{N}_AUDIT_VERIFY.md`. One bulk notification at Phase 19 stamp gate covering all unratified rows.
6. **v7.1.0 backlog folding.** Phase 19 stamp ratifies the seven open v7.1.0 AE rows (`AE-14.9-01`, `AE-14.10-07`, `AE-14.14-21`, `AE-14.18.1-01`, `AE-14.18.1-02`, `AE-14.0.1-01`, `AE-14.0.1-02`) per CLAUDE.md §16. If any owner is unreachable at stamp gate, the row is withdrawn (not silently deferred), with rationale logged in RECONCILIATION.
