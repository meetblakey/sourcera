# CLAUDE.md — Sourcera Project Navigation Guide

**Purpose:** Orient any Claude session working in this folder. Load this before doing anything else. It defines what each file is, which files are authoritative for which questions, what to avoid, and how to author changes that survive review.

**Last updated:** 2026-04-28
**Corpus state:** Master Spec v7.1.0 stamped. v7.1.0 Surface-Abstraction & Dual-Maya program complete. Baseline v7.0.0 snapshot at `_versions/Sourcera_Master_Spec.v7.0.0-pre-v7.1-2026-04-26.md`. Next program is TBD.

---

## 1. What Sourcera Is

Sourcera is the operating system for enterprise software procurement. Two firewalled consoles (Buyer and Seller) plus a Vendor Discovery Marketplace. Buyers run a structured evaluation pipeline ("The Sourcera Method"). Sellers maintain a Knowledge Base that feeds Claude Managed Agents to respond to buyer evaluations. Pricing is outcome-based AI consumption on top of plan tiers.

This folder is the full strategic, product, engineering, and go-to-market corpus. Treat every artifact as production-grade.

---

## 2. Source-of-Truth Hierarchy

When sources conflict, resolve in this order (highest first). Always surface the conflict explicitly before resolving — never silently pick one.

1. **`Sourcera_Master_Spec.md`** — authoritative build spec. Engineering, design, QA, analytics, security, finance, ops all implement against this.
2. **`Sourcera_Buyer_Pricing_Strategy.md`** and **`Sourcera_Seller_Pricing_Strategy.md`** — authoritative for pricing, billing, AIOperation metering, entitlements, rate cards.
3. **`KB_Engineering_Spec.md`** — authoritative for Seller Knowledge Base, MCP, Managed Agents, retrieval, indexing, skill registry, tool use.
4. **`Sourcera_Master_Summary.md`** — authoritative for positioning, GTM concepts, PLG loops, network effects that are not yet integrated into the Master Spec. Scheduled for retirement once v7.0.0 integration is complete.
5. **`UX_Design_of_Sourcera.md`** — authoritative for UX tokens, interaction patterns, and design-language detail not yet pulled into §3 of the Master Spec.
6. **`GTM_Prompts.md`** and narrative GTM artifacts (see §4 below) — authoritative for positioning and narrative only. Never authoritative for engineering behavior.
7. **`Build_Execution_Strategy.md`** and **`Linear_Execution_Blueprint.md`** — authoritative for execution sequencing and Linear project structure. Not authoritative for product behavior.

> The project instructions reference a file named `What_is_Sourcera.md` in the source-of-truth list. That file does not currently exist in this folder. If a session needs narrative framing, use `Sourcera_Master_Summary.md` §1–§2 or `GTM_POSITIONING.md` instead. Flag the missing file if work requires it.

---

## 3. File Catalog — Core Specification Layer

All paths relative to the Sourcera folder root.

