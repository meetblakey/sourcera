# Sourcera Execution Strategy

**Version:** 1.1.0  
**Date:** 2026-04-28 (v1.1 — Phase 14.16 net-new milestones added; v1.0 baseline 2026-04-12)  
**Source binding:** Current build authority is `Sourcera_Master_Spec.md` v7.1.0a, `UX_Design_of_Sourcera.md` v2.0.0, `Linear_Execution_Blueprint.md` v2.1.0, `Sourcera_Buyer_Pricing_Strategy.md` v3, and `Sourcera_Seller_Pricing_Strategy.md` v3. Historical provenance is `_integration/RECONCILIATION.md` Phase 14.0 → 14.10. The retired KB Engineering Spec is not current authority; KB behavior resolves through Master Spec §22.
**Single-ship discipline.** This document operates under single-ship discipline. There is one ship (the v1 platform). "Net-new" milestones added in §11 are additions to v1 scope — never v1/v2 phasing. All milestones, including the five Phase 14.16 net-new entries, ship as part of the v1 platform release.  

---

## 1. Recommended Execution Model

**Model: Linear-Orchestrated, Repository-Contextualized, Milestone-Packed Execution**

Keep Linear as the orchestration and progress-tracking layer. Add a repository-local context architecture — implementation packs, hierarchical AGENTS.md files, and domain spec extracts — that gives Claude Code the exact context it needs for every task without dragging 955KB of specification into each session.

The execution unit is the **milestone**, not the individual issue. Claude Code works through a milestone's issues sequentially (or in dependency-safe parallel), guided by a single implementation pack that contains all the context for that milestone's scope. Linear tracks status, dependencies, and cross-team coordination. The repo holds the truth about *how to build*.

### The Three Layers

| Layer | Tool | Purpose | Owned By |
|-------|------|---------|----------|
| **Orchestration** | Linear | Issue tracking, dependency management, cycle planning, cross-team coordination, velocity tracking | Human (project lead) |
| **Context** | Repository (`/specs/`, `/AGENTS.md`, implementation packs) | Architectural constraints, domain knowledge, task-local context, implementation patterns | Human (architect) + maintained as code |
| **Execution** | Claude Code | Code generation, testing, file creation, schema implementation | Claude Code (with human review) |

---

## 2. Why This Is the Best Method

### Why Not Pure Linear

The Linear blueprint is exceptionally well-structured — 462 issues with file paths, acceptance criteria, and dependency chains. But Linear issue descriptions have a fundamental context ceiling. Issue P08-002 ("Implement collaborative scoring with presence indicators") requires understanding of:

- The append-only grade model and `supersedes` reference chain
- Divergence thresholds (≥0.3 triggers Insight Card, ≥0.6 auto-escalates)
- Phase gating (scores mutable in 10–11, locked at 12 entry)
- The "Score Independently" toggle behavior
- Convex Presence integration patterns
- The design system's ScoringCard, InsightCard, and PresenceStack components
- The PM value configuration (0.1–0.9, default 0.6)

Cramming all of this into a Linear description either produces a 3,000-word issue (unusable for humans) or an abbreviated version that forces Claude Code to guess (implementation drift). Linear is the wrong place to store implementation context. It's the right place to track what needs doing and what blocks what.

### Why Not Pure Repository Specs

A repo-only approach (e.g., everything in AGENTS.md + spec files, no Linear) loses dependency tracking, velocity measurement, cross-team coordination, and the ability to replan mid-build. The build has 462 tasks across 4 teams with ~60 cross-project dependency edges. That's a project management problem, not a documentation problem.

### Why Not Issue-by-Issue Execution

Executing one Linear issue at a time with full spec context per issue creates:
- **Context thrash**: Claude Code re-reads the same architectural context for 14 consecutive schema issues in P04.
- **Coherence risk**: Issues within a milestone share implicit assumptions (naming conventions, error handling patterns, component composition). Executing them in isolation produces inconsistent code.
- **Overhead**: The human operator spends more time setting up context than the coding agent spends writing code.

### Why Milestone Packs Win

A milestone is the natural coherence boundary. M08.1 ("Scoring Grid & Grading") contains 8–12 issues that share the same data model, the same UX surface, the same phase-gating rules, and the same component patterns. One implementation pack covers them all. Claude Code loads the pack once and executes the milestone's issues in sequence, maintaining coherence across the group.

---

## 3. Context Architecture

### 3.1 Global Context (Always Available)

**File: `/AGENTS.md`** (~800 tokens)

Contains immutable architectural truths that apply to every task:

```
- Tech stack: Next.js 16 App Router, Convex, WorkOS, Claude API, Stripe, ShadCN/UI + Tailwind
- Console isolation: All queries scoped by org_id + console (buyer|seller|marketplace)
- Soft deletes everywhere: deleted_at timestamp, never hard delete
- Optimistic mutations: UI updates before server confirmation, rollback on failure
- Append-only grades: individual_grades[] never mutated, new entries appended with supersedes reference
- Audit logging: Every mutation logs action, entity, user, timestamp, old/new values via audit middleware
- Phase pipeline: 13 fixed phases, idempotent advancement, no skip/reorder
- RBAC enforcement: At Convex function level, not UI level. UI hides; API enforces.
- Real-time: Convex subscriptions for all collaborative surfaces
- AI attribution: All Agent outputs labeled [AI-Generated] with confidence score
- Naming: camelCase for TypeScript, snake_case for database fields, PascalCase for components
- Error handling: Toast notification on failure, previous state restored, never silent
- Keyboard-first: All primary workflows completable via keyboard
```

**File: `/convex/AGENTS.md`** (~400 tokens)

Backend-specific constraints:

```
- Schema definitions in convex/schema/*.ts with exported TypeScript types
- Mutations enforce RBAC via auth middleware before any data access
- All mutations call auditLog() with action, entity_type, entity_id, changes
- Queries scoped: org-level uses ctx.org_id; console-level uses ctx.org_id + ctx.console
- Pagination: cursor-based, default 50, max 250
- File uploads: Convex storage, <50MB, virus scan via VirusTotal
- Scheduled functions for: SLA timers, staleness detection, crawl scheduling, Pulse calculation
- Rate limiting: Convex middleware, per-org soft 5K/hr, hard 10K/hr
```

**File: `/app/AGENTS.md`** (~400 tokens)

Frontend-specific constraints:

```
- ShadCN/UI + Tailwind for all components; no custom CSS unless design system gap
- Server Components default; Client Components only for real-time, forms, interactivity
- Design tokens in CSS custom properties (see /styles/tokens.css)
- Optimistic mutations via Convex useMutation with rollback
- Phase-lock rendering: check workspace.pipeline_stage_id, disable controls per phase rules
- Plan gating: check org.plan_tier, show upgrade prompt for gated features
- Empty states: Every list/table has a designed empty state (illustration + CTA)
- Error states: ErrorBoundary wraps all route segments; toast for mutation failures
- Loading: Skeleton components matching final layout shape
- Responsive: Desktop-first, tablet breakpoint 768px, mobile 640px
- Keyboard shortcuts: Register via useHotkeys; document in ShortcutOverlay
- Command Palette: Cmd+K; register actions via CommandRegistry
```

### 3.2 Domain Context (Per Subsystem Directory)

Each major feature directory gets a `CONTEXT.md` file containing the subset of spec relevant to that domain. These are extracted from the master spec once and maintained as the build progresses.

