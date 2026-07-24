# Parent-Child Traceability Design

## Goal

Let one canonical source requirement map to an outcome parent and one or more mergeable executable children without creating false or orphaned traceability.

## Current defect

`F-006` now maps to parent `PLA-283`. Its executable work is in `PLA-942` and `PLA-943`. The delivery generator ignores parents when matching source requirements, so it reports `F-006` as orphaned even though its children are valid work.

## Chosen model

- A source-backed outcome parent keeps the canonical `sourceId`.
- Each executable child has `sourceId: null` and an explicit `parentId` pointing to that parent.
- A source-backed executable issue remains valid for requirements that do not need decomposition.
- Parents never earn `codex-ready`.
- Children may earn `codex-ready` only when every existing readiness rule passes.

This preserves one canonical source identity and avoids invented feature IDs.

## Snapshot contract

Add `parentId: string | null` to every delivery issue snapshot row. The Linear refresh must copy the live parent relation into both the issue row and the live fingerprint.

The current `sourceId`, release, milestone, dependency, ownership, estimate, test, rollout, rollback, telemetry, and proof fields remain authoritative.

## Validation rules

The generator must fail closed when:

- a source-backed parent has no executable child;
- a child points to a missing or non-parent issue;
- an executable issue has neither a source nor a parent;
- a child has its own canonical source ID;
- a child release differs from its parent release;
- a parent is labeled `codex-ready`;
- any existing orphan, duplicate, cycle, dependency, readiness, or release rule fails.

A source requirement is traced when it maps to either:

1. one source-backed executable issue; or
2. one source-backed parent with at least one valid executable child.

## Generated evidence

Each traceability row keeps the canonical parent or direct issue ID and adds its executable issue IDs. For a decomposed requirement, paths, tests, rollout, rollback, telemetry, and proof come from the executable children rather than the parent.

The delivery manifest remains source-level. The traceability map carries mergeable child detail. The readiness report remains issue-level.

## Linear behavior

`PLA-283` remains the `F-006` outcome parent. `PLA-942` and `PLA-943` remain its executable children. Their existing release, milestone, blockers, owner, reviewer, estimate, tests, rollout, rollback, telemetry, and proof stay intact.

No new source IDs are created. No readiness label is added until a child independently passes all gates and its prerequisites are complete.

## Test plan

Add failing tests before implementation for:

- valid source parent plus executable child;
- parent without a child;
- child with a missing parent;
- source-less top-level executable issue;
- traceability output containing executable child evidence;
- refresh copying the live parent ID.

Then run all delivery tests, the delivery verifier, spec lint, repository hygiene, and Appendix J lineage.

## Rollback

Revert the parent-child traceability commit. The prior generator behavior returns, and `F-006` remains visibly blocked as an orphan rather than being silently accepted.
