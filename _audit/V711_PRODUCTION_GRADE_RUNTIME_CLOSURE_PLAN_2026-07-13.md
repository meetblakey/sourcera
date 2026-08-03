# v7.1.1 Production-Grade Runtime Closure Plan

**Date:** 2026-07-29
**Authority:** `tools/release/stamp_gate.ts --json` and `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.csv`

## Verdict

Documentation is complete. Production readiness is not proven.

Live baseline:

- 552 runtime rows
- 333 `runtime_active`
- 2 nonblocking release-only rows
- 217 product/runtime blockers
- 203 rows missing required product/runtime evidence
- 13 rows with a local guard but external proof pending
- 1 row with a partial local chain
- 0 human-ratification blockers

This plan groups work for execution. It does not assign implementation ownership. The `m02_3`, `m11_3`, `m21_3`, and `m24_3` values remain release-evidence lanes.

The execution matrix maps all 217 blockers to a feature area, required execution, missing evidence, release-evidence lane, and evidence posture.

## Universal production-grade exit

Every pending row must have:

1. The named product, schema, workflow, validator, test, and runtime path implemented in the correct product repository.
2. Positive and negative tests covering isolation, authorization, idempotency, concurrency, failure, and recovery where the row requires them.
3. CI or deployment execution tied to the exact commit and environment.
4. A durable staging or production receipt showing timestamp, build, environment, assertion, and result.
5. Explicit promotion to `runtime_active` only after all named evidence passes.
6. A regenerated stamp gate with no remaining blocker for that row.

## Execution summary

| Execution group | Rows | M02.3 | M11.3 | M21.3 | M24.3 |
|---|---:|---:|---:|---:|---:|
| Buyer and Solo workspaces, scoring, Defense View, and Pulse | 20 | 0 | 18 | 2 | 0 |
| Seller onboarding, Maya, KB and Q&A, and bid workflows | 47 | 2 | 39 | 3 | 3 |
| Marketplace, matching, and promoted placements | 6 | 0 | 4 | 2 | 0 |
| Billing, wallets, trials, subscriptions, and settlement | 34 | 2 | 25 | 0 | 7 |
| Identity, permissions, entitlements, and console isolation | 17 | 2 | 15 | 0 | 0 |
| DSAR, audit, residency, retention, backup, and disaster recovery | 45 | 2 | 25 | 18 | 0 |
| APIs, webhooks, MCP, and Console Bridge | 12 | 1 | 8 | 1 | 2 |
| Mobile, accessibility, localization, and performance | 11 | 0 | 4 | 7 | 0 |
| Analytics, growth, PostHog, email, and monitoring | 16 | 5 | 5 | 6 | 0 |
| Cross-cutting release controls | 9 | 3 | 6 | 0 | 0 |
| **Total** | **217** | **17** | **149** | **39** | **12** |

## Buyer and Solo workspaces, scoring, Defense View, and Pulse

**Rows:** 20

**Build:** Ship the Solo-mode transitions, localized deadlines, pipeline and Defense View behavior, requirement reopening and disqualification reversal, Pulse persistence, inbox behavior, policy ingestion, and template flows.

**Prove:** Transaction, concurrency, idempotency, render, browser, mobile, audit, non-leak, and relevant SLO evidence.

Exact gates are mapped in `_audit/V711_PRODUCTION_GRADE_RUNTIME_EXECUTION_MATRIX_2026-07-13.csv`.

## Seller onboarding, Maya, KB and Q&A, and bid workflows

**Rows:** 47

**Build:** Ship onboarding lifecycle and provider recovery, Maya state and rendering, KB indexing and value handling, Q&A isolation, bid editing and submission, NDA lifecycle, and Phase 24 seller-console behavior.

**Prove:** Transaction, outbox, provider, indexing, firewall, browser, mobile, accessibility, and recovery-path evidence.

Exact gates are mapped in `_audit/V711_PRODUCTION_GRADE_RUNTIME_EXECUTION_MATRIX_2026-07-13.csv`.

## Marketplace, matching, and promoted placements

**Rows:** 6

**Build:** Ship vendor opt-out enforcement, match-score integrity, proactive-offer redaction and lifecycle, marketplace restoration, featured placement, and seller stake reveal.

**Prove:** Marketplace browser, state-machine, privacy, non-leak, event-schema, warehouse, and webhook evidence.

