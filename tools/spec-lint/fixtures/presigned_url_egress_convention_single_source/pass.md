# Sourcera Fixture

# 33. Enterprise Security & Compliance {#33.-enterprise-security-and-compliance}

## 33.1 Data Security {#33.1-data-security}

### 33.1.2 Presigned URL Egress Binding {#33.1.2-presigned-url-egress-binding}

§33.1.2 is the single authoritative home for the presigned-download URL TTL and requester-IP binding convention.

| Control | Contract | Notes |
| :---- | :---- | :---- |
| URL TTL | 15 minutes from mint time | Issuing endpoints may expose shorter TTLs only through a stricter named row. |
| Requester binding | URL is bound to a one-way hash of the requester IP address at mint time; fetch from any other IP fails at the storage edge | Raw IP is not persisted outside edge logs. |
| Residency binding | URL can resolve only against the artifact's residency partition; cross-region redirect is forbidden | Applies to export artifacts. |
| Re-mint authority | The issuing endpoint owns re-mint count, recovery behavior, and polling payload flags; §33.1.2 owns only TTL, IP binding, residency binding, and edge observability | Endpoint-local sections cite this row. |

Any Master Spec citation for presigned-download TTL or single-IP binding MUST cite §33.1.2, not §33.9.

## 32.9 KB Export Endpoint {#32.9-kb-export-endpoint}

- `download_url` is a presigned URL with a 15-minute TTL and IP-bound delivery per §33.1.2.

## Appendix M {#appendix-m}

| Gate ID | Row class | Runtime status | Execution context | Assertion | Owner |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `presigned_url_egress_convention_single_source` | numerical_singleton_invariant | **`runtime_active`** (promoted fixture; detector `tools/spec-lint/gates/presigned_url_egress_convention_single_source.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Presigned-download TTL and single-IP binding references MUST cite §33.1.2. | M02.3 |
