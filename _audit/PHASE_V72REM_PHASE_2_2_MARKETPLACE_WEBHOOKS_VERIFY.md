# Phase v7.2.0-REM — Phase 2.2 Marketplace Discovery Webhook Completeness Verification

**Date:** 2026-06-22  
**Scope:** D-2.2-046 only.  
**Verdict:** Remediated. D-2.2-047 remains open as a separate `verification.tier_downgraded` webhook row.

## 1. Defect Adjudication

D-2.2-046 was a true live P1 authoring issue. §4.4.19 and §4.4.20 referenced three Marketplace Discovery lifecycle webhooks as acceptance-criteria evidence:

- `promoted_listing.eligibility_lost`
- `promoted_listing.paused_by_opt_out`
- `featured_placement.revoked`

Before this pass, those event names were not authored as §31 webhook contracts and were not registered in Appendix C / Appendix G. That made the §4.4.19 AC #7 and §4.4.20 AC #4 observability path unbuildable.

## 2. Remediation Summary

Canonical spec changes landed in `Sourcera_Master_Spec.md`:

- §4.4.19 state-machine and AC #7 now cite §31.13 / Appendix C for the PromotedListing lifecycle webhook fan-out.
- §4.4.20 AC #4 now cites §31.13 / Appendix C for `featured_placement.revoked`.
- New §31.13 authors the three Marketplace Discovery lifecycle webhook contracts with trigger, event class, required payload fields, retry class, Appendix C/G bindings, privacy constraints, and acceptance criteria.
- Appendix C registers the three event rows under the v7.1.1 Marketplace Discovery Lifecycle Webhook Completeness subsection.
- Appendix G registers the three PostHog mirrors.
- Appendix F.2 registers `featured_placement.revoked` as `financial_impact`; `promoted_listing.eligibility_lost` and `promoted_listing.paused_by_opt_out` remain `standard`.

Tracking changes:

- `_audit/DEFECT_LEDGER.md` marks D-2.2-046 `remediated 2026-06-22`.
- `_audit/V711_BACKLOG_INDEX.md` current open P1 count moved from 382 to 381.
- `_audit/REMEDIATION_BACKLOG.md` Phase 2.2 notes point to this verification artifact.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` adds AE-V72REM-PH22-MARKETPLACE-WEBHOOKS-01.
- `_integration/RECONCILIATION.md` records the adjudication, retry-class resolution, residual D-2.2-047, and sign-off scoreboard.

## 3. Verification Commands

Open D-2.2-046 scan:

```bash
rg -n '^\| D-2\.2-046 \| P1 \|[^\n]*\| open \|' _audit/DEFECT_LEDGER.md
```

Result: no matches. `rg` exited `1`, which is expected for a negative proof.

Current D-2.2-046 / D-2.2-047 ledger rows:

```bash
rg -n '^\| D-2\.2-046 \|' _audit/DEFECT_LEDGER.md
rg -n '^\| D-2\.2-047 \|' _audit/DEFECT_LEDGER.md
```

Result:

- D-2.2-046 is `remediated 2026-06-22`.
- D-2.2-047 remains `open`.

Webhook name resolution scan:

```bash
rg -n 'promoted_listing\.eligibility_lost|promoted_listing\.paused_by_opt_out|featured_placement\.revoked' Sourcera_Master_Spec.md
```

Result: matches exist in §4.4.19 / §4.4.20 references, §31.13 contract rows, §31.13 acceptance criteria, Appendix C rows, Appendix F.2 membership, and Appendix G mirrors.

Stale residual wording scan:

```bash
rg -n 'D-2\.2-046 through D-2\.2-047|D-2\.2-046 and D-2\.2-047|D-2\.2-046 remain|D-2\.2-046 remains|D-2\.2-046 open|D-2\.2-046.*remain open|leaving D-2\.2-046' _integration/AUTHORED_EXTENSIONS_LEDGER.md _integration/RECONCILIATION.md _audit/REMEDIATION_BACKLOG.md _audit/V711_BACKLOG_INDEX.md
```

Result: no matches. `rg` exited `1`, which is expected for a negative proof.

Open P1 count:

```bash
rg -n '^\| D-[^|]+ \| P1 \|[^\n]*\| open \|' _audit/DEFECT_LEDGER.md | wc -l
rg -n '^\| D-[^|]+ \| P1 \|[^\n]*\| open \|' _audit/DEFECT_LEDGER.md | sed -E 's/^\| (D-[^ |]+).*/\1/' | sort -u | wc -l
```

Result: `381` rows / `381` unique open P1 IDs.

Full spec lint:

```bash
cd tools/spec-lint && npm run all -- --no-emit
```

Result: blocking gates pass with worst exit code `0`. Existing advisory backlog remains:

- `solo_tier_numeric_single_source`: 52
- `retention_singleton_section_40_2_canonical`: 122
- `section_anchor_slug_no_colon`: 13

## 4. File Hashes After Pass

```text
MD5 (Sourcera_Master_Spec.md) = 50989e992ae9a737a3a3dc8b1395e65d
MD5 (_audit/DEFECT_LEDGER.md) = 7d5d6563835170cba77141749237e420
MD5 (_audit/V711_BACKLOG_INDEX.md) = 323898d51f81c07edc7ecd4fa6cee4c3
MD5 (_audit/REMEDIATION_BACKLOG.md) = 0d6c161bd49c4315dc66ddb90a919cf8
MD5 (_integration/AUTHORED_EXTENSIONS_LEDGER.md) = acda72e7cd45a9a09ef7c27308e43241
MD5 (_integration/RECONCILIATION.md) = b64f2c51d4d0c6e6143a80dac8798fc7
```

## 5. Residuals

D-2.2-047 remains open. It concerns `verification.tier_downgraded` and must be adjudicated separately against the current §4.4.21 / §31 / Appendix C / Appendix G state.
