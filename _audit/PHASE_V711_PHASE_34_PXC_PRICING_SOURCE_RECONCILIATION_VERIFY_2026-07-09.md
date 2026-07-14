# Phase 34.PXC Pricing-Source Reconciliation Verification

**Date:** 2026-07-09  
**Scope:** D-PXC-002, D-PXC-006, D-PXC-007, D-PXC-016, D-PXC-017, D-PXC-018, and adjacent P3 D-PXC-008, D-PXC-012, D-PXC-019, D-PXC-020.

## Result

All ten canonical rows are `remediated 2026-07-09`. No new product behavior, plan tier, price, API, state, or Authored Extension was authored.

| Defect | Result |
|---|---|
| D-PXC-002 | Direct Invite source now resolves directly to canonical §27.9.8. |
| D-PXC-006 | Seller Free has no standalone Firecrawl source; the lifetime KB Bootstrap crawl remains a separate entitlement. |
| D-PXC-007 | First-Pass Free allowance resolves to §34.8.5; wallet and Hero-Moment exception remain separately sourced. |
| D-PXC-008 | §34.14.1 cites SPS v3 §10; §34.15.1 cites SPS v3 §11. |
| D-PXC-016 | Scenario namespaces are MS-A/B/C, BPS-A/B/C/D, and SPS-A/B/C/D. |
| D-PXC-017 | BPS §4 names the automatic Buyer trial and routes detailed behavior to §34.9.1. |
| D-PXC-018 | §34.17.1 now binds the Usage Dashboard implementation and ACs to §51.3–§51.5. |
| D-PXC-012 | SPS §13.3 preserves editorial-only v7.x behavior while acknowledging the reserved Master Spec paid mode. |
| D-PXC-019 | §34.1.1 cites current BPS v3 sections or canonical §27. |
| D-PXC-020 | §34.18.1 subscription-margin source cites BPS v3 §13 and SPS v3 §14. |

## Verification

```zsh
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md
node - <<'NODE'
const fs = require('fs');
const text = fs.readFileSync('_audit/DEFECT_LEDGER.md', 'utf8');
const counts = { P0: 0, P1: 0, P2: 0, P3: 0 };
for (const line of text.split(/\r?\n/)) {
  if (!/^\| D-[^|]+ \| P[0-3] \|/.test(line)) continue;
  const cells = line.split('|').map((s) => s.trim());
  if (cells[cells.length - 3] === 'open') counts[cells[2]]++;
}
console.log(JSON.stringify(counts));
NODE
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
```

**Observed:** Typecheck PASS. Full spec lint PASS. Exact-status scan: `{"P0":0,"P1":0,"P2":540,"P3":184}`. The stamp gate remains FAIL on 144 missing-runtime-evidence blockers: M11.3 102, M21.3 26, M02.3 11, M24.3 5.

## Targeted source checks

```zsh
awk '/^### 34\.14\.1 Rate Card Table/{in_scope=1} /^### 34\.14\.1\.b/{in_scope=0} in_scope' Sourcera_Master_Spec.md | rg -n 'SPS §9 row'
awk '/^### 34\.15\.1 Outcome Contract Table/{in_scope=1} /^### 34\.15\.2/{in_scope=0} in_scope' Sourcera_Master_Spec.md | rg -n 'SPS §10 row'
rg -n 'Scenario (BPS|SPS|MS)-[A-D]' Sourcera_Master_Spec.md Sourcera_Buyer_Pricing_Strategy.md Sourcera_Seller_Pricing_Strategy.md
rg -n 'New-buyer trial|§34\.9\.1' Sourcera_Buyer_Pricing_Strategy.md
rg -n '§51\.3|§51\.4|§51\.5' Sourcera_Master_Spec.md
```

The shifted SPS citations are absent. Scenario labels and Buyer-trial source binding resolve as intended.
