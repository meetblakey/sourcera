### 4.4.9 SellerSoftware

Resolver modes include suppressed_placeholder and archived_gone.

### 4.4.10 SellerOrgPage

| From | To | Trigger | Conditions | Notes |
|---|---|---|---|---|
| `published` | `suppressed_by_opt_out` | opt-out | | Public URL returns a "Vendor opted out" stub. |

### 4.5.6 Vendor Opt-Out Record

| Consumer | Redaction Behavior |
|---|---|
| SellerOrgPage (§4.4.10), SoftwarePage (§4.4.11) | HTTP 200 placeholder body, `X-Robots-Tag: noindex`, Schema.org omitted, sitemap entry removed. HTTP 410 is reserved for `archived` / hard-purged routes per §26.9.5. |

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `opt_out_http_response_single_source` | marketplace_redaction_invariant | **`runtime_active`** (detector `tools/spec-lint/gates/opt_out_http_response_single_source.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | pass | M02.3 |
