# v7.1.1 Email Current-Source Verification

**Date:** 2026-07-11  
**Defects:** D-41-009 through D-41-011, D-41-013, D-41-016 through D-41-022  
**Verdict:** PARTIAL PASS — current-source documentation gaps closed; no runtime promotion.

## Conflict and resolution

The Phase 41 filing described missing email enums, glossary terms, lifecycle state, provider ingestion, localization, cross-console field carry, anti-spam references, tracking/DSAR behavior, Reply-To policy, and provider-outage handling. Current-source review found most filed absence claims stale: the canonical contracts are already present in §4.9, §6.8.4.8, §40.2, §41, §48.4, and Appendices G, I, J, and K. The remaining glossary and outage-execution binding is now explicit.

| Gap | Current authority |
|---|---|
| Enums, entity fields, lifecycle, provider ingest | §4.9; Appendix J; Appendix I |
| Catalog coverage, Reply-To, localization, field carry | §41.2; §4.9.2 |
| Provider outage handling | §41.1; §42.6; Appendix F |
| Deliverability, anti-spam, suppression | §41.1 / §41.3; §48.4 |
| Tracking, retention, DSAR, residency | §41.3.3; §6.8.4.8; §40.2; §47.4 |
| Email terminology | Appendix K |

## Recurrence guards

The live Master Spec and fixtures pass these static documentation guards:

- `email_type_catalog_coverage`
- `email_spf_dkim_dmarc_citations_resolve`
- `email_domain_entity_contract_completeness`
- `email_retention_dsar_binding`
- `email_volume_single_source`
- `loops_provider_integration_contract_completeness`
- `email_glossary_and_outage_contract`

They do not prove Loops delivery, webhook receipt, suppression enforcement, tracking erasure, or email rendering in production. Pending §M.5 runtime rows remain runtime-owned evidence.

## External dependency retained

D-41-015 remains blocked. Legal / Compliance must provide and approve the production `sourcera_can_spam_postal_address` setting before any Marketing or Lifecycle send. §41.3.2 and Appendix I fail closed if it is missing, unapproved, or malformed. The actual postal address is environment configuration, not a static corpus value.

No defect is relabelled historical without current-source evidence. No runtime row is promoted.
