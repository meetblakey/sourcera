# Fixture

#### 22.8.4.7 `cite_verify` {#22.8.4.7-cite_verify}

```json
{ "valid": true, "reason": "ok" }
```

```json
{ "valid": false, "reason": "entry_not_found | offsets_out_of_bounds | excerpt_mismatch | stale | entry_archived | unauthorized_namespace" }
```

`reason` is always a value from Appendix J `cite_verify_reason`; success returns `ok`.

### Cite Verify Reason (§22.8.4.7, §22.16.1) (new)

`ok`, `entry_not_found`, `offsets_out_of_bounds`, `excerpt_mismatch`, `stale`, `entry_archived`, `unauthorized_namespace`

**Notes.**

- Canonical reason vocabulary for every `cite_verify` result. §22.8.4.7, §22.16.1, Appendix G `cite_verify_failed`, and any tool-result or orchestrator-submission-gate payload MUST use these values verbatim.
- `ok` is returned only when `valid=true`. The remaining values are returned only when `valid=false`.

## Appendix G

| Event | Trigger | Properties |
|---|---|---|
| `cite_verify_failed` | `cite_verify` returns `valid=false` | `kb_entry_id`, `reason` (per Appendix J `cite_verify_reason`), `agent_self_check_round` |

#### M.5.31 v7.2.0-REM Phase KB18 Cite/Retrieve Canonicality P1 addition {#m-5-31-v72rem-phase-kb18-cite-retrieve-canonicality-p1-addition}

| Gate | Class | Runtime status | Execution context | Assertion | Override path | Runbook | Pack |
|---|---|---|---|---|---|---|---|
| `cite_verify_reason_enum_canonical_consistency` | catalog_consistency | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/cite_verify_reason_enum_canonical_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Appendix J `cite_verify_reason` is the sole allowed reason vocabulary for §22.8.4.7 `cite_verify`, §22.16.1 server-side semantics, Appendix G `cite_verify_failed`, and orchestrator submission-gate payloads. | `catalog_mismatch` | runbook | M02.3 |
