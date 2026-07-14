# 38. Responsive Design & Platform Support {#38.-responsive-design-and-platform-support}

**Enum.** `responsive_breakpoint_tier` (Appendix J): `mobile_xs`, `mobile_sm`, `tablet`, `desktop`, `desktop_xl`.

| Tier | Viewport Width |
|---|---|
| `mobile_xs` | `< 640px` |
| `mobile_sm` | `640px ≤ w < 768px` |
| `tablet` | `768px ≤ w < 1024px` |
| `desktop` | `1024px ≤ w < 1280px` |
| `desktop_xl` | `≥ 1280px` |

**Enum.** `mobile_gesture_kind` (Appendix J): `tap`, `double_tap`, `long_press`, `two_finger_tap`, `swipe_up`, `swipe_down`, `swipe_left`, `swipe_right`, `pull_to_refresh`, `pinch_zoom`, `bottom_sheet_drag_down`, `back_gesture_ios_edge_swipe`, `back_gesture_android_hardware_back`, `keyboard_dismiss_swipe_down`.

**Enum.** `mobile_keyboard_shortcut_target` (Appendix J): `row_next`, `row_prev`, `open_peek`, `close_overlay`, `open_command_palette`, `open_search`, `submit_form`, `inline_edit`, `range_select`, `select_all`, `delete_selection`, `advance_phase`, `switch_console`, `show_shortcut_overlay`.

**Enum.** `mobile_feature_parity_status` (Appendix J): `parity`, `supported`, `simplified`, `not_supported`.

| # | `tap_count_probe_workflow_kind` | Workflow | Entry Point | Ceiling | Destructive Exception | Notes |
|---|---|---|---|---|---|---|
| 1 | `buyer_open_workspace_from_dashboard` | Open | Dashboard | 2 | no | |

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

### Responsive Breakpoint Tier (§38.6.1)

`mobile_xs`, `mobile_sm`, `tablet`, `desktop`, `desktop_xl`

### Mobile Gesture Kind (§38.7)

`tap`, `double_tap`, `long_press`, `two_finger_tap`, `swipe_up`, `swipe_down`, `swipe_left`, `swipe_right`, `pull_to_refresh`, `pinch_zoom`, `bottom_sheet_drag_down`, `back_gesture_ios_edge_swipe`, `back_gesture_android_hardware_back`, `keyboard_dismiss_swipe_down`

### Mobile Keyboard Shortcut Target (§38.7.1)

`row_next`, `row_prev`, `open_peek`, `close_overlay`, `open_command_palette`, `open_search`, `submit_form`, `inline_edit`, `range_select`, `select_all`, `delete_selection`, `advance_phase`, `switch_console`, `show_shortcut_overlay`

### Mobile Feature Parity Status (§38.8)

`parity`, `supported`, `simplified`, `not_supported`

### Tap Count Probe Workflow Kind (§38.8.4)

`buyer_open_workspace_from_dashboard`, `buyer_view_requirement_detail`, `buyer_post_comment_on_requirement`, `buyer_open_vendor_detail`, `buyer_view_inbox_and_ack`, `buyer_switch_to_seller_console`, `buyer_view_pulse_metric_drilldown`, `buyer_reply_to_qa_thread`, `buyer_advance_phase`, `buyer_accept_agent_suggestion`, `buyer_assign_requirement_to_team`, `buyer_create_requirement_single`, `buyer_search_find_requirement`, `buyer_invite_teammate`, `buyer_start_discovery_run`, `seller_view_bid_workspace`, `seller_submit_boolean_response`, `seller_accept_eoi`, `seller_view_kb_entry`, `seller_publish_profile`, `buyer_delete_requirement`, `seller_withdraw_bid`, `buyer_disqualify_vendor`

#### M.5.59 v7.2.0-REM Phase 38 Responsive / Mobile P1 addition {#m-5-59-v72rem-phase-38-responsive-mobile-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `responsive_breakpoint_enum_registry_completeness` | enum_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/responsive_breakpoint_enum_registry_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Enum registry. | M02.3 |
