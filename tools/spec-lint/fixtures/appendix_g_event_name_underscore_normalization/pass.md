## Appendix G: PostHog Event Taxonomy

### Security Mirrors

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `security_suspicious_login_attempt` | Mirror of Appendix C `security.suspicious_login_attempt` | `source_webhook_event_type='security.suspicious_login_attempt'`, `user_id` |
| `dsar_export_ready` | Mirror of Appendix C `dsar.export.ready` | `source_webhook_event_type='dsar.export.ready'`, `request_id` |

## 48.7 M14–M17 Cross-Console & Seller Conversion Mechanics

### 48.7.1 M14 Seller Bid Success Share

#### Telemetry Events

| Event | Trigger | Appendix G Section |
| :---- | :---- | :---- |
| `m14_bid_success_share_initiated` | Step 1 | M14–M17 Mechanics Events |

#### Notifications Fired

| Kind | Trigger |
| :---- | :---- |
| `m14.bid_success_share.eligible` | Eligible notification |
