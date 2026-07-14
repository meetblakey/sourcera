# 25. Cross-Console Mechanics {#25.-cross-console-mechanics}

### 25.7.9 API Surface {#25.7.9-internal-comments-api-surface}

| Method | Path | Purpose | Notes |
| :---- | :---- | :---- | :---- |
| `GET` | `/v1/workspaces/{workspace_id}/internal-comment-threads` | List threads in a workspace | Paginated; filters on `attached_to_type`, `attached_to_id`, `status`, `visibility_scope`. |
| `POST` | `/v1/workspaces/{workspace_id}/internal-comment-threads` | Create a new thread with its first post | Creates Thread + first Post + Mentions atomically; emits `internal_comment_thread.created`. |
| `GET` | `/v1/internal-comment-threads/{thread_id}` | Fetch thread + recent posts | Includes `posts_preview` (10 most recent). |
| `PATCH` | `/v1/internal-comment-threads/{thread_id}` | Mutate `title`, `status`, `visibility_scope`, `subscribed_user_ids` | Emits `internal_comment_thread.updated` or domain-specific events. |
| `DELETE` | `/v1/internal-comment-threads/{thread_id}` | Archive thread | Sets `deleted_at`; emits `internal_comment_thread.archived`. |
| `POST` | `/v1/internal-comment-threads/{thread_id}/posts` | Append a post | Creates Post + Mentions atomically; updates thread `post_count`, `last_post_at`; emits `internal_comment_thread.post_appended` and per-Mention `internal_comment_thread.mention_sent` webhooks; triggers Unread Marker fanout (§3.12.4). |
| `PATCH` | `/v1/internal-comment-posts/{post_id}` | Edit post (15-min window) or moderate | Rejects post-window edits with `internal_comment_post_edit_window_expired`. Moderation requires Workspace Owner / Admin. |
| `DELETE` | `/v1/internal-comment-posts/{post_id}` | Author soft-delete (window) or Admin hard-delete | Sets `deleted_placeholder = true` (window) or `deleted_at` (admin). |
| `GET` | `/v1/internal-comment-mentions?user_id=me&unread=true` | Current user's unread mentions across threads | Returns Mention rows with `read_at IS NULL`, scoped to caller. |

# 32. API {#32.-api}

### 32.5 Endpoints {#32.5-endpoints}

GET    /v1/workspaces/{workspace\_id}/internal-comment-threads          (§25.7.9; §32.10.9.H)
POST   /v1/workspaces/{workspace\_id}/internal-comment-threads          (§25.7.9; §32.10.9.H)
GET    /v1/workspaces/{workspace\_id}/internal-comment-threads/{thread\_id} (§25.7.9; §32.10.9.H)
POST   /v1/workspaces/{workspace\_id}/internal-comment-threads/{thread\_id}/posts (§25.7.9; §32.10.9.H)
PATCH  /v1/internal-comment-posts/{post\_id}                           (§25.7.9; §32.10.9.H)
DELETE /v1/internal-comment-posts/{post\_id}                           (§25.7.9; §32.10.9.H)
GET    /v1/internal-comment-mentions                                   (§25.7.9; §32.10.9.H)

Compatibility aliases remain §32.10.9.G-only and are not generated in new public API references.

#### 32.10.9.G Internal Comment alias binding {#32.10.9.g-internal-comment-alias-binding}

The canonical Internal Comments API is §25.7.9. §32.5 now lists the canonical thread / post / mention routes instead of the pre-remediation `/comments` shorthand.

| Legacy route | Canonical binding | Public reference behavior | Removal gate |
| :---- | :---- | :---- | :---- |
| `GET /v1/workspaces/{workspace_id}/comments` | `GET /v1/workspaces/{workspace_id}/internal-comment-threads` | May appear only in a deprecation alias map; response schema is §25.7.9 thread-list response with `legacy_alias=true` metadata. | v8.0.0 or later release note after 180-day customer notice. |
| `POST /v1/workspaces/{workspace_id}/comments` | `POST /v1/workspaces/{workspace_id}/internal-comment-threads` | Same request / response / error set as canonical create-thread route. | Same as above. |
| `PATCH /v1/workspaces/{workspace_id}/comments/{comment_id}` | `PATCH /v1/internal-comment-posts/{post_id}` when `comment_id` resolves to a post id; otherwise reject with `invalid_comment_id`. | No shadow thread mutation schema is permitted. | Same as above. |
| `DELETE /v1/workspaces/{workspace_id}/comments/{comment_id}` | `DELETE /v1/internal-comment-posts/{post_id}` when `comment_id` resolves to a post id; otherwise reject with `invalid_comment_id`. | No shadow thread delete schema is permitted. | Same as above. |

Alias handling MUST emit an AuditEvent with `action='internal_comment_alias_route_used'` only if that action is registered in Appendix J before implementation. New SDKs and OpenAPI clients MUST use the canonical §25.7.9 paths only.

#### 32.10.9.I Acceptance criteria {#32.10.9.i-acceptance-criteria}

5. Internal Comment compatibility aliases MUST resolve to §25.7.9 canonical schemas and MUST NOT introduce `/comments` shadow schemas in generated public clients.
9. QA MUST include at least one contract test per endpoint family in this pack plus one generated-reference test that confirms legacy Internal Comment compatibility aliases appear only as deprecated alias-map entries.

#### M.5.68 v7.2.0-REM Phase 8.1 Core API Detail P1 addition (D-V8.1-001 closure) {#m-5-68-v72rem-phase-8-1-core-api-detail-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `internal_comment_legacy_alias_no_shadow_schema` | api_contract_completeness | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/internal_comment_legacy_alias_no_shadow_schema.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §32.10.9.G alias-map boundary only; product route shims, generated SDK output, OpenAPI generation, and runtime compatibility tests remain product-pack evidence) | pr_lint | Deprecated Internal Comment compatibility aliases appear only in §32.10.9.G, resolve to §25.7.9 canonical Internal Comment schemas, and generated SDKs expose canonical `/internal-comment-*` paths only. | M02.3 |
