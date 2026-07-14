# Phase 8.1 pass fixture

MCPSessionTokenRecord mint and revoke are internal-only security operations and are not exposed through the §32 public v1 API.

`Retry-After` is the canonical retry-delay header on every HTTP 429 response; `X-RateLimit-RetryAfter` is a compatibility augmentation.

| `buyer_free` | No general API entitlement |
| `buyer_solo` | No general API entitlement |
| `business_starter` | 10,000 when the §34.1.1 API Add-On is active | 3,000 |
| `seller_scale` | 250,000 read-only calls | Not available |
| `seller_enterprise` | Unlimited read/write calls | Not available |

### 32.6.3 HTTP Status Conventions {#32.6.3-http-status-conventions}

| 207 Multi-Status |
| 304 Not Modified |
| 410 Gone |
| 423 Locked |

`vendor_disqualification_reversal_cascade_action`

1. Every public §32 endpoint MUST have a §32.5 catalog row.

`stripe_unavailable` | Stripe times out, is unavailable, or returns a retryable 5xx
`billing.ledger.export_failed`
`billing.plan.change_request_expired`
`plan_change_ops_signoff_timeout_expired`
`status` is one of `queued`, `running`, `paused`, `ready`, `failed`, or `expired`.
A `workspace_id` outside the token's authorized console scope returns HTTP 404 `billing_ledger_workspace_not_found`.

| API rate limit class `standard_authenticated_per_org` |
| API rate limit class `public_pricing_unauth` |

#### M.5.84 v7.1.1 Phase 8.1 API Residual Contract and Runtime Evidence additions

`api_phase81_residual_contract_completeness` | spec_tree_lint | **`runtime_active`**
`api_multistatus_schema_registration` | openapi_schema_runtime_consistency | **`spec_binding_pending_pack_m02_3`**
`api_standard_retry_after_runtime_consistency` | api_middleware_runtime_consistency | **`spec_binding_pending_pack_m11_3`**
`billing_async_failure_state_runtime_consistency` | billing_runtime_property_test | **`spec_binding_pending_pack_m11_3`**
`api_rate_limit_plan_quota_runtime_consistency` | entitlement_runtime_consistency | **`spec_binding_pending_pack_m24_3`**
