# CLAUDE.md — Sourcera Project Navigation Guide

**Purpose:** Orient any Claude session working in this folder. Load this before doing anything else. It defines what each file is, which files are authoritative for which questions, what to avoid, and how to author changes that survive review.

**Last updated:** 2026-05-20
**Corpus state:** Master Spec **v7.1.0a stamped (P0 hot-patch; 2026-05-20)**. The v7.2.0-REM Program closed Phase 6 (P0 Closure Audit) on 2026-05-20 — 12 of 12 PROD-CRIT-NN P0 defects closed across Phases 1–5 (D-2.2-042, D-AK-001, D-AK-002, D-AK-003, D-11.2-004, D-11.3-001, D-11.3-002, D-EM-001, D-EM-002, D-EM-003, D-EM-004, D-RES-004); 3 of 3 P0 Counterfactual failure modes closed; the v7.1.0a stamp is authorized under the Verdict §8 alternative-posture scope (Phases 1–6 P0-only). Pre-stamp Master Spec snapshot at `_versions/Sourcera_Master_Spec.v7.1.0a-pre-stamp-2026-05-20.md` (6,388,739 bytes; md5 `a186f1b7844e6961f4fb8a12f77f114a`). The Phase V8.4 v7.1.0a sub-stamp (2026-05-08; Appendix I Preamble + 20 D-V8.4 closures + 10 new §M.5 CI gates) is preserved as an additive sub-stamp under the v7.1.0a umbrella and remains in force. **Residual at v7.1.0a stamp time: 808 P1 defects (322 P1-cluster slots)** out of v7.1.0a scope; released as the v7.1.1 stamp-gate execution surface. The earlier v7.1.0 program window remains the v7.1.0a baseline. **Phase V11 catalog-completeness remediation pass closed 2026-05-11** (closes 3 P0 + 7 of 12 P1 ci_gate defects against §M.4 / §M.5; D-11.4-001 P1 + 5 surface-class M.1 defects deferred to Phase 11.5 as AE-V11-04). **Phase V12 Operations / QA / Observability / DR spec-side remediation closed 2026-05-11** (closes 8 P0 + 78 P1 + 29 P2 + 8 P3 = 123 defects across §42 / §43 retirement / §46 / §50 + V12 adversarial defects; §43 retired in-place with §50 successor surfaces; §42 substantially rewritten with revenue-affecting metrics + per-service SLOs + canonical severity ladder + customer-reported incident ingest + Runbook Inventory + log/trace/PII contracts + entity catalog; §46 rewritten with per-service test pyramid + AIOperation evaluation + console firewall scenarios + DSAR/GDPR scenarios + chaos coverage; §50 extended with 11 new Ops surfaces §50.20–§50.30 + state-machine extensions for pre-action notification dwell + anti-collusion device-fingerprint guard; 11 V12 Authored Extensions AE-V12-01 through AE-V12-11 registered for v7.1.1 ratification). Baseline v7.0.0 snapshot at `_versions/Sourcera_Master_Spec.v7.0.0-pre-v7.1-2026-04-26.md`. Pre-V11 v7.1.0 snapshot at `_versions/Sourcera_Master_Spec.v7.1.0-pre-V11-remediation-2026-05-11.md`. Pre-V12 v7.1.0 snapshot at `_versions/Sourcera_Master_Spec.v7.1.0-pre-V12-remediation-2026-05-11.md`. **Pre-v7.1.0a-stamp v7.1.0a snapshot at `_versions/Sourcera_Master_Spec.v7.1.0a-pre-stamp-2026-05-20.md`.** Next program: v7.1.1 stamp pending AE ratification batch (sole-signer posture per AE-V72REM-00 holds until named-role hires) + P1 catalog + top-50 cluster execution (Phase 9) + P1 long-tail execution (Phase 10) + CI runtime wiring + new V12 CI gate runtime wiring (32 gates across M02.3 / M11.3 / M21.3 / M24.3 / release-orchestration); Phase 11.5 M.1 Engine-Concept Backfill queued separately for v7.1.2.
**Folder reorganization (2026-04-29):** `Integration_Prompts.md` and `Integration_Prompts_v7.1.md` moved to `_integration/`. `Blake_Task_List_Document_Hardening.md` moved to `_personal/`. `Sourcera_Pitch_Deck.pptx`, `Sourcera_Investor_Talk_Track.docx`, and `brandguidelines/` consolidated into `assets/`. Canonical specs (`Sourcera_Master_Spec.md`, `Sourcera_Buyer_Pricing_Strategy.md`, `Sourcera_Seller_Pricing_Strategy.md`, `UX_Design_of_Sourcera.md`, `Build_Execution_Strategy.md`, `Linear_Execution_Blueprint.md`, `SWE_Project_Instructions.md`) remain at root because they are referenced by bare filename in dozens of `_integration/` log entries; moving them would create semantic drift across ~25+ documents. Pre-reorg backup of this file at `_versions/CLAUDE.md.pre-reorg-2026-04-29.md`.

---

## 1. What Sourcera Is

Sourcera is the operating system for enterprise software procurement. Two firewalled consoles (Buyer and Seller) plus a Vendor Discovery Marketplace. Buyers run a structured evaluation pipeline ("The Sourcera Method"). Sellers maintain a Knowledge Base that feeds Claude Managed Agents to respond to buyer evaluations. Pricing is outcome-based AI consumption on top of plan tiers.

This folder is the full strategic, product, engineering, and go-to-market corpus. Treat every artifact as production-grade.

---

## 2. Source-of-Truth Hierarchy

When sources conflict, resolve in this order (highest first). Always surface the conflict explicitly before resolving — never silently pick one.

