#### 4.6.1.1 Audit Event Indexes, Retention, DSAR & State Machine

**Retention.**
- **Default UI retention:** Per plan tier per §34.1.1 / §34.1.2 cell **Audit Log Retention (UI)**; the §40.2 AuditEvent row is the cross-reference catalog.
- **Residency:** §6.7.5.A is the sole AuditEvent residency authority.

### 6.7.3 Retention Policy by Plan {#6.7.3-retention-policy-by-plan}

Audit-log UI retention is authoritative in §34.1.1 / §34.1.2 cell **Audit Log Retention (UI)** and §40.2 Data Retention & Deletion. Consumers use the current per-tier UI window.

| Audit Event (§4.6.1) | §4.6.1 | Audit log | Retention per §40.2 AuditEvent row + §34.1.1 / §34.1.2 cell **Audit Log Retention (UI)** | — |

| `audit_event_retention_authority_consistency` | numerical_singleton_invariant | **`runtime_active`** (detector `tools/spec-lint/gates/audit_event_retention_authority_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
