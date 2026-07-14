# Phase PT Pricing Singleton P1 Verification — v7.2.0-REM (2026-06-22)

## Scope

Closed the live `BL-P1-PHPT-DOC` P1 subset:

- D-PT-001 — Buyer Solo per-evaluation automated refund-open threshold drift.
- D-PT-002 — Seller KB Bootstrap Year-1 entitlement drift.

Lower-severity Phase PT rows remain open: D-PT-003 through D-PT-009 (P2) and D-PT-010 (P3).

## Backups

- `legacy-import:_versions/Sourcera_Master_Spec_pre-2026-06-22-phase-pt-pricing-singletons-p1.md` — md5 `a6553d5eab04dc93a5317d8d18b26faa`
- `legacy-import:_versions/DEFECT_LEDGER_pre-2026-06-22-phase-pt-pricing-singletons-p1.md` — md5 `4684ce5e687479cadb73556f0e8fe449`
- `legacy-import:_versions/REMEDIATION_BACKLOG_pre-2026-06-22-phase-pt-pricing-singletons-p1.md` — md5 `b2b92f8f49e83aaba9d0f6f7e0cae56f`
- `legacy-import:_versions/V711_BACKLOG_INDEX_pre-2026-06-22-phase-pt-pricing-singletons-p1.md` — md5 `545068bc083acc0692d2374bcb644b69`
- `legacy-import:_versions/AUTHORED_EXTENSIONS_LEDGER_pre-2026-06-22-phase-pt-pricing-singletons-p1.md` — md5 `5289307ab44c9977487590a699761126`
- `legacy-import:_versions/RECONCILIATION_pre-2026-06-22-phase-pt-pricing-singletons-p1.md` — md5 `280d842c1a34c9f8ce3b087cd60a2044`

## Change Summary

- §34.1.1 Buyer Solo per-evaluation pricing cell now states `< 3-open` automated refund eligibility.
- §34.2.5 Buyer Solo refund row now states the Selection Report PDF must have been opened `< 3` times; `3+` opens route to operator judgment.
- §34.2.5 AC #3 now binds the automated Buyer refund test to `< 3-open` semantics.
- AE-14.9-05 and Appendix M.1 Solo per-evaluation mapping text now use the same threshold.
- §34.1.2 Seller KB Bootstrap row now grants Seller Starter `1 lifetime + 1/year re-bootstrap` and Seller Growth `1 lifetime + 3/year re-bootstrap`.
- §34.8.5 `kb_bootstrap` and §34.14.4 now bind to §34.1.2 for annual re-bootstrap cadence rather than carrying annual-only Starter/Growth wording.
- §M.5.32 registers `solo_per_eval_refund_open_threshold_singleton` and `seller_kb_bootstrap_entitlement_singleton`.
- `_audit/DEFECT_LEDGER.md` marks D-PT-001 and D-PT-002 `remediated 2026-06-22`.
- `_audit/REMEDIATION_BACKLOG.md` sets `BL-P1-PHPT-DOC` count to 0.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` adds AE-V72REM-PHPT-PRICING-SINGLETON-01.

## Verification

### Refund Threshold

Command:

```bash
rg -n "≤ 3-open|≤ 3 times|opened ≤ 3|Refund CTA available within 7 days if PDF opened ≤|automatically eligible.*3 opens" Sourcera_Master_Spec.md _integration/AUTHORED_EXTENSIONS_LEDGER.md _audit/REMEDIATION_BACKLOG.md _audit/V711_BACKLOG_INDEX.md _integration/RECONCILIATION.md
```

Result: no active stale singleton text. Remaining matches are intentional:

- AE-14.9-05 status note explaining the retired ambiguous wording.
- RECONCILIATION conflict-surfaced paragraph explaining the old conflict.
- §M.5.32 guardrail text naming `≤ 3-open` / `≤ 3 times` as rejected patterns.

### KB Bootstrap Entitlement

Command:

```bash
rg -n 'annual-only Starter/Growth|additional Bootstraps included on Seller Starter|\| \*\*KB Bootstrap \(Opus\)\*\* \||`kb_bootstrap` \| hard|seller_kb_bootstrap_entitlement_singleton' Sourcera_Master_Spec.md _audit/REMEDIATION_BACKLOG.md _audit/V711_BACKLOG_INDEX.md _integration/RECONCILIATION.md _integration/AUTHORED_EXTENSIONS_LEDGER.md
```

Result: live Master Spec bindings are canonical:

- §34.1.2: Seller Starter = `1 lifetime + 1/year re-bootstrap`; Seller Growth = `1 lifetime + 3/year re-bootstrap`.
- §34.8.5: `kb_bootstrap` cites §34.1.2 for plan-tier annual quota.
- §M.5.32: `seller_kb_bootstrap_entitlement_singleton` guards against annual-only Starter/Growth drift.

### Ledger / Backlog

- `BL-P1-PHPT-DOC` count is 0 in `_audit/REMEDIATION_BACKLOG.md`.
- D-PT-001 and D-PT-002 rows both carry `remediated 2026-06-22`.
- Historical broad-regex count:

```bash
rg -n "^\\| D-[^|]+ \\| P1 \\|.*\\| open \\|" _audit/DEFECT_LEDGER.md | wc -l
```

Result: `430`. This is the existing backlog/index convention and is not a strict status-column parser because the ledger contains escaped table fragments inside evidence cells.

### Conflict Markers

Command:

```bash
rg -n "<<<<<<<|=======|>>>>>>>" Sourcera_Master_Spec.md _audit/DEFECT_LEDGER.md _audit/REMEDIATION_BACKLOG.md _audit/V711_BACKLOG_INDEX.md _integration/AUTHORED_EXTENSIONS_LEDGER.md _integration/RECONCILIATION.md
```

Result: no matches.

### Spec Lint

Command:

```bash
npm --prefix tools/spec-lint run all -- --no-emit
```

Result: exit 0; all blocking gates passed. Existing advisory families remain:

- `solo_tier_numeric_single_source` — 52 advisory findings.
- `retention_singleton_section_40_2_canonical` — 124 advisory findings.
- `section_anchor_slug_no_colon` — 13 advisory findings.

## Post-Edit Hashes

- `Sourcera_Master_Spec.md` — md5 `bdedcaec27701a9949667bba87608655`
- `_audit/DEFECT_LEDGER.md` — md5 `e0126108c99dc1fd86e1d2681c063a7c`
- `_audit/REMEDIATION_BACKLOG.md` — md5 `449ae0a15436fcc9ca7b47ee1424c0e3`
- `_audit/V711_BACKLOG_INDEX.md` — md5 `e8daa14ac67c561ffdbbe0d813bf5f30`
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` — md5 `c47ba1fc0346f046ad86aaa30091a30a`
- `_integration/RECONCILIATION.md` — md5 `c524de4e9a207261e4a2a360b47cd238`
