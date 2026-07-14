# Fixture

### 4.2.1 Organization

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `mfa_required_org_wide` | Boolean | Default false | Org-wide MFA enforcement flag. |

### 6.2.2 MFA Enrollment & Enforcement

Organization Admin may enable `mfa_enforcement_required` flag on the Organization record.

**`MFA Enforcement Levels` enum activation.** `off`, `optional`, `required`.

| Gate | Phase | Runtime status | Trigger scope | Assertion | Failure output | Authority anchor |
|---|---|---|---|---|---|---|
| `mfa_enforcement_level_canonical_consumer` | 3V | `spec_binding_pending_pack_m02_3` | MFA-policy code paths. | Every MFA-policy code path MUST consume legacy Booleans. | Static-analysis hit. | §6.2.2 V3 remediation; defect D-3.3-008; AE-3V-001. |
