# Sourcera Delivery Control Plane Design

**Status:** Approved direction; written specification pending final review
**Date:** 2026-07-14
**Scope:** Delivery-system control plane and the entry gate for R0 execution

## Objective

Make Sourcera executable from one governed chain:

`live source evidence -> generated delivery manifest -> validated dependency and release graph -> qualified Linear work -> tested product change -> deployed proof -> runtime promotion`

This design does not narrow the product goal. It establishes the controls required to execute R0 through R5 without losing coverage or inventing readiness.

## Authority

1. Live runtime evidence from `tools/release/stamp_gate.ts --json` and `tools/release/exact_status_scan.ts --json`.
2. `Sourcera_Master_Spec.md`.
3. `UX_Design_of_Sourcera.md` only where the Master Spec is silent.
4. Linear as the execution mirror, never the product authority.

Master Spec §34 owns pricing. Historical audits are evidence, not current status. Guidance and control files must not copy volatile counts.

## Chosen Approach

Use a repository-owned control plane and a verified Linear mirror before product implementation.

Rejected alternatives:

- Linear-first repair: leaves no deterministic repository gate against later workspace drift.
- Code-first execution: starts from false readiness and an unverified release graph.
- Separate product repository: no current repository or branch supports that boundary, and it would split source authority from delivery enforcement.

The application will be initialized in this repository after the first control-plane gate passes.

## Boundaries

The first bounded implementation covers:

- Canonical release, decision, risk, validation, and disposition inputs.
- Generated delivery manifest, traceability map, dependency graph, readiness report, drift report, and release scorecard.
- Fail-closed validation in local checks and CI.
- Linear release creation, readiness quarantine, controlled repair, and read-back verification.
- Qualification of the first R0 vertical slice.

It does not promote runtime rows, claim product behavior, or mark broad feature inventory rows complete.

## Repository Structure

Canonical human-authored inputs:

```text
delivery/
  releases.json
  dispositions.json
  decisions.jsonl
  risks.json
  validation-plan.json
  linear-snapshot.json
```

Generated, never hand-edited outputs:

```text
reports/delivery/
  delivery-manifest.json
  traceability-map.json
  dependency-graph.json
  readiness-report.json
  drift-report.json
  release-scorecard.json
```

Implementation and tests:

```text
tools/delivery/
  generate.ts
  verify.ts
  lib/
    sources.ts
    releases.ts
    graph.ts
    readiness.ts
    drift.ts
    scorecard.ts
  fixtures/
  *.test.ts
```

Each library owns one rule set. `generate.ts` composes source data into reports. `verify.ts` validates the reports and exits nonzero on any blocker.

## Stable Identity and Traceability

Every manifest row has a stable `requirement_id` and one disposition:

- `executable`: implemented through a mergeable Linear child.
- `proof_only`: runtime evidence attached to the behavior it proves.
- `narrative_context`: retained as context; no separate product outcome.
- `superseded`: replaced by a named current requirement.
- `retired_source`: excluded from current work with a named current authority.

No row may disappear silently. Every source inventory row and live runtime blocker must resolve to a manifest row or an explicit disposition. Companion and retired-source rows never override the Master Spec.

Traceability is bidirectional:

- Requirement -> release -> journey -> Linear issue -> paths -> tests -> proof.
- Linear issue -> pinned source -> requirement -> release -> proof gate.

## Release Model

Create and maintain six ordered releases:

1. R0 First Defensible Evaluation.
2. R1 Team Evaluation & Collaboration.
3. R2 Repeatability, Reporting & Operations.
4. R3 Marketplace Supply, Discovery, Matching & Trust.
5. R4 Intelligence, Scenarios, TCO & Agents.
6. R5 Enterprise Integrations, Compliance, Globalization & Scale.

An issue may depend only on work in the same or an earlier release. Any earlier-release dependency on later-release work is a blocking inversion.

R0 follows this fixed order:

1. Local, CI, test, deploy, rollback, and evidence foundations.
2. Auth, tenancy, console isolation, RBAC, audit, and baseline security.
3. Workspace, requirements, evaluation, and state-machine contracts.
4. Buyer setup and seller invitation.
5. Seller secure entry, onboarding, required NDA, response authoring, and submission.
6. Buyer review, scoring, selection, and closure.
7. Immutable selection record, export, retention, recovery, and access enforcement.
8. Canary, rollback, deployed receipts, and runtime-gate closure.

Product work is sliced by observable journey, not by technical layer. Every slice includes the applicable UI, backend, data, authorization, accessibility, telemetry, failure/recovery, tests, rollout, rollback, and proof.

## Readiness Contract

`codex-ready` is derived, not manually granted. An executable child earns it only when all fields pass:

