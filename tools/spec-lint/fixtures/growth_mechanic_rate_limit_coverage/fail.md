## 48.5 M1-M8 Growth Mechanics {#48.5-m1-m8-growth-mechanics}

#### Mechanic-Level Rate Limits — Fill Coverage

| Mechanic | Mechanic-Level Rate Limit | Enforcement Surface | Error Code |
|---|---|---|---|
| **M1** Stakeholder Read-Only Invite | 10 invites / inviter / 24h | POST validator | `m1_inviter_rate_limit_exceeded` (HTTP 429) |
| **M4** Kick Off Next Evaluation | one row exists but no velocity value | POST convert | missing status |
| **M8** Org Intelligence Value Curve | recompute exists but no limit | POST recompute | `m8_recompute_rate_limit_exceeded` |

### 48.5.4 M4 "Kick Off Next Evaluation" on Close {#48.5.4-m4-kick-off-next-evaluation-on-close}

#### Anti-Abuse Controls

1. No conversion guard here.

## Appendix I

| Error Code | HTTP | Endpoint | Notes | Localization Key |
|---|---|---|---|---|
| `m4_active_evaluations_cap_exceeded` | 422 | M4 POST convert | Cap. | `error.growth.m4_active_evaluations_cap_exceeded` |

## Appendix M

| Gate ID | Row class | Runtime status | Execution context | Assertion | Pack |
|---|---|---|---|---|---|
| `growth_mechanic_rate_limit_coverage` | content_consistency | spec_binding_pending_pack_m02_3 | post-build | Every M1-M17 mechanic carries a documented mechanic-level rate limit. | M02.3 |
