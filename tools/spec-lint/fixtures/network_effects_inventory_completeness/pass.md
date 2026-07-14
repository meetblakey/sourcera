### 48.3.2 Measurable Signals {#48.3.2-measurable-signals}

| # | Effect (§48.3.1) | Signal | Definition | Source | k-Anonymity Floor (§48.4.7) |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 5 | Certificates and shares | `m2_public_link_share_rate_per_workspace` | M2 shares | §48.5.2 PublicSelectionReport | k=5 |
| 5 | Certificates and shares | `m14_bid_success_share_rate_per_winning_bid` | M14 shares | §4.4.29 BidSuccessShare | k=5 |

### 48.3.5 Seller-Side Compounding Network Effects (Inventory & Instrumentation) {#48.3.5-seller-side-compounding-network-effects}

| # | Loop Name | Mechanism | Primary §4 Entity Ref(s) | Primary Telemetry Event(s) (Appendix G) | Measurable Signal | Dashboard Tile (§48.3.3 Network Effects Dashboard) | k-Anonymity Floor (§48.4.7) | Free-Tier Contribution? |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **S1** | Inventory | mechanism | §4 | event | `s1_signal` | "S1 Inventory Velocity" tile | k=10 | YES |
| **S2** | KB | mechanism | §4 | event | `s2_signal` | "S2 KB → Match → EOI Funnel" tile | k=5 | YES |
| **S3** | Calibration | mechanism | §4 | event | `s3_signal` | "S3 Calibration Velocity" tile | k=5 | YES |
| **S4** | SEO | mechanism | §4 | event | `s4_signal` | "S4 Seller-Profile SEO Cohort" tile | k=10 | YES |
| **S5** | Ghost-Bid | mechanism | §4 | event | `s5_signal` | "S5 Ghost-Bid Import Velocity" tile | k=5 | PARTIAL |
| **S6** | Trial | mechanism | §4 | event | `s6_signal` | "S6 Pro Trial Seat Funnel" tile | k=5 | NO |
| **S7** | Template | mechanism | §4 | event | `s7_signal` | "S7 Template Publish Network Effect" tile | k=5 | YES |

### 48.3.6 Buyer-Side Compounding Network Effects (Inventory & Instrumentation) {#48.3.6-buyer-side-compounding-network-effects}

| Loop | Mechanism | Primary §4 Entities | Primary Telemetry Events | Primary Measurable Signal | Dashboard Tile (§48.3.3) | k-Anonymity Floor | Free-Tier Contribution |
|---|---|---|---|---|---|---|---|
| **B1** Seat | mechanism | §4 | event | `b1_signal` | "B1 Seat-Expansion → Workspace-Reuse" tile | k=5 | Free tier |
| **B2** SEO | mechanism | §4 | event | `b2_signal` | "B2 SEO Inbound Conversion" tile | k=10 | Free tier |
| **B3** Cert | mechanism | §4 | event | `b3_signal` | "B3 Certificate-Lift Evaluation Cycle Time" tile | k=10 | Free tier |
| **B4** Domain | mechanism | §4 | event | `b4_signal` | "B4 Intra-Org Viral" tile | k=5 | Free tier |
| **B5** Value | mechanism | §4 | event | `b5_signal` | "B5 Value-Curve → Upgrade" tile | k=5 | Free tier |
| **B6** Referral | mechanism | §4 | event | `b6_signal` | "B6 Referral Network" tile | k=5 | Scale |
| **B7** Intel | mechanism | §4 | event | `b7_signal` | "B7 Market-Intel Repeat-Visit" tile | k=10 | Free tier |

### 48.3.7 Cross-Side Network Effects (Inventory & Instrumentation) {#48.3.7-cross-side-network-effects}

| Loop | Mechanism | Telemetry Anchor Event | Cross-Side Signal | Dashboard Tile | k-Anonymity Floor |
|---|---|---|---|---|---|
| **X1** Discovery | mechanism | event | `x1_signal` | "X1 Marketplace-Inventory Discovery" tile | k=10 |
| **X2** Calibration | mechanism | event | `x2_signal` | "X2 Win/Loss-Disclosure → Match-Quality Lift" tile | k=10 |
| **X3** Intel | mechanism | event | `x3_signal` | "X3 Market-Intelligence Health" tile | k=20 |
| **X4** Bridge | mechanism | event | `x4_signal` | "X4 Cross-Console Bridge Compounding" tile | k=10 |
| **X5** Health | mechanism | event | `x5_signal` | Founders' Exec Roll-Up | k=20 |

CI gate `network_effects_inventory_completeness` (§M.5 — new) asserts §48.3.5 (S1–S7), §48.3.6 (B1–B7), §48.3.7 (X1–X5) registries are exhaustive and that the §48.3.3 Network Effects Dashboard surfaces a tile for every registry row.

#### M.5.12 V13 catalog additions {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `network_effects_inventory_completeness` | content_consistency | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/network_effects_inventory_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) | post-build | §48.3.5 (S1–S7), §48.3.6 (B1–B7), §48.3.7 (X1–X5) exhaustive; every row has a §48.3.3 dashboard tile; M2/M14 signal sources resolve to current entity anchors — closes D-48.3-001 + D-48.3-002 + D-48.3-003 | M02.3 |
