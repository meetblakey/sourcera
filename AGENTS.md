# AGENTS.md — Sourcera

Never over explain. Always short. Direct. Pragmatic. As few words as possible. Never technical jargon. Always helpful.

## Source authority

- `Sourcera_Master_Spec.md` is the product and engineering source of truth.
- `UX_Design_of_Sourcera.md` governs UX only where the Master Spec is silent.
- `Sourcera_Buyer_Pricing_Strategy.md` and `Sourcera_Seller_Pricing_Strategy.md` are narrative context. Master Spec §34 wins on pricing numbers.
- `Audit_Prompts.md` is the sole current audit program.
- `_integration/Integration_Prompts.md` and `_integration/Integration_Prompts_v7.1.md` are historical execution records.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` records extension decisions.
- `_audit/DEFECT_LEDGER.md` records defect status.

## Live release truth

Do not copy counts into guidance files. Get them live:

```bash
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --json
```

Use these current routing files:

- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.csv`
- `_audit/V711_PRODUCTION_GRADE_RUNTIME_CLOSURE_PLAN_2026-07-13.md`
- `_audit/V711_PRODUCTION_GRADE_RUNTIME_EXECUTION_MATRIX_2026-07-13.csv`

Historical audit reports are evidence only. They never override live scans.

## History

- `_baselines/` contains the only retained immutable document baselines.
- Retired source files under `_baselines/retired-sources/` are reference-only.
- Old per-edit snapshots are in Git tag `legacy-import`, not the worktree.
- Read one with `git show legacy-import:_versions/<path>`.
- Never create `_versions/`, `.bak`, `.orig`, or copied pre-edit files.
- Use a Git commit before destructive work and a tag for a release baseline.

## Authoring rules

- Edit the canonical source once. Replace duplicate live instructions with pointers.
- Never infer runtime readiness from documentation.
- Never promote a runtime row without the evidence required by its §M.5 lane.
- Generated inventories must come from the live scanner, not hand edits.
- Preserve stable paths when old files are widely referenced; use a short tombstone that points to the canonical file.

## Required checks

```bash
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all
tools/spec-lint/node_modules/.bin/tsx tools/repo-hygiene/no_legacy_drift.ts
tools/spec-lint/node_modules/.bin/tsx tools/release/appendix_j_lineage.ts
```

## Delivery control plane

- Live Linear is the sole planning, execution, and implementation-documentation surface.
- `Sourcera_Master_Spec.md` remains product/engineering behavior authority; Linear issues and documents bind exact sections and checksums without weakening them.
- Use native initiatives, projects, milestones, releases, cycles, parents, relations, priority, estimates, and assignments. Never copy those fields into prose.
- Verification inputs: `delivery/`; generate or reconcile them from the current Master Spec and live Linear.
- `delivery/` and generated `reports/delivery/` are verification mirrors, not a second planning board. Never hand edit generated reports.
- Local verifier: `tools/spec-lint/node_modules/.bin/tsx tools/delivery/verify.ts --stamp /tmp/stamp.json --exact /tmp/exact.json`.
- Scheduled Linear drift: `tools/delivery/linear-live.ts`; it requires `LINEAR_API_KEY` and fails closed.
