# Fixture

## 4.3 Buyer {#4-3-buyer}

### 4.3.1 Workspace {#4-3-1-workspace}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | required | identity |
| `risk_token` | String | required | worker-only token |

### M.1 Master Surface/Engine Mapping Table

| Engine concept | Spec home | Surface metaphor | Tier visibility | Notes |
| :---- | :---- | :---- | :---- | :---- |
| Workspace entity | §4.3.1 | Evaluation | All | mapped |

### M.5 Catalog {#m-5-catalog}

| Gate ID | Phase | Runtime status | Execution context | Assertion | Override path | Runbook |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `known_gate` | M02.3 | runtime_active | spec | checks | none | local |
