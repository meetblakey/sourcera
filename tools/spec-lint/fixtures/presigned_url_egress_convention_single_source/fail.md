# Sourcera Fixture

# 33. Enterprise Security & Compliance {#33.-enterprise-security-and-compliance}

## 33.1 Data Security {#33.1-data-security}

### 33.1.2 Presigned URL Egress Binding {#33.1.2-presigned-url-egress-binding}

Presigned URL rules live near endpoint acceptance criteria.

## 32.9 KB Export Endpoint {#32.9-kb-export-endpoint}

- `download_url` is a presigned URL with a 15-minute TTL and IP-bound delivery per §33.9.

## Appendix M {#appendix-m}

| Gate ID | Row class | Runtime status | Execution context | Assertion | Owner |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `presigned_url_egress_convention_single_source` | numerical_singleton_invariant | spec_binding_pending_pack_m02_3 | pr_lint | Presigned-download TTL and single-IP binding references MUST cite §33.1.2. | M02.3 |
