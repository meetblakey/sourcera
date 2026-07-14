### 51.3.5 APIs (§32-conformant) {#51.3.5-apis}

| Method | Path | Auth Scope | Rate-Limit Class | Purpose |
| :---- | :---- | :---- | :---- | :---- |
| `GET` | `/v1/orgs/{org_id}/analytics/usage/snapshot` | role | `analytics_read` (§32.4.5) | Snapshot |
| `GET` | `/v1/orgs/{org_id}/analytics/usage/live` | role | `analytics_read` (§32.4.5) | Live |
| `GET` | `/v1/orgs/{org_id}/analytics/usage/export` | role | `analytics_export` (§32.4.5) | Export |
| `GET` | `/v1/orgs/{org_id}/analytics/usage/export/{export_id}` | role | `analytics_read` (§32.4.5) | Poll |

### 51.4.4 APIs (§32-conformant) {#51.4.4-apis-51-4}

| Method | Path | Auth Scope | Rate-Limit Class | Purpose |
| :---- | :---- | :---- | :---- | :---- |
| `GET` | `/v1/users/{user_id}/analytics/usage/summary` | self | `analytics_read` (§32.4.5) | Summary |
| `GET` | `/v1/users/{user_id}/analytics/usage/export` | self | `analytics_export` (§32.4.5) | Export |

### 51.5.5 APIs (§32-conformant) {#51.5.5-apis-51-5}

| Method | Path | Auth Scope | Rate-Limit Class | Purpose |
| :---- | :---- | :---- | :---- | :---- |
| `GET` | `/v1/seller-orgs/{seller_org_id}/analytics/usage/snapshot` | role | `analytics_read` (§32.4.5) | Snapshot |
| `GET` | `/v1/seller-orgs/{seller_org_id}/analytics/usage/kb-utilization` | role | `analytics_read` (§32.4.5) | KB |
| `GET` | `/v1/seller-orgs/{seller_org_id}/analytics/usage/win-rate-correlation` | role | `analytics_read` (§32.4.5) | Win-rate |
| `GET` | `/v1/seller-orgs/{seller_org_id}/analytics/usage/export` | role | `analytics_export` (§32.4.5) | Export |

#### Rate-Limit Classes for §51 and Workspace Analytics (§32.4.5 binding)

The §51 API endpoints consume the canonical §32.4.5 / Appendix J `api_rate_limit_class` values below:

- `analytics_read` — applied to `GET /v1/orgs/{org_id}/analytics/usage/snapshot`, `GET /v1/orgs/{org_id}/analytics/usage/live`, `GET /v1/orgs/{org_id}/analytics/usage/export/{export_id}`, `GET /v1/users/{user_id}/analytics/usage/summary`, `GET /v1/seller-orgs/{seller_org_id}/analytics/usage/snapshot`, `GET /v1/seller-orgs/{seller_org_id}/analytics/usage/kb-utilization`, `GET /v1/seller-orgs/{seller_org_id}/analytics/usage/win-rate-correlation`, and Workspace Analytics metric/export polling endpoints in §32.10.3.A.
- `analytics_export` — applied to panel export endpoints (`GET /v1/orgs/{org_id}/analytics/usage/export`, `GET /v1/users/{user_id}/analytics/usage/export`, `GET /v1/seller-orgs/{seller_org_id}/analytics/usage/export`) and Workspace Analytics export initiation in §32.10.3.A.

**Notes.** CI gate `appendix_j_rate_limit_class_path_resolves` (§M.5.35) asserts every Appendix J path listed above exactly matches a §51.3.5 / §51.4.4 / §51.5.5 endpoint row and forbids legacy `/usage-dashboard` aliases unless a dual-emit/deprecation row is authored.

#### M.5.35 Section 51 rate-limit path binding {#m-5-35-section-51-rate-limit-path-binding}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `appendix_j_rate_limit_class_path_resolves` | content_consistency | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/appendix_j_rate_limit_class_path_resolves.ts`; verified PASS on live Master Spec and pass/fail fixtures) | post-build | Appendix J §51 rate-limit path list resolves exactly to §51.3.5 / §51.4.4 / §51.5.5 endpoint rows; legacy `/usage/dashboard` aliases are rejected unless a dual-emit/deprecation row is authored — closes D-51-008 | M02.3 |