| Directory | CONTEXT.md Scope | ~Size |
|-----------|-----------------|-------|
| `/convex/schema/` | All entity definitions, field types, indexes, FK relationships, validation rules | 3K tokens |
| `/app/buyer/workspaces/` | Workspace lifecycle, phase pipeline, phase gates, SLA rules | 2K tokens |
| `/app/buyer/requirements/` | Requirement CRUD, amendment protocol, phase-lock rules, triage | 2K tokens |
| `/app/buyer/scoring/` | Grade model, scoring math, collaborative scoring, immutability, scenarios | 3K tokens |
| `/app/buyer/analytics/` | Pulse formula, health score, workspace analytics, intelligence dashboard | 1.5K tokens |
| `/app/seller/bid/` | Bid workspace lifecycle, response editor, advisory locks, seller Q&A | 2K tokens |
| `/app/seller/kb/` | KB health model, staleness decay, document library, Firecrawl | 2K tokens |
| `/app/marketplace/` | Listings, EOI, NDA, match scoring, verification tiers | 1.5K tokens |
| `/lib/agent/` | Agent architecture, model routing, token budgets, confidence thresholds, guardrails, all 21 capabilities | 3K tokens |
| `/lib/auth/` | WorkOS integration, RBAC model, session management, MFA, guest users, API tokens | 2K tokens |
| `/lib/billing/` | Stripe integration, plan tiers, entitlement registry, metering, overage | 1.5K tokens |
| `/lib/notifications/` | Delivery system, preference schema, channels, batching, all 21+ email templates | 2K tokens |

### 3.3 Task-Local Context (Implementation Packs)

**Location: `/specs/packs/`**

One implementation pack per milestone. Each pack is a self-contained markdown file that gives Claude Code everything it needs to execute that milestone's issues without reading the master spec.

**Pack structure:**

```markdown
# Implementation Pack: M08.1 — Scoring Grid & Grading

## Milestone Objective
[One paragraph: what this milestone delivers and why it matters]

## Prerequisites
[List of completed milestones and specific artifacts this pack depends on]

## Data Model (Relevant Subset)
[Exact schema for Score, Requirement, Vendor, Workspace fields used in scoring]

## Business Rules
[All scoring rules: grade values, weight math, auto-scoring, EX handling, phase gating]

## UX Specification
[Component layout, interaction patterns, keyboard shortcuts, states — extracted from UX doc]

## Component Dependencies
[Which design system components to use: DataTable, ScoringCard, SidePeek, etc.]

## API Contracts
[Mutations and queries this milestone creates or consumes]

## Issues (Ordered)
[Sequential list of Linear issues in this milestone with acceptance criteria]

## Testing Requirements
[Performance thresholds, edge cases, accessibility checks]

## What This Pack Does NOT Cover
[Explicit scope boundary — prevents scope creep]
```

**Pack sizing target:** 3,000–6,000 tokens. Large enough to be complete. Small enough to leave room for code in Claude Code's context window.

### 3.4 Context Loading Protocol

When Claude Code starts a task, it reads (in order):

1. `/AGENTS.md` — global constraints (~800 tokens)
2. The relevant subsystem `AGENTS.md` — domain constraints (~400 tokens)
3. The implementation pack for the current milestone (~4,000 tokens)
4. The specific issue description from Linear (~500 tokens)

**Total context per task: ~5,700 tokens.** This leaves >90% of Claude Code's context window for code generation, file reading, and iterative development.

### 3.5 What Lives Where

| Content Type | Location | Rationale |
|-------------|----------|-----------|
| Immutable architectural constraints | `/AGENTS.md` hierarchy | Read automatically by Claude Code; never stale |
| Domain-specific spec extracts | `/specs/domains/*.md` or per-directory `CONTEXT.md` | Close to the code; easily updated |
| Milestone implementation context | `/specs/packs/M*.md` | Self-contained; disposable after milestone complete |
| Issue descriptions + acceptance criteria | Linear | Dependency tracking, status, cross-team visibility |
| Progress tracking | Linear | Velocity, cycle planning, blocker management |
| Code patterns and conventions | Living code + AGENTS.md | Code is the source of truth for patterns |

---

## 4. Build Sequencing Model

### 4.1 Foundation Phase (Weeks 1–6)

Everything else depends on this. Serial where necessary, parallel where safe.

```
Week 1-2:  P01 (Repo/Infra/DevOps) ║ P03-M03.1 (Design Tokens + Core Components)
Week 2-3:  P02-M02.1 (Auth/Org Shell) ║ P03-M03.2 (Advanced Components)
Week 3-4:  P02-M02.2 (RBAC/Phases) ║ P03-M03.3 (App Shell/Nav)
Week 4-5:  P04-M04.1 (Core Schemas) → P04-M04.2 (CRUD Mutations)
Week 5-6:  P04-M04.3 (API/Webhooks/Upload) ║ P05 (Real-Time/Search/RAG)
```

**Gate: Foundation Complete** = M02.2 + M03.3 + M04.1 all merged. No feature work starts before this.

### 4.2 Feature Build Phase (Weeks 6–16)

Three parallel streams once foundation is complete:

**Stream A: Buyer Pipeline** (primary critical path)
```
P06 Requirements → P07 Vendor Mgmt → P08 Scoring → P09 Scenarios/TCO → P11 Analytics/Pulse → P12 Templates/Policy
```

**Stream B: Seller Pipeline** (can start 1 week after foundation, parallel with Stream A)
```
P16 Seller Shell → P13 Bid Workspaces → P14 KB/DocLib → P15 Seller Profile
```

**Stream C: Intelligence** (progressive, wires into Streams A and B)
```
P19-M19.1 Agent Infrastructure → P19-M19.2 Buyer Capabilities → P20 Seller Capabilities
```

**Cross-stream dependencies:**
- P07 (Vendor Mgmt) blocks P13 (Bid Workspaces) — vendor invitations must exist before bids
- P05 (RAG) blocks P19 (Agent Infrastructure) — agent suggestions require vector search
- P14 (KB) blocks P20 (Seller Agent Capabilities) — KB must exist before KB-based suggestions
- P06 (Requirements) blocks P08 (Scoring) — scoring needs requirements to score
- P08 (Scoring) blocks P09 (Scenarios) — scenarios operate on scoring data

**Stream D: Marketplace** (starts after P07 + P15 complete)
```
P17 Marketplace Core ║ P18 Marketplace Seller Integration
```

### 4.3 Hardening Phase (Weeks 14–20, overlapping with late feature work)

```
P21 Billing/Plans — starts mid-feature phase (critical for plan gating)
P22 Notifications — starts mid-feature phase (wires into completed features)
P10 Comments/Q&A — can run parallel with P08/P09
P23 Security Hardening — starts after feature-complete
P24 QA/Performance/Launch — last, covers full system
```

### 4.4 Parallelism Rules

1. **Schema before mutation before frontend** — always serial within an entity.
2. **Different entities can parallelize** — Score schema and Comment schema have no dependency.
3. **Different consoles can parallelize** — Buyer Requirements (P06) and Seller Shell (P16) share no code.
4. **Agent capabilities parallelize by model tier** — Haiku capabilities (4, 7, 17, 18) share infrastructure but not logic.
5. **Never parallelize within a milestone** — Issues in M08.1 share state and must execute in order.

---

## 5. Task Unit Design

### 5.1 Ideal Task Size

**Target: 100–400 lines of production code per task.** This is the sweet spot where:
- Claude Code can hold the full context + generated code in its window
- The output is reviewable in <30 minutes by a human
- The scope is narrow enough to have unambiguous acceptance criteria
- The scope is wide enough to be coherent (not a single function in isolation)

