# Phase v7.1.1 GTM Playbook Prompts Source-Authority Cleanup Verification

**Date:** 2026-07-09

## Scope

Cleaned stale source references in `GTM/GTM_PLAYBOOK_PROMPTS.md`.

## Gap Surfaced

The GTM prompt file still sent prompt executors to old §6.10 / §6.15 anchors for Template Library, Template Discovery, Seller Org Pages, Software Pages, and Published-from-Day-One defaults.

## Resolution

- Rebound Template Library / Template Discovery references to Master Spec §19 / §19.4 / §19.5.
- Rebound Seller Org Page / Software Page references to §26.7 / §26.8.5.
- Rebound Published-from-Day-One references to §26.1 / §26.7.3.
- No product behavior changed.

## Backups

- `_versions/GTM_PLAYBOOK_PROMPTS.pre-source-authority-cleanup-2026-07-09.md`
- `_versions/V711_BACKLOG_INDEX.pre-gtm-playbook-prompts-source-authority-cleanup-2026-07-09.md`
- `_versions/RECONCILIATION.pre-gtm-playbook-prompts-source-authority-cleanup-2026-07-09.md`

## Verification

Commands:

```bash
rg -n "§6\\.10|§6\\.15\\.1|§6\\.15\\.4|§6\\.15\\.5|What_is_Sourcera|Sourcera_Master_Summary|KB_Engineering_Spec|Master Summary|KB Engineering Spec" GTM/GTM_PLAYBOOK_PROMPTS.md
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md
npm --prefix tools/spec-lint run typecheck
npx tsx tools/release/stamp_gate.ts --json > _audit/_tmp/v711_stamp_gate_current.json
```

Results:

- Stale prompt source-reference scan: 0 matches.
- Full spec-lint: PASS, 0 blocking findings.
- Typecheck: PASS.
- Exact-status right-edge scan: 0 open P0, 0 open P1, 0 blocked P1, 595 open P2, 191 open P3.
- Stamp gate: FAIL on the same 147 runtime-evidence blockers after parsing 426 runtime rows with 277 `runtime_active` rows.

## Boundary

This was GTM source-reference hygiene only. It does not promote any §M.5 runtime row and does not claim product-code evidence, deploy validators, integration tests, dashboard consumers, billing runtime, marketplace runtime, or production execution.
