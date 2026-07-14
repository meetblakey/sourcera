### 4.4.3 Seller Profile

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `industries` | Array[UUID] | FK -> Controlled-Vocabulary Tag (§4.5.5) with `taxonomy_dimension=industry` | Write-layer enforcement uses `consumer_requires_approved_tag`. |
| `certifications` | Array[UUID] | FK -> Controlled-Vocabulary Tag (§4.5.5) with `taxonomy_dimension=certification` | Certification badge references. |
| `verification_tier` | Enum | See Appendix J `seller_verification_tier` | Criteria and workflow canonical in §4.4.21; §26.2 is descriptive only. |
| `public_contact_email` | String | valid email | Public only when the Seller Org explicitly opts in; DSAR Pattern A applies. |

## 26.1 Seller Profile

The canonical entity schema is §4.4.3. field types, constraints, scope isolation, retention, DSAR, and residency are owned by §4.4.3 / §40.2.

| Public label | Canonical field / source | Notes |
|---|---|---|
| Organization name | Seller Profile.`vendor_name` | |
| Organization logo | Seller Profile.`logo_url` | |
| Company description | Seller Profile.`description` | |
| Website URL | Seller Profile.`website_url` | |
| Location / HQ region | Seller Profile.`headquarters_country` | |
| Founded year | Seller Profile.`founded_year` | |
| Number of employees | Seller Profile.`employee_count` | |
| Industries served | Seller Profile.`industries` -> Controlled-Vocabulary Tag (§4.5.5) | |
| Certification badges | Seller Profile.`certifications` -> Controlled-Vocabulary Tag (§4.5.5) | |
| Verification tier | Seller Profile.`verification_tier`; Appendix J `seller_verification_tier` | |
| Public contact email | Seller Profile.`public_contact_email` | |

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `seller_profile_public_field_contract_completeness` | data_model_contract | **`runtime_active`** (detector `tools/spec-lint/gates/seller_profile_public_field_contract_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | pass | M02.3 |