1. **`Sourcera_Master_Spec.md`** — authoritative build spec. Engineering, design, QA, analytics, security, finance, ops all implement against this.
2. **`Sourcera_Buyer_Pricing_Strategy.md`** and **`Sourcera_Seller_Pricing_Strategy.md`** — authoritative for pricing, billing, AIOperation metering, entitlements, rate cards.
3. **`KB_Engineering_Spec.md`** *(retired in v7.0.0; snapshot at `_versions/KB_Engineering_Spec_retired_2026-04-26.md`)* — was authoritative for Seller Knowledge Base, MCP, Managed Agents, retrieval, indexing, skill registry, tool use. All authoritative content has been integrated into Master Spec §22. Do not consult except for historical reference.
4. **`Sourcera_Master_Summary.md`** *(retired in v7.0.0; snapshot at `_versions/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md`)* — was authoritative for positioning, GTM concepts, PLG loops, network effects that were not yet integrated into the Master Spec. Superseded by Master Spec. Do not consult.
5. **`UX_Design_of_Sourcera.md`** — authoritative for UX tokens, interaction patterns, and design-language detail not yet pulled into §3 of the Master Spec.
6. **`GTM/GTM_Prompts.md`** and other narrative GTM artifacts (see §4 below) — authoritative for positioning and narrative only. Never authoritative for engineering behavior.
7. **`Build_Execution_Strategy.md`** and **`Linear_Execution_Blueprint.md`** — authoritative for execution sequencing and Linear project structure. Not authoritative for product behavior.

> The project instructions reference a file named `What_is_Sourcera.md` in the source-of-truth list. That file does not currently exist in this folder. If a session needs narrative framing, use Master Spec §1 (architecture) and §2 (method) or `GTM/GTM_POSITIONING.md`. Do not consult the retired `_versions/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md`. Flag the missing file if work requires it.

---

## 3. Folder Layout

```
Sourcera/
├── CLAUDE.md                                  # This file. Project navigation guide.
├── Sourcera_Master_Spec.md                    # Canonical build spec (v7.1.0).
├── Sourcera_Buyer_Pricing_Strategy.md         # Buyer pricing companion.
├── Sourcera_Seller_Pricing_Strategy.md        # Seller pricing companion.
├── UX_Design_of_Sourcera.md                   # UX/UI spec.
├── Build_Execution_Strategy.md                # Three-layer execution doctrine.
├── Linear_Execution_Blueprint.md              # Linear project / cycle / issue structure.
├── SWE_Project_Instructions.md                # Engineering operating instructions.
│
├── GTM/                                       # GTM corpus (10 files; narrative only).
│   ├── GTM_Project_Instructions.md            # GTM mode operating instructions.
│   ├── GTM_Prompts.md
│   ├── GTM_POSITIONING.md
│   ├── GTM_PLG_ARCHITECTURE.md
│   ├── GTM_NETWORK_EFFECTS.md
│   ├── GTM_GROWTH_TACTICS.md
│   ├── GTM_CONTENT_ENGINE.md
│   ├── GTM_SALES_PLAYBOOK.md
│   ├── GTM_90DAY_SPRINT.md
│   └── GTM_PLAYBOOK_PROMPTS.md
│
├── _integration/                              # Integration program — authoritative log.
│   ├── RECONCILIATION.md                      # Master reconciliation log (1.3 MB).
│   ├── DELTA_INVENTORY.md                     # v6 → v7 delta inventory.
│   ├── Decisions.md                           # Pending-decisions ledger.
│   ├── AUTHORED_EXTENSIONS_LEDGER.md          # AE ratification queue.
│   ├── Integration_Prompts.md                 # 13-phase prompt program (v1.2).
│   ├── Integration_Prompts_v7.1.md            # v7.1 phase prompts.
│   └── PHASE{N}_VERIFY.md                     # Per-phase verification logs.
│
├── _versions/                                 # Historical snapshots (read-only by default).
├── _personal/                                 # Personal scratch (not corpus).
│   └── Blake_Task_List_Document_Hardening.md
│
└── assets/                                    # Binaries and non-spec reference material.
    ├── Sourcera_Pitch_Deck.pptx               # Investor pitch deck.
    ├── Sourcera_Investor_Talk_Track.docx      # Investor talk track.
    └── brandguidelines/                       # External design references.
        ├── README.md
        └── ramp-design-system.html
```

The empty directory `Pitch Assets/` was retired into `assets/` on 2026-04-29 but the FUSE-backed sync layer would not allow the empty directory to be removed from the bash sandbox. Delete it manually in Finder if it remains.

---

## 3.1 File Catalog — Core Specification Layer

All paths relative to the Sourcera folder root.

| File | Size | Role | When to read |
|---|---|---|---|
| `Sourcera_Master_Spec.md` | ~4.4 MB, v7.1.0 (2026-04-28) | The build spec. §1 architecture, §2 method (incl. §2.8 Single-Operator Mode), §3 UX (incl. §3.13 Principle 9, §3.14 Pipeline surface compression), §4 data model, §5 RBAC, §6 auth, §7–§51 feature sections (incl. §13.11 Defense View, §13.12 Buyer Maya intake, §22.20 Seller Maya Polish, §44.6 Solo-Tier Surface Treatment), appendices A–M (Appendix M = surface/engine mapping registry + §M.4 / §M.5 CI gate catalogs). | Any engineering, data-model, RBAC, billing, AIOperation, pricing-enforcement, API, webhook, feature-access, surface/engine, CI-gate, or consistency question. |
| `Sourcera_Buyer_Pricing_Strategy.md` | 43 KB, v3 (2026-04-27) | Buyer plans (Free / Solo / $299 / $799 / $1,999 / custom), outcome-based AI consumption, rate cards, scenarios. Numerical authority is in Master Spec §34. | Any buyer billing, metering, or entitlement narrative — but cite Master Spec §34 for numerical contracts. |
| `Sourcera_Seller_Pricing_Strategy.md` | 72 KB, v3 (2026-04-27) | Seller plans (Free / Solo / $149 / $499 / $1,499 / custom), forced-signup mechanics, Hero Moment, KB value capture, seller network effects, Marketplace Discovery pricing. Numerical authority is in Master Spec §34. | Any seller billing, metering, entitlement, KB-value-capture, or marketplace-pricing narrative — but cite Master Spec §34 for numerical contracts. |
| `UX_Design_of_Sourcera.md` | 483 KB, v2.0.0 (2026-04-28) | Production-ready UX/UI spec. Tokens, components, interaction patterns, motion, a11y. | UX tokens, state catalogs, component behavior, accessibility. When Master Spec §3 is silent or less detailed, this is authoritative. |
| `_versions/KB_Engineering_Spec_retired_2026-04-26.md` | 91 KB | **Retired in v7.0.0.** Was the Seller KB engineering spec: Managed Agents API (`managed-agents-2026-04-01`), Agent SDK, tool use, skills, retrieval, indexing. Content integrated into Master Spec §22. | Historical reference only. For current KB engineering, read Master Spec §22. |
| `_versions/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md` | 175 KB | **Retired in v7.0.0.** Was the strategic narrative source. Superseded by Master Spec. | Do not consult. |

