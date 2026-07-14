# Sourcera Fixture

# 33. Enterprise Security & Compliance {#33.-enterprise-security-and-compliance}

| Control | Availability | Source |
| :---- | :---- | :---- |
| Customer-managed encryption keys (CMEK) | Enterprise customers | §47.3.1 |

**Anonymization / plan-gating boundary:** Any Org-admin bulk export is an Enterprise analytics / governance feature and must cite §34.1 before launch.

## 33.5 Compliance Frameworks {#33.5-compliance-frameworks}

| Framework | Status | Availability |
| :---- | :---- | :---- |
| **SOC 2 Type II** | Targeted within 12 months of launch | Enterprise under NDA |
| **ISO 27001** | Planned | Enterprise-only |
| **HIPAA** | BAA available | Enterprise on request |

## 33.6 Security Controls {#33.6-security-controls}

- **IP allowlisting:** Enterprise-only.
- **SBOM:** Enterprise under NDA.

## 33.8 Security Observability {#33.8-security-observability}

- **SIEM Integration:** Enterprise on request.

## Appendix M {#appendix-m}

| Gate ID | Row class | Runtime status | Execution context | Assertion | Owner |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `enterprise_security_plan_gating_row_pointer_consistency` | entitlement_matrix_consistency | spec_binding_pending_pack_m02_3 | pr_lint | §33 references to Enterprise-only security / compliance controls MUST cite source rows. | M02.3 |
