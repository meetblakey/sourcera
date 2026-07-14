# v7.1.1 Phase 4.3 Policy Acceptance-Criteria Verification — 2026-07-12

## Scope

Remediates D-4.3-013 without adding product behavior or an Authored Extension.

## Conflict and authority

The filed recommendation proposed a five-second framework-detection target and §49 as the outage source. Current §44.1 owns the p95 ≤ 30-second framework budget; §49 is Seller Onboarding, while §12.8.4 and §42.6 own Policy Ingestion provider behavior. This closure retains those current authorities.

## Contract proof

- §12.9 now contains 15 numbered Given/when/then criteria.
- Criteria cover attachment admission, latency, partial resume, dedup, mapping, reassignment, Solo/mobile behavior, atomic publish, settlement, firewall, privacy, API completeness, input safety, and every named dependency outage.
- `policy_ingestion_acceptance_criteria_observability` is a runtime-active static guard with positive and negative fixtures. It checks criteria coverage and rejects a conflicting five-second target.

## Runtime boundary

The guard proves only source consistency. Provider clients, transactions, wallet settlement, rendering, mobile enforcement, outbox delivery, and end-to-end tests remain runtime-pack evidence. No runtime blocker is reclassified.

## Verification

| Command | Result |
| :---- | :---- |
| `npm --prefix tools/spec-lint run typecheck` | PASS. |
| `policy_ingestion_acceptance_criteria_observability` against live Master Spec and pass/fail fixtures | PASS / PASS / expected FAIL. |
| Full spec-lint | PASS. |
| Exact status | 1,979 rows; 0 open P0; 0 open P1; 202 open P2; 76 open P3. |
| Stamp gate | RED: 501 runtime rows; 330 active; 190 blockers. |
| Blocker inventory | Regenerated: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 21 human-ratification blockers. |
