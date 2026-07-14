### 48.8.13 KB Bootstrap Compensation {#48.8.13-kb-bootstrap-allowance-compensation-contract}

Eligibility covers `firecrawl_outage_degraded_kb_bootstrap`, `claude-opus-4-6`, `provider_kind = 'convex'`, and `kb_draft_entry_count` is < 10. Emit `kb_bootstrap.allowance_restored`. Manual restoration uses `POST /v1/ops/seller-orgs/{org_id}/kb-bootstrap/refund` for `ops_growth_admin` or `ops_finance_admin`.

**`kb_bootstrap_restoration_reason`**: `firecrawl_outage`, `anthropic_rate_limit`, `convex_partition`, `useful_bootstrap_floor_miss`.

| KB Bootstrap Allowance Restored | `kb_bootstrap_allowance_restored` | Allowance restored | Tier-2 retry; §48.8.13 |

| `kb_bootstrap_allowance_compensation_completeness` | content | spec_binding_pending_pack_m02_3 | pr_lint + convex unit + post-build | Local guard `tools/spec-lint/gates/kb_bootstrap_allowance_compensation_completeness.ts` and pass/fail fixtures protect the spec contract; deployed Convex, endpoint, audit, and delivery evidence remains required. | M02.3 |