| File | Size | Role | When to read |
|---|---|---|---|
| `Sourcera_Master_Spec.md` | ~4.4 MB, v7.1.0 (2026-04-28) | The build spec. §1 architecture, §2 method (incl. §2.8 Single-Operator Mode), §3 UX (incl. §3.13 Principle 9, §3.14 Pipeline surface compression), §4 data model, §5 RBAC, §6 auth, §7–§51 feature sections (incl. §13.11 Defense View, §13.12 Buyer Maya intake, §22.20 Seller Maya Polish, §44.6 Solo-Tier Surface Treatment), appendices A–M (Appendix M = surface/engine mapping registry + §M.4 / §M.5 CI gate catalogs). | Any engineering, data-model, RBAC, billing, AIOperation, pricing-enforcement, API, webhook, feature-access, surface/engine, CI-gate, or consistency question. |
| `Sourcera_Master_Summary.md` | (retired in v7.0.0) | Retired source document. Snapshot at `_versions/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md`. Not authoritative for any topic. | Do not consult; superseded by Master Spec. |
| `Sourcera_Buyer_Pricing_Strategy.md` | 19 KB, v3 (2026-04-26) | Buyer plans (Free / Solo / $299 / $799 / $1,999 / custom), outcome-based AI consumption, rate cards, scenarios. Numerical authority is in Master Spec §34. | Any buyer billing, metering, or entitlement narrative — but cite Master Spec §34 for numerical contracts. |
| `Sourcera_Seller_Pricing_Strategy.md` | 43 KB, v3 (2026-04-26) | Seller plans (Free / Solo / $149 / $499 / $1,499 / custom), forced-signup mechanics, Hero Moment, KB value capture, seller network effects, Marketplace Discovery pricing. Numerical authority is in Master Spec §34. | Any seller billing, metering, entitlement, KB-value-capture, or marketplace-pricing narrative — but cite Master Spec §34 for numerical contracts. |
| `KB_Engineering_Spec.md` | 91 KB | Seller KB engineering spec: Managed Agents API (`managed-agents-2026-04-01`), Agent SDK, tool use, skills, retrieval, indexing, all grounded in Anthropic docs. | Anything touching the Seller KB, MCP, Managed Agents, retrieval pipeline, or indexing. |
| `UX_Design_of_Sourcera.md` | 335 KB, v2.0.0 (2026-04-11) | Production-ready UX/UI spec. Tokens, components, interaction patterns, motion, a11y. | UX tokens, state catalogs, component behavior, accessibility. When Master Spec §3 is silent or less detailed, this is authoritative. |

---

## 4. File Catalog — GTM Layer

GTM files are narrative and strategic. Never authoritative for engineering behavior.

| File | Size | Focus |
|---|---|---|
| `GTM_Project_Instructions.md` | 6 KB | Operating instructions for GTM sessions. Pin to Cowork project settings for GTM mode. |
| `GTM_Prompts.md` | 45 KB | GTM prompt library — positioning, category, messaging, ICP, personas. |
| `GTM_POSITIONING.md` | 102 KB | Category creation, positioning, competitive framing. |
| `GTM_PLG_ARCHITECTURE.md` | 111 KB | PLG architecture, buyer and seller growth loops, funnel design. |
| `GTM_NETWORK_EFFECTS.md` | 92 KB | Two-sided marketplace dynamics, seller-side network effects, data moat. |
| `GTM_GROWTH_TACTICS.md` | 61 KB | Growth tactics — referrals, virality, partnerships. |
| `GTM_CONTENT_ENGINE.md` | 86 KB | Content strategy, SEO, programmatic SEO, thought leadership. |
| `GTM_SALES_PLAYBOOK.md` | 152 KB | Sales motion, ICP, cold outreach, demo script, objection handling. |
| `GTM_90DAY_SPRINT.md` | 81 KB | Solo-operator 90-day GTM execution plan. |
| `GTM_PLAYBOOK_PROMPTS.md` | 50 KB | Reusable GTM playbook prompts. |

---

## 5. File Catalog — Execution & Planning

| File | Role |
|---|---|
| `Build_Execution_Strategy.md` | The three-layer execution model (Linear orchestration · repo context · Claude Code execution). How milestones, implementation packs, and AGENTS.md files are structured. |
| `Linear_Execution_Blueprint.md` | v2.0.0 hardened post-audit. Linear project, team, cycle, issue, label structure. Milestone graph. |
| `Integration_Prompts.md` | v1.2 Opus-optimized. The 13-phase prompt program that integrates Summary and KB spec into the Master Spec to produce v7.0.0. When the user references "Phase N" or "Prompt V," they mean this file. |
| `Blake_Task_List_Document_Hardening.md` | Blake's running task list for document hardening. Items include finishing the integration, executing the audit, and producing the final v7.0.0 Master Spec. |
| `SWE_Project_Instructions.md` | The canonical engineering/staff-engineer operating instructions (same content as the project settings). |

---

## 6. File Catalog — `_integration/` (Authoritative Integration Artifacts)

