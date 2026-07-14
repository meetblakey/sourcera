### 4.4.1 Bid Workspace {#4.4.1-bid-workspace}
| Field | Type | Constraints | Notes |

### 4.4.2 Bid Response {#4.4.2-bid-response}
| Field | Type | Constraints | Notes |

### 4.4.3 Seller Profile {#4.4.3-seller-profile}
| Field | Type | Constraints | Notes |

### 4.4.5 Bid Task {#4.4.5-bid-task}
| Field | Type | Constraints | Notes |

### 4.4.6 Bid Schedule {#4.4.6-bid-schedule}
| Field | Type | Constraints | Notes |

### 4.4.19 PromotedListing {#4.4.19-promotedlisting}
`Organization.seller_plan_tier` MUST satisfy the PromotedListing eligibility contract in §34.1.2; feature-access enforcement follows §5.11. Creating a record that does not satisfy the §34.1.2 eligibility contract is rejected.

### 4.4.21 VerificationReviewRecord {#4.4.21-verificationreviewrecord}
`Organization.seller_plan_tier` MUST satisfy the Verified eligibility contract in §34.1.2. `Organization.seller_plan_tier` MUST satisfy the Certified eligibility contract in §34.1.2. A request that does not satisfy the requested-tier eligibility in §34.1.2 is rejected.

## Appendix M.5
| `seller_entity_plan_gate_and_anchor_hygiene` | spec_tree_lint | **`runtime_active`** (detector `tools/spec-lint/gates/seller_entity_plan_gate_and_anchor_hygiene.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