Exact gates are mapped in `_audit/V711_PRODUCTION_GRADE_RUNTIME_EXECUTION_MATRIX_2026-07-13.csv`.

## Billing, wallets, trials, subscriptions, and settlement

**Rows:** 34

**Build:** Ship charge and subscription rules, Solo trials, wallet pools and auto-top-up, allowances, committed spend, billing failure states, outcome settlement, and dispute handling.

**Prove:** Stripe and webhook contracts, ledger reconciliation, transaction, idempotency, concurrency, API, browser, and failure-recovery evidence.

Exact gates are mapped in `_audit/V711_PRODUCTION_GRADE_RUNTIME_EXECUTION_MATRIX_2026-07-13.csv`.

## Identity, permissions, entitlements, and console isolation

**Rows:** 17

**Build:** Ship trusted WorkOS and SSO inputs, role and permission matrices, entitlement enforcement, domain checks, console isolation, and core global-ban reversal.

**Prove:** Auth and permission-matrix tests, negative cross-org tests, directory-sync tests, deploy validators, and audit evidence.

Exact gates are mapped in `_audit/V711_PRODUCTION_GRADE_RUNTIME_EXECUTION_MATRIX_2026-07-13.csv`.

## DSAR, audit, residency, retention, backup, and disaster recovery

**Rows:** 45

**Build:** Ship DSAR cascades and appeals, audit integrity and export, residency-bound storage and delivery, retention, encryption, backup isolation, restore protection, and disaster-recovery controls.

**Prove:** Security, migration, storage, forensic, restore, game-day, provider, hash-chain, and non-leak evidence.

Exact gates are mapped in `_audit/V711_PRODUCTION_GRADE_RUNTIME_EXECUTION_MATRIX_2026-07-13.csv`.

## APIs, webhooks, MCP, and Console Bridge

**Rows:** 12

**Build:** Ship registered schemas, standard errors and retry behavior, rate limiting, webhook endpoint and DLQ handling, MCP token and allowlist controls, Console Bridge delivery, and export allowlists.

**Prove:** OpenAPI, schema, contract, integration, retry, DLQ, chaos, delivery, and audit evidence.

Exact gates are mapped in `_audit/V711_PRODUCTION_GRADE_RUNTIME_EXECUTION_MATRIX_2026-07-13.csv`.

## Mobile, accessibility, localization, and performance

**Rows:** 11

**Build:** Ship mobile parity, accessible settings and interactions, RTL and locale resolution, responsive layouts, and enforced performance budgets.

**Prove:** Real-device and browser E2E, keyboard and screen-reader, tap-target, locale and RTL, Lighthouse, load, latency, and bundle evidence.

Exact gates are mapped in `_audit/V711_PRODUCTION_GRADE_RUNTIME_EXECUTION_MATRIX_2026-07-13.csv`.

## Analytics, growth, PostHog, email, and monitoring

**Rows:** 16

**Build:** Ship canonical events and metrics, PostHog and warehouse parity, funnels and attribution, network-effects dashboards, Firecrawl and email recovery, growth delivery, and operational alerts.

**Prove:** Event-schema, warehouse-model, dashboard/export parity, privacy, synthetic, alerting, provider-delivery, and incident evidence.

Exact gates are mapped in `_audit/V711_PRODUCTION_GRADE_RUNTIME_EXECUTION_MATRIX_2026-07-13.csv`.

## Cross-cutting release controls

**Rows:** 9

**Build:** Finish the external Appendix M chain, database and outcome-contract guards, signed anonymity, model-training exclusion, bid-disqualification cascade, and Ops-session controls.

**Prove:** CI and nightly receipts, audit events, database-trigger and transaction tests, policy tests, deploy validators, and Ops browser and notification evidence.

Exact gates are mapped in `_audit/V711_PRODUCTION_GRADE_RUNTIME_EXECUTION_MATRIX_2026-07-13.csv`.

## Recommended execution order

1. Privacy, identity, and cross-console isolation.
2. Billing, wallet, and settlement correctness.
3. Core Buyer and Seller transaction workflows.
4. APIs, webhooks, MCP, and Console Bridge delivery.
5. Marketplace and analytics workflows.
6. Mobile, accessibility, localization, and performance.
7. Cross-cutting release controls and final gate promotion.

## Final release condition

Run:

```sh
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
```

The release is production-grade only when `summary.blocker_count` is `0`, all required rows are `runtime_active`, and the evidence receipts are retained.
