# Phase v7.1.1 Companion Source-Authority Routing Cleanup Verification

**Date:** 2026-07-09

## Scope

Corrected active routing surfaces that still pointed future sessions at retired or missing sources:

- `AGENTS.md`
- `CLAUDE.md`
- `SWE_Project_Instructions.md`
- `Build_Execution_Strategy.md`
- `Linear_Execution_Blueprint.md`
- `GTM/GTM_Prompts.md`

## Gap Surfaced

The current project-doc hierarchy already says the retired KB Engineering Spec and retired Master Summary are historical only. A lower project-instructions block still listed both as active authority, and `GTM/GTM_Prompts.md` still loaded a missing `What_is_Sourcera.md` as the primary product source. Execution docs also carried stale v7.1.0-in-progress / v6.0.0-baseline authority language.

## Resolution

- Navigation files now route KB/MCP questions to Master Spec §22.
- Retired Master Summary / KB Engineering Spec references are historical provenance only.
- `What_is_Sourcera.md` is no longer an active context-loading or source-list dependency.
- GTM prompt context-loading now uses `Sourcera_Master_Spec.md` plus current GTM/pricing companions.
- Build / Linear execution headers now bind to Master Spec v7.1.0a and current companion docs.

## Backups

- `legacy-import:_versions/AGENTS_pre-source-hierarchy-retired-doc-cleanup-2026-07-09.md`
- `legacy-import:_versions/CLAUDE_pre-source-hierarchy-retired-doc-cleanup-2026-07-09.md`
- `legacy-import:_versions/SWE_Project_Instructions_pre-source-hierarchy-retired-doc-cleanup-2026-07-09.md`
- `legacy-import:_versions/Build_Execution_Strategy_pre-source-authority-routing-cleanup-2026-07-09.md`
- `legacy-import:_versions/Linear_Execution_Blueprint_pre-source-authority-routing-cleanup-2026-07-09.md`
- `legacy-import:_versions/GTM_Prompts_pre-source-authority-routing-cleanup-2026-07-09.md`

## Verification

Commands:

```bash
rg -n '(/What_is_Sourcera\.md|not in What_is_Sourcera|from What_is_Sourcera|re-read What_is_Sourcera|What_is_Sourcera\.md` and|What_is_Sourcera\.md —)' AGENTS.md CLAUDE.md SWE_Project_Instructions.md GTM/GTM_Prompts.md Build_Execution_Strategy.md Linear_Execution_Blueprint.md
rg -n '(KB_Engineering_Spec\.md` — authoritative|Sourcera_Master_Summary\.md` — authoritative|v7\.1\.0-integration-in-progress|GTM_prompts)' AGENTS.md CLAUDE.md SWE_Project_Instructions.md GTM/GTM_Prompts.md Build_Execution_Strategy.md Linear_Execution_Blueprint.md
rg -n 'v6\.0\.0 baseline' Build_Execution_Strategy.md Linear_Execution_Blueprint.md
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json > _audit/_tmp/v711_stamp_gate_current.json
```

Results:

- Missing-file active-reference scan: 0 matches.
- Retired-current-authority routing scan: 0 active matches. Historical "was authoritative" and "not active source" notes remain intentionally.
- Execution-header stale-baseline scan: 0 matches in Build / Linear execution docs.
- Full spec-lint: PASS, 0 blocking findings.
- Stamp gate: FAIL on the same 147 runtime-evidence blockers: 14 M02.3, 102 M11.3, 26 M21.3, and 5 M24.3. Runtime rows parsed: 422; `runtime_active`: 273.

## Boundary

No §M.5 runtime row was promoted. Product-code evidence, deploy validators, integration tests, active dashboard consumers, billing runtime, marketplace runtime, and production execution remain owned by their current packs.
