# DSAR Cascade Pattern Default Row Retired Fail Fixture

### 6.8.4.1 Cascade Pseudonymization Pattern {#6.8.4.1-cascade-pseudonymization-pattern}

**Per-§4-entity assignment table.**

| §4 entity | Pseudonymization pattern | Notes |
| :---- | :---- | :---- |
| §4.3.4 Requirement (`created_by`) | Pattern B | UUID FK; preserve target. |
| All other §4 entities with User-id FKs in audit-integrity row classes per §6.8.5 | Pattern B | Default only after the CI gate confirms the field exists and no more-specific row above applies. |
