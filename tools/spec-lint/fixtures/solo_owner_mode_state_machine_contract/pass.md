## 2.8 Single-Operator Mode {#2.8-single-operator-mode}

Defense View (§13.11.4: Buyer Solo receives the full, unwatermarked view and full PDF export).

Buyer Solo Mode never reads from, writes to, or projects into the §22 Seller Knowledge Base.

Phase 14.9 (Solo Plan Tier — pricing & entitlement).

## Appendix L

### L.22 Evaluation Owner Mode State Machine {#l-22-evaluation-owner-mode-state-machine}

**Entity.** Buyer Workspace.`evaluation_owner_mode`. **Enum.** Appendix J `EvaluationOwnerMode`: `solo`, `team`. The field never crosses the §1.3 / §7.2 firewall.

| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| `(create)` | `solo` | Workspace create | Buyer Free or Buyer Solo | — |
| `(create)` | `team` | Workspace create | Buyer Starter, Growth, Scale, or Enterprise | — |
| `solo` | `team` | Authorized Workspace Owner changes the Workspace Settings toggle | — | `trigger_reason=manual_workspace_setting` |
| `solo` | `team` | Second eligible non-guest membership acceptance | — | `trigger_reason=automatic_team_threshold_reached` |
| `team` | `solo` | Authorized Workspace Owner changes the Workspace Settings toggle | zero outstanding non-deleted invitations | `evaluation_owner_mode_team_to_solo_blocked_stakeholders_present` |
| `solo` / `team` | same value | Upgrade or downgrade | — | No transition and no mode-change AuditEvent. |

The no-change rule applies including a `team` Workspace after a Solo or Free downgrade. Every mutation preserves §2.8.3.1's no-webhook boundary.

## Appendix M.5

| `solo_owner_mode_state_machine_contract` | spec_tree_lint | **`runtime_active`** (detector `tools/spec-lint/gates/solo_owner_mode_state_machine_contract.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
