## 20.6 Notification Preferences & Settings {#20.6-notification-preferences-and-settings}

### 20.6.1 Notification Settings

- **Baseline controls:** Global Inbox toggle, per-channel toggles, per-notification-type toggles, entity mute, quiet hours, Do Not Disturb, and preference inheritance are governed by §29.3.

### 20.6.2 Notification Channels

- **In-app:** Always (if enabled globally)
- **Email:** Only if "Email Notifications" enabled in settings
- **Slack:** Per §29.4; Org Owner connects through OAuth in Settings > Integrations. Slack delivery respects §29.3 preferences and does not bypass Inbox scope.
- **SMS:** Unsupported in v7.1.0a. No SMS option may render for §20 until provider registration, templates, API contracts, §5.11 plan gates, §34 pricing, §41-equivalent compliance, and Appendix C/G/I/J entries are authored.

## 20.7 Acceptance Criteria {#20.7-acceptance-criteria}

13. Notification preferences MUST delegate quiet hours, DND, per-event preferences, entity mute, and channel toggles to §29.3; §20 may only layer Pulse-specific fields on top.
14. §20 MUST NOT render SMS controls. Slack controls are current and governed by §29.4.
16. Appendix C, Appendix G, Appendix I, Appendix J, and Appendix M MUST contain matching registrations for every webhook, event, error code, enum, and gate named by §20.

### 32.10.3.B Buyer Inbox and Pulse Endpoints {#32.10.3.b-buyer-inbox-and-pulse-endpoints}

| Operation | Side effects |
| :---- | :---- |
| Preference patch | Updates the §29.3 preference record and emits Appendix G `notification_preferences_updated`. |

**Errors.**

| HTTP | Code | Condition |
| :---- | :---- | :---- |
| 404 | `notification_preference_scope_mismatch` | Preference row outside the caller's self / admin scope |

**Acceptance criteria.**

6. Preference patch MUST delegate quiet hours, DND, and entity mute semantics to §29.3 and reject SMS channel keys until the SMS contract is authored.

#### M.5.47 v7.2.0-REM Phase 4.11 Inbox and Pulse P1 continuation addition (D-4.11-006, D-4.11-008 through D-4.11-016 closure) {#m-5-47-v72rem-phase-4-11-inbox-and-pulse-p1-continuation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `notification_channel_no_sms` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/notification_channel_no_sms.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §20 notification preferences MUST NOT render or document SMS as supported until a full provider, API, plan, compliance, and Appendix C/G/I/J contract lands; §32.10.3.B preference PATCH rejects SMS channel keys until that contract is authored. | M02.3 |
