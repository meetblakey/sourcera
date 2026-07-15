# Semantic Task 4 Fix Report

Status: DONE

## Review fixes

- Each checkpoint now owns `evidenceCommit`; planned checkpoints pin `null`.
- Completion validates receipts against that checkpoint commit and requires it to be an ancestor of current `HEAD`.
- Generation no longer derives or emits a top-level commit, so valid proof at commit A remains valid at closeout B.
- Linear readback now paginates official top-level projects and project milestones, including issue project and milestone IDs.
- New project and milestone inventory arrays are scoped only by canonical snapshot project IDs. Missing or duplicate tracked IDs fail; unrelated legacy projects are ignored; full issue fingerprint coverage remains intact.
- Snapshot refresh requires live IDs, preserves unrelated project and milestone planning fields, and rebuilds matching fingerprint arrays.
- Generation fails closed for missing, duplicate, partial, mismatched, drifting, or empty tracked milestone metadata, including duplicate `(projectId,name)` pairs.

No Linear mutation was made. Existing dirty snapshot, release-plan, and unrelated generated-report changes were preserved.

## TDD evidence

RED covered checkpoint A-to-B stability, missing checkpoint pins, project and milestone pagination/truncation, missing inventories, scoped project IDs, legacy extras, metadata mismatches, duplicate milestone pairs, and refresh field preservation.

GREEN:

- focused semantic/generation/Linear/refresh suite: 87/87
- full delivery suite: 184/184
- spec-lint TypeScript: passed
- delivery TypeScript: passed
- `git diff --check`: passed
- full spec lint: passed
- legacy-drift gate: passed
- Appendix J lineage gate: passed

## Clean reproducibility

Generation used base `HEAD` `5034e3dee6d99419c3f53036c5f474fdbc1e275b`, with `delivery/linear-snapshot.json` and `delivery/release-plan.json` copied from that commit by `git show`, plus the new roadmap and fresh stamp/exact scanner output. A post-commit regeneration from committed inputs also matched the report byte-for-byte.

- stamp scanner: exit 1, current blockers preserved
- exact-status scanner: exit 0
- generator runs: exit 1/1, current findings preserved
- byte comparison: identical
- journey report SHA-256: `e9cee4a29b3d4ab1548665918a73625799556231305771a841a72b89c6b42e2d`

The generated report intentionally remains blocking until the canonical snapshot is refreshed with the new live project/milestone IDs and the clean committed release plan catches up.