**Too small:** "Add the `deleted_at` field to the Score schema" — trivial, overhead exceeds value.  
**Too large:** "Implement the full scoring system" — multiple concerns, unreviewable, high rework risk.  
**Right size:** "Implement Score schema with all fields, indexes, FK relationships, validation rules, and exported TypeScript types" — one entity, complete, verifiable.

### 5.2 Task Categories and Sizing

| Category | Example | Typical Size | Notes |
|----------|---------|-------------|-------|
| **Schema** | Define Requirement entity in Convex | 50–150 lines | One entity per task |
| **Mutation** | CRUD mutations for Requirement with RBAC + audit | 150–400 lines | One entity's mutations per task |
| **Page/View** | Requirements Matrix table view | 200–400 lines | One page per task, may use multiple components |
| **Component** | ScoringCard SidePeek with grade entry | 100–300 lines | One complex component per task |
| **Integration** | WorkOS sign-up/sign-in/sign-out flow | 200–400 lines | One integration per task |
| **Agent Capability** | Pre-Scoring suggestion with confidence | 150–300 lines | One AI capability per task |
| **Infrastructure** | Webhook delivery with retry + DLQ | 200–400 lines | One cross-cutting concern per task |

### 5.3 Task Template for Claude Code

Every task presented to Claude Code follows this format:

```markdown
## Task: [Issue ID] — [Title]

**Milestone:** [M-code] — [Milestone name]
**Pack:** /specs/packs/[pack-file].md

### What to Build
[2-3 sentences: the specific deliverable]

### Files to Create/Modify
- [exact file paths]

### Acceptance Criteria
1. [Specific, verifiable criterion]
2. [Specific, verifiable criterion]
3. [Performance threshold if applicable]

### Constraints
- [Any non-obvious rules from the spec]

### Dependencies (Already Complete)
- [List of artifacts this task consumes, with file paths]

### Does NOT Include
- [Explicit exclusions to prevent scope creep]
```

---

## 6. Required Repository Control Files

### 6.1 Files to Create Before Coding Begins

| File | Purpose | Created When |
|------|---------|-------------|
| `/AGENTS.md` | Global architectural constraints for all agents | Day 1, before any code |
| `/convex/AGENTS.md` | Backend constraints and patterns | Day 1 |
| `/app/AGENTS.md` | Frontend constraints and patterns | Day 1 |
| `/specs/architecture.md` | System architecture overview (~2 pages) | Day 1 |
| `/specs/data-model.md` | Complete entity relationship reference | Day 1, updated as schemas land |
| `/specs/phase-pipeline.md` | 13-phase rules, gates, side effects | Day 1 |
| `/specs/rbac.md` | Complete role-permission matrix | Day 1 |
| `/specs/scoring-model.md` | Grade math, weight rules, immutability | Day 1 |
| `/specs/plan-tiers.md` | Feature-to-plan mapping, limits, overage rules | Day 1 |
| `/specs/packs/M01.1.md` | First implementation pack | Day 1 |

### 6.2 Implementation Pack Schedule

Packs are authored 1 week ahead of when they're needed. The human architect writes each pack by extracting the relevant subset from the four source documents (and, for v7.1.0 net-new milestones, the corresponding closed-phase entries in `_integration/RECONCILIATION.md`).

**Foundation packs (write all before Week 1):**
- M01.1, M01.2, M02.1, M02.2, **M02.3** (Single-Operator Mode — net-new, Phase 14.16), M03.1, M03.2, M03.3, M04.1, M04.2, M04.3, M05.1, M05.2

**Feature packs (write 1 week before execution):**
- M06.1, M06.2, **M06.3** (Per-Vertical Eval Starters — net-new, Phase 14.16), M07.1, M07.2, M08.1, M08.2, M09.1, M09.2, M10.1, M10.2, M11.1, M11.2, **M11.3** (Defense View — net-new, Phase 14.16), M12.1, M12.2
- M13.1, M13.2, M14.1, M14.2, M15.1, M16.1, M16.2
- M17.1, M17.2, M18.1
- M19.1, M19.2, M20.1

**Hardening packs (write 1 week before execution):**
- M21.1, M21.2, **M21.3** (Solo Tier Billing Surface — net-new, Phase 14.16), M22.1, M22.2, M23.1, M23.2, M24.1, M24.2, **M24.3** (Appendix M Maintenance Gate — net-new, Phase 14.16)

**Total: ~51 implementation packs** (46 baseline + 5 Phase 14.16 net-new).

**Implementation packs are not release-evidence lanes.** The feature-pack schedule above assigns product behavior. Appendix M `spec_binding_pending_pack_m02_3`, `_m11_3`, `_m21_3`, and `_m24_3` suffixes are stable legacy release tokens used only to route evidence at stamp time. They never transfer DSAR, WorkOS, Marketplace, analytics, billing, or other feature ownership into the similarly numbered Phase 14.16 feature pack. §11.5.1 defines the evidence mapping.

**Phase 14.16 net-new pack ordering rules:**

- **M02.3 (Single-Operator Mode)** packs immediately after M02.2. M02.3 is a foundation prerequisite for M11.3 (Defense View consumes Solo / Team mode-aware copy and PDF watermark), M21.3 (Solo billing surface compresses on `evaluation_owner_mode`), and the M03.x PipelineSurface component refactor. Pack must include the Master Spec §2.8 contract, the §4.3.1 `evaluation_owner_mode` enum binding, the §3.14 PipelineSurface component composition, and the §10.16 / §32 phase-advancement endpoint update for the `soft_gates_enabled` request flag.
- **M06.3 (Per-Vertical Eval Starters)** packs after M06.1 lands the Use Case / Requirement CRUD and Workspace Settings surfaces. Pack must include the Master Spec §13.12 intake page surface, §4.5.9 `EvalStarter` entity, Appendix J `EvalVertical` enum, the six default vertical seeds (each with Use Cases / Requirements / rubric / longlist), the `eval_starter_origin` field on Workspace, and the `workspace_created_from_eval_starter` audit-event registration.
- **M11.3 (Defense View)** packs after M11.2 (Selection Report) and after the M19.x Sonnet-tier capability infrastructure is in place. Pack must include the Master Spec §13.11 surface, the `DefenseView` entity, the `defense_view_generate` capability registry binding (Sonnet, Solo / Free watermarked, Starter+ full), the `defense_view_lifecycle_state` enum (4 values), the `regeneration_reason_code` enum (4 values), the three §13.11 API endpoints, the two §13.11 webhook events, the five §13.11 / Appendix I error codes, and the watermarked-PDF export pipeline.
- **M21.3 (Solo Tier Billing Surface)** packs after M21.1 / M21.2 (Stripe / plan enforcement / metering) land. Pack must include the §34.1.1 / §34.1.2 Solo plan tier registration, the §34.2.x rate-card / per-evaluation / per-bid pricing rows, the §44.6 surface-treatment contract (single Card UI, throttling toast, surface hide list, capability-registry fields, telemetry events, refund-window logic, cross-console envelope isolation), and the UX `UX_Design_of_Sourcera.md` §8.1.2 component spec.
- **M24.3 (Appendix M Maintenance Gate)** packs in the hardening window with M24.1 / M24.2. Pack is process-and-CI-only; it ships the PR template enforcement, the deploy-time validators (`appendix_m_engine_to_surface_completeness`, `appendix_m_no_inline_engine_concepts_in_ux_spec`, `appendix_m_no_orphan_engine_concept`), and wires the gate into the per-PR review checklist (see §8.1). Coordinated with the Phase 14.18 CI-gate authoring track; M24.3 is the launch-readiness gate that proves Appendix M is enforced on every commit at production cutover.

The five new packs are additions to v1 scope. None of the 46 baseline packs is removed, deferred, or renumbered.

