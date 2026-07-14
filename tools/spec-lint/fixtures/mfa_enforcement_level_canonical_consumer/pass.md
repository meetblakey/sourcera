# Fixture

### 4.2.1 Organization

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `mfa_enforcement_level` | Enum | Appendix J `MFA Enforcement Levels`; default derived from plan tier | Canonical Org-wide MFA enforcement posture. Free and Solo default `off`; paid non-Enterprise tiers default `optional`; Enterprise defaults `optional` and may be promoted to `required` by Org Owner / Org Admin per §6.2.2. The deprecated Booleans `mfa_required_org_wide` and `mfa_enforcement_required` are legacy read-only migration aliases only; new code MUST consume this enum. CI gate `mfa_enforcement_level_canonical_consumer` asserts. |

### 6.2.2 MFA Enrollment & Enforcement

**Per-user MFA enrollment state.** Per-Org enforcement is `Organization.mfa_enforcement_level` of type `MFA Enforcement Levels` (values `off`, `optional`, `required`); the pre-V3 Boolean `mfa_required_org_wide` and `mfa_enforcement_required` are deprecated (CI gate `mfa_enforcement_level_canonical_consumer`).

**`MFA Enforcement Levels` enum activation.** Pre-V3, the Appendix J `MFA Enforcement Levels` enum (`off`, `optional`, `required`) had zero consumers. The §6.2.2 `mfa_enforcement_required` Boolean and §4.2.1 `mfa_required_org_wide` Boolean are deprecated in favor of a single `Organization.mfa_enforcement_level` column of type `MFA Enforcement Levels` (V3 remediation). Pre-existing Boolean rows migrate `false → off`, `true → required`. CI gate `mfa_enforcement_level_canonical_consumer` asserts.

| Gate | Phase | Runtime status | Trigger scope | Assertion | Failure output | Authority anchor |
|---|---|---|---|---|---|---|
| `mfa_enforcement_level_canonical_consumer` | 3V | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/mfa_enforcement_level_canonical_consumer.ts`; verified PASS on live Master Spec and pass/fail fixtures) | Master Spec MFA policy sections. | Active MFA policy wording must use `Organization.mfa_enforcement_level`; legacy Boolean names are deprecated migration aliases only. | PR comment naming the stale Boolean. | §6.2.2 V3 remediation; defect D-3.3-008; AE-3V-001. |
