### 6.7.4 Audit Log Access

Composed access set: Org Owner / Org Admin full cross-namespace; Billing Admin filtered billing view per §5.2.1.4; Workspace Owner workspace-scoped; Team Owner team-scoped; Ops-actor rows surface "Sourcera Ops" chip and permit `actor_type='ops_actor'` filter per §50.5.4; Seller Console parity per §50.5.5. Rendered through §36.2.

## 36.2 Organization Settings {#36.2-organization-settings}

Audit Logs row: cross-section access per §6.7.4. Org Owner / Org Admin full cross-namespace; Billing Admin filtered per §5.2.1.4; Workspace Owner workspace-scoped; Team Owner team-scoped; Ops-actor rows surface "Sourcera Ops" chip and permit `actor_type='ops_actor'` filter per §50.5.4; Seller Console parity per §50.5.5.

#### 5.2.1.4 Audit Semantics

Billing Admin filtered view. Full matrix in §6.7.4 and §36.2: Org Owner / Org Admin full cross-namespace; Billing Admin filtered billing view; Workspace Owner workspace-scoped; Team Owner team-scoped; Ops-actor rows surface "Sourcera Ops" chip and permit `actor_type='ops_actor'` filter per §50.5.4; Seller Console parity per §50.5.5.

### 50.5.4 Rendering in the Billing Admin Audit View {#50.5.4-rendering-in-billing-admin-audit-view}

Composed access set in §6.7.4 / §36.2 / §5.2.1.4: Org Owner / Org Admin full cross-namespace; Billing Admin filtered billing view; Workspace Owner workspace-scoped; Team Owner team-scoped; Ops-actor rows surface "Sourcera Ops" chip and permit `actor_type='ops_actor'` filter; Seller Console parity per §50.5.5.

### 50.5.5 Rendering in Seller Billing Audit View {#50.5.5-rendering-in-seller-billing-audit-view}

Seller parity for §50.5.4 and matrix in §6.7.4 / §36.2 / §5.2.1.4: Org Owner / Org Admin full cross-namespace; Billing Admin filtered billing view; Workspace Owner workspace-scoped; Team Owner team-scoped; Ops-actor rows surface "Sourcera Ops" chip and permit `actor_type='ops_actor'` filter; Seller Console parity.

### M.5.4 Catalog index {#m.5.4-catalog-index}

| Gate ID | Source phase | Runtime status | Scope | Failure mode | Runbook | Authority anchor |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `audit_log_surfacing_cross_reference_consistency` | V11 | **`runtime_active`** | §6.7.4, §36.2, §5.2.1.4, §50.5.4, and §50.5.5. | Same access set required. | Runbook. | §6.7.4; §36.2; §5.2.1.4; §50.5.4; §50.5.5. |
