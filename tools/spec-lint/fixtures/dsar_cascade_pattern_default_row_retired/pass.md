# DSAR Cascade Pattern Default Row Retired Pass Fixture

### 6.8.4.1 Cascade Pseudonymization Pattern {#6.8.4.1-cascade-pseudonymization-pattern}

**Per-§4-entity assignment table.**

| §4 entity | Pseudonymization pattern | Notes |
| :---- | :---- | :---- |
| §4.3.4 Requirement (`created_by`) | Pattern B | UUID FK; preserve target. |
| §4.6.1 Audit Event (`user_id`) | Pattern B | UUID FK; preserve target. |

Historical prose may say the old catch-all "All other §4 entities ... Pattern B | Default" row was retired.

**Acceptance criteria.**

1. Every §4 entity field matching a user-attribution pattern MUST resolve to an explicit row in the table above and the §6.8.4.3 registry. Generated default attestations are forbidden.
