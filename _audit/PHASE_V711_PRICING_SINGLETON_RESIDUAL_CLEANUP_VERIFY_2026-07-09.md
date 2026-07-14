# Phase V711 Pricing Singleton Residual Cleanup Verify — 2026-07-09

## Scope

Closed five lower-severity pricing / numerical-singleton residual rows:

| Defect | Severity | Disposition |
|---|---:|---|
| D-AS-003 | P3 | remediated 2026-07-09 |
| D-AS-006 | P3 | remediated 2026-07-09 |
| D-AS-007 | P2 | remediated 2026-07-09 |
| D-AS-009 | P3 | remediated 2026-07-09 |
| D-AS-011 | P2 | remediated 2026-07-09 |

## Files Changed

- `Sourcera_Master_Spec.md`
- `Sourcera_Buyer_Pricing_Strategy.md`
- `Sourcera_Seller_Pricing_Strategy.md`
- `_audit/DEFECT_LEDGER.md`
- `_audit/REMEDIATION_BACKLOG.md`
- `_audit/V711_BACKLOG_INDEX.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-09.md`
- `_audit/V711_PRODUCTION_GRADE_DOCUMENTATION_GOAL_PROMPT_2026-07-09.md`
- `_integration/RECONCILIATION.md`
- `AGENTS.md`
- `CLAUDE.md`

## Resolution

- §34 now binds pricing companion authority to BPS v3 / SPS v3.
- §34.3.3 margin-floor citation now uses BPS v3 §2.6 / SPS v3 §2.2.
- Appendix H is pointer-only and no longer carries stale v6 Stripe plan / API / storage numerics.
- §39 now owns the KB Entry title limit; §22.3 consumes §39 by reference.
- §34.14.1.c owns the rolled-up cost-base overhead reserve; BPS v3 §13 and SPS v3 §14 cite it instead of restating Convex-only percentages.
- Current count surfaces now report 0 open P0, 0 open P1, 0 blocked P1, 598 open P2, and 192 open P3 rows.

## Backups

- `legacy-import:_versions/Sourcera_Master_Spec_pre-pricing-singleton-residual-cleanup-2026-07-09.md`
- `legacy-import:_versions/Sourcera_Buyer_Pricing_Strategy_pre-pricing-singleton-residual-cleanup-2026-07-09.md`
- `legacy-import:_versions/Sourcera_Seller_Pricing_Strategy_pre-pricing-singleton-residual-cleanup-2026-07-09.md`
- `legacy-import:_versions/DEFECT_LEDGER_pre-pricing-singleton-residual-cleanup-2026-07-09.md`
- `legacy-import:_versions/V711_BACKLOG_INDEX_pre-pricing-singleton-residual-cleanup-2026-07-09.md`
- `legacy-import:_versions/RECONCILIATION_pre-pricing-singleton-residual-cleanup-2026-07-09.md`
- `legacy-import:_versions/AGENTS_pre-pricing-singleton-count-sync-2026-07-09.md`
- `legacy-import:_versions/CLAUDE_pre-pricing-singleton-count-sync-2026-07-09.md`
- `legacy-import:_versions/REMEDIATION_BACKLOG_pre-pricing-singleton-count-sync-2026-07-09.md`
- `legacy-import:_versions/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_pre-pricing-singleton-count-sync-2026-07-09.md`
- `legacy-import:_versions/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_pre-pricing-singleton-count-sync-2026-07-09.csv`
- `legacy-import:_versions/V711_PRODUCTION_GRADE_DOCUMENTATION_GOAL_PROMPT_pre-pricing-singleton-count-sync-2026-07-09.md`

## Verification

Live pricing-source stale scan:

```bash
rg -n "per BPS §2\.4|BPS §2\.4|BPS §2\.6; SPS §2\.2|Convex compute ≈ 3%|Convex ≈ 3%|sourcera-business|sourcera_api_calls|sourcera_storage_overage|entry body ≤ 50,000|title ≤ 200 chars" Sourcera_Master_Spec.md Sourcera_Buyer_Pricing_Strategy.md Sourcera_Seller_Pricing_Strategy.md
```

Result: PASS, 0 matches.

Exact-status right-edge scan:

```bash
node - <<'NODE'
const fs = require('fs');
const text = fs.readFileSync('_audit/DEFECT_LEDGER.md','utf8');
const counts = {P0:0,P1:0,P2:0,P3:0};
const blockedP1 = [];
for (const line of text.split(/\r?\n/)) {
  if (!/^\| D-[^|]+ \| P[0-3] \|/.test(line)) continue;
  const cells = line.split('|').map((s) => s.trim());
  const sev = cells[2];
  const status = cells[cells.length - 3];
  if (status === 'open') counts[sev]++;
  if (sev === 'P1' && /^blocked\b/.test(status)) blockedP1.push(cells[1]);
}
console.log({counts, blockedP1: blockedP1.length});
NODE
```

Result: P0 0, P1 0, P2 598, P3 192, blocked P1 0.

Full spec-lint:

```bash
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md
```

Result: PASS. `blocking gates worst exit code: 0`.

TypeScript:

```bash
npm --prefix tools/spec-lint run typecheck
```

Result: PASS.

Stamp gate:

```bash
npx tsx tools/release/stamp_gate.ts --json > _audit/_tmp/v711_stamp_gate_after_pricing_singleton.json
```

Result: FAIL as expected on unrelated runtime evidence. Summary: 423 runtime rows, 274 `runtime_active`, 147 blockers, all `runtime_pending`: 14 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. `_audit/_tmp/v711_stamp_gate_current.json` and `_audit/_tmp/v711_stamp_gate_latest.json` now mirror this run.

## Boundary

This pass is documentation/source-authority cleanup only. It does not claim Stripe runtime behavior, billing-engine tests, customer invoice generation, cost-base scheduler execution, Finance approval routing, or production correctness.
