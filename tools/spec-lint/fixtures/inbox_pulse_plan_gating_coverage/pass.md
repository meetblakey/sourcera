# 20. Inbox & Pulse {#20.-inbox-and-pulse}

| Contract | Canonical home |
| :---- | :---- |
| Role and plan gating | §5.11 Inbox & Pulse rows, §34.8.5, §44.6, Appendix M.1 |

When `Workspace.evaluation_owner_mode = solo` or the console plan tier is `buyer_solo`, the full grouped Pulse Inbox, per-component Pulse Health breakdown, In-App Pulse Widget, and Pulse Digest default delivery are suppressed per §2.8.4, §44.6, and Appendix M.1.

## 5.11 Feature Access Matrix (Comprehensive) {#5.11-feature-access-matrix-(comprehensive)}

| **Inbox & Pulse (§20; buyer-console scoped; Solo compression per §2.8.4 / §44.6 / Appendix M.1)** |  |  |  |  |  |  |  |  |  |  |  |
| Read Inbox feed / Inbox item detail (§20.2; §32.10.3.B) |
| Mark Inbox item read / dismiss / restore (§20.2.3; §32.10.3.B) |
| Mark all Inbox items read (§20.2.3; mobile simplified per §38.8.2) |
| View Pulse Health Score / trend (§20.3 / §20.5; paid Team Mode; Free has no Pulse per §34.8.5 / Appendix M.1) |
| Refresh Pulse current-day row (§20.3.4; §32.10.3.B debounce) |
| Receive Pulse Digest Email (§20.4; §41.2 `weekly_digest`; `pulse_digest_weekly` AIOperation; Solo opt-in only) |
| View Pulse Digest Archive (§20.5.3) |
| Export Pulse Digest Archive CSV (§20.5.3; §34.1.1 Export Formats; mobile unsupported) |
| Edit Notification Preferences for Inbox / Pulse (§20.6 / §29.3) |

### 32.10.3.B Buyer Inbox and Pulse Endpoints {#32.10.3.b-buyer-inbox-and-pulse-endpoints}

**Purpose.** Bind §20 Inbox, Pulse Health, Pulse Digest Archive, and Notification Preferences workflows to public API routes while preserving Buyer-console scope, §5.11 role gates, §34.8.5 plan gates, Solo compression, §29 preference authority, and §38.8.2 mobile parity.

| GET | `/v1/workspaces/{workspace_id}/pulse` | `read:workspaces` | §5.11 View Pulse Health row; Free has no Pulse per §34.8.5 / Appendix M.1 | `workspace_read` | N/A |
| 403 | `workspace_pulse_plan_required` | Requested Pulse operation is unavailable under §34.8.5 / Appendix M.1 |

### 34.8.5 Entitlement Matrix (Authoritative)

| `pulse_digest_weekly` | `hard` | 10 | `business_starter` | `seller_starter` | `pulse_digest_upgrade_cta` |
| `pulse_digest_upgrade_cta` | `entitlement.pulse_digest.starter` | Pulse Digest unlocks at Buyer Business Starter / Seller Starter. |

## Appendix M

| Pulse Inbox + InboxItem + Inbox Item Group | §20.2, §4.3.22.1, §4.3.22, §2.8.4 |
| Pulse Health Score (composite of SLA timers, response rates, agreement, etc.) | §20.3, §4.3.22.2, §2.8.4 |
| Pulse Digest Email (weekly cadence) | §20.4, §2.8.4 |
| In-App Pulse Widget | §20.5 | Persistent right-rail widget | All paid |
| Notification Preferences | §20.6 | "Notification settings" page | All |

#### M.5.47 v7.2.0-REM Phase 4.11 Inbox and Pulse P1 continuation addition {#m-5-47-v72rem-phase-4-11-inbox-and-pulse-p1-continuation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `inbox_pulse_plan_gating_coverage` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/inbox_pulse_plan_gating_coverage.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §20 Inbox/Pulse surfaces MUST have matching §5.11 rows and cite §34.8.5 / Appendix M.1 for Pulse plan availability and Solo suppression. | M02.3 |