### 6.3 AGENTS.md Maintenance Rules

1. AGENTS.md files are **append-mostly**. Constraints added, rarely removed.
2. When a new pattern emerges during review (e.g., "all modals must trap focus"), add it to the relevant AGENTS.md immediately.
3. When a pattern changes (e.g., switching from ShadCN Dialog to a custom modal), update AGENTS.md before the next task starts.
4. AGENTS.md files are reviewed weekly alongside cycle planning.

---

## 7. Recommended Execution Workflow

### 7.1 Per-Task Workflow (Claude Code)

**Before coding:**
1. Read `/AGENTS.md` (global constraints)
2. Read the subsystem AGENTS.md for the target directory
3. Read the implementation pack for the current milestone
4. Read any files listed in "Dependencies (Already Complete)" to understand existing code
5. Confirm understanding of acceptance criteria

**During coding:**
1. Create/modify only the files listed in the task scope
2. Follow patterns established by previously completed tasks in this milestone
3. Include RBAC enforcement in every mutation
4. Include audit logging in every mutation
5. Include phase-gate checks in every buyer-console UI component
6. Include plan-tier checks in every gated feature
7. Write inline comments for non-obvious business rules (reference spec section)
8. Handle all error states (not just the happy path)

**After coding:**
1. Run type checks (`tsc --noEmit`)
2. Run linter (`eslint`)
3. Run relevant tests
4. Self-verify against every acceptance criterion
5. List any deviations from the implementation pack with justification

**Before task completion:**
1. Confirm all acceptance criteria are met
2. Confirm no files outside scope were modified
3. Confirm RBAC + audit + phase-gate + plan-gate are present where required
4. Confirm error states and empty states are handled

### 7.2 Per-Milestone Workflow (Human Operator)

**Before milestone starts:**
1. Verify the implementation pack exists and is complete
2. Verify all prerequisite milestones are merged
3. Verify Linear issues for this milestone have acceptance criteria
4. Create a feature branch: `feat/M08.1-scoring-grid`

**During milestone:**
1. Feed issues to Claude Code in dependency order
2. Review each output within 24 hours
3. Merge each issue's code before starting dependent issues
4. Track issues in Linear (Todo → In Progress → In Review → Done)
5. If a review reveals a pattern deviation, update AGENTS.md before the next task

**After milestone complete:**
1. Run full test suite for the milestone's domain
2. Verify all milestone acceptance criteria in Linear
3. Merge feature branch to main
4. Update `/specs/data-model.md` if schemas changed
5. Archive the implementation pack (move to `/specs/packs/archive/`)
6. Update domain CONTEXT.md files if the milestone introduced new patterns

### 7.3 Weekly Cycle Ritual

**Monday (30 min):**
- Review Linear: Which milestones are in progress? Which issues are blocked?
- Verify implementation packs exist for this week's milestones
- Identify cross-team blockers and escalate

**Daily (15 min):**
- Review Claude Code output from previous day
- Merge approved code
- Feed next issues to Claude Code
- Report blockers

**Friday (30 min):**
- Assess milestone progress against plan
- Write next week's implementation packs if not yet done
- Update AGENTS.md with any new patterns discovered this week
- Flag carry-over issues in Linear

---

## 8. Quality Control System

### 8.1 Code Review Gates

Every Claude Code output is reviewed before merge. Review checklist:

- [ ] Acceptance criteria met (all)
- [ ] RBAC enforced at mutation level (not just UI)
- [ ] Audit logging present on all mutations
- [ ] Phase-gate checks present (buyer console features)
- [ ] Plan-tier checks present (gated features)
- [ ] Error states handled (toast on failure, state restored)
- [ ] Empty states rendered (designed illustration + CTA)
- [ ] Loading states rendered (skeleton matching final layout)
- [ ] Keyboard navigation works (Tab, Shift+Tab, Enter, Escape)
- [ ] ARIA labels and roles present
- [ ] No files modified outside declared scope
- [ ] No hardcoded values (use design tokens)
- [ ] No console.log or debugging artifacts
- [ ] TypeScript strict mode passes
- [ ] Notification trigger documented (if mutation)
- [ ] **Appendix M row added or updated** (if PR introduces or modifies any engine concept — entity, role, state, capability, plan-gated feature, webhook, API endpoint, enum value, error code). Engine-only concepts MUST be flagged "Internal-only, never surfaced" with rationale. Enforced by CI gate `appendix_m_engine_to_surface_completeness` per M24.3 (Phase 14.16 / Phase 14.18). Reviewer rejects PR if a new engine concept lands without a corresponding Appendix M row in the same commit.

### 8.2 Automated Quality Gates

| Gate | Tool | Threshold | Runs When |
|------|------|-----------|-----------|
| Type safety | `tsc --noEmit` | Zero errors | Every PR |
| Lint | ESLint | Zero errors, zero warnings | Every PR |
| Unit tests | Vitest | All pass | Every PR |
| Accessibility | axe-core | Zero critical/serious violations | Every component PR |
| Bundle size | Webpack analyzer | <500KB JS per route | Weekly |
| API latency | Datadog | p95 <100ms reads, <500ms writes | Continuous |
| Search latency | Datadog | <200ms | Continuous |
| Render performance | Lighthouse | >90 performance score | Weekly |
| Appendix M completeness | `appendix_m_engine_to_surface_completeness` (deploy-time validator, M24.3) | Zero engine concepts without an Appendix M row | Every PR + deploy |
| Appendix M no-inline | `appendix_m_no_inline_engine_concepts_in_ux_spec` (M24.3) | Zero `UX_Design_of_Sourcera.md` references to engine concepts that lack an Appendix M row | Every PR |
| Appendix M no-orphan | `appendix_m_no_orphan_engine_concept` (M24.3) | Every Appendix M row resolves to a live Master Spec section + UX surface (or "Internal-only" rationale) | Weekly |

### 8.3 Integration Testing Strategy

| Boundary | Test Type | Trigger |
|----------|----------|---------|
| Schema ↔ Mutation | Integration test: mutation creates/reads entity correctly | Every schema or mutation change |
| Mutation ↔ RBAC | Permission test: unauthorized role gets 403 | Every mutation change |
| Phase gate ↔ Mutation | State machine test: mutation blocked in wrong phase | Every phase-sensitive feature |
| Buyer ↔ Seller sync | Cross-console test: Phase 6 syncs requirements to bid workspace | P06, P07, P13 milestones |
| Agent ↔ Feature | Capability test: agent suggestion appears with attribution + confidence | Every agent capability |
| Billing ↔ Feature | Entitlement test: gated feature blocked on wrong plan | P21 milestone |

### 8.4 Regression Prevention

1. **Test suite runs on every PR.** No exceptions.
2. **Schema changes require migration verification.** Convex handles this, but schema changes are always reviewed for backward compatibility.
3. **AGENTS.md drift check.** Weekly: verify AGENTS.md files match actual codebase patterns. If diverged, update AGENTS.md (source of truth is the code, not the doc).
4. **Phase-gate regression test.** A dedicated test file validates all 6 critical phase gates (P02-025 through P02-030) end-to-end. Runs on every PR that touches phase logic.
5. **Scoring math regression test.** A dedicated test file validates grade calculation, weight math, EX handling, and immutability. Runs on every PR that touches scoring.

### 8.5 Design Consistency

1. All components built from the design system (P03). No ad-hoc styling.
2. Component Storybook maintained alongside code. Every new component gets a story.
3. Design tokens are the single source of truth for colors, spacing, typography, elevation.
4. Weekly visual review: compare implemented UI against UX spec screenshots for active milestones.

---

