# MS §2.9 Frozen Baseline Snapshot

**Source:** `_versions/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md` §2.9.
**Frozen for:** §34.15 seller outcome-signal baseline coverage and validator provenance.
**Created:** 2026-06-22, Phase PXC pricing cross-check closure.
**Authority note:** This is a historical frozen snapshot only. The current Master Spec §34 remains authoritative for product behavior, pricing, entitlement enforcement, and runtime implementation.

### 2.9 Outcome Signals (Seller-Side)

Every AI Operation resolves to `accepted` or `rejected` on a capability-specific signal. Default on timeout is **rejected** — biases cost protection when signal is ambiguous.

| Capability | Accepted signal | Window |
|---|---|---|
| First-Pass RFP Draft | ≥50% of draft retained in submitted bid | 14d (or on bid submission) |
| Q&A Suggestion | Answer sent with ≤30% edit | 7d |
| KB-to-Capability Suggestion | Declaration published | 14d |
| KB Bootstrap | ≥60% of proposed entries approved | 30d |
| Ghost-RFP Ingestion | Resulting KB entries cited in a future bid | 90d |
| Firecrawl Crawl + Dedupe | New entry approved OR correct dedupe | 7d |
| KB Staleness Classifier | Flagged entry re-verified or archived | 14d |
| Seller Page Enrichment | Seller publishes generated content | 14d |
| Capability Declaration Suggest | Declaration published | 7d |
| Match Score (numeric) | EOI submitted after viewing score | 14d |
| Bid Task Assignment Suggest | Task assigned as suggested | 24h |
| Document Attach Suggest | Document attached to response | 24h |

Buyer-side outcome signals in `Sourcera_Buyer_Pricing_Strategy.md` Appendix B.
