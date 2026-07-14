# Conversion Funnel Registry Fixture

### 51.0.3 Conversion Funnel Registry per Growth Path {#51.0.3-conversion-funnel-registry-per-growth-path}

The conversion funnel registry is a list of useful funnels.

| Funnel ID | Stages (event names) | Customer-Visible Surface | §42 Alert |
|---|---|---|---|
| `buyer_conversion_funnel` | `user_signed_in` → `workspace_created` | Local dashboard copy | P3 |
| `buyer_referral_funnel` | `m16_referral_created` → `m16_referral_credit_redeemed` | Local referral panel | P3 |

### 51.3.3 Panels & KPIs {#51.3.3-panels-kpis}

Dashboards define their own funnel stages.

### 51.5.6 Acceptance Criteria — §51.5 {#51.5.6-acceptance-criteria-51-5}

Seller dashboards define their own funnel stages.

# Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

`user_signed_in`, `workspace_created`.

# Appendix J

**`conversion_funnel_id_kind`** (V13): `buyer_conversion_funnel`.

#### M.5.12 V13 catalog additions (PLG / Growth / Analytics / Hero Moment) {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `conversion_funnel_registry_canonical_consumer` | content_consistency | spec_binding_pending_pack_m02_3 | post-build | §51.0.3 closed registry. | M02.3 |
