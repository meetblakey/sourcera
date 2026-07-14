# v7.2.0-REM Phase 12 — D-CONS-001 Triage (Tier-1 Reconciliation)

**Date:** 2026-06-15
**Driver:** "Walk them all" → triage-first (operator decision, 2026-06-15). Before authoring any cross-phase program, reconcile each program's canonical `open` set against closures already present in the spec body / supplementary status-transition tables (D-CONS-001), so we author only the genuine residual and never re-register an already-closed artifact (the Program-1 enum Batch-1 duplicate that triggered this).

**Method.** Programmatic parse of `_audit/DEFECT_LEDGER.md`:
- **Canonical row** = line `| D-… |` with `severity ∈ {P0..P3}` and ≥12 columns; status = the standalone status token in the row.
- **Tier-1 lag** = canonical `status=open` AND the same `defect_id` appears on a *different* line carrying an audited transition `open → {remediated|partially_remediated|superseded} YYYY-MM-DD` (a supplementary status-transition table row).
- **Tier-2 surface** = canonical `status=open` with NO supplementary transition → cannot be auto-classified; requires the hardened all-format body-existence check (per Walk Plan §7) before being declared truly open or authored.

> Scan caveat: exact counts vary ±tens by tokenizer (dated/compound status cells, embedded `|` in content). The authoritative per-defect list is the canonical table itself; the figures below are decision-grade, not audit-final.

## Tier-1 result (this pass)

| Metric | Count |
|---|---:|
| Canonical rows parsed | ~1,992 |
| Canonical `open` at session start | ~1,797 |
| **Tier-1 canonical-lag identified** | **90** (7 enum `D-AJ` hand-verified + 83 cross-class) |
| Tier-1 lag **propagated** `open → remediated/partially` (synced from each row's own audited supplementary transition, cited) | **90** |
| Tier-1 lag **remaining** | **0** |
| Canonical `open` after pass (Tier-2 surface) | ~1,771 |

3 arrow-matches were rejected as false positives (`D-1.6-008`, `D-8.2-014`, `D-V711-014` — `→` in description prose, not a transition). 78 of the 83 cross-class propagations targeted `remediated`, 5 `partially_remediated`. Pre-edit ledger backup: `legacy-import:_versions/DEFECT_LEDGER.pre-v72REM-Phase12-Tier1-propagation-2026-06-15.md` (3,759,949 bytes).

Each propagated canonical row carries the cite: `[D-CONS-001 canonical-lag propagation 2026-06-15 -> supplementary transition DEFECT_LEDGER L<n>; canonical status synced from this audited transition]`. This is transcription of an existing audited closure, not an independent re-verification — the cite makes every propagation traceable to its source row.

## Tier-2 surface — remaining canonical-`open` by primary class (all severities)

These are the rows with no supplementary closure. They are the input to per-program Tier-2 body-existence checks; an unknown fraction will prove already-closed-in-body (like the enum Phase-2V case) and the rest are the true authoring residual.

| Primary class | Open (Tier-2) | | Primary class | Open (Tier-2) |
|---|---:|---|---|---:|
| consistency_drift | 188 | | dsar | 37 |
| acceptance_criteria | 186 | | surface_engine_mapping | 37 |
| documentation_gap | 186 | | error_code | 35 |
| data_model | 148 | | mobile_divergence | 28 |
| numerical_singleton | 119 | | notification | 24 |
| enum | 95 | | instrumentation_gap | 24 |
| plan_gating | 84 | | glossary | 20 |
| api | 62 | | authored_extension | 19 |
| webhook | 59 | | residency | 18 |
| rbac | 58 | | accessibility | 18 |
| observability | 58 | | posthog_event | 14 |
| ci_gate | 48 | | (long tail) | … |
| state_machine | 46 | | | |
| firewall_leakage | 39 | | | |
| retention | 38 | | | |

## What Tier-1 does NOT establish

The 90 propagations only reconcile rows whose closure was already recorded in a supplementary transition table. The enum episode proved that some closures live in the spec **body** (e.g., the Phase-2V `#### ` Appendix J registrations) with **no** supplementary row — those are currently counted in the Tier-2 surface and will only be reclassified by the per-program body-existence check. **Therefore the true authoring residual is ≤ the Tier-2 counts above, likely materially less.**

## Next steps (per-program Tier-2)

For each of the 25 programs, in Walk Plan dependency order:
1. Pull the program's Tier-2 `open` set (the canonical rows above).
2. For each, run the hardened all-format existence check (`#### \`x\``, `### \`x\``, `**\`x\``, table rows) against the cited artifact in the spec body.
3. Body-present → D-CONS-001 propagate (canonical row → remediated, cite the body section). Body-absent → genuine residual → author at Master Spec fidelity per Walk Plan §4.
4. Log per-program in `RECONCILIATION.md → v7.2.0-REM Phase 12 — <class>` and a `PHASE_V72REM_PHASE_12_<class>_VERIFY.md`.

Recommended Tier-2 start order (highest lag-likelihood / lowest authoring cost first): **enum (95)** and **glossary (20)** — both are catalog classes with extensive Phase-2V/6/10 body coverage, so a high propagate-vs-author ratio is expected, mirroring Tier-1.