---

## 4. File Catalog — GTM Layer

GTM files live in `GTM/`. Narrative and strategic only. Never authoritative for engineering behavior.

| File | Size | Focus |
|---|---|---|
| `GTM/GTM_Project_Instructions.md` | 6 KB | Operating instructions for GTM sessions. Pin to Cowork project settings for GTM mode. |
| `GTM/GTM_Prompts.md` | 45 KB | GTM prompt library — positioning, category, messaging, ICP, personas. |
| `GTM/GTM_POSITIONING.md` | 102 KB | Category creation, positioning, competitive framing. |
| `GTM/GTM_PLG_ARCHITECTURE.md` | 111 KB | PLG architecture, buyer and seller growth loops, funnel design. |
| `GTM/GTM_NETWORK_EFFECTS.md` | 92 KB | Two-sided marketplace dynamics, seller-side network effects, data moat. |
| `GTM/GTM_GROWTH_TACTICS.md` | 61 KB | Growth tactics — referrals, virality, partnerships. |
| `GTM/GTM_CONTENT_ENGINE.md` | 86 KB | Content strategy, SEO, programmatic SEO, thought leadership. |
| `GTM/GTM_SALES_PLAYBOOK.md` | 152 KB | Sales motion, ICP, cold outreach, demo script, objection handling. |
| `GTM/GTM_90DAY_SPRINT.md` | 81 KB | Solo-operator 90-day GTM execution plan. |
| `GTM/GTM_PLAYBOOK_PROMPTS.md` | 50 KB | Reusable GTM playbook prompts. |

---

## 5. File Catalog — Execution & Planning

| File | Role |
|---|---|
| `Build_Execution_Strategy.md` | The three-layer execution model (Linear orchestration · repo context · Claude Code execution). How milestones, implementation packs, and AGENTS.md files are structured. |
| `Linear_Execution_Blueprint.md` | v2.0.0 hardened post-audit. Linear project, team, cycle, issue, label structure. Milestone graph. |
| `SWE_Project_Instructions.md` | The canonical engineering/staff-engineer operating instructions (same content as the project settings). |
| `_integration/Integration_Prompts.md` | v1.2 Opus-optimized. The 13-phase prompt program that integrates Summary and KB spec into the Master Spec to produce v7.0.0. When the user references "Phase N" or "Prompt V," they mean this file. **Moved from root → `_integration/` on 2026-04-29.** Historical references in `_integration/` logs that say `/Sourcera/Integration_Prompts.md` now refer to this path. |
| `_integration/Integration_Prompts_v7.1.md` | v7.1 phase prompts (Surface-Abstraction & Dual-Maya program). **Moved from root → `_integration/` on 2026-04-29.** Previously uncatalogued; surfaced as drift during the 2026-04-29 reorganization. |
| `_personal/Blake_Task_List_Document_Hardening.md` | Blake's personal running task list for document hardening. **Moved from root → `_personal/` on 2026-04-29** to separate personal scratch from corpus. |

---

## 6. File Catalog — `_integration/` (Authoritative Integration Artifacts)

These are authoritative for the v7.0.0 → v7.1.0 integration program. Do not delete or rewrite. Append-only in spirit — update existing entries when status changes.

| File | Role |
|---|---|
| `_integration/RECONCILIATION.md` | 1.3 MB. The master reconciliation log. Every integration decision, conflict, and resolution lives here. If the user asks how a decision was made, this is the first place to look. |
| `_integration/DELTA_INVENTORY.md` | 105 KB. Exhaustive delta inventory from v6.0.0 → v7.0.0 walked out of the Summary and KB spec. The scoping document for the entire integration. |
| `_integration/Decisions.md` | 62 KB. Pending-decisions ledger. Advisory recommendations on open calls surfaced during Phases 0–4, Pricing Rewrite, and Phase 22 Rewrite. |
| `_integration/AUTHORED_EXTENSIONS_LEDGER.md` | The canonical Authored-Extension ratification queue. Tracks AE rows, status, ratification gates, and owner notification. Release-gate policy: open `pending` rows must ratify before each version stamp. |
| `_integration/Integration_Prompts.md` | v1.2 Opus-optimized. 13-phase prompt program that produced v7.0.0. *(Moved here from root on 2026-04-29.)* |
| `_integration/Integration_Prompts_v7.1.md` | v7.1 phase prompts (Surface-Abstraction & Dual-Maya program). *(Moved here from root on 2026-04-29.)* |
| `_integration/PHASE1_VERIFY.md` … `PHASE14_VERIFY.md` | Per-phase verification logs (Opus adversarial review pattern). Each phase has one canonical log; prior drafts are backed up in `_versions/`. Phase 12 split into 12_1, 12_2, 12_3, 12_4, GATE. Phase 13 split into 13_2, ENG_REVIEW, FINAL. |

---

## 7. `_versions/` — Historical Snapshots (Read-Only by Default)

100 dated snapshots of the Master Spec, companion docs, and verification logs (as of 2026-04-29). Naming convention:

- `Sourcera_Master_Spec.v{version}-pre-{change-id}-{date}.md` — pre-edit backups.
- `Sourcera_Master_Spec_post_{change-id}_{timestamp}.md` — post-edit checkpoints.
- `Sourcera_Master_Spec_v6.0.0.md` — the v6.0.0 baseline.
- `PHASE{N}_VERIFY_{context}.md` — superseded phase-verify drafts.

**Do not read these by default.** They exist so destructive edits are revertible. Only open one when:
- The user explicitly asks about historical state.
- You need to confirm what a section looked like before a specific change.
- You are verifying that a backup was taken before a destructive edit.

**Before any destructive edit to `Sourcera_Master_Spec.md`, copy the current version to `_versions/` with a dated, change-scoped filename.**

---

## 8. `assets/` — Binaries and Non-Spec Reference Material

`assets/` holds investor binaries and external design references. None of these files are authoritative for engineering behavior.

| File | Role |
|---|---|
| `assets/Sourcera_Pitch_Deck.pptx` | Investor pitch deck. Open via the `pptx` skill if you need to read or edit it. *(Moved from root on 2026-04-29.)* |
| `assets/Sourcera_Investor_Talk_Track.docx` | Investor talk track. Open via the `docx` skill if you need to read or edit it. *(Moved from `Pitch Assets/` on 2026-04-29.)* |
| `assets/brandguidelines/README.md` | 18 bytes — placeholder. *(Moved from `brandguidelines/` on 2026-04-29.)* |
| `assets/brandguidelines/ramp-design-system.html` | 107 KB standalone HTML reference of Ramp's design system. Used as an external stylistic reference, not a spec. Do not copy Ramp tokens into Sourcera — Sourcera has its own token system in UX spec §3 and Master Spec §3. *(Moved from `brandguidelines/` on 2026-04-29.)* |

---

## 9. `_personal/` — Personal Scratch (Not Corpus)

Files here are personal task lists, working notes, or other artifacts that are not part of the Sourcera corpus. Sessions should generally not consult `_personal/` unless the user explicitly references it.

| File | Role |
|---|---|
| `_personal/Blake_Task_List_Document_Hardening.md` | Blake's running task list for document hardening. *(Moved from root on 2026-04-29.)* |

---

## 10. Task Routing — Which File for Which Question

| User asks about… | Read in this order |
|---|---|
| Data model, entities, fields, scope isolation | Master Spec §4, Appendix K (glossary), Appendix J (enums). |
| RBAC, roles, guest scoping, feature access | Master Spec §5 (especially §5.11 Feature Access Matrix). |
| Auth, SSO, MFA, session, domain governance, DSAR | Master Spec §6. |
| Pricing tiers, consumption, AI metering, rate cards | Buyer Pricing (buyer-side), Seller Pricing (seller-side), Master Spec §34 (plan definitions) and §44 (consumption model). |
| Seller KB, MCP, Managed Agents, retrieval, skills | Master Spec §22 (canonical; KB Engineering Spec content fully integrated here in v7.0.0). |
| UX tokens, states, interaction patterns | Master Spec §3 first; `UX_Design_of_Sourcera.md` for deeper component/interaction detail. |
| APIs, webhooks, error codes, rate limits, idempotency | Master Spec §31 (webhooks), §32 (APIs), Appendix C (notification events), Appendix I (error codes). |
| Marketplace discovery, vendor directory, seller signals | Master Spec §27, Seller Pricing §Marketplace Discovery Pricing. |
| PLG, growth loops, network effects, positioning | Master Spec §48 (integrated growth concepts); `GTM/GTM_PLG_ARCHITECTURE.md` and `GTM/GTM_NETWORK_EFFECTS.md` for narrative detail. |
| Execution sequencing, Linear structure, cycle planning | `Build_Execution_Strategy.md`, `Linear_Execution_Blueprint.md`. |
| An integration-program decision or conflict | `_integration/RECONCILIATION.md` (first), `_integration/Decisions.md`, phase verify logs. |
| "Phase N" or "Prompt V" references | `_integration/Integration_Prompts.md` (v7.0.0 program) and `_integration/Integration_Prompts_v7.1.md` (v7.1.x program). |
| Authored Extensions (AE-*) | `_integration/AUTHORED_EXTENSIONS_LEDGER.md`. |

When the question spans multiple files, read all relevant sources in full before responding. Do not grep the spec for a heading and answer from that alone — read the section end-to-end.

---

## 11. Authoring Conventions (Non-Negotiable)

Any new or extended spec content must meet Master Spec fidelity. Enforce on every authored change.

- **Entities.** Full field table: `Field | Type | Constraints | Notes`. Include `id` (UUID), `org_id` (FK) where applicable, `console` enum where applicable, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at` (nullable for soft delete). State scope isolation (org / console / workspace / marketplace-domain). State required indexes. State retention rules.
- **Acceptance criteria.** Numbered, testable, observable, measurable, scope-bound. Mirror the style of §13.10, §14.9, §17.8, §20.7.
- **Enums.** Register every value in Appendix J. Never invent inline enum values.
- **Glossary.** Every new multi-section term → Appendix K. (Phase 12.3 — 2026-04-26: convention amended from "Appendix B" to "Appendix K" to match Master Spec body. Appendix B is the Keyboard Shortcut Reference; Appendix K is the canonical Glossary. CI gate `appendix_k_glossary_canonicality` asserts.)
- **State machines.** `From / To / Trigger / Conditions / Notes` tables. Prose state descriptions are not acceptable.
- **APIs.** Follow §32: method, path, auth scope, rate-limit class, cursor pagination (default 50, max 250), request schema, response schema, error codes (update Appendix I), idempotency, concrete examples.
- **Webhooks.** Follow §31: HMAC-SHA256 signing, idempotency via `event_id`, exponential backoff, DLQ after 5 failures, payload ≤256KB, register in Appendix C and Appendix G (PostHog taxonomy).
- **Plan gating.** Reflect in §5.11 (Feature Access Matrix), §34.1 (Plan Tier Definitions), §39 (Object Size Constraints). Never duplicate a limit inline — cite the table.
- **Retention / privacy.** State retention (§40.2), DSAR behavior (§6.8), data-residency behavior, GDPR anonymization path.
- **Numerical values.** One authoritative home per number (§34, §39, §44, §6.8, §40.2, §42.1). Inline references cite the table, not the number.
- **Heading syntax.** Preserve `## N.N Title {#n.n-title}`.

