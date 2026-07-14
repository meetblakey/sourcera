## 48.5 M1-M8 Growth Mechanics {#48.5-m1-m8-growth-mechanics}

#### Mechanic-Level Rate Limits — Fill Coverage

| Mechanic | Mechanic-Level Rate Limit | Enforcement Surface | Error Code |
|---|---|---|---|
| **M1** Stakeholder Read-Only Invite | 10 invites / inviter / 24h | POST validator | `m1_inviter_rate_limit_exceeded` (HTTP 429) |
| **M2** Public Selection Report | 5 failed password attempts / IP-hash / 10 min | public render | `m2_password_brute_force_throttled` (HTTP 429) |
| **M3** Evaluation Certificate | 100 distinct certificate verification URLs / IP / 24h | public verification | `m3_certificate_enumeration_throttled` (HTTP 429) |
| **M4** Kick Off Next Evaluation | 3 conversion attempts / source Workspace / prompted user / 24h | POST convert | `m4_conversion_velocity_exceeded` (HTTP 429) |
| **M5** Buyer-Pull Vendor Invite | 20 invites / user / 30d | Target Account create | `growth_loop_l1_throttle_exhausted` (HTTP 429) |
| **M6** Domain Auto-Join | 1 claim/Org/24h | POST claim | `m6_domain_claim_velocity_exceeded` (HTTP 429) |
| **M7** Suggested Team Discovery | 20 card-fetches/user/h | GET discovery | `m7_card_fetch_rate_exceeded` (HTTP 429) |
| **M8** Org Intelligence Value Curve | 10 Ops force-recompute calls / Org / h | POST recompute | `m8_recompute_rate_limit_exceeded` (HTTP 429) |
| **M9** CategoryPage | 1 force-publish/category/24h | publish | `m9_category_publish_velocity_exceeded` (HTTP 429) |
| **M10** GuidePage | 1 force-publish/guide/24h | publish | `m10_guide_publish_velocity_exceeded` (HTTP 429) |
| **M11** ComparisonPage | 1 force-publish/comparison/24h | publish | `m11_comparison_publish_velocity_exceeded` (HTTP 429) |
| **M12** MarketIntelligenceReport | 1 force-generation/category/24h | regenerate | `m12_report_regeneration_velocity_exceeded` (HTTP 429) |
| **M13** HeatMap | 1 force-recompute/heatmap/24h | recompute | `m13_heatmap_recompute_velocity_exceeded` (HTTP 429) |
| **M14** Bid Success Share | Per-Seller-Org cap from §34.1.2 row **Bid Success Shares (M14)** | create/publish | `m14_bid_success_share_velocity_exceeded` (HTTP 429) |
| **M15** Ghost-Bid Importer | 5 imports / Seller Org / 24h | create | `m15_ghost_bid_import_velocity_exceeded` (HTTP 429) |
| **M16** Buyer Referral Credit | ≥ 10 referrals / referrer Org / 7d triggers throttle | referral create | `m16_velocity_exceeded` (HTTP 429) |
| **M17** Buyer-Funded Pro Trial Seat | one trial per buyer-vendor pair per 365d | grant create | `trial_seat_pool_exhausted` (HTTP 403) |

### 48.5.4 M4 "Kick Off Next Evaluation" on Close {#48.5.4-m4-kick-off-next-evaluation-on-close}

#### Anti-Abuse Controls

6. **Conversion velocity guard.** POST convert is limited to 3 attempts per `(source_workspace_id, prompted_user_id)` in any rolling 24h window. The 4th attempt returns HTTP 429 `m4_conversion_velocity_exceeded` with `Retry-After`.

#### Acceptance Criteria

7. M4 conversion attempts MUST enforce the 3 attempts / `(source_workspace_id, prompted_user_id)` / 24h velocity guard atomically.

## Appendix I

| Error Code | HTTP | Endpoint | Notes | Localization Key |
|---|---|---|---|---|
| `m4_conversion_velocity_exceeded` | 429 | M4 POST convert | More than 3 attempts in 24h. | `error.growth.m4_conversion_velocity_exceeded` |

## Appendix M

| Gate ID | Row class | Runtime status | Execution context | Assertion | Pack |
|---|---|---|---|---|---|
| `growth_mechanic_rate_limit_coverage` | content_consistency | **`runtime_active`** (promoted fixture; detector `tools/spec-lint/gates/growth_mechanic_rate_limit_coverage.ts`; verified PASS on live Master Spec and pass/fail fixtures) | post-build | Every M1-M17 mechanic carries a documented mechanic-level rate limit. | M02.3 |
