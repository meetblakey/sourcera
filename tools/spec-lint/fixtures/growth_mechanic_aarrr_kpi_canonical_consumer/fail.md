# Sourcera Fixture

## 48.5 M1-M8 Growth Mechanics {#48.5-m1-m8-growth-mechanics}

#### AARRR Target Loop Classification + Per-Mechanic North-Star KPI Registry (V13 D-48-001 + D-48-002 remediation 2026-05-12)

| Mechanic | Description (anchor) | AARRR Target Loop | North-Star KPI | Source Field |
|---|---|---|---|---|
| **M1** Stakeholder Read-Only Invite | §48.5.1 | **Activation** | `m1_kpi` | §51 |
| **M2** Public Selection Report | §48.5.2 | **Referral** | `m2_kpi` | §51 |
| **M3** Evaluation Certificate | §48.5.3 | **Activation** | `m3_kpi` | §51 |
| **M4** Kick Off Next Evaluation | §48.5.4 | **Retention** | `m4_kpi` | §51 |
| **M5** Buyer-Pull Vendor Invite | §48.5.5 | **Acquisition** | `m5_kpi` | §51 |
| **M6** Domain Auto-Join | §48.5.6 | **Activation** | `m6_kpi` | §51 |
| **M7** Suggested Team Discovery | §48.5.7 | **Activation** | `m7_kpi` | §51 |
| **M8** Org Intelligence Value Curve | §48.5.8 | **Retention** | `m8_kpi` | §51 |
| **M9** CategoryPage | §48.6.5 | **Acquisition** | `m9_kpi` | §51 |
| **M10** GuidePage | §48.6.6 | **Acquisition** | `m10_kpi` | §51 |
| **M11** ComparisonPage | §48.6.7 | **Acquisition** | `m11_kpi` | §51 |
| **M12** MarketIntelligenceReport | §48.6.8 | **Acquisition + Retention** | `m12_kpi` | §51 |
| **M13** HeatMap | §48.6.9 | **Acquisition** | `m13_kpi` | §51 |
| **M14** Bid Success Share | §48.7.1 | **Referral** | `m14_kpi` | §51 |
| **M15** Ghost-Bid Importer | §48.7.2 | **Acquisition** | `m15_kpi` | §51 |
| **M16** Buyer Referral Credit | §48.7.3 | **Referral** | `m16_kpi_a` + `m16_kpi_b` | §51 |

### 48.5.1 M1 Stakeholder Read-Only Invite {#48.5.1-m1-stakeholder-read-only-invite}
This body forgot the registry citation.

### 48.5.2 M2 Selection Report Public Link {#48.5.2-m2-selection-report-public-link}
**Growth metadata.** `aarrr_target_loop` and `north_star_kpi` are sourced from §48.5 "AARRR Target Loop Classification + Per-Mechanic North-Star KPI Registry" row **M2**; this section MUST NOT restate the registry values inline.
Inline duplicate: `m2_kpi`.

## Appendix M {#appendix-m}

| Gate ID | Row class | Runtime status | Execution context | Assertion | Owner |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `growth_mechanic_aarrr_kpi_canonical_consumer` | content_consistency | spec_binding_pending_pack_m02_3 | post-build | M1-M17 cite registry. | M02.3 |
