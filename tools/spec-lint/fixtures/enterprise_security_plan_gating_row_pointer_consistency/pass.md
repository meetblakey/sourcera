# Sourcera Fixture

# 33. Enterprise Security & Compliance {#33.-enterprise-security-and-compliance}

| Control | Availability | Source |
| :---- | :---- | :---- |
| Customer-managed encryption keys (CMEK) | Enterprise production scope | §47.3.1; §5.11.4; §34.1.1 / §34.1.2 Enterprise rows; Appendix M.1 |

**Anonymization / plan-gating boundary:** DSAR subject rights are universal. Any Org-admin bulk export with anonymized user identifiers is an Enterprise analytics / governance feature and must cite §5.11.4 / §34.1 before launch.

## 33.5 Compliance Frameworks {#33.5-compliance-frameworks}

| Framework | Status | Availability |
| :---- | :---- | :---- |
| **SOC 2 Type II** | Targeted within 12 months of launch | Per §34.1.1 / §34.1.2 row **SOC 2 / ISO Audit Report Distribution** and §5.11.4 |
| **ISO 27001** | Planned | Per §34.1.1 / §34.1.2 row **SOC 2 / ISO Audit Report Distribution** and §5.11.4 |
| **HIPAA** | BAA available | Per §34.1.1 / §34.1.2 row **Business Associate Agreement (BAA)** and §5.11.4 |

## 33.6 Security Controls {#33.6-security-controls}

- **IP allowlisting:** Plan authority is §34.1.1 / §34.1.2 cell **IP Allowlist / Data Residency** and §5.11.4.
- **SBOM:** Distribution authority is §34.1.1 / §34.1.2 row **SBOM Distribution** and §5.11.4.

## 33.8 Security Observability {#33.8-security-observability}

- **SIEM Integration:** Plan authority is §34.1.1 / §34.1.2 row **SIEM Log Export** and §5.11.4.

## Appendix M {#appendix-m}

| Gate ID | Row class | Runtime status | Execution context | Assertion | Owner |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `enterprise_security_plan_gating_row_pointer_consistency` | entitlement_matrix_consistency | **`runtime_active`** (promoted fixture; detector `tools/spec-lint/gates/enterprise_security_plan_gating_row_pointer_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §33 references to Enterprise-only security / compliance controls MUST cite the matching §34.1.1 / §34.1.2 row and §5.11.4 row family. | M02.3 |
