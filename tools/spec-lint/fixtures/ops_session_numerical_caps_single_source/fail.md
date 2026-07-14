# Fixture

## 39 Object Constraints {#39-object-constraints}

**§39.5 OpsSession Request-History Numerical Singletons.**

| Contract | Authoritative value | Consumers |
| :---- | :---- | :---- |
| OpsSession request-history alert threshold | 10,000 linked requests | §4.6.3–§4.6.4; §50.4.6; §42 P2 alert |
| OpsSession operational hard-close threshold | 50,000 linked requests | §4.6.3–§4.6.4; §50.4.6; commits the threshold request, then closes the live session |
| OpsSessionApiRequestLink storage capacity | 100,000 rows per OpsSession | §4.6.4; audited legacy migration and forensic import only above the operational threshold |

The three rows are distinct contracts. The storage ceiling is defense in depth, not permission for a live OpsSession to exceed the operational hard-close threshold.

## 4.6.3 OpsSession {#4.6.3-opssession}

The §39 operational hard-close threshold ends a live session before the distinct §39 storage-capacity ceiling; the higher capacity exists only for migration, forensic import, and defense in depth and is not an operational entitlement.

## 50.4.6 Session Hard Limits {#50.4.6-session-hard-limits}

The alert threshold, operational hard-close threshold, and separate link-table storage capacity resolve exclusively from §39. `api_request_ids` hard cap 50,000 is enforced here.

### M.5 catalog

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `ops_session_numerical_caps_single_source` | runtime_property_test | `spec_binding_pending_pack_m02_3` | pr_lint + deploy_validator | Local guard `tools/spec-lint/gates/ops_session_numerical_caps_single_source.ts` and fixtures are present; `convex/deploy_validators/ops_session_request_history_caps.ts` remains required. | M02.3 |
