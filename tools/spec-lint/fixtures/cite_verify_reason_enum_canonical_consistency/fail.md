# Fixture

#### 22.8.4.7 `cite_verify` {#22.8.4.7-cite_verify}

```json
{ "valid": false, "reason": "entry_modified_after_offset_capture | offsets_out_of_range" }
```

`reason` may use legacy aliases.

### Cite Verify Reason (§22.8.4.7, §22.16.1) (new)

`ok`, `entry_not_found`, `offsets_out_of_range`

## Appendix G

| Event | Trigger | Properties |
|---|---|---|
| `cite_verify_failed` | `cite_verify` returns `valid=false` | `reason` |

#### M.5.31 v7.2.0-REM Phase KB18 Cite/Retrieve Canonicality P1 addition {#m-5-31-v72rem-phase-kb18-cite-retrieve-canonicality-p1-addition}

| Gate | Class | Runtime status | Execution context | Assertion | Override path | Runbook | Pack |
|---|---|---|---|---|---|---|---|
| `cite_verify_reason_enum_canonical_consistency` | catalog_consistency | spec_binding_pending_pack_m02_3 | pr_lint + deploy_validator | Appendix J `cite_verify_reason` uses aliases. | `catalog_mismatch` | runbook | M02.3 |
