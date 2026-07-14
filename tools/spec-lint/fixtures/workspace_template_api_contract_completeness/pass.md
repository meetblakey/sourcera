### 19.6.2 API, Event, and Atomicity Binding {#19.6.2-api-event-and-atomicity-binding}

Template Library public API routes are registered in §32.5 and detailed in §32.10.3.D. §19 owns user workflow and UI semantics only. All state-mutating §32.10.3.D endpoints require `Idempotency-Key`. Same-key / different-body replay returns HTTP 409 `idempotency_key_request_mismatch`.

## 32.5 Endpoints {#32.5-endpoints}

Families with pre-existing detail remain single-sourced in their cited sections: Template Library (§32.10.3.D).

GET    /v1/orgs/{org\_id}/templates

POST   /v1/orgs/{org\_id}/templates

GET    /v1/orgs/{org\_id}/templates/{template\_id}

PATCH  /v1/orgs/{org\_id}/templates/{template\_id}

DELETE /v1/orgs/{org\_id}/templates/{template\_id}

POST   /v1/orgs/{org\_id}/templates/{template\_id}/apply-update

POST   /v1/workspaces/{workspace\_id}/save-as-template

POST   /v1/workspaces/from-template

POST   /v1/orgs/{org\_id}/templates/{template\_id}/suggest-improvement

### 32.10.3.D Template Library Endpoints {#32.10.3.d-template-library-endpoints}

| Method | Path | Auth Scope | RBAC / plan gate | Rate-Limit Class | Idempotency |
|---|---|---|---|---|---|
| GET | `/v1/orgs/{org_id}/templates` | `read:workspaces` | §5.11 Template Browse / View rows | `workspace_read` | N/A; cursor pagination |
| POST | `/v1/orgs/{org_id}/templates` | `write:workspaces` | §5.11 author row; §34.1.1 Custom Templates | `data_mutation` | REQUIRED |
| GET | `/v1/orgs/{org_id}/templates/{template_id}` | `read:workspaces` | §5.11 Template Detail / Preview rows | `workspace_read` | N/A |
| PATCH | `/v1/orgs/{org_id}/templates/{template_id}` | `write:workspaces` | §5.11 metadata-edit row; §34.1.1 Custom Templates for authoring | `data_mutation` | REQUIRED |
| DELETE | `/v1/orgs/{org_id}/templates/{template_id}` | `write:workspaces` | §5.11 delete row | `data_mutation` | REQUIRED |
| POST | `/v1/orgs/{org_id}/templates/{template_id}/apply-update` | `write:workspaces` | §5.11 Apply Sourcera Template Update row; §34.1.1 Custom Templates for update mutations | `data_mutation` | REQUIRED |
| POST | `/v1/workspaces/{workspace_id}/save-as-template` | `write:workspaces` | §5.11 Save Workspace as Custom Template row; §34.1.1 Custom Templates | `data_mutation` | REQUIRED |
| POST | `/v1/workspaces/from-template` | `write:workspaces` | §5.11 Apply Template to New Workspace row; workspace-create role gate | `data_mutation` | REQUIRED |
| POST | `/v1/orgs/{org_id}/templates/{template_id}/suggest-improvement` | `write:workspaces` | §5.11 Suggest Improvement row | `data_mutation` | REQUIRED |

**Console firewall.**

**List query parameters.**

| Parameter | Type | Default | Constraints | Notes |
|---|---|---|---|---|
| `kind` | Enum | null | Appendix J `workspace_template_kind` | Optional filter for Use Case Bundle / RFI / RFP templates. |
| `limit` | Integer | 50 | 1-250 | §32.3 cursor page size. |
| `cursor` | String | null | Opaque | §32.3 cursor. |

**Create / metadata request.**

```json
{ "kind": "use_case_bundle" }
```

**Apply update request.**

**Save as Template request.**

```json
{ "kind": "rfp" }
```

**Workspace from Template request.**

**Suggest Improvement request.**

**Response object fields.**

| Object | Fields |
|---|---|
| WorkspaceTemplate | `template_id`, `org_id`, `source`, `template_library_entry_id`, `current_version_id`, `name`, `description_markdown`, `kind`, `category` |

List responses use §32.3 cursor pagination with `limit` default 50 and max 250.

**Endpoint-specific side effects.**

**Errors.**

`template_not_found` `template_authoring_plan_required` `template_mutation_role_insufficient` `idempotency_key_request_mismatch` `template_update_already_applied` `template_apply_update_partial_failure_rolled_back`

**Example.**

Idempotency-Key

**Acceptance criteria.**

| `workspace_template_api_contract_completeness` | api_contract_completeness | **`runtime_active`** (promoted 2026-07-08; detector `tools/spec-lint/gates/workspace_template_api_contract_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | x | M02.3 |
