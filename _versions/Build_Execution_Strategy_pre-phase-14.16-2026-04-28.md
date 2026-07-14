# Sourcera Execution Strategy

**Version:** 1.0.0  
**Date:** 2026-04-12  
**Authority:** Derived from What_is_Sourcera.md, Sourcera_Master_Spec.md v6.0.0, UX_Design_of_Sourcera.md v2.0.0, LINEAR_EXECUTION_BLUEPRINT.md v2.0.0  

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

Packs are authored 1 week ahead of when they're needed. The human architect writes each pack by extracting the relevant subset from the four source documents.

**Foundation packs (write all before Week 1):**
- M01.1, M01.2, M02.1, M02.2, M03.1, M03.2, M03.3, M04.1, M04.2, M04.3, M05.1, M05.2

**Feature packs (write 1 week before execution):**
- M06.1, M06.2, M07.1, M07.2, M08.1, M08.2, M09.1, M09.2, M10.1, M10.2, M11.1, M11.2, M12.1, M12.2
- M13.1, M13.2, M14.1, M14.2, M15.1, M16.1, M16.2
- M17.1, M17.2, M18.1
- M19.1, M19.2, M20.1

**Hardening packs (write 1 week before execution):**
- M21.1, M21.2, M22.1, M22.2, M23.1, M23.2, M24.1, M24.2

**Total: ~46 implementation packs.**

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
