### 4.4.4 Capability Declaration

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `capability_type` | Enum | Appendix J `capability_declaration_type`: `taxonomy_declaration`, `narrative_only` | |
| `canonical_capability_id` | UUID | §4.8.2 CapabilityRegistryEntry; required when `capability_type = taxonomy_declaration`; forbidden when `capability_type = narrative_only` | |

## 26.3 Capability Declarations

Sellers declare capabilities through the canonical Capability Declaration entity (§4.4.4). §26.3 does not own a separate schema or lifecycle enum. The four public category labels map to Appendix J `capability_categories`; the structured registry binding is `canonical_capability_id` -> CapabilityRegistryEntry (§4.8.2 / §21.4). KB-backed suggestions and evidence-overlap rules are canonical in §22.14.3.

| Surface concept | Canonical source | Implementation rule |
|---|---|---|
| Declaration fields | §4.4.4 field table | UI forms serialize only §4.4.4 fields; no `verification_status` column exists. |
| State / badge text | Appendix J `capability_declaration_state`; §4.4.4 state machine | |
| Capability registry binding | §21.4 / §4.8.2 `CapabilityRegistryEntry` | |
| Marketplace visibility | §4.4.4 `capability_type`, `state`, and Match-Score eligibility | |

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `capability_declaration_section_26_no_shadow_schema` | data_model_contract | **`runtime_active`** (detector `tools/spec-lint/gates/capability_declaration_section_26_no_shadow_schema.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | pass | M02.3 |