These are authoritative for the v7.0.0 integration program. Do not delete or rewrite. Append-only in spirit — update existing entries when status changes.

| File | Role |
|---|---|
| `_integration/RECONCILIATION.md` | 1.3 MB. The master reconciliation log. Every integration decision, conflict, and resolution lives here. If the user asks how a decision was made, this is the first place to look. |
| `_integration/DELTA_INVENTORY.md` | 105 KB. Exhaustive delta inventory from v6.0.0 → v7.0.0 walked out of the Summary and KB spec. The scoping document for the entire integration. |
| `_integration/Decisions.md` | 62 KB. Pending-decisions ledger. Advisory recommendations on open calls surfaced during Phases 0–4, Pricing Rewrite, and Phase 22 Rewrite. |
| `_integration/PHASE1_VERIFY.md` … `PHASE8_VERIFY.md` | Per-phase verification logs (Opus adversarial review pattern). Each phase has one canonical log; prior drafts are backed up in `_versions/`. |

---

## 7. `_versions/` — Historical Snapshots (Read-Only by Default)

53 dated snapshots of the Master Spec and verification logs. Naming convention:

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

## 8. `brandguidelines/`

| File | Role |
|---|---|
| `brandguidelines/README.md` | 18 bytes — placeholder. |
| `brandguidelines/ramp-design-system.html` | 107 KB standalone HTML reference of Ramp's design system. Used as an external stylistic reference, not a spec. Do not copy Ramp tokens into Sourcera — Sourcera has its own token system in UX spec §3 and Master Spec §3. |

---

## 9. Files to NOT Use

| File | Why |
|---|---|
| `DO_NOT_USE.md` | **Not Sourcera.** This is a scratch PRD for a freight-forwarder MVP (NSW, Australia). Ignore entirely unless the user explicitly references it for a reason. |

---

## 10. Binaries

| File | Role |
|---|---|
| `Sourcera_Pitch_Deck.pptx` | Investor pitch deck. Open via the `pptx` skill if you need to read or edit it. |
| `Sourcera_Investor_Talk_Track.docx` | Investor talk track. Open via the `docx` skill if you need to read or edit it. |

---

## 11. Task Routing — Which File for Which Question

| User asks about… | Read in this order |
|---|---|
| Data model, entities, fields, scope isolation | Master Spec §4, Appendix K (glossary), Appendix J (enums). |
| RBAC, roles, guest scoping, feature access | Master Spec §5 (especially §5.11 Feature Access Matrix). |
| Auth, SSO, MFA, session, domain governance, DSAR | Master Spec §6. |
| Pricing tiers, consumption, AI metering, rate cards | Buyer Pricing (buyer-side), Seller Pricing (seller-side), Master Spec §34 (plan definitions) and §44 (consumption model). |
| Seller KB, MCP, Managed Agents, retrieval, skills | KB Engineering Spec (primary), Master Spec §22 (integrated portions). |
| UX tokens, states, interaction patterns | Master Spec §3 first; UX Design file for deeper component/interaction detail. |
| APIs, webhooks, error codes, rate limits, idempotency | Master Spec §31 (webhooks), §32 (APIs), Appendix C (notification events), Appendix I (error codes). |
| Marketplace discovery, vendor directory, seller signals | Master Spec §27, Seller Pricing §Marketplace Discovery Pricing. |
| PLG, growth loops, network effects, positioning | Master Summary §6; GTM_PLG_ARCHITECTURE.md and GTM_NETWORK_EFFECTS.md for narrative detail. |
| Execution sequencing, Linear structure, cycle planning | Build_Execution_Strategy.md, Linear_Execution_Blueprint.md. |
| An integration-program decision or conflict | `_integration/RECONCILIATION.md` (first), `_integration/Decisions.md`, phase verify logs. |
| "Phase N" or "Prompt V" references | Integration_Prompts.md. |

When the question spans multiple files, read all relevant sources in full before responding. Do not grep the spec for a heading and answer from that alone — read the section end-to-end.

