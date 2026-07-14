### 51.3.5 APIs (§32-conformant) {#51.3.5-apis}

| Method | Path | Auth Scope | Rate-Limit Class | Purpose |
| :---- | :---- | :---- | :---- | :---- |
| `GET` | `/v1/orgs/{org_id}/analytics/usage/snapshot` | role | `analytics_read` (§32.4.5) | Snapshot |
| `GET` | `/v1/orgs/{org_id}/analytics/usage/live` | role | `analytics_read` (§32.4.5) | Live |
| `GET` | `/v1/orgs/{org_id}/analytics/usage/export` | role | `analytics_export` (§32.4.5) | Export |

### 51.4.4 APIs (§32-conformant) {#51.4.4-apis-51-4}

| Method | Path | Auth Scope | Rate-Limit Class | Purpose |
| :---- | :---- | :---- | :---- | :---- |
| `GET` | `/v1/users/{user_id}/analytics/usage/summary` | self | `analytics_read` (§32.4.5) | Summary |

### 51.5.5 APIs (§32-conformant) {#51.5.5-apis-51-5}

| Method | Path | Auth Scope | Rate-Limit Class | Purpose |
| :---- | :---- | :---- | :---- | :---- |
| `GET` | `/v1/seller-orgs/{seller_org_id}/analytics/usage/snapshot` | role | `analytics_read` (§32.4.5) | Snapshot |
| `GET` | `/v1/seller-orgs/{seller_org_id}/analytics/usage/export` | role | `standard_authenticated_per_org` (§32.4.5) | Export |

#### Rate-Limit Classes for §51 and Workspace Analytics (§32.4.5 binding)

- `analytics_read` — applied to `GET /v1/orgs/{org_id}/analytics/usage/snapshot`, `GET /v1/orgs/{org_id}/analytics/usage/live`, `GET /v1/orgs/{org_id}/analytics/usage/export/{export_id}`, `GET /v1/users/{user_id}/analytics/usage/summary`, `GET /v1/seller-orgs/{seller_org_id}/analytics/usage/snapshot`, `GET /v1/seller-orgs/{seller_org_id}/analytics/usage/kb-utilization`, `GET /v1/seller-orgs/{seller_org_id}/analytics/usage/win-rate-correlation`.
- `analytics_export` — applied to `GET /v1/orgs/{org_id}/analytics/usage/export`, `GET /usage/dashboard/export`.

**Notes.** Weak note.

#### M.5.35 Section 51 rate-limit path binding {#m-5-35-section-51-rate-limit-path-binding}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `appendix_j_rate_limit_class_path_resolves` | content_consistency | spec_binding_pending_pack_m02_3 | post-build | Weak rate-limit path check. | M02.3 |
