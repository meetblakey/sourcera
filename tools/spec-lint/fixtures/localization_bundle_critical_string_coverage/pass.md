### 37.2.1 Localization Key Manifest {#37.2.1-localization-key-manifest}

Translated strings live in active `LocalizationBundle` rows (§47.3.1.G). RTL test fixtures MUST prove `useDirectionality()` applies `dir`, icon mirroring, number alignment, and CSS logical properties per §38.11.

### 47.3.1 Full-Scope Capability Contracts {#47.3.1-full-scope-capability-contracts}

#### 47.3.1.G LocalizationBundle {#47.3.1.g-localizationbundle}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `locale` | BCP-47 enum (Appendix J `supported_ui_locale`) | Required | Production launch set in §37.2 |
| `status` | Enum (Appendix J `localization_bundle_status`) | Required | `draft`, `qa`, `active`, `retired` |
| `coverage_percent` | Decimal | 0-100 | Customer-facing string coverage |
| `critical_string_coverage_percent` | Decimal | 0-100 | Billing, security, legal, error messages |
| `rtl` | Boolean | Required | True for `ar-SA`, `he-IL` |

**Release rule.** `active` requires `critical_string_coverage_percent=100`, `coverage_percent >= 99.5`, ICU plural fixture pass, RTL mirror fixture pass where `rtl=true`, and Appendix I localization keys present for all active error codes.

### 47.3.2 APIs, Events, Errors, and Gates {#47.3.2-apis-events-errors-and-gates}

| Surface | Required registrations |
|---|---|
| i18n | Appendix I localization keys for every active error; Appendix J `supported_ui_locale`; §M.5: `localization_bundle_critical_string_coverage`. |

### 47.3.3 Acceptance Criteria {#47.3.3-production-capability-acceptance-criteria}

8. The supported UI locale set in §37.2 MUST have active LocalizationBundle rows with critical-string coverage at 100%.

## Appendix I: API Error Code Catalog {#appendix-i-api-error-code-catalog}

Every Appendix I row carries an implicit `localization_key` of the form `error.<scope>.<code>`.

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

#### `supported_ui_locale`

`en-US`, `en-GB`, `es-ES`, `fr-FR`, `de-DE`, `ja-JP`, `ar-SA`, `he-IL`

#### `localization_bundle_status`

`draft`, `qa`, `active`, `retired`

#### M.5.69 v7.1.1 Full-Scope Capability Remediation addition (2026-07-07) {#m-5-69-v711-full-scope-capability-remediation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `localization_bundle_critical_string_coverage` | i18n_release_gate | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/localization_bundle_critical_string_coverage.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §47.3 LocalizationBundle critical-string coverage contract only; translation files, ICU plural fixture execution, RTL mirror execution, and release localization QA remain product-pack evidence) | pr_lint | Appendix J `supported_ui_locale` / `localization_bundle_status` rows registered; 100% critical-string coverage and >=99.5% customer-facing coverage | M02.3 |