---

## 12. Edge-Case Discipline

Every review or authoring pass must explicitly consider: first-time vs returning users · empty / loading / error / retry / partial states · validation · auth / permission failures · concurrency and sync conflicts · idempotency and retries · notification and webhook delivery failures · third-party outages (WorkOS · Stripe · Convex · Anthropic · Firecrawl · PostHog · Loops.so · Perplexity · Zendesk) · mobile vs desktop divergence · admin vs end-user · guest role scoping · buyer/seller console firewall · marketplace-domain leakage · data residency (US / EU / custom) · TZ / locale / currency · downgrade paths and data preservation · DSAR and right-to-erasure compatibility. If a feature is silent on any applicable dimension, surface the gap.

---

## 13. Operational Rules for Claude

1. **Read before answering.** For any non-trivial question, read the relevant source file(s) in full. Opus's context budget is sufficient for the entire corpus — use it. Never claim to have reviewed a document you only sampled.
2. **Back up before destructive edits.** Copy `Sourcera_Master_Spec.md` to `/_versions/Sourcera_Master_Spec_pre-{change-id}-{YYYY-MM-DD}.md` before any structural change. Same convention for any other authoritative spec file.
3. **Surface conflicts explicitly.** When two sources disagree, state the conflict, cite both, and resolve per the hierarchy in §2. Never silently pick a side.
4. **Flag authored extensions.** If a source is underspecified and you author the missing detail, mark the addition as `Authored Extension — requires human sign-off` and append a row to `_integration/AUTHORED_EXTENSIONS_LEDGER.md`.
5. **Do not hallucinate corpus content.** If the corpus does not support a claim, say so.
6. **Do not produce partial analysis.** Finish the work, then deliver. No rolling commentary while reading.
7. **Do not narrate process.** The work is the work. Don't list the documents you read — let the answer reflect it.
8. **Maintain terminology consistency.** Normalize naming when the user's input is inconsistent (e.g., "AI operation" → `AIOperation`; "MRR" vs "subscription revenue" — use the term established in the spec).
9. **Master Spec wins.** v7.0.0 is complete and v7.1.0 is stamped. The Master Spec is canonical for every topic the retired Master Summary and KB Engineering Spec previously covered. Treat the retired snapshots in `_versions/` as historical reference only.
10. **Do not consult `_personal/` unless the user explicitly references it.** It is personal scratch, not corpus.
11. **Move-history pointers in old logs.** `_integration/` log entries reference `Integration_Prompts.md` and `Integration_Prompts_v7.1.md` by bare filename or by the legacy path `/Sourcera/Integration_Prompts.md`. As of 2026-04-29 those files live at `_integration/Integration_Prompts.md` and `_integration/Integration_Prompts_v7.1.md`. The historical log entries are not retroactively updated.

---

## 14. Mode Selection

Two session modes are defined in the project instructions:

- **SWE mode** (default in Cowork) — engineering/spec authoring. Governed by `SWE_Project_Instructions.md`. Use when the work is product/engineering/pricing/architecture.
- **GTM mode** — positioning, growth, content, sales. Governed by `GTM/GTM_Project_Instructions.md`. Context-loading protocol: Master Spec §1–§2 (architecture and method) → Buyer Pricing → Seller Pricing → relevant `GTM/` deliverable.

If the request is ambiguous (e.g., "pricing"), default to SWE mode, because pricing has engineering enforcement consequences (metering, entitlement, plan gating). Switch to GTM framing only when the user explicitly asks for positioning, copy, messaging, or sales enablement.

---

## 15. Quick File-Size Reference

| File | Approx size | Load cost |
|---|---|---|
| `Sourcera_Master_Spec.md` | 4.9 MB / ~16,000 lines | Large — read specific sections unless a full pass is required. |
| `UX_Design_of_Sourcera.md` | 483 KB | Readable in one pass. |
| `Sourcera_Seller_Pricing_Strategy.md` | 72 KB | Readable in one pass. |
| `Sourcera_Buyer_Pricing_Strategy.md` | 43 KB | Readable in one pass. |
| `Linear_Execution_Blueprint.md` | 188 KB | Readable in one pass. |
| `Build_Execution_Strategy.md` | 59 KB | Readable in one pass. |
| `_integration/RECONCILIATION.md` | 1.3 MB | Large — grep for the section or phase in question first, then read that block end-to-end. |
| `_integration/DELTA_INVENTORY.md` | 105 KB | Readable in one pass. |
| `_integration/Integration_Prompts.md` | 100 KB | Readable in one pass. |
| `_integration/Integration_Prompts_v7.1.md` | 70 KB | Readable in one pass. |
| Individual `GTM/` files | 45–152 KB | Readable in one pass. |
| Individual phase verify logs | 37–109 KB | Readable in one pass. |

---

## 16. Known Drift / Open Issues

