# MS §2.8 Frozen Baseline Snapshot

**Source:** `_baselines/retired-sources/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md` §2.8.
**Frozen for:** §34.14 seller rate-card baseline coverage and validator provenance.
**Created:** 2026-06-22, Phase PXC pricing cross-check closure.
**Authority note:** This is a historical frozen snapshot only. The current Master Spec §34 remains authoritative for product behavior, pricing, entitlement enforcement, and runtime implementation.

### 2.8 Rate Card Summary (Seller-Side Capabilities)

Same accounting mechanic as the buyer side: `value = cost_base × 10`; `cost = cost_base × 1.05`. Derived nightly from Anthropic + Convex cost; multiplier held constant; published at `api.sourcera.com/v1/pricing`. Representative seller capabilities:

| Capability | Model | Accepted (value) | Rejected (cost) | Unit |
|---|---|---|---|---|
| First-Pass RFP Draft (per requirement) | Sonnet | $0.15 | $0.02 | 1 requirement |
| Q&A Suggestion | Sonnet | $0.50 | $0.07 | 1 suggestion |
| KB-to-Capability Suggestion (batch 100) | Haiku | $0.80 | $0.10 | 100-entry batch |
| KB Bootstrap (500 pages) | Opus | $200.00 | $26.00 | 1 bootstrap |
| Ghost-RFP Ingestion | Opus | $25.00 | $3.30 | 1 historical RFP |
| Firecrawl Crawl + Dedupe | Sonnet | $0.04 | $0.005 | 1 page processed |
| KB Staleness Classifier | Haiku | $0.02 | $0.003 | 1 entry reviewed |
| Seller Page Enrichment | Opus | $8.00 | $1.10 | 1 page |
| Capability Declaration Suggest | Sonnet | $0.30 | $0.04 | 1 declaration |
| Match Score (numeric, per-listing) | Sonnet | $0.40 | $0.05 | 1 opportunity |
| Bid Task Assignment Suggest | Haiku | $0.01 | $0.002 | 1 task |
| Document Attach Suggest | Haiku | $0.02 | $0.003 | 1 suggestion |

Full buyer-side rate card in `Sourcera_Buyer_Pricing_Strategy.md` §7 and Appendix A. Full seller-side rate card in `Sourcera_Seller_Pricing_Strategy.md` §9.
