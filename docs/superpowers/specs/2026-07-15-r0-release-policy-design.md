# Lossless R0 Release Policy Design

**Date:** 2026-07-15  
**Status:** Approved design; implementation not started

## Goal

Make R0 exactly the smallest dependency-complete release that proves one defensible evaluation: one buyer creates an evaluation, invites one seller, receives an AI-assisted response, scores it, selects an outcome, and retains an immutable auditable record.

This policy changes release placement and dependency order only. It must not remove, merge away, weaken, or silently defer any feature, runtime gate, acceptance test, proof obligation, or source link.

## Preservation invariants

1. Every source feature and runtime gate is assigned to exactly one release, R0 through R5.
2. No source item is deleted or marked out of scope by release classification.
3. IDs, source references, acceptance criteria, dependencies, tests, telemetry, rollout, rollback, and proof stay intact.
4. A dependency can move earlier when required by an earlier release. It cannot move later than a dependent.
5. Runtime gates stay with the release that owns the proved behavior unless they are prerequisite controls.
6. Unclassified items fail generation. They never default to R0.
7. Repo policy is canonical. Linear is synchronized from it and read back before drift is considered closed.
8. Volatile readiness and blocker counts remain live scanner output; they are never copied into this policy.

## Current defect

The current release generator uses text and section matching, defaults unmatched work to R0, and then pulls dependencies forward. That makes R0 absorb unrelated later-release work. Truncated Linear issue text can also appear authoritative even when it is incomplete.

## R0 journey roots

R0 is the transitive dependency closure of these explicit roots.

### Evaluation records

- F-083 Workspace
- F-085 Use Case
- F-086 Requirement
- F-087 Response
- F-088 Score

### Buyer setup and invitation

- F-101 Target Account
- F-214 Vendor Discovery and Outreach
- F-215 Bidding Opens

### Seller entry, AI onboarding, and response

- F-105 Bid Workspace
- F-106 Bid Response
- F-387 Response Authoring
- F-389 Response Submission
- F-559 Seller Onboarding Flow
- F-560 Progress Storytelling Bootstrap UI
- F-687 Seven-Stage Seller Onboarding Flow
- F-688 Stage 1
- F-689 Stage 2
- F-690 Stage 3
- F-691 Stage 4
- F-692 Stage 5
- F-693 Stage 6
- F-694 Stage 7

All seven onboarding stages remain in R0. Their required Anthropic, knowledge-base, Firecrawl, MCP, AI-wallet, NDA, stake, debrief, authentication, data, and security dependencies are included through dependency closure. There is no manual-response fallback.

### Review, scoring, selection, and closure

- F-220 Scoring
- F-225 Selection
- F-226 Selection Report
- F-228 Closure
- F-229 Immutable Selection Record

### Journey state contract

- F-209 13-Phase Pipeline

The closure must also contain the platform, deployment, rollback, evidence, authentication, tenancy, console isolation, RBAC, audit, baseline security, retention, recovery, export, and access-enforcement work required by these roots.

## Later releases

All non-R0 items retain an explicit R1 through R5 assignment:

- R1: Team Evaluation and Collaboration
- R2: Repeatability, Reporting, and Operations
- R3: Marketplace Supply, Discovery, Matching, and Trust
- R4: Intelligence, Scenarios, TCO, and Agents
- R5: Enterprise Integrations, Compliance, Globalization, and Scale

Broader intelligence, scenarios, TCO, and agent features remain R4. AI, knowledge-base, Firecrawl, and MCP items strictly required by the seven-stage R0 seller journey move to R0 through dependency closure. No feature is duplicated between releases.

## Assignment algorithm

1. Load every canonical feature and runtime gate from its pinned source.
2. Require one explicit baseline release assignment for every item.
3. Build the directed dependency graph and fail on missing nodes, duplicate IDs, or cycles.
4. Seed R0 only from the listed journey roots.
5. Compute the full transitive dependency closure.
6. Move closure members to R0 when their baseline release is later.
7. Keep every non-closure item in its explicit baseline release.
8. Verify that no item is missing, duplicated, or assigned later than a dependent.
9. Emit the manifest, traceability map, dependency graph, readiness report, drift report, scorecard, and validation plan from the same normalized model.

## R0 build order

The R0 closure is scheduled as vertical slices in this order:

1. Local, CI, test, deploy, rollback, and evidence foundations.
2. Authentication, tenancy, console isolation, RBAC, audit, and baseline security.
3. Workspace, requirements, evaluation, and state-machine contracts.
4. Buyer setup and seller invitation.
5. Seller secure entry, full seven-stage AI onboarding, required NDA, response authoring, and submission.
6. Buyer review, scoring, selection, and closure.
7. Immutable selection record, export, retention, recovery, and access enforcement.
8. Canary, rollback, deployed receipts, and runtime-gate closure.

Each slice includes applicable UI, backend, data, authorization, accessibility, telemetry, failure and recovery behavior, tests, rollout, rollback, and named proof. WIP stays at one executable slice.

## Runtime gates

Runtime gates inherit the release of their owning behavior. Shared prerequisite controls take the earliest release that requires them. A runtime gate cannot be marked ready from documentation or planning evidence. Its required live proof lane remains unchanged.

## Linear synchronization

After repository generation and checks pass:

1. Update each Linear issue's release and milestone from the canonical manifest.
2. Preserve its source, parent, blockers, owner, reviewer, estimate, tests, rollout, rollback, telemetry, and proof fields.
3. Remove `codex-ready` from any issue that fails readiness.
4. Read the complete issue graph back from Linear without trusting truncated list text.
5. Compare the readback with the repository manifest and fail on any mismatch.

## Fail-closed checks

CI fails for:

- a missing source feature or runtime gate;
- a duplicate assignment;
- an unclassified item;
- a missing R0 root;
- a cycle or missing dependency;
- a dependency assigned later than its dependent;
- an unexpected R0 item outside the root closure;
- changed or lost issue fields during synchronization;
- false readiness;
- truncated source text treated as complete;
- repo-to-Linear or Linear-to-repo drift.

## Tests

The implementation must prove:

- every source item appears exactly once across R0 through R5;
- the expected R0 roots are present;
- F-559, F-560, and F-687 through F-694 are R0;
- F-689 is corrected from R5 to R0;
- every R0 dependency is also R0;
- unrelated R4 intelligence stays outside R0;
- unknown items fail instead of defaulting to R0;
- cycles, missing dependencies, duplicates, inversions, false readiness, truncation, and repo-to-Linear drift fail;
- a full Linear sync and readback preserves all issue fields.

## Rollback

Keep the previous generated artifacts and Linear values addressable by the pre-change Git commit and sync receipt. If generation, CI, synchronization, or readback fails, stop promotion, restore the prior repo policy and affected Linear release fields, regenerate, and verify the prior graph. Rollback must not delete or rewrite feature definitions.

## Exit proof

This design is complete only when:

- all source items are assigned exactly once;
- R0 equals the approved roots plus their dependency closure;
- the full AI seller onboarding is in R0;
- no unrelated later-release feature is pulled into R0;
- all fail-closed tests pass;
- repository artifacts agree;
- Linear sync and readback agree with the repository;
- live scanners report current readiness and runtime blockers without copied counts.