---

## 12. Authoring Conventions (Non-Negotiable)

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

## 13. Edge-Case Discipline

Every review or authoring pass must explicitly consider: first-time vs returning users · empty / loading / error / retry / partial states · validation · auth / permission failures · concurrency and sync conflicts · idempotency and retries · notification and webhook delivery failures · third-party outages (WorkOS · Stripe · Convex · Anthropic · Firecrawl · PostHog · Loops.so · Perplexity · Zendesk) · mobile vs desktop divergence · admin vs end-user · guest role scoping · buyer/seller console firewall · marketplace-domain leakage · data residency (US / EU / custom) · TZ / locale / currency · downgrade paths and data preservation · DSAR and right-to-erasure compatibility. If a feature is silent on any applicable dimension, surface the gap.

---

## 14. Operational Rules for Claude

1. **Read before answering.** For any non-trivial question, read the relevant source file(s) in full. Opus's context budget is sufficient for the entire corpus — use it. Never claim to have reviewed a document you only sampled.
2. **Back up before destructive edits.** Copy `Sourcera_Master_Spec.md` to `/_versions/Sourcera_Master_Spec_pre-{change-id}-{YYYY-MM-DD}.md` before any structural change.
3. **Surface conflicts explicitly.** When two sources disagree, state the conflict, cite both, and resolve per the hierarchy in §2. Never silently pick a side.
4. **Flag authored extensions.** If a source is underspecified and you author the missing detail, mark the addition as `Authored Extension — requires human sign-off`.
5. **Do not hallucinate corpus content.** If the corpus does not support a claim, say so.
6. **Do not produce partial analysis.** Finish the work, then deliver. No rolling commentary while reading.
7. **Do not narrate process.** The work is the work. Don't list the documents you read — let the answer reflect it.
8. **Maintain terminology consistency.** Normalize naming when the user's input is inconsistent (e.g., "AI operation" → `AIOperation`; "MRR" vs "subscription revenue" — use the term established in the spec).
9. **Respect the integration program.** v7.0.0 is not complete. When the Summary and the Master Spec disagree on an integrated concept, the Master Spec wins. When they disagree on an unintegrated concept, the Summary wins — and you should check `_integration/RECONCILIATION.md` for context.
10. **Never treat `DO_NOT_USE.md` as Sourcera content.**

---

## 15. Mode Selection

Two session modes are defined in the project instructions:

- **SWE mode** (default in Cowork) — engineering/spec authoring. Governed by `SWE_Project_Instructions.md`. Use when the work is product/engineering/pricing/architecture.
- **GTM mode** — positioning, growth, content, sales. Governed by `GTM_Project_Instructions.md`. Context-loading protocol: Summary → Buyer Pricing → Seller Pricing, then any referenced GTM deliverable.

If the request is ambiguous (e.g., "pricing"), default to SWE mode, because pricing has engineering enforcement consequences (metering, entitlement, plan gating). Switch to GTM framing only when the user explicitly asks for positioning, copy, messaging, or sales enablement.

---

## 16. Quick File-Size Reference

| File | Approx size | Load cost |
|---|---|---|
| `Sourcera_Master_Spec.md` | 4.1 MB / ~13,000 lines | Large — read specific sections unless a full pass is required. |
| `Sourcera_Master_Summary.md` | 175 KB | Readable in one pass. |
| `UX_Design_of_Sourcera.md` | 335 KB | Readable in one pass. |
| `_integration/RECONCILIATION.md` | 1.3 MB | Large — grep for the section or phase in question first, then read that block end-to-end. |
| Individual GTM files | 45–152 KB | Readable in one pass. |
| Individual phase verify logs | 37–109 KB | Readable in one pass. |

---

## 17. Known Drift / Open Issues

