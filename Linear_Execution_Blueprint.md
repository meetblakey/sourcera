# Sourcera — Linear Execution Blueprint (Hardened v2.1)

**Version:** 2.1.0
**Date:** 2026-04-28 (v2.1 — Phase 14.16 net-new milestones added; v2.0 baseline 2026-04-12)
**Status:** Production-Ready — Hardened Post-Audit; Phase 14.16 v7.1.0 net-new milestones integrated
**Source Binding:** Current build authority is `Sourcera_Master_Spec.md` v7.1.0a, `UX_Design_of_Sourcera.md` v2.0.0, `Sourcera_Buyer_Pricing_Strategy.md` v3, `Sourcera_Seller_Pricing_Strategy.md` v3, and `Build_Execution_Strategy.md` v1.1.0. Historical provenance is `_integration/RECONCILIATION.md` Phase 14.0 → 14.10. The retired KB Engineering Spec is not current authority; KB behavior resolves through Master Spec §22.
**Scope:** Complete Sourcera SaaS platform build via Linear + Codex
**Single-ship discipline.** This blueprint operates under single-ship discipline. There is one ship (the v1 platform release). Net-new milestones added in Phase 14.16 (M02.3, M06.3, M11.3, M21.3, M24.3) are additions to v1 scope — not v1/v2 phasing. The existing milestones, the Hero Moment loops (buyer + seller), KB engineering, Marketplace destination, dual-console firewall, and all 17 PLG / network-effects growth mechanics remain in v1 scope unchanged. No milestone is removed, deferred, renumbered, or downscoped.

---

## 1. Linear Operating Model

### 1.1 Team Structure

