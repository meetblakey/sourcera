# MS §2.11 Frozen Baseline Snapshot

**Source:** `_versions/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md` §2.11.
**Frozen for:** §34.17 pricing-engineering baseline coverage and deploy-gate `pricing_eng_ms_baseline_coverage`.
**Created:** 2026-06-22, Phase PXC pricing cross-check closure.
**Authority note:** This is a historical frozen snapshot only. The current Master Spec §34 remains authoritative for product behavior, pricing, entitlement enforcement, and runtime implementation.

### 2.11 Pricing Engineering Requirements

The platform must ship the following to run the model:

1. AI Wallet service (Org-scoped, pooled across consoles)
2. Outcome Resolver with per-capability signal contracts
3. Nightly `cost_base` recalculation job
4. Spend cap enforcement (hard block)
5. Budget notifications at 50 / 80 / 100%
6. Usage Dashboard (per-capability spend, acceptance rate, top consumers, trend)
7. Payment gating on Opus-tier ops
8. Downgrade-safe 90-day read-only data preservation
9. Audit log of billing events
10. Cross-console plan-assignment model
11. Pro Trial Seat allocation pool and 30-day auto-downgrade (M17)
12. Public rate card at `api.sourcera.com/v1/pricing`
13. Magic-link SSO orchestrator that starts KB Bootstrap inside the SSO redirect latency (seller onboarding; see §6.28.2)
14. Inline-citation UI, KB-gap detector, stake-reveal screen, outcome debrief surface, and contextual upgrade CTAs with lossless carry-over
