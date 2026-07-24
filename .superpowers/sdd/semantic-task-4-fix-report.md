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
- `delivery/linear-project-scope.json` now independently pins all 26 canonical project IDs and names. Generation, live readback, and snapshot refresh reject missing, extra, duplicate, renamed, or malformed scope rows instead of deriving scope from the mutable snapshot.
- Linear sync preservation now compares fingerprint projects and project milestones exactly, with stable missing, added, changed, and duplicate findings.
- Expected milestone changes are atomic `{id,name}` pairs (or `null`); a new name with a stale ID fails, while unmapped issues preserve both fields.

No Linear mutation was made. Existing dirty snapshot, release-plan, and unrelated generated-report changes were preserved.

## TDD evidence

RED covered checkpoint A-to-B stability, missing checkpoint pins, project and milestone pagination/truncation, missing inventories, scoped project IDs, legacy extras, metadata mismatches, duplicate milestone pairs, and refresh field preservation.

GREEN:

- focused generation/Linear/sync/refresh/verify/CI suite: 70/70
- full delivery suite: 191/191
- spec-lint TypeScript: passed
- delivery TypeScript: passed
- `git diff --check`: passed
- full spec lint: passed
- legacy-drift gate: passed
- Appendix J lineage gate: passed

## Clean reproducibility

Generation used base `HEAD` `b1b0013b390048b790e5ee549e49e1050c12a6b1`, with `delivery/linear-snapshot.json` and `delivery/release-plan.json` extracted from that commit, the independent canonical project scope, and fresh stamp/exact scanner output. A post-commit regeneration from committed inputs also matched the report byte-for-byte.

- stamp scanner: exit 1, current blockers preserved
- exact-status scanner: exit 0
- generator runs: exit 1/1, current findings preserved
- byte comparison: identical
- journey report SHA-256: `e9cee4a29b3d4ab1548665918a73625799556231305771a841a72b89c6b42e2d`

The generated report intentionally remains blocking until the canonical snapshot is refreshed with the new live project/milestone IDs and the clean committed release plan catches up.