- **Folder reorganization (2026-04-29).** `Integration_Prompts.md`, `Integration_Prompts_v7.1.md` → `_integration/`. `Blake_Task_List_Document_Hardening.md` → `_personal/`. `Sourcera_Pitch_Deck.pptx`, `Sourcera_Investor_Talk_Track.docx`, `brandguidelines/` → `assets/`. Canonical specs kept at root because they are referenced by bare filename in dozens of `_integration/` log entries. Pre-reorg CLAUDE.md backed up at `_versions/CLAUDE.md.pre-reorg-2026-04-29.md`. Empty `Pitch Assets/` directory could not be removed via the bash sandbox (FUSE permission denial); delete in Finder if it remains. Historical log entries that reference `/Sourcera/Integration_Prompts.md` or bare `Integration_Prompts.md` are not retroactively updated.
- **v7.1.0a stamp state (as of 2026-05-20).** Master Spec is at **v7.1.0a (P0 hot-patch)**. The v7.2.0-REM Program closed Phase 6 (P0 Closure Audit) on 2026-05-20 with the v7.1.0a hot-patch stamp authorized: **12 of 12 PROD-CRIT-NN P0 defects** closed (D-2.2-042, D-AK-001, D-AK-002, D-AK-003, D-11.2-004, D-11.3-001, D-11.3-002, D-EM-001, D-EM-002, D-EM-003, D-EM-004, D-RES-004) across Phases 1–5 of the v7.2.0-REM Program; **3 of 3 P0 Counterfactual failure modes** closed (CF#1 override-firewall four-predicate cross-validator; CF#2 Stripe-Customer Atomic-Binding Protocol; CF#3 §M.5 per-row `Runtime status` column). Pre-stamp Master Spec backup at `_versions/Sourcera_Master_Spec.v7.1.0a-pre-stamp-2026-05-20.md` (6,388,739 bytes; md5 `a186f1b7844e6961f4fb8a12f77f114a`). Stamp authority: Master Spec Changelog v7.1.0a (2026-05-20) entry §1–§6; `_integration/RECONCILIATION.md → v7.2.0-REM Program → Phase 6 — P0 Closure Audit + v7.1.0a Stamp Scoreboard (2026-05-20)`; `_audit/PHASE6_P0_CLOSURE_AUDIT.md`; `_audit/PRODUCTION_READINESS_VERDICT.md §1 / §8 / §9`. The earlier Phase V8.4 v7.1.0a sub-stamp dated 2026-05-08 remains in force as an additive sub-stamp under the v7.1.0a umbrella (Appendix I Preamble + 20 D-V8.4 closures + 10 new §M.5 CI gates); its known-issues carry-over is rebound to the v7.1.1 hygiene pass per the v7.1.0a §6 Known Issues block. **Residual at v7.1.0a stamp time: 808 P1 defects** (organized into 322 P1-cluster slots per `_audit/REMEDIATION_BACKLOG.md §3`) — explicitly out of v7.1.0a scope; released as the v7.1.1 stamp-gate execution surface per Verdict §8 phase ordering. v7.1.1 stamp gate runtime artifact: `tools/release/stamp_gate.ts` (release-orchestration; `v7_1_1_stamp_gate_runtime_status_audit` is the single `spec_binding_release_gate_only` gate in §M.5).
- **v7.1.0 stamp state (as of 2026-04-28).** Master Spec is at v7.1.0. The Surface-Abstraction & Dual-Maya program (Phase 14.0 → Phase 14.20) is closed. The v7.0.0 baseline is preserved at `_versions/Sourcera_Master_Spec.v7.0.0-pre-v7.1-2026-04-26.md`. *(Superseded as the current stamp by the 2026-05-20 v7.1.0a hot-patch stamp above; preserved here for reference to the v7.1.0 baseline and the v7.1.0 → v7.1.0a delta surface.)*
- **Master Summary supersession.** `Sourcera_Master_Summary.md` was retired in v7.0.0 and remains retired. Snapshot at `_versions/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md`. (The internal "Master Summary v1.2" reference in some pre-v7.1.0 reconciliation drafts referred to a planned §1 rewrite that was superseded by the v7.0.0 retirement; no v1.2 exists.) Not authoritative for any topic.
- **Solo plan tier and Defense View are authoritative in Master Spec.** Solo (`buyer_solo` / `seller_solo`) is in §34.1.1 / §34.1.2 / §34.1.3 / §34.2.1 / §34.2.2 / §34.2.5 / §34.10.3 / §34.12.6, Appendix J Plan Tiers, and Appendix M. Defense View is in §13.11 with state machine in Appendix L.7 and 5 error codes in Appendix I v7.1.0 sub-section.
- **Appendix M is the canonical surface/engine contract.** §M.1 mapping registry (post-V11: positive-semantic `Tier visibility` column per the V11 D-11.1-010 amendment + `Companion: <doc>.md §<anchor>` syntax per the V11 D-11.4-003 amendment), §M.2 process gates, §M.3 Authored Extension Note, §M.4 `appendix_m_coverage_on_diff` CI gate (hardened in Phase V11 remediation pass — closed 2026-05-11), §M.5 **122-gate** catalog (post-V11: with `row_class` / `runtime_status` / `execution_context` / `assertion` / `runbook` / `override_path` schema columns per the V11 D-11.3-007 / -008 / -012 / D-11.4-004 amendments). Override grammar canonical at §M.4.4.5: `appendix_m_coverage_on_diff` overrides use `@appendix-m-internal-only:` per §M.4.4.1 (60-char rationale floor + cross-class qualifier requirement + §M.4.4.2 customer-surface-reachability cross-validation closing the D-11.2-004 P0 firewall-bypass); all other gates use `@ci-gate-override:` per §M.4.4.5 (60-char rationale floor; Gate ID literal match; row-level `not_permitted` supersedes default; `coupled_with:<other_gate_id>` / `requires_audit_event:<event_kind>` suffixes supported).
- **§M.4 CI gate is runtime-active; §M.5 runtime wiring is partial.** **2 gates** are `runtime_active` at v7.1.0 (`appendix_m_coverage_on_diff` and `appendix_m_tier_visibility_smoke`, confirmed by Phase 14.20 closeout audit on 2026-04-28 per §M.5.8). **119 gates** are `spec_binding_pending_pack_<id>` per the §M.5.5 per-row runtime-status assignment table (M02.3 / M11.3 / M21.3 / M24.3 implementation packs per `Build_Execution_Strategy.md` §11 and `Linear_Execution_Blueprint.md` §5). **1 gate** is `spec_binding_release_gate_only` (`v7_1_1_stamp_gate_runtime_status_audit`; runs only at v7.1.1 stamp time via the release-orchestration pipeline `tools/release/stamp_gate.ts`). v7.1.1 stamp gate.
- **§M.4 runtime wiring (M02.3 implementation pack).** Wiring artifacts: `tools/spec-lint/appendix_m_coverage_on_diff.ts` (detector + comment-poster; runs in `.github/workflows/spec-lint.yml`); `tools/spec-lint/override_parser.ts` (§M.4.4.1 / §M.4.4.5 grammar parser); `tools/spec-lint/cross_validation.ts` (§M.4.4.2 customer-surface-reachability cross-validator — the V11 firewall hardening); `tools/spec-lint/cosmetic_edit_filter.ts` (cosmetic-edit filter version-tied to the §M.4.2.1 alias-redirect table); `convex/crons/appendix_m_gate_nightly_digest.ts` (§M.4.6 nightly digest cron — posts to Slack `#spec-ops` with Loops.so `lo_spec_ops_digest` fallback); `convex/audit/spec_lint_audit_event.ts` (§M.4.5.1 AuditEvent serializer); PostHog event `spec_lint.appendix_m_gate_run` (Appendix G); Datadog service `spec-lint` + monitor `appendix_m_gate_nightly_digest_failed`; PagerDuty schedule `spec-ops-oncall-rotation` for reviewer rotation + SLA escalation.
- **v7.1.x descopes (Phase 14.0.1).** GTM rewrites (`GTM_POSITIONING.md`, `GTM_PLG_ARCHITECTURE.md`, `GTM_SALES_PLAYBOOK.md`, `GTM_90DAY_SPRINT.md`) and Marketplace-as-RFP-Exchange (§27 narrative reframing + §48 loop updates) are formally descoped to v7.1.x. Appendix M.1 forward-reference row is labeled "(deferred to v7.1.x; Phase 14.0.1 scope amendment)".
- **v7.1.1 backlog open.** P1 defects (7) and P2 cosmetic backlog (6) from Phase 14.19 rolled into `_integration/RECONCILIATION.md` → v7.1.1 Backlog. Includes Phase 14.13a (audit-event / enum / error code rollup), 14.13b (Defense View enums), 14.13c (EvalStarter PostHog / webhook / audit), 14.13d (Phase 14.8 §4.4.4 / §22.6 / Appendix J / G rollup), 14.9.2 (inline plan-tier-list audit, 27 locations), 14.12.1 (§27.10 Verification Tier Solo-explicit accept), 14.18.1 runtime wiring. **Plus Phase V11 carry-over (added 2026-05-11):** AE-V11-01 through AE-V11-08 ratifications (the V11-cluster Authored Extensions); AE-V11-04 M.1 Engine-Concept Backfill Pack (~135 rows; tracked in `_audit/REMEDIATION_BACKLOG.md` Phase 11.5 block); 19 V11-cluster gate runtime wirings landing in M02.3 / M11.3 / M24.3 / release-orchestration pipeline; 11 P2 + 4 P3 cosmetic items in `_audit/REMEDIATION_BACKLOG.md` v7.1.1 Mechanical Hygiene block.
- **AE ledger v7.1.0 ratification queue (per `_audit/AE_RATIFICATION_RECOMMENDATIONS.md`, 2026-05-12; refined 2026-05-13 per V14 remediation pass D-V14-004).** Open `pending` rows split by dependency status: **5 READY** (AE-14.9-01 Solo enum authoritative; AE-14.10-07 Solo `low_priority_background` capability set; AE-14.14-21 §2.8.7 AC #5 deadline-countdown TZ rule; AE-14.0.1-01 GTM rewrites descope; AE-14.0.1-02 Marketplace-as-RFP-Exchange descope). **2 BLOCKED on Phase V11 cluster** (AE-14.18.1-01 depends_on: AE-V11-03 + AE-V11-07 — §M.5 122-row catalog assertion + 5 new schema columns; AE-14.18.1-02 depends_on: AE-V11-06 — `@ci-gate-override:` annotation grammar harmonization at §M.4.4.5). Per the ledger's release-gate policy, ratification of 5 READY rows + V11 cluster + 2 BLOCKED rows all close before v7.1.1 stamps. See D-AE-011 (P1) for the upstream block surfacing. **Plus Phase V11 (added 2026-05-11):** AE-V11-01 (Hero Moment / Solo override-prohibition cluster — 7 rows), AE-V11-02 (DSAR cascade class-coverage override-prohibition), AE-V11-03 (§M.5 catalog schema tightening — 5 new columns), AE-V11-04 (M.1 Engine-Concept Backfill Pack — body deferred to Phase 11.5), AE-V11-05 (Anchor-slug alias-redirect table seed), AE-V11-06 (§M.4 V11 hardening block), AE-V11-07 (§M.5 V11 hardening block), AE-V11-08 (§M.1 column legend + companion-doc syntax + anchor fix). Owner notification is queued in the v7.1.0 / V11 program section headers of `_integration/AUTHORED_EXTENSIONS_LEDGER.md`.
- **Phase V11 remediation closed 2026-05-11.** Audit Phase V11 (Adversarial Verification of Phase 11) signed off HALTED on 3 inherited P0 ci_gate defects; a same-day remediation pass closed all 3 P0 + 7 of 12 P1 in-place (D-11.4-001 P1 deferred to Phase 11.5 as AE-V11-04; 5 surface-class M.1 backfill defects bundled into the same Phase 11.5 pass). Spec edits: §M.4 full rewrite; §M.5 full rewrite (19 new rows + 17 in-place amendments + 5 new schema columns + 9 anchored sub-headings + corrected post-V11 122-row arithmetic + Phase 14.20 closeout outcome record); §M.1 preamble + Admin Dashboard row anchor fix. Pre-edit Master Spec backup at `_versions/Sourcera_Master_Spec.v7.1.0-pre-V11-remediation-2026-05-11.md`. Full audit trail in `_audit/PHASE11V_FINDINGS.md` + `_audit/DEFECT_LEDGER.md` Phase V11 Spec-Side Remediation block + `_integration/RECONCILIATION.md → Phase V11 Remediation (2026-05-11)` block + `_integration/AUTHORED_EXTENSIONS_LEDGER.md` Phase V11 program section.
- **Pricing strategy docs companion role.** `Sourcera_Buyer_Pricing_Strategy.md` v3 and `Sourcera_Seller_Pricing_Strategy.md` v3 are narrative-and-strategy companions; numerical authority sits in Master Spec §34. When a number conflicts, Master Spec wins.
- `What_is_Sourcera.md` is referenced in the source-of-truth hierarchy but is not present in this folder. Use Master Spec §1–§2 for canonical narrative framing or `GTM/GTM_POSITIONING.md` for category positioning. Flag if work requires the missing file.
- Several `pre-*` snapshots in `_versions/` have near-identical sizes — they are discrete revert points, not duplicates. Do not consolidate.
- **v7.2.0-REM Phase 7 renumbering reconciliation (D-AE-016, P2; closed 2026-06-13).** The v7.2.0-REM execution closed canonical **Phase 7** (Prompts 7.1/7.2/7.3 = `AE_RATIFICATION_RECOMMENDATIONS.md §2.1/§2.2/§2.3`) as three separately-labeled passes — "Phase 7" (§2.2), "Phase 8" / "Phase AE Hygiene Pass" (§2.1), "Phase 8.2" (§2.3) = **Phase 7 Sweep-Pass A/B/C**. Those execution "Phase 8"/"Phase 8.2" labels do **NOT** denote canonical **Phase 8 = the cluster ratification** (1V/2V/3V/3V+/6R/V7/V8.4/V9/10V; Prompts 8.1/8.2), which has **not run** (all cluster rows `pending`). Authoritative crosswalk + binding rule for the cluster pass: `_integration/RECONCILIATION.md → v7.2.0-REM Program → Phase 7 Renumbering Reconciliation (D-AE-016 closure) (2026-06-13)`; AE row `AE-V72REM-PH7R-01`; defect `D-AE-016` in `_audit/DEFECT_LEDGER.md`. Resolution is non-destructive (no header renames; redirect annotations at RECONCILIATION L11865/L11980/L10972 + `v7.2.0-Remediation_Prompts.md` Phase 7/Phase 8 headers). **When the canonical Phase 8 cluster pass runs, title its blocks with explicit cluster scope and cross-reference D-AE-016 to avoid a "Phase 8" namespace collision.** Phase 7 verification itself: PASS (re-verified 2026-06-13; `_audit/PHASE7_REM_VERIFY.md`).
- **v7.2.0-REM canonical Phase 8 cluster ratification COMPLETE (2026-06-13).** Supersedes the "has not run (all cluster rows `pending`)" clause in the D-AE-016 bullet above: the canonical Phase 8 cluster pass has now run in two prompts, both 2026-06-13. **Prompt 8.1** ratified 1V/2V/3V/3V+/6R (68 rows `pending → approved` + 2 preserved; `_audit/PHASE_V72REM_PHASE_8_VERIFY.md`; AE row `AE-V72REM-PH8-01`). **Prompt 8.2** ratified V7/V8.4/V9/10V (22 `pending → approved` + AE-37-01 `pending → acknowledged` = 23 rows; `_audit/PHASE_V72REM_PHASE_8_2_VERIFY.md`; AE row `AE-V72REM-PH8-02`). 91 cluster rows total. Per the D-AE-016 binding rule, both passes title their blocks with explicit cluster scope and cross-reference D-AE-016; the Prompt 8.2 program-level row is `AE-V72REM-PH8-02` (deliberately NOT "PH8.2") to avoid colliding with the pre-existing `AE-V72REM-PH8.2-01` (= the §2.3 Phase-14.x row = Phase 7 Sweep-Pass C). Closure notes + reconciliation blocks: `_integration/AUTHORED_EXTENSIONS_LEDGER.md` + `_integration/RECONCILIATION.md → v7.2.0-REM Program → Phase 8 — … Cluster Ratification (cluster pass) (2026-06-13)` (Prompt 8.1) and `… (cluster pass — Prompt 8.2) (2026-06-13)` (Prompt 8.2). Prompt 8.2 also propagated 17 P0 DEFECT_LEDGER canonical filing rows `open → remediated` (dates preserved from the authoritative transition tables) per D-CONS-001 P1; the non-P0 long-tail remains the standing ≥390-row D-CONS-001 v7.1.1 ledger-hygiene backlog. **Surfaced this pass:** the `D-CONS-001` / `D-CONS-002` dual-ID collision (ledger-hygiene defects at DEFECT_LEDGER L233/L234 — D-CONS-001 P1 / D-CONS-002 P2 — vs Phase-CONS/V7 pricing P0s at L3153/L3154; disambiguate by severity + line anchor); and the AE-V72REM-PH8-01 registry-row backfill (the Prompt 8.1 closure note had claimed registry registration that was never landed). **Owed before/around the v7.1.1 stamp:** the **AE-V9-004 outside-counsel GDPR Art. 12(3) statutory-interpretation counter-signature is a BLOCKING pre-v7.1.1-stamp gate**; the AE-37-01 outside WCAG-audit-firm counter-signature; the non-P0 D-CONS-001 canonical-row propagation backlog. **Program now advances to canonical Phase 9** (Phase V11 cluster, with AE-V11-04 stub → v7.1.2 per D-AE-015; then the now-unblockable AE-14.18.1-01/-02; then Phase V12 + Phase V13). Pre-edit backups: `_versions/{AUTHORED_EXTENSIONS_LEDGER,RECONCILIATION,DEFECT_LEDGER}.pre-v72REM-Phase8.2-2026-06-13.md`.