| Team | Scope | Responsibilities |
|------|-------|-----------------|
| **Platform** | Auth, org/workspace primitives, RBAC, data model, API, infra, billing, integrations, observability, security, admin, notifications, file storage | All backend infrastructure, cross-cutting services, deployment pipeline, compliance, billing enforcement |
| **Buyer Experience** | Buyer Console UI, all buyer pages, buyer workflows, buyer-side collaboration, buyer onboarding | Requirements matrix, scoring UI, vendor management UI, analytics dashboard, selection report, policy ingestion UI, marketplace buyer side |
| **Seller Experience** | Seller Console UI, all seller pages, seller workflows, seller onboarding | Bid workspace UI, response editor, KB management UI, seller profile, capability declarations, marketplace seller side |
| **Intelligence** | Sourcera Agent (all 21 capabilities), RAG/vector search, Firecrawl integration, AI guardrails, token budgets, model routing | Agent infrastructure, buyer-side capabilities (#1–#16, #19–#21), seller-side capabilities (#7, #8, #17, #18), agent error handling, agent attribution |

### 1.2 Initiatives

| Initiative | Purpose | Owner | Projects |
|-----------|---------|-------|----------|
| **I1: Foundation & Infrastructure** | Deployable platform skeleton with auth, data layer, design system, real-time infrastructure | Platform | P01–P05 |
| **I2: Buyer Evaluation Pipeline** | Complete buyer-side evaluation workflow from Phase 1 through Phase 13 | Buyer Experience | P06–P12 |
| **I3: Seller Response & Knowledge** | Seller-side bid response, KB, profile, and onboarding systems | Seller Experience | P13–P16 |
| **I4: Marketplace & Discovery** | Vendor discovery marketplace with browse, search, EOI, and match scoring | Buyer Experience + Seller Experience | P17–P18 |
| **I5: Intelligence & Agent Capabilities** | All 21 AI agent capabilities with guardrails, confidence thresholds, and token budgets | Intelligence | P19–P20 |
| **I6: Launch Readiness & Hardening** | Billing enforcement, notifications, security hardening, QA, performance, and launch preparation | Platform | P21–P24 |

### 1.3 Projects

| ID | Project | Initiative | Team |
|----|---------|-----------|------|
| P01 | Repo, Infra & DevOps | I1 | Platform |
| P02 | Auth, Identity & RBAC | I1 | Platform |
| P03 | Design System & App Shell | I1 | Buyer Experience |
| P04 | Core Data Layer & API | I1 | Platform |
| P05 | Real-Time & Search Infrastructure | I1 | Platform |
| P06 | Requirements & Use Cases | I2 | Buyer Experience |
| P07 | Vendor Management & Invitations | I2 | Buyer Experience |
| P08 | Scoring System | I2 | Buyer Experience |
| P09 | Scenarios & TCO | I2 | Buyer Experience |
| P10 | Q&A, Comments & Collaboration | I2 | Buyer Experience |
| P11 | Analytics, Pulse & Reporting | I2 | Buyer Experience |
| P12 | Policy Ingestion & Templates | I2 | Buyer Experience |
| P13 | Bid Workspaces & Responses | I3 | Seller Experience |
| P14 | Knowledge Base & Document Library | I3 | Seller Experience |
| P15 | Seller Profile & Capabilities | I3 | Seller Experience |
| P16 | Seller Console Shell & Onboarding | I3 | Seller Experience |
| P17 | Marketplace Core | I4 | Buyer Experience |
| P18 | Marketplace Seller Integration | I4 | Seller Experience |
| P19 | Agent Infrastructure & Buyer Capabilities | I5 | Intelligence |
| P20 | Agent Seller Capabilities | I5 | Intelligence |
| P21 | Billing, Plans & Entitlements | I6 | Platform |
| P22 | Notifications & Email | I6 | Platform |
| P23 | Security & Compliance Hardening | I6 | Platform |
| P24 | QA, Performance & Launch Prep | I6 | Platform |

### 1.4 Cycles

- **Duration:** 1-week cycles.
- **Capacity Target:** 80% of team velocity (~12–20 points per team per cycle depending on team size). Leave 20% buffer for bugs, blockers, and unplanned work.
- **Inclusion Rule:** Only unblocked issues with complete acceptance criteria enter a cycle.
- **Carry-Over:** Reviewed and explicitly re-included or deprioritized each cycle end. Never auto-rolled.
- **Codex Issues:** 1–3 point issues target ~60% of cycle volume. Each Codex issue must be fully unblocked before pickup.
- **Agent Execution Model:** Codex picks `codex-ready` issue in dependency order → executes → moves to `In Review` → human code review → merge → dependent issues unblocked.
- **Spikes:** Maximum 1 spike per cycle per team.
- **Cross-Team Blocker Protocol:** Daily standup for cross-team blockers. 24-hour SLA for resolving blockers. Weekly cross-project sync with all 4 team leads. Escalation: blocked team lead → blocking team lead → initiative owner.

### 1.5 Issues and Sub-Issues

- Every issue represents one tightly scoped implementation unit.
- Sub-issues used only when a parent naturally decomposes into 2–4 sequential steps sharing context.
- Never nest deeper than one level.
- Every issue has exactly one assignee.

### 1.6 Workflow Statuses

| Status | Meaning |
|--------|---------|
| **Backlog** | Defined but not scheduled |
| **Todo** | Scheduled into cycle, not started |
| **In Progress** | Actively worked on (human or Codex) |
| **In Review** | Implementation complete, awaiting code review |
| **Done** | Reviewed, merged, verified |
| **Cancelled** | Removed from scope with documented reason |

### 1.7 Priority Model

| Level | Label | Meaning |
|-------|-------|---------|
| Urgent | P0 | Blocking other teams or critical-path dependency |
| High | P1 | Required for current milestone exit |
| Medium | P2 | Important but not blocking milestone |
| Low | P3 | Nice-to-have, polish, optimization |

### 1.8 Estimate Model

Fibonacci points: 1, 2, 3, 5, 8.

| Points | Size | Codex Suitability |
|--------|------|-------------------|
| 1 | Trivial — single file, config change, copy update | Ideal |
| 2 | Small — one component, one mutation, one endpoint | Ideal |
| 3 | Medium — multiple files, moderate logic | Good with clear spec |
| 5 | Large — cross-cutting, multiple components | Requires careful sub-issue breakdown |
| 8 | Too large — **must be split before entering cycle** | Never enters cycle |

### 1.9 Label Taxonomy

| Category | Labels |
|----------|--------|
| **Domain** | `buyer`, `seller`, `marketplace`, `platform`, `agent` |
| **Layer** | `schema`, `backend`, `frontend`, `api`, `infra`, `integration` |
| **Type** | `feature`, `bug`, `tech-debt`, `spike`, `qa`, `docs`, `a11y` |
| **Phase Gate** | `phase-1-3`, `phase-4-5`, `phase-6-9`, `phase-10-11`, `phase-12-13` |
| **Agent** | `codex-ready`, `human-only` |
| **Plan** | `free`, `business`, `enterprise` |
| **Priority Override** | `blocker`, `security`, `compliance` |

### 1.10 Issue Template — Standard

```markdown
## Purpose
[One sentence: why this issue exists]

## Scope
[What is included. What is explicitly excluded.]

## Files/Paths
[Exact files or directories this issue touches, e.g.:
- `convex/schema/score.ts`
- `app/buyer/workspaces/[id]/scoring/page.tsx`
- `components/ui/ScoringCard.tsx`]

## Dependencies
- Blocked by: [issue links]
- Blocks: [issue links]

## Implementation Notes
[Technical decisions, patterns, constraints, references to spec sections]

## Acceptance Criteria
- [ ] [Criterion 1 — independently verifiable]
- [ ] [Criterion 2 — independently verifiable]

## Testing Notes
[How to verify correctness]

## Notification Trigger
[Does this mutation trigger a notification? If yes: event type, recipients, channels.]
```

### 1.11 Issue Template — Schema

```markdown
## Purpose
[One sentence: what entity this schema defines]

## Entity Name
[Convex table name]

## Fields
| Field | Type | Required | Default | Constraints | Notes |
|-------|------|----------|---------|-------------|-------|

## Indexes
[List indexes with fields and uniqueness]

## Foreign Keys
[List FK relationships]

## Validation Rules
[Business logic validation]

## Files/Paths
- `convex/schema/[entity].ts`

## Dependencies
- Blocked by: [issue links]
- Blocks: [mutation issues consuming this schema]

## Acceptance Criteria
- [ ] Schema defined in Convex with all fields
- [ ] All indexes created
- [ ] Validation rules enforced
- [ ] TypeScript types exported
```

### 1.12 Ownership Conventions

- Every issue has exactly one assignee.
- Team lead assigns issues within their team.
- Cross-team dependencies tracked via Linear issue links (`blocked by` / `blocks`).
- Codex-delegated issues assigned to team lead who reviews output.
- **Project Update Convention:** Project owner posts weekly update in Linear (Monday EOD): progress vs. milestone, blockers, cross-team dependencies, next week focus. Linear project update template enforced.

### 1.13 Naming Conventions

- **Issue Titles:** `[Layer] Verb + Object + Context` — e.g., `[Schema] Define Score entity`, `[Frontend] Implement Requirements Matrix table view`
- **Projects:** Match this blueprint exactly.
- **Milestones:** `M{project}.{seq}: {Name}` — e.g., `M01.1: Repo & CI Green`
- **Labels:** Lowercase, hyphenated — e.g., `phase-10-11`, `codex-ready`

---

## 2. Delivery Architecture

### 2.1 Wave Structure

| Wave | Initiative | Projects | Entry Condition | Notes |
|------|-----------|----------|----------------|-------|
| **W1: Foundation** | I1 | P01–P05 | None (start of build) | P01 ∥ P03 tokens; P02 after P01; P04 after P01+P02; P05 after P04 |
| **W2: Buyer Core** | I2 | P06–P12 | W1 M02.2 + M03.3 + M04.1 | P06 first; P07 after P06.M06.1; P08 after P06+P04.responses; P10 after P06; P09 after P08; P11 after P08; P12.templates after P06; P12.policy after P19.M19.1 |
| **W3: Seller Core** | I3 | P13–P16 | W1 complete + P07.M07.2 | P16 starts with W1; P13 after P07.M07.2; P14 ∥ P15 after W1; P13→P16 inbox depends on P13 |
| **W4: Marketplace** | I4 | P17–P18 | P07.M07.2 + P15.M15.1 | P17 ∥ P18 after deps met |
| **W5: Intelligence** | I5 | P19–P20 | W1 M05.2 (RAG) | Progressive: P19 starts mid-W1; capabilities wire in as features land; P20 after P14 |
| **W6: Hardening** | I6 | P21–P24 | Progressive | P21+P22 start mid-W2; P23 after feature-complete; P24 last |

### 2.2 Dependency Rules

- **Schema → Backend:** Every schema blocks mutations consuming it.
- **Backend → Frontend:** Every user-facing mutation blocks the frontend rendering it.
- **RBAC → Features:** RBAC middleware blocks any mutation requiring permission checks.
- **Auth → Everything:** WorkOS integration blocks all authenticated pages.
- **Design System → Pages:** Core components block all page implementation.
- **App Shell → Console Pages:** Sidebar, nav, console switcher block all console pages.
- **Plan Enforcement → Gated Features:** Plan middleware (P21) must exist before Business+/Enterprise features ship to production.
- **File Upload → Attachments:** File upload system blocks Q&A attachments, response documents, Document Library, contract upload.
- **Presence → Collaborative Features:** Convex Presence blocks collaborative scoring, comment presence, real-time editing.
- **Search → Search Features:** Full-text search blocks Command Palette, marketplace search, KB search.
- **RAG → Agent Suggestions:** Convex RAG blocks KB-to-Response, KB-to-Capability suggestions.

### 2.3 Cross-Project Dependency Map

| Producing | Consuming | What |
|-----------|-----------|------|
| P01 | P02, P04 | Repo, CI, Convex |
| P02 | P03 shell, P06–P18 | Auth context, RBAC middleware |
| P02 (M02.3) | P03 (PipelineSurface), P06 (Mode-aware Workspace creation), P10 (stakeholder/Q&A surface suppression), P11 (Pulse surface suppression), P19 (#19 Pulse Digest / #20 SLA Escalation Solo no-op), P21 (Solo billing-surface routing), P22 (Solo notification suppression) | `evaluation_owner_mode` enum + soft-gate contract + cross-console firewall (Phase 14.16) |
| P03 | All frontend | Design tokens, components, shell |
| P04 | P05–P22 | Schemas, mutations, API, file upload |
| P05 | P08, P10, P14, P17, P19 | Presence, OT, search, RAG |
| P06 | P07, P08, P10, P13 | Requirements, Use Cases |
| P06 (M06.3) | P04 (EvalStarter entity, Workspace.eval_starter_origin), P19 (#1 Policy Parsing starter-aware reconciliation), P22 (`eval_starter.updated` webhook delivery) | EvalStarter registry + per-vertical seeds (Phase 14.16) |
| P07 | P08, P13, P17 | Vendors, ITB, NDA |
| P08 | P09, P11 | Scoring data |
| P11 (M11.3) | P04 (DefenseView entity, three §13.11 endpoints, two webhook events), P19 (`defense_view_generate` Sonnet capability — buyer capability count moves from 17 to 18), P21 (Solo / Free upgrade-modal cross-link from watermarked-preview surface), P22 (`defense_view.generated` / `defense_view.regenerated` webhook delivery + Solo upgrade email) | Defense View surface + capability + PDF pipeline (Phase 14.16) |
| P14 | P20 | KB data for agent capabilities |
| P19 | P12 policy, P08 pre-score, P11 pulse | Agent infrastructure |
| P21 | All Business+/Enterprise issues | Plan enforcement |
| P21 (M21.3) | P04 (Stripe SKUs, refund-window storage, EnvelopeCounter, CapabilityRegistryEntry field extensions, `AIOperation.solo_envelope_blocked`), P03 (Solo-Tier Billing Card variant), P19 (`solo_envelope_no_block` honored by First-Pass RFP routing), P22 (Ops-only telemetry routing + Solo-tier email templates), P23 (Solo MFA-not-available decision in Settings: Security) | Solo plan-tier registration + single-Card surface + envelope contract (Phase 14.16) |
| P24 (M24.3) | All projects (PR-template + CI-gate enforcement) | Appendix M maintenance gate (Phase 14.16) |

---

## 3. Initiative Map

### I1: Foundation & Infrastructure

- **Purpose:** Deployable platform skeleton with working auth, data persistence, design system, real-time infrastructure, and observability.
- **Outcome:** Logged-in user can create org, navigate consoles, see app shell. All entities defined. Observability live.
- **Projects:** P01, P02, P03, P04, P05
- **Owner:** Platform team lead
- **Success Conditions:**
  - App deploys to Vercel from CI
  - WorkOS auth works (sign up/in, SSO stub, MFA stub)
  - Org/User/Team/Workspace CRUD persists in Convex
  - RBAC enforcement passes all role combinations
  - Phase pipeline state machine with gate validation operational
  - **Single-Operator Mode (M02.3, Phase 14.16):** Workspace `evaluation_owner_mode` enum, default-derivation function honors plan tier, Workspace Settings switch UI live with Team→Solo transition guard, Phase Advancement endpoint `soft_gates_enabled` flag enforced (Solo: accepted; Team: rejected with `phase_advancement_soft_gates_not_permitted_in_team_mode`), `phase_advanced_with_unmet_gates` audit-event emitted, auto-promote Solo→Team rule fires on stakeholder/guest threshold, cross-console firewall holds (`evaluation_owner_mode` never leaks to seller-visible payloads or Public Pricing API)
  - All core + advanced components documented and rendering (including Phase 14.16 PipelineSurface component for M02.3)
  - App shell (sidebar, console switcher, Command Palette) functional
  - Convex Presence heartbeat operational
  - Full-text search returns results <200ms
  - RAG vector index queryable
  - Pino/Datadog/Sentry/OTel producing data

### I2: Buyer Evaluation Pipeline

- **Purpose:** Buyers run complete evaluations Phase 1–13.
- **Outcome:** Define requirements, invite vendors, score responses, model scenarios, generate Selection Report, close evaluation.
- **Projects:** P06–P12
- **Owner:** Buyer Experience team lead
- **Success Conditions:**
  - Requirements matrix with inline editing, bulk actions, keyboard nav
  - 13 phase gates enforce correctly
  - Scoring matrix with FM/PM/DNM/EX, collaborative scoring, disagreement detection
  - Phase 12 immutability — zero score modifications possible
  - Scenarios with weight overlays, vendor exclusions
  - TCO projections with multi-year, seat growth
  - Selection Report as PDF
  - Q&A with phase-gated visibility
  - Workspace analytics with Pulse Health Score
  - Templates and policy ingestion operational
  - **Per-Vertical Eval Starters (M06.3, Phase 14.16):** `EvalStarter` entity registered (org-scoped + system-seeded), all six default verticals seeded with curated Use Cases / Requirements / scoring rubric / vendor longlist, §13.12 What Are You Evaluating? intake page live, auto-population of Workspace from chosen starter <2s p95, `eval_starter_origin` stamp on Workspace, `workspace_created_from_eval_starter` audit-event, `eval_starter.updated` / `eval_starter.empty_active_registry` webhooks delivering
  - **Defense View (M11.3, Phase 14.16):** `DefenseView` entity with Selection Record Hash Binding, `defense_view_lifecycle_state` (4 values), `defense_view_generate` Sonnet capability registered, §13.11 surface live (SidePeek + dedicated page), watermarked-PDF export pipeline live (Solo / Free: watermarked preview only; Starter+: full PDF), regeneration throttle (≤1/60s/Workspace/user), five Appendix I error codes surfaced, two §31 webhook events delivering, audit logging active, cross-console firewall holds (`defense_view_cross_console_access` rejects seller-side access)

### I3: Seller Response & Knowledge

- **Purpose:** Sellers receive ITBs, respond, manage KB, maintain profile.
- **Outcome:** Full bid lifecycle. KB searchable and health-tracked. Profile publicly viewable.
- **Projects:** P13–P16
- **Owner:** Seller Experience team lead
- **Success Conditions:**
  - Bid workspace mirrors buyer requirements within 5s of Phase 6
  - Response editor with markdown, KB suggestions, auto-save, bulk submit
  - KB with staleness model, health dashboard, review workflow
  - Document Library with expiration and versioning
  - Firecrawl integration operational
  - Seller Profile with verification tiers
  - Seller onboarding and inbox functional

### I4: Marketplace & Discovery

- **Purpose:** Vendor discovery marketplace.
- **Outcome:** Buyers browse/search, submit EOIs. Sellers create listings, respond. Enterprise match scoring works.
- **Projects:** P17–P18
- **Owner:** Buyer Experience (P17) + Seller Experience (P18)
- **Success Conditions:**
  - Browse with filters, search with fuzzy matching
  - Listing detail with capabilities, pricing
  - EOI flow complete
  - Match scoring on Enterprise
  - Seller listing management with controlled vocabulary

### I5: Intelligence & Agent Capabilities

- **Purpose:** All 21 AI capabilities with guardrails and plan gating.
- **Outcome:** Every capability operational with attribution, confidence scoring, feedback.
- **Projects:** P19–P20
- **Owner:** Intelligence team lead
- **Success Conditions:**
  - Claude API with Opus/Sonnet/Haiku routing
  - Token budgets enforced per plan
  - All 21 capabilities pass integration tests
  - Agent attribution on all AI outputs
  - Confidence thresholds configurable
  - Custom Agent Instructions functional
  - Agent error states display actionable guidance

### I6: Launch Readiness & Hardening

- **Purpose:** Production-safe platform.
- **Outcome:** Billing live. Notifications complete. Security hardened. QA green. Performance targets met.
- **Projects:** P21–P24
- **Owner:** Platform team lead
- **Success Conditions:**
  - Stripe checkout, subscriptions, metering operational
  - Plan enforcement blocks ungated access
  - **Solo Tier Billing Surface (M21.3, Phase 14.16):** Buyer Solo + Seller Solo Stripe SKUs registered (monthly $59 / annual $49 / per-eval $199 / per-bid $199), single-Card billing surface live in three variants per UX §8.1.2, §44.6 Surface Hide List enforced (AIWallet / value-dollars / overage / auto-topup hidden on Solo), throttling-toast surface fires once per envelope window on `low_priority_background` capabilities at ≥80%, First-Pass RFP exempt via `solo_envelope_no_block`, cross-console envelope isolation (Buyer Solo + Seller Solo independent), Ops-only telemetry routing (four `solo.*` events never reach Solo-Org subscribers), 14-day refund-window logic enforced
  - All notification types delivered (in-app, email, Slack)
  - All Loops.so email templates live
  - CSP, sanitization, CORS, auth hardening in place
  - DSAR export and account closure functional
  - E2E tests (Playwright) cover critical paths
  - p95 API latency <500ms
  - WCAG 2.1 AA compliance verified
  - Statuspage.io and Zendesk configured
  - Data seed scripts operational
  - **Appendix M Maintenance Gate (M24.3, Phase 14.16):** PR template carries the "Appendix M row added or updated" checklist line; CI gates `appendix_m_engine_to_surface_completeness`, `appendix_m_no_inline_engine_concepts_in_ux_spec`, `appendix_m_no_orphan_engine_concept` block merge / surface drift; engineering convention published in `/AGENTS.md`; adversarial review (Phase 14.19) runs Appendix M coverage as P0 check; v1 ship enforces Principle 9 from first production commit forward

---

## 4. Project Map

### P01: Repo, Infra & DevOps
- **Initiative:** I1 | **Team:** Platform
- **Purpose:** Repository, CI/CD, hosting, database, observability.
- **Scope:** Next.js 16 repo, TypeScript config, Convex project, Vercel deploy, CI pipeline (lint/type-check/test/build), Pino logging, Datadog, Sentry, OpenTelemetry, env var management (dev/staging/prod), secret management.
- **Dependencies:** None.
- **Milestones:** M01.1: Repo & CI Green | M01.2: Observability Live
- **Issues:** ~14

### P02: Auth, Identity & RBAC
- **Initiative:** I1 | **Team:** Platform
- **Purpose:** Authentication, org/user/team/workspace lifecycle, RBAC, phase pipeline, Single-Operator Mode (Solo / Team) workspace mode contract.
- **Scope:** WorkOS integration (sign up/in, SSO, MFA, SCIM stub), org/user/team CRUD, workspace CRUD, all org roles (Owner/Admin/Member), all buyer roles (Owner/EvalLead/Evaluator/Scorer/Guest×4 profiles), all seller roles (BidOwner/Contributor/Viewer + Seller Team Lead), marketplace roles (Publisher/Viewer), RBAC middleware, session management (timeout, multi-device, concurrent limits), phase pipeline state machine with per-phase validation gates (13 phases), SLA timer system (schema, creation on assignment, expiry detection, pre-breach warning, breach notification, extension workflow). **Net-new (Phase 14.16):** Workspace `evaluation_owner_mode` enum field with default-derivation function (Solo / Free → `solo`, Starter+ → `team`); Workspace Settings mode-switch UI with Team→Solo transition guard; Phase Advancement endpoint `soft_gates_enabled` request flag with Team-Mode rejection; soft-gate audit-event emission (`phase_advanced_with_unmet_gates` with `trigger_reason ∈ {solo_skip, team_override}`); auto-promote Solo→Team rule on stakeholder / guest threshold; cross-console firewall (the `evaluation_owner_mode` engine field MUST NOT appear in seller-visible payloads or Public Pricing API output). Per Master Spec §2.8 / §3.13 / §4.3.1 / §10.16 / §32.
- **Dependencies:** P01
- **Milestones:** M02.1: Auth & Org Shell | M02.2: RBAC, Workspace Lifecycle & Phase Pipeline | **M02.3: Single-Operator Mode (Phase 14.16)**
- **Issues:** ~42 (~32 baseline + ~10 Phase 14.16 net-new for M02.3)

### P03: Design System & App Shell
- **Initiative:** I1 | **Team:** Buyer Experience
- **Purpose:** Design tokens, shared components, application shell, error handling.
- **Scope:** Design tokens (typography, colors, spacing, elevation, borders, z-index, motion, forms). Core components: Button, Input, Select, Checkbox, RadioGroup, Toggle, DatePicker, TextInput, Textarea, DataTable, Modal, Dropdown, FormField, Toast, Badge, StatusBadge, GradeBadge, VerificationBadge, Avatar, Chip, Tooltip, Skeleton, Breadcrumb, Alert, Card, ProgressBar, Tabs. Advanced components: SidePeek, CommandPalette, MarkdownEditor, FileUpload, DocumentViewer, DiffViewer, AgentAttribution, InsightCard, HealthScoreGauge, PricingBreakdown, SLATimer, PhaseAdvancer, AmendmentBanner, TriageQueue, CrawlConfigPanel, PlanComparisonTable, NotificationPreferences. Shell: sidebar (buyer + seller), console switcher, page header, breadcrumbs, responsive layouts (desktop/tablet/mobile), keyboard shortcut overlay. Error: 404/403/500 pages, error boundary, empty state base, optimistic mutation rollback handler, offline/network error banner.
- **Dependencies:** P01
- **Milestones:** M03.1: Design Tokens & Core Components | M03.2: Advanced Components | M03.3: App Shell, Navigation & Error Handling
- **Issues:** ~50

### P04: Core Data Layer & API
- **Initiative:** I1 | **Team:** Platform
- **Purpose:** All Convex schemas, CRUD mutations, API layer, file upload.
- **Scope:** All entity schemas: Organization, User, OrgMembership, Team, Workspace, WorkspaceMembership, UseCase, Requirement, RequirementVersion, Response, ResponseVersion, Score, IntelligenceCache, EvaluationScenario, EvaluationPulseEvent, BidWorkspace, BidResponse, BidTask, BidSchedule, SellerProfile, CapabilityDeclaration, MarketplaceListing, EOI, NDARecord, Attachment, Comment, QAThread, Notification, NotificationPreference, AuditEvent, AgentInstruction, CrawlSource, CrawlPage, Template, SLATimer, SelectionRecord. CRUD mutations with RBAC. Response CRUD with status lifecycle. Phase-specific gate mutations (Phase 2 entry, Phase 6 entry, Phase 9 exit snapshot, Phase 10 entry response lock, Phase 12 score lock, Phase 13 archival). Immutable snapshot creation at Phase 9. Contract upload and workspace archival at Phase 13. Workspace cancellation with 30-day grace. API key system. Cursor-based pagination. Rate limiting. Webhook delivery (HMAC-SHA256). Audit logging. File upload (Convex file storage, virus scanning, size/type validation). Attachment CRUD.
- **Dependencies:** P01 (Convex), P02 (RBAC middleware)
- **Milestones:** M04.1: Core Schemas | M04.2: CRUD Mutations & Queries | M04.3: API Layer, Webhooks & File Upload
- **Issues:** ~48

### P05: Real-Time & Search Infrastructure
- **Initiative:** I1 | **Team:** Platform
- **Purpose:** Convex Presence, OT, full-text search, RAG vector search.
- **Scope:** Presence (heartbeat, idle detection, cursor tracking, graceful reconnection). OT (collaborative text fields for Use Case descriptions/requirement text, conflict resolution, undo/redo). Full-text search (index, query parsing, snippet generation, Boolean/phrase, highlighted results). RAG (embedding model, vector index, chunking strategy, similarity thresholds).
- **Dependencies:** P04
- **Milestones:** M05.1: Presence & OT | M05.2: Search & RAG
- **Issues:** ~12

### P06: Requirements & Use Cases
- **Initiative:** I2 | **Team:** Buyer Experience
- **Purpose:** Use case and requirement management with Requirements Matrix; per-vertical eval starters as the buyer-side intake-to-Workspace fast path.
- **Scope:** Use Case CRUD+UI, Requirement CRUD+UI, Requirements Matrix (DataTable, inline editing, J/K/L/Enter/Escape, bulk actions, column config), Requirement Detail (SidePeek), triage queue (list+Kanban with drag-drop, SLA timer integration), triage auto-mapping UI, reordering (drag+Cmd+Up/Down), Use Case tabs, filters/sort/group-by, phase-lock enforcement, amendment protocol UI (AmendmentBanner, DiffViewer, batch amendment modal for ≥5), requirement splitting UI, Workspace Overview page, Workspace List page, per-page empty states. **Net-new (Phase 14.16):** `EvalStarter` entity (org-scoped + system-seeded), Appendix J `EvalVertical` enum, six default vertical seeds (HR/People, Finance, Sales, Engineering/DevTools, IT/Security, Operations/GRC) each carrying curated Use Cases / Requirements / scoring rubric / vendor longlist; §13.12 What Are You Evaluating? intake page; auto-population of new Workspace from chosen starter (≤2s p95) with `eval_starter_origin` stamp; `workspace_created_from_eval_starter` audit event; `eval_starter.updated` and `eval_starter.empty_active_registry` webhook events. Per Master Spec §13.12 / §4.5.9 / Appendix J / Appendix C / Appendix M.
- **Dependencies:** P02, P03, P04
- **Milestones:** M06.1: Use Case & Requirement CRUD + Matrix | M06.2: Triage, Amendments & Phase-Lock | **M06.3: Per-Vertical Eval Starters (Phase 14.16)**
- **Issues:** ~40 (~28 baseline + ~12 Phase 14.16 net-new for M06.3)

### P07: Vendor Management & Invitations
- **Initiative:** I2 | **Team:** Buyer Experience
- **Purpose:** Vendor entities, ITB workflow, NDA, shortlist.
- **Scope:** Vendor/Target Account CRUD, vendor list with status badges, vendor detail (SidePeek), ITB creation/sending, NDA workflow (send/review/sign/track), shortlist management, disqualification with rationale, voluntary withdrawal handling.
- **Dependencies:** P06, P04 (NDARecord, vendor schemas)
- **Milestones:** M07.1: Vendor CRUD & List | M07.2: ITB, NDA & Shortlist
- **Issues:** ~14

### P08: Scoring System
- **Initiative:** I2 | **Team:** Buyer Experience
- **Purpose:** Scoring matrix with FM/PM/DNM/EX, collaborative scoring, immutability.
- **Scope:** Scoring Matrix (grid, 1-4/J/K/N/Tab), Scoring Card (SidePeek: requirement+response+grade+notes), FM/PM/DNM/EX entry, calculation (vendor-req, vendor-UC, blended), auto-scoring (Boolean→FM/DNM, pricing→TCO), collaborative scoring with presence, "Score Independently" toggle, append-only grades, divergence detection (≥0.3 Card, ≥0.6 escalation), UC Lead resolution, override tracking, Phase 12 immutability, vendor response comparison (side-by-side, synced scroll, highlighted diffs).
- **Dependencies:** P06, P04 (Score, Response schemas), P05 (Presence)
- **Milestones:** M08.1: Scoring Grid & Grading | M08.2: Collaborative Scoring & Immutability
- **Issues:** ~22

### P09: Scenarios & TCO
- **Initiative:** I2 | **Team:** Buyer Experience
- **Purpose:** Scenario modeling and TCO projections.
- **Scope:** Scenario CRUD, weight overlay (sliders), vendor exclusion, rubric overrides, ranking/threshold, comparison (max 5), sensitivity chart, simulation mode (S key, real-time recalc, Cmd+S save), TCO Use Case type, pricing types (flat/tiered/one-time/percentage/estimate-range/discount), TCO engine (multi-year, seat growth), TCO dashboard, cost-per-seat, blended score with TCO percentile.
- **Dependencies:** P08
- **Milestones:** M09.1: Scenario Modeling | M09.2: TCO & Blended Scoring
- **Issues:** ~14

### P10: Q&A, Comments & Collaboration
- **Initiative:** I2 | **Team:** Buyer Experience
- **Purpose:** Threaded comments, Q&A, collaborative features.
- **Scope:** Comment CRUD with @mentions, unread tracking, Q&A threads (buyer↔vendor, public/private, vendor question limits 50+10), phase-gated Q&A (6-7 editable, 8 vendor read-only, 9-12 all read-only), file attachments (PDF/DOCX/XLSX/PNG/JPG <10MB), vendor identity masking, Q&A search/export, inline commenting on requirements/responses.
- **Dependencies:** P06, P04 (Comment, QAThread schemas), P05 (Presence), P04 (file upload)
- **Milestones:** M10.1: Comments & @Mentions | M10.2: Q&A with Phase Gating
- **Issues:** ~16

### P11: Analytics, Pulse & Reporting
- **Initiative:** I2 | **Team:** Buyer Experience
- **Purpose:** Workspace analytics, Pulse, Selection Report, Intelligence Dashboard, Defense View (post-Phase-12 "defend my decision" companion bound to the finalized Selection Record).
- **Scope:** Analytics page (scoring progress, response rate, phase duration, score distribution, weight coverage, SLA compliance, team velocity), Pulse Health Score (0.3×SLA+0.3×Scoring+0.2×Response+0.2×Velocity), Pulse widget+full view+digest archive, Selection Report (Phase 12 PDF with rankings/narratives/audit), export (CSV/PDF/Excel), Intelligence Dashboard (Business+: vendor history/efficiency; Enterprise: discrepancy/predictive). **Net-new (Phase 14.16):** `DefenseView` entity with Selection Record Hash Binding; `defense_view_lifecycle_state` state machine (4 values); `regeneration_reason_code` enum (4 values); §13.11 SidePeek + dedicated page surface; watermarked-PDF export pipeline (Convex storage + serverless render → signed URL with 7-day TTL); plan-gated rendering (Solo / Free: watermarked preview only; Starter+: full PDF); regeneration throttle (≤1 per 60s per Workspace per user); cross-console firewall (no seller-console read access); five Appendix I error codes; two §31 webhook events (`defense_view.generated`, `defense_view.regenerated`) with HMAC-SHA256, retry, DLQ; PostHog event registration (`defense_view.generated`, `defense_view.regenerated`, `defense_view.regenerated_due_to_source_change`); audit logging per §13.11.10; Mode-aware copy (Solo and Team variants) per M02.3 contract. Per Master Spec §13.11 / §4.5.x / §21.4 / Appendix C / Appendix G / Appendix I / Appendix J / Appendix K / Appendix M.
- **Dependencies:** P08, P04 (EvaluationPulseEvent, IntelligenceCache, DefenseView), P06, P19 (Sonnet `defense_view_generate` capability), P02 (M02.3 Single-Operator Mode for Mode-aware surface routing)
- **Milestones:** M11.1: Analytics & Pulse | M11.2: Selection Report & Intelligence Dashboard | **M11.3: Defense View (Phase 14.16)**
- **Issues:** ~30 (~16 baseline + ~14 Phase 14.16 net-new for M11.3)

### P12: Policy Ingestion & Templates
- **Initiative:** I2 | **Team:** Buyer Experience
- **Purpose:** Template library and AI-powered policy ingestion.
- **Scope:** Template Library (browse curated+custom, detail preview, apply to workspace, create from completed workspace), policy ingestion page (upload, framework detection, extracted requirements table, batch amendment modal), deduplication UI, traceability mapping UI.
- **Dependencies:** P06, P19.M19.1 (agent infra for policy AI), P04 (Template schema)
- **Milestones:** M12.1: Template Library | M12.2: Policy Ingestion UI (blocked by P19)
- **Issues:** ~12

### P13: Bid Workspaces & Responses
- **Initiative:** I3 | **Team:** Seller Experience
- **Purpose:** Seller bid workspace and response management.
- **Scope:** Bid Workspace CRUD, requirement mirroring (sync ≤5s Phase 6), overview (metadata, team, progress stepper, tasks), response editor (rich text, markdown, KB attach, amendment handling, auto-save), status tracking (unanswered/draft/submitted), bulk submit, phase-lock (Phase 10+ read-only), advisory lock (10min), bid tasks (CRUD, assignment, status), bid schedule visualization, withdrawal flow, Seller Q&A page, NDA Review page (seller-side).
- **Dependencies:** P07.M07.2, P04 (Bid schemas)
- **Milestones:** M13.1: Bid Workspace & Response Editor | M13.2: Tasks, Schedule, Q&A & NDA
- **Issues:** ~20

### P14: Knowledge Base & Document Library
- **Initiative:** I3 | **Team:** Seller Experience
- **Purpose:** Seller KB, Document Library, Firecrawl.
- **Scope:** KB entry CRUD, list with health, detail (decay viz, usage, versions), Document Library (CRUD, expiration, version chains, categories), staleness model (confidence_modifier, review_due/overdue/stale states), Health Dashboard, review workflow, Firecrawl (source config, execution, chunking, dedup, review queue, re-crawl change detection).
- **Dependencies:** P04 (KB, CrawlSource, CrawlPage schemas), P05 (RAG)
- **Milestones:** M14.1: KB CRUD & Health | M14.2: Document Library & Firecrawl
- **Issues:** ~16

### P15: Seller Profile & Capabilities
- **Initiative:** I3 | **Team:** Seller Experience
- **Purpose:** Seller Profile and Capability Declarations.
- **Scope:** Profile page (info, logo, certs, verification tiers), tier progression (Basic→Verified→Certified), Capability Declarations CRUD (name, category, description, maturity, evidence), KB-to-Capability suggestion UI, batch actions.
- **Dependencies:** P04 (SellerProfile, CapabilityDeclaration schemas)
- **Milestones:** M15.1: Profile & Capabilities
- **Issues:** ~10

### P16: Seller Console Shell & Onboarding
- **Initiative:** I3 | **Team:** Seller Experience
- **Purpose:** Seller navigation, dashboard, inbox, onboarding.
- **Scope:** Seller sidebar, Dashboard (bids summary, pending actions, KB health, marketplace), Inbox (notification feed, categories), Onboarding wizard (7 steps: invitation, sign up, account link, profile setup, NDA review, capabilities, KB setup), setup checklist widget.
- **Dependencies:** P03 (shell), P02 (seller roles)
- **Milestones:** M16.1: Dashboard, Inbox & Nav | M16.2: Onboarding Wizard
- **Issues:** ~10

### P17: Marketplace Core
- **Initiative:** I4 | **Team:** Buyer Experience
- **Purpose:** Marketplace browse, search, listings, EOI.
- **Scope:** Browse page (categories, listing cards, filters: industry/location/cert/capability/tier), search (fuzzy, Boolean, phrase), listing detail (profile, capabilities, pricing), EOI submission (workspace title, summary, capability checklist, timeline), EOI review, match scoring (Enterprise), buyer-side nav entry.
- **Dependencies:** P07.M07.2, P15.M15.1, P05 (search)
- **Milestones:** M17.1: Browse, Search & Detail | M17.2: EOI & Match Scoring
- **Issues:** ~14

### P18: Marketplace Seller Integration
- **Initiative:** I4 | **Team:** Seller Experience
- **Purpose:** Seller listing management and EOI response.
- **Scope:** Listing create/edit (title, description, features, pricing, certs, integrations), status management (draft/published/archived), EOI response (accept/decline/request info), controlled vocabulary (seller-proposed, moderation queue).
- **Dependencies:** P15, P17
- **Milestones:** M18.1: Listing Management & EOI Response
- **Issues:** ~10

### P19: Agent Infrastructure & Buyer Capabilities
- **Initiative:** I5 | **Team:** Intelligence
- **Purpose:** Agent infrastructure and buyer-side AI capabilities.
- **Scope:** Claude API, model routing (Opus/Sonnet/Haiku), token budgets (Free 50K/Business 500K/Enterprise 5M), confidence thresholds (configurable), guardrails (factual filtering, vendor name validation), error handling (retry, graceful degradation, truncation), Custom Agent Instructions (per-team, sandboxed, max 50, applied ≤60s). Capabilities: #1 Policy Parsing (Opus), #2 Deduplication (Haiku), #3 Traceability (Sonnet), #4 Triage Auto-Mapping (Haiku), #5 Requirement Splitting (Sonnet), #6 Vendor Invite Suggestion (Sonnet, Enterprise), #9 Q&A Answer Suggestion (Sonnet, Business+), #10 Pre-Scoring (Sonnet, Business+), #11 Disagreement Insight (Sonnet, Business+), #12 Demo Focus Brief (Sonnet, Business+), #13 "What Would Flip" (Sonnet, Business+), #14 TCO Analysis Narrative (Sonnet, Business+), #15 Sensitivity Narrative (Sonnet, Enterprise), #16 Org Intelligence Briefing (Sonnet, Business+), #19 Pulse Digest (Sonnet, all), #20 SLA Escalation (rule-based, all), #21 Comment Summary (Haiku, all). Agent cost dashboard UI. Agent error state UIs (rate limit, token exhaustion, plan gate, parse failure, timeout).
- **Dependencies:** P04, P05 (RAG), consuming features P06–P12
- **Milestones:** M19.1: Agent Infrastructure | M19.2: Buyer Capabilities
- **Issues:** ~34

### P20: Agent Seller Capabilities
- **Initiative:** I5 | **Team:** Intelligence
- **Purpose:** Seller-side AI capabilities.
- **Scope:** #7 KB-to-Response Suggestion (Haiku, all), #8 Evidence Parsing (Sonnet, all), #17 KB Staleness Detection (Haiku, all), #18 KB-to-Capability Suggestion (Haiku, all), Firecrawl agent integration (crawl scheduling, page processing, dedup).
- **Dependencies:** P14, P19.M19.1
- **Milestones:** M20.1: Seller Capabilities
- **Issues:** ~12

### P21: Billing, Plans & Entitlements
- **Initiative:** I6 | **Team:** Platform
- **Purpose:** Stripe billing, plan enforcement, and the Solo-tier billing surface (single-Card surface, throttling toast, surface hide list, capability-registry envelope fields, telemetry events, refund-window logic, cross-console envelope isolation).
- **Scope:** Stripe integration (checkout, subscriptions, invoices, usage metering), plan enforcement middleware, entitlement registry, overage billing (Business), 14-day trial (no CC), upgrade/downgrade with proration, plan comparison page, agent token metering, invoice history. **Net-new (Phase 14.16):** Buyer Solo + Seller Solo plan-tier registration with three Stripe SKUs each (monthly subscription $59 / annual $49, per-evaluation $199 one-time, per-bid $199 one-time); single-Card billing surface in three variants (Subscription, Per-evaluation, Per-bid) per UX §8.1.2 with full state catalog; 14-day refund-window logic for per-eval / per-bid charges (refundable while Workspace status is `draft`; non-refundable once any phase advancement occurs); §44.6 Surface Hide List enforcement (AIWallet widget, value-dollars rate-card, overage configuration, auto-topup, AIOperation per-call cost, OutcomeContract surface, CapabilityRegistry surface, CostBaseRecalculationLog surface MUST NOT render on Solo); single throttling-toast surface fired once per envelope window when `low_priority_background` capabilities cross 80% envelope; First-Pass RFP Generator (`solo_envelope_no_block=true`) exempt; CapabilityRegistryEntry fields (`surface_throttling_class`, `solo_envelope_override_value_cents`, `solo_envelope_no_block`); AIOperation flag (`solo_envelope_blocked`); EnvelopeCounter engine record per `(org_id, console, envelope_window_id)`; cross-console envelope isolation (Buyer Solo + Seller Solo Orgs see two distinct billing surfaces and two independent envelopes per §34.10.3); four Ops-only telemetry events (`solo.envelope.throttling_engaged`, `solo.envelope.throttling_cleared`, `solo.envelope.exhausted`, `solo.capability.envelope_no_block_invoked`) routed to Ops only — never to Solo-Org webhook subscribers, in-app inbox, or email. Per Master Spec §34.1.1 / §34.1.2 / §34.2.1 / §34.2.2 / §34.2.5 / §34.10.3 / §34.12.6 / §34.12.8 / §44.6 / §4.8.1 / §4.8.2 / Appendix J / Appendix M / UX §8.1.2 / BPS v3 + SPS v3.
- **Dependencies:** P02 (org with plan_tier; M02.3 Single-Operator Mode for `evaluation_owner_mode`-aware routing), P04 (Stripe SKU registration, refund-window storage, EnvelopeCounter, CapabilityRegistryEntry field extensions), P19 (capability-registry `solo_envelope_no_block` honored by First-Pass RFP routing), P22 (engine telemetry Ops-routing + Solo-tier email templates), P03 (Solo-Tier Billing Card variant)
- **Milestones:** M21.1: Stripe & Plan Enforcement | M21.2: Trial, Upgrade & Metering | **M21.3: Solo Tier Billing Surface (Phase 14.16)**
- **Issues:** ~30 (~14 baseline + ~16 Phase 14.16 net-new for M21.3)

### P22: Notifications & Email
- **Initiative:** I6 | **Team:** Platform
- **Purpose:** Complete notification system.
- **Scope:** Notification delivery system, preference schema (per-event×per-channel×per-workspace), quiet hours, DND, entity mute (24h), Loops.so integration, in-app center (Inbox, bell popover, unread, mark-read), Slack integration (OAuth, channels, events, fallback), Teams integration, all email templates (21+ types: phase advancement, SLA breach, amendment, reverification, NDA request, KB stale, doc expiry, scoring complete, response received, trial expiring, plan downgrade, Pulse digest, mention, invitation, etc.), notification batching for daily/weekly digests.
- **Dependencies:** P04 (Notification, NotificationPreference schemas)
- **Milestones:** M22.1: Infrastructure & Preferences | M22.2: Email Templates & Channels
- **Issues:** ~22

### P23: Security & Compliance Hardening
- **Initiative:** I6 | **Team:** Platform
- **Purpose:** Production security and compliance.
- **Scope:** CSP headers, Markdown sanitization (DOMPurify), CORS config, auth hardening (rate limit, lockout, CAPTCHA), session management (timeout, multi-device, concurrent limits), IP restrictions (Enterprise), DSAR export (JSON, 30 days), data anonymization, account closure (30-day grace), API token rotation (90-day Enterprise), domain governance, custom branding (Enterprise: logo, colors, domain), Perplexity Search API (Enterprise).
- **Dependencies:** P02, P04, all feature projects
- **Milestones:** M23.1: Sanitization, CORS & Auth Hardening | M23.2: Compliance & Enterprise Features
- **Issues:** ~18

### P24: QA, Performance & Launch Prep
- **Initiative:** I6 | **Team:** Platform
- **Purpose:** QA, performance, accessibility, launch, Appendix M maintenance gate (CI + process enforcement of Principle 9).
- **Scope:** E2E tests (Playwright: auth, requirements, scoring, phases, billing, marketplace), a11y audit (WCAG 2.1 AA: contrast, keyboard, focus, aria, touch targets, screen reader, reduced-motion), perf optimization (p95 <500ms, <1s page load, <500KB JS), PostHog event schema + per-feature instrumentation + feature flags, Statuspage.io, Zendesk, data seeds (templates, plans, admin), env config, API docs generation, Phase 13 exports (Jira/Linear/Asana/Azure DevOps), Salesforce sync, Zapier/Make webhooks. **Net-new (Phase 14.16):** Appendix M maintenance gate enforcement — PR template checklist line item ("Appendix M row added or updated"); CI gate `appendix_m_engine_to_surface_completeness` (deploy-time validator, blocks merge if a new engine concept lands without a corresponding Appendix M row in the same commit); CI gate `appendix_m_no_inline_engine_concepts_in_ux_spec` (blocks merge if `UX_Design_of_Sourcera.md` references an engine concept not in Appendix M); CI gate `appendix_m_no_orphan_engine_concept` (weekly job surfacing Appendix M rows that no longer resolve to a live Master Spec section); engineering convention published in `/AGENTS.md` and per-PR review checklist; adversarial-review pass (Phase 14.19) treats Appendix M coverage as a P0 check per Appendix M.2 gate #3. Coordinated with Phase 14.18 CI-gate authoring track (validators authored there; enforcement gate ships here at launch readiness).
- **Dependencies:** All feature projects; Phase 14.18 CI-gate authoring track (validators must exist before the gate can enforce)
- **Milestones:** M24.1: E2E, A11y & Performance | M24.2: Analytics, Integrations & Launch | **M24.3: Appendix M Maintenance Gate (Phase 14.16)**
- **Issues:** ~34 (~28 baseline + ~6 Phase 14.16 net-new for M24.3)

---

## 5. Milestone Map

### P01: Repo, Infra & DevOps

**M01.1: Repo & CI Green**
- Entry: Initiative I1 started.
- Exit: Next.js 16 app builds, deploys to Vercel preview, Convex project provisioned, CI runs lint+type-check+test+build on every PR, all checks green.

**M01.2: Observability Live**
- Entry: M01.1 complete.
- Exit: Pino structured logging producing JSON to stdout. Datadog agent receiving metrics. Sentry capturing errors with source maps. OpenTelemetry traces visible in Datadog APM. Environment variables configured for dev/staging/prod.

### P02: Auth, Identity & RBAC

**M02.1: Auth & Org Shell**
- Entry: P01 M01.1 complete.
- Exit: User can sign up, sign in, sign out via WorkOS. Org CRUD works. User/Team CRUD works. Session management with configurable timeout. MFA TOTP/WebAuthn enrollment flow functional.

**M02.2: RBAC, Workspace Lifecycle & Phase Pipeline**
- Entry: M02.1 complete.
- Exit: All org roles (Owner/Admin/Member) enforced at API level. All buyer workspace roles (Owner/EvalLead/Evaluator/Scorer/Guest×4) enforced. All seller roles (BidOwner/Contributor/Viewer + Team Lead) enforced. Marketplace roles enforced. Workspace CRUD with status lifecycle. Phase pipeline state machine operational with idempotent advancement. Phase gates for Phase 2 entry, Phase 6 entry, Phase 9 exit (snapshot), Phase 10 entry (response lock), Phase 12 (score lock), Phase 13 (archival) all validated. SLA timer creation on requirement assignment, expiry detection, pre-breach warning at configurable threshold. Failed RBAC returns 403 with audit log entry.

**M02.3: Single-Operator Mode (Phase 14.16, v7.1.0 net-new)**
- Entry: M02.2 complete.
- Exit: `Workspace.evaluation_owner_mode ∈ {solo, team}` registered with default-derivation function (Solo / Free → `solo`, Starter+ → `team`); composite index `(org_id, evaluation_owner_mode, status)` created per §4.3.1. Workspace Settings mode-switch UI live, with Team→Solo transition guard returning `evaluation_owner_mode_team_to_solo_blocked_stakeholders_present` when stakeholders or guests are present. Phase Advancement endpoint accepts `soft_gates_enabled=true` request flag in Solo Mode and rejects with `phase_advancement_soft_gates_not_permitted_in_team_mode` in Team Mode. Soft-gate advancement emits `phase_advanced_with_unmet_gates` audit event with `trigger_reason ∈ {solo_skip, team_override}`. `workspace_evaluation_owner_mode_changed` audit event emitted on every mode transition with `trigger_reason ∈ {operator_initiated, automatic_team_threshold_reached}`. Auto-promote Solo→Team rule fires when stakeholder count or guest count crosses §2.8.5 thresholds. Mode-driven surface suppression contract documented and enforced at the surface layer: stakeholder cohorts, multi-stakeholder Q&A scaffolding, divergence detection, Pulse digest emails, Pulse Inbox card, SLA-timer surfaces, and stakeholder-invite affordances are suppressed in Solo Mode while engine-side records continue to accrue. Cross-console firewall: `evaluation_owner_mode` MUST NOT appear in any Console Bridge Event payload, seller-visible API response, Marketplace Listing serialization, or Public Pricing API output. Per Master Spec §2.8 / §3.13 / §4.3.1 / §10.16 / §32 / Appendix J / Appendix M.

### P03: Design System & App Shell

**M03.1: Design Tokens & Core Components**
- Entry: P01 M01.1 complete.
- Exit: All design tokens (typography, colors, spacing, elevation, borders, z-index, motion, forms) implemented as CSS custom properties with light/dark mode. All core components (Button through Tabs — ~28 components) implemented with Storybook documentation, prop types, and accessibility attributes. Components pass axe-core automated checks.

**M03.2: Advanced Components**
- Entry: M03.1 complete.
- Exit: All advanced components (~18 components: SidePeek through PlanComparisonTable) implemented with documentation. MarkdownEditor renders CommonMark with sanitized output. CommandPalette opens on Cmd+K with fuzzy search, keyboard nav, and MRU. FileUpload handles drag-drop with validation. DataTable supports 10K rows with virtualization at <200ms render.

**M03.3: App Shell, Navigation & Error Handling**
- Entry: M03.2 complete + P02 M02.1 (auth context available).
- Exit: Buyer sidebar renders all nav items with phase-gating and plan-gating. Seller sidebar renders all nav items. Console switcher functional. Page header with breadcrumbs renders. Responsive layouts work at desktop/tablet/mobile breakpoints. Keyboard shortcut overlay (`?`) works. Error pages (404/403/500) render. Error boundary catches React errors. Optimistic mutation rollback handler reverts UI on server rejection with toast. Offline banner appears on network loss.

### P04: Core Data Layer & API

**M04.1: Core Schemas**
- Entry: P01 M01.1 (Convex), P02 M02.2 (RBAC middleware).
- Exit: All ~36 entity schemas defined in Convex with correct field types, indexes, and FK relationships. TypeScript types exported and importable by consuming code. Schema validation tests pass.

**M04.2: CRUD Mutations & Queries**
- Entry: M04.1 complete.
- Exit: CRUD mutations for all entities with RBAC enforcement. Response CRUD with full status lifecycle (draft→submitted→received→acknowledged). Phase gate mutations for all critical transitions. Immutable snapshot creation at Phase 9 exit. Score lock at Phase 12 entry. Workspace archival at Phase 13. Workspace cancellation with 30-day grace period. Audit logging for all mutations (action, entity, user, timestamp, old/new values).

**M04.3: API Layer, Webhooks & File Upload**
- Entry: M04.2 complete.
- Exit: API key system with fine-grained scopes. Cursor-based pagination (default 50, max 250, 24h cursor TTL). Rate limiting (soft 5K/hr, hard 10K/hr, burst 100/min). Webhook delivery with HMAC-SHA256 signing, retry (5x exponential), dead letter queue. File upload via Convex file storage with virus scanning integration, size validation (<10MB), type validation (PDF/DOCX/XLSX/PNG/JPG). Attachment CRUD. API latency <100ms p95 for read endpoints.

### P05: Real-Time & Search Infrastructure

**M05.1: Presence & OT**
- Entry: P04 M04.1 complete.
- Exit: Convex Presence heartbeat operational (500ms cursor updates, 5s disconnect grace). Idle detection at configurable threshold. Cursor tracking returns user ID + position. Graceful reconnection after network interruption. Convex OT enabled for Use Case description and requirement text fields. Concurrent edits resolve without data corruption. Undo/redo works.

**M05.2: Search & RAG**
- Entry: P04 M04.1 complete.
- Exit: Full-text search index covers requirement titles, descriptions, comments, responses, KB entries, vendor names. Search returns results <200ms with Boolean operators, phrase search, highlighted snippets. RAG vector index created with embedding model. KB entries indexed. Similarity search returns results above configurable threshold. Chunking strategy handles documents up to 500 pages.

### P06: Requirements & Use Cases

**M06.1: Use Case & Requirement CRUD + Matrix**
- Entry: P02 M02.2, P03 M03.2, P04 M04.2.
- Exit: Use Case CRUD with inline editing. Requirement CRUD with all fields (statement, acceptance criteria, type, granularity, scoring model, weight). Requirements Matrix renders as DataTable with inline editing, keyboard nav (J/K/L/Enter/Escape), bulk actions (Shift+Click, Cmd+A), column configuration. SidePeek detail for requirements. Use Case tabs. Filters, sort, group-by functional. Workspace Overview page renders with phase progress and Pulse placeholder. Workspace List page with grid/table view and filters.

**M06.2: Triage, Amendments & Phase-Lock**
- Entry: M06.1 complete.
- Exit: Triage queue renders in list and Kanban views with drag-drop reassignment. SLA timer integration shows countdown per item. Triage auto-mapping UI shows team suggestions with confidence badges. Phase-lock enforcement: Phases 1-5 full edit, Phases 6-9 amendments only (AmendmentBanner + DiffViewer + batch modal for ≥5), Phase 10+ read-only. Requirement splitting UI shows proposed splits with accept/reject. Empty states render per UX spec for all views.

**M06.3: Per-Vertical Eval Starters (Phase 14.16, v7.1.0 net-new)**
- Entry: M06.1 complete.
- Exit: `EvalStarter` entity registered (org-scoped + system-seeded) per §4.5.9 with full field table (id, org_id nullable for system-seeded, vertical, name, description, use_cases[], requirements[], rubric, longlist[], status, created_at, updated_at, created_by, updated_by, deleted_at). Appendix J `EvalVertical` enum registered with values `hr_people`, `finance`, `sales`, `engineering_devtools`, `it_security`, `operations_grc`. All six default verticals seeded as system records, each carrying a curated Use Case set, a Requirement library (3–5 high-value Requirements per Use Case with default scoring model + weight), a scoring rubric (FM / PM / DNM / EX guidance per Use Case), and a vendor longlist (8–15 candidates). §13.12 What Are You Evaluating? intake page renders the vertical picker, applies the chosen starter to a new Workspace within ≤2s p95, and stamps `Workspace.eval_starter_origin` with the source `EvalStarter.id`. Custom-vertical authoring gated to Workspace Owner. System-seeded starters are read-only and update via `eval_starter.updated` webhook on registry refresh. Empty-registry guard `eval_starter.empty_active_registry` fires when no starter is active for the operator's region — engine-only event, surface continues with universal §13.12 fallback. `workspace_created_from_eval_starter` audit event emitted per Workspace creation that originated from a starter. Per Master Spec §13.12 / §4.5.9 / Appendix J / Appendix C / Appendix M.

### P07: Vendor Management & Invitations

**M07.1: Vendor CRUD & List**
- Entry: P06 M06.1, P04 M04.2.
- Exit: Vendor entity CRUD. Vendor list page with status badges (invited/active/submitted/won/lost/disqualified). Vendor detail SidePeek with company info, response status, NDA status.

**M07.2: ITB, NDA & Shortlist**
- Entry: M07.1 complete.
- Exit: ITB creation and sending workflow. NDA workflow: send, vendor review, sign (checkbox acknowledgment), track status. Multiple NDA versions with re-signature. Shortlist management. Disqualification with required rationale (not shared with vendor). Voluntary withdrawal handling (confirmation, permanent, responses excluded from scoring).

### P08: Scoring System

**M08.1: Scoring Grid & Grading**
- Entry: P06 M06.1, P04 M04.2 (Score, Response schemas).
- Exit: Scoring Matrix renders grid with vendor columns × requirement rows. Grade entry via 1-4 keys (FM/PM/DNM/EX). Scoring Card SidePeek shows requirement + response + grade selector + notes. Score calculation correct: vendor-requirement, vendor-use-case (SUM grade×weight / SUM weight), blended score. Auto-scoring: Boolean→FM/DNM, pricing→TCO excluded. PM value configurable (0.1-0.9, default 0.6).

**M08.2: Collaborative Scoring & Immutability**
- Entry: M08.1 complete, P05 M05.1 (Presence).
- Exit: Collaborative scoring with presence indicators showing active reviewers. "Score Independently" toggle hides others' grades until submit. Append-only grade entries (never mutated). Divergence ≥0.3 triggers Disagreement Insight Card. Divergence ≥0.6 auto-escalates to UC Lead with 48h deadline. UC Lead resolution: accept average, override with justification, request re-evaluation. Override rate tracked per-UC and workspace-wide. Phase 12 entry locks all scores permanently (`scoring_locked_at` timestamp). Vendor response comparison view with side-by-side scroll sync and diff highlighting.

### P09: Scenarios & TCO

**M09.1: Scenario Modeling**
- Entry: P08 M08.1.
- Exit: Scenario CRUD. Weight override sliders per Use Case (0.0-5.0). Vendor/UC exclusion. Rubric overrides. Ranking with threshold. Comparison view (max 5 scenarios, matrix with rank+score per vendor). Sensitivity analysis chart. Simulation mode: S key enters, real-time recalc, Cmd+S saves, R resets.

**M09.2: TCO & Blended Scoring**
- Entry: M09.1 complete.
- Exit: TCO Use Case type. All pricing structures (flat/tiered/one-time/percentage/estimate-range/discount). Projection engine: multi-year (1-10, default 3), seat count, growth rate (0.0-0.5). TCO dashboard with year-by-year breakdown, cost per seat. Blended score incorporates TCO percentile × tco_value_weight.

### P10: Q&A, Comments & Collaboration

**M10.1: Comments & @Mentions**
- Entry: P06 M06.1, P04 M04.2.
- Exit: Threaded comments on requirements/responses. @mentions trigger notification. Unread tracking with badge. Comment CRUD with 15-min edit/delete window. Workspace Owner can edit/delete any comment. Comment Thread Summary button appears on threads ≥5 comments (UI ready; agent wiring in P19).

**M10.2: Q&A with Phase Gating**
- Entry: M10.1 complete, P04 M04.3 (file upload).
- Exit: Q&A thread CRUD (public/private visibility). Phase gating: Phases 6-7 editable both sides, Phase 8 vendor read-only, Phases 9-12 all read-only. Vendor question limit 50 per workspace with Enterprise +10 request flow. File attachments (PDF/DOCX/XLSX/PNG/JPG <10MB, virus scanned). Vendor identity masking toggle. Q&A search (full-text) and export (CSV). Q&A answer suggestion UI ready (agent wiring in P19).

### P11: Analytics, Pulse & Reporting

**M11.1: Analytics & Pulse**
- Entry: P08 M08.1, P06 M06.1.
- Exit: Workspace Analytics page with phase-aware metrics. Pulse Health Score calculated daily (formula: 0.3×SLA + 0.3×Scoring + 0.2×Response + 0.2×Velocity). Color thresholds (green ≥80, yellow 50-79, red <50). Pulse widget on dashboard with sparkline. Full Pulse view with signal breakdown bars, 7-day trend. Digest archive (12 weeks, CSV export).

**M11.2: Selection Report & Intelligence Dashboard**
- Entry: M11.1 complete, P08 M08.2.
- Exit: Selection Report generates at Phase 12 as PDF with vendor rankings, score summaries, TCO comparison, narrative sections, audit trail. Export to CSV/PDF/Excel. Intelligence Dashboard page: Business+ shows vendor history + efficiency metrics; Enterprise shows discrepancy analysis + predictive suggestions. Briefing document generation with 30-day TTL. Refresh/regenerate functional.

**M11.3: Defense View (Phase 14.16, v7.1.0 net-new)**
- Entry: M11.2 complete; P19 M19.1 complete (Sonnet routing); P02 M02.3 complete (Mode-aware surface routing).
- Exit: `DefenseView` entity registered with full field table (id, org_id, workspace_id, selection_record_id, selection_record_hash, lifecycle_state, plan_tier_at_generation, generated_by, generated_at, last_regenerated_at, regeneration_count, pdf_storage_id, pdf_signed_url_expires_at, content_blob, watermark_state, created_at, updated_at, created_by, updated_by, deleted_at). Selection Record Hash Binding implemented — DefenseView is bound to the Phase-12 finalized Selection Record by content hash; any subsequent Selection Record edit invalidates the bound DefenseView and triggers `defense_view.regenerated_due_to_source_change`. `defense_view_lifecycle_state` enum (4 values) registered in Appendix J. `regeneration_reason_code` enum (4 values: `operator_initiated`, `source_changed_manual_refresh`, `low_confidence_retry`, `source_hash_mismatch_auto`) registered in Appendix J. `defense_view_generate` capability registered in §21.4 / §4.8.2 with model = Sonnet, plan-gated per §5.11 (Solo / Free: watermarked preview only; Starter+: full PDF + watermark removal), with `solo_envelope_no_block=true` (post-decision deliverable). Three §13.11 API endpoints live: generate, regenerate (regeneration throttle ≤1 per 60s per Workspace per user), read. Two webhook events delivering with HMAC-SHA256 signing, idempotency via `event_id`, exponential backoff retry, DLQ after 5 failures. Five Appendix I error codes surfaced through standard error envelopes: `selection_record_not_finalized`, `regeneration_throttle`, `defense_view_capability_disabled`, `defense_view_archived_with_workspace`, `defense_view_cross_console_access`. Three PostHog events registered (`defense_view.generated`, `defense_view.regenerated`, `defense_view.regenerated_due_to_source_change`) per Appendix G. Audit logging per §13.11.10 active. UX surface live at §13.11.4 / §13.11.13 paths: SidePeek + dedicated page with watermarked PDF download for Solo / Free and full PDF for Starter+. Mode-aware copy per M02.3 contract (Solo and Team variants). PDF export pipeline live (Convex storage + serverless render → signed URL with 7-day TTL). Cross-console firewall: `defense_view_cross_console_access` rejects any seller-console attempt to read a buyer DefenseView. Per Master Spec §13.11 / §4.5.x / §21.4 / Appendix C / Appendix G / Appendix I / Appendix J / Appendix K / Appendix M.

### P12: Policy Ingestion & Templates

**M12.1: Template Library**
- Entry: P06 M06.1.
- Exit: Template Library page with grid/list view. Sourcera-curated templates visible. Custom template creation from completed workspace. Template detail preview. Apply template to new workspace (pre-populate UCs + Requirements). Template search/filter.

**M12.2: Policy Ingestion UI**
- Entry: P19 M19.1 (agent infrastructure).
- Exit: Policy ingestion page with document upload (PDF/DOCX, max 500 pages). Framework detection display with confidence score. Extracted requirements table (source, confidence, category). Batch amendment modal for ≥5 extracted requirements. Deduplication UI (merge/keep both/dismiss). Traceability mapping UI (view in source PDF).

### P13: Bid Workspaces & Responses

**M13.1: Bid Workspace & Response Editor**
- Entry: P07 M07.2, P04 M04.2.
- Exit: Bid Workspace CRUD. Requirement mirroring from buyer workspace within 5s of Phase 6. Overview with metadata, team, response progress stepper. Response editor with rich text, markdown, KB suggestion sidebar, amendment handling, auto-save. Status tracking (unanswered/draft/submitted). Bulk submit with partial success tracking. Phase-lock (Phase 10+ read-only). Advisory lock per response (10min, extendable 5min).

**M13.2: Tasks, Schedule, Q&A & NDA**
- Entry: M13.1 complete.
- Exit: Bid Task CRUD (title, description, assignee, due date, status). Task list in bid workspace. Bid schedule visualization. Seller Q&A page mirroring buyer Q&A within bid context. NDA Review page (seller-side: PDF viewer, checkbox signature, status tracking, multiple versions). Vendor voluntary withdrawal flow (confirmation, optional reason, permanent).

### P14: Knowledge Base & Document Library

**M14.1: KB CRUD & Health**
- Entry: P04 M04.2, P05 M05.2 (RAG).
- Exit: KB entry CRUD with all fields. KB list with health score indicators (green/yellow/red). KB entry detail with decay visualization, usage tracking, version history. Staleness model: confidence_modifier decays by age/review status, review_due at configurable cadence (default 90 days), review_overdue, flagged_stale. Health Dashboard showing overall KB health. Review workflow (approve/request changes/archive).

**M14.2: Document Library & Firecrawl**
- Entry: M14.1 complete.
- Exit: Document Library CRUD (title, category, expiration, version, file). Expiration tracking with advance warning (T-30 days). Version chains (new version flags active bids referencing old). Firecrawl source configuration (URL, depth, frequency, scope). Crawl execution with page chunking. Deduplication (Haiku ≥85% match). Review queue for crawled pages. Re-crawl change detection and re-verification flagging.

### P15: Seller Profile & Capabilities

**M15.1: Profile & Capabilities**
- Entry: P04 M04.2.
- Exit: Seller Profile page with all fields (name, logo, description, website, location, certs). Verification tier display (Basic/Verified/Certified). Tier progression UX. Capability Declarations CRUD (name, category, description, maturity, evidence files). KB-to-Capability suggestion UI (placeholder; agent wiring in P20). Inline editing, batch actions.

### P16: Seller Console Shell & Onboarding

**M16.1: Dashboard, Inbox & Nav**
- Entry: P03 M03.3 (shell), P02 M02.1.
- Exit: Seller sidebar navigation with all items. Dashboard with active bids, pending actions, KB health, marketplace presence. Inbox with notification feed, categories, mark-read. Empty states for all views.

**M16.2: Onboarding Wizard**
- Entry: M16.1 complete.
- Exit: 7-step wizard: invitation arrival → sign up → account linking → profile setup (verification checklist) → NDA review → capability declarations → KB setup. Progress stepper, skip logic. Setup checklist widget in sidebar, dismissible.

### P17: Marketplace Core

**M17.1: Browse, Search & Detail**
- Entry: P07 M07.2, P15 M15.1, P05 M05.2 (search).
- Exit: Marketplace browse page with category grid, listing cards (20/page), filters (industry, location, certification, capability, verification tier). Search: fuzzy, Boolean, phrase. Sort: relevance, tier, recent, alphabetical. Listing detail page with seller profile, capabilities, pricing, integrations, certifications.

**M17.2: EOI & Match Scoring**
- Entry: M17.1 complete.
- Exit: EOI submission (workspace title, summary ≤500 chars, capability checklist, timeline, contact). EOI review by seller (accept/decline/request info). Post-close: pending EOIs auto-rejected when listing closed. Match scoring (Enterprise): formula = matched capabilities / total scored requirements × 100%. Score displayed with tooltip showing matched capabilities.

### P18: Marketplace Seller Integration

**M18.1: Listing Management & EOI Response**
- Entry: P15 M15.1, P17 M17.1.
- Exit: Listing create/edit with all fields. Status management (draft/published/archived). EOI response management. Controlled vocabulary: seller-proposed capabilities enter moderation queue. Approval/rejection within 2-5 days.

### P19: Agent Infrastructure & Buyer Capabilities

**M19.1: Agent Infrastructure**
- Entry: P04 M04.2, P05 M05.2 (RAG).
- Exit: Claude API integration with model routing (Opus/Sonnet/Haiku). Token budget enforcement (Free 50K/Business 500K/Enterprise 5M). Confidence thresholds configurable per org (defaults: KB suggestions 70%, dedup 90%, evidence 60%, pre-scoring 65%, disagreement 50%). Guardrails: factual filtering, vendor name validation, no direct scoring recommendations. Error handling: retry with exponential backoff, graceful degradation, context window truncation. Agent attribution component renders [AI-Generated] label + confidence + "Was this helpful?" on all outputs. Custom Agent Instructions: per-team (max 50 rules, 5000 chars each), sandboxed, version-tracked, applied within 60s.

**M19.2: Buyer Capabilities**
- Entry: M19.1 complete + consuming features exist.
- Exit: All 17 buyer-side capabilities operational. Each capability: backend function, frontend display component, plan gating, agent attribution, error state UI. Capabilities: Policy Parsing, Deduplication, Traceability, Triage Mapping, Requirement Splitting, Vendor Invite Suggestion, Q&A Answer Suggestion, Pre-Scoring, Disagreement Insight, Demo Focus Brief, "What Would Flip", TCO Narrative, Sensitivity Narrative, Org Intelligence Briefing, Pulse Digest, SLA Escalation, Comment Summary. Agent cost dashboard with per-capability token breakdown and remaining budget.

### P20: Agent Seller Capabilities

**M20.1: Seller Capabilities**
- Entry: P14 M14.1, P19 M19.1.
- Exit: KB-to-Response Suggestion (Haiku: suggestions within 2s, "Use This" pre-fill). Evidence Parsing (Sonnet: extract key claims from attachments with quotes). KB Staleness Detection (Haiku: daily background job, health flags). KB-to-Capability Suggestion (Haiku: scan KB, suggest capability declarations with confidence). Firecrawl agent: crawl scheduling, page processing, dedup against existing KB entries.

### P21: Billing, Plans & Entitlements

**M21.1: Stripe & Plan Enforcement**
- Entry: P02 M02.1 (org with plan_tier).
- Exit: Stripe checkout creates subscription. Plan enforcement middleware checks plan tier before every gated mutation and returns 403 with plan gate reason. Entitlement registry maps every gated feature to minimum plan tier. Free/Business/Enterprise limits enforced (workspaces, members, requirements, vendors, etc.). Failed payment handling (grace period, downgrade notification).

**M21.2: Trial, Upgrade & Metering**
- Entry: M21.1 complete.
- Exit: 14-day Business trial (no CC required). Upgrade flow with proration. Downgrade flow with feature access reduction. Plan comparison page. Agent token metering (real-time usage tracking, overage billing for Business at $0.01/1K). Invoice history page. Usage dashboard.

**M21.3: Solo Tier Billing Surface (Phase 14.16, v7.1.0 net-new)**
- Entry: M21.1 complete, M21.2 complete; M02.3 complete (`evaluation_owner_mode`-aware surface routing).
- Exit: Buyer Solo + Seller Solo plan tiers registered as Stripe products with three SKUs each (monthly subscription $59 / annual $49 per BPS / SPS v3, per-evaluation $199 one-time, per-bid $199 one-time). Plan enforcement middleware accepts `plan_tier ∈ {buyer_solo, seller_solo}` and applies §5.11 entitlement matrix per Phase 14.9. Single-Card billing surface live in three variants (Subscription, Per-evaluation, Per-bid) per UX §8.1.2 with full state catalog (Loading / Empty / Error / Refund-window-exceeded / Throttling engaged / Throttling cleared) and accessibility (WCAG 2.1 AA per §11.6). 14-day refund-window logic implemented per §34.2.5: per-evaluation and per-bid charges refundable while Workspace status is `draft`; non-refundable once any phase advancement occurs. Cross-console isolation: Buyer Solo and Seller Solo wallets / envelopes / billing surfaces are independent — a User-Org pair holding both Buyer Solo and Seller Solo Orgs sees two distinct billing surfaces and two independent envelopes per §34.10.3 and §44.6 envelope per `(org_id, console)`. Surface Hide List (§44.6.1) enforced: AIWallet widget, value-dollars rate-card visibility, overage configuration, auto-topup configuration, AIOperation per-call cost, OutcomeContract surface, CapabilityRegistry surface, CostBaseRecalculationLog surface MUST NOT render on Solo. Four §44.6.5 engine telemetry events (`solo.envelope.throttling_engaged`, `solo.envelope.throttling_cleared`, `solo.envelope.exhausted`, `solo.capability.envelope_no_block_invoked`) route to Ops only — never to Solo-Org webhook subscribers, in-app inbox, or email (enforced by CI gate `solo_telemetry_no_customer_routing` from Phase 14.18). Throttling toast surface fires once per envelope window when `low_priority_background` capabilities cross the 80% envelope threshold; First-Pass RFP Generator (`solo_envelope_no_block=true`) exempt. CapabilityRegistryEntry fields registered: `surface_throttling_class` (Appendix J enum: `active_workflow`, `low_priority_background`, `never_throttle`), `solo_envelope_override_value_cents`, `solo_envelope_no_block`. AIOperation `solo_envelope_blocked` boolean flag registered. EnvelopeCounter engine record per `(org_id, console, envelope_window_id)` populated and drives §44.6.4 throttling. Per Master Spec §34.1.1 / §34.1.2 / §34.2.1 / §34.2.2 / §34.2.5 / §34.10.3 / §34.12.6 / §34.12.8 / §44.6 / §4.8.1 / §4.8.2 / Appendix J / Appendix M / UX §8.1.2 / BPS v3 + SPS v3.

### P22: Notifications & Email

**M22.1: Infrastructure & Preferences**
- Entry: P04 M04.2 (Notification schemas).
- Exit: Notification delivery system (create, route, deliver). Preference schema: per-event × per-channel (in-app/email/Slack) × per-workspace. Quiet hours (start/end + timezone). DND mode (1/4/8h/custom). Entity mute (24h). In-app notification center: bell icon popover with unread count, Inbox page with category filtering, mark-read. Notification batching for daily/weekly digests.

**M22.2: Email Templates & Channels**
- Entry: M22.1 complete.
- Exit: Loops.so integration with all transactional email templates (21+ types: phase advancement, SLA pre-breach, SLA breach, amendment published, reverification required, NDA signature request, KB stale, doc expiry, scoring complete, response received, trial expiring T-3/T-1, plan downgrade, Pulse digest, mention, invitation, disqualification notice, withdrawal confirmation, EOI submission, EOI response). Slack integration: OAuth, channel selection, event filtering, retry 3x with email fallback. Microsoft Teams integration. All templates tested with sample data.

### P23: Security & Compliance Hardening

**M23.1: Sanitization, CORS & Auth Hardening**
- Entry: P02, P04 complete.
- Exit: CSP headers set (script-src 'self', frame-src 'none', img-src 'self'). Markdown sanitization via DOMPurify (allowlist: b/em/u/code/pre/h1-h6/blockquote/ul/ol/li/a/hr/table). CORS with origin whitelist, credential handling, preflight caching. Auth endpoint hardening: 5-attempt lockout, rate limiting, CAPTCHA on repeated failures. Session timeout (configurable, default 24h). Concurrent session limit enforcement. API token rotation reminder (90-day for Enterprise).

**M23.2: Compliance & Enterprise Features**
- Entry: M23.1 complete.
- Exit: DSAR export generates JSON (account profile, audit logs, comments, scores, authored requirements) within 30 days. Data anonymization for right-to-erasure preserves audit trail integrity. Account closure with 30-day grace period, password confirmation, auto-delete on day 31. IP restriction enforcement (Enterprise): CIDR notation, configuration UI, enforcement middleware. Domain governance: claimed corporate domains block unsanctioned org creation. Custom branding (Enterprise): logo upload, primary color override with WCAG contrast validation, custom domain (CNAME, auto SSL). Perplexity Search API integration (Enterprise).

### P24: QA, Performance & Launch Prep

**M24.1: E2E, A11y & Performance**
- Entry: All feature projects complete.
- Exit: Playwright E2E suite covers: auth flows, requirement CRUD, scoring workflow, phase pipeline (all 13 phases), billing checkout/enforcement, marketplace EOI. A11y audit: all pages pass WCAG 2.1 AA (contrast ≥4.5:1, keyboard nav, focus visible, aria-labels, 48×48px touch targets, skip-to-content, reduced-motion support, screen reader tested with NVDA/VoiceOver). Performance: p95 API <500ms, page load <1s first paint, <2s TTI, JS bundle <500KB gzipped.

**M24.2: Analytics, Integrations & Launch**
- Entry: M24.1 complete.
- Exit: PostHog event schema defined (workspace creation, phase advancement, score submission, template usage, agent interaction, export, marketplace browse, EOI, plan conversion). Per-feature instrumentation live. Feature flags configured per environment. Phase 13 exports: Jira Cloud (UC→Epic, Req→Issue), Linear (UC→Project, Req→Issue), Asana (task-level), Azure DevOps (work item mapping). Salesforce bidirectional account sync. Zapier/Make via webhook API. Statuspage.io configured with synthetic checks from 3+ geos. Zendesk integration. Data seed scripts: 6+ default templates, plan tier configuration, initial admin user creation.

**M24.3: Appendix M Maintenance Gate (Phase 14.16, v7.1.0 net-new)**
- Entry: M24.1 substantially complete; M24.2 substantially complete; Phase 14.18 CI-gate authoring track has landed the deploy-time validators (`appendix_m_engine_to_surface_completeness`, `appendix_m_no_inline_engine_concepts_in_ux_spec`, `appendix_m_no_orphan_engine_concept`).
- Exit: PR template carries the "Appendix M row added or updated" checklist line item with reviewer rejection authority. CI gate `appendix_m_engine_to_surface_completeness` blocks merge if a PR introduces a new engine concept (entity, role, state, capability, plan-gated feature, webhook, API endpoint, enum value, error code) without a corresponding Appendix M row in the same commit. Engine-only concepts MUST be flagged "Internal-only, never surfaced" with documented rationale. CI gate `appendix_m_no_inline_engine_concepts_in_ux_spec` blocks merge if `UX_Design_of_Sourcera.md` references an engine concept that is not in Appendix M. CI gate `appendix_m_no_orphan_engine_concept` runs as a weekly scheduled job and surfaces Appendix M rows that no longer resolve to a live Master Spec section. Engineering convention published in `/AGENTS.md` and the per-PR review checklist (Build_Execution_Strategy.md §8.1) so Claude Code authors apply the rule on every change. Adversarial-review pass (Phase 14.19) treats Appendix M coverage as a P0 check per Appendix M.2 gate #3. v1 ship enforces Principle 9 from the first production commit forward. Per Master Spec Appendix M (full) / Appendix M.2 / Appendix M.3 / §3.13 (Principle 9) / `_integration/RECONCILIATION.md` Phase 14.2.

---

## 6. Cycle Strategy

### 6.1 What Belongs in Cycles

- Unblocked issues with complete acceptance criteria, assigned to a team member.
- Estimated at 1–5 points (8-point issues must be split first).
- Dependencies resolved (all `blocked by` issues are Done).

### 6.2 What Does Not Belong in Cycles

- Issues still blocked by unfinished dependencies.
- Issues missing acceptance criteria or implementation notes.
- Issues estimated at 8 points (must split).
- Open-ended research without time-bound deliverable (use spike label, max 1/cycle/team).

### 6.3 Staging Readiness

Before each cycle:
1. Team lead reviews backlog, moves unblocked issues to Todo.
2. Team lead verifies all Todo issues have acceptance criteria and dependencies resolved.
3. Team lead confirms total points ≤ 80% team velocity.
4. Cross-team blockers identified and escalated per protocol.

### 6.4 Rollover Risk Management

- At cycle end, any In Progress issue not completed is reviewed:
  - If <50% done → return to Backlog, reassess scope.
  - If ≥50% done → carry to next cycle with explicit re-inclusion.
- Carry-over issues count against next cycle's capacity.
- If a team carries over ≥30% of cycle points two cycles running, escalate to initiative owner for scope review.

### 6.5 Codex Execution in Cycles

- Codex issues (labeled `codex-ready`) are picked in strict dependency order.
- Each issue must be fully unblocked (all `blocked by` = Done).
- After Codex completes → In Review → human review within 24h.
- Merge before any dependent issue is picked up.
- If Codex output fails review → return to In Progress, team lead fixes or re-scopes.

### 6.6 Cross-Team Blocker Protocol

- **Daily:** 15-min cross-team standup for active blockers.
- **24h SLA:** Blocking team must unblock or provide workaround within 24h of escalation.
- **Weekly:** 30-min cross-project sync with all 4 team leads + initiative owners.
- **Escalation:** Blocked team lead → blocking team lead → initiative owner → project-wide reprioritization.

---

## 7. Issue Design Standard

### 7.1 Title Format

`[Layer] Verb + Object + Context`

Valid verbs: Define, Implement, Configure, Enforce, Integrate, Write, Add, Create, Wire, Build, Set up.

Examples:
- `[Schema] Define Score entity in Convex`
- `[Backend] Implement Response CRUD mutations with status lifecycle`
- `[Frontend] Implement Requirements Matrix table view with inline editing`
- `[Infra] Configure Datadog APM with OpenTelemetry traces`
- `[Integration] Wire Loops.so email delivery for SLA breach template`

### 7.2 Required Description Fields

Every issue must include: Purpose, Scope, Files/Paths, Dependencies, Implementation Notes, Acceptance Criteria, Testing Notes, Notification Trigger.

See templates in Section 1.10 and 1.11.

### 7.3 Acceptance Criteria

- Minimum 2 criteria per issue.
- Each independently verifiable (human or test can confirm pass/fail).
- No vague outcomes ("works well", "is fast"). Use specific thresholds.
- Example: "Scoring Matrix renders 100 requirements × 10 vendors in <1s" not "Scoring Matrix performs well."

### 7.4 When to Split

Split an issue if:
- Estimate is 8 points.
- Title contains "and" joining distinct implementation concerns.
- Issue touches both schema and frontend (split into schema → mutation → frontend).
- Issue covers both the creation UI and the display/consumption UI.
- Issue combines multiple unrelated mutation sets.

### 7.5 When to Create Sub-Issues

Use sub-issues when a parent naturally decomposes into 2–4 sequential steps:
- Schema → Mutation → Query for one entity.
- Shell/layout → Data binding → Interactive behavior for one page section.

Never nest deeper than one level.

### 7.6 Labels

Every issue must have at minimum:
- One Domain label
- One Layer label
- One Type label
- `codex-ready` or `human-only`
- Plan label if feature is plan-gated

### 7.7 Estimates

Every issue must be estimated before entering a cycle. Re-estimate if scope changes during implementation.

---

## 8. Full Build Breakdown

### 8.0 Issue Numbering

Issues are numbered sequentially within their project. Cross-project references use the full `P{nn}-{nnn}` format.

---

### P01: Repo, Infra & DevOps (14 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P01-001 | [Infra] Initialize Next.js 16 repo with TypeScript and App Router | 2 | P0 | platform, infra, feature | None | Yes |
| P01-002 | [Infra] Configure Convex project and connect to Next.js app | 2 | P0 | platform, infra, feature | P01-001 | Yes |
| P01-003 | [Infra] Configure Tailwind CSS with design token variables | 1 | P0 | platform, infra, feature | P01-001 | Yes |
| P01-004 | [Infra] Set up Vercel project with preview and production deployments | 2 | P0 | platform, infra, feature | P01-001 | Yes |
| P01-005 | [Infra] Configure CI pipeline (lint, type-check, test, build) on GitHub Actions | 3 | P0 | platform, infra, feature | P01-001 | Yes |
| P01-006 | [Infra] Configure Pino structured JSON logging | 1 | P1 | platform, infra, feature | P01-001 | Yes |
| P01-007 | [Infra] Integrate Datadog agent for metrics and APM | 2 | P1 | platform, infra, integration | P01-001 | Yes |
| P01-008 | [Infra] Integrate Sentry for error tracking with source maps | 2 | P1 | platform, infra, integration | P01-001 | Yes |
| P01-009 | [Infra] Configure OpenTelemetry tracing with Datadog exporter | 2 | P1 | platform, infra, integration | P01-007 | Yes |
| P01-010 | [Infra] Set up environment variable management for dev/staging/prod | 1 | P0 | platform, infra, feature | P01-001 | Yes |
| P01-011 | [Infra] Configure secret management for API keys and tokens | 1 | P1 | platform, infra, feature | P01-010 | Yes |
| P01-012 | [Infra] Set up ShadCN/UI with BaseUI integration | 2 | P1 | platform, infra, feature | P01-001, P01-003 | Yes |
| P01-013 | [Infra] Configure Playwright test runner in CI | 2 | P1 | platform, infra, qa | P01-005 | Yes |
| P01-014 | [Infra] Set up Storybook for component documentation | 2 | P2 | platform, infra, docs | P01-001, P01-012 | Yes |

---

### P02: Auth, Identity & RBAC (32 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P02-001 | [Backend] Integrate WorkOS SDK for sign-up and sign-in | 3 | P0 | platform, backend, feature | P01-002 | Yes |
| P02-002 | [Backend] Implement email/password authentication flow | 2 | P0 | platform, backend, feature | P02-001 | Yes |
| P02-003 | [Backend] Implement SSO/SAML authentication via WorkOS | 3 | P1 | platform, backend, feature, enterprise | P02-001 | Yes |
| P02-004 | [Backend] Implement MFA enrollment (TOTP + WebAuthn) | 3 | P1 | platform, backend, feature | P02-001 | Yes |
| P02-005 | [Backend] Implement SCIM provisioning endpoint stub | 2 | P2 | platform, backend, feature, enterprise | P02-001 | Yes |
| P02-006 | [Backend] Implement session management (timeout, multi-device, concurrent limits) | 3 | P1 | platform, backend, feature | P02-001 | Yes |
| P02-007 | [Schema] Define Organization entity in Convex | 2 | P0 | platform, schema, feature | P01-002 | Yes |
| P02-008 | [Schema] Define User entity in Convex | 2 | P0 | platform, schema, feature | P01-002 | Yes |
| P02-009 | [Schema] Define OrgMembership entity in Convex | 2 | P0 | platform, schema, feature | P02-007, P02-008 | Yes |
| P02-010 | [Schema] Define Team entity in Convex | 2 | P0 | platform, schema, feature | P02-007 | Yes |
| P02-011 | [Schema] Define Workspace entity in Convex | 2 | P0 | platform, schema, feature | P02-007 | Yes |
| P02-012 | [Schema] Define WorkspaceMembership entity in Convex | 2 | P0 | platform, schema, feature | P02-011, P02-008 | Yes |
| P02-013 | [Backend] Implement Organization CRUD mutations | 2 | P0 | platform, backend, feature | P02-007 | Yes |
| P02-014 | [Backend] Implement User profile CRUD mutations | 2 | P0 | platform, backend, feature | P02-008 | Yes |
| P02-015 | [Backend] Implement Team CRUD mutations | 2 | P0 | platform, backend, feature | P02-010 | Yes |
| P02-016 | [Backend] Implement Workspace CRUD mutations with status lifecycle | 3 | P0 | platform, backend, feature | P02-011 | Yes |
| P02-017 | [Backend] Implement WorkspaceMembership mutations (invite, join, remove, role change) | 3 | P0 | platform, backend, feature | P02-012 | Yes |
| P02-018 | [Backend] Implement OrgMembership mutations (invite, accept, remove, role change) | 2 | P0 | platform, backend, feature | P02-009 | Yes |
| P02-019 | [Backend] Implement org-level RBAC middleware (Owner/Admin/Member) | 3 | P0 | platform, backend, feature | P02-009 | Yes |
| P02-020 | [Backend] Implement buyer workspace RBAC (Owner/EvalLead/Evaluator/Scorer/Guest×4) | 3 | P0 | platform, backend, feature | P02-012, P02-019 | Yes |
| P02-021 | [Backend] Implement seller RBAC (BidOwner/Contributor/Viewer + Seller Team Lead) | 3 | P0 | platform, backend, feature | P02-019 | Yes |
| P02-022 | [Backend] Implement marketplace RBAC (Publisher/Viewer) | 2 | P1 | platform, backend, feature | P02-019 | Yes |
| P02-023 | [Backend] Implement guest permission profile enforcement (read_only/contributor/scorer/full_participant) | 3 | P0 | platform, backend, feature | P02-020 | Yes |
| P02-024 | [Backend] Implement phase pipeline state machine (13 phases, idempotent advancement) | 3 | P0 | platform, backend, feature | P02-016 | Yes |
| P02-025 | [Backend] Implement Phase 2 entry gate validation | 2 | P1 | platform, backend, feature, phase-1-3 | P02-024 | Yes |
| P02-026 | [Backend] Implement Phase 6 entry gate validation (shortlist confirmed) | 2 | P1 | platform, backend, feature, phase-4-5 | P02-024 | Yes |
| P02-027 | [Backend] Implement Phase 9 exit gate (immutable snapshot creation) | 3 | P1 | platform, backend, feature, phase-6-9 | P02-024 | Yes |
| P02-028 | [Backend] Implement Phase 10 entry gate (response lock) | 2 | P1 | platform, backend, feature, phase-10-11 | P02-024 | Yes |
| P02-029 | [Backend] Implement Phase 12 entry gate (score immutability lock) | 2 | P1 | platform, backend, feature, phase-12-13 | P02-024 | Yes |
| P02-030 | [Backend] Implement Phase 13 gate (contract upload, workspace archival) | 2 | P1 | platform, backend, feature, phase-12-13 | P02-024 | Yes |
| P02-031 | [Schema] Define SLATimer entity in Convex | 2 | P1 | platform, schema, feature | P02-011 | Yes |
| P02-032 | [Backend] Implement SLA timer system (creation, expiry detection, pre-breach warning, extension) | 3 | P1 | platform, backend, feature | P02-031 | Yes |
| P02-033 | [Schema] Add `evaluation_owner_mode` enum field to Workspace entity (composite index `(org_id, evaluation_owner_mode, status)`) | 2 | P0 | platform, schema, feature | P02-011 | Yes |
| P02-034 | [Backend] Implement Workspace `evaluation_owner_mode` default-derivation function (Solo / Free → `solo`, Starter+ → `team`) | 2 | P0 | platform, backend, feature | P02-033, P21-005 | Yes |
| P02-035 | [Backend] Implement Workspace mode-switch mutation with Team→Solo transition guard (rejects `evaluation_owner_mode_team_to_solo_blocked_stakeholders_present` when stakeholders/guests present) | 3 | P0 | platform, backend, feature | P02-033, P02-017 | Yes |
| P02-036 | [Backend] Extend Phase Advancement endpoint with `soft_gates_enabled` request flag (Solo: accept; Team: reject `phase_advancement_soft_gates_not_permitted_in_team_mode`) | 3 | P0 | platform, backend, feature | P02-024, P02-033 | Yes |
| P02-037 | [Backend] Implement `phase_advanced_with_unmet_gates` audit-event emission with `trigger_reason ∈ {solo_skip, team_override}` | 2 | P1 | platform, backend, feature | P02-036, P04-040 | Yes |
| P02-038 | [Backend] Implement `workspace_evaluation_owner_mode_changed` audit-event emission (`trigger_reason ∈ {operator_initiated, automatic_team_threshold_reached}`) | 2 | P1 | platform, backend, feature | P02-035, P04-040 | Yes |
| P02-039 | [Backend] Implement auto-promote Solo→Team rule on stakeholder/guest threshold crossover (§2.8.5) | 3 | P1 | platform, backend, feature | P02-035, P02-038 | Yes |
| P02-040 | [Backend] Enforce cross-console firewall on `evaluation_owner_mode` (MUST NOT appear in Console Bridge Event payload, seller-visible API response, Marketplace Listing serialization, Public Pricing API output) | 2 | P0 | platform, backend, feature | P02-033 | Yes |
| P02-041 | [Frontend] Implement Workspace Settings mode-switch UI (toggle, transition-guard error display, audit-event reflection) | 3 | P0 | platform, frontend, feature | P02-035, P03-007 | Yes |
| P02-042 | [Frontend] Wire mode-driven surface suppression contract (Pulse, SLA, stakeholder cohorts, multi-stakeholder Q&A scaffolding, divergence detection — engine-on / surface-off in Solo) | 3 | P0 | buyer, frontend, feature | P02-033, P11-003, P10-008 | No |

---

### P03: Design System & App Shell (50 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P03-001 | [Frontend] Implement design tokens as CSS custom properties (typography, colors, spacing, elevation, borders, z-index, motion) | 3 | P0 | buyer, frontend, feature | P01-003 | Yes |
| P03-002 | [Frontend] Implement dark mode token variants with system preference detection | 2 | P1 | buyer, frontend, feature | P03-001 | Yes |
| P03-003 | [Frontend] Implement form input tokens (heights, padding, borders, states, focus ring) | 2 | P0 | buyer, frontend, feature | P03-001 | Yes |
| P03-004 | [Frontend] Implement Button component (variants: primary, secondary, ghost, danger; sizes: sm, md, lg) | 2 | P0 | buyer, frontend, feature | P03-001 | Yes |
| P03-005 | [Frontend] Implement TextInput component with validation states | 1 | P0 | buyer, frontend, feature | P03-003 | Yes |
| P03-006 | [Frontend] Implement Textarea component with character count | 1 | P0 | buyer, frontend, feature | P03-003 | Yes |
| P03-007 | [Frontend] Implement Select/Dropdown component with search and keyboard nav | 2 | P0 | buyer, frontend, feature | P03-003 | Yes |
| P03-008 | [Frontend] Implement Checkbox, RadioGroup, Toggle components | 2 | P0 | buyer, frontend, feature | P03-003 | Yes |
| P03-009 | [Frontend] Implement DatePicker component with calendar popup | 2 | P1 | buyer, frontend, feature | P03-003 | Yes |
| P03-010 | [Frontend] Implement FormField wrapper (label, validation, error, help text) | 2 | P0 | buyer, frontend, feature | P03-005 | Yes |
| P03-011 | [Frontend] Implement Modal component (sm/md/lg/full variants, Esc close, Cmd+Enter submit) | 2 | P0 | buyer, frontend, feature | P03-001 | Yes |
| P03-012 | [Frontend] Implement Toast notification component (success/error/warning/info, 6s auto-dismiss) | 2 | P0 | buyer, frontend, feature | P03-001 | Yes |
| P03-013 | [Frontend] Implement Badge, StatusBadge, GradeBadge components | 2 | P0 | buyer, frontend, feature | P03-001 | Yes |
| P03-014 | [Frontend] Implement VerificationBadge component (Basic/Verified/Certified) | 1 | P1 | buyer, frontend, feature | P03-013 | Yes |
| P03-015 | [Frontend] Implement Avatar component with fallback initials | 1 | P0 | buyer, frontend, feature | P03-001 | Yes |
| P03-016 | [Frontend] Implement Chip, Tooltip, Skeleton, ProgressBar components | 2 | P0 | buyer, frontend, feature | P03-001 | Yes |
| P03-017 | [Frontend] Implement Breadcrumb component with truncation | 1 | P0 | buyer, frontend, feature | P03-001 | Yes |
| P03-018 | [Frontend] Implement Alert component (info/warning/error/success variants) | 1 | P0 | buyer, frontend, feature | P03-001 | Yes |
| P03-019 | [Frontend] Implement Card component with padding and elevation variants | 1 | P0 | buyer, frontend, feature | P03-001 | Yes |
| P03-020 | [Frontend] Implement Tabs component with keyboard nav | 1 | P0 | buyer, frontend, feature | P03-001 | Yes |
| P03-021 | [Frontend] Implement DataTable component (sortable, filterable, row-selectable, column config, virtualized) | 5 | P0 | buyer, frontend, feature | P03-001 | No |
| P03-022 | [Frontend] Implement SidePeek panel (420px, slide-in, Esc close, backdrop dismiss) | 3 | P0 | buyer, frontend, feature | P03-001 | Yes |
| P03-023 | [Frontend] Implement CommandPalette shell (Cmd+K, fuzzy search, keyboard nav, MRU) | 3 | P0 | buyer, frontend, feature | P03-001 | Yes |
| P03-024 | [Frontend] Implement CommandPalette search integration (entity search, full-text results) | 3 | P1 | buyer, frontend, feature | P03-023 | Yes |
| P03-025 | [Frontend] Implement MarkdownEditor (CommonMark, sanitized output, live preview, shortcuts) | 3 | P1 | buyer, frontend, feature | P03-001 | Yes |
| P03-026 | [Frontend] Implement FileUpload component (drag-drop, validation, progress) | 2 | P1 | buyer, frontend, feature | P03-001 | Yes |
| P03-027 | [Frontend] Implement DocumentViewer (PDF viewer with zoom, search, navigation) | 3 | P2 | buyer, frontend, feature | P03-001 | Yes |
| P03-028 | [Frontend] Implement DiffViewer (side-by-side text comparison with highlighting) | 2 | P1 | buyer, frontend, feature | P03-001 | Yes |
| P03-029 | [Frontend] Implement AgentAttribution component ([AI-Generated] label, confidence, feedback) | 2 | P1 | agent, frontend, feature | P03-001 | Yes |
| P03-030 | [Frontend] Implement InsightCard component (suggestion viz, reasoning, accept/dismiss) | 2 | P1 | agent, frontend, feature | P03-001 | Yes |
| P03-031 | [Frontend] Implement HealthScoreGauge component (0-100, trend indicator, color thresholds) | 2 | P1 | buyer, frontend, feature | P03-001 | Yes |
| P03-032 | [Frontend] Implement PricingBreakdown component (tiered viz, calculation details) | 2 | P2 | buyer, frontend, feature | P03-001 | Yes |
| P03-033 | [Frontend] Implement SLATimer component (countdown badge, green/yellow/red/pulsing) | 2 | P1 | buyer, frontend, feature | P03-001 | Yes |
| P03-034 | [Frontend] Implement PhaseAdvancer component (gate validation display, advance button) | 2 | P1 | buyer, frontend, feature | P03-001 | Yes |
| P03-035 | [Frontend] Implement AmendmentBanner component (yellow buyer, blue seller, view diff link) | 1 | P1 | buyer, frontend, feature | P03-001 | Yes |
| P03-036 | [Frontend] Implement TriageQueue component (list + Kanban views, drag-drop) | 3 | P1 | buyer, frontend, feature | P03-021 | Yes |
| P03-037 | [Frontend] Implement CrawlConfigPanel component (URL pattern, depth, frequency config) | 2 | P2 | seller, frontend, feature | P03-010 | Yes |
| P03-038 | [Frontend] Implement PlanComparisonTable component (feature matrix, tier highlighting) | 2 | P2 | platform, frontend, feature | P03-021 | Yes |
| P03-039 | [Frontend] Implement NotificationPreferences component (per-event toggles, channel selection) | 2 | P2 | platform, frontend, feature | P03-008 | Yes |
| P03-040 | [Frontend] Implement buyer sidebar navigation with phase-gating and plan-gating | 3 | P0 | buyer, frontend, feature | P03-001, P02-001 | Yes |
| P03-041 | [Frontend] Implement seller sidebar navigation | 2 | P0 | seller, frontend, feature | P03-001, P02-001 | Yes |
| P03-042 | [Frontend] Implement console switcher (Buyer↔Seller toggle, full nav reset) | 2 | P0 | platform, frontend, feature | P03-040, P03-041 | Yes |
| P03-043 | [Frontend] Implement page header pattern (breadcrumbs, title, action bar, toolbar) | 2 | P0 | buyer, frontend, feature | P03-017 | Yes |
| P03-044 | [Frontend] Implement responsive layouts (desktop 3-col, tablet 2-col, mobile single-col) | 3 | P1 | buyer, frontend, feature | P03-040 | Yes |
| P03-045 | [Frontend] Implement keyboard shortcut overlay (? key) | 2 | P2 | buyer, frontend, feature | P03-011 | Yes |
| P03-046 | [Frontend] Implement error pages (404, 403, 500) | 2 | P1 | platform, frontend, feature | P03-001 | Yes |
| P03-047 | [Frontend] Implement React error boundary wrapper | 1 | P1 | platform, frontend, feature | P03-001 | Yes |
| P03-048 | [Frontend] Implement EmptyState base component (illustration, heading, subtext, CTAs) | 1 | P0 | buyer, frontend, feature | P03-001 | Yes |
| P03-049 | [Frontend] Implement optimistic mutation rollback handler with toast feedback | 3 | P0 | platform, frontend, feature | P03-012 | Yes |
| P03-050 | [Frontend] Implement offline/network error detection banner | 2 | P1 | platform, frontend, feature | P03-018 | Yes |
| P03-051 | [Frontend] Implement PipelineSurface advanced component (four-step bar in Solo Mode, full per-phase chip ribbon in Team Mode, PS-01 through PS-12 acceptance criteria per UX §11.3) — wired into M03.2; consumes M02.3 `evaluation_owner_mode` (Phase 14.16, M02.3 cross-project consumer) | 3 | P0 | buyer, frontend, feature | P03-001, P02-033 | Yes |

---

### P04: Core Data Layer & API (48 issues + 4 Phase 14.16 cross-project consumer issues = ~52 total)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P04-001 | [Schema] Define UseCase entity in Convex | 2 | P0 | platform, schema, feature | P02-011 | Yes |
| P04-002 | [Schema] Define Requirement entity in Convex | 2 | P0 | platform, schema, feature | P04-001 | Yes |
| P04-003 | [Schema] Define RequirementVersion entity in Convex | 2 | P1 | platform, schema, feature | P04-002 | Yes |
| P04-004 | [Schema] Define Response entity in Convex | 2 | P0 | platform, schema, feature | P04-002 | Yes |
| P04-005 | [Schema] Define ResponseVersion entity in Convex | 2 | P1 | platform, schema, feature | P04-004 | Yes |
| P04-006 | [Schema] Define Score entity in Convex | 2 | P0 | platform, schema, feature | P04-002 | Yes |
| P04-007 | [Schema] Define EvaluationScenario entity in Convex | 2 | P1 | platform, schema, feature | P02-011 | Yes |
| P04-008 | [Schema] Define EvaluationPulseEvent entity in Convex | 2 | P1 | platform, schema, feature | P02-011 | Yes |
| P04-009 | [Schema] Define IntelligenceCache entity in Convex | 2 | P2 | platform, schema, feature | P02-007 | Yes |
| P04-010 | [Schema] Define BidWorkspace entity in Convex | 2 | P0 | platform, schema, feature | P02-007 | Yes |
| P04-011 | [Schema] Define BidResponse entity in Convex | 2 | P0 | platform, schema, feature | P04-010 | Yes |
| P04-012 | [Schema] Define BidTask entity in Convex | 2 | P1 | platform, schema, feature | P04-010 | Yes |
| P04-013 | [Schema] Define BidSchedule entity in Convex | 2 | P2 | platform, schema, feature | P04-010 | Yes |
| P04-014 | [Schema] Define SellerProfile entity in Convex | 2 | P1 | platform, schema, feature | P02-007 | Yes |
| P04-015 | [Schema] Define CapabilityDeclaration entity in Convex | 2 | P1 | platform, schema, feature | P04-014 | Yes |
| P04-016 | [Schema] Define MarketplaceListing entity in Convex | 2 | P1 | platform, schema, feature | P04-014 | Yes |
| P04-017 | [Schema] Define EOI entity in Convex | 2 | P1 | platform, schema, feature | P04-016 | Yes |
| P04-018 | [Schema] Define NDARecord entity in Convex | 2 | P1 | platform, schema, feature | P02-007 | Yes |
| P04-019 | [Schema] Define Attachment entity in Convex with file storage config | 2 | P0 | platform, schema, feature | P01-002 | Yes |
| P04-020 | [Schema] Define Comment entity in Convex | 2 | P0 | platform, schema, feature | P02-011 | Yes |
| P04-021 | [Schema] Define QAThread entity in Convex | 2 | P1 | platform, schema, feature | P02-011 | Yes |
| P04-022 | [Schema] Define Notification entity in Convex | 2 | P1 | platform, schema, feature | P02-008 | Yes |
| P04-023 | [Schema] Define NotificationPreference entity in Convex | 2 | P1 | platform, schema, feature | P02-008 | Yes |
| P04-024 | [Schema] Define AuditEvent entity in Convex | 2 | P0 | platform, schema, feature | P02-007 | Yes |
| P04-025 | [Schema] Define AgentInstruction entity in Convex | 2 | P2 | platform, schema, feature | P02-010 | Yes |
| P04-026 | [Schema] Define CrawlSource entity in Convex | 2 | P2 | platform, schema, feature | P02-007 | Yes |
| P04-027 | [Schema] Define CrawlPage entity in Convex | 2 | P2 | platform, schema, feature | P04-026 | Yes |
| P04-028 | [Schema] Define Template entity in Convex | 2 | P1 | platform, schema, feature | P02-007 | Yes |
| P04-029 | [Schema] Define SelectionRecord entity in Convex | 2 | P2 | platform, schema, feature | P02-011 | Yes |
| P04-030 | [Backend] Implement UseCase CRUD mutations with RBAC | 2 | P0 | platform, backend, feature | P04-001, P02-020 | Yes |
| P04-031 | [Backend] Implement Requirement CRUD mutations with RBAC and version tracking | 3 | P0 | platform, backend, feature | P04-002, P04-003, P02-020 | Yes |
| P04-032 | [Backend] Implement Response CRUD mutations with status lifecycle and vendor attribution | 3 | P0 | platform, backend, feature | P04-004, P04-005, P02-020 | Yes |
| P04-033 | [Backend] Implement Score CRUD mutations with append-only enforcement | 3 | P0 | platform, backend, feature | P04-006, P02-020 | Yes |
| P04-034 | [Backend] Implement EvaluationScenario CRUD mutations | 2 | P1 | platform, backend, feature | P04-007 | Yes |
| P04-035 | [Backend] Implement BidWorkspace CRUD mutations with requirement mirroring | 3 | P0 | platform, backend, feature | P04-010, P02-021 | Yes |
| P04-036 | [Backend] Implement BidResponse CRUD mutations with advisory lock | 3 | P0 | platform, backend, feature | P04-011, P02-021 | Yes |
| P04-037 | [Backend] Implement BidTask CRUD mutations | 2 | P1 | platform, backend, feature | P04-012 | Yes |
| P04-038 | [Backend] Implement Comment CRUD mutations with @mention extraction | 2 | P0 | platform, backend, feature | P04-020 | Yes |
| P04-039 | [Backend] Implement QAThread CRUD mutations with phase gating and question limits | 3 | P1 | platform, backend, feature | P04-021 | Yes |
| P04-040 | [Backend] Implement AuditEvent logging middleware (all mutations) | 3 | P0 | platform, backend, feature | P04-024 | Yes |
| P04-041 | [Backend] Implement Attachment CRUD with file upload, virus scanning, and validation | 3 | P0 | platform, backend, feature | P04-019 | Yes |
| P04-042 | [Backend] Implement workspace cancellation with 30-day grace period and recovery | 2 | P1 | platform, backend, feature | P02-016 | Yes |
| P04-043 | [Backend] Implement contract upload and workspace archival at Phase 13 | 2 | P1 | platform, backend, feature, phase-12-13 | P02-030, P04-019 | Yes |
| P04-044 | [Backend] Implement API key system with fine-grained scopes | 3 | P1 | platform, api, feature | P02-019 | Yes |
| P04-045 | [Backend] Implement cursor-based pagination (default 50, max 250, 24h TTL) | 2 | P1 | platform, api, feature | P04-030 | Yes |
| P04-046 | [Backend] Implement rate limiting (soft 5K/hr, hard 10K/hr, burst 100/min) | 2 | P1 | platform, api, feature | P04-044 | Yes |
| P04-047 | [Backend] Implement webhook delivery with HMAC-SHA256, retry, and dead letter queue | 3 | P1 | platform, api, feature | P04-040 | Yes |
| P04-048 | [Backend] Implement MarketplaceListing, EOI, NDARecord, SellerProfile, CapabilityDeclaration CRUD mutations | 3 | P1 | platform, backend, feature | P04-014 thru P04-018 | Yes |
| P04-049 | [Schema] Define EvalStarter entity in Convex (org_id nullable for system-seeded; vertical, name, description, use_cases[], requirements[], rubric, longlist[], status; full audit fields; index `(org_id, vertical, status)`) — Phase 14.16, M06.3 cross-project consumer | 3 | P1 | platform, schema, feature | P02-007 | Yes |
| P04-050 | [Schema] Define DefenseView entity in Convex (workspace_id, selection_record_id, selection_record_hash, lifecycle_state, plan_tier_at_generation, generated_by, generated_at, last_regenerated_at, regeneration_count, pdf_storage_id, pdf_signed_url_expires_at, content_blob, watermark_state; full audit fields) — Phase 14.16, M11.3 cross-project consumer | 3 | P1 | platform, schema, feature | P02-011, P11-007 | Yes |
| P04-051 | [Schema] Add Solo-billing schema additions: AIOperation `solo_envelope_blocked` boolean flag; CapabilityRegistryEntry `surface_throttling_class` (enum), `solo_envelope_override_value_cents`, `solo_envelope_no_block`; EnvelopeCounter entity per `(org_id, console, envelope_window_id)` — Phase 14.16, M21.3 cross-project consumer | 3 | P1 | platform, schema, feature | P21-001 | Yes |
| P04-052 | [Schema] Add `eval_starter_origin` field to Workspace entity (nullable FK to EvalStarter.id; for cohort analytics) — Phase 14.16, M06.3 cross-project consumer | 1 | P1 | platform, schema, feature | P04-049, P02-011 | Yes |

---

### P05: Real-Time & Search Infrastructure (12 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P05-001 | [Backend] Implement Convex Presence heartbeat and idle detection | 3 | P0 | platform, backend, feature | P04-001 | Yes |
| P05-002 | [Backend] Implement cursor position tracking via Presence | 2 | P1 | platform, backend, feature | P05-001 | Yes |
| P05-003 | [Backend] Implement Presence graceful reconnection after network interruption | 2 | P1 | platform, backend, feature | P05-001 | Yes |
| P05-004 | [Backend] Implement Convex OT for UseCase description field | 3 | P1 | platform, backend, feature | P04-001 | Yes |
| P05-005 | [Backend] Implement Convex OT for Requirement text fields | 3 | P1 | platform, backend, feature | P04-002 | Yes |
| P05-006 | [Backend] Implement OT conflict resolution and undo/redo | 2 | P1 | platform, backend, feature | P05-004 | Yes |
| P05-007 | [Backend] Set up full-text search index (requirements, comments, responses, KB, vendors) | 3 | P0 | platform, backend, feature | P04-002 | Yes |
| P05-008 | [Backend] Implement search query parsing (Boolean, phrase, fuzzy, Levenshtein ≤2) | 3 | P1 | platform, backend, feature | P05-007 | Yes |
| P05-009 | [Backend] Implement search snippet generation with keyword highlighting | 2 | P1 | platform, backend, feature | P05-008 | Yes |
| P05-010 | [Backend] Set up Convex RAG vector index with embedding model | 3 | P0 | platform, backend, feature | P04-001 | Yes |
| P05-011 | [Backend] Implement RAG chunking strategy for documents up to 500 pages | 2 | P1 | platform, backend, feature | P05-010 | Yes |
| P05-012 | [Backend] Implement RAG similarity search with configurable threshold | 2 | P1 | platform, backend, feature | P05-010 | Yes |

---

### P06: Requirements & Use Cases (28 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P06-001 | [Frontend] Implement Use Case list page with tabs and CRUD | 3 | P0 | buyer, frontend, feature | P03-020, P04-030 | Yes |
| P06-002 | [Frontend] Implement Use Case inline editing (name, description) | 2 | P0 | buyer, frontend, feature | P06-001 | Yes |
| P06-003 | [Frontend] Implement Use Case delete with cascading requirement warning | 2 | P1 | buyer, frontend, feature | P06-001, P03-011 | Yes |
| P06-004 | [Frontend] Implement Requirement creation form (all fields: statement, AC, type, granularity, scoring model, weight) | 3 | P0 | buyer, frontend, feature | P04-031, P03-010 | Yes |
| P06-005 | [Frontend] Implement Requirements Matrix table view with DataTable | 3 | P0 | buyer, frontend, feature | P03-021, P04-031 | Yes |
| P06-006 | [Frontend] Implement Requirements Matrix inline editing (click-to-edit cells) | 3 | P0 | buyer, frontend, feature | P06-005 | Yes |
| P06-007 | [Frontend] Implement Requirements Matrix keyboard navigation (J/K/L/Enter/Escape) | 2 | P0 | buyer, frontend, feature | P06-005 | Yes |
| P06-008 | [Frontend] Implement Requirements Matrix bulk actions (Shift+Click, Cmd+A, toolbar) | 2 | P1 | buyer, frontend, feature | P06-005 | Yes |
| P06-009 | [Frontend] Implement Requirement detail SidePeek | 2 | P0 | buyer, frontend, feature | P03-022, P06-005 | Yes |
| P06-010 | [Frontend] Implement requirement reordering (drag-drop + Cmd+Up/Down) | 2 | P1 | buyer, frontend, feature | P06-005 | Yes |
| P06-011 | [Frontend] Implement Requirements Matrix filters, sort, and group-by | 3 | P1 | buyer, frontend, feature | P06-005 | Yes |
| P06-012 | [Frontend] Implement triage queue list view with SLA timer integration | 3 | P1 | buyer, frontend, feature | P03-036, P03-033, P02-032 | Yes |
| P06-013 | [Frontend] Implement triage queue Kanban board view with drag-drop | 2 | P1 | buyer, frontend, feature | P06-012 | Yes |
| P06-014 | [Frontend] Implement triage auto-mapping UI (team suggestion with confidence badges) | 2 | P1 | buyer, frontend, feature | P06-012 | Yes |
| P06-015 | [Frontend] Implement phase-lock enforcement on Requirements Matrix (Phases 1-5 full edit, 6-9 amend only, 10+ read-only) | 3 | P0 | buyer, frontend, feature, phase-6-9 | P06-005, P02-024 | Yes |
| P06-016 | [Frontend] Implement amendment protocol UI (AmendmentBanner + DiffViewer) | 3 | P1 | buyer, frontend, feature, phase-6-9 | P03-035, P03-028, P04-003 | Yes |
| P06-017 | [Frontend] Implement batch amendment modal for ≥5 amendments | 2 | P1 | buyer, frontend, feature, phase-6-9 | P06-016, P03-011 | Yes |
| P06-018 | [Frontend] Implement requirement splitting UI (proposed splits, accept/reject) | 2 | P1 | buyer, frontend, feature | P06-004, P03-030 | Yes |
| P06-019 | [Frontend] Implement Workspace Overview page (phase progress, Pulse placeholder, quick actions, members) | 3 | P1 | buyer, frontend, feature | P03-043, P03-034 | Yes |
| P06-020 | [Frontend] Implement Workspace List page (grid/table, filters, status badges, create CTA) | 3 | P1 | buyer, frontend, feature | P03-021, P02-016 | Yes |
| P06-021 | [Frontend] Implement empty states for Requirements Matrix, Use Case list, Workspace list | 2 | P1 | buyer, frontend, feature | P03-048 | Yes |
| P06-022 | [Frontend] Implement Buyer Dashboard page (summary cards, workspace cards, activity feed) | 3 | P1 | buyer, frontend, feature | P03-019, P03-031 | Yes |
| P06-023 | [Frontend] Implement Buyer Dashboard empty state (first workspace CTA) | 1 | P2 | buyer, frontend, feature | P03-048, P06-022 | Yes |
| P06-024 | [Frontend] Implement Buyer Onboarding wizard shell (progress stepper, step nav, skip logic) | 3 | P1 | buyer, frontend, feature | P03-011 | Yes |
| P06-025 | [Frontend] Implement Buyer Onboarding steps (org setup, team setup, first workspace, first UC, first requirement, dashboard tour) | 3 | P1 | buyer, frontend, feature | P06-024 | Yes |
| P06-026 | [Frontend] Implement setup checklist widget in sidebar (dismissible, persistent) | 2 | P2 | buyer, frontend, feature | P03-040 | Yes |
| P06-027 | [Frontend] Implement Settings: User page (profile, avatar, timezone, locale) | 2 | P1 | platform, frontend, feature | P03-010, P02-014 | Yes |
| P06-028 | [Frontend] Implement Settings: Organization page (name, slug, logo, billing email) | 2 | P1 | platform, frontend, feature | P03-010, P02-013 | Yes |
| P06-029 | [Backend] Register Appendix J `EvalVertical` enum (`hr_people`, `finance`, `sales`, `engineering_devtools`, `it_security`, `operations_grc`) | 1 | P1 | platform, backend, feature | P04-049 | Yes |
| P06-030 | [Backend] Implement EvalStarter CRUD mutations (system-seeded read-only; org-scoped custom CRUD gated to Workspace Owner) | 2 | P1 | buyer, backend, feature | P04-049, P02-019 | Yes |
| P06-031 | [Backend] Implement EvalStarter system-seed loader for HR / People vertical (curated Use Cases, 3–5 Requirements per UC with default scoring model + weight, FM/PM/DNM/EX rubric, 8–15 vendor longlist) | 3 | P1 | buyer, backend, feature | P06-030 | No |
| P06-032 | [Backend] Implement EvalStarter system-seed loader for Finance vertical (ERP, FP&A, AR/AP, expense) | 3 | P1 | buyer, backend, feature | P06-030 | No |
| P06-033 | [Backend] Implement EvalStarter system-seed loader for Sales vertical (CRM, sales engagement, RevOps) | 3 | P1 | buyer, backend, feature | P06-030 | No |
| P06-034 | [Backend] Implement EvalStarter system-seed loader for Engineering / DevTools vertical (CI/CD, observability, IDE/agent) | 3 | P1 | buyer, backend, feature | P06-030 | No |
| P06-035 | [Backend] Implement EvalStarter system-seed loader for IT / Security vertical (IAM, EDR, SIEM, SOAR) | 3 | P1 | buyer, backend, feature | P06-030 | No |
| P06-036 | [Backend] Implement EvalStarter system-seed loader for Operations / GRC vertical (ITSM, GRC, vendor-risk) | 3 | P1 | buyer, backend, feature | P06-030 | No |
| P06-037 | [Backend] Implement Workspace creation-from-EvalStarter mutation (≤2s p95; populates Use Cases / Requirements / rubric / longlist; stamps `eval_starter_origin`) | 3 | P1 | buyer, backend, feature | P06-030, P04-052 | Yes |
| P06-038 | [Backend] Implement `workspace_created_from_eval_starter` audit-event emission and `eval_starter.empty_active_registry` engine-only event | 2 | P1 | buyer, backend, feature | P06-037, P04-040 | Yes |
| P06-039 | [Frontend] Implement §13.12 What Are You Evaluating? intake page (vertical picker, starter preview, "Start with this" CTA, custom-vertical authoring entry) | 3 | P1 | buyer, frontend, feature | P06-030, P03-019, P03-007 | Yes |
| P06-040 | [Frontend] Implement EvalStarter custom-authoring CRUD UI (Workspace Owner only; mirrors system-seed shape; rejects on system-seeded edit) | 2 | P2 | buyer, frontend, feature | P06-030, P06-039 | Yes |

---

### P07: Vendor Management & Invitations (14 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P07-001 | [Frontend] Implement Vendor List page with status badges and filters | 3 | P0 | buyer, frontend, feature, phase-4-5 | P03-021, P04-048 | Yes |
| P07-002 | [Frontend] Implement Vendor Detail SidePeek (company info, response status, NDA status) | 2 | P0 | buyer, frontend, feature | P03-022, P07-001 | Yes |
| P07-003 | [Frontend] Implement Vendor creation/import form | 2 | P1 | buyer, frontend, feature | P03-010, P04-048 | Yes |
| P07-004 | [Frontend] Implement ITB creation and sending workflow | 3 | P1 | buyer, frontend, feature, phase-4-5 | P07-001, P04-048 | Yes |
| P07-005 | [Frontend] Implement NDA workflow UI (send, track, sign status) | 3 | P1 | buyer, frontend, feature, phase-4-5 | P04-018, P03-027 | Yes |
| P07-006 | [Frontend] Implement vendor shortlist management (include/exclude, bulk) | 2 | P1 | buyer, frontend, feature | P07-001 | Yes |
| P07-007 | [Frontend] Implement vendor disqualification flow (rationale required, not shared with vendor) | 2 | P1 | buyer, frontend, feature | P07-001, P03-011 | Yes |
| P07-008 | [Frontend] Implement vendor voluntary withdrawal handling | 2 | P2 | buyer, frontend, feature | P07-001 | Yes |
| P07-009 | [Frontend] Implement vendor response comparison view (side-by-side, synced scroll, diff highlighting) | 3 | P1 | buyer, frontend, feature, phase-6-9 | P03-028, P04-032 | Yes |
| P07-010 | [Frontend] Implement Vendor List empty state | 1 | P2 | buyer, frontend, feature | P03-048 | Yes |
| P07-011 | [Frontend] Implement Settings: Workspace page (name, scoring config, phase management) | 3 | P1 | buyer, frontend, feature | P03-010, P02-016, P03-034 | Yes |
| P07-012 | [Frontend] Implement Settings: Workspace Members page (invite, role management) | 2 | P1 | buyer, frontend, feature | P02-017 | Yes |
| P07-013 | [Frontend] Implement Settings: Security page (MFA, password, sessions, tokens) | 3 | P1 | platform, frontend, feature | P02-004, P02-006 | Yes |
| P07-014 | [Frontend] Implement Settings: Data & Privacy page (GDPR export request, account closure) | 2 | P2 | platform, frontend, feature | P03-011 | Yes |

---

### P08: Scoring System (22 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P08-001 | [Frontend] Implement Scoring Matrix grid layout (vendor columns × requirement rows) | 3 | P0 | buyer, frontend, feature, phase-10-11 | P03-021, P04-006, P04-032 | Yes |
| P08-002 | [Frontend] Implement grade entry via keyboard (1=FM, 2=PM, 3=DNM, 4=EX) | 2 | P0 | buyer, frontend, feature, phase-10-11 | P08-001 | Yes |
| P08-003 | [Frontend] Implement grade entry via click/dropdown (FM/PM/DNM/EX selection) | 2 | P0 | buyer, frontend, feature, phase-10-11 | P08-001 | Yes |
| P08-004 | [Frontend] Implement Scoring Card SidePeek (requirement display) | 2 | P0 | buyer, frontend, feature, phase-10-11 | P03-022, P08-001 | Yes |
| P08-005 | [Frontend] Implement Scoring Card response display panel | 2 | P0 | buyer, frontend, feature, phase-10-11 | P08-004, P04-032 | Yes |
| P08-006 | [Frontend] Implement Scoring Card grade selector with notes field | 2 | P0 | buyer, frontend, feature, phase-10-11 | P08-004 | Yes |
| P08-007 | [Frontend] Implement Scoring Matrix keyboard navigation (J/K/N/Tab, 1-4 grade) | 2 | P1 | buyer, frontend, feature, phase-10-11 | P08-001 | Yes |
| P08-008 | [Backend] Implement score calculation: vendor-requirement score | 2 | P0 | platform, backend, feature | P04-033 | Yes |
| P08-009 | [Backend] Implement score calculation: vendor-use-case score (SUM grade×weight / SUM weight) | 2 | P0 | platform, backend, feature | P08-008 | Yes |
| P08-010 | [Backend] Implement auto-scoring rules (Boolean→FM/DNM, pricing→TCO excluded) | 2 | P1 | platform, backend, feature | P04-033 | Yes |
| P08-011 | [Frontend] Implement score summary display (per-vendor, per-UC, overall ranking) | 3 | P1 | buyer, frontend, feature, phase-10-11 | P08-009 | Yes |
| P08-012 | [Frontend] Implement collaborative scoring presence indicators | 2 | P1 | buyer, frontend, feature, phase-10-11, business | P05-001, P08-001 | Yes |
| P08-013 | [Frontend] Implement "Score Independently" toggle (hide others until submit) | 2 | P1 | buyer, frontend, feature, phase-10-11, business | P08-012 | Yes |
| P08-014 | [Frontend] Implement append-only grade display with superseded entries (strikethrough) | 2 | P1 | buyer, frontend, feature, phase-10-11 | P08-006 | Yes |
| P08-015 | [Backend] Implement divergence detection (≥0.3 triggers card, ≥0.6 auto-escalation) | 3 | P1 | platform, backend, feature, business | P04-033 | Yes |
| P08-016 | [Frontend] Implement Disagreement Insight Card UI (both grades, divergence %, evidence link) | 2 | P1 | buyer, frontend, feature, phase-10-11, business | P03-030, P08-015 | Yes |
| P08-017 | [Frontend] Implement UC Lead resolution flow (accept average, override, request re-eval) | 3 | P1 | buyer, frontend, feature, phase-10-11, business | P08-016 | Yes |
| P08-018 | [Frontend] Implement override rate tracking display (per-UC and workspace-wide) | 2 | P2 | buyer, frontend, feature, phase-10-11 | P08-014 | Yes |
| P08-019 | [Backend] Implement Phase 12 score immutability enforcement | 2 | P0 | platform, backend, feature, phase-12-13 | P04-033, P02-029 | Yes |
| P08-020 | [Frontend] Implement Phase 12 read-only scoring UI with lock indicator | 2 | P1 | buyer, frontend, feature, phase-12-13 | P08-019 | Yes |
| P08-021 | [Frontend] Implement EX exclusion proposal flow (reason required, approval by Owner/UC Lead) | 2 | P1 | buyer, frontend, feature, phase-10-11 | P08-006, P03-011 | Yes |
| P08-022 | [Frontend] Implement Scoring Matrix empty state and loading skeleton | 1 | P2 | buyer, frontend, feature | P03-048, P03-016 | Yes |

---

### P09: Scenarios & TCO (14 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P09-001 | [Frontend] Implement Scenario Modeling page layout | 2 | P1 | buyer, frontend, feature, phase-10-11, business | P04-034 | Yes |
| P09-002 | [Frontend] Implement scenario CRUD (create, name, edit parameters, delete) | 2 | P1 | buyer, frontend, feature, business | P09-001 | Yes |
| P09-003 | [Frontend] Implement weight override sliders per Use Case (0.0-5.0) | 2 | P1 | buyer, frontend, feature, business | P09-001 | Yes |
| P09-004 | [Frontend] Implement vendor/UC exclusion toggles in scenario | 2 | P1 | buyer, frontend, feature, business | P09-001 | Yes |
| P09-005 | [Backend] Implement scenario ranking and threshold calculation | 3 | P1 | platform, backend, feature | P08-009, P04-034 | Yes |
| P09-006 | [Frontend] Implement scenario comparison view (max 5, matrix rank+score per vendor) | 3 | P1 | buyer, frontend, feature, business | P09-005 | Yes |
| P09-007 | [Frontend] Implement sensitivity analysis chart | 3 | P2 | buyer, frontend, feature, business | P09-005 | Yes |
| P09-008 | [Frontend] Implement simulation mode (S key entry, real-time recalc, Cmd+S save, R reset) | 3 | P2 | buyer, frontend, feature, business | P09-005 | Yes |
| P09-009 | [Frontend] Implement TCO Dashboard page layout | 2 | P1 | buyer, frontend, feature, phase-10-11, business | P03-032 | Yes |
| P09-010 | [Frontend] Implement pricing requirement entry forms (flat/tiered/one-time/percentage/estimate-range/discount) | 3 | P1 | buyer, frontend, feature, business | P03-010, P04-031 | Yes |
| P09-011 | [Backend] Implement TCO projection engine (multi-year, seat count, growth rate) | 3 | P1 | platform, backend, feature | P04-031 | Yes |
| P09-012 | [Frontend] Implement TCO year-by-year breakdown display with cost per seat | 2 | P1 | buyer, frontend, feature, business | P09-011 | Yes |
| P09-013 | [Backend] Implement blended score calculation (scoring + TCO percentile × tco_value_weight) | 2 | P1 | platform, backend, feature | P08-009, P09-011 | Yes |
| P09-014 | [Frontend] Implement Scenarios and TCO empty states | 1 | P2 | buyer, frontend, feature | P03-048 | Yes |

---

### P10: Q&A, Comments & Collaboration (16 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P10-001 | [Frontend] Implement threaded comment UI on requirements | 3 | P0 | buyer, frontend, feature | P04-038, P03-025 | Yes |
| P10-002 | [Frontend] Implement @mention autocomplete in comments | 2 | P1 | buyer, frontend, feature | P10-001, P02-017 | Yes |
| P10-003 | [Frontend] Implement unread comment tracking with badge | 2 | P1 | buyer, frontend, feature | P10-001 | Yes |
| P10-004 | [Frontend] Implement comment edit/delete (15-min window, Owner can edit/delete any) | 2 | P1 | buyer, frontend, feature | P10-001 | Yes |
| P10-005 | [Frontend] Implement inline commenting on responses | 2 | P1 | buyer, frontend, feature | P10-001, P04-032 | Yes |
| P10-006 | [Frontend] Implement Comment Thread Summary button (≥5 comments, agent placeholder) | 1 | P2 | buyer, frontend, feature | P10-001, P03-029 | Yes |
| P10-007 | [Frontend] Implement Q&A thread list page (buyer side) with filters | 3 | P1 | buyer, frontend, feature, phase-6-9, business | P04-039 | Yes |
| P10-008 | [Frontend] Implement Q&A thread composer (public/private toggle, @mentions, file attachment) | 3 | P1 | buyer, frontend, feature, phase-6-9, business | P10-007, P03-026, P04-041 | Yes |
| P10-009 | [Frontend] Implement Q&A phase gating (6-7 editable, 8 vendor read-only, 9-12 all read-only) | 2 | P1 | buyer, frontend, feature, phase-6-9 | P10-007, P02-024 | Yes |
| P10-010 | [Frontend] Implement vendor question limit display and enforcement (50 base, +10 Enterprise request) | 2 | P1 | buyer, frontend, feature, business | P10-007 | Yes |
| P10-011 | [Frontend] Implement vendor identity masking toggle in Q&A threads | 2 | P2 | buyer, frontend, feature | P10-007 | Yes |
| P10-012 | [Frontend] Implement Q&A search (full-text) | 2 | P2 | buyer, frontend, feature | P10-007, P05-008 | Yes |
| P10-013 | [Frontend] Implement Q&A export to CSV | 1 | P2 | buyer, frontend, feature | P10-007 | Yes |
| P10-014 | [Frontend] Implement Q&A answer suggestion UI placeholder (agent wiring in P19) | 1 | P2 | buyer, frontend, feature, business | P10-008, P03-029 | Yes |
| P10-015 | [Frontend] Implement Q&A empty state | 1 | P2 | buyer, frontend, feature | P03-048 | Yes |
| P10-016 | [Frontend] Implement Comments empty state | 1 | P2 | buyer, frontend, feature | P03-048 | Yes |

---

### P11: Analytics, Pulse & Reporting (16 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P11-001 | [Backend] Implement Pulse Health Score calculation (daily 9am UTC, formula with phase-aware weights) | 3 | P0 | platform, backend, feature | P02-032, P04-008 | Yes |
| P11-002 | [Frontend] Implement Workspace Analytics page with phase-aware metrics | 3 | P1 | buyer, frontend, feature | P08-009, P04-008 | Yes |
| P11-003 | [Frontend] Implement Pulse widget on dashboard (Health Score, sparkline, signal breakdown) | 2 | P1 | buyer, frontend, feature | P03-031, P11-001 | Yes |
| P11-004 | [Frontend] Implement full Pulse view with 7-day trend, signal bars, digest archive | 3 | P1 | buyer, frontend, feature | P11-003 | Yes |
| P11-005 | [Frontend] Implement Analytics metric drill-down modals | 2 | P2 | buyer, frontend, feature | P11-002 | Yes |
| P11-006 | [Frontend] Implement Analytics filters (Use Case, Team, Vendor, Time Range) | 2 | P2 | buyer, frontend, feature | P11-002 | Yes |
| P11-007 | [Backend] Implement Selection Report generation (Phase 12 PDF with rankings, narratives, audit trail) | 5 | P0 | platform, backend, feature, phase-12-13 | P08-009, P09-013 | No |
| P11-008 | [Frontend] Implement Selection Report page (preview, download, share) | 3 | P1 | buyer, frontend, feature, phase-12-13 | P11-007, P03-027 | Yes |
| P11-009 | [Frontend] Implement export functionality (CSV/PDF/Excel for analytics and report) | 3 | P1 | buyer, frontend, feature | P11-002 | Yes |
| P11-010 | [Frontend] Implement Intelligence Dashboard page layout | 2 | P1 | buyer, frontend, feature, business | P04-009 | Yes |
| P11-011 | [Frontend] Implement Intelligence vendor history and efficiency metrics (Business+) | 3 | P1 | buyer, frontend, feature, business | P11-010 | Yes |
| P11-012 | [Frontend] Implement Intelligence discrepancy analysis and predictive suggestions (Enterprise) | 3 | P2 | buyer, frontend, feature, enterprise | P11-010 | Yes |
| P11-013 | [Backend] Implement Intelligence briefing generation (cache-based, 30-day TTL) | 3 | P2 | platform, backend, feature, business | P04-009 | Yes |
| P11-014 | [Frontend] Implement Intelligence briefing display with regenerate button | 2 | P2 | buyer, frontend, feature, business | P11-013 | Yes |
| P11-015 | [Frontend] Implement Analytics empty states (no data, phase-gated) | 1 | P2 | buyer, frontend, feature | P03-048 | Yes |
| P11-016 | [Frontend] Implement Pulse digest archive view (past 12 weeks, CSV export) | 2 | P2 | buyer, frontend, feature | P11-004 | Yes |
| P11-017 | [Backend] Register Appendix J `defense_view_lifecycle_state` enum (4 values) | 1 | P1 | platform, backend, feature | P04-050 | Yes |
| P11-018 | [Backend] Register Appendix J `regeneration_reason_code` enum (`operator_initiated`, `source_changed_manual_refresh`, `low_confidence_retry`, `source_hash_mismatch_auto`) | 1 | P1 | platform, backend, feature | P04-050 | Yes |
| P11-019 | [Backend] Implement Selection Record Hash Binding (compute & store `selection_record_hash` at DefenseView generation; detect mismatch on Selection Record edit) | 3 | P1 | buyer, backend, feature | P04-050, P11-007 | Yes |
| P11-020 | [Backend] Implement DefenseView generate API endpoint (POST; gated to Phase 12 finalized; returns 422 `selection_record_not_finalized` if Selection Record incomplete; emits `defense_view.generated` webhook) | 3 | P0 | buyer, backend, feature, business | P11-019, P19-035 | Yes |
| P11-021 | [Backend] Implement DefenseView regenerate API endpoint (POST; throttle ≤1 per 60s per Workspace per user, returns 429 `regeneration_throttle`; emits `defense_view.regenerated` webhook) | 3 | P1 | buyer, backend, feature, business | P11-020 | Yes |
| P11-022 | [Backend] Implement DefenseView read API endpoint (GET; cross-console firewall returns 403 `defense_view_cross_console_access` on seller-side request; returns 410 `defense_view_archived_with_workspace` post-archival) | 2 | P1 | buyer, backend, feature | P11-020, P02-019 | Yes |
| P11-023 | [Backend] Register Appendix I error codes: `selection_record_not_finalized`, `regeneration_throttle`, `defense_view_capability_disabled`, `defense_view_archived_with_workspace`, `defense_view_cross_console_access` | 1 | P1 | platform, backend, feature | P11-020 | Yes |
| P11-024 | [Backend] Register Appendix C webhooks `defense_view.generated` / `defense_view.regenerated` and Appendix G PostHog events `defense_view.generated` / `defense_view.regenerated` / `defense_view.regenerated_due_to_source_change` | 1 | P1 | platform, backend, feature | P04-047, P24-018 | Yes |
| P11-025 | [Backend] Implement Selection Record edit detector → fires `defense_view.regenerated_due_to_source_change` when bound DefenseView's `selection_record_hash` no longer matches | 2 | P1 | buyer, backend, feature | P11-019, P11-021 | Yes |
| P11-026 | [Backend] Implement DefenseView PDF export pipeline (Convex storage + serverless render → signed URL with 7-day TTL; watermarked variant for Solo / Free; full variant for Starter+) | 3 | P1 | buyer, backend, feature, business | P11-020, P21-005 | No |
| P11-027 | [Backend] Implement DefenseView audit logging per §13.11.10 (generation, regeneration, read, archival) | 1 | P1 | buyer, backend, feature | P11-020, P04-040 | Yes |
| P11-028 | [Frontend] Implement Defense View SidePeek (lifecycle_state badge, regenerate CTA, "view PDF" CTA, watermark indicator on Solo / Free) | 3 | P1 | buyer, frontend, feature, business | P03-022, P11-020 | Yes |
| P11-029 | [Frontend] Implement Defense View dedicated page at §13.11 path (full content blob render, regenerate, download PDF, share, mode-aware copy per M02.3) | 3 | P1 | buyer, frontend, feature, business | P11-028, P02-033 | Yes |
| P11-030 | [Frontend] Implement Defense View watermarked-preview surface for Solo / Free with Starter+ upgrade CTA (deep-links Solo upgrade modal in M21.3) | 2 | P1 | buyer, frontend, feature | P11-029, P21-012 | Yes |

---

### P12: Policy Ingestion & Templates (12 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P12-001 | [Frontend] Implement Template Library page (grid/list view, cards, search, filter) | 3 | P1 | buyer, frontend, feature | P04-028 | Yes |
| P12-002 | [Frontend] Implement Template detail preview modal | 2 | P1 | buyer, frontend, feature | P12-001, P03-011 | Yes |
| P12-003 | [Frontend] Implement "Apply Template to Workspace" flow (pre-populate UCs + Requirements) | 3 | P1 | buyer, frontend, feature | P12-001, P06-001 | Yes |
| P12-004 | [Backend] Implement custom template creation from completed workspace | 3 | P1 | platform, backend, feature | P04-028, P02-016 | Yes |
| P12-005 | [Frontend] Implement custom template creation UI | 2 | P1 | buyer, frontend, feature | P12-004 | Yes |
| P12-006 | [Frontend] Implement Template Library empty state | 1 | P2 | buyer, frontend, feature | P03-048 | Yes |
| P12-007 | [Frontend] Implement Policy Ingestion page layout (upload zone, framework detection, extraction table) | 3 | P1 | buyer, frontend, feature, business | P03-026, P03-027 | Yes |
| P12-008 | [Frontend] Implement framework detection display (confidence score, framework name) | 2 | P1 | buyer, frontend, feature, business | P12-007, P03-029 | Yes |
| P12-009 | [Frontend] Implement extracted requirements table (source, confidence, category) | 3 | P1 | buyer, frontend, feature, business | P12-007 | Yes |
| P12-010 | [Frontend] Implement batch amendment modal for policy-extracted requirements | 2 | P1 | buyer, frontend, feature, business | P12-009, P06-017 | Yes |
| P12-011 | [Frontend] Implement policy deduplication UI (merge/keep both/dismiss with match %) | 2 | P1 | buyer, frontend, feature, business | P12-009, P03-030 | Yes |
| P12-012 | [Frontend] Implement traceability mapping UI (view in source PDF with highlight) | 2 | P2 | buyer, frontend, feature, business | P12-009, P03-027 | Yes |

---

### P13: Bid Workspaces & Responses (20 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P13-001 | [Frontend] Implement Bid Workspace List page with status/phase/due filters | 3 | P0 | seller, frontend, feature | P03-021, P04-035 | Yes |
| P13-002 | [Frontend] Implement Bid Workspace Overview page (metadata, team, progress stepper, tasks) | 3 | P0 | seller, frontend, feature | P13-001 | Yes |
| P13-003 | [Backend] Implement requirement mirroring from buyer workspace (sync ≤5s Phase 6) | 3 | P0 | platform, backend, feature | P04-035, P04-031 | Yes |
| P13-004 | [Frontend] Implement Response Editor with rich text and markdown | 3 | P0 | seller, frontend, feature, phase-6-9 | P03-025, P04-036 | Yes |
| P13-005 | [Frontend] Implement Response Editor KB suggestion sidebar | 2 | P1 | seller, frontend, feature | P13-004, P05-012 | Yes |
| P13-006 | [Frontend] Implement Response Editor auto-save and draft status | 2 | P1 | seller, frontend, feature | P13-004 | Yes |
| P13-007 | [Frontend] Implement response amendment handling (needs_reverification banner, view diff) | 2 | P1 | seller, frontend, feature, phase-6-9 | P13-004, P03-035, P03-028 | Yes |
| P13-008 | [Frontend] Implement response status tracking (unanswered/draft/submitted badges) | 2 | P1 | seller, frontend, feature | P13-002, P03-013 | Yes |
| P13-009 | [Frontend] Implement bulk response submit with partial success tracking | 3 | P1 | seller, frontend, feature | P13-004, P03-012 | Yes |
| P13-010 | [Frontend] Implement response phase-lock (Phase 10+ read-only) | 2 | P1 | seller, frontend, feature, phase-10-11 | P13-004, P02-028 | Yes |
| P13-011 | [Frontend] Implement advisory lock indicator on response editor | 2 | P2 | seller, frontend, feature | P13-004, P04-036 | Yes |
| P13-012 | [Frontend] Implement Bid Task list with CRUD (title, assignee, due date, status) | 3 | P1 | seller, frontend, feature | P04-037, P03-021 | Yes |
| P13-013 | [Frontend] Implement Bid Schedule visualization | 2 | P2 | seller, frontend, feature | P04-013 | Yes |
| P13-014 | [Frontend] Implement Seller Q&A page within Bid Workspace | 3 | P1 | seller, frontend, feature, phase-6-9, business | P04-039, P10-007 | Yes |
| P13-015 | [Frontend] Implement Seller Q&A reply interface | 2 | P1 | seller, frontend, feature, phase-6-9, business | P13-014 | Yes |
| P13-016 | [Frontend] Implement NDA Review page (seller-side: PDF viewer, signature, status) | 3 | P1 | seller, frontend, feature, phase-4-5 | P03-027, P04-018 | Yes |
| P13-017 | [Frontend] Implement vendor voluntary withdrawal flow (confirmation, reason, permanent) | 2 | P2 | seller, frontend, feature | P13-001, P03-011 | Yes |
| P13-018 | [Frontend] Implement Bid Workspace empty states (no tasks, no responses, no Q&A) | 1 | P2 | seller, frontend, feature | P03-048 | Yes |
| P13-019 | [Frontend] Implement Bid Workspace Detail response progress stepper | 2 | P1 | seller, frontend, feature | P13-002, P03-016 | Yes |
| P13-020 | [Frontend] Implement Seller Analytics page (response rate trend, avg time, KB utilization, team breakdown) | 3 | P2 | seller, frontend, feature | P03-021 | Yes |

---

### P14: Knowledge Base & Document Library (16 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P14-001 | [Frontend] Implement KB entry list page with health score indicators | 3 | P0 | seller, frontend, feature | P03-021, P04-030 | Yes |
| P14-002 | [Frontend] Implement KB entry CRUD form (content, tags, category, review cadence) | 2 | P0 | seller, frontend, feature | P03-010, P03-025 | Yes |
| P14-003 | [Frontend] Implement KB entry detail page (decay visualization, usage tracking, version history) | 3 | P1 | seller, frontend, feature | P14-001, P03-031 | Yes |
| P14-004 | [Backend] Implement KB staleness model (confidence_modifier decay, review lifecycle) | 3 | P1 | platform, backend, feature | P04-001 | Yes |
| P14-005 | [Frontend] Implement KB Health Dashboard (overall health, stale entries, review queue) | 3 | P1 | seller, frontend, feature | P14-001, P14-004 | Yes |
| P14-006 | [Frontend] Implement KB review workflow UI (approve, request changes, archive) | 2 | P1 | seller, frontend, feature | P14-001 | Yes |
| P14-007 | [Frontend] Implement KB search with semantic matching results | 2 | P1 | seller, frontend, feature | P05-012 | Yes |
| P14-008 | [Frontend] Implement Document Library list page (title, category, expiration, version) | 3 | P1 | seller, frontend, feature | P03-021, P04-041 | Yes |
| P14-009 | [Frontend] Implement Document Library CRUD (upload, categorize, set expiration) | 2 | P1 | seller, frontend, feature | P14-008, P03-026 | Yes |
| P14-010 | [Frontend] Implement Document Library version chain display | 2 | P2 | seller, frontend, feature | P14-008 | Yes |
| P14-011 | [Frontend] Implement Document Library expiration warnings (T-30 days) | 1 | P2 | seller, frontend, feature | P14-008 | Yes |
| P14-012 | [Frontend] Implement Firecrawl source configuration UI (CrawlConfigPanel) | 3 | P1 | seller, frontend, feature | P03-037, P04-026 | Yes |
| P14-013 | [Frontend] Implement Firecrawl crawled page review queue | 2 | P1 | seller, frontend, feature | P14-012, P04-027 | Yes |
| P14-014 | [Frontend] Implement Firecrawl re-crawl change detection display | 2 | P2 | seller, frontend, feature | P14-013 | Yes |
| P14-015 | [Frontend] Implement KB empty states (no entries, no documents, no crawl sources) | 1 | P2 | seller, frontend, feature | P03-048 | Yes |
| P14-016 | [Frontend] Implement KB entry import from bid responses (post-Phase 13 bulk save) | 2 | P2 | seller, frontend, feature | P14-002, P04-036 | Yes |

---

### P15: Seller Profile & Capabilities (10 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P15-001 | [Frontend] Implement Seller Profile page (company info, logo, certs, contacts) | 3 | P1 | seller, frontend, feature | P03-010, P04-048 | Yes |
| P15-002 | [Frontend] Implement Seller Profile inline editing | 2 | P1 | seller, frontend, feature | P15-001 | Yes |
| P15-003 | [Frontend] Implement verification tier display and progression UX (Basic→Verified→Certified) | 2 | P1 | seller, frontend, feature | P03-014, P15-001 | Yes |
| P15-004 | [Frontend] Implement Capability Declarations list page | 2 | P1 | seller, frontend, feature | P03-021, P04-048 | Yes |
| P15-005 | [Frontend] Implement Capability Declaration CRUD form (name, category, description, maturity, evidence) | 3 | P1 | seller, frontend, feature | P03-010, P03-026, P04-048 | Yes |
| P15-006 | [Frontend] Implement KB-to-Capability suggestion UI placeholder (agent wiring in P20) | 2 | P2 | seller, frontend, feature | P15-004, P03-029, P03-030 | Yes |
| P15-007 | [Frontend] Implement Capability Declaration batch actions (publish/unpublish, delete) | 2 | P2 | seller, frontend, feature | P15-004 | Yes |
| P15-008 | [Frontend] Implement Capability Declarations empty state | 1 | P2 | seller, frontend, feature | P03-048 | Yes |
| P15-009 | [Frontend] Implement Seller Profile public preview (as buyers see it) | 2 | P2 | seller, frontend, feature | P15-001 | Yes |
| P15-010 | [Frontend] Implement Seller Profile empty state (first setup CTA) | 1 | P2 | seller, frontend, feature | P03-048 | Yes |

---

### P16: Seller Console Shell & Onboarding (10 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P16-001 | [Frontend] Implement Seller Dashboard page (active bids, pending actions, KB health, marketplace) | 3 | P1 | seller, frontend, feature | P03-019, P03-031, P04-035 | Yes |
| P16-002 | [Frontend] Implement Seller Dashboard empty state (first bid CTA) | 1 | P2 | seller, frontend, feature | P03-048 | Yes |
| P16-003 | [Frontend] Implement Seller Inbox notification feed with categories | 3 | P1 | seller, frontend, feature | P04-022 | Yes |
| P16-004 | [Frontend] Implement Seller Inbox mark-read and dismiss actions | 1 | P1 | seller, frontend, feature | P16-003 | Yes |
| P16-005 | [Frontend] Implement Seller Inbox empty state | 1 | P2 | seller, frontend, feature | P03-048 | Yes |
| P16-006 | [Frontend] Implement Seller Onboarding wizard shell (7-step progress, step nav) | 3 | P1 | seller, frontend, feature | P03-011 | Yes |
| P16-007 | [Frontend] Implement Seller Onboarding steps (invitation→sign up→account link→profile→NDA→capabilities→KB) | 3 | P1 | seller, frontend, feature | P16-006, P15-001, P14-002 | Yes |
| P16-008 | [Frontend] Implement Seller setup checklist widget in sidebar | 2 | P2 | seller, frontend, feature | P03-041 | Yes |
| P16-009 | [Frontend] Implement Seller Pulse widget (response progress, pending reverifications, deadlines) | 2 | P2 | seller, frontend, feature | P16-001, P03-031 | Yes |
| P16-010 | [Frontend] Implement Seller console Settings pages (profile, org, security) | 2 | P1 | seller, frontend, feature | P06-027, P06-028 | Yes |

---

### P17: Marketplace Core (14 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P17-001 | [Frontend] Implement Marketplace browse page with category grid | 3 | P1 | buyer, marketplace, frontend, feature | P04-048 | Yes |
| P17-002 | [Frontend] Implement Marketplace listing cards (20/page, logo, name, tagline, categories, badges) | 2 | P1 | buyer, marketplace, frontend, feature | P17-001, P03-019 | Yes |
| P17-003 | [Frontend] Implement Marketplace filters (industry, location, certification, capability, tier) | 3 | P1 | buyer, marketplace, frontend, feature | P17-001, P03-007 | Yes |
| P17-004 | [Frontend] Implement Marketplace search (fuzzy, Boolean, phrase) | 3 | P1 | buyer, marketplace, frontend, feature | P17-001, P05-008 | Yes |
| P17-005 | [Frontend] Implement Marketplace sort (relevance, tier, recent, alphabetical) | 1 | P2 | buyer, marketplace, frontend, feature | P17-001 | Yes |
| P17-006 | [Frontend] Implement Marketplace Listing detail page (profile, capabilities, pricing, integrations, certs) | 3 | P1 | buyer, marketplace, frontend, feature | P17-001 | Yes |
| P17-007 | [Frontend] Implement EOI submission form (workspace title, summary, capability checklist, timeline) | 3 | P1 | buyer, marketplace, frontend, feature | P17-006, P04-048, P03-010 | Yes |
| P17-008 | [Frontend] Implement EOI status tracking (draft/submitted/acknowledged/approved/rejected) | 2 | P1 | buyer, marketplace, frontend, feature | P17-007, P03-013 | Yes |
| P17-009 | [Backend] Implement match scoring calculation (matched caps / total scored reqs × 100%) | 3 | P2 | platform, backend, feature, enterprise | P04-048 | Yes |
| P17-010 | [Frontend] Implement match score display with tooltip (Enterprise) | 2 | P2 | buyer, marketplace, frontend, feature, enterprise | P17-009, P03-016 | Yes |
| P17-011 | [Frontend] Implement post-close EOI auto-rejection behavior | 1 | P2 | buyer, marketplace, frontend, feature | P17-008 | Yes |
| P17-012 | [Frontend] Implement Marketplace empty states (no results, no listings) | 1 | P2 | buyer, marketplace, frontend, feature | P03-048 | Yes |
| P17-013 | [Frontend] Implement Marketplace Listing page for seller profile view (buyer perspective) | 2 | P1 | buyer, marketplace, frontend, feature | P17-006, P15-001 | Yes |
| P17-014 | [Frontend] Implement Buyer Inbox page (notification feed, categories, mark-read) | 3 | P1 | buyer, frontend, feature | P04-022 | Yes |

---

### P18: Marketplace Seller Integration (10 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P18-001 | [Frontend] Implement Marketplace Listing create/edit form (title, desc, features, pricing, certs, integrations) | 3 | P1 | seller, marketplace, frontend, feature | P03-010, P04-048 | Yes |
| P18-002 | [Frontend] Implement Marketplace Listing status management (draft/published/archived) | 2 | P1 | seller, marketplace, frontend, feature | P18-001 | Yes |
| P18-003 | [Frontend] Implement Marketplace Listing preview (as buyers see it) | 2 | P2 | seller, marketplace, frontend, feature | P18-001 | Yes |
| P18-004 | [Frontend] Implement Marketplace Listings list page (seller's listings) | 2 | P1 | seller, marketplace, frontend, feature | P18-001 | Yes |
| P18-005 | [Frontend] Implement EOI response management (accept/decline/request more info) | 3 | P1 | seller, marketplace, frontend, feature | P04-048 | Yes |
| P18-006 | [Frontend] Implement EOI response notification and status display | 2 | P1 | seller, marketplace, frontend, feature | P18-005 | Yes |
| P18-007 | [Backend] Implement controlled vocabulary for seller-proposed capabilities | 2 | P2 | platform, backend, feature | P04-015 | Yes |
| P18-008 | [Frontend] Implement capability proposal and moderation queue UI | 2 | P2 | seller, marketplace, frontend, feature | P18-007 | Yes |
| P18-009 | [Frontend] Implement Marketplace Listings empty state (seller: no listings yet CTA) | 1 | P2 | seller, marketplace, frontend, feature | P03-048 | Yes |
| P18-010 | [Frontend] Implement NDA management from marketplace flow | 2 | P2 | seller, marketplace, frontend, feature | P07-005 | Yes |

---

### P19: Agent Infrastructure & Buyer Capabilities (34 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P19-001 | [Backend] Integrate Claude API with model routing (Opus/Sonnet/Haiku) | 3 | P0 | agent, backend, feature | P01-002 | Yes |
| P19-002 | [Backend] Implement token budget enforcement per plan tier (Free 50K/Business 500K/Enterprise 5M) | 3 | P0 | agent, backend, feature | P19-001, P02-007 | Yes |
| P19-003 | [Backend] Implement per-capability confidence threshold configuration | 2 | P1 | agent, backend, feature | P19-001 | Yes |
| P19-004 | [Backend] Implement agent guardrails (factual filtering, vendor name validation, no direct scoring recs) | 3 | P1 | agent, backend, feature | P19-001 | Yes |
| P19-005 | [Backend] Implement agent error handling (retry with backoff, graceful degradation, context truncation) | 3 | P1 | agent, backend, feature | P19-001 | Yes |
| P19-006 | [Backend] Implement Custom Agent Instructions CRUD (per-team, sandboxed, max 50, ≤5000 chars, applied ≤60s) | 3 | P1 | agent, backend, feature | P19-001, P04-025 | Yes |
| P19-007 | [Frontend] Implement agent cost dashboard (per-capability token breakdown, remaining budget) | 3 | P1 | agent, frontend, feature | P19-002 | Yes |
| P19-008 | [Frontend] Implement agent error state UIs (rate limit, token exhaustion, plan gate, parse failure, timeout) | 3 | P1 | agent, frontend, feature | P03-029, P03-012 | Yes |
| P19-009 | [Backend] Implement #1 Policy Document Parsing capability (Opus) | 5 | P1 | agent, backend, feature, business | P19-001, P05-011 | No |
| P19-010 | [Backend] Implement #2 Policy Deduplication capability (Haiku, ≥90% threshold) | 3 | P1 | agent, backend, feature, business | P19-001 | Yes |
| P19-011 | [Frontend] Implement Policy Deduplication UI (warning flag, merge/keep/dismiss) | 2 | P1 | agent, frontend, feature, business | P19-010, P03-030 | Yes |
| P19-012 | [Backend] Implement #3 Policy Traceability Mapping capability (Sonnet) | 3 | P1 | agent, backend, feature, business | P19-009 | Yes |
| P19-013 | [Frontend] Implement Traceability mapping display (view in source PDF link) | 2 | P2 | agent, frontend, feature, business | P19-012, P03-027 | Yes |
| P19-014 | [Backend] Implement #4 Triage Auto-Mapping capability (Haiku) | 3 | P1 | agent, backend, feature | P19-001, P02-015 | Yes |
| P19-015 | [Frontend] Implement Triage Auto-Mapping UI (team badge, confidence, rationale tooltip) | 2 | P1 | agent, frontend, feature | P19-014 | Yes |
| P19-016 | [Backend] Implement #5 Requirement Splitting capability (Sonnet) | 3 | P1 | agent, backend, feature | P19-001 | Yes |
| P19-017 | [Frontend] Implement Requirement Splitting UI (proposed splits, accept/reject per split) | 2 | P1 | agent, frontend, feature | P19-016, P03-030 | Yes |
| P19-018 | [Backend] Implement #6 Vendor Invite Suggestion capability (Sonnet, Enterprise) | 3 | P2 | agent, backend, feature, enterprise | P19-001, P04-048 | Yes |
| P19-019 | [Frontend] Implement Vendor Invite Suggestion UI (top 10, rationale, add-to-shortlist) | 2 | P2 | agent, frontend, feature, enterprise | P19-018, P03-030 | Yes |
| P19-020 | [Backend] Implement #9 Q&A Answer Suggestion capability (Sonnet, Business+) | 3 | P2 | agent, backend, feature, business | P19-001, P04-039 | Yes |
| P19-021 | [Backend] Implement #10 Pre-Scoring capability (Sonnet, Business+) | 3 | P1 | agent, backend, feature, business | P19-001, P04-033 | Yes |
| P19-022 | [Frontend] Implement Pre-Scoring UI (pre-score all button, agent icon overlay, view rationale) | 2 | P1 | agent, frontend, feature, business | P19-021, P03-029 | Yes |
| P19-023 | [Backend] Implement #11 Disagreement Insight Card generation (Sonnet, Business+) | 3 | P1 | agent, backend, feature, business | P19-001, P08-015 | Yes |
| P19-024 | [Backend] Implement #12 Demo Focus Brief generation (Sonnet, Business+) | 3 | P2 | agent, backend, feature, business | P19-001 | Yes |
| P19-025 | [Frontend] Implement Demo Focus Brief UI (modal with brief, download PDF, copy) | 2 | P2 | agent, frontend, feature, business | P19-024, P03-011 | Yes |
| P19-026 | [Backend] Implement #13 "What Would Flip" analysis (Sonnet, Business+) | 3 | P2 | agent, backend, feature, business | P19-001, P08-009 | Yes |
| P19-027 | [Frontend] Implement "What Would Flip" UI (sensitivity table, export, what-if mode) | 2 | P2 | agent, frontend, feature, business | P19-026 | Yes |
| P19-028 | [Backend] Implement #14 TCO Analysis Narrative (Sonnet, Business+) | 3 | P2 | agent, backend, feature, business | P19-001, P09-011 | Yes |
| P19-029 | [Frontend] Implement TCO Analysis Narrative display (modal, download PDF, share) | 2 | P2 | agent, frontend, feature, business | P19-028, P03-011 | Yes |
| P19-030 | [Backend] Implement #15 Sensitivity Narrative (Sonnet, Enterprise) | 2 | P2 | agent, backend, feature, enterprise | P19-001, P09-005 | Yes |
| P19-031 | [Backend] Implement #16 Org Intelligence Briefing (Sonnet, Business+) | 3 | P2 | agent, backend, feature, business | P19-001, P04-009 | Yes |
| P19-032 | [Backend] Implement #19 Pulse Digest text generation (Sonnet, all plans) | 2 | P1 | agent, backend, feature | P19-001, P11-001 | Yes |
| P19-033 | [Backend] Implement #20 SLA Escalation rules (rule-based, all plans) | 2 | P1 | agent, backend, feature | P02-032 | Yes |
| P19-034 | [Backend] Implement #21 Comment Thread Summary (Haiku, all plans) | 2 | P2 | agent, backend, feature | P19-001, P04-038 | Yes |
| P19-035 | [Backend] Implement #22 `defense_view_generate` capability (Sonnet); register in §21.4 / §4.8.2 with plan-gating per §5.11 (Solo / Free: watermarked preview only; Starter+: full PDF + watermark removal) and `solo_envelope_no_block=true` (post-decision deliverable exempt from envelope throttling); buyer capability count moves from 17 to 18 — Phase 14.16, M11.3 cross-project consumer | 3 | P1 | agent, backend, feature, business | P19-001, P11-019 | Yes |

---

### P20: Agent Seller Capabilities (12 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P20-001 | [Backend] Implement #7 KB-to-Response Suggestion capability (Haiku) | 3 | P1 | agent, backend, feature | P19-001, P05-012 | Yes |
| P20-002 | [Frontend] Wire KB-to-Response suggestions into Response Editor sidebar | 2 | P1 | agent, frontend, feature | P20-001, P13-005 | Yes |
| P20-003 | [Backend] Implement #8 Evidence Parsing capability (Sonnet) | 3 | P1 | agent, backend, feature | P19-001, P04-041 | Yes |
| P20-004 | [Frontend] Implement Evidence Parsing UI (extracted claims badge, expand view with quotes) | 2 | P1 | agent, frontend, feature | P20-003, P03-029 | Yes |
| P20-005 | [Backend] Implement #17 KB Staleness Detection capability (Haiku, daily background job) | 3 | P1 | agent, backend, feature | P19-001, P14-004 | Yes |
| P20-006 | [Frontend] Wire KB Staleness Detection into Health Dashboard flags | 1 | P1 | agent, frontend, feature | P20-005, P14-005 | Yes |
| P20-007 | [Backend] Implement #18 KB-to-Capability Suggestion capability (Haiku) | 3 | P2 | agent, backend, feature | P19-001, P05-012 | Yes |
| P20-008 | [Frontend] Wire KB-to-Capability suggestions into Capability Declarations UI | 2 | P2 | agent, frontend, feature | P20-007, P15-006 | Yes |
| P20-009 | [Backend] Implement Firecrawl crawl scheduling agent (configurable frequency) | 3 | P1 | agent, backend, feature | P19-001, P04-026 | Yes |
| P20-010 | [Backend] Implement Firecrawl page processing and chunking | 2 | P1 | agent, backend, feature | P20-009, P05-011 | Yes |
| P20-011 | [Backend] Implement Firecrawl deduplication against existing KB entries (Haiku, ≥85% match) | 2 | P1 | agent, backend, feature | P20-010, P19-001 | Yes |
| P20-012 | [Frontend] Wire Comment Thread Summary into comment UI (summarize button for ≥5) | 2 | P2 | agent, frontend, feature | P19-034, P10-006 | Yes |

---

### P21: Billing, Plans & Entitlements (14 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P21-001 | [Backend] Integrate Stripe SDK and configure products/prices for Free/Business/Enterprise | 3 | P0 | platform, backend, integration | P02-007 | Yes |
| P21-002 | [Backend] Implement Stripe Checkout session creation for Business plan | 2 | P0 | platform, backend, feature | P21-001 | Yes |
| P21-003 | [Backend] Implement subscription lifecycle management (create, update, cancel, resume) | 3 | P0 | platform, backend, feature | P21-002 | Yes |
| P21-004 | [Backend] Implement plan enforcement middleware (check plan_tier before gated mutations) | 3 | P0 | platform, backend, feature | P21-001, P02-007 | Yes |
| P21-005 | [Backend] Implement entitlement registry (feature→minimum plan tier mapping) | 2 | P0 | platform, backend, feature | P21-004 | Yes |
| P21-006 | [Backend] Implement overage billing (Business: per-unit charges for members, scenarios, API, tokens, storage) | 3 | P1 | platform, backend, feature | P21-003 | Yes |
| P21-007 | [Backend] Implement 14-day Business trial (no CC, auto-downgrade on expiry) | 2 | P1 | platform, backend, feature | P21-003 | Yes |
| P21-008 | [Frontend] Implement upgrade/downgrade flow with proration display | 3 | P1 | platform, frontend, feature | P21-003, P03-038 | Yes |
| P21-009 | [Frontend] Implement Plan & Billing settings page (current plan, usage, invoices) | 3 | P1 | platform, frontend, feature | P21-003 | Yes |
| P21-010 | [Backend] Implement agent token metering (per-capability usage tracking) | 2 | P1 | platform, backend, feature | P21-001, P19-002 | Yes |
| P21-011 | [Frontend] Implement invoice history page (date, amount, status, PDF download) | 2 | P2 | platform, frontend, feature | P21-003 | Yes |
| P21-012 | [Frontend] Implement plan limit exceeded modal (upgrade CTA) | 2 | P1 | platform, frontend, feature | P21-004, P03-011 | Yes |
| P21-013 | [Backend] Implement failed payment handling (grace period, downgrade notification) | 2 | P1 | platform, backend, feature | P21-003 | Yes |
| P21-014 | [Frontend] Implement usage dashboard (workspace count, member count, storage, agent tokens vs. limits) | 2 | P2 | platform, frontend, feature | P21-005 | Yes |
| P21-015 | [Backend] Register Buyer Solo Stripe SKUs (monthly $59, annual $49, per-evaluation $199 one-time) and Seller Solo Stripe SKUs (monthly $59, annual $49, per-bid $199 one-time) per BPS / SPS v3 | 2 | P0 | platform, backend, integration | P21-001 | Yes |
| P21-016 | [Backend] Extend plan_tier enum to include `buyer_solo` and `seller_solo`; update default-derivation function for `evaluation_owner_mode` to honor `buyer_solo` → `solo` per M02.3 | 1 | P0 | platform, backend, feature | P21-001, P02-033 | Yes |
| P21-017 | [Backend] Apply §5.11 Feature Access Matrix Solo entitlements per Phase 14.9 (entitlement registry rows for buyer_solo + seller_solo) | 2 | P0 | platform, backend, feature | P21-005, P21-016 | Yes |
| P21-018 | [Backend] Implement per-evaluation / per-bid charge mutation with §34.2.5 14-day refund-window logic (refundable while Workspace.status = `draft`; non-refundable once any phase advancement occurs; emits Solo charge billing-events) | 3 | P0 | platform, backend, feature | P21-001, P02-016 | Yes |
| P21-019 | [Backend] Implement EnvelopeCounter persistence per `(org_id, console, envelope_window_id)` with cross-console isolation (Buyer Solo + Seller Solo Orgs have independent envelope state per §34.10.3 / §44.6) | 3 | P0 | platform, backend, feature | P04-051 | Yes |
| P21-020 | [Backend] Implement §44.6.4 silent throttling on `low_priority_background` capabilities at ≥80% envelope; First-Pass RFP Generator exempt via `solo_envelope_no_block=true`; emits `solo.envelope.throttling_engaged` / `cleared` engine events | 3 | P0 | platform, backend, feature | P21-019, P19-001 | Yes |
| P21-021 | [Backend] Implement `solo.envelope.exhausted` and `solo.capability.envelope_no_block_invoked` engine events with Ops-only routing (MUST NOT route to Solo-Org webhook subscribers / in-app inbox / email) | 2 | P0 | platform, backend, feature | P21-020 | Yes |
| P21-022 | [Backend] Register Appendix J `surface_throttling_class` enum (`active_workflow`, `low_priority_background`, `never_throttle`) and `billing_event_charge_kind` enum extension per Phase 14.9 | 1 | P1 | platform, backend, feature | P04-051 | Yes |
| P21-023 | [Frontend] Implement Solo single-Card billing surface (Subscription variant) per UX §8.1.2 — current plan, next renewal, manage-billing CTA, full state catalog (Loading / Empty / Error) | 3 | P0 | platform, frontend, feature | P21-015, P21-016 | Yes |
| P21-024 | [Frontend] Implement Solo single-Card billing surface (Per-evaluation variant) per UX §8.1.2 — pay-per-eval price, refund-window countdown, refund CTA, refund-window-exceeded state | 3 | P0 | platform, frontend, feature | P21-018, P21-023 | Yes |
| P21-025 | [Frontend] Implement Solo single-Card billing surface (Per-bid variant) per UX §8.1.2 — seller-side mirror of per-eval surface | 3 | P0 | platform, frontend, feature | P21-018, P21-023 | Yes |
| P21-026 | [Frontend] Implement throttling-toast surface (fires once per envelope window when `low_priority_background` capability hits 80% threshold; copy per UX §8.1.2; engine event source `solo.envelope.throttling_engaged`) | 2 | P0 | platform, frontend, feature | P21-020, P03-012 | Yes |
| P21-027 | [Frontend] Enforce §44.6.1 Surface Hide List on Solo: AIWallet widget, value-dollars rate-card, overage configuration, auto-topup configuration, AIOperation per-call cost, OutcomeContract surface, CapabilityRegistry surface, CostBaseRecalculationLog surface MUST NOT render on Solo (component-level conditional rendering) | 3 | P0 | platform, frontend, feature | P21-016 | No |
| P21-028 | [Frontend] Implement Solo upgrade-modal (deep-linkable from Defense View watermarked-preview, Solo throttling toast, Solo capability gate denial; routes to Starter+ checkout) | 2 | P1 | platform, frontend, feature | P21-008, P21-016 | Yes |
| P21-029 | [Backend] Implement deploy-time validators per Phase 14.18: `solo_engine_metering_parity`, `solo_telemetry_no_customer_routing`, `solo_envelope_value_single_source`, `solo_billing_card_price_single_source`, `solo_throttling_class_change_takes_effect_at_next_envelope_rollover`, `solo_envelope_per_console_isolation`, `solo_capability_registry_field_registration` | 3 | P1 | platform, backend, qa | P21-019, P24-014 | No |
| P21-030 | [Frontend] Implement Solo upgrade-CTA telemetry events (`solo_upgrade_cta_rendered_*` family) per Phase 14.9 telemetry registration | 1 | P2 | platform, frontend, feature | P21-028, P24-018 | Yes |

---

### P22: Notifications & Email (22 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P22-001 | [Backend] Implement notification delivery system (create, route by preference, deliver) | 3 | P0 | platform, backend, feature | P04-022, P04-023 | Yes |
| P22-002 | [Backend] Implement notification preference mutations (per-event × per-channel × per-workspace) | 3 | P1 | platform, backend, feature | P04-023 | Yes |
| P22-003 | [Backend] Implement quiet hours, DND mode, and entity mute (24h) | 2 | P1 | platform, backend, feature | P22-002 | Yes |
| P22-004 | [Backend] Implement notification batching for daily and weekly digests | 3 | P1 | platform, backend, feature | P22-001 | Yes |
| P22-005 | [Frontend] Implement bell icon popover with unread count and recent notifications | 2 | P0 | platform, frontend, feature | P22-001, P03-016 | Yes |
| P22-006 | [Frontend] Implement notification preferences management page | 3 | P1 | platform, frontend, feature | P22-002, P03-039 | Yes |
| P22-007 | [Integration] Integrate Loops.so SDK for email delivery | 2 | P0 | platform, integration, feature | P01-001 | Yes |
| P22-008 | [Integration] Implement phase advancement email template | 2 | P1 | platform, integration, feature | P22-007 | Yes |
| P22-009 | [Integration] Implement SLA pre-breach and breach email templates | 2 | P1 | platform, integration, feature | P22-007 | Yes |
| P22-010 | [Integration] Implement amendment published and reverification email templates | 2 | P1 | platform, integration, feature | P22-007 | Yes |
| P22-011 | [Integration] Implement NDA signature request email template | 1 | P1 | platform, integration, feature | P22-007 | Yes |
| P22-012 | [Integration] Implement KB staleness and document expiration email templates | 2 | P2 | platform, integration, feature | P22-007 | Yes |
| P22-013 | [Integration] Implement scoring complete and response received email templates | 2 | P1 | platform, integration, feature | P22-007 | Yes |
| P22-014 | [Integration] Implement trial expiring (T-3, T-1) and plan downgrade email templates | 2 | P1 | platform, integration, feature | P22-007 | Yes |
| P22-015 | [Integration] Implement Pulse digest email template | 2 | P1 | platform, integration, feature | P22-007, P19-032 | Yes |
| P22-016 | [Integration] Implement mention, invitation, and generic notification email templates | 2 | P1 | platform, integration, feature | P22-007 | Yes |
| P22-017 | [Integration] Implement Slack notification integration (OAuth, channel selection, event filtering) | 3 | P1 | platform, integration, feature | P22-001 | Yes |
| P22-018 | [Backend] Implement Slack failure handling (retry 3x, email fallback, disconnection notice) | 2 | P2 | platform, backend, feature | P22-017 | Yes |
| P22-019 | [Integration] Implement Microsoft Teams notification integration | 3 | P2 | platform, integration, feature, enterprise | P22-001 | Yes |
| P22-020 | [Frontend] Implement Settings: Integrations page (Slack, Teams, webhooks config) | 3 | P1 | platform, frontend, feature | P22-017, P04-047 | Yes |
| P22-021 | [Frontend] Implement Settings: Audit Logs page (searchable, filterable, expandable detail) | 3 | P2 | platform, frontend, feature | P04-040 | Yes |
| P22-022 | [Frontend] Implement Settings: SCIM page (provisioning endpoint, token, sync status) | 2 | P2 | platform, frontend, feature, enterprise | P02-005 | Yes |
| P22-023 | [Integration] Implement DefenseView webhook deliveries (`defense_view.generated`, `defense_view.regenerated`) and Solo / Free upgrade-modal email when watermarked preview rendered — Phase 14.16, M11.3 cross-project consumer | 2 | P1 | platform, integration, feature | P22-001, P22-007, P11-024 | Yes |
| P22-024 | [Integration] Implement Solo billing email templates (subscription confirmation / renewal / cancellation; per-eval / per-bid charge confirmation; refund-window-expiry warning) — Phase 14.16, M21.3 cross-project consumer | 2 | P1 | platform, integration, feature | P22-007, P21-018 | Yes |
| P22-025 | [Integration] Implement EvalStarter `eval_starter.updated` webhook delivery (system-seed registry refresh propagation) — Phase 14.16, M06.3 cross-project consumer | 1 | P2 | platform, integration, feature | P22-001, P06-030 | Yes |
| P22-026 | [Backend] Implement notification-preferences UI suppression rule per §29.3 reflecting §2.8 contract (Solo Mode hides Pulse digest / SLA / stakeholder notification toggles) — Phase 14.16, M02.3 cross-project consumer | 2 | P1 | platform, backend, feature | P22-002, P02-033 | Yes |

---

### P23: Security & Compliance Hardening (18 issues)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P23-001 | [Backend] Configure CSP headers (script-src 'self', frame-src 'none', img-src 'self') | 2 | P0 | platform, backend, security | P01-001 | Yes |
| P23-002 | [Backend] Implement Markdown sanitization via DOMPurify (allowlist enforcement) | 2 | P0 | platform, backend, security | P03-025 | Yes |
| P23-003 | [Backend] Configure CORS (origin whitelist, credentials, preflight caching) | 2 | P0 | platform, backend, security | P04-044 | Yes |
| P23-004 | [Backend] Implement auth endpoint hardening (5-attempt lockout, rate limiting, CAPTCHA) | 3 | P0 | platform, backend, security | P02-001 | Yes |
| P23-005 | [Backend] Implement API token rotation enforcement (90-day for Enterprise) | 2 | P1 | platform, backend, security, enterprise | P04-044 | Yes |
| P23-006 | [Backend] Implement domain governance (claimed corporate domains block unsanctioned org creation) | 2 | P1 | platform, backend, security | P02-007 | Yes |
| P23-007 | [Backend] Implement DSAR export (JSON: profile, audit logs, comments, scores, authored reqs) | 3 | P1 | platform, backend, compliance | P04-040 | Yes |
| P23-008 | [Backend] Implement data anonymization for right-to-erasure (preserve audit trail integrity) | 3 | P1 | platform, backend, compliance | P23-007 | Yes |
| P23-009 | [Backend] Implement account closure with 30-day grace period and auto-delete | 2 | P1 | platform, backend, compliance | P02-014 | Yes |
| P23-010 | [Backend] Implement IP restriction enforcement (Enterprise: CIDR, config UI, middleware) | 3 | P1 | platform, backend, security, enterprise | P02-019 | Yes |
| P23-011 | [Frontend] Implement IP restriction configuration page (Enterprise) | 2 | P2 | platform, frontend, feature, enterprise | P23-010 | Yes |
| P23-012 | [Frontend] Implement custom branding configuration (Enterprise: logo, color, WCAG validation) | 3 | P2 | platform, frontend, feature, enterprise | P03-001 | Yes |
| P23-013 | [Backend] Implement custom domain setup (CNAME, auto SSL, verification flow) | 3 | P2 | platform, backend, feature, enterprise | P01-004 | Yes |
| P23-014 | [Integration] Integrate Perplexity Search API for vendor research (Enterprise) | 3 | P2 | platform, integration, feature, enterprise | P19-001 | Yes |
| P23-015 | [Backend] Implement Settings: Security & SSO page backend (SAML config, MFA enforcement) | 2 | P1 | platform, backend, feature, enterprise | P02-003 | Yes |
| P23-016 | [Frontend] Implement Settings: Security & SSO page | 2 | P1 | platform, frontend, feature, enterprise | P23-015 | Yes |
| P23-017 | [Backend] Implement SIEM log forwarding for Enterprise (Splunk, Sumo Logic via Datadog) | 2 | P2 | platform, backend, feature, enterprise | P01-007 | Yes |
| P23-018 | [Backend] Implement PagerDuty integration for alert routing and on-call | 2 | P2 | platform, backend, integration | P01-007 | Yes |
| P23-019 | [Frontend] Implement Solo-tier MFA-not-available rendering in Settings: Security page (MFA section disabled with Starter+ upgrade CTA per Phase 14.9 §34.1.1 row "MFA") — Phase 14.16, M21.3 cross-project consumer | 2 | P1 | platform, frontend, feature | P23-016, P21-016 | Yes |

---

### P24: QA, Performance & Launch Prep (28 issues + 6 Phase 14.16 net-new for M24.3 = 34 total)

| # | Title | Est | Pri | Labels | Dependencies | Codex |
|---|-------|-----|-----|--------|-------------|-------|
| P24-001 | [QA] Write E2E tests for auth flows (sign up, sign in, SSO, MFA, sign out) | 3 | P0 | platform, qa | P02-001 | Yes |
| P24-002 | [QA] Write E2E tests for requirement CRUD and matrix interactions | 3 | P0 | buyer, qa | P06-005 | Yes |
| P24-003 | [QA] Write E2E tests for scoring workflow (grade entry, collaborative, immutability) | 3 | P0 | buyer, qa | P08-001 | Yes |
| P24-004 | [QA] Write E2E tests for phase pipeline (all 13 phases, gate validation) | 5 | P0 | platform, qa | P02-024 | No |
| P24-005 | [QA] Write E2E tests for billing (checkout, plan enforcement, upgrade, trial) | 3 | P0 | platform, qa | P21-001 | Yes |
| P24-006 | [QA] Write E2E tests for marketplace (browse, search, EOI, listing) | 3 | P1 | marketplace, qa | P17-001 | Yes |
| P24-007 | [QA] Write E2E tests for seller flow (bid workspace, response editor, KB) | 3 | P1 | seller, qa | P13-001 | Yes |
| P24-008 | [QA] Write E2E tests for Q&A and comments | 2 | P1 | buyer, qa | P10-001 | Yes |
| P24-009 | [A11y] Audit all pages for WCAG 2.1 AA color contrast (≥4.5:1 text, ≥3:1 large text) | 3 | P1 | platform, a11y | All frontend | No |
| P24-010 | [A11y] Verify keyboard navigation on all pages (Tab order, no traps, focus visible) | 3 | P1 | platform, a11y | All frontend | No |
| P24-011 | [A11y] Verify aria-labels, roles, and landmarks on all components | 2 | P1 | platform, a11y | All frontend | Yes |
| P24-012 | [A11y] Verify 48×48px touch targets on mobile and skip-to-content link | 2 | P2 | platform, a11y | P03-044 | Yes |
| P24-013 | [A11y] Verify reduced-motion support (prefers-reduced-motion: reduce) | 1 | P2 | platform, a11y | P03-001 | Yes |
| P24-014 | [A11y] Integrate axe-core automated a11y testing in CI | 2 | P1 | platform, a11y, qa | P01-005 | Yes |
| P24-015 | [Infra] Optimize JS bundle size (<500KB gzipped) | 3 | P1 | platform, infra, tech-debt | All frontend | No |
| P24-016 | [Infra] Optimize API latency (p95 <500ms, read <100ms) | 3 | P1 | platform, infra, tech-debt | All backend | No |
| P24-017 | [Infra] Optimize page load (<1s first paint, <2s TTI, <0.1 CLS) | 3 | P1 | platform, infra, tech-debt | All frontend | No |
| P24-018 | [Backend] Define PostHog event schema (all trackable user actions) | 2 | P1 | platform, backend, feature | P01-001 | Yes |
| P24-019 | [Frontend] Instrument PostHog events across all features | 3 | P1 | platform, frontend, feature | P24-018 | Yes |
| P24-020 | [Backend] Configure PostHog feature flags per environment | 2 | P1 | platform, backend, feature | P24-018 | Yes |
| P24-021 | [Integration] Set up Statuspage.io with synthetic endpoint checks from 3+ geos | 2 | P1 | platform, integration | P01-004 | Yes |
| P24-022 | [Integration] Integrate Zendesk for customer support ticketing | 2 | P2 | platform, integration | P01-001 | Yes |
| P24-023 | [Backend] Create data seed scripts (default templates, plan tiers, initial admin) | 3 | P0 | platform, backend, feature | P04-028, P21-001 | Yes |
| P24-024 | [Integration] Implement Phase 13 export to Jira Cloud (UC→Epic, Req→Issue) | 3 | P2 | platform, integration, feature | P04-001 | Yes |
| P24-025 | [Integration] Implement Phase 13 export to Linear (UC→Project, Req→Issue) | 3 | P2 | platform, integration, feature | P04-001 | Yes |
| P24-026 | [Integration] Implement Phase 13 export to Asana and Azure DevOps | 3 | P2 | platform, integration, feature | P04-001 | Yes |
| P24-027 | [Integration] Implement Salesforce bidirectional account sync | 3 | P2 | platform, integration, feature, enterprise | P04-048 | Yes |
| P24-028 | [Docs] Generate API documentation (OpenAPI spec, interactive explorer) | 3 | P2 | platform, docs | P04-044 | Yes |
| P24-029 | [Docs] Author PR template line item "Appendix M row added or updated" with reviewer rejection authority and link to Master Spec Appendix M.2 process gates | 1 | P0 | platform, docs | None | Yes |
| P24-030 | [Docs] Publish Appendix M maintenance convention in `/AGENTS.md` and per-PR review checklist (Build_Execution_Strategy.md §8.1) so Claude Code authors apply the rule on every change | 1 | P0 | platform, docs | P24-029 | Yes |
| P24-031 | [Backend] Wire CI gate `appendix_m_engine_to_surface_completeness` into GitHub Actions PR pipeline (blocks merge if a new engine concept lands without a corresponding Appendix M row in the same commit; reuses the Phase 14.18-authored validator) | 3 | P0 | platform, backend, qa | P24-029, P01-005 | No |
| P24-032 | [Backend] Wire CI gate `appendix_m_no_inline_engine_concepts_in_ux_spec` into PR pipeline (blocks merge if `UX_Design_of_Sourcera.md` references an engine concept not in Appendix M) | 2 | P0 | platform, backend, qa | P24-031 | No |
| P24-033 | [Backend] Schedule weekly `appendix_m_no_orphan_engine_concept` job (surfaces Appendix M rows that no longer resolve to a live Master Spec section; routes findings to Ops Slack channel) | 2 | P1 | platform, backend, qa | P24-031 | Yes |
| P24-034 | [QA] Add Appendix M coverage as a P0 check in Phase 14.19 adversarial-review test pack per Appendix M.2 gate #3 | 1 | P0 | platform, qa | P24-031 | Yes |

---

## 9. Migration and Execution Order

### 9.1 Linear Workspace Setup

1. Create Linear workspace "Sourcera".
2. Configure statuses: Backlog → Todo → In Progress → In Review → Done → Cancelled.
3. Set estimate scale to Fibonacci (1, 2, 3, 5, 8).

### 9.2 Team Creation

Create in order:
1. Platform
2. Buyer Experience
3. Seller Experience
4. Intelligence

### 9.3 Taxonomy Setup

Create all labels per Section 1.9.

### 9.4 Initiative Creation

Create in order: I1 → I2 → I3 → I4 → I5 → I6.

### 9.5 Project Creation

Create in order: P01 → P24.

### 9.6 Milestone Creation

Create milestones per Section 5, assigned to their parent projects.

### 9.7 Issue Import Order

Import sequentially by project to ensure dependency links resolve correctly:

1. P01 (P01-001 through P01-014) — no dependencies on other projects
2. P02 (P02-001 through P02-032) — depends on P01
3. P03 (P03-001 through P03-050) — depends on P01
4. P04 (P04-001 through P04-048) — depends on P01, P02
5. P05 (P05-001 through P05-012) — depends on P04
6. P06 (P06-001 through P06-028) — depends on P02, P03, P04
7. P07 (P07-001 through P07-014) — depends on P04, P06
8. P08 (P08-001 through P08-022) — depends on P04, P05, P06
9. P09 (P09-001 through P09-014) — depends on P08
10. P10 (P10-001 through P10-016) — depends on P04, P05, P06
11. P11 (P11-001 through P11-016) — depends on P04, P06, P08
12. P12 (P12-001 through P12-012) — depends on P04, P06, P19
13. P13 (P13-001 through P13-020) — depends on P04, P07
14. P14 (P14-001 through P14-016) — depends on P04, P05
15. P15 (P15-001 through P15-010) — depends on P04
16. P16 (P16-001 through P16-010) — depends on P02, P03
17. P17 (P17-001 through P17-014) — depends on P05, P07, P15
18. P18 (P18-001 through P18-010) — depends on P15, P17
19. P19 (P19-001 through P19-034) — depends on P04, P05
20. P20 (P20-001 through P20-012) — depends on P14, P19
21. P21 (P21-001 through P21-014) — depends on P02
22. P22 (P22-001 through P22-022) — depends on P04
23. P23 (P23-001 through P23-018) — depends on P02, P04
24. P24 (P24-001 through P24-028) — depends on all

### 9.8 First Cycle Population

**Cycle 1 (~18 points):**
- P01-001 through P01-005 (infra setup, 11 pts)
- P03-001, P03-003, P03-004 (design tokens, forms, button, 5 pts)
- P01-010 (env vars, 1 pt)

**Cycle 2 (~18 points):**
- P01-006 through P01-009 (observability, 7 pts)
- P02-001, P02-002 (auth, 5 pts)
- P03-005 through P03-008 (core input components, 6 pts)

**Cycle 3 (~19 points):**
- P02-007 through P02-012 (org/user/team/workspace schemas, 12 pts)
- P03-010 through P03-012 (FormField, Modal, Toast, 6 pts)
- P01-012 (ShadCN/UI, 2 pts — if not done)

**Cycle 4 (~18 points):**
- P02-013 through P02-018 (org/user/team/workspace CRUD, 14 pts)
- P03-013 through P03-016 (badges, avatar, chips, skeleton, 6 pts)

**Cycle 5 (~18 points):**
- P02-019 through P02-023 (RBAC middleware, all roles, 14 pts)
- P03-017 through P03-020 (breadcrumb, alert, card, tabs, 4 pts)

**Cycle 6 (~17 points):**
- P02-024 through P02-030 (phase pipeline + gates, 17 pts)

**Cycle 7 (~16 points):**
- P03-021 through P03-024 (DataTable, SidePeek, CommandPalette, 14 pts)
- P02-031, P02-032 (SLA timer, 5 pts — if capacity allows)

**Cycle 8 (~18 points):**
- P03-025 through P03-030 (advanced components batch 1, 14 pts)
- P03-040 (buyer sidebar, 3 pts)

### 9.9 First Codex Execution Sequence

Codex processes issues in strict dependency order. The recommended first-pass sequence:

**Sequence 1 (P01 — no dependencies):**
P01-001 → P01-002 → P01-003 → P01-004 → P01-005 → P01-010

**Sequence 2 (P01 observability — parallel with Sequence 3):**
P01-006 → P01-007 → P01-008 → P01-009

**Sequence 3 (P02 auth — after P01-002):**
P02-001 → P02-002

**Sequence 4 (P03 tokens/components — after P01-001, P01-003):**
P03-001 → P03-003 → P03-004 → P03-005 → P03-006 → P03-007 → P03-008 → P03-009 → P03-010

**Sequence 5 (P02 schemas — after P01-002):**
P02-007 → P02-008 → P02-009 → P02-010 → P02-011 → P02-012

**Sequence 6 (P02 mutations — after Sequence 5):**
P02-013 → P02-014 → P02-015 → P02-016 → P02-017 → P02-018

**Sequence 7 (P02 RBAC — after Sequence 6):**
P02-019 → P02-020 → P02-021 → P02-022 → P02-023

**Sequence 8 (P02 phase pipeline — after P02-016):**
P02-024 → P02-025 → P02-026 → P02-027 → P02-028 → P02-029 → P02-030

**Sequence 9 (P04 schemas — after P02-011):**
P04-001 → P04-002 → P04-003 → P04-004 → P04-005 → P04-006 → P04-007 through P04-029

**Sequence 10 (P04 mutations — after Sequence 9 + Sequence 7):**
P04-030 → P04-031 → P04-032 → P04-033 → P04-034 through P04-048

**Sequence 11 (P03 advanced components — after P03-010):**
P03-011 through P03-039

**Sequence 12 (P03 shell — after Sequence 11 + P02-001):**
P03-040 → P03-041 → P03-042 → P03-043 → P03-044 → P03-045 → P03-046 → P03-047 → P03-048 → P03-049 → P03-050

### 9.10 Contingency Plans

- **Convex integration failure (P01-002):** Fall back to Supabase/PostgreSQL. Requires re-scoping P04/P05 schemas and dropping real-time OT temporarily. Decision point: Day 3 of Cycle 1.
- **WorkOS auth failure (P02-001):** Fall back to NextAuth.js with email/password. Defer SSO/SCIM to post-launch. Decision point: Day 3 of Cycle 2.
- **Claude API access issues (P19-001):** Stub all agent capabilities with mock responses. Defer intelligence features to post-launch. All consuming features still build but display "AI features coming soon."

---

## 10. Guardrails

### 10.1 Issue Size

- Maximum: 5 points for any issue entering a cycle.
- 8-point issues must be split before scheduling.
- Split trigger: title contains "and" joining distinct concerns, or issue touches ≥3 distinct files/layers.
- Minimum: 1 point (meaningful implementation step).

### 10.2 Duplicate Prevention

- Search project by title keywords before creating.
- Each schema field, UI component, backend mutation appears in exactly one issue.
- Cross-reference via dependency link, not duplicate issue.

### 10.3 Dependency Correctness

- Every `blocked by` link points to an issue producing something the blocked issue consumes.
- No circular dependencies.
- No forward references to later sequences.
- Schema → mutation → frontend chain must be explicit.

### 10.4 Title Clarity

- Starts with `[Layer]` prefix.
- Contains verb from approved list: Define, Implement, Configure, Enforce, Integrate, Write, Add, Create, Wire, Build, Set up.
- Names specific entity/component, not generic feature name.

### 10.5 Acceptance Criteria

- Minimum 2 per issue.
- Each independently verifiable.
- No vague outcomes.
- Specific thresholds where applicable.

### 10.6 Agent-Friendly Scope

- One clear purpose executable in one pass.
- No architectural decisions required (pre-decided in implementation notes).
- File paths and patterns specified.
- No requirement to read unrelated codebase.

### 10.7 Sequencing

- Never place issue in cycle before blockers are Done.
- Integration testing issues always after features they test.
- Wave boundaries are soft — individual issues advance if blockers met.

### 10.8 Cycle Discipline

- Target 80% capacity per cycle.
- No issue enters cycle without acceptance criteria.
- Carry-over reviewed explicitly.
- Maximum 1 spike per cycle per team.
- Maximum carry-over: if ≥30% two cycles running, escalate for scope review.

### 10.9 Cross-Project Dependencies

- Tracked via Linear issue links.
- Both project leads acknowledge.
- Auto-flagged as P0 priority.

### 10.10 Frontend-Backend Completeness

- Every schema issue must have corresponding backend mutation issue(s).
- Every user-facing backend mutation must have corresponding frontend issue(s).
- Validate in PR review before adding to Linear.

### 10.11 Plan-Gated Feature Enforcement

- Every issue labeled `business` or `enterprise` must depend on P21-004 (plan enforcement middleware) or document how plan gating is enforced in acceptance criteria.
- Plan-gated features built before P21-004 must include conditional rendering stub.

### 10.12 Notification Coverage

- Every mutation that changes entity state must document in issue description whether a notification is triggered.
- If yes: event type, recipients, channels.
- Review for completeness before approval.

### 10.13 Accessibility

- Every frontend component issue must include a11y acceptance criteria: keyboard nav, focus management, aria-labels, color contrast.
- New components must pass axe-core automated checks before merge.

---

**Total Issues (Phase 14.16 update): 531 across 24 projects, 6 initiatives.**

Baseline 462 issues + 69 Phase 14.16 net-new (58 in net-new milestone owning projects + 11 in cross-project consumer projects). No baseline issue is removed, deferred, or renumbered.

**Issue Distribution:**

| Project | Baseline | Phase 14.16 Net-New | Total | Net-new attributed to |
|---------|----------|---------------------|-------|------------------------|
| P01 | 14 | 0 | 14 | — |
| P02 | 32 | 10 | 42 | M02.3 (P02-033 → P02-042) |
| P03 | 50 | 1 | 51 | M02.3 cross-project consumer (P03-051 PipelineSurface) |
| P04 | 48 | 4 | 52 | M06.3 / M11.3 / M21.3 cross-project consumers (P04-049 → P04-052) |
| P05 | 12 | 0 | 12 | — |
| P06 | 28 | 12 | 40 | M06.3 (P06-029 → P06-040) |
| P07 | 14 | 0 | 14 | — |
| P08 | 22 | 0 | 22 | — |
| P09 | 14 | 0 | 14 | — |
| P10 | 16 | 0 | 16 | — |
| P11 | 16 | 14 | 30 | M11.3 (P11-017 → P11-030) |
| P12 | 12 | 0 | 12 | — |
| P13 | 20 | 0 | 20 | — |
| P14 | 16 | 0 | 16 | — |
| P15 | 10 | 0 | 10 | — |
| P16 | 10 | 0 | 10 | — |
| P17 | 14 | 0 | 14 | — |
| P18 | 10 | 0 | 10 | — |
| P19 | 34 | 1 | 35 | M11.3 cross-project consumer (P19-035 `defense_view_generate` capability — buyer count moves 17→18) |
| P20 | 12 | 0 | 12 | — |
| P21 | 14 | 16 | 30 | M21.3 (P21-015 → P21-030) |
| P22 | 22 | 4 | 26 | M11.3 / M21.3 / M06.3 / M02.3 cross-project consumers (P22-023 → P22-026) |
| P23 | 18 | 1 | 19 | M21.3 cross-project consumer (P23-019 Solo MFA-not-available) |
| P24 | 28 | 6 | 34 | M24.3 (P24-029 → P24-034) |
| **Total** | **462** | **69** | **531** | **5 net-new milestones (M02.3, M06.3, M11.3, M21.3, M24.3)** |

**Phase 14.16 net-new milestones (additions to v1 scope under single-ship discipline):**
- **M02.3** — Single-Operator Mode (P02 owning; P03 / P11 / P19 / P22 cross-project consumers)
- **M06.3** — Per-Vertical Eval Starters (P06 owning; P04 / P22 cross-project consumers)
- **M11.3** — Defense View (P11 owning; P04 / P19 / P22 cross-project consumers)
- **M21.3** — Solo Tier Billing Surface (P21 owning; P04 / P22 / P23 cross-project consumers)
- **M24.3** — Appendix M Maintenance Gate (P24 owning; cross-cutting CI + process across all projects)

**Existing v1 milestones unchanged.** Hero Moment (buyer M06.1 + M06.2 + M19.2 + M11.1; seller M16.1 + M16.2 + M14.1 + M14.2 + M20.1 + Phase 14.8 polish), KB engineering (M14.1 + M14.2 + M20.1), Marketplace destination (M17.1 + M17.2 + M18.1), dual-console firewall (cross-cutting M02.x + M04.x + M21.3 + M23.x), and all 17 PLG / network-effects growth mechanics remain in v1 scope. None is deferred or downscoped. See Build_Execution_Strategy.md §11.6 for the per-mechanic confirmation table.
