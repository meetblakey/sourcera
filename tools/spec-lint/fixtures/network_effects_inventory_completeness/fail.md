### 48.3.2 Measurable Signals {#48.3.2-measurable-signals}

| # | Effect (§48.3.1) | Signal | Definition | Source | k-Anonymity Floor (§48.4.7) |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 5 | Certificates and shares | `m2_public_link_share_rate_per_workspace` | M2 shares | M2 entity (registered placeholder) | k=5 |
| 5 | Certificates and shares | `m14_bid_success_share_rate_per_winning_bid` | M14 shares | M14 entity (registered placeholder) | k=5 |

### 48.3.5 Seller-Side Compounding Network Effects (Inventory & Instrumentation) {#48.3.5-seller-side-compounding-network-effects}

| # | Loop Name | Mechanism | Primary §4 Entity Ref(s) | Primary Telemetry Event(s) (Appendix G) | Measurable Signal | Dashboard Tile (§48.3.3 Network Effects Dashboard) | k-Anonymity Floor (§48.4.7) | Free-Tier Contribution? |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **S1** | Inventory | mechanism | §4 | event | `s1_signal` | "S1 Inventory Velocity" tile | k=10 | YES |
| **S2** | KB | mechanism | §4 | event | `s2_signal` | "S2 KB → Match → EOI Funnel" tile | k=5 | YES |
| **S3** | Calibration | mechanism | §4 | event | -- | -- | k=5 | YES |

### 48.3.6 Buyer-Side Compounding Network Effects (Inventory & Instrumentation) {#48.3.6-buyer-side-compounding-network-effects}

| Loop | Mechanism | Primary §4 Entities | Primary Telemetry Events | Primary Measurable Signal | Dashboard Tile (§48.3.3) | k-Anonymity Floor | Free-Tier Contribution |
|---|---|---|---|---|---|---|---|
| **B1** Seat | mechanism | §4 | event | `b1_signal` | "B1 Seat-Expansion → Workspace-Reuse" tile | k=5 | Free tier |
| **B2** SEO | mechanism | §4 | event | `b2_signal` | "B2 SEO Inbound Conversion" tile | k=10 | Free tier |
| **B2** Duplicate | mechanism | §4 | event | `b2_signal` | "B2 Duplicate" tile | k=10 | Free tier |
| **B9** Unknown | mechanism | §4 | event | `b9_signal` | "B9 Unknown" tile | k=10 | Free tier |

### 48.3.7 Cross-Side Network Effects (Inventory & Instrumentation) {#48.3.7-cross-side-network-effects}

| Loop | Mechanism | Telemetry Anchor Event | Cross-Side Signal | Dashboard Tile | k-Anonymity Floor |
|---|---|---|---|---|---|
| **X1** Discovery | mechanism | event | `x1_signal` | "X1 Marketplace-Inventory Discovery" tile | k=10 |

CI gate `network_effects_inventory_completeness` (§M.5 — new) has weak coverage.

#### M.5.12 V13 catalog additions {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `network_effects_inventory_completeness` | content_consistency | spec_binding_pending_pack_m02_3 | post-build | Weak network effects inventory. | M02.3 |
