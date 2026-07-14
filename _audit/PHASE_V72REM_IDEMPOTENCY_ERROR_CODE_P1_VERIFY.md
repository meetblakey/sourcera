# Phase v7.2.0-REM — Idempotency Error-Code Canonicalization P1 Verification

Date: 2026-06-21

## Scope

This pass closes D-V8.1-020 by canonicalizing same-Idempotency-Key/different-body replay errors to HTTP 409 `idempotency_key_request_mismatch`.

## Source Authority

Appendix I Billing Endpoint Errors already registered `idempotency_key_request_mismatch`; §32.8.0 and current billing POST endpoints already used it. The body-mismatch spelling was an unregistered alias in §27.10 and §32.9.

## Closed Defect

| Defect | Status | Evidence |
| :---- | :---- | :---- |
| D-V8.1-020 | remediated 2026-06-21 | Active endpoint prose and acceptance criteria now emit `idempotency_key_request_mismatch`; Appendix I carries the deprecated alias note; §M.5 registers `idempotency_key_canonical_error_code`. |

## Validation

- Negative grep target: no active endpoint prose, endpoint error table, acceptance criterion, or expected-code assertion emits `idempotency_key_body_mismatch`.
- Positive grep target: §27.10.6.1, §27.10.9 AC #25, §32.9.1, and §32.9.4 AC #91 all cite `idempotency_key_request_mismatch`; Appendix I contains the canonical row; §M.5 contains `idempotency_key_canonical_error_code`; D-V8.1-020 is `remediated 2026-06-21`.

## Executed Checks

- Negative stale-emission sweep: PASS — no active endpoint prose, acceptance criterion, or expected-code assertion still emits `idempotency_key_body_mismatch`; no canonical D-V8.1-020 row remains `open`.
- Positive canonical-code sweep: PASS — §27.10.6.1, §27.10.9 AC #25, §32.9.1, §32.9.4 AC #91, Appendix I, §M.5, D-V8.1-020, and the reconciliation closeout all resolve to `idempotency_key_request_mismatch` / `idempotency_key_canonical_error_code`.

## Residuals

D-1.2-016 remains open for the broader global idempotency-header contract outside this naming cleanup. This pass does not close endpoint-detail backlog items such as D-V8.1-015.