## 9. Final Recommendation

### The Operating Model

**Use Linear for what it's good at:** dependency tracking, cross-team coordination, cycle planning, velocity measurement, status visibility. The existing 462-issue blueprint is production-grade and should be used as-is.

**Use the repository for what Linear can't do:** providing Claude Code with the right 5,000 tokens of context per task. Build a hierarchical AGENTS.md system for global and domain constraints. Write implementation packs for every milestone that contain the complete context needed to execute that milestone's issues.

**Execute by milestone, not by issue.** A milestone is the natural coherence boundary. Claude Code loads one pack and executes 8–15 related issues in sequence, maintaining consistency across the group. This eliminates context thrash and produces internally consistent code.

**The human operator's job is threefold:**
1. **Author implementation packs** — extract the right 3,000–6,000 tokens from the source docs for each milestone. This is the highest-leverage activity in the entire build. A good pack produces good code; a bad pack produces rework.
2. **Review and merge** — every Claude Code output is reviewed within 24 hours against the acceptance criteria and the quality checklist.
3. **Maintain AGENTS.md** — as patterns emerge and evolve, update the constraint files so future tasks inherit correct guidance.

### Critical Success Factors

1. **Implementation packs must be written before execution starts.** The temptation to skip pack authoring and "just paste the relevant spec section" will produce context-diluted, inconsistent code.
2. **The foundation phase (P01–P05) must be complete before feature work begins.** Cutting corners here creates cascading rework.
3. **RBAC, audit logging, and phase gating are non-negotiable in every task.** These are not "hardening" concerns — they are core architectural properties that must exist from the first mutation.
4. **Review SLA is 24 hours.** Letting reviews pile up creates a dependency bottleneck that stalls downstream milestones.
5. **AGENTS.md files are living documents.** A stale AGENTS.md is worse than no AGENTS.md because it gives Claude Code false confidence in incorrect patterns.

### What to Build First

Before writing any application code:

1. Initialize the repository (P01-001 through P01-005)
2. Write `/AGENTS.md`, `/convex/AGENTS.md`, `/app/AGENTS.md`
3. Write the reference spec extracts (`/specs/architecture.md`, `/specs/data-model.md`, `/specs/phase-pipeline.md`, `/specs/rbac.md`, `/specs/scoring-model.md`, `/specs/plan-tiers.md`)
4. Write implementation packs for all Foundation milestones (M01.1 through M05.2)
5. Begin execution with M01.1

### Expected Timeline

| Phase | Weeks | Milestones | Issues |
|-------|-------|------------|--------|
| Foundation | 1–6 | M01.1–M05.2 | ~156 |
| Buyer Core | 6–12 | M06.1–M12.2 | ~122 |
| Seller Core + Marketplace | 8–14 | M13.1–M18.1 | ~80 |
| Intelligence | 5–14 | M19.1–M20.1 | ~46 |
| Hardening + Launch | 14–20 | M21.1–M24.2 | ~82 |

**Total: ~20 weeks to production-ready.** This assumes one human operator + Claude Code working full-time, with the human spending ~40% of time on pack authoring and review, ~60% on feeding tasks and resolving blockers.

### What This Strategy Optimizes For

- **Context precision** — Claude Code gets exactly what it needs, nothing more
- **Implementation coherence** — Milestone-scoped execution prevents inconsistency
- **Dependency safety** — Linear tracks the graph; packs encode the knowledge
- **Review efficiency** — Narrow scope tasks are faster to review
- **Regression resistance** — Automated gates catch drift before it compounds
- **Adaptability** — If priorities shift, swap milestone order in Linear; write new packs for the new sequence

### What This Strategy Accepts as Cost

- **Pack authoring is manual work.** ~46 packs × ~2 hours each = ~92 hours of spec extraction. This is unavoidable — the alternative is Claude Code guessing, which costs more in rework.
- **Foundation phase is 6 weeks before visible features.** Tempting to skip ahead; doing so will produce 3x the rework.
- **AGENTS.md maintenance is ongoing.** ~30 minutes per week. Neglecting this degrades output quality gradually.

---

*This strategy is derived from the complete Sourcera specification corpus (955KB across 4 documents, 16,484 lines). It is designed for execution with Claude Code as the primary implementation engine, with human oversight for context authoring, code review, and architectural governance.*

---

## 11. Phase 14.16 — Net-New v7.1.0 Milestones

This section is the authoritative scoping addendum for the five net-new milestones added in Phase 14.16. Each milestone is added to v1 scope under single-ship discipline. None of the existing baseline milestones is removed, deferred, renumbered, or rescoped. The Hero Moment, KB engineering, Marketplace destination, dual-console firewall, and all 17 PLG / network-effects growth mechanics remain in v1 scope unchanged.

### 11.1 M02.3 — Single-Operator Mode