- **v7.1.0 stamp state (as of 2026-04-28).** Master Spec is at v7.1.0. The Surface-Abstraction & Dual-Maya program (Phase 14.0 → Phase 14.20) is closed. The v7.0.0 baseline is preserved at `_versions/Sourcera_Master_Spec.v7.0.0-pre-v7.1-2026-04-26.md`.
- **Master Summary supersession.** `Sourcera_Master_Summary.md` was retired in v7.0.0 and remains retired. Snapshot at `_versions/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md`. (The internal "Master Summary v1.2" reference in some pre-v7.1.0 reconciliation drafts referred to a planned §1 rewrite that was superseded by the v7.0.0 retirement; no v1.2 exists.) Not authoritative for any topic.
- **Solo plan tier and Defense View are authoritative in Master Spec.** Solo (`buyer_solo` / `seller_solo`) is in §34.1.1 / §34.1.2 / §34.1.3 / §34.2.1 / §34.2.2 / §34.2.5 / §34.10.3 / §34.12.6, Appendix J Plan Tiers, and Appendix M. Defense View is in §13.11 with state machine in Appendix L.7 and 5 error codes in Appendix I v7.1.0 sub-section.
- **Appendix M is the canonical surface/engine contract.** §M.1 mapping registry, §M.2 process gates, §M.3 Authored Extension Note, §M.4 `appendix_m_coverage_on_diff` CI gate, §M.5 37-gate catalog. Override path is the `@ci-gate-override:` PR-description annotation per §M.4.4.
- **§M.4 CI gate is active; §M.5 runtime wiring is partial.** 4 gates (§M.4 + 3 immediate runtime gates) are runtime-active at v7.1.0. The remaining 33 §M.5 gates are spec-binding contracts; runtime wiring lands in M02.3 / M11.3 / M21.3 / M24.3 implementation packs (per `Build_Execution_Strategy.md` §11 and `Linear_Execution_Blueprint.md` §5). v7.1.1 stamp gate.
- **v7.1.x descopes (Phase 14.0.1).** GTM rewrites (`GTM_POSITIONING.md`, `GTM_PLG_ARCHITECTURE.md`, `GTM_SALES_PLAYBOOK.md`, `GTM_90DAY_SPRINT.md`) and Marketplace-as-RFP-Exchange (§27 narrative reframing + §48 loop updates) are formally descoped to v7.1.x. Appendix M.1 forward-reference row is labeled "(deferred to v7.1.x; Phase 14.0.1 scope amendment)".
- **v7.1.1 backlog open.** P1 defects (7) and P2 cosmetic backlog (6) from Phase 14.19 rolled into `_integration/RECONCILIATION.md` → v7.1.1 Backlog. Includes Phase 14.13a (audit-event / enum / error code rollup), 14.13b (Defense View enums), 14.13c (EvalStarter PostHog / webhook / audit), 14.13d (Phase 14.8 §4.4.4 / §22.6 / Appendix J / G rollup), 14.9.2 (inline plan-tier-list audit, 27 locations), 14.12.1 (§27.10 Verification Tier Solo-explicit accept), 14.18.1 runtime wiring.
- **AE ledger v7.1.0 ratification queue.** Open `pending` rows: AE-14.9-01, AE-14.10-07, AE-14.14-21, AE-14.18.1-01, AE-14.18.1-02, AE-14.0.1-01, AE-14.0.1-02. Per the ledger's release-gate policy, ratification before v7.1.1 stamps. Owner notification is queued in the v7.1.0 program section header of `_integration/AUTHORED_EXTENSIONS_LEDGER.md`.
- **Pricing strategy docs companion role.** `Sourcera_Buyer_Pricing_Strategy.md` v3 and `Sourcera_Seller_Pricing_Strategy.md` v3 are narrative-and-strategy companions; numerical authority sits in Master Spec §34. When a number conflicts, Master Spec wins.
- `What_is_Sourcera.md` is referenced in the source-of-truth hierarchy but is not present in this folder. Use `GTM_POSITIONING.md` for narrative framing. Flag if work requires the missing file.
- Several `pre-*` snapshots in `_versions/` have near-identical sizes — they are discrete revert points, not duplicates. Do not consolidate.
