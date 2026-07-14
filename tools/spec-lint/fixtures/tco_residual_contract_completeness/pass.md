{#15.2-tco-use-cases-and-pricing-requirements}
{#15.5-tco-modeling-and-editing}
| **TCO recalculation - post-configuration change** | p95 < 2s for a TCO Model containing up to 100 vendors and up to 100 active Pricing Requirements per vendor.
| `version` | Integer | Required; starts at 1; increments atomically on each mutation | TCO Model optimistic lock |
| `version` | Integer | Required; starts at 1; increments atomically on each mutation | TCO Configuration optimistic lock |
### 15.6.3 Mobile Behavior
Open on desktop to configure TCO
`flat` and `one_time`
`tiered`, `percentage_of_license`, `estimate_range`, and `discount`
### 15.6.4 Selection Report Coupling
§34.2.5
`tco_appendix`
Refresh and merge
**Total Cost of Ownership (TCO).**
**Pricing Requirement.**
**TCO Use Case.**
**Pricing Structure.**
**Estimate Range.**
**Percentage of License.**
**Discount (pricing structure).**
**`tco_value_weight`.**
**`tco_percentile`.**
| TCO Modeling | §15.2, §15.5, §4.3.28 (`TCOModel` entity) |
| Pricing Requirement Authoring | §15.2, §4.3.28.1 |
| TCO Configuration | §15.5, §4.3.28.2 |
### TCO Configuration (Section 15\)
