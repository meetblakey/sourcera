# 3\. UX Standard — The Linear Constraint {#3.-ux-standard-—-the-linear-constraint}

The Linear Constraint is binding. Master Spec §3 defines it. `UX_Design_of_Sourcera.md` §1.4 is current.

## 3.13 Principle 9 {#3.13-principle-9-surface-simplicity-engine-complexity}

**Current enforcement status.** Appendix M (§M.1) and the First-30-Seconds Test (`UX_Design_of_Sourcera.md` §1.4) are landed and binding.

## Appendix K

**Linear Constraint.** Canonical term.

## Appendix M

| Gate ID | Row class | Runtime status | Execution context | Assertion | Pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `ux_principle_currency_canonicality` | content_consistency | **`runtime_active`** (detector `tools/spec-lint/gates/ux_principle_currency_canonicality.ts`; verified PASS on live Master Spec and pass/fail fixtures) | post-build | Principle currency is canonical. | M02.3 |
