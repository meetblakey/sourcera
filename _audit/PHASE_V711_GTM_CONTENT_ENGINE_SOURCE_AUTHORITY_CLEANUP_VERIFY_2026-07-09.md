# Phase v7.1.1 GTM Content Engine Source-Authority Cleanup Verification

**Date:** 2026-07-09

## Scope

Cleaned stale source references in `GTM/GTM_CONTENT_ENGINE.md`.

## Gap Surfaced

The Content Engine doc still routed content operators through old Master Spec §6-era anchors and Summary C-number anchors for the Method pipeline, scoring, Policy-Powered Requirement Generation, Selection Record, TCO, Marketplace / EOI, CRM Sync, Seller Profiles, Template Library, Seller KB, Bid Workspace, Seller Signals, PostHog taxonomy, and KB value / export surfaces. Several narrative companion references were also implicit instead of file-qualified.

## Resolution

- Expanded the source-authority header to current Master Spec sections §1, §2, §10, §12, §13, §14, §15, §19, §20, §22, §24, §26, §27, §31, §34, §40, §41, §48, §49, and §51.
- Rebound Method / pipeline / scoring / TCO / policy / selection references to §2, §10, §12, §13, §14, and §15.
- Rebound Template Library and template lineage to §19, §4.4.28, and §48.2.10.
- Rebound Seller Profiles, Seller Org Pages, Software Pages, Seller KB, Bid Workspace, Seller Signals, Marketplace / EOI, and CRM Sync to §22, §24, §26, §27, and §31.9.
- Rebound PostHog taxonomy and Time-Saved / usage-adjacent references to §51 / Appendix G.
- File-qualified narrative companion citations to `GTM_POSITIONING.md` and `GTM_SALES_PLAYBOOK.md`.
- No product behavior changed.

## Backups

- `_versions/GTM_CONTENT_ENGINE.pre-source-authority-cleanup-2026-07-09.md`
- `_versions/V711_BACKLOG_INDEX.pre-gtm-content-engine-source-authority-cleanup-2026-07-09.md`
- `_versions/RECONCILIATION.pre-gtm-content-engine-source-authority-cleanup-2026-07-09.md`

## Verification

Commands:

```bash
node - <<'NODE'
const fs=require('fs');
const text=fs.readFileSync('GTM/GTM_CONTENT_ENGINE.md','utf8');
const stale=[];
text.split(/\r?\n/).forEach((line,i)=>{
  const hasStale = /§6\./.test(line) && !line.includes('GTM_POSITIONING.md');
  const other = /C\.[0-9]+|GTM_POSITIONING §|GTM Sales Playbook|GTM Playbook|§6 Positioning|§[0-9]+\.[0-9]+ Positioning|Seller Pricing|Buyer Pricing|Master Summary|KB_Engineering_Spec|Appendix A state-machine|Appendix D|§C\./.test(line);
  if (hasStale || other) stale.push(`${i+1}:${line}`);
});
if (stale.length) { console.log(stale.join('\n')); process.exit(1); }
console.log('clean');
NODE
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md
npx tsx tools/release/stamp_gate.ts --json > _audit/_tmp/v711_stamp_gate_current.json
```

Results:

- Stale Content Engine source-reference scan: PASS (`clean`).
- Full spec-lint: PASS, 0 blocking findings.
- Typecheck: PASS.
- Exact-status right-edge scan: 0 open P0, 0 open P1, 0 blocked P1, 595 open P2, 191 open P3.
- Stamp gate: FAIL on the same 147 runtime-evidence blockers after parsing 426 runtime rows with 277 `runtime_active` rows.

## Boundary

This was GTM source-reference hygiene only. It does not promote any §M.5 runtime row and does not claim product-code evidence, deploy validators, integration tests, dashboard consumers, billing runtime, marketplace runtime, or production execution.
