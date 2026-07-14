# v7.1.1 Source-Governance Residual Cleanup Verification

**Date:** 2026-07-09  
**Scope:** D-2.2-058, D-3UX-003, D-14.2-011

## Conflicts surfaced

1. UX Design still specified a 420px / 40% desktop and 60% tablet Side Peek while Master Spec §3.8 / §38.6.2 requires a 480px desktop default, tiered resize bounds, a 72% tablet overlay, and full-screen mobile takeover.
2. Seller Pricing §21 still called completed Phase 14.9.1 / 14.10 work pending and cited Vendor Opt-Out §27.10 as Verification Tiers; current Verification authority is §4.4.21 / §27.11.3 and plan authority is §34.1.2.
3. Current Master prose still contained active retired-KB-spec citations. One MCP-auth paragraph also contradicted the current §22.15.1 retry contract.

## Resolution

- Master Spec authority controls. UX Design now matches §3.8 / §38.6.2 across desktop, desktop-xl, tablet, and mobile.
- Seller Pricing now records the completed current authority chain and removes the stale pending block.
- Active KB behavior cites current §22 / §26.7 / §48.8 homes. The existing 120-second crawl-loading value was moved to the §44.1 numerical authority table without changing behavior.
- Verification references that meant Verification Tiers now cite §4.4.21 / §27.11.3; Vendor Opt-Out references remain at §27.10.
- No new Authored Extension was created.

## Result

| Measure | Before | After |
|---|---:|---:|
| Open P0 | 0 | 0 |
| Open P1 | 0 | 0 |
| Open P2 | 511 | 510 |
| Open P3 | 178 | 176 |
| Stamp blockers | 144 | 144 |

The stamp gate remains blocked only by missing pack-owned runtime evidence: M11.3 102, M21.3 26, M02.3 11, M24.3 5.

## Verification commands

```zsh
node - <<'NODE'
const fs = require('fs');
const text = fs.readFileSync('_audit/DEFECT_LEDGER.md', 'utf8');
const counts = { P0: 0, P1: 0, P2: 0, P3: 0 };
for (const line of text.split(/\r?\n/)) {
  if (!/^\| D-[^|]+ \| P[0-3] \|/.test(line)) continue;
  const cells = line.split('|').map((value) => value.trim());
  if (cells[cells.length - 3] === 'open') counts[cells[2]]++;
}
console.log(counts);
NODE

rg -n 'per KB_Engineering_Spec|in KB_Engineering_Spec|§27\.10 \(Verification Tiers\)|§27\.10 Verification Tier' Sourcera_Master_Spec.md Sourcera_Seller_Pricing_Strategy.md UX_Design_of_Sourcera.md
rg -n '420px|Side Peek.*40%|40%.*Side Peek|Side Peek.*60%|60%.*Side Peek|Clicking outside closes|Backdrop shown' UX_Design_of_Sourcera.md
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
```

**Expected:** both `rg` commands return no matches; typecheck and full spec-lint pass; exact-status counts are 0 / 0 / 510 / 176; stamp gate fails only on the unchanged 144 runtime-evidence blockers.
