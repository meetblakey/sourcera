## 20.6 Notification Preferences & Settings {#20.6-notification-preferences-and-settings}

### 20.6.2 Notification Channels

- **In-app:** Always.
- **Email:** Always.
- **SMS:** Supported for Pulse reminders once the user adds a mobile number.

## 20.7 Acceptance Criteria {#20.7-acceptance-criteria}

13. Notification preferences MAY define Pulse-specific channel behavior inline.
14. §20 may render SMS controls.

### 32.10.3.B Buyer Inbox and Pulse Endpoints {#32.10.3.b-buyer-inbox-and-pulse-endpoints}

| Operation | Side effects |
| :---- | :---- |
| Preference patch | Updates the preference record. |

**Acceptance criteria.**

6. Preference patch accepts SMS channel keys.

#### M.5.47 v7.2.0-REM Phase 4.11 Inbox and Pulse P1 continuation addition (D-4.11-006, D-4.11-008 through D-4.11-016 closure) {#m-5-47-v72rem-phase-4-11-inbox-and-pulse-p1-continuation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `notification_channel_no_sms` | spec_tree_lint | spec_binding_pending_pack_m02_3 | pr_lint | §20 notification preferences may render SMS after a phone number is verified. | M02.3 |