- One observable outcome.
- Pinned source version and exact section.
- Concrete file paths; broad wildcards do not qualify.
- Release and milestone.
- Resolved dependency links with no cycle or release inversion.
- Named accountable owner and reviewer.
- Estimate small enough for one reviewed change.
- Acceptance tests for success, failure, and recovery.
- Rollout and rollback procedure.
- Telemetry contract or explicit no-telemetry rationale.
- Named proof artifact and environment.
- Complete, unambiguous text.

Parents, decisions, blocked work, and proof-only rows never receive `codex-ready`. Any failed rule removes the label and fails the readiness report.

## Ownership, Capacity, and WIP

The current reversible default is one active implementation lane and WIP limit 1. Linear's agent account is not a human owner or reviewer.

Blake Rowley is the interim accountable owner and reviewer for the control-plane batch because no second human workspace member exists. The validation trigger is the addition of another active human member; at that point owner and reviewer must be separated before further product issues earn readiness.

Dates and velocity forecasts remain unset until at least two completed, reviewed batches provide observed throughput. Estimates express relative change size, not calendar promises.

## Linear Synchronization

Linear changes run in this order:

1. Read current initiatives, projects, milestones, releases, issues, labels, relations, users, and cycles.
2. Generate a proposed diff from repository truth.
3. Remove false `codex-ready` labels before adding new readiness.
4. Apply idempotent updates in small batches.
5. Read every changed entity back and compare it with the proposed diff.
6. Write `delivery/linear-snapshot.json` only after read-back succeeds.
7. Regenerate and verify all delivery reports.

No bulk delete is automatic. Superseded work is canceled only after its replacement and traceability link are verified. A failed batch stops before the next batch; successful earlier writes are read back and retained in the recovery log.

## CI Enforcement

`tools/delivery/verify.ts` fails closed on:

- Broken or unpinned source references.
- Missing or silent dispositions.
- Orphan requirements or Linear issues.
- Duplicate identities or duplicate outcomes.
- Dependency cycles.
- Cross-release inversions.
- Missing journey coverage.
- False or stale readiness.
- Missing release, ownership, estimate, test, rollout, rollback, telemetry, or proof fields.
- Repository-to-Linear snapshot drift.
- Hand-edited generated outputs.
- Invalid release score calculations.

CI runs the delivery verifier with the existing required checks. A scheduled authenticated Linear check detects external workspace edits; pull-request CI validates the committed snapshot and generated reports.

## Validation and Release Proof

Each release defines:

- A customer hypothesis.
- An operational hypothesis.
- Pilot cohort and entry criteria.
- Activation and completion events.
- Time-to-value and abandonment measures.
- Trust and support measures.
- Reliability, security, and recovery measures.
- Customer proof required to advance.
- Operational proof required to advance.

R0 customer proof covers completion of the one-buyer/one-seller evaluation journey and retained trust in the result. R0 operational proof covers authorization, isolation, auditability, reliability, rollback, recovery, and supportability.

## Scorecard

The generated scorecard totals 100 points:

- Planning integrity: 20.
- Release integrity: 20.
- Ownership and forecasting: 20.
- Validation readiness: 20.
- Execution and runtime proof: 20.

Each category is evidence-based. Missing evidence scores zero for that criterion. A 10/10 exit requires 100 points and zero blocking findings; averages cannot hide a failed gate.

## Failure Handling

- Source parse error: stop generation and report the exact file and field.
- Unknown identity: require an explicit disposition; never guess a mapping.
- Dependency cycle or inversion: fail before Linear mutation.
- Linear timeout or partial batch: retry only idempotent writes, read back completed writes, then stop.
- Stale snapshot: fail drift verification and refresh from Linear.
- Runtime evidence missing: keep the row pending; never promote from documentation or static lint.
- Deployment or rollback proof missing: keep the release blocked.

## Testing Strategy

Implement every validator test-first. Fixtures must prove both acceptance and rejection for:

- Valid complete manifest.
- Broken source reference.
- Missing disposition.
- Duplicate requirement and duplicate outcome.
- Orphan issue.
- Dependency cycle.
- Cross-release inversion.
- False `codex-ready` issue.
- Missing failure/recovery test.
- Missing rollout or rollback.
- Missing proof.
- Repository-to-Linear drift.
- Scorecard arithmetic and zero-on-missing-evidence behavior.

After each batch run the delivery tests, delivery verifier, existing required repo checks, live exact-status scan, live stamp gate, Git diff review, and Linear read-back.

## First Executable Batch

The first implementation batch is complete only when:

1. Canonical inputs and generators exist.
2. Negative fixtures prove every required fail-closed rule.
3. Generated reports reproduce current repository and Linear truth without copied volatile counts.
4. R0 through R5 exist in Linear.
5. False readiness is quarantined.
6. The first R0 foundation child is fully specified and is the only product work eligible to earn readiness.
7. CI and local verification pass.
8. Linear read-back matches the repository snapshot.

Only then does product implementation begin.
