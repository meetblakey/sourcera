# Fixture

## 5.10 Active Workspace Definition

**Definition.** An "Active Workspace" is any Workspace where `pipeline_stage_id < 13`.

**Usage:** Used in reporting.

**`workspace_status` enum.** `draft`, `active`, `closed`.

| Gate | Phase | Runtime status | Trigger scope | Assertion | Failure output | Authority anchor |
|---|---|---|---|---|---|---|
| `workspace_status_canonical_consumer` | 3V | `spec_binding_pending_pack_m02_3` | code paths | Active Workspace predicates may use `pipeline_stage_id < 13`. | Static-analysis hit. | §5.10 V3. |