- **Owning project:** P02 (Auth, Identity & RBAC).
- **Initiative:** I1 (Foundation & Infrastructure).
- **Source authority:** Master Spec §2.8 (Single-Operator Mode contract), §3.13 (Principle 9 — Surface Simplicity, Engine Complexity), §3.14 (PipelineSurface component composition), §4.3.1 (Workspace `evaluation_owner_mode` enum binding), §10.16 + §32 (Phase Advancement endpoint `soft_gates_enabled` request flag), Appendix M Solo Mode subgroup, Appendix J `evaluation_owner_mode` enum, `_integration/RECONCILIATION.md` Phase 14.4 entry.
- **Entry condition:** M02.2 complete (workspace lifecycle and 13-phase pipeline state machine operational).
- **Exit condition:** Workspace carries `evaluation_owner_mode ∈ {solo, team}` with default-derivation function honoring plan tier (Solo / Free → `solo`, Starter+ → `team`). Workspace Settings switch UI is live with the Team→Solo transition guard (blocks when stakeholders or guests are present, surfacing error code `evaluation_owner_mode_team_to_solo_blocked_stakeholders_present`). Phase Advancement endpoint accepts `soft_gates_enabled=true` only when workspace is in Solo Mode; any Team-Mode invocation rejects with error code `phase_advancement_soft_gates_not_permitted_in_team_mode`. Soft-gate advancement emits the `phase_advanced_with_unmet_gates` audit event with `trigger_reason ∈ {solo_skip, team_override}`. Mode-driven surface suppression contract is implemented at the surface layer: stakeholder-cohort UI, multi-stakeholder Q&A scaffolding, divergence detection, Pulse digest emails, Pulse Inbox card, SLA-timer surfaces, and stakeholder-invite affordances are suppressed in Solo Mode while the engine-side records continue to accrue. Cross-console isolation enforced: `evaluation_owner_mode` MUST NOT appear in any Console Bridge Event payload, seller-visible API response, Marketplace Listing serialization, or Public Pricing API output (per the §2.8.6 / §2.8.7 AC #10 firewall). Auto-promote rule fires when stakeholder count or guest count crosses the §2.8.5 threshold, emitting `workspace_evaluation_owner_mode_changed` with `trigger_reason=automatic_team_threshold_reached`.
- **Cross-project consumers (no scope change to those projects):**
  - **P03 (Design System & App Shell)** — adds the `PipelineSurface` advanced component (four-step bar in Solo, full per-phase chip ribbon in Team) per §3.14 and `UX_Design_of_Sourcera.md` §11.3 PS-01 through PS-12 acceptance criteria. PipelineSurface composition is added to the M03.2 advanced-components scope; no new milestone.
  - **P11 (Analytics, Pulse & Reporting)** — Pulse Inbox card, Pulse digest emails, and Pulse widget gain a Solo-mode surface-suppression branch. Engine-side §17 calculations are unchanged. No new milestone; the suppression branch is wired into M11.1 / M11.2 implementation.
  - **P22 (Notifications & Email)** — notification preferences UI suppresses Solo-Mode-incompatible event toggles per §29.3 reflection of §2.8 contract. No new milestone; wired into M22.1 / M22.2.
  - **P19 (Agent Infrastructure & Buyer Capabilities)** — Pulse Digest text generation (#19) and SLA Escalation (#20) gain a Solo-mode no-op branch (engine continues to compute; surface continues to suppress). No new milestone; wired into M19.2.
- **Build-blockers:** None outside P02. M02.3 is a clean addition to the M02 milestone chain.
- **Authoring extensions still pending the M02.3 implementation pack:** Appendix C registration of `phase_advanced_with_unmet_gates` notification routing; Appendix I registration of `phase_advancement_soft_gates_not_permitted_in_team_mode` and `evaluation_owner_mode_team_to_solo_blocked_stakeholders_present`; Appendix J registration of `phase_advanced_with_unmet_gates_trigger_reason` and `automatic_team_threshold_reached`. These land in Phase 14.18 enum / event-catalog harmonization per the established Phase 14.4 protocol.

### 11.2 M06.3 — Per-Vertical Eval Starters

- **Owning project:** P06 (Requirements & Use Cases).
- **Initiative:** I2 (Buyer Evaluation Pipeline).
- **Source authority:** Master Spec §13.12 (What Are You Evaluating? intake page), §4.5.9 (`EvalStarter` entity), Appendix J `EvalVertical` enum, Workspace `eval_starter_origin` field, Appendix M EvalStarter rows, Appendix C `eval_starter.updated` and `eval_starter.empty_active_registry` event registrations, audit-event `workspace_created_from_eval_starter`, `_integration/RECONCILIATION.md` Phase 14.7 entry.
- **Entry condition:** M06.1 complete (Use Case + Requirement CRUD, Workspace creation flow operational).
- **Exit condition:** `EvalStarter` entity is registered as org-scoped + system-seeded (with custom-org-authored extensions). All six default verticals are seeded and queryable via the `EvalVertical` enum: HR / People (HRIS, ATS, payroll, benefits), Finance (ERP, FP&A, AR / AP, expense), Sales (CRM, sales engagement, RevOps), Engineering / DevTools (CI / CD, observability, IDE / agent), IT / Security (IAM, EDR, SIEM, SOAR), Operations / GRC (ITSM, GRC, vendor-risk). Each seeded starter ships with a curated Use Case set, a Requirement library (3–5 high-value Requirements per Use Case with default scoring model + weight), an evaluation rubric (FM / PM / DNM / EX guidance per Use Case), and a longlist of 8–15 candidate vendors. The §13.12 intake page renders the vertical picker, applies the chosen starter to a new Workspace within ≤2s p95, and stamps `Workspace.eval_starter_origin` with the source `EvalStarter.id` for cohort analytics. Custom-vertical authoring is gated to Workspace Owner; system-seeded starters are read-only and update via `eval_starter.updated` webhook on registry refresh. Empty-registry guard (`eval_starter.empty_active_registry`) fires if no starter is active for the operator's region — engine-only event, surface continues with the universal §13.12 fallback. Audit-event `workspace_created_from_eval_starter` registers per Workspace creation that originated from a starter.
- **Cross-project consumers (no scope change to those projects):**
  - **P04 (Core Data Layer & API)** — adds `EvalStarter` entity (§4.5.9), Workspace `eval_starter_origin` field, and the `EvalVertical` enum (Appendix J). Wired into M04.1 schema scope; no new milestone.
  - **P19 (Agent Infrastructure & Buyer Capabilities)** — capability #1 (Policy Document Parsing) gains a "starter-aware reconciliation" branch: when a policy ingestion runs into a Workspace already pre-populated from a starter, dedup and merge against the starter's Requirements (no new capability number, no new milestone — engine extension wired into M19.2).
  - **P22 (Notifications & Email)** — `eval_starter.updated` webhook delivery wired into M22.1.
- **Build-blockers:** None outside P06.
- **Hero Moment alignment:** M06.3 is a precursor to the buyer Hero Moment (first-evaluation magic — go from "I have a category" to "I have a scoreable Use Case set" in <60s). The buyer Hero Moment milestone (M06.x baseline) is unchanged in v1 scope; M06.3 adds the engine + content that makes the Hero Moment hit its first-30-seconds target per Phase 14.17.

### 11.3 M11.3 — Defense View

- **Owning project:** P11 (Analytics, Pulse & Reporting).
- **Initiative:** I2 (Buyer Evaluation Pipeline).
- **Source authority:** Master Spec §13.11 (Defense View surface), §4.5.x (`DefenseView` entity), §21.4.x (`defense_view_generate` capability registry binding — Sonnet), Appendix J `defense_view_lifecycle_state` enum (4 values) and `regeneration_reason_code` enum (4 values), Appendix I five new error codes (`selection_record_not_finalized`, `regeneration_throttle`, `defense_view_capability_disabled`, `defense_view_archived_with_workspace`, `defense_view_cross_console_access`), Appendix C two new webhook events (`defense_view.generated`, `defense_view.regenerated`), Appendix G PostHog events (`defense_view.generated`, `defense_view.regenerated`, `defense_view.regenerated_due_to_source_change`), Appendix K Glossary §13.11 entries, `_integration/RECONCILIATION.md` Phase 14.5 entry.
- **Entry condition:** M11.2 (Selection Report) complete; M19.1 (Agent Infrastructure) operational with Sonnet routing; M02.3 (Single-Operator Mode) complete (the watermarked-preview surface depends on Solo / Free vs. Starter+ tier-and-mode routing).
- **Exit condition:** `DefenseView` entity is registered with full field table, `defense_view_lifecycle_state` state machine (4 values), Selection Record Hash Binding (the DefenseView is bound to the Phase-12 finalized Selection Record by content hash; any subsequent Selection Record edit invalidates the bound DefenseView and triggers `defense_view.regenerated_due_to_source_change`). The `defense_view_generate` capability is registered in §21.4 / §4.8.2 with model = Sonnet, plan-gating per §5.11 (Solo / Free: watermarked preview only; Starter+: full PDF + watermark removal), Solo envelope-no-block exemption per Phase 14.10 §44.6.4 (defense_view_generate is on the `solo_envelope_no_block=true` list because the surface is a critical post-decision deliverable). Three §13.11 API endpoints are live: generate, regenerate (with regeneration throttle: ≤1 per 60s per Workspace per user), and read. Two webhook events fire with HMAC-SHA256 signing, idempotency via `event_id`, exponential backoff retry, DLQ after 5 failures (per §31). Five error codes are surfaced through standard error envelopes. UX surface renders at Master Spec §13.11.4 / §13.11.13 paths: SidePeek + dedicated page, with watermarked PDF download for Solo / Free and full PDF for Starter+. PDF export pipeline is implemented (Convex storage + serverless render → signed URL with 7-day TTL). Audit logging per §13.11.10 is active. Cross-console firewall holds: `defense_view_cross_console_access` rejects any seller-console attempt to read a buyer DefenseView.
- **Cross-project consumers (no scope change to those projects):**
  - **P04 (Core Data Layer & API)** — `DefenseView` entity, three §13.11 API endpoints, two webhook event payloads. Wired into M04.1 / M04.2 / M04.3 scope; no new milestone.
  - **P19 (Agent Infrastructure & Buyer Capabilities)** — `defense_view_generate` capability adds one row to the §21.4 capability catalog (Sonnet model, plan-gated). Capability count moves from 17 to 18 buyer-side. Wired into M19.2; no new milestone (the M19.2 "all 17 capabilities operational" exit condition is updated to "all 18 capabilities operational" — see §11.6 below for the consolidated count update).
  - **P22 (Notifications & Email)** — both `defense_view.generated` and `defense_view.regenerated` webhook deliveries, plus the Solo-tier upgrade-modal email when Solo / Free user requests full PDF. Wired into M22.1 / M22.2.
  - **P21 (Billing, Plans & Entitlements)** — Solo / Free upgrade prompt surfaces from the watermarked-preview surface (cross-references §13.11.4 / §13.11.13 watermarked-preview path). Wired into M21.3 (see §11.4) — no separate milestone.
- **Build-blockers:** M19.1 (Sonnet routing), M11.2 (Selection Report), M02.3 (Solo / Team mode-aware surface routing).

### 11.4 M21.3 — Solo Tier Billing Surface

- **Owning project:** P21 (Billing, Plans & Entitlements).
- **Initiative:** I6 (Launch Readiness & Hardening).
- **Source authority:** Master Spec §34.1.1 / §34.1.2 (Buyer Solo + Seller Solo plan-tier registration), §34.2.1 / §34.2.2 / §34.2.5 (Solo subscription pricing, per-evaluation pricing, per-bid pricing, refund-window logic), §34.10.3 (Solo co-resident pool rule), §34.12.6 / §34.12.8 (Solo-charge billing-event policy), §44.6 (Solo-Tier Surface Treatment — full sub-section, all eight sub-sub-sections), §4.8.1 (`AIOperation.solo_envelope_blocked` flag), §4.8.2 (CapabilityRegistryEntry `surface_throttling_class`, `solo_envelope_override_value_cents`, `solo_envelope_no_block` fields), Appendix J `surface_throttling_class` enum (3 values), Appendix J `billing_event_charge_kind` enum extension, Appendix M Solo-Tier Surface Treatment subgroup (9 rows), `UX_Design_of_Sourcera.md` §8.1.2 (Solo-Tier Billing Surface), Buyer Pricing Strategy v3 §2.7 / §2.8 / §5 / §11 / §15.6, Seller Pricing Strategy v3 §2.8 / §2.9 / §5 / §15.3 / §15.6, `_integration/RECONCILIATION.md` Phase 14.9 + Phase 14.10 entries.
- **Entry condition:** M21.1 (Stripe + plan enforcement) complete, M21.2 (trial / upgrade / metering) complete. M02.3 must be complete for the `evaluation_owner_mode`-aware surface routing.
- **Exit condition:** Buyer Solo and Seller Solo plan tiers are registered as Stripe products with three SKUs each: monthly subscription ($59 monthly / $49 annual per BPS / SPS v3), per-evaluation one-time ($199), per-bid one-time ($199). Plan enforcement middleware accepts `plan_tier ∈ {buyer_solo, seller_solo}` and applies §5.11 entitlement matrix per Phase 14.9. Single-Card billing surface is live in three variants (Subscription, Per-evaluation, Per-bid) per UX §8.1.2 with full state catalog (Loading / Empty / Error / Refund-window-exceeded / Throttling engaged / Throttling cleared) and accessibility (WCAG 2.1 AA per §11.6). 14-day refund window logic implemented per §34.2.5 (per-evaluation and per-bid charges refundable within 14d if Workspace status is `draft`; non-refundable once any phase advancement occurs). Cross-console isolation: Buyer Solo and Seller Solo wallets / envelopes / billing surfaces are independent — a single User-Org pair holding both Buyer Solo and Seller Solo Orgs sees two distinct billing surfaces and two independent envelopes (per §34.10.3 co-resident pool rule, §44.6 envelope per `(org_id, console)`). Surface Hide List (§44.6.1) enforced: AIWallet widget, value-dollars rate-card visibility, overage configuration, auto-topup configuration, AIOperation per-call cost, OutcomeContract surface, CapabilityRegistry surface, and CostBaseRecalculationLog surface MUST NOT render on Solo. The four §44.6.5 engine telemetry events (`solo.envelope.throttling_engaged`, `solo.envelope.throttling_cleared`, `solo.envelope.exhausted`, `solo.capability.envelope_no_block_invoked`) route to Ops only — never to Solo-Org webhook subscribers, in-app inbox, or email (enforced by CI gate `solo_telemetry_no_customer_routing` from Phase 14.18). Throttling toast surface fires once per envelope window when `low_priority_background` capabilities cross the 80% envelope threshold; First-Pass RFP Generator (`solo_envelope_no_block=true`) is exempt and continues to execute.
- **Cross-project consumers (no scope change to those projects):**
  - **P04 (Core Data Layer & API)** — `AIOperation.solo_envelope_blocked` flag, three new `CapabilityRegistryEntry` fields (`surface_throttling_class`, `solo_envelope_override_value_cents`, `solo_envelope_no_block`), `EnvelopeCounter` engine record per `(org_id, console, envelope_window_id)`. Wired into M04.1 / M04.2 schema scope.
  - **P03 (Design System & App Shell)** — Solo-Tier Billing Card variant of the existing PricingBreakdown / PlanComparisonTable component family. Wired into M03.2 advanced components scope.
  - **P22 (Notifications & Email)** — throttling-toast in-app surface (no email), Solo subscription confirmation / renewal / cancellation emails, per-eval / per-bid charge confirmation emails, refund-window-expiry warning email. Wired into M22.2.
  - **P19 (Agent Infrastructure & Buyer Capabilities)** — capability registry `solo_envelope_no_block=true` flag honored by First-Pass RFP Response Generator routing (the existing capability gains the flag; no new capability). Wired into M19.2.
  - **P23 (Security & Compliance Hardening)** — Solo-tier MFA-not-available decision per Phase 14.9 §34.1.1 row "MFA"; Settings: Security page renders MFA section in disabled state with upgrade-to-Starter CTA. Wired into M23.2.
- **Build-blockers:** M21.1, M21.2, M02.3.
- **Authoring extensions still pending in 14.10.1 / 14.14 / 14.15 / 14.18:** Appendix C explicit catalog rollup of the four §44.6.5 events, Appendix G PostHog property-schema rollup, Appendix I error-code registration of `solo_envelope_throttling_threshold_out_of_range`, formal §4.8.2 row insertion for `proactive_cmd_k_marketplace_surfacing`, `weekly_kb_refresh_suggestions`, `vendor_page_enrichment_polling` capability ids, and the seven Phase 14.18 CI gates (`solo_engine_metering_parity`, `solo_telemetry_no_customer_routing`, `solo_envelope_value_single_source`, `solo_billing_card_price_single_source`, `solo_throttling_class_change_takes_effect_at_next_envelope_rollover`, `solo_envelope_per_console_isolation`, `solo_capability_registry_field_registration`). M21.3 implementation depends on these landing first; the implementation pack must reference them as upstream consumes.

### 11.5 M24.3 — Appendix M Maintenance Gate (CI + Process)

- **Owning project:** P24 (QA, Performance & Launch Prep).
- **Initiative:** I6 (Launch Readiness & Hardening).
- **Source authority:** Master Spec Appendix M (Surface / Engine Mapping — full), Appendix M.2 (process gates), Appendix M.3 (Authored Extension sign-off requirements), `_integration/RECONCILIATION.md` Phase 14.2 entry (Appendix M authored), Phase 14.18 CI-gate authoring track, Principle 9 (§3.13 — Surface Simplicity, Engine Complexity).
- **Entry condition:** Phase 14.18 CI-gate authoring track must have landed the deploy-time validators (`appendix_m_engine_to_surface_completeness`, `appendix_m_no_inline_engine_concepts_in_ux_spec`, `appendix_m_no_orphan_engine_concept`). M24.1 (E2E + a11y + perf) and M24.2 (analytics + integrations + launch) substantially complete.
- **Exit condition:** Every PR introducing or modifying a Master Spec engine concept (entity, role, state, capability, plan-gated feature, webhook, API endpoint, enum value, error code) is required by CI to ship an Appendix M row addition or update in the same commit. Engine-only concepts MUST be flagged "Internal-only, never surfaced" with a documented rationale. The PR template enforces a checklist item; CI gate `appendix_m_engine_to_surface_completeness` blocks merge if a new engine concept is detected without a corresponding Appendix M row. CI gate `appendix_m_no_inline_engine_concepts_in_ux_spec` blocks merge if `UX_Design_of_Sourcera.md` references an engine concept that is not in Appendix M (catches surface-spec drift away from the engine map). CI gate `appendix_m_no_orphan_engine_concept` runs weekly to surface Appendix M rows that no longer resolve to a live Master Spec section. Engineering convention is published in `/AGENTS.md` and the per-PR review checklist (§8.1 above) so Claude Code authors apply the rule on every change. Adversarial-review pass (Phase 14.19) treats Appendix M coverage as a P0 check per Appendix M.2 gate #3.
- **Cross-project consumers:** All projects. Every project's per-issue acceptance criteria template gains the Appendix M line item from this milestone forward. No new code in any project; the gate is a cross-cutting CI + process artifact.
- **Build-blockers:** Phase 14.18 CI-gate authoring (the validators must exist before the gate can enforce). Appendix M itself (Phase 14.2) must remain in a clean state — no orphan rows, no forward-reference rows past their phase landing.
- **Why this is a launch-readiness milestone, not a foundation milestone:** The validators can be authored anytime in the build (Phase 14.18); the *enforcement* gate is what M24.3 ships. Enforcement only makes sense once the spec is materially complete and the engineering team is committed to the engine ↔ surface mapping discipline as a permanent standard. Wiring the gate at launch readiness ensures the v1 ship enforces Principle 9 from the first production commit forward.

#### 11.5.1 Release-Evidence Lane Semantics

The original M02.3, M11.3, M21.3, and M24.3 feature definitions above remain unchanged. Appendix M pending-status suffixes route proof, not implementation scope:

| Stable suffix | Release-evidence lane | Typical proof |
|---|---|---|
| `m02_3` | Source, schema, static, deploy-contract | schema/static validators, source guards, deploy configuration checks |
| `m11_3` | Core application, API, integration, security, workflow | transactions, workers, API/integration/security tests, retry and concurrency proof |
| `m21_3` | UI, mobile, accessibility, Marketplace, analytics, synthetic | rendered fixtures, client tests, monitors, analytics receipts, synthetic trips |
| `m24_3` | Billing, settlement, financial, revenue | Stripe/metering/ledger/settlement/reconciliation tests and receipts |

The row-local assertion and named artifact paths are authoritative. A complete evidence set includes the artifact, positive fixture, negative/fault fixture, applicable main/deploy/scheduled run, and observability receipt. Until all are present, the row remains pending. Generated inventory column “Owning pack” must be read as “legacy release-evidence lane”; it does not identify the feature implementation owner.

### 11.6 Confirmation — Existing v1 Milestones Unchanged

The following v1-scope milestones remain in v1 scope. None is removed, deferred, renumbered, downscoped, or absorbed into a later wave:

- **Hero Moment (Buyer side):** M06.1 + M06.2 + M19.2 (#1 Policy Parsing) + M11.1 (Pulse) form the canonical Buyer Hero Moment loop. M06.3 (per-vertical eval starters) augments this loop without replacing any of its pieces.
- **Hero Moment (Seller side):** M16.1 + M16.2 (Seller Console + Onboarding) + M14.1 + M14.2 (KB + Document Library + Firecrawl) + M20.1 (KB-to-Response Suggestion + Evidence Parsing + KB-to-Capability Suggestion) form the canonical Seller Hero Moment loop. The Phase 14.8 Seller Maya Surface Polish (§22.20.2 Capability Declarations auto-publish + §22.20.3 KB governance silent engine) lands as engine + surface contract updates wired into M14.x and M15.1; no new milestone, no removal.
- **KB Engineering:** M14.1 + M14.2 + M20.1 (the Knowledge Base engineering chain) — full KB CRUD, health scoring, Firecrawl ingestion, RAG retrieval, and Managed Agents tool use per Master Spec §22. Unchanged.
- **Marketplace Destination:** M17.1 + M17.2 (Marketplace Core) + M18.1 (Marketplace Seller Integration) — buyer browse / search / EOI / match scoring + seller listing management / EOI response. Unchanged.
- **Dual-Console Firewall:** Cross-cutting through M02.3 (`evaluation_owner_mode` console firewall), M02.2 (RBAC + console RBAC), M04.x (Console-scoped queries), M21.3 (Solo per-console envelope isolation), M23.x (CSP / CORS / domain governance). The firewall is enforced at every console boundary. Unchanged in v1 scope.
- **All 17 PLG / Network-Effects Growth Mechanics:** As currently bound in Master Spec §48 / §49 and supported narratively by `GTM_PLG_ARCHITECTURE.md` and `GTM_NETWORK_EFFECTS.md` — every growth loop, referral mechanic, viral loop, content engine seed, two-sided marketplace effect, KB data-moat mechanic, and seller-side network effect remains in v1 scope. None is deferred. The relevant implementation lives across M03.x (referral surfaces in app shell), M06.x (template marketplace seed loops), M14.x (KB data moat), M16.x (seller onboarding viral loops), M17.x (marketplace two-sided dynamics), M19.x / M20.x (agent capabilities that drive habit-forming behaviors), M22.x (notification-driven retention loops), and M24.2 (PostHog instrumentation that measures every loop).

If any future Phase reduces v1 scope or moves a v1 milestone to a v2 wave, that change MUST update this section explicitly and amend the Master Spec changelog. Single-ship discipline: there is one ship.

### 11.7 Phase 14.16 Net-New Issue Count Delta

| Milestone | Issues in owning project | Issues in cross-project consumer projects | Total New Issues |
|---|---|---|---|
| M02.3 — Single-Operator Mode | 10 (P02-033 → P02-042) | 2 (P03-051 PipelineSurface; P22-026 notification-pref suppression) | 12 |
| M06.3 — Per-Vertical Eval Starters | 12 (P06-029 → P06-040) | 3 (P04-049 EvalStarter entity; P04-052 Workspace.eval_starter_origin; P22-025 webhook delivery) | 15 |
| M11.3 — Defense View | 14 (P11-017 → P11-030) | 3 (P04-050 DefenseView entity; P19-035 Sonnet capability; P22-023 webhook + upgrade email) | 17 |
| M21.3 — Solo Tier Billing Surface | 16 (P21-015 → P21-030) | 3 (P04-051 Solo billing schema; P22-024 Solo email templates; P23-019 Solo MFA-not-available) | 19 |
| M24.3 — Appendix M Maintenance Gate | 6 (P24-029 → P24-034) | 0 (cross-cutting process gate; no new issues in other projects — gate enforcement applies to all PRs from M24.3 forward) | 6 |
| **Total Phase 14.16 net-new issues** | **58** | **11** | **69** |

Aggregate v1 issue count moves from **462 → 531** with no baseline issue removed, deferred, or renumbered. See `Linear_Execution_Blueprint.md` §11 (final Issue Distribution table) for the per-project breakout.
